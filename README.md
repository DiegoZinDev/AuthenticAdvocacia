# AuthenticAdvocacia — Advocacia Auto-Seller

Landing Page Inteligente para escritórios de advocacia de alta performance no Distrito Federal (Gama & Brasília/DF), com **adaptação contextual silenciosa em 3 camadas**, **motor White-Label ao vivo**, **simulador de origem do lead** e **resiliência offline com IndexedDB**.

---

## 1. Visão Geral & Proposta Comercial

O **AuthenticAdvocacia (`advocacia-autoseller`)** transforma a visita do cliente potencial em uma experiência jurídica sob medida — sem formulários invasivos e em conformidade com o **Provimento nº 205/2021 do Conselho Federal da OAB**.

- **Adaptação Narrativa Automática**: manchetes cinéticas, dores jurídicas, casos reais resolvidos, credenciais de jurisdição e link pré-preenchido de WhatsApp se ajustam silenciosamente à especialidade buscada pelo lead.
- **Pronto para Demonstração em Campo (White-Label)**: permite personalizar ao vivo advogado titular, escritório, OAB, WhatsApp, cidade/seccional, área principal, anos de atuação e foto/monograma durante uma reunião comercial, persistindo tanto no SQLite quanto em cache local.
- **Deploy Unificado**: o servidor Express em produção serve a API REST em `/api/*` e o bundle estático do frontend (`frontend/dist`) na porta `3002`.

---

## 2. Arquitetura em Camadas (Spring / Clean Architecture no Backend)

O backend em `backend/src/` aplica separação estrita de responsabilidades inspirada em **Spring / Clean Architecture**, com injeção manual de dependências em `backend/src/app.ts`:

```text
backend/src/
├── controllers/      # Recepção HTTP, delegação ao Service e status codes
│   ├── HealthController.ts
│   ├── FirmProfileController.ts
│   ├── LeadPersonaController.ts
│   └── VisitorSessionController.ts
├── services/         # Regras de negócio, normalização, validação via DTOs e AppError
│   ├── FirmProfileService.ts
│   ├── LeadPersonaService.ts
│   ├── VisitorSessionService.ts
│   └── AppError.ts
├── repositories/     # Única camada com SQL preparado sobre node:sqlite
│   ├── FirmProfileRepository.ts
│   ├── LeadPersonaRepository.ts
│   ├── SuccessCaseRepository.ts
│   └── VisitorSessionRepository.ts
├── entities/         # Tipagem das tabelas relacionais
│   ├── FirmProfile.ts
│   ├── LeadPersona.ts
│   ├── SuccessCase.ts
│   └── VisitorSession.ts
├── dtos/             # Contratos de entrada/saída, mapeadores e validadores
│   ├── FirmProfileDto.ts
│   ├── LeadPersonaDto.ts
│   └── VisitorSessionDto.ts
├── db/               # Conexão DatabaseSync, migrações WAL/FK e seed idempotente
│   ├── database.ts
│   └── seed.ts
└── routes/
    └── apiRoutes.ts  # Roteamento REST sob /api
```

> **Regra arquitetural garantida:** `controllers/` e `services/` contêm **zero SQL bruto** — toda consulta preparada (`SELECT`, `INSERT`, `UPDATE`, `DELETE`) reside exclusivamente em `repositories/`.

---

## 3. Banco `node:sqlite` & Seeds TJDFT / TRT-10 / TRF-1

O banco utiliza o módulo nativo **`node:sqlite` (`DatabaseSync`)** com `PRAGMA journal_mode = WAL` e `PRAGMA foreign_keys = ON`, persistido em `backend/data/advocacia.sqlite` (ou no caminho definido por `ADVOCACIA_DB_PATH`).

### Tabelas (`backend/src/db/database.ts`)

| Tabela | Descrição | Detalhes |
| :--- | :--- | :--- |
| `firm_profile` | Perfil White-Label do escritório | Singleton (`id = 1`), armazena titular, escritório, OAB, WhatsApp, foto em Data URL, cidade e métricas. |
| `lead_personas` | Personas jurídicas e copy contextual | 6 registros ordenados por `display_order`, com `keywords_json` e `pain_points_json`. |
| `success_cases` | Casos reais por especialidade | Chave estrangeira `persona_slug` (`ON DELETE CASCADE`), `metric_badge`, `timeframe` e `court_ref`. |
| `visitor_sessions` | Telemetria de sessão e pontuação | `session_id` (PK), `inferred_persona`, UTMs, `referrer` e `behavior_scores_json`. |

### Seeds Idempotentes (`backend/src/db/seed.ts`)

- **Escritório padrão:** `Dr. Henrique Valença` — *Valença & Associados — Advocacia Estratégica* (`OAB/DF 48.210`, `Gama & Brasília — DF`).
- **6 Personas jurídicas:** `organico`, `imobiliario`, `familia`, `trabalhista`, `previdenciario`, `consumidor`.
- **18 Casos reais (3 por persona):** julgados e tutelas contextualizados no **TJDFT**, **TRT-10** e **TRF-1**.

---

## 4. Neural Context Fusion Engine V2 (25+ Sinais Cruzados em 5 Camadas)

Implementado em `frontend/src/lib/predictiveIntentEngine.ts`, o motor calcula em tempo real uma matriz ponderada de probabilidade sem exigir nenhum formulário e sincroniza a barra de endereço real do navegador via `window.history.replaceState` (`?utm_source=...&utm_medium=...&utm_campaign=...&utm_term=...&ctx_score=...`, removendo hashes soltos como `#autoridade`):

- **Camada A — Inferência Indireta & Semântica (Cross-Intent Deduction):** cruza pistas periféricas sem depender apenas de termos jurídicos óbvios (*"dor nas pernas / coluna / laudo"* + *"55+ / 57 anos / contribuição"* → **Previdenciário / Incapacidade**; *"construtora / chaves / parcela reajustada / multa"* → **Distrato Imobiliário**; *"pix bloqueado / conta invadida / nome sujo"* → **Consumidor & Bancário**; *"02h / madrugada / delegacia / blitz"* → **Urgência Criminal 24h**; *"demissão grávida / PJ com horário fixo"* → **Trabalhista**; *"plano negou cirurgia / home care"* → **Direito Médico**; *"sócio / duplicata / contrato social"* → **Empresarial**).
- **Camada B — Contexto Temporal & Ambiental:** horário exato (*Madrugada / Plantão 24h*, *Expediente Comercial*, *Plantão Noturno*, *Fim de Semana*), fuso horário e urgência implícita.
- **Camada C — Telemetria de Dispositivo & Rede:** tipo de aparelho (*iOS Mobile*, *Android Mobile*, *Desktop Corporativo*), velocidade de conexão (`navigator.connection`), nível de bateria (`navigator.getBattery` — bateria crítica + horário noturno elevam o score de urgência) e idioma.
- **Camada D — Micro-Comportamento na Página (TikTok Dwell Engine):** velocidade de rolagem (`px/s`), detecção de **releitura/hesitação de scroll-up**, tempo de permanência (`dwellMs`), seleção e cópia de trechos jurídicos (`mouseup`, `copy`) e hover prolongado (`>= 550ms`).
- **Camada E — Memória Persistente Cross-Session:** preserva o vetor acumulado de interesses entre visitas via `document.cookie` + `localStorage` + `IndexedDB`.

### Acervo Jurídico Expandido (8 Núcleos × 3 Precedentes = 24 Casos Reais do DF/Gama)
1. **Direito Imobiliário** (Atraso de obra, distrato 100%, regularização de escritura no DF)
2. **Família & Sucessões** (Divórcio litigioso/societário, inventário extrajudicial, pensão)
3. **Direito Trabalhista** (Pejotização PJ, horas extras/periculosidade, rescisão indireta)
4. **Previdenciário & INSS** (Aposentadoria por incapacidade/especial, revisão CNIS, auxílio)
5. **Direito do Consumidor & Bancário** (Golpe do Pix, negativação indevida, descontos RMC)
6. **Direito Médico & Planos de Saúde** (Liminar 24h cirurgia/prótese, Home Care, oncológico)
7. **Direito Empresarial & Contratos** (Blindagem societária, execução B2B, revisão de franquia)
8. **Urgência Criminal & Plantão 24h** (Audiência de custódia, Habeas Corpus liminar, flagrante)

---

## 5. Motor White-Label & Painel Simulador com Telemetria Neural (`Simular Sinal de Busca ▾`)

- **Motor White-Label (`frontend/src/components/WhiteLabelModal.tsx`):** edita ao vivo nome do titular, OAB, escritório, WhatsApp, cidade, especialidade principal (8 áreas) e foto do advogado.
- **Hero Split Editorial Assimétrico (`frontend/src/App.tsx`, `frontend/src/index.css`):** layout editorial assimétrico com foto nítida (~38% à esquerda sobre `#090D16`) em degradê horizontal suave para o papel editorial `#F7F5F0` à direita, sem texto sobre o rosto, topo nítido no mobile e reativo ao upload White-Label (`profile.photoUrl || '/lawyer-portrait.png'`), preservando headline, CTAs e card de credencial 100% livres sobre a área clara e persistência em SQLite (`PUT /api/profile`) e IndexedDB/localStorage.
- **Pílula Flutuante no Canto Inferior Esquerdo (`frontend/src/components/LeadOriginSimulator.tsx`):**
  - **Aba 1 — Inferência Indireta (Pistas Cruzadas):** cenários demonstrativos como *"Pesquisou dor nas pernas + 57 anos + horário comercial → Previdenciário (96%)"*, *"Acesso 02h via Celular + Bateria 14% → Plantão 24h (98%)"* e *"Leu 2x cláusula de multa + Desktop corporativo → Distrato Imobiliário (93%)"*.
  - **Aba 2 — Buscas Diretas (8 Áreas):** alternância instantânea entre todas as 8 especialidades jurídicas com rolagem suave para o topo e sincronização real da URL.
  - **Mini-Telemetria Neural ao Vivo & Preview de Triagem WhatsApp:** exibe dentro do próprio modal Dispositivo/Rede, Bateria, Horário, Dwell/Releituras/Velocidade, Vetor Semântico, Score de Confiança e a pré-visualização ao vivo do dossiê de triagem silenciosa enviado ao WhatsApp.

### Upgrade "Gênio da Lâmpada" (Experiência Editorial & Triagem Silenciosa)
- **Acordeão Horizontal de Precedentes (`SuccessCasesSection.tsx`):** cards expansíveis no hover (desktop) e toque (mobile) que revelam a alavanca estratégica da decisão e um CTA editorial direto abrindo o WhatsApp já citando o precedente expandido.
- **Triagem Silenciosa no WhatsApp (`buildWhatsAppTriageDossier` + `LeadOriginSimulator.tsx`):** todos os CTAs montam automaticamente um dossiê estruturado com área/dor detectada, precedente analisado, nível de urgência e score de confiança, com preview ao vivo no simulador.
- **Faixa Dinâmica de Súmulas & Prazos Críticos (`LEGAL_ALERT_BY_PERSONA`):** alerta editorial dinâmico abaixo dos 3 precedentes atualizando Súmula 543 STJ, Prazo Bienal CLT, Lei 14.454/Plantão TJDFT, EC 103/2019 INSS e demais fundamentos críticos das 8 áreas.
- **Painel Editorial de Métricas & Jurisdição (`AuthorityPainSection.tsx`):** substitui a foto repetida na 3ª dobra por um painel com tribunais (`TJDFT • TRT-10 • TRF-1 • STJ`), KPIs de atuação/tempo médio de liminar e selo de *Atendimento Direto pelo Titular*.

---

## 6. Resiliência Offline com IndexedDB

Implementada em `frontend/src/lib/offlineStore.ts` com o banco IndexedDB `adv_autoseller_offline_v1` (object stores `profile`, `personas`, `cases`, `telemetry_queue`) e espelhamento em `localStorage`:

- Todas as chamadas à API usam `AbortController` com timeouts curtos (`1,4s` a `2,0s`).
- Se o backend estiver indisponível ou lento, a leitura/edição do perfil White-Label, o carregamento dos casos por persona e a sessão do visitante continuam operando de forma transparente sobre IndexedDB, `localStorage` e `frontend/src/data/seeds.ts`.

---

## 7. Como Executar & Endpoints da API

### Pré-requisitos
- **Node.js 22+** (requerido pelo módulo nativo `node:sqlite`)
- **npm**

### Scripts na raiz (`package.json`)

```bash
# 1. Instalar dependências do backend e frontend
npm run install:all

# 2. Executar seed idempotente no SQLite (opcional; também roda no startup da API)
npm run seed

# 3. Desenvolvimento (em terminais separados)
npm run dev:backend     # API em http://localhost:3002
npm run dev:frontend    # Vite em http://localhost:5174 (proxy /api -> 3002)

# 4. Build de produção e execução unificada
npm run build           # Compila backend/dist e frontend/dist
npm run start           # Inicia servidor único em http://localhost:3002
```

### Endpoints da API (`/api`)

| Método | Rota | Descrição |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Status da aplicação e driver `node:sqlite`. |
| `GET` | `/api/profile` | Retorna o perfil White-Label do escritório. |
| `PUT` | `/api/profile` | Atualiza e persiste o perfil White-Label (aceita aliases de campos do frontend). |
| `GET` | `/api/personas` | Lista as 6 personas jurídicas com seus respectivos casos de sucesso. |
| `GET` | `/api/personas/:slug` | Detalha uma persona específica e seus casos (`geral` mapeia para `organico`). |
| `PUT` | `/api/personas/:slug` | Atualiza textos, palavras-chave ou ordem de exibição de uma persona. |
| `GET` | `/api/cases?persona=:slug` | Lista os 18 casos de sucesso ou filtra por `persona`. |
| `POST` | `/api/telemetry/session` | Registra/atualiza sessão comportamental e pontuação de inferência. |
| `GET` | `/api/telemetry/session/:sessionId` | Consulta os dados persistidos de uma sessão de visitante. |

---

## 8. Governança de Documentação

Este repositório segue governança estrita contendo **exclusivamente 2 arquivos de documentação**:

1. `README.md` (este documento na raiz)
2. `docs/documentacao.docx` (documentação oficial em formato Word)

A leitura e manutenção de `docs/documentacao.docx` devem ser realizadas exclusivamente via CLI utilitária `doc_manager.py`:

```bash
python3 doc_manager.py read docs/documentacao.docx
python3 doc_manager.py update docs/documentacao.docx append_section '{"heading": "...", "level": 2, "paragraphs": ["..."]}'
```
