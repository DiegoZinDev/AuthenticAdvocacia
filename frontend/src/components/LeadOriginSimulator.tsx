import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Compass, ChevronUp, ChevronDown, Activity } from 'lucide-react';
import { LEAD_ORIGIN_PRESETS, PERSONA_CONTENTS } from '../data/seeds';
import type { ContextState, LeadOriginPreset } from '../types/legal';

interface LeadOriginSimulatorProps {
  contextState: ContextState;
  onSimulate: (preset: LeadOriginPreset) => void;
}

export function LeadOriginSimulator({ contextState, onSimulate }: LeadOriginSimulatorProps) {
  const [expanded, setExpanded] = useState(false);

  const activePersonaLabel = PERSONA_CONTENTS[contextState.activePersona].areaLabel;

  return (
    <div className="simulator-dock" aria-label="Simulador de Origem do Lead">
      <div className="editorial-container">
        <div className="simulator-bar-header">
          <div className="simulator-status-summary">
            <Compass size={15} strokeWidth={1.6} aria-hidden="true" />
            <span className="simulator-title-label">Simular Origem do Lead</span>
            <span className="simulator-divider" aria-hidden="true">
              |
            </span>
            <span className="simulator-current-reading">
              Persona inferida: <strong>{activePersonaLabel}</strong> (
              {Math.round(contextState.confidence * 100)}%)
            </span>
          </div>

          <button
            type="button"
            className="simulator-toggle-btn"
            onClick={() => setExpanded((prev) => !prev)}
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Recolher cenários' : 'Testar cenários de busca'}</span>
            {expanded ? (
              <ChevronDown size={15} strokeWidth={1.7} aria-hidden="true" />
            ) : (
              <ChevronUp size={15} strokeWidth={1.7} aria-hidden="true" />
            )}
          </button>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              style={{ overflow: 'hidden' }}
            >
              <div className="simulator-panel-body">
                <p className="simulator-helper-copy">
                  Demonstração em campo: selecione como o cliente chegou ao escritório para observar a
                  adaptação silenciosa de manchetes, dores jurídicas, casos reais e mensagem de
                  WhatsApp.
                </p>

                <div className="simulator-presets-grid">
                  {LEAD_ORIGIN_PRESETS.map((preset) => {
                    const isSelected = contextState.activePersona === preset.personaId;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        className={`simulator-preset-btn ${isSelected ? 'is-active' : ''}`}
                        onClick={() => onSimulate(preset)}
                      >
                        <span className="preset-label">{preset.label}</span>
                        <span className="preset-param">
                          {preset.utmTerm ? `?utm_term=${preset.utmTerm}` : 'Acesso direto'}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {contextState.lastSignal && (
                  <div className="simulator-telemetry-line">
                    <Activity size={13} strokeWidth={1.6} aria-hidden="true" />
                    <span>
                      Último sinal capturado: <strong>{contextState.lastSignal.source}</strong> (
                      {contextState.lastSignal.detail}) • Origem: {contextState.originSummary}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
