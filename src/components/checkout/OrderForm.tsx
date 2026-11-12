import { CircleCheck, Loader2, Store, Truck } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CartNotices } from '@/components/cart/CartNotices'
import { EmptyCart } from '@/components/cart/CartView'
import { OrderSummary } from '@/components/cart/OrderSummary'
import { site } from '@/config/site'
import { useCart } from '@/hooks/useCart'
import { issueMessages, useCartCheck } from '@/hooks/useCartCheck'
import { clearCart, getCart } from '@/lib/cart'
import { orderLimits, validateOrder, type OrderErrors } from '@/lib/orderValidation'
import { buildOrderMessage, whatsappLink } from '@/lib/whatsapp'
import type { DeliveryMode, OrderCustomer } from '@/types/order'

interface Props {
  businessName: string
}

const emptyCustomer: OrderCustomer = { name: '', phone: '', delivery: 'recoger', address: '', neighborhood: '', notes: '' }

const inputClass =
  'h-12 w-full rounded-2xl border border-linen bg-white/70 px-4 text-base placeholder:text-stone/70 focus:border-ink focus:outline-none aria-[invalid=true]:border-clay'

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">
        {label} {optional && <span className="font-normal text-stone">(opcional)</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-clay-deep">
          {error}
        </p>
      )}
    </div>
  )
}

const deliveryOptions: { value: DeliveryMode; title: string; text: string; icon: typeof Store }[] = [
  { value: 'recoger', title: 'Recoger en la tienda', text: 'Sin costo. Te avisamos cuando esté listo.', icon: Store },
  { value: 'domicilio', title: `Envío a domicilio en ${site.city}`, text: 'El costo se confirma por WhatsApp según tu ubicación.', icon: Truck },
]

/** Resumen del pedido: datos del cliente, verificación final y envío por WhatsApp. */
export function OrderForm({ businessName }: Props) {
  const items = useCart()
  const check = useCartCheck(items)
  const [customer, setCustomer] = useState<OrderCustomer>(emptyCustomer)
  const [errors, setErrors] = useState<OrderErrors>({})
  const [submitting, setSubmitting] = useState(false)
  /** Enlace wa.me del pedido ya verificado; mientras exista se muestra el paso final. */
  const [orderLink, setOrderLink] = useState<string | null>(null)
  const [opened, setOpened] = useState(false)
  const [sent, setSent] = useState(false)
  const readyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (orderLink) readyRef.current?.focus()
  }, [orderLink])

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-[var(--radius-card)] bg-sage-soft px-6 py-16 text-center">
        <CircleCheck className="size-10 text-sage" strokeWidth={1.5} />
        <h2 className="text-2xl">¡Gracias! Recibimos tu solicitud</h2>
        <p className="max-w-md text-ink/80">
          Te responderemos por WhatsApp para confirmar disponibilidad, entrega y forma de pago. El pedido queda en firme
          cuando lo confirmemos contigo.
        </p>
        <a href="/catalogo" className="btn btn-primary">
          Seguir viendo el catálogo
        </a>
      </div>
    )
  }

  if (items.length === 0) return <EmptyCart />

  const blocked = Object.keys(check.issues).length > 0
  const update = (field: keyof OrderCustomer, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
    // Cualquier cambio invalida el enlace ya generado.
    setOrderLink(null)
  }
  const fieldProps = (field: keyof OrderCustomer, id: string) => ({
    id,
    value: customer[field],
    'aria-invalid': errors[field] ? true : undefined,
    'aria-describedby': errors[field] ? `${id}-error` : undefined,
  })

  async function handleSubmit(event: { preventDefault: () => void }) {
    event.preventDefault()
    const found = validateOrder(customer)
    setErrors(found)
    const firstInvalid = (['name', 'phone', 'address', 'neighborhood', 'notes'] as const).find((field) => found[field])
    if (firstInvalid) {
      document.getElementById(`order-${firstInvalid}`)?.focus()
      return
    }

    // Verificación final en la base de datos: precios vigentes y existencias.
    setSubmitting(true)
    const result = await check.recheck()
    setSubmitting(false)
    if (result.status !== 'ok' || Object.keys(result.issues).length > 0 || result.repriced.length > 0) {
      // Hay algo que el cliente debe revisar (problema, precio distinto o fallo de conexión).
      document.getElementById('order-notices')?.scrollIntoView({ block: 'center' })
      return
    }
    // El mensaje se arma con el carrito ya actualizado por la verificación.
    setOpened(false)
    setOrderLink(whatsappLink(buildOrderMessage(businessName, customer, getCart())))
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-12">
      <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col gap-8">
        <div id="order-notices" className="empty:hidden">
          <CartNotices check={check} onRetry={() => void check.recheck()} />
          {blocked && (
            <ul className="mt-3 flex flex-col gap-1 text-sm text-clay-deep">
              {items
                .filter((item) => check.issues[item.id])
                .map((item) => (
                  <li key={item.id}>
                    <span className="font-medium">{item.name}:</span> {issueMessages[check.issues[item.id]!]}
                  </li>
                ))}
              <li>
                <a href="/carrito" className="font-medium underline underline-offset-4">
                  Ir al carrito para ajustarlo
                </a>
              </li>
            </ul>
          )}
        </div>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-display text-2xl">Tus datos</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field id="order-name" label="Nombre" error={errors.name}>
              <input
                {...fieldProps('name', 'order-name')}
                type="text"
                autoComplete="name"
                maxLength={orderLimits.name}
                className={inputClass}
                onChange={(event) => update('name', event.target.value)}
              />
            </Field>
            <Field id="order-phone" label="Número de contacto" error={errors.phone}>
              <input
                {...fieldProps('phone', 'order-phone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={orderLimits.phone}
                placeholder="300 123 4567"
                className={inputClass}
                onChange={(event) => update('phone', event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-4">
          <legend className="mb-4 font-display text-2xl">Entrega</legend>
          <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Modalidad de entrega">
            {deliveryOptions.map(({ value, title, text, icon: Icon }) => (
              <label
                key={value}
                className="flex cursor-pointer gap-3 rounded-2xl border border-linen p-4 transition-colors has-[:checked]:border-clay has-[:checked]:bg-clay-soft/50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-clay"
              >
                <input
                  type="radio"
                  name="delivery"
                  value={value}
                  checked={customer.delivery === value}
                  onChange={() => update('delivery', value)}
                  className="sr-only"
                />
                <Icon className="mt-0.5 size-5 shrink-0 text-sage" strokeWidth={1.5} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[0.9375rem] font-medium">{title}</span>
                  <span className="text-sm text-stone">{text}</span>
                </span>
              </label>
            ))}
          </div>

          {customer.delivery === 'domicilio' && (
            <div className="grid gap-4 sm:grid-cols-2">
              <Field id="order-address" label="Dirección" error={errors.address}>
                <input
                  {...fieldProps('address', 'order-address')}
                  type="text"
                  autoComplete="street-address"
                  maxLength={orderLimits.address}
                  placeholder="Calle 123 # 45-67, apto 301"
                  className={inputClass}
                  onChange={(event) => update('address', event.target.value)}
                />
              </Field>
              <Field id="order-neighborhood" label="Barrio o localidad" error={errors.neighborhood}>
                <input
                  {...fieldProps('neighborhood', 'order-neighborhood')}
                  type="text"
                  maxLength={orderLimits.neighborhood}
                  placeholder="Chapinero"
                  className={inputClass}
                  onChange={(event) => update('neighborhood', event.target.value)}
                />
              </Field>
            </div>
          )}

          <Field id="order-notes" label="Observaciones" optional error={errors.notes}>
            <textarea
              {...fieldProps('notes', 'order-notes')}
              rows={3}
              maxLength={orderLimits.notes}
              placeholder="Horario de entrega, empaque de regalo, dudas…"
              className={`${inputClass} h-auto py-3`}
              onChange={(event) => update('notes', event.target.value)}
            />
          </Field>
        </fieldset>

        {!orderLink && (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button type="submit" className="btn btn-primary min-h-12 disabled:opacity-60" disabled={submitting || blocked}>
              {submitting && <Loader2 className="size-4 animate-spin" />}
              {submitting ? 'Verificando disponibilidad…' : 'Revisar y preparar pedido'}
            </button>
            <a href="/carrito" className="btn btn-outline min-h-12">
              Volver al carrito
            </a>
          </div>
        )}

        {orderLink && (
          <div ref={readyRef} tabIndex={-1} className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-sage/40 bg-sage-soft p-6 outline-none">
            <h2 className="text-2xl">Tu pedido está listo para enviar</h2>
            <p className="text-sm leading-relaxed text-ink/80">
              Verificamos precios y disponibilidad. Al tocar el botón se abre WhatsApp con el resumen escrito:{' '}
              <strong className="font-medium">solo falta que lo envíes</strong>. El pedido queda pendiente hasta que te lo
              confirmemos.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={orderLink}
                target="_blank"
                rel="noopener noreferrer"
                className="btn min-h-12 bg-[#1f7a4d] text-white hover:bg-[#186440]"
                onClick={() => setOpened(true)}
              >
                Enviar pedido por WhatsApp
              </a>
              <button type="button" className="btn btn-outline min-h-12" onClick={() => setOrderLink(null)}>
                Editar datos
              </button>
            </div>
            {opened && (
              <div className="flex flex-col gap-3 border-t border-sage/30 pt-4">
                <p className="text-sm text-ink/80">¿Ya enviaste el mensaje? Vacía el carrito para empezar de nuevo.</p>
                <button
                  type="button"
                  className="btn btn-outline self-start"
                  onClick={() => {
                    setSent(true)
                    clearCart()
                  }}
                >
                  Sí, ya lo envié
                </button>
              </div>
            )}
          </div>
        )}
      </form>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <OrderSummary items={items} delivery={customer.delivery} showItems />
      </div>
    </div>
  )
}
