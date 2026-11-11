/* v2 UI. Talks to the backend only through `backend` (mock.js adapter). */
"use strict";
const tg = window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData !== undefined ? window.Telegram.WebApp : null;
const H = window.HuntyRules;
const RULES = H.RULES;
const KEY = "hunty-save-v2";
const KEY_V1 = "hunty-save-v1";
const $ = (id) => document.getElementById(id);
const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const P = {
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  chat: '<path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/>',
  user: '<circle cx="12" cy="8.5" r="4"/><path d="M4.5 20c1.2-3.6 4-5.5 7.5-5.5s6.3 1.9 7.5 5.5"/>',
  back: '<path d="M15 5l-7 7 7 7"/>',
  more: '<circle cx="6" cy="12" r="1.3" fill="currentColor"/><circle cx="12" cy="12" r="1.3" fill="currentColor"/><circle cx="18" cy="12" r="1.3" fill="currentColor"/>',
  send: '<path d="M12 19V6M12 6l-5 5M12 6l5 5"/>',
  flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
  block: '<circle cx="12" cy="12" r="8.5"/><path d="M6 6l12 12"/>',
  shield: '<path d="M12 3l7 3v5.5c0 4.5-3 8-7 9.5-4-1.5-7-5-7-9.5V6z"/><path d="M9 12l2 2 4-4"/>',
  link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7L12 6.3"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  filter: '<path d="M4 6h16M7 12h10M10 18h4"/>',
  bolt: '<path d="M13 3L5 14h6l-1 7 8-11h-6z"/>',
  lock: '<rect x="5" y="10.5" width="14" height="10" rx="2.5"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>',
  star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8L3.5 9.7l5.9-.9z" fill="currentColor" stroke="none"/>',
  chev: '<path d="M9 5l7 7-7 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6H8l1.5-2h5L16 6h1.5A2.5 2.5 0 0 1 20 8.5v8a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5z"/><circle cx="12" cy="12.5" r="3.5"/>',
  trash: '<path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13"/>',
  flask: '<path d="M9 3h6M10 3v6l-5 9a2 2 0 0 0 1.8 3h10.4A2 2 0 0 0 19 18l-5-9V3"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z"/><path d="M10 20a2 2 0 0 0 4 0"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>',
  crown: '<path d="M4 8l4 4 4-7 4 7 4-4-2 11H6z" fill="currentColor" stroke="none"/>',
  moon: '<path d="M19 14.5A7.5 7.5 0 0 1 9.5 5a7.5 7.5 0 1 0 9.5 9.5z"/>',
  info: '<circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.5"/>',
  eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
};
function ic(name, cls) {
  return `<svg class="${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || ""}</svg>`;
}
function paintIcons(root) {
  (root || document).querySelectorAll("[data-ic]").forEach((el) => { if (!el.firstElementChild) el.innerHTML = ic(el.dataset.ic); });
}
const SOLIDS = ["#8E8E93", "#007AFF", "#34C759", "#5856D6", "#32ADE6", "#AF52DE", "#5AC8FA", "#636366", "#30B0C7", "#0A84FF"];
function avColor(h) { return SOLIDS[(h || 0) % SOLIDS.length]; }
function paintStaticAvatars() {
  document.querySelectorAll(".av[data-h]").forEach((el) => { el.style.background = avColor(Number(el.dataset.h) || 0); });
}
function avatarHTML(p, size) {
  const cls = "av " + (size || "");
  if (p && p.photos && p.photos[0]) return `<span class="${cls}"><img src="${p.photos[0]}" alt=""></span>`;
  const ch = ((p && p.name) || "?").trim().charAt(0).toUpperCase();
  return `<span class="${cls}" style="background:${avColor(p ? p.hue : 0)}">${esc(ch)}</span>`;
}

function todayKey() { const d = new Date(); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; }
function defaultState() {
  return {
    v: 2, onboarded: false, registered: false,
    me: { id: "me_" + Math.random().toString(36).slice(2, 9), name: "", age: null, gender: "", city: "", about: "", photos: [], interests: [], hue: 0, username: "" },
    settings: { theme: "auto", notif: { match: true, messages: true, ratings: true, news: false } },
    premium: { active: false, until: 0, plan: null },
    boostUntil: 0,
    searches: { day: todayKey(), used: 0 },
    ratingsReceived: [], raters: [], reportsAgainstMe: [],
    ban: null, blocked: [], recentPartnerIds: [],
    filters: { gender: "any", ageMin: null, ageMax: null, city: "" },
    totals: { chats: 0, sec: 0 },
  };
}
function mergeState(raw) {
  const d = defaultState();
  const me = Object.assign(d.me, raw.me || {});
  const settings = Object.assign(d.settings, raw.settings || {}, { notif: Object.assign(d.settings.notif, (raw.settings || {}).notif) });
  const out = Object.assign(d, raw, { v: 2, me, settings });
  delete out.history;
  delete out.lastSkipped;
  if (!Array.isArray(out.raters)) out.raters = [];
  if (!Array.isArray(out.recentPartnerIds)) out.recentPartnerIds = [];
  if (!Array.isArray(out.ratingsReceived)) out.ratingsReceived = [];
  if (!Array.isArray(out.reportsAgainstMe)) out.reportsAgainstMe = [];
  if (!Array.isArray(out.blocked)) out.blocked = [];
  if (!out.totals) out.totals = { chats: 0, sec: 0 };
  return out;
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (raw && raw.v === 2) return mergeState(raw);
    const old = JSON.parse(localStorage.getItem(KEY_V1) || "null");
    if (old && typeof old === "object") return mergeState(old);
  } catch { /* reset */ }
  return defaultState();
}
let state = load();
function save() {
  state.v = 2;
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { try { const s = JSON.parse(JSON.stringify(state)); s.me.photos = (s.me.photos || []).slice(0, 1); localStorage.setItem(KEY, JSON.stringify(s)); toast("Мало места: сохранили только главное фото"); } catch { /* ignore */ } }
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
function myUsername() {
  try {
    const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u && u.username) return String(u.username).replace(/^@/, "");
  } catch { /* no telegram user */ }
  return (state.me.username || "").replace(/^@/, "");
}

const backend = window.HuntyMock.createMockBackend({ blocked: state.blocked });
const recent = new Map();

function haptic(kind) {
  try {
    const hf = tg && tg.HapticFeedback; if (!hf) return;
    if (kind === "success" || kind === "error" || kind === "warning") hf.notificationOccurred(kind);
    else if (kind === "select") hf.selectionChanged();
    else hf.impactOccurred(kind || "light");
  } catch { /* ignore */ }
}
function applyChrome() {
  const root = document.documentElement;
  let top = 0, bot = 0, left = 0, right = 0, h = 0;
  try {
    if (tg) {
      const sa = tg.safeAreaInset || {}, csa = tg.contentSafeAreaInset || {};
      top = (+sa.top || 0) + (+csa.top || 0); bot = (+sa.bottom || 0) + (+csa.bottom || 0);
      left = (+sa.left || 0) + (+csa.left || 0); right = (+sa.right || 0) + (+csa.right || 0);
      if (tg.viewportStableHeight) h = tg.viewportStableHeight;
    }
  } catch { /* ignore */ }
  if (!h) h = (window.visualViewport && visualViewport.height) || window.innerHeight;
  root.style.setProperty("--tg-safe-t", top + "px");
  root.style.setProperty("--tg-safe-b", bot + "px");
  root.style.setProperty("--tg-safe-l", left + "px");
  root.style.setProperty("--tg-safe-r", right + "px");
  root.style.setProperty("--app-h", h + "px");
}
function systemTheme() {
  if (tg && tg.colorScheme) return tg.colorScheme === "dark" ? "dark" : "light";
  return window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}
function applyTheme() {
  const pref = state.settings.theme || "auto";
  const theme = pref === "auto" ? systemTheme() : pref;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  const tp = (tg && tg.themeParams) || {};
  const setOrClear = (name, value) => { if (value) root.style.setProperty(name, value); else root.style.removeProperty(name); };
  setOrClear("--accent", tp.button_color || "");
  setOrClear("--accent-text", tp.button_text_color || "");
  const followTg = pref === "auto" && tp && (tp.bg_color || tp.secondary_bg_color);
  if (followTg) {
    setOrClear("--bg", tp.secondary_bg_color || tp.bg_color);
    setOrClear("--card", tp.section_bg_color || tp.bg_color);
    setOrClear("--text", tp.text_color);
    setOrClear("--muted", tp.hint_color);
    setOrClear("--danger", tp.destructive_text_color);
    setOrClear("--bubble-in", tp.section_bg_color || "");
  } else {
    ["--bg", "--card", "--text", "--muted", "--danger", "--bubble-in"].forEach((k) => { if (k === "--accent" || k === "--accent-text") return; root.style.removeProperty(k); });
  }
  const bg = getComputedStyle(root).getPropertyValue("--bg").trim() || (theme === "dark" ? "#000000" : "#F2F2F7");
  const meta = document.querySelector('meta[name="theme-color"]'); if (meta) meta.setAttribute("content", bg);
  try { if (tg && tg.setBackgroundColor) tg.setBackgroundColor(bg); if (tg && tg.setHeaderColor) tg.setHeaderColor(bg); } catch { /* ignore */ }
}
function initTelegram() {
  if (tg) {
    try { tg.ready(); } catch { /* ignore */ }
    try { tg.expand(); } catch { /* ignore */ }
    try { if (typeof tg.disableVerticalSwipes === "function") tg.disableVerticalSwipes(); } catch { /* ignore */ }
    try {
      tg.onEvent("themeChanged", applyTheme);
      tg.onEvent("viewportChanged", () => { try { if (!tg.isExpanded) tg.expand(); } catch { /* ignore */ } applyChrome(); });
      tg.onEvent("safeAreaChanged", applyChrome);
      tg.onEvent("contentSafeAreaChanged", applyChrome);
      if (tg.BackButton) tg.BackButton.onClick(goBack);
    } catch { /* ignore */ }
  }
  applyChrome(); applyTheme();
  window.addEventListener("resize", applyChrome);
  if (window.visualViewport) visualViewport.addEventListener("resize", applyChrome);
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", applyTheme); } catch { /* ignore */ }
}

let current = "splash";
const TABS = ["home", "profile"];
function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("hidden", s.dataset.screen !== name));
  current = name;
  $("tabbar").classList.toggle("hidden", !TABS.includes(name));
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("on", t.dataset.tab === name));
  if (name === "home") renderHome();
  if (name === "profile") renderProfile();
  if (name === "restricted") renderRestricted();
  try {
    if (tg && tg.BackButton) {
      if (["register", "chat", "search"].includes(name) && !(name === "register" && !state.registered)) tg.BackButton.show();
      else tg.BackButton.hide();
    }
  } catch { /* ignore */ }
}
function goBack() {
  if (!$("sheet").classList.contains("hidden")) return closeSheet();
  if (current === "chat") return leaveChat("home");
  if (current === "search") return cancelSearch();
  if (current === "register") return showScreen(state.registered ? "profile" : "onboard");
  if (current !== "home" && TABS.includes(current)) return showScreen("home");
}

let toastT;
function toast(text, kind) {
  const el = $("toast");
  el.textContent = text; el.className = "toast" + (kind ? " " + kind : "");
  void el.offsetWidth; el.classList.remove("hidden");
  clearTimeout(toastT); toastT = setTimeout(() => el.classList.add("hidden"), 2600);
}
let sheetOnClose = null;
function openSheet(html, onClose) {
  const sheet = $("sheet"), bd = $("sheet-backdrop");
  $("sheet-body").innerHTML = html; $("sheet-body").scrollTop = 0;
  paintIcons($("sheet-body"));
  sheet.classList.remove("hidden", "out"); bd.classList.remove("hidden", "out");
  sheetOnClose = onClose || null;
  try { if (tg && tg.BackButton) tg.BackButton.show(); } catch { /* ignore */ }
  return $("sheet-body");
}
function closeSheet(silent) {
  const sheet = $("sheet"), bd = $("sheet-backdrop");
  if (sheet.classList.contains("hidden")) return;
  sheet.classList.add("out"); bd.classList.add("out");
  setTimeout(() => { sheet.classList.add("hidden"); bd.classList.add("hidden"); }, 240);
  const cb = sheetOnClose; sheetOnClose = null;
  if (cb && !silent) cb();
  try { if (tg && tg.BackButton && !["register", "chat", "search"].includes(current)) tg.BackButton.hide(); } catch { /* ignore */ }
}

function obIndex() { const t = $("ob-track"); return Math.round(t.scrollLeft / Math.max(1, t.clientWidth)); }
function syncOb() {
  const i = obIndex();
  [...$("ob-dots").children].forEach((d, k) => d.classList.toggle("on", k === i));
  $("ob-next").textContent = i >= 2 ? "Создать профиль" : "Дальше";
}
function finishOnboarding() { state.onboarded = true; save(); openRegister(false); }

let draft = null;
function openRegister(edit) {
  draft = JSON.parse(JSON.stringify(state.me));
  $("reg-title").textContent = edit ? "Редактировать" : "Твой профиль";
  $("reg-save").textContent = edit ? "Сохранить" : "Начать";
  $("reg-lead").classList.toggle("hidden", !!edit);
  $("rules-row").classList.toggle("hidden", !!edit);
  $("f-name").value = draft.name || "";
  $("f-age").value = draft.age || "";
  $("f-city").value = draft.city || "";
  $("f-about").value = draft.about || "";
  $("f-rules").checked = !!edit;
  renderGender(); renderPhotos(); renderAgeHint();
  showScreen("register");
  $("reg-scroll").scrollTop = 0;
}
function renderGender() { [...$("f-gender").children].forEach((b) => b.classList.toggle("on", b.dataset.v === (draft.gender || ""))); }
function renderPhotos() {
  const slots = [0, 1, 2].map((i) => {
    const src = draft.photos[i];
    if (src) return `<div class="photo-slot ${i === 0 ? "main" : ""}" data-i="${i}"><img src="${src}" alt=""><button class="ps-x" data-del="${i}" aria-label="Удалить">${ic("close")}</button></div>`;
    return `<button class="photo-slot ${i === 0 ? "main" : ""}" data-add="${i}">${ic(i === 0 ? "camera" : "plus")}<span class="ps-label">${i === 0 ? "Главное" : "Ещё"}</span></button>`;
  });
  $("photo-slots").innerHTML = slots.join("");
}
function renderAgeHint() {
  const a = parseInt($("f-age").value, 10);
  const el = $("age-hint");
  if (a && a < RULES.MIN_AGE) { el.textContent = "Доступно с 16 лет"; el.classList.add("err"); return; }
  el.classList.remove("err");
  if (a >= 16 && a < 18) el.textContent = "Ты будешь общаться только с 16–17. Это нельзя обойти.";
  else if (a >= 18) el.textContent = "Ты будешь общаться только с 18+.";
  else el.textContent = "16–17 общаются только с 16–17, 18+ — только с 18+.";
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
  if (!age || age < RULES.MIN_AGE || age > 99) { flagErr($("f-age").parentElement); toast(age && age < 16 ? "Доступно с 16 лет" : "Укажи возраст", "warn"); haptic("error"); return; }
  if (!state.registered && !$("f-rules").checked) { flagErr($("rules-row")); toast("Нужно принять правила", "warn"); haptic("error"); return; }
  if (state.registered && state.me.age && H.agePool(state.me.age) !== H.agePool(age)) {
    toast("Возраст между 16–17 и 18+ меняется только через поддержку", "warn"); haptic("error"); return;
  }
  draft.name = name.slice(0, 20); draft.age = age;
  draft.city = $("f-city").value.trim().slice(0, 28);
  draft.about = $("f-about").value.trim().slice(0, 140);
  draft.username = myUsername();
  draft.hue = draft.hue || Math.floor(Math.random() * SOLIDS.length);
  const first = !state.registered;
  state.me = draft; state.registered = true; state.onboarded = true;
  save(); backend.updateMe(publicMe());
  haptic("success");
  showScreen(first ? "home" : "profile");
  toast(first ? `Привет, ${state.me.name}! Жми «Поиск»` : "Профиль сохранён");
}
function publicMe() { const m = state.me; return { id: m.id, name: m.name, age: m.age, gender: m.gender, city: m.city, interests: m.interests, premium: isPremium() }; }

function fmtDur(sec) { sec = Math.max(0, Math.round(sec || 0)); return `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`; }
function plural(n, a, b, c) { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? b : c; }
function myRep() { return H.reputation(state.ratingsReceived); }
function statsHTML(avg, isNew, count, avgSec, chats) {
  const ratingVal = isNew ? `<b class="new-tag">Новый</b><span>${count} из 5 оценок</span>` : `<b>${avg.toFixed(1)}</b><span>из ${count} ${plural(count, "оценки", "оценок", "оценок")}</span>`;
  return `<div class="stat-grid">
    <div class="stat hl">${ratingVal}</div>
    <div class="stat"><b>${fmtDur(avgSec)}</b><span>ср. разговор</span></div>
    <div class="stat"><b>${chats}</b><span>${plural(chats, "чат", "чата", "чатов")}</span></div></div>`;
}
function partnerStatsHTML(p) { const s = p.stats; return statsHTML(s.avg, s.count < RULES.NEW_UNTIL, s.count, s.avgSec, s.chats); }
function myStatsHTML() {
  const r = myRep(); const t = state.totals;
  return statsHTML(r.avg || 0, r.isNew, r.count, t.chats ? t.sec / t.chats : 0, t.chats);
}
function ratingChip(p) {
  if (p.stats.count < RULES.NEW_UNTIL) return `<span class="new-badge">Новый</span>`;
  return `<span class="rating-chip">${ic("star")}${p.stats.avg.toFixed(1)}</span>`;
}
const proBadge = () => `<span class="pro-badge">${ic("crown")}PRO</span>`;

let onlineCount = 0;
const TIPS = ["Оценка 1–10 — после 30 секунд и трёх сообщений с каждой стороны", "Средняя оценка учитывается после 5 разговоров, до этого ты «Новый»", "«Дальше» с первой секунды. Короткий чат не оценивается и сразу ищет следующего", "Ссылки, @ники и номера в чате блокируются — это защита от скама"];
const filtersActive = () => { const f = state.filters; return f.gender !== "any" || f.ageMin || f.ageMax || f.city; };
function renderHome() {
  rollover();
  const left = searchesLeft(), lim = limit();
  const btn = $("btn-search");
  btn.classList.toggle("off", left <= 0 || banned());
  btn.querySelector(".sb-label").textContent = banned() ? "Ограничено" : left <= 0 ? "Лимит" : "Поиск";
  $("searches-left").innerHTML = isPremium()
    ? `PRO: осталось <b>${left}</b> из ${lim} поисков сегодня`
    : left > 0 ? `Осталось <b>${left}</b> из ${lim} поисков сегодня` : `Бесплатные поиски закончились. Обновятся в полночь`;
  $("searches-bar").style.width = (left / lim * 100) + "%";
  $("pool-note").textContent = myPool() === "teen" ? "Твой пул: 16–17 лет" : "Твой пул: 18+";
  const pro = isPremium();
  document.querySelectorAll(".quick .lock").forEach((l) => l.classList.toggle("hidden", pro));
  const boostOn = state.boostUntil > Date.now();
  $("q-boost").classList.toggle("active", boostOn);
  $("q-boost-label").textContent = boostOn ? `Буст ${Math.ceil((state.boostUntil - Date.now()) / 60000)} мин` : "Буст";
  $("q-filters").classList.toggle("active", pro && !!filtersActive());
  $("my-stats").innerHTML = `<div class="card-head"><h3>Твоя репутация</h3><small>${state.totals.chats ? "по оценкам собеседников" : "появится после чатов"}</small></div>` + myStatsHTML();
  $("home-premium").className = "card premium-card" + (pro ? " on" : "");
  $("home-premium").innerHTML = pro
    ? `<h3>${ic("crown")} PRO</h3><p>Активен до ${new Date(state.premium.until).toLocaleDateString("ru-RU")}. Фильтры и буст уже твои.</p>`
    : `<h3>PRO</h3><p>${RULES.PREMIUM_SEARCHES} поисков в день, фильтры, кто тебя оценил и буст.</p><button class="btn" id="home-pro-btn">Подробнее · от 99 ★</button>`;
  const b = $("home-pro-btn"); if (b) b.onclick = openPremium;
  $("home-tip").innerHTML = `<span class="si t-blue">${ic("info")}</span><div>${TIPS[Math.floor(Date.now() / 60000) % TIPS.length]}</div>`;
  $("online-count").textContent = (onlineCount || 1500).toLocaleString("ru-RU");
}

let tipTimer = null, searching = false;
function startSearch() {
  rollover();
  if (!state.registered) return openRegister(false);
  if (banned()) return showScreen("restricted");
  if (searchesLeft() <= 0) { haptic("warning"); return openLimitSheet(); }
  haptic("medium");
  $("radar-me").innerHTML = avatarHTML(state.me);
  $("srch-title").textContent = "Ищем собеседника…";
  $("srch-sub").textContent = (myPool() === "teen" ? "в пуле 16–17" : "в пуле 18+") + (isPremium() && filtersActive() ? " · фильтры включены" : "");
  $("match-reveal").classList.add("hidden");
  showScreen("search");
  let tip = Math.floor(Math.random() * H.SAFETY_TIPS.length);
  $("safety-text").textContent = H.SAFETY_TIPS[tip++ % H.SAFETY_TIPS.length];
  clearInterval(tipTimer);
  tipTimer = setInterval(() => {
    const p = $("safety-text"); p.classList.add("swap");
    setTimeout(() => { p.textContent = H.SAFETY_TIPS[tip++ % H.SAFETY_TIPS.length]; p.classList.remove("swap"); }, 220);
  }, 2600);
  searching = true;
  const exclude = state.recentPartnerIds.concat(state.blocked);
  const filters = isPremium() && filtersActive() ? state.filters : null;
  backend.findMatch({ filters, exclude, boost: state.boostUntil > Date.now() }).then((m) => {
    if (!searching) return;
    searching = false;
    state.searches.used++; save();
    revealMatch(m);
  }).catch((e) => {
    searching = false; clearInterval(tipTimer);
    if (e && e.code === "cancelled") return;
    if (e && e.code === "empty") { toast(filters ? "По фильтрам сейчас никого. Ослабь фильтры" : "Сейчас никого нет онлайн", "warn"); showScreen("home"); return; }
    toast("Не получилось соединиться", "warn"); showScreen("home");
  });
}
function cancelSearch() {
  clearInterval(tipTimer);
  if (searching) backend.cancelSearch();
  searching = false; showScreen("home");
}
function revealMatch(m) {
  const p = m.partner;
  const el = $("match-reveal");
  el.innerHTML = `<div class="mr-pair">${avatarHTML(state.me, "xl")}${avatarHTML(p, "xl")}</div>
    <div class="mr-title">Есть контакт</div>
    <div class="mr-card"><b>${esc(p.name)}, ${p.age}</b>${p.city ? " · " + esc(p.city) : ""} ${ratingChip(p)}</div>`;
  el.classList.remove("hidden");
  haptic("success");
  setTimeout(() => { clearInterval(tipTimer); if (current === "search") openChat(m); }, 1100);
}

let chat = null, timerInt = null;
function openChat(m) {
  chat = { id: m.sessionId, partner: m.partner, startedAt: m.startedAt, ended: false, unlockedShown: false, contact: null, entry: null, mine: 0, theirs: 0 };
  const p = m.partner;
  $("chat-who").innerHTML = `${avatarHTML(p, "sm")}<span class="cw-info"><b>${esc(p.name)}${p.premium ? " " + proBadge() : ""}</b><small>${p.age}${p.city ? " · " + esc(p.city) : ""}</small></span>`;
  $("messages").innerHTML = `
    <button class="chat-intro" id="chat-intro">${avatarHTML(p, "lg")}<b>${esc(p.name)}, ${p.age}</b>
    <small>${ratingChip(p)} ${p.stats.chats} ${plural(p.stats.chats, "чат", "чата", "чатов")} · ср. ${fmtDur(p.stats.avgSec)}</small><span class="ci-more">Профиль</span></button>
    <div class="sys">Вы на связи. Сообщения не сохраняются. «Дальше» — сразу. Оценка — после 30 секунд и 3 сообщений с каждой стороны.</div>`;
  $("chat-intro").onclick = () => openPartnerProfile(p);
  $("composer").classList.remove("hidden"); $("composer-ended").classList.add("hidden");
  $("typing").classList.add("hidden");
  $("msg-input").value = ""; updateSend(); renderContactBtn();
  $("chat-timer").classList.remove("unlocked");
  showScreen("chat");
  clearInterval(timerInt); tickTimer(); timerInt = setInterval(tickTimer, 1000);
}
function chatDur() { return chat ? Math.floor(((chat.endedAt || Date.now()) - chat.startedAt) / 1000) : 0; }
function tickTimer() {
  if (!chat) return;
  const d = chatDur();
  $("timer-text").textContent = fmtDur(d);
  const frac = Math.min(1, d / RULES.MIN_RATE_SEC);
  $("timer-ring").style.strokeDashoffset = String(50.27 * (1 - frac));
  maybeUnlock();
}
function maybeUnlock() {
  if (!chat || chat.unlockedShown || chat.ended) return;
  if (!H.canRate(chatDur(), chat.mine || 0, chat.theirs || 0)) return;
  chat.unlockedShown = true; $("chat-timer").classList.add("unlocked");
  addSys("Можно будет оценить разговор", "ok"); haptic("light");
}
function addMsg(text, who) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "msg " + who; el.textContent = text;
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function addSys(text, kind) {
  const box = $("messages");
  const el = document.createElement("div"); el.className = "sys" + (kind ? " " + kind : ""); el.textContent = text;
  box.appendChild(el); box.scrollTop = box.scrollHeight;
}
function updateSend() { $("msg-send").disabled = !$("msg-input").value.trim() || !chat || chat.ended; }
function shakeField(el) { el.classList.remove("blocked"); void el.offsetWidth; el.classList.add("blocked"); setTimeout(() => el.classList.remove("blocked"), 500); }
function sendMsg() {
  const input = $("msg-input"); const text = input.value.trim();
  if (!text || !chat || chat.ended) return;
  const bad = H.checkMessage(text);
  if (bad) { toast(bad.message, "warn"); shakeField(input.parentElement); haptic("error"); return; }
  addMsg(text, "me"); chat.mine++;
  input.value = ""; updateSend(); maybeUnlock();
  backend.sendMessage(chat.id, text).catch(() => {});
  haptic("light");
}
function renderContactBtn() {
  const b = $("contact-btn");
  if (!chat || chat.ended) { b.classList.add("hidden"); return; }
  b.classList.remove("hidden");
  if (chat.contact === "matched") { b.textContent = "Контакты обменены"; b.disabled = true; }
  else if (chat.contact === "waiting") { b.textContent = "Ждём собеседника…"; b.disabled = true; }
  else { b.textContent = "Обменяться контактами"; b.disabled = false; }
}
function showContactCard(username) {
  if (!chat || chat.contact === "matched") return;
  chat.contact = "matched";
  const safe = String(username || "").replace(/[^a-zA-Z0-9_]/g, "");
  if (!safe) return;
  const box = $("messages");
  const el = document.createElement("div");
  el.className = "contact-card";
  el.innerHTML = `<b>Контакты обменены</b><div class="cc-user">@${esc(safe)}</div><button class="btn btn-primary" type="button">Открыть в Telegram</button>`;
  el.querySelector("button").onclick = () => {
    const url = "https://t.me/" + safe;
    try { if (tg && tg.openTelegramLink) tg.openTelegramLink(url); else window.open(url, "_blank", "noopener"); }
    catch { window.open(url, "_blank", "noopener"); }
  };
  box.appendChild(el); box.scrollTop = box.scrollHeight;
  renderContactBtn();
  haptic("success");
}
function explainNoUsername() {
  openSheet(`<div class="sh-title">Нужен @username</div>
    <div class="sh-sub">Открой настройки Telegram и задай публичное имя пользователя. Без него контакт обменять нельзя. Писать @ники, ссылки и номера в чат по-прежнему нельзя.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="un-ok">Понятно</button></div>`);
  $("sheet-body").querySelector("#un-ok").onclick = () => closeSheet(true);
}
async function requestContact() {
  if (!chat || chat.ended) return;
  if (chat.contact === "matched" || chat.contact === "waiting") return;
  const me = myUsername();
  if (!me) { haptic("warning"); return explainNoUsername(); }
  chat.contact = "waiting";
  renderContactBtn();
  haptic("light");
  try {
    const r = await backend.requestContact(chat.id);
    if (r && r.status === "matched" && r.username) showContactCard(r.username);
  } catch {
    chat.contact = null; renderContactBtn(); toast("Не удалось отправить запрос", "warn");
  }
}
async function endChat() {
  if (!chat) return null;
  if (chat.ended) return chat.entry;
  chat.ended = true; chat.endedAt = Date.now();
  clearInterval(timerInt);
  const res = await backend.leave(chat.id);
  const entry = { id: chat.id, partner: chat.partner, dur: res.dur, canRate: res.canRate, given: null };
  chat.entry = entry;
  recent.set(chat.id, entry);
  state.totals.chats++; state.totals.sec += res.dur;
  state.recentPartnerIds = state.recentPartnerIds.filter((id) => id !== chat.partner.id).concat(chat.partner.id).slice(-3);
  save();
  return entry;
}
function wipeChat() {
  if ($("messages")) $("messages").innerHTML = "";
  chat = null;
}
async function leaveChat(after) {
  if (!chat) return showScreen("home");
  const entry = await endChat();
  if (entry && entry.canRate && entry.given == null) return openRateSheet(entry, after);
  afterChat(after);
}
function afterChat(after) {
  wipeChat();
  if (after === "next") startSearch(); else showScreen("home");
}

const RATE_LABEL = ["", "Ужасно", "Очень плохо", "Плохо", "Так себе", "Нормально", "Неплохо", "Хорошо", "Отлично", "Супер", "Лучший разговор"];
function openRateSheet(entry, after) {
  let score = null;
  const tags = ["Интересно", "Смешно", "Вежливо", "Глубоко", "Скучно", "Грубо"];
  const picked = new Set();
  const body = openSheet(`
    <div class="sh-title">Как прошёл разговор?</div>
    <div class="sh-sub">с ${esc(entry.partner.name)} · ${fmtDur(entry.dur)}</div>
    <div class="rate-big empty" id="rate-big"><b>–</b><span>Выбери от 1 до 10</span></div>
    <div class="rate-grid" id="rate-grid">${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => `<button class="rate-btn" data-n="${n}">${n}</button>`).join("")}</div>
    <div class="rate-tags" id="rate-tags">${tags.map((t) => `<button class="chip" data-t="${t}">${t}</button>`).join("")}</div>
    <div class="sh-actions row"><button class="btn btn-soft" id="rate-home">${after === "next" ? "Пропустить" : "Не сейчас"}</button><button class="btn btn-primary" id="rate-send" disabled>${after === "next" ? "Оценить и дальше" : "Оценить"}</button></div>
    <div class="rate-note">Оценка анонимна. Нужны 30 секунд и хотя бы по 3 сообщения с каждой стороны. Сам разговор не сохранится.</div>`, () => afterChat(after));
  body.querySelector("#rate-grid").onclick = (e) => {
    const b = e.target.closest("[data-n]"); if (!b) return;
    score = +b.dataset.n; haptic("select");
    body.querySelectorAll(".rate-btn").forEach((x) => { x.className = "rate-btn"; });
    b.classList.add("on", score <= 3 ? "lo" : score <= 6 ? "mid" : "hi");
    const big = body.querySelector("#rate-big"); big.classList.remove("empty");
    big.innerHTML = `<b>${score}</b><span>${RATE_LABEL[score]}</span>`;
    body.querySelector("#rate-send").disabled = false;
  };
  body.querySelector("#rate-tags").onclick = (e) => {
    const b = e.target.closest("[data-t]"); if (!b) return;
    if (picked.has(b.dataset.t)) picked.delete(b.dataset.t); else picked.add(b.dataset.t);
    b.classList.toggle("on"); haptic("select");
  };
  body.querySelector("#rate-home").onclick = () => closeSheet();
  body.querySelector("#rate-send").onclick = async () => {
    if (!score) return;
    const r = await backend.rate(entry.id, score, [...picked]);
    if (r.accepted) { entry.given = score; save(); haptic("success"); toast("Спасибо! Оценка учтена"); }
    else toast(r.reason === "duplicate" ? "Ты уже оценил этот разговор" : "Оценка недоступна", "warn");
    closeSheet();
  };
}

function photosHTML(p) {
  const n = 3;
  const tiles = [];
  for (let i = 0; i < n; i++) {
    if (p.photos && p.photos[i]) tiles.push(`<div class="ps-photo"><img src="${p.photos[i]}" alt=""></div>`);
    else tiles.push(`<div class="ps-photo" style="background:${avColor((p.hue || 0) + i)}"><span class="ph-initial">${esc(p.name.charAt(0))}</span></div>`);
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
function openPartnerProfile(p) {
  const common = (p.interests || []).filter((x) => (state.me.interests || []).includes(x));
  const body = openSheet(`${photosHTML(p)}
    <div class="ps-name"><h2>${esc(p.name)}, ${p.age}</h2>${p.premium ? proBadge() : ""}</div>
    <div class="ps-meta">${p.city ? esc(p.city) + " · " : ""}${p.gender === "f" ? "девушка" : p.gender === "m" ? "парень" : "пол не указан"}</div>
    <div class="ps-about">${esc(p.about || "")}</div>
    <div class="ps-section">Репутация</div>${partnerStatsHTML(p)}
    <div class="ps-section">Интересы${common.length ? ` · ${common.length} ${plural(common.length, "общий", "общих", "общих")}` : ""}</div>
    <div class="chips">${(p.interests || []).map((x) => `<span class="chip static ${common.includes(x) ? "match" : ""}">${esc(x)}</span>`).join("")}</div>
    <div class="sh-actions row"><button class="btn btn-soft" id="pp-report">${ic("flag")}Жалоба</button><button class="btn btn-soft" id="pp-block">${ic("block")}Блок</button></div>`);
  bindPhotoDots(body);
  body.querySelector("#pp-report").onclick = () => openReport(p);
  body.querySelector("#pp-block").onclick = () => confirmBlock(p);
}
function openChatMenu() {
  if (!chat) return;
  const p = chat.partner;
  const contactLabel = chat.contact === "matched" ? "Контакты обменены" : chat.contact === "waiting" ? "Ждём обмен контактами" : "Обменяться контактами";
  const body = openSheet(`<div class="menu-list">
    <button class="menu-item" id="m-contact"><span class="lr-ic t-blue">${ic("link")}</span>${contactLabel}</button>
    <button class="menu-item" id="m-prof"><span class="lr-ic t-indigo">${ic("user")}</span>Профиль: ${esc(p.name)}</button>
    <button class="menu-item" id="m-next"><span class="lr-ic t-gray">${ic("chev")}</span>Дальше</button>
    <button class="menu-item danger" id="m-report"><span class="lr-ic t-red">${ic("flag")}</span>Пожаловаться</button>
    <button class="menu-item danger" id="m-block"><span class="lr-ic t-gray">${ic("block")}</span>Заблокировать</button></div>`);
  body.querySelector("#m-contact").onclick = () => { closeSheet(true); setTimeout(requestContact, 180); };
  body.querySelector("#m-prof").onclick = () => openPartnerProfile(p);
  body.querySelector("#m-next").onclick = () => { closeSheet(true); setTimeout(() => leaveChat("next"), 200); };
  body.querySelector("#m-report").onclick = () => openReport(p);
  body.querySelector("#m-block").onclick = () => confirmBlock(p);
}
function openReport(p) {
  let reason = null;
  const body = openSheet(`<div class="sh-title">Пожаловаться</div><div class="sh-sub">на ${esc(p.name)}. Собеседник не узнает, кто пожаловался.</div>
    <div class="reason-list" id="reasons">${RULES.REPORT_REASONS.map((r) => `<button class="reason" data-r="${r.id}"><span class="rd"></span>${r.label}</button>`).join("")}</div>
    <div class="block-row"><span class="lr-label">Заблокировать тоже</span><button class="toggle on" id="rep-block" aria-label="Блок"></button></div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg" id="rep-send" disabled>Отправить жалобу</button></div>`);
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
    if (chat && chat.partner.id === p.id && !chat.ended) { await endChat(); addSys("Чат завершён после жалобы", "warn"); showEnded(); }
  };
}
function confirmBlock(p) {
  const body = openSheet(`<div class="sh-title">Заблокировать ${esc(p.name)}?</div><div class="sh-sub">Вы больше не попадёте друг на друга. Отменить можно в профиле.</div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg" id="blk-yes">Заблокировать</button><button class="btn btn-ghost" id="blk-no">Отмена</button></div>`);
  body.querySelector("#blk-no").onclick = () => closeSheet(true);
  body.querySelector("#blk-yes").onclick = async () => {
    await doBlock(p); closeSheet(true); toast(`${p.name} в блоке`); haptic("success");
    if (chat && chat.partner.id === p.id && !chat.ended) { await endChat(); addSys("Ты заблокировал собеседника", "warn"); showEnded(); }
    refresh();
  };
}
async function doBlock(p) { if (!state.blocked.includes(p.id)) state.blocked.push(p.id); await backend.block(p.id); save(); }
function showEnded() {
  $("composer").classList.add("hidden");
  $("composer-ended").classList.remove("hidden");
  $("typing").classList.add("hidden");
  $("contact-btn").classList.add("hidden");
}

function renderProfile() {
  const m = state.me, pro = isPremium(), rep = myRep();
  $("me-card").innerHTML = `${avatarHTML(m, "lg")}<div class="mc-info"><h2>${esc(m.name || "Без имени")}${m.age ? ", " + m.age : ""} ${pro ? proBadge() : ""}</h2><p>${[m.city, m.age ? (myPool() === "teen" ? "пул 16–17" : "пул 18+") : ""].filter(Boolean).map(esc).join(" · ")}</p></div><button class="btn btn-soft" id="me-edit">${ic("edit")}Изменить</button>`;
  $("me-edit").onclick = () => openRegister(true);
  $("me-stats").innerHTML = `<div class="card-head"><h3>Статистика</h3><small>${rep.count} ${plural(rep.count, "оценка", "оценки", "оценок")}</small></div>` + myStatsHTML();
  $("me-premium").className = "card premium-card" + (pro ? " on" : "");
  $("me-premium").innerHTML = pro
    ? `<h3>${ic("crown")} PRO активен</h3><p>До ${new Date(state.premium.until).toLocaleDateString("ru-RU")} · ${RULES.PREMIUM_SEARCHES} поисков в день</p>`
    : `<h3>PRO</h3><p>Больше поисков, фильтры, кто тебя оценил и буст.</p><button class="btn" id="me-pro-btn">Подключить за Stars</button>`;
  const pb = $("me-pro-btn"); if (pb) pb.onclick = openPremium;
  const lockOr = pro ? `<span class="chev">${ic("chev")}</span>` : `<span class="chev">${ic("lock")}</span>`;
  $("me-premium-tools").innerHTML = `<button class="list-row" id="pt-raters"><span class="lr-ic t-purple">${ic("eye")}</span><span class="lr-label">Кто меня оценил</span>${lockOr}</button>
    <button class="list-row" id="pt-filters"><span class="lr-ic t-blue">${ic("filter")}</span><span class="lr-label">Фильтры поиска</span>${lockOr}</button>`;
  $("pt-raters").onclick = openRaters;
  $("pt-filters").onclick = openFilters;
  [...$("theme-seg").children].forEach((b) => b.classList.toggle("on", b.dataset.v === state.settings.theme));
  const N = [["match", "Найден собеседник", "search", "t-blue"], ["messages", "Сообщения", "chat", "t-green"], ["ratings", "Новые оценки", "star", "t-yellow"], ["news", "Новости", "bell", "t-red"]];
  $("notif-list").innerHTML = N.map(([k, l, i, c]) => `<div class="list-row"><span class="lr-ic ${c}">${ic(i)}</span><span class="lr-label">${l}</span><button class="toggle ${state.settings.notif[k] ? "on" : ""}" data-n="${k}" aria-label="${l}"></button></div>`).join("");
  $("blocked-count").textContent = state.blocked.length;
}

const PLANS = [{ id: "week", name: "Неделя", stars: 99, note: "7 дней" }, { id: "month", name: "Месяц", stars: 299, note: "30 дней", save: "−30%" }];
function openPremium() {
  let plan = "month";
  const feats = [["search", `${RULES.PREMIUM_SEARCHES} поисков в день`, `вместо ${RULES.FREE_SEARCHES} бесплатно`], ["filter", "Фильтры", "пол, возраст, город"], ["eye", "Кто тебя оценил", "имена и оценки, без переписки"], ["bolt", "Буст профиля", "30 минут быстрее в поиске"], ["crown", "Значок PRO", "в профиле и в чате"]];
  const body = openSheet(`<div class="prem-hero"><div class="prem-badge-big">${ic("crown")}</div><div class="sh-title">PRO</div><div class="sh-sub">Оплата через Telegram Stars</div></div>
    <div class="feat-list">${feats.map(([i, b, s]) => `<div class="feat"><span class="lr-ic">${ic(i)}</span><div><b>${b}</b><small>${s}</small></div></div>`).join("")}</div>
    <div class="plans" id="plans">${PLANS.map((p) => `<button class="plan ${p.id === plan ? "on" : ""}" data-p="${p.id}">${p.save ? `<span class="save">${p.save}</span>` : ""}<b>${p.name}</b><span class="price">${ic("star")}${p.stars}</span><small>${p.note}</small></button>`).join("")}</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="buy">Оплатить ${PLANS[1].stars} ★</button></div>
    <div class="limits-note">PRO не повышает рейтинг и не защищает от жалоб. Правила одни для всех.</div>`);
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
    <div class="sh-sub">PRO · ${plan.note}<br>Тестовый режим: звёзды не списываются. В релизе откроется счёт Telegram.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="pay-ok">Подтвердить</button><button class="btn btn-ghost" id="pay-no">Отмена</button></div></div>`);
  body.querySelector("#pay-no").onclick = () => closeSheet(true);
  body.querySelector("#pay-ok").onclick = async () => {
    body.innerHTML = `<div class="pay-box"><div class="spinner"></div><div class="sh-sub">Проводим оплату…</div></div>`;
    const r = await backend.purchasePremium(plan.id);
    if (!r.ok) { closeSheet(true); return toast("Оплата не прошла", "warn"); }
    state.premium = { active: true, until: r.until, plan: plan.id }; save(); backend.updateMe(publicMe());
    haptic("success");
    body.innerHTML = `<div class="pay-box"><div class="success-ic">${ic("check")}</div><div class="sh-title">PRO подключён</div><div class="sh-sub">До ${new Date(r.until).toLocaleDateString("ru-RU")}. Теперь ${RULES.PREMIUM_SEARCHES} поисков в день.</div><div class="sh-actions"><button class="btn btn-primary btn-lg" id="pay-done">Хорошо</button></div></div>`;
    body.querySelector("#pay-done").onclick = () => closeSheet(true);
    refresh();
  };
}
function requirePro(fn) { return () => { if (!isPremium()) { haptic("warning"); return openPremium(); } fn(); }; }
const openFilters = requirePro(() => {
  const f = state.filters;
  const body = openSheet(`<div class="sh-title">Фильтры поиска</div><div class="sh-sub">Возраст — только внутри твоего пула (${myPool() === "teen" ? "16–17" : "18+"})</div>
    <div class="filter-block"><label>Пол</label><div class="segment" id="ff-g"><button data-v="any">Все</button><button data-v="f">Девушки</button><button data-v="m">Парни</button></div></div>
    <div class="filter-block"><label>Возраст</label><div class="range-row"><label class="field"><input id="ff-min" inputmode="numeric" maxlength="2" placeholder="от" value="${f.ageMin || ""}"></label><span>—</span><label class="field"><input id="ff-max" inputmode="numeric" maxlength="2" placeholder="до" value="${f.ageMax || ""}"></label></div></div>
    <div class="filter-block"><label>Город</label><label class="field"><input id="ff-city" placeholder="Любой" value="${esc(f.city)}"></label></div>
    <div class="sh-actions row"><button class="btn btn-soft" id="ff-reset">Сбросить</button><button class="btn btn-primary" id="ff-save">Применить</button></div>`);
  let g = f.gender;
  const seg = body.querySelector("#ff-g");
  const paint = () => [...seg.children].forEach((b) => b.classList.toggle("on", b.dataset.v === g)); paint();
  seg.onclick = (e) => { const b = e.target.closest("[data-v]"); if (b) { g = b.dataset.v; paint(); haptic("select"); } };
  body.querySelector("#ff-reset").onclick = () => { state.filters = { gender: "any", ageMin: null, ageMax: null, city: "" }; save(); closeSheet(true); refresh(); toast("Фильтры сброшены"); };
  body.querySelector("#ff-save").onclick = () => {
    state.filters = { gender: g, ageMin: parseInt(body.querySelector("#ff-min").value, 10) || null, ageMax: parseInt(body.querySelector("#ff-max").value, 10) || null, city: body.querySelector("#ff-city").value.trim() };
    save(); closeSheet(true); refresh(); toast("Фильтры применены"); haptic("success");
  };
});
const openRaters = requirePro(() => {
  const rows = [...state.raters].reverse();
  openSheet(`<div class="sh-title">Кто тебя оценил</div><div class="sh-sub">Только чаты от 30 секунд, где оба написали хотя бы по 3 сообщения. Переписка не хранится.</div>
    <div class="list-group" style="margin-top:16px">${rows.length ? rows.map((h) => `<div class="rated-row">${avatarHTML(h, "sm")}<div><b>${esc(h.name)}</b><div class="hint" style="margin:0">${fmtDur(h.dur)}</div></div><span class="score">${h.score}</span></div>`).join("") : `<div class="rated-row"><span class="hint">Пока никто. Нужны 30 секунд и по 3 сообщения.</span></div>`}</div>`);
});
const doBoost = requirePro(() => {
  if (state.boostUntil > Date.now()) return toast("Буст уже работает");
  state.boostUntil = Date.now() + 30 * 60e3; save(); renderHome(); haptic("success"); toast("Буст на 30 минут включён");
});
function openLimitSheet() {
  const body = openSheet(`<div class="sh-title">Поиски на сегодня закончились</div><div class="sh-sub">Бесплатно — ${RULES.FREE_SEARCHES} в день, обновятся в полночь. С PRO — ${RULES.PREMIUM_SEARCHES}.</div>
    <div class="sh-actions"><button class="btn btn-primary btn-lg" id="lim-pro">PRO</button><button class="btn btn-ghost" id="lim-no">Подожду</button></div>`);
  body.querySelector("#lim-pro").onclick = openPremium;
  body.querySelector("#lim-no").onclick = () => closeSheet(true);
}

function openRules() {
  const R0 = [["Только 16+", "Возраст обязателен. 16–17 и 18+ — отдельные пулы, они никогда не пересекаются. Обман с возрастом — бан."], ["Без 18+ контента", "Никакой эротики, интим-предложений и откровенных фото — для всех возрастов."], ["Уважение", "Оскорбления, угрозы, травля и дискриминация — повод для жалобы."], ["Без скама и рекламы", "Ссылки, @ники, номера и инвайты в чате блокируются. Контакт — только если оба нажали «Обменяться контактами»."], ["Жалобы, а не оценки", "Поиск ограничивают жалобы от разных людей. Низкие оценки никогда не банят."], ["Честные оценки", "Оценка 1–10 — только если разговор шёл хотя бы 30 секунд и каждый отправил минимум 3 сообщения. «Дальше» доступно с первой секунды: если порог не пройден, оценки нет и сразу новый поиск. Сообщения не сохраняются."]];
  openSheet(`<div class="sh-title">Правила</div><div class="sh-sub">Коротко и по делу</div>
    <div class="rules-list">${R0.map(([b, p], i) => `<div class="rule"><span class="rn">${i + 1}</span><div><b>${b}</b><p>${p}</p></div></div>`).join("")}</div>
    <div class="rate-note">Ограничения: 3 жалобы за сутки — 1 час, 6 — 24 часа, 10 за 3 дня — 7 дней.</div>`);
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
  if (state.ban) $("rs-reason").textContent = `На тебя пожаловались ${state.ban.reports} разных человека за сутки. Низкие оценки к ограничениям не приводят — только жалобы.`;
  tick(); rsInt = setInterval(tick, 1000);
}

function simulateReports() {
  const now = Date.now();
  for (let i = 0; i < 3; i++) state.reportsAgainstMe.push({ from: "test_" + Math.random().toString(36).slice(2, 7), reason: "insult", ts: now - i * 1000 });
  const ev = H.evaluateReports(state.reportsAgainstMe, now);
  if (ev) state.ban = ev;
  save(); haptic("warning");
  if (banned()) showScreen("restricted");
}
function simulateRatings() {
  const pool = window.HuntyMock.PROFILES;
  for (let i = 0; i < 5; i++) {
    const p = pool[(Math.random() * pool.length) | 0];
    const score = 6 + ((Math.random() * 5) | 0);
    const dur = 90 + ((Math.random() * 400) | 0);
    state.ratingsReceived.push({ from: p.id + "_" + i + "_" + Date.now(), score, dur, ts: Date.now() });
    state.raters.push({ name: p.name, hue: p.hue, score, dur, ts: Date.now() });
  }
  state.totals.chats += 5; state.totals.sec += 5 * 240;
  save(); renderProfile(); toast("Добавлено 5 тестовых оценок");
}
function resetAll() {
  const body = openSheet(`<div class="sh-title">Сбросить всё?</div><div class="sh-sub">Профиль, оценки и PRO удалятся с этого устройства.</div>
    <div class="sh-actions"><button class="btn btn-danger btn-lg" id="rst-yes">Сбросить</button><button class="btn btn-ghost" id="rst-no">Отмена</button></div>`);
  body.querySelector("#rst-no").onclick = () => closeSheet(true);
  body.querySelector("#rst-yes").onclick = () => { localStorage.removeItem(KEY); localStorage.removeItem(KEY_V1); location.reload(); };
}
function refresh() { if (current === "home") renderHome(); if (current === "profile") renderProfile(); }

function bindBackend() {
  backend.on("online", ({ count }) => { onlineCount = count; const el = $("online-count"); if (el) el.textContent = count.toLocaleString("ru-RU"); });
  backend.on("typing", ({ sessionId, on }) => {
    if (!chat || chat.id !== sessionId || chat.ended) return;
    $("typing").classList.toggle("hidden", !on);
    if (on) { const b = $("messages"); b.scrollTop = b.scrollHeight; }
  });
  backend.on("message", ({ sessionId, text }) => {
    if (!chat || chat.id !== sessionId || chat.ended) return;
    $("typing").classList.add("hidden"); chat.theirs++; addMsg(text, "them"); maybeUnlock(); haptic("light");
  });
  backend.on("partnerLeft", async ({ sessionId }) => {
    if (!chat || chat.id !== sessionId || chat.ended) return;
    const name = chat.partner.name;
    await endChat();
    addSys(`${name} вышел(а) из чата`, "warn"); showEnded(); haptic("warning");
  });
  backend.on("ratedByPartner", ({ sessionId, score, dur, partnerId }) => {
    const rec = recent.get(sessionId);
    state.ratingsReceived.push({ from: partnerId, score, dur, ts: Date.now() });
    if (rec && rec.partner) state.raters.push({ name: rec.partner.name, hue: rec.partner.hue, photos: rec.partner.photos, score, dur, ts: Date.now() });
    save(); refresh();
  });
  backend.on("contactMatched", ({ sessionId, username }) => {
    if (!chat || chat.id !== sessionId) return;
    showContactCard(username);
  });
}

function bind() {
  $("ob-track").addEventListener("scroll", syncOb, { passive: true });
  $("ob-next").onclick = () => {
    const i = obIndex(); if (i >= 2) return finishOnboarding();
    $("ob-track").scrollTo({ left: (i + 1) * $("ob-track").clientWidth, behavior: "smooth" }); haptic("light");
  };
  $("ob-skip").onclick = finishOnboarding;

  $("reg-back").onclick = goBack;
  $("f-gender").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; draft.gender = b.dataset.v; renderGender(); haptic("select"); };
  $("f-age").addEventListener("input", () => { $("f-age").value = $("f-age").value.replace(/\D/g, ""); renderAgeHint(); });
  const step = (d) => { const a = parseInt($("f-age").value, 10) || (d > 0 ? 17 : 19); $("f-age").value = Math.max(16, Math.min(99, a + d)); renderAgeHint(); haptic("select"); };
  $("age-minus").onclick = () => step(-1); $("age-plus").onclick = () => step(1);
  let photoSlot = 0;
  $("photo-slots").onclick = (e) => {
    const del = e.target.closest("[data-del]");
    if (del) { draft.photos.splice(+del.dataset.del, 1); renderPhotos(); return; }
    const add = e.target.closest("[data-add]");
    if (add) { photoSlot = Math.min(+add.dataset.add, draft.photos.length); $("photo-input").value = ""; $("photo-input").click(); }
  };
  $("photo-input").onchange = async () => {
    const f = $("photo-input").files[0]; if (!f) return;
    try { draft.photos[photoSlot] = await resizeImage(f); draft.photos = draft.photos.filter(Boolean).slice(0, 3); renderPhotos(); } catch { toast("Не удалось загрузить фото", "warn"); }
  };
  $("open-rules-reg").onclick = (e) => { e.preventDefault(); e.stopPropagation(); openRules(); };
  $("reg-save").onclick = saveRegister;

  $("btn-search").onclick = () => startSearch();
  $("q-filters").onclick = openFilters;
  $("q-boost").onclick = doBoost;
  $("srch-cancel").onclick = cancelSearch;

  $("chat-back").onclick = () => leaveChat("home");
  $("chat-skip").onclick = () => { haptic("medium"); leaveChat("next"); };
  $("chat-more").onclick = openChatMenu;
  $("chat-who").onclick = () => chat && openPartnerProfile(chat.partner);
  $("contact-btn").onclick = requestContact;
  $("msg-input").addEventListener("input", updateSend);
  $("msg-input").addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); sendMsg(); } });
  $("msg-send").onclick = sendMsg;
  $("ended-home").onclick = () => leaveChat("home");
  $("ended-next").onclick = () => leaveChat("next");

  $("theme-seg").onclick = (e) => { const b = e.target.closest("[data-v]"); if (!b) return; state.settings.theme = b.dataset.v; save(); applyTheme(); renderProfile(); haptic("select"); };
  $("notif-list").onclick = (e) => { const b = e.target.closest("[data-n]"); if (!b) return; state.settings.notif[b.dataset.n] = !state.settings.notif[b.dataset.n]; save(); b.classList.toggle("on"); haptic("select"); toast("Уведомления заработают вместе с сервером"); };
  $("open-rules").onclick = openRules;
  $("open-blocked").onclick = () => {
    const body = openSheet(`<div class="sh-title">Заблокированные</div><div class="list-group" style="margin-top:16px">${state.blocked.length ? state.blocked.map((id) => { const p = backend.getProfile(id) || { name: id, hue: 0 }; return `<div class="rated-row">${avatarHTML(p, "sm")}<b>${esc(p.name)}</b><button class="btn btn-soft unb" data-unb="${id}">Разблокировать</button></div>`; }).join("") : `<div class="rated-row"><span class="hint">Никого нет</span></div>`}</div>`);
    body.onclick = (e) => { const b = e.target.closest("[data-unb]"); if (!b) return; state.blocked = state.blocked.filter((x) => x !== b.dataset.unb); save(); closeSheet(true); toast("Разблокировано. В тесте применится после перезапуска"); renderProfile(); };
  };
  $("t-reports").onclick = simulateReports;
  $("t-ratings").onclick = simulateRatings;
  $("t-reset").onclick = resetAll;
  $("rs-rules").onclick = openRules;
  $("rs-appeal").onclick = () => toast("Обжалование появится вместе с сервером");
  $("rs-lift").onclick = () => { state.ban = null; state.reportsAgainstMe = []; save(); showScreen("home"); toast("Ограничение снято (тест)"); };

  document.querySelectorAll(".tab").forEach((t) => (t.onclick = () => { haptic("light"); showScreen(t.dataset.tab); }));
  $("sheet-backdrop").onclick = () => closeSheet();
  let sy = null;
  $("sheet").addEventListener("touchstart", (e) => { if ($("sheet-body").scrollTop <= 0) sy = e.touches[0].clientY; }, { passive: true });
  $("sheet").addEventListener("touchmove", (e) => { if (sy == null) return; const dy = e.touches[0].clientY - sy; if (dy > 0) $("sheet").style.transform = `translateY(${dy}px)`; }, { passive: true });
  $("sheet").addEventListener("touchend", (e) => { if (sy == null) return; const dy = e.changedTouches[0].clientY - sy; $("sheet").style.transform = ""; sy = null; if (dy > 110) closeSheet(); });
}

function boot() {
  initTelegram();
  paintIcons(); paintStaticAvatars();
  bind(); bindBackend();
  rollover();
  try {
    const u = tg && tg.initDataUnsafe && tg.initDataUnsafe.user;
    if (u) {
      if (!state.me.name && u.first_name) state.me.name = String(u.first_name).slice(0, 20);
      if (u.username) state.me.username = String(u.username).replace(/^@/, "");
    }
  } catch { /* ignore */ }
  backend.connect({ initData: tg ? tg.initData : "", me: publicMe() }).then((r) => { onlineCount = r.online; refresh(); });
  save();
  const next = !state.onboarded ? "onboard" : !state.registered ? "register" : banned() ? "restricted" : "home";
  showScreen("splash");
  setTimeout(() => {
    const sp = document.querySelector(".splash"); if (sp) sp.classList.add("leaving");
    setTimeout(() => { if (next === "register") openRegister(false); else showScreen(next); if (next === "onboard") syncOb(); }, 280);
  }, 700);
}
boot();
