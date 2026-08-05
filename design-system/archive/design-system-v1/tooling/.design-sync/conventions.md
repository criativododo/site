# Criativo Dodô — convenções para quem constrói com este Design System

Este DS é **CSS puro** (sem React/componentes compilados): `styles.css` é a única coisa a
importar. Não há provider, wrapper ou setup de contexto — vincule a folha e use as classes.

## Idioma de estilo

Classes nomeadas + tokens CSS (`var(--*)`), não utility classes no estilo Tailwind. Duas
famílias:

- **Reais em produção**: `.container`, `.title-editorial`, `.portal-eyebrow`,
  `.portal-nav-link`, `.portal-list-row`, `.pendencia-item` (+ `.is-overdue`, `.is-open`),
  `.pendencia-status-badge`, `.financeiro-kpi` (+ `.is-destaque`).
- **Consolidadas nesta versão** (prefixo `dodo-`): `.dodo-btn-primary`,
  `.dodo-btn-outline-cherry` / `.dodo-btn-outline-neutral`, `.dodo-field` +
  `.dodo-field-label`, `.dodo-card`, `.dodo-callout` (+ `.is-gap`), `.dodo-chip`.

Tokens de cor: `--color-cotton` (fundo), `--color-cherry` (ação/ênfase), `--color-maroon`
(variação escura — nunca ao lado de cherry), `--color-noir` (texto). Tokens de tipografia:
`--font-display` (Work Sans, títulos/botões, pesos 600–800), `--font-body` (Elms Sans,
corpo/label, pesos 300–700). Nunca usar peso fora de 300/400/600/700/800.

## Onde a verdade mora

`styles.css` (raiz do bundle) → `@import` de `tokens.css` (variáveis) e `components.css`
(classes). Guidelines completas em `guidelines/` — comece por
`00-fundamentos-da-marca.md` (voz, princípios, do's/don'ts) e
`01-tokens-e-uso.md` (uso de cor/tipografia/espaçamento em prosa).

## Exemplo idiomático

```html
<link rel="stylesheet" href="styles.css">

<section class="dodo-card">
  <p class="portal-eyebrow">Colaboração mensal</p>
  <h2 class="title-editorial">Briefing aprovado</h2>
  <button class="dodo-btn-primary">Ver detalhes</button>
</section>
```

## Disciplina de marca (não negociável)

Cherry nunca ao lado de Maroon como texto/fundo (contraste 1.27:1, reprova AA). Cotton é o
"branco" do sistema — nunca branco puro. Em produto de uso contínuo (dashboards, telas de
trabalho), Cherry é acento pontual, nunca fundo de seção inteira.
