---
name: status
description: Mostra o estado operacional atual do Portal DODÔ a partir da memória externa. Use somente por invocação explícita.
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read
---

Execute no diretório raiz:

```bash
node .claude/session-memory/bin/session-memory.mjs status
```

Apresente projeto, sprint, fase, último journal, último commit, última ADR, bloqueios e próxima tarefa exatamente como retornados. Se a memória não estiver configurada, explique como executar `/inicio` após a criação do repositório privado.
