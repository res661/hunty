/*
 * Hunty — shared product rules (reputation, reports, limits, age pools).
 * Pure functions, no DOM. The same logic is meant to run on the server later
 * (see ARCHITECTURE.md); the client copy is only for display / the test mode.
 */
(function () {
  const RULES = {
    MIN_AGE: 18,
    ADULT_AGE: 18,
    MIN_RATE_MSGS: 3,          // rating after 3 messages total, no time gate
    NEW_UNTIL: 5,              // show "Новый" until 5 counted ratings
    PRIOR_MEAN: 7.2,           // Bayesian prior — damps tiny samples
    PRIOR_WEIGHT: 4,
    OUTLIER_DEV: 3.5,          // ratings this far from the median get damped
    OUTLIER_WEIGHT: 0.35,
    FREE_SEARCHES: 30,
    PREMIUM_SEARCHES: 300,
    // Soft-ban is driven ONLY by reports, never by low ratings.
    // 30 reports inside a rolling 24 h window → search blocked for 10 h.
    // Reports that already triggered a ban do not immediately start another one.
    BAN_REPORTS: 30,
    BAN_WINDOW_MS: 24 * 3600e3,
    BAN_MS: 10 * 3600e3,
    REPORT_REASONS: [
      { id: "spam", label: "Спам или реклама" },
      { id: "insult", label: "Оскорбления" },
      { id: "nsfw", label: "Контент 18+" },
      { id: "scam", label: "Мошенничество" },
      { id: "other", label: "Другое" },
    ],
  };

  /** Single pool: 18+ only. Under 18 is not a pool and never matches. */
  function agePool(age) {
    const n = Number(age);
    return n >= RULES.MIN_AGE ? "adult" : "";
  }

  /** Both people must be 18 or older. There is no under-18 pool. */
  function canMatchAges(a, b) {
    const x = Number(a), y = Number(b);
    if (!(x >= RULES.MIN_AGE) || !(y >= RULES.MIN_AGE)) return false;
    return agePool(x) === agePool(y);
  }

  function median(xs) {
    const s = [...xs].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /**
   * ratings: [{ from, score (1..10), dur (sec), ts, raterTrust? (0..1) }]
   * - a rating is offered once the chat has 3 messages in total (either side)
   * - one rating per pair (latest wins)
   * - weight grows with conversation length and rater trust
   * - outliers vs median are damped, Bayesian prior pulls small samples to the mean
   */
  function reputation(ratings) {
    const byFrom = new Map();
    for (const r of ratings || []) {
      if (!r) continue;
      const s = Math.round(Number(r.score));
      if (!(s >= 1 && s <= 10)) continue;
      const prev = byFrom.get(r.from);
      if (!prev || prev.ts < r.ts) byFrom.set(r.from, { ...r, score: s });
    }
    const list = [...byFrom.values()];
    if (!list.length) return { avg: null, count: 0, isNew: true };
    const med = median(list.map((r) => r.score));
    let sum = 0, wsum = 0;
    for (const r of list) {
      let w = (0.6 + 0.4 * Math.min(1, r.dur / 300)) * (r.raterTrust == null ? 1 : r.raterTrust);
      if (Math.abs(r.score - med) > RULES.OUTLIER_DEV) w *= RULES.OUTLIER_WEIGHT;
      sum += r.score * w;
      wsum += w;
    }
    const avg = (sum + RULES.PRIOR_MEAN * RULES.PRIOR_WEIGHT) / (wsum + RULES.PRIOR_WEIGHT);
    return { avg: Math.round(avg * 10) / 10, count: list.length, isNew: list.length < RULES.NEW_UNTIL };
  }

  /**
   * reports: [{ from, reason, ts }] against one user.
   * 30 reports inside any rolling 24 h window start a 10 h search ban from that 30th report.
   * When the 10 h end, those reports are spent. Another 30 in a later 24 h window starts another 10 h.
   * Returns { level: 1, reports, until, triggeredAt } or null. Ratings never come through here.
   */
  function evaluateReports(reports, now) {
    now = now || Date.now();
    const list = (reports || []).filter((r) => r && r.ts).slice().sort((a, b) => a.ts - b.ts);
    const need = RULES.BAN_REPORTS;
    const windowMs = RULES.BAN_WINDOW_MS;
    const banMs = RULES.BAN_MS;
    let cursor = 0;
    let active = null;
    while (cursor < list.length) {
      let trigger = null;
      for (let i = cursor; i < list.length; i++) {
        const ts = list[i].ts;
        const since = ts - windowMs;
        let count = 0;
        for (let j = cursor; j <= i; j++) if (list[j].ts >= since) count++;
        if (count >= need) { trigger = { ts, reports: count }; break; }
      }
      if (!trigger) break;
      const until = trigger.ts + banMs;
      active = { level: 1, reports: trigger.reports, until, triggeredAt: trigger.ts };
      if (now < until) return active;
      while (cursor < list.length && list[cursor].ts <= trigger.ts) cursor++;
    }
    return null;
  }

  /**
   * Outgoing message filter. @usernames and Telegram links are ordinary text.
   * Other links and phone numbers are still blocked.
   * Returns null if OK, otherwise { kind, message } — message is NOT sent.
   */
  const BLOCKERS = [
    { kind: "link", re: /(https?:\/\/|www\.)\S+|\b[a-z0-9-]{2,}\.(com|ru|net|org|io|me|ua|pl|xyz|app|link|ly|gg|tv|info|site|online|shop|top|cc|co|by|kz|biz|de|eu)\b/i,
      message: "Ссылки в чате запрещены — так защищаемся от скама" },
    { kind: "phone", re: /(\+?\d[\d\s().-]{7,}\d)/,
      message: "Номера телефонов отправлять нельзя" },
  ];
  function checkMessage(text) {
    let t = String(text || "");
    t = t.replace(/(?:https?:\/\/)?(?:t\.me|telegram\.(?:me|dog))\/\S*/gi, " ");
    t = t.replace(/tg:\/\/\S*/gi, " ");
    t = t.replace(/(^|[^a-z0-9_])@[a-z0-9_]{3,}/gi, " ");
    for (const b of BLOCKERS) {
      if (b.kind === "phone") {
        const m = t.match(b.re);
        if (m && m[1].replace(/\D/g, "").length >= 9) return { kind: b.kind, message: b.message };
        continue;
      }
      if (b.re.test(t)) return { kind: b.kind, message: b.message };
    }
    return null;
  }

  const SAFETY_TIPS = [
    "Осторожно со скамом: никто из Cupion не просит деньги или «подтверждение»",
    "Не переходи по подозрительным ссылкам и не отправляй коды из SMS",
    "Не отправляй личные данные, адрес, коды из SMS и пароли",
    "Никогда не переводи деньги людям из чата",
    "Что-то не так? Жалоба и блок — в меню чата, в один тап",
    "Будь собой и уважай собеседника — оценку ставят оба",
  ];

  function canRate(_durSec, mine, theirs) {
    return ((mine | 0) + (theirs | 0)) >= RULES.MIN_RATE_MSGS;
  }

  function dailyLimit(isPremium) { return isPremium ? RULES.PREMIUM_SEARCHES : RULES.FREE_SEARCHES; }

  /** Pause only after a huge recent volume. Rapid skips wait longer; slow real chats often do not. */
  function antiFarm(events, now, isPremium) {
    now = now || Date.now();
    const recent = (events || []).filter((e) => e && now - e.ts < 24 * 3600e3).sort((a, b) => a.ts - b.ts);
    if (recent.length < 200) return null;
    let gapSum = 0;
    for (let i = 1; i < recent.length; i++) gapSum += Math.max(0, recent[i].ts - recent[i - 1].ts);
    const meanGap = recent.length > 1 ? gapSum / (recent.length - 1) : 1e9;
    const short = recent.filter((e) => (e.dur || 0) < 20).length / recent.length;
    if (meanGap >= 150000 && short < 0.35) return null;
    if (meanGap >= 90000 && short < 0.45 && recent.length < 300) return null;
    let minutes = 60;
    if (meanGap < 8000 || short > 0.8) minutes = 120;
    else if (meanGap < 20000 || short > 0.6) minutes = 105;
    else if (meanGap < 45000 || short > 0.4) minutes = 90;
    else if (meanGap < 90000) minutes = 75;
    if (recent.length >= 300) minutes = Math.min(120, minutes + 10);
    if (isPremium) return null;
    return { minutes, until: now + minutes * 60e3, rapid: minutes >= 100 };
  }

  window.HuntyRules = { RULES, checkMessage, SAFETY_TIPS, agePool, canMatchAges, reputation, evaluateReports, canRate, dailyLimit, antiFarm };
})();
