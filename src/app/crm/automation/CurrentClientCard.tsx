'use client';

import { useState, useRef } from 'react';
import { Copy, Smartphone, Globe, Camera, Send, CheckCircle, XCircle, Calendar, ArrowRight, Loader2, Music, MessageSquare, Wrench, Zap, ChevronDown, Save, History, Edit3, Monitor, Wifi } from 'lucide-react';

export type ClienteActual = {
  id?: string;
  negocio: string;
  rubro: string;
  ciudad: string;
  telefono: string;
  email: string;
  facebookLink: string;
  instagramLink: string;
  tiktokLink: string;
  web: string;
  message: string;
  score: { total: number; max: number; label: string; color: string };
  status?: string;
};

const STATUS_BUTTONS: Array<{ key: string; label: string; color: string; bg: string; hover: string; icon: React.ReactNode }> = [
  { key: 'CONTACTADO', label: 'Contactado', color: 'text-amber-800', bg: 'bg-amber-50', hover: 'hover:bg-amber-100', icon: <CheckCircle size={13} /> },
  { key: 'RESPONDIO', label: 'Respondió', color: 'text-sky-800', bg: 'bg-sky-50', hover: 'hover:bg-sky-100', icon: <MessageSquare size={13} /> },
  { key: 'INTERESADO', label: 'Interesado', color: 'text-emerald-800', bg: 'bg-emerald-50', hover: 'hover:bg-emerald-100', icon: <CheckCircle size={13} /> },
  { key: 'DEMO_AGENDADA', label: 'Demo agendada', color: 'text-purple-800', bg: 'bg-purple-50', hover: 'hover:bg-purple-100', icon: <Calendar size={13} /> },
  { key: 'DEMO_ACTIVA', label: 'Demo activa', color: 'text-indigo-800', bg: 'bg-indigo-50', hover: 'hover:bg-indigo-100', icon: <Zap size={13} /> },
  { key: 'INSTALACION', label: 'Instalación', color: 'text-cyan-800', bg: 'bg-cyan-50', hover: 'hover:bg-cyan-100', icon: <Wrench size={13} /> },
  { key: 'PRODUCCION', label: 'Producción', color: 'text-slate-800', bg: 'bg-slate-100', hover: 'hover:bg-slate-200', icon: <CheckCircle size={13} /> },
  { key: 'NO_CONTACTAR', label: 'No contactar', color: 'text-red-800', bg: 'bg-red-50', hover: 'hover:bg-red-100', icon: <XCircle size={13} /> },
];

const STATUS_PILL: Record<string, string> = {
  NUEVO: 'bg-blue-100 text-blue-700',
  CONTACTADO: 'bg-amber-100 text-amber-700',
  RESPONDIO: 'bg-sky-100 text-sky-700',
  INTERESADO: 'bg-emerald-100 text-emerald-700',
  DEMO_AGENDADA: 'bg-purple-100 text-purple-700',
  DEMO_ACTIVA: 'bg-indigo-100 text-indigo-700',
  INSTALACION: 'bg-cyan-100 text-cyan-700',
  PRODUCCION: 'bg-slate-200 text-slate-700',
  NO_CONTACTAR: 'bg-red-100 text-red-700',
};

export function CurrentClientCard({
  client, dbConnected,
  onCopyMessage, onOpenWhatsApp, onOpenFacebook, onOpenInstagram,
  onUpdateStatus, onNextClient, onNextClientLoading, onPreviewWhatsApp,
  onSendEmail, onScheduleDemo, onScheduleInstallation,
}: {
  client: ClienteActual | null;
  dbConnected: boolean;
  onCopyMessage: (msg: string) => void;
  onOpenWhatsApp: (phone: string, msg: string) => void;
  onOpenFacebook: (url: string) => void;
  onOpenInstagram: (url: string) => void;
  onUpdateStatus: (prospectId: string | undefined, action: string) => void;
  onNextClient: () => void;
  onNextClientLoading?: boolean;
  onPreviewWhatsApp?: (phone: string, msg: string, negocio: string, rubro: string, ciudad: string, contacto: string) => void;
  onSendEmail: (email: string, msg: string, negocio: string) => void;
  onScheduleDemo?: (prospectId: string | undefined, businessName: string) => void;
  onScheduleInstallation?: (prospectId: string | undefined, businessName: string) => void;
}) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [note, setNote] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [noteMsg, setNoteMsg] = useState('');
  const prevIdRef = useRef(client?.id);

  if (client?.id !== prevIdRef.current) {
    prevIdRef.current = client?.id;
    setNote('');
    setNoteMsg('');
    setHistoryOpen(false);
  }

  const saveNote = async () => {
    if (!client?.id || !note.trim()) return;
    setSavingNote(true);
    try {
      await fetch('/api/crm/prospects', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: client.id, notes: note }),
      });
      setNoteMsg('Nota guardada.');
    } catch { setNoteMsg('Error al guardar.'); }
    setSavingNote(false);
  };

  if (!client) return null;

  const statusPillClass = client.status ? (STATUS_PILL[client.status] || 'bg-slate-100 text-slate-600') : '';

  return (
    <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Cliente actual</p>
          <h2 className="text-xl font-black text-slate-900 dark:text-white">{client.negocio}</h2>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white"
            style={{ backgroundColor: client.score.color }}
            title={`Oportunidad: ${client.score.label}`}
          >
            {client.score.total}
          </span>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
            {client.rubro}
          </span>
          {client.status && (
            <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusPillClass}`}>
              {client.status}
            </span>
          )}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        {client.telefono && <InfoRow label="Teléfono" value={client.telefono} />}
        {client.ciudad && <InfoRow label="Ciudad" value={client.ciudad} />}
        {client.email && <InfoRow label="Email" value={client.email} />}
        {client.web && <InfoRow label="Web" value={client.web} href={client.web} />}
        {client.facebookLink && <InfoRow label="Facebook" value={client.facebookLink} href={client.facebookLink} />}
        {client.instagramLink && <InfoRow label="Instagram" value={client.instagramLink} href={client.instagramLink} />}
      </div>

      <div className="mb-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm italic text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
        {client.message}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <ActionButton icon={<Copy size={14} />} label="Copiar mensaje" onClick={() => onCopyMessage(client.message)} type="secondary" />
        {client.telefono && (
          <ActionButton icon={<Smartphone size={14} />} label="Abrir WhatsApp" onClick={() => {
            if (onPreviewWhatsApp) {
              onPreviewWhatsApp(client.telefono, client.message, client.negocio, client.rubro, client.ciudad, client.negocio);
            } else {
              onOpenWhatsApp(client.telefono, client.message);
            }
          }} type="primary" />
        )}
        {client.facebookLink && (
          <ActionButton icon={<Globe size={14} />} label="Facebook" onClick={() => onOpenFacebook(client.facebookLink)} type="secondary" />
        )}
        {client.instagramLink && (
          <ActionButton icon={<Camera size={14} />} label="Instagram" onClick={() => onOpenInstagram(client.instagramLink)} type="secondary" />
        )}
        {client.tiktokLink && (
          <ActionButton icon={<Music size={14} />} label="TikTok" onClick={() => window.open(client.tiktokLink, '_blank')} type="secondary" />
        )}
        {client.email && (
          <ActionButton icon={<Send size={14} />} label="Enviar correo" onClick={() => onSendEmail(client.email, client.message, client.negocio)} type="secondary" />
        )}
      </div>

      {client.id && (
        <div className="mb-4 rounded-xl border border-purple-100 bg-purple-50 p-3 dark:border-purple-800 dark:bg-purple-900/20">
          <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-purple-500">Acciones rápidas</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-purple-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-purple-600 active:scale-[0.97]"
              onClick={() => onScheduleDemo?.(client.id, client.negocio)}
            >
              <Wifi size={13} /> Agendar demo
            </button>
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-xl bg-cyan-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-cyan-600 active:scale-[0.97]"
              onClick={() => onScheduleInstallation?.(client.id, client.negocio)}
            >
              <Monitor size={13} /> Crear instalación
            </button>
          </div>
        </div>
      )}

      <div className="mb-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <p className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-500">Marcar estado</p>
        <div className="flex flex-wrap gap-2">
          {STATUS_BUTTONS.map((btn) => (
            <button
              key={btn.key}
              type="button"
              disabled={!dbConnected}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-bold transition-all active:scale-[0.97] disabled:opacity-40 ${btn.bg} ${btn.color} ${btn.hover}`}
              onClick={() => onUpdateStatus(client.id, btn.key)}
            >
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
        {!dbConnected && (
          <p className="mt-2 text-xs text-amber-600">Conecta PostgreSQL para guardar estados y seguimiento automático.</p>
        )}
      </div>

      <div className="mb-4 border-t border-slate-200 pt-4 dark:border-slate-700">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 text-left transition-colors hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700"
          onClick={() => setHistoryOpen(!historyOpen)}
        >
          <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
            <History size={14} /> Nota rápida e historial
          </span>
          <ChevronDown size={14} className={`text-slate-400 transition-transform ${historyOpen ? 'rotate-180' : ''}`} />
        </button>
        {historyOpen && (
          <div className="mt-3 space-y-3">
            <div>
              <label className="mb-1 block text-[10px] font-bold uppercase text-slate-400">
                <Edit3 size={11} className="inline" /> Nota sobre este cliente
              </label>
              <textarea
                className="min-h-[60px] w-full resize-none rounded-xl border-2 border-slate-200 bg-white p-3 text-xs outline-none transition-colors focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ej: cliente pidió llamada a las 5pm..."
              />
              <div className="mt-2 flex items-center gap-2">
                <button
                  type="button"
                  disabled={savingNote || !note.trim() || !client.id || !dbConnected}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-[11px] font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-40"
                  onClick={saveNote}
                >
                  {savingNote ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Guardar nota
                </button>
                {noteMsg && <span className="text-[10px] text-emerald-600">{noteMsg}</span>}
              </div>
            </div>
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={onNextClientLoading}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-700 transition-all hover:bg-slate-50 active:scale-[0.98] disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        onClick={onNextClient}
      >
        {onNextClientLoading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
        {onNextClientLoading ? 'Buscando...' : 'Siguiente cliente'}
      </button>
    </div>
  );
}

function InfoRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = href
    ? <a href={href} target="_blank" rel="noopener noreferrer" className="truncate text-sm font-bold text-blue-600 hover:underline">{value}</a>
    : <span className="truncate text-sm font-bold text-slate-900 dark:text-white">{value}</span>;
  return (
    <div className="rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-800">
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
      {content}
    </div>
  );
}

function ActionButton({ icon, label, onClick, type }: { icon: React.ReactNode; label: string; onClick: () => void; type: 'primary' | 'secondary' }) {
  const base = 'flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all active:scale-[0.97]';
  const style = type === 'primary'
    ? `${base} bg-emerald-500 text-white hover:bg-emerald-600`
    : `${base} border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700`;
  return (
    <button type="button" className={style} onClick={onClick}>
      {icon} {label}
    </button>
  );
}