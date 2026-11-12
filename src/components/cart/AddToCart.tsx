import { Check, ShoppingBag } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { addToCart, type CartItem } from '@/lib/cart'
import { QuantityStepper } from './QuantityStepper'

interface Props {
  product: Omit<CartItem, 'quantity'>
  soldOut: boolean
}

/** Selector de cantidad y botón "Agregar al carrito" de la página de producto. */
export function AddToCart({ product, soldOut }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState<number | null>(null)
  const [full, setFull] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (soldOut) {
    return (
      <Button type="button" variant="secondary" size="lg" disabled className="w-full">
        Agotado por ahora
      </Button>
    )
  }

  function handleAdd() {
    const total = addToCart(product, quantity)
    if (total === 0) {
      setFull(true)
      return
    }
    setFull(false)
    setAdded(total)
    setQuantity(1)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setAdded(null), 6000)
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button type="button" size="lg" className="min-w-0 flex-1 px-4 sm:px-9" onClick={handleAdd}>
          <ShoppingBag />
          Agregar al carrito
        </Button>
      </div>

      <div role="status" className="empty:hidden">
        {added !== null && (
          <p className="flex animate-in items-center gap-3 rounded-[2px] bg-sage-soft px-4 py-3 text-sm text-ink/85 duration-300 fade-in slide-in-from-bottom-1">
            <span className="grid size-6 shrink-0 place-items-center rounded-full bg-sage text-white">
              <Check className="size-3.5" strokeWidth={3} />
            </span>
            <span>
              Agregado. Llevas {added} {added === 1 ? 'unidad' : 'unidades'} de este producto.{' '}
              <a href="/carrito" className="font-medium text-clay-deep underline underline-offset-4">
                Ver carrito
              </a>
            </span>
          </p>
        )}
        {full && <p className="rounded-[2px] bg-clay-soft px-4 py-3 text-sm text-clay-deep">Tu carrito ya tiene el máximo de productos distintos.</p>}
      </div>
    </div>
  )
}
