export type QueueChannel = 'whatsapp_manual' | 'openwa' | 'email' | 'facebook_manual';

export type QueueItemStatus =
  | 'pending'
  | 'approved'
  | 'sent'
  | 'simulated'
  | 'failed'
  | 'blocked'
  | 'responded'
  | 'no_contact';

export type AutomationLogType =
  | 'prospect_found'
  | 'duplicate_detected'
  | 'message_generated'
  | 'sent'
  | 'simulated'
  | 'error'
  | 'blocked_limit'
  | 'queue_approved'
  | 'queue_prepared'
  | 'search_performed';

export type QueueItem = {
  id: string;
  prospectId: string;
  channel: QueueChannel;
  message: string;
  scheduledAt: string;
  sentAt: string | null;
  error: string | null;
  attempts: number;
  createdAt: string;
  status: QueueItemStatus;
};

export type AutomationLog = {
  id: string;
  type: AutomationLogType;
  message: string;
  prospectId?: string;
  campaignId?: string;
  timestamp: string;
  details?: Record<string, unknown>;
};

export type AutoSearchInput = {
  rubro: string;
  ciudad: string;
  fuente: string;
  keywords: string;
};
