import type { DatabaseSync } from 'node:sqlite';
import type { FirmProfileEntity } from '../entities/FirmProfile.js';
import type { UpdateFirmProfileDTO } from '../dtos/FirmProfileDto.js';

export interface SeedFirmProfileInput {
  lawyerName: string;
  firmName: string;
  oab: string;
  whatsapp: string;
  primaryArea: string;
  photoDataUrl: string | null;
  city: string;
  yearsExperience: number;
  casesSolvedCount: number;
}

export class FirmProfileRepository {
  private readonly db: DatabaseSync;

  constructor(db: DatabaseSync) {
    this.db = db;
  }

  public findProfile(): FirmProfileEntity | null {
    const stmt = this.db.prepare(`
      SELECT
        id,
        lawyer_name,
        firm_name,
        oab,
        whatsapp,
        primary_area,
        photo_data_url,
        city,
        years_experience,
        cases_solved_count,
        updated_at
      FROM firm_profile
      WHERE id = 1
    `);

    const row = stmt.get() as FirmProfileEntity | undefined;
    return row ?? null;
  }

  public insertIfAbsent(input: SeedFirmProfileInput): boolean {
    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      INSERT OR IGNORE INTO firm_profile (
        id,
        lawyer_name,
        firm_name,
        oab,
        whatsapp,
        primary_area,
        photo_data_url,
        city,
        years_experience,
        cases_solved_count,
        updated_at
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      input.lawyerName,
      input.firmName,
      input.oab,
      input.whatsapp,
      input.primaryArea,
      input.photoDataUrl,
      input.city,
      input.yearsExperience,
      input.casesSolvedCount,
      now
    );

    return Number(result.changes) > 0;
  }

  public updateProfile(patch: UpdateFirmProfileDTO): FirmProfileEntity | null {
    const existing = this.findProfile();
    if (!existing) {
      return null;
    }

    const now = new Date().toISOString();
    const stmt = this.db.prepare(`
      UPDATE firm_profile
      SET
        lawyer_name = ?,
        firm_name = ?,
        oab = ?,
        whatsapp = ?,
        primary_area = ?,
        photo_data_url = ?,
        city = ?,
        years_experience = ?,
        cases_solved_count = ?,
        updated_at = ?
      WHERE id = 1
    `);

    stmt.run(
      patch.lawyerName ?? existing.lawyer_name,
      patch.firmName ?? existing.firm_name,
      patch.oab ?? existing.oab,
      patch.whatsapp ?? existing.whatsapp,
      patch.primaryArea ?? existing.primary_area,
      patch.photoDataUrl !== undefined ? patch.photoDataUrl : existing.photo_data_url,
      patch.city ?? existing.city,
      patch.yearsExperience ?? existing.years_experience,
      patch.casesSolvedCount ?? existing.cases_solved_count,
      now
    );

    return this.findProfile();
  }
}
