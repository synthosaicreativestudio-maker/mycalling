import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

const TG_API_BASE = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');

export async function GET(request: Request) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 400 });
  }
  const webhookUrl = `https://synthosai.ru/api/webhooks/telegram`;
  
  try {
    const res = await fetch(`${TG_API_BASE}/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return NextResponse.json({ webhook_setup: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    if (body.message) {
      const chat_id = body.message.chat.id;
      const text = body.message.text;
      const contact = body.message.contact;
      
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      if (!botToken) {
        return NextResponse.json({ error: 'TELEGRAM_BOT_TOKEN is not configured' }, { status: 400 });
      }
      
      // 1. Команда /start
      if (text && text.startsWith('/start')) {
        const parts = text.split(' ');
        const startParam = parts[1];

        if (startParam) {
          const authLink = await prisma.authLink.findUnique({
            where: { code: startParam }
          });
          if (authLink && authLink.status === 'PENDING') {
            await prisma.authLink.update({
              where: { id: authLink.id },
              data: { telegramId: String(body.message.from.id) }
            });
          }
        }

        await sendTelegramMessage(botToken, chat_id, 
          'Привет! Рад встрече. Я официальный чат-бот платформы «МоёПризвание».\n\nПожалуйста, нажмите кнопку ниже, чтобы поделиться контактом. Мы сразу подтвердим ваш профиль и вышлем ссылку на Личный кабинет.',
          {
            keyboard: [
              [{ text: '📱 Поделиться контактом', request_contact: true }]
            ],
            one_time_keyboard: true,
            resize_keyboard: true
          }
        );
        return NextResponse.json({ ok: true });
      }
      
      // 2. Обработка полученного контакта
      if (contact) {
        const phone = contact.phone_number;
        const tgUserId = body.message.from?.id || contact.user_id;
        const firstName = contact.first_name;
        
        // Нормализуем телефонный номер
        let normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
          normalizedPhone = '7' + normalizedPhone.substring(1);
        }
        if (normalizedPhone.length === 10) {
          normalizedPhone = '7' + normalizedPhone;
        }

        // Проверяем, есть ли активная привязка (AuthLink) для этого telegramId
        const authLink = await prisma.authLink.findFirst({
          where: {
            telegramId: String(tgUserId),
            status: 'PENDING'
          },
          orderBy: { createdAt: 'desc' }
        });

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
                telegramId: String(tgUserId),
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
                { telegramId: String(tgUserId) }
              ]
            }
          });
        }
        
        if (!user) {
          // Создаем нового пользователя
          const tempEmail = `tg_${tgUserId}@moiprizvanie.ru`;
          user = await prisma.user.create({
            data: {
              name: firstName || 'Ученик',
              fullName: firstName || 'Ученик',
              email: tempEmail,
              phone: normalizedPhone,
              telegramId: String(tgUserId),
              role: 'STUDENT'
            }
          });
        } else {
          // Обновляем существующего
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
        
        // Создаем Account для авторизации
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
        
        // Генерируем токен сессии Better Auth
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

        if (authLink) {
          await prisma.authLink.update({
            where: { id: authLink.id },
            data: {
              status: 'COMPLETED',
              userId: user.id,
              sessionToken: sessionToken
            }
          });

          await sendTelegramMessage(botToken, chat_id, 
            `🎉 Вход выполнен!\n\nИмя: ${user.name}\nТелефон: ${user.phone}\n\nВы успешно вошли на компьютере. Можете вернуться к окну браузера!`,
            {
              inline_keyboard: [
                [{ text: '🔑 Войти на этом устройстве (мобильном)', url: loginUrl }]
              ]
            }
          );
        } else {
          await sendTelegramMessage(botToken, chat_id, 
            `🎉 Ваш профиль успешно подтвержден!\n\nИмя: ${user.name}\nТелефон: ${user.phone}\n\nНажмите кнопку ниже для быстрого входа в Личный кабинет на сайте:`,
            {
              inline_keyboard: [
                [{ text: '🔑 Войти в Личный кабинет', url: loginUrl }]
              ]
            }
          );
        }
        return NextResponse.json({ ok: true });
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
