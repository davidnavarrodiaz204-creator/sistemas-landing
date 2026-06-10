import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { createMessage, getMessagesForThread, approveMessage, markMessageSent, getMessageById, getUnapprovedMessages } from '@/lib/crm-db/messages';
import { updateThread } from '@/lib/crm-db/threads';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function GET(request: Request) {
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  const url = new URL(request.url);
  const threadId = url.searchParams.get('threadId');
  const id = url.searchParams.get('id');
  const pending = url.searchParams.get('pending');

  if (id) {
    const msg = await getMessageById(id);
    if (!msg) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
    return NextResponse.json({ ok: true, message: msg });
  }

  if (threadId && pending === 'true') {
    const msgs = await getUnapprovedMessages(threadId);
    return NextResponse.json({ ok: true, messages: msgs });
  }

  if (threadId) {
    const msgs = await getMessagesForThread(threadId);
    return NextResponse.json({ ok: true, messages: msgs });
  }

  return NextResponse.json({ ok: true, messages: [] });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const body = await request.json();
    const { action, id, threadId } = body;

    if (action === 'send' && threadId && body.body) {
      const message = await createMessage({ threadId, direction: 'OUTBOUND', body: body.body, intent: body.intent || 'OTRO' });
      await updateThread(threadId, { last_message_at: new Date().toISOString() });
      await logChannelEvent('channel:inbox:reply_sent', `Outbound: ${body.body.slice(0, 80)}`, threadId, body.prospectId);

      if (body.channel === 'WHATSAPP' && body.phone) {
        const { sendMessage } = await import('@/lib/crm-inbox/openwa');
        const result = await sendMessage(body.phone, body.body);
        if (result.ok && message) {
          await markMessageSent(message.id);
          await logChannelEvent('channel:openwa:message_sent', `WhatsApp enviado a ${body.phone}`, threadId, body.prospectId);
        }
      }

      if (body.channel === 'EMAIL' && body.email) {
        const { sendEmailMessage } = await import('@/lib/email/emailClient');
        const result = await sendEmailMessage({ to: body.email, subject: body.emailSubject || 'Factusys CRM', message: body.body, prospectId: body.prospectId || 'inbox' });
        if (result.ok && message) {
          await markMessageSent(message.id);
          await logChannelEvent('channel:email:message_sent', `Email enviado a ${body.email}`, threadId, body.prospectId);
        }
      }

      return NextResponse.json({ ok: true, message });
    }

    if (action === 'approve' && id) {
      const msg = await approveMessage(id);
      await logChannelEvent('channel:inbox:reply_approved', `Mensaje ${id} aprobado`, threadId || undefined, body.prospectId);
      return NextResponse.json({ ok: true, message: msg });
    }

    if (action === 'regenerate' && id) {
      const msg = await getMessageById(id);
      if (!msg) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
      const { intent, suggestedReply } = analyzeMessage(msg.body, body.rubro);
      const updated = await createMessage({ threadId: msg.thread_id, direction: 'INBOUND', body: msg.body, intent, suggestedReply });
      await logChannelEvent('channel:inbox:reply_suggested', `Regenerado: ${intent}`, msg.thread_id, body.prospectId);
      return NextResponse.json({ ok: true, message: updated, intent, suggestedReply });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}
