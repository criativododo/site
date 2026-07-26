# Plano técnico — Redesign incremental do frontend React (DODÔ)

> Gerado em 2026-07-25, sessão de planejamento (`/comecar` → análise só-leitura
> do frontend atual, sem nenhuma alteração de código). Contexto completo da
> decisão que originou este plano: `docs/_workspace/TASK_ROUTER.md` `§71`
> ("responsável decide: app React em localhost:5173/127.0.0.1:8000 é a base
> oficial do produto, evoluir por redesign incremental — não substituição —
> na ordem AppShell → Sidebar → Topbar → Dashboard → componentes globais →
> demais telas, validando visualmente a cada etapa").
>
> Este documento é a preparação de execução dessa decisão: nenhuma linha de
> código foi alterada ao produzi-lo. Serve para retomar o trabalho etapa por
> etapa sem precisar reconstruir a análise do zero.

## Achado estratégico (base de todo o plano)

Os tokens (`frontend/src/theme/tokens.css`) **já foram migrados** para a
paleta DODÔ v2 (laranja `--color-action` primária, roxo `--color-highlight`
secundária, fontes Elms Sans/Work Sans já carregadas via `@font-face`,
arquivos de fonte confirmados em `frontend/src/assets/fonts/`). O que **não
foi feito** é aplicar a geometria/identidade visual nova (raio, elevação,
tratamento de superfície) nos componentes — `--radius-card: 14px` e
`--radius-block: 24px` existem no token mas só são usados em **um único
lugar** (`EmptyState.module.css`). O resto do app (Dashboard incluso) ainda
usa o tratamento "flat"/hairline herdado do sistema visual anterior ("TEAR
Editorial"). Isso confirma o escopo real do redesign: é majoritariamente um
trabalho de **geometria de componente**, não de cor (cor já está certa).

Segundo achado: **~8 primitivos compartilhados cobrem quase 100% das ~25
telas** (`TextField`/`SelectField`/`TextareaField`, `EmptyState`,
`Badge`/`StatusBadge`, `AuthSplitLayout`, o padrão `<table>` inline,
`Button`). Redesenhar esses primitivos cascateia automaticamente para quase
todas as telas com pouquíssimo trabalho por tela.

---

## 1. AppShell (`frontend/src/components/AppShell.tsx` + `.module.css`)

- **Permanece:** estrutura de dados (`NAV_ITEMS`, itens "(em breve)"
  desabilitados), lógica de rota ativa (`isItemActive`), breakpoint
  mobile/desktop em 768px, `getInitials`.
- **Muda visualmente:** sidebar hoje é transparente (mistura com o fundo,
  `.sidebar { display:flex }` sem `background`) — precisa de tratamento de
  superfície (`--color-surface` ou variação, borda já existe via
  `--color-outline`); item de nav ativo hoje é só uma borda esquerda de 2px
  + cor de texto — candidato a virar "pill" ativo (usa `--radius-pill`, já
  no token, consistente com `Button`); avatar (`.avatar`) é um círculo
  neutro sem cor de marca — pode receber `--color-highlight` como acento.
- **Reuso identificado:** `PortalShell.tsx` é uma **cópia quase idêntica**
  de `AppShell.tsx` (mesmo JSX, mesmo `AppShell.module.css` importado por
  ele, só muda `NAV_ITEMS` e a tagline). Recomendação: parametrizar
  `AppShell` com props (`navItems`, `tagline`) e fazer `PortalShell.tsx`
  virar um wrapper fino que só passa os itens do portal. Isso elimina a
  duplicação e faz qualquer mudança visual valer para admin **e** portal
  automaticamente — é o maior ganho de alavancagem do plano inteiro.
- **Tokens:** `--color-surface`, `--color-outline`, `--color-highlight`,
  `--radius-pill`, `--sp-*`.
- **Arquivos:** `components/AppShell.tsx`, `components/AppShell.module.css`,
  `components/PortalShell.tsx` (reduzir para wrapper).

## 2. Sidebar (hoje é uma *região* dentro de `AppShell.tsx`, não um componente próprio)

- **Permanece:** `NavList` como função interna, renderização condicional
  link/span.
- **Muda visualmente:** item ativo (ver item 1), espaçamento vertical
  excessivo hoje (`--sp-8` de padding no topo do brand, sem hierarquia
  visual entre wordmark/tagline/nav/logout).
- **Reuso:** se a parametrização do item 1 for feita, `NavList` já é
  compartilhado entre admin e portal automaticamente — não precisa de
  extração adicional.
- **Decisão a confirmar com o responsável (não é ADR, é design de
  componente):** extrair `NavList`/sidebar para arquivo próprio
  (`components/Sidebar.tsx`) só vale a pena se o redesign visual for grande
  o suficiente para justificar; para uma mudança de cor/raio/hover, manter
  dentro de `AppShell.tsx` é suficiente e evita over-engineering.
- **Tokens:** `--color-action` (hover/ativo), `--radius-pill`,
  `--sp-2`/`--sp-4`.
- **Arquivos:** `components/AppShell.tsx`, `components/AppShell.module.css`.

## 3. Topbar (hoje também é região de `AppShell.tsx`: `.mobileTopBar` + `.desktopBar`)

- **Permanece:** lógica de avatar+nome+sair, `.mobileTopBar` sticky no
  mobile.
- **Muda visualmente:** `.desktopBar` hoje só alinha à direita (avatar,
  nome, sair) sem nenhum elemento de identidade — é a barra mais "nua" do
  shell hoje; pouco a redesenhar estruturalmente, mais um ajuste de
  espaçamento/tipografia para casar com a sidebar redesenhada.
- **Reuso:** mesma observação do item 1 — compartilhada com o portal via
  `AppShell` parametrizado.
- **Tokens:** `--color-surface`, `--color-outline`, `--sp-4`/`--sp-5`.
- **Arquivos:** `components/AppShell.tsx`, `components/AppShell.module.css`.

## 4. Dashboard (`frontend/src/pages/Dashboard.tsx` + `.module.css`)

- **Permanece:** toda a lógica de dados (`useEffect`s, `countParceiras`,
  `countCampanhas`), saudação por horário, estrutura de 4 indicadores.
- **Muda visualmente — é o ponto de maior gap identificado:** `.cards` usa
  a técnica "grid com `gap:1px` + fundo `--color-outline`" para simular
  linhas divisórias entre cards (herança do sistema flat anterior) —
  **nenhum raio, nenhuma elevação**, apesar de `--radius-card` existir no
  token. Precisa virar cards de superfície individuais (`--color-surface`,
  `border-radius: var(--radius-card)`, borda `--color-outline`).
- **Reuso crítico:** `pages/portal/PortalDashboardPage.tsx` **importa
  diretamente `../Dashboard.module.css`** (não tem CSS próprio) — qualquer
  mudança em `Dashboard.module.css` já se propaga ao portal hoje, mas isso
  é um acoplamento frágil (import cruzado entre páginas de módulos
  diferentes). Recomendação: extrair o padrão
  `.card`/`.cardTitle`/`.cardMessage`/`.cardLink` para um componente
  `components/Card.tsx` real, consumido por ambas as páginas — resolve o
  redesign e a fragilidade estrutural ao mesmo tempo.
- **Tokens:** `--color-surface`, `--color-outline`, `--radius-card`,
  `--sp-6`.
- **Arquivos:** `pages/Dashboard.tsx`, `pages/Dashboard.module.css`,
  `pages/portal/PortalDashboardPage.tsx` (passa a consumir `Card` em vez do
  CSS importado), **novo:** `components/Card.tsx` + `components/Card.module.css`.

## 5. Componentes globais

| Componente | Permanece | Muda | Reuso | Tokens | Arquivos |
|---|---|---|---|---|---|
| **Button** | variantes `primary`/`secondary`, `isLoading` | já usa `--radius-pill`, `--color-action` corretamente — menor prioridade, revisar só estado de foco/hover | já 100% reusado (LinkButton incluso) | `--radius-pill`, `--color-action`, `--color-action-hover` | `components/Button.tsx`, `.module.css` |
| **Card** | — (não existe hoje) | **criar do zero**: slots `title`, `children`, `footer`/link opcional, variante clicável (usada em `PortalDashboardPage` como `<Link className={styles.card}>`) | substitui `.card` duplicado em Dashboard + PortalDashboardPage | `--radius-card`, `--color-surface`, `--color-outline` | **novo:** `components/Card.tsx`, `.module.css` |
| **Input** (`TextField`/`SelectField`/`TextareaField`) | já compartilham `TextField.module.css` — boa reutilização existente | ajuste de valor (raio/borda já tokenizados via `--radius-field`), baixo risco | já reusado em 14 telas | `--radius-field`, `--color-outline-strong`, `--color-action` (foco) | `components/TextField.module.css` (arquivo único cobre os 3) |
| **Badge** | tone-based (`success`/`neutral`/`error`) | nenhuma mudança visual necessária além de revisão de cor | — | `--radius-pill`, `--color-success*`, `--color-error*` | `components/Badge.tsx`, `.module.css` |
| **StatusBadge** | — | **CSS 100% duplicado** de `Badge.module.css` (mesma classe `.badge`, só `active`/`inactive` em vez de `success`/`neutral`/`error`) — recomendo reimplementar como wrapper fino de `Badge` (`status === 'Ativa' ? 'success' : 'neutral'`) e apagar `StatusBadge.module.css` | elimina duplicação | mesmos de `Badge` | `components/StatusBadge.tsx` (simplifica), remove `StatusBadge.module.css` |
| **Modal** | — (não existe em lugar nenhum do código — confirmado por grep, zero ocorrência de `modal`/`dialog`) | **é componente novo, não redesign** | nenhum consumidor hoje | `--radius-block`, `--color-surface`, overlay sobre `--color-text` | **novo:** `components/Modal.tsx`, `.module.css` — **decisão a confirmar com o responsável antes de construir:** CLAUDE.md pede não adicionar funcionalidade além do necessário; sem nenhuma tela consumindo Modal hoje, vale confirmar qual fluxo (ex.: confirmação de exclusão) vai usá-lo antes de escrever, para não nascer código morto |

## 6. Demais telas (agrupadas por padrão estrutural — todas já consomem os primitivos acima, então a mudança por tela tende a ser só de composição, não de lógica)

| Grupo | Telas | O que muda |
|---|---|---|
| **Auth/público** (via `AuthSplitLayout`) | `Login`, `LandingPage`, `ForgotPasswordPage`, `PublicCadastroPage`, `ResetPasswordPage` | `AuthSplitLayout.module.css` tem comentário desatualizado ("roxo é a nova cor-assinatura, substitui o laranja") que contradiz o `tokens.css` atual (laranja é primária) — corrigir o comentário ao tocar o arquivo. `LandingPage.tsx` linha 12 ainda cita "TEAR" em texto visível ao usuário — aplicar `ADR-020` ao editar essa tela (não fazer varredura preventiva do resto do repo, conforme `CLAUDE.md`) |
| **Listas com tabela** | `CampanhasListPage`, `MarcasListPage`, `ParceirasListPage`, `LogisticaPage` | padrão `<table>` inline em cada `*.module.css` (não é componente compartilhado) — se o redesign da tabela for mais que cor, considerar extrair `components/Table.tsx`; senão, editar os 4 `.module.css` em paralelo (independentes entre si) |
| **Formulários** | `CampanhaFormPage`, `MarcaFormPage`, `ParceiraFormPage`, `BriefingFormPage` | herdam quase tudo de `TextField`/`SelectField`/`Button` — mudança mínima por tela |
| **Detalhe/participação** | `CampanhaDetailPage`, `ParceiraProfilePage`, `MateriaisPage`, `PagamentoPage`, `EnvioPage` | mistura tabela + badge + form — depende dos itens 5/6 anteriores estarem prontos |
| **Portal** | `PortalCampanhasListPage`, `PortalHistoricoPage`, `PortalParticipacaoPage`, `PortalPerfilPage` | mesmos padrões do lado admin, herdam automaticamente se `AppShell`/`Card`/`Badge` forem parametrizados/reusados como no item 1 |
| **Placeholder** | rotas `/documentos`, `/historico` (admin), `/perfil` (admin) via `PlaceholderPage` | componente único, baixo esforço |

---

## Checklist de implementação (ordem de execução, tarefas pequenas e independentes)

**Fase A — Fundação de componentes (bloqueia tudo depois)**
1. Criar `components/Card.tsx` + `Card.module.css` (slots: título,
   conteúdo, link/ação opcional, variante clicável).
2. Simplificar `StatusBadge.tsx` para wrapper de `Badge`; remover
   `StatusBadge.module.css`.
3. Corrigir comentário desatualizado em `AuthSplitLayout.module.css`.

**Fase B — Shell (AppShell/Sidebar/Topbar)**
4. Adicionar `--color-surface` (ou variação) ao `.sidebar` em
   `AppShell.module.css`.
5. Redesenhar estado ativo do item de navegação (pill em vez de borda
   esquerda) em `AppShell.module.css`.
6. Redesenhar `.avatar` com acento `--color-highlight`.
7. Ajustar espaçamento/tipografia de `.desktopBar`/`.mobileTopBar`.
8. Parametrizar `AppShell.tsx` (props `navItems`, `tagline`) e reduzir
   `PortalShell.tsx` a wrapper — **valida visualmente admin e portal
   juntos**.

**Fase C — Dashboard (consome Fase A)**
9. Substituir `.cards`/`.card` (técnica hairline `gap:1px`) por `Card` em
   `Dashboard.tsx`.
10. Migrar `PortalDashboardPage.tsx` para consumir `Card` em vez de
    importar `Dashboard.module.css`.

**Fase D — Componentes globais restantes**
11. Revisão de foco/hover de `Button.module.css` (baixo risco, pode ser
    feito em paralelo com A–C).
12. Revisão de foco de `TextField.module.css` (cobre
    `TextField`/`SelectField`/`TextareaField` de uma vez).
13. **Decisão pendente do responsável:** construir `Modal` agora (sem
    consumidor) ou só especificar e adiar até haver tela que precise — não
    iniciar até essa decisão.

**Fase E — Telas restantes (cada item é independente dos outros do mesmo grupo)**
14. `CampanhasListPage.module.css`
15. `MarcasListPage.module.css`
16. `ParceirasListPage.module.css`
17. `LogisticaPage.module.css`
18. `CampanhaFormPage.module.css`
19. `MarcaFormPage.module.css`
20. `ParceiraFormPage.module.css`
21. `BriefingFormPage.module.css`
22. `CampanhaDetailPage.module.css`
23. `ParceiraProfilePage.module.css`
24. `MateriaisPage.module.css`
25. `PagamentoPage.module.css`
26. `EnvioPage.module.css`
27. `PortalCampanhasListPage` (não tem `.module.css` próprio hoje — checar
    se herda de outro arquivo antes de editar)
28. `PortalHistoricoPage`
29. `PortalParticipacaoPage.module.css`
30. `PortalPerfilPage.module.css`
31. `PlaceholderPage.module.css`
32. `LandingPage.module.css` (+ aplicar `ADR-020`, trocar "TEAR" no texto)
33. `Login.module.css`, `ForgotPasswordPage`, `ResetPasswordPage`,
    `PublicCadastroPage` (grupo auth restante)

---

## Nota de proveniência

Documento gerado por análise só-leitura do frontend em
`frontend/src/` (componentes, páginas, rotas em `App.tsx`, tokens em
`theme/tokens.css`) na sessão de 2026-07-25. Nenhum arquivo de código foi
alterado, nenhum commit foi feito, nenhum teste foi executado ao produzir
este plano. `docs/_workspace/ESTADO_SESSAO.md` e `docs/_workspace/TASK_ROUTER.md`
não foram atualizados por esta sessão — se este plano for retomado em uma
sessão futura, considerar registrar sua existência em ambos para
continuidade.
