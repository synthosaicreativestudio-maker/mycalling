import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#06060e',
        surface: '#0d0d18',
        accent: '#d4a853',
        accentSoft: '#e8c97a',
        purple: '#8b7ff7',
        purpleSoft: '#a89bfa',
        text: '#f0ece4',
        muted: '#8a8694'
      },
      fontFamily: {
        title: ['var(--font-space-grotesk)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif']
      },
      boxShadow: {
        glow: '0 0 60px rgba(212,168,83,0.15)',
        'glow-purple': '0 0 60px rgba(139,127,247,0.12)'
      }
    }
  },
  plugins: []
};

export default config;
