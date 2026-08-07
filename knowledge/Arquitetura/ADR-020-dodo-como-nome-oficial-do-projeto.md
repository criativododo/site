# ADR-020 · "DODÔ" como nome oficial do projeto (aposentadoria do codinome técnico "TEAR")

**Status:** Aceito — decisão tomada pelo responsável do projeto em sessão de
2026-07-24.

**Resolve:** a dualidade entre o nome técnico interno do projeto ("Projeto
TEAR", usado em `CLAUDE.md`, ADRs, SPECs e em todo o histórico de
`docs/_workspace/TASK_ROUTER.md` desde o início) e o rebranding institucional
da marca comercial ("Criativo Dodô" → "Criativo Dodô", `ADR-019`), que até esta
decisão cobria só a marca, não o codinome técnico do projeto.

## Contexto

- O rebranding comercial já estava formalizado: "Criativo Dodô" → "Criativo
  Dodô" (anunciado e registrado em `TASK_ROUTER.md` §49/§50, consolidado no
  Design System v2.0 via `ADR-019`, §59/§60).
- "TEAR" nunca foi o nome da marca — é o codinome técnico/interno do
  projeto, presente em `CLAUDE.md` ("Projeto TEAR — plataforma Influencia"),
  em `docs/history/CONTRATO_SOBERANO.md`, em SPECs (`docs/specs/SPEC-NNN.md`)
  e em ADRs anteriores.
- Em 2026-07-24, o responsável decidiu aposentar também esse codinome
  técnico, unificando nome comercial e nome técnico do projeto sob "DODÔ" —
  eliminando a dualidade TEAR (interno) / Dodô (comercial).
- "Influencia" (nome da plataforma, `plataforma **Influencia**` em
  `CLAUDE.md`) **não** foi incluída nesta aposentadoria — só o codinome
  "TEAR" e a marca "Criativo Dodô"/"ELÃ" são tratados como legado por esta
  decisão.

## Decisão

1. **"DODÔ" passa a ser o nome oficial do projeto**, tanto comercial quanto
   tecnicamente — substitui "Projeto TEAR" como identificador do projeto
   daqui em diante.
2. **"TEAR" vira nomenclatura legada** — só pode aparecer descrevendo
   histórico, migração ou documentação legada (ex.: `docs/history/`,
   entradas antigas de `TASK_ROUTER.md`, SPECs já existentes, ADRs
   anteriores). Documentos históricos **não são reescritos retroativamente**
   só por causa desta decisão — "TEAR" continua correto nesses contextos,
   como registro histórico.
3. **Toda documentação, ADRs, SPECs, commits, prompts e arquivos novos daqui
   em diante usam exclusivamente "DODÔ"** como nome do projeto — nunca
   "TEAR" ou "Criativo Dodô" em conteúdo novo (exceto ao descrever histórico).
4. **Nenhuma mudança técnica/física é feita por esta ADR.** O diretório
   físico do repositório (`criativododo/`), o repositório Git, remotes,
   branches, scripts e demais identificadores técnicos permanecem
   inalterados. Uma eventual migração física será tratada como iniciativa
   própria, em momento futuro, fora do escopo desta decisão.
5. Esta decisão **amplia o escopo de `ADR-019`** (que tratava só da
   identidade visual/marca comercial) para o nome do projeto como um todo —
   não a revoga, complementa.

## Consequências

- `CLAUDE.md` é atualizado para refletir "DODÔ" como nome do projeto, com
  nota explicando a origem do nome técnico anterior ("TEAR") para contexto
  de quem ler documentação histórica.
- Nenhum SPEC, ADR anterior, ou entrada histórica de `TASK_ROUTER.md`
  precisa ser reescrita — "TEAR" continua correto nesses contextos.
- Referências futuras ao projeto (em novas SPECs, ADRs, commits,
  documentação, prompts) devem usar "DODÔ", nunca "TEAR" ou "Criativo Dodô"
  (exceto ao descrever histórico ou migração).
- Nenhuma rota, controller, model, variável de ambiente ou infraestrutura é
  afetada — esta ADR é estritamente sobre nomenclatura/identidade do
  projeto na documentação e em conteúdo novo.
