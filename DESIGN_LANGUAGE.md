# DODÔ Design Language

> **O que é este documento.** A implementação v1 da arquitetura lógica instituída pela
> `ADR-021` (`knowledge/ARCHITECTURAL_DECISIONS.md`) — princípios antes de componentes,
> linguagem antes de Design System. Em vez de treze documentos separados (Manifesto, Vision
> Book, Concept Book, Reference Library, Creative Direction, Visual Language, Signature
> Moments, Editorial Patterns, Chrome Guidelines, Motion Language...), esta é a mesma
> arquitetura concentrada num documento só — a decomposição em treze permanece disponível como
> expansão futura, se o projeto crescer a ponto de exigir esse nível de especialização. Hoje,
> não exige.
>
> **De quem é.** Da marca Criativo Dodô — não do Portal. A Landing, o Portal e qualquer produto
> futuro consomem exatamente esta linguagem; o Portal é apenas a primeira implementação a
> segui-la deliberadamente. Nenhum produto redefine a linguagem — só a aplica.
>
> **Par executável.** `design-language.css`, na raiz do repositório. Todo valor executável —
> hex, px, ms, curva de easing — vive lá, nunca aqui. Este documento explica o porquê; o CSS
> declara o quê.

## A pergunta que orienta toda decisão

> **Isto pertence à linguagem, ou pertence ao componente?**
>
> Se pertence ao componente — um comportamento de um botão específico, o layout de uma tela
> específica, uma regra que só faz sentido dentro de uma peça de interface — **não entra
> aqui**. Pertence a uma implementação futura (`11_COMPONENTS`, na decomposição eventual, ou
> diretamente ao código de cada produto).
>
> Se pertence à linguagem — algo que qualquer tela, de qualquer produto, herda sem precisar
> decidir de novo — **entra aqui**. Esta pergunta orienta toda evolução futura deste documento
> e do CSS irmão; nenhuma seção deste arquivo deve, um dia, acumular uma classe de componente,
> sob pena de repetir o erro que aposentou o Design System anterior (`DESIGN.md`,
> `design-system/`): um catálogo que cresceu além do que uma linguagem deveria carregar.

## Sobre as referências citadas neste documento

Nenhuma referência entra por ser bonita. Toda referência citada abaixo entra porque ensina um
princípio reutilizável, nomeado explicitamente no ponto em que aparece — nunca como admiração
estética solta. Esta é a mesma disciplina que uma futura `Reference Library` (na decomposição
eventual) formalizaria com curadoria própria; aqui, os princípios aparecem embutidos onde são
usados.

---

## 1. Filosofia

**Por que existimos visualmente?**

A dodô não sofre do problema que a maioria das marcas tenta resolver com mais conteúdo — a
dodô existe porque a maioria das marcas "não sofre por falta de conteúdo. sofre por falta de
direção" (`DESIGN.md`, história e posicionamento). A mesma crença que orienta o serviço orienta
a interface: uma tela do Dodô existe para entregar uma decisão já tomada, nunca para exibir
dados brutos e terceirizar a interpretação para quem olha.

A frase mais recente que resume isso, e a que vale para qualquer trabalho novo — "a versão do
código é a que vale" — é a da landing em produção: **"marcas não precisam de fórmula. precisam
de norte."** Trocando "marcas" por "telas": uma tela do Dodô não precisa de mais elementos.
precisa de norte — uma prioridade clara, dita antes de qualquer número.

Esta sessão nasceu de um diagnóstico específico: o Portal, depois de duas sprints seguindo a
disciplina de derivar estritamente da Landing, "ficou mais consistente, mas continua parecendo
um sistema administrativo bem organizado, e não um produto premium." A filosofia visual existe
para fechar exatamente essa lacuna — não com mais decoração, com mais direção.

**Princípio herdado, não reinventado:** Dieter Rams — "bom design é o mínimo de design
possível." Aplicado aqui: cada elemento numa tela do Dodô só existe se carrega uma decisão real
sobre o negócio; nenhum elemento existe para a tela não parecer vazia.

## 2. Personalidade

**Como nos comportamos?**

A dodô é uma marca premium — mas premium, aqui, não é sinônimo de ostentação:

| premium não é | premium é |
|---|---|
| luxo ostentatório, dourado, glass/glow, gradiente exagerado, excesso | clareza, inteligência, refinamento, ritmo, silêncio visual, tipografia excelente, hierarquia excelente |

O teste de qualidade de qualquer decisão nova, visual ou não: **"isto parece um template, ou
parece uma decisão que nasceu da dodô?"** Se a resposta for "template", a decisão volta para a
mesa (`DESIGN.md` §03).

Disciplina com o vermelho: a identidade carrega bastante Cherry Red, e isso exige disciplina,
não repetição automática — a cor principal não domina por padrão, tem intenção (detalhado em
§7, Cor).

Tom, quando a interface fala: de quem já sabe e está contando, nunca de quem está anunciando ou
alertando. Frases curtas, minúsculas, sem exclamação, sem urgência artificial — urgência real é
comunicada por posição e peso, não por tom de voz. Isso é regra de voz de produto (documentação
completa de escrita de marca permanece em `DESIGN.md` §05); aqui, vale como o comportamento
visual equivalente: a interface nunca grita para compensar hierarquia mal resolvida.

## 3. Direção de arte

O conceito central desta linguagem: **uma tela do Dodô é uma peça editorial, não um painel de
controle.** Cada tela já processou a informação para quem lê — decidiu o que importa antes de
mostrar qualquer número — em vez de apresentar dados brutos e delegar a interpretação. É a
diferença entre uma revista e um dashboard: a revista decide a manchete; o dashboard só expõe
métricas e espera que alguém decida sozinho o que importa.

**Uma identidade, duas expressões.** A Landing e o Portal não derivam um do outro nem são
identidades paralelas — pertencem ao mesmo universo narrativo, mas cada um o expressa de forma
apropriada ao seu próprio uso (`ADR-021`): a **Landing comunica** — uma sessão de leitura
única, editorial de ponta a ponta, sem retorno. O **Portal opera** — usado todo dia, por quem
já decidiu trabalhar com a dodô; a mesma voz editorial, organizada por prioridade de trabalho
em vez de sequência narrativa.

A primeira prova real desse conceito foi a prova de conceito da tela-bandeira `/admin/hoje`
(commit `5284d81`): composição assimétrica na abertura, manchete em escala dramática, chrome
que recua para dar espaço à manchete, virada de tom no scroll entre o registro editorial de
abertura e o registro funcional de trabalho. Essa PoC testou, pela primeira vez em produto
real, romper a derivação estrita da Landing — e foi avaliada como o caminho certo.

> **Decisão fechada, 2026-08-03.** A tela de Login (`portal-frontend/src/pages/Login.tsx`,
> estado não autenticado — classes `.portal-entrada-*` em `portal-frontend/src/index.css`;
> acabamento final no commit `8558b41`) é a **referência visual definitiva do Portal**:
> composição assimétrica, Ô como arquitetura silenciosa, cherry só no título como único ponto
> de ênfase de cor, densidade de tela-bandeira, ritmo editorial. Auditada linha a linha contra
> este documento em sessão de refinamento — nenhuma violação encontrada. Toda tela nova do
> Portal herda desta referência sua hierarquia, densidade, composição, ritmo e linguagem
> editorial; a referência não herda de nenhuma tela nova. A tela de Login não deve ser alterada
> por motivo estético — só por correção de bug. Reabrir a composição exige decisão nova do
> responsável do projeto.

## 4. Princípios editoriais

Julgamento aplicável a qualquer tela nova, de qualquer produto — migrados por completo de
`ART_DIRECTION_GUIDE.md` §1, já vigentes na prática antes deste documento existir:

| Princípio | Explicação | Por que existe | Quando aplicar |
|---|---|---|---|
| Frase antes do número | Toda tela abre com uma frase de estado, em texto simples, antes de qualquer valor numérico. | Um número sem contexto obriga a pessoa a interpretar; uma frase já entrega a interpretação pronta. | No topo de qualquer tela que mostre indicadores, listas ou totais. |
| Uma prioridade por tela | Existe sempre uma única informação que domina visualmente a tela; todo o resto é deliberadamente secundário. | Telas sem prioridade obrigam a pessoa a decidir sozinha o que importa — o produto deveria ter feito essa escolha. | Ao montar qualquer tela com mais de uma informação relevante. |
| Hierarquia por peso, não por escala | Diferença entre título e corpo é feita por peso tipográfico e por reticência (menos palavras), nunca por saltos dramáticos de tamanho. | Saltos de tamanho comunicam urgência artificial; peso comunica ordem sem alarme. | Em qualquer par título/corpo, rótulo/valor, ou destaque/contexto. |
| Cor sinaliza, não organiza | Cor nunca é usada para separar seções, agrupar cards ou construir grade. Posição, peso e espaço fazem esse trabalho. | Cor organizando layout compete com cor sinalizando atenção real — as duas funções não podem coexistir sem se anular. | Sempre que a tentação for "colorir para diferenciar". |
| Vazio como decisão | Todo espaço em branco existe porque preencher aquele lugar roubaria atenção do que já está lá — nunca por hábito de parecer arejado. | Vazio sem intenção parece descuido; vazio com intenção parece cuidado. | Antes de adicionar qualquer elemento a uma área "vazia". |
| Densidade elástica | O mesmo layout respira diferente conforme o conteúdo: compacto onde a tarefa é ler rápido, generoso onde a tarefa é decidir. | Densidade fixa trata leitura e decisão como a mesma atividade — não são. | Ao desenhar qualquer lista de trabalho ao lado de qualquer ponto de decisão. |
| Sequência fixa de leitura | A ordem dos blocos de uma tela nunca muda entre visitas. | A pessoa aprende o mapa da tela uma vez e para de precisar procurar. | Em qualquer tela recorrente (dashboards, listas, painéis). |
| Números com precisão visível | Valores importantes mostram a parte que importa em destaque e a parte que só confirma exatidão (decimais, unidades) menor, ao lado — nunca escondida. | Esconder a precisão parece impreciso; destacar tudo igualmente esconde o que importa. | Em qualquer valor monetário, contagem ou métrica central da tela. |
| Interface a serviço do conteúdo | Nenhum elemento de interface existe para preencher uma tela que pareceria vazia sem ele — só existe a serviço de uma informação real. | O que a pessoa deve lembrar é o que aconteceu no negócio, não como a tela foi feita. | Antes de adicionar qualquer elemento decorativo, ícone ou card. |
| Sublinhar, não emoldurar | Destaque e estado ativo são marcados por um traço fino embaixo do elemento, nunca por uma caixa ao redor. | Caixas por toda a tela produzem a aparência de template; o traço já é um gesto próprio da marca. | Em qualquer navegação, estado ativo, ou ênfase interativa. |
| Vermelho justificado | O cherry do DODÔ nunca aparece sozinho — sempre acompanhado de uma frase que explica por que ele está ali. | Vermelho decorativo dilui o vermelho como sinal; vermelho raro e justificado mantém seu peso. | Sempre que a cor de marca for cogitada para chamar atenção. |
| Temperatura única | Nenhuma superfície do produto usa branco frio ou cinza-azulado; toda superfície clara mantém o subtom quente do papel. | Frieza cromática lê como distância; o DODÔ precisa de sofisticação sem perder proximidade. | Em qualquer definição de fundo, superfície ou cartão. |

## 5. Tipografia

> **Decisão fechada, 2026-08-03.** Work Sans e Elms Sans permanecem como as únicas duas famílias
> da linguagem — nenhuma terceira família entra sem motivo muito forte. Hierarquia é construída
> por peso, escala, ritmo e espaçamento, nunca por decoração. A tipografia não é protagonista; o
> conteúdo é. Assunto encerrado — não reabrir sem decisão nova do responsável do projeto.

A tipografia é o primeiro material desta linguagem — a composição (§6) nasce dela, não o
contrário. É também o princípio mais próximo de Massimo Vignelli e da tradição do grid suíço:
hierarquia construída por peso e posição tipográficos, nunca por decoração — e o mais próximo
de Craig Mod, que reduziu anos de um site pessoal a "font-size, line-height, largura de coluna
e letter-spacing" como os únicos graus de liberdade que de fato importam. Poucas variáveis bem
escolhidas carregam um produto inteiro; esta seção declara quais são as do Dodô.

**Duas famílias, papéis nunca intercambiáveis:**

- **Work Sans** — display. Títulos editoriais, ênfase forte, botão primário. Nunca usada em
  parágrafo de corpo.
- **Elms Sans** — corpo. Texto corrido, navegação, rótulo de formulário, overline. Nunca usada
  em título de página.

**Disciplina de peso.** Só cinco pesos existem nesta linguagem: 300, 400, 600, 700, 800. Nenhum
peso entre 100–299, nenhum 500, nenhum 900 — a restrição em si é a assinatura tipográfica, no
mesmo espírito de Cooper Hewitt (tipografia própria como âncora de identidade, antes de
qualquer paleta de cor).

**Papel de cada peso**, em prosa — os valores executáveis (tamanho em px, altura de linha) vivem
em `design-language.css`, nunca aqui:

- **800** — título editorial de página, o ponto de maior peso visual de qualquer tela.
- **700** — botão primário, valor numérico em destaque, rótulo de formulário.
- **600** — subtítulo, item de navegação, nome de item em lista — o peso "isto é
  clicável/organizador", sem ser o assunto principal da tela.
- **400** — corpo de leitura padrão.
- **300** — parágrafo de seção editorial, ícone tipográfico — o peso mais leve, reservado a
  texto que a pessoa lê por escolha, não por necessidade de tarefa.

**O que nunca fazemos.** Título em caixa alta ou capitalização de título ("Title Case") fora de
rótulos de contexto; peso fora da lista de cinco; troca de família entre display e corpo.

## 6. Composição

Se a tipografia é o material, a composição é como ele se organiza numa página — e aqui a
lição de Vignelli é literal: hierarquia por peso e posição, nunca por decoração.

**Como uma página começa.** Rótulo de contexto discreto (onde a pessoa está), título curto,
depois uma frase de estado em linguagem simples. O conteúdo numérico ou estrutural só aparece
depois dessa frase — nunca antes dela.

**Como uma página termina.** Quando a última pergunta que ela existe para responder foi
respondida. Nenhum conteúdo de rodapé é adicionado só para preencher a tela; se não há mais
nada relevante, a página termina com espaço, não com elementos de baixa prioridade forçados a
caber.

**Como assuntos são separados.** Espaço generoso e, quando necessário reforçar, um traço fino
horizontal — nunca uma caixa envolvendo cada assunto separadamente.

**Como decisões importantes aparecem.** Uma decisão (aprovar, recusar, pagar, confirmar) nunca
compete visualmente com informação de leitura passiva. Recebe espaço próprio, generoso, e vem
sempre depois da frase que explica a que ela se refere.

**Como listas funcionam.** Densas e rápidas de escanear: uma linha por item, hierarquia mínima
dentro da linha, sem decoração por item. O que precisa de atenção é sinalizado por peso de
texto ou por um traço, nunca por preencher a linha inteira de cor.

**Densidade elástica, em prática.** O mesmo layout respira diferente conforme o conteúdo: ao
redor de uma lista de trabalho, o espaço se recolhe — o objetivo é ler muitos itens rápido; ao
redor de um ponto de decisão, o espaço se expande — o objetivo é dar tempo para pensar antes de
agir. A mesma tela pode conter os dois ritmos, desde que a transição entre eles seja marcada
por uma mudança clara de respiração, nunca por uma linha arbitrária.

## 7. Cor

Quatro cores primitivas, dois papéis semânticos adicionais já derivados delas em produção
(`portal-frontend/src/styles/tokens.css`) — os valores executáveis vivem em
`design-language.css`.

**Papel de cada cor primitiva**, em prosa:

- **Cotton** — o "branco" do sistema. Nunca um branco puro ou frio; é um branco quente, o
  mesmo subtom em qualquer contexto. Reservado, no Portal, a superfícies que merecem destaque
  (cartão, sidebar) — não ao fundo padrão de leitura.
- **Papel** — fundo de leitura geral, derivado do Cotton, mais claro, sem perder o subtom
  quente. Distinção formalizada em código: Cotton deixa de ser o fundo padrão de toda tela,
  vira reserva de destaque.
- **Cherry** — ação, ênfase, sinal. Nunca fundo de seção inteira em produto de uso contínuo;
  sempre acompanhado de uma frase que explica sua presença (princípio "vermelho justificado",
  §4).
- **Maroon** — variação escura do vermelho, usada como seção sólida própria — nunca ao lado do
  Cherry como texto sobre fundo (contraste 1.27:1, reprova WCAG AA).
- **Noir / escala de grafite** — texto e estrutura. A escala de grafite (quatro tons, derivados
  do Noir por mistura com o Papel) resolve texto secundário e bordas com token formal, em vez
  de valores `rgba()` ad-hoc espalhados pelo código.

**Disciplina de aplicação.** Cor nunca organiza layout (nenhum agrupamento de card por
categoria colorida) — só sinaliza atenção real. Temperatura única: nenhuma superfície usa
branco frio ou cinza-azulado, em nenhum contexto, em nenhum produto.

## 8. Imagem

Fotografia e artefato visual só entram numa tela do Dodô quando representam algo real do
negócio — nunca como preenchimento. A prova de conceito da tela-bandeira `/admin/hoje` declarou
essa regra com uma lacuna honesta, não uma licença criativa: o endpoint que exporia o material
real enviado por uma parceira ainda não existe hoje (`Entrega.materialEnviado`, especificado no
domínio, sem rota de arquivo estática) — e a resposta, diante dessa lacuna, foi um **placeholder
tipográfico honesto, nunca uma foto de banco de imagens.**

Essa é a regra permanente, não uma solução temporária de uma tela: quando não há artefato real
para mostrar, a linguagem se apoia em tipografia e composição — nunca em imagem genérica
emprestando a aparência de conteúdo que não existe.

## 9. Chrome

Chrome é tudo que orienta a pessoa sobre onde ela está — navegação, cabeçalho, breadcrumb.
Conteúdo é a informação real do negócio. A regra entre os dois é a mesma do princípio "interface
a serviço do conteúdo" (§4): chrome nunca compete visualmente com conteúdo.

**Comportamento padrão.** Fixo, discreto, eyebrow + título, sem recuo.

**Comportamento na tela-bandeira.** Validado pela PoC `/admin/hoje`: o chrome recua na abertura
da tela, cede espaço à manchete editorial, e retorna conforme o scroll avança em direção ao
conteúdo de trabalho. A abertura de uma tela-bandeira é a primeira impressão — chrome de
produto não deveria competir com ela.

**O que nunca é chrome.** Nenhum elemento decorativo é promovido a chrome. Se não orienta a
pessoa sobre onde ela está, é conteúdo mal categorizado ou decoração a remover.

## 10. Movimento

Algo só se move em resposta a uma mudança real de estado — nunca por hábito de parecer moderno.
Animação decorativa sem relação com mudança de estado é, explicitamente, um anti-padrão (§11).

**A curva.** Uma curva única, já real e em uso em ambos os produtos —
`cubic-bezier(0.25, 1, 0.5, 1)` — presente, sem nome, nas transições da Landing
(`.nav-link::after`, `.accordion-content`) e, nomeada como `--ease-editorial`, no Portal
(`portal-frontend/src/styles/tokens.css`), incluindo a virada de tom da PoC `/admin/hoje`. Esta
linguagem adota o nome já em uso no Portal como o nome oficial da curva em toda a marca.

**Gatilhos legítimos.** Troca de prioridade visual em tela, aparecimento de sublinhado de
ênfase, transição de registro editorial→funcional (a virada de tom no scroll da tela-bandeira,
via `IntersectionObserver` — nunca scroll-jacking genérico).

## 11. Anti-padrões

O que **não é** DODÔ, mesmo que apareça em algum produto de referência — migrado por completo
de `ART_DIRECTION_GUIDE.md` §2, expandido com os erros de engenharia já diagnosticados em
`DESIGN.md` §06:

**De identidade:**

- KPI como primeira informação da tela, antes de qualquer frase de contexto.
- Cards usados para preencher espaço, sem conteúdo real que os justifique.
- Cor organizando layout (cards coloridos por categoria, grade colorida por status).
- Interfaces que parecem templates prontos, reconhecíveis de qualquer produto SaaS genérico.
- Bordas desenhando toda a página (todo elemento dentro de uma caixa com contorno).
- Componentes chamando mais atenção do que o conteúdo que carregam.
- Grades simétricas de cards do mesmo tamanho, tratando informações desiguais como iguais.
- Ícones decorando linhas ou rótulos sem adicionar significado.
- Selos, badges ou emblemas de "verificado" como prova de confiança.
- Densidade uniforme aplicada a toda a tela, ignorando se o conteúdo é leitura ou decisão.
- Hierarquia construída só por tamanho de fonte, sem variação de peso.
- Excesso de linhas divisórias separando blocos que já estão separados pelo espaço.
- Números sem contexto textual ao lado.
- Qualquer superfície branca fria (sem subtom de papel).
- Títulos em caixa alta ou capitalização de título fora de rótulos de contexto.
- Animações decorativas sem relação com uma mudança real de estado.
- Telas que só fazem sentido comparadas a um dashboard de mercado — o DODÔ não é um painel de
  métricas, é um produto de relação entre marca e parceira.

**De implementação** (herdado de `DESIGN.md` §06 — a lição de três gerações de Design System
abandonadas, uma a uma, por não checar contra o código real):

- Inventar token porque "parece que deveria existir" — sempre extrair do código antes de
  propor, marcar "PENDENTE" o que não está definido.
- Copiar um objeto de estilo (ou uma classe) de uma tela para a próxima, em vez de nomear um
  padrão repetido três ou mais vezes.
- Redesenhar o logotipo em vez de recolorir os arquivos oficiais.
- Deixar vermelho dominar uma tela de uso contínuo.
- Documentar identidade sem checar contra o código real em produção — a única lição que este
  documento existe, estruturalmente, para não repetir.

## 12. Ponte para `design-language.css`

Este documento não contém nenhum valor executável — nenhum hex, nenhum px, nenhum ms, nenhuma
curva declarada por número. Todo valor mencionado em prosa acima (as cinco famílias de peso,
as quatro cores primitivas, a curva de movimento, os papéis de superfície) tem sua forma
executável definida em `design-language.css`, par técnico deste documento.

A regra que evita este documento voltar a crescer até virar um catálogo: qualquer novo valor
executável entra primeiro no CSS, nunca aqui; qualquer novo princípio de julgamento entra
primeiro aqui, nunca como comentário solto no CSS. **Isto pertence à linguagem, ou pertence ao
componente?** — a mesma pergunta do topo deste documento, aplicada agora à fronteira entre os
dois arquivos: se pertence à linguagem, mora num dos dois; nunca num terceiro lugar, nunca
copiado nos dois.
