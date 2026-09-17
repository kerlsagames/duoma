-- Help / feedback / suggestions from Home settings.
-- Run after 010 in the SQL editor.

create table if not exists public.feedback_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  display_name text not null default 'Someone',
  email text,
  couple_id uuid references public.couples (id) on delete set null,
  body text not null,
  created_at timestamptz not null default now()
);

create index if not exists feedback_notes_created_idx
  on public.feedback_notes (created_at desc);

alter table public.feedback_notes enable row level security;

drop policy if exists "feedback_insert_self" on public.feedback_notes;
create policy "feedback_insert_self" on public.feedback_notes
for insert with check (user_id = auth.uid());

drop policy if exists "feedback_read_self_or_admin" on public.feedback_notes;
create policy "feedback_read_self_or_admin" on public.feedback_notes
for select using (user_id = auth.uid() or public.is_admin());

grant select, insert on table public.feedback_notes to authenticated;
