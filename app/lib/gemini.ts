import 'server-only';
// Модуль интеграции с ИИ через Freemodel.dev API с сохранением сигнатур Gemini хелперов.
import https from 'https';
import { env } from './env';

const FREEMODEL_API_KEY = env.PROXYAPI_KEY;
const FREEMODEL_URL = "/v1/chat/completions";

// Используем модель Claude Sonnet по запросу пользователя для идеального коучинга
const DEFAULT_MODEL = "claude-sonnet-4-20250514";

interface Message {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

/**
 * Выполняет запрос к Freemodel API с использованием стабильного модуля https.
 */
async function callFreemodelRaw(requestBody: any, timeoutMs = 20000): Promise<any> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(requestBody);
    
    const options = {
      hostname: 'api.freemodel.dev',
      port: 443,
      path: FREEMODEL_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${FREEMODEL_API_KEY}`,
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
 * Обертка с автоматическими повторными попытками (retry + backoff) при сбоях ИИ API.
 */
async function callFreemodelWithRetry(requestBody: any, timeoutMs = 20000, retries = 2): Promise<any> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await callFreemodelRaw(requestBody, timeoutMs);
    } catch (err: any) {
      if (attempt === retries) {
        console.error(`[gemini] All ${retries + 1} attempts failed for Freemodel API request:`, err.message);
        throw err;
      }
      const backoffMs = 1000 * Math.pow(2, attempt);
      console.warn(`[gemini] Freemodel API call failed (attempt ${attempt + 1}/${retries + 1}). Retrying in ${backoffMs}ms... Error:`, err.message);
      await new Promise((resolve) => setTimeout(resolve, backoffMs));
    }
  }
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
export async function generateJson(systemPrompt: string, prompt: string, schema: any, temperature = 0.1): Promise<any> {
  const messages = [
    {
      role: 'system',
      content: systemPrompt + "\nВы должны ответить СТРОГО в формате JSON. Не пишите никаких других текстов, кроме валидного JSON-объекта."
    },
    {
      role: 'user',
      content: prompt
    }
  ];

  const requestBody = {
    model: DEFAULT_MODEL,
    messages,
    response_format: { type: "json_object" },
    temperature,
    max_tokens: 2048
  };

  const responseData = await callFreemodelWithRetry(requestBody, 25000); // 25 секунд лимит для полной генерации отчета
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
