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

/** URL pública de una foto del bucket product-images. */
export function productImageUrl(storagePath: string): string {
  const path = storagePath.split('/').map(encodeURIComponent).join('/')
  return `${url}/storage/v1/object/public/product-images/${path}`
}
