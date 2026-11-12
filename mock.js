/*
 * Hunty — matchmaking / chat ADAPTER (test mode).
 *
 * The UI talks ONLY to the object returned by createMockBackend(). A real backend
 * (WebSocket to Cloudflare Durable Objects / Supabase Realtime, see ARCHITECTURE.md)
 * must implement the same interface, then app.js swaps one line:
 *     const backend = HuntyMock.createMockBackend()   →   createWsBackend({ url, initData })
 *
 * Interface
 * ---------
 *   connect({ initData, me })              → Promise<{ online }>
 *                                            me = { id, name, age, gender, city, interests, premium }
 *   on(event, cb) / off(event, cb)         events:
 *        "online"        { count }
 *        "message"       { sessionId, from: "them", text, ts }
 *        "typing"        { sessionId, on: boolean }
 *        "partnerLeft"   { sessionId, reason }
 *        "ratedByPartner"{ sessionId, partnerId, score, dur }
 *        "contactMatched"{ sessionId, username }
 *   findMatch({ filters, exclude, boost }) → Promise<{ sessionId, partner, startedAt }>
 *                                            rejects { code: "cancelled" | "empty" }
 *                                            Age pools are enforced here (16–17 ↔ 16–17, 18+ ↔ 18+).
 *   cancelSearch()
 *   sendMessage(sessionId, text)           → Promise<{ ts }>
 *   leave(sessionId)                       → Promise<{ dur, canRate }>
 *   rate(sessionId, score, tags)           → Promise<{ accepted, reason? }>
 *   report(partnerId, reason, sessionId?)  → Promise<{ ok, urgent }>
 *   block(partnerId)                       → Promise<{ ok }>
 *   requestContact(sessionId)              → Promise<{ status: "waiting" }>
 *   getProfile(partnerId)                  → partner public profile (incl. stats)
 *   purchasePremium(planId)                → Promise<{ ok, until }>  (real: Stars invoice)
 *
 * Everything below is fake: 14 test profiles with scripted replies.
 */
(function () {
  const R = window.HuntyRules;

  class Emitter {
    constructor() { this.h = {}; }
    on(e, cb) { (this.h[e] = this.h[e] || []).push(cb); }
    off(e, cb) { this.h[e] = (this.h[e] || []).filter((x) => x !== cb); }
    emit(e, d) { (this.h[e] || []).forEach((cb) => { try { cb(d); } catch (err) { console.error(err); } }); }
  }

  const PROFILES = [
    { id: "t01", name: "Аня", age: 22, gender: "f", city: "Краков", country: "Польша", premium: true, hue: 0,
      about: "Учусь на дизайнера, коллекционирую плохие фильмы и хорошие кофейни.",
      interests: ["Кино", "Искусство", "Кофе", "Путешествия"],
      stats: { avg: 8.7, count: 124, avgSec: 372, chats: 168 },
      greet: ["привет 👋", "привееет, как вечер?"],
      lines: ["я в Кракове, тут сейчас дождь и уютно", "сегодня пересматривала Твин Пикс, ты смотрел?", "а ты чем занимаешься?", "люблю гулять по старому городу ночью", "какой фильм ты бы посоветовал?"] },
    { id: "t02", name: "Макс", age: 25, gender: "m", city: "Варшава", country: "Польша", premium: false, hue: 1,
      about: "Бэкенд-разработчик. Бегаю по утрам, по вечерам — настолки.",
      interests: ["IT", "Спорт", "Игры", "Мемы"],
      stats: { avg: 7.9, count: 61, avgSec: 254, chats: 90 },
      greet: ["хай", "йо, привет"],
      lines: ["я из Варшавы, а ты откуда?", "сегодня пробежал 10 км, горжусь собой 😅", "играешь во что-нибудь?", "работаю программистом, иногда даже нравится", "какой у тебя любимый мем этого года?"] },
    { id: "t03", name: "Оля", age: 24, gender: "f", city: "Киев", country: "Украина", premium: false, hue: 2,
      about: "Фотографирую людей и котов. Чаще котов.",
      interests: ["Фото", "Животные", "Музыка", "Книги"],
      stats: { avg: 9.1, count: 88, avgSec: 455, chats: 103 },
      greet: ["привет!", "приветик, рада знакомству"],
      lines: ["я фотограф, сейчас как раз разбираю съёмку", "у меня два кота, Борщ и Пончик", "что слушаешь последнее время?", "в Киеве уже совсем осень", "а у тебя есть животные?"] },
    { id: "t04", name: "Даня", age: 27, gender: "m", city: "Львов", country: "Украина", premium: true, hue: 3,
      about: "Варю кофе и спорю о музыке. Не люблю «как дела?» — спроси что-нибудь странное.",
      interests: ["Музыка", "Кофе", "Психология", "Путешествия"],
      stats: { avg: 8.3, count: 212, avgSec: 318, chats: 260 },
      greet: ["о, привет", "салют. задай странный вопрос"],
      lines: ["я бариста во Львове, если что", "лучший альбом всех времён — спорный вопрос, но у меня есть ответ", "если бы мог жить в любом городе, где бы жил?", "ненавижу растворимый кофе, это личное", "что тебя сегодня порадовало?"] },
    { id: "t05", name: "Катя", age: 21, gender: "f", city: "Вроцлав", country: "Польша", premium: false, hue: 4,
      about: "Учу польский и испанский. Танцую, когда никто не видит.",
      interests: ["Языки", "Танцы", "Сериалы", "Еда"],
      stats: { avg: 6.8, count: 3, avgSec: 140, chats: 7 },
      greet: ["привет)", "хэй, ты тут?"],
      lines: ["я недавно здесь, первый раз пробую", "учу испанский, hola 😄", "какой сериал сейчас смотришь?", "во Вроцлаве классно, много гномиков на улицах", "ты знаешь какие-нибудь языки?"] },
    { id: "t06", name: "Артём", age: 23, gender: "m", city: "Гданьск", country: "Польша", premium: false, hue: 5,
      about: "Студент, люблю море и длинные разговоры ни о чём.",
      interests: ["Путешествия", "Наука", "Книги", "Фото"],
      stats: { avg: 8.0, count: 47, avgSec: 401, chats: 64 },
      greet: ["привет", "добрый вечер 🌊"],
      lines: ["живу у моря в Гданьске", "сейчас читаю про космос, залип", "ты сова или жаворонок?", "учусь на инженера", "куда мечтаешь поехать?"] },
    { id: "t07", name: "Лиза", age: 26, gender: "f", city: "Познань", country: "Польша", premium: true, hue: 6,
      about: "Психолог. Не буду тебя анализировать. Наверное 🙂",
      interests: ["Психология", "Книги", "Йога", "Кино"],
      stats: { avg: 9.4, count: 301, avgSec: 520, chats: 330 },
      greet: ["привет! как настроение?", "здравствуй 🙂"],
      lines: ["я психолог, но тут просто болтаю", "что для тебя хороший разговор?", "в Познани сегодня солнечно", "последняя книга, которая тебя зацепила?", "ты чаще слушаешь или рассказываешь?"] },
    { id: "t08", name: "Илья", age: 29, gender: "m", city: "Одесса", country: "Украина", premium: false, hue: 7,
      about: "Готовлю лучше, чем шучу. Шучу тоже неплохо.",
      interests: ["Еда", "Мемы", "Авто", "Музыка"],
      stats: { avg: 7.4, count: 39, avgSec: 210, chats: 58 },
      greet: ["приветствую", "о, живой человек!"],
      lines: ["я из Одессы, тут всё с юмором", "сегодня приготовил пасту карбонару, без сливок, честно", "что ты любишь есть?", "работаю логистом", "расскажи что-нибудь смешное"] },
    { id: "t09", name: "Маша", age: 20, gender: "f", city: "Харьков", country: "Украина", premium: false, hue: 8,
      about: "Рисую, смотрю аниме, пью чай литрами.",
      interests: ["Аниме", "Искусство", "Игры", "Чай"],
      stats: { avg: 8.5, count: 26, avgSec: 296, chats: 33 },
      greet: ["привет-привет", "хай ✨"],
      lines: ["я рисую иллюстрации", "любимое аниме — Ходячий замок, без вариантов", "ты что-нибудь рисуешь?", "чай или кофе?", "сейчас учусь в универе"] },
    { id: "t10", name: "Тимур", age: 24, gender: "m", city: "Вильнюс", country: "Литва", premium: false, hue: 9,
      about: "Фотограф-любитель и велосипедист. Ищу людей с хорошими историями.",
      interests: ["Спорт", "Фото", "Путешествия", "Музыка"],
      stats: { avg: 8.1, count: 74, avgSec: 333, chats: 95 },
      greet: ["привет", "ну привет 👋"],
      lines: ["я в Вильнюсе, тут красиво", "катаюсь на велике каждый день", "какая у тебя самая крутая поездка?", "работаю в маркетинге", "что слушаешь?"] },
    // 16–17 pool (only matched with 16–17)
    { id: "t11", name: "Соня", age: 17, gender: "f", city: "Прага", country: "Чехия", premium: false, hue: 2,
      about: "Школа, гитара, сериалы. В этом порядке, но не всегда.",
      interests: ["Музыка", "Сериалы", "Языки", "Книги"],
      stats: { avg: 8.2, count: 19, avgSec: 280, chats: 24 },
      greet: ["привет!", "хай, как дела?"],
      lines: ["учусь в последнем классе", "играю на гитаре, пока только аккорды", "какую музыку слушаешь?", "готовлюсь к экзаменам, спасай", "в Праге сейчас очень красиво"] },
    { id: "t12", name: "Миша", age: 16, gender: "m", city: "Брно", country: "Чехия", premium: false, hue: 5,
      about: "Футбол и Minecraft. Могу объяснить редстоун.",
      interests: ["Игры", "Спорт", "IT", "Мемы"],
      stats: { avg: 7.7, count: 11, avgSec: 190, chats: 15 },
      greet: ["йо", "привет"],
      lines: ["играю за школьную команду", "строю в майнкрафте город", "во что играешь?", "хочу стать программистом", "какой у тебя любимый предмет?"] },
    { id: "t13", name: "Вика", age: 17, gender: "f", city: "Рига", country: "Латвия", premium: false, hue: 6,
      about: "Танцую и снимаю короткие видео про котов.",
      interests: ["Танцы", "Животные", "Фото", "Музыка"],
      stats: { avg: 8.9, count: 9, avgSec: 310, chats: 12 },
      greet: ["приветик", "хэй 👋"],
      lines: ["хожу на танцы три раза в неделю", "у меня кошка Муся", "что делаешь на выходных?", "в Риге холодно уже", "какие у тебя хобби?"] },
    { id: "t15", name: "Настя", age: 18, gender: "f", city: "Варшава", country: "Польша", premium: false, hue: 4,
      about: "Только закончила школу. Слушаю музыку и гуляю по центру.",
      interests: ["Музыка", "Фото", "Сериалы"],
      stats: { avg: 8.1, count: 14, avgSec: 210, chats: 18 },
      greet: ["привет!", "хай"],
      lines: ["мне 18, учусь на первом", "в Варшаве сейчас тепло", "какой у тебя плейлист?", "люблю гулять вечером", "ты тоже недавно закончил школу?"] },
    { id: "t16", name: "Егор", age: 19, gender: "m", city: "Краков", country: "Польша", premium: false, hue: 1,
      about: "Универ, футбол, мемы. Не люблю долгие паузы.",
      interests: ["Спорт", "Мемы", "IT"],
      stats: { avg: 7.8, count: 22, avgSec: 190, chats: 27 },
      greet: ["йо", "привет"],
      lines: ["мне 19, первый курс", "играю в футбол по выходным", "ты откуда?", "в Кракове дождь", "какой фильм последний смотрел?"] },
    { id: "t17", name: "Олег", age: 36, gender: "m", city: "Вроцлав", country: "Польша", premium: false, hue: 7,
      about: "Работаю, готовлю, иногда путешествую.",
      interests: ["Еда", "Путешествия", "Музыка"],
      stats: { avg: 8.0, count: 40, avgSec: 260, chats: 52 },
      greet: ["добрый вечер", "привет"],
      lines: ["я во Вроцлаве", "сегодня готовил ужин", "ты чем занимаешься?", "люблю спокойные разговоры", "куда ездил в последний раз?"] },
    { id: "t14", name: "Рома", age: 16, gender: "m", city: "Таллин", country: "Эстония", premium: false, hue: 9,
      about: "Собираю компы и читаю фантастику.",
      interests: ["IT", "Книги", "Наука", "Игры"],
      stats: { avg: 7.2, count: 4, avgSec: 160, chats: 6 },
      greet: ["привет", "о, привет"],
      lines: ["собрал себе комп сам", "читаю Азимова сейчас", "что читаешь?", "в Таллине школа начинается рано, жесть", "любишь научную фантастику?"] },
  ];

  const KEYWORDS = [
    [/привет|хай|здравствуй|салют|йо\b/i, (p) => pick(["привет-привет)", "ага, привет!", "рад(а) тебя видеть тут".replace("(а)", p.gender === "f" ? "а" : "")])],
    [/как дела|как ты|как настроение/i, () => pick(["норм, вечер спокойный. а у тебя?", "хорошо! только с делами разобрался", "отлично, особенно сейчас 🙂 а ты?"])],
    [/откуда|где живешь|где живёшь|город|страна/i, (p) => `я из ${p.city}${p.country ? ", " + p.country : ""}. а ты?`],
    [/сколько (тебе )?лет|возраст/i, (p) => `${p.age}. а тебе?`],
    [/чем занимаешься|работаешь|учишься/i, (p) => p.about.split(".")[0].toLowerCase() + "."],
    [/музык|слушаешь/i, () => pick(["сейчас в плейлисте много инди и старого рока", "всё подряд, от джаза до фонка", "последнее время Radiohead на повторе"])],
    [/фильм|кино|сериал/i, () => pick(["обожаю Вечное сияние чистого разума", "сейчас смотрю Медведя, очень советую", "лучше всего — старые фильмы Миядзаки"])],
    [/телеграм|инст|номер|контакт/i, () => "давай пока тут поболтаем 🙂 контактами можно обменяться только кнопкой"],
    [/\?$/, () => pick(["хм, хороший вопрос", "дай подумать... скорее да, чем нет", "сложно сказать, а ты как думаешь?"])],
  ];

  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function uid() { return Math.random().toString(36).slice(2, 10); }
  function wait(ms) { return new Promise((r) => setTimeout(r, ms)); }
  const HANDLES = {
    t01: "anya_test", t02: "max_test", t03: "olya_test", t04: "danya_test", t05: "katya_test",
    t06: "artem_test", t07: "liza_test", t08: "ilya_test", t09: "masha_test", t10: "timur_test",
    t11: "sonya_test", t12: "misha_test", t13: "vika_test", t14: "roma_test",
    t15: "nastya_test", t16: "egor_test", t17: "oleg_test",
  };
  PROFILES.forEach((p) => { p.username = HANDLES[p.id]; });

  function publicProfile(p) {
    if (!p) return null;
    const { greet, lines, username, ...pub } = p;
    return JSON.parse(JSON.stringify(pub));
  }

  function createMockBackend(opts) {
    opts = opts || {};
    const em = new Emitter();
    const sessions = new Map();
    let me = null;
    let online = 1480 + Math.floor(Math.random() * 300);
    let searchCtl = null;
    const partnerRatings = new Map(); // partnerId → score they gave me (last)
    const myRatings = new Map();      // partnerId → score I gave them
    const blocked = new Set(opts.blocked || []);

    setInterval(() => {
      online = Math.max(900, online + Math.round((Math.random() - 0.48) * 40));
      em.emit("online", { count: online });
    }, 4000);

    function poolOf(age) { return R.agePool(age); }

    function candidates(filters, exclude) {
      const myAge = me && me.age != null ? me.age : 18;
      let list = PROFILES.filter((p) => R.canMatchAges(myAge, p.age) && !blocked.has(p.id) && !(exclude || []).includes(p.id));
      const seek = me && (me.seeking === "f" || me.seeking === "m") ? me.seeking : "";
      if (seek) list = list.filter((p) => p.gender === seek);
      if (filters) {
        if (filters.gender && filters.gender !== "any") list = list.filter((p) => p.gender === filters.gender);
        if (filters.ageMin) list = list.filter((p) => p.age >= filters.ageMin);
        if (filters.ageMax) list = list.filter((p) => p.age <= filters.ageMax);
        if (filters.city) list = list.filter((p) => p.city.toLowerCase().includes(String(filters.city).toLowerCase()));
      }
      return list;
    }

    function rankPick(list) {
      if (list.length <= 1) return list[0];
      const myAge = Number(me && me.age) || 18;
      const country = String((me && me.country) || "").trim().toLowerCase();
      const city = String((me && me.city) || "").trim().toLowerCase();
      const scored = list.map((p) => {
        const diff = Math.abs(p.age - myAge);
        let s = diff <= 1 ? 48 : diff <= 2 ? 34 : diff <= 4 ? 10 : 1;
        if (country && String(p.country || "").toLowerCase() === country) s += 6;
        if (city && String(p.city || "").toLowerCase() === city) s += 4;
        s += Math.random() * 3;
        return { p, s };
      }).sort((a, b) => b.s - a.s);
      const near = scored.filter((x) => Math.abs(x.p.age - myAge) <= 2);
      const bag = near.length && Math.random() < 0.85 ? near : scored;
      const total = bag.reduce((sum, x) => sum + x.s, 0);
      let roll = Math.random() * total;
      for (const x of bag) {
        roll -= x.s;
        if (roll <= 0) return x.p;
      }
      return bag[bag.length - 1].p;
    }

    function startSession(p) {
      const s = { id: "s_" + uid(), partner: p, startedAt: Date.now(), mine: 0, theirs: 0, lineIdx: 0, alive: true, timers: [], idleTimer: null, contact: null };
      sessions.set(s.id, s);
      const first = pick(p.greet);
      if (Math.random() < 0.65) partnerSay(s, first, 900 + Math.random() * 900);
      armIdle(s);
      return s;
    }

    const BOT_PHOTO = "data:image/svg+xml;charset=utf-8," + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#9FD0FF"/><circle cx="188" cy="40" r="16" fill="#FFE08A"/><path d="M0 112 L78 68 L128 98 L176 58 L240 118 V160 H0Z" fill="#7DA63A"/></svg>');

    function partnerSay(s, text, delay) {
      const typingAt = Math.max(250, delay - 700 - text.length * 25);
      s.timers.push(setTimeout(() => { if (s.alive) em.emit("typing", { sessionId: s.id, on: true }); }, typingAt));
      s.timers.push(setTimeout(() => {
        if (!s.alive) return;
        em.emit("typing", { sessionId: s.id, on: false });
        s.theirs++;
        em.emit("message", { sessionId: s.id, from: "them", text, ts: Date.now() });
        if (Math.random() < 0.4) {
          s.theirs++;
          em.emit("message", { sessionId: s.id, from: "them", photo: BOT_PHOTO, ts: Date.now() });
        }
      }, delay + text.length * 30));
    }

    function armIdle(s) {
      clearTimeout(s.idleTimer);
      // if you go silent, partner nudges once, then leaves
      s.idleTimer = setTimeout(() => {
        if (!s.alive) return;
        partnerSay(s, pick(["ты тут?", "алло 🙂", "эй, ты где?"]), 500);
        s.idleTimer = setTimeout(() => {
          if (!s.alive) return;
          s.alive = false;
          em.emit("partnerLeft", { sessionId: s.id, reason: "idle" });
        }, 40000);
      }, 50000);
    }

    function replyTo(s, text) {
      const p = s.partner;
      let out = null;
      for (const [re, fn] of KEYWORDS) if (re.test(text)) { out = fn(p); break; }
      if (!out || Math.random() < 0.3) out = p.lines[s.lineIdx++ % p.lines.length];
      partnerSay(s, out, 1000 + Math.random() * 1600);
      if (Math.random() < 0.3) partnerSay(s, p.lines[s.lineIdx++ % p.lines.length], 4200 + Math.random() * 2000);
    }

    return {
      on: (e, cb) => em.on(e, cb),
      off: (e, cb) => em.off(e, cb),
      mode: "test",

      async connect({ me: profile }) {
        me = profile;
        await wait(150);
        return { online };
      },
      updateMe(profile) { me = profile; },

      findMatch({ filters, exclude, boost } = {}) {
        if (searchCtl) searchCtl.cancel();
        return new Promise((resolve, reject) => {
          let done = false;
          const t = setTimeout(() => {
            done = true; searchCtl = null;
            let list = candidates(filters, exclude);
            if (!list.length && filters) list = []; // filtered empty → tell UI
            if (!list.length) return reject({ code: "empty" });
            const p = rankPick(list);
            const s = startSession(p);
            resolve({ sessionId: s.id, partner: publicProfile(p), startedAt: s.startedAt });
          }, (boost ? 900 : 1700) + Math.random() * 1500);
          searchCtl = { cancel() { if (!done) { clearTimeout(t); searchCtl = null; reject({ code: "cancelled" }); } } };
        });
      },
      cancelSearch() { if (searchCtl) searchCtl.cancel(); },

      async sendPhoto(sessionId) {
        const s = sessions.get(sessionId);
        if (!s || !s.alive) throw { code: "closed" };
        s.mine++;
        armIdle(s);
        return { ts: Date.now() };
      },

      async sendMessage(sessionId, text) {
        const s = sessions.get(sessionId);
        if (!s || !s.alive) throw { code: "closed" };
        s.mine++;
        armIdle(s);
        replyTo(s, text);
        return { ts: Date.now() };
      },

      async leave(sessionId) {
        const s = sessions.get(sessionId);
        if (!s) return { dur: 0, canRate: false };
        s.alive = false;
        s.timers.forEach(clearTimeout);
        clearTimeout(s.idleTimer);
        const dur = Math.round((Date.now() - s.startedAt) / 1000);
        s.dur = dur;
        const qualified = R.canRate(dur, s.mine, s.theirs);
        if (qualified) {
          const score = Math.max(1, Math.min(10, Math.round(6 + Math.min(3.5, s.mine * 0.5) + (Math.random() * 2 - 1))));
          partnerRatings.set(s.partner.id, score);
          const allTags = ["Интересно", "Смешно", "Вежливо", "Глубоко", "Скучно", "Грубо"];
          const tags = allTags.filter(() => Math.random() < 0.4).slice(0, 2);
          setTimeout(() => em.emit("ratedByPartner", { sessionId, partnerId: s.partner.id, score, dur, tags }), 1200);
        }
        return { dur, canRate: qualified };
      },

      async rate(sessionId, score, tags) {
        const s = sessions.get(sessionId);
        if (!s) return { accepted: false, reason: "unknown" };
        if (!R.canRate(s.dur || 0, s.mine, s.theirs)) return { accepted: false, reason: "short" };
        if (s.rated) return { accepted: false, reason: "duplicate" };
        s.rated = true;
        myRatings.set(s.partner.id, { score, tags: tags || [] });
        return { accepted: true };
      },

      async report(partnerId, reason) {
        await wait(300);
        return { ok: true, urgent: reason === "minor" };
      },
      async block(partnerId) { blocked.add(partnerId); return { ok: true }; },

      async requestContact(sessionId) {
        const s = sessions.get(sessionId);
        if (!s || !s.alive) throw { code: "closed" };
        if (s.contact === "matched") return { status: "matched", username: s.partner.username };
        s.contact = "waiting";
        if (!s.contactTimer && Math.random() < 0.65) {
          s.contactTimer = setTimeout(() => {
            if (!s.alive || s.contact !== "waiting") return;
            s.contact = "matched";
            em.emit("contactMatched", { sessionId: s.id, username: s.partner.username });
          }, 1400 + Math.random() * 1800);
        }
        return { status: "waiting" };
      },

      getProfile(partnerId) { return publicProfile(PROFILES.find((x) => x.id === partnerId)); },
      // test helper: pretend the session started `sec` seconds earlier (QA / screenshots)
      _shiftSession(sessionId, sec) { const s = sessions.get(sessionId); if (s) s.startedAt -= sec * 1000; },
      // test helper: knows whether the partner rated me high (server knows this)
      _partnerScore(partnerId) { return partnerRatings.get(partnerId); },

      async purchasePremium(planId) {
        await wait(1200);
        const days = planId === "month" ? 30 : 7;
        return { ok: true, until: Date.now() + days * 86400e3 };
      },
    };
  }

  window.HuntyMock = { createMockBackend, PROFILES };
})();
