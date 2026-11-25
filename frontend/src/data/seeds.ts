import type {
  LawyerProfile,
  LeadOriginPreset,
  LegalCase,
  PersonaContent,
  PersonaId,
} from '../types/legal';

export const DEFAULT_LAWYER_PROFILE: LawyerProfile = {
  id: 'default',
  lawyerName: 'Dr. Henrique Valença',
  firmName: 'Valença & Associados — Advocacia Estratégica',
  oabNumber: 'OAB/DF 48.210',
  whatsapp: '5561998421048',
  city: 'Gama & Brasília/DF',
  primaryArea: 'imobiliario',
  photoUrl: '/lawyer-portrait.png',
  experienceYears: 17,
  solvedCasesCount: 640,
  editorialQuote:
    'Cada processo carrega um patrimônio, um vínculo familiar ou uma trajetória de trabalho. Técnica jurídica rigorosa existe para proteger o que não pode esperar.',
};

export const PERSONA_CONTENTS: Record<PersonaId, PersonaContent> = {
  geral: {
    id: 'geral',
    areaLabel: 'Advocacia Estratégica',
    eyebrow: 'Atuação Contenciosa e Consultiva no Distrito Federal',
    headline: 'Defesa jurídica técnica para proteger seu patrimônio, sua família e seus direitos.',
    subheadline:
      'Atendimento reservado, análise documental minuciosa e atuação firme perante o TJDFT, TRT-10 e TRF-1 — com foco em previsibilidade e resolução célere.',
    authorityNote: 'Parecer inicial conduzido diretamente pelo advogado titular.',
    painSectionTitle: 'Quando a demora ou a insegurança jurídica custam caro',
    painPoints: [
      {
        title: 'Contratos desequilibrados e retenção indevida de valores',
        detail:
          'Cláusulas abusivas em distratos imobiliários, planos de saúde ou relações bancárias exigem revisão técnica imediata antes da consolidação do prejuízo.',
      },
      {
        title: 'Conflitos familiares e patrimoniais sem blindagem jurídica',
        detail:
          'Divórcios, pensões e inventários mal conduzidos paralisam bens por anos e geram desgaste emocional desnecessário.',
      },
      {
        title: 'Direitos trabalhistas ou previdenciários negados administrativamente',
        detail:
          'Cálculos subestimados, negativas do INSS e verbas rescisórias suprimidas demandam prova pericial precisa e tese alinhada aos tribunais superiores.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Gostaria de agendar uma análise jurídica confidencial do meu caso.',
    ctaLabel: 'Solicitar Análise Estratégica',
    keywords: ['advogado', 'escritorio', 'brasilia', 'gama', 'oab', 'consulta', 'direito'],
    courtFocus: 'TJDFT • TRT-10 • TRF-1',
  },
  imobiliario: {
    id: 'imobiliario',
    areaLabel: 'Direito Imobiliário',
    eyebrow: 'Imóveis na Planta, Distrato, Posse & Regularização no DF',
    headline: 'Recupere valores retidos pela construtora e proteja seu patrimônio imobiliário.',
    subheadline:
      'Atuação especializada no TJDFT contra atrasos na entrega de obras, multas abusivas de distrato, vícios construtivos e regularização de escrituras no Distrito Federal.',
    authorityNote: 'Súmulas 543 do STJ e jurisprudência consolidada das Turmas Cíveis do TJDFT.',
    painSectionTitle: 'Situações críticas que resolvemos no Direito Imobiliário',
    painPoints: [
      {
        title: 'Construtora retendo 50% a 70% do que você já pagou no distrato',
        detail:
          'Mesmo com a Lei do Distrato, cláusulas abusivas ou culpa da incorporadora permitem reaver até 100% das parcelas com correção monetária e juros.',
      },
      {
        title: 'Atraso na entrega das chaves além dos 180 dias de tolerância',
        detail:
          'Garantimos judicialmente a indenização por lucros cessantes (aluguel mensal equivalente ao imóvel), congelamento do saldo devedor pelo INCC e dano moral.',
      },
      {
        title: 'Imóvel sem escritura definitiva, usucapião ou cobrança de taxa SATI',
        detail:
          'Conduzimos adjudicação compulsória, usucapião extrajudicial em cartório do DF e restituição de comissões de corretagem indevidamente transferidas ao comprador.',
      },
    ],
    whatsappPrefill:
      'Olá, Dr. Henrique. Preciso de orientação jurídica sobre um problema imobiliário (distrato, atraso na entrega ou regularização de imóvel).',
    ctaLabel: 'Avaliar Meu Contrato Imobiliário',
    keywords: [
      'imovel',
      'imobiliario',
      'distrato',
      'construtora',
      'atraso',
      'obra',
      'usucapiao',
      'escritura',
      'aluguel',
      'incorporadora',
      'terreno',
      'lote',
    ],
    courtFocus: 'TJDFT • Varas Cíveis & STJ',
  },
  familia: {
    id: 'familia',
    areaLabel: 'Família e Sucessões',
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
      'Olá, Dr. Henrique. Preciso analisar meus direitos trabalhistas (rescisão, horas extras ou reconhecimento de vínculo).',
    ctaLabel: 'Calcular e Analisar Meus Direitos',
    keywords: [
      'trabalhista',
      'rescisao',
      'demissao',
      'fgts',
      'horas',
      'extras',
      'pj',
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
      'Olá, Dr. Henrique. Preciso de ajuda jurídica em Direito do Consumidor (negativação indevida, banco ou plano de saúde).',
    ctaLabel: 'Requerer Medida Urgente',
    keywords: [
      'consumidor',
      'negativacao',
      'serasa',
      'spc',
      'indenizacao',
      'banco',
      'juros',
      'plano',
      'saude',
      'voo',
      'fraude',
      'pix',
    ],
    courtFocus: 'TJDFT • Juizados & Varas Cíveis',
  },
};

export const LEGAL_CASES: LegalCase[] = [
  // IMOBILIÁRIO (3 casos)
  {
    id: 'imob-1',
    personaId: 'imobiliario',
    courtRef: 'TJDFT — 3ª Turma Cível',
    processHint: 'Águas Claras / DF',
    title: 'Rescisão por atraso de 11 meses com restituição de 100% e lucros cessantes',
    situation:
      'Compradora adquiriu unidade residencial na planta e sofreu atraso de quase um ano além do prazo contratual de tolerância, tendo o pedido de distrato negado com proposta de retenção de 50%.',
    strategyAndOutcome:
      'Demonstramos mora exclusiva da incorporadora e afastamos a cláusula de retenção. O TJDFT decretou resolução contratual com devolução integral corrigida pelo INCC/IPCA e aluguel mensal pelo período de atraso.',
    metricBadge: 'R$ 194.600 restituídos',
    timeframe: '7 meses até acórdão',
    displayOrder: 1,
  },
  {
    id: 'imob-2',
    personaId: 'imobiliario',
    courtRef: 'TJDFT — 1ª Vara Cível do Gama',
    processHint: 'Setor Central — Gama/DF',
    title: 'Adjudicação compulsória de imóvel quitado sem outorga de escritura',
    situation:
      'Família possuía contrato de gaveta quitado há 9 anos, porém a antiga proprietária havia se mudado para outro estado e recusava-se a assinar a escritura pública definitiva.',
    strategyAndOutcome:
      'Reunimos cadeia completa de recibos, comprovantes de IPTU e quitação bancária. A sentença substituiu a declaração de vontade da vendedora e determinou registro direto no Cartório do 5º Ofício do DF.',
    metricBadge: 'Matrícula regularizada',
    timeframe: '5 meses em 1º grau',
    displayOrder: 2,
  },
  {
    id: 'imob-3',
    personaId: 'imobiliario',
    courtRef: 'TJDFT — 6ª Turma Cível',
    processHint: 'Noroeste / Brasília-DF',
    title: 'Reparação integral por vícios construtivos e infiltração estrutural em cobertura',
    situation:
      'Imóvel entregue com infiltrações recorrentes em laje e esquadrias defeituosas, sem solução efetiva pela assistência técnica da construtora após sucessivos protocolos.',
    strategyAndOutcome:
      'Produzimos prova pericial de engenharia civil ainda em tutela antecipada de evidência, condenando a construtora ao custeio integral da obra reparadora e danos morais.',
    metricBadge: 'R$ 86.400 + reparo integral',
    timeframe: '9 meses até cumprimento',
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

export const LEAD_ORIGIN_PRESETS: LeadOriginPreset[] = [
  {
    id: 'preset-geral',
    label: 'Orgânico / Direto',
    shortLabel: 'Orgânico / Direto',
    personaId: 'geral',
    utmTerm: '',
    utmSource: 'direct',
    utmCampaign: 'institucional',
    referrerHint: 'acesso-direto',
  },
  {
    id: 'preset-imobiliario',
    label: 'Busca: Imóvel / Distrato',
    shortLabel: 'Imóvel / Distrato',
    personaId: 'imobiliario',
    utmTerm: 'distrato-imovel',
    utmSource: 'google',
    utmCampaign: 'busca-imobiliario-df',
    referrerHint: 'google.com.br/search?q=distrato+imovel+df',
  },
  {
    id: 'preset-familia',
    label: 'Busca: Divórcio & Família',
    shortLabel: 'Divórcio & Família',
    personaId: 'familia',
    utmTerm: 'divorcio-partilha',
    utmSource: 'google',
    utmCampaign: 'familia-sucessoes-df',
    referrerHint: 'google.com.br/search?q=advogado+divorcio+partilha+df',
  },
  {
    id: 'preset-trabalhista',
    label: 'Busca: Trabalhista',
    shortLabel: 'Trabalhista',
    personaId: 'trabalhista',
    utmTerm: 'rescisao-trabalhista',
    utmSource: 'google',
    utmCampaign: 'trt10-trabalhista',
    referrerHint: 'google.com.br/search?q=rescisao+trabalhista+horas+extras',
  },
  {
    id: 'preset-previdenciario',
    label: 'Busca: Aposentadoria / INSS',
    shortLabel: 'Aposentadoria / INSS',
    personaId: 'previdenciario',
    utmTerm: 'revisao-inss',
    utmSource: 'google',
    utmCampaign: 'inss-aposentadoria-df',
    referrerHint: 'google.com.br/search?q=revisao+aposentadoria+inss',
  },
  {
    id: 'preset-consumidor',
    label: 'Busca: Consumidor / Indenização',
    shortLabel: 'Consumidor / Indenização',
    personaId: 'consumidor',
    utmTerm: 'negativacao-indevida',
    utmSource: 'google',
    utmCampaign: 'consumidor-urgencia',
    referrerHint: 'google.com.br/search?q=negativacao+indevida+indenizacao',
  },
];

export const ORDERED_PRACTICE_AREAS: PersonaId[] = [
  'imobiliario',
  'familia',
  'trabalhista',
  'previdenciario',
  'consumidor',
];
