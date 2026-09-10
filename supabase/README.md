# Supabase

Fuse is built to run against a Supabase project. Until `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, the Expo app uses a local realtime store (shared `localStorage` + `BroadcastChannel`) so pairing and live cards work without credentials.

## Provision

1. Create a project at [supabase.com](https://supabase.com).
2. In the SQL editor, run:
   - `supabase/migrations/001_init.sql`
   - `supabase/migrations/002_afterglow.sql` (if 001 was already applied)
   - `supabase/seed.sql` (450 default Get Spicy cards across 5 stages)
3. Enable Authentication (email, magic link, or Apple/Google).
4. Copy the project URL and anon key into `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=...
```

## Pairing RPCs

| Function | Role |
| --- | --- |
| `create_couple_for_user()` | Creates a couple row, unique 6-character `invite_code`, and copies the 200-card default bank |
| `join_couple(p_code)` | Sets `partner_b` and `paired_at` when the code matches an open couple |

Invite codes use `ABCDEFGHJKLMNPQRSTUVWXYZ23456789` (no `0/O/1/I`).

## Realtime

`couples`, `games`, `game_players`, and `game_deck` are added to `supabase_realtime` with `REPLICA IDENTITY FULL`. Subscribe on `couple_id` to push invites, setup mode, `active_card_id`, and block counts to both devices.

## Seed refresh

After editing `games/get-spicy/cards/*.json`:

```
npm run seed
```
