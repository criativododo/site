# IMPLEMENTATION_RULES

> Constituição de Engenharia do Criativo DODÔ.
>
> Este documento governa como interfaces são implementadas.
> Ele não define identidade visual (DESIGN_LANGUAGE.md), nem decisões históricas (DECISIONS.md). Ele define COMO construir.

---

# 1. Objetivo

Toda implementação deve produzir interfaces:

- consistentes;
- previsíveis;
- reutilizáveis;
- acessíveis;
- performáticas;
- fáceis de manter.

A implementação deve reduzir decisões locais.

O sistema deve resolver problemas através de composição, nunca através de invenção.

---

# 2. Cadeia de Autoridade

Toda implementação deve obedecer rigorosamente esta ordem.

1. DESIGN_LANGUAGE.md
2. DECISIONS.md
3. AI_RULES.md
4. IMPLEMENTATION_RULES.md
5. references/
6. Design System
7. Código

Nenhuma camada inferior possui autoridade para contrariar uma superior.

---

# 3. Ordem Obrigatória de Decisão

Antes de implementar qualquer interface, siga exatamente esta sequência.

## Etapa 1

Existe regra na Design Language?

→ utilize.

## Etapa 2

Existe decisão registrada?

→ respeite.

## Etapa 3

Existe componente?

→ reutilize.

## Etapa 4

Não existe?

→ tente compor.

## Etapa 5

Não foi possível?

→ tente estender.

## Etapa 6

Somente depois disso um novo componente poderá ser proposto.

Criar componentes novos é sempre o último recurso.

Nunca o primeiro.

Esta ordem é obrigatória e segue a filosofia de composição adotada pelo ecossistema shadcn/ui, que privilegia componentes composáveis e reutilizáveis em vez da criação paralela de elementos. :contentReference[oaicite:0]{index=0}

---

# 4. Filosofia da Implementação

O DODÔ não desenvolve telas.

O DODÔ desenvolve um sistema.

Toda implementação deve aumentar a consistência do sistema.

Nunca apenas resolver uma tela específica.

Uma implementação correta deve permitir que futuras telas reutilizem exatamente a mesma solução.

---

# 5. Princípios Fundamentais

Toda implementação deve seguir os princípios abaixo.

## Composição

Sempre prefira composição.

Nunca duplicação.

## Reutilização

Sempre reutilize antes de modificar.

## Simplicidade

A menor solução correta vence.

## Consistência

Problemas iguais devem produzir soluções iguais.

## Evolução

Todo componente deve facilitar futuras alterações.

Nunca dificultá-las.

---

# 6. Fluxo Mental Obrigatório

Antes de escrever qualquer código, responda internamente:

Existe regra?

↓

Existe decisão?

↓

Existe componente?

↓

Existe composição?

↓

Existe variante?

↓

Existe extensão?

↓

Somente então considere um novo componente.

Caso qualquer etapa anterior possa resolver o problema, as etapas seguintes são proibidas.

---

# 7. Composição Sobre Invenção

Todo problema deve ser resolvido utilizando elementos existentes.

É proibido criar estruturas paralelas apenas porque parecem mais rápidas.

Sempre:

reutilizar

↓

compor

↓

estender

↓

criar

Nunca altere esta ordem.

Ela é permanente.

---

# 8. O Sistema é Maior que a Tela

Nenhuma decisão pode beneficiar uma única tela prejudicando o restante do sistema.

Toda implementação deve considerar:

- reutilização futura;
- manutenção futura;
- evolução futura;
- consistência global.

O objetivo nunca é terminar uma tela.

O objetivo é fortalecer o sistema.

---

# 9. Definição de Sucesso

Uma implementação só é considerada correta quando:

✓ segue toda a cadeia de autoridade;

✓ não cria padrões paralelos;

✓ reduz complexidade;

✓ aumenta reutilização;

✓ preserva consistência;

✓ pode ser reutilizada em futuras implementações sem modificações.

---

# 2. Arquitetura de Componentes

Esta seção define como componentes são construídos, reutilizados e evoluem.

O objetivo é impedir duplicação, reduzir dívida técnica e manter uma única linguagem de implementação.

---

# 2.1 Hierarquia de Componentes

Toda interface deve ser construída utilizando exatamente esta hierarquia.

Design Language

↓

Tokens

↓

Primitivas

↓

Componentes Compostos

↓

Layouts

↓

Features

↓

Páginas

Uma camada nunca pode assumir responsabilidades da camada superior.

---

# 2.2 Ordem Obrigatória

Toda implementação deve seguir esta sequência.

1. reutilizar

2. compor

3. estender

4. criar

Nunca altere esta ordem.

Caso uma etapa resolva o problema, todas as seguintes tornam-se proibidas.

---

# 2.3 Uso Obrigatório do shadcn/ui

Todo componente estrutural ou interativo deve nascer da fundação do shadcn/ui.

Antes de implementar qualquer interface:

1. verificar se o componente existe;

2. instalar, caso ainda não exista;

3. adaptar;

4. compor.

Nunca implemente um componente existente do shadcn manualmente.

O shadcn/ui é adotado como fundação porque fornece componentes acessíveis, composáveis e de código aberto, pensados para serem a base do Design System do produto, não uma biblioteca fechada. :contentReference[oaicite:0]{index=0}

---

# 2.4 Componentes Base

Componentes Base representam primitivas.

Exemplos:

- Button
- Input
- Card
- Badge
- Dialog
- Sheet
- Popover
- Select
- Table
- Tooltip

Eles não conhecem regras de negócio.

Eles apenas oferecem comportamento.

---

# 2.5 Componentes Compostos

Componentes Compostos combinam primitivas.

Eles representam padrões recorrentes do sistema.

Exemplos:

- DashboardCard

- CampaignCard

- InfluencerProfileCard

- PaymentSummary

- UploadArea

- MetricsGrid

Eles nunca reinventam primitivas.

Apenas organizam.

---

# 2.6 Layouts

Layouts organizam páginas.

Eles definem:

- grid;

- espaçamento;

- regiões;

- navegação;

- containers.

Layouts não implementam regras de negócio.

---

# 2.7 Páginas

Páginas apenas orquestram.

Elas:

- recebem dados;

- compõem componentes;

- organizam fluxos.

Nunca implementam estilos próprios.

Nunca implementam componentes próprios.

---

# 2.8 Ownership

Todo componente incorporado ao projeto passa a fazer parte do Design System DODÔ.

Após entrar no repositório:

- ele pertence ao projeto;

- sua evolução pertence ao projeto;

- sua manutenção pertence ao projeto.

Nunca trate componentes como caixas pretas.

O princípio de **Open Code** do shadcn/ui pressupõe exatamente essa posse do código pelo produto. :contentReference[oaicite:1]{index=1}

---

# 2.9 Componentes Novos

Um novo componente somente poderá existir quando:

✓ não existir equivalente;

✓ composição não resolver;

✓ extensão não resolver;

✓ houver reutilização prevista.

Caso contrário:

o componente não deve ser criado.

---

# 2.10 Variantes

Variantes representam comportamentos reutilizáveis.

Nunca exceções.

Uma variante somente poderá ser criada quando:

- resolver um problema sistêmico;

- possuir reutilização real;

- beneficiar múltiplas telas.

Nunca crie variantes para resolver uma única página.

---

# 2.11 Wrappers

Wrappers possuem apenas duas funções permitidas.

## Regras de negócio

Exemplo:

PermissionButton

AuthenticatedCard

ProtectedUpload

## Padronização sistêmica

Exemplo:

DodoButton

DodoDialog

DodoTable

Nunca crie wrappers apenas para trocar:

- cor;

- padding;

- border-radius;

- sombra;

- tipografia.

Mudanças visuais pertencem ao Design System.

Não ao Wrapper.

A documentação e a comunidade do shadcn convergem para usar wrappers quando há comportamento específico do produto, preservando a base para facilitar manutenção e atualizações. :contentReference[oaicite:2]{index=2}

---

# 2.12 Componentes Proibidos

É proibido reimplementar componentes que já resolvem problemas complexos de acessibilidade.

Especialmente:

- Dialog

- Popover

- Select

- Dropdown Menu

- Combobox

- Tooltip

- Form

- Sheet

- Navigation Menu

Sempre utilize a implementação existente.

Esses componentes concentram gerenciamento de foco, teclado, ARIA e composição correta. :contentReference[oaicite:3]{index=3}

---

# 2.13 Estrutura de Pastas

A arquitetura deve permanecer organizada.

Exemplo:

components/

ui/

layouts/

shared/

features/

pages/

A pasta ui representa a fundação.

Ela nunca deve conter componentes específicos do negócio.

---

# 2.14 Anti-Duplicação

Nunca implemente:

PrimaryButton

MainButton

RoundedButton

CustomButton

Se Button resolve.

Nunca implemente:

StatisticsCard

DashboardCard

AnalyticsCard

Se representam exatamente o mesmo padrão.

Problemas iguais.

Soluções iguais.

---

# 2.15 Definição de Componente Correto

Um componente é considerado correto quando:

✓ reutiliza primitivas;

✓ respeita Design Language;

✓ respeita Tokens;

✓ respeita Responsividade;

✓ respeita Acessibilidade;

✓ pode ser utilizado em múltiplos lugares;

✓ reduz complexidade do sistema;

✓ não cria arquitetura paralela.

---

# 3. Sistema Visual

O Sistema Visual garante consistência em toda a interface.

Nenhuma tela possui liberdade para criar sua própria linguagem.

Todo elemento visual deve obedecer ao Design System.

---

# 3.1 Tokens

Todo valor visual deve utilizar Tokens.

Nunca valores arbitrários.

Os Tokens representam:

- cores;

- tipografia;

- espaçamentos;

- bordas;

- sombras;

- radius;

- opacidade;

- motion;

- z-index.

Nunca implemente valores físicos diretamente.

O Design System utiliza tokens semânticos para desacoplar aparência da implementação, permitindo evolução do tema sem alterar componentes. :contentReference[oaicite:0]{index=0}

---

# 3.2 Cores

Toda cor deve possuir significado.

Nunca decoração.

Toda cor utilizada deve existir no sistema oficial.

É proibido utilizar:

- hexadecimal;

- RGB;

- HSL;

- OKLCH;

- valores arbitrários.

Sempre utilizar tokens semânticos.

Exemplo:

background

foreground

primary

secondary

muted

accent

destructive

border

ring

input

card

popover

Nunca utilizar cores diretamente no componente.

As cores pertencem ao tema.

Nunca ao componente.

O modelo recomendado pelo shadcn/ui é baseado em pares semânticos (`primary`/`primary-foreground`, `background`/`foreground`), preservando componentes enquanto apenas os tokens mudam. :contentReference[oaicite:1]{index=1}

---

# 3.3 Tipografia

Toda tipografia deve obedecer TYPOGRAPHY.md.

É proibido:

- criar novos tamanhos;

- criar novos pesos;

- utilizar fontes externas;

- criar estilos locais.

A hierarquia deve ser construída por:

- escala;

- peso;

- proximidade;

- espaço negativo.

Nunca por excesso de estilos.

---

# 3.4 Espaçamento

Todo espaçamento deve seguir a escala oficial.

Nunca utilizar:

px arbitrários

margin customizada

padding customizado

gap arbitrário

Valores mágicos são proibidos.

O ritmo visual do sistema deve permanecer constante.

---

# 3.5 Bordas

Bordas são estruturais.

Nunca decorativas.

Sempre utilizar:

- tokens;

- radius oficial;

- espessuras oficiais.

Nunca criar novos padrões.

---

# 3.6 Sombras

Sombras apenas quando comunicarem:

- profundidade;

- hierarquia;

- elevação;

- foco.

Nunca utilizar sombra como decoração.

---

# 3.7 Motion

Toda animação deve possuir função.

Nunca entretenimento.

Motion existe apenas para:

- explicar mudanças;

- preservar contexto;

- indicar estado;

- direcionar atenção.

Nunca:

- atrasar interação;

- bloquear leitura;

- impedir navegação;

- competir com conteúdo.

As transições devem permanecer rápidas, consistentes e previsíveis.

---

# 3.8 Responsividade

Toda interface deve ser responsiva.

Sem exceções.

Responsividade faz parte da implementação.

Nunca da etapa final.

Toda tela nasce responsiva.

---

# 3.9 Prioridade por Contexto

O DODÔ possui dois ambientes principais.

## Portal Administrativo

Prioridade Desktop.

Deve funcionar perfeitamente em:

- notebooks;

- desktops;

- monitores ultrawide.

Também deve funcionar em dispositivos móveis.

---

## Portal das Influenciadoras

Prioridade Mobile.

Deve funcionar perfeitamente em:

- smartphones;

- tablets.

Também deve funcionar em desktop.

A prioridade muda.

A compatibilidade permanece obrigatória.

---

# 3.10 Mobile First

Toda implementação deve utilizar Mobile First.

A complexidade aumenta conforme a tela cresce.

Nunca o contrário.

Mesmo quando um módulo possuir prioridade Desktop, sua implementação continua obedecendo à arquitetura responsiva do sistema.

O Tailwind CSS e o ecossistema shadcn/ui são estruturados sobre esse modelo de evolução progressiva da interface. :contentReference[oaicite:2]{index=2}

---

# 3.11 Acessibilidade

A acessibilidade não é opcional.

Toda implementação deve atender no mínimo WCAG AA.

Obrigatório:

✓ navegação por teclado;

✓ foco visível;

✓ contraste adequado;

✓ leitura por screen readers;

✓ semântica correta;

✓ ARIA quando necessário;

✓ ordem lógica de navegação.

Nunca remover recursos de acessibilidade presentes nas primitivas do sistema.

Os componentes base do shadcn/ui já fornecem grande parte do comportamento de foco, teclado e ARIA, mas a aplicação continua responsável pelo uso correto da semântica e dos rótulos. :contentReference[oaicite:3]{index=3}

---

# 3.12 Performance Visual

Nenhum efeito visual pode prejudicar desempenho.

Evite:

- blur excessivo;

- animações pesadas;

- reflows;

- layouts instáveis.

A experiência deve permanecer fluida.

---

# 3.13 Consistência

Toda tela deve parecer parte do mesmo sistema.

Nunca de projetos diferentes.

Se dois elementos possuem a mesma função,

devem possuir o mesmo comportamento.

A mesma aparência.

A mesma interação.

---

# 3.14 Definição de Sistema Visual Correto

Uma implementação visual é considerada correta quando:

✓ utiliza apenas tokens oficiais;

✓ respeita Design Language;

✓ respeita Typography;

✓ respeita Motion;

✓ respeita Color;

✓ respeita Chrome;

✓ é totalmente responsiva;

✓ é acessível;

✓ é consistente em todo o sistema;

✓ não cria padrões paralelos.

---

# 4. Padrões de Engenharia

A implementação deve permanecer previsível.

Toda decisão de engenharia deve reduzir complexidade.

Nunca aumentá-la.

---

# 4.1 Performance

Performance é requisito funcional.

Não otimização futura.

Toda implementação deve priorizar:

- carregamento rápido;

- baixo consumo de memória;

- poucas renderizações;

- baixo custo de processamento.

Sempre preferir:

- lazy loading;

- code splitting;

- Server Components quando possível;

- carregamento sob demanda;

- virtualização de listas grandes;

- cache inteligente.

Nunca carregar recursos que não serão utilizados.

---

# 4.2 Formulários

Todo formulário deve seguir um comportamento único.

Obrigatório:

✓ validação imediata;

✓ mensagens claras;

✓ estados de loading;

✓ prevenção de envio duplicado;

✓ foco automático no erro;

✓ acessibilidade completa.

Nunca utilizar validações diferentes entre telas.

Nunca esconder erros.

Sempre explicar como resolver.

---

# 4.3 Tabelas

Toda tabela deve utilizar um padrão único.

Obrigatório:

- ordenação consistente;

- paginação ou virtualização;

- cabeçalhos claros;

- alinhamento consistente;

- responsividade.

Dados numéricos:

alinhados à direita.

Textos:

alinhados à esquerda.

Ações:

sempre na mesma posição.

Nunca reinventar tabelas.

Sempre reutilizar o componente oficial.

---

# 4.4 Dashboards

Dashboard não é uma coleção de widgets.

É uma ferramenta de decisão.

Toda tela deve responder:

O que aconteceu?

O que exige atenção?

O que deve ser feito agora?

Prioridade:

1. KPIs

2. Alertas

3. Pendências

4. Informações secundárias

Nunca inverter essa hierarquia.

---

# 4.5 Estados

Todo componente deve prever todos os estados possíveis.

Obrigatório:

Loading

Empty

Success

Error

Disabled

Read Only

Skeleton ou Placeholder quando necessário.

Nunca deixar estados implícitos.

---

# 4.6 Feedback

Toda ação deve gerar feedback.

Sempre.

Exemplos:

Salvar

Excluir

Enviar

Atualizar

Aprovar

Cancelar

Upload

Download

O usuário nunca pode ficar sem saber o resultado da ação.

Feedback imediato reduz carga cognitiva e melhora a previsibilidade da interface. :contentReference[oaicite:0]{index=0}

---

# 4.7 Erros

Todo erro deve possuir:

✓ linguagem humana;

✓ explicação;

✓ próximo passo;

✓ recuperação.

Nunca apresentar:

Stack trace

Erro técnico

Código interno

Mensagens de biblioteca

Nunca culpar o usuário.

---

# 4.8 Navegação

A navegação deve permanecer previsível.

O usuário nunca deve perguntar:

Onde estou?

Como volto?

O que acontece agora?

Toda navegação deve preservar contexto.

---

# 4.9 Scroll

Nunca controlar o scroll do usuário.

É proibido:

scroll-jacking

scroll obrigatório

narrativas forçadas

animações que bloqueiam leitura

O usuário controla a navegação.

Sempre.

---

# 4.10 Estados Vazios

Estados vazios são parte da experiência.

Nunca utilizar telas vazias.

Sempre informar:

- o que aconteceu;

- por que está vazio;

- como continuar.

---

# 4.11 Loading

Loading deve transmitir progresso.

Nunca ansiedade.

Sempre que possível:

- progresso real;

- placeholders;

- carregamento progressivo.

Nunca bloquear toda a interface sem necessidade.

---

# 4.12 Backend

O backend existe para servir o frontend.

Nunca o contrário.

Toda API deve ser:

previsível

consistente

versionável

tipada

idempotente quando necessário

Sempre retornar estruturas consistentes.

Nunca alterar contratos silenciosamente.

---

# 4.13 Frontend

O frontend nunca implementa regras de negócio.

Toda regra crítica pertence ao domínio.

O frontend apenas:

- apresenta;

- valida interação;

- organiza informação.

---

# 4.14 Componentes Inteligentes

Lógica de negócio:

fora dos componentes.

Componentes:

apenas apresentação.

Hooks:

comportamento.

Services:

integrações.

Domain:

regras.

Essa separação reduz acoplamento e facilita manutenção.

---

# 4.15 Código para IA

O código deve ser legível tanto para humanos quanto para IA.

Obrigatório:

nomes claros;

arquivos pequenos;

estrutura previsível;

responsabilidade única;

baixa complexidade.

Nunca utilizar:

abreviações obscuras;

efeitos colaterais ocultos;

mágicas;

acoplamentos desnecessários.

Estruturas previsíveis e componentes compostos melhoram tanto a manutenção humana quanto a geração assistida por IA. :contentReference[oaicite:1]{index=1}

---

# 4.16 Reutilização

Antes de implementar qualquer solução perguntar:

Isso já existe?

Se existir:

reutilize.

Se existir parcialmente:

componha.

Somente implemente algo novo quando não existir alternativa.

A composição é um dos princípios centrais do shadcn/ui e reduz duplicação de comportamento. :contentReference[oaicite:2]{index=2}

---

# 4.17 Segurança

Nunca confiar no frontend.

Toda validação crítica deve existir no backend.

Toda permissão deve ser validada no servidor.

Nunca confiar em:

hidden inputs

disabled buttons

rotas protegidas apenas pelo cliente

---

# 4.18 Definição de Engenharia Correta

Uma implementação é considerada correta quando:

✓ reutiliza componentes existentes;

✓ reutiliza tokens;

✓ reutiliza padrões;

✓ mantém acessibilidade;

✓ mantém performance;

✓ mantém responsividade;

✓ mantém consistência;

✓ mantém separação de responsabilidades;

✓ reduz complexidade;

✓ facilita futuras alterações.

---

# 5. Fluxo Obrigatório para Agentes de IA

Este documento define como qualquer IA deve atuar dentro do projeto.

Não existem exceções.

---

# 5.1 Ordem Obrigatória de Execução

Antes de qualquer alteração, leia:

1. README.md

2. core/DESIGN_LANGUAGE.md

3. core/AI_RULES.md

4. core/DECISIONS.md

5. IMPLEMENTATION_RULES.md

Somente depois:

identifique os arquivos necessários.

Nunca leia o projeto inteiro.

Leia apenas o contexto necessário para executar a tarefa.

---

# 5.2 Ordem Obrigatória para Interfaces

Sempre seguir esta sequência.

## Passo 1

Verificar se já existe componente equivalente.

Se existir:

reutilize.

---

## Passo 2

Se não existir:

compor utilizando componentes existentes.

Nunca reinventar um componente apenas por conveniência.

A composição é um princípio central do shadcn/ui e deve ser preferida à duplicação. :contentReference[oaicite:0]{index=0}

---

## Passo 3

Caso realmente não exista solução possível:

criar um novo componente.

Antes disso validar:

• não existe equivalente

• não existe combinação possível

• não existe variante compatível

---

## Passo 4

Caso seja criado um novo componente:

ele passa imediatamente a fazer parte do Design System.

Não podem existir componentes descartáveis.

---

# 5.3 Componentes Obrigatórios

Toda interface deve utilizar a biblioteca local baseada em shadcn/ui.

Nunca construir:

botões

inputs

dialogs

cards

menus

tabs

popovers

dropdowns

sheets

drawers

toasts

tables

do zero.

Sempre utilizar as primitivas existentes e adaptá-las ao Design System do DODÔ. :contentReference[oaicite:1]{index=1}

---

# 5.4 Responsividade

Todo layout nasce Mobile First.

Depois evolui para:

Tablet

Desktop

Large Desktop

Nunca desenvolver Desktop First.

A experiência deve permanecer consistente em qualquer resolução. :contentReference[oaicite:2]{index=2}

---

# 5.5 Prioridade por Produto

## Portal das Influenciadoras

Prioridade absoluta:

experiência móvel.

Todo fluxo deve funcionar confortavelmente em dispositivos móveis.

---

## Painel Administrativo

Prioridade:

Desktop.

Entretanto:

100% funcional em tablets.

100% funcional em celulares.

Nunca criar funcionalidades exclusivas para desktop.

---

# 5.6 Landing Pages

Landing pages não fazem parte deste Design System.

São produtos independentes.

Não alterar.

Não reutilizar componentes específicos.

Não mover regras da landing para o Design System.

---

# 5.7 Atualizações

Nunca atualizar componentes automaticamente.

Nunca substituir comportamento existente apenas porque existe versão mais nova.

Toda atualização deve preservar:

comportamento

API

acessibilidade

Design Language

Se necessário:

adaptar manualmente.

---

# 5.8 Regras de Ouro

Sempre:

✓ reutilizar

✓ compor

✓ simplificar

✓ documentar

✓ manter acessibilidade

✓ manter responsividade

✓ manter performance

✓ manter consistência

✓ respeitar DESIGN_LANGUAGE.md

✓ respeitar DECISIONS.md

✓ respeitar AI_RULES.md

---

Nunca:

✗ inventar componentes

✗ inventar tokens

✗ inventar cores

✗ inventar espaçamentos

✗ usar HTML cru quando existir componente

✗ copiar interfaces externas

✗ ignorar acessibilidade

✗ ignorar responsividade

✗ quebrar a Design Language

✗ introduzir inconsistências

---

# 5.9 Critério de Aprovação

Uma implementação só pode ser considerada concluída quando:

✓ utiliza componentes existentes;

✓ segue a Design Language;

✓ respeita todos os tokens;

✓ mantém acessibilidade;

✓ funciona em mobile;

✓ funciona em desktop;

✓ possui performance adequada;

✓ não cria dívida técnica;

✓ pode ser reutilizada em novos projetos;

✓ mantém a identidade do Criativo DODÔ.

Qualquer violação reprova a implementação.

Sem exceções.