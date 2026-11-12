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
    { id: "t18", name: "Лера", age: 18, gender: "f", city: "Варшава", country: "Польша", premium: false, hue: 0,
      about: "Первый курс, рисую в скетчбуке в метро.",
      interests: ["Искусство", "Музыка", "Кофе"],
      stats: { avg: 8.4, count: 16, avgSec: 220, chats: 20 },
      greet: ["привет!", "хай, ты как?"],
      lines: ["мне 18, только поступила", "в Варшаве люблю Лазенки", "что слушаешь сейчас?", "рисую людей в метро", "ты тоже на первом?"] },
    { id: "t19", name: "Кира", age: 19, gender: "f", city: "Краков", country: "Польша", premium: true, hue: 2,
      about: "Учусь на журналистику и пью слишком много чая.",
      interests: ["Книги", "Чай", "Кино"],
      stats: { avg: 8.6, count: 28, avgSec: 260, chats: 34 },
      greet: ["приветик", "о, привет 👋"],
      lines: ["мне 19, журфак", "в Кракове дождь, как обычно", "какой чай любишь?", "пишу тексты для универа", "расскажи, как прошёл день"] },
    { id: "t20", name: "Алина", age: 20, gender: "f", city: "Киев", country: "Украина", premium: false, hue: 4,
      about: "Танцую и учусь на дизайнера.",
      interests: ["Танцы", "Искусство", "Музыка"],
      stats: { avg: 8.2, count: 21, avgSec: 240, chats: 29 },
      greet: ["привет)", "хай"],
      lines: ["мне 20, дизайн", "сегодня была репетиция", "ты чем занимаешься?", "в Киеве вечер тихий", "какую музыку включить?"] },
    { id: "t21", name: "Полина", age: 21, gender: "f", city: "Гданьск", country: "Польша", premium: false, hue: 6,
      about: "Живу у моря и фотографирую закаты.",
      interests: ["Фото", "Путешествия", "Море"],
      stats: { avg: 8.8, count: 33, avgSec: 300, chats: 41 },
      greet: ["привет 🌊", "добрый вечер"],
      lines: ["мне 21, живу в Гданьске", "сегодня море спокойное", "любишь воду или горы?", "учусь на фотографа", "куда хочешь съездить?"] },
    { id: "t22", name: "Ника", age: 22, gender: "f", city: "Львов", country: "Украина", premium: false, hue: 8,
      about: "Бариста по утрам, сериалы по ночам.",
      interests: ["Кофе", "Сериалы", "Книги"],
      stats: { avg: 8.3, count: 45, avgSec: 280, chats: 52 },
      greet: ["привет!", "хей, как ты?"],
      lines: ["мне 22, варю кофе во Львове", "какой сериал досмотреть?", "ты кофе или чай?", "сегодня смена была длинная", "что тебя радует?"] },
    { id: "t23", name: "Саша", age: 18, gender: "m", city: "Варшава", country: "Польша", premium: false, hue: 1,
      about: "Только поступил, играю в футбол во дворе.",
      interests: ["Спорт", "Мемы", "Игры"],
      stats: { avg: 7.9, count: 12, avgSec: 180, chats: 16 },
      greet: ["йо", "привет"],
      lines: ["мне 18, первый курс", "в Варшаве учусь", "во что играешь?", "после пар сразу на поле", "ты откуда?"] },
    { id: "t24", name: "Марк", age: 19, gender: "m", city: "Краков", country: "Польша", premium: false, hue: 3,
      about: "Снимаю короткие видео и учусь на айти.",
      interests: ["IT", "Фото", "Музыка"],
      stats: { avg: 8.0, count: 18, avgSec: 210, chats: 23 },
      greet: ["хай", "привет 👋"],
      lines: ["мне 19, информатика", "в Кракове учусь", "какой у тебя плейлист?", "снимаю видео для универа", "что делаешь вечером?"] },
    { id: "t25", name: "Денис", age: 20, gender: "m", city: "Киев", country: "Украина", premium: true, hue: 5,
      about: "Бегаю по набережной и читаю фантастику.",
      interests: ["Спорт", "Книги", "Наука"],
      stats: { avg: 8.5, count: 30, avgSec: 250, chats: 36 },
      greet: ["привет", "добрый вечер"],
      lines: ["мне 20, живу в Киеве", "сегодня бегал вдоль реки", "что читаешь?", "учусь на инженера", "ты жаворонок или сова?"] },
    { id: "t26", name: "Глеб", age: 21, gender: "m", city: "Вроцлав", country: "Польша", premium: false, hue: 7,
      about: "Готовлю пасту и спорю о фильмах.",
      interests: ["Еда", "Кино", "Музыка"],
      stats: { avg: 7.7, count: 24, avgSec: 200, chats: 31 },
      greet: ["привет)", "йо, как дела?"],
      lines: ["мне 21, во Вроцлаве", "сегодня варил пасту", "какой фильм советуешь?", "учусь на повара, почти", "что ел сегодня?"] },
    { id: "t27", name: "Степан", age: 22, gender: "m", city: "Познань", country: "Польша", premium: false, hue: 9,
      about: "Катаюсь на велосипеде и учусь на экономиста.",
      interests: ["Спорт", "Путешествия", "Музыка"],
      stats: { avg: 8.1, count: 27, avgSec: 230, chats: 33 },
      greet: ["привет", "ну привет"],
      lines: ["мне 22, в Познани", "каждый день на велике", "ты где живёшь?", "учусь на экономиста", "куда бы поехал прямо сейчас?"] },
  ];

  const KEYWORDS = [
    [/привет|хай|здравствуй|салют|йо\b/i, (p) => pick(["привет-привет)", "ага, привет!", "рад(а) тебя видеть тут".replace("(а)", p.gender === "f" ? "а" : "")])],
    [/как дела|как ты|как настроение/i, () => pick(["норм, вечер спокойный. а у тебя?", "хорошо! только с делами разобрался", "отлично, особенно сейчас 🙂 а ты?"])],
    [/откуда|где живешь|где живёшь|город|страна/i, (p) => `я из ${p.city}${p.country ? ", " + p.country : ""}. а ты?`],
    [/сколько (тебе )?лет|возраст/i, (p) => `${p.age}. а тебе?`],
    [/чем занимаешься|работаешь|учишься/i, (p) => p.about.split(".")[0].toLowerCase() + "."],
    [/музык|слушаешь/i, () => pick(["сейчас в плейлисте много инди и старого рока", "всё подряд, от джаза до фонка", "последнее время Radiohead на повторе"])],
    [/фильм|кино|сериал/i, () => pick(["обожаю Вечное сияние чистого разума", "сейчас смотрю Медведя, очень советую", "лучше всего — старые фильмы Миядзаки"])],
    [/телеграм|инст|номер|контакт/i, () => "давай пока тут поболтаем 🙂"],
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
    t18: "lera_test", t19: "kira_test", t20: "alina_test", t21: "polina_test", t22: "nika_test",
    t23: "sasha_test", t24: "mark_test", t25: "denis_test", t26: "gleb_test", t27: "stepan_test",
  };
  function deriveFlags(avg, count, salt) {
    const n = count | 0;
    const counts = { green: 0, mid: 0, red: 0 };
    if (n <= 0) return { counts, avg: 0 };
    let sum = Math.round(Number(avg) * n);
    sum = Math.max(n, Math.min(10 * n, sum));
    const scores = new Array(n);
    const base = Math.max(1, Math.min(10, Math.round(sum / n)));
    for (let i = 0; i < n; i++) scores[i] = base;
    let cur = base * n;
    let i = 0;
    while (cur < sum) { if (scores[i % n] < 10) { scores[i % n]++; cur++; } i++; }
    i = 0;
    while (cur > sum) { if (scores[i % n] > 1) { scores[i % n]--; cur--; } i++; }
    let rng = (salt + 1) * 9973;
    const next = () => { rng = (Math.imul(rng, 1664525) + 1013904223) >>> 0; return rng; };
    const mean = sum / n;
    const spread = 1 + (salt % 3);
    const lo = Math.max(1, Math.round(mean) - spread);
    const hi = Math.min(10, Math.round(mean) + spread + 1);
    const passes = Math.max(1, Math.round(n * (0.12 + (salt % 5) * 0.06)));
    for (let p = 0; p < passes; p++) {
      const a = next() % n;
      const b = next() % n;
      if (a === b) continue;
      if (scores[a] < hi && scores[b] > lo) { scores[a]++; scores[b]--; }
    }
    for (const sc of scores) {
      if (sc >= 8) counts.green++;
      else if (sc >= 5) counts.mid++;
      else counts.red++;
    }
    return { counts, avg: Math.round((sum / n) * 10) / 10 };
  }
  const PORTRAIT_COLORS = ["#8FA6FF", "#5ED6BA", "#F0A3C2", "#E0B15A", "#7EC8F0", "#C3B1F0", "#F0B08A", "#9BB0C9"];
  function portraitURI(i, salt) {
    const a = PORTRAIT_COLORS[i % PORTRAIT_COLORS.length];
    const b = PORTRAIT_COLORS[(i + 3 + salt) % PORTRAIT_COLORS.length];
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="480"><rect width="360" height="480" fill="${a}"/><circle cx="180" cy="186" r="74" fill="#fff"/><path d="M76 480c10-118 50-168 104-168s94 50 104 168" fill="#fff"/><circle cx="154" cy="176" r="8" fill="${b}"/><circle cx="208" cy="176" r="8" fill="${b}"/></svg>`;
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }
  PROFILES.forEach((p, i) => {
    p.username = HANDLES[p.id];
    p.photos = [portraitURI(i, 0), portraitURI(i, 1)];
    const bag = deriveFlags(p.stats.avg, p.stats.count, i + 3);
    p.flagCounts = bag.counts;
    p.stats.avg = bag.avg;
    const chats = p.stats.chats | 0;
    const frac = 0.28 + ((i * 17) % 5) * 0.07;
    p.stats.matches = chats <= 1 ? 0 : Math.max(1, Math.min(chats - 1, Math.round(chats * frac)));
    if (p.premium) p.maskId = ["cupid", "night", "pearl"][i % 3];
  });

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

    function legalList() {
      const myAge = me && me.age != null ? me.age : 18;
      const seek = me && (me.seeking === "f" || me.seeking === "m") ? me.seeking : "";
      return PROFILES.filter((p) => R.canMatchAges(myAge, p.age) && (!seek || p.gender === seek));
    }

    function candidates(_filters, exclude) {
      const legal = legalList();
      const ex = new Set(exclude || []);
      let list = legal.filter((p) => !blocked.has(p.id) && !ex.has(p.id));
      if (!list.length) list = legal.filter((p) => !blocked.has(p.id));
      if (!list.length) list = legal.slice();
      return list;
    }

    function rankPick(list) {
      if (list.length <= 1) return list[0];
      const myAge = Number(me && me.age) || 18;
      const country = String((me && me.country) || "").trim().toLowerCase();
      const city = String((me && me.city) || "").trim().toLowerCase();
      const scored = list.map((p) => {
        const diff = Math.abs(p.age - myAge);
        let s = diff <= 1 ? 48 : diff <= 2 ? 36 : diff <= 3 ? 24 : diff <= 5 ? 8 : 1;
        if (country && String(p.country || "").toLowerCase() === country) s += 6;
        if (city && String(p.city || "").toLowerCase() === city) s += 4;
        s += Math.random() * 3;
        return { p, s };
      }).sort((a, b) => b.s - a.s);
      const near = scored.filter((x) => Math.abs(x.p.age - myAge) <= 3);
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
      partnerSay(s, first, 1600 + Math.random() * 700);
      armIdle(s);
      return s;
    }

    function partnerSay(s, text, delay) {
      const typingAt = Math.max(250, delay - 700 - text.length * 25);
      s.timers.push(setTimeout(() => { if (s.alive) em.emit("typing", { sessionId: s.id, on: true }); }, typingAt));
      s.timers.push(setTimeout(() => {
        if (!s.alive) return;
        em.emit("typing", { sessionId: s.id, on: false });
        s.theirs++;
        em.emit("message", { sessionId: s.id, from: "them", text, ts: Date.now() });
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

      findMatch({ filters, exclude, fast, preferId, direct } = {}) {
        if (searchCtl) searchCtl.cancel();
        return new Promise((resolve, reject) => {
          let done = false;
          const t = setTimeout(() => {
            done = true; searchCtl = null;
            let preferMiss = false;
            let p = null;
            if (preferId) {
              const hit = legalList().find((x) => x.id === preferId && !blocked.has(x.id));
              if (hit) p = hit;
              else if (direct) return reject({ code: "away" });
              else preferMiss = true;
            }
            if (!p) {
              const list = candidates(filters, exclude);
              if (!list.length) return reject({ code: "empty" });
              p = rankPick(list);
            }
            const s = startSession(p);
            resolve({ sessionId: s.id, partner: publicProfile(p), startedAt: s.startedAt, preferMiss });
          }, direct ? 280 : (fast ? 700 : 1700) + Math.random() * 1500);
          searchCtl = { cancel() { if (!done) { clearTimeout(t); searchCtl = null; reject({ code: "cancelled" }); } } };
        });
      },
      debugPartnerLeft(sessionId) {
        const s = sessions.get(sessionId);
        if (!s || !s.alive) return;
        s.alive = false;
        s.timers.forEach(clearTimeout);
        clearTimeout(s.idleTimer);
        em.emit("partnerLeft", { sessionId: s.id, reason: "skip" });
      },

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
          setTimeout(() => em.emit("ratedByPartner", { sessionId, partnerId: s.partner.id, score, dur }), 1200);
        }
        return { dur, canRate: qualified };
      },

      async rate(sessionId, score, tags) {
        const s = sessions.get(sessionId);
        if (!s) return { accepted: false, reason: "unknown" };
        if (!R.canRate(s.dur || 0, s.mine, s.theirs)) return { accepted: false, reason: "short" };
        if (s.rated) return { accepted: false, reason: "duplicate" };
        s.rated = true;
        const flag = score >= 8 ? "green" : score >= 5 ? "mid" : "red";
        s.partner.flagCounts = s.partner.flagCounts || { green: 0, mid: 0, red: 0 };
        s.partner.flagCounts[flag] = (s.partner.flagCounts[flag] | 0) + 1;
        const st = s.partner.stats;
        if (st) {
          const n0 = st.count | 0;
          const sum0 = Math.round((Number(st.avg) || 0) * n0);
          st.count = n0 + 1;
          st.avg = Math.round(((sum0 + (score | 0)) / st.count) * 10) / 10;
        }
        myRatings.set(s.partner.id, { score });
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
        const days = { three: 3, week: 7, two: 14, month: 30 }[planId] || 7;
        return { ok: true, until: Date.now() + days * 86400e3 };
      },
    };
  }

  window.HuntyMock = { createMockBackend, PROFILES };
})();
