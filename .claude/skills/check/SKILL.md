---
name: check
description: Executa e registra as verificações reais configuradas para a sessão atual do Portal DODÔ. Use somente por invocação explícita.
argument-hint: [app|portal-frontend|portal-backend]
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read
---

Use a sessão atual `${CLAUDE_SESSION_ID}`. Sem argumento, execute toda a matriz. Com argumento, use exatamente um dos escopos configurados.

```bash
node .claude/session-memory/bin/session-memory.mjs check --session "${CLAUDE_SESSION_ID}" --scope "$ARGUMENTS"
```

Se não houver argumento, remova `--scope`. Registre e apresente resultados reais, inclusive falhas e verificações não configuradas. Não corrija código nem repita a verificação automaticamente.
