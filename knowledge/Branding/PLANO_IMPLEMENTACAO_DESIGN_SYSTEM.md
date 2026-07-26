# Plano de implementação — Manual de Design DODÔ v1.0 no React

> **Status: aprovado, em execução.** Aprovado pelo responsável em
> 2026-07-25. Reorganizado na mesma data (após o Sprint 2) em 4 sprints
> totais — "feito melhor que perfeito": priorizar impacto e evolução de
> componentes-base sobre fragmentação e polimento prematuro. Decisões de
> token ainda pendentes do responsável (radius, símbolo do
> `AuthSplitLayout`) ficam em backlog, não bloqueiam os sprints restantes.

## Como ler este plano

A auditoria original (3 frentes paralelas: componentes compartilhados,
telas administrativas, telas públicas/portal) encontrou que **nenhuma
tela ou componente precisa ser reescrito do zero** — a arquitetura de
componentes, CSS Modules e tokens já é sólida e, na maior parte, já usa
`var(--...)` corretamente. A exceção é o **Portal da Influenciadora**,
que tem uma lacuna estrutural real (não é mobile-first/bottom-nav como o
Manual exige) — por isso segue isolado como o último sprint.

## Modelo de execução

Cada sprint é uma unidade de trabalho independente e testável: build,
lint, typecheck e validação visual ao final, um commit limpo por sprint,
aprovação do responsável antes de iniciar a próxima. Dentro de um
sprint, frentes independentes (componentes, telas admin, telas portal,
QA) rodam em paralelo por subagentes com escopo exclusivo — um único
responsável integra, resolve conflitos e comita.

**Princípios permanentes adotados em 2026-07-25:**

- sempre que duas ou mais implementações forem visual e funcionalmente
  equivalentes, consolidá-las num único componente oficial do Design
  System, desde que não altere comportamento, não introduza regressão,
  respeite o Manual e preserve compatibilidade com as telas existentes —
  evoluir componentes-base em vez de corrigir tela por tela, sempre que
  a mudança se propagar corretamente para toda a aplicação.
- **regra de capitalização, obrigatória:** todo texto de interface em
  sentence case (maiúscula só na primeira letra da frase, nunca title
  case) — detalhe completo e exemplos em
  `docs/design/manual/index.html#tipografia`. Vale para qualquer string
  nova ou tocada em qualquer sprint, mesmo fora do escopo imediato,
  desde que a correção seja só de capitalização e não altere
  comportamento. Auditoria em 2026-07-25 (grep/ripgrep em todo
  `frontend/src/**/*.tsx` por padrões de title case) não encontrou
  violação pendente no texto literal das telas — o problema conhecido
  era só CSS (`text-transform: uppercase`), já corrigido no Sprint 1.

---

## Sprint 1 — Correções tipográficas ✅ concluído

Caixa baixa (sentence case) do Manual aplicada em `Button`, `AppShell`,
`TextField`, `Badge`, `StatusBadge`, `AuthSplitLayout`,
`PublicCadastroPage`, `PortalPerfilPage`; fonte do botão corrigida para
Work Sans/semibold; cor de placeholder tokenizada. Commits
`7a5e563` (rename de tokens pendente, isolado) e `3fcfeb7` (Sprint 1 em
si).

## Sprint 2 — Disciplina de CTA único ✅ concluído

Um CTA primário por tela aplicado em `BriefingFormPage`, `PagamentoPage`,
`MateriaisPage` (variant secondary no botão de menor peso) e
`MarcasListPage`/`ParceirasListPage`/`CampanhasListPage` (removida a
`action` duplicada do `EmptyState`, o CTA do header já cobre o caso).
`PortalPerfilPage` avaliado e mantido sem mudança — dois formulários
independentes, não é o caso que a regra mira. Commit `a5c6817`.

Achado registrado durante o Sprint 2: `MarcasListPage`,
`ParceirasListPage` e `CampanhasListPage` duplicam o mesmo bloco de
paginação quase byte-a-byte — endereçado no Sprint 3 abaixo.

---

## Sprint 3 — Consolidação de padrões, ícones e componentes duplicados

Agrupa o antigo "Sprint 3" (consolidação), o antigo "Sprint 6"
(biblioteca de ícones) e o achado de paginação do Sprint 2 — todos são
trabalho de baixo risco, sem dependência de decisão de token pendente, e
compartilham o mesmo princípio: eliminar duplicação, evoluir
componente-base em vez de tela por tela.

| Item | Descrição | Abordagem |
|---|---|---|
| `StatusBadge` → `Badge` | `StatusBadge.module.css` é cópia byte-a-byte de `Badge.module.css` | consolidar numa prop de tone em `Badge`, remover `StatusBadge`, atualizar call-sites |
| Paginação duplicada | `MarcasListPage`, `ParceirasListPage`, `CampanhasListPage` repetem o mesmo bloco "anterior/próxima" | extrair componente `Pagination` compartilhado, usar nas três telas |
| `MarcasListPage` — status em texto puro | única lista que não usa `Badge`/`StatusBadge` para status | unificar com o padrão das demais listas |
| `CampanhaDetailPage` — tag "congelada" | `<span>` estilizado à parte, terceiro sistema de rótulo paralelo ao Badge | absorver no `Badge` |
| `CampanhasListPage` — mensagem de vazio genérica | não varia por filtro (`?status=ATIVA` mostra o mesmo texto da lista geral) | copiar o padrão já implementado em `ParceirasListPage` (vazio diferenciado por filtro) |
| `Dashboard` — loading/erro indistinguíveis de vazio | `pendentes`/`totalCampanhas` começam `null` e caem no mesmo ramo visual de "vazio"; catch de erro silencioso | estado de loading/erro explícito, separado do vazio real |
| Biblioteca de ícones | app usa sprite genérico boilerplate; Manual já entrega 15 ícones prontos (`docs/design/manual/assets/icons/`, grid 24×24, stroke 2px, `currentColor`) | trocar o sprite pela biblioteca oficial |

**Validação:** revisão visual das listas (com e sem filtro), do Dashboard
em estado de loading/erro/vazio real, e conferência de que nenhum ícone
trocado quebrou uma tela.

---

## Sprint 4 — Portal mobile-first

Achado mais importante da auditoria de portal, mantido como sprint
isolado por ser o maior risco de regressão do plano (toca navegação de
três telas ao mesmo tempo): `PortalShell` **reaproveita o CSS do shell
administrativo** (`AppShell.module.css`) — sidebar desktop/topbar mobile,
sem bottom-nav. O Manual define mobile-first com bottom-nav como
prioridade de dispositivo para o portal (desktop-first é regra do Admin,
não do Portal).

| Item | Descrição |
|---|---|
| `PortalShell` | criar shell próprio com bottom-nav mobile-first, em vez de reaproveitar o shell do admin |
| `PortalDashboardPage` | migrar de `Dashboard.module.css` (do admin) para um módulo próprio; adicionar estado de loading explícito (hoje ausente) |

**Validação:** dispositivo real (não só devtools), golden path completo
do portal (dashboard → participação → perfil) nas três telas afetadas.

---

## Backlog (adiado — não bloqueia Sprint 3/4)

Itens que dependem de decisão do responsável ainda não tomada, ou que
são achados fora do escopo de identidade visual. Registrados para não
serem esquecidos, deliberadamente fora dos 4 sprints de implementação —
"feito melhor que perfeito" significa não prolongar a entrega esperando
por eles.

| Item | Por que está em backlog |
|---|---|
| Escala numérica de radius (curvatura de cards/containers/painéis) | decisão de token do responsável ainda pendente — `docs/design/manual/index.html#bordas` só define o princípio |
| Token formal de `text-transform`/caixa baixa | decisão de token pendente; a aplicação prática já foi feita no Sprint 1 sem o token formal |
| Substituto canônico do símbolo do `AuthSplitLayout` (estrela de 8 pontas, fora do vocabulário de marca) | depende da decisão de radius/token acima e de aprovação de um novo elemento gráfico |
| Curvatura de superfícies grandes (evolução de radius em cards, containers, painéis) | gated pela decisão de escala numérica acima |
| Favicon (hoje idêntico ao ativo da marca legada "Elã") | pendência de migração de identidade registrada no Manual, fora do escopo de código do frontend |
| `LandingPage` cita "campanhas do TEAR" (nome técnico legado) | achado textual/nomenclatura, não visual |
| `CampanhaDetailPage` — tabela de ~12 colunas, 6 `aria-hidden` condicionais | cheiro de densidade estrutural que merece revisão própria de UX, não troca de skin visual |

---

## Resumo de dependências

```
Sprint 1 (tipografia) ✅ ──> Sprint 2 (CTA único) ✅ ──> Sprint 3 (consolidação + ícones) ──> Sprint 4 (portal mobile-first)

Backlog (radius, símbolo, favicon, achados fora de escopo) — sem dependência dos sprints acima, aguarda decisão do responsável
```
