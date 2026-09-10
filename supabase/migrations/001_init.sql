-- Fuse couples schema
-- Apply in the Supabase SQL editor or with the CLI:
--   supabase db reset   (runs migrations + seed)

create extension if not exists pgcrypto;

do $$ begin
  create type public.card_stage as enum (
    'pre_foreplay',
    'foreplay',
    'step_it_up',
    'finish_off'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.game_status as enum (
    'inviting',
    'declined',
    'setup',
    'selecting',
    'playing',
    'completed',
    'cancelled'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.game_mode as enum ('random', 'pick_your_own');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.deck_card_status as enum ('queued', 'active', 'played', 'blocked');
exception when duplicate_object then null;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 40),
  created_at timestamptz not null default now()
);

create table if not exists public.couples (
  id uuid primary key default gen_random_uuid(),
  invite_code text not null unique
    check (invite_code ~ '^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$'),
  partner_a uuid not null references public.profiles (id) on delete cascade,
  partner_b uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  paired_at timestamptz,
  constraint couples_distinct_partners check (partner_a is distinct from partner_b)
);

create index if not exists couples_partner_a_idx on public.couples (partner_a);
create index if not exists couples_partner_b_idx on public.couples (partner_b);

create table if not exists public.cards (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid references public.couples (id) on delete cascade,
  stage public.card_stage not null,
  title text not null,
  body text not null,
  is_default boolean not null default false,
  is_active boolean not null default true,
  sort_order int not null default 0,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists cards_couple_stage_idx on public.cards (couple_id, stage, sort_order);

create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  game_key text not null default 'get-spicy',
  status public.game_status not null default 'inviting',
  initiator_id uuid not null references public.profiles (id),
  mode public.game_mode,
  block_limit int not null default 1 check (block_limit between 1 and 3),
  stage_counts jsonb not null default '{"pre_foreplay":2,"foreplay":2,"step_it_up":2,"finish_off":1}'::jsonb,
  current_stage public.card_stage,
  active_card_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists games_couple_idx on public.games (couple_id, created_at desc);

create table if not exists public.game_players (
  game_id uuid not null references public.games (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  blocks_remaining int not null check (blocks_remaining >= 0),
  primary key (game_id, user_id)
);

create table if not exists public.game_deck (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references public.games (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete restrict,
  stage public.card_stage not null,
  sort_order numeric not null,
  status public.deck_card_status not null default 'queued',
  played_by uuid references public.profiles (id),
  unique (game_id, card_id)
);

create index if not exists game_deck_game_idx on public.game_deck (game_id, sort_order);

-- Updated-at trigger for realtime game state
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists games_touch_updated_at on public.games;
create trigger games_touch_updated_at
before update on public.games
for each row execute function public.touch_updated_at();

-- Invite codes never include 0/O/1/I
create or replace function public.generate_invite_code()
returns text
language plpgsql
as $$
declare
  chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text;
  i int;
begin
  loop
    result := '';
    for i in 1..6 loop
      result := result || substr(chars, 1 + floor(random() * length(chars))::int, 1);
    end loop;
    exit when not exists (select 1 from public.couples where invite_code = result);
  end loop;
  return result;
end;
$$;

-- Copy the 200 global default cards onto a new couple's bank
create or replace function public.copy_default_cards(p_couple_id uuid, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.cards (
    couple_id, stage, title, body, is_default, is_active, sort_order, created_by
  )
  select
    p_couple_id,
    stage,
    title,
    body,
    true,
    true,
    sort_order,
    p_user_id
  from public.cards
  where couple_id is null and is_default = true;
end;
$$;

create or replace function public.create_couple_for_user()
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  new_couple public.couples;
begin
  if exists (
    select 1 from public.couples
    where partner_a = auth.uid() or partner_b = auth.uid()
  ) then
    raise exception 'Already paired or waiting on a couple';
  end if;

  insert into public.couples (invite_code, partner_a)
  values (public.generate_invite_code(), auth.uid())
  returning * into new_couple;

  perform public.copy_default_cards(new_couple.id, auth.uid());
  return new_couple;
end;
$$;

create or replace function public.join_couple(p_code text)
returns public.couples
language plpgsql
security definer
set search_path = public
as $$
declare
  target public.couples;
begin
  select * into target
  from public.couples
  where invite_code = upper(trim(p_code))
  for update;

  if target.id is null then
    raise exception 'Invite code not found';
  end if;
  if target.partner_b is not null then
    raise exception 'This couple is already paired';
  end if;
  if target.partner_a = auth.uid() then
    raise exception 'You cannot join your own invite';
  end if;
  if exists (
    select 1 from public.couples
    where partner_a = auth.uid() or partner_b = auth.uid()
  ) then
    raise exception 'Leave your current pairing before joining another';
  end if;

  update public.couples
  set partner_b = auth.uid(), paired_at = now()
  where id = target.id
  returning * into target;

  return target;
end;
$$;

-- New auth users get a profile row
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Player')
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.cards enable row level security;
alter table public.games enable row level security;
alter table public.game_players enable row level security;
alter table public.game_deck enable row level security;

create or replace function public.is_couple_member(p_couple_id uuid)
returns boolean
language sql
stable
as $$
  select exists (
    select 1 from public.couples
    where id = p_couple_id
      and (partner_a = auth.uid() or partner_b = auth.uid())
  );
$$;

drop policy if exists "profiles_read_partners" on public.profiles;
create policy "profiles_read_partners" on public.profiles
for select using (
  id = auth.uid()
  or exists (
    select 1 from public.couples
    where (partner_a = auth.uid() and partner_b = profiles.id)
       or (partner_b = auth.uid() and partner_a = profiles.id)
  )
);

drop policy if exists "profiles_update_self" on public.profiles;
create policy "profiles_update_self" on public.profiles
for update using (id = auth.uid());

drop policy if exists "couples_member_read" on public.couples;
create policy "couples_member_read" on public.couples
for select using (partner_a = auth.uid() or partner_b = auth.uid());

drop policy if exists "cards_read" on public.cards;
create policy "cards_read" on public.cards
for select using (
  couple_id is null
  or public.is_couple_member(couple_id)
);

drop policy if exists "cards_write_member" on public.cards;
create policy "cards_write_member" on public.cards
for all using (
  couple_id is not null and public.is_couple_member(couple_id)
) with check (
  couple_id is not null and public.is_couple_member(couple_id)
);

drop policy if exists "games_member" on public.games;
create policy "games_member" on public.games
for all using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

drop policy if exists "game_players_member" on public.game_players;
create policy "game_players_member" on public.game_players
for all using (
  exists (select 1 from public.games g where g.id = game_id and public.is_couple_member(g.couple_id))
);

drop policy if exists "game_deck_member" on public.game_deck;
create policy "game_deck_member" on public.game_deck
for all using (
  exists (select 1 from public.games g where g.id = game_id and public.is_couple_member(g.couple_id))
);

-- Realtime: push couple pairing, invites, and live card state
alter table public.couples replica identity full;
alter table public.games replica identity full;
alter table public.game_players replica identity full;
alter table public.game_deck replica identity full;

do $$
begin
  execute 'alter publication supabase_realtime add table public.couples';
exception when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.games';
exception when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.game_players';
exception when duplicate_object then null;
end $$;

do $$
begin
  execute 'alter publication supabase_realtime add table public.game_deck';
exception when duplicate_object then null;
end $$;

grant execute on function public.create_couple_for_user() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
grant execute on function public.generate_invite_code() to authenticated;
