import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Upload, RotateCcw, Check, WifiOff, Cloud } from 'lucide-react';
import { ORDERED_PRACTICE_AREAS, PERSONA_CONTENTS } from '../data/seeds';
import type { LawyerProfile, PersonaId } from '../types/legal';

interface WhiteLabelModalProps {
  isOpen: boolean;
  profile: LawyerProfile;
  isOfflineFallback: boolean;
  onClose: () => void;
  onSave: (nextProfile: LawyerProfile) => Promise<{ synced: boolean }>;
  onReset: () => Promise<void>;
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

export function WhiteLabelModal({
  isOpen,
  profile,
  isOfflineFallback,
  onClose,
  onSave,
  onReset,
}: WhiteLabelModalProps) {
  const [draft, setDraft] = useState<LawyerProfile>(profile);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setDraft(profile);
      setFeedback(null);
    }
  }, [isOpen, profile]);

  const handlePhotoUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setDraft((prev) => ({ ...prev, photoUrl: reader.result as string }));
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    const { synced } = await onSave(draft);
    setSaving(false);
    setFeedback(
      synced
        ? 'Perfil salvo no servidor e cache local.'
        : 'Perfil salvo localmente (modo offline resiliente).'
    );
    window.setTimeout(() => {
      onClose();
    }, 650);
  };

  const handleReset = async () => {
    setSaving(true);
    await onReset();
    setSaving(false);
    setFeedback('Restaurado para o perfil padrão Dr. Henrique Valença.');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
        >
          <motion.div
            className="whitelabel-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="whitelabel-title"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Personalização Instantânea White-Label</p>
                <h2 id="whitelabel-title" className="modal-title">
                  Identidade do Escritório &amp; Titular
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Fechar painel de personalização"
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="whitelabel-form">
              <div className="photo-upload-row">
                <div className="photo-preview-box">
                  {draft.photoUrl ? (
                    <img src={draft.photoUrl} alt="Prévia da foto" className="photo-preview-img" />
                  ) : (
                    <span className="photo-preview-monogram">{getInitials(draft.lawyerName)}</span>
                  )}
                </div>
                <div className="photo-upload-controls">
                  <label className="upload-btn-label">
                    <Upload size={14} strokeWidth={1.7} aria-hidden="true" />
                    <span>Carregar foto do advogado(a)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="sr-only-input"
                    />
                  </label>
                  <button
                    type="button"
                    className="text-link-muted"
                    onClick={() => setDraft((prev) => ({ ...prev, photoUrl: '' }))}
                  >
                    Usar monograma editorial
                  </button>
                </div>
              </div>

              <div className="form-grid-two">
                <label className="field-group">
                  <span>Nome do(a) Advogado(a)</span>
                  <input
                    type="text"
                    required
                    value={draft.lawyerName}
                    onChange={(e) => setDraft({ ...draft, lawyerName: e.target.value })}
                    placeholder="Ex.: Dra. Camila Rezende"
                  />
                </label>

                <label className="field-group">
                  <span>Registro OAB</span>
                  <input
                    type="text"
                    required
                    value={draft.oabNumber}
                    onChange={(e) => setDraft({ ...draft, oabNumber: e.target.value })}
                    placeholder="Ex.: OAB/DF 52.140"
                  />
                </label>
              </div>

              <label className="field-group">
                <span>Nome do Escritório / Sociedade</span>
                <input
                  type="text"
                  required
                  value={draft.firmName}
                  onChange={(e) => setDraft({ ...draft, firmName: e.target.value })}
                  placeholder="Ex.: Rezende & Costa Advogados"
                />
              </label>

              <div className="form-grid-two">
                <label className="field-group">
                  <span>WhatsApp (com DDD)</span>
                  <input
                    type="tel"
                    required
                    value={draft.whatsapp}
                    onChange={(e) => setDraft({ ...draft, whatsapp: e.target.value })}
                    placeholder="5561998421048"
                  />
                </label>

                <label className="field-group">
                  <span>Cidade / Seccional</span>
                  <input
                    type="text"
                    required
                    value={draft.city}
                    onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                    placeholder="Gama & Brasília/DF"
                  />
                </label>
              </div>

              <div className="form-grid-two">
                <label className="field-group">
                  <span>Especialidade Principal</span>
                  <select
                    value={draft.primaryArea}
                    onChange={(e) =>
                      setDraft({ ...draft, primaryArea: e.target.value as PersonaId })
                    }
                  >
                    <option value="geral">Advocacia Estratégica (Geral)</option>
                    {ORDERED_PRACTICE_AREAS.map((areaId) => (
                      <option key={areaId} value={areaId}>
                        {PERSONA_CONTENTS[areaId].areaLabel}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="field-group">
                  <span>Anos de Atuação</span>
                  <input
                    type="number"
                    min={1}
                    max={60}
                    value={draft.experienceYears}
                    onChange={(e) =>
                      setDraft({ ...draft, experienceYears: Number(e.target.value) || 1 })
                    }
                  />
                </label>
              </div>

              {feedback && (
                <div className="modal-feedback">
                  <Check size={14} strokeWidth={2} aria-hidden="true" />
                  <span>{feedback}</span>
                </div>
              )}

              <div className="modal-footer-actions">
                <div className="sync-status-note">
                  {isOfflineFallback ? (
                    <>
                      <WifiOff size={13} strokeWidth={1.7} aria-hidden="true" />
                      <span>Persistência IndexedDB ativa</span>
                    </>
                  ) : (
                    <>
                      <Cloud size={13} strokeWidth={1.7} aria-hidden="true" />
                      <span>Sincronizado com API</span>
                    </>
                  )}
                </div>

                <div className="modal-buttons-group">
                  <button
                    type="button"
                    className="btn-outline-subtle"
                    onClick={handleReset}
                    disabled={saving}
                  >
                    <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
                    <span>Padrão</span>
                  </button>
                  <button type="submit" className="btn-primary-gold" disabled={saving}>
                    {saving ? 'Aplicando...' : 'Aplicar ao Vivo'}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
