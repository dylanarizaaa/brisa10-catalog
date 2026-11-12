/**
 * Configuración del sitio. Lo que cambia entre entornos sale de variables PUBLIC_*;
 * el resto (redes, textos de envío) se edita aquí.
 */

const whatsappNumber = (import.meta.env.PUBLIC_WHATSAPP_NUMBER ?? '').replace(/\D/g, '')

export const site = {
  /** Nombre de respaldo; el real llega de business_settings (app administrativa). */
  name: 'Brisa10',
  tagline: 'Decoración, regalos y detalles especiales en Bogotá',
  description:
    'Tienda de decoración, cerámicas, peluches y regalos en Bogotá. Explora el catálogo y haz tu pedido por WhatsApp.',
  city: 'Bogotá',
  locale: 'es-CO',
  /** Solo dígitos, con indicativo del país. Vacío oculta los botones de WhatsApp. */
  whatsappNumber,

  // PENDIENTE: reemplazar por los perfiles reales del negocio. Una cadena vacía oculta el enlace.
  social: {
    instagram: 'https://www.instagram.com/',
    tiktok: 'https://www.tiktok.com/',
    facebook: 'https://www.facebook.com/',
  },

  // El costo por ubicación aún no se calcula: se confirma por WhatsApp.
  shipping: {
    summary: 'Envíos a domicilio en Bogotá',
    detail:
      'Llevamos tu pedido a cualquier localidad de Bogotá. El costo del envío depende de tu ubicación y te lo confirmamos por WhatsApp antes de cerrar la compra.',
    pickup: 'También puedes recoger tu pedido directamente en la tienda, sin costo.',
    costLabel: 'Por confirmar',
  },
} as const

export const navLinks = [
  { href: '/', label: 'Inicio' },
  { href: '/catalogo', label: 'Catálogo' },
  { href: '/#envios', label: 'Envíos' },
  { href: '/#contacto', label: 'Contacto' },
] as const
