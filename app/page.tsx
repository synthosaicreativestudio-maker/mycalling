'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════
   Премиальные геометрические SVG-иконки для УТП
   ═══════════════════════════════════════════════════ */

function IconTimer() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(232,201,122,0.15)]">
      <defs>
        <linearGradient id="timerGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#e8c97a" />
          <stop offset="100%" stopColor="#d4a853" />
        </linearGradient>
      </defs>
      {/* Внешний тонкий круг */}
      <circle cx="24" cy="24" r="18" stroke="url(#timerGrad)" strokeWidth="1" strokeDasharray="4 2" />
      {/* Внутренний сплошной круг */}
      <circle cx="24" cy="24" r="14" stroke="url(#timerGrad)" strokeWidth="1.5" />
      {/* Тонкие направляющие оси */}
      <line x1="24" y1="10" x2="24" y2="38" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      <line x1="10" y1="24" x2="38" y2="24" stroke="url(#timerGrad)" strokeWidth="0.5" strokeDasharray="2 2" />
      {/* Тонкие стрелки хронометра */}
      <line x1="24" y1="24" x2="24" y2="15" stroke="#e8c97a" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="24" y1="24" x2="32" y2="20" stroke="#d4a853" strokeWidth="1" strokeLinecap="round" />
      {/* Центральная точка */}
      <circle cx="24" cy="24" r="2.5" fill="#e8c97a" stroke="#06060e" strokeWidth="1" />
    </svg>
  );
}

function IconScience() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(139,127,247,0.15)]">
      <defs>
        <linearGradient id="sciGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#a89bfa" />
          <stop offset="100%" stopColor="#8b7ff7" />
        </linearGradient>
      </defs>
      {/* Три пересекающиеся окружности */}
      <circle cx="24" cy="18" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="17" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      <circle cx="31" cy="30" r="12" stroke="url(#sciGrad)" strokeWidth="1.2" />
      {/* Внутренние линии пересечения */}
      <circle cx="24" cy="26" r="3" fill="#a89bfa" opacity="0.3" />
      <circle cx="24" cy="26" r="1" fill="#8b7ff7" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="filter drop-shadow-[0_0_8px_rgba(212,168,83,0.15)]">
      <defs>
        <linearGradient id="repGrad" x1="12" y1="12" x2="36" y2="36">
          <stop offset="0%" stopColor="#e8c97a" />
          <stop offset="50%" stopColor="#d4a853" />
          <stop offset="100%" stopColor="#a89bfa" />
        </linearGradient>
      </defs>
      {/* Тонкий внешний геометрический кристалл */}
      <path d="M24 8L38 18V32L24 42L10 32V18L24 8Z" stroke="url(#repGrad)" strokeWidth="1.2" strokeDasharray="3 2" />
      {/* Внутренние линии связи к центру */}
      <line x1="24" y1="8" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="38" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="24" y1="42" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="32" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      <line x1="10" y1="18" x2="24" y2="24" stroke="url(#repGrad)" strokeWidth="0.8" />
      {/* Сияющие точки в вершинах */}
      <circle cx="24" cy="8" r="2" fill="#e8c97a" />
      <circle cx="38" cy="18" r="2" fill="#d4a853" />
      <circle cx="38" cy="32" r="2" fill="#a89bfa" />
      <circle cx="24" cy="42" r="2" fill="#8b7ff7" />
      <circle cx="10" cy="32" r="2" fill="#a89bfa" />
      <circle cx="10" cy="18" r="2" fill="#d4a853" />
      <circle cx="24" cy="24" r="3" fill="#ffffff" stroke="#8b7ff7" strokeWidth="1" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Данные «Как это работает» (без упоминаний ИИ)
   ═══════════════════════════════════════════════════ */

const howItWorks = [
  { step: '01', title: 'Регистрация', text: 'Быстрый старт без анкет' },
  { step: '02', title: 'Диагностика', text: '25 минут интерактивной игры' },
  { step: '03', title: 'Анализ ответов', text: 'Алгоритм сопоставляет результаты' },
  { step: '04', title: 'Отчёт', text: 'Профессии, предметы и план действий' },
];

/* ═══════════════════════════════════════════════════
   Компонент страницы
   ═══════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <main className="relative z-10">
      
      {/* ─── HERO ─── */}
      <section className="min-h-screen flex flex-col items-center justify-center px-6 text-center pt-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl space-y-8"
        >
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-normal tracking-tight text-[#f0ece4] whitespace-nowrap inline-flex flex-nowrap items-center justify-center gap-x-2 sm:gap-x-4">
            <span className="relative inline-block select-none">
              <span className="absolute inset-0 text-3d-shadow text-[#0c0c14] select-none pointer-events-none uppercase">ОПРЕДЕЛИ</span>
              <span className="shimmer-text uppercase relative z-10">ОПРЕДЕЛИ</span>
            </span>
            <span className="relative inline-block select-none">
              <span className="absolute inset-0 text-3d-shadow text-[#0c0c14] select-none pointer-events-none uppercase italic font-serif">СВОЙ</span>
              <span className="shimmer-text uppercase italic font-serif relative z-10">СВОЙ</span>
            </span>
            <span className="relative inline-block select-none">
              <span className="absolute inset-0 text-3d-shadow text-[#0c0c14] select-none pointer-events-none font-signature lowercase text-[#e8c97a]">путь</span>
              <span className="font-signature text-[#e8c97a] lowercase filter drop-shadow-[0_0_15px_rgba(232,201,122,0.3)] relative z-10 inline-block">путь</span>
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-base sm:text-lg leading-relaxed text-[#8a8694] font-inter">
            Помогите ребенку выбрать будущую профессию без шаблонных тестов. 25 минут интерактивной игры раскроют его склонности и дадут готовый план действий для всей семьи.
          </p>

          <div className="pt-4">
            <Link href="/auth" className="cta-gold">
              Пройти диагностику
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.4 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2"
        >
          <div className="w-5 h-8 rounded-full border border-white/20 flex justify-center pt-1.5">
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
              className="w-1 h-1.5 rounded-full bg-[#d4a853]"
            />
          </div>
        </motion.div>
      </section>

      {/* ─── УТП (3 карточки) ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32">
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
      <section className="px-6 lg:px-10 py-24 lg:py-32">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true, margin: '-100px' }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d4a853] font-title">
                Как это работает
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-[#f0ece4]">
                Четыре шага к результату
              </h2>
            </div>

            {/* Карточки с staggered spring-анимацией появления */}
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
                  className="glass-card rounded-2xl p-6 text-center space-y-4 hover:border-[#d4a853]/35 hover:shadow-[0_15px_30px_rgba(212,168,83,0.06)] transition-all duration-300"
                >
                  <div className="text-3xl font-bold text-[#d4a853]/20 font-title">
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-[#f0ece4] font-title">
                    {item.title}
                  </h3>
                  <p className="text-sm text-[#8a8694] leading-relaxed">
                    {item.text}
                  </p>
                </motion.div>
              ))}
            </motion.div>

            {/* Повторная CTA */}
            <div className="text-center pt-4">
              <Link href="/auth" className="cta-gold">
                Начать бесплатно
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/[0.04] mt-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <img
                src="/assets/logos/logo-with-text.svg"
                alt="МоёПризвание"
                className="h-8 w-auto opacity-60"
              />
              <span className="text-xs text-[#8a8694]">
                © {new Date().getFullYear()} МоёПризвание
              </span>
            </div>
            
            <nav className="flex items-center gap-6 text-xs text-[#8a8694]">
              <Link href="/privacy" className="hover:text-[#f0ece4] transition">
                Политика конфиденциальности
              </Link>
              <Link href="/terms" className="hover:text-[#f0ece4] transition">
                Пользовательское соглашение
              </Link>
              <a href="mailto:hello@synthosai.ru" className="hover:text-[#f0ece4] transition">
                Контакты
              </a>
            </nav>
          </div>
        </div>
      </footer>

    </main>
  );
}

/* ═══════════════════════════════════════════════════
   Компонент УТП-карточки
   ═══════════════════════════════════════════════════ */

function UspCard({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <div className="glass-card rounded-2xl p-8 text-center space-y-5 group">
      <div className="flex justify-center transition-transform duration-500 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-[#f0ece4] font-title">{title}</h3>
      <p className="text-sm text-[#8a8694] leading-relaxed">{text}</p>
    </div>
  );
}
