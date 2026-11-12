import type { CatalogPage, CatalogSort } from '@/types/product'
import { rpc } from './client'

export interface CatalogQuery {
  search?: string
  categorySlug?: string
  sort?: CatalogSort
  featured?: boolean
  limit?: number
  offset?: number
}

/** Productos publicados y activos, paginados (máximo 48 por llamada, lo fija la base de datos). */
export function getCatalog(query: CatalogQuery = {}): Promise<CatalogPage> {
  return rpc<CatalogPage>('get_public_catalog', {
    p_search: query.search ?? null,
    p_category: query.categorySlug ?? null,
    p_sort: query.sort ?? 'recientes',
    p_featured: query.featured ?? false,
    p_limit: query.limit ?? 24,
    p_offset: query.offset ?? 0,
  })
}
