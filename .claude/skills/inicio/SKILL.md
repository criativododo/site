---
name: inicio
description: Prepara uma sessão do Portal DODÔ, sincroniza a memória Git e reconstrói o contexto atual. Use somente por invocação explícita.
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read
---

Execute no diretório raiz do repositório:

```bash
node .claude/session-memory/bin/session-memory.mjs inicio
```

Se o comando falhar, pare e informe a causa sem criar ou editar documentos manualmente. Se a causa não for evidente na mensagem de erro, delegue a investigação (leitura ampla, múltiplos arquivos) a um subagent e traga apenas a conclusão — não investigue amplamente na sessão principal. Se concluir, apresente o resumo executivo retornado: fase, sprint, bloqueios, última ADR, commit relevante e próxima tarefa. Não trate informação ausente como fato.

Guarde o `costEstimate` retornado (custo desta execução) e repasse-o em `details.costEstimate` ao encerrar a sessão com `/fim`, para manter o histórico de custo comparável entre sessões.
