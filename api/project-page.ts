import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import site from '../site.config.json';
import { projectPagesQuery } from '../lib/contentQueries.js';
import { projectSlug, renderProjectHtml, type ProjectForPage } from '../lib/projectPages.js';

const client = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || '29vr82eu',
  dataset: process.env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-06-03',
  useCdn: false,
});
const builder = createImageUrlBuilder(client);
const templatePath = join(process.cwd(), 'dist', 'index.html');

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD');
    return res.status(405).send('Method not allowed');
  }
  const slug = req.query.slug;
  if (typeof slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 120) {
    return res.status(404).send('Project not found');
  }
  try {
    const [projects, template] = await Promise.all([
      client.fetch<ProjectForPage[]>(projectPagesQuery),
      readFile(templatePath, 'utf8'),
    ]);
    const project = projects.find(item => projectSlug(item) === slug);
    if (!project) return res.status(404).send('Project not found');
    const source = project.image?.asset ? project.image
      : project.firstMagazineImage?.asset ? project.firstMagazineImage : project.firstGalleryImage;
    const image = source?.asset
      ? builder.image(source).width(1200).height(630).fit('crop').auto('format').url()
      : new URL('/og-image.png', site.url).toString();
    const html = renderProjectHtml(template, project, site.url, image);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(req.method === 'HEAD' ? '' : html);
  } catch (error) {
    console.error('Project page render failed:', error);
    return res.status(503).send('Project page temporarily unavailable');
  }
}
