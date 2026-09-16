-- Unban creator inboxes and refuse future bans on those emails.

update public.profiles
set
  banned_at = null,
  banned_reason = null,
  is_admin = true
where lower(email) in ('craigmkerlin@gmail.com', 'kerlsagameshq@gmail.com');

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
  if exists (
    select 1
    from public.profiles
    where id = p_user_id
      and lower(coalesce(email, '')) in (
        'craigmkerlin@gmail.com',
        'kerlsagameshq@gmail.com'
      )
  ) then
    raise exception 'Creator accounts cannot be banned';
  end if;
  update public.profiles
  set banned_at = now(), banned_reason = nullif(trim(p_reason), '')
  where id = p_user_id and is_admin = false;
  insert into public.admin_audit (actor_id, action, target_user_id, detail)
  values (auth.uid(), 'ban', p_user_id, p_reason);
end;
$$;

grant execute on function public.ban_user(uuid, text) to authenticated;
