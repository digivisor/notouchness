-- Relax RLS for sales_cards to allow anon writes (development convenience)
-- NOTE: This is insecure for production. Prefer using service role on server routes or proper auth.

alter table public.sales_cards enable row level security;

create policy if not exists "Allow insert to anon (dev)" on public.sales_cards
  for insert to anon
  with check (true);

create policy if not exists "Allow update to anon (dev)" on public.sales_cards
  for update to anon
  using (true)
  with check (true);

create policy if not exists "Allow delete to anon (dev)" on public.sales_cards
  for delete to anon
  using (true);
