'use client';

import { useState } from 'react';
import { Menu, X, Store } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="navbar fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 lg:px-8 h-14 sm:h-16"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between h-full">
        <div className="flex items-center gap-2">
          <Store className="w-8 h-8 text-blue-400" />
          <span className="text-xl font-bold gradient-text">POS Perú Digital</span>
        </div>

        <div className="hidden md:flex items-center gap-8">
          <a href="#beneficios" className="text-gray-300 hover:text-white transition text-sm">
            Beneficios
          </a>
          <a href="#productos" className="text-gray-300 hover:text-white transition text-sm">
            Productos
          </a>
          <a href="#planes" className="text-gray-300 hover:text-white transition text-sm">
            Planes
          </a>
          <a href="#contacto" className="text-gray-300 hover:text-white transition text-sm">
            Contacto
          </a>
          <a
            href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999'}?text=${encodeURIComponent('Hola, quiero información sobre sus sistemas POS para mi negocio.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white text-sm font-semibold px-5 py-2 rounded-lg"
          >
            Contactar
          </a>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden text-white"
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-black/95 backdrop-blur-lg border-t border-white/10"
        >
          <div className="px-4 py-4 space-y-3">
            <a href="#beneficios" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
              Beneficios
            </a>
            <a href="#productos" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
              Productos
            </a>
            <a href="#planes" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
              Planes
            </a>
            <a href="#contacto" className="block text-gray-300 hover:text-white py-2" onClick={() => setIsOpen(false)}>
              Contacto
            </a>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}
