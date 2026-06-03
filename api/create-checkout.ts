import Stripe from 'stripe';
import type { VercelRequest, VercelResponse } from '@vercel/node';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Chỉ cho phép POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { productId, productName, price, currency = 'vnd' } = req.body;

    if (!productId || !productName || price == null) {
      return res.status(400).json({ error: 'Missing required fields: productId, productName, price' });
    }

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BASE_URL || 'http://localhost:3000';

    // Tạo Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency,
            product_data: {
              name: productName,
              metadata: { sanityProductId: productId },
            },
            unit_amount: Math.round(price), // VND không có decimal (1₫ = 1 unit)
          },
          quantity: 1,
        },
      ],
      metadata: {
        productId,
        productName,
      },
      success_url: `${baseUrl}/download?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/shop`,
    });

    return res.status(200).json({ url: session.url, sessionId: session.id });
  } catch (err: any) {
    console.error('Stripe checkout error:', err);
    return res.status(500).json({ error: err.message || 'Failed to create checkout session' });
  }
}
