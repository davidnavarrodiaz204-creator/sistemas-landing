import { Pool } from 'pg';

let pool: Pool | null = null;

function getPool(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      idleTimeoutMillis: 30000,
    });
  }
  return pool;
}

export async function query(text: string, params?: unknown[]) {
  try {
    const client = await getPool().connect();
    try {
      const result = await client.query(text, params);
      return result;
    } finally {
      client.release();
    }
  } catch {
    return null;
  }
}

export async function isDbConnected(): Promise<boolean> {
  if (!process.env.DATABASE_URL) return false;
  try {
    const result = await query('SELECT 1 AS ok');
    return result !== null && result.rowCount === 1;
  } catch {
    return false;
  }
}

export async function runSchema(): Promise<{ ok: boolean; error?: string }> {
  const fs = await import('fs');
  const path = await import('path');
  try {
    const schemaPath = path.join(process.cwd(), 'src', 'lib', 'crm-db', 'schema.sql');
    const sql = fs.readFileSync(schemaPath, 'utf-8');
    await query(sql);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'Error ejecutando schema' };
  }
}
