'use client';

import { MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WhatsAppFloat() {
  const phoneNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '51987454769';
  const message = encodeURIComponent('Hola, quiero información sobre FACTUSYS para mi negocio.');

  return (
    <motion.a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      whileHover={{ scale: 1.1 }}
      className="fixed bottom-5 right-5 z-50 group"
    >
      <div className="relative">
        <div className="absolute -inset-1 bg-[#25D366] rounded-full opacity-30 animate-ping" />
        <div className="relative bg-[#25D366] hover:bg-[#20bd5a] text-white p-3.5 sm:p-5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
          <MessageCircle size={24} className="sm:w-8 sm:h-8" />
        </div>

        <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="bg-gray-900 text-white text-sm px-4 py-2 rounded-lg whitespace-nowrap">
            Escríbenos por WhatsApp
            <div className="absolute left-full top-1/2 -translate-y-1/2 border-4 border-transparent border-l-gray-900" />
          </div>
        </div>
      </div>
    </motion.a>
  );
}
