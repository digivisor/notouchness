import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// iyzico tarih formatı: 'YYYY-MM-DD HH:mm:ss'
function formatIyziDate(d = new Date()) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hour = pad(d.getHours());
  const minute = pad(d.getMinutes());
  const second = pad(d.getSeconds());
  return `${year}-${month}-${day} ${hour}:${minute}:${second}`;
}

// iyzico Test Modu (Sandbox) - Gerçek ödeme yapılmaz, sadece simüle edilir
export async function POST(request: NextRequest) {
  try {
    const { 
      amount, 
      orderNumber, 
      customerEmail, 
      customerName, 
      customerPhone, 
      billingAddress,
      // 3D Secure için kart bilgileri
      cardNumber,
      cardHolderName,
      expireMonth,
      expireYear,
      cvc,
      installment = 1
    } = await request.json();

    // Test modunda payment simülasyonu
    // API key yoksa veya secret key yoksa test modu
    const isTestMode = !process.env.IYZICO_API_KEY || !process.env.IYZICO_SECRET_KEY;
    
    if (isTestMode) {
      // iyzico Sandbox - Test modu
      // Gerçek ödeme yapılmaz, sadece simüle edilir
      const testPaymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      return NextResponse.json({
        paymentId: testPaymentId,
        testMode: true,
        message: 'iyzico test modu aktif - ödeme simüle edildi',
        amount: amount
      });
    }

    // Production modu için iyzico REST API entegrasyonu
    // API key'lerin başındaki/sonundaki boşlukları temizle
    const apiKey = (process.env.IYZICO_API_KEY || '').trim();
    const secretKey = (process.env.IYZICO_SECRET_KEY || '').trim();
    
    if (!apiKey || !secretKey) {
      return NextResponse.json(
        { error: 'API key veya secret key bulunamadı' },
        { status: 500 }
      );
    }
    
    // Sandbox için: https://sandbox-api.iyzipay.com
    // Production için: https://api.iyzipay.com
    // API key sandbox ile başlıyorsa otomatik sandbox URL kullan
    const isSandbox = apiKey.startsWith('sandbox') || apiKey.includes('sandbox') || process.env.IYZICO_SANDBOX === 'true';
    
    // IYZICO_URI set edilmişse onu kullan, yoksa sandbox kontrolüne göre URL belirle
    let baseUrl = process.env.IYZICO_URI;
    if (!baseUrl) {
      baseUrl = isSandbox ? 'https://sandbox-api.iyzipay.com' : 'https://api.iyzipay.com';
    } else if (isSandbox && !baseUrl.includes('sandbox')) {
      // IYZICO_URI set edilmiş ama sandbox API key kullanılıyorsa sandbox URL'e zorla
      baseUrl = 'https://sandbox-api.iyzipay.com';
    }
    
    console.log('iyzico URL detection:', {
      apiKeyPrefix: apiKey.substring(0, 10),
      isSandbox: isSandbox,
      baseUrl: baseUrl
    });

    // Müşteri adını ayır
    const nameParts = customerName.split(' ');
    const firstName = nameParts[0] || customerName;
    const lastName = nameParts.slice(1).join(' ') || '';

    // iyzico 3D Secure ödeme isteği oluştur (threedsInitialize için)
    // Key sıralaması önemli olabilir - iyzico'nun beklediği sıralama
    const requestBody: any = {
      locale: 'tr',
      conversationId: orderNumber,
      price: amount.toFixed(2),
      paidPrice: amount.toFixed(2),
      currency: 'TRY',
      installment: installment || 1,
      basketId: orderNumber,
      paymentChannel: 'WEB',
      paymentGroup: 'PRODUCT',
      callbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/payment-callback`,
      paymentCard: {
        cardHolderName: cardHolderName || 'TEST KARTI',
        cardNumber: cardNumber ? cardNumber.replace(/\s/g, '') : '',
        expireMonth: expireMonth || '12',
        expireYear: expireYear || '25',
        cvc: cvc || '123',
        registerCard: '0'
      },
      buyer: {
        id: customerEmail,
        name: firstName,
        surname: lastName,
        gsmNumber: customerPhone || '',
        email: customerEmail,
        identityNumber: '11111111111', // Test için, production'da gerçek TC kimlik no
        lastLoginDate: formatIyziDate(new Date()),
        registrationDate: formatIyziDate(new Date()),
        registrationAddress: billingAddress || 'Adres',
        ip: '85.34.78.112',
        city: 'Istanbul',
        country: 'Turkey',
        zipCode: '34000'
      },
      shippingAddress: {
        contactName: customerName,
        city: 'Istanbul',
        country: 'Turkey',
        address: billingAddress || 'Adres',
        zipCode: '34000'
      },
      billingAddress: {
        contactName: customerName,
        city: 'Istanbul',
        country: 'Turkey',
        address: billingAddress || 'Adres',
        zipCode: '34000'
      },
      basketItems: [
        {
          id: orderNumber,
          name: 'Sipariş',
          category1: 'Genel',
          category2: '',
          itemType: 'PHYSICAL',
          price: amount.toFixed(2)
        }
      ]
    };

    // iyzico IYZWSv2 signature oluştur
    // Endpoint path'i - 3D Secure için threedsInitialize
    const uriPath = '/payment/3dsecure/initialize';
    
    // randomKey oluştur (timestamp + random number)
    const randomKey = Date.now().toString() + Math.floor(Math.random() * 1e9).toString();
    
    // JSON.stringify ile request body'yi string'e çevir
    const requestString = JSON.stringify(requestBody, null, 0);
    
    // IYZWSv2 signature hesaplama: randomKey + uriPath + requestString
    const payloadForHmac = randomKey + uriPath + requestString;
    
    // HMAC SHA256 ile encryptedData oluştur (hex formatında)
    const encryptedDataHex = crypto
      .createHmac('sha256', secretKey)
      .update(payloadForHmac, 'utf8')
      .digest('hex');
    
    // Authorization string'i oluştur ve Base64 encode et
    const authPlain = `apiKey:${apiKey}&randomKey:${randomKey}&signature:${encryptedDataHex}`;
    const base64Encoded = Buffer.from(authPlain, 'utf8').toString('base64');
    
    // Debug: Signature hesaplama detayları
    console.log('iyzico IYZWSv2 signature calculation:', {
      randomKey: randomKey.substring(0, 15) + '...',
      uriPath: uriPath,
      requestStringLength: requestString.length,
      payloadForHmacLength: payloadForHmac.length,
      encryptedDataHex: encryptedDataHex.substring(0, 20) + '...',
      authPlain: authPlain.substring(0, 50) + '...',
      base64Encoded: base64Encoded.substring(0, 30) + '...'
    });
    
    // Request body'nin ilk 200 karakterini logla
    console.log('iyzico request body preview:', requestString.substring(0, 200));

    // iyzico API'ye istek gönder
    try {
      // IYZWSv2 headers'ı oluştur
      const headers: Record<string, string> = {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `IYZWSv2 ${base64Encoded}`,
        'x-iyzi-rnd': randomKey,
        'x-iyzi-client-version': 'iyzipay-node-2.0.50'
      };
      
      console.log('iyzico IYZWSv2 request headers:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'].substring(0, 40) + '...',
        'x-iyzi-rnd': headers['x-iyzi-rnd'].substring(0, 15) + '...',
        'x-iyzi-client-version': headers['x-iyzi-client-version']
      });
      
      // Güncel endpoint'i kullan
      const response = await fetch(`${baseUrl}${uriPath}`, {
        method: 'POST',
        headers: headers,
        body: requestString
      });

      const result = await response.json();
      
      // Debug: Response'u logla
      console.log('iyzico API response:', {
        status: result.status,
        errorCode: result.errorCode,
        errorMessage: result.errorMessage,
        statusCode: response.status
      });

      if (result.status === 'success') {
        return NextResponse.json({
          paymentId: result.paymentId,
          threeDSHtmlContent: result.threeDSHtmlContent,
          testMode: false
        });
      } else {
        console.error('iyzico error:', result);
        // Production modunda API hatası varsa hata döndür
        // Signature hatası veya geçersiz istek hatası da dahil - sipariş kaydı durmalı
        return NextResponse.json(
          { 
            error: result.errorMessage || 'Ödeme işlemi başlatılamadı',
            errorCode: result.errorCode,
            testMode: false
          },
          { status: 500 }
        );
      }
    } catch (apiError: any) {
      console.error('iyzico API error:', apiError);
      // Production modunda API hatası varsa hata döndür
      return NextResponse.json(
        { 
          error: 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.',
          testMode: false
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('Payment initialization error:', error);
    return NextResponse.json(
      { error: error.message || 'Payment initialization failed' },
      { status: 500 }
    );
  }
}
