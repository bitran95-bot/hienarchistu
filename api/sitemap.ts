import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@sanity/client';
import { projectPagesQuery } from '../lib/contentQueries.js';
import { projectPath, renderSitemap, type ProjectForPage } from '../lib/projectPages.js';

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '29vr82eu',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-06-03',
  useCdn: false,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }
  try {
    const [projects, siteText] = await Promise.all([
      client.fetch<ProjectForPage[]>(projectPagesQuery),
      readFile(join(process.cwd(), 'site.config.json'), 'utf8'),
    ]);
    const site = JSON.parse(siteText) as { url: string; pages: Record<string, { path: string; index?: boolean }> };
    const paths = Object.values(site.pages)
      .filter(page => !('index' in page) || page.index !== false)
      .map(page => page.path);
    paths.push(...projects.map(projectPath));
    res.setHeader('Content-Type', 'application/xml; charset=utf-8');
    return res.status(200).send(req.method === 'HEAD' ? '' : renderSitemap(site.url, paths));
  } catch (error) {
    console.error('Sitemap generation failed:', error);
    return res.status(503).send('Sitemap temporarily unavailable');
  }
}
