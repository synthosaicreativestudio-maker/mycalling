'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Brain, ChevronLeft, ChevronRight, CircleDashed, Compass, Flame, Sparkles, Target } from 'lucide-react';
import { useMemo, useState } from 'react';

import { assessmentQuestions } from '../data';

const optionLabels = ['Совсем не про меня', 'Скорее нет', 'Иногда', 'Скорее да', 'Очень похоже'];

const blockIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  Способности: Brain,
  Интересы: Compass,
  'Личностные паттерны': Sparkles,
  Поведение: Target,
  Мотивация: Flame
};

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [studentName, setStudentName] = useState('');

  const totalQuestions = assessmentQuestions.length;
  const currentQuestion = assessmentQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = Math.round((Object.keys(answers).length / totalQuestions) * 100);
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const Icon = blockIcons[currentQuestion.block] ?? CircleDashed;

  const groupedProgress = useMemo(() => {
    const groups = new Map<string, { total: number; answered: number }>();

    assessmentQuestions.forEach((question) => {
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
  }, [answers]);

  function handleAnswer(value: number) {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: value }));
  }

  function handleNext() {
    if (currentAnswer === undefined) {
      return;
    }

    if (isLastQuestion) {
      const payload = {
        studentName: studentName.trim(),
        answers,
        completedAt: new Date().toISOString()
      };

      if (typeof window !== 'undefined') {
        window.localStorage.setItem('moe-prizvanie-assessment', JSON.stringify(payload));
        window.location.href = '/report';
      }

      return;
    }

    setCurrentIndex((prev) => prev + 1);
  }

  function handleBack() {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-8 lg:px-10 lg:py-10">
      <div className="grid gap-6 lg:grid-cols-[0.78fr_1.22fr]">
        <aside className="glass-panel space-y-6 rounded-[34px] p-6 lg:p-7">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Диагностика</p>
            <h1 className="gradient-title mt-3 text-3xl font-semibold leading-tight lg:text-4xl">
              Лёгкий flow вместо тяжёлого теста.
            </h1>
            <p className="mt-3 text-sm leading-7 text-muted">
              Ученик идёт по коротким шагам, видит прогресс и получает понятный итог без ощущения академической анкеты.
            </p>
          </div>

          <label className="input-shell block rounded-[26px] px-4 py-3">
            <div className="mb-2 text-xs uppercase tracking-[0.18em] text-accentSoft">Имя ученика</div>
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              className="w-full bg-transparent outline-none"
              placeholder="Например, Алина"
            />
          </label>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Общий прогресс</p>
              <p className="text-sm font-semibold text-accentSoft">{progress}%</p>
            </div>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <motion.div
                className="metric-bar h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.45, ease: 'easeOut' }}
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-sm text-muted">
              <span>
                Вопрос {currentIndex + 1} из {totalQuestions}
              </span>
              <span>{isLastQuestion ? 'Финальный шаг' : 'Диагностика идёт'}</span>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
            <p className="font-medium">Прогресс по блокам</p>
            <div className="mt-4 space-y-3">
              {groupedProgress.map((item, index) => {
                const BlockIcon = blockIcons[item.block] ?? CircleDashed;
                const percent = Math.round((item.answered / item.total) * 100);

                return (
                  <motion.div
                    key={item.block}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="rounded-2xl border border-white/10 bg-[#0e1630]/70 p-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="rounded-2xl border border-accent/20 bg-accent/10 p-2 text-accentSoft">
                          <BlockIcon className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{item.block}</p>
                          <p className="text-xs text-muted">
                            {item.answered}/{item.total} ответов
                          </p>
                        </div>
                      </div>
                      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-accentSoft">{percent}%</span>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10">
                      <div className="metric-bar h-1.5 rounded-full" style={{ width: `${percent}%` }} />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </aside>

        <section className="glass-panel rounded-[34px] p-6 lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.22em] text-accentSoft">
                <Icon className="h-4 w-4" />
                {currentQuestion.block}
              </div>
              <h2 className="mt-4 text-3xl font-semibold leading-tight lg:text-4xl">{currentQuestion.text}</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted">
              Вес блока: {currentQuestion.weight}
            </div>
          </div>

          <div className="mt-5 rounded-[24px] border border-white/10 bg-[#0d152f]/70 p-4 text-sm leading-6 text-muted">
            {currentQuestion.hint}
          </div>

          <div className="mt-8 grid gap-3">
            {optionLabels.map((label, index) => {
              const value = index + 1;
              const active = currentAnswer === value;

              return (
                <motion.button
                  key={label}
                  type="button"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => handleAnswer(value)}
                  className={`group rounded-[26px] border px-5 py-5 text-left transition duration-200 ${
                    active
                      ? 'border-accent bg-accent/15 text-white shadow-[0_0_0_1px_rgba(124,140,255,0.3),0_20px_60px_rgba(124,140,255,0.12)]'
                      : 'border-white/10 bg-white/5 text-text hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.08]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full border text-xs font-semibold transition ${
                        active ? 'border-accent bg-accent text-white' : 'border-white/20 text-muted group-hover:border-white/30'
                      }`}
                    >
                      {value}
                    </div>
                    <div>
                      <p className="text-base font-semibold">{label}</p>
                      <p className="mt-2 text-sm leading-6 text-muted">{currentQuestion.options[index]}</p>
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-text transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Назад
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-text transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.99]"
              >
                На главную
              </Link>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentAnswer === undefined}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastQuestion ? 'Получить отчёт' : 'Следующий вопрос'}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
