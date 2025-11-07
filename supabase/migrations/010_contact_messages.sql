-- Contact messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for filtering by read status
create index if not exists contact_messages_is_read_idx on public.contact_messages (is_read);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);

-- RLS - Disabled to match other admin tables (corporate_requests pattern)
-- Admin authentication is handled via localStorage, not Supabase Auth
alter table public.contact_messages disable row level security;

-- Allow anonymous users to insert (contact form submissions)
-- Note: RLS is disabled, so all operations are allowed
-- Admin access is controlled via localStorage check in the admin pages

