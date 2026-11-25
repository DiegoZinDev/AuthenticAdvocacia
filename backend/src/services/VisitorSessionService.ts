import {
  mapVisitorSessionEntityToDTO,
  validateUpsertVisitorSessionDTO,
  type BehaviorScoresMap,
  type VisitorSessionDTO,
} from '../dtos/VisitorSessionDto.js';
import { LeadPersonaRepository } from '../repositories/LeadPersonaRepository.js';
import { VisitorSessionRepository } from '../repositories/VisitorSessionRepository.js';
import { AppError } from './AppError.js';

const DEFAULT_PERSONA_SLUG = 'organico';

export class VisitorSessionService {
  private readonly visitorSessionRepository: VisitorSessionRepository;
  private readonly leadPersonaRepository: LeadPersonaRepository;

  constructor(
    visitorSessionRepository: VisitorSessionRepository,
    leadPersonaRepository: LeadPersonaRepository
  ) {
    this.visitorSessionRepository = visitorSessionRepository;
    this.leadPersonaRepository = leadPersonaRepository;
  }

  public upsertSession(payload: unknown): VisitorSessionDTO {
    const normalizedPayload = this.normalizeIncomingPayload(payload);
    const validation = validateUpsertVisitorSessionDTO(normalizedPayload);

    if (!validation.valid || !validation.data) {
      throw new AppError(400, validation.errors.join(' '), validation.errors);
    }

    const dto = validation.data;
    const existing = this.visitorSessionRepository.findBySessionId(dto.sessionId);

    const behaviorScores = this.resolveBehaviorScores(
      dto.behaviorScores,
      existing ? mapVisitorSessionEntityToDTO(existing).behaviorScores : {}
    );

    const inferredPersona = this.resolveInferredPersona(
      dto.inferredPersona,
      behaviorScores,
      existing?.inferred_persona
    );

    const saved = this.visitorSessionRepository.upsert({
      sessionId: dto.sessionId,
      inferredPersona,
      utmSource: dto.utmSource ?? null,
      utmCampaign: dto.utmCampaign ?? null,
      utmTerm: dto.utmTerm ?? null,
      referrer: dto.referrer ?? null,
      behaviorScores,
    });

    return mapVisitorSessionEntityToDTO(saved);
  }

  public getSessionById(rawSessionId: string): VisitorSessionDTO {
    const sessionId = rawSessionId.trim();
    if (sessionId.length < 3 || sessionId.length > 128) {
      throw new AppError(400, 'sessionId inválido: deve conter entre 3 e 128 caracteres.');
    }

    const entity = this.visitorSessionRepository.findBySessionId(sessionId);
    if (!entity) {
      throw new AppError(404, `Sessão de visitante não encontrada para sessionId "${sessionId}".`);
    }

    return mapVisitorSessionEntityToDTO(entity);
  }

  private normalizeIncomingPayload(payload: unknown): unknown {
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return payload;
    }

    const raw = payload as Record<string, unknown>;
    const normalized: Record<string, unknown> = { ...raw };

    if (!('behaviorScores' in normalized) && 'scores' in raw) {
      normalized.behaviorScores = raw.scores;
    }

    if (typeof normalized.inferredPersona === 'string') {
      const lowered = normalized.inferredPersona.trim().toLowerCase();
      normalized.inferredPersona = lowered === 'geral' ? DEFAULT_PERSONA_SLUG : lowered;
    }

    return normalized;
  }

  private resolveBehaviorScores(
    incoming: BehaviorScoresMap | undefined,
    existing: BehaviorScoresMap
  ): BehaviorScoresMap {
    const source = incoming ?? existing;
    const normalized: BehaviorScoresMap = {};

    for (const [key, value] of Object.entries(source)) {
      const mappedKey = key === 'geral' ? DEFAULT_PERSONA_SLUG : key;
      normalized[mappedKey] = Math.max(normalized[mappedKey] ?? 0, value);
    }

    return normalized;
  }

  private resolveInferredPersona(
    explicitPersona: string | undefined,
    scores: BehaviorScoresMap,
    existingPersona: string | undefined
  ): string {
    if (explicitPersona) {
      const matched = this.leadPersonaRepository.findBySlug(explicitPersona);
      if (matched) {
        return matched.slug;
      }
      throw new AppError(400, `inferredPersona "${explicitPersona}" não corresponde a uma persona válida.`);
    }

    let bestSlug: string | null = null;
    let bestScore = -1;

    for (const [slug, score] of Object.entries(scores)) {
      if (score > bestScore && this.leadPersonaRepository.findBySlug(slug)) {
        bestScore = score;
        bestSlug = slug;
      }
    }

    if (bestSlug) {
      return bestSlug;
    }

    if (existingPersona) {
      return existingPersona;
    }

    return DEFAULT_PERSONA_SLUG;
  }
}
