'use client';

import { MessageCircle, Mail } from 'lucide-react';

export default function Contacto() {
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51999999999';
  const contactEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'contacto@ejemplo.com';
  const whatsappMessage = 'Hola, quiero información sobre sus sistemas POS para mi negocio.';

  return (
    <section id="contacto" className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-12">
          <span className="gradient-text">Contacto</span>
        </h2>

        <div className="flex flex-col sm:flex-row gap-6 justify-center">
          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-3 text-lg"
          >
            <MessageCircle size={24} />
            Contactar por WhatsApp
          </a>

          <a
            href={`mailto:${contactEmail}`}
            className="btn-secondary text-white font-semibold px-8 py-4 rounded-lg flex items-center justify-center gap-3 text-lg"
          >
            <Mail size={24} />
            Enviar correo
          </a>
        </div>
      </div>
    </section>
  );
}
