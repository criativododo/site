# UI_RULES.md

# UI Rules

## Objetivo

Este documento define as regras globais da interface do ecossistema TEAR.

Seu objetivo é garantir consistência visual, previsibilidade de comportamento e uniformidade entre todas as telas da plataforma.

As regras aqui descritas possuem caráter obrigatório.

---

# Princípios

- Clareza acima de estética.
- Consistência acima de criatividade.
- Simplicidade acima de quantidade.
- A interface deve reduzir a carga cognitiva.
- Cada elemento deve possuir um propósito.
- O usuário nunca deve precisar adivinhar o próximo passo.

Interfaces simples, consistentes e orientadas à tarefa facilitam a compreensão e reduzem o esforço cognitivo do usuário.  [oai_citation:0‡Apple Developer](https://developer.apple.com/design/human-interface-guidelines/design-principles?utm_source=chatgpt.com)

---

# Layout

- Utilizar layout responsivo.
- Mobile First.
- Grid consistente em todas as telas.
- Espaçamentos padronizados.
- Componentes alinhados.
- Evitar rolagem horizontal.

---

# Navegação

- Navegação sempre previsível.
- Mesmo componente → mesmo comportamento.
- O Dashboard é a Home da aplicação.
- Sempre existir caminho de retorno.
- Nunca existir navegação sem contexto.

---

# Componentes

- Componentes reutilizáveis.
- Um único comportamento para cada componente.
- Nunca duplicar componentes semelhantes.
- Estados obrigatórios:
  - padrão;
  - hover;
  - foco;
  - ativo;
  - desabilitado;
  - carregamento;
  - erro.

---

# Formulários

- Labels sempre visíveis.
- Campos obrigatórios identificados.
- Validação em tempo real quando possível.
- Mensagens de erro claras.
- Nunca apagar informações já digitadas.

---

# Botões

- Um CTA primário por tela.
- Botões destrutivos devem possuir confirmação.
- Botões desabilitados devem indicar o motivo quando aplicável.
- Texto sempre iniciado por verbo.

---

# Feedback

Toda ação deve produzir feedback.

Exemplos:

- sucesso;
- carregamento;
- erro;
- confirmação;
- progresso.

---

# Estados

Toda tela deve possuir:

- carregamento;
- vazio;
- sem resultados;
- erro;
- sem permissão;
- offline (quando aplicável).

---

# Permissões

A interface deve respeitar integralmente a Matriz de Permissões.

Componentes sem autorização:

- não devem executar ações;
- não devem expor informações protegidas.

---

# Responsividade

A interface deve funcionar em:

- smartphone;
- tablet;
- desktop.

A funcionalidade nunca deve depender do tamanho da tela.

---

# Acessibilidade

- Contraste adequado.
- Navegação por teclado.
- Componentes com foco visível.
- Ícones acompanhados de texto quando necessário.
- Áreas clicáveis adequadas para interação.

Interfaces acessíveis, consistentes e com hierarquia visual clara tornam a navegação mais intuitiva para diferentes perfis de usuários.  [oai_citation:1‡Microsoft Learn](https://learn.microsoft.com/en-us/windows/apps/design/guidelines-overview?utm_source=chatgpt.com)

---

# Linguagem

- Português (Brasil).
- Linguagem objetiva.
- Sem jargões técnicos.
- Mensagens curtas.
- Terminologia consistente em toda a plataforma.

---

# Proibições

- Não utilizar modais desnecessários.
- Não utilizar mais de um CTA primário.
- Não esconder funcionalidades importantes.
- Não duplicar navegação.
- Não utilizar cores como único indicador de estado.
- Não criar padrões diferentes para a mesma interação.