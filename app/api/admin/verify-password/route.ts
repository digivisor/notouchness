import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase credentials missing');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// SHA256 hash fonksiyonu
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Hash karşılaştırma - bcrypt veya SHA256 destekler
async function comparePassword(password: string, storedHash: string): Promise<boolean> {
  // bcrypt hash'leri genellikle 60 karakterdir ve $2a$, $2b$, $2y$ ile başlar
  if (storedHash.length === 60 && storedHash.startsWith('$2')) {
    // bcrypt hash'i
    return await bcrypt.compare(password, storedHash);
  } else {
    // SHA256 veya diğer hash algoritmaları
    const hashedPassword = hashPassword(password);
    return storedHash.toLowerCase().trim() === hashedPassword.toLowerCase().trim();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    // Users tablosundan kullanıcıyı bul
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('email, password_hash, is_admin')
      .eq('email', email)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı!' },
        { status: 401 }
      );
    }

    // password_hash kontrolü
    if (!userData.password_hash || userData.password_hash.trim() === '') {
      return NextResponse.json(
        { error: 'Bu hesap için şifre tanımlanmamış!' },
        { status: 401 }
      );
    }

    // Şifreyi hash ile karşılaştır (bcrypt veya SHA256)
    const storedHash = userData.password_hash || '';
    const isMatch = await comparePassword(password, storedHash);
    
    if (!isMatch) {
      return NextResponse.json(
        { error: 'E-posta veya şifre hatalı!' },
        { status: 401 }
      );
    }

    // Admin kontrolü
    if (!userData.is_admin) {
      return NextResponse.json(
        { error: 'Bu hesap admin yetkisine sahip değil!' },
        { status: 403 }
      );
    }

    // Başarılı - kullanıcı bilgilerini döndür
    return NextResponse.json({
      success: true,
      email: userData.email,
      is_admin: userData.is_admin,
    });

  } catch (error) {
    console.error('Password verification error:', error);
    return NextResponse.json(
      { error: 'Bir hata oluştu' },
      { status: 500 }
    );
  }
}

