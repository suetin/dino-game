# Архитектура проекта "Игра"

## Структура репозитория (Монорепо)

```
DinoGame/
├── packages/
│   ├── client/            # React + TypeScript + Vite
│   │   ├── src/
│   │   ├── components/    # Переиспользуемые компоненты
│   │   │   ├── ui/        # Базовые UI компоненты
│   │   │   ├── forms/     # Формы (Login, Signup, Profile)
│   │   │   ├── game/      # Компоненты игры
│   │   │   └── layout/    # Layout компоненты
│   │   ├── pages/         # Страницы-роуты
│   │   ├── store/         # Redux store
│   │   │   ├── slices/    # Redux slices
│   │   │   ├── selectors/ # Reselect селекторы
│   │   │   ├── thunks/    # Redux Thunk actions
│   │   │   └── types/     # Redux типы
│   │   ├── game/          # Игровой движок
│   │   │   ├── engine/    # Игровой цикл, системы
│   │   │   ├── entities/  # Игровые сущности
│   │   │   ├── systems/   # Системы (физика, коллизии)
│   │   │   ├── renderer/  # Canvas рендерер
│   │   │   ├── input/     # Обработка ввода
│   │   │   └── utils/     # Утилиты игры
│   │   ├── hooks/         # Custom hooks
│   │   ├── hocs/          # Higher-Order Components
│   │   ├── api/           # API клиент
│   │   │   ├── client.ts  # Axios/fetch клиент
│   │   │   ├── endpoints/ # Эндпоинты
│   │   │   └── types.ts   # Типы API
│   │   ├── utils/         # Утилиты
│   │   │   ├── algorithms/ # Собственные алгоритмы (сортировка, Queue, Stack)
│   │   │   └── validation/ # Валидация форм
│   │   ├── types/         # Общие TypeScript типы
│   │   ├── styles/        # Глобальные стили
│   │   │   ├── themes/    # CSS переменные тем
│   │   │   └── globals.css
│   │   ├── serviceWorker/ # Service Worker
│   │   ├── App.tsx
│   │   └── main.tsx
│   │   ├── public/
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   ├── tsconfig.json
│   │   └── package.json
│   │
│   └── server/            # Node.js + Express + Sequelize
│   ├── src/
│   │   ├── config/        # Конфигурация (DB, JWT)
│   │   ├── models/        # Sequelize модели
│   │   ├── migrations/    # Миграции БД
│   │   ├── routes/        # Express роуты
│   │   │   ├── auth.ts
│   │   │   ├── user.ts
│   │   │   ├── leaderboard.ts
│   │   │   └── forum.ts
│   │   ├── middleware/    # Middleware (auth, error, validation)
│   │   ├── controllers/   # Контроллеры
│   │   ├── services/      # Бизнес-логика
│   │       ├── utils/         # Утилиты
│   │       └── server.ts       # Точка входа
│   │   ├── .nvmrc
│   │   ├── package.json
│   │   └── tsconfig.json
│
├── docker-compose.yml     # PostgreSQL + client + server
├── Dockerfile.client      # Docker для клиента
├── Dockerfile.server      # Docker для сервера
├── lerna.json            # Lerna конфигурация
├── .gitignore
├── .eslintrc.js
├── .prettierrc
└── README.md
```

## Обоснование выбора монорепо

Проект использует Lerna для управления монорепо:
- Единая версионизация зависимостей через `yarn bootstrap`
- Общие типы между клиентом и сервером (опционально через shared/)
- Упрощенный CI/CD
- Команда может работать параллельно в разных пакетах
- Scoped команды: `yarn dev --scope=client`, `yarn dev --scope=server`

## Схема роутинга

```
/ → /login (редирект)
/login → LoginPage
/signup → SignupPage
/profile → ProfilePage (protected)
/game → GamePage
/leaderboard → LeaderboardPage
/forum → ForumPage
/forum/:topicId → ForumTopicPage
/404 → NotFoundPage
/500 → ErrorPage
```

**Защита роутов**: HOC `withAuth` для `/profile`, `/leaderboard`, `/forum`

## Схема Redux Store

```typescript
{
  auth: {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    isLoading: boolean
    error: string | null
  },
  user: {
    profile: UserProfile | null
    avatar: string | null
    isLoading: boolean
    error: string | null
  },
  game: {
    state: 'pre-start' | 'playing' | 'paused' | 'game-over'
    score: number
    lives: number
    time: number
    players: Player[]
    isPaused: boolean
  },
  leaderboard: {
    entries: LeaderboardEntry[]
    sortBy: string
    sortOrder: 'asc' | 'desc'
    isLoading: boolean
    error: string | null
  },
  forum: {
    topics: ForumTopic[]
    currentTopic: ForumTopic | null
    comments: ForumComment[]
    isLoading: boolean
    error: string | null
  },
  ui: {
    theme: 'light' | 'dark'
    notifications: Notification[]
    sidebarOpen: boolean
  }
}
```

**Селекторы (Reselect)**:
- `selectAuthUser`, `selectIsAuthenticated`
- `selectGameState`, `selectGameScore`
- `selectLeaderboardSorted`
- `selectForumTopics`

**Thunks/Sagas**: 
- `loginUser`, `registerUser`, `logoutUser`
- `fetchUserProfile`, `updateUserProfile`, `uploadAvatar`
- `fetchLeaderboard`, `submitScore`
- `fetchForumTopics`, `createTopic`, `addComment`

## Схема игрового движка

```
GameEngine
├── GameLoop (requestAnimationFrame)
├── EntityManager (управление сущностями)
├── Systems:
│   ├── PhysicsSystem (движение, гравитация)
│   ├── CollisionSystem (проверка коллизий)
│   ├── RenderSystem (отрисовка на Canvas)
│   └── InputSystem (клавиатура, touch, gamepad)
├── StateMachine:
│   ├── PreStartState
│   ├── PlayingState
│   └── GameOverState
└── Utils:
    ├── Queue (события игры)
    └── Stack (undo/redo состояний)
```

**Архитектура игры**:
- ECS-like подход (Entities, Components, Systems)
- Состояния через State Machine
- События через Queue
- История действий через Stack

## Схема API

**Базовый URL**: `http://localhost:3001/api`

**Эндпоинты**:
```
POST   /auth/login
POST   /auth/register
POST   /auth/logout
GET    /auth/me (protected)

GET    /user/profile (protected)
PUT    /user/profile (protected)
POST   /user/avatar (protected)
DELETE /user/avatar (protected)

GET    /leaderboard
POST   /leaderboard (protected)

GET    /forum/topics
POST   /forum/topics (protected)
GET    /forum/topics/:id
POST   /forum/topics/:id/comments (protected)

GET    /themes
PUT    /user/theme (protected)
```

**Типы запросов/ответов**:
- Все запросы: `application/json`
- Ответы: `{ data?: T, error?: string, message?: string }`
- Защищенные роуты: `Authorization: Bearer <token>`

**Обработка ошибок**:
- HTTP статусы: 200, 201, 400, 401, 403, 404, 500
- Унифицированный формат ошибок на фронте
- Retry логика для сетевых ошибок

## Темизация

**Подход**: CSS Variables + React Context

```css
/* themes/light.css */
:root {
  --bg-primary: #ffffff;
  --bg-secondary: #f5f5f5;
  --text-primary: #000000;
  --text-secondary: #666666;
  --accent: #007bff;
  --game-bg: #f0f0f0;
}

/* themes/dark.css */
[data-theme="dark"] {
  --bg-primary: #1a1a1a;
  --bg-secondary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #cccccc;
  --accent: #4dabf7;
  --game-bg: #0a0a0a;
}
```

**ThemeProvider**: React Context для переключения тем
**Хранение**: LocalStorage + синхронизация с бэком (опционально)

## Web API интеграция

1. **LocalStorage** - тема, настройки игры, токен (опционально)
2. **Page Visibility API** - пауза игры при переключении вкладки
3. **Service Worker + Cache API** - offline режим
4. **Web Audio API** - звуки игры
5. **Notifications API** - уведомления (опционально)
6. **Gamepad API** - поддержка геймпадов
7. **Vibration API** - тактильная обратная связь (мобильные)
8. **Clipboard API** - копирование ссылок/текста

## Алгоритмы и структуры данных

**Собственная сортировка**:
- Метод `Array.prototype.customSort` (изолирован через namespace)
- Алгоритм: QuickSort или MergeSort
- Использование: лидерборд, форум (сортировка топиков)

**Queue (Очередь)**:
- Реализация через связанный список
- Использование: очередь событий игры, очередь логов

**Stack (Стек)**:
- Реализация через связанный список
- Использование: стек состояний игры (undo), история действий

## Безопасность

**XSS защита**:
- Санитизация пользовательского ввода (DOMPurify)
- React автоматически экранирует JSX
- Валидация на бэке

**CSP (Content Security Policy)**:
- Заголовки CSP в Express
- Ограничение источников скриптов, стилей, изображений

**DoS защита**:
- Rate limiting на бэке (express-rate-limit)
- Валидация размера файлов (аватар)
- Ограничение длины текста (форум)

## Тестирование

**Frontend**:
- Vitest + React Testing Library
- Тесты компонентов, хуков, утилит
- Моки для API

**Backend**:
- Jest + Supertest
- Тесты роутов, middleware, сервисов

## SSR (Спринт 3)

**Подход**: Vite SSR (vite-plugin-ssr или собственный)

**Стратегия**:
- Начальная загрузка: SSR для SEO и производительности
- Гидратация: React берет управление
- Сравнение метрик: Lighthouse до/после SSR

**Интеграция**:
- Redux SSR: `getServerSideProps`-подобный подход
- React Router SSR: статический роутинг на сервере
- Express middleware для SSR
