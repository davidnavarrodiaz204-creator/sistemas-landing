'use client';

import { useState } from 'react';
import { Calendar, Clock, Loader2, X } from 'lucide-react';

export function DemoModal({
  prospectId, businessName,
  onClose, onCreated,
}: {
  prospectId: string;
  businessName: string;
  onClose: () => void;
  onCreated: (prospectId: string) => void;
}) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [time, setTime] = useState('10:00');
  const [product, setProduct] = useState<'RESTO' | 'FERRO' | 'Ambos'>('RESTO');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!date || !time) { setError('Fecha y hora requeridas.'); return; }
    setSaving(true);
    setError('');
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      const res = await fetch('/api/crm/demos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', prospectId, product, scheduledAt, notes }),
      });
      const data = await res.json();
      if (data.ok) {
        onCreated(data.prospectId);
        onClose();
      } else {
        setError(data.message || 'Error al agendar.');
      }
    } catch {
      setError('Error de conexión.');
    }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-900" onClick={(e) => e.stopPropagation()}>
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Agendar demo</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{businessName}</h2>
          </div>
          <button type="button" className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-100" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400"><Calendar size={11} className="inline" /> Fecha</span>
              <input type="date" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-emerald-400" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400"><Clock size={11} className="inline" /> Hora</span>
              <input type="time" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-emerald-400" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Producto</span>
            <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-emerald-400" value={product} onChange={(e) => setProduct(e.target.value as 'RESTO' | 'FERRO' | 'Ambos')}>
              <option value="RESTO">FACTUSYS RESTO</option>
              <option value="FERRO">FACTUSYS FERRO</option>
              <option value="Ambos">Ambos</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Nota (opcional)</span>
            <textarea className="min-h-[60px] w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-3 text-xs outline-none focus:border-emerald-400" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej: cliente quiere ver facturación..." />
          </label>

          {error && <p className="text-xs font-bold text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100" onClick={onClose}>Cancelar</button>
            <button type="button" disabled={saving} className="flex-1 rounded-xl bg-purple-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-purple-600 active:scale-[0.98] disabled:opacity-50" onClick={handleSave}>
              {saving ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Agendar demo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}