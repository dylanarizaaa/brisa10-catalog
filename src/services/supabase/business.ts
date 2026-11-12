import { site } from '@/config/site'
import type { Business } from '@/types/business'
import { rpc } from './client'

const fallback: Business = { business_name: site.name, phone: null, address: null, email: null }

/** Datos de contacto del negocio. Si la consulta falla, el sitio sigue con el nombre de respaldo. */
export async function getBusiness(): Promise<Business> {
  try {
    return (await rpc<Business | null>('get_public_business')) ?? fallback
  } catch (error) {
    console.error('[business]', error)
    return fallback
  }
}
