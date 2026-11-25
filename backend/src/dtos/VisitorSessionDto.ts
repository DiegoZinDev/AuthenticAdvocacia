import type { VisitorSessionEntity } from '../entities/VisitorSession.js';
import type { ValidationResult } from './FirmProfileDto.js';

export type BehaviorScoresMap = Record<string, number>;

export interface VisitorSessionDTO {
  sessionId: string;
  inferredPersona: string;
  utmSource: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  referrer: string | null;
  behaviorScores: BehaviorScoresMap;
  updatedAt: string;
}

export interface UpsertVisitorSessionDTO {
  sessionId: string;
  inferredPersona?: string;
  utmSource?: string | null;
  utmCampaign?: string | null;
  utmTerm?: string | null;
  referrer?: string | null;
  behaviorScores?: BehaviorScoresMap;
}

function safeParseScores(json: string): BehaviorScoresMap {
  try {
    const parsed: unknown = JSON.parse(json);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      const normalized: BehaviorScoresMap = {};
      for (const [key, val] of Object.entries(parsed as Record<string, unknown>)) {
        const numeric = Number(val);
        if (Number.isFinite(numeric)) {
          normalized[key] = numeric;
        }
      }
      return normalized;
    }
    return {};
  } catch {
    return {};
  }
}

export function mapVisitorSessionEntityToDTO(entity: VisitorSessionEntity): VisitorSessionDTO {
  return {
    sessionId: entity.session_id,
    inferredPersona: entity.inferred_persona,
    utmSource: entity.utm_source,
    utmCampaign: entity.utm_campaign,
    utmTerm: entity.utm_term,
    referrer: entity.referrer,
    behaviorScores: safeParseScores(entity.behavior_scores_json),
    updatedAt: entity.updated_at,
  };
}

function normalizeOptionalString(value: unknown, maxLen = 512): string | null | undefined {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, maxLen);
}

export function validateUpsertVisitorSessionDTO(payload: unknown): ValidationResult<UpsertVisitorSessionDTO> {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ['Payload inválido: esperado um objeto JSON para sessão do visitante.'],
    };
  }

  const input = payload as Record<string, unknown>;

  if (typeof input.sessionId !== 'string' || input.sessionId.trim().length < 3 || input.sessionId.trim().length > 128) {
    errors.push('sessionId é obrigatório e deve ter entre 3 e 128 caracteres.');
  }

  let inferredPersona: string | undefined;
  if ('inferredPersona' in input && input.inferredPersona !== undefined) {
    if (typeof input.inferredPersona !== 'string' || !/^[a-z0-9-]+$/.test(input.inferredPersona.trim())) {
      errors.push('inferredPersona deve conter apenas letras minúsculas, números e hífen.');
    } else {
      inferredPersona = input.inferredPersona.trim();
    }
  }

  const optionalFields = ['utmSource', 'utmCampaign', 'utmTerm', 'referrer'] as const;
  for (const field of optionalFields) {
    if (field in input && input[field] !== null && input[field] !== undefined && typeof input[field] !== 'string') {
      errors.push(`${field} deve ser uma string ou null.`);
    }
  }

  let behaviorScores: BehaviorScoresMap | undefined;
  if ('behaviorScores' in input && input.behaviorScores !== undefined) {
    if (!input.behaviorScores || typeof input.behaviorScores !== 'object' || Array.isArray(input.behaviorScores)) {
      errors.push('behaviorScores deve ser um objeto mapa { [personaSlug]: number }.');
    } else {
      const sanitized: BehaviorScoresMap = {};
      for (const [key, val] of Object.entries(input.behaviorScores as Record<string, unknown>)) {
        const numeric = Number(val);
        if (!/^[a-z0-9_-]+$/i.test(key)) {
          errors.push(`Chave inválida em behaviorScores: ${key}.`);
          break;
        }
        if (!Number.isFinite(numeric) || numeric < 0 || numeric > 1_000_000) {
          errors.push(`Score inválido em behaviorScores para "${key}": deve ser número finito >= 0.`);
          break;
        }
        sanitized[key.toLowerCase()] = Math.round(numeric * 100) / 100;
      }
      behaviorScores = sanitized;
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      sessionId: (input.sessionId as string).trim(),
      inferredPersona,
      utmSource: normalizeOptionalString(input.utmSource, 256),
      utmCampaign: normalizeOptionalString(input.utmCampaign, 256),
      utmTerm: normalizeOptionalString(input.utmTerm, 256),
      referrer: normalizeOptionalString(input.referrer, 1024),
      behaviorScores,
    },
    errors: [],
  };
}
