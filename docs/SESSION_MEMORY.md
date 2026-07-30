# Guia rápido — Session Memory

O sistema preserva a continuidade das sessões de Claude Code sem colocar a memória
operacional no código, no deploy ou na VPS.

## Como os repositórios se relacionam

| Repositório | Conteúdo |
| --- | --- |
| `criativododo` (este) | Código do Portal, skills do Claude Code e o CLI em `.claude/session-memory/` |
| `criativododo-memory` (privado) | Journals, estado atual, roadmap, índice de ADRs e releases |

O clone da memória fica ao lado deste repositório:

```text
.../
├── criativododo/
└── criativododo-memory/
```

Nada de `criativododo-memory` entra em build, deploy ou VPS.

## Preparação inicial

1. Autentique o GitHub na máquina:

   ```bash
   gh auth login
   ```

2. Crie o repositório privado vazio:

   ```bash
   gh repo create criativododo/criativododo-memory --private \
     --description "Memória operacional do Portal DODÔ"
   ```

3. No diretório raiz de `criativododo`, abra o Claude Code e inicie a primeira sessão:

   ```text
   /inicio Configurar e validar a memória de sessões
   ```

O `/inicio` clona `../criativododo-memory`, cria a estrutura canônica, faz o primeiro commit
e envia tudo ao GitHub. Em outro computador, basta clonar este repositório, autenticar o Git
e executar `/inicio <objetivo>`: o clone irmão será criado automaticamente.

## Fluxo normal de trabalho

1. Comece sempre com um objetivo explícito:

   ```text
   /inicio Implementar o provisionamento de Workspace no Google Drive
   ```

2. Trabalhe normalmente. Quando quiser executar validações:

   ```text
   /check
   /check portal-backend
   ```

3. Encerre a sessão:

   ```text
   /fim
   ```

O `/fim` gera um journal com alterações Git reais, commits, testes registrados, decisões,
bloqueios e próxima tarefa. Em seguida, valida, cria um commit no repositório de memória e
faz push. Se houver conflito ou alterações pendentes na memória, ele para sem sobrescrever
nada.

## Comandos disponíveis

| Comando | Uso | Resultado |
| --- | --- | --- |
| `/inicio <objetivo>` | Início obrigatório da sessão | Sincroniza a memória, cria baseline Git e mostra resumo executivo |
| `/fim` | Encerramento da sessão | Gera, valida, commita e publica o journal |
| `/status` | Consulta rápida | Fase, sprint, journal, commit, ADR, bloqueios e próxima tarefa |
| `/journal` | Histórico | Lista journals |
| `/journal --date 2026-07-30` | Filtro por data | Mostra sessions daquela data |
| `/journal --phase "Fase 4"` | Filtro por fase | Mostra journals da fase |
| `/journal --search Drive` | Busca textual | Localiza contexto por palavra-chave |
| `/journal --open 2026-07-30_1430.md` | Abrir journal | Carrega um registro específico |
| `/roadmap` | Progresso | Mostra fases concluídas, atual e próximas |
| `/check [escopo]` | Validações | Executa lint/build no frontend e typecheck/test/build no backend |
| `/release --sprint Fase-4 --from <commit>` | Encerramento de sprint | Cria e publica relatório baseado no intervalo Git real |

## Estrutura criada na memória

```text
criativododo-memory/
├── journals/                 # Um arquivo por sessão + INDEX.md gerado
├── project/                  # Estado atual, próxima sessão, roadmap e ADRs
├── releases/                 # Relatórios de encerramento de sprint
├── templates/                # Modelos dos documentos operacionais
└── migration/                # Referências aos handoffs legados
```

Os handoffs existentes em `docs/handoff/` e `START_HERE_NEXT_SESSION.md` continuam no
repositório do Portal como histórico. O estado operacional novo passa a ser a memória
carregada pelo `/inicio`.

## Regras de segurança

- Nunca copie tokens, chaves, conteúdo de `.env` ou credenciais para journals.
- Não use `git push --force` nem faça merge automático no repositório de memória.
- Se `/inicio` ou `/fim` reportar divergência, resolva o Git da memória antes de continuar.
- O caminho padrão pode ser alterado por máquina em `.claude/session-memory/config.local.json`;
  esse arquivo não é versionado.
