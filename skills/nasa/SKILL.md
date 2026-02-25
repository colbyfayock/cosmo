# NASA Skill

*Get NASA Astronomy Picture of the Day via @cosmo/lib*

## Usage

Import from lib in scripts:
```typescript
import { getAPOD } from '@cosmo/lib';
const apod = await getAPOD();
```

## Package

`packages/lib/nasa.ts`

## API

NASA API key stored in AWS SSM: `/nanobot/NASA_API_KEY`
EOF # Update nasa skill