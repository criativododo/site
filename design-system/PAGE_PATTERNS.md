# PAGE_PATTERNS.md — MK 1/5

## Fundação e Soberania do Sistema

```md
# PAGE_PATTERNS.md

## 1. O Propósito deste Documento

O PAGE_PATTERNS.md define como páginas inteiras são concebidas, estruturadas e aprovadas dentro do ecossistema DODÔ.

Este documento não define componentes individuais.

Ele define a arquitetura de experiência:

- como uma página organiza informação;
- como uma pessoa percorre uma tarefa;
- como blocos se combinam;
- como contexto é preservado;
- como agentes de IA devem escolher estruturas existentes antes de criar novas.

Uma página DODÔ nunca nasce de uma tela vazia.

Ela nasce de uma intenção, passa por um padrão aprovado e é composta por estruturas existentes.

---

# 2. A Lei Fundamental da Página DODÔ

## Nenhuma página é desenhada. Toda página é composta.

A construção deve seguir obrigatoriamente:

Intenção do usuário

↓

Page Pattern aprovado

↓

Template estrutural

↓

Blocks existentes

↓

Components existentes

↓

Tokens oficiais


Qualquer implementação que comece criando:

- novos containers;
- novos grids;
- novas hierarquias;
- novas estruturas de navegação;
- novos agrupamentos visuais;

sem validar o padrão existente é considerada uma violação arquitetural.

---

# 3. A Hierarquia Oficial de Construção

Toda interface DODÔ respeita a seguinte ordem:

```

DESIGN LANGUAGE
↓
TOKEN RULES
↓
COMPONENT RULES
↓
PAGE PATTERNS
↓
TEMPLATES
↓
BLOCKS
↓
PAGES

```

Cada camada possui uma responsabilidade específica.

---

# 4. Component

## Definição

Component é a menor unidade funcional reutilizável.

Ele resolve um comportamento isolado.

Exemplos:

- botão;
- campo;
- indicador;
- texto;
- navegação;
- tabela.

Um componente:

- não conhece o negócio;
- não conhece a página onde será usado;
- não decide hierarquia;
- não controla narrativa.

Ele apenas executa sua função.

---

# 5. Compound Component

## Definição

Compound Component é uma composição de componentes que trabalham juntos como uma unidade.

Ele existe quando componentes individuais possuem uma relação estrutural inseparável.

Exemplo:

Um formulário:

```

FormField

├── Label
├── Input
├── Helper Text
└── Error Message

```

A regra:

Não criar Compound Components apenas para agrupar visualmente elementos.

A composição precisa resolver um comportamento recorrente.

---

# 6. Pattern

## Definição

Pattern é uma solução repetível para um problema de experiência.

Ele não é um componente maior.

Ele representa uma decisão de interação.

Exemplos:

- fluxo de aprovação;
- revisão de conteúdo;
- cadastro;
- acompanhamento de campanha;
- análise de dados.

Um Pattern responde:

"Como o usuário deve completar essa tarefa?"

---

# 7. Block

## Definição

Block é uma unidade funcional completa formada por componentes e patterns.

Ele possui:

- objetivo claro;
- contexto próprio;
- dados definidos;
- comportamento conhecido.

Exemplos:

```

Bloco de Pagamentos

=
Tabela
+
Filtros
+
Estados
+
Ações

```

ou:

```

Bloco de Campanha

=
Resumo
+
Métricas
+
Conteúdos
+
Pendências

```

---

# 8. Template

## Definição

Template é a estrutura espacial vazia de uma página.

Ele define:

- posição;
- ritmo;
- hierarquia;
- áreas disponíveis.

Ele NÃO define:

- dados;
- regras de negócio;
- chamadas de API;
- conteúdo específico.

Template é o palco.

---

# 9. Page

## Definição

Page é a aplicação final.

Ela combina:

```

Template
+
Blocks
+
Dados reais
+
Estado do usuário

```

Uma Page é específica.

Um Template é reutilizável.

---

# 10. Regra da Não Invenção

Antes de criar qualquer página, o agente deve responder:

## Pergunta 1

Existe um Page Pattern adequado?

Se sim:

usar obrigatoriamente.

---

## Pergunta 2

Existe um Template adequado?

Se sim:

compor.

---

## Pergunta 3

Existe um Block equivalente?

Se sim:

reutilizar.

---

## Pergunta 4

Nada existe?

A IA não cria imediatamente.

Ela registra:

"Não existe padrão aprovado para esta necessidade."

A criação de um novo Page Pattern exige decisão humana registrada no DECISIONS.md.

---

# 11. O Erro Fundamental que Este Documento Evita

Sem PAGE_PATTERNS.md, agentes tendem a criar:

- páginas SaaS genéricas;
- dashboards com excesso de cards;
- grids simétricos sem propósito;
- cabeçalhos duplicados;
- navegação inconsistente;
- layouts diferentes para a mesma função.

O DODÔ não cresce pela quantidade de telas.

O DODÔ cresce pela consistência das decisões.

---

# 12. Princípio Permanente

Uma página excelente não é aquela que possui mais elementos.

É aquela que remove tudo que não ajuda o usuário a tomar a próxima decisão.

```

---

## Base arquitetural utilizada

A separação entre componentes, padrões e templates segue a lógica adotada por sistemas maduros: componentes resolvem unidades menores; padrões resolvem problemas recorrentes de experiência; templates organizam estruturas de página. ([Design VA][1])

Templates existem para permitir montagem consistente de páginas usando componentes e padrões aprovados, evitando que cada página seja criada do zero. ([Sistema de Design do Governo Escocês][2])

**Fim do MK 1/5.**

[1]: https://design.va.gov/patterns/?utm_source=chatgpt.com "Patterns - VA.gov Design System"
[2]: https://designsystem.gov.scot/styles/page-template?utm_source=chatgpt.com "Page template - Design System"

---

# PAGE_PATTERNS.md — MK 2/5

## Arquitetura de Padrões e Templates Oficiais

```md
# 13. A Arquitetura de Composição de Páginas

O DODÔ não constrói páginas como agrupamentos visuais.

Uma página não é uma coleção de componentes colocados lado a lado.

Uma página é uma experiência orientada por intenção.

A arquitetura segue:

```

Usuário
↓
Objetivo
↓
Pattern
↓
Template
↓
Blocks
↓
Components
↓
Tokens

```

Cada camada possui uma responsabilidade.

Nenhuma camada deve absorver responsabilidades da outra.

```

A separação entre componentes, templates e patterns segue uma prática comum em Design Systems maduros: componentes resolvem unidades menores; templates organizam páginas; patterns resolvem problemas recorrentes de experiência. ([Design VA][1])

---

```md
# 14. A Regra do Pattern Antes do Layout

Antes de criar qualquer tela, identificar:

1. Qual problema o usuário está tentando resolver?
2. Qual ação principal precisa acontecer?
3. Qual nível de atenção essa ação exige?
4. Existe um Pattern aprovado para esse comportamento?

A pergunta proibida:

"Como podemos desenhar essa página?"

A pergunta correta:

"Qual experiência já aprovada resolve essa necessidade?"

```

---

# 15. Catálogo Inicial de Page Patterns DODÔ

Toda página deve pertencer obrigatoriamente a um dos padrões abaixo.

Caso nenhuma categoria exista:

não criar uma página nova.

Criar uma proposta de novo Pattern.

---

# Pattern 01 — Dashboard Operacional

## Objetivo

Permitir tomada de decisão rápida.

Usado para:

* gestão interna;
* acompanhamento operacional;
* visão administrativa;
* indicadores.

---

## Estrutura:

```
Narrative Header

↓

Bloco Quente
(decisão imediata)

↓

Bloco Morno
(próximas ações)

↓

Bloco Frio
(informação histórica)
```

---

## Regras:

O Dashboard deve:

* priorizar ação;
* reduzir leitura desnecessária;
* evitar excesso de indicadores;
* separar decisão de consulta.

---

Proibido:

* mosaico de cards;
* dezenas de KPIs competindo;
* gráficos sem ação associada;
* dashboards "painel de avião".

---

# Pattern 02 — Lista de Trabalho

## Objetivo

Permitir execução repetitiva.

Usado para:

* pagamentos;
* conteúdos;
* aprovações;
* pendências.

---

## Estrutura:

```
Título

↓

Filtros essenciais

↓

Lista operacional

↓

Ação contextual
```

---

## Regras:

Linhas devem:

* priorizar escaneabilidade;
* mostrar informação crítica primeiro;
* evitar decoração;
* reduzir movimento ocular.

---

Proibido:

* transformar cada item em card;
* criar caixas individuais;
* adicionar bordas sem função.

---

# Pattern 03 — Zona de Decisão

## Objetivo

Resolver uma ação importante.

Usado para:

* aprovar;
* confirmar;
* enviar;
* gerar documentos.

---

## Estrutura:

```
Contexto

↓

Explicação curta

↓

Decisão

↓

Ação principal
```

---

## Regras:

Uma decisão importante deve possuir:

* contexto suficiente;
* consequência clara;
* ação evidente.

---

A interface nunca deve perguntar:

"Qual botão eu clico?"

Ela deve responder:

"Qual é o próximo passo correto?"

---

# Pattern 04 — Experiência de Influenciadora

## Objetivo

Priorizar relacionamento, clareza e acompanhamento.

Usado para:

* portal de parceiras;
* campanhas;
* envio de materiais;
* acompanhamento.

---

## Características:

Mais humano.

Mais visual.

Menos operacional.

---

Deve priorizar:

* orientação;
* progresso;
* confiança;
* próximos passos.

---

Não deve copiar:

* dashboard administrativo;
* linguagem interna;
* excesso de dados.

---

# Pattern 05 — Página Editorial

## Objetivo

Transmitir conhecimento, estratégia ou narrativa.

Usado para:

* relatórios;
* apresentações;
* diagnósticos;
* documentos estratégicos.

---

## Características:

* leitura confortável;
* ritmo controlado;
* hierarquia tipográfica;
* espaço negativo.

---

Proibido:

* densidade de sistema administrativo;
* excesso de controles;
* interrupções constantes.

````

---

# 16. Escolha Automática de Pattern pela IA

Antes de criar qualquer interface, Claude Code deve executar:

```md
CHECKLIST PRÉ-IMPLEMENTAÇÃO

[ ] Qual é o objetivo principal desta página?

[ ] Quem é o usuário?

[ ] Qual decisão precisa acontecer?

[ ] Existe Pattern existente?

[ ] Existe Template existente?

[ ] Existem Blocks reutilizáveis?

[ ] Componentes existentes resolvem a necessidade?

[ ] Estou criando algo novo sem autorização?
````

Se qualquer resposta indicar existência prévia:

reutilizar.

---

# 17. Regra de Responsabilidade

## Template controla:

* estrutura;
* posicionamento;
* ritmo;
* áreas da página.

## Pattern controla:

* comportamento;
* fluxo;
* experiência.

## Block controla:

* unidade funcional.

## Component controla:

* interação visual.

## Page controla:

* dados reais.

---

Nunca:

* colocar lógica de negócio em Component;
* colocar API em Template;
* colocar layout inteiro dentro de Page;
* criar Pattern para resolver apenas estética.

---

# 18. A Regra da Exceção

Um novo Page Pattern somente pode nascer quando:

1. Existe uma necessidade recorrente.
2. Os Patterns existentes falham.
3. A solução será usada em múltiplos contextos.
4. Existe documentação no DECISIONS.md.

Uma página isolada nunca justifica um novo padrão.

---

# 19. Princípio Permanente

O sistema DODÔ cresce por redução de escolhas.

Quanto menos decisões arbitrárias existirem durante a construção:

mais consistente será a experiência final.

```

---

## Validação arquitetural

Esta estrutura segue a distinção usada por sistemas como VA Design System: templates compõem componentes dentro de páginas, enquanto patterns combinam layouts, componentes e decisões de experiência para resolver problemas recorrentes. :contentReference[oaicite:1]{index=1}

**Fim do MK 2/5.**
```

[1]: https://design.va.gov/templates?utm_source=chatgpt.com "Templates - VA.gov Design System"

---

# PAGE_PATTERNS.md — MK 3/5

## Catálogo Oficial de Templates e Arquétipos de Página DODÔ

```md
# 20. Catálogo Oficial de Templates

O DODÔ não possui páginas infinitas.

Toda página pertence a um arquétipo aprovado.

Um Template define o espaço.

Um Pattern define o comportamento.

Um Block define a unidade funcional.

Uma Page combina esses elementos com dados reais.

A criação de páginas fora destes arquétipos exige aprovação arquitetural.

```

A separação entre templates e patterns segue a prática de Design Systems maduros: templates organizam componentes dentro de uma página; patterns resolvem problemas recorrentes de experiência combinando componentes, layout, conteúdo e acessibilidade. ([VA Design System][1])

---

# 21. Template A — Dashboard Operacional

## Objetivo

Criar uma central de decisão para usuários internos.

Este Template existe para:

* acompanhar operação;
* identificar pendências;
* priorizar ações;
* tomar decisões rápidas.

---

## Estrutura obrigatória

```
NARRATIVE HEADER

↓

BLOCO DE ATENÇÃO
(Quente)

↓

BLOCO DE EXECUÇÃO
(Morno)

↓

BLOCO DE HISTÓRICO
(Frio)
```

---

## Anatomia

### Narrative Header

Sempre contém:

* contexto;
* título;
* frase de estado.

Formato:

```
eyebrow

título

frase explicativa
```

---

### Bloco Quente

Representa:

"o que exige decisão agora"

Pode conter:

* alertas;
* aprovações;
* pendências críticas;
* próximas ações.

---

### Bloco Morno

Representa:

"o que precisa ser acompanhado"

Pode conter:

* processos em andamento;
* filas;
* tarefas futuras.

---

### Bloco Frio

Representa:

"o que serve como referência"

Pode conter:

* histórico;
* registros;
* análises.

---

## Regras

O Dashboard:

DEVE:

* priorizar decisão;
* reduzir leitura;
* mostrar ordem de importância.

NÃO DEVE:

* distribuir importância igualmente;
* criar mosaico de indicadores;
* usar cards como decoração;
* competir visualmente com o dado principal.

---

# 22. Template B — Lista Operacional

## Objetivo

Resolver tarefas repetitivas com velocidade.

Usado para:

* conteúdos;
* pagamentos;
* aprovações;
* cadastros;
* filas.

---

## Estrutura

```
HEADER

↓

CONTROLES ESSENCIAIS

↓

LISTA

↓

AÇÃO CONTEXTUAL
```

---

## Anatomia da linha

Cada item deve possuir:

```
Identificação

↓

Estado

↓

Informação crítica

↓

Próxima ação
```

---

## Regras

A lista deve ser:

* escaneável;
* previsível;
* compacta quando operacional.

---

Proibido:

```
Item

=
Card individual
+
borda
+
sombra
+
decoração
```

---

A informação deve separar-se por:

* proximidade;
* peso tipográfico;
* espaço negativo.

Não por caixas.

---

# 23. Template C — Zona de Decisão

## Objetivo

Resolver uma ação importante.

Usado para:

* aprovar;
* confirmar;
* publicar;
* gerar documentos;
* concluir processos.

---

## Estrutura

```
CONTEXTO

↓

CONSEQUÊNCIA

↓

AÇÃO
```

---

## Lei da Decisão Única

Uma tela de decisão deve possuir:

uma ação principal.

Não criar múltiplos caminhos equivalentes.

---

## A ação precisa responder:

Antes de clicar:

"Eu sei exatamente o que acontecerá?"

---

## Proibido:

* esconder consequências;
* apresentar muitas ações primárias;
* usar confirmação sem contexto.

---

# 24. Template D — Portal de Influenciadoras

## Objetivo

Criar uma experiência orientada à pessoa.

Este Template é diferente do administrativo.

Ele não otimiza operação.

Ele otimiza:

* confiança;
* clareza;
* relacionamento;
* acompanhamento.

---

## Estrutura

```
BOAS-VINDAS

↓

STATUS ATUAL

↓

PRÓXIMO PASSO

↓

HISTÓRICO
```

---

## Características

Deve transmitir:

* proximidade;
* orientação;
* segurança.

---

## Não copiar do Dashboard:

Proibido:

* tabelas densas;
* linguagem interna;
* excesso de métricas;
* aparência de sistema administrativo.

---

# 25. Template E — Relatório Editorial

## Objetivo

Apresentar estratégia, diagnóstico ou resultado.

Usado para:

* clientes;
* análises;
* apresentações;
* documentos.

---

## Estrutura

```
IDEIA CENTRAL

↓

EVIDÊNCIA

↓

INTERPRETAÇÃO

↓

RECOMENDAÇÃO
```

---

## Regras

O relatório deve parecer:

uma análise de especialista.

Não:

um painel de dados.

---

## Prioridades:

1. entendimento;
2. narrativa;
3. decisão.

---

# 26. Template F — Landing Page

## Objetivo

Comunicar posicionamento e narrativa.

---

## Estrutura:

```
ABERTURA

↓

ARGUMENTO

↓

PROVA

↓

AÇÃO
```

---

## Características:

Pode possuir:

* maior expressão visual;
* ritmo narrativo;
* composição de marca.

---

Diferente do Portal:

A Landing Page possui liberdade maior.

---

# 27. Template G — Área Editorial

## Objetivo

Leitura profunda.

Usado para:

* documentos;
* artigos;
* guias;
* conhecimento.

---

## Regras:

Priorizar:

* tipografia;
* ritmo;
* concentração.

---

Remover:

* distrações;
* controles secundários;
* excesso de navegação.

---

# 28. Regra de Escolha do Template

Antes de criar uma página:

```
QUAL É O OBJETIVO?

↓

QUEM USA?

↓

QUAL DECISÃO PRECISA ACONTECER?

↓

QUAL TEMPLATE EXISTE?
```

---

Se existir:

usar.

---

Se não existir:

não criar.

Registrar necessidade de novo padrão.

---

# 29. Evolução do Catálogo

Um novo Template somente nasce quando:

1. A necessidade aparece repetidamente.
2. Os Templates existentes falham.
3. Existe ganho real de consistência.
4. A decisão é registrada no DECISIONS.md.

---

# 30. Princípio Permanente

Templates não existem para acelerar criação de telas.

Eles existem para impedir decisões arbitrárias.

A velocidade vem da restrição.

A qualidade vem da repetição disciplinada.

```

**Fim do MK 3/5.**
```

[1]: https://dev-design.va.gov/3492/templates/?utm_source=chatgpt.com "Templates - VA.gov Design System"

---

# PAGE_PATTERNS.md — MK 4/5

## Regras de Execução, Responsividade e Governança de IA

```md
# 31. Protocolo de Construção de Página

Toda criação de página no DODÔ deve seguir um protocolo obrigatório.

Nenhuma IA, designer ou desenvolvedor inicia pelo código.

O fluxo correto é:

```

Identificar intenção

↓

Selecionar Page Pattern

↓

Selecionar Template

↓

Selecionar Blocks

↓

Compor Components

↓

Aplicar Tokens

↓

Validar experiência

```

Uma página criada fora dessa sequência representa perda de controle arquitetural.

```

A separação entre componentes, templates e patterns existe justamente para evitar que cada equipe reconstrua experiências do zero. Sistemas maduros usam templates para composição de páginas e patterns para resolver problemas recorrentes de interação. ([Sistema de Design do Governo Escocês][1])

---

# 32. Algoritmo Obrigatório para Agentes de IA

Antes de gerar qualquer interface, o agente deve executar internamente:

```
PAGE_PREFLIGHT_CHECK
```

## Etapa 01 — Identificação

Responder:

```
Quem utiliza esta página?

Qual objetivo precisa ser concluído?

Qual decisão precisa acontecer?
```

---

## Etapa 02 — Classificação

Escolher obrigatoriamente:

```
ADMINISTRATIVO

INFLUENCIADORA

EDITORIAL

RELATÓRIO

LANDING

DECISÃO
```

---

## Etapa 03 — Pesquisa no sistema

Consultar:

```
PAGE_PATTERNS.md

↓

COMPONENT_RULES.md

↓

TOKEN_RULES.md

↓

IMPLEMENTATION_RULES.md
```

Antes de criar qualquer elemento novo.

---

## Etapa 04 — Verificação de existência

Perguntar:

```
Existe Template?

Existe Block?

Existe Component?

Existe Pattern?
```

Se existir:

reutilizar.

---

## Etapa 05 — Exceção

Se nada existir:

A IA NÃO cria automaticamente.

Ela deve informar:

```
Novo padrão necessário.

Solicitar aprovação arquitetural.
```

---

# 33. Responsividade como Regra Estrutural

Responsividade não é uma etapa posterior.

Ela faz parte da arquitetura da página.

Uma página DODÔ deve nascer considerando:

```
Mobile

↓

Tablet

↓

Desktop
```

---

# 34. Regra Mobile-First Transformacional

Mobile não é uma versão reduzida do desktop.

Mobile é uma reorganização da prioridade.

---

Exemplo:

Desktop:

```
Tabela operacional

Coluna
Nome
Status
Data
Valor
Ação
```

Mobile:

```
Item

Nome

Status

Informação principal

Ação
```

---

O objetivo:

preservar a decisão.

Não preservar a aparência.

---

# 35. Transformações Permitidas

## Navegação

Desktop:

```
Sidebar
```

pode transformar em:

```
Menu recolhido
Bottom navigation
Drawer
```

---

## Tabelas

Desktop:

```
Tabela completa
```

pode transformar em:

```
Lista vertical
```

---

## Blocos

Desktop:

```
Duas colunas
```

pode transformar em:

```
Fluxo único vertical
```

---

# 36. O que nunca fazer na responsividade

Proibido:

## Apenas diminuir elementos

Exemplo:

```
Desktop pequeno

↓

Mobile apertado
```

---

## Esconder informação crítica

Exemplo:

```
Desktop:
Ação disponível

Mobile:
Ação removida
```

---

## Criar layout separado sem regra

Exemplo:

```
Desktop criado por um desenvolvedor

Mobile criado por outro
```

A experiência deve ser a mesma.

---

# 37. Densidade por Contexto

Cada Pattern possui uma temperatura.

A densidade nunca é estética.

Ela depende da intenção.

---

## Alta densidade

Usada para:

* operação;
* gestão;
* análise rápida.

Exemplo:

Dashboard administrativo.

---

## Média densidade

Usada para:

* acompanhamento;
* execução;
* processos.

Exemplo:

Lista operacional.

---

## Baixa densidade

Usada para:

* estratégia;
* narrativa;
* decisão.

Exemplo:

Relatórios e apresentações.

---

# 38. Separação entre Dados e Apresentação

Nenhuma página deve misturar:

```
Layout

+

Regra de negócio

+

Busca de dados

+

Estado de sistema
```

---

Arquitetura:

```
Page

↓

Container

↓

Pattern

↓

Block

↓

Component
```

---

Responsabilidades:

## Page

Controla:

* rota;
* contexto;
* composição.

---

## Container

Controla:

* dados;
* estados;
* chamadas externas.

---

## Pattern

Controla:

* experiência.

---

## Block

Controla:

* agrupamento funcional.

---

## Component

Controla:

* interação isolada.

---

# 39. Estados Obrigatórios de Página

Toda página deve possuir definição para:

```
Estado normal

↓

Carregamento

↓

Erro

↓

Vazio

↓

Sucesso
```

---

A IA nunca deve inventar estados.

Eles devem seguir o Pattern correspondente.

---

# 40. Regra de Histórico

Páginas históricas possuem comportamento próprio.

Quando o objetivo é consulta:

```
Histórico = leitura
```

---

Não adicionar:

* edição;
* ações destrutivas;
* mudanças retroativas.

---

Histórico preserva confiança.

---

# 41. Auditoria Visual Antes da Entrega

Antes de aprovar uma página:

validar:

```
[ ] Usa Template existente?

[ ] Usa Components existentes?

[ ] Usa Tokens oficiais?

[ ] Possui hierarquia clara?

[ ] Existe uma ação principal?

[ ] Funciona no mobile?

[ ] Funciona no desktop?

[ ] Removeu elementos sem função?

[ ] Evitou padrão SaaS genérico?
```

---

# 42. O Papel da IA

A IA não é autora da arquitetura.

A IA é executora da arquitetura.

Ela deve:

* encontrar padrões existentes;
* compor estruturas aprovadas;
* preservar decisões anteriores.

Ela não deve:

* criar novas linguagens;
* inventar layouts;
* criar componentes paralelos;
* substituir padrões oficiais.

---

# 43. Regra Permanente

A velocidade do DODÔ não vem da liberdade absoluta.

Vem da eliminação das decisões repetidas.

Uma boa arquitetura de páginas permite criar rápido porque as escolhas importantes já foram feitas.

```

---

**Fim do MK 4/5.**

Base arquitetural validada: sistemas de Design System utilizam templates para manter consistência de páginas e patterns para solucionar tarefas recorrentes, evitando reconstruções independentes de experiências. :contentReference[oaicite:1]{index=1}
```

[1]: https://designsystem.gov.scot/styles/page-template?utm_source=chatgpt.com "Page template - Design System"
