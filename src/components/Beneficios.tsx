'use client';

import { Zap, Package, Calculator, Users, FileText, BarChart3, UserCheck, Database } from 'lucide-react';

const beneficios = [
  { icon: Zap, title: 'POS rápido', desc: 'Ventas ágiles y sin demoras' },
  { icon: Package, title: 'Inventario', desc: 'Control total de stock' },
  { icon: Calculator, title: 'Caja diaria', desc: 'Cierre y arqueo automático' },
  { icon: Users, title: 'Clientes y créditos', desc: 'Gestión de cartera y pagos' },
  { icon: FileText, title: 'Facturación SUNAT', desc: 'Boletas y facturas electrónicas' },
  { icon: BarChart3, title: 'Reportes', desc: 'Análisis de ventas y ganancias' },
  { icon: UserCheck, title: 'Multiusuario', desc: 'Roles y permisos personalizados' },
  { icon: Database, title: 'Backup', desc: 'Respaldo automático en la nube' },
];

export default function Beneficios() {
  return (
    <section id="beneficios" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12">
          <span className="gradient-text">Beneficios</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {beneficios.map((item, idx) => (
            <div key={idx} className="glass-card p-6 rounded-xl text-center">
              <div className="flex justify-center mb-4">
                <item.icon size={32} className="text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-gray-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
