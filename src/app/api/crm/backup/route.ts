import { NextResponse } from 'next/server';
import { isDbConnected, query } from '@/lib/crm-db/db';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

const BACKUP_TABLES = ['prospects', 'contact_messages', 'follow_ups', 'workdays', 'demos', 'installations', 'automation_logs'] as const;

export async function GET() {
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const backup: Record<string, unknown[]> = {};
    for (const table of BACKUP_TABLES) {
      const result = await query(`SELECT * FROM ${table} ORDER BY created_at`, []);
      backup[table] = result?.rows || [];
    }
    const summary = Object.fromEntries(
      Object.entries(backup).map(([table, rows]) => [table, (rows as unknown[]).length]),
    );
    return NextResponse.json({ ok: true, backup, summary, exportedAt: new Date().toISOString() });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de exportación.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const body = await request.json();
    const { backup } = body;
    if (!backup || typeof backup !== 'object') {
      return NextResponse.json({ ok: false, message: 'No se proporcionó backup válido.' }, { status: 400 });
    }
    const result: Record<string, { imported: number; updated: number; skipped: number; errors: number }> = {};

    for (const table of BACKUP_TABLES) {
      const rows = backup[table];
      if (!Array.isArray(rows) || rows.length === 0) {
        result[table] = { imported: 0, updated: 0, skipped: 0, errors: 0 };
        continue;
      }
      const counts = { imported: 0, updated: 0, skipped: 0, errors: 0 };
      for (const row of rows) {
        if (!row.id) { counts.errors++; continue; }
        try {
          const existing = await query(`SELECT id FROM ${table} WHERE id = $1`, [row.id]);
          if (existing?.rows?.length && existing.rows.length > 0) {
            counts.skipped++;
            continue;
          }
          const keys = Object.keys(row).filter((k) => k !== 'id');
          const cols = ['id', ...keys];
          const vals = cols.map((k) => (row as Record<string, unknown>)[k] ?? null);
          const placeholders = cols.map((_, i) => `$${i + 1}`).join(', ');
          const colNames = cols.map((c) => `"${c}"`).join(', ');
          await query(`INSERT INTO ${table} (${colNames}) VALUES (${placeholders}) ON CONFLICT (id) DO NOTHING`, vals);
          counts.imported++;
        } catch {
          counts.errors++;
        }
      }
      result[table] = counts;
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
