-- Couple backup so a new phone can restore lists, games, and check-ins.
-- Sexy Vault clips, voice notes, and Photo Memory stay on the phone.
-- Run after 012_hub_sync.sql.

create table if not exists public.couple_state (
  couple_id uuid primary key references public.couples (id) on delete cascade,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.couple_state enable row level security;

drop policy if exists "couple_state_member" on public.couple_state;
create policy "couple_state_member" on public.couple_state
for all using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

grant select, insert, update, delete on table public.couple_state to authenticated;

alter table public.couple_state replica identity full;
do $$
begin
  execute 'alter publication supabase_realtime add table public.couple_state';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
