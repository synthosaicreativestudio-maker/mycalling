import crypto from 'crypto';
import { env } from './env';

/**
 * Клиент интернет-эквайринга Т-Банка (бывш. Тинькофф) для СБП-пожертвований.
 *
 * Поток: Init (создать платёж на сумму) → GetQr (получить СБП QR-код) →
 * периодический GetState (узнать статус оплаты). Секрет (пароль терминала)
 * читается только из окружения сервера и НИКОГДА не уходит на клиент.
 *
 * Токен запроса формируется по алгоритму Т-Банка: берём все корневые
 * скалярные параметры запроса, добавляем {Password}, сортируем ключи по
 * алфавиту, конкатенируем значения и берём SHA-256 (UTF-8) в hex.
 * Вложенные объекты/массивы (DATA, Receipt) в токен не входят.
 * Док: https://developer.tbank.ru/eacq/intro/developer/token
 */

const API_BASE = 'https://securepay.tinkoff.ru/v2';

export interface TinkoffConfig {
  terminalKey: string;
  password: string;
}

/** Проверяет, что эквайринг сконфигурирован (заданы ключ терминала и пароль). */
export function getTinkoffConfig(): TinkoffConfig | null {
  const terminalKey = env.TINKOFF_TERMINAL_KEY;
  const password = env.TINKOFF_PASSWORD;
  if (!terminalKey || !password) return null;
  return { terminalKey, password };
}

/** Подпись запроса: SHA-256 от отсортированных по ключам значений + пароль. */
function signToken(params: Record<string, string | number>, password: string): string {
  const withPassword: Record<string, string | number> = { ...params, Password: password };
  const concatenated = Object.keys(withPassword)
    .sort()
    .map((key) => String(withPassword[key]))
    .join('');
  return crypto.createHash('sha256').update(concatenated, 'utf8').digest('hex');
}

/**
 * @param params    тело запроса (без Token)
 * @param password  пароль терминала
 * @param tokenParams  подмножество параметров для подписи. У GetQr в токен
 *   входят ТОЛЬКО TerminalKey + PaymentId (+Password), а DataType — нет, иначе
 *   Т-Банк возвращает 204 «Неверный токен». По умолчанию подписываем всё тело.
 */
async function callTinkoff<T>(
  method: string,
  params: Record<string, string | number>,
  password: string,
  tokenParams?: Record<string, string | number>
): Promise<T> {
  const Token = signToken(tokenParams ?? params, password);
  const res = await fetch(`${API_BASE}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...params, Token }),
    // серверный вызов, без кэша
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Т-Банк ${method}: HTTP ${res.status}`);
  }
  return (await res.json()) as T;
}

interface InitResponse {
  Success: boolean;
  PaymentId?: string | number;
  PaymentURL?: string;
  Status?: string;
  ErrorCode?: string;
  Message?: string;
  Details?: string;
}

interface GetQrResponse {
  Success: boolean;
  Data?: string; // при DataType=IMAGE — base64 SVG; при PAYLOAD — строка-ссылка СБП
  OrderId?: string;
  PaymentId?: string | number;
  ErrorCode?: string;
  Message?: string;
}

interface GetStateResponse {
  Success: boolean;
  Status?: string; // NEW, FORM_SHOWED, AUTHORIZED, CONFIRMED, REJECTED, ...
  PaymentId?: string | number;
  ErrorCode?: string;
  Message?: string;
}

/** Создаёт платёж, возвращает PaymentId и URL платёжной страницы. Amount — в копейках. */
export async function tinkoffInit(
  cfg: TinkoffConfig,
  { amount, orderId, description }: { amount: number; orderId: string; description: string }
): Promise<{ paymentId: string; paymentUrl: string }> {
  const data = await callTinkoff<InitResponse>(
    'Init',
    {
      TerminalKey: cfg.terminalKey,
      Amount: amount,
      OrderId: orderId,
      Description: description,
    },
    cfg.password
  );
  if (!data.Success || !data.PaymentId || !data.PaymentURL) {
    throw new Error(`Т-Банк Init отклонён: ${data.Message || data.ErrorCode || 'неизвестная ошибка'}`);
  }
  return { paymentId: String(data.PaymentId), paymentUrl: data.PaymentURL };
}

/** Возвращает СБП QR-код как data-URI (image/svg+xml). */
export async function tinkoffGetQrImage(cfg: TinkoffConfig, paymentId: string): Promise<string> {
  // Эмпирически подтверждено на боевом терминале: DataType ВХОДИТ в подпись
  // (без него Т-Банк отдаёт 204 «Неверный токен»).
  const data = await callTinkoff<GetQrResponse>(
    'GetQr',
    {
      TerminalKey: cfg.terminalKey,
      PaymentId: paymentId,
      DataType: 'IMAGE',
    },
    cfg.password
  );
  if (!data.Success || !data.Data) {
    throw new Error(
      `Т-Банк GetQr отклонён [${(data as any).ErrorCode || '?'}]: ${data.Message || 'неизвестная ошибка'}${(data as any).Details ? ` — ${(data as any).Details}` : ''}`
    );
  }
  const raw = data.Data.trim();
  // Т-Банк для IMAGE возвращает base64-SVG, но подстрахуемся на случай сырого SVG.
  const isRawSvg = raw.startsWith('<svg') || raw.startsWith('<?xml');
  const base64 = isRawSvg ? Buffer.from(raw, 'utf8').toString('base64') : raw;
  return `data:image/svg+xml;base64,${base64}`;
}

/** Возвращает статус платежа. `paid` = true при AUTHORIZED/CONFIRMED. */
export async function tinkoffGetState(
  cfg: TinkoffConfig,
  paymentId: string
): Promise<{ status: string; paid: boolean; rejected: boolean }> {
  const data = await callTinkoff<GetStateResponse>(
    'GetState',
    {
      TerminalKey: cfg.terminalKey,
      PaymentId: paymentId,
    },
    cfg.password
  );
  const status = data.Status || 'UNKNOWN';
  return {
    status,
    paid: status === 'CONFIRMED' || status === 'AUTHORIZED',
    rejected: status === 'REJECTED' || status === 'CANCELED' || status === 'DEADLINE_EXPIRED',
  };
}
