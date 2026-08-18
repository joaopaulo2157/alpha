/* ============================================================
   ALFA SUPLEMENTOS V7 — COMMERCE INTELLIGENCE + EXPERIÊNCIA PREMIUM
   ============================================================ */
(()=>{
'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const STORE_KEY='alfa_v4_store', CART_KEY='alfa_v2_cart', CART_TOUCH='alfa_v7_cart_touch';
const store=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
const cart=()=>{try{return JSON.parse(localStorage.getItem(CART_KEY)||'[]')}catch{return []}};
const money=v=>(Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const vis=p=>p?.image?`<img src="${p.image}" alt="${p.name}">`:`<div class="v7-mini-pack v7-mini-pack--${p?.pack||'orange'}"><span>ALFA</span><b>${(p?.category||'PRO').slice(0,4).toUpperCase()}</b></div>`;

function heroRotation(){
 const stage=$('.hero-stage'),name=$('#v7HeroProductName'),price=$('#v7HeroProductPrice'),dots=$('#v7HeroDots');if(!stage||!name||!price||!dots)return;
 const items=(store().products||[]).filter(p=>p.featured&&p.stock>0).slice(0,5);if(!items.length)return;let idx=0,timer;
 dots.innerHTML=items.map((_,i)=>`<button data-v7-dot="${i}" aria-label="Destaque ${i+1}"></button>`).join('');
 const paint=(i,dir=1)=>{idx=(i+items.length)%items.length;const p=items[idx];stage.classList.remove('v7-swap-in');stage.classList.add('v7-swap-out');setTimeout(()=>{name.textContent=p.name;price.textContent=money(p.price);stage.dataset.v7Pack=p.pack||'orange';stage.dataset.v7Category=p.category||'';const label=$('.hero-pack__label');if(label){label.innerHTML=`<small>ALFA</small><b>${p.category==='Creatinas'?'CREA':p.category==='Pré-treinos'?'FIRE':p.category==='Vitaminas'?'VITA':p.category==='Hipercalóricos'?'MASS':'WHEY'}</b><em>${p.brand||'PERFORMANCE'}</em>`;}$$('[data-v7-dot]').forEach((d,n)=>d.classList.toggle('active',n===idx));stage.classList.remove('v7-swap-out');stage.classList.add('v7-swap-in');},180);};
 const restart=()=>{clearInterval(timer);timer=setInterval(()=>paint(idx+1),5200)};$('#v7HeroPrev').onclick=()=>{paint(idx-1,-1);restart()};$('#v7HeroNext').onclick=()=>{paint(idx+1);restart()};$$('[data-v7-dot]').forEach(d=>d.onclick=()=>{paint(Number(d.dataset.v7Dot));restart()});paint(0);restart();
}

function touchCart(){if(cart().length)localStorage.setItem(CART_TOUCH,String(Date.now()))}
function cartRecovery(){
 const c=cart(),box=$('#v7Recovery');if(!c.length||!box)return;const cfg=store().settings||{},hours=Number(cfg.cartRecoveryHours||48),last=Number(localStorage.getItem(CART_TOUCH)||0);if(!last){touchCart();return}const age=(Date.now()-last)/36e5;if(age<.05||age>hours)return;const qty=c.reduce((s,i)=>s+Number(i.qty||0),0);$('#v7RecoveryText').textContent=`Você deixou ${qty} ${qty===1?'item':'itens'} no carrinho.`;box.hidden=false;requestAnimationFrame(()=>box.classList.add('show'));$('#v7RecoveryOpen').onclick=()=>{document.querySelector('#cartButton')?.click();box.classList.remove('show')};$('#v7RecoveryClose').onclick=()=>box.classList.remove('show');
}
function observeCartTouch(){const count=$('#cartCount');if(!count)return;new MutationObserver(()=>touchCart()).observe(count,{childList:true,subtree:true});}

function buyTogether(){
 const host=$('#v7BuyTogether');if(!host)return;const c=cart();if(!c.length){host.innerHTML='';return}const st=store(),ids=new Set(c.map(i=>Number(i.id))),cats=new Set(c.map(i=>st.products?.find(p=>Number(p.id)===Number(i.id))?.category));let rec=(st.products||[]).filter(p=>p.stock>0&&!ids.has(Number(p.id)));
 const affinity={'Proteínas':['Creatinas','Snacks','Aminoácidos'],'Creatinas':['Proteínas','Pré-treinos'],'Pré-treinos':['Creatinas','Proteínas'],'Hipercalóricos':['Creatinas','Proteínas'],'Vitaminas':['Snacks','Proteínas'],'Snacks':['Proteínas','Vitaminas']};let preferred=new Set();cats.forEach(c=> (affinity[c]||[]).forEach(x=>preferred.add(x)));rec.sort((a,b)=>(preferred.has(b.category)-preferred.has(a.category))||b.rating-a.rating);rec=rec.slice(0,2);if(!rec.length){host.innerHTML='';return}
 host.innerHTML=`<div class="v7-buy-together__head"><span>COMPRE JUNTO</span><b>Complete seu stack</b></div><div class="v7-buy-together__items">${rec.map(p=>`<button data-v7-quick-add="${p.id}">${vis(p)}<span><b>${p.name}</b><small>${money(p.price)}</small></span><i class="fa-solid fa-plus"></i></button>`).join('')}</div>`;
 $$('[data-v7-quick-add]',host).forEach(b=>b.onclick=()=>quickAdd(Number(b.dataset.v7QuickAdd)));
}
function quickAdd(id){const st=store(),p=(st.products||[]).find(x=>Number(x.id)===id);if(!p)return;const c=cart(),flavor=p.flavors?.[0]||'Padrão',size=p.sizes?.[0]||'Padrão',key=`${p.id}|${flavor}|${size}`,existing=c.find(i=>i.key===key);if(existing)existing.qty+=1;else c.push({key,id:p.id,qty:1,flavor,size,unitPrice:p.price,comboId:null});localStorage.setItem(CART_KEY,JSON.stringify(c));localStorage.setItem(CART_TOUCH,String(Date.now()));window.dispatchEvent(new CustomEvent('alfa:v7-cart-updated'));location.reload();}

function paymentUI(){
 const cfg=store().settings||{},badge=$('#v7PixBadge');if(badge)badge.textContent=`−${Number(cfg.pixDiscountPercent||5)}%`;const hint=$('#v7PaymentHint');
 $$('[data-payment]').forEach(b=>b.addEventListener('click',()=>{if(hint)hint.textContent=b.dataset.payment==='pix'?`Preferência PIX selecionada. O desconto visual é de ${Number(cfg.pixDiscountPercent||5)}%; a loja confirma chave e pagamento no WhatsApp.`:'Forma de pagamento será combinada com o atendente no WhatsApp.';}));
}

function productExtras(){
 if(!document.body.classList.contains('product-page'))return;const st=store(),params=new URLSearchParams(location.search),p=(st.products||[]).find(x=>Number(x.id)===Number(params.get('id')))||st.products?.[0];if(!p)return;const content=$('#v7ProductTabContent');if(!content)return;const tabs={descricao:`<h3>Sobre ${p.name}</h3><p>${p.longDescription||p.description||''}</p><div class="v7-detail-specs"><span><b>Marca</b>${p.brand||'Alfa'}</span><span><b>Categoria</b>${p.category}</span><span><b>SKU</b>${p.sku||'-'}</span><span><b>Estoque</b>${p.stock} un.</span></div>`,beneficios:`<h3>Benefícios destacados</h3><div class="v7-benefit-list">${(p.benefits||[]).map(x=>`<span><i class="fa-solid fa-check"></i>${x}</span>`).join('')}</div><p class="v7-disclaimer">Consulte o rótulo e um profissional habilitado para orientações individualizadas de uso.</p>`,entrega:`<h3>Compra assistida</h3><p>Adicione ao carrinho, escolha suas variações e envie o pedido para o WhatsApp da Alfa. O atendente confirma estoque, entrega e pagamento.</p><div class="v7-detail-steps"><span>1<b>Escolha</b></span><span>2<b>Adicione</b></span><span>3<b>Envie</b></span><span>4<b>Confirme</b></span></div>`};
 const paint=k=>{content.innerHTML=tabs[k];$$('[data-v7-tab]').forEach(b=>b.classList.toggle('active',b.dataset.v7Tab===k))};$$('[data-v7-tab]').forEach(b=>b.onclick=()=>paint(b.dataset.v7Tab));paint('descricao');
 const affinity={'Proteínas':['Creatinas','Snacks'],'Creatinas':['Proteínas','Pré-treinos'],'Pré-treinos':['Creatinas','Proteínas'],'Hipercalóricos':['Creatinas','Proteínas'],'Vitaminas':['Snacks'],'Snacks':['Proteínas']};let rec=(st.products||[]).filter(x=>x.id!==p.id&&x.stock>0&&(affinity[p.category]||[]).includes(x.category)).slice(0,3);$('#v7ProductBundle').innerHTML=rec.map(x=>`<a href="produto.html?id=${x.id}">${vis(x)}<span><b>${x.name}</b><small>${money(x.price)}</small></span><i class="fa-solid fa-arrow-right"></i></a>`).join('')||'<span class="v7-empty-bundle">Explore os produtos relacionados abaixo.</span>';
}

function sectionSceneEvolution(){
 const phases=[...document.querySelectorAll('[data-evolution-phase]')];if(!phases.length)return;const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){document.documentElement.dataset.v7Phase=e.target.dataset.evolutionPhase||'focus';}}),{rootMargin:'-35% 0px -35% 0px'});phases.forEach(x=>io.observe(x));
}
function init(){heroRotation();cartRecovery();observeCartTouch();buyTogether();paymentUI();productExtras();sectionSceneEvolution();window.addEventListener('alfa:v7-cart-updated',buyTogether)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,140));else setTimeout(init,140);
})();
