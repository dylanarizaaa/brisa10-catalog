import type { Category } from '@/types/category'
import { rpc } from './client'

/** Categorías activas con al menos un producto publicado. */
export function getCategories(): Promise<Category[]> {
  return rpc<Category[]>('get_public_categories')
}
