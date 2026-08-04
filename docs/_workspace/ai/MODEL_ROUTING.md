# MODEL_ROUTING — Binding, Catálogo de Execution Units e Critério de Seleção

> **Estabilidade:** Evolutiva (com um bloco interno volátil, deliberadamente isolado — ver seção "Vinculação atual" abaixo)
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md)
> **Dependido por:** [TOKEN_POLICY.md](./TOKEN_POLICY.md), [CODEX_POLICY.md](./CODEX_POLICY.md), [SUBAGENTS.md](./SUBAGENTS.md)
> **Frequência esperada de alteração:** média — o critério muda pouco; a vinculação muda sempre que um mecanismo é trocado
>
> **Nota de fusão:** a seção "Framework capacidade vs. esforço" abaixo absorveu o conteúdo que originalmente vivia em `EFFORT_POLICY.md`, fundido durante a auditoria de design documental — o documento original já era citado como uma única linha da tabela de decisão deste documento, sinal de que não se justificava como arquivo separado.

---

## Os dois elos que faltam entre Capacidade e Execução

`CAPABILITY_MODEL.md` define **Capability** (o quê) e **Contract** (o que precisa ser garantido). Este documento define os dois elos seguintes:

- **Binding** — a regra de política que diz, para uma capacidade e um perfil de tarefa, qual classe de mecanismo deve ser usada.
- **Execution Unit** — o catálogo de classes de mecanismo que existem, com seu perfil de custo/rigor/latência, independente de qual capacidade as usa.

O quinto elo, **Execution** (o evento concreto de uma chamada específica), não é documentado — é o que realmente acontece a cada invocação.

---

## Catálogo de Execution Units (permanente — descreve tipos, não fornecedores)

| Tipo de Execution Unit | Perfil |
|---|---|
| Chamada de modelo de IA — capacidade menor | Custo baixo, rigor menor, latência baixa. Adequado para recuperação/exploração sem julgamento |
| Chamada de modelo de IA — capacidade intermediária | Custo médio, rigor adequado para execução conhecida | 
| Chamada de modelo de IA — capacidade maior, esforço elevado | Custo alto, rigor alto, latência alta. Reservado para ambiguidade genuína |
| Chamada de modelo de IA externo, com viés independente | Custo médio-alto, valor vem da independência de julgamento em relação a quem implementou, não do tamanho do modelo |
| Revisão humana síncrona | Custo é tempo humano, determinismo é subjetivo-mas-final, latência variável. Único Execution Unit que satisfaz o Contract de C0 |
| Processo determinístico | Custo é computação, determinismo total, sem julgamento. Satisfaz o Contract de C2 |
| Serviço externo estruturado | Custo e rigor dependem do serviço; usado quando uma integração de dados formal é necessária |
| Motor de regras / workflow | Determinístico ou semi-determinístico, para lógica condicional conhecida sem necessidade de julgamento aberto |

Este catálogo é permanente porque descreve **tipos de mecanismo**, não fornecedores específicos. Uma "chamada de modelo de IA externo com viés independente" continua sendo essa classe de mecanismo mesmo que o fornecedor concreto mude — só a linha de vinculação (abaixo) muda.

---

## Critério de seleção (Binding) — estável, independente de fornecedor

A entrada não é "que modelo?" — é um conjunto de atributos da tarefa. A saída é uma capacidade + um tipo de Execution Unit; só depois se resolve a instância concreta (seção de vinculação).

**Atributos de entrada:**
- Reversibilidade (reversível / custoso de errar)
- Ambiguidade (caminho conhecido / decisão nova)
- Necessidade de isolamento de contexto
- Necessidade de supervisão em tempo real
- Independência entre sub-tarefas (paralelas sem se falar / precisam coordenar)
- Necessidade de viés genuinamente externo
- Repetição (primeira vez / enésimo worker do mesmo tipo)
- Evidência (incidente real documentado / prevenção especulativa)

**Tabela de decisão:**

| Pergunta | Critério |
|---|---|
| Capacidade ou esforço? | Sem caminho conhecido → troque de tipo de Execution Unit (mais capaz). Caminho conhecido mas exige mais cuidado → suba o esforço no mesmo Execution Unit (ver "Framework capacidade vs. esforço" abaixo) |
| Subagent dedicado ou execução ad-hoc? | Papel vai se repetir → Execution Unit dedicado, registrado em `SUBAGENTS.md`. Único e depende do contexto atual → modo "isolado com herança de contexto". Único e independente → modo "isolado síncrono" genérico |
| Compensa isolamento físico (worktree)? | Edição paralela a outra linha de trabalho sem conflito → sim. Sequencial na mesma linha → não |
| Invocação explícita ou automática? | Controle humano deliberado do quando → explícita. Resposta a evento sem intervenção → automática, mas só com evidência real (ver `HOOKS_MCP.md`) |
| Revisão justifica o custo? | Mudança não trivial, prestes a virar decisão final → sim (C4a). Mudança mecânica → não |
| Revisão adversarial é obrigatória? | Mudança que já exigiria registro formal de decisão arquitetural → obrigatório (C4b). Fora disso → opcional |
| Paralelismo desanexado ou execução síncrona? | Múltiplas tarefas independentes, conferíveis depois → desanexado. Resultado necessário imediatamente para continuar → síncrono |
| Quando não usar nenhum mecanismo? | Caso default — a maioria das tarefas resolve inline, com o Execution Unit e esforço padrão. Todo o resto é escalada que precisa se justificar contra este baseline |

---

## Framework capacidade vs. esforço

Capacidade e esforço são eixos ortogonais, não uma escala única:

- **Capacidade** resolve "o mecanismo não sabia como fazer isso" — falta de tipo de Execution Unit adequado.
- **Esforço** resolve "o mecanismo não se esforçou o suficiente" — descuido, pressa, falta de verificação — dentro do mesmo Execution Unit.

Confundir os dois leva a dois erros simétricos: trocar de Execution Unit (mais caro) quando bastava mais esforço no mesmo; ou insistir em subir esforço indefinidamente quando o problema é, na verdade, falta de capacidade.

**Regras:**

1. Para a maioria das tarefas, use o esforço padrão do Execution Unit escolhido. Não microgerenciar esforço tarefa a tarefa — isso é preferência geral, não decisão pontual.
2. Suba o esforço quando o erro foi por descuido — pulou um arquivo, não rodou uma verificação, ignorou um caso de borda — e mantenha o mesmo Execution Unit.
3. Troque de Execution Unit quando o erro se repete mesmo em esforço elevado. Isso é o sinal de que o problema é de capacidade, não de esforço.
4. Decisões de alto risco/irreversibilidade justificam esforço alto por padrão, independente de já ter havido erro — não é preciso errar primeiro para justificar cautela numa decisão que já se sabe cara de errar (ex.: qualquer coisa que já exigiria registro formal de decisão arquitetural).
5. Esforço elevado tem custo real e crescente — ver `TOKEN_POLICY.md`. Nunca é a opção default.

**Nota de vinculação:** os níveis concretos de esforço disponíveis (quantos níveis existem, como se chamam) são propriedade de cada Execution Unit específico, não deste framework — este framework define quando subir/descer, não o vocabulário de níveis de um mecanismo em particular. Onde um Execution Unit tiver uma escala própria de esforço documentada, essa escala é referenciada a partir da vinculação abaixo ou de um documento de fornecedor único (ex.: `CODEX_POLICY.md`), nunca aqui.

---

## Vinculação atual (VOLÁTIL — único bloco deste documento sujeito à regra de isolamento de nomes de fornecedor)

> Esta seção muda sempre que um fornecedor muda. Nenhuma outra seção deste documento deveria precisar mudar por esse motivo.

| Capacidade | Tipo de Execution Unit | Instância concreta hoje |
|---|---|---|
| C0 | Revisão humana síncrona | Daniel (owner do projeto), via aprovação explícita na sessão |
| C1 | Chamada de modelo de IA — capacidade intermediária/maior | Sessão principal do assistente de codificação em uso |
| C2 | Processo determinístico | Scripts de build/lint/test/typecheck já definidos por aplicação (`app`, `portal-frontend`, `portal-backend`) |
| C3 | Chamada de modelo de IA — capacidade menor | Subagent de exploração nativo da plataforma em uso |
| C4a/b/c | Chamada de modelo de IA externo, com viés independente | Ver `CODEX_POLICY.md` — vinculação completa isolada nesse documento |
| C5a/b/c | Ver `CAPABILITY_MODEL.md`, seção C5 | Mecanismos próprios do projeto, não sujeitos à regra de isolamento (não são fornecedores de IA) |
| C6 | — | Nenhum — capacidade não implementada |

## Ponto em aberto

O critério de seleção acima é qualitativo. Não existe hoje uma medição de custo real por Execution Unit que permita transformar a tabela de decisão numa fórmula numérica. Fica em aberto até C6 (Observabilidade) deixar de ser lacuna.
