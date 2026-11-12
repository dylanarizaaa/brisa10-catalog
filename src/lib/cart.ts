/**
 * Carrito del cliente, guardado en localStorage. Sin dependencias de React:
 * lo usan tanto las islas como el contador del encabezado.
 *
 * El carrito es una intención de pedido: no reserva ni descuenta inventario.
 * Nombre y precio se guardan solo para mostrar; antes de enviar el pedido se
 * verifican de nuevo en la base de datos (check_public_cart).
 */

export interface CartItem {
  id: string
  slug: string
  name: string
  price: number
  /** Ruta de la foto en el bucket, o null. */
  image: string | null
  quantity: number
}

export const MAX_QUANTITY = 99
const MAX_LINES = 50
const STORAGE_KEY = 'brisa10:cart:v1'
const CHANGE_EVENT = 'cart:change'

function isItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.id === 'string' &&
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    (typeof item.image === 'string' || item.image === null) &&
    typeof item.quantity === 'number' &&
    Number.isInteger(item.quantity) &&
    item.quantity >= 1
  )
}

export function getCart(): CartItem[] {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
    return Array.isArray(parsed) ? parsed.filter(isItem) : []
  } catch {
    // localStorage bloqueado (modo privado) o contenido dañado: carrito vacío.
    return []
  }
}

function save(items: CartItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // Sin almacenamiento el carrito no persiste, pero la página sigue funcionando.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

const clamp = (quantity: number) => Math.min(Math.max(Math.trunc(quantity), 1), MAX_QUANTITY)

/** Agrega unidades de un producto (o suma a las que ya había). Devuelve la cantidad resultante. */
export function addToCart(product: Omit<CartItem, 'quantity'>, quantity: number): number {
  const items = getCart()
  const existing = items.find((item) => item.id === product.id)
  if (existing) {
    Object.assign(existing, product, { quantity: clamp(existing.quantity + quantity) })
    save(items)
    return existing.quantity
  }
  if (items.length >= MAX_LINES) return 0
  items.push({ ...product, quantity: clamp(quantity) })
  save(items)
  return clamp(quantity)
}

export function setQuantity(id: string, quantity: number): void {
  save(getCart().map((item) => (item.id === id ? { ...item, quantity: clamp(quantity) } : item)))
}

export function removeFromCart(id: string): void {
  save(getCart().filter((item) => item.id !== id))
}

export function clearCart(): void {
  save([])
}

export function cartCount(items: CartItem[] = getCart()): number {
  return items.reduce((sum, item) => sum + item.quantity, 0)
}

export function cartTotal(items: CartItem[] = getCart()): number {
  return items.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

/** Avisa de cambios hechos en esta pestaña o en otra. Devuelve la función para dejar de escuchar. */
export function onCartChange(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener()
  }
  window.addEventListener(CHANGE_EVENT, listener)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(CHANGE_EVENT, listener)
    window.removeEventListener('storage', onStorage)
  }
}
