import { getDb } from './db';
import crypto from 'crypto';

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
  const db = await getDb();
  const now = new Date().toISOString();
  const doc: DbInstallation = {
    id: crypto.randomUUID(),
    prospect_id: input.prospectId,
    product: input.product || 'RESTO',
    scheduled_at: input.scheduledAt || null,
    type: input.type || 'PRODUCCION',
    needs_printer: input.needsPrinter || false,
    needs_initial_inventory: input.needsInitialInventory || false,
    equipment_notes: input.equipmentNotes || '',
    notes: input.notes || '',
    status: 'PENDIENTE',
    created_at: now,
    updated_at: now,
  };
  await db.collection('installations').insertOne(doc);
  return doc;
}

export async function getInstallationById(id: string): Promise<DbInstallation | null> {
  const db = await getDb();
  const doc = await db.collection<DbInstallation>('installations').findOne({ id });
  return doc || null;
}

export async function getInstallationsForProspect(prospectId: string): Promise<DbInstallation[]> {
  const db = await getDb();
  return db
    .collection<DbInstallation>('installations')
    .find({ prospect_id: prospectId })
    .sort({ created_at: -1 })
    .toArray();
}

export async function getTodaysInstallations(): Promise<
  Array<DbInstallation & { business_name: string; phone: string; rubro: string; ciudad: string }>
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
  return db.collection('installations').aggregate(pipeline).toArray() as any;
}

export async function getOverdueInstallations(): Promise<
  Array<DbInstallation & { business_name: string; phone: string }>
> {
  const db = await getDb();
  const now = new Date().toISOString();
  const pipeline = [
    {
      $match: {
        status: { $in: ['PENDIENTE', 'EN_PROCESO'] },
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
  return db.collection('installations').aggregate(pipeline).toArray() as any;
}

export async function updateInstallation(id: string, updates: Record<string, unknown>): Promise<DbInstallation | null> {
  const db = await getDb();
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setFields: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  await db.collection('installations').updateOne({ id }, { $set: setFields });
  return db.collection<DbInstallation>('installations').findOne({ id }) || null;
}
