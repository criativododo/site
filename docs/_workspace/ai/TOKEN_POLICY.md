# TOKEN_POLICY — Minimização de Custo, Contexto, Tempo, Retrabalho e Duplicação

> **Estabilidade:** Evolutiva
> **Depende de:** [MODEL_ROUTING.md](./MODEL_ROUTING.md) (framework capacidade vs. esforço), [CONTEXT_POLICY.md](./CONTEXT_POLICY.md)
> **Dependido por:** [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** baixa-média — atualiza quando surge um novo dado de custo real

---

## As cinco metas, como filtro de decisão

Toda escalada de mecanismo (trocar de Execution Unit, subir esforço, abrir um modo de execução isolado) precisa passar por este filtro antes de ser aceita:

1. **Tokens** — nunca escalar para um mecanismo mais caro sem antes descartar o baseline inline (`MODEL_ROUTING.md`, "quando não usar nenhum mecanismo").
2. **Contexto** — escolher o modo de execução pelo perfil de carregamento certo (`CONTEXT_POLICY.md`), não pelo mais conveniente de configurar.
3. **Tempo de execução** — tarefas independentes rodam em paralelo (modo desanexado), nunca em fila sequencial sem motivo.
4. **Retrabalho** — consultar o estado operacional já registrado (capacidade C5c) antes de qualquer execução isolada recomputar algo que já existe.
5. **Duplicação de responsabilidade / múltiplas fontes de verdade** — checar se uma capacidade já tem um Binding registrado antes de criar um novo Execution Unit dedicado para a mesma coisa.

## Evidência de custo real documentada

Paralelismo desanexado multiplica o consumo de orçamento proporcionalmente ao número de execuções simultâneas — cada execução paralela consome recurso de forma independente, como se fosse uma execução isolada normal. Há evidência documentada de multiplicador próximo a 10x para 10 execuções simultâneas no mecanismo de paralelismo desanexado atualmente em uso. Isso não é um custo teórico — é a razão pela qual paralelismo desanexado nunca deveria ser o modo default para tarefas que um modo mais barato resolve.

## Regras adicionais

- **Nenhum mecanismo de julgamento independente (C4) deve operar em loop automático** — cada consulta a C4 é terminal: produz achados, a capacidade C0 decide, o ciclo termina. Nunca um mecanismo de julgamento aciona outro automaticamente em resposta ao seu próprio resultado.
- **Custos de diferentes fornecedores não são fungíveis** — não existe orçamento compartilhado entre fornecedores distintos hoje em uso; cada um é um livro-razão de custo separado. Isso é relevante para quem for medir gasto, não para o roteamento em si.
- **Preferir modo "isolado com herança de contexto" a "isolado síncrono novo"** quando a sub-tarefa depende do que já foi construído na sessão — reexplicar do zero é o retrabalho mais caro e mais fácil de evitar.

## Ponto em aberto

Não existe hoje instrumentação própria de custo (capacidade C6, lacuna reconhecida). As regras acima usam o único dado empírico documentado disponível (o multiplicador de paralelismo); qualquer outro número citado no futuro deve vir de evidência real, nunca de estimativa.
