# HANDOFF — Etapa 0.1 (Fase 4): Provisionamento OAuth Google Drive

## Objetivo

Obter e validar a credencial permanente (refresh token) de acesso ao Google Drive via
OAuth, escopo `drive.file`, antes de iniciar a implementação do módulo de Storage da
Fase 4.

## O que foi implementado

Nenhum código de produto. Script Node standalone (temporário, fora do repositório, já
removido ao final) que: gera a URL de autorização OAuth, sobe um servidor HTTP local
(porta 4500) para capturar o callback, troca `code` por `access_token`/`refresh_token`,
grava a credencial em `.env`, valida a renovação do token e executa 3 operações reais no
Drive (criar pasta, upload, leitura).

## O que foi validado

- Fluxo de autorização completo, usando o Client OAuth **"Portal DODÔ Produção"**
  (`project_id: criativo-dodo`).
- `refresh_token` obtido e funcional.
- Renovação automática do access token (`grant_type=refresh_token`) — novo token válido
  por 3599s.
- Criação de pasta, upload de arquivo e leitura de conteúdo (conferido byte a byte) via
  API real do Drive.
- Escopo final do token: exclusivamente `https://www.googleapis.com/auth/drive.file`.
- Pasta e arquivo de teste removidos do Drive ao final (limpeza).

## Problemas encontrados e resolução

1. **Client OAuth errado na primeira tentativa.** O script leu `GOOGLE_CLIENT_ID` de
   `.env` (Client de login, sufixo `pfcn`), mas o Redirect URI `localhost:4500` havia sido
   cadastrado no Client "Portal DODÔ Produção" (sufixo `qbq`). Corrigido lendo
   client_id/secret direto do arquivo de credencial correto
   (`criativododo-interno/client_secret_...qbq....json`).
2. **Escopo vazou além do pedido.** A primeira execução usou `include_granted_scopes=true`
   — o Google fundiu o consentimento de login (`openid`/`profile`/`email`) já existente
   para esse Client ao novo token, violando o menor privilégio exigido. Token revogado
   (`oauth2.googleapis.com/revoke`, 200 OK); script corrigido (parâmetro removido);
   consentimento refeito — token final ficou escopado só a `drive.file`.

## Estado atual do projeto

Credencial de Storage obtida, validada e funcional. Nenhum código de Storage, Workspace,
Repository, Service, Endpoint ou Frontend foi escrito. Nenhum ADR foi redigido. A Fase 4
segue no Gate de Entrada — só a Etapa 0.1 (credencial) está concluída.

## Arquivos modificados

- `portal-backend/.env` (não versionado, fora do git) — 3 variáveis novas adicionadas;
  nenhuma variável de login alterada.

Nenhum arquivo rastreado pelo git foi alterado nesta etapa.

## Variáveis/configurações criadas ou alteradas

Em `portal-backend/.env`:

- `GOOGLE_DRIVE_CLIENT_ID` — Client OAuth "Portal DODÔ Produção", distinto do Client de
  login.
- `GOOGLE_DRIVE_CLIENT_SECRET`
- `GOOGLE_DRIVE_REFRESH_TOKEN` — escopo `drive.file`, validado.

No Google Cloud Console (feito pelo responsável do projeto, fora desta sessão): Redirect
URI `http://localhost:4500/oauth/drive/callback` adicionado ao Client "Portal DODÔ
Produção"; escopo `drive.file` habilitado na tela de consentimento.

## Pendências

- Nenhuma pendência técnica bloqueia o início da Etapa 1.
- Decisões a formalizar via ADR (ainda não escritos): forma de armazenamento/rotação
  definitiva da credencial em produção; política de retenção de mídia por categoria
  (LGPD).
- Acoplamento operacional: revogar ou rotacionar o Client OAuth no Console afeta login e
  Storage ao mesmo tempo (mesmo Client, credenciais de aplicação distintas).
- Rotação da credencial é manual (repetir o fluxo de consentimento) — sem automação.

## Próximo passo exato para a próxima sessão

Redigir **ADR-017** (credencial OAuth de provisionamento — decisão já tomada na prática,
falta formalizar: conta pessoal com escopo mínimo, não conta de serviço) e **ADR-018**
(retenção de mídia por categoria), com aprovação explícita do responsável do projeto antes
de qualquer código. Só depois iniciar a Etapa 1 da Fase 4 (schema: interface
`StorageProvider` + entidades `StorageObject`/`StorageAuditoria`/`AccessGrant`), seguindo o
mesmo protocolo fase-a-fase já usado na Fase 3.
