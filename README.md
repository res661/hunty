# Hunty — Telegram Mini App (prototype v1)

Random chat with real people: press **Поиск**, talk, press **Дальше**. After a chat longer than a minute both sides rate it 1–10, and profiles show what a person is like to talk to (avg rating, avg chat time, number of chats).

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
