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

if pm2 describe evgeny-muhomor-backend > /dev/null 2>&1; then
    echo "🔄 Перезапуск существующего процесса в PM2"
    pm2 restart evgeny-muhomor-backend --update-env --exp-backoff-restart-delay 300
else
    echo "🚀 Первый запуск процесса в PM2"
    pm2 start dist/server.js --name "evgeny-muhomor-backend" --exp-backoff-restart-delay 300
fi
pm2 save
cd ..

# 3. Деплой Фронтенда
echo "⚙️ Сборка фронтенда..."
cd app
pnpm install
pnpm run build
cd ..

echo "✅ Деплой успешно завершен!"
