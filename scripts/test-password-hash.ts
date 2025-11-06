/**
 * Password Hash Test Scripti
 * 
 * Kullanım: npx tsx scripts/test-password-hash.ts [email] [password]
 * 
 * Bu script, girilen şifreyi farklı hash algoritmalarıyla hash'leyip
 * Supabase'deki password_hash ile karşılaştırır.
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

// Farklı hash algoritmaları
function hashSHA256(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex');
}

function hashMD5(text: string): string {
  return crypto.createHash('md5').update(text).digest('hex');
}

function hashSHA1(text: string): string {
  return crypto.createHash('sha1').update(text).digest('hex');
}

async function testPasswordHash() {
  const email = process.argv[2];
  const password = process.argv[3];

  if (!email || !password) {
    console.error('❌ Kullanım: npx tsx scripts/test-password-hash.ts [email] [password]');
    process.exit(1);
  }

  console.log('🔍 Password hash testi başlatılıyor...\n');
  console.log(`📧 Email: ${email}`);
  console.log(`🔑 Şifre: ${password}\n`);

  // Users tablosundan kullanıcıyı bul
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('email, password_hash, is_admin')
    .eq('email', email)
    .single();

  if (userError || !userData) {
    console.error('❌ Kullanıcı bulunamadı:', userError?.message);
    process.exit(1);
  }

  console.log('✅ Kullanıcı bulundu');
  console.log(`📋 Stored hash: ${userData.password_hash}`);
  console.log(`📏 Hash uzunluğu: ${userData.password_hash?.length || 0}\n`);

  // Farklı hash algoritmalarıyla test et
  const hashes = {
    'SHA256': hashSHA256(password),
    'SHA256 (uppercase)': hashSHA256(password).toUpperCase(),
    'MD5': hashMD5(password),
    'MD5 (uppercase)': hashMD5(password).toUpperCase(),
    'SHA1': hashSHA1(password),
    'SHA1 (uppercase)': hashSHA1(password).toUpperCase(),
  };

  console.log('🔐 Farklı hash algoritmalarıyla test ediliyor:\n');
  
  let foundMatch = false;
  for (const [algorithm, hash] of Object.entries(hashes)) {
    const match = hash.toLowerCase().trim() === (userData.password_hash || '').toLowerCase().trim();
    const status = match ? '✅ EŞLEŞTİ!' : '❌';
    console.log(`${status} ${algorithm}: ${hash}`);
    if (match) {
      foundMatch = true;
      console.log(`\n🎉 ${algorithm} algoritması ile eşleşme bulundu!\n`);
    }
  }

  if (!foundMatch) {
    console.log('\n⚠️  Hiçbir hash algoritması ile eşleşme bulunamadı!');
    console.log('\n💡 İpuçları:');
    console.log('   - Hash algoritması farklı olabilir (bcrypt, argon2, vb.)');
    console.log('   - Hash\'e salt eklenmiş olabilir');
    console.log('   - Hash formatı farklı olabilir (base64, vb.)');
    console.log('\n📝 Supabase\'deki password_hash değerini kontrol edin:');
    console.log(`   ${userData.password_hash}`);
  }
}

testPasswordHash();

