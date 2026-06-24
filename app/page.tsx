'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useUIStore } from './store/uiStore';
import { InteractiveTree } from './components/InteractiveTree';
import { AnimatedLogo } from './components/AnimatedLogo';

/* ═══════════════════════════════════════════════════
   Премиальные геометрические SVG-иконки для УТП
   ═══════════════════════════════════════════════════ */

function IconTimer() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(188,161,95,0.12)]">
      <defs>
        <linearGradient id="timerGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#d7bd79" />
          <stop offset="100%" stopColor="#9bbbcf" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="24" r="18" stroke="url(#timerGrad)" strokeWidth="1" strokeDasharray="4 2" />
      <circle cx="24" cy="24" r="14" stroke="url(#timerGrad)" strokeWidth="1.5" />
      <line x1="24" y1="10" x2="24" y2="38" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="24" y1="24" x2="24" y2="15" stroke="#8aaec4" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="20" stroke="#c6a766" strokeWidth="1" strokeLinecap="round" />
      <circle cx="24" cy="24" r="2.5" fill="#d7bd79" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

function IconScience() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(120,154,175,0.14)]">
      <defs>
        <linearGradient id="sciGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#b7d2df" />
          <stop offset="100%" stopColor="#6f97ad" />
        </linearGradient>
      </defs>
      <circle cx="24" cy="18" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="17" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="31" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="24" cy="26" r="3" fill="#b7d2df" opacity="0.32" />
      <circle cx="24" cy="26" r="1" fill="#6f97ad" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(188,161,95,0.12)]">
      <defs>
        <linearGradient id="repGrad" x1="12" y1="12" x2="36" y2="36">
          <stop offset="0%" stopColor="#d7bd79" />
          <stop offset="50%" stopColor="#9bbbcf" />
          <stop offset="100%" stopColor="#6f97ad" />
        </linearGradient>
      </defs>
      <path d="M24 8L38 18V32L24 42L10 32V18L24 8Z" stroke="url(#repGrad)" strokeWidth="1.2" strokeDasharray="3 2" />
      <line x1="24" y1="8" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="24" y1="42" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <circle cx="24" cy="8" r="2" fill="#d7bd79" />
      <circle cx="38" cy="18" r="2" fill="#c6a766" />
      <circle cx="38" cy="32" r="2" fill="#9bbbcf" />
      <circle cx="24" cy="42" r="2" fill="#6f97ad" />
      <circle cx="10" cy="32" r="2" fill="#9bbbcf" />
      <circle cx="10" cy="18" r="2" fill="#c6a766" />
      <circle cx="24" cy="24" r="3" fill="#ffffff" stroke="#6f97ad" strokeWidth="1" />
    </svg>
  );
}

const howItWorks = [
  { step: '01', title: 'Регистрация', text: 'Быстрый старт без анкет' },
  { step: '02', title: 'Диагностика', text: '25 минут интерактивной игры' },
  { step: '03', title: 'Анализ ответов', text: 'Алгоритм сопоставляет результаты' },
  { step: '04', title: 'Отчёт', text: 'Профессии, предметы и план действий' },
];

export default function HomePage() {
  const { introState } = useUIStore();
  const [mounted, setMounted] = useState(false);
  
  // Отслеживание скролла для параллакс-эффекта дерева
  const { scrollY } = useScroll();
  const treeScale = useTransform(scrollY, [0, 600], [1.0, 0.85]);
  const treeOpacity = useTransform(scrollY, [0, 600], [1.0, 0.35]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTransitionStarted = introState === 'transition' || introState === 'completed';
  const showHeroContent = introState === 'completed';

  return (
    <main className="relative z-10 w-full overflow-hidden">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-5 md:px-8 pt-32 pb-20">
        
        {/* Слой дерева: между фоном и содержанием */}
        {mounted && isTransitionStarted && (
          <motion.div 
            style={{ 
              scale: treeScale, 
              opacity: treeOpacity,
              zIndex: 6 
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute left-1/2 top-[14%] -translate-x-1/2 -translate-y-1/2 w-[min(72vw,640px)] pointer-events-auto"
          >
            <InteractiveTree />
          </motion.div>
        )}

        <div className="absolute inset-x-0 top-20 z-[9] mx-auto h-[54vh] max-w-6xl bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_38%,rgba(255,255,255,0)_76%)] pointer-events-none" />

        {/* Слой контента: чистая типографика поверх светлой области */}
        {mounted && showHeroContent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center text-center pointer-events-auto"
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.42 }}
              className="mb-5 text-xs font-bold uppercase tracking-[0.22em] text-[#8aaec4] font-sans"
            >
              Диагностика талантов для школьников
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.52 }}
              className="max-w-4xl text-4xl leading-[1.08] font-extrabold text-[#253243] font-sans sm:text-5xl lg:text-7xl"
            >
              Поможем школьнику найти своё призвание
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.66 }}
              className="mt-7 max-w-2xl text-lg sm:text-2xl leading-relaxed text-[#566679] font-normal font-sans"
            >
              Раскройте сильные стороны ребёнка через 25 минут интерактивной диагностики и получите понятный план развития для всей семьи.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.82 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row"
            >
              <Link href="/auth" className="cta-glass h-[62px] min-w-[250px] px-8 text-base sm:text-lg">
                Пройти диагностику
                <ArrowRight className="h-5 w-5" />
              </Link>
              <span className="text-sm font-semibold text-[#6b7888]">Без длинных анкет и скучных тестов</span>
            </motion.div>
          </motion.div>
        )}

        {/* Scroll indicator */}
        {showHeroContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            transition={{ delay: 2.2, duration: 1 }}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
          >
            <div className="w-5 h-8 rounded-full border border-[#1a2536]/20 flex justify-center pt-1.5">
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
                className="w-1 h-1.5 rounded-full bg-[#9bbbcf]"
              />
            </div>
          </motion.div>
        )}
      </section>
 
      {/* ─── УТП (3 карточки) ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-white/35 backdrop-blur-md">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-6 sm:grid-cols-3"
          >
            <UspCard
              icon={<IconTimer />}
              title="25 минут"
              text="Вся диагностика — без длинных анкет и скучных вопросов"
            />
            <UspCard
              icon={<IconScience />}
              title="3 научных метода"
              text="RIASEC, Big Five и Гарднер — проверенные мировые методики"
            />
            <UspCard
              icon={<IconReport />}
              title="Понятный отчёт"
              text="Профессии, предметы и шаги — ясно ребёнку и родителю"
            />
          </motion.div>
        </div>
      </section>

      {/* ─── КАК ЭТО РАБОТАЕТ ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 relative z-10 bg-[#f7faf8]/55">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Как это работает
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Четыре шага к результату
              </h2>
            </div>

            <motion.div 
              className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.15,
                  }
                }
              }}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
            >
              {howItWorks.map((item) => (
                <motion.div
                  key={item.step}
                  variants={{
                    hidden: { opacity: 0, y: 40, scale: 0.95 },
                    show: { 
                      opacity: 1, 
                      y: 0, 
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 100,
                        damping: 15
                      }
                    }
                  }}
                  className="glass-card rounded-[22px] p-6 text-center space-y-4 hover:border-[#9bbbcf]/40 hover:shadow-[0_16px_36px_rgba(88,116,138,0.08)] transition-all duration-300"
                >
                  <div className="text-3xl font-extrabold text-[#c6a766]/38 font-sans">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-bold text-[#253243] font-sans">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#5e6b7e] leading-relaxed font-sans">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            <div className="text-center pt-4">
              <Link href="/auth" className="cta-glass h-[60px] min-w-[240px] px-8 text-base">
                Начать бесплатно
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#253243]/5 bg-[#f7faf8]/85 relative z-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <AnimatedLogo
                showText={true}
                animate={false}
                className="h-8 w-auto opacity-60"
              />
              <span className="text-xs text-[#5e6b7e] font-sans">
                © {new Date().getFullYear()} МоёПризвание
              </span>
            </div>
            
            <nav className="flex items-center gap-6 text-xs text-[#5e6b7e] font-sans">
              <Link href="/privacy">
                <span className="hover:text-[#1a2536] transition cursor-pointer">Политика конфиденциальности</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-[#1a2536] transition cursor-pointer">Пользовательское соглашение</span>
              </Link>
              <a href="mailto:hello@synthosai.ru" className="hover:text-[#1a2536] transition">
                Контакты
              </a>
            </nav>
          </div>
        </div>
      </footer>

    </main>
  );
}

function UspCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-8 text-center space-y-5 group border border-white/60 bg-white/40">
      <div className="flex justify-center transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#253243] font-sans">{title}</h3>
      <p className="text-sm text-[#5e6b7e] leading-relaxed font-sans">{text}</p>
    </div>
  );
}
