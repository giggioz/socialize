#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

usage() {
  cat <<'EOF'
Usage:
  scripts/mongo-restore.sh /path/to/backup.tgz

Restores using the mongo root user configured in compose (.env at repo root).
EOF
}

ARCHIVE="${1:-}"
if [[ "$ARCHIVE" == "" || "$ARCHIVE" == "-h" || "$ARCHIVE" == "--help" ]]; then
  usage
  exit 1
fi

if [[ ! -f "$ARCHIVE" ]]; then
  echo "File not found: $ARCHIVE"
  exit 2
fi

echo "Restoring MongoDB from: $ARCHIVE"

docker-compose cp "$ARCHIVE" mongo:/tmp/backup.tgz
docker-compose exec -T mongo sh -lc '
  set -e
  rm -rf /tmp/backup
  mkdir -p /tmp/backup
  tar -C /tmp -xzf /tmp/backup.tgz
  mongorestore \
    --uri "mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/admin?authSource=admin" \
    --gzip \
    --drop \
    /tmp/backup
  rm -rf /tmp/backup /tmp/backup.tgz
'

echo "Done."

