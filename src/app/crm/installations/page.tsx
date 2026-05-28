'use client';

import { useEffect, useMemo, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import {
  getProspects as getStoredProspects,
  updateProspect as updateStoredProspect,
} from '@/lib/crm-storage/crmStorage';
import type { CrmProspectRecord } from '@/lib/crm-storage/crmStorage.types';
import { CalendarCheck, CheckCircle2, ClipboardCheck, Laptop, Printer, Tablet, Wrench } from 'lucide-react';

type InstallationStatus = 'Prospecto' | 'Demo agendada' | 'Demo activa' | 'Instalación parcial' | 'Producción' | 'Soporte';
type InstallationType = 'FERRO' | 'RESTO';
type Equipment = 'impresora' | 'laptop' | 'tablet';
type SunatMode = 'Demo' | 'Producción';
type ChecklistKey = 'POS probado' | 'Caja' | 'Inventario' | 'Impresora' | 'WhatsApp' | 'SUNAT' | 'QR mesas' | 'Cocina';

type InstallationClient = CrmProspectRecord & {
  installationStatus: InstallationStatus;
  installationDate: string;
  installationType: InstallationType;
  equipment: Equipment[];
  sunatMode: SunatMode;
  nubefactConfigured: boolean;
  installationNotes: string;
  installationChecklist: Record<ChecklistKey, boolean>;
};

const STATUS_OPTIONS: InstallationStatus[] = ['Prospecto', 'Demo agendada', 'Demo activa', 'Instalación parcial', 'Producción', 'Soporte'];
const TYPE_OPTIONS: InstallationType[] = ['FERRO', 'RESTO'];
const EQUIPMENT_OPTIONS: Equipment[] = ['impresora', 'laptop', 'tablet'];
const SUNAT_OPTIONS: SunatMode[] = ['Demo', 'Producción'];
const CHECKLIST_OPTIONS: ChecklistKey[] = ['POS probado', 'Caja', 'Inventario', 'Impresora', 'WhatsApp', 'SUNAT', 'QR mesas', 'Cocina'];

const emptyChecklist = (): Record<ChecklistKey, boolean> => ({
  'POS probado': false,
  Caja: false,
  Inventario: false,
  Impresora: false,
  WhatsApp: false,
  SUNAT: false,
  'QR mesas': false,
  Cocina: false,
});

const DEMO_CLIENTS: InstallationClient[] = [
  {
    id: 'installation-demo-resto',
    negocio: 'Pollería El Buen Sabor',
    rubro: 'Pollería',
    zona: 'Lima Norte',
    contacto: 'Rosa Martínez',
    telefono: '51987454769',
    redSocial: 'facebook.com/polleria-demo',
    interes: 'RESTO',
    estado: 'Demo activa',
    fechaUltimoContacto: '',
    fechaProximoContacto: '',
    nota: 'Demo RESTO con cocina y mesas.',
    origen: 'Facebook',
    permisoContacto: 'Pendiente',
    ultimoMensajeEnviado: '',
    createdAt: new Date().toISOString(),
    installationStatus: 'Demo activa',
    installationDate: new Date().toISOString().slice(0, 10),
    installationType: 'RESTO',
    equipment: ['impresora', 'tablet'],
    sunatMode: 'Demo',
    nubefactConfigured: false,
    installationNotes: 'Validar impresora y flujo de cocina.',
    installationChecklist: { ...emptyChecklist(), Caja: true, WhatsApp: true },
  },
  {
    id: 'installation-demo-ferro',
    negocio: 'Ferretería San Miguel',
    rubro: 'Ferretería',
    zona: 'Piura',
    contacto: 'Carlos Vega',
    telefono: '51999888777',
    redSocial: '',
    interes: 'FERRO',
    estado: 'Interesado',
    fechaUltimoContacto: '',
    fechaProximoContacto: '',
    nota: 'Cliente interesado en stock y caja.',
    origen: 'Visita directa',
    permisoContacto: 'Pendiente',
    ultimoMensajeEnviado: '',
    createdAt: new Date().toISOString(),
    installationStatus: 'Demo agendada',
    installationDate: '',
    installationType: 'FERRO',
    equipment: ['laptop', 'impresora'],
    sunatMode: 'Demo',
    nubefactConfigured: false,
    installationNotes: 'Coordinar prueba con inventario real.',
    installationChecklist: emptyChecklist(),
  },
];

function normalizeClient(raw: Partial<InstallationClient>): InstallationClient {
  const baseChecklist = emptyChecklist();
  const rawChecklist = typeof raw.installationChecklist === 'object' && raw.installationChecklist ? raw.installationChecklist : {};
  const interestType = raw.interes === 'FERRO' ? 'FERRO' : 'RESTO';

  return {
    id: raw.id || `client-${Date.now().toString(36)}`,
    negocio: raw.negocio || '',
    rubro: raw.rubro || 'Otro',
    zona: raw.zona || '',
    contacto: raw.contacto || '',
    telefono: raw.telefono || '',
    redSocial: raw.redSocial || '',
    interes: raw.interes || interestType,
    estado: raw.estado || 'Nuevo',
    fechaUltimoContacto: raw.fechaUltimoContacto || '',
    fechaProximoContacto: raw.fechaProximoContacto || '',
    nota: raw.nota || '',
    origen: raw.origen || 'Otro',
    permisoContacto: raw.permisoContacto || 'Pendiente',
    ultimoMensajeEnviado: raw.ultimoMensajeEnviado || '',
    createdAt: raw.createdAt || new Date().toISOString(),
    installationStatus: STATUS_OPTIONS.includes(raw.installationStatus as InstallationStatus) ? raw.installationStatus as InstallationStatus : 'Prospecto',
    installationDate: raw.installationDate || '',
    installationType: TYPE_OPTIONS.includes(raw.installationType as InstallationType) ? raw.installationType as InstallationType : interestType,
    equipment: Array.isArray(raw.equipment) ? raw.equipment.filter((item): item is Equipment => EQUIPMENT_OPTIONS.includes(item as Equipment)) : [],
    sunatMode: SUNAT_OPTIONS.includes(raw.sunatMode as SunatMode) ? raw.sunatMode as SunatMode : 'Demo',
    nubefactConfigured: Boolean(raw.nubefactConfigured),
    installationNotes: raw.installationNotes || '',
    installationChecklist: CHECKLIST_OPTIONS.reduce((acc, key) => ({ ...acc, [key]: Boolean((rawChecklist as Record<string, unknown>)[key] ?? baseChecklist[key]) }), baseChecklist),
  };
}

export default function InstallationsPage() {
  return (
    <InternalGuard>
      <InstallationsApp />
    </InternalGuard>
  );
}

function InstallationsApp() {
  const [clients, setClients] = useState<InstallationClient[]>(DEMO_CLIENTS);
  const [activeStatus, setActiveStatus] = useState<InstallationStatus | 'Todos'>('Todos');

  useEffect(() => {
    let active = true;

    getStoredProspects(DEMO_CLIENTS, normalizeClient).then((items) => {
      if (active) setClients(items.map(normalizeClient));
    });

    return () => {
      active = false;
    };
  }, []);

  const filteredClients = useMemo(() => (
    activeStatus === 'Todos' ? clients : clients.filter((client) => client.installationStatus === activeStatus)
  ), [activeStatus, clients]);

  const metrics = useMemo(() => ({
    total: clients.length,
    demos: clients.filter((client) => client.installationStatus === 'Demo activa' || client.installationStatus === 'Demo agendada').length,
    production: clients.filter((client) => client.installationStatus === 'Producción').length,
    support: clients.filter((client) => client.installationStatus === 'Soporte').length,
  }), [clients]);

  const updateClient = (id: string, patch: Partial<InstallationClient>) => {
    setClients((current) => current.map((client) => client.id === id ? { ...client, ...patch } : client));
    void updateStoredProspect(id, patch, clients);
  };

  const toggleEquipment = (client: InstallationClient, equipment: Equipment) => {
    const nextEquipment = client.equipment.includes(equipment)
      ? client.equipment.filter((item) => item !== equipment)
      : [...client.equipment, equipment];
    updateClient(client.id, { equipment: nextEquipment });
  };

  const toggleChecklist = (client: InstallationClient, key: ChecklistKey) => {
    updateClient(client.id, {
      installationChecklist: {
        ...client.installationChecklist,
        [key]: !client.installationChecklist[key],
      },
    });
  };

  const markCompleted = (client: InstallationClient) => {
    const completedChecklist = CHECKLIST_OPTIONS.reduce((acc, key) => ({ ...acc, [key]: true }), emptyChecklist());
    updateClient(client.id, {
      installationStatus: 'Producción',
      installationDate: client.installationDate || new Date().toISOString().slice(0, 10),
      sunatMode: 'Producción',
      nubefactConfigured: true,
      installationChecklist: completedChecklist,
    });
  };

  return (
    <main className="crm-page min-h-screen px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="crm-eyebrow mb-3">Implementación FACTUSYS</p>
            <h1 className="crm-title">Instalaciones y demos reales</h1>
            <p className="crm-subtitle mt-3 max-w-3xl">
              Control interno para llevar clientes desde prospecto hasta producción, soporte y checklist técnico.
            </p>
          </div>
          <a href="/crm" className="crm-button-secondary justify-center">Volver al CRM</a>
        </header>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <MetricCard label="Clientes" value={metrics.total} />
          <MetricCard label="Demos" value={metrics.demos} />
          <MetricCard label="Producción" value={metrics.production} />
          <MetricCard label="Soporte" value={metrics.support} />
        </section>

        <section className="crm-card mb-6 p-4">
          <div className="mb-4 flex items-center gap-2">
            <CalendarCheck className="text-neon" size={20} />
            <h2 className="crm-section-title">Timeline operativo</h2>
          </div>
          <div className="overflow-x-auto pb-2">
            <div className="flex min-w-[840px] items-center gap-3">
              {STATUS_OPTIONS.map((status, index) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setActiveStatus(activeStatus === status ? 'Todos' : status)}
                  className={`flex flex-1 items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    activeStatus === status ? 'border-neon bg-neon/10' : 'border-black/10 bg-white/40 hover:border-neon/40'
                  }`}
                >
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-black text-sm font-bold text-white">{index + 1}</span>
                  <span>
                    <span className="block text-sm font-bold text-slate-900">{status}</span>
                    <span className="crm-muted text-xs">{clients.filter((client) => client.installationStatus === status).length} clientes</span>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5">
          {filteredClients.map((client) => (
            <InstallationCard
              key={client.id}
              client={client}
              onUpdate={updateClient}
              onToggleEquipment={toggleEquipment}
              onToggleChecklist={toggleChecklist}
              onComplete={markCompleted}
            />
          ))}
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

function InstallationCard({
  client,
  onUpdate,
  onToggleEquipment,
  onToggleChecklist,
  onComplete,
}: {
  client: InstallationClient;
  onUpdate: (id: string, patch: Partial<InstallationClient>) => void;
  onToggleEquipment: (client: InstallationClient, equipment: Equipment) => void;
  onToggleChecklist: (client: InstallationClient, key: ChecklistKey) => void;
  onComplete: (client: InstallationClient) => void;
}) {
  const checklistDone = CHECKLIST_OPTIONS.filter((key) => client.installationChecklist[key]).length;

  return (
    <article className="crm-card overflow-hidden p-5">
      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <h2 className="crm-prospect-title">{client.negocio}</h2>
            <span className="crm-badge">{client.installationType}</span>
            <span className="crm-badge">{client.installationStatus}</span>
            <span className="crm-badge">SUNAT {client.sunatMode}</span>
          </div>

          <div className="crm-muted grid gap-2 text-sm md:grid-cols-2">
            <p><strong>Contacto:</strong> {client.contacto}</p>
            <p><strong>WhatsApp:</strong> {client.telefono}</p>
            <p><strong>Zona:</strong> {client.zona || 'Sin zona'}</p>
            <p><strong>Instalación:</strong> {client.installationDate || 'Sin fecha'}</p>
            <p><strong>Nubefact:</strong> {client.nubefactConfigured ? 'Sí' : 'No'}</p>
            <p><strong>Checklist:</strong> {checklistDone}/{CHECKLIST_OPTIONS.length}</p>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-3">
            <Select label="Estado" value={client.installationStatus} options={STATUS_OPTIONS} onChange={(value) => onUpdate(client.id, { installationStatus: value as InstallationStatus })} />
            <Select label="Tipo" value={client.installationType} options={TYPE_OPTIONS} onChange={(value) => onUpdate(client.id, { installationType: value as InstallationType })} />
            <Select label="SUNAT" value={client.sunatMode} options={SUNAT_OPTIONS} onChange={(value) => onUpdate(client.id, { sunatMode: value as SunatMode })} />
            <label className="block">
              <span className="crm-label">Fecha de instalación</span>
              <input className="crm-input" type="date" value={client.installationDate} onChange={(event) => onUpdate(client.id, { installationDate: event.target.value })} />
            </label>
            <label className="block">
              <span className="crm-label">Nubefact configurado</span>
              <select className="crm-input" value={client.nubefactConfigured ? 'Sí' : 'No'} onChange={(event) => onUpdate(client.id, { nubefactConfigured: event.target.value === 'Sí' })}>
                <option>Sí</option>
                <option>No</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <span className="crm-label">Equipos</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <button
                  key={equipment}
                  type="button"
                  onClick={() => onToggleEquipment(client, equipment)}
                  className={`crm-button-secondary min-h-0 px-3 py-2 text-xs ${client.equipment.includes(equipment) ? 'border-neon text-neon' : ''}`}
                >
                  {equipment === 'impresora' && <Printer size={14} />}
                  {equipment === 'laptop' && <Laptop size={14} />}
                  {equipment === 'tablet' && <Tablet size={14} />}
                  {equipment}
                </button>
              ))}
            </div>
          </div>

          <label className="mt-5 block">
            <span className="crm-label">Observaciones</span>
            <textarea className="crm-input min-h-24 resize-none" value={client.installationNotes} onChange={(event) => onUpdate(client.id, { installationNotes: event.target.value })} />
          </label>
        </div>

        <aside className="crm-mini-card rounded-2xl p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="crm-section-title text-base">Checklist técnico</h3>
              <p className="crm-muted text-xs">{checklistDone} tareas listas</p>
            </div>
            <ClipboardCheck className="text-neon" size={22} />
          </div>

          <div className="space-y-2">
            {CHECKLIST_OPTIONS.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => onToggleChecklist(client, item)}
                className={`flex w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm transition ${
                  client.installationChecklist[item] ? 'border-neon bg-neon/10 text-slate-900' : 'border-black/10 bg-white/40 text-slate-700'
                }`}
              >
                <span>{item}</span>
                {client.installationChecklist[item] && <CheckCircle2 size={16} className="text-neon" />}
              </button>
            ))}
          </div>

          <button type="button" onClick={() => onComplete(client)} className="crm-button-primary mt-4 w-full justify-center">
            <Wrench size={16} />
            Marcar instalación completada
          </button>
        </aside>
      </div>
    </article>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block">
      <span className="crm-label">{label}</span>
      <select className="crm-input" value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => <option key={option}>{option}</option>)}
      </select>
    </label>
  );
}
