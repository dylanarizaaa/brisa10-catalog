/** Icono de WhatsApp para los componentes React (en .astro se usa SocialIcon). */
export default function WhatsAppIcon({ className = 'size-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.200 20.800l1.300-4.600A8.800 8.800 0 1 1 8 19.500l-4.800 1.300Z" />
      <path d="M9 8.300c-.4.900-.2 2.300 1.100 3.900 1.400 1.700 3 2.500 4.100 2.400.7-.1 1.200-.7 1.400-1.300l-1.700-1-.8.800c-.8-.3-1.800-1.300-2.200-2.200l.7-.8-.9-1.800c-.7-.1-1.400.300-1.700 1Z" />
    </svg>
  )
}
