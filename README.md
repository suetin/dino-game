# Dino Game — командный SPA-проект

## Описание проекта

**Dino Game** — клиентское SPA-приложение с 2D-игрой на Canvas, авторизацией, профилем пользователя, лидербордом и форумом.

Проект разрабатывается командой в рамках учебного курса и ориентирован на реальные практики командной frontend/backend-разработки.

Проект поддерживает:

- работу без интернета (offline);
- мобильную версию;
- современный стек (React, TypeScript, Redux, Canvas, Service Workers);
- серверную часть (Node.js, Express, PostgreSQL).

## Технологический стек

### Frontend

- Vite
- React
- TypeScript
- React Router
- Redux Toolkit + Reselect
- Canvas API
- Service Workers
- Custom Hooks и HOC
- ESLint + Prettier
- Jest + Testing Library
- Tailwind CSS v3
- Shadcn

### Backend

- Node.js
- Express
- PostgreSQL
- Sequelize
- JWT (в работе)
- REST API

### Инфраструктура

- Monorepo (Lerna + Yarn workspaces)
- Docker / Docker Compose
- CI (GitHub Actions)
- Nginx (production)
- HTTP/2, кеширование и сжатие (production)

## Структура репозитория

```
dino-game/
├── packages/
│   ├── client/        # Frontend (React + TypeScript)
│   └── server/        # Backend (Node.js + Express)
├── docker-compose.yml
├── Dockerfile.client
├── Dockerfile.server
├── lerna.json
├── README.md
└── docs/
```

Подробное описание структуры: [ARCHITECTURE.md](docs/ARCHITECTURE.md)

## Запуск проекта локально

### Требования

- Node.js >= 16 (версия указана в .nvmrc)
- Yarn 1.22.x
- Docker (опционально)

### Установка зависимостей

```bash
yarn bootstrap
```

### Запуск приложения

```bash
# Backend
yarn dev --scope=server

# Frontend
yarn dev --scope=client
```

- **Frontend:** http://localhost:3000  
- **Backend API:** http://localhost:3001

### Как добавить зависимости?

В проекте используется monorepo на основе [Lerna](https://github.com/lerna/lerna).

- Для клиента: `yarn lerna add {your_dep} --scope client`
- Для сервера: `yarn lerna add {your_dep} --scope server`
- Для обоих: `yarn lerna add {your_dep}`

Dev-зависимость: добавьте флаг `--dev`, например:  
`yarn lerna add {your_dep} --dev --scope server`

## Тесты и линтинг

Перед каждым Pull Request проверки обязательны.

```bash
yarn lint
yarn test
```

Pull Request с ошибками линтера или тестов не принимается.

Для клиента используется [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

Форматирование кода: `yarn format`

## CI (Continuous Integration)

В репозитории настроен CI (GitHub Actions), который автоматически:

- запускает ESLint;
- запускает unit-тесты;
- блокирует merge при ошибках.

Все проверки должны быть зелёными перед merge.

## Git-flow и Dev-flow

### Основные ветки

- **main** — стабильная версия проекта;
- **dev** — основная рабочая ветка команды.

### Правила работы

- Любая задача начинается от ветки **dev**
- Формат веток: `feature/<short-name>`, `fix/<short-name>`
- Pull Request всегда направляется в **dev**; минимум один осмысленный апрув от члена команды; линт и тесты должны проходить
- Ветка **main** обновляется только через **dev**

### Code Review

Ревью — обязательная часть процесса разработки.

Перед отправкой PR: линтер включён и проходит; код соответствует принципам SOLID, DRY, KISS; отсутствует «код на будущее» и мусорные файлы; README и документация актуальны.

Каждый участник: сдаёт один PR за спринт на ревью ментору; до командного зачёта должен получить два апрува на задачи с высокой сложностью.

## Функциональность приложения

- Авторизация и регистрация пользователя
- Профиль пользователя с возможностью изменения данных и аватара
- 2D-игра на Canvas с несколькими состояниями
- Лидерборд пользователей с сортировкой
- Форум (темы, комментарии, ответы)
- Страницы ошибок 404 и 500
- Темизация (минимум две темы)
- Offline-режим
- Использование Web API (LocalStorage, Page Visibility, Notifications и др.)

## Алгоритмы и структуры данных

В проекте реализованы:

- собственный алгоритм сортировки (без использования Array.sort);
- структура данных «очередь» (Queue) без массивов;
- структура данных «стек» (Stack) без массивов.

## Безопасность

- Защита от XSS (санитизация пользовательского ввода, CSP);
- Проверка авторизации на защищённых эндпоинтах;
- Ограничение частоты запросов (rate limiting);
- Централизованная обработка ошибок клиента и сервера.

## Команда проекта

| Роль | Участник | Зона ответственности |
|------|----------|------------------------|
| Тимлид | [Илья Гажиенко](https://github.com/Richbanker) | архитектура, координация команды, CI, Dev-flow |
| Frontend | [Александр Суетин](https://github.com/suetin) | архитектура клиента, Redux, игровая логика |
| Frontend | [Ольга Беляева](https://github.com/OZi-13) | авторизация, регистрация, формы, UX |
| Backend | [Наби Сандуров](https://github.com/Nabi1998) | серверная логика, API, форум |
| UI / поддержка | [Валентина Челпанова](https://github.com/valyatar) | вёрстка, темы, адаптивность |

## Документация

- [ARCHITECTURE.md](docs/ARCHITECTURE.md) — архитектура проекта
- [CHECKLIST.md](docs/CHECKLIST.md) — чеклист требований к проекту (минимум и доп. задания)
- [DEPLOY.md](docs/DEPLOY.md) — деплой на Ubuntu VM, nginx и GitHub Actions
- [SETUP_GUIDE.md](docs/SETUP_GUIDE.md) — настройка и запуск
- [MIGRATION_GUIDE.md](docs/MIGRATION_GUIDE.md) — перенос и интеграция
- [SPRINT_PLAN.md](docs/SPRINT_PLAN.md) — план работ
- [TEAM_GUIDE.md](docs/TEAM_GUIDE.md) — правила командной работы

## Production

### Сборка

```bash
yarn build
```

Просмотр собранной статики: `yarn preview --scope client`, `yarn preview --scope server`

### Окружение в Docker

**Одна команда запуска всего стека** (нужен запущенный Docker Desktop / daemon). Перед первым запуском по желанию выполните `node init.js` — создаст `.env` из [`.env.example`](.env.example), если файла ещё нет, и каталог `tmp/pgdata` для данных PostgreSQL.

```bash
docker compose up --build
```

Файл `.env` для compose **не обязателен**: для `DB_*`, `CLIENT_PORT`, `SERVER_PORT`, `POSTGRES_PORT` заданы безопасные значения по умолчанию (локальная разработка). Секреты в репозиторий не кладём: в git есть только `.env.example`, а `.env` перечислен в `.gitignore`.

**Сервисы в `docker-compose.yml`:** `db` (PostgreSQL 14), `server` (Node API), `client` (SSR Node + статика). Связи: `server` ждёт готовности `db` (`depends_on` + `service_healthy`), `client` стартует после `server`. Внутри сети compose PostgreSQL доступен как хост **`db`**, порт **5432**; наружу БД пробрасывается на `POSTGRES_PORT` хоста (по умолчанию 5432).

**Образы не должны содержать ваш локальный `.env`:** в корне репозитория добавлен [`.dockerignore`](.dockerignore). На этапе сборки `client` в образ передаются `EXTERNAL_SERVER_URL` и `INTERNAL_SERVER_URL`: в браузер попадает только **внешний** URL (`http://localhost:<SERVER_PORT>`), для SSR в бандл зашивается **внутренний** (`http://server:<SERVER_PORT>`). Если меняете `SERVER_PORT`, задайте в `.env` явно `EXTERNAL_SERVER_URL` и при необходимости `INTERNAL_SERVER_URL` до сборки, либо пересоберите образ: `docker compose build --no-cache client`.

**Полная проверка (Definition of Done для Docker):**

1. `docker compose up --build` завершается без падения контейнеров (дождаться строки о прослушивании порта у `server` и `client`).
2. `docker compose ps` — все три сервиса в состоянии `running` (у `db` допустимо `healthy`).
3. Логи API: `docker compose logs server` — есть строка с режимом `[db] Режим подключения: DATABASE_URL ... (хост db, ...)` и `[db] Подключение к PostgreSQL установлено...`.
4. Проверка HTTP: `curl -s -o NUL -w "%{http_code}" http://localhost:3001/` (или ваш `SERVER_PORT`) ожидается `200`.
5. Клиент в браузере: `http://localhost:3000` (или ваш `CLIENT_PORT`) открывается без ошибки контейнера `client` в логах.

Быстрая проверка после старта:

```bash
docker compose ps
docker compose logs server --tail 50
```

Если `server` стартует раньше готовности Postgres, compose не отпустит его до `healthy` у `db`; при ручном запуске только `server` без `db` приложение завершится с ошибкой подключения — это ожидаемо.

**Sequelize:** схема БД во всех средах обновляется только миграциями (`yarn --cwd packages/server db:migrate`), без `sequelize.sync()`.

Отдельный сервис: `docker compose up db` или `docker compose up server`.

### Деплой на VM

Пошаговый сценарий для Ubuntu VM, host-level `nginx`, подготовки к HTTPS/HTTP/2 и автодеплоя по SSH через GitHub Actions описан в [docs/DEPLOY.md](docs/DEPLOY.md).

### Автодеплой статики на Vercel

Зарегистрируйте аккаунт на [Vercel](https://vercel.com/), следуйте [инструкции Vite](https://vitejs.dev/guide/static-deploy.html#vercel-for-git). В качестве **root directory** укажите `packages/client`. PR будут автоматически деплоиться на Vercel.

## Хуки

В проекте используется [Lefthook](https://github.com/evilmartians/lefthook). Если очень нужно пропустить проверки — `--no-verify` (не злоупотребляйте).

## UI 
### Работа со стилями
Tailwind CSS v3 - https://v3.tailwindcss.com/docs/installation

Слева на странице есть поиск - через него удобно находить классы. 

### Установка компонентов
Shadcn - https://ui.shadcn.com/docs/components

Есть список компонентов и инструкции по их установке и использованию у каждого.

## API
### Пользователь

1. Получение пользователя:

GET /api/auth/user
- Ожидает: куки с токеном/сессией
- Возвращает: JSON с объектом User (id, name, second_name, ...)

2. Login:

POST /api/auth/signin
- Тело: { login, password }.
- Возвращает: 200 OK (и устанавливает куки).

3. Register:

POST /api/auth/signup
- Тело: { name, second_name, login, email, password, phone }.
- Возвращает: 200 OK (или id пользователя) и устанавливает куки.

4. Logout:

POST /api/auth/logout
- Возвращает: 200 OK (и удаляет куки).

## Ой, ничего не работает :(

Откройте issue — разберёмся.
