'use client';

import { ShoppingCart, ChefHat, MessageCircle, TrendingUp, FileText, PackageCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { FactusysMarkNeon } from './BrandLogo';

const fadeInUp = {
  initial: { opacity: 1, y: 0 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
};

const stagger = {
  animate: {
    transition: {
      staggerChildren: 0.12
    }
  }
};

export default function Hero() {
  return (
    <section id="hero" className="relative min-h-screen flex items-start justify-center px-4 sm:px-6 lg:px-8 overflow-hidden pt-20 sm:pt-28 pb-14">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(0,113,227,0.08)_0%,_transparent_70%)]" />
      <div className="absolute inset-0 bg-neon-glow" />

      <div className="max-w-6xl mx-auto relative z-10 w-full">
        <motion.div
          variants={stagger}
          initial="initial"
          animate="animate"
          className="text-center mb-8 sm:mb-10"
        >
          <motion.div
            variants={fadeInUp}
            className="flex items-center justify-center gap-2 mb-5 sm:mb-6"
          >
            <FactusysMarkNeon className="w-8 h-8 sm:w-10 sm:h-10" />
            <span className="text-neon text-sm sm:text-base font-semibold tracking-[0.15em] uppercase">
              FACTUSYS
            </span>
          </motion.div>

          <motion.p
            variants={fadeInUp}
            className="text-gray-300 text-xs sm:text-base font-semibold mb-3 sm:mb-4 tracking-wide uppercase max-w-[21rem] sm:max-w-none mx-auto leading-relaxed"
          >
            POS Peru Digital para ferreterias, restaurantes y negocios peruanos
          </motion.p>

          <motion.h1
            variants={fadeInUp}
            className="text-[1.9rem] min-[390px]:text-[2rem] sm:text-5xl lg:text-5xl xl:text-6xl font-bold mb-4 sm:mb-5 leading-tight tracking-tight max-w-[22rem] sm:max-w-5xl mx-auto text-balance"
          >
            <span className="brand-gradient-text">Sistemas POS listos para vender</span>
            <br />
            <span className="text-white">facturar y controlar</span>
            <br className="sm:hidden" />
            <span className="text-white"> tu negocio</span>
          </motion.h1>

          <motion.p
            variants={fadeInUp}
            className="text-sm min-[390px]:text-base sm:text-lg lg:text-xl text-gray-300 mb-4 sm:mb-5 max-w-[21rem] sm:max-w-4xl mx-auto font-normal leading-relaxed px-2 text-balance"
          >
            Creamos sistemas para que tu negocio venda mas rapido, controle su stock,
            caja, clientes, pedidos y facturacion electronica.
            <br className="hidden sm:block" />
            Todo pensado para el trabajo diario en Peru.
          </motion.p>

          <motion.div
            variants={fadeInUp}
            className="inline-flex items-center gap-2 border border-neon/30 rounded-full px-4 py-1.5 sm:px-5 sm:py-2 mb-5 sm:mb-7 bg-neon/5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-neon animate-pulse" />
            <span className="text-neon text-xs sm:text-sm font-medium">Implementación en menos de 48 horas</span>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="flex flex-col gap-3 sm:flex-row sm:gap-4 justify-center mb-4 sm:mb-6 w-full max-w-[320px] sm:max-w-none mx-auto"
          >
            <a
              href={process.env.NEXT_PUBLIC_DEMO_FERROPOS_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-black font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <ShoppingCart size={18} className="sm:w-5 sm:h-5" />
              Ver demo FERRO
            </a>

            <a
              href={process.env.NEXT_PUBLIC_DEMO_RESTAURANTE_URL || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-black font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <ChefHat size={18} className="sm:w-5 sm:h-5" />
              Ver demo RESTO
            </a>

            <a
              href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999'}?text=${encodeURIComponent('Hola, quiero información sobre FACTUSYS para mi negocio.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline text-white font-medium px-6 sm:px-8 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base"
            >
              <MessageCircle size={18} className="sm:w-5 sm:h-5" />
              Hablar por WhatsApp
            </a>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="space-y-2"
          >
            <p className="text-xs sm:text-sm text-gray-400">
              No necesitas conocimientos técnicos
            </p>
            <p className="text-xs sm:text-sm text-gray-500 max-w-[320px] sm:max-w-none mx-auto">
              Soporte incluido • Demos separados por rubro • Implementacion personalizada
            </p>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 1, y: 0 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="overflow-x-auto"
        >
          <DashboardMockup />
        </motion.div>
      </div>
    </section>
  );
}

function DashboardMockup() {
  return (
    <div className="gradient-glow min-w-[320px]">
      <div className="float-gentle">
        <div className="glass-card rounded-2xl sm:rounded-3xl p-4 sm:p-8 border-white/10 shadow-2xl">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 pb-3 sm:pb-4 border-b border-white/5">
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-red-500" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-yellow-500" />
            <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-green-500" />
            <span className="ml-3 sm:ml-4 text-gray-500 text-xs sm:text-sm font-medium">Panel FACTUSYS</span>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:gap-4 mb-4 sm:mb-6">
            <MetricCard icon={TrendingUp} label="Ventas hoy" value="S/ 12,450" trend="+12%" />
            <MetricCard icon={MessageCircle} label="Caja abierta" value="2h 34m" />
            <MetricCard icon={PackageCheck} label="Stock bajo" value="8 items" />
            <MetricCard icon={FileText} label="Documentos" value="147" />
          </div>

          <div className="bg-white/[0.02] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
            <h4 className="text-white text-xs sm:text-sm font-medium mb-2 sm:mb-3">Últimas ventas</h4>
            <div className="space-y-1.5 sm:space-y-2">
              {[
                { time: '10:23', desc: 'Venta #1042 - Tornillos y herramientas', amount: 'S/ 450' },
                { time: '10:15', desc: 'Pedido #1041 - Mesa 6', amount: 'S/ 128' },
                { time: '10:08', desc: 'Factura #1040 - Cliente frecuente', amount: 'S/ 320' },
              ].map((sale, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs sm:text-sm py-1.5 sm:py-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-500">{sale.time}</span>
                  <span className="text-gray-300 flex-1 ml-2 sm:ml-4 truncate">{sale.desc}</span>
                  <span className="text-white font-medium ml-2">{sale.amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, trend }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: string; trend?: string }) {
  return (
    <div className="bg-white/[0.02] rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-white/5">
      <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-2">
        <Icon size={14} className="sm:w-4 sm:h-4 text-blue-400" />
        <span className="text-gray-500 text-[10px] sm:text-xs">{label}</span>
      </div>
      <p className="text-base sm:text-xl font-semibold text-white">{value}</p>
      {trend && <p className="text-green-400 text-[10px] sm:text-xs mt-0.5 sm:mt-1">{trend}</p>}
    </div>
  );
}
