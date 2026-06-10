import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { getTodayFollowUps, markFollowUpDone, createFollowUp, updateFollowUp } from '@/lib/crm-db/followups';
import { updateProspect } from '@/lib/crm-db/prospects';
import { createLog } from '@/lib/crm-db/logs';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function GET() {
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  }
  const followUps = await getTodayFollowUps();
  return NextResponse.json({ ok: true, followUps });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  }
  try {
    const body = await request.json();
    const { action, id, prospectId, type, note, dueDate } = body;

    if (action === 'create' && prospectId && type) {
      const followUp = await createFollowUp({ prospectId, type, note, dueDate });
      if (!followUp) return NextResponse.json({ ok: false, message: 'Error creando seguimiento.' }, { status: 500 });
      await createLog('followup_created', `${type} para prospecto ${prospectId}`, prospectId);
      return NextResponse.json({ ok: true, followUp });
    }

    if (action === 'done' && id) {
      const done = await markFollowUpDone(id);
      if (!done) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, followUp: done });
    }

    if (action === 'reschedule' && id && dueDate) {
      const updated = await updateFollowUp(id, { due_date: dueDate, note: note || undefined });
      if (!updated) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, followUp: updated });
    }

    if (action === 'block' && prospectId) {
      await updateProspect(prospectId, { status: 'NO_CONTACTAR', next_follow_up_at: null });
      if (id) await markFollowUpDone(id);
      await createLog('status_updated', `Bloqueado por seguimiento`, prospectId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}