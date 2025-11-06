-- Create corporate_requests table
CREATE TABLE IF NOT EXISTS corporate_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending', -- pending, contacted, completed, rejected
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_corporate_requests_created_at ON corporate_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_corporate_requests_status ON corporate_requests(status);

-- Disable RLS to match other tables (unrestricted access)
ALTER TABLE corporate_requests DISABLE ROW LEVEL SECURITY;

-- Add a comment
COMMENT ON TABLE corporate_requests IS 'Stores corporate quote requests from the landing page modal';
