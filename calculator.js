/* Калькулятор прорахунку СЕС. Усі ціни й коефіцієнти — орієнтовні, змініть CONFIG на свої. */
(() => {
  const form = document.querySelector('#calcForm');
  if (!form) return;
  const DEFAULT_CONFIG = {
    panelW: 450, panelPrice: 3500, mountPrice: 450,
    roofK: { pitched: 1, flat: 1.6, ground: 2.2 },   // коефіцієнт вартості кріплення
    invPerKw: { grid: 3200, hybrid: 5600 },          // грн за кВт інвертора
    batteryPerKwh: 12400,                            // грн за кВт·год акумулятора
    usable: 0.9,                                     // корисна глибина розряду
    cablesPct: 0.07, workPerKw: 2500,
    yield: { north: 1000, center: 1100, south: 1200 }, // кВт·год з 1 кВт за рік
    low: 0.92, high: 1.1,
    invSizes: [3, 5, 6, 8, 10, 12, 15, 20, 25, 30, 50, 100],
    season: [0.38, 0.55, 0.9, 1.2, 1.5, 1.6, 1.65, 1.5, 1.1, 0.75, 0.4, 0.3]
  };
  let savedConfig = {};
  try { savedConfig = JSON.parse(localStorage.getItem('solar-admin-calculator-v1') || '{}') || {}; } catch (e) {}
  const CONFIG = { ...DEFAULT_CONFIG, ...savedConfig,
    roofK: { ...DEFAULT_CONFIG.roofK, ...(savedConfig.roofK || {}) },
    invPerKw: { ...DEFAULT_CONFIG.invPerKw, ...(savedConfig.invPerKw || {}) },
    yield: { ...DEFAULT_CONFIG.yield, ...(savedConfig.yield || {}) }
  };
  const $ = s => document.querySelector(s);
  const nf = n => Math.round(n).toLocaleString('uk-UA');
  const money = n => nf(n) + ' грн';
  const radio = name => form.querySelector(`input[name="${name}"]:checked`).value;
  const num = (el, d) => { const v = parseFloat(el.value); return isFinite(v) && v > 0 ? v : d; };

  const mNum = $('#cMonthly'), mRange = $('#cMonthlyRange');
  mRange.addEventListener('input', () => { mNum.value = mRange.value; calc(); });
  mNum.addEventListener('input', () => { mRange.value = Math.min(mNum.value, 3000); calc(); });
  form.addEventListener('input', calc);
  form.addEventListener('change', calc);

  let last = '';
  function calc() {
    const monthly = num(mNum, 400), cover = +$('#cCover').value, type = radio('type');
    const roof = radio('roof'), region = radio('region'), tariff = num($('#cTariff'), 4.32);
    const load = +$('#cLoad').value, hours = +$('#cHours').value;
    $('#oMonthly').textContent = nf(monthly); $('#oCover').textContent = cover;
    $('#oLoad').textContent = load; $('#oHours').textContent = hours;
    $('#backupBox').hidden = type !== 'hybrid';

    const y = CONFIG.yield[region], yearCons = monthly * 12;
    const panels = Math.max(1, Math.ceil(yearCons * cover / 100 / y * 1000 / CONFIG.panelW));
    const kwp = panels * CONFIG.panelW / 1000;
    const prod = kwp * y;
    const need = kwp * 0.85;
    const invKw = CONFIG.invSizes.find(s => s >= need) || Math.ceil(need / 10) * 10;
    const batt = type === 'hybrid' ? Math.ceil(load * hours / CONFIG.usable * 2) / 2 : 0;

    const equipment = panels * CONFIG.panelPrice + panels * CONFIG.mountPrice * CONFIG.roofK[roof]
      + invKw * CONFIG.invPerKw[type] + batt * CONFIG.batteryPerKwh;
    const total = equipment * (1 + CONFIG.cablesPct) + kwp * CONFIG.workPerKw;
    const r1000 = v => Math.round(v / 1000) * 1000;
    const saving = Math.min(prod, yearCons) * tariff;
    const payback = saving > 0 ? total / saving : 0;

    $('#rTotal').textContent = `${money(r1000(total * CONFIG.low))} – ${money(r1000(total * CONFIG.high))}`;
    $('#rKwp').textContent = kwp.toFixed(2).replace(/\.?0+$/, '') + ' кВт';
    $('#rPanels').textContent = `${panels} × ${CONFIG.panelW} Вт`;
    $('#rInv').textContent = invKw + ' кВт · ' + (type === 'hybrid' ? 'гібридний' : 'мережевий');
    $('#rBat').textContent = batt ? batt.toString().replace('.', ',') + ' кВт·год' : 'не потрібен';
    $('#rProd').textContent = nf(prod) + ' кВт·год';
    $('#rSave').textContent = money(saving);
    $('#rPay').textContent = payback ? (payback < 1 ? 'менше року' : '≈ ' + payback.toFixed(1).replace('.', ',') + ' р.') : '—';

    // діаграма по місяцях
    const sum = CONFIG.season.reduce((a, b) => a + b, 0);
    const months = CONFIG.season.map(k => prod / 12 * k * 12 / sum);
    const top = Math.max(...months, monthly) * 1.08;
    $('#rBars').innerHTML = months.map(v => `<i style="height:${(v / top * 100).toFixed(1)}%" title="${nf(v)} кВт·год"></i>`).join('')
      + `<div class="cr-line" style="bottom:${(monthly / top * 100).toFixed(1)}%"></div>`;
    if (!$('#rMonths').children.length) $('#rMonths').innerHTML = 'СЛБКТЧЛСВЖЛГ'.split('').map(m => `<span>${m}</span>`).join('');

    last = `Розрахунок із калькулятора СЕС: споживання ${nf(monthly)} кВт·год/міс, ${type === 'hybrid' ? 'гібридна' : 'мережева'} станція ${kwp.toFixed(2).replace(/\.?0+$/, '')} кВт (${panels} панелей), інвертор ${invKw} кВт`
      + (batt ? `, акумулятор ${batt} кВт·год` : '') + `. Орієнтовна вартість ${money(r1000(total * CONFIG.low))} – ${money(r1000(total * CONFIG.high))}.`;
  }
  $('#rCta').addEventListener('click', () => { try { sessionStorage.setItem('solar-calc-msg', last); } catch (e) {} });
  calc();
})();
