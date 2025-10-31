# 🚀 Supabase Kurulum Adımları

## 1. ✅ Migration Çalıştırıldı
Güzel! Database schema oluşturuldu.

## 2. 📝 Environment Variables Oluştur

Proje root dizininde `.env.local` dosyası oluştur:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Supabase URL ve Key'i Nasıl Bulurum?

1. Supabase Dashboard'a git: https://app.supabase.com
2. Projeni seç
3. **Settings** → **API** sekmesine git
4. **Project URL** → `NEXT_PUBLIC_SUPABASE_URL` olarak kopyala
5. **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY` olarak kopyala

## 3. 🔄 Development Server'ı Yeniden Başlat

Environment variables değiştiği için server'ı yeniden başlat:

```bash
# Ctrl+C ile durdur, sonra:
npm run dev
```

## 4. ✅ Bağlantıyı Test Et

Tarayıcıda şu adrese git:
```
http://localhost:3000/test-supabase
```

Bu sayfa:
- ✅ Supabase bağlantısını test eder
- ✅ Tüm tabloların mevcut olduğunu kontrol eder
- ✅ Write iznini test eder

Eğer tüm testler başarılıysa hazırsın! 🎉

## 5. 🎯 İlk Kart Oluştur

1. Admin paneline git: `/admin`
2. "Kart Oluştur" butonuna tıkla
3. Kart URL'sini kopyala
4. Kart URL'sine git ve register ol

## ❌ Sorun mu Var?

### "Supabase credentials are missing" hatası
→ `.env.local` dosyasını oluşturdun mu?
→ Server'ı yeniden başlattın mı?

### "relation does not exist" hatası
→ Migration'ı çalıştırdın mı?
→ Supabase Dashboard → SQL Editor'da `cards` tablosunu kontrol et

### "permission denied" hatası
→ RLS (Row Level Security) ayarlarını kontrol et
→ Settings → Database → Policies

