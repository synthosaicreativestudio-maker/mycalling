import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Inter, Cormorant_Garamond } from 'next/font/google';
import { SpaceBackground } from './components/SpaceBackground';
import { HeroOrb } from './components/HeroOrb';
import { IntroPreloader } from './components/IntroPreloader';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-inter',
  display: 'swap',
});

const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin', 'cyrillic'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant-garamond',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'МоёПризвание — ИИ-диагностика талантов',
  description: 'Определи свой путь. ИИ-диагностика талантов, характера и интересов за 25 минут. Понятный отчёт с рекомендациями по профессиям.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${inter.variable} ${cormorantGaramond.variable}`}>
      <body className="relative min-h-screen bg-transparent text-[#f0ece4]">
        <IntroPreloader />
        
        {/* Слой 1: Космический фон (самый нижний) */}
        <SpaceBackground />
        
        {/* Слой 2: Золотые частицы (фиксированный фон) */}
        <HeroOrb />
        
        {/* Sticky Header */}
        <header className="site-header print:hidden">
          <div className="site-header-inner">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex items-center justify-between py-4">
                <Link href="/" className="flex items-center transition hover:opacity-90">
                  <img
                    src="/assets/logos/logo-with-text.svg"
                    alt="МоёПризвание"
                    className="h-12 md:h-16 w-auto object-contain"
                  />
                </Link>
                
                <div className="flex items-center gap-6">
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-[#8a8694] hover:text-[#f0ece4] transition duration-300"
                  >
                    Войти
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
      </body>
    </html>
  );
}
