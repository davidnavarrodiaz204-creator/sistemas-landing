import { getDb } from './db';
import crypto from 'crypto';

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
  const db = await getDb();
  const now = new Date().toISOString();
  const doc: DbInboxThread = {
    id: crypto.randomUUID(),
    prospect_id: input.prospectId || null,
    channel: input.channel,
    external_thread_id: input.externalThreadId || '',
    contact_name: input.contactName || '',
    contact_handle: input.contactHandle || '',
    status: 'OPEN',
    last_message_at: null,
    created_at: now,
    updated_at: now,
  };
  await db.collection('crm_inbox_threads').insertOne(doc);
  return doc;
}

export async function getThreadById(id: string): Promise<DbInboxThread | null> {
  const db = await getDb();
  const doc = await db.collection<DbInboxThread>('crm_inbox_threads').findOne({ id });
  return doc || null;
}

export async function getThreadsForProspect(prospectId: string): Promise<DbInboxThread[]> {
  const db = await getDb();
  const docs = await db.collection<DbInboxThread>('crm_inbox_threads')
    .find({ prospect_id: prospectId })
    .sort({ last_message_at: -1 })
    .toArray();
  return docs;
}

export async function getOpenThreads(): Promise<ThreadWithProspect[]> {
  const db = await getDb();
  const docs = await db.collection('crm_inbox_threads').aggregate([
    { $match: { status: { $in: ['OPEN', 'PENDING'] } } },
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
        rubro: '$prospect.rubro',
        phone: '$prospect.phone',
      },
    },
    { $project: { prospect: 0 } },
    { $sort: { last_message_at: -1 } },
    { $limit: 50 },
  ]).toArray();
  return docs as unknown as ThreadWithProspect[];
}

export async function getThreadsByChannel(channel: string): Promise<ThreadWithProspect[]> {
  const db = await getDb();
  const docs = await db.collection('crm_inbox_threads').aggregate([
    { $match: { channel, status: { $in: ['OPEN', 'PENDING'] } } },
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
        rubro: '$prospect.rubro',
        phone: '$prospect.phone',
      },
    },
    { $project: { prospect: 0 } },
    { $sort: { last_message_at: -1 } },
  ]).toArray();
  return docs as unknown as ThreadWithProspect[];
}

export async function findOrCreateThread(input: CreateThreadInput & { externalThreadId: string }): Promise<DbInboxThread> {
  const db = await getDb();
  const existing = await db.collection<DbInboxThread>('crm_inbox_threads').findOne({
    channel: input.channel,
    external_thread_id: input.externalThreadId,
  });
  if (existing) return existing;
  const created = await createThread(input);
  return created!;
}

export async function updateThread(id: string, updates: Record<string, unknown>): Promise<DbInboxThread | null> {
  const db = await getDb();
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const setFields: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  await db.collection('crm_inbox_threads').updateOne({ id }, { $set: setFields });
  const doc = await db.collection<DbInboxThread>('crm_inbox_threads').findOne({ id });
  return doc || null;
}

export async function getThreadCount(): Promise<number> {
  const db = await getDb();
  return db.collection('crm_inbox_threads').countDocuments();
}

export async function getPendingThreadCount(): Promise<number> {
  const db = await getDb();
  return db.collection('crm_inbox_threads').countDocuments({ status: { $in: ['OPEN', 'PENDING'] } });
}
