import { client } from '../sanityClient';

export async function fetchPublicContent<T>(kind: 'site' | 'products', query: string, signal: AbortSignal): Promise<T> {
  // The Vite dev/preview server does not run Vercel Functions. Deployed sites
  // use the same-origin endpoint so every Preview URL works without Sanity CORS entries.
  if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
    return client.fetch<T>(query, {}, { signal });
  }
  const response = await fetch(`/api/public-content?kind=${kind}`, { signal });
  if (!response.ok) throw new Error(`Content request failed (${response.status})`);
  return response.json() as Promise<T>;
}
