// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { JSDOM } from 'jsdom';

const { sanityFetch } = vi.hoisted(() => ({ sanityFetch: vi.fn() }));
vi.mock('@sanity/client', () => ({ createClient: () => ({ fetch: sanityFetch }) }));
vi.mock('@sanity/image-url', () => ({
  createImageUrlBuilder: () => ({
    image: () => {
      const chain = {
        width: () => chain,
        height: () => chain,
        fit: () => chain,
        auto: () => chain,
        url: () => 'https://cdn.sanity.io/cover.jpg',
      };
      return chain;
    },
  }),
}));
vi.mock('node:fs/promises', () => ({ readFile: vi.fn().mockResolvedValue('<!doctype html><html><head><title data-static-seo>Home</title><meta name="description" content="Home" data-static-seo><link rel="canonical" href="https://hienarchistu.vercel.app/" data-static-seo></head><body><noscript>Home</noscript><div id="root"></div><script src="/assets/index.js"></script></body></html>') }));

const initial = { _id: 'one', name: 'Nhà Trên Đồi', generalInfo: 'Đà Lạt' };
const future = { _id: 'two', name: 'New <Home>', slug: { current: 'new-home' }, generalInfo: 'New & published' };

function response() {
  return { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), send: vi.fn().mockReturnThis() };
}

describe('live project routes', () => {
  beforeEach(() => { sanityFetch.mockReset().mockResolvedValue([initial]); });

  it('serves a newly published project without changing the build', async () => {
    const { default: handler } = await import('../../api/project-page');
    const first = response();
    await handler({ method: 'GET', query: { slug: 'new-home' } } as unknown as VercelRequest, first as unknown as VercelResponse);
    expect(first.status).toHaveBeenCalledWith(404);

    sanityFetch.mockResolvedValue([initial, future]);
    const second = response();
    await handler({ method: 'GET', query: { slug: 'new-home' } } as unknown as VercelRequest, second as unknown as VercelResponse);
    expect(second.status).toHaveBeenCalledWith(200);
    const html = vi.mocked(second.send).mock.calls[0][0] as string;
    const document = new JSDOM(html).window.document;
    expect(document.title).toBe('New <Home> | Hiên Archi Studio');
    expect(document.querySelector('h1')?.textContent).toBe('New <Home>');
    expect(document.querySelector('link[rel="canonical"]')?.href).toBe('https://hienarchistu.vercel.app/projects/new-home');
    expect(document.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.querySelector('meta[property="og:type"]')?.content).toBe('article');
    expect(html).not.toContain('<h1>New <Home></h1>');
    expect(html).toContain('/assets/index.js');
  });

  it('updates the sitemap from the same published data', async () => {
    const { default: handler } = await import('../../api/sitemap');
    sanityFetch.mockResolvedValue([initial, future]);
    const res = response();
    await handler({ method: 'GET', query: {} } as unknown as VercelRequest, res as unknown as VercelResponse);
    expect(res.status).toHaveBeenCalledWith(200);
    const xml = vi.mocked(res.send).mock.calls[0][0] as string;
    expect(xml).toContain('<loc>https://hienarchistu.vercel.app/projects/new-home</loc>');
    expect(xml).not.toContain('/download');
  });
});
