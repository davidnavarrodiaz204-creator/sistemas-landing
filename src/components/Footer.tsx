'use client';

import { FactusysLogo } from './BrandLogo';

export default function Footer() {
  const facebookUrl = 'https://www.facebook.com/profile.php?id=61589001599610&locale=es_LA';

  return (
    <footer className="border-t border-white/5 py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
        <div className="flex items-center gap-2">
          <FactusysLogo size="sm" showTagline={false} />
        </div>

        <div className="flex flex-col items-center sm:items-end gap-2">
          <a
            href={facebookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-neon transition text-xs sm:text-sm"
          >
            Facebook oficial
          </a>
          <p className="text-gray-500 text-xs sm:text-sm text-center sm:text-right">
            Desarrollado en Perú para negocios reales.
          </p>
          <p className="text-gray-600 text-[10px] sm:text-xs">
            © {new Date().getFullYear()} FACTUSYS. Todos los derechos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}
