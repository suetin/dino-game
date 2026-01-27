# Чеклист соответствия ТЗ

## Sprint 1: Каркас и базовая функциональность

### Структура проекта
- [x] Монорепо структура (packages/client + packages/server)
- [x] Lerna конфигурация
- [x] Организация папок по функциональности
- [x] Разделение на компоненты, страницы, store, utils

### Конфигурация
- [x] TypeScript конфигурация (strict mode)
- [x] ESLint + Prettier
- [x] Vite для сборки
- [x] Tailwind CSS
- [x] .nvmrc для Node версии

### Роутинг
- [x] React Router настроен
- [x] Все страницы созданы:
  - [x] /login
  - [x] /signup
  - [x] /profile
  - [x] /game
  - [x] /leaderboard
  - [x] /forum
  - [x] /404
  - [x] /500
- [x] Редирект с / на /login
- [x] Обработка 404 для несуществующих роутов

### Формы
- [x] Login форма с валидацией
- [x] Signup форма с валидацией (все поля)
- [x] Валидация на клиенте
- [x] Отображение ошибок валидации
- [x] Обработка ошибок сервера (заглушка)

### Профиль
- [x] Страница профиля
- [x] Форма редактирования
- [x] Загрузка аватара (мок)
- [x] Удаление аватара (мок)

### Игра
- [x] Canvas 2D игра
- [x] Состояния: pre-start → playing → game-over
- [x] HUD: очки, жизни, время
- [x] Базовый геймплей (прыжок, препятствия)
- [x] Управление клавиатурой (Space)

### Redux
- [x] Redux Toolkit настроен
- [x] Slices: auth, user, game, ui
- [x] Reselect селекторы (auth)
- [x] Типизация (RootState, AppDispatch)

### Обработка ошибок
- [x] ErrorBoundary компонент
- [x] Страница 404
- [x] Страница 500
- [x] Обработка сетевых ошибок (в API клиенте)

### Темизация
- [x] 2 темы: light и dark
- [x] CSS Variables
- [x] Переключатель темы
- [x] Сохранение темы в LocalStorage
- [x] Синхронизация с Redux

### Web API
- [x] LocalStorage (тема, настройки)
- [x] Page Visibility API (пауза игры)

### Custom Hook и HOC
- [x] useLocalStorage hook
- [x] usePageVisibility hook
- [x] withAuth HOC (для защищенных роутов)

### Backend Skeleton
- [x] Express сервер
- [x] Sequelize конфигурация
- [x] Роуты (заглушки): auth, user, leaderboard, forum
- [x] Структура для миграций и моделей

### API Клиент
- [x] Axios клиент с interceptors
- [x] Автоматическое добавление JWT токена
- [x] Обработка ошибок
- [x] Типизированные endpoints

### Документация
- [x] README.md
- [x] ARCHITECTURE.md
- [x] SPRINT_PLAN.md
- [x] SETUP_GUIDE.md
- [x] PROJECT_STRUCTURE.md

## Sprint 2: Redux, Offline, Web API (TODO)

### Redux Thunk/Saga
- [ ] Redux Thunk для async операций
- [ ] Thunks для auth (login, register, logout)
- [ ] Thunks для user (getProfile, updateProfile, uploadAvatar)
- [ ] Thunks для leaderboard
- [ ] Thunks для forum

### Service Worker
- [ ] Service Worker регистрация
- [ ] Cache API для offline
- [ ] Стратегия кеширования
- [ ] Offline fallback

### Дополнительные Web API
- [ ] Web Audio API (звуки игры)
- [ ] Notifications API (опционально)
- [ ] Gamepad API (опционально)
- [ ] Vibration API (мобильные)

### Тесты
- [ ] Vitest конфигурация
- [ ] Тесты компонентов (RTL)
- [ ] Тесты хуков
- [ ] Тесты утилит

### Backend
- [ ] Sequelize модели (User, LeaderboardEntry, ForumTopic, ForumComment)
- [ ] Миграции БД
- [ ] JWT авторизация middleware
- [ ] Реализация auth endpoints
- [ ] Реализация user endpoints

## Sprint 3: SSR, OAuth, Leaderboard (TODO)

### SSR
- [ ] Vite SSR настройка
- [ ] Redux SSR (гидратация)
- [ ] React Router SSR
- [ ] Сравнение производительности SSR vs CSR
- [ ] Документация результатов

### OAuth
- [ ] OAuth интеграция (Google/GitHub)
- [ ] OAuth роуты на бэке
- [ ] Обработка OAuth callback

### Leaderboard
- [ ] Leaderboard API (бэкенд)
- [ ] Собственный алгоритм сортировки
- [ ] Сортировка по любому полю
- [ ] Пагинация (опционально)

### Web API
- [ ] Web Audio API (звуки)
- [ ] Еще 1 Web API

## Sprint 4: Темизация и Форум (TODO)

### Темизация
- [x] 2 темы реализованы
- [ ] Синхронизация темы с бэком (опционально)

### Форум
- [ ] Forum API (бэкенд)
- [ ] Список топиков
- [ ] Создание топика
- [ ] Комментарии + ответы
- [ ] Emoji поддержка
- [ ] UI форума

### Структуры данных
- [ ] Queue реализация (без массивов)
- [ ] Stack реализация (без массивов)
- [ ] Использование Queue в игре
- [ ] Использование Stack для undo

## Sprint 5: Безопасность, финализация (TODO)

### Безопасность
- [ ] CSP заголовки
- [ ] XSS защита (санитизация)
- [ ] DoS защита (rate limiting)
- [ ] Валидация на бэке

### Проверка требований
- [ ] 4+ Web API интегрированы
- [ ] TypeScript >= 95%
- [ ] Lighthouse > 50%
- [ ] PWA манифест
- [ ] Оптимизация (code splitting, lazy loading)

### Алгоритмы
- [ ] Собственный метод сортировки
- [ ] Queue структура данных
- [ ] Stack структура данных

## Итоговая статистика

**Sprint 1**: 100% выполнено
**Sprint 2**: 0% (готов к началу)
**Sprint 3**: 0% (готов к началу)
**Sprint 4**: 0% (готов к началу)
**Sprint 5**: 0% (готов к началу)

**Общий прогресс**: ~20% (Sprint 1 завершен)
