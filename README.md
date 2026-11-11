# Hunty — Telegram Mini App (prototype v2)

Random chat: press **Поиск**, talk, press **Дальше**. **Дальше** is one tap from the first second. Messages are not saved and there is no chat list or reconnect. A 1–10 rating is offered only if the chat lasted at least 30 seconds and both people sent at least 3 messages; otherwise skip goes straight to the next search with no rating screen. Profiles still show avg rating, avg time, and chat count. Contacts are shared only if both tap **Обменяться контактами**.

Bot: [@gohunty_bot](https://t.me/gohunty_bot) · Hosting: `https://res661.github.io/hunty/`

## Files
- `index.html`, `styles.css`, `app.js` — UI
- `rules.js` — age pools, rating math, soft-ban thresholds, message filter, safety tips
- `mock.js` — **test-mode backend adapter** (14 scripted profiles). Replace with a WebSocket adapter later — see `ARCHITECTURE.md`
- `.github/workflows/pages.yml` + `.nojekyll` — GitHub Pages deploy

## Deploy
1. Push to `main` of `github.com/res661/hunty`.
2. Repo Settings → Pages → Source: **GitHub Actions**.
3. BotFather → `/mybots` → @gohunty_bot → Bot Settings → Mini Apps → Main App + Menu Button → `https://res661.github.io/hunty/`.
When updating, bump `?v=` in `index.html` to bust Telegram's cache.

## Test mode tools (Профиль → Тестовый режим)
Simulate 3 reports (soft-ban screen), add 5 test ratings, reset everything. Premium purchase is mocked (no Stars are charged).
