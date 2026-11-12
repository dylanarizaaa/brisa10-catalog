// @ts-check
import cloudflare from '@astrojs/cloudflare'
import { cacheCloudflare } from '@astrojs/cloudflare/cache'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'
import { loadEnv } from 'vite'

const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), 'PUBLIC_')

// Las páginas con datos se renderizan en el servidor y se guardan en la caché de
// Cloudflare por poco tiempo: el HTML llega completo (SEO, Open Graph) y un cambio
// de precio o un producto despublicado se refleja en ~1 minuto sin reconstruir el sitio.
const catalogCache = { maxAge: 60, swr: 300 }

export default defineConfig({
  site: env.PUBLIC_SITE_URL || 'http://localhost:4321',
  output: 'server',
  // Las fotos se sirven tal cual desde Supabase Storage; no se usa el servicio de imágenes de Cloudflare.
  adapter: cloudflare({ imageService: 'passthrough' }),
  integrations: [react()],
  vite: { plugins: [tailwindcss()] },
  cache: { provider: cacheCloudflare() },
  routeRules: {
    '/': catalogCache,
    '/catalogo': catalogCache,
    '/productos/[slug]': catalogCache,
  },
})
