'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

/* ═══════════════════════════════════════════════════
   Объёмные SVG-иконки для УТП
   ═══════════════════════════════════════════════════ */

function IconTimer() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="timerGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#e8c97a" />
          <stop offset="100%" stopColor="#d4a853" />
        </linearGradient>
        <filter id="timerGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="24" cy="26" r="16" stroke="url(#timerGrad)" strokeWidth="2.5" fill="none" filter="url(#timerGlow)" />
      <line x1="24" y1="26" x2="24" y2="18" stroke="#e8c97a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="26" x2="30" y2="26" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" />
      <line x1="20" y1="8" x2="28" y2="8" stroke="#e8c97a" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="24" y1="8" x2="24" y2="12" stroke="#d4a853" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function IconScience() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sciGrad" x1="8" y1="8" x2="40" y2="40">
          <stop offset="0%" stopColor="#a89bfa" />
          <stop offset="100%" stopColor="#8b7ff7" />
        </linearGradient>
        <filter id="sciGlow">
          <feGaussianBlur stdDeviation="2" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <circle cx="24" cy="24" r="6" stroke="url(#sciGrad)" strokeWidth="2" fill="none" filter="url(#sciGlow)" />
      <ellipse cx="24" cy="24" rx="18" ry="8" stroke="url(#sciGrad)" strokeWidth="1.5" fill="none" transform="rotate(0 24 24)" />
      <ellipse cx="24" cy="24" rx="18" ry="8" stroke="url(#sciGrad)" strokeWidth="1.5" fill="none" transform="rotate(60 24 24)" />
      <ellipse cx="24" cy="24" rx="18" ry="8" stroke="url(#sciGrad)" strokeWidth="1.5" fill="none" transform="rotate(120 24 24)" />
      <circle cx="24" cy="24" r="3" fill="#a89bfa" />
    </svg>
  );
}

function IconReport() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="repGrad" x1="12" y1="6" x2="36" y2="42">
          <stop offset="0%" stopColor="#e8c97a" />
          <stop offset="50%" stopColor="#d4a853" />
          <stop offset="100%" stopColor="#a89bfa" />
        </linearGradient>
        <filter id="repGlow">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <rect x="12" y="6" width="24" height="36" rx="4" stroke="url(#repGrad)" strokeWidth="2" fill="none" filter="url(#repGlow)" />
      <line x1="18" y1="16" x2="30" y2="16" stroke="#e8c97a" strokeWidth="2" strokeLinecap="round" />
      <line x1="18" y1="22" x2="28" y2="22" stroke="#d4a853" strokeWidth="1.5" strokeLinecap="round" />
      <line x1="18" y1="28" x2="26" y2="28" stroke="#a89bfa" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="21" cy="35" r="2" fill="#d4a853" />
      <circle cx="27" cy="35" r="2" fill="#8b7ff7" />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════
   Данные «Как это работает»
   ═══════════════════════════════════════════════════ */

const howItWorks = [
  { step: '01', title: 'Регистрация', text: 'Быстрый старт без анкет' },
  { step: '02', title: 'Диагностика', text: '25 минут интерактивного теста' },
  { step: '03', title: 'ИИ-анализ', text: 'Алгоритм обрабатывает ответы' },
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
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-[1.05] tracking-tight bg-gradient-to-b from-[#f0ece4] via-[#f0ece4] to-[#8a8694] bg-clip-text text-transparent">
            Определи свой путь
          </h1>
          
          <p className="max-w-lg mx-auto text-base sm:text-lg leading-relaxed text-[#8a8694]">
            ИИ-диагностика талантов и интересов.<br />
            25 минут — и семья получает понятный план.
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
              title="Понятный ИИ-отчёт"
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

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="glass-card rounded-2xl p-6 text-center space-y-4"
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
            </div>

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
