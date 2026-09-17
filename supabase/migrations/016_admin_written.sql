-- Backstage passphrase can list homemade cards, dares, and bets from couple_state.
-- Run in the Supabase SQL editor after 015.

create or replace function public.admin_written(p_key text)
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
    'cards', (
      select coalesce(jsonb_agg(item), '[]'::jsonb)
      from (
        select
          cs.couple_id as "coupleId",
          card->>'id' as id,
          card->>'title' as title,
          card->>'body' as body,
          card->>'stage' as stage,
          card->>'createdBy' as "createdBy",
          card->>'createdAt' as "createdAt"
        from public.couple_state cs
        cross join lateral jsonb_array_elements(
          coalesce(cs.payload->'db'->'cards', '[]'::jsonb)
        ) card
        where coalesce((card->>'isDefault')::boolean, true) = false
          and length(trim(coalesce(card->>'title', '') || coalesce(card->>'body', ''))) > 0
      ) item
    ),
    'spicyDares', (
      select coalesce(jsonb_agg(item), '[]'::jsonb)
      from (
        select
          cs.couple_id as "coupleId",
          dare->>'id' as id,
          dare->>'text' as text,
          dare->>'fromUserId' as "fromUserId",
          dare->>'createdAt' as "createdAt",
          dare->'categories' as categories
        from public.couple_state cs
        cross join lateral jsonb_array_elements(
          coalesce(cs.payload->'db'->'spicyDares', '[]'::jsonb)
        ) dare
        where (
          dare->'dareId' is null
          or jsonb_typeof(dare->'dareId') = 'null'
          or coalesce(dare->>'dareId', '') = ''
        )
        and length(trim(coalesce(dare->>'text', ''))) > 0
      ) item
    ),
    'chickenPlays', (
      select coalesce(jsonb_agg(item), '[]'::jsonb)
      from (
        select
          cs.couple_id as "coupleId",
          play->>'id' as id,
          play->>'text' as text,
          play->>'fromUserId' as "fromUserId",
          play->>'packId' as "packId",
          play->>'createdAt' as "createdAt"
        from public.couple_state cs
        cross join lateral jsonb_array_elements(
          coalesce(cs.payload->'db'->'chickenPlays', '[]'::jsonb)
        ) play
        where (
          play->'dareId' is null
          or jsonb_typeof(play->'dareId') = 'null'
          or coalesce(play->>'dareId', '') = ''
        )
        and length(trim(coalesce(play->>'text', ''))) > 0
      ) item
    ),
    'predictions', (
      select coalesce(jsonb_agg(item), '[]'::jsonb)
      from (
        select
          cs.couple_id as "coupleId",
          bet->>'id' as id,
          bet->>'title' as title,
          bet->>'statement' as statement,
          bet->>'createdBy' as "createdBy",
          bet->>'fromUserId' as "fromUserId",
          bet->>'createdAt' as "createdAt",
          bet->>'kind' as kind
        from public.couple_state cs
        cross join lateral jsonb_array_elements(
          coalesce(cs.payload->'mini'->'predictions', '[]'::jsonb)
        ) bet
        where length(trim(coalesce(bet->>'title', ''))) > 0
      ) item
    )
  );
end;
$$;

grant execute on function public.admin_written(text) to anon, authenticated;
