import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';

const html = await readFile('dist/index.html', 'utf8');
const serviceWorker = await readFile('dist/sw.js', 'utf8');
const entry = html.match(/src="\/(assets\/index-[^"]+\.js)"/)?.[1];
assert.ok(entry, 'Missing JavaScript entry in dist/index.html');

const optionalAsset = /(?:DesktopCanvas|TextLayer|MagazineViewer)-[^/]+\.(?:js|css)$|(?:magazine\.glb|pdf\.worker\.min\.mjs)$/;
const preloads = [...html.matchAll(/rel="modulepreload"[^>]+href="\/([^"]+)"/g)].map((match) => match[1]);
const precached = [...serviceWorker.matchAll(/url:"([^"]+)"/g)].map((match) => match[1]);
assert.ok(!preloads.some((url) => optionalAsset.test(url)), '3D or PDF asset is preloaded on the homepage');
assert.ok(!precached.some((url) => optionalAsset.test(url)), '3D or PDF asset is downloaded during service worker installation');

const entryGzipBytes = gzipSync(await readFile(`dist/${entry}`)).length;
assert.ok(entryGzipBytes < 220 * 1024, `Homepage entry exceeds 220 KiB gzip (${entryGzipBytes} bytes)`);
console.log(`Bundle check passed: homepage entry ${Math.round(entryGzipBytes / 1024)} KiB gzip; ${precached.length} precached assets; optional 3D/PDF assets load on demand.`);
