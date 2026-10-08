#!/usr/bin/env bash
set -euo pipefail
sha="${GITHUB_SHA:-$(git rev-parse HEAD)}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'Invalid commit SHA' >&2; exit 1; }
node scripts/production-gate.mjs
[[ -f dist/release.json ]] || { echo 'Build artifact missing' >&2; exit 1; }
python3 - "$sha" <<'PY'
import json,sys
assert json.load(open('dist/release.json'))['sha']==sys.argv[1], 'Build SHA mismatch'
PY
mkdir -p artifacts/release/www
cp -R dist/. artifacts/release/www/
tar -czf artifacts/release.tar.gz -C artifacts/release www
ssh -o BatchMode=yes -o StrictHostKeyChecking=yes -i "$DEPLOY_KEY_FILE" guest-web@89.221.222.92 "deploy $sha" < artifacts/release.tar.gz
curl --fail --silent --show-error https://guest.hcasc.cz/release.json > artifacts/runtime.json
python3 - "$sha" <<'PY'
import json,sys
assert json.load(open('artifacts/runtime.json'))['sha']==sys.argv[1], 'Public SHA mismatch'
PY
