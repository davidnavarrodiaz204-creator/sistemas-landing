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
};

const dailySendCounter = new Map<string, number>();

function currentServerCount() {
  return dailySendCounter.get(todayKey()) || 0;
}

function incrementServerCount() {
  const key = todayKey();
  dailySendCounter.set(key, (dailySendCounter.get(key) || 0) + 1);
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
  let body: SendRequestBody;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'Body JSON invalido.' }, { status: 400 });
  }

  const phone = normalizePeruPhone(body.phone || '');
  const message = (body.message || '').trim();
  const prospectId = (body.prospectId || '').trim();
  const mediaUrl = (body.mediaUrl || '').trim();
  const sentToday = Math.max(Number(body.sentToday || 0), currentServerCount());

  if (!phone || !message || !prospectId) {
    return NextResponse.json({ ok: false, message: 'phone, message y prospectId son obligatorios.' }, { status: 400 });
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
      phone,
      message,
      mediaUrl,
      status: result.simulated ? 'openwa_simulated' : 'openwa_sent',
      createdAt: new Date().toISOString(),
    },
  }, { status: result.ok ? 200 : 502 });
}
