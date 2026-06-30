'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Loader2, ArrowRight, User, Brain, MessageSquare, Compass, Shield, Award } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function CoachPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Инициализация первой реплики коуча
  useEffect(() => {
    async function initSession() {
      setLoading(true);
      try {
        const res = await fetch('/api/v1/coach/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: 'Начать сессию с коучем' })
        });
        const data = await res.json();
        if (data.reply) {
          setMessages([{ role: 'assistant', content: data.reply }]);
          setSessionId(data.sessionId);
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

    // Проверяем, есть ли уже сохраненная сессия в localStorage
    const savedSessionId = typeof window !== 'undefined' ? localStorage.getItem('coachSessionId') : null;
    if (savedSessionId) {
      setSessionId(savedSessionId);
      // Загружаем историю (можно было бы запросить историю из БД, но для MVP начнем новую или продолжим)
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
      // 1. Отправка сообщения коучу
      const chatRes = await fetch('/api/v1/coach/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, sessionId })
      });
      const chatData = await chatRes.json();

      // 2. Извлечение структурированных данных и шаг вперед
      const extractRes = await fetch('/api/v1/coach/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, lastUserMessage: userMessage })
      });
      const extractData = await extractRes.json();

      if (chatData.reply) {
        setMessages(prev => [...prev, { role: 'assistant', content: chatData.reply }]);
      }
      if (extractData.currentStep !== undefined) {
        setStep(extractData.currentStep);
        if (extractData.currentStep === 6) {
          // Записываем имя ученика в localStorage для страницы тестов
          if (extractData.extracted?.fullName) {
            localStorage.setItem('studentName', extractData.extracted.fullName);
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
            <h2 className="text-sm font-bold font-sans text-text">Нейрокоуч-сессия</h2>
            <p className="text-xs text-muted">Шаг {step + 1} из 6: Исследуем ваши таланты</p>
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
                    ? 'bg-white/80 text-text border border-[#8c6e4b]/10 rounded-tl-none shadow-sm' 
                    : 'bg-[#8c6e4b] text-white rounded-tr-none shadow-md'
                }`}>
                  {msg.content}
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
              <button 
                onClick={handleNextStep}
                className="cta-glass h-12 px-8 text-sm inline-flex items-center gap-2"
              >
                Перейти к диагностике (тестам)
                <ArrowRight className="h-4 w-4" />
              </button>
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
