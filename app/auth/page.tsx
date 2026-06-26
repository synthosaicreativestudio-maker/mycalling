"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRight, Fingerprint, Send, Mail, Lock, User, GraduationCap } from 'lucide-react';
import { authClient } from '../../lib/auth-client';
import { useDiagnosticStore } from '../store/diagnosticStore';
import TelegramLoginWidget from '../components/TelegramLoginWidget';

export default function AuthPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'email' | 'telegram' | 'maxid'>('email');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('register');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('8');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (authMode === 'register') {
        const res = await authClient.signUp.email({
          email,
          password,
          name,
          // @ts-ignore
          grade: parseInt(grade, 10),
        });
        if (res.error) throw new Error(res.error.message || 'Ошибка регистрации');
      } else {
        const res = await authClient.signIn.email({
          email,
          password,
        });
        if (res.error) throw new Error(res.error.message || 'Неверный email или пароль');
      }

      // После успешной авторизации запускаем сессию
      const store = useDiagnosticStore.getState();
      const currentName = authMode === 'register' ? name : (authClient.useSession().data?.user?.name || 'Гость');
      const currentGrade = authMode === 'register' ? grade : '8'; // В реальном проекте берется из профиля
      await store.startSession(currentName, currentGrade);
      
      router.push('/assessment');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Что-то пошло не так');
    } finally {
      setLoading(false);
    }
  };

  const handleMockLogin = (provider: string) => {
    alert(`Интеграция с ${provider} в процессе разработки. Пожалуйста, используйте Email.`);
  };

  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-gradient-to-br from-bg via-bg-dark to-[#0f0b15]">
      
      {/* Decorative background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky/5 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#8b5cf6]/5 blur-[120px] mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[420px] rounded-[32px] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-inner mb-6">
            <User className="h-8 w-8 text-sky" />
          </div>
          <h1 className="text-2xl font-bold font-unbounded text-white tracking-tight">
            Вход в систему
          </h1>
          <p className="text-sm text-muted mt-2">
            Сохраните результаты и цифровое портфолио
          </p>
        </div>

        {/* Провайдеры */}
        <div className="flex gap-2 rounded-2xl bg-black/20 p-1 mb-8 border border-white/5">
          <button
            onClick={() => setActiveTab('email')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'email' ? 'bg-white text-text shadow-glass' : 'text-muted hover:text-text'
            }`}
          >
            <Mail className="h-4 w-4" /> Email
          </button>
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'telegram' ? 'bg-white text-text shadow-glass' : 'text-muted hover:text-text'
            }`}
          >
            <Send className="h-4 w-4" /> TG
          </button>
          <button
            onClick={() => setActiveTab('maxid')}
            className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-xs font-semibold uppercase tracking-wider transition ${
              activeTab === 'maxid' ? 'bg-white text-text shadow-glass' : 'text-muted hover:text-text'
            }`}
          >
            <Fingerprint className="h-4 w-4" /> MAX
          </button>
        </div>

        {activeTab === 'email' && (
          <form onSubmit={handleEmailAuth} className="space-y-5">
            {/* Переключатель Вход/Регистрация */}
            <div className="flex justify-center gap-4 mb-2">
              <button type="button" onClick={() => setAuthMode('login')} className={`text-sm font-semibold transition ${authMode === 'login' ? 'text-sky' : 'text-muted hover:text-white'}`}>Вход</button>
              <div className="w-px h-4 bg-white/10 self-center" />
              <button type="button" onClick={() => setAuthMode('register')} className={`text-sm font-semibold transition ${authMode === 'register' ? 'text-sky' : 'text-muted hover:text-white'}`}>Регистрация</button>
            </div>

            {authMode === 'register' && (
              <div className="space-y-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-muted" />
                  </div>
                  <input
                    type="text" required placeholder="Имя ученика" value={name} onChange={(e) => setName(e.target.value)}
                    className="w-full h-[52px] pl-11 pr-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder:text-muted focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition outline-none"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-muted ml-1">Класс обучения</label>
                  <div className="grid grid-cols-4 gap-2">
                    {['8', '9', '10', '11'].map((g) => (
                      <button
                        key={g} type="button" onClick={() => setGrade(g)}
                        className={`h-11 rounded-xl border text-sm font-semibold transition ${
                          grade === g ? 'border-sky bg-sky/15 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'border-white/10 bg-black/20 text-muted hover:text-white hover:border-white/20'
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-muted" />
              </div>
              <input
                type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full h-[52px] pl-11 pr-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder:text-muted focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition outline-none"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-muted" />
              </div>
              <input
                type="password" required placeholder="Пароль" minLength={8} value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[52px] pl-11 pr-4 bg-black/20 border border-white/10 rounded-2xl text-white placeholder:text-muted focus:border-sky/50 focus:ring-1 focus:ring-sky/50 transition outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-400 text-center animate-pulse bg-red-400/10 py-2 rounded-lg">{error}</p>}

            <button type="submit" disabled={loading} className="w-full h-[56px] mt-2 inline-flex items-center justify-center gap-3 rounded-2xl bg-sky text-base font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-[0_0_40px_rgba(14,165,233,0.5)]">
              {loading ? <div className="h-6 w-6 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <>{authMode === 'register' ? 'Зарегистрироваться' : 'Войти'} <ArrowRight className="h-5 w-5" /></>}
            </button>
          </form>
        )}

        {activeTab === 'telegram' && (
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-[#229ED9]/10 rounded-2xl flex items-center justify-center mb-4">
              <Send className="h-8 w-8 text-[#229ED9]" />
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Быстрый вход через официальный Telegram-бот. Результаты теста будут автоматически отправлены вам в чат.
            </p>
            <div className="flex justify-center bg-white/5 rounded-2xl p-4 overflow-hidden flex-col items-center">
              <TelegramLoginWidget botName="romanomarche" authUrl="https://synthosai.ru/api/auth/telegram" />
              <div className="text-xs text-muted/50 mt-4 max-w-[250px]">
                Для работы виджета может потребоваться отключить блокировщики рекламы.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'maxid' && (
          <div className="mt-8 space-y-6 text-center">
            <div className="mx-auto w-16 h-16 bg-[#8b5cf6]/10 rounded-2xl flex items-center justify-center mb-4">
              <Fingerprint className="h-8 w-8 text-[#8b5cf6]" />
            </div>
            <p className="text-sm text-muted leading-relaxed">
              Авторизация через VK MAX ID с интеграцией Госуслуг для сохранения цифрового портфолио.
            </p>
            <button
              onClick={() => handleMockLogin('maxid')}
              disabled={loading}
              className="w-full h-[56px] inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-base font-semibold text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(139,92,246,0.3)] hover:shadow-[0_0_40px_rgba(139,92,246,0.5)]"
            >
              Войти через MAX ID
            </button>
          </div>
        )}
      </motion.div>
    </main>
  );
}
