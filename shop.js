/* Shop layer: header, footer, home sections, catalog URL params. Does not touch cart/catalog logic. */
(() => {
  // Категорії керуються в адмін-панелі (вкладка «Категорії»); тут — [id, назва, тип].
  const CATS = (() => {
    if (window.CATEGORIES) return window.CATEGORIES.map(c => [c.id, c.label, c.icon]);
    try {
      const v = JSON.parse(localStorage.getItem('solar-admin-categories-v1') || 'null');
      if (Array.isArray(v) && v.length) return v.filter(c => c && c.id && c.label).map(c => [String(c.id), String(c.label), c.icon || 'other']);
    } catch (e) {}
    return [['panels','Сонячні панелі','panel'],['inverters','Інвертори','inverter'],['batteries','Акумулятори','battery'],['bess','BESS та резерв','bess'],['mounting','Кріплення','mount'],['kits','Комплекти СЕС','kit']];
  })();
  const escC = v => String(v).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const PHONE = ['+38 (0XX) XXX XX XX', '+380000000000'];
  const page = location.pathname.split('/').pop() || 'index.html';
  const act = h => page === h ? ' class="active"' : '';
  const header = document.querySelector('.header');
  if (header) {
    const cart = header.querySelector('.cart-button');
    header.innerHTML = `
    <div class="topbar"><div class="wrap"><span>Гарантія на обладнання</span><span>Доставка по Україні</span><span>Монтаж під ключ</span><a href="tel:${PHONE[1]}">${PHONE[0]}</a></div></div>
    <div class="hdr-main wrap">
      <button class="menu-toggle" type="button" aria-label="Меню" aria-expanded="false"><i></i><i></i><i></i></button>
      <a class="logo" href="index.html">SETEC POWER</a>
      <form class="hdr-search" action="catalog.html" role="search"><input name="q" type="search" placeholder="Пошук: панелі, інвертори, акумулятори…" aria-label="Пошук"><button aria-label="Шукати">Знайти</button></form>
      <div class="hdr-actions"><a class="hdr-link" href="catalog.html?fav=1">♡ Обране</a><a class="hdr-link" href="contacts.html">Контакти</a><label class="currency-switch" aria-label="Валюта"><span>Валюта</span><select id="currencySelect" aria-label="Оберіть валюту"><option value="UAH">₴ UAH</option><option value="EUR">€ EUR</option></select></label></div>
    </div>
    <nav class="nav"><div class="wrap"><a data-cat="all" href="catalog.html">Усі товари</a>${CATS.map(c => `<a data-cat="${escC(c[0])}" href="catalog.html?cat=${escC(c[0])}">${escC(c[1])}</a>`).join('')}<a${act('calculator.html')} class="hot" href="calculator.html">Калькулятор СЕС</a><a${act('about.html')} href="about.html">Про компанію</a></div></nav>`;
    if (cart) header.querySelector('.hdr-actions').appendChild(cart);
    const t = header.querySelector('.menu-toggle'), n = header.querySelector('.nav');
    t.addEventListener('click', () => t.setAttribute('aria-expanded', String(n.classList.toggle('open'))));
    const currencySelect = header.querySelector('#currencySelect');
    if (currencySelect) {
      let currency = 'UAH';
      try { currency = localStorage.getItem('setec-currency-v1') === 'EUR' ? 'EUR' : 'UAH'; } catch (e) {}
      currencySelect.value = currency;
      currencySelect.addEventListener('change', () => {
        try { localStorage.setItem('setec-currency-v1', currencySelect.value); } catch (e) {}
        location.reload();
      });
    }
  }
  const footer = document.querySelector('.footer');
  if (footer) footer.innerHTML = `<div class="wrap"><div class="ft-grid">
    <div><h4>SETEC POWER</h4><p>Комплексні рішення у сфері сонячної енергетики: обладнання, проєктування та монтаж під ключ.</p></div>
    <div><h4>Покупцям</h4><a href="delivery.html">Доставка та оплата</a><a href="returns.html">Повернення</a><a href="calculator.html">Калькулятор СЕС</a><a href="contacts.html">Контакти</a></div>
    <div><h4>Каталог</h4>${CATS.map(c => `<a href="catalog.html?cat=${escC(c[0])}">${escC(c[1])}</a>`).join('')}</div>
    <div><h4>Зв’яжіться з нами</h4><a href="tel:${PHONE[1]}">${PHONE[0]}</a><p>ПН–ПТ 09:00–18:00</p><a href="about.html">Про компанію</a><a href="objects.html">Наші об’єкти</a></div>
  </div><p class="official-distributor">Ми є офіційними дистриб’юторами SETEC POWER.</p><div class="ft-bottom">© ${new Date().getFullYear()} SETEC POWER. Усі права захищені.</div></div>`;

  const U = window.ProductUtil, P = window.PRODUCTS;
  const cats = document.querySelector('#shopCats');
  if (cats && U) cats.innerHTML = CATS.map(c => { const p = (P || []).find(x => x.category === c[0]) || { icon: c[2] || 'other' }; return `<a href="catalog.html?cat=${escC(c[0])}">${U.art(p.image ? { icon: p.icon } : p)}${escC(c[1])}</a>`; }).join('');
  const hits = document.querySelector('#shopHits');
  if (hits && U && P) {
    const list = (P.filter(p => p.hit).length ? P.filter(p => p.hit) : P).slice(0, 4);
    hits.innerHTML = list.map(p => `<article class="product-card"><div class="pc-img"><a href="product.html?id=${p.id}">${U.art(p)}</a>${p.hit ? '<span class="pc-hit">Хіт</span>' : ''}</div><div class="pc-body"><small>${U.esc(p.categoryLabel)}</small><h3><a href="product.html?id=${p.id}">${U.esc(p.name)}</a></h3><p>${U.esc(p.short || '')}</p><div class="pc-foot"><strong class="${p.price == null ? 'ask' : ''}">${U.fmt(p)}</strong><button class="pill pill-solid" type="button" data-add-to-cart data-open-cart data-id="${p.id}" data-name="${U.esc(p.name)}" data-category="${U.esc(p.categoryLabel)}" data-image="${U.esc(U.uri(p))}" data-price="${p.price == null ? '' : p.price}">В кошик</button></div></div></article>`).join('');
  }
  // catalog: ?cat= ?q= ?fav=1
  const qs = new URLSearchParams(location.search);
  if (document.querySelector('#productGrid')) {
    const c = qs.get('cat'), q = qs.get('q');
    if (c) document.querySelector(`.filter[data-filter="${c}"]`)?.click();
    if (q) { const i = document.querySelector('#catalogSearch'); if (i) { i.value = q; i.dispatchEvent(new Event('input')); } }
    if (qs.get('fav')) { const f = document.querySelector('#fFav'); if (f) { f.checked = true; f.dispatchEvent(new Event('change')); } }
    // активний пункт меню + перемикання розділів без перезавантаження сторінки
    const navLinks = document.querySelectorAll('.header .nav a[data-cat]');
    const setActive = cat => navLinks.forEach(a => a.classList.toggle('active', a.dataset.cat === cat));
    const go = cat => {
      document.querySelector(`.filter[data-filter="${cat}"]`)?.click();
      history.replaceState(null, '', cat === 'all' ? 'catalog.html' : 'catalog.html?cat=' + cat);
      setActive(cat);
    };
    navLinks.forEach(a => a.addEventListener('click', e => { e.preventDefault(); go(a.dataset.cat); }));
    document.querySelectorAll('.cat-side .filter').forEach(b => b.addEventListener('click', () => {
      const cat = b.dataset.filter;
      history.replaceState(null, '', cat === 'all' ? 'catalog.html' : 'catalog.html?cat=' + cat);
      setActive(cat);
    }));
    setActive(c || 'all');
    const ft = document.querySelector('#filterToggle'), fp = document.querySelector('#filterPanel');
    if (ft && fp) ft.addEventListener('click', () => fp.classList.toggle('show'));
  }
})();
