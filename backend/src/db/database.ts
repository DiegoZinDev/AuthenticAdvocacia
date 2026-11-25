import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_DB_DIR = path.resolve(__dirname, '../../data');
const DEFAULT_DB_PATH = path.join(DEFAULT_DB_DIR, 'advocacia.sqlite');

let dbInstance: DatabaseSync | null = null;
let migrationsApplied = false;

function ensureDirectoryExists(filePath: string): void {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function runMigrations(db: DatabaseSync): void {
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS firm_profile (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      lawyer_name TEXT NOT NULL,
      firm_name TEXT NOT NULL,
      oab TEXT NOT NULL,
      whatsapp TEXT NOT NULL,
      primary_area TEXT NOT NULL,
      photo_data_url TEXT,
      city TEXT NOT NULL,
      years_experience INTEGER NOT NULL DEFAULT 14,
      cases_solved_count INTEGER NOT NULL DEFAULT 420,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS lead_personas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      slug TEXT NOT NULL UNIQUE,
      label TEXT NOT NULL,
      keywords_json TEXT NOT NULL,
      eyebrow TEXT NOT NULL,
      headline TEXT NOT NULL,
      subheadline TEXT NOT NULL,
      authority_statement TEXT NOT NULL,
      pain_points_json TEXT NOT NULL,
      cta_label TEXT NOT NULL,
      whatsapp_prefill TEXT NOT NULL,
      display_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS success_cases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      persona_slug TEXT NOT NULL REFERENCES lead_personas(slug) ON DELETE CASCADE,
      title TEXT NOT NULL,
      situation TEXT NOT NULL,
      outcome TEXT NOT NULL,
      metric_badge TEXT NOT NULL,
      timeframe TEXT NOT NULL,
      court_ref TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS visitor_sessions (
      session_id TEXT PRIMARY KEY,
      inferred_persona TEXT NOT NULL,
      utm_source TEXT,
      utm_campaign TEXT,
      utm_term TEXT,
      referrer TEXT,
      behavior_scores_json TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_lead_personas_display_order
      ON lead_personas(display_order, id);

    CREATE INDEX IF NOT EXISTS idx_success_cases_persona_slug
      ON success_cases(persona_slug, id);

    CREATE INDEX IF NOT EXISTS idx_visitor_sessions_updated_at
      ON visitor_sessions(updated_at DESC);
  `);
}

export function getDatabase(dbPath: string = process.env.ADVOCACIA_DB_PATH || DEFAULT_DB_PATH): DatabaseSync {
  if (!dbInstance) {
    ensureDirectoryExists(dbPath);
    dbInstance = new DatabaseSync(dbPath);
    dbInstance.exec('PRAGMA journal_mode = WAL;');
    dbInstance.exec('PRAGMA foreign_keys = ON;');
  }

  if (!migrationsApplied) {
    runMigrations(dbInstance);
    migrationsApplied = true;
  }

  return dbInstance;
}

export function closeDatabase(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    migrationsApplied = false;
  }
}

export { DEFAULT_DB_PATH };
