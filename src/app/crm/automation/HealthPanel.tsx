'use client';

import { useEffect, useState } from 'react';
import { Database, RefreshCw, Loader2, AlertTriangle, Download, Upload } from 'lucide-react';

type HealthData = {
  ok: boolean;
  status: string;
  prospectCount: number;
  followUpCount: number;
  demosAgendadas: number;
  instalacionesPendientes: number;
  lastErrors: Array<{ event: string; detail: string; created_at: string }>;
};

export function HealthPanel({ dbConnected }: { dbConnected: boolean }) {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(false);
  const [backupMsg, setBackupMsg] = useState('');
  const [restoreMsg, setRestoreMsg] = useState('');

  useEffect(() => {
    if (!dbConnected) return;
    fetch('/api/crm/db-status').then(r => r.json()).then(d => { setHealth(d); }).catch(() => { setHealth(null); });
  }, [dbConnected]);

  const downloadBackup = async () => {
    setBackupMsg('Exportando...');
    try {
      const res = await fetch('/api/crm/backup');
      const data = await res.json();
      if (!data.ok) { setBackupMsg(data.message || 'Error'); return; }
      const blob = new Blob([JSON.stringify(data.backup, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `factusys-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setBackupMsg(`Backup descargado: ${Object.values(data.summary).reduce((a: number, b: unknown) => a + (b as number), 0)} registros.`);
    } catch {
      setBackupMsg('Error al exportar.');
    }
  };

  const restoreBackup = async () => {
    if (!window.confirm('¿Restaurar backup? Esto insertará registros que no existan. Los duplicados se omitirán. ¿Continuar?')) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      setRestoreMsg('Restaurando...');
      try {
        const text = await file.text();
        const backup = JSON.parse(text);
        const res = await fetch('/api/crm/backup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ backup }),
        });
        const data = await res.json();
        if (!data.ok) { setRestoreMsg(data.message || 'Error'); return; }
        setRestoreMsg(`Restaurado: ${data.totals.imported} importados, ${data.totals.skipped} omitidos, ${data.totals.errors} errores.`);
        fetch('/api/crm/db-status').then(r => r.json()).then(d => { setHealth(d); }).catch(() => {});
      } catch {
        setRestoreMsg('Error al restaurar. Verifica el archivo.');
      }
    };
    input.click();
  };

  if (!dbConnected) {
    return (
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <Database size={18} className="text-slate-400" />
          <p className="text-xs font-bold text-slate-400">PostgreSQL no conectado — backup no disponible</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2.5 w-2.5 rounded-full ${health?.status === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Estado del CRM</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">Salud del sistema</h2>
          </div>
        </div>
        <button type="button" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97]" onClick={() => { setLoading(true); fetch('/api/crm/db-status').then(r => r.json()).then(d => { setHealth(d); setLoading(false); }).catch(() => { setHealth(null); setLoading(false); }); }}>
          {loading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />} Refrescar
        </button>
      </div>

      {health ? (
        <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3">
          <HealthStat label="Prospectos" value={health.prospectCount} color="text-blue-600" />
          <HealthStat label="Seguimientos pendientes" value={health.followUpCount} color="text-amber-600" />
          <HealthStat label="Demos agendadas" value={health.demosAgendadas} color="text-purple-600" />
          <HealthStat label="Instalaciones pendientes" value={health.instalacionesPendientes} color="text-cyan-600" />
          <HealthStat label="PostgreSQL" value={health.status === 'connected' ? 'Conectado' : 'Desconectado'} color={health.status === 'connected' ? 'text-emerald-600' : 'text-red-600'} />
          <HealthStat label="Últimos errores" value={health.lastErrors.length} color={health.lastErrors.length > 0 ? 'text-red-600' : 'text-slate-400'} />
        </div>
      ) : (
        <p className="mb-4 text-xs text-red-500">No se pudo obtener estado.</p>
      )}

      {health?.lastErrors && health.lastErrors.length > 0 && (
        <div className="mb-4 rounded-xl border border-red-100 bg-red-50 p-3">
          <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold uppercase text-red-600"><AlertTriangle size={12} /> Últimos errores</p>
          {health.lastErrors.map((e, i) => (
            <p key={i} className="text-[10px] text-red-700">{e.detail || e.event} ({new Date(e.created_at).toLocaleString('es-PE')})</p>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <button type="button" className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-bold text-emerald-700 transition-all hover:bg-emerald-100 active:scale-[0.97]" onClick={downloadBackup}>
          <Download size={13} /> Descargar backup
        </button>
        <button type="button" className="flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-all hover:bg-amber-100 active:scale-[0.97]" onClick={restoreBackup}>
          <Upload size={13} /> Restaurar backup
        </button>
      </div>
      {backupMsg && <p className="mt-2 text-xs text-emerald-700">{backupMsg}</p>}
      {restoreMsg && <p className="mt-2 text-xs text-amber-700">{restoreMsg}</p>}
    </div>
  );
}

function HealthStat({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2.5 dark:bg-slate-800">
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      <p className={`text-lg font-black ${color}`}>{value}</p>
    </div>
  );
}
