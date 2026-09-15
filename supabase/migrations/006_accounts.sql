-- Accounts, bans, usage, and a global catalog overlay.
-- Run after 001–005 in the Supabase SQL editor.
-- 100 and 1,000 couples both live here (Postgres), not in a phone's localStorage.

alter table public.profiles
  add column if not exists email text,
  add column if not exists gender text check (gender in ('male', 'female') or gender is null),
  add column if not exists banned_at timestamptz,
  add column if not exists banned_reason text,
  add column if not exists last_seen_at timestamptz,
  add column if not exists is_admin boolean not null default false;

create unique index if not exists profiles_email_lower_idx
  on public.profiles (lower(email))
  where email is not null;

-- Magic-link / password users copy email onto the profile.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player'),
    new.email
  )
  on conflict (id) do update
    set email = excluded.email;
  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true and banned_at is null
  );
$$;

-- Pairing stays a 6-character code. Email is the account (new phone, bans, recovery).
create table if not exists public.usage_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  couple_id uuid references public.couples (id) on delete cascade,
  app_id text not null,
  action text not null,
  subject_id text,
  detail text,
  created_at timestamptz not null default now()
);

create index if not exists usage_events_user_idx
  on public.usage_events (user_id, created_at desc);
create index if not exists usage_events_couple_idx
  on public.usage_events (couple_id, created_at desc);
create index if not exists usage_events_app_idx
  on public.usage_events (app_id, created_at desc);

-- Creator catalog edits that every couple should see.
create table if not exists public.catalog_overlay (
  id text primary key default 'v1',
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles (id)
);

insert into public.catalog_overlay (id, payload)
values ('v1', '{}'::jsonb)
on conflict (id) do nothing;

create table if not exists public.admin_audit (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null,
  target_user_id uuid references public.profiles (id),
  detail text,
  created_at timestamptz not null default now()
);

create or replace function public.ban_user(p_user_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;
  update public.profiles
  set banned_at = now(), banned_reason = nullif(trim(p_reason), '')
  where id = p_user_id and is_admin = false;
  insert into public.admin_audit (actor_id, action, target_user_id, detail)
  values (auth.uid(), 'ban', p_user_id, p_reason);
end;
$$;

create or replace function public.unban_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'Admin only';
  end if;
  update public.profiles
  set banned_at = null, banned_reason = null
  where id = p_user_id;
  insert into public.admin_audit (actor_id, action, target_user_id, detail)
  values (auth.uid(), 'unban', p_user_id, null);
end;
$$;

create or replace function public.track_usage(
  p_app_id text,
  p_action text,
  p_subject_id text default null,
  p_detail text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cid uuid;
begin
  if auth.uid() is null then
    return;
  end if;
  select id into cid
  from public.couples
  where partner_a = auth.uid() or partner_b = auth.uid()
  limit 1;
  insert into public.usage_events (user_id, couple_id, app_id, action, subject_id, detail)
  values (auth.uid(), cid, p_app_id, p_action, p_subject_id, p_detail);
  update public.profiles set last_seen_at = now() where id = auth.uid();
end;
$$;

alter table public.usage_events enable row level security;
alter table public.catalog_overlay enable row level security;
alter table public.admin_audit enable row level security;

drop policy if exists "usage_insert_self" on public.usage_events;
create policy "usage_insert_self" on public.usage_events
for insert with check (user_id = auth.uid());

drop policy if exists "usage_read_self_or_admin" on public.usage_events;
create policy "usage_read_self_or_admin" on public.usage_events
for select using (user_id = auth.uid() or public.is_admin());

drop policy if exists "catalog_read_all" on public.catalog_overlay;
create policy "catalog_read_all" on public.catalog_overlay
for select using (true);

drop policy if exists "catalog_write_admin" on public.catalog_overlay;
create policy "catalog_write_admin" on public.catalog_overlay
for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "audit_admin" on public.admin_audit;
create policy "audit_admin" on public.admin_audit
for select using (public.is_admin());

drop policy if exists "profiles_admin_read" on public.profiles;
create policy "profiles_admin_read" on public.profiles
for select using (public.is_admin());

drop policy if exists "couples_admin_read" on public.couples;
create policy "couples_admin_read" on public.couples
for select using (public.is_admin());

drop policy if exists "cards_admin_read" on public.cards;
create policy "cards_admin_read" on public.cards
for select using (public.is_admin());

drop policy if exists "games_admin_read" on public.games;
create policy "games_admin_read" on public.games
for select using (public.is_admin());

grant execute on function public.is_admin() to authenticated;
grant execute on function public.ban_user(uuid, text) to authenticated;
grant execute on function public.unban_user(uuid) to authenticated;
grant execute on function public.track_usage(text, text, text, text) to authenticated;

-- After you (Craig) create your email account, run once:
--   update public.profiles set is_admin = true
--   where lower(email) = 'kerlsagameshq@gmail.com';
