import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { createDemo, getDemoById, getDemosForProspect, getTodaysDemos, getOverdueDemos, updateDemo } from '@/lib/crm-db/demos';
import { updateProspect } from '@/lib/crm-db/prospects';
import { createLog } from '@/lib/crm-db/logs';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function GET(request: Request) {
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const prospectId = url.searchParams.get('prospectId');
  const scope = url.searchParams.get('scope');

  if (id) {
    const demo = await getDemoById(id);
    if (!demo) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, demo });
  }
  if (prospectId) {
    const demos = await getDemosForProspect(prospectId);
    return NextResponse.json({ ok: true, demos });
  }
  if (scope === 'today') {
    const demos = await getTodaysDemos();
    return NextResponse.json({ ok: true, demos });
  }
  if (scope === 'overdue') {
    const demos = await getOverdueDemos();
    return NextResponse.json({ ok: true, demos });
  }

  return NextResponse.json({ ok: true, demos: [] });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const body = await request.json();
    const { action, id } = body;

    if (action === 'create' && body.prospectId && body.scheduledAt) {
      const demo = await createDemo({ prospectId: body.prospectId, product: body.product, scheduledAt: body.scheduledAt, notes: body.notes });
      if (!demo) return NextResponse.json({ ok: false, message: 'Error creando demo.' }, { status: 500 });
      await updateProspect(body.prospectId, { status: 'DEMO_AGENDADA', last_contact_at: new Date().toISOString(), next_follow_up_at: body.scheduledAt });
      await createLog('demo_scheduled', `Demo agendada: ${body.product}`, body.prospectId);
      return NextResponse.json({ ok: true, demo, prospectId: body.prospectId });
    }

    if (action === 'complete' && id) {
      const demo = await updateDemo(id, { status: 'REALIZADA' });
      if (!demo) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      if (body.nextStatus) await updateProspect(demo.prospect_id, { status: body.nextStatus, last_contact_at: new Date().toISOString() });
      await createLog('demo_completed', `Demo realizada`, demo.prospect_id);
      return NextResponse.json({ ok: true, demo });
    }

    if (action === 'cancel' && id) {
      const demo = await updateDemo(id, { status: 'CANCELADA' });
      if (!demo) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, demo });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}
