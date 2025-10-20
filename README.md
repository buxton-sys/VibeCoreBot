# VibeCore — Gen Z WhatsApp Bot

VibeCore is a WhatsApp bot built with Node.js that brings mini-games, link-up tools (polls, voting, splits), a Spotify-based song search, Audd voice identification for audio notes, and a private "finsta" vault with optional Google Drive backup. Plus a tiny Express dashboard to view polls and leaderboard.

This repo includes everything needed to run locally or on a VPS.

---

## What you get (features)
- `/trivia` and `/answer <n>` — quick trivia, points awarded
- `/wyr` — would-you-rather prompts
- `/tvd` — truth or dare prompt
- `/score` — your leaderboard score + top 5
- `/poll create Question | option1 | option2` — create a poll
- `/vote <pollId> <optionNumber>` — cast vote
- `/split create <amount>|name1,name2` — create split and track who paid
- `/song <query>` — Spotify text search
- `/identify` — reply to a voice note with `/identify` (Audd) to ID the song
- `/vault add <text>` — private journal entry
- `/myvault` — list your last journal entries
- `/backupvault` — backup your vault to Google Drive (service account)

---

## Dependencies
- Node.js >= 16
- npm
- Libraries: whatsapp-web.js, lowdb, express, node-fetch, form-data, googleapis, dotenv

---

## Setup (step-by-step)

1. Clone repo and `cd` into it.

2. `npm install`

3. Create `.env` file from `.env.example` and set values:
   - `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` — create an app on https://developer.spotify.com/dashboard/
   - `AUDD_API_TOKEN` — sign up at https://audd.io/
   - `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` — path to JSON key file for a Google service account with Drive API enabled
   - Optional: `GOOGLE_DRIVE_FOLDER_ID` — a folder ID where backups should be placed
   - `PORT` and `DASHBOARD_PORT` as you wish

4. For Google Drive backup:
   - Create a Google Cloud project, enable Drive API.
   - Create a service account and key (JSON). Put JSON on your server and set `GOOGLE_SERVICE_ACCOUNT_KEY_PATH` to that path.
   - If you want the files to appear in your personal Drive, share a folder with the service account email.

5. Run the bot:
   - `npm run start`
   - On first run you'll get a QR printed in the terminal. Scan it with WhatsApp (same phone account you want the bot to be).

6. Run the dashboard (separate terminal):
   - `npm run dashboard`
   - Open http://localhost:4000 (or `DASHBOARD_PORT`) to see polls and leaderboard.

---

## Testing Commands (quick)
- Send to the bot phone or chat where bot is:
  - `/trivia`
  - `/answer 2`
  - `/wyr`
  - `/poll create Best pizza? | Pepperoni | Margherita | Veggie`
  - `/vote <pollId> 2`
  - `/song Dua Lipa Levitating`  (returns top Spotify matches)
  - Reply to a voice note with `/identify` to try Audd
  - `/vault add Wrote a sick verse today.`
  - `/myvault`
  - `/backupvault` (uploads to Drive if configured)

---

## Pros & Cons — raw truth (no fluff)
### Pros
- Viral-ready: mini-games + polls = high engagement.
- Privacy-aware: vault entries stay server-side and backups are opt-in.
- Extensible: modular files — add more games or data sources easily.
- Low-cost infra: node process + small JSON file + optional Drive = cheap host.
- Simple dashboard: shareable links for quick social flex.

### Cons
- Single-file JSON DB (`lowdb`) is fine for prototypes, but not for scale or concurrency.
- WhatsApp via `whatsapp-web.js` relies on a phone session — it’s fragile compared to WhatsApp Business API.
- Audd & Spotify limits: rate limits and accuracy can bite; may need paid tiers.
- Google Drive via service account requires careful permission setup; not plug-and-play for non-devs.
- Running bot + dashboard in two processes needs caution for db.json races (use a proper DB in prod).

---

## Next-level (what to improve when ready)
- Replace lowdb with Postgres or Firebase for concurrency.
- Use WhatsApp Business API (if you can get access) for a production-grade bot and higher reliability.
- Add scheduled messages, broadcast templates, analytics, and webhooks for web dashboard interactivity.
- Add M-Pesa / mobile money integrations for paid premium features (use official APIs and comply with regulations).

---

## Monetization ideas (straight up)
- **Freemium**: basic games + small polls free. Paid tier unlocks private custom branding, bigger polls, analytics, scheduled campaigns.
- **Paid templates**: party/event linkups, wedding RSVPs, event check-ins — sell templates.
- **Branded bots**: white-label bot for SMEs (bars, clubs, small artists) with M-Pesa integration for ticketing.
- **Micro-transactions**: charge for “boosted polls” that pin poll in dashboard and share to a group of subscribers.
- **SaaS hosting**: host VibeCore for local communities — subscription per WhatsApp session.

---

## Security & Privacy notes
- Do not attempt to bypass view-once or read receipts: we respect privacy and Terms of Service.
- Vault data is stored on your server. Anyone with server access can read it — treat server as sensitive.
- For production, enable disk encryption, HTTPS, and a proper DB with auth.
- Keep your Spotify & Audd API keys secret.

---

## Final remarks
This is a complete, minimum-viable VibeCore. It’s intentionally **simple** so you can iterate fast. Want me to:
- Swap `lowdb` to Postgres and show Docker + setup?
- Add a payment endpoint (M-Pesa) for monetization ideas?
- Add a prettier dashboard with charts and a login?

Say which one and I’ll code it up next.

---

If you want, I can paste the install steps again or give you a one-liner to provision on a cheap VPS (Ubuntu) + PM2. But for now: go run `npm install`, set your `.env`, `npm run start` and start vibing. 🎧✨

Peace — raw truth served.
