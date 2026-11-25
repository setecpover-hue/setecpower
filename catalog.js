(() => {
  const grid = document.querySelector('#productGrid');
  if (!grid || !window.PRODUCTS) return;
  const $ = s => document.querySelector(s);
  const { fmt, esc, art, uri } = window.ProductUtil;
  const items = window.PRODUCTS.map((p, i) => ({ ...p, pop: i }));
  // Кнопки категорій будуються зі списку категорій з адмін-панелі
  const tabs = document.querySelector('.category-tabs');
  if (tabs) tabs.innerHTML = '<button class="filter active" data-filter="all">Усе обладнання</button>' +
    window.CATEGORIES.map(c => `<button class="filter" data-filter="${esc(c.id)}">${esc(c.label)}</button>`).join('');
  const FAV = 'solar-fav-v1';
  let favs = new Set();
  try { favs = new Set(JSON.parse(localStorage.getItem(FAV) || '[]')); } catch (e) {}
  const saveFavs = () => { try { localStorage.setItem(FAV, JSON.stringify([...favs])); } catch (e) {} };

  const st = { cat: 'all', q: '', lo: 0, hi: 0, min: 0, max: 0, has: false, sort: 'pop', hits: false, fav: false, noPrice: true };
  const rMin = $('#rMin'), rMax = $('#rMax'), nMin = $('#nMin'), nMax = $('#nMax'), fill = $('#rangeFill');
  const HEART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20.5s-7.5-4.6-9.2-9.3C1.7 8 3.6 5 6.8 5c2 0 3.5 1.1 5.2 3 1.7-1.9 3.2-3 5.2-3 3.2 0 5.1 3 4 6.2-1.7 4.7-9.2 9.3-9.2 9.3z"/></svg>';

  // Межі слайдера рахуються окремо для кожного розділу
  function setBounds() {
    const prices = items.filter(p => st.cat === 'all' || p.category === st.cat).map(p => p.price).filter(v => v != null);
    st.has = prices.length > 0;
    if (st.has) {
      const a = Math.min(...prices), b = Math.max(...prices), step = b - a > 4000 ? 100 : 10;
      st.lo = Math.floor(a / step) * step;
      st.hi = Math.max(Math.ceil(b / step) * step, st.lo + step);
      [rMin, rMax].forEach(r => { r.min = st.lo; r.max = st.hi; r.step = step; });
      [nMin, nMax].forEach(n => { n.min = st.lo; n.max = st.hi; n.step = step; });
    }
    st.min = st.lo; st.max = st.hi;
    $('#priceScope').textContent = st.cat === 'all' ? '' : '· ' + (window.CATEGORIES.find(c => c.id === st.cat)?.label || '');
    $('#priceNote').textContent = st.has ? '' : 'У цьому розділі ціни за запитом';
    [rMin, rMax, nMin, nMax].forEach(el => el.disabled = !st.has);
    paintRange();
  }
  function paintRange() {
    rMin.value = nMin.value = st.has ? st.min : '';
    rMax.value = nMax.value = st.has ? st.max : '';
    const span = st.hi - st.lo || 1;
    fill.style.left = ((st.min - st.lo) / span * 100) + '%';
    fill.style.right = (100 - (st.max - st.lo) / span * 100) + '%';
    rMin.style.zIndex = st.min > (st.lo + st.hi) / 2 ? 3 : 2;
  }

  function list() {
    const q = st.q.toLocaleLowerCase('uk');
    const out = items.filter(p => {
      if (st.cat !== 'all' && p.category !== st.cat) return false;
      if (q && !(p.name + ' ' + p.short + ' ' + p.categoryLabel).toLocaleLowerCase('uk').includes(q)) return false;
      if (st.hits && !p.hit) return false;
      if (st.fav && !favs.has(p.id)) return false;
      if (p.price == null) return st.noPrice;
      return !st.has || (p.price >= st.min && p.price <= st.max);
    });
    const byPrice = d => (a, b) => (a.price == null) - (b.price == null) || d * ((a.price ?? 0) - (b.price ?? 0));
    if (st.sort === 'asc') out.sort(byPrice(1));
    else if (st.sort === 'desc') out.sort(byPrice(-1));
    else if (st.sort === 'name') out.sort((a, b) => a.name.localeCompare(b.name, 'uk'));
    else out.sort((a, b) => a.pop - b.pop);
    return out;
  }

  function card(p) {
    const liked = favs.has(p.id);
    return `<article class="product-card" data-category="${p.category}">
      <div class="pc-img"><a href="product.html?id=${p.id}" aria-label="${esc(p.name)}">${art(p)}</a>
        ${p.hit ? '<span class="pc-hit">Хіт</span>' : ''}
        <button class="pc-fav${liked ? ' liked' : ''}" type="button" data-fav="${p.id}" aria-pressed="${liked}" aria-label="Додати в обране">${HEART}</button></div>
      <div class="pc-body"><small>${esc(p.categoryLabel)}</small>
        <h3><a href="product.html?id=${p.id}">${esc(p.name)}</a></h3>
        <p>${esc(p.short)}</p>
        <div class="pc-foot"><strong class="${p.price == null ? 'ask' : ''}">${fmt(p)}</strong>
          <button class="pill pill-solid" type="button" data-add-to-cart data-open-cart data-id="${p.id}" data-name="${esc(p.name)}" data-category="${esc(p.categoryLabel)}" data-image="${esc(uri(p))}" data-price="${p.price == null ? '' : p.price}">В кошик</button></div></div>
    </article>`;
  }

  function render() {
    const out = list();
    grid.innerHTML = out.map(card).join('');
    $('#catalogEmpty').hidden = out.length > 0;
    $('#catCount').textContent = 'Знайдено товарів: ' + out.length;
    const active = (st.has && (st.min > st.lo || st.max < st.hi)) + st.hits + st.fav + !st.noPrice;
    const badge = $('#filterBadge');
    badge.hidden = !active; badge.textContent = active;
  }

  // події
  document.querySelectorAll('.filter').forEach(b => b.addEventListener('click', () => {
    st.cat = b.dataset.filter;
    document.querySelectorAll('.filter').forEach(x => x.classList.toggle('active', x === b));
    setBounds(); render();
  }));
  $('#catalogSearch')?.addEventListener('input', e => { st.q = e.target.value; render(); });
  $('#sortSelect').addEventListener('change', e => { st.sort = e.target.value; render(); });
  $('#filterToggle').addEventListener('click', e => {
    const panel = $('#filterPanel'), open = panel.hidden;
    panel.hidden = !open; e.currentTarget.setAttribute('aria-expanded', String(open));
  });
  document.querySelectorAll('.cat-view button').forEach(b => b.addEventListener('click', () => {
    document.querySelectorAll('.cat-view button').forEach(x => x.classList.toggle('active', x === b));
    grid.classList.toggle('view-list', b.dataset.view === 'list');
  }));

  rMin.addEventListener('input', () => { st.min = Math.min(+rMin.value, st.max); paintRange(); render(); });
  rMax.addEventListener('input', () => { st.max = Math.max(+rMax.value, st.min); paintRange(); render(); });
  const fromNum = () => {
    let a = +nMin.value || st.lo, b = +nMax.value || st.hi;
    a = Math.min(Math.max(a, st.lo), st.hi); b = Math.min(Math.max(b, st.lo), st.hi);
    st.min = Math.min(a, b); st.max = Math.max(a, b); paintRange(); render();
  };
  nMin.addEventListener('change', fromNum); nMax.addEventListener('change', fromNum);

  $('#fHits').addEventListener('change', e => { st.hits = e.target.checked; render(); });
  $('#fFav').addEventListener('change', e => { st.fav = e.target.checked; render(); });
  $('#fNoPrice').addEventListener('change', e => { st.noPrice = e.target.checked; render(); });
  $('#filterReset').addEventListener('click', () => {
    st.hits = st.fav = false; st.noPrice = true;
    $('#fHits').checked = $('#fFav').checked = false; $('#fNoPrice').checked = true;
    st.min = st.lo; st.max = st.hi; paintRange(); render();
  });

  grid.addEventListener('click', e => {
    const btn = e.target.closest('[data-fav]');
    if (!btn) return;
    const id = btn.dataset.fav;
    favs.has(id) ? favs.delete(id) : favs.add(id);
    saveFavs();
    if (st.fav) render();
    else { btn.classList.toggle('liked', favs.has(id)); btn.setAttribute('aria-pressed', String(favs.has(id))); }
  });

  setBounds(); render();
})();
