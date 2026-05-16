#!/usr/bin/env bash
set -euo pipefail

OUTPUT_DIR="${1:-.}"
MANIFEST="manifest.json"
VERSION=$(sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' "$MANIFEST")
NAME="bilibili-live-comment-button"
FILENAME="${NAME}-v${VERSION}.zip"

FILES=(
    "manifest.json"
    "config.js"
    "content.js"
    "content.css"
    "popup.html"
    "popup.js"
    "icons/icon128.png"
)

rm -f "${OUTPUT_DIR}/${FILENAME}"
zip "${OUTPUT_DIR}/${FILENAME}" "${FILES[@]}"

echo "Packaged: ${OUTPUT_DIR}/${FILENAME}"
