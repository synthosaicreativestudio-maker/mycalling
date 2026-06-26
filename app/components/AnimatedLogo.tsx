/* eslint-disable @next/next/no-img-element */
'use client';

import { motion } from 'framer-motion';
import { AnimatedLogoText } from './AnimatedLogoText';
import { useUIStore } from '../store/uiStore';

interface AnimatedLogoProps {
  /** true = версия с текстом "МоёПризвание", false = только дерево */
  showText?: boolean;
  className?: string;
  /** Анимировать при монтировании */
  animate?: boolean;
  /** Компоновка элементов: горизонтальная для шапки/подвала, вертикальная для прелоадера */
  layout?: 'horizontal' | 'vertical';
  /** Является ли логотипом в шапке сайта (для перелета текста) */
  isHeader?: boolean;
}

export function AnimatedLogo({
  showText = false,
  className = '',
  animate = true,
  layout = 'horizontal',
  isHeader = false,
}: AnimatedLogoProps) {
  const isVertical = layout === 'vertical';
  const { introState } = useUIStore();

  const containerClasses = isVertical
    ? 'flex flex-col items-center justify-center text-center gap-6'
    : 'flex items-center gap-3';

  // Если это шапка, логотип скрыт до начала перехода (transition)
  const isVisible = !isHeader || (introState === 'transition' || introState === 'completed');

  if (!isVisible) {
    // Возвращаем пустой невидимый контейнер с теми же размерами, чтобы разметка не прыгала
    return <div className={`${containerClasses} ${className} opacity-0 pointer-events-none`} />;
  }

  return (
    <div className={`${containerClasses} ${className}`}>
      {/* Маленькое дерево в логотипе */}
      {animate ? (
        <motion.img
          src="/assets/logos/logo.png"
          alt="Дерево призвания"
          className={isVertical ? 'h-48 md:h-64 w-auto' : 'h-10 md:h-12 w-auto'}
          style={{ objectFit: 'contain' }}
          initial={isHeader ? { opacity: 0, scale: 0.8 } : { opacity: 0, scale: 0.75, filter: 'blur(8px)'}}
          animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
          transition={{
            duration: 0.8,
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
      
      {/* Текст логотипа (с Shared Layout layoutId для перелета) */}
      {showText && (
        <motion.div
          layoutId={isHeader ? "logo-text-container" : undefined}
          className="relative"
          transition={{
            type: "spring",
            stiffness: 70,
            damping: 15
          }}
        >
          <AnimatedLogoText
            animate={animate}
            className={isVertical ? 'h-12 md:h-16 w-auto' : 'h-6 md:h-7 w-auto'}
          />
        </motion.div>
      )}
    </div>
  );
}
