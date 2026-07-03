import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Темная премиальная палитра ── */
        background: '#040506',
        surface: 'rgba(8, 12, 20, 0.6)',
        accent: '#3B82F6',       // холодный синий
        accentSoft: '#1E3A5F',   // приглушенный синий
        sky: '#60A5FA',          // ярко-голубой
        skyMuted: '#193B57',     // серо-синий
        rose: '#1E3A5F',         // заменено на темный синий
        roseMuted: '#193B57',    // заменено на серо-синий
        text: '#E8ECF0',         // светлый текст
        muted: '#7A8A9E',        // приглушенный текст
        subtle: '#566679',       // мягкий текст
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
        prata: ['var(--font-prata)', 'serif'],
        signature: ['var(--font-signature)', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(59,130,246,0.15)',
        'glow-sky': '0 0 40px rgba(96,165,250,0.15)',
        glass: '0 22px 58px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.03)',
      },
      borderRadius: {
        'glass': '22px',
        'glass-lg': '32px',
      }
    }
  },
  plugins: []
};

export default config;
