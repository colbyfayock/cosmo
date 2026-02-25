# Trakt Skill

*Movie/TV tracking via Trakt API*

## Usage

```bash
cosmo trakt <command> [options]
```

## Commands

### Auth (First Time)
```bash
# Step 1: Get authorization URL
cosmo trakt auth

# Step 2: After getting code from browser
cosmo trakt auth --code YOUR_AUTH_CODE
```

### Refresh Token
```bash
cosmo trakt refresh
```

### Search
```bash
cosmo trakt search --type movie --title "Inception"
cosmo trakt search --type show --title "Breaking Bad"
```

### Mark as Watched
```bash
cosmo trakt watched --type movie --title "Inception"
cosmo trakt watched --type show --title "Breaking Bad" --season 1 --episode 1
```

### Rate
```bash
cosmo trakt rate --type movie --title "Inception" --rating 8
```

### History
```bash
cosmo trakt history
cosmo trakt history --type shows --limit 20
```

### User Info
```bash
cosmo trakt me
```

## Options

- `--type, -t`: movie or show
- `--title, -m`: Title to search/mark
- `--rating, -r`: Rating (1-10)
- `--limit, -l`: Limit results (default: 10)
- `--code, -c`: Auth code for initial setup
- `--season`: Season number (for shows)
- `--episode`: Episode number (for shows)

## Rating Scale

- 10 - Masterpiece
- 9 - Amazing
- 8 - Great
- 7 - Good
- 6 - Fine
- 5 - Average
- 4 - Bad
- 3 - Terrible
- 2 - Painful
- 1 - Unwatchable
EOF # Update trakt skill