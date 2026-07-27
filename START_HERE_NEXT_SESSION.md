# START_HERE_NEXT_SESSION.md

> Este é o documento mais importante do handoff. Leia como se você fosse um engenheiro que
> nunca participou deste projeto. Ele explica o estado real do repositório, o que é
> documentação vs. o que é código, o que já foi decidido, o que ainda precisa de decisão, em
> que ordem construir o Portal, e quais riscos evitar.

## Resumo de 60 segundos (se só puder ler isto)

- **Existe em código:** só a Landing Page (`app/`). Nada de Portal, backend, banco ou auth.
- **Existe só como documentação:** o Portal inteiro, especificado em `knowledge/` (SPECs,
  ADRs), descrevendo um sistema que rodava em outro repositório, já removido.
- **Fonte de verdade visual:** a Landing (`app/`) — não o Design System HTML.
- **Leia primeiro, nesta ordem:** este documento → `knowledge/PROJECT_SOURCE_OF_TRUTH.md` →
  `PORTAL_BRIEFING.md` → `PORTAL_ARQUITETURA.md` → `PORTAL_BACKLOG.md`.
- **ADRs a respeitar:** `knowledge/ARCHITECTURAL_DECISIONS.md` (ADR-001 a ADR-004, série
  desta sessão) — sobrepõem, para fins visuais e de método, o que a série antiga
  (`knowledge/Arquitetura/ADR-*.md`) documentava para um sistema que não existe mais aqui.
- **Antes de implementar qualquer coisa:** resolver as 6 decisões bloqueantes de `PORTAL_
  BRIEFING.md` §13 (itens 1-6) — ver `PORTAL_BACKLOG.md` EPIC 0.

---

## 1. A primeira coisa que você precisa entender

Este repositório (`/Users/danielperrut/criativododo`) tem hoje, fisicamente:

- **`app/`** — a Landing Page do Criativo DODÔ, React 19 + Vite + GSAP + TypeScript.
  **Funciona e está implementada.** É o único código de produto real que existe aqui.
- **`design-system/`** — um Design System em HTML, gerado a partir do código de `app/` numa
  sessão anterior. É documentação auxiliar, **não é a referência principal**.
- **`knowledge/`** — uma documentação de produto e arquitetura extensa e madura sobre um
  sistema de gestão de parcerias com influenciadoras ("TEAR"/"ELÃ | influência", hoje
  "DODÔ"), incluindo dezenas de SPECs, ADRs, e um Portal da Influenciadora totalmente
  especificado.
- **Nenhum backend. Nenhum frontend de Portal. Nenhuma linha de código PHP/Laravel/Apps
  Script existe fisicamente aqui.** Tudo isso que `knowledge/` descreve como "implementado"
  pertence a um repositório diferente, que foi removido (`/Users/danielperrut/ela-influencia`).

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

## 3. O que já existe em código (só isto)

- `app/` — Landing Page completa.
- `design-system/index.html` + `DESIGN.md` — documentação visual auxiliar (derivada de
  `app/`, não a fonte principal — ver §2).
- Nada de Portal, backend, autenticação, banco de dados ou upload de arquivo.

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

## 6. Decisões que AINDA precisam ser tomadas (não avance sem elas)

Estas são bloqueantes — implementar sem decidir gera retrabalho estrutural depois:

1. **Stack do Portal.** Nenhuma stack de backend existe hoje. Recomeçar em Laravel+React
   (como o Sistema B descrevia), adotar outra, ou integrar com legado — nada resolve isso.
2. **Vocabulário de domínio.** Contrato Soberano (`Colaboração Mensal`/`Entrega`) vs. Sistema
   B (`Campanha`/`Participação`) — escolher um antes de desenhar schema.
3. **Modelo de autenticação da Parceira.** Cupom+CNPJ, e-mail/senha, ou Google OIDC — três
   descrições incompatíveis, nenhuma implementada.
4. **Escopo do ator Marca.** Multi-tenant desde o início, ou single-tenant como o PRD
   original.
5. **Gate de elegibilidade de pagamento.** Dois documentos discordam se já está decidido.
6. **LGPD.** Retenção/expurgo de PII nunca formalizada — precisa virar requisito de primeira
   classe antes do Portal expor dados pessoais.

Ver `PORTAL_BRIEFING.md` §13 para a lista completa (12 itens) e `PORTAL_BACKLOG.md` EPIC 0
para como transformar essas decisões em tarefas concretas.

## 7. Em que ordem construir o Portal

```
EPIC 0 — Decisões bloqueantes (itens 1-6 acima)
   ↓
EPIC 1 — Fundação: setup + Acesso (login) + identidade visual conectada (§2)
   ↓
EPIC 2 — Conteúdo/Pendências (módulo de maior frequência de uso)
   ↓
EPIC 3 — Financeiro/Histórico  ∥  EPIC 4 — Perfil (podem ser paralelizados)
   ↓
EPIC 5 — Identidade e Acesso avançada (só se o modelo federado for escolhido)
```

Racional completo de cada fase em `PORTAL_BACKLOG.md`.

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

**Não leia `README.md`/`CLAUDE.md` como fonte de estrutura do repositório** — ambos
descrevem uma estrutura de pastas (`backend/`, `frontend/`, `docs/`) que não existe aqui
(pendência registrada em `PORTAL_BRIEFING.md` §13.9). Eles precisam ser atualizados em algum
momento, mas não são confiáveis para orientação estrutural agora.

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
| Estado real do repositório | Este documento + `PORTAL_BRIEFING.md` §0 (não `README.md`/`CLAUDE.md`) |
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
- **Não confie em `README.md`/`CLAUDE.md`** para a estrutura real de pastas — estão
  desatualizados.

## 11. Plano de execução das primeiras semanas

**Semana 1 — Decisões (EPIC 0).** Sessão de validação com o responsável do projeto para
fechar os 6 itens do §6 acima. Produzir os ADRs correspondentes. Nenhum código de domínio é
escrito nesta semana.

**Semana 2 — Fundação (EPIC 1).** Setup do backend/frontend escolhidos; conectar a
identidade visual de `app/` ao frontend do Portal; implementar o mecanismo de autenticação
decidido, com sessão deslizante de 6h; implementar o middleware de isolamento de dados por
Parceira (nenhuma consulta pode aceitar `parceiraId` vindo do cliente).

**Semana 3-4 — Conteúdo (EPIC 2).** Modelo mínimo de `Entrega`/`Briefing` no vocabulário
escolhido; tela de pendências do mês; leitura de briefing por item; upload de material com
transição de estado.

**Semana 5 — Financeiro/Perfil (EPIC 3 e 4, paralelizáveis).** Resumo previsto x pago;
histórico por período; tela de perfil com edição de PIX/e-mail/endereço (CEP degradável).

**A partir daí:** identidade avançada (EPIC 5, se aplicável) e acompanhamento contínuo da
infraestrutura de produção (transversal, ver `PORTAL_BACKLOG.md`).
