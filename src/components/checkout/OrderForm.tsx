import { ArrowLeft, CircleCheck, Loader2, PencilLine, Store, Truck } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { CartNotices } from '@/components/cart/CartNotices'
import { EmptyCart } from '@/components/cart/CartView'
import { OrderSummary } from '@/components/cart/OrderSummary'
import SocialIconWhatsApp from '@/components/common/WhatsAppIcon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Textarea } from '@/components/ui/textarea'
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

function Field({ id, label, optional, error, children }: { id: string; label: string; optional?: boolean; error?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>
        {label} {optional && <span className="font-normal text-stone">(opcional)</span>}
      </Label>
      {children}
      {error && (
        <p id={`${id}-error`} className="text-sm text-clay-deep">
          {error}
        </p>
      )}
    </div>
  )
}

function StepTitle({ step, children }: { step: number; children: ReactNode }) {
  return (
    <legend className="float-left mb-6 flex w-full items-center gap-3 font-display text-[2rem] leading-none">
      <span className="grid size-8 place-items-center rounded-full border border-ink font-sans text-xs font-semibold" aria-hidden="true">
        {step}
      </span>
      {children}
    </legend>
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
      <div className="flex flex-col items-center gap-5 rounded-[var(--radius-card)] bg-sage-soft px-6 py-20 text-center sm:py-24">
        <span className="grid size-16 place-items-center rounded-full bg-sage text-white">
          <CircleCheck className="size-7" strokeWidth={1.5} />
        </span>
        <h2 className="text-[2.25rem] leading-tight sm:text-5xl">¡Gracias! Recibimos tu solicitud</h2>
        <p className="max-w-md leading-relaxed text-ink/80">
          Te responderemos por WhatsApp para confirmar disponibilidad, entrega y forma de pago. El pedido queda en firme
          cuando lo confirmemos contigo.
        </p>
        <Button asChild size="lg">
          <a href="/catalogo">Seguir viendo el catálogo</a>
        </Button>
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
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_25rem] lg:gap-12">
      <form onSubmit={handleSubmit} noValidate className="flex min-w-0 flex-col gap-10">
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

        <fieldset className="border-t border-linen pt-8">
          <StepTitle step={1}>Tus datos</StepTitle>
          <div className="clear-both grid gap-5 sm:grid-cols-2">
            <Field id="order-name" label="Nombre" error={errors.name}>
              <Input
                {...fieldProps('name', 'order-name')}
                type="text"
                autoComplete="name"
                maxLength={orderLimits.name}
                placeholder="¿Cómo te llamas?"
                onChange={(event) => update('name', event.target.value)}
              />
            </Field>
            <Field id="order-phone" label="Número de contacto" error={errors.phone}>
              <Input
                {...fieldProps('phone', 'order-phone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                maxLength={orderLimits.phone}
                placeholder="300 123 4567"
                onChange={(event) => update('phone', event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        <fieldset className="border-t border-linen pt-8">
          <StepTitle step={2}>Entrega</StepTitle>
          <div className="clear-both flex flex-col gap-5">
            <RadioGroup
              value={customer.delivery}
              onValueChange={(value) => update('delivery', value)}
              aria-label="Modalidad de entrega"
              className="grid gap-3 sm:grid-cols-2"
            >
              {deliveryOptions.map(({ value, title, text, icon: Icon }) => (
                <Label
                  key={value}
                  htmlFor={`delivery-${value}`}
                  className="flex cursor-pointer items-start gap-3 rounded-[2px] border border-input bg-paper p-4 leading-normal font-normal transition-colors select-auto hover:border-ink/50 has-data-checked:border-ink has-data-checked:bg-cream"
                >
                  <RadioGroupItem id={`delivery-${value}`} value={value} className="mt-0.5" />
                  <span className="flex flex-1 flex-col gap-1">
                    <span className="flex items-center justify-between gap-2 text-[0.9375rem] font-medium">
                      {title}
                      <Icon className="size-5 shrink-0 text-ink" strokeWidth={1.25} />
                    </span>
                    <span className="text-sm text-stone">{text}</span>
                  </span>
                </Label>
              ))}
            </RadioGroup>

            {customer.delivery === 'domicilio' && (
              <div className="grid animate-in gap-5 duration-300 fade-in slide-in-from-top-1 sm:grid-cols-2">
                <Field id="order-address" label="Dirección" error={errors.address}>
                  <Input
                    {...fieldProps('address', 'order-address')}
                    type="text"
                    autoComplete="street-address"
                    maxLength={orderLimits.address}
                    placeholder="Calle 123 # 45-67, apto 301"
                    onChange={(event) => update('address', event.target.value)}
                  />
                </Field>
                <Field id="order-neighborhood" label="Barrio o localidad" error={errors.neighborhood}>
                  <Input
                    {...fieldProps('neighborhood', 'order-neighborhood')}
                    type="text"
                    maxLength={orderLimits.neighborhood}
                    placeholder="Chapinero"
                    onChange={(event) => update('neighborhood', event.target.value)}
                  />
                </Field>
              </div>
            )}

            <Field id="order-notes" label="Observaciones" optional error={errors.notes}>
              <Textarea
                {...fieldProps('notes', 'order-notes')}
                rows={3}
                maxLength={orderLimits.notes}
                placeholder="Horario de entrega, empaque de regalo, dudas…"
                onChange={(event) => update('notes', event.target.value)}
              />
            </Field>
          </div>
        </fieldset>

        {!orderLink && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="ghost" size="lg">
              <a href="/carrito">
                <ArrowLeft />
                Volver al carrito
              </a>
            </Button>
            <Button type="submit" size="lg" disabled={submitting || blocked}>
              {submitting && <Loader2 className="animate-spin" />}
              {submitting ? 'Verificando disponibilidad…' : 'Revisar y preparar pedido'}
            </Button>
          </div>
        )}

        {orderLink && (
          <div
            ref={readyRef}
            tabIndex={-1}
            className="flex animate-in flex-col gap-5 rounded-[var(--radius-card)] bg-sage-soft p-6 outline-none duration-500 fade-in slide-in-from-bottom-2 sm:p-8"
          >
            <div className="flex items-start gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sage text-white">
                <CircleCheck className="size-5" strokeWidth={1.75} />
              </span>
              <div className="flex flex-col gap-2">
                <h2 className="text-[2rem] leading-tight">Tu pedido está listo para enviar</h2>
                <p className="text-sm leading-relaxed text-ink/80">
                  Verificamos precios y disponibilidad. Al tocar el botón se abre WhatsApp con el resumen escrito:{' '}
                  <strong className="font-medium">solo falta que lo envíes</strong>. El pedido queda pendiente hasta que te
                  lo confirmemos.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="whatsapp" size="lg">
                <a href={orderLink} target="_blank" rel="noopener noreferrer" onClick={() => setOpened(true)}>
                  <SocialIconWhatsApp className="size-5" />
                  Enviar pedido por WhatsApp
                </a>
              </Button>
              <Button type="button" variant="outline" size="lg" onClick={() => setOrderLink(null)}>
                <PencilLine />
                Editar datos
              </Button>
            </div>
            {opened && (
              <div className="flex flex-col gap-3 border-t border-sage/25 pt-5 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-ink/80">¿Ya enviaste el mensaje? Vacía el carrito para empezar de nuevo.</p>
                <Button
                  type="button"
                  variant="dark"
                  className="self-start"
                  onClick={() => {
                    setSent(true)
                    clearCart()
                  }}
                >
                  Sí, ya lo envié
                </Button>
              </div>
            )}
          </div>
        )}
      </form>

      <div className="lg:sticky lg:top-28 lg:self-start">
        <OrderSummary items={items} delivery={customer.delivery} showItems />
      </div>
    </div>
  )
}
