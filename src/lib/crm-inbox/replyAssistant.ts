export const INTENTS = [
  'PIDE_DEMO', 'PIDE_PRECIO', 'PREGUNTA_FUNCIONES', 'OCUPADO',
  'NO_INTERESA', 'QUIERE_LLAMADA', 'SOPORTE', 'OTRO',
] as const;
export type Intent = typeof INTENTS[number];

const INTENT_PATTERNS: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: 'PIDE_DEMO',
    patterns: [
      /demo/i, /prueb[ae]/i, /ver\s+(c[oó]mo\s+)?funcion[ae]/i, /mostr[ae]r/i,
      /conocer\s+el\s+sistema/i, /me\s+gustar[ií]a\s+ver/i, /podemos\s+agendar/i,
      /una\s+demostraci[oó]n/i, /quiero\s+ver/i, /me\s+interesa\s+ver/i,
    ],
  },
  {
    intent: 'PIDE_PRECIO',
    patterns: [
      /precio/i, /cu[áa]nto\s+cuest[ae]/i, /cu[áa]nto\s+vale/i, /tarif[ae]/i,
      /plan/i, /costo/i, /inversi[oó]n/i, /presupuesto/i, /paquete/i,
      /a\s+cu[áa]nto\s+est[áa]/i, /mensualidad/i,
    ],
  },
  {
    intent: 'PREGUNTA_FUNCIONES',
    patterns: [
      /funcion[ae]/i, /caracter[ií]sticas/i, /qu[eé]\s+hace/i, /c[oó]mo\s+funciona/i,
      /qu[eé]\s+incluye/i, /sirve\s+para/i, /control\s+de/i, /inventario/i,
      /factur[ao]/i, /reportes?/i, /caja/i, /m[oó]dulos?/i,
    ],
  },
  {
    intent: 'OCUPADO',
    patterns: [
      /ocupad[oó]/i, /despu[eé]s/i, /ahora\s+no/i, /m[aá]s\s+tarde/i,
      /estoy\s+en/i, /ll[aá]mame/i, /escribeme\s+despu[eé]s/i,
      /ahorita\s+no/i, /en\s+la\s+tarde/i, /en\s+la\s+noche/i,
    ],
  },
  {
    intent: 'NO_INTERESA',
    patterns: [
      /no\s+(me\s+)?interesa/i, /no\s+gracias/i, /no\s+quiero/i,
      /no\s+estoy\s+interesad[ao]/i, /d[eé]jame\s+en\s+paz/i, /no\s+molestes/i,
      /ya\s+tengo/i, /no\s+necesito/i, /no\s+me\s+escribas/i,
    ],
  },
  {
    intent: 'QUIERE_LLAMADA',
    patterns: [
      /ll[aá]mame/i, /ll[aá]manos/i, /comun[ií]cate/i, /hablar\s+por\s+tel[eé]fono/i,
      /una\s+llamada/i, /puedes\s+llamar/i, /ll[aá]m[ea]r\s+por/i,
      /me\s+gustar[ií]a\s+hablar/i, /conversar/i,
    ],
  },
  {
    intent: 'SOPORTE',
    patterns: [
      /ayuda/i, /soporte/i, /error/i, /problema/i, /no\s+funciona/i,
      /bug/i, /falla/i, /asistencia/i, /t[eé]cnico/i, /configuraci[oó]n/i,
    ],
  },
];

export function detectIntent(text: string): { intent: Intent; confidence: number } {
  for (const entry of INTENT_PATTERNS) {
    const matches = entry.patterns.filter((p) => p.test(text));
    if (matches.length > 0) {
      const confidence = Math.min(matches.length / entry.patterns.length + 0.5, 1);
      return { intent: entry.intent, confidence };
    }
  }
  return { intent: 'OTRO', confidence: 0.3 };
}

const REPLY_TEMPLATES: Record<string, Array<{ condition: string; reply: string }>> = {
  PIDE_DEMO: [
    { condition: '*', reply: '¡Claro! Podemos agendar una demo sin compromiso por videollamada o presencial. ¿Qué día y hora te queda mejor?' },
  ],
  PIDE_PRECIO: [
    { condition: '*', reply: 'Los precios dependen del módulo que necesites. ¿Te parece si te cuento los dos principales (Restaurante y Ferretería) y vemos cuál se ajusta más a tu negocio?' },
  ],
  PREGUNTA_FUNCIONES: [
    { condition: 'restaurante', reply: 'Claro, el sistema tiene control de ventas, caja, reportes, inventario y facturación electrónica. ¿Qué es lo que más necesitas para tu negocio?' },
    { condition: 'ferreteria', reply: 'El sistema maneja ventas, control de stock, facturación y clientes frecuentes. ¿Qué es lo que más te interesa?' },
    { condition: '*', reply: 'El sistema cubre ventas, caja, inventario, facturación electrónica y reportes. Todo en uno. ¿Qué es lo principal que buscas?' },
  ],
  OCUPADO: [
    { condition: '*', reply: 'Sin problema. ¿Te parece si te escribo más tarde o prefieres que te llame en otro momento?' },
  ],
  NO_INTERESA: [
    { condition: '*', reply: 'Entiendo, gracias por tu tiempo. Si algún día cambias de opinión o necesitas algo, aquí estoy.' },
  ],
  QUIERE_LLAMADA: [
    { condition: '*', reply: '¡Perfecto! Te llamo ahora. ¿Está bien tu número o prefieres que te llame a otro?' },
  ],
  SOPORTE: [
    { condition: '*', reply: 'Claro, cuéntame qué está pasando para ayudarte. ¿Es un error en el sistema o necesitas asistencia con algo en específico?' },
  ],
  OTRO: [
    { condition: '*', reply: 'Gracias por escribirme. ¿Te interesa conocer cómo FACTUSYS puede ayudarte a gestionar mejor tu negocio?' },
  ],
};

function inferRubro(text: string, rubro?: string): string {
  if (rubro) return rubro;
  if (/restaurant|poller[ií]a|cevicher[ií]a|comida|men[úu]|cocina/i.test(text)) return 'restaurante';
  if (/ferreter[ií]a|construcci[oó]n|material|maestro/i.test(text)) return 'ferreteria';
  return 'otro';
}

export function generateSuggestedReply(intent: Intent, text: string, rubro?: string): string {
  const category = inferRubro(text, rubro);
  const templates = REPLY_TEMPLATES[intent] || REPLY_TEMPLATES.OTRO;
  const match = templates.find((t) => t.condition === category);
  return match?.reply || templates[0]?.reply || REPLY_TEMPLATES.OTRO[0].reply;
}

export type AnalysisResult = {
  intent: Intent;
  confidence: number;
  suggestedReply: string;
};

export function analyzeMessage(text: string, rubro?: string): AnalysisResult {
  const { intent, confidence } = detectIntent(text);
  const suggestedReply = generateSuggestedReply(intent, text, rubro);
  return { intent, confidence, suggestedReply };
}
