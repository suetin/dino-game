# Forum API (Dino Game Backend)

Бэкенд на **Express**, **TypeScript** и **Sequelize (PostgreSQL)**. Поддерживаются иерархические комментарии и CRUD по форуму.

## Запуск

Из корня монорепозитория:

1. Поднять PostgreSQL (сервис `db` в compose):

```bash
docker compose up -d db
```

2. Установить зависимости и подготовить `.env`:

```bash
yarn bootstrap
node init.js
```

3. Запустить API в режиме разработки:

```bash
yarn dev --scope=server
```

Сервер: http://localhost:3001 (порт можно изменить в `.env`, переменная `SERVER_PORT`).

Переменные БД: если задан непустой `DATABASE_URL`, Sequelize использует **только** его (остальные `POSTGRES_*` для подключения не читаются). Иначе нужен полный набор `POSTGRES_HOST`, `POSTGRES_PORT`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`. В Docker-образе сервера файлы `.env` не подгружаются (`LOAD_DOTENV_FILE=0`). Шаблон — `.env.example` в корне монорепозитория.

Для OAuth Яндекса нужно задать `YANDEX_OAUTH_CLIENT_ID`, `YANDEX_OAUTH_CLIENT_SECRET` и `YANDEX_OAUTH_REDIRECT_URI_ALLOWLIST` (список URI через запятую).
Параметр `COOKIE_SECURE` управляет флагом `Secure` для cookie: `auto` (по умолчанию, только для HTTPS), `true` (всегда), `false` (никогда).

`sequelize.sync()` не используется; схема БД управляется только миграциями.

## Миграции

```bash
yarn --cwd packages/server db:migrate
```

Откат последней миграции:

```bash
yarn --cwd packages/server db:migrate:undo
```

## API: темы (Topics)

Метод,Эндпоинт,Описание
GET,/api/forum/topics,Получить список всех тем
POST,/api/forum/topics,Создать новую тему
GET,/api/forum/topics/:id,Получить тему со всеми комментариями и ответами
PUT,/api/forum/topics/:id,Редактировать заголовок/описание
DELETE,/api/forum/topics/:id,Удалить тему и её комментарии (Cascade)


## API: комментарии (Comments)
Метод,Эндпоинт,Описание
POST,/api/forum/comments,Оставить комментарий или ответ
PUT,/api/forum/comments/:id,Редактировать текст комментария


## Примеры (curl)
Создание темы

curl -X POST http://localhost:3001/api/forum/topics \
-H "Content-Type: application/json" \
-d '{"title": "Как набрать 1000 очков?", "description": "Поделитесь тактикой", "author_id": 1}'


Ответ на комментарий (Вложенность)
Чтобы создать ответ, передайте parentId существующего комментария:

curl -X POST http://localhost:3001/api/forum/comments \
-H "Content-Type: application/json" \
-d '{"content": "Согласен с предыдущим оратором!", "topic_id": 1, "author_id": 2, "parentId": 5}'


## Структура БД (Sequelize)
Topic: id, title, description, author_id.

Comment: id, content, author_id, topic_id, parentId (для древовидных ответов).

Связи:

Topic 1:N Comment: Удаление темы удаляет все комментарии.

Comment 1:N Comment: Рекурсивная связь для ответов.
