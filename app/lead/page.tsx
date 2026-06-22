'use client';

import Link from 'next/link';
import { Loader2, Mail, MessageCircle, NotebookPen, User, Users } from 'lucide-react';
import { useState } from 'react';

export default function LeadPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [studentName, setStudentName] = useState('');
  const [grade, setGrade] = useState('');
  const [contact, setContact] = useState('');
  const [goal, setGoal] = useState('');

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);

    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        'moe-prizvanie-lead',
        JSON.stringify({ studentName, grade, contact, goal, createdAt: new Date().toISOString() })
      );
    }

    await new Promise((resolve) => setTimeout(resolve, 700));
    window.location.href = '/assessment';
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center px-6 py-10 lg:px-10">
      <div className="grid w-full gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <section className="glass-panel rounded-[34px] p-8 lg:p-10">
          <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Старт семейного сценария</p>
          <h1 className="gradient-title mt-3 text-4xl font-semibold leading-tight lg:text-6xl">
            Спокойный вход в диагностику без ощущения бюрократии и спама.
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Перед стартом мы берём только минимальный контекст: кто проходит сценарий, в каком классе учится ребёнок и
            какая задача для семьи сейчас самая важная.
          </p>

          <div className="mt-8 space-y-3">
            <Benefit text="Контакт нужен только для возврата к результату и дальнейшего сопровождения." />
            <Benefit text="После старта пользователь сразу попадает в рабочую диагностику с прогрессом и вопросами." />
            <Benefit text="Итоговый отчёт строится по реальным ответам, а не по фиксированной заглушке." />
          </div>

          <div className="mt-8 rounded-[28px] border border-white/10 bg-white/5 p-5">
            <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Что будет дальше</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <MiniStep title="1. Контекст" text="Короткий старт и задача семьи" />
              <MiniStep title="2. Диагностика" text="Вопросы, ответы, прогресс" />
              <MiniStep title="3. Отчёт" text="Профиль, профессии и рекомендации" />
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-[34px] p-8 lg:p-10">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-accentSoft" />
            <p className="text-sm uppercase tracking-[0.2em] text-accentSoft">Контактная форма</p>
          </div>
          <h2 className="mt-3 text-3xl font-semibold">Начать диагностику</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Это не “форма ради формы”, а входной шаг в семейный сценарий. Всё выглядит аккуратно и понятно, чтобы не
            потерять доверие в первые секунды.
          </p>

          <form className="mt-8 grid gap-4" onSubmit={handleSubmit}>
            <Field label="Имя ученика" icon={<User className="h-4 w-4" />}>
              <input
                value={studentName}
                onChange={(event) => setStudentName(event.target.value)}
                className="w-full bg-transparent outline-none"
                placeholder="Например, Алина"
                required
              />
            </Field>

            <div className="grid gap-4 lg:grid-cols-2">
              <Field label="Класс" icon={<NotebookPen className="h-4 w-4" />}>
                <input
                  value={grade}
                  onChange={(event) => setGrade(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="9, 10 или 11"
                  required
                />
              </Field>

              <Field label="Контакт родителя" icon={<Mail className="h-4 w-4" />}>
                <input
                  value={contact}
                  onChange={(event) => setContact(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Email или Telegram"
                  required
                />
              </Field>
            </div>

            <Field label="Главная задача семьи" icon={<MessageCircle className="h-4 w-4" />} multiline>
              <textarea
                value={goal}
                onChange={(event) => setGoal(event.target.value)}
                className="min-h-32 w-full resize-none bg-transparent outline-none"
                placeholder="Например: понять сильные стороны, выбрать предметы ЕГЭ, сравнить профессии или снять тревогу вокруг выбора"
                required
              />
            </Field>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-6 text-muted">
              После отправки форма мягко переведёт пользователя в диагностику. Данные временно сохраняются локально,
              чтобы не терять стартовый контекст.
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {isSubmitting ? 'Запускаем диагностику...' : 'Начать диагностику'}
              </button>
              <Link
                href="/report"
                className="rounded-full border border-white/15 bg-white/5 px-5 py-3 text-sm font-medium text-text transition hover:scale-[1.02] hover:bg-white/10 active:scale-[0.99]"
              >
                Посмотреть результат
              </Link>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

function Field({
  label,
  icon,
  children,
  multiline = false
}: {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  multiline?: boolean;
}) {
  return (
    <label className={`input-shell block rounded-[26px] px-4 py-3 ${multiline ? 'min-h-36' : ''}`}>
      <div className="mb-2 flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-accentSoft">
        {icon}
        {label}
      </div>
      {children}
    </label>
  );
}

function Benefit({ text }: { text: string }) {
  return <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm leading-6 text-muted">{text}</div>;
}

function MiniStep({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="font-semibold">{title}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}
