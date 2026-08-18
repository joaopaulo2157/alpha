// ============================================================
// ALFA SUPLEMENTOS V2 — EXPERIÊNCIA DA LOJA
// ============================================================

let STORE = window.AlfaStore.load();
const CONFIG = STORE.settings;

const state = {
  filter: "Todos",
  search: "",
  sort: "featured",
  favorites: new Set(JSON.parse(localStorage.getItem("alfa_v2_favorites") || "[]")),
  cart: JSON.parse(localStorage.getItem("alfa_v2_cart") || "[]"),
  coupon: JSON.parse(localStorage.getItem("alfa_v2_coupon") || "null"),
  delivery: JSON.parse(localStorage.getItem("alfa_v2_delivery") || "null"),
  payment: localStorage.getItem("alfa_v7_payment") || "whatsapp",
  favoritesOnly: false
};

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const money = value => new Intl.NumberFormat(CONFIG.locale, { style: "currency", currency: CONFIG.currency }).format(Number(value || 0));
const normalize = text => String(text || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const getProduct = id => STORE.products.find(p => Number(p.id) === Number(id));

function saveState() {
  localStorage.setItem("alfa_v2_cart", JSON.stringify(state.cart));
  localStorage.setItem("alfa_v2_favorites", JSON.stringify([...state.favorites]));
  localStorage.setItem("alfa_v2_coupon", JSON.stringify(state.coupon));
  localStorage.setItem("alfa_v2_delivery", JSON.stringify(state.delivery));
}

function refreshStore() {
  STORE = window.AlfaStore.load();
  Object.assign(CONFIG, STORE.settings);
  hydrateSettings(); renderCategories(); renderLaunches(); renderProducts(); renderCombos(); renderRanking(); renderReviews(); renderCart();
}

function hydrateSettings() {
  $("#heroTitleTop").textContent = CONFIG.heroTitleTop;
  $("#heroTitleOutline").textContent = CONFIG.heroTitleOutline;
  $("#heroTitleAccent").textContent = CONFIG.heroTitleAccent;
  $("#heroSubtitle").textContent = CONFIG.heroSubtitle;
  $("#announcementTrack").innerHTML = `<span>${CONFIG.announcement}</span><span>${CONFIG.announcement}</span><span>${CONFIG.announcement}</span>`;
  $("#instagramLink").href = CONFIG.instagram || "#"; $("#facebookLink").href = CONFIG.facebook || "#";
  const direct = whatsappUrl("Olá! Quero falar com a Alfa Suplementos.");
  [$("#floatingWhatsApp"), $("#footerWhatsApp"), $("#footerWhatsIcon")].forEach(a => a && (a.href = direct));
}

function whatsappUrl(message) { return `https://wa.me/${String(CONFIG.whatsappNumber).replace(/\D/g, "")}?text=${encodeURIComponent(message)}`; }

function productVisual(product, mini = false) {
  if (product.image) return `<img class="product-real-image" src="${product.image}" alt="${product.name}">`;
  const label = product.category === "Creatinas" ? "CREA" : product.category === "Pré-treinos" ? "FIRE" : product.category === "Vitaminas" ? "VITA" : product.category === "Hipercalóricos" ? "MASS" : product.category === "Aminoácidos" ? "AMINO" : product.category === "Snacks" ? "FOOD" : "WHEY";
  return `<div class="product-pack product-pack--${product.pack || "orange"} ${mini ? "product-pack--mini" : ""}"><span>ALFA<b>${label}</b><small>PERFORMANCE</small></span></div>`;
}

function stockLabel(product) {
  if (product.stock <= 0) return `<span class="stock stock--out"><i class="fa-solid fa-circle"></i> Esgotado</span>`;
  if (product.stock <= 7) return `<span class="stock stock--low"><i class="fa-solid fa-circle"></i> Últimas ${product.stock} un.</span>`;
  return `<span class="stock"><i class="fa-solid fa-circle"></i> Em estoque</span>`;
}

function filteredProducts() {
  let list = [...STORE.products];
  if (state.filter !== "Todos") list = list.filter(p => p.category === state.filter);
  if (state.favoritesOnly) list = list.filter(p => state.favorites.has(Number(p.id)));
  if (state.search.trim()) {
    const q = normalize(state.search.trim());
    list = list.filter(p => normalize(`${p.name} ${p.brand} ${p.category} ${p.description}`).includes(q));
  }
  const sorters = {
    bestseller: (a,b) => Number(b.bestseller)-Number(a.bestseller) || b.reviewsCount-a.reviewsCount,
    launch: (a,b) => Number(b.launch)-Number(a.launch), priceAsc: (a,b) => a.price-b.price, priceDesc: (a,b) => b.price-a.price,
    rating: (a,b) => b.rating-a.rating, name: (a,b) => a.name.localeCompare(b.name,"pt-BR"), featured: (a,b) => Number(b.featured)-Number(a.featured) || Number(b.bestseller)-Number(a.bestseller)
  };
  return list.sort(sorters[state.sort] || sorters.featured);
}

function renderCategories() {
  const icons = { "Proteínas":"fa-dumbbell", "Creatinas":"fa-flask", "Pré-treinos":"fa-bolt", "Vitaminas":"fa-capsules", "Hipercalóricos":"fa-weight-hanging", "Aminoácidos":"fa-dna", "Snacks":"fa-cookie-bite" };
  const cats = [...new Set(STORE.products.map(p => p.category))];
  $("#categoryGrid").innerHTML = cats.map(cat => `<button class="category-card reveal" data-category="${cat}"><span class="category-card__icon"><i class="fa-solid ${icons[cat] || "fa-box"}"></i></span><span><b>${cat}</b><small>${STORE.products.filter(p=>p.category===cat).length} produtos</small></span><i class="fa-solid fa-arrow-right"></i></button>`).join("");
  $("#filterPills").innerHTML = [`Todos`, ...cats].map(cat => `<button class="filter-pill ${state.filter===cat?"active":""}" data-filter="${cat}">${cat}</button>`).join("");
  $$('[data-category]').forEach(btn => btn.onclick = () => { state.filter = btn.dataset.category; state.favoritesOnly=false; $("#produtos").scrollIntoView({behavior:"smooth"}); renderCategories(); renderProducts(); });
  $$('[data-filter]').forEach(btn => btn.onclick = () => { state.filter=btn.dataset.filter; state.favoritesOnly=false; renderCategories(); renderProducts(); });
}

function cardTemplate(p) {
  const discount = p.oldPrice && p.oldPrice > p.price ? Math.round((1-p.price/p.oldPrice)*100) : 0;
  return `<article class="product-card reveal" data-card="${p.id}"><div class="product-card__media">${p.badge?`<span class="product-badge">${p.badge}</span>`:""}${discount?`<span class="discount-badge">-${discount}%</span>`:""}<button class="product-fav ${state.favorites.has(Number(p.id))?"active":""}" data-favorite="${p.id}"><i class="fa-${state.favorites.has(Number(p.id))?"solid":"regular"} fa-heart"></i></button><button class="quick-view" data-view="${p.id}"><i class="fa-regular fa-eye"></i> Ver detalhes</button>${productVisual(p)}</div><div class="product-card__body"><div class="product-meta"><span>${p.brand}</span><span><i class="fa-solid fa-star"></i> ${Number(p.rating).toFixed(1)} (${p.reviewsCount})</span></div><h3>${p.name}</h3><p>${p.description}</p>${stockLabel(p)}<div class="product-bottom"><div class="product-price">${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:""}<strong>${money(p.price)}</strong><small>ou confirme condições no WhatsApp</small></div><button class="add-cart" data-add="${p.id}" ${p.stock<=0?"disabled":""}><i class="fa-solid fa-plus"></i></button></div></div></article>`;
}

function renderProducts() {
  const list = filteredProducts(); $("#productGrid").innerHTML = list.map(cardTemplate).join(""); $("#emptyProducts").hidden = list.length>0; $("#resultsCount").textContent = `${list.length} ${list.length===1?"produto encontrado":"produtos encontrados"}`; $("#favoriteCount").textContent = state.favorites.size;
  bindProductActions(); observeReveals();
}

function renderLaunches() { const items = STORE.products.filter(p=>p.launch).slice(0,4); $("#launchGrid").innerHTML = items.map((p,i)=>`<article class="launch-card reveal"><div class="launch-number">0${i+1}</div><div class="launch-visual">${productVisual(p,true)}</div><div><span>${p.category}</span><h3>${p.name}</h3><strong>${money(p.price)}</strong><button data-view="${p.id}">Conhecer <i class="fa-solid fa-arrow-right"></i></button></div></article>`).join(""); $$('[data-view]',$("#launchGrid")).forEach(b=>b.onclick=()=>openProductModal(Number(b.dataset.view))); }

function toggleFavorite(id) { state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id); saveState(); renderProducts(); $("#favoriteCount").textContent=state.favorites.size; toast(state.favorites.has(id)?"Adicionado aos favoritos":"Removido dos favoritos","fa-heart"); }

function addToCart(id, options={}) {
  const product=getProduct(id); if(!product || product.stock<=0) return toast("Produto indisponível","fa-circle-xmark");
  const flavor=options.flavor || product.flavors?.[0] || "Padrão", size=options.size || product.sizes?.[0] || "Padrão";
  const key=`${id}|${flavor}|${size}`; const item=state.cart.find(i=>i.key===key);
  if(item) item.qty=Math.min(item.qty+1,product.stock); else state.cart.push({key,id,qty:1,flavor,size,unitPrice:product.price,comboId:options.comboId||null});
  saveState(); renderCart(); toast(`${product.name} adicionado ao carrinho`,`fa-cart-plus`);
}

function bindProductActions() { $$('[data-add]').forEach(b=>b.onclick=()=>addToCart(Number(b.dataset.add))); $$('[data-favorite]').forEach(b=>b.onclick=()=>toggleFavorite(Number(b.dataset.favorite))); $$('[data-view]').forEach(b=>b.onclick=()=>openProductModal(Number(b.dataset.view))); }

function openProductModal(id) {
  const p=getProduct(id); if(!p) return;
  const related=STORE.products.filter(x=>x.category===p.category && x.id!==p.id).slice(0,3);
  $("#productModalContent").innerHTML=`<div class="modal-product"><div class="modal-product__visual">${productVisual(p)}<span class="modal-badge">${p.badge||p.category}</span></div><div class="modal-product__info"><span class="modal-brand">${p.brand} • ${p.sku}</span><h2>${p.name}</h2><div class="modal-rating"><span>${"★".repeat(Math.round(p.rating))}</span> ${p.rating.toFixed(1)} • ${p.reviewsCount} avaliações</div><p>${p.longDescription||p.description}</p>${stockLabel(p)}<div class="variant-grid"><label>Sabor<select id="modalFlavor">${(p.flavors||["Padrão"]).map(v=>`<option>${v}</option>`).join("")}</select></label><label>Tamanho<select id="modalSize">${(p.sizes||["Padrão"]).map(v=>`<option>${v}</option>`).join("")}</select></label></div><div class="modal-benefits">${(p.benefits||[]).map(x=>`<span><i class="fa-solid fa-check"></i>${x}</span>`).join("")}</div><div class="modal-buy"><div>${p.oldPrice?`<del>${money(p.oldPrice)}</del>`:""}<strong>${money(p.price)}</strong></div><button class="btn btn--primary" id="modalAdd" ${p.stock<=0?"disabled":""}>ADICIONAR AO CARRINHO <i class="fa-solid fa-cart-plus"></i></button></div><a class="product-page-link" href="produto.html?id=${p.id}">Abrir página completa do produto <i class="fa-solid fa-arrow-right"></i></a></div></div>${related.length?`<div class="modal-related"><h3>Você também pode gostar</h3><div>${related.map(r=>`<button data-related="${r.id}">${r.name}<b>${money(r.price)}</b></button>`).join("")}</div></div>`:""}`;
  $("#productModal").classList.add("open"); $("#productModal").setAttribute("aria-hidden","false"); document.body.classList.add("no-scroll");
  const add=$("#modalAdd"); if(add) add.onclick=()=>{ addToCart(p.id,{flavor:$("#modalFlavor").value,size:$("#modalSize").value}); closeProductModal(); openCart(); };
  $$('[data-related]').forEach(b=>b.onclick=()=>openProductModal(Number(b.dataset.related)));
}
function closeProductModal(){ $("#productModal").classList.remove("open"); $("#productModal").setAttribute("aria-hidden","true"); document.body.classList.remove("no-scroll"); }

function comboTotal(combo){ const base=combo.productIds.reduce((sum,id)=>sum+(getProduct(id)?.price||0),0); return {base,total:base*(1-combo.discountPercent/100)}; }
function renderCombos(){ $("#comboGrid").innerHTML=STORE.combos.map((c,i)=>{const t=comboTotal(c);return `<article class="combo-card reveal"><div class="combo-card__top"><span>${c.badge}</span><b>-${c.discountPercent}%</b></div><h3>${c.name}</h3><p>${c.description}</p><div class="combo-products">${c.productIds.map(id=>{const p=getProduct(id);return p?`<div>${productVisual(p,true)}<span>${p.name}</span></div>`:""}).join("")}</div><div class="combo-price"><del>${money(t.base)}</del><strong>${money(t.total)}</strong></div><button class="btn btn--primary" data-combo="${c.id}">ADICIONAR COMBO <i class="fa-solid fa-cart-plus"></i></button></article>`}).join(""); $$('[data-combo]').forEach(b=>b.onclick=()=>addCombo(b.dataset.combo)); observeReveals(); }
function addCombo(comboId){ const c=STORE.combos.find(x=>x.id===comboId); if(!c)return; const totals=comboTotal(c); c.productIds.forEach(id=>{const p=getProduct(id); if(!p||p.stock<=0)return; const key=`${id}|${p.flavors?.[0]||"Padrão"}|${p.sizes?.[0]||"Padrão"}|${comboId}`; state.cart.push({key,id,qty:1,flavor:p.flavors?.[0]||"Padrão",size:p.sizes?.[0]||"Padrão",unitPrice:p.price*(1-c.discountPercent/100),comboId});}); saveState(); renderCart(); openCart(); toast(`Combo ${c.name} adicionado • economia de ${money(totals.base-totals.total)}`,"fa-tags"); }

function renderRanking(){ const list=[...STORE.products].filter(p=>p.bestseller).sort((a,b)=>b.reviewsCount-a.reviewsCount).slice(0,5); $("#ranking").innerHTML=list.map((p,i)=>`<button class="ranking-item reveal" data-view="${p.id}"><b>#${i+1}</b><div class="ranking-thumb">${productVisual(p,true)}</div><span><small>${p.category}</small><strong>${p.name}</strong></span><em>${money(p.price)}</em><i class="fa-solid fa-arrow-right"></i></button>`).join(""); $$('[data-view]',$("#ranking")).forEach(b=>b.onclick=()=>openProductModal(Number(b.dataset.view))); }
function renderReviews(){ $("#reviewsGrid").innerHTML=STORE.reviews.map(r=>`<article class="review-card reveal"><div class="stars">${"★".repeat(r.rating)}</div><p>“${r.text}”</p><div><span>${r.name.charAt(0)}</span><b>${r.name}<small>${r.product}</small></b></div></article>`).join(""); observeReveals(); }

function cartTotals(){
 const subtotal=state.cart.reduce((s,i)=>s+(Number(i.unitPrice)||getProduct(i.id)?.price||0)*i.qty,0);
 let couponDiscount=0;
 if(state.coupon){const c=STORE.coupons.find(x=>x.code===state.coupon.code&&x.active);if(c&&subtotal>=c.minOrder)couponDiscount=c.type==="percent"?subtotal*c.value/100:Math.min(c.value,subtotal);}
 let quantityDiscount=0;
 state.cart.forEach(i=>{const line=(Number(i.unitPrice)||getProduct(i.id)?.price||0)*i.qty;const pct=i.qty>=3?Number(CONFIG.quantityDiscount3||5):i.qty>=2?Number(CONFIG.quantityDiscount2||3):0;quantityDiscount+=line*pct/100;});
 const baseAfter=Math.max(0,subtotal-couponDiscount-quantityDiscount);
 const pixDiscount=state.payment==="pix"?baseAfter*(Number(CONFIG.pixDiscountPercent||5)/100):0;
 const discount=couponDiscount+quantityDiscount;
 const after=Math.max(0,baseAfter-pixDiscount);const delivery=state.delivery?.value??0;
 return {subtotal,discount,couponDiscount,quantityDiscount,pixDiscount,delivery,total:after+delivery,qty:state.cart.reduce((s,i)=>s+i.qty,0)};
}
function renderCart(){ const t=cartTotals(); $("#cartCount").textContent=t.qty; $("#cartItemLabel").textContent=`${t.qty} ${t.qty===1?"item":"itens"}`; $("#cartEmpty").hidden=state.cart.length>0; $("#cartFooter").hidden=state.cart.length===0; $("#cartItems").hidden=state.cart.length===0; $("#cartSubtotal").textContent=money(t.subtotal); $("#cartDiscount").textContent=`− ${money(t.discount)}`; $("#cartDelivery").textContent=money(t.delivery); $("#checkoutTotal").textContent=money(t.total); $("#checkoutButtonTotal").textContent=money(t.total); const pixRow=$("#v7PixDiscountRow"),pixVal=$("#v7PixDiscount");if(pixRow){pixRow.hidden=t.pixDiscount<=0;if(pixVal)pixVal.textContent=`− ${money(t.pixDiscount)}`;}
  $("#cartItems").innerHTML=state.cart.map(item=>{const p=getProduct(item.id);if(!p)return"";return `<div class="cart-item"><div class="cart-item__thumb">${productVisual(p,true)}</div><div class="cart-item__info"><h4>${p.name}</h4><small>${item.flavor} • ${item.size}${item.comboId?" • Combo":""}</small><strong>${money((item.unitPrice||p.price)*item.qty)}</strong><div class="qty"><button data-dec="${item.key}">−</button><b>${item.qty}</b><button data-inc="${item.key}">+</button></div></div><button class="remove-item" data-remove="${item.key}"><i class="fa-solid fa-trash"></i></button></div>`}).join("");
  $$('[data-inc]').forEach(b=>b.onclick=()=>updateQty(b.dataset.inc,1)); $$('[data-dec]').forEach(b=>b.onclick=()=>updateQty(b.dataset.dec,-1)); $$('[data-remove]').forEach(b=>b.onclick=()=>removeItem(b.dataset.remove)); if(state.coupon) $("#couponInput").value=state.coupon.code; if(state.delivery) $("#deliveryFeedback").textContent=`CEP ${state.delivery.cep} • estimativa ${money(state.delivery.value)}`;
}
function updateQty(key,d){ const i=state.cart.find(x=>x.key===key); if(!i)return; const p=getProduct(i.id); i.qty=Math.max(0,Math.min(i.qty+d,p?.stock||99)); if(i.qty===0)state.cart=state.cart.filter(x=>x.key!==key); saveState();renderCart(); }
function removeItem(key){state.cart=state.cart.filter(i=>i.key!==key);saveState();renderCart();toast("Item removido","fa-trash");}

function applyCoupon(){ const code=$("#couponInput").value.trim().toUpperCase(); const c=STORE.coupons.find(x=>x.code===code&&x.active); const subtotal=cartTotals().subtotal; if(!c){state.coupon=null; $("#couponFeedback").textContent="Cupom inválido ou inativo."; $("#couponFeedback").className="coupon-feedback error";}else if(subtotal<c.minOrder){state.coupon=null;$("#couponFeedback").textContent=`Pedido mínimo de ${money(c.minOrder)} para este cupom.`;$("#couponFeedback").className="coupon-feedback error";}else{state.coupon={code:c.code};$("#couponFeedback").textContent=`Cupom ${c.code} aplicado: ${c.label}.`;$("#couponFeedback").className="coupon-feedback success";toast("Cupom aplicado!","fa-ticket");} saveState();renderCart(); }
function calculateDelivery(){ let cep=$("#cepInput").value.replace(/\D/g,""); if(cep.length!==8)return toast("Digite um CEP com 8 números","fa-location-dot"); const subtotal=cartTotals().subtotal; const value=subtotal>=Number(CONFIG.freeDeliveryFrom||0)?0:Number(CONFIG.deliveryBase||0)+((Number(cep.slice(-1))%4)*2); state.delivery={cep:`${cep.slice(0,5)}-${cep.slice(5)}`,value}; saveState(); renderCart(); $("#deliveryFeedback").textContent=value===0?"Entrega estimada grátis para este pedido.":`Estimativa: ${money(value)} • confirmação no WhatsApp.`; toast("Estimativa de entrega calculada","fa-truck-fast"); }

function buildOrderCode(){ const prefix=(CONFIG.orderPrefix||"ALFA").replace(/[^A-Z0-9]/gi,"").toUpperCase()||"ALFA"; const now=new Date(); const date=`${String(now.getFullYear()).slice(-2)}${String(now.getMonth()+1).padStart(2,"0")}${String(now.getDate()).padStart(2,"0")}`; const seq=String((STORE.orders?.length||0)+1).padStart(4,"0"); return `${prefix}-${date}-${seq}`; }
function upsertCustomer(customer, order){ STORE.customers=STORE.customers||[]; const phone=(customer.phone||"").replace(/\D/g,""); let item=STORE.customers.find(c=>(c.phone||"").replace(/\D/g,"")===phone && phone); if(!item && customer.email) item=STORE.customers.find(c=>(c.email||"").toLowerCase()===customer.email.toLowerCase()); if(item){ item.name=customer.name||item.name; item.phone=customer.phone||item.phone; item.email=customer.email||item.email; item.city=customer.city||item.city; item.orders=(item.orders||0)+1; item.totalSpent=Number(item.totalSpent||0)+Number(order.total||0); item.lastOrderAt=order.createdAt; } else { STORE.customers.unshift({id:Date.now(),...customer,orders:1,totalSpent:order.total,lastOrderAt:order.createdAt,createdAt:order.createdAt}); } }
function persistCheckoutOrder(customer,t){ STORE.orders=STORE.orders||[]; const code=buildOrderCode(); const order={ id:Date.now(), code, createdAt:new Date().toISOString(), updatedAt:new Date().toISOString(), status:"whatsapp", paymentStatus:"pending", stockApplied:false, customer, items:state.cart.map(i=>{const p=getProduct(i.id);return {productId:i.id,sku:p?.sku||"",name:p?.name||"Produto",flavor:i.flavor,size:i.size,qty:i.qty,unitPrice:Number(i.unitPrice||p?.price||0),comboId:i.comboId||null};}), subtotal:t.subtotal,discount:t.discount,delivery:t.delivery,total:t.total,coupon:state.coupon?.code||null,deliveryInfo:state.delivery||null,note:customer.note||"",paymentPreference:state.payment||"whatsapp", source:"site-whatsapp" }; STORE.orders.unshift(order); upsertCustomer(customer,order); window.AlfaStore.save(STORE); return order; }
function checkout(){ if(!state.cart.length)return; const name=$("#customerName").value.trim(), phone=$("#customerPhone")?.value.trim()||"", email=$("#customerEmail")?.value.trim()||"", city=$("#customerCity").value.trim(), note=$("#customerNote").value.trim(); if(!name)return toast("Informe seu nome para continuar","fa-user"); if(phone.replace(/\D/g,"").length<10)return toast("Informe um WhatsApp válido","fa-phone"); const t=cartTotals(); const customer={name,phone,email,city:city||"Não informado",note}; const order=persistCheckoutOrder(customer,t); window.AlfaCloud?.submitOrder(order).then(r=>{if(r?.localOnly) toast("Pedido salvo neste aparelho; sincronização online pendente","fa-cloud-arrow-up");}); let text=`Olá! Quero finalizar o pedido *${order.code}* na *${CONFIG.storeName}* 🐺🧡\n\n*CLIENTE*\nNome: ${name}\nWhatsApp: ${phone}\n${email?`E-mail: ${email}\n`:""}Cidade/Bairro: ${customer.city}\n${state.delivery?`CEP: ${state.delivery.cep}\n`:""}\n*PEDIDO*\n`; state.cart.forEach((i,idx)=>{const p=getProduct(i.id); text+=`\n${idx+1}. *${p.name}*\n   ${i.flavor} • ${i.size}\n   Qtd: ${i.qty} × ${money(i.unitPrice||p.price)} = *${money((i.unitPrice||p.price)*i.qty)}*${i.comboId?" (combo)":""}\n`;}); text+=`\nSubtotal: *${money(t.subtotal)}*\nDesconto: *${money(t.discount)}*${state.coupon?` (${state.coupon.code})`:""}\n${t.pixDiscount?`Desconto PIX: *${money(t.pixDiscount)}*\n`:""}Preferência de pagamento: *${state.payment==="pix"?"PIX":"Combinar no WhatsApp"}*\nEntrega estimada: *${money(t.delivery)}*\n*TOTAL ESTIMADO: ${money(t.total)}*\n`; if(note)text+=`\nObservação: ${note}\n`; text+=`\nCódigo do pedido: *${order.code}*\nPode confirmar disponibilidade, entrega e forma de pagamento?`; toast(`Pedido ${order.code} registrado`,"fa-receipt"); window.open(whatsappUrl(text),"_blank","noopener"); }

function openCart(){ $("#cartDrawer").classList.add("open"); $("#drawerBackdrop").classList.add("open"); document.body.classList.add("no-scroll"); }
function closeCart(){ $("#cartDrawer").classList.remove("open"); $("#drawerBackdrop").classList.remove("open"); document.body.classList.remove("no-scroll"); }
function openSearch(){ $("#searchOverlay").classList.add("open"); setTimeout(()=>$("#searchInput").focus(),200); }
function closeSearch(){ $("#searchOverlay").classList.remove("open"); }
function toast(message,icon="fa-bolt"){const el=document.createElement("div");el.className="toast";el.innerHTML=`<i class="fa-solid ${icon}"></i><span>${message}</span>`;$("#toastStack").appendChild(el);setTimeout(()=>el.classList.add("show"),20);setTimeout(()=>{el.classList.remove("show");setTimeout(()=>el.remove(),250)},2800);}

function observeReveals(){ const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add("visible")}),{threshold:.12}); $$('.reveal:not(.visible)').forEach(el=>observer.observe(el)); }
function animateCounts(){ $$('[data-count]').forEach(el=>{const end=Number(el.dataset.count);let start=0;const step=Math.max(1,Math.ceil(end/45));const timer=setInterval(()=>{start=Math.min(end,start+step);el.textContent=`${start}+`;if(start>=end)clearInterval(timer)},28)}); }
function createParticles(){ const box=$("#particles"); for(let i=0;i<20;i++){const s=document.createElement("i");s.style.left=`${Math.random()*100}%`;s.style.animationDelay=`${Math.random()*8}s`;s.style.animationDuration=`${8+Math.random()*12}s`;box.appendChild(s);} }
function handleScroll(){ const max=document.documentElement.scrollHeight-innerHeight; $("#pageProgress").style.width=`${max>0?scrollY/max*100:0}%`; $("#header").classList.toggle("scrolled",scrollY>30); }
function magneticButtons(){ $$('.magnetic').forEach(btn=>{btn.addEventListener('mousemove',e=>{const r=btn.getBoundingClientRect();btn.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.08}px)`});btn.addEventListener('mouseleave',()=>btn.style.transform='')}); }

function bindGlobal(){
  $$('[data-payment]').forEach(btn=>btn.addEventListener('click',()=>{state.payment=btn.dataset.payment;localStorage.setItem('alfa_v7_payment',state.payment);$$('[data-payment]').forEach(b=>b.classList.toggle('active',b===btn));renderCart();window.dispatchEvent(new CustomEvent('alfa:v7-payment',{detail:{payment:state.payment}}));}));
  $$('[data-payment]').forEach(b=>b.classList.toggle('active',b.dataset.payment===state.payment));

  $("#cartButton").onclick=openCart; $("#cartClose").onclick=closeCart; $("#drawerBackdrop").onclick=closeCart; $("#searchTrigger").onclick=openSearch; $("#searchClose").onclick=closeSearch;
  $("#searchInput").addEventListener("input",e=>{state.search=e.target.value;renderProducts();}); $("#searchInput").addEventListener("keydown",e=>{if(e.key==="Enter"){closeSearch();$("#produtos").scrollIntoView({behavior:"smooth"})}});
  $("#sortProducts").onchange=e=>{state.sort=e.target.value;renderProducts()}; $("#clearFilters").onclick=()=>{state.filter="Todos";state.search="";state.sort="featured";state.favoritesOnly=false;$("#sortProducts").value="featured";renderCategories();renderProducts()};
  $("#favoritesButton").onclick=()=>{state.favoritesOnly=!state.favoritesOnly;state.filter="Todos";renderCategories();renderProducts();$("#produtos").scrollIntoView({behavior:"smooth"});toast(state.favoritesOnly?"Mostrando favoritos":"Mostrando todos os produtos","fa-heart")};
  $("#applyCoupon").onclick=applyCoupon; $("#calcDelivery").onclick=calculateDelivery; $("#checkoutButton").onclick=checkout; $("#directWhatsApp").onclick=()=>window.open(whatsappUrl("Olá! Quero atendimento da Alfa Suplementos."),"_blank");
  $("#copyCoupon").onclick=async()=>{try{await navigator.clipboard.writeText("ALFA10");toast("Cupom ALFA10 copiado","fa-copy")}catch{toast("Cupom: ALFA10","fa-ticket")}};
  $$('[data-close-modal]').forEach(x=>x.onclick=closeProductModal); document.addEventListener("keydown",e=>{if(e.key==="Escape"){closeCart();closeSearch();closeProductModal()}});
  $("#menuButton").onclick=()=>$("#nav").classList.toggle("open"); $$("#nav a").forEach(a=>a.onclick=()=>$("#nav").classList.remove("open"));
  window.addEventListener("scroll",handleScroll,{passive:true}); window.addEventListener("mousemove",e=>{const g=$("#cursorGlow");g.style.left=`${e.clientX}px`;g.style.top=`${e.clientY}px`});
  $("#cepInput").addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,8);e.target.value=v.length>5?`${v.slice(0,5)}-${v.slice(5)}`:v}); $("#customerPhone")?.addEventListener("input",e=>{let v=e.target.value.replace(/\D/g,"").slice(0,11);e.target.value=v.length>10?`(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`:v.length>6?`(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`:v.length>2?`(${v.slice(0,2)}) ${v.slice(2)}`:v;}); window.addEventListener("alfa:data-updated",refreshStore);
}

function init(){ hydrateSettings(); renderCategories(); renderLaunches(); renderProducts(); renderCombos(); renderRanking(); renderReviews(); renderCart(); bindGlobal(); observeReveals(); animateCounts(); createParticles(); magneticButtons(); handleScroll(); $("#year").textContent=new Date().getFullYear(); }
document.addEventListener("DOMContentLoaded",init);
