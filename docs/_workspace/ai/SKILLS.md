# SKILLS — Inventário e Racional de Não-Fusão

> **Estabilidade:** Evolutiva
> **Depende de:** [CAPABILITY_MODEL.md](./CAPABILITY_MODEL.md) (modo de invocação explícita)
> **Dependido por:** [ROADMAP.md](./ROADMAP.md)
> **Frequência esperada de alteração:** média

---

## Critério

Uma skill resolve uma capacidade quando a ação precisa de invocação deliberada, com controle humano do quando, e não precisa de isolamento de contexto próprio (nesse caso seria um subagent, ver `SUBAGENTS.md`).

## Inventário atual

| Skill | Capacidade servida | Por que não funde com outra |
|---|---|---|
| Início de sessão | C5c (recupera estado operacional) | Ação distinta de encerramento — momento diferente do ciclo |
| Encerramento de sessão | C5c (registra estado operacional) | Exige validação humana antes de publicar — não pode ser automática nem fundida com início |
| Verificação de matriz de build/lint/test | C2 | Ação puramente determinística, sem relação com as skills de memória |
| Status operacional | C3 sobre C5c | Consulta pontual, mais leve que o início de sessão completo |
| Roadmap | C3 sobre C5c | Recorte específico (percentual de fases concluídas), não substitui o status geral |
| Busca em histórico de sessões | C3 sobre C5c | Consulta por filtro, ação distinta de ver o estado atual |
| Skills de design/frontend/performance de terceiros | C1 (implementação, com padrões específicos) | Cobrem camadas diferentes (visual, crítica de design, padrões de performance) — fundir criaria uma skill grande e menos precisa na hora de decidir se se aplica |

## Skills novas — decisão

Nenhuma skill nova é criada nesta fase. Duas skills finas foram cogitadas durante a fase de arquitetura (padronizar prompts recorrentes de julgamento independente para performance e segurança) — permanecem condicionadas a uso repetido comprovado do mecanismo de julgamento independente (`CODEX_POLICY.md`), não criadas preventivamente.

## Skills obsoletas

Nenhuma encontrada na auditoria.

## Skill → Hook

Nenhuma skill deveria virar automática. Todas as skills de ciclo de sessão são deliberadamente de invocação explícita — o encerramento de sessão, em particular, exige validação humana antes de publicar estado, o que uma automação removeria.

## Skill → Subagent

Nenhuma skill atual precisa de isolamento de contexto — todas dependem do estado da sessão corrente. Transformar qualquer uma em subagent quebraria essa dependência.
