'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasConsented = localStorage.getItem('mp-cookie-consent');
    if (!hasConsented) {
      // Задержка появления для более плавного старта
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem('mp-cookie-consent', 'true');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-[99999] mx-auto max-w-5xl md:bottom-8"
        >
          <div className="flex flex-col items-center justify-between gap-4 rounded-[20px] bg-white/90 p-5 shadow-[0_16px_40px_rgba(26,37,54,0.12)] backdrop-blur-md border border-[#e2e8f0] md:flex-row md:px-8 md:py-4">
            <p className="text-sm text-[#566679] leading-relaxed max-w-3xl">
              Мы используем файлы cookie и аналитические системы для улучшения работы сервиса. 
              Продолжая пользоваться сайтом, вы даете согласие на обработку данных согласно 
              <a href="/privacy" className="text-[#8aaec4] hover:underline ml-1">Политике конфиденциальности</a>.
            </p>
            <button
              onClick={acceptCookies}
              className="whitespace-nowrap rounded-xl bg-[#253243] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1a2536] transition-colors w-full md:w-auto"
            >
              Согласен
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
