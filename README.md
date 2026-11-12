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

## Cómo funciona un pedido

1. El cliente agrega productos al carrito (se guarda en su navegador).
2. En `/carrito` y `/pedido` el sitio consulta `check_public_cart`: toma el **precio vigente de la base de datos** (no el guardado en el navegador) y comprueba que haya existencias para cada cantidad. Si un producto se agotó, se despublicó o cambió de precio, se avisa y hay que ajustar antes de seguir.
3. El cliente escribe su nombre, teléfono y elige recoger en tienda o envío a domicilio en Bogotá (dirección y barrio).
4. Tras una última verificación, se abre WhatsApp con el resumen escrito hacia el número del negocio. El cliente lo envía.

El pedido es una **solicitud pendiente de confirmación**: no se guarda en la base de datos, no reserva ni descuenta inventario y no hay pago en línea. El inventario se descuenta cuando el negocio registra la venta en la app administrativa. El costo de envío se muestra como "por confirmar".

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

**Peso de las fotos:** el sitio muestra las fotos tal como se subieron en la app administrativa (hasta 5 MB cada una). Es el factor que más afecta la velocidad en celulares. Conviene subirlas ya reducidas (lado mayor de ~1.600 px, JPG o WebP de menos de 300 kB).

## Arquitectura

```
Cliente ─► Cloudflare (Astro en el servidor + caché de ~1 min) ─► Supabase (funciones públicas, rol anon)
```

- **Render en el servidor con caché corta** (`routeRules` en `astro.config.mjs`): el HTML llega completo, casi sin JavaScript, y un cambio hecho en la app administrativa se refleja en alrededor de un minuto sin reconstruir el sitio.
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

Definido en `src/styles/global.css`. Las variables de shadcn/ui (`--primary`, `--border`, `--ring`…) apuntan a estos mismos colores, así que sus componentes heredan la identidad de la tienda.

| Token | Valor | Uso |
|-------|-------|-----|
| `cream` | `#faf6f0` | Fondo |
| `sand` / `linen` | `#efe6da` / `#e2d6c6` | Superficies, marcos de foto, bordes |
| `ink` / `stone` | `#2b2622` / `#6b625a` | Texto principal y secundario; bandas oscuras |
| `clay` | `#9c4f36` | Acento: botones, enlaces, cinta animada |
| `sage` | `#4f5d48` | Secundario: entregas y confirmaciones |

- **Tipografía:** Fraunces (títulos, precios) y DM Sans (texto), incluidas en el proyecto.
- **Motivo visual:** el arco (`.arch`), presente en el banner, las categorías, las cabeceras de página y los estados vacíos; destellos de cuatro puntas como detalle.
- **Botones** (`src/components/ui/button.tsx`): forma de píldora y altura táctil. Variantes `default` (terracota), `outline`, `secondary`, `dark`, `light`, `whatsapp`, `ghost` y `link`.
- **Fotos de producto** en proporción 4:5. En el banner del inicio se usan las fotos de los productos destacados (o los más recientes); si no hay ninguno con foto, aparece la ilustración de respaldo.
- **Movimiento:** apariciones suaves al hacer scroll, cinta de categorías, sello giratorio y transiciones al pasar el cursor. Todo se desactiva con la preferencia "reducir movimiento" del sistema.
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
| Ilustración de respaldo del banner (solo se ve si ningún producto tiene foto) | `src/assets/hero.svg` |
| Texto de presentación del negocio | `src/components/home/About.astro` |
| Nombre, dirección, teléfono y correo | App administrativa → Configuración → Negocio |
| Costo de envío (hoy "por confirmar") | `src/config/site.ts` → `shipping` |
