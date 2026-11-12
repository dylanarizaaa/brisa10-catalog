import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { site } from '@/config/site'

/** Información práctica de la página de producto: entregas, cómo pedir y pago. */
export function ProductInfoAccordion() {
  return (
    <Accordion type="single" collapsible defaultValue="envios" className="border-y border-linen">
      <AccordionItem value="envios">
        <AccordionTrigger>Envíos y entregas</AccordionTrigger>
        <AccordionContent>
          <p>{site.shipping.detail}</p>
          <p>{site.shipping.pickup}</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="pedido">
        <AccordionTrigger>¿Cómo hago mi pedido?</AccordionTrigger>
        <AccordionContent>
          <p>
            Agrega los productos a tu carrito, completa tus datos y envía el resumen por WhatsApp. Te respondemos para
            confirmar la disponibilidad y coordinar la entrega.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="pago">
        <AccordionTrigger>Formas de pago</AccordionTrigger>
        <AccordionContent>
          <p>
            Este sitio no procesa pagos en línea. La forma de pago se acuerda directamente con la tienda por WhatsApp al
            confirmar tu pedido.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
