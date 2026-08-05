#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Uso: $0 <assets/archivo> <id-de-noticia>" >&2
  exit 2
fi

asset_path=$1
news_id=$2

if [[ ! $asset_path =~ ^assets/[a-z0-9]+(-[a-z0-9]+)*\.(jpg|png|webp|gif|avif)$ ]]; then
  echo "La imagen debe ser una ruta segura dentro de assets/." >&2
  exit 2
fi

if [[ ! $news_id =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "El id de la noticia no es válido." >&2
  exit 2
fi

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd "$script_dir/.." && pwd)
cd "$repo_root"

if [[ ! -f $asset_path ]]; then
  echo "No existe la imagen: $asset_path" >&2
  exit 1
fi

if ! git diff --cached --quiet; then
  echo "Ya hay cambios preparados en Git. Revísalos antes de publicar para no mezclarlos." >&2
  exit 1
fi

node scripts/validate-news.mjs "$news_id" "$asset_path"
git add -- news.json "$asset_path"

if git diff --cached --quiet; then
  echo "No hay cambios nuevos para publicar." >&2
  exit 1
fi

unexpected_files=$(git diff --cached --name-only | while IFS= read -r staged_file; do
  if [[ $staged_file != "news.json" && $staged_file != "$asset_path" ]]; then
    echo "$staged_file"
  fi
done)

if [[ -n $unexpected_files ]]; then
  git restore --staged -- news.json "$asset_path"
  echo "Se detectaron archivos preparados fuera de la noticia: $unexpected_files" >&2
  exit 1
fi

git commit -m "Publica noticia: $news_id"
git push
