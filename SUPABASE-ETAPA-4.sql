-- ============================================================
-- TRAMA NIDO · ETAPA 4
-- Stock para entrega inmediata
-- Ejecutar una sola vez desde SQL Editor → New query → Run
-- ============================================================

alter table public.products
add column if not exists stock_quantity integer not null default 0;

alter table public.products
drop constraint if exists products_stock_quantity_check;

alter table public.products
add constraint products_stock_quantity_check
check (stock_quantity >= 0);

-- Los productos ya existentes continúan siendo productos a pedido.
update public.products
set stock_quantity = 0
where made_to_order = true;
