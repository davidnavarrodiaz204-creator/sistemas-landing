'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, Flame, Clock, CalendarX, BellOff, Loader2, RefreshCw, Smartphone, ArrowRight } from 'lucide-react';

type AlertItem = {
  type: 'CALIENTE_SIN_CONTACTO' | 'INTERESADO_SIN_DEMO' | 'DEMO_VENCIDA' | 'SIN_RESPUESTA';
  prospectId: string;
  businessName: string;
  rubro: string;
  ciudad: string;
  phone: string;
  status: string;
  temperature: string;
  score: number;
  daysSinceLastContact: number | null;
};

const ALERT_CONFIG: Record<string, { icon: React.ReactNode; label: string; color: string; bg: string }> = {
  CALIENTE_SIN_CONTACTO: { icon: <Flame size={14} />, label: 'Caliente sin contactar', color: 'text-red-800', bg: 'bg-red-50' },
  INTERESADO_SIN_DEMO: { icon: <Clock size={14} />, label: 'Interesado sin demo', color: 'text-amber-800', bg: 'bg-amber-50' },
  DEMO_VENCIDA: { icon: <CalendarX size={14} />, label: 'Demo vencida', color: 'text-purple-800', bg: 'bg-purple-50' },
  SIN_RESPUESTA: { icon: <BellOff size={14} />, label: 'Sin respuesta 2+ días', color: 'text-sky-800', bg: 'bg-sky-50' },
};

export function SalesAlerts({ dbConnected }: { dbConnected: boolean }) {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAlerts = () => {
    if (!dbConnected) return;
    fetch('/api/crm/workday').then(r => r.json()).then(data => { setAlerts(data.alerts || []); setLoading(false); }).catch(() => { setAlerts([]); setLoading(false); });
  };

  useEffect(() => { if (dbConnected) fetch('/api/crm/workday').then(r => r.json()).then(data => { setAlerts(data.alerts || []); }).catch(() => {}); }, [dbConnected]);

  const openWhatsApp = (phone: string) => {
    if (!phone) return;
    const cleaned = phone.replace(/\D/g, '').replace(/^0+/, '');
    const number = cleaned.startsWith('51') ? cleaned : `51${cleaned}`;
    window.open(`https://wa.me/${number}`, '_blank');
  };

  if (!dbConnected) return null;
  if (!loading && alerts.length === 0) return null;

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle size={18} className="text-amber-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Alertas de seguimiento</p>
          {alerts.length > 0 && (
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-700">{alerts.length}</span>
          )}
        </div>
        <button type="button" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-2 py-1.5 text-[10px] font-bold text-slate-600 transition-all hover:bg-slate-100" onClick={() => { void fetchAlerts(); }}>
          <RefreshCw size={11} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-3"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-2">
          {alerts.map((alert, i) => {
            const cfg = ALERT_CONFIG[alert.type] || ALERT_CONFIG.CALIENTE_SIN_CONTACTO;
            return (
              <div key={`${alert.prospectId}-${i}`} className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${cfg.bg}`}>
                <div className="flex min-w-0 items-center gap-2">
                  <span className={cfg.color}>{cfg.icon}</span>
                  <div className="min-w-0">
                    <p className={`truncate text-xs font-bold ${cfg.color}`}>{alert.businessName}</p>
                    <p className="truncate text-[10px] text-slate-500">
                      {alert.rubro} · {alert.ciudad}
                      {alert.daysSinceLastContact != null && ` · ${alert.daysSinceLastContact}d`}
                    </p>
                  </div>
                </div>
                <button type="button" className="flex shrink-0 items-center gap-1 rounded-lg bg-white px-2.5 py-1.5 text-[10px] font-bold text-emerald-600 shadow-sm transition-all hover:bg-emerald-50 active:scale-[0.97]" onClick={() => openWhatsApp(alert.phone)}>
                  <Smartphone size={11} /> WhatsApp <ArrowRight size={11} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}