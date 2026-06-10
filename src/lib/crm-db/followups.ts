import { getDb } from './db';
import { randomUUID } from 'crypto';

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
  const db = await getDb();
  const doc: DbFollowUp = {
    id: randomUUID(),
    prospect_id: input.prospectId,
    type: input.type,
    note: input.note || '',
    due_date: input.dueDate || null,
    done_at: null,
    created_at: new Date().toISOString(),
  };
  await db.collection<DbFollowUp>('follow_ups').insertOne(doc);
  return doc;
}

export async function getFollowUpsForProspect(prospectId: string): Promise<DbFollowUp[]> {
  const db = await getDb();
  return db
    .collection<DbFollowUp>('follow_ups')
    .find({ prospect_id: prospectId })
    .sort({ created_at: -1 })
    .toArray();
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
  const db = await getDb();
  const tomorrow = new Date(Date.now() + 86400000).toISOString();
  const pipeline = [
    { $match: { done_at: null, due_date: { $lte: tomorrow } } },
    {
      $lookup: {
        from: 'prospects',
        localField: 'prospect_id',
        foreignField: 'id',
        as: 'prospect',
      },
    },
    { $unwind: '$prospect' },
    { $addFields: { due_date_null: { $cond: [{ $eq: ['$due_date', null] }, 1, 0] } } },
    { $sort: { due_date_null: 1, due_date: 1, created_at: 1 } },
    { $limit: 20 },
    {
      $addFields: {
        business_name: '$prospect.business_name',
        phone: '$prospect.phone',
        rubro: '$prospect.rubro',
        ciudad: '$prospect.ciudad',
        temperature: '$prospect.temperature',
        status: '$prospect.status',
        score: '$prospect.score',
      },
    },
    { $project: { prospect: 0, due_date_null: 0 } },
  ];
  return db
    .collection<DbFollowUp>('follow_ups')
    .aggregate<FollowUpWithProspect>(pipeline)
    .toArray();
}

export async function markFollowUpDone(id: string): Promise<DbFollowUp | null> {
  const db = await getDb();
  return db.collection<DbFollowUp>('follow_ups').findOneAndUpdate(
    { id },
    { $set: { done_at: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
}

export async function updateFollowUp(id: string, updates: Record<string, unknown>): Promise<DbFollowUp | null> {
  const db = await getDb();
  if (!Object.keys(updates).length) return null;
  return db.collection<DbFollowUp>('follow_ups').findOneAndUpdate(
    { id },
    { $set: updates },
    { returnDocument: 'after' },
  );
}

export async function getPendingFollowUpCount(): Promise<number> {
  const db = await getDb();
  return db.collection<DbFollowUp>('follow_ups').countDocuments({ done_at: null });
}
