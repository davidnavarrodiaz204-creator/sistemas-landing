'use client';

import { MessageCircle, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contacto() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@ejemplo.com';
  const whatsappMessage = 'Hola, quiero información sobre sus sistemas POS para mi negocio.';
  return (
    <section id="contacto" className="section-spacing px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4">
            <span className="gradient-text">Hablemos</span>
          </h2>
          <p className="text-base sm:text-xl text-gray-400 font-light mb-8 sm:mb-12 px-2">
            Cuéntanos sobre tu negocio y te mostramos cómo podemos ayudarte
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex flex-col gap-4 sm:flex-row sm:gap-6 justify-center"
        >
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white font-medium px-8 sm:px-10 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg w-full sm:w-auto"
          >
            <MessageCircle size={20} className="sm:w-6 sm:h-6" />
            Contactar por WhatsApp
          </a>

          <a
            href={`mailto:${contactEmail}`}
            className="btn-secondary text-white font-medium px-8 sm:px-10 py-3 sm:py-4 rounded-full flex items-center justify-center gap-2 sm:gap-3 text-base sm:text-lg w-full sm:w-auto"
          >
            <Mail size={20} className="sm:w-6 sm:h-6" />
            Enviar correo
          </a>
        </motion.div>
      </div>
    </section>
  );
}
