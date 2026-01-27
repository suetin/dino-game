# Руководство для команды разработки

## Текущий статус проекта

**Sprint 1 завершен**

Создан базовый скелет проекта с:
- Структурой монорепо (frontend/ + backend/)
- Всеми страницами и роутингом
- Redux Store с базовыми slices
- Canvas игрой (базовая версия)
- Формами авторизации с валидацией
- Темизацией (2 темы)
- Web API интеграцией (LocalStorage, Page Visibility)
- Backend skeleton с Express + Sequelize

## Структура для параллельной работы

### Frontend разработчики

**Компоненты и страницы:**
- `packages/client/src/components/` - переиспользуемые компоненты
- `packages/client/src/pages/` - страницы-роуты
- `packages/client/src/components/layout/` - Layout компонент

**Redux:**
- `packages/client/src/store/slices/` - Redux slices (auth, user, game, ui)
- `packages/client/src/store/selectors/` - Reselect селекторы
- `packages/client/src/store/thunks/` - Redux Thunks (будет в Sprint 2)

**Игра:**
- `packages/client/src/game/` - игровой движок
- `packages/client/src/components/game/` - игровые компоненты

**API:**
- `packages/client/src/api/client.ts` - Axios клиент
- `packages/client/src/api/endpoints/` - API endpoints

### Backend разработчики

**Роуты:**
- `packages/server/src/routes/` - Express роуты (сейчас заглушки)
- `packages/server/src/controllers/` - контроллеры (создать)
- `packages/server/src/services/` - бизнес-логика (создать)

**База данных:**
- `packages/server/src/models/` - Sequelize модели (создать)
- `packages/server/src/migrations/` - миграции БД (создать)
- `packages/server/src/config/database.ts` - конфигурация БД

**Middleware:**
- `backend/src/middleware/` - Express middleware (auth, error, validation)

## Быстрый старт для разработчика

### 1. Клонирование и установка

```bash
git clone <repository-url>
cd dino-game

# Установка всех зависимостей (обязательно!)
yarn bootstrap
```

### 2. Настройка окружения

```bash
# Server .env
cd packages/server
cp .env.example .env
# Отредактируйте .env файл
```

### 3. Запуск базы данных

```bash
docker-compose up -d
```

### 4. Запуск приложения

**Терминал 1 (Server):**
```bash
yarn dev --scope=server
```

**Терминал 2 (Client):**
```bash
yarn dev --scope=client
```

Или запустить всё вместе:
```bash
yarn dev
```

## Соглашения по коду

### TypeScript
- Строгая типизация (strict mode)
- Избегать `any`
- Использовать интерфейсы для типов
- Типы в `src/types/`

### React
- Функциональные компоненты
- Hooks для состояния
- Props интерфейсы
- Компоненты в PascalCase

### Redux
- Redux Toolkit для slices
- Reselect для селекторов
- Thunks для async операций
- Типизированные actions

### Стили
- Tailwind CSS для стилей
- CSS Variables для тем
- Модульные стили (опционально)
- Без inline стилей

### Git
- Feature branches
- Понятные commit messages
- Pull requests для review

## Workflow

### Создание новой фичи

1. Создать feature branch:
```bash
git checkout -b feature/название-фичи
```

2. Разработка:
   - Создать компоненты/страницы в `packages/client` или `packages/server`
   - Добавить типы
   - Обновить Redux (если нужно)
   - Добавить тесты

3. Проверка:
```bash
yarn lint
yarn format
yarn test
```

4. Commit и Push:
```bash
git add .
git commit -m "feat: описание фичи"
git push origin feature/название-фичи
```

5. Создать Pull Request

## Работа с игрой

### Текущая архитектура
- `packages/client/src/components/game/GameCanvas.tsx` - основной компонент Canvas
- Состояние игры в Redux (`gameSlice`)
- Базовый геймплей реализован

### Расширение игры (Sprint 2+)
- Добавить системы в `packages/client/src/game/systems/`
- Добавить сущности в `packages/client/src/game/entities/`
- Улучшить рендерер в `packages/client/src/game/renderer/`
- Добавить звуки (Web Audio API)

## Работа с авторизацией

### Текущее состояние
- Мок авторизация (без реального API)
- Redux auth slice готов
- Формы валидации готовы

### Интеграция с бэком (Sprint 2)
1. Реализовать JWT на сервере (`packages/server`)
2. Подключить auth API endpoints
3. Обновить thunks для реальных запросов
4. Добавить защиту роутов (withAuth HOC)

## Работа с Redux

### Добавление нового slice

1. Создать файл в `store/slices/`:
```typescript
import { createSlice } from '@reduxjs/toolkit';

const mySlice = createSlice({
  name: 'my',
  initialState: { ... },
  reducers: { ... },
});

export default mySlice.reducer;
```

2. Добавить в `store/index.ts`:
```typescript
import myReducer from './slices/mySlice';

export const store = configureStore({
  reducer: {
    // ...
    my: myReducer,
  },
});
```

3. Создать селекторы в `store/selectors/` (если нужно)

### Добавление Thunk (Sprint 2)

1. Создать файл в `store/thunks/`:
```typescript
import { createAsyncThunk } from '@reduxjs/toolkit';
import { myApi } from '@/api/endpoints/my';

export const fetchMyData = createAsyncThunk(
  'my/fetchData',
  async () => {
    const response = await myApi.getData();
    return response.data;
  }
);
```

2. Обработать в slice:
```typescript
extraReducers: (builder) => {
  builder
    .addCase(fetchMyData.pending, (state) => {
      state.isLoading = true;
    })
    .addCase(fetchMyData.fulfilled, (state, action) => {
      state.data = action.payload;
      state.isLoading = false;
    });
}
```

## Работа с базой данных

### Создание модели

1. Создать файл в `backend/src/models/`:
```typescript
import { DataTypes } from 'sequelize';
import sequelize from '../config/database';

const MyModel = sequelize.define('MyModel', {
  // поля
});

export default MyModel;
```

2. Создать миграцию:
```bash
cd backend
npx sequelize-cli migration:generate --name create-my-model
```

3. Реализовать миграцию в `backend/src/migrations/`

## Тестирование

### Client тесты (Sprint 2)
```bash
yarn test --scope=client
```

### Server тесты (Sprint 2)
```bash
yarn test --scope=server
```

## Полезные ресурсы

- [React Router Docs](https://reactrouter.com/)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [Vite Docs](https://vitejs.dev/)
- [Sequelize Docs](https://sequelize.org/)
- [Tailwind CSS Docs](https://tailwindcss.com/)

## Вопросы?

Если возникли вопросы:
1. Проверьте документацию в `ARCHITECTURE.md`
2. Посмотрите примеры в коде
3. Спросите тимлида

## Следующие шаги (Sprint 2)

1. Реализовать Redux Thunks
2. Добавить Service Worker
3. Создать Sequelize модели
4. Реализовать JWT авторизацию
5. Подключить реальные API
6. Добавить тесты
