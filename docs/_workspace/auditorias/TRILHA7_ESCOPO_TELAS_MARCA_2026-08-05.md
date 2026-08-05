# Trilha 7 — Revisão de Escopo das Telas da Marca

> Documento de decisão de escopo (workspace), não é ADR. Sessão exclusivamente investigativa
> e documental — nenhum código, rota, componente ou migration foi alterado. Produzido em
> 2026-08-05 a pedido do responsável do projeto, para responder se as telas do DOC SPRINT #2
> que pressupõem um ator "Marca" autenticado continuam previstas ou saem de escopo.
>
> **Legenda de camada de confiança:**
> **[E]** Evidência — verificado diretamente em código/doc, nesta sessão.
> **[I]** Inferência — conclusão minha a partir de evidências, não escrita em nenhum documento.
> **[H]** Hipótese — precisa de confirmação humana antes de virar decisão.

---

## Sumário executivo

**[E] A premissa desta sessão está desatualizada.** O prompt que abriu esta Trilha 7 parte de
"não existe atualmente um ator autenticado chamado Marca; o Portal permanece single-tenant sem
esse ator" como decisão vigente de sessões anteriores. Isso descreve o **ADR-008**
(2026-07-26). Mas o **ADR-022** (2026-08-05, mesmo dia, sessão anterior a esta) já supera
formalmente o ADR-008: o ator "Administrador da Marca" foi aceito, implementado e **já está em
produção no código** — `Dashboard da Marca` (`/marca/dashboard`), commit `5011cd6`. Não é mais
uma pergunta em aberto "esse ator deve existir?"; ele já existe.

**[E] Das três telas citadas como exemplo no prompt desta sessão, só uma de fato depende do
ator Marca.** "Comunicação da Marca" e "Administração de Clientes", como especificadas no
DOC SPRINT #2, são **telas exclusivas do Administrador DODÔ** — nenhuma delas concede acesso
a um ator Marca autenticado. Ver Fase 1/2 abaixo.

**[E] Existe um conflito documental real e não reconciliado**, identificado por uma sessão
anterior (`docs/_workspace/auditorias/RECONCILIACAO_ARQUITETURAL_MARCA_2026-08-05.md`) e ainda
não resolvido: o "Administrador da Marca" do ADR-022 (papel administrativo restrito, sem
tabela de domínio própria, sem isolamento por linha) diverge do ator `Marca` descrito em
**SPEC-035 §4.2/§10.2.3** (peer de Influenciadora, onboarding self-service, tabela
`BASE_MARCAS`, isolamento por `SUB_PROVIDER`). Nenhum documento soberano formalmente decidiu
qual dos dois modelos é o vigente — o código de produção segue o modelo do ADR-022, mas
`docs/business/PORTAL_BRIEFING.md` §4.3/§9.3 e `docs/business/PORTAL_BACKLOG.md` Feature 0.4
ainda descrevem "Marca fora do MVP" (ADR-008) como se fosse a decisão corrente.

**Por instrução explícita desta sessão ("caso exista conflito entre documentos soberanos, não
tente conciliá-lo; documente e interrompa"), a Fase 3 (decisão de escopo) não é concluída aqui
para o que depende desse conflito.** As Fases 1 e 2 (inventário e impacto), que não dependem de
resolver o conflito, estão completas abaixo.

---

## Fase 1 — Inventário

Telas/módulos do DOC SPRINT #2 (`criativododo-interno/DOC SPRINT #2/`, fonte citada no prompt
desta sessão) que citam "Marca":

| # | Tela/Módulo | Documento · Seção | Finalidade |
|---|---|---|---|
| 1 | **Dashboard da Marca** | `#2 - BRIEFING DE TELAS.md` §1 | Visão editorial, só-leitura, da campanha vigente para o cliente (Marca): timeline de acontecimentos, hero visual, status geral. Não é BI/CRM. |
| 2 | **Central de Comunicação** ("Comunicação com Marcas" é uma das categorias de destinatário) | `#2 - BRIEFING DE TELAS.md` linhas 140-153 | Ferramenta assistida para a DODÔ compor mensagens (modelos, variáveis, histórico) e abrir o WhatsApp Business Desktop já preenchido. Explicitamente **"exclusiva da DODÔ"** — texto do próprio doc: "Nenhum administrador da marca terá acesso." |
| 3 | **Administração** (Clientes, Marcas, Usuários, Permissões, Integrações, Auditoria, Configurações) | `#2 - BRIEFING DE TELAS.md` linhas 247-260 | CRUD administrativo de clientes/marcas/usuários/permissões pela DODÔ. Texto do doc: **"Acesso exclusivo da DODÔ para gestão de clientes, marcas, usuários, permissões e configurações globais."** |
| 4 | **Logística — "Visão da Marca"** | `#2 - BRIEFING DE TELAS.md` linhas 169-174 | Subconjunto filtrado (status de entrega) dentro da tela de Logística, para o ator Marca acompanhar envios. |
| 5 | **Relatórios — acesso da Marca** | `#2 MAPA DE PERMISSÕES(RBAC).md` linha 88 | "A tela de Relatórios é gerada exclusivamente pela DODÔ. A Marca apenas possui permissão de 'Visualizar' através de um link exclusivo imutável." |
| 6 | **Papel "Administrador da Marca"** (RBAC) | `#2 MAPA DE PERMISSÕES(RBAC).md` §2/§4/§5/§6 | Define o papel, matriz de permissões por escopo (Campanhas, Entregas, Briefings, Financeiro, Logística) e as restrições absolutas de PII/financeiro. |

---

## Fase 2 — Impacto (dependência do ator Marca)

| # | Tela | Depende obrigatoriamente de login/RBAC/isolamento da Marca? | Situação real no código | Justificativa |
|---|---|---|---|---|
| 1 | Dashboard da Marca | **Sim.** | **Implementada e commitada** (`5011cd6`, 2026-08-05 01:08). Rota `GET /api/marca/dashboard`, middleware `requireAdministradorMarca`, papel `ADMINISTRADOR_MARCA` (migration `0006`). Recorte de campos (sem financeiro/lgpd/moderação) já aplicado. | É a única tela do conjunto cujo propósito só existe se a Marca acessa o Portal como ator autenticado. |
| 2 | Central de Comunicação | **Não.** | **Implementada e commitada** (`734b01a`, 2026-08-05 09:27). Rota `/admin/comunicacao`, `requireAdmin` (não `requireAdministradorMarca`). | O doc de origem já especifica acesso exclusivo da DODÔ. "Comunicação com Marcas" é só uma categoria de *destinatário* de mensagens enviadas pela DODÔ via WhatsApp externo — a Marca nunca loga nessa tela. Já existe hoje, e nunca precisou do ator Marca para existir. |
| 3 | Administração (Clientes/Marcas/Usuários/Permissões) | **Não** (é DODÔ-only) — mas depende de uma entidade de domínio `marcas` que ainda não existe. | **Não implementada.** Nenhuma rota, service ou tabela `marcas` no repositório (`grep` em `portal-backend/src/modules` não retorna nada). | O doc de origem também declara acesso exclusivo da DODÔ. Não depende do ator Marca (login), mas depende do **dado** Marca como entidade de domínio (tabela `marcas`, proposta desde a S5 original do Plano Mestre — "Domínio Marca", ainda não implementada) para ter o que administrar. |
| 4 | Logística — Visão da Marca | **Sim**, para o recorte específico da Marca — mas é subordinada a uma tela (Logística) que **não existe ainda** para nenhum ator. | Não implementada (nenhuma rota/página de Logística no repositório, para nenhum papel). | Pergunta sobre "acesso da Marca" é prematura: a funcionalidade-base ainda não foi construída para o Administrador. Fora do escopo desta decisão. |
| 5 | Relatórios — acesso da Marca | **Sim**, por especificação (link exclusivo imutável). | Não implementada (nenhuma rota/página de Relatórios no repositório). | Mesma situação do item 4 — feature-base inexistente. Fora do escopo desta decisão. |

---

## Fase 3 — Decisão de escopo

**Não concluída — conflito entre documentos soberanos, decisão interrompida conforme
instrução desta sessão.**

O que pode ser afirmado sem reconciliar o conflito:

- Itens 2 e 3 (Central de Comunicação, Administração) **nunca dependeram do ator Marca** —
  são telas do Administrador DODÔ. A pergunta "ficam fora de escopo por falta do ator Marca?"
  não se aplica a elas. Comunicação já está implementada; Administração segue no roadmap,
  bloqueada apenas pela ausência da entidade de domínio `marcas` (item já previsto na sessão
  suspensa "Trilha 2 — Domínio Marca").
- Itens 4 e 5 (Logística, Relatórios) dependem de features inteiras que ainda não existem para
  nenhum ator — não é uma decisão sobre o ator Marca, é backlog não iniciado.

O que **não** pode ser afirmado sem uma decisão humana:

- Se o **Dashboard da Marca**, do jeito que foi implementado (`ADMINISTRADOR_MARCA`, ADR-022 —
  papel administrativo restrito, sem tabela própria, sem isolamento por linha), é a
  implementação **definitiva** do ator Marca, ou se precisa ser revisada/complementada para
  reconciliar com o modelo descrito em SPEC-035 §4.2 (peer autônomo, onboarding próprio,
  `BASE_MARCAS`, isolamento por `SUB_PROVIDER`). Essa é exatamente a pergunta que a sessão de
  reconciliação de 2026-08-05 já levantou e deixou pendente (ver Seção 3 e 6 daquele
  documento) — decisão do responsável do projeto, não desta sessão.
- Enquanto essa reconciliação não existir, também fica em aberto se **Administração de
  Clientes** deve nascer sobre o modelo do ADR-022 (marca como recorte administrativo) ou
  sobre o modelo de SPEC-035 (marca como tenant com onboarding próprio) — a resposta muda o
  formato da tabela `marcas` e o fluxo de cadastro que essa tela precisa oferecer.

---

## Fase 4 — Atualização documental

**Nenhuma atualização foi feita.** `docs/business/PORTAL_BRIEFING.md` §4.3/§9.3 e
`docs/business/PORTAL_BACKLOG.md` Feature 0.4 permanecem desatualizados (ainda descrevem
"Marca fora do MVP" como vigente) — mas corrigi-los exige antes decidir qual modelo de Marca
prevalece (mesmo bloqueio da Fase 3). Alterá-los agora, descrevendo só o ADR-022, arriscaria
apagar a divergência com SPEC-035 antes de ela ser resolvida. Fica registrado como pendência,
não executado.

---

## Handoff

**Nenhuma das duas opções do protocolo (A: telas suspensas / B: no roadmap mas bloqueadas)
descreve a situação real com precisão**, porque a situação não é uniforme entre as telas:

- Central de Comunicação: **não estava bloqueada por essa questão em nenhum momento** — já
  implementada, sempre foi DODÔ-only.
- Administração (Clientes/Marcas): **Opção B** — permanece no roadmap, bloqueada pela ausência
  da entidade de domínio `marcas` (Trilha 2, suspensa por este mesmo conflito).
- Dashboard da Marca: **nem A nem B** — já foi além de "prevista", já está implementada e em
  uso; a pendência não é "construir ou não", é "a implementação atual é a correta,
  arquiteturalmente, ou precisa ser revisada".
- Logística/Relatórios (recorte Marca): fora de escopo desta decisão — dependem de features
  que não existem para nenhum ator.

**Pergunta que precisa de decisão do responsável do projeto antes de qualquer nova sessão de
código tocar em Marca:** ratificar o ADR-022 como modelo definitivo (encerrando formalmente
SPEC-035 §4.2 como superada), reverter para o modelo de SPEC-035, ou definir os dois como
complementares (ex.: `ADMINISTRADOR_MARCA` para acesso administrativo + entidade `Marca` só
como dado, sem onboarding próprio) — esta última é a direção já esboçada na Seção 6 do
documento de reconciliação (`S4'` — ADR de reconciliação), ainda não escrita.

Este documento não substitui nem reabre a Trilha 2 (Domínio Marca) e a Trilha 3 (Google
Drive) — ambas continuam suspensas pela mesma causa, conforme já registrado em memória de
projeto (`reconciliacao-marca-ator-vs-dado`).
