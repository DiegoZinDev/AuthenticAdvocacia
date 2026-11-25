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
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const EMPTY_SCORES: PersonaScores = {
  geral: 10,
  imobiliario: 0,
  familia: 0,
  trabalhista: 0,
  previdenciario: 0,
  consumidor: 0,
};

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

export function readContextCookie(): {
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
    const parsed = JSON.parse(decodeURIComponent(encoded)) as {
      sessionId?: string;
      activePersona?: PersonaId;
      scores?: Partial<PersonaScores>;
    };
    return parsed;
  } catch {
    return null;
  }
}

export function writeContextCookie(state: Pick<ContextState, 'sessionId' | 'activePersona' | 'scores'>): void {
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
    // Ignore cookie errors
  }
}

function scoreKeywordString(rawInput: string, weightPerHit: number): Partial<PersonaScores> {
  const normalized = normalizeText(rawInput);
  if (!normalized) return {};

  const delta: Partial<PersonaScores> = {};
  const specificPersonas: PersonaId[] = [
    'imobiliario',
    'familia',
    'trabalhista',
    'previdenciario',
    'consumidor',
  ];

  for (const personaId of specificPersonas) {
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

export function pickWinningPersona(scores: PersonaScores): {
  persona: PersonaId;
  confidence: number;
} {
  const specificPersonas: PersonaId[] = [
    'imobiliario',
    'familia',
    'trabalhista',
    'previdenciario',
    'consumidor',
  ];

  let bestPersona: PersonaId = 'geral';
  let bestScore = scores.geral;

  for (const id of specificPersonas) {
    if (scores[id] > bestScore) {
      bestScore = scores[id];
      bestPersona = id;
    }
  }

  const totalSpecific = specificPersonas.reduce((sum, id) => sum + scores[id], 0);
  if (bestPersona === 'geral' || totalSpecific === 0) {
    return { persona: 'geral', confidence: 0.65 };
  }

  const ratio = Math.min(0.98, Math.max(0.58, bestScore / (totalSpecific + 15)));
  return { persona: bestPersona, confidence: Number(ratio.toFixed(2)) };
}

export async function initializeContextEngine(): Promise<ContextState> {
  const url = new URL(window.location.href);
  const params = url.searchParams;

  const utmTerm = params.get('utm_term') ?? '';
  const utmCampaign = params.get('utm_campaign') ?? '';
  const utmSource = params.get('utm_source') ?? '';
  const areaParam = params.get('area') ?? '';
  const referrer = typeof document !== 'undefined' ? document.referrer : '';

  // Layer 2: Restore first-party cookie / IndexedDB session if returning visitor
  const cookieCtx = readContextCookie();
  const localCtx = await loadPersistedSession();

  const sessionId = cookieCtx?.sessionId || localCtx?.sessionId || generateSessionId();
  const isReturningVisitor = Boolean(cookieCtx?.sessionId || localCtx?.sessionId);

  const scores: PersonaScores = {
    ...EMPTY_SCORES,
    ...(localCtx?.scores ?? {}),
    ...(cookieCtx?.scores ?? {}),
  };

  const signals: ContextSignal[] = localCtx?.signals ? [...localCtx.signals].slice(-12) : [];
  let lastSignal: ContextSignal | null = null;
  let originSummary = 'Acesso Direto • Brasília/DF';

  // Layer 1: Origin URL & Referrer scoring
  const explicitArea = normalizeText(areaParam) as PersonaId;
  if (
    explicitArea &&
    ['imobiliario', 'familia', 'trabalhista', 'previdenciario', 'consumidor', 'geral'].includes(
      explicitArea
    )
  ) {
    if (explicitArea === 'geral') {
      scores.geral += 45;
    } else {
      scores[explicitArea] += 65;
    }
    lastSignal = {
      source: 'url',
      detail: `Parâmetro direto ?area=${explicitArea}`,
      personaId: explicitArea,
      weight: 65,
      timestamp: Date.now(),
    };
    signals.push(lastSignal);
    originSummary = `Origem URL (?area=${explicitArea})`;
  }

  const urlText = `${utmTerm} ${utmCampaign} ${utmSource}`.trim();
  if (urlText) {
    const delta = scoreKeywordString(urlText, 40);
    let topFromUrl: PersonaId | null = null;
    let topVal = 0;

    (Object.keys(delta) as PersonaId[]).forEach((key) => {
      const val = delta[key] ?? 0;
      scores[key] += val;
      if (val > topVal) {
        topVal = val;
        topFromUrl = key;
      }
    });

    if (topFromUrl) {
      lastSignal = {
        source: 'url',
        detail: `utm_term="${utmTerm || utmCampaign}"`,
        personaId: topFromUrl,
        weight: topVal,
        timestamp: Date.now(),
      };
      signals.push(lastSignal);
      originSummary = utmTerm
        ? `Busca: "${utmTerm.replace(/[-_]/g, ' ')}"`
        : `Campanha: ${utmCampaign}`;
    }
  }

  if (referrer) {
    const refDelta = scoreKeywordString(referrer, 25);
    (Object.keys(refDelta) as PersonaId[]).forEach((key) => {
      const val = refDelta[key] ?? 0;
      if (val > 0) {
        scores[key] += val;
        lastSignal = {
          source: 'referrer',
          detail: `Referrer detectado`,
          personaId: key,
          weight: val,
          timestamp: Date.now(),
        };
        signals.push(lastSignal);
        originSummary = 'Pesquisa Orgânica Externa';
      }
    });
  }

  if (!lastSignal && isReturningVisitor && (cookieCtx?.activePersona || localCtx?.activePersona)) {
    const prevPersona = cookieCtx?.activePersona || localCtx?.activePersona || 'geral';
    originSummary = 'Visitante Recorrente (Sessão Preservada)';
    lastSignal = {
      source: 'cookie',
      detail: `Retorno com preferência em ${PERSONA_CONTENTS[prevPersona].areaLabel}`,
      personaId: prevPersona,
      weight: 20,
      timestamp: Date.now(),
    };
  }

  const { persona, confidence } = pickWinningPersona(scores);

  const state: ContextState = {
    sessionId,
    activePersona: persona,
    scores,
    confidence,
    originSummary,
    lastSignal,
    signals: signals.slice(-15),
    isReturningVisitor,
  };

  writeContextCookie(state);
  await persistSessionLocally({
    sessionId,
    activePersona: persona,
    scores,
    signals: state.signals,
    updatedAt: Date.now(),
  });

  void syncTelemetrySession({
    sessionId,
    inferredPersona: persona,
    scores,
    lastSignal,
    utmTerm,
    utmSource,
    utmCampaign,
    referrer,
  });

  return state;
}

export function applyBehavioralSignal(
  prevState: ContextState,
  signal: Omit<ContextSignal, 'timestamp'>
): ContextState {
  const nextScores: PersonaScores = {
    ...prevState.scores,
    [signal.personaId]: prevState.scores[signal.personaId] + signal.weight,
  };

  const fullSignal: ContextSignal = {
    ...signal,
    timestamp: Date.now(),
  };

  const { persona, confidence } = pickWinningPersona(nextScores);
  const nextSignals = [...prevState.signals, fullSignal].slice(-15);

  const nextState: ContextState = {
    ...prevState,
    activePersona: persona,
    scores: nextScores,
    confidence,
    lastSignal: fullSignal,
    signals: nextSignals,
  };

  writeContextCookie(nextState);
  void persistSessionLocally({
    sessionId: nextState.sessionId,
    activePersona: nextState.activePersona,
    scores: nextState.scores,
    signals: nextSignals,
    updatedAt: Date.now(),
  });

  void syncTelemetrySession({
    sessionId: nextState.sessionId,
    inferredPersona: nextState.activePersona,
    scores: nextState.scores,
    lastSignal: fullSignal,
  });

  return nextState;
}

export function applySimulatedOrigin(
  prevState: ContextState,
  preset: LeadOriginPreset
): ContextState {
  // Update browser URL cleanly without page reload
  try {
    const url = new URL(window.location.href);
    if (preset.personaId === 'geral') {
      url.searchParams.delete('utm_term');
      url.searchParams.delete('utm_source');
      url.searchParams.delete('utm_campaign');
      url.searchParams.delete('area');
    } else {
      url.searchParams.set('utm_term', preset.utmTerm);
      url.searchParams.set('utm_source', preset.utmSource);
      url.searchParams.set('utm_campaign', preset.utmCampaign);
      url.searchParams.delete('area');
    }
    window.history.replaceState({}, '', url.toString());
  } catch {
    // Ignore history issues in constrained environments
  }

  const resetScores: PersonaScores = {
    geral: preset.personaId === 'geral' ? 65 : 10,
    imobiliario: preset.personaId === 'imobiliario' ? 85 : 0,
    familia: preset.personaId === 'familia' ? 85 : 0,
    trabalhista: preset.personaId === 'trabalhista' ? 85 : 0,
    previdenciario: preset.personaId === 'previdenciario' ? 85 : 0,
    consumidor: preset.personaId === 'consumidor' ? 85 : 0,
  };

  const simSignal: ContextSignal = {
    source: 'simulator',
    detail: preset.utmTerm ? `utm_term=${preset.utmTerm}` : 'Acesso Orgânico / Direto',
    personaId: preset.personaId,
    weight: 85,
    timestamp: Date.now(),
  };

  const { persona, confidence } = pickWinningPersona(resetScores);
  const nextSignals = [...prevState.signals, simSignal].slice(-15);

  const nextState: ContextState = {
    ...prevState,
    activePersona: persona,
    scores: resetScores,
    confidence,
    originSummary:
      preset.personaId === 'geral'
        ? 'Orgânico / Direto'
        : `${preset.label} (${preset.utmTerm})`,
    lastSignal: simSignal,
    signals: nextSignals,
  };

  writeContextCookie(nextState);
  void persistSessionLocally({
    sessionId: nextState.sessionId,
    activePersona: nextState.activePersona,
    scores: nextState.scores,
    signals: nextSignals,
    updatedAt: Date.now(),
  });

  void syncTelemetrySession({
    sessionId: nextState.sessionId,
    inferredPersona: nextState.activePersona,
    scores: nextState.scores,
    lastSignal: simSignal,
    utmTerm: preset.utmTerm,
    utmSource: preset.utmSource,
    utmCampaign: preset.utmCampaign,
    referrer: preset.referrerHint,
  });

  return nextState;
}

export function buildWhatsappUrl(
  whatsappNumber: string,
  lawyerName: string,
  personaId: PersonaId
): string {
  const digits = whatsappNumber.replace(/\D/g, '') || '5561998421048';
  const normalizedPhone = digits.startsWith('55') ? digits : `55${digits}`;
  const rawMessage = PERSONA_CONTENTS[personaId].whatsappPrefill;
  const customized = rawMessage.replace(/Dr\. Henrique/g, lawyerName.split(' ').slice(0, 2).join(' '));
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(customized)}`;
}
