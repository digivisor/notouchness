-- Dealers (Bayiler) tablosu
create table if not exists public.dealers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  username text not null unique,
  password_hash text not null,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dealer cards (Bayiye özel kartlar ve fiyatlar) tablosu
create table if not exists public.dealer_cards (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  sales_card_id uuid not null references public.sales_cards(id) on delete cascade,
  dealer_price numeric not null default 0,
  currency text not null default 'TRY',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(dealer_id, sales_card_id)
);

-- Indexes
create index if not exists dealers_email_idx on public.dealers(email);
create index if not exists dealers_username_idx on public.dealers(username);
create index if not exists dealers_is_active_idx on public.dealers(is_active);
create index if not exists dealer_cards_dealer_id_idx on public.dealer_cards(dealer_id);
create index if not exists dealer_cards_sales_card_id_idx on public.dealer_cards(sales_card_id);
create index if not exists dealer_cards_is_active_idx on public.dealer_cards(is_active);

-- Updated_at trigger
create trigger update_dealers_updated_at
before update on public.dealers
for each row
execute function update_updated_at_column();

create trigger update_dealer_cards_updated_at
before update on public.dealer_cards
for each row
execute function update_updated_at_column();

-- RLS Policies
alter table public.dealers enable row level security;
alter table public.dealer_cards enable row level security;

-- Dealers için policies (sadece admin erişebilir - authenticated kullanıcılar)
drop policy if exists "dealers_read_authenticated" on public.dealers;
create policy "dealers_read_authenticated" on public.dealers
  for select using (true);

drop policy if exists "dealers_insert_authenticated" on public.dealers;
create policy "dealers_insert_authenticated" on public.dealers
  for insert with check (true);

drop policy if exists "dealers_update_authenticated" on public.dealers;
create policy "dealers_update_authenticated" on public.dealers
  for update using (true) with check (true);

drop policy if exists "dealers_delete_authenticated" on public.dealers;
create policy "dealers_delete_authenticated" on public.dealers
  for delete using (true);

-- Dealer cards için policies
drop policy if exists "dealer_cards_read_authenticated" on public.dealer_cards;
create policy "dealer_cards_read_authenticated" on public.dealer_cards
  for select using (true);

drop policy if exists "dealer_cards_insert_authenticated" on public.dealer_cards;
create policy "dealer_cards_insert_authenticated" on public.dealer_cards
  for insert with check (true);

drop policy if exists "dealer_cards_update_authenticated" on public.dealer_cards;
create policy "dealer_cards_update_authenticated" on public.dealer_cards
  for update using (true) with check (true);

drop policy if exists "dealer_cards_delete_authenticated" on public.dealer_cards;
create policy "dealer_cards_delete_authenticated" on public.dealer_cards
  for delete using (true);

