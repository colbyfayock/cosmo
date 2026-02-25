import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface CosmoConfig {
  user?: {
    name?: string;
    email?: string;
  };
  telegram?: {
    chatId?: string;
  };
}

export function loadConfig(): CosmoConfig | null {
  const configPaths = [
    path.join(os.homedir(), '.cosmo', 'config.json'),
    path.join(os.homedir(), '.nanobot', 'config.json'),
  ];

  for (const configPath of configPaths) {
    if (fs.existsSync(configPath)) {
      try {
        return JSON.parse(fs.readFileSync(configPath, 'utf8'));
      } catch {
        return null;
      }
    }
  }
  return null;
}
