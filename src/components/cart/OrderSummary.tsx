import type { ReactNode } from 'react'
import { site } from '@/config/site'
import { cartCount, cartTotal, type CartItem } from '@/lib/cart'
import { formatCurrency } from '@/lib/formatCurrency'
import type { DeliveryMode } from '@/types/order'

interface Props {
  items: CartItem[]
  /** Sin modalidad elegida (página del carrito) el envío se muestra como "por confirmar". */
  delivery?: DeliveryMode
  /** Lista detallada de productos (página del pedido). */
  showItems?: boolean
  children?: ReactNode
}

/** Totales del pedido. Siempre "estimado": el negocio confirma al responder por WhatsApp. */
export function OrderSummary({ items, delivery, showItems = false, children }: Props) {
  const subtotal = cartTotal(items)
  const count = cartCount(items)
  const pickup = delivery === 'recoger'

  return (
    <section aria-labelledby="summary-title" className="flex flex-col gap-5 rounded-[var(--radius-card)] bg-cream p-6 sm:p-8">
      <h2 id="summary-title" className="text-[2rem] leading-none">
        Resumen
      </h2>

      {showItems && (
        <ul className="flex flex-col gap-3 border-b border-linen pb-5 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4">
              <span className="min-w-0">
                <span className="font-medium tabular-nums">{item.quantity} ×</span> {item.name}
                <span className="block text-xs text-stone">{formatCurrency(item.price)} c/u</span>
              </span>
              <span className="shrink-0 tabular-nums">{formatCurrency(item.price * item.quantity)}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="flex flex-col gap-3 text-[0.9375rem]">
        <div className="flex justify-between gap-4">
          <dt className="text-stone">
            Subtotal ({count} {count === 1 ? 'producto' : 'productos'})
          </dt>
          <dd className="tabular-nums">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-stone">Envío</dt>
          <dd>{pickup ? 'Sin costo (recoges en tienda)' : site.shipping.costLabel}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-linen pt-4">
          <dt className="font-medium">Total estimado</dt>
          <dd className="text-right">
            <span className="text-2xl font-semibold tabular-nums">{formatCurrency(subtotal)}</span>
            {!pickup && <span className="block text-xs text-stone">+ envío</span>}
          </dd>
        </div>
      </dl>

      {children}

      <p className="border-t border-linen pt-4 text-xs leading-relaxed text-stone">
        Esto es una solicitud de pedido, no una compra pagada. Te confirmamos disponibilidad, entrega y forma de pago por
        WhatsApp.
      </p>
    </section>
  )
}
