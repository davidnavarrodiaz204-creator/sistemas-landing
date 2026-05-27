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
  | 'answered'
  | 'blocked';

export type WhatsAppMessageLog = {
  id: string;
  prospectId: string;
  phone: string;
  interes: WhatsAppInterest;
  message: string;
  status: WhatsAppMessageStatus;
  createdAt: string;
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
