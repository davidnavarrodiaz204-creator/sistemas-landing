import { getDb } from './db';
import crypto from 'crypto';

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
  const db = await getDb();
  const now = new Date().toISOString();
  const doc: DbDemo = {
    id: crypto.randomUUID(),
    prospect_id: input.prospectId,
    product: input.product || 'RESTO',
    scheduled_at: input.scheduledAt,
    status: 'AGENDADA',
    notes: input.notes || '',
    created_at: now,
    updated_at: now,
  };
  await db.collection('demos').insertOne(doc);
  return doc;
}

export async function getDemoById(id: string): Promise<DbDemo | null> {
  const db = await getDb();
  const doc = await db.collection<DbDemo>('demos').findOne({ id });
  return doc || null;
}

export async function getDemosForProspect(prospectId: string): Promise<DbDemo[]> {
  const db = await getDb();
  return db
    .collection<DbDemo>('demos')
    .find({ prospect_id: prospectId })
    .sort({ scheduled_at: -1 })
    .toArray();
}

export async function getTodaysDemos(): Promise<
  Array<DbDemo & { business_name: string; phone: string; rubro: string; ciudad: string }>
> {
  const db = await getDb();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date();
  todayEnd.setHours(23, 59, 59, 999);
  const pipeline = [
    {
      $match: {
        scheduled_at: {
          $gte: todayStart.toISOString(),
          $lte: todayEnd.toISOString(),
        },
      },
    },
    {
      $lookup: {
        from: 'prospects',
        localField: 'prospect_id',
        foreignField: 'id',
        as: 'prospect',
      },
    },
    { $unwind: { path: '$prospect', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        business_name: '$prospect.business_name',
        phone: '$prospect.phone',
        rubro: '$prospect.rubro',
        ciudad: '$prospect.ciudad',
      },
    },
    { $project: { prospect: 0 } },
    { $sort: { scheduled_at: 1 } },
  ];
  return db.collection('demos').aggregate(pipeline).toArray() as any;
}

export async function getOverdueDemos(): Promise<
  Array<DbDemo & { business_name: string; phone: string }>
> {
  const db = await getDb();
  const now = new Date().toISOString();
  const pipeline = [
    {
      $match: {
        status: 'AGENDADA',
        scheduled_at: { $lt: now },
      },
    },
    {
      $lookup: {
        from: 'prospects',
        localField: 'prospect_id',
        foreignField: 'id',
        as: 'prospect',
      },
    },
    { $unwind: { path: '$prospect', preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        business_name: '$prospect.business_name',
        phone: '$prospect.phone',
      },
    },
    { $project: { prospect: 0 } },
    { $sort: { scheduled_at: 1 } },
    { $limit: 10 },
  ];
  return db.collection('demos').aggregate(pipeline).toArray() as any;
}

export async function updateDemo(id: string, updates: Record<string, unknown>): Promise<DbDemo | null> {
  const db = await getDb();
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  await db
    .collection('demos')
    .updateOne({ id }, { $set: { ...updates, updated_at: new Date().toISOString() } });
  const doc = await db.collection<DbDemo>('demos').findOne({ id });
  return doc || null;
}

export async function markDemoDone(id: string, status: string): Promise<DbDemo | null> {
  return updateDemo(id, { status, updated_at: new Date().toISOString() });
}
