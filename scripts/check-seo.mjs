import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';

const root = process.cwd();
const site = JSON.parse(await readFile(join(root, 'site.config.json'), 'utf8'));
const dist = join(root, 'dist');
const imageUrl = new URL('/og-image.png', site.url).toString();
const indexableUrls = [];

for (const [name, page] of Object.entries(site.pages)) {
  const html = await readFile(join(dist, name === 'home' ? 'index.html' : `${name}.html`), 'utf8');
  const document = new JSDOM(html).window.document;
  const url = new URL(page.path, site.url).toString();
  assert.equal(document.title, page.title, `${name} title`);
  assert.equal(document.querySelector('meta[name="description"]')?.content, page.description, `${name} description`);
  assert.equal(document.querySelector('meta[property="og:url"]')?.content, url, `${name} OG URL`);
  assert.equal(document.querySelector('meta[property="og:image"]')?.content, imageUrl, `${name} OG image`);
  assert.equal(document.querySelector('meta[name="twitter:image"]')?.content, imageUrl, `${name} Twitter image`);
  assert.ok(!html.includes('hienarchi.studio'), `${name} contains the retired domain`);
  assert.ok(!html.includes('__SITE_URL__'), `${name} contains an unresolved site URL`);
  if (page.index === false) {
    assert.match(document.querySelector('meta[name="robots"]')?.content || '', /noindex/, `${name} robots`);
    assert.equal(document.querySelector('link[rel="canonical"]'), null, `${name} canonical`);
  } else {
    assert.equal(document.querySelector('link[rel="canonical"]')?.href, url, `${name} canonical`);
    indexableUrls.push(url);
  }
}

const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');
for (const url of indexableUrls) assert.ok(sitemap.includes(`<loc>${url}</loc>`), `Sitemap missing ${url}`);
assert.ok(!sitemap.includes('/download'), 'Private download page is in sitemap');
assert.equal((sitemap.match(/<url>/g) || []).length, indexableUrls.length, 'Unexpected sitemap URLs');
const robots = await readFile(join(dist, 'robots.txt'), 'utf8');
assert.ok(robots.includes(`Sitemap: ${new URL('/sitemap.xml', site.url)}`), 'Robots sitemap URL');
console.log(`SEO check passed: ${indexableUrls.length} canonical pages and one noindex download page.`);
