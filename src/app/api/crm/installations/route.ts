import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { createInstallation, getInstallationById, getInstallationsForProspect, getTodaysInstallations, getOverdueInstallations, updateInstallation } from '@/lib/crm-db/installations';
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
    const inst = await getInstallationById(id);
    if (!inst) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, installation: inst });
  }
  if (prospectId) {
    const installations = await getInstallationsForProspect(prospectId);
    return NextResponse.json({ ok: true, installations });
  }
  if (scope === 'today') {
    const installations = await getTodaysInstallations();
    return NextResponse.json({ ok: true, installations });
  }
  if (scope === 'overdue') {
    const installations = await getOverdueInstallations();
    return NextResponse.json({ ok: true, installations });
  }

  return NextResponse.json({ ok: true, installations: [] });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const body = await request.json();
    const { action, id } = body;

    if (action === 'create' && body.prospectId) {
      const inst = await createInstallation({
        prospectId: body.prospectId, product: body.product, scheduledAt: body.scheduledAt,
        type: body.type, needsPrinter: body.needsPrinter, needsInitialInventory: body.needsInitialInventory,
        equipmentNotes: body.equipmentNotes, notes: body.notes,
      });
      if (!inst) return NextResponse.json({ ok: false, message: 'Error creando instalación.' }, { status: 500 });
      await updateProspect(body.prospectId, { status: 'INSTALACION', last_contact_at: new Date().toISOString() });
      await createLog('installation_scheduled', `Instalación creada: ${body.product}`, body.prospectId);
      return NextResponse.json({ ok: true, installation: inst, prospectId: body.prospectId });
    }

    if (action === 'complete' && id) {
      const inst = await updateInstallation(id, { status: 'COMPLETADA' });
      if (!inst) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      await updateProspect(inst.prospect_id, { status: 'PRODUCCION', last_contact_at: new Date().toISOString(), next_follow_up_at: null });
      await createLog('installation_completed', `Instalación completada → PRODUCCION`, inst.prospect_id);
      return NextResponse.json({ ok: true, installation: inst });
    }

    if (action === 'update' && id) {
      const inst = await updateInstallation(id, body.updates || {});
      if (!inst) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      return NextResponse.json({ ok: true, installation: inst });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}
