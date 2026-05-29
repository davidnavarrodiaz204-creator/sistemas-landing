'use client';

import { useEffect, useMemo, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import { CheckCircle2, Download, FileUp, Pause, Play, Plus, Send, ShieldCheck } from 'lucide-react';

type Channel = 'WhatsApp' | 'Email' | 'Ambos';
type CampaignStatus = 'Borrador' | 'Lista preparada' | 'Enviando' | 'Pausada' | 'Finalizada';
type ReviewStatus = 'Pendiente' | 'Aprobado' | 'Rechazado' | 'No contactar';
type QueueStatus = 'Pendiente' | 'Aprobado' | 'Enviado' | 'Error' | 'Pausado';
type Rubro = 'Pollería' | 'Restaurante' | 'Cevichería' | 'Ferretería' | 'Minimarket' | 'Otro';

type Campaign = {
  id: string;
  nombre: string;
  rubro: Rubro;
  zona: string;
  canal: Channel;
  mensajeBase: string;
  asuntoEmail: string;
  imagenDemoUrl: string;
  limiteWhatsApp: number;
  limiteEmail: number;
  estado: CampaignStatus;
  createdAt: string;
};

type ImportedProspect = {
  id: string;
  campaignId: string;
  negocio: string;
  rubro: Rubro;
  ciudad: string;
  whatsapp: string;
  email: string;
  link: string;
  fuente: string;
  nota: string;
  reviewStatus: ReviewStatus;
  duplicateReason?: string;
  createdAt: string;
};

type QueueItem = {
  id: string;
  campaignId: string;
  prospectId: string;
  canal: 'WhatsApp' | 'Email';
  status: QueueStatus;
  lastSentAt?: string;
  error?: string;
};

type AutomationHistory = {
  id: string;
  campaignId: string;
  prospectId: string;
  canal: string;
  fecha: string;
  mensaje: string;
  imagen: string;
  resultado: string;
  error?: string;
};
type ManualProspect = {
  negocio: string;
  ciudad: string;
  whatsapp: string;
  email: string;
  link: string;
  fuente: string;
  nota: string;
};

const CAMPAIGNS_KEY = 'factusys_automation_campaigns_v1';
const PROSPECTS_KEY = 'factusys_automation_prospects_v1';
const QUEUE_KEY = 'factusys_automation_queue_v1';
const HISTORY_KEY = 'factusys_automation_history_v1';
const RUBROS: Rubro[] = ['Pollería', 'Restaurante', 'Cevichería', 'Ferretería', 'Minimarket', 'Otro'];
const CHANNELS: Channel[] = ['WhatsApp', 'Email', 'Ambos'];
const UNSUBSCRIBE = 'Si no deseas recibir más información, me indicas y no vuelvo a escribirte.';

function today() {
  return new Date().toISOString().slice(0, 10);
}

function load<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) || '');
    return parsed || fallback;
  } catch {
    return fallback;
  }
}

function save<T>(key: string, value: T) {
  window.localStorage.setItem(key, JSON.stringify(value));
}

function emptyCampaign(): Campaign {
  return {
    id: `campaign-${Date.now().toString(36)}`,
    nombre: 'Campaña norte',
    rubro: 'Pollería',
    zona: 'Paita',
    canal: 'WhatsApp',
    mensajeBase: 'Hola, soy David de FACTUSYS. Estoy ofreciendo una demo gratuita de 30 días para que pruebes ventas, caja, reportes y control del negocio.',
    asuntoEmail: 'Demo gratuita FACTUSYS para tu negocio',
    imagenDemoUrl: '',
    limiteWhatsApp: 15,
    limiteEmail: 30,
    estado: 'Borrador',
    createdAt: new Date().toISOString(),
  };
}

function normalizeText(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function parseProspectText(text: string, campaign: Campaign): ImportedProspect[] {
  return text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line, index) => {
    const [negocio = '', ciudad = campaign.zona, whatsapp = '', fuente = 'Manual', email = '', link = '', nota = ''] = line.split('|').map((part) => part.trim());
    return {
      id: `import-${Date.now().toString(36)}-${index}`,
      campaignId: campaign.id,
      negocio,
      rubro: campaign.rubro,
      ciudad,
      whatsapp,
      email,
      link,
      fuente,
      nota,
      reviewStatus: 'Pendiente' as ReviewStatus,
      createdAt: new Date().toISOString(),
    };
  }).filter((item) => item.negocio);
}

function duplicateReason(item: ImportedProspect, all: ImportedProspect[]) {
  const others = all.filter((other) => other.id !== item.id);
  const phone = item.whatsapp.replace(/\D/g, '');
  const email = normalizeText(item.email);
  const name = normalizeText(item.negocio);
  const link = normalizeText(item.link);
  if (phone && others.some((other) => other.whatsapp.replace(/\D/g, '') === phone)) return 'WhatsApp duplicado';
  if (email && others.some((other) => normalizeText(other.email) === email)) return 'Email duplicado';
  if (name && others.some((other) => normalizeText(other.negocio) === name)) return 'Nombre duplicado';
  if (link && others.some((other) => normalizeText(other.link) === link)) return 'Link duplicado';
  return '';
}

function csvDownload(filename: string, rows: Array<Array<string | number>>) {
  const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function AutomationPage() {
  return (
    <InternalGuard>
      <AutomationCenter />
    </InternalGuard>
  );
}

function AutomationCenter() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(() => load(CAMPAIGNS_KEY, [emptyCampaign()]));
  const [prospects, setProspects] = useState<ImportedProspect[]>(() => load(PROSPECTS_KEY, []));
  const [queue, setQueue] = useState<QueueItem[]>(() => load(QUEUE_KEY, []));
  const [history, setHistory] = useState<AutomationHistory[]>(() => load(HISTORY_KEY, []));
  const [activeCampaignId, setActiveCampaignId] = useState(() => campaigns[0]?.id || '');
  const [importText, setImportText] = useState('');
  const [manual, setManual] = useState({ negocio: '', ciudad: '', whatsapp: '', email: '', link: '', fuente: 'Manual', nota: '' });
  const [isRunning, setIsRunning] = useState(false);

  const activeCampaign = campaigns.find((item) => item.id === activeCampaignId) || campaigns[0] || emptyCampaign();
  const campaignProspects = prospects.filter((item) => item.campaignId === activeCampaign.id);
  const campaignQueue = queue.filter((item) => item.campaignId === activeCampaign.id);
  const campaignHistory = history.filter((item) => item.campaignId === activeCampaign.id);

  useEffect(() => save(CAMPAIGNS_KEY, campaigns), [campaigns]);
  useEffect(() => save(PROSPECTS_KEY, prospects), [prospects]);
  useEffect(() => save(QUEUE_KEY, queue), [queue]);
  useEffect(() => save(HISTORY_KEY, history), [history]);

  const dashboard = useMemo(() => ({
    wa: campaignHistory.filter((item) => item.canal === 'WhatsApp' && item.resultado.includes('Enviado')).length,
    email: campaignHistory.filter((item) => item.canal === 'Email' && item.resultado.includes('Enviado')).length,
    errors: campaignHistory.filter((item) => item.resultado.includes('Error')).length,
    interested: campaignProspects.filter((item) => item.nota.toLowerCase().includes('interes')).length,
    demos: campaignProspects.filter((item) => item.nota.toLowerCase().includes('demo')).length,
  }), [campaignHistory, campaignProspects]);

  const updateCampaign = (patch: Partial<Campaign>) => {
    setCampaigns((current) => current.map((item) => item.id === activeCampaign.id ? { ...item, ...patch } : item));
  };

  const addCampaign = () => {
    const campaign = emptyCampaign();
    setCampaigns((current) => [campaign, ...current]);
    setActiveCampaignId(campaign.id);
  };

  const addProspects = (items: ImportedProspect[]) => {
    const merged = [...items, ...prospects].map((item, _, all) => ({ ...item, duplicateReason: duplicateReason(item, all) }));
    setProspects(merged);
  };

  const importProspects = () => {
    const parsed = parseProspectText(importText, activeCampaign);
    if (!parsed.length) return;
    addProspects(parsed);
    setImportText('');
  };

  const addManual = () => {
    if (!manual.negocio.trim()) return;
    addProspects([{
      id: `manual-${Date.now().toString(36)}`,
      campaignId: activeCampaign.id,
      negocio: manual.negocio,
      rubro: activeCampaign.rubro,
      ciudad: manual.ciudad || activeCampaign.zona,
      whatsapp: manual.whatsapp,
      email: manual.email,
      link: manual.link,
      fuente: manual.fuente,
      nota: manual.nota,
      reviewStatus: 'Pendiente',
      createdAt: new Date().toISOString(),
    }]);
    setManual({ negocio: '', ciudad: '', whatsapp: '', email: '', link: '', fuente: 'Manual', nota: '' });
  };

  const setReview = (id: string, reviewStatus: ReviewStatus) => {
    setProspects((current) => current.map((item) => item.id === id ? { ...item, reviewStatus } : item));
  };

  const prepareQueue = () => {
    const approved = campaignProspects.filter((item) => item.reviewStatus === 'Aprobado' && !item.duplicateReason);
    const items = approved.flatMap((prospect) => {
      const channels = activeCampaign.canal === 'Ambos' ? ['WhatsApp', 'Email'] as const : [activeCampaign.canal] as const;
      return channels.map((canal) => ({
        id: `queue-${prospect.id}-${canal}`,
        campaignId: activeCampaign.id,
        prospectId: prospect.id,
        canal,
        status: 'Aprobado' as QueueStatus,
      }));
    });
    setQueue((current) => [...items.filter((item) => !current.some((existing) => existing.id === item.id)), ...current]);
    updateCampaign({ estado: 'Lista preparada' });
  };

  const sentToday = (canal: string) => campaignHistory.filter((item) => item.canal === canal && item.fecha.slice(0, 10) === today()).length;

  const sendQueueItem = async (item: QueueItem) => {
    const prospect = prospects.find((entry) => entry.id === item.prospectId);
    if (!prospect) return markQueueError(item, 'Prospecto no encontrado.');
    if (prospect.reviewStatus === 'No contactar') return markQueueError(item, 'Prospecto marcado como No contactar.');
    if (prospect.reviewStatus !== 'Aprobado' || prospect.duplicateReason) return markQueueError(item, 'Prospecto no aprobado o duplicado.');
    if (item.canal === 'WhatsApp' && (!prospect.whatsapp || sentToday('WhatsApp') >= activeCampaign.limiteWhatsApp)) return markQueueError(item, 'Falta WhatsApp o límite diario alcanzado.');
    if (item.canal === 'Email' && (!prospect.email || sentToday('Email') >= activeCampaign.limiteEmail)) return markQueueError(item, 'Falta email o límite diario alcanzado.');

    const message = `${activeCampaign.mensajeBase}\n\n${UNSUBSCRIBE}`;
    const endpoint = item.canal === 'WhatsApp' ? '/api/whatsapp/send' : '/api/email/send';
    const body = item.canal === 'WhatsApp'
      ? { phone: prospect.whatsapp, message, mediaUrl: activeCampaign.imagenDemoUrl, prospectId: prospect.id, campaignId: activeCampaign.id, confirmSend: true }
      : { to: prospect.email, subject: activeCampaign.asuntoEmail, message, mediaUrl: activeCampaign.imagenDemoUrl, prospectId: prospect.id, campaignId: activeCampaign.id, confirmSend: true };

    try {
      const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      const data = await response.json();
      if (!response.ok || !data.ok) return markQueueError(item, data.message || 'Error de envío.');
      markQueueSent(item, message, data.simulated ? 'Enviado simulado' : 'Enviado');
    } catch {
      markQueueError(item, 'No se pudo conectar con el endpoint.');
    }
  };

  const markQueueSent = (item: QueueItem, message: string, result: string) => {
    setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'Enviado', lastSentAt: new Date().toISOString(), error: '' } : entry));
    setHistory((current) => [{
      id: `history-${Date.now().toString(36)}`,
      campaignId: item.campaignId,
      prospectId: item.prospectId,
      canal: item.canal,
      fecha: new Date().toISOString(),
      mensaje: message,
      imagen: activeCampaign.imagenDemoUrl,
      resultado: result,
    }, ...current]);
  };

  const markQueueError = (item: QueueItem, error: string) => {
    setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'Error', error } : entry));
    setHistory((current) => [{
      id: `history-${Date.now().toString(36)}`,
      campaignId: item.campaignId,
      prospectId: item.prospectId,
      canal: item.canal,
      fecha: new Date().toISOString(),
      mensaje: activeCampaign.mensajeBase,
      imagen: activeCampaign.imagenDemoUrl,
      resultado: 'Error',
      error,
    }, ...current]);
  };

  const sendNext = () => {
    const next = campaignQueue.find((item) => item.status === 'Aprobado' || item.status === 'Pendiente');
    if (next) void sendQueueItem(next);
  };

  const startQueue = async () => {
    if (!window.confirm('Confirmación fuerte: se enviará cola controlada solo a aprobados, respetando límites diarios. ¿Continuar?')) return;
    setIsRunning(true);
    updateCampaign({ estado: 'Enviando' });
    const pending = campaignQueue.filter((item) => item.status === 'Aprobado' || item.status === 'Pendiente');
    for (const item of pending) {
      if (!isRunning && pending.indexOf(item) > 0) break;
      await sendQueueItem(item);
      await new Promise((resolve) => window.setTimeout(resolve, 1200));
    }
    setIsRunning(false);
  };

  const pauseQueue = () => {
    setIsRunning(false);
    updateCampaign({ estado: 'Pausada' });
    setQueue((current) => current.map((item) => item.campaignId === activeCampaign.id && item.status === 'Pendiente' ? { ...item, status: 'Pausado' } : item));
  };

  const exportCampaign = () => {
    csvDownload(`factusys-campana-${activeCampaign.nombre}-${today()}.csv`, [
      ['Negocio', 'Rubro', 'Ciudad', 'WhatsApp', 'Email', 'Link', 'Fuente', 'Revision', 'Nota'],
      ...campaignProspects.map((item) => [item.negocio, item.rubro, item.ciudad, item.whatsapp, item.email, item.link, item.fuente, item.reviewStatus, item.nota]),
    ]);
  };

  return (
    <main className="crm-page min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="crm-eyebrow mb-3">Automation Center seguro</p>
            <h1 className="crm-title">Campañas con revisión y límites</h1>
            <p className="crm-subtitle mt-3 max-w-3xl">Importa, aprueba y envía uno por uno o en cola controlada. No se envía a rechazados ni a “No contactar”.</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a href="/crm" className="crm-button-secondary justify-center">Volver al CRM</a>
            <a href="/crm/executive" className="crm-button-secondary justify-center">Ejecutivo</a>
          </div>
        </header>

        <section className="mb-6 grid gap-5 xl:grid-cols-[420px_1fr]">
          <div className="crm-card p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="crm-section-title">Campañas</h2>
              <button type="button" className="crm-button-secondary min-h-0 px-3 py-2 text-xs" onClick={addCampaign}><Plus size={14} />Nueva</button>
            </div>
            <select className="crm-input mb-3" value={activeCampaign.id} onChange={(event) => setActiveCampaignId(event.target.value)}>
              {campaigns.map((campaign) => <option key={campaign.id} value={campaign.id}>{campaign.nombre}</option>)}
            </select>
            <CampaignEditor campaign={activeCampaign} onChange={updateCampaign} />
          </div>

          <div className="grid gap-5">
            <DashboardCards dashboard={dashboard} queue={campaignQueue} />
            <ImportPanel importText={importText} setImportText={setImportText} importProspects={importProspects} manual={manual} setManual={setManual} addManual={addManual} />
          </div>
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_420px]">
          <ReviewPanel prospects={campaignProspects} onReview={setReview} />
          <QueuePanel queue={campaignQueue} onPrepare={prepareQueue} onSendNext={sendNext} onStart={startQueue} onPause={pauseQueue} isRunning={isRunning} />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_420px]">
          <HistoryPanel history={campaignHistory} />
          <div className="crm-card p-5">
            <p className="crm-eyebrow mb-2">Exportar campaña</p>
            <h2 className="crm-section-title">CSV / Excel</h2>
            <p className="crm-muted mt-1 text-sm">Exporta prospectos, revisión y notas para respaldo.</p>
            <button type="button" className="crm-button-primary mt-4 w-full justify-center" onClick={exportCampaign}><Download size={16} />Exportar campaña</button>
          </div>
        </section>
      </div>
    </main>
  );
}

function CampaignEditor({ campaign, onChange }: { campaign: Campaign; onChange: (patch: Partial<Campaign>) => void }) {
  return (
    <div className="space-y-3">
      <input className="crm-input" value={campaign.nombre} onChange={(event) => onChange({ nombre: event.target.value })} placeholder="Nombre" />
      <select className="crm-input" value={campaign.rubro} onChange={(event) => onChange({ rubro: event.target.value as Rubro })}>{RUBROS.map((item) => <option key={item}>{item}</option>)}</select>
      <input className="crm-input" value={campaign.zona} onChange={(event) => onChange({ zona: event.target.value })} placeholder="Ciudad/zona" />
      <select className="crm-input" value={campaign.canal} onChange={(event) => onChange({ canal: event.target.value as Channel })}>{CHANNELS.map((item) => <option key={item}>{item}</option>)}</select>
      <input className="crm-input" value={campaign.asuntoEmail} onChange={(event) => onChange({ asuntoEmail: event.target.value })} placeholder="Asunto email" />
      <input className="crm-input" value={campaign.imagenDemoUrl} onChange={(event) => onChange({ imagenDemoUrl: event.target.value })} placeholder="Imagen demo URL" />
      <textarea className="crm-input min-h-28 resize-none" value={campaign.mensajeBase} onChange={(event) => onChange({ mensajeBase: event.target.value })} />
      <div className="grid grid-cols-2 gap-2">
        <input className="crm-input" type="number" value={campaign.limiteWhatsApp} onChange={(event) => onChange({ limiteWhatsApp: Number(event.target.value || 15) })} />
        <input className="crm-input" type="number" value={campaign.limiteEmail} onChange={(event) => onChange({ limiteEmail: Number(event.target.value || 30) })} />
      </div>
      <select className="crm-input" value={campaign.estado} onChange={(event) => onChange({ estado: event.target.value as CampaignStatus })}>{['Borrador', 'Lista preparada', 'Enviando', 'Pausada', 'Finalizada'].map((item) => <option key={item}>{item}</option>)}</select>
      <p className="crm-note text-xs"><ShieldCheck size={14} className="inline text-neon" /> Baja obligatoria: “{UNSUBSCRIBE}”</p>
    </div>
  );
}

function DashboardCards({ dashboard, queue }: { dashboard: { wa: number; email: number; errors: number; interested: number; demos: number }; queue: QueueItem[] }) {
  const cards = [
    ['Enviados WhatsApp', dashboard.wa],
    ['Enviados Email', dashboard.email],
    ['Errores', dashboard.errors],
    ['Interesados', dashboard.interested],
    ['Demos agendadas', dashboard.demos],
    ['En cola', queue.filter((item) => item.status === 'Aprobado' || item.status === 'Pendiente').length],
  ];
  return <div className="grid gap-3 md:grid-cols-3">{cards.map(([label, value]) => <div key={label} className="crm-card p-4"><p className="crm-muted text-xs font-bold uppercase">{label}</p><p className="crm-number mt-2">{value}</p></div>)}</div>;
}

function ImportPanel({ importText, setImportText, importProspects, manual, setManual, addManual }: { importText: string; setImportText: (value: string) => void; importProspects: () => void; manual: ManualProspect; setManual: (value: ManualProspect) => void; addManual: () => void }) {
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Importar prospectos</h2>
      <textarea className="crm-input mt-3 min-h-28 resize-none" value={importText} onChange={(event) => setImportText(event.target.value)} placeholder="Negocio | Ciudad | WhatsApp | Fuente | email | link | nota" />
      <button type="button" className="crm-button-secondary mt-3 justify-center" onClick={importProspects}><FileUp size={16} />Importar texto/CSV</button>
      <div className="mt-4 grid gap-2 md:grid-cols-2">
        {(['negocio', 'ciudad', 'whatsapp', 'email', 'link', 'fuente', 'nota'] as Array<keyof ManualProspect>).map((field) => <input key={field} className="crm-input" value={manual[field] || ''} onChange={(event) => setManual({ ...manual, [field]: event.target.value })} placeholder={field} />)}
      </div>
      <button type="button" className="crm-button-primary mt-3 justify-center" onClick={addManual}><Plus size={16} />Agregar manual</button>
    </div>
  );
}

function ReviewPanel({ prospects, onReview }: { prospects: ImportedProspect[]; onReview: (id: string, status: ReviewStatus) => void }) {
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Revisión obligatoria</h2>
      <div className="mt-4 space-y-3">
        {prospects.map((prospect) => <div key={prospect.id} className="crm-mini-card rounded-2xl p-4"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-slate-900">{prospect.negocio}</p><p className="crm-muted text-xs">{prospect.ciudad} · {prospect.whatsapp || prospect.email || 'sin canal'} · {prospect.fuente}</p>{prospect.duplicateReason && <p className="text-xs font-bold text-red-500">{prospect.duplicateReason}</p>}</div><select className="crm-input max-w-[180px]" value={prospect.reviewStatus} onChange={(event) => onReview(prospect.id, event.target.value as ReviewStatus)}>{['Pendiente', 'Aprobado', 'Rechazado', 'No contactar'].map((item) => <option key={item}>{item}</option>)}</select></div></div>)}
        {prospects.length === 0 && <p className="crm-note text-sm">Importa o agrega prospectos para revisarlos.</p>}
      </div>
    </div>
  );
}

function QueuePanel({ queue, onPrepare, onSendNext, onStart, onPause, isRunning }: { queue: QueueItem[]; onPrepare: () => void; onSendNext: () => void; onStart: () => void; onPause: () => void; isRunning: boolean }) {
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Cola de envío</h2>
      <div className="mt-4 grid gap-2">
        <button type="button" className="crm-button-secondary justify-center" onClick={onPrepare}><CheckCircle2 size={16} />Preparar cola aprobada</button>
        <button type="button" className="crm-button-primary justify-center" onClick={onSendNext}><Send size={16} />Enviar siguiente</button>
        <button type="button" className="crm-button-secondary justify-center" onClick={onStart} disabled={isRunning}><Play size={16} />Iniciar cola controlada</button>
        <button type="button" className="crm-button-danger justify-center" onClick={onPause}><Pause size={16} />Pausar cola</button>
      </div>
      <div className="mt-4 space-y-2">{queue.slice(0, 8).map((item) => <div key={item.id} className="crm-mini-card rounded-xl p-3"><p className="font-bold text-slate-900">{item.canal} · {item.status}</p>{item.error && <p className="text-xs text-red-500">{item.error}</p>}</div>)}</div>
    </div>
  );
}

function HistoryPanel({ history }: { history: AutomationHistory[] }) {
  return (
    <div className="crm-card p-5">
      <h2 className="crm-section-title">Historial</h2>
      <div className="mt-4 space-y-3">
        {history.slice(0, 20).map((item) => <div key={item.id} className="crm-mini-card rounded-xl p-3"><p className="font-bold text-slate-900">{item.canal} · {item.resultado}</p><p className="crm-muted text-xs">{item.fecha.slice(0, 16)} · {item.error || item.mensaje}</p></div>)}
        {history.length === 0 && <p className="crm-note text-sm">Sin envíos registrados.</p>}
      </div>
    </div>
  );
}
