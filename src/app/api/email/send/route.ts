import { NextResponse } from 'next/server';
import { isEmailConfigured, sendEmailMessage } from '@/lib/email/emailClient';

type SendEmailBody = {
  to?: string;
  subject?: string;
  message?: string;
  prospectId?: string;
  campaignId?: string;
  permissionContact?: string;
  confirmSend?: boolean;
  mediaUrl?: string;
};

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string, maxPerMinute = 20): boolean {
  const now = Date.now();
  const entry = ipRateLimit.get(ip);
  if (!entry || now > entry.resetAt) {
    ipRateLimit.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= maxPerMinute) return false;
  entry.count++;
  return true;
}

function validEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function GET() {
  const configured = isEmailConfigured();

  return NextResponse.json({
    ok: configured,
    status: configured ? 'configured' : 'simulation',
    mode: configured ? 'configured' : 'simulation',
    message: configured
      ? 'Email configurado para envio desde servidor.'
      : 'Email no configurado. El CRM esta en modo simulacion.',
  });
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ ok: false, message: 'Demasiadas solicitudes. Espera un minuto.' }, { status: 429 });
  }

  let body: SendEmailBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Body JSON invalido.' }, { status: 400 });
  }

  const to = (body.to || '').trim();
  const subject = (body.subject || '').trim();
  const message = (body.message || '').trim();
  const prospectId = (body.prospectId || '').trim();
  const mediaUrl = (body.mediaUrl || '').trim();

  if (!to || !validEmail(to) || !subject || !message || !prospectId) {
    return NextResponse.json({ ok: false, message: 'to, subject, message y prospectId validos son obligatorios.' }, { status: 400 });
  }

  if (!body.confirmSend) {
    return NextResponse.json({ ok: false, message: 'El envio requiere confirmacion manual desde el CRM.' }, { status: 409 });
  }

  if (body.permissionContact === 'No contactar') {
    return NextResponse.json({ ok: false, message: 'Prospecto marcado como No contactar.' }, { status: 403 });
  }

  if (mediaUrl && !/^https?:\/\//.test(mediaUrl)) {
    return NextResponse.json({ ok: false, message: 'mediaUrl debe ser un enlace publico http/https.' }, { status: 400 });
  }

  const result = await sendEmailMessage({
    to,
    subject,
    message,
    prospectId,
    campaignId: body.campaignId || '',
    mediaUrl,
  });

  return NextResponse.json({
    ...result,
    historyEvent: {
      prospectId,
      campaignId: body.campaignId || '',
      to,
      subject,
      message,
      mediaUrl,
      status: result.simulated ? 'email_simulated' : result.ok ? 'email_sent' : 'email_error',
      createdAt: new Date().toISOString(),
    },
  }, { status: result.ok ? 200 : 502 });
}
