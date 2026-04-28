'use client';

import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/5 py-6 sm:py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex items-center gap-2">
          <Store size={18} className="sm:w-5 sm:h-5 text-blue-400" />
          <span className="text-base font-semibold gradient-text">POS Perú Digital</span>
        </div>

        <p className="text-gray-500 text-xs sm:text-sm text-center">
          Desarrollado en Perú para negocios reales.
        </p>

        <p className="text-gray-600 text-[10px] sm:text-xs">
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
