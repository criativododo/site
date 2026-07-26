# NotebookLM — manutenção do notebook "🧶 PROJETO TEAR"

O notebook usa o alias `tear` no CLI `nlm`. Requisitos para ambos os scripts
abaixo: `nlm` autenticado (`nlm login`) e `jq` no PATH.

## Sincronização incremental

`scripts/sync-notebook.sh` mantém o notebook em dia com os `.md` de
`docs/knowledge/`, de forma **incremental**.

```sh
scripts/sync-notebook.sh
```

Não há flags. Rodar de novo sem mudanças termina em segundos sem enviar nada.

### Como funciona

O índice `docs/knowledge/.notebook-index.json` guarda, por arquivo, o `sha256`
do conteúdo e o `source_id` da fonte correspondente no NotebookLM:

- **Inalterado** (mesmo sha256) → ignorado.
- **Alterado** → a versão antiga é removida do notebook (pelo `source_id`)
  e a nova é enviada; o índice é atualizado após o upload dar certo.
- **Novo** → enviado e registrado no índice.

Uploads rodam em paralelo (até 4 simultâneos). O resumo final mostra
enviados, ignorados, removidos, falhas e tempo total. Em caso de falha
parcial, basta rodar de novo: só os arquivos que falharam são reenviados.

O índice deve ser **versionado junto com docs/knowledge/** — é ele que evita
reenvios e duplicatas entre execuções (inclusive em outra máquina).

## Limpeza de duplicados

`scripts/clean-notebook.sh` remove fontes duplicadas (mesmo `title`),
mantendo uma cópia de cada título.

```sh
# Simulação: mostra contagens e os IDs que seriam removidos, sem apagar nada
scripts/clean-notebook.sh --dry-run

# Execução real: lista os IDs e pede confirmação (y/N) antes de apagar
scripts/clean-notebook.sh
```

Comportamento:

- Lê `nlm source list tear --json` e usa `docs/knowledge/.notebook-index.json`
  (caminho relativo → `source_id`, mantido pelo sync) como identificador
  estável — títulos iguais em caminhos diferentes (ex.: `docs/knowledge/README.md`
  e `docs/knowledge/specs/README.md`) **não** são tratados como duplicata.
- Fontes rastreadas pelo índice são sempre mantidas; fontes fora do índice
  com título de arquivo indexado são cópias obsoletas e são removidas;
  as demais são agrupadas por título, mantendo a primeira ocorrência.
- Sem o índice, cai no modo apenas-título (com aviso).
- Exibe contagens e os IDs a remover (com o motivo) antes de qualquer ação.
- Idempotente: sem duplicados, encerra com "Nada a fazer".

Use-o para limpar bagunça histórica, não como rotina pós-sync — o sync já
não gera duplicatas.
