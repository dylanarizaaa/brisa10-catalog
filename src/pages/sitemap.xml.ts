import type { APIRoute } from 'astro'
import { catalogUrl } from '@/lib/catalogUrl'
import { getCategories } from '@/services/supabase/categories'
import { getCatalog } from '@/services/supabase/products'

const PAGE_SIZE = 48 // máximo que devuelve la base de datos por llamada
const MAX_PAGES = 40 // tope de seguridad: 1.920 productos

async function allProductSlugs(): Promise<string[]> {
  const slugs: string[] = []
  for (let page = 0; page < MAX_PAGES; page += 1) {
    const { items, total } = await getCatalog({ limit: PAGE_SIZE, offset: page * PAGE_SIZE })
    slugs.push(...items.map((item) => item.slug))
    if (items.length === 0 || slugs.length >= total) break
  }
  return slugs
}

/** Mapa del sitio para buscadores: inicio, catálogo, categorías y cada producto publicado. */
export const GET: APIRoute = async ({ site, cache }) => {
  let paths: string[]
  try {
    const [categories, slugs] = await Promise.all([getCategories(), allProductSlugs()])
    paths = [
      '/',
      '/catalogo',
      ...categories.map((category) => catalogUrl({ categoria: category.slug })),
      ...slugs.map((slug) => `/productos/${slug}`),
    ]
  } catch (error) {
    console.error('[sitemap]', error)
    cache.set(false)
    return new Response('No se pudo generar el mapa del sitio.', { status: 503, headers: { 'Retry-After': '300' } })
  }

  const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;')
  const urls = paths.map((path) => `  <url><loc>${escape(new URL(path, site).href)}</loc></url>`).join('\n')
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  )
}
