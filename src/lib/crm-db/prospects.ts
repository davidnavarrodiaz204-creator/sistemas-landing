import { query } from './db';

export type DbProspect = {
  id: string;
  business_name: string;
  rubro: string;
  ciudad: string;
  zona: string;
  phone: string;
  email: string;
  facebook_url: string;
  instagram_url: string;
  tiktok_url: string;
  website_url: string;
  google_maps_url: string;
  source: string;
  score: number;
  temperature: string;
  status: string;
  last_contact_at: string | null;
  next_follow_up_at: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
};

export type CreateProspectInput = {
  businessName: string;
  rubro: string;
  ciudad: string;
  zona?: string;
  phone?: string;
  email?: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  websiteUrl?: string;
  googleMapsUrl?: string;
  source?: string;
  score?: number;
  temperature?: string;
  notes?: string;
};

export async function createProspect(input: CreateProspectInput): Promise<DbProspect | null> {
  const result = await query(
    `INSERT INTO prospects (business_name, rubro, ciudad, zona, phone, email, facebook_url, instagram_url, tiktok_url, website_url, google_maps_url, source, score, temperature, notes)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     RETURNING *`,
    [
      input.businessName, input.rubro, input.ciudad, input.zona || '',
      input.phone || '', input.email || '', input.facebookUrl || '',
      input.instagramUrl || '', input.tiktokUrl || '', input.websiteUrl || '',
      input.googleMapsUrl || '', input.source || 'simple', input.score || 0,
      input.temperature || 'FRIO', input.notes || '',
    ],
  );
  return result?.rows?.[0] || null;
}

export async function findProspectByPhone(phone: string): Promise<DbProspect | null> {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return null;
  const result = await query('SELECT * FROM prospects WHERE phone = $1 LIMIT 1', [clean]);
  return result?.rows?.[0] || null;
}

export async function findProspects(params: {
  rubro?: string;
  ciudad?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<DbProspect[]> {
  const conditions: string[] = [];
  const values: unknown[] = [];
  let idx = 1;
  if (params.rubro) { conditions.push(`rubro = $${idx++}`); values.push(params.rubro); }
  if (params.ciudad) { conditions.push(`ciudad ILIKE $${idx++}`); values.push(`%${params.ciudad}%`); }
  if (params.status) { conditions.push(`status = $${idx++}`); values.push(params.status); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const limit = Math.min(Math.max(params.limit || 20, 1), 100);
  const offset = Math.max(params.offset || 0, 0);
  const sql = `SELECT * FROM prospects ${where} ORDER BY created_at DESC LIMIT $${idx++} OFFSET $${idx++}`;
  const result = await query(sql, [...values, limit, offset]);
  return result?.rows || [];
}

export async function getProspectById(id: string): Promise<DbProspect | null> {
  const result = await query('SELECT * FROM prospects WHERE id = $1', [id]);
  return result?.rows?.[0] || null;
}

export async function updateProspect(id: string, updates: Record<string, unknown>): Promise<DbProspect | null> {
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setClause = keys.map((k, i) => `${k} = $${i + 2}`).join(', ');
  const values = keys.map((k) => updates[k]);
  const result = await query(
    `UPDATE prospects SET ${setClause}, updated_at = NOW() WHERE id = $1 RETURNING *`,
    [id, ...values],
  );
  return result?.rows?.[0] || null;
}

export async function getProspectsNeedingFollowUp(): Promise<DbProspect[]> {
  const result = await query(
    `SELECT * FROM prospects WHERE next_follow_up_at IS NOT NULL AND next_follow_up_at <= NOW() AND status != 'NO_CONTACTAR' ORDER BY next_follow_up_at ASC LIMIT 20`,
  );
  return result?.rows || [];
}

export async function getNextProspect(): Promise<DbProspect | null> {
  const result = await query(
    `SELECT * FROM prospects
     WHERE status NOT IN ('NO_CONTACTAR', 'PRODUCCION', 'INSTALACION')
       AND (last_contact_at IS NULL OR last_contact_at::date < CURRENT_DATE)
     ORDER BY
       CASE WHEN next_follow_up_at IS NOT NULL AND next_follow_up_at <= NOW() THEN 0 ELSE 1 END,
       CASE temperature WHEN 'CALIENTE' THEN 0 WHEN 'TIBIO' THEN 1 WHEN 'FRIO' THEN 2 ELSE 3 END,
       score DESC NULLS LAST
     LIMIT 1`,
  );
  return result?.rows?.[0] || null;
}

export async function getProspectCount(): Promise<number> {
  const result = await query('SELECT COUNT(*) AS count FROM prospects');
  return result?.rows?.[0]?.count || 0;
}
