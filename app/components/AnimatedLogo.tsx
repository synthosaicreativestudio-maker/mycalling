'use client';

import { motion } from 'framer-motion';

interface AnimatedLogoProps {
  /** true = версия с текстом "МоёПризвание", false = только дерево */
  showText?: boolean;
  className?: string;
  /** Анимировать при монтировании (прелоадер) */
  animate?: boolean;
}

export function AnimatedLogo({
  showText = false,
  className = '',
  animate = true,
}: AnimatedLogoProps) {
  const src = showText
    ? '/assets/logos/logo-with-text.png'
    : '/assets/logos/logo.png';

  if (!animate) {
    return (
      <img
        src={src}
        alt="МоёПризвание"
        className={className}
        style={{ objectFit: 'contain' }}
      />
    );
  }

  return (
    <motion.img
      src={src}
      alt="МоёПризвание"
      className={className}
      style={{ objectFit: 'contain' }}
      initial={{ opacity: 0, scale: 0.85, filter: 'blur(8px) brightness(0.7)' }}
      animate={{ opacity: 1, scale: 1, filter: 'blur(0px) brightness(1)' }}
      transition={{
        duration: 1.6,
        ease: [0.16, 1, 0.3, 1],
        delay: 0.15,
      }}
    />
  );
}
