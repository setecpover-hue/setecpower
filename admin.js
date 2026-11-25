(() => {
  const $ = s => document.querySelector(s);
  const KEY='solar-admin-products-v1', CALC_KEY='solar-admin-calculator-v1';
  const defaults=window.PRODUCTS.map(p=>({...p,specs:(p.specs||[]).map(x=>[...x]),options:p.options?{...p.options,values:[...p.options.values]}:undefined}));
  const cats=window.CATEGORIES, CAT_KEY=window.CategoryStore.KEY, KINDS=window.CategoryStore.KINDS;
  const catById=id=>cats.find(c=>c.id===id);
  const catLabel=id=>(catById(id)||{}).label||'';
  const catKind=id=>(catById(id)||{}).icon||'other';
  let products=loadProducts(), selected=null, pendingImage='';
  function loadProducts(){try{const v=JSON.parse(localStorage.getItem(KEY)||'null');return Array.isArray(v)?v:defaults.map(p=>({...p}));}catch(e){return defaults.map(p=>({...p}));}}
  function save(){localStorage.setItem(KEY,JSON.stringify(products));}
  function saveCats(){localStorage.setItem(CAT_KEY,JSON.stringify(cats));}
  function safe(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  function money(p){return p.price==null?'За запитом':Number(p.price).toLocaleString('uk-UA')+' грн';}
  function drawList(){const q=$('#adminSearch').value.trim().toLocaleLowerCase('uk');$('#productCount').textContent='('+products.length+')';const root=$('#adminProductList');const arr=products.filter(p=>(p.name+' '+(p.short||'')).toLocaleLowerCase('uk').includes(q));root.innerHTML=arr.map(p=>`<button class="admin-product-row ${p.id===selected?'active':''}" data-id="${safe(p.id)}" type="button">${p.image?`<img src="${safe(p.image)}" alt="">`:'<span class="admin-thumb">☼</span>'}<span><b>${safe(p.name)}</b><small>${safe(catLabel(p.category)||p.categoryLabel||'')}</small></span><span class="row-price">${safe(money(p))}</span></button>`).join('')||'<p class="field-hint">Товарів не знайдено.</p>';root.querySelectorAll('[data-id]').forEach(b=>b.addEventListener('click',()=>edit(b.dataset.id)));}
  function reset(){selected=null;pendingImage='';$('#productForm').reset();$('#pId').value='';$('#pImage').value='';$('#imagePreview').textContent='Фото не вибрано';$('#formTitle').textContent='Новий товар';$('#deleteProduct').hidden=true;drawList();}
  function edit(id){const p=products.find(x=>x.id===id);if(!p)return;selected=id;pendingImage=p.image||'';$('#pId').value=p.id;$('#pName').value=p.name;$('#pCategory').value=p.category;$('#pPrice').value=p.price??'';$('#pShort').value=p.short||'';$('#pDesc').value=p.desc||'';$('#pSpecs').value=(p.specs||[]).map(x=>x[0]+': '+x[1]).join('\n');$('#pHit').checked=!!p.hit;$('#pRank').value=p.rank??'';$('#pImage').value=p.image||'';showImage(p.image);$('#formTitle').textContent='Редагування товару';$('#deleteProduct').hidden=false;$('#productMessage').textContent='';drawList();}
  function showImage(src){const box=$('#imagePreview');box.innerHTML=src?`<img src="${safe(src)}" alt="Попередній перегляд">`:'Фото не вибрано';}
  $('#newProduct').addEventListener('click',reset);$('#resetForm').addEventListener('click',reset);$('#adminSearch').addEventListener('input',drawList);
  $('#pImageFile').addEventListener('change',e=>{const file=e.target.files[0];if(!file)return;if(!file.type.startsWith('image/')){alert('Оберіть файл зображення.');return;}if(file.size>1.8*1024*1024){alert('Фото завелике. Використайте файл до 1,8 МБ.');e.target.value='';return;}const reader=new FileReader();reader.onload=()=>{pendingImage=reader.result;$('#pImage').value=pendingImage;showImage(pendingImage);};reader.readAsDataURL(file);});
  $('#productForm').addEventListener('submit',e=>{e.preventDefault();const name=$('#pName').value.trim();if(!name)return;let id=$('#pId').value||('item-'+Date.now());if(products.some(p=>p.id===id&&p.id!==selected)){id+='-'+Math.floor(Math.random()*1000);}const cat=$('#pCategory').value;const specs=$('#pSpecs').value.split('\n').map(s=>s.trim()).filter(Boolean).map(line=>{const i=line.indexOf(':');return i<0?[line,'']: [line.slice(0,i).trim(),line.slice(i+1).trim()];});const typedRank=$('#pRank').value.trim()===''?undefined:Number($('#pRank').value);const autoRank=window.ProductUtil.rankOf({name,specs});const p={id,category:cat,categoryLabel:catLabel(cat),icon:catKind(cat),name,price:$('#pPrice').value.trim()===''?null:Number($('#pPrice').value),short:$('#pShort').value.trim(),desc:$('#pDesc').value.trim(),specs,hit:$('#pHit').checked,rank:typedRank===autoRank?undefined:typedRank,image:pendingImage||undefined};const i=products.findIndex(x=>x.id===selected);if(i>=0)products[i]=p;else products.unshift(p);try{save();$('#productMessage').textContent='Товар збережено. Відкрийте каталог у цьому браузері, щоб побачити зміни.';edit(id);}catch(err){$('#productMessage').textContent='Не вдалося зберегти. Можливо, фото завелике — стисніть його.';}});
  $('#deleteProduct').addEventListener('click',()=>{if(!selected||!confirm('Видалити цей товар?'))return;products=products.filter(p=>p.id!==selected);save();reset();$('#productMessage').textContent='Товар видалено.';});
  const calcDefaults={panelW:450,panelPrice:3500,mountPrice:450,roofK:{pitched:1,flat:1.6,ground:2.2},invPerKw:{grid:3200,hybrid:5600},batteryPerKwh:12400,usable:.9,cablesPct:.07,workPerKw:2500,yield:{north:1000,center:1100,south:1200},low:.92,high:1.1};
  function fillCalc(){let c={...calcDefaults};try{c={...c,...JSON.parse(localStorage.getItem(CALC_KEY)||'{}')};}catch(e){}const f=$('#calculatorForm');Object.entries({panelW:c.panelW,panelPrice:c.panelPrice,mountPrice:c.mountPrice,batteryPerKwh:c.batteryPerKwh,workPerKw:c.workPerKw,cablesPct:c.cablesPct,usable:c.usable,roof_pitched:c.roofK.pitched,roof_flat:c.roofK.flat,roof_ground:c.roofK.ground,inv_grid:c.invPerKw.grid,inv_hybrid:c.invPerKw.hybrid,yield_north:c.yield.north,yield_center:c.yield.center,yield_south:c.yield.south,low:c.low,high:c.high}).forEach(([k,v])=>{f.elements[k].value=v;});}
  $('#calculatorForm').addEventListener('submit',e=>{e.preventDefault();const f=e.currentTarget, val=n=>Number(f.elements[n].value);const c={panelW:val('panelW'),panelPrice:val('panelPrice'),mountPrice:val('mountPrice'),batteryPerKwh:val('batteryPerKwh'),workPerKw:val('workPerKw'),cablesPct:val('cablesPct'),usable:val('usable'),roofK:{pitched:val('roof_pitched'),flat:val('roof_flat'),ground:val('roof_ground')},invPerKw:{grid:val('inv_grid'),hybrid:val('inv_hybrid')},yield:{north:val('yield_north'),center:val('yield_center'),south:val('yield_south')},low:val('low'),high:val('high')};if(c.low>c.high){$('#calculatorMessage').textContent='Мінімальний коефіцієнт не може бути більшим за максимальний.';return;}localStorage.setItem(CALC_KEY,JSON.stringify(c));$('#calculatorMessage').textContent='Налаштування калькулятора збережено.';});
  $('#resetCalculator').addEventListener('click',()=>{if(!confirm('Повернути стандартні параметри калькулятора?'))return;localStorage.removeItem(CALC_KEY);fillCalc();$('#calculatorMessage').textContent='Відновлено стандартні значення.';});
  $('#exportBtn').addEventListener('click',()=>{const data={version:2,products,categories:cats,calculator:(()=>{try{return JSON.parse(localStorage.getItem(CALC_KEY)||'{}')}catch(e){return {}}})()};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='solar-energy-backup.json';a.click();URL.revokeObjectURL(a.href);});
  $('#importFile').addEventListener('change',async e=>{const file=e.target.files[0];if(!file)return;try{const d=JSON.parse(await file.text());if(!Array.isArray(d.products))throw new Error('bad');products=d.products;save();
      if(Array.isArray(d.categories)){const list=d.categories.filter(c=>c&&c.id&&c.label).map(c=>({id:String(c.id),label:String(c.label),icon:KINDS[c.icon]?c.icon:'other'}));if(list.length){cats.splice(0,cats.length,...list);}}
      products.forEach(p=>{if(p.category&&!catById(p.category))cats.push({id:p.category,label:p.categoryLabel||String(p.category),icon:KINDS[p.icon]?p.icon:'other'});});
      saveCats();fillCategorySelect();drawCats();
      if(d.calculator)localStorage.setItem(CALC_KEY,JSON.stringify(d.calculator));reset();fillCalc();alert('Дані імпортовано.');}catch(err){alert('Не вдалося імпортувати файл. Перевірте формат резервної копії.');}e.target.value='';});
  document.querySelectorAll('.admin-tabs button').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.admin-tabs button').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.admin-panel').forEach(x=>x.classList.toggle('active',x.id==='tab-'+b.dataset.tab));}));
  // ---------- Категорії ----------
  function fillCategorySelect(){const sel=$('#pCategory'),cur=sel.value;sel.innerHTML=cats.map(c=>`<option value="${safe(c.id)}">${safe(c.label)}</option>`).join('');if(cur&&catById(cur))sel.value=cur;}
  function fillKindSelect(){$('#cIcon').innerHTML=Object.entries(KINDS).map(([k,v])=>`<option value="${safe(k)}">${safe(v)}</option>`).join('');}
  const TR={а:'a',б:'b',в:'v',г:'h',ґ:'g',д:'d',е:'e',є:'ie',ж:'zh',з:'z',и:'y',і:'i',ї:'i',й:'i',к:'k',л:'l',м:'m',н:'n',о:'o',п:'p',р:'r',с:'s',т:'t',у:'u',ф:'f',х:'kh',ц:'ts',ч:'ch',ш:'sh',щ:'shch',ь:'',ю:'iu',я:'ia',ы:'y',э:'e',ё:'e',ъ:''};
  const slug=n=>n.toLowerCase().split('').map(ch=>TR[ch]??ch).join('').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
  let selCat=null;
  const catMsg=t=>{$('#categoryMessage').textContent=t;};
  function drawCats(){
    $('#categoryCount').textContent='('+cats.length+')';
    const root=$('#adminCategoryList');
    root.innerHTML=cats.map(c=>{const n=products.filter(p=>p.category===c.id).length;const svg=window.ProductUtil.art({icon:c.icon}).replace('<svg','<svg width="28" height="28"');return `<button class="admin-product-row ${c.id===selCat?'active':''}" data-cid="${safe(c.id)}" type="button"><span class="admin-thumb">${svg}</span><span><b>${safe(c.label)}</b><small>${safe(KINDS[c.icon]||'')}</small></span><span class="row-price">${n} тов.</span></button>`;}).join('');
    root.querySelectorAll('[data-cid]').forEach(b=>b.addEventListener('click',()=>editCat(b.dataset.cid)));
  }
  function resetCat(){selCat=null;$('#categoryForm').reset();$('#catFormTitle').textContent='Нова категорія';$('#deleteCategory').hidden=true;$('#catUp').hidden=$('#catDown').hidden=true;drawCats();}
  function editCat(id){const c=catById(id);if(!c)return;selCat=id;$('#cName').value=c.label;$('#cIcon').value=c.icon;$('#catFormTitle').textContent='Редагування категорії';$('#deleteCategory').hidden=false;$('#catUp').hidden=$('#catDown').hidden=false;catMsg('');drawCats();}
  function afterCatChange(){saveCats();fillCategorySelect();drawList();drawCats();}
  $('#newCategory').addEventListener('click',()=>{resetCat();catMsg('');});$('#resetCategory').addEventListener('click',()=>{resetCat();catMsg('');});
  $('#categoryForm').addEventListener('submit',e=>{
    e.preventDefault();const label=$('#cName').value.trim(),icon=$('#cIcon').value;if(!label)return;
    if(cats.some(c=>c.id!==selCat&&c.label.toLocaleLowerCase('uk')===label.toLocaleLowerCase('uk'))){catMsg('Категорія з такою назвою вже існує.');return;}
    if(selCat){const c=catById(selCat);c.label=label;c.icon=icon;products.forEach(p=>{if(p.category===c.id){p.categoryLabel=label;p.icon=icon;}});try{save();}catch(err){}}
    else{const base=slug(label)||'category';let id=base,n=2;while(catById(id))id=base+'-'+(n++);cats.push({id,label,icon});selCat=id;}
    afterCatChange();editCat(selCat);catMsg('Категорію збережено. Відкрийте каталог у цьому браузері, щоб побачити зміни.');
  });
  $('#deleteCategory').addEventListener('click',()=>{
    const c=catById(selCat);if(!c)return;const n=products.filter(p=>p.category===c.id).length;
    if(n){catMsg('Не можна видалити: у категорії є товари ('+n+'). Спочатку перенесіть їх в іншу категорію або видаліть.');return;}
    if(cats.length<=1){catMsg('Має залишитися хоча б одна категорія.');return;}
    if(!confirm('Видалити категорію «'+c.label+'»?'))return;
    cats.splice(cats.indexOf(c),1);afterCatChange();resetCat();catMsg('Категорію видалено.');
  });
  function moveCat(d){const i=cats.findIndex(c=>c.id===selCat),j=i+d;if(i<0||j<0||j>=cats.length)return;[cats[i],cats[j]]=[cats[j],cats[i]];afterCatChange();}
  $('#catUp').addEventListener('click',()=>moveCat(-1));$('#catDown').addEventListener('click',()=>moveCat(1));
  fillCategorySelect();fillKindSelect();drawCats();resetCat();
  $('#catUp').hidden=$('#catDown').hidden=true;
  drawList();fillCalc();
})();
