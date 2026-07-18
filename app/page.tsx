'use client';

import Link from 'next/link';
import { ArrowRight, Users, HelpCircle, Shield, Brain, FileCheck, Lock, Unlock, MessageSquare, Compass, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatedLogo } from './components/AnimatedLogo';
import { IconTimer, IconScience, IconReport, UspCard, ForWhomCard, TrustCard, FaqItem, ReviewCard } from './components/landing/LandingUI';
import { m } from 'framer-motion';
import { sectionVariants, fadeUpVariants, heroVariants } from './lib/animations';

const faqItems = [
  {
    q: 'Для кого подходит диагностика?',
    a: 'Для школьников 8–11 классов (13–18 лет), которые хотят разобраться в своих сильных сторонах и выбрать направление развития.',
  },
  {
    q: 'Насколько точны результаты?',
    a: 'Диагностика основана на 6 научно признанных методиках: RIASEC (интересы), Big Five (личность), ICAR (когнитивный профиль), VIA (сильные стороны характера), PVQ (ценности по Шварцу) и шкала прокрастинации. Результаты дополняются качественным анализом диалога с нейрокоучем.',
  },
  {
    q: 'Сколько времени занимает прохождение?',
    a: 'Диалог с нейрокоучем занимает 15–20 минут, интерактивные тесты (6 блоков, около 100 вопросов) — ещё 25–35 минут. В сумме — примерно 45–60 минут на полный цифровой профиль.',
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
    title: '45–60 минут',
    text: 'Вся диагностика — в формате живого диалога и интерактивных заданий, без скучных анкет',
  },
  {
    icon: <IconScience />,
    title: 'Научный подход',
    text: '6 признанных методик — RIASEC, Big Five, ICAR, VIA, PVQ и шкала прокрастинации',
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

    async function checkProgress() {
      try {
        const res = await fetch('/api/auth/progress');
        const data = await res.json();
        if (data.authenticated) {
          setCoachCompleted(data.coachCompleted || false);
          setTestCompleted(data.testCompleted || false);
          return;
        }
      } catch (err) {
        console.error('Error checking progress:', err);
      }


    }

    checkProgress();
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
          <m.div
            variants={sectionVariants}
            initial="hidden"
            animate="visible"
            className="relative z-10 flex w-full flex-col items-start text-left pointer-events-auto max-w-full md:max-w-2xl lg:max-w-4xl"
          >
            <m.p
              custom={0.2}
              variants={heroVariants}
              className="mb-5 text-[11px] font-bold uppercase tracking-[0.24em] text-[#3B82F6] font-sans"
            >
              Диагностика потенциала для школьников и родителей
            </m.p>

            <m.h1
              custom={0.4}
              variants={heroVariants}
              className="w-full text-3xl leading-[1.15] font-extrabold text-white font-sans sm:text-4xl md:text-5xl lg:text-[3.5rem] tracking-tight mb-1"
            >
              Бесплатно поможем школьнику <br className="hidden sm:inline" />найти своё призвание
            </m.h1>

            <m.p
              custom={0.6}
              variants={heroVariants}
              className="mt-9 w-full text-[0.98rem] sm:text-[1.08rem] md:text-[1.2rem] leading-relaxed text-[#7A8A9E] font-normal font-sans"
            >
              Раскройте сильные стороны ребёнка за 45–60 минут интерактивной диагностики и получите понятный план развития для всей семьи.
            </m.p>

            <m.div
              custom={0.8}
              variants={heroVariants}
              className="mt-12 flex flex-col items-start gap-4 sm:flex-row sm:items-center justify-start"
            >
              <div className="cta-glow-wrapper rounded-full">
                <Link href={mainCtaLink} className="cta-glass h-[62px] min-w-[280px] px-8 text-base sm:text-lg">
                  {mainCtaText}
                  <ArrowRight className="h-5 w-5" />
                </Link>
              </div>
            </m.div>
            <m.span
              custom={1.0}
              variants={heroVariants}
              className="text-xs font-semibold text-[#60A5FA]/70 mt-3 pl-2"
            >
              Бесплатно · Без длинных анкет и скучных тестов
            </m.span>
          </m.div>
        )}

      </section>

      {/* ─── УТП (3 карточки) ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="grid gap-6 sm:grid-cols-3"
          >
            {uspItems.map((item, idx) => (
              <m.div
                key={idx}
                variants={fadeUpVariants}
                className="perspective-[1000px] h-full"
              >
                <UspCard icon={item.icon} title={item.title} text={item.text} />
              </m.div>
            ))}
          </m.div>
        </div>
      </section>

      {/* ─── ШАГ-КАРТЫ (Раздел 10 ТЗ) ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-16"
          >
            <m.div variants={fadeUpVariants} className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6] font-sans">
                Интерактивная карта
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-sans">
                Шаги к вашему цифровому профилю
              </h2>
              <p className="text-sm text-[#7A8A9E] max-w-xl mx-auto">
                Последовательно пройдите все этапы. Доступ к следующему шагу открывается автоматически по завершении предыдущего.
              </p>
            </m.div>

            <div className="grid gap-8 md:grid-cols-3 relative">
              {/* Шаг 1: Коуч-сессия */}
              <m.div
                variants={fadeUpVariants}
                className="glass-card rounded-[24px] p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden"
              >
                <div className="absolute top-4 right-4 text-xs font-extrabold text-[#3B82F6]/20">01</div>
                <div className="space-y-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center text-[#3B82F6]">
                    <Brain className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Нейрокоуч-сессия</h3>
                  <p className="text-sm text-[#7A8A9E] leading-relaxed">
                    Доверительный диалог о мечтах, увлечениях и ценностях. Нативная регистрация.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold text-[#3B82F6] uppercase tracking-wider">Открыто</span>
                  <Link href="/coach" className="text-sm font-semibold text-[#3B82F6] hover:underline flex items-center gap-1">
                    Войти <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </m.div>

              {/* Шаг 2: Диагностика (тесты) */}
              <m.div
                variants={fadeUpVariants}
                className={`glass-card rounded-[24px] p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden ${coachCompleted ? '' : 'opacity-60 pointer-events-none'
                  }`}
              >
                <div className="absolute top-4 right-4 text-xs font-extrabold text-[#3B82F6]/20">02</div>
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${coachCompleted ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-white/5 text-[#7A8A9E]'
                    }`}>
                    {coachCompleted ? <Compass className="h-6 w-6" /> : <Lock className="h-5 w-5 text-[#7A8A9E]" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">Интерактивная диагностика</h3>
                  <p className="text-sm text-[#7A8A9E] leading-relaxed">
                    Валидированные тесты интересов (RIASEC), личности (Big Five), когнитивного профиля (ICAR), сильных сторон (VIA) и ценностей (PVQ).
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A8A9E]">
                    {coachCompleted ? 'Открыто' : 'Заблокировано'}
                  </span>
                  {coachCompleted ? (
                    <Link href="/assessment" className="text-sm font-semibold text-[#3B82F6] hover:underline flex items-center gap-1">
                      Войти <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted">Пройдите коуча</span>
                  )}
                </div>
              </m.div>

              {/* Шаг 3: Отчёт */}
              <m.div
                variants={fadeUpVariants}
                className={`glass-card rounded-[24px] p-8 flex flex-col justify-between min-h-[250px] relative overflow-hidden ${coachCompleted && testCompleted ? '' : 'opacity-60 pointer-events-none'
                  }`}
              >
                <div className="absolute top-4 right-4 text-xs font-extrabold text-[#3B82F6]/20">03</div>
                <div className="space-y-4">
                  <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${coachCompleted && testCompleted ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-white/5 text-[#7A8A9E]'
                    }`}>
                    {coachCompleted && testCompleted ? <FileCheck className="h-6 w-6" /> : <Lock className="h-5 w-5 text-[#7A8A9E]" />}
                  </div>
                  <h3 className="text-xl font-bold text-white">Персональный отчёт</h3>
                  <p className="text-sm text-[#7A8A9E] leading-relaxed">
                    Готовый цифровой профиль, рекомендации по развитию и выбору направлений обучения. Web + PDF.
                  </p>
                </div>
                <div className="mt-6 flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#7A8A9E]">
                    {coachCompleted && testCompleted ? 'Открыто' : 'Заблокировано'}
                  </span>
                  {coachCompleted && testCompleted ? (
                    <Link href="/report" className="text-sm font-semibold text-[#3B82F6] hover:underline flex items-center gap-1">
                      Открыть отчёт <ArrowRight className="h-4 w-4" />
                    </Link>
                  ) : (
                    <span className="text-xs text-muted">Пройдите диагностику</span>
                  )}
                </div>
              </m.div>
            </div>
          </m.div>
        </div>
      </section>

      {/* ─── ДЛЯ КОГО ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-12"
          >
            <m.div variants={fadeUpVariants} className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6] font-sans">
                Для кого
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-sans">
                Кому подходит диагностика
              </h2>
            </m.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <m.div variants={fadeUpVariants} className="h-full">
                <ForWhomCard
                  icon={<Users className="h-6 w-6 text-[#3B82F6]" />}
                  title="Школьникам 8–11 классов"
                  text="Идеальный возраст для осознанного выбора направления: от 13 до 18 лет"
                />
              </m.div>
              <m.div variants={fadeUpVariants} className="h-full">
                <ForWhomCard
                  icon={<Shield className="h-6 w-6 text-[#60A5FA]" />}
                  title="Родителям"
                  text="Понятный отчёт с конкретными рекомендациями — без сложной психологической терминологии"
                />
              </m.div>
              <m.div variants={fadeUpVariants} className="h-full">
                <ForWhomCard
                  icon={<HelpCircle className="h-6 w-6 text-[#93C5FD]" />}
                  title="Тем, кто сомневается"
                  text="Снимем тревогу вокруг выбора профессии и покажем реальные сильные стороны"
                />
              </m.div>
            </div>
          </m.div>
        </div>
      </section>

      {/* ─── SOCIAL PROOF ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
            className="space-y-12"
          >
            <m.div variants={fadeUpVariants} className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6] font-sans">
                Почему нам доверяют
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-sans">
                Надёжная методика и прозрачность
              </h2>
            </m.div>

            <div className="grid gap-6 sm:grid-cols-3">
              <m.div variants={fadeUpVariants} className="h-full">
                <TrustCard
                  number="6"
                  label="научных методик"
                  desc="RIASEC, Big Five, ICAR, VIA, PVQ и шкала прокрастинации — проверенные десятилетиями исследований методики психометрики"
                />
              </m.div>
              <m.div variants={fadeUpVariants} className="h-full">
                <TrustCard
                  number="45–60"
                  label="минут"
                  desc="Интерактивный формат в виде диалога и игр, вовлекающий ребёнка вместо скучных тестов"
                />
              </m.div>
              <m.div variants={fadeUpVariants} className="h-full">
                <TrustCard
                  number="120+"
                  label="профессий"
                  desc="Медицина, IT, бизнес, творчество и другие сферы — из 20 отраслей для точного подбора направлений"
                />
              </m.div>
            </div>

            <m.div variants={fadeUpVariants} className="glass-card rounded-[22px] p-8 text-center space-y-4">
              <Shield className="h-8 w-8 text-[#3B82F6] mx-auto" />
              <h3 className="text-lg font-bold text-white">Безопасность данных</h3>
              <p className="text-sm text-[#7A8A9E] leading-relaxed max-w-2xl mx-auto">
                Мы собираем минимум информации, не передаём её третьим лицам и используем исключительно для формирования персонального отчёта. Все данные защищены.
              </p>
            </m.div>
          </m.div>
        </div>
      </section>

      {/* ─── ОТЗЫВЫ И КЕЙСЫ ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-6xl">
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-12"
          >
            <m.div variants={fadeUpVariants} className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6] font-sans">
                Реальные истории
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-sans">
                Отзывы родителей и школьников
              </h2>
            </m.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <m.div variants={fadeUpVariants} className="h-full">
                <ReviewCard
                  author="Мария, мама 9-классника"
                  text="Сын совершенно не понимал, куда идти после 9 класса. Диагностика показала сильный перекос в инженерию и IT. Отчет разложил всё по полочкам: какие сферы развивать и на что обратить внимание."
                />
              </m.div>
              <m.div variants={fadeUpVariants} className="h-full">
                <ReviewCard
                  author="Егор, 10 класс"
                  text="Думал идти в юристы, потому что родители советовали. А тест показал, что у меня склонность к творческим сферам и дизайну. Показал отчет маме, теперь она согласна со мной!"
                />
              </m.div>
              <m.div variants={fadeUpVariants} className="h-full">
                <ReviewCard
                  author="Елена, мама выпускницы"
                  text="Очень удобный формат. Дочь прошла сессию с телефона за 30 минут, а я получила PDF-отчет с подробным анализом. Это сняло столько напряжения в семье перед экзаменами!"
                />
              </m.div>
            </div>
          </m.div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 relative z-10 bg-transparent">
        <div className="mx-auto max-w-3xl">
          <m.div
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            className="space-y-12"
          >
            <m.div variants={fadeUpVariants} className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#3B82F6] font-sans">
                Частые вопросы
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-sans">
                Ответы для родителей
              </h2>
            </m.div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <m.div key={index} variants={fadeUpVariants}>
                  <FaqItem question={item.q} answer={item.a} />
                </m.div>
              ))}
            </div>

            <m.div variants={fadeUpVariants} className="text-center pt-4">
              <Link href={mainCtaLink} className="cta-glass h-[60px] min-w-[280px] px-8 text-base">
                {mainCtaText}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </m.div>
          </m.div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#3B82F6]/10 bg-[#040506]/85 relative z-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <AnimatedLogo
                showText={true}
                className="h-8 w-auto opacity-60"
              />
              <span className="text-xs text-[#7A8A9E] font-sans">
                © {new Date().getFullYear()} SynthosAI Creative Studio
              </span>
            </div>

            <nav className="flex items-center gap-6 text-xs text-[#7A8A9E] font-sans">
              <Link href="/privacy">
                <span className="hover:text-white transition cursor-pointer">Политика конфиденциальности</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-white transition cursor-pointer">Пользовательское соглашение</span>
              </Link>
              <a href="mailto:hello@synthosai.ru" className="hover:text-white transition">
                Контакты
              </a>
            </nav>
          </div>
        </div>
      </footer>

    </main>
  );
}
