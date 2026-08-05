# COMPONENT_RULES.md

## MK 1/2 — Constituição dos Componentes

> Este documento define como componentes nascem, evoluem e são utilizados no ecossistema DODÔ.
> Componentes não são peças visuais isoladas. São contratos estáveis entre design, engenharia e agentes de IA.

A fundação segue o princípio de **código aberto, composição e controle local** do shadcn/ui: componentes devem ser compreensíveis, modificáveis e pertencentes ao projeto, não caixas-pretas externas. ([Shadcn UI][1])

---

# 1. A LEI DA COMPOSIÇÃO

## Componha antes de criar.

Toda nova interface deve seguir uma ordem obrigatória:

```
1. Existe componente aprovado?
        ↓
        SIM → reutilizar

2. Não existe.
   É possível combinar componentes existentes?
        ↓
        SIM → compor

3. Não é possível compor.
   Existe uma variante oficial?
        ↓
        SIM → utilizar variante

4. Nenhuma solução existe.
        ↓
   Avaliar novo componente
```

A criação de componentes é exceção.

A composição é o comportamento padrão.

---

# 2. A REGRA DOS TRÊS

Um componente novo somente pode existir quando cumprir todos os critérios:

* Resolver um problema recorrente.
* Possuir significado próprio.
* Aparecer em múltiplos contextos.
* Não poder ser resolvido por composição.
* Ter contrato claro de comportamento.

Nunca criar componente para:

* uma única tela;
* ajuste visual pontual;
* corrigir espaçamento;
* resolver uma exceção de layout;
* substituir uma composição existente.

---

# 3. O CATÁLOGO É A FONTE DE VERDADE

O catálogo de componentes é fechado.

A ausência de um componente não autoriza uma IA a inventar um novo padrão.

Antes de criar:

* procurar componentes existentes;
* verificar variantes disponíveis;
* verificar padrões documentados;
* verificar blocos existentes.

A IA deve agir como **compositora do sistema**, não como autora de novos padrões.

---

# 4. HIERARQUIA DOS COMPONENTES

Todo elemento deve pertencer a uma única camada.

---

## 4.1 Primitive

### Definição

A menor unidade funcional da interface.

Responsável por:

* comportamento;
* acessibilidade;
* interação;
* estados básicos.

Não possui:

* regra de negócio;
* dados externos;
* conhecimento de páginas.

Exemplos:

```
Button
Input
Dialog
Select
Checkbox
```

---

## 4.2 Component

### Definição

Primitive aplicada ao Design System DODÔ.

Responsável por:

* identidade visual;
* tokens;
* variantes oficiais;
* comportamento visual.

Exemplo:

```
DodoButton
DodoInput
DodoCard
```

Nunca contém:

* chamadas API;
* regras financeiras;
* lógica de negócio.

---

## 4.3 Compound Component

### Definição

Grupo de componentes que trabalham juntos.

Usar quando existe:

* estado compartilhado;
* relação estrutural forte;
* composição recorrente.

Exemplo:

```
Card
 ├── Header
 ├── Title
 ├── Content
 └── Footer
```

A composição explícita melhora previsibilidade para humanos e agentes de IA. ([Shadcn UI][2])

---

## 4.4 Block

### Definição

Composição orientada ao domínio.

Resolve uma necessidade completa.

Exemplos:

```
CampaignCard

InfluencerProfile

PaymentSummary

DashboardMetric
```

Pode conhecer:

* contexto do produto;
* entidades do negócio.

Não pode conhecer:

* infraestrutura;
* banco diretamente;
* autenticação.

---

## 4.5 Template

### Definição

Estrutura espacial.

Responsável por:

* grid;
* hierarquia;
* ritmo;
* organização.

Não possui:

* dados;
* regras de negócio;
* chamadas externas.

---

## 4.6 Page

### Definição

Ponto final da composição.

Responsável por:

* buscar dados;
* controlar estados;
* conectar domínio;
* montar experiência final.

A Page coordena.

Ela não deve recriar componentes internos.

---

# 5. COMPONENTES NÃO POSSUEM TERRITÓRIO

Um componente reutilizável deve ser ignorante sobre onde está.

Ele não sabe:

* qual página chamou;
* qual usuário está usando;
* qual campanha está ativa;
* qual regra comercial existe.

Ele recebe informações.

Ele renderiza.

Ele comunica ações.

---

# 6. SEPARAÇÃO ENTRE INTERFACE E NEGÓCIO

A interface nunca decide.

Exemplo proibido:

```tsx
<Button>
aprovar pagamento
</Button>
```

com:

```tsx
aprovarPagamento()
```

dentro do botão.

---

Modelo correto:

```
Button
   ↓
evento
   ↓
camada superior decide
   ↓
regra de negócio executa
```

O componente informa.

O sistema decide.

---

# 7. REGRAS PARA PROPS

Props devem representar intenção.

## Permitido:

```tsx
<Button intent="primary" />

<Card density="compact" />

<Status state="approved" />
```

## Proibido:

```tsx
<Button green />

<Card bigPadding />

<Box margin24 />
```

Nunca criar props baseadas em aparência.

Criar props baseadas em significado.

---

# 8. VARIANTS

Variants representam decisões oficiais do sistema.

Uma variant precisa:

* existir na Design Language;
* possuir significado claro;
* ser reutilizada em vários lugares.

Criar variant somente para:

* intenção;
* estado;
* hierarquia;
* densidade oficial.

---

Nunca criar variant para:

* margem;
* tamanho específico de uma tela;
* ajuste temporário;
* exceção visual.

---

# 9. SHADCN COMO FUNDAÇÃO

O DODÔ utiliza shadcn como camada estrutural.

A regra é:

```
shadcn → fundamento funcional

DODÔ → linguagem visual proprietária
```

Reutilizar:

* acessibilidade;
* comportamento;
* composição;
* estrutura.

Não reutilizar:

* aparência padrão;
* tokens originais;
* identidade visual.

O código permanece sob controle do projeto e pode ser adaptado diretamente. ([Shadcn UI][1])

---

# 10. IA COMO GUARDIÃ DO SISTEMA

Antes de criar qualquer componente, a IA deve:

1. Ler `DESIGN_LANGUAGE.md`.
2. Ler `IMPLEMENTATION_RULES.md`.
3. Consultar `COMPONENT_RULES.md`.
4. Procurar componentes existentes.
5. Tentar composição.
6. Somente então propor criação.

A IA nunca deve:

* criar botão novo;
* criar card novo;
* criar token novo;
* criar padrão visual novo;

sem autorização explícita.

---

[1]: https://ui.shadcn.com/docs?trk=public_post_main-feed-card_reshare-text&utm_source=chatgpt.com "Introduction - shadcn/ui"
[2]: https://ui.shadcn.com/docs/changelog/2026-04-component-composition?utm_source=chatgpt.com "April 2026 - Component Composition - shadcn/ui"

---

# COMPONENT_RULES.md

## MK 2/2 — Governança, Reutilização e Controle de IA

---

# 11. A REGRA DA REDUNDÂNCIA PROIBIDA

Nenhum padrão visual pode existir duas vezes.

Antes de criar:

* Card;
* Badge;
* Modal;
* Tabela;
* Lista;
* Navegação;
* Formulário;

a equipe ou IA deve pesquisar o catálogo existente.

Se uma solução semelhante existir:

**ela deve ser reutilizada ou evoluída.**

Criar uma segunda implementação do mesmo comportamento é considerado falha arquitetural.

---

# 12. COMPONENTES NÃO SÃO TELAS PEQUENAS

Um componente não deve nascer porque uma tela ficou grande.

Separar:

## Layout

Responsável por:

* posição;
* agrupamento;
* espaçamento;
* composição.

## Componente

Responsável por:

* comportamento;
* significado;
* repetição.

Não transformar cada bloco visual em componente.

---

# 13. RESPONSIVIDADE É PARTE DO COMPONENTE

Todo componente deve nascer responsivo.

Nunca criar:

* versão desktop;
* versão mobile separada;
* adaptações posteriores.

O componente deve saber:

* reduzir densidade;
* reorganizar conteúdo;
* preservar hierarquia;
* manter acessibilidade.

---

# 14. CONTEXTOS DIFERENTES EXIGEM EXPERIÊNCIAS DIFERENTES

O DODÔ não aplica uma única interface para todos os usuários.

A experiência deve respeitar o contexto.

---

## Painel Administrativo

Priorizar:

* desktop;
* produtividade;
* densidade de informação;
* múltiplas ações;
* atalhos.

---

## Portal de Parceiras

Priorizar:

* mobile;
* simplicidade;
* orientação passo a passo;
* baixa carga cognitiva.

---

A regra:

**mesmo sistema, diferentes prioridades de interação.**

---

# 15. ESTADOS OBRIGATÓRIOS

Todo componente interativo deve possuir estados definidos.

Nenhum componente pode existir apenas no estado perfeito.

Obrigatório avaliar:

```
default

hover

focus

active

disabled

loading

error

empty

success
```

---

Exemplo:

Um botão não é apenas:

```
Enviar
```

Ele também precisa saber:

```
Enviando...

Erro ao enviar

Enviado
```

---

# 16. FORMULÁRIOS

Formulários seguem contrato único.

Obrigatório:

* validação clara;
* mensagens próximas ao erro;
* foco automático quando necessário;
* estados de carregamento;
* prevenção de múltiplos envios.

Nunca:

* esconder erro;
* usar apenas cor para indicar problema;
* bloquear usuário sem explicação.

---

# 17. TABELAS E DADOS

Tabelas devem respeitar hierarquia.

Obrigatório:

* leitura rápida;
* alinhamento consistente;
* estados vazios;
* carregamento;
* filtros quando necessário.

Nunca criar tabelas apenas como listas gigantes.

---

# 18. DASHBOARDS

Dashboards não são coleções de cards.

São ferramentas de decisão.

Toda área deve responder:

```
Qual decisão esse bloco permite tomar?
```

Se não existe resposta:

remover.

---

Regras:

* destacar informação prioritária;
* separar visão estratégica de operação;
* evitar excesso de métricas;
* preservar espaço negativo.

---

# 19. TOKENS SÃO IMUTÁVEIS

Componentes nunca criam:

* novas cores;
* novos espaçamentos;
* novos tamanhos;
* novos raios;
* novos pesos.

Usar somente:

* tokens oficiais;
* variáveis existentes;
* escalas aprovadas.

Proibido:

```css
color: #7234ff;

padding: 37px;

border-radius: 13px;
```

---

# 20. CORES

Nenhum componente escolhe cor arbitrariamente.

A cor precisa ter significado.

Permitido:

```
primary

secondary

destructive

success

warning

muted
```

Proibido:

```
purpleButton

specialCard

customBlue
```

A cor pertence ao sistema.

Não ao componente.

---

# 21. ÍCONES

Ícones devem vir da biblioteca oficial.

Nunca:

* desenhar SVG isolado;
* importar biblioteca paralela;
* misturar estilos.

O ícone deve seguir:

* proporção;
* peso;
* linguagem visual.

---

# 22. MOTION EM COMPONENTES

Movimento existe para explicar.

Nunca para decorar.

Permitido:

* mudança de estado;
* feedback;
* transição espacial;
* carregamento.

Proibido:

* animações chamativas;
* efeitos independentes;
* movimentos sem função.

---

# 23. ACESSIBILIDADE

Todo componente aprovado deve funcionar para todos.

Obrigatório:

* teclado;
* foco visível;
* semântica correta;
* contraste;
* leitores de tela.

Acessibilidade não é melhoria.

É requisito de existência.

---

# 24. TESTE DE COMPONENTE

Novo componente exige:

* comportamento validado;
* estados testados;
* responsividade validada;
* acessibilidade revisada.

Nenhum componente entra no catálogo apenas porque "parece pronto".

---

# 25. PROCESSO PARA NOVO COMPONENTE

Toda criação deve gerar registro:

```
COMPONENT_REQUEST.md
```

contendo:

## Problema

Qual necessidade existe?

## Pesquisa

Quais componentes foram avaliados?

## Falha

Por que os existentes não resolvem?

## Proposta

Qual novo contrato será criado?

## Impacto

Onde será utilizado?

---

# 26. REGRA PARA AGENTES DE IA

A IA deve agir como mantenedora do sistema.

Antes de alterar interface:

```
1. Ler DESIGN_LANGUAGE.md

2. Ler IMPLEMENTATION_RULES.md

3. Ler COMPONENT_RULES.md

4. Procurar componente existente

5. Compor antes de criar

6. Confirmar aderência aos tokens
```

---

A IA está proibida de:

* criar componentes paralelos;
* criar estilos próprios;
* copiar bibliotecas externas diretamente;
* inventar padrões;
* alterar identidade visual;
* substituir componentes existentes.

---

# 27. PRINCÍPIO FINAL

O Design System DODÔ não cresce adicionando peças.

Ele cresce removendo decisões.

Cada componente aprovado deve tornar o próximo projeto:

* mais rápido;
* mais consistente;
* mais previsível;
* mais fácil para humanos e agentes de IA.

**Composição antes de criação.
Sistema antes de exceção.
Clareza antes de complexidade.**

---

**Fim do COMPONENT_RULES.md**.
