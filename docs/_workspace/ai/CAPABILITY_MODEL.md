# CAPABILITY_MODEL — Especificação das Capacidades

> **Estabilidade:** Permanente
> **Depende de:** [AI_ORCHESTRATION.md](./AI_ORCHESTRATION.md)
> **Dependido por:** [MODEL_ROUTING.md](./MODEL_ROUTING.md), [SUBAGENTS.md](./SUBAGENTS.md), [SKILLS.md](./SKILLS.md), [HOOKS_MCP.md](./HOOKS_MCP.md), [CODEX_POLICY.md](./CODEX_POLICY.md), [CONTEXT_POLICY.md](./CONTEXT_POLICY.md), [AGENTS_POLICY.md](./AGENTS_POLICY.md), [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** muito baixa — só se uma capacidade funcional genuinamente nova emergir
>
> **Nota de fusão:** este documento absorveu o conteúdo que originalmente vivia em `MEMORY_POLICY.md` (a especificação da capacidade C5), fundido durante a auditoria de design documental — os dois tinham exatamente o mesmo ciclo de vida (Permanente, baixíssima frequência), sem motivo real de dissociação.

---

## O que é uma capacidade

Uma capacidade é uma responsabilidade que o projeto precisa ver cumprida, descrita **sem qualquer referência a como ela é cumprida hoje**. Nenhuma capacidade nesta lista menciona um modelo, um agente, um fornecedor ou um mecanismo específico da plataforma de desenvolvimento em uso.

Cada capacidade tem, além da definição, um **Contract** — o que qualquer mecanismo que se proponha a cumpri-la precisa garantir: entradas esperadas, saídas exigidas, invariantes que não podem ser violados, e o que conta como falha. O Contract é o que permite trocar o mecanismo de execução sem alterar a capacidade: qualquer novo mecanismo só é aceito se satisfizer o Contract já escrito.

A vinculação entre uma capacidade e o mecanismo que a cumpre hoje **não vive aqui** — vive em `MODEL_ROUTING.md` (Binding + Execution Unit). Este documento nunca diz "quem" cumpre a capacidade, só "o quê" e "sob que condições isso conta como cumprido".

---

## Capacidades funcionais

### C0 — Autoridade humana / decisão final

**Definição:** a capacidade de tomar a decisão que nenhum outro mecanismo pode tomar em nome do projeto — aprovação de Produto, arbitragem entre documentos soberanos em conflito, autorização de qualquer ação irreversível.

**Contract:**
- Entrada: contexto completo da decisão (o que está em jogo, alternativas, risco).
- Saída: uma decisão explícita e responsável — aprovação, rejeição ou pedido de mais informação.
- Invariante: nunca satisfeito por inferência, votação entre mecanismos automatizados, ou ausência de resposta interpretada como aprovação.
- Falha: qualquer ação irreversível tomada sem essa decisão explícita quando o Contract a exige.

**Nunca delegável.** Toda capacidade abaixo existe para servir a esta, nunca para substituí-la.

---

### C1 — Implementação

**Definição:** produzir a mudança em si — código, conteúdo, configuração — que realiza uma decisão já tomada.

**Contract:**
- Entrada: uma tarefa definida, com critério de aceite conhecido.
- Saída: a mudança concreta, no formato e local esperado.
- Invariante: a mudança respeita o vocabulário de domínio e as decisões arquiteturais vigentes.
- Falha: mudança que introduz comportamento não solicitado, ou que contradiz uma capacidade C0 já registrada.

---

### C2 — Verificação mecânica

**Definição:** checagem determinística, sem julgamento — confirmar que uma mudança respeita regras já codificadas (build, lint, testes, checagem de tipos).

**Contract:**
- Entrada: a mudança a verificar + o conjunto de regras já definido.
- Saída: um veredito binário (passou/falhou) + detalhe de qual regra falhou, se houver.
- Invariante: determinístico — a mesma entrada sempre produz o mesmo veredito.
- Falha: veredito que exige interpretação subjetiva para ser entendido — nesse caso, a capacidade correta é C4, não C2.

Esta capacidade **pode não precisar de nenhum modelo de IA** — é o caso mais comum de mecanismo puramente determinístico nesta taxonomia.

---

### C3 — Exploração / recuperação de informação

**Definição:** encontrar o que já existe — arquivos, decisões, precedentes — sem emitir julgamento sobre eles.

**Contract:**
- Entrada: uma pergunta de localização ("onde está X", "o que já foi decidido sobre Y").
- Saída: a localização ou o trecho relevante, sem interpretação adicional.
- Invariante: não produz recomendação, não emite opinião sobre qualidade.
- Falha: confundir "não encontrei" com "não existe" — a ausência de achado deve ser reportada como tal, nunca inferida como fato do domínio.

---

### C4 — Julgamento independente

**Definição:** avaliar uma mudança ou decisão já feita, a partir de um ponto de vista deliberadamente diferente de quem a produziu. Tem três modos, que são responsabilidades distintas, não variações de intensidade da mesma coisa:

- **C4a — Confirmatório:** revisão técnica de rotina — a mudança está correta, consistente, sem defeitos óbvios?
- **C4b — Adversarial:** desafio de decisão — a abordagem, o design, as premissas escolhidas resistem a uma tentativa deliberada de derrubá-las?
- **C4c — Investigativo:** escalonamento de bloqueio — uma segunda linha de investigação independente, quando a primeira tentativa não resolveu.

**Contract (comum aos três modos):**
- Entrada: o artefato a julgar (diff, decisão, ou descrição do bloqueio) + contexto suficiente para avaliação.
- Saída: achados específicos, endereçáveis, com localização exata — nunca aprovação/reprovação vaga.
- Invariante: quem julga nunca aplica a correção sozinho — julgamento e implementação são sempre capacidades separadas (C4 nunca se funde com C1).
- Falha: julgamento que reformula o problema sem apontar nada acionável, ou que aplica mudança sem passar por C0 quando o Contract da mudança exigir aprovação humana.

---

### C5 — Estado / memória

**Definição:** persistir e recuperar o que o projeto e a colaboração já sabem. Tem três modos, com fronteira estrita entre eles:

- **C5a — Constituição:** regras permanentes de operação, sempre presentes. Nunca registrar aqui estado operacional do produto ou preferências pessoais de colaboração — isso sobrecarrega um arquivo que precisa permanecer enxuto por ser sempre carregado por inteiro.
- **C5b — Colaboração:** o que se sabe sobre como humano e assistente trabalham juntos, entre sessões — preferências de comunicação, correções de abordagem já dadas, contexto sobre o papel e o conhecimento do humano. Nunca registrar aqui fase, sprint, roadmap ou qualquer fato sobre o estado do Portal em si — isso pertence a C5c.
- **C5c — Estado operacional:** fase corrente, sprint, decisões arquiteturais registradas, journal factual de sessões, roadmap do Portal. Nunca registrar aqui preferências pessoais de colaboração — isso pertence a C5b.

**Teste prático de fronteira:** se o fato deixaria de ser verdadeiro mesmo que o humano trocasse de projeto amanhã, é C5b; se o fato é sobre o Portal e sobreviveria a uma troca de colaborador, é C5c.

**Contract:**
- Entrada: um fato a registrar, com o modo correto identificado pelo teste acima.
- Saída: o fato recuperável em sessões futuras, no modo correto.
- Invariante: um fato pertence a exatamente um modo — nunca duplicado entre C5a/b/c. Se um fato parecer pertencer a dois modos ao mesmo tempo, isso é sinal de que está mal-formulado — geralmente porque mistura "o que aconteceu no Portal" com "o que aprendemos sobre como trabalhar" numa frase só. Separar antes de registrar.
- Falha: registrar em C5c uma preferência de colaboração, ou em C5b um fato de estado operacional do produto.

**Nomes de mecanismo atual** (constituição = um arquivo de instruções na raiz, sempre carregado; colaboração = o sistema de memória nativo da plataforma de desenvolvimento em uso; estado operacional = o sistema próprio do projeto, com CLI dedicado e histórico versionado externamente) descrevem convenções internas do projeto, não fornecedores de modelo de IA substituíveis — não estão sujeitos à regra de isolamento de nomes de fornecedor definida em `AI_ORCHESTRATION.md`.

**Ponto em aberto:** esta especificação declara a fronteira; não impõe verificação automática de que ela é respeitada. Criar uma verificação automatizada disso seria a capacidade C2, ou um item de `HOOKS_MCP.md` — hoje sem evidência de violação real que justifique o custo. Revisitar apenas se um journal futuro documentar uma violação concreta.

---

### C6 — Observabilidade

**Definição:** instrumentação sobre o próprio uso do sistema de IA — custo, frequência de uso de cada capacidade, incidentes.

**Status:** **lacuna reconhecida, não implementada.** Esta capacidade é nomeada aqui porque é o tipo de responsabilidade que surge naturalmente conforme o número de mecanismos em uso cresce — nomeá-la agora evita que, quando a necessidade aparecer, ela seja resolvida de forma ad-hoc e duplicada em vários lugares. Nenhum Contract é definido ainda; será escrito quando esta capacidade sair do status de lacuna.

---

## Modos de execução

Eixo ortogonal a todas as capacidades acima — descreve **como** um mecanismo concreto realiza uma capacidade, não qual capacidade é realizada:

| Modo | Descrição |
|---|---|
| Inline | Executado na própria linha de trabalho corrente, sem isolamento |
| Isolado síncrono | Sub-tarefa em contexto separado, que devolve resultado exigido imediatamente |
| Isolado com herança de contexto | Sub-tarefa em contexto separado, que herda o histórico já construído |
| Desanexado paralelo | Múltiplas execuções independentes, sem necessidade de supervisão passo a passo |
| Coordenado multi-agente | Múltiplas execuções que se comunicam diretamente entre si |
| Fisicamente isolado | Execução com espaço de trabalho próprio, para trabalho concorrente que toca os mesmos artefatos |

## Modos de invocação

Eixo ortogonal — descreve **quando** uma capacidade é disparada:

| Modo | Descrição |
|---|---|
| Explícito | Disparado por decisão deliberada, sob demanda |
| Automático | Disparado em resposta a um evento, sem intervenção no momento |

## Extensibilidade

Eixo ortogonal — descreve **como o sistema ganha novos mecanismos**, não é uma capacidade roteável:

| Mecanismo | Descrição |
|---|---|
| Integração de ferramenta/serviço externo estruturado | Uma capacidade passa a ser cumprida por um serviço externo com contrato de dados definido |
| Empacotamento/distribuição | Um conjunto de mecanismos (invocações explícitas, invocações automáticas, execuções isoladas) é distribuído e instalado como unidade |

---

## Nota de uso

Toda decisão de roteamento (qual mecanismo usar para uma tarefa concreta) combina: **uma capacidade daqui** + **um modo de execução** + **um modo de invocação**, resolvidos através do Binding definido em `MODEL_ROUTING.md`. Este documento nunca é lido isoladamente para tomar uma decisão de roteamento — ele só define o vocabulário que `MODEL_ROUTING.md` usa.
