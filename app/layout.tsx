import './globals.css';
import type { Metadata } from 'next';
import './lib/env';
import Link from 'next/link';
import { Manrope, Prata, Marck_Script } from 'next/font/google';
import { AnimatedLogo } from './components/AnimatedLogo';
import { DarkCosmicBackground } from './components/DarkCosmicBackground';

import { ExitIntentPopup } from './components/ExitIntentPopup';
import { CookieBanner } from './components/CookieBanner';
import logger from './lib/logger';
import { LazyMotion, domAnimation } from 'framer-motion';

const manrope = Manrope({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-manrope',
  display: 'swap',
});

const prata = Prata({
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  variable: '--font-prata',
  display: 'swap',
});

const marckScript = Marck_Script({
  subsets: ['latin', 'cyrillic'],
  weight: ['400'],
  variable: '--font-signature',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://synthosai.ru'),
  title: 'МоёПризвание — диагностика талантов для школьников',
  description: 'Определи свой путь. Глубокая диагностика талантов, характера и интересов за 25 минут. Понятный отчёт с рекомендациями по профессиям для школьников 8–11 классов.',
  keywords: ['профориентация', 'диагностика талантов', 'тест на профессию', 'школьник', 'выбор профессии', 'RIASEC', 'Big Five'],
  authors: [{ name: 'SynthosAI Creative Studio' }],
  icons: {
    icon: '/assets/logos/logo.png',
    apple: '/assets/logos/logo.png',
  },
  openGraph: {
    title: 'МоёПризвание — диагностика талантов для школьников',
    description: 'Раскройте сильные стороны ребёнка через 25 минут интерактивной диагностики. Понятный отчёт с профессиями и планом действий.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'МоёПризвание',
    images: [
      {
        url: '/assets/logos/logo-with-text.png',
        width: 1200,
        height: 630,
        alt: 'МоёПризвание — диагностика талантов',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'МоёПризвание — диагностика талантов',
    description: 'Глубокая диагностика талантов за 25 минут. Понятный отчёт для всей семьи.',
    images: ['/assets/logos/logo-with-text.png'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  logger.info('App started');
  return (
    <html lang="ru" className={`${manrope.variable} ${prata.variable} ${marckScript.variable}`}>
      <head>

      </head>
      <body className="relative min-h-screen bg-transparent text-[#E8ECF0]">
        <LazyMotion features={domAnimation}>
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "МоёПризвание",
                "url": "https://synthosai.ru",
                "applicationCategory": "EducationalApplication",
                "operatingSystem": "All",
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "RUB"
                }
              }),
            }}
          />

          
          {/* Слой 1: Космический фон (самый нижний) */}
          <DarkCosmicBackground />
          
          {/* Sticky Header */}
          <header className="site-header print:hidden">
            <div className="site-header-inner">
              <div className="mx-auto max-w-7xl px-6 lg:px-10">
                <div className="flex items-center justify-between py-2">
                  <Link href="/" className="flex items-center transition hover:opacity-90">
                    <AnimatedLogo
                      showText={true}
                      animate={true}
                      isHeader={true}
                      className="w-auto"
                    />
                  </Link>
                  
                  <div className="flex items-center gap-6">
                    <Link
                      href="/auth"
                      className="text-sm font-medium text-slate-400 hover:text-white transition duration-300"
                    >
                      Личный кабинет
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Слой 3: Контент (скроллится поверх фона) */}
          <div className="content-layer">
            {children}
          </div>
          
          <CookieBanner />
        </LazyMotion>
      </body>
    </html>
  );
}
