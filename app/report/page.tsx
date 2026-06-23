'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Compass, Sparkles, Award, RefreshCw, User, AlertCircle, ArrowLeft, FileText, Download } from 'lucide-react';
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
    'Профиль указывает на предрасположенность к созданию концептуальных интерфейсов и цифровых продуктов.'
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
      name: 'Инженер данных и алгоритмов',
      score: 90,
      summary: 'Проектирование логических запросов к нейросетям.',
      why: 'Сочетание аналитических способностей, лингвистического таланта и логического мышления для работы со сложными алгоритмическими системами.',
      subjects: ['Английский язык', 'Информатика'],
      directions: ['IT и разработка']
    },
    {
      name: 'Продукт-менеджер технологических сервисов',
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
  const [activeTab, setActiveTab] = useState<'talents' | 'career' | 'parent'>('talents');

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
    <>
      {/* CSS Стили для печати глубокого отчета на А4 */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          html, body {
            background-color: #ffffff !important;
            color: #0f172a !important;
            font-family: system-ui, -apple-system, sans-serif !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            display: block !important;
            background-color: #ffffff !important;
            color: #0f172a !important;
            padding: 20mm !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            background: #f8fafc !important;
            padding: 1.5rem !important;
            border-radius: 12px !important;
            page-break-inside: avoid !important;
            margin-bottom: 1.5rem !important;
          }
          .print-header {
            border-bottom: 2px solid #e2e8f0 !important;
            padding-bottom: 1.5rem !important;
            margin-bottom: 2rem !important;
          }
          .print-page-break {
            page-break-before: always !important;
          }
          .print-progress-bg {
            background-color: #e2e8f0 !important;
            height: 6px !important;
            border-radius: 9999px !important;
          }
          .print-progress-bar {
            background-color: #3b82f6 !important;
            height: 100% !important;
            border-radius: 9999px !important;
          }
        }
      `}} />

      {/* ЭКРАННАЯ ВЕРСИЯ (ПРОСТОЙ ОТЧЕТ) */}
      <main className="mx-auto min-h-screen max-w-7xl px-6 py-10 lg:px-10 relative overflow-hidden print:hidden">
        
        {/* 3D-сфера на заднем плане (космическая заставка) */}
        <div className="absolute right-[-100px] top-[-50px] w-full md:w-[60%] h-[550px] pointer-events-none z-0 opacity-20 select-none hidden lg:block">
          <HeroOrb />
        </div>

        <div className="relative z-10">
          {/* Шапка отчета */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8 mb-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#7c8cff]/20 bg-[#7c8cff]/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-accentSoft font-syncopate">
                <Award className="h-3.5 w-3.5 text-[#7c8cff]" />
                Итоговый отчет
              </div>
              <h1 className="text-3xl font-extrabold font-unbounded text-text sm:text-4xl lg:text-5xl leading-tight">
                Карта талантов: {report.studentName}
              </h1>
              <p className="text-xs text-muted font-inter">
                {report.studentGrade ? `${report.studentGrade} класс обучения` : 'Класс обучения: 8'} · Сформировано на базе claude-opus-4-7
              </p>
            </div>

            {/* Кнопки действий */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-[#8b5cf6] px-5 py-3 text-sm font-bold text-white shadow-glow transition hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-4 w-4" />
                Скачать глубокий PDF
              </button>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-text transition hover:bg-white/10"
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
                Пройдите диагностику, чтобы сгенерировать собственный аналитический отчет.
              </p>
            </div>
          )}

          {/* Переключатель вкладок (Tabs) */}
          <div className="flex border-b border-white/5 mb-8 gap-6 md:gap-8 overflow-x-auto pb-px scrollbar-none">
            <button
              onClick={() => setActiveTab('talents')}
              className={`pb-4 text-sm md:text-base font-bold font-unbounded transition relative whitespace-nowrap ${
                activeTab === 'talents' ? 'text-text' : 'text-muted hover:text-text'
              }`}
            >
              Карта талантов
              {activeTab === 'talents' && (
                <motion.div
                  layoutId="activeReportTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-[#8b5cf6]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('career')}
              className={`pb-4 text-sm md:text-base font-bold font-unbounded transition relative whitespace-nowrap ${
                activeTab === 'career' ? 'text-text' : 'text-muted hover:text-text'
              }`}
            >
              Карьерный трек
              {activeTab === 'career' && (
                <motion.div
                  layoutId="activeReportTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-[#8b5cf6]"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab('parent')}
              className={`pb-4 text-sm md:text-base font-bold font-unbounded transition relative whitespace-nowrap ${
                activeTab === 'parent' ? 'text-text' : 'text-muted hover:text-text'
              }`}
            >
              Советы родителям
              {activeTab === 'parent' && (
                <motion.div
                  layoutId="activeReportTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-accent to-[#8b5cf6]"
                />
              )}
            </button>
          </div>

          {/* Контент вкладок (Простой компактный вид для экрана) */}
          <AnimatePresence mode="wait">
            {activeTab === 'talents' && (
              <motion.div
                key="talents"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22 }}
                className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]"
              >
                
                {/* Левая колонка талантов (Резюме + Интеллекты Гарднера компактно) */}
                <div className="space-y-8">
                  
                  {/* Главное резюме потенциала */}
                  <div className="rounded-[28px] border border-white/[0.04] bg-[#0b1125]/25 p-8 backdrop-blur-xl transition duration-300 hover:border-white/10 hover:shadow-[0_0_50px_-12px_rgba(124,140,255,0.12)]">
                    <h2 className="text-lg font-bold font-unbounded text-text mb-4">Главное резюме потенциала</h2>
                    <div className="space-y-3 font-inter text-muted text-base leading-relaxed">
                      {report.heroSummary.map((sentence) => (
                        <p key={sentence}>{sentence}</p>
                      ))}
                    </div>
                  </div>

                  {/* Множественные интеллекты (Гарднер) - Компактный вид */}
                  {report.multipleIntelligences && report.multipleIntelligences.length > 0 && (
                    <div className="rounded-[28px] border border-white/[0.04] bg-[#0b1125]/25 p-8 backdrop-blur-xl transition duration-300 hover:border-white/10 hover:shadow-[0_0_50px_-12px_rgba(124,140,255,0.12)]">
                      <div className="flex items-center gap-3 mb-6">
                        <Brain className="h-5 w-5 text-[#8b5cf6]" />
                        <h2 className="text-lg font-bold font-unbounded text-text">Множественные интеллекты (Гарднер)</h2>
                      </div>
                      <div className="grid gap-4 sm:grid-cols-2">
                        {report.multipleIntelligences.map((trait) => (
                          <div key={trait.name} className="rounded-xl border border-white/[0.02] bg-white/[0.01] p-4 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-3 mb-2">
                              <span className="text-xs font-bold text-text font-inter">{trait.name}</span>
                              <span className="text-xs font-bold text-[#8b5cf6] font-unbounded">{trait.score}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-accent to-[#8b5cf6] rounded-full" 
                                style={{ width: `${trait.score}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

                {/* Правая колонка талантов (Big Five + Силы/Зоны компактно) */}
                <div className="space-y-8">
                  
                  {/* Черты характера (Big Five) - Компактный вид */}
                  {report.personalityTraits && report.personalityTraits.length > 0 && (
                    <div className="rounded-[28px] border border-white/[0.04] bg-[#0b1125]/25 p-8 backdrop-blur-xl transition duration-300 hover:border-white/10 hover:shadow-[0_0_50px_-12px_rgba(124,140,255,0.12)]">
                      <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="h-5 w-5 text-[#7c8cff]" />
                        <h2 className="text-lg font-bold font-unbounded text-text">Личностный профиль (Big Five)</h2>
                      </div>
                      <div className="space-y-4">
                        {report.personalityTraits.map((trait) => (
                          <div key={trait.name} className="rounded-xl border border-white/[0.02] bg-white/[0.01] p-3 flex flex-col justify-center">
                            <div className="flex items-center justify-between gap-3 mb-1.5">
                              <span className="text-xs font-bold text-text font-inter">{trait.name}</span>
                              <span className="text-xs font-bold text-accentSoft font-unbounded">{trait.score}%</span>
                            </div>
                            <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-accentSoft to-accent rounded-full" 
                                style={{ width: `${trait.score}%` }} 
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Силы и зоны роста */}
                  <div className="grid gap-6">
                    {/* Сильные стороны */}
                    <div className="rounded-[24px] border border-white/[0.04] bg-[#0b1125]/25 p-6 backdrop-blur-xl transition duration-300 hover:border-white/10">
                      <h2 className="text-sm font-bold font-unbounded text-text mb-4 border-b border-white/5 pb-2.5">
                        Сильные стороны
                      </h2>
                      <ul className="space-y-3">
                        {report.strengths.map((str) => (
                          <li key={str} className="flex items-start gap-2.5 text-xs text-muted font-inter leading-relaxed">
                            <span className="text-emerald-400 font-bold mt-0.5">•</span>
                            <span>{str}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Зоны развития */}
                    <div className="rounded-[24px] border border-white/[0.04] bg-[#0b1125]/25 p-6 backdrop-blur-xl transition duration-300 hover:border-white/10">
                      <h2 className="text-sm font-bold font-unbounded text-text mb-4 border-b border-white/5 pb-2.5">
                        Зоны развития
                      </h2>
                      <ul className="space-y-3">
                        {report.growthAreas.map((zone) => (
                          <li key={zone} className="flex items-start gap-2.5 text-xs text-muted font-inter leading-relaxed">
                            <span className="text-accentSoft font-bold mt-0.5">•</span>
                            <span>{zone}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {activeTab === 'career' && (
              <motion.div
                key="career"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22 }}
                className="grid gap-8 lg:grid-cols-[1.25fr_0.75fr]"
              >
                
                {/* Рекомендованные профессии */}
                <div className="rounded-[28px] border border-white/[0.04] bg-[#0b1125]/25 p-8 backdrop-blur-xl transition duration-300 hover:border-white/10 hover:shadow-[0_0_50px_-12px_rgba(124,140,255,0.12)]">
                  <h2 className="text-lg font-bold font-unbounded text-text mb-6">Рекомендованные профессии</h2>
                  <div className="space-y-6">
                    {report.professions.map((prof) => (
                      <div key={prof.name} className="rounded-2xl border border-white/[0.03] bg-white/[0.01] p-6 transition duration-300 hover:border-white/10">
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <span className="text-base font-bold text-text font-inter">{prof.name}</span>
                          <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-semibold text-emerald-300 font-inter">
                            {prof.score}% Match
                          </span>
                        </div>
                        <p className="text-sm text-muted font-inter leading-relaxed mb-4">{prof.summary}</p>
                        
                        {/* Обоснование в стиле элегантной цитаты */}
                        <div className="border-l-2 border-[#7c8cff]/50 bg-[#7c8cff]/5 p-4 rounded-r-2xl text-xs leading-relaxed text-muted font-inter mb-4">
                          <span className="font-bold text-[#7c8cff] block mb-1">Разбор:</span> {prof.why}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {prof.subjects.map((sub) => (
                            <span key={sub} className="rounded-lg border border-white/5 bg-white/5 px-2.5 py-1 text-xs text-accentSoft font-inter">
                              {sub}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Школьные ориентиры */}
                <div className="space-y-8">
                  <div className="rounded-[28px] border border-white/[0.04] bg-[#0b1125]/25 p-8 backdrop-blur-xl transition duration-300 hover:border-white/10 hover:shadow-[0_0_50px_-12px_rgba(124,140,255,0.12)]">
                    <div className="flex items-center gap-3 mb-5">
                      <Compass className="h-5 w-5 text-[#8b5cf6]" />
                      <h2 className="text-lg font-bold font-unbounded text-text">Школьные ориентиры</h2>
                    </div>
                    <p className="text-xs text-muted font-inter leading-relaxed mb-4">
                      Рекомендуемые школьные предметы, на которые стоит сделать упор для построения успешной траектории:
                    </p>
                    <ul className="space-y-3.5">
                      {report.subjects.map((sub) => (
                        <li key={sub} className="flex items-start gap-2.5 text-xs text-muted font-inter leading-relaxed">
                          <span className="text-[#8b5cf6] font-bold mt-0.5">•</span>
                          <span>{sub}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </motion.div>
            )}

            {activeTab === 'parent' && (
              <motion.div
                key="parent"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.22 }}
                className="max-w-4xl mx-auto"
              >
                
                {/* Раздел для родителей */}
                <div className="rounded-[28px] border border-accent/20 bg-[#7c8cff]/5 p-8 md:p-10 backdrop-blur-xl shadow-[0_0_50px_rgba(124,140,255,0.04)]">
                  <div className="flex items-center gap-3 mb-5">
                    <User className="h-6 w-6 text-accentSoft" />
                    <h2 className="text-lg md:text-xl font-bold font-unbounded text-text">Рекомендации для родителей</h2>
                  </div>
                  <p className="text-sm text-muted font-inter leading-relaxed mb-6">
                    Как помочь ребенку раскрыть таланты, опираясь на сильные стороны, и обеспечить гармоничное развитие:
                  </p>
                  <div className="grid gap-5">
                    {report.parentSummary.map((item, index) => (
                      <div key={item} className="flex gap-4 items-start rounded-2xl border border-white/[0.03] bg-white/[0.01] p-5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-accent/15 border border-accent/20 text-xs font-bold text-[#7c8cff] font-unbounded">
                          {index + 1}
                        </div>
                        <p className="text-xs md:text-sm text-muted font-inter leading-relaxed pt-0.5">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </main>

      {/* ПЕЧАТНАЯ ВЕРСИЯ (РАСШИРЕННЫЙ ГЛУБОКИЙ ОТЧЕТ) */}
      <div className="hidden print:block print-container">
        
        {/* Титульный лист / Шапка отчета */}
        <div className="print-header">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24pt', fontWeight: 'bold', margin: 0, color: '#1e3a8a' }}>
                МоёПризвание
              </h1>
              <p style={{ fontSize: '10pt', color: '#64748b', margin: '4px 0 0 0' }}>
                Семейный ориентир в будущее
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '12pt', fontWeight: 'bold', margin: 0 }}>
                КАРТА ТАЛАНТОВ И ПРОФОРИЕНТАЦИЯ
              </p>
              <p style={{ fontSize: '9pt', color: '#64748b', margin: '4px 0 0 0' }}>
                Модель анализа: claude-opus-4-7
              </p>
            </div>
          </div>
          <div style={{ marginTop: '20px', fontSize: '11pt' }}>
            <strong>Ученик:</strong> {report.studentName} · <strong>Класс:</strong> {report.studentGrade || '8'} класс
          </div>
        </div>

        {/* Раздел 1. Главное резюме потенциала */}
        <div className="print-card">
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
            1. Главное резюме потенциала
          </h2>
          <div style={{ fontSize: '11pt', lineHeight: '1.6', color: '#334155', marginTop: '10px' }}>
            {report.heroSummary.map((sentence, idx) => (
              <p key={idx} style={{ marginBottom: '8px' }}>{sentence}</p>
            ))}
          </div>
        </div>

        {/* Раздел 2. Множественные интеллекты Говарда Гарднера */}
        {report.multipleIntelligences && report.multipleIntelligences.length > 0 && (
          <div className="print-card">
            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
              2. Множественные интеллекты (по Говарду Гарднеру)
            </h2>
            <div style={{ marginTop: '12px' }}>
              {report.multipleIntelligences.map((trait) => (
                <div key={trait.name} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '4px' }}>
                    <span>{trait.name}</span>
                    <span>{trait.score}%</span>
                  </div>
                  <div className="print-progress-bg">
                    <div className="print-progress-bar" style={{ width: `${trait.score}%` }} />
                  </div>
                  <p style={{ fontSize: '9.5pt', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                    {trait.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Разрыв страницы при печати */}
        <div className="print-page-break" />

        {/* Раздел 3. Личностный профиль Big Five */}
        {report.personalityTraits && report.personalityTraits.length > 0 && (
          <div className="print-card" style={{ marginTop: '20mm' }}>
            <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
              3. Личностный профиль (Big Five / OCEAN)
            </h2>
            <div style={{ marginTop: '12px' }}>
              {report.personalityTraits.map((trait) => (
                <div key={trait.name} style={{ marginBottom: '16px', pageBreakInside: 'avoid' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '10.5pt', marginBottom: '4px' }}>
                    <span>{trait.name}</span>
                    <span>{trait.score}%</span>
                  </div>
                  <div className="print-progress-bg">
                    <div className="print-progress-bar" style={{ width: `${trait.score}%` }} />
                  </div>
                  <p style={{ fontSize: '9.5pt', color: '#475569', marginTop: '6px', lineHeight: '1.5' }}>
                    {trait.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Раздел 4. Сильные стороны и зоны развития */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px', pageBreakInside: 'avoid' }}>
          <div className="print-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: '#047857', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
              Сильные стороны
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '10pt', color: '#334155', marginTop: '10px', lineHeight: '1.6' }}>
              {report.strengths.map((str, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{str}</li>
              ))}
            </ul>
          </div>
          <div className="print-card" style={{ marginBottom: 0 }}>
            <h3 style={{ fontSize: '12pt', fontWeight: 'bold', color: '#b91c1c', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
              Зоны развития
            </h3>
            <ul style={{ paddingLeft: '20px', fontSize: '10pt', color: '#334155', marginTop: '10px', lineHeight: '1.6' }}>
              {report.growthAreas.map((zone, idx) => (
                <li key={idx} style={{ marginBottom: '6px' }}>{zone}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Разрыв страницы при печати */}
        <div className="print-page-break" />

        {/* Раздел 5. Рекомендованные профессии */}
        <div className="print-card" style={{ marginTop: '20mm' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
            4. Рекомендованные профессии и сферы деятельности
          </h2>
          <div style={{ marginTop: '12px' }}>
            {report.professions.map((prof) => (
              <div key={prof.name} style={{ marginBottom: '20px', borderBottom: '1px dashed #e2e8f0', paddingBottom: '14px', pageBreakInside: 'avoid' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12pt', fontWeight: 'bold', color: '#1e3a8a' }}>{prof.name}</span>
                  <span style={{ fontSize: '10pt', fontWeight: 'bold', color: '#059669', background: '#ecfdf5', padding: '2px 8px', borderRadius: '9999px' }}>
                    Совпадение: {prof.score}%
                  </span>
                </div>
                <p style={{ fontSize: '10pt', fontWeight: '500', color: '#475569', margin: '4px 0 8px 0' }}>
                  {prof.summary}
                </p>
                <div style={{ background: '#f8fafc', borderLeft: '3px solid #3b82f6', padding: '8px 12px', fontSize: '9.5pt', color: '#334155', borderRadius: '0 8px 8px 0', lineHeight: '1.5' }}>
                  <strong>Обоснование:</strong> {prof.why}
                </div>
                <div style={{ marginTop: '8px', fontSize: '9pt', color: '#64748b' }}>
                  <strong>Профильные предметы:</strong> {prof.subjects.join(', ')}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Раздел 6. Школьные ориентиры */}
        <div className="print-card" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '12pt', fontWeight: 'bold', color: '#1e3a8a', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
            Приоритетные школьные предметы
          </h2>
          <ul style={{ paddingLeft: '20px', fontSize: '10pt', color: '#334155', marginTop: '10px', lineHeight: '1.6' }}>
            {report.subjects.map((sub, idx) => (
              <li key={idx} style={{ marginBottom: '6px' }}>{sub}</li>
            ))}
          </ul>
        </div>

        {/* Раздел 7. Рекомендации для родителей */}
        <div className="print-card" style={{ pageBreakInside: 'avoid' }}>
          <h2 style={{ fontSize: '14pt', fontWeight: 'bold', borderBottom: '1px solid #cbd5e1', paddingBottom: '6px', marginTop: 0 }}>
            5. Практический план действий для родителей
          </h2>
          <div style={{ marginTop: '12px' }}>
            {report.parentSummary.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '6px', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9.5pt', fontWeight: 'bold', color: '#1d4ed8', flexShrink: 0 }}>
                  {idx + 1}
                </div>
                <p style={{ fontSize: '10pt', color: '#334155', margin: 0, lineHeight: '1.5' }}>
                  {item}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}
