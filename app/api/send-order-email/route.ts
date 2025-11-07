import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
    image?: string; 
  }>;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: string;
}

export async function POST(request: NextRequest) {
  try {
    const data: OrderEmailData = await request.json();

    if (!process.env.YANDEX_EMAIL || !process.env.YANDEX_PASSWORD) {
      return NextResponse.json(
        { error: 'Email service is not configured' },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      host: 'smtp.yandex.com',
      port: 465,
      secure: true, 
      auth: {
        user: process.env.YANDEX_EMAIL, 
        pass: process.env.YANDEX_PASSWORD, 
      },
    });

    // Site URL'i (resimler için)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    
    // Email içeriğini oluştur (ürün resimleri ile)
    const itemsHtml = data.items.map(item => {
      // Ürün resmi URL'i - eğer relative path ise site URL'i ekle
      const imageUrl = item.image?.startsWith('http') 
        ? item.image 
        : `${siteUrl}${item.image?.startsWith('/') ? '' : '/'}${item.image || '/card-black.png'}`;
      
      return `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
            <tr>
              <td style="padding-right: 15px; vertical-align: middle; width: 60px;">
                <img src="${imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e5e7eb; display: block;" />
              </td>
              <td style="vertical-align: middle;">
                <span style="font-weight: 500; font-size: 15px; color: #111827; line-height: 1.4;">${item.name}</span>
              </td>
            </tr>
          </table>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center; vertical-align: middle;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: middle;">₺${item.price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: bold; vertical-align: middle;">₺${item.total.toFixed(2)}</td>
      </tr>
    `;
    }).join('');

    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f3f4f6;">
          <!-- Header with Logo -->
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px 8px 0 0; margin-bottom: 0; text-align: center; border-bottom: 2px solid #111827;">
            <img src="${siteUrl}/notouchness2.png" alt="Notouchness" style="max-width: 200px; height: auto; margin-bottom: 20px;" />
            <h1 style="color: #111827; margin: 0 0 10px 0; font-size: 28px;">Siparişiniz Alındı!</h1>
            <p style="color: #6b7280; margin: 0; font-size: 16px;">Merhaba ${data.customerName},</p>
          </div>
          
          <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 8px 8px; margin-bottom: 20px;">
            <p style="margin: 0 0 15px 0;">Siparişiniz başarıyla alındı ve işleme alındı. Sipariş detaylarınız aşağıda yer almaktadır.</p>
            
            <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin-bottom: 20px;">
              <p style="margin: 0; font-size: 12px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px;">Sipariş Numarası</p>
              <p style="margin: 5px 0 0 0; font-size: 24px; font-weight: bold; color: #111827; font-family: monospace;">${data.orderNumber}</p>
            </div>

            <h2 style="color: #111827; font-size: 18px; margin: 20px 0 10px 0;">Sipariş Detayları</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <thead>
                <tr style="background-color: #f9fafb;">
                  <th style="padding: 12px; text-align: left; border-bottom: 2px solid #e5e7eb; font-weight: 600; width: 50%;">Ürün</th>
                  <th style="padding: 12px; text-align: center; border-bottom: 2px solid #e5e7eb; font-weight: 600; width: 15%;">Adet</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600; width: 17.5%;">Birim Fiyat</th>
                  <th style="padding: 12px; text-align: right; border-bottom: 2px solid #e5e7eb; font-weight: 600; width: 17.5%;">Toplam</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>

            <div style="margin-top: 25px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Ara Toplam:</td>
                        <td style="text-align: right; font-weight: 600; font-size: 14px; color: #111827;">₺${data.subtotal.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="color: #6b7280; font-size: 14px;">Kargo:</td>
                        <td style="text-align: right; font-weight: 600; font-size: 14px; color: #111827;">${data.shippingCost === 0 ? 'Ücretsiz' : `₺${data.shippingCost.toFixed(2)}`}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding-top: 12px; padding-bottom: 12px; border-top: 2px solid #111827;">
                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%;">
                      <tr>
                        <td style="font-size: 18px; font-weight: bold; color: #111827;">Toplam:</td>
                        <td style="text-align: right; font-size: 20px; font-weight: bold; color: #111827;">₺${data.total.toFixed(2)}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </div>

            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
              <h3 style="color: #111827; font-size: 16px; margin: 0 0 10px 0;">Teslimat Adresi</h3>
              <p style="color: #6b7280; margin: 0; line-height: 1.8;">${data.shippingAddress}</p>
            </div>
          </div>

          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0 0 15px 0; color: #6b7280;">Siparişinizi takip etmek için:</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://notouchness.com'}/siparis-takip?order=${data.orderNumber}" 
               style="display: inline-block; background-color: #111827; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600;">
              Siparişimi Takip Et
            </a>
          </div>

          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
            <p style="color: #9ca3af; font-size: 12px; margin: 0;">Bu e-posta otomatik olarak gönderilmiştir. Destek için <a href="mailto:info@notouchness.com">info@notouchness.com</a> adresine mail gönderebilirsiniz.</p>
          </div>
        </body>
      </html>
    `;

    // Email gönder (Yandex SMTP)
    const mailOptions = {
      from: `"Notouchness" <${process.env.YANDEX_EMAIL}>`,
      to: data.customerEmail,
      subject: `Sipariş Onayı - ${data.orderNumber}`,
      html: emailHtml,
    };

    try {
      const info = await transporter.sendMail(mailOptions);
      return NextResponse.json({ 
        success: true, 
        messageId: info.messageId 
      });
    } catch (emailError) {
      // Email gönderilemedi ama sessizce devam et
      console.error('Yandex SMTP email error:', emailError);
      return NextResponse.json(
        { success: false, error: 'Failed to send email' },
        { status: 200 } // 200 döndür ki frontend'de hata olarak görünmesin
      );
    }

  } catch (error) {
    // Sessizce devam et
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 200 }
    );
  }
}

