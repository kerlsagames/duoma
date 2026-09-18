# Duoma

A dark, high-energy couples app: pair two phones once, play **Get Spicy**, keep a shared **Us** account, and ping each other with **free web push**. Built with Expo (React Native web), NativeWind, and optional Supabase.

Palette: rich black `#0B0B0E`, neon pink `#FF007F`, crimson `#E60039`, mist `#F4F4F6`.

This is a Progressive Web App. You do **not** need an Apple Developer account ($99/yr) or paid hosting. Cursor writes the app; Vercel or Netlify hosts the site and the push function on their free tiers; `web-push` talks to Apple’s and Google’s push services with free VAPID keys.

## What works in this slice

- **Couple account** — One 6-character invite code. Sign out does not unpair you, and it does not wipe photos, vaults, or lists. Continue as [name] on welcome. Opening the Riley demo is a separate pair on this phone — it does not reset your live account. Two browser tabs are two partners (`sessionStorage`).
- **Safety** — Adults-only tick at sign-up covers the Terms and Privacy Policy. Photos and videos stay on the device and are not uploaded, so Duoma cannot moderate them. Home settings: Report (account and conduct), Unpair / break up, Delete account.
- **PWA + web push** — Home Screen install, service worker, VAPID send API. Invites, coupons, Discover answers, and a ready jar hit the other lock screen.
- **Home** — Daily rhythm is three circles (Check-in, Calendar, Notepad) that grow when you keep the default four favorite pins and shrink if you add more, four hubs (you can hide one in settings), and a dotted favorites strip whose spot count you pick. Shared world sits in Home settings but cannot be turned on yet. Home settings, under Favourites, has **Help, feedback or suggestions** — write a note, hit Send, and it lands on the admin Feedback tab with your name. When they send a Thought of You ping, a little Click me sits top-left of Home — tap it to read what they sent. Countdowns in Home Base can star one date — that countdown runs as a ticker just above Settings / Home / Stats. Stats and badges sit on the bar-chart button to the right of Home. Forgot a vault pin? Both of you tap Reset there.
- **Connect** — Lists, Date Night Generator (500+ ideas — spin or search, save to To-do, tick off, ask them tonight), Thought-of-You Pings, Talk (10 decks, two topics each per day), Audio Voice Notes (real microphone record & play), Gratitude Jar, Apology & Reset, Flirtatious findings (cheeky and taboo questions with your partner).
- **Desire** — Get Spicy, Spark (250 slow-burn prompts — from afar or at home; heart one, mark it completed), Dare Me (18 categories, 300 dares — heart a dare into Favourites), Roleplays (cartoon stills under each scene, heart to favourites, pick a night on the calendar then send — they accept, either of you taps Complete, and two or more days out they have that window but can finish sooner), Positions (heart into Favourites, tick off, pick a night on the calendar then send — they accept, it lands on Desire, either of you taps Complete — search opens the action box on the pose you tap), The How (28 techniques in four parts: who does what, on which part of the body, a timed try, body-word translations, optional science speak), Fantasy Matcher (swipe deck, To-do, Completed, Passed), Intimacy Streak (the fire grows with dares, spicy nights, pings & Connect — daily connection score under the dates), The Sexy Vault (shared 4- or 6-digit pin, photo/video thumbs, swipe between them, full screen, optional hide-until).
- **Fun** — Coupons, How Well Do You Know Me (30 themed card packs — answer yours and guess theirs, then wait until they’ve done both; tap their score to review how they guessed you), LoveBetz (propose a slip, they accept), Photo Memory (one weekly shot, shuffle until you lock it, clothesline gallery), Chicken (327 silly dares — send one, they cluck or commit, eggs on the board), Draw It, Daily Word, Fair Share (spin a chore or tap who did it last).
- **Home Base** — Meal Plan and Gifts sit on the same row. Countdowns (special dates — tap the important one for the home ticker, or run every countdown across it). Groceries & Errands (quick add starts with milk, bread, mince, chicken, apples, bananas), Meal Plan (post-it week, regulars, feeling lucky), Gifts (compact lists, a private list partner can’t see, year chips instead of typing), Birthdays (family & friends, onto the home calendar), Travel itinerary, Shared Goals (long-term on top, short-term list), Shared Budget (weekly or fortnight pay, bills, spending), Household maintenance, Emergency vault, Period Tracker. Each hub opens as two columns; the cog can hide, reorder, or switch to a list. Couple settings (notifications, card bank, pair code, sign out) live on the Home cog.
- **App cogs** — Every hub app has a settings cog. Colour and type size are always there (same idea as meal-plan post-its). Each app also has its own extras — jumbo Flirtatious findings cards, discreet Period title, glance-mode Budget, hide After dark on the mixtape, and so on. Hub colour still paints the Home tile.
- **Shared worlds** — Listed in Home settings. Not ready yet, so the toggle cannot be turned on.
- **Calendar** — Two tabs: Desire & Connect (recorded play) and General (birthdays, trips, jobs, your notes). Stacked month is the default; the cog also has Split (month left, notes right) and Agenda. Set reminders on General — 15 minutes before, 1 hour, 1 day, or 1 week — including for birthdays. Birthdays can take an optional year so age fills in, and you can add one from the calendar +.

- **Coupons** — 250 favor ideas across Food, Pamper, Favors, Outings, Romance, Wildcard, Escapes, Nostalgia, Relief, Surprises, and Connection.
- **Positions** — Category toggles, Pick me a Position, search the whole list (actions open on the pose you tap), heart to Favourites, tick off. Sending to your partner opens a calendar: pick the night, they accept, it lands on Desire. If the night is two or more days away they have that long, but either of you can tap Complete sooner. Rating sliders stay off until you turn them on in the cog.
- **Roleplays** — Unique scenes with a matching still. One man and one woman in every frame. Copy is written to the picture. Sending a scene uses the same calendar → accept → Complete flow as Positions.
- **Get Spicy** — Named cards, turns, blocks, daytime-to-private pause, ratings. Setup is Detailed (five stages, you set the counts, passes, and shuffles) or Keep it simple (one phone, Foreplay → Step it up → Finish Off → Afterglow). Simple cards alternate between you so both sides get a go. After an F-cums card, **Next Card, F has cum** deals the M card. After that, **Afterglow, M has cum** opens Afterglow — it does not deal more F cards.

Creator catalog tools are not in the hub. They live on a hidden route, gated by `EXPO_PUBLIC_DUOMA_ADMIN_KEY` (see `.env.example`). Edits write a catalog overlay for this origin so every couple on the same app sees the change.

When `EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY` are set, pairing and the shared slice (check-ins, position/roleplay asks, those calendar nights) live in Supabase so the other phone is not empty. Sign in with the same email on a new phone to bring lists, games, check-ins, and Daily Word back. Sexy Vault clips, voice notes, and Photo Memory shots stay on the phone — they are never uploaded. Download to phone before you switch. Without those keys, the app stays on `localStorage` + `BroadcastChannel`.

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

1. **Create your pair** — name, email, Male/Female, password (8+ characters). You land in the app. No Gmail code.
2. Home shows **Connect** until they join. Send them the invite — it includes the 6-character pair code and a link to `https://duoma.vercel.app/join?code=XXXXXX` so Join opens with the code already in the box.
3. Their phone: open the link (or **I have a code**) — their name, their email, a password, the pair code.
4. **Sign in** on the login screen with email and password. Forgot password still emails a 6-digit code. Same inbox, then set a new password in Home settings.

Email is the account (new phone, bans). The pair code is still how two people become a pair.

### Two phones, and a new phone

Pairing was never the same as “everything is in the cloud.” Your **account** (name, email, pair) already lived in Supabase. Check-ins, pose/roleplay asks, lists, calendar, games, and Daily Word copy up so a new phone can restore them after you sign in with the same email.

Sexy Vault photos and videos do **not** go to the cloud. On the vault, **Download to phone** saves a copy on that device. Restore puts it back. Voice notes and Photo Memory shots stay on-device the same way.

You still have to run SQL once in the Supabase SQL editor: `012` through `020`. The app already has your Supabase URL. It cannot create those tables by itself. Until you paste 012 and 013, a second phone can pair but will not see the asks or the backup. 014 lets `/admin` open a couple’s hubs and apps. 015 lets the Backstage passphrase list every pair. 016 lets Written show homemade cards, dares, and bets. 018 lets the passphrase read Feedback, birthdays, reports, bans, and in-app time without a second email sign-in. 019 creates the pair backup table so hubs actually leave the phone. 020 lets a phone upload after the email login expires.

Sign out does not wipe. **Unpair** is the only burn-it-down button.

Home notifications are incoming only. If you send a pose to them, you will not get their “try this?” card on your Home. They will.

Creator inbox `craigmkerlin@gmail.com` cannot be closed by a ban. That account also gets a Home flip into a Riley sandbox (a separate local pair). Nobody else sees demo mode.

## Before you send a public URL

Plain English for the launch checklist:

1. **HTTPS + Home Screen** — Put the site on Vercel or Netlify (https). Generate new VAPID keys for that live site. Leave `EXPO_PUBLIC_PUSH_API` blank there. iPhone will not ping a normal Safari tab. Both of you: Share → Add to Home Screen, open that icon, then Enable notifications.
2. **Run every SQL file** — In the Supabase SQL editor, run `001` through `020`. Stopping at `007` means Feedback and two-phone check-ins/poses will not exist in the database. 015 lists every pair from the passphrase. 016 fills Written. 018 fills Feedback, birthdays, reports, and in-app time from the passphrase. 019 is the pair backup so hubs leave the phone. 020 lets a signed-out phone still upload.
3. **Admin passphrase** — Set `EXPO_PUBLIC_DUOMA_ADMIN_KEY` to a secret you choose. `/admin` is only hidden, not locked down. Do not ship the default.
4. **Mark yourselves admin** — After you sign in once, in SQL: `update public.profiles set is_admin = true where lower(email) in ('craigmkerlin@gmail.com', 'kerlsagameshq@gmail.com');`
5. **Walk it on two real phones** — Create → type the 6-digit email code (do not tap the inbox link) → they join with the 6-character pair code → Home Screen → notifications. Sign out. Confirm photos are still there. Unpair is the only wipe.
6. **Who you invite, and reports** — Photos and videos stay on the phone, so there is nothing for you to scan or moderate in the vault. Report in the app is for account and conduct. Keep the invite list small.

## iPhone (iOS 16.4+)

Web push does **not** run inside a regular Safari tab. Both of you:

1. Open the HTTPS site in Safari.
2. Share → **Add to Home Screen**.
3. Launch Duoma from that icon.
4. Open **Settings**, tap **Enable notifications**, and allow the prompt.

Home and Welcome show those Share steps until Duoma is open from the icon. That copy cannot be dismissed while you are still in the browser. Chrome on iPhone has no Add to Home Screen button — copy the link, open Safari, paste, then Share. How-to keeps the same steps. Sign in on the icon with your password.

Android Chrome can install with **Add to Home Screen** on Home when the browser offers it, or from Chrome’s menu. Android can also subscribe from the browser tab; Home Screen still feels like an app.

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
4. Optional, two real phones: create a free [Supabase](https://supabase.com) project, run `001` through `020` in the SQL editor (do not stop at 007 — Help → admin Feedback needs `011`, two-phone check-ins and pose asks need `012`, a new phone needs `013`/`019`, admin couple drill-down needs `014`, the passphrase directory needs `015`, Written homemade cards/dares/bets need `016`, the passphrase seeing Feedback / birthdays / in-app time needs `018`, a phone whose email login expired needs `020`), then set `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_ANON_KEY`, and (server-only) `SUPABASE_SERVICE_ROLE_KEY`. After you sign in once, mark your profile admin with `update public.profiles set is_admin = true where lower(email) = 'you@email';`. The Vercel cron `0 18 * * *` hits `/api/push/daily` so both lock screens get the curiosity question while the app is closed.

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
