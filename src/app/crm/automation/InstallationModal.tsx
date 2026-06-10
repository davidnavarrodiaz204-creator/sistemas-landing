'use client';

import { useState } from 'react';
import { Calendar, Loader2, X, Printer, Package } from 'lucide-react';

export function InstallationModal({
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
  const [type, setType] = useState<'PRODUCCION' | 'DEMO'>('PRODUCCION');
  const [needsPrinter, setNeedsPrinter] = useState(false);
  const [needsInventory, setNeedsInventory] = useState(false);
  const [equipmentNotes, setEquipmentNotes] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const scheduledAt = date && time ? new Date(`${date}T${time}:00`).toISOString() : undefined;
      const res = await fetch('/api/crm/installations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', prospectId, product, scheduledAt, type, needsPrinter, needsInitialInventory: needsInventory, equipmentNotes, notes }),
      });
      const data = await res.json();
      if (data.ok) {
        onCreated(data.prospectId);
        onClose();
      } else {
        setError(data.message || 'Error al crear.');
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
            <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Nueva instalación</p>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">{businessName}</h2>
          </div>
          <button type="button" className="rounded-xl border border-slate-300 bg-white p-2 text-slate-600 hover:bg-slate-100" onClick={onClose}><X size={16} /></button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400"><Calendar size={11} className="inline" /> Fecha</span>
              <input type="date" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-cyan-400" value={date} onChange={(e) => setDate(e.target.value)} />
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Hora</span>
              <input type="time" className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-cyan-400" value={time} onChange={(e) => setTime(e.target.value)} />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Producto</span>
              <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-cyan-400" value={product} onChange={(e) => setProduct(e.target.value as 'RESTO' | 'FERRO' | 'Ambos')}>
                <option value="RESTO">RESTO</option>
                <option value="FERRO">FERRO</option>
                <option value="Ambos">Ambos</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Tipo</span>
              <select className="w-full rounded-xl border-2 border-slate-200 px-3 py-2.5 text-sm font-bold outline-none focus:border-cyan-400" value={type} onChange={(e) => setType(e.target.value as 'PRODUCCION' | 'DEMO')}>
                <option value="PRODUCCION">Producción</option>
                <option value="DEMO">Demo</option>
              </select>
            </label>
          </div>

          <div className="flex gap-4">
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-cyan-500" checked={needsPrinter} onChange={(e) => setNeedsPrinter(e.target.checked)} />
              <Printer size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Requiere impresora</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" className="h-4 w-4 rounded border-slate-300 accent-cyan-500" checked={needsInventory} onChange={(e) => setNeedsInventory(e.target.checked)} />
              <Package size={14} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-500">Inventario inicial</span>
            </label>
          </div>

          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Equipo / notas técnicas</span>
            <textarea className="min-h-[50px] w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-3 text-xs outline-none focus:border-cyan-400" value={equipmentNotes} onChange={(e) => setEquipmentNotes(e.target.value)} placeholder="Ej: Windows 11, impresora térmica X..." />
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-bold uppercase text-slate-400">Nota</span>
            <textarea className="min-h-[50px] w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-3 text-xs outline-none focus:border-cyan-400" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones generales" />
          </label>

          {error && <p className="text-xs font-bold text-red-600">{error}</p>}

          <div className="flex gap-2">
            <button type="button" className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-600 transition-all hover:bg-slate-100" onClick={onClose}>Cancelar</button>
            <button type="button" disabled={saving} className="flex-1 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-cyan-600 active:scale-[0.98] disabled:opacity-50" onClick={handleSave}>
              {saving ? <Loader2 size={15} className="mx-auto animate-spin" /> : 'Crear instalación'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}