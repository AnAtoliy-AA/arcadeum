#!/bin/bash
set -euo pipefail

export PATH=/opt/oci-cli/bin:$PATH

[ -f /etc/arcadeum/vault.conf ] && source /etc/arcadeum/vault.conf

REGION="${OCI_REGION:?OCI_REGION must be set in environment or /etc/arcadeum/vault.conf}"
VAULT="${OCI_VAULT_OCID:?OCI_VAULT_OCID must be set in environment or /etc/arcadeum/vault.conf}"
COMP="${OCI_COMPARTMENT_OCID:?OCI_COMPARTMENT_OCID must be set in environment or /etc/arcadeum/vault.conf}"
OUT="${1:-/run/arcadeum-secrets/secrets.env}"
AUTH="instance_principal"

PREFIXES="be_|root_|web_|tgbot_|botstg_|taskbot_|worker_"

SECRETS=$(oci vault secret list \
  --compartment-id "$COMP" \
  --vault-id "$VAULT" \
  --auth "$AUTH" \
  --region "$REGION" \
  --all \
  2>/dev/null | python3 -c "
import sys, json
d = json.load(sys.stdin)
for s in d.get('data', []):
    if s.get('lifecycle-state') == 'ACTIVE':
        print(s['secret-name'], s['id'])
")

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

while IFS=' ' read -r name ocid; do
  [ -z "$name" ] && continue
  bare="$name"
  for p in $(echo "$PREFIXES" | tr '|' ' '); do
    case "$bare" in
      ${p}*) bare="${bare#${p}}"; break ;;
    esac
  done
  if ! echo "$bare" | grep -qE '^[A-Z_][A-Z0-9_]*$'; then
    continue
  fi
  value=$(oci secrets secret-bundle get \
    --secret-id "$ocid" \
    --auth "$AUTH" \
    --region "$REGION" \
    2>/dev/null | python3 -c "
import sys, json, base64
d = json.load(sys.stdin)
c = d['data']['secret-bundle-content']['content']
print(base64.b64decode(c).decode('utf-8'), end='')
")
  if [ -n "$value" ]; then
    value="$(printf '%s' "$value" | tr -d '\000-\010\013\014\016-\037\177')"
    value="${value//$'\n'/\\n}"
    escaped_value="${value//\'/\'\"\'\"\'}"
    printf "%s='%s'\n" "$bare" "$escaped_value" >> "$TMP"
  fi
done <<< "$SECRETS"

umask 077
mv "$TMP" "$OUT"
chmod 640 "$OUT"
chown root:ubuntu "$OUT" 2>/dev/null || true
chown root:ubuntu "$(dirname "$OUT")" 2>/dev/null || true
chmod 750 "$(dirname "$OUT")" 2>/dev/null || true
trap - EXIT

echo "Fetched $(wc -l < "$OUT") secrets to $OUT"
