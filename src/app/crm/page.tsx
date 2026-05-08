'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FactusysLogoNeon } from '@/components/BrandLogo';
import InternalGuard from '@/components/InternalGuard';
import {
  Plus, Search, Check, MessageCircle, Phone, Trash2, Edit3,
  BarChart3, Columns3, Table2, Calendar, Eye, ArrowLeft,
  Users, DollarSign, Building2, MapPin, Tag, ChevronRight, AlertCircle
} from 'lucide-react';

/* ─── TYPES ─── */

interface Lead {
  id: string; negocio: string; contacto: string; whatsapp: string;
  ciudad: string; rubro: string; interes: string; estado: string;
  valor: number; proximaAccion: string; fechaSeguimiento: string;
  notas: string; createdAt: string; updatedAt: string;
}
type LeadForm = Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;

const ESTADOS = ['Nuevo', 'Contactado', 'Demo agendada', 'Demo realizada', 'Negociando', 'Cerrado', 'Perdido'] as const;
const INTERESES = ['FACTUSYS FERRO', 'FACTUSYS RESTO', 'Página web', 'Landing page', 'Sistema a medida', 'Automatización'] as const;
const RUBROS = ['Ferretería', 'Restaurante', 'Tienda retail', 'Servicios', 'Bodega', 'Otro'] as const;

const MSGS_WHATSAPP: Record<string, string> = {
  'Primer contacto': 'Hola [nombre], soy de FACTUSYS. Te escribo porque tenemos un sistema POS moderno para negocios peruanos. Te gustaría conocer cómo puede ayudar a tu negocio?',
  'Seguimiento': 'Hola [nombre], te escribí hace unos días sobre FACTUSYS. Tuviste oportunidad de revisar la información? Puedo agendarte una demo sin compromiso.',
  'Enviar demo': 'Hola [nombre], aquí está el enlace para que explores FACTUSYS por tu cuenta. Cualquier duda, me dices.',
  'Recordatorio': 'Hola [nombre], te recuerdo que tenemos una demo agendada. Confirmado? Quedó atento.',
  'Cierre': 'Hola [nombre], qué te pareció FACTUSYS? Estoy por acá para lo que necesites. Podemos avanzar con la implementación cuando quieras.',
};

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function today() { return new Date().toISOString().split('T')[0]; }
const STORAGE_KEY = 'factusys_crm_leads';

function useLeads() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    if (typeof window === 'undefined') return [];
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem(STORAGE_KEY, JSON.stringify(leads)); }, [leads]);
  const add = useCallback((d: LeadForm) => { const n = new Date().toISOString(); const l: Lead = { ...d, id: genId(), createdAt: n, updatedAt: n }; setLeads(p => [l, ...p]); return l; }, []);
  const upd = useCallback((id: string, d: Partial<LeadForm>) => setLeads(p => p.map(l => l.id === id ? { ...l, ...d, updatedAt: new Date().toISOString() } : l)), []);
  const del = useCallback((id: string) => setLeads(p => p.filter(l => l.id !== id)), []);
  const get = useCallback((id: string) => leads.find(l => l.id === id), [leads]);
  return { leads, add, update: upd, remove: del, get };
}

/* ─── BADGE ─── */

function EstadoBadge({ estado }: { estado: string }) {
  const c: Record<string, string> = {
    Nuevo: 'bg-blue-500/10 text-blue-400', Contactado: 'bg-yellow-500/10 text-yellow-400',
    'Demo agendada': 'bg-purple-500/10 text-purple-400', 'Demo realizada': 'bg-cyan-500/10 text-cyan-400',
    Negociando: 'bg-orange-500/10 text-orange-400', Cerrado: 'bg-[#00e676]/10 text-[#00e676]', Perdido: 'bg-red-500/10 text-red-400',
  };
  return <span className={`${c[estado] || 'bg-white/10 text-gray-400'} text-[10px] px-2 py-0.5 rounded-full font-medium`}>{estado}</span>;
}

/* ─── DASHBOARD ─── */

function CrmDashboard({ leads, onSelectView }: { leads: Lead[]; onSelectView: (v: string, f?: string) => void }) {
  const cards = [
    { label: 'Total leads', value: leads.length, icon: Users, color: 'text-blue-400' },
    { label: 'Nuevos', value: leads.filter(l => l.estado === 'Nuevo').length, icon: Check, color: 'text-[#00e676]', filter: 'Nuevo' },
    { label: 'Demos', value: leads.filter(l => l.estado === 'Demo agendada').length, icon: Calendar, color: 'text-yellow-400', filter: 'Demo agendada' },
    { label: 'Negociando', value: leads.filter(l => l.estado === 'Negociando').length, icon: ChevronRight, color: 'text-purple-400', filter: 'Negociando' },
    { label: 'Cerrados', value: leads.filter(l => l.estado === 'Cerrado').length, icon: Check, color: 'text-[#00e676]', filter: 'Cerrado' },
    { label: 'Valor est.', value: `S/ ${leads.reduce((s, l) => s + l.valor, 0).toLocaleString()}`, icon: DollarSign, color: 'text-[#00e676]' },
  ];
  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {cards.map((c, i) => (
          <div key={i} onClick={() => c.filter && onSelectView('kanban', c.filter)} className={`bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 ${c.filter ? 'cursor-pointer hover:border-[#00e676]/30' : ''} transition-all`}>
            <div className="flex items-center gap-2 mb-2"><c.icon size={14} className={c.color} /><span className="text-gray-500 text-[10px] uppercase tracking-wider">{c.label}</span></div>
            <p className={`text-xl sm:text-2xl font-bold ${c.color} tabular-nums`}>{c.value}</p>
          </div>
        ))}
      </div>
      <div className="glass-card rounded-xl p-4 sm:p-5 border-white/[0.04]">
        <h3 className="text-white text-sm font-semibold mb-3">Resumen rápido</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {[
            { l: 'Tasa de cierre', v: leads.length ? `${Math.round((leads.filter(l => l.estado === 'Cerrado').length / leads.length) * 100)}%` : '0%' },
            { l: 'Pendientes', v: leads.filter(l => l.estado === 'Nuevo' || l.estado === 'Contactado').length },
            { l: 'Seguimientos hoy', v: leads.filter(l => l.fechaSeguimiento === today()).length },
            { l: 'Interés principal', v: INTERESES.map(i => ({ i, c: leads.filter(l => l.interes === i).length })).sort((a, b) => b.c - a.c)[0]?.i || '—' },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.03] rounded-lg px-3 py-2"><p className="text-gray-500 mb-0.5">{item.l}</p><p className="text-white font-semibold">{item.v}</p></div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── KANBAN ─── */

function CrmKanban({ leads, onView }: { leads: Lead[]; onView: (id: string) => void }) {
  const [local, setLocal] = useState(leads);
  useEffect(() => setLocal(leads), [leads]);
  const move = (id: string, dir: number, cur: string) => {
    const idx = ESTADOS.indexOf(cur as typeof ESTADOS[number]); const next = ESTADOS[idx + dir]; if (!next) return;
    const nextLeads = local.map(l => l.id === id ? { ...l, estado: next, updatedAt: new Date().toISOString() } : l);
    setLocal(nextLeads); localStorage.setItem(STORAGE_KEY, JSON.stringify(nextLeads));
  };
  const cols = ESTADOS.map(e => ({ estado: e, items: local.filter(l => l.estado === e) }));
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-[900px]">
        {cols.map(col => (
          <div key={col.estado} className="flex-1 min-w-[120px]">
            <div className="flex items-center justify-between mb-3 px-1"><h3 className="text-white text-xs font-semibold uppercase tracking-wider">{col.estado}</h3><span className="text-gray-600 text-xs">{col.items.length}</span></div>
            <div className="space-y-2">
              {col.items.map(lead => (
                <div key={lead.id} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 hover:border-[#00e676]/20 transition-all group">
                  <div className="flex items-start justify-between gap-1 mb-1.5"><p className="text-white text-xs font-semibold truncate flex-1">{lead.negocio}</p><button onClick={() => onView(lead.id)} className="p-0.5 rounded hover:bg-white/[0.06] text-gray-500 hover:text-white transition cursor-pointer bg-transparent border-none"><Eye size={11} /></button></div>
                  <p className="text-gray-500 text-[10px] mb-1">{lead.contacto} · {lead.whatsapp}</p>
                  <div className="flex items-center gap-1 flex-wrap mb-2"><span className="bg-[#00e676]/10 text-[#00e676] text-[9px] px-1.5 py-0.5 rounded-full">{lead.interes}</span><span className="bg-white/[0.04] text-gray-500 text-[9px] px-1.5 py-0.5 rounded-full">{lead.ciudad}</span></div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {ESTADOS.indexOf(col.estado as typeof ESTADOS[number]) > 0 && <button onClick={() => move(lead.id, -1, col.estado)} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 hover:text-white transition cursor-pointer border-none">←</button>}
                    {ESTADOS.indexOf(col.estado as typeof ESTADOS[number]) < ESTADOS.length - 1 && <button onClick={() => move(lead.id, 1, col.estado)} className="text-[9px] px-1.5 py-0.5 rounded bg-white/[0.06] text-gray-400 hover:text-white transition cursor-pointer border-none">→</button>}
                  </div>
                </div>
              ))}
              {col.items.length === 0 && <div className="border border-dashed border-white/[0.06] rounded-xl p-4"><p className="text-gray-600 text-[10px] text-center">Vacío</p></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── TABLE ─── */

function CrmTable({ leads, onEdit, onView, search, setSearch, filterEstado, setFilterEstado, filterInteres, setFilterInteres }: {
  leads: Lead[]; onEdit: (id: string) => void; onView: (id: string) => void;
  search: string; setSearch: (v: string) => void; filterEstado: string; setFilterEstado: (v: string) => void;
  filterInteres: string; setFilterInteres: (v: string) => void;
}) {
  const filtered = useMemo(() => leads.filter(l => {
    if (search && !l.negocio.toLowerCase().includes(search.toLowerCase()) && !l.contacto.toLowerCase().includes(search.toLowerCase()) && !l.whatsapp.includes(search)) return false;
    if (filterEstado && l.estado !== filterEstado) return false;
    if (filterInteres && l.interes !== filterInteres) return false;
    return true;
  }), [leads, search, filterEstado, filterInteres]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" /><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
        <select value={filterEstado} onChange={e => setFilterEstado(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-gray-300 text-sm outline-none focus:border-[#00e676]/30 transition-all cursor-pointer"><option value="">Todos los estados</option>{ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}</select>
        <select value={filterInteres} onChange={e => setFilterInteres(e.target.value)} className="bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-gray-300 text-sm outline-none focus:border-[#00e676]/30 transition-all cursor-pointer"><option value="">Todos los intereses</option>{INTERESES.map(i => <option key={i} value={i}>{i}</option>)}</select>
      </div>
      {filtered.length === 0 ? (
        <div className="glass-card rounded-xl p-8 text-center"><Users size={32} className="text-gray-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">No se encontraron leads</p></div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-white/[0.06]">{['Negocio', 'Contacto', 'WhatsApp', 'Interés', 'Estado', 'Valor', ''].map(h => <th key={h} className="text-left py-3 px-3 text-gray-500 text-xs font-medium">{h}</th>)}</tr></thead>
            <tbody>
              {filtered.map(lead => (
                <tr key={lead.id} className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors">
                  <td className="py-3 px-3 text-white font-medium">{lead.negocio}</td>
                  <td className="py-3 px-3 text-gray-300">{lead.contacto}</td>
                  <td className="py-3 px-3 text-gray-400">{lead.whatsapp}</td>
                  <td className="py-3 px-3"><span className="bg-[#00e676]/10 text-[#00e676] text-[10px] px-2 py-0.5 rounded-full">{lead.interes}</span></td>
                  <td className="py-3 px-3"><EstadoBadge estado={lead.estado} /></td>
                  <td className="py-3 px-3 text-gray-300 tabular-nums">S/ {lead.valor.toLocaleString()}</td>
                  <td className="py-3 px-3 text-right"><div className="flex items-center justify-end gap-1"><button onClick={() => onView(lead.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition cursor-pointer bg-transparent border-none"><Eye size={13} /></button><button onClick={() => onEdit(lead.id)} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-500 hover:text-white transition cursor-pointer bg-transparent border-none"><Edit3 size={13} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ─── FORM ─── */

function CrmForm({ lead, onSave, onCancel }: { lead?: Lead; onSave: (data: LeadForm) => void; onCancel: () => void }) {
  const [f, setF] = useState<LeadForm>({
    negocio: lead?.negocio || '', contacto: lead?.contacto || '', whatsapp: lead?.whatsapp || '',
    ciudad: lead?.ciudad || '', rubro: lead?.rubro || '', interes: lead?.interes || '',
    estado: lead?.estado || 'Nuevo', valor: lead?.valor || 0, proximaAccion: lead?.proximaAccion || '',
    fechaSeguimiento: lead?.fechaSeguimiento || '', notas: lead?.notas || '',
  });
  const [errs, setErrs] = useState<string[]>([]);
  const valid = () => { const e: string[] = []; if (!f.negocio.trim()) e.push('Negocio obligatorio'); if (!f.contacto.trim()) e.push('Contacto obligatorio'); if (!f.whatsapp.trim()) e.push('WhatsApp obligatorio'); if (!f.interes) e.push('Selecciona interés'); setErrs(e); return e.length === 0; };
  const set = (k: keyof LeadForm, v: string | number) => setF(p => ({ ...p, [k]: v }));
  const submit = (e: React.FormEvent) => { e.preventDefault(); if (!valid()) return; onSave(f); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6"><button onClick={onCancel} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 transition cursor-pointer bg-transparent border-none"><ArrowLeft size={18} /></button><h2 className="text-white text-lg font-semibold">{lead ? 'Editar lead' : 'Nuevo lead'}</h2></div>
      <form onSubmit={submit} className="space-y-4">
        {errs.length > 0 && <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3">{errs.map((e, i) => <p key={i} className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11} />{e}</p>)}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="text-gray-500 text-xs mb-1 block">Negocio *</label><input value={f.negocio} onChange={e => set('negocio', e.target.value)} placeholder="Nombre del negocio" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Contacto *</label><input value={f.contacto} onChange={e => set('contacto', e.target.value)} placeholder="Nombre del contacto" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
          <div><label className="text-gray-500 text-xs mb-1 block">WhatsApp *</label><input value={f.whatsapp} onChange={e => set('whatsapp', e.target.value)} placeholder="+51999999999" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Ciudad</label><input value={f.ciudad} onChange={e => set('ciudad', e.target.value)} placeholder="Lima, Arequipa..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Rubro</label><select value={f.rubro} onChange={e => set('rubro', e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-gray-300 text-sm outline-none focus:border-[#00e676]/30 transition-all cursor-pointer"><option value="">Seleccionar</option>{RUBROS.map(r => <option key={r} value={r}>{r}</option>)}</select></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Interés *</label><select value={f.interes} onChange={e => set('interes', e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-gray-300 text-sm outline-none focus:border-[#00e676]/30 transition-all cursor-pointer"><option value="">Seleccionar</option>{INTERESES.map(i => <option key={i} value={i}>{i}</option>)}</select></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Estado</label><select value={f.estado} onChange={e => set('estado', e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-gray-300 text-sm outline-none focus:border-[#00e676]/30 transition-all cursor-pointer">{ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}</select></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Valor (S/)</label><input type="number" value={f.valor || ''} onChange={e => set('valor', Number(e.target.value))} placeholder="0" className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
          <div className="sm:col-span-2"><label className="text-gray-500 text-xs mb-1 block">Próxima acción</label><input value={f.proximaAccion} onChange={e => set('proximaAccion', e.target.value)} placeholder="Ej: Enviar demo, llamar..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all" /></div>
          <div><label className="text-gray-500 text-xs mb-1 block">Fecha seguimiento</label><input type="date" value={f.fechaSeguimiento} onChange={e => set('fechaSeguimiento', e.target.value)} className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-[#00e676]/30 transition-all [color-scheme:dark]" /></div>
          <div className="sm:col-span-2"><label className="text-gray-500 text-xs mb-1 block">Notas</label><textarea value={f.notas} onChange={e => set('notas', e.target.value)} rows={3} placeholder="Información adicional..." className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl px-3 py-2.5 text-white text-sm placeholder:text-gray-600 outline-none focus:border-[#00e676]/30 transition-all resize-none" /></div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="flex items-center gap-2 bg-[#00e676] text-black font-semibold rounded-xl px-5 py-2.5 text-sm hover:bg-[#00c853] transition-all active:scale-[0.98] cursor-pointer border-none"><Check size={15} /> {lead ? 'Guardar' : 'Crear lead'}</button>
          <button type="button" onClick={onCancel} className="px-5 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white hover:bg-white/[0.06] transition-all cursor-pointer bg-transparent border-none">Cancelar</button>
        </div>
      </form>
    </motion.div>
  );
}

/* ─── DETAIL ─── */

function CrmDetail({ lead, onEdit, onBack, onDelete }: { lead: Lead; onEdit: (id: string) => void; onBack: () => void; onDelete: (id: string) => void }) {
  const [confirm, setConfirm] = useState(false);
  const openWA = (key: string) => { const msg = MSGS_WHATSAPP[key]?.replace('[nombre]', lead.contacto) || ''; window.open(`https://wa.me/${lead.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(msg)}`, '_blank'); };

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3"><button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/[0.06] text-gray-400 transition cursor-pointer bg-transparent border-none"><ArrowLeft size={18} /></button><h2 className="text-white text-lg font-semibold">{lead.negocio}</h2><EstadoBadge estado={lead.estado} /></div>
        <div className="flex items-center gap-2">
          <button onClick={() => onEdit(lead.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.06] text-gray-300 hover:text-white text-xs transition cursor-pointer bg-transparent border-none"><Edit3 size={13} /> Editar</button>
          {confirm ? <div className="flex items-center gap-1"><button onClick={() => { onDelete(lead.id); onBack(); }} className="px-2 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs hover:bg-red-500/30 transition cursor-pointer border-none">Confirmar</button><button onClick={() => setConfirm(false)} className="px-2 py-1.5 rounded-lg text-gray-500 text-xs hover:text-white transition cursor-pointer bg-transparent border-none">Cancelar</button></div> : <button onClick={() => setConfirm(true)} className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition cursor-pointer bg-transparent border-none"><Trash2 size={14} /></button>}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-white text-sm font-semibold mb-4">Información</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                { label: 'Contacto', value: lead.contacto, icon: Users }, { label: 'WhatsApp', value: lead.whatsapp, icon: Phone },
                { label: 'Ciudad', value: lead.ciudad || '—', icon: MapPin }, { label: 'Rubro', value: lead.rubro || '—', icon: Building2 },
                { label: 'Interés', value: lead.interes, icon: Tag }, { label: 'Valor', value: `S/ ${lead.valor.toLocaleString()}`, icon: DollarSign },
              ].map((item, i) => (<div key={i} className="flex items-start gap-2"><item.icon size={14} className="text-gray-500 flex-shrink-0 mt-0.5" /><div><p className="text-gray-500 text-[10px]">{item.label}</p><p className="text-gray-200 text-sm">{item.value}</p></div></div>))}
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5"><h3 className="text-white text-sm font-semibold mb-3">Notas</h3><p className="text-gray-400 text-sm leading-relaxed">{lead.notas || 'Sin notas'}</p></div>
        </div>
        <div className="space-y-4">
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-white text-sm font-semibold mb-3">Seguimiento</h3>
            <div className="space-y-2 text-sm">
              <div><p className="text-gray-500 text-[10px]">Próxima acción</p><p className="text-gray-200">{lead.proximaAccion || '—'}</p></div>
              <div><p className="text-gray-500 text-[10px]">Fecha seguimiento</p><p className="text-gray-200">{lead.fechaSeguimiento || '—'}</p></div>
              <div><p className="text-gray-500 text-[10px]">Creado</p><p className="text-gray-200 text-xs">{new Date(lead.createdAt).toLocaleDateString()}</p></div>
            </div>
          </div>
          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-4 sm:p-5">
            <h3 className="text-white text-sm font-semibold mb-3">WhatsApp rápido</h3>
            <div className="space-y-1.5">{Object.keys(MSGS_WHATSAPP).map(key => (<button key={key} onClick={() => openWA(key)} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-white/[0.03] hover:bg-[#00e676]/10 text-gray-400 hover:text-[#00e676] text-xs transition-all text-left cursor-pointer border-none"><MessageCircle size={12} /><span>{key}</span></button>))}</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── FOLLOW-UPS ─── */

function CrmFollowUps({ leads, onView }: { leads: Lead[]; onView: (id: string) => void }) {
  const t = today();
  const pending = useMemo(() => leads.filter(l => l.fechaSeguimiento && l.estado !== 'Cerrado' && l.estado !== 'Perdido').sort((a, b) => a.fechaSeguimiento.localeCompare(b.fechaSeguimiento)), [leads]);
  const overdue = pending.filter(l => l.fechaSeguimiento < t);
  const todayItems = pending.filter(l => l.fechaSeguimiento === t);
  const upcoming = pending.filter(l => l.fechaSeguimiento > t);

  const Section = ({ title, items, color }: { title: string; items: Lead[]; color: string }) => items.length > 0 ? (<div><h3 className={`${color} text-sm font-semibold mb-3`}>{title} ({items.length})</h3><div className="grid gap-2">{items.map(l => <FollowUpCard key={l.id} lead={l} onView={onView} />)}</div></div>) : null;

  return <div className="space-y-6">{overdue.length > 0 && <Section title="Vencidos" items={overdue} color="text-red-400" />}{todayItems.length > 0 && <Section title="Hoy" items={todayItems} color="text-yellow-400" />}{upcoming.length > 0 && <Section title="Próximos" items={upcoming} color="text-gray-400" />}{pending.length === 0 && <div className="glass-card rounded-xl p-8 text-center"><Calendar size={32} className="text-gray-600 mx-auto mb-3" /><p className="text-gray-500 text-sm">No hay seguimientos pendientes</p></div>}</div>;
}

function FollowUpCard({ lead, onView }: { lead: Lead; onView: (id: string) => void }) {
  return (<div className="flex items-center gap-3 bg-white/[0.02] border border-white/[0.06] rounded-xl px-4 py-3 hover:border-[#00e676]/20 transition-all cursor-pointer" onClick={() => onView(lead.id)}><div className="flex-1 min-w-0"><p className="text-white text-sm font-semibold truncate">{lead.negocio}</p><p className="text-gray-500 text-xs">{lead.contacto} · {lead.interes}</p></div><div className="text-right text-xs"><p className="text-gray-400">{lead.fechaSeguimiento}</p><p className="text-gray-600 truncate max-w-[120px]">{lead.proximaAccion || '—'}</p></div><ChevronRight size={14} className="text-gray-600" /></div>);
}

/* ─── MAIN ─── */

const views = [
  { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
  { id: 'kanban', label: 'Kanban', icon: Columns3 },
  { id: 'table', label: 'Tabla', icon: Table2 },
  { id: 'followups', label: 'Seguimientos', icon: Calendar },
];

function CrmContent() {
  const { leads, add, update, remove, get } = useLeads();
  const [view, setView] = useState('dashboard');
  const [filterEstado, setFilterEstado] = useState('');
  const [filterInteres, setFilterInteres] = useState('');
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<string | null>(null);
  const [viewing, setViewing] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const activeLead = viewing ? get(viewing) : null;
  const editLead = editing ? get(editing) : null;

  const handleSave = (data: LeadForm) => { if (editing) { update(editing, data); setEditing(null); } else { add(data); setCreating(false); } };
  const handleEdit = (id: string) => { setViewing(null); setCreating(false); setEditing(id); };
  const handleView = (id: string) => { setViewing(id); setEditing(null); setCreating(false); };
  const handleDelete = (id: string) => remove(id);

  if (creating || editing) {
    return (<div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CrmForm lead={editLead || undefined} onSave={handleSave} onCancel={() => { setCreating(false); setEditing(null); }} /></div>);
  }
  if (viewing && activeLead) {
    return (<div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8"><CrmDetail lead={activeLead} onEdit={handleEdit} onBack={() => setViewing(null)} onDelete={handleDelete} /></div>);
  }

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4"><FactusysLogoNeon /><div className="hidden sm:block w-px h-8 bg-white/[0.06]" /><div><h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">CRM</h1><p className="text-gray-500 text-xs">{leads.length} leads registrados</p></div></div>
        <button onClick={() => setCreating(true)} className="flex items-center gap-2 bg-[#00e676] text-black font-semibold rounded-xl px-4 py-2.5 text-sm hover:bg-[#00c853] transition-all active:scale-[0.98] cursor-pointer border-none"><Plus size={16} /> Nuevo lead</button>
      </div>
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1"><div className="flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-0.5">{views.map(v => (<button key={v.id} onClick={() => setView(v.id)} className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 whitespace-nowrap cursor-pointer border-none ${view === v.id ? 'bg-[#00e676] text-black shadow-lg shadow-[#00e676]/20' : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'}`}><v.icon size={14} />{v.label}</button>))}</div></div>
      <AnimatePresence mode="wait">
        <motion.div key={view} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
          {view === 'dashboard' && <CrmDashboard leads={leads} onSelectView={(v, f) => { setView(v); if (f) setFilterEstado(f); }} />}
          {view === 'kanban' && <CrmKanban leads={leads} onView={handleView} />}
          {view === 'table' && <CrmTable leads={leads} onEdit={handleEdit} onView={handleView} search={search} setSearch={setSearch} filterEstado={filterEstado} setFilterEstado={setFilterEstado} filterInteres={filterInteres} setFilterInteres={setFilterInteres} />}
          {view === 'followups' && <CrmFollowUps leads={leads} onView={handleView} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

export default function CrmPage() {
  return (
    <InternalGuard>
      <div className="min-h-screen bg-black pt-24 pb-20">
        <div className="fixed inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[600px] h-[600px] bg-[#00e676]/[0.03] rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-500/[0.02] rounded-full blur-3xl" />
        </div>
        <CrmContent />
      </div>
    </InternalGuard>
  );
}
