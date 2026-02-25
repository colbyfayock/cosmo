import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';

const API_URL = 'https://api.trakt.tv';
const CONFIG_DIR = path.join(os.homedir(), '.config', 'trakt');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yaml');

export interface TraktConfig {
  'access-token'?: string;
  'refresh-token'?: string;
  'client-id'?: string;
  'client-secret'?: string;
}

export function loadTraktConfig(): TraktConfig {
  if (!fs.existsSync(CONFIG_FILE)) {
    throw new Error('Config not found at ' + CONFIG_FILE);
  }
  const content = fs.readFileSync(CONFIG_FILE, 'utf8');
  const config: TraktConfig = {};
  content.split('\n').forEach((line: string) => {
    const [key, ...valueParts] = line.split(':');
    if (key && valueParts.length) {
      (config as any)[key.trim()] = valueParts.join(':').trim();
    }
  });
  return config;
}

export function saveConfig(config: TraktConfig): void {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const content = Object.entries(config)
    .map(([key, value]) => key + ': ' + value)
    .join('\n');
  fs.writeFileSync(CONFIG_FILE, content);
}

export async function getClientId(): Promise<string> {
  const config = loadTraktConfig();
  if (config['client-id']) {
    return config['client-id'];
  }
  try {
    return execSync(
      'aws ssm get-parameter --name "/nanobot/TRAKT_CLIENT_ID" --with-decryption --query Parameter.Value --output text',
      { encoding: 'utf8' }
    ).trim();
  } catch {
    throw new Error('Client ID not found');
  }
}

export async function getClientSecret(): Promise<string> {
  const config = loadTraktConfig();
  if (config['client-secret']) {
    return config['client-secret'];
  }
  try {
    return execSync(
      'aws ssm get-parameter --name "/nanobot/TRAKT_CLIENT_SECRET" --with-decryption --query Parameter.Value --output text',
      { encoding: 'utf8' }
    ).trim();
  } catch {
    throw new Error('Client Secret not found');
  }
}

export async function refreshToken(): Promise<string> {
  const config = loadTraktConfig();
  const clientId = await getClientId();
  const clientSecret = await getClientSecret();

  const response = await fetch(API_URL + '/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      refresh_token: config['refresh-token'],
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      grant_type: 'refresh_token'
    })
  });

  if (!response.ok) {
    throw new Error('Token refresh failed: ' + response.status);
  }

  const data: any = await response.json();
  saveConfig({
    ...config,
    'access-token': data.access_token,
    'refresh-token': data.refresh_token
  });
  
  return data.access_token;
}

export async function getHeaders(): Promise<Record<string, string>> {
  const config = loadTraktConfig();
  const accessToken = config['access-token'];
  
  if (!accessToken) {
    throw new Error('No access token found');
  }
  
  return {
    'Content-Type': 'application/json',
    'trakt-api-version': '2',
    'trakt-api-key': await getClientId(),
    'Authorization': 'Bearer ' + accessToken
  };
}

export async function ensureValidToken(): Promise<void> {
  try {
    await getHeaders();
  } catch {
    await refreshToken();
  }
}

export interface TraktIds {
  trakt: number;
  slug: string;
  imdb: string;
  tmdb: number;
}

export interface TraktMovie {
  title: string;
  year: number;
  ids: TraktIds;
}

export interface TraktShow {
  title: string;
  year: number;
  ids: TraktIds;
}

export interface TraktItem {
  type: 'movie' | 'show';
  title: string;
  year: number;
  ids: TraktIds;
}

async function searchAPI(query: string, searchType: 'movie' | 'show'): Promise<TraktItem | null> {
  const headers = await getHeaders();
  const response = await fetch(API_URL + '/search/' + searchType + '?query=' + encodeURIComponent(query), {
    headers
  });
  
  if (!response.ok) {
    throw new Error('Search failed: ' + response.status);
  }
  
  const data: any = await response.json();
  if (!data || data.length === 0) {
    return null;
  }
  
  const item = data[0][searchType];
  return {
    type: searchType,
    title: item.title,
    year: item.year,
    ids: item.ids
  };
}

export async function searchItem(type: 'movie' | 'show', title: string): Promise<TraktItem | null> {
  return searchAPI(title, type);
}

export async function markWatched(type: 'movie' | 'show', title: string, season?: number, episode?: number): Promise<unknown> {
  const headers = await getHeaders();
  const item = await searchItem(type, title);
  
  if (!item) {
    throw new Error('Item not found: ' + title);
  }
  
  let url = API_URL + '/sync/history';
  let body: any;
  
  if (type === 'movie') {
    body = { movies: [{ ids: item.ids }] };
  } else {
    if (!season || !episode) {
      throw new Error('Season and episode required for shows');
    }
    body = { episodes: [{ ids: item.ids, season, episode }] };
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error('Mark watched failed: ' + response.status);
  }
  
  return response.json();
}

export async function rateItem(type: 'movie' | 'show', title: string, rating: number): Promise<unknown> {
  const headers = await getHeaders();
  const item = await searchItem(type, title);
  
  if (!item) {
    throw new Error('Item not found: ' + title);
  }
  
  let url = API_URL + '/sync/ratings';
  let body: any;
  
  if (type === 'movie') {
    body = { movies: [{ ids: item.ids, rating }] };
  } else {
    body = { shows: [{ ids: item.ids, rating }] };
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    throw new Error('Rate failed: ' + response.status);
  }
  
  return response.json();
}

export async function getHistory(type: 'movies' | 'shows' = 'movies', limit = 10): Promise<unknown> {
  const headers = await getHeaders();
  const response = await fetch(API_URL + '/users/me/history/' + type + '?limit=' + limit, {
    headers
  });
  
  if (!response.ok) {
    throw new Error('History failed: ' + response.status);
  }
  
  return response.json();
}

export async function getUser(): Promise<unknown> {
  const headers = await getHeaders();
  const response = await fetch(API_URL + '/users/me', {
    headers
  });
  
  if (!response.ok) {
    throw new Error('Get user failed: ' + response.status);
  }
  
  return response.json();
}
