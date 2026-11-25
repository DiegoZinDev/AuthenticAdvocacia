import type { LeadPersonaEntity } from '../entities/LeadPersona.js';
import type { SuccessCaseEntity } from '../entities/SuccessCase.js';
import type { ValidationResult } from './FirmProfileDto.js';

export interface SuccessCaseDTO {
  id: number;
  personaSlug: string;
  title: string;
  situation: string;
  outcome: string;
  metricBadge: string;
  timeframe: string;
  courtRef: string;
}

export interface LeadPersonaDTO {
  id: number;
  slug: string;
  label: string;
  keywords: string[];
  eyebrow: string;
  headline: string;
  subheadline: string;
  authorityStatement: string;
  painPoints: string[];
  ctaLabel: string;
  whatsappPrefill: string;
  displayOrder: number;
}

export interface LeadPersonaWithCasesDTO {
  id: number;
  slug: string;
  label: string;
  keywords: string[];
  eyebrow: string;
  headline: string;
  subheadline: string;
  authorityStatement: string;
  painPoints: string[];
  ctaLabel: string;
  whatsappPrefill: string;
  successCases: SuccessCaseDTO[];
}

export interface CreateSuccessCaseDTO {
  personaSlug: string;
  title: string;
  situation: string;
  outcome: string;
  metricBadge: string;
  timeframe: string;
  courtRef: string;
}

export interface UpdateLeadPersonaDTO {
  label?: string;
  keywords?: string[];
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  authorityStatement?: string;
  painPoints?: string[];
  ctaLabel?: string;
  whatsappPrefill?: string;
  displayOrder?: number;
}

function safeParseStringArray(json: string): string[] {
  try {
    const parsed: unknown = JSON.parse(json);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
    return [];
  } catch {
    return [];
  }
}

export function mapSuccessCaseEntityToDTO(entity: SuccessCaseEntity): SuccessCaseDTO {
  return {
    id: entity.id,
    personaSlug: entity.persona_slug,
    title: entity.title,
    situation: entity.situation,
    outcome: entity.outcome,
    metricBadge: entity.metric_badge,
    timeframe: entity.timeframe,
    courtRef: entity.court_ref,
  };
}

export function mapLeadPersonaEntityToDTO(entity: LeadPersonaEntity): LeadPersonaDTO {
  return {
    id: entity.id,
    slug: entity.slug,
    label: entity.label,
    keywords: safeParseStringArray(entity.keywords_json),
    eyebrow: entity.eyebrow,
    headline: entity.headline,
    subheadline: entity.subheadline,
    authorityStatement: entity.authority_statement,
    painPoints: safeParseStringArray(entity.pain_points_json),
    ctaLabel: entity.cta_label,
    whatsappPrefill: entity.whatsapp_prefill,
    displayOrder: entity.display_order,
  };
}

export function mapLeadPersonaWithCasesToDTO(
  entity: LeadPersonaEntity,
  cases: SuccessCaseEntity[]
): LeadPersonaWithCasesDTO {
  const base = mapLeadPersonaEntityToDTO(entity);
  return {
    id: base.id,
    slug: base.slug,
    label: base.label,
    keywords: base.keywords,
    eyebrow: base.eyebrow,
    headline: base.headline,
    subheadline: base.subheadline,
    authorityStatement: base.authorityStatement,
    painPoints: base.painPoints,
    ctaLabel: base.ctaLabel,
    whatsappPrefill: base.whatsappPrefill,
    successCases: cases.map(mapSuccessCaseEntityToDTO),
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string' && item.trim().length > 0);
}

export function validatePersonaSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug.trim()) && slug.trim().length <= 64;
}

export function validateUpdateLeadPersonaDTO(payload: unknown): ValidationResult<UpdateLeadPersonaDTO> {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ['Payload inválido: esperado um objeto JSON para atualização da persona.'],
    };
  }

  const input = payload as Record<string, unknown>;
  const data: UpdateLeadPersonaDTO = {};

  const stringFields: Array<keyof Pick<
    UpdateLeadPersonaDTO,
    'label' | 'eyebrow' | 'headline' | 'subheadline' | 'authorityStatement' | 'ctaLabel' | 'whatsappPrefill'
  >> = ['label', 'eyebrow', 'headline', 'subheadline', 'authorityStatement', 'ctaLabel', 'whatsappPrefill'];

  for (const field of stringFields) {
    if (field in input) {
      const value = input[field];
      if (!isNonEmptyString(value)) {
        errors.push(`${field} deve ser uma string não vazia.`);
      } else {
        data[field] = value.trim();
      }
    }
  }

  if ('keywords' in input) {
    if (!isStringArray(input.keywords)) {
      errors.push('keywords deve ser um array de strings não vazias.');
    } else {
      data.keywords = input.keywords.map((item) => item.trim().toLowerCase());
    }
  }

  if ('painPoints' in input) {
    if (!isStringArray(input.painPoints)) {
      errors.push('painPoints deve ser um array de strings não vazias.');
    } else {
      data.painPoints = input.painPoints.map((item) => item.trim());
    }
  }

  if ('displayOrder' in input) {
    const val = Number(input.displayOrder);
    if (!Number.isInteger(val) || val < 0 || val > 1000) {
      errors.push('displayOrder deve ser um inteiro entre 0 e 1000.');
    } else {
      data.displayOrder = val;
    }
  }

  if (errors.length === 0 && Object.keys(data).length === 0) {
    errors.push('Nenhum campo válido informado para atualização da persona.');
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors,
  };
}

export function validateCreateSuccessCaseDTO(payload: unknown): ValidationResult<CreateSuccessCaseDTO> {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ['Payload inválido: esperado um objeto JSON com os dados do caso de sucesso.'],
    };
  }

  const input = payload as Record<string, unknown>;

  if (!validatePersonaSlug(input.personaSlug)) {
    errors.push('personaSlug inválido: use apenas letras minúsculas, números e hífen.');
  }
  if (!isNonEmptyString(input.title)) {
    errors.push('title é obrigatório e deve ser uma string não vazia.');
  }
  if (!isNonEmptyString(input.situation)) {
    errors.push('situation é obrigatório e deve ser uma string não vazia.');
  }
  if (!isNonEmptyString(input.outcome)) {
    errors.push('outcome é obrigatório e deve ser uma string não vazia.');
  }
  if (!isNonEmptyString(input.metricBadge)) {
    errors.push('metricBadge é obrigatório e deve ser uma string não vazia.');
  }
  if (!isNonEmptyString(input.timeframe)) {
    errors.push('timeframe é obrigatório e deve ser uma string não vazia.');
  }
  if (!isNonEmptyString(input.courtRef)) {
    errors.push('courtRef é obrigatório e deve ser uma string não vazia.');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    data: {
      personaSlug: (input.personaSlug as string).trim().toLowerCase(),
      title: (input.title as string).trim(),
      situation: (input.situation as string).trim(),
      outcome: (input.outcome as string).trim(),
      metricBadge: (input.metricBadge as string).trim(),
      timeframe: (input.timeframe as string).trim(),
      courtRef: (input.courtRef as string).trim(),
    },
    errors: [],
  };
}
