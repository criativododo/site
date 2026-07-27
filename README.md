# Criativo Dodô — Influencia

Repositório único do ecossistema web do **Criativo Dodô** (nome técnico anterior do
projeto: "Projeto TEAR"; marca comercial anterior: "Estúdio Elã", produto "ELÃ |
influência" — nomenclatura legada, ver `ADR-020` em `knowledge/Arquitetura/`). A
**Influencia** é a plataforma de gestão de marketing de influência entre a marca e suas
parceiras (influenciadoras): cadastro, aprovação, briefings, entrega de materiais,
aprovação de conteúdo, pagamentos, contratos e histórico/auditoria.

> **Nota histórica:** o produto nasceu como automação em Google Apps Script/Sheets, depois
> passou por uma fase Laravel + React ("Sistema B", nunca chegou a produção, código ausente
> deste repositório). A implementação atual — Landing + Portal — é a que existe fisicamente
> aqui. Ver `START_HERE_NEXT_SESSION.md` e `knowledge/PROJECT_SOURCE_OF_TRUTH.md`.

Organização oficial no GitHub: **criativododo**. Este repositório:
`https://github.com/criativododo/criativododosite`.

---

## O que existe em código

| Pasta | O que é | Stack |
|---|---|---|
| `app/` | Landing Page pública do Criativo Dodô — implementação oficial da identidade visual da marca | React 19 + Vite + TypeScript + GSAP |
| `portal-frontend/` | Frontend do Portal da Parceira/Backoffice | React 19 + Vite + TypeScript |
| `portal-backend/` | API do Portal | Node.js + TypeScript |

`design-system/` (HTML) e `DESIGN.md` são documentação visual auxiliar extraída do código
de `app/src` — nunca a fonte primária; em qualquer divergência, `app/src` prevalece (ver
`knowledge/ARCHITECTURAL_DECISIONS.md`, ADR-001).

## Documentação

| Local | Conteúdo |
|---|---|
| `CLAUDE.md` | Contrato operacional para agentes de IA |
| `START_HERE_NEXT_SESSION.md` | Estado real do repositório — leitura obrigatória antes de qualquer trabalho |
| `knowledge/PROJECT_SOURCE_OF_TRUTH.md` | Índice de qual documento manda sobre qual assunto |
| `knowledge/Historico/CONTRATO_SOBERANO.md` | Domínio soberano — linguagem ubíqua oficial |
| `knowledge/Produto/SPEC-*.md` | Especificações funcionais numeradas |
| `knowledge/ARCHITECTURAL_DECISIONS.md` | ADRs de governança e método vigentes deste projeto |
| `knowledge/Arquitetura/ADR-*.md` | ADRs históricos do "Sistema B" (Laravel, código ausente) |
| `PORTAL_BRIEFING.md` | Definição oficial do produto Portal |
| `PORTAL_ARQUITETURA.md` | Arquitetura consolidada do Portal |
| `PORTAL_BACKLOG.md` | Backlog sequenciado (EPIC 0 → EPIC 5) |
| `PORTAL_GLOSSARIO.md` | Glossário oficial de domínio |
| `USER_JOURNEYS.md` | Jornadas de usuário por perfil |
| `docs/_workspace/` | Estado operacional de sessão (auditorias, releases, handoffs) |
| `referencias/` | Material de referência de design (brand guidelines de terceiros) |

## Primeiros passos

```bash
# Landing
cd app && npm install && npm run dev

# Portal — frontend
cd portal-frontend && npm install && npm run dev

# Portal — backend
cd portal-backend && npm install && npm run dev
```

Cada um dos três projetos é independente (`package.json` próprio, sem workspace
compartilhado) e builda com `npm run build`.

## Contribuição

Toda alteração deve preservar os princípios estabelecidos em `CLAUDE.md` e nos ADRs
vigentes (`knowledge/ARCHITECTURAL_DECISIONS.md` para governança/método deste projeto;
`knowledge/Historico/CONTRATO_SOBERANO.md` para domínio). Mudanças arquiteturais
significativas exigem um novo ADR.

## Licença

Este repositório segue a política de licenciamento definida pelo Criativo Dodô. Caso uma
licença específica seja adotada futuramente, este documento deverá ser atualizado.

## Créditos

Projeto desenvolvido pelo **Criativo Dodô**.
