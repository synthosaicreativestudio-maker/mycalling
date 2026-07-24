import prisma from '../prisma';

/** Функция форматирования текста в HTML для Telegram */
export function formatToTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    .replace(/\*(.*?)\*/g, '<b>$1</b>');
}

export function getSafeField(data: any, key: string): string {
  if (data && data.expressExtracted && typeof data.expressExtracted === 'object') {
    if (data.expressExtracted[key] !== undefined) {
      return data.expressExtracted[key] || '';
    }
  }
  if (data && data.deepExtracted && typeof data.deepExtracted === 'object') {
    if (data.deepExtracted[key] !== undefined) {
      return data.deepExtracted[key] || '';
    }
  }
  return (data && data[key]) || '';
}

/** Отправить карточку лида администратору в Telegram */
export async function sendTelegramNotification(user: any, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) { console.warn('TELEGRAM_BOT_TOKEN not set, skipping admin notification'); return; }
  const chatId = process.env.TELEGRAM_CHAT_ID || '148281488';
  const tgApiBase = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');
  
  const isDeep = data.sessionMode === 'DEEP';
  let rawText = '';
  
  if (isDeep) {
    rawText = `*Глубокий коучинг (Нейрокоуч):*
*Имя:* ${user.name || 'Не указано'}
*Телефон:* ${user.phone || 'Не указано'}
*Роль:* ${user.role || 'STUDENT'}
*Виртуальный шаг:* ${data.currentStep || 0}
 
*Результаты сессии:*
*🎯 Цель (Что хочу):* ${getSafeField(data, 'deepGoal') || 'Не указано'}
*🌟 Результат:* ${getSafeField(data, 'deepOutcome') || 'Не указано'}
*🔥 Эмоции:* ${getSafeField(data, 'deepEmotions') || 'Не указано'}
*👑 Идентичность:* ${getSafeField(data, 'deepIdentity') || 'Не указано'}
*🚀 План & KPI:* ${getSafeField(data, 'deepActions') || 'Не указано'}
*⚡ Первый шаг:* ${getSafeField(data, 'deepFirstStep') || 'Не указано'}
 
*Резюме коуча:* ${data.preliminaryFeedback || 'Еще не сформировано'}`;
  } else {
    rawText = `*Регистрация лида (Нейрокоуч):*
*Имя:* ${user.name || 'Не указано'}
*Телефон:* ${user.phone || 'Не указано'}
*Роль:* ${user.role || 'STUDENT'}
*Виртуальный шаг:* ${data.currentStep || 0}
 
*Ответы:*
*Мечты:* ${getSafeField(data, 'dreams') || 'Не указано'}
*Кумиры:* ${getSafeField(data, 'idols') || 'Не указано'}
*Ценности:* ${getSafeField(data, 'values') || 'Не указано'}
*Барьеры:* ${getSafeField(data, 'fears') || getSafeField(data, 'barriers') || 'Не указано'}
*Резюме коуча:* ${data.preliminaryFeedback || 'Еще не сформировано'}`;
  }

  const text = formatToTelegramHtml(rawText);

  try {
    await fetch(`${tgApiBase}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'HTML'
      })
    });
  } catch (err) {
    console.error('Telegram admin notification error:', err);
  }
}

/** Отправить резюме пользователю лично в Telegram-бот */
export async function sendTelegramReportToUser(user: any, data: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken || !user.telegramId) return;
  const tgApiBase = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');

  const isDeep = data.sessionMode === 'DEEP';
  const feedback = data.preliminaryFeedback || 'Резюме ещё не сформировано';
  let rawText = '';
  
  if (isDeep) {
    rawText = `*Манифест целей от наставника Романа*\n\n` +
      `*🎯 Твоя цель:* ${getSafeField(data, 'deepGoal') || 'Не указано'}\n` +
      `*👑 Твоя идентичность:* ${getSafeField(data, 'deepIdentity') || 'Не указано'}\n` +
      `*⚡ Первый шаг:* ${getSafeField(data, 'deepFirstStep') || 'Не указано'}\n\n` +
      `*Анализ наставника:*\n${feedback}\n\n` +
      `Теперь ты можешь пройти интерактивные тесты для полной профориентации:\nhttps://synthosai.ru/assessment`;
  } else {
    rawText = `*Предварительное резюме от наставника Романа*\n\n${feedback}\n\nТеперь вы можете пройти интерактивные тесты для точной диагностики на сайте:\nhttps://synthosai.ru/assessment`;
  }
  
  const text = formatToTelegramHtml(rawText);

  try {
    await fetch(`${tgApiBase}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: user.telegramId,
        text: text,
        parse_mode: 'HTML',
        reply_markup: {
          inline_keyboard: [
            [{ text: 'Перейти к диагностике', url: 'https://synthosai.ru/assessment' }]
          ]
        }
      })
    });
    console.log(`Telegram report sent to user ${user.telegramId}`);
  } catch (err) {
    console.error('Telegram user report error:', err);
  }
}

/**
 * Отправить уведомление о готовом ИТОГОВОМ отчёте (после завершения тестов) в
 * Telegram/MAX со ссылкой на /report. Вызывается из next-question/route.ts сразу
 * после upsert отчёта в БД — на случай, если этот путь уведомления отсутствовал
 * или не срабатывал (жалоба: «нет отчёта нигде, в т.ч. в тг»).
 */
export async function sendFinalReportNotification(user: any) {
  const text = 'Твой полный отчёт по результатам диагностики готов! 🎉\n\nПосмотреть его можно в личном кабинете на сайте.';

  const telegramBotToken = process.env.TELEGRAM_BOT_TOKEN;
  if (telegramBotToken && user?.telegramId) {
    const tgApiBase = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');
    try {
      await fetch(`${tgApiBase}/bot${telegramBotToken}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: user.telegramId,
          text: formatToTelegramHtml(text),
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [[{ text: 'Открыть отчёт', url: 'https://synthosai.ru/report' }]]
          }
        })
      });
      console.log(`Final report notification sent to Telegram user ${user.telegramId}`);
    } catch (err) {
      console.error('Final report Telegram notification error:', err);
    }
  }

  const maxBotToken = process.env.MAXID_BOT_TOKEN;
  if (maxBotToken && user?.maxUserId) {
    try {
      await fetch(`https://platform-api2.max.ru/messages?user_id=${user.maxUserId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': maxBotToken },
        body: JSON.stringify({
          text: `${text} https://synthosai.ru/report`,
          format: 'html',
          attachments: [{
            type: 'inline_keyboard',
            payload: { buttons: [[{ type: 'link', text: 'Открыть отчёт', url: 'https://synthosai.ru/report' }]] }
          }]
        })
      });
      console.log(`Final report notification sent to MAX user ${user.maxUserId}`);
    } catch (err) {
      console.error('Final report MAX notification error:', err);
    }
  }
}

/** Отправить резюме пользователю лично в бот МАКС */
export async function sendMaxReportToUser(user: any, data: any) {
  const botToken = process.env.MAXID_BOT_TOKEN;
  if (!botToken || !user.maxUserId) return;

  const feedback = data.preliminaryFeedback || 'Резюме ещё не сформировано';
  const text = `Предварительное резюме от наставника Романа\n\n${feedback}\n\nТеперь вы можете пройти интерактивные тесты для точной диагностики на сайте: https://synthosai.ru/assessment`;

  try {
    await fetch(`https://platform-api2.max.ru/messages?user_id=${user.maxUserId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': botToken
      },
      body: JSON.stringify({
        text: text,
        format: 'html',
        attachments: [
          {
            type: 'inline_keyboard',
            payload: {
              buttons: [
                [{ type: 'link', text: 'Перейти к диагностике', url: 'https://synthosai.ru/assessment' }]
              ]
            }
          }
        ]
      })
    });
    console.log(`MAX report sent to user ${user.maxUserId}`);
  } catch (err) {
    console.error('MAX user report error:', err);
  }
}

/** Синхронизировать профиль пользователя с MAX ID CRM */
export async function sendMaxIdSync(user: any, data: any) {
  const maxToken = process.env.MAXID_API_TOKEN;
  if (!maxToken) { console.warn('MAXID_API_TOKEN not set, skipping CRM sync'); return; }
  
  try {
    const res = await fetch('https://api.maxid.ru/v1/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${maxToken}`
      },
      body: JSON.stringify({
        externalId: user.id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        source: 'NeuroCoach Web',
        meta: {
          dreams: getSafeField(data, 'dreams'),
          idols: getSafeField(data, 'idols'),
          values: getSafeField(data, 'values'),
          barriers: getSafeField(data, 'fears') || getSafeField(data, 'barriers'),
          preliminaryFeedback: data.preliminaryFeedback
        }
      })
    });
    console.log(`MAX ID CRM sync status: ${res.status}`);
  } catch (err) {
    console.error('MAX ID CRM sync error:', err);
  }
}
