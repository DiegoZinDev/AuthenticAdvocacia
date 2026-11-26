import { PERSONA_CONTENTS } from '../data/seeds';
import type {
  AdaptiveTriageAnswer,
  AdaptiveTriageQuestion,
  ContextState,
  PersonaId,
} from '../types/legal';

export interface ExtractedContextClues {
  detectedAge?: number;
  hasLegOrSpineSymptom: boolean;
  hasMedicalReportClue: boolean;
  hasLateNightUrgency: boolean;
  hasConstructionDelayClue: boolean;
  hasPixOrBankFraudClue: boolean;
  hasPjOrDismissalClue: boolean;
  hasHealthPlanDenialClue: boolean;
  hasFamilyAssetClue: boolean;
  hasCorporateDisputeClue: boolean;
  readableClueTags: string[];
}

export interface InformativeTriageBrief {
  areaLabel: string;
  summaryTitle: string;
  summaryText: string;
  documentChecklist: string[];
  ethicalNextStepNote: string;
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Extracts subtle, non-invasive semantic clues from the active ContextState
 * (search signals, referrer, simulated origin, telemetry) to generate
 * informative confirmation-bias questions.
 */
export function extractContextClues(state: ContextState): ExtractedContextClues {
  const corpusParts = [
    state.originSummary,
    state.deductionHeadline,
    state.telemetry.semanticVectorSummary,
    ...state.signals.slice(0, 8).map((s) => s.detail),
  ];
  const corpus = normalize(corpusParts.join(' | '));

  const ageMatch = corpus.match(/\b(4[5-9]|5[0-9]|6[0-9]|7[0-5])\s*anos?\b/);
  const detectedAge = ageMatch ? Number(ageMatch[1]) : undefined;

  const hasLegOrSpineSymptom =
    /perna|coluna|hernia|lombar|ortoped|mobilidade|dor cronica|incapacidade/.test(corpus);
  const hasMedicalReportClue =
    /laudo|pericia|exame|medico|cid|cirurgia|home care|medicamento/.test(corpus);
  const hasLateNightUrgency =
    state.telemetry.urgencyLevel === 'critica' ||
    /madrugada|delegacia|flagrante|custodia|blitz|00h|01h|02h|03h/.test(corpus);
  const hasConstructionDelayClue =
    /construtora|incorporadora|chaves|obra|distrato|incc|planta/.test(corpus);
  const hasPixOrBankFraudClue =
    /pix|banco|conta|golpe|fraude|serasa|spc|negativad|consignado/.test(corpus);
  const hasPjOrDismissalClue =
    /\bpj\b|mei|demiss|demitid|gravida|gestante|horario fixo|fgts|rescis/.test(corpus);
  const hasHealthPlanDenialClue =
    /plano|convenio|unimed|amil|sulamerica|negou|cirurgia|uti|home care|tea/.test(corpus);
  const hasFamilyAssetClue =
    /divorcio|partilha|pensao|guarda|inventario|heranca|separac/.test(corpus);
  const hasCorporateDisputeClue =
    /socio|cnpj|empresa|franquia|fornecedor|contrato social|b2b/.test(corpus);

  const readableClueTags: string[] = [];
  if (detectedAge) readableClueTags.push(`Faixa etária inferida (~${detectedAge} anos)`);
  if (hasLegOrSpineSymptom) readableClueTags.push('Condição física / mobilidade');
  if (hasMedicalReportClue) readableClueTags.push('Documentação clínica / laudos');
  if (hasConstructionDelayClue) readableClueTags.push('Contrato imobiliário / entrega');
  if (hasPixOrBankFraudClue) readableClueTags.push('Relação bancária / cadastro');
  if (hasPjOrDismissalClue) readableClueTags.push('Vínculo profissional / desligamento');
  if (hasHealthPlanDenialClue) readableClueTags.push('Cobertura assistencial / plano de saúde');
  if (hasFamilyAssetClue) readableClueTags.push('Questão familiar ou sucessória');
  if (hasCorporateDisputeClue) readableClueTags.push('Demanda societária ou contratual');
  if (hasLateNightUrgency) readableClueTags.push('Atendimento prioritário / horário crítico');

  if (readableClueTags.length === 0) {
    readableClueTags.push(`Tema em foco: ${PERSONA_CONTENTS[state.activePersona].areaLabel}`);
  }

  return {
    detectedAge,
    hasLegOrSpineSymptom,
    hasMedicalReportClue,
    hasLateNightUrgency,
    hasConstructionDelayClue,
    hasPixOrBankFraudClue,
    hasPjOrDismissalClue,
    hasHealthPlanDenialClue,
    hasFamilyAssetClue,
    hasCorporateDisputeClue,
    readableClueTags: readableClueTags.slice(0, 3),
  };
}

/**
 * Generates an adaptive, 5-step confirmation-bias questionnaire tailored to the
 * active legal area, detected indirect clues, and previous answers.
 * Strictly informative and sober — compliant with Provimento CFOAB nº 205/2021.
 */
export function buildAdaptiveTriageQuestions(
  state: ContextState,
  answers: Record<string, AdaptiveTriageAnswer>
): AdaptiveTriageQuestion[] {
  const persona: PersonaId = state.activePersona;
  const clues = extractContextClues(state);

  if (persona === 'previdenciario') {
    const ageThreshold = clues.detectedAge ? Math.max(45, clues.detectedAge - 1) : 55;
    const symptomPrompt = clues.hasLegOrSpineSymptom
      ? 'Existe alguma limitação física (como dores nas pernas, coluna ou redução de mobilidade) que dificulta manter a rotina de trabalho?'
      : 'Há alguma condição de saúde ou incapacidade que esteja interferindo na sua atividade profissional habitual?';

    const hadDenial = answers['prev-doc']?.optionId === 'indeferido';

    return [
      {
        id: 'prev-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: 'Você busca orientação informativa sobre aposentadoria ou benefício junto ao INSS?',
        rationaleHint:
          'Confirmar o foco previdenciário permite organizar as perguntas conforme as regras vigentes da EC 103/2019.',
        options: [
          {
            id: 'sim-aposentadoria',
            label: 'Sim, preciso entender minhas opções de aposentadoria ou transição',
            helper: 'Tempo de contribuição, idade mínima ou cálculo do benefício',
            dossierTag: 'Foco: Aposentadoria / Regras de Transição',
            signalWeight: 18,
          },
          {
            id: 'sim-incapacidade',
            label: 'Sim, envolve afastamento, auxílio por incapacidade ou BPC/LOAS',
            helper: 'Condição de saúde, perícia médica ou benefício assistencial',
            dossierTag: 'Foco: Benefício por Incapacidade / Perícia INSS',
            signalWeight: 20,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            helper: 'Selecionar outro núcleo para adaptar as perguntas',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'prev-idade',
        stepTag: 'Perfil Etário & Contribuição',
        prompt: `Você (ou o familiar interessado) possui mais de ${ageThreshold} anos de idade?`,
        rationaleHint:
          'A faixa etária define quais regras de transição e requisitos de carência são aplicáveis no planejamento previdenciário.',
        options: [
          {
            id: 'acima-limiar',
            label: `Sim, possui ${ageThreshold + 1} anos ou mais`,
            helper: 'Faixa compatível com regras de transição ou avaliação de incapacidade',
            dossierTag: `Idade: ${ageThreshold + 1}+ anos`,
            signalWeight: 14,
          },
          {
            id: 'faixa-intermediaria',
            label: `Entre 45 e ${ageThreshold} anos`,
            helper: 'Avaliação de tempo especial, contribuições ou incapacidade',
            dossierTag: `Idade: 45 a ${ageThreshold} anos`,
            signalWeight: 10,
          },
          {
            id: 'abaixo-45',
            label: 'Menos de 45 anos',
            helper: 'Mais comum em auxílio por incapacidade, pensão ou planejamento',
            dossierTag: 'Idade: menos de 45 anos',
            signalWeight: 8,
          },
        ],
      },
      {
        id: 'prev-saude',
        stepTag: 'Contexto Clínico & Laboral',
        prompt: symptomPrompt,
        rationaleHint:
          'Informações sobre restrições de saúde auxiliam o advogado a indicar quais laudos e exames com CID são relevantes.',
        options: [
          {
            id: 'com-laudos',
            label: 'Sim, e já possuo laudos, receitas ou exames médicos recentes',
            helper: 'Documentação clínica pronta para conferência técnica',
            dossierTag: 'Saúde: Limitação com laudos/exames recentes',
            signalWeight: 16,
          },
          {
            id: 'em-acompanhamento',
            label: 'Sim, estou em acompanhamento médico mas ainda reunindo exames',
            helper: 'Orientação sobre quais relatórios médicos costumam ser exigidos',
            dossierTag: 'Saúde: Em acompanhamento médico (reunindo laudos)',
            signalWeight: 14,
          },
          {
            id: 'sem-limitacao',
            label: 'Não há questão de saúde — o foco é tempo de contribuição ou revisão',
            helper: 'Análise de CNIS, carteira de trabalho e períodos especiais',
            dossierTag: 'Saúde: Não se aplica (foco contributivo)',
            signalWeight: 10,
          },
        ],
      },
      {
        id: 'prev-doc',
        stepTag: 'Situação no Meu INSS',
        prompt: 'Você já possui extrato CNIS (Meu INSS) ou passou por alguma perícia/pedido anterior?',
        rationaleHint:
          'Saber se houve indeferimento administrativo orienta sobre prazos de recurso ou necessidade de revisão documental.',
        options: [
          {
            id: 'indeferido',
            label: 'Sim, houve negativa, alta programada ou perícia desfavorável',
            helper: 'Possui carta de indeferimento ou protocolo no Meu INSS',
            dossierTag: 'INSS: Indeferimento / perícia anterior',
            signalWeight: 16,
          },
          {
            id: 'cnis-basico',
            label: 'Ainda não fiz o pedido, mas tenho acesso ao Meu INSS / carteira',
            helper: 'Fase ideal para conferência prévia de vínculos e contribuições',
            dossierTag: 'INSS: Pré-requerimento com documentos básicos',
            signalWeight: 12,
          },
          {
            id: 'sem-documentos',
            label: 'Ainda não reuni o CNIS ou preciso de orientação sobre o que baixar',
            helper: 'O escritório orienta o passo a passo documental na triagem',
            dossierTag: 'INSS: Precisa de orientação documental inicial',
            signalWeight: 10,
          },
        ],
      },
      {
        id: 'prev-objetivo',
        stepTag: 'Objetivo da Conversa',
        prompt: hadDenial
          ? 'Diante da negativa anterior, o que você considera mais importante esclarecer primeiro?'
          : 'Qual esclarecimento você busca nesta primeira conversa informativa com o escritório?',
        rationaleHint:
          'Permite que o advogado titular já prepare os tópicos centrais da sua reunião inicial.',
        options: [
          {
            id: 'entender-enquadramento',
            label: 'Entender quais requisitos e documentos se aplicam ao meu caso',
            dossierTag: 'Objetivo: Esclarecer requisitos e documentos',
          },
          {
            id: 'revisar-negativa',
            label: 'Avaliar os motivos de uma negativa, perícia ou valor calculado',
            dossierTag: 'Objetivo: Revisão técnica de negativa/cálculo',
          },
          {
            id: 'agendar-titular',
            label: 'Agendar uma conversa reservada com o advogado titular',
            dossierTag: 'Objetivo: Agendamento de atendimento reservado',
          },
        ],
      },
    ];
  }

  if (persona === 'imobiliario') {
    const delayFocus = clues.hasConstructionDelayClue;
    return [
      {
        id: 'imob-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: delayFocus
          ? 'Sua dúvida envolve contrato com construtora, atraso na entrega ou distrato de imóvel?'
          : 'Você busca orientação informativa em Direito Imobiliário (contrato, distrato ou regularização)?',
        rationaleHint:
          'Cada tipo de relação imobiliária segue regras contratuais e registrais distintas.',
        options: [
          {
            id: 'distrato-atraso',
            label: 'Sim, envolve atraso de obra, distrato ou retenção de parcelas',
            helper: 'Imóvel na planta, loteamento ou cláusula de multa contratual',
            dossierTag: 'Foco: Distrato / Atraso de Obra',
            signalWeight: 18,
          },
          {
            id: 'regularizacao',
            label: 'Sim, envolve escritura, registro, posse ou usucapião',
            helper: 'Regularização documental em cartório ou via judicial',
            dossierTag: 'Foco: Regularização / Escritura / Posse',
            signalWeight: 16,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'imob-estagio',
        stepTag: 'Situação Contratual',
        prompt: 'O contrato já foi assinado e existem parcelas pagas ou notificações trocadas?',
        rationaleHint:
          'A leitura do quadro-resumo do contrato e dos comprovantes orienta a análise preliminar.',
        options: [
          {
            id: 'contrato-ativo',
            label: 'Sim, contrato assinado com parcelas já quitadas ou em curso',
            dossierTag: 'Situação: Contrato vigente com pagamentos realizados',
            signalWeight: 14,
          },
          {
            id: 'notificacao-recebida',
            label: 'Sim, e já recebi cobrança, reajuste elevado ou proposta de distrato',
            dossierTag: 'Situação: Proposta de distrato / cobrança em análise',
            signalWeight: 16,
          },
          {
            id: 'pre-compra',
            label: 'Ainda estou na fase de revisão antes de assinar ou regularizar',
            dossierTag: 'Situação: Análise preventiva / regularização',
            signalWeight: 12,
          },
        ],
      },
      {
        id: 'imob-prazo',
        stepTag: 'Linha do Tempo',
        prompt: 'O prazo previsto em contrato (incluindo eventual tolerância) já foi ultrapassado ou há data limite próxima?',
        rationaleHint:
          'Datas contratuais e termos de entrega são fundamentais para a conferência técnica.',
        options: [
          {
            id: 'prazo-ultrapassado',
            label: 'Sim, o prazo contratual já venceu',
            dossierTag: 'Prazo: Entrega/obrigação vencida',
            signalWeight: 14,
          },
          {
            id: 'prazo-proximo',
            label: 'Há vencimento ou assembleia/vistoria marcada em breve',
            dossierTag: 'Prazo: Evento contratual próximo',
            signalWeight: 12,
          },
          {
            id: 'sem-prazo-imediato',
            label: 'Não há prazo vencido, busco orientação preventiva',
            dossierTag: 'Prazo: Consulta preventiva',
            signalWeight: 8,
          },
        ],
      },
      {
        id: 'imob-doc',
        stepTag: 'Documentação',
        prompt: 'Você tem acesso ao contrato de compra e venda e ao extrato financeiro do imóvel?',
        rationaleHint:
          'Esses documentos permitem uma primeira conversa muito mais objetiva com o titular.',
        options: [
          {
            id: 'docs-completos',
            label: 'Sim, tenho o contrato e os comprovantes organizados',
            dossierTag: 'Docs: Contrato e extratos disponíveis',
          },
          {
            id: 'docs-parciais',
            label: 'Tenho parte dos documentos (ex.: contrato ou e-mails)',
            dossierTag: 'Docs: Documentação parcial',
          },
          {
            id: 'sem-docs',
            label: 'Ainda vou solicitar segunda via à construtora/cartório',
            dossierTag: 'Docs: Em levantamento',
          },
        ],
      },
      {
        id: 'imob-objetivo',
        stepTag: 'Objetivo Informativo',
        prompt: 'O que você gostaria de esclarecer prioritariamente com o advogado?',
        rationaleHint:
          'Ajuda a direcionar a triagem inicial sem promessa prévia de resultado.',
        options: [
          {
            id: 'entender-clausulas',
            label: 'Entender a validade das cláusulas de retenção, juros ou multa',
            dossierTag: 'Objetivo: Revisão informativa de cláusulas',
          },
          {
            id: 'passos-distrato',
            label: 'Conhecer os caminhos extrajudiciais e judiciais disponíveis',
            dossierTag: 'Objetivo: Entender vias extrajudiciais/judiciais',
          },
          {
            id: 'agendar-reuniao',
            label: 'Agendar atendimento reservado para apresentar o contrato',
            dossierTag: 'Objetivo: Agendar reunião com titular',
          },
        ],
      },
    ];
  }

  if (persona === 'trabalhista') {
    return [
      {
        id: 'trab-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: clues.hasPjOrDismissalClue
          ? 'Sua dúvida envolve desligamento recente, atuação como PJ com rotina fixa ou verbas rescisórias?'
          : 'Você busca orientação informativa sobre relação de trabalho, rescisão ou direitos trabalhistas?',
        rationaleHint:
          'A triagem inicial ajuda a enquadrar o tipo de vínculo e verificar prazos da CLT.',
        options: [
          {
            id: 'vinculo-pj',
            label: 'Sim, atuei como PJ/MEI com subordinação ou horário fixo',
            dossierTag: 'Foco: Análise de vínculo PJ/MEI',
            signalWeight: 18,
          },
          {
            id: 'rescisao-verbas',
            label: 'Sim, envolve demissão, verbas rescisórias, FGTS ou horas extras',
            dossierTag: 'Foco: Rescisão / Verbas / Jornada',
            signalWeight: 16,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'trab-status',
        stepTag: 'Situação Atual',
        prompt: 'O vínculo ou contrato de trabalho ainda está ativo ou já houve desligamento?',
        rationaleHint:
          'A Constituição Federal prevê prazo prescricional de 2 anos após o término do contrato para reclamar direitos.',
        options: [
          {
            id: 'desligado-recente',
            label: 'Houve desligamento há menos de 1 ano',
            dossierTag: 'Vínculo: Desligamento recente (< 1 ano)',
            signalWeight: 14,
          },
          {
            id: 'desligado-1-2',
            label: 'Houve desligamento entre 1 e 2 anos atrás',
            dossierTag: 'Vínculo: Atenção ao prazo bienal (1–2 anos)',
            signalWeight: 16,
          },
          {
            id: 'contrato-ativo',
            label: 'O contrato ainda está em andamento',
            dossierTag: 'Vínculo: Contrato ativo',
            signalWeight: 12,
          },
        ],
      },
      {
        id: 'trab-provas',
        stepTag: 'Registros & Documentos',
        prompt: 'Você possui registros da rotina de trabalho (e-mails, mensagens, contratos, notas ou holerites)?',
        rationaleHint:
          'Organizar evidências documentais desde o início torna a análise jurídica muito mais precisa.',
        options: [
          {
            id: 'provas-organizadas',
            label: 'Sim, tenho contratos, comprovantes e registros de rotina',
            dossierTag: 'Provas: Documentação organizada',
          },
          {
            id: 'provas-parciais',
            label: 'Tenho parte dos registros no celular ou e-mail',
            dossierTag: 'Provas: Registros parciais',
          },
          {
            id: 'sem-provas',
            label: 'Preciso entender quais documentos devo reunir primeiro',
            dossierTag: 'Provas: Necessita checklist inicial',
          },
        ],
      },
      {
        id: 'trab-estabilidade',
        stepTag: 'Condições Específicas',
        prompt: 'Houve alguma situação sensível envolvida (gestação, acidente, doença ocupacional ou assédio)?',
        rationaleHint:
          'Essas circunstâncias possuem regras próprias de proteção legal que merecem conferência individual.',
        options: [
          {
            id: 'sim-sensivel',
            label: 'Sim, envolve uma dessas situações específicas',
            dossierTag: 'Contexto: Estabilidade / situação sensível',
            signalWeight: 16,
          },
          {
            id: 'nao-sensivel',
            label: 'Não, o foco principal é vínculo, jornada ou cálculo rescisório',
            dossierTag: 'Contexto: Foco contratual/rescisório',
            signalWeight: 10,
          },
        ],
      },
      {
        id: 'trab-objetivo',
        stepTag: 'Objetivo Informativo',
        prompt: 'Como podemos ajudar melhor neste primeiro contato confidencial?',
        rationaleHint:
          'Toda informação compartilhada é protegida por sigilo profissional.',
        options: [
          {
            id: 'conferir-direitos',
            label: 'Esclarecer quais pontos do contrato merecem revisão técnica',
            dossierTag: 'Objetivo: Revisão técnica inicial',
          },
          {
            id: 'agendar-titular',
            label: 'Agendar conversa reservada com o advogado titular',
            dossierTag: 'Objetivo: Agendamento reservado',
          },
        ],
      },
    ];
  }

  if (persona === 'saude') {
    return [
      {
        id: 'saude-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: clues.hasHealthPlanDenialClue
          ? 'Sua dúvida envolve negativa de cobertura por plano de saúde (cirurgia, medicamento, exame ou Home Care)?'
          : 'Você busca orientação informativa sobre Direito Médico ou cobertura assistencial de planos de saúde?',
        rationaleHint:
          'Casos assistenciais exigem verificação rápida do laudo médico e da justificativa da operadora.',
        options: [
          {
            id: 'negativa-plano',
            label: 'Sim, o plano de saúde negou ou condicionou um procedimento',
            dossierTag: 'Foco: Negativa de cobertura assistencial',
            signalWeight: 20,
          },
          {
            id: 'reajuste-cancelamento',
            label: 'Sim, envolve reajuste elevado ou cancelamento unilateral',
            dossierTag: 'Foco: Reajuste / rescisão de plano',
            signalWeight: 16,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'saude-laudo',
        stepTag: 'Prescrição Médica',
        prompt: 'Já existe relatório ou pedido médico escrito detalhando a necessidade do tratamento?',
        rationaleHint:
          'O relatório clínico circunstanciado é o principal documento analisado em questões de cobertura.',
        options: [
          {
            id: 'laudo-pronto',
            label: 'Sim, tenho relatório médico atualizado em mãos',
            dossierTag: 'Clínico: Relatório médico disponível',
            signalWeight: 16,
          },
          {
            id: 'laudo-andamento',
            label: 'Tenho o pedido simples e posso solicitar relatório detalhado',
            dossierTag: 'Clínico: Pedido médico em complementação',
            signalWeight: 12,
          },
        ],
      },
      {
        id: 'saude-negativa',
        stepTag: 'Registro da Operadora',
        prompt: 'A operadora já forneceu a negativa por escrito ou número de protocolo?',
        rationaleHint:
          'Pelas normas da ANS, o beneficiário pode solicitar a justificativa da negativa por escrito.',
        options: [
          {
            id: 'negativa-escrita',
            label: 'Sim, tenho a negativa por escrito ou e-mail/app',
            dossierTag: 'Operadora: Negativa formalizada',
          },
          {
            id: 'apenas-protocolo',
            label: 'Apenas recusa verbal ou protocolo telefônico',
            dossierTag: 'Operadora: Recusa verbal / protocolo',
          },
          {
            id: 'aguardando-resposta',
            label: 'Ainda aguardando retorno da operadora',
            dossierTag: 'Operadora: Em análise',
          },
        ],
      },
      {
        id: 'saude-urgencia',
        stepTag: 'Prioridade Clínica',
        prompt: 'O médico assistente indicou urgência clínica ou data próxima para o procedimento?',
        rationaleHint:
          'Ajuda a definir a prioridade de atendimento na triagem do escritório.',
        options: [
          {
            id: 'urgente',
            label: 'Sim, há indicação de urgência ou risco com a espera',
            dossierTag: 'Prioridade: Urgência clínica indicada',
            signalWeight: 16,
          },
          {
            id: 'programado',
            label: 'Tratamento programado ou contínuo (ex.: terapias / TEA)',
            dossierTag: 'Prioridade: Tratamento programado/contínuo',
            signalWeight: 12,
          },
        ],
      },
      {
        id: 'saude-objetivo',
        stepTag: 'Objetivo Informativo',
        prompt: 'Qual é o próximo passo desejado nesta triagem inicial?',
        rationaleHint:
          'O advogado titular avaliará a documentação de forma individualizada.',
        options: [
          {
            id: 'avaliar-docs',
            label: 'Encaminhar resumo para análise documental pelo titular',
            dossierTag: 'Objetivo: Análise documental prioritária',
          },
          {
            id: 'orientacao-ans',
            label: 'Entender quais documentos pedir ao médico e à operadora',
            dossierTag: 'Objetivo: Orientação documental inicial',
          },
        ],
      },
    ];
  }

  if (persona === 'consumidor') {
    return [
      {
        id: 'cons-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: clues.hasPixOrBankFraudClue
          ? 'Sua dúvida envolve fraude bancária/Pix, bloqueio de conta ou negativação indevida?'
          : 'Você busca orientação informativa sobre Direito do Consumidor ou relações bancárias?',
        rationaleHint:
          'Identificar a natureza do incidente permite listar os protocolos e provas essenciais.',
        options: [
          {
            id: 'fraude-pix',
            label: 'Sim, envolve fraude bancária, golpe do Pix ou invasão de conta',
            dossierTag: 'Foco: Incidente bancário / Pix',
            signalWeight: 18,
          },
          {
            id: 'negativacao-cobranca',
            label: 'Sim, envolve negativação indevida, consignado ou cobrança abusiva',
            dossierTag: 'Foco: Negativação / Cobrança bancária',
            signalWeight: 16,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'cons-registro',
        stepTag: 'Providências Iniciais',
        prompt: 'Você já registrou contestação no banco (MED/SAC), Boletim de Ocorrência ou reclamação no Consumidor.gov?',
        rationaleHint:
          'Protocolos administrativos demonstram a boa-fé e a tentativa prévia de solução.',
        options: [
          {
            id: 'com-bo-protocolo',
            label: 'Sim, já tenho protocolos e/ou Boletim de Ocorrência',
            dossierTag: 'Registros: BO e protocolos formalizados',
          },
          {
            id: 'so-banco',
            label: 'Apenas contato inicial com o banco ou operadora',
            dossierTag: 'Registros: Apenas protocolo bancário',
          },
          {
            id: 'ainda-nao',
            label: 'Ainda não registrei e preciso saber o passo a passo',
            dossierTag: 'Registros: Sem protocolos ainda',
          },
        ],
      },
      {
        id: 'cons-impacto',
        stepTag: 'Impacto Prático',
        prompt: 'A situação está impedindo acesso a recursos essenciais, crédito ou movimentação financeira?',
        rationaleHint:
          'Permite avaliar o grau de prioridade na organização da triagem.',
        options: [
          {
            id: 'impacto-imediato',
            label: 'Sim, há bloqueio ativo ou restrição imediata no CPF',
            dossierTag: 'Impacto: Restrição/bloqueio ativo',
            signalWeight: 14,
          },
          {
            id: 'impacto-financeiro',
            label: 'Envolve valores descontados ou prejuízo já ocorrido',
            dossierTag: 'Impacto: Prejuízo financeiro já ocorrido',
            signalWeight: 12,
          },
        ],
      },
      {
        id: 'cons-docs',
        stepTag: 'Comprovantes',
        prompt: 'Você possui extratos, prints das telas ou comprovantes da ocorrência?',
        rationaleHint:
          'Preservar prints com data e hora é essencial antes que mensagens ou telas se percam.',
        options: [
          {
            id: 'docs-ok',
            label: 'Sim, tenho comprovantes e capturas de tela salvos',
            dossierTag: 'Docs: Extratos e prints salvos',
          },
          {
            id: 'docs-reunindo',
            label: 'Vou baixar os extratos do aplicativo bancário',
            dossierTag: 'Docs: Em coleta no aplicativo',
          },
        ],
      },
      {
        id: 'cons-objetivo',
        stepTag: 'Objetivo Informativo',
        prompt: 'Qual esclarecimento você busca nesta primeira conversa?',
        rationaleHint:
          'Toda avaliação jurídica depende da análise individualizada dos documentos pelo advogado.',
        options: [
          {
            id: 'entender-caminhos',
            label: 'Entender os passos administrativos e judiciais cabíveis',
            dossierTag: 'Objetivo: Esclarecimento de vias cabíveis',
          },
          {
            id: 'agendar-titular',
            label: 'Falar diretamente com o escritório para triagem reservada',
            dossierTag: 'Objetivo: Atendimento reservado',
          },
        ],
      },
    ];
  }

  if (persona === 'familia') {
    return [
      {
        id: 'fam-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: clues.hasFamilyAssetClue
          ? 'Sua dúvida envolve divórcio, partilha de bens, guarda/pensão ou inventário?'
          : 'Você busca orientação reservada em Direito de Família ou Sucessões?',
        rationaleHint:
          'Atendimentos familiares são conduzidos com discrição absoluta e foco em segurança jurídica.',
        options: [
          {
            id: 'divorcio-partilha',
            label: 'Sim, envolve divórcio, união estável ou partilha de bens',
            dossierTag: 'Foco: Divórcio / Partilha Patrimonial',
            signalWeight: 18,
          },
          {
            id: 'guarda-pensao',
            label: 'Sim, envolve guarda de filhos, convivência ou pensão alimentícia',
            dossierTag: 'Foco: Guarda / Alimentos',
            signalWeight: 16,
          },
          {
            id: 'inventario',
            label: 'Sim, envolve inventário, herança ou planejamento sucessório',
            dossierTag: 'Foco: Inventário / Sucessões',
            signalWeight: 16,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'fam-consenso',
        stepTag: 'Cenário do Diálogo',
        prompt: 'Atualmente existe possibilidade de acordo entre as partes ou o cenário é litigioso?',
        rationaleHint:
          'Casos consensuais podem, em determinadas hipóteses legais, tramitar pela via extrajudicial em cartório.',
        options: [
          {
            id: 'consensual',
            label: 'Há diálogo aberto para buscar solução consensual',
            dossierTag: 'Via: Potencial consensual / extrajudicial',
          },
          {
            id: 'litigioso',
            label: 'Há divergência relevante sobre bens, valores ou convivência',
            dossierTag: 'Via: Cenário contencioso',
            signalWeight: 14,
          },
          {
            id: 'indefinido',
            label: 'Ainda estou avaliando antes de iniciar qualquer conversa',
            dossierTag: 'Via: Orientação preventiva sigilosa',
          },
        ],
      },
      {
        id: 'fam-patrimonio',
        stepTag: 'Estrutura Envolvida',
        prompt: 'A situação envolve imóveis, empresas/participações societárias ou filhos menores?',
        rationaleHint:
          'Esses fatores definem a competência (cartório vs. vara de família) e o checklist documental.',
        options: [
          {
            id: 'imoveis-empresas',
            label: 'Envolve imóveis, financiamentos ou participações societárias',
            dossierTag: 'Estrutura: Patrimônio imobiliário/societário',
          },
          {
            id: 'filhos-menores',
            label: 'Envolve filhos menores de idade',
            dossierTag: 'Estrutura: Presença de filhos menores',
          },
          {
            id: 'ambos',
            label: 'Envolve tanto patrimônio relevante quanto filhos menores',
            dossierTag: 'Estrutura: Patrimônio + filhos menores',
          },
          {
            id: 'simples',
            label: 'Não envolve bens complexos nem menores',
            dossierTag: 'Estrutura: Simplificada',
          },
        ],
      },
      {
        id: 'fam-docs',
        stepTag: 'Preparação Documental',
        prompt: 'Você já possui certidões atualizadas ou relação preliminar de bens e despesas?',
        rationaleHint:
          'Facilita o mapeamento técnico já na primeira reunião reservada.',
        options: [
          {
            id: 'docs-sim',
            label: 'Sim, já tenho documentos básicos reunidos',
            dossierTag: 'Docs: Certidões/relação disponíveis',
          },
          {
            id: 'docs-nao',
            label: 'Ainda não — prefiro entender primeiro o que será necessário',
            dossierTag: 'Docs: Necessita checklist orientado',
          },
        ],
      },
      {
        id: 'fam-objetivo',
        stepTag: 'Objetivo Informativo',
        prompt: 'Qual é a sua prioridade neste momento?',
        rationaleHint:
          'A conversa inicial é conduzida com absoluto sigilo profissional.',
        options: [
          {
            id: 'planejar-passos',
            label: 'Entender meus direitos e planejar os passos com segurança',
            dossierTag: 'Objetivo: Planejamento jurídico reservado',
          },
          {
            id: 'agendar-titular',
            label: 'Agendar atendimento confidencial com o advogado titular',
            dossierTag: 'Objetivo: Agendamento reservado',
          },
        ],
      },
    ];
  }

  if (persona === 'criminal') {
    return [
      {
        id: 'crim-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: clues.hasLateNightUrgency
          ? 'Você precisa de orientação imediata para situação em delegacia, audiência de custódia ou inquérito?'
          : 'Você busca orientação reservada em Direito Penal ou defesa criminal?',
        rationaleHint:
          'Em demandas criminais, a confidencialidade e o acompanhamento técnico desde o primeiro ato são essenciais.',
        options: [
          {
            id: 'flagrante-delegacia',
            label: 'Sim, envolve condução à delegacia, flagrante ou audiência de custódia',
            dossierTag: 'Foco: Plantão / Delegacia / Custódia',
            signalWeight: 22,
          },
          {
            id: 'inquerito-processo',
            label: 'Sim, envolve intimação, inquérito policial ou processo em curso',
            dossierTag: 'Foco: Inquérito / Defesa Processual',
            signalWeight: 18,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'crim-momento',
        stepTag: 'Fase do Procedimento',
        prompt: 'A pessoa interessada está detida neste momento ou recebeu intimação para comparecimento futuro?',
        rationaleHint:
          'Permite organizar a prioridade do contato com o advogado criminalista.',
        options: [
          {
            id: 'ato-imediato',
            label: 'Situação em andamento agora (delegacia / prisão / custódia)',
            dossierTag: 'Fase: Urgência imediata em curso',
            signalWeight: 20,
          },
          {
            id: 'intimacao-futura',
            label: 'Há intimação ou audiência agendada para os próximos dias',
            dossierTag: 'Fase: Intimação / audiência agendada',
            signalWeight: 14,
          },
          {
            id: 'processo-andamento',
            label: 'Processo já em tramitação buscando revisão ou defesa técnica',
            dossierTag: 'Fase: Processo em andamento',
          },
        ],
      },
      {
        id: 'crim-local',
        stepTag: 'Jurisdição',
        prompt: 'O procedimento tramita no Distrito Federal ou em outra unidade da federação?',
        rationaleHint:
          'Informar a comarca ou delegacia agiliza a verificação de atuação local ou digital.',
        options: [
          {
            id: 'df-entorno',
            label: 'Distrito Federal / Entorno',
            dossierTag: 'Local: Distrito Federal / Entorno',
          },
          {
            id: 'outro-estado',
            label: 'Outro Estado (atuação digital / tribunais superiores)',
            dossierTag: 'Local: Outro Estado / Tribunais Superiores',
          },
        ],
      },
      {
        id: 'crim-docs',
        stepTag: 'Informações Disponíveis',
        prompt: 'Você possui o número do processo, boletim de ocorrência ou nota de culpa?',
        rationaleHint:
          'Não envie detalhes sensíveis neste formulário — o envio de documentos ocorre apenas em canal reservado com o advogado.',
        options: [
          {
            id: 'tem-numero',
            label: 'Sim, possuo o número do procedimento ou cópia da intimação',
            dossierTag: 'Docs: Número do procedimento disponível',
          },
          {
            id: 'sem-numero',
            label: 'Ainda não tenho acesso aos autos ou número do registro',
            dossierTag: 'Docs: Sem número dos autos ainda',
          },
        ],
      },
      {
        id: 'crim-objetivo',
        stepTag: 'Contato Reservado',
        prompt: 'Deseja encaminhar este resumo sigiloso para contato prioritário do escritório?',
        rationaleHint:
          'Atendimento estritamente protegido pelo sigilo profissional (Art. 7º do Estatuto da OAB).',
        options: [
          {
            id: 'contato-prioritario',
            label: 'Sim, solicitar contato reservado com o advogado titular',
            dossierTag: 'Objetivo: Contato reservado prioritário',
          },
          {
            id: 'agendar-orientacao',
            label: 'Agendar reunião informativa sobre a defesa técnica',
            dossierTag: 'Objetivo: Reunião informativa de defesa',
          },
        ],
      },
    ];
  }

  if (persona === 'empresarial') {
    return [
      {
        id: 'empr-confirm',
        stepTag: 'Confirmação de Tema',
        prompt: clues.hasCorporateDisputeClue
          ? 'Sua demanda empresarial envolve contrato B2B, conflito societário ou recuperação de crédito?'
          : 'Você busca orientação jurídica para sua empresa (contratos, societário ou cobrança)?',
        rationaleHint:
          'Estruturar a natureza da demanda corporativa agiliza a triagem consultiva ou contenciosa.',
        options: [
          {
            id: 'societario',
            label: 'Sim, envolve relação entre sócios, alteração ou dissolução societária',
            dossierTag: 'Foco: Societário / Governança',
            signalWeight: 18,
          },
          {
            id: 'contratos-credito',
            label: 'Sim, envolve contratos comerciais, franquias ou inadimplência B2B',
            dossierTag: 'Foco: Contratos B2B / Recuperação de Crédito',
            signalWeight: 16,
          },
          {
            id: 'outra-area',
            label: 'Na verdade, minha dúvida é de outra área do Direito',
            dossierTag: 'Redirecionamento de área',
            redirectToAreaPicker: true,
          },
        ],
      },
      {
        id: 'empr-porte',
        stepTag: 'Perfil Empresarial',
        prompt: 'Qual é o perfil atual da operação empresarial envolvida?',
        rationaleHint:
          'Permite adequar a abordagem técnica à estrutura societária e contratual da empresa.',
        options: [
          {
            id: 'pme',
            label: 'Pequena ou média empresa (LTDA / SLU / Simples)',
            dossierTag: 'Perfil: PME / LTDA / SLU',
          },
          {
            id: 'estruturada',
            label: 'Empresa estruturada, grupo econômico ou rede de franquias',
            dossierTag: 'Perfil: Grupo / Franquia / Média-Grande',
          },
        ],
      },
      {
        id: 'empr-estagio',
        stepTag: 'Natureza da Atuação',
        prompt: 'A necessidade atual é preventiva (revisão/elaboração) ou já existe conflito instalado?',
        rationaleHint:
          'Define se o primeiro passo é consultivo, negocial ou contencioso.',
        options: [
          {
            id: 'preventivo',
            label: 'Preventiva: revisão de contratos, acordo de sócios ou blindagem legal',
            dossierTag: 'Atuação: Consultiva / Preventiva',
          },
          {
            id: 'conflito',
            label: 'Conflito ativo: inadimplência, notificação ou disputa societária',
            dossierTag: 'Atuação: Negocial / Contencioso Empresarial',
            signalWeight: 14,
          },
        ],
      },
      {
        id: 'empr-docs',
        stepTag: 'Documentação',
        prompt: 'O contrato social, instrumentos comerciais ou títulos já estão disponíveis para conferência?',
        rationaleHint:
          'A revisão documental prévia fundamenta uma reunião executiva mais objetiva.',
        options: [
          {
            id: 'docs-prontos',
            label: 'Sim, documentação societária/contratual disponível',
            dossierTag: 'Docs: Contratos disponíveis',
          },
          {
            id: 'docs-parciais',
            label: 'Em organização interna com a contabilidade/gestão',
            dossierTag: 'Docs: Em levantamento interno',
          },
        ],
      },
      {
        id: 'empr-objetivo',
        stepTag: 'Objetivo Informativo',
        prompt: 'Qual é o objetivo principal desta primeira conversa?',
        rationaleHint:
          'Atendimento estritamente técnico e confidencial para sócios e gestores.',
        options: [
          {
            id: 'reuniao-executiva',
            label: 'Agendar reunião executiva reservada com o advogado titular',
            dossierTag: 'Objetivo: Reunião executiva reservada',
          },
          {
            id: 'esclarecer-escopo',
            label: 'Esclarecer o escopo técnico e documentos necessários',
            dossierTag: 'Objetivo: Escopo técnico inicial',
          },
        ],
      },
    ];
  }

  // Fallback for 'geral'
  return [
    {
      id: 'geral-confirm',
      stepTag: 'Identificação do Tema',
      prompt: 'Qual é o principal assunto sobre o qual você busca orientação jurídica informativa?',
      rationaleHint:
        'Ao escolher o tema, as próximas perguntas se adaptam automaticamente ao seu contexto.',
      options: [
        {
          id: 'geral-escolher-area',
          label: 'Quero selecionar a área específica do meu caso agora',
          helper: 'Previdenciário, Imobiliário, Trabalhista, Família, Saúde, Bancário, Empresarial ou Criminal',
          dossierTag: 'Seleção direta de área',
          redirectToAreaPicker: true,
        },
        {
          id: 'geral-nao-sei',
          label: 'Ainda não tenho certeza de qual área do Direito se aplica',
          helper: 'Responda 3 perguntas breves para organizarmos sua triagem',
          dossierTag: 'Foco: Enquadramento inicial de área',
        },
      ],
    },
    {
      id: 'geral-perfil',
      stepTag: 'Perfil do Interessado',
      prompt: 'A situação envolve uma questão pessoal/familiar ou uma empresa (CNPJ)?',
      rationaleHint:
        'Ajuda a direcionar a triagem para o núcleo adequado do escritório.',
      options: [
        {
          id: 'pf',
          label: 'Pessoa Física (patrimônio pessoal, família, trabalho, saúde ou INSS)',
          dossierTag: 'Perfil: Pessoa Física',
        },
        {
          id: 'pj',
          label: 'Empresa / Sócio (contratos comerciais, cobrança ou societário)',
          dossierTag: 'Perfil: Pessoa Jurídica / Sócio',
        },
      ],
    },
    {
      id: 'geral-prazo',
      stepTag: 'Prazos & Urgência',
      prompt: 'Existe alguma notificação, intimação, negativa formal ou data limite em andamento?',
      rationaleHint:
        'Verificar prazos em curso é o primeiro cuidado em qualquer triagem jurídica.',
      options: [
        {
          id: 'prazo-ativo',
          label: 'Sim, há prazo, notificação ou negativa recente',
          dossierTag: 'Prazo: Evento ou prazo recente em curso',
        },
        {
          id: 'preventivo',
          label: 'Não, busco orientação preventiva ou esclarecimento inicial',
          dossierTag: 'Prazo: Orientação preventiva',
        },
      ],
    },
    {
      id: 'geral-objetivo',
      stepTag: 'Objetivo Informativo',
      prompt: 'Como prefere prosseguir após esta triagem inicial?',
      rationaleHint:
        'Todo encaminhamento é recebido sob sigilo profissional pelo advogado titular.',
      options: [
        {
          id: 'whatsapp-triagem',
          label: 'Encaminhar resumo da triagem para agendar conversa com o escritório',
          dossierTag: 'Objetivo: Agendar conversa inicial',
        },
      ],
    },
  ];
}

const DOCUMENT_CHECKLIST_BY_PERSONA: Record<PersonaId, string[]> = {
  previdenciario: [
    'Extrato CNIS atualizado (disponível no aplicativo ou site Meu INSS)',
    'Carteira de Trabalho (física ou digital) e carnês de contribuição, se houver',
    'Laudos médicos recentes com CID, receitas e exames (em casos de incapacidade)',
    'Carta de indeferimento ou protocolo de perícia anterior, caso já tenha solicitado',
  ],
  imobiliario: [
    'Contrato de compra e venda e quadro-resumo assinado',
    'Extrato financeiro atualizado e comprovantes de pagamento',
    'Matrícula do imóvel ou comunicações trocadas com a construtora/cartório',
  ],
  trabalhista: [
    'Contrato de trabalho ou contrato de prestação de serviços (PJ/MEI)',
    'Termo de rescisão (TRCT), extratos de FGTS e holerites ou notas fiscais',
    'Registros que demonstrem a rotina e a jornada de trabalho',
  ],
  saude: [
    'Relatório médico detalhado indicando o quadro clínico e a necessidade do tratamento',
    'Negativa por escrito da operadora ou número de protocolo do atendimento',
    'Carteirinha do plano e contrato ou comprovante de adimplência',
  ],
  consumidor: [
    'Extratos bancários, comprovantes da transação ou faturas contestadas',
    'Protocolos de atendimento no banco (SAC/Ouvidoria/MED) e Boletim de Ocorrência, se houver',
    'Capturas de tela (prints) com data e hora das comunicações ou restrições',
  ],
  familia: [
    'Certidão de casamento, nascimento ou escritura de união estável',
    'Relação preliminar de bens, financiamentos e despesas mensais',
    'Documentos de identificação das partes e eventuais acordos anteriores',
  ],
  empresarial: [
    'Contrato social atualizado e eventuais acordos de sócios',
    'Instrumentos contratuais, notas fiscais ou notificações extrajudiciais envolvidas',
    'Resumo cronológico dos fatos comerciais relevantes',
  ],
  criminal: [
    'Número do processo, inquérito policial ou boletim de ocorrência (se disponível)',
    'Cópia da intimação ou nota de culpa, caso tenha sido entregue',
    'Contato de familiar responsável para comunicação reservada',
  ],
  geral: [
    'Documento de identificação e resumo cronológico dos fatos',
    'Contratos, notificações, protocolos ou comunicações relacionadas à dúvida',
    'Eventuais datas de prazos ou audiências já comunicadas',
  ],
};

export function buildInformativeTriageBrief(
  personaId: PersonaId,
  answers: AdaptiveTriageAnswer[]
): InformativeTriageBrief {
  const persona = PERSONA_CONTENTS[personaId];
  const answeredCount = answers.length;

  const summaryTitle =
    answeredCount > 0
      ? `Resumo do seu atendimento — ${persona.areaLabel}`
      : `Guia inicial — ${persona.areaLabel}`;

  const summaryText =
    answeredCount > 0
      ? `Reunimos ${answeredCount} ponto(s) informado(s) por você para facilitar uma primeira conversa objetiva e reservada com o advogado titular.`
      : `Responda às perguntas ao lado para nos contar brevemente o que está acontecendo antes de falar com o escritório.`;

  return {
    areaLabel: persona.areaLabel,
    summaryTitle,
    summaryText,
    documentChecklist: DOCUMENT_CHECKLIST_BY_PERSONA[personaId],
    ethicalNextStepNote:
      'Informações de caráter orientativo. A análise do seu caso é conduzida pessoalmente pelo advogado titular em atendimento reservado.',
  };
}
