import assert from 'node:assert/strict';

// Minimal browser environment shim for Node execution of PredictiveIntentEngine
const memoryStorage = new Map<string, string>();
let currentHref = 'https://authentic-advocacia.vercel.app/';

const mockWindow = {
  location: {
    get href() {
      return currentHref;
    },
    set href(v: string) {
      currentHref = v;
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
        currentHref = typeof url === 'string' ? new URL(url, currentHref).toString() : url.toString();
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

let mockCookie = '';
const mockDocument = {
  get cookie() {
    return mockCookie;
  },
  set cookie(val: string) {
    mockCookie = val;
  },
  referrer: '',
  addEventListener: () => {},
  removeEventListener: () => {},
  querySelectorAll: () => [],
};

const mockLocalStorage = {
  getItem: (k: string) => memoryStorage.get(k) ?? null,
  setItem: (k: string, v: string) => {
    memoryStorage.set(k, v);
  },
  removeItem: (k: string) => {
    memoryStorage.delete(k);
  },
  clear: () => {
    memoryStorage.clear();
  },
};

(globalThis as unknown as Record<string, unknown>).window = mockWindow;
(globalThis as unknown as Record<string, unknown>).document = mockDocument;
(globalThis as unknown as Record<string, unknown>).localStorage = mockLocalStorage;

import {
  PredictiveIntentEngine,
  buildWhatsAppTriageDossier,
} from '../src/lib/predictiveIntentEngine';
import {
  buildAdaptiveTriageQuestions,
  buildInformativeTriageBrief,
  extractContextClues,
} from '../src/lib/adaptiveTriageEngine';
import {
  SEO_DESCRIPTION_MAX_CHARS,
  SEO_TITLE_MAX_CHARS,
  auditWhiteLabelSeo,
  buildDynamicSeoMetadata,
  buildJsonLdGraph,
  buildLocalFaqForPersona,
  generateClientRobotsTxt,
  generateClientSitemapXml,
  resolvePersonaFromPathname,
} from '../src/lib/seoEngine';
import type {
  AdaptiveTriageAnswer,
  ContextState,
  LawyerProfile,
  PersonaId,
} from '../src/types/legal';

const ALL_9_AREAS: PersonaId[] = [
  'geral',
  'familia',
  'previdenciario',
  'trabalhista',
  'imobiliario',
  'consumidor',
  'saude',
  'empresarial',
  'criminal',
];

function resetBrowserState() {
  currentHref = 'https://authentic-advocacia.vercel.app/';
  mockCookie = '';
  memoryStorage.clear();
}

async function runTests() {
  let passed = 0;
  const failures: string[] = [];

  async function test(name: string, fn: () => void | Promise<void>) {
    try {
      await fn();
      passed++;
      console.log(`✅ PASS: ${name}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      failures.push(`${name}: ${message}`);
      console.error(`❌ FAIL: ${name}\n   -> ${message}`);
    }
  }

  // 1. White-Label Primary Area Switching (All 9 Areas)
  await test('White-Label: selectAreaDirectly respects all 9 areas without locking to imobiliario', () => {
    resetBrowserState();
    const engine = new PredictiveIntentEngine('imobiliario');
    for (const area of ALL_9_AREAS) {
      const state = engine.selectAreaDirectly(area);
      assert.equal(state.activePersona, area);
      assert.equal(state.scores[area], 95);
    }
  });

  await test('White-Label: bootstrap respects all 9 primary areas without locking to imobiliario', async () => {
    for (const area of ALL_9_AREAS) {
      resetBrowserState();
      const engine = new PredictiveIntentEngine(area);
      const state = await engine.bootstrap(area);
      assert.equal(state.activePersona, area);
    }
  });

  await test('White-Label: constructor respects geral (does not force imobiliario)', () => {
    resetBrowserState();
    const engine = new PredictiveIntentEngine('geral');
    assert.equal(engine.getState().activePersona, 'geral');
  });

  // 2. Adaptive Confirmation-Bias Triage Engine
  await test('Adaptive Triage: previdenciario demo scenario (dor nas pernas + 57 anos -> 56 anos + limitação física)', () => {
    resetBrowserState();
    const engine = new PredictiveIntentEngine('imobiliario');
    const state: ContextState = engine.injectSimulatedSearch({
      id: 'demo-prev-57',
      mode: 'cross-intent',
      channel: 'Pista Cruzada',
      label: 'Busca indireta: dor nas pernas e cansaço aos 57 anos',
      shortLabel: 'Dor nas pernas (57a)',
      deductionLabel: 'Busca por dor nas pernas aos 57 anos + dificuldade de trabalhar',
      personaId: 'previdenciario',
      utmTerm: 'dor-nas-pernas-57-anos-inss',
      utmSource: 'google',
      utmMedium: 'cpc',
      utmCampaign: 'previdenciario_incapacidade',
      referrerHint: 'https://www.google.com/',
      expectedScore: 95,
    });

    const clues = extractContextClues(state);
    assert.equal(clues.detectedAge, 57);
    assert.equal(clues.hasLegOrSpineSymptom, true);

    const questions = buildAdaptiveTriageQuestions(state, {});
    assert.ok(questions.length >= 4);

    const combinedPrompts = questions.map((q) => `${q.prompt} ${q.rationaleHint}`).join(' | ').toLowerCase();
    assert.ok(combinedPrompts.includes('56 anos'), 'Missing 56 anos confirmation-bias threshold');
    assert.ok(/perna|coluna|mobilidade|físic|fisic|trabalhar/.test(combinedPrompts), 'Missing physical limitation cue');
  });

  await test('Adaptive Triage: contextual questions across familia, imobiliario, trabalhista, saude, criminal', () => {
    const scenarios: Array<{
      area: PersonaId;
      clueText: string;
      expectedClueKey: keyof ReturnType<typeof extractContextClues>;
    }> = [
      { area: 'familia', clueText: 'divorcio partilha de bens e guarda dos filhos', expectedClueKey: 'hasFamilyAssetClue' },
      { area: 'imobiliario', clueText: 'construtora atrasou entrega das chaves obra distrato', expectedClueKey: 'hasConstructionDelayClue' },
      { area: 'trabalhista', clueText: 'demissao sem justa causa contrato pj horario fixo fgts', expectedClueKey: 'hasPjOrDismissalClue' },
      { area: 'saude', clueText: 'plano de saude negou cirurgia de urgencia laudo medico', expectedClueKey: 'hasHealthPlanDenialClue' },
      { area: 'criminal', clueText: 'prisao em flagrante na delegacia de madrugada 02h', expectedClueKey: 'hasLateNightUrgency' },
    ];

    for (const sc of scenarios) {
      resetBrowserState();
      const engine = new PredictiveIntentEngine(sc.area);
      const state = engine.injectSimulatedSearch({
        id: `test-${sc.area}`,
        mode: 'cross-intent',
        channel: 'Google',
        label: sc.clueText,
        shortLabel: sc.area,
        deductionLabel: sc.clueText,
        personaId: sc.area,
        utmTerm: sc.clueText.replace(/\s+/g, '-'),
        utmSource: 'google',
        utmMedium: 'cpc',
        utmCampaign: sc.area,
        referrerHint: 'https://www.google.com/',
        expectedScore: 93,
      });

      const clues = extractContextClues(state);
      assert.equal(clues[sc.expectedClueKey], true);

      const questions = buildAdaptiveTriageQuestions(state, {});
      assert.ok(questions.length >= 3);
      for (const q of questions) {
        assert.ok(q.prompt.length > 10);
        assert.ok(q.options.length >= 2);
      }

      const brief = buildInformativeTriageBrief(sc.area, []);
      assert.ok(brief.documentChecklist.length >= 2);
    }
  });

  await test('Adaptive Triage: buildWhatsAppTriageDossier includes lawyer greeting, filled answers and additional note', () => {
    resetBrowserState();
    const engine = new PredictiveIntentEngine('previdenciario');
    const state = engine.selectAreaDirectly('previdenciario');
    const questions = buildAdaptiveTriageQuestions(state, {});
    const answers: AdaptiveTriageAnswer[] = questions.slice(0, 3).map((q) => ({
      questionId: q.id,
      questionPrompt: q.prompt,
      optionId: q.options[0].id,
      optionLabel: q.options[0].label,
      dossierTag: q.options[0].dossierTag,
    }));

    const note = 'Prefiro retorno após as 14h.';
    const dossier = buildWhatsAppTriageDossier('5561999998888', 'Dra. Patrícia Guimarães', state, answers, note);

    assert.ok(dossier.url.startsWith('https://wa.me/5561999998888?text='));
    assert.ok(dossier.text.includes('Dra. Patrícia'));
    for (const ans of answers) {
      assert.ok(dossier.text.includes(ans.dossierTag));
    }
    assert.ok(dossier.text.includes(note));
  });

  // 3. White-Label Local SEO Engine
  const customProfile: LawyerProfile = {
    id: 'patricia-guimaraes-df',
    lawyerName: 'Dra. Patrícia Guimarães',
    firmName: 'Guimarães Advocacia Familiar',
    oabNumber: 'OAB/DF 31.345',
    practiceModel: 'sociedade_individual',
    dpoEmail: 'privacidade@patriciaguimaraes.adv.br',
    whatsapp: '5561998887766',
    city: 'Santa Maria & Brasília/DF',
    primaryArea: 'familia',
    photoUrl: 'https://patriciaguimaraes.adv.br/lawyer-portrait.png',
    experienceYears: 12,
    editorialQuote: 'Atuação técnica e humanizada em Direito de Família e Sucessões.',
    seo: {
      siteUrl: 'https://patriciaguimaraes.adv.br',
      cityName: 'Santa Maria & Brasília',
      stateCode: 'DF',
      neighborhoods: ['Santa Maria', 'Gama', 'Águas Claras', 'Asa Sul'],
      streetAddress: 'CL 114, Bloco A, Sala 204 — Santa Maria',
      postalCode: '72544-100',
      openingHours: 'Mo-Fr 09:00-18:00',
      academicBio: 'Advogada inscrita na OAB/DF 31.345, pós-graduada em Direito de Família e Sucessões pelo IDP.',
      focusKeywords: ['advogado direito de família santa maria df', 'divórcio brasília df'],
    },
  };

  await test('SEO Engine: metadata limits (title <= 63, description <= 160) for custom profile', () => {
    const meta = buildDynamicSeoMetadata(customProfile, 'familia');
    assert.ok(meta.title.length <= SEO_TITLE_MAX_CHARS, `Title too long: ${meta.title.length}`);
    assert.ok(meta.description.length <= SEO_DESCRIPTION_MAX_CHARS, `Description too long: ${meta.description.length}`);
    assert.equal(meta.canonicalUrl, 'https://patriciaguimaraes.adv.br/atuacao/direito-de-familia');
  });

  await test('SEO Engine: buildJsonLdGraph outputs all 6 required Schema.org nodes', () => {
    const meta = buildDynamicSeoMetadata(customProfile, 'familia');
    const faqItems = buildLocalFaqForPersona(customProfile, 'familia');
    const graphObj = buildJsonLdGraph(customProfile, 'familia', meta, faqItems) as {
      '@graph': Array<{ '@type': string | string[] }>;
    };
    const nodes = graphObj['@graph'];
    assert.equal(nodes.length, 6, `Expected 6 JSON-LD nodes, got ${nodes.length}`);

    const requiredTypes = ['LegalService', 'Attorney', 'WebSite', 'WebPage', 'FAQPage', 'BreadcrumbList'];
    const foundTypes = nodes.flatMap((n) => (Array.isArray(n['@type']) ? n['@type'] : [n['@type']]));
    for (const t of requiredTypes) {
      assert.ok(foundTypes.includes(t), `Missing JSON-LD node @type: ${t}`);
    }
  });

  await test('SEO Engine: auditWhiteLabelSeo returns score === 100 and grade === Ouro', () => {
    const audit = auditWhiteLabelSeo(customProfile, 'familia');
    assert.equal(audit.score, 100);
    assert.equal(audit.grade, 'Ouro');
  });

  await test('SEO Engine: generateClientSitemapXml & generateClientRobotsTxt are valid', () => {
    const sitemap = generateClientSitemapXml(customProfile);
    assert.ok(sitemap.includes('<?xml version="1.0" encoding="UTF-8"?>'));
    assert.ok(sitemap.includes('<loc>https://patriciaguimaraes.adv.br/</loc>'));
    assert.ok(sitemap.includes('<loc>https://patriciaguimaraes.adv.br/atuacao/direito-de-familia</loc>'));
    assert.ok(sitemap.includes('<priority>0.9</priority>'));

    const robots = generateClientRobotsTxt(customProfile);
    assert.ok(robots.includes('User-agent: *'));
    assert.ok(robots.includes('Allow: /'));
    assert.ok(robots.includes('Sitemap: https://patriciaguimaraes.adv.br/sitemap.xml'));
  });

  await test("SEO Engine: resolvePersonaFromPathname('/atuacao/direito-de-familia') === 'familia'", () => {
    assert.equal(resolvePersonaFromPathname('/atuacao/direito-de-familia'), 'familia');
    assert.equal(resolvePersonaFromPathname('/atuacao/direito-previdenciario'), 'previdenciario');
    assert.equal(resolvePersonaFromPathname('/atuacao/direito-imobiliario'), 'imobiliario');
  });

  console.log(`\nSummary: ${passed} passed, ${failures.length} failed.`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
}

runTests();
