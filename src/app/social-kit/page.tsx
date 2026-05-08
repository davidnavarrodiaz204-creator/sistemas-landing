'use client';

import { useState } from 'react';
import { FactusysLogoNeon } from '@/components/BrandLogo';
import { allPosts } from '@/components/social/SocialPosts';
import { allStories } from '@/components/social/SocialStories';
import { coverItems } from '@/components/social/FacebookCover';
import { X, Maximize2 } from 'lucide-react';

const scale = 0.35;

function PreviewCard({ item }: { item: { id: string; name: string; size: string; component: React.ComponentType } }) {
  const [open, setOpen] = useState(false);
  const Component = item.component;

  return (
    <>
      <div className="glass-card rounded-xl overflow-hidden group cursor-pointer" onClick={() => setOpen(true)}>
        <div className="flex items-center justify-center overflow-hidden bg-black p-4" style={{ minHeight: item.id === 'facebook-cover' ? '180px' : '280px' }}>
          <div style={{ transform: `scale(${item.id === 'facebook-cover' ? 0.25 : scale})`, transformOrigin: item.id === 'facebook-cover' ? 'left center' : 'center center' }}>
            <Component />
          </div>
        </div>
        <div className="p-3 flex items-center justify-between">
          <div>
            <p className="text-white text-sm font-medium truncate">{item.name}</p>
            <p className="text-gray-500 text-xs">{item.size}</p>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); setOpen(true); }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition cursor-pointer bg-transparent border-none"
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="relative max-w-[95vw] max-h-[95vh] overflow-auto rounded-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-2 right-2 flex justify-end mb-2">
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-full bg-black/60 backdrop-blur text-white hover:bg-white/20 transition cursor-pointer border-none"
              >
                <X size={20} />
              </button>
            </div>
            <div className="rounded-xl overflow-hidden shadow-2xl">
              <Component />
            </div>
            <div className="mt-2 flex items-center justify-between text-gray-400 text-sm px-1">
              <span>{item.name} — {item.size}</span>
              <span className="text-gray-600">Captura de pantalla para usar</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function SocialKitPage() {
  return (
    <div className="min-h-screen bg-black pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <FactusysLogoNeon size="lg" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3">
            Kit de Redes Sociales
          </h1>
          <p className="text-gray-400 text-base max-w-2xl mx-auto">
            Assets visuales listos para capturar y usar en Facebook, Instagram y WhatsApp Business.
            <br />
            Haz clic en cada pieza para verla en tamaño real.
          </p>
        </div>

        {/* Profile & Cover */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#00e676] rounded-full" />
            <h2 className="text-white text-xl font-semibold">Perfil y Portada</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {coverItems.map((item) => (
              <PreviewCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Posts */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#00e676] rounded-full" />
            <h2 className="text-white text-xl font-semibold">Posts — Facebook / Instagram</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {allPosts.map((item) => (
              <PreviewCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Stories */}
        <section className="mb-14">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-6 bg-[#00e676] rounded-full" />
            <h2 className="text-white text-xl font-semibold">Historias — Instagram / Facebook</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {allStories.map((item) => (
              <PreviewCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        {/* Instructions */}
        <div className="glass-card rounded-2xl p-6 sm:p-8 border-white/5">
          <h3 className="text-white font-semibold text-lg mb-3">Cómo usar estos assets</h3>
          <ol className="space-y-2 text-gray-400 text-sm">
            <li className="flex items-start gap-2">
              <span className="text-[#00e676] font-bold">1.</span>
              <span>Haz clic en cualquier pieza para verla en tamaño real (1:1).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00e676] font-bold">2.</span>
              <span>Toma una captura de pantalla (o usa las herramientas de desarrollo para exportar).</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00e676] font-bold">3.</span>
              <span>Sube la imagen directamente a Facebook, Instagram o WhatsApp Business.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#00e676] font-bold">4.</span>
              <span>Todos los diseños mantienen la identidad visual FACTUSYS.</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
