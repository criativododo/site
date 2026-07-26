# LOG DE FASE — Rebranding DODÔ + Redesign Incremental do Frontend

> Log de histórico detalhado desta fase do projeto DODÔ. `docs/_workspace/
> ESTADO_SESSAO.md` é o snapshot enxuto do estado atual (sempre
> sobrescrito por completo, nunca por acréscimo); este arquivo é o
> destino do histórico narrativo detalhado, sempre por acréscimo ao
> final. Política completa: `CLAUDE.md` §"Comandos padrão" e
> `.claude/commands/fim.md`.
>
> **Fechamento de fase:** ao concluir uma fase importante (Sprint,
> Rebranding, Go-Live, Refactor etc.), encerrar a fase neste arquivo com
> Resumo da fase, Resultado, Decisões tomadas, Commits relevantes e
> Próxima fase — depois abrir um novo arquivo de log para a fase
> seguinte.
>
> **Rotação:** ao ultrapassar ~1500 linhas, iniciar um novo arquivo de
> log para a fase corrente ou seguinte, preservando este como histórico
> imutável.

---

## 2026-07-25 — Migração do histórico do `ESTADO_SESSAO.md` (reorganização documental, `TASK_ROUTER.md` §73)

O conteúdo das subseções abaixo foi extraído **integralmente e sem
nenhuma perda de informação** da versão de `docs/_workspace/
ESTADO_SESSAO.md` vigente até 2026-07-25 (fechamento do `TASK_ROUTER.md`
§72), como parte da reorganização documental pedida pelo responsável do
projeto e registrada em `TASK_ROUTER.md` §73. A partir desta
reorganização, `ESTADO_SESSAO.md` passa a conter apenas o snapshot atual
(Situação atual, Objetivos, Próxima missão, Pendências, Últimos commits
relevantes, Arquivos importantes, Links para logs) — todo o restante
abaixo é o que foi removido dele.

### Última sessão concluída (2026-07-25 — cross-check de defasagem do snapshot + plano técnico de redesign do frontend)

Sessão nova, iniciada com `/comecar`. Dois blocos:

1. **Cross-check de abertura encontrou defasagem real entre
   `ESTADO_SESSAO.md` e `TASK_ROUTER.md`.** A versão anterior deste
   documento parava no `§70`; o `§71` (sessão anterior, mesmo dia) já
   tinha resolvido a pendência central daquele momento (paleta) e mudado
   o estado físico do repositório (`design-system/` apagada). Reportado
   ao responsável no relatório de abertura da sessão, sem correção
   automática — só corrigido agora, neste `/fim`.

2. **Plano técnico de redesign, a pedido explícito do responsável ("modo
   turbo"), só leitura do frontend React atual.** Análise cobriu tokens,
   `AppShell`/`PortalShell` (duplicação quase total — oportunidade de
   parametrizar), `Dashboard` (maior gap visual: cards sem
   `--radius-card` apesar do token existir), `Button`/`Badge`/
   `StatusBadge` (`StatusBadge` é CSS duplicado de `Badge`), família
   `TextField` (já bem reutilizada), `EmptyState`, `AuthSplitLayout`
   (comentário desatualizado sobre qual cor é primária), ausência total
   de `Card` e `Modal` no código (confirmado por grep), e confirmação de
   que ~8 primitivos compartilhados cobrem quase toda a árvore de ~25
   telas. Resultado salvo em `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`
   após confirmação explícita do responsável para persistir. Nenhuma
   linha de código foi alterada, nenhum commit feito, nenhum teste
   rodado — puramente planejamento, conforme pedido.

Detalhe técnico completo: `TASK_ROUTER.md` `§72` (esta sessão), `§71`
(decisão de paleta + exclusão do `design-system/`, sessão anterior).

O "Working tree" descrito nesse snapshot: o diff pré-existente
(documentação de deploy/infraestrutura, frente `§58` de rebranding em
`frontend/`, deleções pendentes em `est-dio-el-design-system/` e
`design-system/`, tokens.css não commitado, arquivos não rastreados de
sessões paralelas) seguia intacto, não tocado naquela sessão, à parte do
novo arquivo do plano.

### Riscos ativos (snapshot de 2026-07-25, pré-reorganização)

- **Plano de redesign ainda não tem nenhuma linha implementada** — risco
  de divergir se outra sessão começar a mexer em `AppShell`/`Dashboard`/
  componentes globais sem seguir a ordem de fases do plano ou sem validar
  visualmente a cada etapa (condição explícita do `§71`).
- **`ADR-019` divergente do código** (roxo no documento, laranja no
  `tokens.css`) — mesmo padrão de risco já sinalizado duas vezes
  (`§70`/`§71`); enquanto não formalizado, qualquer sessão que leia só o
  ADR chega a uma conclusão de paleta errada.
- **Working tree com múltiplas frentes não commitadas simultâneas**
  (deploy `§58`/`§64`/`§65`/`§67` + documento de UX `§66` + exclusão de
  `design-system/` + `tokens.css` novo + plano de redesign novo) — risco
  de conflito se outra sessão mexer nos mesmos arquivos ou se o
  responsável decidir commitar em ordem diferente da esperada.
- **Deploy segue bloqueado por dependência externa (SSH Locaweb) e por
  uma ação de painel que só o responsável pode fazer** (tipo do
  subdomínio) — sem mudança de estado.
- **Ambiente `criativododo2` está sendo tocado por terceiros (suporte
  Locaweb) fora do controle do agente** — achado de `§67`, sem mudança
  naquela sessão. Sempre reconferir com teste de rede real antes de
  assumir o estado documentado.
- **`AUDITORIA_LOCAWEB.md` descreve um ambiente diferente do atual**
  (Hospedagem I vs. II) e nunca foi repetida para `criativododo2` —
  mitigado por `INFRAESTRUTURA.md`, gap de auditoria em si continua
  aberto. Sem mudança.
- **O briefing de UX (`§66`) descreve o sistema como estava no momento
  da auditoria (2026-07-24)** — já desatualizado em relação ao código
  real (paleta mudou, `design-system/` some) — reconferir contra o
  código antes de usar como entrada de qualquer ferramenta de geração de
  interface.
- Herdados, sem mudança: `skills-dodo/` (fora do repo) com identidade
  antiga da Elã; arquivo sensível não rastreado na raiz; duplicação
  "Plano Mestre"; inconsistência de subpastas em
  `docs/arquitetura/README.md`; triplicação de checklists de Go-Live;
  capturas de tela em `docs/infrastructure/assets/` são do ambiente
  antigo.

### IA recomendada (snapshot de 2026-07-25, pré-reorganização)

Para continuar o redesign do frontend: qualquer IA com acesso ao
repositório, mas deve ler `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`
por completo antes de tocar em qualquer componente — seguir a ordem de
fases (A → B → C → D → E) e validar visualmente a cada etapa, conforme
decisão do responsável registrada em `§71`. Se o plano estiver
desatualizado em relação ao código (por exemplo, se outra sessão já tiver
mexido em algo listado como pendente), reconferir contra o código antes
de seguir o documento cegamente — mesmo princípio que gerou a correção
daquela sessão.

Para a decisão sobre `Modal`: é do responsável, não da IA — não construir
sem confirmação.

Para as frentes herdadas (SSH/UX/deploy): qualquer IA com acesso a rede e
ao histórico da conversa. Antes de retomar a frente de deploy, ler
`docs/infrastructure/INFRAESTRUTURA.md` primeiro. Antes de retestar SSH
novamente, ler `TASK_ROUTER.md` `§67`. Antes de retomar a frente de UX,
ler `docs/_workspace/UX/BRIEFING_TELAS_E_COMPONENTES_DODO.md` por
completo. Se tocar em qualquer documento e encontrar "TEAR" como
nomenclatura de projeto, aplicar `ADR-020` na própria edição, sem
varredura preventiva do resto do repositório (achado naquela sessão:
`frontend/src/pages/LandingPage.tsx` ainda cita "TEAR" em texto visível
ao usuário — corrigir quando essa tela for tocada pelo redesign).

### Prompt de handoff (snapshot de 2026-07-25, pré-reorganização)

```
Contexto: projeto DODÔ (ADR-020). Plataforma Influencia. Branch
docs/governance-phase2. Commit mais recente: 3812c37, local, não
pushado, 8 commits à frente de origin, 0 atrás. PR #77 aberta, sem
mudança de status. 0 commits nesta sessão.

ATENÇÃO: a versão anterior deste snapshot estava desatualizada (parada no
§70) — corrigida nesta sessão para refletir o §71 (paleta resolvida,
design-system/ apagada). Se retomar de uma cópia antiga deste arquivo,
descartar e usar só esta versão.

SESSÃO MAIS RECENTE (2026-07-25, TASK_ROUTER.md §72): (1) /comecar
encontrou e reportou a defasagem acima, sem corrigir sozinho; (2) a
pedido do responsável ("modo turbo"), produzido um plano técnico completo
de implementação do redesign incremental decidido no §71 — análise só
leitura do frontend/src atual (tokens, AppShell/PortalShell, Dashboard,
Button/Badge/StatusBadge/TextField/EmptyState/AuthSplitLayout, ausência
de Card/Modal no código), salvo em
docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md — único arquivo criado
nesta sessão. Nenhuma linha de código foi alterada, nenhum commit feito,
nenhum teste rodado.

PRÓXIMO PASSO IMEDIATO, EM ORDEM:
1. Ler docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md por completo.
2. Executar Fase A do plano: criar componente Card, simplificar
   StatusBadge para wrapper de Badge, corrigir comentário desatualizado
   em AuthSplitLayout.module.css. Validar visualmente a cada passo.
3. Decisão do responsável antes da Fase D: construir Modal agora (sem
   consumidor real) ou só especificar e adiar.
4. Formalizar ADR-019 (documento ainda diz roxo primário, código já
   aplica laranja) — não decidir sozinho, só formalizar o que o
   responsável já decidiu no §71.

FRENTES PARALELAS HERDADAS, NENHUMA RETOMADA NESTA SESSÃO:
- SSH porta 22 na Locaweb: bloqueada, sem ETA, reconfirmado em §67.
- Briefing de UX (§66, docs/_workspace/UX/BRIEFING_TELAS_E_COMPONENTES_DODO.md):
  aguardando aprovação do responsável antes de qualquer implementação.
  Já parcialmente desatualizado frente ao código real (paleta mudou,
  design-system/ some) — reconferir antes de usar.
- Frente §58 (Sprint 01 + rebranding em frontend/, ~55 arquivos): pronta,
  só falta aprovação do responsável para commit.

ATENÇÃO OPERACIONAL: arquivo não rastreado "IMPORTANTE
Webmail_Codigos_de_backup.txt" na raiz, nome sugere segredo — não incluir
em nenhum commit. Vários arquivos não rastreados de sessões paralelas
(backend/.env.backup-*, screenshots na raiz, DOCS_INVENTARIO.txt,
ESTADO_SESSAO.backup.md, provisorios/, skills-dodo/ fora do repo) — não
commitar sem confirmar origem com o responsável. frontend/src/pages/
LandingPage.tsx ainda cita "TEAR" em texto visível — aplicar ADR-020 ao
tocar essa tela, sem varredura preventiva do resto do repositório.

Detalhe completo: docs/_workspace/TASK_ROUTER.md §72 (esta sessão), §71
(decisão de paleta + exclusão de design-system/), §70/§69 (histórico do
Design System antes da exclusão), §67 (reteste SSH), §66 (briefing de
UX), §64/§65 (deploy), §58 (Sprint 01 + rebranding).
```

### Checklist completo (snapshot de 2026-07-25, pré-reorganização)

#### Plano de redesign do frontend (2026-07-25, `TASK_ROUTER.md` §72)

- [x] Defasagem entre `ESTADO_SESSAO.md` e `TASK_ROUTER.md` (`§70` vs.
      `§71`) identificada e reportada ao responsável no `/comecar`
- [x] Análise só-leitura do frontend React atual concluída (tokens,
      shell, Dashboard, componentes globais, padrões de tela)
- [x] Plano técnico salvo em `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`
- [x] `ESTADO_SESSAO.md` corrigido/atualizado no `/fim` daquela sessão
- [ ] Fase A do plano (Card, StatusBadge, comentário do AuthSplitLayout)
      — não iniciada
- [ ] Decisão do responsável sobre `Modal` — pendente

#### Resolução de paleta + exclusão de `design-system/` (`TASK_ROUTER.md` §71)

- [x] Paleta laranja/roxo decidida e aplicada em `tokens.css`
- [x] `design-system/` removida do disco (`git rm -r`, staged)
- [ ] Commit de `tokens.css` e da remoção de `design-system/` —
      aguardando decisão do responsável sobre agrupamento de commit
- [ ] Formalizar `ADR-019` com a decisão real de paleta

#### Reteste de SSH Locaweb (`TASK_ROUTER.md` §67)

- [x] Retomada exata de `§62` — mesmos alvos, mesmas portas alternativas,
      mesmos controles
- [x] Porta 22 reconfirmada bloqueada nos 3 alvos + 5 portas alternativas
- [x] Achado (document root com teste PHP) identificado e origem
      confirmada com o responsável
- [x] `docs/infrastructure/INFRAESTRUTURA.md` atualizado (§5, §8)
- [ ] Aguardar retorno efetivo do chamado Locaweb sobre a porta 22 —
      fora do controle do agente

#### Briefing de arquitetura de telas e componentes (`TASK_ROUTER.md` §66)

- [x] Documento criado e entregue (`docs/_workspace/UX/`, cópia em
      `~/Downloads`)
- [x] `TASK_ROUTER.md` §66 registrado
- [ ] Revisão e aprovação do responsável — pendente, condição para
      qualquer implementação a partir do documento

#### Preparação de deploy do DODÔ — contingência FTP + fonte de infraestrutura

- [x] Plano de contingência FTP formalizado
      (`RUNBOOK_DEPLOY_E_ROLLBACK.md`)
- [x] `docs/infrastructure/INFRAESTRUTURA.md` criado e mantido atualizado
- [ ] Nada commitado — aguardando decisão do responsável
- [ ] Corrigir tipo do subdomínio `portal.criativododo.com.br`
      ("Apontamento" → "Conteúdo da pasta") — ação do responsável
- [ ] Confirmação/liberação do suporte Locaweb sobre a porta 22 —
      reconfirmado ainda bloqueado em `§67`
- [ ] Confirmar disponibilidade real de PostgreSQL na Hospedagem II
- [ ] Arquivos do Laravel enviados ao servidor / banco criado / `.env`
      real / publicar e validar produção

#### Frente do §58 — Sprint 01 + rebranding em `frontend/` (deprioritizada)

- [x] Executado e validado em sessão anterior
- [ ] Aprovação do responsável para commit
- [ ] Commit
- [ ] Formalizar substituição do `ADR-019` em `docs/adrs/` — mesma
      pendência do bloco de paleta acima

#### Arquitetura de comandos (Fases 1-2)

- [x] Fase 1-2 — `/comecar`/`/fim` implementados
- [ ] Fase 3 — `/prompt-gpt` (aguardando aprovação)

---

## 2026-07-25 — Reorganização documental consolidada e commitada (`36ab33d`)

**Commit:** `36ab33d3cf37799d1a15d7f72a0c14f57a3f1593` — 6 arquivos, nenhum
código de aplicação tocado.

**Resumo do que foi consolidado:**

- `ESTADO_SESSAO.md` reescrito como snapshot enxuto (384 → 166 linhas),
  com só 7 seções fixas (Situação atual, Objetivos, Próxima missão,
  Pendências, Últimos commits relevantes, Arquivos importantes, Links
  para logs).
- Criado `docs/_workspace/logs/2026-Rebranding-DODO.md` (este arquivo),
  recebendo — sem nenhuma perda — toda a narrativa, riscos, "IA
  recomendada", prompt de handoff e checklists que antes inflavam o
  snapshot.
- `TASK_ROUTER.md` §73 registra a decisão e a política de manutenção.
- `/comecar` e `/fim` atualizados para nunca mais tratar
  `ESTADO_SESSAO.md` como diário: reescrita sempre completa, histórico
  movido para o log da fase corrente antes de sobrescrever, log
  rotacionado a cada ~1500 linhas.
- `CLAUDE.md` §"Comandos padrão" e §"Documentação complementar"
  atualizados para documentar `docs/_workspace/logs/`.

**Correção operacional no meio do processo:** o primeiro commit
(`6f69538`) acabou incluindo, além dos 6 arquivos da reorganização, 44
deleções de `design-system/` que já estavam staged de uma sessão
anterior (`git commit` sem pathspec commita todo o índice, não só o que
foi adicionado por último). Corrigido com `git reset --soft HEAD~1` +
restage exclusivo dos 6 arquivos + novo commit (`36ab33d`) — sem perda
de dados, nada tinha sido pushado. Lição registrada: ao commitar um
subconjunto de arquivos num índice que já tem outras coisas staged,
usar `git status`/`git diff --cached --stat` para conferir o índice
inteiro antes do commit, não só os arquivos que acabaram de ser
adicionados.

**Verificação de referências à arquitetura antiga (2026-07-25):**
verificado `grep` por `ESTADO_SESSAO` em toda a árvore de documentação.
Nenhuma referência ativa (`CLAUDE.md`, `/comecar`, `/fim`,
`GOVERNANCA_DO_PROJETO.md`) descreve mais o arquivo como histórico
contínuo ou exige *append* — todas já refletem a política nova. As
únicas menções remanescentes em ADRs/`PLANO_DE_IMPLANTACAO.md`/
`ARQUITETURA_PRODUCAO.md` são citações pontuais a seções específicas do
snapshot em datas passadas (ex. "`ESTADO_SESSAO.md` §4"), não descrições
da arquitetura do arquivo — não requerem correção.
`docs/_workspace/ESTADO_SESSAO.backup.md` (untracked, herdado de sessão
de 2026-07-23) já descrevia o mesmo princípio ("reescrito por completo,
não duplica histórico") antes desta reorganização existir — não
contradiz a arquitetura nova, só não foi migrado para dentro dela (seu
destino, se algum dia for necessário, seria virar entrada de um log de
fase anterior; decisão não tomada aqui, fora do escopo desta tarefa).

**Resultado:** frente de reorganização documental encerrada. Próxima
missão real do projeto: redesign incremental do frontend (Fase A do
plano), conforme `ESTADO_SESSAO.md`.

## 2026-07-25 — `/fim` desta sessão (encerramento formal da frente de reorganização documental)

Commit de consolidação final `edb14ad9c...` (`docs(_workspace): consolidar
fechamento da reorganização documental (commit 36ab33d)`), contendo
apenas `ESTADO_SESSAO.md`, `TASK_ROUTER.md` §73 ("Estado ao final") e
este arquivo de log. Branch `docs/governance-phase2` passa de 8 para 10
commits à frente de `origin` (ainda sem push — fora do escopo desta
frente).

Nenhuma tarefa nova foi iniciada neste `/fim` — só a formalização de
fechamento pedida pelo responsável do projeto. A sessão foi renomeada
para "agente A" pelo responsável antes deste encerramento; o próximo
contexto será assumido por outro agente, que deve retomar por
`/comecar` normalmente (nada de especial a fazer além disso — a
reorganização já deixou `ESTADO_SESSAO.md` e este log no estado
correto para a próxima sessão).

**Frente de reorganização documental formalmente encerrada.** Próxima
missão do projeto: Fase A do plano de redesign do frontend
(`docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`), sem relação com esta
frente.

## 2026-07-25 — Consolidação do Manual de Design DODÔ v1.0 (sessão "agente B", paralela ao encerramento acima)

Sessão concorrente à do "agente A" (a entrada anterior é de outra sessão,
fechada separadamente). Escopo: consolidação documental do Design System
e preparação (não execução) da implementação no React, por instrução
direta do responsável do projeto, em duas frentes sequenciais.

### Frente 1 — Inventário e diagnóstico (antes de qualquer escrita)

Auditoria paralela (4 subagentes, escopo exclusivo cada): (1) Design
System interno do repo — mapeou `design-system/` (import Stitch,
deletado do disco mas em git HEAD) e `est-dio-el-design-system/` (bundle
"criativo DODÔ v2.0", idem) como duas gerações em conflito entre si e com
o código; (2) documentos DODÔ do Downloads (`DESIGN DODÔ.md`,
`Brand-Foundations-v0.1.md/pdf`, `Briefing de Telas e Componentes v2.0`,
`Lista Priorizada de Melhorias v2.0`, `Checklist Final`, `PROMPT.rtf`) —
achou divergência de hex entre dois sub-grupos de documentos (Creme/
Preto/Lime com valores levemente diferentes) e uma sombra CSS não
recalculada após mudança de token; (3) estrutura do repo e proposta de
nova organização; (4) screenshots de referência (Hero/Login/Full Page/
Cores na raiz do projeto) e telas exportadas do Stitch.

**Achado central, resolvido por leitura direta de `frontend/src/theme/
tokens.css`:** o código real bate exatamente com `Brand-Foundations-
v0.1.md` + `DESIGN_DODO.md` (paleta laranja-primária `#f14f28`/roxo-
secundária `#504ea1`), não com `est-dio-el-design-system/` (paleta roxo-
primária `#564f94`, que havia sido aprovada e revertida no mesmo dia,
24/07). O `ADR-019` (nunca commitado) nomeava a geração errada (a
revertida) como SSOT — contradição identificada e corrigida na Frente 2.

Adicionado à auditoria, por pedido do responsável: `skills-dodo/`
(biblioteca de skills do Claude Code da agência, fora do repo git
formalmente rastreado como tal) — só `tom-dodo/SKILL.md` (tom de voz
verbal, já consolidado) mostrou-se relevante como fonte complementar; o
resto (branding estratégico, financeiro, mensagens) é conhecimento de
agência, não do Design System do produto.

### Frente 2 — Construção do Manual de Design DODÔ v1.0

Por instrução explícita do responsável, mudança de escopo: em vez de só
consolidar documentação, construir a "primeira edição oficial" do Manual
— HTML navegável premium (estilo Stripe/Vercel/Linear/Notion) + PDF,
usando `Brand-Foundations-v0.1.pdf` como fonte principal, o layout React
atual como referência de implementação (nunca para ser substituído — a
app React é a base, o Stitch é só referência histórica/UX), e os ativos
válidos de `est-dio-el-design-system/brand`.

Diretrizes de marca recebidas e aplicadas: linguagem tipográfica em
sentence case (caixa baixa por padrão, caixa alta só com justificativa
semântica); tom boutique/contemporâneo/caloroso/premium sem ostentação,
nunca enterprise/SaaS genérico; ativos centrais (logotipo, símbolo,
paleta oficial, tipografia da marca, naming) tratados como **congelados**
nesta fase — documentados como existem, nunca redesenhados. Único
princípio de evolução deliberada: curvatura (bordas) das superfícies
grandes (cards/containers/painéis), com proximidade humana como critério
primário e papel funcional como secundário — **sem token numérico
fechado nesta edição**, só o princípio (confirmado com o responsável via
perguntas específicas antes de escrever o capítulo).

Execução com paralelização máxima por pedido do responsável — 6
subagentes de conteúdo (Essência/Personalidade, Logotipo/Ativos, Paleta/
Cor, Tipografia/Linguagem, Sistema Gráfico, Grounding do React real) +
3 subagentes de suporte (revisão editorial, componentes visuais HTML/CSS/
SVG, auditoria de ativos copiados) rodando em paralelo, consolidação
final feita por mim (HTML único autocontido, ~1100 linhas, offline, sem
CDN — fontes Elms Sans/Work Sans e os 15 ícones de marca copiados para
dentro de `docs/design/manual/assets/`).

PDF gerado via Chrome headless (`--headless --print-to-pdf`, binário do
`Google Chrome.app` local). Um bug real encontrado na revisão visual do
PDF (não pelos subagentes de QA, por mim mesmo lendo o PDF gerado): o
diagrama de curvatura cortava o último bloco na borda da página por
depender de scroll horizontal, que não existe em PDF — corrigido com
`flex-wrap` e PDF regerado. Aprovado pelo responsável sem mais ajustes.

### Frente 3 — Consolidação documental e arquivamento (pós-aprovação do Manual)

Por instrução do responsável: (1) consolidar documentação do Design
System, arquivando (nunca apagando) material obsoleto; (2) atualizar
referências internas; (3) auditar o React contra o Manual e gerar plano
de implementação, **sem tocar em nenhum componente**; (4) um commit
único e limpo, sem misturar alterações funcionais do React pendentes
(que já estavam soltas no working tree desde antes desta sessão).

Arquivamento: restauradas do git history (`git checkout HEAD --`) as
pastas `design-system/` e `est-dio-el-design-system/` (estavam deletadas
do disco, não commitadas) e movidas com `git mv` para
`docs/design/archive/` — `dodo-stitch-import-2026-07-25/`,
`est-dio-el-design-system-v2-roxo/`, mais `tear-editorial-legado/` (era
`docs/design/stitch-export/`, sistema pré-DODÔ) e
`brand-guide-screenshots-v1/` (os 6 PNGs soltos na raiz). README de
arquivo com contexto de cada pasta + banner "[ARQUIVADO]" nos dois
README/DESIGN_DODO.md mais lidos, apontando para o Manual.

`ADR-019` reescrita do zero (nunca tinha sido commitada) para nomear o
Manual como SSOT, com o histórico completo das 3 gerações e a correção
da contradição original. `docs/design/DESIGN_SYSTEM.md` e
`docs/handoff/README.md` atualizados para apontar para o Manual (nota de
atualização no handoff, sem reescrever o registro histórico original).

Auditoria do React (3 subagentes paralelos: componentes compartilhados,
telas admin, telas públicas/portal) — nenhum componente ou tela precisa
ser refeito do zero. Achados principais: `text-transform: uppercase`
decorativo espalhado em 5+ componentes (viola a nova regra de sentence
case); `Button` usa Elms Sans onde deveria usar Work Sans; múltiplos
CTAs primários competindo em `PagamentoPage`, `BriefingFormPage`,
`PortalPerfilPage`, `MateriaisPage`, e 3 listas admin (duplicação
header+EmptyState); símbolo decorativo não-canônico (estrela) em
`AuthSplitLayout`, violando a regra "nenhum símbolo novo"; achado
estrutural mais importante — `PortalShell` reaproveita o CSS do shell
administrativo e **não tem bottom-nav mobile-first**, apesar do Manual
exigir isso para o portal.

Plano consolidado em `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`,
6 sprints por risco crescente (Sprint 0 = decisões pendentes do
responsável, bloqueante para 3 e 5; Sprint 1 = tipografia, risco mínimo/
alcance máximo; Sprint 2 = disciplina de CTA único; Sprint 3 =
consolidação de padrões; Sprint 4 = Portal mobile-first, maior risco
estrutural; Sprint 5 = curvatura, gated na decisão numérica; Sprint 6 =
biblioteca de ícones, independente). Responsável pediu explicitamente
para aguardar aprovação do plano completo antes de qualquer sprint, e
que a implementação futura também use paralelização máxima (tokens,
componentes base, admin, portal, QA) sob um único integrador.

**Commit único:** `d08e8fd` — 149 arquivos (a maioria reconhecida como
rename pelo git, histórico preservado), contendo só Manual + arquivamento
+ referências atualizadas + plano de implementação. Confirmado por
`git diff --cached --name-only` antes de commitar: nenhum arquivo de
`frontend/`, `backend/`, `docs/_workspace/` ou `mcp/` staged — as ~54
alterações funcionais do React já pendentes desde antes desta sessão
permanecem exatamente como estavam, não commitadas, não tocadas.

**Resultado:** Manual de Design DODÔ v1.0 é agora o SSOT visual oficial
do projeto (`docs/design/manual/index.html` + `.pdf`), com as 3 gerações
anteriores de Design System arquivadas e rastreáveis. Plano de
implementação pronto, aguardando aprovação do responsável — **nenhum
componente React foi alterado nesta sessão.**

<!-- Próxima entrada de fechamento de fase ou sessão detalhada: acrescentar abaixo desta linha, nunca reescrever o que já está acima. -->
