/*
 * Hunty — shared product rules (reputation, reports, limits, age pools).
 * Pure functions, no DOM. The same logic is meant to run on the server later
 * (see ARCHITECTURE.md); the client copy is only for display / the test mode.
 */
(function () {
  const RULES = {
    MIN_AGE: 16,
    ADULT_AGE: 18,
    MIN_RATE_SEC: 30,          // rating needs at least 30 s
    MIN_RATE_MSGS: 3,          // and at least 3 messages from each person
    NEW_UNTIL: 5,              // show "Новый" until 5 counted ratings
    PRIOR_MEAN: 7.2,           // Bayesian prior — damps tiny samples
    PRIOR_WEIGHT: 4,
    OUTLIER_DEV: 3.5,          // ratings this far from the median get damped
    OUTLIER_WEIGHT: 0.35,
    FREE_SEARCHES: 30,
    PREMIUM_SEARCHES: 300,
    // Soft-ban is driven ONLY by reports from unique users, never by low ratings.
    BAN_LEVELS: [
      { reports: 3, windowH: 24, banMin: 60 },
      { reports: 6, windowH: 24, banMin: 24 * 60 },
      { reports: 10, windowH: 72, banMin: 7 * 24 * 60 },
    ],
    REPORT_REASONS: [
      { id: "spam", label: "Спам или реклама" },
      { id: "insult", label: "Оскорбления" },
      { id: "nsfw", label: "Контент 18+" },
      { id: "minor", label: "Несовершеннолетний среди 18+" },
      { id: "scam", label: "Мошенничество" },
      { id: "other", label: "Другое" },
    ],
  };

  /** Age pool: 16–17 → "teen", 18+ → "adult". Pools never mix. */
  function agePool(age) {
    return Number(age) >= RULES.ADULT_AGE ? "adult" : "teen";
  }

  function median(xs) {
    const s = [...xs].sort((a, b) => a - b);
    const m = s.length >> 1;
    return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
  }

  /**
   * ratings: [{ from, score (1..10), dur (sec), ts, raterTrust? (0..1) }]
   * - only chats ≥ 30 s count (message minimum is enforced when the rating is accepted)
   * - one rating per pair (latest wins)
   * - weight grows with conversation length and rater trust
   * - outliers vs median are damped, Bayesian prior pulls small samples to the mean
   */
  function reputation(ratings) {
    const byFrom = new Map();
    for (const r of ratings || []) {
      if (!r || r.dur < RULES.MIN_RATE_SEC) continue;
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
   * reports: [{ from, reason, ts }] against one user. Counts unique reporters inside
   * each level's window. Returns { level, until } or null.
   */
  function evaluateReports(reports, now) {
    now = now || Date.now();
    let hit = null;
    RULES.BAN_LEVELS.forEach((lvl, i) => {
      const since = now - lvl.windowH * 3600e3;
      const uniq = new Set();
      for (const r of reports || []) {
        if (r.ts >= since) uniq.add(r.from);
      }
      if (uniq.size >= lvl.reports) hit = { level: i + 1, minutes: lvl.banMin, reports: uniq.size };
    });
    if (!hit) return null;
    const last = Math.max(...reports.map((r) => r.ts));
    return { level: hit.level, reports: hit.reports, until: last + hit.minutes * 60e3 };
  }

  /**
   * Outgoing message filter: links, @usernames, phone numbers, Telegram invites.
   * Returns null if OK, otherwise { kind, message } — message is NOT sent.
   * The server must run the same check (client copy can be bypassed).
   */
  const BLOCKERS = [
    { kind: "invite", re: /(t\.me|telegram\.(me|dog)|tg:\/\/)\S*|joinchat|\+[a-z0-9_-]{10,}/i,
      message: "Ссылки-приглашения в Telegram запрещены" },
    { kind: "link", re: /(https?:\/\/|www\.)\S+|\b[a-z0-9-]{2,}\.(com|ru|net|org|io|me|ua|pl|xyz|app|link|ly|gg|tv|info|site|online|shop|top|cc|co|by|kz|biz|de|eu)\b/i,
      message: "Ссылки в чате запрещены — так защищаемся от скама" },
    { kind: "username", re: /(^|[^a-z0-9_])@[a-z0-9_]{4,}/i,
      message: "Нельзя отправлять @юзернеймы. Обменяться контактами можно только взаимной кнопкой" },
    { kind: "phone", re: /(\+?\d[\d\s().-]{7,}\d)/,
      message: "Номера телефонов отправлять нельзя" },
  ];
  function checkMessage(text) {
    const t = String(text || "");
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
    "Осторожно со скамом: никто в чате не просит деньги или «подтверждение»",
    "Не переходи по чужим ссылкам — в чате они и так заблокированы",
    "Не отправляй личные данные, адрес, коды из SMS и пароли",
    "Никогда не переводи деньги людям из чата",
    "Что-то не так? Жалоба и блок — в меню чата, в один тап",
    "Будь собой и уважай собеседника — оценку ставят оба",
  ];

  /** Rating is offered only after 30 s and at least 3 messages from each side. */
  function canRate(durSec, mine, theirs) {
    return durSec >= RULES.MIN_RATE_SEC && (mine | 0) >= RULES.MIN_RATE_MSGS && (theirs | 0) >= RULES.MIN_RATE_MSGS;
  }

  function dailyLimit(isPremium) { return isPremium ? RULES.PREMIUM_SEARCHES : RULES.FREE_SEARCHES; }

  window.HuntyRules = { RULES, checkMessage, SAFETY_TIPS, agePool, reputation, evaluateReports, canRate, dailyLimit };
})();
