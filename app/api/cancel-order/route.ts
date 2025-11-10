import { NextRequest, NextResponse } from 'next/server';

import crypto from 'crypto';
import { supabase } from '@/lib/supabase';

function getIyziEnv() {
  const apiKey = (process.env.IYZICO_API_KEY || '').trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
  const isSandbox = process.env.IYZICO_SANDBOX === 'true';
  let baseUrl = (process.env.IYZICO_URI || '').trim();
  if (!baseUrl) baseUrl = isSandbox ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com';
  if (isSandbox && !baseUrl.includes('sandbox')) baseUrl = 'https://sandbox-api.iyzipay.com';
  if (!apiKey || !secretKey) throw new Error('missing_api_keys');
  return { apiKey, secretKey, baseUrl };
}

async function iyziRefund({ paymentTransactionId, price, ip }: { paymentTransactionId: string; price: number; ip: string }) {
  const { apiKey, secretKey, baseUrl } = getIyziEnv();
  const uriPath = '/payment/refund';
  const body = {
    locale: 'tr',
    paymentTransactionId,
    price: price.toString(),
    currency: 'TRY',
    ip,
    reason: 'buyer_request',
    description: 'Sipariş iptal edildi, para iadesi'
  };
  const rnd = Date.now().toString() + Math.floor(Math.random() * 1e9).toString();
  const requestString = JSON.stringify(body);
  const payloadForHmac = rnd + uriPath + requestString;
  const signatureHex = crypto.createHmac('sha256', secretKey).update(payloadForHmac, 'utf8').digest('hex');
  const authPlain = `apiKey:${apiKey}&randomKey:${rnd}&signature:${signatureHex}`;
  const authHeader = `IYZWSv2 ${Buffer.from(authPlain, 'utf8').toString('base64')}`;
  const res = await fetch(`${baseUrl}${uriPath}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Authorization': authHeader,
      'x-iyzi-rnd': rnd,
      'x-iyzi-client-version': 'iyzipay-node-2.0.50',
    },
    body: requestString,
  });
  let json = null;
  try {
    json = await res.json();
  } catch {
    json = { status: 'failure', errorMessage: 'Invalid JSON response' };
  }
  return json;
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { order_number } = body;

  // Sipariş bilgilerini Supabase'den çek
  const { data: order, error } = await supabase
    .from('orders')
    .select('*')
    .eq('order_number', order_number)
    .single();

  if (error || !order) {
    return NextResponse.json({ success: false, message: 'Sipariş bulunamadı.' }, { status: 404 });
  }

  // İyzico transactionId'yi bul
  const paymentTransactionId = order.payment_transaction_id;
  const price = order.total;

  if (!paymentTransactionId) {
    return NextResponse.json({ success: false, message: 'Ödeme transactionId bulunamadı.' }, { status: 400 });
  }

  // İyzico refund işlemi (REST API ile)
  const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const refundResult = await iyziRefund({ paymentTransactionId, price, ip });

  // Siparişi Supabase'de cancelled olarak güncelle
  await supabase
    .from('orders')
    .update({ order_status: 'cancelled', updated_at: new Date().toISOString() })
    .eq('order_number', order_number);

  return NextResponse.json({ success: true, message: 'Sipariş iptal edildi ve para iadesi yapıldı.' });
}
