import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

// Clean browser environment shim for Node execution of PredictiveIntentEngine.bootstrap()
// IMPORTANT: Zero calls to injectSimulatedSearch() — pure real-arrival simulation via
// window.location.href (?q=, ?utm_term=, /atuacao/*) and document.referrer.
const memoryStorage = new Map<string, string>();
let currentHref = 'https://authentic-advocacia.vercel.app/';
let currentReferrer = '';
let currentCookie = '';

const mockWindow = {
  location: {
    get href() {
      return currentHref;
    },
    set href(value: string) {
      currentHref = value;
    },
    get origin() {
      return new URL(currentHref).origin;
    },
    get pathname() {
      return new URL(currentHref).pathname;
    },
    get search() {
      return new URL(currentHref).search;
    },
    get hash() {
      return new URL(currentHref).hash;
    },
  },
  history: {
    replaceState(_state: unknown, _title: string, url?: string | URL | null) {
      if (url) {
        currentHref =
          typeof url === 'string'
            ? new URL(url, currentHref).toString()
            : url.toString();
      }
    },
  },
  innerWidth: 1440,
  innerHeight: 900,
  scrollY: 0,
  addEventListener: () => {},
  removeEventListener: () => {},
  setTimeout,
  clearTimeout,
};

const mockDocument = {
  get cookie() {
    return currentCookie;
  },
  set cookie(val: string) {
    currentCookie = val;
  },
  get referrer() {
    return currentReferrer;
  },
  set referrer(val: string) {
    currentReferrer = val;
  },
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
};

const mockLocalStorage = {
  getItem: (key: string) => memoryStorage.get(key) ?? null,
  setItem: (key: string, value: string) => {
    memoryStorage.set(key, value);
  },
  removeItem: (key: string) => {
    memoryStorage.delete(key);
  },
  clear: () => {
    memoryStorage.clear();
  },
};

(globalThis as unknown as Record<string, unknown>).window = mockWindow;
(globalThis as unknown as Record<string, unknown>).document = mockDocument;
(globalThis as unknown as Record<string, unknown>).localStorage = mockLocalStorage;

import { PredictiveIntentEngine } from '../src/lib/predictiveIntentEngine';
import type { PersonaId } from '../src/types/legal';

interface RealArrivalScenario {
  id: number;
  category: 'direta' | 'cross-intent' | 'seo-organico';
  label: string;
  href: string;
  referrer?: string;
  defaultArea: PersonaId;
  expectedArea: PersonaId;
  minConfidence: number;
}

const REAL_ARRIVAL_SCENARIOS: RealArrivalScenario[] = [
  // 8 buscas diretas orgânicas/Ads (sem simulador)
  {
    id: 1,
    category: 'direta',
    label: 'q=advogado+previdenciario+aposentadoria+inss',
    href: 'https://authentic-advocacia.vercel.app/?q=advogado+previdenciario+aposentadoria+inss',
    defaultArea: 'imobiliario',
    expectedArea: 'previdenciario',
    minConfidence: 0.9,
  },
  {
    id: 2,
    category: 'direta',
    label: 'q=construtora+atrasou+entrega+imovel+distrato',
    href: 'https://authentic-advocacia.vercel.app/?q=construtora+atrasou+entrega+imovel+distrato',
    defaultArea: 'familia',
    expectedArea: 'imobiliario',
    minConfidence: 0.9,
  },
  {
    id: 3,
    category: 'direta',
    label: 'q=divorcio+partilha+de+bens+pensao',
    href: 'https://authentic-advocacia.vercel.app/?q=divorcio+partilha+de+bens+pensao',
    defaultArea: 'imobiliario',
    expectedArea: 'familia',
    minConfidence: 0.9,
  },
  {
    id: 4,
    category: 'direta',
    label: 'q=fui+demitido+como+pj+horario+fixo',
    href: 'https://authentic-advocacia.vercel.app/?q=fui+demitido+como+pj+horario+fixo',
    defaultArea: 'imobiliario',
    expectedArea: 'trabalhista',
    minConfidence: 0.9,
  },
  {
    id: 5,
    category: 'direta',
    label: 'q=golpe+do+pix+banco+nome+negativado',
    href: 'https://authentic-advocacia.vercel.app/?q=golpe+do+pix+banco+nome+negativado',
    defaultArea: 'imobiliario',
    expectedArea: 'consumidor',
    minConfidence: 0.9,
  },
  {
    id: 6,
    category: 'direta',
    label: 'q=plano+de+saude+negou+cirurgia+home+care',
    href: 'https://authentic-advocacia.vercel.app/?q=plano+de+saude+negou+cirurgia+home+care',
    defaultArea: 'imobiliario',
    expectedArea: 'saude',
    minConfidence: 0.9,
  },
  {
    id: 7,
    category: 'direta',
    label: 'q=advogado+empresarial+conflito+socios+contrato',
    href: 'https://authentic-advocacia.vercel.app/?q=advogado+empresarial+conflito+socios+contrato',
    defaultArea: 'imobiliario',
    expectedArea: 'empresarial',
    minConfidence: 0.9,
  },
  {
    id: 8,
    category: 'direta',
    label: 'q=advogado+criminalista+delegacia+flagrante',
    href: 'https://authentic-advocacia.vercel.app/?q=advogado+criminalista+delegacia+flagrante',
    defaultArea: 'imobiliario',
    expectedArea: 'criminal',
    minConfidence: 0.9,
  },

  // 4 buscas indiretas / Cross-Intent (sem citar o nome da área jurídica!)
  {
    id: 9,
    category: 'cross-intent',
    label: 'q=doutor+para+dor+nas+pernas+57+anos',
    href: 'https://authentic-advocacia.vercel.app/?q=doutor+para+dor+nas+pernas+57+anos',
    defaultArea: 'imobiliario',
    expectedArea: 'previdenciario',
    minConfidence: 0.9,
  },
  {
    id: 10,
    category: 'cross-intent',
    label: 'referrer=google.com.br/search?q=parcela+reajustada+incc+chaves+atraso',
    href: 'https://authentic-advocacia.vercel.app/',
    referrer: 'https://www.google.com.br/search?q=parcela+reajustada+incc+chaves+atraso',
    defaultArea: 'familia',
    expectedArea: 'imobiliario',
    minConfidence: 0.9,
  },
  {
    id: 11,
    category: 'cross-intent',
    label: 'utm_term=conta-invadida-pix-bloqueado-banco',
    href: 'https://authentic-advocacia.vercel.app/?utm_source=google&utm_medium=cpc&utm_term=conta-invadida-pix-bloqueado-banco',
    defaultArea: 'imobiliario',
    expectedArea: 'consumidor',
    minConfidence: 0.9,
  },
  {
    id: 12,
    category: 'cross-intent',
    label: 'utm_term=plano-recusou-cirurgia-laudo-urgente',
    href: 'https://authentic-advocacia.vercel.app/?utm_source=google&utm_medium=cpc&utm_term=plano-recusou-cirurgia-laudo-urgente',
    defaultArea: 'imobiliario',
    expectedArea: 'saude',
    minConfidence: 0.9,
  },

  // 4 chegadas orgânicas por URL amigável SEO sem nenhum parâmetro UTM/simulador
  {
    id: 13,
    category: 'seo-organico',
    label: '/atuacao/direito-previdenciario',
    href: 'https://authentic-advocacia.vercel.app/atuacao/direito-previdenciario',
    defaultArea: 'imobiliario',
    expectedArea: 'previdenciario',
    minConfidence: 0.9,
  },
  {
    id: 14,
    category: 'seo-organico',
    label: '/atuacao/direito-de-familia',
    href: 'https://authentic-advocacia.vercel.app/atuacao/direito-de-familia',
    defaultArea: 'imobiliario',
    expectedArea: 'familia',
    minConfidence: 0.9,
  },
  {
    id: 15,
    category: 'seo-organico',
    label: '/atuacao/direito-trabalhista',
    href: 'https://authentic-advocacia.vercel.app/atuacao/direito-trabalhista',
    defaultArea: 'imobiliario',
    expectedArea: 'trabalhista',
    minConfidence: 0.9,
  },
  {
    id: 16,
    category: 'seo-organico',
    label: '/atuacao/direito-imobiliario',
    href: 'https://authentic-advocacia.vercel.app/atuacao/direito-imobiliario',
    defaultArea: 'familia',
    expectedArea: 'imobiliario',
    minConfidence: 0.9,
  },
];

function resetCleanBrowser(href: string, referrer = ''): void {
  currentHref = href;
  currentReferrer = referrer;
  currentCookie = '';
  memoryStorage.clear();
}

describe('PredictiveIntentEngine — Real Search Arrival Prediction (NO Simulator)', () => {
  for (const scenario of REAL_ARRIVAL_SCENARIOS) {
    test(`#${scenario.id} [${scenario.category}] ${scenario.label} -> ${scenario.expectedArea} (>= ${Math.round(scenario.minConfidence * 100)}%)`, async () => {
      resetCleanBrowser(scenario.href, scenario.referrer ?? '');
      const engine = new PredictiveIntentEngine(scenario.defaultArea);
      const state = await engine.bootstrap(scenario.defaultArea);

      const pct = Math.round(state.confidence * 100);
      console.log(
        `[SCENARIO #${String(scenario.id).padStart(2, '0')}] ${scenario.label} => area=${state.activePersona} (expected=${scenario.expectedArea}) | confidence=${pct}% | origin="${state.originSummary}"`
      );

      assert.equal(
        state.activePersona,
        scenario.expectedArea,
        `Expected area "${scenario.expectedArea}", got "${state.activePersona}" for "${scenario.label}"`
      );
      assert.ok(
        state.confidence >= scenario.minConfidence,
        `Expected confidence >= ${scenario.minConfidence} (${Math.round(scenario.minConfidence * 100)}%), got ${state.confidence} (${pct}%) for "${scenario.label}"`
      );
    });
  }

  test('Direct clean home access (/) without signals must NOT fabricate >= 90% confidence and must respect defaultPrimaryArea', async () => {
    const defaultAreas: PersonaId[] = ['imobiliario', 'familia', 'previdenciario', 'geral'];

    for (const defaultArea of defaultAreas) {
      resetCleanBrowser('https://authentic-advocacia.vercel.app/', '');
      const engine = new PredictiveIntentEngine(defaultArea);
      const state = await engine.bootstrap(defaultArea);

      const pct = Math.round(state.confidence * 100);
      console.log(
        `[DIRECT HOME] default=${defaultArea} => area=${state.activePersona} | confidence=${pct}% | origin="${state.originSummary}"`
      );

      assert.equal(
        state.activePersona,
        defaultArea,
        `Direct clean home access should respect defaultPrimaryArea="${defaultArea}", got "${state.activePersona}"`
      );
      assert.ok(
        state.confidence < 0.9,
        `Direct clean home access without signals must NOT fabricate >= 90% confidence, got ${state.confidence} (${pct}%)`
      );
    }
  });
});
