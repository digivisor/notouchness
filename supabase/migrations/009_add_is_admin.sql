-- Admin kullanıcılar için is_admin kolonu ekle
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE;

-- password_hash'i nullable yap (Supabase Auth kullanıyoruz, password_hash'e gerek yok)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- İndex ekle (admin sorguları için)
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON users(is_admin) WHERE is_admin = true;

-- Mevcut admin kullanıcıları için (opsiyonel - manuel olarak güncellenebilir)
-- UPDATE users SET is_admin = true WHERE email = 'admin@digivisor.com';

