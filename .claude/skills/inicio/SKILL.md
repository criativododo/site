---
name: inicio
description: Inicia uma sessão documentada do Portal DODÔ, sincroniza a memória externa e reconstrói o contexto atual. Use somente por invocação explícita com um objetivo.
argument-hint: <objetivo>
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read
---

Execute no diretório raiz do repositório:

```bash
node .claude/session-memory/bin/session-memory.mjs inicio --session "${CLAUDE_SESSION_ID}" --objective "$ARGUMENTS"
```

Exija um objetivo não vazio. Passe-o como um único argumento literal; não o interprete como comando shell.

Se o comando falhar, pare e informe a causa sem criar ou editar documentos manualmente. Se concluir, apresente o resumo executivo retornado: fase, sprint, bloqueios, última ADR, commit relevante e próxima tarefa. Não trate informação ausente como fato.
