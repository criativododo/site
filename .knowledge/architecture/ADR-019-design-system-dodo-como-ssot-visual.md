# ADR-019 · Manual de Design DODÔ como SSOT visual do frontend

**Status:** Aceito — decisão tomada pelo responsável do projeto, aprovação
final registrada em 2026-07-25.

**Resolve:** qual documento é a fonte única de verdade (SSOT) da
identidade visual do frontend React, encerrando um histórico de três
gerações de Design System em conflito entre si e com o código real.

## Contexto

O projeto teve, em sequência, três gerações de identidade visual desde o
rebranding "Estúdio Elã" → "criativo Dodô" (`ADR-020`):

1. **"TEAR Editorial"** (`docs/design/archive/tear-editorial-legado/`) —
   sistema pré-rebranding, vermelho-vinho, serifado. Sem relação com a
   marca atual.
2. **`est-dio-el-design-system/` v2.0**, paleta roxo-primária (`#564f94`)
   — aprovado em 2026-07-24 e chegou a ser nomeado formalmente SSOT por
   uma versão anterior, nunca commitada, deste mesmo ADR. Revertido no
   mesmo dia da aprovação; nunca esteve de fato em produção de forma
   estável. Hoje em `docs/design/archive/est-dio-el-design-system-v2-roxo/`.
3. **Import Google Stitch de 2026-07-25**
   (`docs/design/archive/dodo-stitch-import-2026-07-25/design/DESIGN_DODO.md`),
   paleta laranja-primária/roxo-secundária — seus valores de cor foram
   copiados manualmente para `frontend/src/theme/tokens.css`, que é hoje
   a implementação real em produção.

Uma auditoria completa (2026-07-25) comparando os três documentos, o
Brand Foundations v0.1 (fonte de marca mais ampla) e o código real
confirmou: **os valores de cor em produção batem exatamente com a
geração 3**, não com a geração 2 que o texto original deste ADR nomeava
como SSOT. Radius, no entanto, seguiu a geração 2 (não a 3) — nenhuma das
três gerações documentadas era, sozinha, inteiramente fiel ao código.

Diante disso, em vez de formalizar mais uma geração de documento solto,
o responsável do projeto encomendou a consolidação de todo o material
(Brand Foundations, as três gerações de Design System, e o código real)
num único **Manual de Design DODÔ v1.0** — documento vivo, com o
racional de cada decisão, não só os valores.

## Decisão

1. **`docs/design/manual/index.html` (Manual de Design DODÔ v1.0) passa a
   ser a fonte única de verdade (SSOT) visual do frontend React** — cores,
   tipografia, espaçamento, ícones, elementos de marca e princípios de
   curvatura. Versão PDF em `docs/design/manual/MANUAL_DODO_v1.0.pdf` para
   apresentação/documentação, não é a fonte editável.
2. **As três gerações anteriores são arquivadas** em
   `docs/design/archive/` (`tear-editorial-legado/`,
   `est-dio-el-design-system-v2-roxo/`,
   `dodo-stitch-import-2026-07-25/`) — preservadas por rastreabilidade
   histórica, nunca mais como referência normativa. Ver
   `docs/design/archive/README.md`.
3. **A paleta oficial é laranja-primária (`#f14f28`) / roxo-secundária
   (`#504ea1`)** — não roxo-primária, como a geração 2 registrava. Esta é
   a paleta hoje em produção, documentada com racional completo no
   capítulo "paleta & cor" do Manual.
4. **`docs/design/DESIGN_SYSTEM.md` passa a ser um índice curto** que
   aponta para o Manual, em vez de apontar para a pasta agora arquivada.
   **`docs/design/UI_RULES.md` permanece sem alteração** — comportamental/
   UX, sem valores de marca, compatível com o Manual.
5. **Bordas/curvatura entram como princípio, não como token fechado** —
   o Manual define a lógica de aplicação (proximidade humana como
   critério primário, papel funcional como secundário, uma família só de
   intensidade variável); os valores numéricos ficam para uma etapa
   posterior de definição de tokens técnicos, junto da implementação.
6. A migração dos componentes React (`frontend/src/components/`,
   `frontend/src/pages/`) para refletir integralmente o Manual é trabalho
   de implementação subsequente, conduzido incrementalmente conforme o
   plano em `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md` — não é
   escopo desta ADR, que só registra a mudança de fonte de verdade visual.

## Consequências

- Todo componente/página novo a partir de agora segue o Manual, não
  nenhum dos três documentos arquivados.
- Componentes/páginas existentes continuam no estado atual até serem
  migrados individualmente pelo plano de implementação — não há
  big-bang; inconsistência visual temporária durante a transição é
  esperada e aceita.
- Nenhuma rota, controller, model ou regra de negócio é afetada — esta
  ADR é estritamente sobre a camada visual do frontend.
- Qualquer documento do projeto que cite "Design System" deve apontar
  para o Manual, não para as pastas arquivadas.
