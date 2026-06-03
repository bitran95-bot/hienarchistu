import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const JWT_SECRET = process.env.DOWNLOAD_JWT_SECRET || 'hien-archi-download-secret-change-me';

// In-memory store cho used tokens (Vercel serverless = ngắn hạn, OK cho anti-replay cơ bản)
// Trong production nên dùng Vercel KV hoặc Redis
const usedTokens = new Set<string>();

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
    } else {
      // Test mode — không verify signature (chỉ dùng khi dev)
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
export { createDownloadToken, JWT_SECRET, usedTokens };
