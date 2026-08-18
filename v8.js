/* ============================================================
   ALFA SUPLEMENTOS V8 — CUSTOMER EXPERIENCE OS
   Central do cliente • campanhas • tracking • recompra • mobile dock
   ============================================================ */
(()=>{
'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const STORE_KEY='alfa_v4_store', CART_KEY='alfa_v2_cart', FAV_KEY='alfa_v2_favorites';
const money=v=>(Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const store=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
const cart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return []}};
const favs=()=>{try{return JSON.parse(localStorage.getItem(FAV_KEY)||'[]').map(Number)}catch{return []}};
const product=id=>(store().products||[]).find(p=>Number(p.id)===Number(id));
const normPhone=v=>String(v||'').replace(/\D/g,'');
const statusMap={whatsapp:['Pedido enviado','Seu pedido foi enviado para atendimento no WhatsApp.','fa-brands fa-whatsapp'],confirmed:['Confirmado','A loja confirmou o pedido.','fa-solid fa-circle-check'],preparing:['Separando','Seu pedido está sendo separado.','fa-solid fa-box'],out_for_delivery:['Saiu para entrega','Seu pedido está a caminho.','fa-solid fa-motorcycle'],completed:['Concluído','Pedido finalizado. Obrigado por comprar na Alfa!','fa-solid fa-flag-checkered'],cancelled:['Cancelado','Este pedido foi cancelado.','fa-solid fa-ban']};

function toast(msg,icon='fa-bolt'){
 const host=$('#toastStack'); if(!host)return;
 const el=document.createElement('div');el.className='toast show';el.innerHTML=`<i class="fa-solid ${icon}"></i><span>${msg}</span>`;host.appendChild(el);setTimeout(()=>el.classList.remove('show'),2800);setTimeout(()=>el.remove(),3400);
}
function miniVisual(p){return p?.image?`<img src="${p.image}" alt="${p.name}">`:`<div class="v8-mini-pack v8-mini-pack--${p?.pack||'orange'}"><small>ALFA</small><b>${(p?.category||'PRO').slice(0,5).toUpperCase()}</b></div>`}
function activeCampaigns(){
 const st=store(), now=new Date(), day=now.getDay();
 return (st.campaigns||[]).filter(c=>{if(!c.active)return false;if(Array.isArray(c.weekdays)&&c.weekdays.length&&!c.weekdays.map(Number).includes(day))return false;const a=c.startAt?new Date(c.startAt):null,b=c.endAt?new Date(c.endAt):null;if(a&&!isNaN(a)&&now<a)return false;if(b&&!isNaN(b)&&now>b)return false;return true;});
}
function campaignRail(){
 const stage=$('#v8CampaignStage'),dots=$('#v8CampaignDots');if(!stage||!dots)return;const items=activeCampaigns();
 if(!items.length){$('#v8CampaignRail')?.setAttribute('hidden','');return;}let i=0,timer;const sec=Math.max(3,Number(store().settings?.campaignAutoRotateSeconds||7));
 dots.innerHTML=items.map((_,n)=>`<button data-v8-campaign-dot="${n}" aria-label="Campanha ${n+1}"></button>`).join('');
 const paint=n=>{i=(n+items.length)%items.length;const c=items[i];stage.classList.remove('is-enter');stage.classList.add('is-leave');setTimeout(()=>{stage.dataset.theme=c.theme||'orange';stage.innerHTML=`<div class="v8-campaign-copy"><span>${c.tag||'ALFA DESTAQUE'}</span><h2>${c.title}</h2><p>${c.subtitle||''}</p><a class="btn btn--primary" href="${c.target||'#produtos'}">${c.cta||'VER AGORA'} <i class="fa-solid fa-arrow-right"></i></a></div><div class="v8-campaign-art"><div class="v8-campaign-orbit"></div><div class="v8-campaign-jar"><small>ALFA</small><b>V8</b><em>PERFORMANCE</em></div><i class="fa-solid fa-bolt"></i></div>`;$$('[data-v8-campaign-dot]').forEach((d,x)=>d.classList.toggle('active',x===i));stage.classList.remove('is-leave');stage.classList.add('is-enter');},160)};
 const restart=()=>{clearInterval(timer);timer=setInterval(()=>paint(i+1),sec*1000)};$('#v8CampaignPrev').onclick=()=>{paint(i-1);restart()};$('#v8CampaignNext').onclick=()=>{paint(i+1);restart()};$$('[data-v8-campaign-dot]').forEach(d=>d.onclick=()=>{paint(Number(d.dataset.v8CampaignDot));restart()});paint(0);restart();
}
function addItemsToCart(items){
 const c=cart();items.forEach(it=>{const p=product(it.productId||it.id);if(!p||p.stock<=0)return;const flavor=it.flavor||p.flavors?.[0]||'Padrão',size=it.size||p.sizes?.[0]||'Padrão',key=`${p.id}|${flavor}|${size}`,qty=Math.max(1,Number(it.qty||1));const ex=c.find(x=>x.key===key);if(ex)ex.qty+=qty;else c.push({key,id:p.id,qty,flavor,size,unitPrice:Number(p.price),comboId:null});});localStorage.setItem(CART_KEY,JSON.stringify(c));localStorage.setItem('alfa_v7_cart_touch',String(Date.now()));window.dispatchEvent(new CustomEvent('alfa:v7-cart-updated'));toast('Produtos adicionados ao carrinho','fa-cart-plus');setTimeout(()=>location.reload(),450);
}
function localOrdersByPhone(phone){const n=normPhone(phone);return (store().orders||[]).filter(o=>normPhone(o.customer?.phone)===n).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));}
function orderTimeline(order){const orderSteps=['whatsapp','confirmed','preparing','out_for_delivery','completed'];const current=order.status||'whatsapp',idx=orderSteps.indexOf(current);return `<div class="v8-order-timeline">${orderSteps.map((s,i)=>`<span class="${current==='cancelled'?'cancelled':i<=idx?'done':''}"><i></i><b>${statusMap[s][0]}</b></span>`).join('')}</div>`}
function orderCard(o,full=false){const meta=statusMap[o.status]||statusMap.whatsapp;return `<article class="v8-order-card"><div class="v8-order-card__top"><span><small>PEDIDO</small><b>${o.code}</b></span><em class="status-${o.status||'whatsapp'}"><i class="${meta[2]}"></i>${meta[0]}</em></div>${full?orderTimeline(o):''}<div class="v8-order-card__body"><span>${new Date(o.createdAt).toLocaleString('pt-BR')}</span><strong>${money(o.total)}</strong></div>${full?`<p>${meta[1]}</p><div class="v8-order-items">${(o.items||[]).slice(0,5).map(i=>`<span>${i.qty}× ${i.name}<small>${i.flavor||''} ${i.size||''}</small></span>`).join('')}</div><button data-v8-rebuy="${o.id}"><i class="fa-solid fa-rotate-right"></i> COMPRAR NOVAMENTE</button>`:''}</article>`}
async function trackOrder(code,last4){
 const c=String(code||'').trim().toUpperCase(),p4=normPhone(last4).slice(-4);if(!c||p4.length!==4)throw new Error('Informe o código e os 4 últimos números do WhatsApp.');
 const local=(store().orders||[]).find(o=>String(o.code).toUpperCase()===c&&normPhone(o.customer?.phone).endsWith(p4));if(local)return local;
 if(window.AlfaCloud?.trackOrderPublic){const r=await window.AlfaCloud.trackOrderPublic(c,p4);if(r?.order){const x=r.order;return {code:x.code,status:x.status,paymentStatus:x.payment_status,total:x.total,createdAt:x.created_at,updatedAt:x.updated_at,items:[],remote:true};}}
 return null;
}
function accountContent(tab='tracking'){
 const host=$('#v8AccountContent');if(!host)return;$$('[data-v8-account-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v8AccountTab===tab));
 if(tab==='tracking')host.innerHTML=`<div class="v8-track-box"><div><span>RASTREAMENTO SEGURO</span><h3>Consulte seu pedido</h3><p>${store().settings?.customerTrackingHint||'Use o código do pedido e os 4 últimos números do WhatsApp.'}</p></div><form id="v8TrackForm"><label>Código do pedido<input id="v8TrackCode" placeholder="Ex.: ALFA-260818-0001" autocomplete="off"></label><label>4 últimos números do WhatsApp<input id="v8TrackPhone" inputmode="numeric" maxlength="4" placeholder="1234"></label><button class="btn btn--primary">CONSULTAR <i class="fa-solid fa-magnifying-glass"></i></button></form><div id="v8TrackResult"></div></div>`;
 if(tab==='history'){const phone=localStorage.getItem('alfa_v8_customer_phone')||'';host.innerHTML=`<div class="v8-history-head"><div><span>HISTÓRICO NESTE DISPOSITIVO</span><h3>Suas compras</h3></div><div class="v8-phone-lookup"><input id="v8HistoryPhone" inputmode="tel" placeholder="Seu WhatsApp" value="${phone}"><button id="v8LoadHistory">LOCALIZAR</button></div></div><div id="v8HistoryList" class="v8-order-list"></div>`;renderHistory(phone)}
 if(tab==='favorites'){const ids=favs(),list=ids.map(product).filter(Boolean);host.innerHTML=`<div class="v8-fav-head"><span>LISTA DE DESEJOS</span><h3>${list.length} ${list.length===1?'favorito':'favoritos'}</h3></div><div class="v8-fav-grid">${list.length?list.map(p=>`<article>${miniVisual(p)}<div><small>${p.category}</small><b>${p.name}</b><strong>${money(p.price)}</strong></div><button data-v8-fav-add="${p.id}"><i class="fa-solid fa-cart-plus"></i></button></article>`).join(''):'<div class="v8-empty"><i class="fa-regular fa-heart"></i><b>Nenhum favorito ainda</b><span>Use o coração nos produtos para montar sua lista.</span></div>'}</div>`;$$('[data-v8-fav-add]',host).forEach(b=>b.onclick=()=>addItemsToCart([{id:Number(b.dataset.v8FavAdd)}]));}
 bindAccount();
}
function renderHistory(phone){const host=$('#v8HistoryList');if(!host)return;const n=normPhone(phone);if(n.length<10){host.innerHTML='<div class="v8-empty"><i class="fa-solid fa-mobile-screen"></i><b>Informe seu WhatsApp</b><span>Usamos somente para localizar pedidos salvos neste aparelho.</span></div>';return}localStorage.setItem('alfa_v8_customer_phone',phone);const orders=localOrdersByPhone(phone);host.innerHTML=orders.length?orders.map(o=>orderCard(o,true)).join(''):'<div class="v8-empty"><i class="fa-solid fa-receipt"></i><b>Nenhum pedido local encontrado</b><span>Você ainda pode rastrear um pedido específico usando o código.</span></div>';$$('[data-v8-rebuy]',host).forEach(b=>b.onclick=()=>{const o=(store().orders||[]).find(x=>String(x.id)===b.dataset.v8Rebuy);if(o)addItemsToCart(o.items||[])})}
function bindAccount(){
 $('#v8TrackForm')?.addEventListener('submit',async e=>{e.preventDefault();const out=$('#v8TrackResult');out.innerHTML='<div class="v8-loading"><i class="fa-solid fa-circle-notch fa-spin"></i> Consultando...</div>';try{const o=await trackOrder($('#v8TrackCode').value,$('#v8TrackPhone').value);out.innerHTML=o?orderCard(o,true):'<div class="v8-not-found"><i class="fa-solid fa-circle-exclamation"></i><b>Pedido não encontrado</b><span>Confira o código e os 4 últimos números do WhatsApp.</span></div>';$$('[data-v8-rebuy]',out).forEach(b=>b.onclick=()=>{const x=(store().orders||[]).find(q=>String(q.id)===b.dataset.v8Rebuy);if(x)addItemsToCart(x.items||[])})}catch(err){out.innerHTML=`<div class="v8-not-found"><i class="fa-solid fa-triangle-exclamation"></i><b>Não foi possível consultar</b><span>${err.message}</span></div>`}});
 $('#v8LoadHistory')?.addEventListener('click',()=>renderHistory($('#v8HistoryPhone').value));
}
function openAccount(tab='tracking'){const box=$('#v8Account');if(!box)return;box.setAttribute('aria-hidden','false');document.body.classList.add('modal-open');accountContent(tab)}
function closeAccount(){const box=$('#v8Account');if(!box)return;box.setAttribute('aria-hidden','true');document.body.classList.remove('modal-open')}
function accountCenter(){
 $('#v8AccountButton')?.addEventListener('click',()=>openAccount('tracking'));$('#v8MobileAccount')?.addEventListener('click',()=>openAccount('tracking'));$$('[data-v8-open-account]').forEach(b=>b.onclick=()=>openAccount(b.dataset.v8OpenAccount||'tracking'));$$('[data-v8-close-account]').forEach(b=>b.onclick=closeAccount);$$('[data-v8-account-tab]').forEach(b=>b.onclick=()=>accountContent(b.dataset.v8AccountTab));document.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('#v8Account')?.getAttribute('aria-hidden')==='false')closeAccount()});
}
function mobileDock(){if(store().settings?.mobileDockEnabled===false){$('.v8-mobile-dock')?.remove();return}const paint=()=>{const q=cart().reduce((s,i)=>s+Number(i.qty||0),0);if($('#v8DockCartCount'))$('#v8DockCartCount').textContent=q};paint();new MutationObserver(paint).observe($('#cartCount')||document.body,{childList:true,subtree:true});$('#v8MobileCart')?.addEventListener('click',()=>$('#cartButton')?.click());$('#v8MobileSearch')?.addEventListener('click',()=>$('#searchTrigger')?.click());
}
function liveOffer(){const cfg=store().settings||{},box=$('#v8LiveOffer');if(!box||cfg.liveOfferEnabled===false)return;const key='alfa_v8_live_offer_until';let until=Number(localStorage.getItem(key)||0);const dur=Math.max(10,Number(cfg.liveOfferDurationMinutes||90));if(!until||until<Date.now()){until=Date.now()+dur*60000;localStorage.setItem(key,String(until))}const campaign=activeCampaigns()[0];if(campaign)$('#v8LiveOfferTitle').textContent=campaign.tag||campaign.title;box.hidden=false;const tick=()=>{const d=until-Date.now();if(d<=0){box.hidden=true;return}const h=Math.floor(d/36e5),m=Math.floor((d%36e5)/6e4),s=Math.floor((d%6e4)/1000);$('#v8LiveOfferTimer').textContent=`termina em ${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`};tick();setInterval(tick,1000);$('#v8LiveOfferClose').onclick=()=>{box.classList.add('hide');setTimeout(()=>box.hidden=true,250)};
}
function smartSearchEnhance(){
 const input=$('#commandInput'),host=$('#commandResults');if(!input||!host)return;const recent=()=>{try{return JSON.parse(localStorage.getItem('alfa_v8_recent_search')||'[]')}catch{return []}};const save=q=>{if(!q.trim())return;const a=[q.trim(),...recent().filter(x=>x!==q.trim())].slice(0,5);localStorage.setItem('alfa_v8_recent_search',JSON.stringify(a))};input.addEventListener('change',()=>save(input.value));input.addEventListener('keydown',e=>{if(e.key==='Enter')save(input.value)});input.addEventListener('focus',()=>{if(input.value)return;const r=recent();if(r.length)host.insertAdjacentHTML('afterbegin',`<div class="v8-recent-search"><small>BUSCAS RECENTES</small>${r.map(x=>`<button data-v8-search="${x.replace(/"/g,'&quot;')}"><i class="fa-solid fa-clock-rotate-left"></i>${x}</button>`).join('')}</div>`);$$('[data-v8-search]',host).forEach(b=>b.onclick=()=>{input.value=b.dataset.v8Search;input.dispatchEvent(new Event('input',{bubbles:true}))})},{once:true});
}
function checkoutIdentity(){
 const btn=$('#checkoutButton');if(!btn)return;btn.addEventListener('click',()=>{const phone=$('#customerPhone')?.value;if(normPhone(phone).length>=10)localStorage.setItem('alfa_v8_customer_phone',phone)},true);
}
function init(){if(document.body.classList.contains('admin'))return;campaignRail();accountCenter();mobileDock();liveOffer();smartSearchEnhance();checkoutIdentity();window.addEventListener('alfa:data-updated',()=>{campaignRail()})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,220));else setTimeout(init,220);
})();
