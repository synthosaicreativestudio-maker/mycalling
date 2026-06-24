import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';
import { Manrope, Prata, Marck_Script } from 'next/font/google';
import { AnimatedLogo } from './components/AnimatedLogo';
import { SpaceBackground } from './components/SpaceBackground';
import { IntroPreloader } from './components/IntroPreloader';

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
  title: 'МоёПризвание — диагностика талантов',
  description: 'Определи свой путь. Глубокая диагностика талантов, характера и интересов за 25 минут. Понятный отчёт с рекомендациями по профессиям.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${manrope.variable} ${prata.variable} ${marckScript.variable}`}>
      <body className="relative min-h-screen bg-transparent text-[#1a2536]">
        <IntroPreloader />
        
        {/* Слой 1: Космический фон (самый нижний) */}
        <SpaceBackground />
        
        {/* Sticky Header */}
        <header className="site-header print:hidden">
          <div className="site-header-inner">
            <div className="mx-auto max-w-7xl px-6 lg:px-10">
              <div className="flex items-center justify-between py-4">
                <Link href="/" className="flex items-center transition hover:opacity-90">
                  <AnimatedLogo
                    showText={true}
                    animate={true}
                    isHeader={true}
                    className="h-12 md:h-16 w-auto"
                  />
                </Link>
                
                <div className="flex items-center gap-6">
                  <Link
                    href="/auth"
                    className="text-sm font-medium text-slate-500 hover:text-[#1a2536] transition duration-300"
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
