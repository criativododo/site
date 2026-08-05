# TOKEN_RULES.md

# MK 1/2 — Constituição dos Tokens DODÔ

> Tokens não são valores visuais.
> Tokens são decisões de design transformadas em contratos técnicos.

No DODÔ, uma decisão visual só existe quando possui um token correspondente.

Se algo não possui token:

**não pertence ao sistema.**

Design tokens funcionam como unidades nomeadas de decisões de design, permitindo que valores visuais sejam compartilhados entre ferramentas e plataformas sem depender de valores soltos. A separação entre valores primitivos e tokens semânticos é uma prática central para manter sistemas escaláveis e consistentes. ([Design good practices][1])

---

# 1. A LEI DA FONTE ÚNICA

Existe uma única fonte de verdade visual.

Nenhum arquivo, componente ou tela pode possuir decisões visuais próprias.

O fluxo obrigatório é:

```
Decisão de design
        ↓
Token oficial
        ↓
Componente
        ↓
Interface final
```

Nunca:

```
Necessidade visual
        ↓
Valor arbitrário
        ↓
CSS local
        ↓
Divergência
```

---

# 2. TOKENS SÃO CONTRATOS, NÃO VARIÁVEIS

Um token não existe para facilitar código.

Ele existe para preservar intenção.

Errado:

```css
color: #8A3FFC;
```

Correto:

```css
color: var(--color-action-primary);
```

O código deve consumir significado.

Nunca consumir aparência.

---

# 3. ARQUITETURA TRÍPLICE DE TOKENS

O DODÔ utiliza três níveis de abstração:

```
PRIMITIVO
      ↓
SEMÂNTICO
      ↓
COMPONENTE
```

---

# 3.1 TOKENS PRIMITIVOS

## Definição

São valores brutos do sistema.

Representam:

* cores base;
* escalas;
* tamanhos;
* pesos;
* durações.

Exemplo conceitual:

```
color-noir-900
space-04
font-weight-medium
```

---

## Regra

Tokens primitivos:

* existem no núcleo;
* não possuem contexto;
* não são consumidos diretamente pela interface.

Eles são matéria-prima.

---

# 3.2 TOKENS SEMÂNTICOS

## Definição

Transformam valores em intenção.

São a camada principal de consumo.

Exemplo:

Antes:

```
gray-900
```

Depois:

```
text-primary
```

Antes:

```
red-500
```

Depois:

```
action-critical
```

---

## Regra

Componentes e páginas utilizam tokens semânticos.

Nunca valores primitivos diretamente.

---

# 3.3 TOKENS DE COMPONENTE

## Definição

Tokens específicos para comportamento interno de componentes.

Exemplo:

```
button-primary-background
button-primary-hover
input-focus-ring
```

---

## Regra

Tokens de componente existem somente quando:

* o comportamento é exclusivo;
* o componente possui contrato próprio;
* a alteração não deve afetar outros elementos.

Nunca criar token de componente para resolver uma tela específica.

---

# 4. PROIBIÇÃO DE VALORES ARBITRÁRIOS

O DODÔ não aceita:

## Cores

Proibido:

```css
#FFFFFF
rgb()
hsl()
```

fora da camada oficial de tokens.

---

## Espaçamento

Proibido:

```css
margin: 13px;

padding: 27px;
```

---

## Tipografia

Proibido:

```css
font-size: 19px;

font-weight: 550;
```

---

## Movimento

Proibido:

```css
transition: 237ms;
```

---

Qualquer valor visual precisa existir previamente como decisão oficial.

---

# 5. A IA NÃO CRIA TOKENS

Agentes de IA não possuem autoridade para criar linguagem visual.

Antes de gerar interface, a IA deve:

```
1. Ler DESIGN_LANGUAGE.md

2. Ler COLOR.md

3. Ler TYPOGRAPHY.md

4. Ler COMPONENT_RULES.md

5. Consultar tokens existentes

6. Somente então implementar
```

---

Se o token necessário não existir:

A IA deve:

1. procurar alternativa existente;
2. propor composição;
3. solicitar criação oficial.

Nunca aproximar.

Nunca inventar.

---

# 6. BLOQUEIO CONTRA DRIFT VISUAL

Drift visual acontece quando pequenas decisões isoladas acumulam diferenças.

O sistema impede isso através de:

## Fonte única

Todos os produtos consomem o mesmo núcleo.

---

## Tokens semânticos

A interface depende de intenção.

---

## Proibição de exceções

Toda exceção vira dívida.

---

# 7. TOKENS E CONTEXTOS DODÔ

O sistema possui diferentes experiências.

A regra:

**um sistema, múltiplos contextos.**

Não criar tokens duplicados.

---

## Portal Administrativo

Prioridade:

* produtividade;
* densidade;
* decisão rápida.

---

## Portal Influenciadoras

Prioridade:

* simplicidade;
* orientação;
* mobile.

---

A diferença deve acontecer através de contexto:

```
data-theme="admin"

data-theme="influencer"
```

Nunca através de cópias paralelas.

---

# 8. RESPONSIVIDADE DOS TOKENS

Responsividade não é ajuste posterior.

Tokens devem considerar:

* desktop;
* tablet;
* mobile.

Um componente deve consumir o mesmo token e adaptar seu valor conforme contexto.

Exemplo:

```
space-layout
```

pode possuir diferentes interpretações:

```
desktop → amplo

mobile → reduzido
```

Mas nunca:

```
space-desktop
space-mobile
```

---

# 9. ESCALA ESPACIAL

O espaçamento segue sistema.

Nunca percepção individual.

A escala deve comunicar:

* proximidade;
* separação;
* prioridade.

Não:

"parece bom".

Sim:

"possui intenção".

---

# 10. ESCALA TIPOGRÁFICA

Tipografia deve seguir tokens.

Nunca criar:

* novos tamanhos;
* pesos intermediários;
* alturas arbitrárias.

A hierarquia deve nascer de:

* escala;
* peso;
* espaço.

Não de infinitas variações.

---

# 11. CORES

Cor é intenção.

Nunca decoração.

Tokens de cor devem responder:

```
Qual função essa cor possui?
```

Não:

```
Qual cor combina aqui?
```

---

Permitido:

```
surface-primary

text-secondary

action-primary

feedback-error
```

---

Proibido:

```
purple-card

blue-box

special-red
```

---

# 12. SOMBRAS, RAIO E EFEITOS

Efeitos visuais também são tokens.

Não criar:

* sombra nova;
* radius novo;
* blur novo;
* transparência nova.

Cada efeito precisa justificar:

* hierarquia;
* interação;
* profundidade.

---

# 13. O TOKEN DEVE SOBREVIVER À TECNOLOGIA

Tokens não pertencem ao React.

Não pertencem ao CSS.

Não pertencem ao Figma.

Eles pertencem à linguagem do produto.

A implementação pode mudar.

A intenção permanece.

---

**Fim do MK 1/2**.

[1]: https://goodpractices.design/articles/design-tokens?utm_source=chatgpt.com "Design tokens | Design good practices"

---

# TOKEN_RULES.md

# MK 2/2 — Governança, Auditoria e Zona de Veto

Tokens são contratos vivos do sistema. Eles existem para impedir decisões locais e preservar uma única linguagem visual entre produtos, plataformas e agentes. A separação entre tokens primitivos, semânticos e específicos de componentes é uma prática comum para manter intenção separada de implementação. ([Telerik.com][1])

---

# 14. REGRA DA NOMENCLATURA SEMÂNTICA

O nome de um token deve representar intenção.

Nunca representar aparência.

---

## Errado

```text
red-button

big-padding

dark-gray

rounded-card
```

---

## Correto

```text
action-primary

space-content

surface-primary

radius-interactive
```

---

A pergunta obrigatória:

> "Se o valor mudar amanhã, o nome continua fazendo sentido?"

Se a resposta for não:

o token está mal nomeado.

---

# 15. TOKENS NÃO PERTENCEM A TELAS

Nunca criar:

```text
dashboard-header-spacing

campaign-page-color

mobile-card-margin
```

Porque telas mudam.

A linguagem permanece.

---

Permitido:

```text
layout-section-spacing

content-reading-spacing

surface-background
```

---

# 16. REGRA DA DENSIDADE CONTEXTUAL

O DODÔ possui diferentes ambientes.

Cada ambiente possui uma intenção.

---

## Administração

Priorizar:

* velocidade;
* decisão;
* informação;
* produtividade.

---

## Influenciadoras

Priorizar:

* orientação;
* simplicidade;
* clareza;
* confiança.

---

Tokens devem permitir essas diferenças sem criar sistemas paralelos.

---

Nunca:

```text
admin-space-large

influencer-space-large
```

---

Sempre:

```text
space-context-primary
```

com alteração contextual.

---

# 17. TEMPERATURA DE ESPAÇAMENTO

Espaçamento não é apenas medida.

É comportamento.

O sistema trabalha com intenção espacial.

---

## Espaçamento quente

Usado quando:

* existe decisão;
* existe ação;
* existe prioridade.

---

## Espaçamento morno

Usado quando:

* existe agrupamento;
* existe relação.

---

## Espaçamento frio

Usado quando:

* existe leitura;
* existe contemplação;
* existe conteúdo editorial.

---

Nunca decidir espaçamento por preferência pessoal.

---

# 18. TOKENS DE MOVIMENTO

Motion também possui contrato.

Obrigatório controlar:

* duração;
* curva;
* intensidade;
* finalidade.

---

Movimento permitido:

* feedback;
* mudança de estado;
* continuidade espacial;
* orientação.

---

Movimento proibido:

* decoração;
* distração;
* efeito sem propósito.

---

Nenhuma animação nasce sem token correspondente.

---

# 19. TOKENS DE ACESSIBILIDADE

Acessibilidade não é componente.

É fundação.

Tokens devem governar:

* contraste;
* foco;
* estados;
* leitura.

---

Obrigatório existir controle para:

* foco visível;
* estados desabilitados;
* mensagens de erro;
* estados críticos.

---

Nunca depender apenas da cor.

Exemplo:

Errado:

```text
vermelho = erro
```

Correto:

```text
erro = cor + ícone + texto + comportamento
```

---

# 20. TOKENS DE ELEVAÇÃO E PROFUNDIDADE

A profundidade deve ser econômica.

O sistema não cria:

* sombras infinitas;
* níveis arbitrários;
* efeitos decorativos.

---

Permitido:

```text
elevation-surface

elevation-floating

elevation-critical
```

---

Proibido:

```text
shadow-17

shadow-special

card-shadow-new
```

---

# 21. REGRA DO SHADCN/UI

O shadcn/ui fornece estrutura funcional.

Tokens DODÔ fornecem identidade.

A relação:

```text
shadcn
   ↓
comportamento acessível

DODÔ Tokens
   ↓
expressão visual proprietária
```

---

Nunca aceitar:

* tokens padrão da biblioteca;
* cores padrão;
* espaçamentos padrão;
* aparência original.

---

# 22. AUDITORIA AUTOMÁTICA

Todo código deve ser auditável.

A revisão deve procurar:

## Cores arbitrárias

Bloquear:

```css
#123456
rgb()
hsl()
```

---

## Valores espaciais arbitrários

Bloquear:

```css
margin:17px;

padding:29px;
```

---

## Estilos locais

Bloquear:

```jsx
style={{
 color:"#fff"
}}
```

---

A pergunta da auditoria:

> "Esse valor representa uma decisão oficial?"

Se não:

remover.

---

# 23. CICLO DE VIDA DOS TOKENS

Tokens possuem estados.

---

## Proposto

Existe uma necessidade identificada.

Ainda não faz parte do sistema.

---

## Ativo

Token aprovado.

Pode ser utilizado.

---

## Depreciado

Não deve receber novos usos.

---

## Removido

Não pertence mais ao sistema.

---

Nunca apagar decisões importantes sem registrar histórico.

---

# 24. QUANDO CRIAR UM NOVO TOKEN

Novo token exige:

## Problema

Qual decisão não está representada?

---

## Pesquisa

Quais tokens existentes foram avaliados?

---

## Falha

Por que nenhum resolve?

---

## Impacto

Quantos componentes serão beneficiados?

---

## Aprovação

A decisão entra em:

`DECISIONS.md`

---

# 25. QUANDO NÃO CRIAR UM TOKEN

Não criar para:

* uma tela;
* uma campanha;
* um cliente específico;
* uma exceção temporária;
* corrigir implementação ruim.

---

Um token novo deve reduzir complexidade.

Nunca aumentar.

---

# 26. REGRAS PARA CLAUDE CODE E AGENTES

Antes de qualquer alteração visual:

A IA deve:

```text
1. Ler TOKEN_RULES.md

2. Localizar tokens existentes

3. Mapear intenção visual

4. Usar token semântico

5. Implementar

6. Validar ausência de valores arbitrários
```

---

A IA nunca pode:

* inventar cor;
* inventar espaçamento;
* inventar radius;
* inventar sombra;
* criar token local;
* substituir token existente.

---

# 27. ZONA DE VETO

As seguintes práticas são proibidas:

---

## Hardcode visual

```css
color:red;
padding:20px;
```

---

## Tokens emocionais

```text
beautiful-purple

premium-shadow

magic-spacing
```

---

## Tokens de página

```text
dashboard-title-size
```

---

## Escalas infinitas

```text
space-1
space-2
space-3
space-4
space-5
space-6
space-7
space-8
space-9
space-10
```

---

O sistema não cresce por quantidade.

Cresce por clareza.

---

# 28. PRINCÍPIO FINAL

O Design System DODÔ deve permitir que qualquer pessoa ou IA consiga responder:

> "Por que esse valor existe?"

Se a resposta for:

"porque ficou bonito"

o token falhou.

Se a resposta for:

"porque representa uma decisão oficial de experiência"

o sistema está funcionando.

---

# LEIS PERMANENTES

1. **Nenhuma decisão visual existe fora de um token.**

2. **Tokens representam intenção, não aparência.**

3. **Componentes consomem semântica, nunca valores crus.**

4. **Agentes de IA não possuem autoridade para criar linguagem visual.**

5. **Toda exceção deve virar decisão formal ou ser eliminada.**

6. **O sistema deve reduzir escolhas, não criar novas.**

---

**Fim do TOKEN_RULES.md**.

[1]: https://www.telerik.com/design-system/docs/foundation/guides/design-tokens/usage/?utm_source=chatgpt.com "Usage | Design System Kit"
