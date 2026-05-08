'use client';

import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { FactusysLogo } from './BrandLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
        >
          <FactusysLogo size="sm" showTagline={false} />
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('beneficios')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Beneficios
          </button>
          <button onClick={() => scrollTo('productos')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Productos
          </button>
          <button onClick={() => scrollTo('sistema-accion')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Sistema en acción
          </button>
          <button onClick={() => scrollTo('planes')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Planes
          </button>
          <button onClick={() => scrollTo('faq')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            FAQ
          </button>
          <button onClick={() => scrollTo('contacto')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Contacto
          </button>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999'}?text=${encodeURIComponent('Hola, quiero información sobre FACTUSYS para mi negocio.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-neon text-black text-sm font-semibold px-5 py-2 rounded-full inline-flex items-center cursor-pointer"
          >
            Contactar
          </a>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white cursor-pointer bg-transparent border-none"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <button onClick={() => scrollTo('beneficios')} className="block text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              Beneficios
            </button>
            <button onClick={() => scrollTo('productos')} className="block text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              Productos
            </button>
            <button onClick={() => scrollTo('planes')} className="block text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              Planes
            </button>
            <button onClick={() => scrollTo('faq')} className="block text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              FAQ
            </button>
            <button onClick={() => scrollTo('contacto')} className="block text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              Contacto
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
