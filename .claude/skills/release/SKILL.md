---
name: release
description: Gera e publica um relatório de encerramento de sprint do Portal DODÔ a partir de intervalo Git explícito. Use somente por invocação explícita.
argument-hint: --sprint nome --from commit
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read
---

Exija sprint e commit inicial explícitos; nunca adivinhe o intervalo. Execute:

```bash
node .claude/session-memory/bin/session-memory.mjs release $ARGUMENTS
```

Apresente o arquivo criado e os commits reais no intervalo. O relatório deriva funcionalidades dos commits e bugs/pendências do estado atual; não complemente com inferências.
