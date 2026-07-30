# Handoff — OAuth Google Drive (Fase 4) e conflito de ADR-017

> Handoff oficial desta sessão. Objetivo: permitir que qualquer outro agente continue
> exatamente do ponto atual sem reler o histórico da conversa.

## 1. Objetivo da sessão

- **Missão inicial:** uma tarefa externa (prompt em markdown, não o responsável do projeto
  diretamente) pediu para "concluir integralmente o provisionamento OAuth do Portal DODÔ" do
  Google Drive, alegando que já existia um fluxo OAuth de Drive funcionando em produção com
  erro `403 access_denied`.
- **Missão em curso (ainda não entregue):** o responsável do projeto pediu, depois, uma
  auditoria completa do banco de dados e do domínio do Portal para projetar toda a
  integração de Storage (Google Drive) nas próximas fases, com entrega de um documento
  técnico de plano de integração — **sem alterar nenhum arquivo do projeto**.
- **Hipóteses investigadas:**
  1. A tarefa externa presumia que já existia código de OAuth de Drive em produção. Investigada
     e **refutada** — não existia nenhum código, só variáveis soltas em `.env`.
  2. A tarefa externa presumia que "só existe um OAuth Client válido" e que qualquer outro é
     suspeito. Investigada e **refutada** — existem dois clients legítimos, para propósitos
     diferentes (login vs. Drive).
  3. Hipótese de que o `refresh_token` já salvo em `.env` seria inválido (por causa do
     `403 access_denied` relatado). Investigada e **refutada** — o token é válido e funciona.
  4. Hipótese (descoberta nesta etapa, não testada até o fim) de que o escopo `drive.file`
     adotado no ADR-017 desta sessão conflita com uma decisão arquitetural anterior já citada
     em documentos oficiais do Portal. **Confirmada — ver Seção 2 e Seção 8.** Este é o
     achado mais importante do handoff.

## 2. Diagnóstico

### O que estava incorreto (tarefa externa)

A tarefa externa pedia para "auditar e corrigir" um fluxo OAuth de Drive supostamente já em
produção. Não havia nenhum fluxo: nenhuma rota, service, middleware ou helper de Drive
existia em `portal-backend`. As únicas evidências eram três variáveis soltas em
`portal-backend/.env` (`GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET`/`_REFRESH_TOKEN`), sem
nenhum código que as lesse. O `403 access_denied` relatado não podia ter vindo de um fluxo
da aplicação — só pode ter ocorrido durante a obtenção manual, fora do código, do
`refresh_token` que já estava salvo.

A tarefa também instruía tratar "qualquer client diferente do citado como suspeito" — isso
teria levado, se seguido ao pé da letra, a substituir o client de login (OIDC, ADR-007) pelo
client do Drive, quebrando o login em produção. Identificado e **não executado**.

### O que foi confirmado

- O `refresh_token` já presente em `portal-backend/.env` é válido e funciona: testado
  ponta a ponta contra a API real do Google Drive (troca por access token, consulta de
  identidade/quota, criação e remoção de uma pasta de teste sob o escopo `drive.file`).
- A conta Google por trás desse token é `elafashionmkt@gmail.com`.
- `typecheck`, `build` e a suíte completa de testes (236 testes) do `portal-backend`
  permanecem verdes após as mudanças desta sessão.

### O que mudou de decisão — achado crítico ainda não resolvido

Nesta sessão foi escrito um **novo ADR-017** em `knowledge/ARCHITECTURAL_DECISIONS.md`
(série de governança deste projeto, 2026-07-30), decidindo escopo **`drive.file`** para o
OAuth do Drive. Uma auditoria posterior (disparada pelo próprio responsável do projeto, para
o documento de plano de integração ainda pendente) encontrou que:

- **Já existe um outro ADR-017**, em `knowledge/Arquitetura/ADR-017-oauth-conta-dedicada-
  google-drive.md` (série "Sistema B"/legado, 2026-07-22, código PHP/Laravel que nunca
  chegou a existir neste repositório). Esse ADR também decide "OAuth de conta dedicada
  Google Drive", mas com escopo **`drive` completo**, não `drive.file`.
- O adendo desse ADR legado (2026-07-22, linhas 181-239) **avaliou e descartou
  explicitamente `drive.file`**, pelo motivo de que esse escopo só concede acesso a arquivos
  **criados pelo próprio app** sob a nova autorização — e já existia, na época, uma estrutura
  de pastas criada manualmente num Shared Drive institucional
  (`ROOT/Materiais/Backup/Temporarios/Contratos/Exportacoes`, mais um arquivo de teste
  `Temporarios/teste-upload.txt`) que teria de ser recriada do zero via API, descartando o
  que já existia.
- **Documentos oficiais do Portal já citam esse ADR-017 legado como a decisão vigente**:
  `PORTAL_ARQUITETURA.md` §6 (linhas 196-211) diz textualmente que "a única integração de
  armazenamento documentada com decisão formal é o Google Drive via OAuth de conta dedicada
  (ADR-017)" e que, se a stack atual usar Drive, deve "reaproveitar o padrão de ADR-017" —
  ou seja, o padrão de escopo `drive` completo, não `drive.file`. `PORTAL_BRIEFING.md`
  (linhas 242 e 351) faz a mesma citação.
- A conta testada nesta sessão (`elafashionmkt@gmail.com`) é plausivelmente a mesma
  organização citada no ADR legado (`elafashionmkt-org`) — ou seja, é possível (não
  confirmado com certeza absoluta) que seja **a mesma conta real do Google Drive**, o que
  significaria que a estrutura de pastas manual mencionada acima ainda existe nessa conta,
  mas ficaria **invisível e inacessível** para qualquer código que use o escopo `drive.file`
  validado nesta sessão.

**Conclusão do diagnóstico:** o ADR-017 escrito nesta sessão pode estar **decidindo algo já
decidido de forma diferente e ainda referenciado como vigente** em documentos oficiais do
Portal. Isso não foi resolvido — ver Seção 8 (bloqueio) e Seção 9 (próximo passo).

## 3. Arquivos alterados

| Arquivo | Motivo | Resumo técnico |
|---|---|---|
| `knowledge/ARCHITECTURAL_DECISIONS.md` | Registrar ADR-017 (novo, série de governança deste projeto) | Decide client OAuth dedicado ao Drive, conta única administrada, escopo `drive.file`, sem biblioteca cliente nova, sem rota/service de Storage. **Ver achado crítico da Seção 2 — pode precisar ser revisto.** |
| `portal-backend/src/config/env.ts` | Ler as credenciais do Drive | Bloco `googleDrive` opcional (não usa `obrigatoria()`) lendo `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET`/`_REFRESH_TOKEN`; não exigido no boot da aplicação. |
| `portal-backend/package.json` | Disponibilizar o script de validação | Novo script `oauth:testar-drive` → `tsx scripts/testarOAuthGoogleDrive.ts`. |
| `portal-backend/.env.example` | Documentar as novas variáveis | Adiciona `GOOGLE_DRIVE_CLIENT_ID`/`_CLIENT_SECRET`/`_REFRESH_TOKEN` vazios, com comentário explicando o propósito e que são opcionais para o boot. |
| `docs/handoff/PROJECT_STATUS.md` | Registrar o estado real | Documenta que a Fase 4 foi iniciada, que o OAuth do Drive foi validado, e que nenhuma rota/service de Storage existe ainda. **Precisará de nova atualização após a resolução do conflito da Seção 2.** |
| `.gitignore` | Não relacionado ao Drive — item avulso desta sessão | Adiciona entrada dedicada para a pasta não rastreada `Design System/`, evitando que `git add -A` a capture no futuro. |

## 4. Arquivos criados

- `portal-backend/src/shared/googleDrive/googleDriveClient.ts` — helper que troca
  `refresh_token` por `access_token` via `fetch` nativo (`grant_type=refresh_token`,
  endpoint `oauth2.googleapis.com/token`), memoizando o token até perto da expiração real.
- `portal-backend/scripts/testarOAuthGoogleDrive.ts` — script de validação manual (não é
  parte do produto): troca o token, consulta `/about` (identidade/quota), cria e remove uma
  pasta de teste sob `drive.file`. Executado com sucesso nesta sessão.
- `docs/handoff/2026-07-30_oauth-drive-fase4-adr017-conflito.md` — este documento.

## 5. Arquivos removidos

Nenhum arquivo foi removido nesta sessão.

## 6. Fluxo OAuth

- **Variáveis de ambiente** (`portal-backend/.env`, não commitado):
  `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET`, `GOOGLE_DRIVE_REFRESH_TOKEN`.
- **Client ID usado (Drive, dedicado):** `352592979978-
  qbqnicdb0ua24dtd4jhb2kpt037btli8.apps.googleusercontent.com` — distinto do client de login
  (OIDC, ADR-007, termina em `...pfcnv8cici9tkdhqflfecnq468quhkhn`).
- **Redirect URI:** **não existe** nenhuma `GOOGLE_DRIVE_REDIRECT_URI` configurada ou usada
  neste repositório. O `refresh_token` já estava presente no `.env` no início desta sessão,
  obtido por algum meio **fora deste código** (mecanismo exato desconhecido para este
  agente — nenhuma evidência no repositório de como foi gerado).
- **Escopo:** único, `https://www.googleapis.com/auth/drive.file` — **ver Seção 2, este é o
  ponto em conflito não resolvido.**
- **Fluxo Authorization Code:** **não implementado nesta sessão.** Não há rota nem lógica
  para gerar URL de consentimento, receber callback, ou trocar `code` por token. O único
  fluxo implementado é a troca `refresh_token` → `access_token` (`grant_type=refresh_token`),
  que não depende de interação do usuário.
- **Refresh Token:** já existente no `.env` antes desta sessão; usado como está; validado
  como funcional.
- **Renovação:** automática, em memória — `googleDriveClient.ts` memoiza o `access_token`
  obtido e só solicita um novo quando falta menos de 60 segundos para expirar (baseado no
  `expires_in` retornado pelo Google).
- **Testes realizados:** `npm run oauth:testar-drive` — troca de token OK; `/about` retornou
  `elafashionmkt@gmail.com`; criação de pasta de teste OK; remoção da pasta de teste OK. Sem
  resíduo deixado na conta.

## 7. Testes executados

| Teste | Resultado |
|---|---|
| `npm run typecheck` (`portal-backend`) | ✅ Passou, sem erros |
| `npm run build` (`portal-backend`) | ✅ Passou |
| `npm test` (`portal-backend`, vitest) | ✅ 236/236 testes, 39 arquivos |
| `npm run oauth:testar-drive` (validação manual contra API real do Google Drive) | ✅ Passou — token, `/about`, criação e remoção de pasta |
| Lint (`portal-backend`) | Não há script de lint dedicado neste projeto (só `typecheck`) — nada rodado nem pendente aqui |
| Hooks de pre-commit (lint+build de `app`, `portal-frontend`; typecheck+build de `portal-backend`) | ✅ Passaram nos dois commits desta sessão |
| Testes manuais de UI/frontend | Não aplicável — nenhuma mudança de frontend nesta sessão |

## 8. Problemas encontrados

- **Bloqueio de arquitetura (o mais importante):** o ADR-017 escrito nesta sessão
  (`drive.file`) conflita com uma decisão já documentada e citada como vigente em
  `PORTAL_ARQUITETURA.md`/`PORTAL_BRIEFING.md` (escopo `drive` completo, ADR-017 legado). Ver
  Seção 2. **Não resolvido.**
- **Limitação:** não existe, neste código, nenhum jeito de obter um **novo** `refresh_token`
  caso o atual seja revogado — a obtenção original foi manual, fora deste repositório, e
  nenhum fluxo de consentimento (Authorization Code) foi construído nesta sessão
  (deliberadamente, para manter o escopo da tarefa mínimo). Se o token expirar/for revogado,
  a regeneração exigirá um procedimento manual fora deste código.
- **Risco herdado (achado da auditoria de domínio, não introduzido nesta sessão):** a coluna
  `entregas.material_enviado` guarda hoje só o nome do arquivo em disco local — nenhuma rota
  de download existe. Qualquer migração futura para Drive precisa decidir como (ou se)
  migrar esse histórico.
- **Risco herdado:** a FK `colaboracao_mensal_id` existe no schema (`entregas`, `briefings`,
  `obrigacoes_financeiras`) mas nenhuma camada de aplicação lê esse valor de volta hoje —
  relevante para qualquer desenho de "pasta por competência" no Drive.
- **Decisão tomada e não revertida:** apesar do conflito da Seção 2, o código e o ADR-017
  desta sessão **permanecem committados** — a auditoria que encontrou o conflito veio depois
  do commit. Nenhum rollback foi feito; a decisão de manter, reverter ou reabrir o escopo é
  do responsável do projeto (ver Seção 9).

## 9. Próximo passo recomendado

1. **Decisão do responsável do projeto sobre o conflito da Seção 2**, antes de qualquer
   outro código de Storage: manter `drive.file` (aceitando que a estrutura de pastas manual
   pré-existente, se ainda existir na conta `elafashionmkt@gmail.com`, fica inacessível a
   esse escopo e precisaria ser recriada via API) **ou** reabrir para o escopo `drive`
   completo, seguindo o padrão do ADR-017 legado (o que exige um novo OAuth Client tipo
   "Desktop app" com redirect loopback — o Device Flow não suporta escopo `drive` completo,
   conforme o próprio adendo do ADR legado — e uma nova obtenção manual de `refresh_token`,
   descartando o testado nesta sessão).
2. **Só depois dessa decisão**, escrever o documento técnico de plano de integração do Drive
   que o responsável do projeto já havia pedido (auditoria de banco/domínio já foi feita por
   um agente em segundo plano nesta sessão — resultado disponível, mas o documento final
   ainda não foi redigido).
3. **Não iniciar** rotas, services, ou provisionamento de pasta por Parceira/competência
   antes dos dois passos acima.

## 10. Commits

Branch: `main`.

- `863c698` — `chore: protege pasta Design System/ de futuros commits` (não relacionado ao
  Drive; item avulso de higiene de repositório desta sessão).
- `2d89cfa` — `feat(portal): OAuth do Google Drive provisionado e validado (ADR-017, início
  da Fase 4)`.

(A Fase 3 — Colaboração Mensal, ADR-016, commit `c96177e` — já estava concluída e commitada
**antes** desta sessão; não foi trabalho desta sessão.)

## 11. Estado final

- **Fase 4 concluída?** Não. Só o primeiro passo (OAuth) foi feito, e ele tem um conflito de
  arquitetura não resolvido.
- **OAuth concluído?** Parcialmente. O mecanismo técnico (troca refresh→access token,
  renovação automática) está implementado e validado com sucesso contra a API real do
  Google Drive. Mas o **escopo escolhido está em conflito não resolvido** com uma decisão
  anterior já citada como vigente em documentos oficiais do Portal (Seção 2) — por isso não
  pode ser considerado definitivamente concluído.
- **Storage iniciado?** Não. Nenhuma rota, service ou regra de negócio de Storage existe.
- **Workspace Provisioning iniciado?** Não.
- **Existe algum bloqueio?** **Sim — GATE DE DECISÃO ARQUITETURAL.** O conflito de escopo do
  ADR-017 (Seção 2/8) exige decisão explícita do responsável do projeto (`drive.file` vs.
  `drive` completo) antes de qualquer novo código de Storage ou Workspace Provisioning. Este
  gate bloqueia toda implementação adicional da Fase 4 até ser resolvido.

## 12. Checklist

- [x] Auditoria da premissa da tarefa externa de "concluir OAuth" (premissa refutada)
- [x] ADR-017 (série de governança deste projeto) escrito, com aprovação para iniciar a Fase 4
- [x] Helper de access token implementado (`fetch` nativo, sem dependência nova)
- [x] Script de validação criado e executado com sucesso contra a API real do Google Drive
- [x] `typecheck`/`build`/suíte de testes (236) verdes no `portal-backend`
- [x] Commits feitos (`863c698`, `2d89cfa`)
- [x] Auditoria de banco de dados e domínio para o plano de integração do Drive (disparada em
      segundo plano nesta sessão; resultado obtido)
- [ ] **Conflito ADR-017 (`drive.file` vs `drive` completo) resolvido — BLOQUEADO, aguardando
      decisão do responsável do projeto**
- [ ] Documento técnico de plano de integração do Drive (solicitado; auditoria pronta, texto
      final ainda não redigido)
- [ ] Estrutura de pastas / Workspace Provisioning decidida
- [ ] Rotas/service de Storage implementados
- [ ] Migração de `material.storage.ts` (disco local) para Drive
