    -- Dealer purchase cards (Bayi satın alımına ait oluşturulan kartlar) tablosu
    create table if not exists public.dealer_purchase_cards (
    id uuid primary key default gen_random_uuid(),
    dealer_purchase_id uuid not null references public.dealer_purchases(id) on delete cascade,
    card_id text not null references public.cards(id) on delete cascade,
    created_at timestamptz not null default now(),
    unique(dealer_purchase_id, card_id)
    );

    -- Indexes
    create index if not exists dealer_purchase_cards_dealer_purchase_id_idx on public.dealer_purchase_cards(dealer_purchase_id);
    create index if not exists dealer_purchase_cards_card_id_idx on public.dealer_purchase_cards(card_id);

    -- RLS Policies
    alter table public.dealer_purchase_cards enable row level security;

    drop policy if exists "dealer_purchase_cards_read_authenticated" on public.dealer_purchase_cards;
    create policy "dealer_purchase_cards_read_authenticated" on public.dealer_purchase_cards
    for select using (true);

    drop policy if exists "dealer_purchase_cards_insert_authenticated" on public.dealer_purchase_cards;
    create policy "dealer_purchase_cards_insert_authenticated" on public.dealer_purchase_cards
    for insert with check (true);

    drop policy if exists "dealer_purchase_cards_update_authenticated" on public.dealer_purchase_cards;
    create policy "dealer_purchase_cards_update_authenticated" on public.dealer_purchase_cards
    for update using (true);

    drop policy if exists "dealer_purchase_cards_delete_authenticated" on public.dealer_purchase_cards;
    create policy "dealer_purchase_cards_delete_authenticated" on public.dealer_purchase_cards
    for delete using (true);

