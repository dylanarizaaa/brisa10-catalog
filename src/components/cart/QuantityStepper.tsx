import { MAX_QUANTITY } from '@/lib/cart'

interface Props {
  value: number
  onChange: (value: number) => void
  /** Nombre del producto, para lectores de pantalla. */
  label?: string
  size?: 'md' | 'lg'
}

export function QuantityStepper({ value, onChange, label, size = 'lg' }: Props) {
  const button = `grid ${size === 'lg' ? 'size-12 text-xl' : 'size-11 text-lg'} place-items-center rounded-full transition-colors hover:bg-sand disabled:pointer-events-none disabled:opacity-35`
  return (
    <div
      className="inline-flex items-center rounded-full border border-linen"
      role="group"
      aria-label={label ? `Cantidad de ${label}` : 'Cantidad'}
    >
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label="Quitar una unidad">
        −
      </button>
      <output className="w-8 text-center font-medium tabular-nums" aria-live="polite">
        {value}
      </output>
      <button
        type="button"
        className={button}
        onClick={() => onChange(value + 1)}
        disabled={value >= MAX_QUANTITY}
        aria-label="Agregar una unidad"
      >
        +
      </button>
    </div>
  )
}
