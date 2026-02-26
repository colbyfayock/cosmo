#!/bin/bash
set -e

BACKUP_DIR="/home/ubuntu/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="cosmo_backup_${TIMESTAMP}.tar.gz"

mkdir -p "$BACKUP_DIR"

cd /home/ubuntu
tar --exclude='.cosmo/.git' --exclude='.cosmo/node_modules' -czf "$BACKUP_DIR/$BACKUP_FILE" .cosmo

echo "Backup created: $BACKUP_FILE"

# Keep only last 7 backups
cd "$BACKUP_DIR"
ls -t cosmo_backup_*.tar.gz | tail -n +8 | xargs -r rm -f

echo "Backups retained: $(ls -1 cosmo_backup_*.tar.gz | wc -l)"
