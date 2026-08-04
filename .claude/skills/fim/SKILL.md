---
name: fim
description: Finaliza uma sessão documentada do Portal DODÔ, gera o journal factual e publica a memória após validação. Use somente por invocação explícita no encerramento da sessão.
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read Write Edit
---

Use a sessão atual `${CLAUDE_SESSION_ID}`. Antes de publicar, crie `.claude/session-memory/runtime/${CLAUDE_SESSION_ID}.details.json` com JSON válido:

```json
{
  "phase": "Fase atual",
  "sprint": "Sprint ou Não formalizada",
  "status": "Concluído, Parcial ou Bloqueado",
  "context": "Contexto factual da sessão.",
  "workPerformed": ["Trabalho concluído"],
  "decisions": ["Decisão explícita"],
  "adrsAffected": ["ADR-018 — título, se aplicável"],
  "problems": ["Problema factual"],
  "blockers": ["Bloqueio atual"],
  "nextTask": "Próxima tarefa concreta",
  "observations": ["Observação útil"],
  "confidence": { "level": "Alta", "reason": "Evidência objetiva" }
}
```

Nunca inclua segredo, token, conteúdo de `.env` ou suposição. Use listas vazias quando não houver ocorrência. Execute então:

```bash
node .claude/session-memory/bin/session-memory.mjs finish --session "${CLAUDE_SESSION_ID}" --details-file ".claude/session-memory/runtime/${CLAUDE_SESSION_ID}.details.json"
node .claude/session-memory/bin/session-memory.mjs publish --session "${CLAUDE_SESSION_ID}" --message "docs(memory): registra sessão"
```

Se qualquer etapa falhar, pare e apresente o erro. Não faça merge, force-push ou edição manual no repositório de memória para contornar validações.
