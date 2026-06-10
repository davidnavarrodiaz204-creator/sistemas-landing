import { createLog } from '@/lib/crm-db/logs';

export type ChannelLogType = 
  | 'channel:pg:status'
  | 'channel:openwa:connection'
  | 'channel:openwa:message_received'
  | 'channel:openwa:message_sent'
  | 'channel:openwa:error'
  | 'channel:meta:webhook_received'
  | 'channel:meta:message_sent'
  | 'channel:meta:error'
  | 'channel:email:connection'
  | 'channel:email:message_received'
  | 'channel:email:message_sent'
  | 'channel:email:error'
  | 'channel:imap:connection'
  | 'channel:imap:error'
  | 'channel:inbox:thread_created'
  | 'channel:inbox:message_analyzed'
  | 'channel:inbox:intent_detected'
  | 'channel:inbox:reply_suggested'
  | 'channel:inbox:reply_approved'
  | 'channel:inbox:reply_sent'
  | 'channel:inbox:error';

const CHANNEL_MAP: Record<string, string> = {
  'channel:pg:': 'pg',
  'channel:openwa:': 'openwa',
  'channel:meta:': 'meta',
  'channel:email:': 'email',
  'channel:imap:': 'imap',
  'channel:inbox:': 'inbox',
};

function extractChannel(type: string): string {
  for (const [prefix, ch] of Object.entries(CHANNEL_MAP)) {
    if (type.startsWith(prefix)) return ch;
  }
  return 'unknown';
}

export async function logChannelEvent(
  type: ChannelLogType,
  detail: string,
  threadId?: string,
  prospectId?: string,
) {
  try {
    const channel = extractChannel(type);
    await createLog(type, detail, prospectId, channel, threadId);
  } catch {
    // silent fail on log errors
  }
}
