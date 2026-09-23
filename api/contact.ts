import type { VercelRequest, VercelResponse } from '@vercel/node';

import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

// Initialize Redis only if keys are present (prevent crash in dev/build)
const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    }) 
  : null;

// Create a new ratelimiter, that allows 5 requests per 10 minutes
const ratelimit = redis ? new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, '10 m'),
  timeout: 2_000,
}) : null;

/**
 * Contact form API — chỉ báo thành công khi Resend xác nhận tiếp nhận email.
 *
 * Environment variables cần thiết:
 *   RESEND_API_KEY   — API key từ https://resend.com
 *   CONTACT_TO_EMAIL — Email nhận form (bắt buộc)
 *   CONTACT_FROM     — Sender hợp lệ của tài khoản/domain Resend (bắt buộc)
 *   UPSTASH_REDIS_REST_URL   — Redis URL cho Rate Limiting
 *   UPSTASH_REDIS_REST_TOKEN — Redis Token cho Rate Limiting
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body: unknown = req.body;
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return res.status(400).json({ success: false, error: 'invalid_input' });
  }
  const fields = body as Record<string, unknown>;
  if (typeof fields.name !== 'string' || typeof fields.email !== 'string' || typeof fields.message !== 'string') {
    return res.status(400).json({ success: false, error: 'invalid_input' });
  }
  const name = fields.name.trim();
  const email = fields.email.trim();
  const message = fields.message.trim();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!name || name.length > 100 || /[\r\n]/.test(name) || email.length > 254 ||
      !emailRegex.test(email) || !message || message.length > 5_000) {
    return res.status(400).json({ success: false, error: 'invalid_input' });
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY?.trim();
  const toEmail = process.env.CONTACT_TO_EMAIL?.trim();
  const fromEmail = process.env.CONTACT_FROM?.trim();
  // Apply this in every environment; local testing uses mocks, never fake delivery.
  if (!RESEND_API_KEY || !toEmail || !fromEmail) {
    return res.status(503).json({ success: false, error: 'contact_unavailable' });
  }
  if (!!process.env.UPSTASH_REDIS_REST_URL !== !!process.env.UPSTASH_REDIS_REST_TOKEN) {
    return res.status(503).json({ success: false, error: 'contact_unavailable' });
  }

  try {
    // Rate limit: 5 lần / 10 phút / IP
    if (ratelimit) {
      const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
      const identifier = (Array.isArray(ip) ? ip[0] : ip).split(',')[0].trim();
      const { success, limit, reset, remaining, reason } = await ratelimit.limit(`contact_${identifier}`);
      if (reason === 'timeout') {
        return res.status(503).json({ success: false, error: 'contact_unavailable' });
      }
      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', remaining);
      res.setHeader('X-RateLimit-Reset', reset);
      if (!success) {
        res.setHeader('Retry-After', Math.max(1, Math.ceil((reset - Date.now()) / 1000)));
        return res.status(429).json({ success: false, error: 'rate_limited' });
      }
    }

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      signal: AbortSignal.timeout(6_000),
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: toEmail,
        subject: `[Hiên Studio] Liên hệ mới từ ${name}`,
        reply_to: email,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #b45309;">📬 Tin nhắn mới từ website</h2>
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #666; border-bottom: 1px solid #eee;">Họ tên</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${escapeHtml(name)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 12px; font-weight: bold; color: #666; border-bottom: 1px solid #eee;">Email</td>
                <td style="padding: 8px 12px; border-bottom: 1px solid #eee;"><a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a></td>
              </tr>
            </table>
            <div style="background: #fdfbf7; padding: 16px 20px; border-left: 4px solid #b45309; margin: 20px 0; white-space: pre-wrap;">
              ${escapeHtml(message)}
            </div>
            <p style="color: #999; font-size: 12px; margin-top: 24px;">
              Gửi từ form liên hệ — hienarchi.studio
            </p>
          </div>
        `,
      }),
    });

    if (!response.ok) {
      console.error('Resend request rejected:', response.status);
      return res.status(502).json({ success: false, error: 'contact_unavailable' });
    }

    const result: unknown = await response.json();
    if (!result || typeof result !== 'object' || !('id' in result) || typeof result.id !== 'string' || !result.id) {
      return res.status(502).json({ success: false, error: 'contact_unavailable' });
    }
    return res.status(200).json({ success: true });
  } catch (err: unknown) {
    console.error('Contact service unavailable:', err instanceof Error ? err.name : 'UnknownError');
    return res.status(503).json({ success: false, error: 'contact_unavailable' });
  }
}

/** Escape HTML entities to prevent XSS in email body */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
