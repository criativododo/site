# HANDOFF — Portal DODÔ → Codex, fase Backoffice Administrativo

**Data:** 2026-07-26
**De:** Claude (Tech Lead de execução desta sessão, atingindo limite de contexto)
**Para:** próximo agente (Codex) que vai continuar o Backoffice Administrativo
**Commit no momento deste handoff:** `16447c0` (mais este documento, ver §10)

> **ATUALIZAÇÃO 2026-07-27 — fase concluída.** Todo o roadmap descrito abaixo (§5/§6) foi
> implementado: `AdminParceiras.tsx`, CRUD administrativo de Entrega (incluindo Aprovação,
> item não previsto originalmente aqui) e Briefing, CRUD completo de Obrigação Financeira com
> o gate de elegibilidade, e Dashboard administrativo. O "~10% concluído" da §1 abaixo e o
> checklist da §6 estão desatualizados — **não usar este documento para avaliar o que falta
> fazer.** Estado atual, dívidas técnicas reais e próximos passos:
> `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md`. Mantido aqui só como
> registro histórico do racional de design de cada decisão tomada nesta unidade (§5, §8).

Este documento existe para que você (Codex) consiga continuar o trabalho
**sem reler dezenas de arquivos**. Leia-o inteiro antes de tocar em código.
Ele é mais detalhado que o handoff anterior (`2026-07-26_backoffice-parceira.md`,
na mesma pasta) — este aqui é o definitivo; o anterior pode ser consultado
como histórico, mas não precisa ser lido de novo.

---

## 1. Estado atual do projeto

### Percentual aproximado de conclusão

- **Portal da Parceira** (o produto original, EPIC 0 a 5 + LGPD): **~95%
  concluído**. Só faltam itens explicitamente bloqueados por decisão de
  negócio ou infraestrutura (ver §8).
- **Backoffice Administrativo** (fase nova, aberta nesta sessão): **~10%
  concluído**. Só o módulo Parceira tem backend pronto; nada de frontend do
  Backoffice existe ainda além da tela de moderação/LGPD que já existia
  antes desta fase.
- **Projeto como um todo (Portal + Backoffice):** estimativa **~55-60%**
  do escopo total que o responsável do projeto definiu ao abrir a fase
  Backoffice (cadastrar/editar Parceiras, criar/editar Briefings, criar
  Entregas, acompanhar status, criar Obrigações Financeiras, acompanhar
  pagamentos, dashboards administrativos, "alimentar completamente os
  dados consumidos pelo Portal").

### Módulos concluídos (Portal da Parceira)

| Módulo | O que faz | Onde |
|---|---|---|
| Identidade/Acesso | Login Google OIDC, sessão, moderação PENDING→ACTIVE/REJECTED | `modules/identidade/` |
| Conteúdo (Pendências) | Parceira vê Entregas do mês, lê briefing, envia material | `modules/conteudo/` + `modules/briefing/` (leitura) |
| Financeiro | Parceira vê previsto x pago, histórico por período | `modules/financeiro/` (leitura) |
| Perfil | Parceira vê/edita PIX, e-mail, endereço (CEP) | `modules/perfil/` |
| LGPD | Exportação de dados, solicitação/decisão de exclusão de conta | `modules/lgpd/` |

### Módulos em andamento (Backoffice)

| Módulo | Estado |
|---|---|
| Parceira | **Backend completo** (types/repository/service/routes, testado). **Frontend inexistente.** |

### Módulos pendentes (Backoffice)

| Módulo | O que falta |
|---|---|
| Briefing (escrita) | Só existe leitura (`buscarBloco`). Sem `criar`/`atualizar`, sem rota admin, sem cálculo de `dataAprovacaoInterna`. |
| Entrega (escrita administrativa) | Só existe `atualizar` (usado internamente pelo upload da Parceira). Sem `criar` administrativo, sem rota admin. |
| Obrigação Financeira (escrita) | Só existe leitura/soma. Sem lançamento, sem transições de estado, sem gate de elegibilidade (Q-04). |
| Dashboard administrativo | Não iniciado. |
| Frontend do Backoffice inteiro | Não iniciado, exceto a página de moderação (`Admin.tsx`, já existente antes desta fase). |

---

## 2. Arquitetura

### Stack

- **Backend:** Node.js + TypeScript, Express 5, `openid-client` (OIDC),
  `multer` (upload), `vitest` (testes), `express-rate-limit`, `helmet`.
  ESM puro (`"type": "module"` no `package.json`, imports sempre com `.js`
  no final mesmo apontando para `.ts` — é assim que o TS/Node ESM funciona
  aqui, não é erro).
- **Frontend:** React 19 + Vite + TypeScript + `react-router-dom` v7.
  **Sem biblioteca de UI** (nem Material, nem Tailwind) — todo estilo é
  inline (`style={{ ... }}`) usando variáveis CSS do Design System DODÔ
  (ver §4). Lint via `oxlint`.
- **Persistência:** **nenhuma.** Tudo em memória (`*RepositorioEmMemoria`).
  Isso é uma decisão deliberada e documentada, não um bug — ver §8.

### Estrutura do backend (`portal-backend/src/`)

```
app.ts                  # monta middlewares globais + rotas + handler 404/erro
server.ts               # app.listen
config/env.ts           # variáveis de ambiente validadas, isProduction, seeds de dev
middleware/
  session.ts            # cookie HMAC-SHA256 assinado, 6h deslizante
  requireAuth.ts         # requireAuth, requireContaAtiva, requireAdmin
  isolamento.ts          # bloquearParceiraIdDeCliente, parceiraDaSessao
  auditoria.ts           # trilha de auditoria em memória (append-only)
modules/
  identidade/            # OIDC, sessão, moderação de contas PENDING
  parceira/              # NOVO — agregado Parceira (esta sessão)
  conteudo/               # Entrega (leitura Portal + upload) + storage
  briefing/               # BlocoBriefing (só leitura)
  financeiro/             # ObrigacaoFinanceira (só leitura/soma)
  perfil/                 # PerfilParceira + resolução de CEP
  lgpd/                   # exportação de dados + exclusão de conta
routes/api.routes.ts      # monta tudo sob /api, aplica cadeia de middlewares global
types/express.d.ts         # augmenta Request com req.sessao
```

Cada módulo de domínio segue **sempre** o mesmo padrão em 3 camadas:

```
*.types.ts        → interfaces/tipos puros, sem lógica
*.repository.ts   → classe *RepositorioEmMemoria, persistência pura (CRUD sobre array)
*.service.ts      → regras de negócio, validações, transições de estado
*.routes.ts       → Router do Express, tradução HTTP fina, zero lógica de negócio
*.test.ts         → testes do service (e às vezes do repository) via vitest
```

**Nunca pule uma camada.** Uma rota nunca deve importar um repository
diretamente — sempre passa pelo service. Um service nunca deve montar
resposta HTTP (status code, JSON shape de erro) — isso é responsabilidade
da rota, que traduz o resultado do service (geralmente um union type
`{ok:true,...}|{ok:false,motivo:"X"}`) em status HTTP.

### Estrutura do frontend (`portal-frontend/src/`)

```
main.tsx                    # ReactDOM.render, envolve com SessionProvider
App.tsx                     # <Routes> — define todas as rotas da SPA
lib/
  api.ts                    # apiFetch<T>() — wrapper único de fetch, sempre credentials:"include"
  session.tsx               # SessionProvider + useSession() — estado de sessão global
components/
  PortalLayout.tsx           # header + nav + <Outlet/> — layout de toda página autenticada
  RotaProtegida.tsx          # guarda rotas que exigem sessão ativa
pages/
  Login.tsx
  Pendencias.tsx             # Parceira
  Financeiro.tsx             # Parceira
  Perfil.tsx                 # Parceira
  Admin.tsx                  # Administrador — moderação de contas + fila LGPD
                              # (AdminParceiras.tsx ainda não existe — é a próxima tela, §4)
styles/tokens.css            # Design System DODÔ (variáveis CSS)
assets/brand/                # logos SVG
```

### Fluxo completo de autenticação

1. Frontend chama `useSession().login()` → `window.location.href =
   "{API_BASE_URL}/auth/google/login"` (redirect de página inteira, não
   fetch — o fluxo OIDC precisa disso).
2. Backend (`auth.routes.ts::GET /google/login`): gera PKCE
   (`codeVerifier`/`codeChallenge`), `state`, guarda ambos num cookie
   httpOnly de 5 minutos (`dodo_portal_oidc_handshake`), redireciona para o
   Google.
3. Google autentica o usuário e redireciona para
   `GOOGLE_REDIRECT_URI` (= `/auth/google/callback`).
4. Backend (`GET /google/callback`): lê o cookie de handshake, troca o
   código por tokens (`authorizationCodeGrant`), valida claims
   (`sub`/`email` obrigatórios, fail-closed se ausentes), chama
   `resolverOuCriarIdentidade`:
   - `sub` já existe → atualiza `ultimoAcesso`, mantém tudo o mais.
   - `sub` novo, e-mail em `ADMIN_BOOTSTRAP_EMAILS` → nasce
     `ACTIVE`/`ADMINISTRADOR`.
   - `sub` novo, e-mail == `PARCEIRA_SEED_EMAIL` (dev/QA, **travado em
     produção no código**, não só por convenção) → nasce `ACTIVE`/
     `INFLUENCIADORA` já vinculado a `PARCEIRA_SEED_ID`.
   - Caso contrário → nasce `PENDING`/`INFLUENCIADORA`, sem `parceiraId`.
5. Backend assina o cookie de sessão (`iniciarSessao`) e redireciona para
   `{FRONTEND_URL}/pendencias`.
6. Frontend (`SessionProvider`, no mount) chama `GET /auth/me` — se 401,
   `sessao = null` (mostra Login); se 200, guarda `sessao` no contexto.
7. Toda chamada subsequente de API passa por `requireAuth` (lê o cookie,
   **renova a expiração deslizante a cada request válido** — RN-18, 6h) →
   `requireContaAtiva` (exige `estadoConta === "ACTIVE"`, 403 senão) →
   `bloquearParceiraIdDeCliente` (400 se o corpo/query/params tentar
   mandar `parceiraId`/`parceira_id`/`influKey`/`INFLU_KEY`) →
   `registrarAuditoria` (log em memória, nunca PII).
8. Logout: `POST /auth/logout` limpa o cookie de sessão.

### Fluxo administrativo

- **Autorização:** `req.sessao.papelAtor === "ADMINISTRADOR"`, verificado
  por `requireAdmin` (`middleware/requireAuth.ts`). Todas as rotas
  administrativas passam por `requireAuth` + `requireContaAtiva` (globais em
  `api.routes.ts`) **e depois** por `requireAdmin` (aplicado no próprio
  router do módulo administrativo ou na montagem em `api.routes.ts`).
- **Como alguém vira Administrador:** só via `ADMIN_BOOTSTRAP_EMAILS` no
  `.env` do backend (lista de e-mails separados por vírgula) — mecanismo de
  provisionamento manual, não um fluxo de produto. Não existe (e não deve
  existir sem ADR) uma tela para "promover" um usuário a Administrador pela
  UI.
- **Rotas administrativas hoje:**
  - `GET /api/admin/identidades/pendentes`,
    `PATCH /api/admin/identidades/:subProvider/aprovar|rejeitar` —
    moderação de contas `PENDING` (Feature 5.3, já implementada, tela em
    `Admin.tsx`).
  - `GET /api/admin/lgpd/exclusao/pendentes`,
    `PATCH /api/admin/lgpd/exclusao/:id/decidir` — fila de exclusão LGPD
    (já implementada, tela também em `Admin.tsx`, componente
    `FilaDeExclusao`).
  - `GET/POST /api/admin/parceiras`,
    `PATCH /api/admin/parceiras/:id`,
    `PATCH /api/admin/parceiras/:id/status` — **módulo novo desta sessão,
    sem tela ainda** (é a próxima entrega, §4).

### Principais padrões utilizados

1. **Camadas Repository → Service → Routes**, sempre, sem exceção (ver
   acima). Não introduzir `Generic*` (proibido por `CLAUDE.md`).
2. **Union types de resultado** em operações que podem falhar:
   `type Resultado = {ok:true; valor:X} | {ok:false; motivo:"RAZAO_A"|"RAZAO_B"}`.
   A rota faz `if (!resultado.ok) { switch/if em resultado.motivo → status
   HTTP }`. Ver qualquer `*.service.ts` existente para o padrão exato.
3. **Não confiar em estado vindo do cliente.** Nunca aceitar `parceiraId`,
   `status`, ou qualquer campo de controle de fluxo diretamente do corpo da
   requisição sem passar pela regra de negócio do service. Exemplo:
   `cadastrarParceira` ignora qualquer `status` que venha no payload e
   força `"INATIVA"` sempre (RN-01).
4. **Padrão de não-revelação (PC-02/RN-01):** quando um recurso não existe
   OU existe mas pertence a outra Parceira, a resposta é **idêntica** (404
   genérico) — nunca revelar qual dos dois casos ocorreu. Isso é para rotas
   que uma Parceira acessa sobre si mesma; **não se aplica** a rotas
   administrativas (o Administrador pode/deve ver tudo).
5. **Repository sempre com array em memória + construtor que aceita seed
   opcional** — permite testes com fixtures isoladas sem depender do
   singleton exportado. Padrão:
   ```
   export class XRepositorioEmMemoria {
     constructor(itens: X[] = seedInicial()) { ... }
   }
   export const xRepositorio = new XRepositorioEmMemoria();
   ```
6. **`randomUUID()` (`node:crypto`) para gerar IDs**, nunca contador
   incremental nem string manual.
7. **Testes cobrem Service (regra de negócio) e Repository (persistência),
   nunca Routes via HTTP** — a suíte não usa `supertest`. Validação de
   contrato HTTP até agora foi manual (curl com cookie assinado à mão).

### Convenções do projeto

- Nomes de variáveis, funções, comentários e mensagens de erro **em
  português** (o domínio é em português — Contrato Soberano). Nomes de
  arquivos, tipos TypeScript e imports seguem convenção técnica normal.
- Comentários só explicam o **porquê**, nunca o **o quê** (código já
  autoexplicativo por nomes). Ver qualquer arquivo existente como
  referência de tom/densidade de comentário.
- `CLAUDE.md` na raiz do repositório é a fonte de regras de processo
  (fluxo obrigatório, o que não fazer, convenções permanentes). Leia-o —
  é curto e é a autoridade máxima de processo neste repositório.
- SPECs (`knowledge/Produto/SPEC-NNN-*.md`) são a fonte de verdade de
  domínio/regra de negócio. `CONTRATO_SOBERANO.md`
  (`knowledge/Historico/CONTRATO_SOBERANO.md`) define a linguagem ubíqua —
  nunca inventar termo novo para conceito já nomeado lá.

---

## 3. Backoffice — módulo Parceira (implementado nesta sessão)

Localização: `portal-backend/src/modules/parceira/`.

### `parceira.types.ts`

```typescript
export type StatusParceira = "ATIVA" | "INATIVA";

export interface CondicaoComercial {
  valorMensal: number;
  entregaveisReel: number;
  entregaveisCarrossel: number;
  entregaveisStories: number;
  prazoUsoImagemDias: number;
}

export interface Parceira {
  id: string;
  chave: string;      // ChaveInfluenciadora/cupom (SPEC-002 §6.2) — identidade de negócio
  nome: string;
  email: string;
  cnpj: string;
  pix: string;
  status: StatusParceira;
  condicaoComercial: CondicaoComercial;
  dataCriacao: string; // ISO 8601
}
```

Note que **não há `endereco`** neste tipo — endereço continua vivendo em
`PerfilParceira` (`modules/perfil/perfil.types.ts`). Isso é uma decisão
consciente e explicitamente deixada em aberto (ver §8, "Decisões já
tomadas" e §5 item 5).

### `parceira.repository.ts`

`ParceiraRepositorioEmMemoria` — array em memória, sem seed inicial
(diferente de outros repositories que têm `seedInicial()` ligado a
`env.parceiraSeed`; Parceira nasce sempre vazia, populada só via
`POST /admin/parceiras`).

Métodos: `listarTodas()`, `buscarPorId(id)`, `criar(parceira)`,
`atualizar(parceiraAtualizada)` (lança erro se o `id` não existir —
comportamento interno, nunca deve ser chamado por um `id` inválido porque o
service sempre verifica existência antes).

### `parceira.service.ts`

- `cadastrarParceira(dados: DadosCadastroParceira): Promise<Parceira>` —
  gera `id` (`randomUUID()`), força `status: "INATIVA"` sempre (RN-01,
  SPEC-001/SPEC-002), grava `dataCriacao`.
- `listarParceiras()`, `buscarParceira(id)` — leitura pura.
- `editarParceira(id, campos: Partial<CamposEditaveisParceira>):
  Promise<{ok:true;parceira}|{ok:false;motivo:"NAO_ENCONTRADA"}>` — edição
  parcial de `nome/email/cnpj/pix/condicaoComercial` (UC-002.02).
- `alterarStatusParceira(id, status): Promise<mesmo union type>` —
  UC-002.01. **Nunca exclui o registro** (RN-11/INV-02) — só troca o campo
  `status`.

### `parceira.routes.ts`

Router puro, sem `requireAdmin` dentro dele (o `requireAdmin` é aplicado na
montagem, ver abaixo) — isso é intencional para manter o router
reutilizável/testável isoladamente, mas **nunca montar este router em
lugar nenhum sem `requireAdmin` na frente**.

```
GET    /                → listarParceiras()               → 200 {itens: Parceira[]}
POST   /                → cadastrarParceira(body)          → 201 Parceira (400 se faltar chave/nome/email/condicaoComercial)
PATCH  /:id             → editarParceira(id, body)         → 200 Parceira | 404
PATCH  /:id/status      → alterarStatusParceira(id, body.status) → 200 Parceira | 400 (status inválido) | 404
```

### Autenticação/autorização desta rota

Montagem em `routes/api.routes.ts`:
```typescript
apiRoutes.use("/admin/parceiras", requireAdmin, parceiraRoutes);
```
Como `apiRoutes` já tem `requireAuth, requireContaAtiva,
bloquearParceiraIdDeCliente, registrarAuditoria` globais (linha
`apiRoutes.use(...)` no topo do arquivo), a cadeia completa para
`/api/admin/parceiras/*` é:
`requireAuth → requireContaAtiva → bloquearParceiraIdDeCliente →
registrarAuditoria → requireAdmin → parceiraRoutes`.

### Integrações

**Nenhuma ainda.** O módulo Parceira hoje é uma ilha — nada em
`conteudo`, `briefing`, `financeiro` ou `perfil` consulta o repository de
Parceira para validar se um `parceiraId` existe de fato. Isso é uma
lacuna conhecida (ver §8) que a próxima fase deve considerar: por exemplo,
ao criar uma Entrega administrativa (§5), fazer o service validar que o
`parceiraId` informado corresponde a uma Parceira `ATIVA` existente, em vez
de aceitar qualquer string.

### Teste (`parceira.service.test.ts`)

3 blocos `describe`, 3 `it` — cobrem: nascimento sempre `INATIVA`
independente do que for pedido; edição bem-sucedida + `NAO_ENCONTRADA`;
alternância de status preservando o `id` e o restante do registro.

---

## 4. Frontend que falta — `AdminParceiras.tsx`

Esta é a próxima entrega. Abaixo está a implementação completa, não
pseudocódigo — pode ser transcrita quase literalmente.

### Onde criar

`portal-frontend/src/pages/AdminParceiras.tsx`

### Rotas (editar `App.tsx`)

Adicionar, dentro do bloco protegido por `<RotaProtegida><PortalLayout
/></RotaProtegida>` (mesmo bloco de `/pendencias`, `/financeiro`, `/perfil`,
`/admin`):

```typescript
<Route path="/admin/parceiras" element={<AdminParceirasPage />} />
```
com o import correspondente no topo do arquivo:
```typescript
import { AdminParceirasPage } from "./pages/AdminParceiras";
```

### Nav (editar `components/PortalLayout.tsx`)

Hoje a nav condicional para admin é:
```typescript
const itensNav = sessao?.papelAtor === "ADMINISTRADOR"
  ? [...navItems, { to: "/admin", label: "Moderação" }]
  : navItems;
```
Adicionar um segundo item:
```typescript
const itensNav = sessao?.papelAtor === "ADMINISTRADOR"
  ? [...navItems, { to: "/admin", label: "Moderação" }, { to: "/admin/parceiras", label: "Parceiras" }]
  : navItems;
```

### Estrutura do componente

Siga **exatamente** o padrão já usado em `pages/Admin.tsx` (early return de
"Área restrita" se `sessao?.papelAtor !== "ADMINISTRADOR"`, `useState` +
`useEffect` + função `carregar()` recarregável, tratamento de erro via
`ApiError`). Não introduzir `react-hook-form`, `zod` ou qualquer lib nova —
o projeto não usa nenhuma biblioteca de formulário; validação é manual e
mínima (checar campos obrigatórios antes de enviar).

**Tipos locais** (espelham `Parceira`/`CondicaoComercial` do backend —
o frontend não importa tipos do backend, cada lado define os seus, mesmo
padrão de `Financeiro.tsx`/`Perfil.tsx`):

```typescript
interface CondicaoComercial {
  valorMensal: number;
  entregaveisReel: number;
  entregaveisCarrossel: number;
  entregaveisStories: number;
  prazoUsoImagemDias: number;
}

interface Parceira {
  id: string;
  chave: string;
  nome: string;
  email: string;
  cnpj: string;
  pix: string;
  status: "ATIVA" | "INATIVA";
  condicaoComercial: CondicaoComercial;
  dataCriacao: string;
}
```

**Estados (hooks) necessários:**

- `parceiras: Parceira[] | null` — lista carregada.
- `erro: string | null`, `carregando: boolean` — mesmo padrão de toda
  página existente.
- `emAcao: string | null` — id da Parceira com uma ação em voo (desabilita
  botão daquela linha, mesmo padrão de `Admin.tsx`).
- Estado do formulário de cadastro (pode ser um único objeto
  `novaParceira` com `useState<DadosFormulario>` ou campos individuais —
  qualquer uma das duas abordagens já usadas no projeto é aceitável;
  `Perfil.tsx::EditarContato` usa campos individuais, prefira essa forma
  por consistência).
- Estado do formulário de edição: **abrir inline na própria linha da
  lista** (mesmo padrão de "editar em contexto" que `Perfil.tsx` usa para
  contato/endereço, mas aqui aplicado por linha da tabela/lista) — guardar
  `editandoId: string | null` e os campos do formulário de edição em
  estado separado, populados a partir da Parceira selecionada quando
  `editandoId` muda.

**Chamadas de API (via `apiFetch`, `lib/api.ts` — nunca `fetch` direto):**

```typescript
// Listar
const dados = await apiFetch<{ itens: Parceira[] }>("/api/admin/parceiras");

// Cadastrar
const nova = await apiFetch<Parceira>("/api/admin/parceiras", {
  method: "POST",
  body: JSON.stringify({ chave, nome, email, cnpj, pix, condicaoComercial }),
});

// Editar
const atualizada = await apiFetch<Parceira>(`/api/admin/parceiras/${id}`, {
  method: "PATCH",
  body: JSON.stringify(camposEditados),
});

// Alterar status
const comNovoStatus = await apiFetch<Parceira>(`/api/admin/parceiras/${id}/status`, {
  method: "PATCH",
  body: JSON.stringify({ status: novoStatus }),
});
```

Tratar erro sempre como:
```typescript
catch (erroCapturado) {
  setErro(erroCapturado instanceof ApiError ? erroCapturado.message : "Falha ao <ação>.");
}
```

**Formulário de cadastro — campos e validação mínima:**

| Campo | Tipo de input | Obrigatório | Validação antes de enviar |
|---|---|---|---|
| `chave` | text | sim | não vazio |
| `nome` | text | sim | não vazio |
| `email` | email | sim | não vazio (validação de formato fica a cargo do `type="email"` do navegador, como em `Perfil.tsx`) |
| `cnpj` | text | não | — |
| `pix` | text | não | — |
| `condicaoComercial.valorMensal` | number | sim | não vazio, numérico |
| `condicaoComercial.entregaveisReel` | number | sim | numérico ≥ 0 |
| `condicaoComercial.entregaveisCarrossel` | number | sim | numérico ≥ 0 |
| `condicaoComercial.entregaveisStories` | number | sim | numérico ≥ 0 |
| `condicaoComercial.prazoUsoImagemDias` | number | sim | numérico ≥ 0 |

Botão "Cadastrar" desabilitado enquanto `salvando` (mesmo padrão de
`disabled={salvando}` em todo formulário existente). Após sucesso, limpar o
formulário e recarregar a lista (`carregar()`).

**Lista de Parceiras — o que exibir por linha:**

Nome, chave, e-mail, status (com destaque visual — mesma cor
`var(--color-cherry)` usada para estados negativos/de atenção em outras
telas, ou um badge simples), valor mensal formatado, e dois botões:
"Editar" (abre formulário inline) e "Ativar"/"Inativar" (toggle de
status, texto muda conforme `status` atual).

**UX esperada:**

- Estado de carregamento: `{carregando && <p>Carregando...</p>}` (padrão
  idêntico a todas as páginas existentes — não inventar spinner).
- Lista vazia: mensagem "Nenhuma Parceira cadastrada." (mesmo tom de
  `Admin.tsx`: "Nenhum cadastro aguardando aprovação.").
- Erro: `<p style={{ color: "var(--color-cherry)" }}>{erro}</p>`.
- Sem paginação, sem busca/filtro nesta primeira versão — SPEC-001 §3
  marca "mecanismos de busca, ordenação, paginação" como decisão
  arquitetural pendente; não inventar isso agora, só listar tudo (a base
  tende a ser pequena no estágio atual do produto).
- Sem modal — tudo inline na própria página, mesmo padrão do resto do
  projeto (nenhuma tela do Portal usa modal/dialog).

### Design System DODÔ (tokens a reutilizar, não inventar novos)

De `styles/tokens.css` e do uso consistente em todas as páginas:

- `className="title-editorial"` para títulos (`<h1>`/`<h2>`).
- `className="btn-primary"` para o botão de ação primária (Cadastrar,
  Salvar, Ativar).
- `var(--color-cherry)` para texto de erro/estado negativo e para botões
  secundários com borda (ex.: "Inativar", "Rejeitar" em `Admin.tsx`).
- `var(--font-display)` para nomes/títulos em destaque dentro de listas
  (ex.: `<strong style={{ fontFamily: "var(--font-display)" }}>`).
- Inputs: `height: 40, borderRadius: 8, border: "1px solid rgba(27, 23,
  23, 0.2)", padding: "0 12px", fontSize: 14, fontWeight: 400` (copiar
  exatamente o estilo de qualquer `<input>` em `Perfil.tsx`).
- Espaçamento entre campos de formulário: `gap: 12`, `maxWidth: 360`
  (padrão de `EditarContato`/`EditarEndereco` em `Perfil.tsx`).
- Cards/linhas de lista: `padding: "16px 20px", border: "1px solid
  rgba(27, 23, 23, 0.1)", borderRadius: 12` (padrão de `Admin.tsx`).

**Não criar novo arquivo CSS nem novas variáveis de tema.** Tudo que este
componente precisa já existe em `tokens.css` e nos exemplos acima.

### Validação funcional esperada antes de considerar pronto

1. `npm run dev` nos dois projetos.
2. Logar como Administrador (e-mail em `ADMIN_BOOTSTRAP_EMAILS`).
3. Ver o link "Parceiras" na nav.
4. Cadastrar uma Parceira → ver ela aparecer na lista com status
   "INATIVA".
5. Editar nome/valor → ver refletido na lista.
6. Clicar "Ativar" → status muda para "ATIVA" na lista, sem reload de
   página.
7. `npm run lint` e `npm run build` do frontend limpos.

---

## 5. Roadmap (ordem exata)

1. **`AdminParceiras.tsx`** (frontend) — detalhado por completo em §4.
   Entrega o primeiro resultado visível do Backoffice.
2. **Escrita administrativa de Entrega** (backend): adicionar
   `criar(entrega)` em `entrega.repository.ts`; adicionar
   `criarEntregaAdministrativa(dados)` em `conteudo.service.ts` (ou um
   `entrega.admin.service.ts` separado, se preferir isolar leitura-Portal
   de escrita-Backoffice — ambas as abordagens são aceitáveis, mas escolha
   uma e documente no commit); nova rota
   `POST /api/admin/entregas` (parceiraId, mesReferencia, formato,
   dataEntrega — nasce sempre `AGUARDANDO_MATERIAL`, nunca aceitar `estado`
   do payload); montar em `api.routes.ts` atrás de `requireAdmin`.
3. **Escrita administrativa de Briefing** (backend): adicionar
   `criar`/`atualizar` em `briefing.repository.ts` (identidade = tripla
   `parceiraId+mesReferencia+formato`, **sem `id` próprio** — não inventar
   um `id` novo, seguir a modelagem existente); implementar a calculadora
   de `dataAprovacaoInterna` (SPEC-009 RN-01: `dataPostagem − 7 dias`; se o
   resultado cair numa sexta-feira, ajustar +3 dias (vai para segunda); se
   cair num sábado, +2; se cair num domingo, +1) como função pura testável
   isoladamente (ex.: `briefing/calculadoraAprovacao.ts`), com testes
   cobrindo os 4 casos de borda de dia da semana explicitados na própria
   SPEC; nova rota `POST/PATCH /api/admin/briefings`.
4. **Frontend de Entrega + Briefing administrativo**: tela para o
   Administrador criar Entregas e preencher/editar o Briefing por
   formato — pode ser uma nova página (`AdminEntregas.tsx` ou
   `AdminColaboracao.tsx`) ou uma seção dentro de uma futura tela por
   Parceira (ex.: clicar numa Parceira na lista de `AdminParceiras.tsx` e
   ver suas Entregas/Briefing do mês). Decisão de UX em aberto — qualquer
   uma é aceitável, mas prefira a segunda opção (drill-down a partir da
   Parceira) porque reduz a necessidade de repetir seletor de Parceira em
   telas separadas.
5. **Escrita administrativa de Obrigação Financeira** (backend):
   `criar(obrigacao)` no repository; service com:
   - lançamento manual (mensal ou avulso, RN-04 SPEC-020) — nasce sempre
     `EM_ABERTO`;
   - transição `EM_ABERTO → APROVADO` ("liberar"), aplicando o **gate de
     elegibilidade já decidido pelo PO (Q-04, opção B, SPEC-020 §9)**:
     para Obrigação **Mensal** (tem `mesReferencia`), só libera se **todas**
     as Entregas da Parceira naquela competência estiverem em `APROVADO`
     ou `PUBLICADO` (nenhuma em `AGUARDANDO_MATERIAL`/`EM_REVISAO`); se não
     houver nenhuma Entrega na competência, é elegível vacuamente (nada
     pendente). Obrigação **Avulsa** não passa por esse gate — liberação
     manual direta. Recusa deve usar um motivo identificável (ex.:
     `"CONTEUDO_NAO_APROVADO"`, equivalente ao código PG-05 da SPEC).
   - transição `APROVADO → PAGO` ("marcar pago") — arquiva, é terminal
     (recusar se já `PAGO`).
   Nova rota `POST /api/admin/financeiro` (lançar) +
   `PATCH /api/admin/financeiro/:id/liberar` +
   `PATCH /api/admin/financeiro/:id/marcar-pago`.
6. **Frontend de Obrigação Financeira administrativa**: tela/seção para
   lançar, liberar e marcar pago — mesma lógica de drill-down por Parceira
   sugerida no item 4, ou tela própria.
7. **Dashboard administrativo** (backend + frontend): uma rota de
   agregação (ex. `GET /api/admin/dashboard`) que devolve: total de
   Parceiras Ativas/Inativas; contagem de Entregas por estado na
   competência corrente; total previsto x pago no mês corrente. Tela
   simples com esses números (sem biblioteca de gráficos — texto/números
   grandes é suficiente para esta primeira versão, mesmo estilo visual do
   resto do Portal).
8. **Integração cruzada** (revisão, não feature nova): garantir que
   `criar` de Entrega/Briefing/Obrigação valide que o `parceiraId`
   informado corresponde a uma Parceira existente (e, se fizer sentido,
   `ATIVA`) consultando `parceira.repository.ts` — fechando a lacuna
   apontada em §3 ("Integrações: nenhuma ainda").

---

## 6. Checklist

- [ ] `AdminParceiras.tsx` criado e navegável (item 1 do roadmap)
- [ ] Rota `/admin/parceiras` em `App.tsx`
- [ ] Nav item "Parceiras" em `PortalLayout.tsx`
- [ ] Cadastro de Parceira funcional (form → lista atualizada)
- [ ] Edição de Parceira funcional
- [ ] Alternância de status (Ativar/Inativar) funcional
- [ ] `npm run lint` e `npm run build` do frontend limpos após a tela
- [ ] `entrega.repository.ts::criar` implementado
- [ ] Rota `POST /api/admin/entregas` implementada e testada
- [ ] `briefing.repository.ts::criar`/`atualizar` implementados
- [ ] Calculadora de `dataAprovacaoInterna` implementada com testes dos 4
      casos de borda (dia útil, sexta, sábado, domingo)
- [ ] Rota `POST/PATCH /api/admin/briefings` implementada e testada
- [ ] Frontend de Entrega/Briefing administrativo (tela ou seção)
- [ ] `obrigacao.repository.ts::criar` implementado
- [ ] Lançamento manual de Obrigação (mensal e avulso) implementado
- [ ] Transição `EM_ABERTO → APROVADO` com gate de elegibilidade Q-04
      implementada e testada (inclusive caso "sem Entregas → elegível")
- [ ] Transição `APROVADO → PAGO` implementada e testada (recusa se já
      `PAGO`)
- [ ] Frontend de Obrigação Financeira administrativa
- [ ] Rota de agregação para dashboard implementada
- [ ] Tela de dashboard administrativo implementada
- [ ] Validação cruzada de `parceiraId` nos módulos de escrita (item 8)
- [ ] Backend: `npm run typecheck` limpo em todas as entregas
- [ ] Backend: `npm test` verde (crescente a cada feature) em todas as
      entregas
- [ ] Backend: `npm run build` limpo em todas as entregas
- [ ] Frontend: `npm run lint` limpo em todas as entregas
- [ ] Frontend: `npm run build` limpo em todas as entregas
- [ ] Um commit por feature concluída (nunca acumular múltiplas features
      não relacionadas num commit só)

---

## 7. Critérios de aceite

**`AdminParceiras.tsx`:** concluído quando um Administrador logado
consegue, sem erro no console e sem reload manual da página: (1) ver a
lista de Parceiras cadastradas; (2) cadastrar uma nova e vê-la aparecer
como `INATIVA`; (3) editar seus dados e ver a mudança refletida; (4)
alternar seu status e ver o novo status refletido. `lint`/`build` do
frontend limpos.

**Escrita administrativa de Entrega:** concluído quando existe uma rota
que cria uma Entrega com `parceiraId`/`mesReferencia`/`formato`/
`dataEntrega` informados pelo Administrador, sempre nascendo
`AGUARDANDO_MATERIAL` (mesmo que o payload tente enviar outro estado), e
essa Entrega aparece corretamente na tela de Pendências da Parceira
correspondente ao logar como ela. Testes cobrindo a criação e a
imutabilidade do estado inicial.

**Escrita administrativa de Briefing:** concluído quando existe uma rota
que cria/atualiza um bloco de Briefing por
`(parceiraId, mesReferencia, formato)`, calculando `dataAprovacaoInterna`
automaticamente (nunca aceita esse campo do payload), e o resultado é
visível na tela "Ler briefing do item" já existente do Portal da Parceira.
Testes cobrindo os 4 casos de borda de dia da semana da SPEC-009 RN-01.

**Frontend de Entrega/Briefing administrativo:** concluído quando o
Administrador consegue criar uma Entrega e preencher seu Briefing sem usar
`curl`/Postman — só pela UI — e o resultado aparece corretamente no Portal
da Parceira.

**Escrita administrativa de Obrigação Financeira:** concluído quando
existem rotas para lançar (mensal/avulso), liberar (com o gate Q-04
aplicado corretamente — testar explicitamente o caso de recusa por
conteúdo não aprovado e o caso de sucesso vacuamente elegível sem
Entregas) e marcar como pago (recusando se já `PAGO`). Testes cobrindo
todas as transições e a regra de gate.

**Frontend de Obrigação Financeira administrativa:** concluído quando o
Administrador consegue lançar, liberar e marcar como pago sem `curl` —
e o resultado aparece corretamente no Financeiro do Portal da Parceira.

**Dashboard administrativo:** concluído quando a tela mostra números
corretos e atualizados (não hardcoded) de Parceiras Ativas/Inativas,
Entregas por estado na competência corrente, e previsto x pago do mês
corrente, batendo com o que as telas individuais já mostram.

**Critério transversal para qualquer item acima:** `npm run typecheck`,
`npm test` e `npm run build` do backend limpos; `npm run lint` e
`npm run build` do frontend limpos; um commit dedicado à feature.

---

## 8. Riscos conhecidos

### Decisões arquiteturais já tomadas (não reabrir sem novo ADR)

1. **Nenhuma tecnologia de persistência foi escolhida.** Tudo em memória.
   Reiniciar o processo do backend apaga todas as Parceiras, Entregas,
   Briefings, Obrigações cadastradas. Isso é esperado no estágio atual —
   não é uma regressão a "corrigir", é uma decisão pendente de ADR de
   stack de dados + credenciais reais de banco (fora do alcance de um
   agente sem acesso a infraestrutura real).
2. **`Endereco` vive em `PerfilParceira`, não em `Parceira`.** SPEC-001
   trata endereço como parte do cadastro administrativo (RF-003), o que
   sugeriria que deveria estar em `Parceira`. Ficou deliberadamente fora do
   agregado `Parceira` nesta sessão para não duplicar responsabilidade sem
   decisão explícita. **Se o próximo agente decidir migrar**, documentar a
   decisão no commit e atualizar `perfil.service.ts` para ler de
   `Parceira` em vez de manter endereço duplicado.
3. **Sem validação de unicidade de `chave`/e-mail/CNPJ** em Parceira —
   SPEC-001 §7 lista isso como decisão arquitetural pendente. Cadastro
   duplicado é aceito silenciosamente hoje.
4. **Sem endpoint de exclusão de Parceira** — SPEC-002 RN-11/INV-02 são
   explícitos: inativar nunca apaga o registro. Não criar rota de DELETE
   sem novo ADR.
5. **A fronteira "Parceira/SPEC-002 é fora do escopo do Portal"** (que
   existia em `PORTAL_ARQUITETURA.md` §3 antes desta sessão) **foi
   revogada explicitamente pelo responsável do projeto** ao abrir a fase
   Backoffice. Não tratar a existência do módulo Parceira como uma
   invasão de escopo — é a decisão vigente.
6. **Nenhuma rota administrativa nova tem teste de contrato HTTP** (mesma
   lacuna do resto do backend) — só o service tem teste unitário via
   vitest. Validação de rota é manual (curl + cookie assinado à mão) ou,
   agora, via UI real no navegador.
7. **Nenhuma integração cruzada entre módulos ainda** (Entrega/Briefing/
   Obrigação não validam se o `parceiraId` referenciado existe de fato no
   repository de Parceira) — ver roadmap item 8.

### Riscos de segurança/robustez já corrigidos nesta sessão (não reabrir)

Rate limiting em `/auth` e `/api`, `helmet()`, handler JSON de 404/erro,
`trust proxy` para funcionar atrás de nginx, trava de
`PARCEIRA_SEED_*` em produção (força vazio via `env.isProduction`,
independente do `.env`), filtro de tipo (imagem/vídeo) no upload de
material. Todos com commit próprio entre `5445bf2` e `9327422` — não
revisitar isso a menos que um teste real quebre.

### Riscos ainda abertos (fora do alcance desta fase, apenas ciência)

- Sem CI/CD (nenhum workflow em `.github/workflows`).
- Sem logger estruturado (só `console.log`/`console.error`).
- Sem auditoria/acessibilidade formal (Lighthouse/axe) rodada.
- Sem teste de rota via HTTP (`supertest` ou equivalente) em nenhum
  módulo, novo ou antigo.

---

## 9. Contexto do projeto

- **Domínio:** Projeto DODÔ, plataforma "Influencia" da marca Criativo
  Dodô (nomes técnicos legados: "Projeto TEAR", "Estúdio Elã" — não usar
  em código novo, só aparecem em arquivos históricos).
- **O que o sistema faz:** gestão de marketing de influência entre uma
  marca e parceiras (influenciadoras) — cadastro, aprovação, briefings,
  entrega/upload de materiais, aprovação de materiais, pagamentos,
  histórico. Ciclo mensal ("Colaboração Mensal", ainda não implementado
  como módulo formal — hoje representado só pelo campo `mesReferencia`
  espalhado nos modelos existentes).
- **Dois "produtos" dentro do mesmo backend/frontend:**
  1. **Portal da Parceira** — o que a influenciadora vê ao logar (rotas
     `/pendencias`, `/financeiro`, `/perfil`) — **praticamente pronto**.
  2. **Backoffice Administrativo** — o que a equipe interna usa para
     alimentar tudo o que o Portal exibe (rotas `/admin/*`) — **em
     construção, esta é a fase atual**.
- **Onde procurar regra de negócio antes de implementar algo novo:**
  `knowledge/Produto/SPEC-NNN-*.md` (já lidos nesta sessão: SPEC-001,
  SPEC-002, SPEC-009, SPEC-012, SPEC-020 — todo o conteúdo relevante para
  o roadmap acima já está resumido em §5; só releia o arquivo original se
  precisar de um detalhe que não está aqui). `CONTRATO_SOBERANO.md` para
  vocabulário. `CLAUDE.md` (raiz) para processo/regras de execução.
- **Onde NÃO procurar:** `docs/_workspace/auditorias/` e
  `docs/_workspace/releases/` contêm 4 arquivos gerados automaticamente
  por um comando de shell numa sessão anterior a esta (dumps brutos de
  `git status`/`find`, incluindo listagem de `node_modules`) — são ruído,
  não documentação revisada.
- **Comandos para subir o projeto:**
  ```bash
  cd portal-backend && npm install && npm run typecheck && npm test && npm run build && npm run dev   # porta 4000
  cd portal-frontend && npm install && npm run lint && npm run build && npm run dev                    # porta 5173
  ```
  `.env` do backend precisa de `SESSION_SECRET`, `GOOGLE_CLIENT_ID/SECRET/
  REDIRECT_URI` (login real via Google), `ADMIN_BOOTSTRAP_EMAILS`
  (obrigatório para testar qualquer rota `/admin/*` — sem isso, nenhuma
  conta vira Administrador). `PARCEIRA_SEED_EMAIL`/`PARCEIRA_SEED_ID` são
  opcionais e não têm relação com o módulo Parceira do Backoffice.
- **Para testar rotas `/admin/*` sem OAuth Google real:** assinar
  manualmente um cookie de sessão HMAC-SHA256 com `papelAtor:
  "ADMINISTRADOR"`, `estadoConta: "ACTIVE"`, usando o mesmo algoritmo de
  `portal-backend/src/middleware/session.ts` e o `SESSION_SECRET` do
  `.env` — técnica já usada em sessões anteriores para validar rotas sem
  depender de credenciais OAuth reais.
- **Estado do git no momento deste handoff:** branch `main`, HEAD em
  `16447c0` antes deste commit. Working tree tinha, além deste documento,
  arquivos não relacionados a esta fase já presentes antes da sessão
  (`.claude/`, `.mcp.json`, `knowledge/.DS_Store` modificado) — não são
  responsabilidade desta fase, não mexer neles a menos que seja pedido
  explicitamente.
- **Autorização de operação:** o `CLAUDE.md` da raiz contém um "Mandato de
  operação autônoma" (2026-07-16) que autoriza decidir e continuar sem
  confirmação pontual a cada etapa, e autoriza `git push`/deploy sem
  confirmação a cada unidade concluída — mas só para quando não houver
  regra de negócio inédita, necessidade de credencial que o agente não
  possui, impossibilidade técnica objetiva, ou conflito insolúvel de
  requisitos. Nenhum item do roadmap acima esbarra nessas condições —
  todos são implementáveis sem nova decisão de negócio.
