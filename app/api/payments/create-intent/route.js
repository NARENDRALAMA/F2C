import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';
import Stripe from 'stripe';

export async function POST(request) {
  const { error } = await requireAuth(request);
  if (error) return error;

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey || stripeKey === 'sk_test_placeholder') {
    return NextResponse.json(
      {
        success: false,
        message: 'Stripe is not configured. Add STRIPE_SECRET_KEY to .env.local.',
      },
      { status: 400 }
    );
  }

  try {
    const stripe = new Stripe(stripeKey);
    const { amount, currency = 'aud' } = await request.json();
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
    });
    return NextResponse.json({ success: true, clientSecret: paymentIntent.client_secret });
  } catch (err) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
