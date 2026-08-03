# Arquitetura Criativa do Portal DODÔ — Spec

**Data:** 2026-08-03
**Papel do agente nesta sessão:** Product Designer / Creative Director / Design Architect — não Front-end Engineer.
**Resultado esperado:** documentação fundacional da linguagem visual em `docs/design/`, mais um novo ADR de governança. Nenhum componente, nenhuma tela, nenhum código de produto é alterado nesta sessão.

---

## 1. Contexto e motivação

A Sprint 1 (Fase A — fundação do Design System) e a Sprint 2 (Fase B — hierarquia, dashboard,
navegação) do Portal foram implementadas e aprovadas seguindo `ADR-004` (toda evolução visual
do Portal deve derivar da Landing). O resultado, avaliado pelo responsável do projeto na sessão
de 2026-08-03, foi: "mais consistente, mas continua parecendo um sistema administrativo bem
organizado, e não um produto premium."

Em paralelo, o commit `5284d81` ("prova de conceito da tela-bandeira 'hoje'") testou
deliberadamente romper essa derivação estrita — composição assimétrica, manchete em escala
dramática, chrome flutuante que recua, virada de tom no scroll — citando um "Concept Book /
Design Brief aprovados (Creative Direction)" como já existentes. Uma auditoria do repositório
e da memória operacional (`git log --all`, busca textual) não encontrou esses artefatos em
nenhum arquivo: foram aprovados em conversa, nunca escritos.

Ao mesmo tempo, dois documentos já vigentes cobrem parcialmente o mesmo território:

- **`ART_DIRECTION_GUIDE.md`** (206 linhas, status "vigente") — princípios, anti-princípios,
  gramática visual, linguagem editorial, assinaturas do DODÔ, critérios de revisão, impacto no
  Design System. É, hoje, o documento mais próximo de uma Creative Direction real.
- **`DESIGN.md`** ("o livro da dodô") — documento monolítico único que mistura identidade,
  tokens, componentes, padrões e governança numa hierarquia só. É exatamente o modelo
  "Design System como ponto de partida" que esta sessão existe para substituir.

Existe uma tensão de arquitetura não resolvida: `ADR-001` declara a Landing (`app/`) como SSOT
visual; `ADR-004` proíbe o Portal de ter identidade paralela, exigindo derivação estrita da
Landing. Na prática, a direção que já se mostrou certa (a PoC da tela-bandeira) rompe essa
derivação. Esta sessão formaliza essa mudança por meio de um novo ADR, em vez de deixá-la como
prática tácita não documentada — conforme `ADR-003` (nunca presumir, declarar a lacuna).

---

## 2. ADR-021 — texto final proposto

> A ser criado em `knowledge/ARCHITECTURAL_DECISIONS.md`, como próxima entrada da série de
> governança do projeto (a última hoje é `ADR-020`; `ADR-021`/`022` aparecem na memória
> operacional como "última ADR", mas não existem em nenhum commit deste arquivo — dado obsoleto
> da memória, verificado via `git log --all -p`).

```markdown
## ADR-021 — Arquitetura de Produto do Criativo Dodô: hierarquia soberana de decisão de identidade

- **Status:** Aceito.
- **Data:** 2026-08-03.
- **Autor da decisão:** responsável do projeto.
- **Relaciona-se com:** ADR-001, ADR-004 (parcialmente substituídas por esta).

### Contexto

`ADR-001` declarou a Landing (`app/`) como fonte única de verdade (SSOT) visual do Criativo
DODÔ. `ADR-004` exigiu que toda evolução visual do Portal derivasse dessa Landing, para evitar
uma segunda identidade dentro do mesmo produto. Essas decisões foram corretas para o estágio do
projeto em 2026-07-26, quando o Portal não existia como produto visual coerente.

Desde então, a Fase A e a Fase B da Sprint Visual do Portal foram implementadas seguindo
`ADR-004` à risca — e o resultado, avaliado pelo responsável do projeto, foi um produto "mais
consistente, mas que continua parecendo um sistema administrativo bem organizado, não um
produto premium". Uma prova de conceito isolada (`/admin/hoje`, commit `5284d81`) testou romper
essa derivação estrita e foi avaliada como o caminho certo — mas nunca formalizada como mudança
de arquitetura, permanecendo uma exceção tácita.

### Decisão

Institui-se uma hierarquia soberana de decisão de identidade para todo o produto Criativo
DODÔ:

```
Marca
  ↓
Manifesto
  ↓
Vision Book
  ↓
Concept Book
  ↓
Creative Direction
  ↓
Visual Language
  ↓
Design System
  ↓
Landing / Portal
```

"Marca" não é um documento novo — é o substrato já existente do Criativo Dodô, hoje registrado
em `DESIGN.md` (Parte I) e no código real de `app/`. Cada camada abaixo dela é um documento em
`docs/design/`, decidido nesta ordem e nunca invertido: nenhuma decisão de Design System pode
contradizer a Creative Direction; nenhuma tela de Landing ou Portal pode contradizer o Design
System sem que a contradição suba a arquitetura para ser resolvida na camada correta.

Cada camada é fonte de verdade de uma pergunta diferente, nunca da mesma pergunta que outra
camada já respondeu:

- **Manifesto** define os **valores** — em que a marca acredita.
- **Vision Book** define o **produto** — que produto estamos construindo e para quem.
- **Concept Book** define a **metáfora** — a ideia central que amarra visão a forma.
- **Reference Library** define o **repertório** — o que foi estudado e por quê.
- **Creative Direction** define o **tom** — o critério de julgamento de qualquer peça nova.
- **Visual Language** define a **gramática** — como a linguagem se comporta em uso.
- **Design System** **documenta a implementação** dessa linguagem — não a define, não a
  reinterpreta, não a substitui.

Esta distinção é o núcleo desta ADR: ela existe para impedir que o Design System volte a
concentrar decisões estratégicas de identidade, como aconteceu antes desta sessão (`DESIGN.md`
tratando manifesto, tom e tokens técnicos como um único documento indiferenciado). Um Design
System que redefine a linguagem, em vez de documentá-la, viola esta ADR mesmo que os valores
técnicos resultantes pareçam corretos.

**Design System é consumidor desta arquitetura, não seu assunto.** Esta ADR institui a
arquitetura de produto; não é uma ADR de Design System.

**Existe uma única identidade de marca Criativo Dodô.** Landing e Portal não derivam um do
outro, e não são identidades paralelas — são duas expressões da mesma identidade, apropriadas
a contextos de uso diferentes: a Landing comunica (sessão de leitura pública, primeira
impressão), o Portal opera (ferramenta recorrente de trabalho). Os dois pertencem ao mesmo
universo narrativo e devem ser reconhecíveis, um ao lado do outro, como produtos da mesma
marca — sem que um precise copiar decisões de pixel do outro.

### Isso substitui, parcialmente

- **`ADR-001`**, no que declara a Landing como SSOT visual única: a Landing deixa de ser SSOT
  e passa a ser uma **implementação** da linguagem definida em `docs/design/`, no mesmo nível
  hierárquico que o Portal.
- **`ADR-004`**, no que exige que o Portal derive visualmente da Landing: o Portal deixa de
  precisar derivar da Landing — passa a derivar, como a Landing, da arquitetura documental.

### Isso continua válido

- Os valores de cor, tipografia e espaçamento já extraídos de `app/` (documentados em
  `DESIGN.md`) continuam sendo insumo histórico legítimo para o Design System — não são
  descartados, só deixam de ser a única autoridade.
- O princípio de fundo de `ADR-004` — não fragmentar a marca em identidades desconexas —
  permanece integralmente. Só muda o mecanismo: de derivação direta de código para linguagem
  documentada compartilhada.
- `ADR-002`, `ADR-003`, `ADR-005` a `ADR-020` não são afetadas.

### Consequências

- Toda decisão de identidade visual do Portal (e, quando revisitada, da Landing) passa a ser
  julgada pela arquitetura documental em `docs/design/`, não pelo código de `app/` diretamente.
- `app/` (Landing) pode, no futuro, ser revisitada para melhor expressar a linguagem
  consolidada — não é escopo desta ADR, é um efeito possível, não obrigatório.
- `ART_DIRECTION_GUIDE.md` e `DESIGN.md` são absorvidos pela nova arquitetura documental e
  aposentados via migração controlada (ver §4 do spec desta sessão), preservando histórico via
  `git mv`.
- Nenhuma rota, regra de negócio, dado ou camada de backend é afetada — esta ADR é estritamente
  sobre a camada de identidade de produto.
```

---

## 3. Arquitetura documental — `docs/design/`

Todo documento carrega uma seção fixa **"Status Arquitetural"**, no topo, imediatamente após o
título:

```markdown
## Status Arquitetural

- **Estado:** Draft | Vigente | Superseded
- **Objetivo:** <uma frase>
- **Responsável:** responsável do projeto
- **ADR relacionada:** ADR-021
- **Depende de:** <documentos upstream, ou "Marca" para 00_MANIFESTO>
- **Do qual dependem:** <documentos downstream>
- **Última revisão:** 2026-08-03
- **Critério para futura revisão:** <o que dispararia uma revisão deste documento>
```

| # | Documento | Propósito | Pode decidir | Não pode decidir | Depende de → Do qual depende |
|---|---|---|---|---|---|
| 00 | `00_MANIFESTO.md` | Distila a crença central da marca numa declaração curta — por que o Dodô (e o Portal) existe, o que recusa ser. | A crença central; o que o produto recusa ser. | Regra de execução visual; nada específico de Landing/Portal isolados. | Marca → 01–12 |
| 01 | `01_VISION_BOOK.md` | Ambição de longo prazo — como o Dodô deve ser sentido daqui a anos, em Landing e Portal. | Que sensação o produto produz; que categoria recusa ser confundido com. | Regras de aplicação tática. | 00 → 02 |
| 02 | `02_CONCEPT_BOOK.md` | Conceito nomeado que amarra a visão a uma ideia aplicável. Reconstrução declarada nesta sessão. | O conceito central e seus pilares; como se expressa diferente em Landing vs. Portal, como a mesma identidade. | Valores de token, componentes, curadoria de referências. | 01 → 03 |
| 03 | `03_REFERENCE_LIBRARY.md` | Curadoria crítica de referências externas relevantes ao conceito de 02. Pesquisa → síntese → linguagem. | Quais referências são legítimas / anti-referência. | Regras de aplicação (isso é 04). | 02 → 04 |
| 04 | `04_CREATIVE_DIRECTION.md` | Autoridade de julgamento — princípios, anti-princípios, checklist de aprovação. Absorve ART_DIRECTION_GUIDE.md §1/2/6. | O que é e não é Dodô em qualquer peça nova. | Valores exatos de cor/tipografia/espaçamento. | 02,03 → 05–09 |
| 05 | `05_VISUAL_LANGUAGE.md` | Gramática visual e editorial em ação — ritmo, temperatura, tom, densidade. Absorve ART_DIRECTION_GUIDE.md §3/4. | Regras de composição e voz. | Componentes específicos; valores técnicos fechados. | 04 → 06–09 |
| 06 | `06_SIGNATURE_MOMENTS.md` | Momentos nomeados que sozinhos tornam uma tela reconhecível como Dodô. Absorve ART_DIRECTION_GUIDE.md §5. | Quais são as assinaturas oficiais. | Implementação técnica de cada uma. | 05 → 07,10,11 |
| 07 | `07_EDITORIAL_PATTERNS.md` | Como conteúdo real vira padrão recorrente de tela. Absorve ART_DIRECTION_GUIDE.md §3 (estrutura). | Estrutura narrativa de tipos de tela recorrentes. | Componentes React específicos. | 05,06 → 10,11 |
| 08 | `08_CHROME_GUIDELINES.md` | Comportamento da moldura do produto — navegação, chrome flutuante. | Quando o chrome aparece/recua/desaparece. | Componentes de navegação específicos. | 05 → 10,11 |
| 09 | `09_MOTION_LANGUAGE.md` | Papel do movimento — quando existe, o que significa, curva/tempo. | Quando e por que algo se move; gatilhos legítimos vs. decorativos. | Implementação de animação por componente. | 05 → 10,11 |
| 10 | `10_DESIGN_SYSTEM.md` | Tokens e regras técnicas que tornam 04–09 implementáveis. Nesta sessão: só constituição + ponte para `DESIGN.md` atual (Draft). | Valores técnicos, dado que já derivam de regra a montante. | Inventar regra visual sem lastro em 04–09. | 04–09 → 11, `app/`, `portal-frontend/` |
| 11 | `11_COMPONENTS.md` | Implementação de componentes. Nesta sessão: só constituição (mandato: não criar componentes). | API/comportamento de componente, dado que a decisão visual já foi tomada. | Nada de identidade. | 10 → (folha) |
| 12 | `12_ANTI_PATTERNS.md` | Catálogo do que nunca fazer, com exemplos nomeados. Absorve e expande ART_DIRECTION_GUIDE.md §2. | Adicionar anti-padrão observado em tela real. | Conceder exceções (exige justificativa registrada). | Todos (espelho negativo) |

### Profundidade de conteúdo nesta sessão

- **00–09 e 12:** conteúdo real e completo, escrito nesta sessão.
- **10 e 11:** apenas a constituição (Status Arquitetural + propósito/escopo/decisões), com
  ponte declarada para o conteúdo técnico hoje em `DESIGN.md` — marcados `Draft`, pendentes de
  reescrita completa depois que 04–09 estiverem `Vigente`.

### Mapa de dependências invertidas (blast radius)

A tabela acima responde "de quem eu dependo". Esta responde a pergunta inversa — "se este
documento mudar, quais outros **precisam obrigatoriamente** ser revisados" — como fecho
transitivo do grafo, não só dependência direta. É o mecanismo que evita deriva documental:
nenhuma edição em 00–11 é considerada concluída sem revisar a lista correspondente.

| Se este mudar... | ...revisar obrigatoriamente |
|---|---|
| `00_MANIFESTO` | 01, 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 (todos) |
| `01_VISION_BOOK` | 02, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 |
| `02_CONCEPT_BOOK` | 03, 04, 05, 06, 07, 08, 09, 10, 11, 12 |
| `03_REFERENCE_LIBRARY` | 04, 05, 06, 07, 08, 09, 10, 11, 12 |
| `04_CREATIVE_DIRECTION` | 05, 06, 07, 08, 09, 10, 11, 12 |
| `05_VISUAL_LANGUAGE` | 06, 07, 08, 09, 10, 11, 12 |
| `06_SIGNATURE_MOMENTS` | 07, 10, 11, 12 |
| `07_EDITORIAL_PATTERNS` | 10, 11, 12 |
| `08_CHROME_GUIDELINES` | 10, 11, 12 |
| `09_MOTION_LANGUAGE` | 10, 11, 12 |
| `10_DESIGN_SYSTEM` | 11, 12 |
| `11_COMPONENTS` | 12 |
| `12_ANTI_PATTERNS` | nenhum, formalmente — mas é o único documento com um laço de retorno (ver nota) |

**Nota sobre o laço de retorno de `12_ANTI_PATTERNS`:** é o único ponto do grafo que não é
estritamente unidirecional. Um anti-padrão novo, descoberto numa revisão de tela real, é
sintoma de uma lacuna em `04_CREATIVE_DIRECTION` ou `06_SIGNATURE_MOMENTS` — registrar o
anti-padrão sem revisar o documento de origem trata o sintoma, não a causa. Isso é
intencional (não um erro de modelagem): `12` é o único documento com permissão de sinalizar
revisão rio acima.

**Nota sobre `10`/`11` nesta sessão:** como só recebem a constituição, a obrigação acima
("revisar 10/11 sempre que 04–09 mudar") só passa a valer de fato quando `10_DESIGN_SYSTEM`
for reescrito por completo e passar a `Vigente` — até lá, a linha correspondente fica
registrada como dívida arquitetural explícita, não como pendência silenciosa.

### Critério de sucesso por documento

Todo documento termina com uma seção fixa **"Como saber que este documento cumpriu sua
missão?"** — um critério verificável, não uma lista de conteúdo. Texto-base de cada um,
incorporado literalmente no arquivo correspondente:

| Documento | Como saber que cumpriu sua missão |
|---|---|
| `00_MANIFESTO` | Se alguém ler este documento, deve entender por que o Portal (e o Dodô) existe. |
| `01_VISION_BOOK` | Deve conseguir explicar que produto estamos construindo, e para quem. |
| `02_CONCEPT_BOOK` | Deve conseguir explicar por que o Portal é uma redação, não um dashboard. |
| `03_REFERENCE_LIBRARY` | Deve permitir apontar, para qualquer princípio da Creative Direction, de onde ele veio. |
| `04_CREATIVE_DIRECTION` | Deve orientar decisões visuais sem falar de componentes. |
| `05_VISUAL_LANGUAGE` | Deve permitir reconhecer a linguagem do produto antes mesmo de existir um componente. |
| `06_SIGNATURE_MOMENTS` | Deve permitir apontar uma tela como "isto é Dodô" ou "isto não é" sem consultar mais nada. |
| `07_EDITORIAL_PATTERNS` | Deve permitir montar a estrutura de uma tela nova sem inventar a ordem dos blocos do zero. |
| `08_CHROME_GUIDELINES` | Deve permitir decidir se um elemento é "chrome" ou "conteúdo" sem ambiguidade. |
| `09_MOTION_LANGUAGE` | Deve permitir decidir se uma animação proposta é legítima ou decorativa, só com este documento. |
| `10_DESIGN_SYSTEM` | Deve conseguir documentar a linguagem sem redefini-la. |
| `11_COMPONENTS` | Deve permitir implementar um componente sem tomar nenhuma decisão de identidade nova. |
| `12_ANTI_PATTERNS` | Deve permitir rejeitar uma tela errada apontando o item exato da lista, sem debater gosto. |

---

## 4. Migração de `ART_DIRECTION_GUIDE.md` e `DESIGN.md`

Migração controlada, não exclusão:

1. Conteúdo de `ART_DIRECTION_GUIDE.md` §1/§2/§6 → `04_CREATIVE_DIRECTION.md`; §3/§4 →
   `05_VISUAL_LANGUAGE.md` (+ `07_EDITORIAL_PATTERNS.md` para a parte de estrutura de página);
   §5 → `06_SIGNATURE_MOMENTS.md`; §2 (anti-princípios) também alimenta `12_ANTI_PATTERNS.md`;
   §7 (impacto no Design System) → nota em `10_DESIGN_SYSTEM.md`.
2. Conteúdo de `DESIGN.md` Parte I (identidade, manifesto, personalidade, como pensamos, como
   escrevemos, o que nunca fazemos) → insumo para `00_MANIFESTO.md` e `01_VISION_BOOK.md`.
   Partes II–VI (tokens, componentes, padrões, acessibilidade, engenharia, governança) → ponte
   declarada em `10_DESIGN_SYSTEM.md`/`11_COMPONENTS.md`, permanecendo fisicamente em
   `DESIGN.md` até a reescrita completa (não copiadas nem duplicadas agora).
3. Ambos os arquivos originais recebem, no topo, um cabeçalho de estado apontando para os novos
   documentos correspondentes e marcando-se como `Superseded` nas seções já migradas — nunca
   apagados nesta sessão. `git mv` não se aplica diretamente (é uma redistribuição de conteúdo
   entre múltiplos arquivos novos, não um rename 1:1); o histórico de autoria de cada trecho
   permanece rastreável via `git log -p` nos arquivos originais.

---

## 5. Reference Library — curadoria inicial (para revisão)

Doze referências, cobrindo editorial, moda, fotografia, museus, cinema, publicações, estúdios
criativos e produtos digitais com identidade marcante — nenhuma limitada a SaaS. Este não é um
moodboard: é pesquisa com rastreabilidade. Quatro campos obrigatórios por referência, o quarto
sempre apontando para um documento/seção concreto da arquitetura, nunca para uma "relação"
vaga:

- O que aprendemos.
- O que **não** queremos copiar.
- Qual princípio extraímos.
- Onde esse princípio aparece na arquitetura (documento + seção específicos).

Texto completo será escrito em `03_REFERENCE_LIBRARY.md`; abaixo, a curadoria para validação
antes da prosa final.

1. **Kinfolk** (revista) — Aprendemos: redesign de 10 anos (Schick Toikka) trocou neutralidade
   por tipografia expressiva própria como assinatura. Não copiar: o vazio "escandinavo" como
   estética fria. Princípio: tipografia própria é a assinatura mais barata e mais difícil de
   copiar. Aparece em: `04_CREATIVE_DIRECTION` (papel quente, nunca frio) e `06_SIGNATURE_
   MOMENTS` (título em minúsculas como assinatura tipográfica).
2. **Cereal Magazine** — Aprendemos: grid rígido a serviço da imagem/conteúdo, não da estética
   por si. Não copiar: dependência de fotografia de altíssima produção que o Dodô hoje não tem.
   Princípio: grid rígido não é frieza quando o conteúdo real carrega peso. Aparece em:
   `07_EDITORIAL_PATTERNS` (estrutura fixa de página) e `10_DESIGN_SYSTEM` (grid, quando
   reescrito).
3. **Apartamento** — Aprendemos: imperfeição deliberada sinaliza voz humana por trás do
   produto. Não copiar: a bagunça como estética — o Dodô é preciso, não caótico. Princípio: tom
   de quem fala, não de quem rotula. Aparece em: `05_VISUAL_LANGUAGE` (linguagem editorial,
   tom).
4. **A24** (estúdio de cinema) — Aprendemos: uma marca forte dispensa decoração; o
   reconhecimento vem de decisões repetidas, nunca de ornamento. Não copiar: minimalismo que
   serve a um nicho cinéfilo, não a uma ferramenta de trabalho diário. Princípio: "deixe o
   trabalho falar por si". Aparece em: `04_CREATIVE_DIRECTION` (anti-princípio "componentes
   chamando mais atenção que o conteúdo").
5. **Criterion Collection / MUBI** — Aprendemos: tom de quem seleciona, não de quem vende;
   prova critério a cada peça, não volume. Não copiar: ritmo de consumo lento — o Portal é
   ferramenta de trabalho, não lazer. Princípio: "frase antes do número". Aparece em:
   `05_VISUAL_LANGUAGE` (abertura de página) e `07_EDITORIAL_PATTERNS` (como uma página começa).
6. **Aesop** — Aprendemos: texto explicativo bem escrito substitui decoração visual como prova
   de cuidado. Não copiar: preço/posicionamento de luxo como valor em si. Princípio: copy é
   ingrediente, não preenchimento. Aparece em: `05_VISUAL_LANGUAGE` (ritmo de parágrafo) e
   `08_CHROME_GUIDELINES` (o que é conteúdo vs. o que é chrome).
7. **Bottega Veneta** (moda) — Aprendemos: confiança vem de comportamento consistente, não de
   selo. Não copiar: apagamento total da marca — o Dodô precisa ser identificável sem logo, não
   invisível. Princípio: "ausência de selos". Aparece em: `04_CREATIVE_DIRECTION`
   (anti-princípio já vigente, herdado de `ART_DIRECTION_GUIDE.md` §2).
8. **Cooper Hewitt / Pentagram** — Aprendemos: um sistema tipográfico bem definido carrega
   identidade mais que paleta de cor. Não copiar: escala e orçamento de um projeto de museu
   nacional. Princípio: tipografia própria como âncora de sistema. Aparece em:
   `06_SIGNATURE_MOMENTS` e `10_DESIGN_SYSTEM` (quando reescrito — hierarquia tipográfica antes
   de paleta).
9. **NASA Graphics Standards Manual (1976)** — Aprendemos: sistema de identidade guiado
   inteiramente por princípio e regra de aplicação sobrevive a gerações de quem implementa. Não
   copiar: rigidez absoluta sem espaço para exceção contextual. Princípio: regra clara, poucas
   exceções, todas registradas. Aparece em: `04_CREATIVE_DIRECTION` (mecanismo de exceção
   justificada) e `12_ANTI_PATTERNS` (proibição de exceção sem registro).
10. **Dieter Rams / Braun** — Aprendemos: os dez princípios funcionam como manifesto
    operacional, não como lista de adjetivos soltos. Não copiar: linguagem de produto físico
    industrial 1:1. Princípio: "bom design é o mínimo de design possível". Aparece em:
    `00_MANIFESTO` (formato de crença operacional) e `04_CREATIVE_DIRECTION` (vazio como
    decisão; interface a serviço do conteúdo).
11. **GOV.UK Design Principles** — Aprendemos: documentação "princípio antes de componente"
    funciona mesmo em produto digital de larga escala e alta seriedade. Não copiar: tom
    burocrático-neutro — o Dodô tem voz autoral, GOV.UK deliberadamente não tem. Princípio: "do
    less" e "be consistent, not uniform". Aparece em: `07_EDITORIAL_PATTERNS` (sequência fixa
    de leitura sem exigir telas idênticas).
12. **Massimo Vignelli / grid suíço** — Aprendemos: hierarquia por peso e posição, nunca por
    decoração; tipografia como estrutura. Não copiar: frieza corporativa do estilo suíço puro.
    Princípio: é a origem direta do princípio já vigente "hierarquia por peso, não por escala".
    Aparece em: `04_CREATIVE_DIRECTION` §1 (herdado literalmente de `ART_DIRECTION_GUIDE.md`) —
    esta referência confirma uma decisão já tomada, não inventa uma nova.

---

## 6. Fora de escopo nesta sessão

- Reescrita profunda de `10_DESIGN_SYSTEM.md`/`11_COMPONENTS.md` (tokens técnicos, componentes
  React).
- Qualquer alteração em `app/`, `portal-frontend/`, `portal-backend/`.
- Qualquer decisão sobre propagar a linguagem da PoC `/admin/hoje` ao resto do Portal — isso
  continua sendo o bloqueio já registrado na memória operacional, não resolvido por esta sessão.
- Revisão de `PR #5`.

---

## 7. Critérios de aceite

- [ ] `ADR-021` criado em `knowledge/ARCHITECTURAL_DECISIONS.md`, seguindo o formato das ADRs
      existentes na mesma série, incluindo a lista explícita "cada camada é fonte de verdade de
      uma pergunta diferente" (Manifesto=valores, Vision Book=produto, Concept Book=metáfora,
      Reference Library=repertório, Creative Direction=tom, Visual Language=gramática, Design
      System=documenta a implementação).
- [ ] Os 13 arquivos existem em `docs/design/`, cada um com "Status Arquitetural" e "Como saber
      que este documento cumpriu sua missão?" completos, consistentes com as tabelas de
      dependência direta e invertida acima.
- [ ] `00`–`09` e `12` têm conteúdo real, não placeholder, coerente com `ART_DIRECTION_GUIDE.md`
      e a PoC já aprovada — sem inventar requisito ou regra sem lastro (ADR-003).
- [ ] `02_CONCEPT_BOOK.md` declara explicitamente, na introdução, que é uma reconstrução, nunca
      uma transcrição de artefato perdido.
- [ ] `03_REFERENCE_LIBRARY.md` segue o formato de quatro campos obrigatórios por referência
      (o que aprendemos / o que não copiar / princípio / onde aparece na arquitetura), nunca
      formato de moodboard.
- [ ] `ART_DIRECTION_GUIDE.md` e `DESIGN.md` recebem cabeçalho de estado/redirecionamento,
      preservados, não apagados.
- [ ] Nenhum componente, tela ou token técnico novo é criado.
- [ ] Commit único ou em unidades lógicas pequenas, seguindo o "Fluxo obrigatório" do
      `CLAUDE.md` (Auditoria → Plano → Execução → Validação → Commit).
