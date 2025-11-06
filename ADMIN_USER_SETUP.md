# Admin Kullanıcı Oluşturma Rehberi

Admin kullanıcı oluşturmak için 3 yöntem var:

## Yöntem 1: Supabase Dashboard (En Kolay) ⭐

1. **Supabase Dashboard** > **Authentication** > **Users** > **Add User**
2. Email ve password gir (örn: `admin@digivisor.com` / `Admin123!`)
3. **SQL Editor**'a git ve şu SQL'i çalıştır:

```sql
-- Users tablosuna is_admin=true ekle
INSERT INTO users (email, first_name, last_name, is_admin)
VALUES ('admin@digivisor.com', 'Admin', 'User', true)
ON CONFLICT (email) 
DO UPDATE SET is_admin = true;
```

## Yöntem 2: API Route (Geliştirme için)

1. `.env.local` dosyasına ekle:
```env
ADMIN_CREATE_SECRET=your-secret-key-here
```

2. API'ye POST request gönder:
```bash
curl -X POST http://localhost:3000/api/admin/create-admin \
  -H "Content-Type: application/json" \
  -d '{
    "secret": "your-secret-key-here",
    "email": "admin@digivisor.com",
    "password": "Admin123!",
    "firstName": "Admin",
    "lastName": "User"
  }'
```

## Yöntem 3: SQL Script (Manuel)

Supabase Dashboard > **SQL Editor**'da çalıştır:

```sql
-- 1. Önce is_admin kolonu yoksa ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- 2. Supabase Auth'da kullanıcı oluştur (Dashboard'dan yap)
-- Authentication > Users > Add User

-- 3. Users tablosuna admin olarak ekle
INSERT INTO users (email, first_name, last_name, is_admin)
VALUES ('admin@digivisor.com', 'Admin', 'User', true)
ON CONFLICT (email) 
DO UPDATE SET is_admin = true;
```

## Önemli Notlar

⚠️ **İlk girişte email doğrulaması gerekebilir:**
- Supabase Dashboard > Authentication > Users
- Email'in yanındaki ✓ işaretine tıkla veya "Send verification email" kullan

⚠️ **Production'da:**
- `ADMIN_CREATE_SECRET` environment variable'ını güçlü bir değer yap
- API route'u sadece güvenli bir ortamda kullan

## Test Etme

1. `/admin/login` sayfasına git
2. Oluşturduğun email ve password ile giriş yap
3. Başarılı olursa `/admin/dashboard`'a yönlendirileceksin

