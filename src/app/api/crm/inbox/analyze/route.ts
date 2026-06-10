import { NextResponse } from 'next/server';
import { analyzeMessage } from '@/lib/crm-inbox/replyAssistant';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  try {
    const body = await request.json();
    const { text, rubro } = body;
    if (!text || typeof text !== 'string') {
      return NextResponse.json({ ok: false, message: 'Texto requerido.' }, { status: 400 });
    }
    const result = analyzeMessage(text, rubro);
    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
