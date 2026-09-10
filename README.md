# Fuse

A dark, high-energy couples app for pairing two phones and playing **Get Spicy** in lockstep. Built with Expo (React Native), NativeWind, and Supabase.

Palette: rich black `#0B0B0E`, neon pink `#FF007F`, crimson `#E60039`, mist `#F4F4F6`.

## What works in this slice

- **Stay paired** — One 6-character invite code for the couple. Sign out does not unpair you. Welcome offers **Continue as [name]** when you already have a pair. Two browser tabs still work as two partners because the session lives in `sessionStorage`.
- **Named cards** — Every card uses `{player}` and `{partner}`. If Alex plays a finish card, both phones read **Alex, finish Riley off with oral.**
- **Turns** — You alternate who plays. **Block** means *I don’t participate in what they just played*. You cannot block your own card.
- **Daytime, then private** — Stage 1 Pre-Foreplay is for the day. When it is done, Fuse pauses until you tap **We’re ready for private sexy time**.
- **Five stages** — Pre-Foreplay, Foreplay, Step It Up, Finish Off (climax), Afterglow (post-sex care). Rate the cards you used; best ones live on You and in the Card Bank.
- **Card Bank** — Toggle Active/Inactive, add custom cards with `{player}` / `{partner}`.
- **Modular games** — logic lives in `/games/get-spicy` with a `/games/lets-talk` stub.

Until Supabase keys are set, the app uses a local realtime store (`localStorage` + `BroadcastChannel`) that mirrors the same couple session model.

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
2. Tab B: **I have a code** → join with a *different* name. Do not tap Continue in the second tab or you will log in as the same person.
3. Or tap **Continue with a demo partner** on the waiting screen to play as yourself plus Riley.

## Supabase

Schema, RPCs, RLS, and Realtime publication: [`supabase/migrations/001_init.sql`](supabase/migrations/001_init.sql)

Default decks: [`supabase/seed.sql`](supabase/seed.sql) (regenerate with `npm run seed`)

Setup notes: [`supabase/README.md`](supabase/README.md)

```
EXPO_PUBLIC_SUPABASE_URL=
EXPO_PUBLIC_SUPABASE_ANON_KEY=
```

## Layout

```
app/                     Expo Router screens
components/              PartnerConnectionBanner, RealtimeCardStage, GameInvitationModal
games/get-spicy/         Engine, named-card decks, game module
games/lets-talk/         Reserved for the next game
lib/                     Local/cloud store, personalize(), Supabase client, types
supabase/                Migrations + seed
```
