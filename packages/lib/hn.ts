export interface HNItem {
  title: string;
  url: string;
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

export async function getTopStories(limit = 3): Promise<HNItem[]> {
  try {
    const res = await robustFetch('https://hn.algolia.com/api/v1/search?tags=front_page&hitsPerPage=' + limit, 10);
    if (res.ok) {
      const data = await res.json() as { hits: any[] };
      return data.hits.map((hit: any) => ({
        title: hit.title,
        url: hit.url || 'https://news.ycombinator.com/item?id=' + hit.objectID
      }));
    }
  } catch (e) {
    console.error('HN error:', (e as Error).message);
  }
  return [];
}
