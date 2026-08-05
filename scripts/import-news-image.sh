#!/usr/bin/env bash

set -euo pipefail

if [[ $# -ne 2 ]]; then
  echo "Uso: $0 <url-de-imagen> <slug>" >&2
  exit 2
fi

image_url=$1
slug=$2

if [[ ! $slug =~ ^[a-z0-9]+(-[a-z0-9]+)*$ ]]; then
  echo "El slug debe usar sólo minúsculas ASCII, números y guiones." >&2
  exit 2
fi

script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
repo_root=$(cd "$script_dir/.." && pwd)
temporary_image=$(mktemp "${TMPDIR:-/tmp}/news-sesc-image.XXXXXX")
trap 'rm -f "$temporary_image"' EXIT

curl --location --fail --silent --show-error --max-time 90 \
  --user-agent "Mozilla/5.0 news-sesc-image-importer" \
  "$image_url" --output "$temporary_image"

mime_type=$(file --brief --mime-type "$temporary_image")
case "$mime_type" in
  image/jpeg) extension=jpg ;;
  image/png) extension=png ;;
  image/webp) extension=webp ;;
  image/gif) extension=gif ;;
  image/avif) extension=avif ;;
  *)
    echo "La URL no devolvió una imagen compatible; tipo recibido: $mime_type" >&2
    exit 1
    ;;
esac

asset_relative="assets/$slug.$extension"
asset_path="$repo_root/$asset_relative"

if [[ -e $asset_path ]]; then
  echo "El archivo ya existe y no será sobrescrito: $asset_relative" >&2
  exit 1
fi

mv "$temporary_image" "$asset_path"
trap - EXIT

echo "Archivo: $asset_relative"
echo "imageUrl: https://raw.githubusercontent.com/aleg001/news_sesc/main/$asset_relative"
