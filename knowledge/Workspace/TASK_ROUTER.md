# TASK_ROUTER — TEAR V2

> **Função.** Fonte única e autorizada para localizar as **dependências mínimas**
> de cada SPEC. Nenhuma dependência pode ser buscada fora deste documento.
> Se uma dependência necessária não estiver aqui, **pare** e solicite a atualização
> deste arquivo — nunca o complete automaticamente.
>
> **Base de construção.** Documentação encontrada em `~/Downloads` (2026-07-14):
> `WORKFLOW.md` (ordem e dependências entre SPECs), `PRD.md` (fonte exclusiva de
> requisitos), `CONTRATO_SOBERANO.md` (domínio soberano), `ADR-001` (enums,
> MesReferencia, promoção), `ADR — Linguagem Ubíqua`, `DECISOES_BLOQUEANTES.md`
> (decisões abertas do PO) e `SPEC.md` (formato de SPEC).
>
> **Leitura.** Abrir **apenas as seções** indicadas na coluna "Seções". Nunca ler
> um documento inteiro quando houver âncora de seção.

---

## 0. Convenções

- `[x]` concluída · `[>]` em andamento · `[ ]` pendente.
- **Deps SPEC** = pré-requisitos entre SPECs (origem: `WORKFLOW.md`).
- **Fonte de requisitos** = sempre `PRD.md` (seções específicas).
- **Restrições** = ADRs e Contrato Soberano que a SPEC deve respeitar.
- 🟠 **Decisão do PO pendente** = a SPEC pode ser redigida, mas o item marcado
  fica como *pendência explícita*; **não inventar a regra**.

---

## 1. Localização física dos documentos

| Documento lógico | Caminho | Estado |
|---|---|---|
| `WORKFLOW.md` | — | **não existe mais** (2026-07-18: sumiu de `~/Downloads`; dependências entre SPECs já absorvidas por este roteador, ver SPEC-003 D-01) |
| `PRD.md` | `docs/PRD.md` | no repo |
| `CONTRATO_SOBERANO.md` | `docs/history/CONTRATO_SOBERANO.md` | no repo |
| `ADR-001` (enums/MesReferencia/promoção) | `docs/adrs/ADR-001-fechamento-de-contrato-e-enums.md` | no repo |
| `ADR — Linguagem Ubíqua` | `docs/adrs/ADR-003-linguagem-ubiqua-do-dominio.md` | no repo (numeração a confirmar) |
| `ADR-002 — Frontend Foundation` | `docs/adrs/ADR-002-frontend-foundation.md` | no repo |
| `ADR-010 — Banco oficial do Portal (planilha V2 "Portal Ela")` | `docs/adrs/ADR-010-banco-oficial-do-portal.md` | no repo |
| `ADR-013 — Autenticação do Portal via OAuth 2.0 Authorization Code Flow` | `docs/adrs/ADR-013-autenticacao-oauth-authorization-code.md` | no repo |
| `ADR-014 — Consolidação de arquivos por módulo de negócio` | `docs/adrs/ADR-014-consolidacao-de-arquivos-por-modulo.md` | no repo (2026-07-19: `src/` reorganizado em 14 `.js` — fatias verticais em `src/modulos/`; caminhos `src/{acl,adapters,controller,domain,repository,service}/...` citados em achados anteriores são históricos; mapa classe→arquivo na ADR) |
| Contratos de camada (ex-`_contract.js`) | `docs/architecture/ARQUITETURA_CAMADAS.md` | no repo (migrados pela ADR-014) |
| `DECISOES_BLOQUEANTES.md` | — | **não existe mais** (2026-07-18: sumiu de `~/Downloads`; o estado de cada pergunta P3–P8/Q-NN está rastreado por SPEC neste roteador — resolvidas: Q-03/04/07/08/10; abertas: Q-05/06/09) |
| `SPEC.md` (formato/Entrega 01) | `docs/specs/SPEC-001-cadastro-e-base-de-influenciadoras.md` | no repo |
| `PLANILHA_TEAR_2.0_MAPA.md` | `PLANILHA_TEAR_2.0_MAPA.md` (raiz) | no repo |
| `03 — Fronteiras do Domínio` | — | **não existe mais** (2026-07-18: sumiu de `~/Downloads`) |
| `04 — Capacidades do Sistema` | — | **não existe mais** (2026-07-18: sumiu de `~/Downloads`) |
| `06 — Modelo Conceitual dos Dados` | — | **não existe mais** (2026-07-18: sumiu de `~/Downloads`) |

> **Dívida ENCERRADA como perda (2026-07-18, sessão Tech Lead):** os cinco
> documentos "fora do repo" **desapareceram de `~/Downloads`** antes de serem
> consolidados (verificado por listagem completa do diretório e busca em todo
> o repo, `CONHECIMENTO/` e `knowledge/`). Nenhuma SPEC ativa depende deles:
> as dependências (WORKFLOW) e as decisões do PO (DECISOES_BLOQUEANTES)
> foram absorvidas por este roteador enquanto os arquivos existiam; §5 já
> previa parar caso alguma SPEC precisasse de seção específica de 03/04/06 —
> o que nunca ocorreu. Não procurar esses arquivos de novo; se algum
> reaparecer (backup do PO), aí sim consolidar em `docs/`.

---

## 2. Dependências globais (valem para toda SPEC)

Toda SPEC deve respeitar, sem reabrir:

| Documento | Seções | Para quê |
|---|---|---|
| `CONTRATO_SOBERANO.md` | §2 (termos banidos), §4 (linguagem ubíqua), §5 (VOs/PII), §6 (agregados), §8 (eventos) | Domínio soberano |
| `ADR — Linguagem Ubíqua` | §4 (tabela canônica), §5 | Vocabulário obrigatório (`Colaboração Mensal`, `Compilador do Mês`, `MesReferencia`, `Snapshot`) |
| `ADR-001` | §2 (enums/coerção), §3 (MesReferencia `AAAA-MM`) | Estados fechados; formato canônico |
| `SPEC.md` (SPEC-001) | inteiro serve de **modelo de formato** | Estrutura de uma SPEC |
| `DECISOES_BLOQUEANTES.md` | "Perguntas ao PO" (P3–P8) | Saber quais regras ficam 🟠 abertas |

---

## 3. Roteador por SPEC (dependências mínimas)

### EPIC 01 — Cadastro e Gestão

#### `[x]` SPEC-001 · Cadastro de Influenciadoras
- **Deps SPEC:** —
- **Requisitos (PRD):** §5.1, §6.1, §7 (RN-01, RN-02, RN-03), §9 (RF-001…RF-004)
- **Restrições:** `ADR-001` §4 (promoção Cadastro→Parceira)

#### `[x]` SPEC-003 · Importação Inicial da Base
- **Deps SPEC:** SPEC-001, SPEC-002
- **Requisitos (PRD):** §8 (entidade Influenciadora) · `PLANILHA_TEAR_2.0_MAPA.md` (mapa de colunas)
- **Ordem:** entregável adjacente (decisão do PO Q-10, opção B) — antes da Fase 2 (compilação do mês)
- ✅ **Implementada (2026-07-17):** slice completo (`ChaveInfluenciadora`
  (D-02c) → `LegadoACL` (leitura SOMENTE, sem nenhum método de escrita —
  RN-01/INV-01 estrutural) + `ParceiraACL.listarChaves`/`importarLote`
  (novas portas de idempotência/escrita em lote na base nova, §6.3) →
  `ImportadorService` → `ImportacaoController` → Portal
  `importarBaseLegada`). Nova Script Property `SPREADSHEET_ID_LEGADO`
  (`src/shared/Nucleo.js`, ex-`Config.js` — ADR-014) — planilha de origem, distinta de
  `SPREADSHEET_ID` (nunca a mesma, `DEPLOY_CHECKLIST.md` §2).
- ✅ **Resolvido (PO, 2026-07-17, D-01/D-02):** numeração confirmada por
  este roteador (`WORKFLOW.md` externo não existe mais); critério de
  registro válido (Q-10 opção A) = possui `INFLU_KEY` e nome da
  influenciadora — no esquema físico real (`PLANILHA_TEAR_2.0_MAPA.md` §3)
  não há coluna de nome separada de `INFLU_KEY` (mesma equivalência de
  SPEC-001, `Parceira.nome`↔`INFLU_KEY`), então as duas condições colapsam
  numa checagem física única: `INFLU_KEY` não vazio. **Hipótese registrada**
  em `ImportadorService` — revisar se surgir uma coluna de nome distinta.
  Demais campos vazios não descartam o registro; `STATUS` ausente/
  desconhecido nasce `Inativa` (mesmo default de RN-01 SPEC-001) em vez de
  descartar. 15 testes novos; suíte completa 464/464 verde; lint limpo.
- ✅ **Resolvida (2026-07-18, auditoria de apoio):** autorização por papel
  (§13, IM-03) — `importarBaseLegada` ganhou o parâmetro `dados` (não
  tinha, mesmo precedente de `arquivarLote`/SPEC-034 §11) e a guarda
  `exigirPapelAdministrador(dados)`, mesmo mecanismo das demais 15 rotas
  administrativas fechadas em §11. Teste novo em
  `test/portal-importacao.test.js` (RBAC negado sem sessão ADMINISTRADOR);
  suíte completa verde; lint limpo.

#### `[x]` SPEC-002 · Gestão de Influenciadoras
- **Deps SPEC:** SPEC-001
- **Requisitos (PRD):** §6.1, §7 (RN-01…RN-03), §9 (RF-002, RF-004, RF-005)
- 🟠 **Aberto:** P4 / Q-05 (inativação com pendências abertas) — afeta a partir da Fase 2
- **Achado da FASE 2 (QA pós-SPECs, 2026-07-16):** `Parceira.ativar()`/`.inativar()` (`src/domain/Parceira.js`) e os códigos de erro `GP-01/02/03` (§17) estão documentados na SPEC mas **sem nenhuma implementação de aplicação** — não há Service, Controller, Entrypoint nem `ParceiraRepository`/`ParceiraACL.atualizar*` que os exponha ou persista uma transição de estado/edição de Condição Comercial. `ParceiraACL` só tem `inserir` (append) — nenhuma escrita em linha existente para SPEC-002 (a única escrita em linha existente é `atualizarPerfil`, SPEC-032, um recorte de campos diferente). Consistente com o padrão legado (V1): a equipe edita `STATUS`/`VALOR_TOTAL`/quantidades diretamente na planilha `BASE DE DADOS`; o V2 só LÊ esses campos (`listarAtivasComCondicoes`, SPEC-005). Se esse fluxo administrativo deve virar código (Service/Controller/UI) é decisão do responsável do projeto — não implementado aqui.

---

### EPIC 02 — Colaboração Mensal

#### `[x]` SPEC-005 · Colaboração Mensal
- **Deps SPEC:** SPEC-002
- **Requisitos (PRD):** §5.2, §6.2, §7 (RN-04, RN-05, RN-06), §8 ("Ciclo Mensal" ≡ Colaboração Mensal)
- **Restrições:** `CONTRATO_SOBERANO` §5, §6, §8 · `ADR-001` §2, §3 (MesReferencia `AAAA-MM`) · `ADR — Linguagem Ubíqua` §4
- **Material já redigido:** `~/Downloads/SPEC-005-REVISAO.md` (Parte 3 = v2.0), já extraído para `docs/specs/SPEC-005-colaboracao-mensal.md`
- 🟠 **Aberto:** P8 / Q-06 (ano ausente em MesReferencia) · P4 / Q-05 (inativação)
- ✅ **Resolvido:** MesReferencia alinhado a `AAAA-MM` (ADR-001 §3) na SPEC-005 v2.0.

---

### EPIC 03 — Briefing

#### `[x]` SPEC-009 · Briefing de Campanha
- **Deps SPEC:** SPEC-005
- **Requisitos (PRD):** §5.3, §6.3, §7 (RN-04, RN-06), §9 (RF-008, RF-009, RF-010)
- **Restrições:** `ADR-001` §2 (cálculo da data de aprovação = RN-04)

---

### EPIC 04 — Conteúdo e Ativações

#### `[x]` SPEC-012 · Gestão de Conteúdo e Ativações
- **Deps SPEC:** SPEC-005, SPEC-009 (achado da FASE 1: `EntregaService` recebe `BriefingRepository` no construtor — `src/entrypoint/Portal.js` `montarEntregaService` —, dependência real não declarada antes)
- **Requisitos (PRD):** §5.4, §6.4, §7 (RN-06, RN-07, RN-08), §9 (RF-011…RF-015)
- **Restrições:** `ADR-001` §2.2 (estados de conteúdo)
- ✅ **Resolvido (PO 2026-07-15, propagado aqui em 2026-07-16):** Q-03 —
  rótulos crus persistidos são `AGUARDANDO_MATERIAL|EM_REVISAO|APROVADO|
  PUBLICADO` (`EntregaACL.js`, cabeçalho). A decisão já existia só em
  comentário de código (achado F7 de `docs/_workspace/auditorias/
  AUDITORIA_SPEC012.md`) — este roteador e a SPEC-012 §21 ainda listavam
  como aberto; corrigido.

---

### EPIC 05 — Logística

#### `[x]` SPEC-016 · Gestão Logística
- **Deps SPEC:** SPEC-005, SPEC-001/002 (achado da FASE 1: `EnvioService` recebe `ParceiraACL` como porta do Cadastro, D-03 — `src/entrypoint/Portal.js` `montarEnvioService` —, dependência real não declarada antes)
- **Requisitos (PRD):** §5.5, §6.5, §7 (RN-13, RN-14), §9 (RF-016…RF-019)
- **Restrições:** `ADR-001` §2.4 (`STATUS REVISÃO` e `STATUS LOGISTICA` — máquinas independentes)

---

### EPIC 06 — Financeiro

#### `[x]` SPEC-020 · Gestão de Pagamentos
- **Deps SPEC:** SPEC-002
- **Requisitos (PRD):** §5.6, §6.6, §7 (RN-09, RN-10, RN-11, RN-12), §9 (RF-020…RF-023)
- **Restrições:** `ADR-001` §2.3 (estados de pagamento)
- ✅ **Implementada (2026-07-17):** slice completo (`ObrigacaoFinanceira`
  EmAberto→Aprovado→Pago → `PagamentoACL`/`PagamentoRepository` (aba física
  nova `PAGAMENTOS`) → `PagamentoService` → `PagamentoController` → Portal
  `lancarPagamentoAvulso`/`liberarPagamento`/`confirmarPagamento`/
  `listarPagamentos`). Lançamento mensal reage a `MesCompilado`
  (materialização idempotente por competência, mesmo padrão F1/F2 de
  Entrega/Envio) — cablado em `montarCompilarMes`/`compilarMes`
  (reconciliação). PIX nunca persistido no Pagamento — lido ao vivo na
  porta do Cadastro só para compor a mensagem de cobrança (RNF-01). 20
  testes novos; suíte completa 447/447 verde; lint limpo.
- ✅ **Resolvido (PO, 2026-07-17, Q-04 opção B):** elegibilidade de
  `PagamentoLiberado` — Obrigação `Mensal` exige todas as Entregas da
  competência em `Aprovado`/`Publicado` (SPEC-012 §9); publicação não é
  requisito. Obrigação `Avulso` não passa pelo gate (liberação manual).
  Detalhe em `SPEC-020-gestao-de-pagamentos.md` §9/§21.
- ✅ **Resolvida (2026-07-17):** autorização por papel (§13, PG-04) — ver §11
  (RBAC aplicado às rotas administrativas).

---

### EPIC 07 — Documentos

#### `[x]` SPEC-023 · Geração de Documentos
- **Deps SPEC:** SPEC-002, SPEC-009
- **Requisitos (PRD):** §5.7, §6.7, §7 (RN-15), §9 (RF-024, RF-025)
- **Restrições:** `CONTRATO_SOBERANO` §6.1 · `ADR — Linguagem Ubíqua` §4 (Snapshot Comercial da Colaboração)
- ✅ **Implementada (2026-07-16):** slice completo (`Documento`/`CamposDeMesclagem` → `ParceiraACL.obterParaDocumentos`/`DocumentoACL` → `DocumentoRepository` → `DocumentoService` → `DocumentoController` → Portal). Aba física nova `DOCUMENTOS` persiste só referência opaca (sem PII). Sinalização = coluna `SIM/NÃO` da `BASE DE DADOS` (PRD §5.7).
- **Dívidas registradas na implementação:** motor documental real por ADR futuro (D-01 — adaptador interino de texto); rótulos crus da aba `DOCUMENTOS` sem ADR (mesma pendência SPEC-016); geração em lote (RF-024 "[job]") não implementada — comando individual por Parceira; sem UI de Portal (SPEC não define; §12 "leitura futura").
- ✅ **Resolvida (2026-07-17):** autorização por papel (§13) — ver §11 (RBAC aplicado às rotas administrativas).

---

### EPIC 08 — Portal da Influenciadora

#### `[x]` SPEC-025 · Acesso ao Portal
- **Deps SPEC:** SPEC-001
- **Requisitos (PRD):** §6.8, §7 (RN-16, RN-17, RN-18), §9 (RF-026, RF-027), §10 (segurança)
- ✅ **Implementada (2026-07-16):** slice completo (`Credencial`/`TokenDeSessao`/`JanelaDeBloqueio`/`Sessao`/`Autenticador` → `ParceiraACL.obterAcessoLegado`/`SessaoACL`/`BloqueioACL` → `SessaoRepository`/`BloqueioRepository` → `AcessoPortalService` → `AcessoController` → Portal `entrarNoPortal`/`renovarSessaoDoPortal`/`sairDoPortal`). Abas físicas novas `SESSOES` e `BLOQUEIOS`. Bloqueio 5 falhas → 15 min (RN-02); sessão 6h deslizante (RN-03); erros AC-01/02/03 (§17); credencial/PII fora de log (RN-04); operações de acesso serializadas por trava global (LockService, só no Entrypoint) — primeira superfície multiusuária do sistema.
- **Dívidas registradas na implementação:** verificação de credencial atrás da porta do Autenticador via **adaptador legado provisório** (`VerificadorDeCredencialLegado`, RN-16: cupom + 5 primeiros dígitos do CNPJ, por decisão do PO em 2026-07-16) — trocar o modelo (Q-07) = trocar só o adaptador; acesso não filtra estado do vínculo (Ativa/Inativa) — regra não consta da SPEC.
- **UI (FASE 3 pós-SPECs, 2026-07-16; reescrita 2026-07-17 Sprint Portal MVP Online):** `src/ui/login.html` — scaffolding temporário e funcional, sem identidade visual (decisão explícita do responsável do projeto: priorizar funcionamento para homologação; substituição futura pelo Design System oficial do Estúdio Elã não deve alterar a lógica de sessão/navegação). Navegação entre páginas via `window.top.location.href` (iframe sandboxed do HtmlService); token em `sessionStorage`. **Reescrita em 2026-07-17:** o formulário cupom/senha (modelo legado desta SPEC) foi substituído por Google Identity Services, cobrindo o fluxo federado de SPEC-035 (login/vinculação/onboarding) — ver nota em SPEC-035 abaixo. `entrarNoPortal` (backend legado, cupom+CNPJ) permanece implementado e testado, só deixou de ter UI própria.
- 🟠 **Aberto:** ~~P5 / Q-07 (modelo de autenticação definitivo)~~ resolvido por SPEC-035 (2026-07-17): federação Google Identity via novo adaptador, reaproveitando `Sessao`/`TokenDeSessao`/`SessaoRepository`/`AcessoController` desta SPEC sem alteração — ver SPEC-035 §9.2-A · ~~P6 / Q-08 (papéis)~~ resolvido por SPEC-035 para `Administrador`/`Influenciadora` (papel `Marca` permanece aberto, é decisão de escopo de produto, não de arquitetura) · Q-09 (LGPD) segue aberta — tratada como débito herdado por SPEC-027/030/032/035, não bloqueante por precedente já estabelecido, ainda sem solução formal antes de o Portal expor dados

#### `[x]` SPEC-027 · Conteúdo no Portal
- **Deps SPEC:** SPEC-009, SPEC-012, SPEC-025
- **Requisitos (PRD):** §5.4, §6.8, §9 (RF-011, RF-012, RF-013)
- ✅ **Implementada (2026-07-16):** fachada sem agregado próprio (§6.2/§6.4) — `ItemDePendencia` (VO de projeção) → `PortalDeConteudoService` (delega a `AcessoPortalService`/`EntregaService`/`BriefingService`, sem ACL/Repository novos — não há aba física nova) → `PortalDeConteudoController` → Portal (`verPendencias`/`lerBriefingDoItem`/`enviarMaterialDoPortal`). `parceiraId` deriva sempre da Sessão (token), nunca do comando externo (RN-01/INV-01). `listarPendencias` exclui Entregas `Publicado` (histórico é escopo de SPEC-030, §2). Bloco de Briefing só é exposto quando preenchido (`estaPreenchido()`, RN-03) — achado da revisão arquitetural, corrigido antes do commit. Erros PC-01 (sessão)/PC-02 (Entrega alheia ou briefing não preenchido) com `codigo`, mesmo padrão do AcessoController. 27 testes novos; suíte completa 378/378 verde; lint limpo.
- **Dívidas registradas na implementação:** nenhuma nova — herda as dívidas já registradas de SPEC-025 (Q-07/Q-08/Q-09) e SPEC-012 (D-02 material como URL).
- **UI (FASE 3 pós-SPECs, 2026-07-16):** `src/ui/pendencias.html` — scaffolding temporário (ver nota de SPEC-025).

#### `[x]` SPEC-030 · Financeiro e Histórico no Portal
- **Deps SPEC:** SPEC-012, SPEC-020, SPEC-025
- **Requisitos (PRD):** §6.6, §6.8, §6.9, §7 (RN-10), §9 (RF-023, RF-028, RF-030)
- ✅ **Implementada (2026-07-17):** fachada sem agregado próprio, mesma
  natureza de SPEC-027/032 (`ResumoFinanceiro`/`ItemDeHistorico`, VOs de
  projeção, §6.1) → `PortalFinanceiroService` (reaproveita
  `AcessoPortalService`, `EntregaService` e `PagamentoService` — nenhuma
  ACL/Repository/aba física nova) → `PortalFinanceiroController` → Portal
  (`listarPeriodosDoPortal`/`verFinanceiroDoPortal`/`verHistoricoDoPortal`).
  RN-02/CB-02: previsto = Obrigações `EmAberto`/`Aprovado`; pago = só
  `Pago`. RN-04/CB-01: período selecionável = competências com QUALQUER
  atividade da Parceira (Entrega ou Obrigação com competência; Avulso sem
  competência nunca aparece), via novo `listarPorParceira(parceiraId)` em
  `EntregaRepository`/`PagamentoRepository` (extensão aditiva, reaproveita
  `acl.listarTodos()`) e wrappers finos equivalentes em
  `EntregaService`/`PagamentoService` (mantém `PortalFinanceiroService`
  dependente só de Services, nunca de Repository de outro módulo). Erros
  PF-01 (sessão)/PF-02 (período sem atividade) com `codigo`, mesmo padrão
  dos pares. 35 testes novos (domínio/repository/service/controller/
  entrypoint, incluindo isolamento RN-05/Q-09 entre duas Parceiras reais);
  suíte completa 496/496 verde; lint limpo.
- **Dívidas registradas na implementação:** nenhuma nova — herda D-01 (§21
  da própria SPEC: isolamento depende do modelo de auth definitivo, 🟠
  Q-07) e as dívidas já registradas de SPEC-025 (Q-07/Q-08/Q-09).
- **UI (2026-07-17, Sprint Portal MVP Online):** `src/ui/financeiro.html`
  — scaffolding no mesmo padrão das demais telas do Portal (sem identidade
  visual). Seletor de competência, resumo previsto×pago e tabela de
  histórico, consumindo `listarPeriodosDoPortal`/`verFinanceiroDoPortal`/
  `verHistoricoDoPortal` sem alteração de contrato.

#### `[x]` SPEC-032 · Perfil no Portal
- **Deps SPEC:** SPEC-001, SPEC-002, SPEC-025
- **Requisitos (PRD):** §6.8, §7 (RN-02), §9 (RF-029)
- ✅ **Implementada (2026-07-16):** fachada sem agregado próprio, mesma natureza da SPEC-027 — VOs `PIX`/`Endereco` (§6.1) → `ParceiraACL.obterPerfil`/`atualizarPerfil` (portas novas: leitura/escrita célula-a-célula de uma linha EXISTENTE em `BASE DE DADOS`, deliberadamente sem reescrever a aba inteira — 961 linhas com colunas não modeladas por este domínio) → `PerfilPortalService` (reaproveita `AcessoPortalService`) → `PerfilPortalController` → Portal (`verPerfilDoPortal`/`editarPerfilDoPortal`). `AdaptadorDeCepBrasilApi` cumpre a porta de CEP (RN-01); falha é degradável (RN-02/CB-01), nunca lançada (PP-03 vira sinal implícito via `endereco.completo`). `enderecoCompleto` é recomputado e também grava `INFLUENCIADORA_ENDERECO` para manter SPEC-016/023 consistentes. 40 testes novos; suíte completa 418/418 verde; lint limpo.
- **Achados da revisão arquitetural (corrigidos antes do commit):** (1) `String(x).trim()` sem guarda de `null` transformava `null` explícito na string literal `"null"`, corrompendo e-mail/PIX/CEP — corrigido com o mesmo padrão `== null ? '' : x` já usado nas VOs. (2) `editarPerfil` renovava a Sessão duas vezes por chamada (uma direta, outra via `verPerfil` no retorno) — corrigido para reaproveitar a Sessão já resolvida. (3) o adaptador de CEP era chamado a cada edição de endereço mesmo quando o CEP não mudava — corrigido para só chamar quando `cepMudou`.
- **Dívida registrada:** `comTravaDeAcesso` (trava global do Portal) agora pode segurar uma chamada HTTP síncrona ao BrasilAPI quando o CEP muda (única operação sob a trava hoje que sai da planilha para a rede; GAS não permite configurar timeout em `UrlFetchApp`) — se o serviço externo degradar, chamadas de login/logout/conteúdo de OUTRAS Parceiras na fila do lock podem falhar por timeout. Mitigado (chamada só quando o CEP muda), não eliminado. Resolver de vez exige mover a resolução de CEP para fora da trava ou trocar o lock global por lock por-Parceira — candidato a ADR futuro, tratado na FASE 4 (dívidas técnicas) do plano pós-SPECs.
- **UI (FASE 3 pós-SPECs, 2026-07-16):** `src/ui/perfil.html` — scaffolding temporário (ver nota de SPEC-025).

#### `[x]` SPEC-035 · Identidade e Acesso (M-ID)
- **Deps SPEC:** SPEC-001, SPEC-002, SPEC-025
- **Requisitos:** `docs/specs/SPEC-035-identidade-e-acesso.md` (documento próprio — origem: revisão arquitetural + resolução de pendências em 2026-07-17; movido de `.gemini/spec-035-identidade/` em 2026-07-18, auditoria de apoio, para eliminar duplicata que já havia divergido do TASK_ROUTER)
- ✅ **Implementada (2026-07-17):** substitui o modelo de credencial legado (RN-16, cupom+CNPJ) por federação Google Identity para os papéis `Administrador` e `Influenciadora`. Resolve Q-07 e Q-08 (parcial) de SPEC-025 — ver nota na entrada de SPEC-025 acima e SPEC-035 §9.2-A. Reaproveita integralmente `Sessao`/`TokenDeSessao`/`SessaoRepository`/`SessaoACL`/`AcessoPortalService`/`AcessoController.renovar()`/`.sair()` (SPEC-025) — nenhuma stack de sessão paralela; verificado ponta a ponta (sessão emitida via Google renovada/encerrada pelo `AcessoController` já existente, mesma aba `SESSOES`). Novo: `Usuario` (domínio — máquina de estados PENDING/ACTIVE/INACTIVE/REJECTED, RN-04/RN-07 bootstrap do primeiro Administrador), `ValidadorDeTokenGoogle` (adaptador — valida `aud`/`iss`/`exp`/`iat` via endpoint `tokeninfo`, sem reaproveitar `Autenticador`/`JanelaDeBloqueio`: bloqueio por tentativas não se aplica a token assinado criptograficamente, §9.2-A), `UsuarioACL`/`AdministradorACL`/`UsuarioRepository` (`SIS_IDENTIDADES`, `BASE_ADMINISTRADORES`), extensão de `ParceiraACL` (`buscarCandidataPorEmail`/`vincularSubProvider`/`obterPorSubProvider`, §5.1-A/§10.2.4 — `INFLU_KEY` preservada como chave soberana, `SUB_PROVIDER` é atributo dependente), `UsuarioService` (login/onboarding/vinculação/moderação/RBAC/suspensão-reativação) → `UsuarioController` → Portal (`entrarComGoogle`/`confirmarVinculacaoDeIdentidade`/`completarCadastroDeUsuario`/`listarUsuariosPendentes`/`aprovarUsuario`/`rejeitarUsuario`/`inativarUsuario`/`reativarUsuario`). 79 testes novos (domínio/adaptador/ACL/repository/service/controller/entrypoint, incluindo jornada completa candidata→vinculação→bloqueio PENDING→aprovação→login ACTIVE); suíte completa 599/599 verde; lint limpo.
- **Escopo desta unidade de trabalho:** papéis `Administrador` e `Influenciadora` apenas. O ator `Marca` (tenant externo, `BASE_MARCAS`) está definido na SPEC mas **não implementado** — não é inferível do PRD vigente (que descreve operação para uma única marca), é decisão de escopo de produto que só o responsável do projeto pode tomar (SPEC-035, nota de revisão 2). `completarCadastroDeUsuario` recusa explicitamente `papel: 'MARCA'` (`ERR_AUTH_PAPEL_NAO_DISPONIVEL`).
- **Dívidas registradas:** Q-09 (LGPD) segue aberta, herdada de SPEC-025/027/030/032 — não bloqueia esta implementação, mesmo precedente já aplicado às SPECs anteriores.
- ✅ **Resolvida (2026-07-17, ver §11):** `exigirPapel`/RBAC agora protege as
  rotas administrativas de SPEC-012/016/020/023/034 (nenhum Controller do
  sistema checava papel antes desta SPEC). Gap remanescente
  `importarBaseLegada` (SPEC-003 §13) fechado em 2026-07-18 (auditoria de
  apoio) pelo mesmo mecanismo — ver entrada de SPEC-003.
- **UI (2026-07-17, Sprint Portal MVP Online):** `src/ui/login.html`
  (SPEC-025) reescrito para o modelo federado — botão Google Identity
  Services, tratamento de `AUTENTICADO`/`CANDIDATA_VINCULACAO`/
  `ONBOARDING_REQUERIDO` e dos erros `ERR_AUTH_*` (§13.1-13.3 desta SPEC).
  Roteamento pós-login por papel (`portal-dashboard` para Influenciadora,
  `admin` para Administrador) exigiu expor `papel` na resposta
  `AUTENTICADO` de `UsuarioService.entrar`/`UsuarioController.
  projetarResultadoDeEntrada` — gap de contrato encontrado nesta unidade de
  trabalho (a resposta só carregava token/parceiraId/expiraEm; o frontend
  não tinha como decidir a rota), corrigido de forma aditiva (campo novo,
  sem quebrar consumidores existentes), testes atualizados. Novo
  `src/ui/admin.html` — painel de moderação (§13.4: lista PENDING, aprova/
  rejeita) mais atalhos para as telas operacionais já existentes
  (compilar-mes/briefing/entrega/envio). Novo `src/ui/dashboard.html` —
  home da Influenciadora, hub para Pendências/Perfil/Financeiro.
- ✅ **Correção de arquitetura (2026-07-18, ADR-013):** o fluxo GIS adotado
  na UI (nota "UI (2026-07-17…)" acima) falhou em homologação — origem
  `*.script.googleusercontent.com` do HtmlService não é registrável como
  Authorized JavaScript origin (causa raiz validada na documentação do
  Google). Login substituído por OAuth 2.0 Authorization Code Flow
  server-side (redirect para /exec): novos adapters `AdaptadorOAuthGoogle`
  (troca de código, Client Secret — 4ª Script Property
  `GOOGLE_CLIENT_SECRET`) e `GuardiaoDeEstadoOAuth` (state anti-CSRF em
  CacheService, consumo único), novos `UsuarioService.iniciarLogin`/
  `entrarComCodigo` + rotas `iniciarLoginComGoogle`/`entrarComCodigoOAuth`;
  `entrarComGoogle`/`obterConfiguracaoDeLogin` removidas;
  `UsuarioService.entrar({idToken})` e toda a stack de sessão/RBAC
  inalteradas. Arquitetura experimental "frontend separado + doPost"
  descartada (condição 6 da revisão). Detalhe: ADR-013 e
  `docs/_workspace/spec035_identidade/PLANO_ADR-013_OAUTH_CODE_FLOW.md`.
- **Deploy e provisionamento de produção (2026-07-18, sessão de
  homologação):** versão 13 ("ADR-013 OAuth code flow") criada via `clasp
  push`/`create-version` e publicada no deployment de produção (rotulado
  "V 5.0"); conferido por `clasp pull --versionNumber 13` + diff que o
  conteúdo remoto é idêntico ao repositório. As 4 Script Properties foram
  provisionadas pelo operador nesta sessão, com DOIS erros de
  provisionamento encontrados e corrigidos por diagnóstico guiado:
  (1) o Client Secret havia sido colado na property `GOOGLE_CLIENT_ID`
  (formato `GOCSPX-…`), causando `401 invalid_client`; (2) em seguida o
  `GOOGLE_CLIENT_ID` foi preenchido com um valor de EXEMPLO
  (`123456789012-abc123…`), não com o ID real — evidência extraída por rota
  de diagnóstico temporária (`?pagina=diag-adr013`, já removida do código e
  do HEAD remoto) que gravou o `client_id` efetivamente enviado na aba
  `DIAG_ADR013` da planilha PROD (aba temporária — **remover
  manualmente**). Valor correto = campo "ID do cliente" da credencial OAuth
  "Portal TEAR" (projeto GCP "projeto tear" do operador; o projeto Apps
  Script permanece em "GCP: Padrão" — a associação GCP do script é
  irrelevante para o fluxo, que só usa as properties). Redirect URIs
  `/exec` (produção) e `/dev` registradas na credencial. Os IDs das
  planilhas PROD/legado não são versionados (governança §3.5/§3.6) —
  localizados via Drive ("[PROD] TEAR - Base Operacional", estrutura
  validada contra o checklist §1; legado "[ELÃ] TEAR" = ID do ADR-010).
  **Estado ao fim da sessão:** último erro observado foi `400
  redirect_uri_mismatch`, ANTES do registro das URIs na credencial;
  reteste do login pós-registro ainda pendente. Próximos passos: (1)
  validar login ponta a ponta no `/exec`; (2) onboarding/bootstrap do
  primeiro Administrador (SPEC-035); (3) carga da base legada
  (`importarBaseLegada`); (4) remover a aba `DIAG_ADR013` da planilha PROD.
- **Continuidade (2026-07-18, sessão sem acesso a navegador):** revisão de
  código ponta a ponta do fluxo ADR-013 (`AdaptadorOAuthGoogle`,
  `GuardiaoDeEstadoOAuth`, `UsuarioService.iniciarLogin`/`entrarComCodigo`,
  `UsuarioController`, `montarUsuarioService`/`iniciarLoginComGoogle`/
  `entrarComCodigoOAuth` em `Portal.js`, `login.html`) — **nenhum bug
  encontrado**; `npm run check` 624/624 verde. `curl` direto ao `/exec` de
  produção confirma o deployment ativo e respondendo (Google intercepta
  antes do Portal com sua própria tela de login, esperado para
  `access: ANYONE`) — não é possível ir além disso sem uma sessão de
  navegador autenticada com uma conta Google real (indisponível nesta
  sessão). Planilha "[PROD] TEAR - Base Operacional" lida via Drive
  (2026-07-18): `SESSOES`/`SIS_IDENTIDADES`/`BASE_ADMINISTRADORES` ainda
  **sem nenhuma linha de dado** — confirma que o login ainda não foi
  concluído com sucesso nenhuma vez em produção; `DIAG_ADR013` ainda
  presente (não contém o secret, só metadados do diagnóstico — ver
  conteúdo na sessão anterior desta mesma entrada), item (4) acima segue
  pendente, sem ferramenta disponível nesta sessão para apagar uma aba
  específica de uma planilha existente (só arquivos inteiros via Drive).
  `docs/_workspace/DEPLOY_CHECKLIST.md` ganhou uma tabela "Erros
  conhecidos do login OAuth" (redirect_uri_mismatch/invalid_client, já
  observados; hipótese de reautorização de escopo `script.external_request`
  se `UrlFetchApp` algum dia falhar por permissão — não confirmada, só
  registrada preventivamente). `ROTEIRO_HOMOLOGACAO.md` corrigido (§0/§4/
  Resumo estavam desatualizados: `access: MYSELF` → `ANYONE`; SPEC-020/030/
  034 listadas como inexistentes → `[x]` implementadas; contagem de telas
  8 → 13). **Ação real de próxima sessão continua sendo a mesma:** um
  humano (ou uma sessão com navegador conectado) precisa abrir o `/exec`
  logado com uma conta Google e clicar "Entrar com Google" para validar
  o login ponta a ponta — nenhum agente sem navegador consegue completar
  esse passo específico.
- **Continuidade (2026-07-18, sessão sem acesso a navegador — 2ª tentativa,
  foco exclusivo em destravar o login):** achado novo e corrigido:
  `src/ui/login.html` nunca lia `error=` da URL de retorno do Google (só
  `code`) — se o usuário cancelasse o consentimento (`access_denied`) ou o
  Google devolvesse qualquer outro erro no redirect, a tela ficava muda,
  sem mensagem nenhuma. Corrigido (mostra aviso e volta ao botão de login);
  suíte 625/625 verde; lint limpo. **Publicado em produção:** versão 18
  ("V 5.4 — trata error= no callback OAuth"), mesmo deploymentId de sempre
  (`clasp deploy -i <id> -V 18`, não cria URL nova — redirect URIs já
  registradas continuam válidas).
  Tentativa de diagnóstico headless da hipótese `script.external_request`
  via Apps Script Execution API (`clasp run`, manifest `executionApi`
  temporário, removido depois): **bloqueada por um pré-requisito de conta
  diferente** — `clasp run` falha com "Script function not found. Please
  make sure script is deployed as API executable" mesmo com deployment
  válido, o que é o sintoma padrão de a "Google Apps Script API" estar
  desligada em `script.google.com/home/usersettings` para a conta usada
  pelo `clasp login`. Ou seja: mesmo a via alternativa (sem navegador, via
  API) para checar Script Properties/`UrlFetchApp` exige antes um toggle
  manual nessa página, também só acionável logado no navegador. A hipótese
  de reautorização de escopo segue **não confirmada nem descartada**
  (pesquisa de documentação oficial do Google confirma que, SE for o caso,
  não existe caminho por CLI/API — só clique manual). Auditoria de código
  independente (2ª leitura completa do fluxo) não achou nenhum outro bug;
  achado de maior probabilidade prática continua sendo erro humano de
  digitação em `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` (já ocorreu 2x
  nesta mesma implantação, tabela de erros conhecidos em
  `DEPLOY_CHECKLIST.md`), não a hipótese de permissão.
  **Ação humana necessária (bloqueio real, ver relatório da sessão):**
  (1) na conta que fez o deploy, abrir
  `https://script.google.com/home/usersettings` e confirmar que "Google
  Apps Script API" está ligada — desbloqueia diagnóstico futuro via
  `clasp run` sem depender de navegador a cada vez; (2) abrir a URL do
  deployment de produção (`clasp deployments`, ID `AKfycbwUhR1P7…`, `/exec`)
  logado como essa mesma conta e clicar "Entrar com Google" — se aparecer
  tela de consentimento pedindo escopos novos, aceitar (resolve a hipótese
  de permissão, se for o caso); se aparecer qualquer outro erro, ele
  finalmente será o primeiro erro real observado nesta versão do código e
  pode ser corrigido dirigido pela mensagem exibida (agora sempre visível,
  com a correção desta sessão).
- **Go-live operacional (2026-07-19, sessão de entrega):** produção estava
  na **versão 23** ("V 5.9 — OAuth encerrado, produção limpa") — sessões de
  2026-07-18 posteriores ao registro anterior validaram o login OAuth em
  produção (rótulo da v21) e removeram a sonda de autorização (v22/v23);
  diff pull-v23 × repo confirmou **produção = HEAD, sem drift**. Nesta
  sessão, executadas as 3 pendências operacionais SEM navegador logado, via
  **deployment temporário separado** (rota de bootstrap protegida por
  segredo, executada como USER_DEPLOYING; produção permaneceu pinada na
  v23): (1) **RN-07 concluído** — primeiro Administrador (sub `1073…2915`)
  `PENDING→ACTIVE` em `SIS_IDENTIDADES`; (2) **aba `DIAG_ADR013` removida**
  da planilha PROD; (3) **Importação Inicial da Base executada**
  (`importarBaseLegada`, SPEC-003): `totalImportado: 7` — as 7 Parceiras da
  base legada agora populam `BASE DE DADOS` (verificado por leitura da
  planilha). Limpeza verificada ao fim: deployment temporário excluído
  (`clasp undeploy`), código temporário revertido, `clasp push` do HEAD
  limpo, restam só os 2 deployments de sempre (@HEAD e produção @23);
  suíte 626/626 verde. A versão 24 ("TEMP — bootstrap RN-07") existe no
  histórico de versões mas não tem deployment que a sirva. **Pendência
  restante:** smoke test visual das jornadas em produção (login admin →
  dashboard → telas operacionais), dependente de sessão de navegador
  logada pelo operador.
- **Incidente de drift de produção (2026-07-18, sessão Tech Lead):** a
  auditoria de sincronia remoto×local (pull da versão publicada + diff
  contra o repo) revelou que produção estava servindo a **versão 15** —
  criada SEM descrição (provavelmente via editor web, fora desta esteira)
  a partir de um snapshot anterior às correções de 2026-07-18: ainda
  continha a rota de diagnóstico `diag-adr013` (que deveria ter sido
  removida), NÃO continha a guarda RBAC de `importarBaseLegada` (IM-03)
  nem a ordenação F6. Corrigido na mesma sessão: `clasp push` do HEAD →
  versão 16 ("V 5.3") → `clasp update-deployment` no MESMO deployment
  (URL `/exec` e redirect URIs preservadas) → `clasp pull
  --versionNumber 16` + diff confirmou conteúdo idêntico ao repo.
  **Regra operacional derivada:** nunca criar versão/implantação pelo
  editor web; toda publicação sai do repositório via `clasp push` +
  `create-version` + `update-deployment`, e toda sessão de deploy termina
  com o diff de verificação (pull da versão publicada × repo).
  **Reconciliação com a sessão paralela:** enquanto esta sessão publicava
  a v16, a sessão de destravamento do login publicou a **versão 18**
  ("V 5.4", `error=` no callback — nota acima) no mesmo deployment; a
  guarda de `enviarMaterial` (ver §11) foi então publicada **sobre a
  v18** como **versão 19** ("V 5.5"), pelo mesmo procedimento
  (`clasp push` + `create-version` + `update-deployment` no mesmo
  deploymentId) e verificada com o mesmo diff (pull da v19 × repo:
  idênticos). **Produção ao fim de 2026-07-18: versão 19 = HEAD do
  repositório.**
- **Login OAuth validado até o callback; causa raiz do último bloqueio
  corrigida (2026-07-18, sessão Tech Lead, continuação):** o operador
  confirmou o fluxo funcionando até o retorno do Google — o erro passou a
  ser "Você não tem permissão para chamar UrlFetchApp.fetch" na troca do
  código (`AdaptadorOAuthGoogle.js:62`), o que PROVA que client_id/
  redirect URIs/state estão corretos. Causa raiz (auditada, sem hipótese):
  o manifesto **nunca declarou `oauthScopes`** e a autorização da conta
  USER_DEPLOYING era anterior ao ADR-013 (era M1, só planilha);
  documentação oficial confirma que Web App como USER_DEPLOYING *"may not
  request authorization"* — falha em vez de re-pedir consentimento.
  Correção: `oauthScopes` explícitos no `appsscript.json`
  (`spreadsheets` + `script.external_request` — conjunto completo
  verificado por grep de todos os serviços GAS usados e pela referência
  oficial de cada um; `ScriptApp.getService().getUrl()` não exige escopo).
  Publicado como **versão 20** no mesmo deployment, diff verificado.
  **Passo humano final:** a conta que publica precisa consentir os
  escopos UMA vez — abrir o projeto em script.google.com, rodar qualquer
  função no editor e aceitar a tela de autorização (caminho garantido; a
  doc diz que o /exec pode não pedir) — e então repetir o login no
  `/exec`.

---

### EPIC 09 — Arquivamento

#### `[x]` SPEC-034 · Arquivamento Geral Manual
- **Deps SPEC:** SPEC-012, SPEC-016, SPEC-020 — todas `[x]`, sem pendência
  bloqueante
- **Requisitos (PRD):** §5.8, §6.9, §7 (RN-08, RN-11, RN-14), §9 (RF-031, RF-032)
- **Restrições:** `CONTRATO_SOBERANO` §6.4 (imutabilidade), §8 (`CompetenciaArquivada`)
- ✅ **Resolvido (2026-07-17, lacuna de documentação, não decisão de PO):**
  D-01 (elegibilidade para selagem) — a SPEC citava "Contrato §9" mas esse
  parágrafo só trata de `PagamentoLiberado` (já resolvido, SPEC-020 Q-04);
  nada sobre selagem. Regra formalizada em `SPEC-034-arquivamento-geral-manual.md` RN-07/§21, no mesmo
  formato do precedente Q-04: competência selável quando todo item
  existente de Entrega/Envio/Obrigação `Mensal` está terminal; ausência de
  itens de um módulo não bloqueia; `Avulso` fora da checagem.
- ✅ **Implementada (2026-07-17):** achado prévio à implementação — RN-01/02/03
  (gatilho automático de arquivamento por estado terminal, com carimbo
  `DATA_ARQUIVAMENTO`) e RN-06/INV-02/INV-03 (`ColaboracaoMensal.arquivar()`,
  `Object.freeze`) já existiam como efeito colateral de SPEC-012/016/020 —
  só faltava o comando de selagem em si. Implementado: `ArquivamentoService`
  (RN-07 sobre `EntregaService.listarEntregas`/`EnvioService.listarEnvios`/
  `PagamentoService.listarPagamentos` reaproveitados, nunca ACL/Repository
  alheios, mesmo princípio de SPEC-027/030/032) → `ColaboracaoMensalRepository.
  arquivarCompetencia`/`listarTodas` (novos) → `ColaboracaoMensalACL.
  arquivarCompetencia` (escrita física pura, reescreve só as linhas da
  competência) → `ArquivamentoController` → Portal `selarCompetencia`
  (UC-034.02, AR-02 se não compilada ou com pendência) / `arquivarLote`
  (UC-034.01, varre competências não seladas e sela as elegíveis, reporta
  as demais sem interromper — CB-03 no-op se nada elegível). Nenhuma
  entidade de domínio nova (resolve também D-02: a própria linha
  arquivada/congelada é a cópia imutável, sem aba de histórico física
  separada). 12 testes novos (ACL/Repository/Service/Controller/Entrypoint);
  suíte completa 520/520 verde; lint limpo.
- ✅ **Resolvida (2026-07-17):** autorização por papel (§13 — Administrador
  vs. Operador) — ver §11 (RBAC aplicado às rotas administrativas). A
  distinção Operador não existe como papel implementado (precedente "MVP
  operador único", SPEC-025 §13); ambas as colunas mapeiam para o papel
  `ADMINISTRADOR` único, o que preserva o resultado da tabela (nenhum papel
  de equipe além do Administrador pode selar competência).

---

> Nota (2026-07-17): a "Importação Inicial da Base" listada aqui como
> entregável adjacente foi formalizada e implementada como **SPEC-003**
> (ver EPIC 01 acima) — esta seção foi consolidada lá, não duplicar.

---

## 4. Gates (fora da numeração de SPEC)

| Gate | Depende de | Fontes |
|---|---|---|
| **Architecture Freeze** (após SPEC-005) | SPEC-001, 002, 005 | `ADR-001`, `ADR — Linguagem Ubíqua`, `DECISOES_BLOQUEANTES.md` (decisões ✅) |
| **Architecture Freeze Final** | todas as SPECs previstas | Todos os itens acima + status 🟠 pendentes por fase |

---

## 5. Lacunas deste roteador (a preencher pelo PO, se necessário)

- Âncoras de subseção de `03 — Fronteiras`, `04 — Capacidades` e `06 — Modelo
  Conceitual` não foram detalhadas (documentos ainda em `~/Downloads`, não lidos
  por inteiro). Se alguma SPEC precisar de seção específica desses, **parar e
  solicitar a atualização deste roteador**.
- Numeração oficial da ADR de Linguagem Ubíqua (colisão `ADR-002`) a confirmar.

## 6. Dívida de documentação (achado da FASE 1 pós-SPECs, 2026-07-16)

- **`NEXT_AGENT.md`** (raiz do repo, inclusive em `origin/main`) descreve uma
  arquitetura V1 (`mae/`, produção via GitHub Pages/`pages-portal`) e uma V2
  anterior (`tear/`, domínio "Ativação") — nenhuma das duas existe na árvore
  atual (`CONHECIMENTO/docs/src/test`, confirmado em `origin/main`). É
  resíduo de uma reorganização estrutural anterior (commits de 2026-07-04:
  "vendorização"/"limpeza estrutural"; branch `chore/encerramento-fase-1`
  já tentou remover legado mas não cobriu este arquivo). **Não bloqueia** a
  V2 atual: o `.clasp.json` desta branch aponta para um Apps Script próprio
  e separado (2 deployments já rotulados "M1 — Portal Cadastro de
  Parceira" — claramente desta V2), sem relação com a suposta produção V1.
  **Ação tomada (2026-07-16, mandato de resolução autônoma):** marcado
  como obsoleto com nota no topo do próprio arquivo (não apagado — preserva
  histórico, reversível). **Ainda em aberto, decisão do responsável:**
  confirmar se `mae/`/V1 ainda está mesmo viva em produção em outro lugar
  (branch/repo separado) e se há necessidade real de migração de dados de
  lá (relevante para ADR-010: "migração da planilha antiga") — isso não é
  verificável a partir deste repositório.

> **Atualização (2026-07-19, sessão de limpeza de ambiente):** `NEXT_AGENT.md`
> e `CONHECIMENTO/` foram **removidos** do repositório (antes só o primeiro
> estava marcado como obsoleto, sem ser apagado) — preservados no histórico
> Git (commits `aa5546d` e anteriores). A pergunta em aberto acima **segue
> sem resposta**: uma auditoria completa do ambiente de desenvolvimento
> local encontrou evidências de pelo menos dois scriptIds de Apps Script
> distintos ligados a um possível "V1 em produção" — um reverse-engineered
> em `docs/04.5-engenharia-reversa/snapshot-v1/` do repositório
> `estudioela/ela-tear-v1` (scriptId `1jSMRq5wu...`), e outro da própria
> fase `mae/` deste repositório antes do refactor DDD (scriptId
> `1fE8w10O3...`, presente no histórico Git daqui, commits de 2026-07-03 a
> 2026-07-11). Nenhum dos dois foi verificado contra o Google Apps Script
> real (exigiria `clasp deployments -i <scriptId>` autenticado) — a
> verificação foi iniciada e interrompida a pedido do responsável do
> projeto nesta sessão, sem conclusão. **Ainda não verificável a partir
> daqui; pendência para sessão futura, se relevante.**

## 7. Dívidas técnicas (achado da FASE 4 pós-SPECs, 2026-07-16)

Auditoria por camada (Domain/ACL+Repository/Service+Controller+Entrypoint).
Corrigidas (baixo risco, comportamento preservado, suíte 100% verde antes/depois):
- `MesReferencia.igualA`/`comparadoCom` sem guarda `instanceof` (bug real:
  `igualA(null)` lançava `TypeError` cru; comparava incorretamente com
  objetos parecidos) — alinhado ao padrão das VOs irmãs.
- `SessaoACL.regravar`/`BloqueioACL.regravar` unificados com
  `reescreverAba` (`src/shared/ColunaFisica.js`) — corpo idêntico, só
  extração.
- `montarPerfilPortal()` abria `BASE DE DADOS` duas vezes por requisição
  (uma em `montarAcessoService()`, outra explícita) — `montarAcessoService`
  agora aceita a aba já aberta como parâmetro opcional.
- `AdaptadorDeCepBrasilApi` ganhou teste de unidade próprio
  (`test/cep-adapter.test.js`) — antes só era exercitado indiretamente.

Corrigidas (FASE 4.1, decisão explícita do responsável, 2026-07-16, suíte 100% verde antes/depois):
- **Convenção de validação de string obrigatória unificada**: as VOs que
  ainda usavam `if (!x || !String(x).trim())` migraram para
  `String(x == null ? '' : x).trim() === ''` (trata `0`/`false` corretamente
  como "não vazio"). Afetados: `BlocoDeFormato`, `CamposDeMesclagem`,
  `Briefing`, `Documento`, `Parceira`, `ColaboracaoMensal`,
  `IdentificadorDeEntrega`. Mensagens/códigos de erro preservados.
- **`Object.freeze` nos estados terminais de `Entrega`/`Envio`**:
  `Entrega.publicar()` e `Envio.marcarEntregue()` agora chamam
  `Object.freeze(this)` ao entrar no estado terminal (`Publicado`/
  `Entregue`), no mesmo padrão de `ColaboracaoMensal.arquivar()`.
- **`BriefingRepository.listarPor` removido** (`src/repository/BriefingRepository.js`):
  confirmado por grep que nenhum Service/Controller o chama — código morto.
  Teste correspondente ajustado em `test/briefing-repository.test.js`
  (duas asserções incidentais substituídas por `obterPor`; nenhum cenário
  de teste foi removido).
- **`CONTRATO_SOBERANO.md` §4 atualizado**: `Ativacao`/`EnvioLogistico`
  substituídos por `Entrega`/`Envio`, formalizado em
  `docs/adrs/ADR-012-renome-ativacao-fluxo-logistico.md` (o sentido de
  "ativação" referente ao vínculo Ativa/Inativa da Parceira foi preservado
  — é um conceito diferente, não tocado).

**Dívida registrada (saneamento de infraestrutura, 2026-07-19):**
`docs/design/DESIGN_SYSTEM.md` traz tokens desatualizados (paleta `#BC0004`,
cards com radius 16px, sombras discretas) que conflitam com a paleta e as
regras visuais já adotadas em `ADR-002-frontend-foundation.md` (`#CD0005`,
radius 0, "Absolute Flatness", zero box-shadow) e com o export elã/Stitch
em `docs/design/stitch-export/`. Atualizar `DESIGN_SYSTEM.md` para alinhar os
tokens ao ADR-002 antes da implementação frontend.

## 8. Preparação para deploy (FASE 6 pós-SPECs, 2026-07-16)

Ver `docs/_workspace/DEPLOY_CHECKLIST.md` (checklist completo de pré-deploy
e rollback). Achados principais:
- Única Script Property necessária: `SPREADSHEET_ID` (confirmado, sem
  outras chaves em uso).
- 8 abas físicas exigidas pelo código (`BASE DE DADOS`, `COLABORACOES`,
  `BRIEFING`, `ENTREGAS`, `ENVIOS`, `DOCUMENTOS`, `SESSOES`, `BLOQUEIOS`) —
  bate com `ADR-010`; resolução de coluna é exata (case/acento/espaço
  sensíveis, sem trim) — cabeçalho físico precisa bater exatamente.
- ⚠️ **`clasp push` substitui o manifesto remoto por completo** (não é
  incremental) — qualquer arquivo só no projeto remoto (ex. editado manual
  no editor web) fora da allowlist local seria apagado no próximo push.
  Confirmar isso com o operador antes do primeiro push real.
- **Resolvido (2026-07-16):** `ACL.js`/`Repositories.js` (legado da raiz,
  sem nenhuma referência ativa em `src/`, confirmado por grep) removidos do
  repositório e das linhas correspondentes do `.claspignore`.
- ✅ **Resolvido (2026-07-17, Sprint Portal MVP Online):** `access` trocado
  de `MYSELF` para `ANYONE` em `appsscript.json` — o pré-requisito (gate de
  autorização por papel) foi fechado em §11 abaixo. `ANYONE` (não
  `ANYONE_ANONYMOUS`) porque o login é federado via Google (SPEC-035):
  exige conta Google só para abrir a URL. Detalhe em
  `DEPLOY_CHECKLIST.md` §3.

## 9. Homologação (FASE 7 pós-SPECs, 2026-07-16)

Ver `docs/_workspace/ROTEIRO_HOMOLOGACAO.md` (roteiro manual completo: 3
jornadas, 15 passos, casos de borda e códigos de erro esperados). Nenhum
achado novo além dos já registrados nas §6/§7/§8 — a auditoria confirmou por
leitura direta do código que:
- O cadastro (`cadastro-parceira.html`) só tem o campo Nome — CEP/PIX/e-mail
  só existem hoje via Perfil do Portal (SPEC-032) ou edição direta na
  planilha.
- `appsscript.json access` trocado para `ANYONE` (§8, 2026-07-17) —
  homologação por outra pessoa deixa de estar bloqueada pelo acesso; segue
  exigindo login Google (SPEC-035) para passar do ecrã inicial. Achado
  original (bloqueio por `MYSELF`) mantido aqui do ponto de vista do
  homologador, agora resolvido.
- Rastreio automático (SPEC-016 D-02) nunca confirma entrega nesta versão —
  comportamento documentado, não bug.

## 10. Auditoria SPEC-012 (achados F1–F7, 2026-07-16)

Ver `docs/_workspace/auditorias/AUDITORIA_SPEC012.md` (relatório completo:
conformidade de `Entrega`/`EntregaACL`/`EntregaService` × SPEC-012, mais
cobertura de regras de negócio de 6 SPECs entregues). Achados e status:

- **F4 (resolvido, 2026-07-16):** escrita por reescrita total da aba sem
  `LockService` causava lost update silencioso em escrita concorrente
  (ex.: Parceira enviando material pelo Portal enquanto a equipe
  aprova/publica). Corrigido envolvendo as funções administrativas de
  escrita do Entrypoint (`compilarMes`, `preencherBriefing`,
  `enviarMaterial`, `aprovarEntrega`, `publicarEntrega`,
  `confirmarEndereco`, `registrarRastreio`, `atualizarStatus`) com a trava
  global já existente (`comTravaDeAcesso`) — sem refatorar as ACLs, como a
  própria auditoria recomendou.
- **F5 (mitigado, 2026-07-16):** ver §8/§9 acima — `appsscript.json`
  mantido em `MYSELF` porque nenhuma função administrativa verifica papel;
  abrir o acesso hoje exporia essas operações a qualquer chamador anônimo.
- **F7 (resolvido, 2026-07-16):** Q-03, D-02 (nome do evento
  `ConteudoPublicado`) e a dívida de material como URL já tinham decisão do
  PO (2026-07-15) só registrada em comentário de código — propagados para
  `SPEC-012-gestao-de-conteudo-e-ativacoes.md` §9/§21 e `CONTRATO_SOBERANO.md` §8.
- **F1/F2 (resolvidos, 2026-07-17):** `compilarMes` (`src/entrypoint/Portal.js`)
  agora reconcilia no ramo `jaCompilada`: chama `recriarParaCompetencia`/
  `materializarParaCompetencia` dos 3 Services (Briefing/Entrega/Envio)
  fora do evento `MesCompilado`. Cada Service ganhou guarda
  `existeParaCompetencia` (novo método nos 3 Repositories) que faz no-op
  quando a competência já tem alguma linha materializada — a mesma guarda
  resolve F2, porque o ramo destrutivo (`recriarCompetencia`/
  `substituirCompetencia`) nunca roda quando já existem dados.
- **F3 (resolvido, 2026-07-17):** `EntregaService.espelharAprovacoes`
  (`src/service/EntregaService.js`) agora filtra Entregas com
  `estado === 'Publicado'` antes de espelhar, em vez de lançar no meio do
  `.map` — Entregas arquivadas são puladas, o resto do lote é espelhado
  normalmente.
- ✅ **F6 (resolvido, 2026-07-18, auditoria de apoio):** UC-012.01 pedia
  ordem cronológica; `EntregaRepository.listarPor` devolvia ordem física
  da aba. Resolvido exatamente pela recomendação já registrada aqui:
  `PortalDeConteudoService.listarPendencias` (SPEC-027) agora ordena pelo
  join com `bloco.dataEntrega` (novo `ordenarPorDataDeEntrega`, sort
  estável, itens sem bloco preenchido por último) — sem espelhar a data na
  Entrega. Detalhe em `AUDITORIA_SPEC012.md` §F6. Teste novo em
  `test/portal-conteudo-service.test.js`; suíte completa 624/624 verde;
  lint limpo.
- **P1/P2 (resolvidos, 2026-07-17):** testes de caracterização escritos
  antes do commit da correção — `test/portal-compilar-mes.test.js`
  ("reconcilia materializações ausentes quando a competência já estava
  compilada (F1/F2)") e `test/entrega-service.test.js` ("pula Entregas já
  Publicado em vez de lançar, e espelha as demais do lote").

## 11. RBAC aplicado às rotas administrativas (fechamento Q-08, 2026-07-17)

Dívida registrada em SPEC-003/012/016/020/023/034 ("nenhum Controller do
sistema checava papel") e parcialmente resolvida por SPEC-035 (papéis
`ADMINISTRADOR`/`MARCA`/`INFLUENCIADORA` implementados, mas só as rotas do
próprio `UsuarioController` protegidas). Fechada para as 5 SPECs de equipe
(Entrega/Envio/Pagamento/Documento/Arquivamento):

- **Mecanismo:** nova guarda `exigirPapelAdministrador(dados)` em
  `src/entrypoint/Portal.js`, reaproveitando `UsuarioService.exigirPapel`
  (SPEC-035 §8.3) — nenhuma lógica de autorização duplicada. Aplicada na
  camada de Entrypoint (mesmo padrão do achado F4/SPEC-012: envolver a
  função exposta a `google.script.run`, sem alterar Controller/Service),
  exigindo `dados.token` de uma Sessão `ACTIVE` com papel `ADMINISTRADOR`.
- **Papel `Operador`:** as tabelas de §13 dessas SPECs distinguem
  Administrador/Operador, mas esse segundo papel nunca foi implementado —
  precedente já registrado em SPEC-025 §13 ("MVP operador único"),
  formalizado por SPEC-035 como papel único de equipe. As duas colunas
  mapeiam para `ADMINISTRADOR`; o resultado da tabela é preservado (nenhum
  papel além do Administrador acessa as operações restritas).
- **Rotas protegidas (15):** `aprovarEntrega`/`publicarEntrega`/
  `listarEntregas` (SPEC-012); `confirmarEndereco`/`registrarRastreio`/
  `atualizarStatus`/`listarEnvios` (SPEC-016); `lancarPagamentoAvulso`/
  `liberarPagamento`/`confirmarPagamento`/`listarPagamentos` (SPEC-020);
  `gerarContrato`/`gerarBriefingFormal` (SPEC-023); `selarCompetencia`/
  `arquivarLote` (SPEC-034 — `arquivarLote` ganhou o parâmetro `dados` que
  não tinha). Rotas já corretamente restritas por outro mecanismo não
  foram tocadas: `enviarMaterial` (Parceira-only, sem equivalente
  administrativo) e todas as fachadas de Portal (`*DoPortal`, já isoladas
  por `parceiraId` da própria Sessão, RN-01/INV-01 SPEC-027).
- ✅ **Corrigido (2026-07-18, auditoria de apoio):** `importarBaseLegada`
  (SPEC-003 §13, IM-03) também exigia papel Administrador e seguia sem
  guarda — fechado com o mesmo mecanismo (`exigirPapelAdministrador`,
  parâmetro `dados` novo), ver entrada de SPEC-003.
- ✅ **Resolvido (2026-07-18, sessão Tech Lead):** `enviarMaterial` (raw,
  `src/entrypoint/Portal.js`, distinto de `enviarMaterialDoPortal`). A
  premissa do achado original ("sem chamador em UI") estava **errada/
  desatualizada**: `src/ui/entrega.html` (tela interna de operação, Sprint
  Portal MVP Online) chama `enviarMaterial` para a equipe registrar
  material recebido fora do Portal em nome da Parceira — e a tela já
  injeta `dados.token` em toda chamada (`chamar()`). Correção aplicada:
  guarda `exigirPapelAdministrador(dados)`, mesmo mecanismo das demais 16
  rotas administrativas (total agora: 17). Teste RBAC novo em
  `test/portal-entrega.test.js`; CT-01 e o seed de
  `portal-financeiro.test.js` atualizados para autenticar. Suíte
  626/626 verde; lint limpo. **Dívida documental registrada:** a tabela
  §13 de SPEC-012 marca Administrador/Operador ❌ para envio de material,
  mas a operação real (equipe registra material recebido por WhatsApp)
  exige essa rota — a tabela da SPEC precisa ser emendada pelo PO para
  refletir a decisão operacional já embarcada na UI; até lá, a rota fica
  admin-only (estritamente mais restrita que o estado anterior, que era
  aberta a qualquer conta Google sem sessão).
- **Testes:** nenhum teste novo dedicado à guarda (mudança de escopo desta
  unidade, por decisão do responsável do projeto); os 5 smoke tests de
  Entrypoint que exercitam as rotas agora guardadas
  (`test/portal-arquivamento.test.js`, `portal-envio.test.js`,
  `portal-financeiro.test.js`, `portal-documentos.test.js`,
  `portal-entrega.test.js`) foram atualizados para autenticar como
  Administrador via nova fixture `test/helpers/rbacFixture.js` (Sessão +
  `Usuario` ACTIVE seedados direto, sem repetir o fluxo de login Google já
  coberto por `test/portal-usuario.test.js`). Suíte completa 599/599
  verde; lint limpo.

## 12. Consolidação ADR-014 integrada + auditoria de ecossistema externo (2026-07-19)

- **ADR-014 integrado:** uma worktree órfã (`worktree-consolidacao-arquivos-adr014`,
  sessão anterior não finalizada) continha a consolidação completa de `src/`
  descrita em `docs/adrs/ADR-014-consolidacao-de-arquivos-por-modulo.md` — 96
  arquivos `.js` (camadas acl/adapters/controller/domain/repository/service/shared)
  reduzidos a `src/modulos/*.js` (um por domínio) + `src/entrypoint/Portal.js` +
  `src/shared/Nucleo.js`. Mesclada em `feat/adr-013-oauth-code-flow` sem
  conflitos (`git merge-tree` confirmou sobreposição só em `README.md` e
  neste `TASK_ROUTER.md`, ambos resolvidos automaticamente). Suíte completa
  719/719 verde; lint limpo. Worktree e branch órfãs removidas após a
  mesclagem confirmada.
- **Auditoria de complexidade interna** (`src/`, `test/`, `docs/`,
  `knowledge/`, dependências): sem outras ações executadas — achados
  registrados na sessão, não neste documento (não se qualificam como estado
  de SPEC). Achado residual não fechado: `PLANILHA_TEAR_2.0_MAPA.md` (raiz)
  descreve o schema da planilha **legada** `[ELÃ] TEAR`, não o schema real
  de produção pós-ADR-010 (`SESSOES`/`SIS_IDENTIDADES`/`BASE_ADMINISTRADORES`/
  `COLABORACOES`...) — precisa ser corrigido ou arquivado para não induzir
  um agente futuro a erro.
- **Auditoria de ecossistema externo** (GitHub/Apps Script/Drive da conta
  `estudioela`/`elafashionmkt@gmail.com`), autorizada e executada por etapas:
  - `estudioela/ela-tear-v1` e `estudioela/plataforma` **arquivados no
    GitHub** (`isArchived: true`, reversível, histórico/branches
    preservados). Pré-ação cumprida antes do arquivamento de `plataforma`:
    branch `docs/roadmap-next-agent` (continha a decisão de suspensão do
    experimento Postgres/Supabase) mesclada em `main` via fast-forward antes
    de arquivar, para não perder o registro num repo depois read-only.
  - **Pendências que exigem ação manual** (sem ferramenta de escrita/exclusão
    para Google Drive ou Apps Script disponível nesta sessão):
    - Planilha `[ELÃ] PROJETO TEAR 1.0` cópia B
      (`1Z_Y39SBCb1zwkX02iV7r-rjBTzEwLlhNb-OnpHLmftw`) tem dados exclusivos
      (`Parceiros_Influenciadoras`: 12 registros; `Ciclos`: 1 linha) ausentes
      da cópia A (`1MVV9KF0eechiOOgUqdxbUuk00bClylSLa7xGPUDlLOs`) — dados já
      extraídos e preparados para colagem manual (arquivo local, não
      versionado por conter PII). Só depois da colagem a cópia B pode ser
      excluída.
    - Planilhas a arquivar manualmente: `[ELÃ] TEAR` (legada,
      `1BTTQNbpT3qvndE7qnfOU_rBggWZgnIIFTr8qaT97sZY`), `TEAR - FLUXO DE
      PROJETO V2.xlsx` (`1HyeB6SWVw8sNd14rPlm94_ht7huKOMQ6`), `[ELÃ] TEAR -
      CORE` (`1stzgS9TFgedP0nR9Ncla4bX72JCQ8apE2k0RcsbrXl4`) e a cópia A
      acima (legado V1).
    - Apps Script `teste calendario`
      (`1SQnHi_jiaJ8lo3huPPgA0ZHAIPKOPa_h-bbqb2AYdDMc86HPCDtmYyNv`) confirmado
      seguro para exclusão (boilerplate de tutorial do Google, sem
      deployment real, sem vínculo com TEAR) — falta só executar.
  - **Não tocados** (confirmados como corretos): `estudioela/estudioela`,
    `estudioela/jescri-migracao`, Apps Script `TEAR V2 — Portal` (produção) e
    `Portal TEAR - HOMOLOG`, planilhas `[PROD] TEAR - Base Operacional` e
    `[HML] TEAR - Base`.

## 13. ADR-014 publicada de fato no Apps Script oficial (2026-07-19)

- **Divergência encontrada:** o Apps Script oficial
  (`scriptId 12AxJsKHEr9GV3y6t0vIgHsghoUKM1hhTEe9j_0QW3fFRzxHcLAhwrhBZ`) tinha
  o HEAD (conteúdo editável) **byte-a-byte idêntico** ao commit `a5cca07`
  (pai da série de commits da ADR-014) — ou seja, nunca tinha recebido o
  `clasp push` da consolidação, apesar de a versão 27 já existir com o rótulo
  enganoso "ADR-014 - Consolidação para 27 arquivos". **Confirmado por diff:
  a v27 continha na verdade o conteúdo antigo por camada** (idêntico a
  `a5cca07`) — rótulo não correspondia ao conteúdo real, provavelmente porque
  a versão foi cortada antes do push da consolidação realmente aterrissar no
  HEAD (consistente com a "worktree órfã" mencionada no §12).
- **Correção executada nesta sessão:**
  1. `clasp push` do HEAD do branch consolidado (`e6dc068`) — 28 arquivos
     (14 `.js` + 13 `.html` + `appsscript.json`).
  2. `clasp pull` de verificação: HEAD remoto ↔ `src/` do repo, diff vazio.
  3. `clasp create-version` → **versão 32**, descrição explícita citando a
     correção do rótulo da v27.
  4. `clasp update-deployment` no deployment de produção real (o que as
     Parceiras usam — `AKfycbwUhR1P7ZQlf9l_gf5PdlXrxwVU4oyefWwIEg4oPUwpeHTqOo-iA6sB7bjnBvq58s0Q4g`,
     citado em `DEPLOY_CHECKLIST.md` e nas notas do §11) para apontar à v32.
  5. `clasp pull --versionNumber 32` de verificação final: diff vazio contra
     `src/` e `appsscript.json` do repo.
  6. `curl` ao `/exec` do deployment de produção: HTTP 200, redireciona
     corretamente para o login do Google (sem erro de script).
- **Produção agora = HEAD do repositório = versão 32.** As pastas antigas
  (`acl/adapters/controller/domain/repository/service/`) não existem mais em
  nenhum lugar do Apps Script (nem HEAD, nem a versão publicada).
- **Pendência restante (não executável por esta sessão):** fumaça visual
  completa da jornada logada (login → dashboard → telas operacionais) em
  produção, dependente de sessão de navegador logada pelo operador — mesma
  pendência já registrada em sessões anteriores (§ "Go-live operacional").
- **Nota para sessões futuras:** as versões 26/27 ficam no histórico com
  rótulo "ADR-014" mas conteúdo antigo — não usar como referência de rollback
  para a arquitetura consolidada; a v32 é a primeira versão cujo conteúdo foi
  de fato verificado byte-a-byte contra o git.

## 14. Redesign visual — Design System Estúdio Elã (iniciado 2026-07-19)

- **Origem:** sessão de auditoria de UI (`src/ui/`) comparando com o Design
  System Estúdio Elã e o export Stitch (`docs/design/stitch-export/`). Documentos de
  referência (raiz do repo, não em `docs/` por serem artefatos de sessão):
  `UI_AUDIT_REPORT.md`, `UI_DESIGN_SYSTEM_GAP_ANALYSIS.md`,
  `UI_IMPLEMENTATION_ROADMAP.md`, `UI_VISUAL_HANDOFF.md`,
  `NOTEBOOKLM_HANDOFF_UI.md`.
- **Princípio:** evolução visual incremental, não redesign estrutural —
  preserva páginas, `google.script.run`, arquitetura frontend/backend e
  regras de negócio. Decisão de marca vigente: adoção integral do DS Elã
  (vinho `#9f0003` no lugar do verde `#176b4b`), sem tema paralelo.
- ✅ **Fase 1 (fundação) + Fase 2 (`admin.html`)** — commit `9bf189a`
  (branch `feat/ui-design-system-ela`), aprovado pelo responsável do
  projeto em 2026-07-19 (screenshots em `auditoria/`). Suíte 719/719 verde,
  lint limpo.
- ✅ **Fase 3 (migração página a página) concluída em 2026-07-19** — todas
  as 11 páginas migradas em commits individuais na branch
  `feat/ui-design-system-ela`: `login.html` → `dashboard.html` →
  `perfil.html` → `briefing.html` → `entrega.html` → `envio.html` →
  `financeiro.html` → `pagamentos.html` → `pendencias.html` →
  `compilar-mes.html` → `documentos.html`. Regra transversal respeitada
  (zero mudança em nomes de função `google.script.run` ou payloads); cada
  página fechou com lint + suíte 719/719 verde antes do commit seguinte,
  mais auditorias de consistência/segurança em subagentes (sem achados).
  Achados corrigidos durante a migração (não previstos no roadmap original):
  - Bug de escape em atributos por concatenação de string HTML
    (`briefing.html`, `entrega.html`, `envio.html`, `pendencias.html`,
    `financeiro.html`) — um valor vindo do backend com aspas podia quebrar
    o atributo/markup; reescrito com `createElement`/`textContent`.
  - Estados de enum crus (`AguardandoMaterial` etc.) trocados por rótulos
    legíveis em badges (`entrega.html`, `envio.html`, `pagamentos.html`,
    `pendencias.html`).
  - `window.prompt()` em `pagamentos.html` substituído por painel próprio
    (não bloqueia a thread, mesma linguagem visual do DS Elã).
  - `id="resultado"` de `documentos.html` renomeado para
    `resultadoDocumento` — colidia conceitualmente com o padrão de alerta
    legado (`.ok/.erro/.info/.oculto`) que só `compilar-mes.html` usa de
    fato.
  - Item "consolidação de portal-head.html (limpeza de IDs legados)" do
    roadmap original **não se aplicava**: `id="mensagem"` é o padrão vivo
    em 11/12 páginas (não é removível sem quebrar todas), e `id="resultado"`
    só tem um usuário legítimo restante (`compilar-mes.html`) — nada para
    remover além da colisão já corrigida acima.
  - `dashboard.html`/`financeiro.html` também tiveram `innerHTML` de
    concatenação trocado por `createElement` (regra transversal do
    roadmap), e `financeiro.html` ganhou coordenação das duas chamadas
    `google.script.run` paralelas (mensagem "Carregando…" só limpa quando
    ambas terminam).
  - `pagamentos.html`/`documentos.html` desminificados (estavam em linha
    única).
- **Pendência para o responsável do projeto:** revisar e abrir PR de
  `feat/ui-design-system-ela` para `main` (push protegido — `main` exige
  PR no GitHub). Branch com 11 commits, todos com suíte 719/719 verde e
  lint limpo.
- **Pendências não bloqueantes:** P2 (fonte display IvyPresto — Adobe Fonts
  — usando fallback Fraunces por ora) e P3 (re-export Stitch para tokens
  secundários exatos de `on-surface`/`tertiary`/`surface-container-*`).
- **Fase 4 (responsividade/acessibilidade/microinterações):** não iniciada;
  mudanças estruturais de shell (sidebar/bottom nav) exigem ADR próprio
  antes da execução.
- **Nota (limpeza 2026-07-19):** os artefatos de sessão da Fase 1–3
  (`UI_AUDIT_REPORT.md`, `UI_DESIGN_SYSTEM_GAP_ANALYSIS.md`,
  `UI_IMPLEMENTATION_ROADMAP.md`, `UI_VISUAL_HANDOFF.md`,
  `NOTEBOOKLM_HANDOFF_UI.md`, `UI_FINAL_REVIEW.md`, `auditoria/`) foram
  removidos por já estarem concluídos e aprovados; as pendências não
  bloqueantes acima foram preservadas nesta seção.
- **Correção de caminho (2026-07-19, auditoria fase Implementação):** esta
  nota listava `docs/design/stitch-export/` entre os artefatos removidos — o
  diretório **continua presente no repositório**
  (`docs/design/stitch-export/DESIGN.md` + `docs/design/stitch-export/screens/`, 9 telas)
  e segue sendo a referência visual Stitch oficial. `UI_FINAL_REVIEW.md`
  também já não existe (a nota anterior dizia "mantido"); a PR #40 já foi
  revisada e mergeada em `origin/main` (merge commit `c96e618`).

---

## 15. Implementação paralela `tear-v2-app` (Laravel + React) — achado de governança (2026-07-20)

- **O que é:** um segundo sistema, independente do descrito neste roteador
  (GAS + Google Sheets, `src/`, `clasp`), vive em `tear-v2-app/` —
  `backend` (Laravel 12 + Sanctum + Spatie Permission) e
  `frontend` (React 19 + Vite + TypeScript). Nasceu nesta mesma
  branch (`feat/ui-design-system-ela`) em 7 commits (`ee3557f`…`f85264b`,
  2026-07-19), sem nenhuma SPEC, ADR ou entrada neste roteador cobrindo-o —
  achado de auditoria ao iniciar o fechamento do fluxo de cadastro de
  influenciadora nesse stack.
- **Não substitui nem estende as SPECs acima:** este roteador segue sendo a
  fonte de verdade do sistema GAS (em produção). `tear-v2-app` é um esforço
  paralelo; as regras de negócio RN-01/RN-02/RN-03 e RF-001–RF-004 do
  `docs/PRD.md` (§6.1/§7/§9) foram reaproveitadas como referência por serem
  agnósticas de stack, mas nenhuma SPEC formal foi aberta.
- **Estado em 2026-07-20 (fechamento do cadastro de influenciadora):**
  model `Parceira` (nasce `Inativa`, RN-01), CRUD administrativo
  (`ParceiraController`, atrás de `auth:sanctum`) e agora rota pública de
  cadastro (`POST /api/parceiras/cadastro`, sem auth, `throttle:6,1`) via
  `CadastroPublicoController`, com página pública `/cadastro` no frontend
  (`PublicCadastroPage.tsx`). RN-02 (endereço automático por CEP) **não
  implementado** — débito registrado, decisão do responsável do projeto em
  2026-07-20 de deixar para uma entrega futura.
- ✅ **Resolvida (2026-07-20):** decidido continuar cobrindo `tear-v2-app`
  por este mesmo roteador, nova entrada por módulo — ver "Módulo Campanhas /
  Colaborações" abaixo, primeiro módulo registrado nesse padrão.
- **Fluxo administrativo de aprovação de parceiras (2026-07-20):** primeiro
  fluxo operacional do admin implementado (cadastro público → admin lista
  pendentes → abre perfil → aprova → status muda para `Ativa`). Reaproveita
  o enum binário já existente (`Ativa`/`Inativa`, sem novo estado
  "pendente" — `Inativa` já cumpre esse papel) para não reabrir o mapeamento
  fechado do ADR-001 nem exigir ADR novo. Adicionado apenas: colunas
  `aprovado_por`/`aprovado_em` (auditoria, migration aditiva), método
  `Parceira::aprovar(User $admin)` (único ponto de escrita de status, RN-01),
  endpoint `PATCH /api/parceiras/{id}/aprovar` protegido por
  `role:ADMIN` (primeiro uso do `spatie/laravel-permission` já instalado
  mas até então sem nenhuma policy/gate aplicada), filtro
  `GET /api/parceiras?status=`, e nas telas: toggle "novas inscrições" em
  `ParceirasListPage`, botão "aprovar" em `ParceiraProfilePage` (visível só
  para `role === 'ADMIN'`) e card "Aprovações" do `Dashboard` com contagem
  real. Débito conhecido, não endereçado aqui (fora de escopo desta
  entrega): as demais rotas de `parceiras` (`index`/`show`/`update`)
  continuam sem gate de role — qualquer usuário autenticado ainda lê/edita
  qualquer parceira.
- **Módulo Campanhas / Colaborações (2026-07-20):** primeira vertical slice
  do fluxo de campanha, resolvendo a pendência acima ("decidir se este
  roteador passa a cobrir `tear-v2-app`") a favor de continuar cobrindo por
  aqui, mesma seção. Sem ADR/SPEC formal — decisão explícita do responsável
  do projeto nesta entrega (documentação completa fica para consolidação
  futura via NotebookLM); domínio aprovado em conversa antes da execução:
  - **Modelo:** três entidades novas, nenhuma reabre `Parceira` (que
    permanece só cadastral/perfil, sem campo de condição comercial):
    `Marca` (cadastro interno gerido por ADMIN — nome, contato, CNPJ,
    status `Ativa`/`Inativa`; **sem** login/tenant próprio, decisão
    explícita de escopo — nota também no PRD §11/§12/§13, que hoje trata
    suporte a múltiplas marcas como fora de escopo/futuro não confirmado:
    esta entrega abre essa porta arquiteturalmente, sem implementar acesso
    externo), `Campanha` (pertence a uma `Marca`; `data_inicio`/`data_fim`
    livres, sem amarração a `MesReferencia`/ciclo mensal do domínio legado
    GAS; enum `status` uppercase `PLANEJADA`/`ATIVA`/`ENCERRADA`/
    `CANCELADA`, transição só manual pelo ADMIN) e `ParticipacaoNaCampanha`
    (vínculo Campanha×Parceira; carrega a condição comercial específica
    daquele vínculo — `valor_contratado`, `reels_qtd`/`carrossel_qtd`/
    `stories_qtd` — e enum `status` uppercase `ATIVA`/`CANCELADA`).
  - **RN-C01…C04 (rascunho do agente, aprovadas em conversa antes da
    execução):** só Parceira `Ativa` pode ser vinculada (`Rule::exists`
    com `where('status','Ativa')` na FormRequest); uma Parceira não pode
    ter duas participações na mesma Campanha (`unique(campanha_id,
    parceira_id)` + `Rule::unique` na validação); nenhum `destroy` em
    nenhum recurso novo — remover vínculo é soft (`status → CANCELADA`),
    preservando histórico (mesma restrição "não apagar dados" das demais
    SPECs); FKs `restrictOnDelete()` (não cascade) nas 3 tabelas.
  - **Backend:** migrations `marcas`/`campanhas`/`participacoes_na_campanha`
    → models com relacionamentos (`Marca::campanhas`, `Campanha::marca`/
    `::participacoes`, `ParticipacaoNaCampanha::campanha`/`::parceira`) →
    FormRequests/Resources/Controllers no mesmo padrão de
    `ParceiraController` → rotas em `routes/api.php`
    (`GET/POST /api/marcas`, `GET/POST /api/campanhas`,
    `GET/POST /api/campanhas/{campanha}/participacoes`,
    `PATCH /api/participacoes/{participacao}`; leitura aberta a qualquer
    autenticado, escrita atrás de `role:ADMIN`, mesmo padrão parcial já
    usado em `parceiras.aprovar`). 30 testes novos (`MarcaTest`,
    `CampanhaTest`, `ParticipacaoNaCampanhaTest`), suíte completa 49/49
    verde, `vendor/bin/pint --test` limpo.
  - **Frontend:** `lib/marcas.ts`/`campanhas.ts`/`participacoes.ts` +
    componentes novos `SelectField` (reaproveita `TextField.module.css`) e
    `Badge` (genérico, tons success/neutral/error, substitui o
    `StatusBadge` específico de Parceira só para os novos status
    uppercase) → `MarcasListPage`/`MarcaFormPage`,
    `CampanhasListPage`/`CampanhaFormPage`/`CampanhaDetailPage` (esta
    última concentra o fluxo de vínculo: busca Parceiras `Ativa`, exclui as
    já vinculadas do select, formulário de valor+entregáveis, tabela de
    participações com ação "cancelar"). `AppShell` ganhou nav real para
    "Marcas" e "Campanhas" (antes placeholders sem link); `Dashboard`
    ganhou card "Campanhas" com contagem de `ATIVA`. `tsc -b && vite build`
    e `oxlint` limpos (nenhum warning novo).
  - **Validação manual (2026-07-20):** critério de aceite percorrido
    ponta a ponta no navegador, logado como `admin@tear.test` (seed
    `DevUserSeeder`) — criar Marca "Jescri" → criar Campanha "Verão 2026"
    vinculada → selecionar Parceira `Ativa` ("Ana Teste", a Parceira
    `Inativa` existente ficou corretamente fora do select) → definir valor
    (R$ 2500) e entregáveis (2 reels/1 carrossel/4 stories) → participação
    criada e visível na tabela da Campanha → cancelamento soft testado
    (badge muda para `CANCELADA`, registro permanece, RN-C03) → edição de
    status da Campanha (`PLANEJADA`→`ATIVA`) refletida no card do Dashboard
    e no filtro `?status=ATIVA` da listagem.
  - **Fora desta entrega (próxima fatia):** briefing, produção/aprovação de
    conteúdo, logística e pagamento por participação — hoje só existe o
    vínculo comercial Campanha×Parceira.
  - **Módulo Briefings (2026-07-20):** CRUD ADMIN de `Briefing` 1:1 com
    `ParticipacaoNaCampanha` (`orientacoes`, `prazo`, `entregaveis_esperados`;
    `restrictOnDelete`, sem `destroy`). Backend: migration/model/FormRequests/
    Resource/`BriefingController` (`show`/`store`/`update`), rotas
    `GET/POST /api/participacoes/{participacao}/briefing`,
    `PATCH /api/briefings/{briefing}` (leitura autenticado, escrita
    `role:ADMIN`). Frontend: `lib/briefings.ts`, `BriefingFormPage`
    (create/edit na mesma rota), `TextareaField` novo (reaproveita
    `TextField.module.css`), ação "briefing" na tabela de participações de
    `CampanhaDetailPage`. 9 testes novos, suíte 58/58 verde, pint/tsc/vite
    build/oxlint limpos.
    - **FUTURO/BACKLOG:** Portal da Influenciadora (login próprio,
      ramificação de rota por `role`, leitura de briefing/campanha) — hoje
      todo autenticado cai no `AppShell` admin; `Parceira.user_id` já
      existe mas falta `User::parceira()` inverso. Upload de material,
      aprovação (com cálculo de data tipo RN-04) e pagamento por
      participação também ficam para depois.
  - **Módulo Portal da Influenciadora — Sprint 2.1, primeiro acesso e perfil
    (2026-07-20):** primeira fatia do backlog acima — só dashboard inicial e
    perfil, por escopo explícito do responsável do projeto (campanhas,
    briefing, materiais e pagamentos ficam para a próxima entrega, o backlog
    acima permanece válido para o restante). Relatório completo:
    `docs/reports/RELATORIO_SPRINT_2_1_PORTAL_INFLUENCIADORA.md`.
    - **Débito fechado antes de expor a tela de perfil:** `ParceiraPolicy`
      não tinha método `update` — `PATCH /parceiras/{id}` aceitava qualquer
      autenticado (débito já registrado no relatório da Sprint 1, §4 item 1).
      Corrigido: `update()` = dono (`user_id === user.id`), `ADMIN` continua
      liberado por `Gate::before`. Dois testes existentes que exercitavam
      essa rota sem posse nem papel precisaram passar a autenticar como
      ADMIN (não testavam o cenário pretendido — nenhum comportamento de
      produto mudou).
    - **Backend:** `GET /me/parceira` (resolve sempre `request->user()->
      parceira`, nunca aceita ID). Nenhuma tabela/entidade nova — perfil e
      medidas reaproveitam `PATCH /parceiras/{id}` e `GET/POST /parceiras/
      {id}/medidas` já existentes (este último já autorizava por posse desde
      a Sprint 1, sem gate de papel — influenciadora já podia gravar as
      próprias medidas antes desta entrega, só não havia UI).
    - **Frontend:** `PortalShell` (nav Painel/Perfil, sem itens
      administrativos) montado em `App.tsx` quando `role === 'INFLUENCIADORA'`
      (ramificação de 3 vias: sem sessão → Login; influenciadora → Portal;
      demais papéis → `AppShell` inalterado). `ResetPasswordPage`
      (`/definir-senha`, fora da árvore autenticada) fecha o ciclo de convite
      que a Sprint 1 deixou pela metade (endpoint backend já existia, sem
      página). `PortalDashboardPage` (saudação, status, próximos passos
      dinâmico conforme perfil completo/incompleto). `PortalPerfilPage`
      (dados pessoais com consentimento LGPD obrigatório + medidas
      versionadas, dois formulários independentes).
    - **Validação:** 3 testes novos de isolamento entre duas influenciadoras
      reais (`PortalIsolamentoTest`) + 3 de `/me/parceira`
      (`MeParceiraTest`), suíte completa 117/117 verde, pint/tsc/oxlint/vite
      build limpos. Jornada ponta a ponta percorrida no navegador (convite →
      definir senha → login → dashboard → perfil, dados pessoais e medidas
      salvos e persistidos, CEP auto-preenchido) com uma Parceira real criada
      e aprovada na sessão.
  - **Módulo Portal da Influenciadora — Sprint 2.2, campanhas/briefing/
    materiais/pagamento (2026-07-21):** fecha o restante do backlog descrito
    acima (nenhuma entidade/migration nova, só telas e rotas de leitura +
    ação para o dono da participação). Implementado em 5 commits
    (`794c3f0`…`dd35440`), sem relatório dedicado nesta sessão — registrado
    aqui por ser a fonte de verdade única do estado do projeto.
    - **`PortalCampanhasListPage`/`PortalCampanhaDetailPage`:**
      `GET /campanhas` já filtrava por posse desde o módulo de Campanhas
      (`CampanhaController::index`, `whereHas('participacoes', parceira_id
      = user.parceira.id AND status ATIVA)` quando o papel não é `ADMIN`) —
      reaproveitado sem mudança de backend. Tela nova só consome a API já
      existente.
    - **Briefing por tipo:** `PortalCampanhaDetailPage` lista os briefings
      da própria participação (`GET /participacoes/{id}/briefings`, já
      autorizado por `ParticipacaoNaCampanhaPolicy::view` = dono da
      participação `ATIVA`), agrupados por `tipo` com badge.
    - **Envio de material:** mesma tela ganhou formulário de upload
      (`POST /participacoes/{id}/materiais`, rota já aberta ao dono desde o
      módulo de Materiais — sem gate de role, só `authorize('view',
      $participacao)`); reaproveita `uploadMaterial` já usado pelo admin.
    - **Status de pagamento:** `GET /participacoes/{id}/pagamento`
      (`PagamentoController::show`, mesma policy de posse) exibido como
      tabela somente leitura — nenhuma ação de aprovação/edição exposta ao
      papel `INFLUENCIADORA` (continua `role:ADMIN`).
    - **Máscaras de digitação e CEP:** débito P1 do relatório da Sprint 1
      fechado nesta mesma leva — `lib/mascaras.ts` (telefone/CNPJ/CEP) e
      `lib/cep.ts` (busca ViaCEP on-blur, só preenche campos ainda vazios)
      aplicados em `PublicCadastroPage` e `PortalPerfilPage`.
    - **Achado de cobertura fechado nesta sessão (2026-07-21):** as 4 rotas
      de leitura reaproveitadas acima (`campanhas.show`/`index`,
      `briefings.index`, `pagamento.show`) tinham a checagem de posse
      correta no código desde que foram escritas, mas só `Material` tinha
      teste automatizado provando isolamento entre influenciadoras
      (`MaterialTest`). Adicionados 3 testes em `PortalIsolamentoTest`
      (campanha/briefing/pagamento de participação alheia → 403),
      fechando a mesma cobertura para as 3 abas que faltavam. Suíte
      completa 127/127 verde, pint limpo, `tsc -b && vite build`/`oxlint`
      limpos (único warning pré-existente em `auth.tsx:72`, não tocado).
    - **Débito fechado nesta sessão (2026-07-21):** `ParceiraFormPage`
      (tela administrativa de editar parceira) nunca enviava
      `consentimento_aceito` — débito registrado em
      `docs/reports/RELATORIO_SPRINT_2_1_PORTAL_INFLUENCIADORA.md` §5 desde 2026-07-20 e
      não corrigido até agora. `UpdateParceiraRequest` exige esse campo
      (`required|accepted`) desde a Sprint 1, então **todo `PUT
      /parceiras/{id}` feito pelo admin retornava 422** — a tela de editar
      parceira estava quebrada em produção para o próprio admin. Corrigido
      com o mesmo checkbox já usado em `PortalPerfilPage`, visível só no
      modo de edição. Validado manualmente no navegador (PUT retornou 200,
      redirecionou para o detalhe com os dados salvos); `tsc -b`/`vite
      build`/`oxlint` limpos.
    - **Verificação de débitos antigos (2026-07-21):** `docs/reports/HANDOFF_PRODUCTIZACAO_TEAR_V2.md`
      §2/§3 (2026-07-20) listava "RBAC de leitura não existe" e locale
      `en` como pendências. Ambos já **resolvidos** neste ponto do código,
      não identificados nesta sessão: todo controller de `tear-v2-app`
      chama `authorize()` com policy por posse ou por papel
      (`ParceiraController`, `CampanhaController`, `MarcaController`,
      `MaterialController`, `PagamentoController`, `BriefingController`,
      `ParticipacaoController`); `APP_LOCALE=pt_BR` já configurado em
      `.env`/`.env.example` com `lang/pt_BR/` completo. Único item real
      ainda pendente e fora do controle de código: credenciais reais do
      Google Drive (`GOOGLE_DRIVE_CLIENT_EMAIL`/`GOOGLE_DRIVE_PRIVATE_KEY`
      vazias) — bloqueio externo, não corrigível sem acesso que o agente
      não possui.
  - **Varredura técnica final do Portal — P0/P1/P2 (2026-07-21):** antes de
    autorizar a preparação de deploy, auditoria completa das telas do
    Portal em busca de funcionalidade incompleta, inconsistência de UX,
    edge case e dívida técnica de baixo risco. Achados e decisões:
    - **P0-1 (fechado, `392de04`):** não existia nenhuma forma de uma
      influenciadora recuperar acesso ao Portal se esquecesse a senha ou
      perdesse a janela de 60 min do convite — lockout permanente, exigindo
      intervenção manual via `tinker`. Implementado com o broker nativo de
      senha do Laravel (`Password::broker()->sendResetLink()`, customizado
      via `ResetPassword::createUrlUsing()`/`toMailUsing()` — pontos de
      extensão oficiais para SPA, sem autenticação própria) + endpoint de
      reenvio de convite pelo admin (`POST /parceiras/{id}/reenviar-convite`,
      reaproveita o mesmo código de `aprovar()`). Detalhe completo na
      mensagem do commit `392de04`.
    - **P0-2 → reclassificado para P2 (decisão do responsável do projeto,
      2026-07-21):** TikTok/UGC como tipos de deliverable estão parcialmente
      implementados — a migration já criou `tiktok_qtd`/`ugc_qtd` e
      `Briefing` já valida os 5 tipos, mas `StoreParticipacaoRequest`/
      `UpdateParticipacaoRequest`/`ParticipacaoResource` nunca aceitam nem
      expõem esses 2 campos, e nenhuma tela (admin ou Portal) tem input
      para eles — hoje é impossível contratar um deliverable de TikTok ou
      UGC para qualquer participação real. **Não implementar agora** — a
      operação da Jescri ainda não comercializa esses formatos; retomar
      só quando isso mudar.
    - **P1 (fechados, `d37526f`):** `/api/login` sem nenhum rate limit
      (`bootstrap/app.php` nunca chamava `throttleApi()`) — aplicado
      `throttle:6,1`, mesmo padrão já usado em `/password/reset` e
      `/parceiras/cadastro`; `PortalDashboardPage` com texto desatualizado
      ("em breve suas campanhas") contradizendo a Sprint 2.2 já entregue;
      seção de Materiais em `PortalCampanhaDetailPage` sem estado de
      carregamento (Briefing/Pagamento já tinham).
    - **P1 registrado, não fechado:** erro genérico no upload de material
      não repassa o motivo real do backend (ex. arquivo acima de 50MB) —
      polimento de baixo risco, não bloqueia produção.
    - **Infra-dependente, fora do controle de código (checklist para quem
      for fazer o deploy):** credenciais reais do Google Drive; variáveis
      de produção (`APP_ENV=production`, `APP_DEBUG=false`, `FRONTEND_URL`,
      `SESSION_DOMAIN`, `SANCTUM_STATEFUL_DOMAINS`, `APP_URL`,
      `VITE_API_URL`); engine de banco de produção (hoje SQLite dev;
      `docs/reports/HANDOFF_PRODUCTIZACAO_TEAR_V2.md` recomenda Postgres); `MAIL_MAILER`
      hoje é `log` — sem SMTP/SES real, nenhum e-mail (convite, redefinição
      de senha) chega de fato a uma caixa de entrada real.
    - **Conclusão:** com P0-1 fechado e P0-2 reclassificado para P2 fora do
      escopo atual, não há nenhum P0 de código restante bloqueando a
      entrada em produção do Portal da Influenciadora. Único bloqueio real
      é a preparação de infraestrutura (lista acima).
  - **QA operacional pré-Go-Live, sessão interrompida por limite de contexto
    (2026-07-21):** validação manual dos dois perfis via navegador
    (`admin@tear.test`/`marina.duarte@example.com`, dados de teste criados
    via tinker: 1 Campanha/Participação ATIVA/Briefing). Sessão foi
    interrompida no meio do fluxo — cobriu login (admin, credenciais
    inválidas) e Campanhas → Briefing (admin) antes de parar; **não chegou**
    a Parceiras, Aprovações, Materiais, Pagamentos, Documentos/Histórico
    (admin) nem a nenhum fluxo do Portal da Influenciadora (cadastro,
    convite, dashboard, perfil, campanhas, upload, pagamento, logout).
    - **Corrigido (`605de91`):** `lang/pt_BR/validation.php` só tinha
      `attributes` de Parceira/Marca — nunca atualizado para os campos de
      Briefing/Campanha/Participação/Pagamento. Erro de validação exibia
      a chave crua (`"O campo orientacoes é obrigatório."` em vez de
      "orientações"). Adicionadas as 28 chaves que faltavam. Suíte
      147/147 verde, pint limpo, verificado no navegador antes do commit.
    - **Observado, não confirmado como bug (não investigado a fundo por
      limite de tempo):** no primeiro clique num link do menu lateral
      (`Campanhas`) logo após um `navigate()` de página inteira (login ou
      F5), a navegação client-side não ocorreu (URL ficou em `/`); um
      segundo clique no mesmo link, ou clicar em outro item do menu
      primeiro, funcionou normalmente. Não reproduzido de forma
      determinística o suficiente para abrir causa raiz — registrar aqui
      para quem retomar tentar reproduzir com o DevTools aberto (suspeita:
      timing de hidratação/attach de listener do React Router logo após
      navegação completa de página).
    - **Dado de dev encontrado, não é bug de produto:** usuário seed
      `influenciadora@tear.test` (`DevUserSeeder`) tem papel
      `INFLUENCIADORA` mas nenhuma `Parceira` vinculada (`user_id`) — login
      funcionaria mas o Portal quebraria ao tentar resolver `/me/parceira`.
      Não testado neste ponto da sessão. Não é um bug real (nenhum fluxo de
      produto cria User sem Parceira), só uma armadilha do seed para quem
      for logar como essa conta específica em QA futura — usar
      `marina.duarte@example.com` (tem Parceira `Ativa`, id=1) ou criar a
      vinculação antes de testar com a conta seed.
    - **Próxima sessão deve retomar QA a partir daqui:** Parceiras
      (CRUD, aprovação, convite, reenvio), Aprovações, Materiais (upload,
      MIME allowlist já fechada em `28c6ba4`), Pagamentos, Documentos/
      Histórico (placeholders — confirmar se é esperado ou débito),
      Perfil admin (placeholder — mesma dúvida), e todo o Portal da
      Influenciadora ponta a ponta (cadastro → aprovação → convite →
      primeiro acesso → login → esqueci senha → perfil → campanhas →
      briefings → upload → pagamentos → histórico → logout). Dados de
      teste (Campanha id=1 "Campanha QA Verao 2026", Participação id=1,
      2 Briefings) já existem no banco local — reaproveitar em vez de
      recriar. Senha de `marina.duarte@example.com` foi redefinida para
      `password` nesta sessão (dev/QA apenas).
  - **QA operacional pré-Go-Live, sessão concluída (2026-07-21):** retomada
    exata do ponto acima. Cobriu todos os fluxos restantes: Parceiras
    (CRUD/aprovação/convite/reenvio), Aprovações e Materiais (upload,
    aprovar, reprovar), Pagamentos (criar, aprovar, regra de bloqueio por
    material não aprovado), Documentos/Histórico/Perfil (admin), e a
    jornada completa do Portal da Influenciadora (cadastro público →
    aprovação → primeiro acesso/definir senha → login → esqueci senha →
    campanhas → briefing → upload → pagamentos → perfil → logout), incluindo
    um smoke test ponta a ponta com identidade única (parceira "Beatriz
    Souza QA Portal", id=3, participação id=2 na Campanha id=1).
    - **P0 de segurança encontrado e corrigido (`0a2bc5b`):** `POST
      /api/parceiras` (autenticado) não tinha `role:ADMIN` nem policy de
      `create` — qualquer usuário autenticado, inclusive uma
      INFLUENCIADORA, podia criar registros de `Parceira` arbitrários via
      API, contornando o fluxo de cadastro. Corrigido restringindo a rota a
      ADMIN (mesmo padrão de `/marcas` e `/campanhas`); testes que
      assumiam acesso irrestrito foram migrados para o endpoint público
      `POST /parceiras/cadastro` (mesma lógica de validação, é o local
      correto para essa cobertura). Suíte 148/148 verde, pint limpo.
    - **P1 confirmado e ampliado (não corrigido, não bloqueia produção):**
      o erro genérico "Não foi possível enviar o material"/"...atualizar o
      pagamento" que não repassa o motivo real do backend (já registrado
      na sessão anterior só para upload de materiais) também ocorre em
      **Pagamentos** — confirmado com um 409 real ("Pagamento não pode ser
      aprovado: há material da participação ainda não aprovado") mascarado
      pela mesma mensagem genérica no frontend. Mesmo padrão, dois pontos
      de origem; vale um fix único (propagar `error.response.data.message`
      quando existir) em vez de dois patches pontuais.
    - **P2 novos (cosméticos/não bloqueantes):**
      - Valores monetários exibidos sem formatação pt-BR (`R$ 2273.98` em
        vez de `R$ 2.273,98`) em Campanha (coluna Valor) e Pagamento.
      - Template de e-mail transacional (convite/definir senha) mistura
        "Regards," em inglês no corpo majoritariamente em português
        (visto no e-mail de convite enviado via `MAIL_MAILER=log`).
      - `GET /marcas` e `GET /marcas/{marca}` dependem só da
        `MarcaPolicy` para bloquear não-ADMIN (funciona hoje, mas sem
        `role:ADMIN` explícito na rota como as demais escritas de
        `/marcas`/`/campanhas` — frágil a regressão futura caso a Policy
        mude sem repor a restrição na rota). Recomendação de hardening,
        não é um gap ativo hoje (achado do subagente de auditoria de
        rotas, verificado).
    - **Não reproduzido nesta sessão:** o bug de navegação client-side
      registrado na sessão anterior (primeiro clique no menu lateral após
      `navigate()` de página inteira) — testado explicitamente logo após
      login (full page navigate) e não ocorreu. Mantido como observação
      não determinística, sem repro nesta rodada.
    - **Infra-dependente, reconfirmado (fora do controle de código):**
      Google Drive real não configurado neste ambiente dev → upload de
      material retorna 503 tanto no admin quanto no Portal (mensagem
      backend correta: "Envio de materiais está temporariamente
      indisponível"); `MAIL_MAILER=log` → e-mails (convite, redefinição de
      senha) não chegam a caixas de entrada reais. Ambos já listados no
      checklist de infra da sessão anterior; nenhum é bug de código.
    - **Cobertura de testes (achado do subagente, verificado):** backend
      bem coberto para os fluxos de negócio (Parceiras, Materiais,
      Pagamentos, Briefings, isolamento entre influenciadoras). Documentos
      e Perfil (admin) sem teste porque são `PlaceholderPage` ainda não
      implementadas — comportamento esperado, confirmar com PO se entram
      no MVP do Go-Live ou ficam para depois. Frontend não tem nenhum
      teste automatizado (0 arquivos `*.test.*`) — toda a camada React
      depende de QA manual como esta.
    - **Veredito: APTO PARA GO-LIVE** (código), condicionado à preparação
      de infraestrutura já listada (credenciais Google Drive, SMTP/SES
      real, `APP_ENV=production` e variáveis relacionadas, banco de
      produção). Nenhum P0 de código restante. P1/P2 acima são polimento,
      não bloqueiam a entrada em produção.
  - **Auditoria estática final de prontidão para Go-Live — Agente B
    (2026-07-21):** agente independente, sem sobreposição com a QA manual
    acima (não abriu navegador, não alterou código). Varredura estática
    completa de `tear-v2-app` (rotas, controllers, policies, models,
    FormRequests, upload/Drive, auth/CORS/Sanctum, headers de segurança,
    seeders, templates `.env*`, frontend auth/roteamento) para responder
    apenas: existe problema técnico de código que ainda impeça o Go-Live?
    Suíte (148/148), `pint --test` e `tsc -b`/`oxlint` do frontend
    conferidos verdes antes da conclusão.
    - **P0:** nenhum novo. Os P0 fechados em sessões anteriores (gate ADMIN
      em `POST /parceiras`, allowlist de MIME em Material, hash de senha no
      reset via cast `'password' => 'hashed'`, recuperação de acesso do
      Portal) foram reverificados no código atual e estão corretos —
      incluindo o bypass `Gate::before` de ADMIN e ownership por policy em
      Campanha/Participação/Material/Pagamento/Marca.
    - **P1 (novo, não fechado):** comentário de `.env.example` e
      `.env.production.example` afirma que a ausência das credenciais
      `GOOGLE_DRIVE_*` faz o upload de Material "cair automaticamente em
      armazenamento local (disco 'public')" — falso: `MaterialController
      ::store` retorna 503 e bloqueia o upload sem nenhum fallback. Quem
      seguir o template de produção ao pé da letra pode subir sem as
      credenciais achando que uploads locais funcionariam. Corrigir o
      comentário nos dois arquivos antes do deploy.
    - **P1 (já registrado, reconfirmado ainda aberto):** erro genérico no
      upload de material não repassa a causa real (Drive fora do ar, token
      expirado, arquivo grande) — `MaterialController::store` só trata a
      ausência de configuração (503); qualquer outra falha vira exceção não
      tratada → 500 genérico. Baixo risco, não bloqueia.
    - **P2 (novo, registrado sem ação):** papel `GESTOR_MARCA` (só existe
      em `DevUserSeeder`, guardado a `local`/`testing`) não tem nenhum
      modelo de autorização real no backend (`MarcaPolicy::viewAny` sempre
      `false` fora de ADMIN, ownership filters devolvem vazio), mas o
      frontend manda qualquer papel `!== 'INFLUENCIADORA'` para o
      `AppShell` administrativo completo — se esse papel for atribuído a um
      usuário real no futuro, a UI ficaria quebrada (403 em quase tudo).
      Sem risco ativo hoje (nenhum fluxo de produção cria esse papel).
    - **P2 (novo, registrado sem ação):** `laravel/pulse` instalado e
      documentado em `.env.production.example` como observabilidade
      "restrita a ADMIN" em `/pulse`, mas não existe `Gate::define
      ('viewPulse', ...)` customizado em `AppServiceProvider` — o gate
      padrão do pacote (`app()->environment('local')`) bloqueia `/pulse`
      para todos em produção. Falha de forma segura, mas a funcionalidade
      documentada não funciona até alguém adicionar o gate.
    - **P2 (novo, registrado sem ação):** `Pagamento::$fillable` inclui
      `status` sem necessidade — nenhum controller faz mass-assignment
      desse campo hoje (`StorePagamentoRequest` não valida `status`,
      `update()` atribui campo a campo checando `existeMaterialNaoAprovado`
      manualmente), então não é explorável agora, mas é superfície mais
      permissiva do que o necessário para um endpoint futuro menos
      cuidadoso. Sugestão: remover do fillable e centralizar a transição
      num método dedicado, mesmo padrão de `Parceira::aprovar()`.
    - **Veredito: APTO PARA GO-LIVE COM RESSALVAS.** Nenhum P0 de código
      bloqueando produção; os P1/P2 acima são polimento de baixo risco.
      Confirma a conclusão de "Varredura técnica final do Portal" acima.
      Passos restantes são só infraestrutura (nenhum é código): credenciais
      reais do Google Drive; banco Postgres de produção; `MAIL_MAILER` real
      (hoje `log`, sem SMTP/SES nenhum e-mail chega); variáveis de produção
      (`APP_ENV`, `APP_DEBUG=false`, `APP_KEY`, `APP_URL`, `FRONTEND_URL`,
      `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE=true`,
      `SANCTUM_STATEFUL_DOMAINS`, `VITE_API_URL`); deploy (build frontend,
      migrations, `admin:create` para o primeiro ADMIN). Detalhe completo:
      `docs/reports/HANDOFF_FINAL.md`.
  - **Preparação de Release Engineering — sessão Agente B (2026-07-21,
    continuação):** mandato era auditar config de produção, produzir
    checklist (Banco/Storage/Email/Laravel/Frontend) e escrever
    `RUNBOOK_DE_DEPLOY.md`. Achado ao iniciar: praticamente todo o
    material já existia de sessões anteriores do mesmo dia —
    `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` (checklist completo) e
    `docs/deployment/DEPLOY.md` (runbook: pré-requisitos, deploy,
    rollback, backup). Criar um `RUNBOOK_DE_DEPLOY.md` novo duplicaria
    `DEPLOY.md` quase por completo (`CLAUDE.md`, "Não criar documentação
    duplicada") — decisão: não criar arquivo novo, estender o runbook
    existente com as duas peças que faltavam (`DEPLOY.md` §4 "Smoke test
    pós-deploy" formalizado em 8 passos, §5 "Critérios para declarar
    produção saudável", ambos ausentes antes; seções seguintes
    renumeradas §6-9).
    - **Concorrência detectada durante a sessão:** enquanto este agente
      auditava, uma sessão paralela ("Engenheiro de Release e Deploy",
      mesma branch/working dir, sem worktree) editava e commitou
      `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` +
      `backend/.env{,.production}.example` em tempo real
      (commit `794c849` — fechou P0-1/P0-8 como resolvidos e corrigiu o
      mesmo comentário falso sobre fallback do Drive já registrado em
      `docs/reports/HANDOFF_FINAL.md`). Este agente evitou tocar nesses 3
      arquivos para não colidir com a escrita concorrente; só editou
      `docs/deployment/DEPLOY.md`, não tocado pela outra sessão — sem
      conflito. **Nota operacional para sessões futuras:** este ambiente
      não isola sessões paralelas em worktrees; duas sessões "Agente B"
      simultâneas na mesma working dir é um risco real de write race,
      não hipotético — id do commit concorrente serve de evidência.
  - **Smoke test final da jornada crítica ponta a ponta (2026-07-21,
    sessão QA operacional):** os 13 passos do fluxo crítico (cadastro
    público → aprovação → primeiro acesso → definir senha → login →
    campanhas → briefing → upload de material → aprovação de material →
    pagamentos → histórico → perfil → logout) executados via browser real
    (Playwright) contra o ambiente de dev local já em pé (`php artisan
    serve`/Vite), com uma identidade nova de ponta a ponta ("QA Smoke Test
    20260721", `Parceira` id=4, participação id=3 na `Campanha QA Verao
    2026`). Nenhum bug bloqueante encontrado; nenhuma correção de código
    necessária nesta sessão.
    - **Confirmado, não é bug:** upload de Material retornou 503
      ("Envio de materiais está temporariamente indisponível") — sem
      Google Drive real configurado, como já documentado (`docs/reports/HANDOFF_FINAL.md`,
      P1 de erro genérico reconfirmado). Sem Material persistido, a etapa
      "aprovação de material" não foi executável neste ambiente — não
      contornado via `tinker` para não mascarar o comportamento real de
      produção sem credenciais.
    - **Achado esclarecido (não é bug):** aprovar um Pagamento de uma
      participação sem nenhum Material (nem pendente) teve sucesso
      imediato (`PENDENTE → APROVADO → PAGO`), aparentemente contradizendo
      o P0 de bloqueio por material não aprovado fechado em sessão
      anterior. Não é regressão: `PagamentoController::existeMaterialNaoAprovado`
      só bloqueia quando existe Material com status `!= APROVADO`; o caso
      vácuo (zero materiais) aprova normalmente — comportamento
      explicitamente documentado no próprio código (comentário do método,
      "mesma regra do legado"). O 409 relatado na sessão de QA anterior
      ocorreu com um Material real pendente, cenário diferente deste.
    - **Confirmado, sem mudança:** `Histórico` e `Perfil` (admin) seguem
      `PlaceholderPage`; checkbox de consentimento LGPD não vem
      pré-marcado após reload (exige reconfirmação a cada salvamento —
      comportamento esperado do `accepted` do Laravel, não testado a
      fundo antes mas consistente com o padrão do restante do formulário).
    - **P2 cosmético novo, não corrigido (fora de escopo — captura apenas
      melhoria, não bug bloqueante):** `ParceiraProfilePage` exibe
      Telefone e CNPJ sem a máscara aplicada no cadastro (`11987654321`
      em vez de `(11) 98765-4321`) — a máscara só existe no formulário de
      entrada, não na exibição. Mesma categoria dos P2 de formatação
      monetária já registrados (não pt-BR em Campanha/Pagamento,
      reconfirmados ainda presentes nesta sessão).
    - **Nenhum sinal de escrita concorrente** detectado durante esta
      sessão (`git fetch`/`status` antes e depois, sem commits novos
      aparecendo; banco de dev usado de forma aditiva, sem `migrate:fresh`
      nem reset).
    - **Veredito desta rodada:** nenhum P0/P1 novo. Jornada crítica
      íntegra ponta a ponta. Confirma o veredito de
      `docs/reports/HANDOFF_FINAL.md`/sessões anteriores: **APTO PARA GO-LIVE**
      (código), condicionado à infraestrutura já listada (Google Drive,
      SMTP, Postgres, variáveis de produção).

## 16. Due diligence do plano estratégico + consolidação de auditorias externas (2026-07-22)

- **Due diligence do Plano Mestre** (painel de 9 especialistas de IA
  independentes) e duas auditorias externas adicionais (Manus AI, CPO)
  revisaram `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` e documentos
  irmãos. Relatório consolidado: `RELATORIO_CONSOLIDACAO_AUDITORIAS.md`
  (raiz do repo).
- **Achado de maior valor prático: branch órfã `worktree-spec-mvp-completa`
  não reconciliada.** Confirmado por investigação direta (`git log`,
  `git merge-tree`) nesta sessão: 16 commits únicos desde o ponto de
  divergência `dd5e297`, **zero conflitos** contra `feat/ui-design-system-ela`
  (merge-tree limpo). Implementa, já testado, exatamente lacunas apontadas
  por três auditorias independentes: módulo de logística mínimo viável
  (`Envio`, model+controller+migration+factory), cálculo automático da data
  de aprovação do briefing (RN-04), campos contratuais em `Parceira`,
  congelamento de condições comerciais da Participação, landing page
  pública de onboarding com fluxo de reprovação de cadastro. 54 arquivos,
  1675 inserções/74 remoções (`git diff --stat` confirmado). Nenhum dos
  três documentos de planejamento estratégico nem este roteador
  mencionavam essa branch antes desta sessão.
  - **Merge NÃO executado nesta sessão** (nota histórica — ver correção
    abaixo) — tentativa de `git merge` foi bloqueada pelo classificador de
    permissão do harness (ação significativa e de reversão custosa: 16
    commits, nova regra de negócio, não é documentação). Decisão correta:
    mesclar 1675 linhas de lógica de negócio dentro de uma tarefa de
    consolidação de auditoria excederia o escopo autorizado e merece sua
    própria sessão dedicada (Auditoria → Plano → Execução → Validação →
    Commit).
  - ✅ **Correção (2026-07-22):** o merge foi executado em sessão dedicada
    subsequente — commit `24f7dfc`, 16 conflitos resolvidos, suíte subiu de
    151 para 183 testes (todos verdes). Branch `worktree-spec-mvp-completa`
    já integrada; decisão de arquivar/apagar a branch remota segue em
    aberto, sem urgência técnica.
- **Correções aplicadas nesta sessão** (detalhe completo em
  `RELATORIO_CONSOLIDACAO_AUDITORIAS.md`): (1) consentimento LGPD passou a
  ser exigido e registrado no **nascimento do dado** (cadastro público de
  Parceira), não só na edição — `Parceira::registrarConsentimentoCadastro()`,
  nova migration aditiva (`consentimento_cadastro_aceito_em`/`_ip`), gate em
  `StoreParceiraRequest` (rota pública e rota administrativa), checkbox em
  `PublicCadastroPage.tsx`; suíte 151/151 verde, Pint limpo, `tsc`/build/lint
  do frontend limpos. (2) Contradição de arquitetura Docker vs. Locaweb
  resolvida na documentação: `docs/deployment/DEPLOY.md` reescrito para o
  fluxo GitHub Actions + SSH + symlink já decidido em
  `docs/deployment/ARQUITETURA_PRODUCAO.md` (não a alternativa de SFTP "bare
  metal" sugerida por uma das auditorias externas, que seria uma regressão
  frente ao runbook atômico já especificado em
  `docs/deployment/PLANO_IMPLEMENTACAO.md`); `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`
  atualizado nos itens normativos (P0-2, ordem de execução, estimativa de
  esforço, checklist de Deploy), narrativa histórica de sessões anteriores
  preservada sem alteração.

## 17. Consolidação documental pós-merge — 4 documentos do `worktree-spec-mvp-completa` (2026-07-22)

- **Contexto:** o merge (§16) trouxe 4 documentos novos direto para `docs/`
  raiz (`BACKLOG_EXECUTIVO_MVP.md`, `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`,
  `PLANO_EXECUCAO_MVP.md`, `DECISAO_TAXONOMIA_MATERIAL_BRIEFING.md`) que se
  sobrepunham em escopo a documentos canônicos de `docs/planning/`. Achado
  registrado em `ESTADO_SESSAO.md` §5 (risco #1). Diagnóstico completo
  (leitura integral dos 4 documentos e dos 3 canônicos candidatos) feito
  antes de qualquer alteração.
- **Decisão de produto necessária para destravar a consolidação:** CPF como
  alternativa a CNPJ tinha duas respostas incompatíveis entre os documentos
  do merge (`HU-3.5`: "não fazer") e o canônico `BACKLOG_FUNCIONAL_V2_6.md`
  (`CD-01`, MUST: "fazer"). **Decisão do responsável do projeto
  (2026-07-22): CPF passa a ser suportado, conforme CD-01. HU-3.5 tratada
  como superada.**
- **Reorganização executada:**
  - `docs/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` → movido para
    `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`, passa a ser a
    **fonte oficial de especificação funcional**. Justificativa objetiva
    para substituir o canônico anterior (não só "é maior"): o próprio
    documento se declara consolidação explícita de 13 fontes incluindo a
    V2.5 (fonte #2 citada em seu §0); auditoria de conteúdo confirmou 100%
    do conteúdo de V2.5 presente, zero contradições, mais material que V2.5
    não tinha (medidas em cm, comprovante de pagamento, viabilidade de
    importação de histórico, lista única de decisões pendentes).
  - `docs/planning/ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md` → arquivado em
    `docs/archive/consolidacao-mvp-completa/` (superado pelo item acima).
  - `docs/BACKLOG_EXECUTIVO_MVP.md` → arquivado em
    `docs/archive/consolidacao-mvp-completa/` como registro histórico de
    execução (não é superset/subset de `BACKLOG_FUNCIONAL_V2_6.md` — são
    documentos de momentos diferentes, execução vs. planejamento futuro).
    `BACKLOG_FUNCIONAL_V2_6.md` **permanece a única fonte vigente** de
    backlog. Nota de supersão de HU-3.5 adicionada ao topo do arquivo.
  - `docs/PLANO_EXECUCAO_MVP.md` → arquivado em
    `docs/archive/consolidacao-mvp-completa/`: sua função (sequenciamento/
    dependências entre tarefas) é a mesma que este roteador já cumpre como
    fonte única de estado (`CLAUDE.md` §Documentos oficiais); mantê-lo
    vigente em paralelo criaria duas fontes de verdade para sequenciamento.
    Ondas 0-2 concluídas; Ondas 3-6 restantes já mapeadas em itens MUST/
    SHOULD de `BACKLOG_FUNCIONAL_V2_6.md` (LG-01, C-01/C-02, PM-01,
    H-01/H-02).
  - `docs/DECISAO_TAXONOMIA_MATERIAL_BRIEFING.md` → arquivado em
    `docs/archive/consolidacao-mvp-completa/`: decisão já implementada
    (HU-4.1), sem canônico correspondente ativo.
  - `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` → **não tocado**: par
    óbvio (`PLANO_EXECUCAO_MVP.md`) tratava de altitude diferente (negócio/
    calendário de macrofases vs. sequenciamento técnico de histórias), sem
    duplicidade real.
- **Correções colaterais aplicadas em `BACKLOG_FUNCIONAL_V2_6.md`** (achado
  durante a comparação, fora do par comparado): `CD-02` (consentimento LGPD)
  e `B-01` (Briefing/RN-04) estavam listados como pendentes mas já foram
  implementados (commits `e0756c0` e `6709ee7`) — status atualizado inline,
  texto de análise original preservado.
- **Referências cruzadas corrigidas:** citação interna de
  `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` (RFC-09/RFC-10) que apontava
  para o documento que estava sendo superado por ele mesmo; 3 referências em
  `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` que apontavam para
  `ESPECIFICACAO_FUNCIONAL_TEAR_V2.5.md` §11, atualizadas para
  `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` §3.6/§3.7. Referências em
  documentos já arquivados (`docs/archive/**`) e em auditorias históricas
  congeladas (`docs/governance/REPOSITORY_GOVERNANCE_AUDIT.md`) não foram
  alteradas — são fotografias de um momento específico, não documentação
  viva.
- **Resultado:** cada tema tratado pelos 4 documentos do merge agora tem
  exatamente uma fonte oficial vigente (ver tabela em
  `docs/archive/README.md` §`consolidacao-mvp-completa/`).

## 18. Macrofase A (Go Live interno) — início da execução, ajustes de código sem credenciais reais (2026-07-22)

- **Contexto:** início da execução técnica da Macrofase A, seguindo a ordem
  de `docs/deployment/IMPLEMENTACAO_TECNICA.md` §1. Itens 1/2/5/7 dessa
  ordem (confirmação de acesso Locaweb, provisionamento de banco/DNS/Drive,
  configuração do host, primeiro deploy) exigem credenciais/acesso reais
  que o agente não possui — não executados. Itens 3 e 6 (parte de código,
  sem credenciais) executados nesta sessão.
- **Alterações de código (§2/§3 de `IMPLEMENTACAO_TECNICA.md`):**
  - `GoogleDriveService.php` — suporte a Shared Drive
    (`supportsAllDrives`/`includeItemsFromAllDrives`/`corpora=drive`/
    `driveId`), ausente até então; sem isso `ensureFolder`/`uploadFile`
    falhariam silenciosamente contra o Shared Drive institucional.
  - `bootstrap/app.php` — `trustProxies` condicionado a `TRUSTED_PROXIES`
    (vazio por padrão, sem mudança de comportamento fora de produção).
  - `.env.production.example` / `.env.example` / `config/services.php` —
    `DB_HOST` deixou de assumir `db` (docker-compose); adicionadas
    `TRUSTED_PROXIES` e `GOOGLE_DRIVE_BACKUP_FOLDER_ID`.
  - `scripts/backup-db.sh` — reescrito para `pg_dump` direto contra o banco
    gerenciado (lendo `backend/.env`), sem `docker compose exec`.
  - `app/Console/Commands/BackupDatabaseToDrive.php` (novo, comando
    `backup:upload-to-drive`) + `app/Notifications/BackupFalhouNotification.php`
    (novo) — upload do dump ao Shared Drive via `GoogleDriveService`, com
    alerta por e-mail aos ADMINs em caso de falha (via `Notification`, não
    `Mail::raw()` — este último é no-op sob `Mail::fake()`, logo
    intestável; o padrão de notificação já usado no projeto,
    `InfluenciadoraConviteNotification`, foi seguido).
  - `scripts/crontab.example` (novo) — linhas exatas das Etapas 9/10 de
    `PLANO_IMPLEMENTACAO.md`, para copiar ao crontab real do host.
- **Bloqueio arquitetural encontrado (parou a execução antes das Etapas 5/6
  de CI/CD — job de build do frontend + deploy SSH):**
  `ARQUITETURA_PRODUCAO.md` decide subdomínio único (`tear.estudioela.com`)
  com o Laravel servindo `public/build`, mas o repositório atual não tem
  essa fiação: `frontend/vite.config.ts` não aponta `outDir` para
  `backend/public/build`, não há `laravel-vite-plugin`, `backend/routes/web.php`
  só retorna a view placeholder `welcome` (sem rota catch-all servindo a
  SPA), e `SESSION_DOMAIN`/`SANCTUM_STATEFUL_DOMAINS` no template ainda
  assumem múltiplos subdomínios (ponto inicial), o que é redundante/
  potencialmente incorreto para origem única. **Decisão de arquitetura
  necessária antes de continuar:** como o build do frontend chega ao
  usuário — servido pelo Laravel a partir de `public/build` (origem única,
  como a decisão registrada assume) ou como site estático separado (ainda
  que no mesmo subdomínio via proxy do servidor web)? Isso define o job de
  CI (Etapa 5), o script/workflow de deploy (Etapa 6) e potencialmente
  `config/cors.php`/`config/sanctum.php`. Não decidido nesta sessão —
  registrado aqui para não ficar só no resumo do chat.
- **Validação:** backend 188/188 testes verdes (469 assertions, +5 novos
  testes de `backup:upload-to-drive`), Pint limpo, `composer audit` sem
  achados, `tsc -b` do frontend limpo (frontend não alterado nesta sessão).
- **Próximo passo:** decisão de arquitetura acima, depois retomar Etapas
  5/6 de `PLANO_IMPLEMENTACAO.md`. Etapas 1/2/3/4/7+ permanecem bloqueadas
  por credenciais reais (fora do escopo de execução do agente).

## 19. Resolução do bloqueio arquitetural (§18) — ADR-015, Etapas 5/6 executadas (2026-07-22)

- **Decisão do responsável do projeto:** o Laravel serve o frontend a
  partir de `public/build`, origem única — sem domínio separado para a
  SPA. Registrada em
  `docs/adrs/ADR-015-frontend-servido-pelo-laravel.md` (contexto,
  mecânica, alternativas consideradas e rejeitadas, consequências).
- **Implementação (Etapas 5/6 de `PLANO_IMPLEMENTACAO.md`):**
  - `frontend/vite.config.ts` + novo script `npm run build:locaweb`
    (`frontend/package.json`) — `outDir`/`base` só mudam para
    `backend/public/build`/`/build/` sob `VITE_BUILD_TARGET=locaweb`;
    `npm run build` padrão continua gerando `dist/` sem mudança, para não
    quebrar o `Dockerfile` do frontend (dev local via `docker-compose.yml`)
    nem a validação do CI de testes.
  - `backend/routes/web.php` — rota catch-all substitui a antiga view
    placeholder `welcome` (removida, junto com
    `resources/views/welcome.blade.php` e `tests/Feature/ExampleTest.php`,
    ambos scaffold do Laravel sem uso real). Serve
    `public/build/index.html`; 404 com mensagem clara se o build não
    existir. Não captura `/api/*`/`/up` — validado por
    `tests/Feature/SpaCatchAllRouteTest.php` (novo) e manualmente via
    `php artisan serve`.
  - `backend/.env.production.example` — `SESSION_DOMAIN` sem ponto
    inicial (host único); `FRONTEND_URL`/`SANCTUM_STATEFUL_DOMAINS`
    documentados como a mesma origem de `APP_URL`.
  - `backend/config/cors.php` — comentário explicando que em produção
    (origem única) o CORS não é exercido pelo navegador; permanece só
    para o dev local cross-origin (`:5173` → `:8000`).
  - `.github/workflows/tear-v2-deploy.yml` (novo) — builda o frontend
    (`npm run build:locaweb`, gerando `backend/public/build`) e publica
    `backend/` inteiro via rsync/SSH para
    `releases/<id>/`, chamando `scripts/deploy-locaweb.sh`
    (novo) no host: `composer install --no-dev`, symlink de
    `.env`/`storage` compartilhados, `migrate --force`, cache de
    config/rotas/views, swap do symlink `current`. Falha rápido e visível
    se os secrets de SSH (`SSH_HOST`/`SSH_USER`/`SSH_PRIVATE_KEY`/
    `DEPLOY_BASE_PATH`) ainda não estiverem cadastrados — não configurados
    nesta sessão (credenciais reais, fora do alcance do agente).
  - `.github/workflows/tear-v2-docker.yml` — removido (`IMPLEMENTACAO_TECNICA.md`
    §9 já previa a aposentadoria; produção não consome mais imagem
    Docker). `docker-compose.yml` permanece intocado, só para dev local.
- **Validação:** backend 191/191 testes verdes (475 assertions, +3 novos
  testes de `SpaCatchAllRouteTest`), Pint limpo; frontend `tsc -b` e
  `oxlint` limpos (só o warning pré-existente de `auth.tsx:80`, não
  relacionado); `npm run build` (padrão) confirmado gerando `dist/` sem
  regressão; `npm run build:locaweb` confirmado gerando
  `backend/public/build/index.html` com assets sob `/build/`; roteamento
  ponta a ponta verificado com `php artisan serve` (`/`, `/build/assets/*`,
  `/api/health`, rota desconhecida da SPA — todas resolvendo como
  esperado).
- **Próximo passo:** nenhum bloqueio técnico remanescente nas Etapas 5/6.
  Etapas 1/2/3/4/7+ de `PLANO_IMPLEMENTACAO.md` continuam bloqueadas por
  credenciais/acesso reais (Locaweb, banco gerenciado, DNS, Google
  Workspace) — fora do alcance do agente, aguardando o responsável do
  projeto. Dívida já registrada e não tocada por esta ADR: `docs/deployment/DEPLOY.md`
  e `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` ainda descrevem o fluxo
  Docker/Coolify anterior (pendência de `IMPLEMENTACAO_TECNICA.md` §2,
  tratada em sessão própria antes da Etapa 11).

  > **Correção (§20, 2026-07-22):** a nota acima estava incorreta. Ambos os
  > documentos já haviam sido reescritos para o fluxo Locaweb/SSH no commit
  > `ef18225`, anterior a esta sessão — o texto de `IMPLEMENTACAO_TECNICA.md`
  > §2 que originou esta nota estava desatualizado, não os documentos em si.

## 20. Correção de referências desatualizadas + reavaliação do `PLANO_IMPLEMENTACAO.md` (2026-07-22)

- **Gatilho:** typo encontrado ao final da sessão anterior —
  `IMPLEMENTACAO_TECNICA.md` referenciava
  `ADR-015-frontend-servido-pelo-laravel-origem-unica.md` (arquivo
  inexistente); o real é `ADR-015-frontend-servido-pelo-laravel.md`.
  Corrigido, e confirmado que não havia outra ocorrência do nome errado no
  repositório.
- **Achado maior durante a reavaliação:** `IMPLEMENTACAO_TECNICA.md` §2/§3/§6/
  §9/§10/§12 estava inteiro desatualizado — escrito como mapeamento
  prospectivo (2026-07-21) e nunca atualizado depois que os commits
  `29a8306` e `ac5180f` implementaram praticamente tudo que a tabela listava
  como "precisa ajustar"/"precisa criar". Corrigido item a item com
  referência ao commit que resolveu cada um.
- **Achado específico:** a alegação repetida em três lugares
  (`IMPLEMENTACAO_TECNICA.md` §2/§12 e `PLANO_IMPLEMENTACAO.md` Etapa 11) de
  que `docs/deployment/DEPLOY.md` e
  `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` "ainda descrevem o fluxo
  Docker/Coolify antigo" estava **errada** — ambos já haviam sido reescritos
  no commit `ef18225` (anterior até à criação de `IMPLEMENTACAO_TECNICA.md`
  em `59ca61a`). Ninguém voltou para atualizar a nota depois. Corrigido nos
  três lugares; único ajuste real necessário em `DEPLOY.md` foi alinhar a
  chamada de build (`npm run build` → `npm run build:locaweb`, ADR-015).
- **`PLANO_IMPLEMENTACAO.md`:** adicionada nota de status no topo (Etapas
  5/6 executadas) e STATUS ao final de cada uma das duas etapas, sem alterar
  o runbook das Etapas 1-4/7-12 (continuam não executadas, corretamente).
- **Reavaliação completa das Etapas 1-12** (pedido explícito desta sessão):
  confirmado que **todo** o trabalho tecnicamente possível sem acesso
  externo está feito. As únicas pendências reais são infraestrutura/
  credenciais que o agente não possui — detalhe etapa a etapa em
  `IMPLEMENTACAO_TECNICA.md` §12 (resumo consolidado, reescrito nesta
  sessão) e na resposta desta sessão ao usuário.
- **Nenhum código alterado nesta sessão** — só documentação (correção de
  referências e reavaliação de status). Nenhuma tarefa técnica nova estava
  disponível para executar sem credenciais; nenhum trabalho foi inventado.
- **Validação:** `grep` confirmou zero ocorrências residuais do nome de
  arquivo incorreto; suíte de testes não foi re-executada por não haver
  mudança de código nesta sessão.
- **Próximo passo:** aguardando exclusivamente o responsável do projeto
  (credenciais Locaweb/banco/DNS/Google Workspace, secrets do GitHub
  Actions). Sem esses insumos, não há próxima tarefa de engenharia
  disponível no TEAR V2 além de manutenção/observação.

## 21. Auditoria funcional do MVP + correção de 1 bug real + revisão de menu (2026-07-22)

- **Gatilho:** usuário reportou 404 ao acessar o portal via Laravel em
  dev (`npm run dev` + `php artisan serve`) — investigado como possível
  regressão de ADR-015. Diagnóstico: não é regressão (`/` nunca serviu o
  portal real nesse modo, antes era a view `welcome`) — dev sempre foi
  acessado via `:5173` (Vite). Corrigido só a mensagem de 404 (mandava
  rodar `npm run build`, que gera `dist/`, não `public/build/index.html`
  — só `build:locaweb` faz isso) e adicionado aviso específico em
  ambiente local.
- **Auditoria funcional completa do MVP** (código real, não documentação)
  pedida pelo usuário: mapeou todos os itens de menu do Admin e do Portal
  da Influenciadora contra a implementação real. Achados principais:
  - **Bug real e crítico, corrigido:** `PortalCampanhasListPage.tsx`
    acessava `campanha.participacoes[0]` sem guarda; `CampanhaController::index()`
    não fazia eager-load de `participacoes`; `CampanhaResource::whenLoaded`
    omitia a chave inteira do JSON; sem `ErrorBoundary` em `main.tsx`, a
    SPA inteira quebrava ao abrir "Campanhas" no Portal — sempre que a
    influenciadora tinha ao menos uma campanha real (caminho feliz, não
    caso de borda). Corrigido: `CampanhaController::index()` agora
    eager-carrega `participacoes` (escopada por parceira quando
    não-ADMIN, mesmo padrão do `show()`); frontend ganhou `?.` defensivo.
    Teste de regressão: `CampanhaTest::test_lista_de_campanhas_inclui_participacoes_da_propria_influenciadora`.
    Validado ao vivo no navegador (login como influenciadora, campanha
    real, "ver" abre a participação sem crash).
  - **Falso positivo da própria auditoria, corrigido antes de agir:**
    `MedidaController::store` sempre cria um novo registro em vez de
    fazer update — isto **não é bug**. Existe teste dedicado
    (`MedidaInfluenciadoraTest::test_nova_medida_nao_sobrescreve_a_anterior_e_medida_atual_e_a_mais_recente`)
    e um accessor `Parceira::medidaAtual()` — histórico de medidas é
    design deliberado e testado. Nenhuma mudança feita neste controller;
    decisão de transformar em update-in-place fica para o responsável do
    projeto, se quiser abrir mão do histórico.
  - **9 itens de menu do Admin** (Colaborações, Briefings, Materiais,
    Aprovações, Logística, Pagamentos, Documentos, Histórico, Perfil)
    prometiam telas que não existem como visão própria (a maioria
    redirecionava para `/campanhas`; 4 eram `PlaceholderPage` "Em
    construção"). **Decisão do usuário:** não remover nada da
    arquitetura/rotas/componentes — só desabilitar a navegação no menu,
    rotulando `"Item (em breve)"`, sem link. Implementado em
    `AppShell.tsx` (`NAV_ITEMS` sem `to` para esses 9 itens); `App.tsx`,
    `PlaceholderPage.tsx`/`.module.css` e as rotas de drill-down
    (`/participacoes/:id/briefing|materiais|pagamento|envio`, já
    funcionais) permanecem intactos. Dois cards estáticos do Dashboard
    admin ("Colaborações", "Financeiro") tiveram só o texto trocado para
    "Em breve — indicador ainda não implementado" (antes soava como dado
    real).
  - **`GESTOR_MARCA`:** papel seedado mas sem nenhuma tela alcançável
    (não há UI de criação de usuário com esse papel) — `CampanhaController`/
    `ParceiraController` retornam vazio ou 403 para ele. Sem risco ativo
    hoje (já registrado como P1 em `GO_LIVE_CHECKLIST.md`); não é
    bloqueio de MVP.
- **Validação:** backend 192/192 verde (478 assertions), Pint limpo,
  `tsc -b`/`vite build`/`oxlint` do frontend limpos. Verificação visual
  no navegador (login admin e influenciadora) confirmando o menu reduzido
  e o fluxo antes quebrado agora funcional.
- **Próximo passo:** MVP funcionalmente pronto para a fase de
  infraestrutura (ver §22).

## 22. Consolidação do plano de implantação (Go-Live) (2026-07-22)

- **Pedido:** inventário completo de dependências de infraestrutura
  externa, em ordem de execução, com objetivo/dependências/onde
  configurar/como validar/critérios de aceite por item, consolidado num
  `PLANO_DE_IMPLANTACAO.md`.
- **Criado:** `docs/deployment/PLANO_DE_IMPLANTACAO.md` — documento único
  de execução do Go-Live, 17 etapas (domínio → acesso Locaweb → Postgres
  → DNS → Google Drive → SMTP → `APP_KEY` → `.env` real → secrets do
  GitHub → estrutura de diretórios no host → primeiro deploy →
  provisionar admin → backup → fila/scheduler → uptime check → smoke
  test → corte para produção), mais rollback e rotina pós-go-live.
  Nenhuma decisão de arquitetura reaberta — consolida e corrige (não
  substitui) `PLANO_IMPLEMENTACAO.md`, `CONFIGURACAO_PRODUCAO.md`,
  `DEPLOY.md` e `GO_LIVE_CHECKLIST.md`.
- **Achado durante a consolidação:** `CONFIGURACAO_PRODUCAO.md` e
  `MONITORING.md` ainda tinham comandos de exemplo da arquitetura Docker
  anterior (ex.: `docker compose run --rm app php artisan key:generate`),
  nunca atualizados quando `ARQUITETURA_PRODUCAO.md` (2026-07-21) mudou
  para Locaweb sem Docker. Corrigido o comando de `APP_KEY` em
  `CONFIGURACAO_PRODUCAO.md`; adicionada nota de ponteiro no topo dos 4
  documentos consolidados (nenhum arquivo foi apagado ou arquivado — só
  o `PLANO_DE_IMPLANTACAO.md` passa a ser a ordem de execução oficial).
- **Nenhum código alterado** — só documentação (consolidação +
  correção de referências desatualizadas), conforme instrução explícita
  do usuário ("não implemente novas funcionalidades... apenas atividades
  de implantação, configuração, segurança, validação e operação").
- **Próximo passo:** aguardando o responsável do projeto executar as
  Etapas 1-10 de `PLANO_DE_IMPLANTACAO.md` (decisões e credenciais
  externas) — nenhuma delas pode ser feita pelo agente.

## 23. Etapa 1 do Go-Live concluída — domínio definitivo (2026-07-22)

- **Decisão do responsável do projeto:** subdomínio definitivo de
  produção é **`influencia.estudioela.com`** (substitui o exemplo
  ilustrativo `tear.estudioela.com` usado em todos os documentos até
  esta data).
- **Propagado em código/documentação:**
  `backend/.env.production.example` (`APP_URL`,
  `FRONTEND_URL`, `SANCTUM_STATEFUL_DOMAINS`, `SESSION_DOMAIN`
  preenchidos com o valor real, restam só os `CHANGE_ME` que dependem de
  credencial externa), `docs/deployment/PLANO_DE_IMPLANTACAO.md` (Etapa
  1 marcada concluída, placeholders `<subdomínio>` substituídos pelo
  valor real nas Etapas 4/11/12/15), `docs/deployment/ARQUITETURA_PRODUCAO.md`
  §8/§12, `docs/deployment/DEPLOY.md`,
  `docs/adrs/ADR-015-frontend-servido-pelo-laravel.md` (só o exemplo
  ilustrativo — decisão de arquitetura não reaberta),
  `docs/deployment/PLANO_IMPLEMENTACAO.md` (histórico, todas as
  ocorrências do exemplo antigo substituídas para não confundir consulta
  futura).
- **Não alterado:** `docs/deployment/CONFIGURACAO_PRODUCAO.md` (usa um
  exemplo de domínio ainda mais antigo, `tear.com.br`/arquitetura
  multi-subdomínio — já documentado como rewrite integral pendente, não
  é bloqueio, fora do escopo desta etapa) e §21 deste documento
  (histórico da sessão anterior, preservado sem alteração).
- **Nenhum código de funcionalidade alterado** — só configuração/
  documentação, conforme mandato desta fase.
- **Próximo passo:** Etapa 2 de `PLANO_DE_IMPLANTACAO.md` — confirmar
  acesso SSH + painel da Locaweb (depende do responsável do projeto).

## 24. Auditoria do painel Locaweb — Etapa 2 parcialmente validada (2026-07-22)

- **Pedido:** auditoria read-only completa do painel Locaweb (sem alterar
  nada), gerando `docs/deployment/AUDITORIA_LOCAWEB.md`.
- **Achado estrutural:** a conta Locaweb tem **duas hospedagens Linux
  ativas** — `elafashionmkt.com.br` (agência) e `estudioela.com` (alvo do
  TEAR) — mesmo plano (Hospedagem I Linux), mesma data de contratação.
  Confirma que a hospedagem-alvo já existe e é compatível com o TEAR
  **sem upgrade de plano nem custo adicional** (mantém a restrição
  soberana de `ARQUITETURA_PRODUCAO.md` §0).
- **Confirmado no painel:** PHP 8.3 ativo, PostgreSQL disponível (0/10
  bancos usados), Crontab nativo disponível, SSL Let's Encrypt gratuito,
  WAF ativa por padrão, backup nativo não ativado. DNS de `estudioela.com`
  ainda **não está apontado** para a Locaweb (SSL bloqueado com "DNS
  Pendente" em consequência).
- **Dois achados críticos que corrigem premissas de `ARQUITETURA_PRODUCAO.md`
  §3 e `PLANO_DE_IMPLANTACAO.md` Etapa 2:**
  1. SSH vem **desabilitado por padrão**, sessão de 3h, renovação manual,
     autenticação por **senha** (não por chave, ao contrário do que a
     Etapa 2 do plano assumia). Afeta diretamente o workflow já commitado
     em `.github/workflows/tear-v2-deploy.yml`/`scripts/deploy-locaweb.sh`
     (Etapas 5/6, `ac5180f`), que presume SSH automatizado por chave.
  2. "Publicar via Git" do painel **não é deploy real** — é só um template
     de GitHub Action que faz upload FTP do `dist/`, sem executar
     `composer install`/`artisan migrate` remotos.
- **Nenhuma configuração foi alterada** — SSH não foi habilitado, nenhum
  banco/domínio/SSL foi criado, conforme instrução explícita do
  responsável do projeto durante a auditoria.
- **`PLANO_DE_IMPLANTACAO.md` Etapa 2 atualizada** com nota de status
  apontando para `AUDITORIA_LOCAWEB.md` — etapa marcada como
  **parcialmente validada**: compatibilidade de plano confirmada, mas a
  validação via SSH (`php -v`, `composer`, `crontab -l`, conexão Postgres)
  continua pendente porque exige habilitação manual do SSH pelo
  responsável do projeto.
- **Decisão de arquitetura ainda em aberto** (não resolvida nesta sessão,
  por instrução — "não iniciar nenhuma nova etapa da implantação"):
  estratégia de deploy dado que SSH é temporário/por senha e "Git" é só
  FTP. Detalhe e opções em `AUDITORIA_LOCAWEB.md` §5.
- **Próximo passo:** responsável do projeto habilita o SSH no painel
  Locaweb (hospedagem `estudioela.com`) para fechar a validação técnica da
  Etapa 2 (Composer, quota de disco, conexão Postgres) — em paralelo,
  decidir a estratégia de deploy antes de a execução chegar às Etapas 9–11
  (secrets, estrutura de diretórios e primeiro deploy).

## 25. Consolidação documental pós-auditoria — 4 frentes em paralelo (2026-07-22)

- **Pedido:** esclarecimento do responsável do projeto sobre a origem de
  `estudioela.com` (domínio migrado do WordPress.com, hospedagem cancelada
  lá — explica a divergência de faturamento do §24, sem risco), seguido de
  instrução para acelerar via subagentes: revisão de consistência
  documental, checklist técnico Laravel/React × infra real, análise de
  estratégia de deploy, e QA documental (links/referências cruzadas).
  Todos os 4 rodaram em modo leitura/análise; os ajustes foram aplicados
  por este agente depois de revisar os achados.
- **Item de faturamento do §24 fechado:** `AUDITORIA_LOCAWEB.md` §1.3/§4.6
  e checklist §5 atualizados — não é mais pendência.
- **Achados corrigidos na documentação:**
  - `PLANO_DE_IMPLANTACAO.md` Etapa 2 e Etapa 9 tinham contradição interna
    — o texto novo da Etapa 2 (adicionado nesta sessão) já corrigia a
    premissa de SSH por chave, mas o texto original da própria Etapa 2
    (dependências/critérios de aceite) e a Etapa 9 inteira (secrets
    `SSH_PRIVATE_KEY`/`authorized_keys`) ainda assumiam chave. Corrigido
    com notas de status, sem reescrever o runbook original (preservado
    como registro do desenho anterior).
  - Referência de etapa errada ("Etapa 6" tratada como a etapa de
    deploy) corrigida para "Etapas 9–11" em `AUDITORIA_LOCAWEB.md` (3
    ocorrências) e `PLANO_DE_IMPLANTACAO.md`/`ESTADO_SESSAO.md` — Etapa 6
    é na verdade "Confirmar/contratar SMTP".
  - `PLANO_IMPLEMENTACAO.md` e `IMPLEMENTACAO_TECNICA.md` (documentos
    arquivados/de referência): notas de correção adicionadas sobre SSH por
    chave; `IMPLEMENTACAO_TECNICA.md` também tinha placeholder de domínio
    desatualizado (`<subdomínio-escolhido>.estudioela.com`,
    `SESSION_DOMAIN=.estudioela.com` com ponto) — corrigido para o valor
    definitivo (`influencia.estudioela.com`, host exato).
  - `docs/deployment/MONITORING.md`: referência cruzada quebrada
    (`DEPLOY.md` §7 → correto é §8) corrigida.
  - `PLANO_DE_IMPLANTACAO.md`: lista de referências ao `TASK_ROUTER.md`
    estava desatualizada (`§18–§21`, faltavam §22/23/24) — corrigida.
  - `ARQUITETURA_PRODUCAO.md` §14 (riscos): nova linha registrando o
    achado de execução (SSH temporário/senha, Git=FTP) sem reabrir nenhuma
    decisão de hospedagem/banco/storage.
- **Checklist técnico Laravel/React × infra real** (extensões PHP, fila,
  scheduler, sessão/Sanctum, `TRUSTED_PROXIES`, SMTP, Node/npm em build
  time) incorporado em `AUDITORIA_LOCAWEB.md` §2.1 — novo pendente
  encontrado: IP/CIDR do proxy reverso da Locaweb para `TRUSTED_PROXIES`
  ainda não levantado.
- **Recomendação de estratégia de deploy** incorporada em
  `AUDITORIA_LOCAWEB.md` §5.1: modelo híbrido (FTP automatizado via CI
  para código/build/`vendor/`; SSH manual só para `migrate`/cache quando
  há mudança de schema/dependência) — recomendação para decisão do
  responsável do projeto, não implementada.
- **Nenhum código alterado, nenhuma nova etapa de implantação iniciada,
  nenhum deploy feito** — só consolidação documental, conforme instrução
  explícita desta sessão.
- **Próximo passo:** igual ao registrado no §24 — habilitar SSH para
  fechar a Etapa 2, e decidir a estratégia de deploy (recomendação em
  `AUDITORIA_LOCAWEB.md` §5.1) antes das Etapas 9–11.

## 26. Encerramento da sessão — HANDOFF_GO_LIVE.md (2026-07-22)

- Auditoria final ampla do repositório (fora do escopo de deployment já
  coberto em §24/§25): sem inconsistência entre backend/frontend/docs
  (rotas de API, RBAC), sem TODOs esquecidos, sem workflow de CI órfão.
  Achados de baixa prioridade, não bloqueiam o Go-Live: 2 documentos de
  planejamento órfãos/desatualizados (`docs/architecture/DATABASE_MODEL.md`,
  `docs/domain/TEAR.md`, sobrepostos a conteúdo já arquivado) e 4 git
  worktrees obsoletos em `.claude/worktrees/` (branches já mescladas) —
  nenhum dos dois foi alterado/removido, aguardam decisão do responsável
  do projeto.
- Gerado `docs/reports/HANDOFF_GO_LIVE.md` — documento único de handoff
  desta fase (objetivo da próxima sessão, estado atual, decisões
  tomadas/pendentes, riscos, ordem de execução recomendada), referenciando
  o commit `93578f5`.
- **Por instrução explícita do responsável do projeto, `ESTADO_SESSAO.md`
  e `HANDOFF_GO_LIVE.md` ficaram pendentes de commit** ao final desta
  sessão — próxima sessão decide se commita.
- **Próximo passo:** igual ao §25 — habilitar SSH, decidir estratégia de
  deploy. Adicionalmente, decidir sobre o commit pendente destes 2
  arquivos de encerramento.

## 27. PostgreSQL confirmado indisponível no plano Hospedagem I da Locaweb (2026-07-22)

- **Fato novo, via suporte oficial da Locaweb:** o plano **Hospedagem I**
  (o plano ativo para `estudioela.com`) **não oferece PostgreSQL**. Isso
  invalida a premissa registrada em `AUDITORIA_LOCAWEB.md` (auditoria de
  painel, §25/commit `93578f5`) de que PostgreSQL estava confirmado
  disponível (0/10 bancos usados) — o painel mostrava a opção, mas o
  plano contratado não a habilita de fato.
- **Pendência anterior** ("reconciliar se PostgreSQL está de fato
  disponível ou não", registrada na sessão de validação local de
  2026-07-22, ver commit `076d7f4`) **encerrada** por esta confirmação.
- **Nova pendência, bloqueante para a Etapa 3** (criar banco de produção)
  do `PLANO_DE_IMPLANTACAO.md`: definir a estratégia de infraestrutura —
  upgrade para Hospedagem II/III da Locaweb ou contratar PostgreSQL
  externo (ex.: serviço gerenciado). Decisão do responsável do projeto;
  impacto de custo/cronograma ainda não orçado.
- **Nenhum código alterado.** Só documentação: `ESTADO_SESSAO.md`
  atualizado em dois commits separados — `076d7f4` (reescrita pendente de
  sessão anterior, sobre a validação do ambiente local, commitada isolada)
  e `feab0b7` (correção exclusiva desta pendência de PostgreSQL). Ambos
  pushados para `origin/feat/ui-design-system-ela`.
- **Próximo passo:** decidir a estratégia de infraestrutura do PostgreSQL
  (bloqueia Etapa 3); em paralelo, habilitar SSH para fechar a Etapa 2
  (IP/CIDR do proxy reverso, host/porta SMTP — checklist em
  `AUDITORIA_LOCAWEB.md` §2.1).

## 28. Missão de simplificação documental — auditoria completa + Fase 1 executada (2026-07-22)

- **Nova frente** (instrução explícita do responsável do projeto, "TEAR
  V2.5 — MISSÃO DE SIMPLIFICAÇÃO DOCUMENTAL"): auditoria completa dos 102
  arquivos `.md` do projeto (98 em `docs/` + 4 na raiz), visando reduzir
  manutenção sem perder conhecimento. Dois relatórios gerados (**ainda não
  commitados** — ver pendência abaixo): `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`
  e `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md`.
- **Classificação inicial** (auditoria estrutural: nomes, pastas,
  cabeçalhos, cross-reference): MANTER 47 / CONSOLIDAR 5 / ARQUIVAR 48 /
  REMOVER 2.
- **Achado estrutural relevante:** um cluster de 8 arquivos (`DATA_MODEL.md`,
  `DATABASE_MODEL.md`, `DOMAIN.md`, `TEAR.md`, `MIGRATION.md`,
  `SCREEN_MAP.md`, `STITCH_PROTOTYPE.md`, `UX_FLOW.md` — juntos ~32.318
  linhas) descreve um domínio teórico (Aggregate Roots "Competência"/
  "Colaboração_Mensal") gerado antes de qualquer código existir, sem
  correspondência em nenhum dos dois sistemas reais (confirmado por grep:
  zero ocorrência dessas entidades em `tear-v2-app/` ou no GAS legado).
- **Validação de conteúdo contra o código real** (não só estrutural)
  corrigiu 3 das 5 classificações originais de CONSOLIDAR no plano
  executivo:
  - `docs/deployment/IMPLEMENTACAO_TECNICA.md`: CONSOLIDAR→**ARQUIVAR**
    (`PLANO_DE_IMPLANTACAO.md` já declara mantê-lo como referência técnica
    detalhada, não substituível).
  - `docs/design/DESIGN_SYSTEM.md`: CONSOLIDAR→**REMOVER** (paleta
    `#BC0004`/`#FAF8F6` nunca implementada).
  - `docs/design/stitch-export/DESIGN.md`: CONSOLIDAR→**MANTER** —
    confirmado por grep em `frontend/src/index.css` como a
    fonte real de tokens de design já implementada (`#9f0003`/`#cd0005`/
    `#fef8f8`). **Decisão pendente do responsável do projeto:** promover
    formalmente este arquivo a fonte oficial via atualização do status do
    `ADR-002` (hoje "Proposed") — não decidido nesta sessão.
  - `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`: mantido
    CONSOLIDAR→`BACKLOG_FUNCIONAL_V2_6.md`, mas risco elevado a
    médio-alto — a seção de recorrência/parcelamento de pagamento
    (autodescrita como "decisão de maior alavancagem pendente") não está
    carregada no backlog vigente; consolidar sem extrair essa seção
    primeiro perderia uma decisão de negócio real ainda em aberto.
- **Fase 1 do plano executivo (arquivamento de baixo risco) parcialmente
  executada**, por decisão explícita do responsável do projeto de
  restringir o escopo ao cluster já validado:
  - Validação em duas rodadas adicionais (amostragem de conteúdo cruzada
    contra `CONTRATO_SOBERANO.md`/ADRs/SPECs/migrations/models/páginas
    reais + amostragem distribuída específica de `UX_FLOW.md` em 0/25/50/
    75/100%) confirmou confiança alta e ausência de informação exclusiva
    nos 8 arquivos, inclusive nas seções que cobrem módulos ainda não
    implementados no sistema real (Logística, Contratos, Histórico).
  - Executado: `git mv` dos 8 arquivos para
    `docs/archive/planejamento-pre-codigo/` (histórico preservado via
    rename, commit `08366b4`); `docs/archive/README.md` atualizado com a
    nova seção.
  - `README.md` (raiz) tinha referência obsoleta a 2 desses arquivos
    (`DOMAIN.md`, `DATA_MODEL.md`) como leitura recomendada de
    arquitetura — removida (não redirecionada ao archive, para não
    indicar material arquivado como leitura obrigatória) em commit
    isolado `e9574ed`.
  - Verificação final (grep no repositório inteiro) confirmou nenhuma
    referência remanescente a `DOMAIN.md`/`DATA_MODEL.md` fora de
    `docs/archive/` e dos próprios relatórios de auditoria/plano.
- **Itens do plano ainda não executados** (aguardando decisão/priorização
  do responsável do projeto):
  - Fase 1 (restante): 2 roadmaps superados (`ROADMAP_MESTRE_TEAR_V2.md`,
    `TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md`),
    `docs/governance/REPOSITORY_GOVERNANCE_AUDIT.md`,
    `RELATORIO_CONSOLIDACAO_AUDITORIAS.md` (raiz).
    `PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` — **concluído (2026-07-23,
    ver §39):** ADR-018 escrita extraindo a decisão P0-2 real (subconjunto
    bem mais estreito do que o plano propunha), documento arquivado em
    `docs/archive/pagamento-snapshot/`.
  - Fase 2: 3 remoções diretas já validadas
    (`docs/reports/STATUS_MVP_OPERACIONAL_TEAR_V2.md`,
    `docs/reports/RELATORIO_SPRINT_ESTABILIZACAO_TEAR_V2.md`,
    `docs/design/DESIGN_SYSTEM.md`).
  - Fase 3: 2 consolidações (`UI_RULES.md`→ADR-002;
    `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`→`BACKLOG_FUNCIONAL_V2_6.md`,
    com extração de conteúdo primeiro) — depende de decisão humana sobre
    a fonte oficial de tokens de design.
  - Fase 4: arquivamento de docs de deployment/release (recomendado só
    após o corte de produção do Go-Live) + correções de conteúdo em
    `README.md`/`PROJECT_GOVERNANCE.md` + remoção de `docs/governance/`
    da árvore ativa.
- **Pendência de commit:** `docs/reports/AUDITORIA_SIMPLIFICACAO_DOCUMENTAL.md`
  e `docs/reports/PLANO_EXECUTIVO_SIMPLIFICACAO_DOCUMENTAL.md` seguem
  como arquivos não rastreados (`??`) — não commitados nesta sessão por
  não ter sido pedido explicitamente; decisão de committar ou não fica
  para a próxima sessão.
- **Nenhuma decisão de arquitetura de código foi tomada ou reaberta** —
  trabalho exclusivamente documental, sem tocar `tear-v2-app/` nem `src/`.
- **Próximo passo:** decidir se a próxima sessão continua a Fase 2/3/4 da
  simplificação documental ou retoma a frente de Go-Live (estratégia de
  infraestrutura do PostgreSQL, §27, ainda em aberto e bloqueante para a
  Etapa 3).

## 29. Mudança de prioridade: auditoria funcional do MVP antes do Go-Live (2026-07-22)

- **Decisão do responsável do projeto:** antes de retomar a preparação do
  ambiente de produção (Frente B / Go-Live, §24/§27), o projeto exige uma
  certificação funcional do MVP — comparação direta entre a especificação
  funcional (`docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`,
  2026-07-20) e o estado real do código de `tear-v2-app/`. **A frente de
  Go-Live fica pausada** até essa certificação e a execução do backlog
  dela resultante.
- **Sessão iniciada na Frente B (Go-Live)** — levantamento consolidado
  (não persistido em arquivo, só no histórico da conversa desta sessão):
  cruzamento entre o branch atual e a auditoria não mesclada
  `docs/reports/AUDITORIA_FINAL_MVP.md` (branch
  `worktree-agente-b-deploy-infra`, PR #62 aberto e `CONFLICTING` —
  veredito daquela auditoria: NO GO de implantação, GO COM RESSALVAS de
  produto, 4 bloqueadores técnicos de deploy). **Achado verificado por
  leitura direta de código nesta sessão:** `.github/workflows/tear-v2-deploy.yml`
  ainda autentica via `SSH_PRIVATE_KEY`, mas `AUDITORIA_LOCAWEB.md §4.1`
  confirma que o painel Locaweb só aceita senha/temporário — `ADR-016`
  resolveu Composer-ausente e disparo-automático, mas **não** essa
  incompatibilidade de autenticação, apesar de o §27 acima sugerir que a
  estratégia de deploy já estava fechada. Também confirmado:
  `scripts/restore-db.sh` ainda roda `docker compose exec`
  (Docker não existe na arquitetura Locaweb) — assimetria com
  `backup-db.sh`, já migrado. Nenhum desses achados foi corrigido nesta
  sessão, só documentado.
- **Pivô para auditoria funcional** — nova auditoria produzida e salva em
  `docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md` (ainda não
  commitada). Método: comparação direta contra código (migrations/models/
  controllers/rotas/frontend), verificado via 4 subagentes paralelos
  (autorizado pelo responsável do projeto para acelerar a auditoria) +
  verificações diretas complementares — não uma leitura passiva de
  documentação.
- **Achado central:** o spec de 07-20 estava defasado **a favor** do
  sistema em pontos centrais — congelamento de Participação
  (`congelado_em`), Briefing reorganizado em 1:N por tipo, vínculo
  estrutural Material↔Briefing (`briefing_id`), cálculo automático da
  data de aprovação do Briefing, e **o Portal completo da Influenciadora**
  (Campanhas/Briefing/Materiais/Pagamento, isolamento testado) — todos já
  implementados e funcionais, contradizendo tanto o spec de 07-20 quanto
  uma leitura apressada da auditoria paralela de 07-22 (que também tinha
  imprecisões pontuais, ex.: atribuía o teste de isolamento de Materiais
  ao arquivo errado).
- **Classificação resultante** (conformidade aproximada do núcleo do MVP:
  ~75-80%): Conforme — Cadastro, Campanhas, Briefings, Materiais, Portal
  da Influenciadora, locale `pt_BR`. Parcialmente conforme — Participações
  (recorrência de pagamento indecidida), Pagamentos (comprovante
  ausente), Logística (backend pronto, item de menu quebrado). Não
  implementado por decisão de escopo já aceita — Contratos, Produtos/
  Variantes, Assessorias, Métricas, Histórico admin. Não reverificado
  nesta sessão — RBAC de leitura granular administrativo.
- **5 bloqueadores funcionais priorizados** (detalhe de impacto/esforço em
  `AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md`): (1) decisão de
  recorrência de pagamento — P0, bloqueia por ser decisão, não
  implementação; (2) item de menu de Logística quebrado — P0, esforço
  baixo, maior retorno por esforço do backlog inteiro; (3) confirmação do
  RBAC de leitura granular — P0, bloqueador de segurança até confirmado;
  (4) comprovante de pagamento — P1, esforço baixo; (5) exposição do
  histórico de alteração (`historico_alteracoes`) numa tela admin — P1,
  esforço baixo.
- **Nenhum código alterado, nenhuma correção implementada, nenhum commit
  adicional nesta sessão** — missão explicitamente restrita a
  diagnóstico, por instrução do responsável do projeto.
- **Próximo passo:** executar o backlog funcional (começando pelos 3 P0,
  em ordem de menor risco/maior retorno primeiro), depois os P1 de
  esforço baixo. Só então retomar a Frente B (Go-Live), a partir do
  levantamento desta sessão, incluindo a reconciliação pendente do PR #62
  e a correção da incompatibilidade de autenticação SSH no pipeline de
  deploy.

## 30. Execução do backlog funcional — RBAC verificado, comprovante de pagamento implementado, residuais de Cadastro fechados (2026-07-22)

- **Achado de drift, corrigido por leitura de código antes de agir:** entre
  o fim da sessão anterior (`ESTADO_SESSAO.md`, HEAD `c7f753e`) e o início
  desta, 3 commits já haviam resolvido parte do backlog do §29 sem
  atualização dos documentos de estado: `aea82d6` (P0 #2 — menu de
  Logística destravado com `LogisticaPage` própria), `9824b7b` (parte do
  P1 #6 — deduplicação de nome de Parceira case-insensitive), `a241186`
  (P1 #4 — histórico de alteração exposto para admin). Verificado por
  `git log --stat` antes de reportar como concluído.
- **RBAC de leitura granular (P0 #3) — verificado, nenhuma correção
  necessária:** leitura de todos os controllers (`ParceiraController`,
  `MedidaController`, `HistoricoAlteracaoController`, `MarcaController`,
  `CampanhaController`, `ParticipacaoController`, `BriefingController`,
  `MaterialController`, `PagamentoController`, `EnvioController`,
  `MeParticipacaoController`) confirma que toda rota GET chama
  `$this->authorize('view'|'viewAny', ...)` contra uma Policy real
  (`ParceiraPolicy`/`CampanhaPolicy`/`ParticipacaoNaCampanhaPolicy`/
  `MarcaPolicy`), com `Gate::before` (`AppServiceProvider.php`) liberando
  ADMIN e as Policies restringindo os demais papéis por posse
  (`user_id`/participação `ATIVA`). O texto do spec de 07-20 ("toda rota
  GET exige só `auth:sanctum`") está desatualizado — o RBAC granular já
  existe e está coberto por teste (`RbacIsolamentoTest`, `PortalIsolamentoTest`).
  Suíte completa 196/196 verde antes de prosseguir. **Este item passa de
  P0 pendente para resolvido, sem nenhuma alteração de código.**
- **Comprovante de pagamento (P1 #5) — implementado:** novo endpoint
  `POST /pagamentos/{pagamento}/comprovante` (`role:ADMIN`), reaproveitando
  a mesma abstração (`GoogleDriveService`) já usada para upload de
  Materiais — pasta `Comprovantes` dentro da estrutura parceira/campanha
  já existente no Drive. Migration nova (`comprovante_drive_file_id`,
  `comprovante_drive_file_url` em `pagamentos`), `PagamentoResource` expõe
  `comprovante_url`. Frontend: `PagamentoPage` (admin) ganha formulário de
  upload/link; `PortalParticipacaoPage` (influenciadora) exibe o link
  somente leitura. 2 testes novos; suíte completa 198/198 verde, Pint
  limpo, `tsc -b`/`oxlint`/`vite build` do frontend limpos. Commit
  `fabd5c1`.
- **Residuais de Cadastro (parte do P1 #6):**
  - Deduplicação de nome: já resolvida no commit `9824b7b` (ver acima) —
    nenhuma ação adicional.
  - `authorize()` ausente em `POST /parceiras/cadastro` administrativo —
    **falso positivo, confirmado por leitura de código + teste já
    existente e verde** (`ParceiraController::store` chama
    `$this->authorize('create', Parceira::class)`, rota tem
    `middleware('role:ADMIN')`, e `ParceiraTest::test_usuario_sem_role_admin_nao_pode_criar_parceira`
    cobre o caso). A rota pública (`CadastroPublicoController::store`,
    sem `authorize()`) é intencionalmente aberta — cadastro de candidata
    sem sessão, conforme comentário já existente em `ParceiraPolicy`.
    Nenhuma alteração necessária.
  - **Validação de formato do Instagram — não implementada, decisão de
    produto pendente:** o próprio `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`
    (linhas ~142-146) já registra que nenhuma fonte define o formato
    aceito (com/sem `@`, handle vs. URL). Não é um objetivo técnico
    fechável sem essa decisão — documentado aqui, não implementado, por
    instrução explícita do responsável do projeto de não investir em
    itens que dependem de decisão de negócio nesta sessão.
- **Backlog restante do §29, em ordem:**
  1. 🟠 Decisão de recorrência/parcelamento de pagamento (P0) — segue
     bloqueada, decisão do responsável do projeto.
  2. 🟠 Formato de validação do Instagram — decisão do responsável do
     projeto (novo item, achado nesta sessão).
  3. Reconciliar `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` com o estado
     real (P1, baixa prioridade) — por instrução do responsável do
     projeto, só ao final desta sessão, se sobrar tempo.

## 31. Reconciliação da especificação funcional — backlog do §29 encerrado (2026-07-22)

- **Reconciliação produzida:** `docs/reports/RECONCILIACAO_ESPECIFICACAO_FUNCIONAL_MVP.md`
  (commit `209bf32`) — por instrução explícita do responsável do projeto,
  **não** reescreve `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`; produz só
  uma tabela de divergências (módulo / especificação atual / implementação
  atual / status / evidência / ação recomendada), verificada por leitura
  direta de código (migrations/models/controllers/rotas/testes), sem
  reprocessar os 13 documentos-fonte originais.
- **11 divergências encontradas**, 9 classificadas **"Especificação
  desatualizada"** (spec defasada a favor do sistema, não bug) e 2
  **"Parcial"**:
  - Especificação desatualizada: Portal completo da Influenciadora
    (Campanhas/Briefing/Materiais/Pagamento); RFC-07 (envio de material
    pelo próprio Portal); congelamento de Participação (`congelado_em`);
    vínculo estrutural Material↔Briefing + vocabulário unificado; RBAC de
    leitura granular (verificado nesta sessão, ver §30); comprovante de
    pagamento (implementado nesta sessão, ver §30); `APP_LOCALE=pt_BR`
    (spec ainda citava `en`); deduplicação de nome de Parceira (resolvida
    antes desta sessão); `POST /parceiras/cadastro` administrativo sem
    `authorize()` (falso positivo — confundia a rota pública,
    intencionalmente sem `authorize()`, com a administrativa, que já tem
    `role:ADMIN` + `$this->authorize('create', ...)` + teste verde).
  - Parcial (decisão já tomada *de fato* pelo código, nunca formalizada
    como decisão consciente de produto): bloqueio total de edição de
    Participação após congelamento (`ParticipacaoController::update`,
    HTTP 409, sem trilha de auditoria — a spec ainda tratava como
    "nenhuma opção escolhida"); `FEED` sempre lê `carrossel_qtd`
    (`ParticipacaoNaCampanha::quantidadeContratadaPara`, comentário
    explícito no código — "não há coluna própria de feed" — a spec ainda
    tratava como pergunta em aberto).
- **Fora da tabela, por não serem divergência** (spec e código já
  concordam, nenhuma mudança de status): recorrência/parcelamento de
  pagamento, validação de formato do Instagram, Contratos,
  Produto/Variante/Estoque, Assessorias, Métricas de perfil, Permutas,
  Portal da Marca (`GESTOR_MARCA`), importação do histórico legado,
  trilha de auditoria polimórfica — todos seguem exatamente como
  documentados em `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md` §9.
- **Leitura de certificação funcional do MVP:** o núcleo operacional
  ponta a ponta (Cadastro → Aprovação → Campanha → Participação →
  Briefing → Material → Aprovação → Pagamento, incluindo o Portal
  completo da Influenciadora) está **funcionalmente conforme e testado**
  — nenhuma das 11 divergências é bloqueador de código. O que falta para
  "certificar" o MVP são só **2 decisões de produto sem resposta**
  (recorrência de pagamento; formato do Instagram) e a **ratificação
  formal** das 2 decisões "Parcial" já implementadas na prática.
- **Nenhum código alterado nesta entrada** — só o relatório de
  reconciliação (docs) e a atualização de `ESTADO_SESSAO.md`.
- **Backlog de `AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md` (§29) —
  encerrado.** Próximo passo depende do responsável do projeto (decisões
  acima) ou da retomada do Go-Live (§27/§29, inalterados: PostgreSQL,
  autenticação SSH do deploy, `restore-db.sh` com Docker, PR #62).

## 32. Mudança oficial de prioridade — fase de Certificação do MVP (2026-07-22)

**Mandato registrado pelo responsável do projeto nesta sessão:** o
projeto sai da fase "construir funcionalidades" e entra na fase
"certificar o MVP e colocá-lo em produção". Toda tarefa futura deve
responder "isso aproxima o sistema de uma influenciadora real em
produção?" — se não, não é prioridade. Nenhuma funcionalidade nova deve
ser criada enquanto existir item que impeça uma influenciadora real de
concluir o ciclo completo (Cadastro → Aprovação → Convite → Senha →
Login → Participação → Briefing → Upload → Aprovação → Pagamento →
Histórico). Decisão arquitetural reconfirmada como encerrada nesta
sessão: banco relacional, PostgreSQL em produção — não reabrir estudo de
alternativas (ex.: MongoDB).

**Nova ordem de prioridade:** 1) certificar regras de negócio; 2)
resolver Google Drive; 3) resolver SMTP; 4) validar fluxo completo; 5)
preparar produção; 6) executar piloto (uma única influenciadora real);
7) corrigir problemas encontrados; 8) publicar. Toda nova tarefa deve ser
classificada como Certificação, Correção, Infraestrutura, Integração,
Go-Live ou Evolução — itens de Evolução têm prioridade inferior a todos
os demais até o Go-Live.

**Auditoria funcional completa executada nesta sessão** (navegação real
via browser como ADMIN, GESTOR_MARCA e INFLUENCIADORA — não só leitura de
código), cobrindo os módulos que as sessões anteriores (§29-§31) não
haviam percorrido ao vivo (Logística/Envio) e reconfirmando ao vivo os
que já eram só documentados:

- **F1 — Upload de Material retorna 503** (Questão de Infraestrutura,
  **bloqueia**): `MaterialController::store` exige
  `GoogleDriveService::isConfigured()`; `.env` sem
  `GOOGLE_DRIVE_CLIENT_EMAIL`/`_PRIVATE_KEY`. Sem fallback local (já
  documentado em `PLANO_DE_IMPLANTACAO.md` Etapa 5 e
  `TEAR_V2.5_GO_LIVE_CHECKLIST.md` P0-9 — reconfirmado ao vivo, não é
  achado novo).
- **F2 — Upload de comprovante de pagamento com a mesma falha**
  (Questão de Infraestrutura, **bloqueia**): `PagamentoController::comprovante`,
  mesma checagem.
- **F3 — `MAIL_MAILER=log`** (Questão de Infraestrutura, **bloqueia**):
  convite/definir-senha tecnicamente correto, mas não chega a nenhuma
  influenciadora real (já documentado em `PLANO_DE_IMPLANTACAO.md` Etapa
  6 — reconfirmado ao vivo).
- **F4 — GESTOR_MARCA é papel não funcional** (Regra de Negócio
  Incompleta/Bug, não bloqueia): `CampanhaController`/`ParceiraController`
  só distinguem ADMIN de "resto", filtrando por posse do próprio usuário
  — lógica pensada só para INFLUENCIADORA. Sem vínculo Usuário-Gestor↔Marca
  no schema. Confirmado ao vivo (login `gestor@tear.test` não vê nada).
  Não bloqueia porque o ciclo certificado (ver definição acima) não
  depende de GESTOR_MARCA. Fica registrado como Evolução, não Correção
  prioritária.
- **F5 — Congelamento não bloqueia Briefing** (Regra de Negócio
  Incompleta, não bloqueia): só campos comerciais são bloqueados após
  `congelado_em`; Briefing pode ser criado/editado numa participação
  congelada sem aviso. Estreita ainda mais o escopo da ratificação
  pendente já registrada em §29-§31 — falta decidir se Briefing/Material/
  Pagamento entram no bloqueio.
- **F6 — Instagram sem validação de formato** (Decisão de Produto
  Pendente, não bloqueia): reconfirmado ao vivo, já era pendência
  conhecida (§29).
- **F7 — Sidebar rotula módulos funcionais como "(em breve)"** (Problema
  de UX, não bloqueia): Briefings/Materiais/Aprovações/Pagamentos já são
  100% funcionais via drill-down Campanha→Participação, mas o texto
  esconde isso de um operador novo.
- **Logística/Envio testado ao vivo nesta sessão, sem divergência
  encontrada:** criação de Envio, endereço lido corretamente da Parceira
  (proteção de PII do schema, P0-4, funciona como projetado), avanço de
  status PENDENTE→EXPEDIDO→ENTREGUE, RBAC (`role:ADMIN` nas rotas de
  escrita) — tudo correto. Fecha a última lacuna de módulo não percorrido
  ao vivo do backlog de certificação funcional.

**Conclusão desta auditoria:** o fluxo de negócio core está certificado
funcionalmente (nenhum bloqueador de lógica de aplicação). Os únicos
bloqueadores reais para uma influenciadora real em produção são
**credenciais/infraestrutura externa**, já mapeados e não são achado
novo: Service Account do Google Drive (`PLANO_DE_IMPLANTACAO.md` Etapa
5), SMTP de produção (Etapa 6), e a infraestrutura de hospedagem já
registrada em §27/§29 (PostgreSQL na Locaweb, autenticação SSH do
deploy, `restore-db.sh` com Docker, PR #62, DNS de
`influencia.estudioela.com`).

**Bloqueio atual (aguardando o responsável do projeto, prioridades 2-3
da nova ordem):** credenciais que a IA não possui e não pode gerar —
acesso ao Google Workspace/Cloud Console para criar a Service Account do
Drive, e confirmação do relay SMTP da Locaweb (ou decisão por outro
provedor). Nenhum código foi alterado nesta entrada.

## 33. Google Drive sem Service Account Key — OAuth de conta dedicada (`ADR-017`, 2026-07-22)

Ao executar a Etapa 5 de `PLANO_DE_IMPLANTACAO.md` (§32), o responsável
do projeto encontrou a Org Policy
`constraints/iam.disableServiceAccountKeyCreation` habilitada em
`elafashionmkt-org`, bloqueando a geração da chave JSON que
`GoogleDriveService` exigia até esta sessão. Análise da implementação
(`GoogleDriveService::accessToken()` — JWT Bearer assinado com
`private_key`) confirmou que a chave era exigida pelo método de
autenticação escolhido no código, não pela API do Drive em si.

**Decisão (`ADR-017`):** trocar o mecanismo por OAuth 2.0 com uma conta
de usuário dedicada do Workspace (`refresh_token`), que não é Service
Account e não esbarra na Org Policy. Alternativas descartadas: Workload
Identity Federation e Service Account Impersonation (inviáveis fora do
Google Cloud, sem IdP externo disponível na Locaweb); exceção de Org
Policy no escopo do projeto (tecnicamente viável e reversível, mas
rejeitada por decisão explícita do responsável do projeto — prioridade
de manter a política da organização intacta).

**Implementado nesta sessão:**
- `GoogleDriveService::accessToken()` reescrito para `grant_type=refresh_token`
  (era JWT Bearer com `private_key`); `isConfigured()` ajustado.
- `config/services.php`, `.env.example`, `.env.production.example`,
  `.env` — `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET`/`_REFRESH_TOKEN` no
  lugar de `_CLIENT_EMAIL`/`_PRIVATE_KEY`.
- Novo comando `php artisan google-drive:obter-refresh-token` — Device
  Authorization Grant (RFC 8628), sem servidor local de callback; único
  jeito de obter o `refresh_token` inicial.
- `tests/Feature/GoogleDriveServiceTest.php`,
  `BackupDatabaseToDriveCommandTest.php`, `MaterialTest.php`,
  `PagamentoTest.php` — fixtures de credenciais fake ajustadas ao novo
  formato. Suíte completa: 199/199 verde, Pint limpo.
- `PLANO_DE_IMPLANTACAO.md` Etapa 5, `IMPLEMENTACAO_TECNICA.md` §4,
  `TEAR_V2.5_GO_LIVE_CHECKLIST.md` P0-9 — atualizados para o novo
  procedimento.

**Não alterado:** `ensureFolder()`, `uploadFile()`, o Shared Drive
institucional, nenhuma rota/controller/policy/regra de negócio fora do
escopo desta ADR.

**Bloqueio atual (aguardando o responsável do projeto):** criar a conta
dedicada do Workspace, o OAuth Client "TVs and Limited Input devices" no
Cloud Console, compartilhar o Shared Drive com essa conta, e rodar o
comando `google-drive:obter-refresh-token` para gerar os 3 valores OAuth
— passos manuais que exigem acesso ao Google Workspace/Cloud Console,
documentados em `PLANO_DE_IMPLANTACAO.md` Etapa 5. Teste real de upload
em homologação (Etapa 16) segue pendente até esses valores chegarem.

> **Correção (2026-07-22, ver §34):** a premissa de Google Workspace/
> Shared Drive acima estava errada — o projeto usa conta pessoal
> (`elafashionmkt@gmail.com`), sem Workspace. §34 corrige o mecanismo.

## 34. Google Drive sem Workspace nem Shared Drive — pasta comum + IDs reais confirmados (2026-07-22)

O responsável do projeto esclareceu que o TEAR **não tem Google
Workspace** — o projeto usa a conta pessoal `elafashionmkt@gmail.com`,
que administra o Google Cloud e terá acesso às pastas do Drive. Isso
corrige a premissa de §33 (que ainda assumia Workspace/Shared Drive).

**Achado técnico:** `GoogleDriveService::ensureFolder()` usava
`corpora=drive`+`driveId=$rootFolderId`, parâmetros que só funcionam
contra um **Shared Drive** — recurso exclusivo de Google Workspace, não
disponível numa conta pessoal. O mecanismo OAuth do ADR-017 (`refresh_token`)
em si não tinha nenhuma dependência de Workspace; a dependência estava
só nesses dois parâmetros da busca de pastas.

**Corrigido nesta sessão:**
- `GoogleDriveService::ensureFolder()` — removidos `corpora`/`driveId`;
  mantidos `supportsAllDrives`/`includeItemsFromAllDrives` (flags
  inofensivas para uma pasta comum). Passa a operar contra uma pasta
  comum no Meu Drive da conta dedicada, não um Shared Drive.
- Adicionados `GoogleDriveService::getFile()`, `downloadFile()`,
  `deleteFile()`, e `accessToken()` passou a público — suporte ao novo
  comando de diagnóstico.
- Novo comando `php artisan google-drive:test` — valida, em 8 etapas com
  relatório de sucesso/falha (variáveis de ambiente, access token, acesso
  à pasta ROOT, existência/criação da pasta BACKUP, permissão de
  escrita, upload, leitura, exclusão de um arquivo de diagnóstico), toda
  a configuração antes do primeiro upload real.
- IDs reais das pastas confirmados pelo responsável do projeto e
  preenchidos em `.env`/`.env.example`/`.env.production.example`:
  `GOOGLE_DRIVE_ROOT_FOLDER_ID=1uSmA2qt8apAkNP54z9yBChhitYXSw2y4`,
  `GOOGLE_DRIVE_BACKUP_FOLDER_ID=1c_ImyhRDHGox509kRjTJKHkyiIc5zzBE`.
- Correções textuais em `ARQUITETURA_PRODUCAO.md`, `AUDITORIA_LOCAWEB.md`,
  `IMPLEMENTACAO_TECNICA.md`, `PLANO_DE_IMPLANTACAO.md` Etapa 5,
  `PLANO_IMPLEMENTACAO.md` (nota de correção), `CONFIGURACAO_PRODUCAO.md`,
  `DEPLOY.md` — substituindo "Shared Drive institucional"/"Service
  Account"/"Workspace" pela realidade (pasta comum + conta pessoal via
  OAuth). Varredura por `GOOGLE_DRIVE_CLIENT_EMAIL`/`_PRIVATE_KEY`/
  `ServiceAccount`/JWT no código confirmou zero referências ativas
  restantes (só menções explicativas do que foi descartado).
- Suíte completa 202/202 verde, Pint limpo (validado após as mudanças de
  código desta seção).

**Interrompido a pedido do responsável do projeto (modo "critical path",
2026-07-22):** varredura de documentação ainda tinha 1-2 arquivos
secundários não revisados quando a sessão pivotou para focar só em obter
o `refresh_token` real e validar upload — registrado como TODO em
`ESTADO_SESSAO.md`, não bloqueia nada funcional.

**Ainda não decidido (pausado, não é bloqueador do ciclo certificado):**
o responsável do projeto pediu uma função que garanta a estrutura fixa
`ROOT → Materiais/Backup/Temporarios/Contratos/Exportacoes`. A estrutura
real usada em produção por `MaterialController`/`PagamentoController` é
dinâmica (`ROOT/<Parceira>/<Campanha>/<Tipo|Comprovantes>`), não essa
taxonomia fixa — conflito de requisito identificado, ainda não
resolvido com o responsável do projeto. Ver TODO em `ESTADO_SESSAO.md`.

**Bloqueio atual (aguardando o responsável do projeto):** `refresh_token`
real ainda não gerado — `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET` reais
também ainda não entregues (mensagem anterior trazia só placeholders).
Assim que chegarem, rodar `google-drive:obter-refresh-token` →
`google-drive:test` → upload real em homologação, depois um único commit
consolidando toda a mudança (instrução explícita do responsável do
projeto: acumular e commitar só quando o fluxo OAuth estiver
completamente validado).

## 35. Google Drive — refresh_token real obtido, fluxo validado ponta a ponta, Prioridade 1 do Go-Live encerrada (2026-07-22)

Fechamento de §33/§34. `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET` reais
chegaram com um problema adicional: o Device Authorization Grant (RFC
8628) do `ADR-017` rejeitou o escopo completo `https://www.googleapis.com/auth/drive`
com `400 invalid_scope` — confirmado, via documentação oficial do
Google, ser uma restrição fixa do fluxo (só aceita
`email`/`openid`/`profile`/`drive.appdata`/`drive.file`/`youtube`/`youtube.readonly`;
`drive.file` foi descartado por só dar acesso a arquivos criados pelo
próprio app, insuficiente para as pastas/arquivos já existentes,
criados manualmente).

**Decisão (adendo ao `ADR-017`, aprovada explicitamente pelo responsável
do projeto):** manter o escopo completo `drive` e trocar só o mecanismo
de obtenção do `refresh_token` — de Device Authorization Grant para
Authorization Code + redirect loopback local (RFC 8252). Exigiu um novo
OAuth Client tipo **"Desktop app"** ("App para computador" na UI em
PT-BR; `TVs and Limited Input devices` não suporta `redirect_uri`) —
duas tentativas do responsável do projeto criaram por engano um client
tipo "Web application" (chave `"web"` no JSON, `redirect_uri` fixo,
incompatível); o terceiro, correto, gerou chave `"installed"`.

**Implementado:**
- `ObterGoogleDriveRefreshToken` reescrito: abre um `stream_socket_server`
  em `127.0.0.1` numa porta livre, monta a URL de autorização com esse
  `redirect_uri` dinâmico, aguarda o `GET` do navegador, valida `state`,
  troca o `code` por tokens em `TOKEN_URL`. Mesmo nome de comando
  (`google-drive:obter-refresh-token`), só o mecanismo interno mudou —
  `GoogleDriveService::accessToken()` não foi alterado (consome
  `refresh_token` do jeito que sempre consumiu).
- Também precisou de um usuário de teste na tela de consentimento OAuth
  (Google Auth Platform → Público-alvo → Usuários de teste →
  `elafashionmkt@gmail.com`) — a ausência causava `403 access_denied`
  ("Acesso bloqueado... fase de testes").
- **Bug adicional encontrado durante a validação real:** `GoogleDriveService::getFile()`/
  `downloadFile()`/`deleteFile()` chamavam `API_URL."/{$id}"` (faltando
  o segmento `/files/`) — retornava um 404 HTML genérico do Google (não
  um erro JSON da API), nunca detectado porque nenhum teste cobria esses
  3 métodos. Corrigido para `API_URL."/files/{$id}"` em todos.
- `ADR-017` recebeu um adendo (§6) documentando a troca de mecanismo com
  a evidência oficial do Google por trás da decisão.
- Testes ajustados: `MaterialTest.php` (override explícito de config
  para não depender de `.env` real, que agora tem credenciais reais) e
  `TestGoogleDriveConfiguracaoCommandTest.php` (`Http::fake` corrigido
  para os paths `/files/{id}` corretos, reordenados antes do wildcard
  genérico). Suíte completa verde, Pint limpo.

**Validado (via `php artisan google-drive:test`, 8/8 etapas, e via curl
direto contra a API real):** o fluxo OAuth com escopo `drive` completo
acessa arquivos/pastas pré-existentes criados manualmente (confirmado
lendo `Temporarios/teste-upload.txt`) — validando que a escolha de
manter o escopo `drive` completo (em vez de `drive.file`) era necessária.

**Commit único consolidado** (instrução explícita do responsável do
projeto, modo "critical path"): `f074384` — inclui código, testes,
ADR-017 adendo e as correções textuais de documentação já feitas em
§34, mais os arquivos de `.env.example`/`.env.production.example`/
`PLANO_DE_IMPLANTACAO.md` atualizados para "Desktop app"/Authorization
Code. Pushado para `origin/feat/ui-design-system-ela`.

**Prioridade 1 do checklist de Go-Live (autenticação do Google Drive):
encerrada.** Próxima prioridade do checklist: SMTP de produção
(Prioridade 2, inalterado).

**TODO residual, não bloqueador (modo "critical path" suspendeu a
varredura de documentação; resumida parcialmente neste fechamento, mas
não 100% auditada):** `docs/deployment/CONFIGURACAO_PRODUCAO.md` ainda
tinha, no momento da interrupção, uma seção de checklist mais abaixo no
arquivo (fora da tabela de variáveis, já corrigida) mencionando "OAuth
Client ID, tipo TVs and Limited Input devices" — não confirmado se foi
corrigida nesta sessão; conferir na próxima sessão de documentação.
Decisão de produto sobre estrutura fixa de pastas (`Materiais/Backup/
Temporarios/Contratos/Exportacoes` vs. estrutura dinâmica real) segue em
aberto, mesma pendência de §34.

## 36. SMTP de produção — relay Locaweb configurado e validado localmente (2026-07-22)

Prioridade 2 do checklist de Go-Live (Prioridade 1, Google Drive,
encerrada em §35). Auditoria prévia confirmou `config/mail.php` já
compatível com Laravel 12 sem nenhuma alteração de código — só faltavam
credenciais reais do provedor já decidido em `ARQUITETURA_PRODUCAO.md`
§6 (relay SMTP incluso no plano Locaweb).

**Achado técnico:** a variável `MAIL_ENCRYPTION`, comumente usada em
tutoriais e versões antigas do Laravel, **não existe mais desde o
Laravel 9** — `config/mail.php` nunca a lê. A variável correta é
`MAIL_SCHEME` (`smtps` = TLS implícito, necessário na porta 465;
`MailManager::parseTransportConfig()` do Laravel 12 já infere `smtps`
automaticamente quando a porta é `465` e `MAIL_SCHEME` fica em branco,
mas foi setado explicitamente por clareza).

**Configurado e validado (só em `.env` local, gitignorado — nada
versionado):** `MAIL_HOST=email-ssl.com.br`, `MAIL_PORT=465`,
`MAIL_SCHEME=smtps`, `MAIL_USERNAME=contato@elafashionmkt.com.br`,
`MAIL_FROM_ADDRESS` idem, `MAIL_FROM_NAME=TEAR`. Teste real via
`Mail::raw()` (síncrono) confirmou autenticação SMTP e entrega — e-mail
chegou à caixa de entrada, não caiu em spam.

**Correção a uma suposição de auditorias anteriores:** os 3 fluxos de
e-mail da aplicação (`InfluenciadoraConviteNotification`,
`BackupFalhouNotification`, `ResetPassword::toMailUsing`) são
**síncronos** — nenhuma classe `Notification` implementa `ShouldQueue`
(só usam o trait `Queueable`, que sozinho não enfileira). O crontab de
`queue:work` continua necessário para o futuro, mas não é pré-requisito
para o e-mail funcionar hoje.

**Ainda não feito (não bloqueador, registrado em `ESTADO_SESSAO.md`
§3-§4):** validar os 2 fluxos reais da aplicação (convite, reset de
senha) com o SMTP real — só o envio genérico foi testado; verificar
SPF/DKIM/DMARC de `elafashionmkt.com.br`; confirmar limite diário de
envio do plano; replicar as variáveis `MAIL_*` no `.env` real de
produção quando o host for provisionado (hoje só existem no `.env`
local). Nenhum commit foi criado nesta sessão (nenhuma mudança
versionável — só `.env` local).

## 37. Homologação funcional iniciada — 8 fluxos prioritários auditados, 2 bugs de integridade de dados corrigidos (2026-07-23)

Primeira sessão da fase de Homologação Funcional (anunciada em §32,
nunca iniciada nas duas sessões seguintes por terem sido consumidas por
consolidação de documentação e SMTP). Conduzida em paralelismo intenso
(2 subagentes de auditoria simultâneos por rodada, agente principal só
implementando) a pedido explícito do responsável do projeto ("Modo
ULTRA POWER").

**Método:** para cada fluxo, um subagente lê controller/model/request/
rotas/frontend/testes existentes, roda os testes, cruza com `PRD.md`/
`docs/specs/` e reporta achados; o agente principal reproduz a causa
raiz, corrige o mínimo necessário, roda só os testes impactados, e
commita por bug (não por fluxo) — 5 commits nesta sessão, todos
pushados para `origin/feat/ui-design-system-ela`.

**Ajuste de critério no meio da sessão (decisão do responsável do
projeto):** o objetivo desta fase não é produzir hardening de produção
nem endurecer a implementação — é validar que os fluxos de negócio
funcionam ponta a ponta para permitir demonstrar o TEAR a um cliente
antes da futura reescrita para a arquitetura definitiva. A partir desse
ajuste, itens de dívida de teste, rate-limit mais rigoroso, race
conditions exigindo requisições concorrentes e polimento de UX deixaram
de ser corrigidos nesta sessão — ficam registrados como pendências não
bloqueadoras (ver `ESTADO_SESSAO.md` §4), não descartados.

**Bugs corrigidos (commits `d7b7fc2`, `a569bca`, `c91b52b`, `c97b8b1`,
`f3c20b4`):**

1. **Corrupção de estado ao aprovar Parceira com e-mail já em uso**
   (severidade Alto): `ParceiraController::aprovar()` gravava o status
   `Ativa` antes de criar o `User` vinculado, sem transação. Se já
   existisse um `User` com o mesmo e-mail, `User::create()` lançava
   exceção não tratada e a Parceira ficava `Ativa` com `user_id` nulo e
   nenhum convite enviado, sem sinal de erro para o admin. Corrigido com
   `DB::transaction` + captura de `QueryException` (23000) retornando
   422 claro.
2. **Falha de transação no cadastro público** (severidade Alto, mesma
   classe de bug do item 1): `Parceira::create()` e
   `registrarConsentimentoCadastro()` eram duas escritas separadas sem
   transação — falha na segunda deixava uma Parceira persistida com
   dados pessoais mas sem registro de consentimento LGPD. Envolvido em
   `DB::transaction`.
3. `Parceira::aprovar()` não limpava `reprovado_por`/`reprovado_em`/
   `motivo_reprovacao` ao reaprovar uma parceira previamente reprovada
   — registro antigo ficava visível na API mesmo com a parceira ativa.
4. Rodapé dos e-mails transacionais (convite, redefinição de senha)
   terminava em inglês ("Regards,...") por falta de tradução das
   strings padrão do template de e-mail do Laravel para pt_BR — corrigido
   via `lang/pt_BR.json`.
5. `reenviar-convite` era a única rota de geração de token de senha sem
   `throttle:6,1` (assimetria confirmada por duas auditorias
   independentes, uma do fluxo de convite e outra do fluxo de reset).
6. Tela de definir senha com link expirado/inválido não oferecia saída
   — adicionado link para `/esqueci-senha`.

**Achado relevante sem correção de código:** a auditoria do fluxo de
recuperação de senha confirmou que convite de influenciadora e "esqueci
minha senha" usam exatamente o mesmo broker/token/tela do Laravel desde
o P0-1 já registrado — não há dois mecanismos divergentes, hipótese de
risco inicial descartada.

**Status por fluxo ao final da sessão:** Convite, Cadastro, Recuperação
de senha, Briefing, Upload de materiais, Aprovação de material e
Pagamento (caso 1:1 atual) — demonstráveis ponta a ponta sem bug
bloqueador conhecido. Login — nenhum bug funcional encontrado no
código, mas não reproduzido manualmente no navegador nesta sessão.
Recorrência/parcelamento de pagamento e GESTOR_MARCA seguem como
limitações de escopo conhecidas (não bugs), já registradas em sessões
anteriores.

**Não investigado nesta sessão (fora da lista dos 8 fluxos pedidos):**
subagente notou de passagem que o item de menu "Logística" no
`AppShell.tsx` do frontend é um `<PlaceholderPage>` desabilitado — a
tela real de Envio só é alcançável por drill-down a partir do detalhe
de Campanha. Não verificado a fundo; achado do relatório
`docs/reports/AUDITORIA_FUNCIONAL_MVP_VS_ESPECIFICACAO.md` de sessão
anterior.

## 38. Auditoria de regras de negócio (papel QA, em paralelo ao §37) — 1 bug Categoria A corrigido, fluxos reclassificados para a fase de migração (2026-07-23)

Sessão conduzida em paralelo à sessão de Homologação Funcional do §37
(mesmo dia, commits `75cf5c4` e `4138c04` a poucos segundos de
distância), num papel dedicado de QA/Auditor Técnico: alimentar uma
fila priorizada de bugs sem implementar, até o passo final em que o
responsável do projeto pediu a correção de um achado específico.

**Rodada 1 (tela por tela, P0/P1):** reauditoria independente de Login,
Recuperação de senha, Convite de influenciadora, Cadastro e Aprovação —
sem saber do trabalho do §37 em andamento na outra sessão. Achados
coincidem em boa parte com os do §37 (throttle assimétrico do
reenvio de convite, falta de unicidade de e-mail em Parceira,
mensagens de erro genéricas no Login) — nenhuma divergência relevante,
confirma por auditoria cruzada independente que os achados do §37 eram
reais.

**Rodada 2 (mudança de estratégia — regras de negócio, não telas):** a
pedido explícito do responsável do projeto, a auditoria passou a
perguntar "existe alguma forma de o sistema chegar a um estado
impossível?", rastreando Pagamento, ParticipacaoNaCampanha, Campanha,
Briefing, Material e Envio (controllers, models, FormRequests,
migrations) em vez de telas. Achados (arquiteturais, não de tela):

1. **Gate de material aprovado (regra P0-1) contornável pulando direto
   para `status=PAGO`** — `PagamentoController::update()` só chamava
   `existeMaterialNaoAprovado()` na transição explícita a `APROVADO`.
   **Corrige uma lacuna que o §37 não pegou**: aquela sessão classificou
   Pagamento como "demonstrável ponta a ponta sem bug bloqueador
   conhecido" — não estava, a regra central do fluxo (não pagar sem
   material aprovado) tinha um desvio trivial.
2. `Pagamento.valor` editável mesmo com `status=PAGO`, sem trava nem
   auditoria.
3. Pagamento e cancelamento de Participação não se checam mutuamente
   (dá pra pagar cancelada, ou cancelar já paga).
4. Campanha `ENCERRADA`/`CANCELADA` continua 100% editável (inclusive
   reabrindo status ou trocando marca).
5. Participação pode ser criada numa Campanha já `ENCERRADA`/`CANCELADA`.
6. Congelamento (`congelado_em`) é decorativo fora dos campos comerciais
   da própria Participação — confirmado em código que também não cobre
   Material nem Envio, além do Briefing já registrado no §4 do
   `ESTADO_SESSAO.md`.
7. `PagamentoController` sem `DB::transaction`/lock — mesma classe de
   race condition já corrigida em `ParceiraController::aprovar` (§37
   item 1), ainda não replicada aqui.

**Rodada 3 (reclassificação A/B/C):** a pedido do responsável do
projeto, todos os achados (rodadas 1 e 2) foram reclassificados sob o
critério já fixado no §37.3 ("validar fluxos de negócio, não hardening
de produção"):

- **Categoria A** (bloqueia validar o produto) — só o item 1 acima
  (gate de material aprovado contornável): é a única regra com
  referência explícita de spec no próprio código (`P0-1`), e a pergunta
  central do roteiro ("é possível pagar sem material aprovado?") tinha
  resposta positiva.
- **Categoria B** (funciona, mas compromete robustez/segurança/
  concorrência/manutenção) — itens 2, 3, 4, 5, 7 acima, mais a falta de
  unicidade de e-mail em Parceira (já em `ESTADO_SESSAO.md` §4) e a
  máscara de erro genérica do Login (idem).
- **Categoria C** (pode esperar) — item 6 (congelamento decorativo,
  decisão de produto já em aberto), `reenviarConvite` não distinguir
  parceira já ativa.

**Correção aplicada (único item Categoria A, commit `4138c04`):**
`PagamentoController::update()` agora chama `existeMaterialNaoAprovado()`
para qualquer avanço a `APROVADO` **ou** `PAGO`, não só à transição
específica a `APROVADO`. 3 testes novos em `PagamentoTest.php` cobrindo
o bypass (bloqueia PAGO direto com material pendente/reprovado, permite
PAGO direto com material aprovado). Suíte completa do backend: 206/206
verde. `vendor/bin/pint --test`: limpo.

**Importante — branch e PR ainda não mergeados:** o commit `4138c04`
está na branch `fix/pagamento-gate-pago` (criada a partir de
`feat/ui-design-system-ela` em `f3c20b4`, **antes** do commit de
fechamento `75cf5c4` do §37 — as duas sessões divergiram do mesmo ponto
em paralelo). PR draft aberto:
`https://github.com/estudioela/jescri-migracao/pull/66`, alvo
`feat/ui-design-system-ela`. **Ainda não mergeado** — `feat/ui-design-
system-ela` continua em `75cf5c4` sem a correção até o merge acontecer.

**Conclusão da sessão (comunicada pelo responsável do projeto):** com o
único bloqueador Categoria A corrigido, os fluxos de negócio auditados
(Login, Recuperação de senha, Convite, Cadastro, Aprovação, Upload,
Pagamentos, Campanhas, Administração) ficam aptos para a fase de
migração para a arquitetura definitiva — os itens B/C remanescentes não
bloqueiam a validação do produto, salvo novo achado crítico.

**Correção factual (2026-07-23, sessão de curadoria documental §39):** o
texto acima ("Ainda não mergeado") ficou desatualizado — verificado por
`git log` nesta sessão que o PR #66 **já foi mergeado**
(`99b5f6a`, merge de `fix/pagamento-gate-pago` em
`feat/ui-design-system-ela`), e há mais um commit à frente
(`955bb83`, `feat(portal): adiciona historico da influenciadora (RF-028)`)
não registrado em nenhuma seção deste arquivo. Registro puramente factual
(divergência encontrada por checagem de `git log`/`git status`, não nova
auditoria) — o conteúdo funcional de §37/§38 permanece o mesmo, só o
status do merge e o novo commit precisam de uma sessão dedicada ao fluxo
de QA/Homologação para serem documentados corretamente.

## 39. Curadoria documental — decisão P0-2 extraída para ADR-018, plano de congelamento arquivado (2026-07-23)

Continuação da sessão de curadoria documental (Agente C) interrompida por
limite de contexto. Escopo estritamente documental — nenhum código
alterado.

- **Item pendente localizado e concluído:** `docs/planning/
  PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md` (P0-2) era o único item
  faltante da Fase 1 do plano executivo de simplificação documental (§28)
  com pré-requisito não cumprido (extrair a decisão de arquitetura para
  ADR antes de arquivar).
- **Leitura direta do código** (`ParticipacaoNaCampanha.php`,
  `ParticipacaoController.php`, `routes/api.php`, migration
  `2026_07_20_180000_...`) confirmou que a implementação real é **muito
  mais estreita** do que o plano original propunha: só a coluna
  `congelado_em` + trava de edição de 4 campos comerciais. Não existem
  `congelado_por`, `dados_congelados` (cópia do cadastro da Parceira) nem
  `historico_alteracoes_participacao` — o núcleo do problema que o plano
  original resolvia (histórico não deve vazar alteração posterior do
  cadastro vivo da Parceira) **não está coberto** pela implementação
  atual. Achado consistente com
  `docs/reports/RECONCILIACAO_ESPECIFICACAO_FUNCIONAL_MVP.md` (2026-07-22)
  e com a pendência Categoria C já registrada em `ESTADO_SESSAO.md` §4
  ("Congelamento é decorativo fora dos campos comerciais").
- **`docs/adrs/ADR-018-congelamento-de-participacao-trava-simples.md`**
  criada — documenta o que foi de fato implementado, o gap consciente em
  relação ao plano original, e mantém o plano completo como referência
  arquivada para se o Sprint 3 (Contratos) precisar da garantia de
  integridade histórica completa.
- **`git mv`** de `docs/planning/PLANO_FINAL_CONGELAMENTO_OPERACIONAL.md`
  para `docs/archive/pagamento-snapshot/` (mesmo cluster temático dos 3
  documentos-fonte que ele já cita em seu próprio §0) — histórico
  preservado via rename. `docs/archive/README.md` e
  `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` (linha de governança
  §"Governança deste documento") atualizados para não referenciar mais o
  arquivo pelo caminho antigo.
- **Divergência encontrada e registrada (não corrigida além do registro
  factual):** ver correção anexada ao final de §38 — `ESTADO_SESSAO.md` e
  este arquivo estavam desatualizados quanto ao merge do PR #66 e a um
  commit adicional (RF-028) não documentado; fora do escopo desta sessão
  (documental) investigar ou fechar essa lacuna, que pertence à trilha de
  QA/Homologação.
- **Não executado nesta sessão (fora do escopo da tarefa de continuação,
  aguardando decisão do responsável do projeto — ver relatório de
  encerramento da missão do Agente C):** os demais itens de Fase 1
  (2 roadmaps superados, `REPOSITORY_GOVERNANCE_AUDIT.md`,
  `RELATORIO_CONSOLIDACAO_AUDITORIAS.md`), Fase 2 (3 remoções diretas já
  validadas), Fase 3 (2 consolidações) e Fase 4 (arquivamento pós-Go-Live)
  — todos já listados em §28, nenhum teve autorização explícita de
  execução nesta sessão. Destino dos 3 relatórios `docs/reports/*.md`
  (`??`) também segue não decidido.

## 40. PR #66 mergeado, missão de QA/Certificação do Agente B encerrada (2026-07-23)

Continuação da sessão do §38, retomada após interrupção por limite de
uso. Verificação de estado (não reauditoria): o PR #66
(`fix/pagamento-gate-pago` → `feat/ui-design-system-ela`) descrito como
"ainda não mergeado" no §38 **já estava mergeado** ao retomar esta
sessão — merge commit `99b5f6a`, CI verde (backend + frontend). A branch
`feat/ui-design-system-ela` avançou mais dois commits depois do merge,
de uma sessão paralela não documentada aqui até agora:

- `bb44d20` — corrige consentimento LGPD ausente no modo criação de
  Parceira (`ParceiraFormPage.tsx`); achado por reprodução manual no
  navegador durante a homologação funcional.
- `955bb83` — implementa `GET /me/historico` (RF-028) e a tela
  correspondente no Portal da Influenciadora, fechando a última etapa do
  ciclo de negócio definido em §32 (`...→ Pagamento → Histórico`).
  Validado no navegador com campanha real `ENCERRADA`.

**Verificado nesta sessão em `955bb83` (HEAD atual de
`feat/ui-design-system-ela`):** backend 208/208 testes verdes,
`pint --test` limpo, `tsc -b` (frontend) limpo — sem regressão
introduzida pelos dois commits acima nem pelo merge do PR #66.

**Entrega desta sessão:** `docs/reports/CERTIFICACAO_MVP.md` — parecer
técnico formal de certificação funcional do MVP (`tear-v2-app/`),
consolidando os achados de §37/§38 e o estado atual pós-merge. Parecer:
**certificado funcionalmente** para o critério de demonstração a cliente
(não de Go-Live de produção, gate independente e ainda não autorizado em
`docs/release/GATE_FINAL_GO_LIVE.md`). Nenhum bloqueador funcional
(Categoria A) em aberto; pendências B/C mantidas como já registradas em
`ESTADO_SESSAO.md` §4.

**Missão do Agente B nesta frente (QA/Homologação/Certificação)
encerrada.** Próximo passo é decisão do responsável do projeto: seguir
para a frente de infraestrutura/Go-Live (`GATE_FINAL_GO_LIVE.md`) ou
ampliar a auditoria a fluxos secundários (Marcas, Medidas) antes disso.

## 41. Documentos de Go-Live efetivamente commitados (2026-07-23)

Sessão de continuação do Agente A, rodando em paralelo às sessões que
produziram §39/§40 (Agentes B e C) — mesmo objetivo de fechamento,
achado complementar: `docs/deployment/CHECKLIST_GO_LIVE.md`,
`docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md` e
`docs/release/GATE_FINAL_GO_LIVE.md`, já referenciados por §40 e por
`ESTADO_SESSAO.md` como se fizessem parte do repositório, estavam **só
no working tree local** (`??`, sem nenhum commit no histórico Git desta
branch) — mesma lacuna que a versão fundida de `ESTADO_SESSAO.md`
(sessões B+C) já registrava em §4 como pendência de decisão. Conteúdo
revisado, sem alteração de mérito: checklist executável de 6 blocos
(infraestrutura/segredos/publicação/serviços/operação/homologação
final), runbook de deploy e dos dois tipos de rollback (aplicação e
banco) específico para o host Locaweb sem Docker, e o gate formal de
decisão — hoje **GO LIVE: NÃO AUTORIZADO**, pendente só de
infraestrutura real externa ao código. Commitados nesta sessão, fechando
o item 4 da lista de "Próxima tarefa recomendada" da versão anterior de
`ESTADO_SESSAO.md`.

Suíte revalidada nesta sessão contra a branch (backend a partir de
`backend`): `php artisan test` → 208/208 verde;
`vendor/bin/pint --test` → limpo; `tsc -b` (frontend) → sem erros;
`oxlint` → só o aviso pré-existente e não relacionado de
`src/lib/auth.tsx`. Nenhum bug novo, nenhuma implementação parcial
encontrada. **Missão do Agente A nesta frente encerrada.**

## 42. Missão extra de limpeza da raiz — execução da Fase 1 (restante) e Fase 2 do plano de simplificação documental (§28) (2026-07-23)

- **Nova frente** (instrução explícita do responsável do projeto,
  "MISSÃO EXTRA — LIMPEZA E CONSOLIDAÇÃO DO REPOSITÓRIO", com autorização
  explícita para excluir/mover/fundir arquivos). Escopo: raiz do
  repositório e itens do plano de simplificação documental do §28 ainda
  não executados.
- **Fase 1 (restante) executada** — arquivamento (`git mv`, histórico
  preservado) para `docs/archive/`:
  - `docs/planning/ROADMAP_MESTRE_TEAR_V2.md` e
    `docs/planning/TEAR_V2.5_PRODUCTIZACAO_ROADMAP.md` →
    `docs/archive/roadmaps-superados/` (ambos declarados substituídos por
    `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md`). Referências de
    caminho corrigidas nos 2 documentos ativos que ainda apontavam para o
    caminho antigo (`docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`,
    `docs/planning/ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`); referências
    em relatórios/handoffs já históricos (`HANDOFF_PRODUCTIZACAO_TEAR_V2.md`,
    `ARCHITECTURE_REVIEW_V2_5.md`, `HANDOFF_FINAL.md`,
    `RELATORIO_QA_FUNCIONAL_MVP_TEAR_V2.md`) deixadas como estão, mesmo
    critério já tolerado pelo `docs/archive/README.md` para os 19
    arquivos arquivados anteriormente.
  - `docs/governance/REPOSITORY_GOVERNANCE_AUDIT.md` e
    `RELATORIO_CONSOLIDACAO_AUDITORIAS.md` (raiz) →
    `docs/archive/auditorias-historicas/` (conteúdo já resumido em §16
    deste arquivo). `docs/governance/` ficou vazia e foi removida —
    adianta parte do item de Fase 4 já planejado ("remoção de
    `docs/governance/` da árvore ativa").
  - `docs/archive/README.md` e `README.md` (raiz) atualizados com as
    novas seções/remoção da referência a `docs/governance/`.
- **Fase 2 executada** — remoção definitiva (`git rm`, sem arquivamento,
  já validada anteriormente como segura):
  `docs/reports/STATUS_MVP_OPERACIONAL_TEAR_V2.md`,
  `docs/reports/RELATORIO_SPRINT_ESTABILIZACAO_TEAR_V2.md`,
  `docs/design/DESIGN_SYSTEM.md` (paleta nunca implementada). Confirmado
  antes da remoção que o débito técnico documentado no relatório de
  sprint (credenciais do Google Drive ausentes) já está rastreado como
  `P0-9` em `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` — nenhuma
  informação perdida.
- **Assets de marca na raiz:** `elã-branco.svg` e `elã-vermelho.svg`
  removidos (duplicatas byte-idênticas já existentes em
  `frontend/public/`, único lugar onde são referenciados,
  por caminho absoluto `/arquivo.svg`, convenção do Vite). `elã-vinho.svg`
  (sem uso em código, sem duplicata) movido para
  `frontend/public/` por consistência com os outros 2, em vez
  de removido — não é lixo documental, é asset de marca de baixo custo de
  manutenção.
- **`PROJECT_GOVERNANCE.md` (raiz) mantido sem alteração**, por decisão
  desta sessão: contém decisões arquiteturais permanentes (§3 — camadas,
  envelope de resposta, convenções de dados) citadas ativamente por
  dezenas de arquivos em `src/` e por `ADR-002`/`ADR-004`/`ADR-010`, não
  duplicadas em nenhum outro lugar; mover quebraria a convenção de
  citação `PROJECT_GOVERNANCE §X.Y` usada no código. A poda do overlap
  real com `CLAUDE.md` (§2 fluxo, §7 fontes de autoridade) já está
  prevista na Fase 4 do §28 — **não executada nesta sessão**, mantida
  como estava planejada (gated a pós-Go-Live).
- **Fase 3 — desfecho real, revisado após confirmação explícita do
  responsável do projeto para prosseguir agressivamente:**
  - `UI_RULES.md`→`ADR-002`: **não executado.** Investigação revelou que
    `ADR-002` documenta uma decisão de arquitetura (biblioteca de
    componentes vanilla JS entregue via Apps Script HTML Service,
    `webapp/`) que **nunca foi implementada** (`webapp/` não existe no
    repositório) — foi de fato substituída por React+Vite servido pelo
    Laravel, decisão formal e distinta em `ADR-015` (Aceito). Promover o
    status de `ADR-002` para "Aceito" registraria uma decisão
    arquitetural factualmente incorreta na trilha de ADRs. `UI_RULES.md`
    permanece em `docs/design/` intocado (regras normativas de UX
    genéricas, não amarradas a nenhuma stack específica); `ADR-002`
    permanece "Proposed" — reflete a realidade (proposto, nunca aceito
    nem implementado).
  - `ESPECIFICACAO_FUNCIONAL_MVP_COMPLETA.md`→`BACKLOG_FUNCIONAL_V2_6.md`:
    **não fundido.** Investigação revelou que a extração necessária não é
    1 seção (recorrência/parcelamento), mas **12 decisões de negócio
    pendentes do responsável do projeto (§9)** mais ~13 lacunas sem item
    equivalente no backlog vigente — fundir sem decisão item a item
    arriscava perder decisões reais em aberto, risco que o próprio §28
    original já classificava como "médio-alto". **Arquivado íntegro**
    (`git mv`, sem perda de conteúdo) em
    `docs/archive/planejamento-pre-codigo/`. Consolidação seletiva
    (quais dos 12+13 itens viram item formal de backlog) fica para
    sessão dedicada, decisão item a item do responsável do projeto — ver
    `docs/archive/README.md` para o detalhe completo do achado.
- **Fase 4 (parcial) e missão extra de limpeza radical — remoção completa
  do Portal legado (`src/` + `test/`), autorizada explicitamente pelo
  responsável do projeto após confirmação de que o legado está
  descontinuado/substituído e que `tear-v2-app/` é a única aplicação
  oficial:**
  - Removidos: `src/` (14 `.js` + 13 `.html`, 556K), `test/` (86 arquivos
    `.test.js` + helpers, 596K, suíte Jest do legado), `eslint.config.js`
    (lint exclusivo de `src/`/`test/`), `.clasp.json.example`,
    `.claspignore`, `appsscript.json`, `scripts/preview-server.mjs`
    (dependia de `src/ui/*.html`, órfão sem `src/`), `package.json`/
    `package-lock.json` da raiz (só serviam a `test`/`lint`/`check`/
    `preview` do legado — confirmado que `mcp/tear-mcp-server`,
    `scripts/clean-notebook.sh`/`sync-notebook.sh` e o CI de
    `tear-v2-app/` são 100% independentes).
  - **Preservação de conhecimento antes da remoção:** algoritmo exato de
    normalização de `ChaveInfluenciadora` (trim + colapso de espaço +
    comparação case-insensitive, valor persistido preserva grafia
    original) extraído do código para `docs/specs/SPEC-003-importacao-inicial-da-base.md` §6.1 —
    único detalhe de regra de negócio que só existia no código-fonte, sem
    essa precisão documentada em nenhuma SPEC. Confirmado por auditoria
    dedicada (comparando `docs/archive/auditorias/AUDITORIA_REGRAS_NEGOCIO_LEGADO_TEAR.md`,
    `docs/planning/CONSOLIDACAO_REGRAS_CRITICAS_P0_TEAR_V2.md`, SPECs e
    `CONTRATO_SOBERANO.md`) que nenhuma outra regra de negócio exclusiva
    do legado ficaria sem fonte em prosa após a remoção.
  - **Arquivados** (não apagados, conteúdo 100% preservado):
    `PROJECT_GOVERNANCE.md` (raiz), `docs/_workspace/DEPLOY_CHECKLIST.md`,
    `docs/_workspace/ROTEIRO_HOMOLOGACAO.md` →
    `docs/archive/legado-apps-script/` — os três eram 100% específicos da
    arquitetura/operação do Portal GAS removido; `PROJECT_GOVERNANCE.md`
    também descrevia como roadmap vigente "V2 é evolução do Apps Script,
    não reescrita tecnológica" (§5.1), afirmação hoje factualmente
    incorreta frente a `ADR-015`.
  - **`README.md` (raiz) reescrito por completo** — a versão anterior
    (407 linhas) descrevia inteiramente o Portal GAS e não mencionava
    `tear-v2-app/` em nenhum lugar. Nova versão descreve o produto real
    (Laravel 13 + React 19/Vite), stack, estrutura, documentação e passos
    de setup (`composer install`/`npm install`).
  - **`knowledge/README.md` reescrito** — descrevia a arquitetura do
    Portal GAS; nova versão descreve a própria pasta `knowledge/`
    (`sistema-b/`, `references/`, `archive/`) como apoio ao
    desenvolvimento de `tear-v2-app/`.
  - **`CLAUDE.md`** — removida menção a `clasp push` (linha do mandato de
    operação autônoma) por não haver mais alvo de deploy via clasp.
  - **Varredura de referências quebradas:** nenhuma referência funcional
    remanescente em documentação viva — as únicas citações restantes a
    `src/`, `PROJECT_GOVERNANCE.md`, `DEPLOY_CHECKLIST.md`,
    `ROTEIRO_HOMOLOGACAO.md` ou `clasp` estão em ADRs históricos
    (`ADR-002/004/010/013`, nunca reabertos por convenção do projeto),
    SPECs e no próprio `TASK_ROUTER.md` como diário — todas toleradas
    como citação histórica, mesmo critério já usado no restante deste
    arquivamento.
- **Fase 4 (restante, não executada):** arquivamento de
  `docs/deployment/`/`docs/release/` continua gated a "só após o corte de
  produção do Go-Live" — Go-Live segue **NÃO AUTORIZADO**.
- **Validação:** suíte completa de `tear-v2-app/` rodada nesta sessão após
  a remoção do legado — `php artisan test` 208/208 verde, `vendor/bin/pint
  --test` limpo, `tsc -b && vite build` sem erros, `oxlint` só o aviso
  pré-existente de `src/lib/auth.tsx`. Nenhum código de `tear-v2-app/`
  alterado nesta rodada (só documentação).
- **Commit `fe5ccf8`, push direto para `feat/ui-design-system-ela`**
  (fast-forward de `ca211f2`).

## 43. Segunda rodada da missão de limpeza — ADR-002 marcado Superseded, ADRs legado com nota histórica, mais 4 pastas de docs consolidadas (2026-07-23)

Continuação da mesma missão (§42), por instrução explícita do responsável
do projeto de: (a) corrigir o status do `ADR-002` em vez de deixá-lo como
"Proposed" dando impressão de decisão ainda em aberto; (b) aplicar o
mesmo critério ao restante do repositório, inclusive corrigindo
referências para eliminar documentos redundantes em vez de preservá-los
só por terem links apontando para eles.

- **`ADR-002`:** Status alterado de "Proposed" para "Superseded by
  ADR-015" — nunca saiu do estágio de proposta (`webapp/` nunca existiu);
  nota de supersessão adicionada.
- **5 ADRs do legado GAS com nota histórica** (não tiveram status
  alterado — foram de fato aceitos e implementados, diferente do
  ADR-002; a nota só deixa claro que descrevem arquitetura removida, não
  orientação vigente): `ADR-004` (fundação técnica Sprint 0), `ADR-005`
  (persistência da Colaboração Mensal em planilha), `ADR-010` (banco
  oficial do Portal), `ADR-013` (OAuth do Portal via HtmlService
  sandboxed), `ADR-014` (consolidação de arquivos por módulo GAS).
- **`docs/architecture/ARQUITETURA_CAMADAS.md`** (100% sobre camadas do
  Portal GAS, zero menção a `tear-v2-app/`) → arquivado em
  `docs/archive/legado-apps-script/`; pasta `docs/architecture/` esvaziada
  e removida.
- **`docs/design/stitch-export/screens/`** (9 mockups estáticos,
  `code.html`+`screen.png`) → arquivado em
  `docs/archive/planejamento-pre-codigo/stitch-screens-mockups/` — todas
  as 9 telas já têm página real implementada em
  `frontend/src/pages/`. `stitch-export/DESIGN.md` (tokens)
  permanece ativo.
- **`docs/deployment/PLANO_IMPLEMENTACAO.md`** (runbook original, 12
  etapas) → arquivado em `docs/archive/deployment-superado/`, mas só
  **depois** de corrigir todas as citações "Etapa N" em documentos vivos
  (`docs/deployment/DEPLOY.md`, `ARQUITETURA_PRODUCAO.md`,
  `IMPLEMENTACAO_TECNICA.md`, `TEAR_V2.5_GO_LIVE_CHECKLIST.md`) para o
  número de etapa correspondente em `docs/deployment/PLANO_DE_IMPLANTACAO.md`
  (17 etapas — numeração e conteúdo por etapa **não são 1:1** com o
  documento antigo; mapeamento feito manualmente por comparação de
  conteúdo, não substituição textual ingênua). Citações de narrativa
  histórica em `ADR-015`/`ADR-016` (descrevem eventos que de fato
  aconteceram contra a numeração antiga) mantidas como estão.
- **3 relatórios de `docs/reports/`** (`HANDOFF_GO_LIVE.md`,
  `HANDOFF_PRODUCTIZACAO_TEAR_V2.md`,
  `RELATORIO_SPRINT_2_1_PORTAL_INFLUENCIADORA.md`) → arquivados em
  `docs/archive/reports-historicos/` — sem referência ativa em
  documentação vigente.
- **2 relatórios NÃO arquivados** apesar de terem sido cogitados
  inicialmente: `HANDOFF_FINAL.md` (citado 9+ vezes como fonte factual
  específica em `docs/reports/ARCHITECTURE_REVIEW_V2_5.md` — "148/148
  testes verdes conforme HANDOFF_FINAL.md", achados P1/P2 específicos)
  e `RELATORIO_QA_FUNCIONAL_MVP_TEAR_V2.md` (citado como base factual em
  `docs/planning/ELA_INFLUENCIA_ENTREGA_1_ANALISE_ESTRATEGICA.md`) —
  ambos são evidência ainda ativamente referenciada, não histórico morto;
  arquivá-los sem primeiro reescrever as citações que dependem deles
  quebraria fatos específicos em documentos vivos de Go-Live.
- **`docs/deployment/PLANO_DE_IMPLANTACAO.md` NÃO fundido com
  `IMPLEMENTACAO_TECNICA.md`** apesar de sobreposição parcial identificada
  na auditoria — fusão de dois documentos operacionais extensos e ainda
  em uso ativo durante a preparação do Go-Live é risco desnecessário
  nesta rodada; ambos mantidos.
- **Validação:** mudança exclusivamente documental, nenhum código de
  `tear-v2-app/` alterado. Grep completo confirmou zero referência viva
  quebrada aos arquivos movidos nesta rodada (as únicas citações
  restantes são narrativa histórica em ADRs/handoffs já históricos).

## 44. Reversão da estratégia de arquivamento — remoção definitiva de `docs/archive/`, `docs/reports/` e 8 ADRs de legado (2026-07-23)

- **Mudança de critério, instrução explícita do responsável do projeto:**
  as três rodadas anteriores desta missão (§42/§43) usaram `git mv` para
  `docs/archive/` como estratégia padrão de baixo risco. O responsável do
  projeto considerou isso "conservador demais" e determinou o critério
  final: **se o conhecimento acionável já está consolidado em
  `ESTADO_SESSAO.md`/`TASK_ROUTER.md`/documentação vigente, o documento
  antigo é removido da árvore, não arquivado** — histórico completo
  permanece disponível via `git log`, só não ocupa mais espaço na árvore
  ativa.
- **Removido nesta sessão** (`git rm`, não `git mv`):
  - `docs/archive/` inteiro (64 arquivos, todas as 10 subpastas
    acumuladas ao longo desta e de sessões anteriores).
  - `docs/reports/` inteiro (7 arquivos) — confirmado antes da remoção
    que achados específicos citados por esses relatórios (ex.:
    `Pagamento::$fillable` inclui campo que deveria ser imutável;
    `AppShell` administrativo para usuário sem role) já estavam
    registrados em `ESTADO_SESSAO.md` §4 e `TASK_ROUTER.md` — nenhuma
    informação de manutenção futura perdida.
  - `docs/knowledge/archive/` (4) e `docs/knowledge/references/` (4) —
    pesquisa de fundação pré-implementação, já consumida pelas decisões
    formais (ADRs, SPECs).
  - **8 ADRs**: `001` (enum `MesReferencia`, confirmado sem uso em
    `tear-v2-app/`), `002` (Superseded by `ADR-015`, nunca implementado),
    `004`/`005`/`010`/`014` (mecânica do Portal GAS removido), `011`
    (rascunho nunca aceito), `013` (fluxo OAuth específico do sandbox do
    Apps Script, `tear-v2-app` usa Sanctum). Restam 6 ADRs vigentes:
    `003`, `012`, `015`, `016`, `017`, `018`.
- **Referências corrigidas** nos documentos vivos que citavam os arquivos
  removidos: `ADR-018` (removida citação ao plano original arquivado,
  reescrita para declarar que o documento de origem foi removido e a
  decisão está formalizada só na própria ADR), `README.md` (raiz, árvore
  de `docs/` e tabela de documentos principais), `docs/knowledge/README.md`
  (reescrito, só resta `sistema-b/`), `docs/planning/*`, `docs/release/*`
  (citações a `HANDOFF_FINAL.md`/roadmaps removidos trocadas por
  referência ao documento vigente correspondente ou removidas quando não
  havia substituto direto).
- **Não tocado, por ser estado sincronizado com serviço externo:**
  `docs/knowledge/.notebook-index.json` mantém entradas para arquivos já
  removidos (inclusive de antes desta sessão, ex.: `knowledge/specs/
  AUDITORIA_SPEC012.md`, `knowledge/sessions/HANDOFF_SESSAO_OAUTH_
  2026-07-18.md` — nomes que não correspondem a nenhuma estrutura já
  vista neste repositório, sinal de que o índice já estava desatualizado
  antes desta sessão). Reconciliação real requer rodar
  `scripts/clean-notebook.sh` (chama a API do NotebookLM via `nlm`) —
  não editado à mão para não gerar inconsistência com o notebook remoto.
- **`docs/_workspace/ESTADO_SESSAO.md` e este arquivo (`TASK_ROUTER.md`)
  não tiveram suas entradas históricas reescritas** — ambos continuam
  citando caminhos hoje removidos em texto narrativo de sessões passadas;
  tratado como jornal (convenção já estabelecida nas rodadas anteriores).
  `ESTADO_SESSAO.md` será reescrito do zero por `/fim` ao encerrar esta
  sessão, o que resolve suas referências desatualizadas.
- **`docs/` passa de ~102 arquivos `.md`** (linha de base da missão de
  simplificação documental original, §28) **para 50 arquivos em 9
  pastas temáticas** (`_workspace`, `adrs`, `deployment`, `design`,
  `history`, `knowledge`, `planning`, `release`, `specs`) — todas
  vigentes, sem pasta de arquivo morto.
- **Validação:** nenhum código de `tear-v2-app/` alterado nesta sessão.
  Suíte completa (`php artisan test` 208/208, `pint --test`, `tsc -b`,
  `vite build`, `oxlint`) validada antes do commit anterior (§43) e não
  afetada por esta rodada (só documentação).

## 45. Arquitetura de comandos do Claude Code (Fases 1-2) + base de conhecimento de referências arquiteturais OSS (2026-07-23)

- **Fase 1 — arquitetura de comandos definida e aprovada:**
  `.claude/commands/<nome>.md` escolhido como mecanismo (não
  `.claude/skills/`) — Claude Code 2.1.218 resolve ambos os formatos pelo
  mesmo `/<nome>`, mas os comandos do projeto são workflows explícitos de
  sessão sem necessidade de auto-trigger ou arquivos auxiliares, então
  Commands é a forma correta (mais simples, já em uso por
  `/comecar`/`/fim`). Critério de quando migrar um comando para Skill
  (múltiplos arquivos de apoio) documentado em `CLAUDE.md` §Comandos
  padrão, sem criar pasta `skills/` vazia. `/prompt-gpt` criado como
  placeholder estrutural (frontmatter + escopo pretendido, sem lógica).
- **Fase 2 — `/comecar` e `/fim` implementados e aprovados:** rotina
  completa de leitura de documentos (condicional, só o relevante à
  missão), checagem cruzada entre documentos + PR aberta via `gh pr
  list`, estrutura de resposta fixa (6 headers), nunca corrige
  automaticamente inconsistência encontrada — só avisa. `/fim`: releitura
  rápida de `CLAUDE.md`/governança antes de escrever, só pergunta se
  faltar informação crítica, atualização condicional de `TASK_ROUTER.md`
  (decisão de arquitetura/domínio) vs. `handoff/README.md` (marco) como
  gatilhos distintos, proibição explícita de alterar SPEC/ADR/PRD no
  encerramento.
- **Pesquisa de mercado OSS aprovada e consolidada:** levantamento de
  projetos open source com funcionalidades análogas ao Influencia (CRM,
  workflow/aprovação, contratos, upload, notificações, portais,
  dashboards etc.) via GitHub Search API, publicado primeiro como artifact
  e depois consolidado (sem métricas efêmeras — estrelas/atividade) em
  `docs/knowledge/referencias-externas/REFERENCIAS_ARQUITETURAIS.md`.
  `docs/knowledge/README.md` atualizado para descrever as duas categorias
  hoje existentes (`sistema-b/` e `referencias-externas/`). 5 projetos
  priorizados para estudo profundo: Payload, Medusa (motor de workflow),
  Frappe (motor de workflow declarativo), Documenso, Atrium — justificativa
  completa no documento.
- **Achado de governança corrigido:** o commit `8060e18` ("establish Phase
  2 governance model") havia gravado o conteúdo completo de
  `GOVERNANCA_DO_PROJETO.md` e a entrada histórica que deveria estar em
  `handoff/README.md` **dentro de `ESTADO_SESSAO.md`** (que chegou a 767
  linhas), violando os próprios princípios de Fonte Única da Verdade /
  Estado ≠ Histórico que a governança define — e deixando
  `docs/handoff/README.md` real sem nenhuma entrada de histórico. Reportado
  ao responsável do projeto nesta sessão; corrigido como efeito colateral
  da reescrita completa de `ESTADO_SESSAO.md` pelo `/fim` desta sessão (a
  duplicação não foi reintroduzida) e pelo registro da primeira entrada
  real em `docs/handoff/README.md`.
- **Não implementado ainda:** lógica de `/prompt-gpt` (Fase 3, aguardando
  aprovação) e, mencionados pelo responsável do projeto para quando a
  Fase 3 chegar, possíveis `/prompt-cursor`/`/prompt-codex` reaproveitando
  lógica compartilhada em vez de duplicar.
- **Não commitado nesta sessão:** todas as mudanças acima ficaram no
  working tree (branch `docs/governance-phase2`) — ver `ESTADO_SESSAO.md`
  §Pendências.
- **Próxima sessão:** nova pesquisa de mercado focada em arquiteturas
  modernas baseadas em MySQL (mesmo padrão: artifact primeiro, consolidar
  em `docs/knowledge/` só se aprovado).

## 46. Missão de documentação arquitetural — CLAUDE.md revisado, Etapa 2 bloqueada (2026-07-23)

- **Contexto:** sessão recebeu missão de atuar como "Arquiteto de
  Documentação" — revisar `CLAUDE.md` (Etapa 1) e os 4 documentos de
  `docs/arquitetura/` (Etapa 2), validando contra `provisorios/` (legado)
  e um artifact de pesquisa arquitetural consolidada.
- **`/comecar` revelou divergência não documentada:** `docs/arquitetura/
  {README,01,02,03}.md` já existiam no working tree com 513 linhas
  não commitadas, sem nenhum registro em `ESTADO_SESSAO.md` ou aqui —
  provável trabalho de sessão anterior nunca fechado por `/fim`. Commit
  `cad13ac` havia criado esses 4 arquivos **vazios** (blob vazio); todo o
  conteúdo estava só no working tree.
- **Achado bloqueante (Etapa 2 não executada):** os 4 arquivos são
  esqueletos de template, não conteúdo real — `02-arquitetura-alvo.md`
  contém a instrução literal, nunca executada, "cole abaixo, sem
  alterações, o documento arquitetural produzido pelo Codex";
  `01-mineracao-do-legado.md` tem seções com `"..."` e `"Observações:
  ..."` vazias; `03-plano-mestre-de-implementacao.md` começa na "Fase 3",
  referenciando "Bootstrap"/"Autenticação" como dependências nunca
  definidas no documento.
- **Fontes candidatas descartadas após checagem:**
  `provisorios/documento_de_arquitetura_influencia.md` propõe stack
  **Next.js + Prisma + MySQL**, contradizendo a stack oficial (Laravel +
  React + MySQL, confirmada por `backend/composer.json` e ADR-015) — não
  serve como fonte de `02`. `provisorios/deep-research-report.md` é a
  pesquisa OSS já consolidada em `docs/knowledge/referencias-externas/`
  — não é mineração de legado, não serve como fonte de `01`. O artifact
  de pesquisa arquitetural (URL fornecida pelo responsável) **não pôde
  ser acessado** — erro de permissão de leitura pública.
- **Achado de duplicação real, não resolvido:**
  `docs/arquitetura/03-plano-mestre-de-implementacao.md` (esqueleto) e
  `docs/planning/PLANO_MESTRE_ELA_INFLUENCIA.md` (real, vigente, v1.0,
  2026-07-21, referenciado por este documento) cobrem o mesmo papel de
  "plano mestre". Não decidido qual prevalece ou se têm escopos
  distintos — registrado como nota em `CLAUDE.md`, não resolvido no
  conteúdo.
- **Achado lateral:** `provisorios/documento_de_arquitetura_influencia.md`
  parece já ser um rascunho da "próxima pesquisa de mercado sobre
  MySQL" recomendada na sessão anterior (título interno "MISSÃO 2",
  foco em padrões MySQL 8+) — mas propõe stack divergente da oficial, e
  não foi revisado nem aprovado. Não tratar como pesquisa concluída sem
  decisão do responsável.
- **Decisão do responsável durante a sessão:** diante do bloqueio,
  perguntado como proceder; escolheu **"só CLAUDE.md por agora"** —
  Etapa 2 (docs/arquitetura/01-03) explicitamente não executada,
  aguardando uma de quatro opções levantadas (fornecer conteúdo real,
  habilitar acesso ao artifact, autorizar rascunho do agente, ou manter
  como está).
- **Executado (Etapa 1):** `CLAUDE.md` revisado — adicionadas seções
  `Projeto`, `Como entender este projeto` (com nota sobre o bloqueio
  acima), `Documentação complementar` (mapa de responsabilidade única
  das 12 pastas de `docs/`), `Convenções permanentes` (só regras
  verificáveis em ADR/código: Policies em `backend/app/Policies/`,
  Services em `backend/app/Services/`, ausência de classes `Generic*`,
  frontend servido pelo Laravel via ADR-015) e `Fluxo de trabalho`
  (pipeline de entrega macro, distinto do `Fluxo obrigatório` por
  tarefa). Removidos dois stubs nunca preenchidos (`Leitura obrigatória
  antes de alterar código`, `Regras de arquivos` — eram texto de
  template, redundantes com seções já reais). Corrigido caminho de
  `CONTRATO_SOBERANO.md` (apontava para a raiz; está em `docs/history/`).
- **Não alterado:** os 4 documentos de `docs/arquitetura/`, `docs/
  planning/PLANO_MESTRE_ELA_INFLUENCIA.md`, nenhum ADR/SPEC/PRD.
- **Não commitado nesta sessão.** Nenhum push.
- **Achado não relacionado a esta missão:** dois arquivos não rastreados
  apareceram no working tree durante a sessão sem relação com o trabalho
  realizado aqui — `backend/package-lock.json` e `dev.sh` (criados
  2026-07-23 11:42 e 11:50). Origem desconhecida; não foram tocados.

## 2026-07-23 — §47 Correção do ambiente de desenvolvimento local (composer dev)

Sessão paralela à do §46, sem relação com a missão de documentação
arquitetural. Resolve inclusive a origem "desconhecida" de
`backend/package-lock.json`/`dev.sh` apontada no achado lateral do §46:
eram produto desta sessão, rodando em paralelo.

- **Sintoma relatado:** `composer dev` iniciava dois processos Vite
  concorrentes na porta 5173; `http://localhost:5173` mostrava a tela
  padrão "Laravel + Vite" em vez da aplicação React.
- **Causa raiz:** `backend/composer.json` script `dev` rodava `npm run
  dev` com `cwd` em `backend/` — disparava o Vite do scaffold padrão do
  Laravel (`backend/resources/js/app.js`, `backend/vite.config.js`,
  Tailwind), nunca referenciado por nenhuma view (`grep @vite` vazio),
  competindo pela porta 5173 com o Vite real de `frontend/` (React).
- **Corrigido:** `composer.json` (`dev` chama `npm --prefix ../frontend
  run dev`; `setup` instala deps do frontend e copia `frontend/.env`);
  `backend/package.json` reduzido a só `concurrently`; removidos
  `backend/vite.config.js`, `backend/resources/js/app.js`,
  `backend/resources/css/app.css`; removido script `dev:all` e dep
  `concurrently` não usada de `frontend/package.json`; `dev.sh`
  (script improvisado) apagado; `README.md`/`backend/README.md`
  atualizados para `composer dev` como único fluxo.
- **Validado por navegação real** (Chrome DevTools): `localhost:5173`
  carrega a SPA (login, navegação client-side, `POST
  localhost:8000/api/login` via CORS/Sanctum sem erro).
- **Entrega:** PR #78 (branch `worktree-fix-dev-env`), draft. Mesmos
  commits aplicados via `cherry-pick` em `docs/governance-phase2`
  (checkout principal) para teste imediato — push/merge ainda pendente,
  decisão do responsável do projeto.
- Comando oficial: `cd backend && composer dev`. Aplicação:
  `http://localhost:5173`. API: `http://localhost:8000/api`.

## 2026-07-23 — §48 Ativação do Design System oficial como SSOT de UI/UX

Sessão dedicada exclusivamente a auditoria — nenhum arquivo do repositório
alterado, nenhum commit. Sem relação com §46/§47.

- **Objetivo:** conectar ao Claude Design MCP, importar o projeto "Estúdio
  Elã Design System" (`019e139d-3dee-7162-a2d8-6b19c32c0225`), comparar com
  a cópia local em `est-dio-el-design-system/`, e confirmar se pode ser
  adotado como Fonte Única da Verdade (SSOT) para UI/UX e documentação
  visual — sem implementar nada.
- **MCP vs. cópia local:** confirmados idênticos. 169 arquivos comparados
  por caminho e tamanho; 167 batem exatamente; os 2 restantes
  (`uploads/PIV - ELÃ.pdf` e a variante `-9ba0a379`) são o mesmo arquivo,
  divergindo só na normalização Unicode do nome (NFC no MCP vs. NFD no
  filesystem macOS local) — sem divergência de conteúdo.
- **Achado — inconsistência interna no próprio Design System** (presente
  igualmente no MCP e na cópia local, não é problema de sincronização):
  `SKILL.md` cita bordô `#a1231f`, vinho `#6b1612` e tipografia "acumin
  pro" como se fossem vigentes. `colors_and_type.css` (que se autodeclara
  *"single source of truth"*) e `README.md` já corrigem isso — bordô
  `#CD0005`, vinho `#791815`, body em Helvetica Neue (`README.md` seção
  "known caveats": *"an earlier version of this system referenced acumin
  pro — corrected; ignore the typekit acumin reference in the github
  repo"*). `assets/styles.css` (CSS de produção herdado do site) também
  carrega os valores antigos — é o legado minerado, não a fonte declarada.
  `colors_and_type.css` mantém `--bordo-legacy: #a1231f` explicitamente
  marcado *"do not use"*.
- **Decisão do responsável do projeto (confirmada nesta sessão):**
  `colors_and_type.css` + `README.md` prevalecem como SSOT para cores,
  tipografia e tokens; `SKILL.md` e `assets/styles.css` são tratados como
  conteúdo legado sempre que houver conflito nesses temas.
- **Design System ativado** como referência visual oficial do projeto a
  partir desta sessão, para decisões de UI, UX e documentação visual.
  Não substitui AI Constitution, `CLAUDE.md` nem os documentos de
  arquitetura — governa apenas interface e identidade visual.
- **Não executado nesta sessão (fora de escopo, por instrução explícita):**
  nenhuma implementação de componente, nenhuma atualização de
  documentação (`docs/design/` não tocado), nenhum commit.
- **Auditoria de conteúdo (resumo):** tokens/cores (trio de marca + 6
  neutros), tipografia (IvyPrestoDisplay display + Helvetica Neue body +
  Archivo secundário, regra de "vowel italic"), espaçamento (grid 8pt,
  `--s-1` a `--s-10`), raios/bordas (raio 0 exceto pill CTA, só hairlines,
  sem sombra), ícones (SVG de linha custom, stroke ~1.5, sem fonte de
  ícone terceirizada), componentes catalogados em `_ds_manifest.json`
  (accordion, CTA pill, nav link, section blocks, aplicações prontas, UI
  kit completo do site), princípios ("quiet luxury", editorial europeu,
  zero ornamento/gradiente/textura/blur).

## 2026-07-23 — §49 Hardening de produção Laravel + decisão de migrar de hospedagem (rebranding "Criativo Dodô")

Sessão com três blocos, todos sobre infraestrutura/produção. Sem relação
com §46/§47/§48.

- **Auditoria + hardening de config de produção Laravel:** auditoria
  read-only de `.env`/`config/{app,session,sanctum,cors}.php` contra o
  destino `https://portal.estudioela.com` identificou 8 itens a
  corrigir. Plano de migração desses 8 itens registrado (dependência de
  SSL, risco, reinício de serviço vs. `config:clear`/`config:cache`,
  ordem de aplicação) — achado central: `SESSION_SECURE_COOKIE=true`
  aplicado antes do SSL confirmado no host final causa lockout total de
  autenticação, é o único item com dependência dura de certificado.
  **Executado nesta sessão:** `APP_ENV` (`local`→`production`) e
  `APP_DEBUG` (`true`→`false`) alterados no `backend/.env` local (backup
  em `backend/.env.backup-20260723-185819`), validados via `php artisan
  config:clear`/`config:cache`/`about` (`Environment: production`,
  `Debug Mode: OFF` confirmados). Os outros 6 itens (`APP_URL`,
  `FRONTEND_URL`, `APP_KEY` de produção, `SANCTUM_STATEFUL_DOMAINS`,
  `SESSION_DOMAIN`, `SESSION_SECURE_COOKIE`) ficaram pendentes de
  propósito — dependem de qual host final for escolhido no bloco
  seguinte, então não fazia sentido fechá-los ainda na Locaweb.

- **Decisão: migrar da Locaweb.** Avaliação comparativa e crítica de 12
  provedores (Hostinger, Locaweb, HostGator, KingHost, UOL Host,
  DigitalOcean, Hetzner, Vultr, Linode/Akamai, Contabo, Laravel
  Forge/Ploi, Laravel Cloud), com pesquisa paralela de dados atuais
  (2025/2026, não memória do modelo). Achado que fecha a decisão: o
  problema de SSL em subdomínio sofrido com a Locaweb é documentado
  (ReclameAqui + doc oficial da própria Locaweb) como falha estrutural
  recorrente do produto, não incidente isolado — não se resolve subindo
  de plano. **Recomendação entregue:** Laravel Forge (ou Ploi) sobre VPS
  Vultr ou Linode/Akamai, região São Paulo, banco autogerenciado, dentro
  de teto de R$200/mês informado pelo responsável do projeto nesta
  sessão. Detalhe completo (notas por provedor, prós/contras, riscos)
  só na conversa desta sessão — não persistido em arquivo à parte.

- **Rebranding "Elã" → "Criativo Dodô" anunciado** pelo responsável do
  projeto nesta sessão: nomes/docs/variáveis/projetos modificados a
  partir de agora devem usar "Dodô"; identidade visual (cores, logo,
  fontes, layout) **não** muda nesta etapa. Nenhum arquivo do repositório
  foi renomeado ou alterado por causa disso nesta sessão — só o
  planejamento de infraestrutura abaixo foi feito sob esse contexto.

- **Auditoria de repositório para escolher domínio+hospedagem do projeto
  renomeado (em andamento, interrompida pelo usuário antes da pesquisa de
  preço):** extraído do código/docs, sem inventar valor nenhum —
  PHP `^8.3` (`composer.json`) vs. `8.5-fpm-alpine` (Dockerfile de
  produção); Laravel `^13.8`; Node 26 só usado no build (roda no CI, não
  no host); extensões PHP reais confirmadas via Dockerfile (`pdo`,
  `pdo_pgsql`, `pdo_mysql`, `mbstring`, `bcmath`, `zip`, `intl`,
  `opcache` — lista mais longa de `ext-*` encontrada via grep bruto no
  `composer.lock` descartada por ser provavelmente `suggest`/`provide`
  de dependências, não requisito real); fila `database` sem worker
  persistente (via Crontab, `queue:work --stop-when-empty`); cache
  `database`; sem `config/broadcasting.php` nem pacote de websockets;
  frontend com build estático (`npm run build:locaweb`) plugado em
  `public/build` do Laravel.
  - **Achado crítico — divergência não resolvida:** `CLAUDE.md` descreve
    a stack como "Laravel + React + MySQL", mas toda a documentação de
    deploy real (`docs/deployment/ARQUITETURA_PRODUCAO.md`,
    `CONFIGURACAO_PRODUCAO.md`, `IMPLEMENTACAO_TECNICA.md`,
    `PLANO_DE_IMPLANTACAO.md`) e o `docker-compose.yml`
    (`db: image: postgres:16-alpine`) confirmam **PostgreSQL 16** como
    decisão já fechada. `config/database.php` usa `sqlite` só como
    default de dev. Relevante porque a maioria dos hosts brasileiros
    baratos só oferece MySQL nativo — filtro obrigatório na próxima
    pesquisa de hospedagem.
  - **Achado:** uploads de material das influenciadoras já vão direto
    para o Google Drive via OAuth (`ARQUITETURA_PRODUCAO.md` §"Estratégia
    para Google Drive") — não usa disco local nem S3/Spaces, reduzindo o
    porte de storage necessário no host novo.
  - **Achado:** existe uma decisão soberana registrada e marcada como
    "Aprovada e definitiva" em `ARQUITETURA_PRODUCAO.md` (2026-07-21):
    *"zero custo recorrente adicional, zero serviço contratado novo"* —
    justificava ficar 100% na Locaweb. Está em conflito direto com a
    decisão de migrar desta mesma sessão. Precisa de novo registro
    formal (fora do escopo do `/fim`) quando a migração for confirmada.
  - **Ambiguidade não resolvida:** o repositório documenta dois caminhos
    de deploy — build estático dentro do `public/` do Laravel (origem
    única, conforme ADR-015) vs. `docker-compose.yml` com o frontend
    rodando num container Nginx separado, porta própria (5173). Uma nota
    em `PLANO_DE_IMPLANTACAO.md` chama o caminho Docker de "arquitetura
    anterior", sugerindo que o primeiro é o vigente, mas isso não foi
    confirmado com o responsável do projeto antes da interrupção.
  - **Entregue ao usuário:** blocos 1 (stack/runtime) e 2 (recursos/porte,
    como estimativa qualificada, não número documentado) completos, com
    fonte de cada afirmação. Blocos 3-6 (tráfego/dados, requisitos que
    pesam no preço, domínio, restrições) entregues como perguntas
    objetivas em aberto — sessão interrompida pelo usuário antes da
    pesquisa de preço e da tabela comparativa final.
  - **Pendente para a próxima sessão:** respostas do usuário aos blocos
    3-6, confirmação da topologia de deploy (origem única vs.
    docker-compose) e confirmação do teto de orçamento válido
    especificamente para domínio+hospedagem (o R$200/mês desta sessão
    foi dado no contexto da avaliação de múltiplos projetos + SaaS
    futuro, não necessariamente o mesmo número aqui) — só depois disso
    pesquisar preços atuais e montar a tabela comparativa de 3+ opções
    pedida pelo usuário.

## 2026-07-23 — §50 Decisão de hospedagem (Locaweb Hospedagem II), rebranding "Criativo Dodô" e virada para fase de implantação

Sessão de continuação direta do §49 (mesmo dia). Sem relação com §46/§47/§48.

- **Mudança de premissa:** PostgreSQL deixou de ser requisito obrigatório
  — MySQL aceito como motor de banco, decisão do responsável do projeto,
  porque praticamente nenhuma hospedagem compartilhada considerada
  oferece Postgres. VPS e Forge/Ploi/Laravel Cloud explicitamente
  descartados para esta fase — só hospedagem compartilhada/gerenciada.
- **Novo ranking, restrito aos provedores já analisados no §49** (VPS/
  Forge fora de escopo agora): KingHost (1º, nota 8 — SSH incluso desde
  o plano de entrada, MySQL ilimitado em todos os planos, sem falha
  estrutural documentada), Hostinger (2º, nota 7,5 — melhor stack técnico
  do grupo, mas armadilha de preço de renovação), HostGator (3º, nota 6
  — mais barato, mas a própria empresa recomenda minimizar uso de cron,
  o que conflita com o scheduler do Laravel). Locaweb e UOL Host
  mantidos fora do top 3 por motivos **não relacionados a Postgres/
  MySQL** (Locaweb: SSL em subdomínio, achado do §49; UOL Host: MySQL
  5.6 EOL como padrão do plano compartilhado). Preços confirmados via
  fetch nas páginas oficiais nesta sessão (Hostinger, KingHost), não
  inventados. Resposta direta dada quando perguntado "se fosse seu
  dinheiro": KingHost, plano Hospedagem III (R$19,99/mês, 5 sites).

- **Decisão real do responsável do projeto, contrária à recomendação
  técnica dada:** contratada **Locaweb Hospedagem II Linux** (status
  ativa) + domínio **`criativododo.com.br`** (registrado 2026-07-23,
  `provider: LOCAWEB (2)` confirmado via whois). Justificativa do
  responsável: melhor custo-benefício dentro do orçamento atual,
  objetivo de colocar o sistema em produção imediatamente, contrato
  deliberadamente curto para reduzir risco e permitir reavaliação
  futura. **Decisão aceita sem propor reversão — não reabrir a
  discussão de hospedagem durante esta fase.**

- **Rebranding efetivado: "Estúdio Elã" → "Criativo Dodô".** A partir
  desta sessão, todo código/documentação/texto/variável/URL/exemplo
  **novo** deve usar "Dodô"/`criativododo.com.br`. Identidade visual
  (logo, cores, tipografia) **não muda** nesta etapa — só o nome
  institucional. Nada foi renomeado retroativamente nesta sessão.

- **Separação de ambientes declarada pelo responsável:** ambiente legado
  (`estudioela.com`, `elafashionmkt.com.br`) **congelado** — só
  referência/migração, sem novas dependências, sem diagnóstico adicional
  salvo pedido explícito. Ambiente novo (`criativododo.com.br`) passa a
  ser produção principal a partir de agora. Preferência declarada:
  "configurar corretamente do zero" > "adaptar legado", quando houver
  escolha.

- **Correção factual registrada (não uma reversão de decisão):** o
  responsável do projeto pediu para tratar o achado de SSL em subdomínio
  da Locaweb (§49) como "hipótese sem evidência, derivada da bagunça do
  ambiente legado" (duas hospedagens, dois domínios, DNS distribuído).
  Corrigido nesta sessão: a evidência original veio de reclamações de
  **outros clientes** da Locaweb no ReclameAqui e da **documentação
  oficial da própria Locaweb** sobre o funcionamento do emissor Let's
  Encrypt deles (exige DNS apontado exatamente para eles, trata bloqueio
  de rate-limit do ACME como esperado) — não do ambiente legado deste
  projeto. Concordado, na prática, em validar tudo do zero no ambiente
  novo, sem pré-julgar nem bloquear nada antecipadamente — mas o achado
  não foi descartado como "sem evidência", porque tem evidência real. A
  ser validado explicitamente quando a etapa de SSL da implantação for
  executada.

- **Virada de fase formal:** investigação do ambiente legado encerrada.
  Foco passa a ser implantação do TEAR no ambiente novo. O agente assume
  o papel de **Lead DevOps / Arquiteto de Implantação**. Regra de
  trabalho explícita do responsável: nunca entregar lista grande de
  tarefas — um passo por vez (objetivo → validar estado atual com
  evidência observável → executar só o próximo passo → confirmar
  resultado → avançar), sem reutilizar procedimentos do ambiente legado
  nem presumir que problemas antigos vão se repetir.

- **Primeiro passo de implantação executado:** verificação read-only de
  DNS de `criativododo.com.br` (`dig` + `whois`, sem necessidade de
  credenciais). Achado: domínio registrado hoje (2026-07-23) via Locaweb
  como registrar, status `active`, mas **sem nenhum nameserver
  configurado e sem registro A — ainda não resolve**. Interpretado como
  provável propagação normal de registro no mesmo dia, não confirmado
  como problema. **Bloqueado ao final da sessão** esperando o
  responsável do projeto confirmar, no painel da Locaweb, se o domínio
  já está vinculado à Hospedagem II contratada — próximo passo da
  implantação depende dessa confirmação, e dos dados de acesso ao
  painel/SSH/status do MySQL, que só o responsável tem.

- **Nota de obsolescência:** a tarefa "pesquisar preços atuais e montar
  tabela comparativa de domínio+hospedagem", registrada como próxima
  tarefa recomendada ao final do §49, está **superada** — o responsável
  do projeto decidiu e contratou diretamente antes dessa pesquisa
  acontecer. Não retomar.

## 2026-07-23 — §51 Migração de domínio na documentação de deploy (reconciliação pós-rebranding)

Sessão de continuação (mesmo dia), sem trabalho de infraestrutura real —
só documentação. Consequência direta do rebranding/migração de domínio
registrados em §50.

- **Pedido do responsável do projeto:** migrar referências ao domínio
  institucional antigo (`estudioela.com`) para o novo
  (`criativododo.com.br`, aplicação em `portal.criativododo.com.br`) em
  todo o repositório, por processo controlado — auditoria e
  classificação antes de qualquer edição, não substituição cega de
  texto.
- **Auditoria executada:** grep completo de `estudioela\.com` no
  repositório (excluindo `.git`/`node_modules`/`vendor`/worktrees),
  classificação em três grupos — **alterar** (config/template/checklist/
  placeholders de UI), **não alterar** (ADRs, `TASK_ROUTER.md`,
  `AUDITORIA_LOCAWEB.md`, `docs/PRD.md`, Design System da marca antiga,
  worktrees de outras sessões) e um **bucket ambíguo**: 5 documentos de
  deploy/arquitetura (`ARQUITETURA_PRODUCAO.md`, `PLANO_DE_IMPLANTACAO.md`,
  `IMPLEMENTACAO_TECNICA.md`, `RUNBOOK_DEPLOY_E_ROLLBACK.md`,
  `CHECKLIST_GO_LIVE.md`) cuja decisão "zero custo recorrente adicional"
  (`ARQUITETURA_PRODUCAO.md`, 2026-07-21, "aprovada e definitiva") é
  diretamente contradita pela contratação real de domínio novo +
  Hospedagem II. Relatório entregue ao responsável **antes** de qualquer
  edição, conforme Fluxo obrigatório do `CLAUDE.md`.
- **Decisão do responsável sobre o bucket ambíguo:** reconciliar de
  verdade, não só trocar a string — refletir a infraestrutura
  efetivamente adotada (domínio `criativododo.com.br`, app
  `portal.criativododo.com.br`, Locaweb Hospedagem II Linux),
  substituindo a estratégia de "zero custo recorrente adicional"
  (inválida desde a contratação do novo domínio/hospedagem), preservando
  a decisão de 2026-07-21 como nota de revisão histórica em vez de
  apagá-la, e **sem** registrar valores financeiros novos (fora de
  escopo).
- **Executado — 9 arquivos:**
  - `backend/.env.production.example`: `APP_URL`/`SESSION_DOMAIN`/
    `FRONTEND_URL`/`SANCTUM_STATEFUL_DOMAINS` → `portal.criativododo.com.br`
    (template de produção; `.env` real do host não existe ainda).
  - `frontend/src/pages/Login.tsx`, `ForgotPasswordPage.tsx`: placeholder
    de e-mail de exemplo.
  - `docs/release/GATE_FINAL_GO_LIVE.md`,
    `docs/deployment/CHECKLIST_GO_LIVE.md`: item de checklist de DNS.
  - `docs/deployment/ARQUITETURA_PRODUCAO.md`, `PLANO_DE_IMPLANTACAO.md`,
    `IMPLEMENTACAO_TECNICA.md`, `RUNBOOK_DEPLOY_E_ROLLBACK.md`: nota de
    revisão datada 2026-07-23 no topo + seções operacionais (hospedagem,
    domínio, diagrama, tabela-resumo, comandos de exemplo, variáveis)
    atualizadas para o ambiente novo; decisão original de 2026-07-21/22
    preservada como histórico, com a supersessão explicitada em cada
    ponto relevante (inclusive a auditoria de hospedagem legada citada em
    `PLANO_DE_IMPLANTACAO.md` Etapa 2, marcada como não reconfirmada para
    a Hospedagem II).
- **Deliberadamente não tocado** (com justificativa registrada no
  relatório ao responsável): `docs/adrs/ADR-015-*.md` (ADR — nunca
  reaberto sem novo ADR); `docs/deployment/AUDITORIA_LOCAWEB.md`
  (relatório de auditoria pontual do ambiente legado, fato histórico);
  `docs/_workspace/TASK_ROUTER.md`/`ESTADO_SESSAO*.md` (histórico/
  snapshot); `docs/PRD.md` (URL real do formulário externo do sistema
  legado, ainda em produção); `est-dio-el-design-system/**` (ativo de
  marca "Estúdio Elã" — identidade visual não muda nesta etapa, por
  regra já registrada em §50); `.claude/worktrees/**` (ambientes
  isolados de outras sessões, fora de escopo).
- **Verificação final:** grep pós-edição confirmou que as únicas
  ocorrências remanescentes de `estudioela.com` no repositório são
  intencionais — contexto histórico/explicativo dentro dos próprios
  documentos reconciliados, ou nos arquivos da categoria "não alterado"
  acima.
- **Fora de escopo, não corrigido nesta sessão:** a divergência
  MySQL/PostgreSQL nos mesmos 5 documentos (§49/§50 já registravam essa
  pendência) segue sem correção — os documentos reconciliados ainda
  descrevem PostgreSQL gerenciado da Locaweb, não MySQL. Nenhuma
  infraestrutura real foi tocada ou validada nesta sessão — só
  documentação.

## 2026-07-23 — §52 Fechamento da migração de domínio (`elafashionmkt`/`DEPLOY.md`) e resolução MySQL/PostgreSQL

Sessão de continuação (mesmo dia, após `/clear`), sem trabalho de
infraestrutura real — só documentação. Pedido do responsável: preparar o
projeto para o primeiro deploy assumindo (sem saber que já estava em
andamento) o mesmo rebranding/domínio/hospedagem de §50/§51. Auditoria
inicial identificou que a sprint pedida já estava quase inteiramente
executada em §51; responsável confirmou continuar fechando gaps em vez de
criar documento novo (rejeitou explicitamente criar `DEPLOY_LOCAWEB.md` —
"não crie documentação duplicada... utilize apenas a documentação
existente como fonte canônica").

- **Gap 1 fechado — `elafashionmkt` nunca tinha sido auditado** (§51 só
  cobriu `estudioela.com`). Grep completo (41 ocorrências) classificado:
  **nenhuma é referência institucional de marca/domínio a migrar** — são
  todas referências factuais e ainda vigentes à conta/organização Google
  real usada no OAuth do Google Drive (`elafashionmkt@gmail.com`,
  `elafashionmkt-org`, ver `ADR-017`), preservadas em `GoogleDriveService.php`,
  `.env.production.example`, `ADR-017`, e nos documentos de deploy — ou
  fatos históricos em `AUDITORIA_LOCAWEB.md`/`TASK_ROUTER.md`. Rebranding
  institucional não afeta essa conta Google. **Nenhuma alteração
  necessária** nesse grupo. `portal.estudioela` (padrão citado pelo
  responsável): 0 ocorrências — nunca existiu, só `influencia.estudioela.com`.
- **Gap 2 fechado — `docs/deployment/DEPLOY.md` nunca reconciliado em
  §51** (não estava na lista dos 9 arquivos daquela sessão). Adicionada
  nota de revisão datada (mesmo padrão dos outros 4 documentos) + 4
  correções pontuais: domínio/hospedagem no §1 (Pré-requisitos), e-mail de
  exemplo do admin (`admin@estudioela.com` → `admin@criativododo.com.br`),
  decisão de domínio no §9 (estava descrita como "a decidir", já está
  decidida desde §50). `CONFIGURACAO_PRODUCAO.md` e `MONITORING.md`
  revisados e **não precisaram de alteração** (o primeiro usa domínio
  genérico de exemplo por design; o segundo não menciona domínio/
  hospedagem). `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md` e
  `TEAR_V2.5_RELEASE_READINESS.md` revisados — já se declaram histórico
  preservado, com nota apontando para `ARQUITETURA_PRODUCAO.md` como
  decisão vigente; nenhuma alteração necessária.
- **Gap 3 fechado — divergência MySQL/PostgreSQL (`CLAUDE.md`), pendência
  aberta desde §49/§51.** Investigação por evidência (não presunção):
  `docker-compose.yml` (`postgres:16-alpine`), `Dockerfile`
  (`pdo_pgsql`/`postgresql-dev`), `backend/.env.production.example`
  (`DB_CONNECTION=pgsql`) e a decisão explícita e motivada em
  `ARQUITETURA_PRODUCAO.md` §2 ("Decisão: PostgreSQL gerenciado... sem
  esforço de portar para MySQL") convergem: **PostgreSQL permanece como
  decisão arquitetural do projeto** — isso é uma afirmação sobre a
  arquitetura, não sobre o ambiente de produção. A disponibilidade
  efetiva de PostgreSQL no ambiente contratado (Hospedagem II) é
  provisionamento, não arquitetura, e só será confirmada depois do
  provisionamento completo (painel/suporte, ver alerta abaixo) — as duas
  coisas não devem ser tratadas como a mesma pergunta. A nota "MySQL
  aceito" de §50 era condicionada a hospedagens compartilhadas específicas
  (KingHost/Hostinger/HostGator) que **não** foram as contratadas — a
  Locaweb Hospedagem II efetivamente contratada, segundo o responsável do
  projeto nesta sessão, suporta PostgreSQL. `CLAUDE.md` linha 13 (só doc,
  sem ADR por trás) corrigida de "MySQL" para "PostgreSQL" para refletir a
  decisão arquitetural real. **Alerta adicionado em
  `ARQUITETURA_PRODUCAO.md` §2**, não decisão nova: no plano
  anterior (Hospedagem I) o painel também listava PostgreSQL como
  disponível, mas o suporte oficial da Locaweb confirmou depois que o
  plano contratado não habilitava de fato (§27) — a mesma armadilha pode
  se repetir na Hospedagem II; não tratar disponibilidade como fato até
  confirmação real no painel/suporte.
- **Config Laravel (`config/cors.php`, `sanctum.php`, `session.php`,
  `cache.php`, `filesystems.php`, `queue.php`, `mail.php`, `app.php`,
  `bootstrap/app.php`, `composer.json`) reauditados:** nenhum hardcode de
  domínio/host legado encontrado — `cors.php` e `sanctum.php` usam
  `env('FRONTEND_URL')`/`env('SANCTUM_STATEFUL_DOMAINS')`, sem literal.
  Confirma que `backend/.env.production.example` (já correto desde §51)
  é o único lugar que precisa do valor real.
- **Achado novo, não corrigido (fora do escopo desta sessão, só
  reportado):** `CLAUDE.md` linha 5 ainda descreve o projeto como
  "Estúdio Elã, produto 'ELÃ | influência'" — não reconciliado com o
  rebranding institucional "Criativo Dodô" de §50. Decisão de negócio do
  responsável (aplicar retroativamente à descrição do projeto ou manter,
  já que §50 disse "não retroativo"), não decisão técnica — não alterado
  sem confirmação explícita.
- **Achado novo, não corrigido (pré-existente, fora do escopo):**
  triplicação de checklists de Go-Live (`docs/deployment/CHECKLIST_GO_LIVE.md`,
  `docs/release/GATE_FINAL_GO_LIVE.md`, `docs/release/TEAR_V2.5_GO_LIVE_CHECKLIST.md`)
  com escopos parcialmente sobrepostos — cada um já se declara com um
  papel distinto (execução atual / gate de autorização / histórico
  preservado), então não é duplicação cega, mas vale revisão dedicada
  futura se confundir execução real.
- **Nenhuma infraestrutura real foi tocada.** Sem SSH, sem `.env` real,
  sem alteração de banco/DNS — só documentação/config-template, como
  pedido explicitamente pelo responsável. Nada commitado nesta sessão.

## 2026-07-24 — §53 Migração visual completa para o Design System "criativo DODÔ" (`ADR-019`) + tentativa de retomada da implantação (bloqueada)

Sessão de continuação. Duas frentes, a segunda interrompida por bloqueio externo e
formalmente pausada a pedido do responsável.

### Frente 1 — Implantação (Locaweb Hospedagem II): bloqueada, pausada

- Responsável confirmou infraestrutura provisionada: domínio principal
  ativo, subdomínio `portal.criativododo.com.br` criado, SSL do domínio
  principal ativo (Let's Encrypt, confirmado por evidência de rede —
  `openssl`/`curl`), FTP provisionado (porta 21 confirmada aberta por
  `nc`, múltiplas vezes, múltiplas redes de origem), PostgreSQL disponível
  para criação (ainda não criado).
- SSH: habilitado no painel pelo responsável, mas a porta 22 nunca
  completa handshake TCP — testado em 2 hostnames oficiais
  (`ftp.criativododo.com.br`, `ftp.criativododo2.hospedagemdesites.ws`),
  por `nc` e por `ssh -vvv`, de **3 redes de origem independentes** (a do
  agente, duas do responsável) — sempre o mesmo sintoma, enquanto a porta
  21 (FTP) responde normalmente nos mesmos hosts. Causa isolada para o
  lado do servidor/firewall da Locaweb, não há mais diagnóstico possível
  do lado cliente.
- Chamado aberto pelo responsável com o suporte da Locaweb. **Frente
  pausada por decisão do responsável até haver retorno** — não retomar
  sem resposta da Locaweb ou evidência nova.
- Nenhuma infraestrutura real foi alterada (achado read-only via `dig`/
  `curl`/`openssl`/`nc`/`ssh`). Estratégia de deploy (SSH vs. FTP) segue
  **em aberto**, não decidida — dependia da confirmação de SSH.

### Frente 2 — Migração visual para o Design System "criativo DODÔ" — concluída (código); validação visual parcial

- **Achado que abriu a frente:** `est-dio-el-design-system/` (raiz, não
  `_legacy-ela/`) é um Design System completo e novo (tokens de cor/
  tipografia/espaçamento/raio, fontes self-hosted Elms Sans/Work Sans,
  logos oficiais), nunca antes adotado como fonte de verdade do frontend
  React — o frontend rodava com o sistema "TEAR Editorial" (vermelho
  `#9f0003`, Noto Serif/Hanken Grotesk/Archivo Narrow via Google Fonts).
- **`ADR-019` criada e aceita** (`docs/adrs/ADR-019-design-system-dodo-como-ssot-visual.md`):
  formaliza `est-dio-el-design-system/` como SSOT visual. Corrige achado
  factual: o comentário "`ADR-002: Absolute Flatness`" em
  `frontend/src/index.css` referenciava uma ADR que **nunca existiu**
  nesta branch — só como rascunho "Proposed" (nunca aceito) em worktrees
  de sessões paralelas já encerradas, descrevendo uma arquitetura Apps
  Script já abandonada. `docs/design/DESIGN_SYSTEM.md` já apontava
  corretamente para o novo Design System (não precisou de correção);
  `docs/design/UI_RULES.md` é comportamental/UX, sem valor de marca, segue
  válido sem alteração.
- **Correção de hierarquia de cor durante a execução:** laranja é a
  cor-assinatura (31% de proporção oficial, "sempre a maior mancha de
  cor" — `README.md` do Design System), não o roxo — corrigido no painel
  do `AuthSplitLayout` e documentado com citação direta da fonte, não por
  escolha estética própria.
- **Assets oficiais aplicados:** logo `elã-*.svg` (legado) substituído por
  `brand/logos/horizontal-preto.svg` (self-hosted em
  `frontend/public/horizontal-preto.svg`) em `AuthSplitLayout`, `AppShell`
  e `PortalShell` — zero referência a asset legado restante no projeto,
  confirmado por grep.
- **Escopo deliberadamente reduzido, a pedido do responsável** (sprint de
  velocidade, não de refinamento): `Table`/`Pagination`/`Modal` como
  componentes compartilhados **não foram criados** — tabelas cruas (7
  páginas) já herdam tokens corretos, extrair componente foi julgado
  refatoração desnecessária para esta sprint. `PlaceholderPage` não teve
  decisão de manter/remover (fora de escopo desta frente).
- **Camada de compatibilidade (bridge) criada e depois removida por
  completo na mesma sessão:** Task inicial introduziu aliases de nomes
  antigos (`--color-primary`, `--space-N` etc.) apontando para os tokens
  novos, para não quebrar ~27 arquivos de uma vez. Depois, com o projeto
  já migrado, os aliases foram renomeados para os nomes nativos do Dodô
  em todos os arquivos e a camada de bridge foi apagada de `index.css`.
  **Bug real encontrado e corrigido durante essa limpeza** (não
  cosmético): o bridge sobrescrevia `--color-surface` inteiro para
  `--color-bg`, fazendo cards/badges/avatar renderizarem com a mesma cor
  do fundo (invisíveis). Corrigido removendo a sobrescrita e fixando
  `AuthSplitLayout.contentPanel` explicitamente em `--color-bg` (único
  caso que de fato queria o tom de página, não de cartão).
- **Tokens de erro/sucesso são extensão própria, não oficial do Design
  System** — `tokens.json` não define essas cores; os valores em
  `frontend/src/theme/tokens.css` foram inferidos do padrão já usado em
  `DESIGN_SYSTEM.html` (`.field.err`), documentados como tal em
  comentário no próprio arquivo. Se o Design System formalizar valores
  oficiais no futuro, revisar.
- **Estado final confirmado por grep:** zero referência a qualquer nome
  de token antigo ("TEAR Editorial") em todo `frontend/src`. Build e
  lint limpos.
- **Validação visual real:** só as 3 rotas públicas (`/login`,
  `/cadastro`, `/`) foram vistas ao vivo (Chrome DevTools, screenshot).
  As 21 páginas autenticadas restantes foram migradas e verificadas só
  por análise estática de código (grep/build) — **não há confirmação
  visual delas**, por falta de backend rodando e credencial de teste
  nesta sessão. Tratar como pendência real, não como concluído, até
  alguém logar e olhar.
- Nenhuma rota, controller, model, policy ou regra de negócio foi
  tocada — confirmado, escopo estritamente visual/frontend.
- **Nada commitado nesta sessão** — todas as mudanças de código
  (tokens, componentes, páginas, assets) seguem no working tree.

## 2026-07-24 — §54 Diagnóstico read-only do sintoma "resposta incorreta do Host" em `portal.criativododo.com.br`

Sessão de continuação, 100% investigativa. **Nenhum arquivo alterado,
nenhuma configuração de infraestrutura tocada, nenhum comando executado
contra o ambiente real** — só raciocínio e preparação de verificação.

### Fatos confirmados pelo responsável do projeto (tratados como dados)

- Domínio principal: `criativododo.com.br`.
- Subdomínio `portal.criativododo.com.br` **já existe**, está **Ativo**,
  tipo **Subdomínio → Apontamento**.
- SSL do subdomínio: **Let's Encrypt, renovação automática**, confirmado
  funcionando.
- Hospedagem confirmada correta: usuário FTP `criativododo2`, raiz
  `/home/criativododo2/`.
- Laravel responde corretamente (dado mantido de turnos anteriores da
  sessão; **origem exata do teste que gerou essa afirmação não foi
  confirmada** — gap de evidência registrado, não presumir que foi
  testado especificamente contra `criativododo.com.br`).
- A partir desses fatos, três hipóteses foram **descartadas
  definitivamente**: criar domínio, emitir SSL, hospedagem errada.

### Achado técnico verificado de forma independente

O responsável colou um trecho com formato de citação automática do
ChatGPT (`oai_citation:0‡Locaweb`, `utm_source=chatgpt.com`) afirmando
uma distinção entre os tipos de subdomínio da Locaweb. Em vez de aceitar
a citação de segunda mão, busquei a página oficial de ajuda da Locaweb
diretamente via `WebFetch` e **confirmei o texto literal**:

- **Apontamento:** "domínios com essa configuração apresentam o mesmo
  conteúdo do site principal, funcionando como espelho."
- **Conteúdo da pasta:** "em sub-domínios, é possível setar que o
  endereço exiba um conteúdo específico de uma pasta do servidor."

**Conclusão doc-confirmed (não é hipótese):** o tipo Apontamento é
estruturalmente incompatível com servir uma aplicação Laravel a partir de
um diretório próprio (`public/`) — ele só espelha o que o domínio
principal já serve, sem nenhum mecanismo de seleção de pasta.

### Hipóteses remanescentes (replanejadas do zero, ranqueadas por probabilidade)

A pergunta deixou de ser "para onde o subdomínio aponta" (resolvida acima)
e passou a ser "o que o domínio principal está de fato servindo", já que
o Apontamento só espelha isso:

1. **H1 (maior probabilidade):** raiz da hospedagem (`/home/criativododo2/`)
   nunca foi configurada para servir o `public/` do Laravel — serve
   placeholder, pasta vazia ou site antigo.
2. **H2:** raiz aponta para o projeto Laravel inteiro (não para `public/`),
   expondo o projeto "cru" (`app/`, `vendor/`, `.env`, ou erro de
   bootstrap).
3. **H3:** cache/proxy retendo resposta antiga em um dos dois hosts.
4. **H4 (menor probabilidade):** exceção de comportamento não documentada
   — roteamento por Host header/SNI divergente do espelhamento puro
   descrito na documentação oficial.

Para cada uma, evidências a favor/contra e a verificação de menor custo
foram detalhadas na conversa (não duplicadas aqui — ver transcript da
sessão se necessário; o essencial está no plano de verificação abaixo).

### Árvore de decisão construída

```
Sonda única: comparar corpo/cabeçalhos de resposta entre
  https://criativododo.com.br  (raiz)
  https://portal.criativododo.com.br  (subdomínio)
  no mesmo instante
│
├─ IDÊNTICAS (confirma espelhamento documentado)
│   ├─ Conteúdo NÃO é o Laravel → H1
│   ├─ Conteúdo é o Laravel "cru" → H2
│   └─ Conteúdo é o Laravel funcionando → contradiz a queixa original,
│       reabre a pergunta sobre como ela foi observada
│
└─ DIFERENTES entre si → H4 ganha força; H1/H2 tornam-se irrelevantes
    (verificação seguinte: HTTP puro + cabeçalhos de cache, para separar
    H3 de H4 dentro desse ramo)
```

### Plano de verificação — pronto, **ainda não executado**

Comandos completos, read-only, entregues ao responsável para rodar no
terminal dele (nenhum foi executado por mim contra o ambiente real):

```bash
# Passo 0 — obter o IP real (única consulta DNS; a partir daqui o DNS
# deixa de ser usado nas requisições)
IP=$(dig +short criativododo.com.br | tail -n1)

# Passo 1 — HTTP puro, direto no IP, Host = domínio principal
curl -s -D - -o /tmp/root_http.html \
  -H "Host: criativododo.com.br" \
  -H "Cache-Control: no-cache" -H "Pragma: no-cache" \
  "http://$IP/"

# Passo 2 — mesma conexão/IP, só troca o Host para o subdomínio
curl -s -D - -o /tmp/portal_http.html \
  -H "Host: portal.criativododo.com.br" \
  -H "Cache-Control: no-cache" -H "Pragma: no-cache" \
  "http://$IP/"

diff /tmp/root_http.html /tmp/portal_http.html && echo "IDÊNTICOS" || echo "DIFERENTES"

# Passo 3 — só se 1/2 retornou redirect para HTTPS (fallback, DNS
# continua pinado no IP via --resolve)
curl -sk -D - -o /tmp/root_https.html \
  --resolve criativododo.com.br:443:$IP \
  -H "Cache-Control: no-cache" -H "Pragma: no-cache" \
  "https://criativododo.com.br/"

curl -sk -D - -o /tmp/portal_https.html \
  --resolve portal.criativododo.com.br:443:$IP \
  -H "Cache-Control: no-cache" -H "Pragma: no-cache" \
  "https://portal.criativododo.com.br/"

diff /tmp/root_https.html /tmp/portal_https.html && echo "IDÊNTICOS" || echo "DIFERENTES"
```

**Por que Host header direto no IP em vez de comparar as duas URLs
públicas:** a comparação ingênua mistura quatro variáveis (DNS de cada
nome, seleção de certificado/vhost por SNI, cache entre cliente e origem,
e o roteamento real por Host). Fazer o request direto no IP, em HTTP puro,
com `Host:` setado manualmente, isola uma única variável — como o
servidor decide o que servir a partir do Host header — eliminando DNS e
TLS/SNI da equação.

### Refinamento metodológico acordado (aplicar à interpretação do resultado)

Antes de concluir qual hipótese se confirma a partir de uma diferença
observada, **atribuir a camada exata** onde ela surgiu, nesta ordem, só
usando os dados já capturados pelos comandos acima (status, headers,
corpo — sem comandos novos):

1. **DNS** — já eliminada pelo desenho do teste (mesmo IP fixado nas duas
   chamadas); só checar se o mesmo `$IP` foi de fato usado nas duas.
2. **TLS/SNI** — só relevante no Passo 3; sinal: a diferença já existia em
   HTTP puro (Passo 1/2) ou só aparece em HTTPS?
3. **Virtual Host (Apache/Nginx)** — candidata se a diferença já aparece
   em HTTP puro; sinal: `Server`/`X-Powered-By`/`Via` diferentes entre as
   duas respostas.
4. **Proxy/Cache** — candidata se os headers de backend batem mas o corpo
   ainda difere, ou se aparecem `Age`/`X-Cache`/`ETag` só em uma resposta,
   ou se repetir o mesmo comando produz respostas diferentes entre si.
5. **Aplicação (Laravel)** — só depois de 1-4 descartadas; sinal:
   artefato específico do framework (redirect por `APP_URL`/
   `SESSION_DOMAIN`, stack trace, cookie de sessão) presente em uma
   resposta e não na outra.
6. **Outro componente** — catch-all, ex.: WAF (risco genérico já
   documentado para o ambiente legado em `AUDITORIA_LOCAWEB.md` §4.4,
   plausível aqui também) respondendo com página de bloqueio.

Só depois dessa atribuição de camada, mapear para a hipótese correta —
diferença em VHost ou TLS/SNI sustenta H4; diferença em Proxy/Cache
sustenta H3, não H4; nenhuma diferença descarta H4 e devolve a decisão
para interpretação de conteúdo (H1 vs H2).

### Estado ao final da sessão

- Nenhuma alteração de ambiente, painel ou código foi feita ou proposta.
- Comandos entregues ao responsável; resultado ainda não reportado.
- Próximo passo: executar os comandos, aplicar o protocolo de atribuição
  de camada ao resultado, e só então — com autorização explícita —
  discutir se o tipo do subdomínio precisa mudar para "Conteúdo da
  pasta" no painel Locaweb.
- Sem relação com o bloqueio de SSH porta 22 (§53) — sintomas
  independentes na mesma frente de implantação.

## 2026-07-24 — §55 Aprofundamento do diagnóstico SSH porta 22 (Locaweb) — descarte da hipótese de expiração de 3h, escalonamento para suporte

Continuação do diagnóstico registrado em §53 (bloqueio de SSH porta 22).
Sessão 100% investigativa/read-only, sem qualquer alteração de ambiente,
painel ou código — nenhum arquivo do repositório foi tocado.

### Evidência nova confirmada por teste direto nesta sessão

- Reconstruiu-se o diagnóstico do zero (DNS, TCP, camadas de rede,
  handshake SSH), sem reaproveitar a conclusão de §53 sem reverificar:
  DNS de `ftp.criativododo.com.br` e `ftp.criativododo2.hospedagemdesites.ws`
  resolvem para o mesmo IP (`179.188.55.25`); portas de controle no mesmo
  IP (80, 21, 443) abrem instantaneamente; porta 22 nunca responde (nem
  RST, nem SYN-ACK) em nenhum dos três alvos; três pontos de rede
  externos independentes (Alemanha, Irã, Japão, via `check-host.net`)
  confirmam o mesmo timeout, descartando definitivamente causa do lado
  do cliente/ISP; `ssh -vvv` falha no `connect()` TCP, antes de qualquer
  troca de banner SSH — não é problema de autenticação/config do `sshd`
  visível de fora.
- **Achado novo, doc-confirmed** (página oficial de ajuda da Locaweb):
  SSH habilitado pelo painel de Hospedagem de Sites expira automaticamente
  após 3h. Essa hipótese foi levantada como possível causa.
- **Hipótese de expiração de 3h descartada pelo responsável do projeto**:
  reabilitou o SSH no painel e testou imediatamente em seguida — o
  sintoma persistiu de forma idêntica. Reconfirmado pelo agente às
  2026-07-24 03:40 UTC (`nc` na porta 22 do IP direto: sem resposta;
  porta 80 no mesmo IP, mesmo instante: conecta normalmente).
- Verificação adicional: varredura de portas SSH alternativas comuns
  (22022, 2222, 2200, 2022, 22222) no IP direto — todas sem resposta
  (inconclusivo isoladamente, mas descarta a hipótese de a porta ter
  sido simplesmente movida). Status oficial da Locaweb
  (`statusblog.locaweb.com.br`) consultado — nenhum incidente ativo de
  rede/firewall/SSH/hospedagem reportado, o que aponta para causa
  específica desta conta, não instabilidade geral da plataforma.
- **Pista não verificada, tratada como inferência, não fato**: reclamação
  de terceiro no Reclame Aqui ("Acesso via SSH bloqueado") sugere, pelo
  resumo do buscador (texto completo não pôde ser lido — a página
  bloqueou o fetch com HTTP 403), que a Locaweb já removeu/bloqueou SSH
  de contas de hospedagem por decisão de segurança, independente do
  estado exibido no painel. Não confirmado diretamente na fonte.

### Estado ao final da sessão

- Toda a superfície verificável do lado do cliente foi esgotada: DNS,
  rede local, três origens externas, camada de handshake SSH, hipótese
  de expiração de 3h, porta alternativa, e status de instabilidade geral
  — todas descartadas ou sem sustentação. A causa remanescente (regra de
  firewall aplicada de fato ao IP, NAT, estado real do `sshd`,
  inconsistência de provisionamento, ou trava de segurança fora do
  painel) só pode ser confirmada pela Locaweb internamente.
- Texto de chamado de suporte, já redigido e entregue ao responsável duas
  vezes nesta sessão (versão inicial + complemento com a reconfirmação
  das 03:40 UTC e o achado do status page), pronto para envio.
- **Bloqueio:** depende do responsável abrir o chamado com a Locaweb (ação
  que exige credenciais da conta) e da resposta do suporte deles — sem
  ETA, fora do controle do projeto.
- Sem relação com o diagnóstico de `portal.criativododo.com.br` (§54) —
  sintomas independentes na mesma frente de implantação.

## 2026-07-24 — §56 Conclusão do diagnóstico "resposta incorreta do Host" (§54) + confirmação de que o Laravel nunca foi implantado em `criativododo2`

Continuação do diagnóstico registrado em §54. Sessão 100% read-only contra
o ambiente Locaweb — nenhuma configuração real foi alterada.

### Execução do plano de verificação já preparado

- `IP=$(dig +short criativododo.com.br)` → `179.188.55.25`.
- `curl` HTTP puro, direto nesse IP, `Host: criativododo.com.br` e depois
  `Host: portal.criativododo.com.br` (mesma conexão/IP, só o Host muda):
  ambas retornaram `403 Forbidden`, `Server: nginx/1.22.1`,
  `Content-Length: 1097`, corpo **byte-a-byte idêntico** (`diff` →
  `IDÊNTICOS`).
- Corpo inspecionado: é a **página de erro padrão da própria Locaweb**
  (`<title>Hospedagem Locaweb</title>`, `lwerror/css/dominio.css`,
  `"Página não existente ou em construção..."`) — não é Laravel, não é o
  projeto exposto cru.

### Protocolo de atribuição de camada aplicado (definido em §54)

DNS eliminado (mesmo IP fixado nas duas chamadas); TLS/SNI não se aplica
(HTTP puro); Virtual Host idêntico entre os dois Host headers (mesmo
`Server`, mesmo `Content-Length`, corpo idêntico); nenhum header de
cache/proxy; nenhum artefato de aplicação Laravel presente. **Conclusão:
H1 confirmada** (raiz da hospedagem nunca configurada para servir o
`public/` do Laravel — serve o placeholder padrão da Locaweb); **H2, H3 e
H4 descartadas** por esta rodada de evidência.

### Pergunta de acompanhamento do responsável: o Laravel já foi de fato migrado para essa hospedagem?

Verificado com evidência adicional, não suposição:

- `curl` no mesmo IP/Host para `/up`, `/api/health`, `/build/manifest.json`,
  `/robots.txt` → todos `404`, mesma página padrão da Locaweb.
- `curl` para `/index.php` → **`404` vindo do próprio PHP-FPM**
  (`X-Powered-By: PHP/8.5.7`, corpo literal `File not found.`) — prova que
  PHP está ativo e funcional no host, mas **não existe `index.php` no
  document root atual**.
- Cruzado com evidência documental já existente: `docs/deployment/
  CHECKLIST_GO_LIVE.md` tem **100% dos itens de deploy não marcados**,
  incluindo "Document root configurado para `current/public`" e
  "`vendor/` e `public/build/` constam na release nova"; `TASK_ROUTER.md`
  §51/§53 já registravam "nenhuma infraestrutura real foi tocada, sem
  SSH, sem `.env` real".

**Conclusão (code-confirmed + doc-confirmed convergentes): o Laravel
nunca foi implantado na hospedagem `criativododo2`.** Não é (só) um
problema de tipo de subdomínio — é ausência total de arquivos de
aplicação no servidor. A causa completa da "resposta incorreta do Host"
é dupla: (a) Apontamento é estruturalmente incompatível com servir pasta
própria (§54), e (b) mesmo corrigindo (a), hoje não há nada para servir.

**Limite da evidência:** sem acesso FTP/SSH nesta sessão, não é possível
confirmar por listagem direta que a conta está 100% vazia — só que o
document root configurado não tem `index.php` funcional. Only FTP/SSH
listing fecharia essa lacuna por completo.

### Estado ao final

- Nenhuma configuração alterada, nenhuma correção implementada ou
  proposta como decisão fechada.
- **Decisão do responsável ao final desta frente: pausar totalmente a
  infraestrutura** (Locaweb/SSH/deploy) para focar em refinamento de
  frontend. Frente de implantação fica parada até retomada explícita —
  quando retomada, a ordem lógica já estabelecida é: 1) enviar os
  arquivos do Laravel ao servidor; 2) só depois configurar document
  root/tipo de subdomínio.

## 2026-07-24 — §57 Auditoria visual/UX completa do frontend (sem implementação)

Sessão de análise pura, read-only, zero arquivo de código alterado.
Escopo pedido pelo responsável: auditoria completa do frontend React
(`frontend/src/components` + `frontend/src/pages`) contra o Design System
já adotado (`ADR-019`, `est-dio-el-design-system`), cobrindo 11 eixos:
ruído visual, hierarquia, sensação premium, espaçamento, alinhamento,
tipografia, grid, componentes, estados (hover/loading/disabled/empty),
responsividade, inconsistências.

**Restrição de governança aplicada:** a auditoria foi feita
deliberadamente *contra o sistema já adotado*, nunca propondo nova
paleta/tipografia/identidade — isso reabriria uma decisão de arquitetura
visual sem novo ADR, proibido por `CLAUDE.md`. Toda proposta de melhoria
listada usa só tokens/componentes que já existem.

### Metodologia

Leitura completa de tokens/fonte de verdade (`tokens.json`,
`frontend/src/theme/tokens.css`, `docs/design/DESIGN_SYSTEM.md`,
`docs/design/UI_RULES.md`) e de todos os componentes/páginas, mais grep
quantitativo em todos os `.css`/`.tsx` de `pages`/`components` para medir
consistência real (contagem de `font-size`, `letter-spacing`,
`max-width`, uso de `--color-highlight` vs `--color-action`). Camada
adicional pedida durante a execução: leitura em nível de Diretor de
Produto/Diretor de Arte (pergunta central: "sem o logo, isso teria
identidade própria?").

### Achados Crítica

1. **Cor-assinatura oficial (laranja) quase ausente:** `--color-highlight`
   usado em 1 única declaração de todo o frontend
   (`AuthSplitLayout.module.css:17`) vs `--color-action` (roxo) usado 28x.
   Inverte a regra oficial do próprio Design System ("laranja é sempre a
   maior mancha de cor", 31% oficial). Fora do login/cadastro, a
   cor-assinatura da marca não aparece em nenhuma tela autenticada.
2. **Marca legada "ELÃ | influência" hardcoded** em `Dashboard.tsx:51` e
   `PortalDashboardPage.tsx:64` — sobrevive à migração visual completa
   para "criativo DODÔ" (depende da decisão de negócio já pendente em
   `CLAUDE.md`).
3. **`outline:none` sem `:focus-visible`** em `TextField.module.css:52-55`
   (herdado por `SelectField`/`TextareaField`) — zero uso de
   `:focus-visible` em toda a base; atinge todo formulário do sistema.
4. **Estados de erro de carregamento removem toda a navegação da página**
   em ~9 páginas (`MateriaisPage`, `CampanhaDetailPage`,
   `CampanhaFormPage`, `BriefingFormPage`, `EnvioPage`, `MarcaFormPage`,
   `PagamentoPage`, `ParceiraFormPage`, `ParceiraProfilePage`) — header,
   título e link de "voltar" desaparecem, usuário fica sem saída visível.
5. **Falha de contraste WCAG calculada** no eyebrow/tagline do
   `AuthSplitLayout` sobre fundo laranja: `rgba(29,28,26,0.62)` sobre
   `#f85919` ≈ **2.95:1**, abaixo do mínimo AA (4.5:1) — na primeira tela
   que qualquer usuário vê.

### Achados Alta (resumo)

11 valores distintos de `font-size` hardcoded contra escala oficial de 5;
3 valores de `letter-spacing`, nenhum batendo com o token oficial de
label (`0.08em`); navegação primária com 8 de 13 itens permanentemente
"(em breve)" (`AppShell.tsx:13-27`); Dashboard com 2 de 4 KPI cards
placeholder; padrão de loading/erro duplicado manualmente em ~9 páginas
em vez de componentizado; `Badge`/`StatusBadge` são o mesmo componente
duplicado.

### Achado positivo

Espaçamento (`var(--sp-N)`) é o eixo mais disciplinado do sistema — 217
usos consistentes contra 2 valores cravados em px. Não precisa correção.

### Camada de marca (Diretor de Produto/Diretor de Arte)

Fora do login/cadastro, o produto não teria identidade própria
reconhecível sem o logo — personalidade documentada ("confiante,
brincalhona, ousadia controlada") não corresponde à implementação
(neutra, silenciosa, sem bagunça mas também sem energia); apenas 3
declarações de movimento/transição em toda a base de código; composição
100% simétrica/centralizada, contrariando a diretriz do próprio Design
System ("assimetria e escala, não simetria e moldura"). 5 sugestões
atemporais propostas — todas dentro do sistema já adotado, nenhuma nova
identidade: (1) laranja como superfície real no produto autenticado, (2)
repetir a estrela do login como elemento-assinatura recorrente, (3) usar
a escala display (64px) em ao menos um número por página, (4) quebrar
simetria em 1 ponto por tela, (5) dar peso tátil a hover/foco
(escala/sombra, não só cor).

### Priorização entregue (impacto × esforço)

- **Quick wins:** texto de marca legada (2 telas), contraste
  eyebrow/tagline, `max-width` cravado → `var(--content-max)`, foco
  visível no `TextField`, unificar `letter-spacing` de label.
- **Grandes apostas:** laranja como superfície real, componente
  `PageState`/`ErrorState` compartilhado (resolve ~9 duplicações),
  classes de escala tipográfica derivadas do token, foco visível
  sistêmico.
- **Preencher tempo:** unificar `Badge`/`StatusBadge`, variante `danger`
  de `Button`, distinguir estados `loading`/`zero`/`erro` no Dashboard.
- **Questionável:** grid CSS real 12/4 colunas, breakpoints adicionais —
  dependem de decisão de composição ainda não tomada, ou de validação
  visual ainda pendente (21 páginas autenticadas nunca vistas ao vivo).

### Estado ao final

Nenhuma implementação feita, nenhuma decisão de correção tomada. Relatório
completo entregue ao responsável na conversa da sessão. Responsável ainda
não escolheu por onde começar — próxima etapa ("Plano" do Fluxo
Obrigatório) depende dessa decisão.

## 2026-07-24 — §58 Sprint 01 (quick wins de frontend) executado + decisão de rebranding "roxo assume o papel do laranja" (ADR-019 substituída)

Sessão de execução (não mais só análise). Duas frentes, nenhum commit
feito — ambas aguardando aprovação explícita do responsável antes de
commitar (working tree acumula as duas).

### Frente 1 — Sprint 01: quick wins da auditoria de frontend (§57)

Escopo fechado pelo responsável (explicitamente sem reabrir paleta/
tipografia, sem componente novo, sem refatoração). Executados os 5 itens:

1. Marca legada "ELÃ | influência" removida — `Dashboard.tsx:51`,
   `portal/PortalDashboardPage.tsx:64`.
2. Contraste eyebrow/tagline do `AuthSplitLayout` corrigido — cor trocada
   de `--color-text-muted` (rgba 0.62, ~2.95:1) para `--color-text`
   sólido (~5.2:1 calculado, acima do mínimo AA).
3. `max-width` cravado do `AppShell.content` (1026px) trocado por
   `var(--content-max)` (1120px) — token já existia em `tokens.css` e
   nunca tinha sido referenciado em lugar nenhum.
4. `:focus-visible` adicionado em `TextField.module.css` (`.input`) —
   cobre `TextField`/`SelectField`/`TextareaField` (compartilham o CSS).
   Antes, `outline: none` no `:focus` deixava zero indicador de foco por
   teclado em todo formulário do sistema (achado crítico do §57).
5. `letter-spacing` da classe `.label` unificado em `0.08em` (valor
   oficial de "label" em `tokens.json`) nas 4 ocorrências que usavam
   `0.18em` por engano (herdado do valor de "eyebrow") —
   `TextField.module.css`, `PagamentoPage.module.css`,
   `MateriaisPage.module.css`, `CampanhaDetailPage.module.css`.

Validado visualmente via `chrome-devtools` (login: contraste e foco
confirmados por screenshot) e `tsc --noEmit` limpo. Itens 1 e 3 (telas
autenticadas) não puderam ser validados ao vivo — sem credencial de
teste disponível (limitação já conhecida).

### Frente 2 — Decisão de rebranding: roxo assume o papel semântico do laranja (ADR-019 substituída)

Durante a execução do Sprint 01, o responsável enviou instrução nova
pedindo migração completa de identidade visual (laranja → roxo em toda
função semântica de marca: primary/CTA/highlight/focus/badges/links/
estados positivos). **Parei e pedi confirmação explícita antes de
executar**, por dois motivos: (a) contradizia as próprias instruções do
Sprint 01 em andamento ("não reabrir ADR-019", "não trabalhar em
múltiplas frentes"); (b) `CLAUDE.md` proíbe alterar arquitetura sem ADR,
e `ADR-019` documenta laranja como cor-assinatura oficial (31%,
"sempre a maior mancha de cor").

**Responsável confirmou** de forma explícita e deliberada: é decisão de
rebranding, "a identidade visual do Estúdio Elã deixa de ser a
referência", "considere o ADR-019 substituído por esta decisão", e
**dispensou expressamente a criação de um novo ADR antes da
implementação**. Implementei a pedido, sem alterar o arquivo do
`ADR-019` em si (nenhuma mudança em `docs/adrs/` nesta sessão — por
instrução de `/fim`, ADR não se altera no encerramento; a atualização
formal do documento continua pendente, ver Pendências).

**Achado que viabilizou a migração ser pequena:** grep confirmou que
laranja (`--color-highlight`) já era consumido em **uma única
declaração** em todo o frontend (`AuthSplitLayout.module.css`, painel de
marca do login/cadastro/recuperação de senha) — o resto do app já usava
roxo (`--color-action`) para CTA/link/ação. A migração não foi um
redesign, foi um remapeamento pontual:

- `tokens.css`: `--color-highlight` (`var(--dodo-laranja)` →
  `var(--dodo-roxo)`), `--color-highlight-hover` (hex de laranja
  escurecido → reaproveita `var(--color-action-hover)`). `--dodo-laranja`
  continua definido na paleta física, só não é mais referenciado por
  nenhum token semântico.
- `AuthSplitLayout.module.css`: `.brandPanel`/`.eyebrow`/`.tagline`
  trocados de `--color-text` (preto) para `--color-action-contrast`
  (branco) — ajuste necessário porque preto sobre roxo dava ~2.4:1
  (falha AA); branco dá ~7.1:1. Comentário do arquivo atualizado (não
  documenta mais o par laranja+preto).
- Logo: `horizontal-preto.svg` tinha `fill` fixo no SVG (não
  `currentColor`), então não herdava a nova cor de texto. Criado
  `horizontal-branco.svg` (mesmo path, fill branco) e trocado o `src` em
  `AuthSplitLayout.tsx`. `AppShell`/`PortalShell` continuam com o logo
  preto — correto, sidebar deles tem fundo claro, não muda.
- `--color-error`/`--color-success` (estados) não foram tocados —
  não fazem parte do papel de marca.

Validado visualmente (login, "esqueci minha senha", "cadastro de
parceira" — todas herdam `AuthSplitLayout`) e `tsc --noEmit` limpo.

### Estado ao final

Nenhum commit feito em nenhuma das duas frentes — aguardando aprovação
explícita do responsável (pedida ao final da sessão). Achado colateral:
a recomendação "laranja como superfície real no produto autenticado"
("grandes apostas" do §57) fica **obsoleta** pela decisão de rebranding
desta sessão — laranja não é mais a cor-assinatura a reforçar.

## 2026-07-24 — §59 Design System "criativo DODÔ" v2.0 (roxo primário) formalizado como versão final + commit + publicação no Claude Design

Sessão paralela à do §58, iniciada a partir de um pedido de auditoria do
Design System (`est-dio-el-design-system/`) para trocar laranja por roxo
como cor primária. Antes de qualquer edição, a auditoria já identificou
que a troca não podia ser um swap literal de hex: laranja (`#f85919`) e
roxo (`#564f94`) têm luminâncias muito diferentes, então preto sobre
roxo reprova contraste (2,4:1) e branco sobre laranja também (3,3:1,
só serve para título grande). A migração certa é de **papel semântico**
— cada cor mantém o próprio pareamento de texto já validado (laranja
sempre com preto, AA 5,2:1; roxo sempre com branco, AAA 7,1:1) — e só
a proporção/protagonismo de cada uma muda.

**Decisão final do responsável, obtida em duas etapas nesta sessão:**
primeiro autorização para migração semântica completa (roxo assume
todas as funções de cor primária: identidade, CTA, foco, links, 34% da
paleta; laranja vira secundária/apoio, 14%, nunca dominante). Depois,
ao consolidar a versão oficial, a auditoria encontrou
`docs/handoff/README.md` afirmando o oposto — que uma sessão anterior
no mesmo dia já tinha "corrigido" o Design System de volta para laranja
dominante, revertendo uma tentativa anterior de roxo. Question feita ao
responsável antes de prosseguir; **confirmação explícita de que esta é
a decisão final e definitiva**, revertendo aquela correção.

**Implementado em `est-dio-el-design-system/` (agora a SSOT visual
canônica do projeto, `ADR-019`):**

- `DESIGN_SYSTEM.html` (fonte canônica) e `DESIGN_SYSTEM.standalone.html`
  (export portátil, fontes/logos em base64) — paleta, propbar, swatches,
  tabela de contraste, exemplos certo/errado, tudo reescrito para v2.0.
- `design-tokens.css`/`tokens.json` — papéis semânticos renomeados
  (`--color-action`→`--color-primary`, `--color-highlight`→
  `--color-secondary`) para não carregar mais o mapeamento antigo.
- `horizontal-branco.svg` sincronizado de `frontend/public/` para
  `brand/logos/` — é a combinação de maior contraste sobre fundo roxo
  (7,1:1 AAA) e já estava em uso em produção; o Design System não tinha
  essa variante antes.
- Removidos: `_legacy-ela/` (protótipos antigos, já documentados como
  "não usar"), `.DS_Store` (2x), 1 `.tmp` órfão de 696KB do Illustrator.
- `docs/handoff/README.md`: bullet que afirmava laranja dominante
  corrigido com nota de correção explícita (histórico da reversão
  preservado, não apagado — ver arquivo).
- `frontend/src/theme/tokens.css`: só comentários atualizados para v2.0
  — a mecânica de cor (`--color-highlight: var(--dodo-roxo)`) já estava
  correta, herdada da sessão do §58; nenhuma variável CSS foi renomeada
  aqui (evitar tocar em arquivo que pertence à outra frente ainda sem
  aprovação de commit).
- Validado visualmente via Playwright: `DESIGN_SYSTEM.html` isolado
  (hero, paleta, contraste) e a tela de login real do app (`/login`) —
  roxo dominante, logo branco, botão primário roxo, tudo consistente.

**Commit `eed42be`** — escopo restrito a `est-dio-el-design-system/`
(71 arquivos, todo o diretório estava não rastreado). Deliberadamente
**não inclui** `frontend/src/theme/tokens.css` nem `docs/handoff/README.md`
(ambos entrelaçados com a frente do §58, ainda sem aprovação de commit)
nem o arquivo sensível não rastreado na raiz do repo
(`IMPORTANTE Webmail_Codigos_de_backup.txt`).

**Publicado no Claude Design:** projeto "Design System — Criativo Dodô"
(13 arquivos: `DESIGN_SYSTEM.html`, 9 SVGs de `brand/logos/`,
`design-tokens.css`, `tokens.json`, `README.md`). Fontes (`.ttf`, ~550KB
combinado) não foram embutidas no preview publicado — grandes demais
para inline sem estourar contexto; conteúdo e cores são fiéis, só a
tipografia do preview usa fallback do sistema.

### Gap identificado, não corrigido

Não existe `stack-branco.svg` (versão empilhada branca do logo) —
`brand/logos/` tem `horizontal-branco.svg` mas não o equivalente
empilhado. Sinalizado em `tokens.json` → `logos.note` como pendência.

### Diagnóstico de ambiente (`/doctor`), mesma sessão

Rodado como tarefa separada, sem relação com o Design System:

- Instalação `npm` global duplicada/desatualizada do Claude Code
  (`2.1.209`) removida — só resta a nativa, atualizada para `2.1.219`.
- Modo automático de permissões (`auto`) ativado em
  `~/.claude/settings.json` (escopo usuário).
- 3 extensões sem uso identificadas (`skill-creator`, `context7`,
  `notebooklm-mcp`) — responsável optou por **não** remover agora.
- Nenhuma mudança em arquivo do projeto; escopo de máquina/usuário.

### Estado ao final

Design System v2.0 commitado e publicado — concluído. Frente do §58
(Sprint 01 + rebranding em `frontend/`) segue **sem commit**, não foi
tocada por esta sessão, continua aguardando aprovação separada. Nenhum
push feito. Nenhum ADR novo criado — `ADR-019` não precisou de edição
(não hardcoda cor, só aponta para a pasta como SSOT); a decisão final
roxo-primário em si não tem registro formal em `docs/adrs/`, só em
`docs/handoff/README.md` e `tokens.json` → `migrationNote` — considerar
formalizar em ADR próprio se o histórico de reversões se repetir.

## 2026-07-24 — §60 Diagnóstico SSH Locaweb (bloqueado) + auditoria/atualização de cobertura de ativos no Design System (commit `d3dba5a`)

Sessão nova, duas frentes sequenciais.

**Frente 1 — Investigação SSH read-only em `criativododo2` (Locaweb).**
Responsável habilitou SSH no painel e forneceu credenciais
(`criativododo2` / porta 22 / `ftp.criativododo.com.br`,
`ftp.criativododo2.hospedagemdesites.ws`, IP `179.188.55.25`). Testado
`whoami` via `sshpass` nos 3 endereços: **timeout nos três** (não é
recusa de senha, é ausência de resposta TCP). Diagnóstico de descarte:
controle contra `github.com:22` teve sucesso (rede local não é o
problema); `nc` no IP alvo confirmou porta 80 respondendo normalmente e
porta 22 em timeout — servidor está de pé, só a porta SSH não aceita
conexão externa. Consistente com o achado já registrado em `§55`
("porta 22 bloqueada do lado do servidor") — a habilitação no painel
não resolveu por si só. **Nenhuma alteração feita** (investigação
somente leitura). Bloqueado, sem ETA — depende de confirmação do
suporte Locaweb ou de propagação adicional. Retomar testando
`nc -zv 179.188.55.25 22` antes de nova tentativa de SSH.

**Frente 2 — Design System: plano de migração de marca + atualização
de cobertura (escopo revisado a meio da sessão).**

Responsável pediu para o agente assumir papel de "Design System
Architect" e evoluir `est-dio-el-design-system/` para novos ativos de
marca a serem enviados em etapas (logos, paleta, tipografia). Auditoria
completa da arquitetura do `DESIGN_SYSTEM.html` foi apresentada e
aprovada (camada estrutural em variáveis CSS vs. camada de conteúdo
específica da marca) e um plano técnico de migração em 6 fases foi
produzido e apresentado (não persistido em arquivo, só na conversa,
por decisão de aguardar antes de formalizar).

**Achado relevante, sem ação:** existe uma pasta `skills-dodo/` — skill
pessoal do responsável para toda a agência (Meta Ads, outros clientes),
**fora deste repositório** (untracked, não é o produto Influencia/TEAR).
`skills-dodo/dodo/SKILL.md` ainda carrega paleta e tipografia da
identidade antiga "Estúdio Elã" (bege `#f4e9e6`, bordô `#791815`,
fonte "Ivy Journal" com itálico decorativo), apenas com o nome trocado
por find-replace (confirmado pelo próprio `skills-dodo/REINSTALL.md`).
**Não é o SSOT do produto e não foi alterada** — registrado aqui só
porque é a origem provável de uma memória equivocada de que o Design
System oficial ainda teria regras antigas da Elã (não tem — auditoria
não achou nenhum resíduo em `est-dio-el-design-system/`).

**Mudança de escopo, decisão do responsável:** a meio da sessão, uma
tentativa de importar o mesmo projeto já publicado no Claude Design
(`70c9e69f-24cc-4dd0-a720-8909a6c31ee0` — confirmado via MCP como sendo
exatamente o mesmo bundle de 13 arquivos já commitado, nenhum ativo
novo) pediu edição imediata usando só os logos já existentes — em
conflito direto com o "aguardar todos os ativos" combinado minutos
antes. Agente parou e perguntou antes de agir (`AskUserQuestion`).
Resposta do responsável: **revogou explicitamente a instrução de
esperar** — "não estamos mais aguardando novos ativos para iniciar";
o diretório local passa a ser tratado como a versão oficial e atual da
marca; escopo vira auditoria + correção fundamentada nos ativos já
presentes, sem inventar conteúdo, só registrando o que faltar.

**Executado e commitado (`d3dba5a`, escopo restrito a
`est-dio-el-design-system/DESIGN_SYSTEM.html`, 1 arquivo, 5 inserções/2
deleções):**

- Adicionados 2 tiles à grade "Versões de cor" (`stack-roxo.svg`,
  `stack-laranja.svg`) — únicos 2 dos 9 assets de `brand/logos/` que
  nunca haviam sido referenciados no documento.
- Nota de contraste adicionada: laranja sobre fundo claro (2,8:1) fica
  abaixo do mínimo não-textual — fundamentada na tabela já existente na
  seção Acessibilidade, que classificava a combinação como `fail-text`
  sem que a seção de Logotipo refletisse isso.
- Ícones `star`/`heart`: hex hardcoded (`#f85919`/`#564f94`) trocado por
  `var(--laranja)`/`var(--roxo)` — mesma cor visual, agora acompanha
  token.
- Validado antes do commit: `git status` restrito ao arquivo esperado;
  renderização via Playwright (servidor HTTP local, `file://` bloqueado
  pelo navegador) — 16/16 imagens carregadas (`naturalWidth` > 0), 2
  fontes `loaded`, único console error foi favicon 404 (irrelevante).

**Gap registrado, não corrigido (ativo realmente ausente, não
inventado):** `stack-branco.svg` continua não existindo — mesmo gap já
documentado em `tokens.json` → `logos.note` desde a v2.0.
`DESIGN_SYSTEM.standalone.html` **não foi tocado** nesta etapa (fora do
escopo pedido) — fica dessincronizado dos 2 tiles novos e da troca de
ícones para `var()`; regenerar numa etapa futura.

### Estado ao final

Frente SSH: bloqueada, sem ETA, nenhuma mudança de arquivo. Frente
Design System: commitado (`d3dba5a`), não pushado. Plano completo de
migração para os *novos* ativos de marca (ainda não entregues) segue
válido para quando o responsável decidir retomá-lo — não foi descartado,
só a ordem de execução mudou (auditoria do estado atual primeiro,
migração de marca nova depois, quando o material chegar). Frente `§58`
segue sem commit, não tocada por esta sessão.

## 2026-07-24 — §61 "DODÔ" como nome oficial do projeto — aposentadoria do codinome técnico "TEAR" (`ADR-020`)

Mesma sessão do §60, terceira frente. Responsável enviou instrução de
"atualização obrigatória de contexto" pedindo para tratar "TEAR",
"Estúdio Elã", "estudioela", "ela-influencia", "elafashionmkt" e domínios
antigos como nomenclatura legada, com "DODÔ" exclusivo em conteúdo novo.

**Conflito identificado antes de agir:** a marca comercial (Estúdio Elã →
Criativo Dodô) já era decisão vigente (`ADR-019`), mas "TEAR" nunca foi a
marca — é o codinome técnico/interno do projeto, usado em `CLAUDE.md`,
`docs/history/CONTRATO_SOBERANO.md`, SPECs e em todo o histórico deste
roteador. Aposentar "TEAR" é uma decisão de domínio/vocabulário nova, que o
próprio `CLAUDE.md` diz que nunca deve ser tomada sem ADR. Agente parou e
perguntou antes de aplicar qualquer mudança (`AskUserQuestion`, duas
rodadas — a primeira rejeitada pelo responsável para adicionar contexto
antes de responder).

**Decisão final do responsável, confirmada:**

- "TEAR" também é aposentado (não só a marca comercial); "DODÔ" passa a ser
  o nome oficial do projeto, técnico e comercial.
- "TEAR" continua correto em documentação histórica/legada — nenhuma
  reescrita retroativa de SPECs, ADRs antigos ou histórico deste roteador.
- Nenhuma mudança física: diretório `ela-influencia/`, repositório Git,
  remotes, branches e scripts permanecem inalterados — eventual renomeação
  física é migração técnica separada, futura, fora de escopo.
- "Influencia" (nome da plataforma) **não** entra nesta aposentadoria — só
  "TEAR" e "Estúdio Elã"/"ELÃ" viram legado por esta decisão.
- Documentação nova, ADRs, SPECs, commits e prompts usam exclusivamente
  "DODÔ" daqui em diante.

**Executado, não commitado ainda:**

- `docs/adrs/ADR-020-dodo-como-nome-oficial-do-projeto.md` — ADR novo,
  formalizando a decisão acima.
- `CLAUDE.md` — `## Projeto` e `## Papel do agente` atualizados: "Projeto
  TEAR" → "Projeto DODÔ", com nota inline explicando os nomes anteriores
  (TEAR, Estúdio Elã, "ELÃ | influência") e referência a `ADR-020`. Nenhuma
  outra ocorrência de "TEAR"/"Elã" em `CLAUDE.md` (checado com grep, só
  essas duas).
- `docs/governanca/GOVERNANCA_DO_PROJETO.md` — checado, não tinha nenhuma
  ocorrência de "TEAR"; nenhuma mudança necessária.

### Estado ao final

Decisão formalizada em ADR, documentos centrais (`CLAUDE.md`) atualizados.
Nenhum commit feito ainda — fica para o responsável revisar junto com o
restante do trabalho desta sessão. `docs/handoff/README.md` não recebeu
entrada — decisão de nomenclatura/governança, não um marco de fase/
migração/release concluído, avaliação do próprio agente, não confirmada
com o responsável.

---

## 2026-07-24 — §62 Novo teste de SSH (pedido da Locaweb) + classificação FTP×Painel×SSH do pipeline de deploy + plano de contingência FTP (sessão paralela ao §60/§61)

Sessão distinta das de `§60`/`§61` (mesmo dia, mesmo responsável, conversa
separada — dispatch inicial "Agente B — validação de SSH", depois estendida
por pedidos diretos do responsável na mesma conversa). **100% read-only
quanto ao repositório — nenhuma alteração de arquivo, nenhum commit feito
por este agente.**

### Frente 1 — Reteste de SSH, a pedido explícito da Locaweb
- Reteste da porta 22 nos mesmos 3 alvos de `§55`/`§56`/`§60`:
  `criativododo.com.br`, `ftp.criativododo2.hospedagemdesites.ws`, IP direto
  `179.188.55.25` — `nc -zv -w 10` em todos: **timeout nos três** (sem
  SYN-ACK, sem RST).
- Controle: porta 80 no mesmo IP conectou instantaneamente no mesmo
  instante — descarta problema de rede local, isola o sintoma à porta 22
  do servidor.
- **Resultado idêntico ao já registrado em `§55`/`§56`/`§60` — nenhuma
  mudança de estado.** Reportado como resposta ao pedido de novo teste da
  Locaweb: a correção anunciada por eles ainda não teve efeito observável
  do lado do cliente.

### Frente 2 — Classificação FTP × Painel Locaweb × SSH de cada etapa do pipeline de deploy
A pedido do responsável, o pipeline completo (`PLANO_DE_IMPLANTACAO.md`
Etapas 1-17 + `DEPLOY.md` §2-8) foi reclassificado etapa a etapa por
dependência real de protocolo — não pela convenção atual do pipeline, que
usa SSH/rsync para tudo por decisão de implementação (`ADR-016`). Critério:
SSH só é obrigatório quando a etapa executa algo no host; transferência ou
criação de arquivo/diretório é FTP-viável.
- **SSH obrigatório (sem alternativa):** symlink de `.env`/`current`,
  `migrate --force`, `config:cache`/`route:cache`/`view:cache`,
  `admin:create`, `migrate:status`, `crontab -e`, rodar `backup-db.sh`
  manualmente, rollback.
- **FTP-viável hoje:** envio de código/`vendor/`/build do frontend, criação
  de diretórios (`releases/`, `shared/storage/...`), upload do `.env`.
- **Painel Locaweb:** provisionar Postgres gerenciado, DNS, SSL, SMTP,
  habilitar SSH.
- **Fora do host:** build do frontend e `composer install` (já rodam só no
  runner do CI, `ADR-016`), `key:generate`, secrets do GitHub, OAuth do
  Google Drive.
- **Entregue só na conversa — não persistido em arquivo.** Retoma e detalha
  a recomendação já registrada em `AUDITORIA_LOCAWEB.md` §5.1 (opção B,
  descartada em favor de SSH puro quando a porta 22 ainda respondia — hoje
  volta a ser relevante como plano de contingência).

### Frente 3 — Plano de contingência: deploy via FTP enquanto o SSH não volta
A pedido do responsável, produzido um runbook operacional (Fases 0-6) para
chegar a ~95% do deploy usando só FTP + Painel Locaweb, partindo do fato já
confirmado em `§56` de que a conta `criativododo2` está hoje vazia — o que
permite abandonar o padrão `releases/`+symlink `current` (exige SSH) e
publicar direto num diretório fixo (`~/tear/`, path técnico já usado no
resto da documentação — não é nomenclatura nova, ver `§61`).
- Fases 0-4: preparar pacote localmente (build + `vendor/` + `APP_KEY`),
  provisionar recursos no Painel, upload por FTP na ordem
  código → `vendor/` → build → `.env` (por último, de propósito — evita
  servir a app com config incompleta), apontar document root para
  `~/tear/public`, validação possível só com HTTP/FTP.
- **Ponto exato de espera por SSH, marcado explicitamente no plano:** depois
  da Fase 4, restam só os 6 itens da lista "SSH obrigatório" da Frente 2
  (`migrate`, caches, `admin:create`, crontab, backup manual, smoke test
  final) — nada mais tem alternativa por FTP.
- **Entregue só na conversa — não persistido em `docs/deployment/`.**
  Instrução explícita do responsável nesta sessão: não alterar código, não
  executar deploy — é só o plano. Formalizar como runbook oficial fica para
  quando (e se) o responsável decidir de fato usar essa contingência.

### Frente 4 — Nome do projeto (TEAR → DODÔ), confirmado nesta conversa também
O responsável comunicou a mesma decisão de `§61` (aposentadoria de "TEAR"
como codinome técnico, "DODÔ" como nome oficial) diretamente nesta conversa
também, em mensagens sucessivas — sem passar por `AskUserQuestion` aqui,
porque a decisão já veio formulada como regra operacional de 4 pontos
(conteúdo novo em DODÔ; nomenclatura corrigida ao tocar arquivo legado;
identificador técnico não é renomeado sem tarefa específica; não perguntar
de novo). Nenhum arquivo do repositório foi alterado por esta frente — a
formalização real (`ADR-020`, `CLAUDE.md`) é a de `§61`. A regra foi
registrada em memória própria deste agente (fora do repositório), para
aplicar automaticamente em sessões futuras sem precisar reperguntar.

### Estado ao final
Nenhuma alteração de arquivo do repositório feita por este agente — `git
status`/`git diff` no início e no fim da sessão idênticos, exceto pelas
mudanças de `§61` (`CLAUDE.md`/`ADR-020`), feitas pela sessão paralela, não
por esta. Nenhum commit. Frentes 2 e 3 (classificação de deploy e plano de
contingência FTP) existem só nesta conversa — se o responsável quiser
preservá-las além do histórico de chat, próximo passo é decidir onde
persistir (ex.: novo runbook em `docs/deployment/`, fora do escopo desta
sessão sem pedido explícito).

## 2026-07-24 — §63 Commit de `ADR-020` + consolidação de `CLAUDE.md` como documento de governança completo (Fase 2), em 3 commits separados por natureza

Continuação da sessão do `§60`/`§61` (mesma conversa, retomada após o
`/fim` que gerou o snapshot descrito em `§62`). Responsável pediu análise
do diff pré-existente de `CLAUDE.md` (140 linhas, não relacionado à
decisão de nome) antes de autorizar qualquer commit.

**Auditoria do diff pré-existente, apresentada e validada:** comparação
entre `HEAD` (94 linhas, 3 seções reduzidas a frase-placeholder — "Como o
agente deve atuar no Projeto Tear.", "Lista curta de documentos
oficiais.", bullets genéricos em "Regras de arquivos") e o working tree
(224 linhas, conteúdo completo). Busca por marcadores de incompletude
(`TODO`, `TBD`, `placeholder`, `FIXME` etc.) nas linhas adicionadas: zero
ocorrências reais. Os 9 caminhos citados no conteúdo novo (`docs/_workspace/
TASK_ROUTER.md`, `docs/history/CONTRATO_SOBERANO.md`, `docs/adrs`,
`docs/specs`, `docs/knowledge/referencias-externas/...`, `docs/planning/
PLANO_MESTRE_ELA_INFLUENCIA.md`, `docs/arquitetura/03-...md`,
`.claude/commands/prompt-gpt.md`, `backend/app/Policies`,
`backend/app/Services`) verificados como existentes. Conclusão: diff
corresponde à pauta da própria branch/PR #77 ("establish Phase 2
governance model"), estruturalmente completo, sem placeholders.

**Responsável autorizou o commit, pedindo separação de responsabilidades
em 2 commits** (governança vs. nomenclatura). Como as duas mudanças
estavam fisicamente entrelaçadas no mesmo arquivo (a edição TEAR→DODÔ
caía dentro do diff de 140 linhas), a separação foi feita revertendo
temporariamente as 2 linhas de nomenclatura, commitando o restante, e só
então reaplicando e commitando a nomenclatura à parte:

1. **Commit `a368857`** — consolidação de governança pura (138
   inserções/10 deleções): substitui as 3 seções-esqueleto por conteúdo
   completo (`## Projeto`, `## Como entender este projeto`, `## Fluxo de
   trabalho`, `### Arquitetura de comandos do Claude Code`, `##
   Documentação complementar`, `## Convenções permanentes`) + correções
   de caminho em "Documentos oficiais"/"Fonte de decisão". Texto ainda
   usa "TEAR" (fiel ao conteúdo original, sem antecipar `ADR-020`).
2. **Commit `786a259`** — aplica `ADR-020` isoladamente (5 inserções/3
   deleções): "Projeto TEAR" → "Projeto DODÔ" em `## Projeto` e `##
   Papel do agente`, com nota inline sobre nomes legados.

**Escopo deliberadamente restrito a `CLAUDE.md`:** `docs/_workspace/
TASK_ROUTER.md` e `docs/_workspace/ESTADO_SESSAO.md` foram checados antes
de qualquer commit e mostravam diffs muito maiores que o esperado (860 e
1467 linhas) — sinal de que a sessão paralela do `§62` estava ativa
neles ao mesmo tempo. Nenhum dos dois foi tocado por este commit, para
não misturar trabalho de outra sessão em progresso.

### Estado ao final

`CLAUDE.md` 100% commitado (`a368857` + `786a259`), sem nenhuma pendência
de commit restante para ele. `ADR-020` já estava commitado (`8a0f505`,
`§61`). 4 commits locais desta linha de trabalho no total
(`8a0f505`→`a368857`→`786a259`, mais `d3dba5a` de antes), nenhum
pushado. Frente `§58` segue sem commit, não tocada. Frentes 2 e 3 do
`§62` (classificação FTP×SSH, plano de contingência) seguem só na
conversa daquela sessão paralela, não persistidas em arquivo.

## 2026-07-24 — §64 Formalização do plano de contingência FTP (`§62` Frente 3) em `docs/deployment/`

Responsável redirecionou a prioridade operacional: em vez da frente `§58`
(ainda pendente de aprovação, não tocada), preparar a implantação do DODÔ
enquanto o SSH segue bloqueado. Escopo explícito do pedido: só
documentação operacional, checklist de deploy, validação da estrutura
Laravel, configuração por FTP e preparação de ambiente — sem deploy real,
sem alteração de código de aplicação.

**Achado de auditoria, sinalizado antes de escrever:** os 6 arquivos de
`docs/deployment/` (`ARQUITETURA_PRODUCAO.md`, `CHECKLIST_GO_LIVE.md`,
`DEPLOY.md`, `IMPLEMENTACAO_TECNICA.md`, `PLANO_DE_IMPLANTACAO.md`,
`RUNBOOK_DEPLOY_E_ROLLBACK.md`) e `backend/.env.production.example` já
estavam modificados e não commitados desde 2026-07-23 (rebranding de
domínio/hospedagem — `criativododo.com.br`/Hospedagem II substituindo
`influencia.estudioela.com`/Hospedagem Linux), agrupados incorretamente
por `ESTADO_SESSAO.md` dentro do inventário genérico da frente `§58` —
que, pelo texto deste próprio arquivo, cobre só `frontend/` (Sprint 01 +
rebranding de cor), não deployment. Conteúdo revisado, coerente, datado,
sem placeholders. Decisão: construir em cima dele (é a direção correta e
pré-requisito para o resto do trabalho pedido), sem commitá-lo — segue
pendente de aprovação junto com o resto do working tree.

**Trabalho feito (só documentação, nenhum código/script tocado):**

- `docs/deployment/RUNBOOK_DEPLOY_E_ROLLBACK.md` — nova seção
  "Contingência: deploy manual via FTP (SSH indisponível)", formalizando
  o plano de `§62` Frente 3 (Fases 0-6, ponto exato de espera por SSH
  depois da Fase 4) + ponteiro na seção "Deploy" existente.
- `docs/deployment/AUDITORIA_LOCAWEB.md` §5.1 — nota de atualização: SSH
  bloqueado de novo desde 2026-07-24 (bloqueio distinto do original que
  motivou a análise histórica), contingência formalizada, `ADR-016` não
  reaberto.
- `docs/deployment/CHECKLIST_GO_LIVE.md` §3 — nota apontando para a
  contingência quando SSH seguir bloqueado.

**Não persistido/não feito, deliberadamente:** validação real da conta
FTP (`criativododo2`) ou do painel — nenhum acesso à Locaweb nesta sessão,
achados citados são os já confirmados em `§56`/`§62`. Nenhum deploy
executado. Nenhum commit.

### Estado ao final

3 arquivos de `docs/deployment/` com conteúdo novo, empilhado sobre o
diff pré-existente não commitado do dia anterior (ver achado acima). Nada
commitado. Pendências: aprovação do responsável para commit (junto com o
resto do working tree, ou em unidade separada, a decidir), e confirmação
real do painel/FTP quando a contingência for de fato executada.

## 2026-07-24 — §65 Criação de `docs/infrastructure/INFRAESTRUTURA.md` — fonte oficial de dados de infraestrutura

Responsável pediu, antes de continuar qualquer preparação de deploy, uma
nova regra de trabalho: um documento único com os dados **estáveis e
verificados** do ambiente (provedor, domínios, hospedagem, FTP, SSH,
PHP, banco, DNS, SSL), cada campo classificado como Confirmado/Pendente
de confirmação/Não identificado, **sem inventar nem inferir** — só o que
já estava registrado em documentação/evidência anterior. Objetivo:
nenhum agente futuro precisar reinvestigar ou perguntar de novo. Só
leitura/escrita de documentação — nenhum acesso a FTP/SSH, nenhum
deploy, nenhum código tocado.

**Levantamento feito (só leitura):** `AUDITORIA_LOCAWEB.md` completo
(§1-§5), `ARQUITETURA_PRODUCAO.md` (§1-§3, §6, §7, §14),
`TASK_ROUTER.md` §27/§51/§53/§54/§55/§56/§60/§62, `ADR-016`/`ADR-017`,
`backend/.env.production.example`, e as 7 capturas de tela em
`docs/infrastructure/assets/` (2 delas abertas e inspecionadas
visualmente).

**Achado crítico, sinalizado no documento novo:** as capturas de tela em
`docs/infrastructure/assets/` (datadas 2026-07-23) são **todas do painel
de `elafashionmkt.com.br`** (Hospedagem I, ambiente antigo) — confirmado
pelo breadcrumb visível em cada imagem — **não** do ambiente atual
(`criativododo2`/Hospedagem II), apesar de estarem na pasta
`docs/infrastructure/`. Registrado explicitamente para não serem usadas
por engano como evidência do ambiente vigente.

**Outro achado relevante:** `AUDITORIA_LOCAWEB.md` (2026-07-22) audita só
o plano antigo — nunca foi repetida para a Hospedagem II. Vários campos
"✅ Confirmado" daquele documento (PHP 8.3, Rocky Linux 8, comportamento
do SSH de 3h) foram marcados no novo documento como **Pendente de
confirmação** para o ambiente atual, com a ressalva explícita de que não
devem ser presumidos válidos para `criativododo2` só por analogia — em
contraste, o PHP realmente ativo em `criativododo2` já está confirmado
por evidência de rede real (8.5.7, header HTTP, `§56`), diferente do 8.3
do plano antigo.

**Divergência entre fontes preservada, não resolvida:** disponibilidade
real de PostgreSQL na Hospedagem II — painel do plano antigo listava
como disponível, mas suporte oficial da Locaweb desmentiu depois (`§27`);
mesmo risco não descartado para o plano atual, apesar de o responsável
ter afirmado verbalmente (não por evidência técnica) que a Hospedagem II
suporta PostgreSQL (`§51`). Documentado como Pendente de confirmação,
não como Confirmado.

### Estado ao final

`docs/infrastructure/INFRAESTRUTURA.md` criado (arquivo novo, não
commitado — pasta `docs/infrastructure/` já era untracked antes desta
sessão, só com `assets/`). Nenhum outro arquivo tocado nesta frente.
Nenhum deploy, nenhum acesso a FTP/SSH, nenhum código alterado. Passa a
ser a referência a consultar antes de qualquer nova investigação de
infraestrutura, por pedido explícito do responsável.

## 2026-07-24 — §66 Briefing de arquitetura de telas e componentes (`docs/_workspace/UX/BRIEFING_TELAS_E_COMPONENTES_DODO.md`)

Sessão isolada, sem relação com a frente de deploy (`§62`/`§64`/`§65`) —
pedido explícito do responsável: um documento de especificação de UX
(não um prompt para o Google Stitch) cobrindo a arquitetura de telas e
componentes de todo o sistema, priorizando a menor quantidade possível
de telas e a máxima reutilização de componentes. Só leitura de
código/documentação + escrita de 1 documento novo; nenhum código de
aplicação alterado; **instrução explícita do responsável de não
commitar**.

**Método:** auditoria em 4 camadas antes de propor qualquer tela —
negócio (`PRD.md`, RN-01 a RN-18), estado real de implementação
(`TASK_ROUTER.md` §3, todas as SPECs 001–035 `[x]`), rotas e código real
(`App.tsx` + leitura completa de todas as páginas/componentes de
`frontend/src/`, via dois agentes Explore em paralelo — um para o lado
admin, outro para o Portal da Influenciadora + Models/Policies do
backend Laravel), e o Design System vigente (`design-tokens.css`,
`UI_RULES.md`). Nenhuma funcionalidade foi inventada — cada tela e cada
fusão proposta no documento está amarrada a uma SPEC/regra já existente.

**Achado central:** o sistema audita em 27 rotas distintas hoje
(5 públicas/auth + 17 admin, sendo 3 `PlaceholderPage` + 5 itens de menu
já desabilitados/dormentes em `AppShell` — Colaborações, Briefings,
Materiais, Aprovações, Pagamentos — sinalizando intenção de virarem mais
5 telas cheias + 5 do Portal), com risco real de crescer para ~32+ se
esses 8 conceitos forem implementados 1-para-1, como o próprio código já
está sinalizando. O documento propõe **19 telas**, via fusões que não
removem nenhuma funcionalidade, só reorganizam navegação:
- `BriefingFormPage`+`MateriaisPage`+`PagamentoPage`+`EnvioPage` (admin,
  hoje 4 rotas para a mesma `ParticipacaoNaCampanha`) → 1 tela
  "Participação — Detalhe" com abas, no mesmo padrão que
  `PortalParticipacaoPage` (Portal) já usa com sucesso hoje.
- `LogisticaPage` + os 5 itens de menu dormentes → 1 tela "Fila de
  Trabalho" com abas (Envios/Materiais/Pagamentos pendentes).
- Os 3 `PlaceholderPage` (`/documentos`, `/historico`, `/perfil` admin)
  viram, respectivamente: ação contextual (gerar documento a partir de
  Parceira/Participação), filtro de status já existente em
  Campanhas — Lista, e um `Drawer` a partir do header — nenhum vira rota
  nova.
- Portal: `PortalCampanhasListPage` + `PortalHistoricoPage` (hoje quase
  código duplicado) → 1 tela com seletor Ativas/Histórico, reduzindo a
  navegação principal do Portal (mobile) de 4 para 3 itens.

**Também documentado:** inventário completo de componentes existentes
(9 mantidos sem mudança, 1 a consolidar — `StatusBadge` é redundante com
`Badge` e deve ser aposentado), 10 componentes novos com uso comprovado
na arquitetura proposta (`Tabs`, `Table`, `Pagination`, `Avatar`,
`Drawer`, `Upload`, `Toast`, `Skeleton`, `Timeline`, `Progress Bar`) e 4
componentes deliberadamente descartados (`Modal` genérico, filtros
avançados, `DatePicker` customizado, `Data Grid`) por não terem
necessidade comprovada no domínio. 10 achados de inconsistência/
duplicação de código real (não hipotéticos) registrados como
"oportunidades de simplificação" no próprio documento, cada um com
recomendação objetiva — ex.: `getInitials()` duplicado literalmente
entre `AppShell.tsx` e `PortalShell.tsx`; `EnvioPage` importa o CSS
module de `PagamentoPage`; toda lista do sistema reimplementa sua
própria tabela/paginação; upload de material no Portal é um
`<input type="file">` cru, sem drag & drop nem barra de progresso —
maior risco de UX mobile do sistema, dado o requisito "Mobile First
obrigatório" da Influenciadora.

**Estado ao final:** `docs/_workspace/UX/BRIEFING_TELAS_E_COMPONENTES_DODO.md`
criado (arquivo novo, ~52KB, pasta `docs/_workspace/UX/` nova) e cópia
salva em `~/Downloads/BRIEFING_TELAS_E_COMPONENTES_DODO.md`, por pedido
explícito do responsável. **Nada commitado, por instrução explícita.**
Nenhuma tela, componente ou fusão proposta no documento foi implementada
nesta sessão — é só a especificação, sujeita a aprovação do responsável
antes de virar trabalho de implementação (o próprio documento diz isso
explicitamente em sua seção final).

## 2026-07-24/25 — §67 Reteste de SSH Locaweb (retomada exata de `§62`) — bloqueio confirmado, achado novo no document root

Pedido explícito do responsável: retomar a investigação de conexão com a
Locaweb exatamente de onde parou em `§62`, sem reiniciar do zero, e
verificar se o bloqueio de SSH foi normalizado. **100% read-only quanto
a código de aplicação — só teste de rede e atualização de documentação.**

**Metodologia:** réplica exata dos testes de `§55`/`§56`/`§60`/`§62` —
mesmos 3 alvos (`criativododo.com.br`, `ftp.criativododo2.hospedagemdesites.ws`,
IP `179.188.55.25`), mesmas 5 portas SSH alternativas de `§55` (22022,
2222, 2200, 2022, 22222), mesmos controles (porta 80 e porta 21 no IP
direto). `nc -zv -w` não respeitou o timeout nesta sessão (hang além do
`-w`, sem `timeout`/`gtimeout` disponíveis no shell) — substituído por
socket Python com `settimeout(8)`, mesma semântica de teste.

**Resultado — porta 22 continua bloqueada, sem nenhuma mudança de
estado:**
- Os 3 alvos: timeout em todos (8s), nenhuma resposta SYN-ACK/RST.
- As 5 portas alternativas: timeout em todas.
- Controles (porta 80 e porta 21 no IP direto): conectaram
  instantaneamente (~0.03s) — confirma que o bloqueio é isolado à porta
  22 do servidor, não à rede local do agente.
- **Chamado aberto na Locaweb segue sem efeito observável sobre a porta
  22.**

**Achado novo, fora do escopo do reteste de SSH:** o document root de
`portal.criativododo.com.br` mudou desde `§56`. Antes, `/` e
`/index.php` retornavam 404 (página padrão de erro Locaweb). Agora
retornam **200**, servindo um script de teste PHP básico ("Teste Básico
de Recursos do PHP") com escrita em disco confirmada (`teste.txt`
gravado com sucesso) — **ainda não é o Laravel**: `/up`, `/api/health`
e `/build/manifest.json` continuam 404. Perguntado ao responsável via
`AskUserQuestion` quem fez esse teste — **confirmado que foi o suporte
da Locaweb**, provavelmente como parte da investigação do chamado de
SSH em aberto. Não é evidência de que a porta 22 vá abrir em breve, só
sinal de que o chamado tem atividade do lado da Locaweb.

**Estado ao final:** nenhuma mudança de estado no bloqueio de SSH — a
contingência de deploy via FTP (`RUNBOOK_DEPLOY_E_ROLLBACK.md`, plano de
`§64`) continua sendo o caminho viável até a porta 22 responder.
`docs/infrastructure/INFRAESTRUTURA.md` §5 (chamado Locaweb) e §8
(document root) atualizados com as evidências desta sessão. **Nada
commitado** — só atualização de documentação de investigação, seguindo
o mesmo padrão de `§55`/`§60`/`§62`.

## 2026-07-24/25 — §68 Instalação e configuração do Google Stitch MCP — conectado, ferramentas ainda não confirmadas na sessão viva

Pedido explícito do responsável, em duas etapas: (1) instalar e
configurar o MCP do Google Stitch no Claude Code, sem tocar no
repositório, como pré-requisito para uma importação futura do projeto
Stitch "Criativo DODÔ Design System" (`project_id 146458383206545482`,
13 telas nomeadas com IDs); (2) só depois da confirmação de que o MCP
está operacional, avançar para a importação em si — **a importação não
foi iniciada nesta sessão**, por instrução explícita. **100%
infraestrutura de tooling do agente — nenhum arquivo do repositório foi
lido para escrita nem alterado.**

Antes de qualquer ação, o responsável definiu uma "REGRA SOBERANA":
`~/Downloads/DESIGN DODÔ.md` (fora do repositório) é a Constituição
Visual do projeto e prevalece sobre qualquer decisão futura de design —
lido nesta sessão só para confirmar que existe (8.5KB), conteúdo ainda
não incorporado a nenhum documento do repositório. Registrar aqui para
que a próxima sessão saiba que esse documento existe e tem prioridade
declarada, mesmo estando fora de `docs/`.

**Trajeto até a configuração funcional (relevante para não repetir
becos sem saída em sessões futuras):**

1. Pacote `@_davideast/stitch-mcp@0.9.0` (Node/npx) — `doctor` passou em
   todos os checks usando o `gcloud` do sistema já autenticado
   (`elafashionmkt@gmail.com`, projeto `projeto-influenciadora`). Isso
   **não** foi suficiente: o servidor MCP real (subcomando `proxy`) exige
   `STITCH_API_KEY` ou `STITCH_ACCESS_TOKEN` explícitos — confirmado lendo
   o bundle fonte do pacote (`StitchProxy` em `core.js`); a variável
   `STITCH_USE_SYSTEM_GCLOUD` documentada no README não é consumida por
   esse componente nesta versão.
2. O wizard `init` tenta abrir OAuth via navegador; ambiente headless
   ("No display detected"). Forçar a seleção de opções via teclas
   ANSI (`\x1b[B`) por stdin pipado funcionou parcialmente mas é frágil
   e ilegítimo como método de autenticação — abandonado.
3. Parado e perguntado ao responsável (`AskUserQuestion`) — decidiu por
   API Key. Gerou a própria chave na página de Settings do app Stitch e
   forneceu o comando `claude mcp add stitch --transport http --header
   "X-Goog-Api-Key: ..." https://stitch.googleapis.com/mcp`.
4. Esse endpoint HTTP direto autentica com sucesso, mas o
   `tools/list` falha no cliente MCP do Claude Code com
   `can't resolve reference #/$defs/ScreenInstance from id #`.
   Diagnosticado via `curl` bruto ao endpoint: **bug real do lado do
   servidor do Google** — 3 das 15 ferramentas
   (`upload_design_md`, `create_design_system_from_design_md`,
   `apply_design_system`) têm `$ref` para `#/$defs/ScreenInstance` sem
   essa definição existir dentro do próprio schema da ferramenta. Não é
   algo corrigível do lado do cliente/projeto.
5. Contorno: trocado o endpoint HTTP direto pelo proxy local do próprio
   pacote (`npx @_davideast/stitch-mcp proxy`, transporte stdio) com
   `STITCH_API_KEY` como variável de ambiente. O proxy local não faz a
   mesma resolução estrita de schema e descobre as 15 ferramentas sem
   erro (confirmado rodando manualmente: "Connected to Stitch,
   discovered 15 tools"). `claude mcp get stitch`/`claude mcp list`
   confirmam `✔ Connected`.

**Onde ficou registrada a configuração:** `claude mcp add`, escopo
`local` (arquivo `~/.claude.json`, seção do projeto — **fora do
repositório git**, nada em `.mcp.json` nem em nenhum arquivo versionado).
Consistente com a instrução explícita do responsável de não alterar o
repositório nesta etapa.

**Estado ao final — não 100% fechado:** a CLI (`claude mcp get`/`list`)
confirma o servidor `stitch` conectado, mas nesta sessão viva do Claude
Code as ferramentas `mcp__stitch__*` **não apareceram** via `ToolSearch`
— servidores MCP adicionados no meio de uma sessão só entram no índice
de ferramentas após reload/reinício, isso é comportamento do harness, não
da configuração do Stitch em si. O responsável abriu o diálogo `/mcp` e
o dispensou (`"MCP dialog dismissed"`) logo antes de chamar `/fim`, sem
confirmação explícita de que isso recarregou os servidores. **A
importação do projeto Stitch (13 telas listadas pelo responsável) segue
não iniciada** — só volta à mesa depois que uma sessão nova confirmar
que as ferramentas do Stitch aparecem de fato.

**Nota de segurança:** a API Key do Stitch está em texto plano em
`~/.claude.json` (escopo local, fora do repositório) — local esperado
para credenciais de MCP no Claude Code, não é um vazamento no
repositório, mas vale que a próxima sessão evite reexibir o valor da
chave em texto nas respostas sem necessidade.

## 2026-07-25 — §69 Importação fiel do Stitch + equivalência semântica do Design System DODÔ (`design-system/`, fora de `src/` de produção)

Continuação direta do `§68` (Stitch MCP confirmado `Connected` e com
ferramentas disponíveis nesta sessão). Três pedidos sequenciais do
responsável, cada um só iniciado após o anterior estar concluído e
reportado:

**1. Importação fiel (sem alteração visual).** Todas as 13 telas do
projeto Stitch `146458383206545482` ("Criativo DODÔ Design System")
baixadas para `design-system/{screens,images,code,assets,design}`
(screenshot + HTML + metadados por tela). `~/Downloads/DESIGN DODÔ.md`
copiado byte-a-byte (`diff` confirmou identidade) para
`design-system/design/DESIGN_DODO.md` — esta cópia dentro do repositório
passa a ser a Regra Soberana operacional; o arquivo em `~/Downloads`
deixou de ser a única fonte. Gerados também `SCREENS_INVENTORY.md`
(inventário por tela: ID, device, dimensões, componentes identificados
por varredura de palavras-chave, design system usado) e
`PROJECT_MANIFEST.json` (metadados brutos do Stitch: `list_screens`,
`get_project`, `list_design_systems`).

**Achados de auditoria da importação (registrados, não corrigidos nesta
etapa):**
- O tema do Stitch usa `headlineFont: BE_VIETNAM_PRO` para títulos —
  diverge do DESIGN_DODO.md, que exige Elms Sans. Motivo provável:
  "Elms Sans" não existe no enum de fontes do Stitch (não confirmado).
- Das 19 rotas do inventário do DESIGN_DODO.md §4, o Stitch só cobre 13
  telas — 4 delas (Calendário, Pagamentos, Configurações, Fashion
  Journal) não constam no inventário de 19 rotas; várias rotas do
  inventário (Landing, Esqueci/Definir Senha, Cadastro, Marcas,
  Pendências, Detalhe da Participação, Perfil do Portal) não têm tela
  correspondente no Stitch. Decisão de produto/arquitetura pendente do
  responsável — nenhuma tela foi criada/removida para reconciliar.
- Um dos 13 arquivos (`briefing-da-campanha.html`) veio do Stitch **sem**
  o bloco `tailwind.config` que as outras 12 telas têm — bug pré-existente
  do export do Stitch (as classes semânticas já escritas pelo próprio
  Stitch nesse arquivo não tinham de onde herdar cor). Corrigido na etapa
  3 abaixo, reconstruindo a mesma infraestrutura das telas irmãs.

**2. Revisão do DESIGN_DODO.md (Regra Soberana v2).** O responsável
apontou que o documento estava desatualizado em relação à direção de
arte atual e pediu atualização formal antes de qualquer aplicação de
tokens. Editado `design-system/design/DESIGN_DODO.md` (não o arquivo em
`~/Downloads`, que segue intocado):
- `color-background`: `#EFE7DC` → `#F1ECE5`; descrição "Creme" → "Off-White
  Quente" em todo o documento (zero referência residual, confirmado via
  grep).
- Nova §1.6 "Superfícies e Hierarquia de Fundo": encerra a lógica
  automática "fundo → card branco → sidebar branca". Sidebar e Topbar
  passam a usar o mesmo tom do background (deixam de parecer card);
  branco vira exceção para destacar conteúdo, não padrão.
- §1.1 precisada: `color-primary` exclusivo para CTA dominante da tela
  (nunca navegação); `color-secondary` (roxo) explicitamente para
  navegação/links/estado ativo/seleção — `Navigation Active` passa a ser
  roxo, nunca laranja.
- Nova §2.4 "Hierarquia Visual e Método de Equivalência": composição >
  tipografia > cor; proíbe explicitamente substituição de HEX em massa;
  exige equivalência por papel semântico.

**3. Aplicação semântica dos tokens às 13 telas (não uma equivalência
página-a-página — por componente/papel, como pedido explicitamente).**
Antes de qualquer troca de valor, cada papel visual (Background, Sidebar,
Topbar, Card, Primary/Secondary CTA, Navigation, Navigation Active,
Links, Inputs, Borders, Dividers, Badges, Success, Error, Typography)
foi auditado por leitura real do HTML (grep com contexto, não suposição
por nome de token Material) para descobrir a que elemento cada token do
Stitch estava de fato vinculado — ex.: descoberto que Sidebar usa
`bg-surface` e Card usa `bg-surface-container-lowest`, tokens
**diferentes**, o que permitiu aplicar a nova filosofia de superfície só
editando valores de config, sem tocar em nenhuma classe HTML na maior
parte dos casos.

Uma tentativa anterior nesta mesma sessão, feita por substituição
direta de HEX (tabela hex-antigo→hex-novo), foi **revertida a pedido do
responsável** por descaracterizar a direção de arte do Stitch (colapsava
papéis funcionais distintos na mesma cor). A versão final documentada
aqui é a segunda tentativa, por papel semântico.

**Resultado aplicado (todas as 13 telas, verificado estruturalmente —
contagem de tags HTML idêntica antes/depois, exceto adições
explicitamente justificadas):**
- Mapa de ~49 chaves de cor do `tailwind.config` reatribuído por papel
  (não por hex antigo) em 12 telas; a 13ª (`briefing-da-campanha.html`)
  recebeu o bloco `tailwind.config` reconstruído (ausente na origem, ver
  achado acima) com o mesmo mapa.
- `border-radius`: 4/8/12px → 8/12/20px (chip/padrão/grande), pill
  (999px) inalterado.
- Tipografia: "Be Vietnam Pro" substituída pela **fonte real Elms Sans**
  (`frontend/src/assets/fonts/ElmsSans.ttf`, já usada em produção —
  copiada para `design-system/assets/fonts/`, referenciada via
  `@font-face` local nas 13 telas).
- **Navigation Active / Tab Active**: única correção que trocou nome de
  classe (não só valor de token) — `text-primary/border-primary` →
  `text-secondary/border-secondary`, em 11 telas (as 2 restantes: uma
  não tem elemento de navegação — tela de auth — e a outra já resolvia
  corretamente via token, `primary-container` reatribuído a roxo).
  Justificativa: o Stitch vinculou "primary" a esse papel; a Regra
  Soberana v2 explicitamente reatribui esse papel a "secondary".
- Secondary CTA (botão suave/outline) reatribuído à família roxo, para
  não competir com o CTA primário laranja único por tela (regra 3.1 do
  DESIGN_DODO.md) — inclui 2 botões escritos com classes literais fora
  do sistema de tokens, corrigidos manualmente após leitura de contexto.
- 3 casos de HEX hardcoded fora do sistema de tokens, cada um
  identificado e corrigido individualmente por papel (não por busca
  cega de hex): topbar de `painel-administrativo.html`; painel "Cores da
  Marca" de `configuracoes.html` (cor **e legenda de texto visível**
  corrigidas juntas, porque a legenda antiga passaria a exibir um hex
  factualmente errado se só a cor mudasse).
- Verificação visual real via Playwright (servidor HTTP local
  temporário) em 2 telas, incluindo checagem de `getComputedStyle` para
  confirmar os valores renderizados (não só o texto-fonte).

**Pendências explícitas, sinalizadas ao responsável, valores provisórios
aplicados só para não quebrar contraste/hierarquia (não são literais do
DESIGN_DODO.md):**
- `outline-variant` (borda padrão/divisor, 264 usos no projeto): `#E4DED2`
- `outline` (borda forte/ícone mudo): `#B9AF9E`
- `on-surface-variant` (texto de apoio/legenda, **418 usos — maior volume
  do projeto**): `#6B655C`
- `surface-container-low` (fundo de hover/ativo da navegação, agora que
  a sidebar usa o tom de background): `#E7DED2`
- Hover do botão "Solicitar Acesso" em `login-refinado.html` ficou com
  tom levemente inconsistente (laranja-claro sob texto/borda roxo) —
  cosmético, baixo impacto, não ajustado.

**Nenhum commit feito nesta sessão.** Todo o trabalho está em
`design-system/` (diretório novo, não rastreado pelo git). Backup
completo do estado pré-aplicação preservado fora do repositório
(scratchpad da sessão), não crítico para continuidade.

**Não confundir com `est-dio-el-design-system/`** — pasta legada
diferente, com deleções pendentes não relacionadas nesta mesma branch
(`docs/governance-phase2`), não tocada nesta sessão.

**Atualização (2026-07-25, mesmo dia): aprovação dos 4 tokens inferidos
e commit de `design-system/`.** Responsável revisou os 4 valores um a
um (não em bloco) e aprovou todos sem alteração: `outline-variant`
`#E4DED2`, `outline` `#B9AF9E`, `on-surface-variant` `#6B655C`,
`surface-container-low` `#E7DED2`. Deixaram de ser provisórios —
formalizados em `design-system/design/DESIGN_DODO.md` §1.7 ("Tokens
Estruturais Derivados"), nova seção que documenta a origem (tokens
estruturais exigidos pelo Stitch, sem literal próprio na paleta de
marca §1.1, derivados como neutros quentes entre `color-background` e
`color-text`, sem introduzir matiz novo). Responsável também aprovou o
commit de `design-system/`, feito isoladamente, sem relação com as
outras frentes não commitadas do working tree. A divergência de
inventário (13 telas Stitch × 19 rotas do DESIGN_DODO.md) permanece
não tratada, a pedido explícito do responsável.

## 2026-07-25 — §70 Protótipo navegável do Design System + achado de conflito ADR-019 x DESIGN_DODO.md v2

Continuação da mesma sessão do §69 (aprovação de tokens + commit), com dois
pedidos novos e distintos do responsável.

**1. Shell de navegação para design-system/code/.** Pedido: transformar as 13
telas estáticas num protótipo navegável por menu, sem abrir HTML isolado, sem
alterar nenhum layout existente. Criado `design-system/index.html` (novo,
ainda NÃO commitado — decisão pendente, ver abaixo): sidebar permanente +
topbar, CSS/JS embutidos (sem depender de build), consumindo diretamente os 4
tokens estruturais aprovados no §69 mais a paleta oficial do DESIGN_DODO.md
§1.1. Arquitetura: os 13 arquivos de code/ continuam 100% intocados; a
navegação carrega cada tela dentro de um iframe, com roteamento por
location.hash (sem servidor/backend). Menu agrupado conforme DESIGN_DODO.md
§4 (Autenticação / Administração / Portal da Influenciadora); Home =
painel-administrativo.html (mapeado para "/" no inventário de 19 rotas,
único candidato natural a "Home").

Verificado servindo design-system/ via `python3 -m http.server 8971`
(processo temporário desta sessão, encerrado ao final — não persiste entre
sessões, precisa ser reiniciado) e dirigindo com Playwright real: os 13
arquivos retornam 200, fonte Elms Sans local resolve, navegação por clique
funciona (hashchange troca o iframe.src e destaca o item ativo em roxo,
conforme regra "Navigation Active" do DESIGN_DODO.md), console sem erros
após adicionar `<link rel="icon" href="data:,">` (suprime 404 de favicon
implícito do browser — não é erro de fonte/css/js/asset do próprio Design
System, mas foi corrigido mesmo assim por estar no escopo "eliminar 404").

**Pendência nova:** commitar design-system/index.html — mesma frente do
§69, mas é uma decisão separada (não foi pedida explicitamente no pedido de
commit anterior, que cobria só os 44 arquivos originais da importação).

**2. Diagnóstico do estado do frontend React vs. Design System (somente
leitura, sem alterações — pedido explícito do responsável).** Motivado por
localhost:5173 (Vite) ainda mostrar o layout antigo. Achados:

- Entry point do Vite: frontend/index.html -> frontend/src/main.tsx.
  localhost:5173 é o dev server puro do Vite sobre frontend/src, NÃO passa
  pelo Laravel — só o build de produção (VITE_BUILD_TARGET=locaweb) vai
  para backend/public/build, servido pelo Laravel (ADR-015).
- design-system/ está totalmente isolado: nenhuma referência real a ele em
  frontend/ (confirmado por grep — o único hit é coincidência de substring
  com o nome da pasta legada est-dio-el-design-system/).
- **Achado importante, não corrigido nesta sessão:** existem hoje dois
  Design Systems DODÔ com papéis de cor opostos para roxo/laranja, nenhum
  supersedendo o outro formalmente:
  - frontend/src/theme/tokens.css (não commitado, frente §58, ADR-019,
    2026-07-24) — --color-action (primária/CTA) = ROXO #564f94; laranja =
    secundária.
  - design-system/design/DESIGN_DODO.md §1.1 (Regra Soberana v2, revisada
    nesta mesma sessão de hoje) — color-primary (CTA dominante) = LARANJA
    #F14F28; color-secondary/roxo = navegação. Papel invertido em relação
    ao tokens.css.
  - docs/handoff/README.md (entrada de 2026-07-24) registra "roxo é a
    cor-assinatura/primária... decisão final e definitiva do responsável",
    já observando "idas e vindas" no mesmo dia sobre essa mesma decisão.
  - **Achado adicional (inferência por timestamp, não confirmado por
    conversa):** ~/Downloads/DESIGN DODÔ.md (arquivo de origem, intocado)
    tem mtime 2026-07-24 23:02 — posterior ao registro do handoff — e já
    traz laranja como color-primary. É plausível que o responsável tenha
    revertido a decisão de novo, depois do handoff/ADR-019, só que dessa
    vez no documento de design, não em ADR novo. Isso explicaria por que
    DESIGN_DODO.md (herdado desse arquivo, inclusive antes da revisão v2
    desta sessão) sempre teve laranja como primária, enquanto
    ADR-019/tokens.css ainda documentam roxo.
  - ADR-019 cita est-dio-el-design-system/ como SSOT visual do frontend —
    mas essa pasta tem arquivos pendentes de deleção não commitados nesta
    mesma working tree (DESIGN_SYSTEM.standalone.html, toda a subpasta
    marca dodo/), sinal de que já não é tratada como fonte viva por quem
    fez essas deleções.

  Nenhuma correção foi feita — é achado de diagnóstico, reportado ao
  responsável. Decisão pendente: qual documento é a fonte de verdade atual
  para o papel de roxo/laranja (ADR-019+tokens.css vs. DESIGN_DODO.md v2),
  e se isso exige um ADR novo formalizando a reversão (CLAUDE.md: "Não
  alterar arquitetura sem ADR" — o próprio agente não deve decidir isso
  sozinho).
- Integração do Design System ao frontend React exigiria, além da decisão
  de paleta acima: portar as telas Tailwind estáticas de design-system/code/
  para componentes React em frontend/src/components//pages/ (trabalho de
  implementação novo, não existe hoje); e resolver a aprovação pendente da
  frente §58 (commit do rebranding do frontend), que segue bloqueada.

## 2026-07-25 — §71 Resolução do conflito de paleta roxo/laranja (`§70` item 2) + exclusão completa de `design-system/` + início de redesign incremental do frontend React

Sessão nova (pós-`/clear`), iniciada com dois diagnósticos só-leitura a
pedido do responsável (produção e ambiente local — sem alterações), seguidos
de três decisões diretas do responsável em sequência na mesma conversa.

**1. Diagnóstico de produção (só leitura).** Respondido com base apenas no
que já estava carregado em contexto (`CLAUDE.md`, `git status`/log) —
sinalizado explicitamente ao responsável que, sem ler `TASK_ROUTER.md`
(proibido pelo pedido "modo turbo" daquele turno), o diagnóstico de SPECs
prontas/faltando não tinha confiabilidade real. Sem alterações.

**2. Diagnóstico do ambiente local (só leitura).** Confirmou os achados do
`§70` item 2 com leitura direta de código: `frontend/src/theme/tokens.css`
já tinha paleta "DODÔ v2.0" (`ADR-019`, roxo primária) hardcoded; `design-system/`
continuava puramente estático (grep em `frontend/src` = zero referência);
`frontend/index.html` ainda com `<title>ELÃ | influência</title>`; e
`backend/routes/web.php` só serve `/api/*` em dev (`localhost:8000` não
renderiza a SPA nesse modo — só `/api/*` — por não existir
`backend/public/build`; a "interface antiga" do responsável só existe de
fato em `localhost:5173`, servido puro pelo Vite).

**3. Decisão do responsável: fonte oficial de paleta = `design-system/`
(Stitch).** Resolve a pendência do `§70` item 2. Implementado com o menor
esforço pedido: `frontend/src/theme/tokens.css` teve os valores de cor/
tipografia substituídos pelos lidos de `design-system/code/*.html`
(consistentes nas 13 telas — não pelo `design-tokens-stitch.json` bruto,
que diverge dos HTMLs em alguns valores por ajuste manual documentado num
comentário do próprio HTML: "Adjusted to Roxo from user prompt while
respecting system logic"). Resultado: `--color-action` (primária/CTA) =
laranja `#f14f28`; `--color-highlight` (secundária) = roxo `#504ea1`;
accent = lima `#daea49`. Nomes das variáveis CSS preservados — nenhum
componente React precisou mudar (todo consumo é via `--color-*`
semântico, nenhum componente referenciava `--dodo-*` diretamente).
`frontend/index.html` `<title>` trocado para "Criativo DODÔ | Admin Panel".
Validado visualmente via HMR do Vite.

**4. Mudança de direção do responsável, no turno seguinte: `design-system/`
deixa de ser usado como fonte — apagar a pasta inteira e qualquer
referência a ela; a aplicação React em `localhost:5173`/`127.0.0.1:8000`
passa a ser a base oficial do produto, a evoluir por redesign incremental
(não substituição) com a identidade DODÔ, na ordem AppShell → Sidebar →
Topbar → Dashboard → componentes globais → demais telas, validando
visualmente a cada etapa.**

Executado nesta sessão:

- `design-system/` removida por completo — `git rm -r` para os 44 arquivos
  rastreados (import original do `§69`) + `rm -rf` para
  `design-system/index.html`, o protótipo navegável criado no `§70` que
  nunca chegou a ser commitado (não rastreado, sobreviveu ao primeiro
  `git rm`). **Pendência do `§70` ("commitar `design-system/index.html`?")
  fica resolvida por obsolescência** — o arquivo não existe mais, a
  decisão virou "não".
- Grep de confirmação: nenhuma referência a `design-system/` sobrevive em
  código executável (`frontend/src`, `backend/routes`, `backend/resources`)
  — só em documentação (`docs/adrs/ADR-019-...`, `docs/design/
  DESIGN_SYSTEM.md`, `docs/handoff/README.md`, entradas históricas deste
  próprio `TASK_ROUTER.md`). Documentação **deliberadamente não tocada**
  — CLAUDE.md proíbe alterar ADR/arquitetura fora de fluxo próprio, e o
  `/fim` que fechou esta sessão reforça a mesma proibição para o
  encerramento. Fica pendência explícita abaixo.
- Comentário de cabeçalho de `frontend/src/theme/tokens.css` (que citava
  `design-system/code/*.html` e `design-tokens-stitch.json` como fonte)
  reescrito para não referenciar mais a pasta excluída.
- Carregada a skill `frontend-design` (guidance de design, não plano
  aprovado — nenhuma diretriz de conteúdo foi imposta ao responsável).
- Abertas 3 tarefas de acompanhamento (task tool): redesign do AppShell
  (sidebar+topbar), do Dashboard, dos componentes globais — todas
  **pendentes, nenhuma iniciada**.
- Ambiente de dev confirmado no ar (processos do próprio responsável,
  não iniciados nem encerrados por esta sessão): `php artisan serve`
  (PID 15903, `:8000`) + Vite (PID 15776, `:5173`), ambos via `composer
  dev`. Login funcional confirmado via `admin@tear.test` / `password`
  (`DevUserSeeder`, guardado por `app()->environment('local','testing')`).
  Screenshots de baseline capturados (landing pública já refletindo a
  paleta nova; Dashboard/AppShell autenticado no estado **anterior** ao
  redesign — sidebar sem cor de fundo, itens "(em breve)" quebrando em
  duas linhas, topbar plano).
- Lidos por completo `AppShell.tsx`/`.module.css` e `Dashboard.tsx`/
  `.module.css` para planejar o redesign: confirmado que todo componente
  consome só variáveis semânticas (`--color-*`, `--font-*`, `--sp-*`,
  `--radius-*`) — nenhum precisa de mudança estrutural só por causa da
  paleta. Checados os ativos disponíveis em `frontend/public/`
  (`horizontal-preto.svg`/`horizontal-branco.svg` da marca DODÔ já em
  uso; `elã-*.svg` são resquício da marca antiga, não usados, fora de
  escopo desta sessão; `icons.svg` é o sprite genérico padrão do template
  Vite, sem ícones de marca aproveitáveis) e confirmado que
  `frontend/package.json` não tem biblioteca de ícones instalada (só
  `react`/`react-dom`/`react-router-dom`/`axios`) — decisão em aberto para
  quem continuar o redesign.

**Sessão interrompida pelo `/fim` antes de qualquer edição visual real**
— nenhuma linha de `AppShell.module.css`/`Dashboard.module.css`/
componentes globais foi alterada ainda. O trabalho desta sessão foi só
a resolução da paleta + limpeza de `design-system/` + preparação
(pesquisa, ambiente, baseline) para o redesign, não o redesign em si.

**Pendência nova, importante:** `ADR-019` (registrado, não tocado nesta
sessão) ainda documenta roxo como cor primária — o código
(`tokens.css`) já reflete a decisão oposta (laranja primária) por
instrução direta do responsável nesta conversa, mas essa decisão **não
foi formalizada em ADR novo**. Mesmo padrão de risco que o `§70` já
sinalizava: enquanto não houver ADR novo (ou emenda formal a `ADR-019`),
existe divergência entre doc-fonte-de-verdade e código rodando. Não é
ao agente decidir isso sozinho (`CLAUDE.md`: "Não alterar arquitetura
sem ADR") — só registrar e sinalizar, o que este parágrafo faz.

Referências completas: diagnóstico de produção e do ambiente local, e a
implementação da paleta, aconteceram todos nesta mesma sessão/turno
(`§71`); histórico anterior do Design System em `§69`/`§70`.

## 2026-07-25 — §72 Plano técnico de redesign do frontend (preparação de execução do `§71`) + correção de defasagem do `ESTADO_SESSAO.md`

Sessão nova, iniciada com `/comecar`. Dois blocos de trabalho:

**1. Cross-check de `/comecar` encontrou defasagem real.** `ESTADO_SESSAO.md`
ainda descrevia o fechamento do `§70`, mas `§71` (sessão anterior, mesmo
dia) já tinha resolvido o conflito de paleta roxo/laranja e apagado
`design-system/` por completo — mudança de estado real do repositório não
refletida no snapshot. Reportado ao responsável no relatório de abertura,
**não corrigido automaticamente** (regra do `/comecar`: avisar, nunca
corrigir sozinho). A correção do snapshot foi feita só agora, neste
`/fim`, reescrevendo `ESTADO_SESSAO.md` com o estado real pós-`§71`.

**2. Plano técnico de implementação do redesign, a pedido do responsável
("modo turbo"), só leitura do frontend atual — nenhuma linha de código
alterada.** Escopo: para cada tela/componente principal, o que permanece,
o que muda visualmente, o que é reutilizável, quais tokens usar, quais
arquivos mexer — na ordem já decidida no `§71` (AppShell → Sidebar →
Topbar → Dashboard → componentes globais → demais telas).

Achados da análise (lida diretamente do código em `frontend/src/`, sem
qualquer alteração):

- `tokens.css` já está com a paleta DODÔ v2 aplicada (laranja
  `--color-action` primária, roxo `--color-highlight` secundária, fontes
  Elms Sans/Work Sans carregadas) — a base de cor **já está pronta**; o
  gap real é geometria (raio/superfície), não cor. `--radius-card` e
  `--radius-block` existem no token mas só são consumidos em
  `EmptyState.module.css` — o resto do app, Dashboard incluso, ainda usa o
  tratamento "flat"/hairline herdado do sistema visual anterior.
- `AppShell.tsx` e `PortalShell.tsx` são quase idênticos (mesmo CSS module
  importado por ambos) — oportunidade clara de parametrizar `AppShell`
  (props `navItems`/`tagline`) e reduzir `PortalShell` a wrapper, o que
  cascateia qualquer mudança visual do shell para admin e portal ao mesmo
  tempo.
- `StatusBadge.module.css` é CSS 100% duplicado de `Badge.module.css` —
  candidato a virar wrapper fino de `Badge`.
- Não existe componente `Card` nem `Modal` em nenhum lugar do código hoje
  (confirmado por grep) — `Card` é extração de um padrão já duplicado
  (`.card` em `Dashboard.module.css`, reimportado direto por
  `PortalDashboardPage.tsx`); `Modal` é componente **novo**, sem nenhum
  consumidor real hoje — decisão de construir agora ou só especificar
  fica em aberto para o responsável, para não nascer código morto
  (`CLAUDE.md`: não adicionar funcionalidade além do necessário).
- `AuthSplitLayout.module.css` tem um comentário desatualizado ("roxo é a
  nova cor-assinatura, substitui o laranja") que contradiz a decisão atual
  do `tokens.css` (laranja é primária) — mesmo padrão de resíduo de
  decisão revertida já visto no `§70`/`§71`, aqui em escala de comentário
  de código, não de arquitetura.
- Confirmado que ~8 primitivos compartilhados (`TextField`/`SelectField`/
  `TextareaField`, `EmptyState`, `Badge`/`StatusBadge`, `AuthSplitLayout`,
  padrão `<table>` inline, `Button`) cobrem quase 100% das ~25 telas —
  redesenhar os primitivos cascateia para quase todo o app com pouco
  trabalho por tela.

**Entregável: `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`** (novo,
único arquivo criado/alterado nesta sessão, a pedido explícito do
responsável). Contém a análise completa por tela/componente e uma
checklist de implementação de 33 tarefas pequenas e independentes,
organizadas em 5 fases (A: fundação de componentes — `Card`,
`StatusBadge`; B: shell — sidebar/topbar/avatar; C: Dashboard; D:
componentes globais restantes + decisão do `Modal`; E: as ~20 telas
restantes, agrupadas por padrão estrutural).

**Nenhuma linha de código foi alterada, nenhum commit foi feito, nenhum
teste foi rodado** — sessão inteiramente de planejamento, conforme pedido
explícito ("não implemente", "não altere nenhum arquivo" além do plano em
si).

Pendências deixadas em aberto no próprio plano, para não decidir sozinho:
(a) extrair `Sidebar`/`Topbar` como componentes próprios ou manter dentro
de `AppShell.tsx` — decisão de engenharia de baixo risco, não bloqueante;
(b) construir `Modal` agora sem consumidor real ou só especificar e
adiar até haver uma tela que precise — decisão do responsável antes da
Fase D item 13 do plano.

**Pendência herdada, sem mudança nesta sessão:** `ADR-019` ainda documenta
roxo como primária, código já reflete laranja — ver `§71` para o detalhe
completo; não tratado aqui por não ser o escopo desta sessão.

Referências completas: plano em `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`;
decisão que originou o plano em `§71`; achado de defasagem do
`ESTADO_SESSAO.md` registrado aqui e corrigido no `/fim` desta mesma
sessão.

## 2026-07-25 — §73 Reorganização documental de `ESTADO_SESSAO.md` — snapshot enxuto + `docs/_workspace/logs/` + nova política de manutenção (decisão explícita do responsável)

A pedido explícito do responsável ("modo manutenção"), mudança na forma
de manter `ESTADO_SESSAO.md`, para reduzir consumo de contexto e
acelerar novas sessões. Escopo puramente documental — **nenhum código de
aplicação alterado, nenhuma refatoração, nenhuma funcionalidade nova**.

**Problema:** `ESTADO_SESSAO.md` vinha crescendo a cada `/fim` (chegou a
384 linhas) porque acumulava narrativa completa de sessão, checklists
detalhados, riscos e um bloco de "prompt de handoff" inteiro — em vez de
ser só um snapshot do estado atual. Isso inflava o contexto lido em todo
`/comecar`.

**Mudança estrutural:**

- Criada a pasta `docs/_workspace/logs/`, com o primeiro arquivo de fase
  `docs/_workspace/logs/2026-Rebranding-DODO.md` — recebeu, **sem
  nenhuma perda de conteúdo**, tudo que foi retirado do
  `ESTADO_SESSAO.md` anterior: a seção "Última sessão concluída" (§72),
  "Riscos ativos", "IA recomendada", "Prompt de handoff" e o "Checklist"
  completo com todas as sub-checklists (plano de redesign, paleta/
  `design-system/`, SSH, briefing de UX, deploy, Sprint 01, arquitetura
  de comandos).
- `ESTADO_SESSAO.md` reescrito do zero com só 7 seções fixas: Situação
  atual, Objetivos, Próxima missão, Pendências, Últimos commits
  relevantes, Arquivos importantes, Links para logs relacionados. Caiu
  de 384 para ~165 linhas.

**Nova política de manutenção (permanente, vale a partir de agora):**

1. `ESTADO_SESSAO.md` deixa de ser um arquivo com qualquer traço
   histórico — é sempre **reescrito por completo**, nunca acrescentado.
   Isso já era a regra formal do `/fim` antigo, mas na prática o arquivo
   vinha sendo tratado como diário de bordo (seções "Última sessão
   concluída"/checklist acumulando detalhe). Fica proibido a partir de
   agora.
2. Antes de sobrescrever `ESTADO_SESSAO.md`, qualquer informação
   histórica ainda relevante deve ser movida para o arquivo de log da
   fase corrente em `docs/_workspace/logs/` (não descartada).
3. Ao concluir uma fase importante (Sprint, Rebranding, Go-Live,
   Refactor etc.), o arquivo de log correspondente deve ser encerrado
   com: Resumo da fase, Resultado, Decisões tomadas, Commits relevantes,
   Próxima fase — antes de abrir o arquivo de log da fase seguinte.
4. Cada arquivo de log, ao ultrapassar ~1500 linhas, é encerrado e um
   novo arquivo é aberto para a fase corrente/seguinte — o anterior é
   preservado como histórico imutável, nunca reescrito.
5. Ordem de leitura no início de sessão: `ESTADO_SESSAO.md` primeiro;
   `docs/_workspace/logs/` só quando a missão exigir contexto histórico
   específico que o snapshot não cobre. `TASK_ROUTER.md` continua sendo
   a fonte única de estado e dependências entre SPECs — não é
   substituído por `logs/`, que cobre a narrativa de sessão que antes
   inflava o `ESTADO_SESSAO.md`.

Comandos `.claude/commands/fim.md` e `.claude/commands/comecar.md`
atualizados na mesma sessão para refletir essa política (ver diff dos
próprios arquivos). `CLAUDE.md` §"Documentação complementar" também
atualizado para citar `docs/_workspace/logs/` no mapa de pastas de
`docs/`.

**Nenhum código de aplicação, SPEC, ADR ou domínio foi alterado.** Escopo
estritamente de organização documental operacional, autorizado
diretamente pelo responsável nesta sessão.

### Estado ao final — `[x]` concluído e commitado

- [x] `docs/_workspace/logs/` criada, com `2026-Rebranding-DODO.md`
      recebendo 100% do histórico retirado do `ESTADO_SESSAO.md`
- [x] `ESTADO_SESSAO.md` reescrito como snapshot de 7 seções, ≤300 linhas
- [x] Política de manutenção implementada em `/comecar` e `/fim`
- [x] `CLAUDE.md` atualizado com a nova responsabilidade de `logs/`
- [x] Commit `36ab33d3cf37799d1a15d7f72a0c14f57a3f1593` — só os 6
      arquivos da reorganização (correção de um commit anterior,
      `6f69538`, que incluiu por engano 44 deleções de `design-system/`
      já staged de outra sessão — corrigido com `git reset --soft
      HEAD~1` sem perda de dados, nada pushado)
- [x] Verificação de referências à arquitetura antiga — nenhuma
      referência ativa desatualizada encontrada (ver
      `docs/_workspace/logs/2026-Rebranding-DODO.md`, entrada de
      encerramento)
- [ ] Push para `origin` — não feito (fora do escopo desta frente,
      segue como pendência geral de todos os commits locais)

**Frente encerrada.** Próxima missão do projeto: redesign incremental do
frontend (Fase A do plano, `docs/_workspace/UX/PLANO_REDESIGN_FRONTEND.md`),
sem relação com esta reorganização documental.

## 2026-07-25 — §74 Manual de Design DODÔ v1.0 — nova SSOT visual, arquivamento das 3 gerações anteriores, `ADR-019` formalizada, plano de implementação React (decisão explícita do responsável)

Sessão paralela à do `§73` (agente diferente, mesmo dia). Decisão de
domínio/arquitetura visual, por isso registrada aqui além do
`ESTADO_SESSAO.md` e do log de fase.

**Contexto:** o `§71` já havia resolvido qual paleta está em produção
(laranja-primária/roxo-secundária, `frontend/src/theme/tokens.css`), mas
o `ADR-019` que deveria formalizar isso nunca foi commitado e ainda
nomeava a geração revertida (`est-dio-el-design-system/`, roxo-primária)
como SSOT — contradição pendente desde o `§71`/`§72`. Havia, além disso,
três gerações de Design System soltas no repo (`docs/design/stitch-
export/` pré-DODÔ, `design-system/` import Stitch 25/07, `est-dio-el-
design-system/` v2.0 roxo) mais documentos de marca no Downloads do
responsável (`Brand-Foundations-v0.1`, briefings, checklists) nunca
integrados ao repositório.

**Decisão:** consolidar tudo num documento único — **Manual de Design
DODÔ v1.0** (`docs/design/manual/index.html` + `.pdf`) — como SSOT visual
oficial do projeto, substituindo a busca por "qual pasta é a fonte
certa" por um documento vivo com o racional de cada decisão. Processo
completo (inventário → construção do Manual com aprovação do responsável
por etapas → arquivamento → auditoria React → plano de implementação)
narrado em detalhe em `docs/_workspace/logs/2026-Rebranding-DODO.md`,
entrada "Consolidação do Manual de Design DODÔ v1.0".

**Resultado, commitado em `d08e8fd`:**

- `docs/design/manual/` — Manual v1.0, HTML autocontido + PDF. Paleta,
  tipografia, logotipo e naming tratados como **congelados** (documentados
  como existem, não redesenhados). Único princípio de evolução aberto:
  curvatura de superfícies grandes (cards/containers/painéis) — sem
  token numérico ainda, gated em decisão futura do responsável.
- `docs/design/archive/` — as 3 gerações anteriores preservadas (git
  history restaurado + `git mv`, nenhum dado apagado), com README de
  contexto. Nunca mais usar como referência normativa.
- `ADR-019` reescrita (nunca tinha sido commitada) — nomeia o Manual
  como SSOT, resolve a contradição do `§71`/`§72`.
- `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md` — auditoria
  completa do React atual (componentes compartilhados, telas admin,
  telas públicas/portal) contra o Manual + plano em 6 sprints por risco
  crescente. Achado estrutural mais relevante para SPECs futuras: o
  `PortalShell` reaproveita o shell administrativo e não tem bottom-nav
  mobile-first, apesar de o Manual exigir isso para o Portal da
  Influenciadora — pendência a resolver antes de qualquer polimento fino
  de tela do portal.

**Nenhum componente React foi alterado.** Responsável pediu
explicitamente para aguardar aprovação do plano completo antes de
iniciar qualquer sprint de implementação, e que a execução futura também
use paralelização máxima (tokens, componentes base, admin, portal, QA)
sob um único integrador — registrado no próprio plano.

**Estado ao final — `[x]` concluído e commitado:**

- [x] Manual de Design DODÔ v1.0 (HTML + PDF) aprovado pelo responsável
- [x] 3 gerações anteriores arquivadas em `docs/design/archive/`, git
      history preservado
- [x] `ADR-019` formalizada e commitada
- [x] `docs/design/DESIGN_SYSTEM.md` e `docs/handoff/README.md`
      apontando para o Manual
- [x] Auditoria completa do React (3 frentes) + plano de implementação
      em `docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md`
- [x] Commit único `d08e8fd`, confirmado sem nenhuma alteração funcional
      de `frontend/`/`backend/`/`docs/_workspace/`/`mcp/` misturada
- [ ] Aprovação do plano de implementação pelo responsável — pendente
- [ ] Sprints de implementação — não iniciados, aguardando aprovação
- [ ] Push para `origin` — não feito (pendência geral de todos os
      commits locais, não específica desta frente)

**Próxima missão real desta frente:** responsável revisa
`docs/design/PLANO_IMPLEMENTACAO_DESIGN_SYSTEM.md` por completo; após
aprovação, iniciar Sprint 1 (tipografia — risco mínimo, maior alcance).
