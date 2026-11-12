import { ImageOff, ShoppingBag, Trash2 } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { issueMessages, useCartCheck } from '@/hooks/useCartCheck'
import { removeFromCart, setQuantity } from '@/lib/cart'
import { formatCurrency } from '@/lib/formatCurrency'
import { productImageUrl } from '@/services/supabase/client'
import { CartNotices } from './CartNotices'
import { OrderSummary } from './OrderSummary'
import { QuantityStepper } from './QuantityStepper'

export function EmptyCart() {
  return (
    <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] bg-sand/60 px-6 py-16 text-center">
      <ShoppingBag className="size-10 text-clay" strokeWidth={1.5} />
      <h2 className="text-2xl">Tu carrito está vacío</h2>
      <p className="max-w-sm text-stone">Explora el catálogo y agrega lo que te guste. Tu selección se guarda en este dispositivo.</p>
      <a href="/catalogo" className="btn btn-primary">
        Explorar catálogo
      </a>
    </div>
  )
}

/** Página del carrito: productos, cantidades, subtotales y verificación de disponibilidad. */
export function CartView() {
  const items = useCart()
  const check = useCartCheck(items)

  if (items.length === 0) return <EmptyCart />

  const blocked = Object.keys(check.issues).length > 0

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
      <div className="flex min-w-0 flex-col gap-5">
        <CartNotices check={check} onRetry={() => void check.recheck()} />

        <ul className="flex flex-col divide-y divide-linen border-y border-linen">
          {items.map((item) => {
            const issue = check.issues[item.id]
            return (
              <li key={item.id} className="flex gap-4 py-5">
                <a href={`/productos/${item.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                  {item.image ? (
                    <img
                      src={productImageUrl(item.image)}
                      alt=""
                      width={96}
                      height={120}
                      loading="lazy"
                      className={`h-[7.5rem] w-24 rounded-2xl bg-sand object-cover ${issue === 'gone' || issue === 'sold_out' ? 'opacity-50 grayscale' : ''}`}
                    />
                  ) : (
                    <span className="grid h-[7.5rem] w-24 place-items-center rounded-2xl bg-sand text-linen">
                      <ImageOff className="size-7" />
                    </span>
                  )}
                </a>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-sans text-[0.9375rem] leading-snug font-medium tracking-normal">
                        <a href={`/productos/${item.slug}`} className="hover:underline">
                          {item.name}
                        </a>
                      </h2>
                      <p className="text-sm text-stone">{formatCurrency(item.price)} c/u</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      aria-label={`Quitar ${item.name} del carrito`}
                      className="-mt-2 -mr-2 grid size-11 shrink-0 place-items-center rounded-full text-stone transition-colors hover:bg-sand hover:text-clay-deep"
                    >
                      <Trash2 className="size-[1.125rem]" />
                    </button>
                  </div>

                  {issue && (
                    <p role="alert" className="text-sm font-medium text-clay-deep">
                      {issueMessages[issue]}
                    </p>
                  )}

                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3">
                    {issue === 'gone' || issue === 'sold_out' ? (
                      <span />
                    ) : (
                      <QuantityStepper
                        size="md"
                        label={item.name}
                        value={item.quantity}
                        onChange={(quantity) => setQuantity(item.id, quantity)}
                      />
                    )}
                    <p className="font-medium tabular-nums" aria-label={`Subtotal: ${formatCurrency(item.price * item.quantity)}`}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <a href="/catalogo" className="self-start text-sm font-medium text-clay underline-offset-4 hover:underline">
          ← Seguir comprando
        </a>
      </div>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary items={items}>
          {blocked ? (
            <button type="button" disabled className="btn w-full cursor-not-allowed bg-linen text-stone">
              Ajusta tu carrito para continuar
            </button>
          ) : (
            <a href="/pedido" className="btn btn-primary w-full">
              Continuar con el pedido
            </a>
          )}
          <p className="min-h-5 text-center text-xs text-stone" role="status">
            {check.status === 'checking' ? 'Verificando disponibilidad…' : check.status === 'ok' && !blocked ? '✓ Disponibilidad verificada' : ''}
          </p>
        </OrderSummary>
      </div>
    </div>
  )
}
