-- Make sales_cards unrestricted like your other tables
alter table public.sales_cards disable row level security;

-- Optional cleanup: policies are irrelevant when RLS is disabled, but we can drop them to avoid confusion
drop policy if exists "Allow read to anon" on public.sales_cards;
drop policy if exists "Allow insert to authenticated" on public.sales_cards;
drop policy if exists "Allow update to authenticated" on public.sales_cards;
drop policy if exists "Allow delete to authenticated" on public.sales_cards;

-- Also drop the dev anon policies if they were created
drop policy if exists "Allow insert to anon (dev)" on public.sales_cards;
drop policy if exists "Allow update to anon (dev)" on public.sales_cards;
drop policy if exists "Allow delete to anon (dev)" on public.sales_cards;
