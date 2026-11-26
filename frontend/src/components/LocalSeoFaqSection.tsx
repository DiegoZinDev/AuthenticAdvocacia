import { useState } from 'react';
import { ChevronDown, Clock, Compass, HelpCircle, MapPin, Navigation } from 'lucide-react';
import { ORDERED_PRACTICE_AREAS, PERSONA_CONTENTS } from '../data/seeds';
import {
  buildLocalFaqForPersona,
  resolveWhiteLabelSeoConfig,
} from '../lib/seoEngine';
import type { LawyerProfile, PersonaId } from '../types/legal';

interface LocalSeoFaqSectionProps {
  profile: LawyerProfile;
  activePersona: PersonaId;
  onSelectArea: (area: PersonaId, source: 'click') => void;
}

export function LocalSeoFaqSection({
  profile,
  activePersona,
  onSelectArea,
}: LocalSeoFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const seo = resolveWhiteLabelSeoConfig(profile);
  const faqItems = buildLocalFaqForPersona(profile, activePersona);
  const persona = PERSONA_CONTENTS[activePersona];

  return (
    <section
      id="duvidas-frequentes"
      className="local-seo-section"
      aria-labelledby="local-seo-heading"
    >
      <div className="editorial-container">
        <div className="local-seo-grid">
          {/* Left Column: Crawlable Informative FAQ (Schema.org FAQPage) */}
          <div className="local-faq-column">
            <p className="editorial-eyebrow">
              Dúvidas Frequentes • Caráter Informativo ({seo.cityName}/{seo.stateCode})
            </p>
            <h2 id="local-seo-heading" className="section-title">
              Perguntas comuns sobre {persona.areaLabel} em {seo.cityName}
            </h2>
            <p className="local-seo-lead">
              Respostas diretas, em linguagem clara e sem juridiquês, para orientar o primeiro
              passo antes da sua conversa com o advogado titular.
            </p>

            <div className="local-faq-list">
              {faqItems.map((item, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <article key={item.question} className="local-faq-item">
                    <h3 className="local-faq-heading">
                      <button
                        type="button"
                        className={`local-faq-trigger ${isOpen ? 'is-open' : ''}`}
                        aria-expanded={isOpen}
                        onClick={() => setOpenIndex(isOpen ? null : idx)}
                      >
                        <span>{item.question}</span>
                        <ChevronDown size={16} strokeWidth={1.8} aria-hidden="true" />
                      </button>
                    </h3>
                    <div
                      className={`local-faq-answer-wrap ${isOpen ? 'is-open' : ''}`}
                      hidden={!isOpen}
                    >
                      <p className="local-faq-answer">{item.answer}</p>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>

          {/* Right Column: Local NAP Card + Hyperlocal Neighborhood Coverage + Internal Links */}
          <aside className="local-nap-card" aria-label="Atuação Regional e Endereço">
            <div className="local-nap-head">
              <Compass size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>Atendimento Local &amp; Digital</span>
            </div>

            <h3 className="local-nap-title">
              {profile.firmName} em {seo.cityName}/{seo.stateCode}
            </h3>

            <dl className="local-nap-details">
              <div>
                <dt>
                  <MapPin size={13} strokeWidth={1.7} aria-hidden="true" />
                  <span>Endereço / Base</span>
                </dt>
                <dd>
                  {seo.streetAddress}
                  {seo.postalCode ? ` — CEP ${seo.postalCode}` : ''}
                </dd>
              </div>
              <div>
                <dt>
                  <Clock size={13} strokeWidth={1.7} aria-hidden="true" />
                  <span>Horário Comercial</span>
                </dt>
                <dd>{seo.openingHours}</dd>
              </div>
              <div>
                <dt>
                  <HelpCircle size={13} strokeWidth={1.7} aria-hidden="true" />
                  <span>Responsável Técnico</span>
                </dt>
                <dd>
                  {profile.lawyerName} ({profile.oabNumber})
                </dd>
              </div>
            </dl>

            <div className="local-neighborhoods-block">
              <p className="local-nap-subhead">
                <Navigation size={12} strokeWidth={1.7} aria-hidden="true" />
                <span>Regiões e bairros atendidos em {seo.cityName}/{seo.stateCode}</span>
              </p>
              <ul className="local-neighborhood-chips">
                {seo.neighborhoods.map((region) => (
                  <li key={region} className="local-neighborhood-chip">
                    {region}
                  </li>
                ))}
              </ul>
            </div>

            <div className="local-internal-links-block">
              <p className="local-nap-subhead">Guias informativos por área</p>
              <nav className="local-internal-links" aria-label="Links internos de áreas jurídicas">
                {ORDERED_PRACTICE_AREAS.map((areaId) => (
                  <button
                    key={areaId}
                    type="button"
                    className={`local-internal-link-chip ${
                      activePersona === areaId ? 'is-active' : ''
                    }`}
                    onClick={() => onSelectArea(areaId, 'click')}
                  >
                    {PERSONA_CONTENTS[areaId].areaLabel}
                  </button>
                ))}
              </nav>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
