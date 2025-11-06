-- Add group_name column to cards table
ALTER TABLE cards ADD COLUMN IF NOT EXISTS group_name TEXT;

-- Add card_type column to differentiate between NFC and comment cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS card_type TEXT DEFAULT 'nfc';

-- Create index for faster group queries
CREATE INDEX IF NOT EXISTS idx_cards_group_name ON cards(group_name) WHERE group_name IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cards_card_type ON cards(card_type);

-- Add comments
COMMENT ON COLUMN cards.group_name IS 'Optional group name for bulk created cards';
COMMENT ON COLUMN cards.card_type IS 'Type of card: nfc or comment';
