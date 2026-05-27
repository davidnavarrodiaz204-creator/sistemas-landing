'use client';

import { useState } from 'react';
import { X, Maximize2 } from 'lucide-react';

type ShowcaseTab = 'restaurante' | 'ferreteria';

type ShowcaseItem = {
  title: string;
  benefit: string;
  src: string;
  fallback: string;
};

const restauranteScreens: ShowcaseItem[] = [
  {
    title: 'Dashboard/control de turno',
    benefit: 'Vista rápida de ventas, caja abierta, mesas, cocina y alertas operativas.',
    src: '/restaurante/dashboard-control-turno.png',
    fallback: '/pos-screenshot.png',
  },
  {
    title: 'POS venta rápida',
    benefit: 'Productos por categoría, mesas, recojo, delivery y pedido actual en una sola pantalla.',
    src: '/restaurante/pos-venta-rapida.png',
    fallback: '/pos-screenshot.png',
  },
  {
    title: 'Mesas y QR',
    benefit: 'Control de salón con mesas libres, ocupadas, cuenta, limpieza y QR por mesa.',
    src: '/restaurante/mesas-qr.png',
    fallback: '/pos-screenshot.png',
  },
  {
    title: 'Cocina/KDS',
    benefit: 'Comandas por estado: pendiente, preparando, listo y servido para ordenar cocina.',
    src: '/restaurante/cocina-kds.png',
    fallback: '/caja-screenshot.png',
  },
  {
    title: 'Caja',
    benefit: 'Apertura, egresos, cierre, movimientos y auditoría del turno.',
    src: '/restaurante/caja.png',
    fallback: '/caja-screenshot.png',
  },
  {
    title: 'Reportes',
    benefit: 'Ventas, ticket promedio, efectivo esperado, utilidad y métodos de pago.',
    src: '/restaurante/reportes.png',
    fallback: '/documentos-screenshot.png',
  },
  {
    title: 'Documentos',
    benefit: 'Comprobantes, filtros, estado fiscal y revisión antes de emitir documentos reales.',
    src: '/restaurante/documentos.png',
    fallback: '/documentos-screenshot.png',
  },
  {
    title: 'Inventario',
    benefit: 'Catálogo operativo con productos, precios, stock, categorías y destino de comanda.',
    src: '/restaurante/inventario.png',
    fallback: '/inventario-screenshot.png',
  },
];

const ferreteriaScreens: ShowcaseItem[] = [
  {
    title: 'Resumen ejecutivo',
    benefit: 'Panel rápido para ver ventas, caja, documentos y estado del negocio.',
    src: '/pos-screenshot.png',
    fallback: '/pos-screenshot.png',
  },
  {
    title: 'POS',
    benefit: 'Venta rápida con carrito, comprobante, cliente, métodos de pago e IGV.',
    src: '/pos-screenshot.png',
    fallback: '/pos-screenshot.png',
  },
  {
    title: 'Caja',
    benefit: 'Caja por turno con ingresos, egresos, efectivo esperado y cierre diario.',
    src: '/caja-screenshot.png',
    fallback: '/caja-screenshot.png',
  },
  {
    title: 'Documentos',
    benefit: 'Boletas, facturas, tickets, notas y estado SUNAT/Nubefact en una vista.',
    src: '/documentos-screenshot.png',
    fallback: '/documentos-screenshot.png',
  },
  {
    title: 'Reportes',
    benefit: 'Control de ventas, stock, productos y resultados para tomar decisiones.',
    src: '/inventario-screenshot.png',
    fallback: '/inventario-screenshot.png',
  },
];

export default function SistemaShowcase() {
  const [activeTab, setActiveTab] = useState<ShowcaseTab>('restaurante');
  const [selected, setSelected] = useState<ShowcaseItem | null>(null);
  const screens = activeTab === 'restaurante' ? restauranteScreens : ferreteriaScreens;

  return (
    <section id="sistema-showcase" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-4">
              <span className="brand-section-label">Pantallas reales</span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              <span className="brand-gradient-text">Mira el sistema en acción</span>
            </h2>
            <p className="mt-4 max-w-3xl text-base font-light leading-relaxed text-gray-400 sm:text-xl">
              Una vitrina clara para que el cliente entienda qué controla cada sistema antes de pedir una demo.
            </p>
          </div>

          <div className="inline-flex rounded-full border border-white/10 bg-white/[0.04] p-1">
            {[
              { id: 'restaurante' as const, label: 'Restaurante' },
              { id: 'ferreteria' as const, label: 'Ferretería' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? 'bg-neon text-black'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {screens.map((screen) => (
            <button
              key={`${activeTab}-${screen.title}`}
              type="button"
              onClick={() => setSelected(screen)}
              className="showcase-card group overflow-hidden rounded-2xl text-left"
            >
              <div className="relative aspect-[16/9] overflow-hidden bg-white/[0.04]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screen.src}
                  alt={screen.title}
                  className="h-full w-full object-cover object-left-top transition duration-500 group-hover:scale-[1.025]"
                  onError={(event) => {
                    event.currentTarget.onerror = null;
                    event.currentTarget.src = screen.fallback;
                  }}
                />
                <div className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                  <Maximize2 size={16} />
                </div>
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-white">{screen.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-400">{screen.benefit}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h3 className="text-base font-bold text-white">{selected.title}</h3>
                <p className="text-xs text-gray-400">{selected.benefit}</p>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.src}
                alt={selected.title}
                className="w-full"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = selected.fallback;
                }}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
