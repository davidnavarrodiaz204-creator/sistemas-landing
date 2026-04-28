'use client';

import { Check } from 'lucide-react';

const planes = [
  {
    nombre: 'Inicio',
    descripcion: 'Instalación y configuración',
    features: ['Instalación remota', 'Configuración inicial', 'Capacitación básica', 'Soporte por email'],
  },
  {
    nombre: 'Pro',
    descripcion: 'Sistema completo + facturación electrónica',
    features: ['Todo de Inicio', 'Facturación SUNAT', 'Reportes avanzados', 'Soporte prioritario', 'Backup en la nube'],
    destacado: true,
  },
  {
    nombre: 'Premium',
    descripcion: 'Personalización + soporte',
    features: ['Todo de Pro', 'Personalización a medida', 'Soporte 24/7', 'Integraciones API', 'Visita técnica'],
  },
];

export default function Planes() {
  return (
    <section id="planes" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">Planes</span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {planes.map((plan, idx) => (
            <div
              key={idx}
              className={`glass-card p-8 rounded-xl relative ${
                plan.destacado ? 'border-primary ring-2 ring-primary/50' : ''
              }`}
            >
              {plan.destacado && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-sm font-semibold px-4 py-1 rounded-full">
                  Popular
                </div>
              )}

              <h3 className="text-2xl font-bold text-white mb-2">{plan.nombre}</h3>
              <p className="text-gray-400 mb-6">{plan.descripcion}</p>
              <p className="text-gray-300 text-sm mb-6">Cotización según negocio</p>

              <ul className="space-y-3">
                {plan.features.map((feature, fidx) => (
                  <li key={fidx} className="flex items-center gap-2 text-gray-300">
                    <Check size={18} className="text-green-400 flex-shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
