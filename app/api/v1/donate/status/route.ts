import { NextResponse } from 'next/server';
import { getTinkoffConfig, tinkoffGetState } from '../../../../lib/tinkoff';

export const dynamic = 'force-dynamic';

/**
 * Возвращает статус пожертвования по PaymentId (для опроса из модалки).
 * Body: { paymentId: string }.
 */
export async function POST(request: Request) {
  try {
    const cfg = getTinkoffConfig();
    if (!cfg) {
      return NextResponse.json({ error: 'Приём пожертвований недоступен.' }, { status: 503 });
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      body = {};
    }

    const paymentId = typeof body?.paymentId === 'string' ? body.paymentId : String(body?.paymentId || '');
    if (!paymentId) {
      return NextResponse.json({ error: 'Не указан paymentId.' }, { status: 400 });
    }

    const state = await tinkoffGetState(cfg, paymentId);
    return NextResponse.json(state);
  } catch (err: any) {
    console.error('[donate/status] error:', err?.message || err);
    return NextResponse.json({ error: 'Не удалось получить статус.' }, { status: 502 });
  }
}
