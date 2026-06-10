import { query } from './db';

export type DbInboxMessage = {
  id: string;
  thread_id: string;
  direction: string;
  body: string;
  intent: string;
  suggested_reply: string;
  approved_at: string | null;
  sent_at: string | null;
  created_at: string;
};

export type CreateMessageInput = {
  threadId: string;
  direction: 'INBOUND' | 'OUTBOUND';
  body: string;
  intent?: string;
  suggestedReply?: string;
};

export async function createMessage(input: CreateMessageInput): Promise<DbInboxMessage | null> {
  const result = await query(
    `INSERT INTO crm_inbox_messages (thread_id, direction, body, intent, suggested_reply)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [input.threadId, input.direction, input.body, input.intent || '', input.suggestedReply || ''],
  );
  return result?.rows?.[0] || null;
}

export async function getMessagesForThread(threadId: string): Promise<DbInboxMessage[]> {
  const result = await query(
    'SELECT * FROM crm_inbox_messages WHERE thread_id = $1 ORDER BY created_at ASC',
    [threadId],
  );
  return result?.rows || [];
}

export async function getMessageById(id: string): Promise<DbInboxMessage | null> {
  const result = await query('SELECT * FROM crm_inbox_messages WHERE id = $1', [id]);
  return result?.rows?.[0] || null;
}

export async function approveMessage(id: string): Promise<DbInboxMessage | null> {
  const result = await query(
    'UPDATE crm_inbox_messages SET approved_at = NOW() WHERE id = $1 RETURNING *',
    [id],
  );
  return result?.rows?.[0] || null;
}

export async function markMessageSent(id: string): Promise<DbInboxMessage | null> {
  const result = await query(
    'UPDATE crm_inbox_messages SET sent_at = NOW() WHERE id = $1 RETURNING *',
    [id],
  );
  return result?.rows?.[0] || null;
}

export async function getUnapprovedMessages(threadId: string): Promise<DbInboxMessage[]> {
  const result = await query(
    `SELECT * FROM crm_inbox_messages WHERE thread_id = $1 AND direction = 'INBOUND' AND approved_at IS NULL AND intent != '' ORDER BY created_at DESC`,
    [threadId],
  );
  return result?.rows || [];
}

export async function getLastMessageForThread(threadId: string): Promise<DbInboxMessage | null> {
  const result = await query(
    'SELECT * FROM crm_inbox_messages WHERE thread_id = $1 ORDER BY created_at DESC LIMIT 1',
    [threadId],
  );
  return result?.rows?.[0] || null;
}
