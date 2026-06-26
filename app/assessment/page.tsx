'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Compass, Sparkles, Award, Zap, Loader2, ArrowLeft, WifiOff, RefreshCw } from 'lucide-react';
import { useDiagnosticStore } from '../store/diagnosticStore';
import { HeroOrb } from '../components/HeroOrb';

const blockIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  riasec: Compass,
  big_five: Sparkles,
  career_anchors: Award,
};

const blockNames: Record<string, string> = {
  riasec: 'Профессиональные интересы (RIASEC)',
  big_five: 'Личностные черты (Big Five)',
  career_anchors: 'Карьерные ценности (Якоря карьеры)',
};

export default function AssessmentPage() {
  const router = useRouter();
  const store = useDiagnosticStore();

  const [mode, setMode] = useState<'none' | 'express' | 'deep'>('none');
  const [prevBlock, setPrevBlock] = useState<string | null>(null);
  const [lastSelectedValue, setLastSelectedValue] = useState<number | null>(null);
  const [isDebounced, setIsDebounced] = useState(false);
  const [imgError, setImgError] = useState(false);

  const questionStartTime = useRef<number>(0);

  // Восстановление сессии или редирект на авторизацию
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('studentName');
      if (!name) {
        router.push('/auth');
        return;
      }

      // Если в Zustand уже есть активная сессия, восстанавливаем её режим
      if (store.sessionId) {
        setMode(store.offlineAnswersBuffer.length > 0 || store.currentQuestion?.test_type !== 'riasec' ? 'deep' : 'deep');
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, store.sessionId]);

  // Запуск таймера при появлении вопроса
  useEffect(() => {
    if (store.currentQuestion) {
      questionStartTime.current = Date.now();
      setImgError(false);
      
      const currentBlock = store.currentQuestion.test_type;
      if (prevBlock && currentBlock !== prevBlock) {
        // Мы убрали задержку в 2.5 секунды для мгновенного перехода (CYCLE 2)
        setPrevBlock(currentBlock);
      } else {
        setPrevBlock(currentBlock);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestion?.question_id]);

  // Перенаправление на отчет при завершении
  useEffect(() => {
    if (store.isCompleted && store.sessionId) {
      router.push(`/report?session_id=${store.sessionId}`);
    }
  }, [store.isCompleted, store.sessionId, router]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.lockdownTimeLeft > 0 || store.isLoading || mode === 'none') return;

      // Если мы в ожидании сети после ответа на этот вопрос
      if (store.currentQuestion && store.answersHistory[store.currentQuestion.question_id]) return;

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const val = parseInt(e.key, 10);
        handleChooseAnswer(val);
      } else if (e.key === 'ArrowLeft') {
        store.goBack();
      } else if (e.key === 'ArrowRight') {
        if (lastSelectedValue) {
          handleChooseAnswer(lastSelectedValue);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestion, store.lockdownTimeLeft, store.isLoading, mode, lastSelectedValue, store.answersHistory]);

  const handleChooseAnswer = async (value: number) => {
    if (isDebounced || store.isLoading || store.lockdownTimeLeft > 0) return;

    // Защита от спам-кликов
    setIsDebounced(true);
    setTimeout(() => setIsDebounced(false), 350);

    const timeSpent = Date.now() - questionStartTime.current;
    setLastSelectedValue(value);
    
    // Мгновенная отправка (убрали анимации свайпа)
    await store.submitAnswer(value, timeSpent);
  };

  const handleStart = async (selectedMode: 'express' | 'deep') => {
    setMode(selectedMode);
    const name = localStorage.getItem('studentName') || 'Гость';
    const grade = localStorage.getItem('studentGrade') || '8';
    try {
      await store.startSession(name, grade);
    } catch (e) {
      alert('Ошибка соединения с базой данных. Пожалуйста, попробуйте позже.');
      setMode('none');
    }
  };

  // 1. Оверлей фрод-локдауна (Click-Speed Lock)
  if (store.lockdownTimeLeft > 0) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-xl flex-col justify-center px-6 py-12 relative z-10">
        <div className="rounded-[32px] border border-red-500/20 bg-[#0f0b15]/90 p-10 text-center backdrop-blur-xl shadow-[0_0_50px_rgba(239,68,68,0.15)] relative overflow-hidden animate-pulse">
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <div className="relative">
              <Zap className="h-16 w-16 text-red-500 animate-bounce" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold font-unbounded text-white">Пожалуйста, делай выбор осознанно</h1>
              <p className="max-w-md text-sm text-red-200/80 font-inter leading-relaxed">
                Мы заметили, что ты спешишь. Твои результаты могут оказаться неточными. Тест временно заблокирован.
              </p>
            </div>
            <div className="text-4xl font-extrabold font-unbounded text-red-400">
              {store.lockdownTimeLeft} сек
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Стартовый экран выбора режима
  if (mode === 'none') {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-4xl flex-col justify-center px-6 py-12 relative z-10">
        <div className="text-center space-y-4 mb-10">
          <h1 className="text-3xl font-extrabold font-unbounded text-text sm:text-4xl lg:text-5xl leading-tight">
            Выберите формат диагностики
          </h1>
          <p className="max-w-2xl mx-auto text-base text-muted font-inter leading-relaxed">
            Привет! Выбери формат прохождения диагностики. Вся информация сохранится в твоем профиле.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Экспресс-тест */}
          <div
            onClick={() => handleStart('express')}
            className="group cursor-pointer rounded-[32px] border border-white/10 bg-[#0b1125]/60 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-[#7c8cff]/30 hover:bg-[#0b1125]/80 hover:shadow-[0_20px_50px_rgba(124,140,255,0.08)] flex flex-col justify-between min-h-[300px]"
          >
            <div className="space-y-5">
              <div className="inline-flex rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-300 transition group-hover:scale-105">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-unbounded text-text group-hover:text-[#7c8cff] transition">
                  Экспресс-тест
                </h3>
                <p className="text-sm text-muted font-inter leading-relaxed">
                  30 вопросов по методике RIASEC (коды Холланда). Быстрое определение твоих основных профессиональных интересов.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted font-syncopate">~4 минуты</span>
              <span className="text-sm font-semibold text-[#7c8cff] inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition">
                Запустить
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>

          {/* Глубокий тест */}
          <div
            onClick={() => handleStart('deep')}
            className="group cursor-pointer rounded-[32px] border border-white/10 bg-[#0b1125]/60 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-[#8b5cf6]/30 hover:bg-[#0b1125]/80 hover:shadow-[0_20px_50px_rgba(139,92,246,0.08)] flex flex-col justify-between min-h-[300px]"
          >
            <div className="space-y-5">
              <div className="inline-flex rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 p-4 text-[#a855f7] transition group-hover:scale-105">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-unbounded text-text group-hover:text-[#8b5cf6] transition">
                  Комплексный тест
                </h3>
                <p className="text-sm text-muted font-inter leading-relaxed">
                  84 вопроса: глубокий анализ твоих интересов (RIASEC) + характера (Big Five) + ведущих карьерных ориентиров («Якоря карьеры» Э. Шейна).
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted font-syncopate">~15 минут</span>
              <span className="text-sm font-semibold text-[#8b5cf6] inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition">
                Запустить
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. Лоадер при загрузке вопросов
  if (store.isLoading) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 py-12 relative z-10">
        <div className="rounded-[32px] border border-white/10 bg-[#0b1125]/75 p-8 text-center backdrop-blur-xl shadow-glow relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <Loader2 className="h-16 w-16 animate-spin text-[#7c8cff] opacity-80" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold font-unbounded text-text">Загрузка вопросов диагностики...</h1>
              <p className="max-w-md text-xs text-muted font-inter leading-relaxed">
                Наш алгоритм синхронизирует сессию с базой данных PostgreSQL.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = store.currentQuestion;
  if (!currentQuestion) return null;

  const Icon = blockIcons[currentQuestion.test_type] || Compass;

  // CYCLE 1: Fallback UI (когда мы уже ответили на этот вопрос, но оффлайн/висит запрос)
  const isWaitingForNext = store.answersHistory[currentQuestion.question_id] !== undefined;

  return (
    <main className="mx-auto min-h-[calc(100vh-100px)] max-w-7xl px-6 py-10 lg:px-10 relative z-10">
      
      {/* Плашка оффлайн-режима */}
      {store.isOffline && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 backdrop-blur-sm shadow-lg max-w-4xl mx-auto transition-opacity">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-red-400 shrink-0 animate-pulse" />
            <p className="text-xs md:text-sm font-inter leading-relaxed">
              Сеть временно недоступна. 
              {store.offlineAnswersBuffer.length > 0 && (
                <span className="font-bold text-white ml-2">Неотправленных ответов: {store.offlineAnswersBuffer.length}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => store.syncOfflineAnswers()}
            className="text-xs font-bold text-white bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Повторить
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Боковая панель прогресса */}
        <aside className="glass-panel space-y-6 rounded-[32px] p-6 lg:p-7 bg-[#0b1125]/60 backdrop-blur-md border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accentSoft font-syncopate">
              {mode === 'express' ? 'Экспресс-диагностика' : 'Комплексный анализ'}
            </span>
            <h1 className="text-2xl font-bold font-unbounded text-text mt-3 leading-tight">
              Диагностика потенциала
            </h1>
            <p className="mt-2 text-sm text-muted font-inter leading-relaxed">
              Отвечай максимально честно. В тесте нет «правильных» ответов.
            </p>
          </div>

          {/* Общий прогресс */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text font-inter">Общий прогресс</p>
              <p className="text-sm font-semibold text-accentSoft font-unbounded">{currentQuestion.progress_percent}%</p>
            </div>
            <div className="mt-3.5 h-1.5 rounded-full bg-white/10">
              <div
                className="metric-bar h-1.5 rounded-full bg-gradient-to-r from-accent to-[#8b5cf6] transition-all duration-300"
                style={{ width: `${currentQuestion.progress_percent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted font-inter">
              <span>Вопрос {Math.round((currentQuestion.progress_percent / 100) * (mode === 'express' ? 30 : 84)) + 1} из {mode === 'express' ? 30 : 84}</span>
              <span>Блок: {blockNames[currentQuestion.test_type]}</span>
            </div>
          </div>

          {/* Список блоков теста */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3.5">
            <p className="text-sm font-semibold text-text font-inter">Этапы диагностики</p>
            <div className="space-y-3">
              {Object.entries(blockNames).map(([key, name]) => {
                const BlockIcon = blockIcons[key] || Compass;
                const isCurrent = currentQuestion.test_type === key;
                const isPassed = 
                  (key === 'riasec' && currentQuestion.test_type !== 'riasec') ||
                  (key === 'big_five' && currentQuestion.test_type === 'career_anchors');

                if (mode === 'express' && key !== 'riasec') return null;

                return (
                  <div 
                    key={key} 
                    className={`rounded-xl border p-3 transition duration-200 ${
                      isCurrent 
                        ? 'border-accent bg-accent/5 text-white' 
                        : isPassed 
                          ? 'border-emerald-500/10 bg-emerald-500/5 text-emerald-400' 
                          : 'border-white/5 bg-[#0b1125]/40 text-muted'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <BlockIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold font-inter">{name}</span>
                      </div>
                      {isPassed && <span className="text-[10px] uppercase font-bold text-emerald-400">Пройден</span>}
                      {isCurrent && <span className="text-[10px] uppercase font-bold text-accentSoft animate-pulse">Текущий</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Карточный интерфейс */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-8 bg-[#0b1125]/60 backdrop-blur-md border-white/10 flex flex-col justify-between overflow-hidden relative min-h-[500px]">
          
          {isWaitingForNext && (
            <div className="absolute inset-0 z-50 bg-[#0b1125]/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-[32px]">
              <Loader2 className="h-10 w-10 animate-spin text-accentSoft mb-4" />
              <p className="text-sm font-bold text-white">Синхронизация ответа...</p>
              {store.isOffline && <p className="text-xs text-muted mt-2">Ожидание подключения к сети</p>}
            </div>
          )}

          <div className="space-y-6 flex-1 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-accentSoft font-syncopate">
                  <Icon className="h-3.5 w-3.5" />
                  {blockNames[currentQuestion.test_type]}
                </div>
                <span className="text-xs text-muted font-inter">
                  Шкала: {currentQuestion.question_id.split('_')[1].toUpperCase()}
                </span>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_130px] items-center mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold font-unbounded text-text leading-snug lg:text-3xl">
                    {currentQuestion.question_text}
                  </h2>
                  <p className="text-xs text-muted font-inter leading-relaxed">
                    Выбери вариант ответа ниже или нажми соответствующую цифру на клавиатуре (1–5).
                  </p>
                </div>
                {/* Фоновое ИИ-изображение (Fallback) */}
                <div className="relative w-full h-[130px] rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                  {!imgError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={currentQuestion.visual_asset_url} 
                      alt="Визуализация вопроса" 
                      className="object-cover w-full h-full opacity-70"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="text-white/20">
                      <HeroOrb />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1125] to-transparent opacity-40" />
                </div>
              </div>

              {/* Кнопки Ликерта */}
              <div className="grid gap-3 mt-8">
                {currentQuestion.available_answers.map((ans) => {
                  const active = lastSelectedValue === ans.value;
                  const colors = [
                    'hover:border-red-500/30 hover:bg-red-500/5',
                    'hover:border-orange-500/30 hover:bg-orange-500/5',
                    'hover:border-yellow-500/30 hover:bg-yellow-500/5',
                    'hover:border-indigo-500/30 hover:bg-indigo-500/5',
                    'hover:border-purple-500/30 hover:bg-purple-500/5',
                  ];
                  const activeColors = [
                    'border-red-500 bg-red-500/10 text-white shadow-[0_0_30px_rgba(239,68,68,0.15)]',
                    'border-orange-500 bg-orange-500/10 text-white shadow-[0_0_30px_rgba(249,115,22,0.15)]',
                    'border-yellow-500 bg-yellow-500/10 text-white shadow-[0_0_30px_rgba(234,179,8,0.15)]',
                    'border-indigo-500 bg-indigo-500/10 text-white shadow-[0_0_30px_rgba(99,102,241,0.15)]',
                    'border-purple-500 bg-purple-500/10 text-white shadow-[0_0_30px_rgba(168,85,247,0.15)]',
                  ];

                  return (
                    <button
                      key={ans.value}
                      type="button"
                      onClick={() => handleChooseAnswer(ans.value)}
                      disabled={store.isLoading || isWaitingForNext}
                      className={`flex items-center gap-4 rounded-2xl border p-4.5 text-left transition duration-200 ${
                        active
                          ? activeColors[ans.value - 1]
                          : `border-white/10 bg-white/5 text-text ${colors[ans.value - 1]}`
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold transition ${
                          active 
                            ? 'border-white bg-white text-[#0b1125] font-extrabold shadow-glow' 
                            : 'border-white/20 text-muted'
                        }`}
                      >
                        {ans.value}
                      </div>
                      <span className="text-sm font-semibold font-inter">{ans.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Панель навигации */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
              <button
                type="button"
                onClick={() => store.goBack()}
                disabled={store.isLoading || currentQuestion.progress_percent === 0 || isWaitingForNext}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </button>

              <div className="text-xs text-muted font-mono flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span>Сессия синхронизирована</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
