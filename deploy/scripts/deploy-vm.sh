#!/usr/bin/env bash

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:?PROJECT_DIR is required}"
DEPLOY_BRANCH="${DEPLOY_BRANCH:-main}"
ENV_FILE="${ENV_FILE:-.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"

if ! command -v docker >/dev/null 2>&1; then
  echo 'docker is not installed'
  exit 1
fi

cd "$PROJECT_DIR"

if [[ ! -d .git ]]; then
  echo "Git repository not found in $PROJECT_DIR"
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Environment file $ENV_FILE not found"
  exit 1
fi

current_branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$current_branch" != "$DEPLOY_BRANCH" ]]; then
  echo "Current branch is $current_branch, expected $DEPLOY_BRANCH"
  echo 'Switch the server repository to the target branch manually before enabling auto-deploy.'
  exit 1
fi

mkdir -p tmp/pgdata

git fetch origin "$DEPLOY_BRANCH"
git pull --ff-only origin "$DEPLOY_BRANCH"

docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" config >/dev/null
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" up -d --build --remove-orphans
docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" ps
