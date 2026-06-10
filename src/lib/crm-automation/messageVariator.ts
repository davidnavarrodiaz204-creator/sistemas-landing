import type { QueueChannel } from './automationTypes';

export type MessageVariantInput = {
  negocio: string;
  rubro: string;
  ciudad: string;
  contacto: string;
  estado: string;
  channel: QueueChannel;
  product: 'RESTO' | 'FERRO' | 'Ambos';
  variantIndex?: number;
};

const PRODUCT_LABELS: Record<string, string> = {
  RESTO: 'sistema POS para restaurante, pollería o cevichería',
  FERRO: 'sistema POS para ferretería o tienda',
  Ambos: 'sistema POS para tu negocio',
};

const PRODUCT_SHORT: Record<string, string> = {
  RESTO: 'FACTUSYS RESTO',
  FERRO: 'FACTUSYS FERRO',
  Ambos: 'FACTUSYS',
};

function getFirstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  const first = parts[0] || 'amigo';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

function getProductLabel(product: string): string {
  return PRODUCT_LABELS[product] || 'sistema POS para tu negocio';
}

function getProductShort(product: string): string {
  return PRODUCT_SHORT[product] || 'FACTUSYS';
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const GREETINGS = ['Hola', 'Qué tal', 'Buen día', 'Saludos', 'Buenas'];
const CLOSINGS = ['¿Te parece?', '¿Qué opinas?', '¿Lo vemos?', '¿Te animas?', 'Sin compromiso, ¿le damos?'];
const CLOSING_EMAIL = ['Quedo atento a tu respuesta.', 'Saludos cordiales.', 'Espero tu mensaje.', 'Un abrazo.', 'Nos vemos pronto.'];

const RUBRO_REFERENCE: Record<string, string[]> = {
  Pollería: [
    'Vi tu pollería {negocio} en {ciudad}',
    'Pasé viendo {negocio} en {ciudad}',
    'Vi que tienes {negocio} en {ciudad}',
    'Encontré {negocio} por {ciudad}',
    'Sé que tienes {negocio} en {ciudad}',
  ],
  Restaurante: [
    'Vi tu restaurante {negocio} en {ciudad}',
    'Pasé viendo {negocio} en {ciudad}',
    'Vi que tienes {negocio} en {ciudad}',
    'Encontré {negocio} por {ciudad}',
    'Sé que tienes {negocio} en {ciudad}',
  ],
  Cevichería: [
    'Vi tu cevichería {negocio} en {ciudad}',
    'Pasé viendo {negocio} en {ciudad}',
    'Vi que tienes {negocio} en {ciudad}',
    'Encontré {negocio} por {ciudad}',
    'Sé que tienes {negocio} en {ciudad}',
  ],
  Ferretería: [
    'Vi tu ferretería {negocio} en {ciudad}',
    'Pasé viendo {negocio} en {ciudad}',
    'Vi que tienes {negocio} en {ciudad}',
    'Encontré {negocio} por {ciudad}',
    'Sé que tienes {negocio} en {ciudad}',
  ],
  Minimarket: [
    'Vi tu minimarket {negocio} en {ciudad}',
    'Pasé viendo {negocio} en {ciudad}',
    'Vi que tienes {negocio} en {ciudad}',
    'Sé que tienes {negocio} por {ciudad}',
    'Encontré {negocio} por {ciudad}',
  ],
};

const BENEFITS: Record<string, string[]> = {
  RESTO: [
    'controlar mesas, pedidos y facturación en un solo lugar',
    'tomar pedidos desde el salón directo a cocina',
    'controlar ventas, caja y reportes desde el celular',
    'agilizar la atención al cliente y evitar errores en comandas',
    'tener todo el negocio en la palma de tu mano',
    'facturar al instante y llevar el control de tu stock',
  ],
  FERRO: [
    'controlar inventario, precios y cotizaciones al toque',
    'llevar el control de ventas y stock desde tu celular',
    'emitir boletas y facturas electrónicas sin complicaciones',
    'organizar tus productos por categoría y ver qué se vende más',
    'hacer cotizaciones rápidas para tus clientes',
    'saber qué producto se está agotando antes de que pase',
  ],
  Ambos: [
    'controlar ventas, inventario y clientes desde un solo sistema',
    'tener todo organizado y facturar al instante',
    'llevar tu negocio al día desde el celular o la computadora',
    'ahorrar tiempo en facturación y control de stock',
    'ver reportes de ventas en tiempo real',
  ],
};

const OFFER_INTROS = [
  'quería ofrecerte una demo gratuita de 30 días de {product}',
  'te traigo una invitación para probar {product} gratis por 30 días',
  'quería contarte que estamos dando 30 días de prueba sin costo de {product}',
  'me gustaría invitarte a probar {product} sin compromiso por 30 días',
  'te comento que tenemos una demo gratis de 30 días de {product}',
];

const INTERESTED_INTROS = [
  'para que pruebes FACTUSYS con calma, podemos darte 30 días de demo',
  'si quieres, te activo la demo de 30 días para que la evalúes',
  '¿qué tal si pruebas FACTUSYS unos días sin compromiso?',
  'te ofrezco 30 días de prueba para que veas cómo funciona',
  'podemos darte acceso completo por 30 días para que lo evalúes',
];

const DEMO_INTROS = [
  '¿cómo va la prueba de FACTUSYS?',
  '¿qué tal te está yendo con FACTUSYS?',
  '¿cómo vas con el sistema?',
  '¿ya pudiste revisar FACTUSYS un poco?',
  '¿qué te parece FACTUSYS hasta ahora?',
];

const MEETING_INTROS = [
  'te confirmo nuestra reunión para ver FACTUSYS',
  'tal como quedamos, agendamos la reunión para mostrarte FACTUSYS',
  'te escribo para confirmar la cita de FACTUSYS',
  'quedamos en coordinar una reunión para que te muestre FACTUSYS',
];

function buildWaMessage(
  greeting: string,
  intro: string,
  offer: string,
  benefit: string,
  closing: string,
): string {
  return `${greeting} {name}, soy David de FACTUSYS. ${intro}. ${offer}. Te ayuda a ${benefit}. ${closing}`;
}

function buildWaNew(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const refs = RUBRO_REFERENCE[input.rubro] || RUBRO_REFERENCE.Pollería;
  const intro = pick(refs);
  const offer = pick(OFFER_INTROS).replace('{product}', getProductLabel(input.product));
  const benefits = BENEFITS[input.product] || BENEFITS.Ambos;
  const benefit = pick(benefits);
  const closing = pick(CLOSINGS);

  const msg = buildWaMessage(greeting, intro, offer, benefit, closing);
  return msg
    .replace('{name}', getFirstName(input.contacto))
    .replace('{negocio}', input.negocio)
    .replace('{ciudad}', input.ciudad);
}

function buildWaInterested(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(INTERESTED_INTROS);
  const product = getProductShort(input.product);
  const closing = pick(CLOSINGS);

  const msg = `${greeting} {name}, qué tal. ${intro}. Durante la prueba no se envían documentos reales a SUNAT; es seguro para evaluar ventas, caja y control del negocio. ${closing}`;
  return msg
    .replace('{name}', getFirstName(input.contacto))
    .replace('{product}', product);
}

function buildWaDemo(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(DEMO_INTROS);
  const closing = pick(CLOSINGS);

  const msg = `${greeting} {name}, ${intro} Si tienes alguna duda o quieres que te explique algo, avísame. También podemos agendar una reunión corta para ver cómo va todo. ${closing}`;
  return msg
    .replace('{name}', getFirstName(input.contacto));
}

function buildWaMeeting(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(MEETING_INTROS);
  const product = getProductShort(input.product);
  const closing = pick(CLOSINGS);

  const msg = `${greeting} {name}, ${intro}. Quedamos en coordinarlo para mostrarte cómo ${product} puede ayudar a {negocio}. ${closing}`;
  return msg
    .replace('{name}', getFirstName(input.contacto))
    .replace('{negocio}', input.negocio)
    .replace('{product}', product);
}

function buildWaGeneral(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const product = getProductLabel(input.product);
  const closing = pick(CLOSINGS);

  const msg = `${greeting} {name}, soy David de FACTUSYS. Quería saber si aún le interesa probar nuestro ${product} para {negocio} en {ciudad}. Sin compromiso, ¿le parece una demo rápida? ${closing}`;
  return msg
    .replace('{name}', getFirstName(input.contacto))
    .replace('{negocio}', input.negocio)
    .replace('{ciudad}', input.ciudad);
}

export function generateVariedWhatsAppMessage(input: MessageVariantInput): string {
  if (input.estado === 'Nuevo' || input.estado === 'Contactado') return buildWaNew(input);
  if (input.estado === 'Interesado') return buildWaInterested(input);
  if (input.estado === 'Demo 30 días ofrecida' || input.estado === 'Demo activa') return buildWaDemo(input);
  if (input.estado === 'Reunión agendada') return buildWaMeeting(input);
  return buildWaGeneral(input);
}

export function generateVariedEmailSubject(input: Pick<MessageVariantInput, 'rubro' | 'product'>): string {
  const product = getProductShort(input.product);
  const subjects = [
    `Demo gratuita ${product} para ${input.rubro.toLowerCase()} en Perú`,
    `${product}: prueba gratis 30 días para tu ${input.rubro.toLowerCase()}`,
    `¿Conoces ${product}? Te invito a probarlo sin costo`,
    `Invitación especial: demo gratis ${product} para ${input.rubro.toLowerCase()}`,
    `${product} para tu ${input.rubro.toLowerCase()} - 30 días de prueba`,
  ];
  return pick(subjects);
}

export function generateVariedEmailBody(input: MessageVariantInput): string {
  const name = getFirstName(input.contacto);
  const product = getProductLabel(input.product);
  const productShort = getProductShort(input.product);
  const refs = RUBRO_REFERENCE[input.rubro] || RUBRO_REFERENCE.Pollería;
  const intro = pick(refs);
  const benefits = BENEFITS[input.product] || BENEFITS.Ambos;
  const benefit = pick(benefits);
  const closing = pick(CLOSING_EMAIL);

  return `Hola ${name},

Soy David de FACTUSYS, un sistema POS peruano para negocios como el tuyo.

${intro} y quería ofrecerte una demo gratuita de 30 días de nuestro ${product}.

Con ${productShort} puedes ${benefit}, todo desde un solo lugar, sin complicaciones.

Durante la demo no se envían documentos reales a SUNAT, es solo para que pruebes el sistema con seguridad.

¿Te parece si coordinamos una llamada rápida para mostrártelo?

${closing}
David
FACTUSYS Perú
WhatsApp: https://wa.me/51987454769
Web: https://factusys.com
---
Si no deseas recibir más información, responde este correo y no volveré a escribirte.`;
}

export function generateVariedMessage(
  input: MessageVariantInput,
): { message: string; subject?: string } {
  if (input.channel === 'email') {
    return {
      subject: generateVariedEmailSubject(input),
      message: generateVariedEmailBody(input),
    };
  }
  return { message: generateVariedWhatsAppMessage(input) };
}

const SECOND_INTRO = [
  'te escribí antes y no sé si viste mi mensaje',
  'no sabía si te llegó mi mensaje anterior',
  'te mandé un mensaje hace unos días',
  'te contacté antes, quizás no viste',
  'te escribí y no obtuve respuesta',
];

const DEMO_FOLLOW_INTRO = [
  '¿cómo te fue con la demo de FACTUSYS?',
  '¿pudiste revisar FACTUSYS? Cualquier duda me dices',
  '¿qué tal la experiencia con FACTUSYS estos días?',
  '¿ya probaste FACTUSYS? ¿te gustó?',
  '¿cómo va todo con FACTUSYS? Estoy al pendiente',
];

const SOFT_CLOSE_INTRO = [
  'quería consultarte si aún te interesa FACTUSYS',
  'no te quería molestar pero quedé con la consulta pendiente',
  'sé que estás ocupado, solo quería saber si FACTUSYS te sirve',
  'sin compromiso, ¿te interesa o prefieres que no insista?',
  'déjame saber si prefieres que espere un tiempo mejor',
];

const REACTIVATION_INTRO = [
  'ha pasado un tiempo, quería saber si tu situación cambió',
  'sé que antes no era el momento, pero quería retomar el contacto',
  'han pasado unos meses, quería saber si FACTUSYS te podría ayudar ahora',
  'no sé si sigues con el mismo negocio, pero quería intentar de nuevo',
  'quizás antes no era el momento, ¿ahora podría interesarte FACTUSYS?',
];

const FIRST_NAMES = ['David', 'David de FACTUSYS', 'David, FACTUSYS'];

function pickName(contacto: string): string {
  return getFirstName(contacto || pick(FIRST_NAMES));
}

function buildWaSegundoIntento(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(SECOND_INTRO);
  const product = getProductLabel(input.product);
  const benefit = pick(BENEFITS[input.product] || BENEFITS.Ambos);
  const closing = pick(CLOSINGS);
  const name = pickName(input.contacto);
  return `${greeting} ${name}. ${intro} sobre {product}. Te ayuda a ${benefit}. ${closing}`
    .replace('{product}', product);
}

function buildWaSeguimientoDemo(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(DEMO_FOLLOW_INTRO);
  const closing = pick(CLOSINGS);
  const name = pickName(input.contacto);
  return `${greeting} ${name}. ${intro} Si quieres, podemos agendar una llamada corta y te explico mejor. ${closing}`;
}

function buildWaCierreSuave(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(SOFT_CLOSE_INTRO);
  const closing = pick(CLOSINGS);
  const name = pickName(input.contacto);
  return `${greeting} ${name}. ${intro} para {negocio} en {ciudad}. Nada forzado, solo dime si sigues interesado. ${closing}`
    .replace('{negocio}', input.negocio)
    .replace('{ciudad}', input.ciudad);
}

function buildWaReactivacion(input: MessageVariantInput): string {
  const greeting = pick(GREETINGS);
  const intro = pick(REACTIVATION_INTRO);
  const product = getProductShort(input.product);
  const closing = pick(CLOSINGS);
  const name = pickName(input.contacto);
  return `${greeting} ${name}. ${intro} para {negocio}. Ahora {product} tiene nuevas funciones. ¿Te interesa verlo? ${closing}`
    .replace('{negocio}', input.negocio)
    .replace('{product}', product);
}

export function generateWhatsAppByType(input: MessageVariantInput): string {
  switch (input.estado) {
    case 'Nuevo':
    case 'Contactado':
      return buildWaNew(input);
    case 'Interesado':
      return buildWaInterested(input);
    case 'Demo 30 días ofrecida':
    case 'Demo activa':
      return buildWaDemo(input);
    case 'Reunión agendada':
      return buildWaMeeting(input);
    case 'SEGUNDO_INTENTO':
      return buildWaSegundoIntento(input);
    case 'SEGUIMIENTO_DEMO':
      return buildWaSeguimientoDemo(input);
    case 'CIERRE_SUAVE':
      return buildWaCierreSuave(input);
    case 'REACTIVACION':
      return buildWaReactivacion(input);
    default:
      return buildWaGeneral(input);
  }
}
