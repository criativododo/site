# Dashboard editorial do Portal DODÔ — Sprint 2

**Status:** aprovado para plano de implementação.
**Sprint:** Sprint 2 (Dashboard), sobre a fundação da Sprint 1 (Shell — `ed4801d`,
`ART_DIRECTION_GUIDE.md`).

## Objetivo

Transformar `portal-frontend/src/pages/AdminDashboard.tsx` de um painel administrativo
tradicional (KPIs em grade) em uma página editorial de operação: a tela deve responder,
na ordem em que a pessoa lê, "o que precisa de atenção agora", "o que vem a seguir" e "o
que pode esperar" — sem depender do logotipo para ser reconhecível como DODÔ.

Fonte soberana: `ART_DIRECTION_GUIDE.md` (raiz do repo). Nenhuma decisão visual deste
documento pode contradizê-lo; onde há dúvida, o guia decide.

## Auditoria crítica do PR #2 (`feat/admin-dashboard-v2`) — superseded

PR #2 migrou o Dashboard para `shadcn/Card` em grade simétrica (`grid-cols-4`/`grid-cols-5`).
Foi construído a partir de `main` (33df955), **antes** do `ART_DIRECTION_GUIDE.md` e do Shell
da Sprint 1 existirem — pertence a uma fundação anterior e é descartado como direção visual.

**Descartado** (contradiz o guia vigente):
- Componente `Card` do shadcn — caixa com borda ao redor de cada indicador. Contradiz
  "sublinhar, não emoldurar" (§1) e o anti-princípio "bordas desenhando toda a página" (§2).
- Grade simétrica (`grid grid-cols-2 md:grid-cols-4/5`) de itens do mesmo tamanho. Contradiz
  o anti-princípio "grades simétricas de cards do mesmo tamanho, tratando informações
  desiguais como iguais" (§2).
- Infraestrutura shadcn/Tailwind trazida junto (`components.json`, `tailwindcss`,
  `@base-ui/react` etc.) — não adotada pela Sprint 1, que segue CSS + tokens próprios
  (`portal-frontend/src/styles/tokens.css`, `index.css`). Não há decisão (ADR) trazendo
  shadcn para o Portal; não introduzir essa dependência via este trabalho.

**Aproveitado** (válido independente de framework visual):
- Padrão de navegação: cada item de "requer sua ação" é um link real para a lista filtrada
  correspondente (`/admin/entregas`, `/admin`), não só um número estático.
- Padrão de acessibilidade: `aria-label` descritivo no link (`"{label}: {valor}. ver
  lista."`), ícone decorativo com `aria-hidden="true"`.
- Correção já mesclada: `.is-admin-wide` no lugar de `style={{ maxWidth: 920 }}` inline —
  mantida (já é a classe real de produção, ortogonal à decisão de Card/grade).
- Contrato de dados de `IndicadoresAdministrativos` — inalterado, é dado de domínio, não
  decisão visual.

## Lacuna de dado identificada e decisão de escopo

Backend investigado (`portal-backend/src/modules/dashboard/dashboard.service.ts` e módulos
relacionados): não existe audit log persistente com autor/diff — só
`middleware/auditoria.ts`, in-memory, perdido a cada restart, sem registrar "de X para Y".
As entidades têm apenas `dataAtualizacao` (ISO 8601), sem ator nem estado anterior.

**Decisão do responsável do projeto (2026-08-02):** a Sprint 2 não infere uma seção "o que
mudou recentemente" a partir de `dataAtualizacao` (seria uma narrativa aparentemente rica
mas semanticamente incorreta). A seção fica **fora de escopo**, como decisão consciente de
produto — não como limitação de UX a esconder. Poderá ser incorporada no futuro se um audit
log persistente (quem, o quê, quando, de/para) for implementado, sob ADR próprio.

## Estrutura narrativa aprovada

Três blocos, ordem fixa, peso visual decrescente (Abordagem A — coluna única; ver
"Abordagens consideradas" abaixo):

1. **precisa de atenção agora** — dominante, único bloco "quente" da tela.
2. **o que vem a seguir** — peso médio, densidade de leitura rápida.
3. **o que pode esperar** — mais quieto; **confirmação de normalidade, não inventário de
   métricas**. Existe para reduzir ansiedade operacional, não para apresentar KPIs em forma
   de texto. Números aparecem só como apoio à frase, nunca como protagonistas — a frase de
   normalidade vem primeiro, os números confirmam, nunca abrem o bloco.

### Abordagens consideradas

- **A — coluna única, peso decrescente (escolhida).** Os três blocos empilham verticalmente,
  cada um mais quieto que o anterior. Reaproveita primitivos de lista já existentes
  (`.pendencias-list`, `.portal-list-row`). Alinhado a "sequência fixa de leitura" e à regra
  de que uma página DODÔ é lida do início ao fim sem esforço de retomada.
- B — parágrafo editorial + listas de apoio: descartada, prosa mistura com listas de
  trabalho e piora escaneabilidade (o guia exige listas densas e rápidas de escanear).
- C — duas colunas (ação à esquerda, resto à direita): descartada, qualquer split em colunas
  paralelas tende a reintroduzir a leitura de "grade"/dashboard que o guia rejeita.

## Wireframe estrutural (sem refinamento visual)

```
administração                                    ← eyebrow (mantido)
painel administrativo                            ← título (mantido)
onde você precisa agir agora, num só lugar.       ← frase de abertura (mantida, é o
                                                     exemplo canônico do próprio guia, §5)

────────────────────────────────────────────────
BLOCO 1 · precisa de atenção agora
requer sua ação (N)  /  "nada pendente de ação agora"

  materiais atrasados (3) — [frase justificando o cherry]   → /admin/entregas
  aprovações aguardando (5)                                  → /admin/entregas
  cadastros para moderar (2)                                 → /admin
  solicitações lgpd pendentes (1)                            → /admin

  lista vertical, 1 linha por item, sublinhado (não caixa) no hover/foco,
  cherry só no item genuinamente atrasado, sempre com frase ao lado (§1 "vermelho
  justificado"). Ordem por urgência real, não alfabética.

────────────────────────────────────────────────  ← traço fino (.portal-section-divider)
BLOCO 2 · o que vem a seguir
próximos prazos

  entrega de [parceira] — vence em 2 dias
  postagem de [briefing] — vence em 5 dias
  ...

  lista compacta, ordenada por proximidade de data (Entrega.dataEntrega,
  BlocoBriefing.dataPostagem/dataAprovacaoInterna). Sem decoração por item.

  (sem traço aqui — transição para o Bloco 3 é só espaço/peso, ver abaixo)
BLOCO 3 · o que pode esperar
  frase de normalidade primeiro (ex.: "o restante está dentro do esperado.")
  números citados dentro da frase, como confirmação — nunca como lista de itens
  nem como abertura do bloco. Não enumerar todas as 5 métricas secundárias como
  inventário; citar só o que sustenta a frase de normalidade.
```

Há **uma única divisória** na página inteira (traço fino entre Bloco 1 e Bloco 2) — é a
única quebra "dura", entre a zona de decisão e o resto. Uma segunda divisória entre Bloco 2
e Bloco 3 violaria o anti-princípio "excesso de linhas divisórias separando blocos que já
estão separados pelo espaço" (§2); essa transição é só espaço + queda de peso tipográfico.

## Ritmo, densidade e estados

Três "temperaturas" em sequência só decrescente — quente (Bloco 1) → morna (Bloco 2) → fria
(Bloco 3) — nunca sobe de novo. É o que sustenta a leitura "do início ao fim sem retomada"
(§4): ao entrar no Bloco 3, a pessoa já sabe que viu tudo que precisava de decisão.

| Bloco | Densidade | Peso tipográfico | Papel |
|---|---|---|---|
| 1 — atenção agora | linhas compactas (lista de trabalho), mas o bloco como unidade tem respiro generoso — é também zona de decisão | mais alto do corpo da página; cherry só no item genuinamente atrasado, com frase justificando | ler rápido *e* decidir |
| 2 — vem a seguir | a mais densa da página, sem respiro extra | peso normal do corpo, rótulo em tom quieto (mesmo tratamento de `.pendencias-summary.is-quiet` já usado hoje) | ler rápido, sem decisão |
| 3 — pode esperar | a mais generosa da página — folga comunica "nada aqui exige seu tempo" | o mais leve da página; prosa corrida, não lista; números citados dentro da frase, nunca abrindo-a nem em destaque | confirmar normalidade |

**Estados vazio/carregado:**

| Bloco | Vazio | Carregando/erro |
|---|---|---|
| 1 | "nada pendente de ação agora" — mesma posição/peso do resumo, tom de constatação, não celebração | — |
| 2 | "nada previsto para os próximos dias." — frase única, sem lista | — |
| 3 | sempre tem frase (é resumo, não lista); no limite de zero dados em todo o sistema, a frase se ajusta para descrever esse estado sem inventar número | — |

Carregamento e erro continuam **únicos para a página inteira** (um só fetch, um só estado
`carregando`/`erro`), reaproveitando o padrão já existente
(`<p className="portal-page-feedback">carregando...</p>`) — sem skeleton por bloco: um
skeleton simularia conteúdo que ainda não existe, o que o próprio guia rejeita como
interface a serviço de si mesma, não do conteúdo (§1 "interface a serviço do conteúdo").

## Contrato de dados

| Bloco | Fonte | Estado |
|---|---|---|
| 1 — atenção agora | `GET /api/admin/dashboard` (`entregas.atrasadas`, `entregas.emRevisao`, `moderacao.contasPendentes`, `lgpd.solicitacoesExclusaoPendentes`) | já existe, sem mudança |
| 2 — vem a seguir | lista ordenada por `Entrega.dataEntrega` + `BlocoBriefing.dataPostagem`/`dataAprovacaoInterna` | **não existe** — evolução pontual do endpoint (novo campo `proximosPrazos: []`, agregação simples sobre repositórios já consultados, sem entidade nova nem ADR) |
| 3 — pode esperar | `parceiras`, `entregas.aguardandoMaterial`, `financeiro.pendentes/valorPendente` | já existe, sem mudança |

A evolução do Bloco 2 é aditiva ao endpoint existente (`dashboard.service.ts`), não uma
mudança de arquitetura — mesmo padrão de "5 chamadas em paralelo, `filter`/`reduce` em
memória" já usado hoje, com mais um agregado.

## Fora de escopo desta sprint

- Seção "o que mudou recentemente" (ver decisão acima).
- Qualquer adoção de shadcn/Tailwind no Portal.
- Migração de outras páginas além do Dashboard.
- Audit log persistente.

## Critérios de aprovação

A implementação deve passar a checklist do `ART_DIRECTION_GUIDE.md` §6 integralmente,
com atenção especial a: ausência de grade simétrica, ausência de elemento emoldurado por
caixa, vermelho sempre justificado por frase, ordem dos blocos fixa entre visitas, e "esta
tela poderia ser confundida com a de outro produto se o logotipo fosse removido?" → não.
