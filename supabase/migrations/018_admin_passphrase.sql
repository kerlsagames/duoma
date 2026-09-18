-- The Backstage passphrase is full admin. Paste this whole file in the
-- Supabase SQL editor and click Run. Safe to run more than once.
-- Makes Feedback, pair backups (birthdays), catalog writes, bans, and
-- in-app time readable without a second email sign-in.

alter table public.profiles
  add column if not exists last_seen_at timestamptz,
  add column if not exists timezone text,
  add column if not exists active_seconds integer not null default 0,
  add column if not exists app_seconds jsonb not null default '{}'::jsonb;

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
for select using (user_id = auth.uid());

grant select, insert on table public.feedback_notes to authenticated;

create table if not exists public.admin_gate (
  id text primary key default 'v1',
  unlock_key text not null default 'kerlsagames-hq'
);

insert into public.admin_gate (id, unlock_key)
values ('v1', 'kerlsagames-hq')
on conflict (id) do nothing;

create or replace function public.admin_key_ok(p_key text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.admin_gate
    where id = 'v1' and unlock_key = p_key
  );
$$;

create or replace function public.admin_snapshot(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  notes jsonb := '[]'::jsonb;
  reports jsonb := '[]'::jsonb;
  states jsonb := '[]'::jsonb;
  catalog jsonb := '{}'::jsonb;
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;

  if to_regclass('public.feedback_notes') is not null then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', n.id,
          'userId', n.user_id,
          'displayName', n.display_name,
          'email', n.email,
          'coupleId', n.couple_id,
          'body', n.body,
          'createdAt', n.created_at
        )
        order by n.created_at desc
      ),
      '[]'::jsonb
    )
    into notes
    from public.feedback_notes n;
  end if;

  if to_regclass('public.content_reports') is not null then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'id', r.id,
          'reporterId', r.reporter_id,
          'reportedUserId', r.reported_user_id,
          'coupleId', r.couple_id,
          'mediaId', r.media_id,
          'mediaKind', r.media_kind,
          'reason', r.reason,
          'details', r.details,
          'status', r.status,
          'createdAt', r.created_at
        )
        order by r.created_at desc
      ),
      '[]'::jsonb
    )
    into reports
    from public.content_reports r;
  end if;

  if to_regclass('public.couple_state') is not null then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'coupleId', cs.couple_id,
          'payload', cs.payload,
          'savedAt', coalesce(cs.payload->>'savedAt', cs.updated_at::text)
        )
      ),
      '[]'::jsonb
    )
    into states
    from public.couple_state cs;
  end if;

  if to_regclass('public.catalog_overlay') is not null then
    select coalesce(c.payload, '{}'::jsonb)
    into catalog
    from public.catalog_overlay c
    where c.id = 'v1';
  end if;

  return jsonb_build_object(
    'profiles', (
      select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at), '[]'::jsonb)
      from public.profiles p
    ),
    'couples', (
      select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at), '[]'::jsonb)
      from public.couples c
    ),
    'feedback', notes,
    'reports', reports,
    'states', states,
    'catalog', catalog
  );
end;
$$;

create or replace function public.admin_ban(p_key text, p_user_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  update public.profiles
  set banned_at = now(), banned_reason = nullif(trim(p_reason), '')
  where id = p_user_id;
  if to_regclass('public.admin_audit') is not null then
    insert into public.admin_audit (actor_id, action, target_user_id, detail)
    values (auth.uid(), 'ban', p_user_id, p_reason);
  end if;
end;
$$;

create or replace function public.admin_unban(p_key text, p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  update public.profiles
  set banned_at = null, banned_reason = null
  where id = p_user_id;
  if to_regclass('public.admin_audit') is not null then
    insert into public.admin_audit (actor_id, action, target_user_id, detail)
    values (auth.uid(), 'unban', p_user_id, null);
  end if;
end;
$$;

create or replace function public.admin_resolve_report(p_key text, p_report_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.content_reports;
  next_status text;
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  if p_action not in ('dismiss', 'action_taken') then
    raise exception 'Unknown action';
  end if;
  select * into rec from public.content_reports where id = p_report_id;
  if rec.id is null then
    raise exception 'Report not found';
  end if;
  next_status := case when p_action = 'dismiss' then 'dismissed' else 'action_taken' end;
  update public.content_reports set status = next_status where id = p_report_id;
  if p_action = 'action_taken' and rec.reported_user_id is not null then
    update public.profiles
    set banned_at = now(), banned_reason = 'Removed after a safety report'
    where id = rec.reported_user_id;
    delete from public.couples
    where partner_a = rec.reported_user_id or partner_b = rec.reported_user_id;
  end if;
end;
$$;

create or replace function public.admin_write_catalog(p_key text, p_payload jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  if to_regclass('public.catalog_overlay') is null then
    raise exception 'catalog_overlay is missing — run SQL 006 first';
  end if;
  insert into public.catalog_overlay (id, payload, updated_at)
  values ('v1', p_payload, now())
  on conflict (id) do update
    set payload = excluded.payload, updated_at = excluded.updated_at;
end;
$$;

grant execute on function public.admin_key_ok(text) to anon, authenticated;
grant execute on function public.admin_snapshot(text) to anon, authenticated;
grant execute on function public.admin_ban(text, uuid, text) to anon, authenticated;
grant execute on function public.admin_unban(text, uuid) to anon, authenticated;
grant execute on function public.admin_resolve_report(text, uuid, text) to anon, authenticated;
grant execute on function public.admin_write_catalog(text, jsonb) to anon, authenticated;
