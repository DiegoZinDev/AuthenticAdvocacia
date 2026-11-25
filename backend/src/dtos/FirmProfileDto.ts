import type { FirmProfileEntity } from '../entities/FirmProfile.js';

export interface FirmProfileDTO {
  id: number;
  lawyerName: string;
  firmName: string;
  oab: string;
  whatsapp: string;
  primaryArea: string;
  photoDataUrl: string | null;
  city: string;
  yearsExperience: number;
  casesSolvedCount: number;
  updatedAt: string;
}

export interface UpdateFirmProfileDTO {
  lawyerName?: string;
  firmName?: string;
  oab?: string;
  whatsapp?: string;
  primaryArea?: string;
  photoDataUrl?: string | null;
  city?: string;
  yearsExperience?: number;
  casesSolvedCount?: number;
}

export interface ValidationResult<T> {
  valid: boolean;
  data?: T;
  errors: string[];
}

export function mapFirmProfileEntityToDTO(entity: FirmProfileEntity): FirmProfileDTO {
  return {
    id: entity.id,
    lawyerName: entity.lawyer_name,
    firmName: entity.firm_name,
    oab: entity.oab,
    whatsapp: entity.whatsapp,
    primaryArea: entity.primary_area,
    photoDataUrl: entity.photo_data_url,
    city: entity.city,
    yearsExperience: entity.years_experience,
    casesSolvedCount: entity.cases_solved_count,
    updatedAt: entity.updated_at,
  };
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export function normalizeWhatsappNumber(raw: string): string {
  return raw.replace(/\D/g, '');
}

export function validateUpdateFirmProfileDTO(payload: unknown): ValidationResult<UpdateFirmProfileDTO> {
  const errors: string[] = [];

  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return {
      valid: false,
      errors: ['Payload inválido: esperado um objeto JSON com dados do escritório.'],
    };
  }

  const input = payload as Record<string, unknown>;
  const data: UpdateFirmProfileDTO = {};

  if ('lawyerName' in input) {
    if (!isNonEmptyString(input.lawyerName)) {
      errors.push('lawyerName deve ser uma string não vazia.');
    } else {
      data.lawyerName = input.lawyerName.trim();
    }
  }

  if ('firmName' in input) {
    if (!isNonEmptyString(input.firmName)) {
      errors.push('firmName deve ser uma string não vazia.');
    } else {
      data.firmName = input.firmName.trim();
    }
  }

  if ('oab' in input) {
    if (!isNonEmptyString(input.oab)) {
      errors.push('oab deve ser uma string não vazia (ex.: OAB/DF 48.210).');
    } else {
      data.oab = input.oab.trim();
    }
  }

  if ('whatsapp' in input) {
    if (typeof input.whatsapp !== 'string') {
      errors.push('whatsapp deve ser uma string numérica com DDI e DDD.');
    } else {
      const normalized = normalizeWhatsappNumber(input.whatsapp);
      if (normalized.length < 10 || normalized.length > 15) {
        errors.push('whatsapp deve conter entre 10 e 15 dígitos numéricos (ex.: 5561998124450).');
      } else {
        data.whatsapp = normalized;
      }
    }
  }

  if ('primaryArea' in input) {
    if (!isNonEmptyString(input.primaryArea)) {
      errors.push('primaryArea deve ser uma string não vazia.');
    } else {
      data.primaryArea = input.primaryArea.trim();
    }
  }

  if ('photoDataUrl' in input) {
    if (input.photoDataUrl === null || input.photoDataUrl === '') {
      data.photoDataUrl = null;
    } else if (typeof input.photoDataUrl !== 'string') {
      errors.push('photoDataUrl deve ser uma string URL/DataURL válida ou null.');
    } else {
      const trimmed = input.photoDataUrl.trim();
      const isValidImageRef =
        trimmed.startsWith('data:image/') ||
        trimmed.startsWith('http://') ||
        trimmed.startsWith('https://') ||
        trimmed.startsWith('/');
      if (!isValidImageRef) {
        errors.push('photoDataUrl deve iniciar com data:image/, http://, https:// ou /.');
      } else if (trimmed.length > 4_000_000) {
        errors.push('photoDataUrl excede o tamanho máximo permitido (4MB).');
      } else {
        data.photoDataUrl = trimmed;
      }
    }
  }

  if ('city' in input) {
    if (!isNonEmptyString(input.city)) {
      errors.push('city deve ser uma string não vazia.');
    } else {
      data.city = input.city.trim();
    }
  }

  if ('yearsExperience' in input) {
    const val = Number(input.yearsExperience);
    if (!Number.isInteger(val) || val < 0 || val > 80) {
      errors.push('yearsExperience deve ser um número inteiro entre 0 e 80.');
    } else {
      data.yearsExperience = val;
    }
  }

  if ('casesSolvedCount' in input) {
    const val = Number(input.casesSolvedCount);
    if (!Number.isInteger(val) || val < 0 || val > 1_000_000) {
      errors.push('casesSolvedCount deve ser um número inteiro não negativo.');
    } else {
      data.casesSolvedCount = val;
    }
  }

  if (errors.length === 0 && Object.keys(data).length === 0) {
    errors.push('Nenhum campo válido informado para atualização do perfil do escritório.');
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? data : undefined,
    errors,
  };
}
