'use client';

import SocialCanvas from './SocialCanvas';
import { FactusysMarkNeon, FactusysMark } from '../BrandLogo';
import { MessageCircle, ShoppingCart, BarChart3, FileText, Package, Calculator } from 'lucide-react';

function BgGlow({ className }: { className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${className || ''}`}
      style={{
        background: 'radial-gradient(circle, rgba(0,230,118,0.07) 0%, transparent 70%)',
      }}
    />
  );
}

function BgGrid() {
  return (
    <div
      className="absolute inset-0 pointer-events-none opacity-[0.025]"
      style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
        backgroundSize: '80px 80px',
      }}
    />
  );
}

/* ─── Facebook Cover (1640×624) ─── */
export function FacebookCoverMain() {
  return (
    <SocialCanvas width={1640} height={624}>
      <BgGrid />
      <BgGlow className="top-0 right-0 w-[600px] h-[600px]" />
      <BgGlow className="bottom-0 left-0 w-[400px] h-[400px]" />

      <div className="absolute top-0 left-0 w-1 h-full bg-[#00e676]" />
      <div className="absolute bottom-0 right-0 w-1 h-full bg-gradient-to-t from-transparent via-[#00e676]/50 to-transparent" />

      <div className="relative z-10 h-full flex items-center justify-between p-10 lg:p-16">
        <div className="space-y-6 max-w-lg">
          <div className="flex items-center gap-3">
            <FactusysMarkNeon className="w-12 h-12" />
            <span className="text-white text-3xl font-bold tracking-tight">FACTUSYS</span>
          </div>

          <p className="text-gray-400 text-lg leading-relaxed">
            POS + ERP para negocios peruanos.
            <br />
            Ventas, caja, inventario, reportes y SUNAT.
          </p>

          <div className="flex gap-3">
            <div className="inline-flex items-center gap-2 bg-[#00e676] text-black font-semibold rounded-full px-5 py-2.5 text-sm">
              <MessageCircle size={16} />
              Demo gratis por WhatsApp
            </div>
            <div className="inline-flex items-center gap-2 border border-white/15 text-white rounded-full px-5 py-2.5 text-sm">
              Probar demo
            </div>
          </div>

          <div className="flex items-center gap-4 text-gray-500 text-xs">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" /> POS rápido
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" /> Inventario
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00e676]" /> SUNAT
            </span>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-3 gap-2">
          {[{ icon: ShoppingCart, label: 'POS' }, { icon: Package, label: 'Stock' }, { icon: Calculator, label: 'Caja' }, { icon: BarChart3, label: 'Reportes' }, { icon: FileText, label: 'SUNAT' }, { icon: MessageCircle, label: 'Soporte' }].map((item, i) => (
            <div key={i} className="bg-white/[0.03] border border-white/5 rounded-xl p-3 text-center aspect-square flex flex-col items-center justify-center gap-1.5">
              <item.icon size={20} className="text-[#00e676]" />
              <span className="text-gray-400 text-[10px] font-medium">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── Profile Avatar (1080×1080) ─── */
export function ProfileAvatarMain() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <div className="absolute inset-0" style={{
        background: 'radial-gradient(circle at center, #0a1628 0%, #000000 100%)',
      }} />
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      <div className="z-10 h-full flex items-center justify-center">
        <div className="relative">
          <div
            className="absolute -inset-8 rounded-full opacity-20"
            style={{
              background: 'radial-gradient(circle, rgba(0,230,118,0.4) 0%, transparent 70%)',
            }}
          />
          <div className="absolute -inset-4 rounded-full border border-[#00e676]/20" />
          <FactusysMark
            className="w-64 h-64"
            style={{ color: '#00e676' }}
          />
        </div>
      </div>
    </SocialCanvas>
  );
}

export const coverItems = [
  { id: 'facebook-cover', name: 'Portada Facebook', size: '1640×624', component: FacebookCoverMain },
  { id: 'profile-avatar', name: 'Foto de perfil', size: '1080×1080', component: ProfileAvatarMain },
];
