/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/payment-callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/** ---- Reason normalizasyonu (UI için) ---- */
function mapErrorCodeToReason(errorCode?: string): string {
  const code = (errorCode || '').toLowerCase();
  if (code.includes('insufficient') || code.includes('funds')) return 'insufficient_funds';
  if (code.includes('invalid') && code.includes('card')) return 'invalid_card';
  if (code.includes('expired')) return 'expired_card';
  if (code.includes('stolen')) return 'stolen_card';
  if (code.includes('lost')) return 'lost_card';
  if (code.includes('fraud')) return 'fraud_suspect';
  if (code.includes('honour') || code.includes('do_not_honour')) return 'do_not_honour';
  if (code.includes('invalid') && code.includes('transaction')) return 'invalid_transaction';
  if (code.includes('not_permitted') || code.includes('permitted')) return 'not_permitted';
  if (code.includes('3dsecure')) return '3ds_failed';
  return 'general_error';
}

/** ---- Env & Base URL ---- */
function getIyziEnv() {
  const apiKey = (process.env.IYZICO_API_KEY || '').trim();
  const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
  const isSandbox = process.env.IYZICO_SANDBOX === 'true';

  let baseUrl = (process.env.IYZICO_URI || '').trim();
  if (!baseUrl) baseUrl = isSandbox ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com';
  if (isSandbox && !baseUrl.includes('sandbox')) baseUrl = 'https://sandbox-api.iyzipay.com';

  if (!apiKey || !secretKey) {
    throw new Error('missing_api_keys');
  }

  return { apiKey, secretKey, baseUrl, isSandbox };
}

function getSiteBaseUrl(req: NextRequest) {
  // Callback her zaman gelen isteğin host'u üzerinden dönsün
  const host = req.headers.get('host') || req.nextUrl.host;
  const protocol = req.nextUrl.protocol || 'http:';
  const url = `${protocol}//${host}`;
  console.log('[payment-callback] Site base URL:', url);
  return url;
}

/** ---- IYZWSv2 imzalı request helper ---- */
async function iyziPost<IReq extends Record<string, unknown>, IRes = any>(
  baseUrl: string,
  apiKey: string,
  secretKey: string,
  uriPath: string,
  body: IReq
): Promise<IRes> {
  const rnd = Date.now().toString() + Math.floor(Math.random() * 1e9).toString();
  const requestString = JSON.stringify(body); // pretty print yok!
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

  let json: any = null;
  try {
    json = await res.json();
  } catch {
    const text = await res.text();
    return {
      status: 'failure',
      errorMessage: `Invalid JSON response: ${text}`,
    } as any;
  }
  return json as IRes;
}

/** ---- 3DS Auth çağrısı ---- */
async function complete3DSAuth(paymentId: string, conversationId: string) {
  const { apiKey, secretKey, baseUrl } = getIyziEnv();
  const uriPath = '/payment/3dsecure/auth';
  const body = { locale: 'tr', conversationId, paymentId };
  return iyziPost<typeof body>(baseUrl, apiKey, secretKey, uriPath, body);
}

/** ---- Ortak callback handler ---- */
async function handleCallback(request: NextRequest, method: 'POST' | 'GET') {
  console.log('[handleCallback] Method:', method);
  console.log('[handleCallback] Request URL:', request.url);
  console.log('[handleCallback] Host header:', request.headers.get('host'));
  
  // Body/Query parse
  let conversationId: string | null = null;
  let paymentId: string | null = null;
  let mdStatus: string | null = null;
  let status: string | null = null;
  let errorCode: string | null = null;
  let errorMessage: string | null = null;

  try {
    if (method === 'POST') {
      const contentType = request.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const body = await request.json();
        conversationId = body.conversationId || body.conversation_id || null;
        paymentId = body.paymentId || body.payment_id || null;
        mdStatus = body.mdStatus || body.md_status || null;
        status = body.status || null;
        errorCode = body.errorCode || body.error_code || null;
        errorMessage = body.errorMessage || body.error_message || null;
      } else {
        const formData = await request.formData();
        conversationId = formData.get('conversationId')?.toString() || formData.get('conversation_id')?.toString() || null;
        paymentId = formData.get('paymentId')?.toString() || formData.get('payment_id')?.toString() || null;
        mdStatus = formData.get('mdStatus')?.toString() || formData.get('md_status')?.toString() || null;
        status = formData.get('status')?.toString() || null;
        errorCode = formData.get('errorCode')?.toString() || formData.get('error_code')?.toString() || null;
        errorMessage = formData.get('errorMessage')?.toString() || formData.get('error_message')?.toString() || null;
      }
    } else {
      const q = request.nextUrl.searchParams;
      conversationId = q.get('conversationId') || q.get('conversation_id');
      paymentId = q.get('paymentId') || q.get('payment_id');
      mdStatus = q.get('mdStatus') || q.get('md_status');
      status = q.get('status');
      errorCode = q.get('errorCode') || q.get('error_code');
      errorMessage = q.get('errorMessage') || q.get('error_message');
    }
  } catch (e) {
    // parse hatası
  }

  const siteUrl = getSiteBaseUrl(request);

  // 1) İlk kontroller
  if (status === 'failure' || status === 'error') {
    const reason = mapErrorCodeToReason(errorCode || errorMessage || undefined);
    
    // Eğer sipariş varsa "failed" olarak güncelle
    if (conversationId) {
      try {
        const { supabase } = await import('@/lib/supabase');
        await supabase
          .from('orders')
          .update({ payment_status: 'failed', order_status: 'failed' })
          .eq('order_number', conversationId);
      } catch (e) {
        console.error('Failed to update order status:', e);
        // Hata olsa bile devam et
      }
    }
    
    const qp = new URLSearchParams({
      reason,
      ...(errorCode ? { errorCode } : {}),
      ...(errorMessage ? { errorMessage } : {}),
    });
    return NextResponse.redirect(`${siteUrl}/checkout/hata?${qp.toString()}`, { status: 303 });
  }

  if (!conversationId || !paymentId) {
    return NextResponse.redirect(
      `${siteUrl}/checkout/hata?reason=missing_params`,
      { status: 303 }
    );
  }

  // 2) 3DS sonucu: sadece mdStatus === '1' && status === 'success' ise ödeme tamamlamaya geç
  const threeDSSuccess = status === 'success' && mdStatus === '1';
  if (!threeDSSuccess) {
    const reason = mdStatus === '0' ? '3ds_failed' : 'general_error';
    
    // Eğer sipariş varsa "failed" olarak güncelle (B2B veya normal order)
    if (conversationId) {
      try {
        const { supabase } = await import('@/lib/supabase');
        if (conversationId.startsWith('B2B-')) {
          // B2B purchase'ı failed yap
          await supabase
            .from('dealer_purchases')
            .update({ status: 'failed' })
            .like('notes', `%${conversationId}%`);
        } else {
          // Normal order'ı failed yap
          await supabase
            .from('orders')
            .update({ payment_status: 'failed', order_status: 'failed' })
            .eq('order_number', conversationId);
        }
      } catch (e) {
        console.error('Failed to update order/purchase status:', e);
        // Hata olsa bile devam et
      }
    }
    
    const qp = new URLSearchParams({
      reason,
      ...(mdStatus ? { mdStatus } : {}),
      ...(errorCode ? { errorCode } : {}),
      ...(errorMessage ? { errorMessage } : {}),
    });
    
    // B2B ise B2B hata sayfasına, değilse normal hata sayfasına
    if (conversationId && conversationId.startsWith('B2B-')) {
      return NextResponse.redirect(`${siteUrl}/b2b/payment/error?${qp.toString()}`, { status: 303 });
    }
    return NextResponse.redirect(`${siteUrl}/checkout/hata?${qp.toString()}`, { status: 303 });
  }

  // 3) ASIL ÖDEME: 3D Secure Auth (bankadan para çekiminin kesinleşmesi)
  let authResult: any;
  try {
    authResult = await complete3DSAuth(paymentId, conversationId);
    // Payment success olduğunda authResult'u loglama
    // console.log('Iyzico payment success authResult:', JSON.stringify(authResult, null, 2));
  } catch (e: any) {
    // Eğer sipariş varsa "failed" olarak güncelle (B2B veya normal order)
    if (conversationId) {
      try {
        const { supabase } = await import('@/lib/supabase');
        if (conversationId.startsWith('B2B-')) {
          await supabase
            .from('dealer_purchases')
            .update({ status: 'failed' })
            .like('notes', `%${conversationId}%`);
        } else {
          await supabase
            .from('orders')
            .update({ payment_status: 'failed', order_status: 'failed' })
            .eq('order_number', conversationId);
        }
      } catch (err) {
        console.error('Failed to update order/purchase status:', err);
      }
    }
    
    if (conversationId && conversationId.startsWith('B2B-')) {
      return NextResponse.redirect(`${siteUrl}/b2b/payment/error?reason=server_error`, { status: 303 });
    }
    return NextResponse.redirect(`${siteUrl}/checkout/hata?reason=server_error`, { status: 303 });
  }

  if (authResult?.status !== 'success') {
    const reason = mapErrorCodeToReason(authResult?.errorCode || authResult?.errorMessage);
    
    // Eğer sipariş varsa "failed" olarak güncelle (B2B veya normal order)
    if (conversationId) {
      try {
        const { supabase } = await import('@/lib/supabase');
        if (conversationId.startsWith('B2B-')) {
          await supabase
            .from('dealer_purchases')
            .update({ status: 'failed' })
            .like('notes', `%${conversationId}%`);
        } else {
          await supabase
            .from('orders')
            .update({ payment_status: 'failed', order_status: 'failed' })
            .eq('order_number', conversationId);
        }
      } catch (e) {
        console.error('Failed to update order/purchase status:', e);
        // Hata olsa bile devam et
      }
    }
    
    const qp = new URLSearchParams({
      reason,
      ...(authResult?.errorCode ? { errorCode: String(authResult.errorCode) } : {}),
      ...(authResult?.errorMessage ? { errorMessage: String(authResult.errorMessage) } : {}),
    });
    
    if (conversationId && conversationId.startsWith('B2B-')) {
      return NextResponse.redirect(`${siteUrl}/b2b/payment/error?${qp.toString()}`, { status: 303 });
    }
    return NextResponse.redirect(`${siteUrl}/checkout/hata?${qp.toString()}`, { status: 303 });
  }

  // 4) DB'de order'ı "paid" yap (veya B2B purchase'ı "completed" yap)
  try {
    const { supabase } = await import('@/lib/supabase');
    // Doğru transactionId: itemTransactions[0].paymentTransactionId
    let transactionId = undefined;
    if (authResult && Array.isArray(authResult.itemTransactions) && authResult.itemTransactions.length > 0) {
      transactionId = authResult.itemTransactions[0].paymentTransactionId;
    }
    
    // B2B satın alma kontrolü (order number B2B- ile başlıyorsa)
    if (conversationId && conversationId.startsWith('B2B-')) {
      const { error: updateError } = await supabase
        .from('dealer_purchases')
        .update({ 
          status: 'completed',
          notes: `Payment completed. Transaction ID: ${transactionId || 'N/A'}` 
        })
        .like('notes', `%${conversationId}%`);
      if (updateError) {
        console.error('B2B Purchase payment status update error:', updateError);
      } else {
        // B2B başarı: dashboard'a yönlendir (Kartlarım sekmesi ve success parametresi ile)
        return NextResponse.redirect(`${siteUrl}/b2b/dashboard?tab=my-cards&payment=success&order=${conversationId}`, { status: 303 });
      }
    } else {
      // Normal order güncellemesi
      const { error: updateError } = await supabase
        .from('orders')
        .update({ payment_status: 'paid', payment_transaction_id: transactionId })
        .eq('order_number', conversationId);
      if (updateError) {
        console.error('Order payment status update error:', updateError);
        // DB hatası ödeme başarısını değiştirmez; logla
      }
    }
  } catch (e) {
    console.error('Supabase import/update error:', e);
    // DB hatası ödeme başarısını değiştirmez; logla
  }

  // 5) Onay sayfası (B2B değilse normal checkout onay sayfasına)
  if (conversationId && conversationId.startsWith('B2B-')) {
    return NextResponse.redirect(`${siteUrl}/b2b/dashboard?tab=my-cards&payment=success&order=${conversationId}`, { status: 303 });
  }
  return NextResponse.redirect(`${siteUrl}/checkout/onay?payment=success&order=${conversationId}`, { status: 303 });
}

/** ---- HTTP Handlers ---- */
// Güvenlik açısından mümkünse bankadan gelen callback'in POST olması tercih edilir.
// Ama bazı bankalar/arayüzler GET de gönderebildiğinden destekliyoruz.

export async function POST(request: NextRequest) {
  console.log('[payment-callback] POST request received at:', new Date().toISOString());
  console.log('[payment-callback] URL:', request.url);
  try {
    const result = await handleCallback(request, 'POST');
    console.log('[payment-callback] POST result:', result.status);
    return result;
  } catch (e: any) {
    console.error('[payment-callback] POST error:', e);
    const siteUrl = getSiteBaseUrl(request);
    return NextResponse.redirect(`${siteUrl}/checkout/hata?reason=server_error`, { status: 303 });
  }
}

export async function GET(request: NextRequest) {
  console.log('[payment-callback] GET request received at:', new Date().toISOString());
  console.log('[payment-callback] URL:', request.url);
  try {
    const result = await handleCallback(request, 'GET');
    console.log('[payment-callback] GET result:', result.status);
    return result;
  } catch (e: any) {
    console.error('[payment-callback] GET error:', e);
    const siteUrl = getSiteBaseUrl(request);
    return NextResponse.redirect(`${siteUrl}/checkout/hata?reason=server_error`, { status: 303 });
  }
}
