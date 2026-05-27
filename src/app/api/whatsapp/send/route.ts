import { NextResponse } from 'next/server';
import { DEFAULT_DAILY_WHATSAPP_LIMIT } from '@/lib/whatsapp/dailyLimit';

export async function POST() {
  return NextResponse.json(
    {
      ok: false,
      mode: 'prepared-only',
      provider: 'openwa',
      dailyLimit: DEFAULT_DAILY_WHATSAPP_LIMIT,
      message: 'Envío real desactivado. Esta ruta queda preparada para conectar OpenWA después.',
    },
    { status: 501 },
  );
}
