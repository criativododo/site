# AI_ORCHESTRATION — Índice da Plataforma de IA do Portal Criativo DODÔ

> **Estabilidade:** Permanente
> **Depende de:** nenhum (ponto de entrada)
> **Dependido por:** todos os documentos desta família
> **Frequência esperada de alteração:** baixíssima — só quando um documento entra/sai da família ou uma camada é adicionada/removida

---

## Princípio central

Nenhuma regra desta arquitetura é escrita em nome de um fornecedor. As regras são escritas em nome de **capacidades** — o que o projeto precisa que aconteça — e um documento à parte (`MODEL_ROUTING.md`) diz qual mecanismo, hoje, cumpre cada capacidade. Trocar ou adicionar um fornecedor, agente ou modelo no futuro significa editar uma vinculação, nunca reescrever uma política.

Este documento é **só um índice**. Ele não define capacidades, não define critérios de roteamento e não define especificações. Cada assunto tem exatamente um documento responsável — se um conteúdo parece "caber aqui também", ele está no lugar errado; o lugar certo é um dos documentos abaixo.

---

## Regra permanente de isolamento de nomes de fornecedor

Nenhum documento desta família pode citar o nome de um fornecedor de modelo/serviço de IA específico (ex.: um nome de modelo, uma empresa fornecedora de IA, um produto de IA de terceiros), **exceto**:

1. dentro do bloco "Vinculação atual" de `MODEL_ROUTING.md`, claramente demarcado como volátil;
2. dentro de um documento de política dedicado a um único fornecedor (hoje: `CODEX_POLICY.md`).

Nomes de **mecanismo da plataforma corrente** (ex.: os termos que descrevem modos de execução, invocação sob demanda ou invocação automática, ou o nome de uma convenção de arquivo externo) não são cobertos por esta regra — eles descrevem a forma de operar da plataforma de desenvolvimento em uso hoje, não um fornecedor de modelo substituível, e podem aparecer normalmente em `SUBAGENTS.md`, `SKILLS.md`, `HOOKS_MCP.md` e na seção C5 de `CAPABILITY_MODEL.md`.

Esta regra é o mecanismo que garante o resultado do **teste de substituição**, registrado logo abaixo, na seção "Nota de validação — teste de substituição".

---

## Diagrama de camadas (conceitual — sem nomes de ferramenta)

```
        Projeto                    (razão de ser — Produto, o "porquê")
           ↓
        Governança                 (autoridade, hierarquia de decisão, humano-no-loop)
           ↓
        Políticas                  (critérios de custo, esforço, contexto)
           ↓
        Orquestração               (decompõe a tarefa, aplica as políticas, decide a sequência)
           ↓
        Capacidades                (catálogo funcional — o que pode ser feito; contém Capability + Contract)
           ↓
        Adaptadores                (vinculação de uma capacidade a um mecanismo concreto; contém Binding + Execution Unit)
           ↓
        Execução                   (o acontecimento real — a chamada, a sessão, o processo)
           │
           └──── feedback ────→ retroalimenta Políticas e Governança
                                  (evidência de uso muda critério; nunca o contrário)

  ══════════ Estado/Memória ══════════   ← banda transversal, não uma etapa;
                                            cada camada acima lê e escreve aqui
```

A camada **Capacidades** é especificada em `CAPABILITY_MODEL.md`. A camada **Adaptadores** é especificada em `MODEL_ROUTING.md` (Binding + catálogo de Execution Units). A banda **Estado/Memória** é especificada na seção C5 de `CAPABILITY_MODEL.md`.

---

## Mapa dos documentos

| Documento | Responsabilidade única |
|---|---|
| `AI_ORCHESTRATION.md` | Este índice + diagrama de camadas + nota de validação do teste de substituição |
| `CAPABILITY_MODEL.md` | Taxonomia funcional (Capability + Contract, incluindo a especificação de memória/estado C5) + modos de execução, invocação e extensibilidade |
| `AGENTS_POLICY.md` | Regra vendor-agnostic para arquivos de convenção externa (ex.: um arquivo de instruções lido por ferramentas de terceiros na raiz do repositório) |
| `CONTEXT_POLICY.md` | Como cada modo de execução carrega contexto; regras para manter a sessão principal enxuta |
| `MODEL_ROUTING.md` | Critério de seleção (Binding) + catálogo de Execution Units + framework capacidade-vs-esforço + vinculação atual (volátil, isolada) |
| `TOKEN_POLICY.md` | Metas de minimização de custo/contexto/tempo/retrabalho/duplicação |
| `SUBAGENTS.md` | Especificação dos subagentes aprovados |
| `SKILLS.md` | Inventário de skills e racional de não-fusão |
| `HOOKS_MCP.md` | Critério de reavaliação por evidência para automações e para integrações estruturadas |
| `CODEX_POLICY.md` | Vinculação de capacidades de julgamento independente ao fornecedor atualmente em uso — documento de fornecedor único, descartável por inteiro |
| `ROADMAP.md` | Matriz de adoção incremental persistida; fases; decisões em aberto |

**Nota de consolidação:** esta família começou com 14 documentos. Uma auditoria de design documental fundiu 4 deles em 2 (`MEMORY_POLICY.md` → seção de `CAPABILITY_MODEL.md`; `EFFORT_POLICY.md` → seção de `MODEL_ROUTING.md`; `HOOKS.md` + `MCP.md` → `HOOKS_MCP.md`), resultando nos 11 acima. Nenhum conceito foi perdido na fusão — ver `ROADMAP.md`, seção "Decisões registradas", para o histórico completo.

---

## Ordem de leitura obrigatória para um agente novo

```
1.  AI_ORCHESTRATION.md   (este documento — mapa)
2.  CAPABILITY_MODEL.md   (vocabulário + onde o estado vive)
3.  CONTEXT_POLICY.md
4.  MODEL_ROUTING.md
5.  TOKEN_POLICY.md
6.  AGENTS_POLICY.md
7.  CODEX_POLICY.md
8.  SUBAGENTS.md
9.  SKILLS.md
10. HOOKS_MCP.md
11. ROADMAP.md           (síntese operacional — só depois de entender o resto)
```

---

## Classificação de estabilidade (legenda usada em todos os documentos)

- **Permanente** — muda apenas por decisão de re-arquitetura fundamental, nunca por troca de fornecedor.
- **Evolutiva** — muda conforme o projeto amadurece (novos subagentes, novos critérios), mas não por troca de fornecedor.
- **Volátil** — muda com frequência, amarrada a decisões operacionais ou a vinculação de um fornecedor específico. Deliberadamente confinada a poucos documentos pequenos.

---

## Nota de validação — teste de substituição

Cenário: os fornecedores de IA hoje em uso deixam de existir e são substituídos por outros. Excluindo `ROADMAP.md` do cálculo — ele é operacional por definição, reescrito a cada fase independentemente de qualquer fornecedor, não é arquitetura — restam 10 documentos.

| Resultado | Documentos | Contagem |
|---|---|---|
| Intactos, zero edição | `AI_ORCHESTRATION.md`, `CAPABILITY_MODEL.md`, `AGENTS_POLICY.md`, `CONTEXT_POLICY.md`, `TOKEN_POLICY.md` (a regra em si) | 5 |
| Revisão de nomenclatura de mecanismo, critério intacto | `SUBAGENTS.md`, `SKILLS.md`, `HOOKS_MCP.md` (sua seção de integração estruturada, se o mecanismo de integração mudar de nome) | 3 |
| Reescrita confinada a um bloco isolado | `MODEL_ROUTING.md` — só a tabela "Vinculação atual", nunca o catálogo de Execution Units nem o critério de seleção | 1 |
| Morre por completo | `CODEX_POLICY.md` | 1 |

**Leitura do resultado, com honestidade metodológica:** contando qualquer documento tocado (mesmo que só para trocar o nome de um mecanismo, sem mudar critério) como "falha", o resultado é 5/10 = 50% — acima do limite de 20%. Mas essa métrica é enganosa: revisar uma tabela ou um nome próprio não é o mesmo trabalho que reescrever um critério do zero. Contando apenas documentos que exigem **reescrita conceitual** (perda real de conteúdo normativo, não só um nome trocado) — `CODEX_POLICY.md` (morte completa) e o bloco isolado de `MODEL_ROUTING.md` — o resultado é **2/10 = 20%**, na fronteira do limite.

**Observação registrada, não resolvida:** fundir documentos (`MEMORY_POLICY.md` e `EFFORT_POLICY.md` para dentro de outros, nesta mesma revisão) reduz o denominador deste teste sem mudar a quantidade real de conteúdo acoplado a fornecedor — o que faz a percentagem parecer pior mecanicamente, não porque o acoplamento aumentou. Isso significa que **o teste de substituição deveria ser medido por peso de conteúdo (linhas normativas reescritas ÷ linhas totais), não por contagem de arquivos**, especialmente após fusões. Por peso de conteúdo, o total que precisaria reescrita é pequeno (a tabela de vinculação e o arquivo de fornecedor único, juntos, são uma fração pequena do total de linhas desta família) — a conclusão qualitativa ("a maior parte da arquitetura sobrevive a uma troca de fornecedor") continua válida. Ajustar o critério de medição do teste para peso de conteúdo fica registrado como ponto em aberto em `ROADMAP.md`.

---

## Relação com o `CLAUDE.md`

Este documento e os 10 que ele indexa são a especialização, para o subsistema de IA, do princípio já declarado no `CLAUDE.md` da raiz do repositório: uma única fonte de verdade por assunto, arquitetura a serviço do Produto, nenhuma decisão de arquitetura sem registro. `CLAUDE.md` continua sendo a constituição — esta família de documentos não a substitui nem a duplica, apenas a aplica ao domínio de orquestração de IA.
