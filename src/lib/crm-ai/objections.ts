export type SalesObjection = 'precio' | 'pensarlo' | 'frio';

export const OBJECTION_HINTS: Record<SalesObjection, string> = {
  precio: 'Enfocar en probar primero la demo, sin presionar por compra inmediata.',
  pensarlo: 'Responder con calma, dejar abierta una demo corta y no perseguir de forma agresiva.',
  frio: 'Retomar con contexto, una pregunta simple y una salida facil.',
};

export function getObjectionHint(objection: SalesObjection) {
  return OBJECTION_HINTS[objection];
}
