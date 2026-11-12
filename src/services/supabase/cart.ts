import type { CartCheckLine } from '@/types/order'
import { rpc } from './client'

/**
 * Verifica el carrito en la base de datos: precio vigente y si la cantidad pedida
 * está disponible. No registra nada ni descuenta inventario.
 */
export function checkCart(items: { id: string; quantity: number }[]): Promise<CartCheckLine[]> {
  return rpc<CartCheckLine[]>('check_public_cart', {
    p_items: items.map((item) => ({ product_id: item.id, quantity: item.quantity })),
  })
}
