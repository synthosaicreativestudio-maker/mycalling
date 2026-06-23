'use client';

import { motion } from 'framer-motion';
import { AnimatedLogoText } from './AnimatedLogoText';

interface AnimatedLogoProps {
  /** true = версия с текстом "МоёПризвание", false = только дерево */
  showText?: boolean;
  className?: string;
  /** Анимировать при монтировании (прелоадер) */
  animate?: boolean;
  /** Компоновка элементов: горизонтальная для шапки/подвала, вертикальная для прелоадера */
  layout?: 'horizontal' | 'vertical';
}

export function AnimatedLogo({
  showText = false,
  className = '',
  animate = true,
  layout = 'horizontal',
}: AnimatedLogoProps) {
  const isVertical = layout === 'vertical';

  const containerClasses = isVertical
    ? 'flex flex-col items-center justify-center text-center gap-6'
    : 'flex items-center gap-3';

  return (
    <div className={`${containerClasses} ${className}`}>
      {animate ? (
        <motion.img
          src="/assets/logos/logo.png"
          alt="Дерево призвания"
          className={isVertical ? 'h-48 md:h-64 w-auto' : 'h-10 md:h-12 w-auto'}
          style={{ objectFit: 'contain' }}
          initial={{ opacity: 0, scale: 0.75, filter: 'blur(8px)' }}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 1.4,
            ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
          }}
        />
      ) : (
        <img
          src="/assets/logos/logo.png"
          alt="Дерево призвания"
          className={isVertical ? 'h-48 md:h-64 w-auto' : 'h-10 md:h-12 w-auto'}
          style={{ objectFit: 'contain' }}
        />
      )}
      
      {showText && (
        <AnimatedLogoText
          animate={animate}
          className={isVertical ? 'h-12 md:h-16 w-auto' : 'h-6 md:h-7 w-auto'}
        />
      )}
    </div>
  );
}
