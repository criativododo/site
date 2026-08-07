# Runbook — Deploy e Rollback do TEAR V2.5

## Quando usar

Use este runbook para o primeiro deploy, releases subsequentes e reversão de
uma release do `tear-v2-app` na Locaweb. Ele não substitui o gate de
autorização em `docs/release/GATE_FINAL_GO_LIVE.md`.

## Premissas

- Produção usa PostgreSQL gerenciado e uma origem única:
  `https://portal.criativododo.com.br` (domínio atualizado em 2026-07-23 —
  rebranding "Criativo Dodô" → "Criativo Dodô" + migração para Locaweb
  Hospedagem II; substitui `influencia.estudioela.com`).
- O build React está em `backend/public/build`.
- Cada release deve estar em `releases/<release-id>` e `current` deve apontar
  para a release ativa.
- `.env` e `storage` são compartilhados e nunca pertencem ao repositório.
- O host não possui Docker. Não usar comandos `docker compose` em produção.

## Pré-requisitos de acesso

- Acesso ao painel Locaweb, DNS e SSL.
- SSH temporariamente habilitado no painel.
- Acesso ao PostgreSQL e a um banco isolado de restauração.
- Acesso aos segredos de produção em gestor de senhas.
- Acesso à conta Google Drive e ao SMTP.

## Pré-deploy

1. Confirmar CI verde para o commit que será publicado.
2. Registrar `release-id`, commit e responsável pela execução.
3. Verificar que não há migration destrutiva ou incompatível com rollback.
4. Executar backup válido antes da janela de deploy.
5. Confirmar que a release anterior continua presente e identificável.
6. Confirmar que os seguintes valores existem no `.env` compartilhado:

   ```env
   APP_ENV=production
   APP_DEBUG=false
   DB_CONNECTION=pgsql
   SESSION_DRIVER=database
   SESSION_SECURE_COOKIE=true
   APP_URL=https://portal.criativododo.com.br
   FRONTEND_URL=https://portal.criativododo.com.br
   SANCTUM_STATEFUL_DOMAINS=portal.criativododo.com.br
   ```

7. Garantir que o `.env` tem permissão restrita (`chmod 600`) e não contém
   placeholders.

## Deploy

> Não iniciar esta seção enquanto o mecanismo de publicação compatível com o
> SSH da Locaweb não tiver sido ensaiado. O workflow que requer chave SSH não
> deve ser tratado como procedimento comprovado para o host auditado.
>
> **SSH bloqueado desde 2026-07-24** (porta 22 em timeout nos 3 alvos, sem
> ETA — `docs/_workspace/TASK_ROUTER.md` §55/§56/§60/§62). Enquanto isso,
> ver "Contingência: deploy manual via FTP" ao final deste runbook.

1. Gerar dependências PHP no runner de CI:

   ```bash
   composer install --no-dev --optimize-autoloader --no-interaction
   ```

2. Gerar o frontend para a origem única:

   ```bash
   cd frontend
   npm ci
   npm run build:locaweb
   ```

3. Publicar o conteúdo de `backend/`, incluindo `vendor/` e
   `public/build`, em uma nova release sem sobrescrever `shared/.env` nem
   `shared/storage`.
4. No diretório da nova release, criar links para `.env` e `storage`
   compartilhados.
5. Validar `vendor/autoload.php` e `public/build/index.html` antes de ativar.
6. Executar, na nova release:

   ```bash
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

7. Trocar o symlink `current` para a nova release.
8. Se houver fila pendente, deixar a execução corrente terminar e disparar o
   worker de cron na nova release. Não há worker persistente nesse ambiente.

## Smoke tests pós-deploy

Executar imediatamente:

```bash
curl -fsS https://portal.criativododo.com.br/up
curl -fsS https://portal.criativododo.com.br/api/health
```

Depois validar pelo navegador:

1. página pública abre por HTTPS sem conteúdo misto;
2. login e reload preservam a sessão;
3. logout encerra a sessão;
4. usuário ADMIN acessa `/pulse`;
5. convite e reset de senha entregam e-mail;
6. upload de material e comprovante alcançam o Google Drive;
7. fluxo de aprovação e pagamento retorna respostas esperadas;
8. response contém `X-Request-Id`;
9. não há exceções novas em logs/Pulse.

## Rollback da aplicação

Use quando um gatilho do gate for atingido.

1. Colocar novas operações em pausa, se necessário.
2. Identificar a release estável anterior.
3. Reapontar `current` para essa release.
4. Limpar e recriar caches na release reativada:

   ```bash
   php artisan optimize:clear
   php artisan config:cache
   php artisan route:cache
   php artisan view:cache
   ```

5. Reexecutar os smoke tests.
6. Preservar logs, request IDs e a release defeituosa para investigação.

## Rollback de banco

Não restaurar banco de produção por impulso. Primeiro, avaliar se uma
migration reversível ou correção forward é suficiente. Se a restauração for
necessária:

1. interromper escrita e registrar a janela de incidente;
2. confirmar o backup e restaurá-lo primeiro em banco isolado;
3. validar contagens, usuários, participações, pagamentos e relações;
4. restaurar com cliente PostgreSQL (`psql`), nunca com Docker;
5. validar a aplicação e os smoke tests antes de liberar escrita.

O procedimento exato de restore só é válido após ser ensaiado no ambiente
Locaweb com as credenciais e ferramentas reais.

## Contingência: deploy manual via FTP (SSH indisponível)

> **Usar apenas enquanto a porta 22 SSH da Locaweb estiver bloqueada** (ver
> `docs/_workspace/TASK_ROUTER.md` §55/§56/§60/§62 — timeout confirmado nos
> 3 alvos, sem ETA do suporte, mesmo após novo teste pedido pela própria
> Locaweb). Não substitui nem reabre a decisão de `ADR-016` (SSH/rsync como
> mecanismo padrão do pipeline) — é um caminho de contingência temporário,
> formalizado a pedido do responsável em 2026-07-24. Descontinuar assim que
> o SSH voltar e retomar o procedimento padrão acima.

### Por que é viável

Reclassificação etapa a etapa do pipeline (`PLANO_DE_IMPLANTACAO.md`
Etapas 1-17 + este runbook) por dependência real de protocolo — não pela
convenção atual, que usa SSH para tudo por decisão de `ADR-016`
(`TASK_ROUTER.md` §62 Frente 2):

- **FTP-viável:** envio de código, `vendor/` e build do frontend (todos já
  gerados no CI, nunca no host, desde `ADR-016`), criação de diretórios,
  upload do `.env`.
- **SSH obrigatório, sem alternativa:** os 4 comandos de
  `scripts/deploy-locaweb.sh` (symlink de `.env`/`storage`,
  `migrate --force`, `config:cache`/`route:cache`/`view:cache`, symlink de
  `current`), mais `admin:create`, `migrate:status`, `crontab -e`, execução
  manual de `backup-db.sh`, e qualquer rollback.
- **Só no Painel Locaweb (nem FTP nem SSH):** Postgres gerenciado, DNS,
  SSL, SMTP, habilitação do próprio SSH.

### Pré-condição

Conta `criativododo2` confirmada vazia em `TASK_ROUTER.md` §56 — permite
abandonar o padrão `releases/<id>` + symlink `current` (que dependem de
SSH) e publicar direto num diretório fixo `~/tear/` (path técnico já usado
no resto da documentação, não é nomenclatura nova — ver `§61`).

### Fases

**Fase 0 — Preparar pacote localmente**
- Build do frontend: `npm run build:locaweb` (mesmo comando do CI).
- `composer install --no-dev --optimize-autoloader --no-interaction` para
  gerar `vendor/` (fora do host — já é assim desde `ADR-016`).
- `APP_KEY` gerado localmente (`php artisan key:generate --show`), nunca
  commitado.

**Fase 1 — Provisionar recursos no Painel Locaweb**
- Banco PostgreSQL gerenciado.
- DNS de `portal.criativododo.com.br` (ainda sem nameserver/registro A
  confirmado, ver `DEPLOY.md` §1).
- SSL.

**Fase 2 — Upload por FTP: código**
- Enviar `backend/` (exceto `vendor/`, `.env`, `storage/`) para `~/tear/`.

**Fase 3 — Upload por FTP: `vendor/` e build**
- Enviar `vendor/` gerado na Fase 0.
- Enviar `public/build` (build do frontend, origem única — `ADR-015`).

**Fase 4 — Upload por FTP: `.env`**
- Por último, de propósito — evita servir a aplicação com config
  incompleta.
- Apontar document root do painel para `~/tear/public`.
- Validação possível até aqui: só HTTP/FTP, sem shell.

> **Ponto exato de espera por SSH.** Depois da Fase 4, restam só os itens
> "SSH obrigatório" listados acima (Fase 5) — nada mais tem alternativa
> por FTP.

**Fase 5 — Comandos que exigem SSH (aguardar liberação da porta 22)**

```bash
ln -sfn ~/tear/shared/.env ~/tear/.env
ln -sfn ~/tear/shared/storage ~/tear/storage
php artisan migrate --force
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan admin:create --name="Nome Completo" \
  --email="admin@criativododo.com.br"
crontab -e   # agendar backup-db.sh
```

**Fase 6 — Smoke tests**

Mesmos smoke tests da seção "Smoke tests pós-deploy" acima.

### O que se perde nesta contingência

- **Atomicidade de release:** FTP sobrescreve no lugar, sem
  `releases/`+symlink — aceitável dado o perfil de tráfego administrativo
  baixo já assumido em `ARQUITETURA_PRODUCAO.md`.
- **Rollback de aplicação** (seção acima) não se aplica sem SSH — reverter
  por FTP significa reenviar a release anterior por cima, sem troca
  atômica de symlink.

### Origem

Plano produzido em `TASK_ROUTER.md` §62 Frente 3 (2026-07-24, só em
conversa até esta formalização). Retoma a análise da opção (B) de
`AUDITORIA_LOCAWEB.md` §5.1 — descartada em 2026-07-22 quando o SSH
respondia (`ADR-016` manteve SSH/rsync puro); hoje volta a ser relevante
como contingência temporária, não como mudança de arquitetura.
