import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { getTodayWorkday, startWorkday, closeWorkday, getWorkdayStats, getSalesAlerts } from '@/lib/crm-db/workday';
import { createLog } from '@/lib/crm-db/logs';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function GET() {
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, status: 'disconnected' });
  }
  const [workday, stats, alerts] = await Promise.all([getTodayWorkday(), getWorkdayStats(), getSalesAlerts()]);
  return NextResponse.json({ ok: true, workday, stats, alerts });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  }
  try {
    const body = await request.json();
    const { action, meta } = body;

    if (action === 'start') {
      const workday = await startWorkday(meta || 10);
      await createLog('workday_started', `Jornada iniciada con meta ${meta || 10} contactos`);
      return NextResponse.json({ ok: true, workday });
    }

    if (action === 'close') {
      const workday = await closeWorkday(body.notes);
      if (!workday) return NextResponse.json({ ok: false, message: 'No hay jornada activa.' }, { status: 400 });
      await createLog('workday_closed', `Jornada cerrada`);
      return NextResponse.json({ ok: true, workday });
    }

    if (action === 'stats') {
      const stats = await getWorkdayStats();
      return NextResponse.json({ ok: true, stats });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}