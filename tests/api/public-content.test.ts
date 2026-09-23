// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const { sanityFetch } = vi.hoisted(() => ({ sanityFetch: vi.fn() }));
vi.mock('@sanity/client', () => ({ createClient: () => ({ fetch: sanityFetch }) }));

async function invoke(kind: unknown, method = 'GET') {
  const { default: handler } = await import('../../api/public-content');
  const req = { method, query: { kind } } as unknown as VercelRequest;
  const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  await handler(req, res as unknown as VercelResponse);
  return res;
}

describe('public content API', () => {
  beforeEach(() => { sanityFetch.mockReset().mockResolvedValue({ projects: [], settings: null }); });

  it('only accepts the two fixed public queries', async () => {
    expect((await invoke('site')).status).toHaveBeenCalledWith(200);
    expect((await invoke('products')).status).toHaveBeenCalledWith(200);
    expect(sanityFetch).toHaveBeenCalledTimes(2);
    expect(sanityFetch.mock.calls[0][0]).toContain('_type == "project"');
    expect(sanityFetch.mock.calls[1][0]).toContain('_type == "product"');
    expect((await invoke('*[_type == "secret"]')).status).toHaveBeenCalledWith(400);
    expect(sanityFetch).toHaveBeenCalledTimes(2);
  });

  it('rejects writes and does not cache Sanity failures', async () => {
    expect((await invoke('site', 'POST')).status).toHaveBeenCalledWith(405);
    sanityFetch.mockRejectedValueOnce(new Error('CMS unavailable'));
    const res = await invoke('site');
    expect(res.status).toHaveBeenCalledWith(502);
    expect(res.setHeader).toHaveBeenCalledWith('Cache-Control', 'no-store');
  });
});
