'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Brain, Compass, Sparkles, Loader2, ArrowLeft, WifiOff, RefreshCw, Clock, ShieldAlert, KeyRound, Award, ThumbsUp, ThumbsDown } from 'lucide-react';

const themeStyles: Record<string, {
  bgClass: string;
  glowClass: string;
  title: string;
  subtitle: string;
  badgeColor: string;
  cardActiveBorder: string;
  accentColor: string;
}> = {
  SPACE: {
    bgClass: 'from-[#02050c] via-[#081121] to-[#02050c]',
    glowClass: 'shadow-[0_0_50px_rgba(59,130,246,0.12)] border-[#3B82F6]/20',
    title: 'Космическая Одиссея',
    subtitle: 'Исследование вашего потенциала',
    badgeColor: 'border-blue-500/20 bg-blue-500/5 text-[#60A5FA]',
    cardActiveBorder: 'border-[var(--accent-brown)] bg-[#3B82F6]/10 text-white shadow-sm',
    accentColor: '#3B82F6'
  },
  CREATIVE: {
    bgClass: 'from-[#0a0510] via-[#160a22] to-[#0a0510]',
    glowClass: 'shadow-[0_0_50px_rgba(236,72,153,0.12)] border-pink-500/20',
    title: 'Креативная Вселенная',
    subtitle: 'Созидание вашей траектории',
    badgeColor: 'border-pink-500/20 bg-pink-500/5 text-pink-400',
    cardActiveBorder: 'border-pink-500 bg-pink-500/10 text-white shadow-sm',
    accentColor: '#EC4899'
  },
  BUSINESS: {
    bgClass: 'from-[#050a0b] via-[#0a1b15] to-[#050a0b]',
    glowClass: 'shadow-[0_0_50px_rgba(34,197,94,0.12)] border-green-500/20',
    title: 'Киберпанк-Стартап',
    subtitle: 'Запуск вашего проекта',
    badgeColor: 'border-green-500/20 bg-green-500/5 text-green-400',
    cardActiveBorder: 'border-green-500 bg-green-500/10 text-white shadow-sm',
    accentColor: '#22C55E'
  }
};

const getAdaptiveQuestionText = (qId: string, baseText: string, theme: string) => {
  if (theme === 'SPACE') {
    if (qId.startsWith('riasec-r')) return `🛠️ [Ремонт гипердвигателя] ${baseText}`;
    if (qId.startsWith('riasec-i')) return `🔬 [Научный скан сектора] ${baseText}`;
    if (qId.startsWith('riasec-a')) return `🎨 [Проектирование купола базы] ${baseText}`;
    if (qId.startsWith('riasec-s')) return `👥 [Инструктаж нового экипажа] ${baseText}`;
    if (qId.startsWith('riasec-e')) return `👑 [Принятие командования] ${baseText}`;
    if (qId.startsWith('riasec-c')) return `📊 [Систематизация логов полета] ${baseText}`;
    if (qId.startsWith('bfi-')) return `🌌 [Бортовой журнал] ${baseText}`;
    if (qId.startsWith('lay-')) return `⏳ [Ресурсы жизнеобеспечения] ${baseText}`;
  }
  if (theme === 'CREATIVE') {
    if (qId.startsWith('riasec-r')) return `🎨 [Арт-инсталляция своими руками] ${baseText}`;
    if (qId.startsWith('riasec-i')) return `🔮 [Поиск скрытых смыслов] ${baseText}`;
    if (qId.startsWith('riasec-a')) return `🎭 [Свободный творческий полет] ${baseText}`;
    if (qId.startsWith('riasec-s')) return `🤝 [Организация комьюнити] ${baseText}`;
    if (qId.startsWith('riasec-e')) return `📢 [Презентация манифеста] ${baseText}`;
    if (qId.startsWith('riasec-c')) return `📐 [Сетка и пропорции холста] ${baseText}`;
    if (qId.startsWith('bfi-')) return `✨ [Внутренний мир] ${baseText}`;
    if (qId.startsWith('lay-')) return `🌸 [Муза и Вдохновение] ${baseText}`;
  }
  if (theme === 'BUSINESS') {
    if (qId.startsWith('riasec-r')) return `⚙️ [Производственная линия] ${baseText}`;
    if (qId.startsWith('riasec-i')) return `📈 [Анализ конкурентов] ${baseText}`;
    if (qId.startsWith('riasec-a')) return `💡 [Разработка креативного бренда] ${baseText}`;
    if (qId.startsWith('riasec-s')) return `🤝 [Переговоры о партнерстве] ${baseText}`;
    if (qId.startsWith('riasec-e')) return `🚀 [Запуск нового продукта] ${baseText}`;
    if (qId.startsWith('riasec-c')) return `📊 [Финмодель и учет бюджета] ${baseText}`;
    if (qId.startsWith('bfi-')) return `💼 [Корпоративная культура] ${baseText}`;
    if (qId.startsWith('lay-')) return `🎯 [Дедлайн и спринты] ${baseText}`;
  }
  return baseText;
};
import { useDiagnosticStore } from '../store/diagnosticStore';
import { getNarrative, type NarrativeChapter } from '../data/narrative';

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

  // Межблочный экран-переход (Д-8: игровая упаковка). Показывается, когда
  // test_type нового вопроса отличается от предыдущего — то есть началась
  // новая «глава» диагностики. Чисто презентационное состояние, не влияет
  // на store/API.
  const [chapterTransition, setChapterTransition] = useState<{
    to: NarrativeChapter;
    from: NarrativeChapter | null;
    questionId: string;
  } | null>(null);

  const questionStartTime = useRef<number>(0);

  // Проверка сессии и прогресса на сервере при монтировании
  useEffect(() => {
    async function checkAuthProgress() {
      try {
        console.log('[auth] Assessment page checking progress...');
        const res = await fetch('/api/auth/progress');
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated) {
            console.log('[auth] Assessment page progress check result:', data);
            if (!data.coachCompleted) {
              router.push('/coach');
            } else if (data.testCompleted) {
              router.push('/report');
            }
          }
        }
      } catch (err) {
        console.error('[auth] Error checking progress on assessment page:', err);
      }
    }
    checkAuthProgress();
  }, [router]);

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

  // Автоматическая загрузка вопроса, если сессия уже есть, но вопрос равен null (например, при обновлении страницы)
  useEffect(() => {
    if (store.sessionId && !store.currentQuestion && !store.isLoading && !store.isCompleted) {
      store.fetchNextQuestion();
    }
    // Зависим от конкретных полей store, а не от всего объекта store (он новый
    // на каждый рендер zustand-селектора) — иначе эффект зациклится.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.sessionId, store.currentQuestion, store.isLoading, store.isCompleted]);

  // Запуск таймера при появлении вопроса
  useEffect(() => {
    if (store.currentQuestion) {
      questionStartTime.current = Date.now();
      setImgError(false);

      const newBlock = store.currentQuestion.test_type;
      // Показываем экран-переход, если это первый вопрос сессии или блок сменился
      if (newBlock !== prevBlock) {
        const toChapter = getNarrative(newBlock);
        if (toChapter) {
          setChapterTransition({
            to: toChapter,
            from: getNarrative(prevBlock),
            questionId: store.currentQuestion.question_id,
          });
        }
      }

      setPrevBlock(newBlock);
      setLastSelectedValue(null); // Сброс выделения для нового вопроса
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store.currentQuestion?.question_id]);

  // При завершении тестирования: если пользователь проходил простую (EXPRESS)
  // коуч-сессию и ещё не проходил глубокую — предлагаем её опцией, а не сразу
  // уводим на отчёт. Если это неактуально (уже DEEP, или уже пройдена, или
  // проверка не удалась) — ведём себя как раньше.
  const [deepOffer, setDeepOffer] = useState(false);

  useEffect(() => {
    if (!store.isCompleted || !store.sessionId) return;
    localStorage.setItem('diagnosticCompleted', 'true');

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/auth/progress');
        if (res.ok) {
          const data = await res.json();
          if (!cancelled && data.authenticated && data.coachSessionMode === 'EXPRESS' && !data.deepSessionCompleted) {
            setDeepOffer(true);
            return;
          }
        }
      } catch (err) {
        console.error('[assessment] Failed to check deep-session offer eligibility:', err);
      }
      if (!cancelled) router.push(`/report?session_id=${store.sessionId}`);
    })();

    return () => { cancelled = true; };
  }, [store.isCompleted, store.sessionId, router]);

  // Горячие клавиши (1-5 для ответов, ArrowLeft для Назад)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (store.lockdownTimeLeft > 0 || store.isLoading) return;
      if (store.currentQuestion && store.answersHistory[store.currentQuestion.question_id]) return;
      // Экран-переход между главами (Д-8) перехватывает клавиатуру, чтобы
      // случайное нажатие 1-5 не отправило ответ на вопрос, который ещё не показан.
      if (chapterTransition && store.currentQuestion && chapterTransition.questionId === store.currentQuestion.question_id) return;

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
  }, [store.currentQuestion, store.lockdownTimeLeft, store.isLoading, store.answersHistory, chapterTransition]);

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
              <p className="max-w-md text-sm text-[var(--text-muted)] leading-relaxed">
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

  // 1.5. Предложение пройти глубокую сессию после завершения тестирования
  if (deepOffer) {
    return (
      <main className="mx-auto flex min-h-[calc(100vh-140px)] max-w-xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10">
        <div className="rounded-[32px] glass-card p-10 text-center relative overflow-hidden">
          <div className="relative z-10 flex flex-col items-center space-y-6">
            <span className="text-4xl">🧭</span>
            <div className="space-y-3">
              <h1 className="text-2xl font-bold font-sans text-white">Тестирование завершено!</h1>
              <p className="max-w-md text-sm text-[var(--text-muted)] leading-relaxed">
                Ты уже собрал базовый профиль. Хочешь пройти <span className="text-[#C4A484] font-semibold">глубокую сессию</span> с наставником Романом — разобрать свою цель, эмоции и первый шаг детальнее? Это займёт ещё немного времени, но результат войдёт отдельным разделом в твой финальный отчёт.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full pt-2">
              <button
                onClick={() => router.push('/coach?forceDeep=1')}
                className="flex-1 rounded-2xl bg-[#C4A484] px-6 py-3 text-sm font-bold font-sans text-[#1a1208] transition hover:brightness-110"
              >
                Пройти глубокую сессию
              </button>
              <button
                onClick={() => router.push(`/report?session_id=${store.sessionId}`)}
                className="flex-1 rounded-2xl border border-white/10 px-6 py-3 text-sm font-bold font-sans text-white/80 transition hover:bg-white/5"
              >
                Перейти сразу к отчёту
              </button>
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
            <Loader2 className="h-16 w-16 animate-spin text-[var(--accent-brown)] opacity-80" />
            <div className="space-y-2">
              <h1 className="text-xl font-bold font-sans text-white">Загрузка вопросов диагностики...</h1>
              <p className="max-w-md text-xs text-[var(--text-muted)] leading-relaxed">
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

  const narrativeTheme = (currentQuestion as any).narrative_theme || 'CREATIVE';
  const currentStyle = themeStyles[narrativeTheme] || themeStyles.CREATIVE;

  // 3. Межблочный экран-переход («глава» диагностики). Показывается один раз
  // перед первым вопросом нового блока и не трогает store/API — пользователь
  // просто жмёт «Продолжить», чтобы увидеть сам вопрос.
  if (chapterTransition && chapterTransition.questionId === currentQuestion.question_id) {
    const { to, from } = chapterTransition;
    return (
      <main className={`mx-auto flex min-h-[calc(100vh-140px)] max-w-xl flex-col justify-center px-6 pt-[120px] pb-12 relative z-10 transition-all duration-700`}>
        <div className="rounded-[32px] glass-card p-8 md:p-10 text-center relative overflow-hidden border border-white/10 shadow-2xl">
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-[120px] pointer-events-none opacity-20" style={{ backgroundColor: currentStyle.accentColor }} />
          <div className="relative z-10 flex flex-col items-center space-y-6">
            {from && (
              <p className="text-xs font-semibold text-emerald-400 uppercase tracking-wide">
                {from.emoji} «{from.chapterTitle}» пройдена — {from.outro}
              </p>
            )}
            <span className="text-5xl">{to.emoji}</span>
            <div className="space-y-3">
              <span className="text-[10px] uppercase tracking-[0.25em] font-bold" style={{ color: currentStyle.accentColor }}>
                Глава {to.chapterNumber || ''} · Новый этап
              </span>
              <h1 className="text-2xl font-bold font-sans text-white">{to.chapterTitle}</h1>
              <p className="max-w-md text-sm text-[var(--text-muted)] leading-relaxed">
                {to.intro}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setChapterTransition(null)}
              className="mt-2 inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-bold font-sans text-white transition duration-300 hover:opacity-90"
              style={{ backgroundColor: currentStyle.accentColor }}
            >
              Продолжить
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`mx-auto h-[calc(100dvh-90px)] max-w-7xl px-4 py-4 lg:px-8 relative z-10 pt-20 flex flex-col justify-between overflow-hidden transition-all duration-700`}>
      {/* Мягкие размытые круги под выбранную тему */}
      <div className="absolute top-0 right-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-20 transition-all duration-700" style={{ backgroundColor: currentStyle.accentColor }} />
      <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full blur-[120px] pointer-events-none opacity-10 transition-all duration-700" style={{ backgroundColor: currentStyle.accentColor }} />
      
      {/* Плашка оффлайн-режима */}
      {store.isOffline && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-2xl border border-red-500/20 bg-red-500/10 p-3 text-red-200 backdrop-blur-sm shadow-lg max-w-4xl mx-auto transition-opacity w-full shrink-0">
          <div className="flex items-center gap-3">
            <WifiOff className="h-4 w-4 text-red-400 shrink-0 animate-pulse" />
            <p className="text-xs leading-relaxed text-red-200">
              Сеть временно недоступна. 
              {store.offlineAnswersBuffer.length > 0 && (
                <span className="font-bold ml-2">Неотправленных ответов: {store.offlineAnswersBuffer.length}</span>
              )}
            </p>
          </div>
          <button
            onClick={() => store.syncOfflineAnswers()}
            className="text-[10px] font-bold text-white bg-red-500/20 hover:bg-red-500/35 border border-red-500/30 px-2.5 py-1 rounded-lg transition flex items-center gap-1"
          >
            <RefreshCw className="h-2.5 w-2.5" />
            Повторить
          </button>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr] flex-1 min-h-0 overflow-hidden pb-4">
        
        {/* Боковая панель прогресса */}
        <aside className="glass-panel rounded-[24px] p-4 lg:p-5 flex flex-col justify-between overflow-y-auto min-h-0 lg:max-h-full space-y-4">
          <div>
            <span className="text-[10px] uppercase tracking-[0.25em] font-bold transition-all duration-500" style={{ color: currentStyle.accentColor }}>
              {currentStyle.title}
            </span>
            <h1 className="text-xl font-bold text-white mt-1.5 leading-tight font-sans">
              {currentStyle.subtitle}
            </h1>
            <p className="mt-1 text-xs text-[var(--text-muted)] leading-relaxed">
              Вы продвигаетесь по игровому сценарию. Отвечайте искренне для точного совпадения!
            </p>
          </div>

          {/* Общий прогресс */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-white font-sans">Общий прогресс</p>
              <p className="text-xs font-bold text-[var(--accent-brown)]">{currentQuestion.progress_percent}%</p>
            </div>
            <div className="mt-2.5 h-1 rounded-full bg-black/10 overflow-hidden">
              <div
                className="h-1 rounded-full bg-[var(--accent-brown)] transition-all duration-300"
                style={{ width: `${currentQuestion.progress_percent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
              <span>Вопрос {currentQuestionNumber > 29 ? 29 : currentQuestionNumber} из 29</span>
              <span>Блок: {blockNames[currentQuestion.test_type]}</span>
            </div>
          </div>

          {/* Список блоков теста */}
          <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3 space-y-2">
            <p className="text-xs font-semibold text-white">Этапы диагностики</p>
            <div className="space-y-2">
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
                    className={`rounded-xl border p-2.5 transition duration-200 ${
                      isCurrent 
                        ? 'border-[var(--accent-brown)] bg-[#3B82F6]/5 text-white' 
                        : isPassed 
                          ? 'border-emerald-500/20 bg-emerald-500/5 text-emerald-400' 
                          : 'border-white/5 bg-white/[0.01] text-[var(--text-muted)]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BlockIcon className="h-3.5 w-3.5" />
                        <span className="text-[10px] font-semibold">{name}</span>
                      </div>
                      {isPassed && <span className="text-[8px] uppercase font-bold text-emerald-400">Пройден</span>}
                      {isCurrent && <span className="text-[8px] uppercase font-bold text-[var(--accent-brown)] animate-pulse">Текущий</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Карточный интерфейс вопросов */}
        <section className="glass-panel rounded-[24px] p-4 lg:p-6 flex flex-col justify-between overflow-y-auto relative min-h-0 lg:max-h-full">
          
          {isWaitingForNext && (
            <div className="absolute inset-0 z-50 bg-[#040506]/85 backdrop-blur-sm flex flex-col items-center justify-center rounded-[24px]">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--accent-brown)] mb-3" />
              <p className="text-xs font-bold text-white">Синхронизация ответа...</p>
              {store.isOffline && <p className="text-[10px] text-muted mt-1">Ожидание подключения к сети</p>}
            </div>
          )}

          <div className="space-y-4 flex-1 flex flex-col justify-between relative z-10 min-h-0">
            <div>
              <div className="flex items-center justify-between gap-4 border-b border-white/5 pb-3">
                <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider font-sans transition-all duration-500`} style={{ borderColor: `${currentStyle.accentColor}40`, backgroundColor: `${currentStyle.accentColor}08`, color: currentStyle.accentColor }}>
                  <Icon className="h-3 w-3" />
                  {blockNames[currentQuestion.test_type]}
                </div>
              </div>

              <div className="mt-4">
                <div className="space-y-3">
                  <h2 className="text-lg md:text-xl lg:text-2xl font-bold text-white leading-snug font-sans">
                    {getAdaptiveQuestionText(currentQuestion.question_id, currentQuestion.question_text, narrativeTheme)}
                  </h2>
                  <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                    {currentQuestion.test_type === 'riasec'
                      ? 'Определи свое отношение к этому занятию. Выбери одну из интерактивных карточек ниже.'
                      : currentQuestion.test_type === 'icar'
                        ? 'Взломай код: проанализируй логическую задачу и введи правильный ответ на кодовой панели.'
                        : 'Прочитай жизненную ситуацию и выбери стратегию поведения, наиболее близкую тебе.'}
                  </p>
                </div>
              </div>

              {/* ─── НОВЫЙ ИНТЕРАКТИВНЫЙ ИНТЕРФЕЙС ВОПРОСОВ ─── */}

              {/* 1. ФОРМАТ: ВИЗУАЛЬНЫЙ ВЫБОР ИЗ ДВУХ (для RIASEC) */}
              {currentQuestion.test_type === 'riasec' && (
                <div className="grid gap-4 md:grid-cols-2 mt-6">
                  {/* Карточка 1: НРАВИТСЯ (5 баллов) */}
                  <button
                    type="button"
                    onClick={() => handleChooseAnswer(5)}
                    disabled={store.isLoading || isWaitingForNext}
                    className={`group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.01] p-6 text-center transition-all duration-300 hover:border-emerald-500/40 hover:bg-emerald-500/[0.02] hover:shadow-[0_8px_30px_rgba(16,185,129,0.05)] h-[220px]`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col items-center space-y-4 flex-1 justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition duration-300 shadow-inner">
                        <ThumbsUp className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition">Да, это моё</h3>
                        <p className="text-xs text-[var(--text-muted)]">Мне нравится заниматься подобными делами, это меня заряжает</p>
                      </div>
                    </div>
                  </button>

                  {/* Карточка 2: НЕ НРАВИТСЯ (1 балл) */}
                  <button
                    type="button"
                    onClick={() => handleChooseAnswer(1)}
                    disabled={store.isLoading || isWaitingForNext}
                    className={`group relative flex flex-col items-center justify-between overflow-hidden rounded-3xl border border-white/10 bg-white/[0.01] p-6 text-center transition-all duration-300 hover:border-rose-500/40 hover:bg-rose-500/[0.02] hover:shadow-[0_8px_30px_rgba(244,63,94,0.05)] h-[220px]`}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 rounded-full blur-[40px] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="flex flex-col items-center space-y-4 flex-1 justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 group-hover:scale-110 group-hover:bg-rose-500 group-hover:text-white transition duration-300 shadow-inner">
                        <ThumbsDown className="h-8 w-8" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition">Нет, не привлекает</h3>
                        <p className="text-xs text-[var(--text-muted)]">Я бы предпочел избежать подобных задач в работе</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* 2. ФОРМАТ: ЛОГИЧЕСКИЙ ВЗЛОМ (для ICAR) */}
              {currentQuestion.test_type === 'icar' && (
                <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] mt-6">
                  {/* Графический экран головоломки */}
                  <div className="relative rounded-3xl border border-white/5 bg-[#040506]/40 p-4 flex flex-col items-center justify-center h-[260px] overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                    {!imgError ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img 
                        src={currentQuestion.visual_asset_url} 
                        alt="Экран шифратора" 
                        className="object-contain w-full h-full opacity-90 rounded-2xl group-hover:scale-102 transition duration-500"
                        onError={() => setImgError(true)}
                      />
                    ) : (
                      <div className="text-slate-500 flex flex-col items-center justify-center gap-3">
                        <ShieldAlert className="h-12 w-12 text-[#EAB308] animate-pulse" />
                        <span className="text-[10px] uppercase tracking-widest font-bold font-sans text-[#EAB308]">Шифр заблокирован</span>
                      </div>
                    )}
                  </div>

                  {/* Клавиатура сейфа */}
                  <div className="rounded-3xl border border-white/5 bg-[#080C14]/60 p-5 flex flex-col justify-between space-y-4">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2.5">
                      <KeyRound className="h-4 w-4 text-[#EAB308]" />
                      <span className="text-[10px] font-bold text-[#EAB308] uppercase tracking-wider">Панель ввода кода</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 flex-1">
                      {currentQuestion.available_answers.map((ans) => {
                        const active = lastSelectedValue === ans.value;
                        return (
                          <button
                            key={ans.value}
                            type="button"
                            onClick={() => handleChooseAnswer(ans.value)}
                            disabled={store.isLoading || isWaitingForNext}
                            className={`flex flex-col items-center justify-center rounded-2xl border text-center transition-all duration-300 h-[60px] ${
                              active
                                ? 'border-[#EAB308] bg-[#EAB308]/15 text-[#EAB308] shadow-[0_0_15px_rgba(234,179,8,0.15)] font-black scale-98'
                                : 'border-white/5 bg-white/[0.01] hover:border-white/20 hover:bg-white/5 text-white/90'
                            }`}
                          >
                            <span className="text-[9px] text-[var(--text-muted)] uppercase tracking-wider font-bold">Вариант</span>
                            <span className="text-sm font-sans font-bold">{ans.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. ФОРМАТ: СИТУАЦИОННЫЕ КЕЙСЫ (для Big Five и Прокрастинации) */}
              {currentQuestion.test_type !== 'riasec' && currentQuestion.test_type !== 'icar' && (
                <div className="grid gap-2 mt-5 max-w-2xl mx-auto">
                  {currentQuestion.available_answers.map((ans) => {
                    const active = lastSelectedValue === ans.value;
                    
                    // Рассчитываем цвет ободка на основе темы
                    const borderActive = `text-white scale-99 border-2`;
                    const borderNormal = 'border-white/5 bg-white/[0.01] hover:bg-white/[0.03] text-white/80';

                    return (
                      <button
                        key={ans.value}
                        type="button"
                        onClick={() => handleChooseAnswer(ans.value)}
                        disabled={store.isLoading || isWaitingForNext}
                        style={active ? { borderColor: currentStyle.accentColor, backgroundColor: `${currentStyle.accentColor}10` } : {}}
                        className={`flex items-center gap-4 rounded-2xl border py-3 px-5 text-left transition duration-200 ${
                          active ? borderActive : borderNormal
                        }`}
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-xs font-bold transition duration-300`}
                          style={active ? { backgroundColor: currentStyle.accentColor, borderColor: currentStyle.accentColor, color: 'white' } : { borderColor: 'rgba(255,255,255,0.1)', color: '#7A8A9E' }}
                        >
                          {ans.value}
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-xs md:text-sm font-bold block">{ans.label}</span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            {ans.value === 5 ? 'Полностью согласен с этим утверждением' : 
                             ans.value === 4 ? 'Скорее согласен' : 
                             ans.value === 3 ? 'Отношусь нейтрально' : 
                             ans.value === 2 ? 'Скорее не согласен' : 'Категорически не согласен'}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Панель навигации */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/5 pt-4 shrink-0">
              <button
                type="button"
                onClick={() => store.goBack()}
                disabled={store.isLoading || currentQuestionNumber <= 1 || isWaitingForNext}
                className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/[0.06] disabled:opacity-40 disabled:pointer-events-none"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
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
