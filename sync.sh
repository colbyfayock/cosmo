#!/bin/bash
cd ~/.cosmo
git add -A
git diff --staged --quiet && exit 0
git commit -m "Backup $(date +%Y%m%d_%H%M%S)"
git push origin main
