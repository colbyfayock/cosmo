# nanobot-docs

Quick reference for nanobot (ultra-lightweight personal AI assistant).

## Overview

- **nanobot** is an ultra-lightweight AI assistant (~4,000 lines of code)
- GitHub: https://github.com/HKUDS/nanobot
- 20.9k stars

## Fetch Latest Docs

When user asks about nanobot setup, configuration, features, or any detailed question, fetch the latest README:

```
https://raw.githubusercontent.com/HKUDS/nanobot/main/README.md
```

## Common Commands

```bash
nanobot status
nanobot gateway
nanobot cron list
```

## Finding Skills

List all available skills:
```bash
ls ~/.nanobot/workspace/skills/
```

Each skill is a directory with `SKILL.md`.

## Key Paths

- Workspace: `~/.nanobot/workspace/`
- Config: `~/.nanobot/config.json`
- Skills: `~/.nanobot/workspace/skills/`
- Scripts: `~/.nanobot/workspace/packages/scripts/`

## Docs

See: https://github.com/HKUDS/nanobot
EOF # Update nanobot-docs