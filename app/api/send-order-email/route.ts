import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface OrderEmailData {
  customerName: string;
  customerEmail: string;
  orderNumber: string;
  orderDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: OrderEmailData = await request.json();

    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    // Email içeriğini oluştur
    const itemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">${item.name}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">₺${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold;">₺${item.total.toFixed(2)}</td>
      </tr>
    `).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="color: #111827; margin: 0 0 10px 0;">Siparişiniz Alındı!</h1>
            <p style="color: #6b7280; margin: 0;">Merhaba ${data.customerName},</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;">Siparişiniz başarıyla alındı ve işleme alındı. Sipariş detaylarınız aşağıda yer almaktadır.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Sipariş Numarası</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #111827; font-family: monospace;">${data.orderNumber}</p>
            </div>

            <h2 style="color: #111827; font-size: 18px; margin: 20px 0 10px 0;">Sipariş Detayları</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Ürün</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Adet</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Birim Fiyat</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600;">Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="border-top: 2px solid #e5e7eb; padding-top: 15px; margin-top: 20px;">
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Ara Toplam:</span>
                <span style="font-weight: 600;">₺${data.subtotal.toFixed(2)}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                <span style="color: #6b7280;">Kargo:</span>
                <span style="font-weight: 600;">${data.shippingCost === 0 ? 'Ücretsiz' : `₺${data.shippingCost.toFixed(2)}`}</span>
              </div>
              <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #111827;">
                <span style="font-size: 18px; font-weight: bold; color: #111827;">Toplam:</span>
                <span style="font-size: 20px; font-weight: bold; color: #111827;">₺${data.total.toFixed(2)}</span>
              </div>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3 style="color: #111827; font-size: 16px; margin: 0 0 10px 0;">Teslimat Adresi</h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.8;">${data.shippingAddress}</p>
            </div>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #6b7280;">Siparişinizi takip etmek için:</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/siparis-takip?order=${data.orderNumber}" 
               style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Siparişimi Takip Et
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayın.</p>
          </div>
        </body>
      </html>
    `;

    // Email gönder
    const { data: emailData, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: data.customerEmail,
      subject: `Sipariş Onayı - ${data.orderNumber}`,
      html: emailHtml,
    });

    if (error) {
      // Email gönderilemedi ama sessizce devam et (quota hatası vs. olabilir)
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 200 } // 200 döndür ki frontend'de hata olarak görünmesin
      );
    }

    return NextResponse.json({ 
      success: true, 
      messageId: emailData?.id 
    });

  } catch (error) {
    // Sessizce devam et
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 200 }
    );
  }
}

