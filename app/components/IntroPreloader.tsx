'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

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
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#06060e]"
        >
          <div className="relative flex flex-col items-center gap-6 max-w-md px-6">
            <motion.div
              initial={{ scale: 0.8, opacity: 0, filter: 'blur(10px)' }}
              animate={{ scale: 1, opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.4, ease: 'easeOut', delay: 0.2 }}
              className="relative"
            >
              {/* Золотое пульсирующее свечение */}
              <div className="absolute inset-0 -m-8 rounded-full bg-[#d4a853]/15 blur-3xl animate-pulse" />
              <img
                src="/assets/logos/logo-with-text.svg"
                alt="МоёПризвание"
                className="h-20 md:h-24 w-auto object-contain relative z-10"
              />
            </motion.div>
            
            {/* Бегущая строка загрузки — золотая */}
            <div className="w-48 h-[2px] bg-white/5 rounded-full overflow-hidden relative mt-4">
              <motion.div
                initial={{ left: '-100%' }}
                animate={{ left: '100%' }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'linear' }}
                className="absolute top-0 bottom-0 w-1/2 bg-gradient-to-r from-transparent via-[#d4a853] to-transparent"
              />
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 0.8, duration: 0.8 }}
              className="text-[10px] uppercase tracking-[0.3em] text-[#d4a853]/60 font-medium"
            >
              Инициализация
            </motion.p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
