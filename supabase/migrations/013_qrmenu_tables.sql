-- QR Menu tablosu (restoran/mekan bilgileri)
CREATE TABLE IF NOT EXISTS qrmenus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL, -- URL'de kullanılacak slug (örn: walkerscaffe)
  name TEXT NOT NULL, -- Restoran/Mekan adı
  description TEXT, -- Açıklama
  logo_url TEXT, -- Logo URL'i
  cover_image_url TEXT, -- Kapak görseli
  phone TEXT,
  email TEXT,
  address TEXT,
  website TEXT,
  
  -- Sosyal medya
  instagram TEXT,
  facebook TEXT,
  twitter TEXT,
  
  -- Ayarlar
  owner_email TEXT, -- Sahip email (giriş için)
  hashed_password TEXT, -- Şifre hash'i
  is_active BOOLEAN DEFAULT true,
  
  -- Tema ayarları
  primary_color TEXT DEFAULT '#dc2626',
  secondary_color TEXT DEFAULT '#fef2f2',
  background_color TEXT,
  text_color TEXT,
  
  -- Meta
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Menu Cards tablosu (her QR menü için kartlar)
CREATE TABLE IF NOT EXISTS qrmenu_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrmenu_id UUID NOT NULL REFERENCES qrmenus(id) ON DELETE CASCADE,
  hash TEXT UNIQUE NOT NULL, -- Kart hash'i (URL için)
  group_name TEXT, -- Grup adı (dosyalama için)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Menu Orders tablosu (QR menüden gelen siparişler)
CREATE TABLE IF NOT EXISTS qrmenu_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrmenu_id UUID NOT NULL REFERENCES qrmenus(id) ON DELETE CASCADE,
  qrmenu_card_id UUID REFERENCES qrmenu_cards(id) ON DELETE SET NULL, -- Hangi karttan geldiği
  
  -- Müşteri bilgileri
  customer_name TEXT,
  customer_phone TEXT,
  customer_email TEXT,
  table_number TEXT, -- Masa numarası (opsiyonel)
  
  -- Sipariş detayları
  items JSONB NOT NULL DEFAULT '[]'::jsonb, -- Sipariş öğeleri
  notes TEXT, -- Müşteri notları
  
  -- Fiyatlandırma
  subtotal DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  service_charge DECIMAL(10,2) DEFAULT 0, -- Servis ücreti
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  
  -- Durum
  order_status TEXT DEFAULT 'pending', -- pending, confirmed, preparing, ready, completed, cancelled
  payment_status TEXT DEFAULT 'pending', -- pending, paid, cancelled
  
  -- Zaman damgaları
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  confirmed_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- QR Menu Categories tablosu (menü kategorileri)
CREATE TABLE IF NOT EXISTS qrmenu_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrmenu_id UUID NOT NULL REFERENCES qrmenus(id) ON DELETE CASCADE,
  name TEXT NOT NULL, -- Kategori adı (örn: Ana Yemekler, İçecekler)
  description TEXT,
  display_order INTEGER DEFAULT 0, -- Görüntüleme sırası
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- QR Menu Items tablosu (menü öğeleri)
CREATE TABLE IF NOT EXISTS qrmenu_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  qrmenu_id UUID NOT NULL REFERENCES qrmenus(id) ON DELETE CASCADE,
  category_id UUID REFERENCES qrmenu_categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL, -- Ürün adı
  description TEXT,
  price DECIMAL(10,2) NOT NULL DEFAULT 0,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true, -- Stokta var mı?
  display_order INTEGER DEFAULT 0, -- Görüntüleme sırası
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_qrmenus_slug ON qrmenus(slug);
CREATE INDEX IF NOT EXISTS idx_qrmenus_owner_email ON qrmenus(owner_email);
CREATE INDEX IF NOT EXISTS idx_qrmenus_is_active ON qrmenus(is_active);

CREATE INDEX IF NOT EXISTS idx_qrmenu_cards_qrmenu_id ON qrmenu_cards(qrmenu_id);
CREATE INDEX IF NOT EXISTS idx_qrmenu_cards_hash ON qrmenu_cards(hash);
CREATE INDEX IF NOT EXISTS idx_qrmenu_cards_group_name ON qrmenu_cards(group_name);

CREATE INDEX IF NOT EXISTS idx_qrmenu_orders_qrmenu_id ON qrmenu_orders(qrmenu_id);
CREATE INDEX IF NOT EXISTS idx_qrmenu_orders_qrmenu_card_id ON qrmenu_orders(qrmenu_card_id);
CREATE INDEX IF NOT EXISTS idx_qrmenu_orders_order_status ON qrmenu_orders(order_status);
CREATE INDEX IF NOT EXISTS idx_qrmenu_orders_created_at ON qrmenu_orders(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_qrmenu_categories_qrmenu_id ON qrmenu_categories(qrmenu_id);
CREATE INDEX IF NOT EXISTS idx_qrmenu_items_qrmenu_id ON qrmenu_items(qrmenu_id);
CREATE INDEX IF NOT EXISTS idx_qrmenu_items_category_id ON qrmenu_items(category_id);

-- Updated_at trigger'ları
CREATE TRIGGER update_qrmenus_updated_at
BEFORE UPDATE ON qrmenus
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qrmenu_cards_updated_at
BEFORE UPDATE ON qrmenu_cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qrmenu_orders_updated_at
BEFORE UPDATE ON qrmenu_orders
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qrmenu_categories_updated_at
BEFORE UPDATE ON qrmenu_categories
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_qrmenu_items_updated_at
BEFORE UPDATE ON qrmenu_items
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_qrmenu_views(qrmenu_id_param UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE qrmenus
  SET view_count = view_count + 1
  WHERE id = qrmenu_id_param;
END;
$$ LANGUAGE plpgsql;

-- RLS (Row Level Security) - Şimdilik devre dışı, admin kontrolü ile yönetilecek
ALTER TABLE qrmenus DISABLE ROW LEVEL SECURITY;
ALTER TABLE qrmenu_cards DISABLE ROW LEVEL SECURITY;
ALTER TABLE qrmenu_orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE qrmenu_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE qrmenu_items DISABLE ROW LEVEL SECURITY;

