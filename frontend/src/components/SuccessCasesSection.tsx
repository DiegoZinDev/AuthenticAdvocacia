import { AnimatePresence, motion } from 'framer-motion';
import { Scale, Clock, ArrowUpRight } from 'lucide-react';
import type { LegalCase, PersonaId } from '../types/legal';
import { PERSONA_CONTENTS } from '../data/seeds';

interface SuccessCasesSectionProps {
  personaId: PersonaId;
  cases: LegalCase[];
  whatsappUrl: string;
  onSectionVisible: (persona: PersonaId) => void;
}

export function SuccessCasesSection({
  personaId,
  cases,
  whatsappUrl,
  onSectionVisible,
}: SuccessCasesSectionProps) {
  const persona = PERSONA_CONTENTS[personaId];

  return (
    <motion.section
      id="casos-resolvidos"
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
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
          >
            {cases.map((legalCase, idx) => (
              <motion.article
                key={legalCase.id}
                layoutId={`case-slot-${idx}`}
                className="case-card"
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

                <div className="case-card-footer">
                  <div className="case-metric-highlight">{legalCase.metricBadge}</div>
                  <div className="case-timeframe">
                    <Clock size={13} strokeWidth={1.6} aria-hidden="true" />
                    <span>{legalCase.timeframe}</span>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>
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
