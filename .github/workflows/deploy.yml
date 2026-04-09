name: Deploy

on:
  push:
    branches:
      - dev
      - main
  workflow_dispatch:
    inputs:
      ref:
        description: Branch to deploy
        required: false
        default: dev

concurrency:
  group: production-deploy
  cancel-in-progress: false

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
    env:
      DEPLOY_REF: ${{ github.event.inputs.ref || github.ref_name }}

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Configure SSH access
        run: |
          mkdir -p ~/.ssh
          printf '%s\n' "${{ secrets.DEPLOY_SSH_KEY }}" > ~/.ssh/id_ed25519
          chmod 600 ~/.ssh/id_ed25519
          printf '%s\n' "${{ secrets.DEPLOY_KNOWN_HOSTS }}" >> ~/.ssh/known_hosts
          chmod 600 ~/.ssh/known_hosts

      - name: Normalize deploy script line endings
        run: |
          sed -i 's/\r$//' deploy/scripts/deploy-vm.sh
          chmod +x deploy/scripts/deploy-vm.sh

      - name: Run deploy script on server
        env:
          DEPLOY_HOST: ${{ secrets.DEPLOY_HOST }}
          DEPLOY_PORT: ${{ secrets.DEPLOY_PORT }}
          DEPLOY_USER: ${{ secrets.DEPLOY_USER }}
          DEPLOY_PATH: ${{ secrets.DEPLOY_PATH }}
        run: |
          port="${DEPLOY_PORT:-22}"
          ssh \
            -i ~/.ssh/id_ed25519 \
            -o IdentitiesOnly=yes \
            -p "$port" \
            "${DEPLOY_USER}@${DEPLOY_HOST}" \
            "PROJECT_DIR='${DEPLOY_PATH}' DEPLOY_BRANCH='${DEPLOY_REF}' bash -s" < deploy/scripts/deploy-vm.sh