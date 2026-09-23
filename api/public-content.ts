import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@sanity/client';
import { productsQuery, siteContentQuery } from '../lib/contentQueries';

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '29vr82eu',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-06-03',
  useCdn: true,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const kind = req.query.kind;
  if (kind !== 'site' && kind !== 'products') {
    return res.status(400).json({ error: 'Invalid content kind' });
  }
  try {
    const query = kind === 'site' ? siteContentQuery : productsQuery;
    const data: unknown = await client.fetch(query);
    res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
    return res.status(200).json(data);
  } catch (error) {
    console.error('Public content fetch failed:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Content unavailable' });
  }
}
