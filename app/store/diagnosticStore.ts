import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AnswerPayload {
  questionId: string;
  selectedValue: number;
  timeSpentMs: number;
}

export interface QuestionData {
  question_id: string;
  test_type: string;
  progress_percent: number;
  question_text: string;
  visual_asset_url: string;
  ui_layout_type: string;
  available_answers: Array<{ label: string; value: number }>;
}

interface DiagnosticState {
  sessionId: string | null;
  userId: string | null;
  studentName: string;
  studentGrade: string;
  currentQuestion: QuestionData | null;
  isCompleted: boolean;
  isLoading: boolean;
  isOffline: boolean;
  lockdownTimeLeft: number; // в секундах
  offlineAnswersBuffer: AnswerPayload[];
  answersHistory: Record<string, number>; // Локальная копия для навигации Назад

  startSession: (username: string, grade: string) => Promise<void>;
  fetchNextQuestion: () => Promise<void>;
  submitAnswer: (selectedValue: number, timeSpentMs: number) => Promise<void>;
  syncOfflineAnswers: () => Promise<void>;
  setLockdown: (seconds: number) => void;
  goBack: () => void;
  resetSession: () => void;
}

export const useDiagnosticStore = create<DiagnosticState>()(
  persist(
    (set, get) => {
      // Фоновый таймер разблокировки фрод-локдауна
      let lockdownInterval: NodeJS.Timeout | null = null;

      const runLockdownTimer = () => {
        if (lockdownInterval) clearInterval(lockdownInterval);
        lockdownInterval = setInterval(() => {
          const { lockdownTimeLeft } = get();
          if (lockdownTimeLeft <= 1) {
            set({ lockdownTimeLeft: 0 });
            if (lockdownInterval) clearInterval(lockdownInterval);
          } else {
            set({ lockdownTimeLeft: lockdownTimeLeft - 1 });
          }
        }, 1000);
      };

      return {
        sessionId: null,
        userId: null,
        studentName: '',
        studentGrade: '8',
        currentQuestion: null,
        isCompleted: false,
        isLoading: false,
        isOffline: false,
        lockdownTimeLeft: 0,
        offlineAnswersBuffer: [],
        answersHistory: {},

        startSession: async (username, grade) => {
          set({ isLoading: true, studentName: username, studentGrade: grade, isCompleted: false, answersHistory: {} });
          try {
            const res = await fetch('/api/v1/diagnostic/register-session', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ username, grade }),
            });
            if (!res.ok) throw new Error('Ошибка регистрации сессии');
            const data = await res.json();
            
            set({
              sessionId: data.data.session_id,
              userId: data.data.user_id,
              isOffline: false,
            });

            // Analytics: test_start
            if (typeof window !== 'undefined' && (window as any).dataLayer) {
              (window as any).dataLayer.push({
                event: 'test_start',
                session_id: data.data.session_id,
                grade: grade
              });
            }
            
            await get().fetchNextQuestion();
          } catch (e) {
            console.error('Ошибка старта сессии:', e);
            // Если оффлайн при старте — мы не можем создать сессию без бэкенда, показываем ошибку
            set({ isLoading: false });
            throw e;
          }
        },

        fetchNextQuestion: async () => {
          const { sessionId } = get();
          if (!sessionId) return;

          set({ isLoading: true });
          try {
            const res = await fetch(`/api/v1/diagnostic/next-question?session_id=${sessionId}`);
            if (!res.ok) throw new Error('Ошибка получения вопроса');
            const data = await res.json();

            if (data.data.completed) {
              set({ isCompleted: true, currentQuestion: null, isLoading: false });

              // Analytics: test_completed
              if (typeof window !== 'undefined' && (window as any).dataLayer) {
                (window as any).dataLayer.push({
                  event: 'test_completed',
                  session_id: sessionId
                });
              }
            } else {
              set({
                currentQuestion: data.data,
                isLoading: false,
                isOffline: false,
              });
            }
          } catch (e) {
            console.error('Ошибка загрузки вопроса:', e);
            set({ isOffline: true, isLoading: false });
          }
        },

        submitAnswer: async (selectedValue, timeSpentMs) => {
          const { sessionId, currentQuestion, isOffline, offlineAnswersBuffer, answersHistory } = get();
          if (!sessionId || !currentQuestion) return;

          const questionId = currentQuestion.question_id;

          // Сохраняем в локальную историю ответов для кнопки Назад
          set({
            answersHistory: {
              ...answersHistory,
              [questionId]: selectedValue,
            }
          });

          const answerPayload: AnswerPayload = {
            questionId,
            selectedValue,
            timeSpentMs,
          };

          if (isOffline) {
            // Если мы уже оффлайн — кладем в буфер и ждем
            set({
              offlineAnswersBuffer: [...offlineAnswersBuffer, answerPayload],
            });
            return;
          }

          set({ isLoading: true });
          try {
            const res = await fetch('/api/v1/diagnostic/submit-answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                session_id: sessionId,
                question_id: questionId,
                selected_value: selectedValue,
                time_spent_ms: timeSpentMs,
              }),
            });

            if (res.status === 422) {
              // Превышена скорость кликов (FRAUD_SPEED_LIMIT)
              const errData = await res.json();
              get().setLockdown(errData.lockdown_duration_seconds || 10);
              set({ isLoading: false });
              return;
            }

            if (!res.ok) throw new Error('Не удалось отправить ответ');

            // Запрашиваем следующий вопрос
            await get().fetchNextQuestion();
          } catch (err) {
            console.warn('Обнаружен обрыв сети во время отправки ответа, переходим в автономный режим:', err);
            // Сохраняем в оффлайн-буфер
            set({
              isOffline: true,
              offlineAnswersBuffer: [...offlineAnswersBuffer, answerPayload],
              isLoading: false,
            });

            // Запускаем фоновую синхронизацию
            get().syncOfflineAnswers();
          }
        },

        syncOfflineAnswers: async () => {
          const { sessionId, offlineAnswersBuffer, isOffline } = get();
          if (!sessionId || offlineAnswersBuffer.length === 0) return;

          // Попытка фоновой синхронизации
          const runSync = async () => {
            const buffer = [...get().offlineAnswersBuffer];
            if (buffer.length === 0) return;

            try {
              // Синхронизируем первый ответ из буфера
              const nextAns = buffer[0];
              const res = await fetch('/api/v1/diagnostic/submit-answer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  session_id: sessionId,
                  question_id: nextAns.questionId,
                  selected_value: nextAns.selectedValue,
                  time_spent_ms: nextAns.timeSpentMs,
                }),
              });

              if (res.status === 422) {
                const errData = await res.json();
                get().setLockdown(errData.lockdown_duration_seconds || 10);
                return;
              }

              if (res.ok) {
                // Удаляем успешный ответ из буфера
                set((state) => ({
                  offlineAnswersBuffer: state.offlineAnswersBuffer.slice(1),
                }));

                // Если буфер пуст — отключаем оффлайн-режим и грузим следующий вопрос
                if (get().offlineAnswersBuffer.length === 0) {
                  set({ isOffline: false });
                  await get().fetchNextQuestion();
                } else {
                  // Иначе рекурсивно продолжаем отправку
                  await runSync();
                }
              }
            } catch (e) {
              console.warn('Фоновая синхронизация не удалась, сервер все еще недоступен.');
            }
          };

          // Запускаем периодический опрос сети
          const interval = setInterval(async () => {
            if (get().offlineAnswersBuffer.length === 0) {
              clearInterval(interval);
              return;
            }
            await runSync();
          }, 3000);
        },

        setLockdown: (seconds) => {
          set({ lockdownTimeLeft: seconds });
          runLockdownTimer();
        },

        goBack: async () => {
          const { sessionId, isOffline } = get();
          if (!sessionId) return;

          if (isOffline) {
            // Если оффлайн, просто убираем последний ответ из оффлайн-буфера
            const { offlineAnswersBuffer } = get();
            if (offlineAnswersBuffer.length > 0) {
              set({
                offlineAnswersBuffer: offlineAnswersBuffer.slice(0, -1),
              });
              // Обновляем текущий вопрос локально из истории
              // Но в оффлайне мы не можем загрузить предыдущий вопрос с бэкенда, 
              // если он не был предварительно сохранен в кэше.
            }
            return;
          }

          set({ isLoading: true });
          try {
            const res = await fetch('/api/v1/diagnostic/delete-last-answer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ session_id: sessionId }),
            });
            if (!res.ok) throw new Error('Не удалось удалить последний ответ');
            
            // Загружаем предыдущий вопрос
            await get().fetchNextQuestion();
          } catch (e) {
            console.error('Ошибка перехода назад:', e);
            set({ isLoading: false });
          }
        },

        resetSession: () => {
          set({
            sessionId: null,
            userId: null,
            currentQuestion: null,
            isCompleted: false,
            isOffline: false,
            lockdownTimeLeft: 0,
            offlineAnswersBuffer: [],
            answersHistory: {},
          });
        }
      };
    },
    {
      name: 'moe-prizvanie-diagnostic-session',
      partialize: (state) => ({
        sessionId: state.sessionId,
        studentName: state.studentName,
        studentGrade: state.studentGrade,
        offlineAnswersBuffer: state.offlineAnswersBuffer,
        answersHistory: state.answersHistory,
      }),
    }
  )
);
