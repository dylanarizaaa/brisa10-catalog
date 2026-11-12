import type { APIRoute } from 'astro'

// El carrito y el pedido no se bloquean aquí: llevan "noindex", y para que un
// buscador lea esa etiqueta tiene que poder visitar la página.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL('/sitemap.xml', site).href}\n`, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
