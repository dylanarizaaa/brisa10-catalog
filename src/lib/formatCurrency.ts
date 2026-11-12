const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

/** 45000 → "$ 45.000". Los precios son enteros en pesos colombianos. */
export function formatCurrency(value: number): string {
  return cop.format(value)
}
