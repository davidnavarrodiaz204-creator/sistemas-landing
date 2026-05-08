'use client';

import SocialCanvas from './SocialCanvas';
import NeonBadge from './NeonBadge';
import { FactusysMarkNeon } from '../BrandLogo';
import { Play, Sun, LayoutDashboard } from 'lucide-react';

function BgGlow({ className }: { className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${className || ''}`}
      style={{
        background: 'radial-gradient(circle, rgba(0,230,118,0.08) 0%, transparent 70%)',
      }}
    />
  );
}

function BgGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.02]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '60px 60px',
      }}
    />
  );
}

/* ─── History 1: Demo gratis ─── */
export function StoryDemo() {
  return (
    <SocialCanvas width={1080} height={1920}>
      <BgGrid />
      <BgGlow className="top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px]" />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e676] to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e676] to-transparent" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between p-12">
        <div className="flex justify-center pt-4">
          <FactusysMarkNeon className="w-14 h-14" />
        </div>

        <div className="text-center space-y-6">
          <div className="w-28 h-28 rounded-full bg-[#00e676]/10 border border-[#00e676]/30 flex items-center justify-center mx-auto">
            <Play size={48} className="text-[#00e676] ml-1" />
          </div>

          <h1 className="text-[72px] font-bold leading-[1.05] tracking-tight text-white">
            Demo
            <br />
            <span className="text-[#00e676]">gratis</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xs mx-auto leading-relaxed">
            Mira el sistema funcionando en vivo
          </p>
        </div>

        <div className="text-center space-y-3 pb-8">
          <div className="inline-flex items-center gap-2 bg-[#00e676] text-black font-semibold rounded-full px-8 py-3 text-lg">
            <Play size={18} />
            Probar demo
          </div>
          <p className="text-gray-600 text-sm">Sin compromiso</p>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── History 2: SUNAT ─── */
export function StorySunat() {
  return (
    <SocialCanvas width={1080} height={1920}>
      <BgGrid />
      <BgGlow className="top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px]" />

      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e676] to-transparent" />
      <div className="absolute right-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[#00e676]/30 to-transparent" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between p-12">
        <div className="flex justify-center pt-4">
          <FactusysMarkNeon className="w-14 h-14" />
        </div>

        <div className="text-center space-y-6">
          <div className="w-28 h-28 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/30 flex items-center justify-center mx-auto">
            <Sun size={48} className="text-[#00e676]" />
          </div>

          <h1 className="text-[72px] font-bold leading-[1.05] tracking-tight text-white">
            Compatible con
            <br />
            <span className="text-[#00e676]">SUNAT</span>
          </h1>
          <div className="flex justify-center">
            <NeonBadge text="Boletas y facturas electrónicas" />
          </div>
          <p className="text-lg text-gray-400 max-w-xs mx-auto leading-relaxed">
            Facturación electrónica para Perú, lista para usar.
          </p>
        </div>

        <div className="text-center pb-8">
          <p className="text-gray-600 text-sm">Nubefact integrado</p>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── History 3: Control total ─── */
export function StoryControl() {
  return (
    <SocialCanvas width={1080} height={1920}>
      <BgGrid />
      <BgGlow className="bottom-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[700px]" />

      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00e676] to-transparent" />
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-transparent via-[#00e676]/30 to-transparent" />

      <div className="relative z-10 h-full flex flex-col items-center justify-between p-12">
        <div className="flex justify-center pt-4">
          <FactusysMarkNeon className="w-14 h-14" />
        </div>

        <div className="text-center space-y-6">
          <div className="w-28 h-28 rounded-2xl bg-[#00e676]/10 border border-[#00e676]/30 flex items-center justify-center mx-auto">
            <LayoutDashboard size={48} className="text-[#00e676]" />
          </div>

          <h1 className="text-[72px] font-bold leading-[1.05] tracking-tight text-white">
            Control
            <br />
            <span className="text-[#00e676]">total</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-xs mx-auto leading-relaxed">
            Ventas + caja + inventario + reportes
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-3 pb-8 max-w-xs mx-auto">
          {['Ventas', 'Caja', 'Inventario', 'Reportes', 'SUNAT', 'Auditoría'].map((tag, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/10 rounded-full px-3 py-1.5 text-xs text-gray-400">
              {tag}
            </div>
          ))}
        </div>
      </div>
    </SocialCanvas>
  );
}

export const allStories = [
  { id: 'demo', name: 'Historia 1 — Demo gratis', size: '1080×1920', component: StoryDemo },
  { id: 'sunat', name: 'Historia 2 — SUNAT', size: '1080×1920', component: StorySunat },
  { id: 'control', name: 'Historia 3 — Control total', size: '1080×1920', component: StoryControl },
];
