'use client';

import type { CSSProperties } from 'react';
import { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useUIStore } from '../store/uiStore';
import { AnimatedLogoText } from './AnimatedLogoText';

type IntroAsset = {
  id: string;
  src: string;
  style: CSSProperties;
  delay: number;
  layer?: 'core' | 'outer';
};

const introLeaves: IntroAsset[] = [
  { id: 'leaf-1', src: '/assets/tree/webp/leaf_1.webp', style: { left: '32.03%', top: '48.14%', width: '7.52%' }, delay: 0.08 },
  { id: 'leaf-2', src: '/assets/tree/webp/leaf_2.webp', style: { left: '38.09%', top: '38.09%', width: '6.35%' }, delay: 0.28 },
  { id: 'leaf-3', src: '/assets/tree/webp/leaf_3.webp', style: { left: '38.48%', top: '28.71%', width: '3.91%' }, delay: 0.16 },
  { id: 'leaf-4', src: '/assets/tree/webp/leaf_4.webp', style: { left: '42.00%', top: '55.37%', width: '7.32%' }, delay: 0.38 },
  { id: 'leaf-5', src: '/assets/tree/webp/leaf_5.webp', style: { left: '47.85%', top: '29.20%', width: '5.18%' }, delay: 0.04 },
  { id: 'leaf-6', src: '/assets/tree/webp/leaf_6.webp', style: { left: '55.47%', top: '37.89%', width: '7.62%' }, delay: 0.22 },
  { id: 'leaf-7', src: '/assets/tree/webp/leaf_7.webp', style: { left: '60.35%', top: '47.85%', width: '7.91%' }, delay: 0.44 },
  { id: 'leaf-8', src: '/assets/tree/webp/leaf_8.webp', style: { left: '60.94%', top: '29.39%', width: '4.30%' }, delay: 0.12 },
];

const introProfessions: IntroAsset[] = [
  { id: 'medicine', src: '/assets/tree/webp/icon_medicine.webp', layer: 'core', style: { left: '23.2%', top: '18.6%', width: '11.2%' }, delay: 0.28 },
  { id: 'engineering', src: '/assets/tree/webp/icon_engineering.webp', layer: 'core', style: { left: '38.2%', top: '10.8%', width: '11.4%' }, delay: 0.08 },
  { id: 'business', src: '/assets/tree/webp/icon_business.webp', layer: 'core', style: { left: '55.5%', top: '12.4%', width: '12.2%' }, delay: 0.20 },
  { id: 'science', src: '/assets/tree/webp/icon_science.webp', layer: 'core', style: { left: '67.8%', top: '24.2%', width: '11.2%' }, delay: 0.14 },
  { id: 'technology', src: '/assets/tree/webp/icon_technology.webp', layer: 'core', style: { left: '16.7%', top: '35.2%', width: '11.2%' }, delay: 0.34 },
  { id: 'creativity', src: '/assets/tree/webp/icon_creativity.webp', layer: 'core', style: { left: '70.2%', top: '38.4%', width: '11.6%' }, delay: 0.02 },
  { id: 'education', src: '/assets/tree/webp/icon_education.webp', layer: 'outer', style: { left: '34.8%', top: '0.8%', width: '10.0%' }, delay: 0.38 },
  { id: 'law', src: '/assets/tree/webp/icon_law.webp', layer: 'outer', style: { left: '57.8%', top: '1.8%', width: '10.2%' }, delay: 0.18 },
  { id: 'ecology', src: '/assets/tree/webp/icon_ecology.webp', layer: 'outer', style: { left: '77.0%', top: '27.0%', width: '9.6%' }, delay: 0.44 },
  { id: 'urban', src: '/assets/tree/webp/icon_urban.webp', layer: 'outer', style: { left: '10.0%', top: '22.8%', width: '10.3%' }, delay: 0.10 },
];

const INTRO_SEEN_KEY = 'mp-intro-seen';

export function IntroPreloader() {
  const { introState, setIntroState } = useUIStore();
  const [mounted, setMounted] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  const skipIntro = useCallback(() => {
    setIntroState('transition');
    setTimeout(() => {
      setIntroState('completed');
      if (typeof window !== 'undefined') {
        localStorage.setItem(INTRO_SEEN_KEY, '1');
      }
    }, 600);
  }, [setIntroState]);

  useEffect(() => {
    setMounted(true);

    // Пропускаем интро на повторном визите (временно отключено для тестирования)
    // if (typeof window !== 'undefined' && localStorage.getItem(INTRO_SEEN_KEY)) {
    //   setShouldShow(false);
    //   setIntroState('completed');
    //   return;
    // }

    setIntroState('moon');

    const timers = [
      setTimeout(() => setIntroState('tree'), 400),
      setTimeout(() => setIntroState('leaves'), 800),
      setTimeout(() => setIntroState('logo'), 1200),
      setTimeout(() => setIntroState('transition'), 1800),
      setTimeout(() => {
        setIntroState('completed');
        if (typeof window !== 'undefined') {
          localStorage.setItem(INTRO_SEEN_KEY, '1');
        }
      }, 2400),
    ];

    return () => timers.forEach(clearTimeout);
  }, [setIntroState]);

  const showTree = ['tree', 'leaves', 'professions', 'logo', 'transition'].includes(introState);
  const showLeaves = ['leaves', 'professions', 'logo', 'transition'].includes(introState);
  const showProfessions = ['professions', 'logo', 'transition'].includes(introState);
  const showLogo = introState === 'logo' || introState === 'transition';
  const isTransition = introState === 'transition';

  const logoTarget = {
    x: typeof window === 'undefined' ? 0 : -Math.max(300, window.innerWidth / 2 - 180),
    y: typeof window === 'undefined' ? 0 : -Math.max(230, window.innerHeight / 2 - 70),
    scale: 0.24,
  };

  if (!mounted || !shouldShow || introState === 'completed') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute inset-0 z-[3] bg-[#f7faf8] bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.96)_0%,rgba(250,252,250,0.82)_34%,rgba(232,241,246,0.38)_100%)] pointer-events-auto" />

        {/* Кнопка пропуска */}
        <motion.button
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          onClick={skipIntro}
          className="absolute top-6 right-6 z-[10000] px-5 py-2.5 rounded-full text-sm font-semibold text-[#253243] bg-white border border-[#e2e8f0] shadow-sm backdrop-blur-sm hover:bg-gray-50 hover:shadow-md transition-all pointer-events-auto active:scale-95"
        >
          Пропустить заставку
        </motion.button>



        <AnimatePresence>
          {showLogo && (
            <motion.div
              layoutId="logo-text-container"
              className="absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={isTransition ? { opacity: 0, ...logoTarget } : { opacity: 1, scale: 1, x: 0, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isTransition ? 0.6 : 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <AnimatedLogoText animate className="h-[76px] w-auto max-w-[82vw] md:h-[104px]" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  );
}
