import { useCallback, useEffect, useRef, useState } from 'react'
import { getCart, refreshCartItems, type CartItem } from '@/lib/cart'
import { checkCart } from '@/services/supabase/cart'
import { SupabaseError } from '@/services/supabase/client'

/** Motivo por el que una línea del carrito no se puede pedir tal como está. */
export type LineIssue = 'gone' | 'sold_out' | 'insufficient'

export const issueMessages: Record<LineIssue, string> = {
  gone: 'Este producto ya no está disponible. Quítalo para continuar.',
  sold_out: 'Se agotó. Quítalo para continuar.',
  insufficient: 'No hay tantas unidades disponibles. Reduce la cantidad.',
}

export interface CartCheck {
  /** checking: consultando · ok: verificado · error: no se pudo consultar. */
  status: 'checking' | 'ok' | 'error'
  issues: Record<string, LineIssue>
  /** Productos cuyo precio cambió desde que se agregaron (ya actualizados en el carrito). */
  repriced: string[]
  error: string | null
}

const initial: CartCheck = { status: 'checking', issues: {}, repriced: [], error: null }

async function verify(): Promise<CartCheck> {
  const items = getCart()
  if (items.length === 0) return { ...initial, status: 'ok' }
  try {
    const lines = await checkCart(items)
    const issues: Record<string, LineIssue> = {}
    const repriced: string[] = []
    const fresh: Omit<CartItem, 'quantity'>[] = []
    for (const line of lines) {
      if (!line.found) issues[line.product_id] = 'gone'
      else {
        if (line.availability === 'agotado') issues[line.product_id] = 'sold_out'
        else if (!line.quantity_available) issues[line.product_id] = 'insufficient'
        const stored = items.find((item) => item.id === line.product_id)
        if (stored && stored.price !== line.price) repriced.push(line.name)
        fresh.push({ id: line.product_id, slug: line.slug, name: line.name, price: line.price, image: line.main_image_path })
      }
    }
    // El carrito queda con los precios y nombres de la base de datos, no con los del navegador.
    refreshCartItems(fresh)
    return { status: 'ok', issues, repriced, error: null }
  } catch (error) {
    const message =
      error instanceof SupabaseError && error.code === 'P0001'
        ? error.message
        : 'No pudimos verificar la disponibilidad. Revisa tu conexión e inténtalo de nuevo.'
    return { status: 'error', issues: {}, repriced: [], error: message }
  }
}

/**
 * Verifica el carrito contra la base de datos al abrir la página y cada vez que
 * cambian los productos o las cantidades. `recheck` fuerza una verificación y
 * devuelve su resultado (se usa justo antes de enviar el pedido).
 */
export function useCartCheck(items: CartItem[]): CartCheck & { recheck: () => Promise<CartCheck> } {
  const [check, setCheck] = useState<CartCheck>(initial)
  const latest = useRef(0)
  // Solo productos y cantidades: un cambio de precio aplicado por la verificación no la repite.
  const key = items.map((item) => `${item.id}:${item.quantity}`).join(',')

  const recheck = useCallback(async () => {
    const run = ++latest.current
    setCheck((current) => ({ ...current, status: 'checking' }))
    const result = await verify()
    // Si mientras tanto empezó otra verificación, manda la más reciente.
    if (run === latest.current) {
      setCheck((current) => ({ ...result, repriced: [...new Set([...current.repriced, ...result.repriced])] }))
    }
    return result
  }, [])

  useEffect(() => {
    // Breve espera: varios toques seguidos en +/− hacen una sola consulta.
    const timer = window.setTimeout(() => void recheck(), 350)
    return () => window.clearTimeout(timer)
  }, [key, recheck])

  return { ...check, recheck }
}
