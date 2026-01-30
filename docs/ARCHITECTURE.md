# Архитектура проекта Dino Game

## Обзор

Monorepo: клиент (React + TypeScript) и сервер (Node.js + Express) в пакетах `packages/client` и `packages/server`.

## Структура

- **packages/client** — SPA на Vite, Redux, React Router, Canvas для игры.
- **packages/server** — REST API на Express, PostgreSQL, Sequelize.

Подробная структура репозитория описана в [README](../README.md#структура-репозитория).

## Документация

- [SETUP_GUIDE.md](SETUP_GUIDE.md) — настройка и запуск
- [MIGRATION_GUIDE.md](MIGRATION_GUIDE.md) — перенос и интеграция
- [SPRINT_PLAN.md](SPRINT_PLAN.md) — план работ
- [TEAM_GUIDE.md](TEAM_GUIDE.md) — правила командной работы
