import { query } from './db';

export type DbDemo = {
  id: string;
  prospect_id: string;
  product: string;
  scheduled_at: string;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CreateDemoInput = {
  prospectId: string;
  product?: string;
  scheduledAt: string;
  notes?: string;
};

export async function createDemo(input: CreateDemoInput): Promise<DbDemo | null> {
  const result = await query(
    `INSERT INTO demos (prospect_id, product, scheduled_at, notes) VALUES ($1,$2,$3,$4) RETURNING *`,
    [input.prospectId, input.product || 'RESTO', input.scheduledAt, input.notes || ''],
  );
  return result?.rows?.[0] || null;
}

export async function getDemoById(id: string): Promise<DbDemo | null> {
  const result = await query('SELECT * FROM demos WHERE id = $1', [id]);
  return result?.rows?.[0] || null;
}

export async function getDemosForProspect(prospectId: string): Promise<DbDemo[]> {
  const result = await query('SELECT * FROM demos WHERE prospect_id = $1 ORDER BY scheduled_at DESC', [prospectId]);
  return result?.rows || [];
}

export async function getTodaysDemos(): Promise<Array<DbDemo & { business_name: string; phone: string; rubro: string; ciudad: string }>> {
  const result = await query(
    `SELECT d.*, p.business_name, p.phone, p.rubro, p.ciudad FROM demos d JOIN prospects p ON p.id = d.prospect_id WHERE d.scheduled_at::date = CURRENT_DATE ORDER BY d.scheduled_at ASC`,
  );
  return result?.rows || [];
}

export async function getOverdueDemos(): Promise<Array<DbDemo & { business_name: string; phone: string }>> {
  const result = await query(
    `SELECT d.*, p.business_name, p.phone FROM demos d JOIN prospects p ON p.id = d.prospect_id WHERE d.status = 'AGENDADA' AND d.scheduled_at < NOW() ORDER BY d.scheduled_at ASC LIMIT 10`,
  );
  return result?.rows || [];
}

export async function updateDemo(id: string, updates: Record<string, unknown>): Promise<DbDemo | null> {
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = keys.map((k) => updates[k]);
  const result = await query(
    `UPDATE demos SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return result?.rows?.[0] || null;
}

export async function markDemoDone(id: string, status: string): Promise<DbDemo | null> {
  return updateDemo(id, { status, updated_at: new Date().toISOString() });
}
