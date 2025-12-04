import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import crypto from 'crypto';

// SHA256 hash fonksiyonu (client-side ile aynı)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı ve şifre gereklidir' },
        { status: 400 }
      );
    }

    // Bayiyi bul
    const { data: dealer, error: dealerError } = await supabase
      .from('dealers')
      .select('*')
      .eq('username', username)
      .eq('is_active', true)
      .single();

    if (dealerError || !dealer) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Şifreyi kontrol et
    const passwordHash = hashPassword(password);
    
    if (dealer.password_hash.toLowerCase().trim() !== passwordHash.toLowerCase().trim()) {
      return NextResponse.json(
        { success: false, error: 'Kullanıcı adı veya şifre hatalı' },
        { status: 401 }
      );
    }

    // Başarılı giriş
    return NextResponse.json({
      success: true,
      dealer: {
        id: dealer.id,
        name: dealer.name,
        email: dealer.email,
        username: dealer.username,
        logo_url: dealer.logo_url,
      },
    });
  } catch (error: any) {
    console.error('B2B login error:', error);
    return NextResponse.json(
      { success: false, error: 'Giriş yapılırken bir hata oluştu' },
      { status: 500 }
    );
  }
}

