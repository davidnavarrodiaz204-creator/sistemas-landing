import type { ContactPermission, WhatsAppMessageLog } from './whatsappTypes';

export const DEFAULT_DAILY_WHATSAPP_LIMIT = 15;

type LimitProspect = {
  telefono: string;
  permisoContacto: ContactPermission;
  fechaUltimoMensaje: string;
  historialMensajes?: WhatsAppMessageLog[];
};

export function todayKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function sentMessagesToday(prospects: LimitProspect[], date = todayKey()) {
  return prospects.reduce((total, prospect) => {
    const sentToday = prospect.historialMensajes?.filter((message) => (
      message.status === 'sent_marked' && message.createdAt.slice(0, 10) === date
    )).length || 0;

    return total + sentToday;
  }, 0);
}

export function remainingMessagesToday(prospects: LimitProspect[], limit = DEFAULT_DAILY_WHATSAPP_LIMIT) {
  return Math.max(limit - sentMessagesToday(prospects), 0);
}

export function wasPhoneContactedToday(prospects: LimitProspect[], phone: string, date = todayKey()) {
  const normalizedPhone = phone.replace(/\D/g, '');

  return prospects.some((prospect) => {
    const prospectPhone = prospect.telefono.replace(/\D/g, '');
    return prospectPhone === normalizedPhone && prospect.fechaUltimoMensaje === date;
  });
}

export function getSendBlockReason(
  prospects: LimitProspect[],
  prospect: LimitProspect,
  limit = DEFAULT_DAILY_WHATSAPP_LIMIT,
) {
  if (prospect.permisoContacto === 'No contactar') return 'Prospecto marcado como No contactar';
  if (sentMessagesToday(prospects) >= limit) return 'Límite diario alcanzado';
  if (wasPhoneContactedToday(prospects, prospect.telefono)) return 'Este número ya fue contactado hoy';
  return '';
}
