'use client';

import { useEffect, useState } from 'react';
import { Copy, Smartphone, CheckCircle, XCircle, Calendar, Loader2, RefreshCw, Bell } from 'lucide-react';
import { generateWhatsAppByType, type MessageVariantInput } from '@/lib/crm-automation/messageVariator';

type FollowUpItem = {
  id: string;
  prospect_id: string;
  type: string;
  note: string;
  due_date: string | null;
  done_at: string | null;
  created_at: string;
  business_name: string;
  phone: string;
  rubro: string;
  ciudad: string;
  temperature: string;
  status: string;
  score: number;
};

function getFirstName(name: string): string {
  const parts = name.trim().split(/\s+/);
  return (parts[0] || '').charAt(0).toUpperCase() + (parts[0] || '').slice(1).toLowerCase();
}

function mapFollowUpTypeToEstado(type: string): string {
  switch (type) {
    case 'PRIMER_CONTACTO': return 'Nuevo';
    case 'RECORDATORIO': return 'SEGUNDO_INTENTO';
    case 'DEMO': return 'SEGUIMIENTO_DEMO';
    case 'SOPORTE': return 'Demo activa';
    case 'CIERRE': return 'CIERRE_SUAVE';
    default: return 'Nuevo';
  }
}

function generateMessage(item: FollowUpItem): string {
  const input: MessageVariantInput = {
    negocio: item.business_name,
    rubro: item.rubro,
    ciudad: item.ciudad || '',
    contacto: getFirstName(item.business_name),
    estado: mapFollowUpTypeToEstado(item.type),
    channel: 'whatsapp_manual',
    product: (item.rubro === 'Ferretería' || item.rubro === 'Minimarket') ? 'FERRO' : 'RESTO',
  };
  return generateWhatsAppByType(input);
}

function getTypeLabel(type: string): string {
  switch (type) {
    case 'PRIMER_CONTACTO': return 'Primer contacto';
    case 'RECORDATORIO': return 'Recordatorio';
    case 'DEMO': return 'Seguimiento demo';
    case 'SOPORTE': return 'Soporte';
    case 'CIERRE': return 'Cierre';
    default: return type;
  }
}

function getTypeColor(type: string): string {
  switch (type) {
    case 'PRIMER_CONTACTO': return 'bg-blue-100 text-blue-700';
    case 'RECORDATORIO': return 'bg-amber-100 text-amber-700';
    case 'DEMO': return 'bg-purple-100 text-purple-700';
    case 'SOPORTE': return 'bg-emerald-100 text-emerald-700';
    case 'CIERRE': return 'bg-slate-100 text-slate-600';
    default: return 'bg-slate-100 text-slate-600';
  }
}

export function TodaysFollowUps({
  dbConnected,
  onRefresh,
}: {
  dbConnected: boolean;
  onRefresh?: () => void;
}) {
  const [followUps, setFollowUps] = useState<FollowUpItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  const fetchFollowUps = async () => {
    if (!dbConnected) { setLoading(false); return; }
    setLoading(true);
    try {
      const res = await fetch('/api/crm/follow-ups');
      const data = await res.json();
      setFollowUps(data.followUps || []);
    } catch {
      setFollowUps([]);
    }
    setLoading(false);
  };

  useEffect(() => { if (dbConnected) fetch('/api/crm/follow-ups').then(r => r.json()).then(data => { setFollowUps(data.followUps || []); setLoading(false); }).catch(() => { setFollowUps([]); setLoading(false); }); }, [dbConnected]);

  const doAction = async (action: string, followUpId: string, prospectId?: string, extra?: Record<string, string>) => {
    setActionLoading(followUpId);
    try {
      const res = await fetch('/api/crm/follow-ups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, id: followUpId, prospectId, ...extra }),
      });
      const data = await res.json();
      if (data.ok) {
        setMessage(extra?.note || 'Actualizado.');
        await fetchFollowUps();
        onRefresh?.();
      } else {
        setMessage(data.message || 'Error.');
      }
    } catch {
      setMessage('Error de conexión.');
    }
    setActionLoading(null);
  };

  const copyMessage = (msg: string) => {
    navigator.clipboard.writeText(msg).then(() => setMessage('Copiado.')).catch(() => setMessage('No se pudo copiar.'));
  };

  const openWhatsApp = (phone: string, msg: string) => {
    const cleaned = phone.replace(/\D/g, '').replace(/^0+/, '');
    const number = cleaned.startsWith('51') ? cleaned : `51${cleaned}`;
    window.open(`https://wa.me/${number}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  if (!dbConnected) {
    return (
      <div className="rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-800 dark:bg-amber-900/20">
        <div className="flex items-center gap-3">
          <Bell size={24} className="text-amber-500" />
          <div>
            <p className="font-bold text-amber-900 dark:text-amber-200">Seguimientos del día</p>
            <p className="text-sm text-amber-700 dark:text-amber-400">Conecta PostgreSQL con DATABASE_URL para ver seguimientos automáticos. Los follow-ups se crean al marcar estados.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell size={20} className="text-slate-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Seguimientos del día</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {loading ? 'Cargando...' : `${followUps.length} pendientes`}
            </h2>
          </div>
        </div>
        <button
          type="button"
          className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
          onClick={() => { void fetchFollowUps(); }}
        >
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {message && (
        <div className="mb-4 rounded-xl bg-emerald-100 px-4 py-2 text-xs font-bold text-emerald-800">{message}</div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 size={24} className="animate-spin text-slate-400" /></div>
      ) : followUps.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-8 text-center dark:border-slate-700">
          <Bell size={32} className="mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-400">No hay seguimientos pendientes hoy</p>
          <p className="text-xs text-slate-400">Los seguimientos se generan automáticamente al cambiar el estado de un prospecto.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {followUps.map((item) => {
            const msg = generateMessage(item);
            const isDue = item.due_date && new Date(item.due_date) <= new Date();
            return (
              <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
                <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-base font-black text-slate-900 dark:text-white">{item.business_name}</p>
                      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${getTypeColor(item.type)}`}>{getTypeLabel(item.type)}</span>
                      {item.temperature && (
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          item.temperature === 'CALIENTE' ? 'bg-red-100 text-red-700' :
                          item.temperature === 'TIBIO' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-200 text-slate-600'
                        }`}>{item.temperature}</span>
                      )}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">
                      {item.rubro} · {item.ciudad} · {item.phone || 'sin teléfono'}
                      {item.due_date && (
                        <span className={`ml-2 ${isDue ? 'font-bold text-red-600' : ''}`}>
                          · Vence: {new Date(item.due_date).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                          {isDue && ' (vencido)'}
                        </span>
                      )}
                    </p>
                    {item.note && <p className="mt-1 text-xs italic text-slate-500">{item.note}</p>}
                  </div>
                </div>

                <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 text-sm italic text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {msg}
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97] disabled:opacity-40 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                    onClick={() => copyMessage(msg)}
                  >
                    <Copy size={13} /> Copiar
                  </button>
                  {item.phone && (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-40"
                      onClick={() => openWhatsApp(item.phone, msg)}
                    >
                      <Smartphone size={13} /> WhatsApp
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={actionLoading === item.id}
                    className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-800 transition-all hover:bg-emerald-100 active:scale-[0.97] disabled:opacity-40"
                    onClick={() => doAction('done', item.id, undefined, { note: 'Seguimiento completado.' })}
                  >
                    {actionLoading === item.id ? <Loader2 size={13} className="animate-spin" /> : <CheckCircle size={13} />}
                    Hecho
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === item.id}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-800 transition-all hover:bg-amber-100 active:scale-[0.97] disabled:opacity-40"
                    onClick={() => {
                      const tomorrow = new Date(Date.now() + 86400000).toISOString();
                      doAction('reschedule', item.id, undefined, { dueDate: tomorrow, note: 'Reprogramado para mañana.' });
                    }}
                  >
                    {actionLoading === item.id ? <Loader2 size={13} className="animate-spin" /> : <Calendar size={13} />}
                    Reprogramar mañana
                  </button>
                  <button
                    type="button"
                    disabled={actionLoading === item.id}
                    className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-xs font-bold text-red-800 transition-all hover:bg-red-100 active:scale-[0.97] disabled:opacity-40"
                    onClick={() => doAction('block', item.id, item.prospect_id, { note: 'Cliente bloqueado desde seguimiento.' })}
                  >
                    {actionLoading === item.id ? <Loader2 size={13} className="animate-spin" /> : <XCircle size={13} />}
                    No contactar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}