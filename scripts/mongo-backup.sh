#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

BACKUP_DIR="${BACKUP_DIR:-$ROOT_DIR/.backups/mongo}"
TS="$(date -u +%Y%m%dT%H%M%SZ)"
OUT_DIR="${BACKUP_DIR}/${TS}"

mkdir -p "$OUT_DIR"

echo "Backing up MongoDB to: $OUT_DIR"

# Uses root credentials provided to the mongo container via compose (.env at repo root)
docker-compose exec -T mongo sh -lc '
  set -e
  mongodump \
    --uri "mongodb://${MONGO_INITDB_ROOT_USERNAME}:${MONGO_INITDB_ROOT_PASSWORD}@localhost:27017/admin?authSource=admin" \
    --gzip \
    --out /tmp/backup
  tar -C /tmp -czf /tmp/backup.tgz backup
'

docker-compose cp mongo:/tmp/backup.tgz "$OUT_DIR/backup.tgz"
docker-compose exec -T mongo sh -lc 'rm -rf /tmp/backup /tmp/backup.tgz'

echo "Done."

