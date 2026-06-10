import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';

export async function GET(request: Request) {
  const { verifyWebhook } = await import('@/lib/crm-inbox/meta');
  const url = new URL(request.url);
  const mode = url.searchParams.get('hub.mode');
  const token = url.searchParams.get('hub.verify_token');
  const challenge = url.searchParams.get('hub.challenge');
  const result = verifyWebhook(mode, token, challenge);
  if (result.verified) {
    return new NextResponse(result.challenge, { status: 200 });
  }
  return NextResponse.json({ error: 'Verification failed' }, { status: 403 });
}

export async function POST(request: Request) {
  const { parseWebhookEntry, validateWebhookSignature } = await import('@/lib/crm-inbox/meta');
  const { findOrCreateThread, updateThread } = await import('@/lib/crm-db/threads');
  const { createMessage } = await import('@/lib/crm-db/messages');
  const { analyzeMessage } = await import('@/lib/crm-inbox/replyAssistant');

  const rawBody = await request.text();
  const signature = request.headers.get('x-hub-signature-256');
  const valid = validateWebhookSignature(signature, rawBody);
  if (!valid && signature) {
    await logChannelEvent('channel:meta:error', 'Firma de webhook Meta inválida');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 403 });
  }

  let body: unknown;
  try { body = JSON.parse(rawBody); } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const entries = parseWebhookEntry(body);
  if (entries.length === 0) return NextResponse.json({ ok: true });

  const pgOk = await isDbConnected();
  const results = [];
  for (const entry of entries) {
    if (!pgOk) { results.push({ ok: false, message: 'PostgreSQL no conectado' }); continue; }
    try {
      const channel = entry.channel || 'FACEBOOK';
      const externalId = `${channel}_${entry.senderId}`;
      const thread = await findOrCreateThread({ channel, externalThreadId: externalId, contactHandle: entry.senderId, contactName: entry.senderName });
      const { intent, suggestedReply } = analyzeMessage(entry.message);
      await createMessage({ threadId: thread.id, direction: 'INBOUND', body: entry.message, intent, suggestedReply });
      await updateThread(thread.id, { last_message_at: new Date().toISOString(), status: 'PENDING' });
      await logChannelEvent('channel:meta:webhook_received', `${channel} de ${entry.senderId}: ${intent}`, thread.id);
      if (intent) await logChannelEvent('channel:inbox:intent_detected', intent, thread.id);
      if (suggestedReply) await logChannelEvent('channel:inbox:reply_suggested', suggestedReply.slice(0, 100), thread.id);

      const { autoReply } = await import('@/lib/crm-inbox/autoResponder');
      await autoReply(thread.id, entry.message, channel, undefined, undefined, undefined);

      results.push({ ok: true, threadId: thread.id, intent });
    } catch (err) {
      await logChannelEvent('channel:meta:error', `Error procesando entrada: ${err instanceof Error ? err.message : 'desconocido'}`);
      results.push({ ok: false, message: err instanceof Error ? err.message : 'Error' });
    }
  }
  return NextResponse.json({ ok: true, results }, { status: 200 });
}
