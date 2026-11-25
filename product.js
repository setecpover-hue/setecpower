(() => {
  const root = document.querySelector('#product');
  if (!root || !window.PRODUCTS) return;
  const { fmt, esc, art, uri } = window.ProductUtil;
  const list = window.PRODUCTS;
  const id = new URLSearchParams(location.search).get('id');
  const i = list.findIndex(p => p.id === id);
  const p = list[i];

  if (!p) {
    root.innerHTML = '<div class="pp-missing"><h1>Товар не знайдено</h1><p>Можливо, посилання застаріло.</p><a class="pill pill-solid" href="catalog.html">Перейти до каталогу</a></div>';
    return;
  }
  document.title = p.name + ' — SETEC POWER';
  const prev = list[(i - 1 + list.length) % list.length], next = list[(i + 1) % list.length];
  const opt = p.options ? `<label class="pp-field">${esc(p.options.label)}<select id="ppOption">${p.options.values.map(v => `<option>${esc(v)}</option>`).join('')}</select></label>` : '';

  root.innerHTML = `
    <div class="pp-crumbs"><div><a href="index.html">Головна</a> / <a href="catalog.html">Каталог</a> / <span>${esc(p.categoryLabel)}</span> / <span>${esc(p.name)}</span></div>
      <div><a href="product.html?id=${prev.id}">‹ Назад</a><i>|</i><a href="product.html?id=${next.id}">Далі ›</a></div></div>
    <div class="pp-grid">
      <div class="pp-media"><div class="pp-image">${art(p)}</div></div>
      <div class="pp-info">
        <h1>${esc(p.name)}</h1>
        <div class="pp-price ${p.price == null ? 'ask' : ''}">${fmt(p)}</div>
        ${opt}
        <div class="pp-field">Кількість
          <div class="pp-qty"><button type="button" data-q="-1" aria-label="Менше">−</button><input id="ppQty" type="number" min="1" value="1" aria-label="Кількість"><button type="button" data-q="1" aria-label="Більше">+</button></div>
        </div>
        <button class="pp-order" id="ppOrder" type="button">Замовити</button>
        <details class="pp-acc" open><summary>Опис</summary><p>${esc(p.desc)}</p></details>
        <details class="pp-acc"><summary>Доставка та оплата</summary><p>Спосіб і строки доставки узгоджуються індивідуально. Докладніше — на сторінці <a href="delivery.html">«Доставка та оплата»</a>.</p></details>
      </div>
    </div>
    <div class="pp-specs"><h2>Характеристики</h2><dl>${p.specs.map(s => `<div><dt>${esc(s[0])}</dt><dd>${esc(s[1])}</dd></div>`).join('')}</dl></div>`;

  // ---------- Порівняння моделей однієї групи (напр. інвертори різної потужності) ----------
  // Група порівняння визначається автоматично (категорія + потужність/ємність з назви)
  const { familyOf, rankOf } = window.ProductUtil;
  const fam = rankOf(p) != null ? list.filter(x => familyOf(x) === familyOf(p) && rankOf(x) != null).sort((a, b) => rankOf(a) - rankOf(b)) : [];
  if (fam.length > 1) {
    const labels = [];
    fam.forEach(x => (x.specs || []).forEach(sp => { if (!labels.includes(sp[0])) labels.push(sp[0]); }));
    const val = (x, l) => { const r = (x.specs || []).find(sp => sp[0] === l); return r ? esc(r[1]) : '—'; };
    const at = fam.indexOf(p);
    const tag = (x, k) => x === p ? '<em class="cmp-now">Ви переглядаєте</em>' : k > at ? '<em class="cmp-up">Потужніша</em>' : '<em class="cmp-down">Менша</em>';
    const cmp = document.createElement('section');
    cmp.className = 'pp-block';
    cmp.innerHTML = `<h2>Порівняння моделей</h2><p class="pp-lead">Інші моделі цієї лінійки — оберіть потрібну потужність.</p>
      <div class="cmp-wrap"><table class="cmp"><thead><tr><th></th>${fam.map(x => `<th class="${x === p ? 'is-now' : ''}">${tag(x, fam.indexOf(x))}<a href="product.html?id=${esc(x.id)}">${esc(x.name)}</a></th>`).join('')}</tr></thead>
      <tbody><tr><th>Ціна</th>${fam.map(x => `<td class="${x === p ? 'is-now' : ''}"><strong>${fmt(x)}</strong></td>`).join('')}</tr>
      ${labels.map(l => `<tr><th>${esc(l)}</th>${fam.map(x => `<td class="${x === p ? 'is-now' : ''}">${val(x, l)}</td>`).join('')}</tr>`).join('')}
      <tr><th></th>${fam.map(x => `<td class="${x === p ? 'is-now' : ''}">${x === p ? '' : `<a class="pill pill-solid" href="product.html?id=${esc(x.id)}">Детальніше</a>`}</td>`).join('')}</tr></tbody></table></div>`;
    root.appendChild(cmp);
  }

  // ---------- Сумісні товари (за категоріями; працює й для майбутніх товарів) ----------
  const compat = window.ProductUtil.compatOf(p);
  if (compat.length) {
    const groups = {};
    compat.forEach(x => (groups[x.categoryLabel] = groups[x.categoryLabel] || []).push(x));
    const card = x => `<article class="product-card" data-category="${esc(x.category)}">
      <div class="pc-img"><a href="product.html?id=${esc(x.id)}" aria-label="${esc(x.name)}">${art(x)}</a>${x.hit ? '<span class="pc-hit">Хіт</span>' : ''}</div>
      <div class="pc-body"><small>${esc(x.categoryLabel)}</small><h3><a href="product.html?id=${esc(x.id)}">${esc(x.name)}</a></h3><p>${esc(x.short)}</p>
        <div class="pc-foot"><strong class="${x.price == null ? 'ask' : ''}">${fmt(x)}</strong>
          <button class="pill pill-solid" type="button" data-add-to-cart data-open-cart data-id="${esc(x.id)}" data-name="${esc(x.name)}" data-category="${esc(x.categoryLabel)}" data-image="${esc(uri(x))}" data-price="${x.price == null ? '' : x.price}">В кошик</button></div></div></article>`;
    const sec = document.createElement('section');
    sec.className = 'pp-block';
    sec.innerHTML = `<h2>Сумісні товари</h2><p class="pp-lead">Підходять до «${esc(p.name)}».</p>` +
      Object.entries(groups).map(([label, arr]) => `<h3 class="compat-title">${esc(label)}</h3><div class="product-grid compat-grid">${arr.map(card).join('')}</div>`).join('');
    root.appendChild(sec);
  }

  const qty = root.querySelector('#ppQty');
  const clamp = () => { qty.value = Math.max(1, parseInt(qty.value, 10) || 1); };
  root.querySelectorAll('[data-q]').forEach(b => b.addEventListener('click', () => { qty.value = (parseInt(qty.value, 10) || 1) + Number(b.dataset.q); clamp(); }));
  qty.addEventListener('change', clamp);

  root.querySelector('#ppOrder').addEventListener('click', () => {
    clamp();
    const sel = root.querySelector('#ppOption');
    const label = sel ? ` (${p.options.label}: ${sel.value})` : '';
    window.SolarCart.add({ id: p.id + (sel ? '|' + sel.value : ''), name: p.name + label, category: p.categoryLabel, image: uri(p), price: p.price }, parseInt(qty.value, 10));
    window.SolarCart.open();
  });
})();
