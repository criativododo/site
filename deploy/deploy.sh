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

echo "==> Frontend: instalando dependências e buildando"
cd "$REPO_DIR/portal-frontend"
npm ci
npm run build

echo "==> Publicando build do frontend em /var/www/dodo-portal/portal-frontend/dist"
# Ajustar o destino se o server_name/root do deploy/nginx.conf for diferente.
sudo mkdir -p /var/www/dodo-portal/portal-frontend
sudo rsync -a --delete "$REPO_DIR/portal-frontend/dist/" /var/www/dodo-portal/portal-frontend/dist/

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
