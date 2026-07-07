// Модуль интеграции с Google Gemini API напрямую с автоматической ротацией API-ключей.

const GEMINI_KEYS = [
  "AIzaSyD5wKvNG4vpE2TLOuiSaLpmfaghnzV4oeI",
  "AIzaSyCcB06Nwk3Iyj_sZ6AkNUj9SP-yhf5j8iY",
  "AIzaSyAsTzlS-veI0QNRo_cVAhny3xtHXjbcwLA"
];

// Используем модель gemini-1.5-flash для идеального соотношения скорости, надежности и умных Structured Outputs
const GEMINI_MODEL = "gemini-1.5-flash";

interface Message {
  role: 'user' | 'assistant' | 'model';
  content: string;
}

/**
 * Выполняет запрос к Gemini API с ротацией ключей при ошибках.
 */
async function callGeminiRaw(requestBody: any): Promise<any> {
  let lastError = null;
  
  for (let i = 0; i < GEMINI_KEYS.length; i++) {
    const key = GEMINI_KEYS[i];
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        // Устанавливаем разумный таймаут
        signal: AbortSignal.timeout(15000)
      });

      if (response.ok) {
        return await response.json();
      } else {
        const errorText = await response.text();
        console.warn(`Gemini API key [${i}] failed with status ${response.status}: ${errorText.substring(0, 200)}`);
        lastError = new Error(`Gemini API error [${response.status}]: ${errorText}`);
        
        // Если это превышение лимитов (429) или ошибка сервера (5xx), пробуем следующий ключ
        if (response.status === 429 || response.status >= 500) {
          continue;
        } else {
          // Для других ошибок (например, неверный JSON-запрос) сразу выходим, чтобы не тратить время
          throw lastError;
        }
      }
    } catch (err: any) {
      console.warn(`Gemini API connection error with key [${i}]:`, err.message || err);
      lastError = err;
    }
  }
  
  throw lastError || new Error("All Gemini API keys exhausted and failed");
}

/**
 * Генерирует текстовый ответ в режиме чата.
 */
export async function generateText(systemPrompt: string, history: Message[], temperature = 0.7): Promise<string> {
  // Нормализуем историю для формата Gemini:
  // 1. Заменяем роль 'assistant' на 'model'
  // 2. Убираем идущие подряд одинаковые роли
  const contents: any[] = [];
  
  for (const msg of history) {
    const role = msg.role === 'user' ? 'user' : 'model';
    
    if (contents.length > 0 && contents[contents.length - 1].role === role) {
      contents[contents.length - 1].parts[0].text += "\n" + msg.content;
    } else {
      contents.push({
        role,
        parts: [{ text: msg.content }]
      });
    }
  }

  // Если история пуста, добавляем хотя бы одно пустое сообщение от пользователя
  if (contents.length === 0) {
    contents.push({
      role: 'user',
      parts: [{ text: 'Привет' }]
    });
  }

  const requestBody = {
    contents,
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      temperature,
      maxOutputTokens: 1024
    }
  };

  const responseData = await callGeminiRaw(requestBody);
  const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error("Empty response from Gemini API");
  }
  
  return text.trim();
}

/**
 * Генерирует строго типизированный JSON по OpenAPI-схеме.
 */
export async function generateJson(systemPrompt: string, prompt: string, schema: any, temperature = 0.1): Promise<any> {
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: prompt }]
      }
    ],
    systemInstruction: {
      parts: [{ text: systemPrompt }]
    },
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
      temperature
    }
  };

  const responseData = await callGeminiRaw(requestBody);
  const text = responseData.candidates?.[0]?.content?.parts?.[0]?.text;
  
  if (!text) {
    throw new Error("Empty response from Gemini API during JSON generation");
  }

  return JSON.parse(text.trim());
}
