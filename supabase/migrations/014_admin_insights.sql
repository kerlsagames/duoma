-- Admin can read couple backups and hub items to plan from real use.
-- Per-app seconds live on the profile (same pulse as last_seen / active_seconds).

alter table public.profiles
  add column if not exists app_seconds jsonb not null default '{}'::jsonb;

drop policy if exists "couple_state_admin" on public.couple_state;
create policy "couple_state_admin" on public.couple_state
for select using (public.is_admin());

drop policy if exists "hub_items_admin" on public.hub_items;
create policy "hub_items_admin" on public.hub_items
for select using (public.is_admin());
