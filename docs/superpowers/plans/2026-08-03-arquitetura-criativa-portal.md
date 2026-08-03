# Arquitetura Criativa do Portal DODÔ — Plano de Execução

> **PAUSADO em 2026-08-03.** O responsável do projeto abriu uma Fase 0 de descomissionamento
> do Design System legado (ver `docs/superpowers/specs/2026-08-03-descomissionamento-design-
> system-legado.md`) antes de retomar a escrita destes 13 documentos. O mecanismo de migração
> descrito no Bloco 2 deste plano (banner in-place, sem mover arquivo) fica **substituído**
> pelo arquivamento físico definido na Fase 0 — este plano precisa ser revisado (Tasks 2, 3 e
> 17 em especial) antes de qualquer execução. Nenhuma task deste plano foi executada.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Institucionalizar a arquitetura de produto do Criativo Dodô (ADR-021) e escrever os 13
documentos fundacionais de `docs/design/` que a compõem, migrando `ART_DIRECTION_GUIDE.md` e
`DESIGN.md` sem apagá-los.

**Architecture:** Documentação pura, Markdown, sem código. Ordem de execução: ADR primeiro
(muda a governança), depois cabeçalhos de migração nos dois documentos existentes (aposenta
sem apagar), depois os 13 documentos novos, na ordem de dependência definida no spec (00→12).
Cada documento é uma tarefa isolada e committável — a dependência é de conteúdo (ler o de cima
antes de escrever o de baixo), não de arquivo compartilhado.

**Tech Stack:** Markdown. Nenhum framework, nenhum teste automatizado — este é um plano de
documentação, não de código. "Verificação" em cada tarefa substitui "teste": checagem estrutural
(grep pelas seções obrigatórias) + checagem de conteúdo contra a fonte declarada (nenhum fato
inventado, ADR-003).

**Fonte de verdade desta tarefa:** `docs/superpowers/specs/2026-08-03-arquitetura-criativa-
portal-design.md` (spec aprovado). Todo valor de "Status Arquitetural", toda frase de "critério
de sucesso" e toda referência da Reference Library usados abaixo vêm literalmente desse spec —
nenhum foi reinventado nesta etapa.

## Global Constraints

- Voz: português, minúsculas em título/rótulo de interface **apenas quando o texto citado for
  copy de produto** (ex.: exemplos de `ART_DIRECTION_GUIDE.md`); a prosa dos documentos de
  `docs/design/` em si segue o registro de `DESIGN.md`/`ART_DIRECTION_GUIDE.md` — direto,
  específico, sem ornamento, frases curtas e longas alternadas, sem travessão em copy de
  produto citado, travessão permitido em texto técnico interno (regra já registrada em
  `DESIGN.md` §05, "escopo da regra").
- Vocabulário banido (copy de produto citado como exemplo): incrível, poderoso, transformador,
  revolucionário, jornada, propósito, inspiração, inovação, impacto, empoderamento, "no mundo
  de hoje", crucial, pivotal (`DESIGN.md` §05).
- Nenhum requisito funcional ou regra visual nova sem lastro em `ART_DIRECTION_GUIDE.md`,
  `DESIGN.md`, no commit `5284d81` (PoC `/admin/hoje`), ou em decisão explícita do responsável
  do projeto já registrada no spec — declarar lacuna, nunca presumir (`ADR-003`).
- Todo documento em `docs/design/` carrega, nesta ordem: título → **Status Arquitetural** →
  corpo → **"Como saber que este documento cumpriu sua missão?"** (última seção do arquivo).
- Nenhum componente, token técnico fechado ou tela é criado nesta execução (mandato da sessão).
- Cada tarefa termina com commit próprio, seguindo o "Fluxo obrigatório" do `CLAUDE.md`
  (Auditoria → Plano → Execução → Validação → Commit); o hook de pre-commit já roda lint/build
  das três apps automaticamente a cada commit.

---

## Bloco 1 — Governança (ADR)

### Task 1: Criar ADR-021 em `knowledge/ARCHITECTURAL_DECISIONS.md`

**Files:**
- Modify: `knowledge/ARCHITECTURAL_DECISIONS.md` (inserir após a ADR-020, fim do arquivo)

**Interfaces:**
- Consumes: texto final do ADR-021 já redigido no spec, §2 (bloco ` ```markdown ` completo,
  incluindo a lista "cada camada é fonte de verdade de uma pergunta diferente" adicionada na
  revisão).
- Produces: `ADR-021` — referenciado por "ADR relacionada" em todos os 13 documentos das
  tarefas seguintes.

- [ ] **Step 1: Ler o fim do arquivo para confirmar o ponto de inserção**

Run: `tail -5 knowledge/ARCHITECTURAL_DECISIONS.md`
Expected: arquivo termina logo após a seção "Consequências" da ADR-020, sem ADR-021 existente.

- [ ] **Step 2: Inserir o texto completo do ADR-021**

Copiar literalmente o bloco entre ` ```markdown ` e ` ``` ` da seção 2 do spec
(`docs/superpowers/specs/2026-08-03-arquitetura-criativa-portal-design.md`), incluindo o
parágrafo "Cada camada é fonte de verdade de uma pergunta diferente..." e a lista de sete
itens (Manifesto=valores ... Design System=documenta a implementação), para o fim de
`knowledge/ARCHITECTURAL_DECISIONS.md`, precedido por uma linha `---` de separação, igual ao
padrão já usado entre ADR-019 e ADR-020 no mesmo arquivo.

- [ ] **Step 3: Verificar estrutura**

Run: `grep -n "^## ADR-021" knowledge/ARCHITECTURAL_DECISIONS.md && grep -c "^### " knowledge/ARCHITECTURAL_DECISIONS.md`
Expected: uma linha `## ADR-021 — Arquitetura de Produto do Criativo Dodô...`; a nova ADR
contém as cinco subseções `### Contexto`, `### Decisão`, `### Isso substitui, parcialmente`,
`### Isso continua válido`, `### Consequências`.

- [ ] **Step 4: Commit**

```bash
git add knowledge/ARCHITECTURAL_DECISIONS.md
git commit -m "docs(arquitetura): ADR-021 — hierarquia soberana de decisão de identidade

Institui Marca > Manifesto > Vision Book > Concept Book > Reference
Library > Creative Direction > Visual Language > Design System >
Landing/Portal. Design System passa a ser consumidor da arquitetura,
não seu assunto. Landing e Portal deixam de ter relação de derivação
e passam a ser duas expressões de uma identidade única. Substitui
parcialmente ADR-001 (Landing como SSOT visual única) e ADR-004
(Portal deve derivar da Landing).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Bloco 2 — Migração dos documentos existentes

### Task 2: Cabeçalho de migração em `ART_DIRECTION_GUIDE.md`

**Files:**
- Modify: `ART_DIRECTION_GUIDE.md:1-9` (bloco de abertura, antes de "## 1. Princípios
  Fundamentais")

**Interfaces:**
- Consumes: mapeamento de migração do spec §4, item 1.
- Produces: nenhuma interface consumida por outra tarefa — mas o texto deve citar os nomes
  exatos de arquivo que as Tasks 5–8 e 16 vão criar (`04_CREATIVE_DIRECTION.md`,
  `05_VISUAL_LANGUAGE.md`, `06_SIGNATURE_MOMENTS.md`, `07_EDITORIAL_PATTERNS.md`,
  `12_ANTI_PATTERNS.md`), então esta tarefa deve ser a **última do Bloco 2**, executada depois
  de confirmar esses nomes — não antes.

- [ ] **Step 1: Inserir bloco de estado logo após a linha 5 (antes do "---" da linha 9)**

```markdown

> **Estado: Superseded (parcial) — ver ADR-021.** O conteúdo deste documento foi absorvido
> pela arquitetura de `docs/design/`, instituída pela `ADR-021`
> (`knowledge/ARCHITECTURAL_DECISIONS.md`):
>
> - §1 Princípios Fundamentais, §2 Anti-princípios e §6 Critérios de Revisão →
>   `docs/design/04_CREATIVE_DIRECTION.md`.
> - §3 Gramática Visual e §4 Linguagem Editorial → `docs/design/05_VISUAL_LANGUAGE.md`
>   (estrutura de página também em `docs/design/07_EDITORIAL_PATTERNS.md`).
> - §5 Assinaturas do DODÔ → `docs/design/06_SIGNATURE_MOMENTS.md`.
> - §2 (parte de anti-princípios) → também expandido em `docs/design/12_ANTI_PATTERNS.md`.
> - §7 Impacto no Design System → nota em `docs/design/10_DESIGN_SYSTEM.md`.
>
> Este arquivo permanece como registro histórico e não é apagado. Para decisões de direção de
> arte novas, a fonte de verdade é `docs/design/`, não este arquivo.

```

- [ ] **Step 2: Verificar**

Run: `head -20 ART_DIRECTION_GUIDE.md | grep -c "Superseded"`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add ART_DIRECTION_GUIDE.md
git commit -m "docs(design): marca ART_DIRECTION_GUIDE.md como superseded parcial (ADR-021)

Preservado como registro histórico; aponta para os documentos novos
em docs/design/ que absorveram cada seção.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 3: Cabeçalho de migração em `DESIGN.md`

**Files:**
- Modify: `DESIGN.md:1-12` (bloco de abertura, antes de "## Sumário")

**Interfaces:**
- Consumes: mapeamento de migração do spec §4, item 2.
- Produces: nenhuma interface consumida por outra tarefa. Mesma restrição de ordem que a
  Task 2 — última do bloco, depois de confirmados os nomes de `00_MANIFESTO.md`,
  `01_VISION_BOOK.md`, `10_DESIGN_SYSTEM.md`, `11_COMPONENTS.md`.

- [ ] **Step 1: Inserir bloco de estado logo após a linha 7 (o link para a versão HTML), antes
  do "**v2.0 · fonte...**"**

```markdown

> **Estado: Superseded (parcial) — ver ADR-021.** A Parte I (Identidade, capítulos 01–07) foi
> absorvida por `docs/design/00_MANIFESTO.md` e `docs/design/01_VISION_BOOK.md`. As Partes
> II–VI (tokens, componentes, padrões, acessibilidade, engenharia, governança) permanecem
> como fonte técnica de referência até serem reescritas como `docs/design/10_DESIGN_SYSTEM.md`
> e `docs/design/11_COMPONENTS.md` — hoje `Draft`, não `Vigente`. Nenhum valor técnico deste
> documento foi copiado ou duplicado nesta migração; ele continua sendo a referência para cor,
> tipografia, espaçamento e componentes até essa reescrita acontecer.

```

- [ ] **Step 2: Verificar**

Run: `head -20 DESIGN.md | grep -c "Superseded"`
Expected: `1`

- [ ] **Step 3: Commit**

```bash
git add DESIGN.md
git commit -m "docs(design): marca DESIGN.md como superseded parcial (ADR-021)

Parte I (identidade) absorvida por 00_MANIFESTO/01_VISION_BOOK.
Partes II-VI seguem como referência técnica até reescrita em
10_DESIGN_SYSTEM/11_COMPONENTS.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Bloco 3 — Os 13 documentos de `docs/design/`

Template do bloco "Status Arquitetural" (todo documento abre com ele, logo após o `# Título`):

```markdown
## Status Arquitetural

- **Estado:** <Draft|Vigente>
- **Objetivo:** <uma frase>
- **Responsável:** responsável do projeto
- **ADR relacionada:** ADR-021
- **Depende de:** <lista>
- **Do qual dependem:** <lista>
- **Última revisão:** 2026-08-03
- **Critério para futura revisão:** <frase>
```

### Task 4: `docs/design/00_MANIFESTO.md`

**Files:**
- Create: `docs/design/00_MANIFESTO.md`

**Interfaces:**
- Consumes: `DESIGN.md` §02 (história/posicionamento), §03 (personalidade/princípios) — já
  lidos, ver citações abaixo. Nenhum documento de `docs/design/` upstream (é o primeiro).
- Produces: a crença central da marca, citável literalmente por todos os documentos 01–12.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural:
```
- Estado: Vigente
- Objetivo: distilar a crença central do Criativo Dodô numa declaração curta e memorável.
- Depende de: Marca (substrato pré-existente — DESIGN.md Parte I, código real de app/)
- Do qual dependem: 01_VISION_BOOK, 02_CONCEPT_BOOK, 03_REFERENCE_LIBRARY,
  04_CREATIVE_DIRECTION, 05_VISUAL_LANGUAGE, 06_SIGNATURE_MOMENTS, 07_EDITORIAL_PATTERNS,
  08_CHROME_GUIDELINES, 09_MOTION_LANGUAGE, 10_DESIGN_SYSTEM, 11_COMPONENTS, 12_ANTI_PATTERNS
- Critério para futura revisão: só se a crença central da marca mudar — decisão exclusiva do
  responsável do projeto, nunca por preferência estética de uma sessão.
```

Corpo, nesta ordem de subseções:

1. **A frase.** Abre com a declaração central, isolada, no formato de linha isolada que
   `DESIGN.md` §05 já usa como recurso retórico ("a dodô não entrega um documento e sai. /
   fica."). Basear em: *"marcas não precisam de mais posts. precisam de direção"* (posicionamento
   operacional, `DESIGN.md` §02) e *"marcas não precisam de fórmula. precisam de norte"*
   (landing em produção, versão mais recente — `DESIGN.md` §02 registra que a versão do código
   vale para trabalho novo). Escrever a variante do Portal a partir dessas duas, sem inventar
   uma terceira tagline nova — nomear explicitamente que deriva delas.
2. **Quem é a dodô, em uma frase que não é sobre design.** Agência de direção de marca (não
   produtora de conteúdo) — citar literalmente o diagnóstico de `DESIGN.md` §02: "a maioria das
   marcas não sofre por falta de conteúdo. sofre por falta de direção."
3. **O que o Portal recusa ser.** Não é um painel de métricas de mercado (herdar literalmente
   de `ART_DIRECTION_GUIDE.md` §2, último anti-princípio: "o DODÔ não é um painel de métricas,
   é um produto de relação entre marca e parceira"). Não é um sistema administrativo genérico
   — citar o diagnóstico da sessão anterior (registrado no spec §1) que motivou esta sessão.
4. **O critério de qualidade, como pergunta.** Citar literalmente `DESIGN.md` §03: "isto parece
   um template, ou parece uma decisão que nasceu da dodô? se a resposta for 'template', a
   decisão volta para a mesa." — nomear esta pergunta como o teste de aceitação de qualquer
   peça nova do produto (será referenciado por `04_CREATIVE_DIRECTION.md`).
5. **Para quem este documento fala.** Adaptar `DESIGN.md` §01 ("para quem este livro fala") ao
   escopo específico do Manifesto: quem decide identidade do Portal, hoje e no futuro, e o
   agente de IA que precisa saber a crença antes de gerar qualquer tela.

Fechar com a seção obrigatória:

```markdown
## Como saber que este documento cumpriu sua missão?

Se alguém ler este documento, deve entender por que o Portal (e o Dodô) existe.
```

- [ ] **Step 2: Verificar estrutura**

Run: `grep -c "^## " docs/design/00_MANIFESTO.md`
Expected: `>= 3` (Status Arquitetural, ao menos uma seção de corpo, Como saber que cumpriu).

Run: `grep -q "isto parece um template" docs/design/00_MANIFESTO.md && echo OK`
Expected: `OK` (confirma que a citação literal de DESIGN.md §03 foi preservada, não
parafraseada de memória).

- [ ] **Step 3: Commit**

```bash
git add docs/design/00_MANIFESTO.md
git commit -m "docs(design): 00_MANIFESTO.md

Crença central do Criativo Dodô, derivada do posicionamento já
registrado em DESIGN.md §02-03 — nenhuma tagline nova inventada.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 5: `docs/design/01_VISION_BOOK.md`

**Files:**
- Create: `docs/design/01_VISION_BOOK.md`

**Interfaces:**
- Consumes: `00_MANIFESTO.md` (Task 4), `DESIGN.md` §04 "Como pensamos" (design/produto/
  interface/branding), diagnóstico da sessão anterior (spec §1: "mais consistente, mas ainda
  um sistema administrativo").
- Produces: a ambição de longo prazo, citável por `02_CONCEPT_BOOK.md`.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 00_MANIFESTO; Do qual dependem: 02–12;
Critério para futura revisão: quando a ambição de produto mudar, ou quando Landing e Portal
divergirem visivelmente da sensação pretendida aqui descrita.

Corpo:

1. **O produto que estamos construindo.** Não é um SaaS de gestão — é a materialização de
   produto da segunda frente de serviço da dodô (citar `DESIGN.md` §02: "o Portal DODÔ é a
   materialização de produto dessa segunda frente: gestão da colaboração mensal com
   influenciadoras"). A ambição: que operar o Portal pareça ser atendido pela dodô, não usar um
   sistema genérico de terceiro.
2. **Como o Portal deve ser sentido daqui a alguns anos.** Descrever o gap atual nomeado pelo
   responsável do projeto (spec §1) como ponto de partida da ambição: hoje "mais consistente,
   mas continua parecendo um sistema administrativo bem organizado" — a Vision Book descreve o
   oposto disso: uma ferramenta que qualquer pessoa reconheceria como dodô mesmo sem o
   logotipo (reusar o critério final de `ART_DIRECTION_GUIDE.md` checklist §6, último item).
3. **Que categoria o Portal recusa ser confundido com.** Dashboard de BI/analytics genérico
   (`ART_DIRECTION_GUIDE.md` §2, último anti-princípio) — nomear isso como um limite de
   categoria, não só um anti-princípio de tela.
4. **Landing comunica, Portal opera — a mesma ambição em dois tempos.** A Landing é uma sessão
   de leitura única (primeira impressão); o Portal é usado todo dia, por quem já decidiu
   trabalhar com a dodô. A ambição de longo prazo é que os dois sejam reconhecíveis lado a lado
   como produtos da mesma marca (citar ADR-021, "uma identidade, duas expressões") sem que o
   Portal precise da escala editorial de altura inteira da Landing (que não cabe em uso
   recorrente) nem a Landing precise da densidade funcional do Portal.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve conseguir explicar que produto estamos construindo, e para quem.
```

- [ ] **Step 2: Verificar**

Run: `grep -q "materialização de produto" docs/design/01_VISION_BOOK.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add docs/design/01_VISION_BOOK.md
git commit -m "docs(design): 01_VISION_BOOK.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 6: `docs/design/02_CONCEPT_BOOK.md`

**Files:**
- Create: `docs/design/02_CONCEPT_BOOK.md`

**Interfaces:**
- Consumes: `01_VISION_BOOK.md`, commit `5284d81` (texto completo já lido nesta sessão),
  decisão do usuário sobre como tratar a reconstrução (registrada nesta conversa).
- Produces: o conceito nomeado, citável por `03_REFERENCE_LIBRARY.md` em diante.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 01_VISION_BOOK; Do qual dependem: 03–12;
Critério para futura revisão: se o conceito central deixar de explicar decisões reais já
tomadas no produto.

Corpo, **abrindo obrigatoriamente** com a declaração de reconstrução (exigência já registrada
no spec §7 e nesta conversa — não é negociável, deve ser a primeira coisa que o leitor vê
depois do Status Arquitetural):

```markdown
> **Nota de origem.** O conceito descrito neste documento foi aprovado em discussões do
> projeto ao longo da Sprint Visual, mas nunca foi formalizado num artefato versionado — o
> commit `5284d81` já o cita como "Concept Book / Design Brief aprovados", mas nenhum arquivo
> correspondente existia até esta sessão. Este é o primeiro registro escrito oficial do
> conceito. O conteúdo abaixo foi reconstruído a partir de: `ART_DIRECTION_GUIDE.md` (vigente),
> a prova de conceito `/admin/hoje` (commit `5284d81`), e decisões aprovadas pelo responsável do
> projeto ao longo desta sessão — não é uma transcrição de um documento perdido, porque esse
> documento nunca existiu como arquivo.
```

Depois:

1. **O conceito.** Nomear: "revista, não painel" (ou formulação equivalente que o próprio
   ART_DIRECTION_GUIDE.md já sustenta em toda sua estrutura — critério de revisão §6, item 1:
   "esta tela parece um dashboard genérico?"). Definir o conceito central como a ideia de que
   cada tela do Portal é uma peça editorial que já processou a informação para quem lê, não uma
   grade de dados brutos.
2. **Os pilares do conceito**, cada um já com lastro real, citando a origem:
   - "frase antes do número" (`ART_DIRECTION_GUIDE.md` §1, primeiro princípio).
   - "uma prioridade por tela" (idem, segundo princípio).
   - "densidade elástica" — leitura rápida vs. decisão pausada (idem, princípio 6).
   - a virada de tom no scroll e o chrome que recua, como prova de que o conceito já foi
     testado em produto real (commit `5284d81`).
3. **Como o conceito se expressa diferente em Landing e Portal, sendo a mesma identidade.** A
   Landing é uma revista de capa única (uma leitura, do início ao fim, sem retorno); o Portal é
   uma revista de uso diário (a mesma voz editorial, mas organizada por prioridade de trabalho,
   não por sequência narrativa). Citar `ADR-021` diretamente aqui.
4. **O que o conceito não é.** Não é um tema visual (paleta, ícone) — é uma decisão sobre como
   a informação é processada antes de chegar à tela. Isso justifica por que Design System
   (camada de token) não pode redefinir o conceito, só implementá-lo.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve conseguir explicar por que o Portal é uma redação, não um dashboard.
```

- [ ] **Step 2: Verificar**

Run: `head -20 docs/design/02_CONCEPT_BOOK.md | grep -q "Nota de origem" && echo OK`
Expected: `OK` — confirma que a nota de reconstrução está logo no topo do corpo, não enterrada.

- [ ] **Step 3: Commit**

```bash
git add docs/design/02_CONCEPT_BOOK.md
git commit -m "docs(design): 02_CONCEPT_BOOK.md

Primeira formalização escrita do conceito 'revista, não painel',
citado como aprovado desde o commit 5284d81 mas nunca antes
registrado em arquivo. Reconstrução declarada explicitamente.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 7: `docs/design/03_REFERENCE_LIBRARY.md`

**Files:**
- Create: `docs/design/03_REFERENCE_LIBRARY.md`

**Interfaces:**
- Consumes: `02_CONCEPT_BOOK.md`; as 12 referências já integralmente redigidas no spec §5
  (versão pós-ajuste, formato de 4 campos).
- Produces: repertório citável por `04_CREATIVE_DIRECTION.md` em diante.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 02_CONCEPT_BOOK; Do qual dependem: 04–12;
Critério para futura revisão: a cada nova referência relevante encontrada, ou quando uma
referência já citada deixar de sustentar o princípio a ela associado.

Corpo: abrir com o parágrafo de enquadramento do spec §5 ("Este não é um moodboard: é pesquisa
com rastreabilidade...", incluindo os quatro campos obrigatórios listados). Depois, transcrever
as 12 entradas do spec §5 **literalmente**, expandindo cada uma de formato telegráfico para
prosa completa (2–4 frases por campo, mantendo os quatro campos e os apontamentos exatos de
documento+seção já decididos no spec — não trocar nenhum apontamento por outro).

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir apontar, para qualquer princípio da Creative Direction, de onde ele veio.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "^[0-9]*\. \*\*" docs/design/03_REFERENCE_LIBRARY.md`
Expected: `12` (uma entrada por referência).

Run: `grep -c "Aparece em:" docs/design/03_REFERENCE_LIBRARY.md`
Expected: `12` (todo item tem o quarto campo obrigatório).

- [ ] **Step 3: Commit**

```bash
git add docs/design/03_REFERENCE_LIBRARY.md
git commit -m "docs(design): 03_REFERENCE_LIBRARY.md

12 referências (editorial, moda, fotografia, museus, cinema,
publicações, estúdios criativos, produtos digitais) com os quatro
campos obrigatórios: o que aprendemos, o que não copiar, princípio
extraído, onde aparece na arquitetura.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 8: `docs/design/04_CREATIVE_DIRECTION.md`

**Files:**
- Create: `docs/design/04_CREATIVE_DIRECTION.md`

**Interfaces:**
- Consumes: `02_CONCEPT_BOOK.md`, `03_REFERENCE_LIBRARY.md`, `ART_DIRECTION_GUIDE.md` §1
  (Princípios Fundamentais, tabela de 12 linhas), §2 (Anti-princípios, 17 itens), §6 (Critérios
  de Revisão, 13 itens de checklist).
- Produces: princípios de julgamento citáveis por `05`–`09`.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 02_CONCEPT_BOOK, 03_REFERENCE_LIBRARY; Do
qual dependem: 05, 06, 07, 08, 09; Critério para futura revisão: sempre que uma tela aprovada
quebrar um princípio listado aqui sem exceção registrada.

Corpo: migrar `ART_DIRECTION_GUIDE.md` §1, §2 e §6 **por completo e literalmente** (as três
tabelas/listas inteiras — 12 princípios, 17 anti-princípios, 13 itens de checklist — não são
resumidas, são o núcleo deste documento). Adicionar, antes das tabelas migradas, um parágrafo
de abertura que amarra este documento ao conceito ("revista, não painel", `02_CONCEPT_BOOK.md`)
e cita explicitamente 2–3 referências de `03_REFERENCE_LIBRARY.md` que sustentam os princípios
mais centrais (Vignelli → hierarquia por peso; Rams → vazio como decisão; A24 → interface a
serviço do conteúdo — usar os apontamentos "Aparece em" já definidos na Task 7).

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve orientar decisões visuais sem falar de componentes.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "^|" docs/design/04_CREATIVE_DIRECTION.md`
Expected: linhas de tabela consistentes com as 3 tabelas migradas (cabeçalho + separador +
linhas de dados de cada uma — deve bater com a contagem em `ART_DIRECTION_GUIDE.md` para as
mesmas seções, `grep -c "^|" ART_DIRECTION_GUIDE.md`, descontando as seções não migradas).

- [ ] **Step 3: Commit**

```bash
git add docs/design/04_CREATIVE_DIRECTION.md
git commit -m "docs(design): 04_CREATIVE_DIRECTION.md

Migra ART_DIRECTION_GUIDE.md §1 (princípios), §2 (anti-princípios) e
§6 (critérios de revisão) por completo, ancorados no Concept Book e
na Reference Library.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 9: `docs/design/05_VISUAL_LANGUAGE.md`

**Files:**
- Create: `docs/design/05_VISUAL_LANGUAGE.md`

**Interfaces:**
- Consumes: `04_CREATIVE_DIRECTION.md`, `ART_DIRECTION_GUIDE.md` §3 (Gramática Visual) e §4
  (Linguagem Editorial).
- Produces: gramática citável por `06`–`09`.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 04_CREATIVE_DIRECTION; Do qual dependem: 06,
07, 08, 09; Critério para futura revisão: quando Creative Direction mudar, ou quando um padrão
de composição recorrente não estiver coberto por nenhuma regra aqui.

Corpo: migrar `ART_DIRECTION_GUIDE.md` §3 (todas as 7 subseções: como uma página começa/
termina, como assuntos são separados, como decisões importantes aparecem, como listas
funcionam, como números são apresentados, como títulos são escritos, como o espaço em branco
muda) e §4 (as 5 dimensões: ritmo, temperatura, tom, densidade, velocidade de leitura) por
completo. Adicionar uma nota de abertura conectando este documento ao conceito "revista, não
painel" e citando a referência Apartamento (tom/imperfeição deliberada) e Aesop (ritmo de
parágrafo) de `03_REFERENCE_LIBRARY.md`.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir reconhecer a linguagem do produto antes mesmo de existir um componente.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "^\*\*Como" docs/design/05_VISUAL_LANGUAGE.md`
Expected: `7` (as sete subseções "Como uma página começa" etc. de §3, preservadas como
cabeçalhos em negrito, igual ao original).

- [ ] **Step 3: Commit**

```bash
git add docs/design/05_VISUAL_LANGUAGE.md
git commit -m "docs(design): 05_VISUAL_LANGUAGE.md

Migra ART_DIRECTION_GUIDE.md §3 (gramática visual) e §4 (linguagem
editorial) por completo.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 10: `docs/design/06_SIGNATURE_MOMENTS.md`

**Files:**
- Create: `docs/design/06_SIGNATURE_MOMENTS.md`

**Interfaces:**
- Consumes: `05_VISUAL_LANGUAGE.md`, `ART_DIRECTION_GUIDE.md` §5 (Assinaturas do DODÔ, tabela
  de 14 linhas), commit `5284d81` (assinaturas novas testadas na PoC: chrome flutuante que
  recua, virada de tom no scroll, seleção do artefato real em destaque).
- Produces: lista de assinaturas oficiais, citável por `07`, `10`, `11`.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 05_VISUAL_LANGUAGE; Do qual dependem: 07, 10,
11; Critério para futura revisão: quando uma nova PoC validar uma assinatura ainda não
catalogada aqui.

Corpo: migrar a tabela de 14 assinaturas de `ART_DIRECTION_GUIDE.md` §5 por completo. Adicionar
duas entradas novas, no mesmo formato de tabela (Nome | Descrição | Motivação | Exemplo de
aplicação), documentando o que a PoC `/admin/hoje` validou e que ainda não estava na lista
original:
- **Chrome que recua** — a moldura do produto (navegação, cabeçalho) recua na abertura da tela
  e retorna conforme o scroll avança, cedendo espaço à manchete. Motivação: a abertura de uma
  tela-bandeira é a primeira impressão, chrome de produto não deveria competir com ela.
- **Virada de tom no scroll** — a tela muda de registro (de editorial/abertura para
  funcional/lista) num ponto de transição marcado, via `IntersectionObserver`, não por scroll
  contínuo genérico. Motivação: reforça a "densidade elástica" (`ART_DIRECTION_GUIDE.md` §1)
  como transição perceptível, não uma mudança arbitrária.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir apontar uma tela como "isto é Dodô" ou "isto não é" sem consultar mais nada.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "^|" docs/design/06_SIGNATURE_MOMENTS.md`
Expected: contagem de linhas de tabela >= à de `ART_DIRECTION_GUIDE.md` §5 + 2 novas entradas
(cabeçalho + separador + 16 linhas de dados).

- [ ] **Step 3: Commit**

```bash
git add docs/design/06_SIGNATURE_MOMENTS.md
git commit -m "docs(design): 06_SIGNATURE_MOMENTS.md

Migra as 14 assinaturas de ART_DIRECTION_GUIDE.md §5 e cataloga duas
novas, validadas pela PoC /admin/hoje (5284d81): chrome que recua e
virada de tom no scroll.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 11: `docs/design/07_EDITORIAL_PATTERNS.md`

**Files:**
- Create: `docs/design/07_EDITORIAL_PATTERNS.md`

**Interfaces:**
- Consumes: `05_VISUAL_LANGUAGE.md`, `06_SIGNATURE_MOMENTS.md`, `ART_DIRECTION_GUIDE.md` §3
  (subseções "como uma página começa/termina/decisões/listas", reaproveitadas aqui sob a lente
  de estrutura de tela, não de gramática).
- Produces: padrões de composição citáveis por `10`, `11`.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 05_VISUAL_LANGUAGE, 06_SIGNATURE_MOMENTS; Do
qual dependem: 10, 11; Critério para futura revisão: quando um novo tipo de tela recorrente não
se encaixar em nenhum padrão catalogado aqui.

Corpo: nomear e descrever os padrões estruturais recorrentes de tela do Portal, cada um como
sequência de blocos (não como componente), derivados diretamente de `ART_DIRECTION_GUIDE.md`
§3:
1. **Padrão "tela de leitura"** (abertura → frase de estado → indicadores → fim) — para
   dashboards/painéis.
2. **Padrão "tela de decisão"** (contexto → frase que explica a decisão → ação, com espaço
   generoso) — para aprovar/recusar/pagar/confirmar.
3. **Padrão "lista de trabalho"** (densa, uma linha por item, sinalização por peso/traço) —
   para filas e pendências.
4. **Padrão "tela-bandeira"** — o padrão novo validado por `/admin/hoje`: abertura assimétrica,
   manchete em escala dramática, artefato real em destaque, chrome que recua, virada de tom no
   scroll para a lista de trabalho do dia. Citar `06_SIGNATURE_MOMENTS.md` diretamente.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir montar a estrutura de uma tela nova sem inventar a ordem dos blocos do zero.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "^### Padrão" docs/design/07_EDITORIAL_PATTERNS.md`
Expected: `4`

- [ ] **Step 3: Commit**

```bash
git add docs/design/07_EDITORIAL_PATTERNS.md
git commit -m "docs(design): 07_EDITORIAL_PATTERNS.md

Quatro padrões estruturais de tela (leitura, decisão, lista de
trabalho, tela-bandeira), derivados de ART_DIRECTION_GUIDE.md §3 e da
PoC /admin/hoje.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 12: `docs/design/08_CHROME_GUIDELINES.md`

**Files:**
- Create: `docs/design/08_CHROME_GUIDELINES.md`

**Interfaces:**
- Consumes: `05_VISUAL_LANGUAGE.md`, `06_SIGNATURE_MOMENTS.md` (entrada "chrome que recua"),
  código real de `portal-frontend/src/lib/pageHeader.tsx` e `PortalLayout` (para descrever o
  chrome existente sem inventar comportamento) — checar rapidamente antes de escrever.
- Produces: regras de chrome citáveis por `10`, `11`.

- [ ] **Step 1: Ler o chrome real do Portal antes de descrever seu comportamento**

Run: `sed -n '1,40p' portal-frontend/src/lib/pageHeader.tsx`

Usar o que existir de fato (título de página, eyebrow, breadcrumb) como base do que é "chrome"
hoje — não inventar um mecanismo que o código não tem.

- [ ] **Step 2: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 05_VISUAL_LANGUAGE; Do qual dependem: 10, 11;
Critério para futura revisão: quando o comportamento do chrome mudar em qualquer produto.

Corpo:
1. **O que é chrome, o que é conteúdo.** Definição operacional: chrome é tudo que orienta a
   pessoa sobre onde ela está (navegação, cabeçalho, breadcrumb); conteúdo é a informação real
   do negócio. Regra: chrome nunca compete visualmente com conteúdo (herdar de
   `ART_DIRECTION_GUIDE.md` §1, "interface a serviço do conteúdo").
2. **Comportamento padrão** (telas de leitura/decisão/lista) — chrome fixo, discreto, eyebrow +
   título, sem recuo.
3. **Comportamento na tela-bandeira** — chrome recua na abertura, cede espaço à manchete,
   retorna com o scroll (citar `06_SIGNATURE_MOMENTS.md`, "chrome que recua", e o mecanismo
   real já implementado em `/admin/hoje`).
4. **O que nunca é chrome.** Nenhum elemento decorativo vira chrome — se não orienta a pessoa
   sobre onde ela está, é conteúdo mal categorizado ou decoração a remover.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir decidir se um elemento é "chrome" ou "conteúdo" sem ambiguidade.
```

- [ ] **Step 3: Verificar**

Run: `grep -c "^## " docs/design/08_CHROME_GUIDELINES.md`
Expected: `>= 3`

- [ ] **Step 4: Commit**

```bash
git add docs/design/08_CHROME_GUIDELINES.md
git commit -m "docs(design): 08_CHROME_GUIDELINES.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 13: `docs/design/09_MOTION_LANGUAGE.md`

**Files:**
- Create: `docs/design/09_MOTION_LANGUAGE.md`

**Interfaces:**
- Consumes: `05_VISUAL_LANGUAGE.md`, `ART_DIRECTION_GUIDE.md` §7 ("Uso deliberado de
  `--ease-editorial`"), commit `5284d81` (`IntersectionObserver` para virada de tom).
- Produces: princípios de motion citáveis por `10`, `11`.

- [ ] **Step 1: Confirmar a curva declarada no código antes de escrever**

Run: `grep -rn "ease-editorial" app/src portal-frontend/src 2>/dev/null`

Usar o valor real encontrado (não inventar um novo nome de curva).

- [ ] **Step 2: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: 05_VISUAL_LANGUAGE; Do qual dependem: 10, 11;
Critério para futura revisão: quando uma nova curva ou gatilho de movimento for validado em
produto real.

Corpo:
1. **Quando algo se move.** Só em resposta a uma mudança real de estado (herdar
   `ART_DIRECTION_GUIDE.md` §2: "animações decorativas sem relação com uma mudança real de
   estado" é anti-princípio). Gatilhos legítimos: troca de prioridade visual, aparecimento de
   sublinhado de ênfase, transição de tom (scroll) numa tela-bandeira.
2. **A curva.** `--ease-editorial`, com o valor real confirmado no Step 1 — citar onde já está
   declarada e onde ainda não é usada (`ART_DIRECTION_GUIDE.md` §7 já registrava isso como
   pendência antes desta sessão).
3. **O gatilho de scroll como motion, não como decoração.** Descrever o mecanismo real da PoC
   (`IntersectionObserver`, não scroll-jacking genérico) como o padrão de referência para
   qualquer futura virada de tom.
4. **O que nunca é motion legítimo.** Qualquer animação cujo único propósito é "parecer
   moderno" — sem gatilho de mudança de estado real, não entra no produto.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir decidir se uma animação proposta é legítima ou decorativa, só com este documento.
```

- [ ] **Step 3: Verificar**

Run: `grep -q "ease-editorial" docs/design/09_MOTION_LANGUAGE.md && echo OK`
Expected: `OK`

- [ ] **Step 4: Commit**

```bash
git add docs/design/09_MOTION_LANGUAGE.md
git commit -m "docs(design): 09_MOTION_LANGUAGE.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 14: `docs/design/10_DESIGN_SYSTEM.md` (constituição apenas)

**Files:**
- Create: `docs/design/10_DESIGN_SYSTEM.md`

**Interfaces:**
- Consumes: `04`–`09` (todos), ponte declarada para `DESIGN.md` Partes II–VI.
- Produces: nada de conteúdo técnico novo — só a constituição, consumida por `11`.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: **Estado: Draft** (não Vigente — mandato explícito da sessão); Depende
de: 04_CREATIVE_DIRECTION, 05_VISUAL_LANGUAGE, 06_SIGNATURE_MOMENTS, 07_EDITORIAL_PATTERNS,
08_CHROME_GUIDELINES, 09_MOTION_LANGUAGE; Do qual dependem: 11_COMPONENTS, `app/`,
`portal-frontend/`; Critério para futura revisão: reescrita completa quando 04–09 estiverem
todos `Vigente` e uma sessão dedicada de engenharia de Design System for aberta.

Corpo (curto, deliberadamente):
1. **Propósito e limite.** Este documento documenta a implementação técnica da linguagem
   definida em 04–09 — não a define. Nenhuma decisão de valor visual (cor, tipografia,
   espaçamento) pode ser tomada aqui sem lastro num dos seis documentos upstream.
2. **Estado atual.** A implementação técnica real hoje vive em `DESIGN.md` Partes II–VI (tokens,
   componentes, padrões, acessibilidade, engenharia) — não duplicada aqui. Este arquivo é a
   constituição; o conteúdo técnico pleno é trabalho de uma sessão futura, marcada como dívida
   arquitetural explícita (ver spec, "Mapa de dependências invertidas", nota sobre 10/11).
3. **O que precisa acontecer antes da reescrita completa.** Lista de checagem: 04–09 todos
   `Vigente`; tokens reais de `app/src/index.css`/`portal-frontend/src/styles/tokens.css`
   revisados contra as novas regras (ex.: `--color-cotton` como "papel", ver
   `ART_DIRECTION_GUIDE.md` §7, item já pendente antes desta sessão).

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve conseguir documentar a linguagem sem redefini-la.
```

- [ ] **Step 2: Verificar**

Run: `grep -q "Estado:\*\* Draft" docs/design/10_DESIGN_SYSTEM.md && echo OK`
Expected: `OK` (confirma que não foi marcado Vigente por engano).

- [ ] **Step 3: Commit**

```bash
git add docs/design/10_DESIGN_SYSTEM.md
git commit -m "docs(design): 10_DESIGN_SYSTEM.md (constituição, Draft)

Apenas propósito/escopo/dependências — conteúdo técnico permanece em
DESIGN.md até reescrita completa numa sessão futura, por mandato
explícito desta sessão (Design System é consequência, não assunto).

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 15: `docs/design/11_COMPONENTS.md` (constituição apenas)

**Files:**
- Create: `docs/design/11_COMPONENTS.md`

**Interfaces:**
- Consumes: `10_DESIGN_SYSTEM.md`.
- Produces: nada consumido por outra tarefa desta sessão — é folha do grafo.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: **Estado: Draft**; Depende de: 10_DESIGN_SYSTEM; Do qual dependem:
nenhum, dentro desta série; Critério para futura revisão: quando um padrão repetido três ou
mais vezes for promovido a componente nomeado (regra já registrada em `DESIGN.md` §06, tabela
"nunca fazemos / sempre fazemos").

Corpo (curto):
1. **Propósito e limite.** Implementação de componentes reais — o nível mais concreto da
   arquitetura. Nenhuma decisão de identidade nova pode ser tomada aqui; toda decisão já foi
   tomada rio acima.
2. **Por que não há conteúdo além disto, nesta sessão.** Mandato explícito: esta sessão não cria
   componentes nem implementa telas. A duplicação real já diagnosticada em `DESIGN.md` §06 (os
   objetos de estilo inline `estiloInput`, `estiloBotaoOutlineCherry` copiados em 5 arquivos
   administrativos) é o primeiro candidato a componente nomeado quando esta reescrita
   acontecer — registrado aqui como ponto de partida, não resolvido agora.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir implementar um componente sem tomar nenhuma decisão de identidade nova.
```

- [ ] **Step 2: Verificar**

Run: `grep -q "Estado:\*\* Draft" docs/design/11_COMPONENTS.md && echo OK`
Expected: `OK`

- [ ] **Step 3: Commit**

```bash
git add docs/design/11_COMPONENTS.md
git commit -m "docs(design): 11_COMPONENTS.md (constituição, Draft)

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

### Task 16: `docs/design/12_ANTI_PATTERNS.md`

**Files:**
- Create: `docs/design/12_ANTI_PATTERNS.md`

**Interfaces:**
- Consumes: todos os documentos 00–11 (é o espelho negativo de cada um), `ART_DIRECTION_GUIDE.md`
  §2 (17 anti-princípios já existentes), `DESIGN.md` §06 (tabela "nunca fazemos").
- Produces: nada consumido formalmente por outra tarefa; é referenciado por todos.

- [ ] **Step 1: Escrever o arquivo**

Status Arquitetural: Estado Vigente; Depende de: todos (00–11); Do qual dependem: nenhum
formalmente, mas informa toda revisão de tela nova; Critério para futura revisão: a cada nova
tela revisada contra a Creative Direction — este é o documento com maior frequência esperada de
crescimento.

Corpo: migrar `ART_DIRECTION_GUIDE.md` §2 (17 itens) por completo, expandido com a tabela
"nunca fazemos / sempre fazemos" de `DESIGN.md` §06 (que cobre casos de engenharia/duplicação
de código, não só de composição visual — ex.: `.acumin-bold`, objetos de estilo inline
copiados). Organizar em duas subseções: **"anti-padrões de identidade"** (os 17 de
`ART_DIRECTION_GUIDE.md`) e **"anti-padrões de implementação"** (os de `DESIGN.md` §06).
Incluir o mecanismo de exceção já citado no ADR-021 e na Reference Library (referência #9, NASA
Graphics Standards Manual): toda exceção exige justificativa registrada junto à tela que a
solicita.

Fechar com:

```markdown
## Como saber que este documento cumpriu sua missão?

Deve permitir rejeitar uma tela errada apontando o item exato da lista, sem debater gosto.
```

- [ ] **Step 2: Verificar**

Run: `grep -c "^- " docs/design/12_ANTI_PATTERNS.md`
Expected: `>= 17` (ao menos os 17 itens de identidade migrados, mais os de implementação).

- [ ] **Step 3: Commit**

```bash
git add docs/design/12_ANTI_PATTERNS.md
git commit -m "docs(design): 12_ANTI_PATTERNS.md

Migra os 17 anti-princípios de ART_DIRECTION_GUIDE.md §2 e a tabela
'nunca fazemos' de DESIGN.md §06, organizados em anti-padrões de
identidade vs. de implementação.

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

---

## Bloco 4 — Fechar a migração e validar tudo

### Task 17: Cabeçalhos de migração finais + validação de aceite completa

Agora que os 13 arquivos existem com nomes confirmados, executar as Tasks 2 e 3 (cabeçalhos de
`ART_DIRECTION_GUIDE.md` e `DESIGN.md`) se ainda não tiverem sido feitas nesta ordem, e rodar a
validação final contra o checklist do spec §7.

**Files:**
- Modify: `ART_DIRECTION_GUIDE.md`, `DESIGN.md` (se as Tasks 2/3 foram adiadas até aqui)

- [ ] **Step 1: Confirmar que Tasks 2 e 3 foram executadas**

Run: `grep -l "Superseded" ART_DIRECTION_GUIDE.md DESIGN.md`
Expected: os dois arquivos listados. Se algum faltar, executar a task correspondente agora.

- [ ] **Step 2: Verificar todos os 13 arquivos existem com Status Arquitetural completo**

Run:
```bash
for f in docs/design/*.md; do
  echo "== $f =="
  grep -c "^- \*\*Estado:\*\*\|^- \*\*Objetivo:\*\*\|^- \*\*ADR relacionada:\*\*\|^- \*\*Depende de:\*\*\|^- \*\*Do qual dependem:\*\*" "$f"
done
```
Expected: `5` para cada um dos 13 arquivos (cinco campos-chave do Status Arquitetural
presentes).

- [ ] **Step 3: Verificar que todos têm a seção de critério de sucesso**

Run: `grep -lc "Como saber que este documento cumpriu sua missão" docs/design/*.md | wc -l`
Expected: `13`

- [ ] **Step 4: Rodar lint/build das três apps (nenhuma deveria ser afetada, mas confirmar)**

Run: `(cd app && npm run lint && npm run build) && (cd portal-frontend && npm run lint && npm run build) && (cd portal-backend && npm run typecheck && npm run build)`
Expected: todos os comandos terminam com sucesso, sem diffs de código (só documentação foi
alterada nesta sessão).

- [ ] **Step 5: Commit final (se sobrar algo solto de Tasks 2/3)**

```bash
git status --short
# se houver pendência de ART_DIRECTION_GUIDE.md ou DESIGN.md sem commit:
git add ART_DIRECTION_GUIDE.md DESIGN.md
git commit -m "docs(design): fecha migração de ART_DIRECTION_GUIDE.md e DESIGN.md

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

- [ ] **Step 6: Push e abertura de PR draft**

```bash
git push -u origin feat/portal-dashboard-sprint2
gh pr create --draft --title "docs(design): arquitetura criativa do Portal DODÔ (ADR-021 + docs/design/)" --body "$(cat <<'EOF'
## Summary
- ADR-021: nova hierarquia soberana de decisão de identidade (Marca → Manifesto → Vision Book →
  Concept Book → Reference Library → Creative Direction → Visual Language → Design System →
  Landing/Portal), substituindo parcialmente ADR-001/ADR-004.
- 13 documentos fundacionais em `docs/design/` — conteúdo completo em 00-09/12, constituição em
  10-11 (Draft, por mandato explícito: Design System é consequência, não assunto desta sessão).
- `ART_DIRECTION_GUIDE.md` e `DESIGN.md` marcados como superseded parcial, preservados como
  histórico.

Nenhum componente, tela ou token técnico foi alterado. Sessão de Product Design / Creative
Direction, não de engenharia.

## Test plan
- [ ] Revisar ADR-021 contra ADR-001/ADR-004 (nenhuma contradição não declarada)
- [ ] Revisar os 13 documentos contra o spec aprovado
      (`docs/superpowers/specs/2026-08-03-arquitetura-criativa-portal-design.md`)
- [ ] Confirmar que `02_CONCEPT_BOOK.md` declara a reconstrução na abertura
- [ ] Confirmar que nenhum arquivo antigo foi apagado

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review (executado ao escrever este plano)

**Cobertura do spec:** ADR-021 (Task 1), migração dos dois documentos (Tasks 2, 3, 17), os 13
documentos (Tasks 4–16), critérios de aceite do spec §7 todos endereçados por alguma tarefa
(mapa de dependência invertida e critério de sucesso por documento são conteúdo obrigatório
dentro de cada task de escrita, não uma task separada, porque pertencem ao arquivo, não ao
processo).

**Placeholder scan:** nenhum "TBD"/"preencher depois" — toda task cita a fonte exata
(arquivo:seção) de onde o conteúdo vem, e toda frase obrigatória (Status Arquitetural, critério
de sucesso) está com o texto final, não uma descrição do texto.

**Consistência de nomes:** os 13 nomes de arquivo (`00_MANIFESTO.md` … `12_ANTI_PATTERNS.md`)
são usados de forma idêntica em todas as tasks que os referenciam como dependência — checado
contra a tabela do spec §3.

**Ordem:** Bloco 1 (ADR) → Bloco 2 (migração, mas cabeçalhos finais adiados para depois dos
nomes existirem, Task 17) → Bloco 3 (os 13 documentos, na ordem de dependência 00→12) — cumpre
a ordem pedida pelo usuário ("ADR → migração → escrita dos documentos") sem criar uma
dependência de arquivo impossível (o cabeçalho de migração cita nomes de arquivos que só
existem depois do Bloco 3).
