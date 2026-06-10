import type { QueueChannel } from './automationTypes';

export type MessageInput = {
  negocio: string;
  rubro: string;
  ciudad: string;
  contacto: string;
  estado: string;
  channel: QueueChannel;
  product: 'RESTO' | 'FERRO' | 'Ambos';
};

const PRODUCT_LABELS: Record<string, string> = {
  RESTO: 'sistema POS para restaurante, pollería o cevichería',
  FERRO: 'sistema POS para ferretería o tienda',
  Ambos: 'sistema POS para tu negocio',
};

const RUBRO_BENEFITS: Record<string, string> = {
  Restaurante: 'controlar mesas, pedidos, cocina y facturación',
  Pollería: 'controlar pedidos, cocina y ventas rápidas',
  Cevichería: 'ordenar pedidos y controlar insumos frescos',
  Ferretería: 'controlar inventario, ventas y cotizaciones',
  Minimarket: 'gestionar ventas, stock y caja diaria',
  Tienda: 'administrar ventas y controlar tu stock',
  Bar: 'gestionar mesas, pedidos y control de barra',
  Cafetería: 'agilizar pedidos y controlar insumos',
  'Fast Food': 'acelerar ventas y controlar producción',
};

function getFirstName(name: string): string {
  return name.trim().split(/\s+/)[0] || 'amigo';
}

function getProductLabel(product: string): string {
  return PRODUCT_LABELS[product] || 'sistema POS para tu negocio';
}

function getRubroBenefit(rubro: string): string {
  return RUBRO_BENEFITS[rubro] || 'controlar ventas, inventario y clientes';
}

export function generateWhatsAppMessage(input: MessageInput): string {
  const name = getFirstName(input.contacto);
  const product = getProductLabel(input.product);
  const benefit = getRubroBenefit(input.rubro);

  if (input.estado === 'Nuevo' || input.estado === 'Contactado') {
    return `Hola ${name}, soy David de FACTUSYS. Vi ${input.negocio} en ${input.ciudad} y quería mostrarte una demo gratis de 30 días de nuestro ${product}. Te ayuda a ${benefit} sin complicarte. ¿Te puedo mostrar una demo rápida?`;
  }

  if (input.estado === 'Interesado') {
    return `Hola ${name}, qué tal. Para que pruebes FACTUSYS con calma, podemos darte 30 días de demo. Durante la prueba no se envían documentos reales a SUNAT; es seguro para evaluar ventas, caja y control del negocio. ¿Lo vemos esta semana?`;
  }

  if (input.estado === 'Demo 30 días ofrecida' || input.estado === 'Demo activa') {
    return `Hola ${name}, ¿cómo va la prueba de FACTUSYS? Si tienes alguna duda o quieres que te explique algo, avísame. También podemos agendar una reunión corta para ver cómo va todo.`;
  }

  if (input.estado === 'Reunión agendada') {
    return `Hola ${name}, te confirmo nuestra reunión para ver FACTUSYS. Quedamos en coordinarlo para mostrarte cómo ${product} puede ayudar a ${input.negocio}.`;
  }

  return `Hola ${name}, soy David de FACTUSYS. Quería saber si aún le interesa probar nuestro ${product} para ${input.negocio} en ${input.ciudad}. Sin compromiso, ¿le parece una demo rápida?`;
}

export function generateEmailSubject(input: Pick<MessageInput, 'rubro' | 'product'>): string {
  const product =
    input.product === 'RESTO'
      ? 'FACTUSYS RESTO'
      : input.product === 'FERRO'
        ? 'FACTUSYS FERRO'
        : 'FACTUSYS';
  return `Demo gratuita ${product} para ${input.rubro.toLowerCase()} en Perú`;
}

export function generateEmailBody(input: MessageInput): string {
  const name = getFirstName(input.contacto);
  const product = getProductLabel(input.product);
  const benefit = getRubroBenefit(input.rubro);

  return `Hola ${name},

Soy David de FACTUSYS, un sistema POS peruano para negocios como el tuyo.

Vi ${input.negocio} en ${input.ciudad} y quería ofrecerte una demo gratuita de 30 días de nuestro ${product}.

Con FACTUSYS puedes ${benefit}, todo desde un solo lugar, sin complicaciones.

Durante la demo no se envían documentos reales a SUNAT, es solo para que pruebes el sistema con seguridad.

¿Te parece si coordinamos una llamada rápida para mostrártelo?

Saludos,
David
FACTUSYS Perú
WhatsApp: https://wa.me/51987454769

---
Si no deseas recibir más información, responde este correo y no volveré a escribirte.`;
}

export function generateMessage(
  input: MessageInput,
): { message: string; subject?: string } {
  if (input.channel === 'email') {
    return {
      subject: generateEmailSubject(input),
      message: generateEmailBody(input),
    };
  }
  return { message: generateWhatsAppMessage(input) };
}

export function getUnsubscribeText(): string {
  return 'Si no deseas recibir más información, me indicas y no vuelvo a escribirte.';
}
