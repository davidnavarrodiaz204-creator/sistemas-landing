export const PROSPECT_STATUSES = ['NUEVO', 'CONTACTADO', 'RESPONDIO', 'INTERESADO', 'DEMO_AGENDADA', 'DEMO_ACTIVA', 'INSTALACION', 'PRODUCCION', 'NO_CONTACTAR'] as const;
export type ProspectStatus = typeof PROSPECT_STATUSES[number];

export const DEMO_STATUSES = ['AGENDADA', 'REALIZADA', 'CANCELADA', 'NO_ASISTIO'] as const;
export type DemoStatus = typeof DEMO_STATUSES[number];

export const INSTALLATION_STATUSES = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADA', 'CANCELADA'] as const;
export type InstallationStatus = typeof INSTALLATION_STATUSES[number];

export const INSTALLATION_TYPES = ['DEMO', 'PRODUCCION'] as const;
export type InstallationType = typeof INSTALLATION_TYPES[number];

export const FOLLOWUP_TYPES = ['PRIMER_CONTACTO', 'RECORDATORIO', 'DEMO', 'CIERRE', 'SOPORTE'] as const;
export type FollowUpType = typeof FOLLOWUP_TYPES[number];

export const TEMPERATURES = ['CALIENTE', 'TIBIO', 'FRIO', 'SIN_DATOS'] as const;
export type Temperature = typeof TEMPERATURES[number];

export const PRODUCTS = ['RESTO', 'FERRO', 'Ambos'] as const;
export type Product = typeof PRODUCTS[number];

export const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo', CONTACTADO: 'Contactado', RESPONDIO: 'Respondió',
  INTERESADO: 'Interesado', DEMO_AGENDADA: 'Demo agendada', DEMO_ACTIVA: 'Demo activa',
  INSTALACION: 'Instalación', PRODUCCION: 'Producción', NO_CONTACTAR: 'No contactar',
};

export const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-blue-500', CONTACTADO: 'bg-amber-500', RESPONDIO: 'bg-sky-500',
  INTERESADO: 'bg-emerald-500', DEMO_AGENDADA: 'bg-purple-500', DEMO_ACTIVA: 'bg-indigo-500',
  INSTALACION: 'bg-cyan-500', PRODUCCION: 'bg-slate-500', NO_CONTACTAR: 'bg-red-500',
};

export const STATUS_PILL_COLORS: Record<string, string> = {
  NUEVO: 'bg-blue-100 text-blue-700', CONTACTADO: 'bg-amber-100 text-amber-700',
  RESPONDIO: 'bg-sky-100 text-sky-700', INTERESADO: 'bg-emerald-100 text-emerald-700',
  DEMO_AGENDADA: 'bg-purple-100 text-purple-700', DEMO_ACTIVA: 'bg-indigo-100 text-indigo-700',
  INSTALACION: 'bg-cyan-100 text-cyan-700', PRODUCCION: 'bg-slate-200 text-slate-700',
  NO_CONTACTAR: 'bg-red-100 text-red-700',
};

export function temperatureColor(temp: string): string {
  if (temp === 'CALIENTE') return '#ef4444';
  if (temp === 'TIBIO') return '#f59e0b';
  return '#6b7280';
}

export function phoneToWhatsAppUrl(phone: string): string {
  const cleaned = phone.replace(/\D/g, '').replace(/^0+/, '');
  const number = cleaned.startsWith('51') ? cleaned : `51${cleaned}`;
  return `https://wa.me/${number}`;
}

export function openWhatsApp(phone: string): void {
  window.open(phoneToWhatsAppUrl(phone), '_blank');
}
