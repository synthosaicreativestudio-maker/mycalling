import { NextResponse } from 'next/server';
import { getTinkoffConfig, tinkoffInit } from '../../../../lib/tinkoff';

export const dynamic = 'force-dynamic';

const MIN_RUB = 10;
const MAX_RUB = 100000;

/**
 * Создаёт пожертвование через СБП Т-Банка и возвращает QR-код для оплаты.
 * Body: { amount: число в рублях }. Секрет терминала не покидает сервер.
 */
export async function POST(request: Request) {
  try {
    const cfg = getTinkoffConfig();
    if (!cfg) {
      return NextResponse.json(
        { error: 'Приём пожертвований временно недоступен. Загляните позже 🙏' },
        { status: 503 }
      );
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const rub = Math.floor(Number(body?.amount));
    if (!Number.isFinite(rub) || rub < MIN_RUB || rub > MAX_RUB) {
      return NextResponse.json(
        { error: `Сумма должна быть от ${MIN_RUB} до ${MAX_RUB} ₽.` },
        { status: 400 }
      );
    }

    const amountKopecks = rub * 100;
    const orderId = `donate-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const description = `Пожертвование на развитие проекта «МоёПризвание» — ${rub} ₽`;

    const { paymentId, paymentUrl } = await tinkoffInit(cfg, {
      amount: amountKopecks,
      orderId,
      description,
    });

    // Возвращаем URL платёжной страницы Т-Банка: клиент показывает её как
    // QR-код (сканирование телефоном) и как кнопку-переход. На самой странице
    // Т-Банка доступна оплата картой и через СБП.
    return NextResponse.json({ paymentId, paymentUrl, amount: rub });
  } catch (err: any) {
    console.error('[donate/init] error:', err?.message || err);
    return NextResponse.json(
      { error: 'Не удалось создать платёж. Попробуйте ещё раз.' },
      { status: 502 }
    );
  }
}
