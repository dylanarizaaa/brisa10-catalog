# Brisa10 — Tienda virtual

Catálogo público de la tienda (decoración, cerámicas, peluches y regalos, Bogotá). Los clientes exploran los productos, arman un pedido y lo envían por **WhatsApp Business**. No hay pagos en línea ni cuentas de cliente.

Comparte el proyecto de Supabase con la app administrativa ([brisa10-admin](https://github.com/dylanarizaaa/brisa10-admin)): allí se crean los productos, se publican y se actualizan precios y existencias. Este sitio **solo lee**.

## Estado

| Fase | Contenido | Estado |
|------|-----------|--------|
| 1 | Astro, React, TypeScript, Tailwind CSS v4 | ✅ |
| 2 | Identidad visual, layout, navegación y página de inicio | ✅ |
| 3 | Catálogo (`/catalogo`): búsqueda, filtro por categoría, orden y paginación | ✅ |
| 4 | Detalle de producto (`/productos/[slug]`): galería, cantidad, agregar al carrito, consulta por WhatsApp y relacionados | ✅ |
| 5 | Carrito (`/carrito`) | ⏳ Siguiente |
| 6 | Resumen del pedido y envío por WhatsApp | ⏳ |
| 7 | SEO, rendimiento, despliegue en Cloudflare | ⏳ |

Los productos ya se pueden agregar al carrito (se guarda en el navegador y el encabezado muestra el contador), pero la página `/carrito` llega en la fase 5 y por ahora muestra la página 404.

## Requisitos

- Node.js 22.
- En Supabase, tener aplicada la migración `20261111000007_public_catalog.sql` de `brisa10-admin`.

## Puesta en marcha

```bash
npm install
cp .env.example .env   # completar con los datos del proyecto
npm run dev            # http://localhost:4321
```

| Variable | Descripción |
|----------|-------------|
| `PUBLIC_SUPABASE_URL` | URL del proyecto de Supabase |
| `PUBLIC_SUPABASE_ANON_KEY` | Clave pública `anon` |
| `PUBLIC_WHATSAPP_NUMBER` | WhatsApp del negocio, solo dígitos con indicativo (`573001234567`). Vacío oculta los botones de WhatsApp |
| `PUBLIC_SITE_URL` | Dirección pública del sitio (enlaces canónicos y Open Graph) |

Nunca usar la clave `service_role`: todo lo que empieza por `PUBLIC_` llega al navegador.

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación de tipos y build de producción en `dist/` |
| `npm run lint` | Verificación de tipos y diagnósticos (`astro check`) |
| `npm run preview` | Sirve el build de producción |

## Arquitectura

```
Cliente ─► Cloudflare (Astro en el servidor + caché de ~1 min) ─► Supabase (funciones públicas, rol anon)
```

- **Render en el servidor con caché corta** (`routeRules` en `astro.config.mjs`): el HTML llega completo, casi sin JavaScript, y un cambio hecho en la app administrativa se refleja en alrededor de un minuto sin reconstruir el sitio.
- **React solo en islas interactivas** (carrito y pedido, fases 5 y 6). El resto son componentes Astro sin JavaScript; el menú móvil usa la API `popover` del navegador.
- **Supabase por funciones RPC** (`get_public_catalog`, `get_public_product`, `get_public_categories`, `get_public_business`, `check_public_cart`). El rol `anon` no puede leer ninguna tabla; las funciones nunca devuelven stock exacto ni costos. Se llaman con `fetch`, sin el SDK.
- Si una consulta falla, la sección correspondiente no se muestra y el resto de la página sigue funcionando. Las respuestas con error no se guardan en caché.
- **Filtros en la URL** (`/catalogo?q=…&categoria=…&orden=…&pagina=…`): se resuelven en el servidor, funcionan sin JavaScript y se pueden compartir. Las búsquedas llevan `noindex`.
- **Carrito en `localStorage`** (`src/lib/cart.ts`): es una intención de pedido, no reserva ni descuenta inventario.
- **Producto no publicado o inexistente:** responde 404. Cada producto lleva Open Graph (foto, precio) y datos estructurados Schema.org.

```
src/
├─ assets/              Imágenes propias del sitio
├─ components/
│  ├─ layout/           Header, Footer, logotipo, botón flotante de WhatsApp
│  ├─ home/             Secciones de la página de inicio
│  ├─ products/         Tarjeta, grilla, filtros, paginación, galería y disponibilidad
│  ├─ cart/             Islas React del carrito
│  └─ common/           Piezas reutilizables
├─ config/site.ts       Nombre, redes, textos de envío, navegación
├─ layouts/             MainLayout (metadatos, header, footer)
├─ lib/                 Formato de moneda, WhatsApp, filtros del catálogo, carrito
├─ pages/               Rutas
├─ services/supabase/   Único lugar que consulta Supabase
├─ styles/global.css    Sistema de diseño (tokens de Tailwind)
└─ types/
```

## Sistema de diseño

Definido en `src/styles/global.css`.

| Token | Valor | Uso |
|-------|-------|-----|
| `cream` | `#faf6f0` | Fondo |
| `sand` / `linen` | `#efe6da` / `#e2d6c6` | Superficies, marcos de foto, bordes |
| `ink` / `stone` | `#2b2622` / `#6b625a` | Texto principal y secundario |
| `clay` | `#9c4f36` | Acento: botones y enlaces |
| `sage` | `#5f6e57` | Secundario |

Tipografía: **Fraunces** (títulos) y **DM Sans** (texto), incluidas en el proyecto. Fotos de producto en proporción 4:5. Los colores de texto cumplen contraste AA.

## Contenido pendiente de reemplazar

| Qué | Dónde |
|-----|-------|
| Enlaces de Instagram, TikTok y Facebook | `src/config/site.ts` → `social` |
| Logotipo (hoy es el nombre en texto) | `src/components/layout/Logo.astro` y `public/favicon.svg` |
| Foto del banner principal (hoy es una ilustración) | `src/assets/hero.svg` y `src/components/home/Hero.astro` |
| Texto de presentación del negocio | `src/components/home/About.astro` |
| Nombre, dirección, teléfono y correo | App administrativa → Configuración → Negocio |
| Costo de envío (hoy "por confirmar") | `src/config/site.ts` → `shipping` |
