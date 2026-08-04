# CONTEXT_POLICY — Carregamento de Contexto por Modo de Execução

> **Estabilidade:** Evolutiva
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md) (modos de execução e invocação)
> **Dependido por:** [TOKEN_POLICY.md](./TOKEN_POLICY.md), [SUBAGENTS.md](./SUBAGENTS.md), [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** baixa

---

## Princípio

Contexto é o recurso mais caro do sistema — mais caro que a escolha de modelo em si. Cada modo de execução (`CAPABILITY_MODEL.md`) tem um perfil de carregamento de contexto diferente, e a escolha de modo deve levar isso em conta, não só a necessidade funcional da tarefa.

## Perfis de carregamento por modo de execução

| Modo de execução | O que carrega no início | O que carrega sob demanda |
|---|---|---|
| Inline | Constituição inteira (C5a) + estado da sessão corrente | Nada além disso até ser explicitamente invocado |
| Isolado síncrono | Só as instruções da sub-tarefa específica | Nenhum histórico da linha principal |
| Isolado com herança de contexto | Todo o histórico já construído na linha principal | Continua acumulando como a linha principal |
| Desanexado paralelo | Constituição inteira + estado, como uma execução nova | Nenhuma comunicação com outras execuções paralelas |
| Coordenado multi-agente | Constituição inteira, do zero, por participante | Comunicação direta entre participantes durante a execução |
| Fisicamente isolado | O mesmo do modo que o originou (síncrono, desanexado, etc.) + um espaço de trabalho próprio | — |

## Regras de decisão

1. **Invocação explícita carrega sob demanda; invocação automática nunca deveria carregar contexto estático.** Se uma automação existe só para lembrar de uma regra permanente, a regra deveria estar na constituição (C5a), não numa automação — repetido de `HOOKS_MCP.md`, mas vale reforçar aqui porque é fundamentalmente uma decisão de onde o contexto mora.
2. **Preferir "isolado com herança de contexto" quando a sub-tarefa depende do que já foi construído** na conversa — evita reexplicar do zero, o que custaria mais tokens do que herdar.
3. **Preferir "isolado síncrono" ou "desanexado paralelo" quando a sub-tarefa é independente** — evita levar ruído da conversa principal para dentro da sub-tarefa, e evita que o resultado intermediário da sub-tarefa polua a linha principal.
4. **Nunca manter uma integração externa estruturada conectada além do necessário** — cada integração ativa consome uma fatia do orçamento de contexto disponível mesmo antes de ser usada; desconectar o que não está em uso ativo é economia real, não only organização.
5. **A sessão principal deve permanecer enxuta por padrão** — qualquer trabalho que só serve como insumo intermediário (pesquisa, exploração, rascunho) deveria ser delegado a um modo isolado, e só o resultado final volta para a linha principal.

## Ponto em aberto

Não existe hoje nenhuma medição real de quanto contexto cada modo de execução efetivamente consome neste projeto — as regras acima são qualitativas, derivadas de princípios documentados oficialmente sobre a plataforma em uso, não de medição própria. Isso se conecta à capacidade C6 (Observabilidade, hoje lacuna reconhecida em `CAPABILITY_MODEL.md`) — quando essa capacidade deixar de ser lacuna, esta política deveria ganhar números reais em vez de heurísticas.
