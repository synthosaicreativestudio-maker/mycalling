'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smartphone, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import Script from 'next/script';

export default function TelegramWebAppPage() {
  const [mounted, setMounted] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    // Инициализируем WebApp, если SDK уже загружен
    if (typeof window !== 'undefined' && (window as any).Telegram?.WebApp) {
      const webApp = (window as any).Telegram.WebApp;
      webApp.ready();
      webApp.expand();
    }
  }, []);

  const handleShareContact = () => {
    if (typeof window === 'undefined' || !(window as any).Telegram?.WebApp) {
      setStatus('error');
      setErrorMsg('Telegram WebApp SDK не найден. Откройте эту страницу внутри Telegram.');
      return;
    }

    const webApp = (window as any).Telegram.WebApp;
    
    // Инициализируем и разворачиваем WebApp
    webApp.ready();
    webApp.expand();

    setStatus('loading');
    setErrorMsg(null);

    try {
      webApp.requestContact((sent: boolean) => {
        if (sent) {
          console.log('[webapp] Contact shared successfully');
          setStatus('success');
          // Даем 1.5 секунды на отображение галочки успеха и закрываем WebApp
          setTimeout(() => {
            webApp.close();
          }, 1800);
        } else {
          console.warn('[webapp] Contact sharing declined by user');
          setStatus('error');
          setErrorMsg('Для авторизации необходимо поделиться контактом.');
        }
      });
    } catch (err: any) {
      console.error('[webapp] Error requesting contact:', err);
      setStatus('error');
      setErrorMsg('Не удалось запросить контакт. Пожалуйста, отправьте его кнопкой в чате.');
    }
  };

  if (!mounted) return null;

  return (
    <>
      <Script 
        src="https://telegram.org/js/telegram-web-app.js" 
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[webapp] Telegram WebApp SDK loaded successfully');
          if ((window as any).Telegram?.WebApp) {
            (window as any).Telegram.WebApp.ready();
            (window as any).Telegram.WebApp.expand();
          }
        }}
      />
      
      <main className="min-h-screen bg-[#040508] text-[#E8ECF0] flex flex-col items-center justify-center px-6 relative overflow-hidden font-sans">
        
        {/* Декоративное космическое свечение */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-[#3B82F6]/10 rounded-full blur-[100px] pointer-events-none z-0" />
        
        <div className="w-full max-w-sm flex flex-col items-center text-center relative z-10 space-y-8">
          
          {/* Логотип */}
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-inner flex items-center justify-center">
              <Smartphone className="h-10 w-10 text-[#3B82F6]" />
            </div>
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#3B82F6] rounded-full animate-ping opacity-75" />
          </div>

          <div className="space-y-2">
            <h1 className="text-xl font-bold text-white tracking-tight">Подключение профиля</h1>
            <p className="text-sm text-[#7A8A9E] leading-relaxed px-4">
              Поделитесь контактом, чтобы бот платформы «МоёПризвание» привязал результаты диагностики к вашей сессии.
            </p>
          </div>

          {/* Карточка статуса / Кнопка */}
          <div className="w-full min-h-[140px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              {status === 'idle' && (
                <motion.button
                  key="btn-idle"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  onClick={handleShareContact}
                  className="w-full h-14 rounded-2xl bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold text-base shadow-[0_0_25px_rgba(59,130,246,0.3)] transition duration-200 flex items-center justify-center gap-2 border border-white/10"
                >
                  <Smartphone className="h-5 w-5" />
                  <span>Поделиться контактом</span>
                </motion.button>
              )}

              {status === 'loading' && (
                <motion.div
                  key="loader"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3"
                >
                  <Loader className="h-8 w-8 text-[#3B82F6] animate-spin" />
                  <span className="text-sm text-white/70">Ожидание подтверждения...</span>
                </motion.div>
              )}

              {status === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center gap-3 text-green-400"
                >
                  <CheckCircle className="h-12 w-12" />
                  <span className="text-base font-bold text-white">Профиль успешно подключен!</span>
                  <span className="text-xs text-[#7A8A9E]">Это окно автоматически закроется</span>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full flex flex-col items-center gap-4"
                >
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-6 w-6 shrink-0" />
                    <span className="text-sm font-semibold">{errorMsg}</span>
                  </div>
                  <button
                    onClick={handleShareContact}
                    className="w-full h-12 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium text-sm transition duration-200 border border-white/10"
                  >
                    Попробовать снова
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="text-[10px] text-[#7A8A9E]/60">
            Безопасно · Номер используется только для привязки результатов
          </div>
        </div>
      </main>
    </>
  );
}
