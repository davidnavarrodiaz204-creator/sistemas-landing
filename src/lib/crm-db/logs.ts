import { getDb } from './db';
import { randomUUID } from 'crypto';

export type DbLog = {
  id: string;
  event: string;
  detail: string;
  prospect_id: string | null;
  channel: string;
  thread_id: string;
  created_at: string;
};

export async function createLog(event: string, detail?: string, prospectId?: string, channel?: string, threadId?: string): Promise<DbLog | null> {
  const db = await getDb();
  const doc: DbLog = {
    id: randomUUID(),
    event,
    detail: detail || '',
    prospect_id: prospectId || null,
    channel: channel || '',
    thread_id: threadId || '',
    created_at: new Date().toISOString(),
  };
  await db.collection<DbLog>('automation_logs').insertOne(doc);
  return doc;
}

export async function getLogs(limit = 50): Promise<DbLog[]> {
  const db = await getDb();
  return db.collection<DbLog>('automation_logs')
    .find()
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
}

export async function getLogsByChannel(channel: string, limit = 20): Promise<DbLog[]> {
  const db = await getDb();
  return db.collection<DbLog>('automation_logs')
    .find({ channel })
    .sort({ created_at: -1 })
    .limit(limit)
    .toArray();
}
