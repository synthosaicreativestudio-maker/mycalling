'use client';

import { useEffect, useState } from 'react';

export function DarkCosmicBackground() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-[#040506]" />;
  }

  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-[#040506] print:hidden">
      {/* Слой 1: Сплошная ультра-темная заливка (Абисс) */}
      <div className="absolute inset-0 bg-[#040506]" />

      {/* Слой 2: Центральный мягкий градиент глубины */}
      <div 
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 50%, #090E16 0%, transparent 80%)',
        }}
      />

      {/* Слой 3: Глубинные космические световые объемы (Холодный синий/Индиго) */}
      {/* Левый верхний угол */}
      <div 
        className="absolute -left-[20%] -top-[20%] w-[80%] h-[80%] rounded-full opacity-[0.06] pointer-events-none blur-[120px]"
        style={{
          background: 'radial-gradient(circle, #1D4ED8 0%, transparent 70%)',
        }}
      />
      {/* Правый нижний угол */}
      <div 
        className="absolute -right-[10%] -bottom-[20%] w-[90%] h-[90%] rounded-full opacity-[0.05] pointer-events-none blur-[140px]"
        style={{
          background: 'radial-gradient(circle, #1E40AF 0%, transparent 70%)',
        }}
      />
      {/* Центр-право */}
      <div 
        className="absolute left-[50%] top-[30%] w-[70%] h-[70%] rounded-full opacity-[0.04] pointer-events-none blur-[130px]"
        style={{
          background: 'radial-gradient(circle, #0F766E 0%, transparent 60%)',
        }}
      />
      {/* Мягкий рассеянный золотисто-синий отблеск (отзвук старой палитры, но приглушенный) */}
      <div 
        className="absolute left-[15%] top-[60%] w-[50%] h-[50%] rounded-full opacity-[0.03] pointer-events-none blur-[100px]"
        style={{
          background: 'radial-gradient(circle, #3B82F6 0%, transparent 70%)',
        }}
      />

      {/* Слой 4: Виньетирование по краям экрана */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 30%, rgba(4, 5, 6, 0.4) 100%)',
        }}
      />

      {/* Слой 5: SVG Noise Overlay (Шум против бандинга градиентов) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-[0.035]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="cosmicNoise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.8" 
            numOctaves="3" 
            stitchTiles="stitch" 
          />
          <feColorMatrix type="monochrome" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cosmicNoise)" />
      </svg>
    </div>
  );
}
