import type { CartCheck } from '@/hooks/useCartCheck'

interface Props {
  check: CartCheck
  onRetry: () => void
}

/** Avisos de la verificación del carrito: cambios de precio, problemas y fallos de conexión. */
export function CartNotices({ check, onRetry }: Props) {
  const issueCount = Object.keys(check.issues).length
  return (
    <div className="flex flex-col gap-3 empty:hidden" aria-live="polite">
      {check.status === 'error' && (
        <p role="alert" className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[2px] border border-clay/20 bg-clay-soft px-4 py-3 text-sm text-clay-deep">
          {check.error}
          <button type="button" className="font-medium underline underline-offset-4" onClick={onRetry}>
            Reintentar
          </button>
        </p>
      )}
      {issueCount > 0 && (
        <p role="alert" className="rounded-[2px] border border-clay/20 bg-clay-soft px-4 py-3 text-sm text-clay-deep">
          {issueCount === 1
            ? 'Un producto de tu carrito necesita un ajuste antes de continuar.'
            : `${issueCount} productos de tu carrito necesitan un ajuste antes de continuar.`}
        </p>
      )}
      {check.repriced.length > 0 && (
        <p className="rounded-[2px] bg-sage-soft px-4 py-3 text-sm text-ink/80">
          Actualizamos el precio de {check.repriced.join(', ')} al valor vigente.
        </p>
      )}
    </div>
  )
}
