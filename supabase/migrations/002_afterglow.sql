-- Add Afterglow as stage 5 if 001 was already applied.
do $$
begin
  alter type public.card_stage add value 'afterglow';
exception
  when duplicate_object then null;
end $$;
