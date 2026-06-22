import './globals.css';
import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin', 'cyrillic'],
  variable: '--font-plus-jakarta'
});

export const metadata: Metadata = {
  title: 'МоеПризвание — профориентация для семьи',
  description: 'Онлайн-диагностика для подростков 9–11 классов: сильные стороны, профессии, предметы и направления обучения.'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className={plusJakartaSans.variable}>{children}</body>
    </html>
  );
}
