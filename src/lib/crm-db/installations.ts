import { query } from './db';

export type DbInstallation = {
  id: string;
  prospect_id: string;
  product: string;
  scheduled_at: string | null;
  type: string;
  needs_printer: boolean;
  needs_initial_inventory: boolean;
  equipment_notes: string;
  notes: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export type CreateInstallationInput = {
  prospectId: string;
  product?: string;
  scheduledAt?: string;
  type?: string;
  needsPrinter?: boolean;
  needsInitialInventory?: boolean;
  equipmentNotes?: string;
  notes?: string;
};

export async function createInstallation(input: CreateInstallationInput): Promise<DbInstallation | null> {
  const result = await query(
    `INSERT INTO installations (prospect_id, product, scheduled_at, type, needs_printer, needs_initial_inventory, equipment_notes, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      input.prospectId, input.product || 'RESTO', input.scheduledAt || null,
      input.type || 'PRODUCCION', input.needsPrinter || false, input.needsInitialInventory || false,
      input.equipmentNotes || '', input.notes || '',
    ],
  );
  return result?.rows?.[0] || null;
}

export async function getInstallationById(id: string): Promise<DbInstallation | null> {
  const result = await query('SELECT * FROM installations WHERE id = $1', [id]);
  return result?.rows?.[0] || null;
}

export async function getInstallationsForProspect(prospectId: string): Promise<DbInstallation[]> {
  const result = await query('SELECT * FROM installations WHERE prospect_id = $1 ORDER BY created_at DESC', [prospectId]);
  return result?.rows || [];
}

export async function getTodaysInstallations(): Promise<Array<DbInstallation & { business_name: string; phone: string; rubro: string; ciudad: string }>> {
  const result = await query(
    `SELECT i.*, p.business_name, p.phone, p.rubro, p.ciudad FROM installations i JOIN prospects p ON p.id = i.prospect_id WHERE i.scheduled_at::date = CURRENT_DATE ORDER BY i.scheduled_at ASC`,
  );
  return result?.rows || [];
}

export async function getOverdueInstallations(): Promise<Array<DbInstallation & { business_name: string; phone: string }>> {
  const result = await query(
    `SELECT i.*, p.business_name, p.phone FROM installations i JOIN prospects p ON p.id = i.prospect_id WHERE i.status IN ('PENDIENTE','EN_PROCESO') AND i.scheduled_at < NOW() ORDER BY i.scheduled_at ASC LIMIT 10`,
  );
  return result?.rows || [];
}

export async function updateInstallation(id: string, updates: Record<string, unknown>): Promise<DbInstallation | null> {
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = keys.map((k) => updates[k]);
  const result = await query(
    `UPDATE installations SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return result?.rows?.[0] || null;
}
