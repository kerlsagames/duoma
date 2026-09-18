-- The live phone can upload Feedback, hubs, and in-app time with the same
-- passphrase already in the app. Paste in the SQL editor and Run.
-- Safe twice. Use this when Last used is stuck and Help notes never arrive.

create or replace function public.admin_submit_feedback(
  p_key text,
  p_id uuid,
  p_user_id uuid,
  p_display_name text,
  p_email text,
  p_couple_id uuid,
  p_body text,
  p_created_at timestamptz
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  if to_regclass('public.feedback_notes') is null then
    raise exception 'feedback_notes is missing — run SQL 018 first';
  end if;
  insert into public.feedback_notes (
    id, user_id, display_name, email, couple_id, body, created_at
  )
  values (
    p_id,
    p_user_id,
    coalesce(nullif(trim(p_display_name), ''), 'Someone'),
    nullif(trim(p_email), ''),
    p_couple_id,
    p_body,
    coalesce(p_created_at, now())
  )
  on conflict (id) do update
    set body = excluded.body,
        display_name = excluded.display_name,
        email = excluded.email,
        couple_id = excluded.couple_id;
end;
$$;

create or replace function public.admin_save_couple_state(
  p_key text,
  p_couple_id uuid,
  p_payload jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  if to_regclass('public.couple_state') is null then
    raise exception 'couple_state is missing — run SQL 019 first';
  end if;
  insert into public.couple_state (couple_id, payload, updated_at)
  values (p_couple_id, coalesce(p_payload, '{}'::jsonb), now())
  on conflict (couple_id) do update
    set payload = excluded.payload, updated_at = excluded.updated_at;
end;
$$;

create or replace function public.admin_touch_usage(
  p_key text,
  p_user_id uuid,
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
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
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
  where id = p_user_id;
end;
$$;

grant execute on function public.admin_submit_feedback(text, uuid, uuid, text, text, uuid, text, timestamptz) to anon, authenticated;
grant execute on function public.admin_save_couple_state(text, uuid, jsonb) to anon, authenticated;
grant execute on function public.admin_touch_usage(text, uuid, integer, jsonb, text) to anon, authenticated;
