'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { ArrowRight, Users, HelpCircle, Shield, BookOpen, Clock, Brain, FileCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AnimatedLogo } from './components/AnimatedLogo';

import { IconTimer, IconScience, IconReport, UspCard, ForWhomCard, TrustCard, FaqItem, ReviewCard } from './components/landing/LandingUI';

const howItWorks = [
  { step: '01', title: 'Регистрация', text: 'Быстрый старт без анкет', icon: Users },
  { step: '02', title: 'Диагностика', text: '25 минут интерактивной игры', icon: Brain },
  { step: '03', title: 'Анализ ответов', text: 'Алгоритм сопоставляет результаты', icon: BookOpen },
  { step: '04', title: 'Отчёт', text: 'Профессии, предметы и план действий', icon: FileCheck },
];

const faqItems = [
  {
    q: 'Для кого подходит диагностика?',
    a: 'Для школьников 8–11 классов (13–18 лет), которые хотят разобраться в своих сильных сторонах и выбрать направление развития.',
  },
  {
    q: 'Насколько точны результаты?',
    a: 'Диагностика основана на трёх научных методиках мирового уровня: RIASEC, Big Five и теория множественного интеллекта Гарднера. Результаты носят рекомендательный характер.',
  },
  {
    q: 'Сколько времени занимает прохождение?',
    a: 'Полная диагностика занимает около 25 минут. Это интерактивный формат — не скучные тесты, а вовлекающие вопросы.',
  },
  {
    q: 'Что получит ребёнок после прохождения?',
    a: 'Подробный отчёт с профилем личности, списком подходящих профессий, рекомендациями по предметам и конкретным планом действий.',
  },
  {
    q: 'Безопасны ли данные ребёнка?',
    a: 'Да. Мы собираем минимум информации, не передаём её третьим лицам и используем исключительно для формирования отчёта.',
  },
];

const uspItems = [
  {
    icon: <IconTimer />,
    title: '25 минут',
    text: 'Вся диагностика — без длинных анкет и скучных вопросов',
  },
  {
    icon: <IconScience />,
    title: '3 научных метода',
    text: 'RIASEC, Big Five и Гарднер — проверенные мировые методики',
  },
  {
    icon: <IconReport />,
    title: 'Понятный отчёт',
    text: 'Профессии, предметы и шаги — ясно ребёнку и родителю',
  },
];

export default function HomePage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <main className="relative z-10 w-full overflow-hidden">
      
      {/* ─── HERO SECTION ─── */}
      <section className="relative min-h-screen flex items-center justify-center px-5 md:px-8 pt-32 pb-20">
        
        {mounted && (
          <div
            className="relative z-10 flex w-full max-w-[90%] flex-col items-start text-left pointer-events-auto pl-[5%] pr-6 md:max-w-[55vw] md:pr-10 lg:pr-0"
          >
            <p
              className="mb-4 text-[11px] font-bold uppercase tracking-[0.24em] text-[#8aaec4] font-sans"
            >
              Диагностика талантов для школьников
            </p>

            <h1
              className="w-full text-[2rem] leading-[1.08] font-extrabold text-[#253243] font-sans sm:text-[2.35rem] md:text-[2.85rem] lg:text-[2.25rem] lg:leading-[1.1] lg:whitespace-nowrap"
            >
              Поможем школьнику найти своё призвание
            </h1>

            <p
              className="mt-6 max-w-[640px] text-[0.98rem] sm:text-[1.08rem] md:text-[1.28rem] leading-relaxed text-[#566679] font-normal font-sans"
            >
              Раскройте сильные стороны ребёнка через 25 минут интерактивной диагностики и получите понятный план развития для всей семьи.
            </p>

            <div
              className="mt-9 flex flex-col items-start gap-4 sm:flex-row sm:items-center"
            >
              <Link href="/auth" className="cta-glass h-[62px] min-w-[250px] px-8 text-base sm:text-lg">
                Пройти диагностику
                <ArrowRight className="h-5 w-5" />
              </Link>
              <span className="text-sm font-semibold text-[#6b7888]">Без длинных анкет и скучных тестов</span>
            </div>
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

      {/* ─── ДЛЯ КОГО ─── */}
      <section className="px-6 lg:px-10 py-24 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div
            className="space-y-12"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Для кого
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Кому подходит диагностика
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ForWhomCard
                icon={<Users className="h-6 w-6 text-[#8aaec4]" />}
                title="Школьникам 8–11 классов"
                text="Идеальный возраст для осознанного выбора направления: от 13 до 18 лет"
              />
              <ForWhomCard
                icon={<Shield className="h-6 w-6 text-[#c6a766]" />}
                title="Родителям"
                text="Понятный отчёт с конкретными рекомендациями — без сложной психологической терминологии"
              />
              <ForWhomCard
                icon={<HelpCircle className="h-6 w-6 text-[#e9b9bd]" />}
                title="Тем, кто сомневается"
                text="Снимем тревогу вокруг выбора профессии и покажем реальные сильные стороны"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─── КАК ЭТО РАБОТАЕТ ─── */}
      <section className="px-6 lg:px-10 py-24 lg:py-32 relative z-10 bg-transparent">
        <div className="mx-auto max-w-5xl">
          <div
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Как это работает
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Четыре шага к результату
              </h2>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howItWorks.map((item) => {
                const StepIcon = item.icon;
                return (
                  <div
                    key={item.step}
                    className="glass-card rounded-[22px] p-6 text-center space-y-4 hover:border-[#9bbbcf]/40 hover:shadow-[0_16px_36px_rgba(88,116,138,0.08)] transition-all duration-300"
                  >
                    <div className="mx-auto w-12 h-12 rounded-2xl bg-[#9bbbcf]/10 flex items-center justify-center">
                      <StepIcon className="h-6 w-6 text-[#8aaec4]" />
                    </div>
                    <div className="text-3xl font-extrabold text-[#c6a766]/30 font-sans">
                      {item.step}
                    </div>
                    <h3 className="text-lg font-bold text-[#253243] font-sans">
                      {item.title}
                    </h3>
                    <p className="text-sm text-[#5e6b7e] leading-relaxed font-sans">
                      {item.text}
                    </p>
                  </div>
                );
              })}
            </div>

            <div className="text-center pt-4">
              <Link href="/auth" className="cta-glass h-[60px] min-w-[240px] px-8 text-base">
                Начать бесплатно
                <ArrowRight className="h-5 w-5" />
              </Link>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Почему нам доверяют
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Надёжная методика и прозрачность
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-3">
              <TrustCard
                number="3"
                label="научных метода"
                desc="RIASEC, Big Five, теория Гарднера — проверенные десятилетиями исследований"
              />
              <TrustCard
                number="25"
                label="минут"
                desc="Интерактивный формат, вовлекающий ребёнка вместо скучных анкет"
              />
              <TrustCard
                number="10+"
                label="направлений"
                desc="Медицина, IT, бизнес, творчество и другие сферы для точного подбора"
              />
            </div>

            <div className="glass-card rounded-[22px] p-8 text-center space-y-4">
              <Shield className="h-8 w-8 text-[#8aaec4] mx-auto" />
              <h3 className="text-lg font-bold text-[#253243]">Безопасность данных</h3>
              <p className="text-sm text-[#5e6b7e] leading-relaxed max-w-2xl mx-auto">
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Реальные истории
              </p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-[#253243] font-sans">
                Отзывы родителей и школьников
              </h2>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <ReviewCard
                author="Мария, мама 9-классника"
                text="Сын совершенно не понимал, куда идти после 9 класса. Диагностика показала сильный перекос в инженерию и IT. Отчет разложил всё по полочкам: какие предметы сдавать и куда поступать."
              />
              <ReviewCard
                author="Егор, 10 класс"
                text="Думал идти в юристы, потому что родители советовали. А тест показал, что у меня склонность к творческим профессиям и дизайну. Показал отчет маме, теперь она согласна со мной!"
              />
              <ReviewCard
                author="Елена, мама выпускницы"
                text="Очень удобный формат. Дочь прошла тест за 20 минут с телефона, а я получила PDF-отчет с подробным анализом. Это сняло столько напряжения в семье перед экзаменами!"
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#8aaec4] font-sans">
                Частые вопросы
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#253243] font-sans">
                Ответы для родителей
              </h2>
            </div>

            <div className="space-y-4">
              {faqItems.map((item, index) => (
                <FaqItem key={index} question={item.q} answer={item.a} />
              ))}
            </div>

            <div className="text-center pt-4">
              <Link href="/auth" className="cta-glass h-[60px] min-w-[260px] px-8 text-base">
                Начать диагностику
                <ArrowRight className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-[#253243]/5 bg-[#f7faf8]/85 relative z-10 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 lg:px-10 py-12">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <AnimatedLogo
                showText={true}
                className="h-8 w-auto opacity-60"
              />
              <span className="text-xs text-[#5e6b7e] font-sans">
                © {new Date().getFullYear()} SynthosAI Creative Studio
              </span>
            </div>
            
            <nav className="flex items-center gap-6 text-xs text-[#5e6b7e] font-sans">
              <Link href="/privacy">
                <span className="hover:text-[#1a2536] transition cursor-pointer">Политика конфиденциальности</span>
              </Link>
              <Link href="/terms">
                <span className="hover:text-[#1a2536] transition cursor-pointer">Пользовательское соглашение</span>
              </Link>
              <a href="mailto:hello@synthosai.ru" className="hover:text-[#1a2536] transition">
                Контакты
              </a>
            </nav>
          </div>
        </div>
      </footer>

    </main>
  );
}


