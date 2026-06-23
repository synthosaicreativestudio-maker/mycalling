'use client';

import { useEffect, useState } from 'react';

export function SpaceBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-50 bg-[#030208]" />;
  }

  return (
    <div className="fixed inset-0 -z-50 h-full w-full overflow-hidden bg-[#030208] print:hidden">
      {/* Статический слой звездного неба для глубины */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen pointer-events-none select-none" 
        style={{ backgroundImage: "url('/assets/backgrounds/space-bg-static.png')" }} 
      />

      {/* Мягкие фоновые неоновые туманности */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_80%,#0c0621_0%,#030208_70%)] opacity-85" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,rgba(76,29,149,0.18)_0%,transparent_50%),radial-gradient(circle_at_85%_25%,rgba(99,102,241,0.08)_0%,transparent_40%)] blur-[50px]" />

      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          {/* Градиент для левого верхнего линзового блика (Lens Flare) */}
          <radialGradient id="auroraGlow" cx="20%" cy="20%" r="70%">
            <stop offset="0%" stop-color="#4c1d95" stop-opacity="0.45" />
            <stop offset="40%" stop-color="#1e1b4b" stop-opacity="0.18" />
            <stop offset="100%" stop-color="#030208" stop-opacity="0" />
          </radialGradient>

          {/* Премиальный градиент для тонких орбит */}
          <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#c084fc" stop-opacity="0.55" />
            <stop offset="50%" stop-color="#818cf8" stop-opacity="0.35" />
            <stop offset="100%" stop-color="#c084fc" stop-opacity="0.05" />
          </linearGradient>

          {/* Градиент для пересекающего светового луча */}
          <linearGradient id="rayGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#818cf8" stop-opacity="0" />
            <stop offset="50%" stop-color="#a78bfa" stop-opacity="0.5" />
            <stop offset="55%" stop-color="#ffffff" stop-opacity="0.95" />
            <stop offset="60%" stop-color="#c084fc" stop-opacity="0.5" />
            <stop offset="100%" stop-color="#818cf8" stop-opacity="0" />
          </linearGradient>

          {/* Фильтры свечения для звезд и вспышек */}
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

        {/* Большой линзовый блик в верхнем левом углу */}
        <circle cx="150" cy="150" r="650" fill="url(#auroraGlow)">
          <animate 
            attributeName="opacity" 
            values="0.45; 0.6; 0.45" 
            dur="12s" 
            repeatCount="indefinite" />
        </circle>

        {/* Фоновые случайные звезды */}
        <g opacity="0.25">
          <circle cx="280" cy="180" r="1" fill="#fff" />
          <circle cx="790" cy="130" r="1.2" fill="#a78bfa" />
          <circle cx="480" cy="380" r="1" fill="#fff" />
          <circle cx="180" cy="580" r="1.5" fill="#818cf8" />
          <circle cx="620" cy="720" r="1" fill="#fff" />
          <circle cx="980" cy="220" r="1.2" fill="#fff" />
        </g>

        {/* Группа орбит, центрированная по Hero-блоку (стиль ChatGPT) */}
        <g stroke="url(#orbitGrad)" fill="none">
          <ellipse cx="1120" cy="420" rx="260" ry="110" stroke-width="1.0" transform="rotate(-30 1120 420)" />
          
          <ellipse cx="1120" cy="420" rx="390" ry="165" stroke-width="1.0" stroke-dasharray="4 8" transform="rotate(-30 1120 420)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 1120 420"
              to="360 1120 420"
              dur="120s"
              repeatCount="indefinite"
            />
          </ellipse>

          <ellipse cx="1120" cy="420" rx="520" ry="220" stroke-width="1.0" transform="rotate(-30 1120 420)" />

          <ellipse cx="1120" cy="420" rx="680" ry="285" stroke-width="0.8" stroke-dasharray="3 6" transform="rotate(-30 1120 420)">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="360 1120 420"
              to="0 1120 420"
              dur="180s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* Пересекающий световой луч */}
        <line x1="620" y1="710" x2="1620" y2="130" stroke="url(#rayGrad)" stroke-width="1.0" opacity="0.45" />

        {/* Пульсирующая фиолетово-белая вспышка на стыке одной из орбит */}
        <g transform="translate(1220, 340)">
          {/* Внешний мягкий пульсирующий нимб */}
          <circle cx="0" cy="0" r="30" fill="#a78bfa" opacity="0.15" filter="url(#starGlow)">
            <animate attributeName="r" values="24; 36; 24" dur="5s" repeatCount="indefinite" />
          </circle>
          {/* Среднее свечение */}
          <circle cx="0" cy="0" r="10" fill="#c084fc" opacity="0.45" filter="url(#starGlow)" />
          {/* Яркое ядро вспышки */}
          <circle cx="0" cy="0" r="2.5" fill="#ffffff" filter="url(#pointGlow)" />

          {/* Тонкие крестообразные лучи звезды */}
          <line x1="-12" y1="0" x2="12" y2="0" stroke="#ffffff" stroke-width="0.75" opacity="0.8">
            <animate attributeName="opacity" values="0.5; 0.9; 0.5" dur="3.5s" repeatCount="indefinite" />
          </line>
          <line x1="0" y1="-12" x2="0" y2="12" stroke="#ffffff" stroke-width="0.75" opacity="0.8">
            <animate attributeName="opacity" values="0.5; 0.9; 0.5" dur="3.5s" repeatCount="indefinite" />
          </line>
        </g>
      </svg>
    </div>
  );
}
