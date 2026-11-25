import { PERSONA_CONTENTS } from '../data/seeds';
import type {
  ContextSignal,
  ContextState,
  LeadOriginPreset,
  PersonaId,
  PersonaScores,
} from '../types/legal';
import {
  loadPersistedSession,
  persistSessionLocally,
  syncTelemetrySession,
} from './offlineStore';

const COOKIE_NAME = 'adv_autoseller_ctx';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const CONFIDENCE_SWITCH_THRESHOLD = 42;

const SPECIFIC_PERSONAS: PersonaId[] = [
  'imobiliario',
  'familia',
  'trabalhista',
  'previdenciario',
  'consumidor',
];

function createEmptyScores(defaultArea: PersonaId = 'imobiliario'): PersonaScores {
  return {
    geral: defaultArea === 'geral' ? 35 : 5,
    imobiliario: defaultArea === 'imobiliario' ? 35 : 0,
    familia: defaultArea === 'familia' ? 35 : 0,
    trabalhista: defaultArea === 'trabalhista' ? 35 : 0,
    previdenciario: defaultArea === 'previdenciario' ? 35 : 0,
    consumidor: defaultArea === 'consumidor' ? 35 : 0,
  };
}

function generateSessionId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `sess_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function getAccessPeriodContext(): string {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  if (day === 0 || day === 6) return 'Plantão de Fim de Semana';
  if (hour >= 6 && hour < 12) return 'Atendimento Matutino';
  if (hour >= 12 && hour < 18) return 'Expediente Comercial';
  return 'Plantão Noturno';
}

function readContextCookie(): {
  sessionId?: string;
  activePersona?: PersonaId;
  scores?: Partial<PersonaScores>;
} | null {
  if (typeof document === 'undefined') return null;
  const entries = document.cookie.split(';').map((item) => item.trim());
  const match = entries.find((entry) => entry.startsWith(`${COOKIE_NAME}=`));
  if (!match) return null;
  try {
    const encoded = match.slice(COOKIE_NAME.length + 1);
    return JSON.parse(decodeURIComponent(encoded)) as {
      sessionId?: string;
      activePersona?: PersonaId;
      scores?: Partial<PersonaScores>;
    };
  } catch {
    return null;
  }
}

function writeContextCookie(
  state: Pick<ContextState, 'sessionId' | 'activePersona' | 'scores'>
): void {
  if (typeof document === 'undefined') return;
  try {
    const compact = encodeURIComponent(
      JSON.stringify({
        sessionId: state.sessionId,
        activePersona: state.activePersona,
        scores: state.scores,
      })
    );
    document.cookie = `${COOKIE_NAME}=${compact}; max-age=${COOKIE_MAX_AGE_SECONDS}; path=/; SameSite=Lax`;
  } catch {
    // Ignore cookie errors in sandboxed iframes
  }
}

function scoreKeywords(rawInput: string, weightPerHit: number): Partial<PersonaScores> {
  const normalized = normalizeText(rawInput);
  if (!normalized) return {};

  const delta: Partial<PersonaScores> = {};
  for (const personaId of SPECIFIC_PERSONAS) {
    const keywords = PERSONA_CONTENTS[personaId].keywords;
    let hits = 0;
    for (const kw of keywords) {
      if (normalized.includes(kw)) {
        hits += 1;
      }
    }
    if (hits > 0) {
      delta[personaId] = (delta[personaId] ?? 0) + hits * weightPerHit;
    }
  }
  return delta;
}

function resolveLeader(
  scores: PersonaScores,
  fallbackPersona: PersonaId
): { persona: PersonaId; confidence: number } {
  let bestPersona: PersonaId = fallbackPersona;
  let bestScore = scores[fallbackPersona] ?? 0;

  for (const id of SPECIFIC_PERSONAS) {
    if (scores[id] > bestScore) {
      bestScore = scores[id];
      bestPersona = id;
    }
  }

  const total = SPECIFIC_PERSONAS.reduce((acc, id) => acc + scores[id], 0) + scores.geral;
  if (total <= 0) {
    return { persona: fallbackPersona, confidence: 0.72 };
  }

  const ratio = Math.min(0.99, Math.max(0.68, bestScore / Math.max(total * 0.85, bestScore + 12)));
  return { persona: bestPersona, confidence: Number(ratio.toFixed(2)) };
}

type StateListener = (state: ContextState) => void;

/**
 * PredictiveIntentEngine ("Estilo TikTok" — Zero Formulário / Zero Input):
 * Captures URL/referrer/time-of-day/cookie entry signals + passive scroll-stop dwell,
 * paragraph reading duration, hover/touch micro-interactions, and text selection to adapt
 * headlines, precedents, diagnostics, and WhatsApp CTAs silently in real time.
 */
export class PredictiveIntentEngine {
  private state: ContextState;
  private listeners = new Set<StateListener>();
  private cleanupFns: Array<() => void> = [];
  private scrollStopTimer: number | null = null;
  private lastSelectionText = '';

  constructor(defaultPrimaryArea: PersonaId = 'imobiliario') {
    const initialArea = defaultPrimaryArea === 'geral' ? 'imobiliario' : defaultPrimaryArea;
    this.state = {
      sessionId: 'init',
      activePersona: initialArea,
      scores: createEmptyScores(initialArea),
      confidence: 0.78,
      originSummary: `Acesso Direto • ${getAccessPeriodContext()}`,
      accessPeriod: getAccessPeriodContext(),
      lastSignal: null,
      signals: [],
      isReturningVisitor: false,
    };
  }

  public getState(): ContextState {
    return this.state;
  }

  public subscribe(listener: StateListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(next: ContextState, telemetryMeta?: {
    utmTerm?: string;
    utmSource?: string;
    utmCampaign?: string;
    referrer?: string;
  }): void {
    this.state = next;
    for (const listener of this.listeners) {
      listener(next);
    }

    writeContextCookie(next);
    void persistSessionLocally({
      sessionId: next.sessionId,
      activePersona: next.activePersona,
      scores: next.scores,
      signals: next.signals,
      updatedAt: Date.now(),
    });
    void syncTelemetrySession({
      sessionId: next.sessionId,
      inferredPersona: next.activePersona,
      scores: next.scores,
      lastSignal: next.lastSignal,
      ...telemetryMeta,
    });
  }

  /**
   * Layer 1 & 2: Reads URL parameters (utm_term, utm_campaign, utm_source, q, tema, area),
   * document.referrer, access time-of-day, and persistent cookie/localStorage/IndexedDB history.
   */
  public async bootstrap(defaultPrimaryArea: PersonaId = 'imobiliario'): Promise<ContextState> {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const utmTerm = params.get('utm_term') ?? '';
    const utmCampaign = params.get('utm_campaign') ?? '';
    const utmSource = params.get('utm_source') ?? '';
    const queryQ = params.get('q') ?? '';
    const temaParam = params.get('tema') ?? '';
    const areaParam = params.get('area') ?? '';
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const accessPeriod = getAccessPeriodContext();

    const cookieCtx = readContextCookie();
    const localCtx = await loadPersistedSession();

    const sessionId = cookieCtx?.sessionId || localCtx?.sessionId || generateSessionId();
    const isReturningVisitor = Boolean(cookieCtx?.sessionId || localCtx?.sessionId);

    const fallbackArea: PersonaId =
      defaultPrimaryArea === 'geral' ? 'imobiliario' : defaultPrimaryArea;

    const scores: PersonaScores = {
      ...createEmptyScores(fallbackArea),
      ...(localCtx?.scores ?? {}),
      ...(cookieCtx?.scores ?? {}),
    };

    const signals: ContextSignal[] = localCtx?.signals ? [...localCtx.signals].slice(-12) : [];
    let lastSignal: ContextSignal | null = null;
    let originSummary = `Acesso Direto • ${accessPeriod}`;
    let forcedWinner: PersonaId | null = null;

    // 1A: Explicit ?area= or ?tema=
    const explicitArea = normalizeText(areaParam || temaParam) as PersonaId;
    if (explicitArea && SPECIFIC_PERSONAS.includes(explicitArea)) {
      forcedWinner = explicitArea;
      scores[explicitArea] = Math.max(scores[explicitArea], 90);
      lastSignal = {
        source: 'url',
        detail: `Parâmetro direto (${areaParam ? `?area=${areaParam}` : `?tema=${temaParam}`})`,
        personaId: explicitArea,
        weight: 90,
        timestamp: Date.now(),
      };
      signals.push(lastSignal);
      originSummary = `Link Direto • ${PERSONA_CONTENTS[explicitArea].areaLabel}`;
    }

    // 1B: URL search/UTM signals (utm_term, utm_campaign, utm_source, q, tema)
    const combinedUrlQuery = `${utmTerm} ${utmCampaign} ${queryQ} ${temaParam}`.trim();
    if (combinedUrlQuery) {
      const delta = scoreKeywords(combinedUrlQuery, 45);
      let topArea: PersonaId | null = null;
      let topVal = 0;

      for (const key of SPECIFIC_PERSONAS) {
        const val = delta[key] ?? 0;
        if (val > 0) {
          scores[key] += val;
          if (val > topVal) {
            topVal = val;
            topArea = key;
          }
        }
      }

      if (topArea) {
        forcedWinner = topArea;
        scores[topArea] = Math.max(scores[topArea], 88);
        const readableQuery = (utmTerm || queryQ || temaParam || utmCampaign).replace(/[-_+]/g, ' ');
        lastSignal = {
          source: 'url',
          detail: `Sinal de entrada: "${readableQuery}"`,
          personaId: topArea,
          weight: topVal,
          timestamp: Date.now(),
        };
        signals.push(lastSignal);
        originSummary = utmSource
          ? `${utmSource.charAt(0).toUpperCase() + utmSource.slice(1)}: "${readableQuery}"`
          : `Busca: "${readableQuery}"`;
      }
    }

    // 1C: Referrer signal
    if (referrer) {
      const refDelta = scoreKeywords(referrer, 32);
      for (const key of SPECIFIC_PERSONAS) {
        const val = refDelta[key] ?? 0;
        if (val > 0) {
          scores[key] += val;
          if (!forcedWinner) forcedWinner = key;
          lastSignal = {
            source: 'referrer',
            detail: `Referrer externo identificado`,
            personaId: key,
            weight: val,
            timestamp: Date.now(),
          };
          signals.push(lastSignal);
          originSummary = 'Pesquisa Orgânica Externa';
        }
      }
    }

    // 2: Returning visitor memory (cookie / IndexedDB)
    if (!forcedWinner && isReturningVisitor) {
      const remembered = cookieCtx?.activePersona || localCtx?.activePersona;
      if (remembered && SPECIFIC_PERSONAS.includes(remembered)) {
        forcedWinner = remembered;
        originSummary = `Sessão Anterior Preservada • ${accessPeriod}`;
        lastSignal = {
          source: 'cookie',
          detail: `Retorno detectado em ${PERSONA_CONTENTS[remembered].areaLabel}`,
          personaId: remembered,
          weight: 30,
          timestamp: Date.now(),
        };
      }
    }

    const resolved = forcedWinner
      ? { persona: forcedWinner, confidence: Math.max(0.86, resolveLeader(scores, forcedWinner).confidence) }
      : resolveLeader(scores, fallbackArea);

    // Guarantee we land on a coherent specialized persona unless explicitly organic
    const finalPersona: PersonaId =
      resolved.persona === 'geral' ? fallbackArea : resolved.persona;

    const nextState: ContextState = {
      sessionId,
      activePersona: finalPersona,
      scores,
      confidence: resolved.confidence,
      originSummary,
      accessPeriod,
      lastSignal,
      signals: signals.slice(-15),
      isReturningVisitor,
    };

    this.emit(nextState, { utmTerm, utmSource, utmCampaign, referrer });
    return nextState;
  }

  /**
   * Direct decisive selection (e.g., clicking a Practice Area row):
   * immediately elevates the chosen niche as the coherent active leader (zero score-stickiness!).
   */
  public selectAreaDirectly(personaId: PersonaId, detail?: string): ContextState {
    const nextScores: PersonaScores = {
      geral: 0,
      imobiliario: personaId === 'imobiliario' ? 92 : Math.round(this.state.scores.imobiliario * 0.25),
      familia: personaId === 'familia' ? 92 : Math.round(this.state.scores.familia * 0.25),
      trabalhista: personaId === 'trabalhista' ? 92 : Math.round(this.state.scores.trabalhista * 0.25),
      previdenciario:
        personaId === 'previdenciario' ? 92 : Math.round(this.state.scores.previdenciario * 0.25),
      consumidor: personaId === 'consumidor' ? 92 : Math.round(this.state.scores.consumidor * 0.25),
    };

    const signal: ContextSignal = {
      source: 'click',
      detail: detail ?? `Núcleo selecionado: ${PERSONA_CONTENTS[personaId].areaLabel}`,
      personaId,
      weight: 92,
      timestamp: Date.now(),
    };

    const nextState: ContextState = {
      ...this.state,
      activePersona: personaId,
      scores: nextScores,
      confidence: 0.96,
      originSummary: `Núcleo em Foco • ${PERSONA_CONTENTS[personaId].areaLabel}`,
      lastSignal: signal,
      signals: [...this.state.signals, signal].slice(-15),
    };

    this.emit(nextState);
    return nextState;
  }

  /**
   * Field Demo Simulator injection: updates URL cleanly, resets competing scores,
   * and triggers full live rewrite across Hero, Cases, Diagnostics & WhatsApp CTA.
   */
  public injectSimulatedSearch(preset: LeadOriginPreset): ContextState {
    try {
      const url = new URL(window.location.href);
      if (preset.personaId === 'geral' || !preset.utmTerm) {
        url.searchParams.delete('utm_term');
        url.searchParams.delete('utm_source');
        url.searchParams.delete('utm_campaign');
        url.searchParams.delete('q');
        url.searchParams.delete('tema');
        url.searchParams.delete('area');
      } else {
        url.searchParams.set('utm_source', preset.utmSource);
        url.searchParams.set('utm_term', preset.utmTerm);
        url.searchParams.set('utm_campaign', preset.utmCampaign);
        url.searchParams.delete('area');
      }
      window.history.replaceState({}, '', url.toString());
    } catch {
      // Ignore history constraints
    }

    const nextScores: PersonaScores = {
      geral: preset.personaId === 'geral' ? 80 : 0,
      imobiliario: preset.personaId === 'imobiliario' ? 94 : 0,
      familia: preset.personaId === 'familia' ? 94 : 0,
      trabalhista: preset.personaId === 'trabalhista' ? 94 : 0,
      previdenciario: preset.personaId === 'previdenciario' ? 94 : 0,
      consumidor: preset.personaId === 'consumidor' ? 94 : 0,
    };

    const simSignal: ContextSignal = {
      source: 'simulator',
      detail: preset.label,
      personaId: preset.personaId,
      weight: 94,
      timestamp: Date.now(),
    };

    const nextState: ContextState = {
      ...this.state,
      activePersona: preset.personaId,
      scores: nextScores,
      confidence: preset.personaId === 'geral' ? 0.78 : 0.97,
      originSummary: preset.label,
      lastSignal: simSignal,
      signals: [...this.state.signals, simSignal].slice(-15),
    };

    this.emit(nextState, {
      utmTerm: preset.utmTerm,
      utmSource: preset.utmSource,
      utmCampaign: preset.utmCampaign,
      referrer: preset.referrerHint,
    });

    return nextState;
  }

  /**
   * Layer 3: Passive behavioral scoring (hover dwell, scroll stop, paragraph reading, text selection).
   * Applies gentle decay to non-matching niches so sustained interest smoothly crosses the threshold.
   */
  public recordPassiveSignal(signal: Omit<ContextSignal, 'timestamp'>): ContextState {
    if (signal.personaId === 'geral') return this.state;

    const decayed: PersonaScores = {
      geral: Math.round(this.state.scores.geral * 0.85),
      imobiliario: Math.round(this.state.scores.imobiliario * 0.9),
      familia: Math.round(this.state.scores.familia * 0.9),
      trabalhista: Math.round(this.state.scores.trabalhista * 0.9),
      previdenciario: Math.round(this.state.scores.previdenciario * 0.9),
      consumidor: Math.round(this.state.scores.consumidor * 0.9),
    };

    decayed[signal.personaId] = Math.min(120, decayed[signal.personaId] + signal.weight);

    const fullSignal: ContextSignal = {
      ...signal,
      timestamp: Date.now(),
    };

    const currentLeaderScore = decayed[this.state.activePersona] ?? 0;
    const candidateScore = decayed[signal.personaId];
    const shouldSwitch =
      signal.personaId !== this.state.activePersona &&
      candidateScore >= CONFIDENCE_SWITCH_THRESHOLD &&
      candidateScore >= currentLeaderScore;

    const nextPersona = shouldSwitch ? signal.personaId : this.state.activePersona;
    const { confidence } = resolveLeader(decayed, nextPersona);

    const nextState: ContextState = {
      ...this.state,
      activePersona: nextPersona,
      scores: decayed,
      confidence,
      originSummary: shouldSwitch
        ? `Leitura Comportamental • ${PERSONA_CONTENTS[nextPersona].areaLabel}`
        : this.state.originSummary,
      lastSignal: fullSignal,
      signals: [...this.state.signals, fullSignal].slice(-15),
    };

    this.emit(nextState);
    return nextState;
  }

  /**
   * Attaches silent TikTok-style background listeners:
   * - Text selection listener (detects highlighted legal keywords)
   * - Scroll-stop dwell listener (detects paragraphs/blocks where visitor pauses reading)
   */
  public startPassiveListeners(): void {
    this.stopPassiveListeners();
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const handleTextSelection = () => {
      const selected = window.getSelection()?.toString().trim() ?? '';
      if (selected.length < 4 || selected === this.lastSelectionText) return;
      this.lastSelectionText = selected;

      const delta = scoreKeywords(selected, 46);
      let topArea: PersonaId | null = null;
      let topScore = 0;
      for (const id of SPECIFIC_PERSONAS) {
        const s = delta[id] ?? 0;
        if (s > topScore) {
          topScore = s;
          topArea = id;
        }
      }

      if (topArea) {
        this.recordPassiveSignal({
          source: 'selection',
          personaId: topArea,
          weight: Math.max(48, topScore),
          detail: `Texto selecionado: "${selected.slice(0, 32)}"`,
        });
      }
    };

    const evaluateViewportDwell = () => {
      const viewportMid = window.innerHeight * 0.45;
      const taggedElements = document.querySelectorAll<HTMLElement>('[data-intent-area]');
      for (const el of taggedElements) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= viewportMid && rect.bottom >= viewportMid) {
          const area = el.dataset.intentArea as PersonaId | undefined;
          if (area && SPECIFIC_PERSONAS.includes(area)) {
            this.recordPassiveSignal({
              source: 'dwell',
              personaId: area,
              weight: 18,
              detail: `Pausa de leitura em ${PERSONA_CONTENTS[area].areaLabel}`,
            });
          }
          break;
        }
      }
    };

    const handleScroll = () => {
      if (this.scrollStopTimer !== null) {
        window.clearTimeout(this.scrollStopTimer);
      }
      this.scrollStopTimer = window.setTimeout(evaluateViewportDwell, 1400);
    };

    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('touchend', handleTextSelection, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    this.cleanupFns.push(() => {
      document.removeEventListener('mouseup', handleTextSelection);
      document.removeEventListener('touchend', handleTextSelection);
      window.removeEventListener('scroll', handleScroll);
      if (this.scrollStopTimer !== null) {
        window.clearTimeout(this.scrollStopTimer);
        this.scrollStopTimer = null;
      }
    });
  }

  public stopPassiveListeners(): void {
    for (const fn of this.cleanupFns) fn();
    this.cleanupFns = [];
  }
}

export function buildWhatsappUrl(
  whatsappNumber: string,
  lawyerName: string,
  personaId: PersonaId
): string {
  const digits = whatsappNumber.replace(/\D/g, '') || '5561998421048';
  const normalizedPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const rawMessage = PERSONA_CONTENTS[personaId].whatsappPrefill;
  const shortLawyer = lawyerName.split(' ').slice(0, 2).join(' ');
  const customized = rawMessage.replace(/Dr\. Henrique/g, shortLawyer);
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(customized)}`;
}
