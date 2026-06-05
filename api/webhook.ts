import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const JWT_SECRET = process.env.DOWNLOAD_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('DOWNLOAD_JWT_SECRET environment variable is required. Set it in Vercel dashboard.');
}

// Webhook endpoint does not need to store used tokens.

/**
 * Tạo download token (JWT) chứa thông tin sản phẩm + hết hạn
 */
function createDownloadToken(productId: string, sessionId: string): string {
  const tokenId = crypto.randomUUID();
  return jwt.sign(
    {
      productId,
      sessionId,
      tokenId,
      type: 'download',
    },
    JWT_SECRET,
    { expiresIn: '30m' } // Token hết hạn sau 30 phút
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];

  // Nếu có webhook secret thì verify signature
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event: Stripe.Event;

  try {
    if (webhookSecret && sig) {
      // Cần raw body cho verify
      const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
      event = stripe.webhooks.constructEvent(rawBody, sig as string, webhookSecret);
    } else if (process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV === 'production') {
      // ❌ KHÔNG cho phép bypass signature verification trên production
      console.error('Webhook rejected: STRIPE_WEBHOOK_SECRET is required in production');
      return res.status(500).json({ error: 'Webhook not configured for production' });
    } else {
      // Dev/preview mode — cho phép test không verify signature
      console.warn('⚠️ Webhook signature verification skipped (dev mode)');
      event = req.body as Stripe.Event;
    }
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Xử lý event thanh toán thành công
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;

    if (session.payment_status === 'paid') {
      const productId = session.metadata?.productId;
      const productName = session.metadata?.productName;

      console.log(`✅ Payment succeeded for: ${productName} (${productId}), session: ${session.id}`);

      // Token sẽ được tạo khi user truy cập /download?session_id=xxx
      // Webhook chỉ log thành công
    }
  }

  return res.status(200).json({ received: true });
}

// Export helper function cho download route dùng
export { createDownloadToken, JWT_SECRET };
