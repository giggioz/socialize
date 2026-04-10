#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"

usage() {
  cat <<'EOF'
Usage:
  scripts/deploy.sh <git_sha_or_tag>

Requirements on the server:
  - docker + docker compose
  - a .env file in the repo root OR exported env vars:
      DOMAIN, CADDY_EMAIL (optional), API_IMAGE, WEB_IMAGE

Example (GHCR):
  export API_IMAGE="ghcr.io/owner/repo-api:<sha>"
  export WEB_IMAGE="ghcr.io/owner/repo-web:<sha>"
  ./scripts/deploy.sh <sha>
EOF
}

if [[ "${1:-}" == "" || "${1:-}" == "-h" || "${1:-}" == "--help" ]]; then
  usage
  exit 1
fi

TAG="$1"

if [[ "${API_IMAGE:-}" == "" || "${WEB_IMAGE:-}" == "" ]]; then
  echo "Missing API_IMAGE/WEB_IMAGE. Set them in the environment or in .env."
  exit 2
fi

if [[ "${API_IMAGE}" != *":${TAG}" ]]; then
  API_IMAGE="${API_IMAGE%:*}:${TAG}"
fi

if [[ "${WEB_IMAGE}" != *":${TAG}" ]]; then
  WEB_IMAGE="${WEB_IMAGE%:*}:${TAG}"
fi

export API_IMAGE WEB_IMAGE

cd "$ROOT_DIR"

docker-compose pull
docker-compose up -d

echo "Waiting for API healthcheck..."
for i in {1..60}; do
  if docker-compose ps --status running >/dev/null 2>&1; then
    if docker-compose exec -T api node -e "fetch('http://127.0.0.1:3001/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"; then
      echo "API healthy."
      exit 0
    fi
  fi
  sleep 2
done

echo "API did not become healthy in time."
exit 3

