-- New projects with "Automatically expose new tables" off need explicit grants.
-- RLS still decides who sees which row.

grant usage on schema public to anon, authenticated;

grant select on table public.catalog_overlay to anon, authenticated;
grant insert, update, delete on table public.catalog_overlay to authenticated;

grant select, insert, update on table public.profiles to authenticated;
grant select on table public.couples to authenticated;
grant select, insert, update, delete on table public.cards to authenticated;
grant select, insert, update, delete on table public.games to authenticated;
grant select, insert, update, delete on table public.game_players to authenticated;
grant select, insert, update, delete on table public.game_deck to authenticated;
grant select, insert, update, delete on table public.card_ratings to authenticated;
grant select, insert, update, delete on table public.check_ins to authenticated;
grant select, insert, update, delete on table public.curiosity_answers to authenticated;
grant select, insert, update, delete on table public.milestones to authenticated;
grant select, insert, update, delete on table public.desire_toggles to authenticated;
grant select, insert, update, delete on table public.coupons to authenticated;
grant select, insert, update, delete on table public.jar_notes to authenticated;
grant select, insert, update, delete on table public.bucket_items to authenticated;
grant select, insert, update, delete on table public.push_subscriptions to authenticated;
grant select, insert, update, delete on table public.usage_events to authenticated;
grant select on table public.admin_audit to authenticated;

grant execute on function public.create_couple_for_user() to authenticated;
grant execute on function public.join_couple(text) to authenticated;
grant execute on function public.ban_user(uuid, text) to authenticated;
grant execute on function public.unban_user(uuid) to authenticated;
grant execute on function public.track_usage(text, text, text, text) to authenticated;
grant execute on function public.is_admin() to authenticated;

alter table public.catalog_overlay replica identity full;
do $$
begin
  execute 'alter publication supabase_realtime add table public.catalog_overlay';
exception
  when duplicate_object then null;
  when undefined_object then null;
end $$;
