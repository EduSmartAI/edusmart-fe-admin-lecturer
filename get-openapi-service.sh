#!/usr/bin/env bash
# winget install --id jqlang.jq -e
set -Eeuo pipefail

# Cách dùng:
#   ./get-openapi-service.sh                        # đọc openapi-config.json, xuất file ở thư mục hiện tại
#   OUTPUT_DIR=public/openapi ./get-openapi-service.sh   # đổi thư mục output
#   ./get-openapi-service.sh path/to/config.json         # chỉ định file config khác

CONFIG_FILE="${1:-openapi-config.json}"
OUTPUT_DIR="${OUTPUT_DIR:-.}"

if ! command -v jq >/dev/null 2>&1; then
  echo "Error: jq is required. Install with: choco install jq" >&2
  exit 1
fi

if ! command -v curl >/dev/null 2>&1; then
  echo "Error: curl is required." >&2
  exit 1
fi

if [[ ! -f "$CONFIG_FILE" ]]; then
  echo "Config file not found: $CONFIG_FILE" >&2
  exit 1
fi

mkdir -p "$OUTPUT_DIR"

# Hỗ trợ cả 2 dạng config:
# 1) Object map: { "service": "url", ... }
# 2) Array: [ { "key": "service", "url": "..." }, ... ]
jq -r '
  if type=="object" then
    to_entries[] | [.key, .value]
  elif type=="array" then
    .[] | [.key, .url]
  else
    empty
  end
  | @tsv
' "$CONFIG_FILE" | while IFS=$'\t' read -r NAME URL; do
  # Fix CRLF/CR dính cuối dòng trên Windows (tránh curl báo "Malformed input")
  NAME=${NAME//$'\r'/}
  URL=${URL//$'\r'/}

  # Sanitize tên file
  SAFE_NAME=$(echo "$NAME" | tr '[:upper:]' '[:lower:]' | LC_ALL=C tr -cs 'a-z0-9._-' '-' | sed 's/^-//; s/-$//')
  OUT_FILE="$OUTPUT_DIR/openapi-$SAFE_NAME.json"

  echo "→ Fetching $NAME from $URL"

  TMP="$(mktemp)"

  # Nếu cần bearer token: export OPENAPI_BEARER=xxx
  AUTH_HEADER=()
  if [[ -n "${OPENAPI_BEARER:-}" ]]; then
    AUTH_HEADER=(-H "Authorization: Bearer $OPENAPI_BEARER")
  fi

  # -f: fail on HTTP >=400, -S: show error, -s: silent, -L: follow redirect
  if ! curl -fSLsS --max-time 60 --retry 3 --retry-delay 1 \
        "${AUTH_HEADER[@]}" -H "Accept: application/json" \
        "$URL" -o "$TMP"; then
    echo "  ✗ Failed to download $URL" >&2
    rm -f "$TMP"
    continue
  fi

  # Validate JSON
  if ! jq empty "$TMP" >/dev/null 2>&1; then
    echo "  ✗ Response is not valid JSON: $URL" >&2
    rm -f "$TMP"
    continue
  fi

  mv "$TMP" "$OUT_FILE"
  BYTES=$(wc -c < "$OUT_FILE" | tr -d ' ')
  echo "  ✓ Wrote $OUT_FILE (${BYTES} bytes)"
done

echo "Done."
