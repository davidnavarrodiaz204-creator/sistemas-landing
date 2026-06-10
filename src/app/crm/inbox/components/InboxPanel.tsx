'use client';

import type { InboxThread, InboxMessage } from '../types';
import { MessageCircle, Send, Clipboard, Copy, Smartphone, Globe, Bot, Brain, Check, ChevronDown, Calendar } from 'lucide-react';
import { useState } from 'react';

const INTENT_LABELS: Record<string, string> = {
  PIDE_DEMO: 'Pide demo', PIDE_PRECIO: 'Pide precio', PREGUNTA_FUNCIONES: 'Pregunta funciones',
  OCUPADO: 'Ocupado', NO_INTERESA: 'No interesa', QUIERE_LLAMADA: 'Quiere llamada',
  SOPORTE: 'Soporte', OTRO: 'Otro',
};

const INTENT_COLORS: Record<string, string> = {
  PIDE_DEMO: 'bg-purple-100 text-purple-700', PIDE_PRECIO: 'bg-amber-100 text-amber-700',
  PREGUNTA_FUNCIONES: 'bg-blue-100 text-blue-700', OCUPADO: 'bg-slate-100 text-slate-600',
  NO_INTERESA: 'bg-red-100 text-red-700', QUIERE_LLAMADA: 'bg-emerald-100 text-emerald-700',
  SOPORTE: 'bg-cyan-100 text-cyan-700', OTRO: 'bg-slate-100 text-slate-500',
};

export function ThreadList({
  threads, activeId, onSelect, loading,
}: {
  threads: InboxThread[];
  activeId: string;
  onSelect: (id: string) => void;
  loading: boolean;
}) {
  if (loading) return <div className="flex justify-center py-8"><div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" /></div>;
  if (threads.length === 0) return <div className="p-8 text-center text-sm text-slate-400">Sin conversaciones activas</div>;
  return (
    <div className="space-y-1">
      {threads.map((t) => (
        <button
          key={t.id}
          type="button"
          onClick={() => onSelect(t.id)}
          className={`w-full rounded-xl p-3 text-left transition-colors ${t.id === activeId ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800'}`}
        >
          <div className="flex items-center justify-between">
            <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{t.contact_name || t.contact_handle || 'Sin nombre'}</p>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">{t.channel}</span>
          </div>
          <p className="truncate text-xs text-slate-400">{t.last_message_at ? new Date(t.last_message_at).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</p>
          <p className="mt-1 truncate text-xs text-slate-500">{t.lastMessage || '—'}</p>
          <div className="mt-1.5 flex items-center gap-2">
            {t.lastIntent && <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${INTENT_COLORS[t.lastIntent] || 'bg-slate-100 text-slate-500'}`}>{INTENT_LABELS[t.lastIntent] || t.lastIntent}</span>}
            <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${t.status === 'PENDING' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{t.status}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

export function MessageList({
  messages, thread,
  onReply, onCopy, onOpenChannel,
}: {
  messages: InboxMessage[];
  thread: InboxThread;
  onReply: (body: string) => void;
  onCopy: (text: string) => void;
  onOpenChannel: () => void;
}) {
  const [customReply, setCustomReply] = useState('');
  const [expandedSuggest, setExpandedSuggest] = useState<string | null>(null);

  const inbound = messages.filter((m) => m.direction === 'INBOUND');
  const latestInbound = inbound[inbound.length - 1];

  return (
    <div className="space-y-4">
      {messages.length === 0 && (
        <div className="rounded-xl border-2 border-dashed border-slate-200 p-6 text-center text-sm text-slate-400 dark:border-slate-700">
          Sin mensajes en esta conversación
        </div>
      )}

      {messages.map((m, i) => (
        <div key={m.id || i} className={`rounded-xl p-4 ${m.direction === 'INBOUND' ? 'border border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800' : 'border border-emerald-200 bg-emerald-50 dark:border-emerald-800 dark:bg-emerald-900/20'}`}>
          <div className="mb-1 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase text-slate-400">{m.direction === 'INBOUND' ? 'Recibido' : 'Enviado'}</span>
            <span className="text-[10px] text-slate-400">{m.created_at ? new Date(m.created_at).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
          </div>
          <p className="whitespace-pre-wrap text-sm text-slate-900 dark:text-white">{m.body || '—'}</p>
          {m.intent && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${INTENT_COLORS[m.intent] || 'bg-slate-100 text-slate-500'}`}>
                <Brain size={10} className="inline" /> {INTENT_LABELS[m.intent] || m.intent}
              </span>
              {m.suggested_reply && (
                <div>
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700"
                    onClick={() => setExpandedSuggest(expandedSuggest === m.id ? null : m.id)}
                  >
                    <Bot size={10} /> Sugerencia <ChevronDown size={10} className={`transition-transform ${expandedSuggest === m.id ? 'rotate-180' : ''}`} />
                  </button>
                  {expandedSuggest === m.id && (
                    <div className="mt-2 rounded-lg border border-emerald-200 bg-white p-3 dark:border-emerald-700 dark:bg-slate-800">
                      <p className="text-xs italic text-emerald-800 dark:text-emerald-200">{m.suggested_reply}</p>
                      <div className="mt-2 flex gap-2">
                        <button type="button" className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-emerald-600" onClick={() => onReply(m.suggested_reply)}>
                          <Send size={10} /> Usar respuesta
                        </button>
                        <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100" onClick={() => onCopy(m.suggested_reply)}>
                          <Clipboard size={10} /> Copiar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {latestInbound?.suggested_reply && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="mb-1 text-[10px] font-bold uppercase text-emerald-600">Respuesta sugerida</p>
          <p className="text-sm italic text-emerald-900 dark:text-emerald-200">{latestInbound.suggested_reply}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button type="button" className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97]" onClick={() => onReply(latestInbound.suggested_reply)}>
              <Send size={12} /> Usar respuesta
            </button>
            <button type="button" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 transition-all hover:bg-slate-100" onClick={() => onCopy(latestInbound.suggested_reply)}>
              <Clipboard size={12} /> Copiar
            </button>
            {thread.channel === 'WHATSAPP' && (
              <button type="button" className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97]" onClick={onOpenChannel}>
                <Smartphone size={12} /> Abrir WhatsApp
              </button>
            )}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
        <textarea
          className="min-h-[60px] w-full resize-none bg-transparent text-sm outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
          value={customReply}
          onChange={(e) => setCustomReply(e.target.value)}
          placeholder="Escribe tu respuesta personalizada..."
        />
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            disabled={!customReply.trim()}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-40"
            onClick={() => { onReply(customReply); setCustomReply(''); }}
          >
            <Send size={12} /> Enviar
          </button>
        </div>
      </div>
    </div>
  );
}

export function ThreadSidebar({
  thread, onClose, onMarkInterested, onScheduleDemo,
}: {
  thread: InboxThread;
  onClose: () => void;
  onMarkInterested: () => void;
  onScheduleDemo: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <p className="text-[10px] font-bold uppercase text-slate-400">Canal</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{thread.channel}</p>
      </div>
      {thread.contact_handle && (
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
          <p className="text-[10px] font-bold uppercase text-slate-400">Contacto</p>
          <p className="text-sm font-bold text-slate-900 dark:text-white">{thread.contact_handle}</p>
        </div>
      )}
      <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800">
        <p className="text-[10px] font-bold uppercase text-slate-400">Estado</p>
        <p className="text-sm font-bold text-slate-900 dark:text-white">{thread.status}</p>
      </div>
      {thread.prospect_id && (
        <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
          <p className="text-[10px] font-bold uppercase text-amber-600">Vinculado a prospecto</p>
          <p className="truncate text-xs text-amber-800 dark:text-amber-200">{thread.prospect_id}</p>
        </div>
      )}

      <div className="space-y-2">
        <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97]" onClick={onMarkInterested}>
          <Check size={13} /> Convertir en interesado
        </button>
        <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-purple-500 px-4 py-2.5 text-xs font-bold text-white transition-all hover:bg-purple-600 active:scale-[0.97]" onClick={onScheduleDemo}>
          <Calendar size={13} /> Agendar demo
        </button>
        <button type="button" className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-300 bg-white px-4 py-2.5 text-xs font-bold text-red-600 transition-all hover:bg-red-50" onClick={onClose}>
          Cerrar conversación
        </button>
      </div>
    </div>
  );
}
