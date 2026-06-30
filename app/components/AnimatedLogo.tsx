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
      className={`flex items-center gap-0 w-fit select-none no-underline hover:opacity-90 transition ${className}`}
    >
      <span className="text-xl md:text-[22px] font-extrabold tracking-[0.06em] uppercase text-[#8c6e4b] font-sans">
        МОЁ
      </span>
      <span className="text-xl md:text-[22px] font-light tracking-[0.06em] uppercase text-[#3d3123] font-sans">
        ПРИЗВАНИЕ
      </span>
    </Link>
  );
}
