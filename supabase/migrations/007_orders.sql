-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  customer_address TEXT,
  
  -- Order items (JSON array)
  items JSONB NOT NULL DEFAULT '[]',
  
  -- Pricing
  subtotal DECIMAL(10,2) NOT NULL,
  shipping_cost DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  
  -- Payment
  payment_method TEXT,
  payment_status TEXT DEFAULT 'pending',
  
  -- Status
  order_status TEXT DEFAULT 'pending',
  
  -- Notes
  customer_note TEXT,
  admin_note TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  shipped_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON orders(order_number);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_orders_order_status ON orders(order_status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);

-- Add comments
COMMENT ON TABLE orders IS 'Customer orders from the store';
COMMENT ON COLUMN orders.order_number IS 'Unique order number (e.g., ORD-20250106-001)';
COMMENT ON COLUMN orders.items IS 'JSON array of ordered items with product details';
COMMENT ON COLUMN orders.order_status IS 'Order status: pending, processing, shipped, delivered, cancelled';
COMMENT ON COLUMN orders.payment_status IS 'Payment status: pending, paid, failed, refunded';

-- Disable RLS (admin only access)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
