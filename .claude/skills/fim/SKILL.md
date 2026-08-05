---
name: fim
description: Finaliza uma sessão documentada do Portal DODÔ, gera o journal factual e publica a memória após validação. Use somente por invocação explícita no encerramento da sessão.
disable-model-invocation: true
allowed-tools: Bash(node .claude/session-memory/bin/session-memory.mjs:*) Read Write Edit
---

Antes de encerrar, prepare os detalhes factuais como JSON válido. Eles são enviados pelo stdin e não geram arquivo temporário no checkout:

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
  "confidence": { "level": "Alta", "reason": "Evidência objetiva" },
  "costEstimate": { "chars": 0, "approxTokens": 0 }
}
```

`costEstimate` é opcional: repasse exatamente o valor que `/inicio` retornou nesta sessão, para registrar no journal o custo de ambas as pontas (`/inicio` e `/fim`) e permitir comparação entre sessões. Nunca inclua segredo, token, conteúdo de `.env` ou suposição. Use listas vazias quando não houver ocorrência. Execute então:

```bash
node .claude/session-memory/bin/session-memory.mjs fim --details-stdin --message "docs(memory): registra sessão" <<'JSON'
{ "phase": "Fase atual", "sprint": "Sprint ou Não formalizada", "nextTask": "Próxima tarefa concreta" }
JSON
```

`/fim` é a única transação de encerramento: gera journal, atualiza documentos derivados, valida, commita, publica e remove seu worktree temporário. Se falhar, pare e apresente o erro. Se a causa não for evidente na mensagem de erro, delegue a investigação (leitura ampla, múltiplos arquivos) a um subagent e traga apenas a conclusão — não investigue amplamente na sessão principal. Não faça merge, force-push ou edição manual no repositório de memória para contornar validações.
