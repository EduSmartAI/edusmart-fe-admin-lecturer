#!/usr/bin/env bash
# Generate TS API clients from any *openapi*.json in the repo.
# Usage:
#   bash scripts/gen-openapi.sh                 # quét tự động
#   bash scripts/gen-openapi.sh --out src/api   # đổi thư mục xuất
#   bash scripts/gen-openapi.sh path/to/openapi-payment-service.json  # chỉ gen file chỉ định
set -euo pipefail

OUTDIR="${OUTDIR:-src/api}"
FILES=()

# --- tiny args parser ---
while [[ $# -gt 0 ]]; do
  case "$1" in
    -o|--out) OUTDIR="$2"; shift 2;;
    *) FILES+=("$1"); shift;;
  esac
done

# --- checks ---
if ! command -v npx >/dev/null 2>&1; then
  echo "❌ Cần Node.js và npm (npx). Cài Node rồi chạy lại."
  exit 1
fi

mkdir -p "$OUTDIR"

# --- find openapi json if user didn't pass any ---
if [[ ${#FILES[@]} -eq 0 ]]; then
  # quét tất cả trừ .git & node_modules
  while IFS= read -r f; do
    FILES+=("$f")
  done < <(find . \
      -path "./.git" -prune -o \
      -path "./node_modules" -prune -o \
      -type f -iregex '.*openapi.*\.json$' -print | sort)
fi

if [[ ${#FILES[@]} -eq 0 ]]; then
  echo "ℹ️  Không tìm thấy file *openapi*.json"
  exit 0
fi

# --- helper to compute output file name ---
to_output_name() {
  local p="$1"
  local base lower name out
  base="$(basename "$p")"
  lower="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')"
  name="${lower%.json}"

  if [[ "$lower" == "openapi.json" ]]; then
    out="api.ts"
  elif [[ "$lower" == openapi-*".json" ]]; then
    out="api-${name#openapi-}.ts"
  else
    # fallback: api-<basename-without-ext>.ts
    out="api-${name}.ts"
  fi
  printf '%s' "$out"
}

# --- generate ---
FAILED=0
for file in "${FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    echo "⚠️  Bỏ qua: $file (không tồn tại)"
    continue
  fi
  if [[ ! "$file" =~ \.json$ ]]; then
    echo "⚠️  Bỏ qua (không phải .json): $file"
    continue
  fi
  outName="$(to_output_name "$file")"

  echo ""
  echo "▶ Generating from: $file"
  echo "   → $OUTDIR/$outName"

  if ! npx -y swagger-typescript-api generate \
        -p "$file" \
        -o "$OUTDIR" \
        -n "$outName" \
        -T axios; then
    echo "❌ Failed: $file"
    FAILED=1
  fi
done

echo ""
if [[ $FAILED -eq 0 ]]; then
  echo "✅ Done. Files in $OUTDIR"
else
  echo "⚠️  Có file lỗi khi generate."
  exit 1
fi
