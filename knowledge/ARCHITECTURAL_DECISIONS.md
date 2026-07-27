# ARCHITECTURAL_DECISIONS.md

> Registro de decisões arquiteturais permanentes deste projeto (Criativo DODÔ), no formato
> ADR (Architecture Decision Record). **Esta é uma série própria**, iniciada em 2026-07-26,
> distinta da série `knowledge/Arquitetura/ADR-002/012/015/016/017/018/019/020.md` — aquela
> documenta decisões tomadas para o "Sistema B" (Laravel), um código que não existe mais
> fisicamente neste repositório. Esta série documenta decisões de governança e método que
> se aplicam ao projeto como um todo, independentemente de qual stack venha a ser escolhida
> para o Portal. Onde uma decisão desta série se sobrepõe a algo dito na série antiga, isso é
> declarado explicitamente dentro do próprio ADR.

---

## ADR-001 — A Landing Page (`app/`) é a implementação oficial do Design System do Criativo DODÔ

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Autor da decisão:** responsável do projeto.

### Contexto
O projeto já teve, segundo `knowledge/Arquitetura/ADR-019-design-system-dodo-como-ssot-
visual.md`, três gerações de identidade visual documentadas, culminando na proposta de um
"Manual de Design DODÔ" em `docs/design/manual/`. Esse caminho **não existe fisicamente**
neste repositório. O que existe é `app/` (Landing Page em produção, React+Vite+GSAP) e
`design-system/index.html`/`DESIGN.md` (documentação auxiliar extraída do código de `app/`
numa sessão anterior).

### Decisão
A **Landing Page implementada em `app/`** é, a partir desta data, a implementação oficial da
identidade visual do Criativo DODÔ. Cobre: identidade visual, aplicação da marca,
componentes, tipografia, paleta de cores, espaçamentos, grid, animações/motion,
responsividade, comportamento visual e linguagem de interface.

Em qualquer divergência entre a Landing (`app/`), o Design System HTML
(`design-system/index.html`) e qualquer documentação (incluindo `ADR-019` da série antiga),
**a Landing sempre prevalece**, até que um novo Design System oficial seja formalmente
aprovado.

### Consequências
- `design-system/index.html`/`DESIGN.md` passam a ser tratados como documentação auxiliar,
  não fonte primária — podem ser completamente refeitos no futuro sem impacto na Landing.
- Esta decisão **substitui, para fins práticos deste repositório**, o que `ADR-019` (série
  antiga) declara sobre `docs/design/manual/` — não revoga aquele ADR como registro
  histórico do Sistema B, apenas estabelece que, neste repositório, a referência corrente é
  outra.
- Toda evolução visual do Portal deve derivar da Landing existente (ver `ADR-004`).

---

## ADR-002 — A documentação descreve um Portal completo; a implementação existente hoje é apenas a Landing

- **Status:** Aceito.
- **Data:** 2026-07-26.

### Contexto
`knowledge/` contém dezenas de SPECs e ADRs descrevendo um sistema de gestão de parcerias
com influenciadoras — incluindo um Portal da Influenciadora inteiramente especificado
(SPEC-025/027/030/032/035) — com notas de "implementado" e "testes verdes". Uma auditoria
completa do repositório (`find`, `git log --all`, busca por `composer.json`/`*.php`) confirma
que nenhum desse código existe fisicamente aqui.

### Decisão
Registra-se formalmente, como fato de estado do projeto: **a documentação em `knowledge/`
descreve requisitos e regras de negócio, não o estado físico atual do código.** O único
código de produto que existe neste repositório é a Landing Page (`app/`). Toda sessão futura
deve tratar as SPECs/ADRs como especificação a implementar, nunca como inventário de código
disponível para importar ou referenciar como dependência.

### Consequências
- Nenhuma tarefa de implementação do Portal pode presumir a existência de um backend, banco
  de dados, ou camada de autenticação já funcionando.
- Ver `PORTAL_BRIEFING.md` §0 para o detalhamento completo deste achado.

---

## ADR-003 — Nenhum requisito funcional deve ser inventado quando não estiver presente na documentação

- **Status:** Aceito.
- **Data:** 2026-07-26.

### Contexto
A documentação em `knowledge/` contém lacunas, contradições entre si (ex.: gate de
elegibilidade de pagamento, Q-04 vs. P0-1) e pendências explicitamente não resolvidas (Q-05,
Q-07, Q-08, Q-09, escopo do ator Marca). Existe o risco, em sessões futuras, de uma dessas
lacunas ser preenchida por suposição, em vez de por decisão explícita do responsável do
projeto.

### Decisão
Toda sessão de trabalho neste projeto deve seguir a regra: **onde uma informação não existir
ou for contraditória entre fontes, isso deve ser marcado explicitamente como `PENDENTE` (ou
equivalente), nunca resolvido por suposição, dedução ou inferência de "boa prática
genérica".** Decisões de produto (não de implementação técnica de uma decisão já tomada) são
sempre do responsável do projeto.

### Consequências
- `PORTAL_BRIEFING.md` §13, `PORTAL_BACKLOG.md` EPIC 0, e as tabelas de pendências em
  `PORTAL_GLOSSARIO.md`/`USER_JOURNEYS.md` (jornada de Marca) seguem essa regra e devem
  continuar sendo o ponto de checagem antes de qualquer implementação nas áreas marcadas.
- Uma sessão que precisar avançar sobre um item pendente deve primeiro obter a decisão do
  responsável do projeto e só então atualizar o documento correspondente (idealmente como um
  novo ADR nesta série).

---

## ADR-004 — Toda evolução visual do Portal deve derivar da Landing existente, nunca criar uma identidade paralela

- **Status:** Aceito.
- **Data:** 2026-07-26.
- **Relaciona-se com:** ADR-001 (desta série).

### Contexto
Como o Portal será um código novo, construído separadamente da Landing, existe o risco de
que a implementação do frontend do Portal comece do zero visualmente (nova paleta, nova
tipografia, novos componentes), gerando uma segunda identidade visual dentro do mesmo
produto.

### Decisão
Todo componente, página, token de cor/tipografia/espaçamento e padrão de motion novo criado
para o Portal deve ser uma **expansão dos padrões já existentes na Landing (`app/`)**, nunca
uma identidade visual paralela. Isso inclui reaproveitar a stack de frontend já validada
(React + Vite + TypeScript, mesma versão de referência de `app/package.json`) sempre que a
decisão de stack do Portal (pendência aberta, ver `ARCHITECTURAL_DECISIONS.md`/`PORTAL_
BRIEFING.md` §13.1) permitir.

### Consequências
- Antes de estilizar qualquer tela nova do Portal, ler o código de `app/src` diretamente
  (não só o Design System HTML).
- Se a decisão de stack (pendência §13.1) escolher uma tecnologia de frontend incompatível
  com reaproveitar componentes React diretamente, os **tokens visuais** (cor, tipografia,
  espaçamento, motion) extraídos de `app/` continuam sendo a referência obrigatória — só a
  camada de implementação de componente muda, não a identidade.

---

## Como usar este documento

Toda decisão arquitetural nova e permanente deste projeto (que não seja um detalhe de
implementação de uma decisão já tomada) deve ser adicionada aqui como um novo ADR
sequencial (`ADR-005`, `ADR-006`, ...), seguindo o mesmo formato: Status, Data, Contexto,
Decisão, Consequências. Não reutilizar a numeração da série antiga
(`knowledge/Arquitetura/ADR-*.md`) — são índices independentes.
