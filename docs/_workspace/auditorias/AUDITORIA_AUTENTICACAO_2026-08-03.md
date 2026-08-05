# Auditoria e Especificação Arquitetural — Autenticação e Identidade

**Data:** 2026-08-03
**Autor:** Agente B (Arquiteto de Autenticação e Identidade) — sessão `99d58fc4-b036-4348-9a80-23abec39d2ee`
**Escopo lido:** `portal-backend/src/modules/identidade/`, `portal-backend/src/middleware/`, `portal-backend/src/config/`, `portal-backend/src/app.ts`, `portal-backend/migrations/0001_init.sql`, `portal-backend/.env.example`, `knowledge/ARCHITECTURAL_DECISIONS.md`.
**Método:** somente leitura — nenhum arquivo de código alterado, nenhuma migration gerada, nenhuma refatoração proposta. Toda afirmação está marcada como **[CÓDIGO]** (confirmado lendo o código-fonte), **[DOC]** (confirmado em ADR/documento soberano), **[INFERÊNCIA]** (dedução razoável a partir de padrões do próprio repositório, sinalizada como tal) ou **[LACUNA]** (ausência confirmada — não presumida).

---

## 1. Estado Atual

- **[DOC]** ADR-007 (2026-07-26) decidiu Google como único Identity Provider via OIDC, Authorization Code Flow + PKCE, para o MVP do Portal. Nenhuma autenticação por e-mail/senha ou modelo legado Cupom+CNPJ foi implementada.
- **[CÓDIGO]** A decisão foi implementada: `portal-backend/src/modules/identidade/` contém o fluxo Google OIDC completo (login, callback, sessão) e um módulo de convite de cadastro pré-aprovado.
- **[DOC]** ADR-011 (2026-07-29) alterou o fluxo original de ADR-007, introduzindo o estado intermediário `AGUARDANDO_CADASTRO` e o fluxo de cadastro self-service com convite.
- **[DOC]** ADR-012 (2026-07-29) corrigiu um incidente de produção: promoção de administrador por `ADMIN_BOOTSTRAP_EMAILS` agora é reavaliada em todo login, não só na criação da identidade.
- **[DOC]** ADR-015 migrou os repositórios de identidade/convite de memória para PostgreSQL.
- **[DOC]** ADR-017 estabeleceu que o client OAuth de login (ADR-007) é deliberadamente separado do client OAuth do Google Drive (integração de armazenamento) — dois propósitos, dois clients, sem acoplamento entre renovação/escopo de um e de outro.
- **[LACUNA]** Nenhum ADR, comentário ou trecho de código no repositório trata ou prevê explicitamente suporte a um segundo Identity Provider (Apple ou outro). O vocabulário e o schema assumem Google como único provedor.

## 2. Fluxo de Autenticação

```
Usuário → Frontend → Google → Backend → Banco → Sessão → Frontend autenticado
```

| Etapa | Responsável | Local |
|---|---|---|
| Início do login | `GET /auth/google/login` | `auth.routes.ts` linhas 29-58 |
| Geração PKCE (`code_verifier`/`code_challenge` S256) | `client.randomPKCECodeVerifier()` / `client.calculatePKCECodeChallenge()` | `auth.routes.ts` linhas 32-33, 53 |
| Geração `state` | `client.randomState()` | `auth.routes.ts` linha 34 |
| Guarda de handshake (verifier/state/convite) | cookie `dodo_portal_oidc_handshake`, httpOnly, 5 min | `auth.routes.ts` linhas 41-47 |
| Redirecionamento à Google | `client.buildAuthorizationUrl` (`scope: "openid email profile"`) | `auth.routes.ts` linhas 49-55 |
| Callback | `GET /auth/google/callback` | `auth.routes.ts` linhas 60-124 |
| Troca do code por tokens + validação state/PKCE | `client.authorizationCodeGrant()` (delegado a `openid-client`) | `auth.routes.ts` linhas 81-84 |
| Leitura de claims do ID Token | `tokens.claims()` — `sub`, `email`, `email_verified`, `name` | `auth.routes.ts` linhas 86-98 |
| Resolução/criação de identidade | `identidadeService.resolverOuCriarIdentidade` | `identidade.service.ts` |
| Persistência | `identidadeRepositorio` (Postgres) | `identidade.repository.ts` → tabela `identidades` |
| Criação de sessão | `iniciarSessao` (cookie assinado HMAC-SHA256, stateless) | `middleware/session.ts` linhas 70-72 |
| Redirecionamento pós-login (por papel/estado) | `/admin/dashboard`, `/cadastro` ou `/pendencias` | `auth.routes.ts` linhas 113-119 |

Não há DTOs/validators dedicados nem controllers separados de routes neste módulo — as rotas chamam diretamente o service. Não há repository/entity/use-case separados além dos já listados.

## 3. Arquitetura de Identidade

**[CÓDIGO]** Não existem entidades chamadas `User`, `Account`, `Credential`, `Session`, `Login` ou `AuthProvider`. O vocabulário de domínio usado é:

- `Identidade` (`identidade.types.ts`) — representa o registro de acesso: `subProvider`, `emailPerfil`, `nomeCompleto`, `papelAtor` (`ADMINISTRADOR`|`INFLUENCIADORA`), `estadoConta` (5 valores, ver Seção 6), `origemAcesso`, `parceiraId?`, `dataCriacao`, `ultimoAcesso`.
- `ConviteCadastro` — token de uso único para cadastro pré-aprovado.
- `Parceira`/perfil de Parceira — entidade de negócio, fora do módulo `identidade`, referenciada por `parceiraId` sem FK declarada.

**[CÓDIGO]** Não existe uma tabela/entidade `Credential` porque não há credencial local (senha) — a "credencial" é inteiramente delegada ao Google (o `sub` do ID Token é o identificador). Não existe `Session` como entidade porque a sessão é stateless (cookie assinado, sem tabela — ver Seção 4).

**[INFERÊNCIA]** O sistema modela **identidade e autorização em um único registro** (`Identidade` já carrega `papelAtor` e `estadoConta`), sem separar "quem é" (identity) de "o que pode fazer" (authorization) em tabelas distintas. Isso é uma leitura direta do schema, não uma opinião — mas note-se como fato relevante para qualquer decisão de Account Linking futura.

## 4. Arquitetura de Sessões

**[CÓDIGO]** Implementação única em `middleware/session.ts`:

- **Armazenamento:** cookie assinado HMAC-SHA256, **stateless** — sem tabela de sessão, sem Redis, sem JWT padrão. Formato: `payload_base64url.assinatura_base64url`.
- **Assinatura:** `HMAC-SHA256(payload)` com `env.sessionSecret` (`SESSION_SECRET`, obrigatória). Verificação usa `timingSafeEqual` (proteção contra timing attack).
- **Duração:** 6 horas fixas (`DURACAO_SESSAO_MS`), **[DOC]** conforme RN-18/SPEC-025 citada em ADR-007.
- **Renovação:** deslizante, implementada em `renovarSessao`, acionada automaticamente em toda requisição autenticada via `requireAuth` middleware, e explicitamente após `submeterCadastro`.
- **Invalidação/logout:** `encerrarSessao` limpa o cookie (`res.clearCookie`). `POST /auth/logout` → 204.
- **[LACUNA]** Não há invalidação server-side: por ser stateless e autocontido, um cookie ainda não expirado e copiado antes do logout permanece tecnicamente válido se reapresentado — não há blacklist nem tabela de sessões revogáveis.
- **[LACUNA]** Múltiplos dispositivos simultâneos / listagem de sessões ativas / "remember me": nenhum campo, rota ou lógica encontrada. Duração fixa em 6h para todo login, sem variação.
- Cobertura de teste: `middleware/session.test.ts` cobre criação, adulteração de assinatura, expiração (fake timers), renovação e encerramento.

## 5. Arquitetura OIDC

**[CÓDIGO]** Biblioteca `openid-client` v6.8.4 — nenhuma implementação manual de JWKS ou verificação de assinatura; delegada inteiramente à biblioteca.

| Item | Status |
|---|---|
| Authorization endpoint | `GET /auth/google/login`, `auth.routes.ts` |
| Callback endpoint | `GET /auth/google/callback`, `auth.routes.ts` |
| Token endpoint | Chamado internamente por `client.authorizationCodeGrant()` — sem endpoint HTTP explícito no código do Portal |
| PKCE | Implementado (S256) |
| `state` | Implementado (`randomState`, validado via `expectedState`) |
| `nonce` | **[LACUNA]** Não encontrada geração/verificação explícita de `nonce` no código (Authorization Code Flow não exige nonce tanto quanto Implicit Flow, mas seu ausência explícita deve ser registrada, não presumida) |
| Issuer | Hard-coded: `GOOGLE_ISSUER = new URL("https://accounts.google.com")` (`oidc.ts`) |
| Audience | Validação delegada a `openid-client`; não há checagem manual explícita de `aud` no código do Portal |
| Scopes | `"openid email profile"` |
| Claims usadas | `sub` (obrigatório), `email` (obrigatório), `email_verified` (`=== true`), `name` (opcional, fallback para `email`) |
| Claims ignoradas | `picture`, `locale`, `given_name`, `family_name`, `hd` — nenhuma é lida |
| JWKS | Sem chamada explícita no código do Portal — assumido interno a `openid-client` |
| Validação de assinatura/ID Token | Delegada à biblioteca; comentário explícito no código atribui a ela o tratamento de "aud/iss/exp inválidos" |
| UserInfo endpoint | **[LACUNA]** Não há chamada HTTP separada a `/userinfo` — dados vêm só das claims do ID Token |

**[CÓDIGO]** Rota `/auth/dev-login` faz bypass completo do fluxo OIDC (só fora de produção, dupla checagem de `env.isProduction`), útil para QA mas relevante como superfície de risco se a checagem falhar (ver Seção 7/11).

## 6. Arquitetura do Banco

**[CÓDIGO]** `portal-backend/migrations/0001_init.sql`:

**Tabela `identidades`:**
```
sub_provider   text PRIMARY KEY
email_perfil   text NOT NULL
nome_completo  text NOT NULL
papel_ator     text NOT NULL CHECK (papel_ator IN ('ADMINISTRADOR', 'INFLUENCIADORA'))
estado_conta   text NOT NULL CHECK (estado_conta IN ('AGUARDANDO_CADASTRO','PENDING','ACTIVE','INACTIVE','REJECTED'))
origem_acesso  text NOT NULL CHECK (origem_acesso IN ('PADRAO','CONVITE_PREAPROVADO'))
parceira_id    text                 -- nullable, sem FK declarada
data_criacao   timestamptz NOT NULL
ultimo_acesso  timestamptz NOT NULL
```
Sem índice além da PK; sem índice em `email_perfil` apesar de busca por e-mail existir no repositório.

**Tabela `convites_cadastro`:**
```
token          text PRIMARY KEY
criado_por     text NOT NULL
criado_em      timestamptz NOT NULL
usado_em       timestamptz          -- nullable
usado_por_sub  text                 -- nullable, sem FK declarada
```

Verificação item a item solicitada na auditoria:

| Conceito | Resultado |
|---|---|
| `google_sub` | **[LACUNA]** nome exato não existe; equivalente funcional é `sub_provider` |
| `provider_id` | **[LACUNA]** não encontrado |
| `issuer` | **[LACUNA]** não persistido — só constante em código |
| `subject`/`sub` | equivalente é `sub_provider`; não há coluna separada `sub` |
| `session`/`session_id` | **[LACUNA]** não há tabela de sessão (stateless) |
| `refresh_token` | **[LACUNA]** não existe para sessão de usuário; existe só para OAuth do Google Drive (ADR-017, mecanismo separado) |
| `access_token` | idem — só no contexto Google Drive |
| `expires_at` | **[LACUNA]** não é coluna; existe só como campo `exp` dentro do payload do cookie de sessão |
| coluna `provider` (ex.: `"google"`) | **[LACUNA]** não existe — schema assume Google implicitamente, sem discriminador de provedor |

## 7. Segurança

| Item | Status |
|---|---|
| CSRF | **[LACUNA]** Nenhum mecanismo explícito (sem token CSRF, sem double-submit-cookie, sem `csurf`). Mitigação parcial indireta via `sameSite: "lax"` nos cookies. |
| Replay attack (authorization code) | **[CÓDIGO]** Mitigado por `state` de uso único + PKCE, validados por `openid-client`. |
| Token substitution | **[INFERÊNCIA]** Mitigado estruturalmente pela validação de `aud`/`iss` delegada à biblioteca (não auditado linha a linha internamente à lib). |
| Session fixation | **[CÓDIGO]** Sessão é sempre recriada em `iniciarSessao` após login bem-sucedido; não há reaproveitamento de cookie pré-login. |
| XSS | **[CÓDIGO]** Cookies são `httpOnly` (não acessíveis via JS), mitigando roubo de sessão via XSS. `helmet()` aplicado globalmente. |
| SameSite | **[CÓDIGO]** `"lax"` em ambos os cookies (handshake e sessão). |
| Secure cookie | **[CÓDIGO]** `secure: env.isProduction` — não forçado em desenvolvimento (esperado). |
| HttpOnly | **[CÓDIGO]** Sim, em ambos os cookies. |
| CSP | **[LACUNA]** Não identificada configuração explícita de Content-Security-Policy além do padrão de `helmet()` (não customizada para o domínio da aplicação). |
| Rate limit | **[CÓDIGO]** `express-rate-limit`: `/auth` limitado a 30 req/15min, `/api` a 600 req/15min. `trust proxy` configurado. |
| Brute force | **[DOC]** ADR-007 declara explicitamente que RN-17 (bloqueio por tentativas de credencial) **não se aplica** ao modelo OIDC — decisão consciente, não lacuna. |
| Revogação de sessão | **[LACUNA]** Sem blacklist/invalidação server-side (ver Seção 4). |
| Auditoria | **[PARCIAL]** `middleware/auditoria.ts` existe mas grava em **array em memória** (comentário no próprio código: "placeholder — nenhum armazenamento de auditoria persistente/imutável foi decidido ainda"). **[LACUNA]** não foi encontrada evidência de que este middleware está de fato montado nas rotas de `/auth` em `app.ts`/`auth.routes.ts`. **[LACUNA]** Nenhum evento de login bem-sucedido/falho é registrado em trilha de auditoria — o `catch` do callback OIDC retorna 401 sem gravar nada. Isso diverge do exigido por **ADR-010** (LGPD): "Toda operação crítica gera trilha de auditoria... Logs de auditoria não podem ser alterados pela aplicação" — a implementação atual (array em memória, mutável, não persistente) não atende a esse requisito para o módulo de autenticação. **Divergência entre documentação (ADR-010) e implementação registrada explicitamente, não corrigida nesta auditoria.**

## 8. Acoplamentos ao Google

**[CÓDIGO]** Pontos de acoplamento direto:
- `GOOGLE_ISSUER` hard-coded em `oidc.ts`.
- Rotas literais `/auth/google/login`, `/auth/google/callback`.
- Nome do cookie de handshake `dodo_portal_oidc_handshake`.
- Interface `ClaimsGoogle` em `identidade.service.ts`.
- Env vars `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, todas obrigatórias.
- Comentário de domínio em `identidade.types.ts`: "Google OIDC federado, sem senha local" — o vocabulário já assume Google como único IDP, não um IDP entre vários.
- **[LACUNA]** Não existe classe `GoogleAuthService` nem tipo `GoogleProfile` com esses nomes exatos — a responsabilidade equivalente está distribuída, sem nome próprio, entre `oidc.ts` e `auth.routes.ts`.
- **[LACUNA]** Não existe nenhuma coluna/enum `provider` na tabela `identidades` — o schema não tem sequer o discriminador necessário para distinguir de qual provedor veio um registro.

## 9. Pontos de Extensão (já genéricos)

**[CÓDIGO]** Componentes cujo nome/estrutura já não menciona Google e que, por essa razão factual, não exigiriam renomeação para acomodar um segundo provedor:
- `sub_provider`/`subProvider` — nome de campo já genérico ("provider", não "Google").
- `PapelAtor`, `EstadoConta`, `OrigemAcesso`, interface `Identidade`.
- `identidadeRepositorio` — CRUD por `subProvider`, sem lógica específica de Google nas queries.
- `SessaoAutenticada` e todo `middleware/session.ts` — nenhum campo específico de Google.
- `requireAuth`/`requireContaAtiva`/`requireAdmin` — operam só sobre `req.sessao`, agnósticos de provedor.

**[LACUNA]** Não existe nenhuma interface de abstração (`AuthProvider` ou equivalente) que já isole o contrato "provedor OIDC" do restante do sistema — os pontos acima são genéricos por **ausência de nome específico**, não por existir uma camada de abstração deliberada.

## 10. Lacunas (consolidado)

1. Nenhuma coluna/discriminador `provider` na tabela `identidades`.
2. `issuer` não é persistido em nenhum lugar (só constante em código).
3. `nonce` OIDC não é gerado/validado explicitamente no código do Portal.
4. Sem chamada explícita a UserInfo endpoint ou a JWKS — dependência implícita e não auditada internamente da biblioteca `openid-client`.
5. Sem CSRF token dedicado.
6. Sem CSP customizada.
7. Sem revogação de sessão server-side; sessão é puramente stateless/autocontida.
8. Sem suporte a múltiplos dispositivos ou "remember me".
9. Auditoria de eventos de autenticação (login sucesso/falha) inexistente; middleware de auditoria existente é placeholder em memória, não persistente, possivelmente não montado nas rotas de auth — e diverge do exigido por ADR-010.
10. Nenhuma interface `AuthProvider` isolando o contrato do provedor de identidade.
11. Nenhum ADR ou código trata explicitamente Account Linking (o próprio ADR-007 declara vinculação manual, mas isso é para Parceira pré-existente ↔ identidade OIDC de Google — não há previsão para o cenário "mesmo humano, dois provedores diferentes, ex. Google e Apple").
12. Sem índice em `email_perfil` apesar de busca por e-mail existir no repositório.
13. `parceira_id` sem FK declarada (constraint de integridade referencial ausente).

## 11. Riscos

- **Auditoria/LGPD:** a divergência entre ADR-010 (exige trilha de auditoria imutável para toda operação crítica) e a implementação atual (array em memória, possivelmente não conectado às rotas de auth) é o risco de maior severidade encontrado — afeta compliance declarado, não é hipotético.
- **CSRF:** ausência de token dedicado é mitigada parcialmente por `sameSite: lax`, mas não elimina todos os vetores (ex. navegação de topo GET-based ainda é permitida por `lax`); rotas mutáveis de auth (`/cadastro`, `/logout`) dependem só dessa mitigação indireta.
- **Sessão sem revogação:** em cenário de comprometimento de cookie, não há mecanismo de invalidação imediata além de aguardar a expiração natural (até 6h, renovável).
- **Acoplamento ao Google sem discriminador de provedor:** adicionar um segundo IDP hoje exigiria alterar o schema da tabela `identidades` (que assume implicitamente namespace único de `sub_provider`) — risco de colisão de `sub` entre provedores diferentes se não for tratado antes de qualquer implementação multi-IDP.
- **`/dev-login`:** bypass de autenticação condicionado a `env.isProduction === false`; risco operacional (não de código) caso a variável de ambiente seja mal configurada em produção — o próprio código já implementa dupla checagem, reduzindo mas não eliminando esse risco por config.

## 12. ADRs Recomendadas (antes de qualquer implementação multi-IDP)

Cada uma seguindo o objetivo de "declarar a lacuna, não presumir" (ADR-003):

1. **ADR — Modelo de Identidade Multi-Provider**
   *Objetivo:* decidir se a chave primária de identidade passa a ser um par `(provider, subject)` em vez de `sub_provider` isolado.
   *Motivação:* Seção 10.1 — hoje não há discriminador de provedor; adicionar Apple sem essa decisão arrisca colisão de namespace de `sub`.
   *Impacto:* schema de `identidades`, `identidade.repository.ts`, `identidade.service.ts`.
   *Riscos:* migração de dados existentes (registros Google precisam ganhar `provider = 'google'` retroativamente).
   *Dependências:* nenhuma decisão de produto pendente identificada — é puramente estrutural.

2. **ADR — Account Linking (mesmo humano, múltiplos provedores)**
   *Objetivo:* definir se/como uma Parceira pode ter duas identidades (Google e Apple) vinculadas à mesma `parceiraId`.
   *Motivação:* ADR-007 só cobre vinculação manual Parceira↔identidade única; não cobre segunda identidade para a mesma Parceira.
   *Impacto:* `identidade.service.ts` (`resolverOuCriarIdentidade`), UX de cadastro/login.
   *Riscos:* decisão de produto (permitir ou não múltiplos IDPs por pessoa) — é regra de negócio inédita, não técnica.
   *Dependências:* decisão de produto do responsável do projeto.

3. **ADR — Estratégia de Sessão (revisão para multi-IDP)**
   *Objetivo:* confirmar se o modelo stateless atual (cookie assinado, 6h, deslizante) permanece adequado quando existir mais de um IDP, ou se passa a exigir estado server-side para permitir revogação.
   *Motivação:* Seção 4/10.7 — hoje não há revogação; a decisão de mantê-lo assim deve ser explícita, não herdada por omissão.
   *Impacto:* `middleware/session.ts`.
   *Riscos:* mudança de stateless para stateful tem custo de infraestrutura (Redis ou tabela).
   *Dependências:* nenhuma.

4. **ADR — Estratégia de Logout e Revogação**
   *Objetivo:* decidir se logout deve invalidar o cookie no servidor (blacklist) e/ou propagar logout ao IDP (RP-Initiated Logout do OIDC).
   *Motivação:* Seção 4/10.7 — logout atual só limpa cookie local, sem efeito no IDP nem revogação server-side.
   *Impacto:* `auth.routes.ts`, `middleware/session.ts`.
   *Riscos:* nenhum imediato — é decisão de segurança, não bloqueante.
   *Dependências:* nenhuma.

5. **ADR — Modelo de Cookies e CSRF**
   *Objetivo:* decidir se `sameSite: lax` é suficiente ou se rotas mutáveis passam a exigir token CSRF dedicado.
   *Motivação:* Seção 7/10.5 — lacuna confirmada, sem decisão registrada até hoje.
   *Impacto:* todas as rotas mutáveis de `/auth` e `/api`.
   *Riscos:* nenhum técnico relevante — implementação de baixo custo.
   *Dependências:* nenhuma.

6. **ADR — Modelo de Claims (obrigatórias vs. opcionais por provedor)**
   *Objetivo:* definir o contrato mínimo de claims que qualquer IDP futuro deve fornecer (hoje: `sub`, `email`, `email_verified`, `name` — Apple, por exemplo, tem particularidades conhecidas de fornecimento de nome só no primeiro login).
   *Motivação:* Seção 5 — claims lidas hoje são específicas do comportamento observado do Google; Apple diverge nesse ponto.
   *Impacto:* `identidade.service.ts` (`ClaimsGoogle` precisaria generalizar).
   *Riscos:* perda de dado (nome) se o contrato não acomodar a particularidade de outro provedor.
   *Dependências:* nenhuma.

7. **ADR — Estratégia de Auditoria de Autenticação (conformidade com ADR-010)**
   *Objetivo:* decidir a implementação real de auditoria persistente e imutável para eventos de login, exigida por ADR-010 mas não implementada no módulo de identidade hoje.
   *Motivação:* Seção 7/11 — risco de maior severidade encontrado nesta auditoria; divergência ativa entre ADR aceito e código.
   *Impacto:* `middleware/auditoria.ts`, `auth.routes.ts`, possivelmente nova tabela.
   *Riscos:* compliance LGPD já declarado e não implementado.
   *Dependências:* nenhuma — pode e talvez deva ser resolvido independente da iniciativa multi-IDP.

8. **ADR — User × Identity × Parceira (separação de conceitos)**
   *Objetivo:* decidir se a introdução de multi-IDP exige separar "pessoa" (User/Identity, agnóstico de provedor) de "credencial federada" (uma linha por provedor vinculado) — hoje ambos os conceitos estão fundidos em `Identidade`.
   *Motivação:* Seção 3/10.10 — não existe abstração `AuthProvider`; o modelo atual funde autenticação e autorização em um único registro por provedor.
   *Impacto:* schema completo, `identidade.types.ts`, `identidade.repository.ts`, `identidade.service.ts`.
   *Riscos:* é a decisão de maior impacto estrutural da lista — deveria preceder as demais ADRs de dado (1 e 2), pois as define.
   *Dependências:* nenhuma decisão de produto pendente conhecida, mas é a ADR-fundação das outras nesta lista.

**Ordem de dependência sugerida (não prescritiva de implementação, apenas de sequência de decisão):** ADR 8 → ADR 1 → ADR 2 → ADR 6 → ADR 3 → ADR 4 → ADR 5 → ADR 7 (ADR 7 é independente e pode ser paralela a qualquer momento, dado que é uma dívida já existente hoje, não uma pré-condição para multi-IDP).

---

*Fim do relatório. Nenhum arquivo de código foi alterado. Nenhuma inferência substitui uma lacuna confirmada — onde a informação não existia no código nem na documentação, foi declarada como tal.*
