'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Compass, Sparkles, Loader2, ArrowLeft, WifiOff, RefreshCw, Clock } from 'lucide-react';
import { useDiagnosticStore } from '../store/diagnosticStore';

const blockIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  riasec: Compass,
  bfi: Sparkles,
  icar: Brain,
  procrastination: Clock,
};

const blockNames: Record<string, string> = {
  riasec: 'Интересы (RIASEC)',
  bfi: 'Личность (Big Five)',
  icar: 'Когнитивные пробы (ICAR)',
  procrastination: 'Поведенческий маркер (Лэй)',
};

export default function AssessmentPage() {
  const router = useRouter();
  const store = useDiagnosticStore();

  const [prevBlock, setPrevBlock] = useState<string | null>(null);
  const [lastSelectedValue, setLastSelectedValue] = useState<number | null>(null);
  const [isDebounced, setIsDebounced] = useState(false);
  const [imgError, setImgError] = useState(false);

  const questionStartTime = useRef<number>(0);

  // Восстановление сессии диагностики или редирект
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const coachSessionId = localStorage.getItem('coachSessionId');
      if (!coachSessionId) {
        router.push('/');
        return;
      }

      // Если в Zustand еще нет активной сессии, запускаем ее автоматически
      if (!store.sessionId && !store.isLoading) {
        const name = localStorage.getItem('studentName') || 'Гость';
        const grade = localStorage.getItem('studentGrade') || '8';
        store.startSession(name, grade).catch(() => {
          alert('Ошибка соединения с базой данных. Пожалуйста, попробуйте позже.');
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, store.sessionId]);

  // Запуск таймера при появлении вопроса
  useEffect(() => {
    if (store.currentQuestion) {
      questionStartTime.current = Date.now();
      setImgError(false);
      setPrevBlock(store.currentQuestion.test_type);
    }
  }, [store.currentQuestion?.question_id]);

  // Перенаправление на отчет при завершении
  useEffect(() => {
    if (store.isCompleted && store.sessionId) {
      // Сохраняем флаг завершения диагностики для шаг-карты на главной
      localStorage.setItem('diagnosticCompleted', 'true');
      router.push(`/report?session_id=${store.sessionId}`);
    }
  }, [store.isCompleted, store.sessionId, router]);

  // Горячие клавиши (1-5 для ответов, ArrowLeft для Назад)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.lockdownTimeLeft > 0 || store.isLoading) return;
      if (store.currentQuestion && store.answersHistory[store.currentQuestion.question_id]) return;

      if (['1', '2', '3', '4', '5'].includes(e.key)) {
        const val = parseInt(e.key, 10);
        handleChooseAnswer(val);
      } else if (e.key === 'ArrowLeft') {
        store.goBack();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestion, store.lockdownTimeLeft, store.isLoading, store.answersHistory]);

  const handleChooseAnswer = async (value: number) => {
    if (isDebounced || store.isLoading || store.lockdownTimeLeft > 0) return;

    setIsDebounced(true);
    setTimeout(() => setIsDebounced(false), 350);

    const timeSpent = Date.now() - questionStartTime.current;
    setLastSelectedValue(value);
    
    await store.submitAnswer(value, timeSpent);
  };

  // 1. Оверлей фрод-локдауна (Click-Speed Lock)
  if (store.lockdownTimeLeft > 0) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10">
        <div className="rounded-[32px] border border-red-500/20 bg-[#080C14]/95 p-10 text-center backdrop-blur-xl shadow-2xl relative overflow-hidden animate-pulse">
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <span className="text-red-500 font-extrabold text-4xl">⚠️</span>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold font-sans text-white">Пожалуйста, делай выбор осознанно</h1>
              <p className="max-w-md text-sm text-[#7A8A9E] leading-relaxed">
                Мы заметили, что ты спешишь. Твои результаты могут оказаться неточными. Тест временно заблокирован.
              </p>
            </div>
            <div className="text-4xl font-extrabold font-sans text-red-500">
              {store.lockdownTimeLeft} сек
            </div>
          </div>
        </div>
      </main>
    );
  }

  // 2. Лоадер при загрузке вопросов
  if (store.isLoading || !store.currentQuestion) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-2xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10">
        <div className="rounded-[32px] glass-card p-8 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center space-y-8">
            <Loader2 className="h-16 w-16 animate-spin text-[#3B82F6] opacity-80" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold font-sans text-white">Загрузка вопросов диагностики...</h1>
              <p className="max-w-md text-xs text-[#7A8A9E] leading-relaxed">
                Пожалуйста, подождите, мы настраиваем сессию тестирования.
              </p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const currentQuestion = store.currentQuestion;
  const Icon = blockIcons[currentQuestion.test_type] || Compass;
  const isWaitingForNext = store.answersHistory[currentQuestion.question_id] !== undefined;

  // Рассчитываем текущий номер вопроса (всего 29 вопросов)
  const currentQuestionNumber = Math.round((currentQuestion.progress_percent / 100) * 29) + 1;

  return (
    <main className="mx-auto min-h-[calc(100vh-100px)] max-w-7xl px-6 py-10 lg:px-10 relative z-10 pt-28">
      
      {/* Плашка оффлайн-режима */}
      {store.isOffline && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-red-200 backdrop-blur-sm shadow-lg max-w-4xl mx-auto transition-opacity">
          <div className="flex items-center gap-3">
            <WifiOff className="h-5 w-5 text-red-400 shrink-0 animate-pulse" />
            <p className="text-xs md:text-sm leading-relaxed text-red-200">
              Сеть временно недоступна. 
              {store.offlineAnswersBuffer.length > 0 && (
                <span className="font-bold ml-2">Неотправленных ответов: {store.offlineAnswersBuffer.length}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => store.syncOfflineAnswers()}
            className="text-xs font-bold text-white bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5"
          >
            <RefreshCw className="h-3 w-3" />
            Повторить
          </button>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        
        {/* Боковая панель прогресса */}
        <aside className="glass-panel space-y-6 rounded-[32px] p-6 lg:p-7">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-[#3B82F6] font-bold">
              Интерактивная диагностика
            </span>
            <h1 className="text-2xl font-bold text-white mt-3 leading-tight font-sans">
              Диагностика потенциала
            </h1>
            <p className="mt-2 text-sm text-[#7A8A9E] leading-relaxed">
              Отвечайте искренне. Здесь нет правильных или неправильных ответов.
            </p>
          </div>

          {/* Общий прогресс */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-white font-sans">Общий прогресс</p>
              <p className="text-sm font-bold text-[#3B82F6]">{currentQuestion.progress_percent}%</p>
            </div>
            <div className="mt-3.5 h-1.5 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-1.5 rounded-full bg-[#3B82F6] transition-all duration-300"
                style={{ width: `${currentQuestion.progress_percent}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-muted">
              <span>Вопрос {currentQuestionNumber > 29 ? 29 : currentQuestionNumber} из 29</span>
              <span>Блок: {blockNames[currentQuestion.test_type]}</span>
            </div>
          </div>

          {/* Список блоков теста */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-4 space-y-3.5">
            <p className="text-sm font-semibold text-white">Этапы диагностики</p>
            <div className="space-y-3">
              {Object.entries(blockNames).map(([key, name]) => {
                const BlockIcon = blockIcons[key] || Compass;
                const isCurrent = currentQuestion.test_type === key;
                
                // Простая логика определения пройденных этапов
                const keys = Object.keys(blockNames);
                const currentIdx = keys.indexOf(currentQuestion.test_type);
                const blockIdx = keys.indexOf(key);
                const isPassed = blockIdx < currentIdx;

                return (
                  <div 
                    key={key} 
                    className={`rounded-xl border p-3 transition duration-200 ${
                      isCurrent 
                        ? 'border-[#3B82F6] bg-[#3B82F6]/5 text-white' 
                        : isPassed 
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                          : 'border-white/5 bg-white/[0.01] text-[#7A8A9E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <BlockIcon className="h-4 w-4" />
                        <span className="text-xs font-semibold">{name}</span>
                      </div>
                      {isPassed && <span className="text-[10px] uppercase font-bold text-emerald-400">Пройден</span>}
                      {isCurrent && <span className="text-[10px] uppercase font-bold text-[#3B82F6] animate-pulse">Текущий</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Карточный интерфейс вопросов */}
        <section className="glass-panel rounded-[32px] p-6 lg:p-8 flex flex-col justify-between overflow-hidden relative min-h-[500px]">
          
          {isWaitingForNext && (
            <div className="absolute inset-0 z-50 bg-[#040506]/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-[32px]">
              <Loader2 className="h-10 w-10 animate-spin text-[#3B82F6] mb-4" />
              <p className="text-sm font-bold text-white">Синхронизация ответа...</p>
              {store.isOffline && <p className="text-xs text-muted mt-2">Ожидание подключения к сети</p>}
            </div>
          )}

          <div className="space-y-6 flex-1 flex flex-col justify-between relative z-10">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#3B82F6] font-sans">
                  <Icon className="h-3.5 w-3.5" />
                  {blockNames[currentQuestion.test_type]}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-[1fr_130px] items-center mt-6">
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-white leading-snug lg:text-3xl font-sans">
                    {currentQuestion.question_text}
                  </h2>
                  <p className="text-xs text-[#7A8A9E] leading-relaxed">
                    Выбери вариант ответа ниже. Вы также можете использовать клавиши 1-5 на клавиатуре.
                  </p>
                </div>
                
                {/* Иллюстрация (Fallback) */}
                <div className="relative w-full h-[130px] rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden flex items-center justify-center">
                  {!imgError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={currentQuestion.visual_asset_url} 
                      alt="Визуализация вопроса" 
                      className="object-cover w-full h-full opacity-70"
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <div className="text-[#3B82F6]/40 flex flex-col items-center justify-center gap-2">
                      <Brain className="h-10 w-10 animate-pulse text-[#3B82F6]" />
                      <span className="text-[10px] uppercase tracking-wider font-semibold font-sans">Диагностика</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Варианты Ликерта */}
              <div className="grid gap-3 mt-8">
                {currentQuestion.available_answers.map((ans) => {
                  const active = lastSelectedValue === ans.value;
                  const borderActive = 'border-[#3B82F6] bg-[#3B82F6]/10 text-white shadow-sm';
                  const borderNormal = 'border-white/10 bg-white/[0.02] text-[#E8ECF0] hover:border-[#3B82F6]/40 hover:bg-[#3B82F6]/5';

                  return (
                    <button
                      key={ans.value}
                      type="button"
                      onClick={() => handleChooseAnswer(ans.value)}
                      disabled={store.isLoading || isWaitingForNext}
                      className={`flex items-center gap-4 rounded-2xl border p-4 text-left transition duration-200 ${
                        active ? borderActive : borderNormal
                      }`}
                    >
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold transition ${
                          active 
                            ? 'border-[#3B82F6] bg-[#3B82F6] text-white' 
                            : 'border-white/10 text-[#7A8A9E]'
                        }`}
                      >
                        {ans.value}
                      </div>
                      <span className="text-sm font-semibold">{ans.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Панель навигации */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-6">
              <button
                type="button"
                onClick={() => store.goBack()}
                disabled={store.isLoading || currentQuestionNumber <= 1 || isWaitingForNext}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад
              </button>

              <div className="text-xs text-muted flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Диагностика онлайн</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
