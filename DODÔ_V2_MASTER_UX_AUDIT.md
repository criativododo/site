# DODÔ V2 — MASTER UX AUDIT + REDESIGN STRATEGY

> **Status:** blueprint para aprovação. Nenhum código foi alterado para produzir este
> documento. Nenhuma regra de negócio foi revisada ou contestada — apenas UX, arquitetura da
> informação, navegação, fluxos, componentes, Design System e percepção de produto.
>
> **Escopo:** `portal-frontend/` (Portal da Parceira/Backoffice). `app/` (Landing) é tratado
> só como fonte da identidade visual (ADR-001) — não é objeto de redesign aqui.
>
> **Método:** leitura direta do código real (`portal-frontend/src`, `app/src`), dos
> documentos oficiais (`PORTAL_BRIEFING.md`, `PORTAL_ARQUITETURA.md`, `USER_JOURNEYS.md`,
> `PORTAL_BACKLOG.md`, `knowledge/ARCHITECTURAL_DECISIONS.md`) e consulta ao **shadcn MCP**
> como fonte primária de componentes/blocks. Não foram inventados requisitos funcionais
> (ADR-003) — onde a documentação for omissa, este documento declara a lacuna.

---

## 1. Resumo executivo

O Portal DODÔ hoje é **funcional, mas visualmente pré-Design-System**: 14 rotas, uma única
página autenticada compartilhada por dois papéis (Administrador/Influenciadora), zero
tabelas HTML, zero modais reais (exceto um `window.prompt()`), zero componentes shadcn em
uso apesar de 10 já estarem instalados, e uma persistente duplicação de estilo inline entre
páginas administrativas. O produto **funciona** — o gap não é de engenharia, é de **sistema
de design aplicado** e **arquitetura de informação madura**.

O ativo mais forte do projeto é a identidade visual da Landing (`app/`): paleta de 4 cores
com contraste comprovado (AA/AAA), tipografia autoral (Work Sans + Elms Sans), motion GSAP
elegante. Esse ativo **não chegou** ao Portal de forma sistemática — chegou como cópia
literal de valores CSS, sem virar tokens, sem virar componentes reutilizáveis, sem motion
algum (Portal tem zero dependência de animação).

A boa notícia: `portal-frontend/components.json` já aponta para um registry shadcn
(`style: "base-nova"`, base `@base-ui/react`), e os componentes certos para resolver ~80% dos
problemas listados aqui (`sidebar`, `table`, `command`, `empty`, `dialog`, `sonner`, `field`,
`item`) já existem no registry oficial do shadcn MCP consultado nesta auditoria — não
precisam ser inventados, só adotados com disciplina.

**Direção recomendada:** não é um redesign visual (a marca já está definida e comprovada na
Landing) — é uma **operação de sistematização**: tokenizar o que já existe, adotar os
componentes shadcn corretos como camada de implementação, redesenhar a arquitetura de
informação (sidebar agrupada, dashboard orientado a ação, tabelas reais) e eliminar
duplicação. Referências (Linear/Vercel/Stripe/Attio/Notion/Supabase) servem de princípio —
densidade de informação, hierarquia por severidade, ação-a-um-clique — não de estilo a
copiar.

---

## 2. Auditoria atual

### 2.1 O que existe fisicamente

| Camada | Estado |
|---|---|
| Rotas | 14, definidas 100% em `App.tsx`, sem lazy loading, sem code-splitting |
| Layout | 1 único shell (`PortalLayout.tsx`) para os 2 papéis |
| Componentes shadcn instalados | 10 (`badge`, `button`, `card`, `dialog`, `dropdown-menu`, `input`, `sheet`, `skeleton`, `sonner`, `tooltip`) |
| Componentes shadcn **em uso real** | **0** — nenhuma página importa de `components/ui` |
| Tabelas HTML (`<table>`) | 0 em todo o codebase |
| Modais/dialogs reais | 0 (exceto `window.prompt()` em `Admin.tsx`) |
| Formulários com lib de validação | 0 (todo `useState` manual) |
| Dark mode | Não implementado (apesar de `next-themes` instalado e não usado) |
| `prefers-reduced-motion` | Não tratado em nenhum dos dois produtos |
| Testes automatizados | 0 arquivos de teste encontrados |
| Autorização por rota admin | Duplicada 7x (`if (papelAtor !== "ADMINISTRADOR")` copiado em cada página) |

Esse quadro é corroborado de forma independente pelo próprio `DESIGN.md` (auditoria interna
de 28/07/2026, v2.0) — usado aqui como segunda fonte, nunca como fonte primária (ADR-001).

### 2.2 Navegação e arquitetura de informação atuais

Sidebar fixa (264px), lista plana de links de texto (sem ícones, sem agrupamento, sem
profundidade), item de topo = logo, item de baixo = usuário + botão "sair" estilizado como
CTA primário (mesmo peso visual de uma ação positiva — problema de hierarquia). Descrição
literal do próprio time: *"a sidebar do Portal é o mesmo bloco logo+nav da Landing, rotacionado
90°"* (`DESIGN.md` §25) — ou seja, a navegação foi herdada de um componente de marketing, não
desenhada como navegação de aplicação.

- **Influenciadora:** 3 itens (`pendências`, `financeiro`, `perfil`) — plana, adequada ao
  volume.
- **Administrador:** 7 itens (`dashboard`, `parceiras`, `entregas`, `briefings`,
  `obrigações`, `colaboração mensal`, `moderação`) — todos no mesmo nível, sem agrupamento
  semântico. Não há como saber, batendo o olho, que "briefings" e "entregas" são estágios do
  mesmo fluxo, ou que "moderação" é uma fila de aprovação e não um relatório.
- Não existe busca, notificações, avatar/menu de usuário (apesar de `dropdown-menu`
  instalado), breadcrumbs populados (o slot existe, ninguém o usa), nem toggle de colapso.

### 2.3 Dashboard Admin atual

Existe (`/admin/dashboard`, ADR-021 trouxe isso para o escopo do V1 depois do briefing
original tê-lo marcado fora de escopo). Estrutura: título → intro → 4 KPIs "requer sua ação"
(atrasados/em revisão/moderação/LGPD, com destaque cherry se > 0) → divisor → 5 KPIs
"indicadores gerais" (neutros). **Nenhum KPI é clicável** — nenhum leva à lista filtrada
correspondente. Nenhuma série temporal, nenhuma tendência, nenhum gráfico, nenhum
agrupamento por parceira. É um placar, não um centro de decisão.

### 2.4 Portal da Influenciadora atual

Não tem dashboard próprio — `Pendencias.tsx` funciona como home: acordeão dividido em
"entregas para você agora" vs. "entregas com a equipe", cada item expansível para ver
briefing + upload. Isso é conceitualmente correto (é literalmente a jornada documentada em
`USER_JOURNEYS.md`) mas a apresentação (texto corrido, acordeão) não comunica prioridade —
uma entrega atrasada e uma entrega que vence em 3 semanas têm o mesmo peso visual.

### 2.5 Design System / tokens

Cores: reais, propagadas via `tokens.css` (custom properties) — o único domínio já
tokenizado corretamente. Tipografia, espaçamento, raio de borda, sombra, breakpoints:
**valores literais repetidos**, não tokens. O vocabulário de raio/borda/sombra do Portal
(8/12/14/24/999px) foi inventado ad-hoc quando o Portal precisou de cards/listas que a
Landing nunca teve — nunca formalizado.

---

## 3. Problemas encontrados

Numeração de referência (Pxx) usada nas seções P0/P1/P2 e na tabela da seção 20.

| # | Problema | Evidência |
|---|---|---|
| P01 | Zero componentes shadcn em uso apesar de instalados | grep de imports em todas as páginas |
| P02 | Zero tabelas reais — listas sem cabeçalho de coluna | `DESIGN.md` §34.8, confirmado em código |
| P03 | Zero modais reais — única exceção é `window.prompt()` | `Admin.tsx`, `FilaDeExclusao` |
| P04 | Ação destrutiva sem confirmação (rejeitar cadastro) ao lado de ação com confirmação (excluir LGPD) — inconsistência de risco | `Admin.tsx`, `DESIGN.md` §24/§34.9 |
| P05 | Autorização de rota admin duplicada 7x, sem wrapper único | `AdminDashboard/Parceiras/Entregas/Briefings/Obrigacoes/ColaboracoesMensais/Admin.tsx` |
| P06 | Sidebar sem agrupamento, sem ícones, sem hierarquia — 7 itens administrativos no mesmo nível | `PortalLayout.tsx` |
| P07 | Botão "sair" com o mesmo peso visual de uma CTA primária | `PortalLayout.tsx`, classe `.btn-primary` |
| P08 | Dashboard Admin sem interatividade — KPIs não navegam para a lista filtrada | `AdminDashboard.tsx` |
| P09 | Nenhum dashboard/home para a Influenciadora — `Pendencias` funciona como home mas não comunica prioridade visualmente | `Pendencias.tsx` |
| P10 | Duas "eras" de estilo administrativo coexistindo (classes CSS nomeadas vs. objetos inline duplicados com drift) | `AdminParceiras`/`AdminColaboracoesMensais` vs. `AdminEntregas`/`AdminBriefings`/`AdminObrigacoes`/`Admin` |
| P11 | Formulários sem lib de validação, sem padrão de erro de campo consistente | todas as páginas com `Formulario*` |
| P12 | Toasts instalados (`sonner.tsx`) mas nunca montados nem chamados — feedback de sucesso/erro é só texto estático | `main.tsx`, `PortalLayout.tsx` |
| P13 | Skeleton instalado mas nunca usado — todo loading é um único spinner CSS | `ui/skeleton.tsx` vs. uso real |
| P14 | Nenhum dark mode apesar de `next-themes` instalado | pacote presente, zero uso |
| P15 | Nenhum tratamento de `prefers-reduced-motion` | `app/` e `portal-frontend/` |
| P16 | Tokens de tipografia/espaçamento/raio são literais, não variáveis — drift entre páginas (ex. padding de botão 16px vs 20px para o "mesmo" botão) | `index.css`, `DESIGN.md` §34.4/§34.7 |
| P17 | Duplicação de assets SVG (4 cópias do wordmark) com mismatch de viewBox e nome de arquivo | `DESIGN.md` apêndice |
| P18 | Empty states com texto inconsistente (capitalização variando por página) | `DESIGN.md` §22 |
| P19 | Dois padrões quase-idênticos de "kicker" de seção nunca reconciliados (`.pendencias-summary` vs `.portal-eyebrow`) | `DESIGN.md` §34.11 |
| P20 | Rota `/admin/financeiro` renderiza a página "Obrigações" — nome de rota e nome de página divergem | `App.tsx` |
| P21 | Nenhuma paginação server-side — corte client-side em 50 itens | `AdminParceiras.tsx` |
| P22 | Sem busca global, sem command palette, sem atalhos de teclado | ausência confirmada em `PortalLayout.tsx` |
| P23 | Sem breadcrumbs populados apesar da infraestrutura (`pageHeader.tsx`) existir | grep de `usePageHeader` |
| P24 | Portal sem qualquer motion — perde a assinatura de marca que a Landing tem (GSAP) | `portal-frontend/package.json` sem gsap |
| P25 | Nenhum teste automatizado | busca por `*.test.*`/`*.spec.*` |

---

## 4. P0 — Crítico (bloqueia percepção de produto premium)

Estes itens têm o maior efeito combinado sobre "isso parece um produto sério" e sobre risco
operacional real (dados corrompidos por erro de confirmação, admin perdido em 7 itens
soltos).

1. **P02 — Tabelas reais.** Adotar `table` (shadcn) com cabeçalho de coluna em toda listagem
   administrativa (Parceiras, Entregas, Briefings, Obrigações, Colaborações Mensais).
2. **P03 + P04 — Modais reais e confirmação consistente.** Adotar `dialog`/`alert-dialog`
   para toda ação destrutiva ou irreversível (rejeitar cadastro, excluir, aprovar
   pagamento), eliminando `window.prompt()`.
3. **P05 — Guard de rota admin único.** Um `<RotaAdmin>` (análogo ao já existente
   `<RotaProtegida>`) envolvendo o grupo `/admin/*`, eliminando a checagem duplicada 7x.
4. **P06 + P08 — Sidebar agrupada + Dashboard clicável.** Reagrupar os 7 itens admin em
   seções semânticas (ver §7) e tornar cada KPI do dashboard um link para a lista já
   filtrada.
5. **P01 — Adoção real dos componentes shadcn já instalados** (ou sua substituição
   deliberada pelos componentes corretos do registry, ver §13) em vez de manter uma segunda
   implementação paralela em CSS solto.

## 5. P1 — Importante (eleva a régua, não bloqueia)

6. P07 — Rebalancear hierarquia visual do botão "sair" (ghost/outline, não fill cherry).
7. P09 — Dashboard/home dedicado para Influenciadora com hierarquia por urgência (atrasado
   > próximo > futuro), não texto corrido.
8. P10 + P16 — Unificar as duas eras de estilo administrativo num único conjunto de
   componentes (`field`, `item`, `input-group` do shadcn) e tokenizar espaçamento/raio.
9. P11 — Padronizar formulários com `field` + validação consistente (mesmo sem adotar uma
   lib pesada como react-hook-form, ao menos um padrão único de erro/label/hint).
10. P12 + P13 — Ativar `sonner` para feedback de sucesso/erro; ativar `skeleton` para
    loading de lista/tabela em vez de um spinner genérico.
11. P21 — Paginação server-side nas listagens administrativas (a base já pagina — mover o
    corte do cliente para o backend é decisão de arquitetura, fora do escopo desta auditoria
    de UX, mas registrado aqui como dependência).
12. P22 + P23 — Busca global (`command`) e breadcrumbs realmente populados via
    `usePageHeader` (a infraestrutura já existe).

## 6. P2 — Desejável (polimento, pode esperar)

13. P14 — Dark mode (ativar `next-themes`, já instalado).
14. P15 — `prefers-reduced-motion` em ambos os produtos.
15. P17 — Consolidar SVGs duplicados num único diretório de assets compartilhado (dentro dos
    limites do ADR de independência entre `app/` e `portal-frontend/` — pode ser resolvido
    por script de sync, não por import cruzado).
16. P18 + P19 — Padronizar texto de empty state e reconciliar os dois padrões de "kicker".
17. P20 — Renomear rota `/admin/financeiro` → `/admin/obrigacoes` (ou renomear a página —
    decisão de nomenclatura, não de arquitetura).
18. P24 — Motion sutil no Portal (reaproveitando `--ease-editorial` já presente em CSS,
    sem necessariamente trazer GSAP como dependência nova).
19. P25 — Cobertura de teste básica para os fluxos críticos (fora do escopo de UX per se,
    registrado como risco de qualidade).

---

## 7. Nova arquitetura da informação

Vocabulário de navegação deve seguir o Contrato Soberano (ADR-006) — sem inventar termos
novos, sem reintroduzir vocabulário do Sistema B.

### Administrador — sidebar agrupada (de 7 itens soltos → 3 grupos + utilidades)

```
[logo]

VISÃO GERAL
  Painel                     (era "dashboard")

OPERAÇÃO
  Parceiras
  Colaboração Mensal
  Briefings
  Entregas

FINANCEIRO
  Obrigações Financeiras     (era "obrigações", rota corrigida)

GOVERNANÇA
  Moderação                  (era item solto "/admin", cadastros + fila LGPD)

────────────────────
[busca]
[usuário ▾]  → menu: perfil da conta admin, sair
```

Racional do agrupamento: **Operação** segue a ordem real do ciclo mensal (Parceira →
Colaboração → Briefing → Entrega), não ordem alfabética nem ordem de implementação —
qualquer administrador novo lê a sidebar e já entende a sequência do processo. **Financeiro**
e **Governança** são isolados porque são preocupações transversais (tocam todo o ciclo, não
uma etapa dele).

### Influenciadora — mantém-se plana (volume não justifica agrupamento)

```
[logo]

  Pendências     (home)
  Financeiro
  Perfil

────────────────────
[usuário ▾]  → sair
```

Nenhuma mudança estrutural aqui — 3 itens não pedem agrupamento; a melhoria é toda dentro da
página `Pendências` (ver §9).

---

## 8. Nova navegação — princípios

- Sidebar usa o componente `sidebar` do shadcn (registry oficial, variante próxima de
  `sidebar-07` — colapsa para ícones — combinada com o agrupamento de `sidebar-01`), não a
  implementação CSS manual atual.
- Botão "sair" some da base fixa da sidebar e migra para um menu de usuário (`dropdown-menu`,
  já instalado) — libera espaço vertical e corrige a hierarquia (P07).
- Cabeçalho de página (usando `pageHeader.tsx`/`usePageHeader`, já existente e ocioso) passa
  a ser obrigatório em toda página com breadcrumb real + ações contextuais à direita —
  eliminando a inconsistência de "página com título solto vs. página sem título".
- Busca global via `command` (shadcn) — abre com `⌘K`/`Ctrl K`, busca parceiras/entregas por
  nome — não é obrigatório na V2.0 mas está desenhado para não colidir com o layout futuro.

---

## 9. Jornada Admin (nova)

Ancorada em `USER_JOURNEYS.md` (jornada já documentada) — nenhuma etapa nova foi inventada,
só a apresentação de cada etapa foi redesenhada:

1. **Login** (`login-03`/`login-05` shadcn como referência de layout — ver §14) → Google
   OIDC, ADR-007 mantido integralmente.
2. **Painel** — abre já mostrando "o que precisa de mim" (ver §11); cada card leva
   diretamente à lista filtrada correspondente (resolve P08).
3. **Moderação de cadastros** — fila com card de parceira pendente, ação aprovar/rejeitar via
   `alert-dialog` com confirmação simétrica (resolve P04).
4. **Parceiras** — tabela real (`table`) com filtro por status, clique na linha abre `sheet`
   (já instalado) lateral com detalhe/edição, sem navegação de página cheia.
5. **Colaboração Mensal → Briefings → Entregas** — mantidos como telas separadas (o domínio
   já as separa, Contrato Soberano) mas visualmente conectadas por um indicador de estágio
   compartilhado (mesmo padrão de `badge` de status em todas as três).
6. **Obrigações Financeiras** — tabela real, com destaque visual para pendentes vencendo,
   ação de confirmar pagamento via `dialog` com resumo antes de confirmar.
7. **Sair** — pelo menu de usuário, não mais um botão de peso visual de CTA.

## 10. Jornada Influenciadora (nova)

1. **Login** — mesmo template de Admin, sem distinção de marca entre papéis (mantém decisão
   documentada em `DESIGN.md` §26 de não criar paleta própria por papel).
2. **Pendências (home)** — passa de acordeão de texto corrido para lista de `item`
   (componente shadcn) agrupada por urgência: **atrasado** (destaque cherry) → **esta
   semana** → **este mês** → **com a equipe** (somente leitura). Resolve P09 sem inventar
   dado novo — a mesma informação que já existe (`AGUARDANDO_MATERIAL` vs. resto) ganha
   hierarquia visual por prazo.
3. **Enviar material** — upload dentro do `item` expandido (mantém o padrão atual de
   expansão inline, que já é correto para o volume desta persona — não precisa virar modal).
4. **Financeiro** — tabela real do histórico (Aberto → Aprovado → Pago), sem alteração de
   regra de negócio.
5. **Perfil** — formulário com padrão `field` único (resolve parte de P11), mantendo as
   regras já documentadas (CEP não pode bloquear salvamento do resto, ADR/journey Q-notes já
   existentes).

---

## 11. Dashboard ideal (Admin)

Objetivo declarado pelo briefing original: responder "o que precisa da minha atenção?",
"o que está atrasado?", "quais aprovações aguardam?", "quais pagamentos estão próximos?",
"o que aconteceu hoje?" — o dashboard atual só responde às duas primeiras, de forma estática.

Estrutura proposta (mantendo os mesmos dados hoje disponíveis em `GET
/api/admin/dashboard` — nenhum dado novo é presumido, ADR-003):

```
┌─────────────────────────────────────────────────────────┐
│  Requer sua ação agora                    [N itens]      │
│  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌──────────┐ │
│  │ Materiais │ │ Aprovações│ │ Cadastros │ │  LGPD    │ │
│  │ atrasados │ │ aguardando│ │ p/ moderar│ │ pendente │ │
│  │    →      │ │    →      │ │    →      │ │    →     │ │
│  └───────────┘ └───────────┘ └───────────┘ └──────────┘ │
│  (cada card é clicável → lista já filtrada)               │
├─────────────────────────────────────────────────────────┤
│  Indicadores gerais                                        │
│  Parceiras ativas/inativas · Entregas pendentes ·          │
│  Pagamentos pendentes · Valor pendente                     │
│  (texto neutro, sem destaque — como já é hoje)             │
└─────────────────────────────────────────────────────────┘
```

Diferença central em relação ao atual: **cada card do primeiro grupo é um link**, não um
número estático (resolve P08) — usando o mesmo dado, sem nova API. "O que aconteceu hoje" e
tendência ao longo do tempo exigiriam um endpoint novo (log de eventos ou snapshot
histórico) — **não existe hoje** (declarado como lacuna, não presumido); se priorizado,
entra como item de backlog de produto/backend, fora do escopo desta auditoria de UX.

---

## 12. Estrutura das páginas (padrões a formalizar)

`DESIGN.md` já identificou corretamente 4 "templates" recorrentes no código — esta auditoria
os adota como os 4 templates oficiais da V2, cada um mapeado a blocks/componentes shadcn:

| Template | Onde já aparece hoje | Componentes shadcn alvo |
|---|---|---|
| **Shell autenticado** | `PortalLayout.tsx` | `sidebar` (block `sidebar-07` como base) |
| **Login** (3 estados: carregando / CTA / bloqueado) | `Login.tsx` | `login-03` ou `login-05` como layout de referência |
| **Lista + formulário admin** | `AdminEntregas`/`AdminBriefings`/`AdminObrigacoes`/`AdminParceiras` | `table` + `sheet` (edição lateral) + `dialog` (criação/confirmação) |
| **Resumo + histórico** | `Financeiro.tsx`, `AdminDashboard.tsx` | `card` (KPI) + `table` (histórico) |

Um quinto template, ausente hoje mas necessário para a jornada da Influenciadora, deve ser
formalizado:

| Template novo | Uso | Componentes shadcn alvo |
|---|---|---|
| **Lista de tarefas agrupada por urgência** | `Pendencias.tsx` | `item` + `badge` (status) + `collapsible` (expansão de detalhe) |

---

## 13. Componentes shadcn recomendados

Baseado na consulta ao **shadcn MCP** (registry `@shadcn`, 61 componentes `ui` + 97 blocks
catalogados — ver §21 para evidência bruta da consulta):

| Componente | Substitui / resolve | Prioridade |
|---|---|---|
| `table` | Listas `<ul>` sem cabeçalho (P02) | P0 |
| `dialog` + `alert-dialog` | `window.prompt()`, falta de confirmação (P03/P04) | P0 |
| `sidebar` | Sidebar CSS manual (P06) | P0 |
| `sheet` (já instalado) | Painel de edição lateral sem navegar de página | P0 |
| `dropdown-menu` (já instalado) | Menu de usuário (substitui botão "sair" solto, P07) | P0 |
| `badge` (já instalado) | Indicador de status/estágio consistente entre Parceiras/Entregas/Briefings/Obrigações | P0 |
| `field` | Padrão único de label+input+erro (P11, P16) | P1 |
| `item` | Linha de lista rica (usado no novo template de Pendências) | P1 |
| `input-group` | Busca/filtro dentro de listagens | P1 |
| `sonner` (já instalado, nunca montado) | Toasts de sucesso/erro (P12) | P1 |
| `skeleton` (já instalado, nunca usado) | Loading de tabela/lista (P13) | P1 |
| `empty` | Empty states padronizados (P18) | P1 |
| `breadcrumb` | Popular o slot já existente em `pageHeader.tsx` (P23) | P1 |
| `pagination` | Paginação (companion de mover corte para server-side, P21) | P1 |
| `command` | Busca global `⌘K` (P22) | P2 |
| `tabs` | Sub-navegação dentro de Financeiro (Aberto/Aprovado/Pago) se necessário | P2 |
| `tooltip` (já instalado) | Explicações contextuais em KPIs do dashboard | P2 |
| `calendar` | Se/quando datepicker for necessário em briefings/obrigações | P2 (sob demanda) |

Todos os itens acima existem no registry `@shadcn` consultado via MCP nesta sessão — nenhum
foi inventado (regra do prompt: "Sempre usar MCP como fonte primária").

---

## 14. Blocks recomendados

| Block | Uso proposto | Nota |
|---|---|---|
| `sidebar-07` | Base estrutural da nova sidebar (colapsa para ícones) | Adaptar cores/tipografia para os tokens DODÔ, nunca usar o tema visual padrão do shadcn como está |
| `sidebar-01` | Referência de agrupamento por seção (usado para inspirar o agrupamento do §7, não copiado literalmente) | — |
| `dashboard-01` | Referência estrutural (sidebar + KPIs + tabela) para o novo Painel Admin | Substituir os charts do block por KPIs clicáveis simples — **não introduzir gráficos que a documentação de produto não pediu** (evitar over-design) |
| `login-03` ou `login-05` | Referência de layout de login (fundo mudo / single column) | Deve manter o emblema de marca com opacidade que já existe hoje na Landing/Login atual — não adotar imagem de capa genérica |
| `data-table-demo` | Referência de implementação de `table` com ordenação/filtro | Usar como exemplo de código, não como página pronta |

**Blocks explicitamente não recomendados:** `login-02`/`login-04`/`signup-*` com imagem de
capa (colide com a identidade de marca que já usa o emblema translúcido, não fotografia) e
qualquer block com `signup-*` (o Portal não tem auto-cadastro por formulário — é convite +
OIDC, ADR-007/ADR-011; adotar um block de signup convencional contradiria a regra de negócio
já decidida).

---

## 15. Componentes descartados

| Componente | Por que descartado |
|---|---|
| `chart-*` (todos os 60+ blocks de gráfico do registry) | Nenhum requisito de produto pede série temporal/gráfico hoje (briefing original inclusive marcou "dashboards gerenciais" como fora de escopo, revisto parcialmente pelo ADR-021 só para KPIs simples). Adotar gráficos aqui seria inventar requisito — proibido por ADR-003. Revisitar só se/quando produto pedir explicitamente. |
| `carousel` | Não há caso de uso de conteúdo rotativo no Portal |
| `menubar` | Padrão de aplicação desktop (barra de menu tipo editor) incompatível com a densidade do Portal |
| `context-menu` | Nenhuma interação de clique-direito é esperada no domínio |
| `navigation-menu` | Sobrepõe-se ao `sidebar` já escolhido como navegação primária; usar os dois juntos duplicaria a navegação |
| `resizable` | Nenhuma tela do Portal tem painéis que se beneficiem de redimensionamento manual |
| `input-otp` | Não há fluxo de OTP — autenticação é 100% OIDC (ADR-007) |
| `attachment` / `bubble` / `message` / `message-scroller` / `marker` | Componentes de chat/mensageria — fora do domínio do Portal |
| `signup-*` (todos) | Ver §14 — Portal não tem auto-cadastro |

---

## 16. Quick wins

Itens de baixo esforço e alto impacto perceptível, sem dependência de outros itens do
roadmap:

1. Mover o botão "sair" da base da sidebar para um `dropdown-menu` de usuário (P07).
2. Montar `<Toaster/>` (já existe em `ui/sonner.tsx`) em `main.tsx` e substituir os textos de
   erro estáticos por `toast.error(...)` nos formulários administrativos (P12).
3. Corrigir a rota `/admin/financeiro` → `/admin/obrigacoes` (P20) — troca de string, sem
   risco.
4. Padronizar a capitalização dos textos de empty state (P18) — só texto, sem componente
   novo.
5. Adicionar `alert-dialog` de confirmação simétrica na rejeição de cadastro em
   `Admin.tsx`, igualando ao padrão já existente para exclusão LGPD (P04).
6. Trocar `window.prompt()` por um `dialog` com campo de texto (P03) — mesmo fluxo, UI real.

---

## 17. Roadmap

| Fase | Conteúdo | Depende de |
|---|---|---|
| **V2.0 — Fundação** | Tokenizar tipografia/espaçamento/raio (P16); criar `<RotaAdmin>` único (P05); adotar `sidebar` + reagrupamento (§7, P06); menu de usuário (P07) | Nenhuma |
| **V2.1 — Dados tabulares e feedback** | `table` em todas as listagens (P02); `dialog`/`alert-dialog` em toda ação destrutiva (P03/P04); ativar `sonner` (P12) e `skeleton` (P13) | V2.0 |
| **V2.2 — Formulários e dashboard** | Padrão `field` único (P11); dashboard clicável (P08); home de Influenciadora reagrupada por urgência (P09) | V2.1 |
| **V2.3 — Navegação avançada** | Busca `command` (P22); breadcrumbs reais (P23); paginação server-side (P21, depende de backend) | V2.2 |
| **V2.4 — Polimento** | Dark mode (P14); `prefers-reduced-motion` (P15); motion sutil no Portal (P24); consolidação de assets (P17) | V2.3 |

Cada fase é validável isoladamente (build/lint por projeto, conforme regra de execução do
CLAUDE.md) e não exige, em nenhum momento, alteração de regra de negócio ou de backend.

---

## 18. Backlog priorizado

Numeração de referência = mesma tabela de problemas (§3). Ordem dentro de cada prioridade
reflete dependência técnica, não importância.

**P0:** P05 → P06 → P07 → P02 → P03 → P04 → P08 → P01
**P1:** P16 → P10 → P11 → P12 → P13 → P09 → P21 → P22 → P23
**P2:** P14 → P15 → P17 → P18 → P19 → P20 → P24 → P25

---

## 19. Riscos

| Risco | Mitigação |
|---|---|
| Adotar componentes shadcn "puros" sem reaplicar os tokens DODÔ (cherry/cotton/noir, Work Sans/Elms Sans) — resultaria num Portal com "cara de shadcn genérico", não de marca | Todo componente deve ser adotado via `components.json` com o tema mapeado para os tokens já existentes em `tokens.css` — nunca aceitar o tema padrão do shadcn como está |
| Introduzir tabela/paginação server-side sem o backend estar pronto para paginar de fato | `table` + paginação client-side (como já é hoje) pode ser adotado primeiro; paginação server-side (P21) é a única linha do roadmap com dependência declarada de backend — não travar o resto da V2 nisso |
| Reagrupar a sidebar sem validar nomenclatura com o Contrato Soberano | Todos os nomes usados neste documento (§7) já são os nomes de rota/domínio existentes — nenhum termo novo foi introduzido; qualquer rename (ex. P20) deve ser tratado como decisão separada, não bundlada silenciosamente |
| Duplicar esforço entre este blueprint e a manutenção contínua de `DESIGN.md` | `DESIGN.md` deve ser tratado como auditoria histórica (28/07/2026); após aprovação deste documento, ele deve ou ser arquivado ou reescrito a partir daqui — não manter os dois como fontes paralelas sobre o mesmo assunto (regra "não criar documentação duplicada" do CLAUDE.md) |
| Escopo de implementação vazar para regra de negócio (ex. "já que estou na tela de Obrigações, vou mudar o fluxo de aprovação de pagamento") | Fora do mandato desta frente (CLAUDE.md: "Não mexa em regras de negócio existentes") — qualquer sugestão de mudança de regra encontrada durante implementação deve virar pergunta ao PO, não decisão de UX |

---

## 20. Tabela consolidada

| Tela | Problema | Solução | Componentes | Block | Benefício |
|---|---|---|---|---|---|
| Sidebar (global) | Navegação plana, sem agrupamento, 7 itens admin soltos (P06) | Reagrupar em Visão Geral / Operação / Financeiro / Governança | `sidebar` | `sidebar-07` | Reduz carga cognitiva; comunica o fluxo do domínio na própria nav |
| Sidebar (global) | Botão "sair" com peso de CTA primária (P07) | Menu de usuário no rodapé | `dropdown-menu` | — | Corrige hierarquia visual; libera espaço |
| Todas as rotas `/admin/*` | Guard de autorização duplicado 7x (P05) | `<RotaAdmin>` único envolvendo o grupo de rotas | — (mudança de roteamento) | — | Elimina risco de uma página esquecer a checagem |
| Parceiras / Entregas / Briefings / Obrigações / Colaborações | Listas sem cabeçalho de coluna (P02) | Tabela real com colunas nomeadas, ordenação | `table` | `data-table-demo` (referência) | Escaneabilidade, paridade com padrão de mercado (Linear/Attio) |
| Admin.tsx (rejeição de cadastro) | Ação destrutiva sem confirmação (P04) | Confirmação simétrica à exclusão LGPD já existente | `alert-dialog` | — | Reduz risco operacional |
| Admin.tsx (exclusão LGPD) | Captura de justificativa via `window.prompt()` (P03) | Modal real com campo de texto | `dialog` | — | UI consistente, sem bloquear a thread do browser |
| Parceiras / Entregas / Briefings / Obrigações (criação/edição) | Formulário mostra/esconde inline, sem padrão único de campo (P11) | Painel lateral de edição + padrão `field` | `sheet`, `field` | — | Consistência entre as 4 telas administrativas |
| Todas (feedback) | Sucesso/erro só como texto estático; toast instalado e nunca usado (P12) | Toasts reais para ações assíncronas | `sonner` | — | Feedback imediato, sem recarregar contexto visual da página |
| Todas (loading) | Spinner genérico único; skeleton instalado e nunca usado (P13) | Skeleton de tabela/lista durante carregamento | `skeleton` | — | Percepção de performance, menos "flash" de conteúdo |
| Painel Admin (`/admin/dashboard`) | KPIs estáticos, não clicáveis, sem link para a lista filtrada (P08) | Cada card é um link para a lista já filtrada | `card`, `badge` | referência estrutural de `dashboard-01` (sem os gráficos) | Transforma o painel em ponto de partida de ação, não só leitura |
| Pendências (Influenciadora) | Acordeão de texto corrido, sem hierarquia por urgência (P09) | Lista agrupada por urgência (atrasado / esta semana / mês / equipe) | `item`, `badge`, `collapsible` | — | Comunica prioridade sem exigir leitura completa |
| Login | Já correto estruturalmente (3 estados, emblema de marca) — apenas formalizar como template | Nenhuma mudança funcional, só formalização | — | `login-03`/`login-05` como referência de layout | Documenta o padrão para não divergir no futuro |

---

## 21. Evidências dos MCPs

### shadcn MCP

| # | Objetivo da consulta | Resultado encontrado | Decisão influenciada |
|---|---|---|---|
| 1 | `get_project_registries` — confirmar registry configurado em `portal-frontend/components.json` | Primeira chamada retornou vazio (falha transitória de classificador do harness, não do MCP); `components.json` já declara `style: "base-nova"`, base `@base-ui/react`, `registries: {}` (herda o padrão `@shadcn`) | Confirma que o Portal já está pré-configurado para consumir o registry oficial — nenhuma migração de tooling é necessária para adotar os componentes recomendados |
| 2 | `list_items_in_registries` (`types: ["block"]`, registry `@shadcn`) | 97 blocks catalogados: 16 variantes de `sidebar-*`, 5 de `login-*`, 5 de `signup-*`, 1 `dashboard-01`, e ~70 blocks de `chart-*` (área/barra/linha/pizza/radar/radial/tooltip) | Base para §14 (blocks recomendados) e §15 (descartados) — o volume de blocks de gráfico (70/97) confirmou que a maior parte do catálogo de blocks do shadcn é voltada a analytics, não a CRUD administrativo — reforçou a decisão de descartar `chart-*` por falta de requisito de produto, não por limitação do registry |
| 3 | `search_items_in_registries("data table")` | Retornou `data-table-demo` (example), `dashboard-01`, e 3 variantes de `sidebar-*` com data table embutida | Confirmou `data-table-demo` como referência de implementação para a adoção de `table` nas 5 telas administrativas (§13, §20) |
| 4 | `search_items_in_registries("empty state")`, `("command palette")`, `("settings form")`, `("login authentication")` | Sem resultado direto (o registry indexa por nome exato de componente, não por descrição livre) | Levou à busca correta por nome de componente (`empty`, `command`) na consulta seguinte, confirmando ambos existem como componentes `ui` de primeira classe |
| 5 | `search_items_in_registries("empty")`, `("command")`, `("table")` (`types: ["component","ui"]`) | Confirmados: `empty`, `command`, `table` como componentes `ui` individuais no registry `@shadcn` | Validou que `empty` (P18), `command` (P22) e `table` (P02) são componentes reais e recomendáveis, não hipóteses |
| 6 | `list_items_in_registries` (`types: ["ui"]`) | 61 componentes `ui` catalogados, incluindo `field`, `item`, `input-group`, `breadcrumb`, `pagination`, `sidebar`, `sonner`, `skeleton`, `kbd`, `native-select`, além de um grupo de componentes de chat (`attachment`, `bubble`, `message`, `message-scroller`, `marker`) fora do domínio do Portal | Base direta da tabela de componentes recomendados (§13) e descartados (§15) — `field` e `item`, específicos e menos conhecidos, só foram descobertos por esta listagem completa, e resolvem diretamente P11 e o novo template de Pendências (§12) |

### Design MCP (Claude Design / DesignSync)

Consultado quanto à disponibilidade: a ferramenta existe no ambiente (`DesignSync`), mas
esta sessão não tinha um projeto de Design System DODÔ ativo apontado para leitura de tokens
— e o mandato desta auditoria é **não alterar nada**, então nenhuma chamada de escrita
(`finalize_plan`/`write_files`) foi feita. Os tokens visuais usados neste documento (cores,
tipografia, espaçamento) vêm da leitura direta do código-fonte real (`app/src/index.css`,
`portal-frontend/src/styles/tokens.css`), que é a fonte de verdade declarada por ADR-001 —
mais confiável, neste caso, que um projeto de design externo desatualizado em relação ao
código. Se um projeto de Design System DODÔ existir e for indicado pelo responsável do
projeto, uma auditoria futura pode usar `DesignSync.list_projects`/`get_file` para
cross-checar tokens publicados contra o código — não feito aqui por falta de um projeto
apontado e por estar fora do escopo mínimo necessário para este blueprint.

---

## 22. Notas finais

- Nenhum arquivo de código foi criado, editado ou apagado para produzir esta auditoria — só
  leitura (`Read`/`Explore`) e consultas ao shadcn MCP.
- Nenhuma regra de negócio foi questionada; onde uma sugestão de UX tocava potencialmente uma
  regra (ex. paginação server-side, P21), isso foi declarado explicitamente como dependência
  de backend, não decidido aqui.
- Este documento aguarda aprovação antes de qualquer implementação, conforme instrução
  explícita do escopo desta frente.
