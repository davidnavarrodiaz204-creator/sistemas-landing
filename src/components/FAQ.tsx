'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const faqs = [
  {
    pregunta: '¿El sistema funciona con facturacion electronica?',
    respuesta: 'Si. El sistema esta preparado para boletas, facturas, tickets y notas de credito mediante integracion con Nubefact/SUNAT.',
  },
  {
    pregunta: '¿Hay un sistema para ferreteria y otro para restaurante?',
    respuesta: 'Si. FACTUSYS FERRO esta pensado para inventario, codigos, compras, caja y cotizaciones. FACTUSYS RESTO esta pensado para mesas, pedidos, comandas, caja y cobro rapido.',
  },
  {
    pregunta: '¿Necesito conocimientos tecnicos?',
    respuesta: 'No. Lo instalamos, configuramos y capacitamos a tu equipo para que pueda usarlo desde el primer dia.',
  },
  {
    pregunta: '¿Puedo probar antes de comprar?',
    respuesta: 'Si. Puedes abrir los demos de FERRO y RESTO desde esta pagina o pedir una demostracion guiada por WhatsApp.',
  },
  {
    pregunta: '¿Cuanto tiempo toma la implementacion?',
    respuesta: 'La instalacion y configuracion inicial se puede realizar en menos de 48 horas, dependiendo de la informacion que tenga lista tu negocio.',
  },
  {
    pregunta: '¿Incluye soporte?',
    respuesta: 'Si. Incluye soporte inicial, capacitacion y acompañamiento para resolver dudas durante la puesta en marcha.',
  },
  {
    pregunta: '¿Puedo usarlo en celular?',
    respuesta: 'Si. El sistema es responsive y se puede revisar desde celular, tablet o computadora segun el flujo de tu negocio.',
  },
  {
    pregunta: '¿Se puede adaptar a mi negocio?',
    respuesta: 'Si. Podemos configurar productos, usuarios, comprobantes, metodos de pago y procesos segun tu forma de trabajo.',
  },
];

export default function FAQ() {
  const [abierto, setAbierto] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setAbierto(abierto === idx ? null : idx);
  };

  return (
    <section id="faq" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <div className="mb-4">
            <span className="brand-section-label">FAQ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="brand-gradient-text">Preguntas frecuentes</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2">
            Resolvemos tus dudas para que tomes la mejor decisión
          </p>
        </motion.div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.05 }}
              className="glass-card rounded-xl sm:rounded-2xl overflow-hidden"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full px-4 sm:px-6 py-4 sm:py-5 flex items-center justify-between text-left cursor-pointer bg-transparent border-none"
              >
                <span className="text-white font-medium text-sm sm:text-base pr-4">
                  {faq.pregunta}
                </span>
                <ChevronDown
                  size={20}
                  className={`sm:w-6 sm:h-6 text-gray-400 transition-transform duration-300 flex-shrink-0 ${
                    abierto === idx ? 'rotate-180' : ''
                  }`}
                />
              </button>

              <AnimatePresence>
                {abierto === idx && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 sm:px-6 pb-4 sm:pb-5 pt-0">
                      <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                        {faq.respuesta}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
