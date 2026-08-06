# Handoff — Incidente: login Google OIDC fora do ar em produção (SESSÃO 1/3 + fechamento SESSÃO 2)

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
| 2026-08-06 14:08–14:21 | Outage do GitHub **ainda ativo** — CI `31122222830` segue `queued` |
| 2026-08-06 14:20:52–14:21:07 | Revalidação final desta sessão: produção estável em `52bfe81`, healthcheck/login/headers/cookies OK (Seção 6); suíte local (398/398), typecheck, build e lint revalidados para `f0cb58d` (ainda não deployado) |
| 2026-08-06 14:23:28 | CI `31122222830` conclui `failure` — **confirmado como cancelamento por outage, não regressão real**: os 3 jobs (`landing`, `portal-backend`, `portal-frontend`) foram `cancelled` com `steps: []` (nenhum passo chegou a rodar — não é falha de lint/typecheck/build/teste) |
| 2026-08-06 14:23:28 (checagem seguinte) | `githubstatus.com` ainda reporta Actions/Pages em `major_outage` — nova rodada de monitoramento em segundo plano iniciada para reexecutar assim que normalizar |
| 2026-08-06 (nova rodada, a pedido do usuário) | Investigação formal, sem assumir outage: `gh auth status`, usuário/org, remote, workflows/estado, últimos 20 runs via API, branch protection/rulesets, Actions habilitado, concorrência — todas as hipóteses locais descartadas com evidência. Confirmado via `githubstatus.com/api/v2/incidents/unresolved.json`: incidente oficial "Incident with Actions", impacto `critical`, aberto às 15:22:49Z, update das 17:02:43Z cita literalmente "queued jobs may time out" — bate exatamente com o sintoma observado. Achado colateral não relacionado: `notebooklm-sync.yml` falha com `0 jobs` (startup failure) em todo push, inclusive antes do outage — pré-existente, fora de escopo |
| 2026-08-06 15:00–15:05 (-03) | Dois subagentes em paralelo: (1) investigação read-only do fluxo de log + busca por outros pontos cegos; (2) deploy manual do HEAD atual de `main` (commit `02097c3`, inclui `f0cb58d`), repetindo o mesmo comando SSH já pré-aprovado. Deploy: **SUCESSO COMPLETO** — healthcheck 6/6, HEAD da VPS == HEAD local, `/auth/google/login` 302, `/health` 200, `/auth/me` 401, header `x-request-id` presente (prova de que o código novo está de fato rodando) |
| 2026-08-06 15:07 (-03) | Validação final independente do coordenador (eu): commit VPS confirmado de novo, PM2 `online` (sem crash-loop, `restart_time` avançou só +2 pelos dois reloads desta sessão), `/auth/google/login`/`/health`/`x-request-id` reconfirmados, log de erro sem entrada `[erro-nao-tratado]` ainda (esperado — nenhum erro real ocorreu desde o redeploy) |
| 2026-08-06 15:19–15:26 (-03), **SESSÃO 2** | Nova sessão retoma exatamente o item pendente da Seção 7 (item 1): revisão preventiva ampla de pontos onde exceções podem ser perdidas, achando de novo (independentemente) o mesmo ponto cego já registrado (`auth.routes.ts:121`/`:70`) mais dois adjacentes (`session.ts` — parse do cookie de sessão; `Admin.tsx` — único `.catch` do frontend sem log/feedback nenhum) |
| 2026-08-06 15:24 (-03) | Commit `c076b15` — `fix(observability): loga erros hoje silenciosos no callback OIDC e no parse de cookies`. Pre-commit hook (lint+build das 3 apps, typecheck+build do backend) verde. Push para `main` bem-sucedido apesar do outage do GitHub ainda ativo (Git HTTPS não é afetado, só Actions/Pages/webhooks — `gh run list` confirma que o novo push nem chegou a dar `queued`, evidência direta de que o outage também está represando a entrega do webhook, não só a fila de execução) |
| 2026-08-06 15:25–15:26 (-03) | Deploy manual via SSH do commit `c076b15` (mesmo procedimento validado na Seção 3: `deploy/deploy.sh` + `deploy/healthcheck.sh`), sem intervenção de subagente desta vez — executado e validado diretamente nesta sessão. `git pull --ff-only` fast-forward `02097c3..c076b15` sem conflito. Healthcheck: 6/6. `git rev-parse HEAD` da VPS confirmado == HEAD local (`c076b15`) |
| 2026-08-06 15:26:33 (-03) | **Fecha a última milha de evidência da Seção 7, item 4 (herdada da sessão anterior):** requisição real contra `/auth/google/callback` em produção com cookie de handshake corrompido → resposta `400` inalterada **e**, pela primeira vez, uma linha de log real e ao vivo apareceu no arquivo de produção: `2026-08-06T15:26:33: [oidc-handshake-invalido] timestamp=2026-08-06T18:26:33.585Z requestId=fbc6e703-49d3-4670-b1ad-f536331ec5e1 mensagem="Unexpected token 'r'…"` — `requestId` do log bate exatamente com o header `x-request-id` da resposta HTTP, provando correlação ponta a ponta (não só que o mecanismo existe, mas que ele funciona com um evento real) |

## 4. Commits

Branch `main`:

- **`52bfe81`** — `fix(auth): impede que falha transitória no discovery OIDC do Google trave login para sempre`. **Deployado em produção** (deploy manual, ver Seção 3).
- **`f0cb58d`** — `fix(observability): handler global de erros passa a logar sempre, com contexto estruturado`. **Deployado em produção** via SSH (mesmo commit publicado como parte do HEAD `02097c3`, ver Seção 3).
- **`81608bb`**, **`02097c3`**, **`8168d94`** — `docs(handoff): ...` (este próprio documento, ao longo da SESSÃO 1). Documentação apenas, sem código.
- **`c076b15`** — `fix(observability): loga erros hoje silenciosos no callback OIDC e no parse de cookies` (SESSÃO 2). **Deployado em produção** (deploy manual via SSH, ver linha de 2026-08-06 15:25–15:26 na Seção 3).

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

**`c076b15` (SESSÃO 2):**
- `portal-backend/src/modules/identidade/auth.routes.ts` (M) — log estruturado
  (timestamp/requestId/mensagem/stack) nos dois `catch` do callback OIDC que engoliam erro
  sem rastro (linhas 121 e 70 na versão pré-fix); resposta HTTP (400/401) inalterada nos dois.
- `portal-backend/src/middleware/session.ts` (M) — mesmo tratamento no `catch` do parse do
  cookie de sessão (`decodificar`); fail-closed inalterado.
- `portal-frontend/src/pages/Admin.tsx` (M) — `console.error` no único `.catch` do frontend
  que não dava nenhuma indicação de falha (nem UI, nem log); comportamento de UI (lista vazia)
  inalterado.

## 6. Validações realizadas

### Testes automatizados (local, `portal-backend`)

| Checagem | Resultado |
|---|---|
| `npx vitest run` | ✅ 398/398 testes, 53 arquivos |
| `npm run typecheck` | ✅ sem erros |
| `npm run build` | ✅ sem erros |
| `npx biome check` (arquivos alterados) | ✅ sem achados |
| Pre-commit hook (lint+build `app`/`portal-frontend`, typecheck+build `portal-backend`) | ✅ passou nos dois commits |

### Produção — estado final (revalidado 15:07, após o deploy de `f0cb58d`/`02097c3`)

| Checagem | Resultado |
|---|---|
| `deploy/healthcheck.sh` | ✅ todas as 6 checagens passaram (PM2, backend local, Nginx ativo, Postgres ativo, Nginx config válida, HTTPS público) |
| `GET /health` | ✅ 200 |
| `GET /auth/me` (sem cookie) | ✅ 401 (comportamento correto, inalterado) |
| `GET /auth/google/login` | ✅ **302**, estável em todas as verificações ao longo da sessão, inclusive após o segundo deploy |
| Header `Location` | ✅ aponta para `accounts.google.com/o/oauth2/v2/auth` com `redirect_uri`, `client_id`, `scope=openid email profile`, `code_challenge`/`code_challenge_method=S256`, `state` corretos |
| Cookie de handshake (`dodo_portal_oidc_handshake`) | ✅ `HttpOnly; Secure; SameSite=Lax; Path=/auth/google; Max-Age=300` — inalterado |
| Header `X-Request-Id` | ✅ **presente** em `/auth/google/login` (prova de que o código de `f0cb58d` está de fato em execução, não só que o script "rodou sem erro") |
| Commit publicado na VPS == HEAD de `main` | ✅ `git rev-parse HEAD` na VPS = `02097c3...` = HEAD local, confirmado 2x (pelo subagente de deploy e de novo, independentemente, pelo coordenador) |
| PM2 | ✅ `status=online`, sem crash-loop (`restart_time` avançou só +2 pelos dois `pm2 reload` desta sessão, não uma escalada) |
| Headers de segurança (CSP, HSTS, X-Frame-Options etc., via `helmet()`) | ✅ presentes e inalterados |
| Rate limit (`x-ratelimit-*`) | ✅ presente e inalterado |

### Confirmação de que os logs chegam ao mecanismo esperado (Subagente 1)

- `tratarErroGlobal` chama `console.error` **sem nenhum gate condicional** — confirmado por
  leitura direta e por `grep -rn "console\.error\s*="` em todo `portal-backend/src` (zero
  overrides/interceptações no bootstrap).
- `ecosystem.config.cjs` (raiz do repo) mapeia stderr do processo para
  `./logs/portal-backend.error.log` (`error_file`, `merge_logs: true`, `time: true`),
  `cwd: "./portal-backend"` → caminho absoluto em produção
  `/opt/dodo-portal/portal-backend/logs/portal-backend.error.log`, batendo com o
  `pm_err_log_path` já visto em `pm2 jlist`.
- Via SSH: arquivo existe, gravável pelo usuário `dodo` (dono do processo), e **ativamente
  escrito** — outras linhas de `console.warn`/`console.error` pré-existentes (`[CepResolver]`)
  já passam por esse mesmo mecanismo, provando que o caminho de escrita funciona de ponta a
  ponta.
- **Limite honesto desta validação:** nenhuma linha `[erro-nao-tratado]` foi observada *ao
  vivo* em produção, porque nenhum erro real ocorreu desde o redeploy (bom sinal de
  estabilidade, mas significa que a prova é por configuração+código+analogia, não por um
  evento real capturado). Não foi injetado um erro sintético em produção deliberadamente —
  não fazia parte do escopo/aprovação desta sessão forçar uma falha real só para observar o
  log, e o risco/benefício não justificou. Primeira ocorrência natural (ou um teste
  controlado futuro, decisão explícita) vai fechar essa última milha de evidência.
- Testes automatizados (`errorHandler.test.ts`/`requestId.test.ts`): **2 arquivos, 8 testes,
  todos passando** — usam `vi.spyOn(console, "error")` e checam o conteúdo exato da string
  (timestamp, requestId, method, rota, status, mensagem) e a chamada separada com
  `erro.stack`. Considerados adequados; nenhum teste novo foi necessário.

### Regressão do `requestId`/`errorHandler`

**Nenhuma regressão encontrada**, nem em teste local nem em produção pós-deploy: os 398
testes locais incluem testes de contrato (`supertest` + `app` real) que exercitam a cadeia
real de middleware (`requestId` → `helmet` → `cors` → rotas → `tratarErroGlobal`) sem alterar
nenhuma asserção de status/CORS/rate-limit existente; em produção, login/health/rate-limit/
headers de segurança/cookies permanecem exatamente como antes do deploy (tabela acima).

### SESSÃO 2 — fechamento do ponto cego `auth.routes.ts:121`/`:70` (commit `c076b15`)

**Testes automatizados (local, antes do commit):**

| Checagem | Resultado |
|---|---|
| `portal-backend`: `npx vitest run` | ✅ 398/398 testes, 53 arquivos |
| `portal-backend`: `npm run typecheck` / `npm run build` | ✅ sem erros |
| `portal-frontend`: `npx tsc -b` | ✅ sem erros |
| `portal-frontend`: `npx vitest run` | ✅ 17/17 testes, 1 arquivo |
| `portal-frontend`: `npx oxlint` (arquivo alterado) | ✅ sem achados |
| Pre-commit hook (lint+build `app`/`portal-frontend`, typecheck+build `portal-backend`) | ✅ passou no commit `c076b15` |

**Produção — pós-deploy manual via SSH (15:25–15:26, ver Seção 3):**

| Checagem | Resultado |
|---|---|
| `deploy/healthcheck.sh` | ✅ todas as 6 checagens passaram |
| `GET /health` | ✅ 200 |
| `GET /auth/me` (sem cookie) | ✅ 401 (inalterado) |
| `GET /auth/google/login` | ✅ 302, `Location` para `accounts.google.com` com PKCE/state corretos, cookie de handshake `HttpOnly; Secure; SameSite=Lax` |
| Header `X-Request-Id` | ✅ presente em `/auth/google/login` |
| Commit publicado na VPS == HEAD de `main` | ✅ `c076b15` nos dois lados |
| PM2 | ✅ `status=online`; `restart_time` é cumulativo desde o primeiro `pm2 start` (não usado isoladamente como sinal — ver Observações da SESSÃO 1), mas o processo respondeu de forma consistente em todas as checagens desta rodada, sem indício de crash-loop |
| Headers de segurança/rate-limit | ✅ presentes e inalterados (amostra: `strict-transport-security`, `x-frame-options` em `/health`) |
| **`GET /auth/google/callback` com cookie de handshake corrompido (teste direto, não sintético em código — só um cookie inválido de verdade)** | ✅ resposta **400 inalterada** *e* **linha de log real capturada ao vivo** em `portal-backend/logs/portal-backend.error.log`: `[oidc-handshake-invalido] timestamp=2026-08-06T18:26:33.585Z requestId=fbc6e703-… mensagem="Unexpected token…"` — `requestId` do log confere com o header `x-request-id` da resposta HTTP (fbc6e703-49d3-4670-b1ad-f536331ec5e1), fechando a lacuna de evidência "ao vivo" deixada em aberto na SESSÃO 1 (Seção 7, item 4 original) |

**Nenhuma regressão encontrada** nesta rodada: os mesmos endpoints/headers/cookies validados
na SESSÃO 1 permanecem idênticos após o deploy de `c076b15`.

## 7. Riscos remanescentes

1. ~~Ponto cego real ainda não corrigido: `auth.routes.ts:121`/`:70`~~ — **✅ resolvido na
   SESSÃO 2, commit `c076b15`, deployado e validado ao vivo em produção (Seção 6).** Mantido
   aqui riscado por rastreabilidade histórica.
2. **CI da `main` está com histórico vermelho** — os runs `31120506716`, `31122222830` e o
   novo `31125335300` (push do commit `c076b15`, SESSÃO 2) seguem afetados pelo outage
   confirmado do GitHub (ver item 3). Fica assim até uma execução bem-sucedida depois que o
   outage passar; nenhum deles reflete regressão real de lint/typecheck/build/teste.
3. **Outage do GitHub (Actions + Pages) é uma dependência externa sem ETA conhecido** —
   reconfirmado ainda ativo na SESSÃO 2 (`githubstatus.com`: `major_outage`, mesmo incidente
   `qcvjkzcs7j74` aberto às 15:22:49Z, ainda em `investigating` às 18:11:41Z). Continua
   bloqueando o pipeline oficial (CI→Deploy) enquanto durar; `git push`/`git pull` (protocolo
   Git puro) não são afetados — só Actions/Pages/webhooks, confirmado de novo nesta sessão
   (push aceito normalmente, mas o run do CI nem chegou a aparecer em `gh run list` na hora).
4. ~~Confirmação com erro real ainda pendente~~ — **✅ resolvido na SESSÃO 2**: linha de log
   `[oidc-handshake-invalido]` capturada ao vivo em produção, com `requestId` correlacionado
   ao header HTTP da mesma requisição (Seção 6). Mecanismo de log agora comprovado por evento
   real, não só por código+config+analogia.
5. **Gatilho de primeira ordem do incidente original não identificado com certeza** — não se
   sabe exatamente qual evento causou a falha transitória de discovery. Não bloqueia o fix
   (robusto a qualquer causa transitória), só significa que o mesmo gatilho externo pode se
   repetir — agora o sistema se recupera sozinho em vez de travar permanentemente.
6. **Falta de alerta automático** — não existe mecanismo que notifique um humano quando
   `[erro-nao-tratado]`/`[oidc-callback-falhou]`/`[oidc-handshake-invalido]`/
   `[sessao-cookie-invalido]` aparecerem no log; a descoberta continua dependendo de alguém
   olhar. Fora do escopo pedido em ambas as sessões (só log, não alerta).
7. **(Novo, SESSÃO 2) Ausência de handler global de processo no backend** —
   `portal-backend/src/server.ts` não registra `process.on("uncaughtException")` nem
   `process.on("unhandledRejection")`. Hoje mitigado porque o Express 5 encaminha rejeições de
   handlers assíncronos para `tratarErroGlobal`, mas um erro fora do ciclo de requisição
   (timer, listener de baixo nível) derruba o processo sem log algum. Decidir a política de
   resposta (logar e continuar vs. logar e reiniciar supervisionado) é decisão de
   arquitetura/operação — **não implementado, apenas documentado**, não corrigido
   automaticamente por ser fora do escopo de "correção simples e de baixo risco".
8. **(Novo, SESSÃO 2) Observabilidade de erro no frontend é só via UI, nunca console/telemetria**
   — ~30 blocos `catch (erroCapturado) { setErro(...) }`/`.catch((erroCapturado) => setErro(...))`
   espalhados por quase todas as telas Admin*/Financeiro/Pendencias/Perfil/Cadastro/experimentos
   mostram o erro ao usuário (não é um "erro perdido" na acepção estrita do pedido), mas nenhum
   deles loga a exceção original — hoje a única forma de saber que algo falhou em produção é o
   usuário reportar o que viu na tela. Corrigir isso da forma certa é um ponto único de
   observabilidade (ex.: dentro de `apiFetch`/`ApiError`), não 15 edições espalhadas — decisão
   de arquitetura de observabilidade do frontend, **não implementado, apenas documentado**.

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
- **Mecanismo de deploy de emergência (usado nas duas sessões, disponível para qualquer
  rollback futuro se o CI oficial estiver indisponível):**
  ```
  ssh dodo "sudo -u dodo -i bash -c 'cd /opt/dodo-portal && git checkout <commit> && ./deploy/deploy.sh && ./deploy/healthcheck.sh portal.criativododo.com.br'"
  ```
- **`c076b15` (fix do ponto cego do callback OIDC, SESSÃO 2, já em produção):** rollback não é
  recomendado — reverteria para os `catch` silenciosos originais. Mudança é puramente aditiva
  (só `console.error`, nenhuma resposta HTTP/UI mudou), sem schema, sem migração, sem
  dependência nova. Se necessário: `git revert c076b15`, push, redeploy manual (mesmo comando
  acima) ou via CI quando o outage passar.

## 9. Estado final

- **Login Google OIDC:** ✅ restabelecido e validado em produção.
- **Causa raiz do login:** ✅ corrigida na origem (não é contorno/retry externo — o próprio
  singleton se autocorrige).
- **Observabilidade (causa raiz secundária, handler global):** ✅ corrigida em código **e**
  ✅ **deployada e validada em produção** (commit `02097c3`, header `X-Request-Id` confirmado
  ao vivo).
- **Ponto cego adjacente (`auth.routes.ts:121`/`:70`) + parse do cookie de sessão
  (`session.ts`) + `.catch` silencioso do frontend (`Admin.tsx`):** ✅ **corrigidos, commitados
  (`c076b15`), deployados e validados em produção na SESSÃO 2** — inclusive com uma linha de
  log real capturada ao vivo (Seção 6), fechando também a última milha de evidência que a
  SESSÃO 1 tinha deixado em aberto.
- **CI oficial:** ⏳ ainda bloqueado por incidente global confirmado do GitHub ("Incident with
  Actions", `critical`, aberto 15:22:49Z, reconfirmado ativo às 18:11:41Z na SESSÃO 2) — causa
  externa, investigada e comprovada por evidência de primeira mão (não suposição); todas as
  hipóteses locais descartadas com evidência própria nas duas sessões.
- **Bloqueio para a próxima sessão:** nenhum bloqueio técnico no Portal em si. Este incidente
  específico (login Google OIDC + observabilidade + ponto cego adjacente) está **fechado**:
  não há mais nenhum item de código pendente ligado a ele. Os dois riscos novos documentados
  na Seção 7 (itens 7 e 8 — handler global de processo ausente; observabilidade de erro no
  frontend só via UI) são achados de uma revisão preventiva mais ampla, não deste incidente, e
  requerem decisão de arquitetura antes de virar código — não bloqueiam nada, só aguardam
  priorização. Fora isso, resta só a recuperação do GitHub Actions (externa, fora de controle)
  para o pipeline oficial voltar a ficar verde.

## 10. Checklist

- [x] Causa raiz do login investigada e confirmada por evidência (não tentativa-e-erro)
- [x] Fix de login implementado, testado (TDD: teste que reproduz o bug antes do fix) e commitado (`52bfe81`)
- [x] Fix de login deployado em produção (manual, SSH, aprovado explicitamente pelo usuário)
- [x] Fix de login validado em produção (healthcheck + `/auth/google/login` 302 + headers + cookies)
- [x] Causa raiz da lacuna de observabilidade investigada
- [x] Fix de observabilidade implementado, testado e commitado (`f0cb58d`)
- [x] Lint, typecheck, build e testes revalidados após o fix de observabilidade
- [x] **Fix de observabilidade deployado em produção** (commit `02097c3`, via subagente de deploy + validação independente do coordenador)
- [x] **Mecanismo de log confirmado por código+config+SSH** (arquivo certo, gravável, ativamente escrito por outras chamadas `console.*`)
- [x] Regressão do `requestId`/`errorHandler` verificada — em teste local **e** em produção pós-deploy, sem achados
- [x] Investigação formal do outage do GitHub Actions concluída, com evidência de primeira mão (incidente oficial), não suposição
- [x] Este handoff produzido e atualizado com o fechamento
- [x] **(SESSÃO 2)** `auth.routes.ts:121`/`:70` — ponto cego de observabilidade no callback OIDC, corrigido, commitado (`c076b15`), deployado e validado em produção
- [x] **(SESSÃO 2)** Confirmação com um erro real observado ao vivo em produção (`[oidc-handshake-invalido]`, `requestId` correlacionado ao header HTTP) — mecanismo comprovado por evento real, não só por análise de código
- [x] **(SESSÃO 2)** Achados adjacentes corrigidos no mesmo commit: `session.ts` (parse do cookie de sessão) e `Admin.tsx` (único `.catch` silencioso do frontend)
- [ ] CI da `main` com execução verde — pendente, bloqueado pelo outage do GitHub, sem ação local possível (reconfirmado ainda ativo ao final da SESSÃO 2)
- [ ] **(Novo, SESSÃO 2, fora do escopo deste incidente)** Handler global de processo (`uncaughtException`/`unhandledRejection`) no backend — decisão de arquitetura pendente, ver Seção 7 item 7
- [ ] **(Novo, SESSÃO 2, fora do escopo deste incidente)** Observabilidade centralizada de erro no frontend (hoje só UI, sem log/telemetria) — decisão de arquitetura pendente, ver Seção 7 item 8
