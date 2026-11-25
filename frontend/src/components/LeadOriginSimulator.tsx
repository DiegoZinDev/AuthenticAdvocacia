import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Activity, ChevronDown, ChevronUp, Radio, Search } from 'lucide-react';
import { LEAD_ORIGIN_PRESETS, PERSONA_CONTENTS } from '../data/seeds';
import type { ContextState, LeadOriginPreset } from '../types/legal';

interface LeadOriginSimulatorProps {
  contextState: ContextState;
  onSimulate: (preset: LeadOriginPreset) => void;
}

export function LeadOriginSimulator({ contextState, onSimulate }: LeadOriginSimulatorProps) {
  const [expanded, setExpanded] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Close popover when clicking outside
  useEffect(() => {
    if (!expanded) return;
    const handleOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, [expanded]);

  const activePersonaLabel = PERSONA_CONTENTS[contextState.activePersona].areaLabel;

  return (
    <div
      ref={containerRef}
      className="floating-sim-wrapper"
      aria-label="Simulador de Sinal de Busca (Demonstração Presencial)"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="sim-popover"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="floating-sim-popover"
            role="dialog"
            aria-label="Cenários de busca para demonstração"
          >
            <div className="floating-sim-head">
              <div className="floating-sim-title">
                <Radio size={13} strokeWidth={1.8} aria-hidden="true" />
                <span>PredictiveIntentEngine • Demo em Campo</span>
              </div>
              <span className="floating-sim-conf">
                {Math.round(contextState.confidence * 100)}% confiança
              </span>
            </div>

            <p className="floating-sim-desc">
              Injete um sinal real de busca (Google ou Instagram) para ver a página inteira se
              reescrever ao vivo sem nenhum formulário.
            </p>

            <div className="floating-sim-list">
              {LEAD_ORIGIN_PRESETS.map((preset) => {
                const isSelected = contextState.activePersona === preset.personaId;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    className={`floating-sim-option ${isSelected ? 'is-active' : ''}`}
                    onClick={() => {
                      onSimulate(preset);
                      setExpanded(false);
                    }}
                  >
                    <Search size={13} strokeWidth={1.7} aria-hidden="true" />
                    <div className="floating-sim-opt-copy">
                      <span className="floating-sim-opt-label">{preset.label}</span>
                      <span className="floating-sim-opt-meta">
                        ?utm_source={preset.utmSource}&amp;utm_term={preset.utmTerm}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="floating-sim-telemetry">
              <Activity size={12} strokeWidth={1.7} aria-hidden="true" />
              <span>
                Ativo: <strong>{activePersonaLabel}</strong>
                {contextState.lastSignal ? ` • ${contextState.lastSignal.detail}` : ''}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={`floating-sim-pill ${expanded ? 'is-open' : ''}`}
        onClick={() => setExpanded((prev) => !prev)}
        aria-expanded={expanded}
      >
        <span className="floating-sim-dot" aria-hidden="true" />
        <span>Simular Sinal de Busca</span>
        {expanded ? (
          <ChevronUp size={14} strokeWidth={1.8} aria-hidden="true" />
        ) : (
          <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" />
        )}
      </button>
    </div>
  );
}
