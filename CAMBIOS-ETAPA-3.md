# Trama Nido — Etapa 3: panel autoadministrable

## Incluido

- Ruta privada `/admin`.
- Inicio de sesión con Supabase Auth.
- Verificación contra `public.admin_users`.
- Sesión persistente y cierre de sesión.
- Listado completo de productos, incluidos los ocultos.
- Buscador por nombre, categoría o slug.
- Alta de productos.
- Edición de nombre, categoría, descripciones, precio, porcentaje de seña y demora.
- Publicar u ocultar productos sin eliminarlos.
- Gestión de talles y medidas.
- Selección de colores y opciones personalizables.
- Carga múltiple de fotografías a `product-images`.
- Selección de fotografía de portada.
- Eliminación de fotografías de Storage y de `product_images`.
- Redirección SPA para que `/admin` funcione al publicar en Netlify.

## Acceso

Abrir:

```text
http://localhost:5173/admin
```

Ingresar con el usuario creado en Supabase Authentication y vinculado en `public.admin_users`.

## Variables necesarias

Crear `.env.local` en la raíz:

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

## Prueba recomendada

1. Iniciar sesión en `/admin`.
2. Editar el precio de un producto.
3. Guardar.
4. Abrir la tienda pública y actualizar.
5. Confirmar que el nuevo precio aparezca.
6. Subir una foto y marcarla como portada.
7. Actualizar la tienda pública.
