#!/bin/bash
set -euo pipefail

# ============================================================
# Скрипт настройки сервера для synthosai.ru
# Запуск: ssh -l ubuntu 111.88.145.206
#         bash setup-server.sh
# ============================================================

DOMAIN="synthosai.ru"
REPO="https://github.com/synthosaicreativestudio-maker/mycalling.git"
APP_DIR="/home/ubuntu/mycalling"
NODE_VERSION="20"

echo "========================================="
echo "🚀 Настройка сервера для $DOMAIN"
echo "========================================="

# --- 1. Обновление системы ---
echo ""
echo "📦 [1/7] Обновление системы..."
sudo apt update && sudo apt upgrade -y

# --- 2. Установка Node.js 20 ---
echo ""
echo "📦 [2/7] Установка Node.js $NODE_VERSION..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
    sudo apt install -y nodejs
else
    echo "  ✅ Node.js уже установлен: $(node -v)"
fi

echo "  Node.js: $(node -v)"
echo "  npm: $(npm -v)"

# --- 3. Установка PM2 ---
echo ""
echo "📦 [3/7] Установка PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
else
    echo "  ✅ PM2 уже установлен"
fi

# --- 4. Проверка зависимостей системы ---
echo ""
echo "📦 [4/7] Проверка системных пакетов..."
sudo apt update && sudo apt install -y curl git
echo "  ✅ Системные пакеты готовы"

# --- 5. Клонирование и сборка проекта ---
echo ""
echo "📦 [5/7] Клонирование и сборка проекта..."
if [ -d "$APP_DIR" ]; then
    echo "  Обновляю существующий проект..."
    cd "$APP_DIR"
    git pull origin main
else
    git clone "$REPO" "$APP_DIR"
    cd "$APP_DIR"
fi

npm install
npm run build

# Копируем статику для корректной работы standalone режима
echo "  📦 Копирование статических файлов..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/
echo "  ✅ Проект собран"

# --- 6. Настройка Caddy (Информационное сообщение) ---
echo ""
echo "📦 [6/7] Настройка веб-сервера..."
echo "  ⚠️ Caddy запущен на US-сервере (Reality Bridge)."
echo "  ⚠️ Проксирование на порт 3000 настраивается в Caddyfile на US-сервере."
echo "  ✅ Локальная настройка веб-сервера пропущена (используется Reality Bridge)"

# --- 7. Запуск приложения через PM2 ---
echo ""
echo "📦 [7/7] Запуск приложения..."
cd "$APP_DIR"

# Останавливаем если уже запущено
pm2 delete mycalling 2>/dev/null || true

# Запускаем standalone сервер
PORT=3000 pm2 start node --name "mycalling" -- .next/standalone/server.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>&1 | grep "sudo" | bash || true

echo ""
echo "========================================="
echo "✅ СЕРВЕР НАСТРОЕН!"
echo "========================================="
echo ""
echo "Приложение запущено на порту 3000."
echo "Прямой IP:  http://111.88.145.206:3000"
echo ""
echo "📋 Полезные команды:"
echo "    pm2 status        — статус приложения"
echo "    pm2 logs mycalling — логи"
echo "    pm2 restart mycalling — перезапуск"
echo "========================================="
