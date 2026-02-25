# Cosmo Agents

This repo contains packages and skills for personal AI assistant tooling.

## Personal Information Guidelines

**DO NOT commit personal information to this repo.**

- No API keys, tokens, or secrets
- No personal email addresses (except in config.json)
- No phone numbers, addresses, or PII

### Where to Store Personal Info

1. **Environment variables** - For runtime secrets
2. **config.json** - For non-secret personal preferences
3. **AWS SSM Parameter Store** - For secrets needed at runtime

### config.json

Personal configuration lives in `config.json` (gitignored):

```json
{
  "user": {
    "name": "Your Name",
    "email": "your@email.com"
  }
}
```
EOF # Create AGENTS.md