import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { amount, currency, receipt } = await req.json();

  const key_id = process.env.RAZORPAY_KEY_ID!;
  const key_secret = process.env.RAZORPAY_KEY_SECRET!;

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Basic ' + Buffer.from(`${key_id}:${key_secret}`).toString('base64'),
    },
    body: JSON.stringify({
      amount, // in paise
      currency,
      receipt,
    }),
  });

  const data = await response.json();
  return NextResponse.json(data);
} 