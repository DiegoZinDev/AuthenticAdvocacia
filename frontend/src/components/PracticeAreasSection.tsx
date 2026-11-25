import { useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { ORDERED_PRACTICE_AREAS, PERSONA_CONTENTS } from '../data/seeds';
import type { PersonaId } from '../types/legal';

interface PracticeAreasSectionProps {
  activePersona: PersonaId;
  onSelectArea: (area: PersonaId, source: 'hover' | 'click') => void;
}

export function PracticeAreasSection({
  activePersona,
  onSelectArea,
}: PracticeAreasSectionProps) {
  const hoverTimersRef = useRef<Record<string, number>>({});

  const handleMouseEnter = (area: PersonaId) => {
    window.clearTimeout(hoverTimersRef.current[area]);
    hoverTimersRef.current[area] = window.setTimeout(() => {
      onSelectArea(area, 'hover');
    }, 550);
  };

  const handleMouseLeave = (area: PersonaId) => {
    window.clearTimeout(hoverTimersRef.current[area]);
  };

  return (
    <section id="areas-atuacao" className="areas-section">
      <div className="editorial-container">
        <div className="section-header-grid">
          <div>
            <p className="editorial-eyebrow">Índice de Especialidades</p>
            <h2 className="section-title">Núcleos de Atuação Jurídica</h2>
          </div>
          <div className="section-header-aside">
            <p className="section-aside-copy">
              Selecione ou examine um núcleo abaixo. Toda a página — precedentes, diagnóstico e
              direcionamento de atendimento — adapta-se imediatamente à sua necessidade.
            </p>
          </div>
        </div>

        <div className="editorial-rule" />

        <div className="areas-index-list" role="list">
          {ORDERED_PRACTICE_AREAS.map((areaId, index) => {
            const content = PERSONA_CONTENTS[areaId];
            const isSelected = activePersona === areaId;

            return (
              <motion.button
                key={areaId}
                type="button"
                role="listitem"
                data-intent-area={areaId}
                className={`area-index-row ${isSelected ? 'is-active' : ''}`}
                onMouseEnter={() => handleMouseEnter(areaId)}
                onMouseLeave={() => handleMouseLeave(areaId)}
                onClick={() => onSelectArea(areaId, 'click')}
                whileHover={{ x: 4 }}
                transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="area-row-left">
                  <span className="area-row-number">0{index + 1}</span>
                  <div>
                    <div className="area-row-title-line">
                      <span className="area-row-title">{content.areaLabel}</span>
                      {isSelected && (
                        <span className="area-selected-indicator">
                          <Check size={12} strokeWidth={2} aria-hidden="true" />
                          <span>Em foco</span>
                        </span>
                      )}
                    </div>
                    <p className="area-row-eyebrow">{content.eyebrow}</p>
                  </div>
                </div>

                <div className="area-row-right">
                  <span className="area-row-court">{content.courtFocus}</span>
                  <span className="area-row-arrow">
                    <ArrowRight size={17} strokeWidth={1.6} aria-hidden="true" />
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
