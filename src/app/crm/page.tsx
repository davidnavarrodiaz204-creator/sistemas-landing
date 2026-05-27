'use client';

import { useMemo, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import {
  BarChart3,
  Clipboard,
  Download,
  ExternalLink,
  Filter,
  MessageCircle,
  Plus,
  RotateCcw,
  Search,
  Trash2,
  Users,
} from 'lucide-react';

type Rubro = 'Restaurante' | 'Pollería' | 'Ferretería' | 'Tienda' | 'Otro';
type Interes = 'FERRO' | 'RESTO' | 'Ambos';
type Estado = 'Nuevo' | 'Contactado' | 'Interesado' | 'Demo enviada' | 'Reunión agendada' | 'Cerrado' | 'Perdido';

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
  proximaAccion: string;
  fechaProximoContacto: string;
  nota: string;
  createdAt: string;
};

type ProspectForm = Omit<Prospect, 'id' | 'createdAt'>;

const STORAGE_KEY = 'factusys_crm_prospects_v1';

const RUBROS: Rubro[] = ['Restaurante', 'Pollería', 'Ferretería', 'Tienda', 'Otro'];
const INTERESES: Interes[] = ['FERRO', 'RESTO', 'Ambos'];
const ESTADOS: Estado[] = ['Nuevo', 'Contactado', 'Interesado', 'Demo enviada', 'Reunión agendada', 'Cerrado', 'Perdido'];

const MESSAGE_TEMPLATES: Record<Interes, string> = {
  RESTO:
    'Hola, soy David de FACTUSYS. Vi tu negocio y quería mostrarte un sistema POS para restaurantes/pollerías que ayuda a controlar mesas, pedidos, caja, comandas y ventas. También puedo darte una demo rápida para que veas cómo funcionaría en tu negocio.',
  FERRO:
    'Hola, soy David de FACTUSYS. Tengo un sistema POS para ferreterías y tiendas que ayuda a controlar ventas, caja, inventario, cotizaciones, compras y documentos. Puedo mostrarte una demo rápida sin compromiso.',
  Ambos:
    'Hola, soy David de FACTUSYS. Implementamos sistemas POS para negocios en Perú: restaurantes, pollerías, ferreterías y tiendas. Te puedo mostrar una demo rápida para ver si encaja con tu negocio.',
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
  proximaAccion: 'Enviar primer mensaje por WhatsApp',
  fechaProximoContacto: '',
  nota: '',
};

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
    proximaAccion: 'Enviar demo de mesas y comandas',
    fechaProximoContacto: new Date().toISOString().slice(0, 10),
    nota: 'Quiere controlar caja por turno y pedidos de salón.',
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
    estado: 'Demo enviada',
    proximaAccion: 'Consultar si revisó inventario y cotizaciones',
    fechaProximoContacto: '',
    nota: 'Tiene problemas con stock y ventas fiadas.',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'demo-tienda-1',
    negocio: 'Market Los Andes',
    rubro: 'Tienda',
    zona: 'Arequipa',
    contacto: 'Lucía Ramos',
    telefono: '51911222333',
    redSocial: 'instagram.com/market-demo',
    interes: 'Ambos',
    estado: 'Nuevo',
    proximaAccion: 'Calificar tipo de negocio y enviar mensaje inicial',
    fechaProximoContacto: '',
    nota: 'Negocio mixto con ventas rápidas y control de proveedores.',
    createdAt: new Date().toISOString(),
  },
];

function genId() {
  return `prospect-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadProspects() {
  if (typeof window === 'undefined') return DEMO_PROSPECTS;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(DEMO_PROSPECTS));
    return DEMO_PROSPECTS;
  }

  try {
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed as Prospect[] : DEMO_PROSPECTS;
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

function toCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function getMessage(interes: Interes) {
  return MESSAGE_TEMPLATES[interes];
}

function downloadCsv(prospects: Prospect[]) {
  const headers = ['Negocio', 'Rubro', 'Zona', 'Contacto', 'Telefono', 'Red social', 'Interes', 'Estado', 'Proxima accion', 'Fecha proximo contacto', 'Nota'];
  const rows = prospects.map((item) => [
    item.negocio,
    item.rubro,
    item.zona,
    item.contacto,
    item.telefono,
    item.redSocial,
    item.interes,
    item.estado,
    item.proximaAccion,
    item.fechaProximoContacto,
    item.nota,
  ]);
  const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factusys-crm-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
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

  const filteredProspects = useMemo(() => {
    const term = search.trim().toLowerCase();
    return prospects.filter((item) => {
      const matchesSearch = !term || [
        item.negocio,
        item.contacto,
        item.telefono,
        item.zona,
        item.redSocial,
        item.nota,
      ].some((field) => field.toLowerCase().includes(term));

      return matchesSearch
        && (rubroFilter === 'Todos' || item.rubro === rubroFilter)
        && (estadoFilter === 'Todos' || item.estado === estadoFilter)
        && (interesFilter === 'Todos' || item.interes === interesFilter);
    });
  }, [estadoFilter, interesFilter, prospects, rubroFilter, search]);

  const metrics = useMemo(() => ({
    total: prospects.length,
    nuevos: prospects.filter((item) => item.estado === 'Nuevo').length,
    interesados: prospects.filter((item) => item.estado === 'Interesado').length,
    demos: prospects.filter((item) => item.estado === 'Demo enviada').length,
    cerrados: prospects.filter((item) => item.estado === 'Cerrado').length,
  }), [prospects]);

  const setField = <K extends keyof ProspectForm>(key: K, value: ProspectForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const persist = (nextProspects: Prospect[]) => {
    setProspects(nextProspects);
    saveProspects(nextProspects);
  };

  const addProspect = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.negocio.trim() || !form.contacto.trim() || !form.telefono.trim()) return;

    const prospect: Prospect = {
      ...form,
      id: genId(),
      negocio: form.negocio.trim(),
      contacto: form.contacto.trim(),
      telefono: form.telefono.trim(),
      createdAt: new Date().toISOString(),
    };

    persist([prospect, ...prospects]);
    setForm(EMPTY_FORM);
  };

  const updateEstado = (id: string, estado: Estado) => {
    persist(prospects.map((item) => item.id === id ? { ...item, estado } : item));
  };

  const removeProspect = (id: string) => {
    persist(prospects.filter((item) => item.id !== id));
  };

  const clearDemo = () => {
    if (!window.confirm('¿Limpiar todos los prospectos del CRM demo?')) return;
    persist([]);
  };

  const copyMessage = async (prospect: Prospect) => {
    await navigator.clipboard.writeText(getMessage(prospect.interes));
    setCopiedId(prospect.id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  return (
    <main className="crm-page min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="crm-eyebrow mb-3">Panel interno FACTUSYS</p>
            <h1 className="crm-title">CRM comercial</h1>
            <p className="crm-subtitle mt-3 max-w-3xl">
              Registra prospectos, filtra oportunidades y haz seguimiento a restaurantes, pollerías,
              ferreterías y negocios locales desde un solo lugar.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button type="button" onClick={() => downloadCsv(filteredProspects)} className="crm-button-secondary">
              <Download size={16} />
              Exportar CSV
            </button>
            <button type="button" onClick={clearDemo} className="crm-button-danger">
              <RotateCcw size={16} />
              Limpiar demo CRM
            </button>
          </div>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-5">
          <MetricCard label="Total prospectos" value={metrics.total} icon={Users} />
          <MetricCard label="Nuevos" value={metrics.nuevos} icon={Plus} />
          <MetricCard label="Interesados" value={metrics.interesados} icon={BarChart3} />
          <MetricCard label="Demo enviada" value={metrics.demos} icon={ExternalLink} />
          <MetricCard label="Cerrados" value={metrics.cerrados} icon={Clipboard} />
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

            <ProspectList
              prospects={filteredProspects}
              copiedId={copiedId}
              onCopy={copyMessage}
              onDelete={removeProspect}
              onEstadoChange={updateEstado}
            />
          </div>
        </section>
      </div>
    </main>
  );
}

function MetricCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ size?: number; className?: string }> }) {
  return (
    <div className="crm-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="crm-muted text-xs font-medium">{label}</span>
        <Icon size={17} className="text-neon" />
      </div>
      <p className="crm-number">{value}</p>
    </div>
  );
}

function ProspectFormCard({
  form,
  setField,
  onSubmit,
}: {
  form: ProspectForm;
  setField: <K extends keyof ProspectForm>(key: K, value: ProspectForm[K]) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="crm-card h-fit p-5 sm:p-6">
      <div className="mb-5 flex items-center gap-3">
        <div className="crm-icon">
          <Plus size={18} />
        </div>
        <div>
          <h2 className="crm-section-title">Agregar prospecto</h2>
          <p className="crm-muted text-sm">Datos comerciales para seguimiento.</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
        <Field label="Nombre del negocio" required>
          <input className="crm-input" value={form.negocio} onChange={(event) => setField('negocio', event.target.value)} placeholder="Ej. Pollería Central" required />
        </Field>

        <Field label="Rubro">
          <select className="crm-input" value={form.rubro} onChange={(event) => setField('rubro', event.target.value as Rubro)}>
            {RUBROS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>

        <Field label="Ciudad/Zona">
          <input className="crm-input" value={form.zona} onChange={(event) => setField('zona', event.target.value)} placeholder="Lima, Piura, Sullana..." />
        </Field>

        <Field label="Contacto" required>
          <input className="crm-input" value={form.contacto} onChange={(event) => setField('contacto', event.target.value)} placeholder="Nombre de la persona" required />
        </Field>

        <Field label="Teléfono/WhatsApp" required>
          <input className="crm-input" value={form.telefono} onChange={(event) => setField('telefono', event.target.value)} placeholder="51999999999" required />
        </Field>

        <Field label="Facebook/Instagram/TikTok">
          <input className="crm-input" value={form.redSocial} onChange={(event) => setField('redSocial', event.target.value)} placeholder="@negocio o enlace" />
        </Field>

        <Field label="Interés">
          <select className="crm-input" value={form.interes} onChange={(event) => setField('interes', event.target.value as Interes)}>
            {INTERESES.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>

        <Field label="Estado">
          <select className="crm-input" value={form.estado} onChange={(event) => setField('estado', event.target.value as Estado)}>
            {ESTADOS.map((item) => <option key={item}>{item}</option>)}
          </select>
        </Field>

        <Field label="Próxima acción">
          <input className="crm-input" value={form.proximaAccion} onChange={(event) => setField('proximaAccion', event.target.value)} placeholder="Enviar demo, llamar, agendar..." />
        </Field>

        <Field label="Fecha de próximo contacto">
          <input className="crm-input" type="date" value={form.fechaProximoContacto} onChange={(event) => setField('fechaProximoContacto', event.target.value)} />
        </Field>

        <div className="sm:col-span-2 xl:col-span-1">
          <Field label="Nota interna">
            <textarea className="crm-input min-h-24 resize-none" value={form.nota} onChange={(event) => setField('nota', event.target.value)} placeholder="Qué necesita, objeciones, próximos pasos..." />
          </Field>
        </div>
      </div>

      <button type="submit" className="crm-button-primary mt-5 w-full">
        <Plus size={16} />
        Guardar prospecto
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="crm-label">{label}{required ? ' *' : ''}</span>
      {children}
    </label>
  );
}

function Filters({
  search,
  setSearch,
  rubroFilter,
  setRubroFilter,
  estadoFilter,
  setEstadoFilter,
  interesFilter,
  setInteresFilter,
}: {
  search: string;
  setSearch: (value: string) => void;
  rubroFilter: string;
  setRubroFilter: (value: string) => void;
  estadoFilter: string;
  setEstadoFilter: (value: string) => void;
  interesFilter: string;
  setInteresFilter: (value: string) => void;
}) {
  return (
    <div className="crm-card p-4">
      <div className="grid gap-3 md:grid-cols-[1fr_150px_170px_130px]">
        <div className="relative">
          <Search size={16} className="crm-search-icon" />
          <input className="crm-input pl-10" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar negocio, contacto, zona, teléfono..." />
        </div>

        <SelectFilter value={rubroFilter} onChange={setRubroFilter} options={['Todos', ...RUBROS]} />
        <SelectFilter value={estadoFilter} onChange={setEstadoFilter} options={['Todos', ...ESTADOS]} />
        <SelectFilter value={interesFilter} onChange={setInteresFilter} options={['Todos', ...INTERESES]} />
      </div>

      <div className="crm-muted mt-3 flex items-center gap-2 text-xs">
        <Filter size={13} />
        Filtros por rubro, estado e interés.
      </div>
    </div>
  );
}

function SelectFilter({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: string[] }) {
  return (
    <select className="crm-input" value={value} onChange={(event) => onChange(event.target.value)}>
      {options.map((item) => <option key={item}>{item}</option>)}
    </select>
  );
}

function ProspectList({
  prospects,
  copiedId,
  onCopy,
  onDelete,
  onEstadoChange,
}: {
  prospects: Prospect[];
  copiedId: string | null;
  onCopy: (prospect: Prospect) => void;
  onDelete: (id: string) => void;
  onEstadoChange: (id: string, estado: Estado) => void;
}) {
  if (prospects.length === 0) {
    return (
      <div className="crm-card p-10 text-center">
        <Users size={34} className="mx-auto mb-3 text-neon" />
        <h3 className="crm-section-title">Sin prospectos</h3>
        <p className="crm-muted mt-1 text-sm">Agrega un negocio o cambia los filtros.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prospects.map((prospect) => (
        <article key={prospect.id} className="crm-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <h3 className="crm-prospect-title">{prospect.negocio}</h3>
                <Badge>{prospect.rubro}</Badge>
                <InterestBadge interest={prospect.interes} />
              </div>

              <div className="crm-muted grid gap-1 text-sm sm:grid-cols-2">
                <p><strong>Contacto:</strong> {prospect.contacto}</p>
                <p><strong>WhatsApp:</strong> {prospect.telefono}</p>
                <p><strong>Zona:</strong> {prospect.zona || 'Sin zona'}</p>
                <p><strong>Red:</strong> {prospect.redSocial || 'No registrada'}</p>
              </div>

              <div className="mt-3 grid gap-2 text-sm md:grid-cols-2">
                <p className="crm-note"><strong>Próxima acción:</strong> {prospect.proximaAccion || 'Sin acción'}</p>
                <p className="crm-note"><strong>Fecha:</strong> {prospect.fechaProximoContacto || 'Sin fecha'}</p>
              </div>

              {prospect.nota && <p className="crm-note mt-2"><strong>Nota:</strong> {prospect.nota}</p>}
            </div>

            <div className="flex min-w-full flex-col gap-2 sm:min-w-[260px]">
              <select className="crm-input" value={prospect.estado} onChange={(event) => onEstadoChange(prospect.id, event.target.value as Estado)}>
                {ESTADOS.map((item) => <option key={item}>{item}</option>)}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`https://wa.me/${normalizePhone(prospect.telefono)}?text=${encodeURIComponent(getMessage(prospect.interes))}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="crm-button-primary justify-center"
                >
                  <MessageCircle size={15} />
                  WhatsApp
                </a>

                <button type="button" onClick={() => onCopy(prospect)} className="crm-button-secondary justify-center">
                  <Clipboard size={15} />
                  {copiedId === prospect.id ? 'Copiado' : 'Copiar'}
                </button>
              </div>

              <button type="button" onClick={() => onDelete(prospect.id)} className="crm-button-ghost justify-center">
                <Trash2 size={15} />
                Eliminar
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="crm-badge">{children}</span>;
}

function InterestBadge({ interest }: { interest: Interes }) {
  return <span className={`crm-interest crm-interest-${interest.toLowerCase()}`}>{interest}</span>;
}
