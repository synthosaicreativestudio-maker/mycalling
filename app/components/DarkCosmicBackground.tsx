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
      {/* Слой 1: Фоновое видео высокой четкости */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-90 select-none pointer-events-none"
      >
        <source src="/assets/videos/background-video.mp4" type="video/mp4" />
      </video>

      {/* Слой 2: Полупрозрачное затемнение для читаемости контента */}
      <div className="absolute inset-0 bg-[#040506]/40 pointer-events-none" />

      {/* Слой 3: Виньетирование по краям экрана */}
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 40%, rgba(4, 5, 6, 0.6) 100%)',
        }}
      />

      {/* Слой 4: SVG Noise Overlay (Шум против бандинга) */}
      <svg 
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-overlay opacity-[0.03]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <filter id="cosmicNoise">
          <feTurbulence 
            type="fractalNoise" 
            baseFrequency="0.85" 
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
