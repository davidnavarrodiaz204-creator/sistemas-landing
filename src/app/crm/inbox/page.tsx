'use client';

import { useEffect, useMemo, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import {
  getProspects as getStoredProspects,
  updateProspect as updateStoredProspect,
} from '@/lib/crm-storage/crmStorage';
import type { CrmProspectRecord } from '@/lib/crm-storage/crmStorage.types';
import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Inbox,
  MessageCircle,
  RefreshCw,
  Save,
  Search,
  Wifi,
} from 'lucide-react';

type InboxFilter = 'Sin responder' | 'Respondio' | 'Interesado' | 'Demo' | 'Cliente';

type InboxProspect = CrmProspectRecord & {
  rubro: string;
  zona: string;
  contacto: string;
  telefono: string;
  interes: string;
  estado: string;
  fechaUltimoContacto: string;
  fechaProximoContacto: string;
  nota: string;
  permisoContacto: string;
  ultimoMensajeEnviado: string;
  fechaUltimoMensaje: string;
  cantidadMensajesEnviados: number;
  respuestaCliente: string;
  estadoConversacion: string;
  proximaAccion: string;
  historialMensajes: Array<{
    id?: string;
    message?: string;
    status?: string;
    createdAt?: string;
  }>;
};

type OpenWaHealth = {
  status?: string;
  mode?: string;
  message?: string;
  sentToday?: number;
  remainingToday?: number;
};

const FILTERS: InboxFilter[] = ['Sin responder', 'Respondio', 'Interesado', 'Demo', 'Cliente'];

function normalizeProspect(raw: Partial<InboxProspect>): InboxProspect {
  return {
    id: raw.id || `prospect-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    negocio: raw.negocio || '',
    rubro: raw.rubro || 'Otro',
    zona: raw.zona || '',
    contacto: raw.contacto || '',
    telefono: raw.telefono || '',
    redSocial: raw.redSocial || '',
    interes: raw.interes || 'Ambos',
    estado: raw.estado || 'Nuevo',
    fechaUltimoContacto: raw.fechaUltimoContacto || '',
    fechaProximoContacto: raw.fechaProximoContacto || '',
    nota: raw.nota || '',
    origen: raw.origen || 'Otro',
    permisoContacto: raw.permisoContacto || 'Pendiente',
    ultimoMensajeEnviado: raw.ultimoMensajeEnviado || '',
    fechaUltimoMensaje: raw.fechaUltimoMensaje || '',
    cantidadMensajesEnviados: Number(raw.cantidadMensajesEnviados || 0),
    respuestaCliente: raw.respuestaCliente || '',
    estadoConversacion: raw.estadoConversacion || 'Sin respuesta',
    proximaAccion: String(raw.proximaAccion || ''),
    historialMensajes: Array.isArray(raw.historialMensajes) ? raw.historialMensajes : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    isDemo: Boolean(raw.isDemo),
  };
}

function lastMessage(prospect: InboxProspect) {
  if (prospect.respuestaCliente) return prospect.respuestaCliente;
  const last = prospect.historialMensajes[prospect.historialMensajes.length - 1];
  return last?.message || prospect.ultimoMensajeEnviado || 'Sin mensajes todavia';
}

function lastDate(prospect: InboxProspect) {
  const last = prospect.historialMensajes[prospect.historialMensajes.length - 1];
  return last?.createdAt || prospect.fechaUltimoMensaje || prospect.fechaUltimoContacto || prospect.createdAt;
}

function isAnswered(prospect: InboxProspect) {
  return Boolean(prospect.respuestaCliente)
    || prospect.estadoConversacion.includes('Respond')
    || prospect.estadoConversacion === 'Interesado'
    || prospect.estado === 'Interesado'
    || prospect.estado.includes('Demo')
    || prospect.estado === 'Cerrado';
}

function matchesFilter(prospect: InboxProspect, filter: InboxFilter) {
  if (filter === 'Sin responder') return !isAnswered(prospect);
  if (filter === 'Respondio') return isAnswered(prospect);
  if (filter === 'Interesado') return prospect.estado === 'Interesado' || prospect.estadoConversacion === 'Interesado';
  if (filter === 'Demo') return prospect.estado.includes('Demo') || prospect.estadoConversacion.includes('Demo');
  return prospect.estado === 'Cerrado';
}

function formatDate(value: string) {
  if (!value) return 'Sin fecha';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium', timeStyle: 'short' }).format(date);
}

export default function CrmInboxPage() {
  return (
    <InternalGuard>
      <InboxApp />
    </InternalGuard>
  );
}

function InboxApp() {
  const [prospects, setProspects] = useState<InboxProspect[]>([]);
  const [activeId, setActiveId] = useState('');
  const [filter, setFilter] = useState<InboxFilter>('Respondio');
  const [search, setSearch] = useState('');
  const [health, setHealth] = useState<OpenWaHealth>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getStoredProspects<InboxProspect>([], normalizeProspect).then((items) => {
      setProspects(items);
      setActiveId(items.find(isAnswered)?.id || items[0]?.id || '');
    });
    void refreshOpenWa();
  }, []);

  async function refreshOpenWa() {
    try {
      const response = await fetch('/api/whatsapp/send', { method: 'GET' });
      const data = await response.json();
      setHealth(data);
    } catch {
      setHealth({ status: 'error', message: 'No se pudo revisar OpenWA.' });
    }
  }

  const visibleProspects = useMemo(() => {
    const query = search.trim().toLowerCase();
    return prospects
      .filter((item) => matchesFilter(item, filter))
      .filter((item) => !query
        || item.negocio.toLowerCase().includes(query)
        || item.contacto.toLowerCase().includes(query)
        || item.telefono.toLowerCase().includes(query)
        || item.zona.toLowerCase().includes(query))
      .sort((a, b) => new Date(lastDate(b)).getTime() - new Date(lastDate(a)).getTime());
  }, [filter, prospects, search]);

  const active = prospects.find((item) => item.id === activeId) || visibleProspects[0] || prospects[0];

  const updateActive = async (patch: Partial<InboxProspect>) => {
    if (!active) return;
    setSaving(true);
    const next = prospects.map((item) => item.id === active.id ? { ...item, ...patch } : item);
    setProspects(next);
    const saved = await updateStoredProspect<InboxProspect>(active.id, patch, prospects);
    setProspects(saved);
    setSaving(false);
  };

  const markStatus = (nextStatus: string) => {
    if (!active) return;
    const patch: Partial<InboxProspect> = {
      estadoConversacion: nextStatus,
      fechaUltimoContacto: new Date().toISOString().slice(0, 10),
    };
    if (nextStatus === 'Interesado') patch.estado = 'Interesado';
    if (nextStatus === 'Demo activa') patch.estado = 'Demo activa';
    if (nextStatus === 'No contactar') patch.permisoContacto = 'No contactar';
    void updateActive(patch);
  };

  const openWhatsApp = () => {
    if (!active?.telefono) return;
    const phone = active.telefono.replace(/\D/g, '').replace(/^0+/, '');
    window.open(`https://wa.me/${phone.startsWith('51') ? phone : `51${phone}`}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 text-slate-950 transition dark:bg-[#050811] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a href="/crm" className="crm-button-ghost mb-4 inline-flex min-h-0 px-3 py-2 text-sm">
              <ArrowLeft size={15} /> Volver al CRM
            </a>
            <p className="crm-eyebrow mb-2">CRM FACTUSYS</p>
            <h1 className="crm-title">Bandeja de conversaciones</h1>
            <p className="crm-muted mt-2 max-w-2xl text-sm">
              Controla respuestas, notas y seguimientos como WhatsApp Business, sin enviar mensajes automaticos.
            </p>
          </div>
          <OpenWaCard health={health} onRefresh={refreshOpenWa} />
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {FILTERS.map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setFilter(item)}
              className={`crm-card p-4 text-left transition hover:-translate-y-0.5 ${filter === item ? 'border-neon shadow-[0_18px_50px_rgba(0,194,167,0.16)]' : ''}`}
            >
              <p className="crm-muted text-xs font-bold uppercase">{item}</p>
              <p className="crm-number mt-2 text-2xl">{prospects.filter((prospect) => matchesFilter(prospect, item)).length}</p>
            </button>
          ))}
        </section>

        <section className="mt-6 grid min-h-[680px] gap-5 lg:grid-cols-[380px_1fr]">
          <div className="crm-card overflow-hidden">
            <div className="border-b border-black/10 p-4 dark:border-white/10">
              <div className="relative">
                <Search size={16} className="crm-search-icon" />
                <input
                  className="crm-input pl-10"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Buscar negocio, contacto, zona..."
                />
              </div>
            </div>
            <div className="max-h-[620px] overflow-y-auto">
              {visibleProspects.length === 0 && (
                <div className="p-8 text-center">
                  <Inbox className="mx-auto mb-3 text-neon" />
                  <p className="font-bold">No hay conversaciones en este filtro.</p>
                  <p className="crm-muted mt-1 text-sm">Marca respuestas desde el CRM o agrega prospectos nuevos.</p>
                </div>
              )}
              {visibleProspects.map((prospect) => (
                <button
                  key={prospect.id}
                  type="button"
                  onClick={() => setActiveId(prospect.id)}
                  className={`block w-full border-b border-black/5 p-4 text-left transition hover:bg-black/[0.03] dark:border-white/10 dark:hover:bg-white/[0.04] ${active?.id === prospect.id ? 'bg-neon/10' : ''}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-slate-950 dark:text-white">{prospect.negocio || 'Sin nombre'}</p>
                      <p className="crm-muted text-xs">{prospect.rubro} · {prospect.zona || 'Sin zona'}</p>
                    </div>
                    <StatusBadge prospect={prospect} />
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm">{lastMessage(prospect)}</p>
                  <p className="crm-muted mt-2 text-xs">{formatDate(lastDate(prospect))}</p>
                </button>
              ))}
            </div>
          </div>

          {active ? (
            <ConversationPanel
              prospect={active}
              saving={saving}
              onUpdate={updateActive}
              onMark={markStatus}
              onOpenWhatsApp={openWhatsApp}
            />
          ) : (
            <div className="crm-card flex items-center justify-center p-10 text-center">
              <div>
                <MessageCircle className="mx-auto mb-3 text-neon" />
                <p className="font-bold">Selecciona una conversacion</p>
                <p className="crm-muted mt-1 text-sm">Aqui veras mensajes, notas y seguimiento.</p>
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

function OpenWaCard({ health, onRefresh }: { health: OpenWaHealth; onRefresh: () => void }) {
  const connected = health.status === 'connected';
  const label = connected ? 'OpenWA conectado' : health.status === 'not_configured' ? 'OpenWA simulado' : 'OpenWA pendiente';
  return (
    <div className="crm-card min-w-[280px] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="crm-muted text-xs font-bold uppercase">Estado de mensajes</p>
          <p className="mt-1 font-bold">{label}</p>
          <p className="crm-muted mt-1 text-xs">{health.message || 'Listo para revisar conexion.'}</p>
        </div>
        <Wifi className={connected ? 'text-neon' : 'text-yellow-500'} />
      </div>
      <button type="button" className="crm-button-secondary mt-3 w-full justify-center" onClick={onRefresh}>
        <RefreshCw size={15} /> Probar conexion
      </button>
    </div>
  );
}

function StatusBadge({ prospect }: { prospect: InboxProspect }) {
  const label = prospect.estado === 'Cerrado'
    ? 'Cliente'
    : prospect.estado.includes('Demo')
      ? 'Demo'
      : prospect.estado === 'Interesado' || prospect.estadoConversacion === 'Interesado'
        ? 'Interesado'
        : isAnswered(prospect)
          ? 'Respondio'
          : 'Sin responder';

  return <span className="rounded-full border border-neon/30 bg-neon/10 px-2 py-1 text-[11px] font-bold text-neon">{label}</span>;
}

function ConversationPanel({
  prospect,
  saving,
  onUpdate,
  onMark,
  onOpenWhatsApp,
}: {
  prospect: InboxProspect;
  saving: boolean;
  onUpdate: (patch: Partial<InboxProspect>) => void;
  onMark: (status: string) => void;
  onOpenWhatsApp: () => void;
}) {
  return (
    <div className="crm-card overflow-hidden">
      <div className="border-b border-black/10 p-5 dark:border-white/10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="crm-muted text-xs font-bold uppercase">{prospect.rubro} · {prospect.interes}</p>
            <h2 className="mt-1 text-2xl font-black">{prospect.negocio}</h2>
            <p className="crm-muted mt-1 text-sm">{prospect.contacto || 'Contacto pendiente'} · {prospect.telefono || 'Sin WhatsApp'}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="crm-button-primary justify-center" onClick={onOpenWhatsApp}>
              <MessageCircle size={16} /> Abrir WhatsApp
            </button>
            <button type="button" className="crm-button-secondary justify-center" onClick={() => onMark('Respondio')}>
              <CheckCircle2 size={16} /> Respondio
            </button>
          </div>
        </div>
      </div>

      <div className="grid gap-5 p-5 xl:grid-cols-[1fr_320px]">
        <div>
          <div className="rounded-[1.25rem] bg-[#e8f4ef] p-4 dark:bg-white/5">
            <p className="crm-muted text-xs font-bold uppercase">Ultimo mensaje / respuesta</p>
            <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{lastMessage(prospect)}</p>
            <p className="crm-muted mt-3 text-xs">{formatDate(lastDate(prospect))}</p>
          </div>

          <div className="mt-4 space-y-3">
            {prospect.historialMensajes.length === 0 && (
              <p className="crm-note text-sm">Todavia no hay historial guardado. Cuando uses OpenWA o guardes respuestas, apareceran aqui.</p>
            )}
            {prospect.historialMensajes.slice().reverse().slice(0, 8).map((item, index) => (
              <div key={`${item.createdAt || index}-${item.status || 'message'}`} className="rounded-2xl border border-black/10 p-3 dark:border-white/10">
                <p className="crm-muted text-xs">{item.status || 'mensaje'} · {formatDate(item.createdAt || '')}</p>
                <p className="mt-1 text-sm">{item.message || 'Sin texto'}</p>
              </div>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <label className="block">
            <span className="crm-label">Estado</span>
            <select className="crm-input" value={prospect.estadoConversacion} onChange={(event) => onMark(event.target.value)}>
              {['Sin respuesta', 'Respondio', 'Interesado', 'Demo activa', 'No contactar'].map((item) => <option key={item}>{item}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="crm-label">Proxima accion</span>
            <input className="crm-input" value={prospect.proximaAccion} onChange={(event) => onUpdate({ proximaAccion: event.target.value })} placeholder="Ej. llamar, enviar demo, confirmar reunion" />
          </label>
          <label className="block">
            <span className="crm-label">Fecha seguimiento</span>
            <input className="crm-input" type="date" value={prospect.fechaProximoContacto} onChange={(event) => onUpdate({ fechaProximoContacto: event.target.value })} />
          </label>
          <label className="block">
            <span className="crm-label">Respuesta del cliente</span>
            <textarea className="crm-input min-h-24 resize-none" value={prospect.respuestaCliente} onChange={(event) => onUpdate({ respuestaCliente: event.target.value, estadoConversacion: event.target.value ? 'Respondio' : prospect.estadoConversacion })} />
          </label>
          <label className="block">
            <span className="crm-label">Notas internas</span>
            <textarea className="crm-input min-h-32 resize-none" value={prospect.nota} onChange={(event) => onUpdate({ nota: event.target.value })} />
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" className="crm-button-secondary justify-center" onClick={() => onMark('Interesado')}>Interesado</button>
            <button type="button" className="crm-button-secondary justify-center" onClick={() => onMark('Demo activa')}>Demo</button>
            <button type="button" className="crm-button-secondary justify-center" onClick={() => onUpdate({ estado: 'Cerrado', estadoConversacion: 'Interesado' })}>Cliente</button>
            <button type="button" className="crm-button-ghost justify-center" onClick={() => onMark('No contactar')}>No contactar</button>
          </div>
          <p className="crm-muted flex items-center gap-2 text-xs">
            <Save size={14} /> {saving ? 'Guardando...' : 'Cambios guardados en el CRM'}
          </p>
          <p className="crm-note text-xs">
            <CalendarClock size={14} className="mr-1 inline" /> Esta bandeja usa los mismos prospectos del CRM. OpenWA se conectara aqui cuando el bridge este activo.
          </p>
        </aside>
      </div>
    </div>
  );
}
