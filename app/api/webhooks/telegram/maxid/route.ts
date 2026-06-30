import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../../lib/prisma';

export const dynamic = 'force-dynamic';

const TG_API_BASE = (process.env.TELEGRAM_API_BASE_URL || 'https://api.telegram.org').replace(/\/$/, '');

export async function GET(request: Request) {
  const botToken = process.env.MAXID_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'MAXID_BOT_TOKEN is not configured' }, { status: 400 });
  }
  const webhookUrl = `https://synthosai.ru/api/webhooks/telegram/maxid`;
  
  try {
    const res = await fetch(`${TG_API_BASE}/bot${botToken}/setWebhook?url=${encodeURIComponent(webhookUrl)}`);
    const data = await res.json();
    return NextResponse.json({ webhook_setup: data });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const botToken = process.env.MAXID_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'MAXID_BOT_TOKEN is not configured' }, { status: 400 });
  }

  try {
    const body = await req.json();
    
    if (body.message) {
      const chat_id = body.message.chat.id;
      const text = body.message.text;
      const contact = body.message.contact;
      
      // 1. Команда /start
      if (text && text.startsWith('/start')) {
        await sendTelegramMessage(botToken, chat_id, 
          'Привет! Рад встрече. Я официальный чат-бот MAX ID платформы «МоёПризвание».\n\nПожалуйста, нажмите кнопку ниже, чтобы поделиться контактом. Мы сразу подтвердим ваш профиль MAX ID и вышлем ссылку на Личный кабинет.',
          {
            keyboard: [
              [{ text: '📱 Поделиться контактом MAX ID', request_contact: true }]
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
        const tgUserId = contact.user_id;
        const firstName = contact.first_name;
        
        // Нормализуем телефонный номер
        let normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
          normalizedPhone = '7' + normalizedPhone.substring(1);
        }
        if (normalizedPhone.length === 10) {
          normalizedPhone = '7' + normalizedPhone;
        }
        
        // Ищем пользователя
        let user = await prisma.user.findFirst({
          where: {
            OR: [
              { phone: normalizedPhone },
              { phone: '+' + normalizedPhone },
              { maxUserId: String(tgUserId) }
            ]
          }
        });
        
        if (!user) {
          // Создаем нового пользователя
          const tempEmail = `max_${tgUserId}@moiprizvanie.ru`;
          user = await prisma.user.create({
            data: {
              name: firstName || 'Пользователь MAX ID',
              fullName: firstName || 'Пользователь MAX ID',
              email: tempEmail,
              phone: normalizedPhone,
              maxUserId: String(tgUserId),
              role: 'STUDENT'
            }
          });
        } else {
          // Обновляем существующего
          user = await prisma.user.update({
            where: { id: user.id },
            data: { maxUserId: String(tgUserId) }
          });
        }
        
        // Создаем Account для авторизации (providerId: 'maxid')
        let account = await prisma.account.findFirst({
          where: { providerId: 'maxid', accountId: String(tgUserId) }
        });
        if (!account) {
          await prisma.account.create({
            data: {
              providerId: 'maxid',
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
        
        await sendTelegramMessage(botToken, chat_id, 
          `🎉 Ваш профиль MAX ID успешно подтвержден!\n\nИмя: ${user.name}\nТелефон: ${user.phone}\n\nНажмите кнопку ниже для быстрого входа в Личный кабинет на сайте:`,
          {
            inline_keyboard: [
              [{ text: '🔑 Войти в Личный кабинет', url: loginUrl }]
            ]
          }
        );
        return NextResponse.json({ ok: true });
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in MAXID Telegram Webhook:', err);
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
    console.error('Error sending Telegram message from MAXID bot:', err);
  }
}
