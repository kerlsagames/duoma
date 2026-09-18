-- Backstage passphrase can set an account password so someone who never
-- chose one can open the Home Screen icon. Paste this whole file in the
-- Supabase SQL editor and click Run. Safe to run more than once.

create extension if not exists pgcrypto with schema extensions;

create or replace function public.admin_set_password(
  p_key text,
  p_email text,
  p_password text
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  uid uuid;
  trimmed text := lower(trim(coalesce(p_email, '')));
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  if p_password is null or char_length(p_password) < 8 then
    raise exception 'Password needs at least 8 characters.';
  end if;
  if position('@' in trimmed) = 0 then
    raise exception 'That email does not look right.';
  end if;

  select id into uid
  from auth.users
  where lower(email) = trimmed;

  if uid is null then
    raise exception 'No account for that email.';
  end if;

  update auth.users
  set
    encrypted_password = extensions.crypt(p_password, extensions.gen_salt('bf')),
    email_confirmed_at = coalesce(email_confirmed_at, now()),
    confirmation_token = '',
    recovery_token = '',
    updated_at = now()
  where id = uid;

  return jsonb_build_object('ok', true, 'id', uid, 'email', trimmed);
end;
$$;

revoke all on function public.admin_set_password(text, text, text) from public;
grant execute on function public.admin_set_password(text, text, text) to anon, authenticated;
