-- Backstage passphrase can list every pair without a second email sign-in.
-- Run in the Supabase SQL editor after 014.

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

create or replace function public.admin_directory(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.admin_key_ok(p_key) then
    raise exception 'Admin only';
  end if;
  return jsonb_build_object(
    'profiles', (
      select coalesce(jsonb_agg(to_jsonb(p) order by p.created_at), '[]'::jsonb)
      from public.profiles p
    ),
    'couples', (
      select coalesce(jsonb_agg(to_jsonb(c) order by c.created_at), '[]'::jsonb)
      from public.couples c
    )
  );
end;
$$;

grant execute on function public.admin_key_ok(text) to anon, authenticated;
grant execute on function public.admin_directory(text) to anon, authenticated;
