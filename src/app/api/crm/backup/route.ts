import { NextResponse } from 'next/server';
import { isDbConnected, getDb } from '@/lib/crm-db/db';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

const BACKUP_COLLECTIONS = ['prospects', 'contact_messages', 'follow_ups', 'workdays', 'demos', 'installations', 'automation_logs'] as const;

export async function GET() {
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'Base de datos no conectada.' });
  try {
    const db = await getDb();
    const backup: Record<string, unknown[]> = {};
    for (const coll of BACKUP_COLLECTIONS) {
      const docs = await db.collection(coll).find().sort({ created_at: -1 }).toArray();
      backup[coll] = docs;
    }
    const summary = Object.fromEntries(
      Object.entries(backup).map(([coll, docs]) => [coll, docs.length]),
    );
    return NextResponse.json({ ok: true, backup, summary, exportedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de exportación.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'Base de datos no conectada.' });
  try {
    const db = await getDb();
    const body = await request.json();
    const { backup } = body;
    if (!backup || typeof backup !== 'object') {
      return NextResponse.json({ ok: false, message: 'No se proporcionó backup válido.' }, { status: 400 });
    }
    const result: Record<string, { imported: number; updated: number; skipped: number; errors: number }> = {};

    for (const coll of BACKUP_COLLECTIONS) {
      const docs = backup[coll];
      if (!Array.isArray(docs) || docs.length === 0) {
        result[coll] = { imported: 0, updated: 0, skipped: 0, errors: 0 };
        continue;
      }
      const counts = { imported: 0, updated: 0, skipped: 0, errors: 0 };
      for (const doc of docs) {
        if (!doc.id) { counts.errors++; continue; }
        try {
          const existing = await db.collection(coll).findOne({ id: doc.id });
          if (existing) {
            counts.skipped++;
            continue;
          }
          await db.collection(coll).insertOne(doc);
          counts.imported++;
        } catch {
          counts.errors++;
        }
      }
      result[coll] = counts;
    }

    const totals = { imported: 0, updated: 0, skipped: 0, errors: 0 };
    for (const r of Object.values(result)) {
      totals.imported += r.imported;
      totals.updated += r.updated;
      totals.skipped += r.skipped;
      totals.errors += r.errors;
    }

    return NextResponse.json({ ok: true, detail: result, totals });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de importación.' }, { status: 500 });
  }
}
