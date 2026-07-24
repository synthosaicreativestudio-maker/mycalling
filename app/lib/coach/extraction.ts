/**
 * Резервная экстракция данных с помощью регулярных выражений при сбоях ИИ
 */
export function fallbackExtract(
  message: string, 
  currentStep: number, 
  hasName: boolean, 
  hasAge: boolean, 
  hasGrade: boolean, 
  hasCity: boolean
): Record<string, any> {
  const result: Record<string, any> = { shouldAdvanceStep: true };
  const cleanMsg = message.trim();
  
  if (currentStep === 1) {
    // 1. Извлечение имени
    if (!hasName) {
      const nameMatch = cleanMsg.match(/(?:меня зовут|я|зовут|это)\s+([А-ЯЁа-яёA-Za-z]+)/i);
      if (nameMatch && nameMatch[1]) {
        result.fullName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
      } else if (cleanMsg.length > 1 && cleanMsg.length < 20 && !/\d/.test(cleanMsg)) {
        const words = cleanMsg.split(/\s+/);
        if (words.length <= 2) {
          const firstWord = words[0].replace(/[^А-ЯЁа-яёA-Za-z]/g, "");
          if (firstWord.length > 1) {
            result.fullName = firstWord.charAt(0).toUpperCase() + firstWord.slice(1).toLowerCase();
          }
        }
      }
    }
  } else if (currentStep === 2) {
    // 2. Извлечение возраста
    if (!hasAge) {
      const ageMatch = cleanMsg.match(/(\d+)\s*(?:лет|года|год)/i) || cleanMsg.match(/(?:мне|я)\s+(\d+)/i) || cleanMsg.match(/\b(1[0-9])\b/);
      if (ageMatch) {
        result.age = parseInt(ageMatch[1]);
      }
    }

    // 3. Извлечение класса / работы
    if (!hasGrade) {
      const gradeMatch = cleanMsg.match(/(\d+)\s*(?:класс|классе)/i) || cleanMsg.match(/\b([1-9]|1[0-1])\b/);
      if (gradeMatch) {
        result.grade = gradeMatch[1] + " класс";
      } else {
        const lowerMsg = cleanMsg.toLowerCase();
        if (lowerMsg.includes("работаю") || lowerMsg.includes("работа") || lowerMsg.includes("офис")) {
          result.grade = "Работаю";
        } else if (lowerMsg.includes("закончил") || lowerMsg.includes("окончил") || lowerMsg.includes("выпустился")) {
          result.grade = "Закончил школу";
        } else if (lowerMsg.includes("вуз") || lowerMsg.includes("учусь в") || lowerMsg.includes("институт") || lowerMsg.includes("университет") || lowerMsg.includes("колледж")) {
          result.grade = "Студент";
        }
      }
    }

    // 4. Извлечение города
    if (!hasCity) {
      const cityMatch = cleanMsg.match(/(?:из|город|живу в)\s+([А-ЯЁа-яёA-Za-z\-]+)/i);
      if (cityMatch && cityMatch[1]) {
        result.city = cityMatch[1].charAt(0).toUpperCase() + cityMatch[1].slice(1).toLowerCase();
      } else if (cleanMsg.length > 2 && cleanMsg.length < 25 && !/\d/.test(cleanMsg)) {
        const words = cleanMsg.split(/\s+/);
        if (words.length <= 2) {
          const lastWord = words[words.length - 1].replace(/[^А-ЯЁа-яёA-Za-z\-]/g, "");
          if (lastWord.length > 2) {
            result.city = lastWord.charAt(0).toUpperCase() + lastWord.slice(1).toLowerCase();
          }
        }
      }
    }
  } else if (currentStep >= 3 && currentStep <= 15) {
    // 5. Резервная экстракция для психологических шагов (3–15):
    // Если ИИ-экстрактор сбоил (exception/пустой ответ), записываем сырой текст
    // пользователя в первое незаполненное психологическое поле, чтобы шаг не зависал
    // и вопрос не повторялся (баг задвоения на шаге 3). Восстановлено из 51c9548.
    if (cleanMsg.length > 10) {
      result._rawPsychologyFallback = cleanMsg;
      result.shouldAdvanceStep = true;
    }
  }

  return result;
}
