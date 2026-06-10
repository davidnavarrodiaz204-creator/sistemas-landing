import { getDb } from './db';
import { randomUUID } from 'crypto';

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
  const db = await getDb();
  const doc: DbInboxMessage = {
    id: randomUUID(),
    thread_id: input.threadId,
    direction: input.direction,
    body: input.body,
    intent: input.intent || '',
    suggested_reply: input.suggestedReply || '',
    approved_at: null,
    sent_at: null,
    created_at: new Date().toISOString(),
  };
  await db.collection<DbInboxMessage>('crm_inbox_messages').insertOne(doc);
  return doc;
}

export async function getMessagesForThread(threadId: string): Promise<DbInboxMessage[]> {
  const db = await getDb();
  return db.collection<DbInboxMessage>('crm_inbox_messages')
    .find({ thread_id: threadId })
    .sort({ created_at: 1 })
    .toArray();
}

export async function getMessageById(id: string): Promise<DbInboxMessage | null> {
  const db = await getDb();
  const doc = await db.collection<DbInboxMessage>('crm_inbox_messages').findOne({ id });
  return doc || null;
}

export async function approveMessage(id: string): Promise<DbInboxMessage | null> {
  const db = await getDb();
  return db.collection<DbInboxMessage>('crm_inbox_messages').findOneAndUpdate(
    { id },
    { $set: { approved_at: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
}

export async function markMessageSent(id: string): Promise<DbInboxMessage | null> {
  const db = await getDb();
  return db.collection<DbInboxMessage>('crm_inbox_messages').findOneAndUpdate(
    { id },
    { $set: { sent_at: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
}

export async function getUnapprovedMessages(threadId: string): Promise<DbInboxMessage[]> {
  const db = await getDb();
  return db.collection<DbInboxMessage>('crm_inbox_messages')
    .find({
      thread_id: threadId,
      direction: 'INBOUND',
      approved_at: null,
      intent: { $ne: '' },
    })
    .sort({ created_at: -1 })
    .toArray();
}

export async function getLastMessageForThread(threadId: string): Promise<DbInboxMessage | null> {
  const db = await getDb();
  const docs = await db.collection<DbInboxMessage>('crm_inbox_messages')
    .find({ thread_id: threadId })
    .sort({ created_at: -1 })
    .limit(1)
    .toArray();
  return docs[0] || null;
}
