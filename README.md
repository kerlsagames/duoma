# Fuse

A dark, high-energy couples app: pair two phones once, play **Get Spicy**, and keep a shared **Us** account that records the relationship. Built with Expo (React Native), NativeWind, and Supabase.

Palette: rich black `#0B0B0E`, neon pink `#FF007F`, crimson `#E60039`, mist `#F4F4F6`.

## What works in this slice

- **Couple account** — One 6-character invite code. Sign out does not unpair you. Continue as [name] on welcome. Two browser tabs are two partners (`sessionStorage`).
- **Us hub**
  - Daily check-in (energy, mood weather, love tank) with tailored hints from your partner's score
  - Daily curiosity question — same prompt, hidden until both submit
  - Shared countdown widgets (anniversaries, getaways, date nights)
  - Desire matrix — matches only, non-matches stay invisible
  - Favor coupons with Accept and Redeem
  - Scratch-offs for date night, low-prep evenings, and dares
  - Appreciation jar — drop notes all week, open together
  - Date-night planner + bucket list with **Spin for Date Night**
  - Shared calendar of play nights, dates, check-ins, and rituals
- **Get Spicy** — Named cards, turns, blocks, daytime-to-private pause, ratings.

Until Supabase keys are set, everything syncs locally (`localStorage` + `BroadcastChannel`).

## Run it

```bash
npm install
npm run web
```

Open port `43127`. On a phone: `npx expo start`.

### Pairing on web

1. Tab A: **Create your pair** → copy the code.
2. Tab B: **I have a code** → join with a *different* name.
3. Or **Continue with a demo partner** (Riley) to try Us + games solo.

## Layout

```
app/(tabs)/us.tsx        Couple hub home
app/hub/                 Calendar, curiosity, desire, coupons, scratch, jar, planner
games/get-spicy/         Named-card decks
lib/hub.ts               Check-in hints, questions, scratch pools
```
