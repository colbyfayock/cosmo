# gog Skill

*Google CLI for Gmail, Calendar, Drive, and more.*

## Usage

```bash
# Get help
gog -h

# Service-specific help
gog gmail -h
gog calendar -h
gog drive -h
```

## Quick Examples

```bash
# Gmail
gog gmail list
gog gmail send --to "email" --subject "Subject" --body "Body"
gog gmail search "query"

# Calendar
gog calendar events
gog calendar event create --title "Meeting" --start "2026-02-22T14:00:00"
```

## Docs

See `gog --help` or visit https://github.com/steipete/gog
EOF # Create gog skill