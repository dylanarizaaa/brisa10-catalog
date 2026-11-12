import type { Availability } from './product'

/** Respuesta de check_public_cart para una línea del carrito. */
export type CartCheckLine =
  | { found: false; product_id: string }
  | {
      found: true
      product_id: string
      slug: string
      name: string
      price: number
      availability: Availability
      main_image_path: string | null
      quantity: number
      /** true si hay existencias para la cantidad pedida. */
      quantity_available: boolean
    }

export type DeliveryMode = 'recoger' | 'domicilio'

export interface OrderCustomer {
  name: string
  phone: string
  delivery: DeliveryMode
  address: string
  neighborhood: string
  notes: string
}
