-- Web Push subscription tokens for two real phones.
-- Optional. Local two-tab preview stores tokens in the device store instead.

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  couple_id uuid not null references public.couples (id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);
create index if not exists push_subscriptions_couple_id_idx
  on public.push_subscriptions (couple_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "push_select_own_couple" on public.push_subscriptions;
create policy "push_select_own_couple" on public.push_subscriptions
  for select using (
    couple_id in (
      select id from public.couples
      where partner_a = auth.uid() or partner_b = auth.uid()
    )
  );

drop policy if exists "push_insert_own" on public.push_subscriptions;
create policy "push_insert_own" on public.push_subscriptions
  for insert with check (user_id = auth.uid());

drop policy if exists "push_update_own" on public.push_subscriptions;
create policy "push_update_own" on public.push_subscriptions
  for update using (user_id = auth.uid());

drop policy if exists "push_delete_own" on public.push_subscriptions;
create policy "push_delete_own" on public.push_subscriptions
  for delete using (user_id = auth.uid());
