export type PersonaId =
  | 'geral'
  | 'imobiliario'
  | 'familia'
  | 'trabalhista'
  | 'previdenciario'
  | 'consumidor'
  | 'saude'
  | 'empresarial'
  | 'criminal';

export interface LawyerProfile {
  id: string;
  lawyerName: string;
  firmName: string;
  oabNumber: string;
  whatsapp: string;
  city: string;
  primaryArea: PersonaId;
  photoUrl: string;
  experienceYears: number;
  solvedCasesCount: number;
  editorialQuote: string;
  updatedAt?: string;
}

export interface PersonaPainPoint {
  title: string;
  detail: string;
}

export interface PersonaContent {
  id: PersonaId;
  areaLabel: string;
  badgeSubtitle: string;
  eyebrow: string;
  headline: string;
  subheadline: string;
  authorityNote: string;
  painSectionTitle: string;
  painPoints: PersonaPainPoint[];
  whatsappPrefill: string;
  ctaLabel: string;
  keywords: string[];
  courtFocus: string;
}

export interface LegalCase {
  id: string;
  personaId: PersonaId;
  courtRef: string;
  processHint: string;
  title: string;
  situation: string;
  strategyAndOutcome: string;
  metricBadge: string;
  timeframe: string;
  displayOrder: number;
}

export interface PersonaScores {
  geral: number;
  imobiliario: number;
  familia: number;
  trabalhista: number;
  previdenciario: number;
  consumidor: number;
  saude: number;
  empresarial: number;
  criminal: number;
}

export interface ContextSignal {
  source:
    | 'url'
    | 'referrer'
    | 'cookie'
    | 'hover'
    | 'scroll'
    | 'dwell'
    | 'reread'
    | 'selection'
    | 'copy'
    | 'device'
    | 'temporal'
    | 'cross-intent'
    | 'click'
    | 'simulator';
  detail: string;
  personaId: PersonaId;
  weight: number;
  timestamp: number;
}

export interface NeuralTelemetrySnapshot {
  deviceLabel: string;
  connectionType: string;
  batteryLabel: string;
  batteryCritical: boolean;
  timezone: string;
  language: string;
  accessHourLabel: string;
  urgencyLevel: 'normal' | 'elevada' | 'critica';
  dwellMs: number;
  reReadCount: number;
  scrollVelocityPxSec: number;
  semanticVectorSummary: string;
  activeSignalCount: number;
}

export interface ContextState {
  sessionId: string;
  activePersona: PersonaId;
  scores: PersonaScores;
  confidence: number;
  originSummary: string;
  accessPeriod: string;
  deductionHeadline: string;
  telemetry: NeuralTelemetrySnapshot;
  lastSignal: ContextSignal | null;
  signals: ContextSignal[];
  isReturningVisitor: boolean;
}

export interface LeadOriginPreset {
  id: string;
  mode: 'direct' | 'cross-intent';
  channel: 'Google' | 'Instagram' | 'Pista Cruzada' | 'Direto';
  label: string;
  shortLabel: string;
  deductionLabel: string;
  personaId: PersonaId;
  utmTerm: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  referrerHint: string;
  expectedScore: number;
  simulatedTelemetry?: Partial<NeuralTelemetrySnapshot>;
}
