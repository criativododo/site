---
category: Foundations
---

# Tokens e uso — Criativo Dodô

CSS completo em `styles.css` (`tokens.css` + `components.css`). Este documento é o
companheiro em prosa.

## Cor

| token | hex | papel |
|---|---|---|
| `--color-cotton` | `#edebdd` | fundo neutro do sistema inteiro — é o "branco" (nunca branco puro) |
| `--color-cherry` | `#810100` | ação, ênfase, identidade — 9.05:1 sobre cotton (AAA) |
| `--color-maroon` | `#630000` | variação escura — **nunca ao lado de cherry** (1.27:1 entre si, reprova AA) |
| `--color-noir` | `#1b1717` | texto padrão — 14.84:1 sobre cotton (AAA) |

Landing: alterna seções inteiras claro→vermelho→claro→maroon, nunca degradê ou mistura na
mesma dobra. Portal: fundo Cotton do topo ao rodapé sempre; Cherry só como acento pontual
(título, link, botão primário, badge de status específico) — nunca como fundo de bloco.

## Tipografia

`--font-display: "Work Sans"` · `--font-body: "Elms Sans"` — confirmado contra
`portal-frontend/src/styles/tokens.css` (código real). Ambas variáveis (`font-weight: 100
900`), self-hosted via `@font-face` (não CDN). Só 5 pesos usados: 300, 400, 600, 700, 800.

| papel | tamanho desktop / mobile | peso |
|---|---|---|
| título de página/seção | 38.4px / 28.8px | 800 |
| item de lista/accordion | 20.8px | 600 (800 hover) |
| valor de KPI | 22px | 700, display |
| overline/eyebrow | 13.6px, uppercase, tracking 0.08em | 700 |
| corpo/descrição | 15–16.5px | 400 |
| nav | 15.3px | 600 |
| botão | 14–15px | 700 |

## Espaçamento

Conjunto observado no código (não é progressão geométrica fechada): `2, 6, 8, 10, 12, 14,
16, 20, 24, 28, 32, 36, 40, 48, 60, 80, 120, 140` (px). Valores pequenos (2–16) dominam
espaçamento interno de componente; grandes (60–140) só em respiro de seção/página.

## Layout

Container único: `max-width: 1026px`. Dois breakpoints em todo o CSS: `1100px` e `768px`.
Landing é 100% flexbox (respiro de seção: 140px desktop / 80px mobile). Portal usa grid só
no shell (`sidebar 264px + 1fr`) — dentro do conteúdo volta a ser flexbox/listas verticais.

## Motion

Único token formal: `--ease-editorial: cubic-bezier(0.25, 1, 0.5, 1)`. Landing usa GSAP +
ScrollTrigger (`toggleActions: "play none none none"`, toca uma vez). Portal é CSS puro com
a mesma curva.

**Gap conhecido, não resolvido no produto real**: nenhum tratamento de
`prefers-reduced-motion`, nem na Landing nem no Portal. Qualquer implementação nova de
motion deve fechar essa lacuna, não repeti-la.

## Raio, borda, elevação

Vocabulário inteiramente do Portal — a Landing só usa raio-pílula (botão). Ver
`--radius-*`, `--border-*`, `--shadow-*` em `tokens.css`.
