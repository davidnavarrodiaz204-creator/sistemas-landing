'use client';

import { ShoppingCart, ChefHat, ExternalLink, Check, Store, Utensils } from 'lucide-react';
import { motion } from 'framer-motion';

const productos = [
  {
    icon: Store,
    title: 'FERROPOS ERP Perú',
    desc: 'Sistema para ferreterías, electrónicas y tiendas con inventario, ventas, caja, clientes, SUNAT, PDF, WhatsApp y reportes.',
    demoUrl: process.env.NEXT_PUBLIC_DEMO_FERROPOS_URL || '#',
    features: ['Facturación SUNAT', 'Control de inventario', 'Gestión de caja', 'Clientes y créditos', 'Reportes avanzados'],
    color: 'blue',
  },
  {
    icon: Utensils,
    title: 'Restaurante POS Perú',
    desc: 'Sistema para pollerías, restaurantes y negocios de comida con mesas, pedidos, cocina, caja, comprobantes y facturación electrónica.',
    demoUrl: process.env.NEXT_PUBLIC_DEMO_RESTAURANTE_URL || '#',
    features: ['Gestión de mesas', 'Pedidos a cocina', 'Comandas digitales', 'Facturación electrónica', 'Control de caja'],
    color: 'purple',
  },
];

export default function Productos() {
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
            <span className="gradient-text">Sistemas disponibles</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Soluciones especializadas para cada tipo de negocio
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {productos.map((prod, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              className="glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 group"
            >
              <div className="flex items-start gap-3 sm:gap-4 mb-4 sm:mb-6">
                <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-colors ${
                  prod.color === 'blue'
                    ? 'bg-blue-500/10 group-hover:bg-blue-500/20'
                    : 'bg-purple-500/10 group-hover:bg-purple-500/20'
                } flex-shrink-0`}>
                  <prod.icon size={24} className={`sm:w-8 sm:h-8 ${
                    prod.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                  }`} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{prod.title}</h3>
                  <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{prod.desc}</p>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                {prod.features.map((feature, fidx) => (
                  <div key={fidx} className="flex items-start gap-2 sm:gap-3">
                    <Check size={16} className="sm:w-[18px] sm:h-[18px] text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>

              <a
                href={prod.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                Ver demo
                <ExternalLink size={14} className="sm:w-[18px] sm:h-[18px]" />
              </a>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
