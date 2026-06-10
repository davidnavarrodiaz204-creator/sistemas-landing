'use client';

import { useEffect, useState } from 'react';
import { Play, Square, Loader2, RefreshCw, TrendingUp, Users, Calendar, Bell, Target } from 'lucide-react';

type WorkdayData = {
  id: string;
  date: string;
  started_at: string | null;
  closed_at: string | null;
  meta_diaria: number;
};

type StatsData = {
  contactsToday: number;
  interestedToday: number;
  demosToday: number;
  pendingFollowUps: number;
};

export function WorkdayPanel({ onRefresh }: { onRefresh?: () => void }) {
  const [workday, setWorkday] = useState<WorkdayData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/workday');
      const data = await res.json();
      if (data.ok) {
        setWorkday(data.workday);
        setStats(data.stats);
      }
    } catch { /* ignore */ }
    setLoading(false);
  };

  useEffect(() => { fetch('/api/crm/workday').then(r => r.json()).then(data => { if (data.ok) { setWorkday(data.workday); setStats(data.stats); } setLoading(false); }).catch(() => setLoading(false)); }, []);

  const doAction = async (action: string, meta?: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/crm/workday', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, meta }),
      });
      const data = await res.json();
      if (data.ok) {
        setWorkday(data.workday);
        await fetchData();
        onRefresh?.();
      }
    } catch { /* ignore */ }
    setActionLoading(false);
  };

  const isActive = workday?.started_at && !workday?.closed_at;
  const progress = stats ? Math.round((stats.contactsToday / (workday?.meta_diaria || 10)) * 100) : 0;

  if (loading) {
    return (
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center justify-center py-4"><Loader2 size={20} className="animate-spin text-slate-400" /></div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp size={20} className="text-slate-500" />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Jornada de hoy</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">
              {isActive ? 'Jornada activa' : workday?.closed_at ? 'Jornada cerrada' : 'Sin iniciar'}
            </h2>
          </div>
        </div>
        <div className="flex gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300" onClick={() => { void fetchData(); }}>
            <RefreshCw size={13} /> Actualizar
          </button>
          {!isActive && !workday?.closed_at && (
            <button type="button" disabled={actionLoading} className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-50" onClick={() => doAction('start')}>
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
              Iniciar jornada
            </button>
          )}
          {isActive && (
            <button type="button" disabled={actionLoading} className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-amber-600 active:scale-[0.97] disabled:opacity-50" onClick={() => { if (window.confirm('¿Cerrar jornada? No podrás agregar más contactos hoy sin reabrirla.')) doAction('close'); }}>
              {actionLoading ? <Loader2 size={13} className="animate-spin" /> : <Square size={13} />}
              Cerrar jornada
            </button>
          )}
        </div>
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={<Users size={16} />} label="Contactos hoy" value={stats?.contactsToday ?? 0} color="text-blue-600" />
        <StatCard icon={<TrendingUp size={16} />} label="Interesados" value={stats?.interestedToday ?? 0} color="text-emerald-600" />
        <StatCard icon={<Calendar size={16} />} label="Demos agendadas" value={stats?.demosToday ?? 0} color="text-purple-600" />
        <StatCard icon={<Bell size={16} />} label="Seguimientos" value={stats?.pendingFollowUps ?? 0} color="text-amber-600" />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs">
          <span className="flex items-center gap-1 font-bold text-slate-500"><Target size={13} /> Meta: {workday?.meta_diaria || 10} contactos</span>
          <span className="font-bold text-slate-500">{stats?.contactsToday ?? 0} / {workday?.meta_diaria || 10}</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-emerald-500 transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-[10px] text-slate-400">
          {progress >= 100 ? '¡Meta cumplida!' : `${progress}% de la meta diaria`}
        </p>
      </div>

      {workday?.started_at && (
        <p className="mt-3 text-[10px] text-slate-400">
          Iniciada: {new Date(workday.started_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}
          {workday?.closed_at && ` · Cerrada: ${new Date(workday.closed_at).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' })}`}
        </p>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
      <div className={`mb-1 ${color}`}>{icon}</div>
      <p className="text-lg font-black text-slate-900 dark:text-white">{value}</p>
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
    </div>
  );
}