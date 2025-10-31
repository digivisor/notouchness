# Supabase Kurulum Rehberi

Bu proje artık Supabase ile entegre edilmiştir. Veriler artık localStorage yerine Supabase database'inde saklanıyor.

## 1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) hesabı oluştur
2. Yeni bir proje oluştur
3. Proje ayarlarından **URL** ve **anon key**'i kopyala

## 2. Environment Variables

`.env.local` dosyası oluştur (root dizinde):

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 3. Database Schema Oluşturma

Supabase dashboard'a git:
1. **SQL Editor** sekmesine git
2. `supabase/migrations/001_initial_schema.sql` dosyasının içeriğini kopyala
3. SQL Editor'a yapıştır ve çalıştır (Run)

Bu migration şunları oluşturur:
- `cards` tablosu (tüm kart verileri)
- `users` tablosu (e-ticaret kullanıcıları)
- `cart_items` tablosu (sepet verileri)
- Indexler ve trigger'lar

## 4. Row Level Security (RLS) Ayarları

Supabase dashboard'da **Authentication > Policies** bölümünden:

### Cards Tablosu:
- **Select**: Herkese açık (public profiles için)
- **Insert**: Sadece authenticated users veya admin
- **Update**: Sadece card owner (owner_email kontrolü)
- **Delete**: Sadece admin

Örnek policy:
```sql
-- Select için (herkese açık)
CREATE POLICY "Cards are viewable by everyone" ON cards
  FOR SELECT USING (true);

-- Update için (sadece owner)
CREATE POLICY "Users can update own card" ON cards
  FOR UPDATE USING (auth.uid()::text = owner_email);
```

## 5. Test Etme

1. Development server'ı başlat: `npm run dev`
2. Admin panelinden yeni kart oluştur
3. Kart register sayfasına git ve kayıt ol
4. Setup sayfasında profil oluştur
5. Supabase dashboard'dan **Table Editor** > **cards** tablosunu kontrol et

## 6. Migration ve Backup

Migration dosyaları `supabase/migrations/` klasöründe. Production'a deploy etmek için:

1. Supabase CLI kurulumu (opsiyonel)
2. `supabase db push` komutu ile migration'ları uygula

## Sorun Giderme

### "Relation does not exist" hatası
- Migration'ı çalıştırdın mı kontrol et
- SQL Editor'da tabloları kontrol et

### "Unauthorized" hatası
- RLS policy'lerini kontrol et
- Anon key'in doğru olduğunu kontrol et

### Environment variables çalışmıyor
- `.env.local` dosyasının root dizinde olduğunu kontrol et
- Development server'ı yeniden başlat (`npm run dev`)

## Notlar

- Şifreler şu an düz metin olarak saklanıyor (production'da hash kullan!)
- RLS policy'leri production için güvenlik ayarları yapılmalı
- View count artırma için RPC fonksiyonu kullanılıyor

