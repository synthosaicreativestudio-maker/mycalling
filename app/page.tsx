'use client';

import Link from 'next/link';
import { ArrowRight, Users, HelpCircle, Shield, Brain, FileCheck, Lock, Unlock, MessageSquare, Compass, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatedLogo } from './components/AnimatedLogo';
import { IconTimer, IconScience, IconReport, UspCard, ForWhomCard, TrustCard, FaqItem, ReviewCard } from './components/landing/LandingUI';

const faqItems = [
  {
    q: 'Для кого подходит диагностика?',
    a: 'Для школьников 8–11 классов (13–18 лет), которые хотят разобраться в своих сильных сторонах и выбрать направление развития.',
  },
  {
    q: 'Насколько точны результаты?',
    a: 'Диагностика основана на научно признанных методиках: RIASEC и Big Five (Большая Пятерка). Результаты дополняются качественным анализом диалога с нейрокоучем.',
  },
  {
    q: 'Сколько времени занимает прохождение?',
    a: 'Вся сессия занимает около 30–40 минут: диалог с нейрокоучем (~15 минут) + интерактивные тесты (~15 минут).',
  },
  {
    q: 'Что получит ребенок и родитель после прохождения?',
    a: 'Подробный интерактивный Web-отчет и PDF-файл для скачивания с описанием сильных сторон, подходящих сфер и практическими рекомендациями.',
  },
  {
    q: 'Безопасны ли данные ребенка?',
    a: 'Да. Мы строго следуем правилам защиты персональных данных, собираем минимум информации и не передаем ее третьим лицам.',
  },
];

const uspItems = [
  {
    icon: <IconTimer />,
    title: '30–40 минут',
    text: 'Вся диагностика — без длинных анкет и скучных вопросов',
  },
  {
    icon: <IconScience />,
    title: 'Научный подход',
    text: 'RIASEC и Big Five — золотой стандарт современной психометрики талантов',
  },
  {
    icon: <IconReport />,
    title: 'Понятный отчёт',
    text: 'Ясные рекомендации по развитию и направлениям для всей семьи',
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [coachCompleted, setCoachCompleted] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const coachSessionId = localStorage.getItem('coachSessionId');
      // В реальном сценарии мы можем проверять флаг в localStorage
      const studentName = localStorage.getItem('studentName');
      if (studentName) {
        setCoachCompleted(true);
      }
      const diagnosticCompleted = localStorage.getItem('diagnosticCompleted');
      if (diagnosticCompleted) {
        setTestCompleted(true);
      }
    }
  }, []);

  // Определяем, куда ведет главная кнопка
  let mainCtaLink = '/coach';
  let mainCtaText = 'Начать сессию с коучем';
  
  if (coachCompleted && !testCompleted) {
    mainCtaLink = '/assessment';
    mainCtaText = 'Перейти к диагностике';
  } else if (coachCompleted && testCompleted) {
    mainCtaLink = '/report';
    mainCtaText = 'Посмотреть отчёт';
  }

  return (
    <main className="relative z-10 w-full overflow-hidden">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-start px-6 md:px-12 lg:px-24 pt-44 md:pt-52 pb-20">
        
        {mounted && (
          <div
            className="relative z-10 flex w-full flex-col items-start text-left pointer-events-auto max-w-full md:max-w-[55vw] lg:max-w-[48vw]"
          >
            <p
              className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#8c6e4b] font-sans"
            >
              Диагностика потенциала для школьников и родителей
            </p>

            <h1
              className="w-full text-[2.5rem] leading-[1.08] font-extrabold text-[#3d3123] font-sans sm:text-[3.25rem] md:text-[3.85rem] lg:text-[4.25rem] lg:leading-[1.1] mb-2"
            >
              Поможем школьнику найти своё призвание
            </h1>

            <p
              className="mt-12 w-full text-[0.98rem] sm:text-[1.08rem] md:text-[1.2rem] leading-relaxed text-[#736251] font-normal font-sans"
            >
              Раскройте сильные стороны ребёнка через 30 минут интерактивной диагностики и получите понятный план развития для всей семьи.
            </p>

            <div
              className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center justify-start"
            >
              <Link href={mainCtaLink} className="cta-glass h-[62px] min-w-[280px] px-8 text-base sm:text-lg">
                {mainCtaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
            <span className="text-xs font-semibold text-[#b39f85] mt-3 pl-2">Без длинных анкет и скучных тестов</span>
          </div>
        )}

      </section>
 
      {/* ─── УТП (3 карточки) ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div
            className="grid gap-6 sm:grid-cols-3"
          >
            {uspItems.map((item, idx) => (
              <div
                key={idx}
                className="perspective-[1000px]"
              >
                <UspCard icon={item.icon} title={item.title} text={item.text} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── ШАГ-КАРТЫ (Раздел 10 ТЗ) ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div className="space-y-16">
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6e4b] font-sans">
                Интерактивная карта
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3d3123] font-sans">
                Шаги к вашему цифровому профилю
              </h2>
              <p className="text-sm text-[#736251] max-w-xl mx-auto">
                Последовательно пройдите все этапы. Доступ к следующему шагу открывается автоматически по завершении предыдущего.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3 relative">
              {/* Шаг 1: Коуч-сессия */}
              <div className="glass-card rounded-[24px] p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden border border-[#8c6e4b]/20">
                <div className="absolute top-4 right-4 text-xs font-extrabold text-[#8c6e4b]/20">01</div>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#8c6e4b]/10 flex items-center justify-center text-[#8c6e4b]">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-[#3d3123]">Нейрокоуч-сессия</h3>
                  <p className="text-sm text-[#736251] leading-relaxed">
                    Доверительный диалог о мечтах, увлечениях и ценностях. Нативная регистрация.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#8c6e4b] uppercase tracking-wider">Открыто</span>
                  <Link href="/coach" className="text-sm font-semibold text-[#8c6e4b] hover:underline flex items-center gap-1">
                    Войти <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Шаг 2: Диагностика (тесты) */}
              <div className={`glass-card rounded-[24px] p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden border ${
                coachCompleted ? 'border-[#8c6e4b]/20' : 'opacity-60 border-black/5'
              }`}>
                <div className="absolute top-4 right-4 text-xs font-extrabold text-[#8c6e4b]/20">02</div>
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    coachCompleted ? 'bg-[#8c6e4b]/10 text-[#8c6e4b]' : 'bg-black/5 text-[#736251]'
                  }`}>
                    {coachCompleted ? <Compass className="h-6 w-6" /> : <Lock className="h-5 w-5 text-[#736251]" />}
                  </div>
                  <h3 className="text-xl font-bold text-[#3d3123]">Интерактивная диагностика</h3>
                  <p className="text-sm text-[#736251] leading-relaxed">
                    Короткие валидированные тесты интересов (RIASEC), личности (Big Five) и когнитивных проб.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#736251]">
                    {coachCompleted ? 'Открыто' : 'Заблокировано'}
                  </span>
                  {coachCompleted ? (
                    <Link href="/assessment" className="text-sm font-semibold text-[#8c6e4b] hover:underline flex items-center gap-1">
                      Войти <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted">Пройдите коуча</span>
                  )}
                </div>
              </div>

              {/* Шаг 3: Отчёт */}
              <div className={`glass-card rounded-[24px] p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden border ${
                coachCompleted && testCompleted ? 'border-[#8c6e4b]/20' : 'opacity-60 border-black/5'
              }`}>
                <div className="absolute top-4 right-4 text-xs font-extrabold text-[#8c6e4b]/20">03</div>
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${
                    coachCompleted && testCompleted ? 'bg-[#8c6e4b]/10 text-[#8c6e4b]' : 'bg-black/5 text-[#736251]'
                  }`}>
                    {coachCompleted && testCompleted ? <FileCheck className="h-6 w-6" /> : <Lock className="h-5 w-5 text-[#736251]" />}
                  </div>
                  <h3 className="text-xl font-bold text-[#3d3123]">Персональный отчёт</h3>
                  <p className="text-sm text-[#736251] leading-relaxed">
                    Готовый цифровой профиль, рекомендации по развитию и выбору направлений обучения. Web + PDF.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#736251]">
                    {coachCompleted && testCompleted ? 'Открыто' : 'Заблокировано'}
                  </span>
                  {coachCompleted && testCompleted ? (
                    <Link href="/report" className="text-sm font-semibold text-[#8c6e4b] hover:underline flex items-center gap-1">
                      Открыть отчёт <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted">Пройдите диагностику</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ДЛЯ КОГО ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6e4b] font-sans">
                Для кого
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3d3123] font-sans">
                Кому подходит диагностика
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ForWhomCard
                icon={<Users className="h-6 w-6 text-[#8c6e4b]" />}
                title="Школьникам 8–11 классов"
                text="Идеальный возраст для осознанного выбора направления: от 13 до 18 лет"
              />
              <ForWhomCard
                icon={<Shield className="h-6 w-6 text-[#c2ab87]" />}
                title="Родителям"
                text="Понятный отчёт с конкретными рекомендациями — без сложной психологической терминологии"
              />
              <ForWhomCard
                icon={<HelpCircle className="h-6 w-6 text-[#b39f85]" />}
                title="Тем, кто сомневается"
                text="Снимем тревогу вокруг выбора профессии и покажем реальные сильные стороны"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6e4b] font-sans">
                Почему нам доверяют
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3d3123] font-sans">
                Надёжная методика и прозрачность
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <TrustCard
                number="2"
                label="научных метода"
                desc="RIASEC и Big Five — проверенные десятилетиями исследований методики психометрики талантов"
              />
              <TrustCard
                number="30"
                label="минут"
                desc="Интерактивный формат в виде диалога и игр, вовлекающий ребёнка вместо скучных тестов"
              />
              <TrustCard
                number="10+"
                label="направлений"
                desc="Медицина, IT, бизнес, творчество и другие сферы для точного подбора сфер развития"
              />
            </div>

            <div className="glass-card rounded-[22px] p-8 text-center space-y-4">
              <Shield className="h-8 w-8 text-[#8c6e4b] mx-auto" />
              <h3 className="text-lg font-bold text-[#3d3123]">Безопасность данных</h3>
              <p className="text-sm text-[#736251] leading-relaxed max-w-2xl mx-auto">
                Мы собираем минимум информации, не передаём её третьим лицам и используем исключительно для формирования персонального отчёта. Все данные защищены.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── ОТЗЫВЫ И КЕЙСЫ ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-6xl">
          <div
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6e4b] font-sans">
                Реальные истории
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#3d3123] font-sans">
                Отзывы родителей и школьников
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ReviewCard
                author="Мария, мама 9-классника"
                text="Сын совершенно не понимал, куда идти после 9 класса. Диагностика показала сильный перекос в инженерию и IT. Отчет разложил всё по полочкам: какие сферы развивать и на что обратить внимание."
              />
              <ReviewCard
                author="Егор, 10 класс"
                text="Думал идти в юристы, потому что родители советовали. А тест показал, что у меня склонность к творческим сферам и дизайну. Показал отчет маме, теперь она согласна со мной!"
              />
              <ReviewCard
                author="Елена, мама выпускницы"
                text="Очень удобный формат. Дочь прошла сессию с телефона за 30 минут, а я получила PDF-отчет с подробным анализом. Это сняло столько напряжения в семье перед экзаменами!"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 relative z-10 bg-transparent">
        <div className="mx-auto max-w-3xl">
          <div
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8c6e4b] font-sans">
                Частые вопросы
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#3d3123] font-sans">
                Ответы для родителей
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <FaqItem key={index} question={item.q} answer={item.a} />
              ))}
            </div>

            <div className="text-center pt-4">
              <Link href={mainCtaLink} className="cta-glass h-[60px] min-w-[280px] px-8 text-base">
                {mainCtaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#8c6e4b]/10 bg-[#fbf9f6]/85 relative z-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <AnimatedLogo
                showText={true}
                className="h-8 w-auto opacity-60"
              />
              <span className="text-xs text-[#736251] font-sans">
                © {new Date().getFullYear()} SynthosAI Creative Studio
              </span>
            </div>
            
            <nav className="flex items-center gap-6 text-xs text-[#736251] font-sans">
              <Link href="/privacy">
                <span className="hover:text-[#3d3123] transition cursor-pointer">Политика конфиденциальности</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-[#3d3123] transition cursor-pointer">Пользовательское соглашение</span>
              </Link>
              <a href="mailto:hello@synthosai.ru" className="hover:text-[#3d3123] transition">
                Контакты
              </a>
            </nav>
          </div>
        </div>
      </footer>

    </main>
  );
}
