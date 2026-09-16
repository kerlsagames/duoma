-- Unpair / wipe, in-app reports, account close.
-- Couple media in Duoma lives on-device (IndexedDB / MiniState), not S3.
-- Deleting a couples row still cascades shared Postgres play data.
-- Run after 009 in the SQL editor.

create table if not exists public.content_reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reported_user_id uuid references public.profiles (id) on delete set null,
  couple_id uuid references public.couples (id) on delete set null,
  media_id text,
  media_kind text not null default 'other',
  reason text not null,
  details text,
  status text not null default 'pending'
    check (status in ('pending', 'reviewed', 'dismissed', 'action_taken')),
  created_at timestamptz not null default now()
);

create index if not exists content_reports_status_idx
  on public.content_reports (status, created_at desc);

alter table public.content_reports enable row level security;

drop policy if exists "reports_insert_self" on public.content_reports;
create policy "reports_insert_self" on public.content_reports
for insert with check (reporter_id = auth.uid());

drop policy if exists "reports_read_self_or_admin" on public.content_reports;
create policy "reports_read_self_or_admin" on public.content_reports
for select using (reporter_id = auth.uid() or public.is_admin());

-- End the pairing. Shared Postgres rows cascade off couples.
-- Each person can then call create_couple_for_user() for a fresh invite code.
create or replace function public.unpair_couple()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in first';
  end if;

  insert into public.admin_audit (actor_id, action, target_user_id, detail)
  values (uid, 'unpair', uid, 'User ended the pairing');

  delete from public.couples
  where partner_a = uid or partner_b = uid;

  perform public.create_couple_for_user();
end;
$$;

-- Close this account: unpair, strip profile PII, ban so they cannot come back
-- until support restores. Auth email deletion still needs the dashboard / support
-- because the anon key cannot delete auth.users.
create or replace function public.delete_own_account()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  uid uuid := auth.uid();
begin
  if uid is null then
    raise exception 'Sign in first';
  end if;

  insert into public.admin_audit (actor_id, action, target_user_id, detail)
  values (uid, 'delete-account', uid, 'User requested account deletion');

  delete from public.couples
  where partner_a = uid or partner_b = uid;

  update public.profiles
  set
    display_name = 'Deleted',
    email = null,
    banned_at = now(),
    banned_reason = 'Account deleted by user',
    last_seen_at = now()
  where id = uid;
end;
$$;

create or replace function public.resolve_report(p_report_id uuid, p_action text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec public.content_reports;
  next_status text;
begin
  if not public.is_admin() then
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
  update public.content_reports
  set status = next_status
  where id = p_report_id;

  if p_action = 'action_taken' and rec.reported_user_id is not null then
    update public.profiles
    set banned_at = now(), banned_reason = 'Removed after a safety report'
    where id = rec.reported_user_id and is_admin = false;
    delete from public.couples
    where partner_a = rec.reported_user_id or partner_b = rec.reported_user_id;
  end if;

  insert into public.admin_audit (actor_id, action, target_user_id, detail)
  values (
    auth.uid(),
    'resolve-report',
    rec.reported_user_id,
    p_action || ' ' || p_report_id::text
  );
end;
$$;

grant select, insert on table public.content_reports to authenticated;
grant execute on function public.unpair_couple() to authenticated;
grant execute on function public.delete_own_account() to authenticated;
grant execute on function public.resolve_report(uuid, text) to authenticated;
