'use client';

import { useEffect, useState } from 'react';
import InternalGuard from '@/components/InternalGuard';
import { ArrowLeft, Wifi, Smartphone, Globe, Mail, Database, Webhook, RefreshCw, CheckCircle, XCircle, AlertCircle, HelpCircle, Play, Shield, FileText } from 'lucide-react';

type CheckResult = {
  ok: boolean;
  message: string;
};

type ChannelCheck = { configured: boolean; status: string; detail?: string };
type ChannelChecks = Record<string, ChannelCheck>;

type ChannelsData = {
  ok: boolean;
  checks: ChannelChecks;
  env: { total: number; configured: number; missing: number; missingVars: string[] };
  mode: string;
};

const CHANNEL_CONFIG = [
  { key: 'postgresql', label: 'PostgreSQL', icon: Database, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'openwa', label: 'WhatsApp API (OpenWA)', icon: Smartphone, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { key: 'smtp', label: 'SMTP Email', icon: Mail, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  { key: 'imap', label: 'IMAP Email', icon: Mail, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { key: 'facebook', label: 'Facebook Messenger', icon: Globe, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { key: 'instagram', label: 'Instagram Business', icon: Globe, color: 'text-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  { key: 'meta_webhook', label: 'Meta Webhook', icon: Webhook, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { key: 'webhook_url', label: 'URL Pública Webhook', icon: Globe, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800' },
];

export default function ChannelsSettingsPage() {
  return (
    <InternalGuard>
      <SettingsContent />
    </InternalGuard>
  );
}

function SettingsContent() {
  const [data, setData] = useState<ChannelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState(false);
  const [testResults, setTestResults] = useState<Record<string, CheckResult> | null>(null);
  const [mode, setModeState] = useState('copiloto');
  const [activeTab, setActiveTab] = useState<'channels' | 'tester' | 'qa'>('channels');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/crm/settings/channels');
      const d = await res.json();
      setData(d);
      setModeState(d.mode || 'copiloto');
    } catch { /* ignore */ }
    setLoading(false);
  };

  const testAll = async () => {
    setTesting(true);
    setTestResults(null);
    try {
      const res = await fetch('/api/crm/settings/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test_all' }),
      });
      const d = await res.json();
      setTestResults(d.results || {});
    } catch { /* ignore */ }
    setTesting(false);
  };

  const setMode = async (newMode: string) => {
    try {
      await fetch('/api/crm/settings/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'set_mode', mode: newMode }),
      });
      setModeState(newMode);
    } catch { /* ignore */ }
  };

  const checkIcon = (configured: boolean, status: string) => {
    if (status === 'connected' || status === 'configured') return <CheckCircle size={16} className="text-emerald-500" />;
    if (status === 'not_configured' || status === 'not_set') return <XCircle size={16} className="text-slate-300 dark:text-slate-600" />;
    return <AlertCircle size={16} className="text-amber-500" />;
  };

  return (
    <main className="min-h-screen bg-[#f4f7fb] px-4 py-6 text-slate-950 transition dark:bg-[#050811] dark:text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6">
          <a href="/crm" className="mb-4 inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <ArrowLeft size={14} /> Volver al CRM
          </a>
          <h1 className="mt-4 text-3xl font-black text-slate-900 dark:text-white">Canales y conexiones</h1>
          <p className="mt-1 text-sm text-slate-500">Estado de todas las conexiones del CRM. Configuración de modo de respuesta.</p>
        </div>

        <div className="mb-6 flex gap-2">
          {(['channels', 'tester', 'qa'] as const).map((tab) => (
            <button key={tab} type="button" onClick={() => setActiveTab(tab)}
              className={`rounded-xl border px-4 py-2 text-xs font-bold transition-colors ${
                activeTab === tab
                  ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                  : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
              }`}
            >
              {tab === 'channels' ? '🔌 Checklist conexión' : tab === 'tester' ? '🧪 Webhook tester' : '✅ QA flujo real'}
            </button>
          ))}
        </div>

        {activeTab === 'channels' && (
          <>
            {loading ? (
              <div className="flex justify-center py-12"><div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500" /></div>
            ) : data ? (
              <>
                <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {CHANNEL_CONFIG.map(({ key, label, icon: Icon, color, bg }) => {
                    const check = data.checks[key as keyof ChannelChecks];
                    if (!check) return null;
                    return (
                      <div key={key} className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900 ${bg}`}>
                        <div className="mb-2 flex items-center justify-between">
                          <Icon size={18} className={color} />
                          {checkIcon(check.configured, check.status)}
                        </div>
                        <p className="text-xs font-bold uppercase text-slate-500">{label}</p>
                        <p className={`mt-1 text-sm font-bold ${
                          check.status === 'connected' || check.status === 'configured' ? 'text-emerald-600' : 'text-slate-400'
                        }`}>
                          {check.status === 'connected' ? 'Conectado' : check.status === 'configured' ? 'Configurado' : check.status === 'not_configured' ? 'No configurado' : check.status === 'not_set' ? 'No definida' : check.status}
                        </p>
                        {check.detail && <p className="mt-1 truncate text-[10px] text-slate-400">{check.detail}</p>}
                      </div>
                    );
                  })}
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-black text-slate-900 dark:text-white">Prueba de conexión</h2>
                      <p className="text-xs text-slate-400">Ejecuta pruebas reales contra cada servicio configurado.</p>
                    </div>
                    <button type="button" disabled={testing}
                      className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-40"
                      onClick={testAll}
                    >
                      {testing ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
                      {testing ? 'Probando...' : 'Probar todo'}
                    </button>
                  </div>
                  {testResults && (
                    <div className="space-y-2">
                      {Object.entries(testResults).map(([key, result]) => (
                        <div key={key} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-800">
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{key}</span>
                          <div className="flex items-center gap-2">
                            {result.ok ? <CheckCircle size={14} className="text-emerald-500" /> : <XCircle size={14} className="text-red-400" />}
                            <span className={`text-[11px] ${result.ok ? 'text-emerald-600' : 'text-red-500'}`}>{result.message}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Modo de respuesta</h2>
                    <p className="text-xs text-slate-400">Controla cómo se comporta el copiloto en el inbox.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {(['manual', 'copiloto', 'automatico_limitado'] as const).map((m) => (
                      <button key={m} type="button" onClick={() => setMode(m)}
                        className={`rounded-xl border px-4 py-3 text-left transition-all ${
                          mode === m
                            ? 'border-emerald-400 bg-emerald-50 shadow-sm dark:border-emerald-600 dark:bg-emerald-900/30'
                            : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800'
                        }`}
                      >
                        <p className={`text-sm font-bold ${mode === m ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-800 dark:text-slate-200'}`}>
                          {m === 'manual' ? '🖐️ Manual' : m === 'copiloto' ? '🤖 Copiloto' : '⚡ Automático limitado'}
                        </p>
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {m === 'manual' ? 'Solo copiar o abrir canal externo' : m === 'copiloto' ? 'Sugerir respuesta, aprobar antes de enviar' : 'Responder automático solo intenciones simples'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 rounded-2xl border border-emerald-200 bg-white p-5 shadow-sm dark:border-emerald-800 dark:bg-slate-900">
                  <div className="mb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">OpenWA — Checklist operativo</h2>
                    <p className="text-xs text-slate-400">Pasos para conectar y probar WhatsApp real.</p>
                  </div>
                  <div className="space-y-3">
                    {[
                      { paso: 1, label: 'Configurar OPENWA_API_URL y OPENWA_API_KEY en .env.local' },
                      { paso: 2, label: 'Iniciar OpenWA (Docker o servidor Node). Debe exponer /health, /send, /messages' },
                      { paso: 3, label: 'Escanear QR de WhatsApp Web en OpenWA' },
                      { paso: 4, label: 'Verificar conexión: abrir /crm/settings/channels y hacer clic "Probar todo"' },
                      { paso: 5, label: 'Enviar mensaje de prueba: ir a la pestaña "Webhook tester", seleccionar WhatsApp, escribir un mensaje' },
                      { paso: 6, label: 'Verificar en inbox: ir a /crm/inbox, el hilo debe aparecer con intención detectada' },
                      { paso: 7, label: 'Responder con copiloto: usar "Usar respuesta" o escribir respuesta manual' },
                      { paso: 8, label: 'Verificar que el mensaje saliente se envía por OpenWA (sent_at en DB)' },
                    ].map((s) => (
                      <div key={s.paso} className="flex items-start gap-3 rounded-xl bg-emerald-50 p-3 dark:bg-emerald-900/20">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-200 text-[10px] font-bold text-emerald-700 dark:bg-emerald-800 dark:text-emerald-200">{s.paso}</span>
                        <p className="text-xs text-slate-700 dark:text-slate-300">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
                  <div className="mb-4">
                    <h2 className="text-lg font-black text-slate-900 dark:text-white">Variables de entorno</h2>
                    <p className="text-xs text-slate-400">{data.env.configured} de {data.env.total} configuradas. {data.env.missing} faltantes.</p>
                  </div>
                  <div className="max-h-48 space-y-1 overflow-y-auto">
                    {data.env.missingVars.length > 0 && (
                      <div className="mb-3 rounded-xl bg-amber-50 p-3 dark:bg-amber-900/20">
                        <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">Faltantes:</p>
                        <div className="mt-1 flex flex-wrap gap-1">
                          {data.env.missingVars.map((v) => (
                            <span key={v} className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:bg-amber-800 dark:text-amber-200">{v}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {CHANNEL_CONFIG.map(({ key, label, icon: Icon }) => {
                      const check = data.checks[key as keyof ChannelChecks];
                      if (!check) return null;
                      return (
                        <div key={key} className="flex items-center justify-between border-b border-slate-100 py-1.5 last:border-0 dark:border-slate-800">
                          <span className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                            <Icon size={10} /> {label}
                          </span>
                          {check.configured ? <CheckCircle size={12} className="text-emerald-400" /> : <XCircle size={12} className="text-slate-300" />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-600">Error al cargar datos de conexión.</div>
            )}
          </>
        )}

        {activeTab === 'tester' && <WebhookTester />}
        {activeTab === 'qa' && <QaChecklist />}
      </div>
    </main>
  );
}

function WebhookTester() {
  const [channel, setChannel] = useState('WHATSAPP');
  const [text, setText] = useState('');
  const [sender, setSender] = useState('');
  const [senderName, setSenderName] = useState('');
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [sending, setSending] = useState(false);
  const [sampleMessages, setSampleMessages] = useState<string[]>([]);

  useEffect(() => {
    fetch('/api/crm/inbox/tester').then(r => r.json()).then(d => {
      const ch = d.channels?.find((c: Record<string, unknown>) => c.channel === channel);
      if (ch) setSampleMessages(ch.sampleMessages || []);
    }).catch(() => {});
  }, [channel]);

  useEffect(() => {
    setResult(null);
  }, [channel]);

  const sendTest = async () => {
    setSending(true);
    setResult(null);
    try {
      const res = await fetch('/api/crm/inbox/tester', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel,
          text: text || undefined,
          sender: sender || undefined,
          senderName: senderName || undefined,
        }),
      });
      const d = await res.json();
      setResult(d);
    } catch { /* ignore */ }
    setSending(false);
  };

  const copyToClipboard = (text: string) => navigator.clipboard.writeText(text).catch(() => {});

  const sampleOptions: Record<string, string[]> = {
    WHATSAPP: [
      'Hola, me interesa su sistema para mi restaurante. ¿Podría darme una demo?',
      'Buenos días, quisiera saber cuánto cuesta el sistema POS.',
      'Estoy muy ocupado, llámeme más tarde por favor.',
      'No me interesa, gracias.',
      'Tengo un problema con el sistema, no puedo facturar.',
    ],
    FACEBOOK: [
      'Hola! Me podrían dar más información?',
      'Quiero una demo del sistema para restaurante',
      'Precio del sistema POS',
    ],
    INSTAGRAM: [
      'Hola, hermoso perfil! Me interesa el sistema',
      'Cuánto cuesta?',
      'No gracias, ya tengo sistema',
    ],
    EMAIL: [
      'Estimado, quisiera una cotización del sistema POS.',
      'Tengo un restaurante en Miraflores y quiero una demo.',
      'El sistema tiene error al emitir boletas.',
    ],
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <h2 className="text-lg font-black text-slate-900 dark:text-white">🧪 Webhook tester</h2>
      <p className="mb-5 text-xs text-slate-400">Envía mensajes falsos a la bandeja de entrada para probar el flujo completo.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {['WHATSAPP', 'FACEBOOK', 'INSTAGRAM', 'EMAIL'].map((ch) => (
          <button key={ch} type="button" onClick={() => setChannel(ch)}
            className={`rounded-xl border px-3 py-1.5 text-xs font-bold transition-colors ${
              channel === ch
                ? 'border-emerald-400 bg-emerald-50 text-emerald-700 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-300'
                : 'border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {ch === 'WHATSAPP' ? 'WhatsApp' : ch === 'FACEBOOK' ? 'Facebook' : ch === 'INSTAGRAM' ? 'Instagram' : 'Email'}
          </button>
        ))}
      </div>

      <div className="mb-4">
        <p className="mb-2 text-xs font-bold text-slate-500 uppercase">Mensajes de ejemplo</p>
        <div className="flex flex-wrap gap-2">
          {(sampleOptions[channel] || []).map((msg, i) => (
            <button key={i} type="button" onClick={() => setText(msg)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[10px] text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              {msg.length > 50 ? msg.slice(0, 50) + '...' : msg}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Remitente</label>
          <input className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" placeholder={channel === 'EMAIL' ? 'correo@ejemplo.com' : 'Nombre o usuario'} value={sender} onChange={(e) => setSender(e.target.value)} />
        </div>
        <div>
          <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Nombre</label>
          <input className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" placeholder="Nombre del contacto" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
        </div>
        <div className="flex items-end">
          <button type="button" disabled={sending}
            className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97] disabled:opacity-40"
            onClick={sendTest}
          >
            {sending ? <RefreshCw size={12} className="animate-spin" /> : <Play size={12} />}
            {sending ? 'Enviando...' : 'Enviar prueba'}
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-[10px] font-bold uppercase text-slate-500">Mensaje</label>
        <textarea className="min-h-[80px] w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200" value={text} onChange={(e) => setText(e.target.value)} placeholder="Escribe el mensaje de prueba..." />
      </div>

      {result && (
        <div className="mt-5 space-y-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
          <p className="text-xs font-bold uppercase text-emerald-600">Resultado de la prueba</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <ResultRow label="Intención detectada" value={result.intent as string} />
            <ResultRow label="Confianza" value={result.confidence as string} />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase text-slate-500">Respuesta sugerida</p>
            <p className="mt-0.5 text-sm italic text-slate-700 dark:text-slate-300">{result.suggestedReply as string || '(ninguna)'}</p>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => window.open('/crm/inbox', '_blank')}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-1.5 text-[10px] font-bold text-white transition-colors hover:bg-emerald-600"
            >
              Ir a inbox
            </button>
            <button type="button" onClick={() => copyToClipboard(JSON.stringify(result, null, 2))}
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100"
            >
              Copiar JSON
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-white px-3 py-2 dark:bg-slate-800">
      <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
      <p className="text-sm font-bold text-slate-900 dark:text-white">{value || '—'}</p>
    </div>
  );
}

function QaChecklist() {
  const steps = [
    { num: 1, label: 'Llega mensaje', check: 'channel:openwa:message_received o channel:meta:webhook_received o channel:email:message_received' },
    { num: 2, label: 'Se crea conversación', check: 'channel:inbox:thread_created en logs' },
    { num: 3, label: 'Se detecta intención', check: 'channel:inbox:intent_detected con tipo correcto' },
    { num: 4, label: 'Se sugiere respuesta', check: 'channel:inbox:reply_suggested aparece en el mensaje' },
    { num: 5, label: 'David edita/aprueba', check: 'Botón "Usar respuesta" visible, mensaje OUTBOUND creado' },
    { num: 6, label: 'Se envía o abre canal', check: 'channel:openwa:message_sent o channel:email:message_sent o se abre WhatsApp web' },
    { num: 7, label: 'Se guarda mensaje saliente', check: 'sent_at tiene valor en crm_inbox_messages' },
    { num: 8, label: 'Si pide demo, se agenda', check: 'Botón "Agendar demo" en sidebar funciona' },
    { num: 9, label: 'Si no interesa, No contactar', check: 'Cambiar prospecto a NO_CONTACTAR' },
  ];

  const [logs, setLogs] = useState<{ event: string; detail: string; created_at: string }[]>([]);

  useEffect(() => {
    fetch('/api/crm/db-status').then(r => r.json()).then(d => {
      if (d.lastErrors) setLogs(d.lastErrors);
    }).catch(() => {});
  }, []);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <h2 className="mb-1 text-lg font-black text-slate-900 dark:text-white">✅ QA — Flujo real</h2>
        <p className="mb-4 text-xs text-slate-400">Verifica cada paso del proceso de inbox copiloto.</p>
        <div className="space-y-2">
          {steps.map((s) => (
            <div key={s.num} className="flex items-start gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-[10px] font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">{s.num}</span>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{s.label}</p>
                <p className="text-[10px] text-slate-400">Verificar: <code className="rounded bg-slate-200 px-1 py-0.5 text-[9px] dark:bg-slate-700">{s.check}</code></p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white">📋 Logs recientes del sistema</h2>
            <p className="text-xs text-slate-400">Últimos eventos registrados por el CRM.</p>
          </div>
          <a href="/crm/automation" className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-[10px] font-bold text-slate-600 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
            <FileText size={11} /> Ver todos
          </a>
        </div>
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400">No hay logs aún. Envía un mensaje de prueba para ver eventos.</p>
        ) : (
          <div className="space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex items-center justify-between border-b border-slate-100 py-1.5 text-[11px] dark:border-slate-800">
                <span className="font-bold text-slate-600 dark:text-slate-300">{log.event}</span>
                <div className="flex items-center gap-2">
                  <span className="max-w-[300px] truncate text-slate-400">{log.detail}</span>
                  <span className="shrink-0 text-[10px] text-slate-400">{log.created_at ? new Date(log.created_at).toLocaleString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
