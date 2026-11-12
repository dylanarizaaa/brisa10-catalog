import type { CatalogSort } from '@/types/product'

export const CATALOG_PAGE_SIZE = 24

export const sortOptions: { value: CatalogSort; label: string }[] = [
  { value: 'recientes', label: 'Novedades' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
]

export interface CatalogParams {
  q: string
  categoria: string
  orden: CatalogSort
  pagina: number
}

/** Lee los filtros de la URL; cualquier valor no válido vuelve a su valor por defecto. */
export function parseCatalogParams(searchParams: URLSearchParams): CatalogParams {
  const orden = searchParams.get('orden')
  const pagina = Number.parseInt(searchParams.get('pagina') ?? '', 10)
  return {
    q: (searchParams.get('q') ?? '').trim().slice(0, 80),
    categoria: (searchParams.get('categoria') ?? '').trim().slice(0, 120),
    orden: sortOptions.some((option) => option.value === orden) ? (orden as CatalogSort) : 'recientes',
    pagina: Number.isFinite(pagina) && pagina > 1 ? Math.min(pagina, 400) : 1,
  }
}

/** URL del catálogo con los filtros dados; omite los valores por defecto para que sea limpia. */
export function catalogUrl(params: Partial<CatalogParams>): string {
  const query = new URLSearchParams()
  if (params.q) query.set('q', params.q)
  if (params.categoria) query.set('categoria', params.categoria)
  if (params.orden && params.orden !== 'recientes') query.set('orden', params.orden)
  if (params.pagina && params.pagina > 1) query.set('pagina', String(params.pagina))
  const text = query.toString()
  return text ? `/catalogo?${text}` : '/catalogo'
}
