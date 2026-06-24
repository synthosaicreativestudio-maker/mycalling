import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Светлая премиальная палитра ── */
        background: '#f7faf8',
        surface: '#ffffff',
        accent: '#c6a766',       // мягкое золото
        accentSoft: '#d7bd79',   // светлое золото
        sky: '#9bbbcf',          // нежный голубой
        skyMuted: '#6f97ad',     // приглушённый голубой
        rose: '#e9b9bd',         // нежный розовый
        roseMuted: '#c98c97',    // приглушённый розовый
        text: '#253243',         // графитово-синий
        muted: '#566679',        // приглушённый текст
        subtle: '#8a9aab',       // ещё мягче
      },
      fontFamily: {
        manrope: ['var(--font-manrope)', 'sans-serif'],
        prata: ['var(--font-prata)', 'serif'],
        signature: ['var(--font-signature)', 'cursive'],
      },
      boxShadow: {
        glow: '0 0 40px rgba(198,167,102,0.10)',
        'glow-sky': '0 0 40px rgba(155,187,207,0.10)',
        glass: '0 22px 58px rgba(68,86,104,0.055), inset 0 1px 0 rgba(255,255,255,0.72)',
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
