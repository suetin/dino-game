# План работ по спринтам

## Sprint 1: Каркас и базовая функциональность

**Цель**: Минимально рабочий MVP с основными страницами и базовой игрой

### Задачи:
1. Структура проекта (монорепо: frontend/ + backend/)
2. Конфигурация: TypeScript, ESLint, Prettier, Vite
3. React Router: все страницы-заглушки
4. Формы Login/Signup с валидацией
5. Страница Profile (мок данных, без бэка)
6. Базовая игра Canvas: pre-start → playing → game-over
7. HUD игры (очки, жизни, время)
8. ErrorBoundary + страницы 404/500
9. README с инструкциями
10. .nvmrc для Node версии

**Результат**: Приложение запускается, можно переключаться между страницами, игра работает локально

---

## Sprint 2: Redux, Offline, Web API

**Цель**: Интеграция Redux, Service Worker, базовые Web API

### Задачи:
1. Redux Store + RTK или классический Redux
2. Slices: auth, user, game, ui
3. Reselect селекторы
4. Redux Thunk (или Saga) для async операций
5. Service Worker + Cache API (offline режим)
6. API клиент (Axios/fetch) + типы
7. Интеграция auth API (login/register)
8. Custom Hook: `useAuth` или `useLocalStorage`
9. HOC: `withAuth` для защищенных роутов
10. Web API #1: LocalStorage (тема, настройки)
11. Web API #2: Page Visibility (пауза игры)
12. Тесты: базовые компоненты (Vitest + RTL)
13. Улучшение UI игры

**Результат**: Redux работает, offline режим активен, 2 Web API интегрированы

---

## Sprint 3: SSR, OAuth, Leaderboard

**Цель**: SSR, OAuth авторизация, лидерборд с API

### Задачи:
1. SSR настройка (Vite SSR или Webpack SSR)
2. Redux SSR (гидратация состояния)
3. React Router SSR
4. OAuth интеграция (Google/GitHub)
5. Leaderboard API (бэкенд)
6. Leaderboard страница с сортировкой (собственный алгоритм)
7. Web API #3: Web Audio (звуки игры)
8. Web API #4: Notifications или Gamepad
9. Сравнение производительности SSR vs CSR
10. Документация результатов в README

**Результат**: SSR работает, OAuth доступен, лидерборд подключен к БД

---

## Sprint 4: Темизация и Форум

**Цель**: Полная темизация, форум с API

### Задачи:
1. Темизация: 2 темы (light/dark) + переключатель
2. CSS Variables + ThemeProvider
3. Синхронизация темы с бэком (опционально)
4. Forum API (бэкенд): топики, комментарии, ответы
5. Forum страница: список топиков
6. Forum топик: комментарии + ответы + Emoji
7. Создание топика (форма)
8. Queue структура данных (события игры)
9. Stack структура данных (undo состояний)

**Результат**: Темизация работает, форум полностью функционален

---

## Sprint 5: Безопасность, финализация

**Цель**: Защита, проверка всех требований, оптимизация

### Задачи:
1. CSP заголовки (Content Security Policy)
2. XSS защита (санитизация ввода)
3. DoS защита (rate limiting)
4. Проверка 4+ Web API (документация использования)
5. Оптимизация: code splitting, lazy loading
6. Lighthouse проверка (>50% по метрикам)
7. PWA манифест
8. Финальная сборка и чанки
9. Чеклист соответствия ТЗ
10. Документация API

**Результат**: Приложение готово к деплою, все требования выполнены

---

## Чеклист соответствия ТЗ

### Технологии фронта:
- [ ] React + TypeScript
- [ ] React Router
- [ ] Redux + Reselect
- [ ] Redux Thunk или Saga
- [ ] Canvas API
- [ ] Service Worker + Cache API
- [ ] 4+ Web API (LocalStorage, Page Visibility, Web Audio, Gamepad/Vibration/Notifications/Clipboard)
- [ ] Тесты (Vitest + RTL)
- [ ] ESLint + Prettier

### Технологии бэка:
- [ ] Node.js >= 12
- [ ] Express
- [ ] Sequelize + PostgreSQL
- [ ] JWT auth
- [ ] OAuth (спринт 3)

### Функциональность:
- [ ] Авторизация/регистрация
- [ ] Профиль + аватар
- [ ] Игра Canvas 2D
- [ ] Лидерборд
- [ ] Форум
- [ ] Темизация (2 темы)
- [ ] PWA/offline
- [ ] Страницы 404/500
- [ ] ErrorBoundary

### Алгоритмы:
- [ ] Собственный метод сортировки
- [ ] Queue структура данных
- [ ] Stack структура данных

### Безопасность:
- [ ] XSS защита
- [ ] DoS защита
- [ ] CSP

### Качество:
- [ ] TypeScript >= 95%
- [ ] Lighthouse > 50%
- [ ] SSR (спринт 3)
