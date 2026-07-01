import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '../../../lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const botToken = process.env.MAXID_BOT_TOKEN;
  if (!botToken) {
    return NextResponse.json({ error: 'MAXID_BOT_TOKEN is not configured' }, { status: 400 });
  }
  const webhookUrl = `https://synthosai.ru/api/webhooks/maxid`;
  
  try {
    const res = await fetch(`https://platform-api2.max.ru/subscriptions`, {
      method: 'POST',
      headers: {
        'Authorization': botToken,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: webhookUrl,
        update_types: ['message_created', 'bot_started']
      })
    });
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
    const updateType = body.update_type;
    
    // 1. Обработка start / bot_started
    if (updateType === 'bot_started') {
      const userId = body.user?.user_id;
      const name = body.user?.name || '';
      const startParam = body.payload;

      if (userId) {
        if (startParam) {
          const authLink = await prisma.authLink.findUnique({
            where: { code: startParam }
          });
          if (authLink && authLink.status === 'PENDING') {
            await prisma.authLink.update({
              where: { id: authLink.id },
              data: { maxUserId: String(userId) }
            });
          }
        }

        await sendMaxMessage(botToken, userId, 
          `Привет, ${name}! Рад встрече. Я официальный чат-бот MAX ID платформы «МоёПризвание».\n\nПожалуйста, нажмите кнопку ниже, чтобы поделиться контактом. Мы сразу подтвердим ваш профиль MAX ID и вышлем ссылку на Личный кабинет.`,
          [
            [
              {
                type: 'request_contact',
                text: '📱 Поделиться контактом MAX ID'
              }
            ]
          ]
        );
      }
      return NextResponse.json({ ok: true });
    }
    
    // 2. Обработка новых сообщений (message_created)
    if (updateType === 'message_created') {
      const message = body.message;
      const text = message.text;
      const userId = message.sender?.user_id;
      const firstName = message.sender?.name || 'Пользователь';
      
      if (!userId) {
        return NextResponse.json({ ok: true });
      }
      
      // Если пользователь ввел /start
      if (text && text.trim().startsWith('/start')) {
        const parts = text.trim().split(/\s+/);
        const startParam = parts[1];

        if (startParam && userId) {
          const authLink = await prisma.authLink.findUnique({
            where: { code: startParam }
          });
          if (authLink && authLink.status === 'PENDING') {
            await prisma.authLink.update({
              where: { id: authLink.id },
              data: { maxUserId: String(userId) }
            });
          }
        }

        await sendMaxMessage(botToken, userId, 
          `Привет, ${firstName}! Рад встрече. Я официальный чат-бот MAX ID платформы «МоёПризвание».\n\nПожалуйста, нажмите кнопку ниже, чтобы поделиться контактом. Мы сразу подтвердим ваш профиль MAX ID и вышлем ссылку на Личный кабинет.`,
          [
            [
              {
                type: 'request_contact',
                text: '📱 Поделиться контактом MAX ID'
              }
            ]
          ]
        );
        return NextResponse.json({ ok: true });
      }
      
      // Проверяем наличие вложенного контакта
      let phone: string | null = null;
      if (message.attachments) {
        const contactAttachment = message.attachments.find((att: any) => att.type === 'contact');
        if (contactAttachment && contactAttachment.payload?.vcf_info) {
          const vcard = contactAttachment.payload.vcf_info;
          const phoneMatch = vcard.match(/TEL;[^:]*:([^\n\r]+)/i);
          if (phoneMatch) {
            phone = phoneMatch[1].trim();
          }
        }
      }
      
      if (phone) {
        // Нормализуем телефонный номер
        let normalizedPhone = phone.replace(/\D/g, '');
        if (normalizedPhone.startsWith('8') && normalizedPhone.length === 11) {
          normalizedPhone = '7' + normalizedPhone.substring(1);
        }
        if (normalizedPhone.length === 10) {
          normalizedPhone = '7' + normalizedPhone;
        }

        // Проверяем, есть ли активный AuthLink для этого maxUserId
        const authLink = await prisma.authLink.findFirst({
          where: {
            maxUserId: String(userId),
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
            // Обновляем гостевого пользователя данными из MAX ID
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                phone: normalizedPhone,
                maxUserId: String(userId),
                name: user.name === 'Гость' ? (firstName || 'Пользователь MAX ID') : user.name,
                fullName: user.fullName || firstName || 'Пользователь MAX ID'
              }
            });
          }
        }

        // Если пользователя все еще нет, ищем по телефону или maxUserId
        if (!user) {
          user = await prisma.user.findFirst({
            where: {
              OR: [
                { phone: normalizedPhone },
                { phone: '+' + normalizedPhone },
                { maxUserId: String(userId) }
              ]
            }
          });
        }
        
        if (!user) {
          // Создаем нового пользователя
          const tempEmail = `max_${userId}@moiprizvanie.ru`;
          user = await prisma.user.create({
            data: {
              name: firstName || 'Пользователь MAX ID',
              fullName: firstName || 'Пользователь MAX ID',
              email: tempEmail,
              phone: normalizedPhone,
              maxUserId: String(userId),
              role: 'STUDENT'
            }
          });
        } else {
          // Обновляем существующего
          if (user.maxUserId !== String(userId) || user.phone !== normalizedPhone) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { 
                maxUserId: String(userId),
                phone: normalizedPhone
              }
            });
          }
        }
        
        // Создаем Account для авторизации (providerId: 'maxid')
        let account = await prisma.account.findFirst({
          where: { providerId: 'maxid', accountId: String(userId) }
        });
        if (!account) {
          await prisma.account.create({
            data: {
              providerId: 'maxid',
              accountId: String(userId),
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

          await sendMaxMessage(botToken, userId, 
            `🎉 Вход выполнен!\n\nИмя: ${user.name}\nТелефон: ${user.phone}\n\nВы успешно вошли на компьютере. Можете вернуться к окну браузера!`,
            [
              [
                {
                  type: 'link',
                  text: '🔑 Войти на этом устройстве (мобильном)',
                  url: loginUrl
                }
              ]
            ]
          );
        } else {
          await sendMaxMessage(botToken, userId, 
            `🎉 Ваш профиль MAX ID успешно подтвержден!\n\nИмя: ${user.name}\nТелефон: ${user.phone}\n\nНажмите кнопку ниже для быстрого входа в Личный кабинет на сайте:`,
            [
              [
                {
                  type: 'link',
                  text: '🔑 Войти в Личный кабинет',
                  url: loginUrl
                }
              ]
            ]
          );
        }
      }
    }
    
    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error('Error in MAXID Webhook:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

async function sendMaxMessage(botToken: string, userId: number, text: string, buttons?: any[][]) {
  try {
    const body: any = {
      text: text,
      format: 'html'
    };
    
    if (buttons) {
      body.attachments = [
        {
          type: 'inline_keyboard',
          payload: {
            buttons: buttons
          }
        }
      ];
    }
    
    await fetch(`https://platform-api2.max.ru/messages?user_id=${userId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': botToken
      },
      body: JSON.stringify(body)
    });
  } catch (err) {
    console.error('Error sending message via MAX Bot API:', err);
  }
}
