'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [showTransition, setShowTransition] = useState(false);
  const [prevBlock, setPrevBlock] = useState<string | null>(null);
  const [lastSelectedValue, setLastSelectedValue] = useState<number | null>(null);
  const [isDebounced, setIsDebounced] = useState(false);

  const questionStartTime = useRef<number>(0);

  // Восстановление сессии или редирект на авторизацию
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('studentName');
      const grade = localStorage.getItem('studentGrade');
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
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestion?.question_id]);

  // Следим за переходом между блоками
  useEffect(() => {
    if (store.currentQuestion) {
      const currentBlock = store.currentQuestion.test_type;
      if (prevBlock && currentBlock !== prevBlock) {
        setShowTransition(true);
        const timer = setTimeout(() => {
          setShowTransition(false);
        }, 2500);
        setPrevBlock(currentBlock);
        return () => clearTimeout(timer);
      }
      setPrevBlock(currentBlock);
    }
  }, [store.currentQuestion, prevBlock]);

  // Перенаправление на отчет при завершении
  useEffect(() => {
    if (store.isCompleted && store.sessionId) {
      router.push(`/report?session_id=${store.sessionId}`);
    }
  }, [store.isCompleted, store.sessionId, router]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.lockdownTimeLeft > 0 || store.isLoading || showTransition || mode === 'none') return;

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
  }, [store.currentQuestion, store.lockdownTimeLeft, store.isLoading, showTransition, mode, lastSelectedValue]);

  const handleChooseAnswer = async (value: number) => {
    if (isDebounced || store.isLoading || store.lockdownTimeLeft > 0) return;

    // Защита от спам-кликов (debounce 350мс)
    setIsDebounced(true);
    setTimeout(() => setIsDebounced(false), 350);

    const timeSpent = Date.now() - questionStartTime.current;
    setLastSelectedValue(value);
    
    // Анимация свайпа влево
    setSwipeDirection('left');
    setTimeout(async () => {
      setSwipeDirection(null);
      await store.submitAnswer(value, timeSpent);
    }, 250);
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

  // Текст для перехода блоков
  const getTransitionText = () => {
    if (store.currentQuestion?.test_type === 'big_five') {
      return 'Отлично! Первая часть пройдена. Твой тип интересов сформирован на 100%. Переходим к твоим сильным сторонам характера...';
    }
    if (store.currentQuestion?.test_type === 'career_anchors') {
      return 'Вторая часть позади! Твои сильные стороны определены. Переходим к финальному этапу — анализу карьерных ценностей и ориентиров...';
    }
    return 'Загрузка следующего блока вопросов...';
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

  // 2. Экран перехода между блоками (Custom SVG/CSS Lottie-style)
  if (showTransition) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 py-12 relative z-10">
        <div className="rounded-[32px] border border-white/10 bg-[#0b1125]/85 p-10 text-center backdrop-blur-xl shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-20 scale-75">
            <HeroOrb />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Анимированная взлетающая SVG ракета */}
            <div className="relative w-32 h-32 flex items-center justify-center">
              <motion.div
                initial={{ y: 20, opacity: 0.8 }}
                animate={{ y: -20, opacity: 1 }}
                transition={{ repeat: Infinity, duration: 1.2, repeatType: 'reverse', ease: 'easeInOut' }}
                className="text-[#7c8cff]"
              >
                <svg className="w-20 h-20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-2.22 2.564l-1.637 1.02a1.378 1.378 0 01-1.707-2.096l1.02-1.637a6 6 0 012.563-2.22l4.58-1.921a.75.75 0 01.996.996l-1.92 4.581zM11.25 15.75L9 18M7.5 15L6 16.5M9 12L7.5 13.5M16.5 7.5L18 6M15 9l1.5-1.5M13.5 10.5L15 9" />
                </svg>
              </motion.div>
              {/* Анимированный дым */}
              <div className="absolute bottom-4 flex gap-1 justify-center w-full">
                {[1, 2, 3].map((i) => (
                  <motion.span
                    key={i}
                    animate={{ scale: [1, 2, 0.5], opacity: [0.8, 0], y: [0, 15] }}
                    transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.2 }}
                    className="h-2.5 w-2.5 rounded-full bg-indigo-400/60 block"
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold font-unbounded text-white">Переход к следующему этапу</h2>
              <p className="max-w-md text-sm text-[#a8b3ff]/90 font-inter leading-relaxed">
                {getTransitionText()}
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. Стартовый экран выбора режима
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

  // 4. Лоадер при загрузке вопросов
  if (store.isLoading && !swipeDirection) {
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

  return (
    <main className="mx-auto min-h-[calc(100vh-100px)] max-w-7xl px-6 py-10 lg:px-10 relative z-10">
      
      {/* Плашка оффлайн-режима (TC-03) */}
      <AnimatePresence>
        {store.isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 backdrop-blur-sm shadow-lg max-w-4xl mx-auto"
          >
            <div className="flex items-center gap-3">
              <WifiOff className="h-5 w-5 text-red-400 shrink-0 animate-bounce" />
              <p className="text-xs md:text-sm font-inter leading-relaxed">
                Сеть временно недоступна. Твой прогресс сохранен локально, отправка произойдет автоматически при восстановлении связи.
                {store.offlineAnswersBuffer.length > 0 && (
                  <span className="font-bold text-white block mt-0.5">Неотправленных ответов: {store.offlineAnswersBuffer.length}</span>
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
          </motion.div>
        )}
      </AnimatePresence>

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
              <motion.div
                className="metric-bar h-1.5 rounded-full bg-gradient-to-r from-accent to-[#8b5cf6]"
                initial={{ width: 0 }}
                animate={{ width: `${currentQuestion.progress_percent}%` }}
                transition={{ duration: 0.35 }}
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

                // Показываем блоки OCEAN и Шейна только для глубокого теста
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

        {/* Tinder-like Карточный интерфейс */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-8 bg-[#0b1125]/60 backdrop-blur-md border-white/10 flex flex-col justify-between overflow-hidden relative min-h-[500px]">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.question_id}
              initial={{ x: 0, scale: 0.95, opacity: 0 }}
              animate={{ 
                x: swipeDirection === 'left' ? -150 : swipeDirection === 'right' ? 150 : 0, 
                rotate: swipeDirection === 'left' ? -5 : swipeDirection === 'right' ? 5 : 0, 
                opacity: swipeDirection ? 0 : 1,
                scale: 1
              }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.22 }}
              className="space-y-6 flex-1 flex flex-col justify-between"
            >
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
                  {/* Фоновое ИИ-изображение (TC-01) */}
                  <div className="relative w-full h-[130px] rounded-2xl border border-white/10 bg-white/5 overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={currentQuestion.visual_asset_url} 
                      alt="Визуализация вопроса" 
                      className="object-cover w-full h-full opacity-70"
                      onError={(e) => {
                        // Резервная заглушка, если картинка не найдена
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b1125] to-transparent opacity-40" />
                  </div>
                </div>

                {/* Кнопки Ликерта */}
                <div className="grid gap-3 mt-8">
                  {currentQuestion.available_answers.map((ans) => {
                    const active = lastSelectedValue === ans.value;
                    // Подбор цвета градиента под ТЗ (от красного к фиолетовому)
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
                        disabled={store.isLoading}
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
                  disabled={store.isLoading || currentQuestion.progress_percent === 0}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:scale-[1.02] hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Назад
                </button>

                <div className="text-xs text-muted font-mono flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Сессия синхронизирована</span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </section>
      </div>
    </main>
  );
}
