import { readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const dist = join(root, 'dist');
const site = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));
const origin = new URL(site.url);
if (origin.protocol !== 'https:' || origin.pathname !== '/' || origin.search || origin.hash) {
  throw new Error('site.config.json url must be an HTTPS origin without a path.');
}

const template = await readFile(join(dist, 'index.html'), 'utf8');
const imageUrl = new URL('/og-image.png', origin).toString();
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

for (const [name, page] of Object.entries(site.pages)) {
  if (!page.path.startsWith('/')) throw new Error(`Invalid path for ${name}`);
  const url = new URL(page.path, origin).toString();
  const dom = new JSDOM(template);
  const { document } = dom.window;
  document.documentElement.lang = 'vi';
  document.title = page.title;
  document.head.querySelector('title')?.setAttribute('data-static-seo', '');

  setMeta(document, 'name', 'description', page.description);
  setMeta(document, 'property', 'og:title', page.title);
  setMeta(document, 'property', 'og:description', page.description);
  setMeta(document, 'property', 'og:type', 'website');
  setMeta(document, 'property', 'og:url', url);
  setMeta(document, 'property', 'og:image', imageUrl);
  setMeta(document, 'property', 'og:locale', 'vi_VN');
  setMeta(document, 'property', 'og:site_name', 'Hiên Archi Studio');
  setMeta(document, 'name', 'twitter:card', 'summary_large_image');
  setMeta(document, 'name', 'twitter:title', page.title);
  setMeta(document, 'name', 'twitter:description', page.description);
  setMeta(document, 'name', 'twitter:image', imageUrl);

  const canonical = document.head.querySelector('link[rel="canonical"]');
  if (page.index === false) {
    canonical?.remove();
    setMeta(document, 'name', 'robots', 'noindex, nofollow');
  } else {
    const link = canonical || document.createElement('link');
    link.rel = 'canonical';
    link.href = url;
    link.setAttribute('data-static-seo', '');
    if (!canonical) document.head.append(link);
  }

  const output = join(dist, name === 'home' ? 'index.html' : `${name}.html`);
  await writeFile(output, dom.serialize());
}

const sitemapUrls = Object.values(site.pages)
  .filter(page => page.index !== false)
  .map(page => `  <url><loc>${new URL(page.path, origin).toString()}</loc></url>`);
await writeFile(join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.join('\n')}\n</urlset>\n`);
await writeFile(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', origin)}\n`);
console.log(`SEO pages, sitemap and robots generated for ${origin}`);
