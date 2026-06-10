'use client';

import { Search, Plus, Sparkles, Globe, Camera, Music, Mail } from 'lucide-react';

export type SearchResultItem = {
  id: string;
  negocio: string;
  rubro: string;
  direccion: string;
  telefono: string;
  email: string;
  web: string;
  facebookLink: string;
  instagramLink: string;
  tiktokLink: string;
  rating: number | null;
  googleMapsUrl: string;
  fuente: string;
  score?: { total: number; max: number; label: string; color: string };
};

export function AutoSearchPanel({
  rubro, ciudad, fuente, keywords, searching, searchMessage, searchResults,
  activeRubros, onSearchChange, onSearch, onAddResult, onAddAll, onGenerateMessages, onEnrichItem,
}: {
  rubro: string; ciudad: string; fuente: string; keywords: string;
  searching: boolean; searchMessage: string; searchResults: SearchResultItem[];
  activeRubros: string[];
  onSearchChange: (patch: Record<string, string>) => void;
  onSearch: () => void;
  onAddResult: (item: SearchResultItem) => void;
  onAddAll: () => void;
  onGenerateMessages: () => void;
  onEnrichItem?: (item: SearchResultItem) => void;
}) {
  return (
    <div className="crm-card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="crm-eyebrow mb-2">Búsqueda automática</p>
          <h2 className="crm-section-title">Buscar prospectos por rubro y ciudad</h2>
        </div>
        <button
          type="button"
          className="crm-button-primary min-h-0 px-4 py-2 text-sm"
          onClick={onGenerateMessages}
        >
          <Sparkles size={14} /> Generar mensajes para campaña
        </button>
      </div>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <select
          className="crm-input"
          value={rubro}
          onChange={(e) => onSearchChange({ rubro: e.target.value })}
        >
          {activeRubros.map((r) => <option key={r}>{r}</option>)}
        </select>
        <input
          className="crm-input"
          value={ciudad}
          onChange={(e) => onSearchChange({ ciudad: e.target.value })}
          placeholder="Ciudad (ej. Paita, Piura)"
        />
        <select
          className="crm-input"
          value={fuente}
          onChange={(e) => onSearchChange({ fuente: e.target.value })}
        >
          {['Google Maps', 'Facebook', 'Instagram', 'TikTok', 'Web', 'Todas'].map((f) => <option key={f}>{f}</option>)}
        </select>
        <input
          className="crm-input"
          value={keywords}
          onChange={(e) => onSearchChange({ keywords: e.target.value })}
          placeholder="Palabras clave (opcional)"
        />
        <button
          type="button"
          className="crm-button-primary justify-center"
          onClick={onSearch}
          disabled={searching}
        >
          <Search size={16} /> {searching ? 'Buscando...' : 'Buscar prospectos'}
        </button>
      </div>

      {searchMessage && (
        <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-bold ${searchMessage.includes('Error') ? 'bg-red-100 text-red-800' : searchMessage.includes('agregados') || searchMessage.includes('encontrados') ? 'bg-neon/10 text-neon' : 'bg-yellow-100 text-yellow-800'}`}>
          {searchMessage}
        </div>
      )}

      {searchResults.length > 0 && (
        <>
          <div className="mb-2 flex items-center gap-3">
            <p className="text-sm font-bold">{searchResults.length} resultados</p>
            <button type="button" className="crm-button-primary min-h-0 px-3 py-1.5 text-xs" onClick={onAddAll}>
              <Plus size={12} /> Agregar todos al CRM
            </button>
          </div>
          <div className="max-h-96 space-y-2 overflow-y-auto">
            {searchResults.map((item) => (
              <div key={item.id} className="crm-mini-card rounded-xl p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate font-bold text-slate-900">{item.negocio}</p>
                      {item.score && (
                        <span
                          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white"
                          style={{ backgroundColor: item.score.color }}
                          title={`Score: ${item.score.total}/${item.score.max} - ${item.score.label}`}
                        >
                          {item.score.total}
                        </span>
                      )}
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-500">{item.fuente}</span>
                    </div>
                    <p className="crm-muted truncate text-xs">
                      {item.direccion} · {item.telefono || 'sin teléfono'} · ★ {item.rating ?? 'N/A'}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      {item.facebookLink && (
                        <a href={item.facebookLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-blue-600 hover:underline" title="Facebook">
                          <Globe size={10} /> fb
                        </a>
                      )}
                      {item.instagramLink && (
                        <a href={item.instagramLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-pink-600 hover:underline" title="Instagram">
                          <Camera size={10} /> ig
                        </a>
                      )}
                      {item.tiktokLink && (
                        <a href={item.tiktokLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-slate-700 hover:underline" title="TikTok">
                          <Music size={10} /> tt
                        </a>
                      )}
                      {item.web && (
                        <a href={item.web} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-emerald-600 hover:underline" title="Web">
                          <Globe size={10} /> web
                        </a>
                      )}
                      {item.email && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-amber-600" title="Email">
                          <Mail size={10} /> {item.email.slice(0, 25)}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    {onEnrichItem && (
                      <button
                        type="button"
                        className="crm-button-secondary min-h-0 px-2 py-1 text-[10px]"
                        onClick={() => onEnrichItem(item)}
                        title="Enriquecer datos"
                      >
                        <Search size={10} />
                      </button>
                    )}
                    <button
                      type="button"
                      className="crm-button-secondary min-h-0 px-2 py-1 text-[10px]"
                      onClick={() => onAddResult(item)}
                    >
                      <Plus size={10} /> Agregar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
