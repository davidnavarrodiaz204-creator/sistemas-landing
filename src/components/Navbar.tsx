'use client';

import { useState } from 'react';
import { Menu, Moon, Sun, X } from 'lucide-react';
import { FactusysLogo } from './BrandLogo';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setIsOpen(false);
  };

  const toggleTheme = () => {
    const nextIsDayMode = !document.documentElement.classList.contains('theme-day');
    document.documentElement.classList.toggle('theme-day', nextIsDayMode);
    window.localStorage.setItem('factusys-theme', nextIsDayMode ? 'day' : 'night');
  };

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 h-14 sm:h-16">
      <div className="max-w-7xl w-full mx-auto flex items-center justify-between h-full">
        <button
          onClick={() => scrollTo('hero')}
          className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
        >
          <span className="logo-night">
            <FactusysLogo size="sm" showTagline={false} theme="dark" />
          </span>
          <span className="logo-day">
            <FactusysLogo size="sm" showTagline={false} theme="light" />
          </span>
        </button>

        <div className="hidden md:flex items-center gap-8">
          <button onClick={() => scrollTo('beneficios')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Beneficios
          </button>
          <button onClick={() => scrollTo('productos')} className="text-gray-300 hover:text-white transition text-sm cursor-pointer bg-transparent border-none">
            Sistemas
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
          <button
            onClick={toggleTheme}
            className="theme-toggle inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/[0.03] text-gray-300 hover:text-white transition cursor-pointer"
            aria-label="Cambiar modo dia o noche"
            title="Cambiar modo dia o noche"
          >
            <Sun size={18} className="theme-icon-night" />
            <Moon size={18} className="theme-icon-day" />
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
          className="md:hidden fixed top-3 right-4 z-[60] text-white cursor-pointer bg-black/40 border border-white/10 p-2 rounded-full flex items-center justify-center backdrop-blur"
          aria-label={isOpen ? 'Cerrar menu' : 'Abrir menu'}
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
              Sistemas
            </button>
            <button onClick={() => scrollTo('sistema-accion')} className="block text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              Sistema en accion
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
            <button onClick={toggleTheme} className="theme-toggle flex items-center gap-2 text-gray-300 hover:text-white py-2 text-left w-full cursor-pointer bg-transparent border-none">
              <Sun size={18} className="theme-icon-night" />
              <Moon size={18} className="theme-icon-day" />
              Cambiar dia/noche
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
