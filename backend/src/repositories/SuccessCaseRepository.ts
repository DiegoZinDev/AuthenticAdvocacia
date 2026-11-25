import type { DatabaseSync } from 'node:sqlite';
import type { SuccessCaseEntity } from '../entities/SuccessCase.js';
import type { CreateSuccessCaseDTO } from '../dtos/LeadPersonaDto.js';

export class SuccessCaseRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public findAll(): SuccessCaseEntity[] {
    const stmt = this.db.prepare(`
      SELECT
        id,
        persona_slug,
        title,
        situation,
        outcome,
        metric_badge,
        timeframe,
        court_ref
      FROM success_cases
      ORDER BY id ASC
    `);

    return stmt.all() as unknown as SuccessCaseEntity[];
  }

  public findByPersonaSlug(personaSlug: string): SuccessCaseEntity[] {
    const stmt = this.db.prepare(`
      SELECT
        id,
        persona_slug,
        title,
        situation,
        outcome,
        metric_badge,
        timeframe,
        court_ref
      FROM success_cases
      WHERE persona_slug = ?
      ORDER BY id ASC
    `);

    return stmt.all(personaSlug) as unknown as SuccessCaseEntity[];
  }

  public findById(id: number): SuccessCaseEntity | null {
    const stmt = this.db.prepare(`
      SELECT
        id,
        persona_slug,
        title,
        situation,
        outcome,
        metric_badge,
        timeframe,
        court_ref
      FROM success_cases
      WHERE id = ?
    `);

    const row = stmt.get(id) as SuccessCaseEntity | undefined;
    return row ?? null;
  }

  public countAll(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) AS total FROM success_cases`);
    const row = stmt.get() as { total: number } | undefined;
    return row ? Number(row.total) : 0;
  }

  public countByPersonaSlug(personaSlug: string): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) AS total FROM success_cases WHERE persona_slug = ?`);
    const row = stmt.get(personaSlug) as { total: number } | undefined;
    return row ? Number(row.total) : 0;
  }

  public existsByPersonaAndTitle(personaSlug: string, title: string): boolean {
    const stmt = this.db.prepare(`
      SELECT 1 AS found
      FROM success_cases
      WHERE persona_slug = ? AND title = ?
      LIMIT 1
    `);

    return Boolean(stmt.get(personaSlug, title));
  }

  public create(input: CreateSuccessCaseDTO): SuccessCaseEntity {
    const stmt = this.db.prepare(`
      INSERT INTO success_cases (
        persona_slug,
        title,
        situation,
        outcome,
        metric_badge,
        timeframe,
        court_ref
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.personaSlug,
      input.title,
      input.situation,
      input.outcome,
      input.metricBadge,
      input.timeframe,
      input.courtRef
    );

    const insertedId = Number(result.lastInsertRowid);
    const created = this.findById(insertedId);
    if (!created) {
      throw new Error(`Falha ao recuperar success_case recém-criado (id=${insertedId}).`);
    }
    return created;
  }

  public insertIfAbsent(input: CreateSuccessCaseDTO): boolean {
    if (this.existsByPersonaAndTitle(input.personaSlug, input.title)) {
      return false;
    }

    this.create(input);
    return true;
  }

  public deleteById(id: number): boolean {
    const stmt = this.db.prepare(`DELETE FROM success_cases WHERE id = ?`);
    const result = stmt.run(id);
    return Number(result.changes) > 0;
  }
}
