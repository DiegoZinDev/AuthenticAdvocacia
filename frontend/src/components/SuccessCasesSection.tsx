import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Scale, Clock, ArrowUpRight, Sparkles, ChevronDown } from 'lucide-react';
import type { ContextState, LegalCase, PersonaId } from '../types/legal';
import { PERSONA_CONTENTS } from '../data/seeds';
import {
  LEGAL_ALERT_BY_PERSONA,
  buildWhatsAppTriageDossier,
} from '../lib/predictiveIntentEngine';

interface SuccessCasesSectionProps {
  personaId: PersonaId;
  cases: LegalCase[];
  whatsappUrl: string;
  contextState: ContextState;
  lawyerName: string;
  lawyerWhatsapp: string;
  onFocusCase: (legalCase: LegalCase | null) => void;
  onSectionVisible: (persona: PersonaId) => void;
}

export function SuccessCasesSection({
  personaId,
  cases,
  whatsappUrl,
  contextState,
  lawyerName,
  lawyerWhatsapp,
  onFocusCase,
  onSectionVisible,
}: SuccessCasesSectionProps) {
  const persona = PERSONA_CONTENTS[personaId];
  const legalAlert = LEGAL_ALERT_BY_PERSONA[personaId] ?? LEGAL_ALERT_BY_PERSONA.geral;

  const [hoveredCaseId, setHoveredCaseId] = useState<string | null>(null);
  const [pinnedCaseId, setPinnedCaseId] = useState<string | null>(null);

  useEffect(() => {
    setHoveredCaseId(null);
    setPinnedCaseId(null);
  }, [personaId]);

  const activeExpandedId = hoveredCaseId ?? pinnedCaseId;
  const hasExpanded = activeExpandedId !== null;

  const isTouchOrMobile = () =>
    typeof window !== 'undefined' &&
    (window.innerWidth < 960 || window.matchMedia('(pointer: coarse)').matches);

  const handleCardMouseEnter = (legalCase: LegalCase) => {
    if (typeof window !== 'undefined' && window.innerWidth >= 960) {
      setHoveredCaseId(legalCase.id);
    }
    onFocusCase(legalCase);
  };

  const handleGridMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth >= 960) {
      setHoveredCaseId(null);
    }
  };

  const handleCardClick = (legalCase: LegalCase, target: EventTarget | null) => {
    if (target instanceof HTMLElement && target.closest('a')) {
      return;
    }

    if (isTouchOrMobile()) {
      setPinnedCaseId((prev) => {
        const next = prev === legalCase.id ? null : legalCase.id;
        onFocusCase(next ? legalCase : null);
        return next;
      });
    } else {
      onFocusCase(legalCase);
    }
  };

  return (
    <motion.section
      id="casos-resolvidos"
      data-intent-area={personaId}
      className="cases-section"
      onViewportEnter={() => onSectionVisible(personaId)}
      viewport={{ once: false, amount: 0.25 }}
    >
      <div className="editorial-container">
        <div className="section-header-grid">
          <div>
            <p className="editorial-eyebrow">Precedentes &amp; Resultados Documentados</p>
            <h2 className="section-title">Já resolvemos um caso idêntico ao seu</h2>
          </div>
          <div className="section-header-aside">
            <p className="section-aside-copy">
              Seleção de julgados e acordos homologados em{' '}
              <strong>{persona.areaLabel}</strong> ({persona.courtFocus}), adaptada automaticamente ao
              seu contexto de busca.
            </p>
          </div>
        </div>

        <div className="editorial-rule" />

        <AnimatePresence mode="wait">
          <motion.div
            key={`cases-grid-${personaId}`}
            className="cases-grid"
            onMouseLeave={handleGridMouseLeave}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {cases.map((legalCase, idx) => {
              const isExpanded = activeExpandedId === legalCase.id;
              const isCompressed = hasExpanded && !isExpanded;
              const caseDossier = buildWhatsAppTriageDossier(
                lawyerWhatsapp,
                lawyerName,
                contextState,
                legalCase
              );

              return (
                <motion.article
                  key={legalCase.id}
                  layoutId={`case-slot-${idx}`}
                  className={`case-card ${isExpanded ? 'is-expanded' : ''} ${
                    isCompressed ? 'is-compressed' : ''
                  }`}
                  onMouseEnter={() => handleCardMouseEnter(legalCase)}
                  onClick={(e) => handleCardClick(legalCase, e.target)}
                  initial={{ opacity: 0, y: 18, filter: 'blur(4px)' }}
                  animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                  transition={{
                    duration: 0.42,
                    delay: idx * 0.08,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <div className="case-card-top">
                    <span className="case-index">0{idx + 1}</span>
                    <div className="case-court-meta">
                      <Scale size={13} strokeWidth={1.6} aria-hidden="true" />
                      <span>{legalCase.courtRef}</span>
                      <ChevronDown
                        size={13}
                        strokeWidth={1.8}
                        className={`case-mobile-chevron ${isExpanded ? 'is-rotated' : ''}`}
                        aria-hidden="true"
                      />
                    </div>
                  </div>

                  <p className="case-jurisdiction">{legalCase.processHint}</p>
                  <h3 className="case-title">{legalCase.title}</h3>

                  <div className="case-block">
                    <span className="case-block-label">Situação Encontrada</span>
                    <p className="case-block-text">{legalCase.situation}</p>
                  </div>

                  <div className="case-block">
                    <span className="case-block-label">Tese &amp; Desfecho Jurídico</span>
                    <p className="case-block-text">{legalCase.strategyAndOutcome}</p>
                  </div>

                  <AnimatePresence initial={false}>
                    {isExpanded && (
                      <motion.div
                        key={`expanded-${legalCase.id}`}
                        className="case-expanded-layer"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="case-expanded-inner">
                          <div className="case-strategic-note">
                            <span className="case-strategic-badge">
                              <Sparkles size={11} strokeWidth={1.8} aria-hidden="true" />
                              <span>Alavancagem Processual</span>
                            </span>
                            <p>
                              Precedente conduzido em <strong>{legalCase.courtRef}</strong> com
                              horizonte de <strong>{legalCase.timeframe}</strong>, resultando em{' '}
                              <strong>{legalCase.metricBadge}</strong>.
                            </p>
                          </div>

                          <a
                            href={caseDossier.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="case-precedent-cta"
                          >
                            <span>
                              Situação semelhante à sua? Solicitar análise direta deste precedente →
                            </span>
                          </a>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="case-card-footer">
                    <div className="case-metric-highlight">{legalCase.metricBadge}</div>
                    <div className="case-timeframe">
                      <Clock size={13} strokeWidth={1.6} aria-hidden="true" />
                      <span>{legalCase.timeframe}</span>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Dynamic Legal Basis & Critical Deadline Strip */}
        <AnimatePresence mode="wait">
          <motion.aside
            key={`legal-alert-${personaId}`}
            className="editorial-legal-alert-strip"
            aria-label="Fundamentação legal e prazo crítico"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="legal-alert-head">
              <span className="legal-alert-tag">{legalAlert.tag}</span>
              <strong className="legal-alert-statute">{legalAlert.statute}</strong>
            </div>
            <p className="legal-alert-detail">{legalAlert.detail}</p>
          </motion.aside>
        </AnimatePresence>

        <div className="cases-cta-strip">
          <p className="cases-cta-note">
            Análise preliminar sigilosa — sem compromisso contratual prévio, em estrita observância ao
            Código de Ética e Disciplina da OAB.
          </p>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="editorial-link-action"
          >
            <span>Submeter caso semelhante ao titular</span>
            <ArrowUpRight size={16} strokeWidth={1.7} aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.section>
  );
}
