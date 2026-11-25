import type { DatabaseSync } from 'node:sqlite';
import type { VisitorSessionEntity } from '../entities/VisitorSession.js';
import type { BehaviorScoresMap } from '../dtos/VisitorSessionDto.js';

export interface SaveVisitorSessionInput {
  sessionId: string;
  inferredPersona: string;
  utmSource: string | null;
  utmCampaign: string | null;
  utmTerm: string | null;
  referrer: string | null;
  behaviorScores: BehaviorScoresMap;
}

export class VisitorSessionRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public findBySessionId(sessionId: string): VisitorSessionEntity | null {
    const stmt = this.db.prepare(`
      SELECT
        session_id,
        inferred_persona,
        utm_source,
        utm_campaign,
        utm_term,
        referrer,
        behavior_scores_json,
        updated_at
      FROM visitor_sessions
      WHERE session_id = ?
    `);

    const row = stmt.get(sessionId) as VisitorSessionEntity | undefined;
    return row ?? null;
  }

  public findRecent(limit = 20): VisitorSessionEntity[] {
    const safeLimit = Math.max(1, Math.min(200, Math.floor(limit)));
    const stmt = this.db.prepare(`
      SELECT
        session_id,
        inferred_persona,
        utm_source,
        utm_campaign,
        utm_term,
        referrer,
        behavior_scores_json,
        updated_at
      FROM visitor_sessions
      ORDER BY updated_at DESC
      LIMIT ?
    `);

    return stmt.all(safeLimit) as unknown as VisitorSessionEntity[];
  }

  public upsert(input: SaveVisitorSessionInput): VisitorSessionEntity {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT INTO visitor_sessions (
        session_id,
        inferred_persona,
        utm_source,
        utm_campaign,
        utm_term,
        referrer,
        behavior_scores_json,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        inferred_persona = excluded.inferred_persona,
        utm_source = COALESCE(excluded.utm_source, visitor_sessions.utm_source),
        utm_campaign = COALESCE(excluded.utm_campaign, visitor_sessions.utm_campaign),
        utm_term = COALESCE(excluded.utm_term, visitor_sessions.utm_term),
        referrer = COALESCE(excluded.referrer, visitor_sessions.referrer),
        behavior_scores_json = excluded.behavior_scores_json,
        updated_at = excluded.updated_at
    `);

    stmt.run(
      input.sessionId,
      input.inferredPersona,
      input.utmSource,
      input.utmCampaign,
      input.utmTerm,
      input.referrer,
      JSON.stringify(input.behaviorScores),
      now
    );

    const saved = this.findBySessionId(input.sessionId);
    if (!saved) {
      throw new Error(`Falha ao recuperar visitor_session após upsert (sessionId=${input.sessionId}).`);
    }
    return saved;
  }

  public countAll(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) AS total FROM visitor_sessions`);
    const row = stmt.get() as { total: number } | undefined;
    return row ? Number(row.total) : 0;
  }
}
