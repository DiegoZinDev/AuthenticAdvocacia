import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Award, Scale } from 'lucide-react';
import { PERSONA_CONTENTS } from '../data/seeds';
import type { LawyerProfile, PersonaId } from '../types/legal';

interface AuthorityPainSectionProps {
  profile: LawyerProfile;
  personaId: PersonaId;
  whatsappUrl: string;
  onSectionVisible: (persona: PersonaId) => void;
}

const JURISDICTION_COURTS = ['TJDFT', 'TRT-10', 'TRF-1', 'STJ'];

export function AuthorityPainSection({
  profile,
  personaId,
  whatsappUrl,
  onSectionVisible,
}: AuthorityPainSectionProps) {
  const persona = PERSONA_CONTENTS[personaId];

  return (
    <motion.section
      id="autoridade"
      className="authority-section"
      onViewportEnter={() => onSectionVisible(personaId)}
      viewport={{ once: false, amount: 0.25 }}
    >
      <div className="editorial-container">
        <div className="authority-split-grid">
          {/* Left Column: Contextual Informative Points */}
          <div className="pain-column">
            <p className="editorial-eyebrow">Orientação Informativa &amp; Pontos de Atenção</p>
            <AnimatePresence mode="wait">
              <motion.h2
                key={`pain-title-${personaId}`}
                className="section-title"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.34, ease: [0.22, 1, 0.36, 1] }}
              >
                {persona.painSectionTitle}
              </motion.h2>
            </AnimatePresence>

            <div className="editorial-rule" />

            <AnimatePresence mode="wait">
              <motion.div
                key={`pain-list-${personaId}`}
                className="pain-list"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              >
                {persona.painPoints.map((point, index) => (
                  <div key={`${personaId}-p-${index}`} className="pain-item">
                    <span className="pain-numeral">I{index === 0 ? '' : index === 1 ? 'I' : 'II'}</span>
                    <div>
                      <h3 className="pain-item-title">{point.title}</h3>
                      <p className="pain-item-detail">{point.detail}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Sober Credentials, Jurisdiction & Ethical Method Panel */}
          <aside
            className="editorial-metrics-panel"
            aria-label="Credenciais, Jurisdição e Método de Atendimento"
          >
            <div className="metrics-panel-header">
              <div className="metrics-panel-eyebrow">
                <Scale size={14} strokeWidth={1.6} aria-hidden="true" />
                <span>Jurisdição &amp; Método de Atuação</span>
              </div>
              <div className="court-badges-strip" aria-label="Tribunais de atuação">
                {JURISDICTION_COURTS.map((court) => (
                  <span key={court} className="court-badge-chip">
                    {court}
                  </span>
                ))}
              </div>
            </div>

            <div className="metrics-panel-kpis">
              <div className="panel-kpi-cell">
                <span className="panel-kpi-value">{profile.experienceYears} anos</span>
                <span className="panel-kpi-label">Experiência Profissional</span>
              </div>
              <div className="panel-kpi-cell">
                <span className="panel-kpi-value">100%</span>
                <span className="panel-kpi-label">Condução pelo Titular</span>
              </div>
              <div className="panel-kpi-cell">
                <span className="panel-kpi-value">Art. 7º</span>
                <span className="panel-kpi-label">Sigilo Estatutário OAB</span>
              </div>
            </div>

            <ol className="method-steps-list" aria-label="Etapas do atendimento">
              <li>
                <strong>1. Primeiro contato:</strong> você nos conta brevemente sua situação e
                vê quais documentos podem ajudar.
              </li>
              <li>
                <strong>2. Conversa reservada:</strong> análise individualizada conduzida
                diretamente pelo advogado titular.
              </li>
              <li>
                <strong>3. Orientação clara:</strong> esclarecimento objetivo sobre os caminhos
                administrativos ou judiciais cabíveis.
              </li>
            </ol>

            <blockquote className="editorial-quote metrics-panel-quote">
              <p>“{profile.editorialQuote}”</p>
            </blockquote>

            <div className="partner-care-seal">
              <div className="partner-care-badge">
                <Award size={15} strokeWidth={1.7} aria-hidden="true" />
                <span>Atendimento Direto pelo Titular</span>
              </div>
              <p className="partner-care-identity">
                {profile.lawyerName} • {profile.oabNumber}
              </p>
              <p className="partner-care-note">{persona.authorityNote}</p>
            </div>

            <div className="metrics-panel-guarantees">
              <div className="guarantee-line">
                <ShieldCheck size={15} strokeWidth={1.6} aria-hidden="true" />
                <span>Análise técnica conduzida pessoalmente pelo advogado inscrito na OAB</span>
              </div>
            </div>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary-gold full-width"
            >
              <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />
              <span>Falar com o Escritório</span>
            </a>

            <p className="whatsapp-preview-caption">
              Atendimento informativo e reservado para <strong>{persona.areaLabel}</strong>.
            </p>
          </aside>
        </div>
      </div>
    </motion.section>
  );
}
