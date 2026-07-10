'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowRight, User, Brain, MessageSquare, Compass, Shield, Award, Fingerprint, RotateCcw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STEP_NAMES: Record<number, string> = {
  0: 'Знакомство и контракт',
  1: 'Сбор личных данных',
  2: 'Подключение канала связи',
  3: 'Мечты и цели (WOOP)',
  4: 'Вдохновители и авторитеты',
  5: 'Ценности и стиль выбора',
  6: 'Подведение итогов наставника'
};

export default function CoachPage() {
  const router = useRouter();
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
            if (data.coachCompleted) {
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

  // Поллинг подтверждения телефона/авторизации через ботов
  useEffect(() => {
    if (!linkCode || phoneConfirmed || !sessionId) return;

    let isSubscribed = true;
    let intervalId: NodeJS.Timeout | null = null;

    const handleAuthCompleted = async (sessionToken: string | null) => {
      if (!sessionToken) {
        console.error('[auth] Completed status but no sessionToken received');
        setAuthError('Не удалось получить токен сессии. Пожалуйста, попробуйте еще раз.');
        return;
      }
      
      try {
        console.log('[auth] Received sessionToken, calling callback...');
        const res = await fetch(`/api/auth/telegram/callback?token=${sessionToken}`, {
          credentials: 'include',
          redirect: 'manual'
        });
        
        if (!res.ok) {
          throw new Error(`Callback status not ok: ${res.status}`);
        }

        console.log('[auth] Callback successful, setting phone confirmed');
        setPhoneConfirmed(true);
        setAuthError(null);

        // Отправляем системное сообщение коучу, чтобы мгновенно продвинуть шаг
        const chatRes = await fetch('/api/v1/coach/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Телефон подтвержден через бот', sessionId, linkCode })
        });
        const chatData = await chatRes.json();
        if (chatData.reply) {
          setMessages(prev => [...prev, { role: 'assistant', content: '' }]);
          let currentText = '';
          let index = 0;
          const printInterval = setInterval(() => {
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
              clearInterval(printInterval);
              setIsTyping(false);
              if (chatData.currentStep !== undefined) {
                setStep(chatData.currentStep);
              }
              if (chatData.phoneConfirmed !== undefined) {
                setPhoneConfirmed(chatData.phoneConfirmed);
              }
            }
          }, 15);
        } else {
          if (chatData.currentStep !== undefined) {
            setStep(chatData.currentStep);
          }
          if (chatData.phoneConfirmed !== undefined) {
            setPhoneConfirmed(chatData.phoneConfirmed);
          }
        }
      } catch (err) {
        console.error('[auth] callback failed', err);
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
  }, [linkCode, phoneConfirmed, sessionId]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Инициализация первой реплики коуча
  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const isFromLogin = searchParams.get('error') === 'register_first';
        const savedSessionId = typeof window !== 'undefined' ? localStorage.getItem('coachSessionId') : null;

        const res = await fetch('/api/v1/coach/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            message: 'Начать сессию с коучем',
            sessionId: savedSessionId,
            fromLoginError: isFromLogin
          })
        });
        const data = await res.json();
        if (data.sessionStatus === 'COMPLETED') {
          router.push('/assessment');
          return;
        }
        if (data.history && data.history.length > 0) {
          setMessages(data.history);
          setSessionId(data.sessionId);
          setUserId(data.userId || null);
          setStep(data.currentStep || 0);
          setPhoneConfirmed(data.phoneConfirmed || false);
        } else if (data.reply) {
          setMessages([{ role: 'assistant', content: data.reply }]);
          setSessionId(data.sessionId);
          setUserId(data.userId || null);
          setStep(data.currentStep || 0);
          if (typeof window !== 'undefined') {
            localStorage.setItem('coachSessionId', data.sessionId);
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
  }, [messages, isTyping]);

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
              if (chatData.currentStep === 6) {
                // Записываем имя ученика в localStorage для страницы тестов
                if (chatData.extracted?.fullName) {
                  localStorage.setItem('studentName', chatData.extracted.fullName);
                }
              }
            }
          }
        }, 15); // Скорость печати
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

  const downloadPreliminaryReport = () => {
    const lastCoachMessage = [...messages].reverse().find(m => m.role === 'assistant');
    if (!lastCoachMessage) return;

    const studentName = typeof window !== 'undefined' ? localStorage.getItem('studentName') || 'Гость' : 'Гость';
    const reportText = lastCoachMessage.content;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
      <head>
        <title>Предварительное резюме - МоёПризвание</title>
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
            border: 2px solid #3B82F6;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid rgba(59, 130, 246, 0.2);
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #3B82F6;
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
          .content {
            font-size: 16px;
            white-space: pre-wrap;
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
            <div class="title">Предварительное резюме наставника Романа</div>
            <div class="meta">Для: ${studentName} | Дата: ${new Date().toLocaleDateString('ru-RU')}</div>
          </div>
          <div class="content">${reportText}</div>
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
          sessionId: null
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

  const progressPercent = Math.round((step / 6) * 100);

  return (
    <main className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center px-4 relative z-10">
      
      {process.env.NODE_ENV !== 'production' && (
        <div className="fixed top-4 left-4 z-50 bg-black/90 border border-white/10 rounded-xl p-3 text-[10px] text-slate-400 font-mono shadow-2xl space-y-1">
          <div>[DEBUG] LinkCode: <span className="text-[#3B82F6]">{linkCode || 'null'}</span></div>
          <div>[DEBUG] PhoneConfirmed: <span className={phoneConfirmed ? 'text-green-500' : 'text-red-500'}>{String(phoneConfirmed)}</span></div>
          <div>[DEBUG] SessionId: <span className="text-purple-400">{sessionId || 'null'}</span></div>
        </div>
      )}

      {/* progress top panel */}
      <div className="w-full max-w-3xl mb-6 glass-card p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#3B82F6]/10 rounded-xl flex items-center justify-center text-[#3B82F6]">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-sans text-white">
              Шаг {step} из 6: {STEP_NAMES[step] || 'Знакомство'}
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
          
          <button
            onClick={handleResetSession}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-sans font-medium text-white/70 hover:text-white transition duration-200 border border-white/10"
            title="Начать заново"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            <span>Заново</span>
          </button>
        </div>
      </div>

      {/* Main chat window */}
      <div className="w-full max-w-3xl max-h-[60vh] glass-card rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isCoach = msg.role === 'assistant';
            const tgPayload = linkCode || '';

            const telegramBotLink = `https://t.me/moyoprizvanie_bot${tgPayload ? `?start=${tgPayload}` : ''}`;
            const maxIdLink = `https://max.ru/maxid_bot${tgPayload ? `?start=${tgPayload}` : ''}`;

            const qrTelegramLink = telegramBotLink;
            const qrMaxIdLink = maxIdLink;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[80%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isCoach ? 'bg-[#3B82F6]/10 text-[#3B82F6]' : 'bg-[#3B82F6] text-white'
                }`}>
                  {isCoach ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isCoach 
                    ? (step === 6 && idx === messages.length - 1
                        ? 'bg-[#0B1220]/95 text-white border-2 border-[#3B82F6]/30 rounded-tl-none shadow-[0_8px_30px_rgba(0,0,0,0.5)] ring-1 ring-[#3B82F6]/10 relative overflow-hidden'
                        : 'bg-[#080C14]/80 text-[#E8ECF0] border border-white/5 rounded-tl-none shadow-sm'
                      )
                    : 'bg-[#3B82F6]/20 text-[#E8ECF0] border border-[#3B82F6]/30 rounded-tr-none shadow-md'
                }`}>
                  {isCoach && step === 6 && idx === messages.length - 1 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#3B82F6] mb-2">
                      <span>✨</span> Резюме наставника Романа
                    </div>
                  )}
                  {msg.content}

                  {isCoach && step >= 2 && step < 6 && !phoneConfirmed && idx === messages.length - 1 && (
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
          {step === 6 ? (
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
                  className="bg-[#080C14]/80 hover:bg-[#121824] border border-[#3B82F6]/30 text-[#3B82F6] h-12 px-6 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
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
          ) : (
            <form onSubmit={handleSend} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={loading || isTyping}
                placeholder="Напишите ответ..."
                className="flex-1 h-12 px-4 rounded-xl border border-white/10 bg-[#080C14]/70 outline-none focus:border-[#3B82F6]/30 text-white placeholder:text-[#7A8A9E]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || isTyping}
                className="h-12 w-12 rounded-xl bg-[#3B82F6] text-white flex items-center justify-center hover:bg-[#2563EB] transition disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
