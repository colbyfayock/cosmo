#!/bin/bash
set -e
cd ~/.cosmo

git fetch origin

LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse origin/main)

if [ "$LOCAL" = "$REMOTE" ]; then
    echo "No changes to push"
    exit 0
fi

git add -A
git commit -m "Backup $(date +%Y%m%d_%H%M%S)"

if git merge --no-edit origin/main; then
    git push origin main
else
    MESSAGE="Conflict in cosmo backup. Manual merge needed."
    curl -s -X POST "https://api.telegram.org/bot$(cat ~/.cosmo/config.json | jq -r '.telegram.botToken')/sendMessage" \
        -d chat_id="$(cat ~/.cosmo/config.json | jq -r '.telegram.chatId')" \
        -d text="$MESSAGE"
    echo "$MESSAGE"
    exit 1
fi
