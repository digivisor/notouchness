/**
 * Admin Kullanıcı Oluşturma Scripti
 * 
 * Kullanım:
 * 1. .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY olmalı
 * 2. Terminal'de çalıştır: npx tsx scripts/create-admin-user.ts
 * 
 * Veya Supabase Dashboard'dan SQL Editor'da:
 * - Authentication > Users > Add User (email/password ile)
 * - Sonra SQL Editor'da: UPDATE auth.users SET ... (veya users tablosuna INSERT)
 */

import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';

// .env.local dosyasını yükle
function loadEnvFile() {
  const envPath = path.join(process.cwd(), '.env.local');
  if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf-8');
    envFile.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value;
        }
      }
    });
  }
}

loadEnvFile();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable\'ları gerekli!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createAdminUser() {
  // Kullanıcıdan bilgileri al
  const email = process.argv[2] || 'admin@notouchness.com';
  const password = process.argv[3] || 'notouchness@digivisor!';
  const firstName = process.argv[4] || 'Notouchness';
  const lastName = process.argv[5] || 'Digivisor';

  console.log('🔐 Admin kullanıcı oluşturuluyor...');
  console.log(`📧 Email: ${email}`);
  console.log(`👤 İsim: ${firstName} ${lastName}`);

  try {
    // 1. Supabase Auth'da kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
        }
      }
    });

    if (authError) {
      console.error('❌ Auth hatası:', authError.message);
      
      // Eğer kullanıcı zaten varsa, sadece users tablosunu güncelle
      if (authError.message.includes('already registered') || authError.message.includes('already exists')) {
        console.log('⚠️  Kullanıcı zaten mevcut, users tablosunu güncelleniyor...');
        
        // users tablosuna is_admin=true ile ekle/güncelle
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            email: email,
            first_name: firstName,
            last_name: lastName,
            is_admin: true,
            password_hash: '', // Dummy değer (Supabase Auth kullanıyoruz)
          }, {
            onConflict: 'email'
          });

        if (userError) {
          console.error('❌ Users tablosu güncelleme hatası:', userError.message);
          return;
        }

        console.log('✅ Admin kullanıcı başarıyla güncellendi!');
        console.log(`🔑 Email: ${email}`);
        console.log(`🔑 Şifre: ${password}`);
        console.log('⚠️  Not: Kullanıcı zaten Supabase Auth\'da mevcut, sadece admin yetkisi verildi.');
        return;
      }
      
      return;
    }

    if (!authData.user) {
      console.error('❌ Kullanıcı oluşturulamadı!');
      return;
    }

    console.log('✅ Auth kullanıcısı oluşturuldu:', authData.user.id);

    // 2. users tablosuna is_admin=true ile ekle
    // Not: password_hash Supabase Auth'da saklanıyor, burada gerek yok
    const { error: userError } = await supabase
      .from('users')
      .insert({
        email: email,
        first_name: firstName,
        last_name: lastName,
        is_admin: true,
        password_hash: '', // Dummy değer (Supabase Auth kullanıyoruz)
      });

    if (userError) {
      console.error('❌ Users tablosu ekleme hatası:', userError.message);
      
      // Eğer zaten varsa, güncelle
      if (userError.message.includes('duplicate') || userError.code === '23505') {
        console.log('⚠️  Kullanıcı zaten users tablosunda, güncelleniyor...');
        const { error: updateError } = await supabase
          .from('users')
          .update({ is_admin: true })
          .eq('email', email);

        if (updateError) {
          console.error('❌ Güncelleme hatası:', updateError.message);
          return;
        }
        console.log('✅ Admin yetkisi verildi!');
      }
      return;
    }

    console.log('✅ Admin kullanıcı başarıyla oluşturuldu!');
    console.log('');
    console.log('📋 Giriş Bilgileri:');
    console.log(`   Email: ${email}`);
    console.log(`   Şifre: ${password}`);
    console.log('');
    console.log('⚠️  ÖNEMLİ: İlk girişte email doğrulaması gerekebilir!');
    console.log('   Supabase Dashboard > Authentication > Users > Email\'i verify et');

  } catch (error) {
    console.error('❌ Beklenmeyen hata:', error);
  }
}

// Script'i çalıştır
createAdminUser();

