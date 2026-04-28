'use client';

import { Store, Utensils, Building2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

const negocios = [
  { icon: Store, name: 'Ferretería Industrial', type: 'Ferretería' },
  { icon: Utensils, name: 'Pollería El Sabor', type: 'Restaurante' },
  { icon: Building2, name: 'Electrónica Plus', type: 'Tienda' },
  { icon: Store, name: 'Materiales Pro', type: 'Ferretería' },
  { icon: Utensils, name: 'Restobar La Casona', type: 'Restaurante' },
  { icon: Building2, name: 'TechStore Perú', type: 'Tienda' },
];

export default function PruebaSocial() {
  return (
    <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-white/5">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-8 sm:mb-10"
        >
          <p className="text-gray-400 text-sm sm:text-base font-light">
            Negocios en Perú que ya confían en nuestros sistemas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6"
        >
          {negocios.map((negocio, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="glass-card rounded-xl p-4 text-center group hover:border-blue-500/30"
            >
              <negocio.icon size={24} className="sm:w-7 sm:h-7 text-gray-500 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
              <p className="text-white text-xs sm:text-sm font-medium mb-0.5 truncate">{negocio.name}</p>
              <p className="text-gray-500 text-[10px] sm:text-xs">{negocio.type}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center text-gray-500 text-xs sm:text-sm mt-6 sm:mt-8"
        >
          Más de 50 negocios gestionan sus ventas con nuestros sistemas
        </motion.p>
      </div>
    </section>
  );
}
