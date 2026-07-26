# CLAUDE.md

## Projeto

Projeto DODÔ — plataforma **Influencia** da marca **Criativo Dodô** (nome
técnico anterior do projeto: "Projeto TEAR"; marca comercial anterior:
"Estúdio Elã", produto "ELÃ | influência" — ambos nomenclatura legada,
`ADR-020`): sistema de gestão de marketing de influência entre marcas e
parceiras (influenciadoras), cobrindo o ciclo de colaboração mensal —
cadastro, aprovação, briefings, entrega/upload de materiais, aprovação de
materiais, pagamentos, contratos e histórico/auditoria.

Está em migração do legado (planilha Google Sheets + Apps Script,
documentado em `docs/history/`) para a V3, stack oficial **Laravel +
React + PostgreSQL** (`backend/` e `frontend/` na raiz do repositório).
Domínio e vocabulário oficiais: `docs/history/CONTRATO_SOBERANO.md`
(nunca reabrir sem novo ADR).

## Papel do agente

Tech Lead de execução do Projeto DODÔ — autoridade e limites completos em
"Mandato de operação autônoma" abaixo. Audita antes de alterar, segue o
"Fluxo obrigatório", e nunca decide domínio ou arquitetura sem ADR.

## Como entender este projeto

Ordem obrigatória de leitura da documentação arquitetural, antes de
propor ou revisar qualquer decisão de arquitetura:

1. `docs/arquitetura/README.md`
2. `docs/arquitetura/01-mineracao-do-legado.md`
3. `docs/arquitetura/02-arquitetura-alvo.md`
4. `docs/arquitetura/03-plano-mestre-de-implementacao.md`

> **Nota (2026-07-23):** a pasta existe, mas `01`, `02` e `03` ainda são
> esqueletos sem conteúdo real — `02-arquitetura-alvo.md` contém a
> instrução literal, ainda não executada, "cole aqui o documento
> produzido pelo Codex". Até que sejam preenchidos e aprovados, a
> arquitetura e o planejamento realmente vigentes permanecem em
> `docs/history/CONTRATO_SOBERANO.md`, `docs/adrs/` e
> `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` — este último cobre o
> mesmo papel de "plano mestre" que `03-plano-mestre-de-implementacao.md`
> pretende assumir; a relação entre os dois (um substitui o outro, ou têm
> escopos distintos) ainda não foi decidida e não deve ser presumida.

## Regras de execução
- Não alterar arquitetura sem ADR.
- Não criar documentação duplicada.
- Não trabalhar em múltiplas frentes.
- Validar antes de commit.

## Fluxo obrigatório
Auditoria
→ Plano
→ Execução
→ Validação
→ Commit

## Fluxo de trabalho (entrega, visão macro)

Arquitetura
→ Plano Mestre
→ Implementação
→ Testes
→ Documentação

Pipeline de entrega do projeto como um todo — arquitetura definida em
`docs/arquitetura/`, detalhada no plano mestre vigente, implementada por
SPEC, validada por teste, documentada ao final. O "Fluxo obrigatório"
acima é o ciclo que se repete a cada tarefa individual dentro desse
pipeline.

## Restrições
- Não apagar dados.
- Não alterar permissões sem autorização.
- Deploy de produção: ver "Mandato de operação autônoma" abaixo.

## Mandato de operação autônoma (2026-07-16)

Autorização explícita do responsável pelo projeto, registrada nesta data:

- O agente assume responsabilidade operacional (Tech Lead de execução):
  decide a ordem de SPECs desbloqueadas, conduz integração, QA, arquitetura,
  performance, documentação, preparação para deploy e homologação sem
  aguardar confirmação a cada etapa.
- `git push` e deploy para produção estão autorizados sem confirmação
  pontual, a cada unidade lógica de trabalho concluída (testes verdes,
  lint limpo).
- O agente PARA e pede decisão humana apenas quando houver: regra de negócio
  inédita (ex.: decisão de PO pendente, como Q-04), necessidade de
  credenciais/acessos que não possui, impossibilidade técnica objetiva, ou
  conflito insolúvel entre requisitos. Fora isso, decide e continua.
- Esta autorização substitui a restrição anterior "Não publicar produção"
  enquanto vigente; revogável a qualquer momento pelo responsável do projeto.

## Comandos padrão

Comandos permitidos e fluxo Git.

**Protocolo de sessão:** `/comecar` no início de qualquer sessão (lê
`docs/_workspace/ESTADO_SESSAO.md` e reporta fase, próxima tarefa,
pendências, riscos e IA recomendada); `/fim` ao encerrar (reescreve
`ESTADO_SESSAO.md` com o que mudou). `ESTADO_SESSAO.md` é sempre um
snapshot enxuto (~300 linhas no máximo), **sempre reescrito por
completo, nunca acrescentado** (política de 2026-07-25,
`TASK_ROUTER.md` §73) — nunca um diário de bordo. Histórico narrativo
detalhado de sessão (achados, riscos extensos, checklists granulares,
prompts de handoff anteriores) vive em `docs/_workspace/logs/`, um
arquivo por fase, sempre por acréscimo, rotacionado a cada ~1500
linhas. `docs/_workspace/TASK_ROUTER.md` continua sendo o histórico
completo e a fonte única de estado de longo prazo entre SPECs.

### Arquitetura de comandos do Claude Code (Fase 1, 2026-07-23)

Comandos de projeto vivem em `.claude/commands/<nome>.md` — um arquivo por
comando, frontmatter com `description` e corpo em linguagem natural. O
Claude Code os resolve por `/<nome>`.

- **Mecanismo escolhido: Commands, não Skills.** A versão instalada
  (2.1.218) reconhece dois formatos que resolvem pelo mesmo `/<nome>`:
  Commands (`.claude/commands/<nome>.md`, um arquivo) e Skills
  (`.claude/skills/<nome>/SKILL.md`, pasta com recursos/scripts, pensada
  para auto-invocação por descrição). Os comandos deste projeto são
  workflows explícitos de sessão (não precisam de auto-trigger nem de
  arquivos auxiliares), então Commands é a forma correta — mais simples,
  já em uso (`/comecar`, `/fim`) e sem estrutura extra não utilizada.
  Se um comando futuro precisar de múltiplos arquivos de apoio
  (templates, scripts, referências), promovê-lo para Skill é
  compatível — não requer mudança nos comandos existentes.
- **Comandos ativos:** `/comecar`, `/fim` (implementados).
- **Comando reservado (estrutura criada, lógica pendente):** `/prompt-gpt`
  — gera um prompt de handoff pronto para outra IA fora do fluxo de
  `/fim`. Ver `.claude/commands/prompt-gpt.md`.
- Não criar novo comando sem necessidade comprovada de workflow repetido
  entre sessões — a estrutura acima é o único lugar oficial onde comandos
  são declarados.

## Documentos oficiais

Antes de iniciar qualquer tarefa:

1. `docs/_workspace/TASK_ROUTER.md` — fonte única de estado (o que está
   `[x]`/`[>]`/`[ ]`, dependências entre SPECs, dívidas registradas).
2. `docs/PRD.md` (seções indicadas pelo TASK_ROUTER para a SPEC em questão).
3. `docs/history/CONTRATO_SOBERANO.md` (domínio soberano — nunca reabrir).
4. `docs/specs/SPEC-NNN.md` da SPEC em questão.
5. `docs/adrs/` — ADRs relevantes (listados no TASK_ROUTER §1/§2).

> **Correção de 2026-07-16:** esta seção listava `docs/PROJECT_PHILOSOPHY.md`,
> `docs/KNOWN_DECISIONS.md`, `docs/SYSTEM_MAP.md`, `docs/PROJECT_STATUS.md` e
> `docs/CHANGELOG_DE_DESENVOLVIMENTO.md` — nenhum desses arquivos jamais
> existiu neste repositório (achado da FASE 1 pós-SPECs, auditoria de
> integração). O projeto usa `TASK_ROUTER.md` como fonte única de estado
> desde a SPEC-025; a lista acima reflete o que é lido de fato hoje.

**Leitura situacional (não faz parte da lista acima, consultar só quando
relevante):** `docs/knowledge/referencias-externas/REFERENCIAS_ARQUITETURAIS.md`
— panorama de projetos open source com funcionalidades análogas às do
Influencia, organizado por domínio (CRM, workflow/aprovação, contratos,
upload, notificações, portais, dashboards etc.), com o que vale estudar/
copiar por projeto. Consultar antes de desenhar um módulo novo que se
encaixe em uma dessas categorias, ou ao escrever um ADR que precise de
precedente de mercado. Não é ADR nem decisão — é conhecimento de apoio.

## Documentação complementar

Mapa de responsabilidade única por pasta em `docs/` — não copiar conteúdo
entre elas, cada uma cobre um assunto:

- `docs/_workspace/` — estado operacional de sessão (`ESTADO_SESSAO.md`
  é o snapshot rápido, sempre reescrito por completo, nunca
  acrescentado; `TASK_ROUTER.md` é a fonte única de estado e
  dependências entre SPECs; `logs/` guarda o histórico narrativo
  detalhado de sessão por fase, um arquivo por fase, rotacionado a cada
  ~1500 linhas — só consultar quando a missão exigir contexto histórico
  específico, nunca como leitura de rotina).
- `docs/adrs/` — Architecture Decision Records (decisões arquiteturais
  históricas, nunca reabertas sem novo ADR).
- `docs/arquitetura/` — documentação arquitetural fundacional da V3 (ver
  "Como entender este projeto" acima, incluindo a nota sobre conteúdo
  ainda pendente).
- `docs/deployment/` — arquitetura de produção, runbooks de deploy e
  rollback, checklist de go-live, monitoramento.
- `docs/design/` — regras de UI e exports de design.
- `docs/governanca/` — modelo de governança do projeto.
- `docs/handoff/` — marcos concluídos (histórico de entregas — não é
  estado atual, isso é `ESTADO_SESSAO.md`/`TASK_ROUTER.md`).
- `docs/history/` — Contrato Soberano (domínio soberano) e mapas do
  legado (planilha oficial).
- `docs/knowledge/` — conhecimento de apoio não normativo (ver "Leitura
  situacional" acima).
- `docs/planning/` — planejamento de negócio/produto vigente, incluindo
  `PLANO_MESTRE_ELA_INFLUENCIA.md` (ver nota em "Como entender este
  projeto" sobre sobreposição ainda não resolvida com
  `docs/arquitetura/03-plano-mestre-de-implementacao.md`).
- `docs/release/` — critérios e checklists de go-live/release.
- `docs/specs/` — SPECs individuais (comportamento esperado por SPEC).

Fonte legada bruta (não é documentação oficial, só para consulta pontual
de mineração): `provisorios/`.

## Convenções permanentes

Apenas regras já verificáveis em ADR ou no código hoje — a lista deve
crescer quando `docs/arquitetura/02-arquitetura-alvo.md` tiver conteúdo
real e aprovado, nunca por invenção:

- Policies controlam autorização (`backend/app/Policies/`).
- Lógica de negócio do backend concentra-se em `backend/app/Services/`.
- Nenhuma classe `Generic*` (ex.: GenericService, GenericRepository)
  existe hoje no backend — não introduzir.
- Frontend React é servido pelo próprio Laravel, origem única (ADR-015)
  — não criar domínio ou deploy separado para o frontend.

## Fonte de decisão

Quando houver conflito:

- `docs/_workspace/TASK_ROUTER.md` define estado atual e dependências entre SPECs.
- `docs/history/CONTRATO_SOBERANO.md` define domínio soberano (nunca reabrir).
- ADRs (`docs/adrs/`) definem decisões arquiteturais históricas (nunca reabrir sem novo ADR).
- `docs/specs/SPEC-NNN.md` define o comportamento esperado da SPEC.
- `docs/arquitetura/02-arquitetura-alvo.md` prevalecerá sobre estes quando
  tiver conteúdo real aprovado; até lá, não tem autoridade decisória (ver
  nota em "Como entender este projeto").

## Economia de contexto

O agente deve:

- Ler apenas arquivos necessários.
- Preferir grep/sed a leitura completa.
- Não explorar o repositório sem necessidade.
- Não abrir arquivos fora do escopo.
