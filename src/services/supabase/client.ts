/**
 * Acceso a Supabase para el catálogo público. Único lugar que conoce la URL y la clave.
 *
 * El rol anon solo puede ejecutar las funciones get_public_* y check_public_cart
 * (migración 20261111000007 de brisa10-admin), así que basta con fetch contra
 * PostgREST: no se carga el SDK completo en el navegador.
 */

const url = (import.meta.env.PUBLIC_SUPABASE_URL ?? '').replace(/\/$/, '')
const anonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY ?? ''

export const isSupabaseConfigured = Boolean(url && anonKey)

/** Origen del proyecto (para preconectar antes de pedir las fotos). */
export const supabaseOrigin = url

export class SupabaseError extends Error {
  /** SQLSTATE o código de PostgREST. P0001 = regla de negocio con mensaje en español. */
  code: string | null

  constructor(message: string, code: string | null = null) {
    super(message)
    this.name = 'SupabaseError'
    this.code = code
  }
}

export async function rpc<T>(fn: string, params: Record<string, unknown> = {}): Promise<T> {
  if (!isSupabaseConfigured) {
    throw new SupabaseError('Faltan PUBLIC_SUPABASE_URL y PUBLIC_SUPABASE_ANON_KEY (revisa el archivo .env)')
  }
  const response = await fetch(`${url}/rest/v1/rpc/${fn}`, {
    method: 'POST',
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${anonKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
  })
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as { message?: string; code?: string } | null
    throw new SupabaseError(body?.message ?? `Error ${response.status} al consultar ${fn}`, body?.code ?? null)
  }
  return (await response.json()) as T
}

/**
 * Redimensionado de fotos en el servidor de Supabase (Storage → Image transformations).
 * Solo está disponible en los planes de pago, así que se activa con
 * PUBLIC_SUPABASE_IMAGE_TRANSFORM=true. Sin ella se sirve la foto original.
 */
const imageTransforms = import.meta.env.PUBLIC_SUPABASE_IMAGE_TRANSFORM === 'true'

const encodePath = (storagePath: string) => storagePath.split('/').map(encodeURIComponent).join('/')

/** URL pública de una foto del bucket product-images, al ancho pedido si hay redimensionado. */
export function productImageUrl(storagePath: string, width?: number): string {
  if (imageTransforms && width) {
    return `${url}/storage/v1/render/image/public/product-images/${encodePath(storagePath)}?width=${width}&quality=78`
  }
  return `${url}/storage/v1/object/public/product-images/${encodePath(storagePath)}`
}

/** srcset con varios anchos (o undefined sin redimensionado: el navegador usa src). */
export function productImageSrcset(storagePath: string, widths: number[] = [400, 700, 1000, 1400]): string | undefined {
  if (!imageTransforms) return undefined
  return widths.map((width) => `${productImageUrl(storagePath, width)} ${width}w`).join(', ')
}
