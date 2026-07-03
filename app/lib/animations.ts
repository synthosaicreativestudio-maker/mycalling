import type { Variants } from 'framer-motion';

// Анимация контейнера секции для последовательного появления дочерних элементов
export const sectionVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

// Плавное появление снизу вверх
export const fadeUpVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.16, 1, 0.3, 1], // premium cubic-bezier easeOut
    },
  },
};

// Анимация входа для Hero-секции с размытием (blur)
export const heroVariants: Variants = {
  hidden: { opacity: 0, y: 25, filter: 'blur(8px)' },
  visible: (customDelay: number = 0) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 1.0,
      delay: customDelay,
      ease: [0.16, 1, 0.3, 1],
    },
  }),
};

// Пульсирующее неоновое свечение для CTA-кнопки
export const ctaGlowVariants: Variants = {
  idle: {
    boxShadow: '0 0 15px rgba(59,130,246,0.15)',
  },
  pulse: {
    boxShadow: [
      '0 0 15px rgba(59,130,246,0.15)',
      '0 0 32px rgba(59,130,246,0.35)',
      '0 0 15px rgba(59,130,246,0.15)',
    ],
    transition: {
      repeat: Infinity,
      duration: 3,
      ease: 'easeInOut',
    },
  },
};

// Плавное парение для карточек (hover)
export const cardHoverVariants: Variants = {
  rest: {
    y: 0,
    borderColor: 'rgba(59, 130, 246, 0.12)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
  },
  hover: {
    y: -4,
    borderColor: 'rgba(59, 130, 246, 0.35)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5), 0 0 24px rgba(59, 130, 246, 0.12)',
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
};
