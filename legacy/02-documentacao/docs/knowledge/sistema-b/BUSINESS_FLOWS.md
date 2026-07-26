# Sistema B (tear-v2-app) — Fluxos de Negócio

> Versão baseline (2026-07-20). Fluxo validado ponta a ponta pelo time em
> 2026-07-20 (segundo registro do `TASK_ROUTER.md` §15 do repositório
> principal).

## Fluxo ponta a ponta (hoje 100% admin-operado)

```
Influenciadora se cadastra (POST /api/parceiras/cadastro, público, throttled)
        ↓
Nasce Inativa
        ↓
Admin lista pendentes → abre perfil → aprova (PATCH .../aprovar, role:ADMIN)
        ↓
Parceira vira Ativa (único ponto de escrita: Parceira::aprovar())
        ↓
Admin cria Marca → cria Campanha (vinculada à Marca)
        ↓
Admin vincula Parceira Ativa à Campanha → ParticipacaoNaCampanha
   (define valor_contratado + reels/carrossel/stories qtd)
        ↓
Admin preenche Briefing (1:1 com a Participação)
        ↓
Material é enviado (upload real ao Drive, árvore Influenciadora/Campanha/Tipo)
        ↓
Admin aprova ou reprova o Material (com motivo, se reprovado)
        ↓
Admin cria/avança Pagamento (PENDENTE → APROVADO → PAGO)
```

## Ponto estrutural em aberto

Não existe ainda "Portal da Influenciadora" nem "Portal da Marca" — todo
usuário autenticado cai no mesmo `AppShell` administrativo. Diferente do
Sistema A (GAS), que já segrega por papel (Administrador/Influenciadora)
há várias SPECs. Construir esses portais é a próxima fatia natural de
trabalho quando o desenvolvimento de features for retomado.

## Fluxos ainda não cobertos por este sistema

- Portal self-service da Influenciadora (ver pendência acima).
- Qualquer fluxo específico de `GESTOR_MARCA` (papel seedado, sem rota).
- Geração de documentos/contrato (existe no Sistema A, sem equivalente
  aqui ainda).

Aprofundar/detalhar em sessão futura.
