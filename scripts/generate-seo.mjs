import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createClient } from '@sanity/client';
import { createImageUrlBuilder } from '@sanity/image-url';
import { JSDOM } from 'jsdom';
import { loadEnv } from 'vite';
import { projectPath, projectSlug } from '../src/utils/projectSlug.ts';

const root = process.cwd();
const dist = join(root, 'dist');
const site = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));
const origin = new URL(site.url);
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('site.config.json url must be an HTTPS origin without a path.');
}

const template = await readFile(join(dist, 'index.html'), 'utf8');
const defaultImageUrl = new URL('/og-image.png', origin).toString();
const setMeta = (document, attribute, key, value) => {
  let meta = document.head.querySelector(`meta[${attribute}="${key}"]`);
  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute(attribute, key);
    document.head.append(meta);
  }
  meta.setAttribute('content', value);
  meta.setAttribute('data-static-seo', '');
};

function renderPage({ title, description, url, image = defaultImageUrl, type = 'website', index = true, project }) {
  const dom = new JSDOM(template);
  const { document } = dom.window;
  document.documentElement.lang = 'vi';
  document.title = title;
  document.head.querySelector('title')?.setAttribute('data-static-seo', '');

  setMeta(document, 'name', 'description', description);
  setMeta(document, 'property', 'og:title', title);
  setMeta(document, 'property', 'og:description', description);
  setMeta(document, 'property', 'og:type', type);
  setMeta(document, 'property', 'og:url', url);
  setMeta(document, 'property', 'og:image', image);
  setMeta(document, 'property', 'og:locale', 'vi_VN');
  setMeta(document, 'property', 'og:site_name', 'Hiên Archi Studio');
  setMeta(document, 'name', 'twitter:card', 'summary_large_image');
  setMeta(document, 'name', 'twitter:title', title);
  setMeta(document, 'name', 'twitter:description', description);
  setMeta(document, 'name', 'twitter:image', image);

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (!index) {
    canonical?.remove();
    setMeta(document, 'name', 'robots', 'noindex, nofollow');
  } else {
    const link = canonical || document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    link.setAttribute('data-static-seo', '');
    if (!canonical) document.head.append(link);
  }

  if (project) {
    // This content is visible to crawlers and visitors before the client app loads.
    const main = document.createElement('main');
    const heading = document.createElement('h1');
    heading.textContent = project.name;
    main.append(heading);
    for (const value of [project.generalInfo, project.content]) {
      if (!value) continue;
      const paragraph = document.createElement('p');
      paragraph.textContent = value;
      main.append(paragraph);
    }
    if (image !== defaultImageUrl) {
      const picture = document.createElement('img');
      picture.src = image;
      picture.alt = project.name;
      main.append(picture);
    }
    document.getElementById('root')?.append(main);
  }

  return dom.serialize();
}

const sitemapUrls = [];
for (const [name, page] of Object.entries(site.pages)) {
  if (!page.path.startsWith('/')) throw new Error(`Invalid path for ${name}`);
  const url = new URL(page.path, origin).toString();
  const output = join(dist, name === 'home' ? 'index.html' : `${name}.html`);
  await writeFile(output, renderPage({ title: page.title, description: page.description, url, index: page.index !== false }));
  if (page.index !== false) sitemapUrls.push(url);
}

const env = loadEnv('production', root, 'VITE_');
const client = createClient({
  projectId: env.VITE_SANITY_PROJECT_ID || '29vr82eu',
  dataset: env.VITE_SANITY_DATASET || 'production',
  apiVersion: '2025-06-03',
  useCdn: false,
});
const builder = createImageUrlBuilder(client);
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 12000);
let projects;
try {
  projects = await client.fetch('*[_type == "project" && defined(name)]{_id,name,slug,generalInfo,content,image,"firstMagazineImage":magazinePages[0].images[0],"firstGalleryImage":gallery[0]}', {}, { signal: controller.signal });
} finally {
  clearTimeout(timeout);
}
if (!Array.isArray(projects) || projects.length === 0) {
  throw new Error('Sanity returned no projects; refusing to publish an empty project sitemap.');
}

await mkdir(join(dist, 'projects'), { recursive: true });
const slugs = new Set();
for (const project of projects) {
  const slug = projectSlug(project);
  if (slugs.has(slug)) throw new Error(`Duplicate project slug: ${slug}`);
  slugs.add(slug);
  const url = new URL(projectPath(project), origin).toString();
  const title = `${project.name} | Hiên Archi Studio`;
  const description = project.generalInfo?.replace(/\s+/g, ' ').trim().slice(0, 160) || site.pages.projects.description;
  const source = project.image?.asset ? project.image : project.firstMagazineImage?.asset ? project.firstMagazineImage : project.firstGalleryImage;
  const image = source?.asset
    ? builder.image(source).width(1200).height(630).fit('crop').auto('format').url()
    : defaultImageUrl;
  await writeFile(join(dist, 'projects', `${slug}.html`), renderPage({ title, description, url, image, type: 'article', project }));
  sitemapUrls.push(url);
}

const sitemapEntries = sitemapUrls.map(url => `  <url><loc>${url}</loc></url>`);
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join('\n')}\n</urlset>\n`);
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', origin)}\n`);
console.log(`SEO generated for ${site.url}: ${Object.keys(site.pages).length} site pages and ${projects.length} projects.`);
