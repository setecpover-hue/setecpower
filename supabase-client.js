
(() => {
  const cfg = window.SUPABASE_CONFIG || {};
  const ready = cfg.url && cfg.anonKey &&
    !cfg.url.includes('YOUR_PROJECT') &&
    !cfg.anonKey.includes('YOUR_SUPABASE');

  window.SUPABASE_READY = !!ready && !!window.supabase;
  window.sb = window.SUPABASE_READY
    ? window.supabase.createClient(cfg.url, cfg.anonKey)
    : null;

  window.SolarCloud = {
    ready: () => !!window.sb,

    async cart(items, eventType) {
      if (!window.sb) return;
      try {
        let visitor = localStorage.getItem('solar-visitor-id');
        if (!visitor) {
          visitor = crypto.randomUUID();
          localStorage.setItem('solar-visitor-id', visitor);
        }

        const clean = (items || []).map(i => ({
          id: String(i.id),
          name: String(i.name),
          category: i.category || '',
          qty: Number(i.qty) || 1,
          price: i.price == null ? null : Number(i.price)
        }));

        await window.sb.from('cart_activity').insert({
          visitor_id: visitor,
          event_type: eventType || 'cart_updated',
          items: clean,
          page: location.pathname
        });
      } catch (e) {
        console.warn('Cart activity sync failed', e);
      }
    },

    async order(payload) {
      if (!window.sb) throw new Error('Supabase ще не налаштовано.');

      const { data, error } = await window.sb
        .from('orders')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;

      try {
        const { error: telegramError } =
          await window.sb.functions.invoke('telegram-order', {
            body: {
              orderId: data.id,
              order: payload
            }
          });

        if (telegramError) {
          console.error('Telegram notification failed:', telegramError);
        }
      } catch (e) {
        console.error('Telegram notification failed:', e);
      }

      return data;
    },

    async lead(payload) {
      if (!window.sb) throw new Error('Supabase ще не налаштовано.');

      const { data, error } = await window.sb
        .from('leads')
        .insert(payload)
        .select('id')
        .single();

      if (error) throw error;
      return data;
    }
  };
})();
