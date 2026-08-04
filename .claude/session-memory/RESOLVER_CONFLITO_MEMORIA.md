# RESOLVER_CONFLITO_MEMORIA.md

> Procedimento operacional para quando um desenvolvedor encontra um conflito manual no
> repositório de memória (`criativododo-memory`, localizado em `$CRIATIVODODO_MEMORY_DIR`
> ou, por padrão, `$HOME/criativododo-memory`). Desde `MEMORIA_CHANGELOG.md`, isso nunca
> impede uma sessão de agente de rodar — mas alguém, em algum momento, precisa resolver o
> conflito de verdade para a memória voltar a ficar consistente.

## Como saber que há um conflito

Qualquer um destes sinais:

- `session-memory.mjs status` (ou o resumo do `/inicio`) volta com campos vazios que
  normalmente têm conteúdo (fase, sprint, bloqueios) — sinal de que a leitura de
  `PROJECT_STATUS.md` falhou silenciosamente e caiu no fallback.
- `/fim` responde com `"pendente": true` e o motivo menciona memória indisponível ou
  conflito de merge.
- Checagem direta:
  ```bash
  cd "${CRIATIVODODO_MEMORY_DIR:-$HOME/criativododo-memory}"
  git status
  ```
  Procure por linhas `UU` (unmerged) ou a mensagem "You have unmerged paths" /
  "interrupted rebase".

## O que nunca fazer

- **Não rode `/fim` ou `/publish` esperando que "resolvam sozinhos".** Por design, eles
  detectam o conflito e só marcam pendente — não vão tentar mesclar conteúdo por você.
- **Não delete o clone da memória para "começar limpo"** sem antes checar se há journals
  pendentes locais (`.claude/session-memory/runtime/*.pending-journal.md`, em qualquer
  checkout/worktree que possa ter rodado `/fim` recentemente) ou commits locais ainda não
  publicados (`git log origin/main..HEAD` dentro do clone da memória). Apagar o clone sem
  checar isso pode perder journals que não existem em nenhum outro lugar.
- **Não faça `git push --force`.** Nunca é necessário para resolver este tipo de conflito.

## Os únicos três arquivos que costumam conflitar

`journals/**/*.md` têm nome único por sessão — praticamente nunca conflitam entre si. Se um
conflito aparecer, é sempre em um (ou mais) destes três, porque são os únicos arquivos que
mais de uma sessão escreve:

- `project/PROJECT_STATUS.md`
- `project/START_HERE_NEXT_SESSION.md`
- `journals/INDEX.md`

Nenhum dos três é dado irrecuperável — são resumos derivados que a próxima sessão que
rodar `/fim` regrava por completo. Isso simplifica a resolução: na dúvida, é seguro
descartar e deixar a próxima sessão regerar, **desde que nenhum journal seja tocado**.

## Procedimento

1. **Entre no clone da memória:**
   ```bash
   cd "${CRIATIVODODO_MEMORY_DIR:-$HOME/criativododo-memory}"
   git status
   ```

2. **Caminho rápido (recomendado na maioria dos casos): aborte e deixe regenerar.**
   Como os três arquivos acima são só resumo, o caminho mais simples e seguro costuma ser
   descartar a tentativa de merge/rebase em vez de resolver linha a linha:
   ```bash
   git merge --abort      # se "git status" disser que há um merge em andamento
   # ou
   git rebase --abort     # se disser que há um rebase em andamento
   git status              # confirme que voltou a um estado limpo
   git reset --hard origin/main   # só se ainda sobrar sujeira local sem journal pendente
   ```
   Depois disso, rode `session-memory.mjs publish` (ou espere a próxima sessão rodar
   `/fim`) para que os três arquivos sejam regravados a partir do estado mais atual.

3. **Caminho manual (quando o conteúdo divergente importa — ex.: dois "bloqueios"
   diferentes e ambos ainda válidos): resolva à mão.**
   ```bash
   # abra cada arquivo em UU e localize os marcadores
   grep -rn "<<<<<<<\|=======\|>>>>>>>" project/ journals/INDEX.md
   ```
   Para cada arquivo:
   - Compare o campo `updatedAt` (ou `endedAt`) dentro do bloco `<!-- session-memory ... -->`
     de cada lado do conflito — o mais recente costuma refletir o estado mais atual do
     projeto.
   - Se as listas de "Bloqueios" divergirem e ambos os itens ainda forem válidos, uni-as
     em vez de escolher um lado — não é incomum que duas sessões tenham identificado
     bloqueios diferentes e igualmente reais.
   - Remova os marcadores `<<<<<<<`, `=======`, `>>>>>>>` manualmente.
   - `git add <arquivo>` para cada arquivo resolvido.
   - `git commit` (se era um merge) ou `git rebase --continue` (se era um rebase).

4. **Se o conflito estiver em um journal** (`journals/**/*.md`, fora do `INDEX.md`) —
   isso não deveria acontecer, já que cada sessão grava um arquivo com nome único. Se
   acontecer mesmo assim, é sinal de algo fora do funcionamento esperado (duas sessões com
   o mesmo `--session` id, ou edição manual anterior de um journal). **Não tente resolver
   sozinho por inferência** — journals são registro histórico factual; escolher um lado ou
   mesclar prosa de duas sessões distintas pode criar um registro que nunca aconteceu.
   Preserve os dois lados (renomeie um deles com um sufixo antes de commitar, por exemplo)
   e registre a situação para o responsável do projeto decidir.

5. **Publique:**
   ```bash
   git push
   ```
   Se o push também for rejeitado (outra sessão publicou nesse meio-tempo), repita a partir
   do passo 1 — agora contra o estado mais novo do remoto.

6. **Confirme que voltou ao normal:**
   ```bash
   node .claude/session-memory/bin/session-memory.mjs status
   node .claude/session-memory/bin/session-memory.mjs validate
   ```
   `status` deve voltar com fase/sprint/bloqueios preenchidos; `validate` deve reportar
   `valid: true` (ou listar exatamente os problemas que ainda restam, se houver).

## Journals pendentes (situação relacionada, mas não é um conflito de Git)

Se `/fim` respondeu com `pendente: true` porque a memória estava **indisponível** (não
porque havia conflito), o journal ficou salvo em
`.claude/session-memory/runtime/<session-id>.pending-journal.md`, no checkout/worktree
onde a sessão rodou — e **não** existe hoje um processo automático que o recolha de lá.
Reconciliação manual:

1. Localize o arquivo `*.pending-journal.md` (ele já está no formato final de journal).
2. Com a memória disponível, copie o conteúdo para o próximo slot correto:
   ```bash
   cd "${CRIATIVODODO_MEMORY_DIR:-$HOME/criativododo-memory}"
   mkdir -p journals/AAAA/MM
   cp /caminho/para/<session-id>.pending-journal.md journals/AAAA/MM/AAAA-MM-DD_HHMM.md
   ```
   (use a data/hora real do journal, visível no bloco `<!-- session-memory ... -->` dentro
   do arquivo, campo `endedAt`).
3. Rode `session-memory.mjs status`/`validate` para confirmar, `git add`, `git commit`,
   `git push`.
4. Apague o `.pending-journal.md` original só depois de confirmar que o journal está
   publicado no remoto.
