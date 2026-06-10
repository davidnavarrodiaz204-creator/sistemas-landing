'use client';

import { Search, Copy, Smartphone, Globe, Camera, Music, CheckCircle, Loader2, Send } from 'lucide-react';

export type SimpleResultItem = {
  id: string;
  negocio: string;
  rubro: string;
  ciudad: string;
  telefono: string;
  email: string;
  web: string;
  facebookLink: string;
  instagramLink: string;
  tiktokLink: string;
  rating: number | null;
  googleMapsUrl: string;
  fuente: string;
  message: string;
  score: { total: number; max: number; label: string; color: string };
};

export function SimpleClientSearch({
  rubro, ciudad, fuente, searching,
  results, message,
  rubroOptions, fuenteOptions,
  onInputChange, onSearch,
  onCopyMessage, onOpenWhatsApp, onOpenFacebook, onOpenInstagram, onSaveToCRM,
}: {
  rubro: string; ciudad: string; fuente: string; searching: boolean;
  results: SimpleResultItem[]; message: string;
  rubroOptions: string[]; fuenteOptions: string[];
  onInputChange: (patch: Record<string, string>) => void;
  onSearch: () => void;
  onCopyMessage: (msg: string) => void;
  onOpenWhatsApp: (phone: string, msg: string) => void;
  onOpenFacebook: (url: string) => void;
  onOpenInstagram: (url: string) => void;
  onSaveToCRM: (item: SimpleResultItem) => void;
}) {
  return (
    <div className="rounded-3xl border-2 border-black/5 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900">
      <div className="mb-6">
        <p className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-500">Buscador automático de clientes</p>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">Encuentra negocios locales para FACTUSYS</h2>
        <p className="mt-1 text-sm text-slate-500">Elige rubro, ciudad y fuente. El sistema busca, enriquece y prepara el mensaje.</p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <select
          className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-colors focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={rubro}
          onChange={(e) => onInputChange({ rubro: e.target.value })}
        >
          {rubroOptions.map((r) => <option key={r}>{r}</option>)}
        </select>
        <input
          className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-colors placeholder:font-normal placeholder:text-slate-400 focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={ciudad}
          onChange={(e) => onInputChange({ ciudad: e.target.value })}
          placeholder="Ciudad (ej. Paita, Piura)"
        />
        <select
          className="rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-bold text-slate-900 outline-none transition-colors focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
          value={fuente}
          onChange={(e) => onInputChange({ fuente: e.target.value })}
        >
          {fuenteOptions.map((f) => <option key={f}>{f}</option>)}
        </select>
        <button
          type="button"
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-60"
          onClick={onSearch}
          disabled={searching}
        >
          {searching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          {searching ? 'Buscando...' : 'Buscar clientes'}
        </button>
      </div>

      {message && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-bold ${message.includes('Error') ? 'bg-red-100 text-red-800' : message.includes('guardado') || message.includes('encontrados') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
          {message}
        </div>
      )}

      {results.length > 0 && (
        <div className="space-y-4">
          <p className="text-sm font-bold text-slate-500">{results.length} resultados</p>
          {results.map((item) => (
            <div key={item.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/50">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-lg font-black text-slate-900 dark:text-white">{item.negocio}</p>
                    <span
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: item.score.color }}
                      title={`Oportunidad: ${item.score.label}`}
                    >
                      {item.score.total}
                    </span>
                    <span className="shrink-0 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">{item.fuente}</span>
                  </div>
                  <p className="mt-0.5 text-sm text-slate-500">
                    {item.rubro} · {item.ciudad} · {item.telefono || 'sin teléfono'} ★ {item.rating ?? '-'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    {item.facebookLink && (
                      <button type="button" onClick={() => onOpenFacebook(item.facebookLink!)} className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:underline">
                        <Globe size={11} /> Facebook
                      </button>
                    )}
                    {item.instagramLink && (
                      <button type="button" onClick={() => onOpenInstagram(item.instagramLink!)} className="inline-flex items-center gap-1 text-[11px] font-bold text-pink-600 hover:underline">
                        <Camera size={11} /> Instagram
                      </button>
                    )}
                    {item.tiktokLink && (
                      <a href={item.tiktokLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:underline dark:text-slate-400">
                        <Music size={11} /> TikTok
                      </a>
                    )}
                    {item.web && (
                      <a href={item.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline">
                        <Globe size={11} /> Web
                      </a>
                    )}
                    {item.email && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-amber-600" title="Email público">
                        {item.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="mb-3 rounded-xl border border-slate-200 bg-white p-3 text-sm italic text-slate-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300">
                {item.message}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => onCopyMessage(item.message)}
                >
                  <Copy size={13} /> Copiar mensaje
                </button>
                {item.telefono && (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-emerald-600 active:scale-[0.97]"
                    onClick={() => onOpenWhatsApp(item.telefono, item.message)}
                  >
                    <Smartphone size={13} /> WhatsApp
                  </button>
                )}
                {item.email && (
                  <a
                    href={`mailto:${item.email}?subject=${encodeURIComponent('Demo FACTUSYS para ' + item.negocio)}&body=${encodeURIComponent(item.message)}`}
                    className="flex items-center gap-1.5 rounded-xl bg-blue-500 px-3 py-2 text-xs font-bold text-white transition-all hover:bg-blue-600 active:scale-[0.97]"
                  >
                    <Send size={13} /> Correo
                  </a>
                )}
                <button
                  type="button"
                  className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition-all hover:bg-slate-100 active:scale-[0.97] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                  onClick={() => onSaveToCRM(item)}
                >
                  <CheckCircle size={13} /> Guardar en CRM
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searching && results.length === 0 && !message && (
        <div className="rounded-2xl border-2 border-dashed border-slate-200 p-10 text-center dark:border-slate-700">
          <Search size={40} className="mx-auto mb-3 text-slate-300" />
          <p className="text-sm font-bold text-slate-400">Selecciona rubro, ciudad y presiona &ldquo;Buscar clientes&rdquo;</p>
          <p className="text-xs text-slate-400">El sistema buscará, enriquecerá y preparará el mensaje automáticamente</p>
        </div>
      )}
    </div>
  );
}
