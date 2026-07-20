'use client';

import Link from 'next/link';

interface AnimatedLogoProps {
  showText?: boolean;
  className?: string;
  animate?: boolean;
  layout?: 'horizontal' | 'vertical';
  isHeader?: boolean;
}

export function AnimatedLogo({
  className = '',
}: AnimatedLogoProps) {
  return (
    <Link
      href="/"
      aria-label="МоёПризвание — на главную"
      className={`flex items-center gap-0 w-fit min-h-[44px] select-none no-underline hover:opacity-90 transition ${className}`}
    >
      <span className="text-xl md:text-[22px] font-extrabold tracking-[0.06em] uppercase text-[var(--accent-brown)] font-sans">
        МОЁ
      </span>
      <span className="text-xl md:text-[22px] font-light tracking-[0.06em] uppercase text-white font-sans">
        ПРИЗВАНИЕ
      </span>
    </Link>
  );
}
