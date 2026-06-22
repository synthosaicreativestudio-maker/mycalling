#!/bin/bash
set -euo pipefail

# ============================================================
# Скрипт обновления приложения на сервере
# Запуск: ssh -l ubuntu 111.88.145.206 'bash mycalling/deploy/update.sh'
# ============================================================

APP_DIR="/home/ubuntu/mycalling"

echo "🔄 Обновление МоёПризвание..."

cd "$APP_DIR"

echo "  Загружаю изменения из GitHub..."
git pull origin main

echo "  Устанавливаю зависимости..."
npm install

echo "  Собираю проект..."
npm run build

echo "  Копирование статических файлов..."
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

echo "  Перезапускаю приложение..."
pm2 restart mycalling

echo ""
echo "✅ Обновление завершено!"
pm2 status
