import type {
  LawyerProfile,
  LeadOriginPreset,
  LegalCase,
  PersonaContent,
  PersonaId,
} from '../types/legal';

export const DEFAULT_LAWYER_PROFILE: LawyerProfile = {
  id: 'default',
  lawyerName: 'Dr. Esriel Dias Batista',
  firmName: 'Esriel Dias Advogados',
  oabNumber: 'OAB/DF',
  practiceModel: 'sociedade_individual',
  dpoEmail: 'esrieldiasadv@esrieldiasadv.com.br',
  whatsapp: '5561985148433',
  city: 'Santa Maria & Brasília/DF',
  primaryArea: 'criminal',
  photoUrl: '/dr-esriel-dias.jpg',
  experienceYears: 8,
  editorialQuote:
    'Atuação técnica, estratégica e incansável na defesa penal e em demandas cíveis, trabalhistas e empresariais — com sigilo, rigor jurídico e atenção próxima.',
  seo: {
    siteUrl: 'https://www.esrieldiasadv.com.br',
    cityName: 'Brasília',
    stateCode: 'DF',
    neighborhoods: ['Santa Maria', 'Gama', 'Valparaíso de Goiás', 'Novo Gama', 'Recanto das Emas', 'Brasília'],
    streetAddress: 'CL 116, Bloco I, Salas 113/114 — Santa Maria, Brasília/DF',
    postalCode: '72546-209',
    latitude: '-16.0172',
    longitude: '-48.0154',
    openingHours: 'Mo-Fr 09:00-18:00',
    googleBusinessUrl: '',
    academicBio:
      'Advogado Criminalista, Presidente da Comissão do Tribunal do Júri da OAB Santa Maria/DF e fundador da Esriel Dias Advogados (desde 2018), com unidades em Santa Maria/DF e Luís Eduardo Magalhães/BA e atuação em Direito Penal, Trabalhista, Família, Previdenciário, Imobiliário e Registro de Marca.',
    googleVerificationCode: '',
    focusKeywords: [
      'advogado criminalista em Santa Maria DF',
      'Esriel Dias Advogados',
      'advogado tribunal do júri Brasília DF',
      'advogado penal trabalhista e família Santa Maria DF',
      'escritório de advocacia CL 116 Santa Maria DF',
    ],
  },
};

export const PERSONA_CONTENTS: Record<PersonaId, PersonaContent> = {
  geral: {
    id: 'geral',
    areaLabel: 'Advocacia Estratégica',
    badgeSubtitle: 'Advocacia Estratégica — Proteção Patrimonial & Contencioso DF',
    eyebrow: 'Atuação Contenciosa e Consultiva no Distrito Federal',
    headline: 'Defesa jurídica técnica para proteger seu patrimônio, sua família e seus direitos.',
    subheadline:
      'Atendimento reservado, análise documental minuciosa e atuação técnica perante o TJDFT, TRT-10 e TRF-1 — com foco em clareza jurídica e segurança.',
    authorityNote: 'Atendimento inicial conduzido diretamente pelo advogado titular.',
    painSectionTitle: 'Pontos de atenção que merecem orientação jurídica técnica',
    painPoints: [
      {
        title: 'Contratos desequilibrados e retenção indevida de valores',
        detail:
          'Cláusulas abusivas em distratos imobiliários, planos de saúde ou relações bancárias exigem revisão técnica cuidadosa antes da consolidação do prejuízo.',
      },
      {
        title: 'Conflitos familiares e patrimoniais sem planejamento jurídico',
        detail:
          'Divórcios, pensões e inventários exigem condução técnica e reservada para resguardar o patrimônio e os vínculos familiares.',
      },
      {
        title: 'Direitos trabalhistas ou previdenciários negados administrativamente',
        detail:
          'Cálculos subestimados, negativas do INSS e verbas rescisórias demandam conferência documental precisa e tese alinhada aos tribunais superiores.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Gostaria de agendar uma conversa inicial confidencial com o escritório.',
    ctaLabel: 'Agendar Conversa Inicial',
    keywords: ['advogado', 'escritorio', 'brasilia', 'gama', 'oab', 'consulta', 'direito'],
    courtFocus: 'TJDFT • TRT-10 • TRF-1',
  },
  imobiliario: {
    id: 'imobiliario',
    areaLabel: 'Direito Imobiliário',
    badgeSubtitle: 'Direito Imobiliário — Distrato & Atraso de Obra',
    eyebrow: 'Imóveis na Planta, Distrato, Posse & Regularização no DF',
    headline: 'Orientação técnica em contratos imobiliários, distratos e atraso na entrega de obras.',
    subheadline:
      'Atuação especializada perante o TJDFT na análise de atrasos de obras, cláusulas de distrato, vícios construtivos e regularização de escrituras no Distrito Federal.',
    authorityNote: 'Atuação técnica orientada pela Súmula 543 do STJ e jurisprudência das Turmas Cíveis do TJDFT.',
    painSectionTitle: 'Pontos de atenção informativos no Direito Imobiliário',
    painPoints: [
      {
        title: 'Retenção elevada de valores em pedidos de distrato',
        detail:
          'A Lei do Distrato e a jurisprudência definem limites específicos para retenções contratuais, especialmente quando há descumprimento atribuível à incorporadora.',
      },
      {
        title: 'Atraso na entrega das chaves além do prazo de tolerância',
        detail:
          'A análise contratual permite verificar a possibilidade de pleitear reparação por lucros cessantes e revisão de encargos durante o período de atraso.',
      },
      {
        title: 'Imóvel sem escritura definitiva, usucapião ou taxas contratuais',
        detail:
          'A regularização pode envolver adjudicação compulsória, usucapião extrajudicial em cartório do DF e conferência técnica de cláusulas de corretagem.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Preciso de orientação jurídica sobre um contrato imobiliário (distrato, atraso na entrega ou regularização de imóvel).',
    ctaLabel: 'Agendar Conversa sobre Meu Contrato',
    keywords: [
      'imovel',
      'imobiliario',
      'distrato',
      'construtora',
      'atraso',
      'entrega',
      'obra',
      'usucapiao',
      'escritura',
      'aluguel',
      'incorporadora',
      'terreno',
      'lote',
      'planta',
    ],
    courtFocus: 'TJDFT • Varas Cíveis & STJ',
  },
  familia: {
    id: 'familia',
    areaLabel: 'Família e Sucessões',
    badgeSubtitle: 'Família & Sucessões — Divórcio, Partilha & Inventário',
    eyebrow: 'Divórcio, Partilha de Bens, Guarda & Inventário Reservado',
    headline: 'Conduza seu divórcio ou inventário com discrição absoluta e proteção patrimonial.',
    subheadline:
      'Estratégia jurídica firme e humanizada para resolver partilhas complexas, guarda de filhos, pensão alimentícia e inventários judiciais ou em cartório sem litígios intermináveis.',
    authorityNote: 'Sigilo rigoroso e mediação estratégica perante as Varas de Família do DF.',
    painSectionTitle: 'Decisões familiares que exigem técnica e serenidade',
    painPoints: [
      {
        title: 'Partilha desigual ou ocultação de patrimônio na separação',
        detail:
          'Realizamos levantamento patrimonial, apuração de quotas societárias, imóveis financiados e proteção imediata via liminar para evitar dilapidação de bens.',
      },
      {
        title: 'Pensão alimentícia defasada ou execução de valores em atraso',
        detail:
          'Atuamos na fixação proporcional às reais possibilidades do alimentante, revisão de encargos e cobrança ágil pelo rito de prisão ou penhora.',
      },
      {
        title: 'Inventário bloqueado por conflito entre herdeiros ou excesso de ITCMD',
        detail:
          'Estruturamos inventários extrajudiciais céleres no DF e planejamento sucessório para liberar bens e contas bancárias com o menor custo tributário legal.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Gostaria de uma consulta reservada sobre Direito de Família / Sucessões (divórcio, partilha, pensão ou inventário).',
    ctaLabel: 'Agendar Atendimento Reservado',
    keywords: [
      'divorcio',
      'familia',
      'partilha',
      'bens',
      'pensao',
      'alimentos',
      'guarda',
      'inventario',
      'heranca',
      'uniao',
      'estavel',
      'separacao',
    ],
    courtFocus: 'TJDFT • Varas de Família & Órfãos',
  },
  trabalhista: {
    id: 'trabalhista',
    areaLabel: 'Direito Trabalhista',
    badgeSubtitle: 'Direito Trabalhista — Vínculo PJ, Horas Extras & Rescisão',
    eyebrow: 'Rescisão, Horas Extras, Vínculo PJ & Assédio no TRT-10',
    headline: 'Assegure integralmente suas verbas rescisórias, horas extras e reparação trabalhista.',
    subheadline:
      'Auditoria detalhada de contracheques, ponto eletrônico e contratos para trabalhadores e executivos no Distrito Federal, com atuação combativa no TRT da 10ª Região.',
    authorityNote: 'Cálculos trabalhistas precisos anexados desde a petição inicial.',
    painSectionTitle: 'Irregularidades frequentes que recuperamos na Justiça do Trabalho',
    painPoints: [
      {
        title: 'Pejotização fraudulenta e demissão sem FGTS, férias ou 13º',
        detail:
          'Quando há subordinação, horário e habitualidade, comprovamos o vínculo empregatício em juízo e cobramos todos os reflexos salariais dos últimos 5 anos.',
      },
      {
        title: 'Horas extras não pagas, banco de horas irregular e acúmulo de função',
        detail:
          'Mapeamos registros de acesso, e-mails e mensagens corporativas para comprovar sobrejornada, supressão de intervalo e diferenças salariais.',
      },
      {
        title: 'Assédio moral, dispensa discriminatória ou acidente de trabalho',
        detail:
          'Buscamos rescisão indireta sem perda de direitos, estabilidade provisória e indenizações compatíveis com a gravidade do dano sofrido.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Preciso analisar meus direitos trabalhistas (rescisão, horas extras ou reconhecimento de vínculo PJ).',
    ctaLabel: 'Calcular e Analisar Meus Direitos',
    keywords: [
      'trabalhista',
      'rescisao',
      'demissao',
      'demitido',
      'fgts',
      'horas',
      'extras',
      'pj',
      'pejotizacao',
      'vinculo',
      'assedio',
      'justa',
      'causa',
      'trt',
    ],
    courtFocus: 'TRT-10 • Varas do Trabalho do DF',
  },
  previdenciario: {
    id: 'previdenciario',
    areaLabel: 'Direito Previdenciário',
    badgeSubtitle: 'Direito Previdenciário — INSS, Revisão & Aposentadoria',
    eyebrow: 'Aposentadorias, Revisões & Benefícios Negados pelo INSS',
    headline: 'Reverta negativas do INSS e conquiste o melhor valor possível de aposentadoria.',
    subheadline:
      'Planejamento previdenciário completo, contagem de tempo especial (PPP/LTCAT) e ações judiciais no TRF-1 para corrigir benefícios concedidos abaixo do devido.',
    authorityNote: 'Simulação de cenários pelas regras de transição antes de protocolar qualquer pedido.',
    painSectionTitle: 'Onde o segurado costuma perder renda para o INSS',
    painPoints: [
      {
        title: 'Benefício negado mesmo após décadas de contribuição',
        detail:
          'Corrigimos vínculos pendentes no CNIS, períodos rurais, trabalho especial insalubre/perigoso e falhas periciais do INSS pela via judicial.',
      },
      {
        title: 'Aposentadoria concedida com valor menor por erro de cálculo',
        detail:
          'Auditamos a carta de concessão para identificar salários de contribuição descartados, tempo não averbado e teses revisionais com pagamento de atrasados.',
      },
      {
        title: 'Auxílio-doença ou BPC/LOAS cortado abruptamente',
        detail:
          'Ingressamos com pedido liminar e quesitos médicos estratégicos para restabelecer o benefício e cobrar todas as parcelas desde o indeferimento.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Gostaria de avaliar minha aposentadoria ou benefício negado/revisão junto ao INSS.',
    ctaLabel: 'Analisar Meu CNIS e Benefício',
    keywords: [
      'inss',
      'aposentadoria',
      'previdenciario',
      'revisao',
      'beneficio',
      'negou',
      'loas',
      'bpc',
      'auxilio',
      'cnis',
      'ppp',
      'pensao morte',
    ],
    courtFocus: 'TRF-1 • Juizados Especiais Federais',
  },
  consumidor: {
    id: 'consumidor',
    areaLabel: 'Direito do Consumidor',
    badgeSubtitle: 'Direito do Consumidor — Negativação, Bancos & Saúde',
    eyebrow: 'Negativação Indevida, Bancos, Planos de Saúde & Aéreos',
    headline: 'Exija reparação imediata contra abusos bancários, negativações e negativas de saúde.',
    subheadline:
      'Ações rápidas com pedido de tutela de urgência no TJDFT para limpar seu nome em 48 horas, destravar cirurgias negadas e recuperar valores cobrados indevidamente.',
    authorityNote: 'Tutelas de urgência protocoladas em até 24 horas úteis após validação documental.',
    painSectionTitle: 'Abusos de consumo que enfrentamos com medidas de urgência',
    painPoints: [
      {
        title: 'Nome negativado indevidamente no Serasa/SPC ou fraude no Pix',
        detail:
          'Obtemos liminar para exclusão imediata do apontamento e condenação da instituição por danos morais e devolução em dobro de cobranças indevidas.',
      },
      {
        title: 'Plano de saúde recusando cirurgia, exame ou medicamento de alto custo',
        detail:
          'Com prescrição médica fundamentada, acionamos o plantão ou vara cível do TJDFT para obrigar o custeio integral em caráter de urgência.',
      },
      {
        title: 'Juros abusivos, empréstimo consignado não autorizado e voo cancelado',
        detail:
          'Revisamos contratos bancários com perícia contábil e garantimos indenização efetiva por extravio de bagagem, overbooking e cancelamentos.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Preciso de ajuda jurídica em Direito do Consumidor & Bancário (golpe do Pix, negativação indevida ou cobrança bancária abusiva).',
    ctaLabel: 'Requerer Medida Urgente',
    keywords: [
      'consumidor',
      'negativacao',
      'serasa',
      'spc',
      'nome sujo',
      'indenizacao',
      'banco',
      'juros',
      'conta invadida',
      'pix bloqueado',
      'golpe',
      'voo',
      'fraude',
      'pix',
    ],
    courtFocus: 'TJDFT • Juizados & Varas Cíveis',
  },
  saude: {
    id: 'saude',
    areaLabel: 'Direito Médico & Planos de Saúde',
    badgeSubtitle: 'Direito Médico & Planos de Saúde — Liminar 24h & Home Care',
    eyebrow: 'Negativa de Cirurgia, Home Care, UTI & Medicamentos de Alto Custo',
    headline: 'Obtenha liminar em horas para obrigar o plano de saúde a custear seu tratamento.',
    subheadline:
      'Atuação imediata perante o Plantão Judicial e Varas Cíveis do TJDFT contra negativas abusivas de cirurgias, próteses importadas, terapias TEA e internação domiciliar (Home Care).',
    authorityNote: 'Pedidos liminares fundamentados na Lei 14.454/2022 e Súmula 102 do STJ.',
    painSectionTitle: 'Situações médicas que exigem tutela judicial imediata',
    painPoints: [
      {
        title: 'Cirurgia urgente ou prótese negada sob alegação de "fora do rol da ANS"',
        detail:
          'A prescrição do médico assistente prevalece sobre cláusulas restritivas. Acionamos o plantão do TJDFT para determinar autorização integral em menos de 24 horas.',
      },
      {
        title: 'Recusa de Home Care (internação domiciliar) ou medicamento oncológico',
        detail:
          'Com relatório médico detalhado, asseguramos equipe de enfermagem 24h, equipamentos e medicamentos de alto custo sem coparticipação abusiva.',
      },
      {
        title: 'Reajuste abusivo por faixa etária ou cancelamento unilateral do contrato',
        detail:
          'Revisamos aumentos acima dos índices autorizados e bloqueamos rescisões durante tratamento contínuo com restituição dos valores pagos a maior.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Preciso de uma liminar urgente contra negativa do plano de saúde (cirurgia, medicamento ou home care).',
    ctaLabel: 'Solicitar Liminar Médica Urgente',
    keywords: [
      'plano de saude',
      'cirurgia',
      'home care',
      'negativa',
      'liminar medica',
      'medicamento',
      'alto custo',
      'quimioterapia',
      'oncologico',
      'protese',
      'uti',
      'internacao',
      'autismo',
      'tea',
      'operadora',
    ],
    courtFocus: 'TJDFT • Plantão Judicial & Varas Cíveis',
  },
  empresarial: {
    id: 'empresarial',
    areaLabel: 'Direito Empresarial & Contratos',
    badgeSubtitle: 'Direito Empresarial — Blindagem Societária & Contratos B2B',
    eyebrow: 'Blindagem Societária, Cobrança de Títulos & Contratos Comerciais no DF',
    headline: 'Blinde sua empresa, recupere créditos travados e resolva conflitos societários.',
    subheadline:
      'Assessoria contenciosa e estratégica para sócios e empresários do Distrito Federal em disputas societárias, execução acelerada de títulos e revisão de contratos empresariais.',
    authorityNote: 'Estratégia jurídica orientada à preservação de caixa e continuidade operacional.',
    painSectionTitle: 'Riscos societários e contratuais que travam o crescimento da empresa',
    painPoints: [
      {
        title: 'Conflito entre sócios, quebra de confiança ou saída desordenada',
        detail:
          'Conduzimos apuração de haveres, dissolução parcial protegida e bloqueio de atos abusivos de administração sem paralisar o faturamento da sociedade.',
      },
      {
        title: 'Inadimplência B2B, duplicatas e contratos descumpridos por fornecedores',
        detail:
          'Atuamos na execução rápida de títulos extrajudiciais, busca de ativos (Sisbajud/Renajud/Sniper) e reequilíbrio financeiro de contratos comerciais.',
      },
      {
        title: 'Exposição do patrimônio pessoal dos sócios em execuções fiscais ou cíveis',
        detail:
          'Implementamos blindagem contratual, revisão de garantias e defesa técnica contra desconsideração indevida da personalidade jurídica.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Preciso de assessoria em Direito Empresarial / Contratos (blindagem societária, cobrança ou revisão contratual).',
    ctaLabel: 'Agendar Reunião Empresarial',
    keywords: [
      'empresarial',
      'empresa',
      'socio',
      'societario',
      'contrato social',
      'blindagem',
      'cobranca',
      'titulo',
      'duplicata',
      'inadimplencia',
      'franquia',
      'cnpj',
      'execucao',
      'clausula de multa',
      'revisao contratual',
    ],
    courtFocus: 'TJDFT • Varas Cíveis & Empresariais',
  },
  criminal: {
    id: 'criminal',
    areaLabel: 'Urgência Criminal & Plantão 24h',
    badgeSubtitle: 'Plantão Criminal 24h — Custódia, Flagrante & Habeas Corpus',
    eyebrow: 'Atendimento Imediato 24h • Delegacias do DF, Custódia & TJDFT',
    headline: 'Defesa criminal imediata em delegacia, audiência de custódia e Habeas Corpus.',
    subheadline:
      'Atuação de prontidão 24 horas no Gama, Brasília e Entorno para acompanhamento de flagrantes, pedidos de liberdade provisória, revogação de preventiva e medidas urgentes.',
    authorityNote: 'Deslocamento imediato para delegacias do DF e plantão criminal do TJDFT.',
    painSectionTitle: 'Situações de urgência que exigem advogado criminalista na hora',
    painPoints: [
      {
        title: 'Prisão em flagrante ou condução à delegacia durante a noite ou madrugada',
        detail:
          'Comparecemos imediatamente à delegacia para garantir legalidade do auto, direito ao silêncio estratégico e arbitramento de fiança quando cabível.',
      },
      {
        title: 'Audiência de custódia nas próximas horas exigindo liberdade provisória',
        detail:
          'Instruímos documentação de residência fixa, trabalho lícito e teses de nulidade para requerer relaxamento ou substituição por cautelares.',
      },
      {
        title: 'Mandado de prisão, busca e apreensão ou inquérito policial em andamento',
        detail:
          'Impetramos Habeas Corpus liminar no TJDFT e STJ e atuamos na defesa técnica sigilosa desde a fase investigativa.',
      },
    ],
    whatsappPrefill:
      'URGÊNCIA PLANTÃO 24H — Olá, Dr. Henrique. Preciso de atendimento criminal imediato (delegacia / custódia / habeas corpus).',
    ctaLabel: 'Acionar Plantão Criminal 24h Agora',
    keywords: [
      'criminal',
      'plantao',
      '24h',
      'delegacia',
      'flagrante',
      'preso',
      'prisao',
      'custodia',
      'habeas corpus',
      'liberdade',
      'blitz',
      'madrugada',
      'meia-noite',
      '02h',
      'liminar imediata',
      'urgencia',
    ],
    courtFocus: 'TJDFT • Plantão Criminal 24h & STJ',
  },
};

export const LEGAL_CASES: LegalCase[] = [
  // IMOBILIÁRIO (3 casos distintos exclusivos de Direito Imobiliário no DF)
  {
    id: 'imob-1',
    personaId: 'imobiliario',
    courtRef: 'TJDFT — 3ª Turma Cível',
    processHint: 'Águas Claras / DF',
    title: 'Atraso na entrega de imóvel na planta com lucros cessantes e congelamento do INCC',
    situation:
      'Comprador aguardou 11 meses além do prazo contratual de tolerância de 180 dias enquanto a construtora seguia reajustando o saldo devedor pelo INCC sem entregar as chaves.',
    strategyAndOutcome:
      'Demonstramos mora exclusiva da incorporadora. O TJDFT congelou o saldo devedor desde o vencimento do prazo, fixou aluguel mensal retroativo por todo o atraso e deferiu danos morais.',
    metricBadge: 'R$ 74.800 em lucros cessantes',
    timeframe: '6 meses até sentença',
    displayOrder: 1,
  },
  {
    id: 'imob-2',
    personaId: 'imobiliario',
    courtRef: 'TJDFT — 6ª Turma Cível',
    processHint: 'Noroeste / Brasília-DF',
    title: 'Distrato imobiliário com devolução de 100% dos valores pagos e afastamento de multa',
    situation:
      'Adquirente precisou rescindir o contrato após descumprimento do memorial descritivo e atraso na obra, mas a incorporadora exigia retenção abusiva de 50% do capital investido.',
    strategyAndOutcome:
      'Aplicamos a Súmula 543 do STJ comprovando culpa contratual da vendedora. A sentença anulou a cláusula penal e ordenou restituição integral em parcela única corrigida pelo IPCA.',
    metricBadge: 'R$ 194.600 restituídos (100%)',
    timeframe: '7 meses até acórdão',
    displayOrder: 2,
  },
  {
    id: 'imob-3',
    personaId: 'imobiliario',
    courtRef: 'TJDFT — 1ª Vara Cível do Gama',
    processHint: 'Setor Central — Gama/DF',
    title: 'Regularização de escritura e posse definitiva via adjudicação compulsória no DF',
    situation:
      'Família possuía contrato de gaveta quitado há 9 anos, porém a antiga proprietária havia se mudado para outro estado e recusava-se a outorgar a escritura pública definitiva.',
    strategyAndOutcome:
      'Reunimos cadeia completa de recibos, comprovantes de IPTU e quitação bancária. A sentença substituiu a assinatura da vendedora e determinou registro direto no Cartório do 5º Ofício do DF.',
    metricBadge: 'Matrícula e escritura registradas',
    timeframe: '5 meses em 1º grau',
    displayOrder: 3,
  },

  // FAMÍLIA (3 casos)
  {
    id: 'fam-1',
    personaId: 'familia',
    courtRef: 'TJDFT — 2ª Vara de Família do Gama',
    processHint: 'Sigilo Judicial — DF',
    title: 'Divórcio litigioso com bloqueio cautelar de ativos e partilha societária justa',
    situation:
      'Cônjuge administrador de duas empresas tentou transferir quotas e esvaziar reservas financeiras às vésperas da separação sob regime de comunhão parcial de bens.',
    strategyAndOutcome:
      'Protocolamos tutela cautelar antecedente em 48h, bloqueando movimentações atípicas via Sisbajud e assegurando apuração de haveres por perícia contábil independente, culminando em acordo homologado.',
    metricBadge: 'Patrimônio de R$ 1,4M preservado',
    timeframe: 'Liminar em 72h • Acordo em 4 meses',
    displayOrder: 1,
  },
  {
    id: 'fam-2',
    personaId: 'familia',
    courtRef: 'TJDFT — Vara de Órfãos e Sucessões',
    processHint: 'Asa Sul / Brasília-DF',
    title: 'Inventário complexo com 4 imóveis destravado em cartório após mediação',
    situation:
      'Inventário paralisado havia 3 anos por divergência entre herdeiros quanto à avaliação de imóveis comerciais e administração de aluguéis deixados pelo falecido.',
    strategyAndOutcome:
      'Reestruturamos o plano de partilha com avaliação imobiliária técnica imparcial e compensação de frutos, viabilizando escritura pública consensual em cartório e economia expressiva de custas.',
    metricBadge: '4 imóveis liberados',
    timeframe: '68 dias após assunção do caso',
    displayOrder: 2,
  },
  {
    id: 'fam-3',
    personaId: 'familia',
    courtRef: 'TJDFT — 4ª Turma Cível',
    processHint: 'Taguatinga / DF',
    title: 'Majoração de pensão alimentícia com quebra de sigilo fiscal de autônomo',
    situation:
      'Alimentante declarava renda formal mínima enquanto mantinha padrão elevado em redes sociais e empresas ligadas a terceiros, oferecendo pensão incompatível com as necessidades do menor.',
    strategyAndOutcome:
      'Requeremos pesquisa via Infojud e extratos de cartões corporativos, comprovando capacidade econômica real e elevando os alimentos de 1 para 4,5 salários mínimos mais custeio escolar.',
    metricBadge: 'Pensão ampliada em 350%',
    timeframe: '6 meses até decisão',
    displayOrder: 3,
  },

  // TRABALHISTA (3 casos)
  {
    id: 'trab-1',
    personaId: 'trabalhista',
    courtRef: 'TRT-10 — 12ª Vara do Trabalho de Brasília',
    processHint: 'Setor Bancário / DF',
    title: 'Reconhecimento de vínculo de emprego de gerente contratado como PJ por 4 anos',
    situation:
      'Profissional de tecnologia atuava com exclusividade, metas diárias e subordinação direta, mas foi obrigado a abrir ME/PJ e dispensado abruptamente sem verbas rescisórias.',
    strategyAndOutcome:
      'Reunimos atas de reuniões, escalas internas e relatórios hierárquicos. O TRT-10 reconheceu a fraude trabalhista e condenou a empresa ao pagamento de férias, 13º, FGTS + 40% e aviso prévio.',
    metricBadge: 'R$ 238.900 homologados',
    timeframe: '8 meses até acordo em execução',
    displayOrder: 1,
  },
  {
    id: 'trab-2',
    personaId: 'trabalhista',
    courtRef: 'TRT-10 — Vara do Trabalho do Gama',
    processHint: 'Distrito Industrial — Gama/DF',
    title: 'Horas extras noturnas, supressão de intervalo e adicional de periculosidade',
    situation:
      'Supervisor de logística cumpria jornadas superiores a 11 horas diárias sem registro fidedigno no cartão de ponto e exposto permanentemente a área de inflamáveis.',
    strategyAndOutcome:
      'Cruzamos logs de portaria eletrônica e rastreamento veicular, além de perícia técnica ambiental positiva, resultando em condenação integral das horas extraordinárias e adicional de 30%.',
    metricBadge: 'R$ 142.300 líquidos',
    timeframe: '10 meses até trânsito',
    displayOrder: 2,
  },
  {
    id: 'trab-3',
    personaId: 'trabalhista',
    courtRef: 'TRT-10 — 2ª Turma',
    processHint: 'Asa Norte / Brasília-DF',
    title: 'Rescisão indireta por assédio moral e atrasos reiterados de FGTS',
    situation:
      'Analista financeira sofria cobranças vexatórias públicas e descobriu ausência de depósitos fundiários por 18 meses, temendo pedir demissão e perder seus direitos.',
    strategyAndOutcome:
      'Ajuizamos rescisão indireta com provas documentais de mensagens corporativas e extrato analítico da Caixa, garantindo saída imediata com saque integral do FGTS, multa de 40% e dano moral.',
    metricBadge: 'R$ 94.500 + seguro-desemprego',
    timeframe: '5 meses até sentença',
    displayOrder: 3,
  },

  // PREVIDENCIÁRIO (3 casos)
  {
    id: 'prev-1',
    personaId: 'previdenciario',
    courtRef: 'TRF-1 — 1ª Turma Recursal do DF',
    processHint: 'Gama & Entorno / DF',
    title: 'Conversão de tempo especial e concessão de aposentadoria com atrasados',
    situation:
      'Técnico hospitalar teve 14 anos de atividade insalubre desconsiderados pelo INSS sob alegação genérica de uso de EPI eficaz.',
    strategyAndOutcome:
      'Impugnamos o PPP administrativo com base no Tema 555 do STF e laudos ambientais contemporâneos. A Turma Recursal reconheceu o tempo especial e determinou implantação imediata + RPV.',
    metricBadge: 'R$ 168.400 em atrasados (RPV)',
    timeframe: '9 meses até implantação',
    displayOrder: 1,
  },
  {
    id: 'prev-2',
    personaId: 'previdenciario',
    courtRef: 'TRF-1 — Juizado Especial Federal do DF',
    processHint: 'Plano Piloto / Brasília-DF',
    title: 'Revisão de renda mensal inicial por vínculos ignorados no CNIS',
    situation:
      'Segurado aposentou-se com benefício 32% inferior ao esperado porque dois contratos antigos não haviam migrado para o extrato previdenciário oficial.',
    strategyAndOutcome:
      'Apresentamos carteiras de trabalho originais, fichas financeiras e RAIS histórica em ação revisional, elevando permanentemente o benefício mensal e garantindo diferenças retroativas dos últimos 5 anos.',
    metricBadge: '+R$ 1.890/mês vitalício',
    timeframe: '7 meses até sentença procedente',
    displayOrder: 2,
  },
  {
    id: 'prev-3',
    personaId: 'previdenciario',
    courtRef: 'TRF-1 — 24ª Vara Federal Cível',
    processHint: 'Santa Maria / Gama-DF',
    title: 'Restabelecimento liminar de benefício por incapacidade após alta médica indevida',
    situation:
      'Trabalhadora submetida a cirurgia ortopédica teve o auxílio por incapacidade cessado pelo INSS antes da reabilitação, ficando sem qualquer fonte de sustento.',
    strategyAndOutcome:
      'Instruímos o processo com relatório circunstanciado de especialista e exames de imagem atualizados, obtendo tutela de urgência para reativação em 12 dias e confirmação por perícia judicial.',
    metricBadge: 'Restabelecido em 12 dias',
    timeframe: 'Tutela imediata + atrasados',
    displayOrder: 3,
  },

  // CONSUMIDOR (3 casos)
  {
    id: 'cons-1',
    personaId: 'consumidor',
    courtRef: 'TJDFT — 1º Juizado Especial Cível do Gama',
    processHint: 'Gama / DF',
    title: 'Exclusão de negativação indevida em 36h e indenização por fraude bancária',
    situation:
      'Empresário teve o CPF incluído no Serasa por empréstimo fraudulento contratado por terceiros, impedindo a renovação de linha de crédito comercial.',
    strategyAndOutcome:
      'Ajuizamos ação declaratória de inexistência de débito com pedido liminar e inversão do ônus da prova. O juízo determinou baixa imediata sob multa diária e condenou o banco em danos morais.',
    metricBadge: 'Nome limpo em 36h + R$ 18.000',
    timeframe: '3 meses até pagamento',
    displayOrder: 1,
  },
  {
    id: 'cons-2',
    personaId: 'consumidor',
    courtRef: 'TJDFT — 5ª Vara Cível de Brasília',
    processHint: 'Asa Sul / Brasília-DF',
    title: 'Liminar obrigando plano de saúde a custear cirurgia e prótese importada',
    situation:
      'Operadora negou cobertura de procedimento cirúrgico de coluna prescrito em caráter de urgência alegando ausência no rol exemplificativo.',
    strategyAndOutcome:
      'Aplicamos a Lei 14.454/2022 e a Súmula 102 em tutela de urgência fundamentada no laudo cirúrgico. A cirurgia foi autorizada no dia seguinte sem custos adicionais ao beneficiário.',
    metricBadge: 'Autorização judicial em 18h',
    timeframe: 'Liminar confirmada em sentença',
    displayOrder: 2,
  },
  {
    id: 'cons-3',
    personaId: 'consumidor',
    courtRef: 'TJDFT — 2ª Turma Recursal',
    processHint: 'Aeroporto de Brasília / DF',
    title: 'Restituição em dobro de descontos consignados não autorizados em conta salário',
    situation:
      'Servidora aposentada identificou três reservas de margem consignável (RMC) e seguros embutidos descontados mensalmente sem assinatura válida.',
    strategyAndOutcome:
      'Demonstramos falha na prestação de informação e ausência de contrato biométrico legítimo, conquistando cancelamento definitivo, devolução em dobro do indébito e reparação moral.',
    metricBadge: 'R$ 34.200 restituídos',
    timeframe: '4 meses até trânsito em julgado',
    displayOrder: 3,
  },

  // DIREITO MÉDICO & PLANOS DE SAÚDE (3 casos)
  {
    id: 'saude-1',
    personaId: 'saude',
    courtRef: 'TJDFT — Plantão Judicial Cível',
    processHint: 'Asa Sul / Brasília-DF',
    title: 'Liminar em 14 horas obrigando plano de saúde a custear cirurgia de coluna e prótese',
    situation:
      'Operadora recusou procedimento cirúrgico emergencial e material importado prescrito por neurocirurgião alegando ausência no rol da ANS.',
    strategyAndOutcome:
      'Protocolamos tutela de urgência no plantão com fundamentação na Lei 14.454/2022 e risco de sequela irreversível. Ordem concedida sob multa diária de R$ 5 mil.',
    metricBadge: 'Cirurgia autorizada em 14h',
    timeframe: 'Plantão Judicial DF',
    displayOrder: 1,
  },
  {
    id: 'saude-2',
    personaId: 'saude',
    courtRef: 'TJDFT — 4ª Turma Cível',
    processHint: 'Gama / DF',
    title: 'Concessão judicial de Home Care 24h com equipe de enfermagem e oxigenoterapia',
    situation:
      'Paciente idosa com alta hospitalar condicionada a cuidados intensivos domiciliares teve o custeio de Home Care negado pelo plano por cláusula contratual genérica.',
    strategyAndOutcome:
      'Demonstramos abusividade da exclusão frente à indicação médica expressa. O TJDFT garantiu internação domiciliar completa sem ônus adicional à família.',
    metricBadge: 'Home Care 24h garantido',
    timeframe: 'Liminar em 24h',
    displayOrder: 2,
  },
  {
    id: 'saude-3',
    personaId: 'saude',
    courtRef: 'TJDFT — 7ª Vara Cível de Brasília',
    processHint: 'Lago Sul / Brasília-DF',
    title: 'Custeio integral de medicamento oncológico de alto custo (R$ 42 mil/mês) fora do rol',
    situation:
      'Plano de saúde negou imunoterapia prescrita para tratamento oncológico específico sob argumento de uso off-label e custo elevado.',
    strategyAndOutcome:
      'Apresentamos estudos clínicos de eficácia e registro na Anvisa. O juízo deferiu fornecimento contínuo imediato e confirmou em sentença definitiva.',
    metricBadge: 'R$ 504 mil/ano custeados',
    timeframe: 'Tutela em 36h',
    displayOrder: 3,
  },

  // DIREITO EMPRESARIAL & CONTRATOS (3 casos)
  {
    id: 'empr-1',
    personaId: 'empresarial',
    courtRef: 'TJDFT — 2ª Vara Cível de Brasília',
    processHint: 'Setor Comercial Sul / DF',
    title: 'Dissolução parcial e blindagem societária preservando operação de clínica no DF',
    situation:
      'Sócio retirante exigia bloqueio imediato das contas bancárias da empresa por divergência no valuation e na forma de pagamento dos haveres.',
    strategyAndOutcome:
      'Estruturamos defesa técnica com balanço especial de determinação e parcelamento legal dos haveres, impedindo o bloqueio de caixa e assegurando continuidade do negócio.',
    metricBadge: 'Caixa de R$ 2,1M preservado',
    timeframe: 'Acordo homologado em 5 meses',
    displayOrder: 1,
  },
  {
    id: 'empr-2',
    personaId: 'empresarial',
    courtRef: 'TJDFT — 1ª Vara Cível do Gama',
    processHint: 'Setor Industrial — Gama/DF',
    title: 'Execução acelerada de duplicatas e contratos B2B com bloqueio patrimonial efetivo',
    situation:
      'Distribuidora local acumulava R$ 310 mil em títulos vencidos de comprador que ocultava recursos em contas paralelas.',
    strategyAndOutcome:
      'Conduzimos execução de título extrajudicial com pesquisa patrimonial avançada (Sisbajud/Sniper), alcançando bloqueio integral e acordo com garantia real.',
    metricBadge: 'R$ 310.000 recuperados',
    timeframe: '4 meses até satisfação',
    displayOrder: 2,
  },
  {
    id: 'empr-3',
    personaId: 'empresarial',
    courtRef: 'TJDFT — 5ª Turma Cível',
    processHint: 'Taguatinga / DF',
    title: 'Revisão de contrato comercial e afastamento de multa rescisória abusiva de franquia',
    situation:
      'Empresário enfrentava cobrança de multa de R$ 180 mil após franqueadora descumprir suporte operacional e exclusividade territorial prometidos na COF.',
    strategyAndOutcome:
      'Demonstramos inadimplemento prévio da franqueadora, anulando a penalidade contratual e garantindo restituição parcial da taxa inicial.',
    metricBadge: 'Multa de R$ 180 mil anulada',
    timeframe: '8 meses até acórdão',
    displayOrder: 3,
  },

  // URGÊNCIA CRIMINAL & PLANTÃO 24H (3 casos)
  {
    id: 'crim-1',
    personaId: 'criminal',
    courtRef: 'TJDFT — Núcleo de Audiência de Custódia (NAC)',
    processHint: 'Brasília / DF • Plantão 24h',
    title: 'Liberdade provisória sem fiança concedida em audiência de custódia em 8 horas',
    situation:
      'Autuação em flagrante durante a madrugada sem antecedentes criminais, com risco de conversão em prisão preventiva pela manhã.',
    strategyAndOutcome:
      'Acompanhamos o flagrante ainda na delegacia, reunimos comprovação de residência fixa e vínculo empregatício e obtivemos liberdade imediata na custódia.',
    metricBadge: 'Liberdade em 8 horas',
    timeframe: 'Audiência de Custódia DF',
    displayOrder: 1,
  },
  {
    id: 'crim-2',
    personaId: 'criminal',
    courtRef: 'TJDFT — Plantão Criminal de 2º Grau',
    processHint: 'Gama & Entorno / DF',
    title: 'Habeas Corpus liminar revogando prisão preventiva por ausência de fundamentação',
    situation:
      'Decisão genérica decretou custódia cautelar sem apontar risco concreto à instrução processual ou reiteração delitiva.',
    strategyAndOutcome:
      'Impetramos Habeas Corpus no plantão do TJDFT demonstrando ilegalidade manifesta e suficiência de medidas cautelares diversas, com expedição imediata de alvará de soltura.',
    metricBadge: 'Alvará de soltura em 19h',
    timeframe: 'Liminar no TJDFT',
    displayOrder: 2,
  },
  {
    id: 'crim-3',
    personaId: 'criminal',
    courtRef: 'TJDFT — Vara Criminal do Gama',
    processHint: 'Gama / DF',
    title: 'Trancamento de inquérito e nulidade de busca domiciliar sem mandado judicial',
    situation:
      'Ingresso policial em residência sem autorização válida nem fundada suspeita objetiva gerou apreensão e indiciamento indevido.',
    strategyAndOutcome:
      'Invocamos a jurisprudência consolidada do STJ (Tema 280) sobre inviolabilidade domiciliar, alcançando reconhecimento de prova ilícita e arquivamento definitivo.',
    metricBadge: 'Inquérito trancado / arquivado',
    timeframe: '3 meses até decisão',
    displayOrder: 3,
  },

  // GERAL (3 casos emblemáticos curados)
  {
    id: 'ger-1',
    personaId: 'geral',
    courtRef: 'TJDFT — 3ª Turma Cível',
    processHint: 'Distrito Federal',
    title: 'Rescisão imobiliária com devolução de 100% dos valores pagos à construtora',
    situation:
      'Atraso superior a 10 meses na entrega do empreendimento e tentativa de retenção abusiva de metade do capital investido pelo comprador.',
    strategyAndOutcome:
      'Resolução contratual decretada por culpa exclusiva da incorporadora, com restituição integral atualizada e pagamento de lucros cessantes mensais.',
    metricBadge: 'R$ 194.600 restituídos',
    timeframe: '7 meses até acórdão',
    displayOrder: 1,
  },
  {
    id: 'ger-2',
    personaId: 'geral',
    courtRef: 'TRT-10 — 12ª Vara do Trabalho',
    processHint: 'Brasília / DF',
    title: 'Reconhecimento de vínculo empregatício e quitação integral de passivo trabalhista',
    situation:
      'Contratação formal como pessoa jurídica para mascarar relação típica de emprego com metas, horário rígido e subordinação contínua.',
    strategyAndOutcome:
      'Conjunto probatório digital robusto resultou em acordo judicial vantajoso contemplando FGTS, multa de 40%, férias, 13º e reflexos.',
    metricBadge: 'R$ 238.900 homologados',
    timeframe: '8 meses até execução',
    displayOrder: 2,
  },
  {
    id: 'ger-3',
    personaId: 'geral',
    courtRef: 'TJDFT — 2ª Vara de Família',
    processHint: 'Gama / DF',
    title: 'Proteção cautelar de patrimônio societário em divórcio litigioso',
    situation:
      'Risco iminente de dilapidação de bens comuns e quotas empresariais durante processo de dissolução conjugal.',
    strategyAndOutcome:
      'Medida cautelar deferida em 72 horas com bloqueio preventivo e apuração contábil independente, assegurando partilha equânime.',
    metricBadge: 'R$ 1,4M preservados',
    timeframe: 'Liminar em 72h',
    displayOrder: 3,
  },
];

// Cenários de Inferência Indireta (Pistas Cruzadas — Estilo Algoritmo TikTok)
export const CROSS_INTENT_PRESETS: LeadOriginPreset[] = [
  {
    id: 'cross-previdenciario',
    mode: 'cross-intent',
    channel: 'Pista Cruzada',
    label: 'Pesquisou "dor nas pernas" + 57 anos + horário comercial',
    shortLabel: 'Dor nas pernas + 57 anos + comercial',
    deductionLabel: 'Deduziu: Previdenciário / Aposentadoria por Incapacidade (96%)',
    personaId: 'previdenciario',
    utmTerm: 'dor-nas-pernas-57-anos-laudo-contribuicao',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'inferencia_indireta',
    referrerHint: 'google.com.br/search?q=dor+nas+pernas+coluna+57+anos+laudo',
    expectedScore: 96,
    simulatedTelemetry: {
      deviceLabel: 'Android Mobile',
      connectionType: '4G',
      batteryLabel: '68%',
      batteryCritical: false,
      accessHourLabel: '10h42 • Expediente Comercial',
      urgencyLevel: 'elevada',
      dwellMs: 4200,
      reReadCount: 2,
      scrollVelocityPxSec: 115,
      semanticVectorSummary: 'dor nas pernas + laudo + 57 anos → Incapacidade / INSS',
      activeSignalCount: 7,
    },
  },
  {
    id: 'cross-criminal-plantao',
    mode: 'cross-intent',
    channel: 'Pista Cruzada',
    label: 'Acesso 02h da manhã via Celular + Bateria 14% + Busca rápida',
    shortLabel: '02h + Celular + Bateria 14% + Urgência',
    deductionLabel: 'Deduziu: Plantão Urgente 24h / Liminar & Custódia Imediata (98%)',
    personaId: 'criminal',
    utmTerm: 'plantao-02h-delegacia-custodia-urgente',
    utmSource: 'google',
    utmMedium: 'organic_mobile',
    utmCampaign: 'inferencia_indireta',
    referrerHint: 'google.com.br/search?q=advogado+agora+delegacia+flagrante+df',
    expectedScore: 98,
    simulatedTelemetry: {
      deviceLabel: 'iOS Mobile',
      connectionType: '4G',
      batteryLabel: '14% (Crítica)',
      batteryCritical: true,
      accessHourLabel: '02h18 • Madrugada / Plantão 24h',
      urgencyLevel: 'critica',
      dwellMs: 1450,
      reReadCount: 1,
      scrollVelocityPxSec: 640,
      semanticVectorSummary: '02h madrugada + bateria 14% + mobile → Plantão 24h',
      activeSignalCount: 9,
    },
  },
  {
    id: 'cross-imobiliario-reread',
    mode: 'cross-intent',
    channel: 'Pista Cruzada',
    label: 'Leu 2x cláusula de multa + Desktop corporativo',
    shortLabel: 'Releitura 2x multa + Desktop',
    deductionLabel: 'Deduziu: Distrato Imobiliário / Revisão Contratual (93%)',
    personaId: 'imobiliario',
    utmTerm: 'clausula-multa-parcela-reajustada-chaves',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'inferencia_indireta',
    referrerHint: 'google.com.br/search?q=construtora+parcela+reajustada+multa+distrato',
    expectedScore: 93,
    simulatedTelemetry: {
      deviceLabel: 'Desktop Corporativo',
      connectionType: 'Wi-Fi / Fibra',
      batteryLabel: 'AC / Carregando',
      batteryCritical: false,
      accessHourLabel: '15h10 • Expediente Comercial',
      urgencyLevel: 'elevada',
      dwellMs: 6800,
      reReadCount: 3,
      scrollVelocityPxSec: 88,
      semanticVectorSummary: 'releitura 2x multa + desktop + chaves → Distrato Imobiliário',
      activeSignalCount: 8,
    },
  },
  {
    id: 'cross-consumidor-pix',
    mode: 'cross-intent',
    channel: 'Pista Cruzada',
    label: 'Pix bloqueado + Conta invadida no celular',
    shortLabel: 'Pix bloqueado + Conta invadida',
    deductionLabel: 'Deduziu: Direito Bancário & Consumidor / Liminar (95%)',
    personaId: 'consumidor',
    utmTerm: 'pix-bloqueado-conta-invadida-banco',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'inferencia_indireta',
    referrerHint: 'google.com.br/search?q=conta+invadida+golpe+pix+banco+nao+devolve',
    expectedScore: 95,
    simulatedTelemetry: {
      deviceLabel: 'Android Mobile',
      connectionType: '5G',
      batteryLabel: '31%',
      batteryCritical: false,
      accessHourLabel: '19h45 • Plantão Noturno',
      urgencyLevel: 'critica',
      dwellMs: 2900,
      reReadCount: 2,
      scrollVelocityPxSec: 390,
      semanticVectorSummary: 'pix bloqueado + conta invadida + noturno → Bancário Urgente',
      activeSignalCount: 7,
    },
  },
  {
    id: 'cross-saude-liminar',
    mode: 'cross-intent',
    channel: 'Pista Cruzada',
    label: 'Pesquisou "plano negou cirurgia" + Laudo urgente + Mobile',
    shortLabel: 'Plano negou cirurgia + Laudo urgente',
    deductionLabel: 'Deduziu: Direito Médico / Liminar 24h no TJDFT (97%)',
    personaId: 'saude',
    utmTerm: 'plano-negou-cirurgia-laudo-urgente',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'inferencia_indireta',
    referrerHint: 'google.com.br/search?q=plano+de+saude+negou+cirurgia+urgente+liminar',
    expectedScore: 97,
    simulatedTelemetry: {
      deviceLabel: 'iOS Mobile',
      connectionType: '4G',
      batteryLabel: '22%',
      batteryCritical: false,
      accessHourLabel: '21h05 • Plantão Noturno',
      urgencyLevel: 'critica',
      dwellMs: 3600,
      reReadCount: 2,
      scrollVelocityPxSec: 270,
      semanticVectorSummary: 'cirurgia negada + laudo médico + noturno → Liminar Saúde 24h',
      activeSignalCount: 8,
    },
  },
];

// Cenários de Busca Direta (8 Áreas Completas)
export const LEAD_ORIGIN_PRESETS: LeadOriginPreset[] = [
  {
    id: 'preset-imobiliario',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: Construtora atrasou entrega',
    shortLabel: 'Imobiliário',
    deductionLabel: 'Direito Imobiliário (94%)',
    personaId: 'imobiliario',
    utmTerm: 'construtora-atrasou-entrega-imovel',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'busca_imobiliario_df',
    referrerHint: 'google.com.br/search?q=construtora+atrasou+entrega+imovel',
    expectedScore: 94,
  },
  {
    id: 'preset-familia',
    mode: 'direct',
    channel: 'Instagram',
    label: 'Instagram: Partilha de bens no divórcio',
    shortLabel: 'Família',
    deductionLabel: 'Família & Sucessões (94%)',
    personaId: 'familia',
    utmTerm: 'partilha-de-bens-no-divorcio',
    utmSource: 'instagram',
    utmMedium: 'paid_social',
    utmCampaign: 'familia_sucessoes_df',
    referrerHint: 'instagram.com/ad/partilha-divorcio-df',
    expectedScore: 94,
  },
  {
    id: 'preset-trabalhista',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: Fui demitido como PJ',
    shortLabel: 'Trabalhista',
    deductionLabel: 'Direito Trabalhista (95%)',
    personaId: 'trabalhista',
    utmTerm: 'fui-demitido-como-pj-horario-fixo',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'trt10_trabalhista',
    referrerHint: 'google.com.br/search?q=fui+demitido+como+pj+direitos',
    expectedScore: 95,
  },
  {
    id: 'preset-previdenciario',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: INSS negou aposentadoria',
    shortLabel: 'Previdenciário',
    deductionLabel: 'Previdenciário & INSS (95%)',
    personaId: 'previdenciario',
    utmTerm: 'inss-negou-aposentadoria-revisao',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'inss_aposentadoria_df',
    referrerHint: 'google.com.br/search?q=inss+negou+aposentadoria+recurso',
    expectedScore: 95,
  },
  {
    id: 'preset-consumidor',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: Golpe do Pix / Nome negativado',
    shortLabel: 'Consumidor',
    deductionLabel: 'Consumidor & Bancário (94%)',
    personaId: 'consumidor',
    utmTerm: 'golpe-pix-nome-negativado-serasa',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'consumidor_bancario_df',
    referrerHint: 'google.com.br/search?q=golpe+pix+negativacao+indevida',
    expectedScore: 94,
  },
  {
    id: 'preset-saude',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: Plano negou cirurgia / Home Care',
    shortLabel: 'Médico & Saúde',
    deductionLabel: 'Direito Médico & Planos de Saúde (96%)',
    personaId: 'saude',
    utmTerm: 'plano-negou-cirurgia-home-care-liminar',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'liminar_saude_tjdft',
    referrerHint: 'google.com.br/search?q=plano+de+saude+negou+cirurgia+urgente',
    expectedScore: 96,
  },
  {
    id: 'preset-empresarial',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: Blindagem societária e cobrança B2B',
    shortLabel: 'Empresarial',
    deductionLabel: 'Direito Empresarial & Contratos (93%)',
    personaId: 'empresarial',
    utmTerm: 'blindagem-societaria-cobranca-contratos',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'empresarial_contratos_df',
    referrerHint: 'google.com.br/search?q=advogado+empresarial+conflito+socios+df',
    expectedScore: 93,
  },
  {
    id: 'preset-criminal',
    mode: 'direct',
    channel: 'Google',
    label: 'Busca Google: Advogado plantão 24h delegacia / custódia',
    shortLabel: 'Criminal 24h',
    deductionLabel: 'Urgência Criminal & Plantão 24h (98%)',
    personaId: 'criminal',
    utmTerm: 'advogado-plantao-24h-delegacia-custodia',
    utmSource: 'google',
    utmMedium: 'cpc',
    utmCampaign: 'plantao_criminal_24h_df',
    referrerHint: 'google.com.br/search?q=advogado+criminalista+plantao+24h+df',
    expectedScore: 98,
  },
];

export const ORDERED_PRACTICE_AREAS: PersonaId[] = [
  'imobiliario',
  'familia',
  'trabalhista',
  'previdenciario',
  'consumidor',
  'saude',
  'empresarial',
  'criminal',
];
