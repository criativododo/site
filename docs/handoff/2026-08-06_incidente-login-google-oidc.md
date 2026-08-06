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
| 2026-08-06 14:08–14:21 | Outage do GitHub **ainda ativo** — CI `31122222830` segue `queued` |
| 2026-08-06 14:20:52–14:21:07 | Revalidação final desta sessão: produção estável em `52bfe81`, healthcheck/login/headers/cookies OK (Seção 6); suíte local (398/398), typecheck, build e lint revalidados para `f0cb58d` (ainda não deployado) |
| 2026-08-06 14:23:28 | CI `31122222830` conclui `failure` — **confirmado como cancelamento por outage, não regressão real**: os 3 jobs (`landing`, `portal-backend`, `portal-frontend`) foram `cancelled` com `steps: []` (nenhum passo chegou a rodar — não é falha de lint/typecheck/build/teste) |
| 2026-08-06 14:23:28 (checagem seguinte) | `githubstatus.com` ainda reporta Actions/Pages em `major_outage` — nova rodada de monitoramento em segundo plano iniciada para reexecutar assim que normalizar |
| 2026-08-06 (nova rodada, a pedido do usuário) | Investigação formal, sem assumir outage: `gh auth status`, usuário/org, remote, workflows/estado, últimos 20 runs via API, branch protection/rulesets, Actions habilitado, concorrência — todas as hipóteses locais descartadas com evidência. Confirmado via `githubstatus.com/api/v2/incidents/unresolved.json`: incidente oficial "Incident with Actions", impacto `critical`, aberto às 15:22:49Z, update das 17:02:43Z cita literalmente "queued jobs may time out" — bate exatamente com o sintoma observado. Achado colateral não relacionado: `notebooklm-sync.yml` falha com `0 jobs` (startup failure) em todo push, inclusive antes do outage — pré-existente, fora de escopo |
| 2026-08-06 15:00–15:05 (-03) | Dois subagentes em paralelo: (1) investigação read-only do fluxo de log + busca por outros pontos cegos; (2) deploy manual do HEAD atual de `main` (commit `02097c3`, inclui `f0cb58d`), repetindo o mesmo comando SSH já pré-aprovado. Deploy: **SUCESSO COMPLETO** — healthcheck 6/6, HEAD da VPS == HEAD local, `/auth/google/login` 302, `/health` 200, `/auth/me` 401, header `x-request-id` presente (prova de que o código novo está de fato rodando) |
| 2026-08-06 15:07 (-03) | Validação final independente do coordenador (eu): commit VPS confirmado de novo, PM2 `online` (sem crash-loop, `restart_time` avançou só +2 pelos dois reloads desta sessão), `/auth/google/login`/`/health`/`x-request-id` reconfirmados, log de erro sem entrada `[erro-nao-tratado]` ainda (esperado — nenhum erro real ocorreu desde o redeploy) |

## 4. Commits

Branch `main`:

- **`52bfe81`** — `fix(auth): impede que falha transitória no discovery OIDC do Google trave login para sempre`. **Deployado em produção** (deploy manual, ver Seção 3).
- **`f0cb58d`** — `fix(observability): handler global de erros passa a logar sempre, com contexto estruturado`. **Deployado em produção** via SSH (mesmo commit publicado como parte do HEAD `02097c3`, ver Seção 3).
- **`81608bb`**, **`02097c3`** — `docs(handoff): ...` (este próprio documento, criado e depois atualizado com a conclusão do CI cancelado por outage). Documentação apenas, sem código.

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

## 7. Riscos remanescentes

1. **Ponto cego real ainda não corrigido (achado do Subagente 1, novo, mais importante desta
   rodada): `portal-backend/src/modules/identidade/auth.routes.ts:121`.** O
   `catch { res.status(401).json(...) }` do `GET /auth/google/callback` engole qualquer erro
   do fluxo de troca de código/validação de claims/`resolverOuCriarIdentidade` **sem nenhum
   log** — nem `console.error`, nem `logErro`. Mesmo já com `f0cb58d` em produção, um erro
   real *nesta rota específica* nunca chega ao `errorHandler.ts` (é capturado antes) e
   continua invisível — é a mesma família de bug que causou todo este incidente, só que uma
   etapa adiante do fluxo (callback, não o discovery inicial de `/google/login`, que não tem
   try/catch e por isso passou a ser coberto pelo fix). Menor, mesmo padrão:
   `auth.routes.ts:70` (`catch {}` no parse do cookie de handshake). **Não corrigido nesta
   sessão** — está fora do escopo da pendência "corrigir observabilidade" (que era
   especificamente o handler global), registrado aqui como próximo item natural, não como
   bug ainda ativo/urgente (o resto de `portal-backend/src` foi varrido por `isProduction`/
   catches vazios e não tem outro ponto cego — os únicos `catch` genéricos restantes já usam
   `logErro`/`logAviso` estruturados de `shared/storage/log.ts`).
2. **CI da `main` está com histórico vermelho** — os runs `31120506716` e `31122222830`
   concluíram `failure` (cancelados pelo outage confirmado, não por regressão real — ver
   Seção 3). Fica assim até uma execução bem-sucedida depois que o outage passar.
3. **Outage do GitHub (Actions + Pages) é uma dependência externa sem ETA conhecido** —
   confirmado como incidente oficial do GitHub (não hipótese), continua bloqueando o
   pipeline oficial (CI→Deploy) enquanto durar.
4. **Confirmação com erro real ainda pendente** — o mecanismo de log foi validado por
   código+config+analogia (Seção 6), não por um `[erro-nao-tratado]` observado ao vivo. Sem
   urgência (a stack está corretamente instrumentada), mas é o último passo de evidência que
   falta.
5. **Gatilho de primeira ordem do incidente original não identificado com certeza** — não se
   sabe exatamente qual evento causou a falha transitória de discovery. Não bloqueia o fix
   (robusto a qualquer causa transitória), só significa que o mesmo gatilho externo pode se
   repetir — agora o sistema se recupera sozinho em vez de travar permanentemente.
6. **Falta de alerta automático** — não existe mecanismo que notifique um humano quando
   `[erro-nao-tratado]` aparecer no log; a descoberta continua dependendo de alguém olhar.
   Fora do escopo pedido (só log, não alerta).

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
- **Observabilidade (causa raiz secundária, handler global):** ✅ corrigida em código **e**
  ✅ **deployada e validada em produção** (commit `02097c3`, header `X-Request-Id` confirmado
  ao vivo).
- **Ponto cego adjacente (`auth.routes.ts:121`/`:70`):** ⏳ identificado, não corrigido —
  registrado como próximo passo (Seção 7, item 1), fora do escopo desta pendência específica.
- **CI oficial:** ⏳ bloqueado por incidente global confirmado do GitHub ("Incident with
  Actions", `critical`, aberto 15:22:49Z) — causa externa, investigada e comprovada por
  evidência de primeira mão (não suposição), todas as hipóteses locais (auth, remote,
  workflow desabilitado, branch protection, concorrência) descartadas com evidência própria.
- **Bloqueio para a próxima sessão:** nenhum bloqueio técnico no Portal em si — depende só da
  recuperação do GitHub Actions (externa, fora de controle) para o pipeline oficial voltar a
  ficar verde. Nenhuma ação local pode acelerar isso.

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
- [ ] `auth.routes.ts:121`/`:70` — ponto cego de observabilidade no callback OIDC, identificado nesta sessão, não corrigido (próximo passo natural, ver Seção 7)
- [ ] Confirmação com um `[erro-nao-tratado]` real observado ao vivo em produção (mecanismo validado, evento real ainda não ocorreu)
- [ ] CI da `main` com execução verde — pendente, bloqueado pelo outage do GitHub, sem ação local possível
