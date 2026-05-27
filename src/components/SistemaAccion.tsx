'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Monitor, Package, Calculator, FileText, MessageCircle, ShoppingCart } from 'lucide-react';

const steps = [
  {
    id: 0,
    title: 'FACTUSYS en accion',
    desc: 'Una vista rapida de las pantallas reales que usamos para vender, cobrar, controlar stock y emitir documentos.',
    icon: ShoppingCart,
    src: '/restaurante/dashboard-control-turno.png',
    isTextOnly: true,
  },
  {
    id: 1,
    title: 'RESTO - Punto de venta',
    desc: 'Productos por categoria, mesas, recojo, delivery y pedido actual para vender rapido.',
    icon: Monitor,
    src: '/restaurante/pos-venta-rapida.png',
  },
  {
    id: 2,
    title: 'RESTO - Cocina y mesas',
    desc: 'Controla salon, QR por mesa y comandas por estado para ordenar la operacion.',
    icon: Calculator,
    src: '/restaurante/cocina-kds.png',
  },
  {
    id: 3,
    title: 'FERRO - Resumen ejecutivo',
    desc: 'Ventas, caja, productos, documentos y estado del negocio desde un panel claro.',
    icon: Package,
    src: '/ferro/dashboard.png',
  },
  {
    id: 4,
    title: 'FERRO - Punto de venta',
    desc: 'Carrito, cliente, comprobante, IGV y metodos de pago pensados para ferreterias y tiendas.',
    icon: FileText,
    src: '/ferro/pos.png',
  },
  {
    id: 5,
    title: 'Pide tu demo por WhatsApp',
    desc: 'Te mostramos FERRO o RESTO segun tu negocio y dejamos claro que necesitas para empezar.',
    icon: MessageCircle,
    src: '/ferro/documentos.png',
    isFinal: true,
  },
];

function useImageAvailable(src: string) {
  const [result, setResult] = useState<{ src: string; available: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    const img = new window.Image();

    img.onload = () => {
      if (active) setResult({ src, available: true });
    };
    img.onerror = () => {
      if (active) setResult({ src, available: false });
    };
    img.src = src;

    return () => {
      active = false;
    };
  }, [src]);

  return result?.src === src ? result.available : null;
}

export default function SistemaAccion() {
  const [activeIndex, setActiveIndex] = useState(0);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51987454769';

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length);
    }, 8000); // Cambia cada 8 segundos (0-8, 8-16, 16-24, 24-32, 32-40, 40-48)
    return () => clearInterval(interval);
  }, []);

  const current = steps[activeIndex];
  const imageAvailable = useImageAvailable(current.src);

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
          <div className="mb-4">
            <span className="brand-section-label">Pantallas reales</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="brand-gradient-text">Mira como trabaja el sistema</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Capturas del POS, caja, inventario y documentos para que el cliente entienda lo que va a recibir.
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
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-neon/10 brand-neon-glow"
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
                         idx === activeIndex ? 'bg-neon' : 'bg-white/20'
                       }`}
                    />
                  ))}
                </div>
              </div>

              {/* Imagen con transición */}
              <div className="showcase-media relative aspect-video overflow-hidden rounded-b-2xl">
                <AnimatePresence mode="wait">
                  {imageAvailable !== true ? (
                    <motion.div
                      key={`fallback-${activeIndex}`}
                      initial={{ opacity: 0, scale: 1.02 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="showcase-fallback h-full"
                    >
                      <Camera size={30} />
                      <span>Captura pendiente</span>
                    </motion.div>
                  ) : (
                    <motion.img
                      key={current.src + activeIndex}
                      src={current.src}
                      alt={current.title}
                      initial={{ opacity: 0, scale: 1.03 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.5, ease: 'easeInOut' }}
                      className="h-full w-full rounded-xl object-contain object-left-top"
                    />
                  )}
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
                    ? 'bg-white/5 border border-neon/30'
                    : 'border border-transparent hover:bg-white/[0.02]'
                }`}
                onClick={() => setActiveIndex(idx)}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className={`p-2 rounded-lg flex-shrink-0 ${
                    activeIndex === idx ? 'bg-neon/20 text-neon' : 'bg-white/5 text-gray-500'
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

            <motion.a
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.35 }}
              href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola, quiero que me muestren el sistema POS para mi negocio.')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-neon text-black font-semibold px-6 py-3 rounded-full inline-flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <MessageCircle size={18} />
              Quiero que me lo muestren
            </motion.a>
          </div>
        </div>
      </div>
    </section>
  );
}
