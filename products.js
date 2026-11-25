/* Товари каталогу. Змініть назви, ціни й описи на свої; price: null = «Ціна за запитом».
   Щоб показати своє фото, додайте поле image: 'шлях/до/фото.jpg' */
(() => {
  const X = 'xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"';
  const icons = {
    panel: `<svg ${X}><path d="M32 10h48l-14 82H18z" fill="#2a2f38" stroke="#8d97a0" stroke-width="2"/><path d="M27 36l52-1M22 63l52-1M49 10L36 92M65 10L52 92" stroke="#6d7782" stroke-width="1.2"/></svg>`,
    inverter: `<svg ${X}><rect x="14" y="26" width="72" height="48" rx="6" fill="#fff" stroke="#b9c1c8" stroke-width="2"/><rect x="38" y="44" width="24" height="9" rx="4.5" fill="#1d2129"/><rect x="14" y="66" width="72" height="8" rx="3" fill="#dfe4e8"/></svg>`,
    battery: `<svg ${X}><rect x="8" y="32" width="84" height="36" rx="4" fill="#5b636c"/><rect x="14" y="39" width="72" height="6" rx="2" fill="#2a2f38"/><circle cx="22" cy="58" r="3" fill="#f5c400"/><rect x="34" y="55" width="46" height="5" rx="2" fill="#2a2f38"/></svg>`,
    bess: `<svg ${X}><rect x="24" y="8" width="52" height="84" rx="5" fill="#e9edf0" stroke="#b9c1c8" stroke-width="2"/><rect x="31" y="16" width="38" height="14" rx="2" fill="#2a2f38"/><path d="M31 42h38M31 52h38M31 62h38M31 72h38" stroke="#b9c1c8" stroke-width="2"/><circle cx="62" cy="23" r="2.5" fill="#7bd36b"/></svg>`,
    mount: `<svg ${X}><path d="M10 70L50 30l40 40" fill="none" stroke="#6d7782" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/><path d="M22 58l8 12M78 58l-8 12M50 30v40" stroke="#9aa3ab" stroke-width="4" stroke-linecap="round"/><rect x="8" y="72" width="84" height="6" rx="3" fill="#2a2f38"/></svg>`,
    other: `<svg ${X}><path d="M50 14l34 18v36L50 86 16 68V32z" fill="#e9edf0" stroke="#8d97a0" stroke-width="2" stroke-linejoin="round"/><path d="M16 32l34 18 34-18M50 50v36" fill="none" stroke="#8d97a0" stroke-width="2"/></svg>`,
    kit: `<svg ${X}><path d="M10 54l22-30h30l-14 44H10z" fill="#2a2f38" stroke="#8d97a0" stroke-width="2"/><rect x="62" y="34" width="28" height="42" rx="4" fill="#fff" stroke="#b9c1c8" stroke-width="2"/><circle cx="76" cy="46" r="3" fill="#f5c400"/><rect x="68" y="56" width="16" height="3" rx="1.5" fill="#c3cad0"/></svg>`
  };
  const L = { panels: 'Сонячні панелі', inverters: 'Інвертори', batteries: 'Акумулятори', bess: 'BESS та резерв', mounting: 'Кріплення', kits: 'Комплекти СЕС' };
  const I = { panels: 'panel', inverters: 'inverter', batteries: 'battery', bess: 'bess', mounting: 'mount', kits: 'kit' };
  const D = {
    panels: 'Фотоелектрична панель для домашніх і комерційних станцій. Кількість і конфігурацію підберемо під ваш об’єкт.',
    inverters: 'Інвертор для керування енергією сонячної станції. Модель і потужність підберемо під ваші задачі.',
    batteries: 'Акумуляторне рішення для резервного живлення та автономної роботи. Масштабується паралельним підключенням.',
    bess: 'Система накопичення енергії для об’єктів різного масштабу. Конфігурація розраховується індивідуально.',
    mounting: 'Елементи для надійного монтажу сонячних модулів і комплектуючі до СЕС.',
    kits: 'Готова комплектація сонячної електростанції. Склад і умови уточнюємо після консультації.'
  };
  // P(id, категорія, назва, ціна|null, {hit, short, desc, specs, options})
  const P = (id, category, name, price, o = {}) => ({
    id, category, name, price, categoryLabel: L[category], icon: I[category], hit: !!o.hit,
    short: o.short || '', options: o.options, desc: o.desc || D[category],
    specs: o.specs || [['Категорія', L[category]], ['Гарантія', 'За умовами виробника']]
  });
  const products = [
    P('panel-450', 'panels', 'Сонячна панель 450 Вт монокристалічна', 3500, { hit: true, short: 'Для приватних і комерційних СЕС.', options: { label: 'Колір рами', values: ['Чорний', 'Сріблястий'] }, specs: [['Потужність', '450 Вт'], ['Тип', 'Монокристалічна'], ['Кількість комірок', '108 (півкомірки)'], ['Гарантія', 'За умовами виробника']] }),
    P('panel-430', 'panels', 'Сонячна панель 430 Вт двостороння Full Black', 3200, { short: 'Двоскляна, чорна рама.' }),
    P('panel-500', 'panels', 'Сонячна панель 500 Вт N-Type двостороння', 3900, { hit: true, short: 'Висока ефективність N-Type.' }),
    P('panel-550', 'panels', 'Сонячна панель 550 Вт для комерційних об’єктів', 4300, { short: 'Для великих дахових станцій.' }),
    P('inv-3', 'inverters', 'Гібридний інвертор 3 кВт', 21500, { short: 'Для невеликих будинків.' }),
    P('inverter-hybrid-5', 'inverters', 'Гібридний інвертор 5 кВт', 28000, { hit: true, short: 'Робота з акумуляторами та мережею.', options: { label: 'Потужність', values: ['3 кВт', '5 кВт', '8 кВт'] }, desc: 'Гібридний інвертор для систем з накопичувачем енергії: керує панелями, акумуляторами та мережею, забезпечуючи резервне живлення.', specs: [['Тип', 'Гібридний'], ['Номінальна потужність', '5 кВт'], ['Фази', 'Однофазний'], ['Гарантія', 'За умовами виробника']] }),
    P('inv-8', 'inverters', 'Гібридний інвертор 8 кВт', 41000, { short: 'Для великих будинків.' }),
    P('inv-grid-10', 'inverters', 'Мережевий інвертор 10 кВт', 32000, { short: 'Для продажу надлишків у мережу.' }),
    P('inv-12', 'inverters', 'Трифазний гібридний інвертор 12 кВт', 64000, { short: 'Для будинків і малого бізнесу.' }),
    P('bat-2', 'batteries', 'Акумуляторний модуль LiFePO4 2,4 кВт·год', 31000, { short: 'Компактний модуль.' }),
    P('battery-5', 'batteries', 'Акумулятор LiFePO4 5 кВт·год', 62000, { hit: true, short: 'Резерв та автономна робота.', specs: [['Хімія', 'LiFePO4'], ['Ємність', '5 кВт·год'], ['Монтаж', 'Стійка / настінний'], ['Гарантія', 'За умовами виробника']] }),
    P('bat-10', 'batteries', 'Акумулятор LiFePO4 10 кВт·год', 118000, { short: 'Для автономних систем.' }),
    P('bess-15', 'bess', 'Домашній BESS 15 кВт·год', 145000, { short: 'Все в одному корпусі.' }),
    P('bess-cabinet', 'bess', 'Система зберігання енергії BESS 30 кВт·год', null, { short: 'Для об’єктів різного масштабу.' }),
    P('bess-100', 'bess', 'Комерційний BESS 100 кВт·год', null, { short: 'Для бізнесу й промисловості.' }),
    P('cable-4', 'mounting', 'Кабель Solar 4 мм² (за метр)', 38, { short: 'Подвійна ізоляція, UV-стійкий.' }),
    P('mount-roof', 'mounting', 'Комплект кріплення для панелі', 450, { short: 'Конструкції та комплектуючі.', options: { label: 'Тип даху', values: ['Скатний', 'Плоский'] }, desc: 'Алюмінієві профілі та кріпильні елементи для надійного монтажу сонячних модулів. Ціна вказана за комплект на одну панель.', specs: [['Матеріал', 'Алюміній / нержавійка'], ['Комплект', 'На 1 панель']] }),
    P('rail-42', 'mounting', 'Алюмінієва рейка 4,2 м', 780, { short: 'Профіль для рядів панелей.' }),
    P('mount-flat', 'mounting', 'Опора для плоского даху', 1250, { short: 'Регульований кут нахилу.' }),
    P('kit-5', 'kits', 'Комплект СЕС 5 кВт гібридний', 189000, { hit: true, short: 'Панелі, інвертор, кріплення.' }),
    P('kit-10', 'kits', 'Готовий комплект СЕС 10 кВт', null, { short: 'Підібрана комплектація під ваші задачі.' }),
    P('kit-15', 'kits', 'Комплект СЕС 15 кВт з акумулятором', 395000, { short: 'Автономність і резерв.' })
  ];
  // Додаткові характеристики для початкових товарів.
  // Групи порівняння та сумісні товари визначаються автоматично (див. нижче) — вручну їх вказувати не потрібно.
  const META = {
    'panel-430': { specs: [['Потужність', '430 Вт'], ['Тип', 'Двостороння, Full Black'], ['Гарантія', 'За умовами виробника']] },
    'panel-500': { specs: [['Потужність', '500 Вт'], ['Тип', 'N-Type, двостороння'], ['Гарантія', 'За умовами виробника']] },
    'panel-550': { specs: [['Потужність', '550 Вт'], ['Призначення', 'Комерційні об’єкти'], ['Гарантія', 'За умовами виробника']] },
    'inv-3': { specs: [['Тип', 'Гібридний'], ['Номінальна потужність', '3 кВт'], ['Гарантія', 'За умовами виробника']] },
    'inv-8': { specs: [['Тип', 'Гібридний'], ['Номінальна потужність', '8 кВт'], ['Гарантія', 'За умовами виробника']] },
    'inv-12': { specs: [['Тип', 'Гібридний'], ['Номінальна потужність', '12 кВт'], ['Фази', 'Трифазний'], ['Гарантія', 'За умовами виробника']] },
    'inv-grid-10': { specs: [['Тип', 'Мережевий'], ['Номінальна потужність', '10 кВт'], ['Гарантія', 'За умовами виробника']] },
    'bat-2': { specs: [['Хімія', 'LiFePO4'], ['Ємність', '2,4 кВт·год'], ['Гарантія', 'За умовами виробника']] },
    'bat-10': { specs: [['Хімія', 'LiFePO4'], ['Ємність', '10 кВт·год'], ['Гарантія', 'За умовами виробника']] }
  };
  products.forEach(p => { const m = META[p.id]; if (m) Object.assign(p, m); });

  // Валюта відображення: UAH за замовчуванням; курс можна змінити тут.
  const EUR_RATE = 50;
  const getCurrency = () => {
    try { return localStorage.getItem('setec-currency-v1') === 'EUR' ? 'EUR' : 'UAH'; }
    catch (e) { return 'UAH'; }
  };
  const fmt = p => {
    if (p.price == null) return 'Ціна за запитом';
    const currency = getCurrency();
    const value = currency === 'EUR' ? p.price / EUR_RATE : p.price;
    return value.toLocaleString('uk-UA', { minimumFractionDigits: currency === 'EUR' ? 2 : 0, maximumFractionDigits: 2 }) + (currency === 'EUR' ? ' €' : ' грн');
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const art = p => p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">` : icons[p.icon];
  const uri = p => p.image || 'data:image/svg+xml,' + encodeURIComponent(icons[p.icon]);
  // Локальні зміни з адмін-панелі мають пріоритет над початковим каталогом.
  let saved = null;
  try { saved = JSON.parse(localStorage.getItem('solar-admin-products-v1') || 'null'); } catch (e) {}
  const merged = Array.isArray(saved) ? saved : products;

  // ---------- Категорії (керуються в адмін-панелі, вкладка «Категорії») ----------
  // icon = тип обладнання: panel | inverter | battery | bess | mount | kit | other.
  // За типом автоматично визначаються порівняння моделей і сумісні товари.
  const CAT_KEY = 'solar-admin-categories-v1';
  const KINDS = { panel: 'Сонячні панелі', inverter: 'Інвертори', battery: 'Акумулятори', bess: 'BESS / системи зберігання', mount: 'Кріплення та кабелі', kit: 'Комплекти СЕС', other: 'Інше (без автозв’язків)' };
  const defaultCats = Object.keys(L).map(id => ({ id, label: L[id], icon: I[id] }));
  let cats = null;
  try {
    const v = JSON.parse(localStorage.getItem(CAT_KEY) || 'null');
    if (Array.isArray(v)) cats = v.filter(c => c && c.id && c.label).map(c => ({ id: String(c.id), label: String(c.label), icon: icons[c.icon] ? c.icon : 'other' }));
  } catch (e) {}
  if (!cats || !cats.length) cats = defaultCats.map(c => ({ ...c }));
  const catOf = id => cats.find(c => c.id === id);
  // Назва й тип категорії завжди беруться з актуального списку категорій.
  merged.forEach(p => {
    let c = catOf(p.category);
    if (!c) { c = { id: p.category, label: p.categoryLabel || String(p.category), icon: icons[p.icon] ? p.icon : 'other' }; cats.push(c); }
    p.categoryLabel = c.label; p.icon = c.icon;
  });

  // ---------- Автоматичні групи порівняння ----------
  // Модель порівнюється з іншими моделями своєї групи. Група = категорія
  // (для інверторів — окремо гібридні та мережеві). Потужність/ємність береться
  // з назви («5 кВт», «450 Вт», «2,4 кВт·год») або з характеристик; без неї порівняння не показується.
  const kindOf = p => (catOf(p.category) || {}).icon || p.icon || 'other';
  const isGrid = p => /мережев/i.test(p.name || '');
  const familyOf = p => kindOf(p) === 'inverter' ? (isGrid(p) ? 'inverter-grid' : 'inverter-hybrid') : p.category;
  const UNIT = /(\d+(?:[.,]\d+)?)\s*(кВт·год|кВт|Вт)/i;
  const num = s => { const m = String(s == null ? '' : s).match(UNIT); return m ? parseFloat(m[1].replace(',', '.')) : undefined; };
  const rankOf = p => {
    if (p.rank != null && p.rank !== '' && isFinite(Number(p.rank))) return Number(p.rank); // необов'язкове ручне значення
    let r = num(p.name);
    if (r == null) for (const sp of (p.specs || [])) { if (/потужн|ємн/i.test(sp[0])) { r = num(sp[1]); if (r != null) break; } }
    return r;
  };

  // ---------- Автоматична сумісність (працює в обидва боки) ----------
  const needs = p => {
    switch (kindOf(p)) {
      case 'panel': return [['inverter'], ['mount']];
      case 'inverter': return isGrid(p) ? [['panel'], ['mount']] : [['battery'], ['panel']];
      case 'battery': return [['inverter', 'hybrid']];
      case 'mount': return [['panel']];
      default: return [];
    }
  };
  const fits = (p, q) => needs(p).some(([k, sub]) => kindOf(q) === k && (!sub || (sub === 'grid') === isGrid(q)));
  const compatOf = p => merged.filter(q => q.id !== p.id && (fits(p, q) || fits(q, p)));
  window.PRODUCTS = merged;
  window.CATEGORIES = cats;
  window.CategoryStore = { KEY: CAT_KEY, KINDS, defaults: defaultCats };
  window.ProductUtil = { fmt, esc, art, uri, compatOf, familyOf, rankOf, kindOf };
})();
