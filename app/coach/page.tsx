'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowRight, User, Brain, MessageSquare, Compass, Shield, Award, Fingerprint, RotateCcw, ArrowLeft, Activity, Maximize2, X } from 'lucide-react';
import WheelOfVocation from './WheelOfVocation';
import PyramidOfAlignment from './PyramidOfAlignment';
import { authClient } from '../lib/auth-client';
import Link from 'next/link';
import FormattedContent from '../components/coach/FormattedContent';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STEP_NAMES: Record<number, string> = {
  0: 'Знакомство и контракт',
  1: 'Знакомство (Имя)',
  2: 'Подключение канала связи',
  3: 'Увлечения и хобби',
  4: 'Школа и предметы',
  5: 'Мечты и цели (WOOP)',
  6: 'Вдохновители и авторитеты',
  7: 'Родители и влияние',
  8: 'Страхи и барьеры',
  9: 'Практический опыт',
  10: 'Желаемый формат работы',
  11: 'Тип мышления',
  12: 'Мерило успеха',
  13: 'Источники энергии',
  14: 'Командная роль',
  15: 'Ценности и автономия',
  16: 'Глубинная цель (Запрос)',
  17: 'Желаемый результат',
  18: 'Эмоциональный отклик',
  19: 'Новая идентичность',
  20: 'План действий',
  21: 'Первый микро-шаг',
  22: 'Подведение итогов наставника'
};

const getStepName = (step: number, isDeep: boolean) => {
  if (!isDeep) {
    if (step === 16) return 'Подведение итогов наставника';
    return STEP_NAMES[step] || 'Знакомство';
  } else {
    if (step === 16) return 'Глубинная цель (Запрос)';
    if (step === 17) return 'Желаемый результат';
    if (step === 18) return 'Эмоциональный отклик';
    if (step === 19) return 'Новая идентичность';
    if (step === 20) return 'План действий';
    if (step === 21) return 'Первый микро-шаг';
    if (step === 22) return 'Подведение итогов наставника';
    return STEP_NAMES[step] || 'Знакомство';
  }
};

export default function CoachPage() {
  const router = useRouter();
  const isInitializing = useRef(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  const [phoneConfirmed, setPhoneConfirmed] = useState(false);
  const [linkCode, setLinkCode] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<Record<string, any>>({});
  const [isWheelHovered, setIsWheelHovered] = useState(false);
  const [showVocationModal, setShowVocationModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'wheel' | 'pyramid'>('wheel');

  useEffect(() => {
    if (extractedData.sessionMode === 'DEEP') {
      if (step >= 16 && step <= 21) {
        setActiveTab('pyramid');
      } else if (step === 22) {
        setActiveTab('wheel');
      }
    }
  }, [step, extractedData.sessionMode]);
  const { data: session } = authClient.useSession();
  const isAuthenticated = !!session?.user;
  
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const userAgent = typeof window !== 'undefined' ? navigator.userAgent || navigator.vendor || (window as any).opera : '';
      return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase());
    };
    setIsMobile(checkMobile());
  }, []);

  // Получаем временный код авторизации для подтверждения телефона
  useEffect(() => {
    if (!userId) return;
    async function getLinkCode() {
      try {
        const res = await fetch('/api/auth/link-code', { 
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
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
  }, [userId]);

  // Проверяем сессию и прогресс на сервере при входе на страницу
  useEffect(() => {
    async function checkAuthAndProgress() {
      try {
        console.log('[auth] Checking progress on coach page mount...');
        const res = await fetch('/api/auth/progress');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            console.log('[auth] User is authenticated. Progress status:', data);
            const forceDeep = new URLSearchParams(window.location.search).get('forceDeep') === '1';
            // Если пользователь явно пришёл пройти глубокую сессию (со страницы
            // тестирования), не уводим его на /report даже если EXPRESS уже завершён —
            // сначала даём пройти DEEP (см. handleSelectMode ниже).
            if (data.coachCompleted && !forceDeep) {
              if (data.testCompleted) {
                router.push('/report');
              } else {
                router.push('/assessment');
              }
            }
          }
        }
      } catch (err) {
        console.error('[auth] Error checking progress on coach page:', err);
      }
    }
    checkAuthAndProgress();
  }, [router]);

  useEffect(() => {
    if (!linkCode || isAuthenticated || !sessionId) return;

    let isSubscribed = true;
    let intervalId: NodeJS.Timeout | null = null;

    const handleAuthCompleted = async (sessionToken: string) => {
      try {
        console.log('[auth] Received sessionToken, redirecting to callback for cookie set...');
        window.location.href = `/api/auth/telegram/callback?token=${sessionToken}`;
      } catch (err) {
        console.error('[auth] Redirect to callback failed', err);
        setAuthError('Не получилось завершить вход. Попробуйте ещё раз.');
      }
    };

    const pollAuthStatus = async () => {
      if (!isSubscribed) return;
      try {
        console.log('[auth] Polling status for code:', linkCode);
        const res = await fetch(`/api/auth/poll?code=${linkCode}`);
        const data = await res.json();

        if (!isSubscribed) return;

        if (data.status === 'COMPLETED') {
          if (intervalId) clearInterval(intervalId);
          isSubscribed = false;
          
          await handleAuthCompleted(data.sessionToken);
        } else if (data.status === 'EXPIRED') {
          if (intervalId) clearInterval(intervalId);
          isSubscribed = false;
          
          console.log('[auth] Link code expired, requesting new code');
          const newRes = await fetch('/api/auth/link-code', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
          });
          const newData = await newRes.json();
          if (newData.code) {
            setLinkCode(newData.code);
          }
        }
      } catch (err) {
        console.error('[auth] Polling error:', err);
      }
    };

    // Запускаем интервал
    intervalId = setInterval(pollAuthStatus, 2000);

    // Добавляем обработчик смены вкладки
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[auth] Visibility changed to visible, running instant poll...');
        pollAuthStatus();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Мгновенный опрос при монтировании/изменении
    pollAuthStatus();

    return () => {
      isSubscribed = false;
      if (intervalId) clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
    // userId намеренно не в зависимостях: опрос перезапускается по смене
    // linkCode/статуса авторизации/сессии, а userId внутри читается «по факту»
    // и его изменение не должно пересоздавать интервал опроса.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [linkCode, isAuthenticated, sessionId]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Инициализация первой реплики коуча
  useEffect(() => {
    if (isInitializing.current) return;
    isInitializing.current = true;

    async function initSession() {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const shouldReset = searchParams.get('reset') === 'true';
        const isFromLogin = searchParams.get('error') === 'register_first';
        const savedSessionId = shouldReset ? null : (typeof window !== 'undefined' ? localStorage.getItem('coachSessionId') : null);

        if (shouldReset && typeof window !== 'undefined') {
          localStorage.removeItem('coachSessionId');
        }

        const res = await fetch('/api/v1/coach/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'Начать сессию с коучем',
            sessionId: savedSessionId,
            fromLoginError: isFromLogin,
            reset: shouldReset
          })
        });
        const data = await res.json();
        // Позволяем пользователю просматривать результаты завершенной сессии без редиректа
        if (Array.isArray(data.history) && data.history.length > 0) {
          setMessages(data.history);
          setSessionId(data.sessionId);
          setUserId(data.userId || null);
          setStep(data.currentStep || 0);
          setPhoneConfirmed(data.phoneConfirmed || false);
          setExtractedData(data.extracted || {});
        } else if (data.reply) {
          setMessages([{ role: 'assistant', content: data.reply }]);
          setSessionId(data.sessionId);
          setUserId(data.userId || null);
          setStep(data.currentStep || 0);
          setExtractedData(data.extracted || {});
          if (typeof window !== 'undefined') {
            localStorage.setItem('coachSessionId', data.sessionId);
          }
        }

        // Пользователь пришёл со страницы тестирования, явно выбрав глубокую сессию —
        // переключаем режим сразу, минуя карточку выбора EXPRESS/DEEP.
        const forceDeep = searchParams.get('forceDeep') === '1';
        if (forceDeep && data.extracted?.sessionMode !== 'DEEP') {
          const deepRes = await fetch('/api/v1/coach/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'Начать глубокий коучинг',
              sessionId: data.sessionId,
              sessionMode: 'DEEP'
            })
          });
          const deepData = await deepRes.json();
          if (deepData.reply || (Array.isArray(deepData.history) && deepData.history.length > 0)) {
            setMessages(Array.isArray(deepData.history) ? deepData.history : [{ role: 'assistant', content: deepData.reply }]);
            setStep(deepData.currentStep || 0);
            setExtractedData(deepData.extracted || {});
          }
        }
      } catch (err) {
        console.error('Ошибка инициализации коуча:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();
  }, []);

  // Скролл вниз при добавлении сообщений
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, extractedData.sessionMode]);

  // Выход на главную по кнопке Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        router.push('/');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading || isTyping) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsTyping(true);

    try {
      // Отправка сообщения коучу (экстракция теперь встроена на бэкенде)
      const chatRes = await fetch('/api/v1/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId })
      });
      const chatData = await chatRes.json();

      if (chatData.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        let currentText = '';
        let index = 0;
        const interval = setInterval(() => {
          if (index < chatData.reply.length) {
            currentText += chatData.reply[index];
            setMessages(prev => {
              const updated = [...prev];
              if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                updated[updated.length - 1] = { role: 'assistant', content: currentText };
              }
              return updated;
            });
            index++;
          } else {
            clearInterval(interval);
            setIsTyping(false);
            if (chatData.currentStep !== undefined) {
              setStep(chatData.currentStep);
              if (chatData.phoneConfirmed !== undefined) {
                setPhoneConfirmed(chatData.phoneConfirmed);
              } else if (chatData.extracted?.phone) {
                setPhoneConfirmed(true);
              }
              if (chatData.extracted?.fullName) {
                localStorage.setItem('studentName', chatData.extracted.fullName);
              }
              setExtractedData(chatData.extracted || {});
            }
          }
        }, 15); // Скорость печати
      } else if (chatData.awaitSessionModeSelection) {
        // Бэкенд ждёт выбора формата — обновляем состояние без ответа бота
        setIsTyping(false);
        if (chatData.currentStep !== undefined) {
          setStep(chatData.currentStep);
        }
        if (chatData.phoneConfirmed !== undefined) {
          setPhoneConfirmed(chatData.phoneConfirmed);
        }
        setExtractedData(chatData.extracted || {});
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
      setIsTyping(false);
    }
  };

  const handleNextStep = () => {
    router.push('/assessment');
  };

  const handleSendDirect = async (text: string) => {
    if (loading || isTyping) return;
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsTyping(true);
    setInput('');
    try {
      const chatRes = await fetch('/api/v1/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, sessionId })
      });
      const chatData = await chatRes.json();
      if (chatData.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
        let currentText = '';
        let index = 0;
        const interval = setInterval(() => {
          if (index < chatData.reply.length) {
            currentText += chatData.reply[index];
            setMessages(prev => {
              const updated = [...prev];
              if (updated.length > 0 && updated[updated.length - 1].role === 'assistant') {
                updated[updated.length - 1] = { role: 'assistant', content: currentText };
              }
              return updated;
            });
            index++;
          } else {
            clearInterval(interval);
            setIsTyping(false);
            if (chatData.currentStep !== undefined) {
              setStep(chatData.currentStep);
              if (chatData.phoneConfirmed !== undefined) {
                setPhoneConfirmed(chatData.phoneConfirmed);
              }
              setExtractedData(chatData.extracted || {});
            }
          }
        }, 15);
      } else if (chatData.awaitSessionModeSelection) {
        setIsTyping(false);
        if (chatData.currentStep !== undefined) {
          setStep(chatData.currentStep);
        }
        if (chatData.phoneConfirmed !== undefined) {
          setPhoneConfirmed(chatData.phoneConfirmed);
        }
        setExtractedData(chatData.extracted || {});
      } else {
        setIsTyping(false);
      }
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  const handleSelectMode = async (mode: 'EXPRESS' | 'DEEP') => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: mode === 'DEEP' ? 'Начать глубокий коучинг' : 'Продолжить сессию коуча',
          sessionId,
          sessionMode: mode
        })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages(Array.isArray(data.history) ? data.history : [{ role: 'assistant', content: data.reply }]);
        setStep(data.currentStep || 0);
        setExtractedData(data.extracted || {});
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const downloadPreliminaryReport = () => {
    const lastCoachMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastCoachMessage) return;

    const studentName = typeof window !== 'undefined' ? localStorage.getItem('studentName') || 'Гость' : 'Гость';
    const isDeep = extractedData.sessionMode === 'DEEP';
    let reportHtml = '';

    const getField = (key: string): string => {
      if (extractedData.expressExtracted && typeof extractedData.expressExtracted === 'object') {
        if (extractedData.expressExtracted[key] !== undefined) {
          return extractedData.expressExtracted[key] || '';
        }
      }
      if (extractedData.deepExtracted && typeof extractedData.deepExtracted === 'object') {
        if (extractedData.deepExtracted[key] !== undefined) {
          return extractedData.deepExtracted[key] || '';
        }
      }
      return extractedData[key] || '';
    };

    if (isDeep) {
      reportHtml = `
        <div style="margin-top: 20px; font-family: sans-serif;">
          <h3 style="color: #8B5A2B;">🎯 Мой запрос / Цель:</h3>
          <p>${getField('deepGoal') || 'Не указано'}</p>
          <h3 style="color: #8B5A2B;">🌟 Ожидаемый результат:</h3>
          <p>${getField('deepOutcome') || 'Не указано'}</p>
          <h3 style="color: #8B5A2B;">🔥 Эмоциональный отклик:</h3>
          <p>${getField('deepEmotions') || 'Не указано'}</p>
          <h3 style="color: #8B5A2B;">👑 Моя идентичность:</h3>
          <p><b>${getField('deepIdentity') || 'Не указано'}</b></p>
          <h3 style="color: #8B5A2B;">🚀 План действий:</h3>
          <p style="white-space: pre-wrap;">${getField('deepActions') || 'Не указано'}</p>
          <h3 style="color: #8B5A2B;">⚡ Первый шаг (2 минуты):</h3>
          <p><b>${getField('deepFirstStep') || 'Не указано'}</b></p>
          <br/>
          <hr/>
          <p><b>Анализ наставника Романа:</b></p>
          <p>${lastCoachMessage.content}</p>
        </div>
      `;
    } else {
      reportHtml = `<div class="content">${lastCoachMessage.content}</div>`;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Коучинговый Манифест - МоёПризвание</title>
        <style>
          body {
            font-family: 'Segoe UI', system-ui, sans-serif;
            background: #faf8f5;
            color: #253243;
            padding: 40px;
            line-height: 1.6;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 4px 30px rgba(0,0,0,0.03);
            border: 2px solid #8B5A2B;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid rgba(139, 90, 43, 0.2);
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #8B5A2B;
          }
          .title {
            font-size: 20px;
            margin-top: 10px;
            font-weight: bold;
          }
          .meta {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          .footer {
            text-align: center;
            margin-top: 40px;
            font-size: 12px;
            color: #999;
            border-top: 1px dashed #ccc;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">🌳 МоёПризвание</div>
            <div class="title">${isDeep ? 'Коучинговый Манифест Целей' : 'Предварительное резюме наставника Романа'}</div>
            <div class="meta">Для: ${studentName} | Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
          </div>
          ${reportHtml}
          <div class="footer">
            © 2026 МоёПризвание. Все права защищены.
          </div>
        </div>
        <script>
          window.onload = function() {
            window.print();
            setTimeout(function() { window.close(); }, 500);
          }
        </script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleResetSession = async () => {
    if (!confirm('Вы уверены, что хотите начать сессию с коучем заново? Все текущие ответы будут стерты.')) {
      return;
    }
    setLoading(true);
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('coachSessionId');
      }
      setMessages([]);
      setSessionId(null);
      setUserId(null);
      setStep(0);
      setPhoneConfirmed(false);
      
      const res = await fetch('/api/v1/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Начать сессию с коучем',
          sessionId: null,
          reset: true
        })
      });
      const data = await res.json();
      if (data.reply) {
        setMessages([{ role: 'assistant', content: data.reply }]);
        setSessionId(data.sessionId);
        setUserId(data.userId || null);
        setStep(data.currentStep || 0);
        if (typeof window !== 'undefined') {
          localStorage.setItem('coachSessionId', data.sessionId);
        }
      }
    } catch (err) {
      console.error('Ошибка сброса сессии:', err);
    } finally {
      setLoading(false);
    }
  };



  const isDeep = extractedData.sessionMode === 'DEEP';
  const maxSteps = isDeep ? 22 : 16;
  const isFinalStep = step === maxSteps;
  const progressPercent = Math.round((step / maxSteps) * 100);

  return (
    <main className="h-[100dvh] pt-24 pb-4 flex flex-col items-center px-4 relative z-10 overflow-hidden">
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed top-4 left-4 z-50 bg-black/90 border border-white/10 rounded-xl p-3 text-[10px] text-slate-400 font-mono shadow-2xl space-y-1">
          <div>[DEBUG] LinkCode: <span className="text-[#3B82F6]">{linkCode || 'null'}</span></div>
          <div>[DEBUG] PhoneConfirmed: <span className={phoneConfirmed ? 'text-green-500' : 'text-red-500'}>{String(phoneConfirmed)}</span></div>
          <div>[DEBUG] SessionId: <span className="text-purple-400">{sessionId || 'null'}</span></div>
        </div>
      )}

      {/* progress top panel */}
      <div className="w-full max-w-7xl mb-6 shrink-0 sticky top-4 z-20 glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#040506]/95 backdrop-blur-xl">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 shrink-0 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center text-[#3B82F6]">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-bold font-sans text-white truncate">
              Шаг {step} из {maxSteps}: {getStepName(step, isDeep)}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-4 self-end sm:self-auto">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-[#3B82F6]">{progressPercent}%</span>
            <div className="w-24 h-2 bg-white/5 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#3B82F6] transition-all duration-500" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          
          <Link
            href="/"
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-sans font-semibold text-white/70 hover:text-white transition duration-200 border border-white/10 whitespace-nowrap min-w-[120px]"
            title="Вернуться на главную"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>На главную</span>
          </Link>

          <button
            onClick={handleResetSession}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-sans font-semibold text-white/70 hover:text-white transition duration-200 border border-white/10 whitespace-nowrap min-w-[100px]"
            title="Начать заново"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Заново</span>
          </button>
        </div>
      </div>

      {/* Main layout container: Chat + Wheel of Vocation */}
      <div className="w-full max-w-7xl flex-1 min-h-0 flex flex-col lg:grid lg:grid-cols-12 gap-6 relative">
        
        {/* Left column: Chat History & Input */}
        <div className="col-span-1 lg:col-span-7 glass-card rounded-3xl overflow-hidden flex flex-col h-full min-h-0 border border-white/5 relative bg-[#040506]/35 backdrop-blur-xl">
          
          {/* Horizontal Stepper for DEEP mode */}
          {extractedData.sessionMode === 'DEEP' && step >= 16 && step <= 22 && (
            <div className="px-6 py-4 border-b border-white/5 bg-[#080c14]/40 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[11px] font-sans font-bold text-[#C4A484]">
                <span>Глубокий коучинг Романа</span>
                <span>Шаг {step === 22 ? 7 : step - 15} из 7</span>
              </div>
              <div className="flex items-center justify-between gap-1.5">
                {[
                  { step: 16, label: 'Хочу' },
                  { step: 17, label: 'Результат' },
                  { step: 18, label: 'Эмоции' },
                  { step: 19, label: 'Кто Я' },
                  { step: 20, label: 'План' },
                  { step: 21, label: 'Действие' },
                  { step: 22, label: 'Финал' }
                ].map((s, idx) => {
                  const isActive = step === s.step;
                  const isCompleted = step > s.step;
                  return (
                    <div key={s.step} className="flex-1 flex flex-col items-center gap-1 relative">
                      <div className="w-full flex items-center justify-center relative">
                        {idx > 0 && (
                          <div className={`absolute right-[50%] left-[-50%] top-[4px] h-[2px] transition-all duration-300 ${
                            isCompleted ? 'bg-[#EAB308]' : 'bg-white/10'
                          }`} />
                        )}
                        <div className={`h-2.5 w-2.5 rounded-full z-10 transition-all duration-300 ${
                          isActive 
                            ? 'bg-[#EAB308] ring-4 ring-[#EAB308]/20 scale-125' 
                            : (isCompleted ? 'bg-[#EAB308]' : 'bg-white/20')
                        }`} />
                      </div>
                      <span className={`text-[9px] font-bold font-sans transition-colors duration-300 ${
                        isActive ? 'text-[#EAB308]' : 'text-slate-500'
                      }`}>
                        {s.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Chat message history */}
          <div
            className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4"
            tabIndex={0}
            role="log"
            aria-label="История диалога с наставником"
          >
            {messages.map((msg, idx) => {
              const isCoach = msg.role === 'assistant';
              const tgPayload = linkCode || '';

              const telegramBotLink = `https://telegram.me/moyoprizvanie_bot${tgPayload ? `?start=${tgPayload}` : ''}`;
              const maxIdLink = `https://max.ru/maxid_bot${tgPayload ? `?start=${tgPayload}` : ''}`;

              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 max-w-[72%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
                >
                  <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                    isCoach ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#3B82F6] text-white'
                  }`}>
                    {isCoach ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                    isCoach 
                      ? (isFinalStep && idx === messages.length - 1
                          ? 'bg-[#0B1220]/95 text-white border-2 border-[#3B82F6]/30 rounded-tl-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-[#3B82F6]/10 relative overflow-hidden'
                          : 'bg-[#080C14]/80 text-[#E8ECF0] border border-white/5 rounded-tl-none shadow-sm'
                        )
                      : 'bg-[#3B82F6]/25 text-[#E8ECF0] border border-[#3B82F6]/30 rounded-tr-none shadow-md'
                  }`}>
                    {isCoach && isFinalStep && idx === messages.length - 1 && (
                      <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#3B82F6] mb-2">
                        <span>✨</span> Резюме наставника Романа
                      </div>
                    )}
                    <FormattedContent content={msg.content} />

                    {/* Вывод ИИ-аватара на шаге 16 */}
                    {isCoach && isFinalStep && idx === messages.length - 1 && extractedData.avatarUrl && (
                      <div className="mt-4 mb-4 flex flex-col items-center gap-3">
                        <div className="relative w-64 h-64 rounded-2xl overflow-hidden border border-[#3B82F6]/30 shadow-2xl bg-black/40">
                          {/* Внешний динамический URL (Pollinations AI) с неизвестными
                              размерами — next/image здесь неуместен (требует remotePatterns
                              и фикс. размеров). Обычный img оправдан. */}
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={extractedData.avatarUrl}
                            alt="Цифровой Аватар Личности"
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </div>
                        <span className="text-[10px] text-slate-400 italic">Сгенерированный образ вашего таланта (Pollinations AI)</span>
                      </div>
                    )}

                    {isCoach && step === 2 && !phoneConfirmed && idx === messages.length - 1 && (
                      <div className="mt-4 p-4 rounded-xl bg-[#3B82F6]/5 border border-[#3B82F6]/15 space-y-3">
                        <p className="text-xs font-bold text-[#3B82F6] flex items-center gap-1.5">
                          <span>📲</span> Подключите удобный канал связи для получения отчета:
                        </p>
                        <div className="flex flex-wrap gap-3">
                          {/* Telegram */}
                          <a 
                            href={`/auth/link?code=${tgPayload}&provider=telegram`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#349ed9] hover:bg-[#2d8bc0] text-xs font-bold text-white rounded-xl shadow transition duration-200"
                          >
                            <Send className="h-3.5 w-3.5" /> Telegram
                          </a>
                          {/* MAX ID */}
                          <a 
                            href={`/auth/link?code=${tgPayload}&provider=maxid`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 px-4 py-2.5 bg-[#8b5cf6] hover:bg-[#7c4df2] text-xs font-bold text-white rounded-xl shadow transition duration-200"
                          >
                            <Fingerprint className="h-3.5 w-3.5" /> MAX ID
                          </a>
                        </div>
                        {authError && (
                          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400 flex flex-col gap-2">
                            <p>{authError}</p>
                            <button
                              onClick={() => {
                                setAuthError(null);
                                setLinkCode(null);
                              }}
                              className="w-fit px-3 py-1 bg-red-500/20 hover:bg-red-500/30 text-white rounded-lg transition"
                            >
                              Попробовать снова
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {step > 2 && !isFinalStep && step < maxSteps && !extractedData.sessionMode && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 max-w-[90%] mr-auto"
              >
                <div className="h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold bg-[#3B82F6]/10 text-[#3B82F6]">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="p-5 rounded-2xl text-sm leading-relaxed bg-[#080C14]/80 text-[#E8ECF0] border border-white/5 rounded-tl-none shadow-sm space-y-4 max-w-xl">
                  <div className="space-y-1">
                    <p className="font-bold text-[#EAD5C3] text-sm flex items-center gap-1.5">
                      <span>🎯</span> Выберите формат исследования талантов:
                    </p>
                    <p className="text-xs text-[#C4A484]/90">
                      Регистрация успешно завершена! Какое исследование талантов вам ближе?
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Экспресс-режим */}
                    <button
                      type="button"
                      onClick={() => handleSelectMode('EXPRESS')}
                      disabled={loading}
                      className="p-3.5 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition text-left space-y-1.5 group relative"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-white group-hover:text-[#3B82F6] transition">Экспресс-формат</span>
                        <span className="text-[9px] text-[#7A8A9E] px-1.5 py-0.5 rounded bg-white/5">10-15 мин</span>
                      </div>
                      <p className="text-[10px] text-[#7A8A9E] leading-normal">
                        Быстрый опросник по увлечениям, интересам и целям для моментального получения рекомендаций.
                      </p>
                    </button>

                    {/* Глубокий режим */}
                    <button
                      type="button"
                      onClick={() => handleSelectMode('DEEP')}
                      disabled={loading}
                      className="p-3.5 rounded-xl border border-[#C4A484]/30 bg-[#C4A484]/5 hover:bg-[#C4A484]/15 transition text-left space-y-1.5 group relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 bg-[#EAB308]/20 text-[#EAB308] text-[8px] font-extrabold px-1.5 py-0.5 rounded-bl uppercase tracking-wider">
                        Рекомендуем
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[#EAD5C3] group-hover:text-[#EAB308] transition">Глубокий коучинг</span>
                        <span className="text-[9px] text-[#C4A484] px-1.5 py-0.5 rounded bg-[#C4A484]/15">22 шага</span>
                      </div>
                      <p className="text-[10px] text-[#C4A484]/85 leading-normal">
                        Интерактивная сессия по схеме «Что хочу → Действие» с проработкой эмоций, идентичности и составлением личного Манифеста целей.
                      </p>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {isTyping && (
              <div className="flex gap-3 max-w-[80%] mr-auto">
                <div className="h-8 w-8 rounded-full bg-[#3B82F6]/10 text-[#3B82F6] flex items-center justify-center">
                  <Brain className="h-4 w-4" />
                </div>
                <div className="p-4 rounded-2xl bg-[#080C14]/80 border border-white/5 rounded-tl-none shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:-0.3s]" />
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce [animation-delay:-0.15s]" />
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6] animate-bounce" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="p-4 border-t border-white/5 bg-[#040506]/45 backdrop-blur-md">
            {isFinalStep ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center p-4 space-y-4"
              >
                <h3 className="text-lg font-bold text-white">Коуч-сессия успешно завершена!</h3>
                <p className="text-xs text-[#7A8A9E] max-w-md mx-auto">
                  Вы отлично поработали с нейрокоучем. Теперь ваш цифровой профиль подготовлен для прохождения интерактивных тестов.
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                  <button 
                    type="button"
                    onClick={downloadPreliminaryReport}
                    className="bg-[#080C14]/80 hover:bg-[#121824] border border-[#C4A484]/30 text-[#C4A484] h-12 px-6 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
                  >
                    📥 Скачать резюме (PDF)
                  </button>
                  <button 
                    type="button"
                    onClick={handleNextStep}
                    className="cta-glass h-12 px-8 text-sm inline-flex items-center justify-center gap-2 w-full sm:w-auto"
                  >
                    Перейти к диагностике (тестам)
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            ) : step > 2 && !isFinalStep && step < maxSteps && !extractedData.sessionMode ? (
              <div className="text-center py-4 text-xs text-[#C4A484]/80 bg-[#C4A484]/5 border border-[#C4A484]/15 rounded-xl animate-pulse">
                👇 Выберите формат исследования талантов выше в чате 🎯
              </div>
            ) : (
              <div className="space-y-3">

                <form onSubmit={handleSend} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    disabled={loading || isTyping}
                    placeholder="Напишите ответ..."
                    className="flex-1 h-12 px-4 rounded-xl border border-white/10 bg-[#080C14]/70 outline-none focus:border-[#C4A484]/30 text-white placeholder:text-[#7A8A9E] chat-input"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || loading || isTyping}
                    aria-label="Отправить сообщение"
                    className="h-12 w-12 rounded-xl bg-[var(--accent-svg-1)] text-white flex items-center justify-center hover:opacity-90 transition disabled:opacity-50"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Right column: Wheel of Vocation or Pyramid of Alignment (Desktop only) */}
        <div
          className="lg:col-span-5 hidden lg:flex flex-col h-full min-h-0 relative select-none glass-card rounded-3xl overflow-hidden border border-white/5 bg-[#040506]/35 backdrop-blur-xl"
        >
        {/* Tabs and Zoom-in buttons for desktop */}
        {extractedData.sessionMode === 'DEEP' ? (
          <div className="absolute top-4 left-4 right-4 z-20 flex gap-2 p-1.5 rounded-2xl bg-[#090D1A]/70 backdrop-blur-xl border border-white/5 shadow-inner items-center">
            <button
              onClick={() => setActiveTab('wheel')}
              className={`flex-1 py-2 px-3 text-xs font-sans font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === 'wheel'
                  ? 'bg-[#3B82F6] text-white shadow-lg shadow-[#3B82F6]/30 border border-white/10'
                  : 'text-[#7A8A9E] hover:text-white hover:bg-white/5'
              }`}
            >
              <Compass className="h-4 w-4" />
              Колесо талантов
            </button>
            <button
              onClick={() => setActiveTab('pyramid')}
              className={`flex-1 py-2 px-3 text-xs font-sans font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 ${
                activeTab === 'pyramid'
                  ? 'bg-[#EAB308] text-white shadow-lg shadow-[#EAB308]/30 border border-white/10'
                  : 'text-[#7A8A9E] hover:text-white hover:bg-white/5'
              }`}
            >
              <Activity className="h-4 w-4" />
              Пирамида целей
            </button>
            <button
              onClick={() => setIsWheelHovered(true)}
              title="Развернуть на весь экран"
              className="h-9 w-9 shrink-0 flex items-center justify-center text-[#7A8A9E] hover:text-white hover:bg-white/5 rounded-xl border border-white/5 ml-1 transition"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div className="absolute top-4 right-4 z-20">
            <button
              onClick={() => setIsWheelHovered(true)}
              title="Развернуть на весь экран"
              className="h-10 w-10 flex items-center justify-center text-[#8D5B4C] dark:text-[#E2C488] bg-white/70 dark:bg-[#080C14]/70 backdrop-blur-md border border-[#D4AF37]/40 hover:border-[#D4AF37]/80 rounded-2xl transition shadow-md hover:scale-105 active:scale-95"
            >
              <Maximize2 className="h-5 w-5" />
            </button>
          </div>
        )}
        
        <div
          onClick={() => setIsWheelHovered(true)}
          className={`w-full flex-1 min-h-0 flex items-center justify-center cursor-zoom-in p-2 ${extractedData.sessionMode === 'DEEP' ? 'pt-16' : ''}`}
        >
          {extractedData.sessionMode === 'DEEP' ? (
            activeTab === 'pyramid' ? (
              <PyramidOfAlignment extractedData={extractedData} />
            ) : (
              <WheelOfVocation extractedData={extractedData} />
            )
          ) : (
            <WheelOfVocation extractedData={extractedData} />
          )}
        </div>
        </div>
      </div>

      {/* Floating button for mobile view of Wheel Of Vocation */}
      <div className="lg:hidden fixed bottom-24 right-6 z-40">
        <button
          onClick={() => setShowVocationModal(true)}
          className="h-12 w-12 rounded-full bg-[#3B82F6] text-white flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-[#3B82F6]/30 hover:bg-[#2563EB] transition active:scale-95 duration-200"
        >
          <Compass className="h-6 w-6 animate-[spin_10s_linear_infinite]" />
        </button>
      </div>

      {/* Mobile Modal for Wheel of Vocation / Pyramid of Alignment */}
      <AnimatePresence>
        {showVocationModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 lg:hidden"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-[#FFFBF4] dark:bg-[#080C14] border border-[#D4AF37]/30 rounded-3xl p-6 w-full max-w-[460px] flex flex-col relative max-h-[90vh]"
            >
              <button
                onClick={() => setShowVocationModal(false)}
                className="absolute top-4 right-4 text-xs font-bold text-[#8D5B4C] dark:text-[#E2C488] px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 border border-[#D4AF37]/40 rounded-xl"
              >
                Закрыть
              </button>
              <div className="flex-1 overflow-y-auto pt-4">
                {extractedData.sessionMode === 'DEEP' && (
                  <div className="flex gap-2 p-1 rounded-2xl bg-[#090D1A]/80 border border-white/5 mb-4">
                    <button
                      onClick={() => setActiveTab('wheel')}
                      className={`flex-1 py-2 px-3 text-[11px] font-sans font-bold rounded-xl transition-all duration-300 ${
                        activeTab === 'wheel'
                          ? 'bg-[#3B82F6] text-white shadow-sm'
                          : 'text-[#7A8A9E] hover:text-white'
                      }`}
                    >
                      Колесо талантов
                    </button>
                    <button
                      onClick={() => setActiveTab('pyramid')}
                      className={`flex-1 py-2 px-3 text-[11px] font-sans font-bold rounded-xl transition-all duration-300 ${
                        activeTab === 'pyramid'
                          ? 'bg-[#EAB308] text-white shadow-sm'
                          : 'text-[#7A8A9E] hover:text-white'
                      }`}
                    >
                      Пирамида целей
                    </button>
                  </div>
                )}
                
                {extractedData.sessionMode === 'DEEP' ? (
                  activeTab === 'pyramid' ? (
                    <PyramidOfAlignment extractedData={extractedData} />
                  ) : (
                    <WheelOfVocation extractedData={extractedData} />
                  )
                ) : (
                  <WheelOfVocation extractedData={extractedData} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Zoom overlay for Wheel of Vocation / Pyramid of Alignment on Desktop click */}
      <AnimatePresence>
        {isWheelHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsWheelHovered(false)}
            className="fixed inset-0 z-50 bg-[#040508]/85 backdrop-blur-xl flex items-center justify-center cursor-zoom-out p-4"
          >
            <motion.div
              initial={{ scale: 0.7, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.7, opacity: 0, y: 30 }}
              onClick={(e) => e.stopPropagation()}
              transition={{ type: 'spring', damping: 25, stiffness: 180 }}
              className="w-full max-w-[1060px] p-6 md:p-10 rounded-[36px] bg-[#FFFBF4] dark:bg-[#080C14] border border-[#D4AF37]/35 shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative flex flex-col items-center justify-center pointer-events-auto overflow-hidden"
            >
              <button
                onClick={() => setIsWheelHovered(false)}
                title="Закрыть"
                className="absolute top-6 right-6 h-10 w-10 flex items-center justify-center text-[#8D5B4C] dark:text-[#E2C488] bg-white/70 dark:bg-white/5 hover:bg-amber-500/20 border border-[#D4AF37]/40 rounded-2xl transition z-10"
              >
                <X className="h-5 w-5" />
              </button>
              
              <div className="w-full max-w-[960px] aspect-[96/58] flex items-center justify-center overflow-visible">
                {extractedData.sessionMode === 'DEEP' ? (
                  activeTab === 'pyramid' ? (
                    <PyramidOfAlignment extractedData={extractedData} />
                  ) : (
                    <WheelOfVocation extractedData={extractedData} standalone />
                  )
                ) : (
                  <WheelOfVocation extractedData={extractedData} standalone />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
