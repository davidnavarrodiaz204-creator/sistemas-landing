import { getDb } from './db';
import { randomUUID } from 'crypto';

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
  const db = await getDb();
  const now = new Date().toISOString();
  const doc = {
    id: randomUUID(),
    business_name: input.businessName,
    rubro: input.rubro,
    ciudad: input.ciudad,
    zona: input.zona || '',
    phone: input.phone || '',
    email: input.email || '',
    facebook_url: input.facebookUrl || '',
    instagram_url: input.instagramUrl || '',
    tiktok_url: input.tiktokUrl || '',
    website_url: input.websiteUrl || '',
    google_maps_url: input.googleMapsUrl || '',
    source: input.source || 'simple',
    score: input.score || 0,
    temperature: input.temperature || 'FRIO',
    status: 'NUEVO',
    last_contact_at: null,
    next_follow_up_at: null,
    notes: input.notes || '',
    created_at: now,
    updated_at: now,
  };
  await db.collection('prospects').insertOne(doc);
  return doc as unknown as DbProspect;
}

export async function findProspectByPhone(phone: string): Promise<DbProspect | null> {
  const clean = phone.replace(/\D/g, '');
  if (!clean) return null;
  const db = await getDb();
  const doc = await db.collection('prospects').findOne({ phone: clean });
  return doc as unknown as DbProspect | null;
}

export async function findProspects(params: {
  rubro?: string;
  ciudad?: string;
  status?: string;
  limit?: number;
  offset?: number;
}): Promise<DbProspect[]> {
  const filter: Record<string, unknown> = {};
  if (params.rubro) filter.rubro = params.rubro;
  if (params.ciudad) filter.ciudad = { $regex: params.ciudad, $options: 'i' };
  if (params.status) filter.status = params.status;
  const limit = Math.min(Math.max(params.limit || 20, 1), 100);
  const offset = Math.max(params.offset || 0, 0);
  const db = await getDb();
  const docs = await db.collection('prospects')
    .find(filter)
    .sort({ created_at: -1 })
    .skip(offset)
    .limit(limit)
    .toArray();
  return docs as unknown as DbProspect[];
}

export async function getProspectById(id: string): Promise<DbProspect | null> {
  const db = await getDb();
  const doc = await db.collection('prospects').findOne({ id });
  return doc as unknown as DbProspect | null;
}

export async function updateProspect(id: string, updates: Record<string, unknown>): Promise<DbProspect | null> {
  const keys = Object.keys(updates);
  if (!keys.length) return null;
  const db = await getDb();
  const setFields: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  await db.collection('prospects').updateOne({ id }, { $set: setFields });
  const doc = await db.collection('prospects').findOne({ id });
  return doc as unknown as DbProspect | null;
}

export async function getProspectsNeedingFollowUp(): Promise<DbProspect[]> {
  const db = await getDb();
  const now = new Date().toISOString();
  const docs = await db.collection('prospects')
    .find({
      next_follow_up_at: { $ne: null, $lte: now },
      status: { $ne: 'NO_CONTACTAR' },
    })
    .sort({ next_follow_up_at: 1 })
    .limit(20)
    .toArray();
  return docs as unknown as DbProspect[];
}

export async function getNextProspect(): Promise<DbProspect | null> {
  const db = await getDb();
  const now = new Date().toISOString();
  const todayStart = new Date().toISOString().slice(0, 10) + 'T00:00:00.000Z';

  const pipeline = [
    {
      $match: {
        status: { $nin: ['NO_CONTACTAR', 'PRODUCCION', 'INSTALACION'] },
        $or: [
          { last_contact_at: null },
          { last_contact_at: { $lt: todayStart } },
        ],
      },
    },
    {
      $addFields: {
        sort_followup: {
          $cond: {
            if: {
              $and: [
                { $ne: ['$next_follow_up_at', null] },
                { $lte: ['$next_follow_up_at', now] },
              ],
            },
            then: 0,
            else: 1,
          },
        },
        sort_temperature: {
          $switch: {
            branches: [
              { case: { $eq: ['$temperature', 'CALIENTE'] }, then: 0 },
              { case: { $eq: ['$temperature', 'TIBIO'] }, then: 1 },
              { case: { $eq: ['$temperature', 'FRIO'] }, then: 2 },
            ],
            default: 3,
          },
        },
      },
    },
    { $sort: { sort_followup: 1, sort_temperature: 1, score: -1 } },
    { $limit: 1 },
  ];

  const results = await db.collection('prospects').aggregate(pipeline).toArray();
  return (results[0] as unknown as DbProspect) || null;
}

export async function getProspectCount(): Promise<number> {
  const db = await getDb();
  return await db.collection('prospects').countDocuments({});
}
