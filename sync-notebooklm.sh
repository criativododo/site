#!/bin/bash
set -euo pipefail

ROOT="/Users/danielperrut/criativododo"
DEST="/Users/danielperrut/Library/CloudStorage/GoogleDrive-criativododo@gmail.com/Meu Drive/DODÔ NotebookLM/sources"

echo "========================================"
echo "DODÔ NOTEBOOKLM SYNC v3"
echo "========================================"

mkdir -p "$DEST"
find "$DEST" -mindepth 1 -delete

copiar() {
    local ORIGEM="$1"

    [ -d "$ROOT/$ORIGEM" ] || return 0

    echo ">> $ORIGEM"

    rsync -a \
        --prune-empty-dirs \
        --exclude='archive/' \
        --exclude='*/archive/' \
        --exclude='*.prompt.md' \
        --exclude='HANDOFF*.md' \
        --exclude='START_HERE_NEXT_SESSION.md' \
        --exclude='INDEX.md' \
        --exclude='INVENTARIO.md' \
        --exclude='INVENTARIO.txt' \
        --exclude='MAPA_DO_PROJETO.md' \
        --exclude='AUDITORIA_DOCUMENTACAO.md' \
        --include='*/' \
        --include='*.md' \
        --include='*.mdx' \
        --exclude='*' \
        "$ROOT/$ORIGEM/" \
        "$DEST/$ORIGEM/"
}

copiar docs
copiar knowledge
copiar .knowledge
copiar design-system
copiar notebooklm

for ARQ in README.md CLAUDE.md DESIGN.md DESIGN_LANGUAGE.md ART_DIRECTION_GUIDE.md USER_JOURNEYS.md PORTAL_ARQUITETURA.md PORTAL_BACKLOG.md PORTAL_BRIEFING.md PORTAL_GLOSSARIO.md; do
    [ -f "$ROOT/$ARQ" ] && cp "$ROOT/$ARQ" "$DEST/"
done

find "$DEST" -type f | sort > "$DEST/INVENTARIO.txt"

{
echo "# DODÔ NotebookLM"
echo
echo "Gerado em $(date)"
echo
echo "## Total"
find "$DEST" -type f | wc -l
echo
echo "## Arquivos"
find "$DEST" -type f | sed "s|$DEST/||" | sort
} > "$DEST/INDEX.md"

echo
echo "========================================"
echo "FINALIZADO"
echo "========================================"

find "$DEST" -type f | wc -l
