'use client';

import { Zap, Package, Calculator, Users, FileText, BarChart3, UserCheck, Database, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const beneficios = [
  { icon: Zap, title: 'Ventas rapidas', desc: 'Cobra en segundos desde una pantalla clara' },
  { icon: Package, title: 'Stock controlado', desc: 'Productos, categorias, proveedores y alertas' },
  { icon: Calculator, title: 'Caja por turno', desc: 'Ingresos, egresos, arqueo y cierre diario' },
  { icon: Users, title: 'Clientes y creditos', desc: 'Historial, deuda, pagos y cartera ordenada' },
  { icon: FileText, title: 'Facturacion Peru', desc: 'Boletas, facturas, tickets y notas de credito' },
  { icon: BarChart3, title: 'Reportes utiles', desc: 'Ventas, ganancias, productos y movimiento diario' },
  { icon: UserCheck, title: 'Roles de usuario', desc: 'Permisos para caja, administracion y reportes' },
  { icon: Database, title: 'Datos protegidos', desc: 'Informacion ordenada y lista para respaldo' },
  { icon: Shield, title: 'Acompañamiento', desc: 'Instalacion, capacitacion y soporte para tu equipo' },
];

export default function Beneficios() {
  return (
    <section id="beneficios" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="mb-4">
            <span className="brand-section-label">Beneficios</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="brand-gradient-text">Lo que hacemos por tu negocio</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Convertimos tu operacion diaria en un sistema ordenado: ventas, caja, inventario, documentos y decisiones.
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
              className="glass-card rounded-xl sm:rounded-2xl p-4 sm:p-6 group hover:border-neon/20 transition-all duration-300"
            >
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2.5 sm:p-3 bg-neon/10 rounded-lg sm:rounded-xl group-hover:bg-neon/20 transition-colors flex-shrink-0">
                  <item.icon size={20} className="sm:w-6 sm:h-6 text-neon" />
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
