# Настройка и запуск (Setup Guide)

## Требования

- Node.js >= 16
- Yarn 1.22.x
- Docker (опционально, для production)

## Установка

```bash
yarn bootstrap
```

## Запуск

```bash
# Backend
yarn dev --scope=server

# Frontend
yarn dev --scope=client
```

- Frontend: http://localhost:3000  
- Backend API: http://localhost:3001

## Зависимости

Добавление пакетов через Lerna см. в [README](../README.md#как-добавить-зависимости).

## Production (Docker)

Перед первым запуском: `node init.js`. Затем: `docker compose up --build`. Подробнее в [README](../README.md#окружение-в-docker).

Проверка:

```bash
docker compose ps
docker compose logs server --tail 50
```
