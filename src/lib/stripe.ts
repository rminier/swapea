import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
  apiVersion: '2025-02-24.acacia' as Stripe.LatestApiVersion,
  typescript: true,
});

export const PLAN_PRICES: Record<string, { name: string; priceId: string; amount: number }> = {
  BASIC: {
    name: 'Basic Membership',
    priceId: process.env.STRIPE_BASIC_PRICE_ID || 'price_basic_mock',
    amount: 100, // $1.00
  },
  PREMIUM: {
    name: 'Premium Membership',
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID || 'price_premium_mock',
    amount: 500, // $5.00
  },
  VIP: {
    name: 'VIP Membership',
    priceId: process.env.STRIPE_VIP_PRICE_ID || 'price_vip_mock',
    amount: 2000, // $20.00
  },
};
