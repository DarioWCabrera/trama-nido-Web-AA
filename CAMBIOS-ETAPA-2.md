# Cambios — Etapa 2: catálogo conectado

## Archivos nuevos

- `src/services/productsService.js`: consulta y adapta productos, categorías, talles e imágenes de Supabase.
- `src/hooks/useProducts.js`: controla carga, error, reintento y catálogo de respaldo.
- `.env.example`: ejemplo de las variables necesarias.

## Archivos modificados

- `src/App.jsx`: usa el catálogo remoto y muestra carga/error.
- `src/lib/supabase.js`: permite que la tienda siga abriendo aunque falte la configuración.
- `src/data/products.js`: queda como respaldo local y aporta fotografías provisionales.
- `src/context/CartContext.jsx`: guarda el porcentaje de seña de cada producto.
- `ProductCard`, `ProductModal`, `CartDrawer` y `CheckoutModal`: calculan la seña dinámicamente.
- `src/styles.css`: incorpora esqueletos de carga, aviso de conexión y estado vacío.

## Prueba recomendada

1. Conservá o volvé a crear `.env.local`.
2. Ejecutá `npm install` y `npm run dev`.
3. Confirmá que se vean los dos productos.
4. Cambiá el precio de un producto desde Supabase.
5. Actualizá el navegador: el nuevo precio debe aparecer.
6. Agregalo al carrito y verificá total, seña y saldo.
