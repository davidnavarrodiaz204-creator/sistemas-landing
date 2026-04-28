'use client';

import { Zap, Package, Calculator, Users, FileText, BarChart3, UserCheck, Database, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const beneficios = [
  { icon: Zap, title: 'POS rápido', desc: 'Ventas ágiles y sin demoras' },
  { icon: Package, title: 'Inventario', desc: 'Control total de stock' },
  { icon: Calculator, title: 'Caja diaria', desc: 'Cierre y arqueo automático' },
  { icon: Users, title: 'Clientes y créditos', desc: 'Gestión de cartera y pagos' },
  { icon: FileText, title: 'Facturación SUNAT', desc: 'Boletas y facturas electrónicas' },
  { icon: BarChart3, title: 'Reportes', desc: 'Análisis de ventas y ganancias' },
  { icon: UserCheck, title: 'Multiusuario', desc: 'Roles y permisos personalizados' },
  { icon: Database, title: 'Backup', desc: 'Respaldo automático en la nube' },
  { icon: Shield, title: 'Seguridad', desc: 'Datos protegidos y encriptados' },
];

export default function Beneficios() {
  return (
    <section className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="gradient-text">Todo lo que necesitas</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Herramientas profesionales para hacer crecer tu negocio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {beneficios.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 group"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-blue-500/10 rounded-lg sm:rounded-xl group-hover:bg-blue-500/20 transition-colors flex-shrink-0">
                  <item.icon size={20} className="sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-white mb-0.5 sm:mb-1">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-gray-400">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
