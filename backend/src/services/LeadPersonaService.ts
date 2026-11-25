import {
  mapLeadPersonaWithCasesToDTO,
  mapSuccessCaseEntityToDTO,
  validatePersonaSlug,
  validateUpdateLeadPersonaDTO,
  type LeadPersonaWithCasesDTO,
  type SuccessCaseDTO,
} from '../dtos/LeadPersonaDto.js';
import type { SuccessCaseEntity } from '../entities/SuccessCase.js';
import { LeadPersonaRepository } from '../repositories/LeadPersonaRepository.js';
import { SuccessCaseRepository } from '../repositories/SuccessCaseRepository.js';
import { AppError } from './AppError.js';

export class LeadPersonaService {
  private readonly leadPersonaRepository: LeadPersonaRepository;
  private readonly successCaseRepository: SuccessCaseRepository;

  constructor(
    leadPersonaRepository: LeadPersonaRepository,
    successCaseRepository: SuccessCaseRepository
  ) {
    this.leadPersonaRepository = leadPersonaRepository;
    this.successCaseRepository = successCaseRepository;
  }

  public listPersonasWithCases(): LeadPersonaWithCasesDTO[] {
    const personas = this.leadPersonaRepository.findAll();
    const allCases = this.successCaseRepository.findAll();

    const casesBySlug = new Map<string, SuccessCaseEntity[]>();
    for (const successCase of allCases) {
      const list = casesBySlug.get(successCase.persona_slug) ?? [];
      list.push(successCase);
      casesBySlug.set(successCase.persona_slug, list);
    }

    return personas.map((persona) =>
      mapLeadPersonaWithCasesToDTO(persona, casesBySlug.get(persona.slug) ?? [])
    );
  }

  public getPersonaBySlug(rawSlug: string): LeadPersonaWithCasesDTO {
    const slug = this.normalizeAndValidateSlug(rawSlug);
    const persona = this.leadPersonaRepository.findBySlug(slug);
    if (!persona) {
      throw new AppError(404, `Persona jurídica não encontrada para o slug "${slug}".`);
    }

    const cases = this.successCaseRepository.findByPersonaSlug(persona.slug);
    return mapLeadPersonaWithCasesToDTO(persona, cases);
  }

  public listCasesByPersona(rawSlug?: string): SuccessCaseDTO[] {
    if (!rawSlug) {
      return this.successCaseRepository.findAll().map(mapSuccessCaseEntityToDTO);
    }

    const slug = this.normalizeAndValidateSlug(rawSlug);
    const persona = this.leadPersonaRepository.findBySlug(slug);
    if (!persona) {
      throw new AppError(404, `Persona jurídica não encontrada para o slug "${slug}".`);
    }

    return this.successCaseRepository
      .findByPersonaSlug(persona.slug)
      .map(mapSuccessCaseEntityToDTO);
  }

  public updatePersonaBySlug(rawSlug: string, payload: unknown): LeadPersonaWithCasesDTO {
    const slug = this.normalizeAndValidateSlug(rawSlug);
    const validation = validateUpdateLeadPersonaDTO(payload);

    if (!validation.valid || !validation.data) {
      throw new AppError(400, validation.errors.join(' '), validation.errors);
    }

    const updated = this.leadPersonaRepository.updateBySlug(slug, validation.data);
    if (!updated) {
      throw new AppError(404, `Persona jurídica não encontrada para o slug "${slug}".`);
    }

    const cases = this.successCaseRepository.findByPersonaSlug(updated.slug);
    return mapLeadPersonaWithCasesToDTO(updated, cases);
  }

  private normalizeAndValidateSlug(rawSlug: string): string {
    const normalized = rawSlug.trim().toLowerCase();
    const mappedSlug = normalized === 'geral' ? 'organico' : normalized;

    if (!validatePersonaSlug(mappedSlug)) {
      throw new AppError(
        400,
        'Slug de persona inválido: use apenas letras minúsculas, números e hífen (máx. 64 caracteres).'
      );
    }

    return mappedSlug;
  }
}
