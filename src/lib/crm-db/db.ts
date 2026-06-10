import { MongoClient, Db } from 'mongodb';

let client: MongoClient | null = null;
let db: Db | null = null;

function getConnectionUri(): string {
  return process.env.DATABASE_URL || 'mongodb://localhost:27017/factusys_crm';
}

export async function getDb(): Promise<Db> {
  if (db) return db;
  const uri = getConnectionUri();
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  return db;
}

export async function isDbConnected(): Promise<boolean> {
  try {
    const instance = await getDb();
    await instance.command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}

export async function runSchema(): Promise<{ ok: boolean; error?: string }> {
  return { ok: true };
}
