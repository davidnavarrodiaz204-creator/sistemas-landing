import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { findOrCreateThread, updateThread } from '@/lib/crm-db/threads';
import { createMessage, getLastMessageForThread } from '@/lib/crm-db/messages';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';

export async function GET() {
  const { checkConnection } = await import('@/lib/crm-inbox/openwa');
  const status = await checkConnection();
  if (status.connected) {
    await logChannelEvent('channel:openwa:connection', 'OpenWA conectado', undefined, undefined);
  } else {
    await logChannelEvent('channel:openwa:connection', status.mode === 'not_configured' ? 'OpenWA no configurado' : 'OpenWA desconectado', undefined, undefined);
  }
  return NextResponse.json({ ok: true, ...status });
}

export async function POST(request: Request) {
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const body = await request.json();
    const { action, phone, message, messageId } = body;

    if (action === 'webhook' && phone && message) {
      const externalId = messageId || `wa_${phone}_${Date.now()}`;
      const thread = await findOrCreateThread({ channel: 'WHATSAPP', externalThreadId: phone, contactHandle: phone });
      if (!thread) return NextResponse.json({ ok: false, message: 'Error creando hilo.' }, { status: 500 });
      const { intent, suggestedReply } = analyzeMessage(message);
      const msg = await createMessage({ threadId: thread.id, direction: 'INBOUND', body: message, intent, suggestedReply });
      await updateThread(thread.id, { last_message_at: new Date().toISOString(), status: 'PENDING', contact_handle: phone });
      await logChannelEvent('channel:openwa:message_received', `WhatsApp de ${phone}: ${intent}`, thread.id, thread.prospect_id || undefined);
      if (intent) await logChannelEvent('channel:inbox:intent_detected', intent, thread.id, thread.prospect_id || undefined);
      if (suggestedReply) await logChannelEvent('channel:inbox:reply_suggested', suggestedReply.slice(0, 100), thread.id, thread.prospect_id || undefined);

      const { autoReply } = await import('@/lib/crm-inbox/autoResponder');
      const autoResult = await autoReply(thread.id, message, 'WHATSAPP', phone, undefined, thread.prospect_id || undefined);
      if (autoResult.autoReplied) {
        return NextResponse.json({ ok: true, threadId: thread.id, messageId: msg?.id, intent, suggestedReply, autoReplied: true });
      }

      return NextResponse.json({ ok: true, threadId: thread.id, messageId: msg?.id, intent, suggestedReply });
    }

    if (action === 'status' && body.messageId && body.status) {
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: 'Formato no válido.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}
