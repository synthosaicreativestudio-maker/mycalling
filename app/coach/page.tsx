'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowRight, User, Brain, MessageSquare, Compass, Shield, Award, Fingerprint } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const STEP_NAMES: Record<number, string> = {
  0: 'Подготовка к диалогу',
  1: 'Пре-квалификация',
  2: 'Знакомство',
  3: 'Исследование личности',
  4: 'Проверка гипотез',
  5: 'Предварительный профиль',
  6: 'Подведение итогов'
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

  // Поллинг подтверждения телефона/авторизации через ботов
  useEffect(() => {
    if (!linkCode || phoneConfirmed || !sessionId) return;

    let isSubscribed = true;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/auth/poll?code=${linkCode}`);
        const data = await res.json();

        if (!isSubscribed) return;

        if (data.status === 'COMPLETED') {
          clearInterval(interval);
          setPhoneConfirmed(true);
          
          // Отправляем системное сообщение коучу, чтобы мгновенно продвинуть шаг
          const chatRes = await fetch('/api/v1/coach/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Телефон подтвержден через бот', sessionId })
          });
          const chatData = await chatRes.json();
          if (chatData.reply) {
            setMessages(prev => [...prev, { role: 'assistant', content: chatData.reply }]);
          }
          if (chatData.currentStep !== undefined) {
            setStep(chatData.currentStep);
          }
        } else if (data.status === 'EXPIRED') {
          clearInterval(interval);
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
        setMessages(prev => [...prev, { role: 'assistant', content: chatData.reply }]);
      }
      if (chatData.currentStep !== undefined) {
        setStep(chatData.currentStep);
        // Если получен телефон от экстрактора — помечаем как подтвержденный
        if (chatData.extracted?.phone) {
          setPhoneConfirmed(true);
        }
        if (chatData.currentStep === 6) {
          // Записываем имя ученика в localStorage для страницы тестов
          if (chatData.extracted?.fullName) {
            localStorage.setItem('studentName', chatData.extracted.fullName);
          }
        }
      }
    } catch (err) {
      console.error('Ошибка отправки сообщения:', err);
    } finally {
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
            border: 2px solid #8c6e4b;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid rgba(140, 110, 75, 0.2);
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .logo {
            font-size: 24px;
            font-weight: bold;
            color: #8c6e4b;
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

  const progressPercent = Math.round((step / 6) * 100);

  return (
    <main className="min-h-screen pt-28 pb-12 flex flex-col items-center justify-center px-4 relative z-10">
      
      {/* progress top panel */}
      <div className="w-full max-w-3xl mb-6 glass-card p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-[#8c6e4b]/10 rounded-xl flex items-center justify-center text-[#8c6e4b]">
            <Brain className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-sm font-bold font-sans text-text">
              Шаг {step} из 6: {STEP_NAMES[step] || 'Знакомство'}
            </h2>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-[#8c6e4b]">{progressPercent}%</span>
          <div className="w-24 h-2 bg-[#8c6e4b]/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#8c6e4b] transition-all duration-500" 
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main chat window */}
      <div className="w-full max-w-3xl h-[60vh] glass-card rounded-3xl flex flex-col overflow-hidden relative">
        
        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((msg, idx) => {
            const isCoach = msg.role === 'assistant';
            const tgPayload = linkCode || '';

            const telegramBotLink = isMobile
              ? `tg://resolve?domain=moyoprizvanie_bot${tgPayload ? `&start=${tgPayload}` : ''}`
              : `https://t.me/moyoprizvanie_bot${tgPayload ? `?start=${tgPayload}` : ''}`;
              
            const maxIdLink = isMobile
              ? `max://maxid_bot${tgPayload ? `/start/${tgPayload}` : ''}`
              : `https://max.ru/maxid_bot${tgPayload ? `/start/${tgPayload}` : ''}`;

            const qrTelegramLink = `https://t.me/moyoprizvanie_bot${tgPayload ? `?start=${tgPayload}` : ''}`;
            const qrMaxIdLink = `https://max.ru/maxid_bot${tgPayload ? `/start/${tgPayload}` : ''}`;

            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 max-w-[80%] ${isCoach ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}
              >
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center text-xs font-bold ${
                  isCoach ? 'bg-[#c2ab87]/15 text-[#8c6e4b]' : 'bg-[#8c6e4b] text-white'
                }`}>
                  {isCoach ? <Brain className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </div>
                <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                  isCoach 
                    ? (step === 6 && idx === messages.length - 1
                        ? 'bg-gradient-to-br from-white/95 to-[#fcfaf6] text-text border-2 border-[#8c6e4b] rounded-tl-none shadow-[0_8px_30px_rgba(140,110,75,0.15)] ring-1 ring-[#8c6e4b]/20 relative overflow-hidden'
                        : 'bg-white/80 text-text border border-[#8c6e4b]/10 rounded-tl-none shadow-sm'
                      )
                    : 'bg-[#8c6e4b] text-white rounded-tr-none shadow-md'
                }`}>
                  {isCoach && step === 6 && idx === messages.length - 1 && (
                    <div className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#8c6e4b] mb-2">
                      <span>✨</span> Резюме наставника Романа
                    </div>
                  )}
                  {msg.content}

                  {isCoach && step >= 1 && step < 6 && !phoneConfirmed && idx === messages.length - 1 && (
                    <div className="mt-4 p-4 rounded-xl bg-[#8c6e4b]/5 border border-[#8c6e4b]/15 space-y-3">
                      <p className="text-xs font-bold text-[#8c6e4b] flex items-center gap-1.5">
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
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}

          {isTyping && (
            <div className="flex gap-3 max-w-[80%] mr-auto">
              <div className="h-8 w-8 rounded-full bg-[#c2ab87]/15 text-[#8c6e4b] flex items-center justify-center">
                <Brain className="h-4 w-4" />
              </div>
              <div className="p-4 rounded-2xl bg-white/80 border border-[#8c6e4b]/10 rounded-tl-none shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#8c6e4b] animate-bounce [animation-delay:-0.3s]" />
                <span className="w-2 h-2 rounded-full bg-[#8c6e4b] animate-bounce [animation-delay:-0.15s]" />
                <span className="w-2 h-2 rounded-full bg-[#8c6e4b] animate-bounce" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <div className="p-4 border-t border-[#8c6e4b]/10 bg-white/45 backdrop-blur-md">
          {step === 6 ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center p-4 space-y-4"
            >
              <h3 className="text-lg font-bold text-text">Коуч-сессия успешно завершена!</h3>
              <p className="text-xs text-muted max-w-md mx-auto">
                Вы отлично поработали с нейрокоучем. Теперь ваш цифровой профиль подготовлен для прохождения интерактивных тестов.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3">
                <button 
                  type="button"
                  onClick={downloadPreliminaryReport}
                  className="bg-white hover:bg-gray-50 border border-[#8c6e4b]/40 text-[#8c6e4b] h-12 px-6 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 shadow-sm w-full sm:w-auto"
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
                className="flex-1 h-12 px-4 rounded-xl border border-[#8c6e4b]/20 bg-white/70 outline-none focus:border-[#8c6e4b]/40 text-text placeholder:text-[#a89a8a]"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading || isTyping}
                className="h-12 w-12 rounded-xl bg-[#8c6e4b] text-white flex items-center justify-center hover:bg-[#735a3d] transition disabled:opacity-50"
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
