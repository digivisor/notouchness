// Supabase bağlantısını test etmek için script
import { supabase } from '../lib/supabase';

async function testSupabase() {
  console.log('🔍 Supabase bağlantısı test ediliyor...\n');

  // 1. Bağlantı testi
  try {
    const { data, error } = await supabase.from('cards').select('count').limit(1);
    if (error) {
      console.error('❌ Supabase bağlantı hatası:', error.message);
      console.error('\n🔧 Çözüm:');
      console.error('1. .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve NEXT_PUBLIC_SUPABASE_ANON_KEY olduğundan emin ol');
      console.error('2. Supabase dashboard\'dan URL ve anon key\'i kontrol et');
      console.error('3. Migration\'ı çalıştırdığından emin ol (supabase/migrations/001_initial_schema.sql)');
      return;
    }
    console.log('✅ Supabase bağlantısı başarılı!\n');
  } catch (err: unknown) {
    const error = err as Error;
    console.error('❌ Bağlantı hatası:', error.message);
    return;
  }

  // 2. Tabloları kontrol et
  const tables = ['cards', 'users', 'cart_items'];
  console.log('📊 Tablolar kontrol ediliyor...\n');
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(1);
      if (error) {
        console.error(`❌ ${table} tablosu bulunamadı veya hata:`, error.message);
      } else {
        console.log(`✅ ${table} tablosu mevcut`);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error(`❌ ${table} tablosu kontrol edilemedi:`, error.message);
    }
  }

  console.log('\n✨ Test tamamlandı!');
  console.log('\n📝 Sonraki adımlar:');
  console.log('1. Admin panelinden yeni kart oluştur: /admin');
  console.log('2. Kart URL\'sine git ve register ol');
  console.log('3. Setup sayfasında profil oluştur');
}

testSupabase();

