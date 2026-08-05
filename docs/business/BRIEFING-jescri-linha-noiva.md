# Briefing para Claude Code: página linha noiva jescri

## Objetivo
Criar a rota `criativododo.com.br/jescri/linha-noiva` no site do Criativo Dodô. Página institucional de apresentação da ação de lançamento da linha noiva Jescri, usada como link para levar a marca e parceiras. Não é e-commerce, não tem checkout. É uma landing de apresentação.

## Rota
- Path: `/jescri/linha-noiva`
- Se a estrutura atual não comporta sub-rotas por cliente, criar o namespace `/jescri/` e deixar pronto para outras ações futuras do mesmo cliente.

## Design system
Usar o design real do projeto (`app/src/index.css`), não reinventar.
- cotton `#edebdd` fundo, cherry `#810100` ação e ênfase, maroon `#630000` escuro, noir `#1b1717` texto
- Work Sans 800 nos títulos, Elms Sans no corpo
- caixa baixa como padrão, sem travessão, sem reticências, sem exclamação
- alternância de seção: cada bloco 100% cotton ou 100% cherry, nunca os dois no mesmo fundo. cherry como virada, não como decoração
- premium por silêncio: muito respiro, um foco por bloco, tipografia grande

## Fotos
Origem: `/Users/danielperrut/Library/CloudStorage/GoogleDrive-elafashionmkt@gmail.com/.shortcut-targets-by-id/1XWkfYnuOJveUX2FB4TsIqjRSQ82R20I2/02. FOTOS E VIDEOS/1. REMANSO/0. FOTOS CONCEITO/NOIVAS`
- Escolher as fotos com liberdade. Priorizar imagens que funcionem em duotone ou com tratamento cotton/maroon, coerentes com a estética discreta.
- Otimizar (webp, tamanhos responsivos) e copiar para os assets do projeto. Não referenciar o Google Drive em produção.

## Estrutura da página (blocos, em ordem)

1. **hero** (cherry)
   título: antes do sim
   subtítulo: a linha noiva jescri
   foto de fundo ou lateral tratada em duotone

2. **o momento** (cotton)
   título: a linha subiu, e o calendário não espera
   corpo: casamentos concentram de setembro a dezembro. quem casa nesses meses está comprando enxoval agora.

3. **o argumento** (cherry, virada)
   título grande: a noiva decide a lingerie por último, e decide rápido
   corpo: quando ela pensa na noite de núpcias e na lua de mel, a jescri precisa estar na frente dela.

4. **a linha** (cotton)
   título: robes, camisolas e conjuntos para as noites que importam
   corpo curto sobre toque, caimento e acabamento. galeria de 3 a 5 fotos da pasta.

5. **a experiência** (cotton)
   título: a marca na pele, não no folheto
   corpo: peça na mão, prova no provador, atendimento sem fila. kit em bag de cetim com essência exclusiva da linha e algo azul.

6. **as três lojas** (cotton)
   título: friburgo, copacabana e niterói
   endereços das três lojas (puxar do rodapé do jescri.com.br) e link do whatsapp de cada uma.

7. **cta / fecho** (cherry)
   título: conheça a linha
   botão para o whatsapp da loja de friburgo e link para jescri.com.br
   assinatura: criativo dodô

## Regras técnicas
- responsivo, breakpoints do projeto (1100px, 768px)
- acessível: contraste AA já garantido pelos tokens, alt em todas as fotos, foco visível
- sem dependência nova pesada. seguir o stack atual (React 19 + Vite + TS na app)
- performance: imagens lazy, webp, sem vídeo de placeholder
- SEO: title e meta description próprios, og:image com uma foto da linha

## Fora de escopo
- não incluir especialistas, cachês, comissão nem números internos
- não incluir nome de campanha travado além de "antes do sim" no hero (fácil de trocar por variável)
- não construir e-commerce nem carrinho

## Pendências para o Dani confirmar depois
- se "antes do sim" fica ou vira outro nome
- copy final de cada bloco (o texto acima é rascunho aprovável)
- se a linha já tem página de produto no jescri.com.br para linkar
