'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, ChevronLeft, ChevronRight, CircleDashed, Compass, Sparkles, Award, Zap, Loader2 } from 'lucide-react';
import { expressQuestions, deepQuestions, AssessmentQuestion } from '../data';
import { HeroOrb } from '../components/HeroOrb';

const blockIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Интересы: Compass,
  Характер: Sparkles,
  Интеллект: Brain
};

const loaderLogs = [
  'Инициализация анализатора потенциала...',
  'Анализ профессионального вектора по коду Холланда (RIASEC)...',
  'Оценка сильных сторон личности по методике Big Five (OCEAN)...',
  'Картирование когнитивных способностей по Говарду Гарднеру...',
  'Анализ продуктового и творческого потенциала...',
  'Сопоставление психологического профиля с базой профессий 2026 года...',
  'Генерация персонализированных рекомендаций по предметам...',
  'Сборка итогового отчета для родителей и подготовка рекомендаций...'
];

export default function AssessmentPage() {
  const router = useRouter();
  
  // Состояния
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('8');
  const [mode, setMode] = useState<'none' | 'express' | 'deep'>('none');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentLogIndex, setCurrentLogIndex] = useState(0);

  // Проверка авторизации
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const name = localStorage.getItem('studentName');
      const grade = localStorage.getItem('studentGrade');
      if (!name) {
        // Если имя не введено, перенаправляем на авторизацию
        router.push('/auth');
      } else {
        setStudentName(name);
        setStudentGrade(grade || '8');
      }
    }
  }, [router]);

  // Выбор списка вопросов в зависимости от режима
  const questions = useMemo(() => {
    if (mode === 'express') return expressQuestions;
    if (mode === 'deep') return deepQuestions;
    return [];
  }, [mode]);

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = answers[currentQuestion?.id];
  const progress = totalQuestions ? Math.round((Object.keys(answers).length / totalQuestions) * 100) : 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const Icon = currentQuestion ? (blockIcons[currentQuestion.block] ?? CircleDashed) : CircleDashed;

  // Группировка прогресса по блокам (только для глубокого теста)
  const groupedProgress = useMemo(() => {
    if (mode !== 'deep') return [];
    const groups = new Map<string, { total: number; answered: number }>();

    questions.forEach((question) => {
      const entry = groups.get(question.block) ?? { total: 0, answered: 0 };
      entry.total += 1;
      if (answers[question.id] !== undefined) {
        entry.answered += 1;
      }
      groups.set(question.block, entry);
    });

    return Array.from(groups.entries()).map(([block, value]) => ({
      block,
      total: value.total,
      answered: value.answered
    }));
  }, [questions, answers, mode]);

  // Запуск смены логов на экране ожидания
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      interval = setInterval(() => {
        setCurrentLogIndex((prev) => (prev < loaderLogs.length - 1 ? prev + 1 : prev));
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const handleAnswer = (value: number) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const handleNext = async () => {
    if (currentAnswer === undefined) return;

    if (isLastQuestion) {
      // Запуск генерации отчета
      setIsGenerating(true);
      try {
        const response = await fetch('/api/generate-report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            studentName,
            studentGrade,
            answers,
            isDeep: mode === 'deep',
          }),
        });

        if (!response.ok) {
          throw new Error('Не удалось сгенерировать отчет');
        }

        const reportData = await response.json();
        localStorage.setItem('moe-prizvanie-report', JSON.stringify(reportData));
        router.push('/report');
      } catch (err) {
        console.error(err);
        alert('Произошла ошибка при генерации отчета. Пожалуйста, попробуйте еще раз.');
        setIsGenerating(false);
      }
      return;
    }

    setCurrentIndex((prev) => prev + 1);
  };

  const handleBack = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  // 1. Экран ожидания (лоадер)
  if (isGenerating) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 py-12 relative z-10">
        <div className="rounded-[32px] border border-white/10 bg-[#0b1125]/75 p-8 text-center backdrop-blur-xl shadow-glow relative overflow-hidden">
          {/* Сфера на фоне */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40 mix-blend-screen scale-75">
            <HeroOrb />
          </div>

          <div className="relative z-10 flex flex-col items-center space-y-8">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-[#7c8cff] opacity-80" />
              <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-[#8b5cf6] animate-pulse" />
            </div>

            <div className="space-y-3">
              <h1 className="text-2xl font-bold font-unbounded text-text">Анализ профиля способностей</h1>
              <p className="max-w-md text-sm text-muted font-inter leading-relaxed">
                Математический алгоритм синтезирует ваши ответы для формирования карты призвания.
              </p>
            </div>

            {/* Бегущие неоновые логи */}
            <div className="w-full max-w-md rounded-2xl border border-white/5 bg-white/5 p-4.5 text-left font-mono text-xs text-[#a8b3ff]/90 min-h-[140px] flex flex-col justify-end space-y-2">
              {loaderLogs.slice(0, currentLogIndex + 1).map((log, idx) => (
                <div key={log} className="flex items-start gap-2.5 animate-fade-in">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{log}</span>
                </div>
              ))}
              {currentLogIndex < loaderLogs.length && (
                <div className="flex items-center gap-2.5 text-muted animate-pulse">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>Выполнение расчетов...</span>
                </div>
              )}
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
            Выбери формат диагностики
          </h1>
          <p className="max-w-2xl mx-auto text-base text-muted font-inter leading-relaxed">
            Привет, {studentName}! Выберите формат диагностики для запуска анализа способностей.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Экспресс-тест */}
          <div
            onClick={() => setMode('express')}
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
                  12 вопросов по методике RIASEC (код Холланда). Быстрая фокусировка на ключевых профессиональных интересах.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted font-syncopate">~3 минуты</span>
              <span className="text-sm font-semibold text-[#7c8cff] inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition">
                Запустить
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>

          {/* Глубокий тест */}
          <div
            onClick={() => setMode('deep')}
            className="group cursor-pointer rounded-[32px] border border-white/10 bg-[#0b1125]/60 p-8 backdrop-blur-md transition duration-300 hover:-translate-y-1.5 hover:border-[#8b5cf6]/30 hover:bg-[#0b1125]/80 hover:shadow-[0_20px_50px_rgba(139,92,246,0.08)] flex flex-col justify-between min-h-[300px]"
          >
            <div className="space-y-5">
              <div className="inline-flex rounded-2xl border border-[#8b5cf6]/20 bg-[#8b5cf6]/10 p-4 text-[#a855f7] transition group-hover:scale-105">
                <Award className="h-6 w-6" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-bold font-unbounded text-text group-hover:text-[#8b5cf6] transition">
                  Глубокий тест
                </h3>
                <p className="text-sm text-muted font-inter leading-relaxed">
                  30 вопросов: профессиональные интересы (RIASEC) + характер (Big Five / OCEAN) + таланты по шкале множественных интеллектов Гарднера.
                </p>
              </div>
            </div>
            <div className="mt-8 flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted font-syncopate">~15 минут</span>
              <span className="text-sm font-semibold text-[#8b5cf6] inline-flex items-center gap-1.5 group-hover:translate-x-1.5 transition">
                Запустить
                <ChevronRight className="h-4 w-4" />
              </span>
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 3. Экран прохождения теста
  return (
    <main className="mx-auto min-h-[calc(100vh-100px)] max-w-7xl px-6 py-10 lg:px-10 relative z-10">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Боковая колонка с прогрессом */}
        <aside className="glass-panel space-y-6 rounded-[32px] p-6 lg:p-7 bg-[#0b1125]/60 backdrop-blur-md border-white/10">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-accentSoft font-syncopate">
              {mode === 'express' ? 'Экспресс-диагностика' : 'Глубокая диагностика'}
            </span>
            <h1 className="text-2xl font-bold font-unbounded text-text mt-3 leading-tight">
              Диагностика потенциала
            </h1>
            <p className="mt-2 text-sm text-muted font-inter leading-relaxed">
              Отвечайте искренне. Здесь нет «правильных» ответов — мы ищем ваши естественные таланты.
            </p>
          </div>

          {/* Общий прогресс */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-text font-inter">Общий прогресс</p>
              <p className="text-sm font-semibold text-accentSoft font-unbounded">{progress}%</p>
            </div>
            <div className="mt-3.5 h-1.5 rounded-full bg-white/10">
              <motion.div
                className="metric-bar h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.35 }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted font-inter">
              <span>Вопрос {currentIndex + 1} из {totalQuestions}</span>
              <span>{isLastQuestion ? 'Финальный вопрос' : 'В процессе'}</span>
            </div>
          </div>

          {/* Прогресс по блокам (только для глубокого теста) */}
          {mode === 'deep' && (
            <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3.5">
              <p className="text-sm font-semibold text-text font-inter">Прогресс по блокам</p>
              <div className="space-y-3">
                {groupedProgress.map((item, index) => {
                  const BlockIcon = blockIcons[item.block] ?? CircleDashed;
                  const percent = Math.round((item.answered / item.total) * 100);

                  return (
                    <div key={item.block} className="rounded-xl border border-white/5 bg-[#0b1125]/40 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="rounded-xl border border-accent/10 bg-accent/5 p-1.5 text-accentSoft">
                            <BlockIcon className="h-3.5 w-3.5" />
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-text font-inter">{item.block}</p>
                            <p className="text-[10px] text-muted font-mono">{item.answered}/{item.total} ответов</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-bold font-unbounded text-accentSoft">{percent}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </aside>

        {/* Секция с вопросом */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-8 bg-[#0b1125]/60 backdrop-blur-md border-white/10 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-accentSoft font-syncopate">
                <Icon className="h-3.5 w-3.5" />
                {currentQuestion.block}
              </div>
              <span className="text-xs text-muted font-inter">
                Шкала: {currentQuestion.trait}
              </span>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold font-unbounded text-text leading-snug lg:text-3xl">
                {currentQuestion.text}
              </h2>
              <p className="rounded-2xl border border-white/5 bg-[#0b1125]/50 p-4 text-xs text-muted font-inter leading-relaxed">
                {currentQuestion.hint}
              </p>
            </div>

            {/* Варианты ответов по шкале Лайкерта */}
            <div className="grid gap-3 mt-8">
              {currentQuestion.options.map((label, index) => {
                const value = index + 1;
                const active = currentAnswer === value;

                return (
                  <button
                    key={label}
                    type="button"
                    onClick={() => handleAnswer(value)}
                    className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 ${
                      active
                        ? 'border-accent bg-accent/10 text-white shadow-[0_0_30px_rgba(124,140,255,0.15)]'
                        : 'border-white/15 bg-white/5 text-text hover:border-white/20 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full border text-xs font-bold transition ${
                        active ? 'border-accent bg-accent text-white shadow-glow' : 'border-white/20 text-muted'
                      }`}
                    >
                      {value}
                    </div>
                    <span className="text-sm font-semibold font-inter">{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Панель навигации по тесту */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:scale-[1.02] hover:bg-white/10 disabled:opacity-40 disabled:pointer-events-none"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </button>
              <button
                type="button"
                onClick={() => setMode('none')}
                className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:scale-[1.02] hover:bg-white/10"
              >
                Сменить режим
              </button>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentAnswer === undefined}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLastQuestion ? 'Получить отчёт' : 'Следующий'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
