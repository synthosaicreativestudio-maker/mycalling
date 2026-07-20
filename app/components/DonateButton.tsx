'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Heart, X, Loader2, CheckCircle2, ShieldCheck, ExternalLink } from 'lucide-react';

const PRESETS = [100, 300, 500, 1000];

type Phase = 'amount' | 'loading' | 'qr' | 'success' | 'error';

/**
 * Кнопка «Пожертвовать на развитие проекта» + модалка с оплатой по СБП QR-коду
 * через Т-Банк. Проект бесплатный для школьников/родителей/школ — это
 * добровольная поддержка, ничего не гейтит. Секрет терминала живёт на сервере;
 * клиент лишь запрашивает QR (/api/v1/donate/init) и опрашивает статус
 * (/api/v1/donate/status).
 */
export default function DonateButton() {
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<Phase>('amount');
  const [amount, setAmount] = useState<number>(300);
  const [custom, setCustom] = useState('');
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const effectiveAmount = custom.trim() ? Math.floor(Number(custom)) : amount;

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setPhase('amount');
    setPaymentUrl(null);
    setPaymentId(null);
    setError(null);
    setCustom('');
    setAmount(300);
  }, [stopPolling]);

  const close = useCallback(() => {
    setOpen(false);
    reset();
  }, [reset]);

  // Закрытие по Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, close]);

  useEffect(() => () => stopPolling(), [stopPolling]);

  const startDonation = useCallback(async () => {
    if (!Number.isFinite(effectiveAmount) || effectiveAmount < 10) {
      setError('Минимальная сумма — 10 ₽.');
      return;
    }
    setError(null);
    setPhase('loading');
    try {
      const res = await fetch('/api/v1/donate/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: effectiveAmount }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Не удалось создать платёж.');

      setPaymentUrl(data.paymentUrl);
      setPaymentId(data.paymentId);
      setPhase('qr');

      // Опрос статуса: первый раз через 5 с, затем каждые 4 с.
      const poll = async () => {
        try {
          const sres = await fetch('/api/v1/donate/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paymentId: data.paymentId }),
          });
          const sdata = await sres.json();
          if (sdata?.paid) {
            stopPolling();
            setPhase('success');
          } else if (sdata?.rejected) {
            stopPolling();
            setError('Платёж отклонён. Попробуйте другую сумму или банк.');
            setPhase('error');
          }
        } catch {
          /* сеть моргнула — продолжаем опрос */
        }
      };
      setTimeout(() => {
        poll();
        pollRef.current = setInterval(poll, 4000);
      }, 5000);
    } catch (e: any) {
      setError(e?.message || 'Что-то пошло не так.');
      setPhase('error');
    }
  }, [effectiveAmount, stopPolling]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="donate-cta group inline-flex h-[62px] items-center justify-center gap-2 rounded-full px-7 text-base font-semibold sm:text-lg"
      >
        <Heart className="h-5 w-5 transition-transform group-hover:scale-110" />
        Поддержать проект
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Пожертвование на развитие проекта"
        >
          {/* Затемнение */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm motion-safe:animate-[fadeIn_.2s_ease]"
            onClick={close}
          />

          {/* Карточка */}
          <div className="donate-modal relative z-10 w-full max-w-[420px] rounded-[28px] p-7 motion-safe:animate-[fadeIn_.25s_ease]">
            <button
              type="button"
              onClick={close}
              aria-label="Закрыть"
              className="absolute right-4 top-4 rounded-full p-1.5 text-[var(--text-muted)] transition hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Заголовок */}
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[var(--accent-wash-10)] text-[var(--accent-brown)]">
                <Heart className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">На развитие проекта</h3>
                <p className="text-xs text-[var(--text-muted)]">Для школьников и родителей — всегда бесплатно</p>
              </div>
            </div>

            {(phase === 'amount' || phase === 'loading') && (
              <>
                <p className="mb-4 text-sm leading-relaxed text-[var(--text-muted)]">
                  «МоёПризвание» живёт на добровольные пожертвования. Любая сумма помогает
                  развивать сервис и держать его бесплатным.
                </p>

                <div className="mb-3 grid grid-cols-4 gap-2">
                  {PRESETS.map((p) => {
                    const active = !custom.trim() && amount === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setAmount(p);
                          setCustom('');
                          setError(null);
                        }}
                        className={`rounded-xl border py-2.5 text-sm font-bold transition ${
                          active
                            ? 'border-[var(--accent-brown)] bg-[var(--accent-wash-20)] text-[var(--accent-brown)]'
                            : 'border-white/10 text-[var(--text-muted)] hover:border-white/25 hover:text-white'
                        }`}
                      >
                        {p} ₽
                      </button>
                    );
                  })}
                </div>

                <div className="mb-4">
                  <input
                    type="number"
                    inputMode="numeric"
                    min={10}
                    placeholder="Другая сумма, ₽"
                    value={custom}
                    onChange={(e) => {
                      setCustom(e.target.value);
                      setError(null);
                    }}
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 text-sm text-white placeholder:text-[var(--text-muted)] focus:border-[var(--accent-brown)] focus:outline-none"
                  />
                </div>

                {error && <p className="mb-3 text-xs font-semibold text-rose-400">{error}</p>}

                <button
                  type="button"
                  onClick={startDonation}
                  disabled={phase === 'loading'}
                  className="donate-cta flex h-[54px] w-full items-center justify-center gap-2 rounded-full text-base font-semibold disabled:opacity-70"
                >
                  {phase === 'loading' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Готовим QR…
                    </>
                  ) : (
                    <>
                      <Heart className="h-5 w-5" />
                      Пожертвовать {effectiveAmount > 0 ? `${effectiveAmount} ₽` : ''}
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-[var(--text-muted)]">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Оплата через СБП · Т-Банк · безопасно
                </div>
              </>
            )}

            {phase === 'qr' && paymentUrl && (
              <div className="flex flex-col items-center text-center">
                <p className="mb-4 text-sm text-[var(--text-muted)]">
                  Отсканируйте QR-код камерой телефона или нажмите кнопку ниже, чтобы
                  оплатить <span className="font-bold text-white">{effectiveAmount} ₽</span> картой
                  или через СБП.
                </p>
                <div className="rounded-2xl bg-white p-4">
                  <QRCodeSVG value={paymentUrl} size={196} level="M" marginSize={0} />
                </div>

                <a
                  href={paymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="donate-cta mt-5 flex h-[52px] w-full items-center justify-center gap-2 rounded-full text-base font-semibold"
                >
                  <ExternalLink className="h-5 w-5" />
                  Перейти к оплате
                </a>

                <div className="mt-4 flex items-center gap-2 text-xs text-[var(--text-muted)]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Ждём подтверждение оплаты…
                </div>
                <button
                  type="button"
                  onClick={reset}
                  className="mt-3 text-xs font-semibold text-[var(--accent-brown)] hover:underline"
                >
                  Изменить сумму
                </button>
              </div>
            )}

            {phase === 'success' && (
              <div className="flex flex-col items-center py-4 text-center">
                <CheckCircle2 className="mb-3 h-14 w-14 text-emerald-400" />
                <h4 className="text-lg font-bold text-white">Спасибо за поддержку! 💙</h4>
                <p className="mt-2 text-sm text-[var(--text-muted)]">
                  Ваше пожертвование помогает нам развивать сервис и держать его
                  бесплатным для школьников и родителей.
                </p>
                <button
                  type="button"
                  onClick={close}
                  className="donate-cta mt-6 flex h-[52px] w-full items-center justify-center rounded-full text-base font-semibold"
                >
                  Закрыть
                </button>
              </div>
            )}

            {phase === 'error' && (
              <div className="flex flex-col items-center py-4 text-center">
                <X className="mb-3 h-12 w-12 text-rose-400" />
                <h4 className="text-base font-bold text-white">Не получилось</h4>
                <p className="mt-2 text-sm text-[var(--text-muted)]">{error}</p>
                <button
                  type="button"
                  onClick={reset}
                  className="donate-cta mt-6 flex h-[52px] w-full items-center justify-center rounded-full text-base font-semibold"
                >
                  Попробовать снова
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
