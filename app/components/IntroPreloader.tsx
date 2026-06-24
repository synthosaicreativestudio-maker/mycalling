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

    // Пропускаем интро на повторном визите
    if (typeof window !== 'undefined' && localStorage.getItem(INTRO_SEEN_KEY)) {
      setShouldShow(false);
      setIntroState('completed');
      return;
    }

    setIntroState('moon');

    // Сокращённые тайминги: ~3 секунды вместо 7
    const timers = [
      setTimeout(() => setIntroState('tree'), 400),
      setTimeout(() => setIntroState('leaves'), 1200),
      setTimeout(() => setIntroState('professions'), 1800),
      setTimeout(() => setIntroState('logo'), 2400),
      setTimeout(() => setIntroState('transition'), 3000),
      setTimeout(() => {
        setIntroState('completed');
        localStorage.setItem(INTRO_SEEN_KEY, '1');
      }, 3600),
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
        className="fixed inset-0 z-[9999] overflow-hidden bg-[#f7faf8]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_36%,rgba(255,255,255,0.96)_0%,rgba(250,252,250,0.82)_34%,rgba(232,241,246,0.38)_100%)]" />

        {/* Кнопка пропуска */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          transition={{ delay: 0.8, duration: 0.4 }}
          onClick={skipIntro}
          className="absolute top-6 right-6 z-[10000] px-4 py-2 rounded-full text-xs font-medium text-[#566679] bg-white/60 border border-sky/20 backdrop-blur-sm hover:bg-white/80 hover:text-[#253243] transition-all"
        >
          Пропустить
        </motion.button>

        <svg
          viewBox="0 0 1000 260"
          className="absolute left-1/2 w-[min(74vw,760px)] -translate-x-1/2 pointer-events-none"
          style={{ bottom: '18%' }}
          aria-hidden="true"
        >
          <AnimatePresence>
            {!isTransition && (
              <motion.path
                d="M 82 176 Q 500 112 918 176"
                fill="none"
                stroke="rgba(155, 187, 207, 0.76)"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ opacity: 0, pathLength: 0.84 }}
                transition={{ duration: 0.8, ease: 'easeInOut' }}
              />
            )}
          </AnimatePresence>
        </svg>

        <motion.div
          className="absolute left-1/2 top-[14%] aspect-square w-[min(72vw,640px)] -translate-x-1/2 -translate-y-1/2"
          animate={isTransition ? { opacity: 0.18, scale: 0.92 } : { opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        >
          {showTree && (
            <motion.img
              src="/assets/tree/webp/tree_skeleton.webp"
              alt=""
              aria-hidden="true"
              className="absolute inset-0 z-10 h-full w-full object-contain"
              initial={{ clipPath: 'inset(100% 0 0 0)', opacity: 0.94 }}
              animate={{ clipPath: 'inset(0% 0 0 0)', opacity: 0.94 }}
              transition={{ duration: 1.0, ease: [0.65, 0, 0.35, 1] }}
            />
          )}

          {showLeaves &&
            introLeaves.map((leaf) => (
              <motion.img
                key={leaf.id}
                src={leaf.src}
                alt=""
                aria-hidden="true"
                className="absolute z-20"
                style={leaf.style}
                initial={{ opacity: 0, scale: 0.2, rotate: -4 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  rotate: [0, 1.4, 0, -1.2, 0],
                  y: [0, -2.4, 0, -1.1, 0],
                  x: [0, 0.8, 0, -0.6, 0],
                }}
                transition={{
                  opacity: { duration: 0.32, delay: leaf.delay, ease: 'easeOut' },
                  scale: { duration: 0.32, delay: leaf.delay, ease: 'easeOut' },
                  rotate: { duration: 7.2, repeat: Infinity, ease: 'easeInOut' },
                  y: { duration: 8.4, repeat: Infinity, ease: 'easeInOut' },
                  x: { duration: 9.1, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            ))}

          {showProfessions &&
            introProfessions.map((icon) => (
              <motion.img
                key={icon.id}
                src={icon.src}
                alt=""
                aria-hidden="true"
                className="absolute z-30 object-contain"
                style={icon.style}
                initial={{ opacity: 0, scale: 0.58, y: 8 }}
                animate={{
                  opacity: icon.layer === 'outer' ? 0.82 : 0.98,
                  scale: icon.layer === 'outer' ? 0.94 : 1,
                  y: [0, -2.2, 0, 1.2, 0],
                  rotate: [0, 0.85, 0, -0.7, 0],
                }}
                transition={{
                  opacity: { duration: 0.36, delay: icon.delay, ease: [0.16, 1, 0.3, 1] },
                  scale: { duration: 0.36, delay: icon.delay, ease: [0.16, 1, 0.3, 1] },
                  y: { duration: 8 + icon.delay * 2, repeat: Infinity, ease: 'easeInOut' },
                  rotate: { duration: 9 + icon.delay * 1.4, repeat: Infinity, ease: 'easeInOut' },
                }}
              />
            ))}
        </motion.div>

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
