'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Mail, Send, Fingerprint, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

type Tab = 'email' | 'telegram' | 'maxid';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('email');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('8');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('studentName', name);
      localStorage.setItem('studentGrade', grade);
      localStorage.setItem('studentEmail', email || 'demo@moeprizvanie.ru');
      localStorage.setItem('isAuth', 'true');

      router.push('/assessment');
    }, 1200);
  };

  const handleMockLogin = (type: string) => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem('studentName', type === 'telegram' ? 'Алексей (TG)' : 'Иван (MAX ID)');
      localStorage.setItem('studentGrade', '9');
      localStorage.setItem('studentEmail', 'mock@login.ru');
      localStorage.setItem('isAuth', 'true');

      router.push('/assessment');
    }, 1000);
  };

  return (
    <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-md flex-col justify-center px-6 py-12 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="glass-panel rounded-[32px] p-8"
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-2xl border border-sky/20 bg-sky/10 p-3.5">
            <Sparkles className="h-6 w-6 text-skyMuted" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-text font-manrope">Вход в систему</h1>
            <p className="mt-2 text-sm text-muted">Заполни данные, чтобы персонализировать отчёт</p>
          </div>
        </div>

        {/* Переключатель вкладок */}
        <div className="mt-8 flex rounded-2xl border border-sky/10 bg-sky/5 p-1">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'email'
                ? 'bg-white text-text shadow-glass'
                : 'text-muted hover:text-text'
            }`}
          >
            <Mail className="h-4 w-4" />
            Email
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'telegram'
                ? 'bg-white text-text shadow-glass'
                : 'text-muted hover:text-text'
            }`}
          >
            <Send className="h-4 w-4" />
            Telegram
          </button>
          <button
            onClick={() => setActiveTab('maxid')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'maxid'
                ? 'bg-white text-text shadow-glass'
                : 'text-muted hover:text-text'
            }`}
          >
            <Fingerprint className="h-4 w-4" />
            MAX ID
          </button>
        </div>

        {activeTab === 'email' && (
          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Имя ученика
              </label>
              <input
                type="text"
                required
                placeholder="Как тебя зовут?"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-shell w-full h-[56px] px-5 rounded-2xl text-text"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Класс обучения (8–11 классы)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['8', '9', '10', '11'].map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGrade(g)}
                    className={`h-11 rounded-xl border text-sm font-semibold transition ${
                      grade === g
                        ? 'border-sky bg-sky/15 text-text shadow-glow-sky'
                        : 'border-sky/15 bg-white/60 text-muted hover:text-text hover:border-sky/30'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted">
                Электронная почта
              </label>
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-shell w-full h-[56px] px-5 rounded-2xl text-text"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="cta-glass w-full h-[56px] text-base font-semibold"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-text border-t-transparent" />
              ) : (
                <>
                  Начать диагностику
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>
        )}

        {activeTab === 'telegram' && (
          <div className="mt-8 space-y-6 text-center">
            <p className="text-sm text-muted leading-relaxed">
              Быстрый вход через официальный Telegram-бот. Результаты теста будут автоматически отправлены вам в чат.
            </p>
            <button
              onClick={() => handleMockLogin('telegram')}
              disabled={loading}
              className="w-full h-[56px] inline-flex items-center justify-center gap-3 rounded-2xl bg-[#229ED9] text-base font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Send className="h-5 w-5 fill-white text-[#229ED9]" />
                  Войти через Telegram
                </>
              )}
            </button>
          </div>
        )}

        {activeTab === 'maxid' && (
          <div className="mt-8 space-y-6 text-center">
            <p className="text-sm text-muted leading-relaxed">
              Единый профиль учащегося MAX ID для сохранения цифрового портфолио и академических достижений.
            </p>
            <button
              onClick={() => handleMockLogin('maxid')}
              disabled={loading}
              className="w-full h-[56px] inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-base font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(139,92,246,0.12)]"
            >
              {loading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Fingerprint className="h-5 w-5" />
                  Войти с помощью MAX ID
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
