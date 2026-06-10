import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado. Configura DATABASE_URL.' });
  }

  try {
    const { migrateLocalStorageToPostgres } = await import('@/lib/crm-db/migration');
    const summary = await migrateLocalStorageToPostgres();
    return NextResponse.json({ ok: true, summary });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error en migración.' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const { getLocalStorageSummary } = await import('@/lib/crm-db/migration');
    const summary = await getLocalStorageSummary();
    const dbOk = await isDbConnected();
    return NextResponse.json({ ok: true, dbConnected: dbOk, summary });
  } catch {
    return NextResponse.json({ ok: false, message: 'Error obteniendo resumen.' });
  }
}
