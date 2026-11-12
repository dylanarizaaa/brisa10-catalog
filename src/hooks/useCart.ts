import { useSyncExternalStore } from 'react'
import { getCart, onCartChange, type CartItem } from '@/lib/cart'

// useSyncExternalStore exige la misma referencia mientras el contenido no cambie.
let cachedKey = ''
let cachedItems: CartItem[] = []
const empty: CartItem[] = []

function snapshot(): CartItem[] {
  const items = getCart()
  const key = JSON.stringify(items)
  if (key !== cachedKey) {
    cachedKey = key
    cachedItems = items
  }
  return cachedItems
}

/** Carrito del cliente, sincronizado con localStorage (también entre pestañas). */
export function useCart(): CartItem[] {
  return useSyncExternalStore(onCartChange, snapshot, () => empty)
}
