'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false);
  const [hasShown, setHasShown] = useState(false);

  useEffect(() => {
    // Only show on desktop for now as exit intent on mobile requires different heuristic (like fast scroll up)
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    const handleMouseLeave = (e: MouseEvent) => {
      // Check if mouse left from the top of the window (moving to tabs/address bar)
      if (e.clientY <= 0 && !hasShown) {
        setIsVisible(true);
        setHasShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [hasShown]);

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1a2536]/40 p-4 backdrop-blur-sm"
        onClick={() => setIsVisible(false)}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: 0.95, y: 20, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg rounded-[28px] bg-white p-8 shadow-[0_24px_48px_rgba(26,37,54,0.12)] border border-[#e2e8f0]"
        >
          <button
            onClick={() => setIsVisible(false)}
            className="absolute right-6 top-6 text-[#8aaec4] hover:text-[#253243] transition-colors"
          >
            <X className="h-6 w-6" />
          </button>

          <div className="text-center space-y-4 pt-4">
            <h2 className="text-2xl font-extrabold text-[#253243] font-sans">
              Уже уходите?
            </h2>
            <p className="text-[#566679] text-[1.05rem] leading-relaxed font-sans pb-4">
              Пройдите бесплатную диагностику талантов сейчас — это займёт всего 25 минут, а план развития останется с вами навсегда.
            </p>
            
            <Link
              href="/auth"
              onClick={() => setIsVisible(false)}
              className="cta-glass inline-flex h-[56px] w-full items-center justify-center gap-2 text-base"
            >
              Начать бесплатно
              <ArrowRight className="h-5 w-5" />
            </Link>
            
            <button
              onClick={() => setIsVisible(false)}
              className="mt-4 text-sm font-semibold text-[#8aaec4] hover:text-[#566679] transition-colors"
            >
              Нет, спасибо, я просто смотрю
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
