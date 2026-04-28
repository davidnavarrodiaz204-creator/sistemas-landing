'use client';

import { Check, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const planes = [
  {
    nombre: 'Inicio',
    descripcion: 'Para empezar',
    features: ['Instalación remota', 'Configuración inicial', 'Capacitación básica', 'Soporte por email'],
    price: null,
  },
  {
    nombre: 'Pro',
    descripcion: 'Para negocios establecidos',
    features: ['Todo de Inicio', 'Facturación SUNAT', 'Reportes avanzados', 'Soporte prioritario', 'Backup en la nube'],
    price: null,
    destacado: true,
  },
  {
    nombre: 'Premium',
    descripcion: 'Para empresas en crecimiento',
    features: ['Todo de Pro', 'Personalización a medida', 'Soporte 24/7', 'Integraciones API', 'Visita técnica'],
    price: null,
  },
];

export default function Planes() {
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
            <span className="gradient-text">Planes</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Cotización personalizada según tus necesidades
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {planes.map((plan, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.15 }}
              className={`glass-card rounded-2xl sm:rounded-3xl p-6 sm:p-8 relative ${
                plan.destacado ? 'border-blue-500/30 ring-1 ring-blue-500/20' : 'border-white/5'
              }`}
            >
              {plan.destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-violet-500 text-white text-xs sm:text-sm font-medium px-4 sm:px-6 py-1 sm:py-1.5 rounded-full">
                  Recomendado
                </div>
              )}

              <div className="text-center mb-6 sm:mb-8">
                <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{plan.nombre}</h3>
                <p className="text-gray-400 text-sm sm:text-base">{plan.descripcion}</p>
                <p className="mt-3 sm:mt-4 text-gray-300 text-sm sm:text-base">Cotización según negocio</p>
              </div>

              <ul className="space-y-2 sm:space-y-4">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-start gap-2 sm:gap-3">
                    <Check size={16} className="sm:w-[18px] sm:h-[18px] text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-sm sm:text-base text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
