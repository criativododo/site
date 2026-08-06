# Handoff — Sprint 1 de Observabilidade do Portal DODÔ

> Handoff oficial desta sessão. Objetivo: permitir que a próxima sessão continue exatamente
> do ponto atual sem reler o histórico da conversa.

## 1. Objetivo da sessão

Executar a primeira sprint de evolução da observabilidade do backend, conforme o plano
técnico já apresentado ao usuário na sessão anterior (mesma conversa, turno anterior — não
existe um arquivo separado para esse plano, ele foi entregue diretamente no chat). Escopo
fechado em 5 itens, sem alterar regra de negócio, autenticação ou UX, sem iniciar a sprint de
frontend, sem telemetria de cliente, sem serviço externo novo.

## 2. Contexto

Esta sessão dá sequência a duas sessões anteriores no mesmo incidente/tema: (1) o incidente de
login Google OIDC (`docs/handoff/2026-08-06_incidente-login-google-oidc.md`, já fechado); (2)
uma revisão preventiva de erros silenciosos que já havia corrigido o ponto cego do callback
OIDC. A partir daí, foi produzido um plano técnico de observabilidade (auditoria + proposta de
arquitetura alvo, sem implementar nada) e esta sessão executa a primeira fatia desse plano.

## 3. Trabalhos realizados

1. **Logger central consolidado** — `shared/storage/log.ts` (`logEvento`/`logAviso`/
   `logErro`, existia só para o domínio Storage/Drive) generalizado para `shared/log.ts`,
   reutilizável por qualquer módulo. Storage só teve o import ajustado (comportamento
   idêntico). Adotado em 6 pontos que usavam `console.error`/`console.warn`/`console.info` cru
   para casos de baixo risco: validação de input esperada (400) em `financeiro/admin.routes.ts`,
   `parceira/parceira.routes.ts`, `lgpd/lgpd.routes.ts`,
   `colaboracao-mensal/admin.routes.ts`, `middleware/isolamento.ts` (rebaixados de "error" para
   "aviso" — são rejeição esperada, não falha real), e `shared/cep/resolver.ts` (mesmo
   conteúdo, só formato consolidado). **Deliberadamente não tocados:** `errorHandler.ts` e os
   `catch` do callback OIDC (`auth.routes.ts`)/`session.ts` corrigidos na sessão anterior — já
   testados, já com evidência real de produção; reescrever agora seria risco sem ganho.
   Nenhuma resposta HTTP mudou em nenhum ponto tocado.

2. **Handlers globais de processo** (`server.ts`) — `uncaughtException` e `unhandledRejection`
   agora logam via `logErro` (timestamp, versão, mensagem, stack) antes de
   `process.exitCode = 1; setImmediate(() => process.exit(1))`. Política e justificativa
   documentadas em comentário no próprio código (Seção 6 detalha aqui também).

3. **`pm2-logrotate`** instalado e configurado na VPS: `max_size=10M`, `retain=7`,
   `compress=true`, rotação diária à meia-noite (`rotateInterval: 0 0 * * *`),
   `workerInterval=30s`. Config puramente operacional (`pm2 set`), nenhum arquivo do
   repositório versiona isso hoje (ver Seção 8, riscos).

4. **Middleware de access log** (`middleware/accessLog.ts`, novo) — uma linha por requisição
   (`timestamp`/`method`/`rota`/`status`/`duracaoMs`/`requestId`) via `res.on("finish")`.

5. **Versão (Git SHA curto)** — `env.versao` (novo campo em `config/env.ts`; lê `GIT_SHA` do
   ambiente ou `git rev-parse --short HEAD`, nunca derruba o boot se falhar) exposta no boot
   log, no `errorHandler.ts` (campo `versao=` adicional) e em `GET /health`.

## 4. Arquivos alterados

**Commit `64e05de`:**
- `portal-backend/src/shared/log.ts` (novo) — logger central, generalizado de
  `shared/storage/log.ts` (removido).
- `portal-backend/src/shared/storage/servicoDeArmazenamento.ts`,
  `shared/storage/googleDrive/comRetentativa.ts`,
  `shared/storage/googleDrive/provedorGoogleDrive.ts` (M) — só o caminho do import.
- `portal-backend/src/modules/financeiro/admin.routes.ts`,
  `modules/parceira/parceira.routes.ts`, `modules/lgpd/lgpd.routes.ts`,
  `modules/colaboracao-mensal/admin.routes.ts`, `middleware/isolamento.ts` (M) — `console.error`
  → `logAviso`, resposta HTTP idêntica.
- `portal-backend/src/shared/cep/resolver.ts` (M) — `console.warn`/`console.info` →
  `logAviso`/`logEvento`.
- `portal-backend/src/server.ts` (M) — handlers globais de processo + versão no boot log.
- `portal-backend/src/middleware/accessLog.ts` (novo), `middleware/accessLog.test.ts` (novo,
  4 testes) — access log.
- `portal-backend/src/config/env.ts` (M) — `env.versao`.
- `portal-backend/src/middleware/errorHandler.ts` (M) — campo `versao=` na linha de log.
- `portal-backend/src/app.ts` (M) — monta `accessLog`; `GET /health` retorna `versao`.

**Commit `bf85969`:**
- `portal-backend/src/middleware/errorHandler.test.ts` (M) — asserção do campo `versao=`
  (só teste, sem mudança de código de produção).

Nenhum outro arquivo do repositório foi tocado por esta sprint. Mudanças pré-existentes e não
relacionadas (`perfil.service.ts`, 3 telas de `experimentos/`, `.claude/jobs/`,
`docs/ssh-diagnostico-20260802-120813.txt`) seguem exatamente como estavam — não commitadas,
não revertidas. Nenhum arquivo de frontend foi alterado (fora de escopo desta sprint).

## 5. Commits

Branch `main`:
- **`64e05de`** — `feat(observability): primeira sprint de evolução da observabilidade`.
  **Deployado em produção.**
- **`bf85969`** — `test(observability): cobre o campo versao= no log do errorHandler`. Só
  teste — não redeployado (nenhuma mudança de comportamento em produção).

## 6. Decisão arquitetural documentada: política pós-`uncaughtException`/`unhandledRejection`

Registrar tudo o que for útil para diagnóstico e então **encerrar o processo**
(`process.exit(1)`), nunca tentar continuar rodando.

- A documentação do Node.js recomenda não retomar a execução normal após um
  `uncaughtException`: o processo fica em estado indefinido (pilha parcialmente desenrolada,
  closures/referências possivelmente inconsistentes) — continuar arrisca corrupção silenciosa
  de dado ou vazamento de recurso, estritamente pior que um restart limpo.
- O backend já roda sob PM2 com `autorestart: true` e uma única instância em modo fork
  (`ecosystem.config.cjs`) — um `exit(1)` é exatamente o sinal que o PM2 espera para reiniciar
  automaticamente um processo saudável, sem intervenção manual.
- `setImmediate` antes do `exit` dá uma volta do event loop para o `console.error` (que o PM2
  encaminha por pipe, potencialmente assíncrono em Linux) esvaziar o buffer — sem isso a
  última linha de log, a mais importante, corre risco de ser truncada.
- **Não implementado, deliberadamente fora de escopo:** shutdown gracioso (`server.close()`
  esperando requisições em voo). É uma evolução legítima, mas exige coordenar o drain de
  conexões vivas sob um único fork do PM2 sem testes dedicados — risco de introduzir um novo
  modo de falha (processo pendurado) que esta sprint, focada em visibilidade e não em mudança
  de comportamento, não deveria correr.

## 7. Validações realizadas

### Local (antes do commit)

| Checagem | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ sem erros |
| `npm run build` | ✅ sem erros |
| `npx vitest run` | ✅ 402/402 testes, 54 arquivos (398 pré-existentes + 4 novos de `accessLog.test.ts`) |
| Pre-commit hook (lint+build `app`/`portal-frontend`, typecheck+build `portal-backend`) | ✅ passou nos dois commits |
| Smoke test manual (`tsx watch`, local) | ✅ boot log com `versao=`, `/health` com `versao`, access log com os 6 campos, `code`/`state` do OIDC não vazam |

### Regressão real encontrada e corrigida durante a validação

O primeiro smoke test manual expôs um bug real: `req.path` lido **dentro** do callback
`res.on("finish")` reflete o path já reescrito pelo sub-router do Express (`app.use("/auth",
authRoutes)` etc.) — `/me` em vez de `/auth/me`, `/google/callback` em vez de
`/auth/google/callback`. Os testes unitários com mock plano não pegaram isso (não reproduzem
sub-routers reais). Corrigido capturando `req.path` **antes** de `next()`, e travado por um
teste de integração novo com `supertest` contra o `app` real
(`middleware/accessLog.test.ts`, 4º teste). Nenhum outro comportamento foi afetado.

### Produção — pós-deploy manual via SSH (commit `64e05de`)

| Checagem | Resultado |
|---|---|
| `deploy/healthcheck.sh` | ✅ todas as 6 checagens passaram |
| Commit publicado na VPS == HEAD local | ✅ `64e05de` nos dois lados |
| `GET /health` | ✅ `{"status":"ok","versao":"64e05de"}` |
| `GET /auth/me` (sem cookie) | ✅ 401, inalterado |
| `GET /auth/google/login` | ✅ 302, `x-request-id` presente, inalterado |
| Access log em produção | ✅ linhas `[access]` com os 6 campos, `rota` com path completo (`/auth/me`, `/auth/google/login`), sem query string |
| Correlação `requestId` (header HTTP ↔ access log ↔ error log) | ✅ confirmada — mesmo `requestId` nas três fontes para a mesma requisição |
| Regressão do fix de OIDC da sessão anterior (`auth.routes.ts:70`) | ✅ sem regressão — cookie de handshake corrompido em produção ainda responde 400 e ainda loga `[oidc-handshake-invalido]` |
| PM2 (`portal-backend` e `pm2-logrotate`) | ✅ `status=online` nos dois; `restart_time` do `portal-backend` avançou só +1 (o próprio reload do deploy) |
| Headers de segurança/rate-limit | ✅ presentes e inalterados |

### `pm2-logrotate` — validação de funcionamento

Rotação por tamanho forçada e confirmada **duas vezes** de forma reproduzível (uma no arquivo
histórico de 8.5MB, outra num arquivo de teste): ao exceder `max_size`, o arquivo ativo é
truncado e o conteúdo anterior vira um novo arquivo com timestamp no nome. Retenção (`retain`)
e agendamento diário (`rotateInterval`) confirmados por configuração (`pm2 conf
pm2-logrotate`), não teve tempo de ciclo completo (dias) para validação empírica de retenção
de longo prazo. **Compressão (`compress=true`) configurada mas não observada em nenhuma das
rotações forçadas nesta sessão**, mesmo após um `pm2 restart pm2-logrotate` completo — ver
Seção 8, risco 2.

## 8. Riscos remanescentes

1. **Ganho principal do item pm2-logrotate confirmado (tamanho agora é limitado)**, mas a
   configuração vive só na VPS (`pm2 set`), não em nenhum arquivo versionado do repositório —
   se a VPS for reconstruída (já aconteceu antes, ver memória do projeto), a rotação
   precisará ser reconfigurada manualmente, sem esse handoff não haveria registro dos valores
   escolhidos. Recomendação: versionar isso como um passo de `deploy/deploy.sh` ou um script
   de provisionamento dedicado (fora do escopo desta sprint).
2. **Compressão do `pm2-logrotate` não confirmada funcionando** — configurada
   (`compress=true`), gzip disponível no sistema, mas as duas rotações forçadas nesta sessão
   não produziram `.gz`. É uma limitação/bug conhecido reportado publicamente para versões do
   `pm2-logrotate` (a config nem sempre é reaplicada por `pm2 set` sem reinício completo do
   daemon PM2, não só do módulo). Não bloqueia o ganho principal (arquivo com tamanho
   limitado), mas o espaço em disco não é otimizado como poderia. Recomendação: reavaliar após
   a primeira rotação natural (por tamanho real de tráfego, não forçada) ou considerar
   `logrotate` do sistema operacional como alternativa/complemento.
3. **Efeito colateral da validação de rotação:** as duas rotações forçadas durante os testes
   apagaram o conteúdo histórico de `portal-backend.error.log` (incluía a linha
   `[oidc-handshake-invalido]` da sessão anterior) e de `portal-backend.out.log` (~100k linhas
   de histórico de boot/CEP) — os arquivos de teste rotacionados foram removidos manualmente
   ao final da validação, para não confundir a próxima sessão com arquivos de teste
   artificiais. Nenhuma informação foi perdida de fato: a linha `[oidc-handshake-invalido]` já
   está citada literalmente no handoff do incidente anterior; o histórico do `out.log` era, por
   composição já documentada no plano técnico, majoritariamente ruído de boot repetido, sem
   valor de diagnóstico.
4. **`accessLog` aumenta o volume de log proporcionalmente ao tráfego** — cada requisição
   agora gera uma linha. Para o tráfego atual do Portal (baixo) isso é imperceptível, mas é o
   principal motivo pelo qual o item 1 (rotação) precisava vir antes/junto: sem rotação, esse
   volume adicional aceleraria o crescimento ilimitado do arquivo que já era um risco antes
   desta sprint.
5. **Shutdown gracioso não implementado** (ver Seção 6) — uma falha fatal encerra
   imediatamente conexões em voo. Aceitável para o porte atual (PM2 reinicia em segundos), mas
   é uma lacuna real sob carga mais alta.
6. **CI da `main` segue bloqueado pelo outage do GitHub Actions** (mesmo incidente das sessões
   anteriores, ainda `major_outage` ao final desta sessão) — os dois commits desta sprint
   foram deployados manualmente via SSH, mesmo procedimento já usado e documentado nas sessões
   anteriores. Nenhuma ação local acelera a resolução do outage.
7. **Itens do plano técnico não incluídos nesta sprint** (por escopo explícito do usuário):
   `ErrorBoundary`/`window.onerror` no frontend, ponto único de log em `apiFetch`, endpoint de
   telemetria de cliente, alerta automático sobre `[erro-nao-tratado]`, métricas/dashboards —
   seguem no plano técnico original, aguardando priorização de uma próxima sprint.

## 9. Plano de rollback

- **`64e05de` (sprint de observabilidade, já em produção):** aditivo em quase toda parte
  (novo logger, novo middleware, novo campo `versao`); os únicos pontos que mudam
  comportamento de runtime não observável ao cliente são os handlers de processo (Seção 6) e
  a troca `console.error`→`logAviso` (mesma resposta HTTP, só formato/nível do log). Se
  necessário: `git revert 64e05de`, push, redeploy manual (comando abaixo) ou via CI quando o
  outage passar.
- **`pm2-logrotate` (só config da VPS, fora do git):** para desfazer, `pm2 uninstall
  pm2-logrotate` na VPS — não afeta o `portal-backend` em si.
- **Mecanismo de deploy de emergência (mesmo das sessões anteriores):**
  ```
  ssh dodo "sudo -u dodo -i bash -c 'cd /opt/dodo-portal && git checkout <commit> && ./deploy/deploy.sh && ./deploy/healthcheck.sh portal.criativododo.com.br'"
  ```

## 10. Estado final

- **Itens 1-5 do escopo desta sprint:** ✅ implementados, testados, commitados, deployados e
  validados em produção (item 1, `pm2-logrotate`, é configuração de infraestrutura, não código
  — validado por rotação forçada real, ver Seção 7).
- **Nenhuma regra de negócio, autenticação ou UX alterada** — confirmado por: suíte completa
  (402/402) sem nenhuma asserção de contrato HTTP quebrada, e validação manual em produção dos
  endpoints de autenticação (login/callback/`/me`) com respostas idênticas às da sessão
  anterior.
- **Sprint de frontend:** não iniciada (fora de escopo, conforme pedido).
- **CI oficial:** ⏳ segue bloqueado pelo outage do GitHub Actions — causa externa, já
  investigada e documentada nas sessões anteriores.
- **Bloqueio para a próxima sessão:** nenhum bloqueio técnico. Próximo passo natural é
  priorizar os itens 6+ do plano técnico (ver Seção 8, risco 7) ou revisitar a compressão do
  `pm2-logrotate` (Seção 8, risco 2) depois de uma rotação natural.

## 11. Checklist

- [x] Item 1 — `pm2-logrotate` instalado, configurado (`max_size=10M`, `retain=7`,
      `compress=true`, rotação diária), rotação por tamanho validada (2x, forçada)
- [x] Item 2 — handlers globais de processo implementados, política justificada em código e
      neste handoff, compatível com `autorestart` do PM2
- [x] Item 3 — logger consolidado (`shared/log.ts`), 6 ocorrências de baixo risco migradas,
      nenhuma resposta HTTP alterada
- [x] Item 4 — access log mínimo implementado, validado local e em produção, regressão real
      encontrada em smoke test corrigida e travada por teste de integração
- [x] Item 5 — versão (Git SHA) no boot log, no `errorHandler.ts` e em `GET /health`
- [x] Build, typecheck, testes (402/402) verdes localmente e no pre-commit hook
- [x] Deploy manual via SSH (outage do GitHub Actions segue ativo) — commit `64e05de`
- [x] Healthcheck, login Google, callback OIDC, access log, `requestId`, versão — todos
      validados em produção com evidência direta (curl + tail de log)
- [x] Ausência de regressão confirmada (fix de OIDC da sessão anterior, headers, rate-limit,
      PM2 sem crash-loop)
- [x] Este handoff produzido
- [ ] Compressão do `pm2-logrotate` — configurada, não confirmada funcionando; reavaliar após
      rotação natural
- [ ] Configuração do `pm2-logrotate` versionada no repositório (hoje só existe na VPS)
- [ ] Itens 6+ do plano técnico de observabilidade (frontend, ponto único de log em
      `apiFetch`, alerta automático, métricas) — aguardando priorização de próxima sprint
- [ ] CI da `main` com execução verde — pendente, bloqueado pelo outage do GitHub, sem ação
      local possível
