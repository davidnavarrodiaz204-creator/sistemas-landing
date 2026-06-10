import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { createProspect, findProspects, getProspectById, updateProspect, getNextProspect } from '@/lib/crm-db/prospects';
import { createFollowUp } from '@/lib/crm-db/followups';
import { createLog } from '@/lib/crm-db/logs';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function GET(request: Request) {
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  }
  const url = new URL(request.url);
  const rubro = url.searchParams.get('rubro') || undefined;
  const ciudad = url.searchParams.get('ciudad') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const id = url.searchParams.get('id') || undefined;
  const limit = Number(url.searchParams.get('limit')) || 20;

  if (id) {
    const prospect = await getProspectById(id);
    if (!prospect) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, prospect });
  }

  const prospects = await findProspects({ rubro, ciudad, status, limit });
  return NextResponse.json({ ok: true, prospects });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  }
  try {
    const body = await request.json();
    const { action, prospectId } = body;

    if (action === 'create') {
      const prospect = await createProspect({
        businessName: body.businessName,
        rubro: body.rubro || 'Otro',
        ciudad: body.ciudad || '',
        zona: body.zona,
        phone: body.phone,
        email: body.email,
        facebookUrl: body.facebookUrl,
        instagramUrl: body.instagramUrl,
        tiktokUrl: body.tiktokUrl,
        websiteUrl: body.websiteUrl,
        googleMapsUrl: body.googleMapsUrl,
        source: body.source || 'simple',
        score: body.score || 0,
        temperature: body.temperature || 'FRIO',
        notes: body.notes,
      });
      if (!prospect) return NextResponse.json({ ok: false, message: 'Error creando prospecto.' }, { status: 500 });
      await createLog('prospect_created', `"${body.businessName}" creado en PostgreSQL`, prospect.id);
      return NextResponse.json({ ok: true, prospectId: prospect.id, prospect });
    }

    if (action === 'updateStatus' && prospectId && body.status) {
      const now = new Date();
      const today = now.toISOString();
      const tomorrow = new Date(now.getTime() + 86400000).toISOString();
      const dayAfter = new Date(now.getTime() + 172800000).toISOString();

      const updates: Record<string, unknown> = { status: body.status, last_contact_at: today };
      let followUpType = 'PRIMER_CONTACTO';
      let followUpNote = 'Primer contacto realizado';
      let followUpDue: string | undefined = tomorrow;

      switch (body.status) {
        case 'CONTACTADO':
          followUpType = 'PRIMER_CONTACTO';
          followUpNote = 'Contactado por primera vez. Hacer seguimiento mañana.';
          followUpDue = tomorrow;
          updates.next_follow_up_at = tomorrow;
          break;
        case 'RESPONDIO':
          followUpType = 'RECORDATORIO';
          followUpNote = 'El cliente respondió. Dar seguimiento.';
          followUpDue = tomorrow;
          updates.next_follow_up_at = tomorrow;
          break;
        case 'INTERESADO':
          followUpType = 'DEMO';
          followUpNote = 'Cliente interesado. Agendar demo.';
          followUpDue = tomorrow;
          updates.next_follow_up_at = tomorrow;
          break;
        case 'DEMO_AGENDADA':
          followUpType = 'DEMO';
          followUpNote = 'Demo agendada. Confirmar y realizar demo.';
          followUpDue = today;
          updates.next_follow_up_at = today;
          break;
        case 'DEMO_ACTIVA':
          followUpType = 'SOPORTE';
          followUpNote = 'Demo activa. Preguntar cómo va en 2 días.';
          followUpDue = dayAfter;
          updates.next_follow_up_at = dayAfter;
          break;
        case 'INSTALACION':
          followUpType = 'SOPORTE';
          followUpNote = 'Instalación en curso. Derivar a soporte.';
          followUpDue = undefined;
          updates.next_follow_up_at = null;
          break;
        case 'PRODUCCION':
          followUpType = 'CIERRE';
          followUpNote = 'Cliente en producción. Sin seguimiento comercial.';
          followUpDue = undefined;
          updates.next_follow_up_at = null;
          break;
        case 'NO_CONTACTAR':
          followUpType = 'CIERRE';
          followUpNote = 'Cliente marcado como no contactar. Bloqueado.';
          followUpDue = undefined;
          updates.next_follow_up_at = null;
          break;
      }

      const prospect = await updateProspect(prospectId, updates);
      if (!prospect) return NextResponse.json({ ok: false, message: 'Prospecto no encontrado.' }, { status: 404 });

      await createFollowUp({ prospectId, type: followUpType, note: followUpNote, dueDate: followUpDue });
      await createLog('status_updated', `"${prospect.business_name}" → ${body.status}`, prospectId);
      return NextResponse.json({ ok: true, prospect });
    }

    if (action === 'next') {
      const prospect = await getNextProspect();
      return NextResponse.json({ ok: true, prospect });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await isDbConnected()) {
    return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  }
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ ok: false, message: 'ID requerido.' }, { status: 400 });
    const prospect = await updateProspect(id, updates);
    if (!prospect) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, prospect });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}