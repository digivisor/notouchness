import { NextRequest, NextResponse } from 'next/server';
import { cardDb } from '@/lib/supabase-cards';

export async function GET(
  request: NextRequest,
  { params }: { params: { username: string } }
) {
  const username = params.username;

  try {
    // Kartı Supabase'den çek
    const card = await cardDb.getByUsername(username);

    if (!card || !card.isActive) {
      return new NextResponse('Card not found', { status: 404 });
    }

    // VCard oluştur
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${card.fullName || 'Kullanıcı'}`,
      card.title ? `TITLE:${card.title}` : '',
      card.company ? `ORG:${card.company}` : '',
      card.phone ? `TEL;TYPE=CELL:${card.phone}` : '',
      card.email ? `EMAIL:${card.email}` : '',
      card.website ? `URL:${card.website}` : '',
      card.location ? `ADR:;;${card.location};;;;` : '',
      card.bio ? `NOTE:${card.bio}` : '',
      card.instagram ? `X-SOCIALPROFILE;TYPE=instagram:https://instagram.com/${card.instagram}` : '',
      card.linkedin ? `X-SOCIALPROFILE;TYPE=linkedin:https://linkedin.com/in/${card.linkedin}` : '',
      card.twitter ? `X-SOCIALPROFILE;TYPE=twitter:https://twitter.com/${card.twitter}` : '',
      'END:VCARD'
    ].filter(line => line !== '').join('\n');

    // VCF dosyası olarak döndür
    return new NextResponse(vcard, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${card.fullName || card.username || 'contact'}.vcf"`,
      },
    });
  } catch (error) {
    console.error('Error generating vCard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
