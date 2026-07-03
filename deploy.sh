#!/bin/bash

# Прерывать выполнение при любой ошибке
set -e

# Переходим в директорию проекта на сервере
PROJECT_DIR="/var/www/evgeny_mohomor"
cd "$PROJECT_DIR"

echo "🚀 Начало процесса деплоя."

# 1. Стягиваем последние изменения
echo "📥 Получение обновлений из Git."
git fetch --all
git reset --hard origin/main
git clean -fd

# 2. Деплой Бэкенда
echo "⚙️ Сборка бэкенда..."
cd backend
pnpm install
pnpm prisma:deploy
pnpm run build

echo "🔄 Перезапуск бэкенда в PM2..."
pm2 restart evgeny-muhomor-backend --exp-backoff-restart-delay 100 || pm2 start dist/server.js --name "evgeny-muhomor-backend" --exp-backoff-restart-delay 100
pm2 save
cd ..

# 3. Деплой Фронтенда
echo "⚙️ Сборка фронтенда..."
cd app
pnpm install
pnpm run build
cd ..

echo "✅ Деплой успешно завершен!"
