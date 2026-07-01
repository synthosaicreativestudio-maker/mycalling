# Инструкция по деплою, настройке сервера и базам данных
## Проект: «МоеПризвание» (домен: `synthosai.ru`)

> [!CAUTION]
> **КРИТИЧЕСКИ ВАЖНОЕ ТРЕБОВАНИЕ БЕЗОПАСНОСТИ:**
> На серверах (US `37.1.212.51` и Яндекс ВМ `111.88.145.206`) развернута и активно работает **VPN-инфраструктура**: Xray Core, Caddy, VPN Panel, Telegram-бот управления подписками.
> * **КАТЕГОРИЧЕСКИ ЗАПРЕЩЕНО** изменять, останавливать, перезапускать или удалять системные службы `xray`, `vpn-panel`, `vpn-bot`, `caddy`.
> * **ЗАПРЕЩЕНО** неаккуратно модифицировать глобальные конфигурационные файлы `/etc/xray/config.json`, `/etc/hysteria/` и `Caddyfile`. Любые правки Caddy делать точечно и только в рамках выделенных путей.

---

## 1. Схема развертывания проекта

```
[ Пользователь ] 
       │ (порт 80 / 443 - HTTPS)
       ▼
  [ Nginx ] (Reverse Proxy, SSL-терминация через Let's Encrypt на synthosai.ru)
       │ (проксирование на локальный порт 3000)
       ▼
 [ Next.js App ] (Запущено в Standalone-режиме: server.js)
       ▲
       │ (управление процессом, автозапуск при перезагрузке)
   [ PM2 ]
```

### Доступы к серверам:
1. **Бастион (US Server):**
   * **IP:** `37.1.212.51`
   * **Пользователь:** `root`
   * **Пароль:** `LEJ6U5chSK`
2. **Российский сервер (Relay RU / Целевой сервер):**
   * **IP:** `111.88.145.206`
   * **Пользователь:** `ubuntu`
   * **Авторизация:** по SSH-ключу, лежащему на US-сервере в `root/.ssh/`.

---

## 2. Настройка переменных окружения (`.env`)

На целевом сервере `111.88.145.206` в `/home/ubuntu/mycalling/.env` должны быть прописаны следующие переменные:

```env
# База данных PostgreSQL (через PgBouncer на порт 6543 и напрямую на 5432)
DATABASE_URL="postgresql://postgres.jqpttyyxeoowrouxpgpd:troja89AS%21%21@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.jqpttyyxeoowrouxpgpd:troja89AS%21%21@aws-1-us-east-1.pooler.supabase.com:5432/postgres"

# ИИ провайдер (ProxyAPI)
PROXYAPI_KEY="fe_oa_8241bb58e1c68cff538eb3076ac734b4de235309d7832f5c"
PROXYAPI_URL="https://api.proxyapi.ru/openai/v1/chat/completions"

# Секрет для сессий Better Auth
BETTER_AUTH_SECRET="e9f9b5c3e7b1a2f6c9d0e1b2a3f4c5d6"

# Настройка проксирования Telegram API для обхода блокировок
TELEGRAM_API_BASE_URL="http://37.1.212.51/tg-bot"
TELEGRAM_BOT_TOKEN="8701463375:AAEQxV563Y7P5Anfm0tK1o1CvjmeC2TnEyg"

# Токен чат-бота в мессенджере МАКС (MAX Bot API)
MAXID_BOT_TOKEN="<ВАШ_MAXID_BOT_TOKEN>"

# ID чата администраторов для получения карточек лидов
TELEGRAM_CHAT_ID="148281488"
```

---

## 3. Настройка Caddy на Бастионе (`37.1.212.51`)

Для стабильного проксирования запросов к Telegram API без таймаутов, в файле `/etc/caddy/Caddyfile` на бастионе в блоке `:80` прописаны следующие правила:

```caddy
:80 {
    handle /tg-bot/* {
        uri strip_prefix /tg-bot
        reverse_proxy https://api.telegram.org {
            header_up Host api.telegram.org
        }
    }
    # (остальные конфигурации VPN и панелей не затрагиваются)
}
```

*После редактирования Caddyfile примените конфигурацию:*
```bash
systemctl reload caddy
```

---

## 4. Регистрация и Инициализация вебхуков

Каждый раз при смене домена, токенов ботов или после первоначальной настройки вебхуки необходимо активировать. Это делается путем отправки GET-запроса на бэкенд платформы:

### Инициализация вебхука Telegram:
```bash
curl https://synthosai.ru/api/webhooks/telegram
```
**Успешный ответ:** `{"webhook_setup":{"ok":true,"result":true,"description":"Webhook was set"}}`

### Инициализация вебхука МАКС:
```bash
curl https://synthosai.ru/api/webhooks/maxid
```
**Успешный ответ:** `{"webhook_setup":{"success":true}}`

---

## 5. Траблшутинг баз данных (Prisma db push)

### Проблема А: Ошибка добавления обязательного поля с существующими записями
Если при выполнении `npx prisma db push` возникает ошибка:
`Added the required column email to the users table without a default value. There are X rows in this table, it is not possible to execute this step.`

**Решение:**
Так как база данных стейджинга используется только для тестов, можно очистить таблицу `users` перед выполнением миграции:
```bash
PGPASSWORD=safe_calling_pass_2026 psql -U ubuntu -d mycalling -c "DELETE FROM users CASCADE;"
```
После очистки таблицы запустите синхронизацию схемы заново:
```bash
npx prisma db push --accept-data-loss
```

### Проблема Б: Ошибка "The column created_at does not exist in the current database" на Vercel
Эта ошибка возникает, когда схема Prisma на стейджинг-сервере (использующем локальный Postgres на `localhost:5432`) синхронизирована, но база данных Supabase, используемая Vercel на продакшене `synthosai.ru`, осталась старой версии.

**Решение:**
Необходимо применить схему Prisma непосредственно к облачной базе данных Supabase. Сделать это можно с локального компьютера разработчика, в `.env` которого прописаны доступы к Supabase (`aws-1-us-east-1.pooler.supabase.com`):
```bash
# Выполнить синхронизацию схемы напрямую с Supabase (через DIRECT_URL / порт 5432)
npx prisma db push --accept-data-loss
```
После успешного завершения команды облачная база данных получит все недостающие таблицы и колонки (включая `created_at` и `updated_at` в `coach_sessions`), и ошибки 500 на Vercel исчезнут.

---

## 6. Полезные команды для администрирования на сервере

Эти команды выполняются **после входа на российский сервер (`111.88.145.206`)**:

* **Мониторинг запущенных процессов (проверка работы сайта):**
  ```bash
  pm2 status
  ```
* **Просмотр логов в реальном времени (ошибки сборки, запросы):**
  ```bash
  pm2 logs mycalling
  ```
* **Перезапуск приложения вручную:**
  ```bash
  pm2 restart mycalling
  ```
* **Просмотр логов веб-сервера Nginx:**
  ```bash
  sudo tail -f /var/log/nginx/error.log
  ```

---

## 7. Процедура полного деплоя (одна команда)

Для деплоя изменений с локальной машины на стейджинг-сервер используется следующая SSH-цепочка:

```bash
# Шаг 1: Коммит и push
git add -A && git commit -m "описание изменений" && git push origin main

# Шаг 2: Деплой на сервер (через бастион)
ssh root@37.1.212.51 "ssh ubuntu@111.88.145.206 'cd /home/ubuntu/mycalling && \
  git pull origin main && \
  npm install && \
  npm run build && \
  cp -r public .next/standalone/ && \
  cp -r .next/static .next/standalone/.next/ && \
  pm2 restart mycalling'"
```

> [!WARNING]
> После `npm run build` необходимо **обязательно** скопировать `public/` и `.next/static/` в `.next/standalone/`, иначе статические ресурсы (шрифты, иконки, изображения) не будут доступны.

---

## 8. Ключевые npm-зависимости

| Пакет | Назначение |
|-------|------------|
| `next` 14.2.5 | Фреймворк (App Router, API Routes, Standalone) |
| `@prisma/client` | ORM для PostgreSQL / Supabase |
| `better-auth` | Авторизация и сессии (cookie-based) |
| `framer-motion` | Анимации UI |
| `qrcode.react` | Локальная генерация QR-кодов (SVG, без внешних API) |
| `lucide-react` | Иконки |
| `zustand` | Стейт-менеджмент (диагностика) |
| `sharp` | Оптимизация изображений |

