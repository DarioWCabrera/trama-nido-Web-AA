# Etapa 4 · Categorías y entrega inmediata

## Antes de iniciar

Ejecutar en Supabase el archivo `SUPABASE-ETAPA-4.sql`.

## Cambios incorporados

- Creación de categorías nuevas directamente desde el formulario de producto.
- Modalidad de producto: `A pedido` o `En stock · entrega inmediata`.
- Cantidad de unidades disponibles para productos terminados.
- Los productos con stock aparecen en una sección propia de la tienda.
- Los productos de stock cero dejan de mostrarse públicamente.
- El carrito limita la cantidad según el stock cargado.
- El panel muestra la cantidad total de unidades listas.

## Cómo cargar una prenda ya realizada

1. Entrar a `/admin`.
2. Elegir `Agregar producto`.
3. Seleccionar una categoría existente o tocar `+ Nueva`.
4. Elegir `En stock · entrega inmediata`.
5. Indicar la cantidad disponible.
6. Cargar el talle o detalle fijo de la prenda.
7. Guardar el producto y luego agregar sus fotografías.

Cuando una unidad se venda, reducir manualmente el stock desde el panel. El descuento automático se incorporará cuando los pedidos también se guarden en Supabase.
