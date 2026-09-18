-- Pair backup so Birthdays, lists, and games leave the phone.
-- Paste in the Supabase SQL editor and click Run. Safe to run twice.
-- Needed if 013 was never run — admin can list the pair but the hubs stay empty.

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

create or replace function public.save_couple_state(p_couple_id uuid, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;
  if not public.is_couple_member(p_couple_id) then
    raise exception 'Not in this pair';
  end if;
  insert into public.couple_state (couple_id, payload, updated_at)
  values (p_couple_id, coalesce(p_payload, '{}'::jsonb), now())
  on conflict (couple_id) do update
    set payload = excluded.payload, updated_at = excluded.updated_at;
end;
$$;

create or replace function public.touch_profile_usage(
  p_active_seconds integer,
  p_app_seconds jsonb,
  p_timezone text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Sign in first';
  end if;
  update public.profiles
  set
    last_seen_at = now(),
    timezone = coalesce(nullif(trim(p_timezone), ''), timezone),
    active_seconds = greatest(coalesce(active_seconds, 0), coalesce(p_active_seconds, 0)),
    app_seconds = case
      when p_app_seconds is null then app_seconds
      else p_app_seconds
    end
  where id = auth.uid();
end;
$$;

grant execute on function public.save_couple_state(uuid, jsonb) to authenticated;
grant execute on function public.touch_profile_usage(integer, jsonb, text) to authenticated;
