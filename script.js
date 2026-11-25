(() => {
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav');

  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const opened = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(opened));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }));
  }


  document.querySelectorAll('.submenu-toggle').forEach(button => {
    button.addEventListener('click', () => {
      const group = button.closest('.nav-group');
      const opened = group.classList.toggle('submenu-open');
      button.setAttribute('aria-expanded', String(opened));
    });
  });


  // Reveal page content smoothly as it enters the viewport.
  const motionTargets = document.querySelectorAll(
    'main > section, main > .section, .solution-card, .advantage-list article, ' +
    '.process-grid article, .product-card, .info-block, .banner, .catalog-cta, ' +
    '.subpage-links, .contact-form, .contact-copy'
  );

  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.documentElement.classList.add('reveal-ready');
    motionTargets.forEach((element, index) => {
      if (element.closest('.hero')) return;
      element.classList.add('reveal-on-scroll');
      if (element.matches('.solution-card,.process-grid article,.product-card,.advantage-list article,.info-block')) {
        element.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
      }
    });

    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -45px 0px' });

    document.querySelectorAll('.reveal-on-scroll').forEach(element => revealObserver.observe(element));
  }

  const year = document.querySelector('#year');
  if (year) year.textContent = new Date().getFullYear();

  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', async event => {
      event.preventDefault();
      const data = new FormData(form);
      const name = String(data.get('name') || '').trim();
      const contact = String(data.get('contact') || '').trim();
      if (!name || !contact) return;

      const button = form.querySelector('[type="submit"]');
      const note = form.querySelector('small');
      const previousNote = note ? note.textContent : '';
      if (button) button.disabled = true;
      if (note) note.textContent = 'Надсилаємо заявку…';

      try {
        if (!window.SolarCloud) throw new Error('Supabase client is unavailable.');
        await window.SolarCloud.lead({
          customer_name: name,
          contact: contact,
          email: String(data.get('email') || '').trim() || null,
          company: String(data.get('company') || '').trim() || null,
          interest: String(data.get('interest') || '').trim() || null,
          message: String(data.get('message') || '').trim() || null,
          page: location.pathname
        });
        form.reset();
        if (note) note.textContent = 'Дякуємо! Вашу заявку успішно надіслано.';
      } catch (error) {
        console.error('Lead submission failed:', error);
        if (note) note.textContent = 'Не вдалося надіслати заявку. Перевірте підключення та спробуйте ще раз.';
      } finally {
        if (button) button.disabled = false;
      }
    });
  });

})();

/* ===== Cart ===== */
(() => {
  const STORAGE_KEY = 'solar-cart-v1';
  const ICON_CART = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 4h2.2l2.1 10.3a1.5 1.5 0 0 0 1.5 1.2h7.9a1.5 1.5 0 0 0 1.5-1.1L20 8H6.2"/><circle cx="9.5" cy="19.5" r="1.3"/><circle cx="17" cy="19.5" r="1.3"/></svg>';

  let items = [];
  try { items = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch (e) { items = []; }
  if (!Array.isArray(items)) items = [];

  const save = () => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); } catch (e) {} };
  const logCart = type => { if (window.SolarCloud) window.SolarCloud.cart(items, type); };
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const count = () => items.reduce((n, i) => n + i.qty, 0);

  // Header button
  const header = document.querySelector('.header');
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'cart-button';
  button.setAttribute('aria-label', 'Відкрити кошик');
  button.setAttribute('aria-haspopup', 'dialog');
  button.innerHTML = ICON_CART + '<span class="cart-count" aria-hidden="true">0</span>';
  if (header) header.appendChild(button);

  // Drawer
  const overlay = document.createElement('div');
  overlay.className = 'cart-overlay';
  const drawer = document.createElement('aside');
  drawer.className = 'cart-drawer';
  drawer.setAttribute('role', 'dialog');
  drawer.setAttribute('aria-modal', 'true');
  drawer.setAttribute('aria-labelledby', 'cartTitle');
  drawer.innerHTML = `
    <div class="cart-head">
      <div><p>SETEC POWER</p><h2 id="cartTitle">Кошик</h2></div>
      <button class="cart-close" type="button" aria-label="Закрити кошик">×</button>
    </div>
    <div class="cart-body"></div>
    <div class="cart-foot" hidden>
      <div class="cart-total"><span>Позицій у кошику</span><strong></strong></div>
      <form class="cart-order-form" id="cartOrderForm"><h3>Оформити замовлення</h3><label>Ваше ім’я<input name="customer_name" required minlength="2" maxlength="120" autocomplete="name" placeholder="Ім’я"></label><label>Телефон<input name="phone" required minlength="5" maxlength="40" autocomplete="tel" placeholder="+380..."></label><label>Email (необов’язково)<input name="email" type="email" autocomplete="email" placeholder="name@example.com"></label><label>Коментар<textarea name="comment" rows="2" maxlength="1000" placeholder="Деталі замовлення"></textarea></label><button class="button button-yellow" type="submit">Надіслати замовлення <span>↗</span></button><p class="cart-order-message" role="status"></p></form>
      <button class="cart-clear" type="button">Очистити кошик</button>
    </div>`;
  document.body.append(overlay, drawer);

  const body = drawer.querySelector('.cart-body');
  const foot = drawer.querySelector('.cart-foot');
  const badge = button.querySelector('.cart-count');
  let lastFocus = null;

  function render() {
    const total = count();
    badge.textContent = total > 99 ? '99+' : total;
    badge.classList.toggle('has-items', total > 0);
    button.setAttribute('aria-label', total ? `Відкрити кошик, товарів: ${total}` : 'Відкрити кошик');

    if (!items.length) {
      foot.hidden = true;
      body.innerHTML = `
        <div class="cart-empty">
          <div class="cart-empty-icon">${ICON_CART}</div>
          <h3>Кошик поки порожній</h3>
          <p>Додайте обладнання з каталогу — ми допоможемо підібрати рішення та підготуємо пропозицію.</p>
          <a class="button button-yellow" href="catalog.html">Перейти до каталогу <span>↗</span></a>
        </div>`;
      return;
    }

    foot.hidden = false;
    foot.querySelector('strong').textContent = total;
    body.innerHTML = '<ul class="cart-items">' + items.map(i => `
      <li class="cart-item" data-id="${esc(i.id)}">
        <div class="cart-item-thumb">${i.image ? `<img src="${esc(i.image)}" alt="">` : '▦'}</div>
        <div>
          ${i.category ? `<small>${esc(i.category)}</small>` : ''}
          <h4>${esc(i.name)}</h4>
          <div class="cart-qty">
            <button type="button" data-act="dec" aria-label="Менше">−</button>
            <span>${i.qty}</span>
            <button type="button" data-act="inc" aria-label="Більше">+</button>
          </div>
        </div>
        <button class="cart-remove" type="button" data-act="remove" aria-label="Видалити">×</button>
      </li>`).join('') + '</ul>';
  }

  function open() {
    lastFocus = document.activeElement;
    document.body.classList.add('cart-open');
    drawer.querySelector('.cart-close').focus({ preventScroll: true });
  }
  function close() {
    document.body.classList.remove('cart-open');
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll: true });
  }

  button.addEventListener('click', open);
  overlay.addEventListener('click', close);
  drawer.querySelector('.cart-close').addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && document.body.classList.contains('cart-open')) close();
    // keep focus inside the drawer
    if (e.key === 'Tab' && document.body.classList.contains('cart-open')) {
      const f = [...drawer.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.offsetParent !== null);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  drawer.addEventListener('click', e => {
    const link = e.target.closest('a[href]');
    if (link) { close(); return; }
    if (e.target.closest('.cart-clear')) { items = []; save(); render(); logCart('cart_cleared'); return; }
    const act = e.target.closest('[data-act]');
    if (!act) return;
    const id = act.closest('.cart-item').dataset.id;
    const item = items.find(i => String(i.id) === id);
    if (!item) return;
    if (act.dataset.act === 'inc') item.qty++;
    if (act.dataset.act === 'dec') item.qty--;
    if (act.dataset.act === 'remove' || item.qty < 1) items = items.filter(i => i !== item);
    save(); render(); logCart(act.dataset.act === 'remove' ? 'item_removed' : 'quantity_changed');
  });

  // Public API: SolarCart.add({ id, name, category, image, qty })
  function add(product, qty = 1) {
    if (!product || !product.name) return;
    const id = String(product.id ?? product.name);
    const existing = items.find(i => String(i.id) === id);
    if (existing) existing.qty += qty;
    else items.push({ id, name: product.name, category: product.category || '', image: product.image || '', price: product.price == null ? null : Number(product.price), qty });
    save(); render(); logCart('item_added');
    button.classList.remove('bump'); void button.offsetWidth; button.classList.add('bump');
  }
  window.SolarCart = { add, open, close, clear() { items = []; save(); render(); logCart('cart_cleared'); }, get items() { return items.slice(); } };

  drawer.querySelector('#cartOrderForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.currentTarget, msg = form.querySelector('.cart-order-message'), btn = form.querySelector('button[type=submit]');
    if (!items.length) return;
    if (!window.SolarCloud || !window.SolarCloud.ready()) { msg.textContent = 'Онлайн-замовлення ще не підключено. Зверніться до нас через сторінку контактів.'; return; }
    const fd = new FormData(form);
    const payload = { customer_name: String(fd.get('customer_name')).trim(), phone: String(fd.get('phone')).trim(), email: String(fd.get('email') || '').trim() || null, comment: String(fd.get('comment') || '').trim() || null, items: items.map(i => ({ id:i.id, name:i.name, category:i.category, qty:i.qty, price:i.price ?? null })) };
    btn.disabled = true; msg.textContent = 'Надсилаємо замовлення…';
    try { await window.SolarCloud.order(payload); items = []; save(); render(); form.reset(); msg.textContent = 'Дякуємо! Замовлення надіслано. Ми зв’яжемося з вами.'; logCart('order_submitted'); }
    catch(err) { console.error(err); msg.textContent = 'Не вдалося надіслати. Перевірте підключення та спробуйте ще раз.'; }
    finally { btn.disabled = false; }
  });

  // Any element with data-add-to-cart data-name="..." [data-id data-category data-image] adds to the cart
  document.addEventListener('click', e => {
    const el = e.target.closest('[data-add-to-cart]');
    if (!el) return;
    e.preventDefault();
    add({ id: el.dataset.id, name: el.dataset.name, category: el.dataset.category, image: el.dataset.image, price: el.dataset.price === '' ? null : Number(el.dataset.price) });
    if (el.hasAttribute('data-open-cart')) open();
  });

  // Sync between tabs
  window.addEventListener('storage', e => {
    if (e.key !== STORAGE_KEY) return;
    try { items = JSON.parse(e.newValue || '[]'); } catch (err) { items = []; }
    render();
  });

  render();
})();


/* Social links: placeholders (href="#") do nothing until a real URL is set */
document.querySelectorAll('.social-link[href="#"]').forEach(a => a.addEventListener('click', e => e.preventDefault()));


/* Контактний блок внизу кожної сторінки (дані змінюються тут в одному місці) */
(() => {
  if (document.querySelector('.home-contacts')) return;
  const footer = document.querySelector('.footer');
  if (!footer) return;
  const C = {
    places: [
      { id: 'office', tab: 'Офіс', label: 'Адреса офісу', addr: 'Вкажіть адресу вашого офісу' },
      { id: 'wh1', tab: 'Склад СЕС', label: 'Адреса складу СЕС', addr: 'Вкажіть адресу складу' },
      { id: 'wh2', tab: 'Склад МК', label: 'Адреса складу МК', addr: 'Вкажіть адресу складу' }
    ],
    lines: [
      ['Сонячні станції під ключ', '+38 (0XX) XXX XX XX', '+380000000000'],
      ['Обладнання для СЕС', '+38 (0XX) XXX XX XX', '+380000000000'],
      ['Системи кріплення для СЕС', '+38 (0XX) XXX XX XX', '+380000000000'],
      ['Співпраця для дилерів', '+38 (0XX) XXX XX XX', '+380000000000']
    ]
  };
  const list = C.lines.map(l => `<li><b>${l[0]}</b><a href="tel:${l[2]}">${l[1]}</a></li>`).join('');
  const sec = document.createElement('section');
  sec.className = 'home-contacts site-contacts';
  sec.innerHTML = `<div class="locations"><div>
    <div class="loc-tabs">${C.places.map((p, i) => `<button class="loc-tab${i ? '' : ' active'}" data-loc="${p.id}" type="button">${p.tab}</button>`).join('')}</div>
    ${C.places.map((p, i) => `<div class="loc-panel" data-panel="${p.id}"${i ? ' hidden' : ''}><p class="loc-addr"><small>${p.label}</small>${p.addr}</p><ul class="loc-list">${list}</ul></div>`).join('')}
    </div><div class="map-box" role="img" aria-label="Місце для карти"><span class="map-pin">⌖</span><em>Тут буде карта — вставте код Google Maps</em></div></div>`;
  footer.before(sec);
})();

/* Передзаповнення форми контактів розрахунком із калькулятора */
(() => {
  const area = document.querySelector('.ct-form textarea[name="message"]');
  if (!area) return;
  try {
    const msg = sessionStorage.getItem('solar-calc-msg');
    if (msg) { area.value = msg; sessionStorage.removeItem('solar-calc-msg'); }
  } catch (e) {}
})();

/* Location tabs */
document.querySelectorAll('.loc-tab').forEach(tab => tab.addEventListener('click', () => {
  document.querySelectorAll('.loc-tab').forEach(t => t.classList.toggle('active', t === tab));
  document.querySelectorAll('.loc-panel').forEach(p => { p.hidden = p.dataset.panel !== tab.dataset.loc; });
}));
