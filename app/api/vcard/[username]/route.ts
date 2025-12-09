import { NextRequest, NextResponse } from 'next/server';
import { cardDb } from '@/lib/supabase-cards';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  try {
    // Kartı Supabase'den çek
    const card = await cardDb.getByUsername(username);

    if (!card || !card.isActive) {
      return new NextResponse('Card not found', { status: 404 });
    }

    const displayName = (card.fullName && card.fullName.trim()) || card.username || 'Kullanıcı';

    // Ad-soyad alanını N: için ayır
    let firstName = '';
    let lastName = '';
    const parts = (card.fullName || '').trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      lastName = parts.pop() || '';
      firstName = parts.join(' ');
    } else if (parts.length === 1) {
      firstName = parts[0];
    }

    // VCard oluştur
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${displayName}`,
      `N:${lastName};${firstName};;;`,
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
    const encoder = new TextEncoder();
    const uint8Array = encoder.encode(vcard);
    
    // Filename için ASCII-safe isim oluştur
    const safeFilename = (card.username || 'contact').replace(/[^a-zA-Z0-9]/g, '_');
    
    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'text/vcard; charset=utf-8',
        'Content-Disposition': `attachment; filename="${safeFilename}.vcf"`,
      },
    });
  } catch (error) {
    console.error('Error generating vCard:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
