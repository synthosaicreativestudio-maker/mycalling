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
        // Сохраняем startParam в AuthLink
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

        // ═══════════════════════════════════════════════════════════════
        // ПРОВЕРКА: Пользователь уже зарегистрирован?
        // ═══════════════════════════════════════════════════════════════
        const existingUser = await prisma.user.findFirst({
          where: { maxUserId: String(userId) }
        });

        if (existingUser && existingUser.phone) {
          // Пользователь уже зарегистрирован.
          const pendingAuthLink = startParam
            ? await prisma.authLink.findFirst({
                where: { code: startParam, status: 'PENDING' }
              })
            : null;

          if (pendingAuthLink) {
            // Мгновенно завершаем привязку без повторного запроса контакта
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

            await sendMaxMessage(botToken, userId, 
              `👋 С возвращением, ${existingUser.name || existingUser.fullName || name || 'друг'}!\n\nВы уже подключены к платформе «МоёПризвание». Ваш профиль привязан — можете вернуться к браузеру, всё готово!\n\nИли нажмите кнопку ниже, чтобы войти прямо с телефона:`,
              [
                [
                  {
                    type: 'link',
                    text: '🌐 Перейти на платформу',
                    url: loginUrl
                  }
                ]
              ]
            );
          } else {
            // Просто повторный /start без активной привязки
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

            await sendMaxMessage(botToken, userId,
              `👋 С возвращением, ${existingUser.name || existingUser.fullName || name || 'друг'}!\n\nВы уже подключены к платформе «МоёПризвание». Нажмите кнопку ниже, чтобы перейти в Личный кабинет:`,
              [
                [
                  {
                    type: 'link',
                    text: '🌐 Перейти на платформу',
                    url: loginUrl
                  }
                ]
              ]
            );
          }

          return NextResponse.json({ ok: true });
        }

        // ═══════════════════════════════════════════════════════════════
        // НОВЫЙ ПОЛЬЗОВАТЕЛЬ — запрос контакта
        // ═══════════════════════════════════════════════════════════════
        await sendMaxMessage(botToken, userId, 
          `👋 Привет${name ? ', ' + name : ''}! Я — официальный бот MAX ID платформы «МоёПризвание».\n\nЧтобы подключить ваш профиль, нажмите кнопку 👇 «📱 Поделиться контактом» ниже.\n\nЭто безопасно — мы сохраним только ваш номер телефона для привязки результатов.`,
          [
            [
              {
                type: 'request_contact',
                text: '📱 Поделиться контактом'
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

        // Проверяем: пользователь уже зарегистрирован?
        const existingUser = await prisma.user.findFirst({
          where: { maxUserId: String(userId) }
        });

        if (existingUser && existingUser.phone) {
          const pendingAuthLink = startParam
            ? await prisma.authLink.findFirst({
                where: { code: startParam, status: 'PENDING' }
              })
            : null;

          if (pendingAuthLink) {
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

            await sendMaxMessage(botToken, userId,
              `👋 С возвращением, ${existingUser.name || 'друг'}!\n\nВаш профиль привязан — вернитесь к браузеру, всё готово! Или нажмите кнопку ниже:`,
              [
                [{ type: 'link', text: '🌐 Перейти на платформу', url: loginUrl }]
              ]
            );
          } else {
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

            await sendMaxMessage(botToken, userId,
              `👋 С возвращением, ${existingUser.name || 'друг'}!\n\nВы уже подключены к платформе. Нажмите кнопку ниже, чтобы перейти в Личный кабинет:`,
              [
                [{ type: 'link', text: '🌐 Перейти на платформу', url: loginUrl }]
              ]
            );
          }

          return NextResponse.json({ ok: true });
        }

        // Новый пользователь — запрос контакта
        await sendMaxMessage(botToken, userId, 
          `👋 Привет, ${firstName}! Я — официальный бот MAX ID платформы «МоёПризвание».\n\nЧтобы подключить ваш профиль, нажмите кнопку 👇 «📱 Поделиться контактом» ниже.\n\nЭто безопасно — мы сохраним только ваш номер телефона для привязки результатов.`,
          [
            [
              {
                type: 'request_contact',
                text: '📱 Поделиться контактом'
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
          // Переносим коуч-сессию с гостевого аккаунта на реальный аккаунт пользователя
          if (authLink.userId && authLink.userId !== user.id) {
            try {
              // 1. Удаляем старую коуч-сессию реального пользователя, если она существует
              await prisma.coachSession.deleteMany({
                where: { userId: user.id }
              });

              // 2. Переносим текущую гостевую сессию на реального пользователя
              await prisma.coachSession.updateMany({
                where: { userId: authLink.userId },
                data: { userId: user.id }
              });

              // 3. Удаляем гостевого пользователя из БД для очистки
              await prisma.user.delete({
                where: { id: authLink.userId }
              });
            } catch (e) {
              console.error('Error migrating guest session in MAX webhook:', e);
            }
          }

          await prisma.authLink.update({
            where: { id: authLink.id },
            data: {
              status: 'COMPLETED',
              userId: user.id,
              sessionToken: sessionToken
            }
          });

          await sendMaxMessage(botToken, userId, 
            `🎉 Профиль успешно подключен!\n\nИмя: ${user.name}\nТелефон: +${normalizedPhone}\n\nВы вошли на компьютере — можете вернуться к браузеру! Или нажмите кнопку ниже:`,
            [
              [
                {
                  type: 'link',
                  text: '🌐 Перейти на платформу',
                  url: loginUrl
                }
              ]
            ]
          );
        } else {
          await sendMaxMessage(botToken, userId, 
            `🎉 Профиль успешно подключен!\n\nИмя: ${user.name}\nТелефон: +${normalizedPhone}\n\nНажмите кнопку ниже, чтобы перейти на платформу:`,
            [
              [
                {
                  type: 'link',
                  text: '🌐 Перейти на платформу',
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
