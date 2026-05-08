'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FactusysMarkNeon } from './BrandLogo';
import { Lock, ArrowRight, AlertCircle } from 'lucide-react';

interface InternalLoginProps {
  onLogin: (password: string) => boolean;
}

export default function InternalLogin({ onLogin }: InternalLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setError(false);

    setTimeout(() => {
      const ok = onLogin(password);
      if (!ok) {
        setError(true);
        setShake(true);
        setPassword('');
        setLoading(false);
        setTimeout(() => setShake(false), 500);
      }
    }, 400);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-black flex items-center justify-center px-4"
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#00e676]/[0.04] rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-blue-500/[0.02] rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative z-10 w-full max-w-sm"
      >
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-2xl p-8 sm:p-10 backdrop-blur-sm">
          <div className="text-center mb-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="flex justify-center mb-5"
            >
              <FactusysMarkNeon className="w-14 h-14" />
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.25 }}
              className="text-xl font-bold text-white mb-1"
            >
              Panel interno FACTUSYS
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.35 }}
              className="text-gray-500 text-sm"
            >
              Ingresa la contraseña para acceder
            </motion.p>
          </div>

          <motion.form
            onSubmit={handleSubmit}
            className="space-y-4"
            animate={shake ? { x: [-8, 8, -6, 6, -3, 3, 0] } : {}}
            transition={{ duration: 0.4 }}
          >
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(false); }}
                placeholder="Contraseña"
                autoFocus
                disabled={loading}
                className="w-full bg-white/[0.04] border border-white/[0.1] rounded-xl pl-10 pr-4 py-3
                           text-white text-sm placeholder:text-gray-600 outline-none
                           focus:border-[#00e676]/40 focus:bg-white/[0.06] transition-all
                           disabled:opacity-50"
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="flex items-center justify-center gap-1.5 text-red-400 text-xs"
                >
                  <AlertCircle size={13} />
                  Contraseña incorrecta
                </motion.p>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-[#00e676] text-black font-semibold
                         rounded-xl py-3 text-sm hover:bg-[#00c853] transition-all
                         active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer border-none"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  Ingresar
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </motion.form>

          <p className="text-center mt-8 text-gray-600 text-xs">
            Solo personal autorizado
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
