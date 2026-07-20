import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Phone, LogOut, CheckCircle2, ChevronRight, Lock } from 'lucide-react';
import { narrative, ASSESSMENT_CHAPTER_ORDER } from '../../data/narrative';

// Показываем только главы, которые реально есть в тестовой батарее (app/data/questions.ts),
// чтобы не обещать шаги, которых ещё нет.
const EXISTING_TEST_CODES = new Set(['RIASEC', 'BFI', 'ICAR', 'VIA', 'PVQ', 'PROCRASTINATION', 'GROWTH', 'CONTEXT']);
const visibleChapters = ASSESSMENT_CHAPTER_ORDER.filter((code) => EXISTING_TEST_CODES.has(code)).map(
  (code) => narrative[code]
);

interface CabinetProgressProps {
  progress: {
    coachCompleted: boolean;
    testCompleted: boolean;
    sessionId: string | null;
  };
  session: any;
  handleLogout: () => Promise<void>;
  totalProgress: number;
}

export default function CabinetProgress({ progress, session, handleLogout, totalProgress }: CabinetProgressProps) {
  const userName = session?.user?.name || 'Пользователь';
  const userPhone = (session?.user as any)?.phone || 'Телефон не указан';

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10">
      <div className="rounded-[32px] glass-card p-8 md:p-10 border border-white/5 bg-[#040506]/35 backdrop-blur-xl relative overflow-hidden space-y-8">
        <motion.div 
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.45, 0.25],
            x: [0, 20, 0],
            y: [0, -10, 0],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-0 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.4, 0.2],
            x: [0, -15, 0],
            y: [0, 15, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-0 w-72 h-72 bg-[#C4A484]/8 rounded-full blur-[100px] pointer-events-none" 
        />

        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans flex items-center justify-center gap-2">
            <User className="h-7 w-7 text-[var(--accent-brown)]" />
            Личный кабинет
          </h1>
          <p className="text-sm text-[var(--text-muted)]">Управляйте вашим профилем и прогрессом диагностики</p>
        </div>

        {/* Profile info */}
        <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1">
            <div className="text-xs text-[var(--text-muted)] font-medium font-sans">Вы вошли как:</div>
            <div className="text-sm font-bold text-white font-sans">{userName}</div>
            <div className="text-xs text-[var(--text-muted)] flex items-center gap-1">
              <Phone className="h-3 w-3 shrink-0" /> {userPhone}
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-xs font-bold text-red-400 rounded-xl border border-red-500/20 transition duration-200 self-stretch md:self-auto justify-center"
          >
            <LogOut className="h-3.5 w-3.5" />
            Выйти из аккаунта
          </button>
        </div>

        {/* Progress bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-bold font-sans">
            <span className="text-[var(--text-muted)]">Ваш прогресс диагностики</span>
            <span className="text-[var(--accent-brown)]">{totalProgress}%</span>
          </div>
          <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[#3B82F6] to-[#C4A484] transition-all duration-500" 
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        </div>

        {/* Step Cards with premium animations and brand colors in a 3-column grid on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Step 1: Coach Session */}
          <motion.div 
            whileHover={{ 
              y: -3, 
              borderColor: progress.coachCompleted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(196, 164, 132, 0.4)',
              boxShadow: progress.coachCompleted 
                ? '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.08)'
                : '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(196, 164, 132, 0.15)'
            }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden min-h-[220px] ${
              progress.coachCompleted 
                ? 'bg-green-500/5 border-green-500/20' 
                : 'bg-[#C4A484]/5 border-[#C4A484]/20 shadow-[0_0_15px_rgba(196,164,132,0.03)]'
            }`}
          >
            {/* Мягкий анимированный блик позади активного шага */}
            {!progress.coachCompleted && (
              <motion.div 
                animate={{
                  opacity: [0.15, 0.35, 0.15],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#C4A484]/10 blur-3xl pointer-events-none"
              />
            )}
            <div className="space-y-1.5 flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                  progress.coachCompleted 
                    ? 'bg-green-500/15 text-green-400' 
                    : 'bg-[#C4A484]/15 text-[#C4A484] animate-pulse'
                }`}>
                  Этап 1: Коуч-сессия
                </span>
                {progress.coachCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
              </div>
              <h3 className="text-sm font-bold text-white font-sans">Диалог с наставником Романом</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Персональный интерактивный чат по методологиям CLEAR и WOOP для выявления ваших целей, сильных качеств и эмоций.
              </p>
            </div>
            
            <div className="relative z-10 shrink-0">
              {progress.coachCompleted ? (
                <Link
                  href="/coach"
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans transition duration-300 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 w-full"
                >
                  <span>Войти в чат</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 12px rgba(196, 164, 132, 0.2)',
                      '0 0 24px rgba(196, 164, 132, 0.45)',
                      '0 0 12px rgba(196, 164, 132, 0.2)',
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                  className="rounded-xl overflow-hidden"
                >
                  <Link
                    href="/coach"
                    className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#C4A484] hover:bg-[#b09071] text-[#080C14] text-xs font-bold font-sans transition duration-300 w-full"
                  >
                    <span>Продолжить сессию</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Step 2: Tests */}
          <motion.div 
            whileHover={progress.coachCompleted ? { 
              y: -3, 
              borderColor: progress.testCompleted ? 'rgba(34, 197, 94, 0.4)' : 'rgba(59, 130, 246, 0.4)',
              boxShadow: progress.testCompleted 
                ? '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(34, 197, 94, 0.08)'
                : '0 12px 30px rgba(0, 0, 0, 0.4), 0 0 20px rgba(59, 130, 246, 0.15)'
            } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden min-h-[220px] ${
              progress.testCompleted 
                ? 'bg-green-500/5 border-green-500/20' 
                : (progress.coachCompleted 
                    ? 'bg-[#3B82F6]/5 border-[#3B82F6]/20 shadow-[0_0_15px_rgba(59,130,246,0.03)]' 
                    : 'bg-white/[0.01] border-white/5 opacity-50'
                  )
            }`}
          >
            {/* Мягкий анимированный блик позади активного шага */}
            {progress.coachCompleted && !progress.testCompleted && (
              <motion.div 
                animate={{
                  opacity: [0.15, 0.35, 0.15],
                  scale: [0.9, 1.1, 0.9]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#3B82F6]/10 blur-3xl pointer-events-none"
              />
            )}
            <div className="space-y-1.5 flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                  progress.testCompleted 
                    ? 'bg-green-500/15 text-green-400' 
                    : (progress.coachCompleted 
                        ? 'bg-[#3B82F6]/15 text-[var(--accent-brown)] animate-pulse' 
                        : 'bg-white/5 text-slate-500'
                      )
                }`}>
                  Этап 2: Тестирование
                </span>
                {progress.testCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
              </div>
              <h3 className="text-sm font-bold text-white font-sans">Интерактивные опросники способностей</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Определение вашего типа мышления (RIASEC), командных ролей, ценностей и ведущих интересов по интерактивной шкале.
              </p>
              {/* Главы игрового квеста тестирования (Д-8) */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {visibleChapters.map((chapter) => (
                  <span
                    key={chapter.chapterTitle}
                    title={chapter.intro}
                    className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-semibold ${
                      progress.testCompleted
                        ? 'border-green-500/20 bg-green-500/10 text-green-400'
                        : 'border-white/10 bg-white/[0.03] text-[var(--text-muted)]'
                    }`}
                  >
                    <span>{chapter.emoji}</span>
                    <span>{chapter.chapterTitle}</span>
                  </span>
                ))}
              </div>
            </div>
            
            <div className="relative z-10 shrink-0">
              {!progress.coachCompleted ? (
                <div className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed w-full">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Заблокировано</span>
                </div>
              ) : progress.testCompleted ? (
                <Link
                  href="/assessment"
                  className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans transition duration-300 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10 w-full"
                >
                  <span>Перейти к тестам</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 12px rgba(59, 130, 246, 0.2)',
                      '0 0 24px rgba(59, 130, 246, 0.45)',
                      '0 0 12px rgba(59, 130, 246, 0.2)',
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                  className="rounded-xl overflow-hidden"
                >
                  <Link
                    href="/assessment"
                    className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[var(--accent-brown)] hover:bg-[#2563EB] text-white text-xs font-bold font-sans transition duration-300 w-full"
                  >
                    <span>Начать тесты</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Step 3: Final Report */}
          <motion.div 
            whileHover={(progress.coachCompleted && progress.testCompleted) ? { 
              y: -3, 
              borderColor: 'rgba(196, 164, 132, 0.5)',
              boxShadow: '0 15px 40px rgba(0, 0, 0, 0.65), 0 0 25px rgba(196, 164, 132, 0.2)'
            } : {}}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between gap-4 relative overflow-hidden min-h-[220px] ${
              progress.coachCompleted && progress.testCompleted 
                ? 'bg-gradient-to-br from-[#C4A484]/15 to-[#3B82F6]/5 border-[#C4A484]/30 shadow-[0_8px_30px_rgba(0,0,0,0.5)]' 
                : 'bg-white/[0.01] border-white/5 opacity-50'
            }`}
          >
            {/* Мягкий анимированный блик позади активного шага */}
            {progress.coachCompleted && progress.testCompleted && (
              <motion.div 
                animate={{
                  opacity: [0.2, 0.45, 0.2],
                  scale: [0.95, 1.15, 0.95]
                }}
                transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#C4A484]/15 blur-3xl pointer-events-none"
              />
            )}
            <div className="space-y-1.5 flex-1 relative z-10">
              <div className="flex items-center gap-2">
                <span className={`text-[9px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                  (progress.coachCompleted && progress.testCompleted)
                    ? 'bg-[#C4A484]/20 text-[#EAD5C3] animate-pulse'
                    : 'bg-white/5 text-slate-500'
                }`}>
                  Этап 3: Результат
                </span>
              </div>
              <h3 className="text-sm font-bold text-white font-sans">Итоговый ИИ-отчёт и Карта Призвания</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Полная расшифровка вашего психологического портрета, 3 рекомендуемые ИИ профессии и советы по развитию сильных сторон.
              </p>
            </div>
            
            <div className="relative z-10 shrink-0">
              {!(progress.coachCompleted && progress.testCompleted) ? (
                <div className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed w-full">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Заблокировано</span>
                </div>
              ) : (
                <motion.div
                  animate={{
                    boxShadow: [
                      '0 0 12px rgba(196, 164, 132, 0.2)',
                      '0 0 24px rgba(196, 164, 132, 0.45)',
                      '0 0 12px rgba(196, 164, 132, 0.2)',
                    ],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 3,
                    ease: 'easeInOut',
                  }}
                  className="rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => window.location.reload()}
                    className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#C4A484] hover:bg-[#b09071] text-[#080C14] text-xs font-bold font-sans transition duration-300 w-full"
                  >
                    <span>Открыть отчёт</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              )}
            </div>
          </motion.div>

        </div>

      </div>
    </main>
  );
}
