'use client';

import { Monitor, Settings, GraduationCap, Rocket } from 'lucide-react';
import { motion } from 'framer-motion';

const pasos = [
  {
    icon: Monitor,
    title: 'Demo guiada',
    desc: 'Vemos si tu negocio necesita FERRO, RESTO o una adaptacion especial',
  },
  {
    icon: Settings,
    title: 'Configuracion',
    desc: 'Preparamos productos, usuarios, comprobantes, caja y metodos de pago',
  },
  {
    icon: GraduationCap,
    title: 'Capacitacion',
    desc: 'Entrenamos a tu equipo con las pantallas que usara todos los dias',
  },
  {
    icon: Rocket,
    title: 'Puesta en marcha',
    desc: 'Empiezas a vender con soporte y seguimiento durante el arranque',
  },
];

export default function ComoFunciona() {
  return (
    <section id="como-funciona" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="mb-4">
            <span className="brand-section-label">Proceso</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="brand-gradient-text">Cómo funciona</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Te acompañamos desde la demo hasta el primer dia de uso
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {pasos.map((paso, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="text-center"
            >
              <div className="glass-card rounded-xl sm:rounded-2xl p-5 sm:p-6 mb-3 sm:mb-4 relative hover:border-neon/20 transition-all duration-300">
                <div className="absolute top-3 left-3 sm:top-4 sm:left-4 w-6 h-6 sm:w-8 sm:h-8 bg-neon/20 rounded-full flex items-center justify-center text-neon font-semibold text-xs sm:text-sm">
                  {idx + 1}
                </div>
                <paso.icon size={32} className="sm:w-10 sm:h-10 text-neon mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1 sm:mb-2">{paso.title}</h3>
                <p className="text-xs sm:text-sm text-gray-400">{paso.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
