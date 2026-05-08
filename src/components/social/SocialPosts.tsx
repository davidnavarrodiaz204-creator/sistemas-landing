'use client';

import SocialCanvas from './SocialCanvas';
import NeonBadge from './NeonBadge';
import { FactusysMarkNeon } from '../BrandLogo';
import { Zap, Shield, Utensils, ShoppingCart, Clock, CheckCircle, Users, FileText, Printer, Smartphone } from 'lucide-react';

function BgGlow({ className }: { className?: string }) {
  return (
    <div
      className={`absolute pointer-events-none ${className || ''}`}
      style={{
        background: 'radial-gradient(circle, rgba(0,230,118,0.06) 0%, transparent 70%)',
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

/* ─── Post 1: POS Rápido ─── */
export function PostPos() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <BgGrid />
      <BgGlow className="top-0 right-0 w-[500px] h-[500px]" />
      <div className="absolute top-0 left-0 w-1 h-full bg-[#00e676]" />

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-start justify-between">
          <NeonBadge text="POS rápido" />
          <FactusysMarkNeon className="w-10 h-10" />
        </div>

        <div className="space-y-6">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-tight text-white">
            Vende rápido.
            <br />
            <span className="text-[#00e676]">Cobra fácil.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
            POS moderno para negocios peruanos.
          </p>

          <div className="grid grid-cols-2 gap-3 max-w-lg">
            {[{ icon: Printer, text: 'Boleta y factura' }, { icon: Smartphone, text: 'Ticket instantáneo' }, { icon: ShoppingCart, text: 'Control de stock' }, { icon: Zap, text: 'Ventas ágiles' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.03] border border-white/5 rounded-lg px-3 py-2">
                <item.icon size={14} className="text-[#00e676] flex-shrink-0" />
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">FACTUSYS</p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">SaaS para tu negocio</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span>Demo gratis</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── Post 2: Inventario ─── */
export function PostInventario() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <BgGrid />
      <BgGlow className="bottom-0 left-0 w-[500px] h-[500px]" />
      <div className="absolute top-0 right-0 w-1 h-full bg-[#00e676]" />

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-start justify-between">
          <NeonBadge text="Inventario" />
          <FactusysMarkNeon className="w-10 h-10" />
        </div>

        <div className="space-y-6 max-w-2xl">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-tight text-white">
            Controla tu stock
            <br />
            <span className="text-[#00e676]">en tiempo real.</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Evita pérdidas, desorden y quiebres de inventario.
          </p>

          <div className="flex flex-wrap gap-3">
            {['Stock en tiempo real', 'Alertas de quiebre', 'Entradas y salidas', 'Transferencias'].map((tag, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-full px-4 py-2 text-sm text-gray-300">
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">FACTUSYS</p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">SaaS para tu negocio</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span>Demo gratis</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── Post 3: Caja ─── */
export function PostCaja() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <BgGrid />
      <BgGlow className="top-1/2 right-0 w-[450px] h-[450px]" />
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#00e676]" />

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-start justify-between">
          <NeonBadge text="Caja diaria" />
          <FactusysMarkNeon className="w-10 h-10" />
        </div>

        <div className="space-y-6">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-tight text-white">
            Caja clara.
            <br />
            <span className="text-[#00e676]">Negocio seguro.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
            Apertura, cierre, ingresos, egresos y cuadre diario automático.
          </p>

          <div className="max-w-md">
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 space-y-3">
              {[{ label: 'Ingresos', value: 'S/ 12,450', color: 'text-[#00e676]' }, { label: 'Egresos', value: 'S/ 3,200', color: 'text-red-400' }, { label: 'Saldo final', value: 'S/ 9,250', color: 'text-white font-bold' }].map((item, i) => (
                <div key={i} className="flex justify-between items-center">
                  <span className="text-gray-500 text-sm">{item.label}</span>
                  <span className={`${item.color} text-sm`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">FACTUSYS</p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">SaaS para tu negocio</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span>Demo gratis</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── Post 4: Reportes ─── */
export function PostReportes() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <BgGrid />
      <BgGlow className="bottom-0 right-0 w-[500px] h-[500px]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00e676]" />

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-start justify-between">
          <NeonBadge text="Reportes" />
          <FactusysMarkNeon className="w-10 h-10" />
        </div>

        <div className="space-y-6">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-tight text-white">
            Decide con
            <br />
            <span className="text-[#00e676]">datos reales.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
            Ventas, ganancias, métodos de pago y rendimiento.
          </p>

          <div className="flex gap-3 max-w-lg">
            {['Ventas', 'Ganancias', 'Métodos', 'Rendimiento'].map((tag, i) => (
              <div key={i} className="bg-white/[0.03] border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300">
                {tag}
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">FACTUSYS</p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">SaaS para tu negocio</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span>Demo gratis</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── Post 5: Auditoría ─── */
export function PostAuditoria() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <BgGrid />
      <BgGlow className="top-0 left-0 w-[500px] h-[500px]" />
      <div className="absolute right-0 top-0 h-full w-1 bg-[#00e676]" />

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-start justify-between">
          <NeonBadge text="Auditoría" />
          <FactusysMarkNeon className="w-10 h-10" />
        </div>

        <div className="space-y-6 max-w-2xl">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-tight text-white">
            Mira todo lo que hacen
            <br />
            <span className="text-[#00e676]">tus usuarios.</span>
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed">
            Historial de cambios, seguridad y control total para tu negocio.
          </p>

          <div className="flex flex-wrap gap-3">
            {[{ icon: Shield, text: 'Seguridad' }, { icon: Clock, text: 'Historial' }, { icon: CheckCircle, text: 'Control total' }, { icon: Users, text: 'Por usuario' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2">
                <item.icon size={14} className="text-[#00e676]" />
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">FACTUSYS</p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">SaaS para tu negocio</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span>Demo gratis</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </SocialCanvas>
  );
}

/* ─── Post 6: Restaurante ─── */
export function PostRestaurante() {
  return (
    <SocialCanvas width={1080} height={1080}>
      <BgGrid />
      <BgGlow className="bottom-0 right-0 w-[500px] h-[500px]" />
      <div className="absolute top-0 left-0 w-full h-1 bg-[#00e676]" />

      <div className="relative z-10 h-full flex flex-col justify-between p-12">
        <div className="flex items-start justify-between">
          <NeonBadge text="Restaurante" />
          <FactusysMarkNeon className="w-10 h-10" />
        </div>

        <div className="space-y-6">
          <h1 className="text-[64px] font-bold leading-[1.05] tracking-tight text-white">
            Pedidos, mesas y cocina
            <br />
            <span className="text-[#00e676]">en orden.</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-lg leading-relaxed">
            Sistema moderno para restaurantes y pollerías.
          </p>

          <div className="flex flex-wrap gap-3">
              {[{ icon: Utensils, text: 'Mesas' }, { icon: ShoppingCart, text: 'Pedidos' }, { icon: Zap, text: 'Cocina' }, { icon: FileText, text: 'Comprobantes' }].map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-full px-4 py-2">
                <item.icon size={14} className="text-[#00e676]" />
                <span className="text-sm text-gray-300">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-white font-bold text-lg tracking-tight">FACTUSYS</p>
            <p className="text-gray-600 text-xs tracking-widest uppercase">SaaS para tu negocio</p>
          </div>
          <div className="flex items-center gap-3 text-gray-600 text-xs">
            <span>Demo gratis</span>
            <span className="w-1 h-1 rounded-full bg-gray-600" />
            <span>WhatsApp</span>
          </div>
        </div>
      </div>
    </SocialCanvas>
  );
}

export const allPosts = [
  { id: 'pos-rapido', name: 'Post 1 — POS Rápido', size: '1080×1080', component: PostPos },
  { id: 'inventario', name: 'Post 2 — Inventario', size: '1080×1080', component: PostInventario },
  { id: 'caja', name: 'Post 3 — Caja', size: '1080×1080', component: PostCaja },
  { id: 'reportes', name: 'Post 4 — Reportes', size: '1080×1080', component: PostReportes },
  { id: 'auditoria', name: 'Post 5 — Auditoría', size: '1080×1080', component: PostAuditoria },
  { id: 'restaurante', name: 'Post 6 — Restaurante', size: '1080×1080', component: PostRestaurante },
];
