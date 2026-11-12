# Hunty — architecture (prototype → production)

## Today (prototype, "тестовый режим")
- Static Mini App (HTML/CSS/JS, no build step), hosted on GitHub Pages: `https://res661.github.io/hunty/`.
- `rules.js` — pure product rules (age pools, reputation math, soft-ban thresholds, message filter, safety tips). **The server must run the same rules; the client copy is display-only.**
- `mock.js` — the only backend adapter. Scripted test profiles (18+ only), typing indicator, scripted replies, partner ratings, mutual contact exchange, mock Stars purchase.
- `app.js` — UI/state. Persists to `localStorage["hunty-save-v1"]`.

To go live, implement the interface documented at the top of `mock.js` in a new `ws.js` adapter and replace one line in `app.js`:
```js
const backend = window.HuntyMock.createMockBackend(...)   // →  createWsBackend({ url, initData: tg.initData })
```

## Production backend (recommended: Cloudflare Workers + Durable Objects)
| Piece | Responsibility |
|---|---|
| Worker `/auth` | Validates Telegram `initData` (HMAC-SHA256 with key `HMAC("WebAppData", BOT_TOKEN)`, check `auth_date` < 24h). Issues a short-lived session JWT. Bot token lives only in Worker secrets. |
| D1 / Postgres | `users`, `profiles`, `chats`, `ratings`, `reports`, `blocks`, `purchases`. |
| R2 | Profile photos (resized server-side, moderated before public). |
| DO `Matchmaker` (adult pool, 18+) | Waiting queue, filters (premium), boost priority, excludes blocked pairs and the last 3 partners. **Under 18 is not admitted, so there is no teen pool to mix.** |
| DO `ChatRoom` (one per session) | WebSocket relay for both peers, server-side timer (source of truth for `dur`), message filter, typing events, `partnerLeft`. |
| Bot webhook | `/start`, Stars invoices (`createInvoiceLink`, currency `XTR`), `pre_checkout_query`, `successful_payment` → set premium, notifications (new rating, mutual contact exchange). |

Alternative: Supabase (Postgres + Realtime channels + Edge Functions for initData validation and matchmaking). Same rules apply.

## Age & safety
- Age is required at registration, minimum **18**. Under 18 cannot register or match. There is one pool. Matching prefers nearby ages (an 18-year-old more often sees 18–20). Same country or city is a soft preference, not a block.
- The prototype still refuses an age change that would cross pools, if more than one pool ever exists. With a single 18+ pool, any age from 18 up stays in that pool.
- No 18+ content for anyone. Report reasons: spam, insult, nsfw, **minor in the adult pool** (urgent queue → immediate search hold pending review), scam, other.
- Message filter (server + client): links, domains, `@usernames`, phone numbers, Telegram invites (`t.me`, `joinchat`, `+hash`) → the message is rejected, the sender gets a toast. The only way to share a Telegram @username is the mutual **Обменяться контактами** button. Chats are not stored.
- Rotating safety tips are shown on every search screen.

## Ratings (anti-boost)
- A rating is accepted only if the server-side chat duration is **≥ 30 s** and **both people sent at least 3 messages**. Skip is one tap from the first second; below that threshold there is no rating screen.
- **One rating per pair** (latest wins); a pair that keeps re-matching cannot pump each other.
- Weighted average: weight = `(0.6 + 0.4·min(1, dur/300)) · raterTrust`; raterTrust grows with account age/clean history.
- Outlier damping: ratings more than 3.5 from the median get weight × 0.35.
- Bayesian prior (mean 7.2, weight 4) — small samples drift to the middle.
- Profile shows **"Новый"** until 5 counted ratings.
- Ratings **never** trigger bans.

## Soft-ban (only from reports)
30 reports inside a rolling 24-hour window block search for 10 hours, counted from the report that crossed 30. When those 10 hours end, the app works again; the reports that already triggered the ban do not immediately start another one. A new run of 30 reports inside a 24-hour window starts another 10-hour ban. Ratings never trigger bans. "Minor" reports still go to the urgent queue. The restricted screen shows a timer; the profile stays available.

## Premium (Telegram Stars)
- Plans: week 99 ★, month 299 ★ (prices are placeholders).
- Flow: app → `POST /invoice` → Worker calls `createInvoiceLink` (XTR) → `tg.openInvoice(link)` → bot receives `successful_payment` → DB `premium_until` → app refreshes.
- Perks: clear or shorten the anti-farm search pause, filters (gender/age within own pool/city), see who rated you, 30-min boost, PRO badge. Premium never changes rating math or report rules.

## Limits
- Search is unlimited in normal use. After roughly 200–300 chats in a day, a pause of about 1–2 hours applies and is longer for rapid skips than for slow real chats. When it ends, the window resets. There is no daily counter on screen.
