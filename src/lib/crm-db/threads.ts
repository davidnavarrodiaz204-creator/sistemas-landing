import { query } from './db';

export type DbInboxThread = {
  id: string;
  prospect_id: string | null;
  channel: string;
  external_thread_id: string;
  contact_name: string;
  contact_handle: string;
  status: string;
  last_message_at: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateThreadInput = {
  prospectId?: string;
  channel: string;
  externalThreadId?: string;
  contactName?: string;
  contactHandle?: string;
};

export type ThreadWithProspect = DbInboxThread & {
  business_name?: string;
  rubro?: string;
  phone?: string;
};

export async function createThread(input: CreateThreadInput): Promise<DbInboxThread | null> {
  const result = await query(
    `INSERT INTO crm_inbox_threads (prospect_id, channel, external_thread_id, contact_name, contact_handle)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [input.prospectId || null, input.channel, input.externalThreadId || '', input.contactName || '', input.contactHandle || ''],
  );
  return result?.rows?.[0] || null;
}

export async function getThreadById(id: string): Promise<DbInboxThread | null> {
  const result = await query('SELECT * FROM crm_inbox_threads WHERE id = $1', [id]);
  return result?.rows?.[0] || null;
}

export async function getThreadsForProspect(prospectId: string): Promise<DbInboxThread[]> {
  const result = await query('SELECT * FROM crm_inbox_threads WHERE prospect_id = $1 ORDER BY last_message_at DESC NULLS LAST', [prospectId]);
  return result?.rows || [];
}

export async function getOpenThreads(): Promise<ThreadWithProspect[]> {
  const result = await query(
    `SELECT t.*, p.business_name, p.rubro, p.phone
     FROM crm_inbox_threads t LEFT JOIN prospects p ON p.id = t.prospect_id
     WHERE t.status IN ('OPEN','PENDING')
     ORDER BY t.last_message_at DESC NULLS LAST LIMIT 50`,
  );
  return result?.rows || [];
}

export async function getThreadsByChannel(channel: string): Promise<ThreadWithProspect[]> {
  const result = await query(
    `SELECT t.*, p.business_name, p.rubro, p.phone
     FROM crm_inbox_threads t LEFT JOIN prospects p ON p.id = t.prospect_id
     WHERE t.channel = $1 AND t.status IN ('OPEN','PENDING')
     ORDER BY t.last_message_at DESC NULLS LAST`,
    [channel],
  );
  return result?.rows || [];
}

export async function findOrCreateThread(input: CreateThreadInput & { externalThreadId: string }): Promise<DbInboxThread> {
  const existing = await query(
    `SELECT * FROM crm_inbox_threads WHERE channel = $1 AND external_thread_id = $2 LIMIT 1`,
    [input.channel, input.externalThreadId],
  );
  if (existing?.rows?.[0]) return existing.rows[0];
  const created = await createThread(input);
  return created!;
}

export async function updateThread(id: string, updates: Record<string, unknown>): Promise<DbInboxThread | null> {
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = keys.map((k) => updates[k]);
  const result = await query(
    `UPDATE crm_inbox_threads SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return result?.rows?.[0] || null;
}

export async function getThreadCount(): Promise<number> {
  const result = await query('SELECT COUNT(*) FROM crm_inbox_threads', []);
  return result?.rows?.[0]?.count || 0;
}

export async function getPendingThreadCount(): Promise<number> {
  const result = await query("SELECT COUNT(*) FROM crm_inbox_threads WHERE status IN ('OPEN','PENDING')", []);
  return result?.rows?.[0]?.count || 0;
}
