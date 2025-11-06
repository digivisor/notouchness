-- Sales cards (store products) table
create table if not exists public.sales_cards (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  price numeric not null default 0,
  currency text not null default 'TRY',
  category text not null default 'metal',
  badge text,
  description text,
  features jsonb default '[]'::jsonb,
  image_front text,
  image_back text,
  stock_count integer not null default 0,
  in_stock boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful index
create index if not exists sales_cards_category_idx on public.sales_cards (category);

-- RLS (optional - disable for now or configure as needed)
alter table public.sales_cards enable row level security;
-- Allow anonymous read for listing products
create policy if not exists "Allow read to anon" on public.sales_cards
  for select using (true);
-- Allow authenticated full access (adjust to your auth model)
create policy if not exists "Allow insert to authenticated" on public.sales_cards
  for insert to authenticated with check (true);
create policy if not exists "Allow update to authenticated" on public.sales_cards
  for update to authenticated using (true) with check (true);
create policy if not exists "Allow delete to authenticated" on public.sales_cards
  for delete to authenticated using (true);
