'use client';

import Link from 'next/link';
import { ArrowRight, Clock, Activity, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroOrb } from './components/HeroOrb';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-90px)] max-w-7xl flex-col justify-center px-6 py-10 lg:px-10 lg:py-16 relative overflow-hidden">
      {/* Фоновый интерактивный 3D-шар */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-full lg:w-[55%] h-[600px] pointer-events-none z-0 opacity-90 select-none">
        <HeroOrb />
      </div>

      <div className="relative z-10 grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="max-w-3xl space-y-8 lg:space-y-10">
          
          {/* Заголовки */}
          <div className="space-y-6">
            <h1 className="text-4xl font-extrabold leading-[1.08] tracking-tight sm:text-5xl lg:text-7xl font-unbounded bg-gradient-to-r from-white via-[#eef2ff] to-[#7c8cff] bg-clip-text text-transparent">
              Определи свой путь с помощью ИИ
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-muted lg:text-xl font-inter">
              Пройди современную 3-факторную диагностику талантов, характера и интересов. Получи детальный ИИ-отчет с рекомендациями по профессиям, предметам и траектории развития.
            </p>
          </div>

          {/* Кнопки действий */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/auth"
              className="inline-flex items-center gap-2 rounded-2xl bg-accent px-8 py-4.5 text-base font-semibold text-white shadow-glow transition duration-300 hover:scale-[1.03] hover:shadow-[0_0_80px_rgba(124,140,255,0.3)] active:scale-[0.98]"
              style={{ height: '56px' }}
            >
              Запустить тест
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/report"
              className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-8 py-4.5 text-base font-semibold text-text transition duration-300 hover:scale-[1.03] hover:bg-white/10 active:scale-[0.98]"
              style={{ height: '56px' }}
            >
              Посмотреть демо-отчёт
            </Link>
          </div>

          {/* Легкие метрики с анимацией плавного появления */}
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.12
                }
              }
            }}
            className="grid gap-4 pt-8 sm:grid-cols-3 border-t border-white/5 max-w-2xl"
          >
            <MetricCard 
              icon={<Clock className="h-5 w-5 text-[#7c8cff]" />}
              title="25 минут" 
              text="Длина диагностики" 
            />
            <MetricCard 
              icon={<Activity className="h-5 w-5 text-[#8b5cf6]" />}
              title="3-фактора" 
              text="RIASEC + Big Five + Гарднер" 
            />
            <MetricCard 
              icon={<FileText className="h-5 w-5 text-[#78d4ff]" />}
              title="ИИ-Отчет" 
              text="Понятный ребенку и родителям" 
            />
          </motion.div>
        </div>

        {/* Правая колонка grid для сохранения отступа под сферу на десктопах */}
        <div className="hidden lg:block h-[500px] pointer-events-none" />
      </div>
    </main>
  );
}

function MetricCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, y: 15 },
        visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 80 } }
      }}
      whileHover={{ 
        scale: 1.03, 
        borderColor: 'rgba(124, 140, 255, 0.25)',
        boxShadow: '0 12px 30px -10px rgba(124, 140, 255, 0.15)',
        y: -4
      }}
      className="rounded-2xl border border-white/[0.03] bg-[#0b1125]/25 p-5 backdrop-blur-md transition-all duration-300 flex flex-col gap-4 text-left"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5">
        {icon}
      </div>
      <div>
        <p className="text-base font-extrabold text-text font-unbounded bg-gradient-to-r from-white to-[#eef2ff] bg-clip-text text-transparent leading-none">{title}</p>
        <p className="mt-2 text-xs text-muted font-inter leading-relaxed">{text}</p>
      </div>
    </motion.div>
  );
}
