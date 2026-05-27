'use client';

import { useEffect, useState } from 'react';
import { Camera, Maximize2, X } from 'lucide-react';

type ShowcaseTab = 'restaurante' | 'ferreteria';

type ShowcaseItem = {
  title: string;
  benefit: string;
  src: string;
};

const restauranteScreens: ShowcaseItem[] = [
  {
    title: 'Dashboard/control de turno',
    benefit: 'Vista rápida de ventas, caja abierta, mesas, cocina y alertas operativas.',
    src: '/restaurante/dashboard-control-turno.png',
  },
  {
    title: 'POS venta rápida',
    benefit: 'Productos por categoría, mesas, recojo, delivery y pedido actual en una sola pantalla.',
    src: '/restaurante/pos-venta-rapida.png',
  },
  {
    title: 'Mesas y QR',
    benefit: 'Control de salón con mesas libres, ocupadas, cuenta, limpieza y QR por mesa.',
    src: '/restaurante/mesas-qr.png',
  },
  {
    title: 'Cocina/KDS',
    benefit: 'Comandas por estado: pendiente, preparando, listo y servido para ordenar cocina.',
    src: '/restaurante/cocina-kds.png',
  },
  {
    title: 'Caja',
    benefit: 'Apertura, egresos, cierre, movimientos y auditoría del turno.',
    src: '/restaurante/caja.png',
  },
  {
    title: 'Reportes',
    benefit: 'Ventas, ticket promedio, efectivo esperado, utilidad y métodos de pago.',
    src: '/restaurante/reportes.png',
  },
  {
    title: 'Documentos',
    benefit: 'Comprobantes, filtros, estado fiscal y revisión antes de emitir documentos reales.',
    src: '/restaurante/documentos.png',
  },
  {
    title: 'Inventario',
    benefit: 'Catálogo operativo con productos, precios, stock, categorías y destino de comanda.',
    src: '/restaurante/inventario.png',
  },
];

const ferreteriaScreens: ShowcaseItem[] = [
  {
    title: 'Resumen ejecutivo',
    benefit: 'Panel rápido para ver ventas, caja, documentos y estado del negocio.',
    src: '/ferro/dashboard.png',
  },
  {
    title: 'POS',
    benefit: 'Venta rápida con carrito, comprobante, cliente, métodos de pago e IGV.',
    src: '/ferro/pos.png',
  },
  {
    title: 'Caja',
    benefit: 'Caja por turno con ingresos, egresos, efectivo esperado y cierre diario.',
    src: '/ferro/caja.png',
  },
  {
    title: 'Documentos',
    benefit: 'Boletas, facturas, tickets, notas y estado SUNAT/Nubefact en una vista.',
    src: '/ferro/documentos.png',
  },
  {
    title: 'Reportes',
    benefit: 'Control de ventas, stock, productos y resultados para tomar decisiones.',
    src: '/ferro/reportes.png',
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

function ScreenshotCard({
  screen,
  onOpen,
}: {
  screen: ShowcaseItem;
  onOpen: (screen: ShowcaseItem) => void;
}) {
  const imageAvailable = useImageAvailable(screen.src);
  const canOpen = imageAvailable === true;

  return (
    <article className="showcase-card group overflow-hidden rounded-2xl text-left">
      <button
        type="button"
        onClick={() => canOpen && onOpen(screen)}
        disabled={!canOpen}
        className="block w-full text-left disabled:cursor-default"
        aria-label={!canOpen ? `${screen.title}: captura pendiente` : `Abrir captura: ${screen.title}`}
      >
        <div className="showcase-media relative aspect-[16/10] overflow-hidden">
          {!canOpen ? (
            <div className="showcase-fallback">
              <Camera size={28} />
              <span>Captura pendiente</span>
            </div>
          ) : (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={screen.src}
                alt={screen.title}
                className="showcase-image h-full w-full rounded-xl object-contain object-left-top transition duration-500 group-hover:scale-[1.018]"
              />
              <div className="absolute right-3 top-3 rounded-full bg-black/55 p-2 text-white opacity-0 backdrop-blur transition group-hover:opacity-100">
                <Maximize2 size={16} />
              </div>
            </>
          )}
        </div>
      </button>
      <div className="p-5">
        <h3 className="text-lg font-bold">{screen.title}</h3>
        <p className="mt-2 text-sm leading-relaxed">{screen.benefit}</p>
      </div>
    </article>
  );
}

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
            <ScreenshotCard
              key={`${activeTab}-${screen.title}`}
              screen={screen}
              onOpen={setSelected}
            />
          ))}
        </div>
      </div>

      {selected && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelected(null)}
        >
          <div
            className="max-h-[92vh] w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <h3 className="text-base font-bold text-white">{selected.title}</h3>
                <p className="text-xs text-gray-400">{selected.benefit}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[78vh] overflow-auto bg-slate-950 p-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={selected.src}
                alt={selected.title}
                className="mx-auto w-full rounded-xl bg-white object-contain"
                onError={() => setSelected(null)}
              />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
