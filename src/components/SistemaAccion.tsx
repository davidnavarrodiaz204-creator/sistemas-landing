'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Monitor, Package, Calculator, FileText, MessageCircle } from 'lucide-react';

const steps = [
  {
    id: 0,
    title: 'Sistema POS para negocios en Perú',
    desc: 'La solución completa para gestionar tus ventas e inventario.',
    icon: Monitor,
    fileName: 'pos-screenshot.png', // Imagen inicial
    isTextOnly: true,
  },
  {
    id: 1,
    title: 'POS - Punto de Venta',
    desc: 'Interfaz rápida y limpia para procesar ventas al instante.',
    icon: Monitor,
    fileName: 'pos-screenshot.png',
  },
  {
    id: 2,
    title: 'Caja Diaria',
    desc: 'Control diario de ingresos, egresos y arqueo de caja.',
    icon: Calculator,
    fileName: 'caja-screenshot.png',
  },
  {
    id: 3,
    title: 'Inventario',
    desc: 'Gestiona tu stock, entradas y salidas en tiempo real.',
    icon: Package,
    fileName: 'inventario-screenshot.png',
  },
  {
    id: 4,
    title: 'Documentos SUNAT',
    desc: 'Boletas, facturas y reportes listos para SUNAT.',
    icon: FileText,
    fileName: 'documentos-screenshot.png',
  },
  {
    id: 5,
    title: 'Pide tu demo por WhatsApp',
    desc: 'Escríbenos ahora y comienza a usar el sistema en menos de 48 horas.',
    icon: MessageCircle,
    fileName: 'documentos-screenshot.png', // Mantiene la última imagen
    isFinal: true,
  },
];

export default function SistemaAccion() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 8000); // Cambia cada 8 segundos (0-8, 8-16, 16-24, 24-32, 32-40, 40-48)
    return () => clearInterval(interval);
  }, []);

  const current = steps[activeIndex];

  return (
    <section id="sistema-accion" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12 sm:mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="gradient-text">Sistema en acción</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Presentación automática de 45 segundos
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Pantalla Flotante */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-blue-500/10"
            >
              {/* Barra de ventana estilo macOS/iOS */}
              <div className="bg-[#1c1c1e] px-4 py-3 flex items-center gap-2 border-b border-white/10">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
                <div className="ml-4 text-gray-500 text-xs font-mono flex-1 truncate">
                  {current.title}
                </div>
                {/* Indicador de progreso */}
                <div className="flex gap-1">
                  {steps.map((_, idx) => (
                    <div
                      key={idx}
                      className={`w-1.5 h-1.5 rounded-full transition-colors duration-300 ${
                        idx === activeIndex ? 'bg-blue-400' : 'bg-white/20'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Imagen con transición */}
              <div className="relative bg-[#0a0a0f] aspect-video overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={current.fileName + activeIndex}
                    src={`/${current.fileName}`}
                    alt={current.title}
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.5, ease: "easeInOut" }}
                    className="w-full h-full object-cover"
                  />
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Texto explicativo y navegación */}
          <div className="lg:col-span-5 space-y-4 sm:space-y-6">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className={`cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                  activeIndex === idx
                    ? 'bg-white/5 border border-blue-500/30'
                    : 'border border-transparent hover:bg-white/[0.02]'
                }`}
                onClick={() => setActiveIndex(idx)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activeIndex === idx ? 'bg-blue-500/20 text-blue-400' : 'bg-white/5 text-gray-500'
                  }`}>
                    <step.icon size={20} />
                  </div>
                  <div>
                    <h3 className={`font-semibold text-base sm:text-lg ${
                      activeIndex === idx ? 'text-white' : 'text-gray-400'
                    }`}>
                      {step.title}
                    </h3>
                    <p className={`text-sm mt-1 leading-relaxed ${
                      activeIndex === idx ? 'text-gray-300' : 'text-gray-500'
                    }`}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
