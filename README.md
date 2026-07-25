# Trama Nido — Tienda conectada con Supabase

Esta versión mantiene el diseño editorial, el carrito y el cierre de compra, pero ahora obtiene el catálogo público desde Supabase.

## Qué incorpora esta etapa

- Lectura de productos publicados desde `products`.
- Lectura de categorías desde `categories`.
- Lectura de talles desde `product_sizes`.
- Preparación para fotografías guardadas en `product_images` y el bucket público `product-images`.
- Indicador visual mientras se carga el catálogo.
- Mensaje y botón de reintento si falla la conexión.
- Catálogo local de respaldo para que la tienda no quede inutilizable.
- Carrito compatible con los identificadores reales de Supabase.
- Porcentaje de seña tomado de cada producto.

## Variables de entorno

Conservá tu archivo `.env.local` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://TU-PROYECTO.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=TU_PUBLISHABLE_KEY
```

También se incluye `.env.example` como referencia. No subas `.env.local` a GitHub.

## Ejecutar el proyecto

```bash
npm install
npm run dev
```

Abrí la dirección que muestre Vite, normalmente:

```text
http://localhost:5173
```

## Cómo comprobar la conexión

1. Abrí la tienda.
2. Esperá un instante mientras aparecen los esqueletos de carga.
3. Los productos deben mostrarse con los precios que figuran en Supabase.
4. En `Table Editor → products`, cambiá temporalmente un precio.
5. Recargá la página y verificá que el nuevo precio aparezca.

Las fotografías continúan usando los archivos locales mientras `product_images` no tenga filas. Cuando el panel administrativo cargue imágenes, la tienda usará automáticamente las URLs públicas del bucket `product-images`.

## Próxima etapa

- Crear `/admin`.
- Inicio de sesión de Romina.
- Crear, editar, publicar y ocultar productos.
- Subir y ordenar fotografías.
- Guardar pedidos en Supabase.
- Administrar estados de pago, elaboración, envío y entrega.

## Etapa 4: categorías y stock inmediato

Antes de ejecutar esta versión, correr `SUPABASE-ETAPA-4.sql` en el SQL Editor de Supabase. Luego se pueden crear categorías desde el panel y publicar prendas terminadas en la sección de entrega inmediata.
