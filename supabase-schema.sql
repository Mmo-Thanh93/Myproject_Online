create extension if not exists "pgcrypto";

create table if not exists public.skus (
  id uuid primary key default gen_random_uuid(),
  sku_number text not null,
  sku_name text,
  length numeric,
  width numeric,
  height numeric,
  uom text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.locations (
  id uuid primary key default gen_random_uuid(),
  location_name text not null,
  location_type text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_orders (
  id uuid primary key default gen_random_uuid(),
  inbound_date date,
  po_number text not null,
  quantity numeric,
  product_name text,
  finalize_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.delivery_notes (
  id uuid primary key default gen_random_uuid(),
  outbound_date date,
  dn_number text not null,
  quantity numeric,
  product_name text,
  delivery_address text,
  store_name text,
  finalize_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace view public.inventory_stock as
with inbound as (
  select
    product_name,
    sum(coalesce(quantity, 0)) as inbound_quantity
  from public.purchase_orders
  where product_name is not null
  group by product_name
),
outbound as (
  select
    product_name,
    sum(coalesce(quantity, 0)) as outbound_quantity
  from public.delivery_notes
  where product_name is not null
  group by product_name
)
select
  coalesce(inbound.product_name, outbound.product_name) as product_name,
  coalesce(inbound.inbound_quantity, 0) as inbound_quantity,
  coalesce(outbound.outbound_quantity, 0) as outbound_quantity,
  coalesce(inbound.inbound_quantity, 0) -
    coalesce(outbound.outbound_quantity, 0) as stock_quantity
from inbound
full outer join outbound
  on inbound.product_name = outbound.product_name;

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_skus_updated_at on public.skus;
create trigger set_skus_updated_at
before update on public.skus
for each row execute function public.set_updated_at();

drop trigger if exists set_locations_updated_at on public.locations;
create trigger set_locations_updated_at
before update on public.locations
for each row execute function public.set_updated_at();

drop trigger if exists set_purchase_orders_updated_at on public.purchase_orders;
create trigger set_purchase_orders_updated_at
before update on public.purchase_orders
for each row execute function public.set_updated_at();

drop trigger if exists set_delivery_notes_updated_at on public.delivery_notes;
create trigger set_delivery_notes_updated_at
before update on public.delivery_notes
for each row execute function public.set_updated_at();

alter table public.skus enable row level security;
alter table public.locations enable row level security;
alter table public.purchase_orders enable row level security;
alter table public.delivery_notes enable row level security;

drop policy if exists "Allow public write skus" on public.skus;
create policy "Allow public write skus"
on public.skus for all
to anon
using (true)
with check (true);

drop policy if exists "Allow public write locations" on public.locations;
create policy "Allow public write locations"
on public.locations for all
to anon
using (true)
with check (true);

drop policy if exists "Allow public write purchase orders" on public.purchase_orders;
create policy "Allow public write purchase orders"
on public.purchase_orders for all
to anon
using (true)
with check (true);

drop policy if exists "Allow public write delivery notes" on public.delivery_notes;
create policy "Allow public write delivery notes"
on public.delivery_notes for all
to anon
using (true)
with check (true);
