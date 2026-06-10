import { NextResponse } from 'next/server';
import { isSmtpConfigured, isImapConfigured, testSmtp, testImap, receiveEmailInbound } from '@/lib/crm-inbox/connectors/email';

export async function GET() {
  const smtpOk = isSmtpConfigured();
  const imapOk = isImapConfigured();
  return NextResponse.json({
    ok: smtpOk || imapOk,
    smtp: { configured: smtpOk, status: smtpOk ? 'configured' : 'not_configured' },
    imap: { configured: imapOk, status: imapOk ? 'configured' : 'not_configured' },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'test') {
      const smtpResult = await testSmtp();
      const imapResult = await testImap();
      return NextResponse.json({ ok: true, smtp: smtpResult, imap: imapResult });
    }

    if (action === 'receive') {
      const { fromEmail, fromName, subject, body: emailBody } = body;
      if (!fromEmail || !emailBody) {
        return NextResponse.json({ ok: false, message: 'fromEmail y body son requeridos.' }, { status: 400 });
      }
      const result = await receiveEmailInbound(fromEmail, fromName || fromEmail, subject || '', emailBody);
      if (!result) {
        return NextResponse.json({ ok: false, message: 'Error al procesar correo entrante.' }, { status: 500 });
      }
      return NextResponse.json({
        ok: true,
        thread: result.thread,
        inboxMessage: result.message,
        analysis: result.analysis,
        text: 'Correo recibido y procesado en inbox.',
      });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
