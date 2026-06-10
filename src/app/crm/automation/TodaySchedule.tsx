'use client';

import { useEffect, useState } from 'react';
import { Calendar, Clock, Loader2, RefreshCw, Wifi, Monitor } from 'lucide-react';

type DemoItem = {
  id: string; business_name: string; phone: string; rubro: string; ciudad: string;
  product: string; scheduled_at: string; status: string; notes: string;
};

type InstItem = {
  id: string; business_name: string; phone: string; rubro: string; ciudad: string;
  product: string; scheduled_at: string; status: string; type: string;
  needs_printer: boolean; needs_initial_inventory: boolean;
};

export function TodaySchedule({ dbConnected }: { dbConnected: boolean }) {
  const [demos, setDemos] = useState<DemoItem[]>([]);
  const [installations, setInstallations] = useState<InstItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbConnected) return;
    Promise.all([fetch('/api/crm/demos?scope=today'), fetch('/api/crm/installations?scope=today')])
      .then(([dRes, iRes]) => Promise.all([dRes.json(), iRes.json()]))
      .then(([dData, iData]) => { if (dData.ok) setDemos(dData.demos || []); if (iData.ok) setInstallations(iData.installations || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [dbConnected]);

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' }); } catch { return iso; }
  };

  if (!dbConnected) return null;

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Calendar size={18} className="text-slate-500" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Agenda de hoy</p>
        </div>
        <button type="button" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97]" onClick={() => { setLoading(true); Promise.all([fetch('/api/crm/demos?scope=today'), fetch('/api/crm/installations?scope=today')]).then(([dRes, iRes]) => Promise.all([dRes.json(), iRes.json()])).then(([dData, iData]) => { if (dData.ok) setDemos(dData.demos || []); if (iData.ok) setInstallations(iData.installations || []); setLoading(false); }).catch(() => setLoading(false)); }}>
          <RefreshCw size={12} />
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="space-y-3">
          {demos.length === 0 && installations.length === 0 && (
            <p className="text-center text-xs text-slate-400">Sin actividades agendadas para hoy</p>
          )}

          {demos.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-purple-500">
                <Wifi size={12} /> Demos ({demos.length})
              </p>
              {demos.map((d) => (
                <div key={d.id} className="mb-2 rounded-xl border border-purple-100 bg-purple-50/50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{d.business_name}</p>
                    <span className="flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-[10px] font-bold text-purple-700">
                      <Clock size={10} /> {formatTime(d.scheduled_at)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{d.product} · {d.rubro} · {d.ciudad}</p>
                  {d.notes && <p className="mt-1 text-[10px] text-slate-400">{d.notes}</p>}
                </div>
              ))}
            </div>
          )}

          {installations.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-[10px] font-bold uppercase text-cyan-500">
                <Monitor size={12} /> Instalaciones ({installations.length})
              </p>
              {installations.map((i) => (
                <div key={i.id} className="mb-2 rounded-xl border border-cyan-100 bg-cyan-50/50 p-3 dark:border-cyan-800 dark:bg-cyan-900/20">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{i.business_name}</p>
                    <span className="flex items-center gap-1 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-bold text-cyan-700">
                      <Clock size={10} /> {i.scheduled_at ? formatTime(i.scheduled_at) : 'Sin hora'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{i.product} · {i.type} · {i.rubro}</p>
                  <div className="mt-1 flex gap-2">
                    {i.needs_printer && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">Impresora</span>}
                    {i.needs_initial_inventory && <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">Inventario inicial</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}