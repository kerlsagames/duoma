# Fuse

A dark, high-energy couples app for pairing two phones and playing **Get Spicy** in lockstep. Built with Expo (React Native), NativeWind, and Supabase.

Palette: rich black `#0B0B0E`, neon pink `#FF007F`, crimson `#E60039`, mist `#F4F4F6`.

## What works in this slice

- **6-character invite codes** — User A creates a profile, gets a code, shares it (native share sheet or copy). User B joins. Two browser tabs on the same machine also pair, so you can demo without two devices.
- **Get Spicy** — Send “Get Spicy tonight?”, accept/decline, then **Random** or **Pick Your Own**. Shared play screen: **Play Card** reveals `active_card_id` on both clients. **Block / Skip** discards the live card and draws a replacement (1–3 blocks each).
- **Four seeded decks** (50 cards each, your copy): Pre-Foreplay, Foreplay, Step It Up, Finish Off.
- **Card Bank** — View defaults, toggle Active/Inactive, add custom cards per stage.
- **Modular games** — logic lives in `/games/get-spicy` with a `/games/lets-talk` stub for the next title.

Until Supabase keys are set, the app uses a local realtime store (`localStorage` + `BroadcastChannel`) that mirrors the same `couple_id` session model.

## Run it

```bash
npm install
npm run web
```

Then open the Expo web URL (port `43127`). On a phone:

```bash
npx expo start
```

Scan the QR code with Expo Go.

### Pairing on web

1. Tab A: **Create your pair** → copy the code.
2. Tab B: **I have a code** → join.
3. Or tap **Continue with a demo partner** on the waiting screen to play solo.

## Supabase

Schema, RPCs, RLS, and Realtime publication: [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)

200 default cards: [`supabase/seed.sql`](supabase/seed.sql) (regenerate with `npm run seed`)

Setup notes: [`supabase/README.md`](supabase/README.md)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Layout

```
app/                     Expo Router screens
components/              PartnerConnectionBanner, RealtimeCardStage, GameInvitationModal
games/get-spicy/         Engine, 200-card decks, game module
games/lets-talk/         Reserved for the next game
lib/                     Local/cloud store, Supabase client, types
supabase/                Migrations + seed
```
