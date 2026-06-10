import { query } from './db';

export type DbFollowUp = {
  id: string;
  prospect_id: string;
  type: string;
  note: string;
  due_date: string | null;
  done_at: string | null;
  created_at: string;
};

export type CreateFollowUpInput = {
  prospectId: string;
  type: string;
  note?: string;
  dueDate?: string;
};

export async function createFollowUp(input: CreateFollowUpInput): Promise<DbFollowUp | null> {
  const result = await query(
    `INSERT INTO follow_ups (prospect_id, type, note, due_date) VALUES ($1,$2,$3,$4) RETURNING *`,
    [input.prospectId, input.type, input.note || '', input.dueDate || null],
  );
  return result?.rows?.[0] || null;
}

export async function getFollowUpsForProspect(prospectId: string): Promise<DbFollowUp[]> {
  const result = await query('SELECT * FROM follow_ups WHERE prospect_id = $1 ORDER BY created_at DESC', [prospectId]);
  return result?.rows || [];
}

export type FollowUpWithProspect = DbFollowUp & {
  business_name: string;
  phone: string;
  rubro: string;
  ciudad: string;
  temperature: string;
  status: string;
  score: number;
};

export async function getTodayFollowUps(): Promise<FollowUpWithProspect[]> {
  const result = await query(
    `SELECT f.*, p.business_name, p.phone, p.rubro, p.ciudad, p.temperature, p.status, p.score
     FROM follow_ups f
     JOIN prospects p ON p.id = f.prospect_id
     WHERE f.done_at IS NULL AND f.due_date <= NOW() + INTERVAL '1 day'
     ORDER BY f.due_date ASC NULLS LAST, f.created_at ASC
     LIMIT 20`,
  );
  return result?.rows || [];
}

export async function markFollowUpDone(id: string): Promise<DbFollowUp | null> {
  const result = await query('UPDATE follow_ups SET done_at = NOW() WHERE id = $1 RETURNING *', [id]);
  return result?.rows?.[0] || null;
}

export async function updateFollowUp(id: string, updates: Record<string, unknown>): Promise<DbFollowUp | null> {
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = keys.map((k) => updates[k]);
  const result = await query(
    `UPDATE follow_ups SET ${setClause} WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return result?.rows?.[0] || null;
}

export async function getPendingFollowUpCount(): Promise<number> {
  const result = await query('SELECT COUNT(*) AS count FROM follow_ups WHERE done_at IS NULL');
  return result?.rows?.[0]?.count || 0;
}
