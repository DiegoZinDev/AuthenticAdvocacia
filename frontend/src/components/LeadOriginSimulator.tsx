import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Activity,
  BatteryCharging,
  ChevronDown,
  ChevronUp,
  Clock,
  Cpu,
  MessageCircle,
  Radio,
  Search,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import {
  CROSS_INTENT_PRESETS,
  LEAD_ORIGIN_PRESETS,
  PERSONA_CONTENTS,
} from '../data/seeds';
import type { ContextState, LeadOriginPreset } from '../types/legal';

interface LeadOriginSimulatorProps {
  contextState: ContextState;
  whatsappDossierText: string;
  onSimulate: (preset: LeadOriginPreset) => void;
}

type SimulatorTab = 'cross-intent' | 'direct';

export function LeadOriginSimulator({
  contextState,
  whatsappDossierText,
  onSimulate,
}: LeadOriginSimulatorProps) {
  const [expanded, setExpanded] = useState(false);
  const [tab, setTab] = useState<SimulatorTab>('cross-intent');
  const [showDossierPreview, setShowDossierPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

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
  const t = contextState.telemetry;
  const presets = tab === 'cross-intent' ? CROSS_INTENT_PRESETS : LEAD_ORIGIN_PRESETS;

  return (
    <div
      ref={containerRef}
      className="floating-sim-wrapper"
      aria-label="Simulador de Sinal de Busca — Neural Context Fusion Engine"
    >
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="sim-popover"
            initial={{ opacity: 0, y: 12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="floating-sim-popover is-neural"
            role="dialog"
            aria-label="Neural Context Fusion Engine — Cenários de Demonstração"
          >
            <div className="floating-sim-head">
              <div className="floating-sim-title">
                <Radio size={13} strokeWidth={1.8} aria-hidden="true" />
                <span>Neural Context Fusion • 25+ Sinais</span>
              </div>
              <span className="floating-sim-conf">
                {Math.round(contextState.confidence * 100)}% confiança
              </span>
            </div>

            {/* Live Brain Mini-Telemetry Matrix */}
            <div className="neural-brain-grid" aria-label="Telemetria em tempo real">
              <div className="neural-metric">
                <Smartphone size={11} strokeWidth={1.7} aria-hidden="true" />
                <span>
                  {t.deviceLabel} • {t.connectionType}
                </span>
              </div>
              <div className="neural-metric">
                <BatteryCharging size={11} strokeWidth={1.7} aria-hidden="true" />
                <span className={t.batteryCritical ? 'is-critical' : ''}>
                  Bat. {t.batteryLabel}
                </span>
              </div>
              <div className="neural-metric">
                <Clock size={11} strokeWidth={1.7} aria-hidden="true" />
                <span>{t.accessHourLabel}</span>
              </div>
              <div className="neural-metric">
                <Activity size={11} strokeWidth={1.7} aria-hidden="true" />
                <span>
                  Dwell {(t.dwellMs / 1000).toFixed(1)}s • {t.reReadCount}x releit. •{' '}
                  {t.scrollVelocityPxSec}px/s
                </span>
              </div>
              <div className="neural-vector-line">
                <Cpu size={11} strokeWidth={1.7} aria-hidden="true" />
                <span>
                  Vetor: <strong>{t.semanticVectorSummary}</strong>
                </span>
              </div>
            </div>

            {/* 2 Clean Sub-Tabs: Cross-Intent Clues vs 8 Direct Search Areas */}
            <div className="sim-subtabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'cross-intent'}
                className={`sim-subtab-btn ${tab === 'cross-intent' ? 'is-active' : ''}`}
                onClick={() => setTab('cross-intent')}
              >
                <Sparkles size={11} strokeWidth={1.8} aria-hidden="true" />
                <span>Inferência Indireta (Pistas)</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === 'direct'}
                className={`sim-subtab-btn ${tab === 'direct' ? 'is-active' : ''}`}
                onClick={() => setTab('direct')}
              >
                <Search size={11} strokeWidth={1.8} aria-hidden="true" />
                <span>Buscas Diretas (8 Áreas)</span>
              </button>
            </div>

            <div className="floating-sim-list is-scrollable">
              {presets.map((preset) => {
                const isSelected =
                  contextState.activePersona === preset.personaId &&
                  contextState.originSummary === preset.label;
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
                    {preset.mode === 'cross-intent' ? (
                      <Sparkles size={13} strokeWidth={1.7} aria-hidden="true" />
                    ) : (
                      <Search size={13} strokeWidth={1.7} aria-hidden="true" />
                    )}
                    <div className="floating-sim-opt-copy">
                      <span className="floating-sim-opt-label">{preset.label}</span>
                      <span className="floating-sim-opt-deduction">{preset.deductionLabel}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="sim-dossier-toggle-wrap">
              <button
                type="button"
                className={`sim-dossier-toggle-btn ${showDossierPreview ? 'is-open' : ''}`}
                onClick={() => setShowDossierPreview((prev) => !prev)}
                aria-expanded={showDossierPreview}
              >
                <MessageCircle size={12} strokeWidth={1.8} aria-hidden="true" />
                <span>Ver Mensagem Gerada para o WhatsApp do Advogado</span>
                {showDossierPreview ? (
                  <ChevronUp size={12} strokeWidth={1.8} aria-hidden="true" />
                ) : (
                  <ChevronDown size={12} strokeWidth={1.8} aria-hidden="true" />
                )}
              </button>

              <AnimatePresence initial={false}>
                {showDossierPreview && (
                  <motion.div
                    key="whatsapp-dossier-preview"
                    className="sim-whatsapp-preview-card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <div className="sim-whatsapp-preview-inner">
                      <span className="sim-whatsapp-preview-label">
                        Prévia da Triagem Silenciosa • WhatsApp
                      </span>
                      <pre className="sim-whatsapp-preview-text">{whatsappDossierText}</pre>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="floating-sim-telemetry">
              <Activity size={12} strokeWidth={1.7} aria-hidden="true" />
              <span>
                Núcleo ativo: <strong>{activePersonaLabel}</strong> • URL sincronizada com{' '}
                <code>ctx_score={Math.round(contextState.confidence * 100)}</code>
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
