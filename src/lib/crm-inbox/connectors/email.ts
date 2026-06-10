import { createThread, updateThread } from '@/lib/crm-db/threads';
import { createMessage } from '@/lib/crm-db/messages';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';
import { logChannelEvent } from '@/lib/crm-inbox/channelLogs';
import { sendEmailMessage, isEmailConfigured } from '@/lib/email/emailClient';

export type EmailConnectorConfig = {
  smtp: { host: string; port: string; user: string; pass: string };
  imap: { host: string; port: string; user: string; pass: string };
  from: string;
};

export function getEmailConnectorConfig(): EmailConnectorConfig {
  return {
    smtp: {
      host: process.env.SMTP_HOST || '',
      port: process.env.SMTP_PORT || '',
      user: process.env.SMTP_USER || '',
      pass: process.env.SMTP_PASS || '',
    },
    imap: {
      host: process.env.IMAP_HOST || '',
      port: process.env.IMAP_PORT || '993',
      user: process.env.IMAP_USER || '',
      pass: process.env.IMAP_PASS || '',
    },
    from: process.env.EMAIL_FROM || '',
  };
}

export function isImapConfigured(): boolean {
  const cfg = getEmailConnectorConfig();
  return Boolean(cfg.imap.host && cfg.imap.port && cfg.imap.user && cfg.imap.pass);
}

export function isSmtpConfigured(): boolean {
  return isEmailConfigured();
}

export async function testSmtp(): Promise<{ ok: boolean; message: string }> {
  const cfg = getEmailConnectorConfig();
  if (!isSmtpConfigured()) {
    await logChannelEvent('channel:email:connection', 'SMTP no configurado', undefined, undefined);
    return { ok: false, message: 'SMTP no configurado. Define SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS.' };
  }
  try {
    const result = await sendEmailMessage({
      to: cfg.from || cfg.smtp.user,
      subject: '[FACTUSYS] Prueba de conexión SMTP',
      message: 'Este es un mensaje de prueba para verificar la conexión SMTP.\n\nSi recibes esto, SMTP funciona correctamente.',
      prospectId: 'test',
    });
    if (result.ok) {
      await logChannelEvent('channel:email:connection', `SMTP conectado. Envío de prueba a ${cfg.from || cfg.smtp.user}`, undefined, undefined);
      return { ok: true, message: result.simulated ? 'SMTP configurado (simulado)' : 'SMTP conectado. Correo de prueba enviado.' };
    }
    return { ok: false, message: result.message || 'Error al enviar correo de prueba' };
  } catch (err) {
    await logChannelEvent('channel:email:error', `SMTP test error: ${err instanceof Error ? err.message : 'desconocido'}`, undefined, undefined);
    return { ok: false, message: `Error SMTP: ${err instanceof Error ? err.message : 'desconocido'}` };
  }
}

export async function testImap(): Promise<{ ok: boolean; message: string; inboxCount?: number }> {
  const cfg = getEmailConnectorConfig();
  if (!isImapConfigured()) {
    await logChannelEvent('channel:imap:connection', 'IMAP no configurado', undefined, undefined);
    return { ok: false, message: 'IMAP no configurado. Define IMAP_HOST, IMAP_PORT, IMAP_USER, IMAP_PASS.' };
  }
  try {
    const net = await import('net');
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        socket.destroy();
        resolve({ ok: false, message: 'Timeout conectando a IMAP' });
      }, 10000);
      const socket = net.createConnection(Number(cfg.imap.port), cfg.imap.host, () => {
        clearTimeout(timeout);
        socket.write(`A1 LOGIN ${cfg.imap.user} ${cfg.imap.pass}\r\n`);
      });
      let buf = '';
      socket.on('data', (data: Buffer) => {
        buf += data.toString();
        if (buf.includes('A1 OK') || buf.includes('A1 NO') || buf.includes('A1 BAD')) {
          clearTimeout(timeout);
          socket.end();
          if (buf.includes('A1 OK')) {
            resolve({ ok: true, message: 'IMAP conectado y autenticado' });
          } else {
            resolve({ ok: false, message: `IMAP auth falló: ${buf.slice(0, 200)}` });
          }
        }
      });
      socket.on('error', (err: Error) => {
        clearTimeout(timeout);
        resolve({ ok: false, message: `Error IMAP: ${err.message}` });
      });
    });
  } catch (err) {
    await logChannelEvent('channel:imap:error', `IMAP test error: ${err instanceof Error ? err.message : 'desconocido'}`, undefined, undefined);
    return { ok: false, message: `Error IMAP: ${err instanceof Error ? err.message : 'desconocido'}` };
  }
}

export async function receiveEmailInbound(
  fromEmail: string,
  fromName: string,
  subject: string,
  body: string,
) {
  const externalThreadId = `email:${fromEmail}`;
  const thread = await createThread({
    channel: 'EMAIL',
    externalThreadId,
    contactName: fromName || fromEmail,
    contactHandle: fromEmail,
  });
  if (!thread) {
    await logChannelEvent('channel:email:error', `No se pudo crear hilo para ${fromEmail}`, undefined, undefined);
    return null;
  }
  const analysis = analyzeMessage(body);
  const message = await createMessage({
    threadId: thread.id,
    direction: 'INBOUND',
    body: `${subject ? `[${subject}] ` : ''}${body}`,
    intent: analysis.intent,
    suggestedReply: analysis.suggestedReply,
  });
  await updateThread(thread.id, {
    last_message_at: new Date().toISOString(),
    status: 'PENDING',
  });
  await logChannelEvent('channel:email:message_received', `Email de ${fromEmail}: ${analysis.intent}`, thread.id, undefined);
  await logChannelEvent('channel:inbox:intent_detected', `${analysis.intent} (confianza: ${analysis.confidence})`, thread.id, undefined);
  if (analysis.suggestedReply) {
    await logChannelEvent('channel:inbox:reply_suggested', analysis.suggestedReply.slice(0, 100), thread.id, undefined);
  }
  return { thread, message, analysis };
}
