# Duoma

A dark, high-energy couples app: pair two phones once, play **Get Spicy**, keep a shared **Us** account, and ping each other with **free web push**. Built with Expo (React Native web), NativeWind, and optional Supabase.

Palette: rich black `#0B0B0E`, neon pink `#FF007F`, crimson `#E60039`, mist `#F4F4F6`.

This is a Progressive Web App. You do **not** need an Apple Developer account ($99/yr) or paid hosting. Cursor writes the app; Vercel or Netlify hosts the site and the push function on their free tiers; `web-push` talks to Apple’s and Google’s push services with free VAPID keys.

## What works in this slice

- **Couple account** — One 6-character invite code. Sign out does not unpair you. Continue as [name] on welcome. Two browser tabs are two partners (`sessionStorage`).
- **PWA + web push** — Home Screen install, service worker, VAPID send API. Invites, coupons, curiosity answers, and a ready jar hit the other lock screen.
- **Home** — Daily Check-In, Calendar, four hubs, and a dotted favorites strip.
- **Connect** — Lists, Date Night Generator, Curiosity, Talk, Gratitude Jar, Apology & Reset, Thought-of-You Pings.
- **Desire** — Get Spicy, Dare Me, Roleplays (cartoon stills under each scene), Positions, Fantasy Matcher (300 short swipe cards), Secret Signals, Audio Voice Notes, Intimacy Streak.
- **Fun** — Coupons, How Well Do You Know Me (10 packs, scoreboard home), LoveBetz (propose a slip, they accept), Two Truths & A Wish, Memory Polaroids, Doodle canvas, Scoreboard, Couple Crossword, Choose-Your-Own Adventure, Virtual Scrapbook.
- **Home Base** — Groceries & Errands, Meal Decisions, Where Are We Going wheel, Fair-Share wheel, Travel itinerary, Shared budget jars, Household maintenance, Emergency vault, Who Did It Last, Settings.

- **Coupons** — 200 favor ideas across Food, Pamper, Favors, Outings, Romance, Wildcard, Escapes, Nostalgia, Relief, Surprises, and Connection.
- **Positions** — Category toggles and Pick me a Position with flat editorial pink/blue pose art.
- **Roleplays** — Care-coupon scenarios across five categories (text cards, no images).
- **Get Spicy** — Named cards, turns, blocks, daytime-to-private pause, ratings.

Until Supabase keys are set, everything syncs locally (`localStorage` + `BroadcastChannel`). Two real iPhones need the optional free Supabase table so each phone can find the other’s push endpoint.

## Run it

```bash
npm install
npx web-push generate-vapid-keys
# paste public + private keys into .env (see .env.example)
npm run web
```

`npm run web` starts Expo on port **43127** and a local push sender on **43128**. Open the site over that port.

On a phone against a deployed HTTPS URL: open in Safari or Chrome, then follow **Settings → Enable notifications**.

### Pairing on web

1. Tab A: **Create your pair** → copy the code.
2. Tab B: **I have a code** → join with a *different* name.
3. Or **Continue with a demo partner** (Riley) to try Us + games solo.

## iPhone (iOS 16.4+)

Web push does **not** run inside a regular Safari tab. Both of you:

1. Open the HTTPS site in Safari.
2. Share → **Add to Home Screen**.
3. Launch Duoma from that icon.
4. Open **Settings**, tap **Enable notifications**, and allow the prompt.

Android Chrome can subscribe from the browser tab; Home Screen install still feels like an app.

## Deploy for free (HTTPS is required)

Push will not work on `http://` except `localhost`.

Repo: [github.com/kerlsagames/duoma](https://github.com/kerlsagames/duoma)

1. Import the project on [Vercel](https://vercel.com) or [Netlify](https://www.netlify.com) (Hobby / free tier).
2. Add environment variables from `.env.example`:
   - `EXPO_PUBLIC_VAPID_PUBLIC_KEY`
   - `VAPID_PRIVATE_KEY`
   - `VAPID_SUBJECT` (a `mailto:` you own)
   - Leave `EXPO_PUBLIC_PUSH_API` **empty** in production (the app posts to `/api/push/send` on the same origin).
3. Generate production keys with `npx web-push generate-vapid-keys`. Do not reuse a sample key on a public site.
4. Optional, two real phones: create a free [Supabase](https://supabase.com) project, run `supabase/migrations/001_init.sql` through `005_push.sql`, then set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and (server-only) `SUPABASE_SERVICE_ROLE_KEY`. The Vercel cron `0 18 * * *` hits `/api/push/daily` so both lock screens get the curiosity question while the app is closed.

Vercel serverless functions live in `api/push/`. Netlify functions live in `netlify/functions/`.

## Layout

```
app/hub/settings.tsx     Card Bank, notifications, pair code, sign out
public/sw.js             Push event + notification click
public/manifest.webmanifest
api/push/send.js         Vercel: web-push + VAPID
api/push/daily.js        Vercel cron: daily curiosity
lib/push.ts              Subscribe + POST to the send API
supabase/migrations/005_push.sql
```
