import type { DatabaseSync } from 'node:sqlite';
import type { LeadPersonaEntity } from '../entities/LeadPersona.js';
import type { UpdateLeadPersonaDTO } from '../dtos/LeadPersonaDto.js';

export interface SeedLeadPersonaInput {
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

export class LeadPersonaRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public findAll(): LeadPersonaEntity[] {
    const stmt = this.db.prepare(`
      SELECT
        id,
        slug,
        label,
        keywords_json,
        eyebrow,
        headline,
        subheadline,
        authority_statement,
        pain_points_json,
        cta_label,
        whatsapp_prefill,
        display_order
      FROM lead_personas
      ORDER BY display_order ASC, id ASC
    `);

    return stmt.all() as unknown as LeadPersonaEntity[];
  }

  public findBySlug(slug: string): LeadPersonaEntity | null {
    const stmt = this.db.prepare(`
      SELECT
        id,
        slug,
        label,
        keywords_json,
        eyebrow,
        headline,
        subheadline,
        authority_statement,
        pain_points_json,
        cta_label,
        whatsapp_prefill,
        display_order
      FROM lead_personas
      WHERE slug = ?
    `);

    const row = stmt.get(slug) as LeadPersonaEntity | undefined;
    return row ?? null;
  }

  public countAll(): number {
    const stmt = this.db.prepare(`SELECT COUNT(*) AS total FROM lead_personas`);
    const row = stmt.get() as { total: number } | undefined;
    return row ? Number(row.total) : 0;
  }

  public insertIfAbsent(input: SeedLeadPersonaInput): boolean {
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO lead_personas (
        slug,
        label,
        keywords_json,
        eyebrow,
        headline,
        subheadline,
        authority_statement,
        pain_points_json,
        cta_label,
        whatsapp_prefill,
        display_order
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.slug,
      input.label,
      JSON.stringify(input.keywords),
      input.eyebrow,
      input.headline,
      input.subheadline,
      input.authorityStatement,
      JSON.stringify(input.painPoints),
      input.ctaLabel,
      input.whatsappPrefill,
      input.displayOrder
    );

    return Number(result.changes) > 0;
  }

  public updateBySlug(slug: string, patch: UpdateLeadPersonaDTO): LeadPersonaEntity | null {
    const existing = this.findBySlug(slug);
    if (!existing) {
      return null;
    }

    const stmt = this.db.prepare(`
      UPDATE lead_personas
      SET
        label = ?,
        keywords_json = ?,
        eyebrow = ?,
        headline = ?,
        subheadline = ?,
        authority_statement = ?,
        pain_points_json = ?,
        cta_label = ?,
        whatsapp_prefill = ?,
        display_order = ?
      WHERE slug = ?
    `);

    stmt.run(
      patch.label ?? existing.label,
      patch.keywords ? JSON.stringify(patch.keywords) : existing.keywords_json,
      patch.eyebrow ?? existing.eyebrow,
      patch.headline ?? existing.headline,
      patch.subheadline ?? existing.subheadline,
      patch.authorityStatement ?? existing.authority_statement,
      patch.painPoints ? JSON.stringify(patch.painPoints) : existing.pain_points_json,
      patch.ctaLabel ?? existing.cta_label,
      patch.whatsappPrefill ?? existing.whatsapp_prefill,
      patch.displayOrder ?? existing.display_order,
      slug
    );

    return this.findBySlug(slug);
  }
}
