-- Dealer accounts (Bayi cari hesapları) tablosu
create table if not exists public.dealer_accounts (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade unique,
  balance numeric not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Dealer account transactions (Bayi cari hesap işlemleri) tablosu
create table if not exists public.dealer_account_transactions (
  id uuid primary key default gen_random_uuid(),
  dealer_id uuid not null references public.dealers(id) on delete cascade,
  type text not null, -- 'deposit', 'purchase', 'refund'
  amount numeric not null,
  description text,
  reference_id uuid, -- dealer_purchase_id veya başka bir referans
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists dealer_accounts_dealer_id_idx on public.dealer_accounts(dealer_id);
create index if not exists dealer_account_transactions_dealer_id_idx on public.dealer_account_transactions(dealer_id);
create index if not exists dealer_account_transactions_type_idx on public.dealer_account_transactions(type);
create index if not exists dealer_account_transactions_created_at_idx on public.dealer_account_transactions(created_at);

-- Updated_at trigger
create trigger update_dealer_accounts_updated_at
before update on public.dealer_accounts
for each row
execute function update_updated_at_column();

-- RLS Policies
alter table public.dealer_accounts enable row level security;
alter table public.dealer_account_transactions enable row level security;

-- Dealer accounts policies
-- Herkes okuyabilir (bayiler kendi hesaplarını görebilir)
drop policy if exists "dealer_accounts_read_authenticated" on public.dealer_accounts;
create policy "dealer_accounts_read_authenticated" on public.dealer_accounts
  for select using (true);

-- Herkes insert edebilir (admin API üzerinden yapar, RLS bypass edilir)
drop policy if exists "dealer_accounts_insert_authenticated" on public.dealer_accounts;
create policy "dealer_accounts_insert_authenticated" on public.dealer_accounts
  for insert with check (true);

-- Herkes update edebilir (admin API üzerinden yapar, RLS bypass edilir)
drop policy if exists "dealer_accounts_update_authenticated" on public.dealer_accounts;
create policy "dealer_accounts_update_authenticated" on public.dealer_accounts
  for update using (true);

-- Dealer account transactions policies
-- Herkes okuyabilir (bayiler kendi işlemlerini görebilir)
drop policy if exists "dealer_account_transactions_read_authenticated" on public.dealer_account_transactions;
create policy "dealer_account_transactions_read_authenticated" on public.dealer_account_transactions
  for select using (true);

-- Herkes insert edebilir (admin API üzerinden yapar, RLS bypass edilir)
drop policy if exists "dealer_account_transactions_insert_authenticated" on public.dealer_account_transactions;
create policy "dealer_account_transactions_insert_authenticated" on public.dealer_account_transactions
  for insert with check (true);

