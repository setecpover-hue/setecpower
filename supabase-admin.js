(() => {
  const $ = s => document.querySelector(s);
  const authBox = $('#ordersAuth'), content = $('#ordersContent');
  if (!authBox || !window.sb) {
    if ($('#adminAuthMessage')) $('#adminAuthMessage').textContent = 'Спочатку заповніть supabase-config.js даними вашого проєкту Supabase.';
    return;
  }
  let channel = null;
  const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date = v => new Date(v).toLocaleString('uk-UA');
  const money = v => v == null ? 'Ціна за запитом' : Number(v).toLocaleString('uk-UA') + ' грн';
  function showLoggedIn(user) {
    authBox.hidden = true; content.hidden = false;
    $('#adminSignedIn').textContent = 'Ви увійшли як ' + user.email;
    $('#cartsAuthHint').textContent = 'Доступ дозволено. Останні події кошиків.';
    loadOrders(); loadCarts(); subscribe();
  }
  function showLoggedOut() {
    authBox.hidden = false; content.hidden = true; $('#cartsAuthHint').textContent = 'Для перегляду кошиків спочатку увійдіть у вкладці «Замовлення». ';
    if (channel) { window.sb.removeChannel(channel); channel = null; }
  }
  async function checkSession() {
    const { data } = await window.sb.auth.getSession();
    if (data.session) {
      const role = data.session.user.app_metadata?.role;
      if (role === 'admin') showLoggedIn(data.session.user);
      else { await window.sb.auth.signOut(); $('#adminAuthMessage').textContent = 'У цього користувача немає ролі admin. Призначте її в Supabase.'; }
    }
  }
  $('#adminLoginForm').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.currentTarget, msg = $('#adminAuthMessage');
    const btn = f.querySelector('button'); btn.disabled = true; msg.textContent = 'Перевіряємо дані…';
    const { data, error } = await window.sb.auth.signInWithPassword({ email:f.elements.email.value.trim(), password:f.elements.password.value });
    btn.disabled = false;
    if (error) { msg.textContent = 'Не вдалося увійти: ' + error.message; return; }
    if (data.user.app_metadata?.role !== 'admin') { await window.sb.auth.signOut(); msg.textContent = 'Вхід заборонено: обліковому запису не призначено роль admin.'; return; }
    msg.textContent = ''; showLoggedIn(data.user);
  });
  $('#adminLogout').addEventListener('click', async () => { await window.sb.auth.signOut(); showLoggedOut(); });
  function renderOrderCard(o) {
    return `<article class="cloud-card st-${esc(o.status)}"><div class="cloud-card-head"><div><b>Замовлення #${esc(o.id.slice(0,8))}</b><small>${date(o.created_at)}</small></div><select data-order-status="${esc(o.id)}"><option value="new" ${o.status==='new'?'selected':''}>Нове</option><option value="in_progress" ${o.status==='in_progress'?'selected':''}>В роботі</option><option value="done" ${o.status==='done'?'selected':''}>Виконано</option><option value="cancelled" ${o.status==='cancelled'?'selected':''}>Скасовано</option></select></div><p><b>${esc(o.customer_name)}</b> · ${esc(o.phone)} ${o.email?'· '+esc(o.email):''}</p>${o.comment?`<p>${esc(o.comment)}</p>`:''}<ul>${(o.items||[]).map(i=>`<li>${esc(i.name)} — ${Number(i.qty)||1} шт. · ${money(i.price)}</li>`).join('')}</ul></article>`;
  }
  function bindOrderStatus(root) {
    root.querySelectorAll('[data-order-status]').forEach(sel => sel.addEventListener('change', async () => {
      sel.disabled = true;
      const {error}=await window.sb.from('orders').update({status:sel.value}).eq('id',sel.dataset.orderStatus);
      if(error) { alert('Не вдалося змінити статус: '+error.message); sel.disabled = false; }
      else loadOrders();
    }));
  }
  async function loadOrders() {
    const activeRoot = $('#ordersList'), cancelledRoot = $('#cancelledOrdersList');
    activeRoot.innerHTML = '<p>Завантаження замовлень…</p>';
    cancelledRoot.innerHTML = '<p>Завантаження…</p>';
    const { data, error } = await window.sb.from('orders').select('*').order('created_at',{ascending:false}).limit(100);
    if (error) {
      const message = '<p class="admin-message">Помилка завантаження: '+esc(error.message)+'</p>';
      activeRoot.innerHTML = message; cancelledRoot.innerHTML = message; return;
    }
    const active = data.filter(o => o.status !== 'cancelled');
    const cancelled = data.filter(o => o.status === 'cancelled');
    const fresh = active.filter(o => o.status === 'new').length;
    $('#newOrderCount').textContent = fresh ? '('+fresh+')' : '';
    $('#activeOrderCount').textContent = active.length ? '('+active.length+')' : '';
    $('#cancelledOrderCount').textContent = cancelled.length ? '('+cancelled.length+')' : '';
    activeRoot.innerHTML = active.length ? active.map(renderOrderCard).join('') : '<p>Поточних замовлень немає.</p>';
    cancelledRoot.innerHTML = cancelled.length ? cancelled.map(renderOrderCard).join('') : '<p>Скасованих замовлень поки немає.</p>';
    bindOrderStatus(activeRoot);
    bindOrderStatus(cancelledRoot);
  }
  document.querySelectorAll('[data-order-view]').forEach(button => button.addEventListener('click', () => {
    const view = button.dataset.orderView;
    document.querySelectorAll('[data-order-view]').forEach(item => item.classList.toggle('active', item === button));
    $('#ordersList').hidden = view !== 'active';
    $('#cancelledOrdersList').hidden = view !== 'cancelled';
  }));
  async function loadCarts() {
    const root = $('#cartsList'); root.innerHTML = '<p>Завантаження…</p>';
    const { data, error } = await window.sb.from('cart_activity').select('*').order('created_at',{ascending:false}).limit(100);
    if (error) { root.innerHTML = '<p class="admin-message">Помилка завантаження: '+esc(error.message)+'</p>'; return; }
    root.innerHTML = data.length ? data.map(ev=>`<article class="cloud-card"><div class="cloud-card-head"><b>${esc(({item_added:'Додано товар',quantity_changed:'Змінено кількість',item_removed:'Видалено товар',cart_cleared:'Кошик очищено',order_submitted:'Замовлення оформлено'})[ev.event_type]||ev.event_type)}</b><small>${date(ev.created_at)}</small></div><small>Відвідувач: ${esc(ev.visitor_id.slice(0,8))} · ${esc(ev.page||'')}</small><ul>${(ev.items||[]).map(i=>`<li>${esc(i.name)} — ${Number(i.qty)||1} шт. · ${money(i.price)}</li>`).join('')||'<li>Кошик порожній</li>'}</ul></article>`).join('') : '<p>Подій кошика ще немає.</p>';
  }
  function subscribe() {
    if (channel) return;
    channel = window.sb.channel('solar-admin-live').on('postgres_changes',{event:'*',schema:'public',table:'orders'},loadOrders).on('postgres_changes',{event:'INSERT',schema:'public',table:'cart_activity'},loadCarts).subscribe();
  }
  $('#refreshOrders').addEventListener('click',loadOrders); $('#refreshCarts').addEventListener('click',loadCarts);
  window.sb.auth.onAuthStateChange((_event, session) => { if (!session) showLoggedOut(); });
  checkSession();
})();
