import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { isEmailConfigured } from '@/lib/email/emailClient';
import { isImapConfigured, testSmtp, testImap } from '@/lib/crm-inbox/connectors/email';
import { requireInternalToken } from '@/lib/crm-auth/requireToken';
import { getResponseMode, setResponseMode } from '@/lib/crm-db/config';

function getEnvVar(name: string): { name: string; set: boolean; value: string } {
  const val = process.env[name] || '';
  return { name, set: Boolean(val), value: val ? (name.includes('SECRET') || name.includes('TOKEN') || name.includes('PASS') ? '••••••' : val) : '' };
}

const ALL_CHANNEL_VARS = [
  'DATABASE_URL',
  'OPENWA_API_URL', 'OPENWA_API_KEY',
  'SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'EMAIL_FROM',
  'IMAP_HOST', 'IMAP_PORT', 'IMAP_USER', 'IMAP_PASS',
  'FACEBOOK_PAGE_ID', 'FACEBOOK_ACCESS_TOKEN',
  'INSTAGRAM_BUSINESS_ID',
  'META_VERIFY_TOKEN', 'META_APP_SECRET',
  'PUBLIC_WEBHOOK_URL',
];

export async function GET() {
  const checks: Record<string, { configured: boolean; status: string; detail?: string }> = {};

  const pgOk = await isDbConnected();
  checks.postgresql = { configured: pgOk, status: pgOk ? 'connected' : 'disconnected' };

  const openwaUrl = process.env.OPENWA_API_URL || '';
  const openwaKey = process.env.OPENWA_API_KEY || '';
  checks.openwa = {
    configured: Boolean(openwaUrl && openwaKey),
    status: (openwaUrl && openwaKey) ? 'configured' : 'not_configured',
  };

  const smtpOk = isEmailConfigured();
  checks.smtp = { configured: smtpOk, status: smtpOk ? 'configured' : 'not_configured' };

  const imapOk = isImapConfigured();
  checks.imap = { configured: imapOk, status: imapOk ? 'configured' : 'not_configured' };

  const fbPageId = process.env.FACEBOOK_PAGE_ID || '';
  const fbToken = process.env.FACEBOOK_ACCESS_TOKEN || '';
  const igBizId = process.env.INSTAGRAM_BUSINESS_ID || '';
  const metaToken = process.env.META_VERIFY_TOKEN || '';
  const metaSecret = process.env.META_APP_SECRET || '';
  checks.facebook = {
    configured: Boolean(fbPageId && fbToken),
    status: (fbPageId && fbToken) ? 'configured' : 'not_configured',
  };
  checks.instagram = {
    configured: Boolean(igBizId && fbToken),
    status: (igBizId && fbToken) ? 'configured' : 'not_configured',
  };
  checks.meta_webhook = {
    configured: Boolean(metaToken && metaSecret),
    status: (metaToken && metaSecret) ? 'configured' : 'not_configured',
  };

  const publicUrl = process.env.PUBLIC_WEBHOOK_URL || '';
  checks.webhook_url = {
    configured: Boolean(publicUrl),
    status: publicUrl ? 'configured' : 'not_set',
    detail: publicUrl || undefined,
  };

  const vars = ALL_CHANNEL_VARS.map(getEnvVar);
  const missingVars = vars.filter(v => !v.set).map(v => v.name);
  const configuredVars = vars.filter(v => v.set);

  return NextResponse.json({
    ok: pgOk,
    checks,
    env: { total: vars.length, configured: configuredVars.length, missing: missingVars.length, missingVars },
    mode: await getResponseMode(),
  });
}

export async function POST(request: Request) {
  const tokenCheck = requireInternalToken(request); if (!tokenCheck.ok) return NextResponse.json({ ok: false, message: tokenCheck.message }, { status: 401 });
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'test_all') {
      const results: Record<string, { ok: boolean; message: string }> = {};

      const pgOk = await isDbConnected();
      results.postgresql = { ok: pgOk, message: pgOk ? 'Conectado' : 'Desconectado' };

      if (process.env.OPENWA_API_URL) {
        try {
          const res = await fetch(`${process.env.OPENWA_API_URL}/health`, {
            headers: { 'x-api-key': process.env.OPENWA_API_KEY || '' },
            signal: AbortSignal.timeout(5000),
          });
          const data = await res.json();
          results.openwa = { ok: res.ok, message: data.status || (res.ok ? 'Conectado' : 'Error') };
        } catch (err) {
          results.openwa = { ok: false, message: `No responde: ${err instanceof Error ? err.message : 'timeout'}` };
        }
      } else {
        results.openwa = { ok: false, message: 'No configurado' };
      }

      const smtpResult = await testSmtp();
      results.smtp = { ok: smtpResult.ok, message: smtpResult.message };

      const imapResult = await testImap();
      results.imap = { ok: imapResult.ok, message: imapResult.message };

      if (process.env.FACEBOOK_ACCESS_TOKEN) {
        try {
          const res = await fetch(`https://graph.facebook.com/v21.0/me?access_token=${process.env.FACEBOOK_ACCESS_TOKEN}`, {
            signal: AbortSignal.timeout(5000),
          });
          const data = await res.json();
          results.facebook = { ok: res.ok, message: res.ok ? `Conectado: ${data.name || 'OK'}` : `Error: ${data.error?.message || 'desconocido'}` };
        } catch (err) {
          results.facebook = { ok: false, message: `No responde: ${err instanceof Error ? err.message : 'timeout'}` };
        }
      } else {
        results.facebook = { ok: false, message: 'No configurado' };
      }

      return NextResponse.json({ ok: true, results });
    }

    if (action === 'set_mode') {
      const { mode } = body;
      if (!['manual', 'copiloto', 'automatico_limitado'].includes(mode)) {
        return NextResponse.json({ ok: false, message: 'Modo inválido. Usa: manual, copiloto, automatico_limitado.' }, { status: 400 });
      }
      await setResponseMode(mode);
      return NextResponse.json({ ok: true, mode });
    }

    if (action === 'get_mode') {
      const mode = await getResponseMode();
      return NextResponse.json({ ok: true, mode });
    }

    return NextResponse.json({ ok: false, message: 'Acción no válida.' }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ ok: false, message: err instanceof Error ? err.message : 'Error' }, { status: 500 });
  }
}
