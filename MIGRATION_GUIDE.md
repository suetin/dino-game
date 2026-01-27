# Руководство по интеграции подготовленного кода

## Текущая ситуация

Подготовленный код находится в структуре:
- `frontend/` - React приложение
- `backend/` - Express сервер

Целевая структура GitHub репозитория:
- `packages/client/` - React приложение
- `packages/server/` - Express сервер

## Шаги интеграции

### 1. Клонирование репозитория

```bash
git clone https://github.com/suetin/dino-game.git
cd dino-game
```

### 2. Установка зависимостей стартового скелета

```bash
yarn bootstrap
```

### 3. Перемещение кода

#### Frontend → packages/client

```bash
# Скопировать содержимое frontend/ в packages/client/
cp -r frontend/* packages/client/
# Или на Windows:
xcopy frontend packages\client /E /I
```

#### Backend → packages/server

```bash
# Скопировать содержимое backend/ в packages/server/
cp -r backend/* packages/server/
# Или на Windows:
xcopy backend packages\server /E /I
```

### 4. Проверка зависимостей

Убедитесь, что `packages/client/package.json` и `packages/server/package.json` содержат все необходимые зависимости из подготовленного кода.

### 5. Обновление путей импорта

Если в коде есть абсолютные пути относительно `frontend/` или `backend/`, их нужно обновить:

- `@/` → должен указывать на `packages/client/src/` (проверить в `tsconfig.json`)
- Пути в `vite.config.ts` должны быть корректными

### 6. Проверка работы

```bash
# Установка зависимостей после перемещения
yarn bootstrap

# Запуск клиента
yarn dev --scope=client

# Запуск сервера (в другом терминале)
yarn dev --scope=server
```

### 7. Обновление документации

Документация уже адаптирована под структуру `packages/client` и `packages/server`.

## Важные замечания

1. **НЕ удаляйте** существующие файлы из стартового скелета:
   - `Dockerfile.client`
   - `Dockerfile.server`
   - `lerna.json`
   - `.github/` (если есть CI)

2. **Сохраните** существующие команды в корневом `package.json`:
   - `yarn bootstrap`
   - `yarn dev --scope=client`
   - `yarn dev --scope=server`

3. **Проверьте** `docker-compose.yml` - он должен работать с новой структурой

4. **Обновите** `.gitignore` если нужно

## После интеграции

После успешного перемещения кода:

1. Удалите старые папки `frontend/` и `backend/` (если они больше не нужны)
2. Проверьте сборку: `yarn build`
3. Проверьте линтинг: `yarn lint`
4. Проверьте Docker: `docker compose up`

## Проблемы и решения

### Проблема: Пути импорта не работают

**Решение:** Обновите `tsconfig.json` в `packages/client`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

### Проблема: Vite не находит файлы

**Решение:** Проверьте `vite.config.ts` в `packages/client`:
```typescript
resolve: {
  alias: {
    '@': path.resolve(__dirname, './src'),
  },
}
```

### Проблема: Lerna не видит пакеты

**Решение:** Проверьте `lerna.json`:
```json
{
  "packages": ["packages/*"],
  "version": "independent"
}
```
