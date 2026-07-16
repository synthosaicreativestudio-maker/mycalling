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
      {/* Слой светлой темы: теплый градиент латте с мягкими размытыми кругами */}
      <div className="absolute inset-0 pointer-events-none transition-opacity duration-500 opacity-0 theme-light-only bg-gradient-to-tr from-[#F5EFEB] via-[#FDFBF7] to-[#EADCD3]">
        {/* Нежные размытые кофейные пятна */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8D5B4C]/5 blur-[80px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#A67C52]/5 blur-[100px]" />
      </div>

      {/* Слой 1: Фоновое видео высокой четкости (светлая тема) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-90 select-none pointer-events-none theme-light-only"
      >
        <source src="/assets/videos/background-video-light.mp4" type="video/mp4" />
      </video>

      {/* Слой 1: Фоновое видео высокой четкости (темная тема) */}
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 w-full h-full object-cover opacity-100 select-none pointer-events-none theme-dark-only"
      >
        <source src="/assets/videos/background-video.mp4" type="video/mp4" />
      </video>

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
