import { localStorageProvider } from './localStorageProvider';
import type { CrmHistoryPayload, CrmProspectRecord, CrmStorageProvider, NormalizeProspect } from './crmStorage.types';

const SUPABASE_TABLE = 'crm_prospects';

function getSupabaseConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  };
}

function isSupabaseConfigured() {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey);
}

function endpoint(id?: string) {
  const { url } = getSupabaseConfig();
  const baseUrl = `${url?.replace(/\/$/, '')}/rest/v1/${SUPABASE_TABLE}`;
  return id ? `${baseUrl}?id=eq.${encodeURIComponent(id)}` : baseUrl;
}

function headers(prefer?: string) {
  const { anonKey } = getSupabaseConfig();
  return {
    apikey: anonKey || '',
    Authorization: `Bearer ${anonKey || ''}`,
    'Content-Type': 'application/json',
    ...(prefer ? { Prefer: prefer } : {}),
  };
}

function toSupabaseRow(prospect: CrmProspectRecord) {
  const history: CrmHistoryPayload = {
    fechaUltimoMensaje: String(prospect.fechaUltimoMensaje || ''),
    cantidadMensajesEnviados: Number(prospect.cantidadMensajesEnviados || 0),
    respuestaCliente: String(prospect.respuestaCliente || ''),
    estadoConversacion: String(prospect.estadoConversacion || 'Sin respuesta'),
    historialMensajes: Array.isArray(prospect.historialMensajes) ? prospect.historialMensajes : [],
    installationStatus: String(prospect.installationStatus || ''),
    installationDate: String(prospect.installationDate || ''),
    installationType: String(prospect.installationType || ''),
    equipment: Array.isArray(prospect.equipment) ? prospect.equipment : [],
    sunatMode: String(prospect.sunatMode || ''),
    nubefactConfigured: Boolean(prospect.nubefactConfigured),
    installationNotes: String(prospect.installationNotes || ''),
    installationChecklist: prospect.installationChecklist || {},
  };

  return {
    id: prospect.id,
    business_name: prospect.negocio,
    rubro: prospect.rubro,
    city: prospect.zona,
    contact_name: prospect.contacto,
    whatsapp: prospect.telefono,
    social_url: prospect.redSocial,
    interest: prospect.interes,
    status: prospect.estado,
    origin: prospect.origen,
    permission_contact: prospect.permisoContacto,
    last_contact_at: prospect.fechaUltimoContacto || null,
    next_follow_up_at: prospect.fechaProximoContacto || null,
    last_message: prospect.ultimoMensajeEnviado,
    notes: prospect.nota,
    history,
  };
}

function fromSupabaseRow<T extends CrmProspectRecord>(row: Record<string, unknown>, normalize: NormalizeProspect<T>) {
  const history = (row.history || {}) as CrmHistoryPayload;

  const prospect = {
    id: String(row.id || ''),
    negocio: String(row.business_name || ''),
    rubro: String(row.rubro || ''),
    zona: String(row.city || ''),
    contacto: String(row.contact_name || ''),
    telefono: String(row.whatsapp || ''),
    redSocial: String(row.social_url || ''),
    interes: String(row.interest || ''),
    estado: String(row.status || ''),
    origen: String(row.origin || ''),
    permisoContacto: String(row.permission_contact || ''),
    fechaUltimoContacto: String(row.last_contact_at || ''),
    fechaProximoContacto: String(row.next_follow_up_at || ''),
    ultimoMensajeEnviado: String(row.last_message || ''),
    nota: String(row.notes || ''),
    fechaUltimoMensaje: history.fechaUltimoMensaje || '',
    cantidadMensajesEnviados: history.cantidadMensajesEnviados || 0,
    respuestaCliente: history.respuestaCliente || '',
    estadoConversacion: history.estadoConversacion || '',
    historialMensajes: history.historialMensajes || [],
    installationStatus: String(history.installationStatus || ''),
    installationDate: String(history.installationDate || ''),
    installationType: String(history.installationType || ''),
    equipment: Array.isArray(history.equipment) ? history.equipment : [],
    sunatMode: String(history.sunatMode || ''),
    nubefactConfigured: Boolean(history.nubefactConfigured),
    installationNotes: String(history.installationNotes || ''),
    installationChecklist: history.installationChecklist || {},
    createdAt: String(row.created_at || ''),
  };

  return normalize(prospect as unknown as Partial<T>);
}

async function fetchSupabase<T extends CrmProspectRecord>(
  input: RequestInfo | URL,
  init: RequestInit,
  fallback: () => Promise<T[]>,
) {
  try {
    const response = await fetch(input, init);
    if (!response.ok) return fallback();
    return response;
  } catch {
    return fallback();
  }
}

export const supabaseProvider: CrmStorageProvider = {
  async getProspects<T extends CrmProspectRecord>(defaults: T[], normalize: NormalizeProspect<T>) {
    if (!isSupabaseConfigured()) return localStorageProvider.getProspects(defaults, normalize);

    const fallback = () => localStorageProvider.getProspects(defaults, normalize);
    const response = await fetchSupabase<T>(`${endpoint()}?select=*`, { headers: headers(), cache: 'no-store' }, fallback);
    if (Array.isArray(response)) return response;

    const rows = await response.json();
    return Array.isArray(rows) ? rows.map((row) => fromSupabaseRow(row, normalize)) : fallback();
  },

  async saveProspect<T extends CrmProspectRecord>(prospect: T, current: T[]) {
    if (!isSupabaseConfigured()) return localStorageProvider.saveProspect(prospect, current);

    const next = [prospect, ...current];
    const fallback = () => localStorageProvider.saveProspect(prospect, current);
    await fetchSupabase<T>(endpoint(), {
      method: 'POST',
      headers: headers('resolution=merge-duplicates'),
      body: JSON.stringify(toSupabaseRow(prospect)),
    }, fallback);
    return next;
  },

  async updateProspect<T extends CrmProspectRecord>(id: string, patch: Partial<T>, current: T[]) {
    if (!isSupabaseConfigured()) return localStorageProvider.updateProspect(id, patch, current);

    const next = current.map((item) => item.id === id ? { ...item, ...patch } : item);
    const updated = next.find((item) => item.id === id);
    if (!updated) return next;

    const fallback = () => localStorageProvider.updateProspect(id, patch, current);
    await fetchSupabase<T>(endpoint(id), {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(toSupabaseRow(updated)),
    }, fallback);
    return next;
  },

  async deleteProspect<T extends CrmProspectRecord>(id: string, current: T[]) {
    if (!isSupabaseConfigured()) return localStorageProvider.deleteProspect(id, current);

    const next = current.filter((item) => item.id !== id);
    const fallback = () => localStorageProvider.deleteProspect(id, current);
    await fetchSupabase<T>(endpoint(id), { method: 'DELETE', headers: headers() }, fallback);
    return next;
  },

  async importProspects<T extends CrmProspectRecord>(prospects: T[], current: T[]) {
    if (!isSupabaseConfigured()) return localStorageProvider.importProspects(prospects, current);

    const next = [...prospects, ...current];
    const fallback = () => localStorageProvider.importProspects(prospects, current);
    await fetchSupabase<T>(endpoint(), {
      method: 'POST',
      headers: headers('resolution=merge-duplicates'),
      body: JSON.stringify(prospects.map(toSupabaseRow)),
    }, fallback);
    return next;
  },

  async exportProspects<T extends CrmProspectRecord>(prospects: T[]) {
    if (!isSupabaseConfigured()) return localStorageProvider.exportProspects(prospects);

    const fallback = () => localStorageProvider.exportProspects(prospects);
    await fetchSupabase<T>(endpoint(), {
      method: 'POST',
      headers: headers('resolution=merge-duplicates'),
      body: JSON.stringify(prospects.map(toSupabaseRow)),
    }, fallback);
    return prospects;
  },
};
