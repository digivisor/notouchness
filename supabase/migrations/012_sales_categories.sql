    -- Sales categories table
    create table if not exists public.sales_categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
    );

    -- Insert default categories if they don't exist
    insert into public.sales_categories (name) 
    values 
    ('Metal Kartlar'),
    ('Ahşap Kartlar'),
    ('Premium'),
    ('Aksesuarlar'),
    ('Diğer')
    on conflict (name) do nothing;

-- RLS disabled (same as sales_cards table)
-- Admin panel uses localStorage session, not Supabase Auth
alter table public.sales_categories disable row level security;

