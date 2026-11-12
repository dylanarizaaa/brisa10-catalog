import { site } from '@/config/site'

/** Enlace wa.me con el mensaje codificado. Devuelve null si no hay número configurado. */
export function whatsappLink(message: string): string | null {
  if (!site.whatsappNumber) return null
  return `https://wa.me/${site.whatsappNumber}?text=${encodeURIComponent(message)}`
}
