# Briefing de Telas e Componentes — Projeto DODÔ

> **O que este documento é:** a especificação oficial da arquitetura de
> telas e componentes do sistema DODÔ (plataforma **Influencia**),
> derivada de auditoria real do código, da documentação de produto e do
> Design System vigentes. Serve como briefing de entrada para qualquer
> ferramenta de geração de interface (Google Stitch, Figma AI, Lovable,
> V0 etc.) — **não é, em si, um prompt para nenhuma delas.**
>
> **O que este documento não é:** não é uma decisão de arquitetura de
> software, não é um ADR, não altera nenhuma regra de negócio do
> `CONTRATO_SOBERANO.md` nem das SPECs. É uma leitura de UX sobre um
> sistema já implementado, com recomendações de simplificação sujeitas à
> aprovação do responsável do projeto antes de virarem trabalho de
> implementação.

**Data:** 2026-07-24
**Autor:** auditoria assistida (Claude Code), a pedido do responsável do
projeto.
**Fontes analisadas:** `docs/PRD.md`, `docs/history/CONTRATO_SOBERANO.md`,
`docs/_workspace/TASK_ROUTER.md`, `docs/design/DESIGN_SYSTEM.md`,
`docs/design/UI_RULES.md`, `est-dio-el-design-system/design-tokens.css`,
`frontend/src/App.tsx` (rotas), todas as páginas de
`frontend/src/pages/` e `frontend/src/pages/portal/`, todos os
componentes de `frontend/src/components/`, `frontend/src/lib/*.ts`,
Models/Policies/rotas de `backend/app/` e `backend/routes/api.php`.

---

## 1. Como este documento foi construído

Antes de qualquer proposta de tela, o sistema foi auditado em quatro
camadas, nesta ordem:

1. **Negócio** — `PRD.md` (fluxos e regras de negócio herdadas do V1,
   RN-01 a RN-18) e `CONTRATO_SOBERANO.md` (linguagem ubíqua e domínio
   soberano do V2/V3).
2. **Estado real de implementação** — `TASK_ROUTER.md` (todas as SPECs
   001–035 estão `[x]` concluídas; o domínio vigente é o V3
   Laravel + React, não mais o Apps Script do PRD — os nomes de entidade
   mudaram, as regras de negócio, não).
3. **Rotas e telas existentes** — `App.tsx` e o código real de cada
   página (não suposição: cada afirmação abaixo sobre uma tela vem de
   ter lido o `.tsx` correspondente).
4. **Design System vigente** — tokens de cor/tipografia/espaçamento
   (`design-tokens.css`) e as regras obrigatórias de `UI_RULES.md`
   (mobile first, um CTA primário por tela, nunca mais de um padrão para
   a mesma interação, estados obrigatórios, etc.).

Nenhuma funcionalidade abaixo foi inventada. Onde uma tela hoje é um
`PlaceholderPage` ("em construção") ou um item de menu desabilitado, isso
é dito explicitamente — e a recomendação, quando houver, é sempre
amarrada a um requisito já existente no PRD/SPEC, nunca a uma ideia nova.

---

## 2. Perfis e prioridade de dispositivo

| Perfil | Papel técnico (`role`) | Prioridade | Por quê |
|---|---|---|---|
| **Influenciadora** (Parceira) | `INFLUENCIADORA` | **Mobile First obrigatório** — desktop existe, mas é secundário | Usa quase exclusivamente o celular (requisito do responsável do projeto para esta tarefa; consistente com o Portal já ser a superfície mais enxuta do sistema) |
| **Administrador** (equipe da marca) | `ADMIN`, `GESTOR_MARCA` | **Responsivo obrigatório, desktop prioritário**, mobile totalmente funcional | Opera o ciclo mensal inteiro (cadastro, briefing, aprovação, financeiro) — tarefas de mesa, mas precisa funcionar em campo |

**Achado relevante:** o código hoje distingue apenas `isAdmin` (`role
=== 'ADMIN'`) de "resto". `GESTOR_MARCA` existe como valor de `role` e
aparece no rótulo do Dashboard, mas **nenhuma tela do sistema trata
`GESTOR_MARCA` de forma diferente de `INFLUENCIADORA` ou de `ADMIN`** —
não há tela nem regra visível para esse papel além do rótulo. Isso não é
tratado como bug aqui (não é escopo desta tarefa decidir o que
`GESTOR_MARCA` deve fazer), mas fica registrado: qualquer tela nova
proposta abaixo herda a mesma dualidade `Administrador` / `Influenciadora`
já existente, sem inventar um terceiro fluxo para `GESTOR_MARCA`.

---

## 3. Domínio (para dar contexto às telas — não redefine o Contrato Soberano)

Vocabulário oficial (`CONTRATO_SOBERANO.md` §4) e sua materialização no
código Laravel atual:

| Conceito de domínio | Model Laravel | Estados possíveis |
|---|---|---|
| Parceira (influenciadora) | `Parceira` | `Ativa` \| `Inativa` (+ `reprovado_em`/`motivo_reprovacao` como sinal de reprovação, sem status próprio) |
| Marca | `Marca` | `Ativa` \| `Inativa` (não confirmado no código além do default) |
| Colaboração Mensal / Campanha | `Campanha` | `PLANEJADA` → `ATIVA` → `ENCERRADA` \| `CANCELADA` |
| Vínculo Parceira×Campanha | `ParticipacaoNaCampanha` | `ATIVA` \| `CANCELADA` (+ `congelado_em`, trava valor/quantidades) |
| Briefing | `Briefing` | sem status próprio; `data_aprovacao_interna` sempre = `prazo` − 7 dias (regras de dia útil, RN-04) |
| Entrega de conteúdo | `Material` | `PENDENTE` → `APROVADO` \| `REPROVADO` |
| Pagamento | `Pagamento` | `PENDENTE` → `APROVADO` → `PAGO` |
| Envio logístico | `Envio` | `PENDENTE` → `EXPEDIDO` → `ENTREGUE` \| `CANCELADO` |
| Medidas da influenciadora | `MedidaInfluenciadora` | sem status; histórico append-only (a mais recente é a vigente) |

Autorização: **`ADMIN` tem bypass global** (`Gate::before` em
`AppServiceProvider`) — passa em qualquer policy. As policies existentes
(`ParceiraPolicy`, `CampanhaPolicy`, `ParticipacaoNaCampanhaPolicy`,
`MarcaPolicy`) regem exclusivamente o que a `INFLUENCIADORA` enxerga: só
os próprios registros (`user_id` dono), e só campanhas/participações em
que ela tem uma `ParticipacaoNaCampanha` com `status = ATIVA`.

---

## 4. Design System vigente (resumo operacional)

Fonte: `est-dio-el-design-system/design-tokens.css`, `docs/design/UI_RULES.md`.

- **Paleta:** roxo `#564f94` (primária/identidade/CTA), off-white
  `#f1ece5` (fundo padrão), amarelo `#eff857` (realce/badge, só texto
  preto sobre ele), preto `#1d1c1a` (texto), laranja `#f85919`
  (secundária/alerta, só texto preto), branco (superfície de
  cartões/campos).
- **Tipografia:** `Elms Sans` (display/títulos, peso 800), `Work Sans`
  (corpo/interface, peso 400/600/700).
- **Espaçamento:** escala `--sp-1` (4px) a `--sp-9` (96px).
- **Raio:** campo 8px, card 14px, bloco 24px, pílula 999px (badges/pills).
- **Grid:** `max-width` 1120px, 12 colunas desktop / 4 mobile, gutter 24px.
- **Regras obrigatórias (`UI_RULES.md`) mais relevantes para este
  briefing:**
  - Mobile first, grid consistente, sem rolagem horizontal.
  - Um único CTA primário por tela.
  - Botões destrutivos exigem confirmação.
  - Não usar modais desnecessários.
  - Nunca duplicar componentes semelhantes / nunca criar padrão
    diferente para a mesma interação.
  - Toda tela precisa dos estados: carregamento, vazio, sem resultados,
    erro, sem permissão, offline (quando aplicável).
  - Cor nunca é o único indicador de estado.

Este briefing usa essas regras como critério de aceitação das propostas
das seções 6–8 — inclusive para justificar remoções (ex.: modais e
páginas duplicadas que a auditoria encontrou e que já violam essas
regras hoje).

---

## 5. Inventário de telas existentes (auditoria, estado real)

### 5.1 Público / autenticação (sem `AppShell`/`PortalShell`)

| Tela | Rota | Estado real |
|---|---|---|
| Landing | `/` (deslogado) | Estática, CTA único "Quero ser Parceira" → `/cadastro`, link para `/login` |
| Login | `/login` | Email + senha, erro genérico único |
| Esqueci senha | `/esqueci-senha` | Sempre responde "verifique seu e-mail" (proteção contra enumeração) |
| Definir senha | `/definir-senha` | Lê `token`/`email` da URL; trata token inválido |
| Cadastro público | `/cadastro` | Auto-cadastro de influenciadora, sem login, com CEP automático, máscaras e consentimento LGPD obrigatório |

### 5.2 Administração (`AppShell`, sidebar desktop / top-bar mobile)

| Tela | Rota | Estado real |
|---|---|---|
| Painel | `/` | 4 cards-resumo (Campanhas, Colaborações, Aprovações, Financeiro) — 2 dos 4 cards são só decorativos hoje (Colaborações e Financeiro não têm dado nem link) |
| Parceiras — Lista | `/parceiras` | Filtro "todas" / "novas inscrições" |
| Parceiras — Formulário | `/parceiras/nova`, `/parceiras/:id/editar` | Cadastro completo + consentimento |
| Parceiras — Perfil | `/parceiras/:id` | Aprovar/reprovar, reenviar convite, histórico de alterações (só admin vê) |
| Marcas — Lista | `/marcas` | Sem filtro de status, sem `StatusBadge` (inconsistência, ver §7) |
| Marcas — Formulário | `/marcas/nova`, `/marcas/:id/editar` | Mais simples que o de Parceira; não existe "Perfil de Marca" |
| Campanhas — Lista | `/campanhas` | Filtro por status via querystring |
| Campanhas — Formulário | `/campanhas/nova`, `/campanhas/:id/editar` | Status só editável em modo edição |
| Campanhas — Detalhe | `/campanhas/:id` | Hub: dados da campanha + vincular parceira + tabela de participações + drill-down |
| Briefing | `/participacoes/:id/briefing` | Tela própria, 1 de 4 telas que giram em torno da mesma Participação |
| Materiais | `/participacoes/:id/materiais` | Tela própria, 2 de 4 |
| Pagamento | `/participacoes/:id/pagamento` | Tela própria, 3 de 4 |
| Envio | `/participacoes/:id/envio` | Tela própria, 4 de 4 — reaproveita literalmente o CSS de Pagamento (acoplamento visual já existente no código) |
| Logística | `/logistica` | Visão só-leitura agregada client-side de todos os envios de campanhas ativas; sem endpoint dedicado |
| Documentos | `/documentos` | **`PlaceholderPage`** — "em construção" |
| Histórico | `/historico` | **`PlaceholderPage`** — "em construção" |
| Perfil (conta) | `/perfil` | **`PlaceholderPage`** — "em construção" |

Além disso, `AppShell` já declara (desabilitados, `aria-disabled`, sem
rota) os itens de menu **Colaborações, Briefings, Materiais, Aprovações,
Pagamentos** — sinal de que a intenção original era criar mais uma tela
cheia para cada um desses conceitos. A Seção 8 usa exatamente esse ponto
como o maior alvo de simplificação deste briefing.

### 5.3 Portal da Influenciadora (`PortalShell`, mobile first)

| Tela | Rota | Estado real |
|---|---|---|
| Painel | `/` | Saudação, alerta de perfil incompleto, cards de participações ativas |
| Campanhas | `/campanhas` | Lista das campanhas ativas da influenciadora |
| Histórico | `/historico` | Lista de campanhas/participações encerradas — **estrutura de código quase idêntica à de Campanhas** (reaproveita o mesmo CSS module) |
| Participação — Detalhe | `/participacoes/:id` | **Já é a tela mais bem desenhada do sistema para este briefing**: briefing + upload de material + status de pagamento, tudo em uma página só, sem nenhuma tela irmã |
| Perfil | `/perfil` | Dados pessoais/contratuais + medidas, dois formulários independentes na mesma tela |

**Total de rotas distintas hoje:** 5 públicas/auth + 17 administrativas
(14 reais + 3 placeholders) + 5 do portal = **27 telas**, sendo 3 delas
vazias (placeholder) e pelo menos 5 itens de menu planejados e ainda não
construídos.

---

## 6. Inventário de componentes reutilizáveis existentes

| Componente | Finalidade | Onde é usado hoje | Reuso |
|---|---|---|---|
| `Button` / `LinkButton` | Ação primária/secundária, com estado de carregamento (`isLoading`/`loadingText`) | Praticamente toda tela com formulário ou ação | Alto — já é o padrão único de botão do sistema |
| `TextField` | Campo de texto com label, erro e `aria-describedby` | Todos os formulários (Parceira, Marca, Campanha, Briefing, Cadastro público, Perfil) | Alto |
| `SelectField` | Select com o mesmo padrão visual/acessível do `TextField` | Campanha (marca/status), Briefing (tipo), Materiais (escolha de briefing), Perfil (medidas) | Alto |
| `TextareaField` | Área de texto, mesmo padrão | Briefing (orientações), Materiais (motivo de reprovação), Perfil de Parceira (motivo de reprovação) | Médio |
| `Badge` | Rótulo de status genérico, `tone: success \| neutral \| error`, tom decidido por função `xStatusTone()` em cada `lib/*.ts` | Campanha, Material, Pagamento, Envio, Participação (admin e portal) | Alto — é o padrão real de status do sistema |
| `StatusBadge` | Rótulo de status **hardcoded** para `Parceira` (`Ativa`/`Inativa`) | Só em telas de Parceira + Dashboard do portal | Baixo — ver achado de simplificação em §7 |
| `EmptyState` | Título + mensagem + ação opcional para listas vazias | Todas as listas (admin e portal) | Alto |
| `AppShell` | Casca de navegação admin — sidebar fixa desktop / top-bar + nav horizontal mobile | Toda rota admin | Estrutural |
| `PortalShell` | Casca de navegação do portal — mesmo padrão visual de `AppShell`, reaproveita o mesmo CSS module | Toda rota do portal | Estrutural |
| `AuthSplitLayout` | Layout split-screen (marca + conteúdo) para telas públicas | Landing, Login, Esqueci/Definir senha, Cadastro público | Alto |
| `PlaceholderPage` | "Em construção" | `/documentos`, `/historico` (admin), `/perfil` (admin) | Temporário por natureza — deve desaparecer conforme as telas reais nascem |

**Sem componente dedicado hoje** (achado de auditoria, não suposição):
não existe `Modal`/`Dialog`, não existe `Tabs`, não existe `Table`/`Data
Grid` reutilizável (cada lista reimplementa a própria `<table>`), não
existe componente de paginação reutilizável (cada lista reimplementa o
texto "página X de Y" + botões), não existe `Toast`, não existe
`Skeleton` (todo carregamento hoje é o texto literal "Carregando…"), não
existe `Upload`/`Drag & Drop` (o upload de material no portal é um
`<input type="file" multiple>` cru dentro de um `<label>` estilizado),
não existe `Avatar` como componente (a lógica de iniciais está duplicada
literalmente entre `AppShell.tsx` e `PortalShell.tsx`), não existe
biblioteca de ícones (nenhuma dependência de ícones no `package.json`; os
únicos SVGs do sistema são a wordmark da marca e um ícone decorativo de
estrela no `AuthSplitLayout`).

---

## 7. Oportunidades de simplificação encontradas na auditoria

Estas não são preferências estéticas — são inconsistências reais
encontradas no código, cada uma com uma recomendação objetiva:

1. **`StatusBadge` é redundante com `Badge`.** `Badge` já é genérico
   (`tone` + `label`) e já tem uma função `xStatusTone()` por domínio
   (campanha, material, pagamento, envio, participação). `StatusBadge`
   existe só para `Parceira`, com a mesma semântica (`Ativa` → verde,
   `Inativa` → neutro). **Recomendação:** criar `parceiraStatusTone()`
   em `lib/parceiras.ts` (mesmo padrão dos outros cinco domínios) e
   aposentar `StatusBadge`, usando `Badge` em todo lugar. Reduz de 2
   componentes de status para 1.
2. **`MarcasListPage` não usa nem `Badge` nem `StatusBadge`** — mostra o
   status como texto puro (`{marca.status}`), enquanto toda outra lista
   do sistema usa `Badge`. Viola a própria regra do `UI_RULES.md`
   ("mesmo componente → mesmo comportamento"; "não criar padrões
   diferentes para a mesma interação"). **Recomendação:** aplicar
   `Badge` também em Marcas.
3. **Cada tela de lista reimplementa sua própria tabela e sua própria
   paginação.** `ParceirasListPage`, `MarcasListPage`,
   `CampanhasListPage` (admin) e as duas listas do portal têm o mesmo
   padrão visual e o mesmo comportamento (página X de Y, anterior/
   próxima), mas cada uma com seu próprio JSX/CSS. **Recomendação:**
   extrair `Table` e `Pagination` como componentes compartilhados — não
   muda nenhuma tela, só consolida o que já é, na prática, um único
   padrão usado 5 vezes.
4. **Quatro telas para uma única entidade.** `BriefingFormPage`,
   `MateriaisPage`, `PagamentoPage` e `EnvioPage` são, hoje, quatro
   rotas, quatro páginas e quatro carregamentos de tela para gerenciar
   quatro aspectos da **mesma** `ParticipacaoNaCampanha`. O portal já
   resolve exatamente esse problema em uma única tela
   (`PortalParticipacaoPage`, que mostra briefing + upload + pagamento
   juntos). **Recomendação central deste briefing** — ver §8.1.
5. **Cinco conceitos de menu sem tela nunca receberam avaliação de real
   necessidade.** `Colaborações`, `Briefings`, `Materiais`, `Aprovações`
   e `Pagamentos` estão desabilitados no menu do `AppShell`, sinalizando
   a intenção de se tornarem 5 telas cheias adicionais. Combinados com
   `Documentos`/`Histórico`/`Perfil` (hoje placeholders), o sistema está
   a 8 telas de distância de crescer de 27 para ~35 rotas — na direção
   oposta ao requisito de simplicidade desta tarefa. **Recomendação:**
   nenhum desses 8 conceitos deve virar uma tela nova 1-para-1; ver §8.
6. **Duplicação literal de lógica entre as duas cascas de navegação.**
   `getInitials()` existe, palavra por palavra, em `AppShell.tsx` e em
   `PortalShell.tsx`. **Recomendação:** extrair `Avatar` como componente
   compartilhado (props: `name`).
7. **Acoplamento visual não-semântico.** `EnvioPage` importa o CSS
   module de `PagamentoPage` (`import styles from
   './PagamentoPage.module.css'`) em vez de ter o seu próprio ou de
   reaproveitar um componente compartilhado. Sintoma do mesmo problema
   do item 4 — resolvido pela mesma recomendação.
8. **Upload sem feedback de progresso nem drag & drop**, em uma tela
   usada majoritariamente no celular por quem está enviando vídeo (Reels)
   pela rede móvel. É o maior risco de UX mobile do sistema hoje, dado o
   requisito "Mobile First obrigatório" da Influenciadora. **Recomendação:**
   ver componente `Upload` em §9.
9. **Nenhum feedback transitório de sucesso** (toast) em nenhuma tela —
   sucesso hoje é sempre um texto fixo na página (ex.: Perfil do portal
   usa um `setTimeout` de 4s para esconder a própria mensagem). Funciona,
   mas obriga a mensagem de sucesso a competir por espaço com o resto do
   layout, e é um padrão diferente por tela (`UI_RULES.md` proíbe
   exatamente isso — "não criar padrões diferentes para a mesma
   interação"). **Recomendação:** ver componente `Toast` em §9.
10. **Nenhuma confirmação para ações destrutivas.** `UI_RULES.md` exige
    confirmação para botões destrutivos, mas `CampanhaDetailPage` executa
    "cancelar participação" direto no clique, sem confirmação e sem
    tratamento de erro visível (achado de auditoria: `handleCancelar`
    chama a API sem `try/catch` no componente). **Recomendação:** não é
    caso para `Modal` (o `UI_RULES.md` também proíbe modal
    desnecessário) — o próprio sistema já tem o padrão certo, usado em
    "reprovar parceira"/"reprovar material" (seção inline que expande
    pedindo confirmação/motivo antes de enviar). Replicar esse mesmo
    padrão para "cancelar participação" resolve o problema sem introduzir
    um componente novo.

---

## 8. Arquitetura de UX proposta

Princípio geral: **toda tela nova proposta abaixo substitui ou absorve
uma tela/conceito que já existe (ou já estava planejado) — nenhuma
adiciona escopo novo ao sistema.** Onde uma funcionalidade cabe em uma
aba, um filtro ou uma seção da tela já existente, ela não vira rota.

### 8.1 Fusão central: Participação — Detalhe único (admin)

**Hoje:** `BriefingFormPage`, `MateriaisPage`, `PagamentoPage`,
`EnvioPage` — 4 rotas, 4 telas, 4 carregamentos, para gerenciar 4 facetas
da mesma `ParticipacaoNaCampanha`, todas acessadas a partir da mesma
linha da tabela em `CampanhaDetailPage`.

**Proposto:** **1 tela**, `Participação — Detalhe`
(`/participacoes/:id`, mesma rota que o portal já usa, agora também no
admin), estruturada com **Tabs**: `Briefing` · `Materiais` · `Pagamento`
· `Envio`. Cada aba é o conteúdo que já existe hoje em cada página —
nenhuma funcionalidade é removida, só deixam de exigir navegação/
recarregamento completo de página para alternar entre elas.

**Justificativa:**
- É o padrão que o próprio portal já usa com sucesso
  (`PortalParticipacaoPage` já mostra 3 dessas 4 facetas numa página só).
- Reduz de 4 rotas para 1, sem perder nenhuma função.
- Resolve o achado #7 (acoplamento CSS Envio↔Pagamento) por construção —
  deixam de ser páginas separadas competindo por identidade visual.
- Consistente com `UI_RULES.md` ("mesmo componente → mesmo
  comportamento"): hoje a mesma entidade (Participação) é navegada de 4
  formas diferentes; com abas, é sempre 1.

### 8.2 Fusão: Fila de Trabalho (admin) — substitui Logística + os 5 itens de menu dormentes

**Hoje:** `LogisticaPage` (tela própria, só envio) + os itens de menu
desabilitados `Colaborações`, `Briefings`, `Materiais`, `Aprovações`,
`Pagamentos` (nenhum implementado, mas sinalizando 5 telas futuras).

**Proposto:** **1 tela**, `Fila de Trabalho` (`/pendencias` ou
equivalente), com **Tabs**: `Envios pendentes` · `Materiais para
aprovar` · `Pagamentos a liberar`. Cada aba é uma lista simples (reusa o
componente `Table`/`Pagination` de §9) filtrada pelo status
"pendente/aguardando ação" daquele domínio, cruzando todas as campanhas
ativas — exatamente o que `LogisticaPage` já faz hoje para envio, mas
generalizado para os outros dois domínios que também têm um estado
"aguardando ação do admin" (`Material.PENDENTE`, `Pagamento.PENDENTE`/
`APROVADO`). Cada linha leva para a aba correspondente da tela unificada
de Participação (§8.1).

**Justificativa:**
- Cobre o mesmo objetivo que motivou os 5 itens de menu dormentes
  (dar ao admin uma visão de "o que precisa da minha atenção agora"),
  sem precisar de 5 telas — 1 tela com 3 abas já cobre os 3 domínios que
  realmente têm um estado "pendente" (Envio, Material, Pagamento).
  `Colaborações` e `Briefings` não têm um estado "pendente" isolado no
  domínio (Briefing não tem status próprio) — não geram aba própria.
- O card "Aprovações" do Dashboard, hoje só decorativo (mostra uma
  contagem sem link útil), passa a linkar para a aba `Materiais para
  aprovar` desta tela — resolve também o achado de que 2 dos 4 cards do
  Dashboard não levam a lugar nenhum.
- Reaproveita 100% do padrão de lista já validado no resto do sistema.

### 8.3 Documentos — vira ação, não tela

**Hoje:** `/documentos` é um `PlaceholderPage`. A SPEC-023 (geração de
documentos) já está implementada no backend, mas o próprio roteador de
tarefas registra explicitamente que **não há UI definida para isso** —
"leitura futura".

**Proposto:** nenhuma tela nova. Dois pontos de ação, cada um dentro de
uma tela que já existe:
- Botão "Gerar contrato" dentro de `Parceiras — Perfil` (§5.2) — o
  contrato é por Parceira, condicionado a `status = Ativa` (RN-15/RN-03).
- Botão "Gerar briefing formal" dentro da aba `Briefing` da tela
  unificada de Participação (§8.1) — condicionado à sinalização própria
  da SPEC-023.

**Justificativa:** a SPEC nunca pediu uma tela de "central de
documentos"; pediu geração pontual condicionada a um registro específico
já existente (Parceira, Briefing). Uma tela nova só para isso seria
funcionalidade inventada — o próprio princípio deste briefing proíbe
isso.

### 8.4 Histórico (admin) — vira filtro, não tela

**Hoje:** `/historico` é um `PlaceholderPage` sem nenhuma implementação.

**Proposto:** nenhuma tela nova. `Campanhas — Lista` (§5.2) já tem
filtro de status por querystring (`?status=`); os valores `ENCERRADA` e
`CANCELADA` **já são o histórico** — só falta um atalho de UI (chip/tab
"Histórico" que aplica esse filtro). O mesmo vale, no nível de
Participação, dentro da Fila de Trabalho (§8.2): itens concluídos somem
das abas "pendente" por definição, sem precisar de uma tela de histórico
paralela.

**Justificativa:** o domínio já modela "encerrado" como um valor de
status, não como uma coleção física separada (ao contrário do V1
legado, que tinha abas de histórico físicas — o Contrato Soberano
explicitamente não exige isso do V3). Criar uma tela de histórico seria
reintroduzir uma distinção que a migração para Laravel já eliminou.

### 8.5 Perfil da conta (admin) — vira drawer, não tela

**Hoje:** `/perfil` é um `PlaceholderPage`. O que essa tela precisa
guardar (nome, e-mail, troca de senha do próprio usuário administrador)
é pouco — não é o perfil de negócio da Parceira (esse já existe e é
outra tela, `Parceiras — Perfil`).

**Proposto:** nenhuma rota cheia. Um **Drawer** disparado a partir do
avatar no header do `AppShell` (mesmo padrão já usado para o menu do
usuário), contendo os dois únicos campos que fazem sentido para uma
conta de administrador: dados básicos e troca de senha.

**Justificativa:** `UI_RULES.md` não proíbe drawer (só proíbe modal
*desnecessário*) — para um formulário de poucos campos, sem tabela, sem
navegação própria, um drawer evita gastar uma rota inteira e uma
navegação completa de página nisso.

### 8.6 Portal: Campanhas + Histórico viram uma tela com abas

**Hoje:** `PortalCampanhasListPage` (`/campanhas`) e
`PortalHistoricoPage` (`/historico`) são duas rotas com estrutura de
código quase idêntica (a segunda literalmente importa o CSS module da
primeira) — a diferença real entre elas é só o filtro de dados (ativas
vs. encerradas).

**Proposto:** **1 tela**, `Campanhas` (`/campanhas`), com um seletor
simples de 2 estados — `Ativas` / `Histórico` — no topo (segmented
control, não Tabs cheias, dado o espaço reduzido em mobile). Elimina
`/historico` como rota própria.

**Justificativa:** é a aplicação mais direta do requisito Mobile First
deste briefing — no `PortalShell`, isso reduz a navegação principal de 4
itens (Painel, Campanhas, Histórico, Perfil) para **3** (Painel,
Campanhas, Perfil), o que em mobile significa menos itens competindo por
espaço/toque na barra de navegação e menos decisão de "em qual desses
dois eu clico" para quem só quer ver tudo que já fez.

### 8.7 O que já está certo e não deve mudar

- **`PortalParticipacaoPage`** já é o melhor exemplo de simplicidade do
  sistema (briefing + upload + pagamento em uma tela só, com estados
  condicionais por tipo de entregável contratado) — é o modelo que a
  fusão de §8.1 replica para o admin, não o contrário.
- **`ParceiraFormPage` / `ParceiraProfilePage`** já são a divisão
  correta (formulário vs. perfil com ações de ciclo de vida) — não fundir.
  Fundir criaria uma tela só com muitos modos condicionais, o que
  `UI_RULES.md` desaconselha implicitamente ("um único comportamento
  para cada componente").
- **`MarcaFormPage` sem tela de perfil separada** já é proporcional ao
  tamanho do domínio (Marca tem poucos campos, sem ciclo de
  aprovação) — não criar uma "Marca — Perfil" simétrica a Parceira só
  por simetria; seria tela sem funcionalidade que a justifique.
- **`CampanhaDetailPage` como hub** (dados + vincular parceira + lista de
  participações) já é o padrão certo — nenhuma mudança proposta aqui.

---

## 9. Inventário de componentes propostos

### 9.1 Já existentes — mantidos (ver §6 para detalhe)

`Button`/`LinkButton`, `TextField`, `SelectField`, `TextareaField`,
`Badge`, `EmptyState`, `AppShell`, `PortalShell`, `AuthSplitLayout`.

### 9.2 Já existentes — a consolidar (ver §7)

| Componente | Ação |
|---|---|
| `StatusBadge` | Aposentar — substituir por `Badge` + `parceiraStatusTone()` |
| `PlaceholderPage` | Remove-se sozinho conforme §8.3/8.4/8.5 forem implementadas — não precisa de ação própria |

### 9.3 Novos — necessários para a arquitetura proposta

| Componente | Finalidade | Onde será usado | Justificativa de reuso |
|---|---|---|---|
| `Tabs` | Alternar entre facetas da mesma entidade sem navegação de página | Participação — Detalhe (§8.1: Briefing/Materiais/Pagamento/Envio), Fila de Trabalho (§8.2: Envios/Materiais/Pagamentos) | 2 telas, 7 abas ao todo — evita 6 rotas |
| `Table` | Tabela padrão (cabeçalho, linha, ação por linha) | Toda lista hoje reimplementada manualmente: Parceiras, Marcas, Campanhas, Fila de Trabalho, Campanhas do portal | 6+ usos — é o maior ganho de consolidação do sistema |
| `Pagination` | "Página X de Y" + anterior/próxima | Mesmas telas que usam `Table` | Reaproveita um padrão já idêntico em 5 lugares |
| `Avatar` | Iniciais + nome, a partir de `name` | Header do `AppShell` e do `PortalShell` (hoje duplicado) | Elimina duplicação literal de código |
| `Drawer` | Painel lateral para formulário curto sem navegação própria | Perfil da conta do admin (§8.5) | Só 1 uso previsto — deliberadamente não vira `Modal` genérico para não violar "não usar modais desnecessários" |
| `Upload` (com drag & drop e barra de progresso) | Envio de material (imagem/vídeo) | Aba `Materiais` da Participação — Detalhe (admin) e a mesma função no Portal (upload de material) | Troca o `<input type="file">` cru atual — maior ganho de UX mobile do briefing (achado #8) |
| `Toast` | Feedback transitório de sucesso, sem competir com o layout da página | Qualquer ação de escrita (salvar formulário, aprovar, enviar material) — admin e portal | Unifica o padrão de sucesso hoje resolvido de forma diferente em cada tela (achado #9) |
| `Skeleton` | Placeholder de carregamento com a forma do conteúdo final | Toda tela hoje com "Carregando…" em texto puro | Requisito explícito de `UI_RULES.md` ("carregamento" é estado obrigatório) — hoje cumprido de forma mínima |
| `Timeline` | Linha do tempo de status (ex.: Pagamento PENDENTE→APROVADO→PAGO, Envio PENDENTE→EXPEDIDO→ENTREGUE) | Aba Pagamento e aba Envio da Participação — Detalhe | Não existe hoje; o estado atual é só um `Badge`, sem indicar o caminho percorrido — ajuda tanto admin quanto influenciadora a entender "quanto falta" |
| `Progress Bar` | Progresso de upload de arquivo | Componente `Upload` (acima) | Peça interna do `Upload`, não uma tela/rota |

### 9.4 Deliberadamente fora de escopo (não propor)

- **`Modal`/`Dialog` genérico** — o sistema já resolve confirmação com o
  padrão inline (achado #10); introduzir um modal genérico duplicaria
  padrão sem necessidade comprovada, contra a regra explícita de
  `UI_RULES.md`.
- **`Search`/`Filters` avançados** — nenhuma SPEC pede busca textual;
  os filtros existentes (status via querystring) já cobrem o volume de
  dados descrito no domínio (poucas dezenas de parceiras/campanhas por
  operação). Não inventar.
- **`DatePicker` customizado** — as duas telas com data (`Campanha`,
  `Briefing`) já usam `<input type="date">` nativo, que já é acessível e
  suficiente; um componente customizado seria complexidade sem ganho.
- **`Data Grid`** (com edição inline, ordenação de coluna, etc.) — as
  listas do sistema são de leitura + ação por linha, não de edição em
  massa; `Table` simples já cobre o uso real.

---

## 10. Inventário de ícones

**Achado de auditoria:** o sistema não tem, hoje, nenhuma biblioteca de
ícones nem ícones próprios além da wordmark da marca e de um SVG
decorativo de estrela no `AuthSplitLayout`. O inventário abaixo é,
portanto, uma proposta nova — mas cada ícone está amarrado a uma ação ou
conceito que já existe no código (nenhum ícone "especulativo").

| Ícone | Onde é necessário |
|---|---|
| Upload | Componente `Upload` (envio de material) |
| Imagem | Distinguir material do tipo imagem, aba Materiais |
| Vídeo | Distinguir material do tipo vídeo (Reels/Stories), aba Materiais |
| Documento/Contrato | Ação "Gerar contrato" (§8.3), Perfil da Parceira |
| Pagamento/PIX | Badge e aba de Pagamento |
| Envio/Rastreio | Badge e aba de Envio |
| Campanha | Item de menu "Campanhas", cards do Dashboard |
| Calendário/Prazo | Datas de briefing (prazo, data de aprovação interna) |
| Aprovação (check) | Ação aprovar (Parceira, Material, Pagamento) |
| Reprovação (x) | Ação reprovar (Parceira, Material) |
| Perfil/Conta | Drawer de conta (§8.5), nav "Perfil" do portal |
| Notificação/Alerta | Cartão "perfil incompleto" do Painel do portal, mensagens de erro |
| Editar (lápis) | Ações de edição em Parceira, Marca, Campanha |
| Voltar (seta) | Padrão de "voltar" já usado em várias telas (`navigate(-1)` / `Link to=".."`) |
| Sair/Logout | Botão "sair" do header, já existente em texto — vira ícone+texto |
| Fechar (x) | Fechar o `Drawer` (§8.5) |
| Marca | Item de menu "Marcas", exibição de marca dentro de Campanha |
| Filtro | Seletor de status nas listas (Ativas/Histórico, etc.) |

Recomendação de biblioteca: qualquer set outline consistente (ex.:
Lucide, Phosphor) compatível com o peso visual do Design System
(`Work Sans` 400/600, cantos levemente arredondados) — decisão de
biblioteca específica fica para quem implementar, este briefing só
define o inventário funcional.

---

## 11. Especificação por tela

> Convenção: telas que só reorganizam telas já existentes (fusões da
> Seção 8) descrevem o resultado final, não repetem o que já está listado
> na Seção 5. Estados omitidos = idênticos ao padrão já estabelecido no
> restante do sistema (loading = "Carregando…"/`Skeleton`, erro = texto
> com `role="alert"`, vazio = `EmptyState`).

### 11.1 Login

- **Objetivo:** autenticar administrador ou influenciadora (mesma tela
  para os dois papéis — o roteamento pós-login é automático por `role`).
- **Usuário:** ambos.
- **Prioridade:** Responsivo (é a porta de entrada de ambos os perfis).
- **Funcionalidades:** email + senha; link "esqueci minha senha".
- **Componentes:** `AuthSplitLayout`, `TextField`, `Button`.
- **Estados:** carregando (submit), erro (credenciais inválidas —
  mensagem genérica, não distingue causa), sucesso (redireciona por
  `role`).
- **Navegação:** Origem — Landing, link direto. Destino — `/` (Painel
  admin ou Painel do portal, conforme `role`), ou `/esqueci-senha`.
- **Regras de negócio:** nenhuma regra de bloqueio por tentativas está
  implementada hoje no V3 (RN-17 do PRD é herança do V1 legado, cupom+
  CNPJ — o V3 usa e-mail+senha via Laravel; não presumir que a regra de
  bloqueio de 5 tentativas foi portada sem confirmar no backend).

### 11.2 Esqueci senha / Definir senha

- **Objetivo:** recuperação de senha por e-mail.
- **Usuário:** ambos.
- **Prioridade:** Responsivo.
- **Funcionalidades:** solicitar link (sempre resposta genérica, por
  segurança); definir nova senha a partir do link (token na URL).
- **Componentes:** `AuthSplitLayout`, `TextField`, `Button`.
- **Estados:** sucesso (sempre, na solicitação), erro de token
  (inválido/expirado, com atalho para solicitar novo link), erro de
  validação de senha.
- **Navegação:** Origem — Login, e-mail recebido. Destino — Login (após
  concluir).

### 11.3 Cadastro público de Parceira

- **Objetivo:** auto-cadastro de influenciadora candidata, sem login.
- **Usuário:** candidata (ainda não é usuária do sistema).
- **Prioridade:** **Mobile First** — quem preenche esse formulário é a
  influenciadora, no celular, antes mesmo de ter conta.
- **Funcionalidades:** identificação, documentos (CNPJ opcional, PIX
  obrigatório), endereço com preenchimento automático por CEP, máscaras
  de telefone/CNPJ/CEP em tempo real, consentimento LGPD obrigatório.
- **Componentes:** `AuthSplitLayout`, `TextField`, `Button`.
- **Estados:** carregando (submit), erro de validação por campo (422),
  sucesso (tela de confirmação "cadastro enviado, equipe vai analisar").
- **Navegação:** Origem — Landing. Destino — tela de confirmação (sem
  navegação automática; a candidata aguarda aprovação fora do sistema).
- **Regras de negócio:** nasce sempre `status = Inativa` (RN-01); CEP
  não sobrescreve endereço já digitado manualmente.

### 11.4 Painel (Admin)

- **Objetivo:** ponto de entrada do administrador — visão geral +
  atalhos para o que precisa de atenção.
- **Usuário:** ADMIN, GESTOR_MARCA.
- **Prioridade:** Desktop First, responsivo.
- **Funcionalidades:** card de campanhas ativas (link para lista
  filtrada), card de aprovações pendentes (link para a aba `Materiais
  para aprovar` da Fila de Trabalho, §8.2 — hoje decorativo, passa a
  linkar), card de colaborações e financeiro (a definir se decorativos
  ou linkam para agregações reais — hoje não têm dado real; não
  inventar dado que a API não fornece agregações de valor
  financeiro/colaborações).
- **Componentes:** `Badge` (contagens), cards estáticos.
- **Estados:** vazio (contagem zero, com mensagem própria por card),
  sem permissão (card de aprovações condicionado a `role === ADMIN`,
  já implementado).
- **Navegação:** Origem — Login. Destino — Parceiras, Campanhas, Fila
  de Trabalho (via cards).

### 11.5 Parceiras — Lista

- **Objetivo:** listar e filtrar influenciadoras (ativas / novas
  inscrições aguardando decisão).
- **Usuário:** ADMIN, GESTOR_MARCA (leitura); criação restrita a ADMIN.
- **Prioridade:** Responsivo, desktop prioritário.
- **Funcionalidades:** filtro por status (tabs "todas"/"novas
  inscrições"), paginação, atalho "nova parceira".
- **Componentes:** `Table`, `Pagination`, `Badge` (após consolidação de
  §7 item 1), `EmptyState`, `LinkButton`.
- **Navegação:** Origem — Painel, menu. Destino — Parceiras — Perfil
  (ver linha), Parceiras — Formulário (nova, só ADMIN).
- **Regras de negócio:** ação "nova parceira" só visível para ADMIN.

### 11.6 Parceiras — Formulário (criar/editar)

- **Objetivo:** cadastro/edição administrativa dos dados de uma
  Parceira.
- **Usuário:** ADMIN.
- **Prioridade:** Responsivo, desktop prioritário.
- **Funcionalidades:** identificação, documentos, dados contratuais,
  endereço (CEP automático), consentimento.
- **Componentes:** `TextField`, `Button`.
- **Navegação:** Origem — Parceiras — Lista, Parceiras — Perfil.
  Destino (ao salvar) — Parceiras — Perfil.
- **Regras de negócio:** mesmas do cadastro público (§11.3), sem o
  contexto de "candidata anônima".

### 11.7 Parceiras — Perfil

- **Objetivo:** decisão de aprovação/reprovação de inscrição, consulta
  de dados, histórico de alterações, geração de contrato.
- **Usuário:** ADMIN (decisão, histórico, edição); GESTOR_MARCA
  (consulta, sem decisão nem histórico).
- **Prioridade:** Responsivo, desktop prioritário.
- **Funcionalidades:** aprovar (se `Inativa`), reprovar com motivo (se
  `Inativa` e ainda não reprovada), reenviar convite (se `Ativa`),
  editar (ADMIN), histórico de alterações (ADMIN), **novo:** botão
  "Gerar contrato" (§8.3, condicionado a `status = Ativa`).
- **Componentes:** `Badge` (após §7.1), `Button`, `TextareaField`
  (motivo de reprovação, inline — não modal, achado #10).
- **Estados:** sem permissão (histórico e edição escondidos para não-
  ADMIN, já implementado).
- **Navegação:** Origem — Parceiras — Lista. Destino — Parceiras —
  Formulário (editar, ADMIN).
- **Regras de negócio:** `podeAprovar`/`podeReprovar` só quando
  `status = Inativa`; não é possível reprovar duas vezes.

### 11.8 Marcas — Lista

- **Objetivo:** listar marcas-clientes.
- **Usuário:** ADMIN (leitura + escrita); demais papéis, leitura via
  Campanha (não têm acesso direto — `MarcaPolicy.viewAny` é `false`
  para não-ADMIN).
- **Prioridade:** Desktop First, responsivo.
- **Componentes:** `Table`, `Pagination`, `Badge` (novo uso, §7.2),
  `LinkButton`.
- **Navegação:** Destino — Marcas — Formulário (nova/editar).

### 11.9 Marcas — Formulário (criar/editar)

- **Objetivo:** cadastro/edição de marca-cliente.
- **Usuário:** ADMIN.
- **Prioridade:** Desktop First.
- **Funcionalidades:** identificação (nome, CNPJ), contato.
- **Componentes:** `TextField`, `Button`.
- **Navegação:** ao salvar, permanece no próprio formulário (modo
  edição) — não existe tela de perfil de marca (§8.7, decisão
  deliberada de não criar).

### 11.10 Campanhas — Lista

- **Objetivo:** listar campanhas, com filtro de status incluindo o
  atalho "Histórico" (§8.4).
- **Usuário:** ADMIN, GESTOR_MARCA (leitura); INFLUENCIADORA não acessa
  esta tela (usa a versão do portal, §11.16).
- **Prioridade:** Responsivo, desktop prioritário.
- **Componentes:** `Table`, `Pagination`, `Badge`, `EmptyState`,
  `LinkButton`.
- **Navegação:** Destino — Campanhas — Detalhe (ver), Campanhas —
  Formulário (nova, ADMIN).

### 11.11 Campanhas — Formulário (criar/editar)

- **Objetivo:** cadastro/edição de campanha (Colaboração Mensal).
- **Usuário:** ADMIN.
- **Prioridade:** Desktop First.
- **Funcionalidades:** marca (select), nome, descrição, datas de
  início/fim, status (só em edição).
- **Componentes:** `SelectField`, `TextField`, `Button`.
- **Navegação:** ao salvar, Campanhas — Detalhe.

### 11.12 Campanhas — Detalhe

- **Objetivo:** hub da campanha — dados gerais + gestão de participações
  de parceiras.
- **Usuário:** ADMIN (gestão completa); GESTOR_MARCA (consulta).
- **Prioridade:** Desktop First, responsivo.
- **Funcionalidades:** vincular parceira (ADMIN), tabela de
  participações com ações (congelar, cancelar — ADMIN) e drill-down para
  cada aba da Participação — Detalhe (§8.1, todos os papéis com acesso à
  campanha).
- **Componentes:** `Badge`, `TextField`, `SelectField`, `Button`/
  `LinkButton`, `Table`, `EmptyState`.
- **Navegação:** Origem — Campanhas — Lista. Destino — Parceiras —
  Perfil (nome da parceira), Participação — Detalhe (por linha),
  Campanhas — Formulário (editar).
- **Regras de negócio:** só parceiras `Ativa` e ainda não vinculadas
  aparecem para vincular; "congelar" trava valor/quantidades
  (irreversível pela UI); "cancelar" só se `status = ATIVA`.

### 11.13 Participação — Detalhe (fusão, §8.1)

- **Objetivo:** gerenciar as 4 facetas de uma Participação em um só
  lugar — briefing, materiais, pagamento, envio.
- **Usuário:** ADMIN (escrita nas 4 abas); GESTOR_MARCA/qualquer usuário
  com acesso à campanha (leitura).
- **Prioridade:** Responsivo, desktop prioritário.
- **Funcionalidades (por aba):**
  - **Briefing:** criar/editar por tipo de entregável contratado
    (`FEED`, `REELS`, `STORIES`); data de aprovação interna calculada
    automaticamente (RN-04); tipo imutável após criado.
  - **Materiais:** listar enviados, aprovar/reprovar com motivo
    (`PENDENTE` apenas), novo upload (bloqueado se não houver briefing
    publicado para o tipo, ou se a cota contratada já foi atingida).
  - **Pagamento:** criar (se ainda não existe), avançar status
    (`PENDENTE→APROVADO→PAGO`), anexar comprovante.
  - **Envio:** criar (código de rastreio opcional), avançar status
    (`PENDENTE→EXPEDIDO→ENTREGUE`).
- **Componentes:** `Tabs`, `Badge`, `TextField`, `SelectField`,
  `TextareaField`, `Button`, `Upload` (aba Materiais), `Timeline`
  (abas Pagamento/Envio).
- **Estados:** cada aba mantém seus próprios estados de
  carregamento/erro/vazio (upload sem briefing publicado = `EmptyState`
  já existente, mantido).
- **Navegação:** Origem — Campanhas — Detalhe (linha da participação),
  Fila de Trabalho (§8.2). Destino — volta para a origem.
- **Regras de negócio:** herdadas 1:1 das 4 telas atuais — nenhuma
  regra muda, só a navegação entre elas.

### 11.14 Fila de Trabalho (fusão, §8.2)

- **Objetivo:** visão consolidada do que precisa de ação do
  administrador, cruzando campanhas ativas.
- **Usuário:** ADMIN.
- **Prioridade:** Desktop First, responsivo.
- **Funcionalidades:** 3 abas — Envios pendentes, Materiais para
  aprovar, Pagamentos a liberar — cada uma lista + link para a aba
  correspondente de Participação — Detalhe.
- **Componentes:** `Tabs`, `Table`, `Pagination`, `Badge`, `EmptyState`.
- **Navegação:** Origem — Painel (card "Aprovações"), menu. Destino —
  Participação — Detalhe.
- **Regras de negócio:** cada aba usa o filtro de status "aguardando
  ação" já definido no domínio de cada entidade (não é um status novo).

### 11.15 Painel (Portal / Influenciadora)

- **Objetivo:** ponto de entrada da influenciadora — saudação, status do
  perfil, participações ativas.
- **Usuário:** INFLUENCIADORA.
- **Prioridade:** **Mobile First**.
- **Funcionalidades:** alerta de perfil incompleto (com atalho para
  Perfil), cards de participações ativas com resumo de entregáveis e
  status de pagamento.
- **Componentes:** `Badge`.
- **Navegação:** Destino — Perfil (se incompleto), Participação —
  Detalhe (por card).
- **Regras de negócio:** perfil considerado incompleto se faltar CEP,
  rua, cidade ou UF.

### 11.16 Campanhas (Portal, fusão §8.6)

- **Objetivo:** listar campanhas da influenciadora, ativas e
  encerradas, em uma tela com seletor.
- **Usuário:** INFLUENCIADORA.
- **Prioridade:** **Mobile First**.
- **Funcionalidades:** seletor Ativas/Histórico; lista com status de
  pagamento por linha (só na visão Histórico, mantendo o comportamento
  atual do Histórico).
- **Componentes:** `Badge`, `EmptyState`, seletor de 2 estados
  (variação leve de `Tabs`, ou controle dedicado dado o espaço mobile).
- **Navegação:** Destino — Participação — Detalhe.
- **Regras de negócio:** só campanhas com participação própria (via
  `CampanhaPolicy`).

### 11.17 Participação — Detalhe (Portal)

- **Objetivo:** ver briefing por entregável contratado, enviar material,
  acompanhar pagamento. **Nenhuma mudança proposta** — já é o modelo de
  simplicidade replicado em §8.1.
- **Usuário:** INFLUENCIADORA (dona da participação).
- **Prioridade:** **Mobile First**.
- **Funcionalidades:** blocos de briefing só para tipos contratados;
  upload bloqueado até o briefing daquele tipo ser publicado e até a
  cota contratada ser atingida; pagamento só-leitura.
- **Componentes:** `Badge`, `Upload` (substituindo o `<input>` cru
  atual — único ganho proposto para esta tela, achado #8).
- **Estados:** 403/404 → volta ao Painel silenciosamente (comportamento
  atual — considerar, em implementação futura, substituir por uma
  mensagem curta antes do redirecionamento, para não parecer uma falha
  sem explicação; não obrigatório neste briefing).
- **Navegação:** Origem — Painel, Campanhas. Destino — automático ao
  Painel em caso de acesso negado.

### 11.18 Perfil (Portal)

- **Objetivo:** dados pessoais/contratuais e medidas da influenciadora.
- **Usuário:** INFLUENCIADORA (dona do perfil).
- **Prioridade:** **Mobile First**.
- **Funcionalidades:** dois formulários independentes (dados + medidas),
  CEP automático, consentimento obrigatório a cada edição de dados.
- **Componentes:** `TextField`, `SelectField`, `Button`.
- **Regras de negócio:** campos contratuais geridos pela equipe
  (`razao_social`, canais/prazo de uso de imagem) não são editáveis
  aqui, mas preservados no payload; medidas são sempre um novo registro
  (histórico append-only), nunca edição do existente.

---

## 12. Resultado final

### 12.1 Quantidade de telas

| | Hoje (auditado) | Proposto |
|---|---|---|
| Público/autenticação | 5 | 5 (sem mudança) |
| Administração — reais | 14 | 10 |
| Administração — placeholder | 3 | 0 (viram ação/filtro/drawer, §8.3–8.5) |
| Administração — planejadas e nunca construídas | 5 (dormentes no menu) | 0 (absorvidas pela Fila de Trabalho, §8.2) |
| Portal | 5 | 4 |
| **Total de rotas** | **27** (+5 dormentes = risco de 32+) | **19** |

A redução real não é "27 → 19" isoladamente — é **27 hoje, com risco
concreto de crescer para ~32+ se os 5 itens de menu dormentes e os 3
placeholders forem implementados como telas 1-para-1** (o caminho que o
próprio código já sinaliza estar seguindo) **, contra 19 no cenário
proposto.** A maior parte do ganho vem de nunca chegar a construir 8
telas que o sistema já estava prestes a precisar.

### 12.2 Justificativa por fusão (resumo)

| Fusão | Telas absorvidas | Onde vai a funcionalidade |
|---|---|---|
| Participação — Detalhe (§8.1) | Briefing, Materiais, Pagamento, Envio (admin) | 1 tela, 4 abas |
| Fila de Trabalho (§8.2) | Logística + Colaborações/Briefings/Materiais/Aprovações/Pagamentos (dormentes) | 1 tela, 3 abas |
| Ação "Gerar documento" (§8.3) | Documentos (placeholder) | Botão em Parceira — Perfil e Participação — Detalhe |
| Filtro de status (§8.4) | Histórico admin (placeholder) | Filtro em Campanhas — Lista e na Fila de Trabalho |
| Drawer de conta (§8.5) | Perfil admin (placeholder) | Drawer a partir do header |
| Campanhas com seletor (§8.6) | Histórico do portal | Seletor Ativas/Histórico dentro de Campanhas (portal) |

### 12.3 Componentes compartilhados (contagem)

- **9 já existentes, mantidos sem mudança:** `Button`/`LinkButton`,
  `TextField`, `SelectField`, `TextareaField`, `Badge`, `EmptyState`,
  `AppShell`, `PortalShell`, `AuthSplitLayout`.
- **1 já existente, a consolidar:** `StatusBadge` → absorvido por `Badge`.
- **10 novos, cada um com pelo menos 2 usos comprovados na arquitetura
  proposta:** `Tabs`, `Table`, `Pagination`, `Avatar`, `Drawer`,
  `Upload`, `Toast`, `Skeleton`, `Timeline`, `Progress Bar`.
- **Deliberadamente não propostos:** `Modal` genérico, `Search`/
  `Filters` avançados, `DatePicker` customizado, `Data Grid` (§9.4).

### 12.4 Oportunidades de simplificação (resumo, ver §7 para detalhe)

1. `StatusBadge` redundante com `Badge` — consolidar.
2. `MarcasListPage` sem `Badge` — inconsistência a corrigir.
3. Tabela e paginação reimplementadas 5 vezes — extrair `Table`/
   `Pagination`.
4. 4 telas para 1 entidade (Participação) — fundir com `Tabs`.
5. 5 conceitos de menu sem tela — absorver na Fila de Trabalho.
6. `getInitials()` duplicado — extrair `Avatar`.
7. Acoplamento CSS Envio↔Pagamento — resolvido pela fusão #4.
8. Upload sem drag & drop nem progresso — maior risco de UX mobile do
   sistema, resolvido pelo componente `Upload`.
9. Sem padrão único de feedback de sucesso — resolvido por `Toast`.
10. Ação destrutiva sem confirmação em `CampanhaDetailPage` — replicar o
    padrão inline já usado em "reprovar", sem introduzir `Modal`.

### 12.5 Funcionalidades existentes que podem ser unificadas

- Briefing + Materiais + Pagamento + Envio (admin) → Participação —
  Detalhe com abas.
- Logística + Aprovações + Pagamentos (conceitos de menu) → Fila de
  Trabalho com abas.
- Campanhas + Histórico (portal) → Campanhas com seletor.
- Geração de documentos → ação contextual, não tela.
- Histórico (admin) → filtro de status, não tela.
- Perfil da conta (admin) → drawer, não tela.

---

## 13. Nota final sobre o uso deste documento

Este documento é a especificação de referência para qualquer ferramenta
de geração de interface. Ao usá-lo como entrada:

- A Seção 11 (especificação por tela) é a fonte primária — cada bloco já
  traz objetivo, usuário, prioridade de dispositivo, funcionalidades,
  componentes e navegação no formato necessário para gerar uma tela.
- A Seção 9 é o inventário de componentes a serem gerados/reaproveitados
  de forma consistente entre todas as telas.
- A Seção 4 (Design System) define os tokens visuais que qualquer tela
  gerada deve respeitar.
- Nenhuma tela fora da Seção 11 deve ser gerada sem antes atualizar este
  documento e obter aprovação do responsável do projeto — inclusive
  qualquer uma das 8 telas que a Seção 8 propõe deliberadamente **não**
  construir.
