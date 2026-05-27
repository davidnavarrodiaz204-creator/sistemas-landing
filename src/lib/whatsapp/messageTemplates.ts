import type { WhatsAppInterest } from './whatsappTypes';

export const WHATSAPP_MESSAGE_TEMPLATES: Record<WhatsAppInterest, string> = {
  RESTO:
    'Hola, soy David de FACTUSYS. Estoy ofreciendo una demo gratuita de 30 días de un sistema POS para restaurantes, pollerías y cevicherías. Ayuda a controlar mesas, pedidos, cocina, caja, reportes y ventas. Durante la demo no se envían documentos reales a SUNAT; es solo para probar el sistema con seguridad. También puedo apoyar con una impresora térmica para la prueba. ¿Te gustaría verlo funcionando?',
  FERRO:
    'Hola, soy David de FACTUSYS. Estoy ofreciendo una demo gratuita de 30 días de un sistema POS para ferreterías y tiendas. Te ayuda a controlar ventas, caja, inventario, clientes, cotizaciones, compras y reportes. Durante la demo no se envían documentos reales a SUNAT; es solo para probar el sistema con seguridad. ¿Te gustaría verlo funcionando?',
  Ambos:
    'Hola, soy David de FACTUSYS. Implementamos sistemas POS para negocios en Perú: restaurantes, pollerías, ferreterías y tiendas. Estoy ofreciendo una demo gratuita de 30 días para que prueben ventas, caja, inventario/reportes y control del negocio. Durante la demo no se envían documentos reales a SUNAT. ¿Te gustaría ver una demo rápida?',
};

export function getWhatsAppMessage(interes: WhatsAppInterest) {
  return WHATSAPP_MESSAGE_TEMPLATES[interes];
}
