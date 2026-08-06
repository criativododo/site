# PROJECT_SOURCE_OF_TRUTH.md

> Índice oficial de fontes de verdade do projeto Criativo DODÔ. Criado em 2026-07-26 para
> consolidar, num único lugar, qual documento/código manda sobre qual assunto — evitando que
> sessões futuras precisem reconstruir esse mapeamento a partir do zero. Este documento não
> substitui nenhuma fonte listada abaixo; ele só declara a hierarquia entre elas.

---

## 1. Identidade visual

**Fonte oficial: a Landing Page implementada em `app/`.**

A implementação real em `app/src` (componentes React, CSS, tipografia, motion GSAP,
responsividade) é, hoje, a implementação oficial da identidade visual do Criativo DODÔ.
Cobre: identidade visual, aplicação da marca, componentes, tipografia, paleta de cores,
espaçamentos, grid, animações/motion, responsividade, comportamento visual e linguagem de
interface.

Até que um novo Design System seja formalmente aprovado, **em qualquer divergência entre a
Landing (`app/`), o Design System HTML (`design-system/index.html`) e qualquer
documentação**, a Landing sempre prevalece. Ver `ARCHITECTURAL_DECISIONS.md` ADR-001.

## 2. Regras de negócio e documentação funcional

**Fonte oficial: `knowledge/`**, com a seguinte hierarquia interna:

1. `knowledge/Historico/CONTRATO_SOBERANO.md` — linguagem ubíqua e modelo de domínio;
   autodeclarado soberano ("em conflito entre documentação/implementação e a fonte oficial,
   prevalece a fonte oficial").
2. `knowledge/Produto/SPEC-*.md` — especificação funcional detalhada por módulo, deve ser
   consistente com o Contrato Soberano; onde divergir, o Contrato Soberano prevalece.
3. `knowledge/Arquitetura/ADR-*.md` — decisões arquiteturais do "Sistema B" (Laravel, código
   ausente deste repositório) e da linguagem ubíqua. Reaproveitáveis como referência de
   raciocínio, **não** como código herdável.
4. `knowledge/Produto/PRD.md` — requisitos originais (V1); onde SPECs numeradas divergirem
   do PRD, as SPECs (mais recentes, Fase 4 do projeto) prevalecem, exceto quando a própria
   SPEC citar o PRD como origem de uma regra ainda válida.

**Importante:** nada em `knowledge/` descreve o estado físico atual deste repositório — ver
§3 abaixo e `docs/business/PORTAL_BRIEFING.md` §0.

## 3. Definição oficial do produto (Portal)

**Fonte oficial: `docs/business/PORTAL_BRIEFING.md`** — visão geral, objetivo,
problema resolvido, perfis de usuário, módulos, funcionalidades, regras de negócio,
integrações, entidades, restrições, decisões já tomadas, riscos e pendências, tudo
consolidado a partir de `knowledge/` e do estado real do repositório.

## 4. Arquitetura consolidada

**Fonte oficial: `docs/architecture/PORTAL_ARQUITETURA.md`** — cada seção marcada
`[DOCUMENTADO]` (existe em alguma fonte de `knowledge/`) ou `[PROPOSTA]` (sugestão sem base
documental, a validar). Não confundir com os ADRs do Sistema B em `knowledge/Arquitetura/` —
aqueles descrevem uma implementação que não existe mais; este documento propõe a
arquitetura para o que será construído agora.

## 5. Ordem oficial de implementação

**Fonte oficial: `docs/business/PORTAL_BACKLOG.md`** — épicos, features, histórias
de usuário e tarefas técnicas, já sequenciados (EPIC 0 → EPIC 5, concluídos), com critérios
de aceite.

**A partir da evolução estrutural iniciada em 29/07/2026** (fechamentos de baixo risco,
persistência PostgreSQL, Colaboração Mensal e o que vier depois), a ordem oficial passa a ser
`criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md` (fora do repositório git,
aprovado pelo responsável do projeto), executado uma fase por vez — ver
`docs/handoff/PROJECT_STATUS.md` para a fase corrente. `docs/business/PORTAL_BACKLOG.md` continua sendo a
fonte histórica do que já foi construído (EPIC 0-5), não é reaberto nem reescrito.

## 6. Jornadas oficiais dos usuários

**Fonte oficial: `USER_JOURNEYS.md`** (raiz do repositório) — jornada documentada de cada
perfil (Influenciadora/Parceira, Administrador); jornadas não documentadas (Marca, Gestor de
Marca, Assessoria) são declaradas como tal, não inventadas.

## 7. Linguagem ubíqua do domínio (glossário)

**Fonte oficial: `docs/architecture/PORTAL_GLOSSARIO.md`** — glossário consolidado a
partir do Contrato Soberano, das SPECs e dos ADRs, incluindo os termos banidos e a
divergência de vocabulário com o Sistema B.

## 8. Design System

**Fonte oficial: o Design System Criativo Dodô — ver `ADR-025`
(`knowledge/ARCHITECTURAL_DECISIONS.md`).**

`ADR-025` supera `ADR-019` da série antiga (`knowledge/Arquitetura/`) para fins de identidade
visual. O conteúdo anterior de `design-system/` (paleta laranja/roxo) e qualquer material em
`docs/design/archive/` são arquivo histórico, nunca fonte de decisão a partir desta ADR.

**Governança.** O Design System Criativo Dodô é um ativo independente do ecossistema Criativo
Dodô — não pertence ao Portal, à Landing, nem a qualquer produto específico. Portal, Landing e
produtos futuros o consomem; nenhum deles o define (`ADR-025` item 2).

**Fonte de trabalho durante a construção:** `criativododo-interno/MATERIAL PARA DESIGN SYSTEM
FINAL/` (externa ao repositório git, mesmo padrão de `PLANO_MESTRE_IMPLEMENTACAO_PORTAL_
DODO.md`, ver §5). A localização física definitiva do Design System Criativo Dodô será
registrada aqui quando a primeira entrega for publicada (`ADR-025` item 7).

**Este item não altera o §1 abaixo** (identidade visual da Landing, `app/`) — essa migração,
se e quando decidida, exige decisão de Produto e UX dedicada, separada de `ADR-025`, e só pode
nascer da auditoria entre o Design System construído e o portal existente prevista em
`ADR-025` item 10.

## 9. Estado físico do repositório (o que existe de fato)

**Estado operacional vigente:** repositório privado `criativododo-memory`, carregado por
`/inicio <objetivo>` (ADR-018). **Estado físico e histórico local:** `docs/business/PORTAL_BRIEFING.md`
§0 e `docs/guides/START_HERE_NEXT_SESSION.md`; este último é snapshot legado desde 30/07/2026.

## 10. Decisões arquiteturais permanentes

**Fonte oficial: `knowledge/ARCHITECTURAL_DECISIONS.md`** — ADRs de escopo deste projeto
(distintos, e numerados numa série própria, dos ADRs em `knowledge/Arquitetura/`, que
documentam decisões do Sistema B ausente).

## 11. Diretório `.ai/`

**Não é Fonte da Verdade.** Auditado em 2026-08-05 (Sessão S1): todos os arquivos de
`.ai/` (`SYSTEM.md`, `ARCHITECTURE.md`, `BUSINESS_RULES.md`, `DESIGN_SYSTEM.md`,
`CURRENT_STATUS.md`, `STACK.md`, `ROADMAP.md`, `GLOSSARY.md`, `INDEX.md`) estão vazios;
apenas `.ai/README.md` tem conteúdo, e este apenas lista os arquivos vazios. O diretório
nunca foi efetivamente populado, apesar de se apresentar como "documentação soberana
consumida por agentes de IA". Nenhum documento listado nesta tabela deve ser substituído
por `.ai/`. Enquanto os arquivos permanecerem vazios, ignorar `.ai/` ao consultar fontes de
verdade; ele só volta a ser válido se for populado oficialmente (com ADR associada) ou
removido do projeto.

---

## Resumo em uma tabela

| # | Assunto | Fonte oficial |
|---|---|---|
| 1 | Identidade visual | `app/` (Landing) |
| 2 | Regras de negócio / documentação funcional | `knowledge/` (hierarquia interna acima) |
| 3 | Definição oficial do produto | `docs/business/PORTAL_BRIEFING.md` |
| 4 | Arquitetura consolidada | `docs/architecture/PORTAL_ARQUITETURA.md` |
| 5 | Ordem oficial de implementação | `docs/business/PORTAL_BACKLOG.md` |
| 6 | Jornadas oficiais dos usuários | `USER_JOURNEYS.md` |
| 7 | Linguagem ubíqua do domínio | `docs/architecture/PORTAL_GLOSSARIO.md` |
| 8 | Design System | Design System Criativo Dodô, ativo independente (`ADR-025`) — supera `ADR-019` antiga |
| 9 | Estado operacional vigente | `criativododo-memory`, carregado por `/inicio <objetivo>` |
| 9a | Estado físico e histórico local | `docs/business/PORTAL_BRIEFING.md` §0 / `docs/guides/START_HERE_NEXT_SESSION.md` (legado) |
| 10 | Decisões arquiteturais permanentes | `knowledge/ARCHITECTURAL_DECISIONS.md` |
| 11 | `.ai/` | **Não é Fonte da Verdade** — vazio, não utilizar |
