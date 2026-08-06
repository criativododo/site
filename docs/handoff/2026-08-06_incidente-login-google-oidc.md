# Handoff — Incidente: login Google OIDC fora do ar em produção (SESSÃO 1/3)

> Handoff oficial desta sessão. Objetivo: permitir que a próxima sessão principal (C1)
> continue exatamente do ponto atual sem reler o histórico da conversa.

## 1. Objetivo da sessão

Restabelecer completamente o login com Google no Portal — investigar a falha, mapear o
fluxo de autenticação, validar cada etapa do OAuth, localizar a causa raiz, corrigir e
validar o fluxo completo após a correção (escopo original de "SESSÃO 1/3 — LOGIN GOOGLE").
Durante a sessão, o usuário estendeu o escopo duas vezes, dentro do mesmo incidente: (1)
corrigir a lacuna de observabilidade que impediu o log do erro original em produção; (2)
fechar operacionalmente o incidente com validação final e este handoff.

## 2. Causa raiz

**Sintoma:** `GET /auth/google/login` respondia **500** em produção, em 100% das tentativas,
enquanto `/health` e `/auth/me` funcionavam normalmente.

**Causa raiz:** `portal-backend/src/modules/identidade/oidc.ts`, função
`obterConfiguracaoGoogle()`. A Promise de `client.discovery(...)` (biblioteca
`openid-client`) era memoizada incondicionalmente num singleton de módulo
(`configuracaoPromise`). Uma Promise **rejeitada** ainda é um valor truthy — logo
`if (!configuracaoPromise)` nunca voltava a ser verdadeiro depois da primeira falha. Uma
falha transitória (rede, timeout, instabilidade momentânea do endpoint de discovery do
Google — o gatilho exato não é rastreável, ver Seção 7) em algum ponto das ~22h de vida do
processo bastou para envenenar o cache **permanentemente**: toda requisição seguinte
reutilizava a mesma rejeição até o próximo restart do processo.

**Evidência que isolou a causa** (sem tentativa-e-erro): `/health` e `/auth/me` respondiam
normalmente (não era falha de rede/infra geral); uma chamada de `client.discovery()` isolada,
num processo Node novo, teve sucesso imediato com as mesmas credenciais (não era problema de
credencial/config); logo a única explicação consistente era estado envenenado em memória do
processo já em execução — confirmado pelo próprio fix (ver Seção 4).

**Causa raiz secundária (achado durante a correção, virou o segundo fix desta sessão):** o
handler de erro global (`app.ts`) só chamava `console.error(err)` fora de produção
(`if (!env.isProduction)`). Por isso a exceção real ficou 22h sem deixar nenhum rastro em
log — a causa raiz só foi encontrada reproduzindo o erro manualmente via SSH, não pelos logs
de produção.

## 3. Linha do tempo

| Quando (horário local -03) | Evento |
|---|---|
| 2026-08-05 15:00:41 | Deploy anterior a este incidente (commit `800d01f`→sync, não desta sessão) — processo `portal-backend` sobe via PM2, boot em 2026-08-05T18:01:32Z |
| Indeterminado, entre o boot e o início desta sessão | Falha transitória de discovery envenena `configuracaoPromise` (sem log — causa raiz secundária, Seção 2) |
| 2026-08-06 13:33:59 | Reprodução confirmada nesta sessão: `curl /auth/google/login` → 500; `/health`/`/auth/me` OK |
| 2026-08-06 13:37:40 | Commit `52bfe81` (fix de login) criado — 390 testes locais, lint/typecheck/build das 3 apps verdes (pre-commit hook) |
| 2026-08-06 13:37:55 | Push para `main` — CI `31120506716` disparado |
| 2026-08-06 ~13:38–13:53 | CI preso em `queued`: outage confirmado do GitHub (`githubstatus.com`: Actions e Pages em `major_outage`) |
| 2026-08-06 13:50:58–13:51:50 | **Deploy manual via SSH** do commit `52bfe81`, aprovado explicitamente pelo usuário (opção escolhida via pergunta direta, dado o outage e produção fora do ar) — `deploy/deploy.sh` + `deploy/healthcheck.sh`, replicando exatamente o comando do workflow oficial |
| 2026-08-06 13:52:13 | Validado: `/auth/google/login` → **302** em produção (era 500) |
| 2026-08-06 ~13:53–14:07 | CI `31120506716` eventualmente conclui `failure` (cancelado após ~15min preso — outage, não regressão do fix) |
| 2026-08-06 14:08:10 | Commit `f0cb58d` (fix de observabilidade) criado — 398 testes locais, lint/typecheck/build verdes |
| 2026-08-06 14:08:24 | Push para `main` — novo CI `31122222830` disparado (cobre os dois commits) |
| 2026-08-06 14:08–14:21 | Outage do GitHub **ainda ativo** — CI `31122222830` segue `queued`. Monitor em segundo plano ativo, vai reexecutar automaticamente quando `githubstatus.com` reportar Actions `operational` |
| 2026-08-06 14:20:52–14:21:07 | Revalidação final desta sessão: produção estável em `52bfe81`, healthcheck/login/headers/cookies OK (Seção 6); suíte local (398/398), typecheck, build e lint revalidados para `f0cb58d` (ainda não deployado) |

## 4. Commits

Branch `main`:

- **`52bfe81`** — `fix(auth): impede que falha transitória no discovery OIDC do Google trave login para sempre`. **Deployado em produção** (deploy manual, ver Seção 3).
- **`f0cb58d`** — `fix(observability): handler global de erros passa a logar sempre, com contexto estruturado`. Commitado e enviado a `origin/main`. **Ainda não deployado em produção** — aguardando CI/deploy automático (bloqueado pelo outage do GitHub) ou nova decisão de deploy manual.

## 5. Arquivos alterados

**`52bfe81`:**
- `portal-backend/src/modules/identidade/oidc.ts` (M) — cache da Promise de discovery limpo no `catch`, para a próxima chamada tentar de novo em vez de reusar a falha para sempre.
- `portal-backend/src/modules/identidade/oidc.test.ts` (novo) — reproduz o bug (2ª chamada reusava a rejeição) e trava a correção.

**`f0cb58d`:**
- `portal-backend/src/app.ts` (M) — usa `requestId` e `tratarErroGlobal` no lugar do handler de erro inline.
- `portal-backend/src/types/express.d.ts` (M) — adiciona `requestId?: string` a `Express.Request`.
- `portal-backend/src/middleware/errorHandler.ts` (novo) — handler extraído, loga sempre (timestamp, requestId, method, rota, status, mensagem, stack), preserva a resposta HTTP existente (500 + JSON genérico).
- `portal-backend/src/middleware/errorHandler.test.ts` (novo) — 6 testes.
- `portal-backend/src/middleware/requestId.ts` (novo) — `crypto.randomUUID()` por requisição, exposto em `req.requestId` e no header `X-Request-Id`.
- `portal-backend/src/middleware/requestId.test.ts` (novo) — 2 testes.

Nenhum outro arquivo do repositório foi tocado por este incidente. Mudanças pré-existentes e
não relacionadas (`perfil.service.ts`, 3 telas de `experimentos/`, `.claude/jobs/`,
`docs/ssh-diagnostico-20260802-120813.txt`) seguem exatamente como estavam no início da
sessão — não commitadas, não revertidas.

## 6. Validações realizadas

### Testes automatizados (local, `portal-backend`)

| Checagem | Resultado |
|---|---|
| `npx vitest run` | ✅ 398/398 testes, 53 arquivos |
| `npm run typecheck` | ✅ sem erros |
| `npm run build` | ✅ sem erros |
| `npx biome check` (arquivos alterados) | ✅ sem achados |
| Pre-commit hook (lint+build `app`/`portal-frontend`, typecheck+build `portal-backend`) | ✅ passou nos dois commits |

### Produção (revalidado às 14:20–14:21, após os dois commits, refletindo o estado real
deployado — só `52bfe81`)

| Checagem | Resultado |
|---|---|
| `deploy/healthcheck.sh` | ✅ todas as 6 checagens passaram (PM2, backend local, Nginx ativo, Postgres ativo, Nginx config válida, HTTPS público) |
| `GET /health` | ✅ 200 |
| `GET /auth/me` (sem cookie) | ✅ 401 (comportamento correto, inalterado) |
| `GET /auth/google/login` | ✅ **302** (era 500), estável em 8 tentativas ao longo da sessão (3 + 5 + verificações pontuais) |
| Header `Location` | ✅ aponta para `accounts.google.com/o/oauth2/v2/auth` com `redirect_uri`, `client_id`, `scope=openid email profile`, `code_challenge`/`code_challenge_method=S256`, `state` corretos |
| Cookie de handshake (`dodo_portal_oidc_handshake`) | ✅ `HttpOnly; Secure; SameSite=Lax; Path=/auth/google; Max-Age=300` — inalterado |
| Commit publicado na VPS == HEAD esperado | ✅ `git rev-parse HEAD` na VPS = `52bfe81` (commit do fix de login) |
| Headers de segurança (CSP, HSTS, X-Frame-Options etc., via `helmet()`) | ✅ presentes e inalterados |
| Rate limit (`x-ratelimit-*`) | ✅ presente e inalterado |

### Regressão do `requestId`/`errorHandler` (f0cb58d)

**Não pôde ser validada em produção** porque este commit ainda não foi deployado (Seção 4).
Validação disponível é só de código/teste local:
- Os 398 testes locais incluem testes de contrato (`supertest` + `app` real, ex.
  `api.routes.contract.test.ts`, `conteudo.admin.routes.contract.test.ts`,
  `briefing.admin.routes.contract.test.ts`) que exercitam a cadeia real de middleware do
  Express (`requestId` → `helmet` → `cors` → rotas → `tratarErroGlobal`) — todos passaram,
  sem alterar nenhuma asserção de status/CORS/rate-limit existente.
- `errorHandler.test.ts` prova explicitamente que o contrato de resposta HTTP ao cliente não
  mudou (sempre 500 + `{"error": "Erro interno do servidor."}`, nunca vaza mensagem/stack
  interno) — só o que é logado no servidor mudou.
- Nenhuma migração de banco, mudança de schema ou dependência nova foi introduzida.

**Pendência:** confirmar em produção, após o deploy de `f0cb58d`, que uma exceção real gera
a linha `[erro-nao-tratado] ...` no log (`pm2 logs portal-backend` ou
`logs/portal-backend.error.log`) e que o header `X-Request-Id` aparece em toda resposta.

## 7. Riscos remanescentes

1. **`f0cb58d` ainda não está em produção** — enquanto isso, qualquer exceção nova em
   produção continua invisível nos logs (mesmo risco de origem deste incidente, ainda não
   mitigado em produção, só corrigido em código/`main`).
2. **CI da `main` está com histórico vermelho** — o run `31120506716` concluiu `failure`
   (cancelado pelo outage, não por regressão real). Fica assim até uma nova execução bem
   sucedida (`31122222830`, monitorado automaticamente, ou `gh run rerun`).
3. **Outage do GitHub (Actions + Pages) é uma dependência externa sem ETA conhecido** —
   bloqueia o pipeline oficial (CI→Deploy) enquanto durar. Sujeito a reavaliação a cada
   sessão futura.
4. **Gatilho de primeira ordem não identificado com certeza** — não se sabe exatamente qual
   evento causou a falha transitória original de discovery (rede, timeout, instabilidade do
   Google). Não bloqueia o fix (que é robusto a qualquer causa transitória), mas significa
   que não há garantia de que o mesmo gatilho externo não se repita — só que, quando se
   repetir, o sistema agora se recupera sozinho em vez de travar permanentemente.
5. **Falta de alerta automático** — mesmo com o log corrigido (`f0cb58d`), não existe hoje
   nenhum mecanismo que notifique um humano quando `[erro-nao-tratado]` aparecer no log; a
   descoberta continua dependendo de alguém olhar. Fora do escopo desta sessão (o usuário
   pediu só o log, não alerta).

## 8. Plano de rollback

- **`52bfe81` (fix de login, já em produção):** rollback não é recomendado — reverteria para
  o bug ativo (500 permanente). Só se justificaria se o fix tivesse introduzido uma
  regressão nova, o que a suíte de 398 testes + validação end-to-end em produção (Seção 6)
  não indica. Se necessário mesmo assim: `git revert 52bfe81`, push, e redeploy (automático
  via CI quando o outage passar, ou manual via SSH como na Seção 3).
- **`f0cb58d` (fix de observabilidade, ainda não em produção):** hoje, "rollback" é
  simplesmente não incluí-lo no próximo deploy. Se já tiver sido deployado quando esta seção
  for lida e precisar reverter: `git revert f0cb58d` — mudança é aditiva e isolada (2 arquivos
  novos de middleware + 2 alterações pequenas em `app.ts`/`express.d.ts`, sem schema, sem
  migração, sem dependência nova), reversível em minutos.
- **Mecanismo de deploy de emergência (usado nesta sessão, disponível para qualquer
  rollback futuro se o CI oficial estiver indisponível):**
  ```
  ssh dodo "sudo -u dodo -i bash -c 'cd /opt/dodo-portal && git checkout <commit> && ./deploy/deploy.sh && ./deploy/healthcheck.sh portal.criativododo.com.br'"
  ```

## 9. Estado final

- **Login Google OIDC:** ✅ restabelecido e validado em produção.
- **Causa raiz do login:** ✅ corrigida na origem (não é contorno/retry externo — o próprio
  singleton se autocorrige).
- **Observabilidade (causa raiz secundária):** ✅ corrigida em código/`main`, ⏳ não deployada
  em produção ainda.
- **CI oficial:** ⏳ bloqueado por outage externo do GitHub (Actions + Pages,
  `major_outage` confirmado por `githubstatus.com` na última checagem desta sessão).
- **Monitor em segundo plano ativo** (task `bdskatn95` desta sessão): aguarda
  `githubstatus.com` reportar Actions `operational`, então reporta a conclusão do CI
  `31122222830` automaticamente. Se esta sessão encerrar antes do outage passar, a próxima
  sessão deve checar `gh run view 31122222830` e, se ainda `queued`/outage ativo, decidir
  entre aguardar ou repetir o deploy manual (Seção 8) para `f0cb58d`.
- **Bloqueio para a próxima sessão:** nenhum bloqueio técnico — só depende da recuperação do
  GitHub Actions (externa) para fechar o pipeline oficial, ou de uma nova decisão explícita
  de deploy manual para `f0cb58d`.

## 10. Checklist

- [x] Causa raiz do login investigada e confirmada por evidência (não tentativa-e-erro)
- [x] Fix de login implementado, testado (TDD: teste que reproduz o bug antes do fix) e commitado (`52bfe81`)
- [x] Fix de login deployado em produção (manual, SSH, aprovado explicitamente pelo usuário)
- [x] Fix de login validado em produção (healthcheck + `/auth/google/login` 302 + headers + cookies)
- [x] Causa raiz da lacuna de observabilidade investigada
- [x] Fix de observabilidade implementado, testado e commitado (`f0cb58d`)
- [x] Lint, typecheck, build e testes revalidados após o fix de observabilidade
- [x] Regressão do `requestId`/`errorHandler` verificada (nível código/teste — produção pendente, ver Seção 6)
- [x] Este handoff produzido
- [ ] **Fix de observabilidade (`f0cb58d`) deployado em produção — pendente, bloqueado por outage externo do GitHub**
- [ ] CI da `main` com execução verde mais recente (`31122222830` ou reexecução) — pendente, mesmo bloqueio
- [ ] Validação em produção de que `[erro-nao-tratado]` é de fato logado (só possível depois do deploy de `f0cb58d`)
