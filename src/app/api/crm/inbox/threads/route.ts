import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { getOpenThreads, getThreadById, updateThread, getPendingThreadCount, getThreadCount, getThreadsByChannel } from '@/lib/crm-db/threads';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';
import { createMessage, getMessagesForThread, getLastMessageForThread } from '@/lib/crm-db/messages';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function GET(request: Request) {
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const scope = url.searchParams.get('scope');
  const channel = url.searchParams.get('channel');

  if (id) {
    const thread = await getThreadById(id);
    if (!thread) return NextResponse.json({ ok: false, message: 'No encontrado.' }, { status: 404 });
    const messages = await getMessagesForThread(id);
    return NextResponse.json({ ok: true, thread, messages });
  }

  if (scope === 'stats') {
    const [total, pending] = await Promise.all([getThreadCount(), getPendingThreadCount()]);
    return NextResponse.json({ ok: true, total, pending });
  }

  const threads = channel && channel !== 'TODAS' ? await getThreadsByChannel(channel) : await getOpenThreads();
  const threadsWithLast = await Promise.all(
    threads.map(async (t) => {
      const last = await getLastMessageForThread(t.id);
      return { ...t, lastMessage: last?.body || '', lastIntent: last?.intent || '', lastSuggestedReply: last?.suggested_reply || '' };
    }),
  );
  return NextResponse.json({ ok: true, threads: threadsWithLast });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  if (!await isDbConnected()) return NextResponse.json({ ok: false, message: 'PostgreSQL no conectado.' });
  try {
    const body = await request.json();
    const { action, threadId, prospectId } = body;

    if (action === 'create' && body.channel) {
      const { createThread, findOrCreateThread } = await import('@/lib/crm-db/threads');
      const thread = body.externalThreadId
        ? await findOrCreateThread({ channel: body.channel, externalThreadId: body.externalThreadId, prospectId, contactName: body.contactName, contactHandle: body.contactHandle })
        : await createThread({ channel: body.channel, prospectId, contactName: body.contactName, contactHandle: body.contactHandle });
      return NextResponse.json({ ok: true, thread });
    }

    if (action === 'close' && threadId) {
      const thread = await updateThread(threadId, { status: 'CLOSED' });
      return NextResponse.json({ ok: true, thread });
    }

    if (action === 'reopen' && threadId) {
      const thread = await updateThread(threadId, { status: 'OPEN' });
      return NextResponse.json({ ok: true, thread });
    }

    if (action === 'link_prospect' && threadId && prospectId) {
      const thread = await updateThread(threadId, { prospect_id: prospectId });
      return NextResponse.json({ ok: true, thread });
    }

    if (action === 'receive_inbound') {
      const { threadId: tid, body: msgBody, contactName, contactHandle, channel } = body;
      if (!tid || !msgBody) return NextResponse.json({ ok: false, message: 'threadId y body requeridos.' }, { status: 400 });
      const { intent, suggestedReply } = analyzeMessage(msgBody, body.rubro);
      const message = await createMessage({ threadId: tid, direction: 'INBOUND', body: msgBody, intent, suggestedReply });
      await updateThread(tid, { last_message_at: new Date().toISOString(), status: 'PENDING', contact_name: contactName || '', contact_handle: contactHandle || '' });
      await logChannelEvent('channel:inbox:message_analyzed', `${channel || '?'}: ${intent}`, tid, body.prospectId);
      if (intent) await logChannelEvent('channel:inbox:intent_detected', intent, tid, body.prospectId);
      if (suggestedReply) await logChannelEvent('channel:inbox:reply_suggested', suggestedReply.slice(0, 100), tid, body.prospectId);
      return NextResponse.json({ ok: true, message, intent, suggestedReply });
    }

    if (action === 'mark_replied' && threadId) {
      await updateThread(threadId, { status: 'OPEN' });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error de servidor.' }, { status: 500 });
  }
}
