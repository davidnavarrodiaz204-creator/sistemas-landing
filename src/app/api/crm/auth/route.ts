import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ ok: false, message: 'Contraseña requerida.' }, { status: 400 });
    }
    const validPassword = process.env.CRM_ACCESS_PASSWORD || '';
    if (!validPassword) {
      return NextResponse.json({ ok: false, message: 'CRM_ACCESS_PASSWORD no configurado en el servidor.' }, { status: 500 });
    }
    const ok = password === validPassword;
    return NextResponse.json({ ok, message: ok ? 'Acceso concedido.' : 'Contraseña incorrecta.' }, { status: ok ? 200 : 401 });
  } catch {
    return NextResponse.json({ ok: false, message: 'Error interno.' }, { status: 500 });
  }
}
