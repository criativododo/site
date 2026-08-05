# ART_DIRECTION_GUIDE.md

**Status:** vigente. Deriva da Direção de Arte do DODÔ V2, aprovada. Este documento não é
uma reinterpretação dela — é a mesma direção reescrita como sistema de decisão, para que
qualquer designer ou IA projete telas novas sem precisar reler o manifesto a cada vez.

Qualquer tela nova do Portal DODÔ deve ser julgada por este documento antes de ser aprovada.

---

## 1. Princípios Fundamentais

| Princípio | Explicação | Por que existe | Quando aplicar |
|---|---|---|---|
| Frase antes do número | Toda tela abre com uma frase de estado, em texto simples, antes de qualquer valor numérico. | Um número sem contexto obriga a pessoa a interpretar; uma frase já entrega a interpretação pronta. | No topo de qualquer tela que mostre indicadores, listas ou totais. |
| Uma prioridade por tela | Existe sempre uma única informação que domina visualmente a tela; todo o resto é deliberadamente secundário. | Telas sem prioridade obrigam a pessoa a decidir sozinha o que importa — o produto deveria ter feito essa escolha. | Ao montar qualquer tela com mais de uma informação relevante. |
| Hierarquia por peso, não por escala | Diferença entre título e corpo é feita por peso tipográfico e por reticência (menos palavras), nunca por saltos dramáticos de tamanho. | Saltos de tamanho comunicam urgência artificial; peso comunica ordem sem alarme. | Em qualquer par título/corpo, rótulo/valor, ou destaque/contexto. |
| Cor sinaliza, não organiza | Cor nunca é usada para separar seções, agrupar cards ou construir grade. Posição, peso e espaço fazem esse trabalho. | Cor organizando layout compete com cor sinalizando atenção real — as duas funções não podem coexistir sem se anular. | Sempre que a tentação for "colorir para diferenciar". |
| Vazio como decisão | Todo espaço em branco existe porque preencher aquele lugar roubaria atenção do que já está lá — nunca por hábito de parecer arejado. | Vazio sem intenção parece descuido; vazio com intenção parece cuidado. | Antes de adicionar qualquer elemento a uma área "vazia". |
| Densidade elástica | O mesmo layout respira diferente conforme o conteúdo: compacto onde a tarefa é ler rápido (filas, listas de trabalho), generoso onde a tarefa é decidir (aprovar, pagar, confirmar). | Densidade fixa trata leitura e decisão como a mesma atividade — não são. | Ao desenhar qualquer lista de trabalho ao lado de qualquer ponto de decisão. |
| Sequência fixa de leitura | A ordem dos blocos de uma tela nunca muda entre visitas. | A pessoa aprende o mapa da tela uma vez e para de precisar procurar. | Em qualquer tela recorrente (dashboards, listas, painéis). |
| Números com precisão visível | Valores importantes mostram a parte que importa em destaque e a parte que só confirma exatidão (decimais, unidades) menor, ao lado — nunca escondida. | Esconder a precisão parece impreciso; destacar tudo igualmente esconde o que importa. | Em qualquer valor monetário, contagem ou métrica central da tela. |
| Interface a serviço do conteúdo | Nenhum elemento de interface existe para preencher uma tela que pareceria vazia sem ele — só existe a serviço de uma informação real. | O que a pessoa deve lembrar é o que aconteceu no negócio, não como a tela foi feita. | Antes de adicionar qualquer elemento decorativo, ícone ou card. |
| Sublinhar, não emoldurar | Destaque e estado ativo são marcados por um traço fino embaixo do elemento, nunca por uma caixa ao redor. | Caixas por toda a tela produzem a aparência de template; o traço já é um gesto próprio da marca. | Em qualquer navegação, estado ativo, ou ênfase interativa. |
| Vermelho justificado | O cherry do DODÔ nunca aparece sozinho — sempre acompanhado de uma frase que explica por que ele está ali. | Vermelho decorativo dilui o vermelho como sinal; vermelho raro e justificado mantém seu peso. | Sempre que a cor de marca for cogitada para chamar atenção. |
| Temperatura única | Nenhuma superfície do produto usa branco frio ou cinza-azulado; toda superfície clara mantém o subtom quente do papel. | Frieza cromática lê como distância; o DODÔ precisa de sofisticação sem perder proximidade. | Em qualquer definição de fundo, superfície ou cartão. |
| Voz em minúsculas | Títulos e rótulos de interface são escritos em minúsculas, como quem fala, não como quem anuncia. | É um dos poucos traços que já soam como DODÔ hoje e não como qualquer outro software. | Em todo texto de interface gerado pelo produto (não em nomes próprios ou dados do usuário). |

---

## 2. Anti-princípios

O que **não é** DODÔ, mesmo que apareça em algum produto de referência:

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
- Títulos em caixa alta ou capitalização de título ("Title Case") fora de rótulos de contexto.
- Animações decorativas sem relação com uma mudança real de estado.
- Telas que só fazem sentido comparadas a um dashboard de mercado (bolsa, analytics, BI) — o DODÔ não é um painel de métricas, é um produto de relação entre marca e parceira.

---

## 3. Gramática Visual

Regras de intenção, não de pixel.

**Como uma página começa**
Toda página abre com um rótulo de contexto discreto (onde a pessoa está) seguido de um
título curto e, então, uma frase de estado em linguagem simples. O conteúdo numérico ou
estrutural só aparece depois dessa frase — nunca antes dela.

**Como uma página termina**
Uma página termina quando a última pergunta que ela existe para responder foi respondida.
Não existe conteúdo de rodapé adicionado só para preencher a tela; se não há mais nada
relevante, a página termina com espaço, não com elementos de baixa prioridade forçados a
caber.

**Como assuntos são separados**
Um assunto termina e outro começa com espaço generoso e, quando necessário reforçar,
um traço fino horizontal — nunca com uma caixa envolvendo cada assunto separadamente.

**Como decisões importantes aparecem**
Uma decisão (aprovar, recusar, pagar, confirmar) nunca compete visualmente com informação
de leitura passiva. Recebe espaço próprio, generoso, e vem sempre depois da frase que
explica a que ela se refere — a pessoa entende antes de agir.

**Como listas funcionam**
Listas de trabalho são densas e rápidas de escanear: uma linha por item, hierarquia mínima
dentro da linha, sem decoração por item. O que precisa de atenção dentro de uma lista é
sinalizado por peso de texto ou por um traço, nunca por preencher a linha inteira de cor.

**Como números são apresentados**
Todo número relevante vem acompanhado de uma frase ou rótulo que diz o que ele significa
antes de o valor aparecer. Números que exigem precisão mostram a parte que importa maior
e a parte de confirmação menor, na mesma linha, nunca em elementos separados.

**Como títulos são escritos**
Título é uma frase mínima, em minúsculas, que poderia ser lida em voz alta sem soar como
anúncio. Nunca repete o que o rótulo de contexto já disse.

**Como o espaço em branco muda conforme o contexto**
Ao redor de listas de trabalho, o espaço se recolhe — o objetivo é ler muitos itens rápido.
Ao redor de um ponto de decisão, o espaço se expande — o objetivo é dar tempo para pensar
antes de agir. A mesma tela pode conter os dois ritmos, desde que a transição entre eles
seja marcada por uma mudança clara de respiração, não por uma linha arbitrária.

---

## 4. Linguagem Editorial

Direção como se fosse dada a quem edita uma revista, não a quem programa uma tela.

**Ritmo** — uma ideia por vez, lida uma única vez, sem necessidade de voltar. Cada bloco
resolve uma pergunta e para antes de abrir a próxima. Nunca dois assuntos concorrendo pela
mesma respiração.

**Temperatura** — quente em toda a extensão da página. Não existe zona fria (cinza-azulado,
branco puro, contorno técnico) em nenhuma superfície. O calor vem do subtom de papel que
nunca desaparece, mesmo quando a superfície clareia.

**Tom** — de quem já sabe e está contando, não de quem está anunciando ou alertando.
Frases curtas, em minúsculas, sem pontos de exclamação, sem linguagem de urgência
artificial. Urgência real é comunicada por posição e peso, não por tom de voz.

**Densidade** — varia com a função do conteúdo, não é constante na página. Compacta onde
o trabalho é ler rápido; generosa onde o trabalho é decidir. A variação de densidade é,
em si, um sinal de que a tela está organizada por intenção.

**Velocidade de leitura** — uma página do DODÔ deve poder ser lida por completo, do início
ao fim, sem esforço de retomada. Se uma pessoa precisa parar, procurar, ou reler um trecho
para entender onde estava, a hierarquia falhou.

---

## 5. Assinaturas do DODÔ

Características que, juntas, tornam uma tela reconhecível como DODÔ mesmo sem logotipo.

| Nome | Descrição | Motivação | Exemplo de aplicação |
|---|---|---|---|
| Frase-abertura | Toda tela abre com uma frase de estado em linguagem simples, antes de qualquer número. | Substitui a sensação de painel de controle pela sensação de já ter sido informado. | "onde você precisa agir agora, num só lugar" antes dos indicadores do painel administrativo. |
| Sublinhado de ênfase | Traço fino embaixo do elemento em destaque, nunca caixa ao redor. | É o gesto de ênfase mais silencioso possível — já existe na navegação da marca. | Item de navegação ativo, link em foco, estado selecionado. |
| Vermelho justificado | Cherry só aparece acompanhado de uma frase que explica sua presença. | Mantém o vermelho raro e, por isso, significativo. | Um valor "atrasado" em cherry, ao lado do texto "materiais atrasados". |
| Número com precisão visível | Parte inteira em peso maior, parte de confirmação (decimais, unidade) em peso menor, mesma linha. | Comunica exatidão sem exigir leitura de dois elementos separados. | Valor monetário pendente, com centavos discretamente menores. |
| Título em minúsculas | Títulos e rótulos de interface nunca usam capitalização de anúncio. | Um dos poucos traços já autenticamente DODÔ hoje. | "painel administrativo", "financeiro", "entregas". |
| Papel quente | Nenhuma superfície é branco frio; toda superfície clara mantém subtom quente. | Sofisticação sem distância. | Fundo de leitura geral da tela, mesmo quando clareado além do cotton padrão. |
| Eyebrow discreto | Rótulo pequeno, versalete, cherry, antes de cada título, sem competir com ele. | Assina contexto sem elevar o volume visual da página. | "administração" acima de "painel administrativo". |
| Densidade elástica | O mesmo layout respira diferente entre listas de trabalho e pontos de decisão. | Trata leitura e decisão como atividades diferentes, porque são. | Fila de pendências compacta ao lado de uma ação de aprovação espaçosa. |
| Uma prioridade por tela | Uma única informação domina visualmente; as demais são deliberadamente secundárias. | Evita que a pessoa precise decidir sozinha o que importa. | O que "requer sua ação" vem antes dos "indicadores gerais". |
| Sequência fixa de leitura | A ordem dos blocos nunca muda entre visitas. | A pessoa aprende o mapa da tela uma vez. | Mesma ordem de seções em toda visita ao painel administrativo. |
| Silêncio cromático | Cor nunca organiza layout, só sinaliza atenção real. | Preserva o peso do vermelho e evita aparência de template colorido. | Nenhum agrupamento de cards por cor de categoria. |
| Linha divisória única | Transição entre assuntos marcada por um traço fino, nunca por uma caixa. | Separa sem fragmentar a página em compartimentos. | Divisão entre "requer sua ação" e "indicadores gerais". |
| Ausência de selos | Nenhum ícone de "verificado" ou emblema decorativo de confiança. | Confiança vem da previsibilidade da tela, não de um símbolo. | Nenhum badge de status "verificado" ou "seguro" em nenhuma tela. |
| Ritmo de parágrafo | Texto de interface escrito em frases completas, não em fragmentos técnicos. | Mantém o tom de quem fala, não de quem rotula. | "nada pendente de ação agora" em vez de "0 pendências". |

---

## 6. Critérios de Revisão

Checklist obrigatória antes de aprovar qualquer tela nova.

- [ ] Esta tela parece um dashboard genérico, reconhecível de qualquer outro produto SaaS?
- [ ] O conteúdo vem antes da interface, ou a interface está competindo por atenção?
- [ ] A cor está informando algo real, ou está apenas decorando?
- [ ] A pessoa entende a situação (frase de estado) antes de ver qualquer número?
- [ ] O espaço em branco está criando ritmo de leitura, ou é apenas vazio sem intenção?
- [ ] Existe algum elemento emoldurado por caixa que poderia, em vez disso, ser sublinhado?
- [ ] Existe algum vermelho aparecendo sem uma frase ao lado que justifique sua presença?
- [ ] A hierarquia foi construída por peso e posição, ou por tamanho de fonte e cor?
- [ ] Cada card ou bloco existe porque carrega conteúdo real, ou foi adicionado para a tela não parecer vazia?
- [ ] A ordem dos blocos é a mesma que a pessoa já viu em uma visita anterior a essa tela?
- [ ] O título está em minúsculas e diz o essencial em poucas palavras?
- [ ] Existe densidade elástica — a tela respira diferente entre listas de trabalho e pontos de decisão?
- [ ] Essa tela poderia ser confundida com a de outro produto se o logotipo fosse removido?

Uma tela só está pronta para aprovação quando todas as respostas estiverem alinhadas com
a direção descrita neste documento.

---

## 7. Impacto no Design System

Regras que o Design System DODÔ precisa passar a suportar. Regras, não componentes.

- **Superfície "papel"**: novo token de fundo near-white, derivado de `--color-cotton`,
  para uso como fundo de leitura geral — mais claro que o cotton atual, sem perder o
  subtom quente. `--color-cotton` passa a ser reservado a blocos e cartões que merecem
  destaque de superfície, não ao fundo padrão de toda tela.
- **Escala de grafite**: nova escala de tons neutros derivada de `--color-noir` por mistura
  com a superfície de papel, em incrementos definidos, para texto secundário e estrutura —
  hoje essa necessidade é coberta por decisões pontuais sem token formal.
- **Revisão da regra de título**: `.title-editorial` deixa de usar `--color-cherry` como
  cor padrão. Cherry passa a ser aplicação condicional — reservado a números e estados que
  exigem atenção real, sempre acompanhado de texto explicativo, nunca cor padrão de título.
- **Regra de ênfase por sublinhado**: sublinhado (traço inferior fino) torna-se o mecanismo
  padrão de destaque interativo e estado ativo, com prioridade sobre bordas ao redor como
  primeira escolha de qualquer novo componente.
- **Regra tipográfica de números**: par de peso/tamanho definido para "valor em destaque"
  (parte inteira) e "valor de confirmação" (decimais/unidade), a ser usado sempre que um
  número precisar comunicar precisão sem perder legibilidade da parte que importa.
- **Extensão semântica da escala de espaçamento**: distinguir formalmente "espaço de
  leitura" (entre itens de lista, mais compacto) de "espaço de decisão" (ao redor de ações
  importantes, mais generoso) — hoje a mesma escala numérica serve aos dois sem essa
  distinção de intenção.
- **Regra de voz em minúsculas**: todo rótulo, título e mensagem de interface gerado pelo
  produto é escrito em minúsculas — precisa constar como diretriz de conteúdo do Design
  System, não apenas como convenção de código.
- **Uso deliberado de `--ease-editorial`**: a curva de movimento já declarada no Design
  System passa a ser aplicada em transições de ênfase (aparecimento de sublinhado, troca de
  prioridade visual em tela) — hoje declarada mas não utilizada no Portal.

Este documento é soberano para decisões de direção de arte do Portal DODÔ. Qualquer
exceção precisa de justificativa explícita registrada junto à tela que a solicita, seguindo
o mesmo padrão de decisão usado para desvios do Design System.
