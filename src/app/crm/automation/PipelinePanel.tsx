'use client';

import { useEffect, useState } from 'react';
import { Smartphone, Loader2, RefreshCw, Layers } from 'lucide-react';

const STATUSES = ['NUEVO', 'CONTACTADO', 'INTERESADO', 'DEMO_AGENDADA', 'DEMO_ACTIVA', 'INSTALACION', 'PRODUCCION', 'NO_CONTACTAR'];
const STATUS_LABELS: Record<string, string> = {
  NUEVO: 'Nuevo', CONTACTADO: 'Contactado', INTERESADO: 'Interesado',
  DEMO_AGENDADA: 'Demo agendada', DEMO_ACTIVA: 'Demo activa',
  INSTALACION: 'Instalación', PRODUCCION: 'Producción', NO_CONTACTAR: 'No contactar',
};
const STATUS_COLORS: Record<string, string> = {
  NUEVO: 'bg-blue-500', CONTACTADO: 'bg-amber-500', INTERESADO: 'bg-emerald-500',
  DEMO_AGENDADA: 'bg-purple-500', DEMO_ACTIVA: 'bg-indigo-500',
  INSTALACION: 'bg-cyan-500', PRODUCCION: 'bg-slate-500', NO_CONTACTAR: 'bg-red-500',
};

type PipelineProspect = {
  id: string;
  business_name: string;
  rubro: string;
  ciudad: string;
  phone: string;
  temperature: string;
  score: number;
  status: string;
};

export function PipelinePanel({ dbConnected, onSelectProspect }: { dbConnected: boolean; onSelectProspect?: (prospectId: string) => void }) {
  const [groups, setGroups] = useState<Record<string, PipelineProspect[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!dbConnected) return;
    fetch('/api/crm/prospects?limit=100').then(r => r.json()).then(data => {
      if (data.ok && data.prospects) {
        const grouped: Record<string, PipelineProspect[]> = {};
        for (const s of STATUSES) grouped[s] = [];
        for (const p of data.prospects) {
          const st = p.status || 'NUEVO';
          if (grouped[st]) grouped[st].push(p);
          else grouped.NUEVO.push(p);
        }
        setGroups(grouped);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [dbConnected]);

  const openWhatsApp = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '').replace(/^0+/, '');
    window.open(`https://wa.me/${cleaned.startsWith('51') ? cleaned : '51' + cleaned}`, '_blank');
  };

  if (!dbConnected) return null;

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Layers size={20} className="text-slate-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Pipeline de ventas</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Tubería comercial</h2>
          </div>
        </div>
        <button type="button" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97]" onClick={() => { setLoading(true); fetch('/api/crm/prospects?limit=100').then(r => r.json()).then(data => { if (data.ok && data.prospects) { const grouped: Record<string, PipelineProspect[]> = {}; for (const s of STATUSES) grouped[s] = []; for (const p of data.prospects) { const st = p.status || 'NUEVO'; if (grouped[st]) grouped[st].push(p); else grouped.NUEVO.push(p); } setGroups(grouped); } setLoading(false); }).catch(() => setLoading(false)); }}>
          <RefreshCw size={13} /> Actualizar
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-6"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
      ) : (
        <div className="flex gap-3 overflow-x-auto pb-2">
          {STATUSES.map((st) => {
            const items = groups[st] || [];
            return (
              <div key={st} className="min-w-[160px] shrink-0">
                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${STATUS_COLORS[st] || 'bg-slate-400'}`} />
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{STATUS_LABELS[st] || st}</span>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.slice(0, 5).map((p) => (
                    <div
                      key={p.id}
                      className="cursor-pointer rounded-xl border border-slate-100 bg-slate-50 p-2.5 transition-colors hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800"
                      onClick={() => onSelectProspect?.(p.id)}
                    >
                      <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{p.business_name}</p>
                      <p className="truncate text-[10px] text-slate-400">{p.rubro} · {p.ciudad}</p>
                      <div className="mt-1 flex items-center justify-between">
                        <span className={`text-[10px] font-bold ${p.temperature === 'CALIENTE' ? 'text-red-600' : p.temperature === 'TIBIO' ? 'text-amber-600' : 'text-slate-400'}`}>
                          {p.score || 0}
                        </span>
                        {p.phone && (
                          <button
                            type="button"
                            className="rounded-lg bg-emerald-100 p-1 text-emerald-700 transition-colors hover:bg-emerald-200"
                            onClick={(e) => { e.stopPropagation(); openWhatsApp(p.phone); }}
                          >
                            <Smartphone size={11} />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  {items.length === 0 && (
                    <p className="text-center text-[10px] text-slate-300">—</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}