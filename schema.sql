-- ALFA SUPLEMENTOS V7 — SCHEMA SUPABASE
-- ============================================================
-- ALFA SUPLEMENTOS V4 — SUPABASE / POSTGRES
-- Execute no SQL Editor do seu projeto Supabase.
-- ============================================================

create table if not exists public.alfa_catalog (
  entity_type text not null,
  entity_id text not null,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now(),
  primary key (entity_type, entity_id)
);

create table if not exists public.alfa_orders (
  id text primary key,
  code text not null,
  customer_phone text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists alfa_orders_code_idx on public.alfa_orders(code);
create index if not exists alfa_orders_updated_idx on public.alfa_orders(updated_at desc);

create table if not exists public.alfa_customers (
  id text primary key,
  phone text,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
create index if not exists alfa_customers_phone_idx on public.alfa_customers(phone);

create table if not exists public.alfa_stock_movements (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.alfa_catalog enable row level security;
alter table public.alfa_orders enable row level security;
alter table public.alfa_customers enable row level security;
alter table public.alfa_stock_movements enable row level security;

-- Catálogo: qualquer visitante pode ler somente entidades públicas.
drop policy if exists "public read catalog" on public.alfa_catalog;
create policy "public read catalog" on public.alfa_catalog for select to anon, authenticated
using (entity_type in ('products','settings','banners','coupons','combos','reviews'));

-- Administração autenticada pode alterar todo o catálogo.
drop policy if exists "admin manage catalog" on public.alfa_catalog;
create policy "admin manage catalog" on public.alfa_catalog for all to authenticated
using (true) with check (true);

-- Checkout público: visitante pode criar pedido, mas não listar pedidos.
drop policy if exists "public create order" on public.alfa_orders;
create policy "public create order" on public.alfa_orders for insert to anon, authenticated
with check (true);

-- Somente usuário autenticado visualiza/atualiza os pedidos.
drop policy if exists "admin manage orders" on public.alfa_orders;
create policy "admin manage orders" on public.alfa_orders for all to authenticated
using (true) with check (true);

-- CRM e estoque são administrativos.
drop policy if exists "admin manage customers" on public.alfa_customers;
create policy "admin manage customers" on public.alfa_customers for all to authenticated
using (true) with check (true);
drop policy if exists "admin manage stock" on public.alfa_stock_movements;
create policy "admin manage stock" on public.alfa_stock_movements for all to authenticated
using (true) with check (true);

-- Bucket público das imagens dos produtos.
insert into storage.buckets (id,name,public) values ('product-images','product-images',true)
on conflict (id) do update set public=true;

drop policy if exists "public view product images" on storage.objects;
create policy "public view product images" on storage.objects for select to public
using (bucket_id='product-images');

drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects for insert to authenticated
with check (bucket_id='product-images');
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects for update to authenticated
using (bucket_id='product-images') with check (bucket_id='product-images');
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects for delete to authenticated
using (bucket_id='product-images');

-- Realtime para pedidos (opcional, útil para o painel aberto receber novos pedidos).
do $$ begin
  alter publication supabase_realtime add table public.alfa_orders;
exception when duplicate_object then null;
end $$;


-- ============================================================
-- ALFA SUPLEMENTOS V8 — TRACKING PÚBLICO LIMITADO
-- Retorna somente dados essenciais quando código + últimos 4 dígitos conferem.
-- ============================================================
create or replace function public.alfa_track_order(p_code text, p_phone_last4 text)
returns table (code text, status text, payment_status text, total numeric, created_at timestamptz, updated_at timestamptz)
language sql
security definer
set search_path = public
as $$
  select
    o.code,
    coalesce(o.payload->>'status','whatsapp') as status,
    coalesce(o.payload->>'paymentStatus','pending') as payment_status,
    coalesce((o.payload->>'total')::numeric,0) as total,
    coalesce((o.payload->>'createdAt')::timestamptz,o.created_at) as created_at,
    coalesce((o.payload->>'updatedAt')::timestamptz,o.updated_at) as updated_at
  from public.alfa_orders o
  where upper(o.code)=upper(trim(p_code))
    and right(regexp_replace(coalesce(o.customer_phone,''),'\D','','g'),4)=right(regexp_replace(coalesce(p_phone_last4,''),'\D','','g'),4)
  limit 1;
$$;
revoke all on function public.alfa_track_order(text,text) from public;
grant execute on function public.alfa_track_order(text,text) to anon, authenticated;

-- ============================================================
-- V9 — FIDELIDADE, INDICAÇÕES E ALERTAS (OPCIONAL)
-- ============================================================
create table if not exists loyalty_profiles (
  id bigint generated by default as identity primary key,
  customer_phone text unique not null,
  points integer not null default 0,
  level text not null default 'START',
  referral_code text unique,
  updated_at timestamptz not null default now()
);

create table if not exists product_alerts (
  id bigint generated by default as identity primary key,
  customer_phone text not null,
  product_id bigint,
  alert_type text not null default 'watch',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table loyalty_profiles enable row level security;
alter table product_alerts enable row level security;

-- Por segurança, não há policy pública de leitura/escrita nestas tabelas.
-- Use o painel autenticado ou uma Edge Function para registrar alertas e pontos.
