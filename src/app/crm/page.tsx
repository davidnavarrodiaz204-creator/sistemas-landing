'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import {
  ASSISTANT_INTENTS,
  generateSalesMessage,
  getAssistantContextNote,
  getNextAction,
  getRecommendedIntent,
  type AssistantIntent,
} from '@/lib/crm-ai/salesAssistant';
import {
  deleteProspect as deleteStoredProspect,
  exportProspects as replaceStoredProspects,
  getProspects as getStoredProspects,
  importProspects as importStoredProspects,
  saveProspect as saveStoredProspect,
  updateProspect as updateStoredProspect,
} from '@/lib/crm-storage/crmStorage';
import {
  DEFAULT_DAILY_WHATSAPP_LIMIT,
  getSendBlockReason,
  remainingMessagesToday,
  sentMessagesToday,
  todayKey,
} from '@/lib/whatsapp/dailyLimit';
import { getWhatsAppMessage } from '@/lib/whatsapp/messageTemplates';
import type {
  ContactPermission,
  ConversationStatus,
  WhatsAppMessageLog,
  WhatsAppProspectControl,
} from '@/lib/whatsapp/whatsappTypes';
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
  Sparkles,
  Trash2,
  Users,
  Wifi,
  X,
} from 'lucide-react';

type Rubro = 'Restaurante' | 'Pollería' | 'Cevichería' | 'Ferretería' | 'Minimarket' | 'Tienda' | 'Otro';
type Interes = 'RESTO' | 'FERRO' | 'Ambos';
type Estado = 'Nuevo' | 'Contactado' | 'Interesado' | 'Demo 30 días ofrecida' | 'Demo activa' | 'Reunión agendada' | 'Cerrado' | 'Perdido';
type Origen = 'Google Maps' | 'Facebook' | 'TikTok' | 'Instagram' | 'Referido' | 'Manual' | 'Visita directa' | 'Otro';

type Prospect = WhatsAppProspectControl & {
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
  isDemo?: boolean;
};

type ProspectForm = Omit<Prospect, 'id' | 'createdAt'>;
type LeadCandidate = {
  id: string;
  nombre: string;
  rubro: Rubro;
  zona: string;
  link: string;
  telefono: string;
  redSocial: string;
  contacto: string;
  interes: Interes;
  fuente: Origen;
  nota: string;
  savedProspectId?: string;
  duplicateReason?: string;
};
type SalesDailyLog = {
  date: string;
  newContacts: number;
  followUps: number;
  demosOffered: number;
  responses: number;
  nextFollowUps: number;
  notes: string;
};

const BACKUP_META_KEY = 'factusys_crm_last_backup_at';
const SALES_DAILY_LOG_KEY = 'factusys_crm_sales_daily_log_v1';
const LEAD_CANDIDATES_KEY = 'factusys_crm_lead_candidates_v1';
const IS_PRODUCTION = process.env.NODE_ENV === 'production';

type OpenWaStatus = 'idle' | 'connected' | 'not_configured' | 'error' | 'simulation';

const RUBROS: Rubro[] = ['Restaurante', 'Pollería', 'Cevichería', 'Ferretería', 'Minimarket', 'Tienda', 'Otro'];
const INTERESES: Interes[] = ['RESTO', 'FERRO', 'Ambos'];
const ESTADOS: Estado[] = ['Nuevo', 'Contactado', 'Interesado', 'Demo 30 días ofrecida', 'Demo activa', 'Reunión agendada', 'Cerrado', 'Perdido'];
const ORIGENES: Origen[] = ['Google Maps', 'Facebook', 'TikTok', 'Instagram', 'Referido', 'Manual', 'Visita directa', 'Otro'];
const PERMISOS_CONTACTO: ContactPermission[] = ['Pendiente', 'Aceptó contacto', 'No contactar'];
const ESTADOS_CONVERSACION: ConversationStatus[] = ['Sin respuesta', 'Respondió', 'Interesado', 'Demo activa', 'No contactar'];

const LEAD_SEARCH_RUBROS: Rubro[] = ['Pollería', 'Restaurante', 'Cevichería', 'Ferretería', 'Minimarket', 'Otro'];
const LEAD_SOURCES: Origen[] = ['Google Maps', 'Facebook', 'TikTok', 'Instagram', 'Referido', 'Manual'];

const DEFAULT_WHATSAPP_CONTROL: WhatsAppProspectControl = {
  permisoContacto: 'Pendiente',
  ultimoMensajeEnviado: '',
  fechaUltimoMensaje: '',
  cantidadMensajesEnviados: 0,
  respuestaCliente: '',
  estadoConversacion: 'Sin respuesta',
  historialMensajes: [],
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
  ...DEFAULT_WHATSAPP_CONTROL,
};

const today = () => new Date().toISOString().slice(0, 10);

function loadSalesDailyLogs(): SalesDailyLog[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(SALES_DAILY_LOG_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveSalesDailyLogs(logs: SalesDailyLog[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(SALES_DAILY_LOG_KEY, JSON.stringify(logs.slice(0, 30)));
}

function loadLeadCandidates(): LeadCandidate[] {
  if (typeof window === 'undefined') return [];
  try {
    const parsed = JSON.parse(window.localStorage.getItem(LEAD_CANDIDATES_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveLeadCandidates(candidates: LeadCandidate[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LEAD_CANDIDATES_KEY, JSON.stringify(candidates.slice(0, 200)));
}

const DEMO_PROSPECTS: Prospect[] = [
  {
    ...DEFAULT_WHATSAPP_CONTROL,
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
    isDemo: true,
  },
  {
    ...DEFAULT_WHATSAPP_CONTROL,
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
    isDemo: true,
  },
  {
    ...DEFAULT_WHATSAPP_CONTROL,
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
    isDemo: true,
  },
];

function isDemoRecord(raw: Partial<Prospect>) {
  return Boolean(raw.isDemo) || String(raw.id || '').startsWith('demo-') || String(raw.redSocial || '').includes('-demo');
}

function normalizeProspect(raw: Partial<Prospect>): Prospect {
  const cantidadMensajesEnviados = Number(raw.cantidadMensajesEnviados || 0);

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
    permisoContacto: PERMISOS_CONTACTO.includes(raw.permisoContacto as ContactPermission) ? raw.permisoContacto as ContactPermission : 'Pendiente',
    ultimoMensajeEnviado: raw.ultimoMensajeEnviado || '',
    fechaUltimoMensaje: raw.fechaUltimoMensaje || '',
    cantidadMensajesEnviados: Number.isFinite(cantidadMensajesEnviados) ? cantidadMensajesEnviados : 0,
    respuestaCliente: raw.respuestaCliente || '',
    estadoConversacion: ESTADOS_CONVERSACION.includes(raw.estadoConversacion as ConversationStatus) ? raw.estadoConversacion as ConversationStatus : 'Sin respuesta',
    historialMensajes: Array.isArray(raw.historialMensajes) ? raw.historialMensajes : [],
    createdAt: raw.createdAt || new Date().toISOString(),
    isDemo: isDemoRecord(raw),
  };
}

function migrateEstado(value: string): Estado {
  if (value === 'Demo enviada') return 'Demo 30 días ofrecida';
  if (ESTADOS.includes(value as Estado)) return value as Estado;
  return 'Nuevo';
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('51') ? digits : `51${digits}`;
}

function getMessage(interes: Interes) {
  return getWhatsAppMessage(interes);
}

function inferInterestFromRubro(rubro: Rubro): Interes {
  if (rubro === 'Ferretería' || rubro === 'Tienda' || rubro === 'Minimarket') return 'FERRO';
  if (rubro === 'Restaurante' || rubro === 'Pollería' || rubro === 'Cevichería') return 'RESTO';
  return 'Ambos';
}

function buildPublicSearchUrl(source: Origen | 'maps' | 'facebook' | 'instagram' | 'tiktok', rubro: string, zona: string) {
  const query = encodeURIComponent(`${rubro} en ${zona}`.trim());
  const urls = {
    maps: `https://www.google.com/maps/search/${query}`,
    'Google Maps': `https://www.google.com/maps/search/${query}`,
    facebook: `https://www.facebook.com/search/pages/?q=${query}`,
    Facebook: `https://www.facebook.com/search/pages/?q=${query}`,
    instagram: `https://www.google.com/search?q=${query}+Instagram`,
    Instagram: `https://www.google.com/search?q=${query}+Instagram`,
    tiktok: `https://www.google.com/search?q=${query}+TikTok`,
    TikTok: `https://www.google.com/search?q=${query}+TikTok`,
    Referido: '',
    Manual: '',
    'Visita directa': '',
    Otro: '',
  };

  return urls[source];
}

function normalizeComparable(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, ' ');
}

function findDuplicateReason(candidate: LeadCandidate, prospects: Prospect[], candidates: LeadCandidate[] = []) {
  const phone = candidate.telefono.replace(/\D/g, '');
  const name = normalizeComparable(candidate.nombre);
  const link = normalizeComparable(candidate.link || candidate.redSocial);
  const otherCandidates = candidates.filter((item) => item.id !== candidate.id && !item.savedProspectId);

  if (phone && prospects.some((item) => item.telefono.replace(/\D/g, '') === phone)) return 'WhatsApp ya existe en CRM';
  if (phone && otherCandidates.some((item) => item.telefono.replace(/\D/g, '') === phone)) return 'WhatsApp duplicado en la previsualización';
  if (name && prospects.some((item) => normalizeComparable(item.negocio) === name)) return 'Nombre ya existe en CRM';
  if (name && otherCandidates.some((item) => normalizeComparable(item.nombre) === name)) return 'Nombre duplicado en la previsualización';
  if (link && prospects.some((item) => normalizeComparable(item.redSocial) === link)) return 'Link ya existe en CRM';
  if (link && otherCandidates.some((item) => normalizeComparable(item.link || item.redSocial) === link)) return 'Link duplicado en la previsualización';

  return '';
}

function parseLeadText(text: string, defaultRubro: Rubro, defaultFuente: Origen): LeadCandidate[] {
  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [nombre = '', zona = '', telefono = '', fuente = defaultFuente, linkOrNote = ''] = line.split('|').map((part) => part.trim());
      const parsedFuente = LEAD_SOURCES.includes(fuente as Origen) ? fuente as Origen : defaultFuente;

      return {
        id: `lead-import-${Date.now().toString(36)}-${index}`,
        nombre,
        rubro: defaultRubro,
        zona,
        link: linkOrNote.startsWith('http') ? linkOrNote : '',
        telefono,
        redSocial: linkOrNote.startsWith('http') ? linkOrNote : '',
        contacto: '',
        interes: inferInterestFromRubro(defaultRubro),
        fuente: parsedFuente,
        nota: linkOrNote.startsWith('http') ? '' : linkOrNote,
      };
    })
    .filter((item) => item.nombre);
}

function toCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function downloadCsv(prospects: Prospect[]) {
  const headers = ['negocio', 'rubro', 'zona', 'contacto', 'telefono', 'redSocial', 'interes', 'estado', 'fechaUltimoContacto', 'fechaProximoContacto', 'origen', 'permisoContacto', 'ultimoMensajeEnviado', 'fechaUltimoMensaje', 'cantidadMensajesEnviados', 'respuestaCliente', 'estadoConversacion', 'nota'];
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

function downloadLeadCandidatesCsv(candidates: LeadCandidate[]) {
  const headers = ['nombre', 'rubro', 'zona', 'telefono', 'fuente', 'link', 'redSocial', 'contacto', 'interes', 'nota', 'guardado'];
  const rows = candidates.map((item) => [
    item.nombre,
    item.rubro,
    item.zona,
    item.telefono,
    item.fuente,
    item.link,
    item.redSocial,
    item.contacto,
    item.interes,
    item.nota,
    item.savedProspectId ? 'SI' : 'NO',
  ]);
  const csv = [headers, ...rows].map((row) => row.map(toCsvValue).join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factusys-prospectos-encontrados-${today()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadJsonBackup(prospects: Prospect[], exportedAt: string) {
  const backup = {
    app: 'FACTUSYS CRM',
    version: 1,
    exportedAt,
    prospects,
  };
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `factusys-crm-backup-${exportedAt.slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function parseBackupJson(text: string): { exportedAt: string; prospects: Prospect[] } {
  const parsed = JSON.parse(text);
  const rawProspects = Array.isArray(parsed) ? parsed : parsed?.prospects;
  if (!Array.isArray(rawProspects)) return { exportedAt: '', prospects: [] };

  return {
    exportedAt: typeof parsed?.exportedAt === 'string' ? parsed.exportedAt : '',
    prospects: rawProspects.map((item) => normalizeProspect(item)).filter((item) => item.negocio && item.telefono),
  };
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
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [form, setForm] = useState<ProspectForm>(EMPTY_FORM);
  const [search, setSearch] = useState('');
  const [rubroFilter, setRubroFilter] = useState('Todos');
  const [estadoFilter, setEstadoFilter] = useState('Todos');
  const [interesFilter, setInteresFilter] = useState('Todos');
  const [leadRubro, setLeadRubro] = useState<Rubro>('Pollería');
  const [leadZona, setLeadZona] = useState('Paita');
  const [leadFuente, setLeadFuente] = useState<Origen>('Google Maps');
  const [leadImportText, setLeadImportText] = useState('');
  const [leadCandidates, setLeadCandidates] = useState<LeadCandidate[]>(() => loadLeadCandidates());
  const [whatsAppMediaUrl, setWhatsAppMediaUrl] = useState('');
  const [dailyLogs, setDailyLogs] = useState<SalesDailyLog[]>(() => loadSalesDailyLogs());
  const [workdayStarted, setWorkdayStarted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [assistantProspect, setAssistantProspect] = useState<Prospect | null>(null);
  const [assistantIntent, setAssistantIntent] = useState<AssistantIntent>('Primer contacto');
  const [assistantDraft, setAssistantDraft] = useState('');
  const [assistantCopied, setAssistantCopied] = useState(false);
  const [lastBackupAt, setLastBackupAt] = useState(() => (
    typeof window === 'undefined' ? '' : window.localStorage.getItem(BACKUP_META_KEY) || ''
  ));
  const [openWaStatus, setOpenWaStatus] = useState<OpenWaStatus>('idle');
  const [openWaMessage, setOpenWaMessage] = useState('Modo simulacion hasta probar conexion.');
  const [testingOpenWa, setTestingOpenWa] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const backupInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let active = true;

    getStoredProspects([], normalizeProspect).then((storedProspects) => {
      const safeProspects = IS_PRODUCTION ? storedProspects.filter((item) => !item.isDemo) : storedProspects;
      if (IS_PRODUCTION && safeProspects.length !== storedProspects.length) {
        void replaceStoredProspects(safeProspects);
      }
      if (active) setProspects(safeProspects);
    });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    saveLeadCandidates(leadCandidates);
  }, [leadCandidates]);

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

  const dailyProgress = useMemo(() => {
    const current = today();
    const messagesToday = prospects.flatMap((prospect) => (
      (prospect.historialMensajes || []).map((message) => ({ ...message, prospect }))
    )).filter((item) => item.createdAt.slice(0, 10) === current);

    return {
      newContacts: messagesToday.filter((item) => item.status === 'sent_marked').length,
      followUps: messagesToday.filter((item) => item.status === 'prepared' || item.status === 'opened_whatsapp' || item.status === 'sent_marked').length,
      demosOffered: prospects.filter((item) => item.estado === 'Demo 30 días ofrecida' && item.fechaUltimoContacto === current).length,
      responses: messagesToday.filter((item) => item.status === 'answered').length,
      nextFollowUps: contactToday.length,
    };
  }, [contactToday.length, prospects]);

  const workdayFocusProspects = useMemo(() => {
    const seen = new Set<string>();
    return [...contactToday, ...prospects.filter((item) => item.estado === 'Nuevo')]
      .filter((item) => {
        if (seen.has(item.id)) return false;
        seen.add(item.id);
        return item.estado !== 'Cerrado' && item.estado !== 'Perdido';
      })
      .slice(0, 6);
  }, [contactToday, prospects]);

  const metrics = useMemo(() => ({
    total: prospects.length,
    contactados: prospects.filter((item) => item.estado !== 'Nuevo').length,
    interesados: prospects.filter((item) => item.estado === 'Interesado').length,
    demosOfrecidas: prospects.filter((item) => item.estado === 'Demo 30 días ofrecida').length,
    demosActivas: prospects.filter((item) => item.estado === 'Demo activa').length,
    cerrados: prospects.filter((item) => item.estado === 'Cerrado').length,
  }), [prospects]);

  const whatsappLimit = useMemo(() => {
    const sent = sentMessagesToday(prospects);
    return {
      limit: DEFAULT_DAILY_WHATSAPP_LIMIT,
      sent,
      remaining: remainingMessagesToday(prospects),
    };
  }, [prospects]);

  const setField = <K extends keyof ProspectForm>(key: K, value: ProspectForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const addProspect = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.negocio.trim() || !form.contacto.trim() || !form.telefono.trim()) return;
    const prospect = { ...form, id: `prospect-${Date.now().toString(36)}`, createdAt: new Date().toISOString(), isDemo: false };
    setProspects([prospect, ...prospects]);
    void saveStoredProspect(prospect, prospects);
    setForm(EMPTY_FORM);
  };

  const createLeadCandidate = () => {
    const zona = leadZona.trim();
    if (!zona) return;

    setLeadCandidates((current) => [
      {
        id: `lead-${Date.now().toString(36)}`,
        nombre: '',
        rubro: leadRubro,
        zona,
        link: buildPublicSearchUrl(leadFuente, leadRubro, zona),
        telefono: '',
        redSocial: '',
        contacto: '',
        interes: inferInterestFromRubro(leadRubro),
        fuente: leadFuente,
        nota: '',
      },
      ...current,
    ]);
  };

  const updateLeadCandidate = (id: string, patch: Partial<LeadCandidate>) => {
    setLeadCandidates((current) => current.map((candidate) => (
      candidate.id === id ? { ...candidate, ...patch, duplicateReason: '' } : candidate
    )));
  };

  const importLeadCandidates = () => {
    const imported = parseLeadText(leadImportText, leadRubro, leadFuente);
    if (imported.length === 0) {
      window.alert('Pega al menos una línea con nombre de negocio.');
      return;
    }
    setLeadCandidates((current) => [...imported, ...current]);
    setLeadImportText('');
  };

  const addLeadToCrm = (candidate: LeadCandidate) => {
    if (!candidate.nombre.trim()) {
      window.alert('Agrega el nombre del negocio antes de pasarlo al CRM.');
      return;
    }

    const duplicateReason = findDuplicateReason(candidate, prospects, leadCandidates);
    if (duplicateReason) {
      setLeadCandidates((current) => current.map((item) => (
        item.id === candidate.id ? { ...item, duplicateReason } : item
      )));
      return;
    }

    const prospect = normalizeProspect({
      negocio: candidate.nombre.trim(),
      rubro: candidate.rubro,
      zona: candidate.zona,
      contacto: candidate.contacto || 'Por confirmar',
      telefono: candidate.telefono,
      redSocial: candidate.redSocial || candidate.link,
      interes: candidate.interes,
      estado: 'Nuevo',
      fechaUltimoContacto: '',
      fechaProximoContacto: today(),
      nota: `${candidate.nota ? `${candidate.nota}\n` : ''}Prospecto revisado desde búsqueda pública. Link: ${candidate.link || 'sin link'}`,
      origen: candidate.fuente,
      createdAt: new Date().toISOString(),
      isDemo: false,
    });

    setProspects([prospect, ...prospects]);
    void saveStoredProspect(prospect, prospects);
    setLeadCandidates((current) => current.map((item) => (
      item.id === candidate.id ? { ...item, savedProspectId: prospect.id, duplicateReason: '' } : item
    )));
  };

  const updateProspect = (id: string, patch: Partial<Prospect>) => {
    setProspects(prospects.map((item) => item.id === id ? { ...item, ...patch } : item));
    void updateStoredProspect(id, patch, prospects);
  };

  const logWhatsAppAction = (prospect: Prospect, status: WhatsAppMessageLog['status'], patch: Partial<Prospect> = {}, messageOverride?: string, mediaUrl?: string) => {
    const message = messageOverride || getMessage(prospect.interes);
    const entry: WhatsAppMessageLog = {
      id: `wa-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      prospectId: prospect.id,
      phone: normalizePhone(prospect.telefono),
      interes: prospect.interes,
      message,
      status,
      createdAt: new Date().toISOString(),
      mediaUrl,
    };

    const patchWithHistory = {
      ultimoMensajeEnviado: message,
      historialMensajes: [entry, ...(prospect.historialMensajes || [])],
      ...patch,
    } as Partial<Prospect>;

    updateProspect(prospect.id, patchWithHistory);
  };

  const deleteProspect = (id: string) => {
    setProspects(prospects.filter((item) => item.id !== id));
    void deleteStoredProspect(id, prospects);
  };

  const importProspectList = (imported: Prospect[]) => {
    setProspects([...imported, ...prospects]);
    void importStoredProspects(imported, prospects);
  };

  const clearProspects = () => {
    setProspects([]);
    void replaceStoredProspects([]);
  };

  const loadDemoProspects = () => {
    if (!window.confirm('Esto agregará prospectos de ejemplo. ¿Deseas continuar?')) return;
    const existingIds = new Set(prospects.map((item) => item.id));
    const nextDemo = DEMO_PROSPECTS
      .filter((item) => !existingIds.has(item.id))
      .map((item) => ({ ...item, createdAt: new Date().toISOString(), isDemo: true }));

    if (nextDemo.length === 0) {
      window.alert('Los datos demo ya están cargados.');
      return;
    }

    const next = [...nextDemo, ...prospects];
    setProspects(next);
    void replaceStoredProspects(next);
  };

  const removeDemoProspects = () => {
    const next = prospects.filter((item) => !item.isDemo);
    if (next.length === prospects.length) {
      window.alert('No hay datos demo para eliminar.');
      return;
    }
    if (!window.confirm('Esto eliminará solo los prospectos marcados como demo. ¿Deseas continuar?')) return;
    setProspects(next);
    void replaceStoredProspects(next);
  };

  const clearCrm = () => {
    if (!window.confirm('Esto eliminará todos los prospectos e instalaciones guardadas en este navegador.')) return;
    if (!window.confirm('Confirmación final: se vaciará el CRM completo en este navegador. ¿Deseas continuar?')) return;
    clearProspects();
  };

  const startWorkday = () => {
    setWorkdayStarted(true);
    setSearch('');
    setRubroFilter('Todos');
    setEstadoFilter('Todos');
    setInteresFilter('Todos');
  };

  const closeWorkday = () => {
    const notes = window.prompt('Notas rápidas del cierre de jornada:', '') || '';
    const log: SalesDailyLog = {
      date: today(),
      newContacts: dailyProgress.newContacts,
      followUps: dailyProgress.followUps,
      demosOffered: dailyProgress.demosOffered,
      responses: dailyProgress.responses,
      nextFollowUps: dailyProgress.nextFollowUps,
      notes,
    };
    const nextLogs = [log, ...dailyLogs.filter((item) => item.date !== log.date)];
    setDailyLogs(nextLogs);
    saveSalesDailyLogs(nextLogs);
    window.alert(`Jornada cerrada:\nContactos hechos: ${log.newContacts}\nRespuestas recibidas: ${log.responses}\nDemos ofrecidas: ${log.demosOffered}\nPróximos seguimientos: ${log.nextFollowUps}`);
  };

  const copyMessage = async (prospect: Prospect) => {
    await navigator.clipboard.writeText(getMessage(prospect.interes));
    setCopiedId(prospect.id);
    logWhatsAppAction(prospect, 'copied');
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  const prepareMessage = (prospect: Prospect) => {
    logWhatsAppAction(prospect, 'prepared');
  };

  const openWhatsApp = (prospect: Prospect) => {
    logWhatsAppAction(prospect, 'opened_whatsapp');
    window.open(`https://wa.me/${normalizePhone(prospect.telefono)}?text=${encodeURIComponent(getMessage(prospect.interes))}`, '_blank', 'noopener,noreferrer');
  };

  const markSent = (prospect: Prospect) => {
    const blockReason = getSendBlockReason(prospects, prospect, DEFAULT_DAILY_WHATSAPP_LIMIT);
    if (blockReason) return;
    if (!window.confirm(`Confirmar que enviaste manualmente el mensaje a ${prospect.negocio}.`)) return;

    logWhatsAppAction(prospect, 'sent_marked', {
      estado: prospect.estado === 'Nuevo' ? 'Contactado' : prospect.estado,
      fechaUltimoContacto: today(),
      fechaUltimoMensaje: todayKey(),
      cantidadMensajesEnviados: prospect.cantidadMensajesEnviados + 1,
      estadoConversacion: 'Sin respuesta',
    });
  };

  const sendOpenWa = async (prospect: Prospect) => {
    const blockReason = getSendBlockReason(prospects, prospect, DEFAULT_DAILY_WHATSAPP_LIMIT);
    if (blockReason) return;
    const mediaUrl = whatsAppMediaUrl.trim();
    if (mediaUrl && !/^https?:\/\//.test(mediaUrl)) {
      window.alert('La imagen demo debe ser un enlace público http/https.');
      return;
    }
    if (!window.confirm(`Confirmar envío manual por OpenWA a ${prospect.negocio}.`)) return;

    try {
      const message = getMessage(prospect.interes);
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: prospect.telefono,
          message,
          prospectId: prospect.id,
          permissionContact: prospect.permisoContacto,
          sentToday: whatsappLimit.sent,
          confirmSend: true,
          mediaUrl,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        window.alert(data.message || 'No se pudo enviar por OpenWA.');
        return;
      }
      logWhatsAppAction(prospect, data.simulated ? 'openwa_simulated' : 'openwa_sent', {
        estado: prospect.estado === 'Nuevo' ? 'Contactado' : prospect.estado,
        fechaUltimoContacto: today(),
        fechaUltimoMensaje: todayKey(),
        cantidadMensajesEnviados: prospect.cantidadMensajesEnviados + 1,
        estadoConversacion: 'Sin respuesta',
      }, message, mediaUrl);
      window.alert(data.simulated ? 'Modo simulación: mensaje registrado sin envío real.' : 'Mensaje enviado por OpenWA.');
    } catch {
      window.alert('No se pudo conectar con la ruta OpenWA.');
    }
  };

  const markAnswered = (prospect: Prospect) => {
    logWhatsAppAction(prospect, 'answered', {
      estadoConversacion: 'Respondió',
      respuestaCliente: prospect.respuestaCliente || 'Respondió por WhatsApp',
      fechaUltimoContacto: today(),
    });
  };

  const markNoContact = (prospect: Prospect) => {
    logWhatsAppAction(prospect, 'blocked', {
      permisoContacto: 'No contactar',
      estadoConversacion: 'No contactar',
      estado: 'Perdido',
    });
  };

  const openAssistant = (prospect: Prospect) => {
    const recommendedIntent = getRecommendedIntent(prospect);
    setAssistantProspect(prospect);
    setAssistantIntent(recommendedIntent);
    setAssistantDraft(generateSalesMessage(prospect, recommendedIntent));
    setAssistantCopied(false);
  };

  const updateAssistantIntent = (intent: AssistantIntent) => {
    setAssistantIntent(intent);
    if (assistantProspect) {
      setAssistantDraft(generateSalesMessage(assistantProspect, intent));
    }
  };

  const copyAssistantDraft = async () => {
    if (!assistantDraft.trim()) return;
    await navigator.clipboard.writeText(assistantDraft);
    setAssistantCopied(true);
    window.setTimeout(() => setAssistantCopied(false), 1400);
  };

  const saveAssistantDraft = () => {
    if (!assistantProspect || !assistantDraft.trim()) return;
    logWhatsAppAction(assistantProspect, 'ai_saved', {
      ultimoMensajeEnviado: assistantDraft,
    }, assistantDraft);
  };

  const openAssistantWhatsApp = () => {
    if (!assistantProspect || !assistantDraft.trim()) return;
    window.open(`https://wa.me/${normalizePhone(assistantProspect.telefono)}?text=${encodeURIComponent(assistantDraft)}`, '_blank', 'noopener,noreferrer');
  };

  const testOpenWaConnection = async () => {
    setTestingOpenWa(true);
    try {
      const response = await fetch('/api/whatsapp/send', { method: 'GET', cache: 'no-store' });
      const data = await response.json();
      if (data.status === 'connected') {
        setOpenWaStatus('connected');
      } else if (data.status === 'not_configured') {
        setOpenWaStatus('not_configured');
      } else if (data.mode === 'simulation') {
        setOpenWaStatus('simulation');
      } else {
        setOpenWaStatus('error');
      }
      setOpenWaMessage(data.message || 'Estado OpenWA actualizado.');
    } catch {
      setOpenWaStatus('error');
      setOpenWaMessage('No se pudo probar la conexion OpenWA.');
    } finally {
      setTestingOpenWa(false);
    }
  };

  const importCsv = async (file: File) => {
    const text = await file.text();
    const imported = parseCsv(text);
    if (imported.length === 0) return;
    importProspectList(imported);
  };

  const exportBackupJson = () => {
    const exportedAt = new Date().toISOString();
    downloadJsonBackup(prospects, exportedAt);
    window.localStorage.setItem(BACKUP_META_KEY, exportedAt);
    setLastBackupAt(exportedAt);
  };

  const restoreBackupJson = async (file: File) => {
    try {
      const backup = parseBackupJson(await file.text());
      if (backup.prospects.length === 0) {
        window.alert('El backup no tiene prospectos válidos.');
        return;
      }

      if (!window.confirm(`Restaurar ${backup.prospects.length} prospectos y reemplazar los datos actuales?`)) return;

      setProspects(backup.prospects);
      await replaceStoredProspects(backup.prospects);
      if (backup.exportedAt) {
        window.localStorage.setItem(BACKUP_META_KEY, backup.exportedAt);
        setLastBackupAt(backup.exportedAt);
      }
    } catch {
      window.alert('No se pudo leer el backup JSON.');
    } finally {
      if (backupInputRef.current) backupInputRef.current.value = '';
    }
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
            <a href="/crm/installations" className="crm-button-secondary justify-center">Instalaciones</a>
            <button type="button" onClick={() => downloadCsv(filteredProspects)} className="crm-button-secondary"><Download size={16} />Exportar CSV</button>
            <button type="button" onClick={() => fileInputRef.current?.click()} className="crm-button-secondary"><FileUp size={16} />Importar CSV</button>
            {!IS_PRODUCTION && <button type="button" onClick={loadDemoProspects} className="crm-button-secondary"><Plus size={16} />Cargar demo CRM</button>}
            <button type="button" onClick={removeDemoProspects} className="crm-button-secondary"><RotateCcw size={16} />Eliminar datos demo</button>
            <button type="button" onClick={clearCrm} className="crm-button-danger"><Trash2 size={16} />Vaciar CRM</button>
            <input ref={fileInputRef} type="file" accept=".csv,text/csv" className="hidden" onChange={(event) => event.target.files?.[0] && importCsv(event.target.files[0])} />
          </div>
        </header>

        <section className="mb-6">
          <DailySalesPlanPanel
            progress={dailyProgress}
            logs={dailyLogs}
            focusProspects={workdayFocusProspects}
            started={workdayStarted}
            onStart={startWorkday}
            onClose={closeWorkday}
          />
        </section>

        <section className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-6">
          <MetricCard label="Prospectos totales" value={metrics.total} />
          <MetricCard label="Contactados" value={metrics.contactados} />
          <MetricCard label="Interesados" value={metrics.interesados} />
          <MetricCard label="Demos ofrecidas" value={metrics.demosOfrecidas} />
          <MetricCard label="Demos activas" value={metrics.demosActivas} />
          <MetricCard label="Cerrados" value={metrics.cerrados} />
        </section>

        <section className="mb-6">
          <BackupPanel
            lastBackupAt={lastBackupAt}
            onExport={exportBackupJson}
            onRestore={() => backupInputRef.current?.click()}
          />
          <input
            ref={backupInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => event.target.files?.[0] && restoreBackupJson(event.target.files[0])}
          />
        </section>

        <section className="mb-6">
          <WhatsAppLimitPanel sent={whatsappLimit.sent} remaining={whatsappLimit.remaining} limit={whatsappLimit.limit} />
        </section>

        <section className="mb-6">
          <WhatsAppMediaPanel mediaUrl={whatsAppMediaUrl} onChange={setWhatsAppMediaUrl} />
        </section>

        <section className="mb-6">
          <OpenWaStatusPanel
            status={openWaStatus}
            message={openWaMessage}
            testing={testingOpenWa}
            onTest={testOpenWaConnection}
          />
        </section>

        <section className="mb-6">
          <LeadProspectingPanel
            rubro={leadRubro}
            zona={leadZona}
            fuente={leadFuente}
            importText={leadImportText}
            prospects={prospects}
            candidates={leadCandidates}
            onRubroChange={setLeadRubro}
            onZonaChange={setLeadZona}
            onFuenteChange={setLeadFuente}
            onImportTextChange={setLeadImportText}
            onCreateCandidate={createLeadCandidate}
            onImportCandidates={importLeadCandidates}
            onExportCandidates={() => downloadLeadCandidatesCsv(leadCandidates)}
            onUpdateCandidate={updateLeadCandidate}
            onAddToCrm={addLeadToCrm}
            onPrepareSaved={(prospectId) => {
              const saved = prospects.find((item) => item.id === prospectId);
              if (saved) prepareMessage(saved);
            }}
          />
        </section>

        <section className="mb-6 grid gap-5 xl:grid-cols-[1fr_420px]">
          <OfferCard />
          <TodayList prospects={contactToday} copiedId={copiedId} onCopy={copyMessage} onUpdate={updateProspect} onPrepare={prepareMessage} onOpenWhatsApp={openWhatsApp} onSendOpenWa={sendOpenWa} onMarkSent={markSent} onMarkAnswered={markAnswered} onNoContact={markNoContact} onOpenAssistant={openAssistant} allProspects={prospects} />
        </section>

        <section className="mb-6">
          <Pipeline prospects={filteredProspects} copiedId={copiedId} onCopy={copyMessage} onUpdate={updateProspect} onPrepare={prepareMessage} onOpenWhatsApp={openWhatsApp} onSendOpenWa={sendOpenWa} onMarkSent={markSent} onMarkAnswered={markAnswered} onNoContact={markNoContact} onOpenAssistant={openAssistant} allProspects={prospects} />
        </section>

        <section className="mb-6">
          <FollowupsView prospects={filteredProspects} />
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
            <ProspectList prospects={filteredProspects} copiedId={copiedId} onCopy={copyMessage} onUpdate={updateProspect} onDelete={deleteProspect} onPrepare={prepareMessage} onOpenWhatsApp={openWhatsApp} onSendOpenWa={sendOpenWa} onMarkSent={markSent} onMarkAnswered={markAnswered} onNoContact={markNoContact} onOpenAssistant={openAssistant} allProspects={prospects} />
          </div>
        </section>
      </div>
      {assistantProspect && (
        <SalesAssistantModal
          prospect={assistantProspect}
          intent={assistantIntent}
          draft={assistantDraft}
          copied={assistantCopied}
          onClose={() => setAssistantProspect(null)}
          onIntentChange={updateAssistantIntent}
          onDraftChange={setAssistantDraft}
          onCopy={copyAssistantDraft}
          onSave={saveAssistantDraft}
          onOpenWhatsApp={openAssistantWhatsApp}
        />
      )}
    </main>
  );
}

function DailySalesPlanPanel({
  progress,
  logs,
  focusProspects,
  started,
  onStart,
  onClose,
}: {
  progress: Pick<SalesDailyLog, 'newContacts' | 'followUps' | 'demosOffered' | 'responses' | 'nextFollowUps'>;
  logs: SalesDailyLog[];
  focusProspects: Prospect[];
  started: boolean;
  onStart: () => void;
  onClose: () => void;
}) {
  const goals = [
    { label: 'Contactos nuevos hoy', value: progress.newContacts, target: 10 },
    { label: 'Seguimientos hechos hoy', value: progress.followUps, target: 3 },
    { label: 'Demos ofrecidas hoy', value: progress.demosOffered, target: 1 },
  ];
  const actions = ['Agrega 5 pollerías/restaurantes', 'Agrega 5 ferreterías', 'Contacta prospectos nuevos', 'Da seguimiento a interesados', 'Agenda demo si responde'];

  return (
    <div className="crm-card p-5 sm:p-6">
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="crm-eyebrow mb-2">Plan de ventas de hoy</p>
              <h2 className="crm-section-title text-2xl">Rutina diaria FACTUSYS</h2>
              <p className="crm-muted mt-1 text-sm">Meta simple para avanzar sin desorden: nuevos contactos, seguimientos y demos ofrecidas.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <button type="button" className="crm-button-primary justify-center" onClick={onStart}>Empezar jornada</button>
              <button type="button" className="crm-button-secondary justify-center" onClick={onClose}>Cerrar jornada</button>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            {goals.map((goal) => {
              const percent = Math.min((goal.value / goal.target) * 100, 100);
              return (
                <div key={goal.label} className="crm-mini-card rounded-2xl p-4">
                  <p className="crm-muted text-xs font-bold uppercase">{goal.label}</p>
                  <p className="crm-number mt-2">{goal.value}/{goal.target}</p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-black/10">
                    <div className="h-full rounded-full bg-neon transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="crm-note">
              <p className="mb-2 font-bold">Acciones recomendadas</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {actions.map((action) => (
                  <span key={action} className="flex items-center gap-2 text-sm"><CheckCircle2 size={15} className="text-neon" />{action}</span>
                ))}
              </div>
            </div>
            <div className="crm-note">
              <p className="font-bold">Resumen rápido</p>
              <p className="mt-1 text-sm">Respuestas recibidas: {progress.responses}</p>
              <p className="text-sm">Próximos seguimientos: {progress.nextFollowUps}</p>
            </div>
          </div>

          {started && (
            <div className="mt-4">
              <p className="crm-muted mb-2 text-xs font-bold uppercase">Enfoque de jornada</p>
              <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                {focusProspects.length === 0 && <p className="crm-note text-sm">No hay nuevos ni seguimientos vencidos. Agrega prospectos desde Buscar prospectos.</p>}
                {focusProspects.map((prospect) => (
                  <div key={prospect.id} className="crm-mini-card rounded-xl p-3">
                    <p className="font-bold text-slate-900">{prospect.negocio}</p>
                    <p className="crm-muted text-xs">{prospect.estado} · {prospect.fechaProximoContacto || 'sin seguimiento'}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside className="crm-mini-card rounded-2xl p-4">
          <div className="mb-3 flex items-center justify-between gap-3">
            <div>
              <h3 className="crm-section-title text-base">Historial de jornadas</h3>
              <p className="crm-muted text-xs">Últimos 7 días guardados</p>
            </div>
            <CalendarClock className="text-neon" size={22} />
          </div>
          <div className="space-y-2">
            {logs.slice(0, 7).length === 0 && <p className="crm-muted rounded-xl border border-dashed border-black/10 p-3 text-center text-xs">Aún no cierras ninguna jornada.</p>}
            {logs.slice(0, 7).map((log) => (
              <div key={log.date} className="rounded-xl border border-black/10 bg-white/50 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-slate-900">{log.date}</p>
                  <span className="crm-badge">{log.newContacts} contactos</span>
                </div>
                <p className="crm-muted mt-1 text-xs">Seguimientos {log.followUps} · Demos {log.demosOffered} · Respuestas {log.responses}</p>
                {log.notes && <p className="crm-muted mt-1 line-clamp-2 text-xs">{log.notes}</p>}
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
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

function formatBackupDate(value: string) {
  if (!value) return 'Sin backup registrado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString('es-PE', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function BackupPanel({ lastBackupAt, onExport, onRestore }: { lastBackupAt: string; onExport: () => void; onRestore: () => void }) {
  return (
    <div className="crm-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="crm-eyebrow mb-2">Backup del CRM</p>
          <h2 className="crm-section-title">Exportar backup JSON completo</h2>
          <p className="crm-muted mt-1 text-sm">Recomendación: haz un backup semanal antes de importar datos o hacer cambios grandes.</p>
          <p className="crm-note mt-3 text-sm"><strong>Fecha de último backup:</strong> {formatBackupDate(lastBackupAt)}</p>
        </div>
        <div className="flex flex-col gap-2 sm:min-w-[260px]">
          <button type="button" onClick={onExport} className="crm-button-secondary justify-center"><Download size={16} />Exportar backup JSON</button>
          <button type="button" onClick={onRestore} className="crm-button-primary justify-center"><FileUp size={16} />Restaurar datos</button>
          <p className="crm-muted text-center text-xs">Importar backup JSON completo reemplaza los datos actuales.</p>
        </div>
      </div>
    </div>
  );
}

function WhatsAppLimitPanel({ sent, remaining, limit }: { sent: number; remaining: number; limit: number }) {
  const blocked = remaining <= 0;

  return (
    <div className="crm-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="crm-eyebrow mb-2">Límite WhatsApp de hoy</p>
          <h2 className="crm-section-title">Envío manual y controlado</h2>
          <p className="crm-muted mt-1 text-sm">No hay envío real automático. Cada mensaje se prepara, copia o marca manualmente desde el CRM.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:min-w-[320px]">
          <div className="crm-mini-card rounded-xl p-4">
            <span className="crm-muted text-xs font-bold uppercase">Enviados hoy</span>
            <p className="crm-number mt-2">{sent}/{limit}</p>
          </div>
          <div className="crm-mini-card rounded-xl p-4">
            <span className="crm-muted text-xs font-bold uppercase">Restantes</span>
            <p className={`crm-number mt-2 ${blocked ? 'text-red-500' : ''}`}>{remaining}</p>
          </div>
        </div>
      </div>
      {blocked && <p className="crm-note mt-4 text-sm">Límite diario alcanzado. El botón “Marcar como enviado” queda bloqueado hasta mañana.</p>}
    </div>
  );
}

function WhatsAppMediaPanel({ mediaUrl, onChange }: { mediaUrl: string; onChange: (value: string) => void }) {
  return (
    <div className="crm-card p-5">
      <div className="grid gap-4 lg:grid-cols-[1fr_420px] lg:items-end">
        <div>
          <p className="crm-eyebrow mb-2">Imagen demo para WhatsApp</p>
          <h2 className="crm-section-title">Enviar texto + imagen con OpenWA</h2>
          <p className="crm-muted mt-1 text-sm">Pega un enlace público de una captura o imagen demo. Solo se usará cuando confirmes “Enviar OpenWA”.</p>
        </div>
        <input
          className="crm-input"
          value={mediaUrl}
          onChange={(event) => onChange(event.target.value)}
          placeholder="https://.../demo-factusys.jpg"
        />
      </div>
    </div>
  );
}

function OpenWaStatusPanel({
  status,
  message,
  testing,
  onTest,
}: {
  status: OpenWaStatus;
  message: string;
  testing: boolean;
  onTest: () => void;
}) {
  const labelByStatus: Record<OpenWaStatus, string> = {
    idle: 'Modo simulacion',
    connected: 'Conectado',
    not_configured: 'No configurado',
    error: 'Error',
    simulation: 'Modo simulacion',
  };

  const statusClass = status === 'connected'
    ? 'text-neon'
    : status === 'error'
      ? 'text-red-500'
      : 'text-yellow-500';

  return (
    <div className="crm-card p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="crm-eyebrow mb-2">Estado OpenWA</p>
          <h2 className="crm-section-title">Bridge WhatsApp controlado</h2>
          <p className="crm-muted mt-1 text-sm">El CRM no envía automático. El bridge solo se usa después de confirmación manual y con límite diario.</p>
          <p className="crm-note mt-3 text-sm"><strong className={statusClass}>{labelByStatus[status]}</strong> · {message}</p>
        </div>
        <button type="button" onClick={onTest} disabled={testing} className="crm-button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50">
          <Wifi size={16} />
          {testing ? 'Probando...' : 'Probar conexión'}
        </button>
      </div>
    </div>
  );
}

function LeadProspectingPanel({
  rubro,
  zona,
  fuente,
  importText,
  prospects,
  candidates,
  onRubroChange,
  onZonaChange,
  onFuenteChange,
  onImportTextChange,
  onCreateCandidate,
  onImportCandidates,
  onExportCandidates,
  onUpdateCandidate,
  onAddToCrm,
  onPrepareSaved,
}: {
  rubro: Rubro;
  zona: string;
  fuente: Origen;
  importText: string;
  prospects: Prospect[];
  candidates: LeadCandidate[];
  onRubroChange: (value: Rubro) => void;
  onZonaChange: (value: string) => void;
  onFuenteChange: (value: Origen) => void;
  onImportTextChange: (value: string) => void;
  onCreateCandidate: () => void;
  onImportCandidates: () => void;
  onExportCandidates: () => void;
  onUpdateCandidate: (id: string, patch: Partial<LeadCandidate>) => void;
  onAddToCrm: (candidate: LeadCandidate) => void;
  onPrepareSaved: (prospectId: string) => void;
}) {
  const mapsUrl = buildPublicSearchUrl('maps', rubro, zona);
  const facebookUrl = buildPublicSearchUrl('facebook', rubro, zona);
  const instagramUrl = buildPublicSearchUrl('instagram', rubro, zona);
  const tiktokUrl = buildPublicSearchUrl('tiktok', rubro, zona);

  return (
    <div className="crm-card p-5">
      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="crm-eyebrow mb-2">Prospección local</p>
          <h2 className="crm-section-title">Buscar negocios y revisar antes de contactar</h2>
          <p className="crm-muted mt-1 max-w-3xl text-sm">Flujo controlado: buscas datos públicos, revisas nombre, zona, teléfono o red social, agregas al CRM y recién preparas el mensaje.</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-[150px_1fr_150px_auto] lg:min-w-[720px]">
          <Select value={rubro} options={LEAD_SEARCH_RUBROS} onChange={(value) => onRubroChange(value as Rubro)} />
          <input className="crm-input" value={zona} onChange={(event) => onZonaChange(event.target.value)} placeholder="Zona o ciudad, ej. Paita" />
          <Select value={fuente} options={LEAD_SOURCES} onChange={(value) => onFuenteChange(value as Origen)} />
          <button type="button" className="crm-button-primary justify-center" onClick={onCreateCandidate}><Plus size={16} />Agregar candidato</button>
        </div>
      </div>

      <div className="mb-4 grid gap-2 md:grid-cols-4">
        <a className="crm-button-secondary justify-center" href={mapsUrl} target="_blank" rel="noreferrer">Google Maps</a>
        <a className="crm-button-secondary justify-center" href={facebookUrl} target="_blank" rel="noreferrer">Facebook</a>
        <a className="crm-button-secondary justify-center" href={instagramUrl} target="_blank" rel="noreferrer">Instagram</a>
        <a className="crm-button-secondary justify-center" href={tiktokUrl} target="_blank" rel="noreferrer">TikTok</a>
      </div>

      {candidates.length === 0 && (
        <div className="crm-note text-sm">
          Ejemplo de uso: busca “pollerías en Paita”, abre Maps o Facebook, revisa cada negocio y pulsa “Agregar candidato” para copiar los datos encontrados sin inventar información.
        </div>
      )}

      <div className="my-4 grid gap-3 lg:grid-cols-[1fr_auto]">
        <textarea
          className="crm-input min-h-28 resize-none text-sm"
          value={importText}
          onChange={(event) => onImportTextChange(event.target.value)}
          placeholder={'Pega varios prospectos, uno por línea:\nPollería El Buen Sabor | Paita | 999999999 | Facebook\nFerretería San José | Piura | 988888888 | Google Maps'}
        />
        <button type="button" className="crm-button-secondary justify-center self-stretch" onClick={onImportCandidates}>
          <FileUp size={16} />
          Importar texto
        </button>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="crm-section-title text-base">Prospectos encontrados</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span className="crm-badge">{candidates.length} en revisión</span>
          <button type="button" className="crm-button-secondary min-h-0 px-3 py-2 text-xs" onClick={onExportCandidates}>
            <Download size={14} />
            Exportar Excel/CSV
          </button>
        </div>
      </div>

      <div className="grid gap-3">
        {candidates.map((candidate) => (
          <div key={candidate.id} className={`crm-mini-card rounded-2xl p-4 ${candidate.savedProspectId ? 'border-neon/50 bg-neon/5' : ''}`}>
            <div className="grid gap-3 lg:grid-cols-[1.2fr_130px_1fr_1fr_1fr]">
              <input className="crm-input" value={candidate.nombre} disabled={Boolean(candidate.savedProspectId)} onChange={(event) => onUpdateCandidate(candidate.id, { nombre: event.target.value })} placeholder="Nombre del negocio" />
              <Select value={candidate.rubro} options={RUBROS} onChange={(value) => onUpdateCandidate(candidate.id, { rubro: value as Rubro, interes: inferInterestFromRubro(value as Rubro) })} />
              <input className="crm-input" value={candidate.zona} disabled={Boolean(candidate.savedProspectId)} onChange={(event) => onUpdateCandidate(candidate.id, { zona: event.target.value })} placeholder="Zona" />
              <input className="crm-input" value={candidate.telefono} disabled={Boolean(candidate.savedProspectId)} onChange={(event) => onUpdateCandidate(candidate.id, { telefono: event.target.value })} placeholder="Teléfono/WhatsApp" />
              <Select value={candidate.interes} options={INTERESES} onChange={(value) => onUpdateCandidate(candidate.id, { interes: value as Interes })} />
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-[150px_1fr_1fr_1fr]">
              <Select value={candidate.fuente} options={LEAD_SOURCES} onChange={(value) => onUpdateCandidate(candidate.id, { fuente: value as Origen })} />
              <input className="crm-input" value={candidate.link} disabled={Boolean(candidate.savedProspectId)} onChange={(event) => onUpdateCandidate(candidate.id, { link: event.target.value })} placeholder="Link público" />
              <input className="crm-input" value={candidate.redSocial} disabled={Boolean(candidate.savedProspectId)} onChange={(event) => onUpdateCandidate(candidate.id, { redSocial: event.target.value })} placeholder="Facebook / Instagram / TikTok" />
              <input className="crm-input" value={candidate.nota} disabled={Boolean(candidate.savedProspectId)} onChange={(event) => onUpdateCandidate(candidate.id, { nota: event.target.value })} placeholder="Nota" />
            </div>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="crm-muted text-xs">
                {candidate.savedProspectId
                  ? 'Guardado en CRM. Ya puedes preparar mensaje desde este prospecto.'
                  : findDuplicateReason(candidate, prospects, candidates) || candidate.duplicateReason || 'Sin duplicados detectados'}
              </p>
              {candidate.savedProspectId ? (
                <button type="button" className="crm-button-secondary justify-center" onClick={() => onPrepareSaved(candidate.savedProspectId || '')}>Preparar mensaje</button>
              ) : (
                <button type="button" className="crm-button-primary justify-center" onClick={() => onAddToCrm(candidate)}>Agregar al CRM</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FollowupsView({ prospects }: { prospects: Prospect[] }) {
  const groups = [
    {
      title: 'Contactados sin respuesta',
      items: prospects.filter((item) => item.estadoConversacion === 'Sin respuesta' && item.fechaUltimoMensaje),
    },
    {
      title: 'Interesados',
      items: prospects.filter((item) => item.estado === 'Interesado' || item.estadoConversacion === 'Interesado'),
    },
    {
      title: 'Demos activas',
      items: prospects.filter((item) => item.estado === 'Demo activa' || item.estadoConversacion === 'Demo activa'),
    },
    {
      title: 'No contactar',
      items: prospects.filter((item) => item.permisoContacto === 'No contactar' || item.estadoConversacion === 'No contactar'),
    },
  ];

  return (
    <div className="crm-card p-4">
      <div className="mb-4">
        <h2 className="crm-section-title">Seguimientos</h2>
        <p className="crm-muted text-sm">Vista rápida para saber a quién insistir, quién respondió y quién queda bloqueado.</p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {groups.map((group) => (
          <div key={group.title} className="crm-pipeline-column rounded-2xl p-3">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="crm-muted text-xs font-bold uppercase tracking-wide">{group.title}</h3>
              <span className="crm-badge">{group.items.length}</span>
            </div>
            <div className="space-y-2">
              {group.items.slice(0, 4).map((item) => (
                <div key={`${group.title}-${item.id}`} className="crm-mini-card rounded-xl p-3">
                  <p className="font-bold text-slate-900">{item.negocio}</p>
                  <p className="crm-muted text-xs">{item.telefono} · {item.interes}</p>
                </div>
              ))}
              {group.items.length === 0 && <p className="crm-muted rounded-xl border border-dashed border-black/10 p-3 text-center text-xs">Sin pendientes</p>}
            </div>
          </div>
        ))}
      </div>
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

type WhatsAppActions = {
  allProspects: Prospect[];
  onPrepare: (p: Prospect) => void;
  onOpenWhatsApp: (p: Prospect) => void;
  onSendOpenWa: (p: Prospect) => void;
  onMarkSent: (p: Prospect) => void;
  onMarkAnswered: (p: Prospect) => void;
  onNoContact: (p: Prospect) => void;
  onOpenAssistant: (p: Prospect) => void;
};

function TodayList({ prospects, copiedId, onCopy, onUpdate, ...actions }: { prospects: Prospect[]; copiedId: string | null; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void } & WhatsAppActions) {
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
          <QuickProspect key={prospect.id} prospect={prospect} copied={copiedId === prospect.id} onCopy={onCopy} onUpdate={onUpdate} {...actions} />
        ))}
      </div>
    </div>
  );
}

function Pipeline({ prospects, copiedId, onCopy, onUpdate, ...actions }: { prospects: Prospect[]; copiedId: string | null; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void } & WhatsAppActions) {
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
                    <QuickProspect key={prospect.id} prospect={prospect} copied={copiedId === prospect.id} compact onCopy={onCopy} onUpdate={onUpdate} {...actions} />
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
        <Field label="Permiso de contacto"><Select value={form.permisoContacto} options={PERMISOS_CONTACTO} onChange={(value) => setField('permisoContacto', value as ContactPermission)} /></Field>
        <Field label="Estado conversación"><Select value={form.estadoConversacion} options={ESTADOS_CONVERSACION} onChange={(value) => setField('estadoConversacion', value as ConversationStatus)} /></Field>
        <Field label="Fecha último contacto"><input className="crm-input" type="date" value={form.fechaUltimoContacto} onChange={(e) => setField('fechaUltimoContacto', e.target.value)} /></Field>
        <Field label="Próximo seguimiento"><input className="crm-input" type="date" value={form.fechaProximoContacto} onChange={(e) => setField('fechaProximoContacto', e.target.value)} /></Field>
        <Field label="Origen"><Select value={form.origen} options={ORIGENES} onChange={(value) => setField('origen', value as Origen)} /></Field>
        <Field label="Respuesta cliente"><input className="crm-input" value={form.respuestaCliente} onChange={(e) => setField('respuestaCliente', e.target.value)} /></Field>
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

function ProspectList({ prospects, copiedId, onCopy, onUpdate, onDelete, ...actions }: { prospects: Prospect[]; copiedId: string | null; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void; onDelete: (id: string) => void } & WhatsAppActions) {
  return (
    <div className="space-y-3">
      {prospects.length === 0 && <div className="crm-card p-10 text-center"><Users className="mx-auto mb-3 text-neon" /><h3 className="crm-section-title">No tienes prospectos todavía</h3><p className="crm-muted mx-auto mt-1 max-w-md text-sm">Agrega tu primer negocio para empezar a vender FACTUSYS.</p></div>}
      {prospects.map((prospect) => (
        <article key={prospect.id} className="crm-card p-4 sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2"><h3 className="crm-prospect-title">{prospect.negocio}</h3><span className="crm-badge">{prospect.rubro}</span><span className={`crm-interest crm-interest-${prospect.interes.toLowerCase()}`}>{prospect.interes}</span>{prospect.isDemo && <span className="crm-badge">Demo</span>}</div>
              <div className="crm-muted grid gap-1 text-sm sm:grid-cols-2">
                <p><strong>Contacto:</strong> {prospect.contacto}</p><p><strong>WhatsApp:</strong> {prospect.telefono}</p>
                <p><strong>Zona:</strong> {prospect.zona || 'Sin zona'}</p><p><strong>Origen:</strong> {prospect.origen}</p>
                <p><strong>Red:</strong> {prospect.redSocial || 'No registrada'}</p><p><strong>Último contacto:</strong> {prospect.fechaUltimoContacto || 'Sin registro'}</p>
                <p><strong>Permiso:</strong> {prospect.permisoContacto}</p><p><strong>Conversación:</strong> {prospect.estadoConversacion}</p>
                <p><strong>Último WA:</strong> {prospect.fechaUltimoMensaje || 'Sin envío'}</p><p><strong>Mensajes:</strong> {prospect.cantidadMensajesEnviados}</p>
              </div>
              {prospect.nota && <p className="crm-note mt-3"><strong>Nota:</strong> {prospect.nota}</p>}
              {prospect.respuestaCliente && <p className="crm-note mt-2"><strong>Respuesta:</strong> {prospect.respuestaCliente}</p>}
              {prospect.ultimoMensajeEnviado && <p className="crm-note mt-2 line-clamp-3"><strong>Último mensaje:</strong> {prospect.ultimoMensajeEnviado}</p>}
            </div>
            <div className="flex min-w-full flex-col gap-2 sm:min-w-[285px]">
              <Select value={prospect.estado} options={ESTADOS} onChange={(value) => onUpdate(prospect.id, { estado: value as Estado })} />
              <Select value={prospect.permisoContacto} options={PERMISOS_CONTACTO} onChange={(value) => onUpdate(prospect.id, { permisoContacto: value as ContactPermission })} />
              <Select value={prospect.estadoConversacion} options={ESTADOS_CONVERSACION} onChange={(value) => onUpdate(prospect.id, { estadoConversacion: value as ConversationStatus })} />
              <input className="crm-input" type="date" value={prospect.fechaProximoContacto} onChange={(e) => onUpdate(prospect.id, { fechaProximoContacto: e.target.value })} />
              <input className="crm-input" value={prospect.respuestaCliente} onChange={(e) => onUpdate(prospect.id, { respuestaCliente: e.target.value })} placeholder="Respuesta del cliente" />
              <ActionButtons prospect={prospect} copied={copiedId === prospect.id} onCopy={onCopy} onUpdate={onUpdate} onDelete={onDelete} {...actions} />
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}

function QuickProspect({ prospect, copied, compact, onCopy, onUpdate, allProspects, onPrepare, onOpenWhatsApp, onSendOpenWa, onMarkAnswered, onNoContact, onOpenAssistant }: { prospect: Prospect; copied: boolean; compact?: boolean; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void } & WhatsAppActions) {
  const blockReason = getSendBlockReason(allProspects, prospect, DEFAULT_DAILY_WHATSAPP_LIMIT);

  return (
    <div className="crm-mini-card rounded-xl p-3">
      <p className="font-bold text-slate-900">{prospect.negocio}</p>
      <p className="crm-muted text-xs">{prospect.contacto} · {prospect.telefono}</p>
      {!compact && <p className="crm-muted mt-1 text-xs">Seguimiento: {prospect.fechaProximoContacto || 'sin fecha'}</p>}
      <p className="crm-muted mt-1 text-xs">WA: {prospect.permisoContacto} · {prospect.estadoConversacion}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button type="button" className="crm-button-ghost min-h-0 justify-center px-3 py-2 text-xs" onClick={() => onPrepare(prospect)}>Preparar</button>
        <button type="button" className="crm-button-secondary min-h-0 flex-1 justify-center px-3 py-2 text-xs" onClick={() => onCopy(prospect)}>{copied ? 'Copiado' : 'Copiar'}</button>
        <button type="button" className="crm-button-primary min-h-0 justify-center px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(blockReason)} title={blockReason || 'Abrir WhatsApp'} onClick={() => onOpenWhatsApp(prospect)}><MessageCircle size={13} />WA</button>
        <button type="button" className="crm-button-secondary min-h-0 justify-center px-3 py-2 text-xs disabled:cursor-not-allowed disabled:opacity-50" disabled={Boolean(blockReason)} title={blockReason || 'Enviar con OpenWA'} onClick={() => onSendOpenWa(prospect)}>OpenWA</button>
      </div>
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button type="button" className="crm-button-ghost min-h-0 justify-center px-3 py-2 text-xs" onClick={() => onMarkAnswered(prospect)}>Respondió</button>
        <button type="button" className="crm-button-ghost min-h-0 justify-center px-3 py-2 text-xs" onClick={() => onNoContact(prospect)}>No contactar</button>
      </div>
      <button type="button" className="crm-button-secondary mt-2 min-h-0 w-full justify-center px-3 py-2 text-xs" onClick={() => onOpenAssistant(prospect)}><Sparkles size={13} />Asistente IA</button>
      <button type="button" className="crm-button-ghost mt-2 min-h-0 w-full justify-center px-3 py-2 text-xs" onClick={() => onUpdate(prospect.id, { estado: 'Contactado', fechaUltimoContacto: today() })}>Marcar contactado</button>
      {blockReason && <p className="crm-muted mt-2 text-xs">{blockReason}</p>}
    </div>
  );
}

function ActionButtons({ prospect, copied, onCopy, onUpdate, onDelete, allProspects, onPrepare, onOpenWhatsApp, onSendOpenWa, onMarkSent, onMarkAnswered, onNoContact, onOpenAssistant }: { prospect: Prospect; copied: boolean; onCopy: (p: Prospect) => void; onUpdate: (id: string, patch: Partial<Prospect>) => void; onDelete: (id: string) => void } & WhatsAppActions) {
  const blockReason = getSendBlockReason(allProspects, prospect, DEFAULT_DAILY_WHATSAPP_LIMIT);

  return (
    <div className="grid grid-cols-2 gap-2">
      <button type="button" onClick={() => onPrepare(prospect)} className="crm-button-ghost justify-center">Preparar mensaje</button>
      <button type="button" onClick={() => onCopy(prospect)} className="crm-button-secondary justify-center"><Clipboard size={15} />{copied ? 'Copiado' : 'Copiar'}</button>
      <button type="button" onClick={() => onOpenWhatsApp(prospect)} disabled={Boolean(blockReason)} title={blockReason || 'Abrir WhatsApp'} className="crm-button-primary justify-center disabled:cursor-not-allowed disabled:opacity-50"><MessageCircle size={15} />Abrir WhatsApp</button>
      <button type="button" onClick={() => onSendOpenWa(prospect)} disabled={Boolean(blockReason)} title={blockReason || 'Enviar por OpenWA'} className="crm-button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50">Enviar OpenWA</button>
      <button type="button" onClick={() => onMarkSent(prospect)} disabled={Boolean(blockReason)} title={blockReason || 'Marcar como enviado'} className="crm-button-secondary justify-center disabled:cursor-not-allowed disabled:opacity-50">Marcar enviado</button>
      <button type="button" onClick={() => onMarkAnswered(prospect)} className="crm-button-secondary justify-center">Marcar respondió</button>
      <button type="button" onClick={() => onNoContact(prospect)} className="crm-button-ghost justify-center">No contactar</button>
      <button type="button" onClick={() => onOpenAssistant(prospect)} className="crm-button-secondary col-span-2 justify-center"><Sparkles size={15} />Asistente IA</button>
      <button type="button" onClick={() => onUpdate(prospect.id, { estado: 'Contactado', fechaUltimoContacto: today() })} className="crm-button-secondary justify-center">Contactado</button>
      <button type="button" onClick={() => onUpdate(prospect.id, { fechaProximoContacto: today() })} className="crm-button-secondary justify-center">Seguir hoy</button>
      {blockReason && <p className="crm-muted col-span-2 text-xs">{blockReason}</p>}
      <button type="button" onClick={() => onDelete(prospect.id)} className="crm-button-ghost col-span-2 justify-center"><Trash2 size={15} />Eliminar</button>
    </div>
  );
}

function SalesAssistantModal({
  prospect,
  intent,
  draft,
  copied,
  onClose,
  onIntentChange,
  onDraftChange,
  onCopy,
  onSave,
  onOpenWhatsApp,
}: {
  prospect: Prospect;
  intent: AssistantIntent;
  draft: string;
  copied: boolean;
  onClose: () => void;
  onIntentChange: (intent: AssistantIntent) => void;
  onDraftChange: (value: string) => void;
  onCopy: () => void;
  onSave: () => void;
  onOpenWhatsApp: () => void;
}) {
  const recommendedIntent = getRecommendedIntent(prospect);
  const nextAction = getNextAction(prospect);
  const history = prospect.historialMensajes.slice(0, 5);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={onClose}>
      <div className="crm-card max-h-[92vh] w-full max-w-5xl overflow-hidden" onClick={(event) => event.stopPropagation()}>
        <div className="flex items-start justify-between gap-4 border-b border-black/10 p-5">
          <div>
            <p className="crm-eyebrow mb-2">Asistente IA comercial</p>
            <h2 className="crm-section-title text-2xl">{prospect.negocio}</h2>
            <p className="crm-muted mt-1 text-sm">Plantillas locales editables. No se conecta API de IA y no se envía automático.</p>
          </div>
          <button type="button" className="crm-button-ghost min-h-0 px-3 py-2" onClick={onClose} aria-label="Cerrar asistente">
            <X size={18} />
          </button>
        </div>

        <div className="grid max-h-[76vh] gap-5 overflow-auto p-5 lg:grid-cols-[360px_1fr]">
          <aside className="space-y-4">
            <div className="crm-mini-card rounded-2xl p-4">
              <h3 className="crm-section-title text-base">Datos del prospecto</h3>
              <div className="crm-muted mt-3 space-y-1 text-sm">
                <p><strong>Contacto:</strong> {prospect.contacto}</p>
                <p><strong>Rubro:</strong> {prospect.rubro}</p>
                <p><strong>Interés:</strong> {prospect.interes}</p>
                <p><strong>Estado:</strong> {prospect.estado}</p>
                <p><strong>Conversación:</strong> {prospect.estadoConversacion}</p>
                <p><strong>WhatsApp:</strong> {prospect.telefono}</p>
              </div>
            </div>

            <div className="crm-note">
              <p className="font-bold">Próxima acción recomendada</p>
              <p className="mt-1 text-sm">{nextAction}</p>
              <p className="mt-2 text-xs">Tipo sugerido: {recommendedIntent}</p>
            </div>

            <div className="crm-mini-card rounded-2xl p-4">
              <h3 className="crm-section-title text-base">Historial</h3>
              <div className="mt-3 space-y-2">
                {history.length === 0 && <p className="crm-muted text-sm">Sin mensajes guardados todavía.</p>}
                {history.map((item) => (
                  <div key={item.id} className="crm-note text-xs">
                    <p className="font-bold">{item.status} · {item.createdAt.slice(0, 10)}</p>
                    <p className="mt-1 line-clamp-3">{item.message}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <section className="space-y-4">
            <div>
              <label className="block">
                <span className="crm-label">Tipo de mensaje</span>
                <Select value={intent} options={ASSISTANT_INTENTS} onChange={(value) => onIntentChange(value as AssistantIntent)} />
              </label>
              <p className="crm-muted mt-2 text-xs">{getAssistantContextNote(intent)}</p>
            </div>

            <label className="block">
              <span className="crm-label">Texto editable</span>
              <textarea
                className="crm-input min-h-[260px] resize-none text-sm leading-relaxed"
                value={draft}
                onChange={(event) => onDraftChange(event.target.value)}
              />
            </label>

            <div className="grid gap-2 sm:grid-cols-3">
              <button type="button" className="crm-button-secondary justify-center" onClick={onCopy}><Clipboard size={15} />{copied ? 'Copiado' : 'Copiar respuesta'}</button>
              <button type="button" className="crm-button-secondary justify-center" onClick={onSave}><CheckCircle2 size={15} />Guardar en historial</button>
              <button type="button" className="crm-button-primary justify-center" onClick={onOpenWhatsApp}><MessageCircle size={15} />Abrir WhatsApp</button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block"><span className="crm-label">{label}</span>{children}</label>;
}

function Select({ value, options, onChange }: { value: string; options: string[]; onChange: (value: string) => void }) {
  return <select className="crm-input" value={value} onChange={(e) => onChange(e.target.value)}>{options.map((item) => <option key={item}>{item}</option>)}</select>;
}
