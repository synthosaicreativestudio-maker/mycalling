'use client';

import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark';
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    localStorage.setItem('theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
  };

  return (
    <button
      onClick={toggleTheme}
      className="h-9 w-9 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-slate-400 hover:text-white transition flex items-center justify-center relative z-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6]/50"
      title={theme === 'dark' ? 'Переключить на светлую тему' : 'Переключить на темную тему'}
      aria-label="Переключить тему"
    >
      {theme === 'dark' ? (
        <Sun className="h-4 w-4 text-[var(--accent-sky)] hover:scale-110 transition duration-300" />
      ) : (
        <Moon className="h-4 w-4 text-[#8D5B4C] hover:scale-110 transition duration-300" />
      )}
    </button>
  );
}
