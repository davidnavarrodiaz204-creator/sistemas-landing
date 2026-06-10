import { NextResponse } from 'next/server';
import { DEFAULT_DAILY_WHATSAPP_LIMIT, todayKey } from '@/lib/whatsapp/dailyLimit';
import { checkOpenWaHealth, normalizePeruPhone, sendOpenWaMessage } from '@/lib/whatsapp/openwaClient';

type SendRequestBody = {
  phone?: string;
  message?: string;
  prospectId?: string;
  permissionContact?: string;
  sentToday?: number;
  confirmSend?: boolean;
  mediaUrl?: string;
  campaignId?: string;
};

const dailySendCounter = new Map<string, number>();
const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string, maxPerMinute = 30): boolean {
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

function currentServerCount() {
  return dailySendCounter.get(todayKey()) || 0;
}

function incrementServerCount() {
  const key = todayKey();
  dailySendCounter.set(key, (dailySendCounter.get(key) || 0) + 1);
}

function validateBody(body: unknown): body is SendRequestBody {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;
  return typeof b.phone === 'string'
    && typeof b.message === 'string'
    && typeof b.prospectId === 'string'
    && b.phone.trim().length > 0
    && b.message.trim().length > 0
    && b.prospectId.trim().length > 0;
}

export async function GET() {
  const health = await checkOpenWaHealth();
  const sentToday = currentServerCount();

  return NextResponse.json({
    ...health,
    dailyLimit: DEFAULT_DAILY_WHATSAPP_LIMIT,
    sentToday,
    remainingToday: Math.max(DEFAULT_DAILY_WHATSAPP_LIMIT - sentToday, 0),
  });
}

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ ok: false, message: 'Demasiadas solicitudes. Espera un minuto.' }, { status: 429 });
  }

  let body: SendRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Body JSON invalido.' }, { status: 400 });
  }

  if (!validateBody(body)) {
    return NextResponse.json({ ok: false, message: 'phone, message y prospectId son obligatorios y deben ser textos válidos.' }, { status: 400 });
  }

  const phone = normalizePeruPhone(body.phone || '');
  const message = (body.message || '').trim();
  const prospectId = (body.prospectId || '').trim();
  const campaignId = (body.campaignId || '').trim();
  const mediaUrl = (body.mediaUrl || '').trim();
  const sentToday = Math.max(Number(body.sentToday || 0), currentServerCount());

  if (!phone || !message || !prospectId) {
    return NextResponse.json({ ok: false, message: 'Teléfono inválido después de normalización.' }, { status: 400 });
  }

  if (!body.confirmSend) {
    return NextResponse.json({ ok: false, message: 'El envio requiere confirmacion manual desde el CRM.' }, { status: 409 });
  }

  if (body.permissionContact === 'No contactar') {
    return NextResponse.json({ ok: false, message: 'Prospecto marcado como No contactar.' }, { status: 403 });
  }

  if (sentToday >= DEFAULT_DAILY_WHATSAPP_LIMIT) {
    return NextResponse.json({ ok: false, message: 'Limite diario de WhatsApp alcanzado.' }, { status: 429 });
  }

  if (mediaUrl && !/^https?:\/\//.test(mediaUrl)) {
    return NextResponse.json({ ok: false, message: 'mediaUrl debe ser un enlace publico http/https.' }, { status: 400 });
  }

  const result = await sendOpenWaMessage({ phone, message, prospectId, mediaUrl });

  if (result.ok) incrementServerCount();

  const nextSentToday = currentServerCount();

  return NextResponse.json({
    ...result,
    dailyLimit: DEFAULT_DAILY_WHATSAPP_LIMIT,
    sentToday: nextSentToday,
    remainingToday: Math.max(DEFAULT_DAILY_WHATSAPP_LIMIT - nextSentToday, 0),
    historyEvent: {
      prospectId,
      campaignId,
      phone,
      message,
      mediaUrl,
      status: result.simulated ? 'openwa_simulated' : 'openwa_sent',
      createdAt: new Date().toISOString(),
    },
  }, { status: result.ok ? 200 : 502 });
}
