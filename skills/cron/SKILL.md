# Cron Skill

*Manage Nanobot scheduled tasks (crons)*

## Usage

```bash
nanobot cron <command> [options]
```

## Commands

### List Crons
```bash
nanobot cron list
```

### Add New Cron
**Important:** Before adding a new cron, check for duplicates:

```bash
nanobot cron list
```

- Review existing crons to avoid duplicates
- If a similar cron exists, confirm with the user before adding
- Check for duplicates by:
  - Same command/script
  - Same schedule (time/frequency)
  - Similar purpose

### Remove Cron
```bash
nanobot cron remove <id>
```

## Adding a New Cron

When adding a new scheduled task:

1. **Check for duplicates first** - Run `nanobot cron list`
2. **Verify no duplicate exists** - Look for:
   - Same script or command
   - Same time/frequency
   - Similar functionality
3. **Confirm with user** - If duplicate found, ask before adding:
   - "A similar cron already exists. Do you want to add this anyway or modify the existing one?"
4. **Add the cron** - Only after confirming no conflict

Example workflow:
```bash
# 1. Check existing crons
nanobot cron list

# 2. If duplicate found, confirm with user
# "Cron for 'pulsar' already runs at 7:30am. Add anyway?"

# 3. Add if confirmed
nanobot cron add "30 7 * * *" "npx tsx ~/.cosmo/packages/scripts/pulsar.ts"
```
EOF # Create cron SKILL.md