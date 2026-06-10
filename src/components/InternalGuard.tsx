'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useInternalAuth from '@/hooks/useInternalAuth';
import InternalLogin from './InternalLogin';
import { LogOut } from 'lucide-react';

const SESSION_TIMEOUT_MS = 24 * 60 * 60 * 1000; // 24h

export default function InternalGuard({ children, timeoutMs }: { children: React.ReactNode; timeoutMs?: number }) {
  const { authed, loading, login, logout } = useInternalAuth(timeoutMs ?? SESSION_TIMEOUT_MS);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogout(false);
  };

  return (
    <AnimatePresence mode="wait">
      {!authed ? (
        <InternalLogin key="login" onLogin={login} loading={loading} />
      ) : (
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative"
        >
          {children}

          <div className="fixed bottom-4 right-4 z-50">
            <AnimatePresence>
              {showLogout && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 8 }}
                  className="mb-2 bg-white/[0.04] border border-white/[0.08] backdrop-blur-md
                             rounded-xl p-3 shadow-2xl shadow-black/30"
                >
                  <p className="text-gray-400 text-xs mb-2 text-center whitespace-nowrap">¿Cerrar sesión?</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowLogout(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-gray-400 hover:text-white
                                 hover:bg-white/[0.06] transition-all cursor-pointer bg-transparent border-none"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleLogout}
                      className="px-3 py-1.5 rounded-lg text-xs bg-red-500/20 text-red-400
                                 hover:bg-red-500/30 transition-all cursor-pointer border-none"
                    >
                      Cerrar
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => setShowLogout(v => !v)}
              className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08]
                         flex items-center justify-center text-gray-500 hover:text-white
                         hover:bg-white/[0.08] transition-all backdrop-blur-md cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut size={15} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
