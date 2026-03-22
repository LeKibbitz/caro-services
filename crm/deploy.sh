#!/bin/bash
# Deploy CRM to Caroline's VPS
# Usage: ./deploy.sh

set -e

VPS="caro-root"
VPS_PATH="/home/caroline/crm"

echo "📦 Building..."
npm run build

echo "📤 Syncing to VPS..."
rsync -avz --delete \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=.env \
  ./ ${VPS}:${VPS_PATH}/

echo "🐳 Building & starting containers on VPS..."
ssh ${VPS} "cd ${VPS_PATH} && docker compose up -d --build"

echo "🔄 Running migrations..."
ssh ${VPS} "cd ${VPS_PATH} && docker compose exec caro-crm npx prisma db push"

echo "✅ Deploy terminé ! https://crm.caroline-finance.com"
