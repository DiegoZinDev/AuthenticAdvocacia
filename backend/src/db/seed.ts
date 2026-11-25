import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { getDatabase } from './database.js';
import { FirmProfileRepository, type SeedFirmProfileInput } from '../repositories/FirmProfileRepository.js';
import { LeadPersonaRepository, type SeedLeadPersonaInput } from '../repositories/LeadPersonaRepository.js';
import { SuccessCaseRepository } from '../repositories/SuccessCaseRepository.js';
import type { CreateSuccessCaseDTO } from '../dtos/LeadPersonaDto.js';

export interface SeedExecutionSummary {
  firmProfileInserted: boolean;
  personasInserted: number;
  casesInserted: number;
  totalPersonas: number;
  totalCases: number;
}

const DEFAULT_FIRM_PROFILE: SeedFirmProfileInput = {
  lawyerName: 'Dr. Henrique Valença',
  firmName: 'Valença & Associados — Advocacia Estratégica',
  oab: 'OAB/DF 48.210',
  whatsapp: '5561998124450',
  primaryArea: 'Direito Imobiliário, Família e Trabalhista',
  photoDataUrl: null,
  city: 'Gama & Brasília — DF',
  yearsExperience: 14,
  casesSolvedCount: 420,
};

const SEED_PERSONAS: SeedLeadPersonaInput[] = [
  {
    slug: 'organico',
    label: 'Atendimento Estratégico Geral',
    keywords: [
      'advogado',
      'advocacia',
      'gama',
      'brasilia',
      'df',
      'escritorio',
      'consultoria',
      'juridico',
      'organico',
      'valenca',
    ],
    eyebrow: 'Advocacia de Alta Performance • Gama & Brasília/DF',
    headline: 'Defesa Jurídica Estratégica para Proteger seu Patrimônio, Família e Carreira',
    subheadline:
      'Atendimento direto com o sócio fundador no Gama e em Brasília. Diagnóstico preciso do risco jurídico, atuação ágil nos tribunais do DF e comunicação transparente do primeiro contato à sentença.',
    authorityStatement:
      'Há 14 anos conduzindo demandas complexas no TJDFT, TRT-10 e TRF-1 com foco em resultados mensuráveis e segurança jurídica.',
    painPoints: [
      'Insegurança sobre prazos processuais e riscos reais antes de assinar ou contestar um contrato',
      'Demora e falta de posicionamento claro sobre o andamento do seu processo judicial',
      'Receio de perder patrimônio construído ao longo de anos por falhas documentais ou bloqueios',
      'Necessidade de medidas liminares urgentes para frear cobranças, descontos ou atos abusivos',
    ],
    ctaLabel: 'Solicitar Análise Jurídica com Dr. Henrique',
    whatsappPrefill:
      'Olá, Dr. Henrique Valença! Visitei o site da Valença & Associados e gostaria de agendar uma análise jurídica do meu caso no DF.',
    displayOrder: 0,
  },
  {
    slug: 'imobiliario',
    label: 'Direito Imobiliário & Patrimonial',
    keywords: [
      'imobiliario',
      'imovel',
      'escritura',
      'usucapiao',
      'lote',
      'construtora',
      'distrato',
      'leilao',
      'despejo',
      'aluguel',
      'cartorio',
      'terracap',
      'regularizacao',
    ],
    eyebrow: 'Especialista Imobiliário • Gama, Águas Claras & Plano Piloto',
    headline: 'Regularize seu Imóvel, Anule Leilões Abusivos e Blindagem Patrimonial no DF',
    subheadline:
      'Atuação incisiva em escrituras, usucapião urbana e rural, atraso de entrega de construtoras, distratos imobiliários e suspensão urgente de leilões extrajudiciais junto ao TJDFT.',
    authorityStatement:
      'Experiência consolidada em litígios imobiliários e regularização fundiária no Distrito Federal e Entorno, protegendo imóveis residenciais e comerciais.',
    painPoints: [
      'Imóvel quitado há anos sem escritura definitiva ou com pendência registral em cartório do DF',
      'Atraso injustificado na entrega das chaves ou cobrança abusiva de juros de obra e INCC',
      'Risco iminente de consolidação da propriedade e leilão extrajudicial por atraso em parcelas',
      'Inquilino inadimplente ou disputa possessória colocando em risco sua renda patrimonial',
    ],
    ctaLabel: 'Proteger Meu Imóvel Agora',
    whatsappPrefill:
      'Olá, Dr. Henrique Valença! Preciso de orientação especializada em Direito Imobiliário no DF (escritura/contrato/leilão) e gostaria de uma avaliação rápida.',
    displayOrder: 1,
  },
  {
    slug: 'familia',
    label: 'Direito de Família & Sucessões',
    keywords: [
      'familia',
      'divorcio',
      'pensao',
      'alimentos',
      'guarda',
      'inventario',
      'heranca',
      'partilha',
      'uniao-estavel',
      'separacao',
    ],
    eyebrow: 'Família & Sucessões • Sigilo Absoluto e Firmeza Técnica',
    headline: 'Divórcio, Guarda, Pensão e Inventário Conduzidos com Firmeza e Proteção Patrimonial',
    subheadline:
      'Soluções estratégicas consensuais em cartório ou contenciosas nas Varas de Família do DF para resguardar seus filhos, evitar dilapidação de bens e destravar inventários.',
    authorityStatement:
      'Condução discreta e combativa perante as Varas de Família do Gama, Taguatinga e Brasília, unindo agilidade extrajudicial e rigor técnico.',
    painPoints: [
      'Medo de perder patrimônio familiar ou sofrer partilha desproporcional em divórcio litigioso',
      'Atraso recorrente no pagamento de pensão alimentícia ou necessidade de revisão do valor',
      'Conflito na definição de guarda, convivência equilibrada e proteção emocional dos filhos',
      'Inventário travado entre herdeiros gerando multas fiscais, bloqueio de contas e desvalorização de bens',
    ],
    ctaLabel: 'Falar em Sigilo Sobre Meu Caso Familiar',
    whatsappPrefill:
      'Olá, Dr. Henrique Valença! Busco atendimento sigiloso em Direito de Família/Sucessões no DF e gostaria de entender os próximos passos.',
    displayOrder: 2,
  },
  {
    slug: 'trabalhista',
    label: 'Direito Trabalhista Estratégico',
    keywords: [
      'trabalhista',
      'demissao',
      'justa-causa',
      'rescisao',
      'horas-extras',
      'fgts',
      'vinculo',
      'clt',
      'assedio',
      'acidente-trabalho',
      'trt',
    ],
    eyebrow: 'Defesa Trabalhista • Atuação no TRT-10 (Gama & Brasília)',
    headline: 'Recupere Verbas Rescisórias, Horas Extras e Reverta Justa Causa Indevida',
    subheadline:
      'Cálculo técnico detalhado antes da ação, levantamento de provas digitais e atuação firme no TRT-10 contra demissões abusivas, pejotização fraudulenta, assédio e ausência de FGTS.',
    authorityStatement:
      'Atuação reconhecida nas Varas do Trabalho do Gama e Brasília na recomposição integral de direitos trabalhistas e acordos de alto valor.',
    painPoints: [
      'Demissão sem pagamento integral das verbas rescisórias, férias, 13º ou multa de 40% do FGTS',
      'Jornadas exaustivas sem registro real de ponto ou banco de horas manipulado pela empresa',
      'Justa causa aplicada de forma desproporcional para evitar o pagamento da rescisão devida',
      'Trabalho como PJ com subordinação e horário fixo ou descontos indevidos sem recolhimento previdenciário',
    ],
    ctaLabel: 'Calcular Meus Direitos Trabalhistas',
    whatsappPrefill:
      'Olá, Dr. Henrique Valença! Fui desligado / estou enfrentando um problema trabalhista no DF e gostaria de avaliar minhas verbas e direitos.',
    displayOrder: 3,
  },
  {
    slug: 'previdenciario',
    label: 'Direito Previdenciário & INSS',
    keywords: [
      'previdenciario',
      'inss',
      'aposentadoria',
      'bpc',
      'loas',
      'auxilio-doenca',
      'beneficio',
      'pericia',
      'revisao',
      'pensao-por-morte',
    ],
    eyebrow: 'Previdenciário & TRF-1 • Planejamento e Ações contra o INSS',
    headline: 'Destrave sua Aposentadoria, Benefício por Incapacidade ou BPC/LOAS Negado pelo INSS',
    subheadline:
      'Análise minuciosa do CNIS, contagem de tempo especial e atuação judicial rápida no TRF-1 para reverter indeferimentos administrativos e garantir valores retroativos desde a DER.',
    authorityStatement:
      'Atuação especializada nos Juizados Especiais Federais de Brasília e Turmas Recursais do TRF-1 para assegurar o melhor benefício possível.',
    painPoints: [
      'Benefício indeferido em perícia rápida do INSS mesmo com laudos médicos e exames contundentes',
      'Erros no CNIS, períodos sem contribuição reconhecida ou tempo insalubre ignorado no cálculo',
      'Atraso superior ao prazo legal na análise do requerimento administrativo no Meu INSS',
      'Valor da aposentadoria abaixo do esperado sem avaliação de regras de transição mais vantajosas',
    ],
    ctaLabel: 'Analisar Meu Benefício no INSS',
    whatsappPrefill:
      'Olá, Dr. Henrique Valença! Tive um benefício negado/atrasado no INSS ou preciso planejar minha aposentadoria no DF e gostaria de orientação.',
    displayOrder: 4,
  },
  {
    slug: 'consumidor',
    label: 'Direito do Consumidor & Bancário',
    keywords: [
      'consumidor',
      'banco',
      'fraude',
      'golpe-pix',
      'negativacao',
      'serasa',
      'spc',
      'plano-de-saude',
      'liminar',
      'juros',
      'voo',
    ],
    eyebrow: 'Consumidor & Bancário • Tutelas de Urgência em 24h a 48h',
    headline: 'Liminares Contra Planos de Saúde, Fraudes Bancárias e Negativação Indevida',
    subheadline:
      'Pedidos liminares urgentes no TJDFT para autorizar tratamentos médicos, bloquear cobranças fraudulentas, anular juros abusivos e limpar seu nome com indenização por danos morais.',
    authorityStatement:
      'Resposta jurídica imediata para situações críticas envolvendo bancos, operadoras de saúde e companhias aéreas no Distrito Federal.',
    painPoints: [
      'Negativa abusiva de cirurgia, exame de alto custo ou medicamento essencial pelo plano de saúde',
      'Vítima de golpe bancário, empréstimo consignado não autorizado ou invasão de conta via Pix',
      'Nome inscrito indevidamente no Serasa/SPC por dívida já paga ou contrato jamais assinado',
      'Cancelamento de voo ou cobrança bancária abusiva gerando prejuízo financeiro imediato',
    ],
    ctaLabel: 'Buscar Medida Urgente Agora',
    whatsappPrefill:
      'Olá, Dr. Henrique Valença! Estou enfrentando um problema urgente com banco/plano de saúde/negativação indevida no DF e preciso de atendimento.',
    displayOrder: 5,
  },
];

const SEED_CASES: CreateSuccessCaseDTO[] = [
  // organico (3 cases)
  {
    personaSlug: 'organico',
    title: 'Liminar para Bloqueio de Cobrança Contratual Abusiva e Revisão de Cláusulas',
    situation:
      'Empresário do Gama sofreu execução indevida de multa rescisória de 30% em contrato comercial de prestação de serviços com cláusula leonina.',
    outcome:
      'Tutela de urgência deferida para suspender a exigibilidade do título, reduzindo o débito em 74% em acordo homologado judicialmente.',
    metricBadge: 'Redução de 74% no passivo',
    timeframe: '18 dias até a liminar',
    courtRef: 'TJDFT — 2ª Vara Cível do Gama',
  },
  {
    personaSlug: 'organico',
    title: 'Anulação de Protesto Empresarial e Indenização por Danos Morais',
    situation:
      'Prestador de serviços de Brasília teve o CNPJ protestado por duplicata quitada, bloqueando linha de crédito para folha de pagamento.',
    outcome:
      'Baixa imediata do protesto em 48 horas e condenação da instituição emissora ao pagamento de R$ 18.000,00 por danos morais.',
    metricBadge: 'R$ 18 mil + baixa em 48h',
    timeframe: '4 meses até sentença',
    courtRef: 'TJDFT — 5ª Vara Cível de Brasília',
  },
  {
    personaSlug: 'organico',
    title: 'Reconhecimento de Verbas Trabalhistas e Restituição de Descontos Indevidos',
    situation:
      'Gestor comercial atuante no DF foi dispensado sem receber comissões acumuladas e com descontos unilaterais em termo rescisório.',
    outcome:
      'Sentença procedente condenando a empresa ao pagamento integral das diferenças salariais, reflexos e multa do art. 477 da CLT.',
    metricBadge: 'R$ 86 mil recuperados',
    timeframe: '7 meses até acordo final',
    courtRef: 'TRT-10 — Vara do Trabalho do Gama',
  },

  // imobiliario (3 cases)
  {
    personaSlug: 'imobiliario',
    title: 'Suspensão de Leilão Extrajudicial de Imóvel Residencial em Águas Claras',
    situation:
      'Família foi notificada de leilão marcado em 72 horas por falhas na intimação pessoal exigida pela Lei nº 9.514/1997.',
    outcome:
      'Liminar deferida às vésperas da hasta pública suspendendo o leilão e abrindo margem para purgação da mora com recálculo justo.',
    metricBadge: 'Imóvel de R$ 780 mil salvo',
    timeframe: '36 horas até a liminar',
    courtRef: 'TJDFT — Vara Cível de Águas Claras',
  },
  {
    personaSlug: 'imobiliario',
    title: 'Usucapião Extraordinária de Lote Residencial no Setor Oeste do Gama',
    situation:
      'Morador exercia posse mansa e pacífica há 16 anos por contrato de gaveta, sem conseguir transferir o imóvel no cartório de registro.',
    outcome:
      'Sentença declaratória de propriedade com expedição de mandado direto ao Cartório do 5º Ofício de Registro de Imóveis do DF.',
    metricBadge: 'Matrícula regularizada',
    timeframe: '11 meses',
    courtRef: 'TJDFT — 1ª Vara Cível do Gama',
  },
  {
    personaSlug: 'imobiliario',
    title: 'Distrato por Atraso de Obra com Devolução de 100% dos Valores Pagos',
    situation:
      'Comprador enfrentou atraso superior a 14 meses além do prazo de tolerância na entrega de unidade na planta em Taguatinga.',
    outcome:
      'Rescisão contratual por culpa exclusiva da construtora, com restituição integral corrigida pelo INPC e pagamento de lucros cessantes.',
    metricBadge: '100% restituído + aluguéis',
    timeframe: '8 meses',
    courtRef: 'TJDFT — 4ª Turma Cível',
  },

  // familia (3 cases)
  {
    personaSlug: 'familia',
    title: 'Divórcio com Partilha Equilibrada de Bens e Proteção de Cotas Empresariais',
    situation:
      'Empresário enfrentava risco de bloqueio operacional da empresa familiar durante divórcio litigioso de alta complexidade patrimonial.',
    outcome:
      'Composição estratégica preservando o controle societário com compensação justa de haveres e partilha imobiliária homologada.',
    metricBadge: 'Empresa 100% preservada',
    timeframe: '5 meses',
    courtRef: 'TJDFT — 1ª Vara de Família do Gama',
  },
  {
    personaSlug: 'familia',
    title: 'Fixação de Pensão Alimentícia com Desconto Direto em Folha e Retroativos',
    situation:
      'Genitor omitia rendimentos reais e mantinha pagamentos irregulares abaixo das necessidades escolares e médicas de dois filhos menores.',
    outcome:
      'Quebra de sigilo fiscal deferida e fixação definitiva em 30% dos rendimentos líquidos com ofício imediato ao órgão pagador.',
    metricBadge: 'Pensão majorada em 140%',
    timeframe: '45 dias até tutela',
    courtRef: 'TJDFT — 2ª Vara de Família de Taguatinga',
  },
  {
    personaSlug: 'familia',
    title: 'Inventário Extrajudicial Destravado com Economia Tributária de ITCMD',
    situation:
      'Quatro herdeiros estavam paralisados há 3 anos por divergência sobre avaliação de dois imóveis no DF e incidência de multa estadual.',
    outcome:
      'Mediação estruturada entre os sucessores, retificação de guias junto à SEFAZ/DF e lavratura de escritura pública de partilha.',
    metricBadge: 'Partilha concluída em 60 dias',
    timeframe: '2 meses',
    courtRef: 'TJDFT / Cartório Extrajudicial do DF',
  },

  // trabalhista (3 cases)
  {
    personaSlug: 'trabalhista',
    title: 'Reversão de Justa Causa e Liberação de Seguro-Desemprego e FGTS',
    situation:
      'Supervisora de loja no Gama foi demitida por suposta falta grave sem sindicância prévia nem provas documentais consistentes.',
    outcome:
      'Justa causa anulada pelo juízo com conversão em dispensa imotivada, alvará para saque do FGTS, multa de 40% e dano moral.',
    metricBadge: 'R$ 54 mil + ficha limpa',
    timeframe: '6 meses',
    courtRef: 'TRT-10 — Vara do Trabalho do Gama',
  },
  {
    personaSlug: 'trabalhista',
    title: 'Horas Extras e Descaracterização de Cargo de Confiança Bancário',
    situation:
      'Analista de agência em Brasília cumpria jornada de 9h diárias sem poderes de gestão, enquadrado irregularmente no art. 224, §2º da CLT.',
    outcome:
      'Reconhecimento da 7ª e 8ª horas como extraordinárias com reflexos em férias, 13º, DSR e FGTS ao longo de cinco anos.',
    metricBadge: 'R$ 192 mil em condenação',
    timeframe: '10 meses',
    courtRef: 'TRT-10 — 10ª Vara do Trabalho de Brasília',
  },
  {
    personaSlug: 'trabalhista',
    title: 'Rescisão Indireta por Atraso Contínuo de Salários e Não Depósito de FGTS',
    situation:
      'Técnico de manutenção acumulava 8 meses sem depósitos fundiários e atrasos salariais recorrentes sem poder pedir demissão para não perder direitos.',
    outcome:
      'Declaração de falta grave do empregador com pagamento integral das verbas rescisórias equivalentes à demissão sem justa causa.',
    metricBadge: '100% das verbas garantidas',
    timeframe: '5 meses',
    courtRef: 'TRT-10 — 2ª Turma',
  },

  // previdenciario (3 cases)
  {
    personaSlug: 'previdenciario',
    title: 'Concessão de Aposentadoria Especial por Exposição a Agentes Nocivos',
    situation:
      'Profissional da área hospitalar no DF teve PPP desconsiderado pelo INSS na via administrativa, faltando 4 anos pela regra comum.',
    outcome:
      'Reconhecimento judicial da atividade especial em todo o período controvertido, com implantação do benefício integral e atrasados desde a DER.',
    metricBadge: 'R$ 78 mil em atrasados',
    timeframe: '9 meses',
    courtRef: 'TRF-1 — Juizado Especial Federal da SJDF',
  },
  {
    personaSlug: 'previdenciario',
    title: 'Restabelecimento Liminar de Auxílio por Incapacidade Temporária (INSS)',
    situation:
      'Motorista submetido a cirurgia ortopédica teve alta programada pelo INSS apesar de laudos atestando incapacidade laboral plena.',
    outcome:
      'Tutela de urgência concedida após perícia judicial neutra determinando o restabelecimento imediato do benefício com correção monetária.',
    metricBadge: 'Benefício reativado em 25 dias',
    timeframe: '25 dias até tutela',
    courtRef: 'TRF-1 — 24ª Vara Federal / JEF-DF',
  },
  {
    personaSlug: 'previdenciario',
    title: 'Concessão de BPC/LOAS para Idoso em Situação de Vulnerabilidade no Gama',
    situation:
      'Requerimento negado pelo INSS sob alegação genérica de renda familiar per capita superior a 1/4 do salário mínimo, ignorando gastos médicos.',
    outcome:
      'Aplicação da tese vinculante de dedução de despesas com saúde e concessão integral do benefício assistencial com retroativos.',
    metricBadge: 'Renda vitalícia + R$ 24 mil',
    timeframe: '6 meses',
    courtRef: 'TRF-1 — 1ª Turma Recursal do DF',
  },

  // consumidor (3 cases)
  {
    personaSlug: 'consumidor',
    title: 'Liminar em 24h Obrigando Plano de Saúde a Custear Cirurgia de Urgência',
    situation:
      'Paciente no DF teve procedimento de alta complexidade e prótese negados sob alegação de carência contratual abusiva.',
    outcome:
      'Decisão liminar expedida em menos de 24 horas determinando o custeio integral sob pena de multa diária de R$ 2.000,00 e dano moral.',
    metricBadge: 'Cirurgia autorizada em 24h',
    timeframe: '1 dia até a liminar',
    courtRef: 'TJDFT — Plantão Judiciário / Vara Cível',
  },
  {
    personaSlug: 'consumidor',
    title: 'Restituição em Dobro por Fraude Bancária e Transferências Pix Não Autorizadas',
    situation:
      'Cliente teve aplicativo bancário invadido fora do padrão de consumo e R$ 29.500,00 desviados via Pix em 12 minutos sem bloqueio antifraude.',
    outcome:
      'Reconhecimento de falha na segurança bancária (Súmula 479 do STJ), devolução integral corrigida e indenização de R$ 10.000,00.',
    metricBadge: 'R$ 39,5 mil recuperados',
    timeframe: '5 meses',
    courtRef: 'TJDFT — 1ª Turma Recursal dos Juizados',
  },
  {
    personaSlug: 'consumidor',
    title: 'Exclusão Imediata de Negativação Indevida no Serasa e Dano Moral',
    situation:
      'Consumidora teve o CPF negativado por operadora de telefonia referente a linha cancelada com protocolo registrado meses antes.',
    outcome:
      'Retirada liminar do apontamento em 48 horas, declaração de inexistência do débito e condenação em R$ 12.000,00 por dano moral puro.',
    metricBadge: 'Nome limpo + R$ 12 mil',
    timeframe: '3 meses',
    courtRef: 'TJDFT — 1º Juizado Especial Cível do Gama',
  },
];

export function runSeed(): SeedExecutionSummary {
  const db = getDatabase();
  const firmRepo = new FirmProfileRepository(db);
  const personaRepo = new LeadPersonaRepository(db);
  const caseRepo = new SuccessCaseRepository(db);

  let firmProfileInserted = false;
  let personasInserted = 0;
  let casesInserted = 0;

  db.exec('BEGIN IMMEDIATE TRANSACTION;');
  try {
    firmProfileInserted = firmRepo.insertIfAbsent(DEFAULT_FIRM_PROFILE);

    for (const persona of SEED_PERSONAS) {
      if (personaRepo.insertIfAbsent(persona)) {
        personasInserted += 1;
      }
    }

    for (const successCase of SEED_CASES) {
      if (caseRepo.insertIfAbsent(successCase)) {
        casesInserted += 1;
      }
    }

    db.exec('COMMIT;');
  } catch (error) {
    db.exec('ROLLBACK;');
    throw error;
  }

  return {
    firmProfileInserted,
    personasInserted,
    casesInserted,
    totalPersonas: personaRepo.countAll(),
    totalCases: caseRepo.countAll(),
  };
}

function isExecutedDirectly(): boolean {
  const entryArg = process.argv[1];
  if (!entryArg) return false;
  try {
    const resolvedEntry = fs.realpathSync(path.resolve(entryArg));
    const resolvedSelf = fs.realpathSync(fileURLToPath(import.meta.url));
    return resolvedEntry === resolvedSelf;
  } catch {
    return path.resolve(entryArg) === path.resolve(fileURLToPath(import.meta.url));
  }
}

if (isExecutedDirectly()) {
  const summary = runSeed();
  console.log('[seed] Advocacia Auto-Seller (Valença & Associados) seed concluído:', summary);
}
