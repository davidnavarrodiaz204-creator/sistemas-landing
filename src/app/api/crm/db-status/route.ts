import { NextResponse } from 'next/server';
import { isDbConnected } from '@/lib/crm-db/db';
import { getProspectCount } from '@/lib/crm-db/prospects';
import { getPendingFollowUpCount } from '@/lib/crm-db/followups';
import { getTodaysDemos } from '@/lib/crm-db/demos';
import { getOverdueInstallations } from '@/lib/crm-db/installations';
import { getLogs } from '@/lib/crm-db/logs';

export async function GET() {
  const connected = await isDbConnected();
  if (!connected) {
    return NextResponse.json({ ok: false, status: 'disconnected', message: 'PostgreSQL no conectado. Configura DATABASE_URL.' });
  }
  const [prospectCount, followUpCount, todaysDemos, overdueInstallations, recentLogs] = await Promise.all([
    getProspectCount().catch(() => 0),
    getPendingFollowUpCount().catch(() => 0),
    getTodaysDemos().then((d) => d.length).catch(() => 0),
    getOverdueInstallations().then((i) => i.length).catch(() => 0),
    getLogs(5).catch(() => []),
  ]);
  const lastErrors = (recentLogs || []).filter((l) => l.event === 'error' || l.detail?.toLowerCase().includes('error'));
  return NextResponse.json({
    ok: true,
    status: 'connected',
    prospectCount,
    followUpCount,
    demosAgendadas: todaysDemos,
    instalacionesPendientes: overdueInstallations,
    lastErrors: lastErrors.slice(0, 3).map((l) => ({ event: l.event, detail: l.detail, created_at: l.created_at })),
    message: 'PostgreSQL conectado y listo.',
  });
}
