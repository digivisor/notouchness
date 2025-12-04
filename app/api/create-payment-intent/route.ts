/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/create-payment-intent/route.ts
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// ---- Helpers ---------------------------------------------------------------

function mapErrorCodeToReason(errorCode?: string): string {
  if (!errorCode) return 'general_error';
  const code = String(errorCode).toLowerCase();
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

function formatIyziDate(d = new Date()) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getClientIp(req: NextRequest) {
  const xff = req.headers.get('x-forwarded-for');
  const xri = req.headers.get('x-real-ip');
  if (xff) return xff.split(',')[0].trim();
  if (xri) return xri.trim();
  return '85.34.78.112'; // fallback
}

// ---- Route -----------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      orderNumber,
      customerEmail,
      customerName,
      customerPhone,
      billingAddress,
      cardNumber,
      cardHolderName,
      expireMonth,
      expireYear,
      cvc,
      installment = 1,
    } = await request.json();

    // Zorunlu alan kontrolleri (erken geri dön)
    if (
      !amount || !orderNumber || !customerEmail || !customerName ||
      !cardNumber || !cardHolderName || !expireMonth || !expireYear || !cvc
    ) {
      return NextResponse.json(
        { error: 'Eksik parametre', reason: 'missing_params' },
        { status: 400 }
      );
    }

    // Env & base URL seçimi
    const apiKey = (process.env.IYZICO_API_KEY || '').trim();
    const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
    if (!apiKey || !secretKey) {
      // Bilerek “kart matrisi”/fake başarı yok; key yoksa süreç başlatılamaz
      return NextResponse.json(
        { error: 'API key veya secret key bulunamadı', reason: 'missing_api_keys' },
        { status: 500 }
      );
    }

    const isSandbox = process.env.IYZICO_SANDBOX === 'true';
    let baseUrl = (process.env.IYZICO_URI || '').trim();
    if (!baseUrl) baseUrl = isSandbox ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com';
    // Eğer sandbox flag açık ama IYZICO_URI prod’a işaret ediyorsa yine sandbox’a zorlayalım:
    if (isSandbox && !baseUrl.includes('sandbox')) baseUrl = 'https://sandbox-api.iyzipay.com';

    // Callback URL'i dinamik olarak mevcut host üzerinden kur
    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const callbackUrl = `${siteUrl}/api/payment-callback`;
    const ip = getClientIp(request);

    // Buyer name parçalama
    const [firstName, ...rest] = String(customerName).trim().split(/\s+/);
    const lastName = rest.join(' ') || '-';

    // İstek gövdesi (3DS initialize)
    const requestBody: Record<string, unknown> = {
      locale: 'tr',
      conversationId: orderNumber,
      price: Number(amount).toFixed(2),
      paidPrice: Number(amount).toFixed(2),
      currency: 'TRY',
      installment: installment || 1,
      basketId: orderNumber,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl,
      paymentCard: {
        cardHolderName: cardHolderName,
        cardNumber: String(cardNumber).replace(/\s/g, ''),
        expireMonth: String(expireMonth).padStart(2, '0'),
        expireYear: String(expireYear).length === 2 ? `20${expireYear}` : String(expireYear),
        cvc: String(cvc),
        registerCard: '0',
      },
      buyer: {
        id: customerEmail,
        name: firstName || customerName,
        surname: lastName,
        gsmNumber: customerPhone || '',
        email: customerEmail,
        identityNumber: isSandbox ? '11111111111' : (process.env.DEFAULT_TCKN || '11111111111'),
        lastLoginDate: formatIyziDate(),
        registrationDate: formatIyziDate(),
        registrationAddress: billingAddress || 'Adres',
        ip,
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000',
      },
      shippingAddress: {
        contactName: customerName,
        city: 'Istanbul',
        country: 'Turkey',
        address: billingAddress || 'Adres',
        zipCode: '34000',
      },
      billingAddress: {
        contactName: customerName,
        city: 'Istanbul',
        country: 'Turkey',
        address: billingAddress || 'Adres',
        zipCode: '34000',
      },
      basketItems: [
        {
          id: orderNumber,
          name: 'Sipariş',
          category1: 'Genel',
          category2: '',
          itemType: 'PHYSICAL',
          price: Number(amount).toFixed(2),
        },
      ],
    };

    // İmza (IYZWSv2)
    const uriPath = '/payment/3dsecure/initialize';
    const rnd = Date.now().toString() + Math.floor(Math.random() * 1e9).toString();
    const requestString = JSON.stringify(requestBody);
    const payloadForHmac = rnd + uriPath + requestString;
    const signatureHex = crypto.createHmac('sha256', secretKey).update(payloadForHmac, 'utf8').digest('hex');
    const authPlain = `apiKey:${apiKey}&randomKey:${rnd}&signature:${signatureHex}`;
    const authHeader = `IYZWSv2 ${Buffer.from(authPlain, 'utf8').toString('base64')}`;

    // İstek
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

    let result: any = null;
    try {
      result = await res.json();
    } catch {
      // JSON değilse ham body’yi döndür
      const text = await res.text();
      return NextResponse.json(
        { error: 'Geçersiz yanıt', detail: text, reason: 'invalid_response' },
        { status: 502 }
      );
    }

    // Başarı → threeDSHtmlContent’i client’a ver
    if (result?.status === 'success' && result?.threeDSHtmlContent) {
      return NextResponse.json({
        paymentId: result.paymentId || null,
        threeDSHtmlContent: result.threeDSHtmlContent, // bazen base64 olabilir; client decode edebilir
        testMode: isSandbox,
      });
    }

    // Hata → iyzico’nun errorCode/errorMessage’ını aynen ilet + reason normalize
    const reason = mapErrorCodeToReason(result?.errorCode || result?.errorMessage);
    return NextResponse.json(
      {
        error: result?.errorMessage || 'Ödeme işlemi başlatılamadı',
        errorCode: result?.errorCode || 'GENERAL_ERROR',
        reason,
        testMode: isSandbox,
      },
      { status: 400 }
    );

  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || 'Payment initialization failed', reason: 'server_error' },
      { status: 500 }
    );
  }
}
