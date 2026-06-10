import { NextResponse } from 'next/server';
import { searchProspects } from '@/lib/prospect-search/prospectSearch';

const ipRateLimit = new Map<string, { count: number; resetAt: number }>();

function getClientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip') || 'unknown';
}

function checkRateLimit(ip: string, maxPerMinute = 15): boolean {
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

export async function POST(request: Request) {
  const clientIp = getClientIp(request);
  if (!checkRateLimit(clientIp)) {
    return NextResponse.json({ ok: false, message: 'Demasiadas solicitudes. Espera un minuto.' }, { status: 429 });
  }

  try {
    const body = await request.json();
    const result = await searchProspects({
      rubro: String(body?.rubro || ''),
      zona: String(body?.zona || ''),
      maxResults: Math.min(Math.max(Number(body?.maxResults || 10), 1), 20),
      fuente: String(body?.fuente || ''),
    });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({
      ok: false,
      message: `Error: ${error instanceof Error ? error.message : 'No se pudo buscar prospectos.'}`,
      results: [],
    }, { status: 500 });
  }
}
