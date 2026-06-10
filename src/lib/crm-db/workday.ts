import { getDb } from './db';
import crypto from 'crypto';

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

function todayStr(): string {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}

function startOfTodayISO(): string {
  return todayStr() + 'T00:00:00.000Z';
}

function endOfTodayISO(): string {
  return todayStr() + 'T23:59:59.999Z';
}

export async function getTodayWorkday(): Promise<DbWorkday | null> {
  const db = await getDb();
  const doc = await db.collection<DbWorkday>('workdays').findOne({ date: todayStr() });
  return doc || null;
}

export async function startWorkday(meta = 10): Promise<DbWorkday | null> {
  const db = await getDb();
  const existing = await getTodayWorkday();
  if (existing?.started_at && !existing.closed_at) return existing;
  if (existing?.closed_at) {
    const now = new Date().toISOString();
    await db.collection('workdays').updateOne(
      { id: existing.id },
      { $set: { started_at: now, closed_at: null, meta_diaria: meta, updated_at: now } },
    );
    return db.collection<DbWorkday>('workdays').findOne({ id: existing.id }) || null;
  }
  const now = new Date().toISOString();
  const doc: DbWorkday = {
    id: crypto.randomUUID(),
    date: todayStr(),
    started_at: now,
    closed_at: null,
    meta_diaria: meta,
    notes: '',
    created_at: now,
    updated_at: now,
  };
  await db.collection('workdays').insertOne(doc);
  return doc;
}

export async function closeWorkday(notes?: string): Promise<DbWorkday | null> {
  const existing = await getTodayWorkday();
  if (!existing) return null;
  const db = await getDb();
  const now = new Date().toISOString();
  await db.collection('workdays').updateOne(
    { id: existing.id },
    { $set: { closed_at: now, notes: notes || existing.notes, updated_at: now } },
  );
  return db.collection<DbWorkday>('workdays').findOne({ id: existing.id }) || null;
}

export type WorkdayStats = {
  contactsToday: number;
  interestedToday: number;
  demosToday: number;
  pendingFollowUps: number;
};

export async function getWorkdayStats(): Promise<WorkdayStats> {
  const db = await getDb();
  const todayStart = startOfTodayISO();
  const todayEnd = endOfTodayISO();
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString();

  const [contactsToday, interestedToday, demosToday, pendingFollowUps] = await Promise.all([
    db.collection('prospects').countDocuments({
      last_contact_at: { $ne: null, $gte: todayStart, $lte: todayEnd },
      status: { $ne: 'NO_CONTACTAR' },
    }),
    db.collection('prospects').countDocuments({
      status: 'INTERESADO',
      updated_at: { $gte: todayStart, $lte: todayEnd },
    }),
    db.collection('prospects').countDocuments({
      status: { $in: ['DEMO_AGENDADA', 'DEMO_ACTIVA'] },
      updated_at: { $gte: todayStart, $lte: todayEnd },
    }),
    db.collection('follow_ups').countDocuments({
      done_at: null,
      due_date: { $lte: tomorrowStr },
    }),
  ]);

  return { contactsToday, interestedToday, demosToday, pendingFollowUps };
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

function toAlert(p: any, type: AlertType): SalesAlert {
  return {
    type,
    prospectId: p.id,
    businessName: p.business_name,
    rubro: p.rubro,
    ciudad: p.ciudad,
    phone: p.phone,
    status: p.status,
    temperature: p.temperature,
    score: p.score,
    daysSinceLastContact: p.last_contact_at
      ? Math.floor((Date.now() - new Date(p.last_contact_at).getTime()) / 86400000)
      : null,
  };
}

export async function getSalesAlerts(): Promise<SalesAlert[]> {
  const db = await getDb();
  const alerts: SalesAlert[] = [];
  const now = new Date().toISOString();
  const todayStart = startOfTodayISO();

  // CALIENTE_SIN_CONTACTO
  const calientes = await db.collection('prospects').find({
    temperature: 'CALIENTE',
    status: { $nin: ['NO_CONTACTAR', 'PRODUCCION', 'INSTALACION'] },
    $or: [
      { last_contact_at: null },
      { last_contact_at: { $lt: todayStart } },
    ],
  }).sort({ score: -1 }).limit(5).toArray();
  for (const p of calientes) alerts.push(toAlert(p, 'CALIENTE_SIN_CONTACTO'));

  // INTERESADO_SIN_DEMO
  const pendingDemoFolios = await db.collection('follow_ups').distinct('prospect_id', {
    type: 'DEMO',
    done_at: null,
  });
  const interesados = await db.collection('prospects').find({
    status: 'INTERESADO',
    $or: [
      { next_follow_up_at: null },
      { next_follow_up_at: { $lt: now } },
    ],
    id: { $nin: pendingDemoFolios },
  }).limit(5).toArray();
  for (const p of interesados) alerts.push(toAlert(p, 'INTERESADO_SIN_DEMO'));

  // DEMO_VENCIDA
  const overdueFolioIds = await db.collection('follow_ups').distinct('prospect_id', {
    type: 'DEMO',
    done_at: null,
    due_date: { $lt: now },
  });
  const demosVencidas = await db.collection('prospects').find({
    id: { $in: overdueFolioIds },
    status: { $in: ['DEMO_AGENDADA', 'DEMO_ACTIVA'] },
  }).limit(5).toArray();
  for (const p of demosVencidas) alerts.push(toAlert(p, 'DEMO_VENCIDA'));

  // SIN_RESPUESTA
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString();
  const sinRespuesta = await db.collection('prospects').find({
    status: { $in: ['CONTACTADO', 'RESPONDIO'] },
    last_contact_at: { $ne: null, $lt: twoDaysAgo },
  }).limit(5).toArray();
  for (const p of sinRespuesta) alerts.push(toAlert(p, 'SIN_RESPUESTA'));

  return alerts;
}
