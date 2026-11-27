import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  X,
  Upload,
  RotateCcw,
  Check,
  WifiOff,
  Cloud,
  Search,
  Download,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { ORDERED_PRACTICE_AREAS, PERSONA_CONTENTS } from '../data/seeds';
import {
  SEO_DESCRIPTION_MAX_CHARS,
  SEO_TITLE_MAX_CHARS,
  auditWhiteLabelSeo,
  buildDynamicSeoMetadata,
  generateClientRobotsTxt,
  generateClientSitemapXml,
  resolveWhiteLabelSeoConfig,
} from '../lib/seoEngine';
import type { LawyerProfile, PersonaId, WhiteLabelSeoConfig } from '../types/legal';

interface WhiteLabelModalProps {
  isOpen: boolean;
  profile: LawyerProfile;
  activePersona: PersonaId;
  isOfflineFallback: boolean;
  onClose: () => void;
  onSave: (nextProfile: LawyerProfile) => Promise<{ synced: boolean }>;
  onReset: () => Promise<void>;
}

type ModalTab = 'identidade' | 'seo';

function getInitials(name: string): string {
  const parts = name
    .replace(/^(Dr\.|Dra\.)\s+/i, '')
    .trim()
    .split(/\s+/);
  if (parts.length === 0) return 'HV';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function downloadTextFile(filename: string, content: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function resizeImageToDataUrl(
  file: File,
  maxDimension = 960,
  quality = 0.86
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Falha ao ler arquivo de imagem.'));
    reader.onload = () => {
      const rawDataUrl = typeof reader.result === 'string' ? reader.result : '';
      if (!rawDataUrl) {
        reject(new Error('Imagem vazia.'));
        return;
      }

      const img = new Image();
      img.onerror = () => resolve(rawDataUrl);
      img.onload = () => {
        try {
          const width = img.naturalWidth || img.width;
          const height = img.naturalHeight || img.height;
          if (!width || !height) {
            resolve(rawDataUrl);
            return;
          }

          const scale = Math.min(1, maxDimension / Math.max(width, height));
          const targetW = Math.max(1, Math.round(width * scale));
          const targetH = Math.max(1, Math.round(height * scale));

          const canvas = document.createElement('canvas');
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(rawDataUrl);
            return;
          }

          ctx.fillStyle = '#F7F5F0';
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetW, targetH);

          const resizedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(resizedDataUrl || rawDataUrl);
        } catch {
          resolve(rawDataUrl);
        }
      };
      img.src = rawDataUrl;
    };
    reader.readAsDataURL(file);
  });
}

export function WhiteLabelModal({
  isOpen,
  profile,
  activePersona,
  isOfflineFallback,
  onClose,
  onSave,
  onReset,
}: WhiteLabelModalProps) {
  const [activeTab, setActiveTab] = useState<ModalTab>('identidade');
  const [draft, setDraft] = useState<LawyerProfile>(profile);
  const [neighborhoodsText, setNeighborhoodsText] = useState<string>('');
  const [keywordsText, setKeywordsText] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      const resolvedSeo = resolveWhiteLabelSeoConfig(profile);
      setDraft({ ...profile, seo: resolvedSeo });
      setNeighborhoodsText(resolvedSeo.neighborhoods.join(', '));
      setKeywordsText(resolvedSeo.focusKeywords.join(', '));
      setFeedback(null);
    }
  }, [isOpen, profile]);

  const updateSeoField = <K extends keyof WhiteLabelSeoConfig>(
    key: K,
    value: WhiteLabelSeoConfig[K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      seo: {
        ...resolveWhiteLabelSeoConfig(prev),
        [key]: value,
      },
    }));
  };

  const liveSeoMeta = useMemo(
    () => buildDynamicSeoMetadata(draft, activePersona),
    [draft, activePersona]
  );

  const liveSeoAudit = useMemo(
    () => auditWhiteLabelSeo(draft, activePersona),
    [draft, activePersona]
  );

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    try {
      const resizedDataUrl = await resizeImageToDataUrl(file);
      setDraft((prev) => ({ ...prev, photoUrl: resizedDataUrl }));
    } catch {
      // Ignore unreadable image selection
    } finally {
      input.value = '';
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);

    const parsedNeighborhoods = neighborhoodsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);
    const parsedKeywords = keywordsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const nextProfile: LawyerProfile = {
      ...draft,
      seo: {
        ...resolveWhiteLabelSeoConfig(draft),
        neighborhoods: parsedNeighborhoods.length > 0 ? parsedNeighborhoods : [resolveWhiteLabelSeoConfig(draft).cityName],
        focusKeywords: parsedKeywords,
      },
    };

    const { synced } = await onSave(nextProfile);
    setSaving(false);
    setFeedback(
      synced
        ? 'Perfil e SEO Local aplicados no servidor e cache local.'
        : 'Perfil e SEO Local aplicados ao vivo (modo offline resiliente).'
    );
    window.setTimeout(() => {
      onClose();
    }, 650);
  };

  const handleReset = async () => {
    setSaving(true);
    await onReset();
    setSaving(false);
    setFeedback('Restaurado para o perfil padrão Ribeiro & Silva Advogados.');
  };

  const currentSeo = resolveWhiteLabelSeoConfig(draft);

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
            className="whitelabel-modal whitelabel-modal-wide"
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
                  Identidade OAB &amp; Motor de SEO Local
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

            <div className="whitelabel-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'identidade'}
                className={`whitelabel-tab-btn ${activeTab === 'identidade' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('identidade')}
              >
                <Building2 size={14} strokeWidth={1.7} aria-hidden="true" />
                <span>Identidade &amp; OAB</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'seo'}
                className={`whitelabel-tab-btn ${activeTab === 'seo' ? 'is-active' : ''}`}
                onClick={() => setActiveTab('seo')}
              >
                <Search size={14} strokeWidth={1.7} aria-hidden="true" />
                <span>SEO Local &amp; Google ({liveSeoAudit.score}/100)</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="whitelabel-form">
              {activeTab === 'identidade' ? (
                <>
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
                      <span>Cidade / Seccional (Exibição)</span>
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

                  <div className="form-grid-two">
                    <label className="field-group">
                      <span>Modalidade OAB (Art. 44 CED)</span>
                      <select
                        value={draft.practiceModel ?? 'sociedade_advogados'}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            practiceModel: e.target.value as LawyerProfile['practiceModel'],
                          })
                        }
                      >
                        <option value="advogado_autonomo">Advogado(a) Autônomo(a)</option>
                        <option value="sociedade_individual">Sociedade Individual de Advocacia</option>
                        <option value="sociedade_advogados">Sociedade de Advogados</option>
                      </select>
                    </label>

                    <label className="field-group">
                      <span>E-mail do Encarregado (DPO / LGPD)</span>
                      <input
                        type="email"
                        value={draft.dpoEmail ?? ''}
                        onChange={(e) => setDraft({ ...draft, dpoEmail: e.target.value })}
                        placeholder="privacidade@escritorio.adv.br"
                      />
                    </label>
                  </div>

                  <p className="whitelabel-oab-note">
                    Conformidade OAB: Nome, inscrição OAB e canal DPO são exibidos no rodapé
                    institucional. Vedada divulgação conjunta de atividades não advocatícias (Art. 1º,
                    §3º, Lei nº 8.906/1994).
                  </p>
                </>
              ) : (
                <>
                  {/* Live Google SERP Preview */}
                  <div className="seo-serp-preview" aria-label="Prévia de exibição no Google">
                    <div className="seo-serp-header">
                      <span>Prévia no Google (1ª Página)</span>
                      <span className={`seo-score-pill grade-${liveSeoAudit.grade.toLowerCase()}`}>
                        SEO {liveSeoAudit.score}/100 • {liveSeoAudit.grade}
                      </span>
                    </div>
                    <p className="seo-serp-url">{liveSeoMeta.canonicalUrl}</p>
                    <p className="seo-serp-title">{liveSeoMeta.title}</p>
                    <p className="seo-serp-desc">{liveSeoMeta.description}</p>
                  </div>

                  <div className="form-grid-two">
                    <label className="field-group">
                      <span>Domínio Oficial do Cliente (HTTPS)</span>
                      <input
                        type="url"
                        value={currentSeo.siteUrl}
                        onChange={(e) => updateSeoField('siteUrl', e.target.value)}
                        placeholder="https://escritoriodocliente.adv.br"
                      />
                    </label>

                    <label className="field-group">
                      <span>Link Google Perfil da Empresa (Maps)</span>
                      <input
                        type="url"
                        value={currentSeo.googleBusinessUrl ?? ''}
                        onChange={(e) => updateSeoField('googleBusinessUrl', e.target.value)}
                        placeholder="https://maps.google.com/?cid=..."
                      />
                    </label>
                  </div>

                  <div className="form-grid-two">
                    <label className="field-group">
                      <span>Cidade Principal (SEO Local)</span>
                      <input
                        type="text"
                        value={currentSeo.cityName}
                        onChange={(e) => updateSeoField('cityName', e.target.value)}
                        placeholder="Ex.: Brasília, Goiânia, São Paulo"
                      />
                    </label>

                    <label className="field-group">
                      <span>UF (2 letras)</span>
                      <input
                        type="text"
                        maxLength={2}
                        value={currentSeo.stateCode}
                        onChange={(e) => updateSeoField('stateCode', e.target.value.toUpperCase())}
                        placeholder="DF"
                      />
                    </label>
                  </div>

                  <label className="field-group">
                    <span>Bairros / Regiões Atendidas (separados por vírgula — "perto de mim")</span>
                    <input
                      type="text"
                      value={neighborhoodsText}
                      onChange={(e) => {
                        setNeighborhoodsText(e.target.value);
                        updateSeoField(
                          'neighborhoods',
                          e.target.value
                            .split(',')
                            .map((v) => v.trim())
                            .filter(Boolean)
                        );
                      }}
                      placeholder="Gama, Águas Claras, Taguatinga, Asa Sul, Asa Norte"
                    />
                  </label>

                  <div className="form-grid-two">
                    <label className="field-group">
                      <span>Endereço Comercial (NAP Local)</span>
                      <input
                        type="text"
                        value={currentSeo.streetAddress}
                        onChange={(e) => updateSeoField('streetAddress', e.target.value)}
                        placeholder="Rua/Quadra, Número, Sala — Bairro"
                      />
                    </label>

                    <label className="field-group">
                      <span>CEP &amp; Horário</span>
                      <input
                        type="text"
                        value={currentSeo.postalCode}
                        onChange={(e) => updateSeoField('postalCode', e.target.value)}
                        placeholder="70306-900"
                      />
                    </label>
                  </div>

                  <label className="field-group">
                    <span>Palavras-Chave Foco do Cliente (separadas por vírgula)</span>
                    <input
                      type="text"
                      value={keywordsText}
                      onChange={(e) => {
                        setKeywordsText(e.target.value);
                        updateSeoField(
                          'focusKeywords',
                          e.target.value
                            .split(',')
                            .map((v) => v.trim())
                            .filter(Boolean)
                        );
                      }}
                      placeholder="advogado previdenciário em Goiânia, advogado perto de mim"
                    />
                  </label>

                  <div className="form-grid-two">
                    <label className="field-group">
                      <span>
                        Title Tag customizada (opcional • {liveSeoMeta.title.length}/
                        {SEO_TITLE_MAX_CHARS})
                      </span>
                      <input
                        type="text"
                        maxLength={SEO_TITLE_MAX_CHARS}
                        value={currentSeo.customTitleOverride ?? ''}
                        onChange={(e) => updateSeoField('customTitleOverride', e.target.value)}
                        placeholder="Automático: Palavra-chave + Cidade | Marca"
                      />
                    </label>

                    <label className="field-group">
                      <span>
                        Meta Description (opcional • {liveSeoMeta.description.length}/
                        {SEO_DESCRIPTION_MAX_CHARS})
                      </span>
                      <input
                        type="text"
                        maxLength={SEO_DESCRIPTION_MAX_CHARS}
                        value={currentSeo.customDescriptionOverride ?? ''}
                        onChange={(e) =>
                          updateSeoField('customDescriptionOverride', e.target.value)
                        }
                        placeholder="Automático: Resumo local otimizado para CTR"
                      />
                    </label>
                  </div>

                  <div className="form-grid-two">
                    <label className="field-group">
                      <span>Mini Bio Técnica / Acadêmica (E-E-A-T Google)</span>
                      <input
                        type="text"
                        value={currentSeo.academicBio ?? ''}
                        onChange={(e) => updateSeoField('academicBio', e.target.value)}
                        placeholder="Ex.: Pós-graduado em Direito Previdenciário e Processual Civil..."
                      />
                    </label>

                    <label className="field-group">
                      <span>Google Search Console (tag verification opcional)</span>
                      <input
                        type="text"
                        value={currentSeo.googleVerificationCode ?? ''}
                        onChange={(e) =>
                          updateSeoField('googleVerificationCode', e.target.value)
                        }
                        placeholder="Código content do google-site-verification"
                      />
                    </label>
                  </div>

                  {/* Checklist & Sitemap/Robots Export for Agency Delivery */}
                  <div className="seo-audit-box">
                    <ul className="seo-audit-list">
                      {liveSeoAudit.checks.map((chk) => (
                        <li key={chk.id} className={chk.passed ? 'is-ok' : 'is-warn'}>
                          {chk.passed ? (
                            <CheckCircle2 size={13} strokeWidth={2} aria-hidden="true" />
                          ) : (
                            <AlertCircle size={13} strokeWidth={2} aria-hidden="true" />
                          )}
                          <span>{chk.label}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="seo-export-row">
                      <button
                        type="button"
                        className="btn-outline-subtle"
                        onClick={() =>
                          downloadTextFile(
                            'sitemap.xml',
                            generateClientSitemapXml(draft),
                            'application/xml'
                          )
                        }
                      >
                        <Download size={13} strokeWidth={1.8} aria-hidden="true" />
                        <span>Baixar sitemap.xml</span>
                      </button>
                      <button
                        type="button"
                        className="btn-outline-subtle"
                        onClick={() =>
                          downloadTextFile(
                            'robots.txt',
                            generateClientRobotsTxt(draft),
                            'text/plain'
                          )
                        }
                      >
                        <Download size={13} strokeWidth={1.8} aria-hidden="true" />
                        <span>Baixar robots.txt</span>
                      </button>
                    </div>
                  </div>
                </>
              )}

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
