'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedLogo } from './AnimatedLogo';

export function IntroPreloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const hasSeen = sessionStorage.getItem('seen-preloader');
    if (hasSeen) {
      setLoading(false);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(false);
      sessionStorage.setItem('seen-preloader', 'true');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#f5f7fa]"
        >
          <div className="relative flex flex-col items-center gap-6 max-w-md px-6">
            <motion.div
              initial={{ scale: 0.85, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
              className="relative"
            >
              {/* Нежное золотое свечение */}
              <div className="absolute inset-0 -m-16 rounded-full bg-[#d4a853]/10 blur-3xl animate-pulse" />
              <AnimatedLogo
                showText={true}
                animate={true}
                layout="vertical"
                className="relative z-10"
              />
            </motion.div>
            
            {/* Бегущая строка загрузки */}
            <div className="w-48 h-[2px] bg-slate-200 rounded-full overflow-hidden relative mt-4">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#b8860b] to-transparent"
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-[10px] uppercase tracking-[0.3em] text-[#1a2536]/60 font-medium"
            >
              Инициализация
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
