export type Availability = 'disponible' | 'ultimas_unidades' | 'agotado'

/** Producto tal como lo devuelven las funciones públicas (tarjeta de catálogo). */
export interface ProductCard {
  id: string
  slug: string
  name: string
  /** Pesos colombianos, entero. */
  price: number
  availability: Availability
  is_featured: boolean
  category_name: string
  category_slug: string
  /** Ruta dentro del bucket product-images, o null si no tiene foto. */
  main_image_path: string | null
}

export interface CatalogPage {
  items: ProductCard[]
  total: number
  limit: number
  offset: number
}

export type CatalogSort = 'recientes' | 'precio_asc' | 'precio_desc'
