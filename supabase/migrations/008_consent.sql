-- Age, privacy, moderation consent, coarse region, time in app.
alter table public.profiles
  add column if not exists over18_at timestamptz,
  add column if not exists privacy_consent_at timestamptz,
  add column if not exists moderation_consent_at timestamptz,
  add column if not exists timezone text,
  add column if not exists active_seconds integer not null default 0;
