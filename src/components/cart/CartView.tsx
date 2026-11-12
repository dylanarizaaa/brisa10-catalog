import { ArrowLeft, ArrowRight, ImageOff, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
    <div className="flex flex-col items-center gap-5 border-y border-linen px-6 py-20 text-center sm:py-24">
      <span className="grid size-16 place-items-center rounded-full bg-sand text-ink">
        <ShoppingBag className="size-7" strokeWidth={1.25} />
      </span>
      <h2 className="text-[2.25rem] leading-tight">Tu carrito está vacío</h2>
      <p className="max-w-sm leading-relaxed text-stone">Explora el catálogo y agrega lo que te guste. Tu selección se guarda en este dispositivo.</p>
      <Button asChild size="lg">
        <a href="/catalogo">Explorar catálogo</a>
      </Button>
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

        <ul className="flex flex-col">
          {items.map((item) => {
            const issue = check.issues[item.id]
            return (
              <li
                key={item.id}
                className={`flex gap-4 border-b py-5 transition-colors first:border-t sm:gap-6 ${issue ? 'border-clay/50' : 'border-linen'}`}
              >
                <a href={`/productos/${item.slug}`} className="shrink-0" tabIndex={-1} aria-hidden="true">
                  {item.image ? (
                    <img
                      src={productImageUrl(item.image)}
                      alt=""
                      width={96}
                      height={120}
                      loading="lazy"
                      className={`h-[7.5rem] w-24 rounded-[2px] bg-sand object-cover sm:h-40 sm:w-32 ${issue === 'gone' || issue === 'sold_out' ? 'opacity-50 grayscale' : ''}`}
                    />
                  ) : (
                    <span className="grid h-[7.5rem] w-24 place-items-center rounded-[2px] bg-sand text-linen sm:h-40 sm:w-32">
                      <ImageOff className="size-7" />
                    </span>
                  )}
                </a>

                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-display text-[1.375rem] leading-tight sm:text-2xl">
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
                      className="-mt-1.5 -mr-1.5 grid size-10 shrink-0 place-items-center rounded-full text-stone transition-colors hover:bg-clay-soft hover:text-clay-deep"
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
                    <p className="text-[0.9375rem] font-semibold tabular-nums" aria-label={`Subtotal: ${formatCurrency(item.price * item.quantity)}`}>
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </li>
            )
          })}
        </ul>

        <Button asChild variant="ghost" className="self-start">
          <a href="/catalogo">
            <ArrowLeft />
            Seguir comprando
          </a>
        </Button>
      </div>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary items={items}>
          {blocked ? (
            <Button type="button" variant="secondary" size="lg" disabled className="w-full">
              Ajusta tu carrito para continuar
            </Button>
          ) : (
            <Button asChild size="lg" className="group w-full">
              <a href="/pedido">
                Continuar con el pedido
                <ArrowRight className="transition-transform duration-200 group-hover:translate-x-1" />
              </a>
            </Button>
          )}
          <p className="min-h-5 text-center text-xs text-stone" role="status">
            {check.status === 'checking' ? 'Verificando disponibilidad…' : check.status === 'ok' && !blocked ? '✓ Disponibilidad verificada' : ''}
          </p>
        </OrderSummary>
      </div>
    </div>
  )
}
