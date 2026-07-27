# FRONTEND_PHILOSOPHY.md

> manifesto de engenharia de frontend do Criativo Dodô. não explica React, não explica CSS,
> não explica TypeScript — explica como a dodô pensa interface, para que qualquer skill ou
> agente que gere UI para este projeto pense do mesmo jeito sem precisar reler tudo de novo.
>
> escrito em 2026-07-26, a pedido do responsável do projeto, para ser consultado por skills
> globais de frontend do Claude Code (`frontend-design`, `vercel-react-best-practices` e
> futuras skills de UI/UX) antes de qualquer geração de componente para este repositório.
>
> **este documento não decide identidade nova.** identidade é decisão do responsável do
> projeto, registrada em ADR (`knowledge/ARCHITECTURAL_DECISIONS.md`) e em `DESIGN.md` (raiz
> do repositório). aqui está só o raciocínio — o "como pensamos" que já rege a Landing
> (`app/`) e que qualquer tela nova deve herdar, nunca reinventar.

---

## 1. Filosofia da marca

a dodô é um estúdio de direção de marca. não vende volume, vende critério. o trabalho de
qualquer interface que a dodô assina começa antes do primeiro componente: começa em decidir
o que essa tela defende, como ela aparece e por que isso importa para quem a usa pela
primeira vez ou pela centésima.

**como a interface deve fazer quem usa se sentir.** segura, no lugar certo, sem esforço para
entender o que fazer a seguir. nunca impressionada à força — a dodô é premium, mas premium
aqui não é ostentação. é clareza, inteligência, refinamento, ritmo, silêncio visual,
tipografia excelente, hierarquia excelente. o oposto de premium não é "barato": é excesso,
gradiente exagerado, glass/glow gratuito, dourado, ruído.

**o teste de qualquer decisão nova.** *isto parece um template, ou parece uma decisão que
nasceu da dodô?* se a resposta for "template", a decisão volta para a mesa antes de virar
código.

**valores que a interface transmite:** direção acima de volume; critério acima de tendência;
coerência entre o que a marca diz, o que entrega e como aparece em cada tela — um componente
que não parece ter nascido na dodô é uma falha de branding antes de ser uma falha visual.

## 2. Princípios de design

- **simplicidade acima de decoração.** a Landing não usa card, não usa sombra, não usa grade
  de módulos genéricos — usa seções inteiras de uma cor, um único mecanismo interativo
  (acordeão), um único botão. menos, com mais critério.
- **clareza acima de efeitos.** nenhum efeito visual existe para chamar atenção sobre si
  mesmo; existe para tornar uma hierarquia mais óbvia.
- **tipografia como protagonista.** Work Sans (display, peso 800 em título editorial) e Elms
  Sans (corpo) carregam a maior parte do peso visual — não gradiente, não ilustração solta.
- **espaço em branco é elemento de design.** o respiro entre seções (140px desktop / 80px
  mobile na Landing) é tão deliberado quanto qualquer cor — nunca preencher espaço vazio "porque
  parece pouco".
- **movimento deve comunicar.** toda animação da Landing tem um porquê (revelar hierarquia ao
  rolar, indicar profundidade via parallax) — nunca anima por animar. ver §5.
- **identidade antes de tendência.** um padrão comum de mercado (dashboard SaaS genérico,
  glassmorphism, ilustração 3D) não entra só porque está em alta — entra se servir ao que a
  dodô já é.
- **processo de decisão, em ordem:** clareza antes de impacto; consistência antes de
  novidade; o que já existe no código antes de uma ideia nova.

## 3. Fonte oficial

**a Landing implementada em `app/` é a implementação oficial do Design System do Criativo
Dodô** (ADR-001, `knowledge/ARCHITECTURAL_DECISIONS.md`). identidade visual, componentes,
tipografia, paleta, espaçamento, motion e linguagem de interface vêm de lá — do código real
em `app/src`, não de um documento isolado.

`design-system/index.html` e `DESIGN.md` (raiz do repositório) são documentação auxiliar,
derivada do código numa sessão anterior — riquíssima como referência de leitura (é onde
estão os valores exatos de cor, tipografia, layout e motion), mas nunca a fonte primária.
**em qualquer divergência entre a Landing e qualquer documento, a Landing prevalece.**

**a régua de qualquer componente novo:** ele deveria parecer que sempre pertenceu à Landing.
Se alguém abrir o componente novo ao lado de `Hero.tsx` ou `Servicos.tsx` e sentir que são de
produtos diferentes, a implementação errou — não o julgamento de quem está comparando.

Nunca criar uma identidade visual paralela porque "esta tela é diferente" ou "este produto
tem outro público". Ver §9 sobre como o Portal se relaciona com a Landing.

## 4. Componentes

todo componente novo nasce por extração, nunca por invenção:

- **reutilizar tokens existentes** — `--color-cotton`, `--color-cherry`, `--color-maroon`,
  `--color-noir` (ver `app/src/index.css`). não criar uma quinta cor, um "cinza neutro de
  UI" ou uma variação de opacidade nova só porque um componente novo "pede".
- **reutilizar tipografia** — Work Sans para display/ênfase, Elms Sans para corpo. os cinco
  pesos já em uso (300, 400, 600, 700, 800) cobrem qualquer hierarquia nova; não introduzir
  peso 500 ou 900 "porque ficou melhor".
- **reutilizar grid** — um único container de leitura (`max-width: 1026px`), dois
  breakpoints (`1100px`, `768px`). não inventar um terceiro breakpoint ou um sistema de grid
  paralelo (a Landing inteira é flexbox — nenhum `display: grid`).
- **reutilizar espaçamento** — o ritmo de seção (140px/80px) e o único valor de raio de borda
  do projeto (24px, hoje só no botão) são a escala real. um valor de espaçamento novo deve
  soar como o mesmo idioma, não como uma unidade importada de outro sistema.
- **reutilizar linguagem visual** — seção como unidade de cor inteira (nunca vermelho como
  destaque pontual sobre fundo claro), navegação à esquerda, um CTA por tela.

**evitar componentes genéricos.** não existe hoje uma biblioteca de `Button`/`Card`/`Badge`
reutilizável na Landing — e isso é honesto, não uma lacuna a preencher às pressas com
componentes de prateleira. quando uma tela nova precisar de um botão, o ponto de partida é
`.btn-agendar` (ou seu equivalente já extraído para o Portal, `.btn-primary` em
`portal-frontend/src/index.css`), não um componente de design system genérico importado de
outro projeto.

## 5. Motion

toda a animação da Landing vive num único lugar (`app/src/useLandingAnimations.ts`, GSAP +
ScrollTrigger) e segue o mesmo vocabulário: fade + leve deslocamento vertical ao entrar na
viewport (`power2.out`, ~1.2-1.5s), stagger discreto entre itens de um grupo, parallax sutil
e contínuo (`scrub`) para profundidade — nunca bounce, nunca elastic, nunca algo que chame
atenção para si mesmo em vez de para o conteúdo.

- **animações discretas.** se a animação for a primeira coisa notada, ela é forte demais.
- **microinterações funcionais.** hover de link sublinha e engrossa o peso da fonte — a
  interação confirma um estado, não decora um clique.
- **nunca animar por animar.** todo efeito de entrada da Landing acontece uma vez
  (`toggleActions: "play none none none"`), nunca reverte ao rolar de volta — não é
  espetáculo, é revelação de hierarquia.
- **performance acima de efeitos.** uma animação que trava scroll ou atrasa interação perde
  para uma tela parada.

**gap real, não repetir.** a Landing hoje não trata `prefers-reduced-motion` — todo mundo
recebe a mesma animação, o que é uma lacuna de acessibilidade conhecida, não uma escolha de
marca. qualquer motion novo (Portal incluído) deve fechar esse gap, nunca copiá-lo.

## 6. Responsividade

para produtos de uso contínuo como o Portal, o ponto de partida é **mobile first** — a tela
nasce pensada para a influenciadora conferindo uma pendência ou o financeiro pelo celular, e
o desktop é a expansão dessa mesma tela, nunca uma composição diferente desenhada à parte.
Isso não contradiz a Landing (que nasceu desktop-first, como peça institucional vista uma
vez) — reflete a mesma disciplina de "dose certa para o contexto" (ver §9, Temas de produto).

**nunca duas interfaces diferentes.** o mesmo componente se redimensiona e reflui — não
existe uma versão mobile com informação a menos ou uma versão desktop com decoração a mais
que a versão pequena não tem. quando algo precisa mudar de mobile para desktop (como o
`norte-grid` da Landing empilhando abaixo de 1100px), é reflow de layout, não um componente
diferente.

## 7. Acessibilidade

todo componente novo — Portal ou Landing — deve considerar, antes de ser dado como pronto:

- **contraste** — checar contra os tokens reais (`--color-cherry` sobre `--color-cotton` já
  é alto contraste; qualquer combinação nova precisa da mesma checagem, não da suposição de
  que "cor da marca sempre funciona").
- **foco** — todo elemento interativo precisa de estado de foco visível e navegável por
  teclado, mesmo quando o design não pediu explicitamente um anel de foco.
- **teclado** — nenhuma interação (acordeão, formulário, navegação) pode depender
  exclusivamente de mouse/toque.
- **leitores de tela** — texto alternativo real em imagem com informação, não decorativo
  preenchido com o nome do arquivo.
- **semântica HTML** — heading em ordem, `button` para ação e `a` para navegação, nunca
  `div` com `onClick` fazendo o papel dos dois.

isso vale em dobro para o Portal: é uma tela de uso repetido, diferente da Landing (vista uma
vez para decidir um contato) — qualquer atrito de acessibilidade aqui é pago todo dia por
quem usa.

## 8. Anti-padrões

- **não usar gradiente genérico** — a Landing não tem nenhum; seção é uma cor inteira, não
  uma transição entre duas.
- **não copiar dashboard SaaS comum** — card com sombra, sidebar cinza, grade de módulos
  repetidos: nenhum desses é vocabulário da dodô hoje. antes de trazer um padrão assim para o
  Portal, perguntar se ele existe porque serve à dodô ou porque é o que todo painel parece.
- **não introduzir cor nova sem ADR** — os quatro tokens (`cotton`/`cherry`/`maroon`/`noir`)
  são a paleta inteira. uma cor nova (mesmo "só para estado de erro" ou "só para gráfico") é
  decisão de identidade, não detalhe de implementação — passa por ADR, nunca por escolha
  silenciosa de quem está codando a tela.
- **não usar componente só porque "fica bonito"** — todo componente existe para resolver uma
  necessidade de conteúdo real, não para preencher uma tela que parece vazia.
- **não criar página que pareça template** — se o resultado poderia estar em qualquer outro
  produto trocando só o logo, a implementação falhou o teste do §1.
- **não deixar vermelho dominar uma tela de uso contínuo** — Cherry pontua ação (botão,
  ênfase, título), nunca é fundo de uma tela inteira de trabalho repetido (ver §9).
- **não redesenhar o que já foi extraído** — se um token, componente ou padrão de motion já
  existe (Landing ou Portal), a tela nova reaproveita — não propõe uma variação "mais
  moderna" por conta própria.

## 9. Evolução

o Portal — e qualquer produto novo do Criativo Dodô — **expande a Landing, nunca a
substitui.** toda evolução visual deve parecer uma continuação natural da identidade
existente, nunca um recomeço.

a identidade não muda de produto para produto — muda o quanto ela ocupa a tela:

| produto | presença institucional |
|---|---|
| Landing | alta — grandes áreas de vermelho aceitáveis, peça vista uma vez |
| Portal (influenciadora) | moderada — Cherry pontua ação, não domina uma tela recorrente |
| dashboard/admin da equipe (se vier a existir) | neutra a mínima — a marca aparece por tipografia e voz, não por área vermelha |

é tentador copiar a Landing inteira para uma tela de produto quando ela for construída — o
princípio deste documento existe para impedir isso. uma tela usada por horas, todos os dias,
não pode carregar o mesmo peso visual de uma peça institucional vista uma vez para decidir se
alguém entra em contato. a identidade é a mesma; a dose muda.

## 10. Checklist

antes de dar qualquer componente ou tela nova como pronta, perguntar:

- [ ] parece que sempre pertenceu ao Criativo Dodô?
- [ ] reutiliza o Design System existente (tokens de `app/src`, não valores novos)?
- [ ] melhora a experiência de quem usa, não só a estética de quem construiu?
- [ ] respeita acessibilidade (contraste, foco, teclado, leitores de tela, semântica)?
- [ ] respeita performance (motion não trava, peso de página não incomoda)?
- [ ] respeita os tokens (cor, tipografia, espaçamento, raio) sem inventar um novo?
- [ ] respeita a Landing como fonte de verdade visual, sem criar identidade paralela?

**se qualquer resposta for "não", o componente deve ser reavaliado antes de seguir adiante.**
