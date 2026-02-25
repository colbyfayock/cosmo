import { execSync } from 'child_process';

export interface NASAResult {
  title: string;
  url: string;
  explanation: string;
  media_type: string;
  date: string;
}

async function robustFetch(url: string, timeout = 10): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout * 1000);
  
  try {
    const response = await fetch(url, { signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
}

export async function getNASAKey(): Promise<string> {
  try {
    return execSync(
      'aws ssm get-parameter --name "/nanobot/NASA_API_KEY" --with-decryption --query Parameter.Value --output text',
      { encoding: 'utf8' }
    ).trim();
  } catch {
    return 'DEMO_KEY';
  }
}

export async function getAPOD(): Promise<NASAResult | null> {
  try {
    const apiKey = await getNASAKey();
    const res = await robustFetch('https://api.nasa.gov/planetary/apod?api_key=' + apiKey, 10);
    if (res.ok) {
      const data = await res.json() as NASAResult;
      return {
        title: data.title,
        url: data.url,
        explanation: data.explanation ? data.explanation.substring(0, 150) + '...' : '',
        media_type: data.media_type,
        date: data.date
      };
    }
  } catch (e) {
    console.error('NASA error:', (e as Error).message);
  }
  return null;
}
