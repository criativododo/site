#!/usr/bin/env bash
# Backup do PostgreSQL do Portal DODÔ, com rotação.
#
# ATENÇÃO — GAP DE ARQUITETURA (ver relatório de auditoria):
# até 2026-07-27, portal-backend NÃO persiste dados no PostgreSQL — a persistência é 100%
# em memória, decisão deliberada e documentada em START_HERE_NEXT_SESSION.md. O Postgres é
# provisionado nesta VPS porque foi pedido explicitamente como parte da stack de produção,
# não porque o código já grava nele. Este script existe para o dia em que essa migração
# acontecer; até lá, rodá-lo é inofensivo (dump de um banco vazio) mas não é backup de nada
# que hoje importe. Não remover este aviso ao editar o script.
#
# Uso: ./deploy/backup.sh
# Agendar via cron do usuário de deploy, ex.: 0 3 * * * /caminho/para/deploy/backup.sh
set -euo pipefail

DB_NAME="${DODO_DB_NAME:-dodo_portal}"
DB_USER="${DODO_DB_USER:-dodo_app}"
BACKUP_DIR="${DODO_BACKUP_DIR:-/var/backups/dodo-portal}"
RETENTION_DAYS="${DODO_BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y-%m-%d_%H-%M-%S)"
DEST_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "==> Backup $DB_NAME -> $DEST_FILE"
# Autenticacao via ~/.pgpass (chmod 600) ou PGPASSWORD ja exportado no ambiente que chama
# este script — nao forcar PGPASSWORD="" aqui, isso sobrescreveria e quebraria o .pgpass.
pg_dump -U "$DB_USER" -h 127.0.0.1 "$DB_NAME" | gzip > "$DEST_FILE"

echo "==> Removendo backups com mais de $RETENTION_DAYS dias"
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

echo "==> Backup concluído: $DEST_FILE ($(du -h "$DEST_FILE" | cut -f1))"
