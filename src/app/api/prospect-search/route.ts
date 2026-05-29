import { NextResponse } from 'next/server';
import { searchProspects } from '@/lib/prospect-search/prospectSearch';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const result = await searchProspects({
      rubro: String(body?.rubro || ''),
      zona: String(body?.zona || ''),
      maxResults: Number(body?.maxResults || 10),
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ ok: false, message: 'No se pudo buscar prospectos.' }, { status: 500 });
  }
}
