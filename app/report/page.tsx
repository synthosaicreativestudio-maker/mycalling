'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Brain, Compass, Sparkles, Award, RefreshCw, AlertCircle, ArrowLeft, Download, Loader2, ShieldCheck, Clock } from 'lucide-react';

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
  strengths: string[];
  growthAreas: string[];
  coachSection?: {
    dreams?: string;
    idols?: string;
    values?: string;
  };
  professions: Profession[];
};

const defaultReport: ReportData = {
  studentName: 'Демо-профиль',
  heroSummary: [
    'Выраженное сочетание аналитического мышления и творческого потенциала.',
    'Профиль указывает на склонность к решению концептуальных задач на стыке технологий и дизайна.'
  ],
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
  growthAreas: [
    'Переход от генерации концептов к практическому программированию и сборке.',
    'Работа в неопределенных условиях без готовых шаблонов.',
    'Развитие навыков планирования.'
  ],
  coachSection: {
    dreams: 'Мечтает разрабатывать цифровые продукты, приносящие пользу обществу.',
    idols: 'Вдохновляется инноваторами и создателями культовых технологических решений.',
    values: 'Главная ценность — свобода самовыражения и возможность созидать новые системы.'
  },
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

          if (!progressData.coachCompleted) {
            router.push('/coach');
            return;
          }

          if (!progressData.testCompleted) {
            router.push('/assessment');
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
        setReport(data.data);
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
                        <Brain className="h-5 w-5 text-[#3B82F6]" />
                        <h2 className="text-lg font-bold text-white">Качественный анализ диалога (Нейрокоуч)</h2>
                      </div>
                      <div className="space-y-4">
                        {report.coachSection.dreams && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[#3B82F6] mb-1">Мечты и устремления</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.dreams}</p>
                          </div>
                        )}
                        {report.coachSection.idols && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[#3B82F6] mb-1">Ролевые модели и кумиры</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.idols}</p>
                          </div>
                        )}
                        {report.coachSection.values && (
                          <div className="p-4 bg-white/[0.02] border border-white/5 rounded-2xl">
                            <h4 className="text-xs uppercase tracking-wider font-bold text-[#3B82F6] mb-1">Ключевые ценности</h4>
                            <p className="text-sm text-[#7A8A9E] leading-relaxed">{report.coachSection.values}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Правая колонка */}
                <div className="space-y-8">
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

                  {/* Силы и Зоны развития */}
                  <div className="glass-card rounded-[28px] p-8">
                    <h2 className="text-lg font-bold text-white mb-4">Сильные стороны и зоны развития</h2>
                    <div className="space-y-4">
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-emerald-400 mb-2">Сильные стороны</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-[#7A8A9E]">
                          {report.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs uppercase tracking-wider font-bold text-[#3B82F6] mb-2">Зоны развития</h4>
                        <ul className="list-disc list-inside space-y-1.5 text-xs text-[#7A8A9E]">
                          {report.growthAreas.map((g, i) => <li key={i}>{g}</li>)}
                        </ul>
                      </div>
                    </div>
                  </div>
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
                    </div>
                    <p className="text-[#7A8A9E] text-sm leading-relaxed">{report.riasecSummary}</p>
                  </div>
                )}

                {/* Рекомендуемые профессии */}
                <div className="glass-card rounded-[28px] p-8">
                  <h2 className="text-lg font-bold text-white mb-6">Подходящие профессии для развития</h2>
                  <div className="grid gap-6 md:grid-cols-2">
                    {report.professions.map((prof, idx) => (
                      <div key={idx} className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white">{prof.name}</h3>
                          <span className="text-xs font-bold px-2.5 py-1 bg-[#3B82F6]/10 text-[#3B82F6] rounded-full">
                            Совпадение: {prof.score}%
                          </span>
                        </div>
                        <p className="text-xs text-[#7A8A9E] leading-relaxed">{prof.why}</p>
                      </div>
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
            <p><strong>Мечты:</strong> {report.coachSection.dreams}</p>
            <p><strong>Кумиры:</strong> {report.coachSection.idols}</p>
            <p><strong>Ценности:</strong> {report.coachSection.values}</p>
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
