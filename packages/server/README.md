# 🎸 Forum API (Dino Game Backend)

Бэкенд для форума игры, реализованный на **Express**, **TypeScript** и **Sequelize (PostgreSQL)**. Поддерживает иерархические комментарии (дерево ответов) и полный цикл CRUD.

## 🚀 Запуск проекта

1. **Поднимите базу данных в Docker:**
   ```bash
   docker compose up -d

2. Установите зависимости:

Bash

npm install


3. Запустите сервер:

Bash

npm run dev

Сервер будет доступен по адресу: http://localhost:3001

🛠 API Endpoints
Темы (Topics)

Метод,Эндпоинт,Описание
GET,/api/forum/topics,Получить список всех тем
POST,/api/forum/topics,Создать новую тему
GET,/api/forum/topics/:id,Получить тему со всеми комментариями и ответами
PUT,/api/forum/topics/:id,Редактировать заголовок/описание
DELETE,/api/forum/topics/:id,Удалить тему и её комментарии (Cascade)


Комментарии (Comments)
Метод,Эндпоинт,Описание
POST,/api/forum/comments,Оставить комментарий или ответ
PUT,/api/forum/comments/:id,Редактировать текст комментария


🧪 Примеры запросов (cURL)
Создание темы

curl -X POST http://localhost:3001/api/forum/topics \
-H "Content-Type: application/json" \
-d '{"title": "Как набрать 1000 очков?", "description": "Поделитесь тактикой", "author_id": 1}'


Ответ на комментарий (Вложенность)
Чтобы создать ответ, передайте parentId существующего комментария:

curl -X POST http://localhost:3001/api/forum/comments \
-H "Content-Type: application/json" \
-d '{"content": "Согласен с предыдущим оратором!", "topic_id": 1, "author_id": 2, "parentId": 5}'


🗄 Структура БД (Sequelize)
Topic: id, title, description, author_id.

Comment: id, content, author_id, topic_id, parentId (для древовидных ответов).

Связи:

Topic 1:N Comment: Удаление темы удаляет все комментарии.

Comment 1:N Comment: Рекурсивная связь для ответов.
