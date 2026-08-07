# marca-dodo

Design System Criativo Dodô: manual de marca, brand book e documentação do sistema. Ativo
independente do ecossistema Criativo Dodô, consumido por Portal, Landing e produtos futuros;
nenhum deles o define (`ADR-025`, `knowledge/ARCHITECTURAL_DECISIONS.md`).

## governança

- **Fonte de trabalho:** `criativododo-interno/MATERIAL PARA DESIGN SYSTEM FINAL/`, externa a
  este repositório (`ADR-025` item 3). Nada dessa pasta é copiado para cá.
- **Fonte de verdade durante a construção:** o Markdown deste diretório. Nenhum HTML, PDF ou
  arquivo Figma é gerado até o conteúdo estar completo e aprovado.
- **Publicação:** etapa única, controlada, ao final. Gera HTML autocontido, valida, gera PDF
  derivado, e então é importado para o Claude Design. HTML e PDF nunca são editados
  diretamente: toda correção volta ao Markdown e regera os dois.
- **Legado:** o `design-system/` anterior (paleta laranja/roxo) está arquivado em
  `docs/design/archive/design-system-legado-laranja-roxo/`. Não é consultado como fonte de
  decisão.
- **Localização oficial:** este diretório passa a ser registrado como localização física
  definitiva em `knowledge/PROJECT_SOURCE_OF_TRUTH.md` §8 quando a primeira entrega for
  publicada (`ADR-025` item 7).

## estrutura

```
marca-dodo/
  parte-1-a-marca/       quem é a criativo dodô, o nome, a essência, o método, a personalidade
  parte-2-o-manual/      logo, cor, tipografia, imagem, aplicações
  parte-3-o-sistema/     princípios, tokens, componentes, padrões de tela
  anexos/                inventário de arquivos, log de decisões, changelog
  PENDENCIAS.md          decisões em aberto (A01–A10 do briefing), rastreadas até a resposta do Dani
```

## imagens editoriais

Fonte prioritária: `BANCO DE IMAGENS/`, 20 imagens já produzidas, que fazem parte do universo
visual do projeto. Uma imagem nova só é proposta quando nenhuma opção do banco for adequada
ao capítulo. Placeholder não é usado: toda seção de abertura referencia um arquivo real.

Ao escolher uma imagem do banco: o arquivo usado é documentado, com uma justificativa breve
de por que ela serve ao capítulo (`anexos/imagens-editoriais.md`). Ajustes editoriais leves
são permitidos (escurecer o vermelho em direção a Cherry, contraste, exposição, equilíbrio de
cor, recorte e enquadramento). O conceito da fotografia não é alterado. Imagens já usadas não
são substituídas sem necessidade.

## regras de escrita

Este documento obedece ao tom da marca que documenta (`BRIEFING-FINAL-CLAUDE-CODE.md` §4 e
§15.4): caixa baixa em títulos, sem travessão em nenhum contexto, sem reticências, sem "não é
x, é y", sem pergunta retórica, sem vocabulário banido, parágrafos de 2 a 3 linhas.
