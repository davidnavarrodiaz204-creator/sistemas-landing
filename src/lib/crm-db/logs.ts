import { query } from './db';

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
  const result = await query(
    'INSERT INTO automation_logs (event, detail, prospect_id, channel, thread_id) VALUES ($1,$2,$3,$4,$5) RETURNING *',
    [event, detail || '', prospectId || null, channel || '', threadId || ''],
  );
  return result?.rows?.[0] || null;
}

export async function getLogs(limit = 50): Promise<DbLog[]> {
  const result = await query('SELECT * FROM automation_logs ORDER BY created_at DESC LIMIT $1', [limit]);
  return result?.rows || [];
}

export async function getLogsByChannel(channel: string, limit = 20): Promise<DbLog[]> {
  const result = await query('SELECT * FROM automation_logs WHERE channel = $1 ORDER BY created_at DESC LIMIT $2', [channel, limit]);
  return result?.rows || [];
}
