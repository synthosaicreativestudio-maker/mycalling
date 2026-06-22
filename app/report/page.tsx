'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { assessmentQuestions, nextSteps, professions } from '../data';

type StoredAssessment = {
  studentName?: string;
  answers: Record<string, number>;
  completedAt?: string;
};

type TraitScore = Record<string, number>;

const traitLabels: Record<string, string> = {
  analytical: 'аналитика',
  structured: 'структурность',
  investigative: 'исследовательский интерес',
  artistic: 'креативность',
  creative: 'генерация идей',
  social: 'взаимодействие с людьми',
  enterprising: 'инициативность',
  supportive: 'эмпатия',
  persistent: 'устойчивость'
};

const traitStrengthTexts: Record<string, string> = {
  analytical: 'Быстро замечает закономерности и уверенно чувствует себя в задачах на анализ.',
  structured: 'Любит порядок, ясность и понятную структуру действий.',
  investigative: 'С интересом исследует, сравнивает варианты и ищет объяснение.',
  artistic: 'Склонен видеть нестандартные решения и сильнее замечать визуальную сторону задач.',
  creative: 'Любит придумывать новое и улучшать существующие подходы.',
  social: 'Хорошо считывает людей и чувствует себя увереннее в задачах с коммуникацией.',
  enterprising: 'Готов брать инициативу, предлагать идеи и влиять на ход работы.',
  supportive: 'Чувствителен к состоянию других и склонен помогать.',
  persistent: 'Умеет держаться в сложной задаче и доводить начатое до результата.'
};

const traitGrowthTexts: Record<string, string> = {
  analytical: 'Полезно чаще пробовать задачи, где нет одного правильного ответа, чтобы развивать гибкость мышления.',
  structured: 'Стоит тренировать спокойствие в ситуациях, где не всё можно заранее распланировать.',
  investigative: 'Важно не застревать только в исследовании, а переходить к практическому действию и проверке гипотез.',
  artistic: 'Полезно добавлять больше структуры, чтобы творческие идеи было легче доводить до результата.',
  creative: 'Стоит тренировать реализацию идей, а не только их генерацию.',
  social: 'Можно усиливать навык уверенной аргументации и экологичной самопрезентации.',
  enterprising: 'Полезно развивать системность, чтобы инициативность давала устойчивый результат.',
  supportive: 'Важно удерживать границы и не брать на себя слишком много чужих задач.',
  persistent: 'Стоит следить, чтобы настойчивость не превращалась в застревание на одном подходе.'
};

const traitSubjectMap: Record<string, string[]> = {
  analytical: ['Математика', 'Информатика'],
  structured: ['Математика', 'Физика'],
  investigative: ['Биология', 'Информатика'],
  artistic: ['Литература', 'Черчение'],
  creative: ['Английский язык', 'Литература'],
  social: ['Обществознание', 'История'],
  enterprising: ['Английский язык', 'Обществознание'],
  supportive: ['Биология', 'Обществознание'],
  persistent: ['Математика', 'Физика']
};

const traitDirectionMap: Record<string, string[]> = {
  analytical: ['Аналитика и данные', 'IT и цифровые продукты'],
  structured: ['Инженерные направления', 'Системный анализ'],
  investigative: ['Исследования и прикладная наука', 'Аналитика и данные'],
  artistic: ['Дизайн и креативные индустрии', 'Архитектура'],
  creative: ['Маркетинг и коммуникации', 'Продуктовые направления'],
  social: ['Психология и помощь людям', 'Коммуникации и образование'],
  enterprising: ['Управление и бизнес', 'Продуктовые и проектные роли'],
  supportive: ['Психология и помощь людям', 'Образовательные направления'],
  persistent: ['Инженерные направления', 'Технические специальности']
};

export default function ReportPage() {
  const [storedAssessment, setStoredAssessment] = useState<StoredAssessment | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const raw = window.localStorage.getItem('moe-prizvanie-assessment');

    if (!raw) {
      return;
    }

    try {
      setStoredAssessment(JSON.parse(raw) as StoredAssessment);
    } catch {
      setStoredAssessment(null);
    }
  }, []);

  const report = useMemo(() => buildReport(storedAssessment), [storedAssessment]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10 lg:px-10">
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <p className="text-sm uppercase tracking-[0.3em] text-accentSoft">Итоговый отчёт</p>
          <h1 className="mt-3 text-4xl font-semibold">Профиль способностей и карьерный матчинг</h1>
          <p className="mt-4 text-muted">
            {report.studentName
              ? `Отчёт собран по ответам ученика ${report.studentName}. Это не случайная заглушка, а результат на основе пройденной диагностики.`
              : 'Отчёт собран на основе пройденной диагностики. Это не финальный приговор, а основа для следующего осмысленного шага.'}
          </p>

          {!storedAssessment && (
            <div className="mt-6 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm text-amber-100">
              Полная диагностика ещё не пройдена. Сейчас показывается демо-отчёт по базовому профилю. Чтобы увидеть живой результат,
              сначала пройдите диагностику.
            </div>
          )}

          <div className="mt-8 grid gap-4">
            <ReportBlock title="Hero summary" items={report.heroSummary} />
            <ReportBlock title="Сильные стороны" items={report.strengths} />
            <ReportBlock title="Зоны роста" items={report.growthAreas} />
            <ReportBlock title="Рекомендуемые предметы" items={report.subjects} />
            <ReportBlock title="Направления обучения" items={report.directions} />
            <ReportBlock title="Следующие шаги" items={nextSteps} />
          </div>
        </section>

        <aside className="space-y-6 rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur">
          <div>
            <h2 className="text-2xl font-semibold">Рекомендованные профессии</h2>
            <div className="mt-5 space-y-3">
              {report.professions.map((profession) => (
                <div key={profession.name} className="rounded-2xl border border-white/10 bg-surface/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium">{profession.name}</p>
                    <p className="text-accentSoft">{profession.matchScore}%</p>
                  </div>
                  <p className="mt-2 text-sm text-muted">{profession.summary}</p>
                  <p className="mt-3 text-sm text-text">Почему подошло: <span className="text-muted">{profession.why}</span></p>
                  <p className="mt-3 text-sm text-muted">Предметы: {profession.subjects.join(' · ')}</p>
                  <p className="mt-1 text-sm text-muted">Направления: {profession.directions.join(' · ')}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
            <p className="font-semibold text-text">Parent summary</p>
            <ul className="mt-3 space-y-2 text-sm text-muted">
              {report.parentSummary.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/assessment"
              className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02]"
            >
              Пройти заново
            </Link>
            <Link
              href="/lead"
              className="rounded-full border border-white/15 px-5 py-3 text-sm font-medium text-text transition hover:bg-white/5"
            >
              Оставить заявку
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}

function buildReport(storedAssessment: StoredAssessment | null) {
  const answers = storedAssessment?.answers ?? {};
  const traitScores: TraitScore = {};

  assessmentQuestions.forEach((question) => {
    const answer = answers[question.id] ?? 4;

    question.traits.forEach((trait) => {
      traitScores[trait] = (traitScores[trait] ?? 0) + answer;
    });
  });

  const rankedTraits = Object.entries(traitScores).sort((a, b) => b[1] - a[1]);
  const topTraits = rankedTraits.slice(0, 3).map(([trait]) => trait);
  const lowerTraits = rankedTraits.slice(-3).map(([trait]) => trait);

  const strengths = topTraits.map((trait) => traitStrengthTexts[trait]);
  const growthAreas = lowerTraits.map((trait) => traitGrowthTexts[trait]);

  const subjects = uniqueFromTraits(topTraits, traitSubjectMap).slice(0, 4);
  const directions = uniqueFromTraits(topTraits, traitDirectionMap).slice(0, 4);

  const topProfessions = professions
    .map((profession) => {
      const match = profession.tags.reduce((sum, tag) => sum + (traitScores[tag] ?? 0), 0);
      return {
        ...profession,
        matchScore: Math.min(98, 60 + match)
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 4);

  const heroSummary = [
    `Ведущий профиль: ${topTraits.map((trait) => traitLabels[trait]).join(', ')}.`,
    `Уверенность результата: ${storedAssessment ? 'средне-высокая' : 'демо-режим'}, потому что профиль собран на основе ${storedAssessment ? 'реальных ответов ученика' : 'базового примера прохождения'}.`
  ];

  const parentSummary = [
    `У ребёнка сильнее всего выражены: ${topTraits.map((trait) => traitLabels[trait]).join(', ')}.`,
    `Лучше всего раскрывается в среде, где есть ${topTraits.includes('structured') ? 'понятная структура, ' : ''}${topTraits.includes('analytical') ? 'логика, ' : ''}${topTraits.includes('social') ? 'взаимодействие с людьми, ' : ''}измеримый результат.`,
    `Сейчас полезно мягко усиливать: ${lowerTraits.map((trait) => traitLabels[trait]).join(', ')}.`
  ];

  return {
    studentName: storedAssessment?.studentName,
    heroSummary,
    strengths,
    growthAreas,
    subjects,
    directions,
    professions: topProfessions,
    parentSummary
  };
}

function uniqueFromTraits(traits: string[], source: Record<string, string[]>) {
  return Array.from(new Set(traits.flatMap((trait) => source[trait] ?? [])));
}

function ReportBlock({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-surface/70 p-4">
      <p className="font-medium">{title}</p>
      <ul className="mt-2 space-y-2 text-sm text-muted">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}
