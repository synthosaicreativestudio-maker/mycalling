"use client";

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, Fingerprint, QrCode, ExternalLink, AlertCircle } from 'lucide-react';
import TelegramLoginWidget from '../components/TelegramLoginWidget';
import { authClient } from '../lib/auth-client';
import { QRCodeSVG } from 'qrcode.react';

function AuthCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'telegram' | 'maxid'>('telegram');
  
  const errorParam = searchParams.get('error');
  const isRegisterDenied = errorParam === 'register_denied';

  const [isMobile, setIsMobile] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);

  // Проверяем сессию и прогресс на сервере при входе на страницу
  useEffect(() => {
    async function checkAuthAndRedirect() {
      try {
        console.log('[auth] Checking server session on mount...');
        const res = await fetch('/api/auth/progress');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            console.log('[auth] User authenticated, redirecting by progress:', data);
            if (!data.coachCompleted) {
              router.push('/coach');
            } else if (!data.testCompleted) {
              router.push('/assessment');
            } else {
              router.push('/report');
            }
          }
        }
      } catch (err) {
        console.error('[auth] Error checking server session:', err);
      }
    }
    checkAuthAndRedirect();
  }, [router]);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor || (window as any).opera : '';
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  // Получаем временный код авторизации с привязкой к активной сессии коуча
  useEffect(() => {
    async function getLinkCode() {
      try {
        const coachSessionId = typeof window !== 'undefined' ? localStorage.getItem('coachSessionId') : null;
        const res = await fetch('/api/auth/link-code', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ coachSessionId })
        });
        const data = await res.json();
        if (data.code) {
          setLinkCode(data.code);
        }
      } catch (err) {
        console.error('Error fetching link code:', err);
      }
    }
    getLinkCode();
  }, []);

  // Поллинг состояния авторизации с поддержкой visibilitychange
  useEffect(() => {
    if (!linkCode) return;

    let isSubscribed = true;
    let intervalId: NodeJS.Timeout | null = null;

    const pollAuthStatus = async () => {
      if (!isSubscribed) return;
      try {
        console.log('[auth] Auth page polling status for code:', linkCode);
        const res = await fetch(`/api/auth/poll?code=${linkCode}`);
        const data = await res.json();

        if (!isSubscribed) return;

        if (data.status === 'COMPLETED' && data.sessionToken) {
          if (intervalId) clearInterval(intervalId);
          isSubscribed = false;
          window.location.href = `/api/auth/telegram/callback?token=${data.sessionToken}`;
        } else if (data.status === 'EXPIRED') {
          if (intervalId) clearInterval(intervalId);
          isSubscribed = false;
          
          console.log('[auth] Auth page code expired, requesting new code');
          const newRes = await fetch('/api/auth/link-code', { method: 'POST' });
          const newData = await newRes.json();
          if (newData.code) {
            setLinkCode(newData.code);
          }
        }
      } catch (err) {
        console.error('[auth] Polling error:', err);
      }
    };

    intervalId = setInterval(pollAuthStatus, 2000);

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[auth] Auth page visibility changed to visible, polling instantly...');
        pollAuthStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    pollAuthStatus();

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [linkCode, router]);

  const tgPayload = linkCode || '';

  const telegramAppLink = `tg://resolve?domain=moyoprizvanie_bot${tgPayload ? `&start=${encodeURIComponent(tgPayload)}` : ''}`;
  const telegramWebLink = `https://telegram.me/moyoprizvanie_bot${tgPayload ? `?start=${encodeURIComponent(tgPayload)}` : ''}`;
  const maxIdLink = `https://max.ru/maxid_bot${tgPayload ? `?start=${tgPayload}` : ''}`;

  // Динамические QR-коды
  const qrTelegramLink = telegramWebLink; // telegram.me реже блокируется для QR-кодов
  const qrMaxIdLink = maxIdLink;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px] rounded-[32px] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl shadow-2xl relative z-10"
    >
      <div className="text-center mb-8">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-white/10 to-transparent border border-white/10 shadow-inner mb-6">
          <QrCode className="h-8 w-8 text-sky" />
        </div>
        <h1 className="text-2xl font-bold font-sans text-white tracking-tight">
          Личный кабинет
        </h1>
        <p className="text-sm text-muted mt-2 leading-relaxed">
          Авторизация для пользователей, прошедших сессию с наставником Романом.
        </p>
      </div>

      {/* Вывод ошибки запрета входа напрямую */}
      {isRegisterDenied && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-center space-y-2">
          <div className="flex items-center justify-center gap-2 text-red-400 font-bold text-xs uppercase tracking-wider">
            <AlertCircle className="h-4 w-4" /> Доступ ограничен
          </div>
          <p className="text-xs text-red-300/90 leading-relaxed">
            Вход недоступен. Пожалуйста, начните диалог с наставником Романом на главной странице, чтобы подключить ваш профиль.
          </p>
        </div>
      )}

      {/* Переключатель методов */}
      <div className="flex gap-2 rounded-2xl bg-black/20 p-1 mb-8 border border-white/5">
        <button
          onClick={() => setActiveTab('telegram')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'telegram' ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-muted hover:text-white'
          }`}
        >
          <Send className="h-4 w-4" /> Telegram
        </button>
        <button
          onClick={() => setActiveTab('maxid')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'maxid' ? 'bg-[#2563EB] text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-muted hover:text-white'
          }`}
        >
          <Fingerprint className="h-4 w-4" /> MAX ID
        </button>
      </div>

      {activeTab === 'telegram' && (
        <div className="space-y-6 text-center">
          <p className="text-sm text-muted leading-relaxed">
            Отсканируйте QR-код или перейдите по ссылке, чтобы войти через официальный Telegram-бот.
          </p>

          {/* QR-код */}
          <div className="mx-auto w-[210px] h-[210px] bg-white rounded-3xl p-4 flex items-center justify-center shadow-lg border border-[#349ed9]/20">
            <QRCodeSVG value={qrTelegramLink} size={180} fgColor="#349ed9" level="H" includeMargin={true} title="QR-код для входа через Telegram" />
          </div>

          <div className="space-y-3">
            <a
              href={telegramAppLink}
              className="w-full h-[56px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#1779B5] text-base font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(52,158,217,0.25)]"
            >
              Войти через Telegram <ExternalLink className="h-4 w-4" />
            </a>
            <p className="text-xs text-muted leading-relaxed">
              Если приложение не открылось,{' '}
              <a 
                href={telegramWebLink} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#349ed9] hover:underline font-bold"
              >
                откройте веб-версию
              </a>
            </p>
          </div>
        </div>
      )}

      {activeTab === 'maxid' && (
        <div className="space-y-6 text-center">
          <p className="text-sm text-muted leading-relaxed">
            Вход через защищенную систему MAX ID с интеграцией Госуслуг для сохранения результатов.
          </p>

          {/* QR-код */}
          <div className="mx-auto w-[210px] h-[210px] bg-white rounded-3xl p-4 flex items-center justify-center shadow-lg border border-[#8b5cf6]/20">
            <QRCodeSVG value={qrMaxIdLink} size={180} fgColor="#8b5cf6" level="H" includeMargin={true} />
          </div>

          {/* Ссылка */}
          <a
            href={maxIdLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[56px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#8b5cf6] to-[#a855f7] text-base font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(139,92,246,0.25)]"
          >
            Войти через MAX ID <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
    </motion.div>
  );
}

export default function AuthPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 bg-gradient-to-br from-bg via-bg-dark to-[#0f0b15] relative">
      {/* Декоративный фон */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-sky/5 blur-[120px] mix-blend-screen" />
        <div className="absolute top-[40%] -right-[10%] w-[40%] h-[60%] rounded-full bg-[#8b5cf6]/5 blur-[120px] mix-blend-screen" />
      </div>

      <Suspense fallback={
        <div className="w-full max-w-[420px] rounded-[32px] border border-white/5 bg-white/[0.02] p-8 backdrop-blur-3xl flex flex-col items-center justify-center min-h-[400px]">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-sky border-t-transparent" />
        </div>
      }>
        <AuthCard />
      </Suspense>
    </main>
  );
}
