'use client';

import { motion } from 'framer-motion';
import {
  Beef,
  ChefHat,
  Fish,
  GlassWater,
  Hammer,
  MessageCircle,
  Package,
  QrCode,
  ReceiptText,
  Store,
} from 'lucide-react';

const rubros = [
  {
    icon: Beef,
    name: 'Pollerías',
    initials: 'PO',
    controls: 'Mesas, pedidos, delivery, cocina, caja y comprobantes.',
    modules: ['POS', 'Mesas', 'Cocina/KDS', 'Caja'],
    benefit: 'Atiende más rápido y evita perder pedidos en horas punta.',
    stats: ['30 días demo', 'KDS listo'],
    badges: ['SUNAT', 'Caja', 'Cocina', 'Reportes'],
    message: 'Hola, quiero una demo de FACTUSYS RESTO para una pollería.',
  },
  {
    icon: ChefHat,
    name: 'Restaurantes',
    initials: 'RS',
    controls: 'Salón, mozos, comandas, pagos, reportes y turnos.',
    modules: ['Dashboard', 'Mesas', 'QR', 'Reportes'],
    benefit: 'Ordena la operación diaria desde venta hasta cierre de caja.',
    stats: ['QR por mesa', 'Turnos'],
    badges: ['Caja', 'Cocina', 'QR', 'Reportes'],
    message: 'Hola, quiero una demo de FACTUSYS RESTO para un restaurante.',
  },
  {
    icon: Fish,
    name: 'Cevicherías',
    initials: 'CV',
    controls: 'Pedidos rápidos, cocina, cuentas por mesa y ventas del día.',
    modules: ['POS', 'Cocina', 'Caja', 'Reportes'],
    benefit: 'Controla picos de atención y pedidos sin perder comanda.',
    stats: ['Venta rápida', 'Caja diaria'],
    badges: ['Caja', 'Cocina', 'Reportes'],
    message: 'Hola, quiero una demo de FACTUSYS RESTO para una cevichería.',
  },
  {
    icon: GlassWater,
    name: 'Bares',
    initials: 'BR',
    controls: 'Barra, mesas, cuentas abiertas, pagos digitales y caja.',
    modules: ['Barra', 'Mesas', 'Caja', 'QR'],
    benefit: 'Cobra más fácil y mantiene el control de consumos abiertos.',
    stats: ['Pagos mixtos', 'QR'],
    badges: ['Caja', 'QR', 'Reportes'],
    message: 'Hola, quiero una demo de FACTUSYS RESTO para un bar.',
  },
  {
    icon: Hammer,
    name: 'Ferreterías',
    initials: 'FE',
    controls: 'Ventas, caja, inventario, cotizaciones, compras y clientes.',
    modules: ['POS', 'Inventario', 'Cotizaciones', 'Documentos'],
    benefit: 'Evita quiebres de stock y vende con comprobantes ordenados.',
    stats: ['Stock vivo', 'Cotizaciones'],
    badges: ['SUNAT', 'Caja', 'Inventario', 'Reportes'],
    message: 'Hola, quiero una demo de FACTUSYS FERRO para una ferretería.',
  },
  {
    icon: Store,
    name: 'Minimarkets',
    initials: 'MM',
    controls: 'Productos, precios, caja, proveedores, ventas y reportes.',
    modules: ['POS', 'Inventario', 'Caja', 'Reportes'],
    benefit: 'Vende rápido y revisa qué productos se mueven más.',
    stats: ['Stock bajo', 'Ventas día'],
    badges: ['Caja', 'Inventario', 'Reportes'],
    message: 'Hola, quiero una demo de FACTUSYS para un minimarket.',
  },
];

const badgeIcons: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  SUNAT: ReceiptText,
  Caja: ReceiptText,
  Inventario: Package,
  Cocina: ChefHat,
  QR: QrCode,
  Reportes: ReceiptText,
};

export default function CasosRubros() {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51987454769';

  return (
    <section id="casos-rubros" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"
        >
          <div>
            <div className="mb-4">
              <span className="brand-section-label">Casos reales</span>
            </div>
            <h2 className="text-3xl font-bold sm:text-4xl lg:text-5xl">
              <span className="brand-gradient-text">Rubros compatibles con FACTUSYS</span>
            </h2>
            <p className="mt-4 max-w-3xl text-base font-light leading-relaxed text-gray-400 sm:text-xl">
              Soluciones listas para negocios que necesitan vender, controlar caja, revisar stock y decidir con reportes claros.
            </p>
          </div>
          <div className="rubros-summary">
            <span>6 rubros</span>
            <span>2 sistemas</span>
            <span>1 demo guiada</span>
          </div>
        </motion.div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {rubros.map((rubro, index) => (
            <motion.article
              key={rubro.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-80px' }}
              transition={{ duration: 0.45, delay: index * 0.05 }}
              className="rubro-card"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="rubro-logo">
                    <rubro.icon size={22} />
                  </div>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-neon">{rubro.initials}</p>
                    <h3 className="rubro-title">{rubro.name}</h3>
                  </div>
                </div>
                <div className="rubro-mock-logo">{rubro.initials}</div>
              </div>

              <div className="space-y-4">
                <InfoBlock label="Qué controla" value={rubro.controls} />
                <div>
                  <p className="rubro-label">Módulos que usa</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {rubro.modules.map((module) => (
                      <span key={module} className="rubro-module">{module}</span>
                    ))}
                  </div>
                </div>
                <InfoBlock label="Beneficio principal" value={rubro.benefit} />
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                {rubro.stats.map((stat) => (
                  <div key={stat} className="rubro-stat">
                    <span>{stat}</span>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {rubro.badges.map((badge) => {
                  const Icon = badgeIcons[badge] || ReceiptText;
                  return (
                    <span key={badge} className="rubro-badge">
                      <Icon size={13} />
                      {badge}
                    </span>
                  );
                })}
              </div>

              <a
                href={`https://wa.me/${phone}?text=${encodeURIComponent(rubro.message)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rubro-cta"
              >
                <MessageCircle size={17} />
                Solicitar demo
              </a>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="rubro-label">{label}</p>
      <p className="rubro-copy">{value}</p>
    </div>
  );
}
