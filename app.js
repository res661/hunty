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
};
function ic(name, cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
}
const MARK = '<svg viewBox="0 0 64 64" aria-hidden="true"><rect width="64" height="64" rx="18" fill="#FF5B3A"/><circle cx="25" cy="32" r="12" fill="#fff"/><circle cx="39" cy="32" r="12" fill="#fff" fill-opacity=".5"/><path d="M32 22.1a12 12 0 0 1 0 19.8a12 12 0 0 1 0-19.8z" fill="#16171D"/></svg>';
const ANON_MARK = `<svg class="anon-svg" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="32" fill="#E5484D"/><path fill="#9E2228" d="M32 13.5c6.8 0 12 5.1 12 12.4 0 4.4-1.8 7.6-3.8 9.6 5 2.4 9 6.6 10.2 13.2H13.6c1.2-6.6 5.2-10.8 10.2-13.2-2-2-3.8-5.2-3.8-9.6 0-7.3 5.2-12.4 12-12.4z"/><path fill="#E5484D" d="M14.5 29.5h35c-.2 5.2-4.2 8.8-9.2 8.8-2.4 0-4.2-1.5-8.3-1.5s-5.9 1.5-8.3 1.5c-5 0-9-3.6-9.2-8.8z"/><circle cx="24.2" cy="31.2" r="2.1" fill="#9E2228"/><circle cx="39.8" cy="31.2" r="2.1" fill="#9E2228"/></svg>`;
function anonHTML(size) { return `<span class="av anon ${size || ""}">${ANON_MARK}</span>`; }
function anonBlock() { return `<div class="anon-hero">${ANON_MARK}</div>`; }
function paintIcons(root) {
  (root || document).querySelectorAll("[data-ic]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = ic(el.dataset.ic); });
  (root || document).querySelectorAll("[data-mark]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = MARK; });
  (root || document).querySelectorAll("[data-anon]").forEach((el) => { if (!el.querySelector("svg")) el.innerHTML = ANON_MARK; });
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
let chromeLoop = false;
let pinUntil = 0;
let kbAnim = null;
let renderedH = null;
let renderedTop = 0;
let lastKbHeight = 0;
let stableGuess = 0;
let lastSampleAt = 0;
let lastSampleH = null;
let insetBot = 0;
function pinMessages() {
  const box = document.getElementById("messages");
  const chatOn = document.querySelector('[data-screen="chat"]');
  if (box && chatOn && !chatOn.classList.contains("hidden")) box.scrollTop = box.scrollHeight;
}
function scrollMessagesNow() {
  requestAnimationFrame(() => requestAnimationFrame(pinMessages));
}
function easeKb(t) {
  const x1 = 0.22, y1 = 1, x2 = 0.36, y2 = 1;
  let u = t;
  for (let i = 0; i < 5; i++) {
    const a = 1 - u;
    const x = 3 * a * a * u * x1 + 3 * a * u * u * x2 + u * u * u;
    const dx = 3 * a * a * x1 + 6 * a * u * (x2 - x1) + 3 * u * u * (1 - x2);
    if (Math.abs(dx) < 1e-4) break;
    u = Math.max(0, Math.min(1, u - (x - t) / dx));
  }
  const a = 1 - u;
  return 3 * a * a * u * y1 + 3 * a * u * u * y2 + u * u * u;
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
  insetBot = bot;
  root.style.setProperty("--tg-safe-t", top + "px");
  root.style.setProperty("--tg-safe-b", bot + "px");
  root.style.setProperty("--tg-safe-l", left + "px");
  root.style.setProperty("--tg-safe-r", right + "px");
  const app = document.getElementById("app");
  if (app && app.style.transform) app.style.transform = "";
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
function armPin() { pinUntil = Math.max(pinUntil, performance.now() + 220); }
function kickChrome() {
  if (chromeLoop) return;
  chromeLoop = true;
  requestAnimationFrame(chromeFrame);
}
function chromeFrame(now) {
  chromeLoop = false;
  if (kbAnim) {
    const t = Math.min(1, (now - kbAnim.t0) / kbAnim.dur);
    const e = easeKb(t);
    renderedH = kbAnim.fromH + (kbAnim.toH - kbAnim.fromH) * e;
    renderedTop = kbAnim.fromTop + (kbAnim.toTop - kbAnim.fromTop) * e;
    if (t >= 1) {
      renderedH = kbAnim.toH;
      renderedTop = kbAnim.toTop;
      kbAnim = null;
    }
    paintChrome();
  }
  if (now < pinUntil || kbAnim) pinMessages();
  if (kbAnim || performance.now() < pinUntil) kickChrome();
}
function beginTween(toH, toTop) {
  kbAnim = { fromH: renderedH, fromTop: renderedTop, toH, toTop, t0: performance.now(), dur: 300 };
  armPin();
  kickChrome();
}
function sampleViewport() {
  paintInsets();
  const f = readFrame();
  const targetH = f.vvH;
  const targetTop = f.vvTop;
  const now = performance.now();
  const step = lastSampleH == null ? 0 : Math.abs(targetH - lastSampleH);
  const dt = now - lastSampleAt;
  const streaming = lastSampleH != null && dt < 90 && step > 0.5 && step < 72;
  lastSampleAt = now;
  lastSampleH = targetH;
  const kbPx = Math.round(f.stable - f.vvH);
  if (kbPx > 80) lastKbHeight = kbPx;
  if (renderedH == null) {
    renderedH = targetH;
    renderedTop = targetTop;
    paintChrome();
    return;
  }
  if (streaming) {
    kbAnim = null;
    renderedH = targetH;
    renderedTop = targetTop;
    paintChrome();
    armPin();
    kickChrome();
    return;
  }
  const abs = Math.abs(targetH - renderedH);
  const topDelta = Math.abs(targetTop - renderedTop);
  if (abs < 1.5 && topDelta < 1) { paintChrome(); return; }
  if (kbAnim && Math.abs(targetH - kbAnim.toH) < 64) {
    const dir0 = Math.sign(kbAnim.toH - kbAnim.fromH);
    const dir1 = Math.sign(targetH - renderedH) || dir0;
    if (dir0 === dir1 || Math.abs(targetH - renderedH) < 24) {
      kbAnim.toH = targetH;
      kbAnim.toTop = targetTop;
      armPin();
      kickChrome();
      return;
    }
  }
  if (abs >= 48 || topDelta >= 40) { beginTween(targetH, targetTop); return; }
  kbAnim = null;
  renderedH = targetH;
  renderedTop = targetTop;
  paintChrome();
  armPin();
  kickChrome();
}
function predictKb(opening) {
  if (renderedH == null) return;
  const f = readFrame();
  if (opening) {
    if (lastKbHeight < 80) { armPin(); kickChrome(); return; }
    const target = f.stable - lastKbHeight;
    if (renderedH - target < 48) { armPin(); kickChrome(); return; }
    beginTween(target, renderedTop);
    return;
  }
  if (f.stable - renderedH < 48) { armPin(); kickChrome(); return; }
  beginTween(f.stable, 0);
}
function scheduleChrome() {
  if (chromeRaf) return;
  chromeRaf = requestAnimationFrame(() => { chromeRaf = 0; sampleViewport(); });
}
function applyChrome() { sampleViewport(); }
function systemTheme() {
  if (tg && tg.initData && tg.colorScheme) return tg.colorScheme === "dark" ? "dark" : "light";
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme() {
  const pref = state.settings.theme || "auto";
  const theme = pref === "auto" ? systemTheme() : pref;
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const color = theme === "dark" ? "#0E0F13" : "#F2F3F5";
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", color);
  try { if (tg && tg.setBackgroundColor) tg.setBackgroundColor(color); if (tg && tg.setHeaderColor) tg.setHeaderColor(color); } catch {}
}
function requestTgFullscreen() {
  try {
    if (tg && typeof tg.requestFullscreen === "function" && !tg.isFullscreen) tg.requestFullscreen();
  } catch {}
}
function initTelegram() {
  if (tg) {
    try { tg.ready(); } catch {}
    try { tg.expand(); } catch {}
    try { if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes(); } catch {}
    requestTgFullscreen();
    let fullscreenRetryArmed = false;
    try {
      tg.onEvent("themeChanged", applyTheme);
      tg.onEvent("viewportChanged", () => { try { if (!tg.isExpanded) tg.expand(); } catch {} scheduleChrome(); });
      tg.onEvent("safeAreaChanged", scheduleChrome);
      tg.onEvent("contentSafeAreaChanged", scheduleChrome);
      tg.onEvent("fullscreenChanged", scheduleChrome);
      tg.onEvent("fullscreenFailed", (e) => {
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
  window.addEventListener("resize", scheduleChrome);
  if (window.visualViewport) {
    visualViewport.addEventListener("resize", scheduleChrome);
    visualViewport.addEventListener("scroll", scheduleChrome);
  }
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch {}
}

/* ---------- navigation ---------- */
let current = "home";
const TABS = ["home", "ratings", "profile"];
function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("hidden", s.dataset.screen !== name));
  current = name;
  $("tabbar").classList.toggle("hidden", !TABS.includes(name));
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
  if (name === "home") renderHome();
  if (name === "ratings") renderRatings();
  if (name === "profile") renderProfile();
  if (name === "restricted") renderRestricted();
  try {
    if (tg && tg.BackButton) {
      if (["register", "chat", "search"].includes(name) && !(name === "register" && !state.registered)) tg.BackButton.show();
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
  if (current === "register") return showScreen(state.registered ? "profile" : "onboard");
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
function openSheet(html, onClose) {
  const sheet = $("sheet"), bd = $("sheet-backdrop");
  sheet.classList.remove("is-rate");
  sheetGen++;
  $("sheet-body").innerHTML = html; $("sheet-body").scrollTop = 0;
  paintIcons($("sheet-body"));
  sheet.classList.remove("hidden", "out"); bd.classList.remove("hidden", "out");
  sheetOnClose = onClose || null;
  try { if (tg && tg.BackButton) tg.BackButton.show(); } catch {}
  return $("sheet-body");
}
function closeSheet(silent) {
  const sheet = $("sheet"), bd = $("sheet-backdrop");
  if (sheet.classList.contains("hidden")) return;
  const gen = ++sheetGen;
  sheet.classList.add("out"); bd.classList.add("out");
  setTimeout(() => {
    if (gen !== sheetGen) return;
    sheet.classList.add("hidden"); bd.classList.add("hidden");
    sheet.classList.remove("is-rate");
  }, 260);
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
function openRegister(edit) {
  draft = JSON.parse(JSON.stringify(state.me));
  $("reg-title").textContent = edit ? "Редактировать" : "Твой профиль";
  $("reg-save").textContent = edit ? "Сохранить" : "Начать";
  $("reg-lead").classList.toggle("hidden", !!edit);
  $("rules-row").classList.toggle("hidden", !!edit);
  document.querySelectorAll("#reg-scroll .field-why").forEach((el) => el.classList.toggle("hidden", !!edit));
  $("f-name").value = draft.name || "";
  $("f-age").value = draft.age || "";
  $("f-country").value = draft.country || "";
  $("f-city").value = draft.city || "";
  $("f-rules").checked = !!edit;
  renderGender(); renderSeek($("f-seek"), draft.seeking || ""); renderPhotos(); renderAgeHint();
  showScreen("register");
  $("reg-scroll").scrollTop = 0;
}
function renderGender() { [...$("f-gender").children].forEach((b) => b.classList.toggle("on", b.dataset.v === (draft.gender || ""))); }
function renderSeek(root, value) { if (!root) return; [...root.children].forEach((b) => b.classList.toggle("on", b.dataset.v === (value || ""))); }
function renderPhotos() {
  const slots = [0, 1, 2].map((i) => {
    const src = draft.photos[i];
    if (src) return `<div class="photo-slot ${i === 0 ? "main" : ""}" data-i="${i}"><img src="${src}" alt="">${i === 0 ? `<span class="av-preview"><img src="${src}" alt=""></span>` : ""}<button class="ps-x" data-del="${i}" aria-label="Удалить">${ic("close")}</button></div>`;
    return `<button class="photo-slot ${i === 0 ? "main" : ""}" data-add="${i}">${ic(i === 0 ? "camera" : "plus")}<span class="ps-label">${i === 0 ? "Главное" : "Ещё"}</span></button>`;
  });
  $("photo-slots").innerHTML = slots.join("");
}
function renderAgeHint() {
  const a = parseInt($("f-age").value, 10);
  const el = $("age-hint");
  if (!el) return;
  if (a && a < RULES.MIN_AGE) { el.textContent = "Hunty доступен с 16 лет"; el.classList.add("err"); el.classList.remove("hidden"); return; }
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
  if (!age || age < RULES.MIN_AGE || age > 99) { flagErr($("f-age").parentElement); toast(age && age < 16 ? "Hunty доступен с 16 лет" : "Укажи возраст", "warn"); haptic("error"); return; }
  if (!state.registered && !$("f-rules").checked) { flagErr($("rules-row")); toast("Нужно принять правила", "warn"); haptic("error"); return; }
  if (draft.gender !== "f" && draft.gender !== "m") { flagErr($("f-gender")); toast("Укажи пол", "warn"); haptic("error"); return; }
  if (draft.seeking !== "f" && draft.seeking !== "m") { flagErr($("f-seek")); toast("Выбери, кого искать", "warn"); haptic("error"); return; }
  if (state.registered && state.me.age && H.agePool(state.me.age) !== H.agePool(age)) {
    toast("Так возраст не меняется", "warn"); haptic("error"); return;
  }
  draft.name = name.slice(0, 20); draft.age = age;
  draft.country = $("f-country").value.trim().slice(0, 28);
  draft.city = $("f-city").value.trim().slice(0, 28);
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
  const matchCell = matches == null ? "" : `<div class="stat"><b>${matches}</b><span>${plural(matches, "встреча", "встречи", "встреч")}</span></div>`;
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
const TIPS = ["Сначала разговор без лиц. Фото открываются через 2:30", "Средняя оценка учитывается после 5 разговоров, до этого ты «Новый»", "Короткий пропуск не меняет среднюю и не считается чатом", "Юзернейм можно написать в чат самим. Номера и чужие ссылки — нет"];
const filtersActive = () => { const f = state.filters; return f.gender !== "any" || f.ageMin || f.ageMax || f.city; };
function renderHome() {
  rollover();
  const cd = syncCooldown();
  const paused = !!cd && !banned();
  const btn = $("btn-search");
  btn.classList.toggle("off", paused || banned());
  btn.querySelector(".sb-label").textContent = banned() ? "Ограничено" : "Поиск";
  $("cooldown-box").classList.toggle("hidden", !paused);
  $("search-hero").querySelector(".sh-rings").classList.remove("hidden");
  if (paused) {
    $("cd-time").textContent = fmtCooldown(cd.until);
    $("cd-sub").textContent = cd.rapid ? "Много быстрых пропусков. Поиск откроется сам." : "Слишком плотный поток чатов. После таймера всё сбросится.";
    $("cd-skip").textContent = isPremium() ? "Продолжить" : "Быстрее с PRO";
  }
  clearInterval(cdInt);
  if (paused) cdInt = setInterval(() => { if (current === "home") renderHome(); }, 1000);
  const pro = isPremium();
  $("my-stats").innerHTML = `<div class="card-head"><h3>Твоя репутация</h3><small>${state.totals.chats ? "по оценкам собеседников" : "появится после чатов"}</small></div>` + myStatsHTML() + flagChips(myFlagCounts());
  $("home-premium").className = "card premium-card" + (pro ? " on" : "");
  $("home-premium").innerHTML = pro
    ? `<span class="pc-star">${ic("star")}</span><h3>${ic("crown")} PRO подписка</h3><p>До ${new Date(state.premium.until).toLocaleDateString("ru-RU")}. Оценки без лимита, фото в чате, поиск быстрее.</p>`
    : `<span class="pc-star">${ic("star")}</span><h3>PRO подписка</h3><p>Все оценки, фото в чате и поиск быстрее.</p><button class="btn" id="home-pro-btn">Подробнее · от 99 ★</button>`;
  const b = $("home-pro-btn"); if (b) b.onclick = openPremium;
  $("home-tip").innerHTML = `<span class="si coral">${ic("info")}</span><div>${TIPS[Math.floor(Date.now() / 60000) % TIPS.length]}</div>`;
  paintIcons($("home-tip"));
  paintStaticAvatars();
}

/* ---------- search ---------- */
let tipTimer = null, searching = false, searchGen = 0;
function startSearch(opts) {
  opts = opts || {};
  rollover();
  if (!state.registered) return openRegister(false);
  if (banned()) return showScreen("restricted");
  if (syncCooldown()) { haptic("warning"); showScreen("home"); return; }
  haptic("medium");
  $("radar-me").innerHTML = anonHTML();
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
  startBumps();
  const exclude = metIds().concat(state.blocked);
  const filters = null;
  backend.findMatch({ filters, exclude, fast: isPremium() }).then((m) => {
    if (gen !== searchGen || !searching) return;
    searching = false;
    save();
    revealMatch(m, gen);
  }).catch((e) => {
    if (gen !== searchGen) return;
    searching = false; clearInterval(tipTimer);
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
  try { backend.cancelSearch(); } catch {}
  showScreen("home");
}
let revealTimer = null;
function revealMatch(m, gen) {
  stopBumps();
  const p = m.partner;
  const el = $("match-reveal");
  const where = [p.city, p.country].map((s) => (s || "").trim()).filter(Boolean).map(esc).join(", ");
  const rate = p.stats && p.stats.count >= RULES.NEW_UNTIL ? ratingChip(p) : `<span class="rating-chip">новый</span>`;
  el.innerHTML = `<button class="mr-person" type="button">${anonHTML("xl")}<span class="mr-kicker">Нашли</span><b>${esc(p.name)}, ${p.age}</b>${where ? `<span class="mr-place">${where}</span>` : ""}${rate}</button>`;
  el.classList.remove("hidden");
  haptic("success");
  const go = () => {
    if (gen !== searchGen || current !== "search") return;
    clearTimeout(revealTimer); revealTimer = null;
    el.classList.add("hidden");
    el.onclick = null;
    clearInterval(tipTimer);
    openChat(m);
  };
  clearTimeout(revealTimer);
  revealTimer = setTimeout(go, 1400);
  el.onclick = (e) => { if (e.target.closest("#srch-cancel")) return; go(); };
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
  paintChatFace();
  $("composer").classList.remove("hidden"); $("composer-ended").classList.add("hidden");
  $("gone-rate").classList.add("hidden");
  $("typing").classList.add("hidden");
  $("msg-input").disabled = false; $("msg-input").placeholder = "Сообщение";
  $("msg-input").value = ""; updateSend();
  $("chat-timer").classList.remove("unlocked");
  rememberPartner(chat.partner.id); save();
  showScreen("chat");
  clearInterval(timerInt); tickTimer(); timerInt = setInterval(tickTimer, 1000);
}
function chatDur() { return chat ? Math.floor(((chat.endedAt || Date.now()) - chat.startedAt) / 1000) : 0; }
function paintChatFace() {
  if (!chat) return;
  const p = chat.partner;
  const crown = p.premium ? `<i class="name-crown">${ic("crown")}</i>` : "";
  const stat = p.stats.count < RULES.NEW_UNTIL ? "новый" : "★ " + p.stats.avg.toFixed(1);
  const av = chat.masksOff ? avatarHTML(p, "sm") : anonHTML("sm");
  $("chat-who").innerHTML = `${av}<span class="cw-info"><b>${esc(p.name)}${crown}</b><small>${chat.partnerGone ? "вышел" : stat}</small></span>`;
  paintIcons($("chat-who"));
}
function paintMaskNote() {
  const el = $("mask-note");
  if (!el) return;
  if (!chat || chat.ended || chat.masksOff) { el.classList.add("hidden"); el.classList.remove("soon"); return; }
  el.classList.remove("hidden");
  if (chat.partnerGone) { el.textContent = "Фото так и не открылись"; el.classList.remove("soon"); return; }
  if (maskPhase(chatDur()) === "soon") { el.textContent = "Сейчас откроются фото"; el.classList.add("soon"); return; }
  el.textContent = "Фото откроются через " + fmtDur(MASK_SEC - chatDur());
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
  el.innerHTML = `<b>Встреча</b><span>Вы увидели друг друга</span>`;
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
  const d = chatDur();
  $("timer-text").textContent = fmtDur(d);
  const total = (chat.mine || 0) + (chat.theirs || 0);
  const frac = Math.min(1, total / RULES.MIN_RATE_MSGS);
  $("timer-ring").style.strokeDashoffset = String(50.27 * (1 - frac));
  paintMaskNote();
  tryUnmask();
  maybeUnlock();
}
function maybeUnlock() {
  if (!chat || chat.unlockedShown || chat.ended || !chat.masksOff) return;
  if (!H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0)) return;
  chat.unlockedShown = true; $("chat-timer").classList.add("unlocked");
}
function addMsg(text, who) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "msg " + who; el.textContent = text;
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function addPhoto(src, who) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "msg photo " + who;
  const img = document.createElement("img"); img.src = src; img.alt = "";
  el.appendChild(img); box.appendChild(el); box.scrollTop = box.scrollHeight;
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
function updateSend() { $("msg-send").disabled = !$("msg-input").value.trim() || !chat || chat.ended || chat.partnerGone; }
function markPartnerGone() {
  if (!chat || chat.partnerGone) return;
  chat.partnerGone = true;
  $("typing").classList.add("hidden");
  addSys(chat.partner.name + " вышел");
  const small = $("chat-who") && $("chat-who").querySelector("small");
  if (small) small.textContent = "вышел";
  $("msg-input").disabled = true;
  $("msg-input").placeholder = "Собеседник вышел";
  $("msg-input").blur();
  updateSend();
  const can = chat.masksOff && H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0) && chat.given == null;
  $("gone-rate").classList.toggle("hidden", !can);
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
    <div class="flag-row" id="flag-row">${FLAGS.map((f) => flagWidget(f, null, false)).join("")}</div>
    <div class="rate-grid" id="rate-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<button class="rate-btn" data-n="${n}">${n}</button>`).join("")}</div>
    <div class="sh-actions row"><button class="btn btn-soft rate-act" id="rate-home">${stay ? "Не сейчас" : after === "next" ? "Пропустить" : "Не сейчас"}</button><button class="btn btn-primary rate-act" id="rate-send" disabled>${stay || after !== "next" ? "Оценить" : "Оценить и дальше"}</button></div>
    <div class="rate-note">Имя и фото видны в «Мои оценки».</div>`);
  $("sheet").classList.add("is-rate");
  body.querySelector("#rate-grid").onclick = (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    score = +b.dataset.n; haptic("select");
    const flag = flagFor(score);
    body.querySelectorAll(".rate-btn").forEach((x) => { x.className = "rate-btn"; });
    b.classList.add("on", score <= 4 ? "lo" : score <= 7 ? "mid" : "top");
    const hint = body.querySelector("#rate-hint"); if (hint) hint.classList.add("hidden");
    const big = body.querySelector("#rate-big"); big.classList.remove("hidden");
    big.innerHTML = `<b>${score}</b><span class="flag-hero ${flag.cls}">${flagMark()}${esc(flag.name)}</span>`;
    body.querySelectorAll("#flag-row .flag-w").forEach((el) => el.classList.toggle("on", el.dataset.f === flag.id));
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
function openPartnerProfile(p) {
  const shown = partnerShown(p);
  const body = openSheet(`${shown ? photosHTML(p) : anonBlock()}
    <div class="ps-name"><h2>${esc(p.name)}${p.age ? ", " + p.age : ""}</h2>${p.premium ? `<i class="name-crown">${ic("crown")}</i>` : ""}</div>
    <div class="ps-meta">${placeText(p)}</div>
    <div class="ps-section">Репутация</div>${partnerStatsHTML(p)}${flagChips(p.flagCounts)}
    <div class="sh-actions row"><button class="btn btn-soft flat" id="pp-report">${ic("flag")}Жалоба</button><button class="btn btn-soft flat" id="pp-block">${ic("block")}Блок</button></div>`);
  bindPhotoDots(body);
  body.querySelector("#pp-report").onclick = () => openReport(p);
  body.querySelector("#pp-block").onclick = () => confirmBlock(p);
}
function scoreLine(score, label) {
  const flag = flagFor(score);
  return `<div class="given-score"><b>${score}</b><span>${label}</span></div>${flag ? `<div class="flag-row">${flagWidget(flag, null, true)}</div>` : ""}`;
}
function openRaterProfile(h) {
  const shown = !!h.faceShown;
  const p = { name: h.name, age: h.age, hue: h.hue, photos: shown ? (h.photos || []) : [], country: h.country, city: h.city, premium: h.premium, about: "", faceShown: shown };
  const mine = h.given != null ? h.given : (state.givenByMe && state.givenByMe[h.id]);
  const body = openSheet(`${shown ? photosHTML(p) : anonBlock()}
    <div class="ps-name"><h2>${esc(p.name)}${p.age ? ", " + p.age : ""}</h2>${p.premium ? `<i class="name-crown">${ic("crown")}</i>` : ""}</div>
    <div class="ps-meta">${placeText(p)}</div>
    ${scoreLine(h.score, "Оценка мне")}
    ${mine != null ? scoreLine(mine, "Оценка тебе") : `<div class="ps-meta">Оценка тебе · нет</div>`}`);
  bindPhotoDots(body);
}
function openReport(p) {
  let reason = null;
  const body = openSheet(`<div class="sh-title">Пожаловаться</div><div class="sh-sub">на ${esc(p.name)}. Можно сразу, даже без переписки. Собеседник не узнает, кто пожаловался.</div>
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
  const body = openSheet(`<div class="sh-title">Заблокировать ${esc(p.name)}?</div><div class="sh-sub">Вы больше не попадёте друг на друга. Отменить можно в профиле.</div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg flat" id="blk-yes">Заблокировать</button><button class="btn btn-ghost flat" id="blk-no">Отмена</button></div>`);
  body.querySelector("#blk-no").onclick = () => closeSheet(true);
  body.querySelector("#blk-yes").onclick = async () => {
    await doBlock(p); closeSheet(true); toast(`${p.name} в блоке`); haptic("success");
    refresh();
  };
}
async function doBlock(p) { if (!state.blocked.includes(p.id)) state.blocked.push(p.id); await backend.block(p.id); save(); }
function showEnded() { $("composer").classList.add("hidden"); $("composer-ended").classList.remove("hidden"); $("typing").classList.add("hidden"); }

/* ---------- profile tab ---------- */
function renderMyPhotos() {
  const photos = state.me.photos || [];
  $("p-photos").innerHTML = [0, 1, 2].map((i) => {
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
    if (!age || age < RULES.MIN_AGE || age > 99) { toast(age && age < 16 ? "Hunty доступен с 16 лет" : "Укажи возраст", "warn"); el.value = state.me.age || ""; haptic("error"); el.blur(); return; }
    if (state.me.age && H.agePool(state.me.age) !== H.agePool(age)) { toast("Так возраст не меняется", "warn"); el.value = state.me.age; haptic("error"); el.blur(); return; }
    state.me.age = age;
  } else if (id === "p-country") state.me.country = el.value.trim().slice(0, 28);
  else if (id === "p-city") state.me.city = el.value.trim().slice(0, 28);
  else return;
  state.me.about = "";
  save(); backend.updateMe(publicMe());
  if (document.activeElement === el) el.blur();
  } finally { profileLock = false; }
}
function renderMyMatches() {
  const box = $("my-matches");
  if (!box) return;
  const rows = [...(state.matches || [])].reverse();
  const head = `<div class="card-head"><h3>Встречи</h3></div><p class="match-sub">С кем дошли до 2:30</p>`;
  if (!rows.length) {
    box.innerHTML = head + `<p class="hint">Пока нет. Встреча — если дойти до 2:30.</p>`;
    return;
  }
  box.innerHTML = head + rows.map((m) => {
    const flag = flagFor(m.theirScore);
    const got = m.theirScore == null
      ? `<span class="match-wait">Пока без оценки</span>`
      : `<span class="match-got">${flag ? flagWidget(flag, null, true, true) : ""}<b>${m.theirScore}</b></span>`;
    return `<button class="match-row" type="button" data-mid="${esc(m.sessionId)}">${avatarHTML(m, "sm")}<span class="rater-main"><b>${esc(m.name)}${m.age ? ", " + m.age : ""}</b><span class="hint">${fmtDur(m.dur)}</span></span>${got}</button>`;
  }).join("");
}
function renderProfile() {
  const m = state.me, pro = isPremium(), rep = myRep();
  const set = (id, val) => { const el = $(id); if (el && document.activeElement !== el) el.value = val == null ? "" : val; };
  set("p-name", m.name || "");
  set("p-age", m.age || "");
  set("p-country", m.country || "");
  set("p-city", m.city || "");
  renderSeek($("p-gender"), m.gender);
  renderSeek($("p-seek"), m.seeking);
  renderMyPhotos();
  $("me-stats").innerHTML = `<div class="card-head"><h3>Статистика</h3><small>${rep.count} ${plural(rep.count, "оценка", "оценки", "оценок")}</small></div>` + myStatsHTML() + flagChips(myFlagCounts());
  renderMyMatches();
  $("me-premium").className = "card premium-card" + (pro ? " on" : "");
  $("me-premium").innerHTML = pro
    ? `<span class="pc-star">${ic("star")}</span><h3>${ic("crown")} PRO подписка</h3><p>До ${new Date(state.premium.until).toLocaleDateString("ru-RU")}. Оценки без лимита, фото в чате, поиск быстрее.</p>`
    : `<span class="pc-star">${ic("star")}</span><h3>PRO подписка</h3><p>Все оценки, фото в чате и поиск быстрее.</p><button class="btn" id="me-pro-btn">Подключить за Stars</button>`;
  const pb = $("me-pro-btn"); if (pb) pb.onclick = openPremium;
  const wr = $("who-rated-bottom");
  wr.textContent = pro ? "Мои оценки" : `Мои оценки · ${revealsLeft()} из ${FREE_REVEALS}`;
  wr.onclick = () => showScreen("ratings");
  [...$("theme-seg").children].forEach((b) => b.classList.toggle("on", b.dataset.v === state.settings.theme));
  $("notif-list").innerHTML = `<div class="list-row"><span class="lr-ic t-coral">${ic("bell")}</span><span class="lr-label">Уведомления от бота</span><button class="toggle ${state.settings.notif.bot ? "on" : ""}" data-n="bot" aria-label="Уведомления от бота"></button></div>`;
  $("blocked-count").textContent = state.blocked.length;
}

/* ---------- premium ---------- */
const PLANS = [{ id: "week", name: "Неделя", stars: 99, note: "7 дней" }, { id: "month", name: "Месяц", stars: 299, note: "30 дней", save: "−30%" }];
function openPremium() {
  let plan = "month";
  const feats = [["eye", "Все оценки", "кто оценил — без лимита"], ["search", "Быстрее в поиске", "собеседник находится раньше"], ["crown", "Корона PRO", "маленький значок у имени"], ["camera", "Фото в чате", "можно отправлять снимки"], ["clock", "Без ожидания", "частые «Дальше» не останавливают поиск"]];
  const body = openSheet(`<div class="prem-hero"><div class="prem-orb">${ic("crown")}</div><div class="sh-title">PRO подписка</div><div class="sh-sub">Оплата через Telegram Stars</div></div>
    <div class="feat-list">${feats.map(([i, b, s]) => `<div class="feat"><span class="lr-ic">${ic(i)}</span><div><b>${b}</b><small>${s}</small></div></div>`).join("")}</div>
    <div class="plans" id="plans">${PLANS.map((p) => `<button class="plan ${p.id === plan ? "on" : ""}" data-p="${p.id}">${p.save ? `<span class="save">${p.save}</span>` : ""}<b>${p.name}</b><span class="price">${ic("star")}${p.stars}</span><small>${p.note}</small></button>`).join("")}</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="buy">Оплатить ${PLANS[1].stars} ★</button></div>
    <div class="limits-note">Честно: PRO не повышает рейтинг и не защищает от жалоб. Правила и безопасность одни для всех.</div>`);
  body.querySelector("#plans").onclick = (e) => {
    const b = e.target.closest("[data-p]"); if (!b) return;
    plan = b.dataset.p; haptic("select");
    body.querySelectorAll(".plan").forEach((x) => x.classList.toggle("on", x === b));
    body.querySelector("#buy").textContent = `Оплатить ${PLANS.find((p) => p.id === plan).stars} ★`;
  };
  body.querySelector("#buy").onclick = () => payFlow(PLANS.find((p) => p.id === plan));
}
function payFlow(plan) {
  const body = openSheet(`<div class="pay-box"><div class="sh-title">Оплата Telegram Stars</div><div class="stars">${ic("star")}${plan.stars}</div>
    <div class="sh-sub">Hunty PRO · ${plan.note}<br>Тестовый режим: звёзды не списываются. В релизе откроется счёт Telegram.</div>
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
    body.innerHTML = `<div class="pay-box"><div class="success-ic">${ic("check")}</div><div class="sh-title">PRO подключён!</div><div class="sh-sub">До ${new Date(r.until).toLocaleDateString("ru-RU")}. Оценки без лимита, фото в чате, поиск быстрее.</div><div class="sh-actions"><button class="btn btn-primary btn-lg" id="pay-done">Круто</button></div></div>`;
    body.querySelector("#pay-done").onclick = () => closeSheet(true);
    refresh();
  };
}
function requirePro(fn) { return () => { if (!isPremium()) { haptic("warning"); return openPremium(); } fn(); }; }
function renderRatings() {
  const rows = [...state.raters].reverse();
  const left = revealsLeft();
  const sub = $("ratings-sub");
  if (sub) sub.textContent = isPremium() ? "PRO · без лимита" : `Бесплатно ${FREE_REVEALS} в день · осталось ${left}`;
  const box = $("rater-list");
  if (!box) return;
  box.innerHTML = rows.length ? rows.map((h) => {
    const id = h.id || (h.name + ":" + h.ts);
    const open = isPremium() || revealed(id);
    const flag = flagFor(h.score);
    const flagHtml = open && flag ? `<div class="flag-row">${flagWidget(flag, null, true)}</div>` : "";
    const face = h.faceShown ? avatarHTML(h, "sm") : anonHTML("sm");
    return `<div class="rated-row" data-rid="${esc(id)}">${open
      ? `${face}<div class="rater-main"><b>${esc(h.name)}</b><div class="hint" style="margin:0">${fmtDur(h.dur)}</div>${flagHtml}</div><span class="score">${h.score}</span>`
      : `${anonHTML("sm")}<div class="rater-main"><b>Скрыто</b><div class="hint" style="margin:0">${left ? "нажми, чтобы открыть" : "лимит на сегодня"}</div></div><button class="btn btn-edit reveal-one" type="button">${left ? "Открыть" : "PRO"}</button>`}</div>`;
  }).join("") : `<div class="rated-row"><span class="hint">Пока никто. Оценка появится после разговора.</span></div>`;
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
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="lim-pro">Hunty PRO</button><button class="btn btn-ghost" id="lim-no">Подожду</button></div>`);
  body.querySelector("#lim-pro").onclick = openPremium;
  body.querySelector("#lim-no").onclick = () => closeSheet(true);
}

/* ---------- rules / restricted ---------- */
function openRules() {
  const R0 = [["Только 16+", "Возраст от 16. Обман с возрастом — бан."], ["Без 18+ контента", "Никакой эротики, интим-предложений и откровенных фото — для всех возрастов."], ["Уважение", "Оскорбления, угрозы, травля и дискриминация — повод для жалобы."], ["Без скама", "Чужие ссылки и номера в чате не проходят. Юзернейм можно написать самим. Не переводи деньги и не отправляй коды."], ["Жалобы, а не оценки", "Поиск ограничивают жалобы от разных людей. Низкие оценки никогда не банят."], ["Честные оценки", "Оценка 1–10 — после разговора, если вы успели пообщаться. Фото в «Мои оценки» только если они успели открыться. Короткий пропуск не попадает в среднюю."]];
  openSheet(`<div class="sh-title">Правила Hunty</div><div class="sh-sub">Коротко и по делу</div>
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
    $("typing").classList.toggle("hidden", !on);
    if (on) { const b = $("messages"); b.scrollTop = b.scrollHeight; }
  });
  backend.on("message", ({ sessionId, text, photo }) => {
    if (!chat || chat.id !== sessionId || chat.ended) return;
    $("typing").classList.add("hidden"); chat.theirs++;
    if (photo) { if (chat.masksOff) addPhoto(photo, "them"); } else addMsg(text, "them");
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
  field.innerHTML = `<div class="veil"></div><span class="guest">${ANON_MARK}</span><span class="guest">${ANON_MARK}</span>`;
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
function paintObFlags() {
  const el = $("ob-flags");
  if (!el) return;
  el.innerHTML = flagWidget(FLAGS[0], 12, true) + flagWidget(FLAGS[1], 4, false) + flagWidget(FLAGS[2], 1, false);
}

/* ---------- bindings ---------- */
function bind() {
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
  const step = (d) => { const a = parseInt($("f-age").value, 10) || (d > 0 ? 17 : 19); $("f-age").value = Math.max(16, Math.min(99, a + d)); renderAgeHint(); haptic("select"); };
  $("age-minus").onclick = () => step(-1); $("age-plus").onclick = () => step(1);
  let photoSlot = 0;
  $("photo-slots").onclick = (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { draft.photos.splice(+del.dataset.del, 1); renderPhotos(); return; }
    const add = e.target.closest("[data-add]");
    if (add) { photoSlot = Math.min(+add.dataset.add, draft.photos.length); $("photo-input").value = ""; $("photo-input").click(); return; }
    const img = e.target.closest("img");
    if (img && img.parentElement && img.parentElement.classList.contains("photo-slot")) {
      const imgs = [...$("photo-slots").querySelectorAll(".photo-slot > img")];
      openViewer(imgs.map((i) => i.src), Math.max(0, imgs.indexOf(img)));
    }
  };
  $("photo-input").onchange = async () => {
    const f = $("photo-input").files[0]; if (!f) return;
    try { draft.photos[photoSlot] = await resizeImage(f); draft.photos = draft.photos.filter(Boolean).slice(0, 3); renderPhotos(); } catch { toast("Не удалось загрузить фото", "warn"); }
  };
  $("open-rules-reg").onclick = (e) => { e.preventDefault(); e.stopPropagation(); openRules(); };
  $("reg-save").onclick = saveRegister;

  $("btn-search").onclick = () => startSearch();
  $("cd-skip").onclick = onCooldownAction;
  $("srch-cancel").onclick = cancelSearch;

  $("chat-skip").onclick = () => { haptic("medium"); leaveChat("next"); };
  $("chat-report").onclick = () => { if (chat) openReport(chat.partner); };
  $("gone-rate").onclick = () => {
    if (!chat || chat.given != null || !chat.masksOff) return;
    if (!H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0)) return;
    const entry = chat.entry || { id: chat.id, partner: chat.partner, dur: chatDur(), canRate: true, given: null };
    chat.entry = entry;
    openRateSheet(entry, "stay");
  };
  $("chat-who").onclick = () => chat && openPartnerProfile(chat.partner);
  let chatPhotoTap = null;
  $("messages").addEventListener("pointerdown", (e) => {
    chatPhotoTap = e.target.closest(".msg.photo img");
    if (e.target.closest("button, a, input, textarea")) { chatPhotoTap = null; return; }
    const input = $("msg-input");
    if (document.activeElement === input) input.blur();
  });
  $("messages").addEventListener("pointerup", (e) => {
    const img = chatPhotoTap;
    chatPhotoTap = null;
    if (!img) return;
    const r = img.getBoundingClientRect();
    const hit = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!hit && e.target.closest(".msg.photo img") !== img) return;
    const imgs = [...$("messages").querySelectorAll(".msg.photo img")];
    openViewer(imgs.map((i) => i.src), Math.max(0, imgs.indexOf(img)));
  });
  $("msg-input").addEventListener("input", updateSend);
  $("msg-input").addEventListener("focus", () => { predictKb(true); scrollMessagesNow(); });
  $("msg-input").addEventListener("blur", () => predictKb(false));
  $("msg-input").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendMsg(); } });
  $("msg-send").addEventListener("pointerdown", (e) => e.preventDefault());
  $("msg-send").addEventListener("mousedown", (e) => e.preventDefault());
  $("msg-send").onclick = sendMsg;
  $("chat-photo").onclick = () => {
    if (!chat || !chat.masksOff) { toast("Фото откроются сами, чуть позже"); return; }
    if (!isPremium()) openPhotoPaywall(); else $("chat-photo-input").click();
  };
  $("chat-photo-input").onchange = () => { const f = $("chat-photo-input").files[0]; $("chat-photo-input").value = ""; sendChatPhoto(f); };
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
    const b = e.target.closest("[data-mid]");
    if (!b) return;
    const m = (state.matches || []).find((x) => x.sessionId === b.dataset.mid);
    if (m) openPartnerProfile(Object.assign({}, m, { faceShown: true }));
  };
  document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => { haptic("light"); showScreen(t.dataset.tab); }));
  $("rater-list").onclick = (e) => {
    const row = e.target.closest("[data-rid]");
    if (!row) return;
    const id = row.dataset.rid;
    if (!revealed(id)) {
      if (!isPremium() && revealsLeft() <= 0) return openRevealPaywall();
      revealRater(id);
    }
    const h = state.raters.find((r) => (r.id || (r.name + ":" + r.ts)) === id);
    if (h && revealed(id)) openRaterProfile(h);
  };
  let pSlot = 0;
  $("p-photos").onclick = (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { state.me.photos.splice(+del.dataset.del, 1); save(); renderMyPhotos(); return; }
    const add = e.target.closest("[data-add]");
    if (add) { pSlot = Math.min(+add.dataset.add, (state.me.photos || []).length); $("p-photo-input").value = ""; $("p-photo-input").click(); return; }
    const img = e.target.closest("img");
    if (img && img.parentElement && img.parentElement.classList.contains("photo-slot")) {
      const imgs = [...$("p-photos").querySelectorAll(".photo-slot > img")];
      openViewer(imgs.map((i) => i.src), Math.max(0, imgs.indexOf(img)));
    }
  };
  $("p-photo-input").onchange = async () => {
    const f = $("p-photo-input").files[0]; if (!f) return;
    try { state.me.photos[pSlot] = await resizeImage(f); state.me.photos = state.me.photos.filter(Boolean).slice(0, 3); save(); renderMyPhotos(); backend.updateMe(publicMe()); } catch { toast("Не удалось загрузить фото", "warn"); }
  };
  ["p-name", "p-country", "p-city", "p-age"].forEach((id) => {
    const el = $(id);
    el.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); finishProfileField(el); } });
    el.addEventListener("blur", () => finishProfileField(el));
  });
  const pageStep = (d) => { const a = parseInt($("p-age").value, 10) || state.me.age || 18; $("p-age").value = Math.max(16, Math.min(99, a + d)); finishProfileField($("p-age")); haptic("select"); };
  $("p-age-minus").onclick = () => pageStep(-1);
  $("p-age-plus").onclick = () => pageStep(1);
  $("p-gender").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state.me.gender = b.dataset.v; save(); backend.updateMe(publicMe()); renderSeek($("p-gender"), state.me.gender); haptic("select"); };
  $("p-seek").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state.me.seeking = b.dataset.v; save(); backend.updateMe(publicMe()); renderSeek($("p-seek"), state.me.seeking); haptic("select"); };
  document.querySelector('[data-screen="profile"]').addEventListener("pointerdown", (e) => {
    if (e.target.closest("input, textarea, button, a")) return;
    const a = document.activeElement;
    if (a && a.closest && a.closest("#edit-card")) a.blur();
  });
  $("sheet-backdrop").onclick = () => closeSheet();
  let sy = null;
  $("sheet").addEventListener("click", (e) => {
    if (e.target.closest(".ps-x, button, a, [data-add], [data-del]")) return;
    const img = e.target.closest(".ps-photo img");
    if (!img) return;
    const box = img.closest(".ps-photos") || img.parentElement;
    const imgs = [...box.querySelectorAll(".ps-photo img")];
    openViewer(imgs.map((i) => i.currentSrc || i.src), Math.max(0, imgs.indexOf(img)));
  });
  $("sheet").addEventListener("touchstart", (e) => { if (viewerOpen() || $("sheet-body").scrollTop > 0) { sy = null; return; } sy = e.touches[0].clientY; }, { passive: true });
  $("sheet").addEventListener("touchmove", (e) => { if (sy == null) return; const dy = e.touches[0].clientY - sy; if (dy > 0) $("sheet").style.transform = `translateY(${dy}px)`; }, { passive: true });
  $("sheet").addEventListener("touchend", (e) => { if (sy == null) return; const dy = e.changedTouches[0].clientY - sy; $("sheet").style.transform = ""; sy = null; if (dy > 110) closeSheet(); });
}

/* ---------- boot ---------- */
function boot() {
  initTelegram();
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
