'use client';

import { ShoppingCart, ChefHat, MessageCircle } from 'lucide-react';

export default function Hero() {
  return (
    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          <span className="gradient-text">Sistemas POS y ERP</span>
          <br />
          <span className="text-white">para negocios en Perú</span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-300 mb-10 max-w-3xl mx-auto">
          Vende, controla tu caja, inventario y facturación electrónica desde un solo sistema.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href={process.env.NEXT_PUBLIC_DEMO_FERROPOS_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2"
          >
            <ShoppingCart size={20} />
            Ver demo Ferretería
          </a>

          <a
            href={process.env.NEXT_PUBLIC_DEMO_RESTAURANTE_URL || '#'}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2"
          >
            <ChefHat size={20} />
            Ver demo Restaurante
          </a>

          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999'}?text=${encodeURIComponent('Hola, quiero información sobre sus sistemas POS para mi negocio.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
}
