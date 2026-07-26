# ESTADO DA SESSÃO

> Snapshot enxuto do estado **atual** do projeto — nunca um diário de
> bordo. Este documento é **sempre reescrito por completo** a cada
> `/fim` (nunca acrescentado). Histórico narrativo, riscos detalhados,
> checklists completos e prompts de handoff anteriores vivem em
> `docs/_workspace/logs/` — ver "Links para logs relacionados" no final.
> Dependências entre SPECs continuam em `docs/_workspace/TASK_ROUTER.md`.

**Última atualização:** 2026-07-25

---

## Situação atual

- **Projeto:** DODÔ (nome oficial desde `ADR-020`). Plataforma
  **Influencia**. Produção alvo: `criativododo.com.br` /
  `portal.criativododo.com.br` (Locaweb Hospedagem II). Ambiente legado
  (`estudioela.com`/`elafashionmkt.com.br`) congelado.
- **Branch:** `docs/governance-phase2`, 11 commits à frente de `origin`,
  0 atrás. PR #77 aberta, sem mudança de status. Nenhum push feito ainda.
- **Fase corrente: Design System oficializado, aguardando aprovação para
  implementar.** O **Manual de Design DODÔ v1.0**
  (`docs/design/manual/index.html` + `.pdf`) é agora a SSOT visual
  oficial do projeto — consolida Brand Foundations v0.1, o import Stitch
  de 25/07 e os ativos válidos do bundle anterior, com o racional de
  cada decisão, não só o valor. `ADR-019` foi reescrita e commitada,
  formalizando essa decisão e resolvendo a contradição pendente desde o
  `§71`/`§72` do `TASK_ROUTER.md` (ADR nomeava a geração de paleta
  errada). As três gerações anteriores de Design System foram arquivadas
  em `docs/design/archive/` (git history preservado, nada apagado).
  Commit único `d08e8fd`, confirmado sem nenhuma alteração funcional de
  `frontend/`/`backend/` misturada.
- **Implementação no React: NÃO iniciada, aguardando aprovação
  explícita do responsável.** Auditoria completa (3 frentes: componentes
  compartilhados, telas admin, telas públicas/portal) já feita, plano em
  6 sprints em `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`.
  Nenhum componente foi tocado.
- **Paleta (fato já resolvido, não é mais pendência):** laranja `#f14f28`
  como `--color-action` (primária), roxo `#504ea1` como `--color-highlight`
  (secundária), em `frontend/src/theme/tokens.css` (ainda não commitado —
  ver "Pendências"). O app React é a base de implementação; o Manual
  documenta o porquê de cada valor, não substitui o código.
- Existe uma frente paralela mais antiga e menos detalhada sobre o mesmo
  tema — `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md` — ainda não
  reconciliada com o novo `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`.
  Os dois cobrem território sobreposto; qual prevalece (ou como
  fundi-los) não foi decidido nesta sessão.

## Objetivos

1. Migrar o legado (planilha + Apps Script) para a V3 (Laravel + React +
   PostgreSQL), com domínio soberano em
   `docs/history/CONTRATO_SOBERANO.md`.
2. Implementar o Manual de Design DODÔ v1.0 no frontend React,
   incrementalmente, seguindo `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`,
   sem regressão visual/funcional.
3. Publicar o DODÔ em produção na Locaweb Hospedagem II, hoje bloqueado
   por SSH (porta 22) e por uma configuração de painel pendente do
   responsável.

## Próxima missão recomendada

1. **Responsável revisa `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`
   por completo** — é o bloqueio explícito antes de qualquer código.
2. **Após aprovação, iniciar Sprint 1** (tipografia — remover
   `text-transform: uppercase` indevido de ~7 componentes/telas, corrigir
   fonte do `Button`): risco mínimo, maior alcance do plano. Execução
   futura deve usar paralelização por frente (tokens/componentes base,
   admin, portal, QA) sob um único integrador, conforme já registrado no
   próprio plano.
3. **Antes do Sprint 5 do plano (curvatura):** responsável precisa
   decidir a escala numérica de radius para a evolução de cards/
   containers/painéis — hoje só existe o princípio (proximidade humana
   como critério primário), sem token fechado.
4. **Reconciliar** `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md` com
   `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md` — território
   sobreposto, não decidido nesta sessão.

Frentes paralelas herdadas, nenhuma priorizada — perguntar ao
responsável antes de retomar:

5. Retorno do chamado Locaweb sobre a porta 22 SSH.
6. Revisão do briefing de UX (`docs/_workspace/UX/
   BRIEFING_TELAS_E_COMPONENTES_DODO.md`) pelo responsável.
7. Preparação de deploy do DODÔ (SSH bloqueado, PostgreSQL na
   Hospedagem II não confirmado, subdomínio com tipo errado no painel).

## Pendências/bloqueios

- **Aprovação do `PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`** — bloqueia
  todo o Sprint 1 em diante.
- **Decisão de escala numérica de radius/curvatura** — bloqueia só o
  Sprint 5 do plano.
- **Decisão de design pendente (Sprint 2 do plano):** fila de aprovação
  de `MateriaisPage` tem um CTA "aprovar" primário por item pendente —
  colide com a regra de um CTA único; precisa de decisão de design, não
  é fix de token.
- `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md` vs.
  `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md` — sobreposição não
  reconciliada.
- `frontend/src/theme/tokens.css` e ~54 arquivos de `frontend/` com a
  paleta nova aplicada, **ainda não commitados** — trabalho de sessão(ões)
  anterior(es), intocado nesta sessão, deliberadamente fora do commit de
  Design System desta sessão.
- SSH porta 22 na Locaweb em timeout, sem ETA — bloqueia
  `migrate`/cache/`admin:create`/crontab mesmo com contingência FTP.
- Revisão e aprovação do briefing de UX pendente — nenhuma tela/
  componente do briefing deve ser implementada sem essa aprovação.
- Disponibilidade real de PostgreSQL na Hospedagem II não confirmada.
- Subdomínio `portal.criativododo.com.br` com tipo "Apontamento" —
  precisa virar "Conteúdo da pasta" no painel antes do deploy
  funcionar; ação exclusiva do responsável.
- Push dos 11 commits locais para `origin` — nenhum push feito.
- Validação visual de telas autenticadas do React — só login validado
  ao vivo (herdado de sessão anterior, não verificado nesta sessão).
- **Arquivo sensível não rastreado na raiz:** `IMPORTANTE
  Webmail_Codigos_de_backup.txt` — não deve ir para nenhum commit.
- Arquivos não rastreados herdados de sessões paralelas
  (`backend/.env.backup-*`, `DOCS_INVENTARIO.txt`, `ESTADO_SESSAO.backup.md`,
  `provisorios/`, `skills-dodo/`) — sinalizados para o responsável
  decidir, não tocados.
- Riscos detalhados e achados de sessões anteriores:
  `docs/_workspace/logs/2026-Rebranding-DODO.md` e `TASK_ROUTER.md`
  (§45–§74).

## Últimos commits relevantes

- `d08e8fd` docs(design): consolidar Manual de Design DODÔ v1.0 como
  SSOT visual
- `edb14ad` docs(_workspace): consolidar fechamento da reorganização
  documental (commit 36ab33d)
- `36ab33d` docs(_workspace): reorganizar ESTADO_SESSAO.md como snapshot
  enxuto e criar docs/_workspace/logs/
- `3812c37` feat(design-system): importar Design System DODÔ do Stitch
  com equivalência semântica de tokens
- `786a259` docs(governance): aplicar ADR-020 (nome DODÔ) em CLAUDE.md

## Arquivos importantes

- `docs/design/manual/index.html` (+ `MANUAL_DODO_v1.0.pdf`) — Manual de
  Design DODÔ v1.0, SSOT visual oficial. Ler antes de qualquer decisão
  de UI.
- `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md` — auditoria do
  React contra o Manual + plano em 6 sprints. Aguardando aprovação do
  responsável antes de qualquer sprint começar.
- `docs/adrs/ADR-019-design-system-dodo-como-ssot-visual.md` — decisão
  formalizada nesta sessão, commitada.
- `docs/design/archive/README.md` — mapa das 3 gerações anteriores de
  Design System, preservadas por histórico.
- `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md` — plano mais antigo,
  sobreposto ao novo plano acima, não reconciliado.
- `docs/_workspace/TASK_ROUTER.md` — fonte única de estado e
  dependências entre SPECs; histórico completo por seção datada (§1–§74).
- `frontend/src/theme/tokens.css` — paleta DODÔ aplicada (laranja
  primária, roxo secundária), ainda não commitada.
- `docs/infrastructure/INFRAESTRUTURA.md` — fonte oficial de dados de
  infraestrutura.

## Links para logs relacionados

- `docs/_workspace/logs/2026-Rebranding-DODO.md` — log de fase corrente.
  Contém a narrativa completa desta sessão (inventário → construção do
  Manual → arquivamento → auditoria React → plano) na entrada
  "Consolidação do Manual de Design DODÔ v1.0", mais histórico de
  sessões anteriores — consultar só quando precisar de contexto
  histórico específico, não como leitura de rotina.
- `docs/_workspace/TASK_ROUTER.md` — histórico completo por SPEC/seção
  datada (§1–§74), incluindo `§74` (esta sessão).
- `docs/handoff/README.md` — marcos concluídos (fim de fase, migrações,
  releases).
