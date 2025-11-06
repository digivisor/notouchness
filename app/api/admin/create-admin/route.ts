import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Bu route sadece development'ta veya özel bir secret key ile çalışmalı
const ADMIN_CREATE_SECRET = process.env.ADMIN_CREATE_SECRET || 'dev-secret-key-change-in-production';

export async function POST(request: NextRequest) {
  try {
    // Secret key kontrolü
    const { secret, email, password, firstName, lastName } = await request.json();

    if (secret !== ADMIN_CREATE_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email ve şifre gerekli' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: 'Supabase credentials missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Supabase Auth'da kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName || 'Admin',
          last_name: lastName || 'User',
        }
      }
    });

    if (authError) {
      // Eğer kullanıcı zaten varsa, sadece users tablosunu güncelle
      if (authError.message.includes('already registered')) {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            email: email,
            first_name: firstName || 'Admin',
            last_name: lastName || 'User',
            is_admin: true,
            password_hash: '', // Dummy değer (Supabase Auth kullanıyoruz)
          }, {
            onConflict: 'email'
          });

        if (userError) {
          return NextResponse.json(
            { error: `Users tablosu güncelleme hatası: ${userError.message}` },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Admin kullanıcı güncellendi (zaten mevcuttu)',
          email
        });
      }

      return NextResponse.json(
        { error: `Auth hatası: ${authError.message}` },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: 'Kullanıcı oluşturulamadı' },
        { status: 500 }
      );
    }

    // 2. users tablosuna is_admin=true ile ekle
    // Not: password_hash Supabase Auth'da saklanıyor, burada gummy değer kullanıyoruz
    const { error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        first_name: firstName || 'Admin',
        last_name: lastName || 'User',
        is_admin: true,
        password_hash: '', // Dummy değer (Supabase Auth kullanıyoruz)
      });

    if (userError) {
      // Eğer zaten varsa, güncelle
      if (userError.code === '23505' || userError.message.includes('duplicate')) {
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('email', email);

        if (updateError) {
          return NextResponse.json(
            { error: `Güncelleme hatası: ${updateError.message}` },
            { status: 500 }
          );
        }
      } else {
        return NextResponse.json(
          { error: `Users tablosu ekleme hatası: ${userError.message}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Admin kullanıcı başarıyla oluşturuldu',
      email,
      userId: authData.user.id,
      note: 'İlk girişte email doğrulaması gerekebilir. Supabase Dashboard > Authentication > Users bölümünden verify edin.'
    });

  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json(
      { error: 'Beklenmeyen hata oluştu' },
      { status: 500 }
    );
  }
}

