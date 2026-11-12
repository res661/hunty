/* Hunty v1 — UI layer. Talks to the backend only through `backend` (mock.js adapter). */
"use strict";
const tg = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== undefined ? window.Telegram.WebApp : null;
const H = window.HuntyRules;
const RULES = H.RULES;
const KEY = "hunty-save-v1";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
function placeText(p) {
  if (!p) return "";
  return [p.country, p.city].filter(Boolean).map((s) => esc(s)).join(", ");
}

/* ---------- icons ---------- */
const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  next: '<path d="M5 12h13M13 6l6 6-6 6"/>',
  more: '<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>',
  send: '<path d="M5 12l14-7-5 15-3-6z"/><path d="M11 14l8-9"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  block: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L12 6.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  rewind: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 4v4h4"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" stroke="none"/>',
  starO: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.5"/>',
  heart: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
  heartF: '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.3 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z" fill="currentColor"/>',
  clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  crown: '<path d="M4 8l4 4 4-7 4 7 4-4-2 11H6z" fill="currentColor" stroke="none"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>',
  mic: '<rect x="9" y="3.5" width="6" height="10" rx="3"/><path d="M6.5 11a5.5 5.5 0 0 0 11 0M12 16.5V20M9 20h6"/>',
  activity: '<circle cx="7" cy="7" r="1.35" fill="currentColor"/><circle cx="12" cy="7" r="1.35" fill="currentColor"/><circle cx="17" cy="7" r="1.35" fill="currentColor"/><circle cx="7" cy="12" r="1.35" fill="currentColor"/><circle cx="12" cy="12" r="1.35" fill="currentColor"/><circle cx="17" cy="12" r="1.35" fill="currentColor"/><circle cx="7" cy="17" r="1.35" fill="currentColor"/><circle cx="12" cy="17" r="1.35" fill="currentColor"/><circle cx="17" cy="17" r="1.35" fill="currentColor"/>',
  play: '<path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none"/>',
};
function ic(name, cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
}
const MASCOT_SRC = "assets/cupion-mascot.png?v=39";
function mascotImg(cls) { return `<img class="${cls || "mascot"}" src="${MASCOT_SRC}" alt="" draggable="false">`; }
function maskArt(bg) {
  const ink = "#FFF7F6";
  return `<svg class="anon-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="${bg}"/><path d="M23.6 24.6c.4-4.7 4-8.1 8.4-8.1 4.7 0 8.1 3.1 8.1 7.3 0 3.4-2 5.2-4.8 6.6-2.3 1.15-3.5 2.2-3.5 4.3v1.15" fill="none" stroke="${ink}" stroke-width="3.6" stroke-linecap="round"/><circle cx="32" cy="45.2" r="2.25" fill="${ink}"/></svg>`;
}
const MASK_ART = { red: maskArt("#E5484D") };
function anonHTML(size) {
  return `<span class="av anon ${size || ""}">${MASK_ART.red}</span>`;
}
function anonBlock() { return `<div class="anon-hero">${MASK_ART.red}</div>`; }
function paintIcons(root) {
  (root || document).querySelectorAll("[data-ic]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = ic(el.dataset.ic); });
  (root || document).querySelectorAll("[data-mark], [data-cupid]").forEach((el) => { if (!el.querySelector("img")) el.innerHTML = mascotImg(); });
  (root || document).querySelectorAll("[data-anon]").forEach((el) => { if (!el.querySelector("svg")) el.innerHTML = MASK_ART.red; });
}
const HUES = [["#FF8A6B", "#FF5B3A"], ["#8FA6FF", "#5570E8"], ["#5ED6BA", "#1FA88A"], ["#FFC866", "#F09A0E"], ["#FF9EB4", "#EC5F7F"], ["#6CCBF2", "#2591C6"], ["#B9A0FF", "#7E60E6"], ["#BCD970", "#7DA63A"], ["#FFB792", "#FF7E4F"], ["#A3AFC4", "#5E6B82"]];
function avStyle(h) { const [a, b] = HUES[(h || 0) % HUES.length]; return `--a1:${a};--a2:${b}`; }
function paintStaticAvatars() {
  document.querySelectorAll(".av[style*='--h']").forEach((el) => {
    const h = Number(getComputedStyle(el).getPropertyValue("--h")) || 0;
    el.setAttribute("style", avStyle(h));
  });
}
const FLAGS = [
  { id: "green", name: "Грин флаг", cls: "flag-green" },
  { id: "mid", name: "Жёлтый флаг", cls: "flag-mid" },
  { id: "red", name: "Ред флаг", cls: "flag-red" },
];
function flagFor(score) {
  const n = score | 0;
  if (n >= 8 && n <= 10) return FLAGS[0];
  if (n >= 5 && n <= 7) return FLAGS[1];
  if (n >= 1 && n <= 4) return FLAGS[2];
  return null;
}
function flagMark() {
  return `<svg class="flag-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M5 2.85a1.05 1.05 0 0 1 1.05 1.05v16.2a1.05 1.05 0 0 1-2.1 0V3.9A1.05 1.05 0 0 1 5 2.85z"/><path fill="currentColor" d="M6.2 4.55c2.15-.95 3.55 1.15 5.75.4 2.15-.75 3.5-1.9 5.75-.85.95.42 1.7 1.05 1.7 1.95l-.4 6.2c-.06.75-.65 1.2-1.35.95-2.2-.75-3.6.95-5.75.25-2.2-.7-3.6-2.55-5.7-1.6V4.55z"/></svg>`;
}
function flagWidget(flag, count, on, compact) {
  if (!flag) return "";
  const n = count == null ? "" : `<em>${count}</em>`;
  const name = compact ? "" : `<b>${esc(flag.name)}</b>`;
  const label = compact ? ` aria-label="${esc(flag.name)}${count == null ? "" : " " + count}"` : "";
  return `<span class="flag-w ${flag.cls}${on ? " on" : ""}${compact ? " compact" : ""}" data-f="${flag.id}"${label}>${flagMark()}${name}${n}</span>`;
}
function flagChips(counts) {
  const rows = FLAGS.map((f) => [f, counts && counts[f.id] ? counts[f.id] | 0 : 0]).filter(([, n]) => n > 0);
  if (!rows.length) return "";
  return `<div class="flag-row compact">${rows.map(([f, n]) => flagWidget(f, n, false, true)).join("")}</div>`;
}
function myFlagCounts() {
  const counts = { green: 0, mid: 0, red: 0 };
  for (const r of state.ratingsReceived || []) {
    const f = flagFor(r.score);
    if (f) counts[f.id]++;
  }
  return counts;
}
function avatarHTML(p, size) {
  const cls = "av " + (size || "");
  if (p && p.photos && p.photos[0]) return `<span class="${cls}"><img src="${p.photos[0]}" alt=""></span>`;
  const ch = ((p && p.name) || "?").trim().charAt(0).toUpperCase();
  return `<span class="${cls}" style="${avStyle(p ? p.hue : 0)}">${esc(ch)}</span>`;
}

/* ---------- state ---------- */
function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function defaultState() {
  return {
    v: 1, onboarded: false, registered: false,
    me: { id: "me_" + Math.random().toString(36).slice(2, 9), name: "", age: null, gender: "", seeking: "any", country: "", city: "", about: "", photos: [], interests: [], hue: 0, username: "" },
    settings: { theme: "auto", notif: { bot: true } },
    premium: { active: false, until: 0, plan: null },
    boostUntil: 0,
    searches: { day: todayKey(), used: 0 },
    ratingsReceived: [], raters: [], matches: [], reportsAgainstMe: [],
    ban: null, blocked: [], recentPartnerIds: [], activity: [], cooldown: null,
    reveals: { day: "", ids: [] },
    filters: { gender: "any", ageMin: null, ageMax: null, city: "" },
    totals: { chats: 0, sec: 0 },
  };
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || raw.v !== 1) return defaultState();
    const d = defaultState();
    const out = Object.assign(d, raw, { me: Object.assign(d.me, raw.me), settings: Object.assign(d.settings, raw.settings, { notif: Object.assign(d.settings.notif, (raw.settings || {}).notif) }) });
    out.history = [];
    if (!Array.isArray(out.activity)) out.activity = [];
    if (!Array.isArray(out.raters)) out.raters = [];
    if (!Array.isArray(out.matches)) out.matches = [];
    if (!Array.isArray(out.recentPartnerIds)) out.recentPartnerIds = [];
    if (!out.cooldown || typeof out.cooldown.until !== "number") out.cooldown = null;
    if (out.me.seeking !== "f" && out.me.seeking !== "m") out.me.seeking = "";
    if (out.me.gender !== "f" && out.me.gender !== "m") out.me.gender = "";
    if (!Array.isArray(out.met)) out.met = (out.recentPartnerIds || []).filter(Boolean).map((id) => ({ id, ts: Date.now() }));
    if (!out.givenByMe || typeof out.givenByMe !== "object") out.givenByMe = {};
    if (!out.settings.notif || out.settings.notif.bot == null) out.settings.notif = Object.assign({}, out.settings.notif, { bot: true });
    return out;
  } catch { return defaultState(); }
}
let state = load();
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { try { const s = JSON.parse(JSON.stringify(state)); s.me.photos = s.me.photos.slice(0, 1); localStorage.setItem(KEY, JSON.stringify(s)); toast("Мало места: сохранили только главное фото"); } catch {} }
}
function rollover() {
  if (state.searches.day !== todayKey()) state.searches = { day: todayKey(), used: 0 };
  if (state.premium.active && state.premium.until < Date.now()) state.premium = { active: false, until: 0, plan: null };
  if (state.ban && state.ban.until < Date.now()) state.ban = null;
}
const isPremium = () => state.premium.active && state.premium.until > Date.now();
const limit = () => H.dailyLimit(isPremium());
const searchesLeft = () => Math.max(0, limit() - state.searches.used);
const myPool = () => H.agePool(state.me.age);
const banned = () => state.ban && state.ban.until > Date.now();

const backend = window.HuntyMock.createMockBackend({ blocked: state.blocked });

/* ---------- telegram chrome / theme ---------- */
function haptic(kind) {
  try {
    const hf = tg && tg.HapticFeedback; if (!hf) return;
    if (kind === "success" || kind === "error" || kind === "warning") hf.notificationOccurred(kind);
    else if (kind === "select") hf.selectionChanged();
    else hf.impactOccurred(kind || "light");
  } catch {}
}
let chromeRaf = 0;
let pinRaf = 0;
let pinUntil = 0;
let renderedH = null;
let renderedTop = 0;
let lastKbSafe = null;
let lastKbHeight = 0;
let stableGuess = 0;
let insetBot = 0;
let insetKey = "";
function pinMessages() {
  const box = document.getElementById("messages");
  const chatOn = document.querySelector('[data-screen="chat"]');
  if (box && chatOn && !chatOn.classList.contains("hidden")) box.scrollTop = box.scrollHeight;
}
function scrollMessagesNow() {
  requestAnimationFrame(() => requestAnimationFrame(pinMessages));
}
function readFrame() {
  const vv = window.visualViewport;
  const vvH = vv ? vv.height : window.innerHeight;
  const vvTop = vv ? vv.offsetTop : 0;
  let stable = window.innerHeight;
  try {
    if (tg && tg.viewportStableHeight) stable = tg.viewportStableHeight;
    else {
      if (!stableGuess) stableGuess = window.innerHeight;
      if (vvH > stableGuess - 40) stableGuess = Math.max(window.innerHeight, vvH);
      stable = Math.max(stableGuess, window.innerHeight);
    }
  } catch {}
  return { vvH, vvTop, stable };
}
function paintInsets() {
  const root = document.documentElement;
  let top = 0, bot = 0, left = 0, right = 0;
  try {
    if (tg) {
      const sa = tg.safeAreaInset || {}, csa = tg.contentSafeAreaInset || {};
      top = (+sa.top || 0) + (+csa.top || 0); bot = (+sa.bottom || 0) + (+csa.bottom || 0);
      left = (+sa.left || 0) + (+csa.left || 0); right = (+sa.right || 0) + (+csa.right || 0);
    }
  } catch {}
  const app = document.getElementById("app");
  if (app && app.style.transform) app.style.transform = "";
  const key = top + "," + bot + "," + left + "," + right;
  if (key === insetKey) return;
  insetKey = key;
  insetBot = bot;
  root.style.setProperty("--tg-safe-t", top + "px");
  root.style.setProperty("--tg-safe-b", bot + "px");
  root.style.setProperty("--tg-safe-l", left + "px");
  root.style.setProperty("--tg-safe-r", right + "px");
}
function paintChrome() {
  const root = document.documentElement;
  const h = renderedH;
  root.style.setProperty("--vv-top", renderedTop + "px");
  root.style.setProperty("--vv-h", h + "px");
  root.style.setProperty("--app-h", h + "px");
  const stable = readFrame().stable;
  const span = Math.max(160, lastKbHeight || 280);
  const open = Math.max(0, Math.min(1, (stable - h) / span));
  root.style.setProperty("--kb-safe", (insetBot * (1 - open)) + "px");
  root.dataset.kb = open > 0.55 ? "1" : "0";
}
function armPin() {
  pinUntil = Math.max(pinUntil, performance.now() + 420);
  if (pinRaf) return;
  const loop = () => {
    pinMessages();
    if (performance.now() < pinUntil) pinRaf = requestAnimationFrame(loop);
    else pinRaf = 0;
  };
  pinRaf = requestAnimationFrame(loop);
}
function applyFrame() {
  paintInsets();
  const f = readFrame();
  const kbPx = Math.round(f.stable - f.vvH);
  if (kbPx > 80) lastKbHeight = kbPx;
  const span = Math.max(160, lastKbHeight || 280);
  const open = Math.max(0, Math.min(1, (f.stable - f.vvH) / span));
  const kbSafe = insetBot * (1 - open);
  const moved = renderedH !== f.vvH || renderedTop !== f.vvTop;
  const same = !moved && lastKbSafe === kbSafe;
  renderedH = f.vvH;
  renderedTop = f.vvTop;
  lastKbSafe = kbSafe;
  if (!same) paintChrome();
  if (moved) armPin();
}
function predictKb() { armPin(); }
function scheduleChrome() {
  if (chromeRaf) return;
  chromeRaf = requestAnimationFrame(() => { chromeRaf = 0; applyFrame(); });
}
function applyChrome() { applyFrame(); }
function systemTheme() {
  try {
    if (tg && (tg.colorScheme === "dark" || tg.colorScheme === "light")) return tg.colorScheme;
  } catch {}
  try { return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"; }
  catch { return "light"; }
}
const PHONE_PLATFORMS = { ios: 1, android: 1, android_x: 1 };
const DESK_PLATFORMS = { tdesktop: 1, macos: 1, web: 1, weba: 1, webk: 1, unigram: 1 };
function platformName() {
  try { return tg && tg.platform ? String(tg.platform).toLowerCase() : ""; } catch { return ""; }
}
function shellIsDesk() {
  const p = platformName();
  if (PHONE_PLATFORMS[p]) return false;
  if (DESK_PLATFORMS[p]) return true;
  const w = window.innerWidth || 0;
  let coarse = false;
  try { coarse = matchMedia("(pointer: coarse)").matches; } catch {}
  return w >= 720 || (w >= 520 && !coarse);
}
function deskFullscreenOn() {
  try {
    if (tg && tg.isFullscreen) return true;
    if (document.fullscreenElement) return true;
  } catch {}
  return false;
}
function applyShell() {
  const desk = shellIsDesk();
  document.documentElement.classList.toggle("desk", desk);
  const btn = $("desk-fs");
  if (btn) {
    const on = deskFullscreenOn();
    btn.textContent = on ? "Окно" : "На весь экран";
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  }
  return desk;
}
function toggleDeskFullscreen() {
  try {
    if (deskFullscreenOn()) {
      if (tg && tg.isFullscreen && typeof tg.exitFullscreen === "function") tg.exitFullscreen();
      else if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen();
    } else if (tg && typeof tg.requestFullscreen === "function") tg.requestFullscreen();
    else if (document.documentElement.requestFullscreen) document.documentElement.requestFullscreen();
  } catch {}
  setTimeout(() => { applyShell(); applyTheme(); }, 80);
}
const THEME_INLINE = ["--bg", "--surface", "--text", "--muted", "--secondary", "--header", "--subtitle", "--section-header", "--destructive", "--bottom-bar"];
function applyTheme() {
  const pref = state.settings.theme || "auto";
  const theme = pref === "auto" ? systemTheme() : pref;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  THEME_INLINE.forEach((k) => root.style.removeProperty(k));
  if (pref === "auto" && tg && tg.themeParams) {
    const p = tg.themeParams;
    const set = (css, val) => { if (val) root.style.setProperty(css, val); };
    set("--bg", p.secondaryBgColor || p.bgColor);
    set("--surface", p.sectionBgColor || p.bgColor);
    set("--text", p.textColor);
    set("--muted", p.hintColor);
    set("--secondary", p.secondaryBgColor);
    set("--header", p.headerBgColor || p.bgColor);
    set("--subtitle", p.subtitleTextColor || p.hintColor);
    set("--section-header", p.sectionHeaderTextColor || p.hintColor);
    set("--destructive", p.destructiveTextColor);
    set("--bottom-bar", p.bottomBarBgColor || p.bgColor);
  }
  const inlineBg = (root.style.getPropertyValue("--bg") || "").trim();
  const color = inlineBg || (theme === "dark" ? "#07060A" : "#F6F2F5");
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", color);
  try {
    if (tg && tg.setBackgroundColor) tg.setBackgroundColor(color);
    if (tg && tg.setHeaderColor) tg.setHeaderColor(color);
    if (tg && typeof tg.setBottomBarColor === "function") tg.setBottomBarColor(color);
  } catch {}
}
function requestTgFullscreen() {
  try {
    if (shellIsDesk()) return;
    if (tg && typeof tg.requestFullscreen === "function" && !tg.isFullscreen) tg.requestFullscreen();
  } catch {}
}
function initTelegram() {
  const desk = applyShell();
  if (tg) {
    try { tg.ready(); } catch {}
    try { tg.expand(); } catch {}
    try { if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes(); } catch {}
    if (!desk) requestTgFullscreen();
    let fullscreenRetryArmed = false;
    try {
      tg.onEvent("themeChanged", applyTheme);
      tg.onEvent("viewportChanged", () => { try { if (!tg.isExpanded) tg.expand(); } catch {} scheduleChrome(); });
      tg.onEvent("safeAreaChanged", scheduleChrome);
      tg.onEvent("contentSafeAreaChanged", scheduleChrome);
      tg.onEvent("fullscreenChanged", () => { applyShell(); applyTheme(); scheduleChrome(); });
      tg.onEvent("fullscreenFailed", (e) => {
        if (shellIsDesk()) return;
        const code = String((e && e.error) || "").toUpperCase();
        if (code === "ALREADY_FULLSCREEN" || fullscreenRetryArmed) return;
        fullscreenRetryArmed = true;
        const once = () => {
          window.removeEventListener("pointerdown", once);
          requestTgFullscreen();
        };
        window.addEventListener("pointerdown", once);
      });
      if (tg.BackButton) tg.BackButton.onClick(goBack);
    } catch {}
  }
  applyChrome(); applyTheme();
  window.addEventListener("resize", () => { applyShell(); applyTheme(); scheduleChrome(); pinPremiumSheet(); });
  document.addEventListener("fullscreenchange", () => { applyShell(); applyTheme(); });
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", scheduleChrome);
    visualViewport.addEventListener("scroll", scheduleChrome);
  }
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch {}
}

/* ---------- navigation ---------- */
let current = "home";
const TABS = ["home", "ratings", "profile"];
function showScreen(name, dir) {
  const prev = current;
  const changed = prev !== name;
  document.querySelectorAll(".screen").forEach((s) => {
    const on = s.dataset.screen === name;
    s.classList.toggle("hidden", !on);
    s.classList.remove("enter-fwd", "enter-back", "morph-in", "morph-chat");
  });
  current = name;
  if (changed) {
    const el = document.querySelector('.screen[data-screen="' + name + '"]');
    let reduce = false;
    try { reduce = matchMedia("(prefers-reduced-motion: reduce)").matches; } catch {}
    if (el && !reduce) {
      const kind = prev === "home" && name === "search" ? "morph-in"
        : (prev === "search" && name === "chat") ? "morph-chat"
        : (dir < 0 ? "enter-back" : "enter-fwd");
      void el.offsetWidth;
      el.classList.add(kind);
    }
  }
  $("tabbar").classList.toggle("hidden", !TABS.includes(name));
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
  requestAnimationFrame(placeTabPill);
  if (name === "home") renderHome();
  if (name === "ratings") renderRatings();
  if (name === "profile") renderProfile();
  if (name === "restricted") renderRestricted();
  try {
    if (tg && tg.BackButton) {
      if (["register", "chat", "search"].includes(name)) tg.BackButton.show();
      else tg.BackButton.hide();
    }
  } catch {}
}
function goBack() {
  if (viewerOpen()) return closeViewer();
  if (!$("sheet").classList.contains("hidden")) return closeSheet();
  if (current === "chat") {
    if (!chat || chat.ended || (chat.mine || 0) + (chat.theirs || 0) < RULES.MIN_RATE_MSGS) return leaveChat("home");
    return confirmEndChat();
  }
  if (current === "search") return cancelSearch();
  if (current === "register") {
    if (regStep > 0) { regStep -= 1; paintReg(-1); haptic("light"); return; }
    return showScreen(state.registered ? "profile" : "onboard", -1);
  }
  if (current !== "home" && TABS.includes(current)) return showScreen("home");
}

/* ---------- toast / sheet ---------- */
let toastT;
function toast(text, kind) {
  const el = $("toast");
  el.textContent = text; el.className = "toast" + (kind ? " " + kind : "");
  void el.offsetWidth; el.classList.remove("hidden");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), 2600);
}
let sheetOnClose = null;
let sheetGen = 0;
function clearPremiumDocks() {
  const top = $("prem-dock-top"), bot = $("prem-dock-bot"), sheet = $("sheet");
  if (top) top.innerHTML = "";
  if (bot) bot.innerHTML = "";
  if (sheet) {
    sheet.classList.remove("is-pro");
    sheet.style.removeProperty("--prem-top");
    sheet.style.removeProperty("--prem-bot");
  }
}
function pinPremiumSheet() {
  const sheet = $("sheet"), top = $("prem-dock-top"), bot = $("prem-dock-bot");
  if (!sheet || !sheet.classList.contains("is-pro") || !top || !bot) return;
  sheet.style.setProperty("--prem-top", (top.offsetTop + top.offsetHeight) + "px");
  sheet.style.setProperty("--prem-bot", bot.offsetHeight + "px");
}
function openSheet(html, onClose) {
  const sheet = $("sheet"), bd = $("sheet-backdrop");
  sheet.classList.remove("is-rate");
  clearPremiumDocks();
  sheetGen++;
  $("sheet-body").innerHTML = html; $("sheet-body").scrollTop = 0;
  paintIcons($("sheet-body"));
  sheet.style.transition = "";
  sheet.style.transform = "";
  sheet.classList.remove("hidden", "out", "dragging");
  bd.classList.remove("hidden", "out");
  sheetOnClose = onClose || null;
  try { if (tg && tg.BackButton) tg.BackButton.show(); } catch {}
  return $("sheet-body");
}
function closeSheet(silent) {
  const sheet = $("sheet"), bd = $("sheet-backdrop");
  if (sheet.classList.contains("hidden")) return;
  const gen = ++sheetGen;
  const alreadyOff = (sheet.style.transform || "").indexOf("110%") !== -1;
  if (!alreadyOff) sheet.classList.add("out");
  bd.classList.add("out");
  setTimeout(() => {
    if (gen !== sheetGen) return;
    sheet.classList.add("hidden"); bd.classList.add("hidden");
    sheet.classList.remove("is-rate", "is-pro", "out", "dragging");
    sheet.style.transition = "";
    sheet.style.transform = "";
  }, alreadyOff ? 40 : 280);
  const cb = sheetOnClose; sheetOnClose = null;
  if (cb && !silent) cb();
  try { if (tg && tg.BackButton && !["register", "chat", "search"].includes(current)) tg.BackButton.hide(); } catch {}
}

/* ---------- onboarding ---------- */
function obIndex() { const t = $("ob-track"); return Math.round(t.scrollLeft / Math.max(1, t.clientWidth)); }
function syncOb() {
  const i = obIndex();
  [...$("ob-dots").children].forEach((d, k) => d.classList.toggle("on", k === i));
  $("ob-next").textContent = i >= 2 ? "Создать профиль" : "Дальше";
}
function finishOnboarding() { state.onboarded = true; save(); openRegister(false); }

/* ---------- registration ---------- */
let draft = null;
let regStep = 0;
let regEdit = false;
const REG_ORDER = ["age", "name", "photos", "gender", "seek", "rules"];
const REG_TITLES = { age: "Cupion", name: "Cupion", photos: "Cupion", gender: "Cupion", seek: "Cupion", rules: "Cupion" };
const REG_LEADS = {
  age: "Сколько тебе лет?",
  name: "Как к тебе будут обращаться?",
  photos: "Добавь фото",
  gender: "Парень или девушка?",
  seek: "Кого искать?",
  rules: "Правила Cupion",
};
function regVisible() { return REG_ORDER.filter((id) => id !== "rules" || !regEdit); }
function paintReg(dir) {
  const vis = regVisible();
  if (regStep >= vis.length) regStep = vis.length - 1;
  if (regStep < 0) regStep = 0;
  const id = vis[regStep];
  const track = $("reg-track");
  const idx = Math.max(0, REG_ORDER.indexOf(id));
  if (track) {
    track.dataset.dir = dir < 0 ? "back" : "fwd";
    track.style.transform = "translate3d(" + (-idx * 100) + "%,0,0)";
  }
  document.querySelectorAll(".reg-step").forEach((el) => {
    const on = el.dataset.step === id;
    el.classList.toggle("is-current", on);
    if (on) el.scrollTop = 0;
  });
  const prog = $("reg-progress");
  if (prog) {
    [...prog.children].forEach((bar, i) => {
      const stepId = REG_ORDER[i];
      const visIdx = vis.indexOf(stepId);
      bar.classList.toggle("hidden", visIdx < 0);
      bar.classList.toggle("on", visIdx > -1 && visIdx <= regStep);
    });
    prog.setAttribute("aria-valuemax", String(vis.length));
    prog.setAttribute("aria-valuenow", String(regStep + 1));
  }
  const title = $("reg-title");
  if (title) title.textContent = regEdit ? "Редактировать" : (REG_TITLES[id] || "Профиль");
  const lead = $("reg-lead");
  if (lead) {
    lead.textContent = REG_LEADS[id] || "";
    lead.classList.toggle("hidden", !!regEdit);
  }
  const save = $("reg-save");
  if (save) save.textContent = regStep >= vis.length - 1 ? (regEdit ? "Сохранить" : "Начать") : "Дальше";
}
function validateRegStep() {
  const id = regVisible()[regStep];
  if (id === "age") {
    const age = parseInt($("f-age").value, 10);
    if (age && age < RULES.MIN_AGE) {
      flagErr($("f-age").parentElement);
      renderAgeHint();
      toast("Нужно 18 или больше. Младше в Cupion не регистрируем.", "warn");
      haptic("error");
      return false;
    }
    if (!age || age > 99) { flagErr($("f-age").parentElement); toast("Укажи возраст", "warn"); haptic("error"); return false; }
    return true;
  }
  if (id === "name") {
    const name = $("f-name").value.trim();
    if (name.length < 2) { flagErr($("f-name").parentElement); toast("Напиши имя — хотя бы 2 буквы", "warn"); haptic("error"); return false; }
    return true;
  }
  if (id === "photos") {
    if (!draft.photos.length) { flagErr($("photo-slots")); toast("Добавь хотя бы одно своё фото", "warn"); haptic("error"); return false; }
    return true;
  }
  if (id === "gender") {
    if (draft.gender !== "f" && draft.gender !== "m") { flagErr($("f-gender")); toast("Укажи пол", "warn"); haptic("error"); return false; }
    return true;
  }
  if (id === "seek") {
    if (draft.seeking !== "f" && draft.seeking !== "m") { flagErr($("f-seek")); toast("Выбери, кого искать", "warn"); haptic("error"); return false; }
    return true;
  }
  if (id === "rules") {
    if (!$("f-rules").checked) { flagErr($("rules-row")); toast("Нужно принять правила", "warn"); haptic("error"); return false; }
    return true;
  }
  return true;
}
function regAdvance() {
  if (!validateRegStep()) return;
  const vis = regVisible();
  if (regStep >= vis.length - 1) return saveRegister();
  regStep += 1;
  paintReg(1);
  haptic("light");
}
function openRegister(edit) {
  regEdit = !!edit;
  regStep = 0;
  draft = JSON.parse(JSON.stringify(state.me));
  $("rules-row").classList.toggle("hidden", !!edit);
  document.querySelectorAll("#reg-scroll .field-why").forEach((el) => el.classList.toggle("hidden", !!edit));
  $("f-name").value = draft.name || "";
  $("f-age").value = draft.age || "";
  $("f-rules").checked = !!edit;
  renderGender(); renderSeek($("f-seek"), draft.seeking || ""); renderPhotos(); renderAgeHint();
  paintReg(0);
  showScreen("register");
}
function renderGender() { [...$("f-gender").children].forEach((b) => b.classList.toggle("on", b.dataset.v === (draft.gender || ""))); }
function renderSeek(root, value) { if (!root) return; [...root.children].forEach((b) => b.classList.toggle("on", b.dataset.v === (value || ""))); }
function photoCap() { return isPremium() ? 6 : 3; }
function photoSlotsFor(list) {
  const n = (list || []).filter(Boolean).length;
  const cap = photoCap();
  return n < cap ? cap : n;
}
function renderPhotos() {
  const photos = draft.photos || [];
  const slots = Array.from({ length: photoSlotsFor(photos) }, (_, i) => {
    const src = photos[i];
    if (src) return `<div class="photo-slot ${i === 0 ? "main" : ""}" data-i="${i}"><img src="${src}" alt="">${i === 0 ? `<span class="av-preview"><img src="${src}" alt=""></span>` : ""}<button class="ps-x" data-del="${i}" aria-label="Удалить">${ic("close")}</button></div>`;
    return `<button class="photo-slot ${i === 0 ? "main" : ""}" data-add="${i}">${ic(i === 0 ? "camera" : "plus")}<span class="ps-label">${i === 0 ? "Главное" : "Ещё"}</span></button>`;
  });
  $("photo-slots").innerHTML = slots.join("");
}
function renderAgeHint() {
  const a = parseInt($("f-age").value, 10);
  const el = $("age-hint");
  if (!el) return;
  if (a && a < RULES.MIN_AGE) { el.textContent = "Нужно 18 или больше. Младше в Cupion не регистрируем."; el.classList.add("err"); el.classList.remove("hidden"); return; }
  el.textContent = ""; el.classList.add("hidden"); el.classList.remove("err");
}
function resizeImage(file) {
  return new Promise((resolve, reject) => {
    const rd = new FileReader();
    rd.onload = () => {
      const img = new Image();
      img.onload = () => {
        const max = 560, k = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        resolve(c.toDataURL("image/jpeg", 0.78));
      };
      img.onerror = reject; img.src = rd.result;
    };
    rd.onerror = reject; rd.readAsDataURL(file);
  });
}
function flagErr(el) { el.classList.remove("err"); void el.offsetWidth; el.classList.add("err"); setTimeout(() => el.classList.remove("err"), 1200); }
function saveRegister() {
  const name = $("f-name").value.trim();
  const age = parseInt($("f-age").value, 10);
  if (!draft.photos.length) { flagErr($("photo-slots")); toast("Добавь хотя бы одно своё фото", "warn"); haptic("error"); return; }
  if (name.length < 2) { flagErr($("f-name").parentElement); toast("Напиши имя — хотя бы 2 буквы", "warn"); haptic("error"); return; }
  if (!age || age < RULES.MIN_AGE || age > 99) { flagErr($("f-age").parentElement); toast(age && age < RULES.MIN_AGE ? "Нужно 18 или больше. Младше в Cupion не регистрируем." : "Укажи возраст", "warn"); haptic("error"); return; }
  if (!state.registered && !$("f-rules").checked) { flagErr($("rules-row")); toast("Нужно принять правила", "warn"); haptic("error"); return; }
  if (draft.gender !== "f" && draft.gender !== "m") { flagErr($("f-gender")); toast("Укажи пол", "warn"); haptic("error"); return; }
  if (draft.seeking !== "f" && draft.seeking !== "m") { flagErr($("f-seek")); toast("Выбери, кого искать", "warn"); haptic("error"); return; }
  const fromPool = H.agePool(state.me.age);
  const toPool = H.agePool(age);
  if (state.registered && fromPool && toPool && fromPool !== toPool) {
    toast("Так возраст не меняется", "warn"); haptic("error"); return;
  }
  draft.name = name.slice(0, 20); draft.age = age;
  draft.username = myUsername();
  draft.about = "";
  draft.hue = draft.hue || Math.floor(Math.random() * HUES.length);
  const first = !state.registered;
  state.me = draft; state.registered = true; state.onboarded = true;
  save(); backend.updateMe(publicMe());
  haptic("success");
  showScreen(first ? "home" : "profile");
  toast(first ? `Привет, ${state.me.name}! Жми «Поиск»` : "Профиль сохранён");
}
function publicMe() { const m = state.me; return { id: m.id, name: m.name, age: m.age, gender: m.gender, seeking: m.seeking === "f" || m.seeking === "m" ? m.seeking : "", country: m.country, city: m.city, premium: isPremium() }; }
const REMATCH_MS = 3 * 24 * 3600e3;
function metIds() {
  const now = Date.now();
  state.met = (state.met || []).filter((x) => x && x.id && now - x.ts < REMATCH_MS);
  return state.met.map((x) => x.id);
}
function rememberPartner(id) {
  if (!id) return;
  state.met = (state.met || []).filter((x) => x && x.id !== id);
  state.met.push({ id, ts: Date.now() });
}
const FREE_REVEALS = 5;
function revealBag() {
  const day = todayKey();
  if (!state.reveals || state.reveals.day !== day) state.reveals = { day, ids: [] };
  return state.reveals;
}
function revealsLeft() { return isPremium() ? 99 : Math.max(0, FREE_REVEALS - revealBag().ids.length); }
function revealed(id) { return isPremium() || revealBag().ids.includes(id); }
function myUsername() {
  try {
    const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u && u.username) return String(u.username).replace(/^@/, "");
  } catch {}
  return (state.me.username || "").replace(/^@/, "");
}
const recent = new Map();
let cdInt = null;
function syncCooldown() {
  if (backend && backend.mode === "test") {
    if (state.cooldown) { state.cooldown = null; state.activity = []; save(); }
    return null;
  }
  const now = Date.now();
  if (state.cooldown && state.cooldown.until > now) return state.cooldown;
  if (state.cooldown && state.cooldown.until <= now) {
    state.activity = []; state.cooldown = null; save(); return null;
  }
  const hit = H.antiFarm(state.activity, now, isPremium());
  if (!hit) return null;
  state.cooldown = { until: hit.until, rapid: !!hit.rapid, minutes: hit.minutes };
  save();
  return state.cooldown;
}
function clearCooldown() { state.cooldown = null; state.activity = []; save(); }
function fmtCooldown(until) {
  const s = Math.max(0, Math.ceil((until - Date.now()) / 1000));
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
  return h + ":" + String(m).padStart(2, "0") + ":" + String(sec).padStart(2, "0");
}

/* ---------- stats ---------- */
function fmtDur(sec) { sec = Math.max(0, Math.round(sec || 0)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }
function myRep() { return H.reputation(state.ratingsReceived); }
function statsHTML(avg, isNew, count, avgSec, chats, matches) {
  const ratingVal = isNew ? `<b class="new-tag">Новый</b><span>${count} из 5 оценок</span>` : `<b>${avg.toFixed(1)}</b><span>из ${count} ${plural(count, "оценки", "оценок", "оценок")}</span>`;
  const matchCell = matches == null ? "" : `<div class="stat"><b>${matches}</b><span>${plural(matches, "мэтч", "мэтча", "мэтчей")}</span></div>`;
  return `<div class="stat-grid${matchCell ? " has-match" : ""}">
    <div class="stat hl">${ratingVal}</div>
    <div class="stat"><b>${fmtDur(avgSec)}</b><span>ср. разговор</span></div>
    <div class="stat"><b>${chats}</b><span>${plural(chats, "чат", "чата", "чатов")}</span></div>${matchCell}</div>`;
}
function partnerStatsHTML(p) { const s = p.stats; return statsHTML(s.avg, s.count < RULES.NEW_UNTIL, s.count, s.avgSec, s.chats, s.matches); }
function myStatsHTML() {
  const r = myRep(); const t = state.totals;
  return statsHTML(r.avg || 0, r.isNew, r.count, t.chats ? t.sec / t.chats : 0, t.chats, (state.matches || []).length);
}
function ratingChip(p) {
  if (p.stats.count < RULES.NEW_UNTIL) return `<span class="new-badge">Новый</span>`;
  return `<span class="rating-chip">${ic("star")}${p.stats.avg.toFixed(1)}</span>`;
}
const proBadge = () => `<span class="pro-badge">${ic("crown")}PRO</span>`;

/* ---------- home ---------- */
let onlineCount = 0;
const TIPS = ["В чате нет имени и фото — только разговор. Мэтч в 2:30", "Средняя оценка учитывается после 5 разговоров, до этого ты «Новый»", "Короткий пропуск не меняет среднюю и не считается чатом", "Юзернейм можно написать в чат самим. Номера и чужие ссылки — нет"];
const filtersActive = () => { const f = state.filters; return f.gender !== "any" || f.ageMin || f.ageMax || f.city; };
function renderHome() {
  rollover();
  const cd = syncCooldown();
  const paused = !!cd && !banned();
  const btn = $("btn-search");
  btn.classList.toggle("off", paused || banned());
  btn.querySelector(".sb-label").textContent = banned() ? "Закрыт" : "Поиск";
  const hintEl = btn.querySelector(".sb-hint");
  if (hintEl) hintEl.textContent = banned() ? "Доступ ограничен" : "Найти собеседника";
  $("cooldown-box").classList.toggle("hidden", !paused);
  if (paused) {
    $("cd-time").textContent = fmtCooldown(cd.until);
    $("cd-sub").textContent = cd.rapid ? "Много быстрых пропусков. Поиск откроется сам." : "Слишком плотный поток чатов. После таймера всё сбросится.";
    $("cd-skip").textContent = isPremium() ? "Продолжить" : "Быстрее с PRO";
  }
  clearInterval(cdInt);
  if (paused) cdInt = setInterval(() => { if (current === "home") renderHome(); }, 1000);
  const pro = isPremium();
  const r = myRep(); const t = state.totals;
  const avg = r.isNew ? "Новый" : r.avg.toFixed(1);
  const avgSec = t.chats ? t.sec / t.chats : 0;
  $("my-stats").innerHTML = [
    `<div class="home-stat-pill hl"><b>${avg}</b><span>репутация</span></div>`,
    `<div class="home-stat-pill"><b>${fmtDur(avgSec)}</b><span>ср. разговор</span></div>`,
    `<div class="home-stat-pill"><b>${t.chats}</b><span>${plural(t.chats,"чат","чата","чатов")}</span></div>`,
  ].join("");
  const premEl = $("home-premium");
  if (!pro) {
    premEl.className = "home-pro-hint";
    premEl.innerHTML = `<span class="hph-icon" data-ic="crown"></span><div class="hph-text"><b>Cupion Premium</b><span>Голосовые и быстрее поиск</span></div><span class="hph-chev" data-ic="chev"></span>`;
    premEl.onclick = openPremium;
    paintIcons(premEl);
  } else {
    premEl.className = "home-pro-hint active-pro";
    premEl.innerHTML = `<span class="hph-icon" data-ic="crown"></span><div class="hph-text"><b>PRO активна</b><span>До ${new Date(state.premium.until).toLocaleDateString("ru-RU")}</span></div>`;
    premEl.onclick = null;
    paintIcons(premEl);
  }
  $("home-tip").innerHTML = `<span class="si coral">${ic("info")}</span><div>${TIPS[Math.floor(Date.now() / 60000) % TIPS.length]}</div>`;
  paintIcons($("home-tip"));
  paintIcons($("btn-search"));
  paintStaticAvatars();
}

/* ---------- search ---------- */
let tipTimer = null, searching = false, searchGen = 0;
function scoreHigh(n) { return n >= 8 && n <= 10; }
function mutualWrite(given, theirs) { return scoreHigh(given) && scoreHigh(theirs); }
function writeTo(personId) {
  if (!personId) return;
  if (!state.registered) return openRegister(false);
  if ((state.me.age | 0) < RULES.MIN_AGE) { toast("Нужно 18 или больше. Обнови возраст в профиле.", "warn"); haptic("error"); showScreen("profile"); return; }
  if (banned()) return showScreen("restricted");
  backend.findMatch({ preferId: personId, direct: true, fast: true }).then((m) => {
    if (!m || !m.partner) { toast("Сейчас не на связи"); return; }
    haptic("medium");
    $("radar-me").innerHTML = anonHTML();
    $("match-reveal").classList.add("hidden");
    showScreen("search");
    const gen = ++searchGen;
    searching = false;
    revealMatch(m, gen);
  }).catch((e) => {
    if (e && e.code === "cancelled") return;
    toast("Сейчас не на связи");
  });
}
function startSearch(opts) {
  opts = opts || {};
  rollover();
  if (!state.registered) return openRegister(false);
  if ((state.me.age | 0) < RULES.MIN_AGE) { toast("Нужно 18 или больше. Обнови возраст в профиле.", "warn"); haptic("error"); showScreen("profile"); return; }
  if (banned()) return showScreen("restricted");
  if (syncCooldown()) { haptic("warning"); showScreen("home"); return; }
  haptic("medium");
  $("radar-me").innerHTML = anonHTML("", state.me);
  $("srch-title").textContent = "Ищем собеседника…";
  $("srch-sub").textContent = "";
  $("srch-sub").classList.add("hidden");
  $("match-reveal").classList.add("hidden");
  showScreen("search");
  let tip = Math.floor(Math.random() * H.SAFETY_TIPS.length);
  $("safety-text").textContent = H.SAFETY_TIPS[tip++ % H.SAFETY_TIPS.length];
  clearInterval(tipTimer);
  tipTimer = setInterval(() => {
    const p = $("safety-text"); p.classList.add("swap");
    setTimeout(() => { p.textContent = H.SAFETY_TIPS[tip++ % H.SAFETY_TIPS.length]; p.classList.remove("swap"); }, 250);
  }, 2600);
  const gen = ++searchGen;
  searching = true;
  pendingMatch = null;
  finishingChat = false;
  stopFlyers();
  if (!reduceMotion()) {
    flyerSession = true;
    requestAnimationFrame(() => startWave());
  }
  const exclude = metIds().concat(state.blocked);
  const filters = null;
  backend.findMatch({ filters, exclude, fast: isPremium(), preferId: opts.preferId || "" }).then((m) => {
    if (gen !== searchGen || !searching) return;
    searching = false;
    save();
    if (m.preferMiss) toast("Сейчас не на связи. Ищем кого-то ещё");
    revealMatch(m, gen);
  }).catch((e) => {
    if (gen !== searchGen) return;
    searching = false; clearInterval(tipTimer); stopFlyers();
    if (e && e.code === "cancelled") return;
    if (e && e.code === "empty") { toast(filters ? "По фильтрам сейчас никого. Ослабь фильтры" : "Сейчас никого нет онлайн", "warn"); showScreen("home"); return; }
    toast("Не получилось соединиться", "warn"); showScreen("home");
  });
}
function cancelSearch() {
  searchGen++;
  stopBumps();
  clearInterval(tipTimer);
  clearTimeout(revealTimer); revealTimer = null;
  const el = $("match-reveal");
  if (el) { el.classList.add("hidden"); el.onclick = null; }
  searching = false;
  pendingMatch = null;
  finishingChat = false;
  stopFlyers();
  try { backend.cancelSearch(); } catch {}
  showScreen("home");
}
let revealTimer = null;
let flyerAnims = [];
let flyerCount = 0;
let flyerSession = false;
let pendingMatch = null;
let finishingChat = false;
function reduceMotion() {
  try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
}
function stopFlyers() {
  flyerSession = false;
  flyerAnims.forEach((a) => { try { a.cancel(); } catch {} });
  flyerAnims = [];
  flyerCount = 0;
  const field = $("fly-field");
  if (field) field.innerHTML = "";
}
function pulseHeart() {
  const el = document.querySelector(".searching .heart-pop");
  if (!el) return;
  el.classList.remove("arrive");
  void el.offsetWidth;
  el.classList.add("arrive");
  haptic("light");
}
function bezEase(t, p1, p2) {
  const cx = 3 * p1[0], bx = 3 * (p2[0] - p1[0]) - cx, ax = 1 - cx - bx;
  const cy = 3 * p1[1], by = 3 * (p2[1] - p1[1]) - cy, ay = 1 - cy - by;
  let u = t;
  for (let i = 0; i < 6; i++) {
    const x = ((ax * u + bx) * u + cx) * u - t;
    const dx = (3 * ax * u + 2 * bx) * u + cx;
    if (Math.abs(dx) < 1e-5) break;
    u = Math.max(0, Math.min(1, u - x / (dx || 1e-5)));
  }
  return ((ay * u + by) * u + cy) * u;
}
function cubicPt(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * p1.x + 3 * u * t * t * p2.x + t * t * t * p3.x,
    y: u * u * u * p0.y + 3 * u * u * t * p1.y + 3 * u * t * t * p2.y + t * t * t * p3.y,
  };
}
function cubicDv(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return {
    x: 3 * u * u * (p1.x - p0.x) + 6 * u * t * (p2.x - p1.x) + 3 * t * t * (p3.x - p2.x),
    y: 3 * u * u * (p1.y - p0.y) + 6 * u * t * (p2.y - p1.y) + 3 * t * t * (p3.y - p2.y),
  };
}
const FLY_FACES = ["🙂", "😊", "😌", "😉", "🌸", "⭐", "💫", "🌷"];
const FLY_EASES = [[[0.42, 0.02], [0.62, 0.28]], [[0.5, 0], [0.78, 0.32]], [[0.38, 0.08], [0.7, 0.22]], [[0.55, 0.05], [0.82, 0.4]]];
function heartPoint(field) {
  const heart = document.querySelector(".searching .heart-svg");
  const fr = field.getBoundingClientRect();
  if (!heart) return { x: fr.width / 2, y: fr.height * 0.42 };
  const hr = heart.getBoundingClientRect();
  return { x: hr.left + hr.width / 2 - fr.left, y: hr.top + hr.height * 0.46 - fr.top };
}
function onAvatarDone(anim) {
  if (!flyerAnims.includes(anim)) return;
  flyerAnims = flyerAnims.filter((a) => a !== anim);
  flyerCount = Math.max(0, flyerCount - 1);
  if (flyerSession || pendingMatch) pulseHeart();
  if (flyerCount === 0 && pendingMatch) finishToChat();
  else if (flyerCount === 0 && searching && flyerSession && !pendingMatch) {
    setTimeout(() => { if (searching && flyerSession && !pendingMatch && flyerCount === 0) startWave(); }, 240);
  }
}
function launchAvatar(field, from, to, bend, ease, delay, dur, hue, face) {
  const dx = to.x - from.x, dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  const px = -dy / len, py = dx / len;
  const c1 = { x: from.x + dx * 0.28 + px * bend, y: from.y + dy * 0.28 + py * bend };
  const c2 = { x: from.x + dx * 0.72 + px * bend * 0.22, y: from.y + dy * 0.72 + py * bend * 0.22 };
  const el = document.createElement("div");
  el.className = "fly-av";
  const pair = HUES[hue % HUES.length];
  el.style.background = "linear-gradient(160deg, " + pair[0] + ", " + pair[1] + ")";
  el.innerHTML = "<span>" + face + "</span>";
  field.appendChild(el);
  const n = 22;
  const frames = [];
  for (let i = 0; i <= n; i++) {
    const raw = i / n;
    const t = bezEase(raw, ease[0], ease[1]);
    const p = cubicPt(from, c1, c2, to, t);
    const d = cubicDv(from, c1, c2, to, Math.min(0.98, t));
    const ang = Math.atan2(d.y, d.x) * 180 / Math.PI;
    let along = 1, across = 1, o = raw < 0.08 ? raw / 0.08 : 1;
    if (raw > 0.62) {
      const k = (raw - 0.62) / 0.38;
      const g = k * k;
      along = Math.max(0.08, 1 + Math.sin(k * Math.PI) * 0.28 - g * 0.9);
      across = Math.max(0.08, 1 - g * 0.78);
      o = Math.max(0, 1 - g);
    }
    frames.push({
      transform: "translate3d(" + p.x + "px," + p.y + "px,0) translate(-50%,-50%) rotate(" + ang + "deg) scale(" + along + "," + across + ") rotate(" + (-ang) + "deg)",
      opacity: o,
      offset: raw,
    });
  }
  flyerCount++;
  const anim = el.animate(frames, { duration: dur, delay: delay, easing: "linear", fill: "forwards" });
  flyerAnims.push(anim);
  anim.onfinish = () => { el.remove(); onAvatarDone(anim); };
}
function startWave() {
  if (!flyerSession || pendingMatch || reduceMotion()) return;
  const field = $("fly-field");
  if (!field) return;
  const w = field.clientWidth, h = field.clientHeight;
  if (w < 40 || h < 40) { requestAnimationFrame(startWave); return; }
  const to = heartPoint(field);
  const spots = [[0.5, -0.08], [0.5, 1.08], [-0.1, 0.35], [1.1, 0.62], [-0.06, -0.04], [1.06, -0.02], [-0.08, 1.05], [1.08, 1.02], [0.12, -0.1], [0.88, 1.1], [-0.1, 0.78], [1.12, 0.18]];
  const n = 8 + ((Math.random() * 5) | 0);
  spots.sort(() => Math.random() - 0.5).slice(0, n).forEach((sp, i) => {
    const from = { x: sp[0] * w, y: sp[1] * h };
    const bend = (Math.random() * 2 - 1) * Math.min(130, Math.hypot(to.x - from.x, to.y - from.y) * 0.4);
    launchAvatar(field, from, to, bend, FLY_EASES[i % FLY_EASES.length], i * 90 + Math.random() * 50, 1000 + Math.random() * 400, i, FLY_FACES[i % FLY_FACES.length]);
  });
}
function finishToChat() {
  if (finishingChat) return;
  const job = pendingMatch;
  if (!job || job.gen !== searchGen) return;
  finishingChat = true;
  pendingMatch = null;
  flyerSession = false;
  const pop = document.querySelector(".searching .heart-pop");
  const go = () => {
    finishingChat = false;
    if (job.gen !== searchGen || current !== "search") return;
    clearInterval(tipTimer);
    stopFlyers();
    openChat(job.m);
  };
  if (pop && !reduceMotion()) {
    pop.classList.add("pop-final");
    haptic("success");
    setTimeout(go, 360);
  } else go();
}
function revealMatch(m, gen) {
  stopBumps();
  if (gen !== searchGen) return;
  pendingMatch = { m, gen };
  const el = $("match-reveal");
  if (el) { el.classList.add("hidden"); el.onclick = null; }
  if (!flyerSession || reduceMotion() || flyerCount === 0) finishToChat();
}

/* ---------- chat ---------- */
let chat = null, timerInt = null;
const MASK_SEC = 150;
function maskPhase(sec) {
  if (sec >= MASK_SEC) return "open";
  if (sec >= MASK_SEC - 10) return "soon";
  return "wait";
}
function openChat(m) {
  chat = { id: m.sessionId, partner: m.partner, startedAt: m.startedAt, ended: false, partnerGone: false, unlockedShown: false, masksOff: false, mine: 0, theirs: 0, contact: null, entry: null, given: null };
  if (chat.partner) chat.partner.faceShown = false;
  $("messages").innerHTML = "";
  resetThreadUi();
  paintChatFace();
  $("composer").classList.remove("hidden"); $("composer-ended").classList.add("hidden");
  $("gone-rate").classList.add("hidden");
  $("typing").classList.add("hidden");
  $("msg-input").disabled = false; $("msg-input").placeholder = "Сообщение";
  $("msg-input").value = ""; updateSend();
  rememberPartner(chat.partner.id); save();
  showScreen("chat");
  clearInterval(timerInt); tickTimer(); timerInt = setInterval(tickTimer, 1000);
}
function chatDur() { return chat ? Math.floor(((chat.endedAt || Date.now()) - chat.startedAt) / 1000) : 0; }
function paintChatFace() {
  if (!chat) return;
  const av = $("chat-avatar");
  if (av && !av.querySelector("svg")) av.innerHTML = ic("user");
  const st = $("chat-status");
  if (st) st.textContent = chat.partnerGone ? "не в сети" : (chat.typing ? "печатает…" : "в сети");
}
function paintMaskNote() {
  const el = $("mask-note");
  if (!el) return;
  if (!chat || chat.ended || chat.masksOff) { el.classList.add("hidden"); el.classList.remove("soon"); return; }
  el.classList.remove("hidden");
  if (chat.partnerGone) { el.textContent = "Мэтча не случилось"; el.classList.remove("soon"); return; }
  if (maskPhase(chatDur()) === "soon") { el.textContent = "Скоро мэтч"; el.classList.add("soon"); return; }
  el.textContent = "Мэтч через " + fmtDur(MASK_SEC - chatDur());
  el.classList.remove("soon");
}
function recordMatch() {
  if (!chat || chat.matched) return;
  chat.matched = true;
  const p = chat.partner;
  p.faceShown = true;
  state.matches = state.matches || [];
  state.matches.push({
    sessionId: chat.id, id: p.id, name: p.name, age: p.age, hue: p.hue,
    photos: p.photos || [], country: p.country, city: p.city, premium: p.premium,
    stats: p.stats, flagCounts: p.flagCounts, faceShown: true,
    dur: chatDur(), ts: Date.now(),
  });
  save();
}
function addMatchMoment() {
  const box = $("messages");
  if (!box) return;
  const el = document.createElement("div");
  el.className = "match-moment";
  el.innerHTML = `<b>Вы замэтчились</b><span>Это мэтч</span>`;
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
}
function tryUnmask() {
  if (!chat || chat.masksOff || chat.ended || chat.partnerGone) return;
  if (chatDur() < MASK_SEC) return;
  chat.masksOff = true;
  recordMatch();
  paintChatFace();
  paintMaskNote();
  addMatchMoment();
  haptic("light");
}
function tickTimer() {
  if (!chat) return;
  paintMaskNote();
  tryUnmask();
  maybeUnlock();
}
function maybeUnlock() {
  if (!chat || chat.unlockedShown || chat.ended || !chat.masksOff) return;
  if (!H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0)) return;
  chat.unlockedShown = true;
}
let msgSeq = 0, replyTo = null, holdTimer = null, holdXY = null, suppressClick = false, photoOpenTimer = null;
const REACT_SET = ["❤️", "👍", "😂", "🔥", "😢"];
const reacts = {};
function resetThreadUi() {
  replyTo = null;
  msgSeq = 0;
  Object.keys(reacts).forEach((k) => delete reacts[k]);
  const menu = $("msg-menu");
  if (menu) menu.classList.add("hidden");
  paintReplyBar();
}
function bubblePreview(el) {
  if (!el) return "";
  if (el.dataset.kind === "photo") return "Фото";
  const body = el.querySelector(".msg-body");
  const t = (body ? body.textContent : "").replace(/\s+/g, " ").trim();
  return t.length > 72 ? t.slice(0, 70) + "…" : t;
}
function paintReacts(el) {
  const r = reacts[el.dataset.mid] || {};
  let box = el.querySelector(".msg-reacts");
  const chips = [];
  if (r.me) chips.push(`<button type="button" class="react-chip mine">${r.me}</button>`);
  if (r.them) chips.push(`<span class="react-chip">${r.them}</span>`);
  el.classList.toggle("has-react", chips.length > 0);
  if (!chips.length) { if (box) box.remove(); return; }
  if (!box) { box = document.createElement("div"); box.className = "msg-reacts"; el.appendChild(box); }
  box.innerHTML = chips.join("");
}
function setMyReact(id, emoji) {
  const cur = reacts[id] || (reacts[id] = {});
  cur.me = cur.me === emoji ? null : emoji;
  const el = document.querySelector(`.msg[data-mid="${CSS.escape(id)}"]`);
  if (el) paintReacts(el);
}
function addQuote(el, reply) {
  if (!reply) return;
  const q = document.createElement("button");
  q.type = "button";
  q.className = "msg-quote";
  q.dataset.jump = reply.id;
  q.textContent = reply.preview;
  el.insertBefore(q, el.firstChild);
}
function sealBubble(el, who, kind) {
  el.dataset.mid = "m" + (++msgSeq);
  el.dataset.kind = kind;
  el.classList.add("bubble");
  if (who === "me" && replyTo) { addQuote(el, replyTo); replyTo = null; paintReplyBar(); }
}
function paintReplyBar() {
  const bar = $("reply-bar");
  if (!bar) return;
  bar.classList.toggle("hidden", !replyTo);
  const preview = $("reply-preview");
  if (preview && replyTo) preview.textContent = replyTo.preview;
}
function hideMsgMenu() { const m = $("msg-menu"); if (m) m.classList.add("hidden"); }
function showMsgMenu(el, x, y) {
  let m = $("msg-menu");
  if (!m) { m = document.createElement("div"); m.id = "msg-menu"; m.className = "msg-menu hidden"; $("app").appendChild(m); }
  m.dataset.mid = el.dataset.mid;
  m.innerHTML = `<button type="button" data-act="reply">Ответить</button><button type="button" data-act="copy">Копировать</button><button type="button" data-act="report">Пожаловаться</button>`;
  m.classList.remove("hidden");
  const app = $("app").getBoundingClientRect();
  const w = 228, h = 148;
  let left = x - app.left - 16;
  let top = y - app.top - h - 8;
  left = Math.max(8, Math.min(left, app.width - w - 8));
  if (top < 8) top = y - app.top + 10;
  m.style.left = left + "px";
  m.style.top = top + "px";
  suppressClick = true;
}
function addMsg(text, who) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "msg " + who;
  const body = document.createElement("div"); body.className = "msg-body"; body.textContent = text;
  el.appendChild(body);
  sealBubble(el, who, "text");
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function addPhoto(src, who) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "msg photo " + who;
  const img = document.createElement("img"); img.src = src; img.alt = "";
  el.appendChild(img);
  sealBubble(el, who, "photo");
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function openPhotoPaywall() {
  const body = openSheet(`<div class="sh-title">Фото в чате</div><div class="sh-sub">Отправка фото — в PRO.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="photo-pro">Подключить PRO</button><button class="btn btn-ghost" id="photo-no">Не сейчас</button></div>`);
  body.querySelector("#photo-pro").onclick = () => { closeSheet(true); setTimeout(openPremium, 220); };
  body.querySelector("#photo-no").onclick = () => closeSheet(true);
}
async function sendChatPhoto(file) {
  if (!chat || chat.ended || !file) return;
  if (!chat.masksOff) { toast("Фото откроются сами, чуть позже"); return; }
  if (!isPremium()) { openPhotoPaywall(); return; }
  try {
    const src = await resizeImage(file);
    addPhoto(src, "me"); chat.mine++; maybeUnlock();
    backend.sendPhoto(chat.id).catch(() => {});
    haptic("light");
  } catch { toast("Не удалось загрузить фото", "warn"); }
}
function addSys(text, kind) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "sys" + (kind ? " " + kind : ""); el.textContent = text;
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function updateSend() {
  const btn = $("msg-send");
  const input = $("msg-input");
  if (!btn || !input) return;
  const blocked = !chat || chat.ended || chat.partnerGone;
  const send = !!input.value.trim() && !blocked;
  btn.classList.toggle("is-send", send);
  btn.classList.toggle("is-mic", !send);
  btn.disabled = !!blocked;
  btn.innerHTML = ic(send ? "send" : "mic");
  btn.setAttribute("aria-label", send ? "Отправить" : "Голосовое");
}
function markPartnerGone() {
  if (!chat || chat.partnerGone) return;
  chat.partnerGone = true;
  $("typing").classList.add("hidden");
  addSys("Собеседник вышел");
  chat.typing = false;
  const small = $("chat-status");
  if (small) small.textContent = "не в сети";
  $("msg-input").disabled = true;
  $("msg-input").placeholder = "Собеседник вышел";
  $("msg-input").blur();
  updateSend();
  const can = chat.masksOff && H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0) && chat.given == null;
  $("gone-rate").classList.toggle("hidden", !can);
}
let voicePtr = null;
function stopVoiceTracks() {
  const v = voicePtr;
  if (!v) return;
  if (v.raf) cancelAnimationFrame(v.raf);
  if (v.rec && v.rec.state !== "inactive") { try { v.rec.stop(); } catch {} }
  if (v.stream) v.stream.getTracks().forEach((t) => t.stop());
}
function paintVoiceBars(live) {
  const box = $("voice-live");
  if (!box) return;
  const bars = live || Array.from({ length: 16 }, () => 30 + Math.round(Math.random() * 70));
  box.innerHTML = bars.map((h) => `<i style="height:${h}%"></i>`).join("");
  return bars;
}
function voiceFrame() {
  if (!voicePtr) return;
  const s = Math.floor((Date.now() - voicePtr.t0) / 1000);
  const label = $("voice-time");
  if (label) label.textContent = Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  voicePtr.bars = paintVoiceBars();
  if (s >= 60) { endVoice(true); return; }
  voicePtr.raf = requestAnimationFrame(voiceFrame);
}
async function beginVoice(e) {
  if (voicePtr) return;
  voicePtr = { id: e.pointerId, x: e.clientX, cancel: false, chunks: [], rec: null, stream: null, t0: Date.now(), bars: [], raf: 0 };
  $("composer").classList.add("recording");
  $("voice-bar").classList.remove("hidden");
  $("voice-bar").classList.remove("cancel");
  const hint = $("voice-hint");
  if (hint) hint.textContent = "Влево — отмена";
  try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (!voicePtr) { stream.getTracks().forEach((t) => t.stop()); return; }
    voicePtr.stream = stream;
    const rec = new MediaRecorder(stream);
    voicePtr.rec = rec;
    rec.ondataavailable = (ev) => { if (ev.data && ev.data.size && voicePtr) voicePtr.chunks.push(ev.data); };
    rec.start();
  } catch {}
  voiceFrame();
  haptic("light");
}
function addVoice(blob, ms, bars) {
  if (!chat) return;
  const box = $("messages");
  const el = document.createElement("div");
  el.className = "msg me voice";
  const secs = Math.max(1, Math.round(ms / 1000));
  const heights = bars && bars.length ? bars : Array.from({ length: 16 }, () => 30 + Math.round(Math.random() * 70));
  el.innerHTML = `<button type="button" class="v-play" aria-label="Слушать">${ic("play")}</button><span class="v-wave">${heights.map((h) => `<i style="height:${h}%"></i>`).join("")}</span><span class="v-len">0:${String(secs % 60).padStart(2, "0")}</span>`;
  if (blob && blob.size) el.dataset.src = URL.createObjectURL(blob);
  sealBubble(el, "me", "voice");
  box.appendChild(el);
  box.scrollTop = box.scrollHeight;
  chat.mine++;
  maybeUnlock();
}
function endVoice(send) {
  const v = voicePtr;
  if (!v) return;
  voicePtr = null;
  const dur = Date.now() - v.t0;
  $("composer").classList.remove("recording");
  $("voice-bar").classList.add("hidden");
  const cleanup = () => {
    if (v.stream) v.stream.getTracks().forEach((t) => t.stop());
  };
  const cancelled = !send || v.cancel || dur < 450;
  const deliver = (blob) => {
    cleanup();
    if (cancelled) { if (v.cancel) toast("Отменено"); return; }
    addVoice(blob, dur, v.bars);
    haptic("light");
  };
  if (v.rec && v.rec.state === "recording") {
    v.rec.onstop = () => deliver(new Blob(v.chunks, { type: v.rec.mimeType || "audio/webm" }));
    try { v.rec.stop(); } catch { deliver(null); }
    return;
  }
  if (v.raf) cancelAnimationFrame(v.raf);
  deliver(null);
}
function onVoiceMove(e) {
  if (!voicePtr || e.pointerId !== voicePtr.id) return;
  const cancel = e.clientX - voicePtr.x < -72;
  if (cancel !== voicePtr.cancel) {
    voicePtr.cancel = cancel;
    $("voice-bar").classList.toggle("cancel", cancel);
    const hint = $("voice-hint");
    if (hint) hint.textContent = cancel ? "Отмена" : "Влево — отмена";
    if (cancel) haptic("light");
  }
}
async function askContact() {
  if (!chat || chat.ended || chat.partnerGone) return;
  try {
    const r = await backend.requestContact(chat.id);
    if (r && r.status === "matched" && r.username) addSys("Контакты совпали · @" + r.username, "ok");
    else addSys("Запрос на обмен контактами отправлен");
    haptic("light");
  } catch { toast("Сейчас не получится", "warn"); }
}
function shakeField(el) { el.classList.remove("blocked"); void el.offsetWidth; el.classList.add("blocked"); setTimeout(() => el.classList.remove("blocked"), 900); }
function sendMsg() {
  const input = $("msg-input"); const text = input.value.trim();
  if (!text || !chat || chat.ended || chat.partnerGone) return;
  const bad = H.checkMessage(text);
  if (bad) { toast(bad.message, "warn"); shakeField(input.parentElement); haptic("error"); return; }
  addMsg(text, "me"); chat.mine++;
  input.value = ""; updateSend(); maybeUnlock();
  input.focus();
  backend.sendMessage(chat.id, text).catch(() => {});
  haptic("light");
}
function confirmEndChat() {
  if (!chat || chat.ended) return leaveChat("home");
  const body = openSheet(`<div class="sh-title">Закончить чат?</div><div class="sh-sub">Собеседник увидит, что ты вышел. Новый поиск сам не начнётся.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg flat" id="leave-yes">Да</button><button class="btn btn-soft btn-lg flat" id="leave-no">Остаться</button></div>`);
  body.querySelector("#leave-yes").onclick = () => { closeSheet(true); leaveChat("home"); };
  body.querySelector("#leave-no").onclick = () => closeSheet(true);
}
async function endChat() {
  if (!chat) return null;
  if (chat.ended) return chat.entry;
  chat.ended = true; chat.endedAt = Date.now();
  clearInterval(timerInt);
  const res = await backend.leave(chat.id);
  const entry = { id: chat.id, partner: chat.partner, dur: res.dur, canRate: res.canRate, given: chat.given };
  chat.entry = entry;
  recent.set(chat.id, entry);
  if (chat.matched) {
    const row = (state.matches || []).find((x) => x.sessionId === chat.id);
    if (row) row.dur = chatDur();
  }
  if (res.canRate) { state.totals.chats++; state.totals.sec += res.dur; }
  state.activity.push({ ts: Date.now(), dur: res.dur });
  if (state.activity.length > 400) state.activity.splice(0, state.activity.length - 400);
  rememberPartner(chat.partner.id);
  syncCooldown();
  save();
  if ($("messages") && current !== "chat") $("messages").innerHTML = "";
  return entry;
}
async function commitLeave(after) {
  if (chat && !chat.ended) await endChat();
  if ($("messages")) $("messages").innerHTML = "";
  afterChat(after);
}
async function leaveChat(after) {
  if (!chat) return showScreen("home");
  const can = !chat.ended && chat.masksOff && H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0) && chat.given == null;
  if (can) {
    const entry = chat.entry || { id: chat.id, partner: chat.partner, dur: chatDur(), canRate: true, given: null };
    chat.entry = entry;
    return openRateSheet(entry, after);
  }
  await commitLeave(after);
}
function afterChat(after) {
  chat = null;
  if (after === "next") startSearch(); else showScreen("home");
}

/* ---------- rating ---------- */
function openRateSheet(entry, after) {
  let score = null;
  const stay = after === "stay";
  const body = openSheet(`
    <div class="sh-title">Как прошёл разговор?</div>
    <div class="rate-hint" id="rate-hint">Выбери от 1 до 10</div>
    <div class="rate-big hidden" id="rate-big"></div>
    <div class="rate-grid" id="rate-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<button class="rate-btn" data-n="${n}">${n}</button>`).join("")}</div>
    <div class="sh-actions row"><button class="btn btn-soft rate-act" id="rate-home">${stay ? "Не сейчас" : after === "next" ? "Пропустить" : "Не сейчас"}</button><button class="btn btn-primary rate-act" id="rate-send" disabled>${stay || after !== "next" ? "Оценить" : "Оценить и дальше"}</button></div>
    <div class="rate-note">Имя и фото видны в «Мои оценки».</div>`);
  $("sheet").classList.add("is-rate");
  body.querySelector("#rate-grid").onclick = (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    score = +b.dataset.n; haptic("select");
    body.querySelectorAll(".rate-btn").forEach((x) => { x.className = "rate-btn"; });
    b.classList.add("on", score <= 4 ? "lo" : score <= 7 ? "mid" : "top");
    const hint = body.querySelector("#rate-hint"); if (hint) hint.classList.add("hidden");
    const big = body.querySelector("#rate-big"); big.classList.remove("hidden");
    big.innerHTML = `<b>${score}</b>`;
    body.querySelector("#rate-send").disabled = false;
  };
  body.querySelector("#rate-home").onclick = () => { closeSheet(true); if (!stay) commitLeave(after); };
  body.querySelector("#rate-send").onclick = async () => {
    if (!score) return;
    const r = await backend.rate(entry.id, score);
    if (r.accepted) {
      entry.given = score;
      if (!state.givenByMe) state.givenByMe = {};
      const flag = flagFor(score);
      if (chat && chat.partner && flag) {
        state.givenByMe[chat.partner.id] = score;
        const row = state.raters.find((x) => x.id === chat.partner.id);
        if (row) row.given = score;
        const meet = (state.matches || []).find((x) => x.sessionId === chat.id);
        if (meet) meet.given = score;
        const bag = chat.partner.flagCounts || (chat.partner.flagCounts = { green: 0, mid: 0, red: 0 });
        bag[flag.id] = (bag[flag.id] | 0) + 1;
        const st = chat.partner.stats;
        if (st) {
          const n0 = st.count | 0;
          const sum0 = Math.round((Number(st.avg) || 0) * n0);
          st.count = n0 + 1;
          st.avg = Math.round(((sum0 + score) / st.count) * 10) / 10;
        }
      }
      if (chat) { chat.given = score; chat.entry = entry; }
      $("gone-rate").classList.add("hidden");
      save(); haptic("success"); toast("Спасибо! Оценка учтена");
    }
    else toast(r.reason === "duplicate" ? "Ты уже оценил этот разговор" : "Оценка недоступна", "warn");
    closeSheet(true);
    if (!stay && r.accepted) commitLeave(after);
  };
}

/* ---------- partner profile / menu / report ---------- */
function photosHTML(p) {
  const n = p.photos && p.photos.length ? p.photos.length : 3;
  const tiles = [];
  for (let i = 0; i < n; i++) {
    if (p.photos && p.photos[i]) tiles.push(`<div class="ps-photo"><img src="${p.photos[i]}" alt=""></div>`);
    else { const c = HUES[((p.hue || 0) + i) % HUES.length]; tiles.push(`<div class="ps-photo" style="background:linear-gradient(${140 + i * 40}deg, ${c[0]}, ${c[1]})"><span class="ph-pattern"></span><span class="ph-initial">${esc(p.name.charAt(0))}</span><span class="ph-label">тестовое фото ${i + 1}</span></div>`); }
  }
  return `<div class="ps-photos"><div class="ps-track" id="ps-track">${tiles.join("")}</div><div class="ps-dots" id="ps-dots">${tiles.map((_, i) => `<i class="${i ? "" : "on"}"></i>`).join("")}</div></div>`;
}
function bindPhotoDots(body) {
  const tr = body.querySelector("#ps-track"); if (!tr) return;
  tr.addEventListener("scroll", () => {
    const i = Math.round(tr.scrollLeft / Math.max(1, tr.clientWidth));
    body.querySelectorAll("#ps-dots i").forEach((d, k) => d.classList.toggle("on", k === i));
  }, { passive: true });
}
function partnerShown(p) {
  if (!p) return false;
  if (chat && chat.partner && chat.partner.id === p.id) return !!chat.masksOff;
  return !!p.faceShown;
}
function openPartnerProfile(p, opts) {
  const fromChat = !!(opts && opts.lean);
  const shown = partnerShown(p);
  const photos = shown ? photosHTML(p) : anonBlock(p);
  const who = fromChat ? "" : `<div class="ps-name"><h2>${p.age ? esc(String(p.age)) + " лет" : ""}</h2>${p.premium ? `<i class="name-crown">${ic("crown")}</i>` : ""}</div>`;
  const body = openSheet(`${photos}
    ${who}
    <div class="ps-section">Репутация</div>${partnerStatsHTML(p)}
    <div class="sh-actions row"><button class="btn btn-soft flat" id="pp-report">${ic("flag")}Жалоба</button><button class="btn btn-soft flat" id="pp-block">${ic("block")}Блок</button></div>`);
  bindPhotoDots(body);
  body.querySelector("#pp-report").onclick = () => openReport(p);
  body.querySelector("#pp-block").onclick = () => confirmBlock(p);
}
function scoreLine(score, label) {
  return `<div class="given-score"><b>${score}</b><span>${label}</span></div>`;
}
function openRaterProfile(h) {
  const shown = !!h.faceShown;
  const p = { name: h.name, age: h.age, hue: h.hue, photos: shown ? (h.photos || []) : [], country: h.country, city: h.city, premium: h.premium, about: "", faceShown: shown };
  const mine = h.given != null ? h.given : (state.givenByMe && state.givenByMe[h.id]);
  const body = openSheet(`${shown ? photosHTML(p) : anonBlock()}
    <div class="ps-name"><h2>${p.age ? esc(String(p.age)) + " лет" : ""}</h2>${p.premium ? `<i class="name-crown">${ic("crown")}</i>` : ""}</div>
    ${mine != null ? scoreLine(mine, "ты поставил") : `<div class="ps-meta">ты поставил · пока без оценки</div>`}
    ${h.score != null ? scoreLine(h.score, "тебе поставили") : `<div class="ps-meta">тебе поставили · пока без оценки</div>`}`);
  bindPhotoDots(body);
}
function openReport(p) {
  let reason = null;
  const body = openSheet(`<div class="sh-title">Пожаловаться</div><div class="sh-sub">Можно сразу, даже без переписки. Собеседник не узнает, кто пожаловался.</div>
    <div class="reason-list" id="reasons">${RULES.REPORT_REASONS.map((r) => `<button class="reason" data-r="${r.id}"><span class="rd"></span>${r.label}</button>`).join("")}</div>
    <div class="block-row"><span class="lr-label">Заблокировать тоже</span><button class="toggle on" id="rep-block" aria-label="Блок"></button></div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg flat" id="rep-send" disabled>Отправить жалобу</button></div>`);
  body.querySelector("#reasons").onclick = (e) => {
    const b = e.target.closest("[data-r]"); if (!b) return;
    reason = b.dataset.r; haptic("select");
    body.querySelectorAll(".reason").forEach((x) => x.classList.toggle("on", x === b));
    body.querySelector("#rep-send").disabled = false;
  };
  const tgl = body.querySelector("#rep-block"); tgl.onclick = () => tgl.classList.toggle("on");
  body.querySelector("#rep-send").onclick = async () => {
    const alsoBlock = tgl.classList.contains("on");
    const r = await backend.report(p.id, reason, chat && chat.id);
    if (alsoBlock) await doBlock(p);
    haptic("success"); closeSheet(true);
    toast(r.urgent ? "Жалоба отправлена на срочную проверку" : "Жалоба отправлена. Спасибо!");
  };
}
function confirmBlock(p) {
  const body = openSheet(`<div class="sh-title">Заблокировать?</div><div class="sh-sub">Вы больше не попадёте друг на друга. Отменить можно в профиле.</div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg flat" id="blk-yes">Заблокировать</button><button class="btn btn-ghost flat" id="blk-no">Отмена</button></div>`);
  body.querySelector("#blk-no").onclick = () => closeSheet(true);
  body.querySelector("#blk-yes").onclick = async () => {
    await doBlock(p); closeSheet(true); toast("В блоке"); haptic("success");
    refresh();
  };
}
async function doBlock(p) { if (!state.blocked.includes(p.id)) state.blocked.push(p.id); await backend.block(p.id); save(); }
function showEnded() { $("composer").classList.add("hidden"); $("composer-ended").classList.remove("hidden"); $("typing").classList.add("hidden"); }

/* ---------- profile tab ---------- */
function renderMyPhotos() {
  const photos = state.me.photos || [];
  $("p-photos").innerHTML = Array.from({ length: photoSlotsFor(photos) }, (_, i) => {
    const src = photos[i];
    if (src) return `<div class="photo-slot ${i === 0 ? "main" : ""}"><img src="${src}" alt="">${i === 0 ? `<span class="av-preview"><img src="${src}" alt=""></span>` : ""}<button class="ps-x" data-del="${i}" type="button" aria-label="Удалить">${ic("close")}</button></div>`;
    return `<button class="photo-slot ${i === 0 ? "main" : ""}" type="button" data-add="${i}">${ic(i === 0 ? "camera" : "plus")}<span class="ps-label">${i === 0 ? "Главное" : "Ещё"}</span></button>`;
  }).join("");
}
let profileLock = false;
function finishProfileField(el) {
  if (!el || profileLock) return;
  profileLock = true;
  try {
  const id = el.id;
  if (id === "p-name") {
    const name = el.value.trim();
    if (name.length < 2) { toast("Напиши имя — хотя бы 2 буквы", "warn"); el.value = state.me.name || ""; haptic("error"); el.blur(); return; }
    state.me.name = name.slice(0, 20);
  } else if (id === "p-age") {
    const age = parseInt(el.value, 10);
    if (!age || age < RULES.MIN_AGE || age > 99) { toast(age && age < RULES.MIN_AGE ? "Нужно 18 или больше. Младше в Cupion не регистрируем." : "Укажи возраст", "warn"); el.value = state.me.age || ""; haptic("error"); el.blur(); return; }
    const fromPool = H.agePool(state.me.age);
    const toPool = H.agePool(age);
    if (fromPool && toPool && fromPool !== toPool) { toast("Так возраст не меняется", "warn"); el.value = state.me.age; haptic("error"); el.blur(); return; }
    state.me.age = age;
  } else return;
  state.me.about = "";
  save(); backend.updateMe(publicMe());
  paintHero();
  if (document.activeElement === el) el.blur();
  } finally { profileLock = false; }
}
function confirmResetActivity() {
  if (!isPremium()) { haptic("warning"); return openPremium(); }
  const body = openSheet(`<div class="sh-title">Сбросить статистику?</div><div class="sh-sub">Чаты, среднее время и список мэтчей. Оценки и «Мои оценки» останутся.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="rst-act">Сбросить</button><button class="btn btn-ghost" id="rst-act-no">Отмена</button></div>`);
  body.querySelector("#rst-act-no").onclick = () => closeSheet(true);
  body.querySelector("#rst-act").onclick = () => {
    state.totals = { chats: 0, sec: 0 };
    state.matches = [];
    save();
    closeSheet(true);
    toast("Статистика общения сброшена");
    renderProfile();
    if (current === "home") renderHome();
  };
}
function renderProTools() {
  const box = $("pro-tools");
  if (!box) return;
  box.innerHTML = `<div class="card mask-card"><button class="btn btn-soft" id="reset-activity" type="button">Сбросить статистику</button></div>`;
  box.querySelector("#reset-activity").onclick = confirmResetActivity;
}
function scoreBit(n, label) {
  const miss = n == null || n === "";
  return `<span class="score-bit${miss ? " miss" : ""}"><em>${label}</em><b>${miss ? "Пока без оценки" : n}</b></span>`;
}
function scorePair(given, theirs) {
  return `<span class="pair-scores">${scoreBit(given, "ты поставил")}${scoreBit(theirs, "тебе поставили")}</span>`;
}
function givenFor(personId, explicit) {
  if (explicit != null) return explicit;
  return state.givenByMe && personId && state.givenByMe[personId] != null ? state.givenByMe[personId] : null;
}
function renderMyMatches() {
  const box = $("my-matches");
  if (!box) return;
  const rows = [...(state.matches || [])].reverse();
  const head = `<div class="card-head"><h3>Мэтчи</h3></div><p class="match-sub">С кем дошли до 2:30</p>`;
  if (!rows.length) {
    box.innerHTML = head + `<p class="hint">Пока нет. Мэтч — если дойти до 2:30.</p>`;
    return;
  }
  box.innerHTML = head + rows.map((m) => {
    const mine = givenFor(m.id, m.given);
    const open = mutualWrite(mine, m.theirScore);
    const title = open ? `${esc(m.name)}${m.age ? ", " + m.age : ""}` : (m.age ? esc(String(m.age)) + " лет" : "Мэтч");
    const write = open ? `<button class="write-btn" type="button" data-write="${esc(m.id)}">Написать</button>` : "";
    return `<div class="match-row${open ? " can-write" : ""}"><button class="match-main" type="button" data-mid="${esc(m.sessionId)}">${avatarHTML(m, "sm")}<span class="rater-main"><b>${title}</b><span class="hint">${fmtDur(m.dur)}</span>${scorePair(mine, m.theirScore)}</span></button>${write}<button class="match-again" type="button" data-again="${esc(m.id)}">Ещё раз</button></div>`;
  }).join("");
}
function paintPremBanner() {
  const el = $("prem-banner");
  if (!el) return;
  const pro = isPremium();
  el.classList.toggle("is-on", pro);
  el.innerHTML = `<span class="prem-glow" aria-hidden="true"></span><span class="prem-art" aria-hidden="true"><svg viewBox="0 0 200 180"><path fill="#fff" d="M100 158C62 128 24 104 24 66 24 40 44 22 70 22c16 0 26 8 30 20 4-12 14-20 30-20 26 0 46 18 46 44 0 38-38 62-76 92z"/><ellipse cx="74" cy="52" rx="22" ry="12" fill="#fff" opacity=".55" transform="rotate(-32 74 52)"/></svg></span><span class="prem-copy"><b>Cupion Premium</b><small>${pro ? "Активна до " + new Date(state.premium.until).toLocaleDateString("ru-RU") : "Голосовые сообщения"}</small></span><span class="prem-go">${ic("chev")}</span>`;
}
function paintHero() {
  const el = $("profile-hero");
  if (!el) return;
  const m = state.me;
  const r = myRep();
  const num = r.isNew ? "Новый" : "Рейтинг " + (r.avg || 0).toFixed(1);
  const av = (m.photos && m.photos[0]) ? avatarHTML(m, "xl") : `<span class="av xl" style="${avStyle(m.hue)}">${esc(((m.name || "?").trim().charAt(0) || "?").toUpperCase())}</span>`;
  el.innerHTML = `${av}<h1>${esc(m.name || "Без имени")}</h1><p class="profile-meta">${num}</p>`;
}
function renderProfile() {
  const m = state.me;
  const set = (id, val) => { const el = $(id); if (el && document.activeElement !== el) el.value = val == null ? "" : val; };
  set("p-name", m.name || "");
  set("p-age", m.age || "");
  renderSeek($("p-gender"), m.gender);
  renderSeek($("p-seek"), m.seeking);
  renderMyPhotos();
  paintPremBanner();
  paintHero();
  renderMyMatches();
  renderProTools();
  const wr = $("who-rated-bottom");
  wr.textContent = "Мои оценки";
  wr.onclick = () => showScreen("ratings");
  [...$("theme-seg").children].forEach((b) => b.classList.toggle("on", b.dataset.v === state.settings.theme));
  $("notif-list").innerHTML = `<div class="list-row"><span class="lr-ic t-coral">${ic("bell")}</span><span class="lr-label">Уведомления от бота</span><button class="toggle ${state.settings.notif.bot ? "on" : ""}" data-n="bot" aria-label="Уведомления от бота"></button></div>`;
  $("blocked-count").textContent = state.blocked.length;
}

/* ---------- premium ---------- */
const PLANS = [
  { id: "three", name: "3 дня", stars: 30, note: "3 дня" },
  { id: "week", name: "Неделя", stars: 90, note: "7 дней" },
  { id: "two", name: "14 дней", stars: 150, note: "14 дней" },
  { id: "month", name: "Месяц", stars: 240, note: "30 дней" },
];
function openPremium() {
  let plan = "week";
  const pro = isPremium();
  const feats = [["mic", "Голосовые", "сообщения в чате"], ["search", "Быстрее поиск", ""], ["clock", "Без паузы", "после частых «Дальше»"], ["crown", "Корона", "на аватаре"], ["trash", "Сбросить статистику", "чаты и мэтчи"], ["rewind", "Ещё раз", "найти того же"]];
  openSheet(`<div class="feat-list">${feats.map(([i, b, s]) => `<div class="feat"><span class="lr-ic">${ic(i)}</span><div><b>${b}</b>${s ? `<small>${s}</small>` : ""}</div></div>`).join("")}</div>
    <div class="plans" id="plans">${PLANS.map((p) => `<button class="plan ${p.id === plan ? "on" : ""}" data-p="${p.id}" type="button"><b>${p.name}</b><span class="price">${ic("star")}${p.stars}</span></button>`).join("")}</div>`);
  $("prem-dock-top").innerHTML = `<div class="pay-stack"><div class="pay-back a"></div><div class="pay-back b"></div><div class="pay-front"><span class="prem-badge">${pro ? "Активна" : "Premium"}</span><h2>Голосовые<br><span>Cupion Premium</span></h2></div></div>`;
  $("prem-dock-bot").innerHTML = `<button class="btn btn-gradient btn-lg" id="buy" type="button">Подключить · ${PLANS[1].stars} ★</button>`;
  $("sheet").classList.add("is-pro");
  paintIcons($("sheet"));
  requestAnimationFrame(pinPremiumSheet);
  const sheet = $("sheet");
  sheet.querySelector("#plans").onclick = (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    plan = b.dataset.p; haptic("select");
    sheet.querySelectorAll(".plan").forEach((x) => x.classList.toggle("on", x === b));
    $("buy").textContent = `Подключить · ${PLANS.find((p) => p.id === plan).stars} ★`;
  };
  $("buy").onclick = () => payFlow(PLANS.find((p) => p.id === plan));
}
function payFlow(plan) {
  const body = openSheet(`<div class="pay-box"><div class="sh-title">Оплата Telegram Stars</div><div class="stars">${ic("star")}${plan.stars}</div>
    <div class="sh-sub">PRO подписка · ${plan.note}<br>Тестовый режим: звёзды не списываются.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="pay-ok">Подтвердить</button><button class="btn btn-ghost" id="pay-no">Отмена</button></div></div>`);
  body.querySelector("#pay-no").onclick = () => closeSheet(true);
  body.querySelector("#pay-ok").onclick = async () => {
    body.innerHTML = `<div class="pay-box"><div class="spinner"></div><div class="sh-sub">Проводим оплату…</div></div>`;
    const r = await backend.purchasePremium(plan.id);
    if (!r.ok) { closeSheet(true); return toast("Оплата не прошла", "warn"); }
    state.premium = { active: true, until: r.until, plan: plan.id };
    if (state.cooldown) clearCooldown();
    save(); backend.updateMe(publicMe());
    haptic("success");
    body.innerHTML = `<div class="pay-box"><div class="success-ic">${ic("check")}</div><div class="sh-title">PRO подписка</div><div class="sh-sub">Активна до ${new Date(r.until).toLocaleDateString("ru-RU")}.</div><div class="sh-actions"><button class="btn btn-primary btn-lg" id="pay-done">Хорошо</button></div></div>`;
    body.querySelector("#pay-done").onclick = () => closeSheet(true);
    refresh();
  };
}
function requirePro(fn) { return () => { if (!isPremium()) { haptic("warning"); return openPremium(); } fn(); }; }
function ratingRows() {
  const fromMatches = (state.matches || []).map((m) => ({
    rid: m.sessionId, personId: m.id, name: m.name, age: m.age, hue: m.hue,
    photos: m.photos || [], premium: m.premium, faceShown: true, dur: m.dur,
    given: givenFor(m.id, m.given), theirs: m.theirScore == null ? null : m.theirScore, ts: m.ts || 0,
  }));
  const seen = new Set(fromMatches.map((r) => r.personId).filter(Boolean));
  const extra = (state.raters || []).filter((h) => h && !seen.has(h.id)).map((h) => ({
    rid: h.id || (h.name + ":" + h.ts), personId: h.id, name: h.name, age: h.age, hue: h.hue,
    photos: h.photos || [], premium: h.premium, faceShown: !!h.faceShown, dur: h.dur,
    given: givenFor(h.id, h.given), theirs: h.score == null ? null : h.score, ts: h.ts || 0,
  }));
  return fromMatches.concat(extra).sort((a, b) => b.ts - a.ts);
}
function renderRatings() {
  const rows = ratingRows();
  const sub = $("ratings-sub");
  if (sub) sub.textContent = "После мэтча в 2:30";
  const box = $("rater-list");
  if (!box) return;
  box.innerHTML = rows.length ? rows.map((h) => {
    const open = mutualWrite(h.given, h.theirs);
    const face = (open || h.faceShown) ? avatarHTML(h, "sm") : anonHTML("sm");
    const title = open ? `${esc(h.name)}${h.age ? ", " + h.age : ""}` : (h.age ? esc(String(h.age)) + " лет" : "Мэтч");
    const write = open ? `<button class="write-btn" type="button" data-write="${esc(h.personId || "")}">Написать</button>` : "";
    return `<article class="oc-row${open ? " can-write" : ""}" data-rid="${esc(h.rid)}"><div class="oc-who">${face}<div><b>${title}</b><span>${fmtDur(h.dur)}</span></div>${write}</div>${scorePair(h.given, h.theirs)}</article>`;
  }).join("") : `<div class="oc-empty">Пока нет. Оценка — после мэтча в 2:30.</div>`;
}
function openRevealPaywall() {
  const body = openSheet(`<div class="sh-title">Лимит открытий</div><div class="sh-sub">Бесплатно ${FREE_REVEALS} в день. В PRO — без лимита.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="rev-pro">Подключить PRO</button><button class="btn btn-ghost" id="rev-no">Не сейчас</button></div>`);
  body.querySelector("#rev-pro").onclick = () => { closeSheet(true); setTimeout(openPremium, 220); };
  body.querySelector("#rev-no").onclick = () => closeSheet(true);
}
function revealRater(id) {
  if (!id || isPremium() || revealed(id)) return;
  if (revealsLeft() <= 0) return openRevealPaywall();
  revealBag().ids.push(id);
  save();
  renderRatings();
  if (current === "profile") renderProfile();
}
function onCooldownAction() {
  if (isPremium()) { clearCooldown(); haptic("success"); toast("Поиск снова открыт"); renderHome(); return; }
  openPremium();
}
function openLimitSheet() {
  const body = openSheet(`<div class="sh-title">Поиски на сегодня закончились</div><div class="sh-sub">Бесплатно — ${RULES.FREE_SEARCHES} в день, обновятся в полночь. С PRO — ${RULES.PREMIUM_SEARCHES}.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="lim-pro">PRO подписка</button><button class="btn btn-ghost" id="lim-no">Подожду</button></div>`);
  body.querySelector("#lim-pro").onclick = openPremium;
  body.querySelector("#lim-no").onclick = () => closeSheet(true);
}

/* ---------- rules / restricted ---------- */
function openRules() {
  const R0 = [["Только 18+", "Возраст от 18. Младше зарегистрироваться нельзя. Обман с возрастом — бан."], ["Без 18+ контента", "Никакой эротики, интим-предложений и откровенных фото — для всех возрастов."], ["Уважение", "Оскорбления, угрозы, травля и дискриминация — повод для жалобы."], ["Без скама", "Чужие ссылки и номера в чате не проходят. Юзернейм можно написать самим. Не переводи деньги и не отправляй коды."], ["Жалобы, а не оценки", "Поиск ограничивают жалобы от разных людей. Низкие оценки никогда не банят."], ["Честные оценки", "Оценка 1–10 — после разговора, если вы успели пообщаться. Фото в «Мои оценки» только если они успели открыться. Короткий пропуск не попадает в среднюю."]];
  openSheet(`<div class="sh-title">Правила Cupion</div><div class="sh-sub">Коротко и по делу</div>
    <div class="rules-list">${R0.map(([b, p], i) => `<div class="rule"><span class="rn">${i + 1}</span><div><b>${b}</b><p>${p}</p></div></div>`).join("")}</div>
    <div class="rate-note">30 жалоб за 24 часа закрывают поиск на 10 часов. Низкие оценки никогда не ограничивают. Ещё 30 жалоб за сутки — снова 10 часов.</div>`);
}
let rsInt = null;
function renderRestricted() {
  clearInterval(rsInt);
  const tick = () => {
    if (!banned()) { clearInterval(rsInt); state.ban = null; save(); if (current === "restricted") { toast("Ограничение снято"); showScreen("home"); } return; }
    const s = Math.ceil((state.ban.until - Date.now()) / 1000);
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    $("rs-timer").textContent = (h ? h + ":" + String(m).padStart(2, "0") : m) + ":" + String(sec).padStart(2, "0");
  };
  if (state.ban) $("rs-reason").textContent = `За последние 24 часа на тебя пришло ${state.ban.reports} жалоб. Поиск закрыт на 10 часов. Низкие оценки к этому не приводят — только жалобы.`;
  tick(); rsInt = setInterval(tick, 1000);
}

/* ---------- test tools ---------- */
function simulatePause() {
  const now = Date.now();
  state.activity = [];
  for (let i = 0; i < 220; i++) state.activity.push({ ts: now - (220 - i) * 4000, dur: 3 });
  state.cooldown = null;
  syncCooldown();
  haptic("warning");
  showScreen("home");
}
function simulateReports() {
  const now = Date.now();
  for (let i = 0; i < 30; i++) state.reportsAgainstMe.push({ from: "test_" + Math.random().toString(36).slice(2, 8), reason: "insult", ts: now - (29 - i) * 1000 });
  const ev = H.evaluateReports(state.reportsAgainstMe, now);
  if (ev) state.ban = ev;
  save(); haptic("warning");
  if (banned()) showScreen("restricted");
}
function simulateRatings() {
  const pool = window.HuntyMock.PROFILES;
  for (let i = 0; i < 5; i++) {
    const p = pool[(Math.random() * pool.length) | 0];
    const id = p.id + "_" + i + "_" + Date.now();
    const score = 6 + ((Math.random() * 5) | 0);
    const dur = 90 + ((Math.random() * 400) | 0);
    state.ratingsReceived.push({ from: id, score, dur, ts: Date.now() });
    state.raters.push({ id, name: p.name, age: p.age, country: p.country, city: p.city, premium: p.premium, hue: p.hue, photos: p.photos, score, dur, ts: Date.now() });
  }
  state.totals.chats += 5; state.totals.sec += 5 * 240;
  save(); refresh(); toast("Добавлено 5 тестовых оценок");
}
function resetAll() {
  const body = openSheet(`<div class="sh-title">Сбросить всё?</div><div class="sh-sub">Профиль, история, оценки и PRO удалятся с этого устройства.</div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg" id="rst-yes">Сбросить</button><button class="btn btn-ghost" id="rst-no">Отмена</button></div>`);
  body.querySelector("#rst-no").onclick = () => closeSheet(true);
  body.querySelector("#rst-yes").onclick = () => { localStorage.removeItem(KEY); location.reload(); };
}
function refresh() { if (current === "home") renderHome(); if (current === "profile") renderProfile(); if (current === "ratings") renderRatings(); }

/* ---------- backend events ---------- */
function bindBackend() {
  backend.on("typing", ({ sessionId, on }) => {
    if (!chat || chat.id !== sessionId || chat.ended) return;
    chat.typing = !!on;
    $("typing").classList.toggle("hidden", !on);
    const st = $("chat-status");
    if (st && !chat.partnerGone) st.textContent = on ? "печатает…" : "в сети";
    if (on) { const b = $("messages"); b.scrollTop = b.scrollHeight; }
  });
  backend.on("message", ({ sessionId, text, photo }) => {
    if (!chat || chat.id !== sessionId || chat.ended) return;
    chat.typing = false;
    $("typing").classList.add("hidden");
    const st = $("chat-status");
    if (st && !chat.partnerGone) st.textContent = "в сети";
    if (photo) return;
    chat.theirs++;
    addMsg(text, "them");
    maybeUnlock(); haptic("light");
  });
  backend.on("partnerLeft", ({ sessionId }) => {
    if (!chat || chat.id !== sessionId || chat.ended || chat.partnerGone) return;
    markPartnerGone();
  });
  backend.on("ratedByPartner", ({ sessionId, score, dur, partnerId, tags }) => {
    const rec = recent.get(sessionId);
    const partner = rec && rec.partner;
    const shown = !!((partner && partner.faceShown) || (chat && chat.id === sessionId && chat.masksOff));
    if (!shown) return;
    state.ratingsReceived.push({ from: partnerId, score, dur, ts: Date.now(), tags: tags || [] });
    const row = (state.matches || []).find((x) => x.sessionId === sessionId);
    if (row) row.theirScore = score;
    if (partner) {
      state.raters.push({ id: partnerId, name: partner.name, hue: partner.hue, photos: partner.photos || [], faceShown: true, age: partner.age, country: partner.country, city: partner.city, premium: partner.premium, score, dur, ts: Date.now() });
    }
    save(); refresh();
  });
  backend.on("contactMatched", ({ sessionId, username }) => {
    if (!chat || chat.id !== sessionId) return;
    addSys(username ? "Контакты совпали · @" + username : "Контакты совпали", "ok");
  });
}

/* ---------- masked search dance ---------- */
let bumpRaf = 0;
function stopBumps() {
  if (bumpRaf) cancelAnimationFrame(bumpRaf);
  bumpRaf = 0;
  const field = $("bump-field");
  if (field) field.innerHTML = "";
}
function startBumps() {
  stopBumps();
  const field = $("bump-field");
  if (!field) return;
  field.innerHTML = `<div class="veil"></div><span class="guest">${MASK_ART.red}</span><span class="guest">${MASK_ART.red}</span>`;
  const guests = [...field.querySelectorAll(".guest")];
  const veil = field.querySelector(".veil");
  const t0 = performance.now();
  const ease = (t) => t * t * (3 - 2 * t);
  const step = (now) => {
    const reveal = $("match-reveal");
    if (!searching || current !== "search" || (reveal && !reveal.classList.contains("hidden"))) { bumpRaf = 0; return; }
    const w = field.clientWidth, h = field.clientHeight;
    if (w < 40 || h < 40) { bumpRaf = requestAnimationFrame(step); return; }
    const cx = w / 2, cy = h * 0.38;
    const t = (now - t0) / 1000;
    const cycle = 7.2;
    const turn = Math.floor(t / cycle);
    const u = (t % cycle) / cycle;
    const ang = turn * 1.05 + 0.4;
    let approach = 0, alpha = 0, lift = 0;
    if (u < 0.18) { alpha = ease(u / 0.18); approach = 0; }
    else if (u < 0.62) { alpha = 1; approach = ease((u - 0.18) / 0.44); }
    else if (u < 0.78) { alpha = 1; approach = 1; }
    else { alpha = 1 - ease((u - 0.78) / 0.22); approach = 1; lift = ease((u - 0.78) / 0.22) * 28; }
    const far = Math.min(w, h) * 0.46;
    const near = Math.min(w, h) * 0.18;
    const dist = far + (near - far) * approach;
    guests.forEach((el, i) => {
      const a = ang + i * Math.PI;
      const x = cx + Math.cos(a) * dist;
      const y = cy + Math.sin(a) * dist * 0.62 - lift;
      el.style.opacity = String(alpha);
      el.style.transform = `translate(${(x - 26).toFixed(1)}px, ${(y - 26).toFixed(1)}px)`;
    });
    if (veil) veil.style.opacity = String(0.55 + 0.45 * Math.sin(t * 0.7));
    bumpRaf = requestAnimationFrame(step);
  };
  bumpRaf = requestAnimationFrame(step);
}

/* ---------- photo viewer ---------- */
let viewer = null;
function viewerOpen() {
  const el = document.getElementById("viewer");
  return !!(el && !el.classList.contains("hidden"));
}
function openViewer(urls, index) {
  urls = (urls || []).filter(Boolean);
  if (!urls.length) return;
  const active = document.activeElement;
  if (active && active.blur && active !== document.body) { try { active.blur(); } catch {} }
  if (!viewer) mountViewer();
  viewer.urls = urls;
  viewer.index = Math.max(0, Math.min(index | 0, urls.length - 1));
  resetViewer();
  showViewerFrame();
  const root = $("viewer");
  root.classList.remove("hidden");
  root.style.transform = "";
  root.style.opacity = "";
  $("app").classList.add("viewing");
  try { if (tg && tg.BackButton) tg.BackButton.show(); } catch {}
}
function closeViewer() {
  const root = document.getElementById("viewer");
  if (!root || root.classList.contains("hidden")) return;
  root.classList.add("hidden");
  root.style.transform = "";
  root.style.opacity = "";
  const app = document.getElementById("app");
  if (app) app.classList.remove("viewing");
  try {
    const sheet = document.getElementById("sheet");
    if (tg && tg.BackButton && sheet && sheet.classList.contains("hidden") && !["register", "chat", "search"].includes(current)) tg.BackButton.hide();
  } catch {}
}
function resetViewer() {
  viewer.scale = 1; viewer.x = 0; viewer.y = 0;
  viewer.mode = ""; viewer.moved = false; viewer.pointers = new Map();
  viewer.pinch = null; viewer.drag = null;
}
function showViewerFrame() {
  const img = $("viewer-img");
  img.src = viewer.urls[viewer.index];
  applyViewer();
  const count = $("viewer-count");
  if (viewer.urls.length > 1) { count.textContent = (viewer.index + 1) + " / " + viewer.urls.length; count.classList.remove("hidden"); }
  else { count.textContent = ""; count.classList.add("hidden"); }
}
function applyViewer() {
  const img = $("viewer-img");
  if (img) img.style.transform = `translate(${viewer.x}px, ${viewer.y}px) scale(${viewer.scale})`;
}
function clampViewer() {
  const img = $("viewer-img"), stage = $("viewer-stage");
  if (!img || !stage) return;
  if (viewer.scale <= 1.01) { viewer.scale = 1; viewer.x = 0; viewer.y = 0; return; }
  const limX = Math.max(0, (img.offsetWidth * viewer.scale - stage.clientWidth) / 2);
  const limY = Math.max(0, (img.offsetHeight * viewer.scale - stage.clientHeight) / 2);
  viewer.x = Math.max(-limX, Math.min(limX, viewer.x));
  viewer.y = Math.max(-limY, Math.min(limY, viewer.y));
}
function zoomViewer(next, px, py) {
  const stage = $("viewer-stage");
  const rect = stage.getBoundingClientRect();
  const pointX = px - (rect.left + rect.width / 2);
  const pointY = py - (rect.top + rect.height / 2);
  next = Math.max(1, Math.min(4, next));
  const k = viewer.scale ? next / viewer.scale : 1;
  viewer.x = pointX - (pointX - viewer.x) * k;
  viewer.y = pointY - (pointY - viewer.y) * k;
  viewer.scale = next;
  clampViewer();
  applyViewer();
}
function mountViewer() {
  const root = document.createElement("div");
  root.id = "viewer";
  root.className = "viewer hidden";
  root.innerHTML = `<button class="viewer-x" id="viewer-x" type="button" aria-label="Закрыть">${ic("close")}</button><div class="viewer-count hidden" id="viewer-count"></div><div class="viewer-stage" id="viewer-stage"><img id="viewer-img" alt="" draggable="false"></div>`;
  $("app").appendChild(root);
  paintIcons(root);
  viewer = { urls: [], index: 0, scale: 1, x: 0, y: 0, pointers: new Map(), mode: "", moved: false, pinch: null, drag: null, tap: 0 };
  const stage = root.querySelector("#viewer-stage");
  root.querySelector("#viewer-x").onclick = (e) => { e.stopPropagation(); closeViewer(); };
  stage.addEventListener("wheel", (e) => {
    if (!viewerOpen()) return;
    e.preventDefault();
    zoomViewer(viewer.scale * Math.exp(-e.deltaY * 0.0018), e.clientX, e.clientY);
  }, { passive: false });
  stage.addEventListener("pointerdown", (e) => {
    try { stage.setPointerCapture(e.pointerId); } catch {}
    viewer.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    viewer.moved = false;
    if (viewer.pointers.size >= 2) {
      const pts = [...viewer.pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      viewer.pinch = { dist, scale: viewer.scale, x: viewer.x, y: viewer.y, mx: (pts[0].x + pts[1].x) / 2, my: (pts[0].y + pts[1].y) / 2 };
      viewer.mode = "pinch";
    } else {
      viewer.mode = viewer.scale > 1.01 ? "pan" : "swipe";
      viewer.drag = { x: e.clientX, y: e.clientY, ox: viewer.x, oy: viewer.y };
    }
  });
  stage.addEventListener("pointermove", (e) => {
    if (!viewer.pointers.has(e.pointerId)) return;
    e.preventDefault();
    viewer.pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (viewer.mode === "pinch" && viewer.pointers.size >= 2 && viewer.pinch) {
      const pts = [...viewer.pointers.values()];
      const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) || 1;
      const mx = (pts[0].x + pts[1].x) / 2, my = (pts[0].y + pts[1].y) / 2;
      const next = Math.max(1, Math.min(4, viewer.pinch.scale * dist / viewer.pinch.dist));
      const stageRect = stage.getBoundingClientRect();
      const px = viewer.pinch.mx - (stageRect.left + stageRect.width / 2);
      const py = viewer.pinch.my - (stageRect.top + stageRect.height / 2);
      const k = viewer.pinch.scale ? next / viewer.pinch.scale : 1;
      viewer.scale = next;
      viewer.x = px - (px - viewer.pinch.x) * k + (mx - viewer.pinch.mx);
      viewer.y = py - (py - viewer.pinch.y) * k + (my - viewer.pinch.my);
      clampViewer();
      applyViewer();
      viewer.moved = true;
      return;
    }
    if (!viewer.drag) return;
    const dx = e.clientX - viewer.drag.x, dy = e.clientY - viewer.drag.y;
    if (Math.hypot(dx, dy) > 6) viewer.moved = true;
    if (viewer.mode === "pan") {
      viewer.x = viewer.drag.ox + dx; viewer.y = viewer.drag.oy + dy;
      clampViewer(); applyViewer();
    } else if (viewer.mode === "swipe" && viewer.scale <= 1.01) {
      if (dy > 0 && dy > Math.abs(dx)) {
        root.style.transform = `translateY(${dy}px)`;
        root.style.opacity = String(Math.max(0.35, 1 - dy / 420));
      } else {
        $("viewer-img").style.transform = `translate(${dx}px, 0) scale(1)`;
      }
    }
  });
  const endPtr = (e) => {
    if (!viewer.pointers.has(e.pointerId) && viewer.pointers.size) return;
    viewer.pointers.delete(e.pointerId);
    if (viewer.mode === "pinch" && viewer.pointers.size < 2) {
      viewer.mode = viewer.scale > 1.01 ? "pan" : "swipe";
      const left = [...viewer.pointers.values()][0];
      viewer.drag = left ? { x: left.x, y: left.y, ox: viewer.x, oy: viewer.y } : null;
      viewer.pinch = null;
      if (viewer.pointers.size) return;
    }
    if (viewer.pointers.size) return;
    const dx = viewer.drag ? e.clientX - viewer.drag.x : 0;
    const dy = viewer.drag ? e.clientY - viewer.drag.y : 0;
    if (viewer.mode === "swipe" && viewer.scale <= 1.01) {
      if (dy > 90 && dy > Math.abs(dx) * 1.15) { closeViewer(); viewer.drag = null; viewer.mode = ""; return; }
      root.style.transform = "";
      root.style.opacity = "";
      if (viewer.urls.length > 1 && Math.abs(dx) > 56 && Math.abs(dx) > Math.abs(dy)) {
        viewer.index = (viewer.index + (dx < 0 ? 1 : -1) + viewer.urls.length) % viewer.urls.length;
        resetViewer();
        showViewerFrame();
        return;
      }
      applyViewer();
    }
    if (!viewer.moved) {
      const now = Date.now();
      if (now - viewer.tap < 280) {
        viewer.tap = 0;
        if (viewer.scale > 1.05) zoomViewer(1, e.clientX, e.clientY);
        else zoomViewer(2.4, e.clientX, e.clientY);
      } else {
        viewer.tap = now;
        const img = $("viewer-img");
        const r = img.getBoundingClientRect();
        const onImg = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
        if (!onImg && viewer.scale <= 1.01) setTimeout(() => { if (viewer && viewer.tap === now && viewer.scale <= 1.01 && viewerOpen()) closeViewer(); }, 260);
      }
    }
    viewer.drag = null;
    if (viewer.pointers.size === 0) viewer.mode = "";
  };
  stage.addEventListener("pointerup", endPtr);
  stage.addEventListener("pointercancel", endPtr);
  window.addEventListener("keydown", (e) => { if (e.key === "Escape" && viewerOpen()) { e.preventDefault(); closeViewer(); } });
}
function paintObFlags() {}

/* ---------- heart burst (search tap) ---------- */
function burstStars() {
  const canvas = $("heart-fx");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const reduce = (() => { try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; } })();
  if (reduce) return;
  const r = canvas.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, Math.round(r.width * dpr));
  canvas.height = Math.max(1, Math.round(r.height * dpr));
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const w = r.width, h = r.height;
  const parts = Array.from({ length: 42 }, (_, i) => ({
    star: i % 5 !== 2,
    x: w * (0.08 + Math.random() * 0.84),
    y: -16 - Math.random() * 160,
    vx: (Math.random() - 0.5) * 34,
    vy: 28 + Math.random() * 80,
    size: 10 + Math.random() * 12,
    rot: Math.random() * 6.28,
    vr: (Math.random() - 0.5) * 2,
    tumble: Math.random() * 6.28,
    vt: 1.2 + Math.random() * 2,
    delay: Math.random() * 0.28,
    age: 0,
    life: 2.2 + Math.random() * 0.8,
  }));
  function star(c, rad) {
    c.beginPath();
    c.moveTo(0, -rad);
    c.bezierCurveTo(rad * 0.2, -rad * 0.2, rad * 0.2, -rad * 0.2, rad, 0);
    c.bezierCurveTo(rad * 0.2, rad * 0.2, rad * 0.2, rad * 0.2, 0, rad);
    c.bezierCurveTo(-rad * 0.2, rad * 0.2, -rad * 0.2, rad * 0.2, -rad, 0);
    c.bezierCurveTo(-rad * 0.2, -rad * 0.2, -rad * 0.2, -rad * 0.2, 0, -rad);
    c.closePath();
  }
  function heart(c, rad) {
    const s = rad / 12;
    c.beginPath();
    c.moveTo(0, 5 * s);
    c.bezierCurveTo(-11 * s, -2 * s, -7 * s, -12 * s, 0, -6 * s);
    c.bezierCurveTo(7 * s, -12 * s, 11 * s, -2 * s, 0, 5 * s);
    c.closePath();
  }
  let prev = performance.now();
  function frame(now) {
    const dt = Math.min(0.032, (now - prev) / 1000);
    prev = now;
    ctx.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of parts) {
      p.age += dt;
      if (p.age < p.delay) { alive++; continue; }
      const t = p.age - p.delay;
      if (t > p.life) continue;
      alive++;
      p.vy += 900 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      p.tumble += p.vt * dt;
      const fade = t < 0.15 ? t / 0.15 : Math.max(0, 1 - (t - (p.life - 0.55)) / 0.55);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(Math.cos(p.tumble), 1);
      ctx.globalAlpha = Math.max(0, Math.min(1, fade));
      if (p.star) {
        const g = ctx.createLinearGradient(-p.size, -p.size, p.size, p.size);
        g.addColorStop(0, "#fff6c8"); g.addColorStop(0.4, "#ffd15a"); g.addColorStop(1, "#e36a12");
        ctx.fillStyle = g; star(ctx, p.size); ctx.fill();
      } else {
        const g = ctx.createLinearGradient(0, -p.size, 0, p.size);
        g.addColorStop(0, "#ffd0e4"); g.addColorStop(1, "#ff3d8b");
        ctx.fillStyle = g; heart(ctx, p.size); ctx.fill();
      }
      ctx.restore();
    }
    if (alive) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, w, h);
  }
  requestAnimationFrame(frame);
}

/* ---------- bindings ---------- */
function bind() {
  const fsBtn = $("desk-fs");
  if (fsBtn) fsBtn.onclick = toggleDeskFullscreen;
  $("ob-track").addEventListener("scroll", syncOb, { passive: true });
  $("ob-next").onclick = () => {
    const i = obIndex(); if (i >= 2) return finishOnboarding();
    $("ob-track").scrollTo({ left: (i + 1) * $("ob-track").clientWidth, behavior: "smooth" }); haptic("light");
  };
  $("ob-skip").onclick = finishOnboarding;

  $("reg-back").onclick = goBack;
  $("f-gender").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; draft.gender = b.dataset.v; renderGender(); haptic("select"); };
  $("f-seek").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; draft.seeking = b.dataset.v; renderSeek($("f-seek"), draft.seeking); haptic("select"); };
  $("f-age").addEventListener("input", () => { $("f-age").value = $("f-age").value.replace(/\D/g, ""); renderAgeHint(); });
  const step = (d) => { const raw = parseInt($("f-age").value, 10); const a = raw || (d > 0 ? RULES.MIN_AGE - 1 : RULES.MIN_AGE + 1); $("f-age").value = Math.max(RULES.MIN_AGE, Math.min(99, a + d)); renderAgeHint(); haptic("select"); };
  $("age-minus").onclick = () => step(-1); $("age-plus").onclick = () => step(1);
  let photoSlot = 0;
  $("photo-slots").onclick = (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { draft.photos.splice(+del.dataset.del, 1); renderPhotos(); return; }
    const add = e.target.closest("[data-add]");
    if (add) {
      if ((draft.photos || []).filter(Boolean).length >= photoCap()) { toast(isPremium() ? "Максимум 6 фото" : "Бесплатно — 3 фото. В PRO — до 6", "warn"); return; }
      photoSlot = Math.min(+add.dataset.add, draft.photos.length); $("photo-input").value = ""; $("photo-input").click(); return;
    }
    const img = e.target.closest("img");
    if (img && img.parentElement && img.parentElement.classList.contains("photo-slot")) {
      const imgs = [...$("photo-slots").querySelectorAll(".photo-slot > img")];
      openViewer(imgs.map((i) => i.src), Math.max(0, imgs.indexOf(img)));
    }
  };
  $("photo-input").onchange = async () => {
    const f = $("photo-input").files[0]; if (!f) return;
    try {
      const over = (draft.photos || []).filter(Boolean).length > photoCap();
      draft.photos[photoSlot] = await resizeImage(f);
      draft.photos = draft.photos.filter(Boolean);
      if (!over) draft.photos = draft.photos.slice(0, photoCap());
      renderPhotos();
    } catch { toast("Не удалось загрузить фото", "warn"); }
  };
  $("open-rules-reg").onclick = (e) => { e.preventDefault(); e.stopPropagation(); openRules(); };
  $("reg-save").onclick = regAdvance;

  let heartArm = false;
  $("btn-search").addEventListener("pointerdown", () => { $("btn-search").classList.add("squish"); haptic("light"); });
  $("btn-search").addEventListener("pointerup", () => $("btn-search").classList.remove("squish"));
  $("btn-search").addEventListener("pointerleave", () => $("btn-search").classList.remove("squish"));
  $("btn-search").addEventListener("pointercancel", () => $("btn-search").classList.remove("squish"));
  $("btn-search").onclick = () => {
    const ready = state.registered && (state.me.age | 0) >= RULES.MIN_AGE && !banned() && !$("btn-search").classList.contains("off");
    if (!ready) return startSearch();
    if (heartArm) return;
    heartArm = true;
    $("btn-search").classList.add("burst");
    burstStars();
    setTimeout(() => { heartArm = false; $("btn-search").classList.remove("burst"); startSearch(); }, 420);
  };
  $("cd-skip").onclick = onCooldownAction;
  $("srch-cancel").onclick = cancelSearch;

  const report = $("chat-report");
  if (report) report.onclick = () => { if (chat) openReport(chat.partner); };
  const skip = $("chat-skip");
  if (skip) skip.onclick = () => { haptic("medium"); leaveChat("next"); };
  const actBtn = $("chat-activity");
  if (actBtn) actBtn.onclick = () => {
    const menu = $("act-menu");
    if (!menu) return;
    menu.classList.toggle("hidden");
    haptic("light");
  };
  const actMenu = $("act-menu");
  if (actMenu) actMenu.onclick = (e) => {
    const b = e.target.closest("[data-act]");
    if (!b) return;
    actMenu.classList.add("hidden");
    if (b.dataset.act === "skip") { haptic("medium"); leaveChat("next"); }
    else if (b.dataset.act === "contact") askContact();
    else if (b.dataset.act === "report" && chat) openReport(chat.partner);
  };
  $("gone-rate").onclick = () => {
    if (!chat || chat.given != null || !chat.masksOff) return;
    if (!H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0)) return;
    const entry = chat.entry || { id: chat.id, partner: chat.partner, dur: chatDur(), canRate: true, given: null };
    chat.entry = entry;
    openRateSheet(entry, "stay");
  };
  $("chat-who").onclick = () => { if (chat) toast("Имя, фото и возраст скрыты"); };
  let chatPhotoTap = null;
  let lastMsgTap = { id: "", t: 0 };
  $("messages").addEventListener("pointerdown", (e) => {
    if (photoOpenTimer) { clearTimeout(photoOpenTimer); photoOpenTimer = null; }
    chatPhotoTap = e.target.closest(".msg.photo img");
    if (e.target.closest("button, a, input, textarea, .msg-reacts, .msg-quote")) { chatPhotoTap = null; }
    const input = $("msg-input");
    if (document.activeElement === input) input.blur();
    const bubble = e.target.closest(".msg.bubble");
    if (holdTimer) clearTimeout(holdTimer);
    holdTimer = null;
    if (!bubble || e.button === 2 || e.target.closest(".msg-reacts, .msg-quote")) return;
    const x = e.clientX, y = e.clientY;
    holdXY = { x, y };
    holdTimer = setTimeout(() => { holdTimer = null; holdXY = null; chatPhotoTap = null; showMsgMenu(bubble, x, y); }, 420);
  });
  $("messages").addEventListener("pointermove", (e) => {
    if (!holdTimer || !holdXY) return;
    if (Math.hypot(e.clientX - holdXY.x, e.clientY - holdXY.y) > 10) { clearTimeout(holdTimer); holdTimer = null; holdXY = null; }
  });
  $("messages").addEventListener("pointerup", (e) => {
    if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; holdXY = null; }
    const img = chatPhotoTap;
    chatPhotoTap = null;
    if (!img || suppressClick) return;
    photoOpenTimer = setTimeout(() => {
      photoOpenTimer = null;
      const imgs = [...$("messages").querySelectorAll(".msg.photo img")];
      openViewer(imgs.map((i) => i.src), Math.max(0, imgs.indexOf(img)));
    }, 260);
  });
  $("messages").addEventListener("pointercancel", () => { if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; } chatPhotoTap = null; });
  $("messages").addEventListener("contextmenu", (e) => {
    const bubble = e.target.closest(".msg.bubble");
    if (!bubble) return;
    e.preventDefault();
    showMsgMenu(bubble, e.clientX, e.clientY);
  });
  $("messages").addEventListener("click", (e) => {
    if (suppressClick) { suppressClick = false; return; }
    const quote = e.target.closest(".msg-quote");
    if (quote) {
      const target = document.querySelector(`.msg[data-mid="${CSS.escape(quote.dataset.jump)}"]`);
      if (target) { target.scrollIntoView({ block: "center" }); target.classList.add("jump"); setTimeout(() => target.classList.remove("jump"), 700); }
      return;
    }
    const chip = e.target.closest(".react-chip.mine");
    if (chip) {
      const msg = chip.closest(".msg");
      if (msg && reacts[msg.dataset.mid]) setMyReact(msg.dataset.mid, reacts[msg.dataset.mid].me);
      return;
    }
    const msg = e.target.closest(".msg.bubble");
    if (!msg) return;
    const now = Date.now();
    if (lastMsgTap.id === msg.dataset.mid && now - lastMsgTap.t < 320) {
      lastMsgTap = { id: "", t: 0 };
      if (photoOpenTimer) { clearTimeout(photoOpenTimer); photoOpenTimer = null; }
      setMyReact(msg.dataset.mid, "❤️");
      return;
    }
    lastMsgTap = { id: msg.dataset.mid, t: now };
  });
  document.addEventListener("pointerdown", (e) => {
    const act = $("act-menu");
    if (act && !act.classList.contains("hidden") && !e.target.closest("#act-menu, #chat-activity")) act.classList.add("hidden");
    const menu = $("msg-menu");
    if (!menu || menu.classList.contains("hidden")) return;
    if (e.target.closest("#msg-menu")) return;
    hideMsgMenu();
  });
  $("app").addEventListener("click", (e) => {
    const menu = $("msg-menu");
    if (!menu || menu.classList.contains("hidden") || !menu.contains(e.target)) return;
    const emoji = e.target.closest("[data-emoji]");
    if (emoji) { setMyReact(menu.dataset.mid, emoji.dataset.emoji); hideMsgMenu(); return; }
    if (e.target.closest("[data-act='reply']")) {
      const el = document.querySelector(`.msg[data-mid="${CSS.escape(menu.dataset.mid)}"]`);
      if (el) { replyTo = { id: el.dataset.mid, preview: bubblePreview(el) }; paintReplyBar(); $("msg-input").focus(); }
      hideMsgMenu();
      return;
    }
    if (e.target.closest("[data-act='copy']")) {
      const el = document.querySelector(`.msg[data-mid="${CSS.escape(menu.dataset.mid)}"]`);
      const text = bubblePreview(el);
      hideMsgMenu();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => toast("Скопировано")).catch(() => toast("Скопировано"));
      else toast("Скопировано");
      return;
    }
    if (e.target.closest("[data-act='report']")) {
      hideMsgMenu();
      if (chat) openReport(chat.partner);
    }
  });
  $("reply-x").onclick = () => { replyTo = null; paintReplyBar(); };
  $("msg-input").addEventListener("input", updateSend);
  $("msg-input").addEventListener("focus", () => { predictKb(true); scrollMessagesNow(); });
  $("msg-input").addEventListener("blur", () => predictKb(false));
  $("msg-input").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendMsg(); } });
  $("msg-send").addEventListener("pointerdown", (e) => {
    e.preventDefault();
    if ($("msg-send").classList.contains("is-send")) return;
    if (!chat || chat.ended || chat.partnerGone) return;
    if (!isPremium()) { haptic("warning"); openPremium(); return; }
    beginVoice(e);
  });
  $("msg-send").addEventListener("pointermove", onVoiceMove);
  $("msg-send").addEventListener("pointerup", (e) => { if (voicePtr && e.pointerId === voicePtr.id) endVoice(true); });
  $("msg-send").addEventListener("pointercancel", (e) => { if (voicePtr && e.pointerId === voicePtr.id) endVoice(false); });
  $("msg-send").addEventListener("mousedown", (e) => e.preventDefault());
  $("msg-send").onclick = () => { if ($("msg-send").classList.contains("is-send")) sendMsg(); };
  $("messages").addEventListener("click", (e) => {
    const play = e.target.closest(".v-play");
    if (!play) return;
    const msg = play.closest(".msg");
    if (!msg || !msg.dataset.src) { play.classList.toggle("on"); return; }
    let audio = msg._audio;
    if (!audio) { audio = new Audio(msg.dataset.src); msg._audio = audio; audio.onended = () => msg.classList.remove("playing"); }
    if (msg.classList.contains("playing")) { audio.pause(); msg.classList.remove("playing"); }
    else { audio.play(); msg.classList.add("playing"); }
  });
  $("ended-home").onclick = () => leaveChat("home");
  $("ended-next").onclick = () => leaveChat("next");

  $("theme-seg").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state.settings.theme = b.dataset.v; save(); applyTheme(); renderProfile(); haptic("select"); };
  $("notif-list").onclick = (e) => { const b = e.target.closest("[data-n]"); if (!b) return; state.settings.notif[b.dataset.n] = !state.settings.notif[b.dataset.n]; save(); b.classList.toggle("on"); haptic("select"); };
  $("open-rules").onclick = openRules;
  $("open-blocked").onclick = () => {
    const body = openSheet(`<div class="sh-title">Заблокированные</div><div class="list-group" style="margin-top:16px">${state.blocked.length ? state.blocked.map((id) => { const p = backend.getProfile(id) || { name: id, hue: 0 }; return `<div class="rated-row">${avatarHTML(p, "sm")}<b>${esc(p.name)}</b><button class="btn btn-soft unb" data-unb="${id}">Разблокировать</button></div>`; }).join("") : `<div class="rated-row"><span class="hint">Никого нет</span></div>`}</div>`);
    body.onclick = (e) => { const b = e.target.closest("[data-unb]"); if (!b) return; state.blocked = state.blocked.filter((x) => x !== b.dataset.unb); save(); closeSheet(true); toast("Разблокировано. В тесте применится после перезапуска"); renderProfile(); body.onclick = null; };
  };
  $("t-pause").onclick = simulatePause;
  $("t-reports").onclick = simulateReports;
  $("t-ratings").onclick = simulateRatings;
  $("t-reset").onclick = resetAll;
  $("rs-rules").onclick = openRules;
  $("rs-appeal").onclick = () => toast("Обжалование появится вместе с сервером");
  $("rs-lift").onclick = () => { state.ban = null; state.reportsAgainstMe = []; save(); showScreen("home"); toast("Ограничение снято (тест)"); };

  const mm = $("my-matches");
  if (mm) mm.onclick = (e) => {
    const write = e.target.closest("[data-write]");
    if (write) { writeTo(write.dataset.write); return; }
    const again = e.target.closest("[data-again]");
    if (again) {
      if (!isPremium()) { haptic("warning"); return openPremium(); }
      startSearch({ preferId: again.dataset.again });
      return;
    }
    const b = e.target.closest("[data-mid]");
    if (!b) return;
    const m = (state.matches || []).find((x) => x.sessionId === b.dataset.mid);
    if (!m) return;
    if (mutualWrite(givenFor(m.id, m.given), m.theirScore)) return writeTo(m.id);
    openPartnerProfile(Object.assign({}, m, { faceShown: true }));
  };
  document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => {
    haptic("light");
    const dir = TABS.indexOf(t.dataset.tab) >= TABS.indexOf(current) ? 1 : -1;
    showScreen(t.dataset.tab, dir);
  }));
  $("rater-list").onclick = (e) => {
    const write = e.target.closest("[data-write]");
    if (write) { writeTo(write.dataset.write); return; }
    const row = e.target.closest("[data-rid]");
    if (!row) return;
    const id = row.dataset.rid;
    const m = (state.matches || []).find((x) => x.sessionId === id);
    if (m && mutualWrite(givenFor(m.id, m.given), m.theirScore)) return writeTo(m.id);
    if (m) { openPartnerProfile(Object.assign({}, m, { faceShown: true })); return; }
    const h = state.raters.find((r) => (r.id || (r.name + ":" + r.ts)) === id);
    if (h && mutualWrite(h.given, h.score)) return writeTo(h.id);
    if (h) openRaterProfile(h);
  };
  let pSlot = 0;
  $("p-photos").onclick = (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { state.me.photos.splice(+del.dataset.del, 1); save(); renderMyPhotos(); return; }
    const add = e.target.closest("[data-add]");
    if (add) {
      if ((state.me.photos || []).filter(Boolean).length >= photoCap()) { toast(isPremium() ? "Максимум 6 фото" : "Бесплатно — 3 фото. В PRO — до 6", "warn"); return; }
      pSlot = Math.min(+add.dataset.add, (state.me.photos || []).length); $("p-photo-input").value = ""; $("p-photo-input").click(); return;
    }
    const img = e.target.closest("img");
    if (img && img.parentElement && img.parentElement.classList.contains("photo-slot")) {
      const imgs = [...$("p-photos").querySelectorAll(".photo-slot > img")];
      openViewer(imgs.map((i) => i.src), Math.max(0, imgs.indexOf(img)));
    }
  };
  $("p-photo-input").onchange = async () => {
    const f = $("p-photo-input").files[0]; if (!f) return;
    try {
      const over = (state.me.photos || []).filter(Boolean).length > photoCap();
      state.me.photos[pSlot] = await resizeImage(f);
      state.me.photos = state.me.photos.filter(Boolean);
      if (!over) state.me.photos = state.me.photos.slice(0, photoCap());
      save(); renderMyPhotos(); backend.updateMe(publicMe());
    } catch { toast("Не удалось загрузить фото", "warn"); }
  };
  ["p-name", "p-age"].forEach((id) => {
    const el = $(id);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); finishProfileField(el); } });
    el.addEventListener("blur", () => finishProfileField(el));
  });
  const pageStep = (d) => { const raw = parseInt($("p-age").value, 10); const a = raw || state.me.age || (d > 0 ? RULES.MIN_AGE - 1 : RULES.MIN_AGE + 1); $("p-age").value = Math.max(RULES.MIN_AGE, Math.min(99, a + d)); finishProfileField($("p-age")); haptic("select"); };
  $("p-age-minus").onclick = () => pageStep(-1);
  $("p-age-plus").onclick = () => pageStep(1);
  $("p-gender").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state.me.gender = b.dataset.v; save(); backend.updateMe(publicMe()); renderSeek($("p-gender"), state.me.gender); haptic("select"); };
  $("p-seek").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state.me.seeking = b.dataset.v; save(); backend.updateMe(publicMe()); renderSeek($("p-seek"), state.me.seeking); haptic("select"); };
  document.querySelector('[data-screen="profile"]').addEventListener("pointerdown", (e) => {
    if (e.target.closest("input, textarea, button, a")) return;
    const a = document.activeElement;
    if (a && a.closest && a.closest("#edit-card")) a.blur();
  });
  const premBanner = $("prem-banner");
  if (premBanner) premBanner.onclick = () => openPremium();
  $("sheet-backdrop").onclick = () => closeSheet();
  bindSheetDrag();
  window.addEventListener("resize", placeTabPill);
  $("sheet").addEventListener("click", (e) => {
    if (e.target.closest(".ps-x, button, a, [data-add], [data-del]")) return;
    const img = e.target.closest(".ps-photo img");
    if (!img) return;
    const box = img.closest(".ps-photos") || img.parentElement;
    const imgs = [...box.querySelectorAll(".ps-photo img")];
    openViewer(imgs.map((i) => i.currentSrc || i.src), Math.max(0, imgs.indexOf(img)));
  });
}
function placeTabPill() {
  const bar = $("tabbar");
  const pill = $("tab-pill");
  if (!bar || !pill || bar.classList.contains("hidden")) return;
  const on = bar.querySelector(".tab.on");
  if (!on) return;
  pill.style.width = on.offsetWidth + "px";
  pill.style.transform = "translate3d(" + on.offsetLeft + "px,0,0)";
  if (!pill.dataset.ready) requestAnimationFrame(() => { pill.dataset.ready = "1"; });
}
function bindSheetDrag() {
  const sheet = $("sheet");
  const body = $("sheet-body");
  let drag = null;
  sheet.addEventListener("pointerdown", (e) => {
    if (viewerOpen() || sheet.classList.contains("hidden")) return;
    if (e.button != null && e.button !== 0) return;
    const onGrab = !!e.target.closest(".sheet-grab");
    if (!onGrab && body && body.scrollTop > 2) return;
    drag = { id: e.pointerId, y: e.clientY, lastY: e.clientY, lastT: performance.now(), dy: 0, v: 0, active: onGrab };
  });
  sheet.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dy = e.clientY - drag.y;
    const now = performance.now();
    const dt = Math.max(1, now - drag.lastT);
    drag.v = (e.clientY - drag.lastY) / dt;
    drag.lastY = e.clientY;
    drag.lastT = now;
    if (!drag.active) {
      if (dy > 6 && (!body || body.scrollTop <= 0)) {
        drag.active = true;
        try { sheet.setPointerCapture(e.pointerId); } catch {}
      } else return;
    }
    const y = Math.max(0, dy);
    drag.dy = y;
    sheet.classList.add("dragging");
    sheet.style.transition = "none";
    sheet.style.transform = "translate3d(0," + y + "px,0)";
    if (y > 0) e.preventDefault();
  }, { passive: false });
  const end = (e) => {
    if (!drag || (e && e.pointerId !== drag.id)) return;
    const d = drag;
    drag = null;
    if (!d.active) return;
    const dismiss = d.dy > 108 || (d.dy > 28 && d.v > 0.45);
    if (dismiss) {
      sheet.style.transition = "transform 0.32s cubic-bezier(0.32, 0.72, 0, 1)";
      sheet.style.transform = "translate3d(0,110%,0)";
      $("sheet-backdrop").classList.add("out");
      setTimeout(() => closeSheet(), 300);
    } else {
      sheet.style.transition = "transform 0.48s cubic-bezier(0.34, 1.4, 0.64, 1)";
      sheet.style.transform = "translate3d(0,0,0)";
      setTimeout(() => {
        sheet.classList.remove("dragging");
        sheet.style.transition = "";
        sheet.style.transform = "";
      }, 480);
    }
  };
  sheet.addEventListener("pointerup", end);
  sheet.addEventListener("pointercancel", end);
}

/* ---------- boot ---------- */
function mountLetterFields() {
  const letters = "АБВГДЕЖЗИКЛМНОПРСТУФХЦЧШЭЮЯ";
  const palette = ["#E17076", "#EE7AAE", "#F48FB1", "#FF8AB8", "#E98BB3", "#C77DFF", "#F06292", "#FF9E80", "#EC407A", "#D48AB0", "#F7A1C4", "#FF6F91"];
  const unit = (n) => {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  const fill = (el) => {
    if (!el || el.childElementCount) return;
    for (let i = 0; i < 18; i++) {
      const a = unit(i + 1), b = unit(i + 23), c = unit(i + 47), d = unit(i + 71);
      let x = 8 + a * 84;
      let y = 8 + b * 76;
      if (Math.abs(x - 50) < 14 && Math.abs(y - 48) < 16) x += x < 50 ? -16 : 16;
      const size = Math.round(24 + c * 48);
      const depth = 1 - (size - 24) / 48;
      const node = document.createElement("span");
      node.className = "letter-av";
      node.textContent = letters[(i * 7 + 2) % letters.length];
      const c1 = palette[i % palette.length];
      const c2 = palette[(i + 5) % palette.length];
      node.style.cssText = "--s:" + size + "px;--x:" + x.toFixed(1) + "%;--y:" + y.toFixed(1) + "%;--o:" + (0.26 + (1 - depth) * 0.5).toFixed(2) + ";--blur:" + (depth * 2.4).toFixed(2) + "px;--dx:" + Math.round((d - 0.5) * 72) + "px;--dy:" + Math.round((a - 0.5) * 96) + "px;--dur:" + (18 + b * 20).toFixed(1) + "s;--delay:" + (-c * 24).toFixed(1) + "s;background:linear-gradient(155deg," + c1 + "," + c2 + ")";
      el.appendChild(node);
    }
  };
  fill($("letter-field"));
  fill($("letter-field-srch"));
  document.addEventListener("visibilitychange", () => {
    const paused = document.hidden;
    document.querySelectorAll(".letter-field").forEach((el) => el.classList.toggle("paused", paused));
  });
}
function boot() {
  initTelegram();
  mountLetterFields();
  paintIcons(); paintStaticAvatars(); paintObFlags();
  bind(); bindBackend();
  rollover();
  try { const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user; if (u && !state.me.name) state.me.name = (u.first_name || "").slice(0, 20); } catch {}
  try { const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user; if (u && u.username) state.me.username = String(u.username).replace(/^@/, ""); } catch {}
  backend.connect({ initData: tg ? tg.initData : "", me: publicMe() }).then(() => refresh());
  save();
  const next = !state.onboarded ? "onboard" : !state.registered ? "register" : banned() ? "restricted" : "home";
  if (next === "register") openRegister(false);
  else showScreen(next);
  if (next === "onboard") syncOb();
  if (next === "home") ensurePrefs();
}
function ensurePrefs() {
  if (!state.registered) return;
  const okG = state.me.gender === "f" || state.me.gender === "m";
  const okS = state.me.seeking === "f" || state.me.seeking === "m";
  if (okG && okS) return;
  let g = okG ? state.me.gender : "", s = okS ? state.me.seeking : "";
  const body = openSheet(`<div class="sh-title">Пара деталей</div><div class="sh-sub">Нужны пол и кого искать.</div>
    <div class="group-title">Пол</div><div class="segment" id="need-gender"><button type="button" data-v="f">Девушка</button><button type="button" data-v="m">Парень</button></div>
    <div class="group-title">Кого искать</div><div class="segment" id="need-seek"><button type="button" data-v="f">Девушек</button><button type="button" data-v="m">Парней</button></div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="need-save">Сохранить</button></div>`);
  const paint = () => {
    body.querySelectorAll("#need-gender button").forEach((b) => b.classList.toggle("on", b.dataset.v === g));
    body.querySelectorAll("#need-seek button").forEach((b) => b.classList.toggle("on", b.dataset.v === s));
  };
  paint();
  body.querySelector("#need-gender").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; g = b.dataset.v; paint(); };
  body.querySelector("#need-seek").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; s = b.dataset.v; paint(); };
  body.querySelector("#need-save").onclick = () => {
    if (g !== "f" && g !== "m") return toast("Укажи пол", "warn");
    if (s !== "f" && s !== "m") return toast("Выбери, кого искать", "warn");
    state.me.gender = g; state.me.seeking = s; save(); backend.updateMe(publicMe());
    closeSheet(true); if (current === "profile") renderProfile();
  };
}
boot();
window.__huntyTest = { leavePartner() { if (chat) backend.debugPartnerLeft(chat.id); } };
