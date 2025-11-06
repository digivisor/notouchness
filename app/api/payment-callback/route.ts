import { NextRequest, NextResponse } from 'next/server';

// iyzico callback'i POST request olarak gelir
export async function POST(request: NextRequest) {
  try {
    // iyzico callback body'sini al (form data veya JSON)
    const contentType = request.headers.get('content-type') || '';
    
    let conversationId: string | null = null;
    let paymentId: string | null = null;
    let mdStatus: string | null = null;

    if (contentType.includes('application/json')) {
      // JSON body
      const body = await request.json();
      conversationId = body.conversationId || body.conversation_id || null;
      paymentId = body.paymentId || body.payment_id || null;
      mdStatus = body.mdStatus || body.md_status || null;
    } else {
      // Form data
      const formData = await request.formData();
      conversationId = formData.get('conversationId')?.toString() || formData.get('conversation_id')?.toString() || null;
      paymentId = formData.get('paymentId')?.toString() || formData.get('payment_id')?.toString() || null;
      mdStatus = formData.get('mdStatus')?.toString() || formData.get('md_status')?.toString() || null;
    }

    console.log('iyzico callback received:', {
      conversationId,
      paymentId,
      mdStatus,
      contentType
    });

    // mdStatus kontrolü (1, 2, 3, 4 = başarılı)
    const successMd = ['1', '2', '3', '4'];
    const isSuccess = mdStatus && successMd.includes(mdStatus);

    if (!conversationId || !paymentId) {
      // Parametreler eksik - checkout'a error ile yönlendir
      return NextResponse.redirect(
        new URL(`/checkout?payment=error&reason=missing_params`, request.url)
      );
    }

    if (!isSuccess) {
      // 3D Secure başarısız - checkout'a error ile yönlendir
      return NextResponse.redirect(
        new URL(`/checkout?payment=error&reason=3ds_failed&mdStatus=${mdStatus}`, request.url)
      );
    }

    // Ödeme başarılı - checkout'a success ile yönlendir
    return NextResponse.redirect(
      new URL(`/checkout?payment=success&order=${conversationId}`, request.url)
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Payment callback failed';
    console.error('Payment callback error:', errorMessage);
    // Hata durumunda checkout'a error ile yönlendir
    return NextResponse.redirect(
      new URL(`/checkout?payment=error&reason=server_error`, request.url)
    );
  }
}

// GET request için de destek (bazı durumlarda GET ile gelebilir)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const conversationId = searchParams.get('conversationId') || searchParams.get('conversation_id');
  const paymentId = searchParams.get('paymentId') || searchParams.get('payment_id');
  const mdStatus = searchParams.get('mdStatus') || searchParams.get('md_status');

  console.log('iyzico callback GET received:', {
    conversationId,
    paymentId,
    mdStatus
  });

  // mdStatus kontrolü (1, 2, 3, 4 = başarılı)
  const successMd = ['1', '2', '3', '4'];
  const isSuccess = mdStatus && successMd.includes(mdStatus);

  if (!conversationId || !paymentId) {
    return NextResponse.redirect(
      new URL(`/checkout?payment=error&reason=missing_params`, request.url)
    );
  }

  if (!isSuccess) {
    return NextResponse.redirect(
      new URL(`/checkout?payment=error&reason=3ds_failed&mdStatus=${mdStatus}`, request.url)
    );
  }

  return NextResponse.redirect(
    new URL(`/checkout?payment=success&order=${conversationId}`, request.url)
  );
}

