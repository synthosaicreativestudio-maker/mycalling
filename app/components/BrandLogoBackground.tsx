'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import Image from 'next/image';

export function BrandLogoBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 -z-5 pointer-events-none overflow-hidden select-none print:hidden">
      {/* Контейнер логотипа с позиционированием и анимацией дыхания */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{
          opacity: [0.7, 0.85, 0.7],
          scale: [1, 1.02, 1],
        }}
        transition={{
          duration: 10,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
        className="absolute 
                   /* Мобильные экраны: по центру с очень низким opacity в качестве водяного знака */
                   left-1/2 top-[50%] -translate-x-1/2 -translate-y-1/2 
                   w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] 
                   opacity-[0.22]
                   
                   /* Десктопные экраны: справа, четко в свободном пространстве */
                   md:left-auto md:right-[2%] lg:right-[4%] xl:right-[8%] md:top-1/2 md:-translate-y-1/2 md:translate-x-0
                   md:w-[450px] md:h-[450px] lg:w-[540px] lg:h-[540px] xl:w-[600px] xl:h-[600px]
                   md:opacity-85"
        style={{
          mixBlendMode: 'screen', // Отфильтровывает черный фон оригинальной картинки
        }}
      >
        <Image
          src="/assets/images/brand-logo.png"
          alt="Логотип Моё Призвание"
          fill
          priority
          sizes="(max-width: 768px) 350px, 600px"
          className="object-contain"
        />
      </motion.div>
    </div>
  );
}
