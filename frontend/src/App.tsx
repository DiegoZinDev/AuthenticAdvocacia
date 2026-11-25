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
import { DEFAULT_LAWYER_PROFILE, LEGAL_CASES, PERSONA_CONTENTS } from './data/seeds';
import {
  PredictiveIntentEngine,
  buildWhatsappUrl,
} from './lib/predictiveIntentEngine';
import {
  getCasesForPersona,
  loadProfileWithFallback,
  resetProfileWithFallback,
  saveProfileWithFallback,
} from './lib/offlineStore';
import type {
  ContextState,
  LawyerProfile,
  LeadOriginPreset,
  LegalCase,
  PersonaId,
} from './types/legal';
import { KineticHeadline } from './components/KineticHeadline';
import { SuccessCasesSection } from './components/SuccessCasesSection';
import { PracticeAreasSection } from './components/PracticeAreasSection';
import { AuthorityPainSection } from './components/AuthorityPainSection';
import { WhiteLabelModal } from './components/WhiteLabelModal';
import { LeadOriginSimulator } from './components/LeadOriginSimulator';

function getLocalCasesStrictlyForPersona(personaId: PersonaId): LegalCase[] {
  const target: PersonaId = personaId === 'geral' ? 'imobiliario' : personaId;
  return LEGAL_CASES.filter((item) => item.personaId === target)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .slice(0, 3);
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
  const [cases, setCases] = useState<LegalCase[]>(() =>
    getLocalCasesStrictlyForPersona(engineRef.current!.getState().activePersona)
  );
  const [whiteLabelOpen, setWhiteLabelOpen] = useState(false);
  const [heroPortraitFallback, setHeroPortraitFallback] = useState(false);

  const sectionTimerRef = useRef<Record<string, number>>({});

  useEffect(() => {
    setHeroPortraitFallback(false);
  }, [profile.photoUrl]);

  // Subscribe to PredictiveIntentEngine + start passive TikTok-style listeners
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
      await engine.bootstrap(profileResult.profile.primaryArea);
    }

    void bootstrap();

    return () => {
      mounted = false;
      unsubscribe();
      engine.stopPassiveListeners();
    };
  }, []);

  // Synchronously guarantee 100% coherent cases for the active persona (zero mixing!)
  // then optionally hydrate from backend API if reachable and strictly matching
  useEffect(() => {
    const targetPersona = contextState.activePersona;
    setCases(getLocalCasesStrictlyForPersona(targetPersona));

    let current = true;
    void getCasesForPersona(targetPersona).then((remoteCases) => {
      if (!current) return;
      const strictlyMatched = remoteCases.filter((c) => c.personaId === targetPersona);
      if (strictlyMatched.length === 3) {
        setCases(strictlyMatched);
      }
    });

    return () => {
      current = false;
    };
  }, [contextState.activePersona]);

  const activePersonaContent = useMemo(
    () => PERSONA_CONTENTS[contextState.activePersona],
    [contextState.activePersona]
  );

  const whatsappUrl = useMemo(
    () => buildWhatsappUrl(profile.whatsapp, profile.lawyerName, contextState.activePersona),
    [profile.whatsapp, profile.lawyerName, contextState.activePersona]
  );

  const heroPortraitSrc = useMemo(() => {
    if (heroPortraitFallback) return '/lawyer-portrait.png';
    const trimmed = profile.photoUrl?.trim();
    return trimmed && trimmed.length > 0 ? trimmed : '/lawyer-portrait.png';
  }, [heroPortraitFallback, profile.photoUrl]);

  // Clicking a Practice Area immediately rewrites global state and smoothly scrolls to top;
  // hovering feeds passive dwell scoring into PredictiveIntentEngine
  const handleSelectPracticeArea = useCallback(
    (area: PersonaId, source: 'hover' | 'click') => {
      const engine = engineRef.current!;
      if (source === 'click') {
        engine.selectAreaDirectly(
          area,
          `Núcleo selecionado: ${PERSONA_CONTENTS[area].areaLabel}`
        );
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

  // Section reading dwell signal
  const handleSectionVisible = useCallback((persona: PersonaId) => {
    if (sectionTimerRef.current[persona]) return;
    sectionTimerRef.current[persona] = window.setTimeout(() => {
      engineRef.current?.recordPassiveSignal({
        source: 'scroll',
        personaId: persona,
        weight: 10,
        detail: `Leitura aprofundada (${PERSONA_CONTENTS[persona].areaLabel})`,
      });
    }, 3200);
  }, []);

  // Discreet bottom-left simulator injects search signal + scrolls smoothly to top
  const handleSimulateOrigin = useCallback((preset: LeadOriginPreset) => {
    engineRef.current?.injectSimulatedSearch(preset);
    scrollSmoothToTop();
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
            <a href="#casos-resolvidos">Casos Resolvidos</a>
            <a href="#autoridade">Diagnóstico</a>
            <a href="#areas-atuacao">Núcleos</a>
          </nav>

          <div className="masthead-actions">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="masthead-cta-link"
            >
              <MessageCircle size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Atendimento Direto</span>
            </a>

            <button
              type="button"
              className="whitelabel-trigger-btn"
              onClick={() => setWhiteLabelOpen(true)}
              title="Personalizar escritório (White-Label)"
              aria-label="Abrir configurações White-Label do escritório"
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
                  alt={`${profile.lawyerName} — ${profile.firmName}`}
                  className="hero-portrait-img"
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
                        Contexto identificado:{' '}
                        <strong>{activePersonaContent.badgeSubtitle}</strong>
                        <span className="live-context-score">
                          {' '}
                          • {Math.round(contextState.confidence * 100)}%
                        </span>
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
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary-gold"
                    >
                      <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />
                      <span>{activePersonaContent.ctaLabel}</span>
                    </a>

                    <a href="#casos-resolvidos" className="btn-secondary-ink">
                      <span>Ver casos idênticos resolvidos</span>
                      <ArrowDown size={15} strokeWidth={1.7} aria-hidden="true" />
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
                      <dt>Foco em Tempo Real</dt>
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

        {/* FIRST FOLD PRIORITY: Precedents & Documented Results IMMEDIATELY below Hero */}
        <SuccessCasesSection
          personaId={contextState.activePersona}
          cases={cases}
          whatsappUrl={whatsappUrl}
          onSectionVisible={handleSectionVisible}
        />

        {/* Contextual Pain Points & Lawyer Authority Portrait */}
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
      </main>

      {/* Editorial Footer */}
      <footer className="editorial-footer">
        <div className="editorial-container footer-main-grid">
          <div>
            <p className="footer-firm">{profile.firmName}</p>
            <p className="footer-sub">
              {profile.lawyerName} • {profile.oabNumber} • {profile.city}
            </p>
          </div>

          <div className="footer-right-note">
            <p>
              Conteúdo informativo e institucional em conformidade com o Provimento nº 205/2021 do
              Conselho Federal da OAB.
            </p>
          </div>
        </div>
      </footer>

      {/* Discreet Floating Bottom-Left Field Demo Pill */}
      <LeadOriginSimulator contextState={contextState} onSimulate={handleSimulateOrigin} />

      <WhiteLabelModal
        isOpen={whiteLabelOpen}
        profile={profile}
        isOfflineFallback={isOfflineFallback}
        onClose={() => setWhiteLabelOpen(false)}
        onSave={handleSaveProfile}
        onReset={handleResetProfile}
      />
    </div>
  );
}

export default App;
