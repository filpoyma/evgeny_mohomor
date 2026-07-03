#!/bin/bash

# --- НАСТРОЙКИ ---
# Имя суперпользователя Postgres (обычно postgres)
PG_SUPERUSER="postgres"

# Данные для нового приложения
DB_NAME="mushroom_db"
DB_USER="mushroom_user"
DB_PASSWORD="hLsMUqw54iB3QprpaJNoVmI6P4LquZsy" # Обязательно измените на свой!

echo "🚀 Начало инициализации базы данных..."

# Выполнение команд от имени суперпользователя PostgreSQL
sudo -u $PG_SUPERUSER psql <<EOF
-- 1. Создание пользователя, если он не существует
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '$DB_USER') THEN
        CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$DB_PASSWORD';
        RAISE NOTICE 'Пользователь % успешно создан.', '$DB_USER';
    ELSE
        RAISE NOTICE 'Пользователь % уже существует.', '$DB_USER';
    END IF;
END
\$\$;

-- 2. Создание базы данных (если не существует)
SELECT 'CREATE DATABASE $DB_NAME'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME')\gexec

-- 3. Предоставление прав на саму базу данных
GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
ALTER DATABASE $DB_NAME OWNER TO $DB_USER;

EOF

# 4. Предоставление прав внутри схемы (требуется подключение к конкретной БД)
echo "🔒 Настройка прав для схемы public в базе данных $DB_NAME..."
sudo -u $PG_SUPERUSER psql -d $DB_NAME <<EOF
GRANT ALL ON SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO $DB_USER;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;
ALTER SCHEMA public OWNER TO $DB_USER;
EOF

echo "✅ Инициализация успешно завершена!"
```
