'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, Compass, Sparkles, Award, Star, RefreshCw, ChevronRight, User, AlertCircle, ArrowLeft } from 'lucide-react';
import { HeroOrb } from '../components/HeroOrb';

type Trait = {
  name: string;
  score: number;
  description: string;
};

type Profession = {
  name: string;
  score: number;
  summary: string;
  why: string;
  subjects: string[];
  directions: string[];
};

type ReportData = {
  studentName?: string;
  studentGrade?: string;
  heroSummary: string[];
  personalityTraits?: Trait[];
  multipleIntelligences?: Trait[];
  strengths: string[];
  growthAreas: string[];
  subjects: string[];
  directions: string[];
  professions: Profession[];
  parentSummary: string[];
};

const defaultReport: ReportData = {
  studentName: 'Демо-профиль',
  studentGrade: '8',
  heroSummary: [
    'Выраженное сочетание творческого потенциала и системного мышления.',
    'Профиль указывает на предрасположенность к созданию концептуальных интерфейсов и ИИ-продуктов.'
  ],
  personalityTraits: [
    { name: 'Открытость новому', score: 85, description: 'Высокая любознательность, готовность пробовать новые подходы и генерировать идеи.' },
    { name: 'Добросовестность', score: 70, description: 'Умение организовать учебный процесс и доводить дела до результата.' },
    { name: 'Экстраверсия', score: 65, description: 'Комфортно чувствует себя в командной работе и презентациях.' },
    { name: 'Доброжелательность', score: 80, description: 'Высокий уровень эмпатии, умение слышать мнение других.' },
    { name: 'Эмоциональная устойчивость', score: 75, description: 'Спокойное восприятие критики, умение справляться со стрессом.' }
  ],
  multipleIntelligences: [
    { name: 'Пространственно-визуальный', score: 90, description: 'Выдающаяся способность визуализировать идеи и работать с цветом и формой.' },
    { name: 'Логико-математический', score: 80, description: 'Сильное структурное мышление, поиск закономерностей в данных.' },
    { name: 'Лингвистический', score: 75, description: 'Легко формулирует аргументы, любит читать и писать тексты.' },
    { name: 'Межличностный', score: 85, description: 'Эмпатия, понимание людей и успешная социализация.' }
  ],
  strengths: [
    'Быстро переводит сложные абстрактные идеи в понятные визуальные образы.',
    'Способен находить скрытые логические связи и упорядочивать хаотичные данные.',
    'Высокая чувствительность к потребностям людей (эмпатичный дизайн).'
  ],
  growthAreas: [
    'Переход от генерации концептов к практическому программированию и сборке.',
    'Защита решений перед аудиторией с опорой на измеримые цифры.',
    'Работа в неопределенных условиях без готовых шаблонов.'
  ],
  subjects: [
    'Информатика — база для работы в цифровой среде.',
    'Обществознание — понимание рыночных отношений и психологии людей.',
    'Математика — развивает логику и вычислительные навыки.'
  ],
  directions: [
    'Дизайн и креативные индустрии',
    'IT и продуктовая разработка',
    'Продуктовый менеджмент'
  ],
  professions: [
    {
      name: 'UX/UI Дизайнер интерфейсов',
      score: 95,
      summary: 'Проектирование пользовательского опыта цифровых систем.',
      why: 'Идеальное схождение пространственного интеллекта, артистического интереса и высокой эмпатии. Ученик сможет создавать понятные интерфейсы для людей.',
      subjects: ['Информатика', 'Обществознание'],
      directions: ['Дизайн', 'IT']
    },
    {
      name: 'Промт-инженер ИИ',
      score: 90,
      summary: 'Проектирование логических запросов к нейросетям.',
      why: 'Сочетание лингвистического таланта для формулировок и логического мышления для структурирования команд ИИ.',
      subjects: ['Английский язык', 'Информатика'],
      directions: ['IT и разработка']
    },
    {
      name: 'Продукт-менеджер ИИ-сервисов',
      score: 88,
      summary: 'Управление созданием инновационных цифровых решений.',
      why: 'Стык предпринимательского интереса и развитого межличностного интеллекта Гарднера. Ученик сможет объединять разработчиков и дизайнеров.',
      subjects: ['Математика', 'Английский язык'],
      directions: ['Управление и IT']
    }
  ],
  parentSummary: [
    'Поддерживайте участие ребенка в прикладных хакатонах и дизайн-конкурсах.',
    'Не перегружайте академической теорией — давайте больше прикладной практики.',
    'Помогите организовать первое портфолио работ (в дизайне или коде).'
  ]
};

export default function ReportPage() {
  const [report, setReport] = useState<ReportData>(defaultReport);
  const [isDemo, setIsDemo] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('moe-prizvanie-report');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          setReport(parsed);
          setIsDemo(false);
        } catch (e) {
          console.error('Ошибка парсинга отчета из localStorage:', e);
        }
      }
    }
  }, []);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 relative z-10">
      
      {/* Шапка отчета */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-10">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#7c8cff]/20 bg-[#7c8cff]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accentSoft font-syncopate">
            <Award className="h-3.5 w-3.5 text-[#7c8cff]" />
            Итоговый отчет ИИ
          </div>
          <h1 className="text-3xl font-extrabold font-unbounded text-text sm:text-4xl lg:text-5xl leading-tight">
            Карта талантов: {report.studentName}
          </h1>
          <p className="text-sm text-muted font-inter">
            {report.studentGrade ? `${report.studentGrade} класс обучения` : 'Класс обучения: 8'} · Сформировано на базе claude-opus-4-7
          </p>
        </div>

        {/* Кнопка пройти заново */}
        <div className="flex gap-3">
          <Link
            href="/assessment"
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" />
            Пройти заново
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:bg-white/10"
          >
            <ArrowLeft className="h-4 w-4" />
            На главную
          </Link>
        </div>
      </div>

      {isDemo && (
        <div className="mb-8 flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4.5 text-amber-200 backdrop-blur-sm">
          <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
          <p className="text-sm leading-relaxed font-inter">
            Диагностика не пройдена или результаты устарели. Сейчас вы видите <span className="font-semibold text-white">демо-отчет</span> по умолчанию. 
            Пройдите диагностику, чтобы сгенерировать собственный отчет с помощью ИИ.
          </p>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        
        {/* Левая колонка — Карта способностей */}
        <div className="space-y-8">
          
          {/* Резюме */}
          <motion.section
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-white/10 bg-[#0b1125]/50 p-6 lg:p-8 backdrop-blur-md"
          >
            <h2 className="text-lg font-bold font-unbounded text-text mb-4">Главное резюме потенциала</h2>
            <div className="space-y-3 font-inter text-muted text-base leading-relaxed">
              {report.heroSummary.map((sentence) => (
                <p key={sentence}>{sentence}</p>
              ))}
            </div>
          </motion.section>

          {/* Типы интеллекта (Гарднер) */}
          {report.multipleIntelligences && report.multipleIntelligences.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-[32px] border border-white/10 bg-[#0b1125]/50 p-6 lg:p-8 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <Brain className="h-5 w-5 text-[#8b5cf6]" />
                <h2 className="text-lg font-bold font-unbounded text-text">Множественные интеллекты (Гарднер)</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {report.multipleIntelligences.map((trait) => (
                  <div key={trait.name} className="rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4.5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-bold text-text font-inter">{trait.name}</span>
                      <span className="text-xs font-bold text-accentSoft font-unbounded">{trait.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accent to-[#8b5cf6] rounded-full" style={{ width: `${trait.score}%` }} />
                    </div>
                    <p className="mt-2.5 text-xs text-muted font-inter leading-relaxed">{trait.description}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Черты характера (Big Five) */}
          {report.personalityTraits && report.personalityTraits.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-[32px] border border-white/10 bg-[#0b1125]/50 p-6 lg:p-8 backdrop-blur-md"
            >
              <div className="flex items-center gap-3 mb-6">
                <Sparkles className="h-5 w-5 text-[#7c8cff]" />
                <h2 className="text-lg font-bold font-unbounded text-text">Личностный профиль (Big Five)</h2>
              </div>
              <div className="grid gap-5 md:grid-cols-2">
                {report.personalityTraits.map((trait) => (
                  <div key={trait.name} className="rounded-2xl border border-white/[0.03] bg-white/[0.01] p-4.5">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <span className="text-sm font-bold text-text font-inter">{trait.name}</span>
                      <span className="text-xs font-bold text-[#7c8cff] font-unbounded">{trait.score}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-accentSoft to-accent rounded-full" style={{ width: `${trait.score}%` }} />
                    </div>
                    <p className="mt-2.5 text-xs text-muted font-inter leading-relaxed">{trait.description}</p>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Силы и зоны роста */}
          <div className="grid gap-6 md:grid-cols-2">
            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-[28px] border border-white/10 bg-[#0b1125]/50 p-6 backdrop-blur-md"
            >
              <h2 className="text-base font-bold font-unbounded text-text mb-4 border-b border-white/5 pb-2.5">
                Сильные стороны
              </h2>
              <ul className="space-y-3">
                {report.strengths.map((str) => (
                  <li key={str} className="flex items-start gap-2.5 text-sm text-muted font-inter leading-relaxed">
                    <span className="text-emerald-400 font-bold mt-0.5">•</span>
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </motion.section>

            <motion.section
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-[28px] border border-white/10 bg-[#0b1125]/50 p-6 backdrop-blur-md"
            >
              <h2 className="text-base font-bold font-unbounded text-text mb-4 border-b border-white/5 pb-2.5">
                Зоны развития
              </h2>
              <ul className="space-y-3">
                {report.growthAreas.map((zone) => (
                  <li key={zone} className="flex items-start gap-2.5 text-sm text-muted font-inter leading-relaxed">
                    <span className="text-accentSoft font-bold mt-0.5">•</span>
                    <span>{zone}</span>
                  </li>
                ))}
              </ul>
            </motion.section>
          </div>
        </div>

        {/* Правая колонка — Карьера и Советы */}
        <div className="space-y-8">
          
          {/* Рекомендованные профессии */}
          <motion.section
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[32px] border border-white/10 bg-[#0b1125]/50 p-6 lg:p-8 backdrop-blur-md"
          >
            <h2 className="text-lg font-bold font-unbounded text-text mb-6">Рекомендованные профессии</h2>
            <div className="space-y-4">
              {report.professions.map((prof) => (
                <div key={prof.name} className="rounded-2xl border border-white/5 bg-white/[0.02] p-4.5 transition duration-300 hover:border-white/10">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="text-base font-bold text-text font-inter">{prof.name}</span>
                    <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-300">
                      {prof.score}% Match
                    </span>
                  </div>
                  <p className="text-xs text-muted font-inter leading-relaxed mb-3">{prof.summary}</p>
                  
                  {/* ИИ Обоснование */}
                  <div className="rounded-xl border border-white/5 bg-[#0b1125]/60 p-3 mb-3 text-xs leading-relaxed text-muted font-inter">
                    <span className="font-semibold text-accentSoft">ИИ-разбор:</span> {prof.why}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {prof.subjects.map((sub) => (
                      <span key={sub} className="rounded-md border border-white/5 bg-white/5 px-2 py-0.5 text-[10px] text-accentSoft font-inter">
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* Раздел для родителей */}
          <motion.section
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-[32px] border border-accent/20 bg-[#7c8cff]/5 p-6 lg:p-8 backdrop-blur-md shadow-[0_0_40px_rgba(124,140,255,0.04)]"
          >
            <div className="flex items-center gap-2.5 mb-5">
              <User className="h-5 w-5 text-accentSoft" />
              <h2 className="text-base font-bold font-unbounded text-text">Рекомендации для родителей</h2>
            </div>
            <ul className="space-y-4">
              {report.parentSummary.map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-xs text-muted font-inter leading-relaxed">
                  <span className="text-accentSoft font-bold mt-0.5">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.section>

          {/* Рекомендованные предметы */}
          <motion.section
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-[32px] border border-white/10 bg-[#0b1125]/50 p-6 lg:p-8 backdrop-blur-md"
          >
            <h2 className="text-sm font-bold font-unbounded text-text mb-4">Приоритетные предметы в школе</h2>
            <ul className="space-y-3">
              {report.subjects.map((sub) => (
                <li key={sub} className="flex items-start gap-2.5 text-xs text-muted font-inter leading-relaxed">
                  <span className="text-[#8b5cf6] font-bold mt-0.5">•</span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </motion.section>
        </div>
      </div>
    </main>
  );
}
