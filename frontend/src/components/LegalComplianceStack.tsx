import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Cookie, Shield, SlidersHorizontal, X } from 'lucide-react';
import type { CookieConsentPreferences, LawyerProfile } from '../types/legal';

export type LegalDocTab = 'privacidade' | 'cookies' | 'termos';

interface CookieConsentBannerProps {
  consent: CookieConsentPreferences;
  forceOpenPreferences: boolean;
  onSaveConsent: (analyticsAndContext: boolean) => void;
  onClosePreferences: () => void;
  onOpenDoc: (tab: LegalDocTab) => void;
}

export function CookieConsentBanner({
  consent,
  forceOpenPreferences,
  onSaveConsent,
  onClosePreferences,
  onOpenDoc,
}: CookieConsentBannerProps) {
  const [managing, setManaging] = useState(false);
  const [contextToggle, setContextToggle] = useState(consent.analyticsAndContext);

  const isVisible = !consent.decided || forceOpenPreferences;
  const showManageView = managing || forceOpenPreferences;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          key="lgpd-cookie-banner"
          className="cookie-consent-banner"
          role="dialog"
          aria-live="polite"
          aria-label="Preferências de Privacidade e Cookies (LGPD)"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="cookie-banner-inner">
            <div className="cookie-banner-copy">
              <div className="cookie-banner-title-row">
                <Cookie size={15} strokeWidth={1.7} aria-hidden="true" />
                <strong>Privacidade &amp; Cookies (LGPD — Guia ANPD)</strong>
                {forceOpenPreferences && (
                  <button
                    type="button"
                    className="cookie-close-x"
                    onClick={() => {
                      setManaging(false);
                      onClosePreferences();
                    }}
                    aria-label="Fechar preferências de cookies"
                  >
                    <X size={15} strokeWidth={1.8} />
                  </button>
                )}
              </div>
              <p>
                Utilizamos cookies estritamente necessários para o funcionamento do site e, somente
                com o seu consentimento, armazenamento local de contexto para adaptar as perguntas
                informativas. Consulte nossa{' '}
                <button
                  type="button"
                  className="triage-inline-link"
                  onClick={() => onOpenDoc('privacidade')}
                >
                  Política de Privacidade
                </button>
                .
              </p>

              {showManageView && (
                <div className="cookie-manage-panel">
                  <label className="cookie-toggle-row">
                    <input type="checkbox" checked disabled />
                    <span>
                      <strong>Essenciais (sempre ativos):</strong> segurança, acessibilidade e
                      preferências de consentimento.
                    </span>
                  </label>
                  <label className="cookie-toggle-row">
                    <input
                      type="checkbox"
                      checked={contextToggle}
                      onChange={(e) => setContextToggle(e.target.checked)}
                    />
                    <span>
                      <strong>Personalização informativa local (opcional):</strong> lembra a área
                      jurídica consultada nesta visita para adaptar o formulário de triagem.
                    </span>
                  </label>
                </div>
              )}
            </div>

            <div className="cookie-banner-actions">
              <button
                type="button"
                className="cookie-btn-reject"
                onClick={() => {
                  setContextToggle(false);
                  setManaging(false);
                  onSaveConsent(false);
                  onClosePreferences();
                }}
              >
                Rejeitar não essenciais
              </button>

              {!showManageView ? (
                <button
                  type="button"
                  className="cookie-btn-manage"
                  onClick={() => setManaging(true)}
                >
                  <SlidersHorizontal size={13} strokeWidth={1.7} aria-hidden="true" />
                  <span>Gerenciar</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="cookie-btn-accept"
                  onClick={() => {
                    setManaging(false);
                    onSaveConsent(contextToggle);
                    onClosePreferences();
                  }}
                >
                  Salvar preferências
                </button>
              )}

              {!showManageView && (
                <button
                  type="button"
                  className="cookie-btn-accept"
                  onClick={() => {
                    setContextToggle(true);
                    setManaging(false);
                    onSaveConsent(true);
                    onClosePreferences();
                  }}
                >
                  Aceitar todos
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

interface LegalDocumentModalProps {
  activeTab: LegalDocTab | null;
  profile: LawyerProfile;
  onClose: () => void;
  onChangeTab: (tab: LegalDocTab) => void;
  onOpenCookiePreferences: () => void;
}

export function LegalDocumentModal({
  activeTab,
  profile,
  onClose,
  onChangeTab,
  onOpenCookiePreferences,
}: LegalDocumentModalProps) {
  const dpoContact = profile.dpoEmail?.trim() || 'privacidade@escritorio.adv.br';

  return (
    <AnimatePresence>
      {activeTab && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="whitelabel-modal legal-doc-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="legal-doc-modal-title"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <div>
                <p className="modal-eyebrow">Compliance Institucional • OAB &amp; LGPD</p>
                <h2 id="legal-doc-modal-title" className="modal-title">
                  {activeTab === 'privacidade'
                    ? 'Política de Privacidade (LGPD)'
                    : activeTab === 'cookies'
                      ? 'Política de Cookies'
                      : 'Termos de Uso & Aviso Legal'}
                </h2>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={onClose}
                aria-label="Fechar aviso legal"
              >
                <X size={18} strokeWidth={1.7} />
              </button>
            </div>

            <div className="legal-doc-tabs" role="tablist">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'privacidade'}
                className={`legal-doc-tab ${activeTab === 'privacidade' ? 'is-active' : ''}`}
                onClick={() => onChangeTab('privacidade')}
              >
                Privacidade (LGPD)
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'cookies'}
                className={`legal-doc-tab ${activeTab === 'cookies' ? 'is-active' : ''}`}
                onClick={() => onChangeTab('cookies')}
              >
                Cookies
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'termos'}
                className={`legal-doc-tab ${activeTab === 'termos' ? 'is-active' : ''}`}
                onClick={() => onChangeTab('termos')}
              >
                Termos de Uso
              </button>
            </div>

            <div className="legal-doc-body">
              {activeTab === 'privacidade' && (
                <>
                  <p>
                    <strong>Controlador:</strong> {profile.firmName} ({profile.lawyerName} —{' '}
                    {profile.oabNumber}), com atuação em {profile.city}.
                  </p>
                  <p>
                    <strong>Finalidade e Princípio da Necessidade (Lei nº 13.709/2018):</strong> Os
                    dados informados voluntariamente na triagem inicial destinam-se exclusivamente ao
                    pré-atendimento advocatício, verificação preliminar de conflito de interesses e
                    agendamento de conversa com o advogado titular.
                  </p>
                  <p>
                    <strong>Sigilo Profissional:</strong> Todas as informações encaminhadas em fase
                    pré-contratual são tratadas sob estrito sigilo profissional (Art. 7º da Lei nº
                    8.906/1994 e Arts. 35–38 do Código de Ética e Disciplina da OAB).
                  </p>
                  <p>
                    <strong>Encarregado pelo Tratamento de Dados (DPO):</strong> Para exercer direitos
                    de acesso, correção ou eliminação de dados (Art. 18 da LGPD), entre em contato pelo
                    canal oficial: <code>{dpoContact}</code>.
                  </p>
                </>
              )}

              {activeTab === 'cookies' && (
                <>
                  <p>
                    Em conformidade com o Guia Orientativo de Cookies da ANPD, este site distingue
                    cookies estritamente necessários daqueles destinados à personalização informativa
                    local.
                  </p>
                  <p>
                    Nenhum cookie de personalização de contexto ou métrica não essencial é ativado sem
                    o seu consentimento prévio, que pode ser revogado a qualquer momento.
                  </p>
                  <button
                    type="button"
                    className="btn-outline-subtle"
                    onClick={() => {
                      onClose();
                      onOpenCookiePreferences();
                    }}
                  >
                    <Shield size={14} strokeWidth={1.7} aria-hidden="true" />
                    <span>Reabrir Preferências de Cookies</span>
                  </button>
                </>
              )}

              {activeTab === 'termos' && (
                <>
                  <p>
                    <strong>Caráter Meramente Informativo (Provimento CFOAB nº 205/2021):</strong> Todo
                    o conteúdo disponibilizado neste endereço eletrônico possui finalidade estritamente
                    informativa e institucional, não configurando consulta jurídica, parecer técnico,
                    promessa de resultado ou relação cliente-advogado automática.
                  </p>
                  <p>
                    <strong>Triagem Automatizada (Resolução CFOAB nº 16/2026):</strong> O formulário
                    adaptativo atua apenas como ferramenta auxiliar de organização inicial, sob
                    supervisão exclusiva do advogado inscrito na OAB ({profile.oabNumber}).
                  </p>
                  <p>
                    <strong>Marco Civil da Internet (Lei nº 12.965/2014):</strong> O escritório não se
                    responsabiliza por conteúdos de sites externos eventualmente acessados a partir de
                    links de terceiros.
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
