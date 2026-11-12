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

  /**
   * Portada del inicio. Los archivos van en public/media/ (ver README, "Video de presentación").
   * Mientras los campos estén vacíos, la portada usa la foto de un producto destacado.
   */
  hero: {
    video: {
      /** Video horizontal (16:9), MP4 (H.264) o WebM, sin audio. Ej.: '/media/hero.mp4'. */
      desktop: '',
      /** Video vertical (4:5 o 9:16) para celulares. Opcional: sin él se usa el horizontal. */
      mobile: '',
    },
    /** Foto fija de la portada; también se ve mientras carga el video. Ej.: '/media/hero.jpg'. */
    image: '',
    /** Texto alternativo de la foto o del video. */
    alt: '',
  },

  // PENDIENTE: ajustar estos textos con la voz real del negocio.
  brand: {
    statement: 'Elegimos cada pieza pensando en cómo se verá en tu casa o en las manos de alguien especial.',
    detail:
      'Cerámicas, peluches, decoración y regalos que se notan. Todo lo que ves aquí está en nuestra tienda de Bogotá y lo puedes pedir por WhatsApp.',
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
