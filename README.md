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

## 4. Hierarquia de Alta Conversão & `PredictiveIntentEngine` ("Estilo TikTok")

- **Primeira Dobra de Autoridade (`App.tsx`):**
  - **Badge de Detecção em Tempo Real** acima da Headline principal (`● Contexto identificado: Direito Imobiliário — Distrato & Atraso de Obra`), comunicando imediatamente que a página compreendeu a demanda sem formulário.
  - **Precedentes na Primeira Dobra (`SuccessCasesSection`):** a seção *"Precedentes & Resultados Documentados — Já resolvemos um caso idêntico ao seu"* foi posicionada imediatamente abaixo da Hero Section, antes do Diagnóstico Jurídico e dos Núcleos de Atuação.
  - **Coerência 100% por Contexto (Zero Mistura):** cada especialidade ativa exibe exclusivamente **3 casos reais distintos daquela mesma área**, 3 pontos de Diagnóstico Jurídico coerentes, Headline dinâmica e link de WhatsApp pré-preenchido específico. Clicar em qualquer núcleo ou cenário rola suavemente para o topo mostrando a nova versão personalizada.
- **Serviço Dedicado `PredictiveIntentEngine` (`frontend/src/lib/predictiveIntentEngine.ts`):**
  1. **Sinais de Entrada:** captura automaticamente `document.referrer`, parâmetros de URL (`utm_term`, `utm_campaign`, `utm_source`, `q`, `tema`, `area`), período/horário de acesso e histórico persistente de visitas anteriores (`document.cookie` + `localStorage` + `IndexedDB`).
  2. **Rastreamento Comportamental Passivo:** monitora paradas de scroll e tempo de leitura por bloco (`[data-intent-area]` + `IntersectionObserver`), hover prolongado (`>= 550ms`) em núcleos jurídicos e **seleção de texto na página** (`mouseup`/`touchend`), aplicando score ponderado com decaimento temporal até atingir o limiar de confiança e adaptar a página silenciosamente.

---

## 5. Motor White-Label & Pílula Flutuante de Demonstração (`Simular Sinal de Busca ▾`)

- **Motor White-Label (`frontend/src/components/WhiteLabelModal.tsx`):** modal discreto no cabeçalho para editar ao vivo nome do advogado(a), OAB, escritório, WhatsApp, cidade, especialidade principal, anos de atuação e foto do titular (Data URL ou monograma).
- **Pílula Flutuante no Canto Inferior Esquerdo (`frontend/src/components/LeadOriginSimulator.tsx`):** botão discreto **`Simular Sinal de Busca ▾`** com cenários reais de Google e Instagram (*"Busca Google: Construtora atrasou entrega"*, *"Busca Google: Fui demitido como PJ"*, *"Instagram: Partilha de bens no divórcio"*, *"Busca Google: INSS negou aposentadoria"* e *"Busca Google: Nome negativado indevidamente"*). Ao clicar, injeta o sinal no `PredictiveIntentEngine`, atualiza a URL via `history.replaceState`, reescreve a página ao vivo e rola suavemente para o topo.

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
