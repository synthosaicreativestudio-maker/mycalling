import 'server-only';
// Модуль интеграции с ИИ через Freemodel.dev API с сохранением сигнатур Gemini хелперов.
import https from 'https';
import { env } from './env';

const FREEMODEL_API_KEYS = env.PROXYAPI_KEYS;
const FREEMODEL_URL = "/v1/chat/completions";

// Ключ ProxyAPI обновлён 19.07.2026 (INC-005) — новый ключ не даёт доступа к
// Claude Sonnet 4, только к линейке GPT-5.x. Временно переключено на gpt-5.5
// по решению пользователя; вернуть Claude, если появится ключ с доступом к нему.
const DEFAULT_MODEL = "gpt-5.5";

interface Message {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

/**
 * Выполняет запрос к Freemodel API с использованием стабильного модуля https.
 */
async function callFreemodelRaw(requestBody: any, apiKey: string, timeoutMs = 20000): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);

    const options = {
      hostname: 'api.freemodel.dev',
      port: 443,
      path: FREEMODEL_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Length': Buffer.byteLength(postData)
      },
      timeout: timeoutMs // Динамический таймаут
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(body));
          } catch (e: any) {
            reject(new Error(`Failed to parse JSON response: ${e.message}`));
          }
        } else {
          reject(new Error(`Freemodel API error [${res.statusCode}]: ${body}`));
        }
      });
    });

    req.on('error', (e) => {
      reject(e);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timed out'));
    });

    req.write(postData);
    req.end();
  });
}

/**
 * Обёртка с перебором ключей + retry/backoff. INC-005 (19.07.2026): провайдер
 * отдавал то 500 "container instances exceeded", то 401 на один и тот же
 * ключ подряд — единичный retry на одном ключе не спасал. Теперь при сбое
 * пробуем каждый доступный ключ (PROXYAPI_KEY → _FALLBACK → _FALLBACK2) по
 * очереди, и только если ВСЕ ключи не сработали — кидаем ошибку выше
 * (откуда вызывающий код уходит в канned-фоллбэк текста).
 */
async function callFreemodelWithRetry(requestBody: any, timeoutMs = 20000, retriesPerKey = 1): Promise<any> {
  let lastError: any;
  for (let keyIndex = 0; keyIndex < FREEMODEL_API_KEYS.length; keyIndex++) {
    const apiKey = FREEMODEL_API_KEYS[keyIndex];
    for (let attempt = 0; attempt <= retriesPerKey; attempt++) {
      try {
        return await callFreemodelRaw(requestBody, apiKey, timeoutMs);
      } catch (err: any) {
        lastError = err;
        const isLastAttemptForKey = attempt === retriesPerKey;
        const isLastKey = keyIndex === FREEMODEL_API_KEYS.length - 1;
        if (isLastAttemptForKey && isLastKey) {
          console.error(`[gemini] All keys and retries exhausted for Freemodel API request:`, err.message);
          throw err;
        }
        if (isLastAttemptForKey) {
          console.warn(`[gemini] Key #${keyIndex + 1}/${FREEMODEL_API_KEYS.length} exhausted (${err.message}), switching to next key...`);
        } else {
          const backoffMs = 1000 * Math.pow(2, attempt);
          console.warn(`[gemini] Freemodel API call failed (key #${keyIndex + 1}, attempt ${attempt + 1}/${retriesPerKey + 1}). Retrying in ${backoffMs}ms... Error:`, err.message);
          await new Promise((resolve) => setTimeout(resolve, backoffMs));
        }
      }
    }
  }
  throw lastError;
}

/**
 * Генерирует текстовый ответ в режиме чата.
 */
export async function generateText(systemPrompt: string, history: Message[], temperature = 0.7): Promise<string> {
  const messages: any[] = [];
  
  // Добавляем системный промпт
  if (systemPrompt) {
    messages.push({
      role: 'system',
      content: systemPrompt
    });
  }

  // Конвертируем историю диалога под формат OpenAI
  for (const msg of history) {
    const role = msg.role === 'model' || msg.role === 'assistant' ? 'assistant' : 'user';
    messages.push({
      role,
      content: msg.content
    });
  }

  const requestBody = {
    model: DEFAULT_MODEL,
    messages,
    temperature,
    max_tokens: 1024
  };

  const responseData = await callFreemodelWithRetry(requestBody);
  const text = responseData.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error("Empty response from Freemodel API");
  }
  
  return text.trim();
}

/**
 * Вспомогательная функция для очистки строки от markdown-оберток JSON-кода.
 */
function cleanJsonString(str: string): string {
  let clean = str.trim();
  if (clean.startsWith('```')) {
    // Удаляем ```json или ``` в начале и ``` в конце
    clean = clean.replace(/^```(?:json)?\n?/i, '').replace(/\n?```$/, '').trim();
  }
  return clean;
}

/**
 * Генерирует строго типизированный JSON.
 */
export async function generateJson(systemPrompt: string, prompt: string, schema: any, temperature = 0.1, model: string = DEFAULT_MODEL, timeoutMs = 25000, retriesPerKey = 1): Promise<any> {
  // Инъекция самой JSON-схемы в системный промпт: без неё модель не видит ожидаемую
  // структуру полей и склонна возвращать пусто/копировать примеры (из-за чего колесо
  // талантов и экстракция шага «молчали»). Восстановлено из фикса 10f454b.
  const schemaStr = schema ? `\n\nОжидаемая JSON-схема:\n${JSON.stringify(schema)}` : "";
  const messages = [
    {
      role: 'system',
      content: systemPrompt + "\nВы должны ответить СТРОГО в формате JSON. Не пишите никаких других текстов, кроме валидного JSON-объекта." + schemaStr
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  const requestBody = {
    model: model || DEFAULT_MODEL,
    messages,
    response_format: { type: "json_object" },
    temperature,
    max_tokens: 2048
  };

  const responseData = await callFreemodelWithRetry(requestBody, timeoutMs, retriesPerKey);
  const text = responseData.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error("Empty response from Freemodel API during JSON generation");
  }

  const cleanedText = cleanJsonString(text);
  try {
    return JSON.parse(cleanedText);
  } catch (err: any) {
    console.error('[auth] Failed to parse JSON response. Raw response was:', text);
    throw new Error(`JSON parsing failed: ${err.message}. Raw text: ${text}`);
  }
}
