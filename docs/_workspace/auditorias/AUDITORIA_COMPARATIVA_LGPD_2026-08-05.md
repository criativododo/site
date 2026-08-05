# Auditoria Comparativa LGPD — Portal Criativo DODÔ

**Sessão:** S12 · Trilha 6
**Data:** 2026-08-05
**Natureza:** Exclusivamente investigativa. Nenhum código, migration, API, frontend, backend ou teste foi alterado nesta sessão. Nenhum commit foi realizado.

---

## 1. Riscos Críticos

Nenhum risco de **exposição imediata de PII a terceiros não autorizados** foi identificado. A disciplina de "PII nunca em log" (placeholders) está implementada e testada no motor de documentos (`documentos.auditLogPII.ts`), e o isolamento por Parceira é resolvido inteiramente pelo backend a partir da sessão (`bloquearParceiraIdDeCliente`, `parceiraDaSessao`), nunca por parâmetro de cliente.

Ainda assim, dois achados desta auditoria têm severidade de compliance suficiente para merecer destaque antes do resumo executivo, por representarem **política formalmente "Aceita" (ADR-010) e não cumprida pelo código em produção**, não apenas um item de backlog:

1. **Trilha de auditoria não persistente nem imutável em toda a aplicação.** `middleware/auditoria.ts` e `documentos.auditLogPII.ts` são arrays em memória, perdidos a cada restart do processo e tecnicamente mutáveis em runtime — o oposto do que ADR-010 ponto 4 exige ("Logs de auditoria não podem ser alterados pela aplicação"). Isso já havia sido registrado em `AUDITORIA_AUTENTICACAO_2026-08-03.md` (linhas 148, 191) para o módulo de autenticação; esta auditoria confirma que a lacuna é sistêmica, não local.
2. **Eventos de autenticação (login OIDC, callback, falhas) não passam pelo middleware de auditoria.** `src/app.ts:38-39` monta `/auth` com `authRoutes` diretamente (sem `registrarAuditoria`), enquanto a auditoria só é aplicada dentro de `/api` (`api.routes.ts:28`). Ou seja, o evento de acesso mais sensível do sistema — quem entrou, quando, de onde — não gera nenhum registro de auditoria, nem mesmo o placeholder em memória. Confirma que o achado da auditoria de autenticação de 2026-08-03 segue aberto nesta data.

Nenhum dos dois riscos envolve vazamento de dado pessoal já ocorrido; ambos são lacunas de **rastreabilidade**, não de **confidencialidade**. Classificados formalmente na Seção 6.

---

## 2. Resumo executivo

O Portal possui uma política de LGPD formal e bem escrita (ADR-010, 9 pontos, aceita em 2026-07-26) e uma implementação inicial genuína dos direitos do titular mais visíveis — exportação de dados e fila de solicitação/decisão de exclusão, ambas expostas em `/perfil` e `/admin` e cobertas por testes automatizados. A minimização de dados por papel (RBAC) também está corretamente refletida no código: a Marca nunca recebe campos financeiros, fiscais ou de contato da Parceira, nem no dashboard nem nos tipos expostos pela API.

Por outro lado, a auditoria (pilar central de qualquer política de LGPD, ponto 4 do próprio ADR-010) é, na prática, um **placeholder documentado como tal no próprio código-fonte** — não persistente, não imutável, e sequer conectada às rotas de autenticação. Os direitos de anonimização e o processo de expurgo são apenas administrativos (mudança de status com fundamento jurídico registrado); nenhuma anonimização ou eliminação física de dado é executada pelo sistema. Não existe consentimento explícito versionado em lugar nenhum do código, apesar de ser requisito central de dois documentos normativos (`REGRAS DE NEGÓCIO...LGPD.md` §5 e `PORTAL_BRIEFING.md` §6.2, este último classificando "consentimento LGPD no cadastro público" como **MUST não implementado**).

Em síntese: os mecanismos **reativos** (a Parceira pede, o Administrador decide) existem e funcionam; os mecanismos **estruturais** (auditoria confiável, consentimento capturado na origem, retenção automatizada, anonimização real) ainda não foram construídos. Avaliação final na Seção 10.

---

## 3. Inventário

### 3.1 Backend — `portal-backend/src/modules/lgpd/`

| Item | Arquivo | Finalidade |
|---|---|---|
| Rotas self-service | `lgpd.routes.ts:10-20` | `GET /portal/lgpd/exportar`, `POST /portal/lgpd/exclusao` — sob `requireAuth, requireContaAtiva, registrarAuditoria` (`api.routes.ts:28`) + `bloquearParceiraIdDeCliente` (`api.routes.ts:78`) |
| Rotas administrativas | `lgpd.routes.ts:24-53` | `GET /admin/lgpd/exclusao/pendentes`, `PATCH /admin/lgpd/exclusao/:id/decidir` — protegidas por `requireAdmin` |
| Exportação (acesso/portabilidade) | `exportacao.service.ts` | Agrega perfil (com PIX/endereço), entregas e obrigações financeiras num JSON estruturado; testado em `exportacao.service.test.ts` |
| Solicitação/decisão de exclusão | `exclusao.service.ts`, `exclusao.repository.ts`, `exclusao.types.ts` | `solicitarExclusao` cria registro `PENDENTE`; `decidirExclusao` grava `fundamentoJuridico`, `responsavelAnalise`, decisão; **nunca executa expurgo físico** (comentário explícito em `exclusao.service.ts:28-32`) |
| Persistência de solicitações | `migrations/0001_init.sql:87-94` | Tabela `solicitacoes_exclusao` (Postgres) — única tabela de LGPD encontrada no schema |
| Trilha de auditoria HTTP | `middleware/auditoria.ts:19-33` | Array em memória `trilha: RegistroAuditoria[]`; grava usuário, data/hora, IP, operação (método+rota), recurso — nunca o valor do dado. Comentário no próprio código classifica como *placeholder* |
| Audit log de PII (documentos) | `modules/documentos/documentos.auditLogPII.ts:22-40` | Whitelist de PII (`parceira.cnpj`, `parceira.pix`, `parceira.endereco`) + `AuditLogPIIEmMemoria`; integrado ao renderizador de placeholders (`documentos.renderizadorAuditado.ts`), fail-closed se o log falhar |
| Montagem de rotas | `api.routes.ts:78-80` | `apiRoutes.use("/portal/lgpd", bloquearParceiraIdDeCliente, lgpdRoutes)`; `apiRoutes.use("/admin/lgpd", lgpdAdminRoutes)` |
| Auditoria não cobre `/auth` | `app.ts:38-39` | `/auth` monta `authRoutes` sem `registrarAuditoria`; só `/api` recebe o middleware de auditoria |

Não existe: serviço/tabela de consentimento, mecanismo de anonimização real, job de retenção/expurgo automatizado, sanitizador central de logs (a disciplina "PII nunca em log" é convencional, por módulo, não um mecanismo técnico único).

### 3.2 Frontend

| Tela/componente | Arquivo | Função |
|---|---|---|
| Exportar/excluir meus dados | `pages/Perfil.tsx`, componente `MeusDadosLgpd` (211-285) | Botões que chamam `GET /api/portal/lgpd/exportar` e `POST /api/portal/lgpd/exclusao` |
| Fila de exclusão (admin) | `pages/Admin.tsx`, componente `FilaDeExclusao` (115-231) | Lista pendências, decide via `PATCH .../decidir`; captura `fundamentoJuridico` via `window.prompt()` — texto livre, sem histórico visível na UI |
| Indicador de pendências | `pages/AdminDashboard.tsx:19,135-138` | Contador `lgpd.solicitacoesExclusaoPendentes`; **excluído deliberadamente** da view de `ADMINISTRADOR_MARCA` (`dashboard.types.ts:60-61,82`) |
| Página pública de privacidade | `pages/Privacidade.tsx` | Estática, descreve os mecanismos já implementados; linkada no rodapé de `Login.tsx` e `Cadastro.tsx` |
| Cadastro (onboarding) | `pages/Cadastro.tsx` | Formulário completo de PII (nome, CNPJ, PIX, CEP, endereço) — **sem checkbox de consentimento/aceite de termos**; único elemento de privacidade é o link estático para `/privacidade` |
| Sessão/autenticação | `lib/session.tsx`, `lib/api.ts` | OAuth Google via cookie httpOnly; `parceiraId` nunca é parâmetro de cliente (comentário explícito em `api.ts` citando ADR-010/`PORTAL_ARQUITETURA.md` §7) |

`.ai/` (raiz do repo) confirmado vazio/stub por declaração do próprio `.ai/README.md` — não é fonte de verdade e não foi usado nesta auditoria.

### 3.3 Documentos normativos consultados

| Documento | Caminho | Papel nesta auditoria |
|---|---|---|
| Matriz de Dados (LGPD) | `criativododo-interno/DOC SPRINT #2/#2 MATRIZ DE DADOS (LGPD).md` | Fonte 1 — inventário funcional de dados, fluxo, retenção |
| ADR-010 | `knowledge/ARCHITECTURAL_DECISIONS.md:302-366` | Fonte 2 — política arquitetural soberana, 9 pontos |
| REGRAS DE NEGÓCIO...LGPD.md §5 | `criativododo-interno/DOC SPRINT #2/#2 REGRAS DE NEGÓCIO, SPECs, ADRs e DOCUMENTAÇÃO FUTURA.md` | Fonte 3 — diretrizes funcionais de consentimento/retenção/transparência |
| Mapa de Permissões (RBAC) §5/§8 | `criativododo-interno/DOC SPRINT #2/#2 MAPA DE PERMISSÕES(RBAC).md` | Apoio — relação RBAC↔LGPD |
| PORTAL_BRIEFING.md | `docs/business/PORTAL_BRIEFING.md` | Apoio — status de pendências (Q-09), riscos, backlog MUST não implementado |
| PRD | `knowledge/Produto/PRD.md` | Apoio — nota histórica de lacuna de LGPD (linha 373), anterior ao ADR-010 |
| CONTRATO_SOBERANO.md | `knowledge/Historico/CONTRATO_SOBERANO.md` | Apoio — declara `PIX`/`CNPJ`/`Endereco` como PII, regra "nunca em log" |
| PROJECT_SOURCE_OF_TRUTH.md | `knowledge/PROJECT_SOURCE_OF_TRUTH.md` | Apoio — roteador de hierarquia documental |
| Auditoria anterior | `docs/_workspace/auditorias/AUDITORIA_AUTENTICACAO_2026-08-03.md` | Referenciada, não repetida — gap de auditoria não persistente já registrado |

---

## 4. Matriz comparativa

### 4.1 Política (ADR-010) cruzada com Matriz de Dados e REGRAS DE NEGÓCIO §5

| # | Requisito (ADR-010) | Documentação de apoio | Implementação | Evidência | Status |
|---|---|---|---|---|---|
| 1 | Bases legais válidas para tratamento de PII | Matriz de Dados §1; REGRAS DE NEGÓCIO §5 | Nenhuma verificação técnica de base legal por operação; tratamento ocorre porque o dado é necessário à operação, sem registro explícito de qual base se aplica | Nenhum código encontrado que module isso | 🟡 Parcial (correto por design implícito, não verificável/auditável) |
| 2 | Classificação de dados em 3 níveis (Público/Operacional/Financeiro) | Matriz de Dados §2 (coluna "Categoria") | Refletida informalmente no RBAC (campos financeiros nunca expostos à Marca) mas **não existe enum/flag de classificação no modelo de dados** | `dashboard.types.ts:60-61,82` (exclusão de campo `financeiro`); ausência de campo `classificacao` em `perfis_parceira` (`migrations/0001_init.sql:80-85`) | 🟡 Parcial |
| 3 | Menor privilégio / isolamento por Parceira | Mapa de Permissões §4-5 | Implementado: `parceiraDaSessao`, `bloquearParceiraIdDeCliente`; Marca nunca recebe PII de contato/financeiro | `api.routes.ts:78`; `lib/api.ts` (comentário ADR-010) | 🟢 Implementado |
| 4 | Auditoria: usuário, data, IP, operação, recurso; **imutável** | REGRAS DE NEGÓCIO §5 ("Todas as alterações relevantes deverão ser auditáveis"); Mapa de Permissões §1 ("Imutabilidade de Auditoria") | Existe, mas em memória, mutável, não persistente; não cobre `/auth` | `middleware/auditoria.ts:19-33`; `app.ts:38-39`; já registrado em `AUDITORIA_AUTENTICACAO_2026-08-03.md:148` | 🔴 Não implementado (requisito central não atendido) |
| 5 | Direitos do titular: acesso, correção, atualização, portabilidade, anonimização, eliminação | Matriz de Dados §5; REGRAS DE NEGÓCIO §5 | Acesso/portabilidade: implementado (`exportacao.service.ts`). Correção/atualização: implementado via edição de perfil (`Perfil.tsx`). Anonimização/eliminação: **apenas administrativo**, sem execução técnica real | `exportacao.service.ts`; `exclusao.service.ts:28-32` | 🟡 Parcial |
| 6 | Retenção por categoria (Ativa/Inativa/Financeiro/Operacional) | Matriz de Dados §5; REGRAS DE NEGÓCIO §5 | Política documental apenas; nenhum job, flag de expiração ou rotina de expurgo automatizado encontrado no código | Nenhuma evidência de código | 🔴 Não implementado |
| 7 | Processo de expurgo com registro (pedido, responsável, fundamento jurídico, decisão, data) | Matriz de Dados §5; REGRAS DE NEGÓCIO §5 | Implementado o registro do processo; **não implementado o expurgo/anonimização em si** | `exclusao.service.ts:34-55`; `migrations/0001_init.sql:87-94` | 🟡 Parcial |
| 8 | Backups não usados como ambiente operacional; reaplicação de exclusões após restore | — | Nenhuma evidência de política ou mecanismo técnico de backup encontrada no repositório | Nenhuma evidência de código | 🔴 Não implementado / não verificável nesta auditoria |
| 9 | Privacy by Design: checklist obrigatório para todo novo módulo | REGRAS DE NEGÓCIO §5 ("privacy by design") | Não existe checklist formal nem gate de aprovação documentado como processo repetível; aplicado de fato em alguns módulos (ex.: `documentos.auditLogPII.ts`) mas não como processo institucionalizado | `documentos.renderizadorAuditado.ts` (aplicação pontual) | 🟡 Parcial |

### 4.2 Inventário de dados (Matriz de Dados §2) vs. schema/código atual

| Dado | Categoria (Matriz) | Obrigatório (Matriz) | Implementado no schema/código? | Evidência |
|---|---|---|---|---|
| Nome | Pessoal | Sim | Sim | `perfis_parceira` / `parceiras` |
| E-mail | Contato | Sim | Sim | `perfis_parceira.email` |
| Telefone | Contato | Sim | Sim (via cadastro/comunicação) | `Cadastro.tsx` |
| Endereço | Pessoal | Sim | Sim | `perfis_parceira.endereco` (jsonb) |
| Instagram | Rede Social | Sim | Sim | `Cadastro.tsx` |
| **CPF** | Fiscal/Financeiro | **Sim** | **Não** — nenhuma ocorrência de `cpf` em `portal-backend/src` nem `portal-frontend/src` | grep confirmatório: 0 ocorrências em ambos os pacotes |
| CNPJ | Fiscal/Financeiro | Condicional | Sim | `parceiras.cnpj` |
| PIX/Conta | Financeiro | Sim | Sim | `perfis_parceira.pix` |
| Cupom | Operacional | Sim | Fora do escopo desta auditoria (módulo de Campanha) | — |
| Material | Operacional | Sim | Fora do escopo (módulo de Entregas) | — |
| Nota Fiscal | Fiscal/Financeiro | Sim | Fora do escopo (módulo Financeiro) | — |
| Comprovante | Financeiro | Sim | Fora do escopo (módulo Financeiro) | — |
| Código de Rastreio | Logístico | Sim | Fora do escopo (módulo Logística) | — |

A divergência do CPF está detalhada como conflito normativo na Seção 8 (não é decidida aqui).

### 4.3 RBAC × LGPD (Mapa de Permissões §8) vs. implementação

| Requisito RBAC/LGPD | Implementação | Evidência | Status |
|---|---|---|---|
| Minimização — Marca não acessa PII sensível | Implementado | `dashboard.types.ts:60-61,82` | 🟢 Implementado |
| "Apenas Administrador DODÔ visualiza histórico de consentimentos e logs de auditoria" | Não há histórico de consentimentos (não existe); logs de auditoria existem mas **não há nenhuma tela administrativa para consultá-los** | Nenhuma rota/tela de leitura da `trilha` ou de `AuditLogPIIEmMemoria` encontrada no frontend | 🔴 Não implementado |
| "Influenciadora consente com Termos de Uso de forma isolada e específica" | Não implementado — sem checkbox no cadastro | `Cadastro.tsx` (ausência confirmada por busca de `checkbox`/`aceito`/`concordo`/`termos`) | 🔴 Não implementado |

---

## 5. Auditoria temática

### Consentimento
Não existe mecanismo de consentimento no sistema: nenhuma tabela, serviço ou tela captura aceite explícito, versão de documento, IP, data/hora ou histórico de revogação. `PORTAL_BRIEFING.md:179` já classifica "consentimento LGPD no cadastro público" como **MUST não implementado** (backlog V2.6) — este achado é consistente com o código, não uma surpresa não documentada. `REGRAS DE NEGÓCIO...LGPD.md §5` exige "caixas de aceite independentes" (ex.: Termos de Uso separado de autorização de tratamento de dados) e proíbe sobrescrever consentimentos — nenhum dos dois existe hoje.

### Direitos do titular
Acesso e portabilidade: implementados e funcionais (`exportacao.service.ts`). Correção/atualização: implementados via telas de perfil existentes. Exclusão: processo de solicitação/decisão implementado, mas sem execução técnica de eliminação. Anonimização: citada em três documentos normativos como resultado esperado da exclusão, mas **nenhuma função de anonimização existe no código** — `exclusao.service.ts` apenas muda `status` para `APROVADA`/`NEGADA`. Oposição e limitação do tratamento: não há mecanismo dedicado; na prática, a única forma de "limitar" é a inativação de conta (`STATUS OFF`), que bloqueia novas campanhas mas não altera o tratamento de dados já existente.

### Retenção
Política documentada em três fontes (ADR-010 ponto 6, Matriz de Dados §5, REGRAS DE NEGÓCIO §5) de forma consistente entre si (retenção por categoria, eliminação/anonimização ao fim da finalidade). **Nenhuma automação existe** — não há job, cron, flag de expiração ou rotina de expurgo. A retenção hoje é, na prática, indefinida: dados permanecem armazenados sem prazo técnico até uma ação manual de exclusão.

### Auditoria
O ponto mais frágil desta auditoria. Dois mecanismos distintos (`middleware/auditoria.ts`, `documentos.auditLogPII.ts`), ambos em memória, ambos sem tabela dedicada nas migrations, ambos sem UI de consulta. A trilha HTTP não cobre `/auth`. Não há garantia técnica de imutabilidade — é um array JavaScript comum, alterável por qualquer código com acesso ao módulo. Este achado já havia sido levantado para o módulo de autenticação em 2026-08-03; esta auditoria confirma que o problema é estrutural, presente em todos os módulos que geram trilha.

### Exportação
Cobertura: perfil, entregas e obrigações financeiras da própria Parceira — alinhado ao escopo de dados que a Matriz de Dados associa à entidade Parceira. Formato: JSON estruturado, sem schema versionado nem assinatura/checksum de integridade. Não cobre dados de comunicação (histórico de mensagens) nem trilha de auditoria da própria conta — a Matriz de Dados §5 promete "transparência: visualização clara dos dados armazenados e quem acessou (Auditoria)", mas a exportação atual não inclui o "quem acessou".

### Exclusão
Lógica: implementada (mudança de status, preservação de histórico — coerente com "Imutabilidade" do Mapa de Permissões §1 e com REGRAS DE NEGÓCIO §2 "a inativação nunca resulta em exclusão física"). Física: não implementada — nem exclusão real, nem anonimização real. Reversibilidade: como nada é fisicamente alterado, o processo é 100% reversível hoje (o que é seguro do ponto de vista de erro operacional, mas significa que uma exclusão "aprovada" não produz o efeito jurídico que o titular esperaria).

### Google Drive (avaliação conceitual, sem implementação)
`ADR-017` (citado em `REGRAS DE NEGÓCIO...LGPD.md §4`) já registra uma tensão arquitetural ativa e não resolvida entre o escopo `drive.file` (mais restritivo) e a necessidade de acessar pastas organizacionais pré-existentes. Do ponto de vista de LGPD, migrar o armazenamento de materiais/documentos para Google Drive organizacional criaria responsabilidades novas que a política atual (ADR-010) não cobre explicitamente:
- **Novo operador de dados terceirizado**: Google passa a ser suboperador de qualquer PII que trafegue por pastas do Drive (ex.: comprovantes, notas fiscais com CPF/CNPJ), exigindo base legal e cláusulas contratuais de transferência já mapeadas para o provedor atual, mas não necessariamente para essa nova superfície.
- **Auditoria de acesso fora do Portal**: se pastas organizacionais pré-existentes forem usadas (ao invés de `drive.file`), outros usuários da organização Google podem ter acesso a arquivos fora da trilha de auditoria do Portal — quebrando o ponto 4 do ADR-010 ("toda operação crítica gera trilha de auditoria") para esse canal.
- **Retenção e expurgo descentralizados**: exclusão/anonimização de um documento no Portal não implica automaticamente exclusão no Drive, a menos que o expurgo seja modelado como uma operação dupla (Portal + Drive).
- **Classificação de dados por pasta**: a classificação em 3 níveis (ADR-010 ponto 2) precisaria ser replicada na estrutura de permissões do Drive, o que não é trivial se pastas organizacionais pré-existentes forem reaproveitadas.

Nenhuma decisão é tomada aqui — apenas registrado que a resolução do ADR-017 deveria incluir explicitamente uma revisão de LGPD, como o próprio `REGRAS DE NEGÓCIO...LGPD.md §7` já prevê ("Revisão Arquitetural Pós-LGPD").

---

## 6. Gaps encontrados (ordenados por criticidade)

| # | Gap | Criticidade | Justificativa |
|---|---|---|---|
| 1 | Trilha de auditoria não persistente/imutável, em toda a aplicação, incluindo ausência total em `/auth` | 🔴 Crítico | Contradiz diretamente um requisito de uma ADR com **Status: Aceito**, não um item de backlog; o próprio código se autodocumenta como placeholder; risco de compliance já declarado publicamente pelo ADR e não resolvido; achado repetido de auditoria anterior (2026-08-03), ainda aberto |
| 2 | Ausência de mecanismo de anonimização/eliminação física real | 🔴 Crítico | O processo de exclusão aprova pedidos mas não produz efeito técnico — o titular recebe confirmação de uma ação que o sistema não executa; viola diretamente ADR-010 ponto 7 e o art. 16 da LGPD referenciado nos três documentos normativos |
| 3 | Sem consentimento explícito/versionado, incluindo ausência de checkbox no cadastro | 🟠 Alto | Requisito central de `REGRAS DE NEGÓCIO...LGPD.md §5`; já classificado como MUST não implementado em `PORTAL_BRIEFING.md §6.2` — gap conhecido e rastreado, por isso não "Crítico" (não é uma surpresa), mas ainda de alta severidade por afetar a base legal de todo o tratamento de dados feito a partir do cadastro |
| 4 | Sem retenção/expurgo automatizado por categoria | 🟠 Alto | ADR-010 ponto 6 e Matriz de Dados §5 definem a política; sem automação, a retenção depende inteiramente de ação manual, o que não escala e não é auditável |
| 5 | RBAC promete visibilidade de auditoria/consentimento ao Administrador DODÔ que não existe na UI | 🟡 Médio | Mapa de Permissões §4/§8 declara a permissão; não há tela correspondente — mesmo que a auditoria fosse persistente, hoje não haveria como consultá-la |
| 6 | Captura de `fundamentoJuridico` via `window.prompt()` no fluxo de decisão de exclusão | 🟡 Médio | Texto livre, sem validação, sem histórico de decisões visível — frágil para fins de auditoria formal de um processo que a própria ADR-010 exige registrar com rigor |
| 7 | Ausência de sanitizador central de logs (disciplina "PII nunca em log" é convencional, por módulo) | 🟡 Médio | Depende de disciplina de código em cada novo módulo, não de um mecanismo técnico único testado globalmente; ponto único de falha futuro |
| 8 | Backups sem tratamento técnico documentado (ADR-010 ponto 8) | 🟢 Baixo | Sem evidência de política ou mecanismo; risco baixo no estágio atual (poucos dados, MVP), mas deve ser resolvido antes de escala de produção |
| 9 | Exportação de dados não inclui trilha de auditoria da própria conta ("quem acessou") | 🟢 Baixo | Matriz de Dados §5 promete essa transparência; ausência é consequência direta do Gap 1 (não há o que exportar enquanto a auditoria não for persistente) |

---

## 7. Riscos

**Técnicos**
- Trilha de auditoria em memória é perdida a cada deploy/restart — qualquer investigação retroativa de incidente é impossível para o período anterior ao último restart.
- Ausência de sanitizador central de logs cria risco de regressão silenciosa: um novo módulo pode logar PII sem que nenhum teste automatizado capture isso, pois a proteção atual é por convenção de comentário, não por gate técnico.

**Operacionais**
- `window.prompt()` para fundamento jurídico não deixa rastro estruturado nem pesquisável; em caso de fiscalização, reconstituir o histórico de decisões de exclusão dependeria de memória humana ou de logs de servidor não desenhados para esse fim.
- Processo de exclusão "aprovado" sem efeito técnico pode gerar expectativa incorreta no titular (a Parceira recebe confirmação de algo que não ocorre de fato no dado).

**Conformidade**
- Ausência de consentimento versionado compromete a base legal declarada para qualquer tratamento que dependa de consentimento (mesmo que a maioria das bases do MVP seja execução de contrato, conforme ADR-010 ponto 1).
- Divergência entre uma ADR com status "Aceito" e o código em produção (Gaps 1 e 2) é o tipo de achado que, em uma auditoria externa, tende a pesar mais do que uma lacuna simplesmente não documentada — porque demonstra que a política existe mas não foi verificada contra a implementação até esta sessão.

---

## 8. Conflitos normativos

Nenhuma decisão foi tomada sobre os itens abaixo — apenas registrados, conforme instrução da sessão.

### CONFLITO NORMATIVO 1 — CPF: dado tratado vs. dado não implementado
- **Documentos envolvidos:** `#2 MATRIZ DE DADOS (LGPD).md` §2 (lista CPF como categoria "Fiscal/Financeiro", Obrigatório = "Sim", já mapeado como dado tratado pelo Portal) vs. `docs/business/PORTAL_BRIEFING.md:178` (lista "suporte a CPF" como MUST **explicitamente não implementado**, backlog V2.6).
- **Impacto:** a Matriz de Dados descreve o CPF como se já fosse coletado e protegido pelo sistema atual; na prática, nenhuma ocorrência de `cpf` existe em `portal-backend/src` nem `portal-frontend/src` (confirmado por busca direta). Um leitor que use apenas a Matriz de Dados como referência de conformidade concluiria, incorretamente, que o CPF já está sob a governança de dados descrita no documento.
- **Fica para sessão futura:** decidir se a Matriz de Dados deve ser lida como "modelo-alvo" (o que o Portal deve tratar quando o backlog for implementado) ou se deveria distinguir explicitamente dados já implementados de dados planejados.

### CONFLITO NORMATIVO 2 — Persistência: "em memória" (documento de produto) vs. Postgres (implementação real)
- **Documentos envolvidos:** `#2 REGRAS DE NEGÓCIO, SPECs, ADRs...md §4` ("Persistência: Atualmente, o sistema opera em memória... exige a transição para PostgreSQL") vs. implementação encontrada (`portal-backend/migrations/0001_init.sql`, uso de `pg`/node-postgres, `ExclusaoRepositorioPostgres`).
- **Impacto:** o documento de produto está desatualizado em relação ao estado real de persistência de domínio (que já é Postgres para várias entidades, incluindo `solicitacoes_exclusao`). Isso não afeta diretamente a conformidade de LGPD, mas é relevante porque o mesmo documento é citado como fonte de apoio para as diretrizes de LGPD (§5) — um leitor pode subestimar o quanto já foi implementado, ou superestimar a persistência da trilha de auditoria (que, ao contrário do restante do domínio, **de fato ainda está em memória** — ver Gap 1).
- **Fica para sessão futura:** atualizar o documento de produto para refletir que a persistência de domínio já migrou para Postgres, mas a auditoria especificamente não.

### CONFLITO NORMATIVO 3 — Caracterização de "ADR-010" divergente entre repositórios
- **Documentos envolvidos:** `#2 REGRAS DE NEGÓCIO...md §4` descreve "ADR-010 (AuditLog PII)" como uma decisão estreita, restrita a "dados sensíveis nunca devem ser registrados em logs de auditoria, usar placeholders" — vs. `knowledge/ARCHITECTURAL_DECISIONS.md:302-366`, onde ADR-010 é a política LGPD completa de 9 pontos (bases legais, classificação, menor privilégio, auditoria, direitos do titular, retenção, expurgo, backups, privacy by design).
- **Impacto:** o mesmo identificador ("ADR-010") é usado com escopos diferentes em dois repositórios/documentos. Não há evidência de que sejam decisões conflitantes em conteúdo — a descrição do DOC SPRINT #2 parece ser um resumo parcial, não uma decisão distinta — mas a numeração idêntica para escopos diferentes é uma fonte de confusão documental que pode levar a citações incorretas em trabalhos futuros.
- **Fica para sessão futura:** confirmar se o "ADR-010 (AuditLog PII)" do DOC SPRINT #2 é apenas um resumo do ADR-010 real ou uma decisão histórica anterior e distinta que foi posteriormente absorvida/expandida.

---

## 9. Recomendações

**Curto prazo** (não implementar nesta sessão; ação recomendada para decisão do responsável do projeto)
- Abrir ADR de estratégia de auditoria persistente e imutável (já recomendado em `AUDITORIA_AUTENTICACAO_2026-08-03.md`, item 7) — cobrindo tanto `middleware/auditoria.ts` quanto `documentos.auditLogPII.ts`, e estendendo cobertura para `/auth`.
- Decidir se o processo de captura de `fundamentoJuridico` deve migrar de `window.prompt()` para um campo estruturado com histórico visível na UI administrativa.
- Resolver o Conflito Normativo 1 (CPF): decidir se a Matriz de Dados deve sinalizar explicitamente campos ainda não implementados.

**Médio prazo**
- Especificar e implementar consentimento explícito versionado no cadastro (`Cadastro.tsx`), incluindo caixas de aceite independentes conforme `REGRAS DE NEGÓCIO...LGPD.md §5`.
- Especificar o mecanismo real de anonimização/eliminação física para exclusões aprovadas (hoje só muda status).
- Especificar retenção automatizada por categoria (ADR-010 ponto 6).
- Construir a tela administrativa de consulta/exportação da trilha de auditoria e do histórico de consentimentos, prevista pelo Mapa de Permissões §8 mas inexistente hoje — corresponde ao "Módulo Administrativo de LGPD" já listado como funcionalidade futura em `REGRAS DE NEGÓCIO...LGPD.md §7`.

**Longo prazo**
- Avaliar um sanitizador central de logs/requests, substituindo a disciplina por convenção atual por um gate técnico testado.
- Incluir revisão de LGPD explícita na resolução do ADR-017 (Google Drive), cobrindo suboperador, auditoria de acesso fora do Portal, e expurgo dual (Portal + Drive).
- Definir e documentar política técnica de backups (ADR-010 ponto 8), incluindo reaplicação de exclusões após restore.

---

## 10. Avaliação final

**PARCIALMENTE.**

A implementação atual atende ao estágio de produto do Portal (MVP em consolidação) nos direitos do titular mais visíveis e mais cobrados pelo dia a dia operacional — exportação e solicitação de exclusão funcionam, são testadas e estão corretamente restritas por sessão/RBAC. A minimização de dados por papel também está bem implementada e é consistente entre backend e frontend.

No entanto, a política formal (ADR-010, "Aceito") declara nove compromissos, e pelo menos três deles — auditoria imutável (ponto 4), retenção automatizada (ponto 6) e execução real de expurgo/anonimização (ponto 7, parcialmente) — não são cumpridos pelo código hoje, sendo o primeiro o mais grave por já ter sido formalmente aceito como resolvido e por já ter sido sinalizado em auditoria anterior sem correção subsequente. Consentimento explícito, exigido por dois documentos normativos independentes, simplesmente não existe no sistema, embora esse gap específico já esteja rastreado como backlog conhecido (não é uma descoberta desta auditoria).

Não há risco de exposição imediata de PII a terceiros não autorizados — por isso a avaliação não é "NÃO". Mas a lacuna estrutural de auditoria confiável significa que, se um incidente de proteção de dados ocorresse hoje, o Portal não teria como reconstituir com confiança quem acessou o quê e quando — o que é suficiente para impedir uma avaliação "SIM" sem qualificação.

---

## Handoff desta sessão

- Plano Mestre (`criativododo-interno/PLANO_MESTRE_IMPLEMENTACAO_PORTAL_DODO.md`): marcar S12 · Trilha 6 como concluída.
- Memória de projeto: registrar avaliação final (PARCIALMENTE), os três conflitos normativos, e os dois riscos críticos de rastreabilidade (não de confidencialidade) para continuidade em sessões futuras.
- **Nota operacional:** o `/inicio` desta sessão não foi executado corretamente — o objetivo foi entregue como texto colado, não como invocação real do comando (`session-memory.mjs inicio` nunca rodou), então a sessão nunca foi registrada no session-memory. Por consequência, o `/fim` não conseguiu localizar a sessão (`ERRO: Sessão não encontrada`) e o journal estruturado do session-memory **não foi gerado** para a S12. Por decisão explícita do responsável do projeto, esta sessão é considerada oficialmente encerrada com base nestes três artefatos (relatório, atualização do Plano Mestre, memória de projeto), sem recriar a sessão nem editar manualmente a infraestrutura de memória. A correção dos comandos `/inicio`/`/fim` fica para uma sessão futura dedicada.
