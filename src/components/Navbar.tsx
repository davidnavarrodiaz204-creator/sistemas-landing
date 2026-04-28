'use client';

import { useState } from 'react';
import { Menu, X, Store } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="navbar fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16">
        <div className="flex items-center gap-2">
          <Store className="w-8 h-8 text-primary" />
          <span className="text-xl font-bold gradient-text">POS Perú Digital</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#beneficios" className="text-gray-300 hover:text-white transition">Beneficios</a>
          <a href="#productos" className="text-gray-300 hover:text-white transition">Productos</a>
          <a href="#planes" className="text-gray-300 hover:text-white transition">Planes</a>
          <a href="#contacto" className="text-gray-300 hover:text-white transition">Contacto</a>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <div className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10">
          <div className="px-4 py-4 space-y-3">
            <a href="#beneficios" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Beneficios</a>
            <a href="#productos" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Productos</a>
            <a href="#planes" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Planes</a>
            <a href="#contacto" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>Contacto</a>
          </div>
        </div>
      )}
    </nav>
  );
}
