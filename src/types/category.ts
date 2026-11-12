export interface Category {
  slug: string
  name: string
  /** Texto editable en la app administrativa (migración 20261111000008; puede faltar). */
  description?: string | null
  product_count: number
  image_path: string | null
}
