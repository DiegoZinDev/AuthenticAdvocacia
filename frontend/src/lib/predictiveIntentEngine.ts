import { PERSONA_CONTENTS } from '../data/seeds';
import type {
  ContextSignal,
  ContextState,
  LeadOriginPreset,
  NeuralTelemetrySnapshot,
  PersonaId,
  PersonaScores,
} from '../types/legal';
import {
  loadPersistedSession,
  persistSessionLocally,
  syncTelemetrySession,
} from './offlineStore';
import { resolvePersonaFromPathname } from './seoEngine';

const COOKIE_NAME = 'adv_autoseller_ctx';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const CONFIDENCE_SWITCH_THRESHOLD = 44;

const SPECIFIC_PERSONAS: PersonaId[] = [
  'imobiliario',
  'familia',
  'trabalhista',
  'previdenciario',
  'consumidor',
  'saude',
  'empresarial',
  'criminal',
];

interface CrossIntentRule {
  id: string;
  personaId: PersonaId;
  summary: string;
  /** Peripheral terms whose combination implies this legal area even without naming it */
  clueGroups: string[][];
  weight: number;
}

/**
 * Layer A — Cross-Intent Semantic Deduction Matrix:
 * Deduces legal intent from indirect peripheral clues (symptoms, life events, financial shocks, late-night crises).
 */
const CROSS_INTENT_RULES: CrossIntentRule[] = [
  {
    id: 'cross-prev-incapacidade',
    personaId: 'previdenciario',
    summary: 'dor/laudo médico + idade/contribuição → Incapacidade / INSS',
    clueGroups: [
      ['dor nas pernas', 'coluna', 'hernia', 'laudo', 'pericia', 'incapacidade', 'doenca', 'invalidez'],
      ['55', '56', '57', '58', '59', '60', '62', '65', 'anos', 'contribuicao', 'inss', 'bpc', 'loas', 'aposent'],
    ],
    weight: 76,
  },
  {
    id: 'cross-imob-distrato',
    personaId: 'imobiliario',
    summary: 'construtora/chaves/parcela reajustada → Distrato Imobiliário',
    clueGroups: [
      ['construtora', 'incorporadora', 'chaves', 'planta', 'obra', 'imovel', 'lote', 'escritura'],
      ['atras', 'parcela', 'reajust', 'incc', 'multa', 'distrato', 'entrega', 'clausula'],
    ],
    weight: 72,
  },
  {
    id: 'cross-cons-bancario',
    personaId: 'consumidor',
    summary: 'pix bloqueado / conta invadida / nome sujo → Bancário & Consumidor',
    clueGroups: [
      ['pix', 'conta', 'banco', 'cartao', 'consignado', 'serasa', 'spc', 'nome'],
      ['bloquead', 'invadid', 'golpe', 'fraude', 'sujo', 'negativad', 'indevid', 'desconto'],
    ],
    weight: 74,
  },
  {
    id: 'cross-crim-plantao',
    personaId: 'criminal',
    summary: 'madrugada / delegacia / blitz / flagrante → Plantão Criminal 24h',
    clueGroups: [
      ['meia-noite', '00h', '01h', '02h', '03h', 'madrugada', 'plantao', 'urgente', 'agora'],
      ['delegacia', 'blitz', 'flagrante', 'preso', 'prisao', 'custodia', 'habeas', 'policia'],
    ],
    weight: 84,
  },
  {
    id: 'cross-trab-vinculo',
    personaId: 'trabalhista',
    summary: 'demissão grávida / PJ com horário fixo → Vínculo Trabalhista',
    clueGroups: [
      ['demiss', 'demitid', 'pj', 'mei', 'gestante', 'gravida', 'ponto', 'chefe'],
      ['horario fixo', 'subordinac', 'sem carteira', 'fgts', 'verba', 'rescis', 'horas extras', 'assedio'],
    ],
    weight: 74,
  },
  {
    id: 'cross-saude-liminar',
    personaId: 'saude',
    summary: 'plano negou cirurgia / home care / laudo urgente → Direito Médico',
    clueGroups: [
      ['plano', 'convenio', 'operadora', 'unimed', 'amil', 'bradesco saude', 'sulamerica'],
      ['negou', 'recusou', 'cirurgia', 'home care', 'uti', 'medicamento', 'quimioterapia', 'protese', 'tea'],
    ],
    weight: 78,
  },
  {
    id: 'cross-empr-societario',
    personaId: 'empresarial',
    summary: 'conflito societário / inadimplência B2B / multa → Empresarial',
    clueGroups: [
      ['socio', 'empresa', 'cnpj', 'franquia', 'fornecedor', 'duplicata', 'contrato social'],
      ['multa', 'cobranca', 'inadimpl', 'blindagem', 'dissolucao', 'execucao', 'revisao'],
    ],
    weight: 70,
  },
  {
    id: 'cross-fam-partilha',
    personaId: 'familia',
    summary: 'partilha de bens / guarda / pensão / inventário → Família & Sucessões',
    clueGroups: [
      ['divorcio', 'separac', 'ex-marido', 'ex-esposa', 'filho', 'herdeiro', 'falecid'],
      ['partilha', 'bens', 'pensao', 'alimentos', 'guarda', 'inventario', 'heranca'],
    ],
    weight: 72,
  },
];

function createEmptyScores(defaultArea: PersonaId = 'imobiliario'): PersonaScores {
  return {
    geral: defaultArea === 'geral' ? 35 : 0,
    imobiliario: defaultArea === 'imobiliario' ? 35 : 0,
    familia: defaultArea === 'familia' ? 35 : 0,
    trabalhista: defaultArea === 'trabalhista' ? 35 : 0,
    previdenciario: defaultArea === 'previdenciario' ? 35 : 0,
    consumidor: defaultArea === 'consumidor' ? 35 : 0,
    saude: defaultArea === 'saude' ? 35 : 0,
    empresarial: defaultArea === 'empresarial' ? 35 : 0,
    criminal: defaultArea === 'criminal' ? 35 : 0,
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

function extractReferrerQuery(referrer: string): { query: string; host: string } {
  if (!referrer) return { query: '', host: '' };
  try {
    const refUrl = new URL(referrer);
    const query =
      refUrl.searchParams.get('q') ||
      refUrl.searchParams.get('p') ||
      refUrl.searchParams.get('query') ||
      refUrl.searchParams.get('text') ||
      refUrl.searchParams.get('wd') ||
      '';
    return {
      query: query.trim(),
      host: refUrl.hostname.replace(/^www\./, ''),
    };
  } catch {
    return { query: '', host: '' };
  }
}

export function getAccessPeriodContext(): string {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  if (hour >= 0 && hour < 6) return 'Madrugada • Plantão 24h';
  if (day === 0 || day === 6) return 'Plantão de Fim de Semana';
  if (hour >= 6 && hour < 12) return 'Atendimento Matutino';
  if (hour >= 12 && hour < 18) return 'Expediente Comercial';
  return 'Plantão Noturno';
}

function detectDeviceLabel(): string {
  if (typeof navigator === 'undefined') return 'Desktop Corporativo';
  const ua = navigator.userAgent;
  if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS Mobile';
  if (/Android/i.test(ua)) return 'Android Mobile';
  if (typeof window !== 'undefined' && window.innerWidth <= 768) return 'Mobile Web';
  return 'Desktop Corporativo';
}

function detectConnectionType(): string {
  if (typeof navigator === 'undefined') return 'Wi-Fi / Fibra';
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; type?: string };
  };
  const eff = nav.connection?.effectiveType?.toUpperCase();
  const rawType = nav.connection?.type;
  if (rawType === 'wifi') return 'Wi-Fi / Fibra';
  if (eff) return eff;
  return 'Banda Larga';
}

function createInitialTelemetry(defaultArea: PersonaId): NeuralTelemetrySnapshot {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  const hour = now.getHours();
  const isNight = hour >= 22 || hour < 6;
  const tz =
    typeof Intl !== 'undefined'
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Sao_Paulo'
      : 'America/Sao_Paulo';
  const lang = typeof navigator !== 'undefined' ? navigator.language || 'pt-BR' : 'pt-BR';

  return {
    deviceLabel: detectDeviceLabel(),
    connectionType: detectConnectionType(),
    batteryLabel: 'Monitorando...',
    batteryCritical: false,
    timezone: tz,
    language: lang,
    accessHourLabel: `${hh}h${mm} • ${getAccessPeriodContext()}`,
    urgencyLevel: isNight ? 'elevada' : 'normal',
    dwellMs: 0,
    reReadCount: 0,
    scrollVelocityPxSec: 0,
    semanticVectorSummary: `${PERSONA_CONTENTS[defaultArea].areaLabel} (Base)`,
    activeSignalCount: 3,
  };
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
    // Ignore cookie constraints
  }
}

/**
 * Synchronizes the REAL browser address bar via window.history.replaceState,
 * stripping stray anchors (like #autoridade) and writing full attribution + ctx_score params.
 */
function syncBrowserUrl(params: {
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmTerm: string;
  ctxScore: number;
}): void {
  if (typeof window === 'undefined') return;
  try {
    const cleanUrl = new URL(window.location.origin + window.location.pathname);
    cleanUrl.searchParams.set('utm_source', params.utmSource);
    cleanUrl.searchParams.set('utm_medium', params.utmMedium);
    cleanUrl.searchParams.set('utm_campaign', params.utmCampaign);
    if (params.utmTerm) {
      cleanUrl.searchParams.set('utm_term', params.utmTerm);
    }
    cleanUrl.searchParams.set('ctx_score', String(Math.round(params.ctxScore)));
    // Explicitly strip any stray hash (#autoridade, #casos-resolvidos, etc.)
    cleanUrl.hash = '';
    window.history.replaceState({}, '', cleanUrl.toString());
  } catch {
    // Ignore restricted history API environments
  }
}

function evaluateCrossIntentAndKeywords(
  rawInput: string,
  baseKeywordWeight: number
): {
  delta: Partial<PersonaScores>;
  matchedCrossRule: CrossIntentRule | null;
} {
  const normalized = normalizeText(rawInput).replace(/[-_+]/g, ' ');
  if (!normalized) return { delta: {}, matchedCrossRule: null };

  const delta: Partial<PersonaScores> = {};
  let matchedCrossRule: CrossIntentRule | null = null;

  // 1) Cross-Intent peripheral deduction rules (Layer A)
  for (const rule of CROSS_INTENT_RULES) {
    const groupsHit = rule.clueGroups.filter((group) =>
      group.some((clue) => normalized.includes(clue))
    ).length;

    if (groupsHit >= 2) {
      delta[rule.personaId] = (delta[rule.personaId] ?? 0) + rule.weight;
      if (!matchedCrossRule || rule.weight > matchedCrossRule.weight) {
        matchedCrossRule = rule;
      }
    } else if (groupsHit === 1) {
      delta[rule.personaId] = (delta[rule.personaId] ?? 0) + Math.round(rule.weight * 0.32);
    }
  }

  // 2) Direct keyword matching across all 8 specialized domains
  for (const personaId of SPECIFIC_PERSONAS) {
    const keywords = PERSONA_CONTENTS[personaId].keywords;
    let hits = 0;
    for (const kw of keywords) {
      if (normalized.includes(kw)) hits += 1;
    }
    if (hits > 0) {
      delta[personaId] = (delta[personaId] ?? 0) + hits * baseKeywordWeight;
    }
  }

  return { delta, matchedCrossRule };
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

  const total = SPECIFIC_PERSONAS.reduce((acc, id) => acc + scores[id], 0);
  if (total <= 0) return { persona: fallbackPersona, confidence: 0.78 };

  const ratio = Math.min(0.98, Math.max(0.72, bestScore / Math.max(total * 0.86, bestScore + 8)));
  return { persona: bestPersona, confidence: Number(ratio.toFixed(2)) };
}

type StateListener = (state: ContextState) => void;

/**
 * Neural Context Fusion Engine (PredictiveIntentEngine V2):
 * Fuses 25+ invisible signals across 5 layers:
 *   Layer A — Cross-Intent Indirect Semantic Deduction
 *   Layer B — Temporal & Environmental Urgency Context
 *   Layer C — Device, Network & Battery Telemetry
 *   Layer D — TikTok-style Page Micro-Behavior (Dwell ms, Scroll Velocity, Scroll-Up Re-Read, Text Selection/Copy, Hover)
 *   Layer E — Persistent Cross-Session Memory (Cookie + localStorage + IndexedDB)
 * Plus real browser URL synchronization via window.history.replaceState.
 */
export class PredictiveIntentEngine {
  private state: ContextState;
  private listeners = new Set<StateListener>();
  private cleanupFns: Array<() => void> = [];
  private scrollStopTimer: number | null = null;
  private lastScrollY = 0;
  private lastScrollTs = 0;
  private lastSelectionText = '';
  private sessionStartTs = Date.now();

  constructor(defaultPrimaryArea: PersonaId = 'imobiliario') {
    const initialArea: PersonaId = defaultPrimaryArea;
    this.state = {
      sessionId: 'init',
      activePersona: initialArea,
      scores: createEmptyScores(initialArea),
      confidence: 0.82,
      originSummary: `Acesso Direto • ${getAccessPeriodContext()}`,
      accessPeriod: getAccessPeriodContext(),
      deductionHeadline: PERSONA_CONTENTS[initialArea].badgeSubtitle,
      telemetry: createInitialTelemetry(initialArea),
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

  private emit(
    next: ContextState,
    telemetryMeta?: {
      utmTerm?: string;
      utmSource?: string;
      utmCampaign?: string;
      referrer?: string;
    }
  ): void {
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
   * Layer C: Asynchronously probes Battery Status API (when supported by browser)
   * and updates live device/urgency telemetry without blocking initial render.
   */
  private async probeBatteryTelemetry(): Promise<void> {
    if (typeof navigator === 'undefined') return;
    const nav = navigator as Navigator & {
      getBattery?: () => Promise<{ level: number; charging: boolean }>;
    };

    if (!nav.getBattery) {
      this.patchTelemetry({
        batteryLabel: this.state.telemetry.deviceLabel.includes('Desktop')
          ? 'AC / Desktop'
          : 'Protegido pelo SO',
      });
      return;
    }

    try {
      const bat = await nav.getBattery();
      const pct = Math.round(bat.level * 100);
      const isCritical = pct <= 20 && !bat.charging;
      const hour = new Date().getHours();
      const isNight = hour >= 22 || hour < 6;

      this.patchTelemetry({
        batteryLabel: bat.charging ? `${pct}% (Carregando)` : `${pct}%${isCritical ? ' (Crítica)' : ''}`,
        batteryCritical: isCritical,
        urgencyLevel: isCritical && isNight ? 'critica' : isCritical || isNight ? 'elevada' : 'normal',
      });
    } catch {
      this.patchTelemetry({ batteryLabel: 'Indisponível' });
    }
  }

  private patchTelemetry(patch: Partial<NeuralTelemetrySnapshot>): void {
    const nextState: ContextState = {
      ...this.state,
      telemetry: {
        ...this.state.telemetry,
        ...patch,
      },
    };
    this.state = nextState;
    for (const listener of this.listeners) {
      listener(nextState);
    }
  }

  public async bootstrap(defaultPrimaryArea: PersonaId = 'imobiliario'): Promise<ContextState> {
    const url = new URL(window.location.href);
    const params = url.searchParams;

    const utmTerm = params.get('utm_term') ?? '';
    const utmCampaign = params.get('utm_campaign') ?? '';
    const utmSource = params.get('utm_source') ?? '';
    const utmMedium = params.get('utm_medium') ?? '';
    const queryQ = params.get('q') ?? '';
    const temaParam = params.get('tema') ?? '';
    const areaParam = params.get('area') ?? '';
    const ctxScoreParam = Number(params.get('ctx_score') ?? 0);
    const referrer = typeof document !== 'undefined' ? document.referrer : '';
    const accessPeriod = getAccessPeriodContext();

    const cookieCtx = readContextCookie();
    const localCtx = await loadPersistedSession();

    const sessionId = cookieCtx?.sessionId || localCtx?.sessionId || generateSessionId();
    const isReturningVisitor = Boolean(cookieCtx?.sessionId || localCtx?.sessionId);

    const fallbackArea: PersonaId = defaultPrimaryArea;

    const scores: PersonaScores = {
      ...createEmptyScores(fallbackArea),
      ...(localCtx?.scores ?? {}),
      ...(cookieCtx?.scores ?? {}),
    };

    const signals: ContextSignal[] = localCtx?.signals ? [...localCtx.signals].slice(-12) : [];
    let lastSignal: ContextSignal | null = null;
    let originSummary = `Acesso Direto • ${accessPeriod}`;
    let semanticSummary = `${PERSONA_CONTENTS[fallbackArea].areaLabel} (Perfil Inicial)`;
    let forcedWinner: PersonaId | null = null;

    // Layer B: Temporal urgency signal (late night subtly boosts urgent niches)
    const currentHour = new Date().getHours();
    if (currentHour >= 0 && currentHour < 6) {
      scores.criminal += 18;
      scores.saude += 14;
      signals.push({
        source: 'temporal',
        detail: `Acesso na madrugada (${currentHour}h) — urgência elevada`,
        personaId: 'criminal',
        weight: 18,
        timestamp: Date.now(),
      });
    }

    // Layer A0: Organic SEO friendly URL pathname (/atuacao/*) without needing UTM/simulator
    const pathPersona = resolvePersonaFromPathname(url.pathname);
    if (pathPersona && SPECIFIC_PERSONAS.includes(pathPersona)) {
      forcedWinner = pathPersona;
      scores[pathPersona] = Math.max(scores[pathPersona], 135);
      lastSignal = {
        source: 'url',
        detail: `Rota orgânica SEO (${url.pathname})`,
        personaId: pathPersona,
        weight: 94,
        timestamp: Date.now(),
      };
      signals.push(lastSignal);
      originSummary = `Busca Orgânica SEO • ${PERSONA_CONTENTS[pathPersona].areaLabel}`;
      semanticSummary = `URL amigável (${url.pathname}) → ${PERSONA_CONTENTS[pathPersona].areaLabel}`;
    }

    // Layer A1: Explicit ?area= or ?tema=
    const explicitArea = normalizeText(areaParam || temaParam) as PersonaId;
    if (explicitArea && SPECIFIC_PERSONAS.includes(explicitArea)) {
      forcedWinner = explicitArea;
      scores[explicitArea] = Math.max(scores[explicitArea], 92);
      lastSignal = {
        source: 'url',
        detail: `Parâmetro direto (${areaParam ? `?area=${areaParam}` : `?tema=${temaParam}`})`,
        personaId: explicitArea,
        weight: 92,
        timestamp: Date.now(),
      };
      signals.push(lastSignal);
      originSummary = `Link Direto • ${PERSONA_CONTENTS[explicitArea].areaLabel}`;
      semanticSummary = `Parâmetro explícito → ${PERSONA_CONTENTS[explicitArea].areaLabel}`;
    }

    // Layer A2: Cross-Intent & Direct URL signals (utm_term, utm_campaign, q, tema, referrer)
    const { query: referrerQuery, host: referrerHost } = extractReferrerQuery(referrer);
    let safeDecodedReferrer = referrer;
    try {
      safeDecodedReferrer = decodeURIComponent(referrer);
    } catch {
      // Keep raw referrer if malformed percent-encoding
    }
    const referrerSignal = referrerQuery || safeDecodedReferrer;
    const combinedInput = `${utmTerm} ${utmCampaign} ${queryQ} ${temaParam} ${referrerSignal}`.trim();
    if (combinedInput) {
      const { delta, matchedCrossRule } = evaluateCrossIntentAndKeywords(combinedInput, 42);
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
        scores[topArea] = Math.max(scores[topArea], 92);
        const readable = (utmTerm || queryQ || temaParam || utmCampaign || referrerQuery)
          .replace(/[-_+]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        lastSignal = {
          source: matchedCrossRule ? 'cross-intent' : 'url',
          detail: matchedCrossRule
            ? matchedCrossRule.summary
            : `Sinal URL: "${readable || PERSONA_CONTENTS[topArea].areaLabel}"`,
          personaId: topArea,
          weight: topVal,
          timestamp: Date.now(),
        };
        signals.push(lastSignal);
        semanticSummary = matchedCrossRule
          ? matchedCrossRule.summary
          : `"${readable || PERSONA_CONTENTS[topArea].areaLabel}" → ${PERSONA_CONTENTS[topArea].areaLabel}`;
        originSummary = utmSource
          ? `${utmSource.toUpperCase()} (${utmMedium || 'busca'}): "${readable}"`
          : referrerQuery && !queryQ && !utmTerm
            ? `Referrer (${referrerHost || 'buscador'}): "${readable}"`
            : `Busca: "${readable || PERSONA_CONTENTS[topArea].areaLabel}"`;
      }
    }

    // Layer E: Cross-Session persistent memory for returning visitors
    if (!forcedWinner && isReturningVisitor) {
      const remembered = cookieCtx?.activePersona || localCtx?.activePersona;
      if (remembered && (remembered === 'geral' || SPECIFIC_PERSONAS.includes(remembered))) {
        forcedWinner = remembered;
        originSummary = `Memória Cross-Session • ${accessPeriod}`;
        semanticSummary = `Histórico anterior preservado → ${PERSONA_CONTENTS[remembered].areaLabel}`;
        lastSignal = {
          source: 'cookie',
          detail: `Visitante recorrente (${PERSONA_CONTENTS[remembered].areaLabel})`,
          personaId: remembered,
          weight: 34,
          timestamp: Date.now(),
        };
      }
    }

    const resolved = forcedWinner
      ? {
          persona: forcedWinner,
          confidence:
            ctxScoreParam >= 70 && ctxScoreParam <= 99
              ? Number((ctxScoreParam / 100).toFixed(2))
              : Math.max(0.91, resolveLeader(scores, forcedWinner).confidence),
        }
      : resolveLeader(scores, fallbackArea);

    const finalPersona: PersonaId =
      resolved.persona === 'geral' ? fallbackArea : resolved.persona;

    const telemetry = createInitialTelemetry(finalPersona);
    telemetry.semanticVectorSummary = semanticSummary;
    telemetry.activeSignalCount = Math.max(4, signals.length + 3);

    const nextState: ContextState = {
      sessionId,
      activePersona: finalPersona,
      scores,
      confidence: resolved.confidence,
      originSummary,
      accessPeriod,
      deductionHeadline: PERSONA_CONTENTS[finalPersona].badgeSubtitle,
      telemetry,
      lastSignal,
      signals: signals.slice(-15),
      isReturningVisitor,
    };

    // Strip any stray #autoridade hash cleanly if present on bootstrap
    if (window.location.hash === '#autoridade') {
      try {
        const cleaned = new URL(window.location.href);
        cleaned.hash = '';
        window.history.replaceState({}, '', cleaned.toString());
      } catch {
        // Ignore
      }
    }

    this.emit(nextState, { utmTerm, utmSource, utmCampaign, referrer });
    void this.probeBatteryTelemetry();
    return nextState;
  }

  /**
   * Direct decisive selection when clicking a Practice Area row:
   * updates global state immediately + synchronizes real browser URL bar cleanly.
   */
  public selectAreaDirectly(personaId: PersonaId, detail?: string): ContextState {
    const target: PersonaId = personaId;
    const nextScores = createEmptyScores(target);
    nextScores[target] = 95;

    const signal: ContextSignal = {
      source: 'click',
      detail: detail ?? `Núcleo selecionado: ${PERSONA_CONTENTS[target].areaLabel}`,
      personaId: target,
      weight: 95,
      timestamp: Date.now(),
    };

    const scorePct = 95;
    syncBrowserUrl({
      utmSource: 'site_interno',
      utmMedium: 'nucleo_especialidade',
      utmCampaign: 'adaptacao_dinamica',
      utmTerm: target,
      ctxScore: scorePct,
    });

    const nextState: ContextState = {
      ...this.state,
      activePersona: target,
      scores: nextScores,
      confidence: 0.95,
      originSummary: `Núcleo Ativo • ${PERSONA_CONTENTS[target].areaLabel}`,
      deductionHeadline: PERSONA_CONTENTS[target].badgeSubtitle,
      telemetry: {
        ...this.state.telemetry,
        semanticVectorSummary: `Seleção direta → ${PERSONA_CONTENTS[target].areaLabel}`,
        activeSignalCount: this.state.telemetry.activeSignalCount + 1,
      },
      lastSignal: signal,
      signals: [...this.state.signals, signal].slice(-15),
    };

    this.emit(nextState, {
      utmSource: 'site_interno',
      utmCampaign: 'adaptacao_dinamica',
      utmTerm: target,
    });
    return nextState;
  }

  /**
   * Simulator Injection (Direct Search OR Indirect Cross-Clue Scenario):
   * Synchronizes the REAL browser address bar with full UTM + ctx_score parameters,
   * updates live Neural Telemetry matrix, and rewrites the entire page atomically.
   */
  public injectSimulatedSearch(preset: LeadOriginPreset): ContextState {
    const scorePct = preset.expectedScore || 94;
    syncBrowserUrl({
      utmSource: preset.utmSource,
      utmMedium: preset.utmMedium,
      utmCampaign: preset.utmCampaign,
      utmTerm: preset.utmTerm,
      ctxScore: scorePct,
    });

    const nextScores = createEmptyScores(preset.personaId);
    nextScores[preset.personaId] = scorePct;

    const simSignal: ContextSignal = {
      source: preset.mode === 'cross-intent' ? 'cross-intent' : 'simulator',
      detail: preset.deductionLabel,
      personaId: preset.personaId,
      weight: scorePct,
      timestamp: Date.now(),
    };

    const nextTelemetry: NeuralTelemetrySnapshot = {
      ...this.state.telemetry,
      ...(preset.simulatedTelemetry ?? {}),
      semanticVectorSummary:
        preset.simulatedTelemetry?.semanticVectorSummary ??
        `${preset.utmTerm.replace(/[-_]/g, ' ')} → ${PERSONA_CONTENTS[preset.personaId].areaLabel}`,
      activeSignalCount:
        preset.simulatedTelemetry?.activeSignalCount ??
        Math.max(6, this.state.telemetry.activeSignalCount + 2),
    };

    const nextState: ContextState = {
      ...this.state,
      activePersona: preset.personaId,
      scores: nextScores,
      confidence: Number((scorePct / 100).toFixed(2)),
      originSummary: preset.label,
      accessPeriod: preset.simulatedTelemetry?.accessHourLabel
        ? preset.simulatedTelemetry.accessHourLabel.split('•')[1]?.trim() || this.state.accessPeriod
        : this.state.accessPeriod,
      deductionHeadline: PERSONA_CONTENTS[preset.personaId].badgeSubtitle,
      telemetry: nextTelemetry,
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
   * Layer D — Passive TikTok-style behavioral signal fusion
   * (dwell ms, scroll-up re-reads, text selection/copy, hover dwell).
   */
  public recordPassiveSignal(
    signal: Omit<ContextSignal, 'timestamp'>,
    telemetryPatch?: Partial<NeuralTelemetrySnapshot>
  ): ContextState {
    if (signal.personaId === 'geral') return this.state;

    const decayed: PersonaScores = {
      geral: 0,
      imobiliario: Math.round(this.state.scores.imobiliario * 0.9),
      familia: Math.round(this.state.scores.familia * 0.9),
      trabalhista: Math.round(this.state.scores.trabalhista * 0.9),
      previdenciario: Math.round(this.state.scores.previdenciario * 0.9),
      consumidor: Math.round(this.state.scores.consumidor * 0.9),
      saude: Math.round(this.state.scores.saude * 0.9),
      empresarial: Math.round(this.state.scores.empresarial * 0.9),
      criminal: Math.round(this.state.scores.criminal * 0.9),
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

    if (shouldSwitch) {
      syncBrowserUrl({
        utmSource: 'comportamental',
        utmMedium: signal.source,
        utmCampaign: 'neural_dwell_fusion',
        utmTerm: nextPersona,
        ctxScore: Math.round(confidence * 100),
      });
    }

    const nextState: ContextState = {
      ...this.state,
      activePersona: nextPersona,
      scores: decayed,
      confidence,
      originSummary: shouldSwitch
        ? `Inferência Comportamental • ${PERSONA_CONTENTS[nextPersona].areaLabel}`
        : this.state.originSummary,
      deductionHeadline: PERSONA_CONTENTS[nextPersona].badgeSubtitle,
      telemetry: {
        ...this.state.telemetry,
        ...(telemetryPatch ?? {}),
        dwellMs: Date.now() - this.sessionStartTs,
        semanticVectorSummary: shouldSwitch
          ? `${signal.detail} → ${PERSONA_CONTENTS[nextPersona].areaLabel}`
          : this.state.telemetry.semanticVectorSummary,
        activeSignalCount: this.state.telemetry.activeSignalCount + 1,
      },
      lastSignal: fullSignal,
      signals: [...this.state.signals, fullSignal].slice(-15),
    };

    this.emit(nextState);
    return nextState;
  }

  /**
   * Attaches silent Layer D listeners:
   * - Scroll velocity (px/s) + Scroll-Up Re-Read hesitation detector
   * - Scroll-stop dwell timer on tagged legal thesis blocks
   * - Text selection & clipboard copy listeners (cross-intent semantic deduction)
   */
  public startPassiveListeners(): void {
    this.stopPassiveListeners();
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    this.lastScrollY = window.scrollY;
    this.lastScrollTs = performance.now();

    const inspectTextEvent = (source: 'selection' | 'copy') => {
      const selected = window.getSelection()?.toString().trim() ?? '';
      if (selected.length < 4 || (source === 'selection' && selected === this.lastSelectionText)) {
        return;
      }
      this.lastSelectionText = selected;

      const { delta, matchedCrossRule } = evaluateCrossIntentAndKeywords(
        selected,
        source === 'copy' ? 54 : 44
      );

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
          source: matchedCrossRule ? 'cross-intent' : source,
          personaId: topArea,
          weight: Math.max(50, topScore),
          detail:
            source === 'copy'
              ? `Trecho copiado: "${selected.slice(0, 28)}"`
              : `Texto selecionado: "${selected.slice(0, 28)}"`,
        });
      }
    };

    const handleMouseUp = () => inspectTextEvent('selection');
    const handleCopy = () => inspectTextEvent('copy');

    const findViewportIntentArea = (): PersonaId | null => {
      const mid = window.innerHeight * 0.45;
      const tagged = document.querySelectorAll<HTMLElement>('[data-intent-area]');
      for (const el of tagged) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= mid && rect.bottom >= mid) {
          const area = el.dataset.intentArea as PersonaId | undefined;
          if (area && SPECIFIC_PERSONAS.includes(area)) return area;
        }
      }
      return null;
    };

    const handleScroll = () => {
      const now = performance.now();
      const currY = window.scrollY;
      const dtSec = Math.max(0.016, (now - this.lastScrollTs) / 1000);
      const deltaY = currY - this.lastScrollY;
      const velocity = Math.round(Math.abs(deltaY) / dtSec);

      // Detect intentional scroll-up re-read hesitation (user scrolled back up 60px-450px slowly)
      if (deltaY < -65 && deltaY > -480 && velocity < 900) {
        const area = findViewportIntentArea();
        if (area) {
          const nextReReads = this.state.telemetry.reReadCount + 1;
          this.recordPassiveSignal(
            {
              source: 'reread',
              personaId: area,
              weight: 22,
              detail: `Releitura (${nextReReads}x) em ${PERSONA_CONTENTS[area].areaLabel}`,
            },
            {
              reReadCount: nextReReads,
              scrollVelocityPxSec: velocity,
            }
          );
        }
      } else {
        this.patchTelemetry({
          scrollVelocityPxSec: Math.min(2400, velocity),
          dwellMs: Date.now() - this.sessionStartTs,
        });
      }

      this.lastScrollY = currY;
      this.lastScrollTs = now;

      if (this.scrollStopTimer !== null) window.clearTimeout(this.scrollStopTimer);
      this.scrollStopTimer = window.setTimeout(() => {
        const area = findViewportIntentArea();
        if (area) {
          this.recordPassiveSignal(
            {
              source: 'dwell',
              personaId: area,
              weight: 18,
              detail: `Pausa de leitura em ${PERSONA_CONTENTS[area].areaLabel}`,
            },
            { scrollVelocityPxSec: 0 }
          );
        }
      }, 1350);
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchend', handleMouseUp, { passive: true });
    document.addEventListener('copy', handleCopy);
    window.addEventListener('scroll', handleScroll, { passive: true });

    this.cleanupFns.push(() => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchend', handleMouseUp);
      document.removeEventListener('copy', handleCopy);
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

export interface LegalAlertInfo {
  tag: string;
  statute: string;
  detail: string;
}

export const LEGAL_ALERT_BY_PERSONA: Record<PersonaId, LegalAlertInfo> = {
  geral: {
    tag: 'Nota Informativa & Prazos',
    statute: 'Análise Documental & Prazos Legais (CPC / Legislação Especial)',
    detail:
      'A verificação prévia de prazos prescricionais e da documentação disponível contribui para uma avaliação jurídica técnica e segura.',
  },
  imobiliario: {
    tag: 'Referência Informativa Imobiliária',
    statute: 'Súmula 543 do STJ & Lei nº 13.786/2018 (Lei do Distrato)',
    detail:
      'A legislação e a jurisprudência estabelecem parâmetros específicos para retenções contratuais, atraso na entrega e regularização registral, avaliados caso a caso.',
  },
  trabalhista: {
    tag: 'Informação sobre Prazo Prescricional',
    statute: 'Prescrição Bienal e Quinquenal (Art. 7º, XXIX, Constituição Federal)',
    detail:
      'A Constituição prevê o prazo de até 2 anos após o término do contrato de trabalho para eventual discussão judicial de verbas relativas aos últimos 5 anos.',
  },
  familia: {
    tag: 'Informação sobre Procedimentos Familiares',
    statute: 'Código Civil, CPC & Lei de Alimentos (Lei nº 5.478/1968)',
    detail:
      'Questões de partilha, guarda, alimentos e inventário podem tramitar de forma consensual ou judicial, sempre sob sigilo e análise documental individualizada.',
  },
  previdenciario: {
    tag: 'Referência Informativa Previdenciária',
    statute: 'Regras de Transição (EC nº 103/2019) & Lei nº 8.213/1991',
    detail:
      'A conferência prévia do extrato CNIS, vínculos contributivos e laudos médicos auxilia na verificação dos requisitos administrativos antes de qualquer protocolo no INSS.',
  },
  consumidor: {
    tag: 'Referência Informativa Bancária',
    statute: 'Código de Defesa do Consumidor (Lei nº 8.078/1990) & Normas do BACEN',
    detail:
      'Registros de protocolos bancários, MED e comprovantes de contestação são documentos essenciais para a análise técnica de incidentes bancários ou negativações.',
  },
  saude: {
    tag: 'Referência Informativa em Saúde',
    statute: 'Lei nº 9.656/1998, Lei nº 14.454/2022 & Normas da ANS',
    detail:
      'O relatório médico circunstanciado e a justificativa por escrito da operadora são os elementos centrais examinados na avaliação de cobertura assistencial.',
  },
  empresarial: {
    tag: 'Referência Informativa Empresarial',
    statute: 'Código Civil (Direito de Empresa) & Código de Processo Civil',
    detail:
      'A análise do contrato social, instrumentos comerciais e títulos executivos fundamenta estratégias consultivas, negociais ou contenciosas adequadas à empresa.',
  },
  criminal: {
    tag: 'Referência Informativa Penal',
    statute: 'Constituição Federal (Art. 5º), CPP & Estatuto da OAB (Art. 7º)',
    detail:
      'O acompanhamento técnico desde a fase policial ou audiência de custódia assegura a observância do devido processo legal e das garantias constitucionais.',
  },
};

function formatUrgencyLabel(level: NeuralTelemetrySnapshot['urgencyLevel']): string {
  if (level === 'critica') return 'Prioritária (Horário Crítico)';
  if (level === 'elevada') return 'Elevada';
  return 'Regular';
}

export function buildWhatsAppTriageDossier(
  whatsappNumber: string,
  lawyerName: string,
  state: ContextState,
  triageAnswers?: Array<{ dossierTag: string; optionLabel?: string }>,
  additionalNote?: string
): { text: string; url: string } {
  const digits = whatsappNumber.replace(/\D/g, '') || '5561998421048';
  const normalizedPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const shortLawyer = lawyerName.split(' ').slice(0, 2).join(' ') || 'Dr. Henrique';
  const persona = PERSONA_CONTENTS[state.activePersona];
  const urgencyLabel = formatUrgencyLabel(state.telemetry.urgencyLevel);

  const lines: string[] = [
    `Olá, ${shortLawyer}. Gostaria de agendar uma conversa inicial com o escritório.`,
    `Área de interesse: ${persona.areaLabel}.`,
  ];

  if (triageAnswers && triageAnswers.length > 0) {
    lines.push('Resumo inicial:');
    for (const item of triageAnswers) {
      lines.push(`• ${item.dossierTag}`);
    }
  }

  const cleanNote = additionalNote?.trim();
  if (cleanNote) {
    lines.push(`Observação adicional: ${cleanNote.slice(0, 220)}`);
  }

  lines.push(
    `Período de acesso: ${state.accessPeriod} • Prioridade: ${urgencyLabel}.`
  );
  lines.push('[Atendimento Inicial • Canal Oficial do Site]');

  const text = lines.join('\n');
  return {
    text,
    url: `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(text)}`,
  };
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
