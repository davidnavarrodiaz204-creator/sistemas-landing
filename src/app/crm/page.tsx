'use client';

import { useMemo, useRef, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import {
  CalendarClock,
  CheckCircle2,
  Clipboard,
  Download,
  FileUp,
  MessageCircle,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

type Rubro = 'Restaurante' | 'Pollería' | 'Ferretería' | 'Tienda' | 'Otro';
type Interes = 'RESTO' | 'FERRO' | 'Ambos';
type Estado = 'Nuevo' | 'Contactado' | 'Interesado' | 'Demo 30 días ofrecida' | 'Demo activa' | 'Reunión agendada' | 'Cerrado' | 'Perdido';
type Origen = 'Google Maps' | 'Facebook' | 'Referido' | 'Visita directa' | 'Otro';

type Prospect = {
  id: string;
  negocio: string;
  rubro: Rubro;
  zona: string;
  contacto: string;
  telefono: string;
  redSocial: string;
  interes: Interes;
  estado: Estado;
  fechaUltimoContacto: string;
  fechaProximoContacto: string;
  nota: string;
  origen: Origen;
  createdAt: string;
};

type ProspectForm = Omit<Prospect, 'id' | 'createdAt'>;

const STORAGE_KEY = 'factusys_crm_prospects_v2';
const LEGACY_STORAGE_KEY = 'factusys_crm_prospects_v1';

const RUBROS: Rubro[] = ['Restaurante', 'Pollería', 'Ferretería', 'Tienda', 'Otro'];
const INTERESES: Interes[] = ['RESTO', 'FERRO', 'Ambos'];
const ESTADOS: Estado[] = ['Nuevo', 'Contactado', 'Interesado', 'Demo 30 días ofrecida', 'Demo activa', 'Reunión agendada', 'Cerrado', 'Perdido'];
const ORIGENES: Origen[] = ['Google Maps', 'Facebook', 'Referido', 'Visita directa', 'Otro'];

const MESSAGE_TEMPLATES: Record<Interes, string> = {
  RESTO:
    'Hola, soy David de FACTUSYS. Estoy ofreciendo una demo gratuita de 30 días de un sistema POS para restaurantes, pollerías y cevicherías. Ayuda a controlar mesas, pedidos, cocina, caja, reportes y ventas. Durante la demo no se envían documentos reales a SUNAT; es solo para probar el sistema con seguridad. También puedo apoyar con una impresora térmica para la prueba. ¿Te gustaría verlo funcionando?',
  FERRO:
    'Hola, soy David de FACTUSYS. Estoy ofreciendo una demo gratuita de 30 días de un sistema POS para ferreterías y tiendas. Te ayuda a controlar ventas, caja, inventario, clientes, cotizaciones, compras y reportes. Durante la demo no se envían documentos reales a SUNAT; es solo para probar el sistema con seguridad. ¿Te gustaría verlo funcionando?',
  Ambos:
    'Hola, soy David de FACTUSYS. Implementamos sistemas POS para negocios en Perú: restaurantes, pollerías, ferreterías y tiendas. Estoy ofreciendo una demo gratuita de 30 días para que prueben ventas, caja, inventario/reportes y control del negocio. Durante la demo no se envían documentos reales a SUNAT. ¿Te gustaría ver una demo rápida?',
};

const EMPTY_FORM: ProspectForm = {
  negocio: '',
  rubro: 'Restaurante',
  zona: '',
  contacto: '',
  telefono: '',
  redSocial: '',
  interes: 'RESTO',
  estado: 'Nuevo',
  fechaUltimoContacto: '',
  fechaProximoContacto: '',
  nota: '',
  origen: 'Google Maps',
};

const today = () => new Date().toISOString().slice(0, 10);

const DEMO_PROSPECTS: Prospect[] = [
  {
    id: 'demo-resto-1',
    negocio: 'Pollería El Buen Sabor',
    rubro: 'Pollería',
    zona: 'Lima Norte',
    contacto: 'Rosa Martínez',
    telefono: '51987454769',
    redSocial: 'facebook.com/polleria-demo',
    interes: 'RESTO',
    estado: 'Interesado',
    fechaUltimoContacto: today(),
    fechaProximoContacto: today(),
    nota: 'Le interesa probar mesas, cocina y cierre de caja con impresora térmica.',
    origen: 'Facebook',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-resto-2',
    negocio: 'Cevichería La Esquina',
    rubro: 'Restaurante',
    zona: 'Trujillo',
    contacto: 'Miguel Torres',
    telefono: '51911222333',
    redSocial: 'instagram.com/cevicheria-demo',
    interes: 'RESTO',
    estado: 'Demo 30 días ofrecida',
    fechaUltimoContacto: today(),
    fechaProximoContacto: '',
    nota: 'Quiere ver reportes y comandas antes de activar demo.',
    origen: 'Google Maps',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-ferro-1',
    negocio: 'Ferretería San Miguel',
    rubro: 'Ferretería',
    zona: 'Piura',
    contacto: 'Carlos Vega',
    telefono: '51999888777',
    redSocial: '',
    interes: 'FERRO',
    estado: 'Demo activa',
    fechaUltimoContacto: today(),
    fechaProximoContacto: '',
    nota: 'Problemas con stock, ventas fiadas y cotizaciones manuales.',
    origen: 'Visita directa',
    createdAt: new Date().toISOString(),
  },
];

function normalizeProspect(raw: Partial<Prospect>): Prospect {
  return {
    id: raw.id || `prospect-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    negocio: raw.negocio || '',
    rubro: RUBROS.includes(raw.rubro as Rubro) ? raw.rubro as Rubro : 'Otro',
    zona: raw.zona || '',
    contacto: raw.contacto || '',
    telefono: raw.telefono || '',
    redSocial: raw.redSocial || '',
    interes: INTERESES.includes(raw.interes as Interes) ? raw.interes as Interes : 'Ambos',
    estado: ESTADOS.includes(raw.estado as Estado) ? raw.estado as Estado : migrateEstado(raw.estado || 'Nuevo'),
    fechaUltimoContacto: raw.fechaUltimoContacto || '',
    fechaProximoContacto: raw.fechaProximoContacto || '',
    nota: raw.nota || '',
    origen: ORIGENES.includes(raw.origen as Origen) ? raw.origen as Origen : 'Otro',
    createdAt: raw.createdAt || new Date().toISOString(),
  };
}

function migrateEstado(value: string): Estado {
  if (value === 'Demo enviada') return 'Demo 30 días ofrecida';
  if (ESTADOS.includes(value as Estado)) return value as Estado;
  return 'Nuevo';
}

function loadProspects() {
  if (typeof window === 'undefined') return DEMO_PROSPECTS;
  const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PROSPECTS));
    return DEMO_PROSPECTS;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed.map(normalizeProspect) : DEMO_PROSPECTS;
  } catch {
    return DEMO_PROSPECTS;
  }
}

function saveProspects(prospects: Prospect[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prospects));
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('51') ? digits : `51${digits}`;
}

function getMessage(interes: Interes) {
  return MESSAGE_TEMPLATES[interes];
}

function toCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(prospects: Prospect[]) {
  const headers = ['negocio', 'rubro', 'zona', 'contacto', 'telefono', 'redSocial', 'interes', 'estado', 'fechaUltimoContacto', 'fechaProximoContacto', 'origen', 'nota'];
  const rows = prospects.map((item) => headers.map((key) => String(item[key as keyof Prospect] || '')));
  const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factusys-crm-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseCsv(text: string): Prospect[] {
  const lines = text.split(/\r?\n/).filter(Boolean);
  const [headerLine, ...rows] = lines;
  if (!headerLine) return [];
  const headers = headerLine.split(',').map((item) => item.replaceAll('"', '').trim());
  return rows.map((line) => {
    const values = line.match(/("([^"]|"")*"|[^,]+)/g)?.map((value) => value.replace(/^"|"$/g, '').replaceAll('""', '"')) || [];
    const record = Object.fromEntries(headers.map((header, index) => [header, values[index] || '']));
    return normalizeProspect(record);
  }).filter((item) => item.negocio && item.telefono);
}

export default function CrmPage() {
  return (
    <InternalGuard>
      <CrmApp />
    </InternalGuard>
  );
}

function CrmApp() {
  const [prospects, setProspects] = useState<Prospect[]>(loadProspects);
  const [form, setForm] = useState<ProspectForm>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [rubroFilter, setRubroFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [interesFilter, setInteresFilter] = useState('Todos');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const filteredProspects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return prospects.filter((item) => {
      const matchesSearch = !term || [item.negocio, item.contacto, item.telefono, item.zona, item.redSocial, item.nota, item.origen].some((field) => field.toLowerCase().includes(term));
      return matchesSearch
        && (rubroFilter === 'Todos' || item.rubro === rubroFilter)
        && (estadoFilter === 'Todos' || item.estado === estadoFilter)
        && (interesFilter === 'Todos' || item.interes === interesFilter);
    });
  }, [estadoFilter, interesFilter, prospects, rubroFilter, search]);

  const contactToday = useMemo(() => {
    const current = today();
    return prospects
      .filter((item) => item.fechaProximoContacto && item.fechaProximoContacto <= current && item.estado !== 'Cerrado' && item.estado !== 'Perdido')
      .sort((a, b) => a.fechaProximoContacto.localeCompare(b.fechaProximoContacto));
  }, [prospects]);

  const metrics = useMemo(() => ({
    total: prospects.length,
    contactados: prospects.filter((item) => item.estado !== 'Nuevo').length,
    interesados: prospects.filter((item) => item.estado === 'Interesado').length,
    demosOfrecidas: prospects.filter((item) => item.estado === 'Demo 30 días ofrecida').length,
    demosActivas: prospects.filter((item) => item.estado === 'Demo activa').length,
    cerrados: prospects.filter((item) => item.estado === 'Cerrado').length,
  }), [prospects]);

  const persist = (nextProspects: Prospect[]) => {
    setProspects(nextProspects);
    saveProspects(nextProspects);
  };

  const setField = <K extends keyof ProspectForm>(key: K, value: ProspectForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addProspect = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.negocio.trim() || !form.contacto.trim() || !form.telefono.trim()) return;
    persist([{ ...form, id: `prospect-${Date.now().toString(36)}`, createdAt: new Date().toISOString() }, ...prospects]);
    setForm(EMPTY_FORM);
  };

  const updateProspect = (id: string, patch: Partial<Prospect>) => {
    persist(prospects.map((item) => item.id === id ? { ...item, ...patch } : item));
  };

  const clearDemo = () => {
    if (!window.confirm('¿Limpiar todos los datos del CRM?')) return;
    persist([]);
  };

  const copyMessage = async (prospect: Prospect) => {
    await navigator.clipboard.writeText(getMessage(prospect.interes));
    setCopiedId(prospect.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const imported = parseCsv(text);
    if (imported.length === 0) return;
    persist([...imported, ...prospects]);
  };

  return (
    <main className="crm-page min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="crm-eyebrow mb-3">Panel interno FACTUSYS</p>
            <h1 className="crm-title">CRM comercial</h1>
            <p className="crm-subtitle mt-3 max-w-3xl">
              Pipeline simple para vender demos de 30 días de FACTUSYS RESTO y FACTUSYS FERRO a negocios locales.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => downloadCsv(filteredProspects)} className="crm-button-secondary"><Download size={16} />Exportar CSV</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="crm-button-secondary"><FileUp size={16} />Importar CSV</button>
            <button type="button" onClick={clearDemo} className="crm-button-danger"><RotateCcw size={16} />Limpiar datos</button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => event.target.files?.[0] && importCsv(event.target.files[0])} />
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <MetricCard label="Prospectos totales" value={metrics.total} />
          <MetricCard label="Contactados" value={metrics.contactados} />
          <MetricCard label="Interesados" value={metrics.interesados} />
          <MetricCard label="Demos ofrecidas" value={metrics.demosOfrecidas} />
          <MetricCard label="Demos activas" value={metrics.demosActivas} />
          <MetricCard label="Cerrados" value={metrics.cerrados} />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_420px]">
          <OfferCard />
          <TodayList prospects={contactToday} copiedId={copiedId} onCopy={copyMessage} onUpdate={updateProspect} />
        </section>

        <section className="mb-6">
          <Pipeline prospects={filteredProspects} copiedId={copiedId} onCopy={copyMessage} onUpdate={updateProspect} />
        </section>

        <section className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <ProspectFormCard form={form} setField={setField} onSubmit={addProspect} />
          <div className="space-y-4">
            <Filters
              search={search}
              setSearch={setSearch}
              rubroFilter={rubroFilter}
              setRubroFilter={setRubroFilter}
              estadoFilter={estadoFilter}
              setEstadoFilter={setEstadoFilter}
              interesFilter={interesFilter}
              setInteresFilter={setInteresFilter}
            />
            <ProspectList prospects={filteredProspects} copiedId={copiedId} onCopy={copyMessage} onUpdate={updateProspect} onDelete={(id) => persist(prospects.filter((item) => item.id !== id))} />
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="crm-card p-4">
      <span className="crm-muted text-xs font-medium">{label}</span>
      <p className="crm-number mt-3">{value}</p>
    </div>
  );
}

function OfferCard() {
  return (
    <div className="crm-card p-5 sm:p-6">
      <p className="crm-eyebrow mb-2">Oferta demo FACTUSYS</p>
      <h2 className="crm-section-title text-xl">30 días gratis para probar el sistema</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {['Implementación guiada', 'Prueba con impresora térmica si aplica', 'Sin envío real a SUNAT durante demo', 'Evalúa ventas, caja, stock, pedidos y reportes', 'Luego se define plan mensual o implementación'].map((item) => (
          <div key={item} className="crm-note flex items-start gap-2">
            <CheckCircle2 size={16} className="mt-0.5 flex-shrink-0 text-neon" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TodayList({ prospects, copiedId, onCopy, onUpdate }: { prospects: Prospect[]; copiedId: string | null; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void }) {
  return (
    <div className="crm-card p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="crm-section-title">Hoy debo contactar</h2>
          <p className="crm-muted text-sm">Seguimientos de hoy o vencidos.</p>
        </div>
        <CalendarClock className="text-neon" size={22} />
      </div>
      <div className="space-y-3">
        {prospects.length === 0 && <p className="crm-note text-sm">No tienes seguimientos pendientes para hoy.</p>}
        {prospects.slice(0, 5).map((prospect) => (
          <QuickProspect key={prospect.id} prospect={prospect} copied={copiedId === prospect.id} onCopy={onCopy} onUpdate={onUpdate} />
        ))}
      </div>
    </div>
  );
}

function Pipeline({ prospects, copiedId, onCopy, onUpdate }: { prospects: Prospect[]; copiedId: string | null; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void }) {
  return (
    <div className="crm-card p-4">
      <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="crm-section-title">Pipeline comercial</h2>
          <p className="crm-muted text-sm">Columnas por estado para ver avance de cada oportunidad.</p>
        </div>
      </div>
      <div className="overflow-x-auto pb-2">
        <div className="grid min-w-[1180px] grid-cols-8 gap-3">
          {ESTADOS.map((estado) => {
            const items = prospects.filter((prospect) => prospect.estado === estado);
            return (
              <div key={estado} className="crm-pipeline-column rounded-2xl p-3">
                <div className="mb-3 flex items-center justify-between gap-2">
                  <h3 className="crm-muted text-xs font-bold uppercase tracking-wide">{estado}</h3>
                  <span className="crm-badge">{items.length}</span>
                </div>
                <div className="space-y-2">
                  {items.map((prospect) => (
                    <QuickProspect key={prospect.id} prospect={prospect} copied={copiedId === prospect.id} compact onCopy={onCopy} onUpdate={onUpdate} />
                  ))}
                  {items.length === 0 && <p className="crm-muted rounded-xl border border-dashed border-black/10 p-3 text-center text-xs">Vacío</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProspectFormCard({ form, setField, onSubmit }: { form: ProspectForm; setField: <K extends keyof ProspectForm>(key: K, value: ProspectForm[K]) => void; onSubmit: (event: React.FormEvent<HTMLFormElement>) => void }) {
  return (
    <form onSubmit={onSubmit} className="crm-card h-fit p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="crm-section-title">Agregar prospecto</h2>
        <p className="crm-muted text-sm">Registra datos públicos de forma manual o por CSV.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <Field label="Negocio *"><input className="crm-input" value={form.negocio} onChange={(e) => setField('negocio', e.target.value)} required /></Field>
        <Field label="Rubro"><Select value={form.rubro} options={RUBROS} onChange={(value) => setField('rubro', value as Rubro)} /></Field>
        <Field label="Ciudad/Zona"><input className="crm-input" value={form.zona} onChange={(e) => setField('zona', e.target.value)} /></Field>
        <Field label="Dueño/contacto *"><input className="crm-input" value={form.contacto} onChange={(e) => setField('contacto', e.target.value)} required /></Field>
        <Field label="WhatsApp *"><input className="crm-input" value={form.telefono} onChange={(e) => setField('telefono', e.target.value)} required /></Field>
        <Field label="Facebook/Instagram/TikTok"><input className="crm-input" value={form.redSocial} onChange={(e) => setField('redSocial', e.target.value)} /></Field>
        <Field label="Interés"><Select value={form.interes} options={INTERESES} onChange={(value) => setField('interes', value as Interes)} /></Field>
        <Field label="Estado"><Select value={form.estado} options={ESTADOS} onChange={(value) => setField('estado', value as Estado)} /></Field>
        <Field label="Fecha último contacto"><input className="crm-input" type="date" value={form.fechaUltimoContacto} onChange={(e) => setField('fechaUltimoContacto', e.target.value)} /></Field>
        <Field label="Próximo seguimiento"><input className="crm-input" type="date" value={form.fechaProximoContacto} onChange={(e) => setField('fechaProximoContacto', e.target.value)} /></Field>
        <Field label="Origen"><Select value={form.origen} options={ORIGENES} onChange={(value) => setField('origen', value as Origen)} /></Field>
        <div className="sm:col-span-2 xl:col-span-1"><Field label="Nota"><textarea className="crm-input min-h-24 resize-none" value={form.nota} onChange={(e) => setField('nota', e.target.value)} /></Field></div>
      </div>
      <button type="submit" className="crm-button-primary mt-5 w-full"><Plus size={16} />Guardar prospecto</button>
    </form>
  );
}

function Filters(props: { search: string; setSearch: (v: string) => void; rubroFilter: string; setRubroFilter: (v: string) => void; estadoFilter: string; setEstadoFilter: (v: string) => void; interesFilter: string; setInteresFilter: (v: string) => void }) {
  return (
    <div className="crm-card p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_150px_210px_130px]">
        <div className="relative"><Search size={16} className="crm-search-icon" /><input className="crm-input pl-10" value={props.search} onChange={(e) => props.setSearch(e.target.value)} placeholder="Buscar negocio, contacto, zona, red..." /></div>
        <Select value={props.rubroFilter} options={['Todos', ...RUBROS]} onChange={props.setRubroFilter} />
        <Select value={props.estadoFilter} options={['Todos', ...ESTADOS]} onChange={props.setEstadoFilter} />
        <Select value={props.interesFilter} options={['Todos', ...INTERESES]} onChange={props.setInteresFilter} />
      </div>
    </div>
  );
}

function ProspectList({ prospects, copiedId, onCopy, onUpdate, onDelete }: { prospects: Prospect[]; copiedId: string | null; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void; onDelete: (id: string) => void }) {
  return (
    <div className="space-y-3">
      {prospects.length === 0 && <div className="crm-card p-10 text-center"><Users className="mx-auto mb-3 text-neon" /><h3 className="crm-section-title">Sin prospectos</h3><p className="crm-muted mt-1 text-sm">Agrega un negocio o cambia los filtros.</p></div>}
      {prospects.map((prospect) => (
        <article key={prospect.id} className="crm-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="crm-prospect-title">{prospect.negocio}</h3><span className="crm-badge">{prospect.rubro}</span><span className={`crm-interest crm-interest-${prospect.interes.toLowerCase()}`}>{prospect.interes}</span></div>
              <div className="crm-muted grid gap-1 text-sm sm:grid-cols-2">
                <p><strong>Contacto:</strong> {prospect.contacto}</p><p><strong>WhatsApp:</strong> {prospect.telefono}</p>
                <p><strong>Zona:</strong> {prospect.zona || 'Sin zona'}</p><p><strong>Origen:</strong> {prospect.origen}</p>
                <p><strong>Red:</strong> {prospect.redSocial || 'No registrada'}</p><p><strong>Último contacto:</strong> {prospect.fechaUltimoContacto || 'Sin registro'}</p>
              </div>
              {prospect.nota && <p className="crm-note mt-3"><strong>Nota:</strong> {prospect.nota}</p>}
            </div>
            <div className="flex min-w-full flex-col gap-2 sm:min-w-[285px]">
              <Select value={prospect.estado} options={ESTADOS} onChange={(value) => onUpdate(prospect.id, { estado: value as Estado })} />
              <input className="crm-input" type="date" value={prospect.fechaProximoContacto} onChange={(e) => onUpdate(prospect.id, { fechaProximoContacto: e.target.value })} />
              <ActionButtons prospect={prospect} copied={copiedId === prospect.id} onCopy={onCopy} onUpdate={onUpdate} onDelete={onDelete} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function QuickProspect({ prospect, copied, compact, onCopy, onUpdate }: { prospect: Prospect; copied: boolean; compact?: boolean; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void }) {
  return (
    <div className="crm-mini-card rounded-xl p-3">
      <p className="font-bold text-slate-900">{prospect.negocio}</p>
      <p className="crm-muted text-xs">{prospect.contacto} · {prospect.telefono}</p>
      {!compact && <p className="crm-muted mt-1 text-xs">Seguimiento: {prospect.fechaProximoContacto || 'sin fecha'}</p>}
      <div className="mt-3 flex gap-2">
        <a className="crm-button-primary min-h-0 flex-1 justify-center px-3 py-2 text-xs" href={`https://wa.me/${normalizePhone(prospect.telefono)}?text=${encodeURIComponent(getMessage(prospect.interes))}`} target="_blank" rel="noreferrer"><MessageCircle size={13} />WA</a>
        <button type="button" className="crm-button-secondary min-h-0 flex-1 justify-center px-3 py-2 text-xs" onClick={() => onCopy(prospect)}>{copied ? 'Copiado' : 'Copiar'}</button>
      </div>
      <button type="button" className="crm-button-ghost mt-2 min-h-0 w-full justify-center px-3 py-2 text-xs" onClick={() => onUpdate(prospect.id, { estado: 'Contactado', fechaUltimoContacto: today() })}>Marcar contactado</button>
    </div>
  );
}

function ActionButtons({ prospect, copied, onCopy, onUpdate, onDelete }: { prospect: Prospect; copied: boolean; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void; onDelete: (id: string) => void }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      <a href={`https://wa.me/${normalizePhone(prospect.telefono)}?text=${encodeURIComponent(getMessage(prospect.interes))}`} target="_blank" rel="noreferrer" className="crm-button-primary justify-center"><MessageCircle size={15} />WhatsApp</a>
      <button type="button" onClick={() => onCopy(prospect)} className="crm-button-secondary justify-center"><Clipboard size={15} />{copied ? 'Copiado' : 'Copiar'}</button>
      <button type="button" onClick={() => onUpdate(prospect.id, { estado: 'Contactado', fechaUltimoContacto: today() })} className="crm-button-secondary justify-center">Contactado</button>
      <button type="button" onClick={() => onUpdate(prospect.id, { fechaProximoContacto: today() })} className="crm-button-secondary justify-center">Seguir hoy</button>
      <button type="button" onClick={() => onDelete(prospect.id)} className="crm-button-ghost col-span-2 justify-center"><Trash2 size={15} />Eliminar</button>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="crm-label">{label}</span>{children}</label>;
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <select className="crm-input" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select>;
}
