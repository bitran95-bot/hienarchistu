import { afterEach, describe, expect, it, vi } from 'vitest';
import { client } from '../sanityClient';
import { fetchPublicContent } from './publicContent';

vi.mock('../sanityClient', () => ({ client: { fetch: vi.fn() } }));

describe('public content transport', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.mocked(client.fetch).mockReset(); });

  it('uses the same-origin Vercel endpoint on deployed domains', async () => {
    vi.stubGlobal('location', { hostname: 'preview.vercel.app' });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ projects: [] }), { status: 200 })));
    const result = await fetchPublicContent<{ projects: unknown[] }>('site', 'unused query', new AbortController().signal);
    expect(result).toEqual({ projects: [] });
    expect(fetch).toHaveBeenCalledWith('/api/public-content?kind=site', expect.objectContaining({ signal: expect.any(AbortSignal) }));
    expect(client.fetch).not.toHaveBeenCalled();
  });

  it('uses the public Sanity client on localhost', async () => {
    vi.stubGlobal('location', { hostname: 'localhost' });
    vi.mocked(client.fetch).mockResolvedValueOnce([]);
    await fetchPublicContent('products', 'product query', new AbortController().signal);
    expect(client.fetch).toHaveBeenCalledWith('product query', {}, expect.objectContaining({ signal: expect.any(AbortSignal) }));
  });
});
