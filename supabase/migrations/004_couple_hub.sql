-- Couple hub: check-ins, curiosity, countdowns, desire, coupons, jar, planner.

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  on_date date not null,
  energy int not null check (energy between 1 and 10),
  mood text not null,
  love_tank int not null check (love_tank between 1 and 10),
  created_at timestamptz not null default now(),
  unique (couple_id, user_id, on_date)
);

create table if not exists public.curiosity_answers (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  on_date date not null,
  question_id text not null,
  body text not null,
  created_at timestamptz not null default now(),
  unique (couple_id, user_id, on_date)
);

create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null,
  kind text not null,
  on_date date not null,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

create table if not exists public.desire_toggles (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  option_id text not null,
  created_at timestamptz not null default now(),
  unique (couple_id, user_id, option_id)
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  from_user_id uuid not null references public.profiles (id),
  to_user_id uuid not null references public.profiles (id),
  title text not null,
  body text not null default '',
  status text not null default 'offered',
  created_at timestamptz not null default now(),
  accepted_at timestamptz,
  redeemed_at timestamptz
);

create table if not exists public.jar_notes (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  from_user_id uuid not null references public.profiles (id),
  body text not null,
  created_at timestamptz not null default now(),
  opened_at timestamptz
);

create table if not exists public.bucket_items (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples (id) on delete cascade,
  title text not null,
  kind text not null,
  notes text not null default '',
  scheduled_on date,
  done_at timestamptz,
  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now()
);

alter table public.games
  add column if not exists played_date date;
