import type { Page } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';

export const sanityQuery = /^https:\/\/[^/]+\.sanity\.io\/v[^/]+\/data\/query\//;
export const siteData = {
  projects: [{
    _id: 'project-test', name: 'Courtyard House', generalInfo: 'A test project in Vietnam',
    content: 'A quiet courtyard for family life.',
    image: { _type: 'image', asset: { _ref: 'image-aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa-1x1-png' } },
  }],
  settings: { title: 'Hiên Archi Studio', heroDescription: 'Architecture shaped by people and place.' },
};

export async function installFixtures(page: Page) {
  await page.addInitScript(() => { localStorage.setItem('hien-lang', 'en'); });
  // Fail closed for external services: E2E never depends on live CMS or sends email.
  await page.route('**/*', async route => {
    const url = new URL(route.request().url());
    if (url.hostname === '127.0.0.1') return route.continue();
    return route.abort();
  });
  await page.route(sanityQuery, route => {
    const query = new URL(route.request().url()).searchParams.get('query') || '';
    return route.fulfill({ json: { result: query.includes('_type == "product"') ? [] : siteData } });
  });
  await page.route('https://cdn.sanity.io/images/**', route => route.fulfill({
    contentType: 'image/png',
    body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aK1sAAAAASUVORK5CYII=', 'base64'),
  }));
  // Tiny neutral HDR, replacing Drei's external environment map in tests.
  await page.route(/\.hdr(?:\?|$)/, route => route.fulfill({
    contentType: 'application/octet-stream',
    body: Buffer.concat([Buffer.from('#?RADIANCE\nFORMAT=32-bit_rle_rgbe\n\n-Y 128 +X 256\n'), Buffer.alloc(256 * 128 * 4, 128)]),
  }));
  // Decode the real local GLB fixtures using Three's bundled Draco decoder.
  await page.route(/\/draco_(?:wasm_wrapper\.js|decoder\.wasm|decoder\.js)$/, async route => {
    const file = new URL(route.request().url()).pathname.split('/').pop()!;
    await route.fulfill({
      contentType: file.endsWith('.wasm') ? 'application/wasm' : 'text/javascript',
      body: await readFile(join(process.cwd(), 'node_modules/three/examples/jsm/libs/draco/gltf', file)),
    });
  });
}
