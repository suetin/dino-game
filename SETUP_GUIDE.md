# Руководство по настройке проекта

## Быстрый старт

### 1. Установка зависимостей

```bash
# Установка всех зависимостей через Lerna (обязательный шаг)
yarn bootstrap
```

Или по отдельности:
```bash
# Client
cd packages/client
yarn install

# Server
cd packages/server
yarn install
```

### 2. Настройка базы данных

#### Вариант 1: Docker (рекомендуется)

```bash
docker-compose up -d
```

#### Вариант 2: Локальный PostgreSQL

```sql
CREATE DATABASE dinogame;
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE dinogame TO postgres;
```

### 3. Настройка переменных окружения

```bash
cd packages/server
cp .env.example .env
```

Отредактируйте `.env` файл:
```
PORT=3001
NODE_ENV=development
DB_NAME=dinogame
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d
```

### 4. Запуск приложения

#### Терминал 1 - Backend:
```bash
yarn dev --scope=server
```

#### Терминал 2 - Frontend:
```bash
yarn dev --scope=client
```

Или запустить всё вместе:
```bash
yarn dev
```

Приложение будет доступно:
- Frontend: http://localhost:3000
- Backend: http://localhost:3001

## Структура файлов

См. [ARCHITECTURE.md](./ARCHITECTURE.md) для подробной информации.

## Команды разработки

### Из корня проекта (Lerna)
- `yarn bootstrap` - установка всех зависимостей (обязательно перед первым запуском)
- `yarn dev` - запуск всех сервисов
- `yarn dev --scope=client` - запуск только клиента
- `yarn dev --scope=server` - запуск только сервера
- `yarn build` - сборка всех пакетов
- `yarn lint` - проверка кода
- `yarn format` - форматирование кода
- `yarn test` - запуск тестов

### Client (packages/client)
- `yarn dev` - запуск dev сервера с hot reload
- `yarn build` - сборка для production
- `yarn preview` - preview production сборки
- `yarn lint` - проверка кода ESLint
- `yarn format` - форматирование Prettier
- `yarn test` - запуск тестов Vitest

### Server (packages/server)
- `yarn dev` - запуск dev сервера с hot reload (tsx watch)
- `yarn build` - компиляция TypeScript
- `yarn start` - запуск production сервера
- `yarn migrate` - выполнение миграций БД
- `yarn migrate:undo` - откат последней миграции

## Проверка работоспособности

1. Откройте http://localhost:3000
2. Перейдите на `/login`
3. Введите любые данные (сейчас используется мок авторизация)
4. После входа доступны страницы: `/game`, `/profile`, `/leaderboard`, `/forum`

## Следующие шаги

1. Настройте реальную авторизацию (JWT на бэке)
2. Подключите базу данных (миграции Sequelize)
3. Реализуйте API endpoints
4. Добавьте Service Worker для offline режима
5. Настройте SSR (Sprint 3)

## Проблемы и решения

### Порт уже занят
Измените порт в `vite.config.ts` (frontend) или `.env` (backend)

### Ошибка подключения к БД
Проверьте:
- PostgreSQL запущен
- Правильные credentials в `.env`
- База данных `dinogame` создана

### Ошибки TypeScript
```bash
cd frontend
npm run build
# Проверьте ошибки компиляции
```

## Полезные ссылки

- [React Router](https://reactrouter.com/)
- [Redux Toolkit](https://redux-toolkit.js.org/)
- [Vite](https://vitejs.dev/)
- [Sequelize](https://sequelize.org/)
