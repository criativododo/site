#!/usr/bin/env bash
# Healthcheck do Portal DODÔ em produção — checagens somente leitura, sem efeitos colaterais.
# Uso: ./deploy/healthcheck.sh [dominio]
#   dominio (opcional) — se informado, também testa https://<dominio>/health de fora.
set -uo pipefail

DOMAIN="${1:-}"
FAIL=0

check() {
  local label="$1"; shift
  if "$@" > /dev/null 2>&1; then
    echo "OK    - $label"
  else
    echo "FALHA - $label"
    FAIL=1
  fi
}

echo "==> Healthcheck Portal DODÔ — $(date -Iseconds)"

check "PM2: processo portal-backend online" bash -c "pm2 jlist | grep -q '\"name\":\"portal-backend\".*\"status\":\"online\"'"

check "Backend responde em 127.0.0.1:4000/health" curl -fsS http://127.0.0.1:4000/health

check "Nginx ativo (systemd)" systemctl is-active --quiet nginx

check "PostgreSQL ativo (systemd)" systemctl is-active --quiet postgresql

check "Nginx: configuração válida" sudo nginx -t

if [ -n "$DOMAIN" ]; then
  check "HTTPS público: https://$DOMAIN/health" curl -fsS "https://$DOMAIN/health"
fi

echo "------------------------------------------------------------"
if [ "$FAIL" -eq 0 ]; then
  echo "Resultado: TODAS as checagens passaram."
else
  echo "Resultado: uma ou mais checagens FALHARAM — ver acima."
fi
exit "$FAIL"
