# Pulsar Skill

*Daily newsletter with weather, Hacker News, and NASA APOD.*

## Usage

Run the script:
```bash
cd ~/.nanobot/workspace/packages/scripts && npx tsx pulsar.ts
```

## What It Does

- Weather for Exton, PA (19341) via Open-Meteo
- Top 3 Hacker News stories
- NASA Astronomy Picture of the Day

Sends to Telegram with the NASA photo.

## Cron

Pulsar runs automatically daily at 7:30am ET via nanobot cron.

## Agent Instructions

When running pulsar via cron with "[silent]" in the message, do NOT send any response after running the script. Just run it and remain silent.

## Manual Run

```bash
cd ~/.nanobot/workspace/packages/scripts && npx tsx pulsar.ts
```
EOF # Update pulsar skill