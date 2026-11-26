import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  Info,
  MessageCircle,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import { ORDERED_PRACTICE_AREAS, PERSONA_CONTENTS } from '../data/seeds';
import {
  buildAdaptiveTriageQuestions,
  buildInformativeTriageBrief,
} from '../lib/adaptiveTriageEngine';
import {
  LEGAL_ALERT_BY_PERSONA,
  buildWhatsAppTriageDossier,
} from '../lib/predictiveIntentEngine';
import type {
  AdaptiveTriageAnswer,
  AdaptiveTriageOption,
  ContextState,
  PersonaId,
} from '../types/legal';

interface AdaptiveTriageSectionProps {
  contextState: ContextState;
  lawyerName: string;
  lawyerWhatsapp: string;
  onSelectArea: (area: PersonaId, source: 'click') => void;
  onTriageChange: (answers: AdaptiveTriageAnswer[], note: string) => void;
  onRecordTriageSignal: (personaId: PersonaId, detail: string, weight: number) => void;
  onOpenPrivacyPolicy: () => void;
  onSectionVisible: (persona: PersonaId) => void;
}

export function AdaptiveTriageSection({
  contextState,
  lawyerName,
  lawyerWhatsapp,
  onSelectArea,
  onTriageChange,
  onRecordTriageSignal,
  onOpenPrivacyPolicy,
  onSectionVisible,
}: AdaptiveTriageSectionProps) {
  const [answersMap, setAnswersMap] = useState<Record<string, AdaptiveTriageAnswer>>({});
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [showAreaPicker, setShowAreaPicker] = useState<boolean>(false);
  const [additionalNote, setAdditionalNote] = useState<string>('');
  const [lgpdAccepted, setLgpdAccepted] = useState<boolean>(false);

  // Reset questionnaire cleanly whenever the active area changes
  useEffect(() => {
    setAnswersMap({});
    setCurrentStep(0);
    setShowAreaPicker(false);
    setAdditionalNote('');
    setLgpdAccepted(false);
    onTriageChange([], '');
  }, [contextState.activePersona, onTriageChange]);

  const questions = useMemo(
    () => buildAdaptiveTriageQuestions(contextState, answersMap),
    [contextState, answersMap]
  );

  const orderedAnswers = useMemo(() => {
    return questions
      .map((q) => answersMap[q.id])
      .filter((item): item is AdaptiveTriageAnswer => Boolean(item));
  }, [questions, answersMap]);

  const isCompleted = currentStep >= questions.length;
  const activeQuestion = !isCompleted ? questions[currentStep] : null;
  const progressPercent = Math.min(
    100,
    Math.round((orderedAnswers.length / Math.max(1, questions.length)) * 100)
  );

  const brief = useMemo(
    () => buildInformativeTriageBrief(contextState.activePersona, orderedAnswers),
    [contextState.activePersona, orderedAnswers]
  );

  const legalAlert = LEGAL_ALERT_BY_PERSONA[contextState.activePersona];

  const triageDossier = useMemo(
    () =>
      buildWhatsAppTriageDossier(
        lawyerWhatsapp,
        lawyerName,
        contextState,
        orderedAnswers,
        additionalNote
      ),
    [lawyerWhatsapp, lawyerName, contextState, orderedAnswers, additionalNote]
  );

  const handleSelectOption = (questionId: string, questionPrompt: string, option: AdaptiveTriageOption) => {
    if (option.redirectToAreaPicker) {
      setShowAreaPicker(true);
      return;
    }

    const answer: AdaptiveTriageAnswer = {
      questionId,
      questionPrompt,
      optionId: option.id,
      optionLabel: option.label,
      dossierTag: option.dossierTag,
    };

    const nextMap = {
      ...answersMap,
      [questionId]: answer,
    };
    setAnswersMap(nextMap);

    const nextOrdered = questions
      .map((q) => nextMap[q.id])
      .filter((item): item is AdaptiveTriageAnswer => Boolean(item));
    onTriageChange(nextOrdered, additionalNote);

    if (option.signalWeight && option.signalWeight > 0) {
      onRecordTriageSignal(
        contextState.activePersona,
        `Atendimento inicial: ${option.dossierTag}`,
        option.signalWeight
      );
    }

    setCurrentStep((prev) => Math.min(questions.length, prev + 1));
  };

  const handleNoteChange = (value: string) => {
    setAdditionalNote(value);
    onTriageChange(orderedAnswers, value);
  };

  const handleReset = () => {
    setAnswersMap({});
    setCurrentStep(0);
    setShowAreaPicker(false);
    setAdditionalNote('');
    setLgpdAccepted(false);
    onTriageChange([], '');
  };

  return (
    <motion.section
      id="triagem-adaptativa"
      className="triage-section"
      onViewportEnter={() => onSectionVisible(contextState.activePersona)}
      viewport={{ once: false, amount: 0.2 }}
      aria-labelledby="triage-section-heading"
    >
      <div className="editorial-container">
        <div className="triage-section-header">
          <div>
            <p className="editorial-eyebrow">Atendimento Inicial • Sigilo Profissional</p>
            <h2 id="triage-section-heading" className="section-title">
              Queremos entender melhor o seu problema. Conte-nos um pouco mais
            </h2>
          </div>
        </div>

        {/* Discreet mandatory OAB Res. 16/2026 disclosure */}
        <div className="triage-compliance-banner" role="note">
          <Info size={16} strokeWidth={1.7} aria-hidden="true" />
          <p>
            Atendimento inicial automatizado para organizar suas informações e agilizar o
            agendamento. <strong>Não substitui consulta ou parecer jurídico</strong> — toda análise
            é realizada pessoalmente pelo advogado titular.
          </p>
        </div>

        <div className="triage-layout-grid">
          {/* Left Column: Questionnaire */}
          <div className="triage-card-surface">
            <div className="triage-progress-header">
              <div className="triage-progress-meta">
                <span className="triage-step-indicator">
                  {showAreaPicker
                    ? 'Escolha o Assunto'
                    : isCompleted
                      ? 'Pronto para enviar'
                      : `Pergunta ${currentStep + 1} de ${questions.length}`}
                </span>
                <span className="triage-progress-pct">{progressPercent}% concluído</span>
              </div>
              <div
                className="triage-progress-track"
                role="progressbar"
                aria-valuenow={progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Progresso da triagem informativa"
              >
                <div
                  className="triage-progress-fill"
                  style={{ width: `${Math.max(8, progressPercent)}%` }}
                />
              </div>
            </div>

            <AnimatePresence mode="wait">
              {showAreaPicker ? (
                <motion.div
                  key="area-picker"
                  className="triage-step-body"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                >
                  <p className="triage-step-tag">Assunto</p>
                  <h3 className="triage-question-prompt">
                    Qual área do Direito melhor representa a sua dúvida hoje?
                  </h3>
                  <p className="triage-question-hint">
                    Selecione o tema abaixo para ver as perguntas e orientações correspondentes.
                  </p>

                  <div className="triage-area-grid">
                    {ORDERED_PRACTICE_AREAS.map((areaId) => (
                      <button
                        key={areaId}
                        type="button"
                        className={`triage-area-btn ${
                          contextState.activePersona === areaId ? 'is-current' : ''
                        }`}
                        onClick={() => {
                          setShowAreaPicker(false);
                          onSelectArea(areaId, 'click');
                        }}
                      >
                        <span className="triage-area-btn-title">
                          {PERSONA_CONTENTS[areaId].areaLabel}
                        </span>
                        <span className="triage-area-btn-sub">
                          {PERSONA_CONTENTS[areaId].courtFocus}
                        </span>
                      </button>
                    ))}
                  </div>

                  <div className="triage-nav-row">
                    <button
                      type="button"
                      className="triage-ghost-btn"
                      onClick={() => setShowAreaPicker(false)}
                    >
                      <ArrowLeft size={14} strokeWidth={1.7} aria-hidden="true" />
                      <span>Voltar à pergunta anterior</span>
                    </button>
                  </div>
                </motion.div>
              ) : activeQuestion ? (
                <motion.div
                  key={activeQuestion.id}
                  className="triage-step-body"
                  initial={{ opacity: 0, x: 14 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -14 }}
                  transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="triage-step-tag">{activeQuestion.stepTag}</p>
                  <h3 className="triage-question-prompt">{activeQuestion.prompt}</h3>
                  <p className="triage-question-hint">{activeQuestion.rationaleHint}</p>

                  <div className="triage-options-list" role="group" aria-label={activeQuestion.prompt}>
                    {activeQuestion.options.map((option) => {
                      const isSelected = answersMap[activeQuestion.id]?.optionId === option.id;
                      return (
                        <button
                          key={option.id}
                          type="button"
                          className={`triage-option-btn ${isSelected ? 'is-selected' : ''}`}
                          onClick={() =>
                            handleSelectOption(activeQuestion.id, activeQuestion.prompt, option)
                          }
                        >
                          <div className="triage-option-copy">
                            <span className="triage-option-label">{option.label}</span>
                            {option.helper && (
                              <span className="triage-option-helper">{option.helper}</span>
                            )}
                          </div>
                          <span className="triage-option-radio" aria-hidden="true">
                            {isSelected && <CheckCircle2 size={16} strokeWidth={2} />}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="triage-nav-row">
                    {currentStep > 0 ? (
                      <button
                        type="button"
                        className="triage-ghost-btn"
                        onClick={() => setCurrentStep((prev) => Math.max(0, prev - 1))}
                      >
                        <ArrowLeft size={14} strokeWidth={1.7} aria-hidden="true" />
                        <span>Pergunta anterior</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        className="triage-ghost-btn"
                        onClick={() => setShowAreaPicker(true)}
                      >
                        <span>Escolher outro assunto</span>
                      </button>
                    )}

                    {orderedAnswers.length > 0 && (
                      <button
                        type="button"
                        className="triage-ghost-btn"
                        onClick={() => setCurrentStep(questions.length)}
                      >
                        <span>Ir para o envio</span>
                      </button>
                    )}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="triage-completed"
                  className="triage-step-body"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  <div className="triage-done-badge">
                    <CheckCircle2 size={16} strokeWidth={1.9} aria-hidden="true" />
                    <span>Informações organizadas</span>
                  </div>
                  <h3 className="triage-question-prompt">
                    Tudo pronto para conversar com o escritório
                  </h3>
                  <p className="triage-question-hint">
                    Ao enviar, o advogado titular receberá os pontos marcados abaixo para preparar uma
                    primeira conversa objetiva e sob sigilo profissional.
                  </p>

                  <label className="triage-note-field">
                    <span>Quer acrescentar algum detalhe? (opcional — não inclua senhas ou dados bancários)</span>
                    <textarea
                      rows={3}
                      maxLength={220}
                      value={additionalNote}
                      onChange={(e) => handleNoteChange(e.target.value)}
                      placeholder="Ex.: Melhor horário para retorno ou detalhe complementar breve..."
                    />
                  </label>

                  {/* Mandatory LGPD Opt-in Checkbox (Unchecked by default) */}
                  <label className="triage-lgpd-checkbox">
                    <input
                      type="checkbox"
                      checked={lgpdAccepted}
                      onChange={(e) => setLgpdAccepted(e.target.checked)}
                    />
                    <span>
                      Estou ciente de que este envio tem caráter informativo (sem parecer jurídico
                      automatizado) e autorizo o contato do escritório sob sigilo profissional,
                      conforme a{' '}
                      <button
                        type="button"
                        className="triage-inline-link"
                        onClick={onOpenPrivacyPolicy}
                      >
                        Política de Privacidade
                      </button>
                      .
                    </span>
                  </label>

                  <div className="triage-final-actions">
                    {lgpdAccepted ? (
                      <a
                        href={triageDossier.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary-gold full-width"
                      >
                        <MessageCircle size={17} strokeWidth={1.8} aria-hidden="true" />
                        <span>Enviar e falar com o escritório</span>
                      </a>
                    ) : (
                      <button
                        type="button"
                        className="btn-primary-gold full-width is-disabled"
                        disabled
                        aria-disabled="true"
                      >
                        <ShieldCheck size={17} strokeWidth={1.8} aria-hidden="true" />
                        <span>Confirme a caixa acima para enviar</span>
                      </button>
                    )}

                    <div className="triage-nav-row">
                      <button
                        type="button"
                        className="triage-ghost-btn"
                        onClick={() => setCurrentStep(Math.max(0, questions.length - 1))}
                      >
                        <ArrowLeft size={14} strokeWidth={1.7} aria-hidden="true" />
                        <span>Revisar respostas</span>
                      </button>
                      <button type="button" className="triage-ghost-btn" onClick={handleReset}>
                        <RotateCcw size={14} strokeWidth={1.7} aria-hidden="true" />
                        <span>Recomeçar</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Column: Live Summary & Document Checklist */}
          <aside className="triage-brief-panel" aria-label="Resumo e documentos úteis">
            <div className="triage-brief-head">
              <ClipboardList size={15} strokeWidth={1.7} aria-hidden="true" />
              <span>{brief.summaryTitle}</span>
            </div>
            <p className="triage-brief-intro">{brief.summaryText}</p>

            {orderedAnswers.length > 0 && (
              <div className="triage-captured-block">
                <p className="triage-subhead">O que você nos contou</p>
                <ul className="triage-captured-list">
                  {orderedAnswers.map((ans) => (
                    <li key={ans.questionId}>
                      <CheckCircle2 size={14} strokeWidth={1.9} aria-hidden="true" />
                      <span>{ans.dossierTag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="triage-checklist-block">
              <p className="triage-subhead">
                <FileText size={13} strokeWidth={1.7} aria-hidden="true" />
                <span>Documentos que podem ajudar na conversa</span>
              </p>
              <ul className="triage-checklist-items">
                {brief.documentChecklist.map((doc) => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>

            <div className="triage-legal-note-box">
              <span className="triage-legal-note-tag">{legalAlert.tag}</span>
              <strong className="triage-legal-note-statute">{legalAlert.statute}</strong>
              <p className="triage-legal-note-detail">{legalAlert.detail}</p>
            </div>

            <p className="triage-ethical-footnote">{brief.ethicalNextStepNote}</p>
          </aside>
        </div>
      </div>
    </motion.section>
  );
}
