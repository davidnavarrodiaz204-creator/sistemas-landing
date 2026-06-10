'use client';

import { useEffect, useState, useCallback } from 'react';
import InternalGuard from '@/components/InternalGuard';
import type { InboxThread, InboxMessage } from './types';
import { ThreadList, MessageList, ThreadSidebar } from './components/InboxPanel';
import {
  ArrowLeft, Inbox, MessageCircle, RefreshCw, Wifi, Smartphone, Globe, Mail, Loader2, Search, Shield, Bug, CheckCircle, Settings,
} from 'lucide-react';

const CHANNEL_FILTERS = ['TODAS', 'WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'EMAIL'] as const;

export default function CrmInboxPage() {
  return (
    <InternalGuard>
      <InboxCopilot />
    </InternalGuard>
  );
}

function InboxCopilot() {
  const [threads, setThreads] = useState<InboxThread[]>([]);
  const [activeId, setActiveId] = useState('');
  const [messages, setMessages] = useState<InboxMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [dbConnected, setDbConnected] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>('TODAS');
  const [search, setSearch] = useState('');
  const [openwaStatus, setOpenwaStatus] = useState<string>('');
  const [responseMode, setResponseMode] = useState<string>('copiloto');
  const [showQa, setShowQa] = useState(false);

  const fetchThreads = useCallback(async () => {
    if (!dbConnected) { setLoading(false); return; }
    try {
      const res = await fetch(`/api/crm/inbox/threads?channel=${channelFilter}`);
      const data = await res.json();
      if (data.ok) setThreads(data.threads || []);
    } catch { /* ignore */ }
    setLoading(false);
  }, [dbConnected, channelFilter]);

  const fetchMessages = useCallback(async (threadId: string) => {
    if (!threadId || !dbConnected) return;
    setMessagesLoading(true);
    try {
      const res = await fetch(`/api/crm/inbox/messages?threadId=${threadId}`);
      const data = await res.json();
      if (data.ok) setMessages(data.messages || []);
    } catch { setMessages([]); }
    setMessagesLoading(false);
  }, [dbConnected]);

  useEffect(() => {
    fetch('/api/crm/db-status').then(r => r.json()).then(d => setDbConnected(d.ok === true)).catch(() => setDbConnected(false));
    fetch('/api/crm/settings/channels?mode=1').then(r => r.json()).then(d => {
      if (d.mode) setResponseMode(d.mode);
    }).catch(() => {});
  }, []);

  useEffect(() => { if (dbConnected) fetchThreads(); }, [dbConnected, fetchThreads]);

  useEffect(() => {
    if (activeId) fetchMessages(activeId);
  }, [activeId, fetchMessages]);

  const refreshOpenWa = async () => {
    try {
      const res = await fetch('/api/crm/inbox/openwa');
      const data = await res.json();
      setOpenwaStatus(data.mode || 'not_configured');
    } catch { setOpenwaStatus('error'); }
  };

  const handleSelectThread = (id: string) => {
    setActiveId(id);
  };

  const active = threads.find((t) => t.id === activeId);

  const handleReply = async (body: string) => {
    if (!active || !body.trim()) return;
    setMessagesLoading(true);
    try {
      const res = await fetch('/api/crm/inbox/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send', threadId: active.id, body,
          channel: active.channel, phone: active.phone,
          prospectId: active.prospect_id, intent: 'OTRO',
        }),
      });
      const data = await res.json();
      if (data.ok) {
        if (activeId) fetchMessages(activeId);
        fetchThreads();
      }
    } catch { /* ignore */ }
    setMessagesLoading(false);
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const handleOpenChannel = () => {
    if (active?.channel === 'WHATSAPP' && active.phone) {
      const cleaned = active.phone.replace(/\D/g, '').replace(/^0+/, '');
      window.open(`https://wa.me/${cleaned.startsWith('51') ? cleaned : `51${cleaned}`}`, '_blank');
    }
  };

  const handleCloseThread = async () => {
    if (!active) return;
    if (!window.confirm('¿Cerrar esta conversación?')) return;
    await fetch('/api/crm/inbox/threads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'close', threadId: active.id }),
    });
    fetchThreads();
    setActiveId('');
  };

  const handleMarkInterested = async () => {
    if (!active) return;
    if (!active.prospect_id) {
      try {
        const createRes = await fetch('/api/crm/prospects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'create', businessName: active.contact_name || active.contact_handle || 'Inbox',
            rubro: 'Otro', ciudad: '', phone: active.channel === 'WHATSAPP' ? active.contact_handle : '',
            source: active.channel,
          }),
        });
        const createData = await createRes.json();
        if (createData.ok && createData.prospect?.id) {
          await fetch('/api/crm/inbox/threads', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'link_prospect', threadId: active.id, prospectId: createData.prospect.id }),
          });
          await fetch('/api/crm/prospects', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'updateStatus', prospectId: createData.prospect.id, status: 'INTERESADO' }),
          });
          fetchThreads();
          return;
        }
      } catch { /* ignore */ }
    }
    if (active.prospect_id) {
      await fetch('/api/crm/prospects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'updateStatus', prospectId: active.prospect_id, status: 'INTERESADO' }),
      });
    }
  };

  const filteredThreads = search.trim()
    ? threads.filter((t) =>
        t.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
        t.contact_handle?.toLowerCase().includes(search.toLowerCase()) ||
        t.lastMessage?.toLowerCase().includes(search.toLowerCase()),
      )
    : threads;

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 text-slate-950 transition dark:bg-[#050811] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <a href="/crm" className="mb-4 inline-flex min-h-0 items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
              <ArrowLeft size={14} /> Volver al CRM
            </a>
            <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">CRM FACTUSYS</p>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Bandeja copiloto</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-500">
              Recibe mensajes de WhatsApp, Facebook, Instagram y Email. El asistente detecta intención y sugiere respuestas. Tú apruebas y envías.
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <ChannelStatusCard
              dbConnected={dbConnected}
              openwaStatus={openwaStatus}
              onRefresh={refreshOpenWa}
            />
            <div className="flex gap-2">
              <span className={`rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase ${
                responseMode === 'manual' ? 'bg-slate-100 text-slate-600' :
                responseMode === 'automatico_limitado' ? 'bg-amber-100 text-amber-700' :
                'bg-emerald-100 text-emerald-700'
              }`}>
                <Shield size={11} className="inline" /> {responseMode === 'manual' ? 'Manual' : responseMode === 'automatico_limitado' ? 'Auto limitado' : 'Copiloto'}
              </span>
              <button type="button" onClick={() => setShowQa(v => !v)}
                className={`flex items-center gap-1 rounded-xl border px-3 py-1.5 text-[10px] font-bold transition-colors ${
                  showQa ? 'border-emerald-400 bg-emerald-50 text-emerald-700' : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                <Bug size={11} /> QA
              </button>
              <a href="/crm/settings/channels" className="flex items-center gap-1 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                <Settings size={11} /> Canales
              </a>
            </div>
          </div>
        </header>

        {showQa && <QaChecklistInline />}

        <section className="mb-4 flex flex-wrap gap-2">
          {CHANNEL_FILTERS.map((ch) => (
            <button
              key={ch}
              type="button"
              onClick={() => setChannelFilter(ch)}
              className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
                channelFilter === ch
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {ch === 'TODAS' ? 'Todas' : ch === 'WHATSAPP' ? 'WhatsApp' : ch === 'FACEBOOK' ? 'Facebook' : ch === 'INSTAGRAM' ? 'Instagram' : 'Email'}
            </button>
          ))}
        </section>

        <section className="grid min-h-[680px] gap-5 lg:grid-cols-[380px_1fr_260px]">
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-xs font-bold uppercase text-slate-500">Conversaciones</p>
              <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100" onClick={() => { setLoading(true); fetchThreads(); }}>
                <RefreshCw size={11} /> Actualizar
              </button>
            </div>
            <div className="relative mb-3">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input className="w-full rounded-xl border-2 border-slate-200 bg-white py-2 pl-9 pr-3 text-xs font-bold outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar..." />
            </div>
            <div className="max-h-[580px] overflow-y-auto">
              <ThreadList threads={filteredThreads} activeId={activeId} onSelect={handleSelectThread} loading={loading} />
            </div>
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            {active ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase text-slate-500">{active.channel} · {active.contact_handle || ''}</p>
                    <h2 className="text-xl font-black text-slate-900 dark:text-white">{active.contact_name || 'Sin nombre'}</h2>
                    {active.business_name && <p className="text-xs text-slate-400">{active.business_name} · {active.rubro || ''}</p>}
                  </div>
                </div>
                {messagesLoading ? (
                  <div className="flex justify-center py-8"><Loader2 size={18} className="animate-spin text-slate-400" /></div>
                ) : (
                  <MessageList messages={messages} thread={active} onReply={handleReply} onCopy={handleCopy} onOpenChannel={handleOpenChannel} />
                )}
              </>
            ) : (
              <div className="flex h-full items-center justify-center p-10 text-center">
                <div>
                  <Inbox className="mx-auto mb-3 text-slate-300" size={32} />
                  <p className="font-bold text-slate-500">Selecciona una conversación</p>
                  <p className="mt-1 text-xs text-slate-400">El copiloto analizará el mensaje y sugerirá una respuesta</p>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border-2 border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-3 text-xs font-bold uppercase text-slate-500">Detalles</p>
            {active ? (
              <ThreadSidebar
                thread={active}
                onClose={handleCloseThread}
                onMarkInterested={handleMarkInterested}
                onScheduleDemo={() => {
                  if (active.prospect_id) window.location.href = `/crm/automation?demo=${active.prospect_id}`;
                }}
              />
            ) : (
              <p className="text-xs text-slate-400">Selecciona un hilo para ver detalles</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

function QaChecklistInline() {
  const steps = [
    { num: 1, label: 'Llega mensaje' },
    { num: 2, label: 'Se crea conversación' },
    { num: 3, label: 'Se detecta intención' },
    { num: 4, label: 'Se sugiere respuesta' },
    { num: 5, label: 'Editas/apruebas' },
    { num: 6, label: 'Se envía o abre canal' },
    { num: 7, label: 'Se guarda mensaje saliente' },
    { num: 8, label: 'Si pide demo, agenda' },
    { num: 9, label: 'Si no interesa, No contactar' },
  ];
  return (
    <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-2 flex items-center gap-2">
        <CheckCircle size={14} className="text-emerald-500" />
        <p className="text-xs font-bold uppercase text-slate-500">QA — Flujo real del inbox</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {steps.map((s) => (
          <div key={s.num} className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2.5 py-1.5 dark:bg-emerald-900/20">
            <span className="flex h-4 w-4 items-center justify-center rounded bg-emerald-200 text-[8px] font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">{s.num}</span>
            <span className="text-[10px] font-bold text-slate-700 dark:text-slate-300">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChannelStatusCard({
  dbConnected, openwaStatus, onRefresh,
}: {
  dbConnected: boolean; openwaStatus: string; onRefresh: () => void;
}) {
  return (
    <div className="min-w-[240px] rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500">
            <Wifi size={12} /> PostgreSQL
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${dbConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
            {dbConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500">
            <Smartphone size={12} /> WhatsApp API
          </span>
          <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${openwaStatus === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
            {openwaStatus === 'connected' ? 'Conectado' : openwaStatus || 'Simulado'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500">
            <Globe size={12} /> Meta API
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">Preparado</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-500">
            <Mail size={12} /> Email
          </span>
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500">Preparado</span>
        </div>
      </div>
      <button type="button" className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100" onClick={onRefresh}>
        <RefreshCw size={11} /> Probar conexiones
      </button>
    </div>
  );
}
