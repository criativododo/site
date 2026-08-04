# PROPOSTA ADR-022 — Memória resiliente: a memória nunca pode impedir um agente de trabalhar

- **Status:** Proposta. Aguardando decisão do responsável do projeto. Não editar
  `knowledge/ARCHITECTURAL_DECISIONS.md` até aprovação explícita.
- **Data:** 2026-08-04.
- **Autor:** sessão de agente, por instrução direta do responsável do projeto
  (objetivo: "redesenhar toda a arquitetura da Memória seguindo um único princípio: a
  memória nunca pode impedir um agente de trabalhar").
- **Relaciona-se com:** ADR-018 (decisão original do repositório `criativododo-memory`),
  ADR-021 (`knowledge/ARCHITECTURAL_DECISIONS.md`, aceita em 2026-08-03, implementação
  parcial — ver Diagnóstico). Esta proposta não descarta ADR-021: reaproveita sua parte
  correta (artefatos gerados por função pura) e substitui sua parte que ainda permite
  bloqueio (sincronização síncrona obrigatória, worktree Git por sessão).

---

## Resumo executivo

O sistema de memória atual — tanto a versão em produção na branch `main` quanto a versão
mais avançada (ADR-021, Fases 1–3) presa sem merge na branch `feat/portal-login-screen` —
compartilha um defeito estrutural: trata a sincronização com o repositório remoto
(`criativododo-memory`) como uma operação **síncrona e obrigatória** dentro de `/inicio` e
`/fim`. Qualquer falha nessa sincronização — rede indisponível, GitHub fora do ar, outro
agente publicando no mesmo instante, um clone divergente — interrompe a sessão do agente
com `process.exitCode = 1`, e a própria instrução do skill manda o agente **parar**
("Se o comando falhar, pare e informe a causa").

A proposta desta ADR é eliminar essa dependência síncrona por completo. `/inicio` passa a
ler sempre um cache local (na pior hipótese desatualizado, nunca ausente) e nunca espera
rede. `/fim` passa a gravar o journal da sessão localmente — uma escrita de arquivo, que não
pode falhar por causas externas — e tenta publicar em segundo plano, com re-tentativa
silenciosa; se não conseguir, marca como pendente e a sessão termina normalmente. A
publicação pendente é resolvida depois, por qualquer sessão futura ou por uma rotina
periódica, sem nunca ter sido responsabilidade do agente que a gerou.

Evidência concreta do problema, encontrada **ao vivo, durante esta mesma investigação**,
está registrada na seção de Diagnóstico — não é um cenário hipotético.

---

## 1. Diagnóstico da arquitetura atual

Existem hoje **duas implementações divergentes** do kit `.claude/session-memory/`, e essa
divergência já é, por si, um sintoma do problema:

| | Branch `main` (o que este worktree executou) | Branch `feat/portal-login-screen` (ADR-021, Fases 1–3) |
|---|---|---|
| Caminho da memória | `resolve(process.cwd(), '../criativododo-memory')` — depende de onde o processo foi invocado | `CRIATIVODODO_MEMORY_DIR` ou fallback relativo ao `$HOME`, nunca a `cwd` |
| Modelo de escrita | Sessões escrevem direto no clone único (`hub`) | Cada sessão ganha um `git worktree` efêmero do repositório de memória |
| `PROJECT_STATUS.md`/`INDEX.md`/`START_HERE_NEXT_SESSION.md` | Editados diretamente por cada `/fim` | Gerados por função pura a partir do conjunto de journals |
| Publicação | Um único `push`; se o remoto avançou, falha e pede resolução manual | Laço `fetch → reset --hard origin/main → recomitar → push`, até 5 tentativas |
| Comportamento na falha | `fail()` → `SessionMemoryError` → sessão interrompida | `fail()` → `SessionMemoryError` → sessão interrompida (idêntico) |
| Mesclado em `main`? | — | **Não.** Commits `8aa0942`, `73aff41`, `85ebd11`, `058b7cc` existem só nessa branch, isolada desde 2026-08-04. |

Este worktree (`worktree-proud-scribbling-lamport`) foi criado a partir de `main` e por
isso executou a implementação **mais antiga e mais frágil** — a que a própria ADR-021 já
tinha diagnosticado como quebrada um dia antes.

### Evidência ao vivo (não hipotética)

Durante esta investigação, ao comparar os dois clones físicos do repositório de memória
que coexistem na máquina, encontrei:

```
Clone canônico do checkout principal (/Users/danielperrut/criativododo-memory):
  HEAD = b6072ea (1 commit atrás de origin/main)
  git status:
    modified:   journals/INDEX.md
    modified:   project/PROJECT_STATUS.md
    modified:   project/START_HERE_NEXT_SESSION.md
    untracked:  journals/2026/08/2026-08-04_1216.md   ← journal de sessão NÃO publicado

Clone compartilhado por todos os worktrees (.claude/worktrees/criativododo-memory):
  HEAD = 444aaad (= origin/main, o mais recente)
```

Ou seja: **agora mesmo**, enquanto este documento era escrito, existe uma sessão (rodada a
partir do checkout principal, fora de qualquer worktree) cujo journal e cujos artefatos
derivados estão presos localmente, um commit atrás do remoto, sem terem sido publicados —
exatamente a categoria de perda de trabalho que a missão pede para eliminar. Isso não é
um cenário reconstruído: é o estado do disco nesta máquina neste momento.

Esse não é sequer um bug novo. O histórico do `criativododo-memory` já contém o commit
`1a462f3 — Fase 0 (ADR-021) — reconcilia journal do clone acidental e restaura estado
atual`, isto é: **este exato problema já ocorreu antes, já foi diagnosticado, já recebeu
uma correção de arquitetura (ADR-021) e voltou a ocorrer**, porque a correção nunca chegou
a `main` — ela resolveu o sintoma uma vez, manualmente, sem eliminar a causa na branch que
continuou em uso.

### Causa raiz (por trás dos sintomas relatados)

Todos os sintomas relatados na missão têm a mesma origem:

1. **Sincronização síncrona como pré-condição de trabalho.** `/inicio` só entrega contexto
   depois de `git fetch` ter sucesso; `/fim` só termina depois de `git push` ter sucesso (ou
   esgotar tentativas). Rede, GitHub, ou outro agente publicando primeiro tornam-se,
   estruturalmente, capazes de impedir o agente de começar ou terminar uma sessão.
2. **Caminho de memória derivado de `cwd`, não fixo.** Faz duas invocações do mesmo
   comando, de dois diretórios de trabalho diferentes, apontarem para dois repositórios
   Git fisicamente distintos — sem que nada avise isso à sessão. (Corrigido no design da
   ADR-021, nunca chegou a `main`.)
3. **Estado mutável compartilhado entre sessões.** Antes da ADR-021, `PROJECT_STATUS.md`
   etc. eram editados por edição de texto direta — duas sessões terminando perto uma da
   outra escrevem por cima uma da outra ou geram conflito real de merge.
4. **Toda falha é tratada como erro fatal do agente**, nunca como um estado a resolver
   depois. O próprio skill (`inicio/SKILL.md`, `fim/SKILL.md`) instrui explicitamente:
   *"Se o comando falhar, pare"*. Isso está correto para bugs de código do agente — está
   errado para falhas de infraestrutura (rede, concorrência, remoto fora do ar), que não
   são culpa nem responsabilidade do agente e não deveriam consumir o tempo dele.
5. **Nenhuma isolação de leitura vs. escrita.** Comandos puramente informativos (`status`,
   `journal`, `roadmap`) hoje fazem `git reset --hard origin/main` no hub (na versão
   ADR-021) ou dependem do mesmo clone potencialmente sujo (na versão `main`) — leitura
   fica acoplada à saúde da sincronização, quando não precisava estar.

---

## 2. Problemas fundamentais

Sem retórica, na ordem de impacto:

1. **A arquitetura atual não distingue "memória disponível" de "memória sincronizada".**
   Isso é o problema mais fundamental — todo o resto deriva daqui. O agente não deveria
   nunca precisar que a memória esteja sincronizada para poder trabalhar; deveria só
   precisar que ela esteja *disponível localmente*, mesmo que desatualizada.
2. **A correção certa (ADR-021) foi feita, testada (26/26 testes, segundo o commit
   `058b7cc`) e abandonada sem merge.** Isso é um problema de processo, não só de código:
   uma decisão arquitetural "Aceita" ficou fisicamente ausente de `main` por dias enquanto
   o desenvolvimento continuou sobre a versão quebrada.
3. **Mesmo a versão corrigida (ADR-021) ainda bloqueia em falha de rede.** `fetchHub` e
   `publishSessionWorktree` chamam `fail()` sempre que `git fetch`/`git push` falham — a
   ADR-021 resolveu divergência entre clones e conflito de merge, mas não resolveu
   "memória nunca pode bloquear o agente", porque esse não era o objetivo dela.
4. **O protocolo pede prosa estruturada demais em `/fim` para o valor que entrega.** O
   `details-file` exige 12 campos, vários de texto livre (`context`, `workPerformed`,
   `decisions`, `problems`, `observations`, `confidence.reason`), mesmo para sessões
   triviais. Isso é gasto de tokens que não é sincronização — é geração de prosa
   obrigatória por convenção de schema, não por necessidade de conteúdo.
5. **Worktrees Git por sessão (ADR-021 Fase 3) resolvem um problema que a Fase 2 já tinha
   resolvido.** Uma vez que os três artefatos derivados são funções puras sobre journals
   com nome único por sessão, não sobra estado mutável compartilhado para proteger com
   isolamento de working tree — o worktree por sessão vira complexidade operacional
   (criação, limpeza de órfãos, `git worktree prune`) sem um problema correspondente para
   resolver. É a categoria exata de complexidade que a missão pediu para eliminar.

---

## 3. Princípios da nova arquitetura

Adotados diretamente da missão, sem reinterpretação:

1. Disponibilidade de memória > frescor de memória. Um cache local desatualizado sempre
   vale mais do que nenhum contexto.
2. Nenhuma operação de rede é uma pré-condição para `/inicio` retornar ou para `/fim`
   terminar a sessão.
3. Toda falha de sincronização degrada para "pendente", nunca para "erro fatal".
4. Nenhum agente resolve conflito de Git da memória. Se não há como publicar sem conflito
   automaticamente resolvível, a sessão termina normalmente e a publicação fica pendente
   para uma tentativa futura — nunca para um agente decidir manualmente.
5. Escrita de sessão é sempre local antes de ser remota, e a escrita local nunca falha por
   causa externa (é só um arquivo).
6. Complexidade só existe onde protege contra um problema real e presente. Isolamento por
   `git worktree` só se justifica se ainda houver estado mutável compartilhado depois da
   Fase de artefatos gerados — e não há.

---

## 4. Arquitetura proposta

### 4.1 Duas camadas com contratos de falha diferentes

**Camada 1 — Local, síncrona, nunca falha por causa externa.**
Tudo que `/inicio` e `/fim` fazem *enquanto o agente espera* mexe só no disco local:

- Caminho fixo e independente de `cwd`: `CRIATIVODODO_MEMORY_DIR`, com fallback padrão em
  `$HOME/criativododo-memory` — reaproveita literalmente a correção já implementada e
  testada na Fase 1 da ADR-021 (`lib/config.mjs`, commit `73aff41`). Isso sozinho já
  elimina o bug ao vivo descrito na Seção 1.
- `/inicio` lê o cache local do hub (`PROJECT_STATUS.md`, `START_HERE_NEXT_SESSION.md`,
  `ADR_STATUS.md`, journals recentes) exatamente como está no disco. Não faz `git fetch`
  bloqueante. Opcionalmente dispara uma atualização em segundo plano, com timeout curto
  (ex.: 2s) — se não terminar a tempo, seguem os dados em cache, com um aviso
  `"memoriaAtualizadaEm": "<timestamp do cache>"` no resumo executivo, para o agente (e o
  responsável do projeto) saberem que pode estar desatualizado.
- `/fim` grava o journal da sessão como um arquivo novo, com nome único por sessão (mesmo
  padrão já usado hoje), num diretório de **outbox local** — não dentro do clone Git do
  hub. Essa escrita é uma chamada de sistema de arquivos: não depende de rede, de outro
  agente, nem do estado do repositório remoto. Não existe cenário de falha nessa etapa que
  não seja disco cheio ou permissão — os mesmos casos em que qualquer ferramenta já falha
  hoje.

**Camada 2 — Remota, assíncrona, best-effort, nunca bloqueia quem a chamou.**
Publicar no `criativododo-memory` deixa de ser algo que a sessão do agente espera terminar:

- Depois de gravar o journal no outbox, `/fim` tenta publicar **uma vez**, com um teto
  curto de tentativas (ex.: 3, não 5) e timeout total curto (ex.: 5–10s). Cada tentativa:
  `fetch` → se o hub avançou, `reset --hard origin/main` no clone canônico único (não um
  worktree por sessão — ver 4.2) → copiar os journals pendentes do outbox → regenerar os
  três artefatos derivados por função pura (mantém o acerto da Fase 2 da ADR-021) →
  commit → push.
- Se qualquer etapa falhar — sem rede, remoto indisponível, push rejeitado depois do teto
  de tentativas — a resposta de `/fim` é sempre sucesso do ponto de vista da sessão, com
  um campo `"publicado": false, "pendente": true`. O journal **continua no outbox**, o
  agente não faz nada a mais, a sessão termina.
- Journals pendentes no outbox são reprocessados automaticamente na próxima vez que
  qualquer coisa tentar publicar — o próximo `/fim` de qualquer sessão, ou uma chamada
  explícita de `session-memory.mjs publish` sem argumentos, que varre o outbox inteiro.
  Não é preciso um daemon: "a próxima vez que alguém tentar publicar" já é suficiente,
  porque o outbox é cumulativo e idempotente.

### 4.2 Um único clone canônico, sem worktree por sessão

Como o outbox já isola cada sessão (arquivo próprio, nunca editado por duas sessões), não
existe mais working tree compartilhado para proteger — a criação de `git worktree` por
sessão fica sem função e é removida. Volta a existir **um único clone físico do hub**, no
caminho fixo definido em 4.1. Ele só é tocado pela rotina de publicação (Camada 2), nunca
diretamente por uma sessão interativa. Isso elimina inteiramente: criação/remoção de
worktree a cada sessão, detecção e limpeza de worktree órfão, e a classe de bug
"worktree do memory travado porque a sessão morreu no meio".

### 4.3 Um lock de publicação não-bloqueante (opcional, não obrigatório para correção)

Duas sessões podem tentar publicar ao mesmo tempo. Como cada tentativa refaz `fetch →
reset → recomitar → push` do zero (reaproveita o desenho já correto da ADR-021, Fase 3,
commit `058b7cc`), uma corrida entre duas publicações não corrompe nada — na pior hipótese,
uma delas recebe `push` rejeitado e tenta de novo. Um lock de arquivo (`flock`) é uma
otimização de custo (evita tentativas redundantes), nunca uma condição de correção — e por
isso, se o lock estiver ocupado, a resposta correta é "não tentei publicar agora, seu
journal segue no outbox, sem problema", nunca esperar o lock liberar.

### 4.4 Schema de `/fim` reduzido ao que tem valor sem prosa obrigatória

Campos obrigatórios: `nextTask`, `blockers` (pode ser lista vazia), `status`. Todo o resto
(`context`, `workPerformed`, `decisions`, `problems`, `observations`, `confidence`) passa a
ser opcional, preenchido só quando há algo factual a registrar — sem exigir texto de
preenchimento para sessões triviais (ex.: sessões de leitura, sessões que só rodaram
`/check`).

---

## 5. Fluxo do `/inicio`

```
1. Resolve CRIATIVODODO_MEMORY_DIR (fixo, sem cwd).
2. Existe clone local do hub?
   Não → clona. Falhou (sem rede)?
         → segue com contexto vazio, aviso explícito "memória indisponível nesta sessão",
           NUNCA aborta.
3. Lê PROJECT_STATUS.md / START_HERE_NEXT_SESSION.md / ADR_STATUS.md / journals recentes
   como estão no disco agora — nenhuma operação de rede necessária até aqui.
4. Dispara fetch em segundo plano com timeout curto (best-effort). Se responder a tempo e
   houver atualização, atualiza o cache local para a PRÓXIMA leitura — não para esta.
5. Grava o estado de runtime da sessão localmente (.claude/session-memory/runtime/<id>.json)
   — como já é feito hoje, sem mudança.
6. Retorna o resumo executivo, com "memoriaAtualizadaEm": <timestamp do cache usado>.
```

Nenhum passo entre 1 e 6 pode terminar em `SessionMemoryError`. O pior resultado possível
é um resumo executivo vazio com aviso — nunca uma sessão que não consegue começar.

---

## 6. Fluxo do `/fim`

```
1. Lê o estado de runtime da sessão (local, sempre disponível).
2. Monta o journal (mesma lógica de hoje: baseline, commits, diffs, checks).
3. Grava o journal como arquivo único no outbox local — só isso já é suficiente para o
   trabalho da sessão estar seguro; nada abaixo pode apagar ou perder essa escrita.
4. Tenta publicar (Camada 2, Seção 4.1): até 3 tentativas curtas de
   fetch → reset → regenerar artefatos → commit → push.
5. Sucesso → resposta inclui "publicado": true, commit.
   Falha (qualquer motivo) → resposta inclui "publicado": false, "pendente": true,
   motivo humano-legível — e a sessão termina normalmente, sem erro.
```

Nenhum passo entre 3 e 5 pode terminar em `SessionMemoryError`. O pior resultado possível
é "gravado localmente, publicação pendente" — nunca "sessão não pôde terminar".

---

## 7. Estratégia de sincronização

- **Fonte de verdade para leitura:** o cache local do hub, sempre. Pode estar
  desatualizado; nunca ausente (depois do primeiro `/inicio` bem-sucedido nesta máquina).
- **Fonte de verdade para escrita:** o outbox local até o momento em que a publicação
  confirma o push — a partir daí, o remoto.
- **Reconciliação:** puramente aditiva. Cada journal é um arquivo com nome único; os três
  artefatos derivados são recomputados por função pura sobre o conjunto completo de
  journals presente no hub no momento da publicação (reaproveita a Fase 2 da ADR-021).
  Não existe merge de texto, porque não existe mais texto editado por mais de uma sessão.
- **Ordem entre sessões concorrentes:** decidida pela função pura de derivação (ex.:
  `endedAt` mais recente vence; empate por `session-id`), não pela ordem de chegada do
  push — então duas sessões publicando quase ao mesmo tempo produzem o mesmo resultado
  final independente de quem "ganhou a corrida" do Git.
- **Backlog:** o outbox local é, por definição, a fila de tudo que ainda não chegou ao
  remoto. Não precisa de fila separada, não precisa de banco, não precisa de daemon — é o
  próprio sistema de arquivos.

---

## 8. Recuperação de falhas

| Falha | Comportamento hoje | Comportamento proposto |
|---|---|---|
| Sem rede no `/inicio` | Sessão não inicia (`fail`) | Sessão inicia com cache local, aviso de possível desatualização |
| Sem rede no `/fim` | Sessão não termina (`fail`) | Journal salvo no outbox; sessão termina; publicação marcada pendente |
| Outro agente publica primeiro | Publicação falha após N tentativas, `fail()` | Publicação marcada pendente; nada é perdido; próxima tentativa (de qualquer sessão) reprocessa o outbox inteiro, incluindo esse journal |
| Hub sujo/corrompido localmente | Sessão não inicia (`fail`) | Publicador recria o clone do zero a partir do remoto (é só um cache); leitura usa o último cache válido conhecido até lá |
| Sessão interrompida no meio (crash) | Pode deixar worktree órfão exigindo limpeza (ADR-021 Fase 3/4) | Não há worktree para orfanizar; na pior hipótese, um arquivo de runtime local sem `finishedAt`, inofensivo, limpável por idade |
| Dois clones divergentes (bug ao vivo, Seção 1) | Exige reconciliação manual (como já ocorreu — commit `1a462f3`) | Estruturalmente impossível: caminho fixo por máquina, único clone canônico, journals de sessão nunca vivem fora do outbox até serem publicados |

---

## 9. Plano de migração

Incremental, cada etapa validável isoladamente, sem big-bang — mantendo o espírito
prudente da ADR-021 original, mas sem repetir o erro de deixá-la presa numa branch:

1. **Reconciliar a divergência ao vivo (Seção 1) antes de qualquer mudança de código.**
   Decidir, com o responsável do projeto, o que fazer com o journal não publicado
   `2026-08-04_1216.md` no clone do checkout principal — não descartar sem revisão, pode
   ser trabalho legítimo de outra sessão em andamento.
2. **Adotar imediatamente o fix de caminho fixo (`CRIATIVODODO_MEMORY_DIR`), reaproveitando
   o código já implementado e testado em `73aff41`.** Baixo risco, alto impacto, resolve o
   bug ativo sozinho, sem esperar o resto da proposta.
3. **Adotar a geração de artefatos por função pura (Fase 2 da ADR-021, `85ebd11`)** — já
   implementada e testada, também de baixo risco.
4. **Implementar o outbox local e tornar `/fim` best-effort na publicação** (Seção 4.1,
   Camada 2) — a mudança de maior valor desta proposta.
5. **Tornar `/inicio` não-bloqueante em rede** (Seção 5) — cache local sempre, fetch em
   segundo plano com timeout.
6. **Remover a lógica de `git worktree` por sessão** introduzida na Fase 3 da ADR-021
   (`058b7cc`) — não reaproveitar essa parte; ela resolve um problema que deixou de existir
   depois da etapa 4.
7. **Reduzir o schema obrigatório de `/fim`** (Seção 4.4).
8. **Mesclar o resultado em `main`** e apagar a branch `feat/portal-login-screen` (ou
   arquivá-la) — nenhuma implementação de memória deve voltar a existir só numa branch
   isolada.
9. **Atualizar `.claude/skills/inicio/SKILL.md` e `.claude/skills/fim/SKILL.md`** para
   remover a instrução "se falhar, pare" e substituí-la por "reporte o campo `pendente` do
   resultado, sem tratar como erro".

Cada etapa acima é independentemente testável com o suite já existente em
`.claude/session-memory/test/` mais os testes novos que a mudança de comportamento exigir
(principalmente: `/fim` sem rede não deve lançar `SessionMemoryError`; `/inicio` sem rede
não deve lançar `SessionMemoryError`; outbox com N journals pendentes deve publicar todos
numa única rodada de `publish`).

---

## 10. Comparação entre a arquitetura atual e a nova

| Dimensão | Atual (`main`) | Atual (ADR-021, não mesclada) | Proposta |
|---|---|---|---|
| `/inicio` pode falhar por falta de rede? | Sim | Sim (`fetchHub` chama `fail()`) | Não |
| `/fim` pode falhar por falta de rede? | Sim | Sim (publish esgota tentativas e falha) | Não |
| Caminho da memória depende de `cwd`? | Sim (bug ativo) | Não (corrigido, Fase 1) | Não |
| Estado compartilhado mutável entre sessões? | Sim (edição direta de 3 arquivos) | Não (artefatos gerados, Fase 2) | Não |
| Mecanismo de isolamento por sessão | Nenhum (bug) | `git worktree` efêmero + limpeza de órfãos | Arquivo único no outbox — sem Git envolvido até a publicação |
| Journal perdido se a publicação falhar? | Sim, requer intervenção manual | Não perdido, mas sessão não termina até resolver | Não, e a sessão termina normalmente |
| Schema obrigatório de `/fim` | 3 campos obrigatórios, mas skill já pede os 12 | Igual | 3 campos obrigatórios, resto opcional |
| Onde vive a implementação | `main` (frágil) | Branch isolada, nunca mesclada | `main`, única implementação |

---

## 11. Estimativa de redução de complexidade

- **Elimina** a lógica de `git worktree` por sessão para a memória: criação, remoção,
  detecção de órfão, `pruneOrphanSessionWorktrees` — cerca de 80 linhas e uma categoria
  inteira de testes (`worktree-isolation.test.mjs`) deixam de ser necessárias.
- **Elimina** todo `fail()` de rede em `/inicio` e `/fim` — cerca de 6 pontos de falha
  síncrona no fluxo crítico da sessão, reduzidos a 0.
- **Elimina** a possibilidade estrutural do bug ao vivo descrito na Seção 1 (dois clones
  divergentes) — não como algo detectado e corrigido, mas como algo que deixa de poder
  acontecer, porque o caminho é fixo e não há mais working tree compartilhado por sessão.
- **Reduz** de 12 para 3 os campos obrigatórios do schema de `/fim`.
- **Reduz** o número de operações de rede síncronas por sessão de até 2 (`fetch` no
  `/inicio` + até 5 tentativas de `fetch`/`push` no `/fim`) para 0 obrigatórias (o `fetch`
  em segundo plano do `/inicio` e a tentativa best-effort do `/fim` não bloqueiam nem
  contam como pré-condição de sucesso).
- **Não adiciona** infraestrutura nova: sem daemon, sem fila externa, sem banco de dados —
  o outbox é um diretório local e a publicação é a mesma chamada de CLI de hoje, só que
  best-effort em vez de obrigatória.

Em conjunto, isso é uma redução líquida de superfície de código e de pontos de falha, não
uma troca de uma complexidade por outra.

---

## 12. Recomendação final

Aprovar esta proposta como ADR-022, com a ressalva de que ela **substitui a Fase 3 e o
comportamento de bloqueio em falha da ADR-021, mantendo suas Fases 1 e 2** (caminho fixo e
artefatos gerados por função pura), que já estavam corretas e já estão testadas.

Ação imediata recomendada, independente da aprovação do restante: reconciliar a
divergência ao vivo descrita na Seção 1 (etapa 1 do plano de migração) e aplicar o fix de
caminho fixo (etapa 2) o quanto antes — é uma correção pequena, já implementada e testada
numa branch existente, que sozinha elimina o bug que está acontecendo agora nesta máquina.

O restante desta proposta (outbox, `/fim`/`/inicio` best-effort, remoção de worktree por
sessão, schema reduzido) deve seguir o fluxo normal de aprovação do projeto antes de
qualquer implementação — nenhuma linha de código desta proposta foi escrita ainda; este
documento é diagnóstico e desenho, não execução.
