# Duoma

A dark, high-energy couples app: pair two phones once, play **Get Spicy**, keep a shared **Us** account, and ping each other with **free web push**. Built with Expo (React Native web), NativeWind, and optional Supabase.

Palette: rich black `#0B0B0E`, neon pink `#FF007F`, crimson `#E60039`, mist `#F4F4F6`.

This is a Progressive Web App. You do **not** need an Apple Developer account ($99/yr) or paid hosting. Cursor writes the app; Vercel or Netlify hosts the site and the push function on their free tiers; `web-push` talks to Apple’s and Google’s push services with free VAPID keys.

## What works in this slice

- **Couple account** — One 6-character invite code. Sign out does not unpair you. Continue as [name] on welcome. Two browser tabs are two partners (`sessionStorage`).
- **Safety** — Adults-only tick at sign-up. Home settings: Report (24h review), Unpair / break up (wipes shared vaults on both devices), Delete account. Sexy Vault and Photo Memory stay in the app sandbox (not Camera Roll), with a screenshot cover when the app backgrounds. Optional `EXPO_PUBLIC_MEDIA_SCAN_URL` can block a file before it is saved.
- **PWA + web push** — Home Screen install, service worker, VAPID send API. Invites, coupons, Discover answers, and a ready jar hit the other lock screen.
- **Home** — Daily rhythm is three circles (Check-in, Calendar, Notepad) that grow when you keep the default four favorite pins and shrink if you add more, four hubs (you can hide one in settings), and a dotted favorites strip whose spot count you pick. Shared world is off until you add it in Home settings (cog on the bottom bar). When they send a Thought of You ping, a little Click me sits top-left of Home — tap it to read what they sent. Countdowns in Home Base can star one date — that countdown runs as a ticker just above Settings / Home / Stats. Stats and badges sit on the bar-chart button to the right of Home. Forgot a vault pin? Both of you tap Reset there.
- **Connect** — Lists, Date Night Generator (500+ ideas — spin or search, save to To-do, tick off, ask them tonight), Thought-of-You Pings, Talk (10 decks, two topics each per day), Audio Voice Notes (real microphone record & play), Gratitude Jar, Apology & Reset, Flirtatious findings (cheeky and taboo questions with your partner).
- **Desire** — Get Spicy, Spark (250 slow-burn prompts — from afar or at home; favourite one, mark it completed), Dare Me (18 categories, 300 dares — heart a dare into To-do / Favourites), Roleplays (cartoon stills under each scene, heart to favourites), Positions (heart or save to To-do / Favourites, tick off, ask them tonight, or put it on Saturday’s calendar — search opens the action box on the pose you tap), The How (28 techniques in four parts: who does what, on which part of the body, a timed try, body-word translations, optional science speak), Fantasy Matcher (swipe deck, To-do, Completed, Passed), Intimacy Streak (the fire grows with dares, spicy nights, pings & Connect — daily connection score under the dates), The Sexy Vault (shared 4- or 6-digit pin, photo/video thumbs, swipe between them, full screen, optional hide-until).
- **Fun** — Coupons, How Well Do You Know Me (30 themed card packs — answer yours and guess theirs, then wait until they’ve done both; tap their score to review how they guessed you), LoveBetz (propose a slip, they accept), Photo Memory (one weekly shot, shuffle until you lock it, clothesline gallery), Chicken (327 silly dares — send one, they cluck or commit, eggs on the board), Draw It, Daily Word, Fair Share (spin a chore or tap who did it last).
- **Home Base** — Meal Plan and Gifts sit on the same row. Countdowns (special dates — tap the important one for the home ticker, or run every countdown across it). Groceries & Errands (quick add starts with milk, bread, mince, chicken, apples, bananas), Meal Plan (post-it week, regulars, feeling lucky), Gifts (compact lists, a private list partner can’t see, year chips instead of typing), Birthdays (family & friends, onto the home calendar), Travel itinerary, Shared Goals (long-term on top, short-term list), Shared Budget (weekly or fortnight pay, bills, spending), Household maintenance, Emergency vault, Period Tracker. Each hub opens as two columns; the cog can hide, reorder, or switch to a list. Couple settings (notifications, card bank, pair code, sign out) live on the Home cog.
- **App cogs** — Every hub app has a settings cog. Colour and type size are always there (same idea as meal-plan post-its). Each app also has its own extras — jumbo Flirtatious findings cards, discreet Period title, glance-mode Budget, hide After dark on the mixtape, and so on. Hub colour still paints the Home tile.
- **Shared worlds** — Optional. Home settings → Shared world, then lock in Sanctuary, Pocket Ecosystem / Eden, Time Capsule Town, Odyssey, or Constellation. The Home tile only appears after you add it. Activity you already do feeds the world you pick.
  - **Shared Sanctuary** — cabin → terrace → observatory; photos on the memory wall, bets on the trophy mantle, voice notes on the turntable.
  - **Pocket Ecosystem (Eden)** — 3D island when WebGL is available, flat island otherwise. Never punitive — quiet only sleeps the world.
  - **Time Capsule Town** — Memory Cinema, Grand Arena, Love Bakery, Velvet Lounge. Tap an open building to jump into that feature.
  - **The Odyssey** — fuel kilometres from the same activity; waypoints at Whispering Forest, Crystal Bay, Sunset Peaks, Uncharted Reach.
  - **The Constellation** — stars from actions, named clusters from dates, photos, and Desire.
- **Calendar** — Two tabs: Desire & Connect (recorded play) and General (birthdays, trips, jobs, your notes). Stacked month is the default; the cog also has Split (month left, notes right) and Agenda. Set reminders on General — 15 minutes before, 1 hour, 1 day, or 1 week — including for birthdays. Birthdays can take an optional year so age fills in, and you can add one from the calendar +.

- **Coupons** — 250 favor ideas across Food, Pamper, Favors, Outings, Romance, Wildcard, Escapes, Nostalgia, Relief, Surprises, and Connection.
- **Positions** — Category toggles, Pick me a Position, search the whole list (actions open on the pose you tap), heart to To-do / Favourites, tick off, ask them tonight, or schedule this Saturday. Rating sliders stay off until you turn them on in the cog.
- **Roleplays** — Unique scenes with a matching still. One man and one woman in every frame. Copy is written to the picture.
- **Get Spicy** — Named cards, turns, blocks, daytime-to-private pause, ratings. Setup is Detailed (five stages, you set the counts, passes, and shuffles) or Keep it simple (Foreplay → Step it up → Finish Off → Afterglow, flip until Ready to move on — no passes or shuffles). Finish Off cards are tagged F, M, or both; she generally cums first, and an F-only card deals a second hand of M-cums cards only.

Creator catalog tools are not in the hub. They live on a hidden route, gated by `EXPO_PUBLIC_DUOMA_ADMIN_KEY` (see `.env.example`). Edits write a catalog overlay for this origin so every couple on the same app sees the change.

When `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, pairing (email magic link + 6-character code) and creator catalog edits live in Supabase. Hub play still caches on the device until that sync lands. Without those keys, the app stays on `localStorage` + `BroadcastChannel`.

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

1. **Create your pair** — name, email, Male/Female. We email a 6-digit code. Type it in the app (do not tap the link — inboxes often burn it).
2. Home shows **Connect** until they join. Send them the 6-character pair code from that button.
3. Their phone: **I have a code** — their name, their email, the pair code, then their 6-digit email code.
4. **Sign in** on the login screen if a link expired. Same inbox, new 6-digit code. Forgot password is only there — not on Home.

Email is the account (new phone, bans). The pair code is still how two people become a pair.

Creator inbox `craigmkerlin@gmail.com` cannot be closed by a ban. That account also gets a Home flip into a Riley sandbox (a separate local pair). Nobody else sees demo mode.

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
   - `EXPO_PUBLIC_DUOMA_ADMIN_KEY` — passphrase for the hidden creator tools. Set this before a public deploy.
3. Generate production keys with `npx web-push generate-vapid-keys`. Do not reuse a sample key on a public site.
4. Optional, two real phones: create a free [Supabase](https://supabase.com) project, run `supabase/migrations/001_init.sql` through `007_grants.sql`, then set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and (server-only) `SUPABASE_SERVICE_ROLE_KEY`. After you sign in once, mark your profile admin with `update public.profiles set is_admin = true where lower(email) = 'you@email';`. The Vercel cron `0 18 * * *` hits `/api/push/daily` so both lock screens get the curiosity question while the app is closed.

## Accounts & scale

100 and 1,000 users both belong in Supabase Postgres (not in a phone’s localStorage). Keep the 6-character pair code. Email is the account — magic link, new phone, bans. Creator tools at `/admin` → Setup.

Vercel serverless functions live in `api/push/`. Netlify functions live in `netlify/functions/`.

## Layout

```
app/(tabs)/index.tsx     Home cog: layout, wallpaper, couple settings, sign out
public/sw.js             Push event + notification click
public/manifest.webmanifest
api/push/send.js         Vercel: web-push + VAPID
api/push/daily.js        Vercel cron: daily curiosity
lib/push.ts              Subscribe + POST to the send API
supabase/migrations/005_push.sql
```
