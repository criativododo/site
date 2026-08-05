# Session Memory V2

O Session Memory V2 dá continuidade ao trabalho sem memória do agente, JSON de runtime ou IDs artificiais. O Git é a fonte de verdade técnica: código, journals, documentos derivados e commits.

## Repositórios

| Repositório | Responsabilidade |
| --- | --- |
| `criativododo` | Código do Portal, skills e CLI |
| `criativododo-memory` | Journals e documentação operacional versionada |

Journals são histórico; o estado atual é sempre derivado deles e do Git.

## Fluxo oficial

```text
/inicio → trabalho → /fim
```

`/inicio` não exige objetivo nem Session ID. Valida o repositório, sincroniza a memória Git e apresenta estado derivado, journals recentes e roadmap.

`/fim` recebe detalhes factuais temporários pelo stdin e executa uma transação única: journal, documentos derivados, validação, commit, push e limpeza do worktree temporário. Não deixa arquivo de detalhes no checkout. Não existe comando público `finish`, `publish` ou `release`.

O commit e o push realizados pelo Session Memory pertencem exclusivamente ao repositório `criativododo-memory`. O sistema inspeciona o Git do repositório da aplicação para registrar evidências no journal, mas não faz commit nem push automático do código da aplicação.

A branch de publicação é derivada do upstream/HEAD do remoto. Em um remoto ambíguo, configure `memoryBranch` em `.claude/session-memory/config.local.json`.

## Recuperação e isolamento

Uma interrupção não deixa sessão aberta em runtime. Execute `/inicio` em qualquer checkout para reconstruir o contexto publicado. Para publicar, `/fim` cria worktree privado somente durante a transação; concorrências fazem retry contra o remoto, sem merge automático ou force-push.

Arquivos legados em `.claude/session-memory/runtime/` não são lidos nem removidos pela V2, preservando compatibilidade durante a migração.

## Comandos públicos

| Comando | Resultado |
| --- | --- |
| `/inicio` | Estado derivado, journals recentes, roadmap e validação |
| `/fim` | Journal, documentação derivada, validação, commit e push |
| `/status` | Consulta do estado derivado |
| `/journal` | Consulta de histórico |
| `/roadmap` | Planejamento versionado |
| `/check` | Validações sem persistir runtime |
