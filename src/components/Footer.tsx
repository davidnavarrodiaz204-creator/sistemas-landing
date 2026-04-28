'use client';

import { Store } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Store size={24} className="text-primary" />
          <span className="text-lg font-semibold gradient-text">POS Perú Digital</span>
        </div>

        <p className="text-gray-400 text-sm">
          Desarrollado en Perú para negocios reales.
        </p>

        <p className="text-gray-500 text-xs">
          © {new Date().getFullYear()} Todos los derechos reservados
        </p>
      </div>
    </footer>
  );
}
