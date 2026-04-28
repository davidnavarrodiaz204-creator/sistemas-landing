'use client';

import { ShoppingCart, ChefHat, ExternalLink } from 'lucide-react';

export default function Productos() {
  const productos = [
    {
      icon: ShoppingCart,
      title: 'FERROPOS ERP Perú',
      desc: 'Sistema para ferreterías, electrónicas y tiendas con inventario, ventas, caja, clientes, SUNAT, PDF, WhatsApp y reportes.',
      demoUrl: process.env.NEXT_PUBLIC_DEMO_FERROPOS_URL || '#',
    },
    {
      icon: ChefHat,
      title: 'Restaurante POS Perú',
      desc: 'Sistema para pollerías, restaurantes y negocios de comida con mesas, pedidos, cocina, caja, comprobantes y facturación electrónica.',
      demoUrl: process.env.NEXT_PUBLIC_DEMO_RESTAURANTE_URL || '#',
    },
  ];

  return (
    <section id="productos" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">Productos</span>
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {productos.map((prod, idx) => (
            <div key={idx} className="glass-card p-8 rounded-xl">
              <div className="flex items-center gap-4 mb-6">
                <prod.icon size={40} className="text-primary" />
                <h3 className="text-2xl font-bold text-white">{prod.title}</h3>
              </div>
              <p className="text-gray-300 mb-6">{prod.desc}</p>
              <a
                href={prod.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary inline-flex items-center gap-2 text-white font-semibold px-6 py-3 rounded-lg"
              >
                Ver demo
                <ExternalLink size={18} />
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
