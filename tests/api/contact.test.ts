// @vitest-environment node
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const { limit } = vi.hoisted(() => ({ limit: vi.fn() }));
vi.mock('@upstash/redis', () => ({ Redis: class {} }));
vi.mock('@upstash/ratelimit', () => ({
  Ratelimit: class {
    limit = limit;
    static slidingWindow() { return {}; }
  },
}));

const validBody = { name: 'Test <Studio>', email: 'test@example.com', message: 'A preview test only.' };

async function invoke(body: unknown = validBody, method = 'POST') {
  const { default: handler } = await import('../../api/contact');
  const req = { body, method, headers: { 'x-forwarded-for': '127.0.0.1' }, socket: {} } as VercelRequest;
  const res = { setHeader: vi.fn(), status: vi.fn().mockReturnThis(), json: vi.fn().mockReturnThis() };
  await handler(req, res as unknown as VercelResponse);
  return res;
}

describe('contact API', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('RESEND_API_KEY', 're_test_fake');
    vi.stubEnv('CONTACT_TO_EMAIL', 'owner@example.com');
    vi.stubEnv('CONTACT_FROM', 'Hiên <contact@example.com>');
    vi.stubEnv('UPSTASH_REDIS_REST_URL', '');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', '');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ id: 'email_test' }), { status: 200 })));
    limit.mockReset().mockResolvedValue({ success: true, limit: 5, remaining: 4, reset: Date.now() + 60_000 });
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => { vi.unstubAllEnvs(); vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it.each(['development', 'preview', 'production'])('never reports delivery without credentials in %s', async (environment) => {
    vi.stubEnv('VERCEL_ENV', environment);
    vi.stubEnv('RESEND_API_KEY', '');
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'contact_unavailable' });
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['CONTACT_FROM', 'CONTACT_TO_EMAIL'])('requires explicit %s', async (key) => {
    vi.stubEnv(key, '');
    expect((await invoke()).status).toHaveBeenCalledWith(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each([null, [], 'bad', {}, { ...validBody, name: {} }, { ...validBody, name: '   ' },
    { ...validBody, name: 'a'.repeat(101) }, { ...validBody, name: 'Bad\r\nHeader' },
    { ...validBody, email: 'invalid' }, { ...validBody, message: 'a'.repeat(5001) },
    { ...validBody, message: ' ' }])('rejects invalid input without sending', async (body) => {
    expect((await invoke(body)).status).toHaveBeenCalledWith(400);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('rejects unsupported methods', async () => {
    const res = await invoke(validBody, 'GET');
    expect(res.status).toHaveBeenCalledWith(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', 'POST');
    expect(fetch).not.toHaveBeenCalled();
  });

  it('sends escaped content and only confirms a provider-accepted email', async () => {
    const res = await invoke({ ...validBody, name: '  Test <Studio>  ' });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({ success: true });
    const call = vi.mocked(fetch).mock.calls[0];
    const payload = JSON.parse(call[1]?.body as string);
    expect(payload.to).toBe('owner@example.com');
    expect(payload.reply_to).toBe(validBody.email);
    expect(payload.html).toContain('Test &lt;Studio&gt;');
    expect(payload.html).not.toContain('Test <Studio>');
  });

  it.each([new Response('{}', { status: 200 }), new Response('not json', { status: 200 }),
    new Response('{}', { status: 429 }), new Response('{}', { status: 500 })])('does not confirm invalid or rejected provider responses', async (response) => {
    vi.mocked(fetch).mockResolvedValue(response);
    const res = await invoke();
    expect(res.json).toHaveBeenCalledWith({ success: false, error: 'contact_unavailable' });
  });

  it('handles provider network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('Offline'));
    expect((await invoke()).status).toHaveBeenCalledWith(503);
  });

  it('rejects partial Redis configuration', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test.example.com');
    expect((await invoke()).status).toHaveBeenCalledWith(503);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('returns rate limit feedback without sending', async () => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake');
    limit.mockResolvedValue({ success: false, limit: 5, reset: Date.now() + 60_000, remaining: 0 });
    const res = await invoke();
    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.setHeader).toHaveBeenCalledWith('Retry-After', expect.any(Number));
    expect(fetch).not.toHaveBeenCalled();
  });

  it.each(['reject', 'timeout'])('handles Redis %s without bypassing the limiter', async (failure) => {
    vi.stubEnv('UPSTASH_REDIS_REST_URL', 'https://test.example.com');
    vi.stubEnv('UPSTASH_REDIS_REST_TOKEN', 'fake');
    if (failure === 'reject') limit.mockRejectedValue(new Error('Offline'));
    else limit.mockResolvedValue({ success: true, reason: 'timeout' });
    expect((await invoke()).status).toHaveBeenCalledWith(503);
    expect(fetch).not.toHaveBeenCalled();
  });
});
