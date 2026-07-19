'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Compass, Sparkles, Award, RefreshCw, AlertCircle, ArrowLeft, Download, Loader2, ShieldCheck, Clock, LogOut, CheckCircle2, Lock, ChevronRight, Phone, Send, User, TrendingUp, Target, Gauge, Heart } from 'lucide-react';
import { authClient } from '../lib/auth-client';
import { motion } from 'framer-motion';
import RpgProfessionCard from '../components/report/RpgProfessionCard';
import RadarChart from '../components/report/RadarChart';
import CabinetProgress from '../components/report/CabinetProgress';
import SkillFormulaCard from '../components/report/SkillFormulaCard';
import ProfileSummaryHeader from '../components/report/ProfileSummaryHeader';
import ValueBars from '../components/report/ValueBars';
import DeepSessionCard, { type DeepSessionData } from '../components/report/DeepSessionCard';

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
  hollandCode?: string;
  strengths: string[];
  signatureStrengths?: { code: string; nameRu: string; description: string }[];
  growthAreas: string[];
  consistencyLevel?: 'high' | 'medium' | 'low';
  archetype?: { nameRu: string; superpower: string; evidence?: string[] } | null;
  innerConflicts?: { title: string; text: string; testFact?: string; coachFact?: string }[];
  successFormula?: { skills: { code: string; nameRu: string; evidence: string }[]; applications: string[] };
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
  /** Топ-3 ведущие ценности PVQ Шварца (названия) — для бейджа в шапке профиля. */
  topValues?: string[];
  /** Те же топ-ценности со скорами 1-5 — для горизонтальных баров ValueBars. */
  topValueScores?: { nameRu: string; score: number }[];
  /** Субшкалы логического теста ICAR (verbal/numeric/spatial), каждая 0-3. */
  icarSubscales?: Record<string, number>;
  /** Раздел "Глубинная сессия" — присутствует только если пройдена DEEP-сессия коучинга. */
  deepSession?: DeepSessionData | null;
  /** Заполненность 8-слойного цифрового профиля (0-1 по каждому слою) — из DigitalProfile.summary. */
  profileCoverage?: Record<string, number>;
  /** Grit / Growth Mindset / TEIQue-SF (1-5) — короткие валидные шкалы теста "Внутренний компас". */
  innerCompass?: { grit?: number; mindsetGrowth?: number; teiqueSelfAwareness?: number; teiqueSelfRegulation?: number };
  /** Контекстные поля (1-5) из теста "Карта ресурсов". */
  resourceMap?: Record<string, number>;
  /** docs/20 (4a): поля, что собирались коучем, но не долетали до отчёта. */
  methodologyProfile?: {
    belbin?: { leader?: number; doer?: number; creator?: number; peacemaker?: number };
    savickas?: { concern?: number; control?: number; curiosity?: number; confidence?: number };
    antiInterests?: string[];
    hobbies?: string[];
    procrastination?: number;
  };
};

const ICAR_SUBSCALE_LABELS: Record<string, string> = {
  verbal: 'Вербальная',
  numeric: 'Числовая',
  spatial: 'Пространственная'
};

const INNER_COMPASS_LABELS: Record<string, string> = {
  grit: 'Настойчивость (Grit)',
  mindsetGrowth: 'Установка на рост',
  teiqueSelfAwareness: 'Осознанность эмоций',
  teiqueSelfRegulation: 'Саморегуляция эмоций'
};

const BELBIN_LABELS: Record<string, string> = {
  leader: 'Координатор / лидер',
  doer: 'Исполнитель / реализатор',
  creator: 'Генератор идей',
  peacemaker: 'Миротворец / командный игрок'
};

const SAVICKAS_LABELS: Record<string, string> = {
  concern: 'Забота о будущем (Concern)',
  control: 'Контроль над выбором (Control)',
  curiosity: 'Любопытство к вариантам (Curiosity)',
  confidence: 'Уверенность в себе (Confidence)'
};

const RESOURCE_MAP_LABELS: Record<string, string> = {
  familyPressure: 'Свобода от давления ожиданий семьи',
  familyFinance: 'Финансовая опора семьи',
  mobility: 'Готовность к переезду ради учёбы/работы',
  health: 'Отсутствие ограничений по здоровью',
  educationEnvAvail: 'Доступность нужной среды рядом',
  careerReadiness: 'Готовность выбирать уже сейчас',
  digitalDivide: 'Доступ к нужным цифровым инструментам'
};

const PROFILE_COVERAGE_LABELS: Record<string, string> = {
  interests: 'Интересы и склонности',
  personality: 'Личность и трейты',
  strengths: 'Сильные стороны (VIA)',
  cognitive: 'Когнитивный профиль',
  motivation: 'Мотивация и ценности',
  social: 'Социальное взаимодействие',
  behavior: 'Поведенческие паттерны',
  context: 'Контекст и опоры'
};

const defaultReport: ReportData = {
  studentName: 'Демо-профиль',
  heroSummary: [
    'Выраженное сочетание аналитического мышления и творческого потенциала.',
    'Профиль указывает на склонность к решению концептуальных задач на стыке технологий и дизайна.'
  ],
  riasecScores: { R: 60, I: 85, A: 80, S: 50, E: 45, C: 30 },
  hollandCode: 'IAR',
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
  signatureStrengths: [
    { code: 'creativity', nameRu: 'Креативность', description: 'Находит нестандартные решения там, где другие видят только один путь.' },
    { code: 'curiosity', nameRu: 'Любознательность', description: 'Задаёт вопросы «а что если» чаще сверстников и любит копать глубже.' },
    { code: 'judgment', nameRu: 'Критическое мышление', description: 'Прежде чем сделать вывод, взвешивает разные точки зрения.' },
    { code: 'perspective', nameRu: 'Мудрость перспективы', description: 'К нему часто обращаются за советом — умеет посмотреть на ситуацию со стороны.' },
    { code: 'social_intelligence', nameRu: 'Социальный интеллект', description: 'Тонко считывает настроение и мотивы людей вокруг.' }
  ],
  growthAreas: [
    'Переход от генерации концептов к практическому программированию и сборке.',
    'Работа в неопределенных условиях без готовых шаблонов.',
    'Развитие навыков планирования.'
  ],
  successFormula: {
    skills: [
      { code: 'analytics', nameRu: 'Аналитика', evidence: 'по результатам логического блока (ICAR) и исследовательского интереса (RIASEC)' },
      { code: 'creativity', nameRu: 'Креативность', evidence: 'по артистическому интересу (RIASEC), открытости новому (Big Five) и творческой силе характера (VIA)' },
      { code: 'empathy', nameRu: 'Эмпатия', evidence: 'по доброжелательности характера (Big Five) и силам заботы о людях (VIA)' }
    ],
    applications: ['Аналитика данных', 'Дизайн', 'UX-исследования', 'Продуктовый менеджмент']
  },
  coachSection: {
    dreams: 'Мечтает разрабатывать цифровые продукты, приносящие пользу обществу.',
    idols: 'Вдохновляется инноваторами и создателями культовых технологических решений.',
    values: 'Главная ценность — свобода самовыражения и возможность созидать новые системы.'
  },
  topValues: ['Самостоятельность', 'Достижения', 'Стимуляция'],
  topValueScores: [
    { nameRu: 'Самостоятельность', score: 4.6 },
    { nameRu: 'Достижения', score: 4.3 },
    { nameRu: 'Стимуляция', score: 4.0 }
  ],
  icarSubscales: { verbal: 3, numeric: 2, spatial: 3 },
  deepSession: null,
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
        const sanitizeTraitName = (name: string): string => {
          const map: Record<string, string> = {
            'C_bigfive': 'Организованность и дисциплина',
            'E_bigfive': 'Общительность и энергетика',
            'A_bigfive': 'Эмпатия и отзывчивость',
            'O_bigfive': 'Открытость новому',
            'N_bigfive': 'Эмоциональная устойчивость',
            'Openness': 'Открытость новому',
            'Conscientiousness': 'Организованность и дисциплина',
            'Extraversion': 'Общительность и энергетика',
            'Agreeableness': 'Эмпатия и отзывчивость',
            'Stability': 'Эмоциональная устойчивость',
            'O': 'Открытость новому',
            'C': 'Организованность и дисциплина',
            'E': 'Общительность и энергетика',
            'A': 'Эмпатия и отзывчивость',
            'N': 'Эмоциональная устойчивость',
          };
          return map[name.trim()] || name;
        };

        const rawTraits = Array.isArray(rawData.personalityTraits) ? rawData.personalityTraits : [];
        const sanitizedTraits = rawTraits.map((t: any) => ({
          name: sanitizeTraitName(t.name || ''),
          score: typeof t.score === 'number' ? t.score : 50,
          description: t.description && t.description !== 'Личностная черта.' 
            ? t.description 
            : 'Характеризует индивидуальные особенности поведения и мышления.'
        }));

        const sanitizedReport: ReportData = {
          studentName: rawData.studentName || 'Ученик',
          heroSummary: Array.isArray(rawData.heroSummary) ? rawData.heroSummary : (rawData.heroSummary ? [rawData.heroSummary] : []),
          personalityTraits: sanitizedTraits,
          riasecSummary: rawData.riasecSummary || '',
          riasecScores: rawData.riasecScores || {},
          hollandCode: rawData.hollandCode || undefined,
          strengths: Array.isArray(rawData.strengths) ? rawData.strengths : [],
          signatureStrengths: Array.isArray(rawData.signatureStrengths) ? rawData.signatureStrengths : [],
          growthAreas: Array.isArray(rawData.growthAreas) ? rawData.growthAreas : [],
          consistencyLevel: rawData.consistencyLevel,
          archetype: rawData.archetype && rawData.archetype.nameRu ? rawData.archetype : null,
          innerConflicts: Array.isArray(rawData.innerConflicts) ? rawData.innerConflicts : [],
          successFormula: rawData.successFormula && Array.isArray(rawData.successFormula.skills)
            ? rawData.successFormula
            : undefined,
          coachSection: rawData.coachSection || {},
          professions: Array.isArray(rawData.professions) ? rawData.professions : [],
          topValues: Array.isArray(rawData.topValues) ? rawData.topValues : undefined,
          topValueScores: Array.isArray(rawData.topValueScores) ? rawData.topValueScores : undefined,
          icarSubscales: rawData.icarSubscales && typeof rawData.icarSubscales === 'object' ? rawData.icarSubscales : undefined,
          deepSession: rawData.deepSession && typeof rawData.deepSession === 'object' ? rawData.deepSession : null,
          profileCoverage: rawData.profileCoverage && typeof rawData.profileCoverage === 'object' ? rawData.profileCoverage : undefined,
          innerCompass: rawData.innerCompass && typeof rawData.innerCompass === 'object' ? rawData.innerCompass : undefined,
          resourceMap: rawData.resourceMap && typeof rawData.resourceMap === 'object' ? rawData.resourceMap : undefined,
          methodologyProfile: rawData.methodologyProfile && typeof rawData.methodologyProfile === 'object' ? rawData.methodologyProfile : undefined
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
    let totalProgress = 0;
    if (progress.coachCompleted) totalProgress += 50;
    if (progress.testCompleted) totalProgress += 50;

    return (
      <CabinetProgress
        progress={progress}
        session={session}
        handleLogout={handleLogout}
        totalProgress={totalProgress}
      />
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
                  {/* Шапка-визитка профиля: код Холланда, ключевая сила, ведущая ценность */}
                  <ProfileSummaryHeader
                    hollandCode={report.hollandCode}
                    topSignatureStrength={report.signatureStrengths?.[0]}
                    topValue={report.topValues?.[0]}
                  />

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
                        <Brain className="h-5 w-5 text-[#3B82F6] theme-accent-text" />
                        <h2 className="text-lg font-bold text-white">
                          {report.coachSection.deepGoal ? 'Коучинговый Манифест целей и Идентичности' : 'Качественный анализ диалога (Нейрокоуч)'}
                        </h2>
                      </div>
                      <div className="space-y-4">
                        {/* Экспресс-коучинг */}
                        {report.coachSection?.dreams && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">Мечты и устремления</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-medium">{report.coachSection.dreams.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.idols && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">Ролевые модели и кумиры</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-medium">{report.coachSection.idols.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.values && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">Ключевые ценности</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-medium">{report.coachSection.values.trim()}</p>
                          </div>
                        )}

                        {/* Глубокий коучинг */}
                        {report.coachSection?.deepGoal && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">🎯 Мой запрос / Цель</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-medium">{report.coachSection.deepGoal.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.deepOutcome && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">🌟 Ожидаемый результат</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-medium">{report.coachSection.deepOutcome.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.deepEmotions && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">🔥 Эмоциональный отклик</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-medium">{report.coachSection.deepEmotions.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.deepIdentity && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">👑 Моя идентичность</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-bold italic">{report.coachSection.deepIdentity.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.deepActions && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">🚀 План действий и навыки</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text whitespace-pre-wrap font-medium">{report.coachSection.deepActions.trim()}</p>
                          </div>
                        )}
                        {report.coachSection?.deepFirstStep && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl theme-subcard">
                            <h4 className="text-xs uppercase tracking-wider font-extrabold text-[#3B82F6] theme-subcard-title mb-1.5 font-sans">⚡ Первый шаг за 2 минуты</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed theme-subcard-text font-bold">{report.coachSection.deepFirstStep.trim()}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Глубинная сессия (только если пройдена DEEP-сессия коучинга) */}
                  <DeepSessionCard deepSession={report.deepSession} />
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

                  {/* Артефакты силы (VIA Youth — топ-5 сигнатурных сил характера) */}
                  {report.signatureStrengths && report.signatureStrengths.length > 0 && (
                    <div className="glass-card rounded-[28px] p-8">
                      <h2 className="text-lg font-bold text-white mb-1">Артефакты силы</h2>
                      <p className="text-xs text-[#7A8A9E] mb-4">Топ-5 сильных сторон характера по методике VIA Youth Survey</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {report.signatureStrengths.map((s, i) => (
                          <div key={s.code || i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <div className="flex items-center gap-2 mb-1">
                              <Award className="w-4 h-4 text-[#EAB308]" />
                              <span className="text-sm font-bold text-white">{s.nameRu}</span>
                            </div>
                            <p className="text-[11px] text-[#7A8A9E] leading-relaxed">{s.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Метафора роли — вычислена детерминированно из VIA + PVQ, показывается
                      как отдельный мотивирующий блок, НЕ как психологический диагноз или
                      тип личности (методологический аудит: архетипы Юнга не валидированы
                      психометрически даже при детерминированном подсчёте). */}
                  {report.archetype && (
                    <div className="glass-card rounded-[28px] p-8 border border-[#8b5cf6]/25">
                      <div className="flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-[#8b5cf6]" />
                        <span className="text-[10px] uppercase tracking-widest font-extrabold text-[#8b5cf6]">Твоя метафора роли</span>
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">{report.archetype.nameRu}</h2>
                      <p className="text-sm text-[#93A3B8] leading-relaxed mb-3">
                        Твоя суперсила — {report.archetype.superpower}
                      </p>
                      <p className="text-[10px] text-[#7A8A9E]/80 leading-relaxed mb-3">
                        Это образный ярлык поверх твоих результатов VIA и ценностей — способ увидеть себя в истории, а не психологический диагноз или тип личности.
                      </p>
                      {report.archetype.evidence && report.archetype.evidence.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {report.archetype.evidence.map((e, i) => (
                            <span key={i} className="text-[10px] font-semibold text-[#8b5cf6] bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-full px-2.5 py-1">
                              {e}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Индекс согласованности: внутренние противоречия или бейдж достоверности */}
                  {report.innerConflicts && report.innerConflicts.length > 0 ? (
                    <div className="glass-card rounded-[28px] p-8 border border-amber-500/20">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertCircle className="w-4 h-4 text-amber-400" />
                        <h2 className="text-lg font-bold text-white">Внутренние противоречия — твои скрытые ресурсы</h2>
                      </div>
                      <p className="text-xs text-[#7A8A9E] mb-4">Тесты и разговор с Романом показали разные грани — это не ошибка, а повод разобраться глубже.</p>
                      <div className="space-y-3">
                        {report.innerConflicts.map((c, i) => (
                          <div key={i} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm font-bold text-white mb-2">{c.title}</p>
                            {(c.testFact || c.coachFact) && (
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                                {c.testFact && (
                                  <div className="rounded-xl border border-[#3B82F6]/20 bg-[#3B82F6]/5 p-2.5">
                                    <span className="block text-[9px] uppercase tracking-wider font-extrabold text-[#3B82F6] mb-0.5">Тесты</span>
                                    <span className="text-[11px] text-[#93A3B8] leading-snug">{c.testFact}</span>
                                  </div>
                                )}
                                {c.coachFact && (
                                  <div className="rounded-xl border border-[#C4A484]/20 bg-[#C4A484]/5 p-2.5">
                                    <span className="block text-[9px] uppercase tracking-wider font-extrabold text-[#C4A484] mb-0.5">Разговор с Романом</span>
                                    <span className="text-[11px] text-[#93A3B8] leading-snug">{c.coachFact}</span>
                                  </div>
                                )}
                              </div>
                            )}
                            <p className="text-[11px] text-[#7A8A9E] leading-relaxed">{c.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : report.consistencyLevel === 'high' && (
                    <div className="glass-card rounded-[28px] p-4 flex items-center gap-2 border border-emerald-500/20">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-400">Высокая достоверность профиля</span>
                      <span className="text-[11px] text-[#7A8A9E]">— данные тестов и разговора с Романом совпадают</span>
                    </div>
                  )}

                  {/* Силы и Зоны развития */}
                  <div className="glass-card rounded-[28px] p-8">
                    <h2 className="text-lg font-bold text-white mb-4">Сильные стороны и зоны развития</h2>
                    <div className="space-y-5">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-3">Сильные стороны</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {report.strengths.map((s, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-xl border border-emerald-500/15 bg-emerald-500/5 p-3">
                              <TrendingUp className="h-3.5 w-3.5 mt-0.5 shrink-0 text-emerald-400" />
                              <span className="text-xs text-[#7A8A9E] leading-relaxed">{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-[#3B82F6] mb-3">Зоны развития</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {report.growthAreas.map((g, i) => (
                            <div key={i} className="flex items-start gap-2 rounded-xl border border-[#3B82F6]/15 bg-[#3B82F6]/5 p-3">
                              <Target className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[#3B82F6]" />
                              <span className="text-xs text-[#7A8A9E] leading-relaxed">{g}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Ведущие ценности PVQ Шварца — горизонтальные бары */}
                  {report.topValueScores && report.topValueScores.length > 0 && (
                    <ValueBars
                      title="Ведущие ценности"
                      subtitle="Топ-3 ценности по методике PVQ Шварца"
                      icon={<Heart className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={report.topValueScores.map((v) => ({
                        label: v.nameRu,
                        value: v.score,
                        max: 5,
                        valueLabel: `${v.score.toFixed(1)}/5`
                      }))}
                    />
                  )}

                  {/* Субшкалы логического теста ICAR — горизонтальные бары */}
                  {report.icarSubscales && Object.keys(report.icarSubscales).length > 0 && (
                    <ValueBars
                      title="Логическое мышление (ICAR)"
                      subtitle="Готовность по субшкалам: вербальная, числовая, пространственная"
                      icon={<Gauge className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={Object.entries(report.icarSubscales).map(([key, value]) => ({
                        label: ICAR_SUBSCALE_LABELS[key] || key,
                        value,
                        max: 3
                      }))}
                    />
                  )}

                  {/* "Внутренний компас" — Grit/Mindset/TEIQue-SF, короткие валидные шкалы
                      вместо оценки этих же конструктов ИИ-коучем "на глазок" по диалогу. */}
                  {report.innerCompass && Object.values(report.innerCompass).some((v) => typeof v === 'number') && (
                    <ValueBars
                      title="Внутренний компас"
                      subtitle="Настойчивость, установка на рост и эмоциональный интеллект"
                      icon={<Compass className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={Object.entries(report.innerCompass)
                        .filter(([, value]) => typeof value === 'number')
                        .map(([key, value]) => ({
                          label: INNER_COMPASS_LABELS[key] || key,
                          value: value as number,
                          max: 5,
                          valueLabel: `${(value as number).toFixed(1)}/5`
                        }))}
                    />
                  )}

                  {/* "Карта ресурсов" — контекстные опоры (семья, среда, доступ), собранные
                      коротким самоотчётом, а не додуманные из диалога с коучем. */}
                  {report.resourceMap && Object.keys(report.resourceMap).length > 0 && (
                    <ValueBars
                      title="Карта ресурсов"
                      subtitle="Опоры и ограничения вокруг тебя — не диагноз, а контекст для рекомендаций"
                      icon={<Target className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={Object.entries(report.resourceMap).map(([key, value]) => ({
                        label: RESOURCE_MAP_LABELS[key] || key,
                        value,
                        max: 5,
                        valueLabel: `${value.toFixed(1)}/5`
                      }))}
                    />
                  )}

                  {/* Заполненность 8-слойного цифрового профиля (DigitalProfile.summary,
                      см. app/lib/profile/layers.ts) — раньше считалась и нигде не показывалась. */}
                  {report.profileCoverage && Object.keys(report.profileCoverage).length > 0 && (
                    <ValueBars
                      title="Карта заполненности профиля"
                      subtitle="Насколько подробно собран каждый слой цифрового профиля"
                      icon={<Gauge className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={Object.entries(report.profileCoverage)
                        .filter(([key]) => key !== 'overall' && PROFILE_COVERAGE_LABELS[key])
                        .map(([key, value]) => ({
                          label: PROFILE_COVERAGE_LABELS[key] || key,
                          value: Math.round(value * 100),
                          max: 100,
                          valueLabel: `${Math.round(value * 100)}%`
                        }))}
                    />
                  )}

                  {/* docs/20 (4a): роль в команде по Белбину — раньше собиралась
                      коучем, но не долетала до отчёта. Рисуем только непустые шкалы. */}
                  {report.methodologyProfile?.belbin &&
                    Object.values(report.methodologyProfile.belbin).some((v) => typeof v === 'number' && v > 0) && (
                    <ValueBars
                      title="Роль в команде (Белбин)"
                      subtitle="Как ты естественнее всего проявляешь себя в совместной работе"
                      icon={<User className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={Object.entries(report.methodologyProfile.belbin)
                        .filter(([, value]) => typeof value === 'number' && value > 0)
                        .map(([key, value]) => ({
                          label: BELBIN_LABELS[key] || key,
                          value: value as number,
                          max: 100,
                          valueLabel: `${Math.round(value as number)}%`
                        }))}
                    />
                  )}

                  {/* docs/20 (4a): карьерная адаптивность по Савикасу. */}
                  {report.methodologyProfile?.savickas &&
                    Object.values(report.methodologyProfile.savickas).some((v) => typeof v === 'number' && v > 0) && (
                    <ValueBars
                      title="Карьерная адаптивность (Савикас)"
                      subtitle="Четыре ресурса, которые помогают уверенно строить свой путь"
                      icon={<TrendingUp className="h-5 w-5 text-[#3B82F6] theme-accent-text" />}
                      items={Object.entries(report.methodologyProfile.savickas)
                        .filter(([, value]) => typeof value === 'number' && value > 0)
                        .map(([key, value]) => ({
                          label: SAVICKAS_LABELS[key] || key,
                          value: value as number,
                          max: 100,
                          valueLabel: `${Math.round(value as number)}%`
                        }))}
                    />
                  )}

                  {/* docs/20 (4a): прокрастинация (шкала Лэй, 4-20) — раньше влияла
                      только на совет ИИ, сам балл не показывался. */}
                  {typeof report.methodologyProfile?.procrastination === 'number' && (
                    <div className="glass-card rounded-[28px] p-8">
                      <div className="flex items-center gap-3 mb-3">
                        <Clock className="h-5 w-5 text-[#3B82F6] theme-accent-text" />
                        <h2 className="text-lg font-bold text-white">Склонность к прокрастинации</h2>
                        <span className="ml-auto rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-bold text-[#3B82F6]">
                          {report.methodologyProfile.procrastination}/20
                        </span>
                      </div>
                      <p className="text-[#7A8A9E] text-sm leading-relaxed">
                        {report.methodologyProfile.procrastination <= 8
                          ? 'Низкая: ты обычно берёшься за дело без долгих раскачек — это сильная опора для любых целей.'
                          : report.methodologyProfile.procrastination <= 14
                          ? 'Умеренная: иногда старт даётся тяжело. Помогает правило «первого двухминутного шага» — начать с малого.'
                          : 'Заметная: откладывать бывает трудно преодолеть. Разбивай задачи на крошечные шаги и убирай отвлечения на старте — это тренируется.'}
                      </p>
                    </div>
                  )}

                  {/* docs/20 (4a): добровольные хобби и анти-интересы — качественные
                      сигналы интересов, собранные коучем. */}
                  {((report.methodologyProfile?.hobbies?.length ?? 0) > 0 ||
                    (report.methodologyProfile?.antiInterests?.length ?? 0) > 0) && (
                    <div className="glass-card rounded-[28px] p-8 space-y-5">
                      <div className="flex items-center gap-3">
                        <Heart className="h-5 w-5 text-[#3B82F6] theme-accent-text" />
                        <h2 className="text-lg font-bold text-white">Увлечения и анти-интересы</h2>
                      </div>
                      {(report.methodologyProfile?.hobbies?.length ?? 0) > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs uppercase tracking-widest font-extrabold text-[#7A8A9E]">Чем увлекаешься по своей воле</span>
                          <div className="flex flex-wrap gap-2">
                            {report.methodologyProfile!.hobbies!.map((h, i) => (
                              <span key={i} className="rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/10 px-3 py-1 text-xs font-semibold text-[#3B82F6]">
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {(report.methodologyProfile?.antiInterests?.length ?? 0) > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs uppercase tracking-widest font-extrabold text-[#7A8A9E]">Что точно не откликается</span>
                          <div className="flex flex-wrap gap-2">
                            {report.methodologyProfile!.antiInterests!.map((a, i) => (
                              <span key={i} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-[#7A8A9E]">
                                {a}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
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
                      {report.hollandCode && (
                        <span className="ml-auto rounded-full border border-[#3B82F6]/30 bg-[#3B82F6]/10 px-3 py-1 text-xs font-bold text-[#3B82F6]">
                          Твой код призвания: {report.hollandCode}
                        </span>
                      )}
                    </div>
                    <p className="text-[#7A8A9E] text-sm leading-relaxed">{report.riasecSummary}</p>
                  </div>
                )}

                {/* Формула успеха: переносимые компетенции вместо жёсткой привязки к профессии */}
                {report.successFormula && (
                  <SkillFormulaCard
                    skills={report.successFormula.skills}
                    applications={report.successFormula.applications}
                  />
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

        {report.deepSession && (
          <div className="print-card">
            <h2>Глубокая коуч сессия</h2>
            <p>{report.deepSession.synthesis}</p>
            {report.deepSession.goal && <p><strong>Цель:</strong> {report.deepSession.goal}</p>}
            {report.deepSession.identity && <p><strong>Идентичность:</strong> {report.deepSession.identity}</p>}
            {report.deepSession.firstStep && <p><strong>Первый шаг:</strong> {report.deepSession.firstStep}</p>}
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

        {report.topValueScores && report.topValueScores.length > 0 && (
          <div className="print-card">
            <h2>Ведущие ценности (PVQ Шварца)</h2>
            <ul>{report.topValueScores.map((v, i) => <li key={i}>{v.nameRu} — {v.score.toFixed(1)}/5</li>)}</ul>
          </div>
        )}

        {report.icarSubscales && Object.keys(report.icarSubscales).length > 0 && (
          <div className="print-card">
            <h2>Логическое мышление (ICAR)</h2>
            <ul>{Object.entries(report.icarSubscales).map(([key, value], i) => (
              <li key={i}>{ICAR_SUBSCALE_LABELS[key] || key} — {value}/3</li>
            ))}</ul>
          </div>
        )}

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
