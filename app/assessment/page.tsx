'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';

import { assessmentQuestions } from '../data';

const optionLabels = ['Совсем не про меня', 'Скорее нет', 'Иногда', 'Скорее да', 'Очень похоже'];

export default function AssessmentPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [studentName, setStudentName] = useState('');

  const totalQuestions = assessmentQuestions.length;
  const currentQuestion = assessmentQuestions[currentIndex];
  const currentAnswer = answers[currentQuestion.id];
  const progress = Math.round((Object.keys(answers).length / totalQuestions) * 100);
  const isLastQuestion = currentIndex === totalQuestions - 1;

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
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <aside className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Диагностика</p>
            <h1 className="mt-3 text-3xl font-semibold">Рабочая диагностика для MVP</h1>
            <p className="mt-3 text-sm leading-6 text-muted">
              Ученик отвечает на вопросы по 5 сигнальным блокам. После завершения сервис считает профиль,
              подбирает профессии, предметы и направления обучения.
            </p>
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/70 p-4">
            <label className="text-sm font-medium text-text">Имя ученика</label>
            <input
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              className="mt-3 w-full rounded-2xl border border-white/10 bg-[#0f1730] px-4 py-3 outline-none transition focus:border-accent"
              placeholder="Например, Алина"
            />
          </div>

          <div className="rounded-3xl border border-white/10 bg-surface/70 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-medium">Общий прогресс</p>
              <p className="text-sm text-accentSoft">{progress}%</p>
            </div>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full bg-accent transition-all" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-3 text-sm text-muted">
              Вопрос {currentIndex + 1} из {totalQuestions}
            </p>
          </div>

          <div className="space-y-3 rounded-3xl border border-white/10 bg-surface/70 p-4">
            <p className="font-medium">Прогресс по блокам</p>
            {groupedProgress.map((item) => (
              <div key={item.block} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="flex items-center justify-between gap-3 text-sm">
                  <span>{item.block}</span>
                  <span className="text-accentSoft">
                    {item.answered}/{item.total}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <section className="rounded-[32px] border border-white/10 bg-white/5 p-6 backdrop-blur lg:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-accentSoft">{currentQuestion.block}</p>
              <h2 className="mt-2 text-3xl font-semibold leading-tight">{currentQuestion.text}</h2>
            </div>
            <div className="rounded-full border border-white/10 bg-surface/70 px-4 py-2 text-sm text-muted">
              Вес блока: {currentQuestion.weight}
            </div>
          </div>

          <p className="mt-4 max-w-3xl text-muted">{currentQuestion.hint}</p>

          <div className="mt-8 grid gap-3">
            {optionLabels.map((label, index) => {
              const value = index + 1;
              const active = currentAnswer === value;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => handleAnswer(value)}
                  className={`rounded-2xl border px-4 py-4 text-left transition ${
                    active
                      ? 'border-accent bg-accent/15 text-white'
                      : 'border-white/10 bg-surface/70 text-text hover:border-white/20 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`mt-1 flex h-6 w-6 items-center justify-center rounded-full border text-xs ${
                        active ? 'border-accent bg-accent text-white' : 'border-white/20 text-muted'
                      }`}
                    >
                      {value}
                    </div>
                    <div>
                      <p className="font-medium">{label}</p>
                      <p className="mt-1 text-sm text-muted">{currentQuestion.options[index]}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentIndex === 0}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Назад
              </button>
              <Link
                href="/"
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5"
              >
                На главную
              </Link>
            </div>

            <button
              type="button"
              onClick={handleNext}
              disabled={currentAnswer === undefined}
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLastQuestion ? 'Получить отчёт' : 'Следующий вопрос'}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
