import { query } from './db';

export type DbWorkday = {
  id: string;
  date: string;
  started_at: string | null;
  closed_at: string | null;
  meta_diaria: number;
  notes: string;
  created_at: string;
  updated_at: string;
};

export async function getTodayWorkday(): Promise<DbWorkday | null> {
  const result = await query('SELECT * FROM workdays WHERE date = CURRENT_DATE LIMIT 1');
  return result?.rows?.[0] || null;
}

export async function startWorkday(meta = 10): Promise<DbWorkday | null> {
  const existing = await getTodayWorkday();
  if (existing?.started_at && !existing.closed_at) return existing;
  if (existing?.closed_at) {
    const reopened = await query(
      `UPDATE workdays SET started_at = NOW(), closed_at = NULL, meta_diaria = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [meta, existing.id],
    );
    return reopened?.rows?.[0] || null;
  }
  const result = await query(
    `INSERT INTO workdays (date, started_at, meta_diaria) VALUES (CURRENT_DATE, NOW(), $1) RETURNING *`,
    [meta],
  );
  return result?.rows?.[0] || null;
}

export async function closeWorkday(notes?: string): Promise<DbWorkday | null> {
  const existing = await getTodayWorkday();
  if (!existing) return null;
  const result = await query(
    `UPDATE workdays SET closed_at = NOW(), notes = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [notes || existing.notes, existing.id],
  );
  return result?.rows?.[0] || null;
}

export type WorkdayStats = {
  contactsToday: number;
  interestedToday: number;
  demosToday: number;
  pendingFollowUps: number;
};

export async function getWorkdayStats(): Promise<WorkdayStats> {
  const contactsResult = await query(
    `SELECT COUNT(*) AS count FROM prospects WHERE last_contact_at IS NOT NULL AND last_contact_at::date = CURRENT_DATE AND status != 'NO_CONTACTAR'`,
  );
  const interestedResult = await query(
    `SELECT COUNT(*) AS count FROM prospects WHERE status = 'INTERESADO' AND updated_at::date = CURRENT_DATE`,
  );
  const demosResult = await query(
    `SELECT COUNT(*) AS count FROM prospects WHERE status IN ('DEMO_AGENDADA','DEMO_ACTIVA') AND updated_at::date = CURRENT_DATE`,
  );
  const followUpsResult = await query(
    `SELECT COUNT(*) AS count FROM follow_ups WHERE done_at IS NULL AND due_date <= NOW() + INTERVAL '1 day'`,
  );
  return {
    contactsToday: contactsResult?.rows?.[0]?.count || 0,
    interestedToday: interestedResult?.rows?.[0]?.count || 0,
    demosToday: demosResult?.rows?.[0]?.count || 0,
    pendingFollowUps: followUpsResult?.rows?.[0]?.count || 0,
  };
}

export type AlertType = 'CALIENTE_SIN_CONTACTO' | 'INTERESADO_SIN_DEMO' | 'DEMO_VENCIDA' | 'SIN_RESPUESTA';

export type SalesAlert = {
  type: AlertType;
  prospectId: string;
  businessName: string;
  rubro: string;
  ciudad: string;
  phone: string;
  status: string;
  temperature: string;
  score: number;
  daysSinceLastContact: number | null;
};

export async function getSalesAlerts(): Promise<SalesAlert[]> {
  const alerts: SalesAlert[] = [];

  const calientes = await query(
    `SELECT * FROM prospects WHERE temperature = 'CALIENTE' AND status NOT IN ('NO_CONTACTAR','PRODUCCION','INSTALACION') AND (last_contact_at IS NULL OR last_contact_at::date < CURRENT_DATE) ORDER BY score DESC LIMIT 5`,
  );
  for (const p of calientes?.rows || []) {
    alerts.push({
      type: 'CALIENTE_SIN_CONTACTO' as AlertType,
      prospectId: p.id, businessName: p.business_name, rubro: p.rubro, ciudad: p.ciudad, phone: p.phone,
      status: p.status, temperature: p.temperature, score: p.score,
      daysSinceLastContact: p.last_contact_at ? Math.floor((Date.now() - new Date(p.last_contact_at).getTime()) / 86400000) : null,
    });
  }

  const interesados = await query(
    `SELECT * FROM prospects WHERE status = 'INTERESADO' AND (next_follow_up_at IS NULL OR next_follow_up_at < NOW()) AND NOT EXISTS (SELECT 1 FROM follow_ups WHERE prospect_id = prospects.id AND type = 'DEMO' AND done_at IS NULL) LIMIT 5`,
  );
  for (const p of interesados?.rows || []) {
    alerts.push({
      type: 'INTERESADO_SIN_DEMO' as AlertType,
      prospectId: p.id, businessName: p.business_name, rubro: p.rubro, ciudad: p.ciudad, phone: p.phone,
      status: p.status, temperature: p.temperature, score: p.score,
      daysSinceLastContact: p.last_contact_at ? Math.floor((Date.now() - new Date(p.last_contact_at).getTime()) / 86400000) : null,
    });
  }

  const demosVencidas = await query(
    `SELECT p.* FROM prospects p JOIN follow_ups f ON f.prospect_id = p.id WHERE p.status IN ('DEMO_AGENDADA','DEMO_ACTIVA') AND f.done_at IS NULL AND f.due_date < NOW() LIMIT 5`,
  );
  for (const p of demosVencidas?.rows || []) {
    alerts.push({
      type: 'DEMO_VENCIDA' as AlertType,
      prospectId: p.id, businessName: p.business_name, rubro: p.rubro, ciudad: p.ciudad, phone: p.phone,
      status: p.status, temperature: p.temperature, score: p.score,
      daysSinceLastContact: p.last_contact_at ? Math.floor((Date.now() - new Date(p.last_contact_at).getTime()) / 86400000) : null,
    });
  }

  const sinRespuesta = await query(
    `SELECT * FROM prospects WHERE status IN ('CONTACTADO','RESPONDIO') AND last_contact_at IS NOT NULL AND last_contact_at < NOW() - INTERVAL '2 days' AND last_contact_at::date < CURRENT_DATE LIMIT 5`,
  );
  for (const p of sinRespuesta?.rows || []) {
    alerts.push({
      type: 'SIN_RESPUESTA' as AlertType,
      prospectId: p.id, businessName: p.business_name, rubro: p.rubro, ciudad: p.ciudad, phone: p.phone,
      status: p.status, temperature: p.temperature, score: p.score,
      daysSinceLastContact: Math.floor((Date.now() - new Date(p.last_contact_at).getTime()) / 86400000),
    });
  }

  return alerts;
}
