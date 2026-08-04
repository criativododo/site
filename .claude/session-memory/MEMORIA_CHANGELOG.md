# MEMORIA_CHANGELOG.md

> Registro da mudança de comportamento de `.claude/session-memory` — commit `cb1aea1`.
> Contexto completo do diagnóstico e do desenho em
> `knowledge/Arquitetura/PROPOSTA-ADR-022-memoria-resiliente-nunca-bloqueia.md`. Este
> documento é o resumo operacional: o que mudou, o que ainda não muda, e como decidir se
> algo precisa mudar de novo no futuro.

## Problemas resolvidos

1. **`/inicio` podia impedir uma sessão de começar.** Sem rede, com o remoto de memória
   fora do ar, ou com o repositório de memória sujo (sobra de uma sessão anterior),
   `/inicio` lançava erro e a sessão não iniciava.
2. **`/fim` podia impedir uma sessão de terminar.** As mesmas condições acima, mais push
   rejeitado por outra sessão ter publicado primeiro, faziam `/fim`/`publish` falhar e
   exigir intervenção manual antes de a sessão poder ser encerrada.
3. **O caminho da memória dependia de `process.cwd()`.** Rodar o mesmo comando a partir de
   diretórios diferentes (checkout principal vs. qualquer `git worktree`) podia resolver
   para dois clones físicos diferentes do mesmo repositório, sem aviso — causa raiz de pelo
   menos um incidente real de divergência já documentado antes desta mudança.
4. **Publicação sem reconciliação automática.** Se o remoto avançasse entre o `fetch` e o
   `push` de uma sessão, a publicação falhava e pedia resolução manual, mesmo em casos
   mecanicamente triviais (nenhum conteúdo realmente conflitante).
5. **Custo fixo alto por sessão.** `/inicio` e `/fim`/`publish` reliam e validavam o
   histórico inteiro de journals (`validateMemory`, O(n) sobre todos os journals já
   existentes) mesmo quando isso não bloqueava nada — custo que só cresce com o tempo.

## Comportamento antigo

- Caminho da memória: `resolve(process.cwd(), memoryDirectory)` — variável conforme o
  diretório de invocação.
- `/inicio`: exigia repositório de memória limpo, `fetch` bem-sucedido, zero commits locais
  não publicados e zero divergência com o remoto — qualquer uma dessas condições não
  atendida interrompia a sessão (`SessionMemoryError`, `exitCode 1`).
- `/fim`: exigia repositório de memória limpo antes de escrever o journal; validava todo o
  histórico de journals antes de aceitar a sessão como concluída.
- `publish`: uma única tentativa de `push`; se o remoto tivesse avançado, falhava e pedia
  resolução manual (rebase/merge feito à mão no repositório de memória).
- Qualquer uma dessas falhas: o skill (`inicio/SKILL.md`, `fim/SKILL.md`) instruía o agente
  a **parar e informar o erro**, nunca a prosseguir.

## Comportamento novo

- Caminho da memória: fixo por máquina, via `CRIATIVODODO_MEMORY_DIR` ou fallback em
  `$HOME` — nunca depende de onde o comando foi chamado.
- `/inicio`: nunca lança erro. Prepara a memória e tenta uma atualização best-effort
  (`fetch` + `merge --ff-only`, ambos tolerantes a falha); qualquer problema resulta em
  `memoriaDisponivel: false` no resumo executivo, e a sessão segue com contexto vazio em
  vez de ser interrompida.
- `/fim`: sempre grava o journal da sessão (gravação de arquivo local, não depende de
  rede). Se a memória estiver indisponível **ou** com um conflito de merge de outra sessão
  ainda aberto, o journal é salvo em `runtime/<id>.pending-journal.md` e a resposta inclui
  `pendente: true` — a sessão termina normalmente de qualquer forma.
- `publish`: tenta publicar uma vez; se o push for rejeitado, faz **uma** tentativa de
  reconciliação automática (`pull --rebase` + novo `push`); se isso também falhar, aborta a
  tentativa (nunca força push) e devolve `pendente: true`. A próxima publicação — desta ou
  de qualquer outra sessão — tenta de novo automaticamente.
- `validateMemory` (checagem completa do histórico) saiu do caminho de `inicio`/`finish`/
  `publish`; continua disponível como comando isolado (`session-memory.mjs validate`) para
  checagem manual ou periódica.

## Limitações conhecidas

- **Journals marcados `pendente` (`runtime/<id>.pending-journal.md`) não são recuperados
  automaticamente.** Não existe hoje uma varredura que pegue esses arquivos e os publique
  quando a memória volta a ficar disponível — é preciso reconciliar manualmente (ver
  `RESOLVER_CONFLITO_MEMORIA.md`).
- **A reconciliação automática de `publish` tenta só uma vez.** Se o `pull --rebase`
  também falhar (ex.: dois pushes muito próximos, uma segunda rejeição), a sessão termina
  como pendente mesmo assim — ela não fica presa tentando de novo indefinidamente, mas
  também não insiste sozinha além dessa primeira tentativa extra.
- **Sem lock entre sessões.** Duas sessões podem, em teoria, tentar publicar no mesmo
  instante; o Git resolve a atomicidade da escrita (uma vence, a outra recebe rejeição e
  seguirá pendente até a próxima tentativa) — não há fila nem coordenação explícita, por
  design, para não reintroduzir bloqueio.
- **Nenhuma reconciliação semântica de conteúdo.** `PROJECT_STATUS.md`,
  `START_HERE_NEXT_SESSION.md` e `journals/INDEX.md` continuam sendo escritos por
  "a última sessão que rodou `/fim` venceu" — a mudança desta iniciativa elimina o
  *bloqueio* e a *perda de dado*, não decide automaticamente qual de dois estados
  concorrentes é o correto. Um conflito de merge real entre duas sessões continua exigindo
  julgamento humano (ver `RESOLVER_CONFLITO_MEMORIA.md`).
- **`validateMemory` deixou de rodar automaticamente.** Drift estrutural (journal sem uma
  seção obrigatória, journal fora do índice) não é mais pego sozinho a cada sessão; precisa
  ser checado manualmente com `validate` de tempos em tempos.

## Critérios para futuras alterações

Esta arquitetura foi deliberadamente fechada nesta iniciativa — não reabrir sem motivo
concreto. Antes de propor qualquer mudança futura ao sistema de memória:

1. **O princípio fundador não pode regredir:** nenhuma mudança pode reintroduzir um
   `fail()`/erro fatal no caminho de `/inicio` ou `/fim` motivado por falha de
   sincronização (rede, remoto, outra sessão). Qualquer proposta que fizer isso deve ser
   rejeitada por padrão.
2. **A complexidade só se justifica por um problema real já observado**, não por um
   cenário hipotético — a mesma régua usada para remover `syncMemory()`/`validateMemory()`
   do caminho quente nesta iniciativa.
3. **Toda mudança de comportamento precisa de um teste em
   `.claude/session-memory/test/resilience.test.mjs`** cobrindo o cenário antes/depois,
   sempre contra fixture isolada — nunca contra o repositório real de memória durante o
   desenvolvimento.
4. Se a mudança alterar o comportamento externo de `/inicio`, `/fim`, `check`, `publish`,
   `status`, `journal`, `roadmap`, `release` ou `validate`, ela é uma decisão arquitetural
   e precisa de uma ADR nova em `knowledge/ARCHITECTURAL_DECISIONS.md`, seguindo a
   hierarquia de decisão do `CLAUDE.md` — não é para ser feita silenciosamente.
