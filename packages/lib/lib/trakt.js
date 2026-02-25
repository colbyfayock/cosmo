import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execSync } from 'child_process';
const API_URL = 'https://api.trakt.tv';
const CONFIG_DIR = path.join(os.homedir(), '.config', 'trakt');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.yaml');
export function loadConfig() {
    if (!fs.existsSync(CONFIG_FILE)) {
        throw new Error('Config not found at ' + CONFIG_FILE);
    }
    const content = fs.readFileSync(CONFIG_FILE, 'utf8');
    const config = {};
    content.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length) {
            config[key.trim()] = valueParts.join(':').trim();
        }
    });
    return config;
}
export function saveConfig(config) {
    if (!fs.existsSync(CONFIG_DIR)) {
        fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const content = Object.entries(config)
        .map(([key, value]) => key + ': ' + value)
        .join('\n');
    fs.writeFileSync(CONFIG_FILE, content);
}
export async function getClientId() {
    try {
        return execSync('aws ssm get-parameter --name "/nanobot/TRAKT_CLIENT_ID" --with-decryption --query Parameter.Value --output text', { encoding: 'utf8' }).trim();
    }
    catch {
        throw new Error('Client ID not found');
    }
}
export async function getClientSecret() {
    try {
        return execSync('aws ssm get-parameter --name "/nanobot/TRAKT_CLIENT_SECRET" --with-decryption --query Parameter.Value --output text', { encoding: 'utf8' }).trim();
    }
    catch {
        throw new Error('Client Secret not found');
    }
}
export async function refreshToken() {
    const config = loadConfig();
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
    const data = await response.json();
    const newConfig = {
        'access-token': data.access_token,
        'refresh-token': data.refresh_token
    };
    saveConfig(newConfig);
    console.log('Tokens refreshed successfully');
    return data.access_token;
}
export async function getHeaders() {
    const config = loadConfig();
    const clientId = await getClientId();
    return {
        'Content-Type': 'application/json',
        'trakt-api-version': '2',
        'trakt-api-key': clientId,
        'Authorization': 'Bearer ' + config['access-token']
    };
}
export async function ensureValidToken() {
    const headers = await getHeaders();
    const response = await fetch(API_URL + '/users/me', { headers });
    if (response.status === 401) {
        console.log('Token expired, refreshing...');
        await refreshToken();
    }
    else if (!response.ok) {
        throw new Error('API error: ' + response.status);
    }
}
export async function searchItem(type, title) {
    await ensureValidToken();
    const headers = await getHeaders();
    const response = await fetch(API_URL + '/search/' + type + '?query=' + encodeURIComponent(title) + '&limit=10', { headers });
    if (!response.ok) {
        throw new Error('Search failed: ' + response.status);
    }
    const data = await response.json();
    if (!data || data.length === 0)
        return null;
    const yearMatch = title.match(/\b(19|20)\d{2}\b/);
    if (yearMatch) {
        const year = parseInt(yearMatch[0]);
        const exactMatch = data.find(item => (item[type]?.year ?? 0) === year);
        if (exactMatch)
            return exactMatch;
    }
    return data[0];
}
export async function markWatched(type, title, season, episode) {
    await ensureValidToken();
    const item = await searchItem(type, title);
    if (!item)
        throw new Error('Item not found');
    const headers = await getHeaders();
    const traktId = item[type].ids.trakt;
    let body = {};
    if (type === 'movie') {
        body = { movies: [{ ids: { trakt: traktId } }] };
    }
    else if (type === 'show') {
        if (season && episode) {
            body = {
                shows: [{
                        ids: { trakt: traktId },
                        seasons: [{ number: season, episodes: [{ number: episode }] }]
                    }]
            };
        }
        else {
            body = { shows: [{ ids: { trakt: traktId } }] };
        }
    }
    const response = await fetch(API_URL + '/sync/history', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error('Mark watched failed: ' + response.status);
    }
    return response.json();
}
export async function rateItem(type, title, rating) {
    await ensureValidToken();
    const item = await searchItem(type, title);
    if (!item)
        throw new Error('Item not found');
    const headers = await getHeaders();
    const traktId = item[type].ids.trakt;
    const body = {
        [type === 'movie' ? 'movies' : 'shows']: [{ ids: { trakt: traktId }, rating }]
    };
    const response = await fetch(API_URL + '/sync/ratings', {
        method: 'POST',
        headers,
        body: JSON.stringify(body),
    });
    if (!response.ok) {
        throw new Error('Rate failed: ' + response.status);
    }
    return response.json();
}
export async function getHistory(type = 'movies', limit = 10) {
    await ensureValidToken();
    const headers = await getHeaders();
    const response = await fetch(API_URL + '/sync/history/' + type + '?limit=' + limit, { headers });
    if (!response.ok) {
        throw new Error('Get history failed: ' + response.status);
    }
    return response.json();
}
export async function getUser() {
    await ensureValidToken();
    const headers = await getHeaders();
    const response = await fetch(API_URL + '/users/me', { headers });
    if (!response.ok) {
        throw new Error('Get user failed: ' + response.status);
    }
    return response.json();
}
