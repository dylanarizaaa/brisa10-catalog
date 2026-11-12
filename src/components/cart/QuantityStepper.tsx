import { Minus, Plus } from 'lucide-react'
import { MAX_QUANTITY } from '@/lib/cart'

interface Props {
  value: number
  onChange: (value: number) => void
  /** Nombre del producto, para lectores de pantalla. */
  label?: string
  size?: 'md' | 'lg'
}

export function QuantityStepper({ value, onChange, label, size = 'lg' }: Props) {
  const button = `grid ${size === 'lg' ? 'size-11' : 'size-9'} place-items-center rounded-full transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-35`
  return (
    <div
      className={`inline-flex items-center rounded-full border border-input bg-card p-1 ${size === 'lg' ? 'h-13' : 'h-11'}`}
      role="group"
      aria-label={label ? `Cantidad de ${label}` : 'Cantidad'}
    >
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Quitar una unidad">
        <Minus className="size-4" />
      </button>
      <output className="w-9 text-center font-medium tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="Agregar una unidad"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
