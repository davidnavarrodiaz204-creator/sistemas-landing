import { getResponseMode, getDailyAutoResponseCount, incrementDailyAutoResponseCount } from '@/lib/crm-db/config';
import { createMessage, markMessageSent } from '@/lib/crm-db/messages';
import { updateThread } from '@/lib/crm-db/threads';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';
import { sendMessage } from '@/lib/crm-inbox/openwa';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';

const AUTO_INTENTS = ['PIDE_DEMO', 'PIDE_PRECIO', 'PREGUNTA_FUNCIONES'] as const;
const MAX_AUTO_REPLIES_PER_DAY = 5;
const BLOCKED_PATTERNS = /(puto|huevón|cojudo|idiota|estafa|queja|reclamo|mal servicio|error grave|problema grave|demanda|abogado)/i;

type AutoResponseResult = {
  autoReplied: boolean;
  reason?: string;
};

export async function shouldAutoReply(intent: string, body: string): Promise<{ ok: boolean; reason?: string }> {
  const mode = await getResponseMode();
  if (mode !== 'automatico_limitado') return { ok: false, reason: 'Modo no es automatico_limitado' };

  if (!AUTO_INTENTS.includes(intent as typeof AUTO_INTENTS[number])) {
    return { ok: false, reason: `Intención ${intent} no es elegible para auto-respuesta` };
  }

  if (BLOCKED_PATTERNS.test(body)) {
    return { ok: false, reason: 'Mensaje contiene patrones bloqueados' };
  }

  const dailyCount = await getDailyAutoResponseCount();
  if (dailyCount >= MAX_AUTO_REPLIES_PER_DAY) {
    return { ok: false, reason: `Límite diario alcanzado (${MAX_AUTO_REPLIES_PER_DAY})` };
  }

  return { ok: true };
}

export async function autoReply(
  threadId: string,
  body: string,
  channel: string,
  phone?: string,
  email?: string,
  prospectId?: string,
): Promise<AutoResponseResult> {
  const { intent, suggestedReply } = analyzeMessage(body);
  const check = await shouldAutoReply(intent, body);
  if (!check.ok) {
    return { autoReplied: false, reason: check.reason };
  }

  if (!suggestedReply) {
    return { autoReplied: false, reason: 'No hay respuesta sugerida disponible' };
  }

  try {
    const message = await createMessage({
      threadId,
      direction: 'OUTBOUND',
      body: suggestedReply,
      intent: 'OTRO',
    });

    if (!message) {
      return { autoReplied: false, reason: 'Error creando mensaje' };
    }

    let sent = false;
    if (channel === 'WHATSAPP' && phone) {
      const result = await sendMessage(phone, suggestedReply);
      sent = result.ok;
      if (sent) {
        await markMessageSent(message.id);
        await logChannelEvent('channel:openwa:message_sent', `Auto-respuesta WhatsApp a ${phone}`, threadId, prospectId);
      }
    }

    await updateThread(threadId, { last_message_at: new Date().toISOString() });
    await logChannelEvent('channel:inbox:reply_sent', `Auto-respuesta para ${intent}`, threadId, prospectId);
    await incrementDailyAutoResponseCount();

    return { autoReplied: true };
  } catch (err) {
    return { autoReplied: false, reason: err instanceof Error ? err.message : 'Error desconocido' };
  }
}
