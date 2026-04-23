# Deploy на Ubuntu VM

## Что деплоится

В проекте два Node-процесса и PostgreSQL:

- `client` — SSR-сервер React/Vite на `127.0.0.1:3000`;
- `server` — API на `127.0.0.1:3001`;
- `db` — PostgreSQL в docker-сети compose.

Снаружи публикуется только `nginx` на хосте. Он проксирует:

- `/api/` -> `server`;
- всё остальное -> `client`.

Так сохраняется текущая SSR-архитектура, а API не открывается напрямую наружу.

## Почему без PM2

Для этого репозитория достаточно `docker compose`:

- контейнеры уже описаны в проекте;
- у сервисов есть `restart: unless-stopped`;
- не требуется второй менеджер процессов поверх Docker.

## 1. Подготовка сервера

```bash
sudo apt-get update
sudo apt-get install -y git docker.io docker-compose-plugin nginx
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

После добавления пользователя в группу `docker` переподключитесь по SSH.

## 2. Подготовка проекта

```bash
sudo mkdir -p /opt
sudo chown "$USER":"$USER" /opt
git clone -b main https://github.com/suetin/dino-game.git /opt/dino-game
cd /opt/dino-game
cp .env.production.example .env.production
```

Заполните `.env.production`:

```dotenv
CLIENT_PORT=3000
SERVER_PORT=3001
DB_NAME=dino
DB_USER=dino
DB_PASSWORD=strong-password
EXTERNAL_SERVER_URL=http://example.com
AUTH_CORS_ORIGIN_ALLOWLIST=http://example.com
INTERNAL_SERVER_URL=http://server:3001
```

`EXTERNAL_SERVER_URL` попадает в клиентский production-бандл. Если позже включаете HTTPS, измените его на `https://ваш-домен` и выполните повторный деплой клиента.

## 3. Первый запуск приложения

```bash
cd /opt/dino-game
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
docker compose --env-file .env.production -f docker-compose.prod.yml ps
```

Проверки:

```bash
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:3001
docker compose --env-file .env.production -f docker-compose.prod.yml logs server --tail 50
```

Ожидаемо:

- `client` отвечает на `127.0.0.1:3000`;
- `server` отвечает на `127.0.0.1:3001`;
- в логах `server` есть успешное подключение к PostgreSQL.

## 4. Настройка nginx

Скопируйте конфиг и замените `example.com` на реальный домен:

```bash
sudo cp deploy/nginx/dino-game.conf /etc/nginx/sites-available/dino-game
sudo ln -s /etc/nginx/sites-available/dino-game /etc/nginx/sites-enabled/dino-game
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

После этого проверьте:

```bash
curl -I http://ваш-домен
curl -I http://ваш-домен/api/forum/topics
```

Для `http://ваш-домен/api/forum/topics` без авторизационных заголовков нормален ответ `401`. Важно, чтобы запрос доходил до API и не возвращал `502/504`.

Если домена пока нет, можно временно проверить через внешний IP VM, но перед выпуском сертификата и финальным деплоем лучше перейти на доменное имя.

## 5. HTTPS и HTTP/2

Установите certbot:

```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

После того как домен уже указывает на VM:

1. Выпустите сертификат через certbot.
2. Замените конфиг nginx на `deploy/nginx/dino-game-ssl.conf.example`, подставив реальный домен и пути к сертификатам.
3. Выполните `sudo nginx -t && sudo systemctl reload nginx`.
4. Обновите `.env.production`: `EXTERNAL_SERVER_URL=https://ваш-домен`.
5. Выполните повторный деплой, чтобы клиент пересобрался с HTTPS URL.

## 6. GitHub Actions автодеплой

В репозитории добавлен workflow `.github/workflows/deploy.yml`.

Нужные GitHub Secrets:

- `DEPLOY_HOST` — IP или домен VM;
- `DEPLOY_PORT` — SSH-порт, обычно `22`;
- `DEPLOY_USER` — SSH-пользователь;
- `DEPLOY_PATH` — путь к проекту на сервере, например `/opt/dino-game`;
- `DEPLOY_SSH_KEY` — приватный ключ для доступа к VM;
- `DEPLOY_KNOWN_HOSTS` — вывод `ssh-keyscan -H <host>`.

Как получить `DEPLOY_KNOWN_HOSTS`:

```bash
ssh-keyscan -H example.com
```

Поведение workflow:

- автоматически деплоит `main` при `push` в `main`;
- позволяет вручную запустить `workflow_dispatch` и передать `ref`.

Скрипт деплоя на сервере:

- проверяет наличие `.env.production`;
- проверяет, что серверный репозиторий уже находится на нужной ветке;
- выполняет только `git pull --ff-only origin <branch>`;
- поднимает `db` и `server`, затем выполняет миграции `yarn db:migrate` в контейнере `server`;
- после миграций поднимает `client` через `docker compose up -d --build --remove-orphans`.

Если хотите деплоить не `main`, сначала один раз вручную переключите серверный репозиторий на нужную ветку.

## 7. Ручной деплой без GitHub Actions

```bash
cd /opt/dino-game
PROJECT_DIR=/opt/dino-game DEPLOY_BRANCH=main bash deploy/scripts/deploy-vm.sh
```

## 8. Что проверить после деплоя

```bash
cd /opt/dino-game
docker compose --env-file .env.production -f docker-compose.prod.yml ps
docker compose --env-file .env.production -f docker-compose.prod.yml logs client --tail 50
docker compose --env-file .env.production -f docker-compose.prod.yml logs server --tail 50
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:3001
curl -I http://ваш-домен
```

Если после включения HTTPS форум-запросы в браузере продолжают ходить на `http://`, значит не был пересобран `client` после смены `EXTERNAL_SERVER_URL`.
