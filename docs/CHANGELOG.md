# Changelog

## Session Memory V2 — 2026-08-05

- Implementa a RFC-003: Git passa a ser a fonte de verdade técnica da continuidade.
- Remove o runtime JSON e o Session ID do fluxo operacional.
- Simplifica `/inicio` e torna `/fim` a transação única de journal, documentação, validação, commit e push.
- Mantém journals como histórico, worktrees temporários para isolamento e arquivos runtime V1 apenas como legado não lido.
