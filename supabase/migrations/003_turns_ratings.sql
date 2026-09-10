-- Turns, private-time gate, ratings, named-card nights.

do $$
begin
  alter type public.game_status add value 'rating';
exception
  when duplicate_object then null;
end $$;

alter table public.games
  add column if not exists turn_user_id uuid references public.profiles (id),
  add column if not exists active_played_by uuid references public.profiles (id),
  add column if not exists awaiting_private boolean not null default false,
  add column if not exists private_unlocked boolean not null default false;

create table if not exists public.card_ratings (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  game_id uuid not null references public.games (id) on delete cascade,
  card_id uuid not null references public.cards (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  stars int not null check (stars between 1 and 5),
  created_at timestamptz not null default now(),
  unique (game_id, card_id, user_id)
);

create index if not exists card_ratings_couple_idx on public.card_ratings (couple_id, card_id);

do $$
begin
  execute 'alter publication supabase_realtime add table public.card_ratings';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
