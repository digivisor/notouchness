-- Cards tablosu
CREATE TABLE IF NOT EXISTS cards (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE,
  full_name TEXT,
  title TEXT,
  company TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  website TEXT,
  location TEXT,
  
  -- Sosyal Medya
  instagram TEXT,
  facebook TEXT,
  twitter TEXT,
  linkedin TEXT,
  youtube TEXT,
  tiktok TEXT,
  snapchat TEXT,
  pinterest TEXT,
  reddit TEXT,
  twitch TEXT,
  discord TEXT,
  spotify TEXT,
  threads TEXT,
  clubhouse TEXT,
  
  -- Mesajlaşma
  whatsapp TEXT,
  telegram TEXT,
  signal TEXT,
  viber TEXT,
  wechat TEXT,
  line TEXT,
  
  -- Profesyonel/İş
  github TEXT,
  gitlab TEXT,
  behance TEXT,
  dribbble TEXT,
  medium TEXT,
  devto TEXT,
  stackoverflow TEXT,
  figma TEXT,
  notion TEXT,
  calendly TEXT,
  linktree TEXT,
  substack TEXT,
  patreon TEXT,
  kofi TEXT,
  buymeacoffee TEXT,
  
  -- E-ticaret/Satış
  etsy TEXT,
  amazon TEXT,
  ebay TEXT,
  shopify TEXT,
  trendyol TEXT,
  hepsiburada TEXT,
  temu TEXT,
  aliexpress TEXT,
  sahibinden TEXT,
  gittigidiyor TEXT,
  n11 TEXT,
  
  -- Ödeme
  iban TEXT,
  paypal TEXT,
  cashapp TEXT,
  venmo TEXT,
  revolut TEXT,
  wise TEXT,
  papara TEXT,
  
  -- Video/Streaming
  vimeo TEXT,
  dailymotion TEXT,
  rumble TEXT,
  kick TEXT,
  
  -- Müzik
  soundcloud TEXT,
  bandcamp TEXT,
  apple_music TEXT,
  deezer TEXT,
  
  -- Profesyonel Ağlar
  xing TEXT,
  angellist TEXT,
  crunchbase TEXT,
  producthunt TEXT,
  
  -- Rezervasyon/Servis
  booking TEXT,
  airbnb TEXT,
  tripadvisor TEXT,
  uber TEXT,
  bolt TEXT,
  
  -- Görünüm
  theme TEXT DEFAULT 'sales',
  layout_style TEXT DEFAULT 'icons-with-title',
  avatar_url TEXT,
  cover_url TEXT,
  primary_color TEXT DEFAULT '#dc2626',
  secondary_color TEXT DEFAULT '#fef2f2',
  profile_image TEXT,
  custom_links JSONB DEFAULT '[]'::jsonb,
  platform_descriptions JSONB DEFAULT '{}'::jsonb,
  
  -- Gelişmiş Görünüm Ayarları
  background_color TEXT,
  container_background_color TEXT,
  text_color TEXT,
  grid_cols INTEGER DEFAULT 3,
  avatar_position TEXT DEFAULT 'above',
  
  -- Meta
  owner_email TEXT,
  hashed_password TEXT,
  is_active BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Username için index (hızlı arama için)
CREATE INDEX IF NOT EXISTS idx_cards_username ON cards(username) WHERE username IS NOT NULL AND username != '';
CREATE INDEX IF NOT EXISTS idx_cards_owner_email ON cards(owner_email) WHERE owner_email IS NOT NULL AND owner_email != '';
CREATE INDEX IF NOT EXISTS idx_cards_is_active ON cards(is_active);

-- Users tablosu (e-ticaret için kullanıcılar)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  avatar TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cart Items tablosu
CREATE TABLE IF NOT EXISTS cart_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL,
  product_name TEXT NOT NULL,
  product_price DECIMAL(10, 2) NOT NULL,
  product_image TEXT,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Updated_at için trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Cards için trigger
CREATE TRIGGER update_cards_updated_at
BEFORE UPDATE ON cards
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Users için trigger
CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- View count artırma fonksiyonu
CREATE OR REPLACE FUNCTION increment_card_views(card_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE cards
  SET view_count = view_count + 1
  WHERE id = card_id;
END;
$$ LANGUAGE plpgsql;

