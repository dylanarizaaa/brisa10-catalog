import { site } from '@/config/site'
import { cartTotal, type CartItem } from '@/lib/cart'
import { formatCurrency } from '@/lib/formatCurrency'
import type { OrderCustomer } from '@/types/order'

/** Enlace wa.me con el mensaje codificado. Devuelve null si no hay número configurado. */
export function whatsappLink(message: string): string | null {
  if (!site.whatsappNumber) return null
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}

/** Quita los caracteres con los que WhatsApp da formato (*negrita*, _cursiva_…) y los saltos de línea. */
function plain(text: string): string {
  return text.replace(/[*_~`]/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Mensaje del pedido para WhatsApp. Es una solicitud: el negocio confirma
 * disponibilidad, envío y forma de pago al responder.
 */
export function buildOrderMessage(businessName: string, customer: OrderCustomer, items: CartItem[]): string {
  const subtotal = cartTotal(items)
  const lines = [
    `*Solicitud de pedido — ${plain(businessName)}*`,
    '_Pendiente de confirmación_',
    '',
    `*Cliente:* ${plain(customer.name)}`,
    `*Teléfono:* ${plain(customer.phone)}`,
    '',
    '*Productos*',
    ...items.map(
      (item) =>
        `• ${item.quantity} × ${plain(item.name)} — ${formatCurrency(item.price)} c/u = ${formatCurrency(item.price * item.quantity)}`,
    ),
    '',
    `*Subtotal:* ${formatCurrency(subtotal)}`,
  ]
  if (customer.delivery === 'domicilio') {
    lines.push(
      `*Envío:* ${site.shipping.costLabel.toLowerCase()}`,
      `*Total estimado:* ${formatCurrency(subtotal)} + envío`,
      '',
      `*Entrega:* Domicilio en ${site.city}`,
      `*Dirección:* ${plain(customer.address)}`,
      `*Barrio o localidad:* ${plain(customer.neighborhood)}`,
    )
  } else {
    lines.push(`*Total estimado:* ${formatCurrency(subtotal)}`, '', '*Entrega:* Recoger en la tienda')
  }
  if (customer.notes.trim()) lines.push(`*Observaciones:* ${plain(customer.notes)}`)
  return lines.join('\n')
}
