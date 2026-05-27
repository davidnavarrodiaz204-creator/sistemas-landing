export type CrmStorageMode = 'local' | 'supabase';

export type CrmHistoryPayload = {
  fechaUltimoMensaje?: string;
  cantidadMensajesEnviados?: number;
  respuestaCliente?: string;
  estadoConversacion?: string;
  historialMensajes?: unknown[];
};

export type CrmProspectRecord = {
  id: string;
  negocio: string;
  rubro: string;
  zona: string;
  contacto: string;
  telefono: string;
  redSocial: string;
  interes: string;
  estado: string;
  fechaUltimoContacto: string;
  fechaProximoContacto: string;
  nota: string;
  origen: string;
  permisoContacto: string;
  ultimoMensajeEnviado: string;
  createdAt: string;
  [key: string]: unknown;
};

export type NormalizeProspect<T extends CrmProspectRecord> = (raw: Partial<T>) => T;

export type CrmStorageProvider = {
  getProspects<T extends CrmProspectRecord>(defaults: T[], normalize: NormalizeProspect<T>): Promise<T[]>;
  saveProspect<T extends CrmProspectRecord>(prospect: T, current: T[]): Promise<T[]>;
  updateProspect<T extends CrmProspectRecord>(id: string, patch: Partial<T>, current: T[]): Promise<T[]>;
  deleteProspect<T extends CrmProspectRecord>(id: string, current: T[]): Promise<T[]>;
  importProspects<T extends CrmProspectRecord>(prospects: T[], current: T[]): Promise<T[]>;
  exportProspects<T extends CrmProspectRecord>(prospects: T[]): Promise<T[]>;
};
