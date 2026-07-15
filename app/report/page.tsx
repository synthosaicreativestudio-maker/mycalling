'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Compass, Sparkles, Award, RefreshCw, AlertCircle, ArrowLeft, Download, Loader2, ShieldCheck, Clock, LogOut, CheckCircle2, Lock, ChevronRight, Phone, Send, User } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { motion } from 'framer-motion';

type Trait = {
  name: string;
  score: number;
  description: string;
};

type Profession = {
  name: string;
  score: number;
  why: string;
};

type ReportData = {
  studentName?: string;
  heroSummary: string[];
  personalityTraits?: Trait[];
  riasecSummary?: string;
  riasecScores?: Record<string, number>;
  strengths: string[];
  growthAreas: string[];
  coachSection?: {
    dreams?: string;
    idols?: string;
    values?: string;
    deepGoal?: string;
    deepOutcome?: string;
    deepEmotions?: string;
    deepIdentity?: string;
    deepActions?: string;
    deepFirstStep?: string;
  };
  professions: Profession[];
};

const defaultReport: ReportData = {
  studentName: 'Демо-профиль',
  heroSummary: [
    'Выраженное сочетание аналитического мышления и творческого потенциала.',
    'Профиль указывает на склонность к решению концептуальных задач на стыке технологий и дизайна.'
  ],
  riasecScores: { R: 60, I: 85, A: 80, S: 50, E: 45, C: 30 },
  personalityTraits: [
    { name: 'Открытость новому', score: 85, description: 'Высокая любознательность, готовность пробовать новые подходы и генерировать идеи.' },
    { name: 'Добросовестность', score: 70, description: 'Умение организовать учебный процесс и доводить дела до результата.' },
    { name: 'Экстраверсия', score: 65, description: 'Комфортно чувствует себя в командной работе и презентациях.' },
    { name: 'Доброжелательность', score: 80, description: 'Высокий уровень эмпатии, умение слышать мнение других.' },
    { name: 'Эмоциональная устойчивость', score: 75, description: 'Спокойное восприятие критики, умение справляться со стрессом.' }
  ],
  riasecSummary: 'Ведущими типами профессиональных интересов являются Исследовательский (I) и Артистичный (A). Склонность к научной деятельности и свободному поиску решений.',
  strengths: [
    'Быстро переводит сложные абстрактные идеи в понятные структуры.',
    'Способен находить скрытые логические связи и упорядочивать хаотичные данные.',
    'Высокая чувствительность к потребностям людей.'
  ],
  growthAreas: [
    'Переход от генерации концептов к практическому программированию и сборке.',
    'Работа в неопределенных условиях без готовых шаблонов.',
    'Развитие навыков планирования.'
  ],
  coachSection: {
    dreams: 'Мечтает разрабатывать цифровые продукты, приносящие пользу обществу.',
    idols: 'Вдохновляется инноваторами и создателями культовых технологических решений.',
    values: 'Главная ценность — свобода самовыражения и возможность созидать новые системы.'
  },
  professions: [
    {
      name: 'UX/UI Дизайнер интерфейсов',
      score: 95,
      why: 'Идеальное схождение пространственного видения, артистического интереса и высокой эмпатии. Ученик сможет проектировать понятный пользовательский опыт.'
    },
    {
      name: 'Аналитик данных',
      score: 90,
      why: 'Сильное логическое мышление, исследовательский интерес и внимательность к деталям хорошо совпадают с аналитическими ролями.'
    }
  ]
};

function RpgProfessionCard({ name, score, why }: { name: string, score: number, why: string }) {
  const lowerName = name.toLowerCase();
  
  let analytic = 50;
  let creative = 50;
  let practical = 50;

  if (lowerName.includes('аналити') || lowerName.includes('програм') || lowerName.includes('инженер') || lowerName.includes('разработ')) {
    analytic = 85;
    practical = 70;
    creative = 45;
  } else if (lowerName.includes('дизайн') || lowerName.includes('арт') || lowerName.includes('худож') || lowerName.includes('креатив') || lowerName.includes('писатель') || lowerName.includes('редактор')) {
    creative = 90;
    analytic = 40;
    practical = 55;
  } else if (lowerName.includes('консульт') || lowerName.includes('менеджер') || lowerName.includes('управлен') || lowerName.includes('лидер') || lowerName.includes('бизнес') || lowerName.includes('стартап')) {
    practical = 80;
    creative = 65;
    analytic = 60;
  }

  return (
    <div className="relative group overflow-hidden rounded-[24px] border border-white/5 bg-[#080C14]/40 p-5 space-y-4 hover:border-[#3B82F6]/30 hover:bg-[#3B82F6]/5 hover:shadow-[0_8px_30px_rgba(59,130,246,0.03)] transition-all duration-300 text-left">
      <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B82F6]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition duration-500 pointer-events-none" />
      
      <div className="flex items-start gap-4">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 text-[#3B82F6] group-hover:scale-105 group-hover:bg-[#3B82F6] group-hover:text-white transition duration-300 shadow-inner">
          <Compass className="h-5.5 w-5.5" />
        </div>

        <div className="space-y-1 flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-extrabold text-white text-xs md:text-sm truncate leading-snug font-sans group-hover:text-[#3B82F6] transition">
              {name}
            </h3>
            <span className="shrink-0 text-[9px] font-black px-2 py-0.5 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/20 rounded-full font-sans tracking-wide">
              {score}%
            </span>
          </div>
          <p className="text-[10px] text-[#7A8A9E] leading-relaxed line-clamp-3">
            {why}
          </p>
        </div>
      </div>

      <div className="border-t border-white/5 pt-3.5 space-y-2">
        <span className="text-[8px] uppercase tracking-widest font-extrabold text-[#7A8A9E] block mb-1 font-sans">RPG Характеристики</span>
        
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>Аналитический склад</span>
            <span>{analytic}/100</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-blue-500 rounded-full transition-all duration-1000" style={{ width: `${analytic}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>Креативный потенциал</span>
            <span>{creative}/100</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-pink-500 rounded-full transition-all duration-1000" style={{ width: `${creative}%` }} />
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex items-center justify-between text-[9px] font-bold text-white/70">
            <span>Практические навыки</span>
            <span>{practical}/100</span>
          </div>
          <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-green-500 rounded-full transition-all duration-1000" style={{ width: `${practical}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function RadarChart({ scores }: { scores?: Record<string, number> }) {
  const axes = [
    { key: 'R', label: 'Практический (R)' },
    { key: 'I', label: 'Аналитический (I)' },
    { key: 'A', label: 'Творческий (A)' },
    { key: 'S', label: 'Социальный (S)' },
    { key: 'E', label: 'Лидерский (E)' },
    { key: 'C', label: 'Системный (C)' }
  ];

  const cx = 140;
  const cy = 140;
  const r = 85;

  const getCoordinates = (i: number, val: number) => {
    const angle = i * (2 * Math.PI / 6) - Math.PI / 2;
    const factor = val / 100;
    const x = cx + r * factor * Math.cos(angle);
    const y = cy + r * factor * Math.sin(angle);
    return { x, y };
  };

  const normalizedScores: Record<string, number> = {};
  axes.forEach(ax => {
    let raw = scores?.[ax.key] || scores?.[ax.key.toLowerCase()] || 50;
    if (raw <= 5) {
      normalizedScores[ax.key] = Math.round((raw / 5) * 100);
    } else {
      normalizedScores[ax.key] = raw;
    }
  });

  const points = axes.map((ax, i) => {
    const { x, y } = getCoordinates(i, normalizedScores[ax.key]);
    return `${x},${y}`;
  }).join(' ');

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="flex flex-col items-center justify-center p-5 border border-white/5 bg-[#040506]/40 rounded-[24px]">
      <h3 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] mb-4 font-sans">Свечение способностей (RIASEC)</h3>
      <div className="relative w-[280px] h-[280px]">
        <svg viewBox="0 0 280 280" className="w-full h-full">
          {gridLevels.map((lvl) => {
            const gridPoints = axes.map((_, i) => {
              const { x, y } = getCoordinates(i, lvl);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={lvl}
                points={gridPoints}
                fill="none"
                stroke="rgba(255, 255, 255, 0.05)"
                strokeWidth="1"
              />
            );
          })}

          {axes.map((ax, i) => {
            const outer = getCoordinates(i, 100);
            return (
              <line
                key={ax.key}
                x1={cx}
                y1={cy}
                x2={outer.x}
                y2={outer.y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="1"
              />
            );
          })}

          {axes.map((ax, i) => {
            const labelPos = getCoordinates(i, 118);
            return (
              <text
                key={ax.key}
                x={labelPos.x}
                y={labelPos.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-sans font-bold fill-[#7A8A9E]"
              >
                {ax.label}
              </text>
            );
          })}

          <polygon
            points={points}
            fill="rgba(59, 130, 246, 0.15)"
            stroke="#3B82F6"
            strokeWidth="2"
            className="drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]"
          />

          {axes.map((ax, i) => {
            const pt = getCoordinates(i, normalizedScores[ax.key]);
            return (
              <circle
                key={ax.key}
                cx={pt.x}
                cy={pt.y}
                r="3.5"
                className="fill-[#3B82F6] stroke-white stroke-1"
              />
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function ReportPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');

  const [report, setReport] = useState<ReportData>(defaultReport);
  const [isDemo, setIsDemo] = useState(true);
  const [activeTab, setActiveTab] = useState<'talents' | 'career' | 'parent'>('talents');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<{ coachCompleted: boolean; testCompleted: boolean; sessionId: string | null } | null>(null);
  const { data: session } = authClient.useSession();

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      await authClient.signOut({
        fetchOptions: {
          onSuccess: () => {
            router.push('/');
            router.refresh();
          }
        }
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const checkProgressAndLoad = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        let targetSessionId = sessionId;

        // Если зашли в ЛК без параметров — проверяем авторизацию и прогресс
        if (!targetSessionId) {
          const progressRes = await fetch('/api/auth/progress');
          if (!progressRes.ok) {
            throw new Error('Ошибка проверки статуса авторизации');
          }
          const progressData = await progressRes.json();

          if (!progressData.authenticated) {
            router.push('/auth');
            return;
          }

          setProgress({
            coachCompleted: progressData.coachCompleted,
            testCompleted: progressData.testCompleted,
            sessionId: progressData.sessionId
          });

          if (!progressData.coachCompleted || !progressData.testCompleted) {
            setIsLoading(false);
            return;
          }

          targetSessionId = progressData.sessionId;
        }

        if (!targetSessionId) {
          throw new Error('Не удалось определить сессию пользователя');
        }

        // Загружаем отчёт по определенному sessionId
        const res = await fetch(`/api/v1/diagnostic/results?session_id=${targetSessionId}`);
        if (!res.ok) {
          throw new Error('Не удалось загрузить отчет. Возможно, результаты еще не готовы.');
        }
        const data = await res.json();
        const rawData = data.data || {};
        const sanitizedReport: ReportData = {
          studentName: rawData.studentName || 'Ученик',
          heroSummary: Array.isArray(rawData.heroSummary) ? rawData.heroSummary : (rawData.heroSummary ? [rawData.heroSummary] : []),
          personalityTraits: Array.isArray(rawData.personalityTraits) ? rawData.personalityTraits : [],
          riasecSummary: rawData.riasecSummary || '',
          riasecScores: rawData.riasecScores || {},
          strengths: Array.isArray(rawData.strengths) ? rawData.strengths : [],
          growthAreas: Array.isArray(rawData.growthAreas) ? rawData.growthAreas : [],
          coachSection: rawData.coachSection || {},
          professions: Array.isArray(rawData.professions) ? rawData.professions : []
        };
        setReport(sanitizedReport);
        setIsDemo(false);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Ошибка загрузки отчета');
      } finally {
        setIsLoading(false);
      }
    };

    checkProgressAndLoad();
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10">
        <div className="rounded-[32px] glass-card p-12 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <Loader2 className="h-16 w-16 animate-spin text-[#3B82F6]" />
            <div className="space-y-3">
              <h1 className="text-2xl font-bold font-sans text-white">Генерация карты призвания</h1>
              <p className="max-w-md text-sm text-[#7A8A9E] leading-relaxed">
                Пожалуйста, подождите. ИИ-эксперт анализирует ваши ответы, сопоставляет интересы с базой профессий и формулирует персональные рекомендации. Это займет около 15 секунд...
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10">
        <div className="rounded-[32px] glass-card p-10 text-center border border-red-500/20 bg-[#080C14]/85">
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <AlertCircle className="h-16 w-16 text-red-500" />
            <div className="space-y-3">
              <h1 className="text-xl font-bold text-white font-sans">Не удалось загрузить отчет</h1>
              <p className="max-w-md text-sm text-[#7A8A9E] leading-relaxed">
                {error}
              </p>
            </div>
            <Link
              href="/"
              className="cta-glass h-12 px-6 text-sm"
            >
              На главную
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (progress && (!progress.coachCompleted || !progress.testCompleted)) {
    const userName = session?.user?.name || 'Пользователь';
    const userPhone = (session?.user as any)?.phone || 'Телефон не указан';
    
    // Вычисляем процент прогресса
    let totalProgress = 0;
    if (progress.coachCompleted) totalProgress += 50;
    if (progress.testCompleted) totalProgress += 50;

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
              <User className="h-7 w-7 text-[#3B82F6]" />
              Личный кабинет
            </h1>
            <p className="text-sm text-[#7A8A9E]">Управляйте вашим профилем и прогрессом диагностики</p>
          </div>

          {/* Profile info */}
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="space-y-1">
              <div className="text-xs text-[#7A8A9E] font-medium font-sans">Вы вошли как:</div>
              <div className="text-sm font-bold text-white font-sans">{userName}</div>
              <div className="text-xs text-[#7A8A9E] flex items-center gap-1">
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
              <span className="text-[#7A8A9E]">Ваш прогресс диагностики</span>
              <span className="text-[#3B82F6]">{totalProgress}%</span>
            </div>
            <div className="w-full h-2.5 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#3B82F6] to-[#C4A484] transition-all duration-500" 
                style={{ width: `${totalProgress}%` }}
              />
            </div>
          </div>

          {/* Step Cards with premium animations and brand colors */}
          <div className="space-y-5">
            
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
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden ${
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
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                    progress.coachCompleted 
                      ? 'bg-green-500/15 text-green-400' 
                      : 'bg-[#C4A484]/15 text-[#C4A484] animate-pulse'
                  }`}>
                    Этап 1: Коуч-сессия
                  </span>
                  {progress.coachCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Диалог с наставником Романом</h3>
                <p className="text-xs text-[#7A8A9E] leading-relaxed">
                  Персональный интерактивный чат по методологиям CLEAR и WOOP для выявления ваших целей, сильных качеств и эмоций.
                </p>
              </div>
              
              <div className="relative z-10 self-stretch md:self-auto shrink-0">
                {progress.coachCompleted ? (
                  <Link
                    href="/coach"
                    className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans transition duration-300 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10"
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
                      className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#C4A484] hover:bg-[#b09071] text-[#080C14] text-xs font-bold font-sans transition duration-300"
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
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden ${
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
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                    progress.testCompleted 
                      ? 'bg-green-500/15 text-green-400' 
                      : (progress.coachCompleted 
                          ? 'bg-[#3B82F6]/15 text-[#3B82F6] animate-pulse' 
                          : 'bg-white/5 text-slate-500'
                        )
                  }`}>
                    Этап 2: Тестирование
                  </span>
                  {progress.testCompleted && <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />}
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Интерактивные опросники способностей</h3>
                <p className="text-xs text-[#7A8A9E] leading-relaxed">
                  Определение вашего типа мышления (RIASEC), командных ролей, ценностей и ведущих интересов по интерактивной шкале.
                </p>
              </div>
              
              <div className="relative z-10 self-stretch md:self-auto shrink-0">
                {!progress.coachCompleted ? (
                  <div className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed">
                    <Lock className="h-3.5 w-3.5" />
                    <span>Заблокировано</span>
                  </div>
                ) : progress.testCompleted ? (
                  <Link
                    href="/assessment"
                    className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans transition duration-300 bg-white/5 hover:bg-white/10 text-white/90 border border-white/10"
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
                      className="flex items-center justify-center gap-1.5 px-5 py-3 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-xs font-bold font-sans transition duration-300"
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
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative overflow-hidden ${
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
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full tracking-wide ${
                    (progress.coachCompleted && progress.testCompleted)
                      ? 'bg-[#C4A484]/20 text-[#EAD5C3] animate-pulse'
                      : 'bg-white/5 text-slate-500'
                  }`}>
                    Этап 3: Результат
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white font-sans">Итоговый ИИ-отчёт и Карта Призвания</h3>
                <p className="text-xs text-[#7A8A9E] leading-relaxed">
                  Полная расшифровка вашего психологического портрета, 3 рекомендуемые ИИ профессии и советы по развитию сильных сторон.
                </p>
              </div>
              
              <div className="relative z-10 self-stretch md:self-auto shrink-0">
                {!(progress.coachCompleted && progress.testCompleted) ? (
                  <div className="flex items-center justify-center gap-1.5 px-5 py-3 rounded-xl text-xs font-bold font-sans bg-white/5 border border-white/5 text-slate-500 cursor-not-allowed">
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

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #000000 !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            display: block !important;
            padding: 20mm !important;
          }
          .print-card {
            border: 1px solid #e6dac3 !important;
            background: #fbf9f6 !important;
            padding: 1.5rem !important;
            border-radius: 12px !important;
            page-break-inside: avoid !important;
            margin-bottom: 1.5rem !important;
          }
        }
      `}} />

      {/* ЭКРАННАЯ ВЕРСИЯ */}
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 relative overflow-hidden print:hidden pt-28">
        
        <div className="relative z-10">
          {/* Шапка отчета */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#3B82F6] font-sans">
                <Award className="h-3.5 w-3.5 text-[#3B82F6]" />
                Итоговый отчет
              </div>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight font-sans">
                Карта талантов: {report.studentName}
              </h1>
              <p className="text-xs text-[#7A8A9E]">
                Диагностика успешно пройдена · Отчет подготовлен нейросетевыми алгоритмами
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="cta-glass h-12 px-6 text-sm"
              >
                <Download className="h-4 w-4" />
                Распечатать / PDF
              </button>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06]"
              >
                <ArrowLeft className="h-4 w-4" />
                На главную
              </Link>
            </div>
          </div>

          {isDemo && (
            <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4.5 text-amber-900 backdrop-blur-sm">
              <AlertCircle className="h-5 w-5 mt-0.5 shrink-0 text-amber-700" />
              <p className="text-sm leading-relaxed font-sans">
                Диагностика не пройдена или результаты устарели. Сейчас вы видите <span className="font-semibold">демо-отчет</span> по умолчанию. 
                Пройдите диагностику, чтобы сгенерировать собственный аналитический отчет.
              </p>
            </div>
          )}

          {/* Переключатель вкладок */}
          <div className="flex border-b border-white/5 mb-8 gap-6 md:gap-8 overflow-x-auto pb-px">
            <button
              onClick={() => setActiveTab('talents')}
              className={`pb-4 text-sm md:text-base font-bold transition relative whitespace-nowrap ${
                activeTab === 'talents' ? 'text-white border-b-2 border-[#3B82F6]' : 'text-[#7A8A9E] hover:text-white'
              }`}
            >
              Карта талантов
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`pb-4 text-sm md:text-base font-bold transition relative whitespace-nowrap ${
                activeTab === 'career' ? 'text-white border-b-2 border-[#3B82F6]' : 'text-[#7A8A9E] hover:text-white'
              }`}
            >
              Карьерные рекомендации
            </button>
          </div>

          {/* Контент вкладок */}
          <div className="mt-8">
            {activeTab === 'talents' && (
              <div className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
                
                {/* Левая колонка */}
                <div className="space-y-8">
                  {/* Главное резюме потенциала */}
                  <div className="glass-card rounded-[28px] p-8">
                    <h2 className="text-lg font-bold text-white mb-4">Главное резюме потенциала</h2>
                    <div className="space-y-3 text-[#7A8A9E] text-base leading-relaxed">
                      {report.heroSummary.map((sentence, idx) => (
                        <p key={idx}>{sentence}</p>
                      ))}
                    </div>
                  </div>

                  {/* Блок Нейрокоуча (Качественные данные) */}
                  {report.coachSection && (
                    <div className="glass-card rounded-[28px] p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Brain className="h-5 w-5 text-[var(--accent-svg-1)]" />
                        <h2 className="text-lg font-bold text-white">
                          {report.coachSection.deepGoal ? 'Коучинговый Манифест целей и Идентичности' : 'Качественный анализ диалога (Нейрокоуч)'}
                        </h2>
                      </div>
                      <div className="space-y-4">
                        {/* Экспресс-коучинг */}
                        {report.coachSection.dreams && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">Мечты и устремления</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.dreams}</p>
                          </div>
                        )}
                        {report.coachSection.idols && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">Ролевые модели и кумиры</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.idols}</p>
                          </div>
                        )}
                        {report.coachSection.values && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">Ключевые ценности</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.values}</p>
                          </div>
                        )}

                        {/* Глубокий коучинг */}
                        {report.coachSection.deepGoal && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">🎯 Мой запрос / Цель</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.deepGoal}</p>
                          </div>
                        )}
                        {report.coachSection.deepOutcome && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">🌟 Ожидаемый результат</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.deepOutcome}</p>
                          </div>
                        )}
                        {report.coachSection.deepEmotions && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">🔥 Эмоциональный отклик</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.deepEmotions}</p>
                          </div>
                        )}
                        {report.coachSection.deepIdentity && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">👑 Моя идентичность</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed font-bold italic">{report.coachSection.deepIdentity}</p>
                          </div>
                        )}
                        {report.coachSection.deepActions && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">🚀 План действий и навыки</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed whitespace-pre-wrap">{report.coachSection.deepActions}</p>
                          </div>
                        )}
                        {report.coachSection.deepFirstStep && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[var(--accent-svg-1)] mb-1">⚡ Первый шаг за 2 минуты</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed font-bold">{report.coachSection.deepFirstStep}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Правая колонка */}
                <div className="space-y-8">
                  {/* Радар талантов */}
                  <RadarChart scores={report.riasecScores} />

                  {/* Big Five */}
                  {report.personalityTraits && report.personalityTraits.length > 0 && (
                    <div className="glass-card rounded-[28px] p-8">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-5 w-5 text-[#3B82F6]" />
                        <h2 className="text-lg font-bold text-white">Личностные особенности (Big Five)</h2>
                      </div>
                      <div className="space-y-4">
                        {report.personalityTraits.map((trait) => (
                          <div key={trait.name} className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-bold text-white">
                              <span>{trait.name}</span>
                              <span className="text-[#3B82F6]">{trait.score}%</span>
                            </div>
                            <div className="h-1.5 bg-black/20 rounded-full overflow-hidden">
                              <div className="h-full bg-[#3B82F6] rounded-full" style={{ width: `${trait.score}%` }} />
                            </div>
                            <p className="text-[11px] text-[#7A8A9E] leading-relaxed">{trait.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Силы и Зоны развития */}
                  <div className="glass-card rounded-[28px] p-8">
                    <h2 className="text-lg font-bold text-white mb-4">Сильные стороны и зоны развития</h2>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">Сильные стороны</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-[#7A8A9E]">
                          {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-[#3B82F6] mb-2">Зоны развития</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-[#7A8A9E]">
                          {report.growthAreas.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            )}

            {activeTab === 'career' && (
              <div className="space-y-8">
                {/* RIASEC Summary */}
                {report.riasecSummary && (
                  <div className="glass-card rounded-[28px] p-8">
                    <div className="flex items-center gap-3 mb-4">
                      <Compass className="h-5 w-5 text-[#3B82F6]" />
                      <h2 className="text-lg font-bold text-white">Профессиональные интересы (RIASEC)</h2>
                    </div>
                    <p className="text-[#7A8A9E] text-sm leading-relaxed">{report.riasecSummary}</p>
                  </div>
                )}

                {/* Рекомендуемые профессии */}
                <div className="glass-card rounded-[28px] p-8">
                  <h2 className="text-lg font-bold text-white mb-6">Подходящие профессии для развития</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {report.professions.map((prof, idx) => (
                      <RpgProfessionCard key={idx} name={prof.name} score={prof.score} why={prof.why} />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* ВЕРСИЯ ДЛЯ ПЕЧАТИ */}
      <div className="hidden print-container">
        <div className="print-header">
          <h1>Карта талантов: {report.studentName}</h1>
          <p>Интерактивная диагностика потенциала «МоёПризвание»</p>
        </div>
        
        <div className="print-card">
          <h2>Резюме потенциала</h2>
          {report.heroSummary.map((s, idx) => <p key={idx}>{s}</p>)}
        </div>

        {report.coachSection && (
          <div className="print-card">
            <h2>Анализ диалога с коучем</h2>
            {report.coachSection.dreams && report.coachSection.dreams !== 'Не указано' && (
              <>
                <p><strong>Мечты:</strong> {report.coachSection.dreams}</p>
                <p><strong>Кумиры:</strong> {report.coachSection.idols}</p>
                <p><strong>Ценности:</strong> {report.coachSection.values}</p>
              </>
            )}
            {report.coachSection.deepGoal && (
              <>
                <p><strong>Мой запрос / Цель:</strong> {report.coachSection.deepGoal}</p>
                <p><strong>Ожидаемый результат:</strong> {report.coachSection.deepOutcome}</p>
                <p><strong>Эмоциональный отклик:</strong> {report.coachSection.deepEmotions}</p>
                <p><strong>Моя идентичность:</strong> {report.coachSection.deepIdentity}</p>
                <p><strong>План действий:</strong> {report.coachSection.deepActions}</p>
                <p><strong>Первый шаг (2 минуты):</strong> {report.coachSection.deepFirstStep}</p>
              </>
            )}
          </div>
        )}

        {report.riasecSummary && (
          <div className="print-card">
            <h2>Профессиональные интересы (RIASEC)</h2>
            <p>{report.riasecSummary}</p>
          </div>
        )}

        <div className="print-card">
          <h2>Сильные стороны</h2>
          <ul>{report.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
          <h2>Зоны развития</h2>
          <ul>{report.growthAreas.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </div>

        <div className="print-card">
          <h2>Рекомендуемые профессии</h2>
          {report.professions.map((p, idx) => (
            <div key={idx} style={{ marginBottom: '1rem' }}>
              <strong>{p.name} (Совпадение {p.score}%)</strong>
              <p>{p.why}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function ReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-[#3B82F6]" />
      </div>
    }>
      <ReportPageContent />
    </Suspense>
  );
}
