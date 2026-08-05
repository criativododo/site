# START_HERE_NEXT_SESSION.md

> **Legado desde 30/07/2026:** este é um snapshot histórico. Para o estado operacional
> vigente, execute `/inicio <objetivo>` e use o repositório privado `criativododo-memory`.

> Este é o documento mais importante do handoff. Leia como se você fosse um engenheiro que
> nunca participou deste projeto. Ele explica o estado real do repositório, o que é
> documentação vs. o que é código, o que já foi decidido, o que ainda precisa de decisão, em
> que ordem construir o Portal, e quais riscos evitar.

> **ATUALIZAÇÃO 2026-07-27 — leia isto antes do "Resumo de 60 segundos" abaixo.** As seções
> originais deste documento (escritas em 2026-07-26, logo após o EPIC 0) descreviam um estado
> em que **nenhum código de Portal existia ainda**. Isso não é mais verdade: `portal-backend/`
> e `portal-frontend/` existem, funcionam, e cobrem tanto o Portal da Parceira (EPIC 1-4)
> quanto uma fase inteira de Backoffice Administrativo (Parceiras, Entregas, Aprovação de
> Entregas, Briefings, Obrigação Financeira, Dashboard) não prevista neste documento original.
> Estado consolidado e atualizado: `docs/handoff/2026-07-27_backoffice-administrativo-
> consolidacao.md`. As seções abaixo foram corrigidas nos pontos que ficaram diretamente
> falsos (resumo, §1, §3, §6, §7, §11); o restante (racional das decisões de EPIC 0, riscos,
> mapa de fontes de verdade) continua válido e não foi tocado.

> **ATUALIZAÇÃO 2026-07-29.** Fora do backlog acima (EPIC 0-5 + Backoffice), uma segunda
> trilha de evolução estrutural rodou sob `criativododo-interno/
> PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md` (fora do repositório git): Fase 1 (fechamentos
> de baixo risco), Fase 2 (persistência PostgreSQL real, ADR-015) e **Fase 3 — Colaboração
> Mensal como agregado formal (ADR-016)**, todas concluídas e homologadas em navegador real.
> Isso torna falsa a afirmação abaixo, no "Resumo de 60 segundos", de que "Colaboração
> Mensal como agregado formal" só existe como documentação — corrigido no próprio bullet.
> Estado atual detalhado: `docs/handoff/PROJECT_STATUS.md` (sempre a fonte mais recente do
> estado físico do repositório, ver §9 do mapa de fontes de verdade). Próxima fase
> recomendada: Fase 4 (Armazenamento + Workspace Provisioning), aguardando aprovação.

## Resumo de 60 segundos (se só puder ler isto)

- **Existe em código:** a Landing Page (`app/`) **e** o Portal completo — `portal-backend/`
  (Node.js/TypeScript/Express) e `portal-frontend/` (React/Vite/TypeScript). Cobre tanto o
  Portal da Parceira (login, pendências, financeiro, perfil, LGPD) quanto o Backoffice
  Administrativo (Parceiras, Entregas, Aprovação de Entregas, Briefings, Obrigação Financeira,
  Dashboard). Ver `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md` para o
  detalhamento módulo a módulo.
- **Existe só como documentação:** o restante do domínio ainda não coberto pelo código acima
  (ex.: geração automática de Entregas/Briefings/Obrigações a partir da Condição Comercial no
  momento da compilação de uma competência, publicação de conteúdo), especificado em
  `knowledge/` (SPECs, ADRs) descrevendo um sistema que rodava em outro repositório, já
  removido, mais as evoluções estruturais ainda não construídas aqui. **"Colaboração Mensal"
  como agregado formal já existe em código desde 29/07/2026** (Fase 3 do Plano Mestre,
  ADR-016) — ver banner de atualização acima.
- **Fonte de verdade visual:** a Landing (`app/`) — não o Design System HTML.
- **Leia primeiro, nesta ordem:** este documento → `docs/handoff/2026-07-27_backoffice-
  administrativo-consolidacao.md` (estado atual do Portal/Backoffice) →
  `knowledge/PROJECT_SOURCE_OF_TRUTH.md` → `PORTAL_BRIEFING.md` → `PORTAL_ARQUITETURA.md` →
  `PORTAL_BACKLOG.md`.
- **ADRs a respeitar:** `knowledge/ARCHITECTURAL_DECISIONS.md` (ADR-001 a ADR-010, série
  desta sessão) — sobrepõem, para fins visuais e de método, o que a série antiga
  (`knowledge/Arquitetura/ADR-*.md`) documentava para um sistema que não existe mais aqui.
- **EPIC 0 concluído em 2026-07-26; EPIC 1-4 do Portal e a fase de Backoffice Administrativo
  concluídos desde então** (ver §6/§7 abaixo e o documento de consolidação linkado acima).

---

## 1. A primeira coisa que você precisa entender

Este repositório (`/Users/danielperrut/criativododo`) tem hoje, fisicamente:

- **`app/`** — a Landing Page do Criativo DODÔ, React 19 + Vite + GSAP + TypeScript.
  **Funciona e está implementada.**
- **`portal-backend/`** — API do Portal, Node.js + TypeScript + Express 5. **Funciona e está
  implementada**: autenticação Google OIDC, Portal da Parceira (pendências, financeiro,
  perfil, LGPD) e Backoffice Administrativo completo (Parceiras, Entregas, Aprovação de
  Entregas, Briefings, Obrigação Financeira, Dashboard). Persistência 100% em memória
  (decisão deliberada, não uma lacuna — ver `docs/handoff/2026-07-27_backoffice-
  administrativo-consolidacao.md`).
- **`portal-frontend/`** — frontend do Portal, React 19 + Vite + TypeScript, reaproveitando a
  identidade visual de `app/`. **Funciona e está implementado**, cobrindo as mesmas telas do
  backend acima.
- **`design-system/`** — um Design System em HTML, gerado a partir do código de `app/` numa
  sessão anterior. É documentação auxiliar, **não é a referência principal**.
- **`knowledge/`** — uma documentação de produto e arquitetura extensa e madura sobre um
  sistema de gestão de parcerias com influenciadoras ("TEAR"/"ELÃ | influência", hoje
  "DODÔ"), incluindo dezenas de SPECs, ADRs, e um Portal da Influenciadora totalmente
  especificado. Continua sendo a fonte de regras de negócio (ver §4 abaixo) — o que mudou é
  que parte relevante dela **já tem código real correspondente** em `portal-backend/`/
  `portal-frontend/`, não mais "sistema ausente".
- **Nenhuma linha de código PHP/Laravel/Apps Script existe fisicamente aqui** — essa stack
  ("Sistema B") pertenceu a uma fase anterior do projeto, código nunca chegou a produção e não
  está neste repositório. `knowledge/Arquitetura/ADR-*.md` documenta essas decisões como
  referência histórica de raciocínio, não como código herdável.

**Erro mais fácil de cometer nesta próxima sessão:** ler uma SPEC que diz "✅ Implementada,
599/599 testes verdes" e presumir que existe código para reaproveitar. Não existe. O valor
dessas SPECs está nas **regras de negócio e no modelo de domínio**, não em código herdável.

## 2. Fonte de verdade visual — decisão que você deve respeitar sem questionar

**A Landing Page implementada em `app/` é, hoje, a implementação oficial da identidade
visual do Criativo DODÔ.** Toda evolução visual do Portal — cores, tipografia, composição,
hierarquia, espaçamentos, componentes, animações, responsividade, aplicação de marca — deve
ser extraída do código real de `app/src`, não do `design-system/index.html` isolado.

Esta é uma instrução explícita do responsável do projeto, registrada em 2026-07-26. Ela
**substitui**, para fins práticos deste repositório, o que `knowledge/Arquitetura/ADR-019-
design-system-dodo-como-ssot-visual.md` declara sobre um "Manual de Design DODÔ" em
`docs/design/manual/` — esse caminho não existe fisicamente aqui.

Se houver qualquer divergência entre o `design-system/index.html`/`DESIGN.md` e o código
real de `app/src`, **a Landing prevalece**. O Design System HTML pode ser completamente
refeito no futuro — não trate nada nele como imutável.

**Ação prática:** antes de estilizar qualquer tela nova do Portal, abra `app/src` e leia os
componentes, o CSS e as animações GSAP diretamente.

## 3. O que já existe em código

- `app/` — Landing Page completa.
- `portal-backend/` + `portal-frontend/` — Portal da Parceira e Backoffice Administrativo
  completos (autenticação Google OIDC real, upload de material, CRUD administrativo de
  Parceiras/Entregas/Briefings/Obrigação Financeira, Dashboard agregado). Ver
  `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md` para o detalhamento de
  quais fluxos estão completos e quais ainda não (ex.: publicação de conteúdo, "Colaboração
  Mensal" como agregado formal).
- `design-system/index.html` + `DESIGN.md` — documentação visual auxiliar (derivada de
  `app/`, não a fonte principal — ver §2).
- Sem banco de dados real (persistência em memória, decisão deliberada) e sem CI/CD.

## 4. O que existe apenas como documentação (tudo em `knowledge/`)

- Modelo de domínio completo (`CONTRATO_SOBERANO.md`) — linguagem ubíqua oficial.
- ~35 SPECs numeradas (`knowledge/Produto/SPEC-*.md`), incluindo as 5 do Portal:
  SPEC-025 (Acesso), SPEC-027 (Conteúdo), SPEC-030 (Financeiro/Histórico), SPEC-032
  (Perfil), SPEC-035 (Identidade e Acesso).
- 8 ADRs (`knowledge/Arquitetura/ADR-*.md`) — decisões arquiteturais de um sistema Laravel
  ("Sistema B") que também não existe mais fisicamente.
- Um segundo vocabulário de domínio (Sistema B: `Campanha`/`ParticipacaoNaCampanha`) nunca
  reconciliado com o Contrato Soberano.
- Documentação de infraestrutura Locaweb (`knowledge/Deploy/`) — nunca chegou a servir uma
  aplicação real em produção.

**Trate tudo isso como especificação de requisitos e histórico de decisões — não como
descrição do estado físico atual.**

## 5. Decisões já tomadas (não reabrir sem motivo forte)

Duas séries de ADR coexistem neste projeto — não confundir:

- **`knowledge/Arquitetura/ADR-002/012/015/016/017/018/019/020.md`** — decisões do "Sistema
  B" (Laravel), código ausente deste repositório. Reaproveitáveis como referência de
  raciocínio, não como código.
- **`knowledge/ARCHITECTURAL_DECISIONS.md` (ADR-001 a ADR-004)** — decisões de governança e
  método deste projeto como um todo, registradas em 2026-07-26. Esta série é a que rege a
  identidade visual e a disciplina de "não inventar requisito" — tem precedência sobre a
  série antiga nesses dois assuntos.

| Decisão | Onde |
|---|---|
| **Landing Page (`app/`) é a fonte de verdade visual** | `knowledge/ARCHITECTURAL_DECISIONS.md` ADR-001 |
| Documentação descreve um Portal completo; só a Landing existe em código | `knowledge/ARCHITECTURAL_DECISIONS.md` ADR-002 |
| Nenhum requisito deve ser inventado onde a documentação for omissa/contraditória | `knowledge/ARCHITECTURAL_DECISIONS.md` ADR-003 |
| Evolução visual do Portal expande a Landing, nunca cria identidade paralela | `knowledge/ARCHITECTURAL_DECISIONS.md` ADR-004 |
| Linguagem ubíqua: `Colaboração Mensal`, não `Ciclo Mensal` | `knowledge/Arquitetura/ADR-002`/`ADR-003` (série antiga) |
| `Entrega`/`Envio`, não `Ativação`/`Fluxo Logístico` | `knowledge/Arquitetura/ADR-012` (série antiga) |
| Nome oficial do projeto: DODÔ, não TEAR | `knowledge/Arquitetura/ADR-020` (série antiga) |
| Armazenamento de arquivo, se usar Google Drive: OAuth de conta dedicada, nunca Service Account Key | `knowledge/Arquitetura/ADR-017` (série antiga) |

Ver `PORTAL_BRIEFING.md` §11 para a lista completa e o racional de cada uma.

## 6. Decisões do EPIC 0 — ✅ RESOLVIDAS em 2026-07-26

As 6 decisões bloqueantes abaixo foram tomadas pelo responsável do projeto e registradas em
`knowledge/ARCHITECTURAL_DECISIONS.md` (ADR-005 a ADR-010). **EPIC 1 já pode começar.**

1. **Stack do Portal.** Backend Node.js/TypeScript; frontend React+Vite+TypeScript
   reaproveitando `app/`. ADR-005.
2. **Vocabulário de domínio.** Contrato Soberano (`Colaboração Mensal`/`Entrega`/`Envio`/
   `Obrigação Financeira`) rege todo código novo. ADR-006.
3. **Modelo de autenticação da Parceira.** Google OIDC federado (Authorization Code Flow +
   PKCE), fluxo `PENDING→ACTIVE` de SPEC-035. ADR-007.
4. **Escopo do ator Marca.** Fora do MVP; sistema single-tenant. ADR-008.
5. **Gate de elegibilidade de pagamento.** Todas as Entregas `Aprovado`; `Publicado` não é
   pré-requisito. ADR-009.
6. **LGPD.** Política completa de Privacy by Design/Default registrada como requisito de
   primeira classe desde o EPIC 1 (não mais débito herdado). ADR-010.

Ver `PORTAL_BRIEFING.md` §13 (itens 7-12 seguem pendentes) e `PORTAL_BACKLOG.md` EPIC 0
(marcado concluído) para o detalhamento.

**Atualização 2026-07-27 — EPIC 1 a 4 concluídos.** Fundação (login OIDC real, isolamento por
sessão), Conteúdo/Pendências, Financeiro/Histórico e Perfil estão implementados e validados
manualmente com sessão OAuth real (`portal-backend`/`portal-frontend`). EPIC 5 (moderação de
conta `PENDING→ACTIVE/REJECTED`) também está implementado. **Além do backlog original deste
documento**, uma fase inteira de Backoffice Administrativo (fora do escopo do
`PORTAL_BACKLOG.md`, autorizada à parte pelo responsável do projeto) também foi concluída:
CRUD de Parceiras, Entregas (com Aprovação), Briefings, Obrigação Financeira, e Dashboard
agregado. Ver `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md` para o
detalhamento completo, dívidas técnicas reais e o roadmap proposto daqui para frente.

## 7. Em que ordem foi construído o Portal (histórico) — próximos passos no documento de consolidação

```
EPIC 0 — Decisões bloqueantes (itens 1-6 acima)                          ✅ concluído
   ↓
EPIC 1 — Fundação: setup + Acesso (login) + identidade visual conectada  ✅ concluído
   ↓
EPIC 2 — Conteúdo/Pendências (módulo de maior frequência de uso)         ✅ concluído
   ↓
EPIC 3 — Financeiro/Histórico  ∥  EPIC 4 — Perfil                        ✅ concluídos
   ↓
EPIC 5 — Identidade e Acesso avançada                                     ✅ concluído
   ↓
Backoffice Administrativo (fase à parte, fora deste backlog original)    ✅ concluído
   (Parceiras, Entregas, Aprovação, Briefings, Obrigação Financeira, Dashboard)
```

Racional completo de cada fase do Portal em `PORTAL_BACKLOG.md`. Para o que vem depois
(fechamentos de baixo risco e evoluções estruturais como "Colaboração Mensal"), ver o roadmap
proposto em `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md`.

## 8. Quais arquivos ler primeiro (nesta ordem)

1. **Este arquivo** (já está lendo).
2. `knowledge/PROJECT_SOURCE_OF_TRUTH.md` — mapa de qual documento manda sobre qual assunto.
3. `knowledge/ARCHITECTURAL_DECISIONS.md` — os 4 ADRs de governança/método desta sessão
   (identidade visual, estado do repo, "não invente requisito", evolução visual).
4. `PORTAL_BRIEFING.md` — visão executiva completa, todas as regras, entidades, riscos e
   pendências.
5. `PORTAL_ARQUITETURA.md` — proposta de arquitetura técnica, com "[DOCUMENTADO]" vs.
   "[PROPOSTA]" marcados em cada seção.
6. `PORTAL_BACKLOG.md` — épicos/features/histórias/tarefas, já ordenados.
7. `USER_JOURNEYS.md` — jornada de cada perfil.
8. `PORTAL_GLOSSARIO.md` — glossário oficial de domínio, para consultar sempre que um termo
   gerar dúvida.
9. Só depois disso, se precisar de detalhe: `knowledge/Historico/CONTRATO_SOBERANO.md`
   (fonte soberana do domínio) e as SPECs individuais citadas nos documentos acima
   (`knowledge/Produto/SPEC-025/027/030/032/035`).

**Atualização 2026-07-27:** `README.md` e `CLAUDE.md` já foram corrigidos e hoje refletem a
estrutura real do repositório (`app/`, `portal-frontend/`, `portal-backend/`) — podem ser
usados como fonte de estrutura sem ressalva. A pendência de `PORTAL_BRIEFING.md` §13.9 que
motivou o aviso original está resolvida.

## 9. Quais documentos são fonte da verdade

O índice completo está em **`knowledge/PROJECT_SOURCE_OF_TRUTH.md`** — leia-o se restar
qualquer dúvida sobre qual documento manda sobre qual assunto. Resumo:

| Assunto | Fonte da verdade |
|---|---|
| Identidade visual | Código de `app/src` (ver §2) |
| Regras de negócio e domínio | `knowledge/Historico/CONTRATO_SOBERANO.md` + SPECs numeradas |
| Requisitos funcionais do Portal | `knowledge/Produto/SPEC-025/027/030/032/035` |
| Decisões arquiteturais permanentes (visual/método) | `knowledge/ARCHITECTURAL_DECISIONS.md` |
| Decisões arquiteturais do Sistema B (histórico, código ausente) | `knowledge/Arquitetura/ADR-*.md` |
| Estado real do repositório | Este documento + `docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md` (`README.md`/`CLAUDE.md` também já corrigidos, ver §8) |
| Definição oficial do produto | `PORTAL_BRIEFING.md` |
| Arquitetura consolidada do Portal | `PORTAL_ARQUITETURA.md` |
| Backlog de implementação | `PORTAL_BACKLOG.md` |
| Jornadas de usuário | `USER_JOURNEYS.md` |
| Glossário de domínio | `PORTAL_GLOSSARIO.md` |

## 10. Riscos a evitar

- **Não presuma que existe código para reaproveitar** de nenhuma SPEC/ADR — todos descrevem
  sistemas ausentes deste repositório.
- **Não escolha um modelo de autenticação sem validação explícita** — os 3 modelos
  documentados são incompatíveis entre si; a escolha errada custa retrabalho de schema e de
  toda a camada de sessão.
- **Não misture os dois vocabulários de domínio** (Contrato Soberano vs. Sistema B) no
  mesmo código sem uma decisão explícita de reconciliação — gera ambiguidade estrutural.
- **Não exponha PII em log** (`PIX`, `CNPJ`, `Endereco`, credenciais) — regra repetida em
  toda SPEC do Portal, ligada à pendência aberta de LGPD.
- **Não implemente o ator Marca "de brinde"** — nenhuma fonte confirma que ele deve entrar
  no MVP; é decisão de escopo pendente, não trabalho implícito.
- **Não trate `design-system/index.html` como imutável ou como a referência principal** — é
  auxiliar; a Landing (`app/`) manda.
- **`README.md`/`CLAUDE.md` já estão atualizados** (ver §8) — podem ser consultados
  normalmente para a estrutura real de pastas.

## 11. Plano de execução das primeiras semanas (histórico — todas as fases abaixo concluídas)

**Semana 1 — Decisões (EPIC 0). ✅ Concluída em 2026-07-26.** Os 6 itens do §6 acima foram
fechados com o responsável do projeto; ADRs correspondentes (ADR-005 a ADR-010) já
registrados em `knowledge/ARCHITECTURAL_DECISIONS.md`.

**Semana 2 — Fundação (EPIC 1). ✅ Concluída.** Setup do backend/frontend; identidade visual
de `app/` conectada ao frontend do Portal; autenticação Google OIDC real com sessão
deslizante de 6h; middleware de isolamento de dados por Parceira.

**Semana 3-4 — Conteúdo (EPIC 2). ✅ Concluída.** `Entrega`/`Briefing` no vocabulário Contrato
Soberano; tela de pendências do mês; leitura de briefing por item; upload de material com
transição de estado.

**Semana 5 — Financeiro/Perfil (EPIC 3 e 4). ✅ Concluídas.** Resumo previsto x pago;
histórico por período; tela de perfil com edição de PIX/e-mail/endereço (CEP degradável).

**Fase adicional — Backoffice Administrativo. ✅ Concluída (fora do escopo original deste
plano, autorizada à parte).** CRUD de Parceiras, Entregas (com Aprovação), Briefings,
Obrigação Financeira, Dashboard agregado. Detalhamento completo, dívidas técnicas reais e
roadmap proposto daqui para frente em
`docs/handoff/2026-07-27_backoffice-administrativo-consolidacao.md`.

**A partir daí:** identidade avançada (EPIC 5, se aplicável) e acompanhamento contínuo da
infraestrutura de produção (transversal, ver `PORTAL_BACKLOG.md`).
