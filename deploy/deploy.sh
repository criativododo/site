#!/usr/bin/env bash
# Deploy do Portal DODÔ (portal-backend + portal-frontend) numa VPS Ubuntu já provisionada
# (Node 22, PostgreSQL 16, PM2, Nginx instalados — ver
# docs/_workspace/auditorias/DEPLOY_AUDIT_VPS_2026-07-27_19-28-44.md para o provisionamento
# inicial, que este script não faz).
#
# Idempotente: pode ser rodado de novo a cada release sem efeito colateral.
# Uso: ./deploy/deploy.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$REPO_DIR"

echo "==> Deploy Portal DODÔ — $(date -Iseconds)"

if [ ! -f "portal-backend/.env" ]; then
  echo "ERRO: portal-backend/.env não existe. Copie de deploy/.env.example e preencha os valores reais antes de continuar." >&2
  exit 1
fi

if [ ! -f "portal-frontend/.env" ]; then
  echo "ERRO: portal-frontend/.env não existe. Copie de deploy/.env.example (seção frontend) antes de continuar." >&2
  exit 1
fi

echo "==> Atualizando código (git pull)"
git pull --ff-only

echo "==> Backend: instalando dependências e buildando"
cd "$REPO_DIR/portal-backend"
npm ci
npm run build
mkdir -p logs

echo "==> Backend: aplicando migrações pendentes (idempotente, tsx scripts/migrate.ts)"
npm run db:migrate

echo "==> Frontend: instalando dependências e buildando"
cd "$REPO_DIR/portal-frontend"
npm ci
npm run build

echo "==> Publicando build do frontend em /var/www/portal-criativododo"
# Caminho reconciliado em 01/08/2026: é o que o nginx de produção de fato serve (root do
# server_name portal.criativododo.com.br) — ajustar aqui e em deploy/nginx.conf juntos se
# o root mudar de novo.
sudo mkdir -p /var/www/portal-criativododo
sudo rsync -a --delete "$REPO_DIR/portal-frontend/dist/" /var/www/portal-criativododo/
sudo chown -R www-data:www-data /var/www/portal-criativododo

echo "==> Reiniciando backend via PM2"
cd "$REPO_DIR"
if pm2 describe portal-backend > /dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --env production
else
  pm2 start ecosystem.config.cjs --env production
fi
pm2 save

echo "==> Recarregando Nginx"
sudo nginx -t
sudo systemctl reload nginx

echo "==> Deploy concluído — $(date -Iseconds)"
echo "Verifique com: ./deploy/healthcheck.sh"
