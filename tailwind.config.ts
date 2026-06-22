import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        surface: '#12192e',
        accent: '#7c8cff',
        accentSoft: '#a8b3ff',
        text: '#eef2ff',
        muted: '#9aa4c7'
      },
      boxShadow: {
        glow: '0 0 60px rgba(124,140,255,0.18)'
      }
    }
  },
  plugins: []
};

export default config;
