// ============================================================
// ALFA SUPLEMENTOS V4 — SINCRONIZAÇÃO SUPABASE + FALLBACK LOCAL
// ============================================================
(() => {
  const cfg = window.ALFA_SUPABASE || {};
  let client = null;
  let syncTimer = null;
  let syncing = false;
  const catalogTypes = ['products','settings','banners','campaigns','coupons','combos','reviews'];
  const status = { configured:false, connected:false, authenticated:false, user:null, lastSync:null, error:null };

  const configured = () => Boolean(cfg.url && cfg.anonKey && window.supabase?.createClient);
  const idOf = (type, item, index) => {
    if (type === 'settings') return 'main';
    return String(item?.id ?? item?.code ?? item?.slug ?? index);
  };
  const safeDispatch = (name, detail={}) => window.dispatchEvent(new CustomEvent(name,{detail}));

  function initClient(){
    status.configured = configured();
    if (!status.configured) return null;
    if (!client) client = window.supabase.createClient(cfg.url, cfg.anonKey, {
      auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}
    });
    return client;
  }

  async function session(){
    const c=initClient(); if(!c) return null;
    const {data,error}=await c.auth.getSession();
    if(error) throw error;
    status.authenticated=Boolean(data.session);
    status.user=data.session?.user||null;
    return data.session;
  }

  async function signIn(email,password){
    const c=initClient(); if(!c) throw new Error('Supabase ainda não configurado.');
    const {data,error}=await c.auth.signInWithPassword({email,password});
    if(error) throw error;
    status.authenticated=true; status.user=data.user; status.connected=true; status.error=null;
    safeDispatch('alfa:cloud-status',{...status});
    return data.user;
  }

  async function signOut(){
    const c=initClient(); if(!c) return;
    await c.auth.signOut(); status.authenticated=false;status.user=null;
    safeDispatch('alfa:cloud-status',{...status});
  }

  async function publicHydrate(){
    const c=initClient(); if(!c) return null;
    try{
      const {data,error}=await c.from('alfa_catalog').select('entity_type,entity_id,payload,updated_at').in('entity_type',catalogTypes);
      if(error) throw error;
      const local=window.AlfaStore.load();
      const grouped={}; for(const r of data||[])(grouped[r.entity_type] ||= []).push(r);
      for(const type of catalogTypes){
        if(type==='settings'){
          const row=(grouped.settings||[]).find(r=>r.entity_id==='main') || (grouped.settings||[])[0];
          if(row?.payload) local.settings={...local.settings,...row.payload};
        } else if(grouped[type]?.length){
          local[type]=grouped[type].map(r=>r.payload);
        }
      }
      local.__cloud={mode:'supabase',lastPulledAt:new Date().toISOString()};
      localStorage.setItem(window.AlfaStore.key,JSON.stringify(local));
      status.connected=true;status.lastSync=new Date().toISOString();status.error=null;
      safeDispatch('alfa:data-updated',local); safeDispatch('alfa:cloud-status',{...status});
      return local;
    }catch(err){status.error=err.message;status.connected=false;safeDispatch('alfa:cloud-status',{...status});console.warn('Alfa Cloud: usando dados locais.',err);return null}
  }

  async function submitOrder(order){
    const c=initClient(); if(!c) return {localOnly:true};
    try{
      const row={id:String(order.id),code:order.code,customer_phone:(order.customer?.phone||'').replace(/\D/g,''),payload:order,updated_at:new Date().toISOString()};
      const {error}=await c.from('alfa_orders').insert(row); if(error) throw error;
      status.connected=true;status.lastSync=new Date().toISOString();status.error=null;safeDispatch('alfa:cloud-status',{...status});
      return {localOnly:false};
    }catch(err){status.error=err.message;safeDispatch('alfa:cloud-status',{...status});console.warn('Pedido ficou salvo localmente e poderá ser sincronizado depois.',err);return {localOnly:true,error:err}}
  }

  async function pullAdminState(){
    const c=initClient(); if(!c) throw new Error('Supabase ainda não configurado.');
    const sess=await session(); if(!sess) throw new Error('Faça login para acessar os dados administrativos na nuvem.');
    const local=window.AlfaStore.load();
    const [cat,ord,cus,mov]=await Promise.all([
      c.from('alfa_catalog').select('entity_type,entity_id,payload,updated_at'),
      c.from('alfa_orders').select('payload,updated_at').order('updated_at',{ascending:false}),
      c.from('alfa_customers').select('payload,updated_at').order('updated_at',{ascending:false}),
      c.from('alfa_stock_movements').select('payload,updated_at').order('updated_at',{ascending:false})
    ]);
    for(const x of [cat,ord,cus,mov]) if(x.error) throw x.error;
    const grouped={}; for(const r of cat.data||[])(grouped[r.entity_type] ||= []).push(r);
    for(const type of catalogTypes){
      if(type==='settings'){
        const row=(grouped.settings||[]).find(r=>r.entity_id==='main') || (grouped.settings||[])[0];
        if(row?.payload)local.settings={...local.settings,...row.payload};
      } else if(grouped[type]?.length)local[type]=grouped[type].map(r=>r.payload);
    }
    if(ord.data?.length)local.orders=ord.data.map(r=>r.payload);
    if(cus.data?.length)local.customers=cus.data.map(r=>r.payload);
    if(mov.data?.length)local.stockMovements=mov.data.map(r=>r.payload);
    local.__cloud={mode:'supabase',lastPulledAt:new Date().toISOString()};
    localStorage.setItem(window.AlfaStore.key,JSON.stringify(local));
    status.connected=true;status.lastSync=new Date().toISOString();status.error=null;
    safeDispatch('alfa:data-updated',local);safeDispatch('alfa:cloud-status',{...status});
    return local;
  }

  async function pushAdminState(data){
    if(syncing)return; const c=initClient(); if(!c)return;
    const sess=await session(); if(!sess)return;
    syncing=true;
    try{
      const rows=[];
      for(const type of catalogTypes){
        if(type==='settings') rows.push({entity_type:'settings',entity_id:'main',payload:data.settings,updated_at:new Date().toISOString()});
        else (data[type]||[]).forEach((item,i)=>rows.push({entity_type:type,entity_id:idOf(type,item,i),payload:item,updated_at:new Date().toISOString()}));
      }
      if(rows.length){const {error}=await c.from('alfa_catalog').upsert(rows,{onConflict:'entity_type,entity_id'});if(error)throw error;}
      if(data.orders?.length){const {error}=await c.from('alfa_orders').upsert(data.orders.map(o=>({id:String(o.id),code:o.code,customer_phone:(o.customer?.phone||'').replace(/\D/g,''),payload:o,updated_at:o.updatedAt||new Date().toISOString()})));if(error)throw error;}
      if(data.customers?.length){const {error}=await c.from('alfa_customers').upsert(data.customers.map(cu=>({id:String(cu.id),phone:(cu.phone||'').replace(/\D/g,''),payload:cu,updated_at:new Date().toISOString()})));if(error)throw error;}
      if(data.stockMovements?.length){const {error}=await c.from('alfa_stock_movements').upsert(data.stockMovements.slice(0,500).map(m=>({id:String(m.id),payload:m,updated_at:m.createdAt||new Date().toISOString()})));if(error)throw error;}
      status.connected=true;status.lastSync=new Date().toISOString();status.error=null;safeDispatch('alfa:cloud-status',{...status});
    }catch(err){status.error=err.message;safeDispatch('alfa:cloud-status',{...status});console.error('Falha ao sincronizar V4:',err)} finally{syncing=false}
  }

  function schedulePush(data, delay=850){
    clearTimeout(syncTimer); syncTimer=setTimeout(()=>pushAdminState(data),delay);
  }

  async function uploadProductImage(file, productId){
    const c=initClient(); if(!c) throw new Error('Supabase não configurado.');
    const sess=await session(); if(!sess) throw new Error('Entre como administrador antes de enviar imagens.');
    const ext=(file.name.split('.').pop()||'webp').toLowerCase().replace(/[^a-z0-9]/g,'');
    const path=`products/${productId}-${Date.now()}.${ext}`;
    const {error}=await c.storage.from(cfg.productBucket||'product-images').upload(path,file,{cacheControl:'3600',upsert:false}); if(error)throw error;
    const {data}=c.storage.from(cfg.productBucket||'product-images').getPublicUrl(path);
    return data.publicUrl;
  }


  async function trackOrderPublic(code, phoneLast4){
    const c=initClient(); if(!c) return {localOnly:true};
    try{
      const {data,error}=await c.rpc('alfa_track_order',{p_code:String(code||'').trim().toUpperCase(),p_phone_last4:String(phoneLast4||'').replace(/\D/g,'').slice(-4)});
      if(error) throw error;
      return {localOnly:false,order:Array.isArray(data)?data[0]:data};
    }catch(err){console.warn('Tracking online indisponível; usando histórico local.',err);return {localOnly:true,error:err};}
  }

  async function subscribeOrders(callback){
    const c=initClient(); if(!c)return null; const sess=await session(); if(!sess)return null;
    return c.channel('alfa-orders-live').on('postgres_changes',{event:'*',schema:'public',table:'alfa_orders'},payload=>callback?.(payload)).subscribe();
  }

  window.AlfaCloud={status,configured,initClient,session,signIn,signOut,publicHydrate,submitOrder,trackOrderPublic,pullAdminState,pushAdminState,schedulePush,uploadProductImage,subscribeOrders};
  document.addEventListener('DOMContentLoaded',()=>{initClient();session().catch(()=>{});publicHydrate();});
})();
