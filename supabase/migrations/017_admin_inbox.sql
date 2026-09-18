-- Backstage passphrase can read Help → Feedback and couple backups (birthdays, lists).
-- Run in the Supabase SQL editor after 015 and 016.

create or replace function public.admin_inbox(p_key text)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  notes jsonb := '[]'::jsonb;
  states jsonb := '[]'::jsonb;
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

  if to_regclass('public.couple_state') is not null then
    select coalesce(
      jsonb_agg(
        jsonb_build_object(
          'coupleId', cs.couple_id,
          'mini', cs.payload->'mini',
          'savedAt', coalesce(cs.payload->>'savedAt', cs.updated_at::text)
        )
      ),
      '[]'::jsonb
    )
    into states
    from public.couple_state cs;
  end if;

  return jsonb_build_object(
    'feedback', notes,
    'states', states
  );
end;
$$;

grant execute on function public.admin_inbox(text) to anon, authenticated;
