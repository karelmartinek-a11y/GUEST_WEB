#!/usr/bin/env bash
set -euo pipefail
[[ "${RENEWED_LINEAGE:-}" == '/etc/letsencrypt/live/guest.hcasc.cz' ]] || exit 0
nginx -t
systemctl reload nginx
