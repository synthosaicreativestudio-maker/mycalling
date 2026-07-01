'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Send, Fingerprint, QrCode, ExternalLink, Loader2, CheckCircle2 } from 'lucide-react';
import { SpaceBackground } from '../../components/SpaceBackground';

function LinkCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');
  const provider = searchParams.get('provider') || 'telegram';
  
  const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'EXPIRED'>('PENDING');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor || (window as any).opera : '';
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  // Поллинг статуса подтверждения
  useEffect(() => {
    if (!code) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/poll?code=${code}`);
        const data = await res.json();

        if (!isSubscribed) return;

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setStatus('COMPLETED');
          
          // Если есть токен сессии, выполняем автоматический вход (для мобильного устройства)
          if (data.sessionToken) {
            setTimeout(() => {
              router.push(`/api/auth/telegram/callback?token=${data.sessionToken}`);
            }, 1500);
          }
        } else if (data.status === 'EXPIRED') {
          clearInterval(interval);
          setStatus('EXPIRED');
        }
      } catch (err) {
        console.error('Polling error on link page:', err);
      }
    }, 2000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [code, router]);

  if (!code) {
    return (
      <div className="text-center p-6 text-red-500 font-bold bg-white/10 rounded-2xl">
        Код подключения недействителен или отсутствует.
      </div>
    );
  }

  const isTelegram = provider === 'telegram';
  const qrLink = isTelegram
    ? `https://t.me/moyoprizvanie_bot?start=${code}`
    : `https://max.ru/maxid_bot/start/${code}`;

  const botLink = isMobile
    ? (isTelegram 
        ? `tg://resolve?domain=moyoprizvanie_bot&start=${code}`
        : `max://maxid_bot/start/${code}`)
    : qrLink;

  const qrColor = isTelegram ? '34-158-217' : '139-92-246';
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(qrLink)}&color=${qrColor}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-[420px] rounded-[32px] border border-[#8c6e4b]/15 bg-white/70 p-8 backdrop-blur-xl shadow-2xl relative z-10 text-center space-y-6"
    >
      <div className="flex flex-col items-center">
        <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl ${
          isTelegram ? 'bg-[#349ed9]/10 text-[#349ed9]' : 'bg-[#8b5cf6]/10 text-[#8b5cf6]'
        } border border-current/15 mb-4`}>
          {isTelegram ? <Send className="h-7 w-7" /> : <Fingerprint className="h-7 w-7" />}
        </div>
        <h1 className="text-xl font-bold font-sans text-[#253243]">
          Подключение через {isTelegram ? 'Telegram' : 'MAX ID'}
        </h1>
        <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
          Отсканируйте QR-код камерой телефона или нажмите кнопку ниже, чтобы запустить бот
        </p>
      </div>

      {status === 'PENDING' && (
        <>
          {/* QR-код */}
          <div className="mx-auto w-[240px] h-[240px] bg-white rounded-3xl p-2.5 flex items-center justify-center shadow-md border border-[#8c6e4b]/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="Bot QR Link" className="w-[220px] h-[220px] select-none rounded-xl" />
          </div>

          {/* Кнопка открытия */}
          <a
            href={botLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`w-full h-[54px] inline-flex items-center justify-center gap-2.5 rounded-2xl text-sm font-bold text-white transition hover:scale-[1.02] active:scale-[0.98] shadow-lg ${
              isTelegram 
                ? 'bg-[#349ed9] hover:bg-[#2d8bc0] shadow-[#349ed9]/25' 
                : 'bg-[#8b5cf6] hover:bg-[#7c4df2] shadow-[#8b5cf6]/25'
            }`}
          >
            Открыть чат-бот <ExternalLink className="h-4 w-4" />
          </a>

          {/* Поллинг индикатор */}
          <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-2 border-t border-[#8c6e4b]/10">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8c6e4b]" />
            Ожидание подтверждения в мессенджере...
          </div>
        </>
      )}

      {status === 'COMPLETED' && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="py-8 space-y-4"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#253243]">Канал связи успешно подключен!</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Вы успешно подключили мессенджер. Эта вкладка закроется, а на основном устройстве продолжится сессия.
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <Loader2 className="h-3 w-3 animate-spin text-emerald-600" /> Выполняется перенаправление...
          </div>
        </motion.div>
      )}

      {status === 'EXPIRED' && (
        <div className="py-8 space-y-4">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-600">
            <span className="text-2xl">⚠️</span>
          </div>
          <div>
            <h3 className="text-base font-bold text-[#253243]">Срок действия кода истек</h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Пожалуйста, вернитесь на предыдущую страницу и запросите QR-код повторно.
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default function LinkPage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center p-6 relative">
      <SpaceBackground />
      
      <Suspense fallback={
        <div className="w-full max-w-[420px] rounded-[32px] border border-[#8c6e4b]/15 bg-white/70 p-8 backdrop-blur-xl flex flex-col items-center justify-center min-h-[300px]">
          <Loader2 className="h-8 w-8 animate-spin text-[#8c6e4b]" />
        </div>
      }>
        <LinkCard />
      </Suspense>
    </main>
  );
}
