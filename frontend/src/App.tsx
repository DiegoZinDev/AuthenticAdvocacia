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
  applyBehavioralSignal,
  applySimulatedOrigin,
  buildWhatsappUrl,
  initializeContextEngine,
} from './lib/contextEngine';
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

function createInitialContextSync(): ContextState {
  return {
    sessionId: 'init',
    activePersona: 'geral',
    scores: {
      geral: 10,
      imobiliario: 0,
      familia: 0,
      trabalhista: 0,
      previdenciario: 0,
      consumidor: 0,
    },
    confidence: 0.65,
    originSummary: 'Acesso Direto • Distrito Federal',
    lastSignal: null,
    signals: [],
    isReturningVisitor: false,
  };
}

export function App() {
  const [profile, setProfile] = useState<LawyerProfile>(DEFAULT_LAWYER_PROFILE);
  const [isOfflineFallback, setIsOfflineFallback] = useState<boolean>(false);
  const [contextState, setContextState] = useState<ContextState>(createInitialContextSync);
  const [cases, setCases] = useState<LegalCase[]>(() =>
    LEGAL_CASES.filter((c) => c.personaId === 'geral').slice(0, 3)
  );
  const [whiteLabelOpen, setWhiteLabelOpen] = useState(false);

  const sectionTimerRef = useRef<Record<string, number>>({});

  // Bootstrap Profile + 3-Layer Silent Contextual Adaptation Engine
  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      const [profileResult, initialCtx] = await Promise.all([
        loadProfileWithFallback(),
        initializeContextEngine(),
      ]);

      if (!mounted) return;
      setProfile(profileResult.profile);
      setIsOfflineFallback(profileResult.source === 'offline');
      setContextState(initialCtx);

      const initialCases = await getCasesForPersona(initialCtx.activePersona);
      if (mounted) {
        setCases(initialCases);
      }
    }

    void bootstrap();
    return () => {
      mounted = false;
    };
  }, []);

  // Load matching TJDFT/TRT-10/TRF-1 cases whenever activePersona changes
  useEffect(() => {
    let active = true;
    void getCasesForPersona(contextState.activePersona).then((nextCases) => {
      if (active) {
        setCases(nextCases);
      }
    });
    return () => {
      active = false;
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

  // Layer 3: Live behavioral tracking for practice area hover/click
  const handleSelectPracticeArea = useCallback(
    (area: PersonaId, source: 'hover' | 'click') => {
      setContextState((prev) =>
        applyBehavioralSignal(prev, {
          source,
          personaId: area,
          weight: source === 'click' ? 55 : 28,
          detail:
            source === 'click'
              ? `Seleção direta em ${PERSONA_CONTENTS[area].areaLabel}`
              : `Leitura prolongada (>=650ms) em ${PERSONA_CONTENTS[area].areaLabel}`,
        })
      );
    },
    []
  );

  // Layer 3: IntersectionObserver / reading dwell time signal
  const handleSectionVisible = useCallback((persona: PersonaId) => {
    if (sectionTimerRef.current[persona]) return;
    sectionTimerRef.current[persona] = window.setTimeout(() => {
      setContextState((prev) =>
        applyBehavioralSignal(prev, {
          source: 'scroll',
          personaId: prev.activePersona,
          weight: 8,
          detail: `Tempo de leitura aprofundada (${PERSONA_CONTENTS[prev.activePersona].areaLabel})`,
        })
      );
    }, 3500);
  }, []);

  const handleSimulateOrigin = useCallback((preset: LeadOriginPreset) => {
    setContextState((prev) => applySimulatedOrigin(prev, preset));
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
            <a href="#autoridade">Diagnóstico</a>
            <a href="#casos-resolvidos">Casos Resolvidos</a>
            <a href="#areas-atuacao">Especialidades</a>
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
        {/* Hero Editorial Section */}
        <section className="hero-section">
          <div className="editorial-container">
            <div className="hero-meta-bar">
              <AnimatePresence mode="wait">
                <motion.span
                  key={`eyebrow-${contextState.activePersona}`}
                  className="hero-eyebrow"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.3 }}
                >
                  {activePersonaContent.eyebrow}
                </motion.span>
              </AnimatePresence>

              <span className="hero-jurisdiction-tag">
                <MapPin size={13} strokeWidth={1.6} aria-hidden="true" />
                <span>{profile.city}</span>
              </span>
            </div>

            <div className="hero-editorial-grid">
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

              <div className="hero-dossier-card">
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
                    <dt>Foco Atual</dt>
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
              </div>
            </div>
          </div>
        </section>

        {/* Contextual Pain Points & Lawyer Authority Portrait */}
        <AuthorityPainSection
          profile={profile}
          personaId={contextState.activePersona}
          whatsappUrl={whatsappUrl}
          onSectionVisible={handleSectionVisible}
        />

        {/* Shared-State Transitions: Success Cases Section */}
        <SuccessCasesSection
          personaId={contextState.activePersona}
          cases={cases}
          whatsappUrl={whatsappUrl}
          onSectionVisible={handleSectionVisible}
        />

        {/* Interactive Editorial Index of Practice Areas */}
        <PracticeAreasSection
          activePersona={contextState.activePersona}
          onSelectArea={handleSelectPracticeArea}
        />
      </main>

      {/* Editorial Footer + Discreet Lead Origin Simulator */}
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

        <LeadOriginSimulator contextState={contextState} onSimulate={handleSimulateOrigin} />
      </footer>

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
