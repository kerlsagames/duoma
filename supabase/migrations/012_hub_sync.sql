-- Shared hub rows so two phones (and a new phone) see the same
-- check-ins, check-in requests, position/roleplay asks, and calendar nights.

create table if not exists public.hub_items (
  id uuid primary key,
  couple_id uuid not null references public.couples (id) on delete cascade,
  kind text not null check (
    kind in (
      'check_in',
      'check_in_request',
      'position_invite',
      'roleplay_invite',
      'calendar_event'
    )
  ),
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists hub_items_couple_kind_idx
  on public.hub_items (couple_id, kind, updated_at desc);

alter table public.hub_items enable row level security;

drop policy if exists "hub_items_member" on public.hub_items;
create policy "hub_items_member" on public.hub_items
for all using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

grant select, insert, update, delete on table public.hub_items to authenticated;

alter table public.hub_items replica identity full;
do $$
begin
  execute 'alter publication supabase_realtime add table public.hub_items';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
