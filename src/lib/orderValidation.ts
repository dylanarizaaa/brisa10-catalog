import type { OrderCustomer } from '@/types/order'

export type OrderErrors = Partial<Record<keyof OrderCustomer, string>>

export const orderLimits = { name: 80, phone: 20, address: 120, neighborhood: 80, notes: 300 } as const

/** Valida los datos del cliente. Devuelve un objeto vacío si todo está bien. */
export function validateOrder(customer: OrderCustomer): OrderErrors {
  const errors: OrderErrors = {}
  const name = customer.name.trim()
  const digits = customer.phone.replace(/\D/g, '')

  if (name.length < 2) errors.name = 'Escribe tu nombre'
  else if (name.length > orderLimits.name) errors.name = `Máximo ${orderLimits.name} caracteres`

  if (!customer.phone.trim()) errors.phone = 'Escribe tu número de contacto'
  else if (!/^[\d\s+()-]+$/.test(customer.phone) || digits.length < 7 || digits.length > 15) {
    errors.phone = 'Escribe un número válido, por ejemplo 300 123 4567'
  }

  if (customer.delivery === 'domicilio') {
    if (customer.address.trim().length < 5) errors.address = 'Escribe la dirección de entrega'
    else if (customer.address.length > orderLimits.address) errors.address = `Máximo ${orderLimits.address} caracteres`
    if (customer.neighborhood.trim().length < 2) errors.neighborhood = 'Escribe el barrio o la localidad'
    else if (customer.neighborhood.length > orderLimits.neighborhood) {
      errors.neighborhood = `Máximo ${orderLimits.neighborhood} caracteres`
    }
  }

  if (customer.notes.length > orderLimits.notes) errors.notes = `Máximo ${orderLimits.notes} caracteres`
  return errors
}
