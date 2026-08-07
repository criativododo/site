# o livro da dodô — Design System do Criativo Dodô

> Fundação de marca e Design System do Criativo Dodô, extraído do código real — Landing
> (`app/src`) e Portal (`portal-frontend/src`, `portal-backend`) — em 28 de julho de 2026.
> Documento vivo. Não invente o que o código ainda não decidiu; marque como pendência. Revise
> contra o código antes de confiar em qualquer valor aqui, sempre que o tempo tiver passado.
>
> Versão HTML, navegável: `design-system/index.html`.

**v2.0 · fonte: `app/src` + `portal-frontend/src` · criativo dodô**

---

## Sumário

**Parte I — Identidade**
1. [Manifesto](#01--manifesto)
2. [História e posicionamento](#02--história-e-posicionamento)
3. [Personalidade e princípios](#03--personalidade-e-princípios)
4. [Como pensamos](#04--como-pensamos)
5. [Como escrevemos, como falamos](#05--como-escrevemos-como-falamos)
6. [O que nunca fazemos](#06--o-que-nunca-fazemos)
7. [Branding, produto e engenharia](#07--branding-produto-e-engenharia)

**Parte II — Fundação visual (tokens)**
8. [Fundamentos da marca](#08--fundamentos-da-marca)
9. [Cor](#09--cor)
10. [Tipografia](#10--tipografia)
11. [Grid e espaçamento](#11--grid-e-espaçamento)
12. [Raio, borda e elevação](#12--raio-borda-e-elevação)
13. [Motion](#13--motion)
14. [Ícones](#14--ícones)
15. [Ilustração e imagem](#15--ilustração-e-imagem)

**Parte III — Componentes**
16. [Botões](#16--botões)
17. [Formulários](#17--formulários)
18. [Navegação](#18--navegação)
19. [Cards e listas](#19--cards-e-listas)
20. [Badges e estado](#20--badges-e-estado)
21. [Accordion](#21--accordion)
22. [Feedback: carregando, erro, sucesso, vazio](#22--feedback-carregando-erro-sucesso-vazio)
23. [Tabelas — proposta](#23--tabelas--proposta)
24. [Modais — proposta](#24--modais--proposta)

**Parte IV — Padrões, templates e sistema responsivo**
25. [Padrões](#25--padrões)
26. [Temas de produto](#26--temas-de-produto)
27. [Templates](#27--templates)
28. [Sistema responsivo](#28--sistema-responsivo)

**Parte V — Acessibilidade e guidelines**
29. [Acessibilidade (WCAG)](#29--acessibilidade-wcag)
30. [Guidelines de uso — do's & don'ts](#30--guidelines-de-uso--dos--donts)

**Parte VI — Engenharia e governança**
31. [Engenharia](#31--engenharia)
32. [Governança do documento](#32--governança-do-documento)
33. [Roadmap](#33--roadmap)
34. [Pendências encontradas](#34--pendências-encontradas)

---

## Parte I — Identidade

### 01 · Manifesto

> marcas não precisam de mais posts. precisam de direção.

a dodô é um estúdio de direção de marca. não vende volume, vende critério. o trabalho começa antes do conteúdo: começa em decidir o que uma marca defende, como ela aparece e por que isso importa para quem a encontra pela primeira vez ou pela décima.

**o que este documento é.** este é o Design System do Criativo Dodô — a fundação visual e de identidade que sustenta tudo o que a marca constrói, hoje e daqui a dez anos. ele não nasce de uma ideia de como a dodô deveria ser. nasce do que a dodô já é, lido diretamente do produto em produção: o código da landing e do portal, os tokens que eles usam, os arquivos de marca que carregam.

onde o código já decidiu algo, este livro documenta a decisão e explica o porquê. onde o código ainda não decidiu, este livro diz isso com todas as letras, em vez de inventar uma regra para parecer completo. um Design System que finge ter resposta para tudo é menos útil do que um que admite onde ainda não chegou.

**para quem este livro fala.** para quem desenha a próxima tela. para quem escreve o próximo componente. para o agente de IA que vai gerar código a partir de um pedido em linguagem natural e precisa saber, sem perguntar, que cor é ação e que cor é fundo. para quem entra na dodô daqui a três anos e precisa entender, em uma tarde, por que as coisas são como são.

**como ler.** seis partes: identidade (quem a dodô é e como pensa, antes de qualquer pixel), fundação visual (cor, tipografia, layout, motion, ícones), componentes (o que já foi construído, peça por peça), padrões e templates (como as peças se combinam em tela, e o sistema responsivo), acessibilidade e guidelines, engenharia e governança (como este documento se mantém vivo). leia em ordem na primeira vez; depois, use o sumário como índice de consulta.

### 02 · História e posicionamento

**de estúdio elã a criativo dodô.** o projeto nasceu com o nome técnico "TEAR" e a marca comercial "Criativo Dodô", operando o produto "ELÃ | influência". em 2026, o responsável decidiu aposentar os dois — codinome técnico e marca comercial — e unificar tudo sob um único nome: **Criativo Dodô** (ADR formal, definitiva; "TEAR" e "Criativo Dodô" só aparecem descrevendo histórico).

isso é o primeiro princípio prático deste Design System: identidade não é só visual, é também consistência de nomeação. um projeto que se chama uma coisa no código e outra na conversa com o cliente já começou fragmentado.

**quem é a dodô.** agência de direção de marca fundada em 2025, focada em moda e lifestyle. Dani, fundador, foco em branding, posicionamento, conteúdo e automação; Gabi, sócia, foco em PR, marketing de influência e ativação de marca. a dodô não entrega um documento e sai — acompanha, revisita o planejamento, ajusta o foco conforme o negócio do cliente muda.

**o problema que ela resolve.** a maioria das marcas não sofre por falta de conteúdo. sofre por falta de direção: publica sem saber por que aquela peça específica existe, escolhe influenciadora pelo alcance em vez de pelo encaixe, produz campanha sem fio condutor real. a dodô entra antes da produção, na decisão de o que dizer, como dizer e onde aparecer. o Portal DODÔ (`portal-frontend`/`portal-backend`) é a materialização de produto dessa segunda frente: gestão da colaboração mensal com influenciadoras — briefing, entrega, aprovação, pagamento.

**dois registros do mesmo posicionamento.** o material operacional interno descreve o posicionamento como *"marcas não precisam de mais posts, precisam de direção"*, tagline *"estratégia de marca, conteúdo e influência com intenção"*. a landing em produção, mais recente, abre com uma variação mais curta: *"marcas não precisam de fórmula. precisam de norte."* as duas dizem a mesma coisa com palavras diferentes — isso não é inconsistência a corrigir às pressas, é evidência de que o posicionamento evolui e a landing é o registro mais recente. **a versão do código é a que vale para qualquer trabalho novo.**

**arquitetura de serviço.** o material interno organiza o trabalho em três pilares e oito módulos (fundação, desejo, relacionamento). a landing simplifica para três frentes: **branding**, **direção criativa e produção de campanhas**, **gestão de marketing de influência**. escolha editorial válida para um primeiro contato — mas quem escreve a próxima peça precisa saber que existem dois níveis de detalhe.

### 03 · Personalidade e princípios

a dodô é uma marca premium. mas premium, aqui, não é sinônimo de ostentação.

| premium não é | premium é |
|---|---|
| luxo ostentatório, dourado, glass/glow, gradiente exagerado, excesso | clareza, inteligência, refinamento, ritmo, silêncio visual, tipografia excelente, hierarquia excelente |

**critério de qualidade.** toda decisão nova deve passar por: *isto parece um template, ou parece uma decisão que nasceu da dodô?* se a resposta for "template", a decisão volta para a mesa.

**disciplina com o vermelho.** a identidade carrega bastante Cherry Red — isso exige disciplina, não repetição automática. a cor principal não domina a interface por padrão, tem intenção. a landing alterna blocos de fundo claro (Cotton) com blocos vermelhos (Cherry ou Maroon), nunca os dois competindo na mesma dobra; o Portal, produto de uso contínuo, inverte a dose — fundo Cotton do início ao fim, Cherry pontuando ação, título e estado, nunca seção inteira (ver [temas de produto](#26--temas-de-produto), onde essa previsão de 2026-07-26 aparece confirmada pelo código real do Portal).

**processo de decisão.** ordem de prioridade: **clareza** antes de impacto, **consistência** antes de novidade, **o que já existe no código** antes de uma ideia nova.

### 04 · Como pensamos

**design.** começa pela leitura, não pela referência. a mesma leitura que a dodô faz para os clientes é a leitura que aplica a si mesma: o que a marca já sustenta e o que ela ainda não consegue nomear. uma tela nova nasce de releitura do que já está em produção, não de um mood board solto — foi assim que o Portal nasceu do CSS da Landing, variável por variável, sem reabrir a paleta.

**produto.** a dodô não entrega um documento e sai — o mesmo vale para produto. cada tela nova (login, portal, admin) herda o sistema de tokens e o ritmo já validados na landing, em vez de recomeçar do zero. `portal-frontend/src/styles/tokens.css` existe só para isso: um arquivo de quatro linhas de cor e duas de fonte, com um comentário no topo proibindo redefinição sem checar a Landing primeiro.

**interface.** é onde a estratégia vira algo que se toca. a landing não usa cards, não usa sombras, não usa grade de módulos genéricos — usa seções editoriais de altura inteira, alternância clara/vermelho, e um único acordeão como mecanismo interativo. o Portal, ao contrário, *precisa* de cards, listas e formulários — é uma ferramenta de trabalho, não uma peça institucional — e por isso reaproveita o único mecanismo interativo que a Landing já validou (o acordeão) em vez de inventar um padrão novo para a tela de pendências. não é limitação técnica em nenhum dos dois casos: é a mesma disciplina de "menos, com mais critério" aplicada a dois contextos de uso diferentes.

**branding.** a marca não é o logotipo. é a coerência entre o que a dodô diz, o que entrega e como aparece em cada ponto de contato. um Design System bem escrito é, ele mesmo, prova de branding bem feito: se este documento não parecer ter sido escrito pela dodô, o branding falhou antes mesmo do primeiro token.

### 05 · Como escrevemos, como falamos

direto, específico, sem ornamento. soa como alguém que domina o que faz sem precisar provar. o valor inegociável é a especificidade — cada palavra tem endereço.

**caixa e pontuação.** caixa baixa como padrão em todo conteúdo digital — maiúscula só em nomes próprios, siglas e títulos operacionais. ponto final, vírgula, dois pontos; sem exclamação salvo exceção específica. **sem travessão em nenhum contexto.** sem reticências, nunca. o Portal segue a regra à risca: toda mensagem de sistema é caixa baixa — "nenhuma entrega criada ainda.", "sessão expirada.", "acesso indisponível" — inclusive em telas de erro, onde a tentação de gritar em maiúscula é maior.

**escopo da regra.** "sem travessão" rege a identidade verbal da marca — copy institucional, produto e mensagens de sistema, a voz que o público final lê. documentação técnica interna, como este próprio Design System, escrito para quem constrói o produto, não para quem o usa, não está sujeita a essa restrição: usa travessão como pontuação estrutural normal. regra definitiva, não pendência.

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

**vocabulário de domínio, no Portal, não é opcional.** o Contrato Soberano (`knowledge/Historico/CONTRATO_SOBERANO.md`) define os termos oficiais do produto: `Colaboração Mensal`, `Entrega`, `Envio`, `Obrigação Financeira`, `Parceira`. um segundo vocabulário — `Campanha`, `ParticipacaoNaCampanha` — existe em documentação histórica de um sistema descontinuado ("Sistema B") e não deve aparecer em texto de interface novo. os ícones legados em `design-system/icons/` (`02-campanhas.svg`, `03-marcas.svg`) carregam esse vocabulário antigo — ver [ícones](#14--ícones).

### 06 · O que nunca fazemos

**a lição das três gerações de Design System.** antes deste documento, o projeto passou por três gerações de identidade visual em sequência, cada uma nomeada formalmente como fonte de verdade e cada uma abandonada: um sistema pré-rebranding vermelho-vinho serifado; uma paleta roxo-primária revertida no mesmo dia da aprovação; um import de paleta laranja/roxo copiado manualmente para o código. nenhuma, isoladamente, era fiel ao que estava de fato em produção.

a lição não é sobre cor — é sobre processo: **documentar identidade sem checar contra o código real produz documentação que mente.** este livro existe para não repetir esse erro. a extensão para o Portal, nesta versão, seguiu a mesma disciplina: cada valor de cor, espaçamento e classe citado abaixo foi lido direto de `portal-frontend/src/index.css`, `tokens.css` e das páginas reais — nenhum foi inventado para preencher a lista de seções que este documento promete cobrir.

**erros comuns já cometidos, com honestidade:**
- uma classe CSS chamada `.acumin-bold` aplica peso 800 em texto hoje renderizado em Elms Sans — o nome referencia uma fonte ("Acumin") fora do sistema atual, resquício provável de ferramenta de design anterior.
- o vídeo e a imagem estática do hero são, por comentário literal do próprio script de setup, um *"placeholder, origem Criativo Dodô"* — conteúdo de marca anterior, ainda no ar na peça mais visível do site.
- no Portal, os botões e campos de formulário das telas administrativas (`AdminEntregas`, `AdminBriefings`, `AdminObrigacoes`, `AdminParceiras`, `Perfil`) são objetos de estilo inline (`estiloInput`, `estiloBotaoOutlineCherry` etc.) **copiados e colados** em cinco arquivos diferentes, quase idênticos, com pequenas divergências de detalhe entre eles — exatamente o tipo de duplicação que um Design System existe para eliminar. ver [botões](#16--botões) e [formulários](#17--formulários).

| nunca fazemos | sempre fazemos |
|---|---|
| redesenhar o logotipo em vez de recolorir os arquivos oficiais; inventar token porque "parece que deveria existir"; deixar vermelho dominar uma tela de uso contínuo; title case/caixa alta em título; travessão ou reticências; copiar um objeto de estilo de uma tela administrativa para a próxima | extrair do código antes de propor; marcar "não definido" o que não está definido; checar decisão nova contra este livro; perguntar "isso parece um template?" antes de aprovar; promover um padrão repetido três ou mais vezes a componente nomeado |

### 07 · Branding, produto e engenharia

branding decide o quê e o porquê. produto decide onde. engenharia decide como. o caminho mais curto hoje: os valores de cor nascem como variáveis CSS (`--color-cotton`, `--color-cherry`, `--color-maroon`, `--color-noir`) num único arquivo (`app/src/index.css`) e são **importados literalmente** por `portal-frontend/src/styles/tokens.css` — Design System funcionando na prática, com um mecanismo real de propagação entre dois projetos sem workspace compartilhado (tipografia e espaçamento ainda não seguem o mesmo padrão de variável, ver [pendências](#34--pendências-encontradas)).

**quando um documento de marca some do código.** há um precedente relevante: uma ADR antiga (`knowledge/Arquitetura/ADR-019`) nomeou formalmente um "Manual de Design Dodô v1.0", paleta laranja-primária, como fonte única de verdade visual. o código hoje implementa uma paleta completamente diferente (Cherry Red/Cotton/Maroon/Noir Black), e a governança atual (`knowledge/ARCHITECTURAL_DECISIONS.md`, ADR-001/ADR-004) já formaliza a Landing como fonte de verdade e supera a ADR antiga para fins visuais. não é um erro deste livro a corrigir — é um fato a registrar: a documentação de arquitetura pode ficar para trás do produto real, e a régua de qual documento vale é sempre o código em produção.

---

## Parte II — Fundação visual (tokens)

### 08 · Fundamentos da marca

três ativos de identidade, cada um com uma função — a mesma distinção que a Nike faz entre o nome escrito e o swoosh.

| ativo | arquivo · viewBox | função | em uso hoje? |
|---|---|---|---|
| **Wordmark** | `principal.svg` (noir) / `principal-cherry.svg` (cherry `#810100`) · `0 0 507 193.8` | assinatura institucional — a marca por extenso | sim. cherry no header da Landing (`Hero.tsx`) e no login do Portal (`Login.tsx`); noir na sidebar de todo o Portal (`PortalLayout.tsx`) |
| **Marca secundária** | `secundario.svg` · `0 0 123.5 133.6` | lockup compacto em grade (D/O/D/Ô), para formatos quadrados | não — arquivo pronto, sem aplicação hoje em nenhum dos dois produtos |
| **Emblema** | `icon.svg` · `0 0 116.2 127.2` | o símbolo sozinho, um anel com acento circunflexo — o "Ô" isolado | sim. `favicon.svg` da Landing, e como marca d'água de fundo (opacidade 0.05) na tela de login do Portal (`.portal-login-emblem`) — primeira aplicação decorativa do emblema no produto |

**técnica.** as duas variantes de cor do wordmark são dois arquivos SVG distintos com fill fixo, não um único arquivo recolorível via `currentColor`. a mesma geometria está duplicada em disco: wordmark, **4** cópias (2 variantes × `app/src/assets/brand/` + `portal-frontend/src/assets/brand/`); emblema e marca secundária, 2 cópias cada (1 arquivo × os mesmos 2 diretórios). até 2026-07-28, a cópia de `principal.svg` em `portal-frontend/` tinha o `fill` da variante cherry em vez de noir — bug real de produto (sidebar e login do Portal renderizavam wordmark cherry), corrigido nesta auditoria — ver [pendências](#34--pendências-encontradas).

**o que ainda não está definido.** não existe regra escrita de área de proteção mínima, tamanho mínimo de reprodução, ou critério fechado de quando usar mono vs. emblema. os três ativos existem e têm função clara; a régua de aplicação caso a caso ainda depende de critério editorial. não invente uma regra aqui.

### 09 · Cor

| token | hex | papel | onde aparece hoje |
|---|---|---|---|
| `--color-cotton` | `#edebdd` | fundo neutro, e "branco" sobre fundo escuro | fundo da Landing e do Portal inteiros, texto dentro das seções vermelhas, seleção de texto |
| `--color-cherry` | `#810100` | ação, ênfase, fundo de seção (Landing) / cor de destaque pontual (Portal) | nav, títulos editoriais, CTA da Landing; título de página, links, botão primário, badge de estado "aguardando" do Portal |
| `--color-maroon` | `#630000` | variação mais escura do vermelho | única aparição: fundo da seção "café" da Landing. não usado no Portal hoje |
| `--color-noir` | `#1b1717` | texto padrão, fundo do hero | cor de texto do body em ambos os produtos; fundo do vídeo do hero da Landing |

não existe uma quinta cor "branco" separada — Cotton cumpre os dois papéis porque não é um branco puro, é um branco quente, o mesmo em qualquer contexto. decisão real do código, não omissão.

**contraste (WCAG), calculado sobre os quatro tokens:**

| par | razão | AA texto normal (4.5:1) | AAA texto normal (7:1) |
|---|---|---|---|
| cherry sobre cotton (e o inverso) | **9.05:1** | passa | passa |
| noir sobre cotton (e o inverso) | **14.84:1** | passa | passa |
| cotton sobre maroon | **11.45:1** | passa | passa |
| cherry sobre maroon | **1.27:1** | **falha** | falha |

o último par confirma, em número, uma regra que o código já pratica por composição: cherry e maroon nunca competem lado a lado como texto/fundo — cada um é sempre uma seção inteira e sólida, nunca sobreposto ao outro.

**a disciplina da alternância — Landing.** a landing não mistura vermelho e claro na mesma seção — alterna seções inteiras: claro → vermelho → claro → maroon. cada seção é 100% de uma cor de fundo, nunca degradê ou mistura.

**a disciplina da alternância — Portal.** o Portal inverte a proporção sem trair a regra: fundo Cotton do topo ao rodapé, em toda tela, sem exceção. Cherry aparece só como acento pontual — título de página (`.title-editorial`, `.portal-login-title`), link de navegação e seu sublinhado, botão primário, borda/ícone de um badge de status específico (`aguardando material`), overline em maiúscula pequena (`.portal-eyebrow`). nunca como fundo de bloco ou seção no Portal hoje. essa é exatamente a previsão registrada em [personalidade e princípios](#03--personalidade-e-princípios) desde antes de o Portal existir em código — e o código, agora que existe, a confirma.

> **nota técnica.** `.accordion-item` (Landing) usa `border-bottom: rgba(237, 235, 221, 0.3)` — numericamente `--color-cotton` a 30% de opacidade, mas escrito como literal, não `var()`. o Portal tem o mesmo hábito em vários lugares (`rgba(27, 23, 23, 0.1)` para bordas hairline, `rgba(129, 1, 0, 0.08)` para o fundo do badge padrão) — nenhum é bug visual, mas um ajuste futuro de paleta exigiria busca manual em vez de edição de variável em nenhum dos dois produtos.

> **apêndice — paleta histórica, não usar.** uma geração anterior definiu laranja `#f14f28` (ação) e roxo `#504ea1` (secundária), documentada em ADR nunca formalmente revogada. não existe em nenhuma linha de código hoje, em nenhum dos dois produtos. citado aqui só para não ser confundido com a identidade atual.

### 10 · Tipografia

duas fontes variáveis (`font-weight: 100 900` no `@font-face`), papéis bem separados, idênticos entre Landing e Portal:

- **Work Sans** — `--font-display`. peso 800 em títulos editoriais e ênfase forte, 700 no botão primário, 600 no título de acordeão e no link de navegação.
- **Elms Sans** — `--font-body`. peso 400 no corpo base, 300 nos parágrafos de seção (Landing), 600 na navegação, 700 em label de formulário e overline do Portal.

só cinco pesos são de fato usados em toda a base de código: 300, 400, 600, 700, 800. nenhum peso entre 100–299, nem 500, nem 900.

**escala real — Landing (literal repetido por seletor, não é token):**

| papel | desktop | ≤768px | peso |
|---|---|---|---|
| título de seção | 38.4px | 28.8px | 800 |
| título de acordeão | 20.8px | 17.6px | 600 / 800 hover |
| ícone do acordeão | 32px | 28px | 300 |
| corpo/nav | 15.3px | 13.6px | 300 / 600 (nav) |
| botão | 15px | 15px | 700 |
| rodapé/links | 16px | 16px | 400 |

**escala real — Portal (a mesma família de valores, reaproveitada em contexto de produto):**

| papel | desktop | ≤768px | peso | classe |
|---|---|---|---|---|
| título de página | 38.4px | 28.8px | 800 | `.portal-page-title`, `.title-editorial` |
| overline | 13.6px | — | 700, versal (`letter-spacing: 0.08em`, `uppercase`) | `.portal-eyebrow`, `.portal-login-overline` |
| nome de item em lista/accordion | 20.8px | — | 600 / 800 hover | `.pendencia-format` |
| corpo/descrição | 16px | — | 400 | `.portal-page-intro`, `.portal-login-description` |
| meta/legenda | 13–14px | — | 400–700 | `.portal-list-row-meta`, `.financeiro-kpi-label` |
| valor de KPI | 22px | — | 700, `--font-display` | `.financeiro-kpi-value` |
| nav lateral | 15.3px | — | 600 | `.portal-nav-link` |
| campo de formulário | 14px | — | 400 | `estiloInput` (inline, não classe — ver [botões](#16--botões)) |
| label de formulário | 13px | — | 700 | `estiloLabel` (inline) |

a razão desktop→mobile do título de página gira perto de 0.75, igual à Landing — a mesma proporção herdada sem reabrir a decisão, exatamente como o roadmap anterior deste documento pedia.

> **a classe que carrega o nome errado.** `.acumin-bold`, só na Landing, aplica peso 800 em ênfase dentro de parágrafos. o nome referencia "Acumin", fonte que não existe no sistema atual — provável resquício de ferramenta de design anterior (Acumin Pro é padrão de novos arquivos no Illustrator/XD). funciona hoje porque CSS não valida nomes de classe contra fontes reais. o Portal não herdou essa classe.

### 11 · Grid e espaçamento

um único container em ambos os produtos — `.container { max-width: 1026px; margin: 0 auto }`. dois breakpoints em todo o CSS, também em ambos: `1100px` (ajusta padding lateral, empilha grades de largura fixa) e `768px` (reduz tipografia/espaçamento, reorganiza layout). nenhum terceiro ponto de corte em nenhum dos dois produtos.

**Landing** — respiro entre seções: `140px` desktop, `80px` mobile, mesmo valor em toda seção clara ou vermelha, pulso único do início ao fim. `display: flex` em toda parte, nenhum `display: grid` no CSS da Landing.

**Portal** — o shell inteiro (`.portal-shell`) é `display: grid`, coluna fixa de sidebar (`264px`) mais conteúdo fluido (`1fr`) — a primeira e única grade real de duas dimensões em todo o código hoje. dentro do conteúdo, tudo volta a ser flexbox e listas verticais, com uma exceção deliberada: `.operational-row`, um grid de colunas fixas (`68px minmax(200px,1.4fr) 120px 130px 230px`) usado nas listas administrativas de maior volume (Gestão de Parceiras) para manter a coluna de status sempre na mesma posição horizontal, permitindo escanear o status verticalmente sem reler cada linha — comentário literal no CSS explica essa decisão.

**escala de espaçamento observada** (não é uma progressão geométrica fechada — é o conjunto de valores que o código de fato usa hoje, em px): `2, 6, 8, 10, 12, 14, 16, 20, 24, 28, 32, 36, 40, 48, 60, 80, 120, 140`. os valores pequenos (2–16) dominam espaçamento interno de componente (gap de label, padding de badge); os grandes (60–140) só aparecem em respiro de seção/página. trate como observação de uso, não como fórmula — igual à nota que este documento já fazia sobre a escala tipográfica.

| existe | não existe |
|---|---|
| seções full-bleed de altura própria (Landing); grid de shell fixo + listas verticais (Portal); alternância clara/vermelho como unidade de composição (Landing) | cards em grade repetida na Landing; qualquer `border-radius` na Landing além do botão (24px); `<table>` em qualquer um dos dois produtos |

### 12 · Raio, borda e elevação

| token observado | valor | onde |
|---|---|---|
| raio — pílula | `24px` (botão médio) / `999px` (badge) | `.btn-primary`, `estiloBotaoOutlineCherry`, `.pendencia-status-badge` |
| raio — bloco | `12px` | `.portal-list-row`, `.financeiro-kpi` |
| raio — bloco maior | `14px` | `.pendencia-item` |
| raio — campo | `8px` | `estiloInput` (inline) |
| borda — hairline padrão | `1px solid rgba(27, 23, 23, 0.1)` | sidebar, breadcrumb, divisores, cards do Portal |
| borda — hairline reforçada | `1px solid rgba(27, 23, 23, 0.14)` | `.pendencia-item` em repouso |
| borda — estado de atenção | `1px solid var(--color-cherry)` sólido, com fundo `rgba(129, 1, 0, 0.055)` | `.pendencia-item.is-overdue` |
| elevação — hover de card | `0 10px 24px rgba(27, 23, 23, 0.07)` | `.pendencia-item:hover` |
| elevação — CTA cherry | `0 6px 14px rgba(129, 1, 0, 0.18)` | `.pendencia-submit` |

a Landing não usa nenhuma sombra e só um valor de raio (o botão, 24px) — o vocabulário de raio/borda/elevação acima é **inteiramente do Portal**, construído quando a interface passou a precisar de cards e listas que a Landing nunca precisou. é consistente internamente (os mesmos três-quatro valores se repetem em vez de cada tela inventar o seu), mas nunca foi escrito como token CSS — assim como tipografia e espaçamento, existe hoje como literal repetido, não como variável.

### 13 · Motion

toda animação da **Landing** vive em um único arquivo, `app/src/useLandingAnimations.ts` (GSAP + ScrollTrigger), chamado uma vez em `App.tsx`. seções só marcam via classe (`.gsap-fade`, `.stagger-item`, `.stagger-group`) ou id (trigger) o que deve acontecer.

| efeito | duração | ease | disparo |
|---|---|---|---|
| entrada do header | 1.5s, stagger 0.1 | power2.out | ao montar, delay 0.3s |
| parallax do hero | scrub contínuo | none | scroll de `.hero` |
| fade individual (`.gsap-fade`) | 1.4s | power2.out | elemento a 85% da viewport, uma vez |
| stagger de grupo | 1.2s, stagger 0.2 | power2.out | grupo a 80%, uma vez |

todo conteúdo revelado usa `toggleActions: "play none none none"` — toca uma vez, não reverte ao rolar para cima. as únicas exceções são os parallax, com `scrub: true`.

o **Portal** não usa GSAP — não tem dependência de motion library nenhuma (`package.json` do `portal-frontend` lista só `react`, `react-dom`, `react-router-dom`). toda animação é CSS puro, e reaproveita a curva `--ease-editorial: cubic-bezier(0.25, 1, 0.5, 1)` definida no mesmo `tokens.css` da cor:

| efeito | duração/curva | onde |
|---|---|---|
| sublinhado de link de navegação (`scaleX` do pseudo-elemento) | `0.4s var(--ease-editorial)` | `.portal-nav-link::after`, herdado 1:1 do `.nav-link::after` da Landing |
| hover de card (subida + sombra) | `0.3s var(--ease-editorial)` | `.pendencia-item:hover` |
| expansão do accordion de pendência | `pendencia-expand`, `0.3s var(--ease-editorial)` | `.pendencia-details` |
| rotação do ícone de accordion | `0.4s var(--ease-editorial)` | `.pendencia-icon`, `.accordion-icon` (Landing) |
| spinner de carregamento | `portal-spin`, `0.8s linear infinite` | `.portal-login-loader`, `.pendencia-upload-spinner` |

> **gap real de acessibilidade, presente nos dois produtos.** não existe nenhum tratamento de `prefers-reduced-motion`, nem em CSS nem em JS, nem na Landing nem no Portal. todo visitante e toda Parceira recebem as mesmas animações. gap real do código atual, não decisão de marca — qualquer implementação nova de motion deveria fechar essa lacuna, não repeti-la. ver [acessibilidade](#29--acessibilidade-wcag).

### 14 · Ícones

`design-system/icons/` guarda quinze SVGs numerados, gerados numa sessão anterior, sem uso em nenhum dos dois produtos hoje. auditando o nome de cada um contra o vocabulário de domínio vigente ([Contrato Soberano](#05--como-escrevemos-como-falamos)):

| arquivo | conceito | vocabulário atual? |
|---|---|---|
| `01-dashboard.svg` | Dashboard | sim — existe hoje (`AdminDashboard.tsx`) |
| `04-parceiras.svg` | Parceira | sim — existe hoje (`AdminParceiras.tsx`) |
| `05-briefings.svg` | Briefing | sim — existe hoje (`AdminBriefings.tsx`) |
| `06-conteudos.svg`, `07-upload.svg` | Entrega / Envio de material | sim — mapeiam para `AdminEntregas.tsx` / upload de material em `Pendencias.tsx` |
| `08-aprovacao.svg`, `09-revisao.svg` | Aprovação / Revisão de Entrega | sim — estados `EM_REVISAO`/`APROVADO` existem no domínio |
| `10-pagamentos.svg` | Obrigação Financeira | sim — mapeia para `AdminObrigacoes.tsx`/`Financeiro.tsx` |
| `14-perfil.svg` | Perfil | sim — existe hoje (`Perfil.tsx`) |
| `02-campanhas.svg`, `03-marcas.svg` | Campanha, Marca | **não** — vocabulário do "Sistema B" descontinuado; ator Marca está fora do MVP (ADR-008) |
| `11-calendario.svg`, `12-mensagens.svg`, `13-notificacoes.svg`, `15-configuracoes.svg` | Calendário, Mensagens, Notificações, Configurações | nenhuma dessas telas existe hoje em nenhum dos dois produtos |

nenhum ícone está de fato importado em código React hoje — nem os que mapeiam para conceitos reais. usar qualquer um exige, antes, checar se o traço/peso visual foi desenhado para conviver com Work Sans/Elms Sans (não auditado nesta versão). os quatro nomeados com vocabulário do Sistema B (`campanhas`, `marcas`) não devem entrar em interface nova sem reconciliação explícita de domínio.

### 15 · Ilustração e imagem

não existe, hoje, um sistema de ilustração — nem na Landing, nem no Portal. os únicos ativos de imagem em uso são os três ativos de marca ([§08](#08--fundamentos-da-marca)) e o vídeo/poster do hero da Landing, que é placeholder herdado ([pendências](#34--pendências-encontradas), item 1). o Portal não usa nenhuma imagem além do wordmark e do emblema — nenhuma foto de perfil de Parceira, nenhum thumbnail de material enviado é renderizado hoje, mesmo onde o domínio (upload de material) sugeriria isso. não invente um sistema de ilustração aqui: registre a ausência.

---

## Parte III — Componentes

> Esta parte documenta o que **existe em código hoje**, não uma biblioteca planejada. Onde o Portal repete um padrão sem tê-lo promovido a classe nomeada, este livro nomeia o padrão mesmo assim — nomear é o primeiro passo de consolidação, extrair para uma classe/componente React é o segundo, ainda pendente (ver [roadmap](#33--roadmap)).

### 16 · Botões

quatro variantes existem, em uso real, mas só uma tem classe CSS — as outras três são **objetos de estilo inline duplicados**, quase idênticos entre si, entre `AdminEntregas.tsx`, `AdminBriefings.tsx`, `AdminObrigacoes.tsx`, `AdminParceiras.tsx` e `Perfil.tsx` (contagem exata por variante na tabela abaixo — nenhuma delas está nos cinco arquivos ao mesmo tempo).

| variante | onde está definida | altura | raio | uso |
|---|---|---|---|---|
| **primário** | classe `.btn-primary` em `index.css` (Landing e Portal) | 48px | 24px | uma ação por tela: login, sair, salvar formulário |
| **outline neutro** | objeto `estiloBotaoOutlineNeutro`, em 4 arquivos (falta em `Perfil.tsx`) | 36px | 24px | ação secundária neutra — "cancelar" |
| **outline cherry** | objeto `estiloBotaoOutlineCherry`, em 3 arquivos (falta em `AdminEntregas.tsx` e `Perfil.tsx`) | 36px | 24px | ação secundária de ênfase — "editar", "nova obrigação" |
| **primário pequeno** | objeto `estiloBotaoPrimarioPequeno`, em 2 arquivos (`AdminObrigacoes.tsx`, `AdminParceiras.tsx`) | 36px | 24px, via `className="btn-primary"` combinada no JSX — nenhum dos dois objetos define `borderRadius` próprio | ação primária dentro de uma linha de lista |

**primário** (`.btn-primary`): fundo cherry, texto cotton, borda cherry 1px; hover inverte para fundo transparente e texto cherry; `:disabled` reduz opacidade para 0.5. É o único botão com estado `:focus-visible` explícito no CSS (outline 2px cherry, offset 3px) — herdado do seletor genérico `button:focus-visible`, então os outros três, sendo `<button>` nativo com estilo inline, **também recebem** esse foco visível, por herança do seletor de elemento, não por decisão própria de cada variante.

> **a divergência real, não a que a v2.0 original alegava.** `estiloBotaoPrimarioPequeno` **não** tem divergência de raio entre as suas 2 cópias nomeadas — são byte-idênticas. a divergência real está em quatro arquivos que reproduzem o mesmo objeto **sem nomeá-lo** (inline, cru, dentro do `style={{...}}`): `AdminBriefings.tsx`, `AdminEntregas.tsx`, `Admin.tsx` e `Pendencias.tsx` — e em dois deles (`Admin.tsx`, `Pendencias.tsx`) o padding é `"0 20px"`, não `"0 16px"` como nas cópias nomeadas. é o mesmo problema de fundo (objeto de estilo duplicado em vez de classe nomeada), só que a variação real é de padding, não de raio. promover as três variantes a classes CSS nomeadas (`.btn-outline-neutral`, `.btn-outline-cherry`, `.btn-primary-sm`) eliminaria a duplicação e a divergência. ver [pendências](#34--pendências-encontradas).

### 17 · Formulários

campo e label também são objetos inline, mais consistentes entre si que os botões (mesma forma nos 5 arquivos que os nomeiam — `AdminEntregas.tsx`, `AdminBriefings.tsx`, `AdminObrigacoes.tsx`, `AdminParceiras.tsx`, `Perfil.tsx` — mais uma 6ª ocorrência sem nome própria em `Financeiro.tsx`, idêntica às outras exceto por não repetir `fontWeight: 400`):

- **input** (`estiloInput`): altura 40px, raio 8px, borda `1px solid rgba(27,23,23,0.2)`, padding horizontal 12px, fonte 14px/400.
- **label** (`estiloLabel`): coluna flex, gap 6px, fonte 13px/700 — sempre acima do campo, nunca ao lado.
- **textarea** (`estiloTextarea`, só em `AdminBriefings.tsx`): estende `estiloInput` via spread (`...estiloInput`), sobrescrevendo altura para `auto`/`min-height: 80px` e adicionando `resize: vertical`. é o único dos objetos de estilo que já pratica composição em vez de repetição total — o padrão a copiar quando os outros forem consolidados.
- **campo de busca/filtro**: mesmo `estiloInput`, sem variante própria — os filtros de lista administrativa (`AdminEntregas`, `AdminParceiras`, `AdminObrigacoes`, `AdminBriefings`) reaproveitam o input padrão.

**validação e erro.** não existe um padrão visual de campo inválido (borda vermelha, ícone de erro inline) em nenhuma tela hoje — o erro de formulário é reportado como texto abaixo do formulário inteiro (ver [feedback](#22--feedback-carregando-erro-sucesso-vazio)), não por campo. registre como lacuna, não proponha aqui uma solução não validada pelo responsável do produto.

**foco.** como o input é `<input>` nativo sem classe, ele herda o mesmo `input:focus-visible { outline: 2px solid cherry; outline-offset: 3px }` do seletor genérico — foco visível funciona, por herança, mesmo em campo sem CSS próprio.

### 18 · Navegação

**sidebar (Portal).** coluna fixa de 264px (`.portal-shell` grid), logo no topo (`.portal-logo`, 115.2px de largura — a mesma medida do `.logo` da Landing), lista de links abaixo (`.portal-sidebar-nav`), nome da sessão e botão "sair" no rodapé da coluna (`.portal-sidebar-user`). o conjunto de itens muda por papel: `ADMINISTRADOR` vê Dashboard/Parceiras/Entregas/Briefings/Obrigações/Moderação além dos três itens da Parceira; `PARCEIRA` vê só Pendências/Financeiro/Perfil.

**link de navegação.** `.portal-nav-link` é, pixel a pixel, o mesmo padrão do `.nav-link` da Landing: cor cherry, peso 600, sublinhado que nasce da direita e cresce para a esquerda no hover (`transform-origin: bottom right` → `bottom left`), 0.4s `--ease-editorial`. o Portal adiciona um estado que a Landing não precisa, por não ter roteador: `.is-active`, aplicado pelo `NavLink` do React Router, mostra o mesmo sublinhado permanentemente, sem precisar de hover.

**breadcrumb.** `.portal-breadcrumb`, opcional por página (só renderiza se a página declarar itens via `PageHeaderProvider`), separador " / " entre itens, último item sem link.

**tabs, menu suspenso, busca global.** não existem em nenhum dos dois produtos hoje.

### 19 · Cards e listas

três formas de agrupar itens, cada uma com uso específico — não são intercambiáveis:

- **`.portal-list-row`** — linha de lista genérica: título, meta (linha secundária, opacidade 0.8) e ações à direita, tudo em `justify-content: space-between`. raio 12px, borda hairline. é a forma mais usada em telas de Parceira (histórico do Financeiro).
- **`.operational-row`** — grid de colunas fixas (ver [§11](#11--grid-e-espaçamento)), para listas administrativas de alto volume onde escanear uma coluna específica (status) importa mais que a leitura linha a linha.
- **`.financeiro-kpi`** — card de número único: label pequeno (13px, opacidade 0.8) em cima, valor grande (22px, `--font-display`, 700) embaixo. modificador `.is-destaque` pinta o valor de cherry — usado só no total pendente, nunca em mais de um KPI por tela, mesma disciplina de "um único destaque" que o CTA da Landing pratica.
- **`.pendencia-item`** — o card mais elaborado: é ao mesmo tempo card e accordion, ver [§21](#21--accordion).

nenhuma das quatro formas usa sombra em repouso — elevação (`box-shadow`) só aparece em hover ou em estado de destaque, nunca como base.

### 20 · Badges e estado

um único padrão de badge existe hoje, `.pendencia-status-badge`: pílula (`border-radius: 999px`), padding `6px 9px`, um pequeno círculo de ícone (`.pendencia-status-icon`, 14px) à esquerda do texto.

| estado | fundo do badge | cor do ícone | classe modificadora |
|---|---|---|---|
| aguardando material (padrão, sem modificador) | `rgba(129, 1, 0, 0.08)` | cherry sólido | — |
| em revisão | `rgba(27, 23, 23, 0.08)` | noir sólido | `.pendencia-em_revisao` |
| aprovado / publicado | `rgba(27, 23, 23, 0.05)` | noir a 65% | `.pendencia-aprovado`, `.pendencia-publicado` |

o padrão de nome — `is-*` para estado transitório de UI (`is-active`, `is-open`, `is-overdue`, `is-quiet`, `is-error`, `is-sucesso`, `is-enviando`, `is-destaque`) versus `pendencia-{estado_do_domínio}` para estado de negócio — é consistente em todo `index.css` do Portal e vale a pena preservar como convenção ao nomear classes novas.

### 21 · Accordion

o único mecanismo interativo de revelação de conteúdo em toda a base de código, reaproveitado sem alteração de mecânica entre Landing e Portal:

- **Landing** (`Servicos.tsx`) — três serviços, `useState(0)` guarda o índice aberto, exclusivo (abrir um fecha o anterior), `max-height` animado a partir de `scrollHeight` via `useRef`+`useEffect`, 0.6s.
- **Portal** (`Pendencias.tsx`) — mesmo mecanismo de exclusividade da Landing: um único `useState<string | null>` (`itemAberto`) compartilhado por toda a tela, incluindo os dois grupos ("precisa de você"/"com a equipe") — abrir um item fecha qualquer outro que estivesse aberto, na tela inteira. abre/fecha via `.pendencia-details` com animação `pendencia-expand` (fade + translateY, 0.3s), não `max-height`.

ambos compartilham o ícone "+" que gira 180° ao abrir (`.pendencia-icon`, `.accordion-icon`) e o efeito de "peso aumenta e sublinha" no título ao passar o mouse ou abrir.

### 22 · Feedback: carregando, erro, sucesso, vazio

- **carregando** — um único padrão de spinner em todo o Portal: círculo 28px (login) ou 14px (upload), borda cherry a 20% de opacidade com o topo em cherry sólido, `portal-spin` 0.8s linear infinito. sem skeleton screen, sem shimmer — só o spinner.
- **erro** — texto abaixo do elemento relevante, cor cherry, classe `.is-error` (`.portal-page-feedback.is-error`, `.pendencia-feedback`). sempre em minúsculas, sempre frase completa com ponto final — nunca só a palavra "erro".
- **sucesso** — texto em noir, peso 700 (`.pendencia-feedback.is-sucesso`) — deliberadamente **não** usa cherry para sucesso, reservando a cor de marca para ação e atenção, não para confirmação.
- **vazio** — um padrão textual único, repetido ao pé da letra em toda lista administrativa: `"nenhum(a) [entidade] [criado(a)/cadastrado(a)] ainda."` quando a lista está genuinamente vazia, e `"nenhum(a) [entidade] encontrado(a) para esse filtro/busca."` quando o vazio é resultado de um filtro. sem classe/estilo próprio — é texto normal dentro de `.portal-page-feedback`. sempre frase completa, nunca ilustração ou call-to-action embutido — mas a capitalização do nome da entidade **não** é sempre minúscula como esta seção afirmava antes: `AdminEntregas`, `AdminBriefings` e `AdminObrigacoes` capitalizam ("nenhuma Entrega criada ainda."), só `AdminParceiras` usa minúscula — inconsistência real entre telas, não convenção.

### 23 · Tabelas — proposta

**não existe `<table>` em nenhuma linha de código hoje**, em nenhum dos dois produtos — nenhuma SPEC nem tela real pede uma. toda listagem administrativa de dados tabulares (Parceiras, Entregas, Obrigações) já resolve o problema com `.operational-row` ([§19](#19--cards-e-listas)): um grid de colunas fixas, sem `<table>`/`<thead>`/`<tbody>` semânticos.

isto é uma lacuna real, não uma escolha documentada — hoje `.operational-row` não tem cabeçalho de coluna (`<th>` ou equivalente visual), o que prejudica leitores de tela e usuários que perderam o contexto do topo da lista. se uma tela nova precisar de dado genuinamente tabular (múltiplas colunas numéricas comparáveis, ordenação, seleção em massa), a extensão natural é: promover `.operational-row` para uma `<table>` semântica com `<caption>`, mantendo os mesmos tokens de largura de coluna, raio e borda já validados — não introduzir uma biblioteca de tabela nova. **não implementar sem validar com o responsável do produto que o caso de uso realmente pede uma tabela**, em vez de mais uma lista.

### 24 · Modais — proposta

**não existe modal, dialog ou overlay estilizado em nenhum dos dois produtos hoje — mas existe um precedente nativo isolado.** `Admin.tsx` usa `window.prompt()` (diálogo modal nativo do navegador) para capturar o fundamento jurídico antes de aprovar/negar um pedido de exclusão LGPD — é a única ocorrência de `window.prompt`/`window.confirm`/`<dialog>` em toda a base de código. o outro fluxo destrutivo do mesmo arquivo (rejeitar um cadastro `PENDING`) não tem nenhuma confirmação — inconsistência real dentro do próprio `Admin.tsx`, não só ausência total de padrão.

se um modal for necessário, a extensão natural dos tokens já existentes seria: fundo `rgba(27, 23, 23, 0.5)` sobre o conteúdo (mesma família de opacidade que as bordas hairline já usam para noir), painel em cotton, raio 14px (o mesmo de `.pendencia-item`, o maior raio de bloco já validado), sem sombra pesada — elevação por contraste de fundo, não por `box-shadow` extremo, coerente com a Landing e o Portal nunca terem usado sombra como recurso primário de profundidade. **proposta, não implementação** — não construir sem confirmar o padrão de interação (fecha ao clicar fora? tem foco preso/`focus-trap`? qual tecla fecha?) com quem decide produto.

---

## Parte IV — Padrões, templates e sistema responsivo

### 25 · Padrões

**Landing:**
- **navegação à esquerda** — logo e menu empilhados no canto superior esquerdo, nunca centralizados ou à direita.
- **seção como unidade de cor** — `.section-light`/`.section-red`/`.tone-maroon` é o padrão estrutural mais importante: cada seção é uma decisão de cor inteira.
- **revelação por scroll como padrão** — toda seção entra via `.gsap-fade` ou stagger, sem exceção (fora o hero, visível no load).
- **CTA único por seção** — exatamente um botão em toda a landing (`.btn-agendar`, em "café"). nenhuma seção compete com dois CTAs simultâneos.

**Portal:**
- **navegação à esquerda, herdada** — a sidebar do Portal é o mesmo bloco logo+nav da Landing, rotacionado 90°: de horizontal no topo da página para vertical numa coluna fixa. mesma tipografia, mesmo mecanismo de sublinhado.
- **um destaque cherry por tela** — nunca mais de um elemento cherry sólido (fundo, não texto) por tela: um KPI `.is-destaque`, um botão primário, um badge de estado "aguardando". o resto da paleta de ação é noir e cinza translúcido.
- **estado sempre no mesmo lugar** — em qualquer lista (`.portal-list-row`, `.operational-row`), a informação de status ocupa a mesma posição relativa em toda linha, permitindo leitura vertical em vez de linha a linha.
- **accordion para conteúdo denso, lista simples para o resto** — Pendências (que carrega um briefing inteiro por item) usa accordion; Financeiro e as listas administrativas, que são leitura direta sem conteúdo extra por item, usam lista simples.

### 26 · Temas de produto

a identidade não muda de produto para produto — muda o quanto ela ocupa a tela. **esta tabela, escrita antes de o Portal existir em código, previa exatamente o que o código hoje confirma:**

| produto | presença institucional | implementado hoje? | confirmado pelo código? |
|---|---|---|---|
| landing | alta — grandes áreas de vermelho aceitáveis, peça institucional pontual | sim | sim, sem alteração |
| portal (parceira + backoffice) | moderada/mínima — vermelho pontua, não domina uma tela recorrente | **sim, desde 2026-07-27** | **sim** — fundo cotton constante, cherry só em título/link/CTA/um badge, nunca seção inteira (ver [§09](#09--cor)) |
| dashboard e admin (equipe) | mínima interferência — a interface de trabalho não compete com o trabalho | sim — parte do mesmo `portal-frontend`, papel `ADMINISTRADOR` | sim — mesmas regras de cor do Portal da Parceira, sem paleta própria |

**por que isso importava antes de existir código, e por que importa agora que existe.** era tentador copiar a landing inteira para o portal quando ele fosse construído. o princípio existia para impedir isso — e o Portal real, hoje, é a prova de que funcionou: nenhuma tela do Portal usa `.section-red`, nenhuma usa vídeo de fundo, nenhuma tem 140px de respiro entre blocos. a identidade é a mesma (mesma cor, mesma fonte, mesmo mecanismo de accordion e de sublinhado); a dose mudou, exatamente como planejado.

### 27 · Templates

quatro composições de tela se repetem hoje no Portal — vale nomeá-las, mesmo sem existir um componente `<Template>` formal em código:

- **shell autenticado** (`PortalLayout.tsx`) — sidebar fixa + `<Outlet />` de conteúdo, com cabeçalho opcional de breadcrumb/ações. toda tela pós-login usa este template.
- **login** (`Login.tsx`) — grid de três linhas (header/conteúdo/footer), emblema como marca d'água à direita, conteúdo centralizado em coluna única de até 440px. três estados de tela no mesmo template: carregando, formulário de login, e dois avisos (cadastro recebido / acesso indisponível) — todos reaproveitam `.portal-login-content` e `.portal-login-title`.
- **lista + formulário administrativo** (`AdminEntregas`, `AdminBriefings`, `AdminObrigacoes`, `AdminParceiras`) — filtro/busca no topo (`estiloInput`), formulário de criação (mostrado/escondido, nunca em modal — ver [§24](#24--modais--proposta)), lista abaixo (`.operational-row` ou `.portal-list-row`), estado vazio ao pé da letra ([§22](#22--feedback-carregando-erro-sucesso-vazio)).
- **resumo + histórico** (`Financeiro.tsx`, `AdminDashboard.tsx`) — fileira de `.financeiro-kpi` no topo, lista/accordion de detalhe abaixo.

### 28 · Sistema responsivo

dois breakpoints, `1100px` e `768px`, idênticos em Landing e Portal — nenhum dos dois produtos usa `@container` ou unidade fluida além de `clamp()` pontual no login (`padding: 36px clamp(24px, 6vw, 96px)`).

**mudanças reais em ≤768px, Portal:**
- `.portal-shell` sai de grid de duas colunas para uma coluna; a sidebar vira duas linhas via `grid-template-areas` (`"logo user" "nav nav"`), com `.portal-sidebar-top` colapsando via `display: contents` — dissolve o agrupamento visual sem duplicar DOM. comentário no CSS documenta que essa escolha corrige um overflow horizontal real encontrado em revisão de UX com 4+ itens de nav.
- `.portal-list-row` empilha (`flex-direction: column`); os botões de ação passam a ocupar a largura toda (`flex: 1`).
- `.operational-row` vira uma coluna (`grid-template-columns: 1fr`) — a leitura vertical de status, o motivo de existir a grade fixa, só faz sentido em telas largas; abaixo de 768px a prioridade muda para não cortar conteúdo.
- `.financeiro-kpi` também vira largura total (`min-width: 100%`) — de "cards lado a lado" para "cards empilhados".
- `.pendencia-next-action` (texto de próxima ação, ao lado do badge) **desaparece** em mobile — única informação que o Portal deliberadamente omite em telas pequenas, não reduz.

nenhum dos dois produtos tem, hoje, um breakpoint de tablet específico (só o salto direto de 1100px para 768px) nem trata orientação (`landscape`/`portrait`) de forma diferente.

---

## Parte V — Acessibilidade e guidelines

### 29 · Acessibilidade (WCAG)

**o que já está certo, por construção:**
- **contraste** — os quatro tokens de cor puros, em qualquer combinação usada como texto sobre fundo, passam AAA (ver tabela em [§09](#09--cor)). isso **não** se estende automaticamente a variantes com opacidade: `rgba(27,23,23,0.6)` sobre cotton (`.pendencias-summary.is-quiet`) fica em 4.38:1 — **falha até AA** (4.5:1); `rgba(27,23,23,0.7)` sobre cotton (breadcrumb, login) fica em 6.03:1 — passa AA, falha AAA. não auditado exaustivamente; tratar como amostra, não certificação completa.
- **foco visível** — `button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible { outline: 2px solid cherry; outline-offset: 3px }` é uma regra genérica por seletor de elemento, cobre até botões/inputs sem classe própria ([§16](#16--botões), [§17](#17--formulários)) — mas **não inclui `textarea`**, então o campo de observações (`estiloTextarea`, `AdminBriefings.tsx`) não tem foco visível garantido.
- **aria mais ampla do que uma primeira leitura sugere** — além do login (`aria-live`, `aria-labelledby`, `aria-hidden`), `Pendencias.tsx` usa `aria-live="polite"` em todo o fluxo de upload (enviando/sucesso/sessão expirada), `role="alert"` na mensagem de erro de upload, e `aria-expanded` no botão-trigger do próprio accordion de pendência — e `PortalLayout.tsx` nomeia os dois landmarks `<nav>` do shell (`aria-label="Trilha de navegação"`, `aria-label="Navegação principal"`).
- **texto de estado sempre como frase, nunca só ícone** — todo badge de status ([§20](#20--badges-e-estado)) tem o texto do estado ao lado do ícone, nunca só a cor ou só o ícone carregando o significado.

**o que é lacuna real, não decisão:**
- **`prefers-reduced-motion` não existe em nenhum dos dois produtos** — repetido de [§13](#13--motion) porque é o gap de acessibilidade mais concreto encontrado nesta auditoria. GSAP na Landing e as animações CSS do Portal (accordion, spinner, hover) tocam sempre, para qualquer visitante.
- **campo de formulário inválido não tem indicação própria** — erro de formulário é reportado como bloco de texto, não como estado do campo (`aria-invalid`, borda, texto associado por `aria-describedby`) — ver [§17](#17--formulários).
- **nenhuma tela foi auditada com leitor de tela real** nesta sessão — os pontos acima vêm de leitura de código (presença/ausência de atributo), não de teste assistido. trate como primeira passada, não como certificação.
- **`.operational-row` não tem cabeçalho de coluna** — ver [§23](#23--tabelas--proposta).

### 30 · Guidelines de uso — do's & don'ts

| faça | não faça |
|---|---|
| use cherry para uma única ação/destaque por tela | espalhe cherry em mais de um elemento sólido na mesma tela |
| escreva estado vazio e erro como frase minúscula completa, com ponto final | use só uma palavra ("erro.", "vazio") ou ponto de exclamação |
| ao adicionar uma terceira ocorrência de um objeto de estilo inline repetido, promova-o a classe CSS nomeada | copie e cole um objeto `estilo*` de uma tela Admin para a próxima |
| use `.operational-row` para listas administrativas de alto volume, escaneáveis por coluna | use `.operational-row` para uma lista de 2-3 itens sem necessidade de escaneio por coluna — nesse caso, `.portal-list-row` é suficiente |
| use o accordion (`.pendencia-item`) quando o item carrega conteúdo denso a mais (briefing) | use accordion para esconder uma única linha de texto que caberia direto na lista |
| peça confirmação explícita do responsável de produto antes de implementar tabela ou modal | implemente tabela/modal "porque parece que deveria existir" sem esse aval — ver [§23](#23--tabelas--proposta)/[§24](#24--modais--proposta) |
| cheque este documento contra o código antes de confiar em um valor, se o tempo tiver passado | trate qualquer número aqui como definitivo sem checar a data de auditoria no topo do arquivo |

---

## Parte VI — Engenharia e governança

### 31 · Engenharia

| peça | Landing (`app/`) | Portal (`portal-frontend/`) |
|---|---|---|
| framework | React 19 + TypeScript, via Vite | React 19 + TypeScript, via Vite |
| roteamento | nenhum (página única) | `react-router-dom` 7 |
| estilo | CSS global único (`index.css`) — nenhum CSS Module, CSS-in-JS ou Tailwind | idêntico: CSS global único + objetos de estilo inline pontuais (ver [§16](#16--botões)) |
| motion | GSAP + ScrollTrigger, orquestrado em um hook único | nenhuma lib — só CSS |
| lint | ESLint (flat config) | Biome + oxlint |
| backend | nenhum (site estático) | Node.js/TypeScript/Express 5, persistência em memória (decisão deliberada) |

dois projetos independentes, sem workspace compartilhado, cada um com seu próprio `package.json` — a única ponte entre os dois é o arquivo de tokens (`portal-frontend/src/styles/tokens.css`) importando os valores literais do `app/src/index.css`, mantido manualmente, não por build compartilhado.

**pipeline de assets.** `design-system/` na raiz é a origem — fontes e os três SVGs de marca na forma canônica (noir). `scripts/setup-assets.sh` copia, idempotente, fontes e SVGs para dentro de `app/`; o mesmo conjunto de arquivos foi replicado manualmente para dentro de `portal-frontend/src/assets/brand/` quando o Portal nasceu, sem que o script de setup soubesse do Portal — ver [pendências](#34--pendências-encontradas).

**o que ainda não está conectado.** sem Tailwind, Storybook, Figma, ou MCP de design para nenhum dos dois front-ends hoje. conectar essas ferramentas faz sentido quando houver mais de um time decidindo sobre componentes ao mesmo tempo — hoje ainda não é o caso.

### 32 · Governança do documento

**a regra de ouro.** nenhum valor deste documento deveria ser confiado sem checagem contra o código, passado tempo suficiente. este livro nasceu de auditoria direta ao CSS e TSX em produção, não de um documento anterior. quem atualizar este livro deve fazer o mesmo.

**quando este documento muda.** uma decisão de marca nova é registrada aqui só depois de existir em produção. uma mudança de arquitetura visual relevante merece um ADR próprio antes de refletida aqui. pendências resolvidas saem da lista; novas entram — se a lista só cresce e nunca esvazia, é sinal de que ninguém está agindo sobre ela.

**quem decide.** decisões de identidade são do responsável pelo projeto — nem este livro, nem um agente de IA, inventa regra nova de marca. decisões de documentação podem ser refinadas por quem mantém o documento, desde que editorial, não identidade disfarçada de reorganização. esta versão (v2.0) não alterou nenhum token de cor, fonte ou raio herdado da v1.0 — só documentou o que o Portal acrescentou e nomeou o que já existia sem nome.

### 33 · Roadmap

- **próximo** — **consolidar os objetos de estilo inline** (`estiloInput`, `estiloBotaoOutlineCherry` etc.) em classes CSS nomeadas, uma única fonte por variante, eliminando a divergência real já encontrada em `estiloBotaoPrimarioPequeno` ([§16](#16--botões)).
- **próximo** — **tokenizar tipografia e espaço**: hoje são literais repetidos por seletor em ambos os produtos; deveriam virar variáveis CSS, seguindo o exemplo que a cor já dá.
- **próximo** — **fechar o gap de `prefers-reduced-motion`** nos dois produtos antes de qualquer novo trabalho de motion.
- **médio prazo** — **cabeçalho de coluna em `.operational-row`**, ou promoção para `<table>` semântica onde o caso de uso realmente pedir dado tabular ([§23](#23--tabelas--proposta)).
- **médio prazo** — **indicação de campo inválido em formulário** (hoje só existe erro de bloco inteiro).
- **médio prazo** — **modal/confirmação para ações administrativas destrutivas** ([§24](#24--modais--proposta)) — validar com o responsável de produto antes de construir.
- **quando necessário** — **extrair biblioteca de componentes React compartilhável**, só quando houver uma terceira superfície de produto além de Landing e Portal, com intenção — não abstrair em cima de dois produtos só porque dois já é mais que um.

### 34 · Pendências encontradas

1. **o hero da Landing mostra um placeholder, não conteúdo original** — vídeo e imagem estática vêm, por comentário literal do script de setup, de "origem Criativo Dodô". a peça mais visível do site ainda carrega placeholder herdado.
2. **ADR de paleta antiga, sem revogação formal na série antiga de ADRs** — uma ADR do "Sistema B" nomeia laranja/roxo como fonte de verdade visual; o código implementa Cherry Red/Cotton/Maroon/Noir Black. a série de governança vigente (`ARCHITECTURAL_DECISIONS.md`) já resolve isso para fins práticos, mas a ADR antiga em si nunca foi formalmente revogada.
3. **marca secundária e emblema noir sem aplicação definida** fora do favicon e da marca d'água do login.
4. **tipografia e espaçamento não são tokens, são literais**, em ambos os produtos — diferente da cor, que é variável CSS e se propaga de verdade entre Landing e Portal.
5. **nenhum tratamento de `prefers-reduced-motion`**, em nenhum dos dois produtos — `design-system/index.html` (este site) já trata isso na própria folha de estilo, como exemplo do que falta no Portal e na Landing.
6. ~~wordmark duplicado como dois arquivos por variante~~ — **RESOLVIDO nesta auditoria**: `portal-frontend/src/assets/brand/principal.svg` tinha o `fill` da variante cherry (bug real, não só duplicação); corrigido para o conteúdo noir canônico de `app/src/assets/brand/principal.svg`. a duplicação física em si (4 cópias do wordmark, 2 cada de emblema/marca secundária, entre `app/` e `portal-frontend/`) continua sem solução de token/build compartilhado.
7. **botões administrativos são objetos de estilo inline duplicados**, com contagem real corrigida nesta auditoria: `estiloBotaoOutlineNeutro` em 4 arquivos (não 5), `estiloBotaoOutlineCherry` em 3 (não 4), `estiloBotaoPrimarioPequeno` em 2 (não 3) — mais 4 arquivos que repetem o mesmo objeto sem nomeá-lo (`AdminBriefings`, `AdminEntregas`, `Admin.tsx`, `Pendencias.tsx`), 2 deles com padding `"0 20px"` em vez de `"0 16px"` — essa é a divergência real, não a de raio que a v2.0 original alegava (ver [§16](#16--botões)).
8. **`.operational-row` não tem cabeçalho de coluna visível** — a grade de colunas fixas existe, mas nada rotula cada coluna para quem chega à lista sem contexto.
9. **nenhuma confirmação estilizada antes de ação administrativa destrutiva** — existe um precedente nativo isolado (`window.prompt()` na exclusão LGPD, `Admin.tsx`), mas o fluxo de rejeitar cadastro no mesmo arquivo não tem confirmação nenhuma (ver [§24](#24--modais--proposta)).
10. **15 ícones em `design-system/icons/` sem nenhum uso em código**, e dois deles (`campanhas`, `marcas`) carregando vocabulário de domínio descontinuado.
11. **`.pendencias-summary` (usada nas 9 telas de página) e `.portal-eyebrow` são dois padrões de "kicker de seção" quase-duplicados**, com valores ligeiramente diferentes (13.6px/maiúsculo/0.08em vs. 13px/minúsculo/0.07em) — não documentado como componente nem como drift até esta auditoria.
12. **`.portal-section-divider` não está documentado** — usado em `Admin.tsx`, `AdminDashboard.tsx`, `Financeiro.tsx`, `Perfil.tsx` para separar sub-blocos dentro de uma página.
13. **`textarea:focus-visible` não existe na regra genérica do Portal real** (`portal-frontend/src/index.css`) — só `button, a, input, select`. o campo de observações (`AdminBriefings.tsx`) fica sem foco visível garantido. (corrigido só neste site de documentação, não no Portal — ver [§29](#29--acessibilidade-wcag)).

**apêndice — notas técnicas menores:**

| achado | onde |
|---|---|
| `.acumin-bold` não corresponde a nenhuma fonte do sistema atual | `app/src/index.css`, usada em Metodologia/Café |
| borda do accordion usa `rgba(237,235,221,.3)` literal em vez de `var(--color-cotton)` | `.accordion-item` (Landing) |
| copyright do rodapé da Landing fixo em "2022", sem indicação de placeholder | `Cafe.tsx` |
| `app/README.md` ainda é o boilerplate padrão do template Vite | `app/README.md` |
| viewBox do emblema diverge por 0.1 entre o canônico (`design-system/icon.svg`, `0 0 116.2 127.2`) e as cópias em uso (`app/`/`portal-frontend/`, `0 0 116.3 127.2`) | `*/assets/brand/icon.svg` |
| nome do arquivo da marca secundária diverge: `design-system/secundário.svg` (com acento, canônico) vs. `secundario.svg` sem acento nas cópias de `app/`/`portal-frontend/` | `*/assets/brand/secundario*.svg` |

---

*Design System do Criativo Dodô, extraído do código em produção — Landing e Portal — em 28 de julho de 2026. Documento vivo: revisar contra o código antes de confiar em qualquer valor aqui.*
