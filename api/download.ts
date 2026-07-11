import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { createClient } from '@sanity/client';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Redis } from '@upstash/redis';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

const JWT_SECRET = process.env.DOWNLOAD_JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('DOWNLOAD_JWT_SECRET environment variable is required. Set it in Vercel dashboard.');
}

// ⚠️ LIMITATION: In-memory store resets on each cold start in serverless.
// We use Upstash Redis if configured, falling back to memory if not.
const usedTokensMemory = new Set<string>();

const redis = (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) 
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    })
  : null;

// Sanity client để lấy downloadUrl của sản phẩm
const sanityClient = createClient({
  projectId: process.env.VITE_SANITY_PROJECT_ID || process.env.SANITY_PROJECT_ID || '29vr82eu',
  dataset: process.env.VITE_SANITY_DATASET || process.env.SANITY_DATASET || 'production',
  apiVersion: '2025-06-03',
  useCdn: false, // Luôn lấy data mới nhất
  token: process.env.SANITY_API_TOKEN, // Cần nếu dataset private
});

/**
 * Tạo download token (JWT) sau khi verify thanh toán thành công
 */
function createDownloadToken(productId: string, sessionId: string): string {
  const tokenId = crypto.randomUUID();
  return jwt.sign(
    { productId, sessionId, tokenId, type: 'download' },
    JWT_SECRET,
    { expiresIn: '30m' }
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, session_id } = req.query;

  // ===== MODE 1: Có token → Verify và redirect tải file =====
  if (token && typeof token === 'string') {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        productId: string;
        sessionId: string;
        tokenId: string;
        type: string;
      };

      // Kiểm tra token type
      if (decoded.type !== 'download') {
        return res.status(403).json({ error: 'Invalid token type' });
      }

      // Kiểm tra token đã dùng chưa (anti-replay)
      let isUsed = false;
      if (redis) {
        const value = await redis.get(`token:${decoded.tokenId}`);
        isUsed = !!value;
      } else {
        isUsed = usedTokensMemory.has(decoded.tokenId);
      }

      if (isUsed) {
        return res.status(410).json({
          error: 'expired',
          message: 'Link tải đã được sử dụng. Vui lòng liên hệ hỗ trợ nếu cần tải lại.',
          message_en: 'This download link has already been used. Please contact support if you need to download again.',
        });
      }

      // Đánh dấu token đã sử dụng (expire sau 30 phút = 1800s)
      if (redis) {
        await redis.setex(`token:${decoded.tokenId}`, 1800, 'used');
      } else {
        usedTokensMemory.add(decoded.tokenId);
      }

      // Lấy downloadUrl từ Sanity
      const product = await sanityClient.fetch<{ downloadUrl?: string; name?: string }>(
        `*[_type == "product" && _id == $id][0]{ downloadUrl, name }`,
        { id: decoded.productId }
      );

      if (!product?.downloadUrl) {
        return res.status(404).json({
          error: 'Product download URL not found',
          message: 'File chưa sẵn sàng. Vui lòng liên hệ hỗ trợ.',
        });
      }

      // Redirect tới file thực tế
      return res.redirect(302, product.downloadUrl);

    } catch (err: unknown) {
      if ((err as { name?: string })?.name === 'TokenExpiredError') {
        return res.status(410).json({
          error: 'expired',
          message: 'Link tải đã hết hạn (30 phút). Vui lòng liên hệ hỗ trợ.',
          message_en: 'Download link has expired (30 minutes). Please contact support.',
        });
      }
      return res.status(403).json({ error: 'Invalid download token' });
    }
  }

  // ===== MODE 2: Có session_id → Verify payment và tạo token =====
  if (session_id && typeof session_id === 'string') {
    try {
      // Verify session payment status từ Stripe
      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== 'paid') {
        return res.status(402).json({
          error: 'Payment not completed',
          message: 'Thanh toán chưa hoàn tất.',
        });
      }

      const productId = session.metadata?.productId;
      if (!productId) {
        return res.status(400).json({ error: 'Product ID not found in session metadata' });
      }

      // Tạo download token
      const downloadToken = createDownloadToken(productId, session_id);

      const baseUrl = process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : process.env.BASE_URL || 'http://localhost:3000';

      // Trả về download URL (hoặc redirect)
      return res.status(200).json({
        success: true,
        downloadUrl: `${baseUrl}/api/download?token=${downloadToken}`,
        productName: session.metadata?.productName,
        expiresIn: '30 minutes',
      });

    } catch (err: unknown) {
      console.error('Session verification error:', err);
      return res.status(500).json({ error: 'Failed to verify payment session' });
    }
  }

  return res.status(400).json({ error: 'Missing token or session_id parameter' });
}
