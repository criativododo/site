# CLAUDE.md

## Projeto

Projeto DODÔ — plataforma **Influencia** da marca **Criativo Dodô** (nome técnico anterior
do projeto: "Projeto TEAR"; marca comercial anterior: "Criativo Dodô", produto "ELÃ |
influência" — ambos nomenclatura legada, `ADR-020` em `knowledge/Arquitetura/`): sistema de
gestão de marketing de influência entre marcas e parceiras (influenciadoras), cobrindo o
ciclo de colaboração mensal — cadastro, aprovação, briefings, entrega/upload de materiais,
aprovação de materiais, pagamentos, contratos e histórico/auditoria.

Organização oficial no GitHub: **criativododo**. Este repositório é o único do ecossistema
web do projeto: `https://github.com/criativododo/criativododosite`. Referências a contas,
organizações, remotes ou URLs de repositório diferentes desta são legado.

## Estado físico real do repositório (não presumir, verificar)

Este repositório contém, hoje, três aplicações independentes (cada uma com seu próprio
`package.json`, sem workspace compartilhado, sem imports cruzados entre pastas):

- **`app/`** — Landing Page pública do Criativo Dodô. React 19 + Vite + TypeScript + GSAP.
  Implementada e funcionando. **É a implementação oficial da identidade visual da marca**
  (`knowledge/ARCHITECTURAL_DECISIONS.md`, ADR-001) — qualquer evolução visual do Portal deve
  derivar do código real de `app/src`, nunca do `design-system/index.html` isolado.
- **`portal-frontend/`** — frontend do Portal da Parceira/Backoffice. React 19 + Vite +
  TypeScript.
- **`portal-backend/`** — API do Portal. Node.js + TypeScript.

Não existe nenhum backend Laravel/PHP neste repositório — essa stack pertenceu a uma fase
anterior do projeto ("Sistema B"), cujo código nunca chegou a produção e não está aqui.
`knowledge/Arquitetura/ADR-*.md` documenta essas decisões como referência histórica de
raciocínio, não como código herdável.

**Antes de propor ou revisar qualquer decisão de arquitetura**, ler nesta ordem:

1. Execute `/inicio <objetivo>` — carrega a memória operacional externa e registra o
   baseline Git da sessão. `START_HERE_NEXT_SESSION.md` local é arquivo legado, útil apenas
   como referência histórica.
2. `knowledge/PROJECT_SOURCE_OF_TRUTH.md` — índice de qual documento manda sobre qual
   assunto (identidade visual, domínio, produto, arquitetura, backlog, jornadas, glossário).
3. `knowledge/ARCHITECTURAL_DECISIONS.md` — ADRs de governança e método deste projeto
   (série própria, iniciada em 2026-07-26).
4. `PORTAL_ARQUITETURA.md` — arquitetura consolidada do Portal, seções marcadas
   `[DOCUMENTADO]`/`[PROPOSTA]`.

## Papel do agente

Tech Lead de execução do Projeto DODÔ — autoridade e limites completos em "Mandato de
operação autônoma" abaixo. Audita antes de alterar, segue o "Fluxo obrigatório", e nunca
decide domínio ou arquitetura sem ADR.

## Regras de execução

- Não alterar arquitetura sem ADR (`knowledge/ARCHITECTURAL_DECISIONS.md` para decisões de
  governança/método deste projeto; um novo ADR nessa série para qualquer decisão nova).
- Não criar documentação duplicada.
- Não trabalhar em múltiplas frentes.
- Validar antes de commit (rodar build/lint de cada projeto afetado).
- Não presumir que existe código para reaproveitar a partir de nenhuma SPEC/ADR em
  `knowledge/` — a maior parte descreve sistemas ausentes deste repositório (ver
  `START_HERE_NEXT_SESSION.md` §10).

## Fluxo obrigatório

Auditoria
→ Plano
→ Execução
→ Validação
→ Commit

## Fluxo de trabalho (entrega, visão macro)

Arquitetura
→ Definição de produto (`PORTAL_BRIEFING.md`)
→ Backlog (`PORTAL_BACKLOG.md`)
→ Implementação
→ Testes
→ Documentação

Pipeline de entrega do projeto como um todo. O "Fluxo obrigatório" acima é o ciclo que se
repete a cada tarefa individual dentro desse pipeline.

## Restrições

- Não apagar dados.
- Não alterar permissões sem autorização.
- Não inventar requisito funcional onde a documentação for omissa ou contraditória
  (`knowledge/ARCHITECTURAL_DECISIONS.md`, ADR-003) — declarar a lacuna, não presumir.
- Não misturar os dois vocabulários de domínio (Contrato Soberano vs. "Sistema B") no mesmo
  código sem decisão explícita de reconciliação.
- Deploy de produção: ver "Mandato de operação autônoma" abaixo.

## Mandato de operação autônoma (2026-07-16)

Autorização explícita do responsável pelo projeto, registrada nesta data:

- O agente assume responsabilidade operacional (Tech Lead de execução): decide a ordem de
  trabalho desbloqueado, conduz integração, QA, arquitetura, performance, documentação,
  preparação para deploy e homologação sem aguardar confirmação a cada etapa.
- `git push` e deploy para produção estão autorizados sem confirmação pontual, a cada
  unidade lógica de trabalho concluída (testes verdes, lint limpo). Exceção: a primeira
  publicação de conteúdo num repositório/remote novo é um ponto de não-retorno externo e
  visível — confirmar com o responsável antes desse push específico, mesmo com o mandato em
  vigor.
- O agente PARA e pede decisão humana apenas quando houver: regra de negócio inédita (ex.:
  decisão de PO pendente), necessidade de credenciais/acessos que não possui,
  impossibilidade técnica objetiva, ou conflito insolúvel entre requisitos. Fora isso, decide
  e continua.
- Esta autorização substitui a restrição anterior "Não publicar produção" enquanto vigente;
  revogável a qualquer momento pelo responsável do projeto.

## Comandos padrão

Skills em `.claude/skills/<nome>/SKILL.md` são resolvidas por `/<nome>` e são versionadas
com o projeto. O protocolo operacional de sessão é obrigatório: `/inicio <objetivo>` antes
de trabalhar, `/check` quando houver validação aplicável e `/fim` ao encerrar. Ele usa o
clone irmão privado `../criativododo-memory`, nunca o deploy ou a VPS. Os comandos genéricos
em `.claude/commands/` permanecem disponíveis para Git e revisão.

## Documentos oficiais

Antes de iniciar qualquer tarefa, na ordem definida por
`knowledge/PROJECT_SOURCE_OF_TRUTH.md`:

1. `/inicio <objetivo>` — estado operacional atual e baseline da sessão.
2. `knowledge/PROJECT_SOURCE_OF_TRUTH.md` — mapa de fontes de verdade por assunto.
3. `knowledge/Historico/CONTRATO_SOBERANO.md` — domínio soberano (linguagem ubíqua, nunca
   reabrir sem novo ADR).
4. `PORTAL_BRIEFING.md` — definição oficial do produto Portal.
5. `PORTAL_ARQUITETURA.md` — arquitetura consolidada do Portal.
6. `PORTAL_BACKLOG.md` — ordem oficial de implementação (EPIC 0 → EPIC 5).
7. `knowledge/Produto/SPEC-*.md` da SPEC em questão, quando aplicável.
8. `knowledge/ARCHITECTURAL_DECISIONS.md` — ADRs de governança/método vigentes.

## Documentação complementar

Mapa de responsabilidade única — não copiar conteúdo entre pastas, cada uma cobre um
assunto:

- `app/` — código da Landing Page (fonte de verdade visual, ver acima).
- `portal-frontend/`, `portal-backend/` — código do Portal.
- `design-system/`, `DESIGN.md` — documentação visual auxiliar extraída de `app/src`; nunca
  fonte primária.
- `referencias/` — material de referência de design de terceiros (brand guidelines),
  consulta pontual.
- `knowledge/Historico/` — Contrato Soberano e mapas do legado (planilha oficial anterior).
- `knowledge/Produto/` — SPECs numeradas e documentos de produto históricos (PRD, planos).
- `knowledge/Arquitetura/` — ADRs do "Sistema B" (histórico, código ausente deste
  repositório) — reaproveitáveis como raciocínio, não como código.
- `knowledge/Deploy/` — documentação de infraestrutura (nunca chegou a servir aplicação real
  em produção).
- `knowledge/Governanca/` — modelo de governança do projeto.
- `knowledge/Workspace/TASK_ROUTER.md` — histórico operacional da fase "Sistema B"/pré-pivô
  (congelado em 2026-07-25); consultar só por contexto histórico específico, não como estado
  atual.
- `knowledge/ARCHITECTURAL_DECISIONS.md` — ADRs de governança/método deste projeto como um
  todo (série própria, vigente).
- `docs/_workspace/` e `docs/handoff/` — histórico legado de auditorias, releases e
  handoffs; o estado operacional vigente fica em `criativododo-memory` após `/inicio`.

## Convenções permanentes

Apenas regras já verificáveis em ADR ou no código hoje:

- `app/`, `portal-frontend/` e `portal-backend/` são projetos independentes — sem workspace
  compartilhado, sem imports cruzados entre pastas. Manter essa independência.
- Stack do Portal: backend Node.js/TypeScript, frontend React+Vite+TypeScript reaproveitando
  a identidade visual de `app/` (`knowledge/ARCHITECTURAL_DECISIONS.md`, ADR-005).
- Vocabulário de domínio de todo código novo: Contrato Soberano (`Colaboração Mensal`,
  `Entrega`, `Envio`, `Obrigação Financeira`) — ADR-006.
- Autenticação da Parceira: Google OIDC federado (Authorization Code Flow + PKCE) — ADR-007.
- Ator "Marca" fora do MVP; sistema single-tenant — ADR-008.

## Fonte de decisão

Quando houver conflito:

- A memória carregada por `/inicio` define o estado operacional vigente; os documentos de
  handoff locais são histórico legado.
- `knowledge/PROJECT_SOURCE_OF_TRUTH.md` define qual documento manda sobre qual assunto.
- `knowledge/Historico/CONTRATO_SOBERANO.md` define domínio soberano (nunca reabrir).
- `knowledge/ARCHITECTURAL_DECISIONS.md` define decisões arquiteturais vigentes deste
  projeto (nunca reabrir sem novo ADR).
- `knowledge/Produto/SPEC-*.md` define o comportamento esperado da SPEC em questão.

## Economia de contexto

O agente deve:

- Ler apenas arquivos necessários.
- Preferir grep/sed a leitura completa.
- Não explorar o repositório sem necessidade.
- Não abrir arquivos fora do escopo.
