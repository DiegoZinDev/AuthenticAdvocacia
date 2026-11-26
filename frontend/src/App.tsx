import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings2,
  MessageCircle,
  ArrowDown,
  MapPin,
  Shield,
  Scale,
} from 'lucide-react';
import { DEFAULT_LAWYER_PROFILE, PERSONA_CONTENTS } from './data/seeds';
import {
  PredictiveIntentEngine,
  buildWhatsAppTriageDossier,
} from './lib/predictiveIntentEngine';
import {
  loadProfileWithFallback,
  resetProfileWithFallback,
  saveProfileWithFallback,
} from './lib/offlineStore';
import type {
  AdaptiveTriageAnswer,
  ContextState,
  CookieConsentPreferences,
  LawyerProfile,
  LeadOriginPreset,
  PersonaId,
} from './types/legal';
import { KineticHeadline } from './components/KineticHeadline';
import { AdaptiveTriageSection } from './components/AdaptiveTriageSection';
import { PracticeAreasSection } from './components/PracticeAreasSection';
import { AuthorityPainSection } from './components/AuthorityPainSection';
import { LocalSeoFaqSection } from './components/LocalSeoFaqSection';
import { WhiteLabelModal } from './components/WhiteLabelModal';
import { LeadOriginSimulator } from './components/LeadOriginSimulator';
import {
  CookieConsentBanner,
  LegalDocumentModal,
  type LegalDocTab,
} from './components/LegalComplianceStack';
import {
  applyWhiteLabelSeoToDocument,
  getPersonaFriendlySlug,
  resolvePersonaFromPathname,
} from './lib/seoEngine';

const COOKIE_CONSENT_STORAGE_KEY = 'adv_lgpd_cookie_consent_v1';

function loadCookieConsent(): CookieConsentPreferences {
  try {
    if (typeof localStorage === 'undefined') {
      return { essential: true, analyticsAndContext: false, decided: false };
    }
    const raw = localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY);
    if (!raw) return { essential: true, analyticsAndContext: false, decided: false };
    const parsed = JSON.parse(raw) as Partial<CookieConsentPreferences>;
    return {
      essential: true,
      analyticsAndContext: Boolean(parsed.analyticsAndContext),
      decided: Boolean(parsed.decided),
      updatedAt: parsed.updatedAt,
    };
  } catch {
    return { essential: true, analyticsAndContext: false, decided: false };
  }
}

function saveCookieConsent(analyticsAndContext: boolean): CookieConsentPreferences {
  const next: CookieConsentPreferences = {
    essential: true,
    analyticsAndContext,
    decided: true,
    updatedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(next));
    if (!analyticsAndContext) {
      document.cookie = 'adv_autoseller_ctx=; path=/; max-age=0; SameSite=Lax';
    }
  } catch {
    // Storage restricted
  }
  return next;
}

function scrollSmoothToTop(): void {
  if (typeof window !== 'undefined') {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

export function App() {
  const engineRef = useRef<PredictiveIntentEngine | null>(null);
  if (!engineRef.current) {
    engineRef.current = new PredictiveIntentEngine(DEFAULT_LAWYER_PROFILE.primaryArea);
  }

  const [profile, setProfile] = useState<LawyerProfile>(DEFAULT_LAWYER_PROFILE);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);
  const [contextState, setContextState] = useState<ContextState>(() =>
    engineRef.current!.getState()
  );
  const [whiteLabelOpen, setWhiteLabelOpen] = useState(false);
  const [heroPortraitFallback, setHeroPortraitFallback] = useState(false);
  const [triageAnswers, setTriageAnswers] = useState<AdaptiveTriageAnswer[]>([]);
  const [triageNote, setTriageNote] = useState<string>('');
  const [cookieConsent, setCookieConsent] = useState<CookieConsentPreferences>(() =>
    loadCookieConsent()
  );
  const [cookiePrefsOpen, setCookiePrefsOpen] = useState(false);
  const [activeLegalDoc, setActiveLegalDoc] = useState<LegalDocTab | null>(null);

  const sectionTimerRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setHeroPortraitFallback(false);
  }, [profile.photoUrl]);

  // Synchronize live On-Page SEO (<title>, meta description, canonical, OG, JSON-LD LegalService/Attorney/FAQPage)
  useEffect(() => {
    applyWhiteLabelSeoToDocument(profile, contextState.activePersona);
  }, [profile, contextState.activePersona]);

  // Subscribe to PredictiveIntentEngine + start passive listeners only if allowed or in-memory
  useEffect(() => {
    const engine = engineRef.current!;
    const unsubscribe = engine.subscribe((nextState) => {
      setContextState(nextState);
    });
    engine.startPassiveListeners();

    let mounted = true;
    async function bootstrap() {
      const profileResult = await loadProfileWithFallback();
      if (!mounted) return;
      setProfile(profileResult.profile);
      setIsOfflineFallback(profileResult.source === 'offline');
      const pathPersona =
        typeof window !== 'undefined'
          ? resolvePersonaFromPathname(window.location.pathname)
          : null;
      await engine.bootstrap(pathPersona ?? profileResult.profile.primaryArea);
      if (pathPersona) {
        engine.selectAreaDirectly(
          pathPersona,
          `URL amigável acessada: ${PERSONA_CONTENTS[pathPersona].areaLabel}`
        );
      }
    }

    const handlePopState = () => {
      const pathPersona = resolvePersonaFromPathname(window.location.pathname);
      if (pathPersona) {
        engine.selectAreaDirectly(
          pathPersona,
          `Navegação de histórico: ${PERSONA_CONTENTS[pathPersona].areaLabel}`
        );
      }
    };

    window.addEventListener('popstate', handlePopState);
    void bootstrap();

    return () => {
      mounted = false;
      window.removeEventListener('popstate', handlePopState);
      unsubscribe();
      engine.stopPassiveListeners();
    };
  }, []);

  const activePersonaContent = useMemo(
    () => PERSONA_CONTENTS[contextState.activePersona],
    [contextState.activePersona]
  );

  const whatsappDossier = useMemo(
    () =>
      buildWhatsAppTriageDossier(
        profile.whatsapp,
        profile.lawyerName,
        contextState,
        triageAnswers,
        triageNote
      ),
    [profile.whatsapp, profile.lawyerName, contextState, triageAnswers, triageNote]
  );
  const whatsappUrl = whatsappDossier.url;

  const heroPortraitSrc = useMemo(() => {
    if (heroPortraitFallback) return '/lawyer-portrait.png';
    const trimmed = profile.photoUrl?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : '/lawyer-portrait.png';
  }, [heroPortraitFallback, profile.photoUrl]);

  const handleSelectPracticeArea = useCallback(
    (area: PersonaId, source: 'hover' | 'click') => {
      const engine = engineRef.current!;
      if (source === 'click') {
        engine.selectAreaDirectly(
          area,
          `Núcleo selecionado: ${PERSONA_CONTENTS[area].areaLabel}`
        );
        if (typeof window !== 'undefined' && window.history?.pushState) {
          const slug = getPersonaFriendlySlug(area);
          if (window.location.pathname !== slug) {
            window.history.pushState({ area }, '', slug);
          }
        }
        scrollSmoothToTop();
        return;
      }

      engine.recordPassiveSignal({
        source: 'hover',
        personaId: area,
        weight: 30,
        detail: `Interesse prolongado em ${PERSONA_CONTENTS[area].areaLabel}`,
      });
    },
    []
  );

  const handleRecordTriageSignal = useCallback(
    (personaId: PersonaId, detail: string, weight: number) => {
      engineRef.current?.recordPassiveSignal({
        source: 'click',
        personaId,
        weight,
        detail,
      });
    },
    []
  );

  const handleTriageChange = useCallback(
    (answers: AdaptiveTriageAnswer[], note: string) => {
      setTriageAnswers(answers);
      setTriageNote(note);
    },
    []
  );

  const handleSectionVisible = useCallback((persona: PersonaId) => {
    if (sectionTimerRef.current[persona]) return;
    sectionTimerRef.current[persona] = window.setTimeout(() => {
      engineRef.current?.recordPassiveSignal({
        source: 'scroll',
        personaId: persona,
        weight: 10,
        detail: `Leitura informativa (${PERSONA_CONTENTS[persona].areaLabel})`,
      });
    }, 3200);
  }, []);

  const handleSimulateOrigin = useCallback((preset: LeadOriginPreset) => {
    engineRef.current?.injectSimulatedSearch(preset);
    const triageEl = document.getElementById('triagem-adaptativa');
    if (triageEl) {
      triageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      scrollSmoothToTop();
    }
  }, []);

  const handleSaveProfile = useCallback(async (nextProfile: LawyerProfile) => {
    const result = await saveProfileWithFallback(nextProfile);
    setProfile(result.profile);
    setIsOfflineFallback(!result.synced);
    return { synced: result.synced };
  }, []);

  const handleResetProfile = useCallback(async () => {
    const result = await resetProfileWithFallback();
    setProfile(result.profile);
    setIsOfflineFallback(!result.synced);
  }, []);

  const handleSaveCookieConsent = useCallback((analyticsAndContext: boolean) => {
    setCookieConsent(saveCookieConsent(analyticsAndContext));
  }, []);

  const dpoEmail = profile.dpoEmail?.trim() || 'privacidade@valencaadvocacia.adv.br';

  return (
    <div className="editorial-app">
      {/* Top Editorial Masthead */}
      <header className="masthead">
        <div className="editorial-container masthead-inner">
          <a href="#topo" className="masthead-brand" aria-label={profile.firmName}>
            <span className="brand-monogram" aria-hidden="true">
              {profile.firmName.trim().charAt(0).toUpperCase() || 'V'}
            </span>
            <div className="brand-text-group">
              <span className="brand-firm">{profile.firmName}</span>
              <span className="brand-oab">
                {profile.lawyerName} • {profile.oabNumber}
              </span>
            </div>
          </a>

          <nav className="masthead-nav" aria-label="Navegação principal">
            <a href="#triagem-adaptativa">Atendimento</a>
            <a href="#autoridade">Orientações</a>
            <a href="#areas-atuacao">Áreas de Atuação</a>
            <a href="#duvidas-frequentes">Dúvidas</a>
          </nav>

          <div className="masthead-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="masthead-cta-link"
            >
              <MessageCircle size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Falar com o Escritório</span>
            </a>

            <button
              type="button"
              className="whitelabel-trigger-btn"
              onClick={() => setWhiteLabelOpen(true)}
              title="Personalizar escritório e SEO Local (White-Label)"
              aria-label="Abrir configurações White-Label e SEO do escritório"
            >
              <Settings2 size={17} strokeWidth={1.6} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <main id="topo">
        {/* Hero Editorial Section — Asymmetric Editorial Split */}
        <section className="hero-section" data-intent-area={contextState.activePersona}>
          <div className="hero-split-layout">
            <div className="hero-portrait-column">
              <motion.div
                key={heroPortraitSrc}
                className="hero-portrait-frame"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              >
                <img
                  src={heroPortraitSrc}
                  alt={`Advogado ${profile.lawyerName} (${profile.oabNumber}) — ${activePersonaContent.areaLabel} em ${profile.city}`}
                  className="hero-portrait-img"
                  width={640}
                  height={820}
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  onError={() => {
                    if (heroPortraitSrc !== '/lawyer-portrait.png') {
                      setHeroPortraitFallback(true);
                    }
                  }}
                />
              </motion.div>
              <div className="hero-portrait-bridge" aria-hidden="true" />
            </div>

            <div className="hero-content-column">
              <div className="hero-content-inner">
                <div className="hero-meta-bar">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`ctx-badge-${contextState.activePersona}-${contextState.originSummary}`}
                      className="live-context-badge"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      transition={{ duration: 0.28 }}
                      role="status"
                      aria-live="polite"
                    >
                      <span className="live-context-dot" aria-hidden="true" />
                      <span className="live-context-label">
                        <strong>{activePersonaContent.areaLabel}</strong>
                      </span>
                    </motion.div>
                  </AnimatePresence>

                  <span className="hero-jurisdiction-tag">
                    <MapPin size={13} strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      {profile.city} • {contextState.accessPeriod}
                    </span>
                  </span>
                </div>

                <div className="hero-copy-column">
                  <KineticHeadline
                    personaKey={contextState.activePersona}
                    text={activePersonaContent.headline}
                    subheadline={activePersonaContent.subheadline}
                  />

                  <div className="hero-cta-row">
                    <a href="#triagem-adaptativa" className="btn-primary-gold">
                      <span>Conte-nos sua situação</span>
                      <ArrowDown size={15} strokeWidth={1.8} aria-hidden="true" />
                    </a>

                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary-ink"
                    >
                      <MessageCircle size={16} strokeWidth={1.7} aria-hidden="true" />
                      <span>Agendar conversa</span>
                    </a>
                  </div>
                </div>

                <aside className="hero-dossier-card" aria-label="Credencial e Jurisdição">
                  <div className="dossier-header">
                    <Scale size={15} strokeWidth={1.6} aria-hidden="true" />
                    <span>Credencial &amp; Jurisdição</span>
                  </div>
                  <div className="dossier-rule" />
                  <dl className="dossier-list">
                    <div>
                      <dt>Titular Responsável</dt>
                      <dd>{profile.lawyerName}</dd>
                    </div>
                    <div>
                      <dt>Inscrição</dt>
                      <dd>{profile.oabNumber}</dd>
                    </div>
                    <div>
                      <dt>Área em Destaque</dt>
                      <dd>{activePersonaContent.areaLabel}</dd>
                    </div>
                    <div>
                      <dt>Tribunais de Atuação</dt>
                      <dd>{activePersonaContent.courtFocus}</dd>
                    </div>
                  </dl>
                  <div className="dossier-footer-note">
                    <Shield size={13} strokeWidth={1.6} aria-hidden="true" />
                    <span>Sigilo profissional garantido (Art. 7º, Estatuto da OAB)</span>
                  </div>
                </aside>
              </div>
            </div>
          </div>
        </section>

        {/* FIRST FOLD PRIORITY: OAB-Compliant Adaptive Confirmation-Bias Triage Form */}
        <AdaptiveTriageSection
          contextState={contextState}
          lawyerName={profile.lawyerName}
          lawyerWhatsapp={profile.whatsapp}
          onSelectArea={handleSelectPracticeArea}
          onTriageChange={handleTriageChange}
          onRecordTriageSignal={handleRecordTriageSignal}
          onOpenPrivacyPolicy={() => setActiveLegalDoc('privacidade')}
          onSectionVisible={handleSectionVisible}
        />

        {/* Contextual Informative Points & Sober Credentials */}
        <AuthorityPainSection
          profile={profile}
          personaId={contextState.activePersona}
          whatsappUrl={whatsappUrl}
          onSectionVisible={handleSectionVisible}
        />

        {/* Interactive Editorial Index of Practice Areas */}
        <PracticeAreasSection
          activePersona={contextState.activePersona}
          onSelectArea={handleSelectPracticeArea}
        />

        {/* Crawlable Local SEO FAQPage & Hyperlocal NAP Regional Coverage */}
        <LocalSeoFaqSection
          profile={profile}
          activePersona={contextState.activePersona}
          onSelectArea={handleSelectPracticeArea}
        />
      </main>

      {/* Editorial Footer — Full OAB Prov. 205/2021 + LGPD + Marco Civil Compliance Stack */}
      <footer className="editorial-footer">
        <div className="editorial-container footer-main-grid">
          <div>
            <p className="footer-firm">{profile.firmName}</p>
            <p className="footer-sub">
              {profile.lawyerName} • {profile.oabNumber} • {profile.city}
            </p>
            <p className="footer-dpo-line">
              Encarregado de Dados (DPO / LGPD): <span>{dpoEmail}</span>
            </p>
          </div>

          <div className="footer-right-note">
            <nav className="footer-legal-links" aria-label="Documentos legais e privacidade">
              <button
                type="button"
                className="footer-legal-link-btn"
                onClick={() => setActiveLegalDoc('privacidade')}
              >
                Política de Privacidade (LGPD)
              </button>
              <button
                type="button"
                className="footer-legal-link-btn"
                onClick={() => setCookiePrefsOpen(true)}
              >
                Preferências de Cookies
              </button>
              <button
                type="button"
                className="footer-legal-link-btn"
                onClick={() => setActiveLegalDoc('termos')}
              >
                Termos de Uso &amp; Aviso Legal
              </button>
            </nav>
            <p>
              Este site tem caráter meramente informativo e institucional, em conformidade com o
              Código de Ética e Disciplina da OAB, o Provimento CFOAB nº 205/2021 e a Resolução
              CFOAB nº 16/2026.
            </p>
          </div>
        </div>
      </footer>

      {/* Discreet Floating Bottom-Left Field Demo Pill */}
      <LeadOriginSimulator
        contextState={contextState}
        whatsappDossierText={whatsappDossier.text}
        onSimulate={handleSimulateOrigin}
      />

      <WhiteLabelModal
        isOpen={whiteLabelOpen}
        profile={profile}
        activePersona={contextState.activePersona}
        isOfflineFallback={isOfflineFallback}
        onClose={() => setWhiteLabelOpen(false)}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
      />

      <CookieConsentBanner
        consent={cookieConsent}
        forceOpenPreferences={cookiePrefsOpen}
        onSaveConsent={handleSaveCookieConsent}
        onClosePreferences={() => setCookiePrefsOpen(false)}
      />

      <LegalDocumentModal
        activeTab={activeLegalDoc}
        profile={profile}
        onClose={() => setActiveLegalDoc(null)}
        onChangeTab={(tab) => setActiveLegalDoc(tab)}
        onOpenCookiePreferences={() => setCookiePrefsOpen(true)}
      />
    </div>
  );
}

export default App;
