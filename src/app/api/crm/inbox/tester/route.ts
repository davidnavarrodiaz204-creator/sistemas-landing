import { NextResponse } from 'next/server';
import { createThread, updateThread, getThreadById } from '@/lib/crm-db/threads';
import { createMessage } from '@/lib/crm-db/messages';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';
import { receiveEmailInbound } from '@/lib/crm-inbox/connectors/email';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

const SAMPLE_MESSAGES: Record<string, string[]> = {
  WHATSAPP: [
    'Hola, me interesa su sistema para mi restaurante. ¿Podría darme una demo?',
    'Buenos días, quisiera saber cuánto cuesta el sistema POS.',
    'Estoy muy ocupado, llámeme más tarde por favor.',
    'No me interesa, gracias.',
    'Quiero agendar una llamada para que me expliquen cómo funciona.',
    'Tengo un problema con el sistema, no puedo facturar.',
    '¿El sistema sirve para ferretería? Necesito saber las funciones.',
    'Hola, me gustaría comprar el sistema para mi negocio. ¿Cuáles son los planes?',
  ],
  FACEBOOK: [
    'Hola! Me podrían dar más información?',
    'Quiero una demo del sistema para restaurante',
    'Precio del sistema POS',
    'Buen día, ¿atienden en Lima?',
    'Quiero que me llamen para contratar el servicio',
  ],
  INSTAGRAM: [
    'Hola, hermoso perfil! Me interesa el sistema',
    'Cuánto cuesta?',
    'Necesito ayuda con mi facturación',
    'Pueden venir a instalar el sistema?',
    'No gracias, ya tengo sistema',
  ],
  EMAIL: [
    'Estimado, me gustaría recibir una cotización del sistema POS para restaurante.',
    'Tengo un restaurante en Miraflores y quiero una demo presencial.',
    'Gracias por la atención, pero no me interesa por ahora.',
    'Por favor llamarme al 999888777 para coordinar la instalación.',
    'El sistema tiene error al emitir boletas electrónicas.',
  ],
};

const SENDER_NAMES: Record<string, string[]> = {
  WHATSAPP: ['Carlos López', 'María García', 'Pedro Suárez', 'Lucía Fernández'],
  FACEBOOK: ['Ana Torres', 'Jorge Ramírez', 'Diana Castillo'],
  INSTAGRAM: ['@ferreteria_abc', '@restobar_luz', '@tienda_online_pe'],
  EMAIL: ['contacto@restaurante-elmar.com', 'info@ferreteriaabc.pe', 'ventas@latiendaperu.com'],
};

export async function GET() {
  return NextResponse.json({
    ok: true,
    channels: Object.entries(SAMPLE_MESSAGES).map(([ch, msgs]) => ({
      channel: ch,
      sampleCount: msgs.length,
      senders: SENDER_NAMES[ch] || [],
    })),
  });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  try {
    const body = await request.json();
    const { channel, text, sender, senderName } = body;
    const validChannels = ['WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'EMAIL'];
    if (!validChannels.includes(channel)) {
      return NextResponse.json({ ok: false, message: `Canal inválido. Usa: ${validChannels.join(', ')}.` }, { status: 400 });
    }

    const messageText = text || (SAMPLE_MESSAGES[channel] ? SAMPLE_MESSAGES[channel][Math.floor(Math.random() * SAMPLE_MESSAGES[channel].length)] : 'Hola, me interesa el sistema.');
    const contactHandle = sender || (SENDER_NAMES[channel] ? SENDER_NAMES[channel][Math.floor(Math.random() * SENDER_NAMES[channel].length)] : 'contacto@example.com');
    const contactName = senderName || contactHandle;

    let result;
    if (channel === 'EMAIL') {
      result = await receiveEmailInbound(
        contactHandle,
        contactName,
        'Consulta desde web',
        messageText,
      );
    } else {
      const externalThreadId = `${channel.toLowerCase()}:${contactHandle}`;
      const thread = await createThread({
        channel,
        externalThreadId,
        contactName,
        contactHandle,
      });
      if (!thread) {
        return NextResponse.json({ ok: false, message: 'Error al crear hilo de prueba.' }, { status: 500 });
      }
      const analysis = analyzeMessage(messageText);
      const msg = await createMessage({
        threadId: thread.id,
        direction: 'INBOUND',
        body: messageText,
        intent: analysis.intent,
        suggestedReply: analysis.suggestedReply,
      });
      await updateThread(thread.id, {
        last_message_at: new Date().toISOString(),
        status: 'PENDING',
      });
      await logChannelEvent('channel:inbox:thread_created', `Test thread ${channel}: ${contactHandle}`, thread.id, undefined);
      await logChannelEvent('channel:inbox:message_analyzed', `Test message: ${messageText.slice(0, 80)}`, thread.id, undefined);
      await logChannelEvent('channel:inbox:intent_detected', `${analysis.intent} (${analysis.confidence})`, thread.id, undefined);
      if (analysis.suggestedReply) {
        await logChannelEvent('channel:inbox:reply_suggested', analysis.suggestedReply.slice(0, 100), thread.id, undefined);
      }
      result = { thread, message: msg, analysis };
    }

    return NextResponse.json({
      ok: true,
      channel,
      text: messageText,
      intent: result?.analysis?.intent || 'OTRO',
      confidence: result?.analysis?.confidence || 'baja',
      suggestedReply: result?.analysis?.suggestedReply || '',
      threadId: result?.thread?.id || '',
      createdAt: result?.thread?.created_at || new Date().toISOString(),
      message: `Mensaje de prueba enviado a inbox (${channel}). Ve a /crm/inbox para verlo.`,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
