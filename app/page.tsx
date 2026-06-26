'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Users, HelpCircle, Shield, BookOpen, Clock, Brain, FileCheck } from 'lucide-react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
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
  { step: '01', title: 'Регистрация', text: 'Быстрый старт без анкет', icon: Users },
  { step: '02', title: 'Диагностика', text: '25 минут интерактивной игры', icon: Brain },
  { step: '03', title: 'Анализ ответов', text: 'Алгоритм сопоставляет результаты', icon: BookOpen },
  { step: '04', title: 'Отчёт', text: 'Профессии, предметы и план действий', icon: FileCheck },
];

const faqItems = [
  {
    q: 'Для кого подходит диагностика?',
    a: 'Для школьников 8–11 классов (13–18 лет), которые хотят разобраться в своих сильных сторонах и выбрать направление развития.',
  },
  {
    q: 'Насколько точны результаты?',
    a: 'Диагностика основана на трёх научных методиках мирового уровня: RIASEC, Big Five и теория множественного интеллекта Гарднера. Результаты носят рекомендательный характер.',
  },
  {
    q: 'Сколько времени занимает прохождение?',
    a: 'Полная диагностика занимает около 25 минут. Это интерактивный формат — не скучные тесты, а вовлекающие вопросы.',
  },
  {
    q: 'Что получит ребёнок после прохождения?',
    a: 'Подробный отчёт с профилем личности, списком подходящих профессий, рекомендациями по предметам и конкретным планом действий.',
  },
  {
    q: 'Безопасны ли данные ребёнка?',
    a: 'Да. Мы собираем минимум информации, не передаём её третьим лицам и используем исключительно для формирования отчёта.',
  },
];

const uspItems = [
  {
    icon: <IconTimer />,
    title: '25 минут',
    text: 'Вся диагностика — без длинных анкет и скучных вопросов',
  },
  {
    icon: <IconScience />,
    title: '3 научных метода',
    text: 'RIASEC, Big Five и Гарднер — проверенные мировые методики',
  },
  {
    icon: <IconReport />,
    title: 'Понятный отчёт',
    text: 'Профессии, предметы и шаги — ясно ребёнку и родителю',
  },
];

export default function HomePage() {
  const { introState } = useUIStore();
  const [mounted, setMounted] = useState(false);
  
  const { scrollY } = useScroll();
  const treeScale = useTransform(scrollY, [0, 450], [1.0, 0.92]);
  const treeOpacity = useTransform(scrollY, [0, 400], [1.0, 0]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isTransitionStarted = introState === 'transition' || introState === 'completed';
  const showHeroContent = introState === 'completed';

  return (
    <main className="relative z-10 w-full overflow-hidden">
      
      {/* Предзагрузка скелета дерева для плавной анимации роста */}
      {mounted && (
        <img
          src="/assets/tree/webp/tree_skeleton.webp"
          alt=""
          style={{ display: 'none' }}
          aria-hidden="true"
        />
      )}
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-5 md:px-8 pt-32 pb-20">
        
        {mounted && isTransitionStarted && (
          <motion.div
            style={{ opacity: treeOpacity, zIndex: 4 }}
            initial={{ opacity: 0, y: '-50%' }}
            animate={{ opacity: 1, y: '-50%' }}
            transition={{ duration: 1.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="pointer-events-none fixed inset-x-0 top-20 mx-auto hidden h-[54vh] max-w-6xl lg:block"
          >
            <div className="h-full w-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.96)_0%,rgba(255,255,255,0.82)_38%,rgba(255,255,255,0)_76%)]" />
          </motion.div>
        )}

        {mounted && (
          <motion.div
            layout
            style={{
              scale: treeScale,
              opacity: treeOpacity,
              zIndex: 5,
              width: (introState === 'completed' || introState === 'transition')
                ? undefined
                : 'min(92vw, 92vh, 1280px)',
              height: (introState === 'completed' || introState === 'transition')
                ? undefined
                : 'min(92vw, 92vh, 1280px)'
            }}
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className={
              (introState === 'completed' || introState === 'transition')
                ? 'pointer-events-auto absolute left-1/2 top-[14%] w-[min(61vw,540px)] -translate-x-1/2 m-0 lg:fixed lg:left-auto lg:right-[3vw] lg:top-1/2 lg:-translate-y-1/2 lg:w-[min(44vw,540px)] lg:translate-x-0 lg:m-0 z-[5]'
                : 'pointer-events-auto fixed inset-0 m-auto aspect-square z-[5]'
            }
          >
            {/* Дуга земли, привязанная к нижнему краю контейнера дерева */}
            <AnimatePresence>
              {!(introState === 'completed' || introState === 'transition') && (
                <svg
                  viewBox="0 0 1000 260"
                  className="absolute left-1/2 bottom-0 w-[min(72vw,72vh,640px)] -translate-x-1/2 translate-y-[38%] z-[6] pointer-events-none"
                  aria-hidden="true"
                >
                  <defs>
                    <mask id="lineMask">
                      <motion.path
                        d="M 82 176 Q 500 112 918 176"
                        fill="none"
                        stroke="white"
                        strokeWidth="28"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.0, ease: 'easeInOut' }}
                      />
                    </mask>
                  </defs>
                  <motion.path
                    d="M 82 176 Q 500 112 918 176 Q 500 126 82 176 Z"
                    fill="rgba(155, 187, 207, 0.76)"
                    mask="url(#lineMask)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  />
                </svg>
              )}
            </AnimatePresence>

            {introState !== 'moon' && <InteractiveTree />}
          </motion.div>
        )}

        {mounted && showHeroContent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.0, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
            className="relative z-10 flex w-full max-w-[90%] flex-col items-start text-left pointer-events-auto pl-[5%] pr-6 md:max-w-[55vw] md:pr-10 lg:pr-0"
          >
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.72, delay: 0.42 }}
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#8aaec4] font-sans"
            >
              Диагностика талантов для школьников
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.52 }}
              className="w-full text-[2rem] leading-[1.08] font-extrabold text-[#253243] font-sans sm:text-[2.35rem] md:text-[2.85rem] lg:text-[2.25rem] lg:leading-[1.1] lg:whitespace-nowrap"
            >
              Поможем школьнику найти своё призвание
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.66 }}
              className="mt-6 max-w-[640px] text-[0.98rem] sm:text-[1.08rem] md:text-[1.28rem] leading-relaxed text-[#566679] font-normal font-sans"
            >
              Раскройте сильные стороны ребёнка через 25 минут интерактивной диагностики и получите понятный план развития для всей семьи.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.82, delay: 0.82 }}
              className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <Link href="/auth" className="cta-glass h-[62px] min-w-[250px] px-8 text-base sm:text-lg">
                Пройти диагностику
                <ArrowRight className="h-5 w-5" />
              </Link>
              <span className="text-sm font-semibold text-[#6b7888]">Без длинных анкет и скучных тестов</span>
            </motion.div>
          </motion.div>
        )}

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
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <motion.div
            variants={{
              hidden: { opacity: 0 },
              show: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.18,
                },
              },
            }}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-100px' }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {uspItems.map((item, idx) => (
              <motion.div
                key={idx}
                variants={{
                  hidden: { opacity: 0, y: 60, scale: 0.92, rotateX: 8 },
                  show: {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    rotateX: 0,
                    transition: {
                      type: 'spring',
                      stiffness: 90,
                      damping: 14,
                    },
                  },
                }}
                className="perspective-[1000px]"
              >
                <UspCard icon={item.icon} title={item.title} text={item.text} />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── ДЛЯ КОГО ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Для кого
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Кому подходит диагностика
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ForWhomCard
                icon={<Users className="h-6 w-6 text-[#8aaec4]" />}
                title="Школьникам 8–11 классов"
                text="Идеальный возраст для осознанного выбора направления: от 13 до 18 лет"
              />
              <ForWhomCard
                icon={<Shield className="h-6 w-6 text-[#c6a766]" />}
                title="Родителям"
                text="Понятный отчёт с конкретными рекомендациями — без сложной психологической терминологии"
              />
              <ForWhomCard
                icon={<HelpCircle className="h-6 w-6 text-[#e9b9bd]" />}
                title="Тем, кто сомневается"
                text="Снимем тревогу вокруг выбора профессии и покажем реальные сильные стороны"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── КАК ЭТО РАБОТАЕТ ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 relative z-10 bg-transparent">
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
              {howItWorks.map((item) => {
                const StepIcon = item.icon;
                return (
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
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[#9bbbcf]/10 flex items-center justify-center">
                      <StepIcon className="h-6 w-6 text-[#8aaec4]" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#c6a766]/30 font-sans">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-[#253243] font-sans">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5e6b7e] leading-relaxed font-sans">
                      {item.text}
                    </p>
                  </motion.div>
                );
              })}
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

      {/* ─── SOCIAL PROOF ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Почему нам доверяют
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Надёжная методика и прозрачность
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <TrustCard
                number="3"
                label="научных метода"
                desc="RIASEC, Big Five, теория Гарднера — проверенные десятилетиями исследований"
              />
              <TrustCard
                number="25"
                label="минут"
                desc="Интерактивный формат, вовлекающий ребёнка вместо скучных анкет"
              />
              <TrustCard
                number="10+"
                label="направлений"
                desc="Медицина, IT, бизнес, творчество и другие сферы для точного подбора"
              />
            </div>

            <div className="glass-card rounded-[22px] p-8 text-center space-y-4">
              <Shield className="h-8 w-8 text-[#8aaec4] mx-auto" />
              <h3 className="text-lg font-bold text-[#253243]">Безопасность данных</h3>
              <p className="text-sm text-[#5e6b7e] leading-relaxed max-w-2xl mx-auto">
                Мы собираем минимум информации, не передаём её третьим лицам и используем исключительно для формирования персонального отчёта. Все данные защищены.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── ОТЗЫВЫ И КЕЙСЫ ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Реальные истории
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Отзывы родителей и школьников
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ReviewCard
                author="Мария, мама 9-классника"
                text="Сын совершенно не понимал, куда идти после 9 класса. Диагностика показала сильный перекос в инженерию и IT. Отчет разложил всё по полочкам: какие предметы сдавать и куда поступать."
              />
              <ReviewCard
                author="Егор, 10 класс"
                text="Думал идти в юристы, потому что родители советовали. А тест показал, что у меня склонность к творческим профессиям и дизайну. Показал отчет маме, теперь она согласна со мной!"
              />
              <ReviewCard
                author="Елена, мама выпускницы"
                text="Очень удобный формат. Дочь прошла тест за 20 минут с телефона, а я получила PDF-отчет с подробным анализом. Это сняло столько напряжения в семье перед экзаменами!"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 relative z-10 bg-transparent">
        <div className="mx-auto max-w-3xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Частые вопросы
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#253243] font-sans">
                Ответы для родителей
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <FaqItem key={index} question={item.q} answer={item.a} />
              ))}
            </div>

            <div className="text-center pt-4">
              <Link href="/auth" className="cta-glass h-[60px] min-w-[260px] px-8 text-base">
                Начать диагностику
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
                © {new Date().getFullYear()} SynthosAI Creative Studio
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

function ForWhomCard({ icon, title, text }: { icon: ReactNode; title: string; text: string }) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0 }
      }}
      className="glass-card rounded-[22px] p-6 space-y-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-white/60 border border-white/80 flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-[#253243] font-sans">{title}</h3>
      <p className="text-sm text-[#5e6b7e] leading-relaxed font-sans">{text}</p>
    </motion.div>
  );
}

function TrustCard({ number, label, desc }: { number: string; label: string; desc: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 text-center space-y-3">
      <div className="text-4xl font-extrabold text-[#c6a766] font-sans">{number}</div>
      <div className="text-sm font-bold uppercase tracking-wider text-[#8aaec4]">{label}</div>
      <p className="text-sm text-[#5e6b7e] leading-relaxed font-sans">{desc}</p>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      className="glass-card rounded-[18px] overflow-hidden"
      initial={false}
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-semibold text-[#253243] pr-4">{question}</span>
        <motion.span
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-[#8aaec4] text-xl font-light flex-shrink-0"
        >
          +
        </motion.span>
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-[#5e6b7e] leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </motion.div>
  );
}

function ReviewCard({ author, text }: { author: string; text: string }) {
  return (
    <div className="glass-card rounded-[22px] p-6 space-y-4">
      <div className="flex text-[#c6a766]">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} className="w-5 h-5 fill-current" viewBox="0 0 24 24">
            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
          </svg>
        ))}
      </div>
      <p className="text-[#566679] text-sm leading-relaxed italic">«{text}»</p>
      <div className="font-bold text-[#253243] text-sm pt-2 border-t border-[#e2e8f0]/50">{author}</div>
    </div>
  );
}

