---
category: Components
---

# Componentes — Criativo Dodô

Não há biblioteca de componentes React compartilhada (Landing e Portal são projetos
independentes, sem workspace nem imports cruzados — `DESIGN.md` §33: extrair uma só quando
houver uma terceira superfície de produto, com intenção real). Este Design System é
**CSS-first**: classes em `components.css`, para usar diretamente no HTML/JSX de qualquer
projeto novo.

## Classes já reais em produção

`.container`, `.title-editorial`, `.portal-eyebrow`, `.portal-nav-link`,
`.portal-list-row`, `.pendencia-item` (+ `.is-overdue`, `.is-open`),
`.pendencia-status-badge`, `.financeiro-kpi` (+ `.is-destaque`).

## Classes consolidadas nesta versão (prefixo `dodo-`)

Valores que hoje existem só como **estilo inline duplicado** no código-fonte (achado
`DESIGN.md` §34.7: `estiloBotaoOutlineCherry` em 3 arquivos, `estiloBotaoOutlineNeutro` em
4, `estiloInput`/`estiloLabel` repetidos sem nome). Aqui ganham nome único pela primeira
vez — **migrar o código-fonte para usar essas classes é pendência de engenharia em aberto,
não um fato já implementado**.

- `.dodo-btn-primary` — botão de ação principal (equivalente a `.btn-primary` real da Landing).
- `.dodo-btn-outline-cherry` / `.dodo-btn-outline-neutral` — botões secundários administrativos.
- `.dodo-field` / `.dodo-field-label` — campo e label de formulário.
- `.dodo-card` — card genérico (borda + raio + sombra).
- `.dodo-callout` (+ `.is-gap`) — aviso; `.is-gap` marca decisão pendente sem inventar regra
  (padrão editorial próprio da Dodô, promovido do material de documentação de marca).
- `.dodo-chip` — chip/tag pequeno.

## Não incluído

Tabelas (`<table>`) e modais: propostas em `DESIGN.md` §23/§24, sem implementação real —
fora do escopo deste Design System até existirem em produção.
