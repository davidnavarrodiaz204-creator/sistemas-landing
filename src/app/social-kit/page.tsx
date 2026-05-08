'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toPng } from 'html-to-image';
import { FactusysLogoNeon } from '@/components/BrandLogo';
import { allPosts } from '@/components/social/SocialPosts';
import { allStories } from '@/components/social/SocialStories';
import { coverItems } from '@/components/social/FacebookCover';
import InternalGuard from '@/components/InternalGuard';
import { X, Download, Eye, Grid3X3, Film, Tag, Check } from 'lucide-react';

type AssetItem = {
  id: string;
  name: string;
  size: string;
  component: React.ComponentType;
};

const categories: { id: string; label: string; icon: React.ComponentType<{ size?: number }>; items: AssetItem[] }[] = [
  { id: 'posts', label: 'Posts', icon: Grid3X3, items: allPosts },
  { id: 'stories', label: 'Historias', icon: Film, items: allStories },
  { id: 'branding', label: 'Branding', icon: Tag, items: coverItems },
];

function ItemCard({ item, onView, onDownload }: {
  item: AssetItem;
  onView: (item: AssetItem) => void;
  onDownload: (item: AssetItem) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="group relative bg-white/[0.02] border border-white/[0.06] rounded-2xl overflow-hidden
                 hover:border-[#00e676]/30 hover:bg-white/[0.04] transition-all duration-500
                 cursor-pointer"
      onClick={() => onView(item)}
    >
      <div className="relative aspect-square bg-black/40 flex items-center justify-center overflow-hidden p-8">
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-10" />
        <div
          className="flex-shrink-0 transition-transform duration-700 group-hover:scale-[1.02]"
          style={{ transform: 'scale(0.32)', transformOrigin: 'center' }}
        >
          <item.component />
        </div>

        <div className="absolute inset-0 z-20 flex items-center justify-center gap-3
                        opacity-0 group-hover:opacity-100 transition-all duration-300
                        bg-black/30 backdrop-blur-[2px]">
          <button
            onClick={(e) => { e.stopPropagation(); onView(item); }}
            className="p-3 rounded-xl bg-white/10 backdrop-blur-md text-white
                       hover:bg-[#00e676] hover:text-black transition-all duration-300
                       hover:scale-110 active:scale-95 cursor-pointer border-none"
            title="Previsualizar"
          >
            <Eye size={18} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDownload(item); }}
            className="p-3 rounded-xl bg-white/10 backdrop-blur-md text-white
                       hover:bg-[#00e676] hover:text-black transition-all duration-300
                       hover:scale-110 active:scale-95 cursor-pointer border-none"
            title="Descargar PNG"
          >
            <Download size={18} />
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5">
        <p className="text-white text-sm font-medium truncate group-hover:text-[#00e676] transition-colors">
          {item.name}
        </p>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="text-gray-600 text-xs">{item.size}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-gray-600 text-xs">PNG</span>
        </div>
      </div>
    </motion.div>
  );
}

function PreviewModal({ item, onClose, autoDownload }: {
  item: AssetItem;
  onClose: () => void;
  autoDownload: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [done, setDone] = useState(false);
  const Component = item.component;

  const exportPng = useCallback(async () => {
    if (!ref.current || exporting) return;
    setExporting(true);
    try {
      await document.fonts.ready;
      const [w, h] = item.size.split('×').map(Number);
      const dataUrl = await toPng(ref.current, {
        width: w,
        height: h,
        pixelRatio: 2,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `factusys-${item.id}.png`;
      link.href = dataUrl;
      link.click();
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    } catch {
      // fallback: user can screenshot
    } finally {
      setExporting(false);
    }
  }, [item, exporting]);

  useEffect(() => {
    if (autoDownload) {
      const t = setTimeout(() => exportPng(), 600);
      return () => clearTimeout(t);
    }
  }, [autoDownload, exportPng]);

  const dims = item.size.split('×');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[100] flex flex-col bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-white/[0.06] shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-white font-medium text-sm truncate max-w-[200px] sm:max-w-none">
            {item.name}
          </span>
          <span className="text-gray-600 text-xs hidden sm:inline">{item.size} px</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); exportPng(); }}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                       bg-[#00e676] text-black hover:bg-[#00c853] disabled:opacity-50
                       active:scale-95 cursor-pointer border-none"
          >
            {done ? (
              <><Check size={16} /> Exportado</>
            ) : exporting ? (
              <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
            ) : (
              <><Download size={16} /> Exportar PNG</>
            )}
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-all
                       cursor-pointer bg-transparent border-none"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      <div
        className="flex-1 overflow-auto flex items-start justify-center p-4 sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div
          ref={ref}
          className="rounded-2xl overflow-hidden shadow-2xl shadow-black/50 flex-shrink-0"
          style={{ maxWidth: `${dims[0]}px` }}
        >
          <Component />
        </div>
      </div>

      <div className="shrink-0 text-center py-2 text-gray-600 text-xs border-t border-white/[0.06]">
        La exportación genera PNG a 2× de resolución para calidad retina
      </div>
    </motion.div>
  );
}

function SocialKitContent() {
  const [activeCategory, setActiveCategory] = useState('posts');
  const [selectedItem, setSelectedItem] = useState<AssetItem | null>(null);
  const [autoDownload, setAutoDownload] = useState(false);

  const currentCategory = categories.find(c => c.id === activeCategory);
  const items = currentCategory?.items || [];

  const handleView = useCallback((item: AssetItem) => {
    setAutoDownload(false);
    setSelectedItem(item);
  }, []);

  const handleDownload = useCallback((item: AssetItem) => {
    setAutoDownload(true);
    setSelectedItem(item);
  }, []);

  return (
    <InternalGuard>
    <div className="min-h-screen bg-black pt-24 pb-20">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 left-1/3 w-[700px] h-[700px] bg-[#00e676]/[0.03] rounded-full blur-3xl" />
        <div className="absolute -bottom-40 right-1/4 w-[600px] h-[600px] bg-blue-500/[0.02] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="flex justify-center mb-5">
            <FactusysLogoNeon />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 tracking-tight">
            Panel de Branding
          </h1>
          <p className="text-gray-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Assets visuales de FACTUSYS listos para exportar. Previsualiza, descarga en PNG y usa en tus redes sociales.
          </p>
        </div>

        <div className="flex justify-center mb-10">
          <div className="inline-flex bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 gap-0.5">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-300 cursor-pointer border-none ${
                  activeCategory === cat.id
                    ? 'bg-[#00e676] text-black shadow-lg shadow-[#00e676]/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <cat.icon size={15} />
                <span className="hidden sm:inline">{cat.label}</span>
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full ${
                  activeCategory === cat.id ? 'bg-black/15 text-black/70' : 'bg-white/[0.06] text-gray-500'
                }`}>
                  {cat.items.length}
                </span>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeCategory}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <div className={`grid gap-5 sm:gap-6 ${
              activeCategory === 'branding'
                ? 'grid-cols-1 lg:grid-cols-2'
                : activeCategory === 'stories'
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'
            }`}>
              {items.map(item => (
                <ItemCard
                  key={item.id}
                  item={item}
                  onView={handleView}
                  onDownload={handleDownload}
                />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 glass-card rounded-2xl p-5 sm:p-6 border-white/[0.04]">
          <div className="flex items-start gap-4">
            <div className="w-8 h-8 rounded-lg bg-[#00e676]/10 border border-[#00e676]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
              <Download size={15} className="text-[#00e676]" />
            </div>
            <div>
              <h3 className="text-white text-sm font-semibold mb-1">Exportar assets</h3>
              <p className="text-gray-500 text-xs leading-relaxed">
                Cada pieza se exporta como PNG a 2× de resolución (retina). 
                Usa los botones <strong className="text-gray-400">Previsualizar</strong> para ver en detalle o{' '}
                <strong className="text-gray-400">Descargar</strong> para exportar directo.
                Los assets están optimizados para Facebook, Instagram y WhatsApp Business.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedItem && (
          <PreviewModal
            item={selectedItem}
            onClose={() => setSelectedItem(null)}
            autoDownload={autoDownload}
          />
        )}
      </AnimatePresence>
    </div>
    </InternalGuard>
  );
}

export default function SocialKitPage() {
  return <SocialKitContent />;
}
