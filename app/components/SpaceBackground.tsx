'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#06060e]" />;
  }

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#06060e] print:hidden">
      {/* Статический слой звездного неба */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-screen pointer-events-none select-none" 
        style={{ backgroundImage: "url('/assets/backgrounds/space-bg-static.png')" }} 
      />

      {/* Мягкие фоновые туманности */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#0c0418_0%,#06060e_70%)] opacity-85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(76,29,149,0.12)_0%,transparent_50%),radial-gradient(circle_at_85%_25%,rgba(139,127,247,0.06)_0%,transparent_40%)] blur-[50px]" />
      {/* Тёплое золотое свечение снизу */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_100%,rgba(212,168,83,0.04)_0%,transparent_50%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Градиент для линзового блика */}
          <radialGradient id="auroraGlow" cx="20%" cy="20%" r="70%">
            <stop offset="0%" stopColor="#4c1d95" stopOpacity="0.35" />
            <stop offset="40%" stopColor="#1e1b4b" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#06060e" stopOpacity="0" />
          </radialGradient>

          {/* Фильтры свечения */}
          <filter id="pointGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          <filter id="starGlow" x="-150%" y="-150%" width="400%" height="400%">
            <feGaussianBlur stdDeviation="8" result="blur1" />
            <feGaussianBlur stdDeviation="2.5" result="blur2" />
            <feMerge>
              <feMergeNode in="blur1" />
              <feMergeNode in="blur2" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Линзовый блик */}
        <circle cx="150" cy="150" r="650" fill="url(#auroraGlow)">
          <animate 
            attributeName="opacity" 
            values="0.4; 0.55; 0.4" 
            dur="14s" 
            repeatCount="indefinite" />
        </circle>

        {/* Фоновые звезды */}
        <g opacity="0.2">
          <circle cx="280" cy="180" r="1" fill="#fff" />
          <circle cx="790" cy="130" r="1.2" fill="#a89bfa" />
          <circle cx="480" cy="380" r="1" fill="#fff" />
          <circle cx="180" cy="580" r="1.5" fill="#8b7ff7" />
          <circle cx="620" cy="720" r="1" fill="#fff" />
          <circle cx="980" cy="220" r="1.2" fill="#fff" />
          <circle cx="1100" cy="600" r="0.8" fill="#d4a853" />
          <circle cx="350" cy="750" r="1" fill="#e8c97a" />
          <circle cx="1300" cy="400" r="0.9" fill="#fff" />
        </g>

        {/* Пульсирующая звезда-вспышка */}
        <g transform="translate(1220, 340)">
          <circle cx="0" cy="0" r="30" fill="#a89bfa" opacity="0.1" filter="url(#starGlow)">
            <animate attributeName="r" values="24; 36; 24" dur="6s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="10" fill="#8b7ff7" opacity="0.3" filter="url(#starGlow)" />
          <circle cx="0" cy="0" r="2" fill="#ffffff" filter="url(#pointGlow)" />
          <line x1="-10" y1="0" x2="10" y2="0" stroke="#ffffff" strokeWidth="0.6" opacity="0.6">
            <animate attributeName="opacity" values="0.4; 0.8; 0.4" dur="4s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="-10" x2="0" y2="10" stroke="#ffffff" strokeWidth="0.6" opacity="0.6">
            <animate attributeName="opacity" values="0.4; 0.8; 0.4" dur="4s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    </div>
  );
}
