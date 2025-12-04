-- Add image_url column to qrmenu_categories
ALTER TABLE qrmenu_categories 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Add color settings to qrmenus
ALTER TABLE qrmenus 
ADD COLUMN IF NOT EXISTS category_color TEXT,
ADD COLUMN IF NOT EXISTS item_color TEXT,
ADD COLUMN IF NOT EXISTS header_color TEXT;

