'use client';

import { useEffect, useState } from 'react';
import {
  ExternalLink,
  Check,
  Store,
  Utensils,
  Package,
  Calculator,
  FileText,
  ClipboardList,
  ChefHat,
  Table2,
  WalletCards,
  BarChart3,
  MessageCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';

const productos = [
  {
    icon: Store,
    title: 'FACTUSYS FERRO',
    eyebrow: 'Ferreterias, tiendas y retail',
    desc: 'POS especializado para vender rapido, controlar productos por codigo, revisar stock, manejar caja, clientes, creditos y documentos electronicos.',
    demoUrl: process.env.NEXT_PUBLIC_DEMO_FERROPOS_URL || '#',
    whatsappText: 'Hola, quiero una demo de FACTUSYS FERRO para mi ferreteria o tienda.',
    image: '/ferro/dashboard.png',
    imageAlt: 'Pantalla de inventario de FACTUSYS FERRO',
    features: [
      'POS con busqueda por nombre o codigo',
      'Inventario con categorias, proveedores y reposicion',
      'Caja por turno con ingresos, egresos y arqueo',
      'Clientes, creditos, cotizaciones y compras',
      'Boletas, facturas, tickets y notas de credito',
    ],
    modules: [
      { icon: Package, label: 'Inventario exacto' },
      { icon: Calculator, label: 'Caja diaria' },
      { icon: FileText, label: 'SUNAT/Nubefact' },
      { icon: BarChart3, label: 'Reportes' },
    ],
    color: 'blue',
  },
  {
    icon: Utensils,
    title: 'FACTUSYS RESTO',
    eyebrow: 'Restaurantes, pollerias y comida rapida',
    desc: 'POS para atender mesas, registrar pedidos, enviar comandas, cobrar rapido y mantener el control de caja y facturacion electronica.',
    demoUrl: process.env.NEXT_PUBLIC_DEMO_RESTAURANTE_URL || '#',
    whatsappText: 'Hola, quiero una demo de FACTUSYS RESTO para mi restaurante.',
    image: '/restaurante/pos-venta-rapida.png',
    imageAlt: 'Pantalla POS de FACTUSYS RESTO',
    features: [
      'Atencion por mesas, barra o delivery',
      'Pedidos y comandas para cocina',
      'Cobro en efectivo, Yape, Plin, tarjeta o credito',
      'Caja por turno y resumen de ventas',
      'Boletas, facturas y tickets para cada consumo',
    ],
    modules: [
      { icon: Table2, label: 'Mesas y pedidos' },
      { icon: ChefHat, label: 'Comandas' },
      { icon: WalletCards, label: 'Pagos rapidos' },
      { icon: ClipboardList, label: 'Control diario' },
    ],
    color: 'green',
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

function ProductScreenshot({ src, alt }: { src: string; alt: string }) {
  const imageAvailable = useImageAvailable(src);

  if (imageAvailable !== true) {
    return (
      <div className="showcase-fallback min-h-[300px]">
        <Package size={30} />
        <span>Captura pendiente</span>
      </div>
    );
  }

  return (
    <div className="showcase-media h-full min-h-[300px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="h-full max-h-[430px] w-full rounded-xl object-contain object-left-top"
      />
    </div>
  );
}

export default function Productos() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51987454769';

  return (
    <section id="productos" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="brand-gradient-text">Cada rubro tiene su propio sistema</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light px-2 max-w-3xl mx-auto">
            No vendemos una pantalla generica. Separamos la experiencia para que una ferreteria trabaje como ferreteria y un restaurante atienda como restaurante.
          </p>
        </motion.div>

        <div className="space-y-8 sm:space-y-10">
          {productos.map((prod, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: idx * 0.2 }}
              className="glass-card rounded-2xl sm:rounded-3xl overflow-hidden group"
            >
              <div className={`grid grid-cols-1 lg:grid-cols-12 ${idx % 2 === 1 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
                <div className="lg:col-span-7 min-h-[260px] border-b border-white/10 bg-slate-950 lg:border-b-0 lg:border-r">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.02]">
                    <span className="w-3 h-3 rounded-full bg-red-500/80" />
                    <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <span className="w-3 h-3 rounded-full bg-green-500/80" />
                    <span className="ml-2 text-xs text-gray-500 truncate">{prod.title} demo</span>
                  </div>
                  <ProductScreenshot src={prod.image} alt={prod.imageAlt} />
                </div>

                <div className="lg:col-span-5 p-6 sm:p-8">
                  <div className="flex items-start gap-3 sm:gap-4 mb-5">
                    <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-colors ${
                      prod.color === 'blue'
                        ? 'bg-blue-500/10 group-hover:bg-blue-500/20'
                        : 'bg-neon/10 group-hover:bg-neon/20'
                    } flex-shrink-0`}>
                      <prod.icon size={24} className={`sm:w-8 sm:h-8 ${
                        prod.color === 'blue' ? 'text-blue-400' : 'text-neon'
                      }`} />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-gray-500 mb-1">{prod.eyebrow}</p>
                      <h3 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{prod.title}</h3>
                      <p className="text-sm sm:text-base text-gray-400 leading-relaxed">{prod.desc}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mb-5">
                    {prod.modules.map((module, midx) => (
                      <div key={midx} className="rounded-xl bg-white/[0.03] border border-white/5 px-3 py-3 flex items-center gap-2">
                        <module.icon size={16} className={prod.color === 'blue' ? 'text-blue-400' : 'text-neon'} />
                        <span className="text-xs sm:text-sm text-gray-300">{module.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {prod.features.map((feature, fidx) => (
                      <div key={fidx} className="flex items-start gap-2 sm:gap-3">
                        <Check size={16} className="sm:w-[18px] sm:h-[18px] text-green-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm sm:text-base text-gray-300">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href={prod.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-neon inline-flex items-center justify-center gap-2 text-black font-semibold px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base w-full sm:w-auto"
                    >
                      Abrir demo
                      <ExternalLink size={14} className="sm:w-[18px] sm:h-[18px]" />
                    </a>
                    <a
                      href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(prod.whatsappText)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline inline-flex items-center justify-center gap-2 text-white font-medium px-5 sm:px-6 py-2.5 sm:py-3 rounded-full text-sm sm:text-base w-full sm:w-auto"
                    >
                      <MessageCircle size={16} />
                      Consultar
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
