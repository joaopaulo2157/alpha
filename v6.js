/* ============================================================
   ALFA SUPLEMENTOS V6 — EXPERIÊNCIA CINEMATOGRÁFICA E ADAPTATIVA
   ============================================================ */
(()=>{
'use strict';
const $=(s,c=document)=>c.querySelector(s), $$=(s,c=document)=>[...c.querySelectorAll(s)];
const STORE_KEY='alfa_v4_store', PROFILE_KEY='alfa_v6_profile', RECENT_KEY='alfa_v6_recent';
const getStore=()=>{try{return JSON.parse(localStorage.getItem(STORE_KEY)||'{}')}catch{return {}}};
const getProfile=()=>{try{return JSON.parse(localStorage.getItem(PROFILE_KEY)||'{}')}catch{return {}}};
const saveProfile=p=>localStorage.setItem(PROFILE_KEY,JSON.stringify(p));
const money=v=>(Number(v)||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const productVisual=p=>window.productVisual?window.productVisual(p):`<div class="v6-fallback-product"><i class="fa-solid fa-jar"></i></div>`;

function cinematicHero(){
 const hero=$('.hero'); if(!hero)return;
 const fx=document.createElement('div'); fx.className='v6-cinema';
 fx.innerHTML='<i class="v6-cinema__beam"></i><i class="v6-cinema__beam"></i><i class="v6-cinema__beam"></i>';
 for(let i=0;i<18;i++){const d=document.createElement('b');d.className='v6-cinema__dust';d.style.setProperty('--left',`${Math.random()*100}%`);d.style.setProperty('--dur',`${7+Math.random()*9}s`);d.style.setProperty('--drift',`${-60+Math.random()*120}px`);d.style.animationDelay=`${-Math.random()*12}s`;fx.appendChild(d)}
 hero.prepend(fx);
 const veil=document.createElement('div');veil.className='v6-scene-veil';document.body.prepend(veil);
 let mx=0,my=0,targetX=0,targetY=0;
 const update=()=>{mx+=(targetX-mx)*.08;my+=(targetY-my)*.08;document.documentElement.style.setProperty('--mx',mx.toFixed(3));document.documentElement.style.setProperty('--my',my.toFixed(3));requestAnimationFrame(update)};update();
 window.addEventListener('pointermove',e=>{targetX=(e.clientX/innerWidth-.5)*2;targetY=(e.clientY/innerHeight-.5)*2;document.documentElement.style.setProperty('--v6-x',`${e.clientX}px`);document.documentElement.style.setProperty('--v6-y',`${e.clientY}px`)},{passive:true});
 window.addEventListener('scroll',()=>{const max=Math.max(1,document.documentElement.scrollHeight-innerHeight);document.documentElement.style.setProperty('--v6-scroll',(scrollY/max).toFixed(4))},{passive:true});
}

function addSectionGates(){ $$('.section').forEach(s=>{if(s.querySelector('.v6-section-gate'))return;const g=document.createElement('i');g.className='v6-section-gate';s.style.position=s.style.position||'relative';s.prepend(g)}) }

function tiltCards(){
 const cards=$$('.product-card,.goal-card,.combo-card,.v6-journey-card');
 cards.forEach(card=>{
  if(card.dataset.v6Tilt)return;card.dataset.v6Tilt='1';card.classList.add('v6-tilt');
  const glare=document.createElement('i');glare.className='v6-card-glare';card.appendChild(glare);
  card.addEventListener('pointermove',e=>{if(matchMedia('(max-width:640px)').matches)return;const r=card.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height;card.style.setProperty('--gx',`${x*100}%`);card.style.setProperty('--gy',`${y*100}%`);card.style.transform=`perspective(850px) rotateX(${(0.5-y)*8}deg) rotateY(${(x-0.5)*10}deg) translateY(-3px)`});
  card.addEventListener('pointerleave',()=>card.style.transform='');
 });
}

function profileEvent(type,value){
 const p=getProfile();p.events=p.events||{};p.events[type]=(p.events[type]||0)+1;if(value){p.interests=p.interests||{};p.interests[value]=(p.interests[value]||0)+1}p.updatedAt=Date.now();saveProfile(p);updateProfileUI();
}
function profileScore(){const p=getProfile(),e=p.events||{};return Math.min(100,12+(e.product||0)*7+(e.goal||0)*12+(e.compare||0)*10+(e.favorite||0)*6+(e.cart||0)*9+(e.search||0)*4)}
function dominantInterest(){const p=getProfile(),entries=Object.entries(p.interests||{});return entries.sort((a,b)=>b[1]-a[1])[0]?.[0]||''}
function updateProfileUI(){
 const score=profileScore(),dom=dominantInterest(); if($('#v6ProfilePercent'))$('#v6ProfilePercent').textContent=`${score}%`;if($('#v6ProfileBar'))$('#v6ProfileBar').style.width=`${score}%`;
 const text=score<30?'Navegue pelo catálogo para gerar recomendações mais personalizadas.':score<65?`Já entendemos parte do seu interesse${dom?` em ${dom}`:''}. Continue explorando para refinar o perfil.`:`Seu perfil Alfa está bem definido${dom?` com maior interesse em ${dom}`:''}. O catálogo agora pode priorizar escolhas mais próximas do seu comportamento.`;if($('#v6ProfileText'))$('#v6ProfileText').textContent=text;
 if($('#v6ProfileHint'))$('#v6ProfileHint').textContent=score>=65?'Personalização avançada ativa.':'Explore produtos, objetivos e comparações.';
}
function matchScore(p){
 let score=62;const dom=dominantInterest().toLowerCase();if(dom&&(`${p.category} ${p.name} ${p.brand||''}`).toLowerCase().includes(dom))score+=18;if(p.bestseller)score+=6;if(p.rating>=4.8)score+=7;if(p.stock>0)score+=3;return Math.min(98,score);
}
function injectMatchScores(){ $$('.product-card').forEach(card=>{if(card.querySelector('.v6-match'))return;const id=Number(card.dataset.card||card.dataset.id||card.querySelector('[data-product-id]')?.dataset.productId);if(!id)return;const p=(getStore().products||[]).find(x=>Number(x.id)===id);if(!p)return;const media=card.querySelector('.product-card__media')||card;const badge=document.createElement('span');badge.className='v6-match';badge.innerHTML=`<i class="fa-solid fa-bolt"></i> ALFA MATCH <strong>${matchScore(p)}%</strong>`;media.style.position='relative';media.appendChild(badge)}) }

function recentProduct(id){
 let arr=[];try{arr=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]')}catch{};arr=[id,...arr.filter(x=>x!==id)].slice(0,5);localStorage.setItem(RECENT_KEY,JSON.stringify(arr));profileEvent('product');showRecent();
}
function showRecent(){
 const ids=JSON.parse(localStorage.getItem(RECENT_KEY)||'[]'),store=getStore(),p=store.products?.find(x=>Number(x.id)===Number(ids[0]));if(!p)return;
 let box=$('.v6-recent');if(!box){box=document.createElement('aside');box.className='v6-recent';document.body.appendChild(box)}
 box.innerHTML=`<div class="v6-recent__box"><div class="v6-recent__head"><span>VISTO RECENTEMENTE</span><button aria-label="Fechar">×</button></div><div class="v6-recent__item">${productVisual(p)}<span><b>${p.name}</b><small>${money(p.price)} • abrir novamente</small></span></div></div>`;
 box.querySelector('button').onclick=()=>box.classList.remove('show');box.querySelector('.v6-recent__item').onclick=()=>window.openProduct?.(p.id);setTimeout(()=>box.classList.add('show'),250);
}

function commerceProgress(){
 const sections=[['inicio','Início'],['objetivos','Objetivos'],['produtos','Produtos'],['comparador','Comparar'],['combos','Combos'],['contato','WhatsApp']].filter(([id])=>document.getElementById(id));
 const nav=document.createElement('nav');nav.className='v6-commerce-progress';nav.setAttribute('aria-label','Progresso na loja');nav.innerHTML=sections.map(([id,label])=>`<button data-v6-jump="${id}" title="${label}"></button>`).join('');document.body.appendChild(nav);
 $$('[data-v6-jump]',nav).forEach(b=>b.onclick=()=>document.getElementById(b.dataset.v6Jump)?.scrollIntoView({behavior:'smooth'}));
 const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)$$('[data-v6-jump]',nav).forEach(b=>b.classList.toggle('active',b.dataset.v6Jump===e.target.id))}),{rootMargin:'-44% 0px -44% 0px'});sections.forEach(([id])=>io.observe(document.getElementById(id)));
}

function premiumCart(){
 const footer=$('.cart-footer');if(!footer)return;let el=$('.v6-cart-benefit',footer);if(!el){el=document.createElement('div');el.className='v6-cart-benefit';footer.prepend(el)}
 const update=()=>{const store=getStore(),free=Number(store.settings?.freeDeliveryFrom||199),subtotal=Number(($('#cartSubtotal')?.textContent||'').replace(/[^\d,]/g,'').replace(',','.'))||0,remain=Math.max(0,free-subtotal),pct=Math.min(100,free?subtotal/free*100:100);el.innerHTML=remain>0?`Faltam <b>${money(remain)}</b> para atingir a faixa configurada de frete grátis.<div class="bar" style="--w:${pct}%"><i style="width:${pct}%"></i></div>`:`<b><i class="fa-solid fa-truck-fast"></i> Faixa de frete grátis atingida!</b><div class="bar"><i style="width:100%"></i></div>`};
 const obs=new MutationObserver(update);if($('#cartSubtotal'))obs.observe($('#cartSubtotal'),{childList:true,characterData:true,subtree:true});update();
}

function bindBehavior(){
 document.addEventListener('click',e=>{
  const prod=e.target.closest('[data-product-id],.product-card');if(prod){const id=Number(prod.dataset.productId||prod.dataset.card||prod.dataset.id);if(id)recentProduct(id)}
  if(e.target.closest('.goal-card,[data-goal]'))profileEvent('goal',e.target.closest('[data-goal]')?.dataset.goal||'objetivos');
  if(e.target.closest('[data-compare-id]'))profileEvent('compare');
  if(e.target.closest('.favorite-button,[data-favorite]'))profileEvent('favorite');
  if(e.target.closest('[data-add-cart],.add-cart,.product-card__add,.checkout-button'))profileEvent('cart');
 });
 $('#searchInput')?.addEventListener('change',()=>profileEvent('search'));
}

function observeDynamic(){
 const grid=$('#productGrid');if(!grid)return;let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(()=>{tiltCards();injectMatchScores()},30)}).observe(grid,{childList:true,subtree:true});
}
function sceneTransitions(){
 const journey=$$('[data-v6-scene]');const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){const i=journey.indexOf(e.target);document.documentElement.style.setProperty('--v6-scene',String(i+1));e.target.classList.add('v6-scene-active')}}),{threshold:.55});journey.forEach(x=>io.observe(x));
}
function init(){cinematicHero();addSectionGates();tiltCards();injectMatchScores();updateProfileUI();commerceProgress();premiumCart();bindBehavior();observeDynamic();sceneTransitions();setTimeout(showRecent,900)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(init,100));else setTimeout(init,100);
})();
