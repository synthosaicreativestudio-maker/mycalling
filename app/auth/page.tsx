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

  const { data: session } = authClient.useSession();

  useEffect(() => {
    if (session) {
      router.push('/report');
    }
  }, [session, router]);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor || (window as any).opera : '';
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  // Получаем временный код авторизации
  useEffect(() => {
    async function getLinkCode() {
      try {
        const res = await fetch('/api/auth/link-code', { method: 'POST' });
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

  // Поллинг состояния авторизации
  useEffect(() => {
    if (!linkCode) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/poll?code=${linkCode}`);
        const data = await res.json();

        if (!isSubscribed) return;

        if (data.status === 'COMPLETED' && data.sessionToken) {
          clearInterval(interval);
          router.push(`/api/auth/telegram/callback?token=${data.sessionToken}`);
        } else if (data.status === 'EXPIRED') {
          clearInterval(interval);
          // Перезапрашиваем новый код при истечении старого
          const newRes = await fetch('/api/auth/link-code', { method: 'POST' });
          const newData = await newRes.json();
          if (newData.code) {
            setLinkCode(newData.code);
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [linkCode, router]);

  const tgPayload = linkCode || '';

  const telegramBotLink = `https://t.me/moyoprizvanie_bot${tgPayload ? `?start=${tgPayload}` : ''}`;
  const maxIdLink = `https://max.ru/maxid_bot${tgPayload ? `?start=${tgPayload}` : ''}`;

  // Динамические QR-коды
  const qrTelegramLink = telegramBotLink;
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
            activeTab === 'telegram' ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-muted hover:text-white'
          }`}
        >
          <Send className="h-4 w-4" /> Telegram
        </button>
        <button
          onClick={() => setActiveTab('maxid')}
          className={`flex-1 flex items-center justify-center gap-2 rounded-xl py-3.5 text-xs font-bold uppercase tracking-wider transition ${
            activeTab === 'maxid' ? 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.25)]' : 'text-muted hover:text-white'
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
            <QRCodeSVG value={qrTelegramLink} size={180} fgColor="#349ed9" level="H" includeMargin={true} />
          </div>

          {/* Ссылка */}
          <a
            href={telegramBotLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-[56px] inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#349ed9] text-base font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_30px_rgba(52,158,217,0.25)]"
          >
            Войти через Telegram <ExternalLink className="h-4 w-4" />
          </a>

          {/* Встроенный виджет */}
          <div className="pt-4 border-t border-white/5">
            <p className="text-xs text-muted/60 mb-3">Или войдите через браузерный виджет:</p>
            <div className="flex justify-center p-2 rounded-xl bg-black/10">
              <TelegramLoginWidget botName="moyoprizvanie_bot" authUrl="https://synthosai.ru/api/auth/telegram" />
            </div>
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
