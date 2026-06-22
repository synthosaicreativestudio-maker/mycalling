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

# --- 4. Установка Nginx ---
echo ""
echo "📦 [4/7] Установка Nginx..."
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi
sudo systemctl enable nginx
sudo systemctl start nginx
echo "  ✅ Nginx запущен"

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
echo "  ✅ Проект собран"

# --- 6. Настройка Nginx ---
echo ""
echo "📦 [6/7] Настройка Nginx..."
sudo tee /etc/nginx/sites-available/$DOMAIN > /dev/null <<NGINX_CONF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_CONF

# Активируем сайт
sudo ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/$DOMAIN
# Удаляем default если есть
sudo rm -f /etc/nginx/sites-enabled/default

# Проверяем конфиг
sudo nginx -t
sudo systemctl reload nginx
echo "  ✅ Nginx настроен"

# --- 7. Запуск приложения через PM2 ---
echo ""
echo "📦 [7/7] Запуск приложения..."
cd "$APP_DIR"

# Останавливаем если уже запущено
pm2 delete mycalling 2>/dev/null || true

# Запускаем standalone сервер
pm2 start node --name "mycalling" -- .next/standalone/server.js
pm2 save
pm2 startup systemd -u ubuntu --hp /home/ubuntu 2>&1 | grep "sudo" | bash || true

echo ""
echo "========================================="
echo "✅ СЕРВЕР НАСТРОЕН!"
echo "========================================="
echo ""
echo "Приложение: http://$DOMAIN (после настройки DNS)"
echo "Прямой IP:  http://111.88.145.206"
echo ""
echo "⚠️  Для SSL выполните после настройки DNS:"
echo "    sudo apt install -y certbot python3-certbot-nginx"
echo "    sudo certbot --nginx -d $DOMAIN -d www.$DOMAIN"
echo ""
echo "📋 Полезные команды:"
echo "    pm2 status        — статус приложения"
echo "    pm2 logs mycalling — логи"
echo "    pm2 restart mycalling — перезапуск"
echo "========================================="
