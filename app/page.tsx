'use client';

import Link from 'next/link';
import { 
  ArrowRight, 
  Clock, 
  Activity, 
  FileText, 
  Brain, 
  Compass, 
  Sparkles, 
  HeartHandshake, 
  Target,
  ArrowUpRight,
  ShieldCheck,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { motion } from 'framer-motion';
import { HeroOrb } from './components/HeroOrb';
import { assessmentBlocks, familyBenefits, nextSteps, processSteps, professions, trustPoints } from './data';

const icons = [Brain, Compass, Sparkles, HeartHandshake, Target];

export default function HomePage() {
  return (
    <main className="mx-auto flex max-w-7xl flex-col justify-center px-6 py-10 lg:px-10 lg:py-16 relative overflow-hidden gap-20 lg:gap-32">
      
      {/* 1. HERO СЕКЦИЯ */}
      <section className="relative min-h-[calc(100vh-180px)] flex flex-col justify-center">
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
      </section>

      {/* 2. АРХИТЕКТУРА ДИАГНОСТИКИ */}
      <section className="relative z-10 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7c8cff] font-unbounded">Архитектура диагностики</p>
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-unbounded bg-gradient-to-r from-white via-[#eef2ff] to-[#7c8cff] bg-clip-text text-transparent">
              Пять блоков в один профиль
            </h2>
          </div>
          <Link
            href="/auth"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#7c8cff] hover:text-white transition group"
          >
            Перейти к тесту
            <ChevronRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {assessmentBlocks.map((block, index) => {
            const Icon = icons[index] ?? Sparkles;
            return (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -6, borderColor: 'rgba(124, 140, 255, 0.2)' }}
                className="group relative rounded-3xl border border-white/[0.03] bg-[#0b1125]/20 p-6 backdrop-blur-md transition-all duration-300 flex flex-col justify-between text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/[0.02] border border-white/5 text-[#7c8cff] transition group-hover:scale-110">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-[0.1em] text-[#8b5cf6] bg-[#8b5cf6]/10 px-2.5 py-1 rounded-full">
                      {block.weight}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-text font-unbounded">{block.title}</h3>
                  <p className="text-xs text-muted font-inter leading-relaxed">{block.description}</p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.03] flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted font-inter">Длительность</span>
                  <span className="text-xs font-semibold text-[#7c8cff] font-inter">{block.duration}</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 3. ПУТЬ И ДОВЕРИЕ */}
      <section className="relative z-10 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Как устроен путь */}
        <div className="rounded-[32px] border border-white/[0.03] bg-[#0b1125]/20 p-8 backdrop-blur-md space-y-8 text-left">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c8cff] font-unbounded">Как устроен путь</p>
            <h2 className="text-2xl font-bold font-unbounded text-text">От первого контакта до отчета</h2>
          </div>
          <div className="grid gap-4">
            {processSteps.map((step, index) => (
              <div 
                key={step.title} 
                className="flex gap-4 p-5 rounded-2xl border border-white/[0.02] bg-white/[0.01] hover:border-white/5 transition duration-300"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#7c8cff]/10 text-xs font-bold text-[#7c8cff] font-unbounded">
                  0{index + 1}
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-text font-unbounded">{step.title}</h4>
                  <p className="text-xs text-muted font-inter leading-relaxed">{step.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Почему этому можно доверять */}
        <div className="rounded-[32px] border border-white/[0.03] bg-[#0b1125]/20 p-8 backdrop-blur-md space-y-8 text-left flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5cf6] font-unbounded">Доверие</p>
            <h2 className="text-2xl font-bold font-unbounded text-text">Продукт говорит по делу</h2>
          </div>
          <div className="space-y-4 my-auto">
            {trustPoints.map((item) => (
              <div 
                key={item} 
                className="flex items-start gap-3.5 p-4 rounded-xl border border-white/[0.02] bg-white/[0.01]"
              >
                <ShieldCheck className="h-5 w-5 text-[#8b5cf6] shrink-0 mt-0.5" />
                <p className="text-xs text-muted font-inter leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/[0.03]">
            <p className="text-xs text-[#7c8cff]/80 font-inter">Диагностика строится на проверенных психологических методиках</p>
          </div>
        </div>
      </section>

      {/* 4. СЕМЬЯ И ПРОФЕССИИ */}
      <section className="relative z-10 grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Что получает семья */}
        <div className="rounded-[32px] border border-white/[0.03] bg-[#0b1125]/20 p-8 backdrop-blur-md space-y-8 text-left flex flex-col justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#7c8cff] font-unbounded">Что получает семья</p>
            <h2 className="text-2xl font-bold font-unbounded text-text">Больше, чем просто список</h2>
          </div>
          <div className="space-y-4 my-auto">
            {familyBenefits.map((item) => (
              <div 
                key={item} 
                className="flex items-start gap-3.5 p-4.5 rounded-xl border border-white/[0.02] bg-white/[0.01]"
              >
                <CheckCircle2 className="h-5 w-5 text-[#7c8cff] shrink-0 mt-0.5" />
                <p className="text-xs text-muted font-inter leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-white/[0.03]">
            <p className="text-xs text-[#8b5cf6]/80 font-inter">Отчет адаптирован для совместного чтения детьми и родителями</p>
          </div>
        </div>

        {/* Топ карьерных совпадений */}
        <div className="rounded-[32px] border border-white/[0.03] bg-[#0b1125]/20 p-8 backdrop-blur-md space-y-6 text-left">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8b5cf6] font-unbounded">Карьерные совпадения</p>
            <h2 className="text-2xl font-bold font-unbounded text-text">Профессии, которые можно объяснить</h2>
          </div>
          <div className="space-y-4">
            {professions.slice(0, 3).map((profession) => (
              <div 
                key={profession.name} 
                className="p-5 rounded-2xl border border-white/[0.02] bg-white/[0.01] hover:border-white/5 transition duration-300 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-text font-unbounded">{profession.name}</span>
                  <span className="text-xs font-extrabold text-[#7c8cff] bg-[#7c8cff]/10 px-2 py-0.5 rounded-md font-unbounded">
                    {profession.score}% Match
                  </span>
                </div>
                <p className="text-[11px] text-muted font-inter leading-relaxed">{profession.summary}</p>
                
                {/* Метрик-бар */}
                <div className="h-1.5 w-full rounded-full bg-white/[0.03] overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${profession.score}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#7c8cff] rounded-full shadow-[0_0_10px_rgba(124,140,255,0.4)]"
                  />
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {profession.subjects.slice(0, 2).map((sub) => (
                    <span key={sub} className="text-[10px] text-[#7c8cff] bg-[#7c8cff]/5 px-2 py-0.5 rounded-full font-inter">
                      {sub}
                    </span>
                  ))}
                  {profession.directions.slice(0, 1).map((dir) => (
                    <span key={dir} className="text-[10px] text-muted bg-white/[0.03] px-2 py-0.5 rounded-full font-inter">
                      {dir}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. ПОСЛЕ РЕЗУЛЬТАТА */}
      <section className="relative z-10 space-y-10">
        <div className="space-y-3 text-left">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#7c8cff] font-unbounded">После результата</p>
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl lg:text-5xl font-unbounded bg-gradient-to-r from-white via-[#eef2ff] to-[#7c8cff] bg-clip-text text-transparent">
            Поддержка на каждом шаге
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {nextSteps.map((step, index) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              className="p-6 rounded-3xl border border-white/[0.03] bg-[#0b1125]/20 backdrop-blur-md text-left flex flex-col justify-between gap-6"
            >
              <div className="text-3xl font-extrabold text-white/5 font-unbounded">
                0{index + 1}
              </div>
              <p className="text-xs text-muted font-inter leading-relaxed">
                {step}
              </p>
              <div className="pt-2">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 text-muted hover:text-white transition">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

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
