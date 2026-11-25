import {
  mapFirmProfileEntityToDTO,
  validateUpdateFirmProfileDTO,
  type FirmProfileDTO,
  type UpdateFirmProfileDTO,
} from '../dtos/FirmProfileDto.js';
import { FirmProfileRepository } from '../repositories/FirmProfileRepository.js';
import { AppError } from './AppError.js';

export class FirmProfileService {
  private readonly firmProfileRepository: FirmProfileRepository;

  constructor(firmProfileRepository: FirmProfileRepository) {
    this.firmProfileRepository = firmProfileRepository;
  }

  public getProfile(): FirmProfileDTO {
    const entity = this.firmProfileRepository.findProfile();
    if (!entity) {
      throw new AppError(404, 'Perfil do escritório não encontrado.');
    }
    return mapFirmProfileEntityToDTO(entity);
  }

  public updateProfile(payload: unknown): FirmProfileDTO {
    const normalizedInput = this.normalizeIncomingPayload(payload);
    const validation = validateUpdateFirmProfileDTO(normalizedInput);

    if (!validation.valid || !validation.data) {
      throw new AppError(
        400,
        validation.errors.join(' '),
        validation.errors
      );
    }

    const updated = this.firmProfileRepository.updateProfile(validation.data);
    if (!updated) {
      throw new AppError(404, 'Perfil do escritório não encontrado para atualização.');
    }

    return mapFirmProfileEntityToDTO(updated);
  }

  private normalizeIncomingPayload(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return payload;
    }

    const raw = payload as Record<string, unknown>;
    const normalized: Record<string, unknown> = {};

    const mappedKeys: Array<keyof UpdateFirmProfileDTO> = [
      'lawyerName',
      'firmName',
      'oab',
      'whatsapp',
      'primaryArea',
      'photoDataUrl',
      'city',
      'yearsExperience',
      'casesSolvedCount',
    ];

    for (const key of mappedKeys) {
      if (key in raw) {
        normalized[key] = raw[key];
      }
    }

    if (!('oab' in normalized) && 'oabNumber' in raw) {
      normalized.oab = raw.oabNumber;
    }

    if (!('photoDataUrl' in normalized) && 'photoUrl' in raw) {
      normalized.photoDataUrl = raw.photoUrl;
    }

    if (!('yearsExperience' in normalized) && 'experienceYears' in raw) {
      normalized.yearsExperience = raw.experienceYears;
    }

    if (!('casesSolvedCount' in normalized) && 'solvedCasesCount' in raw) {
      normalized.casesSolvedCount = raw.solvedCasesCount;
    }

    return normalized;
  }
}
