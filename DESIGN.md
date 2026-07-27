# o livro da dodô — Design System do Criativo Dodô

> Fundação de marca e Design System do Criativo Dodô, extraído do código real da Landing (`app/src`) em 26 de julho de 2026. Documento vivo — não invente o que o código ainda não decidiu; marque como pendência. Revise contra o código antes de confiar em qualquer valor aqui, sempre que o tempo tiver passado.
>
> Versão HTML, navegável e com busca: `design-system/index.html`.

**v1.0 · fonte: `app/src` · criativo dodô**

---

## Sumário

**Parte I — Identidade**
1. [Manifesto](#01-manifesto)
2. [História e posicionamento](#02-história-e-posicionamento)
3. [Personalidade e princípios](#03-personalidade-e-princípios)
4. [Como pensamos](#04-como-pensamos)
5. [Como escrevemos, como falamos](#05-como-escrevemos-como-falamos)
6. [O que nunca fazemos](#06-o-que-nunca-fazemos)
7. [Branding, produto e engenharia](#07-branding-produto-e-engenharia)

**Parte II — Fundação visual**
8. [Fundamentos da marca](#08-fundamentos-da-marca)
9. [Cor](#09-cor)
10. [Tipografia](#10-tipografia)
11. [Layout e ritmo](#11-layout-e-ritmo)
12. [Motion](#12-motion)

**Parte III — Componentes e padrões**
13. [Componentes de hoje](#13-componentes-de-hoje)
14. [Padrões](#14-padrões)
15. [Temas de produto](#15-temas-de-produto)

**Parte IV — Engenharia e governança**
16. [Engenharia](#16-engenharia)
17. [Governança do documento](#17-governança-do-documento)
18. [Roadmap](#18-roadmap)
19. [Pendências encontradas](#19-pendências-encontradas)

---

## Parte I — Identidade

### 01 · Manifesto

> marcas não precisam de mais posts. precisam de direção.

a dodô é um estúdio de direção de marca. não vende volume, vende critério. o trabalho começa antes do conteúdo: começa em decidir o que uma marca defende, como ela aparece e por que isso importa para quem a encontra pela primeira vez ou pela décima.

**o que este documento é.** este é o Design System do Criativo Dodô — a fundação visual e de identidade que sustenta tudo o que a marca constrói, hoje e daqui a dez anos. ele não nasce de uma ideia de como a dodô deveria ser. nasce do que a dodô já é, lido diretamente do produto em produção: o código da landing, os tokens que ele usa, os arquivos de marca que carrega.

onde o código já decidiu algo, este livro documenta a decisão e explica o porquê. onde o código ainda não decidiu, este livro diz isso com todas as letras, em vez de inventar uma regra para parecer completo. um Design System que finge ter resposta para tudo é menos útil do que um que admite onde ainda não chegou.

**para quem este livro fala.** para quem desenha a próxima tela. para quem escreve o próximo componente. para o agente de IA que vai gerar código a partir de um pedido em linguagem natural e precisa saber, sem perguntar, que cor é ação e que cor é fundo. para quem entra na dodô daqui a três anos e precisa entender, em uma tarde, por que as coisas são como são.

**como ler.** quatro partes: identidade (quem a dodô é e como pensa, antes de qualquer pixel), fundação visual (cor, tipografia, layout, motion), componentes e padrões (o que já foi construído), engenharia e governança (como este documento se mantém vivo). leia em ordem na primeira vez; depois, use o sumário como índice de consulta.

### 02 · História e posicionamento

**de estúdio elã a criativo dodô.** o projeto nasceu com o nome técnico "TEAR" e a marca comercial "Estúdio Elã", operando o produto "ELÃ | influência". em 2026, o responsável decidiu aposentar os dois — codinome técnico e marca comercial — e unificar tudo sob um único nome: **Criativo Dodô** (ADR formal, definitiva; "TEAR" e "Estúdio Elã" só aparecem descrevendo histórico).

isso é o primeiro princípio prático deste Design System: identidade não é só visual, é também consistência de nomeação. um projeto que se chama uma coisa no código e outra na conversa com o cliente já começou fragmentado.

**quem é a dodô.** agência de direção de marca fundada em 2025, focada em moda e lifestyle. Dani, fundador, foco em branding, posicionamento, conteúdo e automação; Gabi, sócia, foco em PR, marketing de influência e ativação de marca. a dodô não entrega um documento e sai — acompanha, revisita o planejamento, ajusta o foco conforme o negócio do cliente muda.

**o problema que ela resolve.** a maioria das marcas não sofre por falta de conteúdo. sofre por falta de direção: publica sem saber por que aquela peça específica existe, escolhe influenciadora pelo alcance em vez de pelo encaixe, produz campanha sem fio condutor real. a dodô entra antes da produção, na decisão de o que dizer, como dizer e onde aparecer.

**dois registros do mesmo posicionamento.** o material operacional interno descreve o posicionamento como *"marcas não precisam de mais posts, precisam de direção"*, tagline *"estratégia de marca, conteúdo e influência com intenção"*. a landing em produção, mais recente, abre com uma variação mais curta: *"marcas não precisam de fórmula. precisam de norte."* as duas dizem a mesma coisa com palavras diferentes — isso não é inconsistência a corrigir às pressas, é evidência de que o posicionamento evolui e a landing é o registro mais recente. **a versão do código é a que vale para qualquer trabalho novo.**

**arquitetura de serviço.** o material interno organiza o trabalho em três pilares e oito módulos (fundação, desejo, relacionamento). a landing simplifica para três frentes: **branding**, **direção criativa e produção de campanhas**, **gestão de marketing de influência**. escolha editorial válida para um primeiro contato — mas quem escreve a próxima peça precisa saber que existem dois níveis de detalhe.

### 03 · Personalidade e princípios

a dodô é uma marca premium. mas premium, aqui, não é sinônimo de ostentação.

| premium não é | premium é |
|---|---|
| luxo ostentatório, dourado, glass/glow, gradiente exagerado, excesso | clareza, inteligência, refinamento, ritmo, silêncio visual, tipografia excelente, hierarquia excelente |

**critério de qualidade.** toda decisão nova deve passar por: *isto parece um template, ou parece uma decisão que nasceu da dodô?* se a resposta for "template", a decisão volta para a mesa.

**disciplina com o vermelho.** a identidade carrega bastante Cherry Red — isso exige disciplina, não repetição automática. a cor principal não domina a interface por padrão, tem intenção. a landing alterna blocos de fundo claro (Cotton) com blocos vermelhos (Cherry ou Maroon), nunca os dois competindo na mesma dobra. pergunte sempre **quando não usar vermelho** antes de perguntar onde usar — em produtos de uso contínuo (portal, dashboard), grandes áreas vermelhas cansam o olho ao longo de uma sessão de trabalho; numa peça institucional pontual, o impacto editorial compensa. ver [temas de produto](#15-temas-de-produto).

**processo de decisão.** ordem de prioridade: **clareza** antes de impacto, **consistência** antes de novidade, **o que já existe no código** antes de uma ideia nova.

### 04 · Como pensamos

**design.** começa pela leitura, não pela referência. a mesma leitura que a dodô faz para os clientes é a leitura que aplica a si mesma: o que a marca já sustenta e o que ela ainda não consegue nomear. uma tela nova nasce de releitura do que já está em produção, não de um mood board solto.

**produto.** a dodô não entrega um documento e sai — o mesmo vale para produto. cada tela nova (login, portal, dashboard) herda o sistema de tokens e o ritmo já validados na landing, em vez de recomeçar do zero.

**interface.** é onde a estratégia vira algo que se toca. a landing não usa cards, não usa sombras, não usa grade de módulos genéricos — usa seções editoriais de altura inteira, alternância clara/vermelho, e um único acordeão como mecanismo interativo. não é limitação técnica, é a mesma disciplina de "menos, com mais critério" aplicada à interface.

**branding.** a marca não é o logotipo. é a coerência entre o que a dodô diz, o que entrega e como aparece em cada ponto de contato. um Design System bem escrito é, ele mesmo, prova de branding bem feito: se este documento não parecer ter sido escrito pela dodô, o branding falhou antes mesmo do primeiro token.

### 05 · Como escrevemos, como falamos

direto, específico, sem ornamento. soa como alguém que domina o que faz sem precisar provar. o valor inegociável é a especificidade — cada palavra tem endereço.

**caixa e pontuação.** caixa baixa como padrão em todo conteúdo digital — maiúscula só em nomes próprios, siglas e títulos operacionais. ponto final, vírgula, dois pontos; sem exclamação salvo exceção específica. **sem travessão em nenhum contexto.** sem reticências, nunca.

**ritmo.** frase curta e longa alternadas — a variação cria respiração. parágrafos de no máximo duas ou três linhas. uma linha isolada funciona como virada ou aterramento:

> a dodô não entrega um documento e sai.
>
> fica.

**abertura, metáfora, fechamento.** abre com afirmação direta, nunca com pergunta como gancho. metáforas domésticas e concretas, com endereço físico. fechamentos não resumem, não fazem moral, não terminam em entusiasmo — param numa afirmação que não precisa de conclusão.

| bom fechamento | fechamento banido |
|---|---|
| "isso fica com quem entende de marca." ou a última ideia, sem amarração | "e é assim que fazemos a diferença." resumo, moral, CTA no corpo do texto, pergunta retórica |

**vocabulário banido.** incrível, poderoso, transformador, revolucionário, jornada, propósito, inspiração, inovação, impacto, empoderamento, "no mundo de hoje", "vale ressaltar", crucial, pivotal. também: negrito mecânico, emoji decorativo, adjetivo vago antes de substantivo, "não é x, é y".

**"a gente" vs. "eu".** conteúdo de marca geral: primeira pessoa do plural. conteúdo autoral do fundador: primeira pessoa do singular. nunca misturar sem intenção clara.

### 06 · O que nunca fazemos

**a lição das três gerações de Design System.** antes deste documento, o projeto passou por três gerações de identidade visual em sequência, cada uma nomeada formalmente como fonte de verdade e cada uma abandonada: um sistema pré-rebranding vermelho-vinho serifado; uma paleta roxo-primária revertida no mesmo dia da aprovação; um import de paleta laranja/roxo copiado manualmente para o código. nenhuma, isoladamente, era fiel ao que estava de fato em produção.

a lição não é sobre cor — é sobre processo: **documentar identidade sem checar contra o código real produz documentação que mente.** este livro existe para não repetir esse erro.

**erros comuns já cometidos, com honestidade:**
- uma classe CSS chamada `.acumin-bold` aplica peso 800 em texto hoje renderizado em Elms Sans — o nome referencia uma fonte ("Acumin") fora do sistema atual, resquício provável de ferramenta de design anterior.
- o vídeo e a imagem estática do hero são, por comentário literal do próprio script de setup, um *"placeholder, origem Estúdio Elã"* — conteúdo de marca anterior, ainda no ar na peça mais visível do site.

| nunca fazemos | sempre fazemos |
|---|---|
| redesenhar o logotipo em vez de recolorir os arquivos oficiais; inventar token porque "parece que deveria existir"; deixar vermelho dominar uma tela de uso contínuo; title case/caixa alta em título; travessão ou reticências | extrair do código antes de propor; marcar "não definido" o que não está definido; checar decisão nova contra este livro; perguntar "isso parece um template?" antes de aprovar |

### 07 · Branding, produto e engenharia

branding decide o quê e o porquê. produto decide onde. engenharia decide como. o caminho mais curto hoje: os valores de cor da landing já nascem como variáveis CSS (`--color-cotton`, `--color-cherry`, `--color-maroon`, `--color-noir`), não como valores soltos repetidos — Design System funcionando na prática, mesmo sem ferramenta de tokens formal (tipografia e espaçamento ainda não seguem o mesmo padrão, ver [pendências](#19-pendências-encontradas)).

**quando um documento de marca some do código.** há um precedente relevante: uma ADR (ADR-019) nomeou formalmente um "Manual de Design Dodô v1.0", paleta laranja-primária, como fonte única de verdade visual. o código hoje implementa uma paleta completamente diferente (Cherry Red/Cotton/Maroon/Noir Black), sem ADR nova revogando a anterior. não é um erro deste livro a corrigir — é um fato a registrar: a documentação de arquitetura ficou para trás do produto real, e a régua de qual documento vale é sempre o código em produção.

---

## Parte II — Fundação visual

### 08 · Fundamentos da marca

três ativos de identidade, cada um com uma função — a mesma distinção que a Nike faz entre o nome escrito e o swoosh.

| ativo | arquivo · viewBox | função | em uso hoje? |
|---|---|---|---|
| **Wordmark** | `principal.svg` (noir `#1d1c1a`) / `principal-cherry.svg` (cherry `#810100`) · `0 0 507 193.8` | assinatura institucional — a marca por extenso | sim, variante cherry, no header da landing (`Hero.tsx`). variante noir existe mas não está importada em nenhum lugar |
| **Marca secundária** | `secundario.svg` · `0 0 123.5 133.6` | lockup compacto em grade (D/O/D/Ô), para formatos quadrados | não — arquivo pronto, sem aplicação hoje |
| **Emblema** | `icon.svg` · `0 0 116.2 127.2` | o símbolo sozinho, um anel com acento circunflexo — o "Ô" isolado | indiretamente — `app/public/favicon.svg` usa esta geometria, recolorida em cherry |

**técnica.** as duas variantes de cor do wordmark são dois arquivos SVG distintos com fill fixo, não um único arquivo recolorível via `currentColor` — a mesma geometria duplicada em disco (ver pendências).

**o que ainda não está definido.** não existe regra escrita de área de proteção mínima, tamanho mínimo de reprodução, ou critério fechado de quando usar mono vs. emblema. os três ativos existem e têm função clara; a régua de aplicação caso a caso ainda depende de critério editorial. não invente uma regra aqui.

### 09 · Cor

| token | hex | papel | onde aparece hoje |
|---|---|---|---|
| `--color-cotton` | `#edebdd` | fundo neutro, e "branco" sobre fundo escuro | fundo do site, texto dentro das seções vermelhas, seleção |
| `--color-cherry` | `#810100` | ação, ênfase, fundo de seção | nav, títulos editoriais, fundo de "o que fazemos", botão CTA |
| `--color-maroon` | `#630000` | variação mais escura do vermelho | única aparição: fundo da seção "café" |
| `--color-noir` | `#1b1717` | texto padrão, fundo do hero | cor de texto do body, fundo do vídeo do hero |

não existe uma quinta cor "branco" separada — Cotton cumpre os dois papéis porque não é um branco puro, é um branco quente, o mesmo em qualquer contexto. decisão real do código, não omissão.

**a disciplina da alternância.** a landing não mistura vermelho e claro na mesma seção — alterna seções inteiras: claro → vermelho → claro → maroon. cada seção é 100% de uma cor de fundo, nunca degradê ou mistura. não existe hoje nenhum botão, ícone ou badge vermelho sobre fundo cotton — vermelho é sempre seção inteira, nunca destaque pontual.

> **nota técnica.** `.accordion-item` usa `border-bottom: rgba(237, 235, 221, 0.3)` — numericamente `--color-cotton` a 30% de opacidade, mas escrito como literal, não `var()`. o mesmo padrão aparece em `Hero.tsx`, com `stroke="#1b1717"` hardcoded no SVG da seta em vez de referenciar `--color-noir`. nenhum dos dois é bug visual, mas um ajuste futuro de paleta exigiria busca manual em vez de edição de variável.

> **apêndice — paleta histórica, não usar.** uma geração anterior definiu laranja `#f14f28` (ação) e roxo `#504ea1` (secundária), documentada em ADR nunca revogada. não existe em nenhuma linha do código hoje. citado aqui só para não ser confundido com a identidade atual.

### 10 · Tipografia

duas fontes variáveis (`font-weight: 100 900` no `@font-face`), papéis bem separados:

- **Work Sans** — `--font-display`. peso 800 em títulos editoriais e ênfase forte (`.acumin-bold`), 700 no botão, 600 no título de acordeão.
- **Elms Sans** — `--font-body`. peso 400 no corpo base e links de rodapé, 300 nos parágrafos de seção, 600 na navegação.

só cinco pesos são de fato usados: 300, 400, 600, 700, 800. nenhum peso entre 100–299, nem 500, nem 900.

**escala real (não é token, é literal repetido por seletor):**

| papel | desktop | ≤768px | peso | onde |
|---|---|---|---|---|
| título de seção | 38.4px | 28.8px | 800 | sobre nós, o que fazemos, metodologia, café |
| título de acordeão | 20.8px | 17.6px | 600 / 800 hover | serviços |
| ícone do acordeão | 32px | 28px | 300 | serviços |
| corpo/nav | 15.3px | 13.6px | 300 / 600 (nav) | nav, sobre nós, metodologia, café |
| botão | 15px | 15px | 700 | café (CTA) |
| rodapé/links | 16px | 16px | 400 | café |

a razão desktop→mobile gira perto de 0.75 na maioria dos papéis, mas não está escrita como fórmula em lugar nenhum — trate como observação, não regra a aplicar cegamente a um tamanho novo.

> **a classe que carrega o nome errado.** `.acumin-bold` aplica peso 800 em ênfase dentro de parágrafos. o nome referencia "Acumin", fonte que não existe no sistema atual — provável resquício de ferramenta de design anterior (Acumin Pro é padrão de novos arquivos no Illustrator/XD). funciona hoje porque CSS não valida nomes de classe contra fontes reais.

### 11 · Layout e ritmo

um único container em toda a landing — `.container { max-width: 1026px; margin: 0 auto }`. dois breakpoints em todo o CSS: `1100px` (empilha a grade de "sobre nós", ajusta padding lateral) e `768px` (reduz tipografia/espaçamento). nenhum terceiro ponto de corte.

respiro entre seções: `140px` desktop, `80px` mobile — mesmo valor em toda seção clara ou vermelha, pulso único do início ao fim. **nenhum `display: grid` em todo o CSS** — tudo é flexbox. "sobre nós" usa duas colunas de largura fixa (320px/496px) que colapsam a 100% abaixo de 1100px.

| existe | não existe |
|---|---|
| seções full-bleed de altura própria, container único de leitura, alternância clara/vermelho como unidade de composição | cards, grades de módulos repetidos, sombras, qualquer `border-radius` além do botão (24px, único valor de raio no projeto) |

### 12 · Motion

toda animação vive em um único arquivo, `app/src/useLandingAnimations.ts` (GSAP + ScrollTrigger), chamado uma vez em `App.tsx`. seções só marcam via classe (`.gsap-fade`, `.stagger-item`, `.stagger-group`) ou id (trigger) o que deve acontecer.

| efeito | duração | ease | disparo |
|---|---|---|---|
| entrada do header | 1.5s, stagger 0.1 | power2.out | ao montar, delay 0.3s |
| parallax do hero | scrub contínuo | none | scroll de `.hero` |
| parallax de "o que fazemos" | scrub contínuo | none | scroll de "metodologia" entrando |
| fade individual (`.gsap-fade`) | 1.4s | power2.out | elemento a 85% da viewport, uma vez |
| stagger de grupo | 1.2s, stagger 0.2 | power2.out | grupo a 80%, uma vez |
| entrada dos links de rodapé | 1.5s, stagger 0.15 | power2.out | rodapé a 90%, uma vez |

todo conteúdo revelado usa `toggleActions: "play none none none"` — toca uma vez, não reverte ao rolar para cima. as únicas exceções são os dois parallax, com `scrub: true`.

> **gap real de acessibilidade.** não existe nenhum tratamento de `prefers-reduced-motion`, nem em CSS nem em JS. todo visitante recebe as mesmas animações. gap real do código atual, não decisão de marca — qualquer implementação nova de motion deveria fechar essa lacuna, não repeti-la.

---

## Parte III — Componentes e padrões

### 13 · Componentes de hoje

não existe hoje uma biblioteca de componentes reutilizável — não há `Button`, `Badge` ou `Card` genérico. existe uma landing de página única, cinco seções fixas montadas em `App.tsx`, todas em classes globais de `index.css` (nenhum CSS Module em todo o projeto). estado real e honesto de um produto que, até aqui, teve uma única tela para construir.

```
<main className="home">
  <Hero />
  <SobreNos />
  <Servicos />
  <Metodologia />
  <Cafe />
</main>
```

**Hero** (`Hero.tsx`) — abertura full-screen: vídeo de fundo, logo, nav, indicador de scroll. sem hooks de estado. assets: wordmark cherry, `/hero-video.mp4` + `/hero-poster.jpg` (placeholder herdado, ver pendências). motion: fade+slide do logo/nav ao montar, parallax scrub do vídeo, fade do indicador ao entrar em viewport.

**SobreNos** (`SobreNos.tsx`) — manifesto em duas colunas, título curto à esquerda, três parágrafos à direita. sem estado. motion: título com fade individual, parágrafos em stagger (0.2s). responsivo: colunas fixas (320px/496px) empilham abaixo de 1100px.

**Servicos** (`Servicos.tsx`) — os três serviços como acordeão exclusivo sobre fundo cherry. `useState(0)` guarda o índice aberto (primeiro item começa aberto); clicar no aberto fecha tudo (`-1`); clicar em outro fecha o anterior e abre o novo — nunca dois abertos. cada item usa `useRef`+`useEffect` para animar `max-height` a partir de `scrollHeight`. entrada em stagger; abrir/fechar é transição CSS pura (0.6s), não GSAP.

**Metodologia** (`Metodologia.tsx`) — método de trabalho, alinhado à direita sobre fundo claro. sem estado. é o *gatilho* do parallax da seção anterior (Servicos). responsivo: alinhamento inverte de direita para esquerda abaixo de 768px.

**Cafe** (`Cafe.tsx`) — CTA final + rodapé. sem estado. única seção em `--color-maroon` (não cherry). links: WhatsApp (CTA e "contato"), Instagram, Spotify, Pinterest. copyright fixo em "2022", sem indicação de placeholder no código.

### 14 · Padrões

- **navegação à esquerda** — logo e menu empilhados no canto superior esquerdo, nunca centralizados ou à direita.
- **seção como unidade de cor** — `.section-light`/`.section-red`/`.tone-maroon` é o padrão estrutural mais importante: cada seção é uma decisão de cor inteira.
- **revelação por scroll como padrão** — toda seção entra via `.gsap-fade` ou stagger, sem exceção (fora o hero, visível no load).
- **CTA único por seção** — exatamente um botão em toda a landing (`.btn-agendar`, em "café"). nenhuma seção compete com dois CTAs simultâneos.
- **link externo como saída consciente** — "área do cliente" aponta para `portal.criativododo.com.br`, fora deste repositório: o Portal é hoje uma aplicação separada.

### 15 · Temas de produto

a identidade não muda de produto para produto — muda o quanto ela ocupa a tela.

| produto | presença institucional | implementado hoje? |
|---|---|---|
| landing | alta — grandes áreas de vermelho aceitáveis, peça institucional pontual | sim, único produto neste repositório |
| portal (influenciadora) | moderada — vermelho pontua, não domina uma tela recorrente | não — vive em `portal.criativododo.com.br`, não auditado aqui |
| dashboard (equipe) | neutra — marca aparece por tipografia e voz, não área vermelha | não implementado neste repositório |
| admin | mínima interferência — a interface de trabalho não compete com o trabalho | não implementado neste repositório |

**por que isso importa antes de existir código.** é tentador copiar a landing inteira para o portal quando ele for construído. o princípio existe para impedir isso: uma tela usada por horas todos os dias não pode ter o peso visual de uma peça vista uma vez para decidir se entra em contato. a identidade é a mesma; a dose muda.

---

## Parte IV — Engenharia e governança

### 16 · Engenharia

| peça | escolha |
|---|---|
| framework | React 19 + TypeScript, via Vite |
| estilo | CSS global único (`app/src/index.css`) — nenhum CSS Module, CSS-in-JS ou Tailwind |
| motion | GSAP + ScrollTrigger, orquestrado em um hook único |
| lint | ESLint (flat config), `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh` |

escolha deliberadamente mínima para uma página institucional única: sem gerenciador de estado, sem roteador. quando o produto ganhar mais de uma rota, essa simplicidade deixa de ser suficiente — não é padrão a preservar a qualquer custo.

**pipeline de assets.** `design-system/` na raiz é a origem — fontes e os três SVGs de marca na forma canônica (noir). `scripts/setup-assets.sh` copia, idempotente, fontes para `app/public/fonts/` e SVGs para `app/src/assets/brand/`, gera a variante cherry do wordmark e posiciona o emblema recolorido como `app/public/favicon.svg`. vídeo/poster do hero vêm de um caminho externo de referência, comentado como placeholder.

**o que ainda não está conectado.** sem Tailwind, Storybook, Figma, Claude Design ou MCP de design para este front-end hoje — não é falha, é o estado real de um produto de página única. conectar essas ferramentas faz sentido quando houver mais de uma tela e mais de uma pessoa decidindo sobre componentes ao mesmo tempo.

### 17 · Governança do documento

**a regra de ouro.** nenhum valor deste documento deveria ser confiado sem checagem contra o código, passado tempo suficiente. este livro nasceu de auditoria direta ao CSS e TSX em produção, não de um documento anterior. quem atualizar este livro deve fazer o mesmo.

**quando este documento muda.** uma decisão de marca nova é registrada aqui só depois de existir em produção. uma mudança de arquitetura visual relevante merece um ADR próprio antes de refletida aqui. pendências resolvidas saem da lista; novas entram — se a lista só cresce e nunca esvazia, é sinal de que ninguém está agindo sobre ela.

**quem decide.** decisões de identidade são do responsável pelo projeto — nem este livro, nem um agente de IA, inventa regra nova de marca. decisões de documentação podem ser refinadas por quem mantém o documento, desde que editorial, não identidade disfarçada de reorganização.

### 18 · Roadmap

- **próximo** — **login**, herdando tokens de cor e tipografia já validados, sem reabrir decisão de paleta.
- **próximo** — **tokenizar tipografia e espaço**: hoje são literais repetidos por seletor; deveriam virar variáveis CSS antes que uma segunda tela precise delas de novo.
- **médio prazo** — **portal da influenciadora**, presença institucional moderada (ver [temas de produto](#15-temas-de-produto)) — não é a landing recolorida.
- **médio prazo** — **dashboard e admin da equipe**, presença neutra e mínima — maior risco: reaproveitar componentes institucionais em tela de uso contínuo.
- **médio prazo** — **fechar o gap de `prefers-reduced-motion`** antes de multiplicar telas com GSAP.
- **quando necessário** — **extrair biblioteca de componentes**, só quando existir uma segunda tela, com intenção — não abstrair em cima de uma amostra de um produto só.

### 19 · Pendências encontradas

1. **o hero mostra um placeholder, não conteúdo original** — vídeo e imagem estática vêm, por comentário literal do script de setup, de "origem Estúdio Elã". a peça mais visível do site ainda carrega placeholder herdado.
2. **ADR de paleta desatualizada, sem revogação formal** — uma ADR nomeia laranja/roxo como fonte de verdade visual; o código implementa Cherry Red/Cotton/Maroon/Noir Black. nenhuma ADR nova documenta a mudança.
3. **marca secundária e emblema noir sem aplicação definida** — só o wordmark cherry (header) e o emblema recolorido (favicon) estão de fato em produção.
4. **tipografia e espaçamento não são tokens, são literais** — diferente da cor (quatro variáveis CSS), toda escala tipográfica/espaçamento é reescrita por seletor.
5. **nenhum tratamento de `prefers-reduced-motion`** — todo visitante recebe as mesmas animações GSAP.
6. **wordmark duplicado como dois arquivos, não recolorível** — cherry e noir são dois SVGs com fill fixo, não um arquivo com `currentColor`.

**apêndice — notas técnicas menores:**

| achado | onde |
|---|---|
| `.acumin-bold` não corresponde a nenhuma fonte do sistema atual | `index.css`, usada em Metodologia/Café |
| borda do acordeão usa `rgba(237,235,221,.3)` literal em vez de `var(--color-cotton)` | `.accordion-item` |
| seta do indicador de scroll usa `stroke="#1b1717"` inline | `Hero.tsx` |
| copyright do rodapé fixo em "2022", sem indicação de placeholder | `Cafe.tsx` |
| 15 ícones de dashboard/portal em `design-system/icons/` sem uso na landing | `design-system/icons/` |
| `app/README.md` ainda é o boilerplate padrão do template Vite | `app/README.md` |

---

*Design System do Criativo Dodô, extraído do código em produção em 26 de julho de 2026. Documento vivo — revisar contra o código antes de confiar em qualquer valor aqui.*
