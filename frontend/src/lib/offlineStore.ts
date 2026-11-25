import {
  DEFAULT_LAWYER_PROFILE,
  LEGAL_CASES,
  PERSONA_CONTENTS,
} from '../data/seeds';
import type {
  ContextSignal,
  LawyerProfile,
  LegalCase,
  PersonaContent,
  PersonaId,
  PersonaScores,
} from '../types/legal';

const DB_NAME = 'adv_autoseller_offline_v1';
const DB_VERSION = 1;
const STORE_PROFILE = 'profile';
const STORE_PERSONAS = 'personas';
const STORE_CASES = 'cases';
const STORE_TELEMETRY = 'telemetry_queue';

const LS_PROFILE_KEY = 'adv_autoseller_profile_v1';
const LS_TELEMETRY_KEY = 'adv_autoseller_telemetry_v1';
const LS_CTX_KEY = 'adv_autoseller_ctx_v1';

export interface PersistedSessionRecord {
  sessionId: string;
  activePersona: PersonaId;
  scores: PersonaScores;
  signals: ContextSignal[];
  updatedAt: number;
}

function openOfflineDb(): Promise<IDBDatabase | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    try {
      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_PROFILE)) {
          db.createObjectStore(STORE_PROFILE, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_PERSONAS)) {
          db.createObjectStore(STORE_PERSONAS, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_CASES)) {
          db.createObjectStore(STORE_CASES, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORE_TELEMETRY)) {
          db.createObjectStore(STORE_TELEMETRY, { keyPath: 'sessionId' });
        }
      };

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGet<T>(storeName: string, key: string): Promise<T | null> {
  const db = await openOfflineDb();
  if (!db) return null;

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
      req.onerror = () => resolve(null);
    } catch {
      resolve(null);
    }
  });
}

async function idbGetAll<T>(storeName: string): Promise<T[]> {
  const db = await openOfflineDb();
  if (!db) return [];

  return new Promise((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => resolve((req.result as T[]) ?? []);
      req.onerror = () => resolve([]);
    } catch {
      resolve([]);
    }
  });
}

async function idbPut<T>(storeName: string, value: T): Promise<void> {
  const db = await openOfflineDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    try {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      store.put(value);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    } catch {
      resolve();
    }
  });
}

export async function ensureSeededOfflineStore(): Promise<void> {
  try {
    const existingProfile = await idbGet<LawyerProfile>(STORE_PROFILE, 'default');
    if (!existingProfile) {
      const lsRaw = localStorage.getItem(LS_PROFILE_KEY);
      const initial = lsRaw
        ? { ...DEFAULT_LAWYER_PROFILE, ...(JSON.parse(lsRaw) as Partial<LawyerProfile>) }
        : DEFAULT_LAWYER_PROFILE;
      await idbPut(STORE_PROFILE, initial);
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(initial));
    }

    const existingPersonas = await idbGetAll<PersonaContent>(STORE_PERSONAS);
    if (existingPersonas.length === 0) {
      for (const persona of Object.values(PERSONA_CONTENTS)) {
        await idbPut(STORE_PERSONAS, persona);
      }
    }

    const existingCases = await idbGetAll<LegalCase>(STORE_CASES);
    if (existingCases.length === 0) {
      for (const legalCase of LEGAL_CASES) {
        await idbPut(STORE_CASES, legalCase);
      }
    }
  } catch {
    // Graceful fallback: localStorage + static seeds still operate seamlessly
  }
}

const PERSONA_TO_BACKEND_SLUG: Record<PersonaId, string> = {
  geral: 'organico',
  imobiliario: 'imobiliario',
  familia: 'familia',
  trabalhista: 'trabalhista',
  previdenciario: 'previdenciario',
  consumidor: 'consumidor',
  saude: 'saude',
  empresarial: 'empresarial',
  criminal: 'criminal',
};

function mapProfileFromApi(raw: Record<string, unknown>): LawyerProfile {
  const rawArea = String(raw.primaryArea ?? '').toLowerCase();
  const inferredPrimaryArea: PersonaId = rawArea.includes('fam')
    ? 'familia'
    : rawArea.includes('trab')
      ? 'trabalhista'
      : rawArea.includes('prev')
        ? 'previdenciario'
        : rawArea.includes('cons')
          ? 'consumidor'
          : rawArea.includes('saud') || rawArea.includes('med')
            ? 'saude'
            : rawArea.includes('empr') || rawArea.includes('soc')
              ? 'empresarial'
              : rawArea.includes('crim') || rawArea.includes('penal')
                ? 'criminal'
                : rawArea.includes('imob')
                  ? 'imobiliario'
                  : DEFAULT_LAWYER_PROFILE.primaryArea;

  return {
    ...DEFAULT_LAWYER_PROFILE,
    id: 'default',
    lawyerName: String(raw.lawyerName ?? DEFAULT_LAWYER_PROFILE.lawyerName),
    firmName: String(raw.firmName ?? DEFAULT_LAWYER_PROFILE.firmName),
    oabNumber: String(raw.oab ?? raw.oabNumber ?? DEFAULT_LAWYER_PROFILE.oabNumber),
    whatsapp: String(raw.whatsapp ?? DEFAULT_LAWYER_PROFILE.whatsapp),
    city: String(raw.city ?? DEFAULT_LAWYER_PROFILE.city),
    primaryArea: inferredPrimaryArea,
    photoUrl:
      typeof raw.photoDataUrl === 'string' && raw.photoDataUrl.trim().length > 0
        ? raw.photoDataUrl
        : typeof raw.photoUrl === 'string' && raw.photoUrl.trim().length > 0
          ? raw.photoUrl
          : DEFAULT_LAWYER_PROFILE.photoUrl,
    experienceYears: Number(raw.yearsExperience ?? raw.experienceYears ?? DEFAULT_LAWYER_PROFILE.experienceYears),
    solvedCasesCount: Number(
      raw.casesSolvedCount ?? raw.solvedCasesCount ?? DEFAULT_LAWYER_PROFILE.solvedCasesCount
    ),
    updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : new Date().toISOString(),
  };
}

export async function loadProfileWithFallback(): Promise<{
  profile: LawyerProfile;
  source: 'api' | 'offline';
}> {
  await ensureSeededOfflineStore();

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1600);
    const response = await fetch('/api/profile', { signal: controller.signal });
    window.clearTimeout(timer);

    if (response.ok) {
      const data = (await response.json()) as Record<string, unknown>;
      const raw = (data.profile as Record<string, unknown> | undefined) ?? data;
      const merged = mapProfileFromApi(raw);
      await idbPut(STORE_PROFILE, merged);
      localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(merged));
      return { profile: merged, source: 'api' };
    }
  } catch {
    // Offline or backend not running — fall back cleanly to IndexedDB / localStorage
  }

  const fromIdb = await idbGet<LawyerProfile>(STORE_PROFILE, 'default');
  if (fromIdb) {
    return { profile: { ...DEFAULT_LAWYER_PROFILE, ...fromIdb }, source: 'offline' };
  }

  try {
    const lsRaw = localStorage.getItem(LS_PROFILE_KEY);
    if (lsRaw) {
      return {
        profile: { ...DEFAULT_LAWYER_PROFILE, ...(JSON.parse(lsRaw) as Partial<LawyerProfile>) },
        source: 'offline',
      };
    }
  } catch {
    // Ignore parse error
  }

  return { profile: DEFAULT_LAWYER_PROFILE, source: 'offline' };
}

export async function saveProfileWithFallback(
  profile: LawyerProfile
): Promise<{ profile: LawyerProfile; synced: boolean }> {
  const normalized: LawyerProfile = {
    ...DEFAULT_LAWYER_PROFILE,
    ...profile,
    id: 'default',
    updatedAt: new Date().toISOString(),
  };

  await idbPut(STORE_PROFILE, normalized);
  try {
    localStorage.setItem(LS_PROFILE_KEY, JSON.stringify(normalized));
  } catch {
    // Handle quota exceeded gracefully if custom base64 photo is large
  }

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 2000);
    const apiPayload = {
      lawyerName: normalized.lawyerName,
      firmName: normalized.firmName,
      oab: normalized.oabNumber,
      whatsapp: normalized.whatsapp,
      primaryArea: normalized.primaryArea,
      photoDataUrl: normalized.photoUrl.startsWith('data:') ? normalized.photoUrl : null,
      city: normalized.city,
      yearsExperience: normalized.experienceYears,
      casesSolvedCount: normalized.solvedCasesCount,
    };
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(apiPayload),
      signal: controller.signal,
    });
    window.clearTimeout(timer);

    if (response.ok) {
      return { profile: normalized, synced: true };
    }
  } catch {
    // Offline mode: persisted in IndexedDB + localStorage
  }

  return { profile: normalized, synced: false };
}

export async function resetProfileWithFallback(): Promise<{
  profile: LawyerProfile;
  synced: boolean;
}> {
  return saveProfileWithFallback(DEFAULT_LAWYER_PROFILE);
}

export async function getCasesForPersona(personaId: PersonaId): Promise<LegalCase[]> {
  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1400);
    const slug = PERSONA_TO_BACKEND_SLUG[personaId] ?? 'organico';
    const response = await fetch(`/api/personas/${encodeURIComponent(slug)}`, {
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    if (response.ok) {
      const payload = (await response.json()) as {
        successCases?: Array<{
          id: number | string;
          personaSlug: string;
          title: string;
          situation: string;
          outcome: string;
          metricBadge: string;
          timeframe: string;
          courtRef: string;
        }>;
      };
      if (Array.isArray(payload.successCases) && payload.successCases.length > 0) {
        return payload.successCases.slice(0, 3).map((c, idx) => ({
          id: String(c.id),
          personaId,
          courtRef: c.courtRef,
          processHint: c.courtRef,
          title: c.title,
          situation: c.situation,
          strategyAndOutcome: c.outcome,
          metricBadge: c.metricBadge,
          timeframe: c.timeframe,
          displayOrder: idx + 1,
        }));
      }
    }
  } catch {
    // Fallback to IndexedDB / local seeds
  }

  const idbCases = await idbGetAll<LegalCase>(STORE_CASES);
  const source = idbCases.length > 0 ? idbCases : LEGAL_CASES;
  return source
    .filter((item) => item.personaId === personaId)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 3);
}

export async function loadPersistedSession(): Promise<PersistedSessionRecord | null> {
  try {
    const lsRaw = localStorage.getItem(LS_CTX_KEY);
    if (lsRaw) {
      return JSON.parse(lsRaw) as PersistedSessionRecord;
    }
  } catch {
    // Continue to IndexedDB
  }

  const fromIdb = await idbGet<PersistedSessionRecord>(STORE_TELEMETRY, 'current');
  return fromIdb;
}

export async function persistSessionLocally(record: PersistedSessionRecord): Promise<void> {
  try {
    localStorage.setItem(LS_CTX_KEY, JSON.stringify(record));
  } catch {
    // Ignore storage issues
  }
  await idbPut(STORE_TELEMETRY, { ...record, sessionId: 'current' });
}

export async function syncTelemetrySession(payload: {
  sessionId: string;
  inferredPersona: PersonaId;
  scores: PersonaScores;
  lastSignal: ContextSignal | null;
  utmTerm?: string;
  utmSource?: string;
  utmCampaign?: string;
  referrer?: string;
}): Promise<boolean> {
  try {
    localStorage.setItem(LS_TELEMETRY_KEY, JSON.stringify({ ...payload, ts: Date.now() }));
  } catch {
    // Ignore
  }

  try {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), 1400);
    const backendPayload = {
      sessionId: payload.sessionId,
      inferredPersona: PERSONA_TO_BACKEND_SLUG[payload.inferredPersona] ?? 'organico',
      utmSource: payload.utmSource ?? null,
      utmCampaign: payload.utmCampaign ?? null,
      utmTerm: payload.utmTerm ?? null,
      referrer: payload.referrer ?? null,
      behaviorScores: {
        organico: payload.scores.geral,
        imobiliario: payload.scores.imobiliario,
        familia: payload.scores.familia,
        trabalhista: payload.scores.trabalhista,
        previdenciario: payload.scores.previdenciario,
        consumidor: payload.scores.consumidor,
        saude: payload.scores.saude,
        empresarial: payload.scores.empresarial,
        criminal: payload.scores.criminal,
      },
    };
    const res = await fetch('/api/telemetry/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(backendPayload),
      signal: controller.signal,
    });
    window.clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}
