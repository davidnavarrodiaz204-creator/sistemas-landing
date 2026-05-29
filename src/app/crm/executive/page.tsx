'use client';

import { useEffect, useMemo, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import { getProspects as getStoredProspects } from '@/lib/crm-storage/crmStorage';
import type { CrmProspectRecord } from '@/lib/crm-storage/crmStorage.types';
import { AlertTriangle, BarChart3, Download, Printer, TrendingUp } from 'lucide-react';

type ExecutiveProspect = CrmProspectRecord & {
  estadoConversacion?: string;
  historialMensajes?: Array<{ id?: string; status?: string; message?: string; createdAt?: string }>;
  fechaUltimoMensaje?: string;
  cantidadMensajesEnviados?: number;
  respuestaCliente?: string;
  installationStatus?: string;
  installationDate?: string;
  isDemo?: boolean;
};

type Metric = {
  label: string;
  value: number;
  delta: number;
};

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEAL_VALUE_KEY = 'factusys_crm_executive_deal_value';
const GOALS_KEY = 'factusys_crm_executive_goals';
const DEFAULT_DEAL_VALUE = 1500;
const DEFAULT_GOALS = { prospects: 100, contacts: 40, demos: 8, clients: 2 };

function today() {
  return new Date().toISOString().slice(0, 10);
}

function sevenDaysAgo() {
  const date = new Date();
  date.setDate(date.getDate() - 7);
  return date.toISOString().slice(0, 10);
}

function monthKey() {
  return today().slice(0, 7);
}

function normalizeProspect(raw: Partial<ExecutiveProspect>): ExecutiveProspect {
  return {
    id: raw.id || `prospect-${Date.now().toString(36)}`,
    negocio: String(raw.negocio || ''),
    rubro: String(raw.rubro || 'Otro'),
    zona: String(raw.zona || ''),
    contacto: String(raw.contacto || ''),
    telefono: String(raw.telefono || ''),
    redSocial: String(raw.redSocial || ''),
    interes: String(raw.interes || 'Ambos'),
    estado: String(raw.estado || 'Nuevo'),
    fechaUltimoContacto: String(raw.fechaUltimoContacto || ''),
    fechaProximoContacto: String(raw.fechaProximoContacto || ''),
    nota: String(raw.nota || ''),
    origen: String(raw.origen || 'Otro'),
    permisoContacto: String(raw.permisoContacto || 'Pendiente'),
    ultimoMensajeEnviado: String(raw.ultimoMensajeEnviado || ''),
    createdAt: String(raw.createdAt || new Date().toISOString()),
    estadoConversacion: String(raw.estadoConversacion || 'Sin respuesta'),
    historialMensajes: Array.isArray(raw.historialMensajes) ? raw.historialMensajes : [],
    fechaUltimoMensaje: String(raw.fechaUltimoMensaje || ''),
    cantidadMensajesEnviados: Number(raw.cantidadMensajesEnviados || 0),
    respuestaCliente: String(raw.respuestaCliente || ''),
    installationStatus: String(raw.installationStatus || ''),
    installationDate: String(raw.installationDate || ''),
    isDemo: Boolean(raw.isDemo),
  };
}

function currency(value: number) {
  return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN', maximumFractionDigits: 0 }).format(value);
}

function toCsvValue(value: string | number) {
  return `"${String(value).replaceAll('"', '""')}"`;
}

function downloadCsv(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map(toCsvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ExecutivePage() {
  return (
    <InternalGuard>
      <ExecutiveDashboard />
    </InternalGuard>
  );
}

function ExecutiveDashboard() {
  const [prospects, setProspects] = useState<ExecutiveProspect[]>([]);
  const [dealValue, setDealValue] = useState(() => (
    typeof window === 'undefined' ? DEFAULT_DEAL_VALUE : Number(window.localStorage.getItem(DEAL_VALUE_KEY) || DEFAULT_DEAL_VALUE)
  ));
  const [goals, setGoals] = useState(() => {
    if (typeof window === 'undefined') return DEFAULT_GOALS;
    try {
      return { ...DEFAULT_GOALS, ...JSON.parse(window.localStorage.getItem(GOALS_KEY) || '{}') };
    } catch {
      return DEFAULT_GOALS;
    }
  });

  useEffect(() => {
    let active = true;
    getStoredProspects([], normalizeProspect).then((items) => {
      const clean = IS_PRODUCTION ? items.filter((item) => !item.isDemo) : items;
      if (active) setProspects(clean);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    window.localStorage.setItem(DEAL_VALUE_KEY, String(dealValue));
  }, [dealValue]);

  useEffect(() => {
    window.localStorage.setItem(GOALS_KEY, JSON.stringify(goals));
  }, [goals]);

  const summary = useMemo(() => buildExecutiveSummary(prospects), [prospects]);
  const potential = useMemo(() => {
    const interested = prospects.filter((item) => item.estado === 'Interesado' || item.estadoConversacion === 'Interesado').length;
    const demos = prospects.filter((item) => item.estado === 'Demo activa').length;
    return {
      interested,
      demos,
      interestedValue: interested * dealValue,
      demoValue: demos * dealValue,
      total: (interested + demos) * dealValue,
    };
  }, [dealValue, prospects]);

  const topOpportunities = useMemo(() => prospects
    .filter((item) => ['Demo activa', 'Interesado'].includes(item.estado) || ['Respondió', 'Interesado', 'Demo activa'].includes(item.estadoConversacion || ''))
    .sort((a, b) => scoreOpportunity(b) - scoreOpportunity(a))
    .slice(0, 5), [prospects]);

  const alerts = useMemo(() => buildAlerts(prospects), [prospects]);
  const activity = useMemo(() => buildActivity(prospects), [prospects]);

  const exportExecutive = () => {
    const rows: Array<Array<string | number>> = [
      ['Métrica', 'Valor'],
      ['Prospectos totales', summary.metrics[0].value],
      ['Contactados', summary.metrics[1].value],
      ['Respondieron', summary.metrics[2].value],
      ['Interesados', summary.metrics[3].value],
      ['Demos ofrecidas', summary.metrics[4].value],
      ['Demos activas', summary.metrics[5].value],
      ['Instalaciones', summary.metrics[6].value],
      ['Clientes cerrados', summary.metrics[7].value],
      ['Pipeline potencial', potential.total],
    ];
    downloadCsv(`factusys-ejecutivo-${today()}.csv`, rows);
  };

  return (
    <main className="crm-page min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="crm-eyebrow mb-3">Dashboard Ejecutivo FACTUSYS</p>
            <h1 className="crm-title">Ventas reales y pipeline</h1>
            <p className="crm-subtitle mt-3 max-w-3xl">Vista ejecutiva para decidir a quién contactar, cuánto potencial hay y qué alertas atender hoy.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/crm" className="crm-button-secondary justify-center">Volver al CRM</a>
            <a href="/crm/installations" className="crm-button-secondary justify-center">Instalaciones</a>
          </div>
        </header>

        <section className="mb-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {summary.metrics.map((metric) => <ExecutiveMetric key={metric.label} metric={metric} />)}
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
          <FunnelCard funnel={summary.funnel} />
          <MoneyCard dealValue={dealValue} setDealValue={setDealValue} potential={potential} />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <GoalsCard goals={goals} setGoals={setGoals} summary={summary} />
          <TopOpportunities prospects={topOpportunities} />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[0.85fr_1.15fr]">
          <AlertsCard alerts={alerts} />
          <ActivityTimeline activity={activity} />
        </section>

        <section className="crm-card p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="crm-eyebrow mb-2">Exportación</p>
              <h2 className="crm-section-title">Resumen ejecutivo</h2>
              <p className="crm-muted mt-1 text-sm">Exporta datos para Excel o imprime el resumen como PDF desde el navegador.</p>
            </div>
            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" className="crm-button-secondary justify-center" onClick={exportExecutive}><Download size={16} />Exportar Excel Ejecutivo</button>
              <button type="button" className="crm-button-secondary justify-center" onClick={exportExecutive}><Download size={16} />Exportar CSV Ejecutivo</button>
              <button type="button" className="crm-button-primary justify-center" onClick={() => window.print()}><Printer size={16} />Imprimir PDF resumen</button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

function buildExecutiveSummary(prospects: ExecutiveProspect[]) {
  const since = sevenDaysAgo();
  const countRecent = (filter: (item: ExecutiveProspect) => boolean) => prospects.filter((item) => filter(item) && item.createdAt.slice(0, 10) >= since).length;
  const contacted = (item: ExecutiveProspect) => item.estado !== 'Nuevo' || Number(item.cantidadMensajesEnviados || 0) > 0;
  const responded = (item: ExecutiveProspect) => item.estadoConversacion === 'Respondió' || Boolean(item.respuestaCliente);
  const interested = (item: ExecutiveProspect) => item.estado === 'Interesado' || item.estadoConversacion === 'Interesado';
  const demo = (item: ExecutiveProspect) => item.estado === 'Demo activa' || item.estado === 'Demo 30 días ofrecida';
  const installation = (item: ExecutiveProspect) => Boolean(item.installationStatus && item.installationStatus !== 'Prospecto');
  const client = (item: ExecutiveProspect) => item.estado === 'Cerrado' || item.installationStatus === 'Producción';

  const metrics: Metric[] = [
    { label: 'Prospectos totales', value: prospects.length, delta: countRecent(() => true) },
    { label: 'Contactados', value: prospects.filter(contacted).length, delta: countRecent(contacted) },
    { label: 'Respondieron', value: prospects.filter(responded).length, delta: countRecent(responded) },
    { label: 'Interesados', value: prospects.filter(interested).length, delta: countRecent(interested) },
    { label: 'Demos ofrecidas', value: prospects.filter((item) => item.estado === 'Demo 30 días ofrecida').length, delta: countRecent((item) => item.estado === 'Demo 30 días ofrecida') },
    { label: 'Demos activas', value: prospects.filter((item) => item.estado === 'Demo activa').length, delta: countRecent((item) => item.estado === 'Demo activa') },
    { label: 'Instalaciones', value: prospects.filter(installation).length, delta: countRecent(installation) },
    { label: 'Clientes cerrados', value: prospects.filter(client).length, delta: countRecent(client) },
  ];

  const funnel = [
    { label: 'Nuevo', value: prospects.filter((item) => item.estado === 'Nuevo').length },
    { label: 'Contactado', value: prospects.filter(contacted).length },
    { label: 'Respondió', value: prospects.filter(responded).length },
    { label: 'Interesado', value: prospects.filter(interested).length },
    { label: 'Demo', value: prospects.filter(demo).length },
    { label: 'Instalación', value: prospects.filter(installation).length },
    { label: 'Cliente', value: prospects.filter(client).length },
  ];

  return { metrics, funnel };
}

function scoreOpportunity(item: ExecutiveProspect) {
  if (item.estado === 'Demo activa') return 100;
  if (item.estado === 'Interesado' || item.estadoConversacion === 'Interesado') return 80;
  if (item.estadoConversacion === 'Respondió' || item.respuestaCliente) return 60;
  return 10;
}

function buildAlerts(prospects: ExecutiveProspect[]) {
  const current = today();
  return [
    { label: 'Seguimientos vencidos', value: prospects.filter((item) => item.fechaProximoContacto && item.fechaProximoContacto < current && !['Cerrado', 'Perdido'].includes(item.estado)).length },
    { label: 'Interesados sin respuesta', value: prospects.filter((item) => item.estado === 'Interesado' && item.estadoConversacion === 'Sin respuesta').length },
    { label: 'Demos activas sin movimiento', value: prospects.filter((item) => item.estado === 'Demo activa' && (!item.fechaUltimoContacto || item.fechaUltimoContacto < sevenDaysAgo())).length },
    { label: 'Instalaciones pendientes', value: prospects.filter((item) => ['Demo agendada', 'Demo activa', 'Instalación parcial'].includes(item.installationStatus || '')).length },
  ];
}

function buildActivity(prospects: ExecutiveProspect[]) {
  const events = prospects.flatMap((prospect) => {
    const base = [{ type: 'prospecto agregado', business: prospect.negocio, date: prospect.createdAt, detail: prospect.estado }];
    const messages = (prospect.historialMensajes || []).map((message) => ({
      type: message.status === 'answered' ? 'respuesta' : message.status === 'sent_marked' || message.status === 'openwa_sent' ? 'mensaje enviado' : 'actividad WhatsApp',
      business: prospect.negocio,
      date: message.createdAt || prospect.createdAt,
      detail: message.message || '',
    }));
    const demo = prospect.estado.includes('Demo') ? [{ type: 'demo', business: prospect.negocio, date: prospect.fechaUltimoContacto || prospect.createdAt, detail: prospect.estado }] : [];
    const install = prospect.installationStatus ? [{ type: 'instalación', business: prospect.negocio, date: prospect.installationDate || prospect.createdAt, detail: prospect.installationStatus }] : [];
    return [...base, ...messages, ...demo, ...install];
  });

  return events.sort((a, b) => b.date.localeCompare(a.date)).slice(0, 20);
}

function ExecutiveMetric({ metric }: { metric: Metric }) {
  return (
    <div className="crm-card p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="crm-muted text-xs font-bold uppercase">{metric.label}</span>
        <span className="crm-badge">+{metric.delta} 7d</span>
      </div>
      <p className="crm-number mt-3">{metric.value}</p>
    </div>
  );
}

function FunnelCard({ funnel }: { funnel: Array<{ label: string; value: number }> }) {
  const first = Math.max(funnel[0]?.value || 0, 1);
  return (
    <div className="crm-card p-5">
      <div className="mb-4 flex items-center gap-2"><BarChart3 className="text-neon" size={22} /><h2 className="crm-section-title">Embudo de ventas</h2></div>
      <div className="space-y-3">
        {funnel.map((stage, index) => {
          const conversion = Math.round((stage.value / first) * 100);
          return (
            <div key={stage.label}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-bold text-slate-900">{stage.label}</span>
                <span className="crm-muted">{stage.value} · {conversion}%</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-neon" style={{ width: `${Math.max(conversion, stage.value ? 8 : 0)}%` }} /></div>
              {index < funnel.length - 1 && <p className="crm-muted py-1 text-center text-xs">↓</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MoneyCard({ dealValue, setDealValue, potential }: { dealValue: number; setDealValue: (value: number) => void; potential: { interested: number; demos: number; interestedValue: number; demoValue: number; total: number } }) {
  return (
    <div className="crm-card p-5">
      <div className="mb-4 flex items-center gap-2"><TrendingUp className="text-neon" size={22} /><h2 className="crm-section-title">Dinero potencial</h2></div>
      <label className="block">
        <span className="crm-label">Valor por cierre</span>
        <input className="crm-input" type="number" min={0} value={dealValue} onChange={(event) => setDealValue(Number(event.target.value || 0))} />
      </label>
      <div className="mt-4 rounded-2xl bg-black p-5 text-white">
        <p className="text-sm text-white/60">Pipeline Value</p>
        <p className="mt-2 text-4xl font-black">{currency(potential.total)}</p>
        <p className="mt-2 text-sm text-white/70">{potential.interested + potential.demos} oportunidades x {currency(dealValue)}</p>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="crm-mini-card rounded-xl p-4"><p className="crm-muted text-xs">Potencial interesados</p><p className="crm-number mt-2">{currency(potential.interestedValue)}</p></div>
        <div className="crm-mini-card rounded-xl p-4"><p className="crm-muted text-xs">Potencial demos activas</p><p className="crm-number mt-2">{currency(potential.demoValue)}</p></div>
      </div>
    </div>
  );
}

function GoalsCard({ goals, setGoals, summary }: { goals: typeof DEFAULT_GOALS; setGoals: (value: typeof DEFAULT_GOALS) => void; summary: ReturnType<typeof buildExecutiveSummary> }) {
  const month = monthKey();
  const values = {
    prospects: summary.metrics[0].delta,
    contacts: summary.metrics[1].delta,
    demos: summary.metrics[4].value + summary.metrics[5].value,
    clients: summary.metrics[7].value,
  };
  const labels = { prospects: 'Prospectos', contacts: 'Contactos', demos: 'Demos', clients: 'Clientes' };
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Objetivos mensuales</h2>
      <p className="crm-muted mt-1 text-sm">Mes actual: {month}</p>
      <div className="mt-4 space-y-4">
        {(Object.keys(goals) as Array<keyof typeof goals>).map((key) => {
          const percent = Math.min((values[key] / Math.max(goals[key], 1)) * 100, 100);
          return (
            <div key={key}>
              <div className="mb-2 grid grid-cols-[1fr_90px] items-center gap-3">
                <p className="font-bold text-slate-900">{labels[key]} · {values[key]}/{goals[key]}</p>
                <input className="crm-input px-2 py-2 text-sm" type="number" min={1} value={goals[key]} onChange={(event) => setGoals({ ...goals, [key]: Number(event.target.value || 1) })} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-black/10"><div className="h-full rounded-full bg-neon" style={{ width: `${percent}%` }} /></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TopOpportunities({ prospects }: { prospects: ExecutiveProspect[] }) {
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Top oportunidades</h2>
      <div className="mt-4 space-y-3">
        {prospects.length === 0 && <p className="crm-note text-sm">Aún no hay oportunidades calientes.</p>}
        {prospects.map((prospect) => (
          <div key={prospect.id} className="crm-mini-card rounded-2xl p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-bold text-slate-900">{prospect.negocio}</p>
              <span className="crm-badge">{prospect.estado}</span>
            </div>
            <p className="crm-muted mt-1 text-sm">{prospect.rubro} · {prospect.zona || 'Sin ciudad'}</p>
            <p className="crm-muted mt-1 text-xs">Último: {prospect.fechaUltimoContacto || 'sin registro'} · Próximo: {prospect.fechaProximoContacto || 'sin fecha'}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsCard({ alerts }: { alerts: Array<{ label: string; value: number }> }) {
  return (
    <div className="crm-card p-5">
      <div className="mb-4 flex items-center gap-2"><AlertTriangle className="text-red-500" size={22} /><h2 className="crm-section-title">Alertas</h2></div>
      <div className="space-y-3">
        {alerts.map((alert) => (
          <div key={alert.label} className="flex items-center justify-between rounded-2xl border border-black/10 bg-white/50 p-4">
            <span className="font-bold text-slate-900">{alert.label}</span>
            <span className={`rounded-full px-3 py-1 text-xs font-black ${alert.value ? 'bg-red-500 text-white' : 'bg-neon/15 text-neon'}`}>{alert.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityTimeline({ activity }: { activity: Array<{ type: string; business: string; date: string; detail: string }> }) {
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Actividad reciente</h2>
      <div className="mt-4 space-y-3">
        {activity.length === 0 && <p className="crm-note text-sm">Sin actividad registrada todavía.</p>}
        {activity.map((item, index) => (
          <div key={`${item.business}-${item.date}-${index}`} className="grid grid-cols-[14px_1fr] gap-3">
            <span className="mt-1 h-3 w-3 rounded-full bg-neon" />
            <div className="border-b border-black/10 pb-3">
              <p className="text-sm font-bold text-slate-900">{item.type} · {item.business}</p>
              <p className="crm-muted text-xs">{item.date?.slice(0, 10) || 'sin fecha'} · {item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
