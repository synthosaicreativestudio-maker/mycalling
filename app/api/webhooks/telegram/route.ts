import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';
import { modulesConfig } from '../../../config/modules';
import { migrateGuestToUser } from '../../../lib/auth/migrate-guest';

const TG_API_BASE = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');

export async function GET(request: Request) {
  if (!modulesConfig.enableTelegram) {
    return NextResponse.json({ error: 'Telegram module is disabled' }, { status: 503 });
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 400 });
  }
  const webhookUrl = `https://synthosai.ru/api/webhooks/telegram`;
  const secretToken = process.env.TELEGRAM_WEBHOOK_SECRET || '';
  
  try {
    const params = new URLSearchParams({ url: webhookUrl });
    if (secretToken) params.set('secret_token', secretToken);
    const res = await fetch(`${TG_API_BASE}/bot${botToken}/setWebhook?${params.toString()}`);
    const data = await res.json();
    return NextResponse.json({ webhook_setup: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    // Верификация подлинности запроса от Telegram
    const webhookSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
    if (webhookSecret) {
      const receivedToken = req.headers.get('X-Telegram-Bot-Api-Secret-Token');
      if (receivedToken !== webhookSecret) {
        console.warn('[telegram] Webhook rejected: invalid secret_token');
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!modulesConfig.enableTelegram) {
      return NextResponse.json({ status: 'ignored', reason: 'Telegram module is disabled' }, { status: 200 });
    }

    const body = await req.json();
    
    if (body.message) {
      const chat_id = body.message.chat.id;
      const text = body.message.text;
      const contact = body.message.contact;
      const tgUserId = body.message.from?.id;
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 400 });
      }
      
      // 1. Команда /start
      if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        const startParam = parts[1];

        // Сохраняем startParam (код привязки) в AuthLink, если он передан
        if (startParam) {
          const authLink = await prisma.authLink.findUnique({
            where: { code: startParam }
          });
          if (authLink && authLink.status === 'PENDING') {
            await prisma.authLink.update({
              where: { id: authLink.id },
              data: { telegramId: String(tgUserId) }
            });
            // Сбрасываем кнопку меню чата на дефолтную (не используем WebApp)
            await resetTelegramMenuButton(botToken, chat_id);
          }
        }

        // ═══════════════════════════════════════════════════════════════
        // ПРОВЕРКА: Пользователь уже зарегистрирован?
        // Ищем в БД существующего пользователя с таким telegramId
        // ═══════════════════════════════════════════════════════════════
        const existingUser = await prisma.user.findFirst({
          where: { telegramId: String(tgUserId) }
        });

        if (existingUser && existingUser.phone) {
          // Пользователь уже зарегистрирован и у него есть телефон.
          // Проверяем, есть ли активная привязка (из коуч-сессии на сайте).
          const pendingAuthLink = startParam
            ? await prisma.authLink.findFirst({
                where: { code: startParam, status: 'PENDING' }
              })
            : null;

          if (pendingAuthLink) {
            // Есть активная привязка — значит пользователь пришел с сайта.
            // Мгновенно завершаем привязку без повторного запроса контакта.
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await prisma.session.create({
              data: {
                token: sessionToken,
                userId: existingUser.id,
                expiresAt: expiresAt
              }
            });

            await prisma.authLink.update({
              where: { id: pendingAuthLink.id },
              data: {
                status: 'COMPLETED',
                userId: existingUser.id,
                sessionToken: sessionToken
              }
            });

            const loginUrl = `https://synthosai.ru/api/auth/telegram/callback?token=${sessionToken}`;

            await sendTelegramMessage(botToken, chat_id, 
              `👋 С возвращением, ${existingUser.name || existingUser.fullName || 'друг'}!\n\nВы уже подключены к платформе «МоёПризвание». Ваш профиль привязан — можете вернуться к браузеру, всё готово!\n\nИли нажмите кнопку ниже, чтобы войти прямо с телефона:`,
              {
                inline_keyboard: [
                  [{ text: '🌐 Перейти на платформу', url: loginUrl }]
                ]
              }
            );
          } else {
            // Нет активной привязки — пользователь просто зашел в бота повторно.
            // Генерируем свежий токен для входа и предлагаем перейти на платформу.
            const sessionToken = crypto.randomBytes(32).toString('hex');
            const expiresAt = new Date();
            expiresAt.setDate(expiresAt.getDate() + 7);

            await prisma.session.create({
              data: {
                token: sessionToken,
                userId: existingUser.id,
                expiresAt: expiresAt
              }
            });

            const loginUrl = `https://synthosai.ru/api/auth/telegram/callback?token=${sessionToken}`;

            await sendTelegramMessage(botToken, chat_id,
              `👋 С возвращением, ${existingUser.name || existingUser.fullName || 'друг'}!\n\nВы уже подключены к платформе «МоёПризвание». Нажмите кнопку ниже, чтобы перейти в Личный кабинет:`,
              {
                inline_keyboard: [
                  [{ text: '🌐 Перейти на платформу', url: loginUrl }]
                ]
              }
            );
          }

          return NextResponse.json({ ok: true });
        }

        // ═══════════════════════════════════════════════════════════════
        // НОВЫЙ ПОЛЬЗОВАТЕЛЬ — запрос контакта
        // Используем ReplyKeyboardMarkup с input_field_placeholder
        // для максимальной заметности кнопки
        // ═══════════════════════════════════════════════════════════════
        const replyKeyboard = {
          keyboard: [
            [{ text: '📱 Поделиться контактом', request_contact: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: false,
          is_persistent: true
        };

        await sendTelegramMessage(botToken, chat_id, 
          '👋 Привет! Я — официальный бот платформы «МоёПризвание».\n\nЧтобы войти и привязать ваш профиль, нажмите кнопку 👇 «📱 Поделиться контактом» на клавиатуре внизу.\n\nИли **просто напишите ваш номер телефона сообщением в ответ** (например: 89991234567). Это абсолютно безопасно.\n\n🌐 Наш сайт: https://synthosai.ru/',
          replyKeyboard
        );
        return NextResponse.json({ ok: true });
      }
      
      // 2. Обработка полученного контакта
      if (contact) {
        const phone = contact.phone_number;
        const tgContactUserId = body.message.from?.id || contact.user_id;
        const firstName = contact.first_name;
        
        // Нормализуем телефонный номер
        let normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
          normalizedPhone = '7' + normalizedPhone.substring(1);
        }
        if (normalizedPhone.length === 10) {
          normalizedPhone = '7' + normalizedPhone;
        }

        console.log('[auth] Telegram webhook received contact:', { phone: normalizedPhone, tgContactUserId, firstName });

        // Проверяем, есть ли активная привязка (AuthLink) для этого telegramId
        const authLink = await prisma.authLink.findFirst({
          where: {
            telegramId: String(tgContactUserId),
            status: 'PENDING'
          },
          orderBy: { createdAt: 'desc' }
        });

        console.log('[auth] Found AuthLink in webhook:', { exists: !!authLink, code: authLink?.code, userId: authLink?.userId });

        let user = null;

        // Если в привязке уже есть userId (гостевой профиль из коуч-сессии)
        if (authLink && authLink.userId) {
          user = await prisma.user.findUnique({
            where: { id: authLink.userId }
          });
          if (user) {
            // Обновляем гостевого пользователя данными из Telegram
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                phone: normalizedPhone,
                telegramId: String(tgContactUserId),
                name: user.name === 'Гость' ? (firstName || 'Ученик') : user.name,
                fullName: user.fullName || firstName || 'Ученик'
              }
            });
          }
        }

        // Если пользователя все еще нет, ищем по телефону или telegramId
        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: normalizedPhone },
                { phone: '+' + normalizedPhone },
                { telegramId: String(tgContactUserId) }
              ]
            }
          });
        }
        
        if (!user) {
          // Создаем нового пользователя
          const tempEmail = `tg_${tgContactUserId}@moiprizvanie.ru`;
          user = await prisma.user.create({
            data: {
              name: firstName || 'Ученик',
              fullName: firstName || 'Ученик',
              email: tempEmail,
              phone: normalizedPhone,
              telegramId: String(tgContactUserId),
              role: 'STUDENT'
            }
          });
          console.log('[auth] Telegram webhook created new user:', { userId: user.id, phone: normalizedPhone });
        } else {
          // Обновляем существующего
          if (user.telegramId !== String(tgContactUserId) || user.phone !== normalizedPhone) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { 
                telegramId: String(tgContactUserId),
                phone: normalizedPhone
              }
            });
            console.log('[auth] Telegram webhook updated existing user:', { userId: user.id, phone: normalizedPhone });
          } else {
            console.log('[auth] Telegram webhook user already up to date:', { userId: user.id });
          }
        }
        
        // Создаем Account для авторизации
        let account = await prisma.account.findFirst({
          where: { providerId: 'telegram', accountId: String(tgContactUserId) }
        });
        if (!account) {
          await prisma.account.create({
            data: {
              providerId: 'telegram',
              accountId: String(tgContactUserId),
              userId: user.id
            }
          });
        }
        
        // Генерируем токен сессии Better Auth (для десктопного поллинга)
        const sessionToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        
        await prisma.session.create({
          data: {
            token: sessionToken,
            userId: user.id,
            expiresAt: expiresAt
          }
        });

        const loginUrl = `https://synthosai.ru/api/auth/telegram/callback?token=${sessionToken}`;

        // Убираем ReplyKeyboard и отправляем подтверждение с inline-кнопкой
        // Шаг 1: Убираем клавиатуру
        await sendTelegramMessage(botToken, chat_id,
          `✅ Контакт получен! Подключаю ваш профиль...`,
          { remove_keyboard: true }
        );

        if (authLink) {
          // Переносим коуч-сессию и результаты тестов с гостевого аккаунта на реальный аккаунт пользователя
          if (authLink.userId && authLink.userId !== user.id) {
            try {
              // 1. Получаем гостевого пользователя
              const guestUser = await prisma.user.findUnique({
                where: { id: authLink.userId }
              });

              // 2. Копируем ответы на тесты
              if (guestUser?.diagnosticAnswers) {
                await prisma.user.update({
                  where: { id: user.id },
                  data: {
                    diagnosticAnswers: guestUser.diagnosticAnswers
                  }
                });
              }

              // 3. Переносим коуч-сессию
              await prisma.coachSession.deleteMany({
                where: { userId: user.id }
              });
              await prisma.coachSession.updateMany({
                where: { userId: authLink.userId },
                data: { userId: user.id }
              });

              // 4. Переносим результаты тестов
              await prisma.diagnosticResult.updateMany({
                where: { userId: authLink.userId },
                data: { userId: user.id }
              });

              // 5. Переносим цифровой профиль (удаляем старый, чтобы избежать Unique Constraint ошибок)
              await prisma.digitalProfile.deleteMany({
                where: { userId: user.id }
              });
              await prisma.digitalProfile.updateMany({
                where: { userId: authLink.userId },
                data: { userId: user.id }
              });

              // 6. Переносим отчет
              await prisma.report.deleteMany({
                where: { userId: user.id }
              });
              await prisma.report.updateMany({
                where: { userId: authLink.userId },
                data: { userId: user.id }
              });

              // 7. Помечаем гостевого пользователя как объединенного (soft merge)
              await prisma.user.update({
                where: { id: authLink.userId },
                data: { mergedInto: user.id }
              });
            } catch (e) {
              console.error('Error migrating guest session in Telegram webhook:', e);
            }
          }

          console.log('[auth] Telegram webhook updating AuthLink status to COMPLETED:', {
            authLinkId: authLink.id,
            code: authLink.code,
            userId: user.id,
            sessionToken: sessionToken ? '***' : null
          });

          await prisma.authLink.update({
            where: { id: authLink.id },
            data: {
              status: 'COMPLETED',
              userId: user.id,
              sessionToken: sessionToken
            }
          });

          // Сначала удаляем клавиатуру с кнопкой "Поделиться контактом"
          await sendTelegramMessage(botToken, chat_id, 'Вход выполнен!', { remove_keyboard: true });

          // Шаг 2: Подтверждение с inline-кнопкой
          await sendTelegramMessage(botToken, chat_id, 
            `🎉 Профиль успешно подключен!\n\nИмя: ${user.name}\nТелефон: +${normalizedPhone}\n\nВы вошли на компьютере — можете вернуться к браузеру! Или нажмите кнопку ниже, чтобы войти с мобильного:`,
            {
              inline_keyboard: [
                [{ text: '🌐 Перейти на платформу', url: loginUrl }]
              ]
            }
          );
        } else {
          // Удаляем клавиатуру
          await sendTelegramMessage(botToken, chat_id, 'Вход выполнен!', { remove_keyboard: true });

          await sendTelegramMessage(botToken, chat_id, 
            `🎉 Профиль успешно подключен!\n\nИмя: ${user.name}\nТелефон: +${normalizedPhone}\n\nНажмите кнопку ниже, чтобы перейти на платформу:`,
            {
              inline_keyboard: [
                [{ text: '🌐 Перейти на платформу', url: loginUrl }]
              ]
            }
          );
        }
        // Сбрасываем кнопку меню WebApp обратно в дефолтный вид
        await resetTelegramMenuButton(botToken, chat_id);
        return NextResponse.json({ ok: true });
      }
      // 3. Обработка телефона, присланного обычным текстовым сообщением
      if (text && !text.startsWith('/start')) {
        const digits = text.replace(/\D/g, '');
        if (digits.length === 10 || digits.length === 11) {
          let normalizedPhone = digits;
          if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
            normalizedPhone = '7' + normalizedPhone.substring(1);
          }
          if (normalizedPhone.length === 10) {
            normalizedPhone = '7' + normalizedPhone;
          }

          console.log('[auth] Telegram webhook received phone via text:', { phone: normalizedPhone, tgUserId });

          // Ищем последнюю активную привязку PENDING для этого telegramId
          const authLink = await prisma.authLink.findFirst({
            where: {
              telegramId: String(tgUserId),
              status: 'PENDING'
            },
            orderBy: { createdAt: 'desc' }
          });

          let user = null;

          if (authLink && authLink.userId) {
            user = await prisma.user.findUnique({ where: { id: authLink.userId } });
            if (user) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: {
                  phone: normalizedPhone,
                  telegramId: String(tgUserId),
                  name: user.name === 'Гость' ? (body.message.from?.first_name || 'Ученик') : user.name,
                  fullName: user.fullName || body.message.from?.first_name || 'Ученик'
                }
              });
            }
          }

          if (!user) {
            user = await prisma.user.findFirst({
              where: {
                OR: [
                  { phone: normalizedPhone },
                  { phone: '+' + normalizedPhone },
                  { telegramId: String(tgUserId) }
                ]
              }
            });
          }

          if (!user) {
            const tempEmail = `tg_${tgUserId}@moiprizvanie.ru`;
            user = await prisma.user.create({
              data: {
                name: body.message.from?.first_name || 'Ученик',
                fullName: body.message.from?.first_name || 'Ученик',
                email: tempEmail,
                phone: normalizedPhone,
                telegramId: String(tgUserId),
                role: 'STUDENT'
              }
            });
          } else {
            if (user.telegramId !== String(tgUserId) || user.phone !== normalizedPhone) {
              user = await prisma.user.update({
                where: { id: user.id },
                data: { 
                  telegramId: String(tgUserId),
                  phone: normalizedPhone
                }
              });
            }
          }

          let account = await prisma.account.findFirst({
            where: { providerId: 'telegram', accountId: String(tgUserId) }
          });
          if (!account) {
            await prisma.account.create({
              data: {
                providerId: 'telegram',
                accountId: String(tgUserId),
                userId: user.id
              }
            });
          }

          const sessionToken = crypto.randomBytes(32).toString('hex');
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 7);

          await prisma.session.create({
            data: {
              token: sessionToken,
              userId: user.id,
              expiresAt: expiresAt
            }
          });

          const loginUrl = `https://synthosai.ru/api/auth/telegram/callback?token=${sessionToken}`;

          await sendTelegramMessage(botToken, chat_id,
            `✅ Контакт получен! Подключаю ваш профиль...`,
            { remove_keyboard: true }
          );

          if (authLink) {
            if (authLink.userId && authLink.userId !== user.id) {
              await migrateGuestToUser(authLink.userId, user.id);
            }

            await prisma.authLink.update({
              where: { id: authLink.id },
              data: {
                status: 'COMPLETED',
                userId: user.id,
                sessionToken: sessionToken
              }
            });

            // Сначала удаляем клавиатуру с кнопкой "Поделиться контактом"
            await sendTelegramMessage(botToken, chat_id, 'Вход выполнен!', { remove_keyboard: true });

            await sendTelegramMessage(botToken, chat_id, 
              `🎉 Профиль успешно подключен!\n\nИмя: ${user.name}\nТелефон: +${normalizedPhone}\n\nВы вошли на компьютере — можете вернуться к браузеру! Или нажмите кнопку ниже, чтобы войти с мобильного:`,
              {
                inline_keyboard: [
                  [{ text: '🌐 Перейти на платформу', url: loginUrl }]
                ]
              }
            );
          } else {
            // Удаляем клавиатуру
            await sendTelegramMessage(botToken, chat_id, 'Вход выполнен!', { remove_keyboard: true });

            await sendTelegramMessage(botToken, chat_id, 
              `🎉 Профиль успешно подключен!\n\nИмя: ${user.name}\nТелефон: +${normalizedPhone}\n\nНажмите кнопку ниже, чтобы перейти на платформу:`,
              {
                inline_keyboard: [
                  [{ text: '🌐 Перейти на платформу', url: loginUrl }]
                ]
              }
            );
          }
          // Сбрасываем кнопку меню WebApp обратно в дефолтный вид
          await resetTelegramMenuButton(botToken, chat_id);
          return NextResponse.json({ ok: true });
        }
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in Telegram Webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function sendTelegramMessage(botToken: string, chatId: number, text: string, replyMarkup?: any) {
  try {
    await fetch(`${TG_API_BASE}/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        reply_markup: replyMarkup
      })
    });
  } catch (err) {
    console.error('Error sending Telegram message:', err);
  }
}

async function setTelegramMenuButton(botToken: string, chatId: number, code: string) {
  try {
    await fetch(`${TG_API_BASE}/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: {
          type: 'web_app',
          text: '📱 Войти в профиль',
          web_app: {
            url: `https://synthosai.ru/auth/telegram-webapp?code=${code}`
          }
        }
      })
    });
    console.log('[auth] Successfully set Telegram Menu Button for chat:', chatId);
  } catch (err) {
    console.error('Error setting Telegram Menu Button:', err);
  }
}

async function resetTelegramMenuButton(botToken: string, chatId: number) {
  try {
    await fetch(`${TG_API_BASE}/bot${botToken}/setChatMenuButton`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        menu_button: {
          type: 'default'
        }
      })
    });
    console.log('[auth] Successfully reset Telegram Menu Button to default for chat:', chatId);
  } catch (err) {
    console.error('Error resetting Telegram Menu Button:', err);
  }
}
