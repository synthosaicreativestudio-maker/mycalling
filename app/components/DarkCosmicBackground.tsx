'use client';

import { useEffect, useState } from 'react';

const MOBILE_QUERY = '(max-width: 768px)';
const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

/**
 * Раньше рендерились ОБА <video autoPlay preload="auto"> (light+dark, 26+34
 * МБ) одновременно, видимость переключалась только CSS (display:none),
 * которое не мешает браузеру их скачивать/декодировать — источник Speed
 * Index 8.9s на мобильном (см. docs/18 P1.2). Теперь: (1) рендерится только
 * видео активной темы, (2) на мобильных и при prefers-reduced-motion видео
 * не рендерится вовсе — только статический градиент.
 */
export function DarkCosmicBackground() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [showVideo, setShowVideo] = useState(true);

  useEffect(() => {
    setMounted(true);

    const readTheme = () =>
      setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
    readTheme();

    const observer = new MutationObserver(readTheme);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const reducedMotionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const updateShowVideo = () => setShowVideo(!mobileQuery.matches && !reducedMotionQuery.matches);
    updateShowVideo();
    mobileQuery.addEventListener('change', updateShowVideo);
    reducedMotionQuery.addEventListener('change', updateShowVideo);

    return () => {
      observer.disconnect();
      mobileQuery.removeEventListener('change', updateShowVideo);
      reducedMotionQuery.removeEventListener('change', updateShowVideo);
    };
  }, []);

  if (!mounted) {
    return <div className="fixed inset-0 -z-10 bg-[#040506]" />;
  }

  return (
    <div className="fixed inset-0 -z-10 h-full w-full overflow-hidden bg-[#040506] print:hidden">
      {theme === 'light' ? (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#F5EFEB] via-[#FDFBF7] to-[#EADCD3]">
          {/* Нежные размытые кофейные пятна */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#8D5B4C]/5 blur-[80px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#A67C52]/5 blur-[100px]" />
        </div>
      ) : (
        <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-[#040506] via-[#0A0F1C] to-[#0D1420]">
          {/* Размытые синие пятна — статичный аналог видео-фона для мобильных/reduced-motion */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--accent-wash-10)] blur-[100px]" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-[#8D5B4C]/10 blur-[120px]" />
        </div>
      )}

      {showVideo && (
        <video
          key={theme}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        >
          <source
            src={theme === 'light' ? '/assets/videos/background-video-light.mp4' : '/assets/videos/background-video.mp4'}
            type="video/mp4"
          />
        </video>
      )}

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
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#cosmicNoise)" />
      </svg>
    </div>
  );
}
