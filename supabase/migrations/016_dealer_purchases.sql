-- Dealer purchases (Bayilerin satın aldığı kartlar) tablosu
create table if not exists public.dealer_purchases (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  sales_card_id uuid not null references public.sales_cards(id) on delete cascade,
  dealer_price numeric not null default 0,
  currency text not null default 'TRY',
  quantity integer not null default 1,
  total_amount numeric not null default 0,
  purchase_date timestamptz not null default now(),
  status text not null default 'pending', -- pending, completed, cancelled
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists dealer_purchases_dealer_id_idx on public.dealer_purchases(dealer_id);
create index if not exists dealer_purchases_sales_card_id_idx on public.dealer_purchases(sales_card_id);
create index if not exists dealer_purchases_status_idx on public.dealer_purchases(status);
create index if not exists dealer_purchases_purchase_date_idx on public.dealer_purchases(purchase_date);

-- Updated_at trigger
create trigger update_dealer_purchases_updated_at
before update on public.dealer_purchases
for each row
execute function update_updated_at_column();

-- RLS Policies
alter table public.dealer_purchases enable row level security;

drop policy if exists "dealer_purchases_read_authenticated" on public.dealer_purchases;
create policy "dealer_purchases_read_authenticated" on public.dealer_purchases
  for select using (true);

drop policy if exists "dealer_purchases_insert_authenticated" on public.dealer_purchases;
create policy "dealer_purchases_insert_authenticated" on public.dealer_purchases
  for insert with check (true);

drop policy if exists "dealer_purchases_update_authenticated" on public.dealer_purchases;
create policy "dealer_purchases_update_authenticated" on public.dealer_purchases
  for update using (true) with check (true);

drop policy if exists "dealer_purchases_delete_authenticated" on public.dealer_purchases;
create policy "dealer_purchases_delete_authenticated" on public.dealer_purchases
  for delete using (true);

