# Regras de Negócio Extraídas do Briefing de Telas (DODÔ)

> Extraído de `Workspace/UX/BRIEFING_TELAS_E_COMPONENTES_DODO.md` (documento
> descartado em 2026-07-26 na limpeza para o rebuild de UI "do zero" — o
> restante daquele documento era proposta de telas/componentes/ícones, sem
> valor para uma reconstrução visual do zero). Este arquivo preserva só o
> que era regra de negócio/domínio/autorização real, auditada a partir do
> código-fonte que existia no momento da auditoria original (2026-07-24).
> Fonte de verdade continua sendo `Historico/CONTRATO_SOBERANO.md` e as
> SPECs em `Produto/SPEC-*.md` — isto aqui é leitura complementar.

## Modelo de domínio e máquinas de estado (auditado do código Laravel)

| Conceito | Model | Estados |
|---|---|---|
| Parceira (influenciadora) | `Parceira` | `Ativa` \| `Inativa` (+ `reprovado_em`/`motivo_reprovacao`, sem status próprio) |
| Marca | `Marca` | `Ativa` \| `Inativa` |
| Colaboração Mensal / Campanha | `Campanha` | `PLANEJADA` → `ATIVA` → `ENCERRADA` \| `CANCELADA` |
| Vínculo Parceira×Campanha | `ParticipacaoNaCampanha` | `ATIVA` \| `CANCELADA` (+ `congelado_em`, trava valor/quantidades) |
| Briefing | `Briefing` | sem status próprio; `data_aprovacao_interna` sempre = `prazo` − 7 dias úteis (RN-04) |
| Entrega de conteúdo | `Material` | `PENDENTE` → `APROVADO` \| `REPROVADO` |
| Pagamento | `Pagamento` | `PENDENTE` → `APROVADO` → `PAGO` |
| Envio logístico | `Envio` | `PENDENTE` → `EXPEDIDO` → `ENTREGUE` \| `CANCELADO` |
| Medidas da influenciadora | `MedidaInfluenciadora` | sem status; histórico append-only (mais recente = vigente) |

## Autorização

- `ADMIN` tem bypass global (`Gate::before` em `AppServiceProvider`) — passa em qualquer policy.
- Policies (`ParceiraPolicy`, `CampanhaPolicy`, `ParticipacaoNaCampanhaPolicy`, `MarcaPolicy`) restringem `INFLUENCIADORA` aos próprios registros (`user_id` dono) e a campanhas/participações com `ParticipacaoNaCampanha.status = ATIVA`.
- `MarcaPolicy.viewAny` é `false` para não-ADMIN — influenciadora não acessa marcas diretamente.
- **Gap conhecido, não resolvido:** `GESTOR_MARCA` existe como valor de `role`, mas nenhuma tela ou regra hoje o trata diferente de `INFLUENCIADORA`/`ADMIN` — não presumir comportamento específico para esse papel sem decisão de PO.

## Regras de negócio por módulo

**Cadastro / Parceira**
- Nasce sempre com `status = Inativa` (RN-01).
- CEP automático nunca sobrescreve endereço já digitado manualmente.
- `podeAprovar`/`podeReprovar` só quando `status = Inativa`; não é possível reprovar duas vezes.
- Consentimento LGPD obrigatório a cada edição de dados.
- Campos contratuais (`razao_social`, canais/prazo de uso de imagem) são geridos pela equipe — não editáveis pela própria parceira, mas preservados no payload.
- Medidas são sempre um novo registro (histórico append-only), nunca edição do existente.
- Perfil considerado incompleto se faltar CEP, rua, cidade ou UF.

**Campanha / Participação**
- Só parceiras `Ativa` e ainda não vinculadas aparecem como candidatas para vincular a uma campanha.
- "Congelar" participação trava valor/quantidades contratados — irreversível pela UI.
- "Cancelar" participação só permitido se `status = ATIVA`.

**Briefing**
- `data_aprovacao_interna` = `prazo` − 7 dias úteis (RN-04), calculada automaticamente.
- Tipo de entregável (`FEED`, `REELS`, `STORIES`) é imutável após criado.

**Materiais**
- Aprovar/reprovar com motivo só quando `status = PENDENTE`.
- Novo upload bloqueado se não houver briefing publicado para aquele tipo, ou se a cota contratada já foi atingida.

**Pagamento**
- Avança `PENDENTE → APROVADO → PAGO`; comprovante anexável.

**Envio**
- Avança `PENDENTE → EXPEDIDO → ENTREGUE`; código de rastreio opcional.

**Documentos (SPEC-023)**
- Já implementada no backend; nunca teve UI própria definida.
- Geração de contrato condicionada a `Parceira.status = Ativa` (RN-15/RN-03).
- Geração de briefing formal condicionada à sinalização própria da SPEC-023.

**Login**
- Nenhuma regra de bloqueio por tentativas está implementada no V3 hoje.
- RN-17 do PRD legado (bloqueio após 5 tentativas, fluxo cupom+CNPJ) é herança do V1 (Apps Script) — **não presumir que foi portada** para o V3 (e-mail+senha via Laravel) sem confirmar no backend.

**Histórico**
- O domínio já modela "encerrado" como valor de status (`ENCERRADA`/`CANCELADA`), não como coleção física separada — decisão deliberada, o Contrato Soberano não exige uma entidade de histórico à parte no V3 (ao contrário do V1 legado).
