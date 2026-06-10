import type { VercelRequest, VercelResponse } from '@vercel/node';

/**
 * Contact form API — gửi email thông qua Resend hoặc fallback log.
 *
 * Environment variables cần thiết:
 *   RESEND_API_KEY   — API key từ https://resend.com (free tier: 100 emails/day)
 *   CONTACT_TO_EMAIL — Email nhận form (default: thaibao95arc@gmail.com)
 *   CONTACT_FROM     — Email gửi (default: onboarding@resend.dev cho Resend free tier)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, message } = req.body || {};

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Missing required fields: name, email, message' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Rate limit: simple check (cùng IP gửi tối đa 5 lần / 10 phút)
  // Production nên dùng Upstash Redis rate limiter

  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  const toEmail = process.env.CONTACT_TO_EMAIL || 'thaibao95arc@gmail.com';
  const fromEmail = process.env.CONTACT_FROM || 'Hiên Studio <onboarding@resend.dev>';

  if (!RESEND_API_KEY) {
    // Dev mode: log thay vì gửi email thật
    console.log('📧 Contact form submission (RESEND_API_KEY not set):');
    console.log(`   From: ${name} <${email}>`);
    console.log(`   Message: ${message}`);
    return res.status(200).json({ success: true, mode: 'dev-log' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
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
      const errData = await response.json().catch(() => ({}));
      console.error('Resend API error:', errData);
      return res.status(500).json({ error: 'Failed to send email' });
    }

    return res.status(200).json({ success: true });
  } catch (err: any) {
    console.error('Contact form error:', err);
    return res.status(500).json({ error: 'Internal server error' });
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
