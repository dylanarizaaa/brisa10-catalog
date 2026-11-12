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
| 5 | Carrito (`/carrito`): cantidades, subtotales, total y verificación de disponibilidad | ✅ |
| 6 | Resumen del pedido (`/pedido`) y envío por WhatsApp | ✅ |
| 7 | SEO, rendimiento, accesibilidad y guía de despliegue | ✅ |
| — | Rediseño editorial minimalista: portada con video, secciones editoriales, carruseles, tarjetas con segunda foto | ✅ |

## Cómo funciona un pedido

1. El cliente agrega productos al carrito (se guarda en su navegador).
2. En `/carrito` y `/pedido` el sitio consulta `check_public_cart`: toma el **precio vigente de la base de datos** (no el guardado en el navegador) y comprueba que haya existencias para cada cantidad. Si un producto se agotó, se despublicó o cambió de precio, se avisa y hay que ajustar antes de seguir.
3. El cliente escribe su nombre, teléfono y elige recoger en tienda o envío a domicilio en Bogotá (dirección y barrio).
4. Tras una última verificación, se abre WhatsApp con el resumen escrito hacia el número del negocio. El cliente lo envía.

El pedido es una **solicitud pendiente de confirmación**: no se guarda en la base de datos, no reserva ni descuenta inventario y no hay pago en línea. El inventario se descuenta cuando el negocio registra la venta en la app administrativa. El costo de envío se muestra como "por confirmar".

## Requisitos

- Node.js 22.
- En Supabase, tener aplicadas las migraciones `20261111000007_public_catalog.sql` y `20261111000008_catalog_editorial.sql` de `brisa10-admin`. Sin la 8 el sitio funciona igual, pero no muestra la segunda foto al pasar el cursor ni las descripciones de categoría.

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
| `PUBLIC_SUPABASE_IMAGE_TRANSFORM` | Opcional. `true` pide las fotos al tamaño de cada pantalla (requiere un plan de pago de Supabase con *Image transformations*). Vacío: fotos originales |

Nunca usar la clave `service_role`: todo lo que empieza por `PUBLIC_` llega al navegador.

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Verificación de tipos y build de producción en `dist/` |
| `npm run lint` | Verificación de tipos y diagnósticos (`astro check`) |
| `npm run preview` | Sirve el build de producción |
| `npm run deploy` | Construye y publica en Cloudflare (requiere `wrangler login`) |

## Despliegue en Cloudflare

El sitio corre como un **Worker de Cloudflare** (plan gratuito: 100.000 peticiones al día). La configuración está en `wrangler.jsonc`; el adaptador de Astro la completa al construir.

> Estos pasos se verificaron hasta donde es posible sin una cuenta: el build y `wrangler deploy --dry-run` funcionan. Los nombres exactos de los menús del panel de Cloudflare pueden variar.

### Opción A — Despliegue automático desde GitHub (recomendada)

1. Crea una cuenta en [dash.cloudflare.com](https://dash.cloudflare.com).
2. **Workers & Pages → Create → Import a repository**, conecta GitHub y elige `brisa10-catalog`.
3. Configura el build:
   - **Build command:** `npm run build`
   - **Deploy command:** `npx wrangler deploy`
4. En las **variables de build** agrega las cuatro del archivo `.env.example` con sus valores reales (`PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_WHATSAPP_NUMBER`, `PUBLIC_SITE_URL`). Deben estar disponibles **durante el build**, porque quedan escritas en el sitio al construirlo.
5. Guarda y despliega. Cada `push` a `main` vuelve a publicar.

### Opción B — Desde tu equipo

```bash
npx wrangler login
npm run deploy        # usa las variables de tu archivo .env
```

### Después del primer despliegue

- El sitio queda en `https://brisa10-catalog.<tu-subdominio>.workers.dev`. Para usar un dominio propio: en el Worker, **Settings → Domains & Routes → Add → Custom domain**.
- Pon la dirección definitiva en `PUBLIC_SITE_URL` y vuelve a desplegar: de ella dependen los enlaces canónicos, el sitemap y las vistas previas al compartir.
- **Cambiar una variable exige volver a desplegar** (por ejemplo, un nuevo número de WhatsApp).
- El primer despliegue crea un espacio KV llamado `SESSION`. Lo exige el adaptador de Astro; el sitio no guarda nada en él y entra en el plan gratuito.
- En Google Search Console puedes registrar `https://tu-dominio/sitemap.xml`.

### Comprobaciones tras publicar

1. Abrir el inicio, el catálogo y un producto desde el celular.
2. Armar un pedido de prueba y confirmar que WhatsApp abre con el número correcto.
3. Compartir el enlace de un producto por WhatsApp y ver que aparece su foto y su nombre.
4. Despublicar un producto en la app administrativa y confirmar que desaparece (puede tardar unos minutos por la caché).

## SEO, rendimiento y accesibilidad

- **Metadatos por página:** título, descripción, enlace canónico y Open Graph. Cada producto comparte su foto principal; el resto del sitio usa `public/og-default.png`.
- **Datos estructurados (Schema.org):** `Store` en el inicio; `Product` (precio en COP y disponibilidad) y `BreadcrumbList` en cada producto.
- **`/sitemap.xml`** se genera con las categorías y los productos publicados (se renueva cada hora). **`/robots.txt`** lo anuncia.
- Búsquedas, carrito, pedido y páginas de error llevan `noindex`.
- **Rendimiento:** HTML renderizado en el servidor y guardado en la caché de Cloudflare; JavaScript solo en las islas (carrito, pedido, botón de agregar); fuentes incluidas en el sitio y precargadas; fotos con carga diferida y dimensiones reservadas (sin saltos de diseño); precarga de la página siguiente al tocar un enlace.
- **Accesibilidad:** contraste AA, foco visible, navegación por teclado, etiquetas para lectores de pantalla y respeto de "reducir movimiento". Revisado con axe-core en todas las páginas.
- **Cabeceras de seguridad** en `src/middleware.ts`.

**Peso de las fotos:** sin `PUBLIC_SUPABASE_IMAGE_TRANSFORM`, el sitio muestra las fotos tal como se subieron en la app administrativa (hasta 5 MB cada una). Es el factor que más afecta la velocidad en celulares. Conviene subirlas ya reducidas (lado mayor de ~1.600 px, JPG o WebP de menos de 300 kB). Con la variable activa, Supabase entrega cada foto al ancho que necesita la pantalla.

## Video de presentación

La portada del inicio está preparada para un video corto de la tienda o sus productos. Mientras no haya uno, muestra la foto del primer producto destacado (o la ilustración de respaldo si no hay fotos). No se incluye ningún video de muestra.

1. Graba un video de 8 a 15 segundos, sin audio, con buena luz y movimientos lentos. Exporta una versión horizontal (16:9, 1920 × 1080) y, si quieres, una vertical para celulares (4:5 o 9:16, 1080 de ancho). MP4 (H.264) o WebM, idealmente de menos de 4 MB cada una.
2. Exporta también una foto fija del primer cuadro (JPG de ~1920 px): se ve mientras carga el video y cuando la persona pidió reducir el movimiento.
3. Guarda los archivos en `public/media/` (por ejemplo `hero.mp4`, `hero-vertical.mp4` y `hero.jpg`).
4. En `src/config/site.ts`, completa `hero.video.desktop`, `hero.video.mobile` (opcional), `hero.image` y `hero.alt` con esas rutas (`/media/hero.mp4`…) y una descripción breve.

El video se reproduce solo, en silencio y en bucle, con un botón para pausarlo. No se descarga si el dispositivo tiene activado "reducir movimiento" o el modo de ahorro de datos: en ese caso queda la foto fija y el botón permite reproducirlo.

## Arquitectura

```
Cliente ─► Cloudflare (Astro en el servidor + caché de ~1 min) ─► Supabase (funciones públicas, rol anon)
```

- **Render en el servidor con caché corta** (`routeRules` en `astro.config.mjs`): el HTML llega completo, casi sin JavaScript, y un cambio hecho en la app administrativa se refleja en alrededor de un minuto sin reconstruir el sitio.
- **Componentes nuevos del rediseño:** `Carousel.astro` (carril con desplazamiento nativo, flechas y barra de progreso), `ProductCarousel`, `Hero` (video o foto), `BrandStatement`, `CategoryShowcase`, `EditorialSplit`, `PromoBanner`. Sin dependencias nuevas de animación: todo es CSS y un `IntersectionObserver`.
- **React solo en islas interactivas:** búsqueda y orden del catálogo, botón de agregar y acordeón del producto, carrito y pedido. El resto son componentes Astro sin JavaScript; el menú móvil usa la API `popover` del navegador. El inicio no carga React.
- **shadcn/ui** (`src/components/ui/`) para botones, campos, selector, grupo de opciones y acordeón, con su tema apuntando a la paleta de la tienda. En archivos `.astro` los enlaces con aspecto de botón usan `buttonVariants()`.
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
│  ├─ products/         Tarjeta, grilla, búsqueda y orden, categorías, paginación, galería
│  ├─ cart/             Islas React del carrito
│  ├─ checkout/         Formulario del pedido
│  └─ common/           Piezas reutilizables
├─ config/site.ts       Nombre, redes, textos de envío, navegación
├─ layouts/             MainLayout (metadatos, header, footer)
├─ hooks/               Carrito y su verificación (React)
├─ lib/                 Formato de moneda, mensaje de WhatsApp, filtros, carrito, validación
├─ middleware.ts        Cabeceras de seguridad
├─ pages/               Rutas, sitemap.xml y robots.txt
├─ services/supabase/   Único lugar que consulta Supabase
├─ styles/global.css    Sistema de diseño (tokens de Tailwind)
└─ types/
```

## Sistema de diseño

Dirección: e-commerce minimalista y editorial. Fondo blanco, mucho espacio entre secciones, títulos grandes en serif, fotos protagonistas y botones sobrios. Definido en `src/styles/global.css`; las variables de shadcn/ui (`--primary`, `--border`, `--ring`…) apuntan a estos colores, así que sus componentes heredan la identidad.

| Token | Valor | Uso |
|-------|-------|-----|
| `paper` | `#ffffff` | Fondo principal |
| `cream` / `sand` | `#f8f5f1` / `#f1ece6` | Secciones alternas, pie de página, marcos de foto |
| `linen` | `#e6dfd7` | Bordes y divisores finos |
| `ink` / `stone` | `#1a1817` / `#6b645e` | Texto, botones principales; texto secundario |
| `clay` | `#9c4f36` | Acento con moderación: punto del logo, numeración, avisos |
| `sage` | `#4f5d48` | Disponibilidad y confirmaciones |

- **Tipografía:** Instrument Serif (títulos editoriales y logotipo) y DM Sans (texto e interfaz), incluidas en el proyecto.
- **Botones** (`src/components/ui/button.tsx`): rectangulares, negros por defecto, con altura táctil. Variantes `default`, `outline`, `light` y `outline-light` (sobre fotos), `secondary`, `whatsapp`, `ghost` y `link`.
- **Encabezado:** logotipo centrado, buscador en panel superior, carrito con contador, categorías debajo (escritorio) y menú lateral con fotos (celular). Se oculta al bajar y reaparece al subir.
- **Tarjetas de producto** (`ProductCard.astro`): foto 4:5, segunda foto al pasar el cursor, nombre, precio, disponibilidad y una acción: "Agregar al carrito" (barra que aparece al pasar el cursor; botón redondo en pantallas táctiles) o "Consultar disponibilidad" por WhatsApp si está agotado.
- **Inicio:** portada a pantalla completa (video o foto), mensaje de marca, categorías en carrusel, destacados en carrusel, bloques editoriales por categoría (usan la descripción de la categoría escrita en la app administrativa), novedades, banner de envíos y sección "Sobre la tienda" con los pasos para comprar. Las fotos se reparten para no repetir la misma en varias secciones.
- **Movimiento:** aparición progresiva al hacer scroll (`data-reveal`, `data-reveal="image"`), entrada escalonada de la portada, cambios suaves en tarjetas, botones, enlaces e iconos. Todo se desactiva con "reducir movimiento"; el título y la foto principal de cada página no se animan para no retrasar su carga.
- Los colores de texto cumplen contraste AA.

## Agregar componentes de interfaz

```bash
npx shadcn@latest add <componente>
```

## Contenido pendiente de reemplazar

| Qué | Dónde |
|-----|-------|
| Enlaces de Instagram, TikTok y Facebook | `src/config/site.ts` → `social` |
| Logotipo (hoy es el nombre en texto) | `src/components/layout/Logo.astro` y `public/favicon.svg` |
| Imagen al compartir el sitio en redes (1200 × 630 px) | `public/og-default.png` |
| Video y foto de la portada | `public/media/` y `src/config/site.ts` → `hero` (ver "Video de presentación") |
| Ilustración de respaldo de la portada (solo se ve si no hay video, foto ni productos con foto) | `src/assets/hero.svg` |
| Mensaje de marca del inicio | `src/config/site.ts` → `brand` |
| Textos de los bloques editoriales | App administrativa → Categorías → descripción de cada categoría |
| Texto de presentación del negocio | `src/components/home/About.astro` |
| Nombre, dirección, teléfono y correo | App administrativa → Configuración → Negocio |
| Costo de envío (hoy "por confirmar") | `src/config/site.ts` → `shipping` |
