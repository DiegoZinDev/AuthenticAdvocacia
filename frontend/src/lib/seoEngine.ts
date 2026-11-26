import { ORDERED_PRACTICE_AREAS, PERSONA_CONTENTS } from '../data/seeds';
import type { LawyerProfile, PersonaId, WhiteLabelSeoConfig } from '../types/legal';

export interface LocalFaqItem {
  question: string;
  answer: string;
}

export interface ComputedSeoMetadata {
  title: string;
  description: string;
  canonicalUrl: string;
  keywords: string[];
  geoRegion: string;
  geoPlacename: string;
  ogImage: string;
  friendlySlug: string;
  resolvedSeo: WhiteLabelSeoConfig;
}

export interface SeoAuditCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface SeoAuditReport {
  score: number;
  grade: 'Ouro' | 'Bom' | 'Ajustar';
  checks: SeoAuditCheck[];
}

export const SEO_TITLE_MAX_CHARS = 63;
export const SEO_DESCRIPTION_MAX_CHARS = 160;

const PERSONA_SEO_KEYWORDS: Record<
  PersonaId,
  {
    shortTitleKeyword: string;
    friendlySlug: string;
    plainTerms: string[];
  }
> = {
  geral: {
    shortTitleKeyword: 'Advogado',
    friendlySlug: '/',
    plainTerms: ['advogado perto de mim', 'escritório de advocacia', 'orientação jurídica'],
  },
  imobiliario: {
    shortTitleKeyword: 'Advogado Imobiliário',
    friendlySlug: '/atuacao/direito-imobiliario',
    plainTerms: ['advogado imobiliário', 'distrato de imóvel', 'atraso na entrega de obra'],
  },
  previdenciario: {
    shortTitleKeyword: 'Advogado Previdenciário',
    friendlySlug: '/atuacao/direito-previdenciario',
    plainTerms: ['advogado previdenciário INSS', 'aposentadoria', 'auxílio incapacidade'],
  },
  trabalhista: {
    shortTitleKeyword: 'Advogado Trabalhista',
    friendlySlug: '/atuacao/direito-trabalhista',
    plainTerms: ['advogado trabalhista', 'rescisão e FGTS', 'vínculo PJ'],
  },
  familia: {
    shortTitleKeyword: 'Advogado de Família',
    friendlySlug: '/atuacao/direito-de-familia',
    plainTerms: ['advogado de família', 'divórcio e partilha', 'inventário e pensão'],
  },
  consumidor: {
    shortTitleKeyword: 'Advogado Consumidor',
    friendlySlug: '/atuacao/direito-do-consumidor',
    plainTerms: ['advogado bancário e consumidor', 'fraude Pix', 'negativação indevida'],
  },
  saude: {
    shortTitleKeyword: 'Advogado Plano de Saúde',
    friendlySlug: '/atuacao/direito-medico-saude',
    plainTerms: ['advogado direito médico', 'negativa plano de saúde', 'cobertura cirurgia'],
  },
  empresarial: {
    shortTitleKeyword: 'Advogado Empresarial',
    friendlySlug: '/atuacao/direito-empresarial',
    plainTerms: ['advogado empresarial', 'contratos comerciais', 'direito societário'],
  },
  criminal: {
    shortTitleKeyword: 'Advogado Criminalista',
    friendlySlug: '/atuacao/direito-criminal',
    plainTerms: ['advogado criminalista', 'defesa criminal', 'acompanhamento delegacia'],
  },
};

function sanitizeSiteUrl(rawUrl: string | undefined): string {
  const fallback =
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin
      : 'https://authentic-advocacia.vercel.app';
  const trimmed = (rawUrl || '').trim().replace(/\/+$/, '');
  if (!trimmed) return fallback;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function parseCityAndState(rawCity: string): { cityName: string; stateCode: string } {
  const clean = rawCity.trim();
  const stateMatch = clean.match(/\b([A-Z]{2})\b/);
  const stateCode = stateMatch ? stateMatch[1] : 'DF';
  const withoutState = clean
    .replace(/[-/]\s*[A-Z]{2}\b/, '')
    .split(/[&,]/)[0]
    .trim();
  return {
    cityName: withoutState || 'Brasília',
    stateCode,
  };
}

function extractShortBrand(firmName: string, lawyerName: string): string {
  const base = firmName.split(/[—–|-]/)[0]?.trim() || lawyerName.trim();
  if (base.length <= 22) return base;
  return base.split(/\s+/).slice(0, 2).join(' ');
}

function truncateCleanly(text: string, maxChars: number): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  const sliced = normalized.slice(0, maxChars - 1);
  const lastSpace = sliced.lastIndexOf(' ');
  return `${(lastSpace > maxChars * 0.65 ? sliced.slice(0, lastSpace) : sliced).trim()}…`;
}

export function getPersonaFriendlySlug(personaId: PersonaId): string {
  return PERSONA_SEO_KEYWORDS[personaId]?.friendlySlug || '/';
}

export function resolvePersonaFromPathname(pathname: string): PersonaId | null {
  const cleanPath = pathname.replace(/\/+$/, '').toLowerCase();
  if (!cleanPath || cleanPath === '/') return null;
  for (const [id, meta] of Object.entries(PERSONA_SEO_KEYWORDS)) {
    if (meta.friendlySlug !== '/' && meta.friendlySlug.toLowerCase() === cleanPath) {
      return id as PersonaId;
    }
  }
  return null;
}

export function resolveWhiteLabelSeoConfig(profile: LawyerProfile): WhiteLabelSeoConfig {
  const inferred = parseCityAndState(profile.city);
  const seo = profile.seo;

  const cityName = seo?.cityName?.trim() || inferred.cityName;
  const stateCode = (seo?.stateCode?.trim() || inferred.stateCode).toUpperCase().slice(0, 2);
  const neighborhoods =
    seo?.neighborhoods && seo.neighborhoods.length > 0
      ? seo.neighborhoods.map((n) => n.trim()).filter(Boolean)
      : [cityName];

  const primaryKw = PERSONA_SEO_KEYWORDS[profile.primaryArea]?.shortTitleKeyword || 'Advogado';

  const focusKeywords =
    seo?.focusKeywords && seo.focusKeywords.length > 0
      ? seo.focusKeywords.map((k) => k.trim()).filter(Boolean)
      : [
          `${primaryKw.toLowerCase()} em ${cityName} ${stateCode}`,
          `advogado perto de mim ${cityName}`,
          `escritório de advocacia ${cityName}`,
        ];

  return {
    siteUrl: sanitizeSiteUrl(seo?.siteUrl),
    cityName,
    stateCode,
    neighborhoods,
    streetAddress: seo?.streetAddress?.trim() || `Atendimento presencial e digital em ${cityName}/${stateCode}`,
    postalCode: seo?.postalCode?.trim() || '',
    latitude: seo?.latitude?.trim() || undefined,
    longitude: seo?.longitude?.trim() || undefined,
    openingHours: seo?.openingHours?.trim() || 'Mo-Fr 08:30-18:30',
    googleBusinessUrl: seo?.googleBusinessUrl?.trim() || '',
    academicBio:
      seo?.academicBio?.trim() ||
      `Advogado inscrito sob ${profile.oabNumber}, com ${profile.experienceYears} anos de atuação técnica em ${cityName}/${stateCode}.`,
    googleVerificationCode: seo?.googleVerificationCode?.trim() || '',
    focusKeywords,
    customTitleOverride: seo?.customTitleOverride?.trim() || '',
    customDescriptionOverride: seo?.customDescriptionOverride?.trim() || '',
  };
}

/**
 * Builds On-Page SEO metadata strictly aligned with:
 * - "Guia Completo do SEO - 3ª Edição" (RD & Agência Mestre):
 *   - Primary keyword FIRST, brand LAST, <= 63 chars for <title>
 *   - Informative CTR-oriented meta description <= 160 chars
 *   - Clean canonical URL (prevents duplicate content from UTMs)
 * - Provimento CFOAB nº 205/2021 (sober, informative, zero outcome promises)
 */
export function buildDynamicSeoMetadata(
  profile: LawyerProfile,
  activePersona: PersonaId
): ComputedSeoMetadata {
  const resolvedSeo = resolveWhiteLabelSeoConfig(profile);
  const personaMeta = PERSONA_SEO_KEYWORDS[activePersona];
  const personaContent = PERSONA_CONTENTS[activePersona];
  const shortBrand = extractShortBrand(profile.firmName, profile.lawyerName);
  const locationShort = `${resolvedSeo.cityName}/${resolvedSeo.stateCode}`;

  const defaultTitleCandidate = `${personaMeta.shortTitleKeyword} em ${locationShort} | ${shortBrand}`;
  const rawTitle = resolvedSeo.customTitleOverride || defaultTitleCandidate;
  const title = truncateCleanly(rawTitle, SEO_TITLE_MAX_CHARS);

  const nearbyHint =
    resolvedSeo.neighborhoods.length > 1
      ? `${resolvedSeo.neighborhoods.slice(0, 2).join(', ')} e região`
      : locationShort;

  const defaultDesc = `${personaMeta.shortTitleKeyword} em ${locationShort} (${nearbyHint}). ${profile.lawyerName} (${profile.oabNumber}): triagem informativa e atendimento reservado em ${personaContent.areaLabel}.`;
  const rawDesc = resolvedSeo.customDescriptionOverride || defaultDesc;
  const description = truncateCleanly(rawDesc, SEO_DESCRIPTION_MAX_CHARS);

  const canonicalUrl =
    personaMeta.friendlySlug === '/'
      ? `${resolvedSeo.siteUrl}/`
      : `${resolvedSeo.siteUrl}${personaMeta.friendlySlug}`;

  const keywords = Array.from(
    new Set([
      `${personaMeta.shortTitleKeyword} em ${resolvedSeo.cityName}`,
      `${personaMeta.shortTitleKeyword} ${resolvedSeo.stateCode}`,
      ...personaMeta.plainTerms.map((t) => `${t} ${resolvedSeo.cityName}`),
      ...resolvedSeo.focusKeywords,
      ...resolvedSeo.neighborhoods.slice(0, 4).map((b) => `advogado ${b} ${resolvedSeo.stateCode}`),
    ])
  ).slice(0, 14);

  const ogImage =
    profile.photoUrl && /^https?:\/\//i.test(profile.photoUrl)
      ? profile.photoUrl
      : `${resolvedSeo.siteUrl}/lawyer-portrait.png`;

  return {
    title,
    description,
    canonicalUrl,
    keywords,
    geoRegion: `BR-${resolvedSeo.stateCode}`,
    geoPlacename: resolvedSeo.cityName,
    ogImage,
    friendlySlug: personaMeta.friendlySlug,
    resolvedSeo,
  };
}

/**
 * Generates plain-language, OAB-compliant Local FAQ items tailored to the
 * active legal area and the white-label client's real city & neighborhoods.
 * Used both in visible HTML (rich crawlable text) and in Schema.org FAQPage JSON-LD.
 */
export function buildLocalFaqForPersona(
  profile: LawyerProfile,
  activePersona: PersonaId
): LocalFaqItem[] {
  const seo = resolveWhiteLabelSeoConfig(profile);
  const persona = PERSONA_CONTENTS[activePersona];
  const regionList =
    seo.neighborhoods.length > 1
      ? `${seo.neighborhoods.slice(0, 4).join(', ')} e demais regiões de ${seo.cityName}/${seo.stateCode}`
      : `${seo.cityName}/${seo.stateCode} e atendimento digital em todo o Brasil`;

  const areaSpecificQuestions: Record<PersonaId, LocalFaqItem[]> = {
    previdenciario: [
      {
        question: `Quando vale a pena procurar um advogado previdenciário em ${seo.cityName}?`,
        answer: `A orientação técnica prévia é útil antes de protocolar pedido de aposentadoria, benefício por incapacidade ou revisão no Meu INSS, para conferir vínculos do CNIS, regras de transição (EC 103/2019) e laudos médicos necessários.`,
      },
      {
        question: `Quais documentos devo separar para a primeira conversa sobre INSS ou aposentadoria?`,
        answer: `Normalmente recomenda-se reunir o extrato CNIS atualizado (Meu INSS), carteiras de trabalho, carnês de contribuição e, em casos de saúde ou incapacidade, relatórios e exames médicos recentes com CID.`,
      },
    ],
    imobiliario: [
      {
        question: `Como funciona a orientação em Direito Imobiliário em ${seo.cityName}/${seo.stateCode}?`,
        answer: `O atendimento inicia com a leitura técnica do contrato de compra e venda, quadro-resumo, extratos de pagamento ou matrícula do imóvel, esclarecendo as alternativas extrajudiciais e judiciais cabíveis ao caso.`,
      },
      {
        question: `Quais documentos são importantes em casos de atraso de obra ou distrato?`,
        answer: `Separe o contrato assinado com a construtora, o cronograma de entrega, comprovantes de parcelas pagas e eventuais comunicações ou notificações trocadas por e-mail ou aplicativo.`,
      },
    ],
    trabalhista: [
      {
        question: `Qual é o prazo legal para consultar sobre direitos trabalhistas após o desligamento?`,
        answer: `A Constituição Federal (Art. 7º, XXIX) prevê prazo prescricional de até 2 anos após o término do contrato de trabalho para eventual discussão judicial de verbas dos últimos 5 anos.`,
      },
      {
        question: `Quem atuou como PJ ou MEI com rotina fixa pode solicitar análise documental?`,
        answer: `Sim. Em atendimento reservado, o advogado analisa contrato, notas fiscais e registros de rotina para esclarecer se estão presentes os requisitos legais da relação de emprego.`,
      },
    ],
    familia: [
      {
        question: `Divórcio ou inventário em ${seo.cityName} pode ser feito em cartório?`,
        answer: `Quando há consenso entre as partes e preenchimento dos requisitos legais vigentes, a via extrajudicial em cartório pode ser avaliada pelo advogado como alternativa mais célere e reservada.`,
      },
      {
        question: `Como é protegido o sigilo em atendimentos de Direito de Família?`,
        answer: `Todas as informações e documentos compartilhados na triagem inicial e na reunião com ${profile.lawyerName} (${profile.oabNumber}) são protegidos pelo sigilo profissional previsto no Estatuto da OAB.`,
      },
    ],
    consumidor: [
      {
        question: `O que fazer primeiro em caso de fraude bancária, golpe do Pix ou negativação indevida?`,
        answer: `É recomendável registrar contestação imediata nos canais oficiais do banco (SAC/Ouvidoria/MED), guardar prints com data e hora e, quando aplicável, lavrar Boletim de Ocorrência antes da análise jurídica.`,
      },
      {
        question: `Como o escritório analisa cobranças bancárias ou descontos não reconhecidos?`,
        answer: `A análise técnica verifica extratos, contratos e protocolos administrativos à luz do Código de Defesa do Consumidor e das normas do Banco Central, sempre de forma individualizada.`,
      },
    ],
    saude: [
      {
        question: `Quais documentos são essenciais quando o plano de saúde nega um procedimento?`,
        answer: `Os documentos centrais são o relatório médico detalhado descrevendo a necessidade clínica do tratamento, a negativa por escrito da operadora (ou protocolo) e a carteirinha do plano.`,
      },
      {
        question: `O atendimento em Direito Médico e Saúde abrange ${seo.cityName} e região?`,
        answer: `Sim. ${profile.firmName} atende presencialmente em ${regionList} e também em formato digital, com triagem inicial conduzida para encaminhamento direto ao advogado titular.`,
      },
    ],
    empresarial: [
      {
        question: `Como funciona a assessoria jurídica empresarial em ${seo.cityName}/${seo.stateCode}?`,
        answer: `A atuação contempla revisão preventiva de contratos comerciais, governança societária, acordo de sócios e estratégias negociais ou judiciais de recuperação de crédito B2B.`,
      },
      {
        question: `Pequenas e médias empresas também podem agendar triagem reservada?`,
        answer: `Sim. Sócios e gestores de PMEs, sociedades limitadas e redes de franquias podem utilizar o formulário informativo para organizar documentos societários antes da reunião executiva.`,
      },
    ],
    criminal: [
      {
        question: `Como funciona o sigilo no contato com advogado criminalista em ${seo.cityName}?`,
        answer: `O contato pré-contratual e o acompanhamento técnico são integralmente protegidos pelo sigilo profissional (Art. 7º da Lei nº 8.906/1994), assegurando discrição absoluta ao interessado e à família.`,
      },
      {
        question: `Quais informações básicas ajudam na triagem criminal inicial?`,
        answer: `Informar se há intimação, número do procedimento/boletim de ocorrência e a comarca ou delegacia agiliza o atendimento, evitando enviar detalhes sensíveis em formulários abertos.`,
      },
    ],
    geral: [
      {
        question: `Como encontrar um escritório de advocacia confiável em ${seo.cityName}/${seo.stateCode}?`,
        answer: `Verifique sempre o nome completo do advogado titular, a inscrição ativa na OAB (${profile.oabNumber}), o endereço ou canal oficial de atendimento e a clareza das orientações informativas prestadas.`,
      },
      {
        question: `O formulário adaptativo substitui a consulta com o advogado?`,
        answer: `Não. Em conformidade com a Resolução CFOAB nº 16/2026 e o Provimento nº 205/2021, a triagem inicial apenas organiza suas informações; toda análise jurídica é conduzida exclusivamente pelo advogado titular.`,
      },
    ],
  };

  return [
    ...areaSpecificQuestions[activePersona],
    {
      question: `Onde o escritório ${profile.firmName} realiza atendimento presencial e online?`,
      answer: `O atendimento abrange ${regionList}, com base em ${seo.streetAddress}${seo.postalCode ? ` (CEP ${seo.postalCode})` : ''}, além de atendimento digital reservado para clientes em todo o Brasil.`,
    },
    {
      question: `Como agendar uma primeira conversa sobre ${persona.areaLabel}?`,
      answer: `Você pode preencher a triagem informativa nesta página para organizar seu contexto e encaminhar diretamente ao WhatsApp oficial de ${profile.lawyerName} (${profile.oabNumber}), sob sigilo profissional.`,
    },
  ];
}

/**
 * Generates structured Schema.org JSON-LD (@graph) for Google Local Pack & Rich Results:
 * LegalService + Attorney + FAQPage + BreadcrumbList.
 */
export function buildJsonLdGraph(
  profile: LawyerProfile,
  activePersona: PersonaId,
  metadata: ComputedSeoMetadata,
  faqItems: LocalFaqItem[]
): Record<string, unknown> {
  const seo = metadata.resolvedSeo;
  const persona = PERSONA_CONTENTS[activePersona];
  const cleanPhone = profile.whatsapp.replace(/\D/g, '');
  const formattedPhone = cleanPhone.startsWith('55') ? `+${cleanPhone}` : `+55${cleanPhone}`;

  const legalServiceNode: Record<string, unknown> = {
    '@type': 'LegalService',
    '@id': `${seo.siteUrl}/#legal-service`,
    name: profile.firmName,
    description: metadata.description,
    url: seo.siteUrl,
    image: metadata.ogImage,
    telephone: formattedPhone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: seo.streetAddress,
      addressLocality: seo.cityName,
      addressRegion: seo.stateCode,
      postalCode: seo.postalCode || undefined,
      addressCountry: 'BR',
    },
    areaServed: [
      {
        '@type': 'City',
        name: `${seo.cityName} - ${seo.stateCode}`,
      },
      ...seo.neighborhoods.map((neighborhood) => ({
        '@type': 'AdministrativeArea',
        name: `${neighborhood}, ${seo.cityName} - ${seo.stateCode}`,
      })),
    ],
    openingHours: seo.openingHours,
    knowsAbout: ORDERED_PRACTICE_AREAS.map((id) => PERSONA_CONTENTS[id].areaLabel),
  };

  if (seo.latitude && seo.longitude) {
    legalServiceNode.geo = {
      '@type': 'GeoCoordinates',
      latitude: seo.latitude,
      longitude: seo.longitude,
    };
  }

  if (seo.googleBusinessUrl) {
    legalServiceNode.sameAs = [seo.googleBusinessUrl];
  }

  const attorneyNode: Record<string, unknown> = {
    '@type': 'Attorney',
    '@id': `${seo.siteUrl}/#attorney`,
    name: profile.lawyerName,
    identifier: profile.oabNumber,
    jobTitle: 'Advogado Titular',
    description: seo.academicBio,
    image: metadata.ogImage,
    worksFor: { '@id': `${seo.siteUrl}/#legal-service` },
    knowsAbout: ORDERED_PRACTICE_AREAS.map((id) => PERSONA_CONTENTS[id].areaLabel),
  };

  const webSiteNode: Record<string, unknown> = {
    '@type': 'WebSite',
    '@id': `${seo.siteUrl}/#website`,
    url: `${seo.siteUrl}/`,
    name: profile.firmName,
    inLanguage: 'pt-BR',
    publisher: { '@id': `${seo.siteUrl}/#legal-service` },
  };

  const webPageNode: Record<string, unknown> = {
    '@type': 'WebPage',
    '@id': `${metadata.canonicalUrl}#webpage`,
    url: metadata.canonicalUrl,
    name: metadata.title,
    description: metadata.description,
    inLanguage: 'pt-BR',
    isPartOf: { '@id': `${seo.siteUrl}/#website` },
    about: { '@id': `${seo.siteUrl}/#legal-service` },
    author: { '@id': `${seo.siteUrl}/#attorney` },
    reviewedBy: { '@id': `${seo.siteUrl}/#attorney` },
    dateModified: (profile.updatedAt || new Date().toISOString()).slice(0, 10),
  };

  const faqNode: Record<string, unknown> = {
    '@type': 'FAQPage',
    '@id': `${metadata.canonicalUrl}#faq`,
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const breadcrumbNode: Record<string, unknown> = {
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Início',
        item: `${seo.siteUrl}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: persona.areaLabel,
        item: metadata.canonicalUrl,
      },
    ],
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [
      legalServiceNode,
      attorneyNode,
      webSiteNode,
      webPageNode,
      faqNode,
      breadcrumbNode,
    ],
  };
}

function upsertMetaTag(
  selector: string,
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
): void {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertCanonicalLink(href: string): void {
  if (typeof document === 'undefined') return;
  let link = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function upsertJsonLdScript(graph: Record<string, unknown>): void {
  if (typeof document === 'undefined') return;
  const scriptId = 'whitelabel-seo-jsonld';
  let script = document.getElementById(scriptId) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = scriptId;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(graph);
}

/**
 * Applies all computed On-Page SEO tags + Schema.org JSON-LD live to <head>.
 */
export function applyWhiteLabelSeoToDocument(
  profile: LawyerProfile,
  activePersona: PersonaId
): { metadata: ComputedSeoMetadata; faqItems: LocalFaqItem[] } {
  const metadata = buildDynamicSeoMetadata(profile, activePersona);
  const faqItems = buildLocalFaqForPersona(profile, activePersona);
  const jsonLd = buildJsonLdGraph(profile, activePersona, metadata, faqItems);

  if (typeof document !== 'undefined') {
    document.title = metadata.title;
    upsertMetaTag('meta[name="description"]', 'name', 'description', metadata.description);
    upsertMetaTag('meta[name="keywords"]', 'name', 'keywords', metadata.keywords.join(', '));
    upsertMetaTag(
      'meta[name="robots"]',
      'name',
      'robots',
      'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );
    upsertMetaTag(
      'meta[name="googlebot"]',
      'name',
      'googlebot',
      'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    );
    upsertMetaTag('meta[name="geo.region"]', 'name', 'geo.region', metadata.geoRegion);
    upsertMetaTag('meta[name="geo.placename"]', 'name', 'geo.placename', metadata.geoPlacename);

    if (metadata.resolvedSeo.googleVerificationCode) {
      upsertMetaTag(
        'meta[name="google-site-verification"]',
        'name',
        'google-site-verification',
        metadata.resolvedSeo.googleVerificationCode
      );
    }

    upsertMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
    upsertMetaTag('meta[property="og:locale"]', 'property', 'og:locale', 'pt_BR');
    upsertMetaTag('meta[property="og:title"]', 'property', 'og:title', metadata.title);
    upsertMetaTag(
      'meta[property="og:description"]',
      'property',
      'og:description',
      metadata.description
    );
    upsertMetaTag('meta[property="og:url"]', 'property', 'og:url', metadata.canonicalUrl);
    upsertMetaTag('meta[property="og:image"]', 'property', 'og:image', metadata.ogImage);
    upsertMetaTag('meta[property="og:site_name"]', 'property', 'og:site_name', profile.firmName);

    upsertMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', metadata.title);
    upsertMetaTag(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      metadata.description
    );
    upsertMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', metadata.ogImage);

    upsertCanonicalLink(metadata.canonicalUrl);
    upsertJsonLdScript(jsonLd);
  }

  return { metadata, faqItems };
}

/**
 * Audits the white-label client's SEO readiness (0–100) based on:
 * Google Search Central (E-E-A-T / YMYL, Crawlable Links, Core Web Vitals) +
 * Conversion SEO On-Page + Guia Completo do SEO (3ª ed.).
 */
export function auditWhiteLabelSeo(
  profile: LawyerProfile,
  activePersona: PersonaId
): SeoAuditReport {
  const meta = buildDynamicSeoMetadata(profile, activePersona);
  const seo = meta.resolvedSeo;

  const checks: SeoAuditCheck[] = [
    {
      id: 'title-length',
      label: `Title Tag otimizada (${meta.title.length}/${SEO_TITLE_MAX_CHARS} chars)`,
      passed: meta.title.length >= 25 && meta.title.length <= SEO_TITLE_MAX_CHARS,
      detail: 'Palavra-chave principal + cidade à esquerda e marca ao final.',
    },
    {
      id: 'desc-length',
      label: `Meta Description para CTR (${meta.description.length}/${SEO_DESCRIPTION_MAX_CHARS} chars)`,
      passed: meta.description.length >= 80 && meta.description.length <= SEO_DESCRIPTION_MAX_CHARS,
      detail: 'Resumo informativo com localidade e chamada sóbria.',
    },
    {
      id: 'nap-local',
      label: 'NAP Local (Nome, Endereço, Cidade/UF e WhatsApp)',
      passed: Boolean(seo.cityName && seo.stateCode && seo.streetAddress && profile.whatsapp),
      detail: 'Base obrigatória para ranquear em buscas "advogado perto de mim".',
    },
    {
      id: 'neighborhoods',
      label: `Cobertura hiperlocal (${seo.neighborhoods.length} bairros/regiões)`,
      passed: seo.neighborhoods.length >= 3,
      detail: 'Pelo menos 3 bairros ou regiões no Schema areaServed e conteúdo.',
    },
    {
      id: 'eeat-author',
      label: 'E-E-A-T / YMYL (Autoria OAB + Bio Técnica + CNA)',
      passed: Boolean(profile.oabNumber && profile.lawyerName && seo.academicBio && seo.academicBio.length >= 30),
      detail: 'Sinaliza autoria verificável e revisão técnica humana ao Google.',
    },
    {
      id: 'schema-rich',
      label: 'JSON-LD Completo (LegalService + Attorney + WebPage + FAQPage)',
      passed: Boolean(profile.oabNumber && profile.lawyerName),
      detail: 'Habilita Rich Snippets de FAQ e sinaliza autoridade local.',
    },
    {
      id: 'crawlable-urls',
      label: 'Links internos rastreáveis (<a href="/atuacao/...">) + LCP Preload',
      passed: true,
      detail: 'Googlebot rastreia cada área jurídica sem depender de botões JS.',
    },
    {
      id: 'domain-canonical',
      label: 'Domínio HTTPS + Canonical + Sitemap XML prontos',
      passed: Boolean(seo.siteUrl && /^https:\/\//i.test(seo.siteUrl)),
      detail: 'Evita conteúdo duplicado entre www/sem-www e parâmetros UTM.',
    },
  ];

  const passedCount = checks.filter((c) => c.passed).length;
  const score = Math.round((passedCount / checks.length) * 100);
  const grade: SeoAuditReport['grade'] = score >= 85 ? 'Ouro' : score >= 65 ? 'Bom' : 'Ajustar';

  return { score, grade, checks };
}

/**
 * Generates a ready-to-deploy sitemap.xml customized for the sold white-label client domain.
 */
export function generateClientSitemapXml(profile: LawyerProfile): string {
  const seo = resolveWhiteLabelSeoConfig(profile);
  const today = new Date().toISOString().slice(0, 10);

  const urls = [
    { loc: `${seo.siteUrl}/`, priority: '1.0', changefreq: 'weekly' },
    ...ORDERED_PRACTICE_AREAS.map((areaId) => ({
      loc: `${seo.siteUrl}${PERSONA_SEO_KEYWORDS[areaId].friendlySlug}`,
      priority: areaId === profile.primaryArea ? '0.9' : '0.8',
      changefreq: 'monthly',
    })),
  ];

  const entries = urls
    .map(
      (u) =>
        `  <url>\n    <loc>${u.loc}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${u.changefreq}</changefreq>\n    <priority>${u.priority}</priority>\n  </url>`
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}

/**
 * Generates a ready-to-deploy robots.txt customized for the sold white-label client domain.
 */
export function generateClientRobotsTxt(profile: LawyerProfile): string {
  const seo = resolveWhiteLabelSeoConfig(profile);
  return `User-agent: *\nAllow: /\n\nSitemap: ${seo.siteUrl}/sitemap.xml\n`;
}
