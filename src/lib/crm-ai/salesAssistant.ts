import { getObjectionHint } from './objections';
import { recommendNextAction } from './nextActions';

export type AssistantIntent =
  | 'Primer contacto'
  | 'Seguimiento amable'
  | 'Ofrecer demo 30 días'
  | 'Responder precio'
  | 'Responder “lo voy a pensar”'
  | 'Cerrar reunión'
  | 'Recuperar prospecto frío';

export const ASSISTANT_INTENTS: AssistantIntent[] = [
  'Primer contacto',
  'Seguimiento amable',
  'Ofrecer demo 30 días',
  'Responder precio',
  'Responder “lo voy a pensar”',
  'Cerrar reunión',
  'Recuperar prospecto frío',
];

export type SalesAssistantProspect = {
  negocio: string;
  rubro: string;
  contacto: string;
  interes: 'RESTO' | 'FERRO' | 'Ambos';
  estado: string;
  estadoConversacion?: string;
  fechaUltimoMensaje?: string;
  respuestaCliente?: string;
};

function productLabel(interes: SalesAssistantProspect['interes']) {
  if (interes === 'FERRO') return 'sistema POS para ferretería o tienda';
  if (interes === 'RESTO') return 'sistema POS para restaurante o pollería';
  return 'sistema POS para tu negocio';
}

function firstName(contacto: string) {
  return contacto.trim().split(/\s+/)[0] || 'hola';
}

export function getRecommendedIntent(prospect: SalesAssistantProspect): AssistantIntent {
  const days = prospect.fechaUltimoMensaje
    ? Math.floor((Date.now() - new Date(`${prospect.fechaUltimoMensaje}T00:00:00`).getTime()) / 86400000)
    : null;

  if (prospect.estado === 'Nuevo') return 'Primer contacto';
  if (prospect.estado === 'Contactado' && prospect.estadoConversacion === 'Sin respuesta' && days !== null && days >= 2) return 'Seguimiento amable';
  if (prospect.estado === 'Interesado') return 'Ofrecer demo 30 días';
  if (prospect.estado === 'Demo activa') return 'Cerrar reunión';
  if (prospect.estado === 'Perdido') return 'Recuperar prospecto frío';
  return 'Seguimiento amable';
}

export function getNextAction(prospect: SalesAssistantProspect) {
  return recommendNextAction(prospect);
}

export function generateSalesMessage(prospect: SalesAssistantProspect, intent: AssistantIntent) {
  const name = firstName(prospect.contacto);
  const product = productLabel(prospect.interes);

  const messages: Record<AssistantIntent, string> = {
    'Primer contacto': `Hola ${name}, soy David de FACTUSYS. Vi ${prospect.negocio} y queria mostrarte una demo gratis de 30 dias de nuestro ${product}. Te ayuda a controlar ventas, caja, stock y reportes sin complicarte. ¿Te puedo mostrar una demo rapida?`,
    'Seguimiento amable': `Hola ${name}, ¿como estas? Te escribo solo para retomar lo del POS de FACTUSYS. Si te parece, hacemos una demo corta y ves si realmente le sirve a ${prospect.negocio}. Sin compromiso.`,
    'Ofrecer demo 30 días': `Hola ${name}, para que lo pruebes con calma, podemos darte 30 dias de demo de FACTUSYS. Durante la prueba no se envian documentos reales a SUNAT; es seguro para evaluar ventas, caja y control del negocio. ¿Lo vemos esta semana?`,
    'Responder precio': `Te entiendo, ${name}. Antes de hablar de precio cerrado, lo mejor es que veas si el sistema encaja con ${prospect.negocio}. Podemos hacer una demo gratis de 30 dias y luego definimos el plan que te convenga.`,
    'Responder “lo voy a pensar”': `Claro ${name}, sin problema. Te dejo la opcion de ver una demo corta cuando tengas un momento; asi decides con algo concreto y no solo con palabras. ¿Te parece si lo vemos 10 minutos esta semana?`,
    'Cerrar reunión': `Hola ${name}, si ya viste la idea general, podemos agendar una reunion corta para revisar tu caso y definir si FACTUSYS encaja con ${prospect.negocio}. ¿Te queda mejor mañana o pasado?`,
    'Recuperar prospecto frío': `Hola ${name}, soy David de FACTUSYS. Te escribo con calma para saber si aun te interesa probar un POS para ${prospect.negocio}. Si no es el momento, normal; si deseas, te muestro una demo rapida.`,
  };

  return messages[intent];
}

export function getAssistantContextNote(intent: AssistantIntent) {
  if (intent === 'Responder precio') return getObjectionHint('precio');
  if (intent === 'Responder “lo voy a pensar”') return getObjectionHint('pensarlo');
  if (intent === 'Recuperar prospecto frío') return getObjectionHint('frio');
  return 'Mensaje corto, humano, peruano y orientado a demo.';
}
