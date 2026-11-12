import { useEffect, useRef, useState } from 'react'
import { addToCart, MAX_QUANTITY, type CartItem } from '@/lib/cart'

interface Props {
  product: Omit<CartItem, 'quantity'>
  soldOut: boolean
}

const stepButton =
  'grid size-12 place-items-center rounded-full text-xl transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-35'

/** Selector de cantidad y botón "Agregar al carrito" de la página de producto. */
export function AddToCart({ product, soldOut }: Props) {
  const [quantity, setQuantity] = useState(1)
  const [added, setAdded] = useState<number | null>(null)
  const [full, setFull] = useState(false)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (soldOut) {
    return (
      <button type="button" disabled className="btn w-full cursor-not-allowed bg-linen text-stone">
        Agotado por ahora
      </button>
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
      <div className="flex flex-wrap gap-3">
        <div className="flex items-center rounded-full border border-linen" role="group" aria-label="Cantidad">
          <button
            type="button"
            className={stepButton}
            onClick={() => setQuantity((value) => value - 1)}
            disabled={quantity <= 1}
            aria-label="Quitar una unidad"
          >
            −
          </button>
          <output className="w-8 text-center font-medium tabular-nums" aria-live="polite">
            {quantity}
          </output>
          <button
            type="button"
            className={stepButton}
            onClick={() => setQuantity((value) => value + 1)}
            disabled={quantity >= MAX_QUANTITY}
            aria-label="Agregar una unidad"
          >
            +
          </button>
        </div>
        <button type="button" className="btn btn-primary min-h-12 flex-1" onClick={handleAdd}>
          Agregar al carrito
        </button>
      </div>

      <p role="status" className="min-h-6 text-sm">
        {added !== null && (
          <span className="text-sage">
            ✓ Agregado. Llevas {added} {added === 1 ? 'unidad' : 'unidades'} de este producto.{' '}
            <a href="/carrito" className="font-medium text-clay underline underline-offset-4">
              Ver carrito
            </a>
          </span>
        )}
        {full && <span className="text-clay-deep">Tu carrito ya tiene el máximo de productos distintos.</span>}
      </p>
    </div>
  )
}
