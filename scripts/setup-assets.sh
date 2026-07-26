#!/usr/bin/env bash
set -Eeuo pipefail

# Copia assets de fonte (design-system + clone de referência do Estúdio Elã)
# para dentro de app/, de forma idempotente. Não altera design-system/ nem
# o clone de origem — só lê e copia.

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DS="$ROOT/design-system"
APP="$ROOT/app"
ORIGIN="/private/tmp/claude-501/-Users-danielperrut-criativododo-app/57852445-ae11-4187-8026-bd9583c4c186/scratchpad/estudioela-audit"

echo "== Validando pré-condições =="
for f in "$DS/fonts/WorkSans.ttf" "$DS/fonts/ElmsSans.ttf" "$DS/principal.svg" "$DS/icon.svg" "$DS/secundário.svg"; do
  [[ -f "$f" ]] || { echo "ERRO: esperado e não encontrado: $f" >&2; exit 1; }
done
for f in "$ORIGIN/assets/hero-video.mp4" "$ORIGIN/assets/hero-estatico.jpg"; do
  [[ -f "$f" ]] || { echo "ERRO: esperado e não encontrado: $f" >&2; exit 1; }
done
[[ -d "$APP" ]] || { echo "ERRO: $APP não existe" >&2; exit 1; }

echo "== Criando estrutura de destino =="
mkdir -p "$APP/public/fonts"
mkdir -p "$APP/src/assets/brand"

echo "== Copiando fontes (design-system -> app/public/fonts) =="
cp -f "$DS/fonts/WorkSans.ttf" "$APP/public/fonts/WorkSans.ttf"
cp -f "$DS/fonts/ElmsSans.ttf" "$APP/public/fonts/ElmsSans.ttf"

echo "== Copiando SVGs de marca (design-system -> app/src/assets/brand) =="
cp -f "$DS/principal.svg" "$APP/src/assets/brand/principal.svg"
cp -f "$DS/icon.svg" "$APP/src/assets/brand/icon.svg"
cp -f "$DS/secundário.svg" "$APP/src/assets/brand/secundario.svg"

echo "== Copiando vídeo/poster do Hero (placeholder, origem Estúdio Elã) =="
cp -f "$ORIGIN/assets/hero-video.mp4" "$APP/public/hero-video.mp4"
cp -f "$ORIGIN/assets/hero-estatico.jpg" "$APP/public/hero-poster.jpg"

echo "== Favicon (marca reduzida) =="
cp -f "$DS/icon.svg" "$APP/public/favicon.svg"

echo "== Conferência =="
for f in \
  "$APP/public/fonts/WorkSans.ttf" \
  "$APP/public/fonts/ElmsSans.ttf" \
  "$APP/src/assets/brand/principal.svg" \
  "$APP/src/assets/brand/icon.svg" \
  "$APP/src/assets/brand/secundario.svg" \
  "$APP/public/hero-video.mp4" \
  "$APP/public/hero-poster.jpg" \
  "$APP/public/favicon.svg"; do
  [[ -s "$f" ]] || { echo "ERRO: arquivo de destino ausente/vazio: $f" >&2; exit 1; }
done

echo "== Resumo =="
echo "Fontes:  $(ls -la "$APP/public/fonts" | tail -n +2 | wc -l | tr -d ' ') arquivo(s) em app/public/fonts"
echo "Marca:   $(ls -la "$APP/src/assets/brand" | tail -n +2 | wc -l | tr -d ' ') arquivo(s) em app/src/assets/brand"
echo "Hero:    hero-video.mp4 + hero-poster.jpg copiados para app/public"
echo "Favicon: app/public/favicon.svg (icon.svg)"
echo "OK — setup-assets concluído com sucesso."
