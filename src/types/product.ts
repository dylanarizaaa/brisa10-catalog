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

/** Detalle de un producto: la tarjeta más descripción, galería y relacionados. */
export interface ProductDetail extends ProductCard {
  description: string | null
  /** Rutas en el bucket product-images, en orden; la primera es la principal. */
  images: string[]
  related: ProductCard[]
  created_at: string
  updated_at: string
}
