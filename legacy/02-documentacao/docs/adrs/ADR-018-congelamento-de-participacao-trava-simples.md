# ADR-018 · Congelamento de Participação — trava de edição simples (P0-2 do Plano Mestre)

**Status:** Aceito — já implementado e em produção na branch
`feat/ui-design-system-ela` (commit `9d0f5c...`, migration
`2026_07_20_180000_add_congelado_em_to_participacoes_na_campanha_table.php`).
Esta ADR não decide nada novo — formaliza uma decisão que já existe como
código, extraída de `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`
(arquivado, ver "Documento de origem" abaixo) antes de arquivar esse plano.

**Resolve:** item P0-2 do plano mestre de congelamento operacional,
referenciado em `docs/_workspace/TASK_ROUTER.md` §28 ("Fase 1 do plano
executivo (arquivamento de baixo risco)").

## Contexto

`docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` (2026-07-20) propôs um
modelo completo para congelar os termos comerciais de uma
`ParticipacaoNaCampanha` no momento em que ela deixa de poder ser alterada:

1. Três colunas aditivas em `participacoes_na_campanha`: `congelado_em`,
   `congelado_por` (quem congelou) e `dados_congelados` (JSON com cópia de
   nome/CNPJ/chave PIX/endereço da `Parceira` e da medida vigente no
   momento — para que uma alteração posterior no cadastro vivo da Parceira
   não "vazasse" para uma participação já congelada).
2. Uma nova tabela `historico_alteracoes_participacao`, réplica estrutural
   de `historico_alteracoes` (já usada para `Parceira`), registrando toda
   tentativa de alteração aceita ou rejeitada.
3. Trava de edição de `Briefing` vinculado a uma participação congelada.

## Decisão

O que **de fato foi implementado** é bem mais estreito que o plano acima —
só a trava de edição sobre a própria `ParticipacaoNaCampanha`, nada mais:

- Uma única coluna `congelado_em` (timestamp, nullable) —
  `ParticipacaoNaCampanha::congelar()` (`app/Models/ParticipacaoNaCampanha.php`)
  só grava `now()`.
- Endpoint `PATCH /participacoes/{participacao}/congelar`
  (`routes/api.php`), `role:ADMIN`, idempotente (retorna 409 se já
  congelada).
- `ParticipacaoController::update()` bloqueia (HTTP 409) qualquer
  `PATCH /participacoes/{id}` que altere `valor_contratado`, `reels_qtd`,
  `carrossel_qtd` ou `stories_qtd` quando `congelado_em !== null`
  (constante `CAMPOS_COMERCIAIS`). `status` continua editável — cancelamento
  não é termo comercial.
- **Nada além disso.** Confirmado por leitura direta do código nesta sessão
  e por reconciliação da especificação funcional contra o código
  (2026-07-22): não existem `congelado_por`, `dados_congelados` nem
  `historico_alteracoes_participacao`. `Briefing` vinculado a uma
  participação congelada continua 100% editável — não há nenhuma checagem
  de `congelado_em` fora do próprio controller de Participação.

## O que foi proposto e não foi implementado (gap consciente, não bug)

O núcleo do problema que o plano original resolvia — **"o histórico deve
permanecer íntegro mesmo quando o cadastro vivo da Parceira mudar depois"**
— **não está coberto** pela implementação atual:

- Se a `Parceira` de uma participação já congelada alterar endereço, PIX ou
  nome depois do congelamento, uma leitura da participação antiga continua
  mostrando o cadastro **vivo** (via FK), não o valor da época — porque não
  existe `dados_congelados` para servir de cópia.
- Não há `congelado_por` — não é possível auditar quem congelou uma
  participação, só quando (`congelado_em`).
- Não há `historico_alteracoes_participacao` — tentativas de alteração
  (aceitas ou rejeitadas) sobre uma participação não deixam trilha, ao
  contrário do que já existe para `Parceira`.
- `Briefing` de uma participação congelada continua editável — já
  registrado como pendência Categoria C em `ESTADO_SESSAO.md` §4 ("Congelamento
  é decorativo fora dos campos comerciais da própria Participação").

A decisão real foi tomada **pela implementação**, não formalizada
conscientemente — esta ADR é o ato de formalizá-la a posteriori, não de
expandi-la.

## Consequências

- O comportamento em produção é: **trava de edição simples** sobre 4 campos
  comerciais de `ParticipacaoNaCampanha`, sem cópia de dados relacionados e
  sem trilha de auditoria própria.
- Se um caso real exigir a garantia de integridade histórica completa (ex.:
  geração de Contrato no Sprint 3, que depende de dado congelado estável —
  ver §9 do plano arquivado), o modelo completo (`dados_congelados`,
  `historico_alteracoes_participacao`) precisa ser retomado como trabalho
  novo, não como algo já coberto por este ADR.
- O plano original completo (`PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`) foi
  removido da árvore ativa do repositório (conhecimento já consolidado
  nesta ADR); se/quando o Sprint 3 retomar Contratos/Logística e precisar
  do desenho completo (`dados_congelados`, `historico_alteracoes_participacao`),
  ele precisa ser refeito como trabalho novo, não recuperado de um
  documento antigo.

## Documento de origem

Plano de arquitetura original do congelamento de Participação (P0-2),
removido da árvore ativa nesta sessão — a decisão real está formalizada
nesta ADR.
