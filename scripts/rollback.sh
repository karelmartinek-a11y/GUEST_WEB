#!/usr/bin/env bash
set -euo pipefail
sha="${1:-}"
[[ "$sha" =~ ^[0-9a-f]{40}$ ]] || { echo 'Usage: rollback.sh <previous accepted SHA>' >&2; exit 1; }
ssh produkce python3 - "$sha" <<'PY'
import sys,os,json
from pathlib import Path
sha=sys.argv[1];root=Path('/opt/guest-web');release=root/'releases'/sha
assert json.loads((release/'www/release.json').read_text())['sha']==sha
previous=os.readlink(root/'current')
temp=root/'.rollback-manual';temp.symlink_to(release);os.replace(temp,root/'current')
print(json.dumps({'rolledBackTo':sha,'previous':previous}))
PY
curl --fail --silent --show-error https://guest.hcasc.cz/release.json
