# Handoff — Sprint 2 de Observabilidade do Portal DODÔ (Frontend)

> Handoff oficial desta sessão. Objetivo: permitir que a próxima sessão continue exatamente
> do ponto atual sem reler o histórico da conversa.

## 1. Objetivo da sessão

Executar a segunda sprint de evolução da observabilidade, agora no frontend, item 6+ do plano
técnico original (ver `docs/handoff/2026-08-06_sprint-observabilidade.md`, seção 8, risco 7).
Escopo fechado pelo usuário em 4 itens: `ErrorBoundary` global, captura de
`window.onerror`/`window.unhandledrejection`, ponto único de tratamento de erro (sem alterar
comportamento funcional), fim da tela branca silenciosa em erro de render. Sem telemetria
remota, sem Sentry/LogRocket, sem alterar UX além da tela de fallback do `ErrorBoundary`.

## 2. Fase 1 — Diagnóstico do estado do repositório (antes de qualquer código)

No início da sessão o repositório tinha alterações não commitadas pré-existentes. Todas já
estavam documentadas no handoff da Sprint 1 (seção 4) como fora de escopo; confirmadas de novo
nesta sessão e preservadas sem nenhuma alteração:

| Alteração | Classificação | Ação tomada |
|---|---|---|
| `portal-backend/src/modules/perfil/perfil.service.ts` | Outra tarefa (feature de perfil/parceira, SPEC-002 §6.2) | Preservada, intocada |
| `portal-frontend/src/pages/experimentos/{Financeiro,Hoje,Perfil}Influenciadora.tsx` | Experimento editorial (telas de proposta, não aprovadas) | Preservadas, intocadas |
| `.claude/jobs/936a57e7/` (~92MB, untracked) | Artefato de job de geração de imagem, não pertence à app | Preservado, intocado — cuidado extra: `git add` sempre por arquivo explícito nesta sessão, nunca `-A`, para não arrastar esse diretório |
| `docs/ssh-diagnostico-20260802-120813.txt` | Diagnóstico pré-existente não relacionado | Preservado, intocado |

Nenhum conflito de escopo identificado: nenhuma dessas alterações toca `App.tsx`, `main.tsx` ou
`lib/api.ts` — os únicos pontos onde esta sprint atuou.

## 3. Trabalhos realizados

1. **`portal-frontend/src/lib/errorReporting.ts`** (novo) — ponto único de captura de erros do
   frontend:
   - `relatarErroFrontend(contexto, erro, camposExtras?)` — loga com a mesma tag
     `[erro-nao-tratado]` já usada em `middleware/errorHandler.ts` no backend, para os dois
     lados ficarem correlacionáveis por grep. Só `console.error` — sem telemetria remota.
   - `instalarCapturaGlobalDeErros()` — registra `window.addEventListener("error", …)` e
     `window.addEventListener("unhandledrejection", …)` (não `window.onerror =`, para não
     sobrescrever outros consumidores desses eventos). Idempotente (guard interno), chamada
     uma única vez no boot.
2. **`portal-frontend/src/components/ErrorBoundary.tsx`** (novo) — Error Boundary de classe
   (única forma suportada pelo React) envolvendo `<App />` inteiro em `main.tsx`. Fallback
   reaproveita os componentes `Empty`/`Button` já existentes em `components/ui/` (mesmo padrão
   visual de outras telas de estado vazio/erro do Portal — nenhum componente novo de UI
   criado). Chama `relatarErroFrontend("react-render", erro, { componentStack })` em
   `componentDidCatch`.
3. **`portal-frontend/src/main.tsx`** — monta `<ErrorBoundary>` ao redor de
   `<BrowserRouter>`/`<SessionProvider>`/`<App>` e chama `instalarCapturaGlobalDeErros()` antes
   do `createRoot(...).render(...)`.
4. **Infra de teste do frontend** — antes desta sprint só existia um teste de lógica pura
   (`statusLabels.test.ts`), sem suporte a renderizar componentes React. Adicionado:
   - `jsdom` + `@testing-library/react` como devDependencies (só teste, não entram no bundle
     de produção — build de produção confirmado sem crescimento de bundle relacionado a elas).
   - `vitest.config.ts`: `environment: "jsdom"` + alias `@` → `src/` (espelhando
     `resolve.alias` do `vite.config.ts`, que o `vitest/config` não herda automaticamente).
5. **Testes novos** — `errorReporting.test.ts` (8 testes: formatação da tag, normalização de
   valor não-`Error`, campos extras, omissão de campo `undefined`, log do stack, os dois
   listeners globais disparando via evento real de `window`, idempotência) e
   `ErrorBoundary.test.tsx` (4 testes: renderização normal dos filhos, fallback quando um
   filho lança na renderização, chamada de `relatarErroFrontend` com o contexto correto, botão
   "Recarregar página" chamando `window.location.reload`).

## 4. Arquivos alterados

**Commit `b003082`** (branch `main`):
- `portal-frontend/src/lib/errorReporting.ts` (novo)
- `portal-frontend/src/lib/errorReporting.test.ts` (novo, 8 testes)
- `portal-frontend/src/components/ErrorBoundary.tsx` (novo)
- `portal-frontend/src/components/ErrorBoundary.test.tsx` (novo, 4 testes)
- `portal-frontend/src/main.tsx` (M) — monta `ErrorBoundary` + instala listeners globais
- `portal-frontend/vitest.config.ts` (M) — `environment: "jsdom"` + alias `@`
- `portal-frontend/package.json`, `portal-frontend/package-lock.json` (M) — `jsdom` e
  `@testing-library/react` como devDependencies

Nenhum outro arquivo do repositório foi tocado por esta sprint. As alterações pré-existentes
não relacionadas (seção 2 acima) seguem exatamente como estavam — não commitadas, não
revertidas. `lib/api.ts` (ponto único de log em `apiFetch`) permanece deliberadamente fora de
escopo — ver seção 8, risco 3.

## 5. Commits

Branch `main`:
- **`b003082`** — `feat(observability): sprint 2 — ErrorBoundary e captura global de erros no
  frontend`. **Deployado em produção.**

## 6. Validações realizadas

### Local (antes do commit)

| Checagem | Resultado |
|---|---|
| `npx tsc -b` (portal-frontend) | ✅ sem erros |
| `npm run build` (portal-frontend) | ✅ sem erros |
| `npx vitest run` (portal-frontend) | ✅ 29/29 testes, 3 arquivos (17 pré-existentes + 12 novos) |
| `npm run lint` (oxlint, portal-frontend) | ✅ só warnings pré-existentes em arquivos não tocados (`only-export-components`, shadcn) |
| Pre-commit hook (lint+build `app`/`portal-frontend`, typecheck+build `portal-backend`) | ✅ passou |

### Validação manual no navegador (Chrome, `npm run dev`, antes do commit)

1. **Tela normal sem regressão** — `/login` renderizado corretamente antes de qualquer teste
   de erro (screenshot conferido).
2. **`window.onerror`** — `setTimeout(() => { throw new Error(...) }, 0)` via console real do
   navegador → log confirmado: `[erro-nao-tratado] contexto=window-onerror … arquivo=…
   linha=…`.
3. **`unhandledrejection`** — `Promise.reject(new Error(...))` via console real → log
   confirmado: `[erro-nao-tratado] contexto=unhandled-rejection …`.
4. **`ErrorBoundary`** — erro de render forçado **temporariamente** (`throw new Error(...)` no
   topo de `LoginPage()`, revertido imediatamente após a captura da evidência —
   `git diff`/`git status` confirmam `Login.tsx` sem alteração residual): fallback "Algo deu
   errado" + botão "Recarregar página" renderizado em vez de tela branca; log confirmado:
   `[erro-nao-tratado] contexto=react-render … componentStack=at LoginPage (...)`.
5. **Recuperação** — nova navegação para `/login` após reverter o erro forçado volta ao
   comportamento normal (screenshot conferido).

### Achado real durante a validação manual (não corrigido, fora de escopo)

A instrumentação nova capturou, ainda na tela de login normal (sem nenhum erro forçado), duas
rejeições não tratadas reais e pré-existentes: `[erro-nao-tratado] contexto=unhandled-rejection
… mensagem="Failed to fetch"`. Origem: `useSession()` chamando `/auth/me` contra um backend que
não estava rodando durante o teste manual (só o frontend foi iniciado). É plausível que o mesmo
padrão ocorra em produção sempre que `apiFetch` falhar por rede sem um `.catch` no chamador —
exatamente o tipo de sinal que esta sprint deveria expor, não corrigir. Ver seção 8, risco 3.

### Produção — pós-deploy manual via SSH (commit `b003082`)

| Checagem | Resultado |
|---|---|
| `deploy/healthcheck.sh` | ✅ todas as 6 checagens passaram |
| Commit publicado na VPS == HEAD local | ✅ `b003082` nos dois lados |
| `GET /health` | ✅ `{"status":"ok","versao":"b003082"}` |
| Bundle JS de produção contém `erro-nao-tratado` e `Algo deu errado` | ✅ confirmado via `curl` no bundle publicado |
| PM2 (`portal-backend`) | ✅ `status=online`, reload sem erro |
| Nginx | ✅ configuração válida, recarregado |

Não foi feita validação manual do `ErrorBoundary` diretamente em produção (exigiria forçar um
erro de render num ambiente compartilhado) — a evidência de produção se apoia na presença
confirmada do código no bundle publicado + na suíte de 29 testes automatizados + na validação
manual completa feita em ambiente local antes do deploy.

## 7. Decisões técnicas registradas

1. **`addEventListener` em vez de `window.onerror =`/`window.onunhandledrejection =`** — o
   pedido do usuário citou os dois pela nomenclatura usual, mas a atribuição direta sobrescreve
   qualquer outro handler que já exista (extensão do navegador, outra lib). `addEventListener`
   captura os mesmos eventos sem esse risco.
2. **Sem `apiFetch` nesta sprint** — "centralizar o tratamento de erros em um único ponto" foi
   interpretado como centralizar os três caminhos que esta sprint introduz (render, window
   error, unhandled rejection) por trás de `relatarErroFrontend`, não como retrofitar todo
   tratamento de erro já existente no app. O handoff da Sprint 1 (seção 8, risco 7) já lista
   "ponto único de log em `apiFetch`" como item separado, ainda não priorizado — tocar em
   `apiFetch` afetaria todas as telas do Portal, escopo claramente maior do que o pedido desta
   sessão.
3. **`jsdom`/`@testing-library/react` como devDependencies novas** — o pedido do usuário veda
   telemetria remota e libs como Sentry/LogRocket (dependências de produção), não ferramenta de
   teste. Sem elas não é possível testar um Error Boundary de verdade (exige renderização real,
   não só chamar a função). Não afetam o bundle de produção (build de produção confirmado sem
   essas libs).

## 8. Riscos remanescentes

1. **CI da `main` segue bloqueada pelo outage do GitHub Actions** (mesmo incidente das duas
   sessões anteriores, confirmado ainda `major: Partial System Outage` e
   `run not acquired by Runner of type hosted` nesta sessão) — commit `b003082` deployado
   manualmente via SSH, mesmo procedimento das sessões anteriores. Nenhuma ação local acelera
   a resolução do outage.
2. **`ErrorBoundary` não validado diretamente em produção** (só localmente) — ver seção 6.
   Risco baixo: mesmo código buildado, mesma suíte de testes, presença confirmada no bundle
   publicado.
3. **`apiFetch` ainda sem ponto único de log** — decisão explícita (seção 7, item 2), mas
   significa que falhas de rede em chamadas de API que não tenham `.catch` no chamador só são
   capturadas via `unhandled-rejection` (funciona, mas sem o contexto estruturado que um
   tratamento dedicado em `apiFetch` daria, ex.: rota/método da chamada). O achado real da
   seção 6 (`Failed to fetch` em `useSession`) é evidência concreta de que esse gap existe hoje.
   Candidato natural para a próxima sprint.
4. **2 vulnerabilidades `high` pré-existentes** (`react-router`/`react-router-dom`, via `npm
   audit`) — não relacionadas a esta sprint, não introduzidas por ela (confirmado: mesmas 2
   antes e depois do `npm install` desta sessão). Correção exigiria upgrade com breaking change
   de `react-router-dom`, fora de escopo.
5. **Itens do plano técnico ainda não incluídos** (por escopo explícito do usuário): endpoint
   de telemetria de cliente, alerta automático sobre `[erro-nao-tratado]`, métricas/dashboards,
   ponto único de log em `apiFetch` (risco 3 acima) — seguem aguardando priorização de uma
   próxima sprint.
6. **Itens já conhecidos da Sprint 1, ainda pendentes** (não tocados nesta sessão): compressão
   do `pm2-logrotate` não confirmada funcionando, configuração do `pm2-logrotate` não
   versionada no repositório.

## 9. Plano de rollback

- **`b003082` (sprint 2, já em produção):** aditivo em quase toda parte (dois arquivos novos,
  `main.tsx` só ganha um wrapper + uma chamada de boot, `vitest.config.ts` só ganha config de
  teste). Nenhuma rota, endpoint ou contrato de API muda. Se necessário: `git revert b003082`,
  push, redeploy manual (comando abaixo) ou via CI quando o outage passar.
- **Mecanismo de deploy de emergência (mesmo das sessões anteriores):**
  ```
  ssh dodo "sudo -u dodo -i bash -c 'cd /opt/dodo-portal && git checkout <commit> && ./deploy/deploy.sh && ./deploy/healthcheck.sh portal.criativododo.com.br'"
  ```

## 10. Estado final

- **Itens 1-4 do escopo desta sprint:** ✅ implementados (TDD — testes escritos antes da
  implementação), testados (29/29), commitados, deployados e validados (local completo +
  produção parcial, ver seção 6).
- **Nenhuma UX alterada além da tela de fallback do `ErrorBoundary`** — confirmado por: suíte
  completa sem nenhuma asserção de outras telas quebrada, validação manual do `/login` normal
  antes e depois do teste de erro forçado.
- **Nenhuma telemetria remota, nenhuma lib de produção nova** — confirmado por: `package.json`
  só ganhou devDependencies; bundle de produção buildado e conferido.
- **CI oficial:** ⏳ segue bloqueada pelo outage do GitHub Actions — causa externa, já
  investigada e documentada nas sessões anteriores e nesta.
- **Bloqueio para a próxima sessão:** nenhum bloqueio técnico. Próximo passo natural: ponto
  único de log em `apiFetch` (risco 3) — já tem evidência real e concreta desta sessão
  justificando a priorização — ou os itens 6 da Sprint 1 ainda pendentes (seção 8, risco 6).

## 11. Checklist

- [x] Fase 1 — diagnóstico completo do repositório, classificação de cada alteração,
      confirmação de ausência de risco de conflito
- [x] TDD — testes escritos antes da implementação para `errorReporting.ts` e `ErrorBoundary.tsx`
- [x] `ErrorBoundary` global implementado
- [x] Captura de `window.onerror`/`window.unhandledrejection` implementada
- [x] Tratamento de erro centralizado em `relatarErroFrontend` (mesma tag do backend)
- [x] Tela branca silenciosa eliminada em erro de render (confirmado manualmente)
- [x] Sem telemetria remota, sem Sentry/LogRocket, sem alteração de UX além do fallback
- [x] Build, typecheck, testes (29/29), lint verdes localmente e no pre-commit hook
- [x] Validação manual completa no navegador (normal, window-onerror, unhandled-rejection,
      react-render, recuperação) — erro forçado revertido, sem alteração residual
- [x] Commit isolado (`b003082`) sem tocar nas alterações pré-existentes não relacionadas
- [x] Push realizado
- [x] Deploy manual via SSH (outage do GitHub Actions segue ativo) — commit `b003082`
- [x] Healthcheck, commit == HEAD, `/health` com versão, bundle de produção conferido
- [x] Este handoff produzido
- [ ] Alterações pré-existentes não relacionadas (`perfil.service.ts`, 3 telas de
      `experimentos/`, `.claude/jobs/`, `docs/ssh-diagnostico-...txt`) seguem não commitadas —
      decisão de quando/se commitá-las pertence a quem as iniciou, fora do escopo desta sprint
- [ ] Ponto único de log em `apiFetch` — próximo candidato natural (risco 3)
- [ ] CI da `main` com execução verde — pendente, bloqueado pelo outage do GitHub, sem ação
      local possível
