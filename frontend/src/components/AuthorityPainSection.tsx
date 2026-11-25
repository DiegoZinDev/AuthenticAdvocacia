import { AnimatePresence, motion } from 'framer-motion';
import { MessageCircle, ShieldCheck, Award } from 'lucide-react';
import { PERSONA_CONTENTS } from '../data/seeds';
import type { LawyerProfile, PersonaId } from '../types/legal';

interface AuthorityPainSectionProps {
  profile: LawyerProfile;
  personaId: PersonaId;
  whatsappUrl: string;
  onSectionVisible: (persona: PersonaId) => void;
}

function getInitials(name: string): string {
  const parts = name
    .replace(/^(Dr\.|Dra\.)\s+/i, '')
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return 'HV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function AuthorityPainSection({
  profile,
  personaId,
  whatsappUrl,
  onSectionVisible,
}: AuthorityPainSectionProps) {
  const persona = PERSONA_CONTENTS[personaId];
  const initials = getInitials(profile.lawyerName);

  return (
    <motion.section
      id="autoridade"
      className="authority-section"
      onViewportEnter={() => onSectionVisible(personaId)}
      viewport={{ once: false, amount: 0.25 }}
    >
      <div className="editorial-container">
        <div className="authority-split-grid">
          {/* Left Column: Contextual Pain Points */}
          <div className="pain-column">
            <p className="editorial-eyebrow">Diagnóstico Jurídico Imediato</p>
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

            <blockquote className="editorial-quote">
              <p>“{profile.editorialQuote}”</p>
              <footer>
                — {profile.lawyerName}, {profile.oabNumber}
              </footer>
            </blockquote>
          </div>

          {/* Right Column: Lawyer Authority Portrait & Direct WhatsApp */}
          <aside className="lawyer-authority-card" aria-label="Credenciais do advogado titular">
            <div className="portrait-frame">
              {profile.photoUrl ? (
                <img
                  src={profile.photoUrl}
                  alt={`Retrato profissional de ${profile.lawyerName}`}
                  className="portrait-image"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const fallback = target.nextElementSibling as HTMLElement | null;
                    if (fallback) fallback.style.display = 'flex';
                  }}
                />
              ) : null}
              <div
                className="portrait-monogram-fallback"
                style={{ display: profile.photoUrl ? 'none' : 'flex' }}
              >
                <span>{initials}</span>
              </div>
              <div className="portrait-oab-plate">
                <span>{profile.oabNumber}</span>
                <span>{profile.city}</span>
              </div>
            </div>

            <div className="authority-body">
              <p className="authority-firm">{profile.firmName}</p>
              <h3 className="authority-lawyer-name">{profile.lawyerName}</h3>
              <p className="authority-note">{persona.authorityNote}</p>

              <div className="authority-metrics">
                <div className="authority-metric-cell">
                  <span className="metric-value">{profile.experienceYears} anos</span>
                  <span className="metric-label">Atuação em Tribunais</span>
                </div>
                <div className="authority-metric-cell">
                  <span className="metric-value">+{profile.solvedCasesCount}</span>
                  <span className="metric-label">Casos Conduzidos</span>
                </div>
              </div>

              <div className="authority-guarantees">
                <div className="guarantee-line">
                  <ShieldCheck size={15} strokeWidth={1.6} aria-hidden="true" />
                  <span>Atendimento direto com o sócio titular, sem triagem robotizada</span>
                </div>
                <div className="guarantee-line">
                  <Award size={15} strokeWidth={1.6} aria-hidden="true" />
                  <span>Parecer de viabilidade processual em linguagem clara</span>
                </div>
              </div>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary-gold full-width"
              >
                <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />
                <span>{persona.ctaLabel}</span>
              </a>

              <p className="whatsapp-preview-caption">
                Mensagem pré-configurada para <strong>{persona.areaLabel}</strong>.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </motion.section>
  );
}
