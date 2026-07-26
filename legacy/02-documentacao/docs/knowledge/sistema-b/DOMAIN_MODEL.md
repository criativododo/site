# Sistema B (tear-v2-app) — Modelo de Domínio

> Versão baseline (2026-07-20). Vocabulário próprio deste sistema — diverge
> em alguns pontos do Contrato Soberano do Sistema A (GAS); ver notas.

| Entidade | Finalidade | Relacionamentos | Status/enum | Regra principal |
|---|---|---|---|---|
| **User** | Conta de acesso | 1:1 opcional com Parceira (`Parceira.user_id`; inverso `User::parceira()` ainda não existe) | papéis Spatie (`ADMIN` ativo; `GESTOR_MARCA`/`INFLUENCIADORA` só seedados) | login via Sanctum |
| **Parceira** | Cadastro da influenciadora | pertence a `User` (opcional); `aprovadoPor → User` | `Ativa`/`Inativa` | nasce `Inativa`; `aprovar()` é o único ponto de escrita de status; CEP automático não implementado |
| **Marca** | Cadastro interno da marca cliente | tem muitas `Campanha` | `Ativa`/`Inativa` | sem login/tenant próprio (decisão de escopo) |
| **Campanha** | Iniciativa comercial de uma Marca | pertence a `Marca`; tem muitas `ParticipacaoNaCampanha` | `PLANEJADA`/`ATIVA`/`ENCERRADA`/`CANCELADA` | datas livres; **sem vínculo com `MesReferencia`** do domínio GAS (divergência conhecida) |
| **ParticipacaoNaCampanha** | Vínculo Campanha×Parceira + condição comercial do vínculo | pertence a `Campanha` e `Parceira`; tem um `Briefing`, muitos `Material`, um `Pagamento` | `ATIVA`/`CANCELADA` | só Parceira `Ativa` pode ser vinculada; única por (campanha, parceira); nunca hard-delete |
| **Briefing** | Orientação de produção | 1:1 com `ParticipacaoNaCampanha` | — | CRUD admin only |
| **Material** | Entregável de conteúdo | pertence a uma Participação; `aprovadoPor → User` | `PENDENTE`/`APROVADO`/`REPROVADO` | upload real no Drive (ou disco local em fallback); `aprovar()`/`reprovar(motivo)` únicos pontos de escrita |
| **Pagamento** | Remuneração da participação | 1:1 com `ParticipacaoNaCampanha`; `aprovadoPor → User` | `PENDENTE`/`APROVADO`/`PAGO` | auditoria de quem aprovou |

## Convenções

- Todas as FKs são `restrictOnDelete()` (nunca cascade).
- Nenhum recurso tem `destroy` — cancelamento é sempre soft (mudança de
  status), preservando histórico.

## Divergências conhecidas frente ao Contrato Soberano (Sistema A)

- `Campanha`/`ParticipacaoNaCampanha` não existem no vocabulário do GAS
  (que usa `Colaboração Mensal` + `MesReferencia`) — são conceitos novos do
  Sistema B, ainda não reconciliados formalmente.
- `Marca` como entidade própria (com futuro papel `GESTOR_MARCA`) também é
  novo — no GAS, `Marca` está definida só como papel de acesso não
  implementado.

Aprofundar reconciliação de vocabulário em sessão futura.
