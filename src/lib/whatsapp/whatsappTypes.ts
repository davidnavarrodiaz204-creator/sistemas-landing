export type WhatsAppInterest = 'RESTO' | 'FERRO' | 'Ambos';

export type ContactPermission = 'Pendiente' | 'Aceptó contacto' | 'No contactar';

export type ConversationStatus =
  | 'Sin respuesta'
  | 'Respondió'
  | 'Interesado'
  | 'Demo activa'
  | 'No contactar';

export type WhatsAppMessageStatus =
  | 'prepared'
  | 'copied'
  | 'opened_whatsapp'
  | 'sent_marked'
  | 'openwa_sent'
  | 'openwa_simulated'
  | 'answered'
  | 'blocked'
  | 'ai_saved';

export type WhatsAppMessageLog = {
  id: string;
  prospectId: string;
  phone: string;
  interes: WhatsAppInterest;
  message: string;
  status: WhatsAppMessageStatus;
  createdAt: string;
  mediaUrl?: string;
};

export type WhatsAppProspectControl = {
  permisoContacto: ContactPermission;
  ultimoMensajeEnviado: string;
  fechaUltimoMensaje: string;
  cantidadMensajesEnviados: number;
  respuestaCliente: string;
  estadoConversacion: ConversationStatus;
  historialMensajes: WhatsAppMessageLog[];
};
